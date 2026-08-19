import React from 'react';

export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-slate-900 border border-slate-800 rounded-2xl p-6 ${className}`}>
    {children}
  </div>
);