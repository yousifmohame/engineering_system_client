import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

/* ═══════════════════════════════════════════════════════════════
   Smart Dropdown Button - Enterprise Action Button with Dropdown
   ═══════════════════════════════════════════════════════════════ */

const colorMap = {
  blue: {
    btn: "bg-blue-600 hover:bg-blue-700 text-white",
    arrow: "bg-blue-700 hover:bg-blue-800 text-white border-blue-500",
    menu: "border-blue-100",
    hoverItem: "hover:bg-blue-50",
    iconColor: "text-blue-500",
  },
  purple: {
    btn: "bg-purple-600 hover:bg-purple-700 text-white",
    arrow: "bg-purple-700 hover:bg-purple-800 text-white border-purple-500",
    menu: "border-purple-100",
    hoverItem: "hover:bg-purple-50",
    iconColor: "text-purple-500",
  },
  green: {
    btn: "bg-emerald-600 hover:bg-emerald-700 text-white",
    arrow: "bg-emerald-700 hover:bg-emerald-800 text-white border-emerald-500",
    menu: "border-emerald-100",
    hoverItem: "hover:bg-emerald-50",
    iconColor: "text-emerald-500",
  },
  red: {
    btn: "bg-red-600 hover:bg-red-700 text-white",
    arrow: "bg-red-700 hover:bg-red-800 text-white border-red-500",
    menu: "border-red-100",
    hoverItem: "hover:bg-red-50",
    iconColor: "text-red-500",
  },
  slate: {
    btn: "bg-slate-600 hover:bg-slate-700 text-white",
    arrow: "bg-slate-700 hover:bg-slate-800 text-white border-slate-500",
    menu: "border-slate-100",
    hoverItem: "hover:bg-slate-50",
    iconColor: "text-slate-500",
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

  const c = colorMap[color] || colorMap.blue; // أضفنا blue كقيمة افتراضية للحماية

  return (
    <div
      ref={ref}
      className="relative"
      style={{ fontFamily: "Tajawal, sans-serif" }}
    >
      {/* Split Button */}
      <div className="flex items-center rounded overflow-hidden shadow-sm">
        <button
          onClick={() => {
            onMainClick?.();
          }}
          className={`flex items-center gap-1 text-[10px] px-2.5 py-1.5 ${c.btn} transition-colors`}
        >
          {icon} {label}
        </button>
        <button
          onClick={() => setOpen(!open)}
          className={`flex items-center px-1 py-1.5 border-r ${c.arrow} transition-colors`}
        >
          <ChevronDown
            size={10}
            className={`transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {/* Dropdown Menu */}
      {open && (
        <div
          className={`absolute top-full left-0 mt-1 w-56 bg-white rounded-lg shadow-xl border ${c.menu} z-50 py-1 animate-in fade-in slide-in-from-top-1 duration-150`}
        >
          {options.map((opt, i) => (
            <div key={opt.id}>
              {opt.divider && i > 0 && (
                <div className="border-t border-slate-100 my-0.5" />
              )}
              <button
                onClick={() => {
                  onSelect?.(opt.id);
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-3 py-1.5 text-right ${c.hoverItem} transition-colors group`}
              >
                {opt.icon && (
                  <span className={`${c.iconColor} shrink-0`}>{opt.icon}</span>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] text-slate-700 group-hover:text-slate-900">
                    {opt.label}
                  </div>
                  {opt.description && (
                    <div className="text-[8px] text-slate-400">
                      {opt.description}
                    </div>
                  )}
                </div>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
