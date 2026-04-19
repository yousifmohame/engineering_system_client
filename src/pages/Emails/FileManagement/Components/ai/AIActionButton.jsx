import React from 'react';
import { Sparkles, Loader2 } from 'lucide-react';

export function AIActionButton({ onClick, label, loading, variant = 'primary', className = '', size = 'md' }) {
  
  const baseClasses = "inline-flex items-center justify-center gap-2 font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed rounded-xl";
  
  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  const variants = {
    primary: "bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700 shadow-sm shadow-indigo-200",
    secondary: "bg-indigo-50 text-indigo-700 hover:bg-indigo-100",
    outline: "border border-indigo-200 text-indigo-700 hover:bg-indigo-50",
    ghost: "text-indigo-600 hover:bg-indigo-50"
  };

  return (
    <button 
      onClick={onClick}
      disabled={loading}
      className={`${baseClasses} ${sizes[size]} ${variants[variant]} ${className}`}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
      {label}
    </button>
  );
}