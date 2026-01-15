import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { account, databases, DATABASE_ID, COLLECTIONS, Query } from "@/integrations/appwrite/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, BookOpen, CalendarDays, Clock, ChevronLeft, ChevronRight, Award, Megaphone } from "lucide-react";
import { NotificationBell } from "@/components/NotificationBell";
import { toast } from "sonner";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { StudentSidebar } from "@/components/StudentSidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import LoadingSpinner from "@/components/LoadingSpinner";
import { GradesTable } from "@/components/GradesTable";
import { useTranslation } from 'react-i18next';
import { LanguageSelector } from "@/components/LanguageSelector";
import { CourseCard } from "@/components/CourseCard";
import { useActivityTracker } from "@/hooks/useActivityTracker";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  // Track user activity for online status
  useActivityTracker();
  const [scheduledClasses, setScheduledClasses] = useState<any[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [studentId, setStudentId] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [announcements, setAnnouncements] = useState<any[]>([]);

  const sliderImages = [
    "/images/Gemini_Generated_Image_lrwgaxlrwgaxlrwg.png",
    "/images/Gemini_Generated_Image_zg4uzxzg4uzxzg4u.png"
  ];

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (profile) {
      fetchEnrolledCourses();
      fetchAnnouncements();
    }
  }, [profile]);

  // Fetch scheduled classes after enrolled courses are loaded
  useEffect(() => {
    if (enrolledCourses.length > 0) {
      fetchScheduledClasses();
    }
  }, [enrolledCourses]);

  // Auto-slide effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [sliderImages.length]);

  const fetchEnrolledCourses = async () => {
    setCoursesLoading(true);
    try {
      const user = await account.get();
      if (!user) {
        setCoursesLoading(false);
        return;
      }

      const enrollments = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.enrollments,
        [Query.equal('student_id', user.$id)]
      );

      // Fetch course details for each enrollment
      const coursesWithDetails = await Promise.all(
        enrollments.documents.map(async (enrollment: any) => {
          try {
            const course = await databases.getDocument(
              DATABASE_ID,
              COLLECTIONS.courses,
              enrollment.course_id
            );
            // Fetch teacher profile
            let teacherProfile = null;
            try {
              teacherProfile = await databases.getDocument(
                DATABASE_ID,
                COLLECTIONS.profiles,
                course.teacher_id
              );
            } catch (e) {
              console.log("Could not fetch teacher profile");
            }
            return {
              ...enrollment,
              courses: {
                ...course,
                profiles: teacherProfile
              }
            };
          } catch (e) {
            return enrollment;
          }
        })
      );

      setEnrolledCourses(coursesWithDetails || []);
    } catch (error) {
      console.error("Error fetching enrolled courses:", error);
    }
    setCoursesLoading(false);
  };

  const fetchScheduledClasses = async () => {
    try {
      const user = await account.get();
      if (!user) return;

      if (enrolledCourses.length > 0) {
        const enrolledCourseIds = enrolledCourses.map(e => e.courses?.$id).filter(Boolean);

        const classes = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.schedules,
          [
            Query.equal('course_id', enrolledCourseIds),
            Query.greaterThan('start_time', new Date().toISOString()),
            Query.orderAsc('start_time'),
            Query.limit(5)
          ]
        );

        setScheduledClasses(classes.documents || []);
      }
    } catch (error) {
      console.error("Error fetching scheduled classes:", error);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const announcements = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.announcements,
        [
          Query.equal('is_global', true),
          Query.orderDesc('$createdAt'),
          Query.limit(5)
        ]
      );

      setAnnouncements(announcements.documents || []);
    } catch (err) {
      console.error("Error fetching announcements:", err);
    }
  };

  const checkUser = async () => {
    try {
      const user = await account.get();

      if (!user) {
        navigate("/auth");
        return;
      }

      setStudentId(user.$id);

      const profileData = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.profiles,
        user.$id
      );

      // Check if onboarding is completed
      if (!profileData.onboarding_completed) {
        toast.info("Please complete your profile setup");
        navigate("/onboarding", { replace: true });
        return;
      }

      if (profileData.role !== "student") {
        navigate("/teacher/dashboard", { replace: true });
        return;
      }

      setProfile(profileData);
    } catch (error: any) {
      console.error("Auth error:", error);
      navigate("/auth");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background gap-0 md:gap-4">
        <StudentSidebar />

        <div className="flex-1 flex flex-col py-2 px-2 md:py-4 md:pr-4 md:pl-0">
          <header className="border bg-card px-3 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl shadow-sm mb-3 sm:mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <SidebarTrigger />
                <div className="min-w-0 flex-1">
                  <h1 className="text-lg sm:text-2xl font-bold truncate leading-tight">
                    {t('dashboard.hello')}, {profile?.full_name?.split(' ').pop() || t('onboarding.student')} 👋
                  </h1>
                  <p className="text-xs text-muted-foreground hidden sm:block">{t('dashboard.welcomeBack')}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-3">
                <LanguageSelector />
                <div className="relative hidden md:block">
                  <input
                    type="text"
                    placeholder={t('common.search')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-3 pr-10 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#006D2C]/20 w-48"
                  />
                  <Search className="h-4 w-4 text-[#006D2C] absolute right-3 top-1/2 -translate-y-1/2" />
                </div>
                <NotificationBell />
                <Avatar className="h-8 w-8 sm:h-9 sm:w-9 border-2 border-[#006D2C]">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="User Avatar" className="object-cover" />
                  ) : (
                    <AvatarFallback className="bg-[#006D2C] text-white text-sm">
                      {profile?.full_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  )}
                </Avatar>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-auto">
            <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
              {/* Top Section - Banner and Calendar/Upcoming Classes Side by Side */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                {/* Banner Slider - Takes 2 columns */}
                <div className="lg:col-span-2">
                  <div className="relative overflow-hidden rounded-xl sm:rounded-2xl min-h-[200px] sm:min-h-[280px] shadow-lg bg-gray-900">
                    {/* Background Image Slider */}
                    {sliderImages.map((image, index) => (
                      <div
                        key={index}
                        className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
                        style={{
                          opacity: currentSlide === index ? 1 : 0,
                          zIndex: currentSlide === index ? 1 : 0,
                        }}
                      >
                        <div
                          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                          style={{
                            backgroundImage: `url(${image})`,
                            filter: 'brightness(0.7) drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))'
                          }}
                        />
                        <div className="absolute inset-0 bg-black/50"></div>
                      </div>
                    ))}

                    {/* Content */}
                    <div className="relative z-10 px-3 sm:px-4 py-2 sm:py-2.5 min-h-[200px] sm:min-h-[280px] flex items-center">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 w-full">
                        <div className="flex-1 text-white animate-in fade-in slide-in-from-left-4 duration-700">
                          <h2 className="text-xl sm:text-4xl font-bold mb-1 sm:mb-2 leading-tight tracking-wide drop-shadow-md">
                            {t('slider.learnWithUs')}
                          </h2>
                          <p className="text-base sm:text-2xl font-semibold mb-3 sm:mb-4 tracking-wide drop-shadow-md">
                            {t('slider.wheneverYouAre')}
                          </p>
                          <Button
                            onClick={() => navigate("/courses")}
                            className="bg-[#006D2C] hover:bg-[#005523] text-white font-semibold px-4 sm:px-6 py-2 sm:py-2.5 rounded-full flex items-center gap-2 text-sm sm:text-base w-fit shadow-lg"
                          >
                            {t('slider.browseCourses')}
                            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Slide indicators */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                      {sliderImages.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentSlide(index)}
                          className={`h-2 rounded-full transition-all shadow-md ${currentSlide === index
                              ? 'bg-white w-8'
                              : 'bg-white/50 hover:bg-white/75 w-2'
                            }`}
                          aria-label={`Go to slide ${index + 1}`}
                        />
                      ))}
                    </div>

                    {/* Decorative circles */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
                  </div>
                </div>

                {/* Right Sidebar - Calendar Widget and Upcoming Classes */}
                <div className="space-y-3 sm:space-y-4">
                  {/* Calendar Card - One Week View */}
                  <Card className="border-2">
                    <CardContent className="p-3 sm:p-4">
                      {/* Calendar Header */}
                      <div className="flex items-center justify-between mb-4">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            const newDate = new Date(currentMonth);
                            newDate.setDate(newDate.getDate() - 7);
                            setCurrentMonth(newDate);
                          }}
                          className="h-7 w-7"
                        >
                          <ChevronLeft className="h-4 w-4 text-gray-600" />
                        </Button>

                        <div className="flex items-center gap-1.5">
                          <CalendarDays className="h-4 w-4 text-gray-600" />
                          <span className="font-semibold text-sm text-gray-900">
                            {t(`calendar.${currentMonth.toLocaleDateString('en-US', { month: 'long' }).toLowerCase()}`)} {currentMonth.getFullYear()}
                          </span>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            const newDate = new Date(currentMonth);
                            newDate.setDate(newDate.getDate() + 7);
                            setCurrentMonth(newDate);
                          }}
                          className="h-7 w-7"
                        >
                          <ChevronRight className="h-4 w-4 text-gray-600" />
                        </Button>
                      </div>

                      {/* Calendar Grid - One Week */}
                      <div className="space-y-2">
                        {/* Day Headers */}
                        <div className="grid grid-cols-7 gap-1">
                          {[
                            t('schedule.mo'),
                            t('schedule.tu'),
                            t('schedule.we'),
                            t('schedule.th'),
                            t('schedule.fr'),
                            t('schedule.sat'),
                            t('schedule.su')
                          ].map((day) => (
                            <div key={day} className="text-center text-xs font-medium text-gray-500">
                              {day}
                            </div>
                          ))}
                        </div>

                        {/* Week Days */}
                        <div className="grid grid-cols-7 gap-1">
                          {(() => {
                            const today = new Date();
                            const currentDay = currentMonth.getDay();
                            const monday = new Date(currentMonth);
                            monday.setDate(currentMonth.getDate() - ((currentDay + 6) % 7));

                            const weekDays = [];

                            for (let i = 0; i < 7; i++) {
                              const date = new Date(monday);
                              date.setDate(monday.getDate() + i);
                              const isToday = date.toDateString() === today.toDateString();

                              const classesOnDate = scheduledClasses.filter(sc => {
                                const classDate = new Date(sc.start_time);
                                return classDate.toDateString() === date.toDateString();
                              });

                              const hasClasses = classesOnDate.length > 0;

                              weekDays.push(
                                <div key={i} className="flex flex-col items-center">
                                  <div
                                    className={`w-9 h-9 flex items-center justify-center rounded-full text-sm font-medium transition-colors ${isToday
                                      ? 'bg-purple-500 text-white'
                                      : hasClasses
                                        ? 'bg-red-500 text-white'
                                        : 'text-gray-700 hover:bg-gray-100 cursor-pointer'
                                      }`}
                                  >
                                    {date.getDate()}
                                  </div>
                                  {hasClasses && !isToday && (
                                    <div className="flex gap-0.5 mt-1">
                                      {classesOnDate.slice(0, 2).map((_, idx) => (
                                        <div
                                          key={idx}
                                          className={`w-1 h-1 rounded-full bg-red-500`}
                                        />
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            }

                            return weekDays;
                          })()}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Upcoming Classes */}
                  <div className="space-y-2 sm:space-y-3">
                    {scheduledClasses.slice(0, 2).map((scheduledClass, index) => {
                      const classDate = new Date(scheduledClass.start_time);
                      const dateStr = classDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                      const timeStr = classDate.toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: false
                      });
                      const endTime = new Date(scheduledClass.end_time || classDate.getTime() + 60 * 60000);
                      const endTimeStr = endTime.toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: false
                      });

                      const colors = [
                        { bg: 'bg-gray-900', icon: 'bg-gray-900', label: t('dashboard.course') },
                        { bg: 'bg-cyan-500', icon: 'bg-cyan-500', label: t('dashboard.tutoring') }
                      ];
                      const color = colors[index % colors.length];

                      return (
                        <Card
                          key={scheduledClass.$id}
                          className="border-2 hover:border-[#006d2c] transition-all cursor-pointer group"
                          onClick={() => navigate("/student/schedule")}
                        >
                          <CardContent className="p-3 sm:p-4">
                            <div className="flex items-start gap-2 sm:gap-3">
                              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full ${color.bg} flex items-center justify-center flex-shrink-0`}>
                                <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-gray-500 mb-0.5 sm:mb-1">{color.label}</p>
                                <h4 className="font-bold text-gray-900 text-sm sm:text-base mb-1 sm:mb-2 line-clamp-1 group-hover:text-[#006d2c] transition-colors">
                                  {scheduledClass.title}
                                </h4>
                                <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-gray-600">
                                  <div className="flex items-center gap-1">
                                    <CalendarDays className="h-3 w-3" />
                                    <span>{dateStr}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    <span>{timeStr}-{endTimeStr}</span>
                                  </div>
                                </div>
                              </div>
                              <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 group-hover:text-[#006d2c] transition-colors" />
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}

                    {scheduledClasses.length === 0 && (
                      <Card className="border-2 border-dashed">
                        <CardContent className="p-6 sm:p-8 text-center">
                          <CalendarDays className="h-10 w-10 sm:h-12 sm:w-12 text-gray-300 mx-auto mb-2 sm:mb-3" />
                          <p className="text-sm text-gray-600">{t('dashboard.noUpcomingClasses')}</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              </div>

              {/* Announcements Section */}
              {announcements.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <div className="bg-orange-100 rounded-full p-1.5 sm:p-2">
                      <Megaphone className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
                    </div>
                    <div>
                      <h2 className="text-lg sm:text-2xl font-bold">{t('dashboard.announcements', 'Announcements')}</h2>
                      <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">{t('dashboard.latestFromTeachers', 'Latest updates from your teachers')}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    {announcements.map((announcement) => (
                      <Card key={announcement.$id} className="border-l-4 border-l-orange-500 hover:shadow-md transition-shadow">
                        <CardContent className="p-3 sm:p-4">
                          <div className="flex items-start justify-between gap-2 mb-1.5 sm:mb-2">
                            <h3 className="font-semibold text-gray-900 text-sm sm:text-base line-clamp-1">{announcement.title}</h3>
                            <Badge variant="secondary" className="text-xs shrink-0 hidden sm:inline-flex">
                              {t('dashboard.allCourses', 'All Courses')}
                            </Badge>
                          </div>
                          <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 mb-1.5 sm:mb-2">{announcement.content}</p>
                          <p className="text-xs text-gray-400">
                            {new Date(announcement.$createdAt).toLocaleDateString()}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* My Courses Section */}
              <div>
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <h2 className="text-lg sm:text-2xl font-bold">{t('courses.myCourses')}</h2>
                  {!coursesLoading && enrolledCourses.length > 0 && (
                    <Badge variant="secondary" className="text-xs sm:text-sm">
                      {enrolledCourses.length} {enrolledCourses.length === 1 ? t('dashboard.course') : t('dashboard.courses')}
                    </Badge>
                  )}
                </div>

                {coursesLoading ? (
                  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                    {[1, 2, 3, 4].map((i) => (
                      <Card key={i} className="overflow-hidden rounded-xl sm:rounded-2xl border animate-pulse">
                        <div className="h-28 sm:h-40 bg-gradient-to-br from-gray-200 to-gray-300" />
                        <CardContent className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                          <div className="h-4 sm:h-5 bg-gray-200 rounded w-3/4" />
                          <div className="h-3 sm:h-4 bg-gray-200 rounded w-full" />
                          <div className="h-3 sm:h-4 bg-gray-200 rounded w-2/3" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (() => {
                  const filteredCourses = enrolledCourses.filter((enrollment) => {
                    const course = enrollment.courses;
                    return course?.title?.toLowerCase().startsWith(searchQuery.toLowerCase());
                  });

                  if (filteredCourses.length > 0) {
                    return (
                      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                        {filteredCourses.map((enrollment, index) => {
                          const course = enrollment.courses;
                          const gradients = [
                            'from-blue-500 to-purple-600',
                            'from-green-500 to-teal-600',
                            'from-orange-500 to-red-600',
                            'from-pink-500 to-rose-600',
                          ];
                          const gradient = gradients[index % gradients.length];

                          return (
                            <CourseCard
                              key={course.$id}
                              course={course}
                              onClick={() => navigate(`/course/${course.$id}`)}
                              gradient={gradient}
                              showTeacher={true}
                              columnIndex={index % 4}
                              isEnrolled={true}
                            />
                          );
                        })}
                      </div>
                    );
                  } else if (searchQuery && enrolledCourses.length > 0) {
                    return (
                      <Card className="border-2 border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12 px-4">
                          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3 sm:mb-4">
                            <Search className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
                          </div>
                          <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">{t('searchResults.noCoursesFound')}</h3>
                          <p className="text-xs sm:text-sm text-gray-600 text-center">
                            {t('searchResults.noCoursesMatch')} "{searchQuery}"
                          </p>
                        </CardContent>
                      </Card>
                    );
                  } else {
                    return (
                      <Card className="border-2 border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12 px-4">
                          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3 sm:mb-4">
                            <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
                          </div>
                          <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">{t('dashboard.noCourses')}</h3>
                          <p className="text-xs sm:text-sm text-gray-600 text-center mb-3 sm:mb-4">
                            {t('dashboard.notEnrolled')}
                          </p>
                          <Button onClick={() => navigate("/courses")} className="bg-[#006d2c] hover:bg-[#005523] text-sm">
                            {t('dashboard.browseCourses')}
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  }
                })()}
              </div>

              {/* Quiz Scores Section */}
              {studentId && enrolledCourses.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <div className="bg-purple-100 rounded-full p-1.5 sm:p-2">
                      <Award className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                    </div>
                    <div>
                      <h2 className="text-lg sm:text-2xl font-bold">{t('dashboard.myQuizScores')}</h2>
                      <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">{t('dashboard.trackQuizPerformance')}</p>
                    </div>
                  </div>
                  <div className="overflow-x-auto -mx-2 px-2 sm:mx-0 sm:px-0">
                    <GradesTable studentId={studentId} showFilters={false} />
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default StudentDashboard;
