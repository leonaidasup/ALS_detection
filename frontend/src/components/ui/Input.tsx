import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: LucideIcon;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, icon: Icon, error, className = '', ...props }) => {
  return (
    <div className="w-full">
      {label && <label className="block text-xs font-medium text-slate-400 mb-1">{label}</label>}
      <div className="relative">
        {Icon && <Icon className="w-4 h-4 absolute left-3 top-3 text-slate-500" />}
        <input
          className={`w-full bg-slate-800 border border-slate-700 text-slate-100 rounded-xl py-2.5 text-sm focus:outline-none focus:border-emerald-500 placeholder-slate-500 ${Icon ? 'pl-9 pr-4' : 'px-4'} ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-rose-400 mt-1">{error}</p>}
    </div>
  );
};