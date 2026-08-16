import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, FileText, CheckCircle2, AlertCircle, RefreshCw, Star, Info, HelpCircle } from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useToast } from '../components/Toast';
import { LoadingState } from '../components/LoadingState';
import { resumeService } from '../services/resumeService';
import { jobMatchService } from '../services/jobMatchService';
import { ROUTES } from '../utils/constants';

export const JobMatch = () => {
  const { addToast } = useToast();

  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [matching, setMatching] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const loadResumes = async () => {
      try {
        const data = await resumeService.list();
        setResumes(data);
        if (data.length > 0) {
          setSelectedResumeId(data[0].id.toString());
        }
      } catch (err) {
        addToast('Failed to load active resumes.', 'error');
      } finally {
        setLoading(false);
      }
    };
    loadResumes();
  }, []);

  const handleCompare = async (e) => {
    e.preventDefault();
    if (!selectedResumeId) {
      addToast('Please select a resume to compare.', 'error');
      return;
    }
    if (!jobTitle.trim() || !jobDescription.trim()) {
      addToast('Please enter both job title and description.', 'error');
      return;
    }

    setMatching(true);
    try {
      const matchResult = await jobMatchService.match(
        parseInt(selectedResumeId),
        jobTitle,
        jobDescription
      );
      setResult(matchResult);
      addToast('Job description mapping completed!', 'success');
    } catch (err) {
      addToast(err.message || 'Comparison failed.', 'error');
    } finally {
      setMatching(false);
    }
  };

  const handleReset = () => {
    setJobTitle('');
    setJobDescription('');
    setResult(null);
  };

  if (loading) {
    return <LoadingState text="Fetching documents for mapping..." />;
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Input Panel */}
        <form onSubmit={handleCompare} className="lg:col-span-7 space-y-6">
          <Card title="Job Description Mapper" subtitle="Match a resume against job requirements to audit overlap">
            
            {resumes.length === 0 ? (
              <div className="bg-slate-900/30 border border-slate-900 p-6 rounded-xl text-center space-y-4 mb-4">
                <FileText className="w-8 h-8 text-slate-700 mx-auto" />
                <p className="text-xs text-slate-400">You must upload a resume before you can perform job matching.</p>
                <Link to={ROUTES.UPLOAD}>
                  <Button size="sm">Go to Upload</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Select resume */}
                <div className="flex flex-col gap-1.5 w-full">
                  <label htmlFor="resume-select" className="text-xs font-medium text-slate-300">
                    Select Active Resume <span className="text-rose-500">*</span>
                  </label>
                  <select
                    id="resume-select"
                    value={selectedResumeId}
                    onChange={(e) => setSelectedResumeId(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-900/60 border border-slate-800/80 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-all duration-200"
                    required
                  >
                    {resumes.map((r) => (
                      <option key={r.id} value={r.id} className="bg-slate-950">
                        {r.filename} ({r.extracted_data?.ats_score}% ATS)
                      </option>
                    ))}
                  </select>
                </div>

                <Input
                  label="Target Job Title"
                  name="job_title"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g. Frontend Software Engineer"
                  icon={Briefcase}
                  required
                />

                <div className="flex flex-col gap-1.5 w-full">
                  <label htmlFor="job-desc" className="text-xs font-medium text-slate-300">
                    Job Description <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    id="job-desc"
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the full job posting details here..."
                    rows={8}
                    className="w-full px-4 py-3 bg-slate-900/60 border border-slate-800/80 rounded-xl text-slate-100 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-all duration-200"
                    required
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <Button
                    onClick={handleReset}
                    variant="secondary"
                    className="flex-1"
                    disabled={matching}
                  >
                    Reset
                  </Button>
                  <Button
                    type="submit"
                    loading={matching}
                    className="flex-1"
                    icon={Briefcase}
                  >
                    Compare Fit
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </form>

        {/* Output Panel */}
        <div className="lg:col-span-5">
          {result ? (
            <Card title="Matching Evaluation" subtitle={`Fit score against: ${result.job_title}`} className="border border-brand-500/20">
              <div className="space-y-6 animate-fade-in">
                
                {/* Circular indicator */}
                <div className="flex items-center gap-6 bg-slate-900/40 p-5 rounded-2xl border border-slate-800/80">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center font-display font-extrabold text-lg border-2 ${
                    result.match_score >= 70
                      ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400'
                      : 'border-amber-500/20 bg-amber-500/5 text-amber-400'
                  }`}>
                    {result.match_score}%
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-200">Role Compatibility</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Semantic keyword correlation calculated</p>
                  </div>
                </div>

                {/* Overlapping skills */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Matching Skill Keywords
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {result.match_details?.matching_skills?.map((skill, idx) => (
                      <span key={idx} className="text-[9px] bg-emerald-950/20 border border-emerald-500/20 px-2 py-0.5 rounded text-emerald-300">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Gaps */}
                <div className="space-y-2 border-t border-slate-900 pt-4">
                  <h4 className="text-xs font-semibold text-rose-400 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Missing Requirements Gaps
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {result.match_details?.missing_skills?.map((skill, idx) => (
                      <span key={idx} className="text-[9px] bg-rose-950/20 border border-rose-500/20 px-2 py-0.5 rounded text-rose-300">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Optimization advice */}
                <div className="space-y-3 border-t border-slate-900 pt-4">
                  <p className="text-xs font-semibold text-slate-400">Optimization Guidelines</p>
                  <div className="space-y-2">
                    {result.match_details?.recommendations?.map((tip, idx) => (
                      <div key={idx} className="flex gap-2 items-start text-[10px] text-slate-300 leading-normal">
                        <Info className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                        <span>{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </Card>
          ) : (
            <div className="h-full min-h-[350px] border border-slate-900 bg-slate-900/10 rounded-2xl flex items-center justify-center text-center p-6 text-slate-500">
              <div className="max-w-xs space-y-2">
                <Briefcase className="w-8 h-8 text-slate-800 mx-auto mb-2" />
                <p className="text-xs font-medium text-slate-400">Awaiting matching metrics</p>
                <p className="text-[10px] text-slate-500">Select a resume file and paste a job posting to perform requirement alignment checks.</p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
export default JobMatch;
