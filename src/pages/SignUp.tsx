import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { account, databases, DATABASE_ID, COLLECTIONS, ID } from "@/integrations/appwrite/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Eye, EyeOff, GraduationCap, BookOpen, ArrowLeft } from "lucide-react";
import { useTranslation } from 'react-i18next';
import { LanguageSelector } from "@/components/LanguageSelector";

const SignUp = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [selectedRole, setSelectedRole] = useState<"student" | "teacher" | null>(null);
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    useEffect(() => {
        const roleFromUrl = searchParams.get("role");
        if (roleFromUrl === "student" || roleFromUrl === "teacher") {
            setSelectedRole(roleFromUrl);
        }
    }, [searchParams]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const validateForm = () => {
        if (!formData.fullName.trim()) {
            toast.error(t('signup.enterFullName') || "Please enter your full name");
            return false;
        }
        if (!formData.email.trim()) {
            toast.error(t('signup.enterEmail') || "Please enter your email");
            return false;
        }
        if (!formData.password) {
            toast.error(t('signup.enterPassword') || "Please enter a password");
            return false;
        }
        if (formData.password.length < 8) {
            toast.error(t('signup.passwordMinLength') || "Password must be at least 8 characters");
            return false;
        }
        if (formData.password !== formData.confirmPassword) {
            toast.error(t('signup.passwordsDoNotMatch') || "Passwords do not match");
            return false;
        }
        if (!selectedRole) {
            toast.error(t('signup.selectRole') || "Please select a role");
            return false;
        }
        return true;
    };

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);

        try {
            console.log("Starting signup process...");
            console.log("Email:", formData.email);
            console.log("Role:", selectedRole);

            // First, check if user already exists by trying to create session
            try {
                // Try to delete any existing session first
                await account.deleteSession('current');
            } catch (e) {
                // No session exists, that's fine
            }

            // Create user account in Appwrite
            console.log("Creating Appwrite account...");
            const user = await account.create(
                ID.unique(),
                formData.email,
                formData.password,
                formData.fullName
            );
            console.log("Account created:", user.$id);

            // Create session (log in the user)
            console.log("Creating session...");
            await account.createEmailPasswordSession(formData.email, formData.password);
            console.log("Session created successfully");

            // Create profile in database
            console.log("Creating profile document...");
            const profileData = {
                full_name: formData.fullName,
                email: formData.email,
                role: selectedRole,
                onboarding_completed: false,
                teacher_approved: selectedRole === "student",
            };
            console.log("Profile data:", profileData);

            await databases.createDocument(
                DATABASE_ID,
                COLLECTIONS.profiles,
                user.$id,
                profileData
            );
            console.log("Profile created successfully");

            toast.success(t('signup.accountCreated') || "Account created successfully!");

            if (selectedRole === "teacher") {
                navigate("/teacher/onboarding");
            } else {
                navigate("/onboarding");
            }
        } catch (error: any) {
            console.error("Signup error:", error);
            console.error("Error code:", error.code);
            console.error("Error message:", error.message);
            console.error("Error type:", error.type);

            if (error.code === 409 || error.message?.includes("already exists")) {
                toast.error(t('signup.emailAlreadyExists') || "An account with this email already exists");
            } else if (error.code === 401) {
                toast.error("Authentication error. Please try again.");
            } else if (error.message?.includes("Creation of a session is prohibited")) {
                toast.error("You already have an active session. Please sign out first.");
            } else {
                toast.error(error.message || t('signup.signupFailed') || "Failed to create account");
            }
        } finally {
            setLoading(false);
        }
    };

    // Role selection screen
    if (!selectedRole) {
        return (
            <div className="min-h-screen flex">
                {/* Left Side - Role Selection */}
                <div className="flex-1 flex items-center justify-center p-8 bg-white">
                    <div className="w-full max-w-md space-y-6">
                        {/* Logo */}
                        <div className="flex items-center gap-2">
                            <img
                                src="/images/dataplus_logggg-removebg-preview.png"
                                alt="DataPlus Logo"
                                className="w-10 h-10 object-contain"
                            />
                        </div>

                        {/* Language Selector */}
                        <div className="flex justify-end">
                            <LanguageSelector />
                        </div>

                        {/* Header */}
                        <div className="space-y-1">
                            <h1 className="text-3xl font-bold text-black leading-tight">
                                {t('signup.joinUs') || "Join Our Platform"}
                            </h1>
                            <p className="text-gray-500 text-sm">
                                {t('signup.selectRoleDescription') || "Choose how you want to use the platform"}
                            </p>
                        </div>

                        {/* Role Cards */}
                        <div className="space-y-4">
                            {/* Student Option */}
                            <button
                                onClick={() => setSelectedRole("student")}
                                className="w-full p-5 border-2 border-gray-200 rounded-xl hover:border-[#006d2c] hover:bg-gray-50 transition-all duration-300 text-left group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <GraduationCap className="h-7 w-7 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg text-gray-900">
                                            {t('signup.student') || "Student"}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            {t('signup.studentDescription') || "Learn new skills and grow your career"}
                                        </p>
                                    </div>
                                </div>
                            </button>

                            {/* Teacher Option */}
                            <button
                                onClick={() => setSelectedRole("teacher")}
                                className="w-full p-5 border-2 border-gray-200 rounded-xl hover:border-[#006d2c] hover:bg-gray-50 transition-all duration-300 text-left group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <BookOpen className="h-7 w-7 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg text-gray-900">
                                            {t('signup.teacher') || "Teacher"}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            {t('signup.teacherDescription') || "Share your knowledge and inspire students"}
                                        </p>
                                    </div>
                                </div>
                            </button>
                        </div>

                        {/* Footer */}
                        <div className="text-center pt-4">
                            <p className="text-sm text-gray-500">
                                {t('signup.alreadyHaveAccount') || "Already have an account?"}{" "}
                                <button
                                    onClick={() => navigate("/auth")}
                                    className="text-black font-bold hover:underline"
                                >
                                    {t('login.signIn') || "Sign In"}
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
                        <h3 className="text-2xl font-bold mb-2">{t('login.joinCommunity') || "Join our community"}</h3>
                        <p className="text-lg opacity-90">{t('login.connectWorldwide') || "Connect with learners worldwide"}</p>
                    </div>
                </div>
            </div>
        );
    }

    // Sign up form
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

                    {/* Back Button & Language Selector */}
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => setSelectedRole(null)}
                            className="flex items-center gap-1 text-sm text-gray-600 hover:text-black transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            {t('signup.changeRole') || "Change role"}
                        </button>
                        <LanguageSelector />
                    </div>

                    {/* Header */}
                    <div className="space-y-1">
                        <div className="flex items-center gap-3 mb-2">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${selectedRole === "student"
                                ? "bg-gradient-to-br from-blue-500 to-purple-600"
                                : "bg-gradient-to-br from-emerald-500 to-teal-600"
                                }`}>
                                {selectedRole === "student" ? (
                                    <GraduationCap className="h-5 w-5 text-white" />
                                ) : (
                                    <BookOpen className="h-5 w-5 text-white" />
                                )}
                            </div>
                            <span className="text-sm font-medium text-gray-600 capitalize">{selectedRole}</span>
                        </div>
                        <h1 className="text-3xl font-bold text-black leading-tight">
                            {t('signup.createAccount') || "Create your account"}
                        </h1>
                        <p className="text-gray-500 text-sm">
                            {t('signup.fillDetails') || "Fill in your details to get started"}
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSignUp} className="space-y-3">
                        <div className="space-y-1">
                            <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                                {t('signup.fullName') || "Full Name"}*
                            </Label>
                            <Input
                                id="fullName"
                                name="fullName"
                                type="text"
                                placeholder={t('signup.fullNamePlaceholder') || "Enter your full name"}
                                value={formData.fullName}
                                onChange={handleInputChange}
                                required
                                className="h-11 px-4 border-gray-300 rounded-lg focus:border-black focus:ring-black"
                            />
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                                {t('auth.email') || "Email"}*
                            </Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder={t('auth.emailPlaceholder') || "Enter your email"}
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                                className="h-11 px-4 border-gray-300 rounded-lg focus:border-black focus:ring-black"
                            />
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                                {t('auth.password') || "Password"}*
                            </Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder={t('auth.passwordPlaceholder') || "Create a password"}
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    required
                                    minLength={8}
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

                        <div className="space-y-1">
                            <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                                {t('signup.confirmPassword') || "Confirm Password"}*
                            </Label>
                            <div className="relative">
                                <Input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder={t('signup.confirmPasswordPlaceholder') || "Confirm your password"}
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    required
                                    minLength={8}
                                    className="h-11 px-4 pr-12 border-gray-300 rounded-lg focus:border-black focus:ring-black"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-11 bg-black hover:bg-[#006d2c] text-white font-medium rounded-lg transition-colors duration-300"
                        >
                            {loading ? `${t('common.loading') || "Loading"}...` : t('signup.createAccount') || "Create Account"}
                        </Button>
                    </form>

                    {/* Footer */}
                    <div className="text-center">
                        <p className="text-sm text-gray-500">
                            {t('signup.alreadyHaveAccount') || "Already have an account?"}{" "}
                            <button
                                onClick={() => navigate("/auth")}
                                className="text-black font-bold hover:underline"
                            >
                                {t('login.signIn') || "Sign In"}
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
                    <h3 className="text-2xl font-bold mb-2">{t('login.joinCommunity') || "Join our community"}</h3>
                    <p className="text-lg opacity-90">{t('login.connectWorldwide') || "Connect with learners worldwide"}</p>
                </div>
            </div>
        </div>
    );
};

export default SignUp;
