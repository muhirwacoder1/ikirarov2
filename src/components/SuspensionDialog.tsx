import { useEffect, useState } from "react";
import { account, databases, DATABASE_ID, COLLECTIONS } from "@/integrations/appwrite/client";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export const SuspensionDialog = () => {
  const [open, setOpen] = useState(false);
  const [suspensionReason, setSuspensionReason] = useState("");
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    checkSuspensionStatus();

    // Check suspension status every 30 seconds
    const interval = setInterval(() => {
      checkSuspensionStatus();
    }, 30000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const checkSuspensionStatus = async () => {
    if (checking) return;

    setChecking(true);
    try {
      const user = await account.get();
      if (!user) {
        setOpen(false);
        return;
      }

      const profile = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.profiles,
        user.$id
      );

      console.log("Suspension check:", {
        userId: user.$id,
        isSuspended: profile?.is_suspended,
        reason: profile?.suspension_reason
      });

      if (profile?.is_suspended) {
        setSuspensionReason(profile.suspension_reason || "No reason provided");
        setOpen(true);
      } else {
        setOpen(false);
      }
    } catch (error) {
      // User not logged in or profile doesn't exist
      setOpen(false);
    } finally {
      setChecking(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await account.deleteSession('current');
    } catch (error) {
      console.error("Error signing out:", error);
    }
    window.location.href = "/auth";
  };

  return (
    <AlertDialog open={open}>
      <AlertDialogContent className="max-w-md" onEscapeKeyDown={(e) => e.preventDefault()} onPointerDownOutside={(e) => e.preventDefault()}>
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <AlertDialogTitle className="text-xl">Account Suspended</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-base space-y-3">
            <p className="text-gray-700">
              Your account has been suspended by an administrator.
            </p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="font-semibold text-red-900 mb-1">Reason:</p>
              <p className="text-red-800">{suspensionReason}</p>
            </div>
            <p className="text-gray-600 text-sm">
              If you believe this is a mistake, please contact support.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button onClick={handleSignOut} className="w-full">
            Sign Out
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
