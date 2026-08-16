import React, { useState } from 'react';
import { DragDropUpload } from '../components/DragDropUpload';
import { ParsedResultPanel } from '../components/ParsedResultPanel';

export const ResumeUpload = () => {
  const [result, setResult] = useState(null);

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex flex-col gap-1.5 border-b border-slate-900 pb-5">
        <h1 className="text-2xl font-bold font-display text-white tracking-tight">Upload Resume</h1>
        <p className="text-xs text-slate-400">
          Upload your resume in PDF format to parse content structures and identify ATS optimization factors.
        </p>
      </div>

      {!result ? (
        <DragDropUpload onUploadSuccess={(data) => setResult(data)} />
      ) : (
        <ParsedResultPanel result={result} onReset={() => setResult(null)} />
      )}
    </div>
  );
};

export default ResumeUpload;
