import React from "react";
import {
  FolderOpen,
  Check,
  Star,
  ShieldAlert,
  Link2,
  Lock,
  ArrowLeft,
  Building2,
} from "lucide-react";
import { CopyableCell, CommunicationBlock } from "./SharedComponents";
import { formatFileSize, formatDateWithTime, GRID_COLUMNS } from "../utils";


export default function EnhancedListItem({
  transaction,
  isSelected,
  onClick,
  onDoubleClick,
  onContextMenu,
  onStatusChange,
  onUrgentToggle,
  onOpenLinks,
}) {
  const isLocked = transaction.locked;
  const renderHidden = (val) => (isLocked ? "••••••••" : val);
  const modified = formatDateWithTime(transaction.modifiedAt);
  const created = formatDateWithTime(transaction.createdAt);

  return (
    <div
      onClick={isLocked ? undefined : onClick}
      onDoubleClick={isLocked ? undefined : onDoubleClick}
      onContextMenu={(e) => onContextMenu(e, transaction)}
      className={`grid gap-2 items-center px-3 py-2.5 cursor-pointer transition-all border-b border-gray-200 relative ${isSelected && !isLocked ? "bg-blue-50/80 border-l-4 border-l-blue-600 shadow-sm z-10" : "hover:bg-gray-50 border-l-4 border-l-transparent bg-white"} ${isLocked ? "bg-slate-50 opacity-80" : ""} ${transaction.isUrgent ? "bg-red-50/30" : ""}`}
      style={{ gridTemplateColumns: GRID_COLUMNS }}
      dir="rtl"
    >
      <div className="flex justify-center">
        <div
          className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${isSelected ? "bg-blue-600 border-blue-600" : "border-gray-300 bg-white"}`}
        >
          {isSelected && (
            <Check size={12} className="text-white" strokeWidth={3} />
          )}
        </div>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onUrgentToggle(transaction.id, !transaction.isUrgent);
        }}
        className="flex justify-center transition-colors hover:text-red-500"
      >
        <Star
          size={17}
          className={
            transaction.isUrgent ? "fill-red-500 text-red-500" : "text-gray-300"
          }
        />
      </button>

      <div className="flex flex-col min-w-0 py-0.5">
        <div className="flex items-center gap-1.5 mb-1">
          <FolderOpen
            size={15}
            className={isLocked ? "text-gray-400" : "text-amber-500 shrink-0"}
          />
          <CopyableCell
            text={`${transaction.ownerFirstName} ${transaction.ownerLastName}${transaction.commonName ? ` • ${transaction.commonName}` : ""}`}
            className="text-[12px] font-black text-gray-900"
            label="اسم المجلد"
          />
          {isLocked && (
            <ShieldAlert size={13} className="text-red-500 shrink-0 mr-1" />
          )}
        </div>
        {!isLocked && (
          <div className="flex items-center gap-1 flex-wrap">
            {transaction.brokerName && (
              <span className="border border-[#7f1d1d] text-[#7f1d1d] bg-white px-1.5 py-0.5 rounded text-[9px] font-bold">
                الوسيط: {transaction.brokerName}
              </span>
            )}
            {transaction.agentName && (
              <span className="border border-[#7f1d1d] text-[#7f1d1d] bg-white px-1.5 py-0.5 rounded text-[9px] font-bold">
                المعقب: {transaction.agentName}
              </span>
            )}
          </div>
        )}
        {!isLocked && transaction.hasLinked && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenLinks(transaction);
            }}
            className="mt-1 flex items-center gap-1 w-max text-[9px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-1.5 py-0.5 rounded-full"
          >
            <Link2 size={9} /> مرتبط
          </button>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <CopyableCell
          text={transaction.transactionCode}
          className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 w-max"
          label="الرقم"
          isHidden={isLocked}
        />
        <span className="text-[9px] font-bold text-gray-500 px-0.5 truncate">
          {renderHidden(transaction.transactionType)}
        </span>
      </div>

      <div className="flex flex-col gap-1">
        <CopyableCell
          text={transaction.sector}
          className="text-[10px] font-bold text-teal-700 bg-teal-50 border border-teal-100 px-1.5 py-0.5 rounded w-max"
          label="القطاع"
          isHidden={isLocked}
        />
        <span className="text-[10px] font-bold text-gray-600">
          {renderHidden(transaction.district)}
        </span>
      </div>

      <div className="flex flex-col">
        {!isLocked && transaction.officeName ? (
          <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-1.5 py-1 rounded w-max truncate max-w-[100px] flex items-center gap-1">
            <Building2 size={10} /> {transaction.officeName}
          </span>
        ) : (
          <span className="text-gray-400 text-[10px] font-bold">
            {renderHidden("—")}
          </span>
        )}
      </div>

      <div className="text-[10px] font-mono font-bold text-gray-500">
        {renderHidden(formatFileSize(transaction.totalSize))}
      </div>

      <div className="flex flex-col gap-0.5">
        {!isLocked ? (
          <>
            <div className="text-[10px] font-mono font-bold text-slate-600">
              {modified.date}{" "}
              <span className="text-[8px] text-slate-400">{modified.time}</span>
            </div>
            <div className="text-[8px] font-bold text-purple-700 bg-purple-50 border border-purple-100 px-1 py-0.5 rounded w-max truncate">
              {transaction.modifiedBy}
            </div>
          </>
        ) : (
          <span className="text-gray-400">••••</span>
        )}
      </div>

      <div className="flex flex-col gap-0.5">
        {!isLocked ? (
          <>
            <div className="text-[10px] font-mono font-bold text-slate-600">
              {created.date}
            </div>
            <div className="text-[8px] font-bold text-blue-700 bg-blue-50 border border-blue-100 px-1 py-0.5 rounded w-max truncate">
              {transaction.createdBy}
            </div>
          </>
        ) : (
          <span className="text-gray-400">••••</span>
        )}
      </div>

      <div className="flex flex-col items-center">
        {!isLocked ? (
          <>
            <CopyableCell
              text={transaction.clientPhone || "—"}
              className="text-[10px] font-mono font-bold text-gray-700 bg-gray-50 border border-gray-100 px-1.5 py-0.5 rounded w-max"
              label="الجوال"
            />
            <CommunicationBlock
              phone={transaction.clientPhone}
              email={transaction.clientEmail}
            />
          </>
        ) : (
          <span className="text-gray-400 text-[10px]">••••</span>
        )}
      </div>

      <div className="flex justify-center" onClick={(e) => e.stopPropagation()}>
        {!isLocked ? (
          <select
            value={transaction.status}
            onChange={(e) => onStatusChange(transaction.id, e.target.value)}
            className={`text-[9px] font-bold px-1.5 py-1 rounded-md border outline-none cursor-pointer appearance-none text-center shadow-sm w-full max-w-[80px] ${transaction.status === "مكتملة" ? "bg-green-50 text-green-700 border-green-200" : transaction.status === "ملغاة" ? "bg-red-50 text-red-700 border-red-200" : "bg-blue-50 text-blue-700 border-blue-200"}`}
          >
            <option value="جارية">جارية</option>
            <option value="معلقة">معلقة</option>
            <option value="مكتملة">مكتملة</option>
            <option value="ملغاة">ملغاة</option>
          </select>
        ) : (
          <span className="text-gray-400 text-[10px]">••••</span>
        )}
      </div>

      <div className="flex justify-center">
        <div
          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${isLocked ? "bg-red-600 border-red-600 shadow-sm" : "bg-gray-50 border-gray-200"}`}
        >
          {isLocked ? (
            <Lock size={11} className="text-white" />
          ) : (
            <Check size={11} className="text-transparent" />
          )}
        </div>
      </div>

      <div className="flex justify-center">
        <button
          onClick={isLocked ? undefined : onDoubleClick}
          disabled={isLocked}
          className={`p-1.5 rounded-lg transition-colors shadow-sm ${isLocked ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-slate-800 text-white hover:bg-slate-700"}`}
        >
          <ArrowLeft size={13} />
        </button>
      </div>
    </div>
  );
}
