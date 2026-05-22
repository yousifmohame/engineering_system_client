import React from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../../../../api/axios";
import { Loader2, Columns2, FileText } from "lucide-react";


const IconWithText = ({
  icon: Icon,
  text,
  className = "",
  iconClassName = "",
  textClassName = "",
  vertical = false,
}) => {
  return (
    <span
      className={`inline-flex min-w-0 items-center justify-center ${
        vertical ? "flex-col gap-0.5" : "gap-1.5"
      } ${className}`}
    >
      {Icon && <Icon className={iconClassName || "h-3.5 w-3.5 shrink-0"} />}
      {text && (
        <span
          className={
            textClassName ||
            "min-w-0 whitespace-nowrap text-[10px] font-black leading-none"
          }
        >
          {text}
        </span>
      )}
    </span>
  );
};


const NodeTransactionsTab = ({ selectedType, selectedNode }) => {
  const { data: transactions, isLoading } = useQuery({
    queryKey: ["node-details", selectedType, selectedNode?.id, "transactions"],
    queryFn: async () =>
      (
        await api.get(
          `/riyadh-streets/details/${selectedType}/${selectedNode.id}/transactions`,
        )
      ).data,
    enabled: !!selectedNode,
  });

  if (isLoading)
    return (
      <div className="p-4 flex justify-center">
        <Loader2 className="animate-spin text-[#0e7490]" />
      </div>
    );

  return (
    <div className="space-y-3 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <h4 className="text-[13px] text-[#475569] font-bold flex items-center gap-1.5">
          <Columns2 className="w-4 h-4 text-[#94a3b8]" /> جدول المعاملات
        </h4>

        <span className="text-[10px] text-[#94a3b8] bg-[#fbf8f1] px-2 py-1 rounded-md font-bold">
          {transactions?.length || 0} معاملة
        </span>
      </div>

      <div className="border border-[#e8ddc8] rounded-xl overflow-hidden shadow-[0_6px_14px_rgba(18,63,89,0.04)] bg-white">
        <div className="overflow-x-auto custom-scrollbar-slim max-h-[450px]">
          <table className="w-full text-[11px] whitespace-nowrap text-right">
            <thead className="sticky top-0 z-20 bg-[#123f59] text-white shadow-[0_6px_14px_rgba(18,63,89,0.04)]">
              <tr>
                <th className="py-2.5 px-3">#</th>

                <th className="py-2.5 px-3">التاريخ</th>

                <th className="py-2.5 px-3">رقم المعاملة</th>

                <th className="py-2.5 px-3">العميل</th>

                <th className="py-2.5 px-3">الخدمة</th>

                <th className="py-2.5 px-3">الحي</th>

                <th className="py-2.5 px-3">الشارع</th>

                <th className="py-2.5 px-3 text-center">الحالة</th>

                <th className="py-2.5 px-3">القيمة (ر.س)</th>

                <th className="py-2.5 px-3">المسؤول</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-stone-100">
              {transactions?.map((trx, idx) => (
                <tr
                  key={trx.id}
                  className="hover:bg-[#eef7f6]/50 transition-colors"
                >
                  <td className="py-2.5 px-3 text-[#94a3b8] font-mono">
                    {idx + 1}
                  </td>

                  <td className="py-2.5 px-3 font-mono">{trx.date}</td>

                  <td className="py-2.5 px-3 font-mono text-[#0e7490] font-bold">
                    {trx.ref}
                  </td>

                  <td className="py-2.5 px-3 font-bold text-[#123f59]">
                    {trx.client}
                  </td>

                  <td className="py-2.5 px-3 text-[#64748b]">{trx.service}</td>

                  <td className="py-2.5 px-3 text-[#64748b]">{trx.district}</td>

                  <td className="py-2.5 px-3 text-[#64748b]">{trx.street}</td>

                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={`px-2 py-1 rounded-md text-[10px] font-bold ${getStatusStyle(trx.status)}`}
                    >
                      {trx.status}
                    </span>
                  </td>

                  <td className="py-2.5 px-3 font-mono text-green-700 font-bold">
                    {trx.value}
                  </td>

                  <td className="py-2.5 px-3 text-[#475569]">{trx.assignee}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default NodeTransactionsTab;
