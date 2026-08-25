import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LogOut, ChevronLeft, ChevronRight, Sparkles, ShieldAlert, UserCog, History, BarChart3 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { NAVIGATION_ITEMS, PROFILE_ITEMS, ROUTES } from '../utils/constants';

export const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LANDING);
  };

  return (
    <aside
      className={`h-screen sticky top-0 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-900 transition-all duration-300 flex flex-col z-20 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 px-6 border-b border-slate-200 dark:border-slate-900 flex items-center justify-between">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold shrink-0">
            RA
          </div>
          {!isCollapsed && (
            <span className="font-display font-bold text-base tracking-tight text-slate-800 dark:text-white flex items-center gap-1.5 whitespace-nowrap">
              ResumeAI <span className="text-[10px] uppercase font-sans tracking-widest text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10 px-1.5 py-0.5 rounded border border-brand-200 dark:border-brand-500/20">Pro</span>
            </span>
          )}
        </div>
        
        {/* Toggle arrow for wide screen */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-205 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors shrink-0"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="text-[10px] font-semibold text-slate-450 dark:text-slate-550 uppercase tracking-wider px-3 mb-2">
          {isCollapsed ? '•' : 'Core Features'}
        </div>
        
        {NAVIGATION_ITEMS.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            end={item.path === ROUTES.DASHBOARD}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                isActive
                  ? 'bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-500/20'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-205 hover:bg-slate-50 dark:hover:bg-slate-900/50 border border-transparent'
              }`
            }
          >
            <item.icon className="w-5 h-5 shrink-0 group-hover:scale-105 transition-transform" />
            {!isCollapsed && <span className="truncate">{item.name}</span>}
          </NavLink>
        ))}

        {user?.role === 'admin' && (
          <div className="pt-4">
            <div className="text-[10px] font-semibold text-slate-450 dark:text-slate-550 uppercase tracking-wider px-3 mb-2">
              {isCollapsed ? '•' : 'Admin Area'}
            </div>
            <NavLink
              to={ROUTES.ADMIN}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-500/20'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-205 hover:bg-slate-50 dark:hover:bg-slate-900/50 border border-transparent'
                }`
              }
            >
              <ShieldAlert className="w-5 h-5 shrink-0 group-hover:scale-105 transition-transform" />
              {!isCollapsed && <span className="truncate">Admin Dashboard</span>}
            </NavLink>
            <NavLink
              to={ROUTES.USER_MANAGEMENT}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-500/20'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-205 hover:bg-slate-50 dark:hover:bg-slate-900/50 border border-transparent'
                }`
              }
            >
              <UserCog className="w-5 h-5 shrink-0 group-hover:scale-105 transition-transform" />
              {!isCollapsed && <span className="truncate">User Management</span>}
            </NavLink>
            <NavLink
              to={ROUTES.ACTIVITY_LOGS}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-500/20'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-205 hover:bg-slate-50 dark:hover:bg-slate-900/50 border border-transparent'
                }`
              }
            >
              <History className="w-5 h-5 shrink-0 group-hover:scale-105 transition-transform" />
              {!isCollapsed && <span className="truncate">Activity Logs</span>}
            </NavLink>
            <NavLink
              to={ROUTES.ADMIN_ANALYTICS}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-500/20'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-205 hover:bg-slate-50 dark:hover:bg-slate-900/50 border border-transparent'
                }`
              }
            >
              <BarChart3 className="w-5 h-5 shrink-0 group-hover:scale-105 transition-transform" />
              {!isCollapsed && <span className="truncate">Analytics</span>}
            </NavLink>
          </div>
        )}

        <div className="pt-6">
          <div className="text-[10px] font-semibold text-slate-450 dark:text-slate-550 uppercase tracking-wider px-3 mb-2">
            {isCollapsed ? '•' : 'Account Settings'}
          </div>
          {PROFILE_ITEMS.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-500/20'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-205 hover:bg-slate-50 dark:hover:bg-slate-900/50 border border-transparent'
                }`
              }
            >
              <item.icon className="w-5 h-5 shrink-0 group-hover:scale-105 transition-transform" />
              {!isCollapsed && <span className="truncate">{item.name}</span>}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* User Footer Profile */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-900 flex flex-col gap-2 shrink-0">
        {!isCollapsed && (
          <div className="flex items-center gap-3 px-2 py-1 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-900/50">
            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-accent-600 dark:text-accent-400 shrink-0 border border-slate-300 dark:border-slate-700/50">
              {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{user?.full_name || 'ResumeAI Member'}</p>
              <p className="text-[10px] text-slate-500 truncate">{user?.email || 'member@resumeai.pro'}</p>
            </div>
          </div>
        )}
        
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-500 dark:text-rose-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 border border-transparent w-full transition-colors`}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!isCollapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};
export default Sidebar;
