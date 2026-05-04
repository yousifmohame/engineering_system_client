import React, { useState, useEffect } from "react";
import {
  CircleCheckBig,
  TriangleAlert,
  Building2,
  UserCheck,
  MapPin,
  Scale,
  Save,
  Loader2,
  FileBadge2,
  FolderArchive,
  FileText,
} from "lucide-react";
import axios from "../../../api/axios";

export default function ProjectDetailsStep({ projectId, onClose }) {
  const [data, setData] = useState(null);
  const [isAiProcessing, setIsAiProcessing] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // 1. تحديث الحقول النصية والرقمية العادية
  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  // 2. تحديث الحقول داخل الجداول (المصفوفات)
  const handleArrayChange = (arrayName, index, field, value) => {
    setData((prev) => {
      const newArray = [...(prev[arrayName] || [])];
      newArray[index] = { ...newArray[index], [field]: value };
      return { ...prev, [arrayName]: newArray };
    });
  };

  // 3. الاستعلام المتكرر (Polling) للتحقق من انتهاء تحليل الذكاء الاصطناعي
  useEffect(() => {
    let interval;

    const fetchProjectData = async () => {
      try {
        const res = await axios.get(`/archived-projects/${projectId}`);
        const project = res.data.data;

        if (
          project.aiStatus === "completed" ||
          project.aiStatus === "failed" ||
          project.aiStatus === "approved"
        ) {
          // تهيئة المصفوفات لتجنب الأخطاء إذا عادت null من الباك إند
          setData({
            ...project,
            boundaries: project.boundaries || [],
            floorAreas: project.floorAreas || [],
            setbacks: project.setbacks || [],
          });
          setIsAiProcessing(false);
          clearInterval(interval);
        }
      } catch (error) {
        console.error("Error fetching project data", error);
      }
    };

    if (isAiProcessing) {
      fetchProjectData();
      interval = setInterval(fetchProjectData, 3000);
    }

    return () => clearInterval(interval);
  }, [projectId, isAiProcessing]);

  // 4. حفظ التعديلات النهائية في قاعدة البيانات
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await axios.put(`/archived-projects/${projectId}`, data);
      alert("تم حفظ واعتماد المشروع بنجاح!");
      onClose();
    } catch (error) {
      console.error("Error saving data", error);
      alert("فشل الحفظ، يرجى المحاولة مرة أخرى.");
    } finally {
      setIsSaving(false);
    }
  };

  // شاشة الانتظار
  if (isAiProcessing) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
        <h2 className="text-xl font-black text-slate-800">
          جاري تحليل المخططات والرخص...
        </h2>
        <p className="text-sm text-slate-500 mt-2">
          يقوم الذكاء الاصطناعي الآن بقراءة الملفات واستخراج المساحات،
          الارتدادات، والبيانات.
        </p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div
      className="flex-1 flex flex-col overflow-hidden bg-slate-100 p-3 gap-3 relative h-full font-sans"
      dir="rtl"
    >
      {/* ==================== Top Bar - AI Stats ==================== */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 px-5 py-3 flex flex-wrap lg:flex-nowrap items-center justify-between shrink-0 gap-4">
        <div className="flex items-center gap-6 w-full lg:w-auto">
          <div className="flex-1 lg:flex-none">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1.5 flex justify-between">
              <span>نسبة التعبئة والاستخراج (AI)</span>
              <span className="text-emerald-600">
                {data.aiConfidence || 0}%
              </span>
            </p>
            <div className="w-full lg:w-48 h-2 bg-slate-100 rounded-full overflow-hidden leading-none">
              <div
                className="h-full bg-emerald-500 rounded-full"
                style={{ width: `${data.aiConfidence || 0}%` }}
              ></div>
            </div>
          </div>
          <div className="hidden lg:block w-px h-8 bg-slate-200"></div>
          <div className="flex gap-5 text-center shrink-0">
            <div>
              <span className="text-lg font-black text-emerald-600 leading-none flex items-center justify-center gap-1">
                <CircleCheckBig className="w-3.5 h-3.5" /> جاهز
              </span>
              <span className="text-[9px] text-slate-500 font-bold uppercase mt-1 block">
                حالة التحليل
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl text-sm font-black flex items-center gap-2 transition-colors disabled:opacity-50 shadow-sm"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          اعتماد وحفظ نهائي
        </button>
      </div>

      {/* ==================== Grid Layout ==================== */}
      <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-3 h-full">
        {/* Sidebar (AI Sources / Files) */}
        <div className="hidden lg:flex col-span-3 bg-white rounded-xl shadow-sm border border-slate-200 flex-col overflow-hidden">
          <div className="p-3 border-b border-slate-100 bg-slate-50 shrink-0">
            <h3 className="text-xs font-black text-slate-700 flex items-center gap-2">
              <FolderArchive className="w-4 h-4 text-indigo-500" /> المصادر
              والملفات ({data.files?.length || 0})
            </h3>
            <p className="text-[9px] text-slate-400 mt-1">
              يعتمد الاستخراج الآلي على هذه المرفقات.
            </p>
          </div>
          <div className="p-2 overflow-y-auto space-y-1">
            {data.files?.map((file, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2 p-2 hover:bg-slate-50 rounded-lg group cursor-pointer border border-transparent hover:border-slate-200 transition-colors"
              >
                <FileText className="w-4 h-4 text-indigo-400 mt-0.5 group-hover:text-indigo-600 shrink-0" />
                <div className="overflow-hidden">
                  <a
                    href={file.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] font-bold text-slate-700 truncate block hover:text-indigo-600"
                    dir="ltr"
                  >
                    {file.originalName}
                  </a>
                  <p className="text-[9px] text-slate-400 font-mono mt-0.5">
                    {file.fileType.split("/")[1]} •{" "}
                    {(file.fileSize / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
            ))}
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
                  <label className="text-[10px] font-bold text-slate-500 mb-1.5 block">
                    اسم المشروع <span className="text-rose-500">*</span>
                  </label>
                  <input
                    name="title"
                    value={data.title || ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-xs font-bold border rounded-lg outline-none focus:border-indigo-400 bg-white"
                    type="text"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 mb-1.5 block">
                    الرقم الموحد (كود الأرشفة)
                  </label>
                  <input
                    readOnly
                    value={data.archiveCode || ""}
                    className="w-full px-3 py-2 text-xs font-mono font-bold border rounded-lg bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed"
                    type="text"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 mb-1.5 block">
                    نوع المشروع
                  </label>
                  <input
                    name="projectType"
                    value={data.projectType || ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-xs font-bold border rounded-lg outline-none focus:border-indigo-400"
                    type="text"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-[10px] font-bold text-slate-500 mb-1.5 block">
                    نوع المعاملة
                  </label>
                  <input
                    name="transactionType"
                    value={data.transactionType || ""}
                    onChange={handleChange}
                    placeholder="مثال: إصدار جديد، تعديل مكونات..."
                    className="w-full px-3 py-2 text-xs font-bold border rounded-lg outline-none focus:border-indigo-400"
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
                    اسم المالك (مسحوب من السجل إن وجد)
                  </label>
                  <input
                    value={data.client?.name || data.ownerName || ""}
                    readOnly
                    className="w-full px-3 py-2 text-xs font-bold border rounded-lg outline-none bg-slate-50 border-slate-200 text-slate-600"
                    type="text"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 mb-1.5 block">
                    نوع المالك
                  </label>
                  <select
                    name="ownerType"
                    value={data.ownerType || ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-xs font-bold border rounded-lg outline-none focus:border-indigo-400 bg-white"
                  >
                    <option value="">اختر...</option>
                    <option value="اعتباري (شركة)">اعتباري (شركة)</option>
                    <option value="طبيعي (أفراد)">طبيعي (أفراد)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 mb-1.5 block">
                    رقم الإثبات / السجل
                  </label>
                  <input
                    value={data.client?.idNumber || ""}
                    readOnly
                    className="w-full px-3 py-2 text-xs font-mono font-bold border rounded-lg outline-none bg-slate-50 border-slate-200"
                    type="text"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-[10px] font-bold text-slate-500 mb-1.5 block">
                    رقم الجوال / الاتصال
                  </label>
                  <input
                    name="contactMobile"
                    value={data.contactMobile || ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-xs font-mono font-bold border rounded-lg outline-none focus:border-indigo-400 bg-white"
                    type="text"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-[10px] font-bold text-slate-500 mb-1.5 block">
                    صندوق البريد / الرمز البريدي
                  </label>
                  <input
                    name="poBox"
                    value={data.poBox || ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-xs font-bold border rounded-lg outline-none focus:border-indigo-400 bg-white"
                    type="text"
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
                    name="licenseNumber"
                    value={data.licenseNumber || ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-xs font-mono font-bold border rounded-lg outline-none focus:border-indigo-400"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 mb-1.5 block">
                    تاريخ الإصدار
                  </label>
                  <input
                    name="licenseIssueDate"
                    value={
                      data.licenseIssueDate
                        ? data.licenseIssueDate.split("T")[0]
                        : ""
                    }
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-xs font-mono font-bold border rounded-lg outline-none focus:border-indigo-400"
                    type="date"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 mb-1.5 block">
                    تاريخ الانتهاء
                  </label>
                  <input
                    name="licenseExpiryDate"
                    value={
                      data.licenseExpiryDate
                        ? data.licenseExpiryDate.split("T")[0]
                        : ""
                    }
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-xs font-mono font-bold border rounded-lg outline-none focus:border-indigo-400"
                    type="date"
                  />
                </div>
                <div></div>
                <div className="md:col-span-2">
                  <label className="text-[10px] font-bold text-slate-500 mb-1.5 block">
                    رقم صك الملكية
                  </label>
                  <input
                    name="deedNumber"
                    value={data.deedNumber || ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-xs font-mono font-bold border rounded-lg outline-none focus:border-indigo-400"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 mb-1.5 block">
                    تاريخ الصك
                  </label>
                  <input
                    name="deedDate"
                    value={data.deedDate ? data.deedDate.split("T")[0] : ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-xs font-mono font-bold border rounded-lg outline-none focus:border-indigo-400"
                    type="date"
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
                    name="city"
                    value={data.city || ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-xs font-bold border rounded-lg outline-none focus:border-indigo-400"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 mb-1.5 block">
                    الحي
                  </label>
                  <input
                    value={data.district?.name || ""}
                    readOnly
                    className="w-full px-3 py-2 text-xs font-bold border rounded-lg outline-none bg-slate-50 border-slate-200"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 mb-1.5 block">
                    رقم المخطط التنظيمي
                  </label>
                  <input
                    name="planNumber"
                    value={data.planNumber || ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-xs font-mono font-bold border rounded-lg outline-none focus:border-indigo-400"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 mb-1.5 block">
                    أرقام القطع
                  </label>
                  <input
                    value={data.plots?.join(", ") || ""}
                    onChange={(e) =>
                      setData({ ...data, plots: e.target.value.split(", ") })
                    }
                    className="w-full px-3 py-2 text-xs font-mono font-bold border rounded-lg outline-none focus:border-indigo-400"
                  />
                </div>
                <div className="md:col-span-4">
                  <label className="text-[10px] font-bold text-slate-500 mb-1.5 block">
                    اسم الشارع الرئيسي وعرضه
                  </label>
                  <input
                    name="mainStreet"
                    value={data.mainStreet || ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-xs font-bold border rounded-lg outline-none focus:border-indigo-400"
                  />
                </div>
              </div>

              {/* جدول الحدود (Boundaries) */}
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
                  {data.boundaries.map((item, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-5 gap-2 items-center"
                    >
                      <input
                        value={item.direction || ""}
                        onChange={(e) =>
                          handleArrayChange(
                            "boundaries",
                            idx,
                            "direction",
                            e.target.value,
                          )
                        }
                        className="col-span-1 px-2 py-1.5 text-xs font-black text-slate-700 bg-white border border-slate-200 rounded outline-none focus:border-indigo-400"
                      />
                      <input
                        value={item.desc || ""}
                        onChange={(e) =>
                          handleArrayChange(
                            "boundaries",
                            idx,
                            "desc",
                            e.target.value,
                          )
                        }
                        className="col-span-3 px-2 py-1.5 text-xs bg-white border border-slate-200 rounded outline-none focus:border-indigo-400"
                      />
                      <input
                        value={item.length || ""}
                        onChange={(e) =>
                          handleArrayChange(
                            "boundaries",
                            idx,
                            "length",
                            e.target.value,
                          )
                        }
                        className="col-span-1 px-2 py-1.5 text-xs font-mono text-center bg-white border border-slate-200 rounded outline-none focus:border-indigo-400"
                      />
                    </div>
                  ))}
                  <button
                    onClick={() =>
                      setData({
                        ...data,
                        boundaries: [
                          ...data.boundaries,
                          { direction: "", desc: "", length: 0 },
                        ],
                      })
                    }
                    className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 mt-2"
                  >
                    + إضافة حد جديد
                  </button>
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
                    name="totalArea"
                    value={data.totalArea || ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm font-mono font-black text-indigo-700 border rounded-lg outline-none bg-indigo-50/50 border-indigo-200"
                    type="number"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 mb-1.5 block">
                    نسبة التغطية %
                  </label>
                  <input
                    name="coverageRatio"
                    value={data.coverageRatio || ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-xs font-mono font-bold border rounded-lg outline-none"
                    type="number"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 mb-1.5 block">
                    معامل البناء F.A.R
                  </label>
                  <input
                    name="far"
                    value={data.far || ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-xs font-mono font-bold border rounded-lg outline-none"
                    type="number"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 mb-1.5 block">
                    الأدوار (فوق الأرض)
                  </label>
                  <input
                    name="floorsAbove"
                    value={data.floorsAbove || ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-xs font-mono text-center font-bold border rounded-lg outline-none"
                    type="number"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 mb-1.5 block">
                    الأدوار (تحت الأرض)
                  </label>
                  <input
                    name="floorsBelow"
                    value={data.floorsBelow || ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-xs font-mono text-center font-bold border rounded-lg outline-none"
                    type="number"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 mb-1.5 block">
                    المواقف (المطلوبة)
                  </label>
                  <input
                    name="parkingRequired"
                    value={data.parkingRequired || ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-xs font-mono text-center font-bold border rounded-lg outline-none"
                    type="number"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 mb-1.5 block">
                    المواقف (المتوفرة)
                  </label>
                  <input
                    name="parkingAvailable"
                    value={data.parkingAvailable || ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-xs font-mono text-center font-bold border rounded-lg outline-none"
                    type="number"
                  />
                </div>
              </div>

              {/* جدول المساحات (Floor Areas) */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-4">
                <h5 className="text-[11px] font-black text-slate-700 mb-3">
                  تفصيل مسطحات البناء
                </h5>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {data.floorAreas.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-white border border-slate-200 p-2 rounded text-center"
                    >
                      <input
                        value={item.floor || ""}
                        onChange={(e) =>
                          handleArrayChange(
                            "floorAreas",
                            idx,
                            "floor",
                            e.target.value,
                          )
                        }
                        className="block w-full text-center text-[9px] text-slate-400 font-bold mb-1 outline-none"
                        placeholder="الدور"
                      />
                      <div className="flex items-center justify-center">
                        <input
                          value={item.area || ""}
                          onChange={(e) =>
                            handleArrayChange(
                              "floorAreas",
                              idx,
                              "area",
                              e.target.value,
                            )
                          }
                          className="font-mono text-xs w-16 text-center font-black text-slate-700 outline-none"
                        />
                        <span className="text-xs font-bold text-slate-500">
                          م2
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() =>
                    setData({
                      ...data,
                      floorAreas: [
                        ...data.floorAreas,
                        { floor: "دور جديد", area: 0 },
                      ],
                    })
                  }
                  className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 mt-2 block"
                >
                  + إضافة مساحة دور
                </button>
              </div>

              {/* جدول الارتدادات (Setbacks) */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h5 className="text-[11px] font-black text-slate-700 mb-3">
                  الارتدادات (Setbacks)
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
                    {data.setbacks.map((item, idx) => (
                      <tr
                        key={idx}
                        className={
                          item.status === "مخالف" ? "bg-rose-50/50" : ""
                        }
                      >
                        <td className="py-2">
                          <input
                            value={item.direction || ""}
                            onChange={(e) =>
                              handleArrayChange(
                                "setbacks",
                                idx,
                                "direction",
                                e.target.value,
                              )
                            }
                            className="w-16 bg-transparent outline-none"
                          />
                        </td>
                        <td className="py-2 text-center font-mono">
                          <input
                            value={item.required || ""}
                            onChange={(e) =>
                              handleArrayChange(
                                "setbacks",
                                idx,
                                "required",
                                e.target.value,
                              )
                            }
                            className="w-12 text-center bg-transparent outline-none border border-slate-200 rounded"
                          />
                        </td>
                        <td className="py-2 text-center font-mono">
                          <input
                            value={item.implemented || ""}
                            onChange={(e) =>
                              handleArrayChange(
                                "setbacks",
                                idx,
                                "implemented",
                                e.target.value,
                              )
                            }
                            className="w-12 text-center bg-transparent outline-none border border-slate-200 rounded"
                          />
                        </td>
                        <td className="py-2 text-center">
                          <select
                            value={item.status || ""}
                            onChange={(e) =>
                              handleArrayChange(
                                "setbacks",
                                idx,
                                "status",
                                e.target.value,
                              )
                            }
                            className={`bg-transparent outline-none font-black ${item.status === "مخالف" ? "text-rose-500" : "text-emerald-500"}`}
                          >
                            <option value="مطابق">مطابق</option>
                            <option value="مخالف">مخالف</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button
                  onClick={() =>
                    setData({
                      ...data,
                      setbacks: [
                        ...data.setbacks,
                        {
                          direction: "",
                          required: 0,
                          implemented: 0,
                          status: "مطابق",
                        },
                      ],
                    })
                  }
                  className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 mt-2 block"
                >
                  + إضافة ارتداد
                </button>
              </div>
            </div>

            {/* --- 6. Professionals & Notes --- */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
              <h4 className="text-sm font-black text-slate-800 border-b border-slate-100 pb-3 mb-4">
                6. الأطراف المهنية والملاحظات
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* هنا يمكنك ربط المكاتب بجداولك الحقيقية إن أردت عبر select بدلاً من input */}
                <div>
                  <label className="text-[10px] font-bold text-slate-500 mb-1.5 block">
                    المكتب المصمم
                  </label>
                  <input
                    name="designerOfficeId"
                    value={data.designerOfficeId || ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-xs font-bold border rounded-lg outline-none focus:border-indigo-400"
                    type="text"
                    placeholder="اسم أو كود المكتب المصمم"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 mb-1.5 block">
                    المكتب المشرف
                  </label>
                  <input
                    name="supervisorOfficeId"
                    value={data.supervisorOfficeId || ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-xs font-bold border rounded-lg outline-none focus:border-indigo-400"
                    type="text"
                    placeholder="اسم أو كود المكتب المشرف"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-[10px] font-bold text-slate-500 mb-1.5 block">
                    ملاحظات الأرشفة (مستخرجة من الذكاء الاصطناعي)
                  </label>
                  <textarea
                    name="archiveNotes"
                    value={data.archiveNotes || ""}
                    onChange={handleChange}
                    rows="4"
                    className="w-full px-3 py-2 text-xs font-bold border rounded-lg outline-none bg-slate-50 border-slate-200 focus:border-indigo-400 resize-none leading-relaxed"
                    placeholder="اكتب أي ملاحظات إضافية حول الملفات أو التجاوزات المكتشفة..."
                  ></textarea>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
