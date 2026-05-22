import React from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../../../../api/axios";
import { Clock, Users, BarChart3, TrendingUp, Loader2 } from "lucide-react";


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
      <div className="p-4 flex justify-center">
        <Loader2 className="animate-spin text-[#0e7490]" />
      </div>
    );
  if (!stats) return null;

  return (
    <div className="space-y-2.5 animate-in fade-in duration-300">
      <div className="grid gap-3 grid-cols-2">
        <div className="bg-white rounded-xl border border-[#e8ddc8]/80 p-4 text-center shadow-[0_6px_14px_rgba(18,63,89,0.04)]">
          <Clock className="w-6 h-6 text-amber-500 mx-auto mb-2" />

          <div className="text-[18px] font-black text-[#123f59]">
            {stats.avgTime} يوم
          </div>

          <div className="text-[11px] text-[#94a3b8] font-bold mt-1">
            متوسط زمن الإنجاز
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#e8ddc8]/80 p-4 text-center shadow-[0_6px_14px_rgba(18,63,89,0.04)]">
          <Users className="w-6 h-6 text-[#0e7490] mx-auto mb-2" />

          <div className="text-[18px] font-black text-[#123f59]">
            {stats.clientReturnRate}%
          </div>

          <div className="text-[11px] text-[#94a3b8] font-bold mt-1">
            معدل تكرار العملاء
          </div>
        </div>
      </div>

      <div className="grid gap-3 grid-cols-1 md:grid-cols-2">
        <div className="bg-white rounded-xl border border-[#e8ddc8]/80 p-4 shadow-[0_6px_14px_rgba(18,63,89,0.04)]">
          <h4 className="text-[13px] text-[#475569] mb-4 flex items-center gap-2 font-bold">
            <BarChart3 className="w-4 h-4 text-[#0e7490]" /> توزيع المعاملات حسب
            الحالة
          </h4>

          <div className="space-y-3">
            {stats.statusDistribution.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <span className="text-[11px] w-20 truncate text-[#64748b] font-bold">
                  {item.status}
                </span>

                <div className="flex-1 h-5 bg-[#fbf8f1] rounded-full overflow-hidden relative">
                  <div
                    className="h-full transition-all duration-1000"
                    style={{
                      width: `${item.percent}%`,

                      backgroundColor: item.color,
                    }}
                  ></div>

                  <span className="absolute inset-0 flex items-center justify-center text-[10px] text-[#123f59] mix-blend-multiply font-bold">
                    {item.percent}%
                  </span>
                </div>

                <span className="text-[11px] font-mono text-[#94a3b8] w-8 text-left">
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#e8ddc8]/80 p-4 shadow-[0_6px_14px_rgba(18,63,89,0.04)]">
          <h4 className="text-[13px] text-[#475569] mb-4 flex items-center gap-2 font-bold">
            <TrendingUp className="w-4 h-4 text-green-500" /> أكثر الأحياء
            تفاعلاً
          </h4>

          <div className="space-y-3">
            {stats.topDistricts.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <span className="w-5 text-[10px] text-[#94a3b8] text-center font-bold">
                  {idx + 1}
                </span>

                <span className="text-[11px] text-[#64748b] w-24 truncate font-bold">
                  {item.name}
                </span>

                <div className="flex-1 h-3.5 bg-[#fbf8f1] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${item.percent}%`,

                      backgroundColor: "rgb(22, 163, 74)",
                    }}
                  ></div>
                </div>

                <span className="text-[11px] font-mono text-[#94a3b8] w-8 text-left">
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
