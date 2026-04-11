import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../../api/axios";
import { toast } from "sonner";
import {
  Route,
  Plus,
  Edit,
  Trash2,
  Loader2,
  ShieldAlert,
  FileText,
  Link,
  Download,
  ExternalLink,
} from "lucide-react";

const NodeStreetsTab = ({ selectedType, selectedNode, setStreetModal }) => {
  const queryClient = useQueryClient();

  const { data: streets, isLoading } = useQuery({
    queryKey: ["node-details", selectedType, selectedNode?.id, "streets"],
    queryFn: async () =>
      (
        await api.get(
          `/riyadh-streets/details/${selectedType}/${selectedNode.id}/streets`,
        )
      ).data,
    enabled: !!selectedNode,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => await api.delete(`/riyadh-streets/${id}`),
    onSuccess: () => {
      toast.success("تم حذف الشارع بنجاح");
      queryClient.invalidateQueries([
        "node-details",
        selectedType,
        selectedNode?.id,
        "streets",
      ]);
      queryClient.invalidateQueries(["riyadh-tree"]);
    },
  });

  const handleDeleteStreet = (id, name) => {
    if (window.confirm(`هل أنت متأكد من حذف الشارع: ${name}؟`)) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading)
    return (
      <div className="p-10 flex justify-center">
        <Loader2 className="animate-spin text-blue-600" />
      </div>
    );

  return (
    <div className="space-y-3 animate-in fade-in duration-300">
      {/* الهيدر */}
      <div className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-200">
        <div className="flex items-center gap-3">
          <h4 className="text-[13px] text-stone-700 font-bold flex items-center gap-1.5">
            <Route className="w-4 h-4 text-orange-500" /> تنظيمات شوارع النطاق
          </h4>
          <span className="text-[10px] text-stone-400 bg-white px-2 py-1 rounded-md font-bold border border-stone-200">
            {streets?.length || 0} شارع موثق
          </span>
        </div>

        <button
          onClick={() => {
            const sectorId =
              selectedType === "sector"
                ? selectedNode.id
                : selectedNode.sectorId;
            const districtId =
              selectedType === "neighborhood" ? selectedNode.id : null;

            setStreetModal({
              isOpen: true,
              mode: "create",
              sectorId,
              districtId,
              data: {
                name: "",
                width: "",
                type: "normal",
                hasSpecialRegulation: false,
                regulationDetails: {
                  description: "",
                  fileUrl: null,
                  linkedReferenceId: null, // لربطه بشاشة الأدلة
                },
              },
            });
          }}
          className="px-3 py-1.5 text-[11px] bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1.5 font-bold shadow-sm transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> إضافة تنظيم لشارع
        </button>
      </div>

      {/* الجدول */}
      <div className="border border-stone-200 rounded-xl overflow-hidden shadow-sm bg-white">
        <div className="overflow-x-auto custom-scrollbar-slim max-h-[450px]">
          <table className="w-full text-[11px] whitespace-nowrap text-right">
            <thead className="sticky top-0 z-20 bg-stone-800 text-white shadow-sm">
              <tr>
                <th className="py-2.5 px-3 w-10 text-center">#</th>
                <th className="py-2.5 px-3">اسم الشارع والعرض</th>
                <th className="py-2.5 px-3 text-center">التنظيم الخاص</th>
                <th className="py-2.5 px-3">وصف التنظيم / المرفقات</th>
                <th className="py-2.5 px-3 text-center">ارتباط الأدلة</th>
                <th className="py-2.5 px-3 text-center w-24">إجراءات</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-stone-100">
              {streets?.length > 0 ? (
                streets.map((st, idx) => (
                  <tr
                    key={st.id}
                    className="hover:bg-blue-50/30 transition-colors"
                  >
                    <td className="py-2.5 px-3 text-stone-400 font-mono text-center">
                      {idx + 1}
                    </td>

                    <td className="py-2.5 px-3">
                      <div className="flex flex-col">
                        <span className="font-bold text-stone-800">
                          {st.name}
                        </span>
                        <span className="text-[10px] text-stone-500 font-mono">
                          العرض: {st.width} م
                        </span>
                      </div>
                    </td>

                    <td className="py-2.5 px-3 text-center">
                      {st.hasSpecialRegulation ? (
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 text-[9px] rounded font-black border border-purple-200 flex items-center gap-1 w-fit mx-auto">
                          <ShieldAlert size={10} /> يوجد تنظيم
                        </span>
                      ) : (
                        <span className="text-stone-400 text-[9px]">
                          عام (بدون)
                        </span>
                      )}
                    </td>

                    <td className="py-2.5 px-3 max-w-[200px]">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-stone-600 font-medium italic">
                          {st.regulationDetails?.description || "---"}
                        </p>
                        {st.regulationDetails?.fileUrl && (
                          <a
                            href={st.regulationDetails.fileUrl}
                            target="_blank"
                            className="p-1 bg-stone-100 text-stone-500 rounded hover:text-blue-600 transition-colors"
                            title="تحميل الملف التنظيمي"
                          >
                            <Download size={12} />
                          </a>
                        )}
                      </div>
                    </td>

                    <td className="py-2.5 px-3 text-center">
                      {st.regulationDetails?.linkedReferenceId ? (
                        <div className="flex items-center justify-center gap-1 text-emerald-600 font-bold">
                          <Link size={12} />
                          <span className="text-[9px]">مرتبط بدليل</span>
                        </div>
                      ) : (
                        <span className="text-stone-300">---</span>
                      )}
                    </td>

                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => {
                            setStreetModal({
                              isOpen: true,
                              mode: "edit",
                              sectorId: st.sectorId,
                              districtId: st.districtId,
                              data: {
                                ...st,
                                // نضمن تمرير كائن التنظيمات للمودال
                                regulationDetails: st.regulationDetails || {
                                  description: "",
                                  fileUrl: null,
                                  linkedReferenceId: null,
                                },
                              },
                            });
                          }}
                          className="p-1.5 rounded-md text-stone-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteStreet(st.id, st.name)}
                          disabled={deleteMutation.isPending}
                          className="p-1.5 rounded-md text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="text-center py-8 text-stone-400 font-bold bg-stone-50/50"
                  >
                    لا توجد شوارع مسجلة حالياً
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default NodeStreetsTab;
