import React from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../../../../api/axios";
import { Building2, Loader2 } from "lucide-react";

const NodePropertiesTab = ({ selectedType, selectedNode }) => {
  const { data: properties, isLoading } = useQuery({
    queryKey: ["node-details", selectedType, selectedNode?.id, "properties"],
    queryFn: async () =>
      (
        await api.get(
          `/riyadh-streets/details/${selectedType}/${selectedNode.id}/properties`,
        )
      ).data,
    enabled: !!selectedNode,
  });

  if (isLoading)
    return (
      <div className="p-10 flex justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );

  return (
    <div className="space-y-3 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <h4 className="text-[13px] text-stone-700 font-bold flex items-center gap-1.5">
          <Building2 className="w-4 h-4 text-emerald-500" /> سجل الملكيات
        </h4>

        <span className="text-[10px] text-stone-400 bg-stone-100 px-2 py-1 rounded-md font-bold">
          {properties?.length || 0} ملكية
        </span>
      </div>

      <div className="border border-stone-200 rounded-xl overflow-hidden shadow-sm bg-white">
        <div className="overflow-x-auto custom-scrollbar-slim max-h-[450px]">
          <table className="w-full text-[11px] whitespace-nowrap text-right">
            <thead className="sticky top-0 z-20 bg-stone-800 text-white shadow-sm">
              <tr>
                <th className="py-2.5 px-3">#</th>

                <th className="py-2.5 px-3">رقم الصك</th>

                <th className="py-2.5 px-3">المالك</th>

                <th className="py-2.5 px-3">النوع</th>

                <th className="py-2.5 px-3">الحي</th>

                <th className="py-2.5 px-3">الشارع</th>

                <th className="py-2.5 px-3">المساحة (م²)</th>

                <th className="py-2.5 px-3 text-center">الحالة</th>

                <th className="py-2.5 px-3">آخر تحديث</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-stone-100">
              {properties?.map((prop, idx) => (
                <tr
                  key={prop.id}
                  className="hover:bg-emerald-50/50 transition-colors"
                >
                  <td className="py-2.5 px-3 text-stone-400 font-mono">
                    {idx + 1}
                  </td>

                  <td className="py-2.5 px-3 font-mono text-blue-600 font-bold">
                    {prop.deedNumber}
                  </td>

                  <td className="py-2.5 px-3 font-bold text-stone-800">
                    {prop.owner}
                  </td>

                  <td className="py-2.5 px-3 text-stone-600">{prop.type}</td>

                  <td className="py-2.5 px-3 text-stone-600">
                    {prop.district}
                  </td>

                  <td className="py-2.5 px-3 text-stone-600">{prop.street}</td>

                  <td className="py-2.5 px-3 font-mono font-bold text-stone-700">
                    {prop.area}
                  </td>

                  <td className="py-2.5 px-3 text-center">
                    <span className="px-2 py-1 rounded-md text-[10px] font-bold bg-stone-100 text-stone-600 border border-stone-200">
                      {prop.status}
                    </span>
                  </td>

                  <td className="py-2.5 px-3 font-mono text-stone-500">
                    {prop.lastUpdate}
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

export default NodePropertiesTab;
