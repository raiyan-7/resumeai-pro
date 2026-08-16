import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from './Button';

export const ErrorFallback = ({ error, resetErrorBoundary }) => {
  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-6 text-slate-100">
      <div className="max-w-md w-full glass-card p-8 border border-rose-500/20 text-center flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/25 flex items-center justify-center text-rose-500 mb-6">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold font-display text-slate-100 mb-2">Something went wrong</h2>
        <p className="text-slate-400 text-sm mb-6">
          An unexpected application crash occurred: <code className="text-rose-400 block mt-2 text-xs bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 font-mono">{error?.message || "Unknown client error"}</code>
        </p>
        <Button
          onClick={resetErrorBoundary || (() => window.location.reload())}
          variant="secondary"
          icon={RotateCcw}
        >
          Reload Application
        </Button>
      </div>
    </div>
  );
};
export default ErrorFallback;
