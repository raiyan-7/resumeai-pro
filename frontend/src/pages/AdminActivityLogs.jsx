import React, { useState, useEffect } from 'react';
import { History, Search, RefreshCw, Key, FileUp, Sparkles, MessagesSquare, Shield, Trash2, HelpCircle, UserPlus } from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { LoadingState } from '../components/LoadingState';
import { useToast } from '../components/Toast';
import { api } from '../services/api';
import { formatDate } from '../utils/helpers';

export const AdminActivityLogs = () => {
  const { addToast } = useToast();
  
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Filters state
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;

  const fetchLogs = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    
    try {
      const skip = (currentPage - 1) * limit;
      let url = `/admin/activity-logs?skip=${skip}&limit=${limit}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (actionFilter) url += `&action=${encodeURIComponent(actionFilter)}`;

      const data = await api.get(url);
      setLogs(data.logs || []);
      setTotal(data.total || 0);
    } catch (err) {
      const errMsg = err.detail || err.message || 'Failed to load system audit logs.';
      setError(errMsg);
      addToast(errMsg, 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [currentPage, actionFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchLogs();
  };

  const handleClearFilters = () => {
    setSearch('');
    setActionFilter('');
    setCurrentPage(1);
  };

  // Helper to resolve Lucide Icon based on action string
  const getActionIcon = (action) => {
    const actionLower = action.toLowerCase();
    if (actionLower.includes('register') || actionLower.includes('signup')) {
      return <UserPlus className="w-4 h-4 text-emerald-400" />;
    }
    if (actionLower.includes('login') || actionLower.includes('signin')) {
      return <Key className="w-4 h-4 text-amber-400" />;
    }
    if (actionLower.includes('upload')) {
      return <FileUp className="w-4 h-4 text-indigo-400" />;
    }
    if (actionLower.includes('match') || actionLower.includes('ats')) {
      return <Sparkles className="w-4 h-4 text-brand-400" />;
    }
    if (actionLower.includes('interview')) {
      return <MessagesSquare className="w-4 h-4 text-purple-400" />;
    }
    if (actionLower.includes('profile view') || actionLower.includes('inspect')) {
      return <Shield className="w-4 h-4 text-blue-400" />;
    }
    if (actionLower.includes('delete')) {
      return <Trash2 className="w-4 h-4 text-rose-400" />;
    }
    return <HelpCircle className="w-4 h-4 text-slate-400" />;
  };

  // Action enum options for dropdown filter
  const actionOptions = [
    { value: '', label: 'All Actions' },
    { value: 'User Registration', label: 'User Registration' },
    { value: 'User Login', label: 'User Login' },
    { value: 'Admin Login', label: 'Admin Login' },
    { value: 'Resume Upload', label: 'Resume Upload' },
    { value: 'Resume Deletion', label: 'Resume Deletion' },
    { value: 'Job Match / ATS analysis', label: 'Job Match / ATS analysis' },
    { value: 'Interview session started', label: 'Interview session started' },
    { value: 'Admin profile view', label: 'Admin profile view' },
    { value: 'Admin user deletion', label: 'Admin user deletion' }
  ];

  const totalPages = Math.ceil(total / limit) || 1;

  if (loading) {
    return <LoadingState text="Loading system transaction audit logs..." />;
  }

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-900 pb-5">
        <div>
          <h1 className="text-2xl font-bold font-display text-white tracking-tight flex items-center gap-2">
            <History className="w-7 h-7 text-brand-500" />
            Activity Logs
          </h1>
          <p className="text-xs text-slate-400">
            Audit trail of platform transaction history, user logs, and parser executions.
          </p>
        </div>
        
        {/* Buttons and dropdowns */}
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => fetchLogs(true)}
            disabled={refreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Filters bar */}
      <Card className="border border-slate-900 p-4">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
          
          {/* Action Filter */}
          <div className="sm:col-span-3">
            <select
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-all duration-200"
            >
              {actionOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Search bar */}
          <div className="sm:col-span-7 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
            <input
              type="text"
              placeholder="Search descriptions, email address or names..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-all duration-200"
            />
          </div>

          {/* Submit */}
          <div className="sm:col-span-2 flex gap-2">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold text-xs rounded-xl transition-colors duration-200 focus:outline-none"
            >
              Search
            </button>
            {(search || actionFilter) && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition-colors duration-200 focus:outline-none"
                title="Clear Filters"
              >
                Clear
              </button>
            )}
          </div>

        </form>
      </Card>

      {/* Main logs display */}
      {error ? (
        <div className="text-center py-12 text-slate-400">
          <Shield className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h3 className="text-base font-bold text-white mb-2">Failed to load logs</h3>
          <p className="text-xs max-w-sm mx-auto mb-6">{error}</p>
          <Button variant="secondary" onClick={() => fetchLogs()}>Retry Load</Button>
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-16 border border-slate-900 bg-slate-900/10 rounded-2xl flex flex-col items-center">
          <History className="w-10 h-10 text-slate-800 mb-2" />
          <p className="text-sm font-semibold text-slate-400">No activity logs recorded</p>
          <p className="text-xs text-slate-600 mt-1">Activities will appear automatically as users complete operations.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <Card className="border border-slate-900 p-0" bodyClassName="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-900/80 bg-slate-950/40 text-[10px] text-slate-400 uppercase tracking-wider">
                    <th className="py-4 px-6 w-12 text-center">Type</th>
                    <th className="py-4 px-6 w-44">User Account</th>
                    <th className="py-4 px-6 w-48">Action Event</th>
                    <th className="py-4 px-6">Description</th>
                    <th className="py-4 px-6 w-48 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900/60 text-xs text-slate-300">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-900/10 transition-colors">
                      {/* Icon */}
                      <td className="py-4 px-6 text-center">
                        <div className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-900 flex items-center justify-center mx-auto shrink-0">
                          {getActionIcon(log.action)}
                        </div>
                      </td>

                      {/* User details */}
                      <td className="py-4 px-6">
                        <div className="font-semibold text-slate-200 truncate max-w-[150px]">
                          {log.user_name || 'Anonymous User'}
                        </div>
                        <div className="text-[9px] text-slate-500 truncate max-w-[150px] mt-0.5">
                          {log.user_email}
                        </div>
                      </td>

                      {/* Action badge */}
                      <td className="py-4 px-6">
                        <span className="text-[10px] font-bold text-slate-200">
                          {log.action}
                        </span>
                      </td>

                      {/* Description */}
                      <td className="py-4 px-6 text-slate-400 text-[11px] leading-relaxed">
                        {log.description}
                      </td>

                      {/* Timestamp (IST formatted via formatDate helper) */}
                      <td className="py-4 px-6 text-right text-slate-550 text-[10px] whitespace-nowrap">
                        {formatDate(log.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-2 pt-2">
              <span className="text-[10px] text-slate-500">
                Showing page {currentPage} of {totalPages} ({total} total logs)
              </span>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Prev
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default AdminActivityLogs;
