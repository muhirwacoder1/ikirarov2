import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { account, databases, DATABASE_ID, COLLECTIONS } from '@/integrations/appwrite/client';
import { toast } from 'sonner';

export const useAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      try {
        const session = await account.get();

        if (!mounted) return;

        if (session) {
          setUser(session);
          await fetchProfile(session.$id);
        }
      } catch (error) {
        // No active session
        if (mounted) {
          setUser(null);
          setProfile(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    checkSession();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  const fetchProfile = async (userId: string) => {
    try {
      const profileData = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.profiles,
        userId
      );

      setProfile(profileData);
    } catch (error) {
      console.error('Profile fetch error:', error);
    }
  };

  const signOut = async () => {
    try {
      await account.deleteSession('current');
      setUser(null);
      setProfile(null);
      toast.success('Signed out successfully');
      navigate('/auth');
    } catch (error: any) {
      toast.error('Error signing out');
    }
  };

  return {
    user,
    profile,
    loading,
    signOut,
  };
};