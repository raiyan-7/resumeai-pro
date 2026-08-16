import React, { useState, useEffect } from 'react';
import { FileText, Calendar, Eye, Trash2, X, Download, Star, MapPin, Mail, Phone, ChevronRight } from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { useToast } from '../components/Toast';
import { LoadingState } from '../components/LoadingState';
import { resumeService } from '../services/resumeService';
import { formatDate, formatFileSize } from '../utils/helpers';

export const ResumeHistory = () => {
  const { addToast } = useToast();
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedResume, setSelectedResume] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchResumes = async () => {
    try {
      const data = await resumeService.list();
      setResumes(data);
    } catch (err) {
      addToast(err.message || 'Failed to fetch resume history.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this resume?")) return;
    
    try {
      await resumeService.delete(id);
      setResumes((prev) => prev.filter((r) => r.id !== id));
      addToast('Resume entry deleted.', 'success');
      if (selectedResume?.id === id) {
        setSelectedResume(null);
      }
    } catch (err) {
      addToast(err.message || 'Failed to delete resume entry.', 'error');
    }
  };

  const handleViewPdf = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/resumes/${id}/file`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to retrieve PDF file.');
      }
      const blob = await response.blob();
      const fileURL = URL.createObjectURL(blob);
      window.open(fileURL, '_blank');
    } catch (err) {
      addToast(err.message || 'Failed to open PDF file.', 'error');
    }
  };

  const handleOpenDetail = async (id) => {
    setDetailLoading(true);
    try {
      const detail = await resumeService.get(id);
      setSelectedResume(detail);
    } catch (err) {
      addToast(err.message || 'Failed to load details.', 'error');
    } finally {
      setDetailLoading(false);
    }
  };

  if (loading) {
    return <LoadingState text="Loading resume history index..." />;
  }

  return (
    <div className="space-y-8 animate-fade-in relative">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* List Panel */}
        <div className="lg:col-span-2 space-y-4">
          <Card title="Scanned Resumes" subtitle="Select a file record to examine metadata findings">
            {resumes.length === 0 ? (
              <div className="text-center py-12 text-slate-500 flex flex-col items-center">
                <FileText className="w-10 h-10 text-slate-800 mb-2" />
                <p className="text-sm font-medium">No resumes scanned yet</p>
                <p className="text-xs text-slate-600 mt-1">Upload a PDF resume from the upload page to see it here.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {resumes.map((resume) => {
                  const isSelected = selectedResume?.id === resume.id;
                  const score = resume.extracted_data?.ats_score || 0;
                  
                  return (
                    <div
                      key={resume.id}
                      onClick={() => handleOpenDetail(resume.id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                        isSelected
                          ? 'bg-slate-900 border-brand-500/35 shadow-lg shadow-brand-500/5'
                          : 'bg-slate-900/40 border-slate-900 hover:border-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400">
                          <FileText className="w-4.5 h-4.5" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-semibold text-slate-200 truncate">{resume.filename}</h4>
                          <div className="flex items-center gap-3 text-[10px] text-slate-500 mt-1">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(resume.created_at)}
                            </span>
                            <span>•</span>
                            <span>{formatFileSize(resume.file_size)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className={`text-xs px-2.5 py-1 rounded-full border font-bold ${
                          score >= 80 ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                        }`}>
                          {score}% ATS
                        </span>
                        
                        <button
                          onClick={(e) => handleViewPdf(resume.id, e)}
                          className="p-2 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition-all border border-transparent"
                          title="View Resume PDF"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        
                        <button
                          onClick={(e) => handleDelete(resume.id, e)}
                          className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/20 transition-all border border-transparent"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        
                        <ChevronRight className="w-4 h-4 text-slate-600 hidden sm:block" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Details Panel */}
        <div className="lg:col-span-1">
          {detailLoading ? (
            <Card title="Loading File Metadata" className="h-full">
              <LoadingState text="Parsing JSON structure..." />
            </Card>
          ) : selectedResume ? (
            <Card
              title={selectedResume.filename}
              subtitle="Comprehensive Resume Analysis"
              actions={
                <button
                  onClick={() => setSelectedResume(null)}
                  className="p-1 text-slate-400 hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              }
              className="border border-slate-800"
            >
              <div className="space-y-6">
                {/* Score */}
                <div className="flex items-center gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800/80">
                  <div className="w-14 h-14 rounded-full border-2 border-brand-500/25 flex items-center justify-center font-display font-extrabold text-base text-brand-400 bg-brand-500/5">
                    {selectedResume.extracted_data?.ats_score}%
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-200">ATS Formatting Index</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">Parsed structure validated</p>
                  </div>
                </div>

                {/* View Original PDF Button */}
                <Button
                  onClick={(e) => handleViewPdf(selectedResume.id, e)}
                  variant="secondary"
                  className="w-full flex items-center justify-center gap-2"
                  icon={Eye}
                >
                  View Original PDF
                </Button>

                {/* Contact info */}
                <div className="space-y-2 border-t border-slate-900 pt-4">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Contact Info</h4>
                  <div className="space-y-1.5 text-[10px] text-slate-300">
                    {selectedResume.extracted_data?.contact_info?.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-slate-500" />
                        <span>{selectedResume.extracted_data.contact_info.email}</span>
                      </div>
                    )}
                    {selectedResume.extracted_data?.contact_info?.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-500" />
                        <span>{selectedResume.extracted_data.contact_info.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Skills */}
                <div className="space-y-2 border-t border-slate-900 pt-4">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Parsed Skills</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedResume.extracted_data?.skills?.map((skill, index) => (
                      <span key={index} className="text-[9px] bg-slate-900/80 border border-slate-800 px-2 py-0.5 rounded text-slate-300">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Text extract preview */}
                <div className="space-y-2 border-t border-slate-900 pt-4">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Raw Text Preview</h4>
                  <div className="text-[9px] text-slate-500 max-h-32 overflow-y-auto font-mono bg-slate-900/40 p-2.5 rounded-lg border border-slate-900/80 whitespace-pre-line leading-relaxed">
                    {selectedResume.parsed_text || "No text could be extracted."}
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            <div className="h-full min-h-[300px] border border-slate-900 bg-slate-900/10 rounded-2xl flex items-center justify-center text-center p-6 text-slate-500">
              <div className="max-w-xs space-y-2">
                <FileText className="w-8 h-8 text-slate-800 mx-auto mb-2" />
                <p className="text-xs font-medium text-slate-400">Select a resume file</p>
                <p className="text-[10px] text-slate-500">Click on any resume entry in the list to load and inspect parsed details.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default ResumeHistory;
