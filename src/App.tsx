import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import './i18n/config';
import { SuspensionDialog } from "@/components/SuspensionDialog";
import Index from "./pages/Index";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Auth from "./pages/Auth";
import SignUp from "./pages/SignUp";
import VerifyEmail from "./pages/VerifyEmail";
import StudentDashboard from "./pages/StudentDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import TeacherSchedule from "./pages/TeacherSchedule";
import CourseDetail from "./pages/CourseDetail";
import CreateCourse from "./pages/CreateCourse";
import Exhibition from "./pages/Exhibition";
import StudentOnboarding from "./pages/StudentOnboarding";
import TeacherOnboarding from "./pages/TeacherOnboarding";
import StudentSchedule from "./pages/StudentSchedule";
import BrowseCourses from "./pages/BrowseCourses";
import MyCourses from "./pages/MyCourses";
import StudentSettings from "./pages/StudentSettings";
import StudentAssignments from "./pages/StudentAssignments";
import StudentScores from "./pages/StudentScores";
import TeacherSettings from "./pages/TeacherSettings";
import TeacherAnnouncements from "./pages/TeacherAnnouncements";
import TeacherAssignments from "./pages/TeacherAssignments";
import TeacherGrades from "./pages/TeacherGrades";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TeacherStudents from "./pages/TeacherStudents";
import NotFound from "./pages/NotFound";
import AuthCallback from "./components/AuthCallback";
import TeacherPendingApproval from "./pages/TeacherPendingApproval";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SuspensionDialog />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/schedule" element={<StudentSchedule />} />
          <Route path="/student/my-courses" element={<MyCourses />} />
          <Route path="/student/assignments" element={<StudentAssignments />} />
          <Route path="/student/scores" element={<StudentScores />} />
          <Route path="/student/settings" element={<StudentSettings />} />
          <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
          <Route path="/teacher/schedule" element={<TeacherSchedule />} />
          <Route path="/teacher/students" element={<TeacherStudents />} />
          <Route path="/teacher/assignments" element={<TeacherAssignments />} />
          <Route path="/teacher/grades" element={<TeacherGrades />} />
          <Route path="/teacher/settings" element={<TeacherSettings />} />
          <Route path="/teacher/announcements" element={<TeacherAnnouncements />} />
          <Route path="/course/:id" element={<CourseDetail />} />
          <Route path="/create-course" element={<CreateCourse />} />
          <Route path="/courses" element={<BrowseCourses />} />
          <Route path="/exhibition" element={<Exhibition />} />
          <Route path="/onboarding" element={<StudentOnboarding />} />
          <Route path="/student/onboarding" element={<StudentOnboarding />} />
          <Route path="/teacher/onboarding" element={<TeacherOnboarding />} />
          <Route path="/teacher/pending-approval" element={<TeacherPendingApproval />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
