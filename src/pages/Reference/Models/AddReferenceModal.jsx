import React, { useState, useRef } from "react";
import { Plus, X, Upload, Filter, Brain, Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "../../../api/axios";

// 💡 دالة تحويل الأرقام (لتحويل الأرقام الهندية/العربية إلى إنجليزية)
const toEnglishNumbers = (str) => {
  if (str === null || str === undefined) return "";
  return String(str).replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d));
};

// 💡 دالة تحويل الرابط (تم إضافتها لتوحيد الدوال رغم أنها تُستخدم أكثر في العرض)
const getFullUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  let fixedUrl = url;
  if (url.startsWith("/uploads/")) {
    fixedUrl = `/api${url}`;
  }
  const baseUrl = "https://details-worksystem1.com";
  return `${baseUrl}${fixedUrl}`;
};

export default function AddReferenceModal({ isOpen, onClose }) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);

  // States
  const [title, setTitle] = useState("");
  const [source, setSource] = useState("");
  const [category, setCategory] = useState("اشتراطات");
  const [type, setType] = useState("");
  const [file, setFile] = useState(null);

  const [txTypes, setTxTypes] = useState([]);
  const [buildTypes, setBuildTypes] = useState([]);

  const [city, setCity] = useState("");
  const [floorsFrom, setFloorsFrom] = useState("");
  const [floorsTo, setFloorsTo] = useState("");
  const [streetFrom, setStreetFrom] = useState("");
  const [streetTo, setStreetTo] = useState("");

  const [issueDate, setIssueDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [autoAnalyze, setAutoAnalyze] = useState(true);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("source", source);
      formData.append("category", category);
      formData.append("type", type);
      if (file) formData.append("file", file);

      formData.append("transactionTypes", JSON.stringify(txTypes));
      formData.append("buildingTypes", JSON.stringify(buildTypes));

      formData.append("city", city);
      if (floorsFrom) formData.append("floorsFrom", floorsFrom);
      if (floorsTo) formData.append("floorsTo", floorsTo);
      if (streetFrom) formData.append("streetWidthFrom", streetFrom);
      if (streetTo) formData.append("streetWidthTo", streetTo);

      if (issueDate) formData.append("issueDate", issueDate);
      if (expiryDate) formData.append("expiryDate", expiryDate);
      formData.append("autoAnalyze", autoAnalyze);

      return await api.post("/references", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: () => {
      toast.success("تمت إضافة المرجع للمكتبة بنجاح");
      queryClient.invalidateQueries(["reference-documents"]);
      onClose();
    },
    onError: () => {
      toast.error("حدث خطأ أثناء حفظ المرجع");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !source || !category) {
      return toast.error("يرجى تعبئة الحقول الأساسية");
    }
    saveMutation.mutate();
  };

  const toggleArrayItem = (setter, state, item) => {
    setter(
      state.includes(item) ? state.filter((i) => i !== item) : [...state, item],
    );
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in"
      dir="rtl"
    >
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-slate-200 animate-in zoom-in-95">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Plus className="w-6 h-6 text-secondary-600" /> إضافة مرجع جديد
            للمكتبة
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-xl transition-colors"
          >
            <X className="w-6 h-6 text-slate-500" />
          </button>
        </div>

        <form className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar-slim">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-700">
                عنوان المرجع *
              </label>
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="مثال: كود البناء السعودي - العام"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                type="text"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-700">
                الجهة المصدرة *
              </label>
              <input
                required
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="مثال: أمانة منطقة الرياض"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                type="text"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-700">
                التصنيف *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
              >
                <option value="اشتراطات">اشتراطات</option>
                <option value="أدلة">أدلة</option>
                <option value="تعاميم">تعاميم</option>
                <option value="عروض">عروض</option>
                <option value="أخرى">أخرى</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-700">النوع</label>
              <input
                value={type}
                onChange={(e) => setType(e.target.value)}
                placeholder="مثال: تعميم، دليل إجرائي..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                type="text"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-700">
              المستند (PDF أو صورة)
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-3 transition-colors cursor-pointer group ${file ? "border-emerald-400 bg-emerald-50/50" : "border-slate-200 bg-slate-50 hover:bg-emerald-50/30"}`}
            >
              <div className="p-4 bg-white rounded-2xl shadow-sm group-hover:scale-110 transition-transform">
                <Upload
                  className={`w-8 h-8 ${file ? "text-emerald-500" : "text-emerald-600"}`}
                />
              </div>
              <div className="text-center">
                <p
                  className={`text-sm font-black ${file ? "text-emerald-700" : "text-slate-900"}`}
                >
                  {file ? file.name : "اسحب الملف هنا أو انقر للاختيار"}
                </p>
                <p className="text-[10px] font-bold text-slate-400 mt-1">
                  يدعم PDF, PNG, JPG (الحد الأقصى 20MB)
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,image/*"
                className="hidden"
                onChange={(e) => setFile(e.target.files[0])}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 pb-2 border-b">
              <Filter className="w-4 h-4 text-emerald-600" /> تحديد نطاق
              الانطباق (Applicability Scope)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-700">
                  أنواع المعاملات
                </label>
                <div className="flex flex-wrap gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl min-h-[46px]">
                  {["إصدار رخصة بناء", "تعديل رخصة بناء", "تصحيح وضع"].map(
                    (item) => (
                      <label
                        key={item}
                        className={`flex items-center gap-2 px-2 py-1 border rounded-lg cursor-pointer transition-colors ${txTypes.includes(item) ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-white border-slate-200 text-slate-600 hover:bg-emerald-50/50"}`}
                      >
                        <input
                          type="checkbox"
                          checked={txTypes.includes(item)}
                          onChange={() =>
                            toggleArrayItem(setTxTypes, txTypes, item)
                          }
                          className="w-3 h-3 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="text-[10px] font-bold">{item}</span>
                      </label>
                    ),
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-700">
                  أنواع المباني
                </label>
                <div className="flex flex-wrap gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl min-h-[46px]">
                  {["سكني", "تجاري", "إداري", "صناعي"].map((item) => (
                    <label
                      key={item}
                      className={`flex items-center gap-2 px-2 py-1 border rounded-lg cursor-pointer transition-colors ${buildTypes.includes(item) ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-white border-slate-200 text-slate-600 hover:bg-emerald-50/50"}`}
                    >
                      <input
                        type="checkbox"
                        checked={buildTypes.includes(item)}
                        onChange={() =>
                          toggleArrayItem(setBuildTypes, buildTypes, item)
                        }
                        className="w-3 h-3 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-[10px] font-bold">{item}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-700">
                  المدينة
                </label>
                <input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="مثال: الرياض، الكل"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/20"
                  type="text"
                />
              </div>
              {/* 💡 الاستخدام الصحيح لدالة toEnglishNumbers */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-700">
                  عدد الأدوار (من - إلى)
                </label>
                <div className="flex gap-2">
                  <input
                    value={floorsFrom}
                    onChange={(e) =>
                      setFloorsFrom(toEnglishNumbers(e.target.value))
                    }
                    placeholder="من"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/20"
                    type="text"
                  />
                  <input
                    value={floorsTo}
                    onChange={(e) =>
                      setFloorsTo(toEnglishNumbers(e.target.value))
                    }
                    placeholder="إلى"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/20"
                    type="text"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-700">
                  عرض الشارع (من - إلى)
                </label>
                <div className="flex gap-2">
                  <input
                    value={streetFrom}
                    onChange={(e) =>
                      setStreetFrom(toEnglishNumbers(e.target.value))
                    }
                    placeholder="من"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/20"
                    type="text"
                  />
                  <input
                    value={streetTo}
                    onChange={(e) =>
                      setStreetTo(toEnglishNumbers(e.target.value))
                    }
                    placeholder="إلى"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/20"
                    type="text"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-700">
                تاريخ الإصدار
              </label>
              <input
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/20"
                type="date"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-700">
                تاريخ الانتهاء (اختياري)
              </label>
              <input
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/20"
                type="date"
              />
            </div>
          </div>

          <div
            className={`p-6 rounded-3xl border flex items-center justify-between transition-colors ${autoAnalyze ? "bg-purple-50 border-purple-200" : "bg-slate-50 border-slate-200"}`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`p-3 rounded-2xl shadow-sm transition-colors ${autoAnalyze ? "bg-white text-purple-600" : "bg-slate-200 text-slate-500"}`}
              >
                <Brain className="w-6 h-6" />
              </div>
              <div>
                <p
                  className={`text-sm font-black transition-colors ${autoAnalyze ? "text-purple-900" : "text-slate-700"}`}
                >
                  بدء التحليل الذكي تلقائياً
                </p>
                <p
                  className={`text-[10px] font-bold transition-colors ${autoAnalyze ? "text-purple-600" : "text-slate-500"}`}
                >
                  سيقوم النظام باستخراج النص وتلخيصه وشرحه فور الرفع
                </p>
              </div>
            </div>
            <div
              onClick={() => setAutoAnalyze(!autoAnalyze)}
              className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${autoAnalyze ? "bg-purple-600" : "bg-slate-300"}`}
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${autoAnalyze ? "left-1 translate-x-6" : "left-1"}`}
              ></div>
            </div>
          </div>
        </form>

        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl text-sm font-black hover:bg-slate-100 transition-all"
          >
            إلغاء
          </button>
          <button
            onClick={handleSubmit}
            disabled={saveMutation.isPending}
            className="px-8 py-3 bg-emerald-600 text-white rounded-2xl text-sm font-black hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {saveMutation.isPending && (
              <Loader2 className="w-4 h-4 animate-spin" />
            )}
            حفظ وإضافة للمكتبة
          </button>
        </div>
      </div>
    </div>
  );
}
