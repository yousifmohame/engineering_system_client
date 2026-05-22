// src/components/RiyadhDivision/tabs/NodeClientsTab.jsx
import React from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../../../../api/axios"; // تأكد من مسار الـ API
import { Loader2, Users } from "lucide-react";


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
      <div className="p-4 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#0e7490]" />
      </div>
    );

  return (
    <div className="space-y-3 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <h4 className="text-[13px] text-[#475569] font-bold flex items-center gap-1.5">
          <Users className="w-4 h-4 text-[#0e7490]" /> قاعدة العملاء
        </h4>

        <span className="text-[10px] text-[#94a3b8] bg-[#fbf8f1] px-2 py-1 rounded-md font-bold">
          {clients?.length || 0} عميل
        </span>
      </div>

      <div className="border border-[#e8ddc8] rounded-xl overflow-hidden shadow-[0_6px_14px_rgba(18,63,89,0.04)] bg-white">
        <div className="overflow-x-auto custom-scrollbar-slim max-h-[450px]">
          <table className="w-full text-[11px] whitespace-nowrap text-right">
            <thead className="sticky top-0 z-20 bg-[#123f59] text-white shadow-[0_6px_14px_rgba(18,63,89,0.04)]">
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
                  className="hover:bg-[#eef7f6]/50 transition-colors"
                >
                  <td className="py-2.5 px-3 text-[#94a3b8] font-mono">
                    {idx + 1}
                  </td>

                  <td className="py-2.5 px-3 font-bold text-[#123f59]">
                    {client.name}
                  </td>

                  <td className="py-2.5 px-3 font-mono text-[#0e7490] font-bold">
                    {client.code}
                  </td>

                  <td className="py-2.5 px-3 text-[#64748b]">
                    {client.district}
                  </td>

                  <td className="py-2.5 px-3 text-center font-bold text-[#0e7490]">
                    {client.txCount}
                  </td>

                  <td className="py-2.5 px-3 font-mono text-[#64748b]">
                    {client.lastTxDate}
                  </td>

                  <td className="py-2.5 px-3 text-center">
                    <span className="px-2 py-0.5 bg-[#fbf8f1] text-[#64748b] rounded text-[9px] font-bold">
                      {client.source}
                    </span>
                  </td>

                  <td
                    className="py-2.5 px-3 font-mono text-[#94a3b8]"
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
