import React from "react";
import { CircleCheckBig, TriangleAlert, Link, Loader2 } from "lucide-react";

export default function LinkStatusBadge({ isLinked, extractedText, onLinkClick, isLinking }) {
  if (isLinked) {
    return (
      <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 text-[10px] font-bold border border-emerald-100">
        <CircleCheckBig className="w-3 h-3" /> مربوط بالنظام
      </span>
    );
  }

  if (!extractedText) {
    return (
      <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[10px] font-bold border border-slate-200">
        <TriangleAlert className="w-3 h-3" /> غير مربوط (لا يوجد استخراج)
      </span>
    );
  }

  return (
    <button
      onClick={(e) => { e.preventDefault(); onLinkClick(); }}
      disabled={isLinking}
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-200 hover:bg-amber-100 transition-colors disabled:opacity-50"
    >
      {isLinking ? <Loader2 className="w-3 h-3 animate-spin" /> : <Link className="w-3 h-3" />}
      إضافة وربط: {extractedText}
    </button>
  );
}