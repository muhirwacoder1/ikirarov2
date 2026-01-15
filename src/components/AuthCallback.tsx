import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { account, databases, DATABASE_ID, COLLECTIONS } from "@/integrations/appwrite/client";
import { toast } from "sonner";

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log("Processing auth callback...");

        // Get current session
        const user = await account.get();

        if (!user) {
          console.log("No session found, redirecting to auth");
          navigate("/auth");
          return;
        }

        await processUser(user);

      } catch (error: any) {
        console.error("Auth callback error:", error);
        toast.error("Authentication failed. Please try again.");
        navigate("/auth");
      } finally {
        setIsProcessing(false);
      }
    };

    const processUser = async (user: any) => {
      try {
        console.log("Processing user:", user.$id);

        // Check if profile exists
        let existingProfile = null;
        try {
          existingProfile = await databases.getDocument(
            DATABASE_ID,
            COLLECTIONS.profiles,
            user.$id
          );
        } catch (error: any) {
          // Profile doesn't exist
          console.log("Profile not found, will create one");
        }

        if (!existingProfile) {
          console.log("Creating new profile for user");

          // Get role from URL params or default to student
          const role = searchParams.get("role") || "student";
          console.log("Selected role:", role);

          // Create profile for new user
          await databases.createDocument(
            DATABASE_ID,
            COLLECTIONS.profiles,
            user.$id,
            {
              email: user.email,
              full_name: user.name || "",
              role: role as "student" | "teacher",
              onboarding_completed: false,
            }
          );

          console.log("Profile created successfully with role:", role);

          toast.success("Account setup complete! Please complete your profile.");
          navigate(role === "teacher" ? "/teacher/onboarding" : "/onboarding");
        } else {
          console.log("Existing user found with role:", existingProfile.role);

          // Check if onboarding is completed
          if (!existingProfile.onboarding_completed) {
            console.log("Onboarding not completed, redirecting to onboarding");
            toast.info("Please complete your profile setup");
            navigate(existingProfile.role === "teacher" ? "/teacher/onboarding" : "/onboarding");
          } else {
            // Existing user with completed onboarding, redirect to dashboard
            toast.success("Signed in successfully!");
            navigate(existingProfile.role === "teacher" ? "/teacher/dashboard" : "/student/dashboard");
          }
        }
      } catch (error: any) {
        console.error("Error processing user:", error);
        toast.error("Error processing authentication. Please try again.");
        navigate("/auth");
      }
    };

    // Add a small delay to ensure the URL is fully loaded
    const timer = setTimeout(handleAuthCallback, 500);

    return () => clearTimeout(timer);
  }, [navigate, searchParams]);

  if (!isProcessing) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 text-lg">Completing authentication...</p>
        <p className="text-gray-400 text-sm mt-2">Please wait while we set up your account</p>
      </div>
    </div>
  );
};

export default AuthCallback;