import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: LucideIcon;
  error?: string;
  hint?: string;
}

export const Input: React.FC<InputProps> = ({ 
  label, 
  icon: Icon, 
  error, 
  hint,
  className = '', 
  ...props 
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
          {label}
          {props.required && <span className="text-rose-400 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && <Icon className="w-4 h-4 absolute left-3 top-3 text-gray-400" />}
        <input
          className={`
            w-full bg-gray-950/80 border text-gray-100 rounded-lg text-sm 
            focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20
            placeholder-gray-500 transition-all
            ${Icon ? 'pl-9 pr-3' : 'px-3'} 
            py-2
            ${error ? 'border-rose-500/80 bg-rose-950/20' : 'border-gray-700/80'}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && <p className="text-rose-400 text-xs mt-1.5 font-medium">{error}</p>}
      {hint && !error && <p className="text-gray-400 text-xs mt-1.5">{hint}</p>}
    </div>
  );
};