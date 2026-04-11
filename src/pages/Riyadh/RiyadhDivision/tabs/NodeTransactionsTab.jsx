import React from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../../../../api/axios";
import { Loader2, Columns2, FileText } from "lucide-react";

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
      <div className="p-10 flex justify-center">
        <Loader2 className="animate-spin text-blue-600" />
      </div>
    );

  return (
    <div className="space-y-3 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <h4 className="text-[13px] text-stone-700 font-bold flex items-center gap-1.5">
          <Columns2 className="w-4 h-4 text-stone-500" /> جدول المعاملات
        </h4>

        <span className="text-[10px] text-stone-400 bg-stone-100 px-2 py-1 rounded-md font-bold">
          {transactions?.length || 0} معاملة
        </span>
      </div>

      <div className="border border-stone-200 rounded-xl overflow-hidden shadow-sm bg-white">
        <div className="overflow-x-auto custom-scrollbar-slim max-h-[450px]">
          <table className="w-full text-[11px] whitespace-nowrap text-right">
            <thead className="sticky top-0 z-20 bg-stone-800 text-white shadow-sm">
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
                  className="hover:bg-blue-50/50 transition-colors"
                >
                  <td className="py-2.5 px-3 text-stone-400 font-mono">
                    {idx + 1}
                  </td>

                  <td className="py-2.5 px-3 font-mono">{trx.date}</td>

                  <td className="py-2.5 px-3 font-mono text-blue-600 font-bold">
                    {trx.ref}
                  </td>

                  <td className="py-2.5 px-3 font-bold text-stone-800">
                    {trx.client}
                  </td>

                  <td className="py-2.5 px-3 text-stone-600">{trx.service}</td>

                  <td className="py-2.5 px-3 text-stone-600">{trx.district}</td>

                  <td className="py-2.5 px-3 text-stone-600">{trx.street}</td>

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

                  <td className="py-2.5 px-3 text-stone-700">{trx.assignee}</td>
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
