import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'positive' | 'negative' | 'neutral';
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'neutral' }) => {
  const styles = {
    positive: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    negative: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    neutral: 'bg-slate-800 text-slate-400 border-slate-700'
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${styles[variant]}`}>
      {children}
    </span>
  );
};