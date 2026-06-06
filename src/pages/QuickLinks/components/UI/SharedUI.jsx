import React from "react";

export const MiniStatCard = ({ icon: Icon, label, value, tone }) => {
  const tones = {
    blue: "border-cyan-300/35 bg-cyan-400/[0.18] text-cyan-50",
    gold: "border-[#e2bf74]/45 bg-[#e2bf74]/20 text-[#fff4cc]",
    red: "border-rose-300/35 bg-rose-400/[0.18] text-rose-50",
  };

  return (
    <div
      className={`flex min-w-[58px] items-center gap-1.5 rounded-xl border px-2 py-1.5 backdrop-blur-md ${tones[tone] || tones.blue}`}
    >
      <Icon className="h-3.5 w-3.5" />
      <div>
        <div className="font-mono text-[11px] font-black text-white">{value}</div>
        <div className="text-[7px] font-bold text-white/65">{label}</div>
      </div>
    </div>
  );
};

export const ActionToolButton = ({ label, title, tone = "slate", onClick, children, disabled }) => {
  const tones = {
    slate: "border-slate-200 bg-white text-slate-500 hover:border-[#d8b46a]/50 hover:bg-[#f8efe0] hover:text-[#123f59]",
    gold: "border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-100",
    cyan: "border-cyan-200 bg-cyan-50 text-cyan-700 hover:bg-cyan-100",
    rose: "border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100",
  };

  return (
    <button
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={`flex min-w-[54px] flex-col items-center justify-center gap-0.5 rounded-xl border px-1.5 py-1 transition-all duration-200 hover:-translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed ${tones[tone] || tones.slate}`}
      type="button"
    >
      <span className="text-[8px] font-black leading-none">{label}</span>
      {children}
    </button>
  );
};