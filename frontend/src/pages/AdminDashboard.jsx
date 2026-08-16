import React, { useState, useEffect } from 'react';
import { ShieldAlert, Users, FileText, CheckCircle2, MessagesSquare, Users2 } from 'lucide-react';
import { Card } from '../components/Card';
import { LoadingState } from '../components/LoadingState';
import { useToast } from '../components/Toast';
import { api } from '../services/api';

export const AdminDashboard = () => {
  const { addToast } = useToast();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAdminStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get('/admin/dashboard');
      setStats(data);
    } catch (err) {
      const errMsg = err.detail || err.message || 'Failed to load administrative analytics.';
      setError(errMsg);
      addToast(errMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminStats();
  }, []);

  if (loading) {
    return <LoadingState text="Loading administrative dashboard metrics..." />;
  }

  if (error) {
    return (
      <div className="text-center py-12 text-slate-400">
        <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto mb-4" />
        <h3 className="text-base font-bold text-white mb-2">Access Denied or Database Error</h3>
        <p className="text-xs max-w-sm mx-auto mb-6">{error}</p>
        <button
          onClick={fetchAdminStats}
          className="px-4 py-2 bg-slate-800 text-slate-200 border border-slate-700 rounded-xl hover:bg-slate-700 transition-colors text-xs font-semibold"
        >
          Retry Load
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-1.5 border-b border-slate-900 pb-5">
        <h1 className="text-2xl font-bold font-display text-white tracking-tight flex items-center gap-2">
          <ShieldAlert className="w-7 h-7 text-brand-500" />
          Admin Dashboard
        </h1>
        <p className="text-xs text-slate-400">
          Global system aggregations, active user accounts, and parser transaction records.
        </p>
      </div>

      {/* Placeholder Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Total Users */}
        <Card title="Total Users" className="border border-slate-900">
          <div className="flex items-center gap-4 mt-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center text-indigo-400 shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-extrabold font-display text-white">{stats?.total_users ?? 0}</p>
              <p className="text-[10px] text-slate-500">Registered member profiles</p>
            </div>
          </div>
        </Card>

        {/* Total Resumes */}
        <Card title="Total Resumes" className="border border-slate-900">
          <div className="flex items-center gap-4 mt-2">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/25 flex items-center justify-center text-brand-400 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-extrabold font-display text-white">{stats?.total_resumes ?? 0}</p>
              <p className="text-[10px] text-slate-500">PDF documents uploaded</p>
            </div>
          </div>
        </Card>

        {/* Total ATS Analyses */}
        <Card title="Total ATS Analyses" className="border border-slate-900">
          <div className="flex items-center gap-4 mt-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-extrabold font-display text-white">{stats?.total_ats_analyses ?? 0}</p>
              <p className="text-[10px] text-slate-500">Job matching profiles mapped</p>
            </div>
          </div>
        </Card>

        {/* Total Interview Sessions */}
        <Card title="Total Interview Sessions" className="border border-slate-900">
          <div className="flex items-center gap-4 mt-2">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/25 flex items-center justify-center text-purple-400 shrink-0">
              <MessagesSquare className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-extrabold font-display text-white">{stats?.total_interviews ?? 0}</p>
              <p className="text-[10px] text-slate-500">Coach discussions initialized</p>
            </div>
          </div>
        </Card>

        {/* Active Users Today */}
        <Card title="Active Users Today" className="border border-slate-900">
          <div className="flex items-center gap-4 mt-2">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 shrink-0">
              <Users2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-extrabold font-display text-white">{stats?.active_users_today ?? 0}</p>
              <p className="text-[10px] text-slate-500">Sessions recorded today</p>
            </div>
          </div>
        </Card>

      </div>
    </div>
  );
};

export default AdminDashboard;
