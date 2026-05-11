// src/components/RiyadhDivision/tabs/PlansTab.jsx
import React, { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../../api/axios";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import {
  Layers,
  Plus,
  Edit,
  X,
  Loader2,
  Info,
  PieChart,
  FolderOpen,
  FileEdit,
  Map,
  Globe,
  Link2,
  Image as ImageIcon,
  Trash2,
  Download,
  CheckCircle2,
  AlertTriangle,
  FileUp,
  Route,
  Landmark,
  FileText,
  ShieldAlert,
  User,
  Clock,
  Paperclip,
  Grid3X3,
  FileImage,
  FileCode,
  File,
  Eye,
  UploadCloud,
} from "lucide-react";
import { useAuth } from "../../../../context/AuthContext";

// استيراد المكونات المنفصلة
import PlotsDetailsTab from "./components/PlotsDetailsTab";
import StatsTab from "./components/StatsTab";
import ReferenceDetailsModal from "../../../ProjectsArchive/ReferenceDetails/ReferenceDetailsModal";
import ClientFileDetails from "../../../Clients/ClientFileDetails";

const MODAL_TABS = [
  { id: "general", label: "معلومات عامة", icon: Info },
  { id: "stats", label: "الإحصائيات", icon: PieChart },
  { id: "plots_details", label: "تفاصيل القطع", icon: Grid3X3 },
  { id: "files", label: "ملفات المخطط", icon: FolderOpen },
  { id: "special_reg", label: "تنظيمات خاصة", icon: ShieldAlert },
  { id: "notes", label: "ملاحظات عامة", icon: FileEdit },
];

const getFileIcon = (type) => {
  const t = type?.toLowerCase() || "";
  if (["jpg", "jpeg", "png", "webp", "tiff"].includes(t))
    return <FileImage className="w-5 h-5 mb-0.5 text-emerald-500" />;
  if (["pdf"].includes(t))
    return <FileText className="w-5 h-5 mb-0.5 text-rose-500" />;
  if (["dwg", "dxf"].includes(t))
    return <FileCode className="w-5 h-5 mb-0.5 text-indigo-500" />;
  return <File className="w-5 h-5 mb-0.5 text-slate-500" />;
};

const getFullUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  let fixedUrl = url;
  if (url.startsWith("/uploads/")) fixedUrl = `/api${url}`;
  const baseUrl = "https://details-worksystem1.com"; // 💡 الدومين والبورت
  return `${baseUrl}${fixedUrl}`;
};

const PlansTab = () => {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();

  // States
  const [newReg, setNewReg] = useState({ text: "", files: [] });
  const [fileInputKey, setFileInputKey] = useState(Date.now()); // مفتاح سحري لتفريغ مدخلات الملفات
  const [archiveModal, setArchiveModal] = useState({
    isOpen: false,
    projectId: null,
  });
  const [clientModal, setClientModal] = useState({
    isOpen: false,
    clientId: null,
  });
  const [previewFile, setPreviewFile] = useState(null);

  // Drag and Drop States
  const [isDraggingFiles, setIsDraggingFiles] = useState(false);
  const [isDraggingOfficial, setIsDraggingOfficial] = useState(false);
  const [isDraggingGoogle, setIsDraggingGoogle] = useState(false);

  // حالة المودال الرئيسي
  const [planModal, setPlanModal] = useState({
    isOpen: false,
    mode: "create",
    activeTab: "general",
    data: {
      id: null,
      planNumber: "",
      oldNumber: "",
      hijriYear: "",
      areaKm: "",
      areaM: "",
      mainUsages: "",
      subUsages: "",
      totalPlots: 0,
      neighborhoods: "",
      officialMapUrl: "",
      googleMapUrl: "",
      officialMapImage: null,
      googleMapImage: null,
      streets: [],
      files: [],
      specialRegulations: [],
      notes: "",
      status: "معتمد",
    },
  });

  // 1. جلب البيانات الرئيسية
  const { data: plansData = [], isLoading } = useQuery({
    queryKey: ["riyadh-plans"],
    queryFn: async () => (await api.get("/riyadh-streets/plans")).data,
  });

  // 2. الميوتيشنز (الحفظ والحذف)
  const planMutation = useMutation({
    mutationFn: async (payload) =>
      planModal.mode === "create"
        ? await api.post("/riyadh-streets/plans", payload)
        : await api.put(`/riyadh-streets/plans/${payload.id}`, payload),
    onSuccess: () => {
      toast.success("تم حفظ بيانات المخطط بنجاح");
      queryClient.invalidateQueries(["riyadh-plans"]);
      setPlanModal((prev) => ({ ...prev, isOpen: false }));
    },
    onError: () => toast.error("حدث خطأ أثناء الحفظ"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => await api.delete(`/riyadh-streets/plans/${id}`),
    onSuccess: () => {
      toast.success("تم حذف المخطط");
      queryClient.invalidateQueries(["riyadh-plans"]);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    planMutation.mutate(planModal.data);
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    if (window.confirm("هل أنت متأكد من الحذف النهائي لهذا المخطط؟")) {
      deleteMutation.mutate(id);
    }
  };

  // ==========================================
  // 🛠️ دوال معالجة الملفات الاحترافية (آمنة ضد التعليق)
  // ==========================================

  // معالجة اللصق (Paste) من الحافظة (Notepad / Screenshots)
  const handlePasteEvent = (e, fieldName) => {
    const items = e.clipboardData?.items || [];
    let imageFound = false;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        imageFound = true;
        const blob = items[i].getAsFile();
        const reader = new FileReader();
        reader.onload = (event) => {
          setPlanModal((prev) => ({
            ...prev,
            data: { ...prev.data, [fieldName]: event.target.result },
          }));
          toast.success("تم لصق الصورة بنجاح");
        };
        reader.readAsDataURL(blob);
        break; // نكتفي بأول صورة
      }
    }
    if (!imageFound && e.clipboardData.files.length > 0) {
      // دعم لصق الملفات العادية إن أمكن
      processFilesList(e.clipboardData.files, fieldName);
    }
  };

  // دالة موحدة لقراءة الملفات
  // دالة موحدة لقراءة الملفات
  const processFilesList = (filesList, target) => {
    const files = Array.from(filesList);
    if (files.length === 0) return;

    if (target === "officialMapImage" || target === "googleMapImage") {
      const file = files[0];
      if (!file.type.startsWith("image/"))
        return toast.error("يرجى اختيار صورة فقط للخرائط");
      const reader = new FileReader();
      reader.onload = (event) =>
        setPlanModal((prev) => ({
          ...prev,
          data: { ...prev.data, [target]: event.target.result },
        }));
      reader.readAsDataURL(file);
    } else if (target === "planFiles") {
      // 🚀 التعديل الجذري هنا: تحويل الملفات إلى Base64 بدلاً من روابط وهمية
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const newFile = {
            id: Date.now() + Math.random(),
            name: file.name,
            url: event.target.result, // 👈 حفظ البيانات الفعلية للملف ليتم إرسالها لقاعدة البيانات
            desc: "",
            type: file.name.split(".").pop().toUpperCase(),
          };
          setPlanModal((prev) => ({
            ...prev,
            data: {
              ...prev.data,
              files: [...(prev.data.files || []), newFile],
            },
          }));
        };
        reader.readAsDataURL(file);
      });
    } else if (target === "regFiles") {
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          setNewReg((prev) => ({
            ...prev,
            files: [
              ...(prev.files || []),
              {
                id: Date.now() + Math.random(),
                name: file.name,
                url: event.target.result,
                type: file.type,
              },
            ],
          }));
        };
        reader.readAsDataURL(file);
      });
    }
  };

  // معالجات الإدخال المباشر للـ Inputs
  const handleFileInputChange = (e, target) => {
    processFilesList(e.target.files, target);
    e.target.value = null; // 🚀 هذا السطر يمنع تعليق المتصفح للأبد!
    setFileInputKey(Date.now()); // تحديث المفتاح لضمان إعادة التهيئة
  };

  // دوال التحويل بين كيلومتر ومتر
  const handleAreaKmChange = (val) => {
    const num = parseFloat(val);
    const areaM = !isNaN(num) ? (num * 1000000).toString() : "";
    setPlanModal((prev) => ({
      ...prev,
      data: { ...prev.data, areaKm: val, areaM },
    }));
  };
  const handleAreaMChange = (val) => {
    const num = parseFloat(val);
    const areaKm = !isNaN(num) ? (num / 1000000).toString() : "";
    setPlanModal((prev) => ({
      ...prev,
      data: { ...prev.data, areaM: val, areaKm },
    }));
  };

  const addStreetToPlan = () => {
    setPlanModal((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        streets: [
          ...(prev.data.streets || []),
          {
            id: Date.now(),
            name: "",
            width: "",
            hasSpecialReg: false,
            regDesc: "",
          },
        ],
      },
    }));
  };

  const handleAddRegulation = () => {
    if (!newReg.text.trim() && newReg.files.length === 0) return;
    const regulationItem = {
      id: Date.now().toString(),
      text: newReg.text,
      files: newReg.files,
      authorName: currentUser?.name || "مدير النظام",
      createdAt: new Date().toISOString(),
    };
    setPlanModal((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        specialRegulations: [
          regulationItem,
          ...(prev.data.specialRegulations || []),
        ],
      },
    }));
    setNewReg({ text: "", files: [] });
  };

  if (isLoading)
    return (
      <div className="flex justify-center p-10 h-full items-center">
        <Loader2 className="animate-spin text-blue-600 w-10 h-10" />
      </div>
    );

  return (
    <div
      className="flex-1 overflow-hidden m-2 rounded-xl bg-slate-50 border border-slate-200 shadow-sm flex flex-col"
      dir="rtl"
    >
      {/* ----------------- Header & Main Table ----------------- */}
      <div className="p-4 border-b border-slate-200 bg-white shrink-0 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center shadow-inner">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base text-slate-800 font-black">
              مخططات الرياض المعتمدة
            </h2>
            <p className="text-[11px] text-slate-500 font-bold mt-0.5">
              إدارة تفاصيل المخططات، الشوارع، والإحصائيات الخاصة بها
            </p>
          </div>
          <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black ml-2 border border-slate-200">
            {plansData.length} مخطط مسجل
          </span>
        </div>

        <button
          onClick={() =>
            setPlanModal({
              isOpen: true,
              mode: "create",
              activeTab: "general",
              data: {
                id: null,
                planNumber: "",
                hijriYear: "",
                areaKm: "",
                areaM: "",
                streets: [],
                files: [],
                specialRegulations: [],
                notes: "",
                status: "معتمد",
              },
            })
          }
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-black hover:bg-indigo-700 shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" /> تسجيل مخطط جديد
        </button>
      </div>

      {/* Main Table Content */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <div className="border border-slate-200 bg-white rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-sm text-right">
            <thead className="bg-slate-800 text-white font-bold text-xs">
              <tr>
                <th className="py-4 px-5">رقم المخطط</th>
                <th className="py-4 px-5">سنة الاعتماد</th>
                <th className="py-4 px-5">المساحة ($م^2$)</th>
                <th className="py-4 px-5 text-center">القطع</th>
                <th className="py-4 px-5 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(plansData || []).map((plan) => (
                <tr
                  key={plan.id}
                  onClick={() =>
                    setPlanModal({
                      isOpen: true,
                      mode: "edit",
                      activeTab: "general",
                      data: plan,
                    })
                  }
                  className="hover:bg-indigo-50/50 transition-colors cursor-pointer group"
                >
                  <td className="py-3.5 px-5 font-black text-indigo-700">
                    {plan.planNumber}
                  </td>
                  <td className="py-3.5 px-5 text-slate-600 font-bold">
                    {plan.hijriYear || "---"}
                  </td>
                  <td className="py-3.5 px-5 font-mono font-bold text-slate-600">
                    {plan.areaM ? Number(plan.areaM).toLocaleString() : "---"}
                  </td>
                  <td className="py-3.5 px-5 text-center font-black text-slate-700">
                    {plan.totalPlots || 0}
                  </td>
                  <td className="py-3.5 px-5 flex justify-center gap-2">
                    {/* أزرار الإجراءات ظاهرة دائماً بتصميم احترافي */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPlanModal({
                          isOpen: true,
                          mode: "edit",
                          activeTab: "general",
                          data: plan,
                        });
                      }}
                      className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition-all shadow-sm"
                      title="تعديل المخطط"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(e, plan.id)}
                      className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-all shadow-sm"
                      title="حذف المخطط"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {plansData.length === 0 && (
                <tr>
                  <td
                    colSpan="5"
                    className="text-center py-16 text-slate-400 font-bold bg-slate-50"
                  >
                    لا توجد مخططات مسجلة حالياً
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ----------------- Wide Modal ----------------- */}
      {planModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 lg:p-6 animate-in fade-in">
          <div className="bg-slate-50 rounded-3xl w-full max-w-7xl h-[95vh] shadow-2xl flex flex-col overflow-hidden ring-1 ring-white/20 animate-in zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 bg-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-inner">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-800 text-lg tracking-tight">
                    {planModal.mode === "create"
                      ? "إضافة مخطط جديد"
                      : `تعديل المخطط: ${planModal.data.planNumber}`}
                  </h3>
                  <p className="text-[11px] font-bold text-slate-500 mt-0.5">
                    سجل بيانات المخطط التنظيمية والمكانية
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPlanModal({ ...planModal, isOpen: false })}
                className="p-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body (Sidebar + Content) */}
            <div className="flex-1 flex overflow-hidden">
              {/* Right Sidebar (Tabs) */}
              <div className="w-64 bg-white border-l border-slate-200 p-4 flex flex-col gap-1.5 shrink-0 overflow-y-auto custom-scrollbar-slim">
                {MODAL_TABS.map((tab) => {
                  const isActive = planModal.activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() =>
                        setPlanModal((prev) => ({ ...prev, activeTab: tab.id }))
                      }
                      className={`flex items-center gap-3 w-full p-3.5 rounded-xl text-sm font-bold transition-all relative overflow-hidden ${
                        isActive
                          ? "bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100"
                          : "text-slate-600 hover:bg-slate-50 border border-transparent"
                      }`}
                    >
                      {isActive && (
                        <div className="absolute right-0 top-2 bottom-2 w-1 bg-indigo-600 rounded-l-full"></div>
                      )}
                      <tab.icon
                        className={`w-4 h-4 ${isActive ? "text-indigo-600" : "text-slate-400"}`}
                      />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Left Content Area */}
              <div className="flex-1 flex p-5 flex-col overflow-hidden bg-slate-50">
                <form
                  id="planComplexForm"
                  onSubmit={handleSubmit}
                  className="flex-1 flex flex-col overflow-hidden bg-white border border-slate-200 rounded-2xl shadow-sm"
                >
                  {/* === Tab 1: General Info === */}
                  {planModal.activeTab === "general" && (
                    <div className="flex-1 overflow-y-auto p-6 space-y-8 animate-in fade-in custom-scrollbar">
                      {/* Basic Codes */}
                      <section>
                        <h4 className="text-sm font-black text-slate-800 mb-4 flex items-center gap-2">
                          <span className="w-1.5 h-4 bg-indigo-500 rounded-full"></span>{" "}
                          الأرقام المرجعية
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-2">
                              رقم المخطط{" "}
                              <span className="text-rose-500">*</span>
                            </label>
                            <input
                              required
                              value={planModal.data.planNumber || ""}
                              onChange={(e) =>
                                setPlanModal((p) => ({
                                  ...p,
                                  data: {
                                    ...p.data,
                                    planNumber: e.target.value,
                                  },
                                }))
                              }
                              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-2">
                              الرقم السابق (اختياري)
                            </label>
                            <input
                              value={planModal.data.oldNumber || ""}
                              onChange={(e) =>
                                setPlanModal((p) => ({
                                  ...p,
                                  data: {
                                    ...p.data,
                                    oldNumber: e.target.value,
                                  },
                                }))
                              }
                              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-2">
                              سنة الاعتماد (هجري)
                            </label>
                            <input
                              type="number"
                              placeholder="مثال: 1440"
                              value={planModal.data.hijriYear || ""}
                              onChange={(e) =>
                                setPlanModal((p) => ({
                                  ...p,
                                  data: {
                                    ...p.data,
                                    hijriYear: e.target.value,
                                  },
                                }))
                              }
                              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
                            />
                          </div>
                        </div>
                      </section>

                      <hr className="border-slate-100" />

                      {/* Area & Usages */}
                      <section>
                        <h4 className="text-sm font-black text-slate-800 mb-4 flex items-center gap-2">
                          <span className="w-1.5 h-4 bg-emerald-500 rounded-full"></span>{" "}
                          المساحة والاستخدامات
                        </h4>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                          <div className="space-y-5">
                            <div className="flex gap-3 items-end">
                              <div className="flex-1">
                                <label className="block text-xs font-bold text-slate-700 mb-2">
                                  المساحة ($كم^2$)
                                </label>
                                <input
                                  type="number"
                                  step="any"
                                  value={planModal.data.areaKm || ""}
                                  onChange={(e) =>
                                    handleAreaKmChange(e.target.value)
                                  }
                                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                                />
                              </div>
                              <div className="text-slate-300 mb-3">
                                <Link2 className="w-5 h-5" />
                              </div>
                              <div className="flex-1">
                                <label className="block text-xs font-bold text-slate-700 mb-2">
                                  المساحة ($م^2$)
                                </label>
                                <input
                                  type="number"
                                  step="any"
                                  value={planModal.data.areaM || ""}
                                  onChange={(e) =>
                                    handleAreaMChange(e.target.value)
                                  }
                                  className="w-full px-4 py-2.5 bg-emerald-50/50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-mono font-bold outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-2">
                                إجمالي عدد القطع
                              </label>
                              <input
                                type="number"
                                value={planModal.data.totalPlots || ""}
                                onChange={(e) =>
                                  setPlanModal((p) => ({
                                    ...p,
                                    data: {
                                      ...p.data,
                                      totalPlots: e.target.value,
                                    },
                                  }))
                                }
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                              />
                            </div>
                          </div>
                          <div className="space-y-5">
                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-2">
                                الاستخدام الرئيسي (افصل بفاصلة)
                              </label>
                              <input
                                placeholder="سكني، تجاري..."
                                value={planModal.data.mainUsages || ""}
                                onChange={(e) =>
                                  setPlanModal((p) => ({
                                    ...p,
                                    data: {
                                      ...p.data,
                                      mainUsages: e.target.value,
                                    },
                                  }))
                                }
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-2">
                                الاستخدامات الفرعية (افصل بفاصلة)
                              </label>
                              <input
                                placeholder="مرافق تعليمية، مساجد..."
                                value={planModal.data.subUsages || ""}
                                onChange={(e) =>
                                  setPlanModal((p) => ({
                                    ...p,
                                    data: {
                                      ...p.data,
                                      subUsages: e.target.value,
                                    },
                                  }))
                                }
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                              />
                            </div>
                          </div>
                        </div>
                      </section>

                      <hr className="border-slate-100" />

                      {/* Neighborhoods & Streets */}
                      <section>
                        <h4 className="text-sm font-black text-slate-800 mb-4 flex items-center gap-2">
                          <span className="w-1.5 h-4 bg-orange-500 rounded-full"></span>{" "}
                          الأحياء والشوارع
                        </h4>
                        <div className="mb-5">
                          <label className="block text-xs font-bold text-slate-700 mb-2">
                            الأحياء التابع لها (أسماء الأحياء)
                          </label>
                          <input
                            placeholder="أدخل أسماء الأحياء مفصولة بفاصلة..."
                            value={planModal.data.neighborhoods || ""}
                            onChange={(e) =>
                              setPlanModal((p) => ({
                                ...p,
                                data: {
                                  ...p.data,
                                  neighborhoods: e.target.value,
                                },
                              }))
                            }
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all"
                          />
                        </div>

                        <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                          <div className="bg-slate-100 px-5 py-3 flex justify-between items-center border-b border-slate-200">
                            <span className="text-xs font-black text-slate-800">
                              شوارع المخطط (
                              {(planModal.data.streets || []).length})
                            </span>
                            <button
                              type="button"
                              onClick={addStreetToPlan}
                              className="text-xs bg-white border border-slate-300 px-3 py-1.5 rounded-lg shadow-sm font-bold flex items-center gap-1.5 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 transition-all"
                            >
                              <Plus className="w-3.5 h-3.5" /> إضافة شارع
                            </button>
                          </div>
                          <div className="p-4 bg-slate-50/50 space-y-3">
                            {(planModal.data.streets || []).map(
                              (street, idx) => (
                                <div
                                  key={street.id}
                                  className="flex flex-wrap md:flex-nowrap gap-3 items-start bg-white p-3 rounded-xl border border-slate-200 shadow-sm transition-all hover:border-slate-300"
                                >
                                  <div className="flex-1 min-w-[150px]">
                                    <input
                                      placeholder="اسم الشارع"
                                      value={street.name || ""}
                                      onChange={(e) => {
                                        const newS = [
                                          ...(planModal.data.streets || []),
                                        ];
                                        newS[idx].name = e.target.value;
                                        setPlanModal((p) => ({
                                          ...p,
                                          data: { ...p.data, streets: newS },
                                        }));
                                      }}
                                      className="w-full px-3 py-2 text-xs font-bold border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                                    />
                                  </div>
                                  <div className="w-24 shrink-0">
                                    <input
                                      type="number"
                                      placeholder="العرض"
                                      value={street.width || ""}
                                      onChange={(e) => {
                                        const newS = [
                                          ...(planModal.data.streets || []),
                                        ];
                                        newS[idx].width = e.target.value;
                                        setPlanModal((p) => ({
                                          ...p,
                                          data: { ...p.data, streets: newS },
                                        }));
                                      }}
                                      className="w-full px-3 py-2 text-xs font-mono font-bold border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                                    />
                                  </div>
                                  <div className="flex flex-col gap-2 w-full md:w-1/3">
                                    <label className="flex items-center gap-2 text-[11px] font-bold cursor-pointer text-slate-700">
                                      <input
                                        type="checkbox"
                                        checked={street.hasSpecialReg || false}
                                        onChange={(e) => {
                                          const newS = [
                                            ...(planModal.data.streets || []),
                                          ];
                                          newS[idx].hasSpecialReg =
                                            e.target.checked;
                                          setPlanModal((p) => ({
                                            ...p,
                                            data: { ...p.data, streets: newS },
                                          }));
                                        }}
                                        className="rounded border-slate-300 text-orange-600 focus:ring-orange-500 w-4 h-4"
                                      />{" "}
                                      التنظيم خاص؟
                                    </label>
                                    {street.hasSpecialReg && (
                                      <input
                                        placeholder="اكتب وصف التنظيم..."
                                        value={street.regDesc || ""}
                                        onChange={(e) => {
                                          const newS = [
                                            ...(planModal.data.streets || []),
                                          ];
                                          newS[idx].regDesc = e.target.value;
                                          setPlanModal((p) => ({
                                            ...p,
                                            data: { ...p.data, streets: newS },
                                          }));
                                        }}
                                        className="w-full px-3 py-2 text-[11px] font-bold border border-orange-200 rounded-lg bg-orange-50/50 outline-none focus:ring-2 focus:ring-orange-500"
                                      />
                                    )}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newS = (
                                        planModal.data.streets || []
                                      ).filter((_, i) => i !== idx);
                                      setPlanModal((p) => ({
                                        ...p,
                                        data: { ...p.data, streets: newS },
                                      }));
                                    }}
                                    className="mt-1 p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              ),
                            )}
                            {(planModal.data.streets || []).length === 0 && (
                              <div className="text-center py-6 text-slate-400">
                                <Route className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                <p className="text-xs font-bold">
                                  لا توجد شوارع مضافة حالياً.
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </section>

                      <hr className="border-slate-100" />

                      {/* Maps & QR */}
                      <section>
                        <h4 className="text-sm font-black text-slate-800 mb-4 flex items-center gap-2">
                          <span className="w-1.5 h-4 bg-cyan-500 rounded-full"></span>{" "}
                          الخرائط والمواقع
                        </h4>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* البوابة الرسمية */}
                          <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl shadow-sm">
                            <label className="block text-xs font-black text-cyan-800 mb-3 flex items-center gap-1.5">
                              <Landmark className="w-4 h-4" /> الخريطة الرسمية
                              (الأمانة)
                            </label>
                            <input
                              type="url"
                              dir="ltr"
                              placeholder="URL..."
                              value={planModal.data.officialMapUrl || ""}
                              onChange={(e) =>
                                setPlanModal((p) => ({
                                  ...p,
                                  data: {
                                    ...p.data,
                                    officialMapUrl: e.target.value,
                                  },
                                }))
                              }
                              className="w-full px-4 py-2 text-xs font-mono font-bold border border-slate-200 rounded-xl mb-4 outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white transition-all"
                            />
                            <div className="flex gap-4">
                              <div
                                className={`flex-1 h-36 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer relative overflow-hidden group transition-all
                                  ${isDraggingOfficial ? "border-cyan-500 bg-cyan-50" : "border-slate-300 bg-white hover:border-cyan-400 hover:bg-slate-50"}`}
                                onPaste={(e) =>
                                  handlePasteEvent(e, "officialMapImage")
                                }
                                onDragOver={(e) => {
                                  e.preventDefault();
                                  setIsDraggingOfficial(true);
                                }}
                                onDragLeave={() => setIsDraggingOfficial(false)}
                                onDrop={(e) => {
                                  e.preventDefault();
                                  setIsDraggingOfficial(false);
                                  processFilesList(
                                    e.dataTransfer.files,
                                    "officialMapImage",
                                  );
                                }}
                              >
                                <input
                                  key={fileInputKey}
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) =>
                                    handleFileInputChange(e, "officialMapImage")
                                  }
                                  className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
                                />
                                {planModal.data.officialMapImage ? (
                                  <img
                                    src={planModal.data.officialMapImage}
                                    className="w-full h-full object-cover"
                                    alt="Official Map"
                                  />
                                ) : (
                                  <>
                                    <UploadCloud
                                      className={`w-8 h-8 mb-2 ${isDraggingOfficial ? "text-cyan-500" : "text-slate-300 group-hover:text-cyan-400"}`}
                                    />
                                    <span className="text-[10px] font-bold text-slate-500 text-center px-4 leading-relaxed">
                                      اسحب وأفلت الصورة هنا <br /> أو{" "}
                                      <span className="text-cyan-600">
                                        اضغط للرفع
                                      </span>{" "}
                                      <br /> أو الصق (Ctrl+V)
                                    </span>
                                  </>
                                )}
                              </div>
                              <div className="w-28 h-28 bg-white border border-slate-200 rounded-xl flex items-center justify-center p-2 self-end shrink-0 shadow-sm">
                                {planModal.data.officialMapUrl ? (
                                  <QRCodeSVG
                                    value={planModal.data.officialMapUrl}
                                    size={90}
                                  />
                                ) : (
                                  <span className="text-[9px] font-bold text-slate-300 text-center px-2">
                                    أدخل الرابط لتوليد QR
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* جوجل ماب */}
                          <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl shadow-sm">
                            <label className="block text-xs font-black text-emerald-800 mb-3 flex items-center gap-1.5">
                              <Map className="w-4 h-4" /> خرائط جوجل (Google
                              Maps)
                            </label>
                            <input
                              type="url"
                              dir="ltr"
                              placeholder="URL..."
                              value={planModal.data.googleMapUrl || ""}
                              onChange={(e) =>
                                setPlanModal((p) => ({
                                  ...p,
                                  data: {
                                    ...p.data,
                                    googleMapUrl: e.target.value,
                                  },
                                }))
                              }
                              className="w-full px-4 py-2 text-xs font-mono font-bold border border-slate-200 rounded-xl mb-4 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                            />
                            <div className="flex gap-4">
                              <div
                                className={`flex-1 h-36 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer relative overflow-hidden group transition-all
                                  ${isDraggingGoogle ? "border-emerald-500 bg-emerald-50" : "border-slate-300 bg-white hover:border-emerald-400 hover:bg-slate-50"}`}
                                onPaste={(e) =>
                                  handlePasteEvent(e, "googleMapImage")
                                }
                                onDragOver={(e) => {
                                  e.preventDefault();
                                  setIsDraggingGoogle(true);
                                }}
                                onDragLeave={() => setIsDraggingGoogle(false)}
                                onDrop={(e) => {
                                  e.preventDefault();
                                  setIsDraggingGoogle(false);
                                  processFilesList(
                                    e.dataTransfer.files,
                                    "googleMapImage",
                                  );
                                }}
                              >
                                <input
                                  key={fileInputKey + 1}
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) =>
                                    handleFileInputChange(e, "googleMapImage")
                                  }
                                  className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
                                />
                                {planModal.data.googleMapImage ? (
                                  <img
                                    src={planModal.data.googleMapImage}
                                    className="w-full h-full object-cover"
                                    alt="Google Map"
                                  />
                                ) : (
                                  <>
                                    <UploadCloud
                                      className={`w-8 h-8 mb-2 ${isDraggingGoogle ? "text-emerald-500" : "text-slate-300 group-hover:text-emerald-400"}`}
                                    />
                                    <span className="text-[10px] font-bold text-slate-500 text-center px-4 leading-relaxed">
                                      اسحب وأفلت الصورة هنا <br /> أو{" "}
                                      <span className="text-emerald-600">
                                        اضغط للرفع
                                      </span>{" "}
                                      <br /> أو الصق (Ctrl+V)
                                    </span>
                                  </>
                                )}
                              </div>
                              <div className="w-28 h-28 bg-white border border-slate-200 rounded-xl flex items-center justify-center p-2 self-end shrink-0 shadow-sm">
                                {planModal.data.googleMapUrl ? (
                                  <QRCodeSVG
                                    value={planModal.data.googleMapUrl}
                                    size={90}
                                  />
                                ) : (
                                  <span className="text-[9px] font-bold text-slate-300 text-center px-2">
                                    أدخل الرابط لتوليد QR
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </section>
                    </div>
                  )}

                  {/* === Tab 2: Stats === */}
                  {planModal.activeTab === "stats" && (
                    <StatsTab planNumber={planModal.data.planNumber} />
                  )}

                  {/* === Tab 3: Plots === */}
                  {planModal.activeTab === "plots_details" && (
                    <PlotsDetailsTab
                      planId={planModal.data.id}
                      setArchiveModal={setArchiveModal}
                      setClientModal={setClientModal}
                    />
                  )}

                  {/* === Tab 4: Files === */}
                  {planModal.activeTab === "files" && (
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 animate-in fade-in custom-scrollbar">
                      <div className="flex justify-between items-end border-b border-slate-200 pb-4">
                        <div>
                          <h4 className="text-sm font-black text-slate-800">
                            ملفات المخطط والمرفقات الهندسية
                          </h4>
                          <p className="text-xs font-bold text-slate-500 mt-1">
                            يدعم الصور وملفات الأوتوكاد (DWG) والـ PDF
                          </p>
                        </div>
                        <div className="relative">
                          <button
                            type="button"
                            className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-black flex items-center gap-2 hover:bg-blue-700 shadow-md transition-all active:scale-95 pointer-events-none"
                          >
                            <FileUp className="w-4 h-4" /> إضافة ملفات
                          </button>
                          <input
                            key={fileInputKey + 2}
                            type="file"
                            multiple
                            accept=".jpg,.png,.tiff,.dwg,.pdf"
                            onChange={(e) =>
                              handleFileInputChange(e, "planFiles")
                            }
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                        </div>
                      </div>

                      {/* منطقة سحب وإفلات الملفات */}
                      <div
                        className={`w-full py-10 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all relative
                          ${isDraggingFiles ? "border-blue-500 bg-blue-50" : "border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-slate-50/80"}`}
                        onDragOver={(e) => {
                          e.preventDefault();
                          setIsDraggingFiles(true);
                        }}
                        onDragLeave={() => setIsDraggingFiles(false)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setIsDraggingFiles(false);
                          processFilesList(e.dataTransfer.files, "planFiles");
                        }}
                        onPaste={(e) => handlePasteEvent(e, "planFiles")}
                      >
                        <input
                          key={fileInputKey + 3}
                          type="file"
                          multiple
                          accept=".jpg,.png,.tiff,.dwg,.pdf"
                          onChange={(e) =>
                            handleFileInputChange(e, "planFiles")
                          }
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <UploadCloud
                          className={`w-12 h-12 mb-3 ${isDraggingFiles ? "text-blue-500" : "text-slate-300"}`}
                        />
                        <span className="text-sm font-black text-slate-600 mb-1">
                          اسحب وأفلت الملفات هنا
                        </span>
                        <span className="text-xs font-bold text-slate-400">
                          أو الصق الملفات المنسوخة (Ctrl+V)
                        </span>
                      </div>

                      <div className="space-y-3">
                        {(planModal.data.files || []).map((file) => (
                          <div
                            key={file.id}
                            className="flex gap-4 p-4 bg-white border border-slate-200 rounded-xl items-start shadow-sm transition-all hover:border-blue-200"
                          >
                            <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-xl flex flex-col items-center justify-center shrink-0 shadow-inner">
                              {/* 🚀 استدعاء الأيقونة الذكية */}
                              {getFileIcon(file.type)}
                              <span className="text-[9px] font-black text-slate-600">
                                {file.type || "FILE"}
                              </span>
                            </div>
                            <div className="flex-1 space-y-2.5">
                              <div
                                className="text-xs font-black text-slate-800 truncate"
                                dir="ltr"
                              >
                                {file.name}
                              </div>
                              <input
                                type="text"
                                placeholder="أضف وصفاً لهذا الملف..."
                                value={file.desc || ""}
                                onChange={(e) => {
                                  const nF = [...(planModal.data.files || [])];
                                  const idx = nF.findIndex(
                                    (f) => f.id === file.id,
                                  );
                                  if (idx !== -1) {
                                    nF[idx].desc = e.target.value;
                                    setPlanModal((p) => ({
                                      ...p,
                                      data: { ...p.data, files: nF },
                                    }));
                                  }
                                }}
                                className="w-full px-3 py-2 text-xs font-bold border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-slate-50 focus:bg-white transition-all"
                              />
                            </div>

                            {/* 🚀 أزرار الإجراءات */}
                            <div className="flex gap-1.5 shrink-0">
                              {/* زر المعاينة (يفتح المودال) */}
                              <button
                                type="button"
                                onClick={() =>
                                  setPreviewFile({
                                    url: getFullUrl(file.url),
                                    type: file.type,
                                    name: file.name,
                                  })
                                }
                                className="p-2 text-cyan-600 bg-cyan-50 hover:bg-cyan-600 hover:text-white rounded-lg flex justify-center transition-colors"
                                title="معاينة الملف"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              {/* زر التحميل */}
                              <a
                                href={getFullUrl(file.url)} // 👈 استخدام getFullUrl هنا
                                download={file.name}
                                target="_blank"
                                rel="noreferrer"
                                className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white rounded-lg flex justify-center transition-colors"
                                title="تنزيل الملف"
                              >
                                <Download className="w-4 h-4" />
                              </a>

                              {/* زر الحذف */}
                              <button
                                type="button"
                                onClick={() =>
                                  setPlanModal((p) => ({
                                    ...p,
                                    data: {
                                      ...p.data,
                                      files: (p.data.files || []).filter(
                                        (f) => f.id !== file.id,
                                      ),
                                    },
                                  }))
                                }
                                className="p-2 text-rose-600 bg-rose-50 hover:bg-rose-600 hover:text-white rounded-lg flex justify-center transition-colors"
                                title="حذف"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* === Tab 5: Special Regulations === */}
                  {planModal.activeTab === "special_reg" && (
                    <div className="space-y-6 animate-in fade-in h-full flex flex-col overflow-hidden p-6">
                      <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
                        <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center shadow-inner">
                          <ShieldAlert className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-slate-800">
                            التنظيمات الخاصة والاستثناءات
                          </h4>
                          <p className="text-xs font-bold text-slate-500 mt-0.5">
                            سجل هنا أي قرارات أو اشتراطات تخص هذا المخطط
                            بالتحديد.
                          </p>
                        </div>
                      </div>

                      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-inner">
                        <textarea
                          placeholder="اكتب نص التنظيم، القرار، أو التعليق هنا..."
                          value={newReg.text || ""}
                          onChange={(e) =>
                            setNewReg((prev) => ({
                              ...prev,
                              text: e.target.value,
                            }))
                          }
                          className="w-full bg-white border border-slate-200 rounded-xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-purple-500 min-h-[100px] resize-none transition-all shadow-sm"
                        />

                        {(newReg.files || []).length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {newReg.files.map((f, i) => (
                              <div
                                key={i}
                                className="bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 flex items-center gap-2 shadow-sm"
                              >
                                <span
                                  className="truncate max-w-[120px]"
                                  dir="ltr"
                                >
                                  {f.name}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setNewReg((p) => ({
                                      ...p,
                                      files: (p.files || []).filter(
                                        (file) => file.id !== f.id,
                                      ),
                                    }))
                                  }
                                  className="text-slate-400 hover:text-rose-500"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-200/50">
                          <div className="relative">
                            <button
                              type="button"
                              className="flex items-center gap-2 text-xs font-black text-purple-700 bg-purple-100 hover:bg-purple-200 px-4 py-2 rounded-xl transition-colors pointer-events-none"
                            >
                              <Paperclip size={16} /> إرفاق ملفات داعمة
                            </button>
                            <input
                              key={fileInputKey + 4}
                              type="file"
                              multiple
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              onChange={(e) =>
                                handleFileInputChange(e, "regFiles")
                              }
                            />
                          </div>
                          <button
                            type="button"
                            onClick={handleAddRegulation}
                            disabled={
                              !newReg.text.trim() &&
                              (newReg.files || []).length === 0
                            }
                            className="px-6 py-2.5 bg-purple-600 text-white text-xs font-black rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:bg-slate-300 shadow-md transition-all active:scale-95"
                          >
                            حفظ التنظيم في السجل
                          </button>
                        </div>
                      </div>

                      <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                        {(planModal.data.specialRegulations || []).map(
                          (reg) => (
                            <div
                              key={reg.id}
                              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm relative group hover:border-purple-200 transition-colors"
                            >
                              <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 shadow-inner">
                                    <User size={16} />
                                  </div>
                                  <div>
                                    <div className="text-xs font-black text-slate-800">
                                      {reg.authorName}
                                    </div>
                                    <div className="text-[10px] text-slate-400 font-mono font-bold flex items-center gap-1 mt-0.5">
                                      <Clock size={10} />{" "}
                                      {new Date(reg.createdAt).toLocaleString(
                                        "ar-SA",
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (window.confirm("حذف هذا التنظيم؟"))
                                      setPlanModal((p) => ({
                                        ...p,
                                        data: {
                                          ...p.data,
                                          specialRegulations: (
                                            p.data.specialRegulations || []
                                          ).filter((r) => r.id !== reg.id),
                                        },
                                      }));
                                  }}
                                  className="text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg p-1.5 opacity-0 group-hover:opacity-100 transition-all"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                              {reg.text && (
                                <p className="text-sm font-bold text-slate-700 leading-loose whitespace-pre-wrap border-r-2 border-purple-300 pr-4">
                                  {reg.text}
                                </p>
                              )}
                              {reg.files && reg.files.length > 0 && (
                                <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap gap-2">
                                  {reg.files.map((file, i) => (
                                    <a
                                      key={i}
                                      href={file.url}
                                      download={file.name}
                                      className="flex items-center gap-2 bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-200 px-3 py-2 rounded-xl transition-colors group/file"
                                    >
                                      <FolderOpen
                                        size={14}
                                        className="text-slate-400 group-hover/file:text-purple-500"
                                      />
                                      <span
                                        className="text-[11px] font-black text-slate-600 truncate max-w-[150px]"
                                        dir="ltr"
                                      >
                                        {file.name}
                                      </span>
                                      <Download
                                        size={14}
                                        className="text-slate-400"
                                      />
                                    </a>
                                  ))}
                                </div>
                              )}
                            </div>
                          ),
                        )}
                        {(planModal.data.specialRegulations || []).length ===
                          0 && (
                          <div className="text-center py-16 text-slate-400 flex flex-col items-center">
                            <ShieldAlert className="w-12 h-12 mb-3 opacity-20" />
                            <span className="text-xs font-bold">
                              لا توجد تنظيمات خاصة مسجلة لهذا المخطط حتى الآن.
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* === Tab 6: Notes === */}
                  {planModal.activeTab === "notes" && (
                    <div className="space-y-6 animate-in fade-in h-full flex flex-col overflow-hidden p-6">
                      <div className="flex items-center gap-2 border-b border-slate-200 pb-4">
                        <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
                        <h4 className="text-base font-black text-slate-800">
                          الملاحظات العامة والقيود الفنية
                        </h4>
                      </div>
                      <div className="flex-1 relative group">
                        <textarea
                          placeholder="اكتب هنا أية ملاحظات تنظيمية، قيود فنية، أو تنبيهات إدارية تخص هذا المخطط..."
                          value={planModal.data.notes || ""}
                          onChange={(e) =>
                            setPlanModal((p) => ({
                              ...p,
                              data: { ...p.data, notes: e.target.value },
                            }))
                          }
                          className="w-full h-full min-h-[400px] p-6 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 focus:bg-white text-sm font-bold text-slate-700 leading-loose resize-none transition-all duration-300 shadow-inner"
                        />
                        <div className="absolute bottom-6 left-6 pointer-events-none opacity-10">
                          <FileText size={60} className="text-slate-500" />
                        </div>
                      </div>
                      <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200 flex items-start gap-3 shadow-sm">
                        <Info size={20} className="text-amber-500 shrink-0" />
                        <p className="text-xs font-black text-amber-800 leading-relaxed">
                          تنبيه: هذه الملاحظات تظهر لجميع الإدارات المرتبطة بهذا
                          المخطط، يرجى تحري الدقة عند تدوين القيود الفنية.
                        </p>
                      </div>
                    </div>
                  )}

                  <button type="submit" className="hidden">
                    Submit
                  </button>
                </form>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-slate-200 bg-white flex gap-4 shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20">
              <button
                type="button"
                onClick={() =>
                  setPlanModal((prev) => ({ ...prev, isOpen: false }))
                }
                className="px-8 py-3 bg-slate-100 text-slate-700 font-black rounded-xl w-40 hover:bg-slate-200 transition-colors"
              >
                إغلاق
              </button>
              <button
                onClick={() =>
                  document.getElementById("planComplexForm").requestSubmit()
                }
                disabled={planMutation.isPending}
                className="flex-1 px-8 py-3 bg-indigo-600 text-white font-black rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-700 shadow-xl shadow-indigo-600/20 transition-all active:scale-95 disabled:opacity-70"
              >
                {planMutation.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" /> حفظ جميع بيانات المخطط
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- Modal معاينة الملفات ----------------- */}
      {previewFile && (
        <div
          className="fixed inset-0 z-[200] bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4 lg:p-8 animate-in fade-in"
          dir="rtl"
        >
          <div className="bg-white w-full max-w-5xl h-[90vh] rounded-3xl flex flex-col overflow-hidden shadow-2xl ring-1 ring-white/10 animate-in zoom-in-95 duration-300">
            {/* Header المعاينة */}
            <div className="px-6 py-4 bg-slate-800 flex justify-between items-center shrink-0 shadow-md z-10">
              <div className="flex items-center gap-3 text-white">
                <div className="p-2.5 bg-slate-700 rounded-xl shadow-inner">
                  {getFileIcon(previewFile.type)}
                </div>
                <div>
                  <h3 className="font-bold text-sm line-clamp-1" dir="ltr">
                    {previewFile.name}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                    معاينة مباشرة (Preview)
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href={previewFile.url}
                  download={previewFile.name}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black transition-all flex items-center gap-2 shadow-lg shadow-blue-900/50"
                >
                  <Download className="w-4 h-4" /> تنزيل
                </a>
                <button
                  onClick={() => setPreviewFile(null)}
                  className="p-2.5 bg-slate-700 hover:bg-rose-500 text-white rounded-xl transition-all"
                  title="إغلاق المعاينة"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content المعاينة */}
            <div className="flex-1 bg-slate-100 relative overflow-hidden flex justify-center items-center p-4 md:p-8 custom-scrollbar">
              {["pdf"].includes(previewFile.type?.toLowerCase()) ? (
                // عرض ملفات PDF
                <iframe
                  src={previewFile.url}
                  className="w-full h-full rounded-2xl shadow-sm bg-white border border-slate-200"
                  title={previewFile.name}
                />
              ) : ["jpg", "jpeg", "png", "webp", "gif"].includes(
                  previewFile.type?.toLowerCase(),
                ) ? (
                // عرض الصور
                <img
                  src={previewFile.url}
                  alt={previewFile.name}
                  className="max-w-full max-h-full object-contain rounded-2xl shadow-sm border border-slate-200 bg-white p-2"
                />
              ) : (
                // إذا كان الملف لا يدعم المعاينة المباشرة (مثل DWG)
                <div className="text-center text-slate-500 bg-white p-10 rounded-3xl shadow-sm border border-slate-200 max-w-sm">
                  <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    {getFileIcon(previewFile.type)}
                  </div>
                  <h3 className="font-black text-slate-800 text-lg mb-2">
                    المعاينة غير متاحة
                  </h3>
                  <p className="text-xs font-bold leading-relaxed mb-6">
                    المتصفح لا يدعم المعاينة المباشرة لملفات الأوتوكاد أو هذا
                    النوع من الملفات ({previewFile.type}).
                  </p>
                  <a
                    href={previewFile.url}
                    download={previewFile.name}
                    className="inline-flex px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-black hover:bg-blue-700 transition-all shadow-md items-center gap-2"
                  >
                    <Download className="w-4 h-4" /> تنزيل الملف للعرض
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* المودالز الفرعية */}
      {archiveModal.isOpen && archiveModal.projectId && (
        <ReferenceDetailsModal
          projectId={archiveModal.projectId}
          isOpen={archiveModal.isOpen}
          onClose={() => setArchiveModal({ isOpen: false, projectId: null })}
        />
      )}
      {clientModal.isOpen && clientModal.clientId && (
        <ClientFileDetails
          clientId={clientModal.clientId}
          isOpen={clientModal.isOpen}
          onClose={() => setClientModal({ isOpen: false, clientId: null })}
        />
      )}
    </div>
  );
};

export default PlansTab;
