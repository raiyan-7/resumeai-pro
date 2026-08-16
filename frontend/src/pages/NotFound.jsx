import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, ChevronRight, LayoutDashboard, Home } from 'lucide-react';
import { Button } from '../components/Button';
import { ROUTES } from '../utils/constants';

export const NotFound = () => {
  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-6 text-slate-100 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[35%] h-[35%] rounded-full bg-accent-500/10 blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[35%] h-[35%] rounded-full bg-brand-500/8 blur-[100px] pointer-events-none"></div>
      
      <div className="max-w-md w-full glass-card p-10 text-center flex flex-col items-center relative z-10 border border-slate-900 shadow-2xl">
        <div className="w-16 h-16 rounded-full bg-slate-900/60 border border-slate-800 flex items-center justify-center text-brand-400 mb-6 animate-pulse-glow">
          <HelpCircle className="w-8 h-8" />
        </div>
        <h1 className="text-6xl font-extrabold font-display text-white tracking-tight mb-2">404</h1>
        <h2 className="text-lg font-semibold text-slate-350 mb-2">Page Not Found</h2>
        <p className="text-slate-400 text-xs leading-normal mb-8 max-w-xs">
          The endpoint you are trying to visit is missing or has been relocated to another route mapping.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <Link to={ROUTES.DASHBOARD} className="flex-1">
            <Button variant="primary" className="w-full text-xs" icon={LayoutDashboard}>
              Workspace
            </Button>
          </Link>
          <Link to={ROUTES.LANDING} className="flex-1">
            <Button variant="secondary" className="w-full text-xs" icon={Home}>
              Landing Page
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
export default NotFound;
