import React from "react";
import { Vault, ShieldCheck, Landmark, WalletCards, ArrowRightLeft } from "lucide-react";

const VaultBalances = ({ vault }) => {
  return (
    <div className="grid grid-cols-5 gap-3 shrink-0">
      <div className="bg-[var(--wms-surface-1)] border border-[var(--wms-border)] p-3 rounded-lg flex flex-col gap-1 shadow-sm">
        <div className="flex items-center gap-2 text-[var(--wms-text-muted)] text-[11px] font-semibold">
          <Vault className="w-3.5 h-3.5 text-blue-500" /> الرصيد الإجمالي المتاح
        </div>
        <span className="font-mono text-lg font-bold text-[var(--wms-text)]">
          {Number(vault.currentBalance).toLocaleString()} <span className="text-xs font-normal">ر.س</span>
        </span>
      </div>
      
      <div className="bg-[var(--wms-surface-1)] border border-green-200 p-3 rounded-lg flex flex-col gap-1 shadow-[0_0_10px_rgba(34,197,94,0.05)]">
        <div className="flex items-center gap-2 text-green-700 text-[11px] font-semibold">
          <WalletCards className="w-3.5 h-3.5" /> أتعاب المعاملات
        </div>
        <span className="font-mono text-lg font-bold text-green-600">
          {Number(vault.feesBalance).toLocaleString()} <span className="text-xs font-normal">ر.س</span>
        </span>
      </div>

      <div className="bg-[var(--wms-surface-1)] border border-blue-200 p-3 rounded-lg flex flex-col gap-1">
        <div className="flex items-center gap-2 text-blue-700 text-[11px] font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" /> احتياطي المكتب
        </div>
        <span className="font-mono text-lg font-bold text-blue-600">
          {Number(vault.reserveBalance).toLocaleString()} <span className="text-xs font-normal">ر.س</span>
        </span>
      </div>

      <div className="bg-[var(--wms-surface-1)] border border-purple-200 p-3 rounded-lg flex flex-col gap-1">
        <div className="flex items-center gap-2 text-purple-700 text-[11px] font-semibold">
          <Landmark className="w-3.5 h-3.5" /> مخصص دعم البنك
        </div>
        <span className="font-mono text-lg font-bold text-purple-600">
          {Number(vault.bankSupportBalance).toLocaleString()} <span className="text-xs font-normal">ر.س</span>
        </span>
      </div>

      <div className="bg-[var(--wms-surface-1)] border border-orange-200 p-3 rounded-lg flex flex-col gap-1">
        <div className="flex items-center gap-2 text-orange-700 text-[11px] font-semibold">
          <ArrowRightLeft className="w-3.5 h-3.5" /> عهد وسلف تحت التسوية
        </div>
        <span className="font-mono text-lg font-bold text-orange-600">
          {Number(vault.pendingBalance).toLocaleString()} <span className="text-xs font-normal">ر.س</span>
        </span>
      </div>
    </div>
  );
};

export default VaultBalances;