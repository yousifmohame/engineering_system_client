import React, { useState } from "react";
import { ExternalLink, Lock, ArrowUp, ArrowDown, Pin, Pen, Trash2, Activity } from "lucide-react";
import { ActionToolButton } from "./UI/SharedUI";
import { getRemainingTime, getDaysSince, getImportanceBadge } from "../utils";

export default function LinkRow({ link, index, catLinks, sortBy, onOpenLink, onPinToggle, onMovePinned, onEdit, onDelete }) {
  const [isPasswordRevealed, setIsPasswordRevealed] = useState(false);
  const validity = link.validUntil ? getRemainingTime(link.validUntil) : null;

  return (
    <tr className={`transition-colors hover:bg-cyan-50/45 ${link.isPinned ? "bg-[#fff7ed]" : "bg-white"}`}>
      <td className="border-l border-[#e8ddc8]/70 px-3 py-2.5">
        <button onClick={() => onOpenLink(link)} className="flex w-fit items-center gap-1.5 rounded-xl border border-[#d8b46a]/35 bg-[#fbf8f1] px-3 py-1.5 text-[11px] font-black text-[#123f59] shadow-sm transition-all hover:-translate-y-[1px] hover:bg-[#123f59] hover:text-white" type="button">
          {link.title} <ExternalLink className="h-3 w-3" />
        </button>
      </td>
      <td className="border-l border-[#e8ddc8]/70 px-3 py-2.5">
        <span className={`rounded-xl border px-2 py-1 text-[10px] font-black ${getImportanceBadge(link.importance)}`}>
          {link.importance}
        </span>
      </td>
      <td className="border-l border-[#e8ddc8]/70 px-3 py-2.5 font-black text-[#334155]">
        {link.accessLevel}
        {link.assignedEmployees && <div className="mt-0.5 max-w-[110px] truncate text-[9px] font-bold text-[#64748b]">{link.assignedEmployees}</div>}
      </td>
      <td className="border-l border-[#e8ddc8]/70 px-3 py-2.5">
        {link.requiresLogin ? (
          <button onClick={() => setIsPasswordRevealed(!isPasswordRevealed)} className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-2.5 py-1 text-[10px] font-black text-rose-700 transition hover:bg-rose-100" type="button">
            <Lock className="h-3 w-3" /> {isPasswordRevealed ? link.loginData : "*****"}
          </button>
        ) : <span className="text-slate-400">-</span>}
      </td>
      <td className="border-l border-[#e8ddc8]/70 px-3 py-2.5">
        {validity ? (
          <div className={`inline-block rounded-xl border px-2 py-1 text-[9px] font-black ${validity.color}`}>
            <span className="block">{link.validUntil?.split("T")[0]}</span>
            <span className="mt-0.5 block opacity-80">{validity.text}</span>
          </div>
        ) : <span className="rounded-xl border border-[#d8b46a]/30 bg-[#f8efe0] px-2 py-1 text-[9px] font-black text-[#123f59]">غير محدد</span>}
      </td>
      <td className="border-l border-[#e8ddc8]/70 px-3 py-2.5 text-[#334155]">
        <div className="text-[10px] font-black">{link.createdBy}</div>
        <div className="font-mono text-[9px] font-bold">{link.createdAt?.split("T")[0]}</div>
        <div className="mt-0.5 w-max rounded-lg bg-cyan-50 px-1.5 py-0.5 text-[8.5px] font-black text-cyan-700">{getDaysSince(link.createdAt)}</div>
      </td>
      <td className="border-l border-[#e8ddc8]/70 px-3 py-2.5 text-[#334155]">
        <div className="text-[10px] font-black">{link.updatedBy || "-"}</div>
        <div className="font-mono text-[9px] font-bold">{link.updatedAt?.split("T")[0] || "-"}</div>
        <div className="mt-0.5 w-max rounded-lg bg-emerald-50 px-1.5 py-0.5 text-[8.5px] font-black text-emerald-700">{getDaysSince(link.updatedAt)}</div>
      </td>
      <td className="border-l border-[#e8ddc8]/70 px-3 py-2.5 text-center">
        <span className="inline-flex items-center gap-1 rounded-xl bg-[#123f59] px-2 py-1 font-mono text-[10px] font-black text-white">
          <Activity className="h-3 w-3 text-[#e2bf74]" /> {link.usageCount}
        </span>
      </td>
      <td className="px-3 py-2.5 text-center">
        <div className="flex items-center justify-center gap-1.5">
          {link.isPinned && sortBy === "usage" && (
            <div className="ml-1 mr-2 flex items-center gap-1">
              <ActionToolButton label="رفع" title="رفع الترتيب" tone="slate" onClick={() => onMovePinned(catLinks, index, "up")}><ArrowUp className="h-3.5 w-3.5" /></ActionToolButton>
              <ActionToolButton label="خفض" title="خفض الترتيب" tone="slate" onClick={() => onMovePinned(catLinks, index, "down")}><ArrowDown className="h-3.5 w-3.5" /></ActionToolButton>
            </div>
          )}
          <ActionToolButton label="تثبيت" title="تثبيت" tone={link.isPinned ? "gold" : "slate"} onClick={() => onPinToggle(link)}><Pin className="h-3.5 w-3.5" /></ActionToolButton>
          <ActionToolButton label="تعديل" title="تعديل" tone="cyan" onClick={() => onEdit(link)}><Pen className="h-3.5 w-3.5" /></ActionToolButton>
          <ActionToolButton label="حذف" title="حذف" tone="rose" onClick={() => onDelete(link)}><Trash2 className="h-3.5 w-3.5" /></ActionToolButton>
        </div>
      </td>
    </tr>
  );
}