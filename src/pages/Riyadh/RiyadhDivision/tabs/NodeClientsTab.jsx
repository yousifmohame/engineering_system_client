// src/components/RiyadhDivision/tabs/NodeClientsTab.jsx
import React from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../../../../api/axios"; // تأكد من مسار الـ API
import { Loader2, Users } from "lucide-react";

const NodeClientsTab = ({ selectedType, selectedNode }) => {
  const { data: clients, isLoading } = useQuery({
    queryKey: ["node-details", selectedType, selectedNode?.id, "clients"],
    queryFn: async () =>
      (
        await api.get(
          `/riyadh-streets/details/${selectedType}/${selectedNode.id}/clients`,
        )
      ).data,
    enabled: !!selectedNode,
  });

  if (isLoading)
    return (
      <div className="p-10 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );

  return (
    <div className="space-y-3 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <h4 className="text-[13px] text-stone-700 font-bold flex items-center gap-1.5">
          <Users className="w-4 h-4 text-purple-500" /> قاعدة العملاء
        </h4>

        <span className="text-[10px] text-stone-400 bg-stone-100 px-2 py-1 rounded-md font-bold">
          {clients?.length || 0} عميل
        </span>
      </div>

      <div className="border border-stone-200 rounded-xl overflow-hidden shadow-sm bg-white">
        <div className="overflow-x-auto custom-scrollbar-slim max-h-[450px]">
          <table className="w-full text-[11px] whitespace-nowrap text-right">
            <thead className="sticky top-0 z-20 bg-stone-800 text-white shadow-sm">
              <tr>
                <th className="py-2.5 px-3">#</th>

                <th className="py-2.5 px-3">الاسم</th>

                <th className="py-2.5 px-3">كود العميل</th>

                <th className="py-2.5 px-3">الحي</th>

                <th className="py-2.5 px-3 text-center">المعاملات</th>

                <th className="py-2.5 px-3">آخر معاملة</th>

                <th className="py-2.5 px-3 text-center">المصدر</th>

                <th className="py-2.5 px-3">الهاتف</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-stone-100">
              {clients?.map((client, idx) => (
                <tr
                  key={client.id}
                  className="hover:bg-purple-50/50 transition-colors"
                >
                  <td className="py-2.5 px-3 text-stone-400 font-mono">
                    {idx + 1}
                  </td>

                  <td className="py-2.5 px-3 font-bold text-stone-800">
                    {client.name}
                  </td>

                  <td className="py-2.5 px-3 font-mono text-blue-600 font-bold">
                    {client.code}
                  </td>

                  <td className="py-2.5 px-3 text-stone-600">
                    {client.district}
                  </td>

                  <td className="py-2.5 px-3 text-center font-bold text-blue-600">
                    {client.txCount}
                  </td>

                  <td className="py-2.5 px-3 font-mono text-stone-600">
                    {client.lastTxDate}
                  </td>

                  <td className="py-2.5 px-3 text-center">
                    <span className="px-2 py-0.5 bg-stone-100 text-stone-600 rounded text-[9px] font-bold">
                      {client.source}
                    </span>
                  </td>

                  <td
                    className="py-2.5 px-3 font-mono text-stone-500"
                    dir="ltr"
                  >
                    {client.phone}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default NodeClientsTab;
