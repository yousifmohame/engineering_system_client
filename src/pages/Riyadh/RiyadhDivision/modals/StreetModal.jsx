import React, { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import api from "../../../../api/axios";
import { toast } from "sonner";
import {
  X,
  Route,
  ShieldAlert,
  FileText,
  Link as LinkIcon,
  CircleCheck,
  Loader2,
  Upload,
  Search,
  ChevronDown,
} from "lucide-react";

const StreetModal = ({
  isOpen,
  onClose,
  sectorId,
  districtId,
  modalData, // 👈 تم تصحيح الاسم هنا ليتوافق مع الـ Props
  setModalData,
}) => {
  const queryClient = useQueryClient();
  const [isSearchingRef, setIsSearchingRef] = useState(false);

  // 1. جلب قائمة الأدلة والاشتراطات للربط (اختياري)
  // التعديل في سطر queryFn
const { data: referenceDocs = [] } = useQuery({
  queryKey: ["reference-docs-list"],
  queryFn: async () => {
    const res = await api.get("/references");
    return res.data.data; // 👈 لاحظ إضافة .data الثانية للوصول للمصفوفة
  },
  enabled: isOpen,
});

  // 2. الميوتيشن (إضافة أو تعديل)
  const streetMutation = useMutation({
    mutationFn: async (payload) => {
      if (modalData.mode === "edit") {
        return await api.put(`/riyadh-streets/${payload.id}`, payload);
      }
      return await api.post("/riyadh-streets/quick-street", {
        ...payload,
        sectorId,
        districtId,
      });
    },
    onSuccess: () => {
      toast.success(
        modalData.mode === "edit"
          ? "تم تحديث بيانات الشارع"
          : "تم إضافة الشارع بنجاح",
      );
      queryClient.invalidateQueries(["riyadh-tree"]);
      queryClient.invalidateQueries(["node-details"]);
      onClose();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "حدث خطأ أثناء الحفظ");
    },
  });

  // 3. معالجة رفع الملف (تحويل لـ Base64 لسهولة الحفظ في JSON)
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setModalData({
        ...modalData,
        data: {
          ...modalData.data,
          regulationDetails: {
            ...modalData.data.regulationDetails,
            fileUrl: event.target.result, // حفظ الـ Base64
            fileName: file.name,
          },
        },
      });
    };
    reader.readAsDataURL(file);
  };

  if (!isOpen) return null;

  const data = modalData.data;

  return (
    <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-100 bg-stone-50 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <Route className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-stone-800 text-lg">
                {modalData.mode === "edit"
                  ? "تعديل بيانات الشارع"
                  : "تسجيل شارع جديد"}
              </h3>
              <p className="text-[11px] text-stone-500 font-medium mt-0.5">
                تحديد المسمى، العرض، والتنظيمات الخاصة بالشارع
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-stone-200 rounded-lg text-stone-400 hover:text-stone-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          {/* القسم الأول: البيانات الأساسية */}
          {/* القسم الأول: البيانات الأساسية */}
          <section>
            <h4 className="text-[12px] font-bold text-stone-800 mb-4 flex items-center gap-2 border-b border-stone-100 pb-2">
              <Route className="w-4 h-4 text-blue-500" /> البيانات الأساسية
              والقياسات
            </h4>
            {/* قم بتغيير grid-cols-2 إلى grid-cols-4 لترتيب الحقول بشكل أفضل */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              {/* اسم الشارع يأخذ مساحة أكبر */}
              <div className="col-span-1 md:col-span-2">
                <label className="block text-[12px] font-bold text-stone-700 mb-2">
                  اسم الشارع <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={data.name || ""}
                  onChange={(e) =>
                    setModalData({
                      ...modalData,
                      data: { ...data, name: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none focus:border-blue-500"
                  placeholder="مثال: شارع العليا"
                />
              </div>

              {/* نوع الشارع */}
              <div className="col-span-1 md:col-span-2">
                <label className="block text-[12px] font-bold text-stone-700 mb-2">
                  نوع الشارع
                </label>
                <div className="relative">
                  <select
                    value={data.type || "normal"}
                    onChange={(e) =>
                      setModalData({
                        ...modalData,
                        data: { ...data, type: e.target.value },
                      })
                    }
                    className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm appearance-none outline-none"
                  >
                    <option value="normal">شارع داخلي (فرعي)</option>
                    <option value="main">طريق محوري (رئيسي)</option>
                  </select>
                  <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                </div>
              </div>

              {/* عرض الشارع */}
              <div className="col-span-1 md:col-span-2">
                <label className="block text-[12px] font-bold text-stone-700 mb-2">
                  عرض الشارع (متر) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  value={data.width || ""}
                  onChange={(e) =>
                    setModalData({
                      ...modalData,
                      data: { ...data, width: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-mono outline-none"
                  placeholder="30"
                />
              </div>

              {/* 👈 الطول (جديد) */}
              <div className="col-span-1">
                <label className="block text-[12px] font-bold text-stone-700 mb-2">
                  طول الشارع (متر)
                </label>
                <input
                  type="number"
                  value={data.length || ""}
                  onChange={(e) =>
                    setModalData({
                      ...modalData,
                      data: { ...data, length: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-mono outline-none"
                  placeholder="1500"
                />
              </div>

              {/* 👈 عدد المسارات (جديد) */}
              <div className="col-span-1">
                <label className="block text-[12px] font-bold text-stone-700 mb-2">
                  عدد المسارات
                </label>
                <input
                  type="number"
                  value={data.lanes || ""}
                  onChange={(e) =>
                    setModalData({
                      ...modalData,
                      data: { ...data, lanes: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-mono outline-none"
                  placeholder="3"
                />
              </div>
            </div>
          </section>

          {/* القسم الثاني: التنظيم الخاص والربط */}
          <section className="space-y-6">
            <h4 className="text-[12px] font-bold text-stone-800 mb-4 flex items-center gap-2 border-b border-stone-100 pb-2">
              <ShieldAlert className="w-4 h-4 text-purple-500" /> الحالة
              التنظيمية والاشتراطات
            </h4>

            {/* سويتش التنظيم الخاص */}
            <div className="flex items-center justify-between p-4 bg-purple-50/50 rounded-2xl border border-purple-100">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg ${data.hasSpecialRegulation ? "bg-purple-600 text-white" : "bg-stone-200 text-stone-500"}`}
                >
                  <ShieldAlert size={18} />
                </div>
                <div>
                  <p className="text-sm font-black text-stone-800">
                    هل يوجد تنظيم خاص لهذا الشارع؟
                  </p>
                  <p className="text-[10px] text-stone-500">
                    تفعيل هذا الخيار يسمح بإضافة اشتراطات استثنائية
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={data.hasSpecialRegulation || false}
                  onChange={(e) =>
                    setModalData({
                      ...modalData,
                      data: { ...data, hasSpecialRegulation: e.target.checked },
                    })
                  }
                />
                <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            {data.hasSpecialRegulation && (
              <div className="space-y-5 animate-in slide-in-from-top-4 duration-300">
                {/* وصف التنظيم */}
                <div>
                  <label className="block text-[12px] font-bold text-stone-700 mb-2">
                    وصف التنظيم الخاص
                  </label>
                  <textarea
                    value={data.regulationDetails?.description || ""}
                    onChange={(e) =>
                      setModalData({
                        ...modalData,
                        data: {
                          ...data,
                          regulationDetails: {
                            ...data.regulationDetails,
                            description: e.target.value,
                          },
                        },
                      })
                    }
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none focus:border-purple-500 min-h-[100px] resize-none"
                    placeholder="اكتب تفاصيل الاستثناء أو التنظيم هنا..."
                  />
                </div>

                {/* رفع ملف التنظيم */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[12px] font-bold text-stone-700 mb-2">
                      مرفق قرار التنظيم
                    </label>
                    <div className="relative group">
                      <input
                        type="file"
                        onChange={handleFileChange}
                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                      />
                      <div className="w-full flex items-center gap-2 px-4 py-2.5 bg-stone-50 border border-stone-200 border-dashed rounded-xl group-hover:border-purple-500 transition-colors">
                        <Upload
                          size={16}
                          className="text-stone-400 group-hover:text-purple-500"
                        />
                        <span className="text-[11px] font-bold text-stone-500 truncate">
                          {data.regulationDetails?.fileName ||
                            "ارفع الملف (PDF/Image)"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* ربط بدليل الاشتراطات */}
                  <div>
                    <label className="block text-[12px] font-bold text-stone-700 mb-2">
                      الربط بدليل مرجعي
                    </label>
                    <div className="relative">
                      <select
                        value={data.regulationDetails?.linkedReferenceId || ""}
                        onChange={(e) =>
                          setModalData({
                            ...modalData,
                            data: {
                              ...data,
                              regulationDetails: {
                                ...data.regulationDetails,
                                linkedReferenceId: e.target.value,
                              },
                            },
                          })
                        }
                        className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-[11px] font-bold appearance-none outline-none focus:border-emerald-500"
                      >
                        <option value="">--- اختر اشتراطاً مرجعياً ---</option>
                        {referenceDocs.map((doc) => (
                          <option key={doc.id} value={doc.id}>
                            {doc.title}
                          </option>
                        ))}
                      </select>
                      <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>
        </form>

        {/* Footer */}
        <div className="p-4 border-t border-stone-100 bg-stone-50 flex gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-white border border-stone-200 text-stone-700 font-bold rounded-xl hover:bg-stone-50 w-32"
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={() => streetMutation.mutate(data)}
            disabled={streetMutation.isPending || !data.name || !data.width}
            className="flex-1 px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-md"
          >
            {streetMutation.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <CircleCheck className="w-5 h-5" />{" "}
                {modalData.mode === "edit"
                  ? "تحديث البيانات"
                  : "إضافة الشارع للمنظومة"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StreetModal;
