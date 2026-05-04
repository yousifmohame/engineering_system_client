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
  Briefcase,
  Link,
  Plus,
} from "lucide-react";
import api from "../../../api/axios";
import { useAuth } from "../../../context/AuthContext"; // 👈 1. استيراد سياق المصادقة

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
        <CircleCheckBig className="w-3 h-3" />
        مربوط بالنظام
      </span>
    );
  }

  if (!extractedText) {
    return (
      <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[10px] font-bold border border-slate-200">
        <TriangleAlert className="w-3 h-3" />
        غير مربوط (لا يوجد استخراج)
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
  // 👈 2. جلب بيانات المستخدم الحالي
  const { user } = useAuth();

  const [data, setData] = useState(null);
  const [isAiProcessing, setIsAiProcessing] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

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
    designer: false,
    supervisor: false,
  });

  // جلب البيانات المساعدة فور تحميل المكون
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

  // تحديث الحقول العادية
  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  // تحديث المصفوفات (الجداول)
  const handleArrayChange = (arrayName, index, field, value) => {
    setData((prev) => {
      const newArray = [...(prev[arrayName] || [])];
      newArray[index] = { ...newArray[index], [field]: value };
      return { ...prev, [arrayName]: newArray };
    });
  };

  // استعلام حالة الـ AI (Polling)
  useEffect(() => {
    let interval;
    const fetchProjectData = async () => {
      try {
        const res = await api.get(`/archived-projects/${projectId}`);
        const project = res.data.data;

        if (["completed", "failed", "approved"].includes(project.aiStatus)) {
          setData({
            ...project,
            boundaries: project.boundaries || [],
            floorAreas: project.floorAreas || [],
            setbacks: project.setbacks || [],
            plots: project.plots || [],
            clientId: project.clientId || project.client?.id || "",
            districtId: project.districtId || project.district?.id || "",
            designerOfficeId: project.designerOfficeId || "",
            supervisorOfficeId: project.supervisorOfficeId || "",
          });

          if (project.district && project.district.sectorId) {
            setSelectedSectorId(project.district.sectorId);
          }

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

  // حفظ البيانات النهائية
  const handleSave = async () => {
    setIsSaving(true);
    try {
      // 👈 3. (اختياري) يمكننا إرسال مُعرف الموظف المعتمد إذا كان الباك إند يدعم تحديثه
      const payload = {
        ...data,
        approvedById: user?.id,
      };

      await api.put(`/archived-projects/${projectId}`, payload);
      alert(
        `تم حفظ واعتماد المشروع بنجاح بواسطة المهندس/ة: ${user?.name || "الموظف"}`,
      );
      onClose();
    } catch (error) {
      console.error("Error saving data", error);
      alert("فشل الحفظ، تأكد من صحة البيانات والمُعرفات.");
    } finally {
      setIsSaving(false);
    }
  };

  // ==========================================
  // 3. دالة الإنشاء والربط التلقائي (Auto-Link)
  // ==========================================
  const handleAutoLink = async (type, extractedName) => {
    if (!extractedName) return;

    setLinkingStates((prev) => ({ ...prev, [type]: true }));
    try {
      let res;
      let newItem;

      if (type === "client") {
        const formData = new FormData();
        const uniqueSuffix = Math.floor(10000 + Math.random() * 90000);
        const dummyMobile = `05000${uniqueSuffix}`;
        const dummyId = `10000${uniqueSuffix}`;

        formData.append("officialNameAr", extractedName);
        formData.append("type", data.ownerType || "طبيعي (أفراد)");
        formData.append("mobile", data.contactMobile || dummyMobile);
        formData.append("idNumber", dummyId);

        res = await api.post("/clients", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        newItem = res.data?.data || res.data;
        setClients((prev) => [...prev, newItem]);
        setData((prev) => ({ ...prev, clientId: newItem.id }));
      } else if (type === "district") {
        if (!selectedSectorId) {
          alert(
            "لإنشاء حي جديد، يرجى اختيار 'القطاع' أولاً من القائمة المنسدلة للقطاعات.",
          );
          setLinkingStates((prev) => ({ ...prev, [type]: false }));
          return;
        }

        res = await api.post("/riyadh-streets/districts", {
          name: extractedName,
          sectorId: selectedSectorId,
          city: data.city || "الرياض",
        });

        newItem = res.data?.data || res.data;
        setDistricts((prev) => [...prev, newItem]);
        setData((prev) => ({ ...prev, districtId: newItem.id }));
      } else if (type === "designer" || type === "supervisor") {
        const officePayload = {
          nameAr: extractedName,
          nameEn: extractedName,
          commercialRegister: "0000000000",
          city: "none",
          code: "TEMP-" + Date.now(),
        };

        res = await api.post("/intermediary-offices", officePayload);
        newItem = res.data?.data || res.data;
        setOffices((prev) => [...prev, newItem]);

        if (type === "designer") {
          setData((prev) => ({ ...prev, designerOfficeId: newItem.id }));
        } else {
          setData((prev) => ({ ...prev, supervisorOfficeId: newItem.id }));
        }
      }
    } catch (error) {
      console.error(`Error auto-linking ${type}:`, error);
      const errorMessage = error.response?.data?.message || error.message;
      alert(`حدث خطأ أثناء الإنشاء التلقائي: ${errorMessage}`);
    } finally {
      setLinkingStates((prev) => ({ ...prev, [type]: false }));
    }
  };

  // شاشة الانتظار
  if (isAiProcessing) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50/50 backdrop-blur-sm">
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-indigo-50 flex flex-col items-center">
          <Loader2 className="w-14 h-14 text-indigo-600 animate-spin mb-4" />
          <h2 className="text-xl font-black text-slate-800">
            جاري تحليل المخططات والرخص...
          </h2>
          <p className="text-sm text-slate-500 mt-2 text-center max-w-sm leading-relaxed font-medium">
            يقوم الذكاء الاصطناعي الآن بقراءة الملفات واستخراج البيانات لربطها
            تلقائياً.
          </p>
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
      {/* ==================== Top Bar - AI Stats ==================== */}
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
                className="h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${data.aiConfidence || 0}%` }}
              ></div>
            </div>
          </div>
          <div className="hidden lg:block w-px h-10 bg-slate-100"></div>
          <div className="flex gap-5 text-center shrink-0">
            <div>
              <span className="text-lg font-black text-emerald-600 leading-none flex items-center justify-center gap-1.5">
                <CircleCheckBig className="w-4 h-4" /> جاهز
              </span>
              <span className="text-[10px] text-slate-400 font-bold mt-1 block">
                حالة التحليل
              </span>
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

      {/* ==================== Grid Layout ==================== */}
      <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-4 h-full">
        {/* المرفقات Sidebar */}
        <div className="hidden lg:flex col-span-3 bg-white rounded-2xl shadow-sm border border-slate-200 flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
            <h3 className="text-xs font-black text-slate-800 flex items-center gap-2">
              <FolderArchive className="w-4 h-4 text-indigo-600" /> المصادر
              والمرفقات ({data.files?.length || 0})
            </h3>
            <p className="text-[10px] text-slate-400 mt-1 font-medium">
              يعتمد الاستخراج الآلي على هذه الملفات
            </p>
          </div>
          <div className="p-3 overflow-y-auto space-y-2 custom-scrollbar">
            {data.files?.map((file, idx) => (
              <a
                key={idx}
                href={file.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-start gap-3 p-3 hover:bg-indigo-50/50 rounded-xl group border border-transparent hover:border-indigo-100 transition-colors"
              >
                <div className="p-2 bg-indigo-50 rounded-lg group-hover:bg-indigo-100 transition-colors">
                  <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                </div>
                <div className="overflow-hidden">
                  <span
                    className="text-xs font-bold text-slate-700 truncate block group-hover:text-indigo-700"
                    dir="ltr"
                  >
                    {file.originalName}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                    {(file.fileSize / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="col-span-1 lg:col-span-9 overflow-y-auto rounded-2xl custom-scrollbar pr-2 pb-10">
          <div className="flex flex-col gap-5">
            {/* --- 1. معلومات المشروع الأساسية --- */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h4 className="text-sm font-black text-slate-800 border-b border-slate-100 pb-3 mb-5 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-indigo-600" /> 1. معلومات
                المشروع الأساسية
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="md:col-span-2">
                  <label className={`${labelClass} mb-1.5 block`}>
                    اسم المشروع <span className="text-rose-500">*</span>
                  </label>
                  <input
                    name="title"
                    value={data.title || ""}
                    onChange={handleChange}
                    className={inputClass}
                    type="text"
                  />
                </div>
                <div>
                  <label className={`${labelClass} mb-1.5 block`}>
                    الرقم الموحد (للأرشفة)
                  </label>
                  <input
                    readOnly
                    value={data.archiveCode || ""}
                    className={`${inputClass} bg-slate-100 text-slate-500 cursor-not-allowed`}
                    type="text"
                  />
                </div>
                <div>
                  <label className={`${labelClass} mb-1.5 block`}>
                    نوع المشروع
                  </label>
                  <input
                    name="projectType"
                    value={data.projectType || ""}
                    onChange={handleChange}
                    className={inputClass}
                    type="text"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className={`${labelClass} mb-1.5 block`}>
                    نوع المعاملة
                  </label>
                  <input
                    name="transactionType"
                    value={data.transactionType || ""}
                    onChange={handleChange}
                    placeholder="مثال: إصدار رخصة، فرز..."
                    className={inputClass}
                    type="text"
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
                    {clients.map((client, idx) => {
                      const clientName =
                        typeof client.name === "object"
                          ? client.name?.ar ||
                            client.name?.en ||
                            "عميل بدون اسم"
                          : client.name || "عميل بدون اسم";

                      return (
                        <option
                          key={`${client.id || "client"}-${idx}`}
                          value={client.id}
                        >
                          {clientName}{" "}
                          {client.idNumber ? `(${client.idNumber})` : ""}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div>
                  <label className={`${labelClass} mb-1.5 block`}>
                    نوع المالك
                  </label>
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
                  <label className={`${labelClass} mb-1.5 block`}>
                    رقم الجوال / الاتصال
                  </label>
                  <input
                    name="contactMobile"
                    value={data.contactMobile || ""}
                    onChange={handleChange}
                    className={`${inputClass} font-mono`}
                    type="text"
                    dir="ltr"
                    placeholder="05XXXXXXXX"
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
                  <label className={`${labelClass} mb-1.5 block`}>
                    رقم رخصة البناء
                  </label>
                  <input
                    name="licenseNumber"
                    value={data.licenseNumber || ""}
                    onChange={handleChange}
                    className={`${inputClass} font-mono`}
                  />
                </div>
                <div>
                  <label className={`${labelClass} mb-1.5 block`}>
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
                    className={inputClass}
                    type="date"
                  />
                </div>
                <div>
                  <label className={`${labelClass} mb-1.5 block`}>
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
                    className={inputClass}
                    type="date"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className={`${labelClass} mb-1.5 block`}>
                    رقم صك الملكية
                  </label>
                  <input
                    name="deedNumber"
                    value={data.deedNumber || ""}
                    onChange={handleChange}
                    className={`${inputClass} font-mono`}
                  />
                </div>
                <div>
                  <label className={`${labelClass} mb-1.5 block`}>
                    تاريخ الصك
                  </label>
                  <input
                    name="deedDate"
                    value={data.deedDate ? data.deedDate.split("T")[0] : ""}
                    onChange={handleChange}
                    className={inputClass}
                    type="date"
                  />
                </div>
                <div>
                  <label className={`${labelClass} mb-1.5 block`}>
                    المدينة
                  </label>
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
                <div className="md:col-span-1">
                  <label className={`${labelClass} mb-1.5 block`}>القطاع</label>
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

                <div className="md:col-span-1">
                  <div className="flex justify-between items-center mb-1.5">
                    <label className={labelClass}>
                      الحي (ربط بدليل الأحياء)
                    </label>
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
                <div>
                  <label className={`${labelClass} mb-1.5 block`}>
                    رقم المخطط التنظيمي
                  </label>
                  <input
                    name="planNumber"
                    value={data.planNumber || ""}
                    onChange={handleChange}
                    className={`${inputClass} font-mono`}
                  />
                </div>
                <div>
                  <label className={`${labelClass} mb-1.5 block`}>
                    أرقام القطع
                  </label>
                  <input
                    value={data.plots?.join(", ") || ""}
                    onChange={(e) =>
                      setData({ ...data, plots: e.target.value.split(", ") })
                    }
                    className={`${inputClass} font-mono`}
                    placeholder="10, 11"
                  />
                </div>
                <div className="md:col-span-3">
                  <label className={`${labelClass} mb-1.5 block`}>
                    اسم الشارع الرئيسي وعرضه
                  </label>
                  <input
                    name="mainStreet"
                    value={data.mainStreet || ""}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Boundaries Table */}
              <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-200">
                <h5 className="text-[11px] font-black text-slate-800 mb-4">
                  الحدود الجغرافية (Borders)
                </h5>
                <div className="grid grid-cols-5 gap-3 text-[10px] font-bold text-slate-500 text-center mb-2 px-1">
                  <div className="col-span-1 text-right">الاتجاه</div>
                  <div className="col-span-3">وصف الحد (شارع/جار)</div>
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
                        placeholder="شمالاً"
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
                        placeholder="وصف الجار"
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
                        placeholder="0.00"
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
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h4 className="text-sm font-black text-slate-800 border-b border-slate-100 pb-3 mb-5 flex items-center gap-2">
                <Scale className="w-4 h-4 text-indigo-600" /> 5. المواصفات
                الهندسية
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-6">
                <div className="md:col-span-2">
                  <label className={`${labelClass} mb-1.5 block`}>
                    مساحة الأرض الإجمالية (م2)
                  </label>
                  <input
                    name="totalArea"
                    value={data.totalArea || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-3 text-sm font-black text-indigo-700 bg-indigo-50/50 border border-indigo-200 rounded-xl outline-none focus:ring-4 focus:ring-indigo-500/10 font-mono"
                    type="number"
                  />
                </div>
                <div>
                  <label className={`${labelClass} mb-1.5 block`}>
                    نسبة التغطية %
                  </label>
                  <input
                    name="coverageRatio"
                    value={data.coverageRatio || ""}
                    onChange={handleChange}
                    className={`${inputClass} font-mono`}
                    type="number"
                  />
                </div>
                <div>
                  <label className={`${labelClass} mb-1.5 block`}>
                    معامل البناء F.A.R
                  </label>
                  <input
                    name="far"
                    value={data.far || ""}
                    onChange={handleChange}
                    className={`${inputClass} font-mono`}
                    type="number"
                  />
                </div>
                <div>
                  <label className={`${labelClass} mb-1.5 block`}>
                    الأدوار (فوق الأرض)
                  </label>
                  <input
                    name="floorsAbove"
                    value={data.floorsAbove || ""}
                    onChange={handleChange}
                    className={`${inputClass} font-mono text-center`}
                    type="number"
                  />
                </div>
                <div>
                  <label className={`${labelClass} mb-1.5 block`}>
                    الأدوار (تحت الأرض)
                  </label>
                  <input
                    name="floorsBelow"
                    value={data.floorsBelow || ""}
                    onChange={handleChange}
                    className={`${inputClass} font-mono text-center`}
                    type="number"
                  />
                </div>
                <div>
                  <label className={`${labelClass} mb-1.5 block`}>
                    المواقف (المطلوبة)
                  </label>
                  <input
                    name="parkingRequired"
                    value={data.parkingRequired || ""}
                    onChange={handleChange}
                    className={`${inputClass} font-mono text-center`}
                    type="number"
                  />
                </div>
                <div>
                  <label className={`${labelClass} mb-1.5 block`}>
                    المواقف (المتوفرة)
                  </label>
                  <input
                    name="parkingAvailable"
                    value={data.parkingAvailable || ""}
                    onChange={handleChange}
                    className={`${inputClass} font-mono text-center`}
                    type="number"
                  />
                </div>
              </div>

              {/* Floor Areas Table */}
              <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-200 mb-6">
                <h5 className="text-[11px] font-black text-slate-800 mb-3">
                  تفصيل مسطحات البناء
                </h5>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {data.floorAreas?.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-white border border-slate-200 p-3 rounded-xl text-center shadow-sm"
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
                        className="block w-full text-center text-[10px] text-slate-500 font-bold mb-2 outline-none"
                        placeholder="اسم الدور"
                      />
                      <div className="flex items-center justify-center gap-1">
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
                          className="font-mono text-sm w-16 text-center font-black text-slate-800 outline-none"
                          type="number"
                        />
                        <span className="text-[10px] font-bold text-slate-400">
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
                        { floor: "دور إضافي", area: 0 },
                      ],
                    })
                  }
                  className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 mt-3 flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> إضافة مساحة دور
                </button>
              </div>

              {/* Setbacks Table */}
              <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-200">
                <h5 className="text-[11px] font-black text-slate-800 mb-3">
                  الارتدادات (Setbacks)
                </h5>
                <table className="w-full text-right text-[10px] font-bold border-separate border-spacing-y-2">
                  <thead className="text-slate-400">
                    <tr>
                      <th className="px-2 pb-2">الجهة</th>
                      <th className="px-2 pb-2 text-center">النظامي (م)</th>
                      <th className="px-2 pb-2 text-center">المنفذ (م)</th>
                      <th className="px-2 pb-2 text-center">الحالة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.setbacks?.map((item, idx) => (
                      <tr
                        key={idx}
                        className={
                          item.status === "مخالف"
                            ? "bg-rose-50/50 rounded-lg"
                            : ""
                        }
                      >
                        <td className="p-1">
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
                            className={`${inputClass} w-24`}
                            placeholder="الجهة"
                          />
                        </td>
                        <td className="p-1 text-center">
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
                            className={`${inputClass} w-16 text-center font-mono`}
                            type="number"
                          />
                        </td>
                        <td className="p-1 text-center">
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
                            className={`${inputClass} w-16 text-center font-mono`}
                            type="number"
                          />
                        </td>
                        <td className="p-1 text-center">
                          <select
                            value={item.status || "مطابق"}
                            onChange={(e) =>
                              handleArrayChange(
                                "setbacks",
                                idx,
                                "status",
                                e.target.value,
                              )
                            }
                            className={`${inputClass} ${item.status === "مخالف" ? "text-rose-600 bg-rose-50" : "text-emerald-600 bg-emerald-50"}`}
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
                  className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 mt-2 flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> إضافة ارتداد
                </button>
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
                    {/* 👈 4. تأمين عرض اسم المكتب كـ String دائماً */}
                    {offices.map((off, idx) => {
                      const officeName =
                        off.nameAr ||
                        (typeof off.name === "object"
                          ? off.name?.ar
                          : off.name) ||
                        "مكتب بدون اسم";
                      return (
                        <option
                          key={`${off.id || "des"}-${idx}`}
                          value={off.id}
                        >
                          {officeName}
                        </option>
                      );
                    })}
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
                    {/* 👈 4. تأمين عرض اسم المكتب كـ String دائماً */}
                    {offices.map((off, idx) => {
                      const officeName =
                        off.nameAr ||
                        (typeof off.name === "object"
                          ? off.name?.ar
                          : off.name) ||
                        "مكتب بدون اسم";
                      return (
                        <option
                          key={`${off.id || "sup"}-${idx}`}
                          value={off.id}
                        >
                          {officeName}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="md:col-span-2 mt-4">
                  <label className={`${labelClass} mb-2 block`}>
                    ملاحظات الأرشفة (مستخرجة من الذكاء الاصطناعي)
                  </label>
                  <textarea
                    name="archiveNotes"
                    value={data.archiveNotes || ""}
                    onChange={handleChange}
                    rows="4"
                    className={`${inputClass} resize-none leading-relaxed text-slate-700 bg-amber-50/50 border-amber-200`}
                    placeholder="ملاحظات النظام حول التجاوزات أو البيانات الناقصة..."
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
