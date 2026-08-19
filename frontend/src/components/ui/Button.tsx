import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}) => {
  const base = "font-semibold rounded-xl transition-all flex items-center justify-center gap-2 border disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";

  const variants = {
    primary: "bg-emerald-500 hover:bg-emerald-600 text-slate-950 border-emerald-400/30 shadow-lg shadow-emerald-500/10",
    secondary: "bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700",
    ghost: "bg-transparent hover:bg-slate-800/60 text-slate-400 hover:text-slate-200 border-transparent",
    danger: "bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border-rose-500/20"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2.5 text-sm",
    lg: "w-full py-3 text-sm"
  };

  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  );
};