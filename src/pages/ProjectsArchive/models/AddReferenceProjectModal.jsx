import React, { useState } from "react";
import {
  X,
  Plus,
  Save,
  Clock,
  CircleCheckBig,
  TriangleAlert,
  GitMerge,
  FolderArchive,
  FileText,
  FileBadge2,
  CloudUpload,
  Trash2,
  Brain,
  Building2,
  UserCheck,
  MapPin,
  Scale
} from "lucide-react";

export default function AddReferenceProjectModal({ isOpen, onClose }) {
  // للتحكم في خطوات الشاشة: 1 (الرفع) -> 2 (التحذير) -> 3 (الفورم)
  const [step, setStep] = useState(3); // افتراضياً جعلتها 3 لترى الفورم المعقد فوراً

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-slate-50 font-sans animate-in fade-in zoom-in-95"
      dir="rtl"
    >
      {/* ================= Header ================= */}
      <div className="bg-white border-b border-slate-200 px-8 py-4 shrink-0 shadow-sm flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-black text-slate-800 flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-600" /> إضافة مشروع مرجعي
              جديد
            </h1>
            <p className="text-[11px] font-bold text-slate-500">
              أدخل بيانات المشروع لإضافته للأرشيف. يمكنك الحفظ كمسودة واستكمال
              الباقي لاحقاً.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            إلغاء
          </button>

          {step === 3 && (
            <>
              <button className="px-4 py-2 bg-slate-50 text-slate-600 hover:bg-slate-100 text-sm font-bold flex items-center gap-2 rounded-xl transition-colors border border-slate-200">
                <span className="w-2 h-2 rounded-full bg-slate-400"></span>{" "}
                استكمال لاحقًا
              </button>
              <button className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 text-sm font-bold flex items-center gap-2 rounded-xl transition-colors border border-slate-200 shadow-sm">
                <Clock className="w-4 h-4" /> حفظ كمسودة
              </button>
            </>
          )}

          <button
            disabled={step !== 3}
            className={`px-6 py-2 text-sm font-black flex items-center gap-2 rounded-xl transition-colors shadow-sm
              ${
                step === 3
                  ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-600/20"
                  : "bg-slate-200 text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed"
              }`}
          >
            <Save className="w-4 h-4" /> إدراج في الأرشيف
          </button>
        </div>
      </div>

      {/* ================= الخطوة 1: شاشة الرفع ================= */}
      {step === 1 && (
        <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col items-center justify-center">
          <div className="max-w-2xl w-full">
            <div className="text-center mb-10">
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CloudUpload className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black text-slate-800 mb-2">
                لبدء مشروع جديد، ارفع ملفاته أولاً
              </h2>
              <p className="text-sm font-bold text-slate-500">
                سيقوم محرك استخراج البيانات المعتمد على الذكاء الاصطناعي بقراءة
                وتعبئة بيانات المشروع تلقائياً لتوفير وقتك.
              </p>
            </div>
            <div className="bg-white rounded-3xl border-dashed border-2 shadow-sm overflow-hidden transition-all cursor-pointer group p-10 flex flex-col items-center justify-center text-center border-slate-300 hover:border-indigo-300">
              <h3 className="text-sm font-black text-slate-800 mb-2">
                اسحب وأفلت الملفات هنا
              </h3>
              <p className="text-xs font-bold text-slate-400 mb-6">
                يدعم رفع ملفات (PDF, DWG, الصور)
              </p>
              <label className="px-8 py-3 bg-slate-100 text-slate-700 rounded-xl text-sm font-black hover:bg-slate-200 transition-colors border border-slate-200 cursor-pointer pointer-events-auto shadow-sm">
                <span className="pointer-events-none">تصفح ملفاتك لرفعها</span>
                <input multiple className="hidden" type="file" />
              </label>
            </div>
            <div className="mt-8">
              <h4 className="text-xs font-black text-slate-700 mb-3 flex items-center gap-2">
                <CircleCheckBig className="w-4 h-4 text-emerald-500" /> الملفات
                المدخلة للتحليل (1)
              </h4>
              <div className="space-y-2 mb-6 max-h-48 overflow-y-auto pr-2">
                <div className="bg-white p-3 border border-slate-200 rounded-xl flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-indigo-400" />
                    <span
                      className="text-xs font-bold text-slate-700"
                      dir="ltr"
                    >
                      image_2026-04-26_17-56-26.png
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                      image/png
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      0.10 MB
                    </span>
                    <button
                      className="text-rose-400 hover:text-rose-600 tooltip-trigger"
                      title="إزالة"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex justify-center text-center">
                <button
                  onClick={() => setStep(2)}
                  className="px-8 py-3.5 bg-indigo-600 text-white rounded-xl text-sm font-black shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 transition-all flex items-center gap-2 group w-full md:w-auto"
                >
                  <Brain className="w-5 h-5 group-hover:scale-110 transition-transform" />{" "}
                  تحليل باستخدام الذكاء الاصطناعي والمتابعة
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= الخطوة 2: شاشة تحذير التكرار ================= */}
      {step === 2 && (
        <div className="flex-1 overflow-y-auto p-4 md:p-8 flex items-center justify-center">
          <div className="max-w-md w-full bg-white p-10 rounded-3xl border border-slate-200 shadow-xl text-center relative overflow-hidden">
            <div
              className="animate-in fade-in zoom-in-95 duration-500 text-right"
              dir="rtl"
            >
              <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-200">
                <TriangleAlert className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-2 text-center">
                تنبيه: تكرار محتمل للمشروع
              </h3>
              <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 mb-6 text-sm">
                <p className="font-bold text-amber-800 mb-2">
                  الذكاء الاصطناعي وجد تطابق قوي مع الأرشيف:
                </p>
                <ul className="list-disc list-inside text-amber-700 space-y-1 text-xs">
                  <li>
                    تطابق <strong>رقم رخصة البناء (445012993)</strong> وسنة
                    الإصدار.
                  </li>
                  <li>
                    تطابق <strong>أرقام القطع</strong> مع مشروع{" "}
                    <b>مجمع واحة الرياض السكني</b> المؤرشف.
                  </li>
                </ul>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 text-sm text-right">
                <p className="font-bold text-slate-700 mb-2">
                  في حال الموافقة على الدّمج المتسلسل، سيتم:
                </p>
                <ul className="text-slate-600 text-xs space-y-1">
                  <li>
                    <Plus className="w-3 h-3 inline text-emerald-500" /> دمج{" "}
                    <strong>1 ملفات جديدة</strong> لسجل المشروع الأصلي بأمان.
                  </li>
                  <li>
                    <Plus className="w-3 h-3 inline text-emerald-500" /> إضافة{" "}
                    <strong>بيانات القطع الجديدة</strong> المستخرجة.
                  </li>
                </ul>
              </div>
              <div className="flex flex-col gap-3">
                <button className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-black transition-colors shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2">
                  <GitMerge className="w-5 h-5" /> دمج مع المشروع الأرشيفي
                  المتطابق
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-black transition-colors shadow-lg shadow-indigo-600/30"
                >
                  تجاهل وإنشاء كمشروع جديد مستقل
                </button>
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-sm font-black transition-colors"
                >
                  مراجعة ومقارنة الفروقات قبل الدمج
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= الخطوة 3: شاشة النموذج الرئيسي ================= */}
      {step === 3 && (
        <div
          className="flex-1 flex flex-col overflow-hidden bg-slate-100 p-3 gap-3 relative h-full font-sans"
          dir="rtl"
        >
          {/* ==================== Top Bar - AI Stats ==================== */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 px-5 py-3 flex flex-wrap lg:flex-nowrap items-center justify-between shrink-0 gap-4">
            <div className="flex items-center gap-6 w-full lg:w-auto">
              <div className="flex-1 lg:flex-none">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1.5 flex justify-between">
                  <span>نسبة التعبئة والاستخراج (AI)</span>{" "}
                  <span className="text-emerald-600">92%</span>
                </p>
                <div className="w-full lg:w-48 h-2 bg-slate-100 rounded-full overflow-hidden leading-none">
                  <div className="h-full bg-emerald-500 w-[92%] rounded-full"></div>
                </div>
              </div>
              <div className="hidden lg:block w-px h-8 bg-slate-200"></div>
              <div className="flex gap-5 text-center shrink-0">
                <div>
                  <span className="text-lg font-black text-emerald-600 leading-none flex items-center justify-center gap-1">
                    <CircleCheckBig className="w-3.5 h-3.5" /> 34
                  </span>
                  <span className="text-[9px] text-slate-500 font-bold uppercase mt-1 block">
                    حقل مستخرج آلياً
                  </span>
                </div>
                <div>
                  <span className="text-lg font-black text-amber-500 leading-none flex items-center justify-center gap-1">
                    <TriangleAlert className="w-3.5 h-3.5" /> 3
                  </span>
                  <span className="text-[9px] text-slate-500 font-bold uppercase mt-1 block">
                    حقل يتطلب مراجعة
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-lg border border-amber-200 text-xs font-bold shadow-sm">
                <TriangleAlert className="w-3.5 h-3.5" /> تطابق قوي مع
                (445012993)
                <button className="mr-2 px-2 py-1 bg-amber-500 text-white rounded text-[10px] hover:bg-amber-600 transition shadow-sm font-black flex items-center gap-1">
                  <GitMerge className="w-3 h-3" /> دمج السجل
                </button>
              </div>
            </div>
          </div>

          {/* ==================== Grid Layout ==================== */}
          <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-3 h-full">
            {/* Sidebar (AI Sources) */}
            <div className="hidden lg:flex col-span-3 bg-white rounded-xl shadow-sm border border-slate-200 flex-col overflow-hidden">
              <div className="p-3 border-b border-slate-100 bg-slate-50 shrink-0">
                <h3 className="text-xs font-black text-slate-700 flex items-center gap-2">
                  <FolderArchive className="w-4 h-4 text-indigo-500" /> المصادر
                  والملفات (3)
                </h3>
                <p className="text-[9px] text-slate-400 mt-1">
                  يعتمد الاستخراج الآلي على هذه المرفقات.
                </p>
              </div>
              <div className="p-2 overflow-y-auto space-y-1">
                <div className="flex items-start gap-2 p-2 hover:bg-slate-50 rounded-lg group cursor-pointer border border-transparent hover:border-slate-200 transition-colors">
                  <FileText className="w-4 h-4 text-indigo-400 mt-0.5 group-hover:text-indigo-600 shrink-0" />
                  <div className="overflow-hidden">
                    <p
                      className="text-[10px] font-bold text-slate-700 truncate"
                      dir="ltr"
                    >
                      License_445012993.pdf
                    </p>
                    <p className="text-[9px] text-slate-400 font-mono mt-0.5">
                      pdf • 1.2 MB
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2 p-2 hover:bg-slate-50 rounded-lg group cursor-pointer border border-transparent hover:border-slate-200 transition-colors">
                  <FileText className="w-4 h-4 text-emerald-400 mt-0.5 group-hover:text-emerald-600 shrink-0" />
                  <div className="overflow-hidden">
                    <p
                      className="text-[10px] font-bold text-slate-700 truncate"
                      dir="ltr"
                    >
                      Blueprint_FloorPlan.dwg
                    </p>
                    <p className="text-[9px] text-slate-400 font-mono mt-0.5">
                      dwg • 4.5 MB
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-3 border-t border-slate-100 bg-slate-50 mt-auto">
                <div className="bg-indigo-50 border border-indigo-100 p-2.5 rounded-lg text-indigo-800 text-[10px] font-bold leading-relaxed">
                  💡 الذكاء الاصطناعي قام بملء أغلب الحقول بذكاء بناءً على هذه
                  المرفقات. يرجى مراجعة الحقول المظللة باللون الأصفر أو الأحمر.
                </div>
              </div>
            </div>

            {/* Main Form Area */}
            <div className="col-span-1 lg:col-span-9 overflow-y-auto rounded-xl custom-scrollbar pr-1 pb-10">
              <div className="flex flex-col gap-4">
                {/* --- 1. Identity & Type --- */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                  <h4 className="text-sm font-black text-slate-800 border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-indigo-600" /> 1. معلومات
                    المشروع الأساسية
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="text-[10px] font-bold text-slate-500 mb-1.5 flex items-center justify-between">
                        <span>
                          اسم المشروع <span className="text-rose-500">*</span>
                        </span>
                        <span className="text-[9px] text-emerald-600 bg-emerald-50 px-1.5 rounded">
                          مستخرج
                        </span>
                      </label>
                      <input
                        readOnly
                        className="w-full px-3 py-2 text-xs font-bold border rounded-lg outline-none bg-emerald-50/30 border-emerald-200"
                        type="text"
                        value="برج واحة الأعمال المتعدد"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 mb-1.5 block">
                        الرقم الموحد (كود الأرشفة)
                      </label>
                      <input
                        readOnly
                        className="w-full px-3 py-2 text-xs font-mono font-bold border rounded-lg outline-none bg-slate-50 border-slate-200 text-slate-500"
                        type="text"
                        value="ARC-2023-001"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 mb-1.5 flex items-center justify-between">
                        <span>
                          نوع المشروع <span className="text-rose-500">*</span>
                        </span>
                        <span className="text-[9px] text-emerald-600 bg-emerald-50 px-1.5 rounded">
                          تصنيف ذكي
                        </span>
                      </label>
                      <select className="w-full px-3 py-2 text-xs font-bold border rounded-lg outline-none bg-emerald-50/30 border-emerald-200">
                        <option value="متعدد الاستخدامات">
                          متعدد الاستخدامات (سكني/تجاري/مكتبي)
                        </option>
                        <option value="سكني">سكني</option>
                        <option value="تجاري">تجاري</option>
                      </select>
                    </div>
                    <div className="md:col-span-2 relative">
                      <label className="text-[10px] font-bold text-slate-500 mb-1.5 flex items-center justify-between">
                        <span>
                          نوع المعاملة <span className="text-rose-500">*</span>
                        </span>
                        <span className="text-[9px] text-rose-600 bg-rose-50 px-1.5 rounded flex items-center gap-0.5">
                          إدخال يدوي
                        </span>
                      </label>
                      <input
                        placeholder="مثال: إصدار جديد، تعديل مكونات..."
                        className="w-full px-3 py-2 text-xs font-bold border rounded-lg outline-none focus:border-indigo-400 bg-white border-rose-200"
                        type="text"
                      />
                    </div>
                  </div>
                </div>

                {/* --- 2. Ownership --- */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                  <h4 className="text-sm font-black text-slate-800 border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-indigo-600" /> 2. بيانات
                    المالك
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2">
                      <label className="text-[10px] font-bold text-slate-500 mb-1.5 block">
                        اسم المالك
                      </label>
                      <input
                        readOnly
                        className="w-full px-3 py-2 text-xs font-bold border rounded-lg outline-none bg-emerald-50/30 border-emerald-200"
                        type="text"
                        value="شركة العثيم للاستثمار والتطوير العقاري"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 mb-1.5 block">
                        نوع المالك
                      </label>
                      <select className="w-full px-3 py-2 text-xs font-bold border rounded-lg outline-none bg-emerald-50/30 border-emerald-200">
                        <option>اعتباري (شركة)</option>
                        <option>طبيعي (أفراد)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 mb-1.5 block">
                        رقم الإثبات / السجل
                      </label>
                      <input
                        readOnly
                        className="w-full px-3 py-2 text-xs font-mono font-bold border rounded-lg outline-none bg-emerald-50/30 border-emerald-200"
                        type="text"
                        value="1010213454"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-[10px] font-bold text-slate-500 mb-1.5 flex items-center justify-between">
                        <span>رقم الجوال / الاتصال</span>
                        <span className="text-[9px] text-amber-600 bg-amber-50 px-1.5 rounded">
                          يتطلب تأكيد
                        </span>
                      </label>
                      <input
                        className="w-full px-3 py-2 text-xs font-mono font-bold border rounded-lg outline-none bg-amber-50/30 border-amber-300 focus:ring-2 focus:ring-amber-100"
                        type="text"
                        defaultValue="0500000000"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-[10px] font-bold text-slate-500 mb-1.5 block">
                        صندوق البريد
                      </label>
                      <input
                        className="w-full px-3 py-2 text-xs font-bold border rounded-lg outline-none bg-slate-50 border-slate-200 focus:border-indigo-400"
                        type="text"
                        placeholder="الرمز البريدي / ص.ب"
                      />
                    </div>
                  </div>
                </div>

                {/* --- 3. Legal & Licenses --- */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                  <h4 className="text-sm font-black text-slate-800 border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
                    <FileBadge2 className="w-4 h-4 text-indigo-600" /> 3. الرخص
                    والصكوك القانونية
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 mb-1.5 block">
                        رقم رخصة البناء
                      </label>
                      <input
                        readOnly
                        className="w-full px-3 py-2 text-xs font-mono font-bold border rounded-lg outline-none bg-emerald-50/30 border-emerald-200"
                        type="text"
                        value="15/1/7/27"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 mb-1.5 block">
                        تاريخ الإصدار
                      </label>
                      <input
                        readOnly
                        className="w-full px-3 py-2 text-xs font-mono font-bold border rounded-lg outline-none bg-emerald-50/30 border-emerald-200"
                        type="text"
                        value="1419-01-19"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 mb-1.5 flex items-center justify-between">
                        <span>تاريخ الانتهاء</span>
                        <span className="text-[9px] text-amber-600 bg-amber-50 px-1.5 rounded">
                          غير متوفر
                        </span>
                      </label>
                      <input
                        className="w-full px-3 py-2 text-xs font-mono font-bold border rounded-lg outline-none bg-amber-50/30 border-amber-300"
                        type="date"
                      />
                    </div>
                    <div></div> {/* Empty for grid alignment */}
                    <div className="md:col-span-2">
                      <label className="text-[10px] font-bold text-slate-500 mb-1.5 block">
                        رقم صك الملكية
                      </label>
                      <input
                        readOnly
                        className="w-full px-3 py-2 text-xs font-mono font-bold border rounded-lg outline-none bg-emerald-50/30 border-emerald-200"
                        type="text"
                        value="310117020013"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 mb-1.5 block">
                        تاريخ الصك
                      </label>
                      <input
                        readOnly
                        className="w-full px-3 py-2 text-xs font-mono font-bold border rounded-lg outline-none bg-emerald-50/30 border-emerald-200"
                        type="text"
                        value="1433-11-03"
                      />
                    </div>
                  </div>
                </div>

                {/* --- 4. Location & Boundaries --- */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                  <h4 className="text-sm font-black text-slate-800 border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-indigo-600" /> 4. الموقع
                    والمحددات المكانية
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 mb-1.5 block">
                        المدينة
                      </label>
                      <input
                        readOnly
                        className="w-full px-3 py-2 text-xs font-bold border rounded-lg outline-none bg-emerald-50/30 border-emerald-200"
                        type="text"
                        value="الرياض"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 mb-1.5 block">
                        الحي
                      </label>
                      <input
                        readOnly
                        className="w-full px-3 py-2 text-xs font-bold border rounded-lg outline-none bg-emerald-50/30 border-emerald-200"
                        type="text"
                        value="الربوة"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 mb-1.5 block">
                        رقم المخطط التنظيمي
                      </label>
                      <input
                        readOnly
                        className="w-full px-3 py-2 text-xs font-mono font-bold border rounded-lg outline-none bg-emerald-50/30 border-emerald-200"
                        type="text"
                        value="720"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 mb-1.5 block">
                        أرقام القطع
                      </label>
                      <input
                        readOnly
                        className="w-full px-3 py-2 text-xs font-mono font-bold border rounded-lg outline-none bg-emerald-50/30 border-emerald-200"
                        type="text"
                        value="1179"
                      />
                    </div>
                    <div className="md:col-span-4">
                      <label className="text-[10px] font-bold text-slate-500 mb-1.5 block">
                        اسم الشارع الرئيسي وعرضه
                      </label>
                      <input
                        readOnly
                        className="w-full px-3 py-2 text-xs font-bold border rounded-lg outline-none bg-emerald-50/30 border-emerald-200"
                        type="text"
                        value="الطريق الدائري الشرقي - عرض 100م"
                      />
                    </div>
                  </div>

                  {/* Borders Table */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <h5 className="text-[11px] font-black text-slate-700 mb-3">
                      الحدود الجغرافية (Borders)
                    </h5>
                    <div className="grid grid-cols-5 gap-2 text-[10px] font-bold text-slate-500 text-center mb-2">
                      <div className="col-span-1 text-right">الاتجاه</div>
                      <div className="col-span-3">وصف الحد (شارع/جار)</div>
                      <div className="col-span-1">الطول (م)</div>
                    </div>
                    <div className="space-y-2">
                      {/* North */}
                      <div className="grid grid-cols-5 gap-2 items-center">
                        <span className="col-span-1 font-black text-slate-700">
                          شمالاً
                        </span>
                        <input
                          className="col-span-3 px-2 py-1.5 text-xs bg-white border border-slate-200 rounded outline-none focus:border-indigo-400"
                          type="text"
                          defaultValue="بقية البلوك 1173"
                        />
                        <input
                          className="col-span-1 px-2 py-1.5 text-xs font-mono text-center bg-white border border-slate-200 rounded outline-none focus:border-indigo-400"
                          type="text"
                          defaultValue="45.20"
                        />
                      </div>
                      {/* South */}
                      <div className="grid grid-cols-5 gap-2 items-center">
                        <span className="col-span-1 font-black text-slate-700">
                          جنوباً
                        </span>
                        <input
                          className="col-span-3 px-2 py-1.5 text-xs bg-white border border-slate-200 rounded outline-none focus:border-indigo-400"
                          type="text"
                          defaultValue="شارع عرض 20م"
                        />
                        <input
                          className="col-span-1 px-2 py-1.5 text-xs font-mono text-center bg-white border border-slate-200 rounded outline-none focus:border-indigo-400"
                          type="text"
                          defaultValue="155.00"
                        />
                      </div>
                      {/* East */}
                      <div className="grid grid-cols-5 gap-2 items-center">
                        <span className="col-span-1 font-black text-slate-700">
                          شرقاً
                        </span>
                        <input
                          className="col-span-3 px-2 py-1.5 text-xs bg-white border border-slate-200 rounded outline-none focus:border-indigo-400"
                          type="text"
                          defaultValue="الطريق الدائري عرض 100م"
                        />
                        <input
                          className="col-span-1 px-2 py-1.5 text-xs font-mono text-center bg-white border border-slate-200 rounded outline-none focus:border-indigo-400"
                          type="text"
                          defaultValue="117.00"
                        />
                      </div>
                      {/* West */}
                      <div className="grid grid-cols-5 gap-2 items-center">
                        <span className="col-span-1 font-black text-slate-700">
                          غرباً
                        </span>
                        <input
                          className="col-span-3 px-2 py-1.5 text-xs bg-white border border-slate-200 rounded outline-none focus:border-indigo-400"
                          type="text"
                          defaultValue="شارع عرض 10م"
                        />
                        <input
                          className="col-span-1 px-2 py-1.5 text-xs font-mono text-center bg-white border border-slate-200 rounded outline-none focus:border-indigo-400"
                          type="text"
                          defaultValue="225.81"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* --- 5. Engineering Specs --- */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                  <h4 className="text-sm font-black text-slate-800 border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
                    <Scale className="w-4 h-4 text-indigo-600" /> 5. المواصفات
                    الهندسية والمساحات
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="md:col-span-2">
                      <label className="text-[10px] font-bold text-slate-500 mb-1.5 block">
                        مساحة الأرض الإجمالية (م2)
                      </label>
                      <input
                        readOnly
                        className="w-full px-3 py-2 text-sm font-mono font-black text-indigo-700 border rounded-lg outline-none bg-indigo-50/50 border-indigo-200"
                        type="text"
                        value="31457.31"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 mb-1.5 block">
                        نسبة التغطية %
                      </label>
                      <input
                        readOnly
                        className="w-full px-3 py-2 text-xs font-mono font-bold border rounded-lg outline-none bg-emerald-50/30 border-emerald-200"
                        type="text"
                        value="45.5%"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 mb-1.5 block">
                        معامل البناء F.A.R
                      </label>
                      <input
                        readOnly
                        className="w-full px-3 py-2 text-xs font-mono font-bold border rounded-lg outline-none bg-emerald-50/30 border-emerald-200"
                        type="text"
                        value="1.2"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 mb-1.5 block">
                        الأدوار (فوق الأرض)
                      </label>
                      <input
                        readOnly
                        className="w-full px-3 py-2 text-xs font-mono text-center font-bold border rounded-lg outline-none bg-emerald-50/30 border-emerald-200"
                        type="number"
                        value="2"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 mb-1.5 block">
                        الأدوار (تحت الأرض)
                      </label>
                      <input
                        readOnly
                        className="w-full px-3 py-2 text-xs font-mono text-center font-bold border rounded-lg outline-none bg-emerald-50/30 border-emerald-200"
                        type="number"
                        value="1"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 mb-1.5 block">
                        المواقف (المطلوبة)
                      </label>
                      <input
                        readOnly
                        className="w-full px-3 py-2 text-xs font-mono text-center font-bold border rounded-lg outline-none bg-slate-50 border-slate-200"
                        type="number"
                        value="400"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 mb-1.5 block">
                        المواقف (المتوفرة)
                      </label>
                      <input
                        readOnly
                        className="w-full px-3 py-2 text-xs font-mono text-center font-bold border rounded-lg outline-none bg-emerald-50/30 border-emerald-200"
                        type="number"
                        value="420"
                      />
                    </div>
                  </div>

                  {/* Area per Floor Table */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-4">
                    <h5 className="text-[11px] font-black text-slate-700 mb-3">
                      تفصيل مسطحات البناء
                    </h5>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-white border border-slate-200 p-2 rounded text-center">
                        <span className="block text-[9px] text-slate-400 font-bold mb-1">
                          القبو
                        </span>
                        <span className="font-mono text-xs font-black text-slate-700">
                          14,200 م2
                        </span>
                      </div>
                      <div className="bg-white border border-slate-200 p-2 rounded text-center">
                        <span className="block text-[9px] text-slate-400 font-bold mb-1">
                          الأرضي
                        </span>
                        <span className="font-mono text-xs font-black text-slate-700">
                          14,100 م2
                        </span>
                      </div>
                      <div className="bg-white border border-slate-200 p-2 rounded text-center">
                        <span className="block text-[9px] text-slate-400 font-bold mb-1">
                          الدور الأول
                        </span>
                        <span className="font-mono text-xs font-black text-slate-700">
                          18,345 م2
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Setbacks Table */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <h5 className="text-[11px] font-black text-slate-700 mb-3 flex justify-between">
                      <span>الارتدادات (Setbacks)</span>
                      <span className="text-[9px] text-rose-500 flex items-center gap-1">
                        <TriangleAlert className="w-3 h-3" /> يوجد تضارب في
                        المخططات
                      </span>
                    </h5>
                    <table className="w-full text-right text-[10px] font-bold">
                      <thead className="text-slate-400 border-b border-slate-200">
                        <tr>
                          <th className="py-1.5">الجهة</th>
                          <th className="py-1.5 text-center">النظامي (م)</th>
                          <th className="py-1.5 text-center">المنفذ (م)</th>
                          <th className="py-1.5 text-center">الحالة</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        <tr>
                          <td className="py-2">شمال</td>
                          <td className="py-2 text-center font-mono">6.00</td>
                          <td className="py-2 text-center font-mono">6.00</td>
                          <td className="py-2 text-center text-emerald-500">
                            مطابق
                          </td>
                        </tr>
                        <tr className="bg-rose-50/50">
                          <td className="py-2 text-rose-700">جنوب</td>
                          <td className="py-2 text-center font-mono">8.70</td>
                          <td className="py-2 text-center font-mono text-rose-600">
                            4.00
                          </td>
                          <td className="py-2 text-center text-rose-500 font-black">
                            مخالف
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2">شرق</td>
                          <td className="py-2 text-center font-mono">20.00</td>
                          <td className="py-2 text-center font-mono">20.00</td>
                          <td className="py-2 text-center text-emerald-500">
                            مطابق
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2">غرب</td>
                          <td className="py-2 text-center font-mono">10.87</td>
                          <td className="py-2 text-center font-mono">10.90</td>
                          <td className="py-2 text-center text-emerald-500">
                            مطابق
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* --- 6. Professionals & Notes --- */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                  <h4 className="text-sm font-black text-slate-800 border-b border-slate-100 pb-3 mb-4">
                    6. الأطراف المهنية والملاحظات
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 mb-1.5 block">
                        المكتب المصمم
                      </label>
                      <input
                        readOnly
                        className="w-full px-3 py-2 text-xs font-bold border rounded-lg outline-none bg-emerald-50/30 border-emerald-200"
                        type="text"
                        value="سحاب للاستشارات الهندسية"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 mb-1.5 block">
                        رقم تصريح المكتب
                      </label>
                      <input
                        readOnly
                        className="w-full px-3 py-2 text-xs font-mono font-bold border rounded-lg outline-none bg-emerald-50/30 border-emerald-200"
                        type="text"
                        value="1302"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-[10px] font-bold text-slate-500 mb-1.5 block">
                        المكتب المشرف
                      </label>
                      <input
                        className="w-full px-3 py-2 text-xs font-bold border rounded-lg outline-none bg-white border-slate-200 focus:border-indigo-400"
                        type="text"
                        placeholder="أدخل اسم المكتب المشرف إن وجد..."
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-[10px] font-bold text-slate-500 mb-1.5 block">
                        ملاحظات الأرشفة (المنسق)
                      </label>
                      <textarea
                        rows="3"
                        className="w-full px-3 py-2 text-xs font-bold border rounded-lg outline-none bg-slate-50 border-slate-200 focus:border-indigo-400 resize-none leading-relaxed"
                        placeholder="اكتب أي ملاحظات إضافية حول الملفات أو التجاوزات المكتشفة..."
                        defaultValue="يوجد كشك بالارتداد الشرقي بالجهة الجنوبية مساحته 15.5م. تم دمج وحدات بالدور الأرضي."
                      ></textarea>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
