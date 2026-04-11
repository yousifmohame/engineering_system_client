// src/components/RiyadhDivision/modals/SectorModal.jsx
import React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../../api/axios";
import { toast } from "sonner";
import {
  X,
  Landmark,
  FileText,
  Globe,
  Map,
  Satellite,
  Loader2,
  CircleCheck,
  Link2, // تمت إضافة Link2 هنا
} from "lucide-react";

const SectorModal = ({ isOpen, onClose, modalData, setModalData }) => {
  const queryClient = useQueryClient();

  const sectorMutation = useMutation({
    mutationFn: async (payload) =>
      modalData.mode === "create"
        ? await api.post("/riyadh-streets/sectors", payload)
        : await api.put(`/riyadh-streets/sectors/${payload.id}`, payload),
    onSuccess: () => {
      toast.success("تم حفظ القطاع");
      queryClient.invalidateQueries(["riyadh-tree"]);
      onClose();
    },
  });

  // دالة التعامل مع رفع الصور محلياً داخل المودال
  const handleModalImageUpload = (e, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setModalData((prev) => ({
        ...prev,
        data: { ...prev.data, [fieldName]: reader.result },
      }));
    };
    reader.readAsDataURL(file);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-stone-100 bg-stone-50 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <Landmark className="w-5 h-5" />
            </div>

            <div>
              <h3 className="font-extrabold text-stone-800 text-lg">
                {modalData.mode === "create"
                  ? "تسجيل قطاع جديد"
                  : "تعديل بيانات القطاع"}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-stone-200 rounded-lg text-stone-400 hover:text-stone-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          id="sectorForm"
          onSubmit={(e) => {
            e.preventDefault();
            sectorMutation.mutate(modalData.data);
          }}
          className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar"
        >
          <section>
            <h4 className="text-[12px] font-bold text-stone-800 mb-4 flex items-center gap-2 border-b border-stone-100 pb-2">
              <FileText className="w-4 h-4 text-blue-500" /> البيانات الأساسية
            </h4>

            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-[12px] font-bold text-stone-700 mb-2">
                  اسم القطاع <span className="text-red-500">*</span>
                </label>

                <input
                  type="text"
                  required
                  value={modalData.data.name || ""}
                  onChange={(e) =>
                    setModalData({
                      ...modalData,
                      data: { ...modalData.data, name: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  placeholder="مثال: وسط، شمال، غرب..."
                />
              </div>

              {modalData.mode === "edit" && (
                <div>
                  <label className="block text-[12px] font-bold text-stone-700 mb-2">
                    كود القطاع الداخلي
                  </label>

                  <input
                    type="text"
                    readOnly
                    dir="ltr"
                    value={modalData.data.code || "يتم توليده تلقائياً"}
                    className="w-full px-4 py-2.5 bg-stone-100 border border-stone-200 rounded-xl text-sm font-mono text-left text-stone-500 outline-none cursor-not-allowed"
                  />
                </div>
              )}
            </div>
          </section>

          <section>
            <h4 className="text-[12px] font-bold text-stone-800 mb-4 flex items-center gap-2 border-b border-stone-100 pb-2">
              <Globe className="w-4 h-4 text-emerald-500" /> الروابط والخرائط
            </h4>

            <div className="space-y-5">
              <div>
                <label className="block text-[12px] font-bold text-stone-700 mb-2">
                  رابط الخريطة الرسمية المتفاعلة (Google Maps URL)
                </label>

                <div className="relative">
                  <Link2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />

                  <input
                    type="url"
                    dir="ltr"
                    value={modalData.data.officialLink || ""}
                    onChange={(e) =>
                      setModalData({
                        ...modalData,
                        data: {
                          ...modalData.data,
                          officialLink: e.target.value,
                        },
                      })
                    }
                    className="w-full pr-9 pl-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-mono text-left outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    placeholder="https://maps.google.com/..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-[12px] font-bold text-stone-700 mb-2">
                    صورة من البوابة المكانية
                  </label>

                  <div className="relative w-full h-32 border-2 border-dashed border-blue-200 rounded-xl bg-blue-50 flex items-center justify-center overflow-hidden hover:bg-blue-100 transition-colors group cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleModalImageUpload(e, "mapImage")}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />

                    {modalData.data.mapImage ? (
                      <img
                        src={modalData.data.mapImage}
                        alt="Map Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-blue-500 opacity-70 group-hover:opacity-100">
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

                  <div className="relative w-full h-32 border-2 border-dashed border-emerald-200 rounded-xl bg-emerald-50 flex items-center justify-center overflow-hidden hover:bg-emerald-100 transition-colors group cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        handleModalImageUpload(e, "satelliteImage")
                      }
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />

                    {modalData.data.satelliteImage ? (
                      <img
                        src={modalData.data.satelliteImage}
                        alt="Satellite Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-emerald-500 opacity-70 group-hover:opacity-100">
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
            onClick={onClose}
            className="px-6 py-2.5 bg-white border border-stone-200 text-stone-700 font-bold rounded-xl hover:bg-stone-50 transition-colors w-32"
          >
            إلغاء
          </button>

          <button
            type="submit"
            form="sectorForm"
            disabled={sectorMutation.isPending}
            className="flex-1 px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-md shadow-blue-500/20"
          >
            {sectorMutation.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <CircleCheck className="w-5 h-5" />{" "}
                {modalData.mode === "create"
                  ? "حفظ وإنشاء القطاع"
                  : "حفظ التعديلات"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SectorModal;
