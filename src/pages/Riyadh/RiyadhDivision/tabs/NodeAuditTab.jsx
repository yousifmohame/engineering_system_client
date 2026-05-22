import React from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../../../../api/axios";
import { History, Loader2 } from "lucide-react";


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


const NodeAuditTab = ({ selectedType, selectedNode }) => {
  const { data: audits, isLoading } = useQuery({
    queryKey: ["node-details", selectedType, selectedNode?.id, "audit"],
    queryFn: async () =>
      (
        await api.get(
          `/riyadh-streets/details/${selectedType}/${selectedNode.id}/audit`,
        )
      ).data,
    enabled: !!selectedNode,
  });

  if (isLoading)
    return (
      <div className="p-4 flex justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );

  return (
    <div className="space-y-2.5 animate-in fade-in duration-300 max-w-4xl mx-auto">
      <h4 className="text-[14px] text-[#123f59] font-black flex items-center gap-2 mb-4">
        <History className="w-5 h-5 text-amber-500" /> سجل العمليات (Audit
        Trail)
      </h4>

      <div className="space-y-3 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-[#e8ddc8] before:to-transparent">
        {audits?.map((log) => (
          <div
            key={log.id}
            className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-[#fbf8f1] text-[#94a3b8] shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
              <History className="w-4 h-4" />
            </div>

            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-xl border border-[#e8ddc8] shadow-[0_6px_14px_rgba(18,63,89,0.04)]">
              <div className="flex items-center justify-between mb-1">
                <div className="font-bold text-[#123f59] text-[12px]">
                  {log.user}
                </div>

                <div className="font-mono text-[#94a3b8] text-[9px]">
                  {log.date}
                </div>
              </div>

              <div className="text-[11px] text-[#64748b] mt-1">
                <span className="font-bold text-[#0e7490]">{log.action}</span>:{" "}
                {log.newValue}
              </div>
            </div>
          </div>
        ))}

        {(!audits || audits.length === 0) && (
          <div className="text-center py-4 text-[#94a3b8] font-bold z-10 relative bg-[#fbf8f1]/45">
            لا يوجد سجل تاريخي حتى الآن
          </div>
        )}
      </div>
    </div>
  );
};

export default NodeAuditTab;
