import React from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../../../../../api/axios";
import { X, ShieldCheck, Clock, Loader2, User } from "lucide-react";

// دالة لترجمة الأفعال (Actions) التي يسجلها الباك إند
const translateAction = (action) => {
  const actions = {
    CREATE_VAULT: "إنشاء الخزنة",
    CREATE_INBOUND_TX: "إضافة إيداع / توريد",
    CREATE_OUTBOUND_TX: "إضافة سحب / مصروف",
    CREATE_INTERNAL_TRANSFER_TX: "تحويل داخلي",
    CANCEL_TRANSACTION: "إلغاء قيد (حركة عكسية)",
  };
  return actions[action] || action;
};

const VaultAuditLogsModal = ({ onClose, selectedVaultId }) => {
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["vault-audit-logs", selectedVaultId],
    queryFn: async () => {
      const res = await api.get(
        `/accounts/cash-vaults/${selectedVaultId}/logs`,
      );
      return res.data?.data || [];
    },
    enabled: !!selectedVaultId,
  });

  return (
    <div
      className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4 animate-in fade-in"
      dir="rtl"
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full flex flex-col"
        style={{ maxWidth: "800px", maxHeight: "85vh" }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 bg-slate-800 rounded-t-xl shrink-0">
          <div className="flex items-center gap-2 text-white">
            <ShieldCheck className="w-5 h-5 text-blue-400" />
            <span style={{ fontSize: "16px", fontWeight: 800 }}>
              سجل التدقيق التاريخي (Audit Trail)
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-0 overflow-y-auto custom-scrollbar-slim flex-1 bg-gray-50">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-40 gap-3 text-blue-600">
              <Loader2 className="w-8 h-8 animate-spin" />
              <span className="text-sm font-bold">
                جاري تحميل السجل التاريخي المحمي...
              </span>
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-500">
              لا توجد سجلات تاريخية لهذه الخزنة بعد.
            </div>
          ) : (
            <table className="w-full text-right whitespace-nowrap text-xs">
              <thead className="sticky top-0 z-10 bg-white border-b shadow-sm">
                <tr className="text-gray-500">
                  <th className="px-4 py-3 font-bold">التاريخ والوقت</th>
                  <th className="px-4 py-3 font-bold">المستخدم (الموظف)</th>
                  <th className="px-4 py-3 font-bold">الإجراء المالي</th>
                  <th className="px-4 py-3 font-bold">التفاصيل الفنية</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, index) => (
                  <tr
                    key={log.id}
                    className={`border-b border-gray-100 hover:bg-blue-50/50 ${index % 2 === 0 ? "bg-white" : "bg-gray-50/30"}`}
                  >
                    <td className="px-4 py-3 font-mono text-[11px] text-gray-600 flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      {new Date(log.createdAt).toLocaleString("en-GB")}
                    </td>
                    <td className="px-4 py-3 font-bold text-gray-800">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-blue-500" />
                        {/* 👈 استخدام اسم الموظف المسترجع من العلاقة */}
                        {log.user?.name || log.user?.firstNameAr || log.userId}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-md text-[10px] font-bold ${
                          log.action.includes("CANCEL")
                            ? "bg-red-100 text-red-700"
                            : log.action.includes("INBOUND")
                              ? "bg-green-100 text-green-700"
                              : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {translateAction(log.action)}
                      </span>
                    </td>
                    <td
                      className="px-4 py-3 text-gray-600 truncate max-w-[250px]"
                      title={log.notes}
                    >
                      {log.notes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="px-5 py-3 border-t bg-white rounded-b-xl shrink-0 flex items-center justify-between">
          <span className="text-[10px] text-gray-500 font-bold">
            * هذا السجل محمي للقراءة فقط ولا يمكن حذفه أو تعديله بموجب النظام.
          </span>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg text-xs"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};

export default VaultAuditLogsModal;
