import React, { useState } from 'react';
import { CheckCircle2, FileText, ChevronDown, ChevronUp, FileCode, Users, ListFilter } from 'lucide-react';
import { Card } from './Card';
import { Button } from './Button';
import { formatDate, formatFileSize, getAtsScoreColor } from '../utils/helpers';

export const ParsedResultPanel = ({ result, onReset }) => {
  const [showRawText, setShowRawText] = useState(false);
  
  if (!result) return null;

  const score = result.extracted_data?.ats_score || 0;
  const skills = result.extracted_data?.skills || [];
  const feedback = result.extracted_data?.ats_feedback || [];
  const metadata = result.extracted_data?.metadata || {};
  const contact = result.extracted_data?.contact_info || {};

  return (
    <div className="space-y-6 animate-fade-in w-full">
      <Card
        title="ATS Score Assessment"
        subtitle={`Audit analysis for ${result.filename}`}
        actions={
          <Button variant="outline" size="sm" onClick={onReset}>
            Upload Another
          </Button>
        }
        className="border border-brand-500/25"
      >
        <div className="space-y-6">
          {/* Main stats overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-slate-900 pb-6">
            
            {/* ATS Score card */}
            <div className="flex items-center gap-4 bg-slate-950/40 p-4 rounded-xl border border-slate-900">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center font-display font-extrabold text-base border-2 ${getAtsScoreColor(score)}`}>
                {score}%
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-200">ATS Compliance</h4>
                <p className="text-[10px] text-slate-500 mt-0.5">Layout structures reviewed</p>
              </div>
            </div>

            {/* Structured Metadata card */}
            <div className="flex items-center gap-4 bg-slate-950/40 p-4 rounded-xl border border-slate-900">
              <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-semibold text-slate-200">PDF Metadata</h4>
                <p className="text-[9px] text-slate-400 mt-0.5 truncate">
                  Pages: {metadata.page_count || 1} • {metadata.word_count || 0} words
                </p>
                <p className="text-[9px] text-slate-550 truncate">
                  Size: {formatFileSize(metadata.file_size || result.file_size)}
                </p>
              </div>
            </div>

            {/* User Contacts card */}
            <div className="flex items-center gap-4 bg-slate-950/40 p-4 rounded-xl border border-slate-900">
              <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-semibold text-slate-200">Extracted Contacts</h4>
                <p className="text-[9px] text-slate-400 truncate">{contact.email || 'No email identified'}</p>
                <p className="text-[9px] text-slate-450 truncate">{contact.phone || 'No phone identified'}</p>
              </div>
            </div>

          </div>

          {/* Identified skills */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
              <ListFilter className="w-4 h-4 text-slate-500" />
              Identified Keywords ({skills.length})
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {skills.map((skill, index) => (
                <span key={index} className="text-[10px] bg-slate-900 border border-slate-850 px-2.5 py-1 rounded-lg text-slate-300">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Improvements checklist */}
          <div className="space-y-3 border-t border-slate-900 pt-5">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Structure Recommendations</h4>
            <div className="space-y-2.5">
              {feedback.map((tip, idx) => (
                <div key={idx} className="flex gap-2.5 items-start text-xs text-slate-300 leading-normal">
                  <CheckCircle2 className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" />
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Raw Text Accordion Toggle */}
          <div className="border-t border-slate-900 pt-5">
            <button
              type="button"
              onClick={() => setShowRawText(!showRawText)}
              className="flex items-center justify-between w-full py-2.5 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
            >
              <span className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-slate-500" />
                Raw Extracted Text Preview
              </span>
              {showRawText ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            
            {showRawText && (
              <div className="mt-3 text-[10px] text-slate-400 font-mono bg-slate-950 border border-slate-900 rounded-xl p-4 max-h-60 overflow-y-auto whitespace-pre-line leading-relaxed scrollbar-thin">
                {result.parsed_text || "No printable text content identified."}
              </div>
            )}
          </div>

        </div>
      </Card>
    </div>
  );
};
export default ParsedResultPanel;
