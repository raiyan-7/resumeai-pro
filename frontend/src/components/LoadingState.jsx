import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingState = ({
  type = 'spinner', // 'spinner' or 'skeleton'
  text = 'Loading details...',
  rows = 3,
  className = '',
}) => {
  if (type === 'skeleton') {
    return (
      <div className={`space-y-4 animate-pulse w-full ${className}`}>
        {Array.from({ length: rows }).map((_, idx) => (
          <div key={idx} className="space-y-2">
            <div className="h-4 bg-slate-800 rounded-md w-1/4"></div>
            <div className="h-10 bg-slate-800/60 rounded-xl w-full"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 w-full ${className}`}>
      <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
      {text && <p className="text-slate-400 text-sm mt-4 font-medium animate-pulse">{text}</p>}
    </div>
  );
};
export default LoadingState;
