import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { ROUTES } from '../utils/constants';

export const AuthLayout = () => {
  const { user, loading } = useAuth();

  // If user is already authenticated, redirect to dashboard automatically
  if (user && !loading) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-dark-950 text-slate-100 relative overflow-hidden">
      {/* Background neon glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-accent-500/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-brand-500/8 blur-[120px] pointer-events-none"></div>

      {/* Top Simple Header */}
      <header className="h-20 px-6 md:px-12 flex items-center justify-between border-b border-slate-900/40 backdrop-blur-sm z-10 shrink-0">
        <Link to={ROUTES.LANDING} className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-accent-600 flex items-center justify-center text-white font-bold shrink-0">
            RA
          </div>
          <span className="font-display font-bold text-base tracking-tight text-white flex items-center gap-1.5 whitespace-nowrap">
            ResumeAI <span className="text-[10px] uppercase font-sans tracking-widest text-brand-400 bg-brand-500/10 px-1.5 py-0.5 rounded border border-brand-500/20">Pro</span>
          </span>
        </Link>

        <Link
          to={ROUTES.LANDING}
          className="text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors border border-slate-800/80 px-3.5 py-2 rounded-xl bg-slate-900/20"
        >
          Back to home
        </Link>
      </header>

      {/* Auth Content */}
      <main className="flex-grow flex items-center justify-center py-12 px-4 z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="w-full max-w-md"
        >
          <Outlet />
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="h-14 px-6 border-t border-slate-900/40 text-center flex items-center justify-center text-[10px] text-slate-500 shrink-0">
        © {new Date().getFullYear()} ResumeAI Pro. All software architecture configurations initialized.
      </footer>
    </div>
  );
};
export default AuthLayout;
