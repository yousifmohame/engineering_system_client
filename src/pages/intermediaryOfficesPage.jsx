import React, { useState, useMemo, useCallback, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/axios";
import { toast } from "sonner";
import {
  Building2,
  Search,
  Plus,
  Download,
  Upload,
  Copy,
  Share2,
  Camera,
  Phone,
  Mail,
  Globe,
  MapPin,
  Hash,
  FileText,
  Users,
  Palette,
  Link2,
  Edit3,
  Trash2,
  Eye,
  Star,
  CheckCircle2,
  XCircle,
  AlertCircle,
  X,
  Save,
  Image,
  Stamp,
  PenTool,
  LayoutTemplate,
  UserCheck,
  Briefcase,
  Calendar,
  Clock,
  Shield,
  BadgeCheck,
  Pause,
  CircleDot,
  FileType,
  TrendingUp,
  ClipboardList,
  Loader2,
  UploadCloud,
  Layers,
  Type,
  File,
  MessageCircle,
  Printer,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

// ═══════════════════════════════════════════════
// Helper Components
// ═══════════════════════════════════════════════

const StatusBadge = ({ status }) => {
  const config = {
    نشط: {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-200",
      icon: <CheckCircle2 className="w-3 h-3" />,
    },
    موقوف: {
      bg: "bg-red-50",
      text: "text-red-700",
      border: "border-red-200",
      icon: <XCircle className="w-3 h-3" />,
    },
    مجمد: {
      bg: "bg-blue-50",
      text: "text-blue-700",
      border: "border-blue-200",
      icon: <Pause className="w-3 h-3" />,
    },
  };
  const c = config[status] || config["نشط"];
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] ${c.bg} ${c.text} border ${c.border}`}
    >
      {c.icon} {status}
    </span>
  );
};

const RelTypeBadge = ({ type }) => {
  const colors = {
    وسيط: "bg-blue-50 text-blue-700 border-blue-200",
    شريك: "bg-purple-50 text-purple-700 border-purple-200",
    "مكتب تابع": "bg-amber-50 text-amber-700 border-amber-200",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] border ${colors[type] || "bg-slate-50 text-slate-600 border-slate-200"}`}
    >
      {type}
    </span>
  );
};

const AssetTypeIcon = ({ type, className = "w-4 h-4" }) => {
  const icons = {
    logo: <Image className={`${className} text-blue-500`} />,
    stamp: <Stamp className={`${className} text-red-500`} />,
    signature: <PenTool className={`${className} text-green-500`} />,
    header: <LayoutTemplate className={`${className} text-purple-500`} />,
    footer: <LayoutTemplate className={`${className} text-orange-500`} />,
    background: <Layers className={`${className} text-cyan-500`} />,
    template: <FileText className={`${className} text-indigo-500`} />,
  };
  return icons[type] || <FileText className={className} />;
};

const assetTypeLabels = {
  logo: "شعار",
  stamp: "ختم",
  signature: "توقيع",
  header: "هيدر",
  footer: "فوتر",
  background: "خلفية",
  template: "كليشة",
};

const FileTypeIcon = ({ fileType, className = "w-4 h-4" }) => {
  switch (fileType) {
    case "image":
      return <Image className={`${className} text-green-500`} />;
    case "pdf":
      return <File className={`${className} text-red-500`} />;
    case "dwg":
      return <FileType className={`${className} text-purple-500`} />;
    case "text":
      return <Type className={`${className} text-slate-500`} />;
    default:
      return <FileText className={`${className} text-slate-400`} />;
  }
};

const TransactionStatusBadge = ({ status }) => {
  const config = {
    جديدة: { bg: "bg-sky-50", text: "text-sky-700", border: "border-sky-200" },
    "قيد العمل": {
      bg: "bg-amber-50",
      text: "text-amber-700",
      border: "border-amber-200",
    },
    مكتملة: {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-200",
    },
    معلقة: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
  };
  const c = config[status] || {
    bg: "bg-gray-50",
    text: "text-gray-700",
    border: "border-gray-200",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] border ${c.bg} ${c.text} ${c.border}`}
      style={{ fontWeight: 600 }}
    >
      {status}
    </span>
  );
};

// ═══════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════

export function Screen860IntermediaryOffices() {
  const queryClient = useQueryClient();

  // 💡 Data Fetching
  const { data: offices = [], isLoading } = useQuery({
    queryKey: ["intermediary-offices"],
    queryFn: async () =>
      (await api.get("/intermediary-offices")).data?.data || [],
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCity, setFilterCity] = useState("all");
  const [selectedOffice, setSelectedOffice] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  // 💡 أضف هذا الكود هنا (لجلب النسخة الأحدث دائماً بعد أي تعديل أو إضافة)
  const freshSelectedOffice = useMemo(() => {
    if (!selectedOffice) return null;
    // البحث عن المكتب في القائمة المحدثة، وإذا لم يجده يعرض النسخة الحالية
    return offices.find((o) => o.id === selectedOffice.id) || selectedOffice;
  }, [offices, selectedOffice]);

  const cities = useMemo(() => {
    const c = [...new Set(offices.map((o) => o.city).filter(Boolean))];
    return c.sort();
  }, [offices]);

  const filteredOffices = useMemo(() => {
    return offices.filter((o) => {
      const matchSearch =
        !searchQuery ||
        o.nameAr?.includes(searchQuery) ||
        o.code?.includes(searchQuery) ||
        o.city?.includes(searchQuery) ||
        o.contactPerson?.includes(searchQuery) ||
        o.contactMobile?.includes(searchQuery);
      const matchStatus = filterStatus === "all" || o.status === filterStatus;
      const matchCity = filterCity === "all" || o.city === filterCity;
      return matchSearch && matchStatus && matchCity;
    });
  }, [offices, searchQuery, filterStatus, filterCity]);

  const stats = useMemo(
    () => ({
      total: offices.length,
      active: offices.filter((o) => o.status === "نشط").length,
      suspended: offices.filter((o) => o.status === "موقوف").length,
      frozen: offices.filter((o) => o.status === "مجمد").length,
      totalReceivable: offices.reduce(
        (sum, o) => sum + (o.receivableBalance || 0),
        0,
      ),
    }),
    [offices],
  );

  // 💡 Mutations
  const addMutation = useMutation({
    mutationFn: async (data) => api.post("/intermediary-offices", data),
    onSuccess: () => {
      toast.success("تم إضافة المكتب بنجاح");
      queryClient.invalidateQueries(["intermediary-offices"]);
      setShowAddModal(false);
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "حدث خطأ أثناء الإضافة"),
  });

  const updateMutation = useMutation({
    mutationFn: async (data) =>
      api.put(`/intermediary-offices/${data.id}`, data),
    onSuccess: () => {
      toast.success("تم تحديث بيانات المكتب بنجاح");
      queryClient.invalidateQueries(["intermediary-offices"]);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => api.delete(`/intermediary-offices/${id}`),
    onSuccess: () => {
      toast.success("تم حذف المكتب بنجاح");
      queryClient.invalidateQueries(["intermediary-offices"]);
      setShowDetailsDialog(false);
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "لا يمكن حذف المكتب"),
  });

  const freezeMutation = useMutation({
    mutationFn: async (id) =>
      api.patch(`/intermediary-offices/${id}/toggle-freeze`),
    onSuccess: () => {
      toast.success("تم تغيير حالة المكتب بنجاح");
      queryClient.invalidateQueries(["intermediary-offices"]);
    },
  });

  const handleCopyTable = useCallback(() => {
    const header =
      "كود\tالاسم\tالمدينة\tالحالة\tالمسؤول\tالجوال\tالنوع\tرصيد الذمم";
    const rows = filteredOffices.map(
      (o) =>
        `${o.code}\t${o.nameAr}\t${o.city}\t${o.status}\t${o.contactPerson}\t${o.contactMobile}\t${o.relationshipType}\t${(o.receivableBalance || 0).toLocaleString("ar-SA")}`,
    );
    const text = [header, ...rows].join("\n");
    navigator.clipboard
      .writeText(text)
      .then(() => toast.success("تم نسخ الجدول للحافظة"))
      .catch(() => toast.error("فشل النسخ"));
  }, [filteredOffices]);

  return (
    <div
      className="flex flex-col h-full bg-white"
      style={{ direction: "rtl", fontFamily: "Tajawal, sans-serif" }}
    >
      {/* ═══ Top Bar ═══ */}
      <div className="flex-shrink-0 border-b border-slate-200 bg-gradient-to-l from-slate-50 to-white">
        <div className="flex items-center justify-between px-4 py-2.5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-[15px] text-slate-800 font-bold">
                المكاتب الوسيطة
              </h1>
              <p className="text-[11px] text-slate-400">
                إدارة ملفات المكاتب الهندسية والوسطاء
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-lg">
              <span className="text-[11px] text-slate-500">إجمالي:</span>
              <span className="text-[13px] text-slate-800 font-bold">
                {stats.total}
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 rounded-lg">
              <CircleDot className="w-3 h-3 text-emerald-500" />
              <span className="text-[11px] text-emerald-700">
                {stats.active} نشط
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 rounded-lg">
              <XCircle className="w-3 h-3 text-red-500" />
              <span className="text-[11px] text-red-700">
                {stats.suspended} موقوف
              </span>
            </div>
            {stats.frozen > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 rounded-lg">
                <Pause className="w-3 h-3 text-blue-500" />
                <span className="text-[11px] text-blue-700">
                  {stats.frozen} مجمد
                </span>
              </div>
            )}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 rounded-lg">
              <span className="text-[11px] text-amber-700 font-bold">
                ذمم: {stats.totalReceivable.toLocaleString("ar-SA")} ر.س
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between px-4 py-2 border-t border-slate-100 bg-white">
          <div className="flex items-center gap-2 flex-1">
            <div className="relative w-72">
              <Search className="absolute right-2.5 top-2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="بحث بالاسم أو الكود أو المدينة..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-9 pl-3 py-1.5 text-[12px] bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-1.5 text-[12px] bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400"
            >
              <option value="all">جميع الحالات</option>
              <option value="نشط">نشط</option>
              <option value="موقوف">موقوف</option>
              <option value="مجمد">مجمد</option>
            </select>
            <select
              value={filterCity}
              onChange={(e) => setFilterCity(e.target.value)}
              className="px-3 py-1.5 text-[12px] bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400"
            >
              <option value="all">جميع المدن</option>
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-[12px] font-bold rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> إضافة مكتب
            </button>
            <button
              onClick={handleCopyTable}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 text-slate-600 text-[11px] rounded-lg hover:bg-slate-200"
              title="نسخ"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ═══ Table ═══ */}
      <div className="flex-1 overflow-auto custom-scrollbar-slim p-4">
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-[12px] border-collapse min-w-[1200px]">
            <thead className="bg-slate-50 sticky top-0 z-10">
              <tr className="border-b border-slate-200">
                <th className="w-8 px-2.5 py-3 text-center text-slate-500 font-bold">
                  #
                </th>
                <th className="w-16 px-2.5 py-3 text-right text-slate-500 font-bold">
                  الكود
                </th>
                <th className="min-w-[200px] px-2.5 py-3 text-right text-slate-500 font-bold">
                  الاسم التجاري
                </th>
                <th className="w-24 px-2.5 py-3 text-right text-slate-500 font-bold">
                  المدينة
                </th>
                <th className="w-20 px-2.5 py-3 text-right text-slate-500 font-bold">
                  الحالة
                </th>
                <th className="w-24 px-2.5 py-3 text-right text-slate-500 font-bold">
                  النوع
                </th>
                <th className="w-32 px-2.5 py-3 text-right text-slate-500 font-bold">
                  المسؤول
                </th>
                <th className="w-28 px-2.5 py-3 text-right text-slate-500 font-bold">
                  الجوال
                </th>
                <th className="w-28 px-2.5 py-3 text-right text-slate-500 font-bold">
                  رصيد الذمم
                </th>
                <th className="w-20 px-2.5 py-3 text-center text-slate-500 font-bold">
                  المعاملات
                </th>
                <th className="w-28 px-2.5 py-3 text-right text-slate-500 font-bold">
                  آخر معاملة
                </th>
                <th className="w-24 px-2.5 py-3 text-right text-slate-500 font-bold">
                  إجراءات
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="12" className="text-center py-10">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-500 mx-auto" />
                  </td>
                </tr>
              ) : filteredOffices.length > 0 ? (
                filteredOffices.map((office, idx) => (
                  <tr
                    key={office.id}
                    onClick={() => {
                      setSelectedOffice(office);
                      setShowDetailsDialog(true);
                    }}
                    className="border-b border-slate-100 cursor-pointer hover:bg-blue-50/50 transition-colors"
                  >
                    <td className="px-2.5 py-3 text-center text-slate-400 font-bold">
                      {idx + 1}
                    </td>
                    <td className="px-2.5 py-3">
                      <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 text-[10px] rounded font-bold font-mono">
                        {office.code}
                      </span>
                    </td>
                    <td className="px-2.5 py-3">
                      <div className="text-[12px] text-slate-800 font-bold">
                        {office.nameAr}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {office.nameEn || "—"}
                      </div>
                    </td>
                    <td className="px-2.5 py-3 text-slate-600 font-semibold">
                      {office.city}
                    </td>
                    <td className="px-2.5 py-3">
                      <StatusBadge status={office.status} />
                    </td>
                    <td className="px-2.5 py-3">
                      <RelTypeBadge type={office.relationshipType} />
                    </td>
                    <td className="px-2.5 py-3 text-slate-700 font-semibold">
                      {office.contactPerson || "—"}
                    </td>
                    <td
                      className="px-2.5 py-3 text-slate-600 font-mono"
                      dir="ltr"
                      style={{ textAlign: "right" }}
                    >
                      {office.contactMobile || "—"}
                    </td>
                    <td className="px-2.5 py-3">
                      <span
                        className={`font-bold ${office.receivableBalance > 0 ? "text-amber-600" : "text-slate-400"}`}
                      >
                        {office.receivableBalance > 0
                          ? `${office.receivableBalance.toLocaleString("ar-SA")} ر.س`
                          : "-"}
                      </span>
                    </td>
                    <td className="px-2.5 py-3 text-center">
                      <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-700 text-[11px] rounded-full font-bold">
                        {office.transactions?.length || 0}
                      </span>
                    </td>
                    <td className="px-2.5 py-3">
                      <span className="text-[10px] text-blue-600 font-mono font-bold">
                        {office.lastTransactionCode || "—"}
                      </span>
                    </td>
                    <td className="px-2.5 py-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedOffice(office);
                          setShowDetailsDialog(true);
                        }}
                        className="p-1.5 hover:bg-blue-100 rounded text-blue-600 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="12"
                    className="px-4 py-12 text-center text-slate-400"
                  >
                    <Search className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <div className="text-[13px] font-bold">
                      لا توجد مكاتب مطابقة
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <AddOfficeModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={(data) => addMutation.mutate(data)}
        isPending={addMutation.isPending}
      />

      {showDetailsDialog && selectedOffice && (
        <OfficeDetailsDialog
          office={freshSelectedOffice}
          open={showDetailsDialog}
          onClose={() => {
            setShowDetailsDialog(false);
            setSelectedOffice(null);
          }}
          onUpdate={(data) => updateMutation.mutate(data)}
          onDelete={(id) => deleteMutation.mutate(id)}
          onFreeze={(id) => freezeMutation.mutate(id)}
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════
// Add Office Modal
// ═══════════════════════════════════════════════

function AddOfficeModal({ open, onClose, onAdd, isPending }) {
  const [formData, setFormData] = useState({
    nameAr: "",
    nameEn: "",
    commercialRegister: "",
    engineeringLicense: "",
    vatNumber: "",
    vatStatus: "غير مسجل",
    nationalAddress: "",
    city: "",
    region: "",
    email: "",
    phone: "",
    whatsapp: "",
    website: "",
    specializations: [],
    status: "نشط",
    relationshipType: "وسيط",
    contactPerson: "",
    contactMobile: "",
    internalNotes: "",
  });

  const [specialization, setSpecialization] = useState("");

  if (!open) return null;

  const handleAddSpecialization = () => {
    if (
      specialization.trim() &&
      !formData.specializations?.includes(specialization.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        specializations: [
          ...(prev.specializations || []),
          specialization.trim(),
        ],
      }));
      setSpecialization("");
    }
  };

  const handleRemoveSpecialization = (spec) => {
    setFormData((prev) => ({
      ...prev,
      specializations: prev.specializations?.filter((s) => s !== spec) || [],
    }));
  };

  const handleSubmit = () => {
    if (!formData.nameAr || !formData.commercialRegister || !formData.city) {
      toast.error("يرجى إدخال البيانات الإلزامية");
      return;
    }
    onAdd(formData);
    setFormData({
      nameAr: "",
      nameEn: "",
      commercialRegister: "",
      engineeringLicense: "",
      vatNumber: "",
      vatStatus: "غير مسجل",
      nationalAddress: "",
      city: "",
      region: "",
      email: "",
      phone: "",
      whatsapp: "",
      website: "",
      specializations: [],
      status: "نشط",
      relationshipType: "وسيط",
      contactPerson: "",
      contactMobile: "",
      internalNotes: "",
    });
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in"
      dir="rtl"
    >
      <div className="bg-white rounded-2xl shadow-2xl flex flex-col w-full max-w-3xl overflow-hidden max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-slate-800 text-white shrink-0">
          <h2 className="text-sm font-bold flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-400" /> إضافة مكتب وسيط جديد
          </h2>
          <button
            onClick={onClose}
            className="hover:text-red-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar-slim space-y-6">
          {/* Section 1: Identity */}
          <div className="border border-slate-200 rounded-lg p-4">
            <h3 className="text-[13px] font-bold text-slate-700 mb-3 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-500" />
              بيانات التعريف
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-600 mb-1">
                  الاسم التجاري (عربي) *
                </label>
                <input
                  type="text"
                  value={formData.nameAr}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, nameAr: e.target.value }))
                  }
                  className="w-full px-3 py-2 text-[12px] bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                  placeholder="مثال: مكتب الحلول الهندسية"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-600 mb-1">
                  الاسم التجاري (إنجليزي)
                </label>
                <input
                  type="text"
                  value={formData.nameEn}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, nameEn: e.target.value }))
                  }
                  className="w-full px-3 py-2 text-[12px] bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                  placeholder="Engineering Solutions"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-600 mb-1">
                  السجل التجاري *
                </label>
                <input
                  type="text"
                  value={formData.commercialRegister}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      commercialRegister: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 text-[12px] bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                  placeholder="1010456789"
                  dir="ltr"
                  style={{ textAlign: "right" }}
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-600 mb-1">
                  رقم الترخيص الهندسي
                </label>
                <input
                  type="text"
                  value={formData.engineeringLicense}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      engineeringLicense: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 text-[12px] bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                  placeholder="ENG-2024-1122"
                  dir="ltr"
                  style={{ textAlign: "right" }}
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-600 mb-1">
                  الرقم الضريبي (VAT)
                </label>
                <input
                  type="text"
                  value={formData.vatNumber}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      vatNumber: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 text-[12px] bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                  placeholder="310456789000003"
                  dir="ltr"
                  style={{ textAlign: "right" }}
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-600 mb-1">
                  حالة الضريبة
                </label>
                <select
                  value={formData.vatStatus}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      vatStatus: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 text-[12px] bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400"
                >
                  <option value="مسجل">مسجل</option>
                  <option value="غير مسجل">غير مسجل</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Address & Contact */}
          <div className="border border-slate-200 rounded-lg p-4">
            <h3 className="text-[13px] font-bold text-slate-700 mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-500" />
              العنوان والتواصل
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-[11px] text-slate-600 mb-1">
                  العنوان الوطني
                </label>
                <input
                  type="text"
                  value={formData.nationalAddress}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      nationalAddress: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 text-[12px] bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                  placeholder="طريق الملك فهد، حي العليا، مبنى 14، الرياض 12211"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-600 mb-1">
                  المدينة *
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, city: e.target.value }))
                  }
                  className="w-full px-3 py-2 text-[12px] bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                  placeholder="الرياض"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-600 mb-1">
                  المنطقة
                </label>
                <input
                  type="text"
                  value={formData.region}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, region: e.target.value }))
                  }
                  className="w-full px-3 py-2 text-[12px] bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                  placeholder="منطقة الرياض"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-600 mb-1">
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  className="w-full px-3 py-2 text-[12px] bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                  placeholder="info@example.sa"
                  dir="ltr"
                  style={{ textAlign: "right" }}
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-600 mb-1">
                  الهاتف
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  className="w-full px-3 py-2 text-[12px] bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                  placeholder="0114567890"
                  dir="ltr"
                  style={{ textAlign: "right" }}
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-600 mb-1">
                  واتساب
                </label>
                <input
                  type="tel"
                  value={formData.whatsapp}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      whatsapp: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 text-[12px] bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                  placeholder="0551234567"
                  dir="ltr"
                  style={{ textAlign: "right" }}
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-600 mb-1">
                  الموقع الإلكتروني
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      website: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 text-[12px] bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                  placeholder="www.example.sa"
                  dir="ltr"
                  style={{ textAlign: "right" }}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Specializations */}
          <div className="border border-slate-200 rounded-lg p-4">
            <h3 className="text-[13px] font-bold text-slate-700 mb-3 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-blue-500" />
              التخصصات
            </h3>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" && handleAddSpecialization()
                }
                className="flex-1 px-3 py-2 text-[12px] bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                placeholder="أدخل تخصص واضغط Enter"
              />
              <button
                onClick={handleAddSpecialization}
                className="px-3 py-2 bg-blue-600 text-white text-[12px] rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {formData.specializations?.map((spec, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-2 py-1 bg-blue-50 text-blue-700 text-[11px] rounded-lg border border-blue-100"
                >
                  {spec}
                  <button
                    onClick={() => handleRemoveSpecialization(spec)}
                    className="hover:bg-blue-100 rounded"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Section 4: Relationship & Status */}
          <div className="border border-slate-200 rounded-lg p-4">
            <h3 className="text-[13px] font-bold text-slate-700 mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" />
              نوع العلاقة والحالة
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-600 mb-1">
                  نوع العلاقة
                </label>
                <select
                  value={formData.relationshipType}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      relationshipType: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 text-[12px] bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400"
                >
                  <option value="وسيط">وسيط</option>
                  <option value="شريك">شريك</option>
                  <option value="مكتب تابع">مكتب تابع</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] text-slate-600 mb-1">
                  الحالة
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, status: e.target.value }))
                  }
                  className="w-full px-3 py-2 text-[12px] bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400"
                >
                  <option value="نشط">نشط</option>
                  <option value="موقوف">موقوف</option>
                  <option value="مجمد">مجمد</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] text-slate-600 mb-1">
                  اسم المسؤول
                </label>
                <input
                  type="text"
                  value={formData.contactPerson}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      contactPerson: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 text-[12px] bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                  placeholder="م. خالد العتيبي"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-600 mb-1">
                  جوال المسؤول
                </label>
                <input
                  type="tel"
                  value={formData.contactMobile}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      contactMobile: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 text-[12px] bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                  placeholder="0551234567"
                  dir="ltr"
                  style={{ textAlign: "right" }}
                />
              </div>
              {formData.status === "موقوف" && (
                <div className="col-span-2">
                  <label className="block text-[11px] text-slate-600 mb-1">
                    سبب الإيقاف
                  </label>
                  <textarea
                    value={formData.suspensionReason || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        suspensionReason: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 text-[12px] bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                    rows={2}
                  />
                </div>
              )}
              <div className="col-span-2">
                <label className="block text-[11px] text-slate-600 mb-1">
                  ملاحظات داخلية
                </label>
                <textarea
                  value={formData.internalNotes}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      internalNotes: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 text-[12px] bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                  rows={2}
                  placeholder="ملاحظات إضافية..."
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2 text-sm font-bold text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
          >
            إلغاء
          </button>
          <button
            onClick={handleSubmit}
            disabled={isPending}
            className="flex items-center gap-2 px-8 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-md disabled:opacity-50"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}{" "}
            حفظ المكتب
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// Edit Office Modal
// ═══════════════════════════════════════════════

function EditOfficeModal({ open, onClose, office, onUpdate }) {
  const [formData, setFormData] = useState(office);
  const [specialization, setSpecialization] = useState("");

  if (!open || !office) return null;

  const handleAddSpecialization = () => {
    if (
      specialization.trim() &&
      !formData.specializations?.includes(specialization.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        specializations: [
          ...(prev.specializations || []),
          specialization.trim(),
        ],
      }));
      setSpecialization("");
    }
  };

  const handleRemoveSpecialization = (spec) => {
    setFormData((prev) => ({
      ...prev,
      specializations: prev.specializations?.filter((s) => s !== spec) || [],
    }));
  };

  const handleSubmit = () => {
    onUpdate(formData);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 z-[120] flex items-center justify-center p-4 animate-in fade-in"
      dir="rtl"
    >
      <div className="bg-white rounded-2xl shadow-2xl flex flex-col w-full max-w-3xl overflow-hidden max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-slate-800 text-white shrink-0">
          <h2 className="text-sm font-bold flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-blue-400" /> تعديل بيانات المكتب
          </h2>
          <button
            onClick={onClose}
            className="hover:text-red-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar-slim space-y-6">
          {/* Section 1: Identity */}
          <div className="border border-slate-200 rounded-lg p-4">
            <h3 className="text-[13px] font-bold text-slate-700 mb-3 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-500" />
              بيانات التعريف
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-600 mb-1">
                  الاسم التجاري (عربي) *
                </label>
                <input
                  type="text"
                  value={formData.nameAr}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, nameAr: e.target.value }))
                  }
                  className="w-full px-3 py-2 text-[12px] bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-600 mb-1">
                  الاسم التجاري (إنجليزي)
                </label>
                <input
                  type="text"
                  value={formData.nameEn || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, nameEn: e.target.value }))
                  }
                  className="w-full px-3 py-2 text-[12px] bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-600 mb-1">
                  السجل التجاري *
                </label>
                <input
                  type="text"
                  value={formData.commercialRegister}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      commercialRegister: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 text-[12px] bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                  dir="ltr"
                  style={{ textAlign: "right" }}
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-600 mb-1">
                  رقم الترخيص الهندسي
                </label>
                <input
                  type="text"
                  value={formData.engineeringLicense || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      engineeringLicense: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 text-[12px] bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                  dir="ltr"
                  style={{ textAlign: "right" }}
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-600 mb-1">
                  الرقم الضريبي (VAT)
                </label>
                <input
                  type="text"
                  value={formData.vatNumber || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      vatNumber: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 text-[12px] bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                  dir="ltr"
                  style={{ textAlign: "right" }}
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-600 mb-1">
                  حالة الضريبة
                </label>
                <select
                  value={formData.vatStatus}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      vatStatus: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 text-[12px] bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400"
                >
                  <option value="مسجل">مسجل</option>
                  <option value="غير مسجل">غير مسجل</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Address & Contact */}
          <div className="border border-slate-200 rounded-lg p-4">
            <h3 className="text-[13px] font-bold text-slate-700 mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-500" />
              العنوان والتواصل
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-[11px] text-slate-600 mb-1">
                  العنوان الوطني
                </label>
                <input
                  type="text"
                  value={formData.nationalAddress || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      nationalAddress: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 text-[12px] bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-600 mb-1">
                  المدينة *
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, city: e.target.value }))
                  }
                  className="w-full px-3 py-2 text-[12px] bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-600 mb-1">
                  المنطقة
                </label>
                <input
                  type="text"
                  value={formData.region || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, region: e.target.value }))
                  }
                  className="w-full px-3 py-2 text-[12px] bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-600 mb-1">
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  className="w-full px-3 py-2 text-[12px] bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                  dir="ltr"
                  style={{ textAlign: "right" }}
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-600 mb-1">
                  الهاتف
                </label>
                <input
                  type="tel"
                  value={formData.phone || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  className="w-full px-3 py-2 text-[12px] bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                  dir="ltr"
                  style={{ textAlign: "right" }}
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-600 mb-1">
                  واتساب
                </label>
                <input
                  type="tel"
                  value={formData.whatsapp || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      whatsapp: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 text-[12px] bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                  dir="ltr"
                  style={{ textAlign: "right" }}
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-600 mb-1">
                  الموقع الإلكتروني
                </label>
                <input
                  type="url"
                  value={formData.website || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      website: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 text-[12px] bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                  dir="ltr"
                  style={{ textAlign: "right" }}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Specializations */}
          <div className="border border-slate-200 rounded-lg p-4">
            <h3 className="text-[13px] font-bold text-slate-700 mb-3 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-blue-500" />
              التخصصات
            </h3>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" && handleAddSpecialization()
                }
                className="flex-1 px-3 py-2 text-[12px] bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                placeholder="أدخل تخصص واضغط Enter"
              />
              <button
                onClick={handleAddSpecialization}
                className="px-3 py-2 bg-blue-600 text-white text-[12px] rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {formData.specializations?.map((spec, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-2 py-1 bg-blue-50 text-blue-700 text-[11px] rounded-lg border border-blue-100"
                >
                  {spec}
                  <button
                    onClick={() => handleRemoveSpecialization(spec)}
                    className="hover:bg-blue-100 rounded"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Section 4: Relationship & Contact Person */}
          <div className="border border-slate-200 rounded-lg p-4">
            <h3 className="text-[13px] font-bold text-slate-700 mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" />
              نوع العلاقة وجهة الاتصال
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-600 mb-1">
                  نوع العلاقة
                </label>
                <select
                  value={formData.relationshipType}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      relationshipType: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 text-[12px] bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400"
                >
                  <option value="وسيط">وسيط</option>
                  <option value="شريك">شريك</option>
                  <option value="مكتب تابع">مكتب تابع</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] text-slate-600 mb-1">
                  الحالة
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, status: e.target.value }))
                  }
                  className="w-full px-3 py-2 text-[12px] bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400"
                >
                  <option value="نشط">نشط</option>
                  <option value="موقوف">موقوف</option>
                  <option value="مجمد">مجمد</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] text-slate-600 mb-1">
                  اسم المسؤول
                </label>
                <input
                  type="text"
                  value={formData.contactPerson || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      contactPerson: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 text-[12px] bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-600 mb-1">
                  جوال المسؤول
                </label>
                <input
                  type="tel"
                  value={formData.contactMobile || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      contactMobile: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 text-[12px] bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                  dir="ltr"
                  style={{ textAlign: "right" }}
                />
              </div>
              {formData.status === "موقوف" && (
                <div className="col-span-2">
                  <label className="block text-[11px] text-slate-600 mb-1">
                    سبب الإيقاف
                  </label>
                  <textarea
                    value={formData.suspensionReason || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        suspensionReason: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 text-[12px] bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                    rows={2}
                  />
                </div>
              )}
              <div className="col-span-2">
                <label className="block text-[11px] text-slate-600 mb-1">
                  ملاحظات داخلية
                </label>
                <textarea
                  value={formData.internalNotes || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      internalNotes: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 text-[12px] bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                  rows={2}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2 text-sm font-bold text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
          >
            إلغاء
          </button>
          <button
            onClick={handleSubmit}
            className="flex items-center gap-2 px-8 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-md"
          >
            <Save className="w-4 h-4" /> حفظ التعديلات
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// Office Report Dialog
// ═══════════════════════════════════════════════

function OfficeReportDialog({ open, onClose, office }) {
  if (!open || !office) return null;

  const reportDate = new Date().toLocaleDateString("ar-SA");
  const reportTime = new Date().toLocaleTimeString("ar-SA", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const stats = {
    totalTransactions: office.transactions?.length || 0,
    completedTransactions:
      office.transactions?.filter((t) => t.status === "مكتملة").length || 0,
    inProgressTransactions:
      office.transactions?.filter((t) => t.status === "قيد العمل").length || 0,
    pendingTransactions:
      office.transactions?.filter((t) => t.status === "معلقة").length || 0,
    totalRevenue:
      office.transactions?.reduce((sum, t) => sum + t.amount, 0) || 0,
    completedRevenue:
      office.transactions
        ?.filter((t) => t.status === "مكتملة")
        .reduce((sum, t) => sum + t.amount, 0) || 0,
    totalAssets: office.officialAssets?.length || 0,
    activeAssets: office.officialAssets?.filter((a) => a.isActive).length || 0,
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4 animate-in fade-in"
      dir="rtl"
    >
      <div className="bg-white rounded-2xl shadow-2xl flex flex-col w-full max-w-4xl overflow-hidden max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-slate-800 text-white shrink-0">
          <h2 className="text-sm font-bold flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-purple-400" /> تقرير شامل عن
            المكتب
          </h2>
          <button
            onClick={onClose}
            className="hover:text-red-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar-slim space-y-6">
          {/* Report Header */}
          <div className="bg-gradient-to-l from-purple-50 to-white border border-purple-100 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-[15px] text-slate-800 font-bold">
                  {office.nameAr}
                </h2>
                <p className="text-[11px] text-slate-400">{office.nameEn}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-purple-600 text-white text-[11px] rounded font-bold font-mono">
                  {office.code}
                </span>
                <StatusBadge status={office.status} />
                <RelTypeBadge type={office.relationshipType} />
              </div>
            </div>
            <div className="flex items-center gap-4 text-[11px] text-slate-500 border-t border-purple-100 pt-3">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" /> تاريخ التقرير: {reportDate}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" /> الوقت: {reportTime}
              </div>
            </div>
          </div>

          {/* Key Statistics */}
          <div>
            <h3 className="text-[13px] text-slate-700 mb-3 font-bold">
              الإحصائيات الرئيسية
            </h3>
            <div className="grid grid-cols-4 gap-3">
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                <div className="text-[10px] text-blue-600 mb-1">
                  إجمالي المعاملات
                </div>
                <div className="text-[20px] text-blue-700 font-bold">
                  {stats.totalTransactions}
                </div>
              </div>
              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                <div className="text-[10px] text-emerald-600 mb-1">
                  معاملات مكتملة
                </div>
                <div className="text-[20px] text-emerald-700 font-bold">
                  {stats.completedTransactions}
                </div>
              </div>
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                <div className="text-[10px] text-amber-600 mb-1">قيد العمل</div>
                <div className="text-[20px] text-amber-700 font-bold">
                  {stats.inProgressTransactions}
                </div>
              </div>
              <div className="p-3 bg-red-50 rounded-lg border border-red-100">
                <div className="text-[10px] text-red-600 mb-1">معلقة</div>
                <div className="text-[20px] text-red-700 font-bold">
                  {stats.pendingTransactions}
                </div>
              </div>
            </div>
          </div>

          {/* Financial Summary */}
          <div>
            <h3 className="text-[13px] text-slate-700 mb-3 font-bold">
              الملخص المالي
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-[11px] text-slate-500 mb-2">
                  إجمالي قيمة المعاملات
                </div>
                <div className="text-[16px] text-slate-800 font-bold">
                  {stats.totalRevenue.toLocaleString("ar-SA")} ر.س
                </div>
              </div>
              <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                <div className="text-[11px] text-emerald-600 mb-2">
                  الإيرادات المحققة
                </div>
                <div className="text-[16px] text-emerald-700 font-bold">
                  {stats.completedRevenue.toLocaleString("ar-SA")} ر.س
                </div>
              </div>
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <div className="text-[11px] text-amber-600 mb-2">
                  رصيد الذمم المدينة
                </div>
                <div className="text-[16px] text-amber-700 font-bold">
                  {(office.receivableBalance || 0).toLocaleString("ar-SA")} ر.س
                </div>
              </div>
            </div>
          </div>

          {/* Office Information */}
          <div>
            <h3 className="text-[13px] text-slate-700 mb-3 font-bold">
              بيانات المكتب
            </h3>
            <div className="bg-slate-50 rounded-lg p-4 space-y-2">
              <div className="grid grid-cols-2 gap-3 text-[11px]">
                <div>
                  <span className="text-slate-500">السجل التجاري:</span>
                  <span className="text-slate-800 mr-2 font-mono font-bold">
                    {office.commercialRegister}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">الترخيص الهندسي:</span>
                  <span className="text-slate-800 mr-2 font-mono font-bold">
                    {office.engineeringLicense || "-"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">الرقم الضريبي:</span>
                  <span className="text-slate-800 mr-2 font-mono font-bold">
                    {office.vatNumber || "-"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">حالة الضريبة:</span>
                  <span className="text-slate-800 mr-2 font-bold">
                    {office.vatStatus}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">المدينة:</span>
                  <span className="text-slate-800 mr-2 font-bold">
                    {office.city}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">المنطقة:</span>
                  <span className="text-slate-800 mr-2 font-bold">
                    {office.region || "-"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50 shrink-0">
          <div className="text-[10px] text-slate-400">
            تم إنشاء هذا التقرير تلقائيًا بواسطة نظام WMS Core Shell
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => toast.info("جاري الطباعة...")}
              className="flex items-center gap-2 px-4 py-2 text-[12px] text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <Printer className="w-4 h-4" /> طباعة
            </button>
            <button
              onClick={() => toast.success("جاري تصدير التقرير...")}
              className="flex items-center gap-2 px-4 py-2 text-[12px] text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Download className="w-4 h-4" /> تصدير PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
// ═══════════════════════════════════════════════
// Office Details Dialog (Tailwind Pure with Tabs & Modals)
// ═══════════════════════════════════════════════

function OfficeDetailsDialog({
  office,
  open,
  onClose,
  onUpdate,
  onDelete,
  onFreeze,
}) {
  const [activeTab, setActiveTab] = useState("basic");
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  if (!open || !office) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 animate-in fade-in"
        dir="rtl"
      >
        <div
          className="bg-white rounded-2xl shadow-2xl flex flex-col w-full max-w-5xl h-[95vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="border-b border-slate-200 bg-gradient-to-l from-blue-50 to-white px-6 py-4 shrink-0">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shadow-inner">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-800">
                    {office.nameAr}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[11px] rounded font-bold font-mono">
                      {office.code}
                    </span>
                    <StatusBadge status={office.status} />
                    <RelTypeBadge type={office.relationshipType} />
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 mt-4">
              <button
                onClick={() => setShowEditDialog(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-[11px] font-bold rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" /> تعديل البيانات
              </button>
              <button
                onClick={() => {
                  if (confirm("متأكد من تجميد/تنشيط المكتب؟"))
                    onFreeze(office.id);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 text-[11px] font-bold rounded-lg hover:bg-amber-100 border border-amber-200"
              >
                <Pause className="w-3.5 h-3.5" /> تجميد / تنشيط
              </button>
              <button
                onClick={() => {
                  if (confirm("حذف المكتب نهائياً؟")) onDelete(office.id);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 text-[11px] font-bold rounded-lg hover:bg-red-100 border border-red-200"
              >
                <Trash2 className="w-3.5 h-3.5" /> حذف المكتب
              </button>
              <div className="flex-1" />
              <button
                onClick={() => setShowReportDialog(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 text-purple-700 text-[11px] font-bold rounded-lg hover:bg-purple-200 transition-colors"
              >
                <ClipboardList className="w-3.5 h-3.5" /> تقرير عن المكتب
              </button>
              <button
                onClick={() => setActiveTab("transactions")}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-700 text-[11px] font-bold rounded-lg hover:bg-green-200 transition-colors"
              >
                <TrendingUp className="w-3.5 h-3.5" /> معاملات المكتب (
                {office.transactions?.length || 0})
              </button>
            </div>
          </div>

          {/* Tabs Headers */}
          <div className="flex border-b border-slate-200 bg-slate-50 px-6 shrink-0 overflow-x-auto">
            {[
              { id: "basic", label: "البيانات الأساسية", icon: FileText },
              {
                id: "contacts",
                label: `جهات الاتصال (${office.contacts?.length || 0})`,
                icon: Users,
              },
              {
                id: "assets",
                label: `المكونات الرسمية (${office.officialAssets?.length || 0})`,
                icon: Palette,
              },
              {
                id: "intermediaries",
                label: `الوسطاء (${office.intermediaryLinks?.length || 0})`,
                icon: Link2,
              },
              {
                id: "transactions",
                label: `المعاملات (${office.transactions?.length || 0})`,
                icon: TrendingUp,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id ? "border-blue-600 text-blue-700 bg-white" : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100"}`}
              >
                <tab.icon className="w-4 h-4" /> {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30 custom-scrollbar-slim">
            {activeTab === "basic" && <TabBasicData office={office} />}
            {activeTab === "contacts" && (
              <TabContacts
                officeId={office.id}
                contacts={office.contacts || []}
              />
            )}
            {activeTab === "assets" && (
              <TabOfficialAssets
                officeId={office.id}
                assets={office.officialAssets || []}
              />
            )}
            {activeTab === "intermediaries" && (
              <TabIntermediaryLinks
                officeId={office.id}
                links={office.intermediaryLinks || []}
              />
            )}
            {activeTab === "transactions" && (
              <TabTransactions
                transactions={office.transactions || []}
                officeName={office.nameAr}
              />
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-slate-200 px-6 py-3 flex items-center justify-between bg-slate-50 shrink-0">
            <div className="flex items-center gap-4 text-[10px] text-slate-400 font-bold">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" /> أُنشئ: {office.createdAt}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" /> آخر تعديل: {office.updatedAt}
              </div>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 text-[12px] font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>

      {/* 💡 استدعاء النوافذ المنبثقة للتعديل والتقرير من داخل نافذة التفاصيل */}
      <OfficeReportDialog
        open={showReportDialog}
        onClose={() => setShowReportDialog(false)}
        office={office}
      />
      <EditOfficeModal
        open={showEditDialog}
        onClose={() => setShowEditDialog(false)}
        office={office}
        onUpdate={onUpdate}
      />
    </>
  );
}

// ═══════════════════════════════════════════════
// Tab 1: Basic Data
// ═══════════════════════════════════════════════

function TabBasicData({ office }) {
  const Field = ({ label, value, icon, mono }) => (
    <div className="flex items-start gap-2 py-2 border-b border-slate-50">
      {icon && <div className="mt-0.5 text-slate-400">{icon}</div>}
      <div className="flex-1 min-w-0">
        <div className="text-[10px] font-bold text-slate-400 mb-0.5">
          {label}
        </div>
        <div
          className={`text-[12px] text-slate-700 ${mono ? "font-mono" : ""}`}
          style={{
            fontWeight: 600,
            direction: mono ? "ltr" : "rtl",
            textAlign: mono ? "right" : undefined,
          }}
        >
          {value || <span className="text-slate-300">-</span>}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Identity Section */}
      <div>
        <div className="text-[13px] text-blue-600 mb-3 flex items-center gap-1.5 font-bold">
          <Building2 className="w-4 h-4" /> بيانات التعريف
        </div>
        <div className="bg-white border border-gray-200 shadow-sm rounded-xl px-4 py-2">
          <Field label="الاسم التجاري (عربي)" value={office.nameAr} />
          <Field label="الاسم التجاري (إنجليزي)" value={office.nameEn} />
          <Field
            label="السجل التجاري"
            value={office.commercialRegister}
            icon={<Hash className="w-3.5 h-3.5" />}
            mono
          />
          <Field
            label="رقم الترخيص الهندسي"
            value={office.engineeringLicense}
            icon={<Shield className="w-3.5 h-3.5" />}
            mono
          />
          <Field
            label="الرقم الضريبي (VAT)"
            value={office.vatNumber || "-"}
            icon={<FileText className="w-3.5 h-3.5" />}
            mono
          />
          <div className="flex items-start gap-2 py-2">
            <div className="mt-0.5 text-slate-400">
              <BadgeCheck className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 mb-0.5">
                حالة الضريبة
              </div>
              <span
                className={`inline-flex items-center font-bold px-2 py-0.5 rounded text-[11px] ${
                  office.vatStatus === "مسجل"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {office.vatStatus}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Address & Contact */}
      <div>
        <div className="text-[13px] text-blue-600 mb-3 flex items-center gap-1.5 font-bold">
          <MapPin className="w-4 h-4" /> العنوان والتواصل
        </div>
        <div className="bg-white border border-gray-200 shadow-sm rounded-xl px-4 py-2">
          <Field
            label="العنوان الوطني"
            value={office.nationalAddress}
            icon={<MapPin className="w-3.5 h-3.5" />}
          />
          <div className="flex gap-4 py-2 border-b border-slate-50">
            <div>
              <div className="text-[10px] font-bold text-slate-400 mb-0.5">
                المدينة
              </div>
              <div className="text-[12px] font-bold text-slate-700">
                {office.city}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 mb-0.5">
                المنطقة
              </div>
              <div className="text-[12px] font-bold text-slate-700">
                {office.region}
              </div>
            </div>
          </div>
          <Field
            label="البريد الإلكتروني"
            value={office.email}
            icon={<Mail className="w-3.5 h-3.5" />}
            mono
          />
          <Field
            label="الهاتف"
            value={office.phone}
            icon={<Phone className="w-3.5 h-3.5" />}
            mono
          />
          <Field
            label="واتساب"
            value={office.whatsapp}
            icon={<MessageCircle className="w-3.5 h-3.5" />}
            mono
          />
          <Field
            label="الموقع الإلكتروني"
            value={office.website}
            icon={<Globe className="w-3.5 h-3.5" />}
            mono
          />
        </div>
      </div>

      {/* Specializations */}
      <div>
        <div className="text-[13px] text-blue-600 mb-3 flex items-center gap-1.5 font-bold">
          <Briefcase className="w-4 h-4" /> التخصصات
        </div>
        <div className="flex flex-wrap gap-1.5">
          {office.specializations?.length > 0 ? (
            office.specializations.map((s, i) => (
              <span
                key={i}
                className="px-2 py-1 bg-blue-50 font-bold text-blue-700 text-[11px] rounded-lg border border-blue-100"
              >
                {s}
              </span>
            ))
          ) : (
            <span className="text-gray-400 text-xs font-bold">
              لم يتم تسجيل تخصصات
            </span>
          )}
        </div>
      </div>

      {/* Status & Notes */}
      {office.status === "موقوف" && office.suspensionReason && (
        <div className="p-3 bg-red-50 rounded-lg border border-red-100 shadow-sm">
          <div className="text-[11px] font-bold text-red-700 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5" /> سبب الإيقاف
          </div>
          <p className="text-[12px] font-semibold text-red-600 mt-1">
            {office.suspensionReason}
          </p>
        </div>
      )}

      {office.internalNotes && (
        <div className="p-3 bg-amber-50 rounded-lg border border-amber-100 shadow-sm">
          <div className="text-[11px] font-bold text-amber-700 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" /> ملاحظات داخلية
          </div>
          <p className="text-[12px] font-semibold text-amber-600 mt-1">
            {office.internalNotes}
          </p>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════
// Tab 2: Contacts (بكامل وظائفها)
// ═══════════════════════════════════════════════

function TabContacts({ officeId, contacts }) {
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    position: "",
    mobile: "",
    email: "",
    notes: "",
    isAuthorizedSigner: false,
  });

  const addContactMutation = useMutation({
    mutationFn: async (data) =>
      api.post(`/intermediary-offices/${officeId}/contacts`, data),
    onSuccess: () => {
      toast.success("تم إضافة جهة الاتصال بنجاح");
      queryClient.invalidateQueries(["intermediary-offices"]);
      setIsAdding(false);
      setFormData({
        name: "",
        position: "",
        mobile: "",
        email: "",
        notes: "",
        isAuthorizedSigner: false,
      });
    },
  });

  const deleteContactMutation = useMutation({
    mutationFn: async (contactId) =>
      api.delete(`/intermediary-offices/contacts/${contactId}`),
    onSuccess: () => {
      toast.success("تم حذف جهة الاتصال");
      queryClient.invalidateQueries(["intermediary-offices"]);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.mobile)
      return toast.error("يرجى إدخال الاسم والجوال");
    addContactMutation.mutate(formData);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <div className="text-[12px] font-bold text-slate-500">
          {contacts?.length || 0} جهة اتصال
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> إضافة جهة اتصال
          </button>
        )}
      </div>

      {isAdding && (
        <form
          onSubmit={handleSubmit}
          className="bg-white p-4 rounded-xl border border-blue-200 shadow-sm space-y-3 animate-in fade-in zoom-in-95"
        >
          <div className="text-[12px] font-bold text-blue-700 mb-2">
            جهة اتصال جديدة
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-600 mb-1">
                الاسم *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full border border-slate-300 rounded p-2 text-xs outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-600 mb-1">
                المنصب / الصفة
              </label>
              <input
                type="text"
                value={formData.position}
                onChange={(e) =>
                  setFormData({ ...formData, position: e.target.value })
                }
                className="w-full border border-slate-300 rounded p-2 text-xs outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-600 mb-1">
                الجوال *
              </label>
              <input
                type="tel"
                value={formData.mobile}
                onChange={(e) =>
                  setFormData({ ...formData, mobile: e.target.value })
                }
                className="w-full border border-slate-300 rounded p-2 text-xs outline-none focus:border-blue-500"
                dir="ltr"
                style={{ textAlign: "right" }}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-600 mb-1">
                البريد الإلكتروني
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full border border-slate-300 rounded p-2 text-xs outline-none focus:border-blue-500"
                dir="ltr"
                style={{ textAlign: "right" }}
              />
            </div>
            <div className="col-span-2">
              <label className="flex items-center gap-2 cursor-pointer mt-2">
                <input
                  type="checkbox"
                  checked={formData.isAuthorizedSigner}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      isAuthorizedSigner: e.target.checked,
                    })
                  }
                  className="w-4 h-4 accent-blue-600"
                />
                <span className="text-xs font-bold text-slate-700">
                  هذا الشخص معتمد للتوقيع المالي/الرسمي
                </span>
              </label>
            </div>
            <div className="col-span-2">
              <label className="block text-[10px] font-bold text-slate-600 mb-1">
                ملاحظات
              </label>
              <input
                type="text"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                className="w-full border border-slate-300 rounded p-2 text-xs outline-none focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={addContactMutation.isPending}
              className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded flex items-center gap-2 disabled:opacity-50"
            >
              {addContactMutation.isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}{" "}
              حفظ
            </button>
          </div>
        </form>
      )}

      {(!contacts || contacts.length === 0) && !isAdding ? (
        <div className="flex flex-col items-center justify-center py-10 text-slate-400">
          <Users className="w-12 h-12 mb-3 text-slate-300" />
          <div className="text-[13px] font-bold">لا توجد جهات اتصال مسجلة</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {contacts?.map((contact) => (
            <div
              key={contact.id}
              className={`p-4 rounded-xl border shadow-sm transition-colors relative group ${contact.isAuthorizedSigner ? "bg-emerald-50 border-emerald-200" : "bg-white border-slate-200 hover:border-blue-200"}`}
            >
              <button
                onClick={() => {
                  if (confirm("حذف جهة الاتصال؟"))
                    deleteContactMutation.mutate(contact.id);
                }}
                className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 p-1 transition-opacity"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-[14px] font-bold text-white shadow-inner ${contact.isAuthorizedSigner ? "bg-emerald-500" : "bg-slate-400"}`}
                  >
                    {contact.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-[13px] font-bold text-slate-800 pr-4">
                      {contact.name}
                    </div>
                    <div className="text-[11px] font-semibold text-slate-500">
                      {contact.position || "—"}
                    </div>
                  </div>
                </div>
                {contact.isAuthorizedSigner && (
                  <span className="flex items-center gap-1 px-2 py-1 bg-emerald-100 border border-emerald-200 text-emerald-700 text-[10px] font-bold rounded">
                    <UserCheck className="w-3 h-3" /> توقيع
                  </span>
                )}
              </div>
              <div className="grid grid-cols-1 gap-2 border-t border-slate-100 pt-2 mt-2">
                <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span style={{ fontFamily: "monospace", direction: "ltr" }}>
                    {contact.mobile}
                  </span>
                </div>
                {contact.email && (
                  <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600 truncate">
                    <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span
                      className="truncate"
                      style={{ fontFamily: "monospace", direction: "ltr" }}
                    >
                      {contact.email}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════
// Tab 3: Official Assets (بكامل وظائفها)
// ═══════════════════════════════════════════════

function TabOfficialAssets({ officeId, assets }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    type: "logo",
    label: "",
    content: "",
    file: null,
  });

  const addAssetMutation = useMutation({
    mutationFn: async (fd) =>
      api.post(`/intermediary-offices/${officeId}/assets`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      }),
    onSuccess: () => {
      toast.success("تم رفع المكون بنجاح");
      queryClient.invalidateQueries(["intermediary-offices"]);
      setIsAdding(false);
      setFormData({ type: "logo", label: "", content: "", file: null });
    },
  });

  const deleteAssetMutation = useMutation({
    mutationFn: async (assetId) =>
      api.delete(`/intermediary-offices/assets/${assetId}`),
    onSuccess: () => {
      toast.success("تم حذف المكون");
      queryClient.invalidateQueries(["intermediary-offices"]);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.label) return toast.error("يرجى إدخال اسم المكون");
    if (!formData.file && !formData.content)
      return toast.error("يرجى إرفاق ملف أو كتابة نص");

    const fd = new FormData();
    fd.append("type", formData.type);
    fd.append("label", formData.label);
    fd.append("uploadedBy", user?.name || "مدير النظام");
    if (formData.content) fd.append("content", formData.content);
    if (formData.file) fd.append("file", formData.file);

    addAssetMutation.mutate(fd);
  };

  const assetGroups = [
    "logo",
    "stamp",
    "signature",
    "header",
    "footer",
    "background",
    "template",
  ]
    .map((type) => ({
      type,
      label: assetTypeLabels[type],
      items: assets?.filter((a) => a.type === type) || [],
    }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="text-[12px] font-bold text-slate-500">
          {assets?.length || 0} مكون رسمي
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
          >
            <UploadCloud className="w-3.5 h-3.5" /> رفع مكون جديد
          </button>
        )}
      </div>

      {isAdding && (
        <form
          onSubmit={handleSubmit}
          className="bg-white p-5 rounded-xl border border-blue-200 shadow-sm space-y-4 animate-in fade-in zoom-in-95"
        >
          <div className="text-[13px] font-bold text-blue-700 flex items-center gap-2">
            <UploadCloud className="w-4 h-4" /> رفع مكون رسمي جديد
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-600 mb-1">
                نوع المكون *
              </label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
                className="w-full border border-slate-300 rounded p-2 text-xs outline-none focus:border-blue-500 font-bold bg-slate-50"
              >
                {Object.entries(assetTypeLabels).map(([val, lbl]) => (
                  <option key={val} value={val}>
                    {lbl}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-600 mb-1">
                وصف أو اسم المكون *
              </label>
              <input
                type="text"
                value={formData.label}
                onChange={(e) =>
                  setFormData({ ...formData, label: e.target.value })
                }
                placeholder="مثال: الختم الرسمي 2025"
                className="w-full border border-slate-300 rounded p-2 text-xs outline-none focus:border-blue-500"
              />
            </div>

            {/* إدخال نص (مفيد للهيدر/الفوتر) */}
            <div className="col-span-2">
              <label className="block text-[10px] font-bold text-slate-600 mb-1">
                محتوى نصي (للهيدر والفوتر الديناميكي)
              </label>
              <textarea
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                placeholder="أدخل النص هنا إذا لم يكن المكون عبارة عن صورة..."
                className="w-full border border-slate-300 rounded p-2 text-xs outline-none focus:border-blue-500 min-h-[60px]"
              />
            </div>

            {/* رفع ملف */}
            <div className="col-span-2">
              <label className="block text-[10px] font-bold text-slate-600 mb-1">
                إرفاق صورة/ملف
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-blue-300 bg-blue-50 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-100 transition-colors"
              >
                <UploadCloud className="w-6 h-6 text-blue-500 mb-2" />
                <span className="text-xs font-bold text-blue-700">
                  {formData.file ? formData.file.name : "اضغط لاختيار ملف"}
                </span>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={(e) =>
                    setFormData({ ...formData, file: e.target.files[0] })
                  }
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={addAssetMutation.isPending}
              className="px-6 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded flex items-center gap-2 disabled:opacity-50"
            >
              {addAssetMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}{" "}
              اعتماد المكون
            </button>
          </div>
        </form>
      )}

      {(!assets || assets.length === 0) && !isAdding ? (
        <div className="flex flex-col items-center justify-center py-10 text-slate-400">
          <Palette className="w-12 h-12 mb-3 text-slate-300" />
          <div className="text-[13px] font-bold">
            لا توجد مكونات رسمية مسجلة
          </div>
        </div>
      ) : (
        assetGroups.map((group) => (
          <div key={group.type}>
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-200">
              <AssetTypeIcon
                type={group.type}
                className="w-4 h-4 text-slate-500"
              />
              <span className="text-[13px] font-bold text-slate-700">
                {group.label}
              </span>
              <span className="text-[11px] font-bold text-slate-400">
                ({group.items.length})
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {group.items.map((asset) => (
                <div
                  key={asset.id}
                  className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm flex items-start gap-3 relative group"
                >
                  <button
                    onClick={() => {
                      if (confirm("حذف المكون نهائياً؟"))
                        deleteAssetMutation.mutate(asset.id);
                    }}
                    className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:text-red-600 bg-red-50 rounded transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <div className="w-12 h-12 rounded-lg bg-slate-100 flex flex-col items-center justify-center shrink-0">
                    <AssetTypeIcon type={asset.type} className="w-6 h-6 mb-1" />
                    <span className="text-[8px] font-mono text-slate-400">
                      v{asset.version}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="text-[12px] font-bold text-slate-800 truncate mb-1">
                      {asset.label}
                    </div>
                    {asset.fileName && (
                      <div className="text-[10px] text-blue-600 font-mono truncate bg-blue-50 px-1 py-0.5 rounded w-max mb-1">
                        {asset.fileName}
                      </div>
                    )}
                    {asset.content && (
                      <div className="text-[10px] text-slate-600 bg-slate-50 p-1.5 rounded line-clamp-2 border border-slate-100 mb-1">
                        {asset.content}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-[9px] text-slate-400 mt-2 font-semibold">
                      <span>بواسطة: {asset.uploadedBy}</span>
                      <span>•</span>
                      <span className="font-mono">{asset.uploadedAt}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
// ═══════════════════════════════════════════════
// Tab 4: Intermediary Links (بكامل وظائفها)
// ═══════════════════════════════════════════════

function TabIntermediaryLinks({ officeId, links }) {
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    intermediaryName: "",
    role: "مسؤول علاقات",
    commissionType: "percentage",
    commissionValue: "",
    isDefault: false,
  });

  const addLinkMutation = useMutation({
    mutationFn: async (data) =>
      api.post(`/intermediary-offices/${officeId}/intermediaries`, data),
    onSuccess: () => {
      toast.success("تم إضافة الوسيط المرتبط بنجاح");
      queryClient.invalidateQueries(["intermediary-offices"]);
      setIsAdding(false);
      setFormData({
        intermediaryName: "",
        role: "مسؤول علاقات",
        commissionType: "percentage",
        commissionValue: "",
        isDefault: false,
      });
    },
  });

  const deleteLinkMutation = useMutation({
    mutationFn: async (linkId) =>
      api.delete(`/intermediary-offices/intermediaries/${linkId}`),
    onSuccess: () => {
      toast.success("تم حذف الوسيط");
      queryClient.invalidateQueries(["intermediary-offices"]);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.intermediaryName || !formData.commissionValue)
      return toast.error("يرجى إدخال اسم الوسيط وقيمة العمولة");
    addLinkMutation.mutate(formData);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <div className="text-[12px] font-bold text-slate-500">
          {links?.length || 0} وسيط مرتبط
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> إضافة وسيط
          </button>
        )}
      </div>

      {isAdding && (
        <form
          onSubmit={handleSubmit}
          className="bg-white p-4 rounded-xl border border-blue-200 shadow-sm space-y-3 animate-in fade-in zoom-in-95"
        >
          <div className="text-[12px] font-bold text-blue-700 mb-2">
            ربط وسيط جديد بالمكتب
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 md:col-span-1">
              <label className="block text-[10px] font-bold text-slate-600 mb-1">
                اسم الوسيط *
              </label>
              <input
                type="text"
                value={formData.intermediaryName}
                onChange={(e) =>
                  setFormData({ ...formData, intermediaryName: e.target.value })
                }
                className="w-full border border-slate-300 rounded p-2 text-xs outline-none focus:border-blue-500"
                placeholder="مثال: عبدالله السبيعي"
              />
            </div>
            <div className="col-span-2 md:col-span-1">
              <label className="block text-[10px] font-bold text-slate-600 mb-1">
                الدور
              </label>
              <select
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
                className="w-full border border-slate-300 rounded p-2 text-xs outline-none focus:border-blue-500 font-bold"
              >
                <option value="مسؤول علاقات">مسؤول علاقات</option>
                <option value="محصل">محصل</option>
                <option value="مندوب متابعة">مندوب متابعة</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-600 mb-1">
                نوع العمولة
              </label>
              <select
                value={formData.commissionType}
                onChange={(e) =>
                  setFormData({ ...formData, commissionType: e.target.value })
                }
                className="w-full border border-slate-300 rounded p-2 text-xs outline-none focus:border-blue-500 font-bold"
              >
                <option value="percentage">نسبة مئوية (%)</option>
                <option value="fixed">مبلغ ثابت (ر.س)</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-600 mb-1">
                القيمة *
              </label>
              <input
                type="number"
                value={formData.commissionValue}
                onChange={(e) =>
                  setFormData({ ...formData, commissionValue: e.target.value })
                }
                className="w-full border border-slate-300 rounded p-2 text-xs font-mono outline-none focus:border-blue-500"
                placeholder="0"
              />
            </div>
            <div className="col-span-2">
              <label className="flex items-center gap-2 cursor-pointer mt-2">
                <input
                  type="checkbox"
                  checked={formData.isDefault}
                  onChange={(e) =>
                    setFormData({ ...formData, isDefault: e.target.checked })
                  }
                  className="w-4 h-4 accent-blue-600"
                />
                <span className="text-xs font-bold text-slate-700">
                  تعيين كوسيط افتراضي لهذا المكتب (تلقائي)
                </span>
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded font-bold"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={addLinkMutation.isPending}
              className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded flex items-center gap-2 disabled:opacity-50"
            >
              {addLinkMutation.isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}{" "}
              ربط الوسيط
            </button>
          </div>
        </form>
      )}

      {(!links || links.length === 0) && !isAdding ? (
        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
          <Link2 className="w-12 h-12 mb-3 text-slate-300" />
          <div className="text-[14px] font-bold">لا توجد وسطاء مرتبطون</div>
          <p className="text-[12px] font-semibold text-slate-400 mt-1">
            أضف الوسطاء المرتبطين بهذا المكتب لتسهيل الحسابات
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {links?.map((link) => (
            <div
              key={link.id}
              className={`p-4 rounded-xl border shadow-sm relative group transition-colors ${
                link.isDefault
                  ? "bg-blue-50/50 border-blue-200"
                  : "bg-white border-slate-200 hover:border-blue-200"
              }`}
            >
              <button
                onClick={() => {
                  if (confirm("فك ارتباط هذا الوسيط بالمكتب؟"))
                    deleteLinkMutation.mutate(link.id);
                }}
                className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 p-1 transition-opacity"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-[14px] font-bold text-white shadow-inner ${
                      link.isDefault ? "bg-blue-500" : "bg-slate-400"
                    }`}
                  >
                    {link.intermediaryName.charAt(0)}
                  </div>
                  <div>
                    <div className="text-[13px] font-bold text-slate-800 pr-4">
                      {link.intermediaryName}
                    </div>
                    <div className="text-[11px] font-semibold text-slate-500">
                      {link.role}
                    </div>
                  </div>
                </div>
                {link.isDefault && (
                  <span className="flex items-center gap-1 px-2 py-1 bg-blue-100 border border-blue-200 text-blue-700 font-bold text-[10px] rounded">
                    <Star className="w-3 h-3 fill-current" /> افتراضي
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 text-[11px] bg-slate-50 p-2 rounded border border-slate-100">
                <div>
                  <span className="font-semibold text-slate-500">
                    نوع العمولة:
                  </span>
                  <span className="font-bold text-slate-700 mr-1">
                    {link.commissionType === "percentage"
                      ? "نسبة مئوية"
                      : "مبلغ ثابت"}
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-slate-500">القيمة:</span>
                  <span className="font-bold text-blue-700 mr-1 text-xs">
                    {link.commissionType === "percentage"
                      ? `${link.commissionValue}%`
                      : `${link.commissionValue} ر.س`}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════
// Tab 5: Transactions
// ═══════════════════════════════════════════════

function TabTransactions({ transactions, officeName }) {
  if (!transactions || transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-slate-400">
        <TrendingUp className="w-12 h-12 mb-3 text-slate-300" />
        <div className="text-[14px] font-bold">لا توجد معاملات مرتبطة</div>
        <p className="text-[12px] font-semibold text-slate-400 mt-1">
          لم يتم تسجيل معاملات مخصصة لهذا المكتب في النظام بعد
        </p>
      </div>
    );
  }

  const stats = {
    total: transactions.length,
    completed: transactions.filter((t) => t.status === "مكتملة").length,
    inProgress: transactions.filter((t) => t.status === "جارية").length, // في النظام هي "جارية" بدلاً من قيد العمل
    frozen: transactions.filter((t) => t.status === "مجمّدة").length,
    totalAmount: transactions.reduce((sum, t) => sum + (t.totalFees || 0), 0),
  };

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <div className="p-3 bg-white shadow-sm rounded-xl border border-slate-200">
          <div className="text-[10px] font-bold text-slate-500 mb-1">
            إجمالي المعاملات
          </div>
          <div className="text-[18px] font-black text-slate-800">
            {stats.total}
          </div>
        </div>
        <div className="p-3 bg-emerald-50 shadow-sm rounded-xl border border-emerald-200">
          <div className="text-[10px] font-bold text-emerald-600 mb-1">
            مكتملة
          </div>
          <div className="text-[18px] font-black text-emerald-700">
            {stats.completed}
          </div>
        </div>
        <div className="p-3 bg-amber-50 shadow-sm rounded-xl border border-amber-200">
          <div className="text-[10px] font-bold text-amber-600 mb-1">جارية</div>
          <div className="text-[18px] font-black text-amber-700">
            {stats.inProgress}
          </div>
        </div>
        <div className="p-3 bg-blue-50 shadow-sm rounded-xl border border-blue-200">
          <div className="text-[10px] font-bold text-blue-600 mb-1">
            إجمالي القيمة
          </div>
          <div className="text-[14px] font-black font-mono text-blue-700">
            {stats.totalAmount.toLocaleString("ar-SA")} ر.س
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="space-y-2">
        <div className="text-[12px] font-bold text-slate-500 mb-2">
          {transactions.length} معاملة مرتبطة
        </div>
        {transactions.map((tx) => (
          <div
            key={tx.id}
            className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md hover:border-blue-300 transition-all"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 bg-blue-100 border border-blue-200 text-blue-700 text-[10px] rounded font-mono font-bold">
                    {tx.transactionCode}
                  </span>
                  <TransactionStatusBadge status={tx.status} />
                </div>
                <div className="text-[12px] font-bold text-slate-800 mb-1">
                  {tx.category || "معاملة عامة"}
                </div>
                <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-500">
                  <span>{tx.internalName || tx.client?.nameAr || "عميل"}</span>
                </div>
              </div>
              <div className="text-left">
                <div className="text-[13px] font-black font-mono text-blue-700 mb-1">
                  {(tx.totalFees || 0).toLocaleString("ar-SA")} ر.س
                </div>
                <div className="text-[10px] text-slate-400 font-mono font-semibold">
                  {new Date(tx.createdAt).toLocaleDateString("en-GB")}
                </div>
              </div>
            </div>

            {tx.description && (
              <div className="text-[10px] font-semibold text-slate-500 bg-slate-50 border border-slate-100 px-2 py-1 rounded mb-2">
                {tx.description}
              </div>
            )}

            <div className="flex items-center justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() =>
                  toast.info(
                    `سجل المعاملة ${tx.transactionCode} موجود في نظام المعاملات الرئيسي`,
                  )
                }
                className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold text-blue-600 hover:bg-blue-50 rounded transition-colors"
              >
                <ExternalLink className="w-3 h-3" /> استعراض في نظام المعاملات
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Screen860IntermediaryOffices;
