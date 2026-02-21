import React, { useState } from "react";
import {
  Upload,
  SquarePen,
  CircleCheckBig,
  Star,
  Shield,
  X,
  User,
  MapPin,
  Building,
  Users,
  UsersRound,
  FileCheck,
} from "lucide-react";

// قائمة خطوات المعالج
const WIZARD_STEPS = [
  { id: 1, label: "طريقة الإنشاء" },
  { id: 2, label: "نوع العميل" },
  { id: 3, label: "البيانات الأساسية" },
  { id: 4, label: "العنوان والتواصل" },
  { id: 5, label: "الوثائق" },
];

// 👈 1. هنا السطر الأهم: استلام دالة onComplete من الغلاف
const CreateClientWizard = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [creationMethod, setCreationMethod] = useState("ai"); // 'ai' or 'manual'
  const [clientType, setClientType] = useState("saudi_individual");

  // دوال التنقل بين الخطوات
  const nextStep = () => {
    if (currentStep < 5) {
      setCurrentStep((p) => p + 1);
    } else {
      // 👈 2. إذا كنا في الخطوة الأخيرة وضغطنا حفظ نهائي، نعود للوحة
      if (onComplete) onComplete();
    }
  };
  const prevStep = () => currentStep > 1 && setCurrentStep((p) => p - 1);

  // =========================================================
  // مكونات الخطوات (مفصولة لتنظيم الكود)
  // =========================================================

  // 1. خطوة طريقة الإنشاء ونتائج الـ AI
  const Step1CreationMethod = () => (
    <div className="bg-white rounded-xl p-6 mb-6 shadow-sm min-h-[400px]">
      <h3 className="text-xl font-bold mb-2 text-slate-800">
        طريقة إنشاء ملف العميل
      </h3>
      <p className="text-[13px] text-slate-500 mb-6">
        يمكنك رفع وثيقة هوية العميل لاستخراج البيانات تلقائياً بالذكاء
        الاصطناعي، أو الإدخال يدوياً
      </p>

      {/* خيارات الطريقة */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* رفع بالذكاء الاصطناعي */}
        <div
          onClick={() => setCreationMethod("ai")}
          className={`p-7 rounded-2xl cursor-pointer transition-all text-center relative overflow-hidden ${
            creationMethod === "ai"
              ? "bg-violet-50 border-2 border-violet-500 shadow-[0_4px_16px_rgba(139,92,246,0.15)]"
              : "bg-white border-2 border-slate-200 shadow-sm hover:border-violet-300"
          }`}
        >
          {creationMethod === "ai" && (
            <div className="absolute top-3 left-3">
              <CircleCheckBig className="w-5 h-5 text-violet-500" />
            </div>
          )}
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br from-violet-500 to-purple-700 mx-auto mb-4 shadow-[0_4px_12px_rgba(139,92,246,0.3)]">
            <Upload className="w-8 h-8 text-white" />
          </div>
          <div className="text-lg font-bold text-slate-800 mb-2">
            رفع وثيقة هوية (AI)
          </div>
          <div className="text-xs text-slate-500 leading-relaxed">
            ارفع صورة أو ملف PDF لهوية العميل <br /> وسيتم استخراج البيانات
            تلقائياً
          </div>
          <div className="mt-4 px-3 py-1.5 bg-violet-100 rounded-full text-[11px] font-bold text-violet-600 inline-block">
            OCR + NER + GPT
          </div>
        </div>

        {/* إدخال يدوي */}
        <div
          onClick={() => setCreationMethod("manual")}
          className={`p-7 rounded-2xl cursor-pointer transition-all text-center relative ${
            creationMethod === "manual"
              ? "bg-emerald-50 border-2 border-emerald-500 shadow-[0_4px_16px_rgba(16,185,129,0.15)]"
              : "bg-white border-2 border-slate-200 shadow-sm hover:border-emerald-300"
          }`}
        >
          {creationMethod === "manual" && (
            <div className="absolute top-3 left-3">
              <CircleCheckBig className="w-5 h-5 text-emerald-500" />
            </div>
          )}
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600 mx-auto mb-4 shadow-[0_4px_12px_rgba(16,185,129,0.3)]">
            <SquarePen className="w-8 h-8 text-white" />
          </div>
          <div className="text-lg font-bold text-slate-800 mb-2">
            إدخال يدوي
          </div>
          <div className="text-xs text-slate-500 leading-relaxed">
            أدخل بيانات العميل يدوياً <br /> اختيار النوع ثم تعبئة الحقول
          </div>
          <div className="mt-4 px-3 py-1.5 bg-emerald-100 rounded-full text-[11px] font-bold text-emerald-700 inline-block">
            كلاسيكي
          </div>
        </div>
      </div>

      {/* منطقة محاكاة الرفع والذكاء الاصطناعي (تظهر فقط إذا اختار AI) */}
      {creationMethod === "ai" && (
        <div className="p-6 bg-violet-50/50 border-2 border-violet-200 rounded-2xl animate-in fade-in slide-in-from-bottom-4">
          <div className="text-[15px] font-bold text-violet-700 mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5" /> رفع وثيقة هوية العميل
          </div>

          {/* محاكاة ملف مرفوع مسبقاً للـ AI */}
          <div className="border-2 border-dashed border-emerald-500 rounded-xl p-4 text-center bg-emerald-50 mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-100 rounded-lg">
                <CircleCheckBig className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-slate-800">
                  1-left.png
                </div>
                <div className="text-xs text-slate-500">644.4 KB</div>
              </div>
            </div>
            <button className="p-1.5 bg-red-100 hover:bg-red-200 rounded-md transition-colors text-red-600">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* نتائج الذكاء الاصطناعي */}
          <div className="mt-6 p-5 bg-white rounded-xl border-2 border-emerald-100 shadow-sm">
            <div className="flex justify-between items-center mb-5 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <CircleCheckBig className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <div className="text-[15px] font-bold text-slate-800">
                    نتائج الاستخراج الذكي
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    دقة: <span className="font-bold text-emerald-600">98%</span>{" "}
                    — نوع العميل المقترح:{" "}
                    <span className="font-bold text-violet-600">فرد سعودي</span>
                  </div>
                </div>
              </div>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[11px] font-bold">
                17 حقل
              </span>
            </div>

            {/* شبكة الحقول المستخرجة */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {[
                {
                  label: "الاسم الأول (عربي)",
                  val: "عبدالرحمن",
                  score: "97%",
                  color: "emerald",
                },
                {
                  label: "اسم الأب (عربي)",
                  val: "محمد",
                  score: "95%",
                  color: "emerald",
                },
                {
                  label: "اسم العائلة (عربي)",
                  val: "الغامدي",
                  score: "97%",
                  color: "emerald",
                },
                {
                  label: "الاسم الأول (إنجليزي)",
                  val: "Abdulrahman",
                  score: "88%",
                  color: "amber",
                },
                {
                  label: "اسم العائلة (إنجليزي)",
                  val: "Alghamdi",
                  score: "88%",
                  color: "amber",
                },
                {
                  label: "رقم الهوية",
                  val: "1089456723",
                  score: "99%",
                  color: "emerald",
                },
                {
                  label: "تاريخ الميلاد (هجري)",
                  val: "1405/06/15",
                  score: "94%",
                  color: "emerald",
                },
                {
                  label: "الجنسية",
                  val: "سعودي",
                  score: "99%",
                  color: "emerald",
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 rounded-lg border ${item.color === "emerald" ? "bg-emerald-50/50 border-emerald-200" : "bg-amber-50/50 border-amber-200"}`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[11px] text-slate-500 font-bold">
                      {item.label}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${item.color === "emerald" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}
                    >
                      {item.score}
                    </span>
                  </div>
                  <div className="text-sm font-bold text-slate-800">
                    {item.val}
                  </div>
                </div>
              ))}
            </div>

            {/* أزرار اعتماد الـ AI */}
            <div className="flex gap-3 mt-5 pt-4 border-t border-slate-100">
              <button
                onClick={nextStep}
                className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 shadow-[0_2px_8px_rgba(16,185,129,0.3)] hover:opacity-90 transition-opacity"
              >
                <CircleCheckBig className="w-5 h-5" /> اعتماد ومتابعة
              </button>
              <button className="py-3 px-6 bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-sm font-bold hover:bg-slate-200 transition-colors">
                إعادة المحاولة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // 2. خطوة نوع العميل
  const Step2ClientType = () => (
    <div className="bg-white rounded-xl p-6 mb-6 shadow-sm min-h-[400px]">
      <h3 className="text-lg font-bold mb-2 text-slate-800">اختر نوع العميل</h3>
      <div className="p-3 bg-violet-50 border border-violet-100 rounded-lg mb-5 flex items-center gap-2">
        <Star className="w-4 h-4 text-violet-600" />
        <span className="text-xs text-violet-800 font-medium">
          تم اقتراح النوع تلقائياً بناءً على وثيقة الهوية — يمكنك تغييره
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[
          {
            id: "saudi_individual",
            label: "فرد سعودي",
            icon: Users,
            color: "emerald",
          },
          {
            id: "non_saudi",
            label: "فرد غير سعودي",
            icon: Users,
            color: "blue",
          },
          {
            id: "company",
            label: "شركة/مؤسسة",
            icon: Building,
            color: "violet",
          },
          { id: "gov", label: "جهة حكومية", icon: Building, color: "red" },
          { id: "heirs", label: "ورثة", icon: UsersRound, color: "amber" },
          {
            id: "office",
            label: "مكتب هندسي/وسيط",
            icon: Building,
            color: "cyan",
          },
        ].map((type) => {
          const isActive = clientType === type.id;
          return (
            <div
              key={type.id}
              onClick={() => setClientType(type.id)}
              className={`p-5 rounded-xl cursor-pointer text-center transition-all duration-200 ${
                isActive
                  ? `bg-white border-2 border-${type.color}-500 shadow-[0_4px_12px_rgba(0,0,0,0.08)] scale-105`
                  : "bg-white border-2 border-slate-100 shadow-sm hover:border-slate-300"
              }`}
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 ${isActive ? `bg-${type.color}-100 text-${type.color}-600` : "bg-slate-50 text-slate-400"}`}
              >
                <type.icon className="w-6 h-6" />
              </div>
              <div
                className={`text-sm font-bold ${isActive ? "text-slate-800" : "text-slate-600"}`}
              >
                {type.label}
              </div>
              {isActive && (
                <div className="mt-3">
                  <CircleCheckBig
                    className={`w-5 h-5 mx-auto text-${type.color}-500`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  // 3. خطوة البيانات الأساسية (بأسلوب الـ AI)
  const Step3BasicData = () => (
    <div className="bg-white rounded-xl p-6 mb-6 shadow-sm min-h-[400px]">
      <h3 className="text-lg font-bold mb-2 text-slate-800">
        البيانات الأساسية
      </h3>

      <div className="p-2.5 bg-violet-50 border border-violet-100 rounded-lg mb-5 flex items-center gap-2">
        <Star className="w-4 h-4 text-violet-600 shrink-0" />
        <span className="text-[11px] text-violet-800 font-medium leading-relaxed">
          الحقول المحاطة بإطار بنفسجي تم تعبئتها تلقائياً بالذكاء الاصطناعي —
          الاسم الإنجليزي يُترجم تلقائياً إن لم يكن موجوداً.
        </span>
      </div>

      <div className="flex flex-col md:flex-row gap-6 mb-6">
        {/* رفع الصورة */}
        <div className="shrink-0 w-full md:w-[120px]">
          <label className="flex items-center text-xs font-bold mb-2 text-slate-700">
            صورة العميل{" "}
            <span className="text-[9px] text-violet-600 bg-violet-100 px-1.5 py-0.5 rounded ml-1 font-black">
              AI
            </span>
          </label>
          <div className="h-[140px] border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors">
            <Upload className="w-5 h-5 text-slate-400 mb-2" />
            <span className="text-[10px] text-slate-500 font-bold">
              رفع صورة
            </span>
            <span className="text-[8px] text-slate-400 mt-1">JPG / PNG</span>
          </div>
        </div>

        {/* حقول الاسم */}
        <div className="flex-1 space-y-3">
          <div className="p-2.5 bg-emerald-50 rounded-lg flex items-center gap-2 border border-emerald-100 mb-1">
            <User className="w-4 h-4 text-emerald-600" />
            <span className="text-xs text-emerald-700 font-bold">
              الاسم الرباعي — عربي + إنجليزي
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <AIFilledInput
              label="الاسم الأول *"
              valueAr="عبدالرحمن"
              valueEn="Abdulrahman"
              labelEn="First Name"
            />
            <AIFilledInput
              label="اسم الأب"
              valueAr="محمد"
              valueEn="Mohammed"
              labelEn="Father Name"
            />
            <AIFilledInput
              label="اسم الجد"
              valueAr="بن سعود"
              valueEn="Bin Saud"
              labelEn="Grandfather"
            />
            <AIFilledInput
              label="اسم العائلة *"
              valueAr="الغامدي"
              valueEn="Alghamdi"
              labelEn="Family Name"
            />
          </div>

          {/* الاسم المختصر */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex flex-wrap gap-4 mt-2">
            <div className="text-xs text-slate-500">
              الاسم المختصر (عربي):{" "}
              <strong className="text-slate-800">عبدالرحمن الغامدي</strong>
            </div>
            <div className="text-xs text-slate-500">
              الاسم المختصر (English):{" "}
              <strong className="text-slate-800" dir="ltr">
                Abdulrahman Alghamdi
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* باقي الحقول */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="text-xs font-bold mb-1.5 block text-slate-700">
            رقم الجوال *
          </label>
          <input
            type="tel"
            className="w-full p-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="text-xs font-bold mb-1.5 block text-slate-700">
            البريد الإلكتروني
          </label>
          <input
            type="email"
            className="w-full p-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-500"
          />
        </div>
        <AIFilledInputSingle label="رقم الهوية/الإقامة *" value="1089456723" />
        <AIFilledInputSingle label="تاريخ الميلاد (هجري)" value="1405/06/15" />
        <AIFilledInputSingle label="الجنسية" value="سعودي" />
      </div>
    </div>
  );

  // 4. خطوة العنوان الوطني
  const Step4Address = () => (
    <div className="bg-white rounded-xl p-6 mb-6 shadow-sm min-h-[400px]">
      <h3 className="text-lg font-bold mb-5 text-slate-800">
        العنوان الوطني والتواصل
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold mb-1.5 block text-slate-700">
            المدينة *
          </label>
          <input
            type="text"
            defaultValue="الرياض"
            className="w-full p-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="text-xs font-bold mb-1.5 block text-slate-700">
            الحي *
          </label>
          <input
            type="text"
            className="w-full p-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="text-xs font-bold mb-1.5 block text-slate-700">
            الشارع
          </label>
          <input
            type="text"
            className="w-full p-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="text-xs font-bold mb-1.5 block text-slate-700">
            الرمز البريدي
          </label>
          <input
            type="text"
            className="w-full p-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-500"
          />
        </div>
        <div className="md:col-span-2">
          <label className="text-xs font-bold mb-1.5 block text-slate-700">
            ملاحظات التواصل
          </label>
          <textarea
            rows="3"
            className="w-full p-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-500 resize-y"
          ></textarea>
        </div>
      </div>
    </div>
  );

  // 5. خطوة الوثائق
  const Step5Documents = () => (
    <div className="bg-white rounded-xl p-6 mb-6 shadow-sm min-h-[400px]">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-slate-800">الوثائق والمستندات</h3>
        <div className="flex gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-md text-xs font-bold text-slate-700 hover:bg-slate-200">
            <FileCheck className="w-3.5 h-3.5" /> إدارة الأنواع
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-500 text-white rounded-md text-xs font-bold shadow-sm hover:bg-violet-600">
            <Star className="w-3.5 h-3.5" /> استخراج آلياً (AI)
          </button>
        </div>
      </div>

      <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center mb-6 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
        <Upload className="w-10 h-10 text-slate-400 mx-auto mb-3" />
        <p className="text-sm text-slate-600 font-bold mb-1">
          اسحب الملفات هنا أو انقر للاختيار
        </p>
        <p className="text-[10px] text-slate-400">
          يدعم PDF, JPG, PNG حتى 10 ميجا
        </p>
      </div>

      <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
        <div className="flex justify-between items-start mb-3">
          <div>
            <div className="text-sm font-bold text-slate-800 mb-1" dir="ltr">
              1-left.png
            </div>
            <div className="text-[11px] text-slate-500 font-mono">
              644.36 KB
            </div>
          </div>
          <button className="p-1 bg-red-50 text-red-500 rounded hover:bg-red-100 transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1">
              نوع المستند *
            </label>
            <select className="w-full p-2 border border-slate-300 rounded text-xs outline-none">
              <option value="dt-001">هوية وطنية</option>
              <option value="dt-002">إقامة</option>
              <option value="dt-003">سجل تجاري</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1">
              مستوى السرية
            </label>
            <select className="w-full p-2 border border-slate-300 rounded text-xs outline-none">
              <option value="internal">داخلي</option>
              <option value="client">عميل</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1">
              الإصدار
            </label>
            <input
              type="text"
              defaultValue="v1"
              className="w-full p-2 border border-slate-300 rounded text-xs outline-none font-mono"
            />
          </div>
        </div>
      </div>
    </div>
  );

  // مكونات إدخال مساعدة للحقول المعبأة بالذكاء الاصطناعي
  const AIFilledInput = ({ label, labelEn, valueAr, valueEn }) => (
    <div className="flex gap-2">
      <div className="flex-1">
        <label className="flex items-center text-[11px] font-bold mb-1.5 text-slate-700">
          {label}{" "}
          <span className="text-[8px] text-violet-600 bg-violet-100 px-1 py-0.5 rounded ml-1 font-black">
            AI
          </span>
        </label>
        <input
          type="text"
          defaultValue={valueAr}
          className="w-full p-2.5 border-2 border-violet-400 bg-violet-50 rounded-lg text-sm outline-none font-bold text-slate-800"
        />
      </div>
      <div className="flex-1" dir="ltr">
        <label className="flex items-center text-[11px] font-bold mb-1.5 text-slate-700 justify-end">
          <span className="text-[8px] text-violet-600 bg-violet-100 px-1 py-0.5 rounded mr-1 font-black">
            AI
          </span>{" "}
          {labelEn}
        </label>
        <input
          type="text"
          defaultValue={valueEn}
          className="w-full p-2.5 border-2 border-violet-400 bg-violet-50 rounded-lg text-sm outline-none font-bold text-slate-800 text-left"
        />
      </div>
    </div>
  );

  const AIFilledInputSingle = ({ label, value }) => (
    <div>
      <label className="flex items-center text-[11px] font-bold mb-1.5 text-slate-700">
        {label}{" "}
        <span className="text-[8px] text-violet-600 bg-violet-100 px-1 py-0.5 rounded ml-1 font-black">
          AI
        </span>
      </label>
      <input
        type="text"
        defaultValue={value}
        className="w-full p-2.5 border-2 border-violet-400 bg-violet-50 rounded-lg text-sm outline-none font-bold text-slate-800"
      />
    </div>
  );

  // =========================================================
  // العرض الرئيسي
  // =========================================================
  return (
    <div
      className="flex-1 overflow-y-auto bg-slate-50 p-4 md:p-8 custom-scrollbar"
      dir="rtl"
    >
      <div className="max-w-4xl mx-auto">
        {/* شريط التقدم (Stepper) */}
        <div className="bg-white rounded-xl p-5 mb-6 shadow-sm">
          <div className="flex items-center justify-between relative">
            {/* خط التوصيل الخلفي */}
            <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-slate-100 rounded-full z-0"></div>

            {WIZARD_STEPS.map((step, idx) => {
              const isActive = step.id === currentStep;
              const isCompleted = step.id < currentStep;

              return (
                <div
                  key={step.id}
                  className="relative z-10 flex flex-col items-center"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 shadow-sm
                      ${
                        isActive
                          ? "bg-blue-600 text-white shadow-blue-200"
                          : isCompleted
                            ? "bg-blue-100 text-blue-600"
                            : "bg-white border-2 border-slate-200 text-slate-400"
                      }
                    `}
                  >
                    {isCompleted ? (
                      <CircleCheckBig className="w-5 h-5" />
                    ) : (
                      step.id
                    )}
                  </div>
                  <span
                    className={`text-[10px] mt-2 font-bold absolute -bottom-6 whitespace-nowrap ${isActive ? "text-blue-700" : "text-slate-400"}`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* منطقة المحتوى بناءً على الخطوة */}
        {currentStep === 1 && <Step1CreationMethod />}
        {currentStep === 2 && <Step2ClientType />}
        {currentStep === 3 && <Step3BasicData />}
        {currentStep === 4 && <Step4Address />}
        {currentStep === 5 && <Step5Documents />}

        {/* الشريط السفلي للتحكم */}
        <div className="bg-white rounded-xl p-4 shadow-sm flex justify-between items-center border border-slate-100 sticky bottom-4 z-20">
          <div>
            <button className="px-5 py-2.5 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg text-sm font-bold hover:bg-amber-100 transition-colors">
              حفظ مسودة
            </button>
          </div>
          <div className="flex items-center gap-3">
            {currentStep > 1 ? (
              <button
                onClick={prevStep}
                className="px-5 py-2.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-200 transition-colors"
              >
                السابق
              </button>
            ) : (
              <button
                onClick={() => onComplete && onComplete()} // 👈 3. أضفنا استدعاء الدالة لزر الإلغاء لكي يغلق الشاشة
                className="px-5 py-2.5 bg-red-50 text-red-600 border border-red-100 rounded-lg text-sm font-bold hover:bg-red-100 transition-colors"
              >
                إلغاء
              </button>
            )}

            <button
              onClick={nextStep}
              className="px-8 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-bold shadow-md shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95"
            >
              {currentStep === 5 ? "حفظ نهائي" : "التالي"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateClientWizard;
