import React from "react";
import { Sparkles, Loader2 } from "lucide-react";

export function AIActionButton({
  onClick,
  label,
  loading,
  variant = "primary",
  className = "",
  size = "md",
}) {
  const baseClasses = `
    inline-flex items-center justify-center gap-2
    rounded-2xl font-black transition-all duration-300
    disabled:cursor-not-allowed disabled:opacity-60
    focus:outline-none focus:ring-4 focus:ring-[#c5983c]/15
  `;

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  const variants = {
    primary: `
      border border-[#d8b46a]/40
      bg-gradient-to-l from-[#123f59] via-[#15536f] to-[#0e7490]
      text-white shadow-[0_12px_26px_rgba(18,63,89,0.22)]
      hover:-translate-y-[1px]
      hover:shadow-[0_16px_34px_rgba(18,63,89,0.28)]
    `,

    secondary: `
      border border-[#d8b46a]/30
      bg-[#f8efe0]
      text-[#123f59]
      hover:bg-[#f3e2be]
      hover:text-[#0f3448]
    `,

    outline: `
      border border-[#d8b46a]/45
      bg-white
      text-[#123f59]
      hover:bg-[#f8efe0]
      hover:text-[#c5983c]
    `,

    ghost: `
      border border-transparent
      bg-transparent
      text-[#123f59]
      hover:bg-[#f8efe0]
      hover:text-[#c5983c]
    `,
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className={`
        ${baseClasses}
        ${sizes[size] || sizes.md}
        ${variants[variant] || variants.primary}
        ${className}
      `}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin text-[#e2bf74]" />
      ) : (
        <Sparkles className="h-4 w-4 text-[#e2bf74]" />
      )}

      <span>{loading ? "جاري المعالجة..." : label}</span>
    </button>
  );
}