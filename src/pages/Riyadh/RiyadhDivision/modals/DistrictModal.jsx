import React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../../api/axios";
import { toast } from "sonner";
import { X, MapPin, FileText, Globe, CircleCheck, Loader2 } from "lucide-react";

const DistrictModal = ({ isOpen, onClose, sectorId, mode, initialData }) => {
  const queryClient = useQueryClient();
  // يمكنك استخدام useState داخلي هنا لإدارة بيانات الفورم أو استقبالها من الـ props

  const districtMutation = useMutation({
    mutationFn: async (payload) =>
      mode === "create"
        ? await api.post("/riyadh-streets/districts", { ...payload, sectorId })
        : await api.put(`/riyadh-streets/districts/${payload.id}`, payload),
    onSuccess: () => {
      toast.success("تم الحفظ");
      queryClient.invalidateQueries(["riyadh-tree"]);
      onClose();
    },
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-stone-100 bg-stone-50 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>

            <div>
              <h3 className="font-extrabold text-stone-800 text-lg">
                {districtModal.mode === "create"
                  ? "تسجيل حي جديد"
                  : "تعديل بيانات الحي"}
              </h3>
            </div>
          </div>

          <button
            onClick={() =>
              setDistrictModal({ ...districtModal, isOpen: false })
            }
            className="p-2 hover:bg-stone-200 rounded-lg text-stone-400 hover:text-stone-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          id="districtForm"
          className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar"
          onSubmit={(e) => {
            e.preventDefault();

            districtMutation.mutate(districtModal.data);
          }}
        >
          <section>
            <h4 className="text-[12px] font-bold text-stone-800 mb-4 flex items-center gap-2 border-b border-stone-100 pb-2">
              <FileText className="w-4 h-4 text-emerald-500" /> البيانات
              الأساسية
            </h4>

            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-[12px] font-bold text-stone-700 mb-2">
                  اسم الحي <span className="text-red-500">*</span>
                </label>

                <input
                  type="text"
                  required
                  value={districtModal.data.name}
                  onChange={(e) =>
                    setDistrictModal({
                      ...districtModal,

                      data: { ...districtModal.data, name: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  placeholder="مثال: العليا، النرجس..."
                />
              </div>

              {districtModal.mode === "edit" && (
                <div>
                  <label className="block text-[12px] font-bold text-stone-700 mb-2">
                    كود الحي (تلقائي)
                  </label>

                  <input
                    type="text"
                    readOnly
                    dir="ltr"
                    value={districtModal.data.code || "تلقائي"}
                    className="w-full px-4 py-2.5 bg-stone-100 border border-stone-200 rounded-xl text-sm font-mono text-left text-stone-500 outline-none cursor-not-allowed"
                  />
                </div>
              )}
            </div>
          </section>

          <section>
            <h4 className="text-[12px] font-bold text-stone-800 mb-4 flex items-center gap-2 border-b border-stone-100 pb-2">
              <Globe className="w-4 h-4 text-blue-500" /> الروابط والخرائط
            </h4>

            <div className="space-y-5">
              <div>
                <label className="block text-[12px] font-bold text-stone-700 mb-2">
                  رابط الخريطة الرسمية (URL)
                </label>

                <div className="relative">
                  <Link2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />

                  <input
                    type="url"
                    dir="ltr"
                    value={districtModal.data.officialLink || ""}
                    onChange={(e) =>
                      setDistrictModal({
                        ...districtModal,

                        data: {
                          ...districtModal.data,

                          officialLink: e.target.value,
                        },
                      })
                    }
                    className="w-full pr-9 pl-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-mono text-left outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-[12px] font-bold text-stone-700 mb-2">
                    صورة من البوابة المكانية
                  </label>

                  <div className="relative w-full h-32 border-2 border-dashed border-emerald-200 rounded-xl bg-emerald-50 flex items-center justify-center overflow-hidden hover:bg-emerald-100 transition-colors group cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        handleModalImageUpload(e, "district", "mapImage")
                      }
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />

                    {districtModal.data.mapImage ? (
                      <img
                        src={districtModal.data.mapImage}
                        alt="Map Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-emerald-500 opacity-70 group-hover:opacity-100">
                        <Map className="w-8 h-8" />

                        <span className="text-[10px] font-bold">
                          اضغط أو اسحب الصورة هنا
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-stone-700 mb-2">
                    صورة من القمر الصناعي
                  </label>

                  <div className="relative w-full h-32 border-2 border-dashed border-blue-200 rounded-xl bg-blue-50 flex items-center justify-center overflow-hidden hover:bg-blue-100 transition-colors group cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        handleModalImageUpload(
                          e,

                          "district",

                          "satelliteImage",
                        )
                      }
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />

                    {districtModal.data.satelliteImage ? (
                      <img
                        src={districtModal.data.satelliteImage}
                        alt="Satellite Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-blue-500 opacity-70 group-hover:opacity-100">
                        <Satellite className="w-8 h-8" />

                        <span className="text-[10px] font-bold">
                          اضغط أو اسحب الصورة هنا
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </form>

        <div className="p-4 border-t border-stone-100 bg-stone-50 flex gap-3 shrink-0">
          <button
            type="button"
            onClick={() =>
              setDistrictModal({ ...districtModal, isOpen: false })
            }
            className="px-6 py-2.5 bg-white border border-stone-200 text-stone-700 font-bold rounded-xl hover:bg-stone-50 transition-colors w-32"
          >
            إلغاء
          </button>

          <button
            type="submit"
            form="districtForm"
            disabled={districtMutation.isPending}
            className="flex-1 px-6 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20"
          >
            {districtMutation.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <CircleCheck className="w-5 h-5" /> حفظ بيانات الحي
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DistrictModal;
