import React from 'react';

export const Card = ({
  children,
  title,
  subtitle,
  actions,
  hoverGlow = false,
  className = '',
  bodyClassName = '',
}) => {
  return (
    <div className={`glass-card ${hoverGlow ? 'glass-card-hover' : ''} ${className}`}>
      {(title || subtitle || actions) && (
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between flex-wrap gap-4">
          <div>
            {title && <h3 className="text-lg font-medium text-slate-800 dark:text-slate-100 font-display">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className={`p-6 ${bodyClassName}`}>
        {children}
      </div>
    </div>
  );
};
export default Card;
