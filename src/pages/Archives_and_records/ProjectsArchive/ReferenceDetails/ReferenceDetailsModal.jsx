import React, { useState, useEffect } from "react";
import {
  UserCheck,
  Save,
  Loader2,
  FileBadge2,
  FolderArchive,
  Briefcase,
  X,
  Scale,
  Ruler,
  Minimize2,
  AlertTriangle,
  GitMerge,
} from "lucide-react";
import { toast } from "sonner";
import api from "../../../../api/axios";
import { useAuth } from "../../../../context/AuthContext";

// استيراد المكونات التي قمنا بتقسيمها
import BasicInfoTab from "./Tabs/BasicInfoTab";
import LegalTab from "./Tabs/LegalTab";
import EngineeringTab from "./Tabs/EngineeringTab";
import BoundariesTab from "./Tabs/BoundariesTab";
import OfficesTab from "./Tabs/OfficesTab";
import AttachmentsTab from "./Tabs/AttachmentsTab";

export default function ReferenceDetailsModal({ projectId, isOpen, onClose }) {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState("basic");
  const [data, setData] = useState(null);
  const [isAiProcessing, setIsAiProcessing] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [sectors, setSectors] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [clients, setClients] = useState([]);
  const [offices, setOffices] = useState([]);
  const [selectedSectorId, setSelectedSectorId] = useState("");
  const [isReanalyzing, setIsReanalyzing] = useState(false);

  // 🚀 إضافة plan و plot إلى حالات الربط
  const [linkingStates, setLinkingStates] = useState({
    client: false,
    district: false,
    plan: false,
    plot: false,
    designer: false,
    supervisor: false,
  });

  const fetchProjectDetails = async () => {
    if (!projectId) return;
    try {
      const res = await api.get(`/archived-projects/${projectId}`);
      const project = res.data.data;

      setData({
        ...project,
        boundaries: project.boundaries || [],
        floorAreas: project.floorAreas || [],
        setbacks: project.setbacks || [],
        plots: project.plots || [],
        clientId: project.clientId || project.client?.id || "",
        districtId: project.districtId || project.district?.id || "",
        planId: project.planId || project.plan?.id || "", // 👈 جلب حالة المخطط
        designerOfficeId: project.designerOfficeId || "",
        supervisorOfficeId: project.supervisorOfficeId || "",
      });

      if (project.district && project.district.sectorId)
        setSelectedSectorId(project.district.sectorId);

      if (["completed", "failed", "approved"].includes(project.aiStatus)) {
        setIsAiProcessing(false);
      }

      return project;
    } catch (error) {
      console.error("Error fetching project data", error);
    }
  };

  const inputClass =
    "w-full px-3 py-2.5 text-xs font-bold text-slate-700 bg-slate-50/50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-[#d7b96d] focus:ring-4 focus:ring-[#e8dcc8]0/10 transition-all";
  const labelClass = "text-[11px] font-black text-slate-600";

  useEffect(() => {
    if (!isOpen) return;
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
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !projectId) return;
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
            planId: project.planId || project.plan?.id || "",
            designerOfficeId: project.designerOfficeId || "",
            supervisorOfficeId: project.supervisorOfficeId || "",
          });
          if (project.district && project.district.sectorId)
            setSelectedSectorId(project.district.sectorId);
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
  }, [projectId, isAiProcessing, isOpen]);

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

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // 💡 التعديل هنا: إضافة حقل aiStatus وتغيير قيمته إلى "approved" إجبارياً
      const payload = { 
        ...data, 
        aiStatus: "approved", // 👈 هذا السطر الذي يغير الحالة
        approvedById: user?.id 
      };
      
      await api.put(`/archived-projects/${projectId}`, payload);
      
      toast.success(
        `تم حفظ واعتماد المشروع بنجاح بواسطة: ${user?.name || "الموظف"}`,
      );
      
      onClose(); // إغلاق النافذة (وبالتالي سيتم تحديث الجدول في الشاشة الرئيسية)
    } catch (error) {
      toast.error("فشل الحفظ، تأكد من صحة البيانات والمُعرفات.");
      console.error("Save Error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // ==========================================
  // 🚀 دالة الربط الذكي الاحترافية (Auto Linker)
  // ==========================================
  const handleAutoLink = async (type, extractedName) => {
    if (!extractedName) return;

    setLinkingStates((prev) => ({ ...prev, [type]: true }));

    try {
      // 💡 معالجة استثنائية لـ "القطع" (Plots) للتحقق فقط
      if (type === "plot") {
        await new Promise((resolve) => setTimeout(resolve, 800)); // محاكاة فحص لإعطاء شعور بالاستجابة

        const plotsArray = Array.isArray(extractedName)
          ? extractedName
          : String(extractedName)
              .split(",")
              .map((p) => p.trim());

        // التحقق من الكلمات الوهمية
        const hasInvalid = plotsArray.some(
          (p) =>
            p.includes("بدون") ||
            p.includes("غير محدد") ||
            p.includes("لا يوجد"),
        );

        if (hasInvalid) {
          toast.error(
            "❌ لا يمكن ربط القطع. يرجى إدخال أرقام صحيحة بدلاً من 'بدون'.",
          );
        } else if (!data.planId) {
          toast.warning(
            "⚠️ يرجى ربط (المخطط التنظيمي) أولاً لضمان حفظ القطع بداخله عند الاعتماد.",
          );
        } else {
          toast.success(
            "✅ تم التحقق من صحة القطع. سيتم ربطها آلياً بالمخطط عند الضغط على حفظ واعتماد.",
          );
        }

        setLinkingStates((prev) => ({ ...prev, [type]: false }));
        return;
      }

      // 💡 معالجة باقي الأنواع (بحث في الداتابيز)
      const response = await api.post(
        `/archived-projects/${projectId}/auto-link`,
        {
          type,
          name: String(extractedName).trim(),
        },
      );

      if (response.data.success && response.data.id) {
        let idField = "";
        switch (type) {
          case "client":
            idField = "clientId";
            break;
          case "district":
            idField = "districtId";
            break;
          case "plan":
            idField = "planId";
            break;
          case "designer":
            idField = "designerOfficeId";
            break;
          case "supervisor":
            idField = "supervisorOfficeId";
            break;
          default:
            break;
        }

        if (idField) {
          setData((prev) => ({ ...prev, [idField]: response.data.id }));
          toast.success(`تم ربط ${extractedName} بنجاح!`);
        }
      } else {
        toast.error(`لم يتم العثور على تطابق في النظام لـ: ${extractedName}`);
      }
    } catch (error) {
      console.error("AutoLink Error:", error);
      toast.error("حدث خطأ أثناء محاولة الربط الآلي.");
    } finally {
      setLinkingStates((prev) => ({ ...prev, [type]: false }));
    }
  };

  const handleUploadFile = async (uploadedFiles) => {
    try {
      const formData = new FormData();
      uploadedFiles.forEach((file) => formData.append("files", file));
      formData.append("compressionLevel", "medium");
      formData.append("reanalyze", "false");

      const res = await api.post(
        `/archived-projects/${data.id}/files`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );

      if (res.data.success) {
        toast.success("تم رفع الملفات بنجاح");
        await fetchProjectDetails();
      }
      return res;
    } catch (error) {
      console.error("خطأ في الرفع:", error);
      toast.error(error.response?.data?.message || "فشل رفع الملفات");
      throw error;
    }
  };

  const handleDeleteFile = async (file) => {
    if (window.confirm("هل أنت متأكد من حذف هذا الملف نهائياً؟")) {
      try {
        await api.delete(`/archived-projects/files/${file.id}`);
        setData((prevData) => ({
          ...prevData,
          files: prevData.files.filter((f) => f.id !== file.id),
        }));
        toast.success("تم حذف الملف بنجاح.");
      } catch (error) {
        console.error("خطأ في حذف الملف:", error);
        toast.error("حدث خطأ أثناء محاولة حذف الملف.");
      }
    }
  };

  const handleRenameFile = async (file, newName) => {
    try {
      await api.put(`/archived-projects/files/${file.id}`, {
        originalName: newName,
      });
      setData((prevData) => ({
        ...prevData,
        files: prevData.files.map((f) =>
          f.id === file.id ? { ...f, originalName: newName } : f,
        ),
      }));
    } catch (error) {
      console.error("خطأ في تغيير اسم الملف:", error);
      toast.error("حدث خطأ أثناء محاولة تغيير اسم الملف.");
    }
  };

  const handleReanalyze = async () => {
    if (
      !window.confirm(
        "هل أنت متأكد من إعادة تحليل المشروع؟ سيتم قراءة جميع المرفقات وإغلاق هذه النافذة للعمل في الخلفية.",
      )
    )
      return;
    setIsReanalyzing(true);
    try {
      const response = await api.post(
        `/archived-projects/${projectId}/reanalyze`,
      );
      if (response.data.success) {
        toast.success(
          "تم إرسال طلب إعادة التحليل. سيقوم النظام بالمعالجة في الخلفية.",
        );
        onClose();
      }
    } catch (error) {
      console.error("Error reanalyzing project:", error);
      toast.error(
        error.response?.data?.message || "حدث خطأ أثناء محاولة إعادة التحليل.",
      );
      setIsReanalyzing(false);
    }
  };

  const handleMergeProjects = async (targetArchiveCode) => {
    let codeToMerge = targetArchiveCode;
    if (!codeToMerge) {
      codeToMerge = window.prompt(
        "أدخل كود المشروع الأقدم للدمج معه (مثال: ARC-2026-001):",
      );
    }
    if (!codeToMerge) return;

    if (
      !window.confirm(
        `سيتم نقل جميع الملفات إلى المشروع ${codeToMerge} وحذف السجل الحالي. هل أنت متأكد؟`,
      )
    )
      return;

    try {
      const response = await api.post(`/archived-projects/${projectId}/merge`, {
        targetArchiveCode: codeToMerge,
      });
      if (response.data.success) {
        toast.success("تمت عملية الدمج بنجاح! سيتم إغلاق النافذة.");
        onClose();
      }
    } catch (error) {
      toast.error("حدث خطأ أثناء الدمج. تأكد من صحة كود المشروع.");
    }
  };

  const isDuplicate = data?.archiveNotes?.includes("⚠️");
  const duplicateMatch = data?.archiveNotes?.match(/\b(ARC-\d{4}-\d{3})\b/);
  const targetArchiveCode = duplicateMatch ? duplicateMatch[1] : null;

  if (!isOpen) return null;

  if (isAiProcessing) {
    return (
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0f3d50]/50 backdrop-blur-sm p-4"
        dir="rtl"
      >
        <div className="relative bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center max-w-sm w-full mx-4 animate-in zoom-in-95 duration-300">
          <button
            onClick={onClose}
            className="absolute top-4 left-4 p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors"
            title="إغلاق والمتابعة في الخلفية"
          >
            <X className="w-5 h-5" />
          </button>
          <Loader2 className="w-14 h-14 text-[#123B5D] animate-spin mb-4" />
          <h2 className="text-xl font-black text-slate-800 text-center">
            جاري تحليل المستندات...
          </h2>
          <p className="text-sm text-slate-500 mt-2 mb-6 text-center font-medium">
            يقوم الذكاء الاصطناعي الآن بقراءة الملفات لاستخراج البيانات وربطها.
          </p>
          <button
            onClick={onClose}
            className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-black transition-colors flex items-center justify-center gap-2"
          >
            <Minimize2 className="w-4 h-4" /> إخفاء ومتابعة في الخلفية
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const tabs = [
    { id: "basic", label: "أساسيات ومالك", icon: UserCheck, color: "indigo" },
    { id: "legal", label: "رخص وموقع", icon: FileBadge2, color: "emerald" },
    {
      id: "engineering",
      label: "المساحات والهندسة",
      icon: Scale,
      color: "amber",
    },
    {
      id: "boundaries",
      label: "الحدود والارتدادات",
      icon: Ruler,
      color: "rose",
    },
    {
      id: "offices",
      label: "المكاتب والملاحظات",
      icon: Briefcase,
      color: "purple",
    },
    {
      id: "attachments",
      label: "المرفقات والمصادر",
      icon: FolderArchive,
      color: "slate",
    },
  ];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0f3d50]/60 backdrop-blur-sm p-4 sm:p-6"
      dir="rtl"
    >
      <div className="bg-slate-50 w-full max-w-[1200px] h-[95vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden ring-1 ring-white/20">
        {/* الهيدر */}
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex flex-wrap lg:flex-nowrap items-center justify-between shrink-0 gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-lg font-black text-slate-800">
                تفاصيل المشروع المؤرشف
              </h2>
              <p className="text-xs text-slate-500 font-bold mt-0.5">
                مراجعة وتعديل البيانات المستخرجة
              </p>
            </div>
          </div>

          {/* شريط التحذير وزر الدمج */}
          {isDuplicate && (
            <div className="flex items-center gap-3 bg-orange-50 border border-orange-200 p-1.5 pr-3 rounded-xl shadow-sm animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-2 text-orange-700">
                <AlertTriangle className="w-4 h-4 animate-pulse" />
                <span className="text-xs font-black">اكتشاف تكرار!</span>
              </div>
              <button
                onClick={() => handleMergeProjects(targetArchiveCode)}
                className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1.5 rounded-lg text-[11px] font-black flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
              >
                <GitMerge className="w-3.5 h-3.5" />
                دمج الملفات {targetArchiveCode ? `(${targetArchiveCode})` : ""}
              </button>
            </div>
          )}

          <div className="hidden sm:block text-left border-r border-slate-200 pr-4">
            <p className="text-[10px] text-slate-500 font-bold uppercase mb-1 text-right">
              دقة التحليل
            </p>
            <div className="flex items-center gap-2">
              <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${data.aiConfidence > 80 ? "bg-emerald-500" : data.aiConfidence > 50 ? "bg-amber-500" : "bg-rose-500"}`}
                  style={{ width: `${data.aiConfidence || 0}%` }}
                ></div>
              </div>
              <span className="text-xs font-black text-slate-700">
                {data.aiConfidence || 0}%
              </span>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-[#0f3d50] hover:bg-[#174e65] text-white px-6 py-2.5 rounded-xl text-sm font-black flex items-center gap-2 transition-all disabled:opacity-50 shadow-md shadow-[#0f3d50]/20 active:scale-95"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}{" "}
            حفظ واعتماد
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">
          <div className="w-64 bg-white border-l border-slate-200 flex flex-col overflow-y-auto shrink-0 p-3 gap-1 custom-scrollbar">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 w-full px-4 py-3 text-right rounded-xl transition-all duration-200 ${isActive ? `bg-${tab.color}-50 text-${tab.color}-700 border border-${tab.color}-200 shadow-sm font-black` : `bg-transparent text-slate-500 hover:bg-slate-50 border border-transparent font-bold`}`}
                >
                  <Icon
                    className={`w-5 h-5 ${isActive ? `text-${tab.color}-600` : "text-slate-400"}`}
                  />
                  <span className="text-xs">{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex-1 overflow-y-auto bg-slate-50 p-6 custom-scrollbar">
            <div className="max-w-4xl mx-auto space-y-6 pb-10">
              {activeTab === "basic" && (
                <BasicInfoTab
                  data={data}
                  handleChange={handleChange}
                  clients={clients}
                  linkingStates={linkingStates}
                  handleAutoLink={handleAutoLink}
                  inputClass={inputClass}
                  labelClass={labelClass}
                  onReanalyze={handleReanalyze}
                  isReanalyzing={isReanalyzing}
                />
              )}
              {activeTab === "legal" && (
                <LegalTab
                  data={data}
                  handleChange={handleChange}
                  sectors={sectors}
                  districts={districts}
                  selectedSectorId={selectedSectorId}
                  setSelectedSectorId={setSelectedSectorId}
                  linkingStates={linkingStates}
                  handleAutoLink={handleAutoLink}
                  inputClass={inputClass}
                  labelClass={labelClass}
                />
              )}
              {activeTab === "engineering" && (
                <EngineeringTab
                  data={data}
                  handleChange={handleChange}
                  handleArrayChange={handleArrayChange}
                  setData={setData}
                  inputClass={inputClass}
                  labelClass={labelClass}
                />
              )}
              {activeTab === "boundaries" && (
                <BoundariesTab
                  data={data}
                  handleArrayChange={handleArrayChange}
                  setData={setData}
                  inputClass={inputClass}
                  labelClass={labelClass}
                />
              )}
              {activeTab === "offices" && (
                <OfficesTab
                  data={data}
                  handleChange={handleChange}
                  offices={offices}
                  linkingStates={linkingStates}
                  handleAutoLink={handleAutoLink}
                  onMergeProjects={handleMergeProjects}
                  inputClass={inputClass}
                  labelClass={labelClass}
                />
              )}
              {activeTab === "attachments" && (
                <AttachmentsTab
                  data={data}
                  onDeleteFile={handleDeleteFile}
                  onRenameFile={handleRenameFile}
                  onUploadFile={handleUploadFile}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
