import { LayoutDashboard, FileUp, History, Briefcase, MessagesSquare, BarChart3, Settings, User } from 'lucide-react';

export const ROUTES = {
  LANDING: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  UPLOAD: '/dashboard/upload',
  HISTORY: '/dashboard/history',
  JOB_MATCH: '/dashboard/job-match',
  INTERVIEW_COACH: '/dashboard/interview-coach',
  ANALYTICS: '/dashboard/analytics',
  PROFILE: '/dashboard/profile',
  SETTINGS: '/dashboard/settings',
  ADMIN: '/dashboard/admin',
  USER_MANAGEMENT: '/dashboard/admin/users',
  ACTIVITY_LOGS: '/dashboard/admin/logs',
  ADMIN_ANALYTICS: '/dashboard/admin/analytics',
};

export const NAVIGATION_ITEMS = [
  { name: 'Dashboard', path: ROUTES.DASHBOARD, icon: LayoutDashboard },
  { name: 'Upload Resume', path: ROUTES.UPLOAD, icon: FileUp },
  { name: 'Resume History', path: ROUTES.HISTORY, icon: History },
  { name: 'Job Matcher', path: ROUTES.JOB_MATCH, icon: Briefcase },
  { name: 'Interview Coach', path: ROUTES.INTERVIEW_COACH, icon: MessagesSquare },
  { name: 'Analytics', path: ROUTES.ANALYTICS, icon: BarChart3 },
];

export const PROFILE_ITEMS = [
  { name: 'My Profile', path: ROUTES.PROFILE, icon: User },
  { name: 'Settings', path: ROUTES.SETTINGS, icon: Settings },
];

export const DIFFICULTIES = ['Easy', 'Intermediate', 'Hard'];
export const TARGET_ROLES = [
  'Software Engineer',
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Engineer',
  'Data Scientist',
  'Machine Learning Engineer',
  'NLP Engineer',
  'DevOps Engineer',
  'QA Analyst',
  'Product Manager'
];
