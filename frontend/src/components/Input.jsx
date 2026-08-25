import React from 'react';

export const Input = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder = '',
  error = '',
  required = false,
  className = '',
  disabled = false,
  icon: Icon = null,
}) => {
  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      {label && (
        <label htmlFor={name} className="text-xs font-medium text-slate-700 dark:text-slate-300">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`w-full px-4 py-3 bg-white dark:bg-slate-900/60 border rounded-xl text-slate-900 dark:text-slate-100 text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ${
            Icon ? 'pl-11' : ''
          } ${
            error ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-200 dark:border-slate-800/80 focus:border-brand-500'
          }`}
        />
      </div>
      {error && <span className="text-xs text-rose-500 mt-0.5">{error}</span>}
    </div>
  );
};
export default Input;
