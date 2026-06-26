import React from "react";
import { Landmark, ChevronDown } from "lucide-react";

const VaultHeader = ({ vaults, selectedVaultId, setSelectedVaultId }) => {
  return (
    <div className="flex items-center justify-between rounded-lg bg-[var(--wms-surface-1)] border border-[var(--wms-border)] p-3 shrink-0 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center shadow-sm">
          <Landmark className="w-5 h-5 text-yellow-500" />
        </div>
        <div>
          <h2 className="text-[var(--wms-text)] font-bold text-sm">المركز المالي للخزينة</h2>
          <p className="text-[var(--wms-text-muted)] text-[11px]">إدارة السيولة النقدية، العهد، والتوزيعات</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <span className="text-[var(--wms-text-sec)] text-xs font-semibold">الخزنة النشطة:</span>
        <div className="relative">
          <select
            value={selectedVaultId}
            onChange={(e) => setSelectedVaultId(e.target.value)}
            className="pl-8 pr-3 py-1.5 rounded-md border border-[var(--wms-border)] bg-[var(--wms-surface-2)] text-[var(--wms-text)] outline-none focus:border-blue-500 appearance-none cursor-pointer text-xs font-bold"
          >
            {vaults.map(v => (
              <option key={v.id} value={v.id}>{v.vaultName} ({v.vaultCode})</option>
            ))}
          </select>
          <ChevronDown className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
        </div>
      </div>
    </div>
  );
};

export default VaultHeader;