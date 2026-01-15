import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { account, databases, DATABASE_ID, COLLECTIONS, ID } from "@/integrations/appwrite/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { useTranslation } from 'react-i18next';
import { LanguageSelector } from "@/components/LanguageSelector";

const Auth = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      // Sign in with Appwrite
      await account.createEmailPasswordSession(email, password);

      // Get user account
      const user = await account.get();

      // Fetch profile
      try {
        const profile = await databases.getDocument(
          DATABASE_ID,
          COLLECTIONS.profiles,
          user.$id
        );

        // Check if onboarding is completed
        if (!profile.onboarding_completed) {
          toast.info("Please complete your profile setup");
          navigate(profile.role === "teacher" ? "/teacher/onboarding" : "/onboarding");
          return;
        }

        toast.success(t('login.signedInSuccess'));
        navigate(profile.role === "teacher" ? "/teacher/dashboard" : "/student/dashboard");
      } catch (profileError: any) {
        console.error("Profile fetch error:", profileError);
        toast.error(t('login.errorLoadingProfile'));
      }
    } catch (error: any) {
      console.error("Signin error:", error);
      if (error.message?.includes("Invalid credentials") || error.code === 401) {
        toast.error(t('login.invalidCredentials'));
      } else {
        toast.error(error.message || "An error occurred during sign in");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <img
              src="/images/dataplus_logggg-removebg-preview.png"
              alt="DataPlus Logo"
              className="w-10 h-10 object-contain"
            />
          </div>

          {/* Language Selector */}
          <div className="flex justify-end mb-2">
            <LanguageSelector />
          </div>

          {/* Header */}
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-black leading-tight">
              {t('login.masterSkills')}
            </h1>
            <p className="text-gray-500 text-sm">{t('login.signInToStart')}</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSignIn} className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                {t('auth.email')}*
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder={t('auth.email')}
                required
                className="h-11 px-4 border-gray-300 rounded-lg focus:border-black focus:ring-black"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                {t('auth.password')}*
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={t('auth.password')}
                  required
                  minLength={6}
                  className="h-11 px-4 pr-12 border-gray-300 rounded-lg focus:border-black focus:ring-black"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-black hover:bg-[#006d2c] text-white font-medium rounded-lg transition-colors duration-300"
            >
              {loading ? `${t('auth.signIn')}...` : t('auth.signIn')}
            </Button>
          </form>

          {/* Footer */}
          <div className="text-center">
            <p className="text-sm text-gray-500">
              {t('auth.dontHaveAccount')}{" "}
              <button
                onClick={() => navigate("/signup")}
                className="text-black font-bold hover:underline"
              >
                {t('auth.signUp')}
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Image */}
      <div className="hidden lg:flex flex-1 relative">
        <img
          src="/images/mainpagepicture.jpg"
          alt="Students learning together"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        <div className="absolute bottom-8 left-8 text-white z-10">
          <h3 className="text-2xl font-bold mb-2">{t('login.joinCommunity')}</h3>
          <p className="text-lg opacity-90">{t('login.connectWorldwide')}</p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
