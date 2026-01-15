import { useEffect, useRef, useCallback } from 'react';
import { account, databases, DATABASE_ID, COLLECTIONS } from '@/integrations/appwrite/client';

/**
 * Hook to track user activity and update last_activity in the database
 * This enables accurate "online users" counting
 * OPTIMIZED: Reduced frequency and removed expensive event listeners
 */
export const useActivityTracker = () => {
  const lastUpdateRef = useRef<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const updateActivity = useCallback(async () => {
    // Throttle: Only update if 60 seconds have passed since last update
    const now = Date.now();
    if (now - lastUpdateRef.current < 60000) return;

    try {
      const user = await account.get();
      if (user) {
        lastUpdateRef.current = now;
        // Update last_activity in profile
        await databases.updateDocument(
          DATABASE_ID,
          COLLECTIONS.profiles,
          user.$id,
          { last_activity: new Date().toISOString() }
        );
      }
    } catch (error) {
      // Silently fail - don't disrupt user experience
      console.debug('Activity update failed:', error);
    }
  }, []);

  useEffect(() => {
    // Update activity on mount (with small delay to not block initial render)
    const initialTimeout = setTimeout(updateActivity, 1000);

    // Update activity every 3 minutes
    intervalRef.current = setInterval(updateActivity, 3 * 60 * 1000);

    // Only listen to click events
    const handleClick = () => updateActivity();
    window.addEventListener('click', handleClick, { passive: true });

    // Update on visibility change (when user returns to tab)
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        updateActivity();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearTimeout(initialTimeout);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      window.removeEventListener('click', handleClick);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [updateActivity]);
};
