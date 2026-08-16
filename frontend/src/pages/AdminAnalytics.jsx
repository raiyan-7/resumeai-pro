import React, { useState, useEffect } from 'react';
import { BarChart3, Users, FileText, CheckCircle2, MessagesSquare, RefreshCw, Key, FileUp, Sparkles, Shield, Trash2, HelpCircle, UserPlus, History } from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { LoadingState } from '../components/LoadingState';
import { useToast } from '../components/Toast';
import { api } from '../services/api';
import { formatDate } from '../utils/helpers';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export const AdminAnalytics = () => {
  const { addToast } = useToast();

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  
  // Date Range state
  const [rangeDays, setRangeDays] = useState('30');

  const fetchAnalytics = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const data = await api.get(`/admin/analytics?range_days=${rangeDays}`);
      setAnalytics(data);
    } catch (err) {
      const errMsg = err.detail || err.message || 'Failed to calculate platform metrics.';
      setError(errMsg);
      addToast(errMsg, 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [rangeDays]);

  // Helper to format chart details
  const getChartOptions = (titleText) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#0f172a',
        titleColor: '#f8fafc',
        bodyColor: '#94a3b8',
        borderColor: '#1e293b',
        borderWidth: 1,
        padding: 10,
        boxPadding: 4,
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.03)',
        },
        ticks: {
          color: '#64748b',
          font: {
            size: 9,
          }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.03)',
        },
        ticks: {
          color: '#64748b',
          font: {
            size: 9,
          },
          precision: 0
        }
      }
    }
  });

  const makeChartData = (trendPoints, colorHex, label) => {
    const labels = trendPoints?.map(p => {
      // Reformat to shorter date if possible
      const dateParts = p.date.split('-');
      if (dateParts.length === 3) {
        return `${dateParts[2]} ${new Date(p.date).toLocaleString('en-US', { month: 'short' })}`;
      }
      return p.date;
    }) || [];
    const dataValues = trendPoints?.map(p => p.count) || [];

    return {
      labels,
      datasets: [
        {
          fill: true,
          label: label,
          data: dataValues,
          borderColor: colorHex,
          backgroundColor: `${colorHex}15`,
          borderWidth: 2,
          pointBackgroundColor: colorHex,
          pointBorderColor: '#000',
          pointHoverRadius: 4,
          tension: 0.35,
        }
      ]
    };
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

  if (loading) {
    return <LoadingState text="Loading platform activity analytics dashboard..." />;
  }

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-900 pb-5">
        <div>
          <h1 className="text-2xl font-bold font-display text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-brand-500" />
            System Analytics
          </h1>
          <p className="text-xs text-slate-400">
            Real-time analytics trends, transactions counts and feature distribution indexes.
          </p>
        </div>

        {/* Range Selector and Refresh */}
        <div className="flex items-center gap-3">
          <select
            value={rangeDays}
            onChange={(e) => setRangeDays(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-all duration-200"
          >
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
            <option value="all">All Time</option>
          </select>
          
          <Button
            variant="secondary"
            size="sm"
            onClick={() => fetchAnalytics(true)}
            disabled={refreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {error ? (
        <div className="text-center py-12 text-slate-400">
          <BarChart3 className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h3 className="text-base font-bold text-white mb-2">Failed to load statistics</h3>
          <p className="text-xs max-w-sm mx-auto mb-6">{error}</p>
          <Button variant="secondary" onClick={() => fetchAnalytics()}>Retry Load</Button>
        </div>
      ) : (
        <>
          {/* Summary Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Total Users */}
            <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center text-indigo-400 shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Total Users</p>
                <p className="text-2xl font-extrabold font-display text-white mt-0.5">{analytics?.total_users ?? 0}</p>
              </div>
            </div>

            {/* Total Resumes */}
            <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/25 flex items-center justify-center text-brand-400 shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Total Resumes</p>
                <p className="text-2xl font-extrabold font-display text-white mt-0.5">{analytics?.total_resumes ?? 0}</p>
              </div>
            </div>

            {/* ATS Analyses */}
            <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">ATS Analyses</p>
                <p className="text-2xl font-extrabold font-display text-white mt-0.5">{analytics?.total_ats_analyses ?? 0}</p>
              </div>
            </div>

            {/* Interview Sessions */}
            <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/25 flex items-center justify-center text-purple-400 shrink-0">
                <MessagesSquare className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Interviews</p>
                <p className="text-2xl font-extrabold font-display text-white mt-0.5">{analytics?.total_interviews ?? 0}</p>
              </div>
            </div>

          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* User Registrations Trend */}
            <Card title="User Registrations Trend" className="border border-slate-900 p-5">
              <div className="h-64 mt-4">
                <Line
                  options={getChartOptions('User Registrations')}
                  data={makeChartData(analytics?.user_registrations, '#6366f1', 'Sign-ups')}
                />
              </div>
            </Card>

            {/* Resume Uploads Trend */}
            <Card title="Resume Uploads Trend" className="border border-slate-900 p-5">
              <div className="h-64 mt-4">
                <Line
                  options={getChartOptions('Resume Uploads')}
                  data={makeChartData(analytics?.resume_uploads, '#3b82f6', 'Uploads')}
                />
              </div>
            </Card>

            {/* ATS Matches Trend */}
            <Card title="ATS Analyses Trend" className="border border-slate-900 p-5">
              <div className="h-64 mt-4">
                <Line
                  options={getChartOptions('ATS Analyses')}
                  data={makeChartData(analytics?.ats_analyses, '#10b981', 'Analyses')}
                />
              </div>
            </Card>

            {/* Interview Sessions Trend */}
            <Card title="Interview Coach Sessions Trend" className="border border-slate-900 p-5">
              <div className="h-64 mt-4">
                <Line
                  options={getChartOptions('Interview Sessions')}
                  data={makeChartData(analytics?.interview_sessions, '#a855f7', 'Sessions')}
                />
              </div>
            </Card>

          </div>

          {/* Feature Distribution and Recent Activity Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Feature Usage breakdown */}
            <div className="lg:col-span-5">
              <Card title="Feature Usage Share" subtitle="Transaction counts distribution" className="border border-slate-900 h-full">
                <div className="space-y-6 mt-4">
                  {analytics?.feature_usage?.map((feature) => {
                    const totalTransactions = (analytics.total_resumes + analytics.total_ats_analyses + analytics.total_interviews) || 1;
                    const pct = Math.round((feature.value / totalTransactions) * 100);
                    
                    return (
                      <div key={feature.name} className="space-y-2">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-slate-350">{feature.name}</span>
                          <span className="text-slate-200">{feature.value} ({pct}%)</span>
                        </div>
                        <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-900">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              feature.name.includes('Upload') ? 'bg-indigo-500' :
                              feature.name.includes('ATS') ? 'bg-emerald-500' : 'bg-purple-500'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>

            {/* Recent Activity Mini-Feed */}
            <div className="lg:col-span-7">
              <Card
                title="Recent Audit Events"
                subtitle="Timeline feed of last 5 system events"
                className="border border-slate-900"
                actions={
                  <a
                    href="/dashboard/admin/logs"
                    className="text-[10px] font-bold text-brand-400 hover:text-brand-300 flex items-center gap-1"
                  >
                    <History className="w-3.5 h-3.5" />
                    Full Audit Logs
                  </a>
                }
              >
                <div className="space-y-4 mt-2">
                  {analytics?.recent_activity?.length === 0 ? (
                    <p className="text-center py-6 text-slate-500 text-xs">No recent events recorded.</p>
                  ) : (
                    <div className="divide-y divide-slate-900/40">
                      {analytics?.recent_activity?.map((log) => (
                        <div key={log.id} className="py-3 flex items-start gap-3.5 first:pt-0 last:pb-0">
                          <div className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-900 flex items-center justify-center shrink-0">
                            {getActionIcon(log.action)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-4">
                              <p className="text-[11px] font-bold text-slate-250 truncate">{log.action}</p>
                              <span className="text-[9px] text-slate-550 whitespace-nowrap">{formatDate(log.created_at)}</span>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-0.5 truncate">{log.user_email}</p>
                            <p className="text-[10px] text-slate-400 mt-1 leading-relaxed bg-slate-950/40 p-2 rounded-lg border border-slate-950/80">
                              {log.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            </div>

          </div>
        </>
      )}

    </div>
  );
};

export default AdminAnalytics;
