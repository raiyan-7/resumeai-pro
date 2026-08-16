import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Bell, User, Settings, LogOut, ChevronDown, Check, Trash2, Briefcase, FileText, MessagesSquare, Info, AlertTriangle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '../utils/constants';
import { notificationService } from '../services/notificationService';

export const Header = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Phase 8 Notifications states
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const loadNotifications = async () => {
    if (!user) return;
    try {
      const data = await notificationService.list();
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.is_read).length);
    } catch (err) {
      console.error('Failed to retrieve user notifications:', err);
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 20000); // Poll every 20s
    return () => clearInterval(interval);
  }, [user]);

  const handleMarkRead = async (id, e) => {
    e.stopPropagation();
    try {
      await notificationService.markRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(prev - 1, 0));
    } catch (err) {
      console.error('Failed to mark notification read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  const handleClearAll = async () => {
    try {
      await notificationService.clearAll();
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to clear notifications history:', err);
    }
  };

  // Derive page title from path
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.endsWith('/dashboard')) return 'Overview';
    if (path.includes('/upload')) return 'Upload Resume';
    if (path.includes('/history')) return 'Resume Archive';
    if (path.includes('/job-match')) return 'Job Match Analyzer';
    if (path.includes('/interview-coach')) return 'Interview Practice';
    if (path.includes('/analytics')) return 'Performance Analytics';
    if (path.includes('/profile')) return 'User Profile';
    if (path.includes('/settings')) return 'Account Settings';
    return 'Dashboard';
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'resume_analysis': return <FileText className="w-3.5 h-3.5 text-indigo-400" />;
      case 'job_match': return <Briefcase className="w-3.5 h-3.5 text-amber-400" />;
      case 'interview': return <MessagesSquare className="w-3.5 h-3.5 text-emerald-400" />;
      case 'security': return <AlertTriangle className="w-3.5 h-3.5 text-rose-450" />;
      default: return <Info className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <header className="h-16 border-b border-slate-900 bg-dark-950/40 backdrop-blur-md px-6 md:px-8 flex items-center justify-between sticky top-0 z-10">
      <h2 className="text-xl font-bold font-display text-white tracking-tight">{getPageTitle()}</h2>

      <div className="flex items-center gap-4">
        {/* Clickable Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className={`relative p-2 rounded-xl text-slate-450 hover:text-slate-205 border border-slate-800/80 transition-colors ${
              notificationsOpen ? 'bg-slate-900 text-slate-100' : 'bg-slate-900/40'
            }`}
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full text-[8px] font-bold text-white bg-rose-500 ring-2 ring-slate-950">
                {unreadCount}
              </span>
            )}
          </button>

          {notificationsOpen && (
            <>
              {/* Overlay blocker */}
              <div className="fixed inset-0 z-30" onClick={() => setNotificationsOpen(false)}></div>
              
              <div className="absolute right-0 mt-2 w-80 rounded-xl bg-slate-950 border border-slate-900 shadow-2xl p-3 z-40 animate-scale-in flex flex-col gap-2.5 max-h-96">
                
                {/* Header */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-900 shrink-0">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                    Notifications
                  </span>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-[9px] font-semibold text-brand-400 hover:text-brand-300 transition-colors flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" /> Mark all read
                    </button>
                  )}
                </div>

                {/* List container */}
                <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[80px]">
                  {notifications.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 text-[10px] font-medium flex flex-col items-center justify-center">
                      <Bell className="w-6 h-6 text-slate-800 mb-1.5" />
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={(e) => !n.is_read && handleMarkRead(n.id, e)}
                        className={`p-2.5 rounded-xl border flex gap-2.5 items-start transition-all ${
                          n.is_read
                            ? 'bg-slate-900/10 border-slate-900/80 opacity-60'
                            : 'bg-slate-900 border-slate-850/80 hover:border-slate-800 cursor-pointer shadow shadow-indigo-500/5'
                        }`}
                      >
                        <div className="p-1.5 rounded-lg bg-slate-950 border border-slate-900 shrink-0">
                          {getCategoryIcon(n.category)}
                        </div>
                        
                        <div className="min-w-0 flex-1 space-y-0.5">
                          <div className="flex items-center justify-between gap-2">
                            <h5 className="font-semibold text-slate-200 text-[10px] truncate">{n.title}</h5>
                            {!n.is_read && (
                              <span className="w-1.5 h-1.5 rounded-full bg-brand-500 shrink-0"></span>
                            )}
                          </div>
                          <p className="text-[9px] text-slate-450 leading-relaxed break-words">{n.message}</p>
                          <span className="text-[8px] text-slate-600 block pt-0.5">
                            {new Date(n.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Footer */}
                {notifications.length > 0 && (
                  <div className="pt-2 border-t border-slate-900 shrink-0">
                    <button
                      onClick={handleClearAll}
                      className="w-full text-center text-[9px] font-bold text-slate-500 hover:text-rose-400 transition-colors flex items-center justify-center gap-1 py-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Clear All History
                    </button>
                  </div>
                )}

              </div>
            </>
          )}
        </div>

        {/* User Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 p-1.5 rounded-xl border border-slate-800/80 bg-slate-900/40 hover:bg-slate-900/80 transition-colors"
          >
            <div className="w-7 h-7 rounded-lg bg-accent-500/10 border border-accent-500/25 flex items-center justify-center font-bold text-xs text-accent-400">
              {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
            </div>
            <span className="hidden sm:inline text-xs font-medium text-slate-300 px-1">
              {user?.full_name || 'Member'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 mr-1 shrink-0" />
          </button>

          {dropdownOpen && (
            <>
              {/* Overlay blocker */}
              <div className="fixed inset-0 z-30" onClick={() => setDropdownOpen(false)}></div>
              
              <div className="absolute right-0 mt-2 w-48 rounded-xl bg-slate-950 border border-slate-900 shadow-2xl p-1.5 z-40 animate-scale-in">
                <Link
                  to={ROUTES.PROFILE}
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition-colors"
                >
                  <User className="w-3.5 h-3.5" />
                  My Profile
                </Link>
                <Link
                  to={ROUTES.SETTINGS}
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition-colors"
                >
                  <Settings className="w-3.5 h-3.5" />
                  Settings
                </Link>
                <div className="border-t border-slate-900 my-1"></div>
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    logout();
                  }}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 transition-colors w-full text-left"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
export default Header;
