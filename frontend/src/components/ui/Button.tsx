import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className = '',
  ...props
}) => {
  const base = "font-medium rounded-lg transition-all flex items-center justify-center gap-2 border disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-[0.98]";

  const variants = {
    primary: "bg-blue-600 hover:bg-blue-500 text-white border-blue-500/50 shadow-sm shadow-blue-500/20",
    secondary: "bg-gray-800 hover:bg-gray-700 text-gray-200 border-gray-700/80 shadow-sm",
    danger: "bg-rose-600 hover:bg-rose-500 text-white border-rose-500/50 shadow-sm shadow-rose-900/20",
    ghost: "bg-transparent hover:bg-gray-800/60 text-gray-300 border-transparent"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "w-full py-2.5 text-base"
  };

  return (
    <button 
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} 
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
};