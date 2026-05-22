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
    <div className="fixed inset-0 bg-[#123f59]/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-3 py-4 border-b border-[#fbf8f1] bg-[#fbf8f1] flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#d8b46a]/25 text-[#0e7490] flex items-center justify-center">
              <Landmark className="w-5 h-5" />
            </div>

            <div>
              <h3 className="font-extrabold text-[#123f59] text-sm">
                {modalData.mode === "create"
                  ? "تسجيل قطاع جديد"
                  : "تعديل بيانات القطاع"}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-[#e8ddc8] rounded-lg text-[#94a3b8] hover:text-[#64748b] transition-colors"
          >
            <IconWithText icon={X} text="إغلاق" iconClassName="w-5 h-5" /></button>
        </div>

        <form
          id="sectorForm"
          onSubmit={(e) => {
            e.preventDefault();
            sectorMutation.mutate(modalData.data);
          }}
          className="flex-1 overflow-y-auto custom-scrollbar-slim p-3 space-y-3 custom-scrollbar"
        >
          <section>
            <h4 className="text-[12px] font-bold text-[#123f59] mb-4 flex items-center gap-2 border-b border-[#fbf8f1] pb-2">
              <FileText className="w-4 h-4 text-[#0e7490]" /> البيانات الأساسية
            </h4>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[12px] font-bold text-[#475569] mb-2">
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
                  className="w-full px-4 py-2.5 bg-[#fbf8f1] border border-[#e8ddc8] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#0e7490]/20 focus:border-[#0e7490]"
                  placeholder="مثال: وسط، شمال، غرب..."
                />
              </div>

              {modalData.mode === "edit" && (
                <div>
                  <label className="block text-[12px] font-bold text-[#475569] mb-2">
                    كود القطاع الداخلي
                  </label>

                  <input
                    type="text"
                    readOnly
                    dir="ltr"
                    value={modalData.data.code || "يتم توليده تلقائياً"}
                    className="w-full px-4 py-2.5 bg-[#fbf8f1] border border-[#e8ddc8] rounded-xl text-sm font-mono text-left text-[#94a3b8] outline-none cursor-not-allowed"
                  />
                </div>
              )}
            </div>
          </section>

          <section>
            <h4 className="text-[12px] font-bold text-[#123f59] mb-4 flex items-center gap-2 border-b border-[#fbf8f1] pb-2">
              <Globe className="w-4 h-4 text-emerald-500" /> الروابط والخرائط
            </h4>

            <div className="space-y-3">
              <div>
                <label className="block text-[12px] font-bold text-[#475569] mb-2">
                  رابط الخريطة الرسمية المتفاعلة (Google Maps URL)
                </label>

                <div className="relative">
                  <Link2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />

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
                    className="w-full pr-9 pl-4 py-2.5 bg-[#fbf8f1] border border-[#e8ddc8] rounded-xl text-sm font-mono text-left outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    placeholder="https://maps.google.com/..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[12px] font-bold text-[#475569] mb-2">
                    صورة من البوابة المكانية
                  </label>

                  <div className="relative w-full h-32 border-2 border-dashed border-[#d8b46a]/35 rounded-xl bg-[#eef7f6] flex items-center justify-center overflow-hidden hover:bg-[#d8b46a]/25 transition-colors group cursor-pointer">
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
                      <div className="flex flex-col items-center gap-2 text-[#0e7490] opacity-70 group-hover:opacity-100">
                        <Map className="w-8 h-8" />
                        <span className="text-[10px] font-bold">
                          اضغط أو اسحب الصورة هنا
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-[#475569] mb-2">
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

        <div className="p-4 border-t border-[#fbf8f1] bg-[#fbf8f1] flex gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-2.5 bg-white border border-[#e8ddc8] text-[#475569] font-bold rounded-xl hover:bg-[#fbf8f1] transition-colors w-32"
          >
            إلغاء
          </button>

          <button
            type="submit"
            form="sectorForm"
            disabled={sectorMutation.isPending}
            className="flex-1 px-3 py-2.5 bg-[#0e7490] text-white font-bold rounded-xl hover:bg-[#15536f] transition-colors flex items-center justify-center gap-2 shadow-[0_8px_18px_rgba(18,63,89,0.05)] shadow-[0_8px_18px_rgba(18,63,89,0.06)]/20"
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
