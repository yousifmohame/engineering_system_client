import React from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../../../../api/axios";
import { Clock, Users, BarChart3, TrendingUp, Loader2 } from "lucide-react";

const NodeStatsTab = ({ selectedType, selectedNode }) => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["node-details", selectedType, selectedNode?.id, "stats"],
    queryFn: async () =>
      (
        await api.get(
          `/riyadh-streets/details/${selectedType}/${selectedNode.id}/stats`,
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
  if (!stats) return null;

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="grid gap-3 grid-cols-2">
        <div className="bg-white rounded-xl border border-stone-200/80 p-4 text-center shadow-sm">
          <Clock className="w-6 h-6 text-amber-500 mx-auto mb-2" />

          <div className="text-[18px] font-black text-stone-800">
            {stats.avgTime} يوم
          </div>

          <div className="text-[11px] text-stone-500 font-bold mt-1">
            متوسط زمن الإنجاز
          </div>
        </div>

        <div className="bg-white rounded-xl border border-stone-200/80 p-4 text-center shadow-sm">
          <Users className="w-6 h-6 text-purple-500 mx-auto mb-2" />

          <div className="text-[18px] font-black text-stone-800">
            {stats.clientReturnRate}%
          </div>

          <div className="text-[11px] text-stone-500 font-bold mt-1">
            معدل تكرار العملاء
          </div>
        </div>
      </div>

      <div className="grid gap-3 grid-cols-1 md:grid-cols-2">
        <div className="bg-white rounded-xl border border-stone-200/80 p-4 shadow-sm">
          <h4 className="text-[13px] text-stone-700 mb-4 flex items-center gap-2 font-bold">
            <BarChart3 className="w-4 h-4 text-blue-500" /> توزيع المعاملات حسب
            الحالة
          </h4>

          <div className="space-y-3">
            {stats.statusDistribution.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <span className="text-[11px] w-20 truncate text-stone-600 font-bold">
                  {item.status}
                </span>

                <div className="flex-1 h-5 bg-stone-100 rounded-full overflow-hidden relative">
                  <div
                    className="h-full transition-all duration-1000"
                    style={{
                      width: `${item.percent}%`,

                      backgroundColor: item.color,
                    }}
                  ></div>

                  <span className="absolute inset-0 flex items-center justify-center text-[10px] text-stone-800 mix-blend-multiply font-bold">
                    {item.percent}%
                  </span>
                </div>

                <span className="text-[11px] font-mono text-stone-500 w-8 text-left">
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-stone-200/80 p-4 shadow-sm">
          <h4 className="text-[13px] text-stone-700 mb-4 flex items-center gap-2 font-bold">
            <TrendingUp className="w-4 h-4 text-green-500" /> أكثر الأحياء
            تفاعلاً
          </h4>

          <div className="space-y-3">
            {stats.topDistricts.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <span className="w-5 text-[10px] text-stone-400 text-center font-bold">
                  {idx + 1}
                </span>

                <span className="text-[11px] text-stone-600 w-24 truncate font-bold">
                  {item.name}
                </span>

                <div className="flex-1 h-3.5 bg-stone-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${item.percent}%`,

                      backgroundColor: "rgb(22, 163, 74)",
                    }}
                  ></div>
                </div>

                <span className="text-[11px] font-mono text-stone-500 w-8 text-left">
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NodeStatsTab;
