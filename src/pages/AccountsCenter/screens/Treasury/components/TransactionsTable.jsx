import React from "react";
import { Eye, X, Loader2 } from "lucide-react";

const translateCategory = (cat) => {
  const map = { FEES: "أتعاب", RESERVE: "احتياطي", BANK_SUPPORT: "دعم بنك", PENDING: "معلق/مصروف", CUSTODY: "عهد وسلف" };
  return map[cat] || cat;
};

const getTypeStyle = (direction, category) => {
  if (direction === "INBOUND") return { bg: "rgba(34, 197, 94, 0.15)", text: "var(--wms-success)" };
  if (category === "CUSTODY") return { bg: "rgba(180, 83, 9, 0.15)", text: "rgb(180, 83, 9)" };
  if (direction === "OUTBOUND") return { bg: "rgba(239, 68, 68, 0.15)", text: "var(--wms-danger)" };
  return { bg: "rgba(100, 116, 139, 0.15)", text: "var(--wms-text-muted)" };
};

const TransactionsTable = ({ data, isLoading, onView, onCancel, isCanceling }) => {
  return (
    <div className="bg-[var(--wms-surface-1)] border border-[var(--wms-border)] rounded-lg overflow-hidden flex-1 flex flex-col min-h-0 shadow-sm">
      <div className="overflow-auto custom-scrollbar-slim flex-1">
        <table className="w-full text-right whitespace-nowrap" style={{ fontSize: "12px" }}>
          <thead className="sticky top-0 z-10">
            <tr style={{ backgroundColor: "var(--wms-surface-2)", height: "40px" }}>
              <th className="px-4 text-[var(--wms-text-sec)] font-semibold text-[11px]">رقم الحركة</th>
              <th className="px-3 text-[var(--wms-text-sec)] font-semibold text-[11px]">التاريخ</th>
              <th className="px-3 text-[var(--wms-text-sec)] font-semibold text-[11px]">التصنيف الفني</th>
              <th className="px-3 text-[var(--wms-text-sec)] font-semibold text-[11px]">البيان / الوصف</th>
              <th className="px-3 text-[var(--wms-text-sec)] font-semibold text-[11px]">المبلغ</th>
              <th className="px-3 text-[var(--wms-text-sec)] font-semibold text-[11px]">الرصيد التراكمي</th>
              <th className="px-3 text-center text-[var(--wms-text-sec)] font-semibold text-[11px]">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan="7" className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin text-blue-500 mx-auto" /></td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan="7" className="text-center py-8 text-gray-500">لا توجد حركات مالية في هذه الخزنة</td></tr>
            ) : (
              data.map((row) => {
                const style = getTypeStyle(row.direction, row.category);
                const isPlus = row.direction === "INBOUND";
                return (
                  <tr
                    key={row.id}
                    className="border-b border-[var(--wms-border)]/50 hover:bg-[var(--wms-surface-2)] transition-colors"
                    style={{
                      height: "44px",
                      opacity: row.status === "CANCELLED" ? 0.5 : 1,
                      backgroundColor: row.status === "CANCELLED" ? "rgba(239, 68, 68, 0.05)" : "transparent",
                    }}
                  >
                    <td className="px-4 font-mono text-[11px] text-[var(--wms-text-sec)]">{row.transactionNo}</td>
                    <td className="px-3 text-[var(--wms-text-muted)] font-mono text-[11px]">
                      {new Date(row.transactionDate).toLocaleDateString("en-GB")}
                    </td>
                    <td className="px-3">
                      <div className="flex flex-col gap-1 justify-center">
                        <span className="inline-block px-1.5 py-0.5 rounded text-center w-fit" style={{ backgroundColor: style.bg, color: style.text, fontSize: "10px", fontWeight: 700 }}>
                          {row.transactionType}
                        </span>
                        <span className="text-[9px] text-gray-500 font-bold">{translateCategory(row.category)}</span>
                      </div>
                    </td>
                    <td className="px-3 text-[var(--wms-text-sec)] max-w-[250px] truncate" title={row.description}>
                      {row.description || "—"}
                      {row.linkedTransactionId && <div className="text-[9px] text-blue-500 mt-0.5 font-mono">معاملة: {row.linkedTransactionId}</div>}
                    </td>
                    <td className="px-3">
                      <span className="font-mono text-[13px]" style={{ fontWeight: 700, color: isPlus ? "var(--wms-success)" : "var(--wms-danger)", textDecoration: row.status === "CANCELLED" ? "line-through" : "none" }}>
                        {isPlus ? "+" : "-"}{Number(row.amount).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-3 text-[var(--wms-text)] font-mono font-bold text-[12px]">
                      {Number(row.balanceAfter).toLocaleString()}
                    </td>
                    <td className="px-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => onView(row)} className="text-[var(--wms-accent-blue)] hover:text-blue-800 p-1 rounded hover:bg-blue-50" title="تفاصيل">
                          <Eye className="w-4 h-4" />
                        </button>
                        {row.status === "APPROVED" && (
                          <button onClick={() => onCancel(row.id)} disabled={isCanceling} className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50" title="عكس القيد">
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-2.5 border-t border-[var(--wms-border)] bg-[var(--wms-surface-2)]">
        <span className="text-[var(--wms-text-muted)] text-[10px] font-bold text-red-500">
          * ملاحظة أمنية: الإلغاء يقوم بإنشاء قيد عكسي تلقائي للحفاظ على التسلسل المحاسبي (Immutable Ledger).
        </span>
      </div>
    </div>
  );
};

export default TransactionsTable;