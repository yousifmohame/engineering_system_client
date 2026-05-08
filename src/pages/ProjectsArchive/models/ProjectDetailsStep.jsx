import React, { useState, useEffect, useRef } from "react";
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
  Briefcase,
  Link,
  Plus,
  Trash2,
  UploadCloud,
  FileDigit,
  ExternalLink,
} from "lucide-react";
import api from "../../../api/axios";
import { useAuth } from "../../../context/AuthContext";

// ==========================================
// 1. مكون حالة الربط الذكي
// ==========================================
const LinkStatusBadge = ({
  isLinked,
  extractedText,
  onLinkClick,
  isLinking,
}) => {
  if (isLinked) {
    return (
      <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 text-[10px] font-bold border border-emerald-100">
        <CircleCheckBig className="w-3 h-3" /> مربوط بالنظام
      </span>
    );
  }

  if (!extractedText) {
    return (
      <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[10px] font-bold border border-slate-200">
        <TriangleAlert className="w-3 h-3" /> غير مربوط
      </span>
    );
  }

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        onLinkClick();
      }}
      disabled={isLinking}
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-200 hover:bg-amber-100 transition-colors disabled:opacity-50"
      title="انقر لإنشاء هذا السجل وربطه تلقائياً"
    >
      {isLinking ? (
        <Loader2 className="w-3 h-3 animate-spin" />
      ) : (
        <Link className="w-3 h-3" />
      )}
      إضافة وربط: {extractedText}
    </button>
  );
};

// ==========================================
// 2. المكون الأساسي لصفحة تفاصيل المشروع
// ==========================================
export default function ProjectDetailsStep({ projectId, onClose }) {
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  const [data, setData] = useState(null);
  const [isAiProcessing, setIsAiProcessing] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // قوائم البيانات من الباك إند
  const [sectors, setSectors] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [clients, setClients] = useState([]);
  const [offices, setOffices] = useState([]);
  const [selectedSectorId, setSelectedSectorId] = useState("");

  // حالات التحميل لعمليات الربط التلقائي
  const [linkingStates, setLinkingStates] = useState({
    client: false,
    district: false,
    plan: false,
    designer: false,
    supervisor: false,
  });

  // 💡 معالجة أسماء الملفات العربية
  const getArabicFileName = (name) => {
    if (!name) return "ملف بدون اسم";
    try {
      return decodeURIComponent(escape(name));
    } catch (e) {
      try {
        return decodeURIComponent(name);
      } catch (err) {
        return name;
      }
    }
  };

  // جلب البيانات المساعدة
  useEffect(() => {
    const fetchHelperData = async () => {
      try {
        const [sectorsRes, districtsRes, clientsRes, officesRes] =
          await Promise.all([
            api
              .get("/riyadh-streets/sectors")
              .catch(() => ({ data: { data: [] } })),
            api
              .get("/riyadh-streets/districts")
              .catch(() => ({ data: { data: [] } })),
            api.get("/clients/simple").catch(() => ({ data: { data: [] } })),
            api
              .get("/intermediary-offices")
              .catch(() => ({ data: { data: [] } })),
          ]);
        setSectors(sectorsRes.data?.data || sectorsRes.data || []);
        setDistricts(districtsRes.data?.data || districtsRes.data || []);
        setClients(clientsRes.data?.data || clientsRes.data || []);
        setOffices(officesRes.data?.data || officesRes.data || []);
      } catch (error) {
        console.error("Error fetching helper data:", error);
      }
    };
    fetchHelperData();
  }, []);

  // تحديث الحقول العادية والمصفوفات
  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const handleArrayChange = (arrayName, index, field, value) => {
    setData((prev) => {
      const newArray = [...(prev[arrayName] || [])];
      newArray[index] = { ...newArray[index], [field]: value };
      return { ...prev, [arrayName]: newArray };
    });
  };

  // استعلام حالة المشروع (Polling)
  const fetchProjectData = async () => {
    try {
      const res = await api.get(`/archived-projects/${projectId}`);
      const project = res.data.data;

      if (["completed", "failed", "approved"].includes(project.aiStatus)) {
        setData((prev) => ({
          ...project,
          boundaries: project.boundaries || [],
          floorAreas: project.floorAreas || [],
          setbacks: project.setbacks || [],
          plots: project.plots || [],
          clientId: project.clientId || project.client?.id || "",
          districtId: project.districtId || project.district?.id || "",
          planId: project.planId || project.plan?.id || "",
          designerOfficeId: project.designerOfficeId || "",
          supervisorOfficeId: project.supervisorOfficeId || "",
        }));

        if (project.district && project.district.sectorId) {
          setSelectedSectorId(project.district.sectorId);
        }
        setIsAiProcessing(false);
        return true; // اكتمل
      }
      return false; // لا زال يعالج
    } catch (error) {
      console.error("Error fetching project data", error);
    }
  };

  useEffect(() => {
    let interval;
    if (isAiProcessing) {
      fetchProjectData();
      interval = setInterval(async () => {
        const isDone = await fetchProjectData();
        if (isDone) clearInterval(interval);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [projectId, isAiProcessing]);

  // ==========================================
  // 🚀 إدارة المرفقات (رفع وحذف)
  // ==========================================
  const handleUploadFile = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));
      formData.append("compressionLevel", "medium");
      formData.append("reanalyze", "false"); // حفظ وضغط فقط بدون تحليل

      const res = await api.post(
        `/archived-projects/${projectId}/files`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      if (res.data.success) {
        // تحديث البيانات لجلب الملفات الجديدة
        await fetchProjectData();
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("فشل رفع الملفات، يرجى المحاولة مرة أخرى.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = null;
    }
  };

  const handleDeleteFile = async (fileId) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا الملف نهائياً؟")) return;
    try {
      await api.delete(`/archived-projects/files/${fileId}`);
      setData((prev) => ({
        ...prev,
        files: prev.files.filter((f) => f.id !== fileId),
      }));
    } catch (error) {
      console.error("Delete error:", error);
      alert("فشل حذف الملف.");
    }
  };

  // ==========================================
  // 🔗 الإنشاء والربط التلقائي (Auto-Link)
  // ==========================================
  const handleAutoLink = async (type, extractedName) => {
    if (!extractedName) return;
    setLinkingStates((prev) => ({ ...prev, [type]: true }));
    try {
      let res, newItem;

      if (type === "client") {
        const formData = new FormData();
        const uniqueSuffix = Math.floor(10000 + Math.random() * 90000);
        formData.append("officialNameAr", extractedName);
        formData.append("type", data.ownerType || "طبيعي (أفراد)");
        formData.append("mobile", data.contactMobile || `05000${uniqueSuffix}`);
        formData.append("idNumber", `10000${uniqueSuffix}`);

        res = await api.post("/clients", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        newItem = res.data?.data || res.data;
        setClients((prev) => [...prev, newItem]);
        setData((prev) => ({ ...prev, clientId: newItem.id }));
      } else if (type === "district") {
        if (!selectedSectorId) return alert("اختر 'القطاع' أولاً لإنشاء الحي.");
        res = await api.post("/riyadh-streets/districts", {
          name: extractedName,
          sectorId: selectedSectorId,
          city: data.city || "الرياض",
        });
        newItem = res.data?.data || res.data;
        setDistricts((prev) => [...prev, newItem]);
        setData((prev) => ({ ...prev, districtId: newItem.id }));
      } else if (type === "plan") {
        // 👈 إضافة دعم المخططات
        res = await api.post("/riyadh-streets/plans", {
          planNumber: extractedName,
          name: extractedName,
          city: data.city || "الرياض",
        });
        newItem = res.data?.data || res.data;
        setData((prev) => ({ ...prev, planId: newItem.id }));
      } else if (type === "designer" || type === "supervisor") {
        res = await api.post("/intermediary-offices", {
          nameAr: extractedName,
          nameEn: extractedName,
          commercialRegister: "0000000000",
          city: "none",
          code: "TMP-" + Date.now(),
        });
        newItem = res.data?.data || res.data;
        setOffices((prev) => [...prev, newItem]);
        if (type === "designer")
          setData((prev) => ({ ...prev, designerOfficeId: newItem.id }));
        else setData((prev) => ({ ...prev, supervisorOfficeId: newItem.id }));
      }
    } catch (error) {
      alert(
        `خطأ في الإنشاء التلقائي: ${error.response?.data?.message || error.message}`,
      );
    } finally {
      setLinkingStates((prev) => ({ ...prev, [type]: false }));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.put(`/archived-projects/${projectId}`, {
        ...data,
        approvedById: user?.id,
      });
      alert(`تم حفظ واعتماد المشروع بنجاح.`);
      onClose();
    } catch (error) {
      alert("فشل الحفظ، يرجى المحاولة مرة أخرى.");
    } finally {
      setIsSaving(false);
    }
  };

  // شاشة الانتظار
  if (isAiProcessing) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50/50 backdrop-blur-sm">
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-indigo-50 flex flex-col items-center">
          <Loader2 className="w-14 h-14 text-indigo-600 animate-spin mb-4" />
          <h2 className="text-xl font-black text-slate-800">
            جاري تحليل البيانات...
          </h2>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const inputClass =
    "w-full px-3 py-2.5 text-xs font-bold text-slate-700 bg-slate-50/50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all";
  const labelClass = "text-[11px] font-black text-slate-600";

  return (
    <div
      className="flex-1 flex flex-col overflow-hidden bg-slate-100 p-4 gap-4 relative h-full font-sans"
      dir="rtl"
    >
      {/* ==================== Top Bar ==================== */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 px-6 py-4 flex flex-wrap lg:flex-nowrap items-center justify-between shrink-0 gap-4">
        <div className="flex items-center gap-6 w-full lg:w-auto">
          <div className="flex-1 lg:flex-none">
            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mb-2 flex justify-between">
              <span>دقة الاستخراج (AI)</span>
              <span className="text-emerald-600">
                {data.aiConfidence || 0}%
              </span>
            </p>
            <div className="w-full lg:w-56 h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full"
                style={{ width: `${data.aiConfidence || 0}%` }}
              ></div>
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2.5 rounded-xl text-sm font-black flex items-center gap-2 transition-all disabled:opacity-50 shadow-md shadow-indigo-600/20"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          اعتماد وحفظ نهائي
        </button>
      </div>

      <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-4 h-full">
        {/* ==================== المرفقات Sidebar ==================== */}
        <div className="hidden lg:flex col-span-3 bg-white rounded-2xl shadow-sm border border-slate-200 flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 shrink-0 flex justify-between items-center">
            <div>
              <h3 className="text-xs font-black text-slate-800 flex items-center gap-2">
                <FolderArchive className="w-4 h-4 text-indigo-600" /> المرفقات (
                {data.files?.length || 0})
              </h3>
            </div>

            {/* 💡 زر رفع الملفات */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="p-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-lg transition-colors"
              title="رفع ملف جديد"
            >
              {isUploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <UploadCloud className="w-4 h-4" />
              )}
            </button>
            <input
              type="file"
              multiple
              ref={fileInputRef}
              onChange={handleUploadFile}
              className="hidden"
            />
          </div>

          <div className="p-3 overflow-y-auto space-y-2 custom-scrollbar">
            {data.files?.map((file, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded-xl group border border-transparent hover:border-slate-200 transition-colors"
              >
                <a
                  href={file.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 flex-1 overflow-hidden"
                >
                  <div className="p-2 bg-indigo-50 rounded-lg group-hover:bg-indigo-100 transition-colors shrink-0">
                    <FileText className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div className="overflow-hidden flex-1">
                    <span
                      className="text-xs font-bold text-slate-700 truncate block hover:text-indigo-600"
                      dir="rtl"
                      title={getArabicFileName(file.originalName)}
                    >
                      {getArabicFileName(file.originalName)}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
                      {(file.fileSize / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                </a>

                {/* 💡 زر الحذف */}
                <button
                  onClick={() => handleDeleteFile(file.id)}
                  className="p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 rounded-lg opacity-0 group-hover:opacity-100 transition-all shrink-0"
                  title="حذف الملف"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {(!data.files || data.files.length === 0) && (
              <p className="text-xs text-center text-slate-400 font-bold p-4">
                لا توجد مرفقات
              </p>
            )}
          </div>
        </div>

        {/* ==================== Main Content ==================== */}
        <div className="col-span-1 lg:col-span-9 overflow-y-auto rounded-2xl custom-scrollbar pr-2 pb-10">
          <div className="flex flex-col gap-5">
            {/* --- 0. أرقام الطلبات والخدمات (جديد) --- */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h4 className="text-sm font-black text-amber-600 border-b border-amber-100 pb-3 mb-5 flex items-center gap-2">
                <FileDigit className="w-4 h-4" /> أرقام الطلبات والخدمات
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                <div>
                  <label className={labelClass}>رقم الطلب</label>
                  <input
                    name="requestNumber"
                    value={data.requestNumber || ""}
                    onChange={handleChange}
                    className={`${inputClass} font-mono`}
                  />
                </div>
                <div>
                  <label className={labelClass}>سنة الطلب</label>
                  <input
                    name="requestYear"
                    value={data.requestYear || ""}
                    onChange={handleChange}
                    className={`${inputClass} font-mono`}
                  />
                </div>
                <div>
                  <label className={labelClass}>رقم الخدمة</label>
                  <input
                    name="serviceNumber"
                    value={data.serviceNumber || ""}
                    onChange={handleChange}
                    className={`${inputClass} font-mono`}
                  />
                </div>
                <div>
                  <label className={labelClass}>سنة الخدمة</label>
                  <input
                    name="serviceYear"
                    value={data.serviceYear || ""}
                    onChange={handleChange}
                    className={`${inputClass} font-mono`}
                  />
                </div>
              </div>
            </div>

            {/* --- 1. معلومات المشروع الأساسية --- */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h4 className="text-sm font-black text-slate-800 border-b border-slate-100 pb-3 mb-5 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-indigo-600" /> 1. معلومات
                المشروع الأساسية
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="md:col-span-2">
                  <label className={labelClass}>
                    اسم المشروع <span className="text-rose-500">*</span>
                  </label>
                  <input
                    name="title"
                    value={data.title || ""}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>الرقم الموحد</label>
                  <input
                    readOnly
                    value={data.archiveCode || ""}
                    className={`${inputClass} bg-slate-100 text-slate-500 cursor-not-allowed`}
                  />
                </div>
                <div>
                  <label className={labelClass}>نوع المشروع</label>
                  <input
                    name="projectType"
                    value={data.projectType || ""}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>نوع المعاملة</label>
                  <input
                    name="transactionType"
                    value={data.transactionType || ""}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            {/* --- 2. بيانات المالك --- */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h4 className="text-sm font-black text-slate-800 border-b border-slate-100 pb-3 mb-5 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-indigo-600" /> 2. بيانات
                المالك والاتصال
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                <div className="md:col-span-2">
                  <div className="flex justify-between items-center mb-1.5">
                    <label className={labelClass}>
                      اسم المالك (ربط بسجل العملاء)
                    </label>
                    <LinkStatusBadge
                      isLinked={!!data.clientId}
                      extractedText={data.ownerName}
                      isLinking={linkingStates.client}
                      onLinkClick={() =>
                        handleAutoLink("client", data.ownerName)
                      }
                    />
                  </div>
                  <select
                    name="clientId"
                    value={data.clientId || ""}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="">-- اختر المالك لربط الملف --</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name?.ar ||
                          client.name?.en ||
                          client.name ||
                          "بدون اسم"}{" "}
                        {client.idNumber ? `(${client.idNumber})` : ""}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>نوع المالك</label>
                  <select
                    name="ownerType"
                    value={data.ownerType || ""}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="">اختر...</option>
                    <option value="اعتباري (شركة)">اعتباري (شركة)</option>
                    <option value="طبيعي (أفراد)">طبيعي (أفراد)</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>رقم الجوال</label>
                  <input
                    name="contactMobile"
                    value={data.contactMobile || ""}
                    onChange={handleChange}
                    className={`${inputClass} font-mono`}
                    dir="ltr"
                  />
                </div>
                {/* 💡 إضافة صندوق البريد */}
                <div>
                  <label className={labelClass}>صندوق البريد / الرمز</label>
                  <input
                    name="poBox"
                    value={data.poBox || ""}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            {/* --- 3. الرخص والصكوك --- */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h4 className="text-sm font-black text-slate-800 border-b border-slate-100 pb-3 mb-5 flex items-center gap-2">
                <FileBadge2 className="w-4 h-4 text-indigo-600" /> 3. الرخص
                والصكوك القانونية
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                <div className="md:col-span-2">
                  <label className={labelClass}>رقم رخصة البناء</label>
                  <input
                    name="licenseNumber"
                    value={data.licenseNumber || ""}
                    onChange={handleChange}
                    className={`${inputClass} font-mono`}
                  />
                </div>
                <div>
                  <label className={labelClass}>تاريخ الإصدار</label>
                  <input
                    name="licenseIssueDate"
                    value={data.licenseIssueDate?.split("T")[0] || ""}
                    onChange={handleChange}
                    className={inputClass}
                    type="date"
                  />
                </div>
                <div>
                  <label className={labelClass}>تاريخ الانتهاء</label>
                  <input
                    name="licenseExpiryDate"
                    value={data.licenseExpiryDate?.split("T")[0] || ""}
                    onChange={handleChange}
                    className={inputClass}
                    type="date"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>رقم صك الملكية</label>
                  <input
                    name="deedNumber"
                    value={data.deedNumber || ""}
                    onChange={handleChange}
                    className={`${inputClass} font-mono`}
                  />
                </div>
                <div>
                  <label className={labelClass}>تاريخ الصك</label>
                  <input
                    name="deedDate"
                    value={data.deedDate?.split("T")[0] || ""}
                    onChange={handleChange}
                    className={inputClass}
                    type="date"
                  />
                </div>
                <div>
                  <label className={labelClass}>المدينة</label>
                  <input
                    name="city"
                    value={data.city || ""}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            {/* --- 4. الموقع والمحددات --- */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h4 className="text-sm font-black text-slate-800 border-b border-slate-100 pb-3 mb-5 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-indigo-600" /> 4. الموقع
                والمحددات المكانية
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
                <div>
                  <label className={labelClass}>القطاع</label>
                  <select
                    value={selectedSectorId}
                    onChange={(e) => setSelectedSectorId(e.target.value)}
                    className={inputClass}
                  >
                    <option value="">-- حدد القطاع --</option>
                    {sectors.map((sec) => (
                      <option key={sec.id} value={sec.id}>
                        {sec.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className={labelClass}>الحي</label>
                    <LinkStatusBadge
                      isLinked={!!data.districtId}
                      extractedText={data.districtName}
                      isLinking={linkingStates.district}
                      onLinkClick={() =>
                        handleAutoLink("district", data.districtName)
                      }
                    />
                  </div>
                  <select
                    name="districtId"
                    value={data.districtId || ""}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="">-- اختر الحي --</option>
                    {districts
                      .filter(
                        (dist) =>
                          !selectedSectorId ||
                          dist.sectorId === selectedSectorId,
                      )
                      .map((dist) => (
                        <option key={dist.id} value={dist.id}>
                          {dist.name}
                        </option>
                      ))}
                  </select>
                </div>

                {/* 💡 إضافة رادار المخطط */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className={labelClass}>المخطط التنظيمي</label>
                    <LinkStatusBadge
                      isLinked={!!data.planId}
                      extractedText={data.planNumber}
                      isLinking={linkingStates.plan}
                      onLinkClick={() =>
                        handleAutoLink("plan", data.planNumber)
                      }
                    />
                  </div>
                  <input
                    name="planNumber"
                    value={data.planNumber || ""}
                    onChange={handleChange}
                    className={`${inputClass} font-mono`}
                  />
                </div>

                <div>
                  <label className={labelClass}>أرقام القطع</label>
                  <input
                    value={data.plots?.join(", ") || ""}
                    onChange={(e) =>
                      setData({ ...data, plots: e.target.value.split(", ") })
                    }
                    className={`${inputClass} font-mono`}
                    placeholder="10, 11"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className={labelClass}>الشارع الرئيسي وعرضه</label>
                  <input
                    name="mainStreet"
                    value={data.mainStreet || ""}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>

                {/* 💡 إضافة حقل رابط الموقع */}
                <div className="md:col-span-3 border-t border-slate-100 pt-4 mt-2">
                  <label className={labelClass}>
                    رابط الموقع (خرائط جوجل / بلدي)
                  </label>
                  <div className="flex items-center gap-2 mt-1.5">
                    <input
                      name="mapUrl"
                      value={data.mapUrl || ""}
                      onChange={handleChange}
                      className={inputClass}
                      dir="ltr"
                      placeholder="https://maps.google.com/..."
                    />
                    {data.mapUrl && (
                      <a
                        href={
                          data.mapUrl.startsWith("http")
                            ? data.mapUrl
                            : `https://${data.mapUrl}`
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="p-2.5 bg-sky-50 text-sky-600 hover:bg-sky-600 hover:text-white rounded-xl transition-all shadow-sm"
                      >
                        <ExternalLink className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* الجدول الخاص بالحدود الجغرافية كما هو... */}
              <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-200">
                <h5 className="text-[11px] font-black text-slate-800 mb-4">
                  الحدود الجغرافية (Borders)
                </h5>
                <div className="grid grid-cols-5 gap-3 text-[10px] font-bold text-slate-500 text-center mb-2 px-1">
                  <div className="col-span-1 text-right">الاتجاه</div>
                  <div className="col-span-3">وصف الحد</div>
                  <div className="col-span-1">الطول (م)</div>
                </div>
                <div className="space-y-2">
                  {data.boundaries?.map((item, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-5 gap-3 items-center"
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
                        className={`${inputClass} col-span-1`}
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
                        className={`${inputClass} col-span-3`}
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
                        className={`${inputClass} col-span-1 text-center font-mono`}
                        type="number"
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
                    className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 mt-3 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> إضافة حد
                  </button>
                </div>
              </div>
            </div>

            {/* --- 5. المساحات والهندسة --- */}
            {/* (تم الاحتفاظ بها كما هي في الكود الأصلي لتوفير المساحة) */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h4 className="text-sm font-black text-slate-800 border-b border-slate-100 pb-3 mb-5 flex items-center gap-2">
                <Scale className="w-4 h-4 text-indigo-600" /> 5. المواصفات
                الهندسية
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-6">
                <div className="md:col-span-2">
                  <label className={labelClass}>مساحة الأرض (م2)</label>
                  <input
                    name="totalArea"
                    value={data.totalArea || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-3 text-sm font-black text-indigo-700 bg-indigo-50/50 border border-indigo-200 rounded-xl outline-none focus:ring-4 focus:ring-indigo-500/10 font-mono"
                    type="number"
                  />
                </div>
                <div>
                  <label className={labelClass}>نسبة التغطية %</label>
                  <input
                    name="coverageRatio"
                    value={data.coverageRatio || ""}
                    onChange={handleChange}
                    className={inputClass}
                    type="number"
                  />
                </div>
                <div>
                  <label className={labelClass}>معامل البناء F.A.R</label>
                  <input
                    name="far"
                    value={data.far || ""}
                    onChange={handleChange}
                    className={inputClass}
                    type="number"
                  />
                </div>
                <div>
                  <label className={labelClass}>الأدوار (فوق)</label>
                  <input
                    name="floorsAbove"
                    value={data.floorsAbove || ""}
                    onChange={handleChange}
                    className={inputClass}
                    type="number"
                  />
                </div>
                <div>
                  <label className={labelClass}>الأدوار (تحت)</label>
                  <input
                    name="floorsBelow"
                    value={data.floorsBelow || ""}
                    onChange={handleChange}
                    className={inputClass}
                    type="number"
                  />
                </div>
                <div>
                  <label className={labelClass}>المواقف (مطلوبة)</label>
                  <input
                    name="parkingRequired"
                    value={data.parkingRequired || ""}
                    onChange={handleChange}
                    className={inputClass}
                    type="number"
                  />
                </div>
                <div>
                  <label className={labelClass}>المواقف (متوفرة)</label>
                  <input
                    name="parkingAvailable"
                    value={data.parkingAvailable || ""}
                    onChange={handleChange}
                    className={inputClass}
                    type="number"
                  />
                </div>
              </div>
            </div>

            {/* --- 6. المكاتب المهنية --- */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h4 className="text-sm font-black text-slate-800 border-b border-slate-100 pb-3 mb-5 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-indigo-600" /> 6. المكاتب
                المهنية والملاحظات
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className={labelClass}>المكتب المصمم</label>
                    <LinkStatusBadge
                      isLinked={!!data.designerOfficeId}
                      extractedText={data.designerOfficeName}
                      isLinking={linkingStates.designer}
                      onLinkClick={() =>
                        handleAutoLink("designer", data.designerOfficeName)
                      }
                    />
                  </div>
                  <select
                    name="designerOfficeId"
                    value={data.designerOfficeId || ""}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="">-- اختر المكتب المصمم --</option>
                    {offices.map((off) => (
                      <option key={off.id} value={off.id}>
                        {off.nameAr || off.name?.ar || off.name || "بدون اسم"}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className={labelClass}>المكتب المشرف</label>
                    <LinkStatusBadge
                      isLinked={!!data.supervisorOfficeId}
                      extractedText={data.supervisorOfficeName}
                      isLinking={linkingStates.supervisor}
                      onLinkClick={() =>
                        handleAutoLink("supervisor", data.supervisorOfficeName)
                      }
                    />
                  </div>
                  <select
                    name="supervisorOfficeId"
                    value={data.supervisorOfficeId || ""}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="">-- اختر المكتب المشرف --</option>
                    {offices.map((off) => (
                      <option key={off.id} value={off.id}>
                        {off.nameAr || off.name?.ar || off.name || "بدون اسم"}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2 mt-4">
                  <label className={`${labelClass} mb-2 block`}>
                    ملاحظات الأرشفة
                  </label>
                  <textarea
                    name="archiveNotes"
                    value={data.archiveNotes || ""}
                    onChange={handleChange}
                    rows="4"
                    className={`${inputClass} resize-none leading-relaxed text-slate-700 bg-amber-50/50 border-amber-200`}
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
