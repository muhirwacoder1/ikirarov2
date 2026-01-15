import { Client, Account, Databases, Storage, Query, ID } from 'appwrite';

const client = new Client();

// Configure Appwrite using environment variables
client
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1')
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID || '696791b900079d1e7d3a');

// Export service instances
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

// Database and collection IDs
export const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID || '696797dd003cb0ec65cd';
export const BUCKET_ID = import.meta.env.VITE_APPWRITE_BUCKET_ID || '69679ed200011c3f9f96';

// Collection IDs - these match your Appwrite collection IDs
export const COLLECTIONS = {
  profiles: 'profiles',
  courses: 'courses',
  enrollments: 'enrollments',
  assignments: 'assignments',
  submissions: 'submissions',
  schedules: 'schedules',
  announcements: 'announcements',
  exhibition_projects: 'exhibition_projects',
  testimonials: 'testimonials',
  course_modules: 'course_modules',
  module_lessons: 'module_lessons',
  partner_requests: 'partner_requests',
  quizzes: 'quizzes',
  quiz_questions: 'quiz_questions',
  quiz_attempts: 'quiz_attempts',
  // New collections for course content
  course_chapters: 'course_chapters',
  course_lessons: 'course_lessons',
  capstone_projects: 'capstone_projects',
  lesson_quiz_questions: 'lesson_quiz_questions',
};

// Re-export Query and ID for convenience
export { Query, ID, client };
