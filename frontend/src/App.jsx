import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Providers
import { AuthProvider } from './hooks/useAuth';
import { ToastProvider } from './components/Toast';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';
import AuthLayout from './layouts/AuthLayout';
import AdminLayout from './layouts/AdminLayout';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ResumeUpload from './pages/ResumeUpload';
import ResumeHistory from './pages/ResumeHistory';
import JobMatch from './pages/JobMatch';
import InterviewCoach from './pages/InterviewCoach';
import Analytics from './pages/Analytics';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import AdminDashboard from './pages/AdminDashboard';
import AdminUserManagement from './pages/AdminUserManagement';
import AdminActivityLogs from './pages/AdminActivityLogs';
import AdminAnalytics from './pages/AdminAnalytics';

import { ROUTES } from './utils/constants';

function App() {
  useEffect(() => {
    // Determine active theme
    const savedTheme = localStorage.getItem('theme') || 'dark';
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Landing page */}
            <Route path={ROUTES.LANDING} element={<LandingPage />} />

            {/* Auth Layout for login/register */}
            <Route element={<AuthLayout />}>
              <Route path={ROUTES.LOGIN} element={<Login />} />
              <Route path={ROUTES.REGISTER} element={<Register />} />
            </Route>

            {/* Dashboard Protected Layout */}
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="upload" element={<ResumeUpload />} />
              <Route path="history" element={<ResumeHistory />} />
              <Route path="job-match" element={<JobMatch />} />
              <Route path="interview-coach" element={<InterviewCoach />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="profile" element={<Profile />} />
              <Route path="settings" element={<Settings />} />
              
              {/* Admin Protected routes */}
              <Route element={<AdminLayout />}>
                <Route path="admin" element={<AdminDashboard />} />
                <Route path="admin/users" element={<AdminUserManagement />} />
                <Route path="admin/logs" element={<AdminActivityLogs />} />
                <Route path="admin/analytics" element={<AdminAnalytics />} />
              </Route>
            </Route>

            {/* 404 Catch All */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
