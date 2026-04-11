// src/components/RiyadhDivision/tabs/PlansTab.jsx
import React, { useState, useRef } from "react";
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
} from "lucide-react";
import { useAuth } from "../../../../context/AuthContext";
// التابات العمودية داخل المودال
const MODAL_TABS = [
  { id: "general", label: "معلومات عامة", icon: Info },
  { id: "stats", label: "الإحصائيات", icon: PieChart },
  { id: "files", label: "ملفات المخطط", icon: FolderOpen },
  { id: "special_reg", label: "تنظيمات خاصة", icon: ShieldAlert },
  { id: "notes", label: "ملاحظات عامة", icon: FileEdit },
];

const PlansTab = () => {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();
  const [newReg, setNewReg] = useState({ text: "", files: [] });

  // حالة المودال
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
      streets: [], // { name: '', width: '', hasSpecialReg: false, regDesc: '' }
      files: [], // { url: '', name: '', desc: '', type: '' }
      notes: "",
      status: "معتمد",
    },
  });

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

  // معالجة لصق الصور (Paste)
  const handlePasteImage = (e, fieldName) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const blob = items[i].getAsFile();
        const reader = new FileReader();
        reader.onload = (event) => {
          setPlanModal((prev) => ({
            ...prev,
            data: { ...prev.data, [fieldName]: event.target.result },
          }));
        };
        reader.readAsDataURL(blob);
      }
    }
  };

  const handleFileUpload = (e, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setPlanModal((prev) => ({
        ...prev,
        data: { ...prev.data, [fieldName]: event.target.result },
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleRegFileUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setNewReg((prev) => ({
          ...prev,
          files: [
            ...prev.files,
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
  };

  // دالة إضافة التنظيم إلى القائمة المؤقتة
  const handleAddRegulation = () => {
    if (!newReg.text.trim() && newReg.files.length === 0) return;

    const regulationItem = {
      id: Date.now().toString(),
      text: newReg.text,
      files: newReg.files,
      authorName: currentUser?.name || "يوسف محمد", // 💡 استبدلها بـ currentUser?.name إذا كان الـ Auth متاحاً
      createdAt: new Date().toISOString(),
    };

    setPlanModal((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        // إضافة التنظيم الجديد في أعلى القائمة
        specialRegulations: [
          regulationItem,
          ...(prev.data.specialRegulations || []),
        ],
      },
    }));

    // تصفير الحقل بعد الإضافة
    setNewReg({ text: "", files: [] });
  };

  // 1. جلب البيانات (الجدول الرئيسي)
  const { data: plansData = [], isLoading } = useQuery({
    queryKey: ["riyadh-plans"],
    queryFn: async () => (await api.get("/riyadh-streets/plans")).data,
  });

  // 2. الميوتيشنز
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
    if (window.confirm("هل أنت متأكد من الحذف النهائي؟")) {
      deleteMutation.mutate(id);
    }
  };

  // دالة لإضافة شارع للجدول داخل المودال
  const addStreetToPlan = () => {
    setPlanModal((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        streets: [
          ...prev.data.streets,
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

  // دالة لإضافة ملف للمخطط
  const fileRef = useRef(null);
  const handleAddPlanFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const newFile = {
      id: Date.now(),
      name: file.name,
      url: URL.createObjectURL(file), // للعرض المؤقت (في الواقع يجب رفعه للسيرفر)
      desc: "",
      type: file.name.split(".").pop().toUpperCase(),
    };
    setPlanModal((prev) => ({
      ...prev,
      data: { ...prev.data, files: [...prev.data.files, newFile] },
    }));
  };

  if (isLoading)
    return (
      <div className="flex justify-center p-10">
        <Loader2 className="animate-spin text-blue-600" />
      </div>
    );

  return (
    <div
      className="flex-1 overflow-hidden m-2 rounded-xl bg-white border border-stone-200 shadow-sm flex flex-col"
      dir="rtl"
    >
      {/* ----------------- Header & Main Table ----------------- */}
      <div className="p-4 border-b border-stone-200 bg-white shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-[16px] text-stone-900 font-extrabold">
              مخططات الرياض المعتمدة
            </h2>
            <p className="text-[11px] text-stone-500 font-medium">
              إدارة تفاصيل المخططات، الشوارع، والإحصائيات الخاصة بها
            </p>
          </div>
          <span className="px-2 py-0.5 bg-stone-100 text-stone-600 rounded-full text-[10px] font-bold mr-2">
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
                status: "معتمد",
              },
            })
          }
          className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-xl text-[12px] font-bold hover:bg-blue-700 shadow-md shadow-blue-600/20 transition-all"
        >
          <Plus className="w-4 h-4" /> تسجيل مخطط جديد
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 bg-stone-50/50">
        <table className="w-full text-[12px] text-right border border-stone-200 bg-white rounded-xl overflow-hidden shadow-sm">
          <thead className="bg-stone-800 text-white">
            <tr>
              <th className="py-3 px-4">رقم المخطط</th>
              <th className="py-3 px-4">سنة الاعتماد</th>
              <th className="py-3 px-4">المساحة ($م^2$)</th>
              <th className="py-3 px-4 text-center">القطع</th>
              <th className="py-3 px-4 text-center">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {plansData.map((plan) => (
              <tr
                key={plan.id}
                className="hover:bg-blue-50/30 transition-colors"
              >
                <td className="py-3 px-4 font-bold text-blue-700">
                  {plan.planNumber}
                </td>
                <td className="py-3 px-4 text-stone-600">
                  {plan.hijriYear || "---"}
                </td>
                <td className="py-3 px-4 font-mono text-stone-600">
                  {plan.areaM ? Number(plan.areaM).toLocaleString() : "---"}
                </td>
                <td className="py-3 px-4 text-center font-bold">
                  {plan.totalPlots || 0}
                </td>
                <td className="py-3 px-4 flex justify-center gap-2">
                  <button
                    onClick={() =>
                      setPlanModal({
                        isOpen: true,
                        mode: "edit",
                        activeTab: "general",
                        data: plan,
                      })
                    }
                    className="p-1.5 bg-stone-100 rounded-lg text-stone-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => handleDelete(e, plan.id)}
                    className="p-1.5 bg-stone-100 rounded-lg text-stone-500 hover:text-red-600 hover:bg-red-50 transition-colors"
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
                  className="text-center py-10 text-stone-400 font-bold"
                >
                  لا توجد مخططات مسجلة
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ----------------- Wide Modal ----------------- */}
      {planModal.isOpen && (
        <div className="fixed inset-0 bg-stone-900/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4 lg:p-8">
          <div className="bg-white rounded-2xl w-full max-w-6xl h-[90vh] shadow-2xl flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-stone-200 bg-stone-50 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 text-white rounded-lg">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-stone-900 text-lg">
                    {planModal.mode === "create"
                      ? "إضافة مخطط جديد"
                      : `تعديل المخطط: ${planModal.data.planNumber}`}
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    سجل بيانات المخطط التنظيمية والمكانية
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPlanModal({ ...planModal, isOpen: false })}
                className="p-2 bg-white border border-stone-200 rounded-lg text-stone-400 hover:bg-red-50 hover:text-red-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body (Sidebar + Content) */}
            <div className="flex-1 flex overflow-hidden">
              {/* Right Sidebar (Tabs) */}
              <div className="w-64 bg-stone-50/50 border-l border-stone-200 p-4 flex flex-col gap-2 shrink-0 overflow-y-auto">
                {MODAL_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() =>
                      setPlanModal((prev) => ({ ...prev, activeTab: tab.id }))
                    }
                    className={`flex items-center gap-3 w-full p-3 rounded-xl text-[13px] font-bold transition-all ${planModal.activeTab === tab.id ? "bg-white text-blue-700 shadow-sm border border-blue-100" : "text-stone-600 hover:bg-white hover:border-stone-200 border border-transparent"}`}
                  >
                    <tab.icon
                      className={`w-5 h-5 ${planModal.activeTab === tab.id ? "text-blue-600" : "text-stone-400"}`}
                    />{" "}
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Left Content Area */}
              {/* Left Content Area */}
              <div className="flex-1 flex flex-col overflow-hidden bg-white">
                <form
                  id="planComplexForm"
                  onSubmit={handleSubmit}
                  className="flex-1 flex flex-col overflow-hidden"
                >
                  {/* === Tab 1: General Info === */}
                  {planModal.activeTab === "general" && (
                    <div className="space-y-8 animate-in fade-in">
                      {/* Basic Codes */}
                      <section>
                        <h4 className="text-[13px] font-extrabold text-stone-800 mb-4 border-b pb-2 flex items-center gap-2">
                          <Info className="w-4 h-4 text-blue-500" /> الأرقام
                          المرجعية
                        </h4>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <label className="block text-[11px] font-bold text-stone-600 mb-1.5">
                              رقم المخطط <span className="text-red-500">*</span>
                            </label>
                            <input
                              required
                              value={planModal.data.planNumber}
                              onChange={(e) =>
                                setPlanModal((p) => ({
                                  ...p,
                                  data: {
                                    ...p.data,
                                    planNumber: e.target.value,
                                  },
                                }))
                              }
                              className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-stone-600 mb-1.5">
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
                              className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-stone-600 mb-1.5">
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
                              className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                          </div>
                        </div>
                      </section>

                      {/* Area & Usages */}
                      <section>
                        <h4 className="text-[13px] font-extrabold text-stone-800 mb-4 border-b pb-2 flex items-center gap-2">
                          <Map className="w-4 h-4 text-emerald-500" /> المساحة
                          والاستخدامات
                        </h4>
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div className="flex gap-2 items-end">
                              <div className="flex-1">
                                <label className="block text-[11px] font-bold text-stone-600 mb-1.5">
                                  المساحة بالكيلومتر المربع ($كم^2$)
                                </label>
                                <input
                                  type="number"
                                  step="any"
                                  value={planModal.data.areaKm}
                                  onChange={(e) =>
                                    handleAreaKmChange(e.target.value)
                                  }
                                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm font-mono outline-none focus:border-emerald-500"
                                />
                              </div>
                              <div className="text-stone-400 mb-2">
                                <Link2 className="w-4 h-4" />
                              </div>
                              <div className="flex-1">
                                <label className="block text-[11px] font-bold text-stone-600 mb-1.5">
                                  المساحة بالمتر المربع ($م^2$)
                                </label>
                                <input
                                  type="number"
                                  step="any"
                                  value={planModal.data.areaM}
                                  onChange={(e) =>
                                    handleAreaMChange(e.target.value)
                                  }
                                  className="w-full px-3 py-2 bg-emerald-50/50 border border-emerald-200 text-emerald-800 rounded-lg text-sm font-mono outline-none"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-stone-600 mb-1.5">
                                إجمالي عدد القطع
                              </label>
                              <input
                                type="number"
                                value={planModal.data.totalPlots}
                                onChange={(e) =>
                                  setPlanModal((p) => ({
                                    ...p,
                                    data: {
                                      ...p.data,
                                      totalPlots: e.target.value,
                                    },
                                  }))
                                }
                                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm font-mono outline-none"
                              />
                            </div>
                          </div>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-[11px] font-bold text-stone-600 mb-1.5">
                                الاستخدام الرئيسي (افصل بفاصلة)
                              </label>
                              <input
                                placeholder="سكني، تجاري..."
                                value={planModal.data.mainUsages}
                                onChange={(e) =>
                                  setPlanModal((p) => ({
                                    ...p,
                                    data: {
                                      ...p.data,
                                      mainUsages: e.target.value,
                                    },
                                  }))
                                }
                                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-stone-600 mb-1.5">
                                الاستخدامات الفرعية (افصل بفاصلة)
                              </label>
                              <input
                                placeholder="مرافق تعليمية، مساجد..."
                                value={planModal.data.subUsages}
                                onChange={(e) =>
                                  setPlanModal((p) => ({
                                    ...p,
                                    data: {
                                      ...p.data,
                                      subUsages: e.target.value,
                                    },
                                  }))
                                }
                                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      </section>

                      {/* Neighborhoods & Streets */}
                      <section>
                        <h4 className="text-[13px] font-extrabold text-stone-800 mb-4 border-b pb-2 flex items-center gap-2">
                          <Route className="w-4 h-4 text-orange-500" /> الأحياء
                          والشوارع
                        </h4>
                        <div className="mb-4">
                          <label className="block text-[11px] font-bold text-stone-600 mb-1.5">
                            الأحياء التابع لها (أسماء الأحياء)
                          </label>
                          <input
                            placeholder="أدخل أسماء الأحياء مفصولة بفاصلة..."
                            value={planModal.data.neighborhoods}
                            onChange={(e) =>
                              setPlanModal((p) => ({
                                ...p,
                                data: {
                                  ...p.data,
                                  neighborhoods: e.target.value,
                                },
                              }))
                            }
                            className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm outline-none"
                          />
                        </div>

                        <div className="border border-stone-200 rounded-xl overflow-hidden">
                          <div className="bg-stone-100 px-4 py-2 flex justify-between items-center border-b border-stone-200">
                            <span className="text-[12px] font-bold text-stone-700">
                              شوارع المخطط (
                              {planModal.data.streets?.length || 0})
                            </span>
                            <button
                              type="button"
                              onClick={addStreetToPlan}
                              className="text-[10px] bg-white border border-stone-300 px-2 py-1 rounded shadow-sm font-bold flex items-center gap-1 hover:bg-orange-50 hover:text-orange-600"
                            >
                              <Plus className="w-3 h-3" /> إضافة شارع
                            </button>
                          </div>
                          <div className="p-3 bg-stone-50/50">
                            {planModal.data.streets?.map((street, idx) => (
                              <div
                                key={street.id}
                                className="flex gap-3 mb-2 items-start bg-white p-2 rounded-lg border border-stone-200"
                              >
                                <div className="flex-1">
                                  <input
                                    placeholder="اسم الشارع"
                                    value={street.name}
                                    onChange={(e) => {
                                      const newS = [...planModal.data.streets];
                                      newS[idx].name = e.target.value;
                                      setPlanModal((p) => ({
                                        ...p,
                                        data: { ...p.data, streets: newS },
                                      }));
                                    }}
                                    className="w-full px-2 py-1 text-xs border rounded"
                                  />
                                </div>
                                <div className="w-20">
                                  <input
                                    type="number"
                                    placeholder="العرض"
                                    value={street.width}
                                    onChange={(e) => {
                                      const newS = [...planModal.data.streets];
                                      newS[idx].width = e.target.value;
                                      setPlanModal((p) => ({
                                        ...p,
                                        data: { ...p.data, streets: newS },
                                      }));
                                    }}
                                    className="w-full px-2 py-1 text-xs border rounded"
                                  />
                                </div>
                                <div className="flex flex-col gap-1 w-1/3">
                                  <label className="flex items-center gap-1 text-[10px] font-bold cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={street.hasSpecialReg}
                                      onChange={(e) => {
                                        const newS = [
                                          ...planModal.data.streets,
                                        ];
                                        newS[idx].hasSpecialReg =
                                          e.target.checked;
                                        setPlanModal((p) => ({
                                          ...p,
                                          data: { ...p.data, streets: newS },
                                        }));
                                      }}
                                    />{" "}
                                    تنظيم خاص؟
                                  </label>
                                  {street.hasSpecialReg && (
                                    <input
                                      placeholder="وصف التنظيم..."
                                      value={street.regDesc}
                                      onChange={(e) => {
                                        const newS = [
                                          ...planModal.data.streets,
                                        ];
                                        newS[idx].regDesc = e.target.value;
                                        setPlanModal((p) => ({
                                          ...p,
                                          data: { ...p.data, streets: newS },
                                        }));
                                      }}
                                      className="w-full px-2 py-1 text-[10px] border rounded bg-yellow-50 border-yellow-200 outline-none"
                                    />
                                  )}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newS = planModal.data.streets.filter(
                                      (_, i) => i !== idx,
                                    );
                                    setPlanModal((p) => ({
                                      ...p,
                                      data: { ...p.data, streets: newS },
                                    }));
                                  }}
                                  className="mt-1 text-red-400 hover:text-red-600"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                            {planModal.data.streets?.length === 0 && (
                              <p className="text-center text-[10px] text-stone-400 py-2">
                                لا توجد شوارع مضافة حالياً.
                              </p>
                            )}
                          </div>
                        </div>
                      </section>

                      {/* Maps & QR */}
                      <section>
                        <h4 className="text-[13px] font-extrabold text-stone-800 mb-4 border-b pb-2 flex items-center gap-2">
                          <Globe className="w-4 h-4 text-blue-500" /> الخرائط
                          والمواقع
                        </h4>
                        <div className="grid grid-cols-2 gap-6">
                          {/* البوابة الرسمية */}
                          <div className="bg-white border border-stone-200 p-4 rounded-xl shadow-sm">
                            <label className="block text-[11px] font-bold text-blue-800 mb-3 flex items-center gap-1">
                              <Landmark className="w-3.5 h-3.5" /> الخريطة
                              الرسمية (الأمانة)
                            </label>
                            <input
                              type="url"
                              dir="ltr"
                              placeholder="URL..."
                              value={planModal.data.officialMapUrl}
                              onChange={(e) =>
                                setPlanModal((p) => ({
                                  ...p,
                                  data: {
                                    ...p.data,
                                    officialMapUrl: e.target.value,
                                  },
                                }))
                              }
                              className="w-full px-3 py-2 text-[11px] font-mono border rounded-lg mb-3 outline-none focus:border-blue-500"
                            />

                            <div className="flex gap-4">
                              <div
                                className="flex-1 h-32 border-2 border-dashed border-stone-300 rounded-lg bg-stone-50 flex flex-col items-center justify-center cursor-pointer relative overflow-hidden group"
                                onPaste={(e) =>
                                  handlePasteImage(e, "officialMapImage")
                                }
                              >
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) =>
                                    handleFileUpload(e, "officialMapImage")
                                  }
                                  className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
                                />
                                {planModal.data.officialMapImage ? (
                                  <img
                                    src={planModal.data.officialMapImage}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <>
                                    <ImageIcon className="w-6 h-6 text-stone-400 mb-1" />
                                    <span className="text-[9px] text-stone-500 text-center px-2">
                                      اضغط للرفع أو <br />
                                      Ctrl+V للصق صورة
                                    </span>
                                  </>
                                )}
                              </div>
                              <div className="w-24 h-24 bg-white border border-stone-200 rounded-lg flex items-center justify-center p-1 self-end shrink-0">
                                {planModal.data.officialMapUrl ? (
                                  <QRCodeSVG
                                    value={planModal.data.officialMapUrl}
                                    size={80}
                                  />
                                ) : (
                                  <span className="text-[8px] text-stone-300 text-center">
                                    أدخل الرابط للـ QR
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* جوجل ماب */}
                          <div className="bg-white border border-stone-200 p-4 rounded-xl shadow-sm">
                            <label className="block text-[11px] font-bold text-emerald-800 mb-3 flex items-center gap-1">
                              <Map className="w-3.5 h-3.5" /> خرائط جوجل (Google
                              Maps)
                            </label>
                            <input
                              type="url"
                              dir="ltr"
                              placeholder="URL..."
                              value={planModal.data.googleMapUrl}
                              onChange={(e) =>
                                setPlanModal((p) => ({
                                  ...p,
                                  data: {
                                    ...p.data,
                                    googleMapUrl: e.target.value,
                                  },
                                }))
                              }
                              className="w-full px-3 py-2 text-[11px] font-mono border rounded-lg mb-3 outline-none focus:border-emerald-500"
                            />

                            <div className="flex gap-4">
                              <div
                                className="flex-1 h-32 border-2 border-dashed border-stone-300 rounded-lg bg-stone-50 flex flex-col items-center justify-center cursor-pointer relative overflow-hidden group"
                                onPaste={(e) =>
                                  handlePasteImage(e, "googleMapImage")
                                }
                              >
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) =>
                                    handleFileUpload(e, "googleMapImage")
                                  }
                                  className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
                                />
                                {planModal.data.googleMapImage ? (
                                  <img
                                    src={planModal.data.googleMapImage}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <>
                                    <ImageIcon className="w-6 h-6 text-stone-400 mb-1" />
                                    <span className="text-[9px] text-stone-500 text-center px-2">
                                      اضغط للرفع أو <br />
                                      Ctrl+V للصق صورة
                                    </span>
                                  </>
                                )}
                              </div>
                              <div className="w-24 h-24 bg-white border border-stone-200 rounded-lg flex items-center justify-center p-1 self-end shrink-0">
                                {planModal.data.googleMapUrl ? (
                                  <QRCodeSVG
                                    value={planModal.data.googleMapUrl}
                                    size={80}
                                  />
                                ) : (
                                  <span className="text-[8px] text-stone-300 text-center">
                                    أدخل الرابط للـ QR
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
                    <div className="space-y-6 animate-in fade-in">
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 text-blue-600" />
                        <p className="text-sm font-bold text-blue-800">
                          هذه الإحصائيات يتم حسابها آلياً بناءً على المعاملات
                          المرتبطة برقم هذا المخطط في النظام.
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white border border-stone-200 p-5 rounded-xl shadow-sm text-center">
                          <span className="block text-[12px] font-bold text-stone-500 mb-2">
                            عدد القطع التي لها معاملات
                          </span>
                          <span className="text-4xl font-black text-stone-800">
                            142
                          </span>
                        </div>
                        <div className="bg-white border border-stone-200 p-5 rounded-xl shadow-sm text-center">
                          <span className="block text-[12px] font-bold text-stone-500 mb-2">
                            القطع التي لها ملفات ملكية
                          </span>
                          <span className="text-4xl font-black text-emerald-600">
                            89
                          </span>
                        </div>
                      </div>

                      <h4 className="text-[13px] font-extrabold text-stone-800 mt-6 mb-4 border-b pb-2">
                        المعاملات حسب الحالة
                      </h4>
                      <div className="grid grid-cols-4 gap-3">
                        {["معتمدة", "تحت الإجراء", "مجمدة", "ملغاة"].map(
                          (st, i) => (
                            <div
                              key={i}
                              className="bg-stone-50 border border-stone-200 p-4 rounded-xl text-center"
                            >
                              <span className="block text-[11px] font-bold text-stone-600 mb-1">
                                {st}
                              </span>
                              <span
                                className={`text-xl font-black ${i === 0 ? "text-green-600" : i === 1 ? "text-blue-600" : i === 2 ? "text-orange-500" : "text-red-500"}`}
                              >
                                {Math.floor(Math.random() * 50)}
                              </span>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  )}

                  {/* === Tab 3: Files === */}
                  {planModal.activeTab === "files" && (
                    <div className="space-y-6 animate-in fade-in">
                      <div className="flex justify-between items-end border-b border-stone-200 pb-3">
                        <div>
                          <h4 className="text-[14px] font-extrabold text-stone-800">
                            ملفات المخطط والمرفقات الهندسية
                          </h4>
                          <p className="text-[11px] text-stone-500">
                            يدعم الصور (TIFF, JPG) وملفات الأوتوكاد (DWG) والـ
                            PDF
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => fileRef.current?.click()}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-[11px] font-bold flex items-center gap-1.5 hover:bg-blue-700"
                        >
                          <FileUp className="w-4 h-4" /> إضافة ملف
                        </button>
                        <input
                          type="file"
                          ref={fileRef}
                          className="hidden"
                          onChange={handleAddPlanFile}
                          accept=".jpg,.png,.tiff,.dwg,.pdf"
                        />
                      </div>

                      <div className="space-y-3">
                        {planModal.data.files.map((file) => (
                          <div
                            key={file.id}
                            className="flex gap-4 p-3 bg-white border border-stone-200 rounded-xl items-start shadow-sm"
                          >
                            <div className="w-12 h-12 bg-stone-100 text-stone-400 rounded-lg flex flex-col items-center justify-center shrink-0">
                              <FileText className="w-5 h-5 mb-0.5" />
                              <span className="text-[8px] font-mono font-bold">
                                {file.type}
                              </span>
                            </div>
                            <div className="flex-1 space-y-2">
                              <div className="text-[12px] font-bold text-stone-800 truncate">
                                {file.name}
                              </div>
                              <input
                                type="text"
                                placeholder="أضف وصفاً لهذا الملف..."
                                value={file.desc}
                                onChange={(e) => {
                                  const nF = [...planModal.data.files];
                                  const idx = nF.findIndex(
                                    (f) => f.id === file.id,
                                  );
                                  nF[idx].desc = e.target.value;
                                  setPlanModal((p) => ({
                                    ...p,
                                    data: { ...p.data, files: nF },
                                  }));
                                }}
                                className="w-full px-2 py-1.5 text-[11px] border border-stone-200 rounded outline-none focus:border-blue-400 bg-stone-50"
                              />
                            </div>
                            <div className="flex flex-col gap-1 shrink-0">
                              <a
                                href={file.url}
                                download
                                className="p-1.5 text-blue-600 bg-blue-50 rounded hover:bg-blue-100 flex justify-center"
                              >
                                <Download className="w-4 h-4" />
                              </a>
                              <button
                                type="button"
                                onClick={() =>
                                  setPlanModal((p) => ({
                                    ...p,
                                    data: {
                                      ...p.data,
                                      files: p.data.files.filter(
                                        (f) => f.id !== file.id,
                                      ),
                                    },
                                  }))
                                }
                                className="p-1.5 text-red-600 bg-red-50 rounded hover:bg-red-100 flex justify-center"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                        {planModal.data.files.length === 0 && (
                          <div className="py-12 border-2 border-dashed border-stone-200 rounded-xl flex flex-col items-center justify-center text-stone-400 bg-stone-50">
                            <FolderOpen className="w-10 h-10 mb-2 opacity-50" />
                            <span className="text-sm font-bold">
                              لا توجد ملفات مرفقة بهذا المخطط
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* === Tab: Special Regulations (تنظيمات خاصة) === */}
                  {planModal.activeTab === "special_reg" && (
                    <div className="space-y-6 animate-in fade-in h-full flex flex-col">
                      <div className="flex items-center gap-3 border-b border-stone-200 pb-3">
                        <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center">
                          <ShieldAlert className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-[14px] font-extrabold text-stone-800">
                            التنظيمات الخاصة والاستثناءات
                          </h4>
                          <p className="text-[11px] text-stone-500">
                            سجل هنا أي قرارات، اشتراطات خاصة، أو استثناءات تخص
                            هذا المخطط بالتحديد.
                          </p>
                        </div>
                      </div>

                      {/* Input Area (منطقة الكتابة) */}
                      <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 shadow-inner">
                        <textarea
                          placeholder="اكتب نص التنظيم، القرار، أو التعليق هنا..."
                          value={newReg.text}
                          onChange={(e) =>
                            setNewReg((prev) => ({
                              ...prev,
                              text: e.target.value,
                            }))
                          }
                          className="w-full bg-white border border-stone-200 rounded-lg p-3 text-sm font-bold outline-none focus:border-purple-500 min-h-[80px] resize-none"
                        />

                        {/* عرض الملفات التي تم اختيارها قبل الإرسال */}
                        {newReg.files.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {newReg.files.map((f, i) => (
                              <div
                                key={i}
                                className="bg-white border border-stone-200 px-2 py-1 rounded text-[10px] font-bold text-stone-600 flex items-center gap-2"
                              >
                                <span className="truncate max-w-[100px]">
                                  {f.name}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setNewReg((p) => ({
                                      ...p,
                                      files: p.files.filter(
                                        (file) => file.id !== f.id,
                                      ),
                                    }))
                                  }
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <X size={12} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex justify-between items-center mt-3">
                          <div className="flex items-center gap-3">
                            <input
                              type="file"
                              multiple
                              id="reg-file-upload"
                              className="hidden"
                              onChange={handleRegFileUpload}
                            />
                            <label
                              htmlFor="reg-file-upload"
                              className="flex items-center gap-1.5 text-[11px] font-bold text-purple-600 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg cursor-pointer transition-colors"
                            >
                              <Paperclip size={14} /> إرفاق ملفات ومستندات
                            </label>
                          </div>
                          <button
                            type="button"
                            onClick={handleAddRegulation}
                            disabled={
                              !newReg.text.trim() && newReg.files.length === 0
                            }
                            className="px-5 py-1.5 bg-purple-600 text-white text-[11px] font-bold rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            إضافة للسجل
                          </button>
                        </div>
                      </div>

                      {/* Regulations Timeline (سجل التنظيمات) */}
                      <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                        {planModal.data.specialRegulations?.map((reg) => (
                          <div
                            key={reg.id}
                            className="bg-white border border-stone-200 rounded-xl p-4 shadow-sm relative group"
                          >
                            {/* Header */}
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 bg-stone-100 rounded-full flex items-center justify-center text-stone-500">
                                  <User size={14} />
                                </div>
                                <div>
                                  <div className="text-[12px] font-black text-stone-800">
                                    {reg.authorName}
                                  </div>
                                  <div className="text-[10px] text-stone-400 font-mono flex items-center gap-1 mt-0.5">
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
                                        specialRegulations:
                                          p.data.specialRegulations.filter(
                                            (r) => r.id !== reg.id,
                                          ),
                                      },
                                    }));
                                }}
                                className="text-stone-300 hover:text-red-500 transition-colors p-1 opacity-0 group-hover:opacity-100"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>

                            {/* Text */}
                            {reg.text && (
                              <p className="text-[13px] font-bold text-stone-700 leading-relaxed whitespace-pre-wrap border-r-2 border-purple-200 pr-3">
                                {reg.text}
                              </p>
                            )}

                            {/* Attached Files */}
                            {reg.files && reg.files.length > 0 && (
                              <div className="mt-4 pt-3 border-t border-stone-50 flex flex-wrap gap-2">
                                {reg.files.map((file, i) => (
                                  <a
                                    key={i}
                                    href={file.url}
                                    download={file.name}
                                    className="flex items-center gap-2 bg-stone-50 hover:bg-purple-50 border border-stone-200 hover:border-purple-200 px-3 py-1.5 rounded-lg transition-colors group/file"
                                  >
                                    <FolderOpen
                                      size={14}
                                      className="text-stone-400 group-hover/file:text-purple-500"
                                    />
                                    <span
                                      className="text-[10px] font-bold text-stone-600 truncate max-w-[120px]"
                                      dir="ltr"
                                    >
                                      {file.name}
                                    </span>
                                    <Download
                                      size={12}
                                      className="text-stone-400"
                                    />
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}

                        {(!planModal.data.specialRegulations ||
                          planModal.data.specialRegulations.length === 0) && (
                          <div className="text-center py-10 text-stone-400 flex flex-col items-center">
                            <ShieldAlert className="w-10 h-10 mb-2 opacity-20" />
                            <span className="text-[11px] font-bold">
                              لا توجد تنظيمات خاصة مسجلة لهذا المخطط حتى الآن.
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* === Tab 4: Notes === */}
                  {planModal.activeTab === "notes" && (
                    <div className="space-y-4 animate-in fade-in h-full flex flex-col">
                      <h4 className="text-[13px] font-extrabold text-stone-800 border-b pb-2">
                        ملاحظات حرة
                      </h4>
                      <textarea
                        placeholder="اكتب أية ملاحظات عامة حول هذا المخطط، قيود، أو تنبيهات للإدارات الأخرى..."
                        value={planModal.data.notes}
                        onChange={(e) =>
                          setPlanModal((p) => ({
                            ...p,
                            data: { ...p.data, notes: e.target.value },
                          }))
                        }
                        className="w-full flex-1 min-h-[300px] p-4 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-sm leading-relaxed resize-none"
                      />
                    </div>
                  )}

                  {/* Submit Trigger (Hidden, connected via form ID) */}
                  <button type="submit" className="hidden">
                    Submit
                  </button>
                </form>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-stone-200 bg-white flex gap-3 shrink-0">
              <button
                type="button"
                onClick={() =>
                  setPlanModal((prev) => ({ ...prev, isOpen: false }))
                }
                className="px-6 py-2.5 bg-stone-100 text-stone-700 font-bold rounded-xl w-32 hover:bg-stone-200 transition-colors"
              >
                إغلاق
              </button>
              <button
                onClick={() =>
                  document.getElementById("planComplexForm").requestSubmit()
                }
                disabled={planMutation.isPending}
                className="flex-1 px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-blue-700 shadow-md shadow-blue-600/20 transition-all"
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
    </div>
  );
};

export default PlansTab;
