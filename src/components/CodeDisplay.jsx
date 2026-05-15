import React from "react";
import { Hash } from "lucide-react";

const CodeDisplay = ({
  code,
  position = "top-right",
  label = "CODE",
  tone = "dark",
}) => {
  if (!code) return null;

  const positionClasses = {
    "top-right": "top-4 right-4",
    "top-left": "top-4 left-4",
    "bottom-right": "bottom-4 right-4",
    "bottom-left": "bottom-4 left-4",
  };

  const toneClasses = {
    dark: `
      border-[#d8b46a]/35
      bg-[#123f59]/95
      text-[#e2bf74]
      shadow-[0_10px_24px_rgba(18,63,89,0.22)]
    `,
    light: `
      border-[#d8b46a]/40
      bg-[#fbf8f1]/95
      text-[#123f59]
      shadow-[0_10px_24px_rgba(18,63,89,0.10)]
    `,
    gold: `
      border-[#d8b46a]/50
      bg-[#f8efe0]/95
      text-[#9a6b16]
      shadow-[0_10px_24px_rgba(197,152,60,0.14)]
    `,
  };

  return (
    <div
      className={`
        pointer-events-none absolute z-50
        ${positionClasses[position] || positionClasses["top-right"]}
      `}
    >
      <div
        className={`
          flex items-center gap-1.5 rounded-2xl border
          px-3 py-1.5 backdrop-blur-md
          transition-all duration-300
          ${toneClasses[tone] || toneClasses.dark}
        `}
      >
        <Hash className="h-3 w-3 shrink-0" />

        <span className="text-[9px] font-black opacity-70">
          {label}
        </span>

        <span className="font-mono text-[10px] font-black tracking-wide">
          {code}
        </span>
      </div>
    </div>
  );
};

export default CodeDisplay;