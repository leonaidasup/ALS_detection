import React from 'react';

export const Card: React.FC<{ 
  children: React.ReactNode; 
  className?: string;
  elevated?: boolean;
}> = ({ children, className = '', elevated = false }) => (
  <div className={`
    bg-white dark:bg-gray-800/90 
    border border-slate-200 dark:border-gray-700/70 
    text-slate-900 dark:text-gray-100
    rounded-xl p-6 
    ${elevated 
      ? 'shadow-lg border-slate-300 dark:shadow-xl dark:shadow-black/40 dark:border-gray-600/80' 
      : 'shadow-sm dark:shadow-md'
    } 
    transition-all hover:border-slate-300 dark:hover:border-gray-600
    ${className}
  `}>
    {children}
  </div>
);