import { Models } from 'appwrite';

export interface Profile extends Models.Document {
  email: string;
  full_name: string;
  role: 'student' | 'teacher';
  avatar_url?: string;
  onboarding_completed: boolean;
  phone?: string;
  location?: string;
  bio?: string;
  is_suspended?: boolean;
  suspension_reason?: string;
}

export interface Course extends Models.Document {
  title: string;
  description?: string;
  thumbnail_url?: string;
  teacher_id: string;
  level?: string;
  status: 'draft' | 'published' | 'pending';
  price?: number;
  duration?: string;
  category?: string;
  is_featured?: boolean;
}

export interface Enrollment extends Models.Document {
  student_id: string;
  course_id: string;
  progress: number;
  enrolled_at: string;
  completed_at?: string;
}

export interface Assignment extends Models.Document {
  course_id: string;
  title: string;
  description?: string;
  due_date?: string;
  max_score: number;
  created_by: string;
}

export interface Submission extends Models.Document {
  assignment_id: string;
  student_id: string;
  file_url?: string;
  content?: string;
  score?: number;
  feedback?: string;
  submitted_at: string;
  graded_at?: string;
}

export interface Schedule extends Models.Document {
  course_id: string;
  teacher_id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  meeting_link?: string;
}

export interface Announcement extends Models.Document {
  teacher_id: string;
  course_id?: string;
  title: string;
  content: string;
  is_global: boolean;
}

export interface ExhibitionProject extends Models.Document {
  student_name: string;
  student_image_url?: string;
  course_name: string;
  project_title: string;
  project_description: string;
  course_score: number;
  achievements: string[];
  technologies: string[];
  project_link?: string;
  is_featured: boolean;
  display_order: number;
}

export interface Testimonial extends Models.Document {
  student_name: string;
  student_image_url?: string;
  testimonial_text: string;
  rating: number;
  course_name?: string;
  is_featured: boolean;
  display_order: number;
}

export interface CourseModule extends Models.Document {
  course_id: string;
  title: string;
  description?: string;
  order: number;
}

export interface ModuleLesson extends Models.Document {
  module_id: string;
  title: string;
  content_type: 'video' | 'text' | 'quiz' | 'pdf';
  content_url?: string;
  content_text?: string;
  duration?: number;
  order: number;
}

export interface PartnerRequest extends Models.Document {
  organization_name: string;
  contact_name: string;
  email: string;
  phone?: string;
  message?: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface Quiz extends Models.Document {
  lesson_id: string;
  title: string;
  passing_score: number;
}

export interface QuizQuestion extends Models.Document {
  quiz_id: string;
  question: string;
  options: string[];
  correct_answer: number;
  order: number;
}

export interface QuizAttempt extends Models.Document {
  quiz_id: string;
  student_id: string;
  score: number;
  passed: boolean;
  answers: number[];
  completed_at: string;
}
