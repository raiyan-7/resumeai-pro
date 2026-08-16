import React, { useState, useRef, useEffect } from 'react';
import { Upload, FileText, Loader2, Sparkles } from 'lucide-react';
import { Button } from './Button';
import { useToast } from './Toast';
import { resumeService } from '../services/resumeService';

export const DragDropUpload = ({ onUploadSuccess }) => {
  const { addToast } = useToast();
  
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState('');
  
  const fileInputRef = useRef(null);

  // Simulated progress loader during API call
  useEffect(() => {
    let interval;
    if (uploading) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev < 30) {
            setStage('Uploading PDF document...');
            return prev + 5;
          } else if (prev < 70) {
            setStage('Extracting text using PyMuPDF...');
            return prev + 3;
          } else if (prev < 95) {
            setStage('Analyzing ATS compliance standards...');
            return prev + 1;
          }
          return prev;
        });
      }, 150);
    } else {
      setProgress(0);
      setStage('');
    }
    return () => clearInterval(interval);
  }, [uploading]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    // 1. Enforce PDF only
    if (selectedFile.type !== 'application/pdf' && !selectedFile.name.toLowerCase().endsWith('.pdf')) {
      addToast('Only PDF files are currently supported.', 'error');
      return;
    }
    
    // 2. Enforce Max 10MB
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (selectedFile.size > MAX_SIZE) {
      addToast('File size exceeds the maximum limit of 10 MB.', 'error');
      return;
    }

    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setProgress(5);
    try {
      const data = await resumeService.upload(file);
      setProgress(100);
      setStage('Completed!');
      setTimeout(() => {
        onUploadSuccess(data);
        addToast('Resume uploaded and processed successfully!', 'success');
      }, 300);
    } catch (err) {
      addToast(err.message || 'Failed to process resume. Please try again.', 'error');
      setFile(null);
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
  };

  return (
    <div className="w-full">
      {!file ? (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current.click()}
          className={`border-2 border-dashed rounded-2xl p-12 text-center flex flex-col items-center justify-center cursor-pointer transition-all ${
            dragActive
              ? 'border-brand-500 bg-brand-500/5'
              : 'border-slate-850 hover:border-slate-700 bg-slate-900/10'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleChange}
            className="hidden"
          />
          <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-850 flex items-center justify-center text-slate-400 mb-4">
            <Upload className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-semibold text-slate-200">Drag & drop your PDF file</h4>
          <p className="text-xs text-slate-500 mt-1">or click to browse local storage</p>
          <span className="text-[10px] text-slate-650 bg-slate-900/40 px-2 py-1 rounded border border-slate-900/50 mt-4">
            PDF format, maximum 10MB
          </span>
        </div>
      ) : (
        <div className="bg-slate-900/40 border border-slate-850/80 p-8 rounded-2xl flex flex-col items-center text-center">
          <FileText className="w-12 h-12 text-brand-400 mb-3" />
          <h4 className="text-sm font-semibold text-slate-200 truncate max-w-xs">{file.name}</h4>
          <p className="text-xs text-slate-500 mt-0.5">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
          
          {uploading ? (
            <div className="w-full max-w-xs mt-6 space-y-3">
              {/* Progress Bar Container */}
              <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-905">
                <div
                  className="bg-gradient-to-r from-brand-500 to-accent-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-500" />
                <span className="font-medium">{stage} ({progress}%)</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 mt-6 w-full max-w-xs">
              <Button
                onClick={handleReset}
                variant="secondary"
                className="flex-1"
                disabled={uploading}
              >
                Clear
              </Button>
              <Button
                onClick={handleUpload}
                loading={uploading}
                className="flex-1"
              >
                Process File
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
export default DragDropUpload;
