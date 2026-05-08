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
} from "lucide-react";
import { toast } from "sonner";
import api from "../../../api/axios";
import { useAuth } from "../../../context/AuthContext";

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

  const [linkingStates, setLinkingStates] = useState({
    client: false,
    district: false,
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
        designerOfficeId: project.designerOfficeId || "",
        supervisorOfficeId: project.supervisorOfficeId || "",
      });

      if (project.district && project.district.sectorId)
        setSelectedSectorId(project.district.sectorId);

      // إذا اكتمل التحليل، نوقف حالة التحميل
      if (["completed", "failed", "approved"].includes(project.aiStatus)) {
        setIsAiProcessing(false);
      }

      return project;
    } catch (error) {
      console.error("Error fetching project data", error);
    }
  };

  const inputClass =
    "w-full px-3 py-2.5 text-xs font-bold text-slate-700 bg-slate-50/50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all";
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

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = { ...data, approvedById: user?.id };
      await api.put(`/archived-projects/${projectId}`, payload);
      alert(`تم حفظ واعتماد المشروع بنجاح بواسطة: ${user?.name || "الموظف"}`);
      onClose();
    } catch (error) {
      alert("فشل الحفظ، تأكد من صحة البيانات والمُعرفات.");
    } finally {
      setIsSaving(false);
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
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      if (res.data.success) {
        toast.success("تم رفع الملفات بنجاح");

        // 💡 الآن الدالة ستعمل ولن تعطي ReferenceError
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
        // الاتصال بالخادم لحذف الملف (تأكد من مسار الـ API الخاص بك)
        await api.delete(`/archived-projects/files/${file.id}`);

        // تحديث الواجهة فوراً بمسح الملف من القائمة دون الحاجة لعمل Refresh للصفحة
        setData((prevData) => ({
          ...prevData,
          files: prevData.files.filter((f) => f.id !== file.id),
        }));
        toast.success("تم حذف الملف بنجاح.");
      } catch (error) {
        console.error("خطأ في حذف الملف:", error);
        alert("حدث خطأ أثناء محاولة حذف الملف.");
      }
    }
  };

  // 2. دالة تعديل اسم الملف
  const handleRenameFile = async (file, newName) => {
    try {
      // الاتصال بالخادم لتحديث اسم الملف
      // ملاحظة: قد يحتاج الخادم إلى تشفير الاسم مرة أخرى أو إرساله كما هو حسب إعداداتك
      await api.put(`/archived-projects/files/${file.id}`, {
        originalName: newName,
      });

      // تحديث الواجهة فوراً بالاسم الجديد
      setData((prevData) => ({
        ...prevData,
        files: prevData.files.map((f) =>
          f.id === file.id ? { ...f, originalName: newName } : f,
        ),
      }));
    } catch (error) {
      console.error("خطأ في تغيير اسم الملف:", error);
      alert("حدث خطأ أثناء محاولة تغيير اسم الملف.");
    }
  };

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
        if (!selectedSectorId) {
          alert("لإنشاء حي جديد، يرجى اختيار 'القطاع' أولاً.");
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
        res = await api.post("/intermediary-offices", {
          nameAr: extractedName,
          nameEn: extractedName,
          commercialRegister: "0000000000",
          city: "none",
          code: "TEMP-" + Date.now(),
        });
        newItem = res.data?.data || res.data;
        setOffices((prev) => [...prev, newItem]);
        if (type === "designer")
          setData((prev) => ({ ...prev, designerOfficeId: newItem.id }));
        else setData((prev) => ({ ...prev, supervisorOfficeId: newItem.id }));
      } else if (type === "plan") {
        // نفترض أن لديك مسار API لإنشاء أو جلب المخططات
        res = await api.post("/riyadh-streets/plans", {
          name: extractedName,
          city: data.city || "الرياض",
        });
        newItem = res.data?.data || res.data;

        // تحديث حالة المشروع بالمعرف الجديد للمخطط
        setData((prev) => ({ ...prev, planId: newItem.id }));
        toast.success(`تم حفظ وربط المخطط (${extractedName}) بنجاح.`);
      }
    } catch (error) {
      alert(
        `حدث خطأ أثناء الإنشاء التلقائي: ${error.response?.data?.message || error.message}`,
      );
    } finally {
      setLinkingStates((prev) => ({ ...prev, [type]: false }));
    }
  };

  // ========================================================
  // دالة إعادة التحليل (تعمل في الخلفية وتغلق النافذة)
  // ========================================================
  const handleReanalyze = async () => {
    if (
      !window.confirm(
        "هل أنت متأكد من إعادة تحليل المشروع؟ سيتم قراءة جميع المرفقات الحالية وإغلاق هذه النافذة للعمل في الخلفية.",
      )
    )
      return;

    setIsReanalyzing(true);
    try {
      // الاتصال بالباك إند لطلب إعادة التحليل
      const response = await api.post(
        `/archived-projects/${projectId}/reanalyze`,
      );

      if (response.data.success) {
        alert(
          "تم إرسال طلب إعادة التحليل. سيقوم النظام بمعالجة الملفات في الخلفية وإشعارك عند الانتهاء.",
        );

        // 👈 السر هنا: استدعاء دالة إغلاق النافذة مباشرة بعد نجاح الطلب
        onClose();
      }
    } catch (error) {
      console.error("Error reanalyzing project:", error);
      alert(
        error.response?.data?.message || "حدث خطأ أثناء محاولة إعادة التحليل.",
      );

      // نوقف حالة التحميل فقط في حال حدوث خطأ (لأن النافذة لن تغلق)
      setIsReanalyzing(false);
    }
  };

  const handleMergeProjects = async (targetArchiveCode) => {
    if (
      !window.confirm(
        `سيتم نقل جميع الملفات إلى المشروع ${targetArchiveCode} وحذف السجل الحالي. هل أنت متأكد؟`,
      )
    )
      return;

    try {
      // نفترض أنك أضفت المسار في ملف api/axios.js
      const response = await api.post(`/archived-projects/${projectId}/merge`, {
        targetArchiveCode,
      });
      if (response.data.success) {
        alert("تمت عملية الدمج بنجاح! سيتم إغلاق هذه النافذة.");
        onClose(); // إغلاق النافذة الحالية وتحديث الجدول في الشاشة الرئيسية
      }
    } catch (error) {
      alert("حدث خطأ أثناء الدمج.");
    }
  };

  if (!isOpen) return null;

  if (isAiProcessing) {
    return (
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4"
        dir="rtl"
      >
        {/* 💡 أضفنا relative للحاوية لتتمكن من احتواء زر الـ X */}
        <div className="relative bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center max-w-sm w-full mx-4 animate-in zoom-in-95 duration-300">
          {/* ========================================== */}
          {/* 👈 زر الإغلاق (X) في الزاوية العلوية */}
          {/* ========================================== */}
          <button
            onClick={onClose}
            className="absolute top-4 left-4 p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors"
            title="إغلاق والمتابعة في الخلفية"
          >
            <X className="w-5 h-5" />
          </button>

          <Loader2 className="w-14 h-14 text-indigo-600 animate-spin mb-4" />

          <h2 className="text-xl font-black text-slate-800 text-center">
            جاري تحليل المستندات...
          </h2>

          <p className="text-sm text-slate-500 mt-2 mb-6 text-center font-medium">
            يقوم الذكاء الاصطناعي الآن بقراءة الملفات لاستخراج البيانات وربطها.
          </p>

          {/* ========================================== */}
          {/* 👈 زر الإغلاق الواضح (إخفاء ومتابعة) */}
          {/* ========================================== */}
          <button
            onClick={onClose}
            className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-black transition-colors flex items-center justify-center gap-2"
          >
            <Minimize2 className="w-4 h-4" />
            إخفاء ومتابعة في الخلفية
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
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 sm:p-6"
      dir="rtl"
    >
      <div className="bg-slate-50 w-full max-w-[1200px] h-[95vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden ring-1 ring-white/20">
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
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
          <div className="flex items-center gap-6">
            <div className="hidden sm:block text-left">
              <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">
                دقة الذكاء الاصطناعي
              </p>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500"
                    style={{ width: `${data.aiConfidence || 0}%` }}
                  ></div>
                </div>
                <span className="text-xs font-black text-emerald-600">
                  {data.aiConfidence || 0}%
                </span>
              </div>
            </div>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl text-sm font-black flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              حفظ واعتماد
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="w-64 bg-white border-l border-slate-200 flex flex-col overflow-y-auto shrink-0 p-3 gap-1 custom-scrollbar">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 w-full px-4 py-3 text-right rounded-xl transition-all duration-200 ${
                    isActive
                      ? `bg-${tab.color}-50 text-${tab.color}-700 border border-${tab.color}-200 shadow-sm font-black`
                      : `bg-transparent text-slate-500 hover:bg-slate-50 border border-transparent font-bold`
                  }`}
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
                  onReanalyze={handleReanalyze} // 👈 تمرير دالة التشغيل
                  isReanalyzing={isReanalyzing} // 👈 تمرير حالة التحميل
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
