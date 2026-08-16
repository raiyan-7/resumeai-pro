import React from 'react';
import { Outlet, Navigate, Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '../utils/constants';

export const AdminLayout = () => {
  const { user } = useAuth();

  // If not admin, render a secure access denied panel rather than mapping routes
  if (user?.role !== 'admin') {
    return (
      <div className="min-h-[400px] flex items-center justify-center p-6 text-slate-100 animate-scale-in">
        <div className="max-w-md w-full bg-slate-900/40 p-8 rounded-2xl border border-rose-500/20 text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/25 flex items-center justify-center text-rose-500 mb-6 shrink-0">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold font-display text-slate-100 mb-2">Access Denied</h2>
          <p className="text-slate-400 text-xs leading-relaxed mb-6">
            Administrative credentials are required to view this area. Your current account role does not have authorization.
          </p>
          <Link
            to={ROUTES.DASHBOARD}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-slate-200 border border-slate-700 rounded-xl hover:bg-slate-700 transition-colors text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return <Outlet />;
};

export default AdminLayout;
