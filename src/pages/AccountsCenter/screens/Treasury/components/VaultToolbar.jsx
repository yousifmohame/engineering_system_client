import React from "react";
import { Plus, Download, Search, ShieldCheck } from "lucide-react";

const VaultToolbar = ({ searchQuery, setSearchQuery, onAdd, onExport, onOpenLogs }) => {
  return (
    <div className="flex items-center gap-2 shrink-0 print:hidden mt-2">
      <button
        onClick={onAdd}
        className="flex items-center gap-1.5 px-3 rounded-md bg-[var(--wms-accent-blue)] text-white cursor-pointer hover:opacity-90 shadow-sm"
        style={{ height: "34px", fontSize: "12px", fontWeight: "bold" }}
      >
        <Plus className="w-4 h-4" />
        <span>تسجيل حركة مالية</span>
      </button>
      
      <button
        onClick={onExport}
        className="flex items-center gap-1.5 px-3 rounded-md bg-[var(--wms-surface-1)] border border-[var(--wms-border)] text-[var(--wms-text-sec)] hover:bg-[var(--wms-surface-2)] cursor-pointer"
        style={{ height: "34px", fontSize: "12px" }}
      >
        <Download className="w-3.5 h-3.5" />
        <span>تصدير كشف</span>
      </button>

      {/* الزر الجديد للسجل التاريخي */}
      <button
        onClick={onOpenLogs}
        className="flex items-center gap-1.5 px-3 rounded-md bg-slate-800 text-white hover:bg-slate-700 cursor-pointer shadow-sm"
        style={{ height: "34px", fontSize: "12px", fontWeight: "bold" }}
      >
        <ShieldCheck className="w-4 h-4 text-blue-300" />
        <span>سجل التدقيق (Audit)</span>
      </button>
      
      <div className="flex-1"></div>
      
      <div className="relative">
        <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--wms-text-muted)]" />
        <input
          type="text"
          placeholder="بحث برقم الحركة، البيان، الفئة..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pr-8 pl-3 rounded-md border border-[var(--wms-border)] text-[var(--wms-text)] bg-[var(--wms-surface-1)] outline-none focus:border-blue-500"
          style={{ height: "34px", fontSize: "12px", width: "260px" }}
        />
      </div>
    </div>
  );
};

export default VaultToolbar;