import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { LoadingState } from '../components/LoadingState';
import { ROUTES } from '../utils/constants';

export const DashboardLayout = () => {
  const { user, loading } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-dark-950">
        <LoadingState text="Verifying session details..." />
      </div>
    );
  }

  // Redirect to login if not logged in
  if (!user) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-dark-950 text-slate-900 dark:text-slate-100">
      {/* Sidebar */}
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Header */}
        <Header />

        {/* Scrollable Workspace */}
        <main className="flex-grow overflow-y-auto px-6 md:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="max-w-6xl mx-auto space-y-8"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
};
export default DashboardLayout;
