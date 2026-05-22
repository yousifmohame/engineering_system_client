import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../../api/axios";
import { toast } from "sonner";
import { ClipboardList, Plus, Loader2 } from "lucide-react";


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


const NodeRegulationsTab = ({ selectedType, selectedNode }) => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newReg, setNewReg] = useState({
    type: "ارتفاعات",
    text: "",
    appliesTo: "حي",
    status: "فعال",
    reference: "",
  });

  const { data: regulations, isLoading } = useQuery({
    queryKey: ["node-details", selectedType, selectedNode?.id, "regulations"],
    queryFn: async () =>
      (
        await api.get(
          `/riyadh-streets/details/${selectedType}/${selectedNode.id}/regulations`,
        )
      ).data,
    enabled: !!selectedNode,
  });

  const addRegMutation = useMutation({
    mutationFn: async (payload) =>
      await api.post(
        `/riyadh-streets/details/${selectedType}/${selectedNode.id}/regulations`,
        payload,
      ),
    onSuccess: () => {
      toast.success("تم إضافة الاشتراط");
      queryClient.invalidateQueries([
        "node-details",
        selectedType,
        selectedNode?.id,
        "regulations",
      ]);
      setIsModalOpen(false);
    },
  });

  if (isLoading)
    return (
      <div className="p-4 flex justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );

  return (
    <div className="space-y-2.5 animate-in fade-in duration-300">
      <div className="border border-[#e8ddc8] rounded-xl overflow-hidden bg-white shadow-[0_6px_14px_rgba(18,63,89,0.04)]">
        <div className="flex justify-between items-center p-3 border-b border-[#e8ddc8] bg-[#fbf8f1]">
          <h4 className="font-bold text-[#123f59] text-[13px] flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-red-500" /> سجل الاشتراطات
            الفعالة
          </h4>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-3 py-1.5 text-[11px] bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 flex items-center gap-1.5 font-bold"
          >
            <IconWithText icon={Plus} text="إضافة اشتراط" iconClassName="w-3 h-3" /></button>
        </div>

        <div className="overflow-x-auto max-h-[450px] custom-scrollbar-slim">
          <table className="w-full text-[11px] text-right whitespace-nowrap">
            <thead className="sticky top-0 bg-[#123f59] text-white z-10">
              <tr>
                <th className="py-2.5 px-3">نوع الاشتراط</th>

                <th className="py-2.5 px-3">النص</th>

                <th className="py-2.5 px-3 text-center">المرجع</th>

                <th className="py-2.5 px-3 text-center">الحالة</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-stone-100">
              {regulations?.map((reg) => (
                <tr
                  key={reg.id}
                  className="hover:bg-red-50/30 transition-colors"
                >
                  <td className="py-2.5 px-3 font-bold text-red-700">
                    {reg.type}
                  </td>

                  <td className="py-2.5 px-3 font-bold text-[#123f59] max-w-xs truncate">
                    {reg.text}
                  </td>

                  <td className="py-2.5 px-3 text-center font-mono text-[#94a3b8]">
                    {reg.reference}
                  </td>

                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-bold ${reg.status === "فعال" ? "bg-green-100 text-green-700" : "bg-[#e8ddc8] text-[#64748b]"}`}
                    >
                      {reg.status}
                    </span>
                  </td>
                </tr>
              ))}

              {(!regulations || regulations.length === 0) && (
                <tr>
                  <td
                    colSpan="4"
                    className="py-4 text-center text-[#94a3b8] font-bold"
                  >
                    لا توجد اشتراطات تنظيمية مسجلة
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-[#123f59]/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-3 border-t-4 border-t-red-500">
            <h3 className="font-bold text-[#123f59] mb-4">
              إضافة اشتراط تنظيمي
            </h3>

            <div className="space-y-3">
              <select
                value={newReg.type}
                onChange={(e) => setNewReg({ ...newReg, type: e.target.value })}
                className="w-full p-2 border border-[#cbd5e1] rounded-lg text-sm outline-none"
              >
                <option>ارتفاعات</option>

                <option>ارتدادات</option>

                <option>مواقف</option>

                <option>استخدام أرض</option>
              </select>

              <textarea
                placeholder="نص الاشتراط (مثال: الحد الأقصى للارتفاع 12م)"
                value={newReg.text}
                onChange={(e) => setNewReg({ ...newReg, text: e.target.value })}
                className="w-full h-20 p-2 border border-[#cbd5e1] rounded-lg text-sm outline-none resize-none"
              ></textarea>

              <input
                type="text"
                placeholder="رقم المرجع / التعميم"
                value={newReg.reference}
                onChange={(e) =>
                  setNewReg({ ...newReg, reference: e.target.value })
                }
                className="w-full p-2 border border-[#cbd5e1] rounded-lg text-sm outline-none"
              />
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-[#fbf8f1] rounded-lg text-xs font-bold text-[#475569] flex-1"
              >
                إلغاء
              </button>

              <button
                onClick={() => addRegMutation.mutate(newReg)}
                disabled={!newReg.text || addRegMutation.isPending}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-bold flex-1 disabled:opacity-50"
              >
                اعتماد الاشتراط
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NodeRegulationsTab;
