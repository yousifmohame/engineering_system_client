import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

/* ═══════════════════════════════════════════════════════════════
   Smart Dropdown Button - Enterprise Action Button with Dropdown
   ═══════════════════════════════════════════════════════════════ */

const colorMap = {
  blue: {
    btn: `
      bg-[#123f59] text-white
      hover:bg-[#0f3448]
      shadow-[0_10px_24px_rgba(18,63,89,0.18)]
    `,
    arrow: `
      bg-[#0f3448] text-[#e2bf74]
      border-[#d8b46a]/25
      hover:bg-[#08111c]
    `,
    menu: "border-[#d8b46a]/35",
    hoverItem: "hover:bg-[#f8efe0]",
    iconColor: "text-[#c5983c]",
  },

  purple: {
    btn: `
      bg-purple-600 text-white
      hover:bg-purple-700
      shadow-[0_10px_24px_rgba(147,51,234,0.16)]
    `,
    arrow: `
      bg-purple-700 text-white
      border-purple-500/40
      hover:bg-purple-800
    `,
    menu: "border-purple-200",
    hoverItem: "hover:bg-purple-50",
    iconColor: "text-purple-600",
  },

  green: {
    btn: `
      bg-emerald-600 text-white
      hover:bg-emerald-700
      shadow-[0_10px_24px_rgba(16,185,129,0.16)]
    `,
    arrow: `
      bg-emerald-700 text-white
      border-emerald-500/40
      hover:bg-emerald-800
    `,
    menu: "border-emerald-200",
    hoverItem: "hover:bg-emerald-50",
    iconColor: "text-emerald-600",
  },

  red: {
    btn: `
      bg-rose-600 text-white
      hover:bg-rose-700
      shadow-[0_10px_24px_rgba(244,63,94,0.16)]
    `,
    arrow: `
      bg-rose-700 text-white
      border-rose-500/40
      hover:bg-rose-800
    `,
    menu: "border-rose-200",
    hoverItem: "hover:bg-rose-50",
    iconColor: "text-rose-600",
  },

  slate: {
    btn: `
      bg-slate-700 text-white
      hover:bg-slate-800
      shadow-[0_10px_24px_rgba(15,23,42,0.16)]
    `,
    arrow: `
      bg-slate-800 text-[#e2bf74]
      border-slate-600
      hover:bg-slate-900
    `,
    menu: "border-slate-200",
    hoverItem: "hover:bg-slate-50",
    iconColor: "text-slate-600",
  },
};

export function SmartDropdownButton({
  label,
  icon,
  options,
  color,
  onSelect,
  onMainClick,
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };

    document.addEventListener("mousedown", handler);

    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const c = colorMap[color] || colorMap.blue;

  return (
    <div
      ref={ref}
      className="relative inline-flex"
      style={{ fontFamily: "Tajawal, sans-serif" }}
      dir="rtl"
    >
      {/* Split Button */}
      <div
        className="
          flex items-center overflow-hidden
          rounded-2xl border border-white/15
          bg-white/10 shadow-sm
          transition-all duration-200
          hover:-translate-y-[1px]
          hover:shadow-[0_14px_34px_rgba(18,63,89,0.16)]
        "
      >
        <button
          onClick={() => {
            onMainClick?.();
          }}
          className={`
            flex h-9 items-center gap-1.5
            px-3.5 text-[11px] font-black
            transition-all duration-200
            ${c.btn}
          `}
          type="button"
        >
          {icon && <span className="shrink-0">{icon}</span>}
          <span className="whitespace-nowrap">{label}</span>
        </button>

        <button
          onClick={() => setOpen(!open)}
          className={`
            flex h-9 w-9 items-center justify-center
            border-r transition-all duration-200
            ${c.arrow}
          `}
          type="button"
        >
          <ChevronDown
            size={14}
            className={`transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      {/* Dropdown Menu */}
      {open && (
        <div
          className={`
            absolute left-0 top-full z-50 mt-2
            w-64 overflow-hidden rounded-2xl
            border bg-white
            shadow-[0_20px_50px_rgba(15,23,42,0.22)]
            animate-in fade-in slide-in-from-top-1 duration-150
            ${c.menu}
          `}
        >
          <div
            className="
              border-b border-[#e8ddc8]
              bg-gradient-to-l from-[#f8efe0] via-white to-[#eef7f6]
              px-3 py-2
            "
          >
            <div className="text-[10px] font-black text-[#64748b]">
              خيارات الإجراء
            </div>

            <div className="mt-0.5 truncate text-[11px] font-black text-[#123f59]">
              {label}
            </div>
          </div>

          <div className="custom-scrollbar-slim max-h-72 overflow-y-auto p-1.5">
            {options.map((opt, i) => (
              <div key={opt.id}>
                {opt.divider && i > 0 && (
                  <div className="my-1 border-t border-[#e8ddc8]" />
                )}

                <button
                  onClick={() => {
                    onSelect?.(opt.id);
                    setOpen(false);
                  }}
                  className={`
                    group flex w-full items-center gap-3
                    rounded-xl px-3 py-2.5 text-right
                    transition-all duration-200
                    ${c.hoverItem}
                  `}
                  type="button"
                >
                  {opt.icon && (
                    <span
                      className={`
                        grid h-8 w-8 shrink-0 place-items-center
                        rounded-xl border border-[#d8b46a]/25
                        bg-white shadow-sm
                        transition-all duration-200
                        group-hover:scale-105
                        ${c.iconColor}
                      `}
                    >
                      {opt.icon}
                    </span>
                  )}

                  <div className="min-w-0 flex-1">
                    <div
                      className="
                        truncate text-[11px] font-black
                        text-[#123f59]
                        group-hover:text-[#0f3448]
                      "
                    >
                      {opt.label}
                    </div>

                    {opt.description && (
                      <div
                        className="
                          mt-0.5 line-clamp-2 text-[9px]
                          font-bold leading-relaxed text-[#64748b]
                        "
                      >
                        {opt.description}
                      </div>
                    )}
                  </div>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}