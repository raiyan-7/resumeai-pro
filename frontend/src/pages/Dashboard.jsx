import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileUp, Briefcase, MessagesSquare, History, FileText, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { LoadingState } from '../components/LoadingState';
import { resumeService } from '../services/resumeService';
import { jobMatchService } from '../services/jobMatchService';
import { interviewService } from '../services/interviewService';
import { ROUTES } from '../utils/constants';
import { formatDate } from '../utils/helpers';

export const Dashboard = () => {
  const [stats, setStats] = useState({
    resumesCount: 0,
    matchesCount: 0,
    interviewsCount: 0,
    averageAts: 0
  });
  const [recentResumes, setRecentResumes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [resumes, matches, interviews] = await Promise.all([
          resumeService.list(),
          jobMatchService.list(),
          interviewService.list()
        ]);

        const avgAts = resumes.length > 0
          ? Math.round(resumes.reduce((acc, curr) => acc + (curr.extracted_data?.ats_score || 0), 0) / resumes.length)
          : 0;

        setStats({
          resumesCount: resumes.length,
          matchesCount: matches.length,
          interviewsCount: interviews.length,
          averageAts: avgAts
        });

        setRecentResumes(resumes.slice(0, 3));
      } catch (err) {
        console.error("Dashboard data load failed:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  if (loading) {
    return <LoadingState text="Preparing dashboard interface..." />;
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Banner Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-slate-900 flex flex-col justify-between h-32 py-4">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Average ATS Score</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold font-display text-glow-teal">
              {stats.averageAts > 0 ? `${stats.averageAts}%` : 'N/A'}
            </span>
            <span className="text-xs text-slate-400">across scans</span>
          </div>
        </Card>

        <Card className="border border-slate-900 flex flex-col justify-between h-32 py-4">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Resumes Indexed</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold font-display text-white">{stats.resumesCount}</span>
            <span className="text-xs text-slate-400">documents</span>
          </div>
        </Card>

        <Card className="border border-slate-900 flex flex-col justify-between h-32 py-4">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Comparisons Made</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold font-display text-white">{stats.matchesCount}</span>
            <span className="text-xs text-slate-400">jobs evaluated</span>
          </div>
        </Card>

        <Card className="border border-slate-900 flex flex-col justify-between h-32 py-4">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Interview Sessions</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold font-display text-white">{stats.interviewsCount}</span>
            <span className="text-xs text-slate-400">practices conducted</span>
          </div>
        </Card>
      </div>

      {/* Main Workspace Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card
          title="Upload Resume"
          subtitle="Analyze structure and test layout"
          className="border border-slate-900 hover:border-slate-800"
          actions={
            <Link to={ROUTES.UPLOAD}>
              <Button variant="secondary" size="sm" icon={FileUp}>Upload</Button>
            </Link>
          }
        >
          <p className="text-xs text-slate-400 leading-normal">
            Select a PDF resume file. Our system parses formatting, identifies key technical parameters, and lists structural enhancements.
          </p>
        </Card>

        <Card
          title="Job Matcher"
          subtitle="Check role alignment scores"
          className="border border-slate-900 hover:border-slate-800"
          actions={
            <Link to={ROUTES.JOB_MATCH}>
              <Button variant="secondary" size="sm" icon={Briefcase}>Analyze</Button>
            </Link>
          }
        >
          <p className="text-xs text-slate-400 leading-normal">
            Paste target descriptions to map skill alignment levels, finding keyword gaps and optimization steps to pass screening criteria.
          </p>
        </Card>

        <Card
          title="Interview Coach"
          subtitle="Simulate practice rounds"
          className="border border-slate-900 hover:border-slate-800"
          actions={
            <Link to={ROUTES.INTERVIEW_COACH}>
              <Button variant="secondary" size="sm" icon={MessagesSquare}>Start</Button>
            </Link>
          }
        >
          <p className="text-xs text-slate-400 leading-normal">
            Conduct dynamic chat conversations tailored to selected job tracks, receiving evaluations and response feedback.
          </p>
        </Card>
      </div>

      {/* Recent Resumes & Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card
          title="Recent Uploads"
          subtitle="Quick access to active resume files"
          className="lg:col-span-2 border border-slate-900"
          actions={
            stats.resumesCount > 3 && (
              <Link to={ROUTES.HISTORY} className="text-xs text-brand-400 hover:text-brand-300 font-medium flex items-center gap-1">
                View All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )
          }
        >
          {recentResumes.length === 0 ? (
            <div className="text-center py-8 text-slate-500 flex flex-col items-center">
              <FileText className="w-8 h-8 text-slate-700 mb-2" />
              <p className="text-xs">No resume files found in active storage.</p>
              <Link to={ROUTES.UPLOAD} className="mt-3">
                <Button variant="outline" size="sm">Upload First CV</Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-900">
              {recentResumes.map((resume) => (
                <div key={resume.id} className="py-3.5 flex items-center justify-between first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-slate-400" />
                    <div>
                      <h4 className="text-xs font-semibold text-slate-200">{resume.filename}</h4>
                      <p className="text-[10px] text-slate-500">Scanned on {formatDate(resume.created_at)}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full border font-bold ${
                    resume.extracted_data?.ats_score >= 80 ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                  }`}>
                    {resume.extracted_data?.ats_score}% ATS
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Activity log */}
        <Card title="Activity Feed" subtitle="Audit log of active actions" className="border border-slate-900">
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-400 shrink-0 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-200">Database connected</p>
                <p className="text-[10px] text-slate-500">Authentication token validated</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 text-indigo-400 shrink-0 mt-0.5">
                <MessagesSquare className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-200">Interview simulator loaded</p>
                <p className="text-[10px] text-slate-500">Coach script templates ready</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
export default Dashboard;
