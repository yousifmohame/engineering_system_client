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
  ExternalLink,
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
      className="flex h-full flex-col overflow-hidden bg-[radial-gradient(circle_at_top_left,#eef7f6,transparent_32%),linear-gradient(135deg,#fbf8f1_0%,#ffffff_48%,#f3f7f6_100%)] p-2.5 md:p-3"
      style={{ direction: "rtl", fontFamily: "Tajawal, sans-serif" }}
    >
      {/* ═══ Brokers-like compact header ═══ */}
      <div
        className="
          relative mb-2 shrink-0 overflow-hidden rounded-[22px]
          border border-[#c5983c]/25
          bg-gradient-to-l from-[#08111c] via-[#0f3448] to-[#123f59]
          p-2.5 shadow-[0_12px_32px_rgba(18,63,89,0.16)]
        "
      >
        <div className="pointer-events-none absolute right-[-55px] top-[-60px] h-32 w-32 rounded-full bg-[#e2bf74]/20 blur-3xl" />
        <div className="pointer-events-none absolute left-[-60px] bottom-[-70px] h-36 w-36 rounded-full bg-cyan-300/15 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-2 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#e2bf74] text-[#08111c]">
              <Building2 className="h-5 w-5" />
            </div>

            <div>
              <h1 className="text-lg font-black leading-tight text-white">
                سجل المكاتب الوسيطة
              </h1>
              <p className="mt-0.5 text-[11px] font-bold leading-tight text-white/55">
                {filteredOffices.length} مكتب ظاهر من أصل {stats.total} مكتب مسجل في النظام
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="rounded-xl border border-white/10 bg-white/10 px-3 py-1.5 text-center">
              <p className="text-[9px] font-bold text-white/55">نشط</p>
              <p className="text-sm font-black text-emerald-100">{stats.active}</p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/10 px-3 py-1.5 text-center">
              <p className="text-[9px] font-bold text-white/55">موقوف</p>
              <p className="text-sm font-black text-rose-100">{stats.suspended}</p>
            </div>

            <div className="rounded-xl border border-[#e2bf74]/30 bg-[#e2bf74]/15 px-3 py-1.5 text-center">
              <p className="text-[9px] font-bold text-[#e2bf74]">رصيد الذمم</p>
              <p className="text-[11px] font-black text-[#ffe5a7]">
                {stats.totalReceivable.toLocaleString("ar-SA")} ر.س
              </p>
            </div>

            <div className="relative w-full sm:w-auto">
              <Search className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/45" />
              <input
                type="text"
                placeholder="بحث بالاسم أو الكود أو المدينة..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="
                  h-9 w-full sm:w-[260px] rounded-xl border border-white/15 bg-white/10
                  pr-9 pl-3 text-[11px] font-bold text-white outline-none
                  placeholder:text-white/45 focus:border-[#e2bf74]/70 focus:bg-white/15
                "
              />
            </div>

            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="
                flex h-9 items-center gap-2 rounded-xl
                bg-white px-3.5 text-[11px] font-black text-[#123f59]
                shadow-[0_10px_24px_rgba(255,255,255,0.12)]
                transition hover:-translate-y-0.5 hover:bg-[#fbf8f1]
              "
            >
              <Plus className="h-3.5 w-3.5 text-[#c5983c]" />
              إضافة مكتب
            </button>
          </div>
        </div>
      </div>

      {/* ═══ Compact filters bar ═══ */}
      <div className="mb-2 flex shrink-0 flex-wrap items-center gap-1.5 rounded-[18px] border border-[#d8b46a]/25 bg-white/80 px-3 py-2 shadow-sm">
        <span className="ml-1 text-[10px] font-black text-[#64748b]">
          الحالة:
        </span>

        {[
          { value: "all", label: "الكل" },
          { value: "نشط", label: "نشط" },
          { value: "موقوف", label: "موقوف" },
          { value: "مجمد", label: "مجمد" },
        ].map((button) => (
          <button
            key={button.value}
            type="button"
            onClick={() => setFilterStatus(button.value)}
            className={`rounded-xl border px-3 py-1.5 text-[10px] font-black transition ${
              filterStatus === button.value
                ? "border-[#123f59] bg-[#123f59] text-white shadow-[0_8px_20px_rgba(18,63,89,0.16)]"
                : "border-[#e8ddc8] bg-white text-[#123f59] hover:bg-[#fbf8f1]"
            }`}
          >
            {button.label}
          </button>
        ))}

        <span className="mr-2 ml-1 text-[10px] font-black text-[#64748b]">
          المدينة:
        </span>

        <select
          value={filterCity}
          onChange={(e) => setFilterCity(e.target.value)}
          className="h-8 rounded-xl border border-[#e8ddc8] bg-white px-3 text-[10px] font-black text-[#123f59] outline-none transition focus:border-[#0e7490]"
        >
          <option value="all">جميع المدن</option>
          {cities.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={handleCopyTable}
          className="mr-auto inline-flex h-8 items-center gap-1.5 rounded-xl border border-[#d8b46a]/50 bg-[#fbf8f1] px-3 text-[10px] font-black text-[#123f59] transition hover:bg-white"
          title="نسخ الجدول"
        >
          <Copy className="h-3.5 w-3.5" />
          نسخ الجدول
        </button>
      </div>

      {/* ═══ Brokers-like table ═══ */}
      <div
        className="
          min-h-0 flex-1 overflow-hidden rounded-[20px]
          border border-[#d8b46a]/30 bg-white
          shadow-[0_10px_28px_rgba(18,63,89,0.08)]
        "
      >
        <div className="custom-scrollbar-slim h-full overflow-y-auto overflow-x-auto xl:overflow-x-hidden">
          <table dir="rtl" className="w-full min-w-[980px] table-fixed text-right text-[12px] xl:min-w-0">
            <colgroup>
              <col className="w-[27%]" />
              <col className="w-[9%]" />
              <col className="w-[9%]" />
              <col className="w-[10%]" />
              <col className="w-[11%]" />
              <col className="w-[10%]" />
              <col className="w-[9%]" />
              <col className="w-[6%]" />
              <col className="w-[9%]" />
            </colgroup>

            <thead className="sticky top-0 z-10 bg-[#0f3448] text-white shadow-sm">
              <tr className="h-[36px]">
                <th className="border-l border-white/10 px-2 text-[10px] font-black">
                  المكتب
                </th>
                <th className="border-l border-white/10 px-2 text-[10px] font-black">
                  المدينة
                </th>
                <th className="border-l border-white/10 px-2 text-[10px] font-black">
                  الحالة
                </th>
                <th className="border-l border-white/10 px-2 text-[10px] font-black">
                  النوع
                </th>
                <th className="border-l border-white/10 px-2 text-[10px] font-black">
                  المسؤول
                </th>
                <th className="border-l border-white/10 px-2 text-[10px] font-black">
                  الجوال
                </th>
                <th className="border-l border-white/10 px-2 text-[10px] font-black">
                  الذمم
                </th>
                <th className="border-l border-white/10 px-2 text-center text-[10px] font-black">
                  معاملات
                </th>
                <th className="px-1.5 text-center text-[10px] font-black">
                  إجراءات
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#e8ddc8]/70">
              {isLoading ? (
                <tr>
                  <td colSpan="9" className="py-10 text-center">
                    <Loader2 className="mx-auto h-7 w-7 animate-spin text-[#c5983c]" />
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
                    className={`h-[42px] cursor-pointer transition-colors hover:bg-cyan-50/45 ${
                      idx % 2 === 1 ? "bg-[#fbf8f1]/55" : "bg-white"
                    }`}
                  >
                    <td className="border-l border-[#e8ddc8]/70 px-2">
                      <div className="flex items-center gap-2">
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[#123f59] text-white">
                          <Building2 className="h-3.5 w-3.5 text-[#e2bf74]" />
                        </span>

                        <div className="min-w-0">
                          <div className="truncate text-[12px] font-black text-[#123f59]">
                            {office.nameAr || "—"}
                          </div>

                          <div className="mt-1 flex flex-wrap items-center gap-1">
                            <span className="rounded-xl border border-[#d8b46a]/35 bg-[#fbf8f1] px-1.5 py-0.5 font-mono text-[8px] font-black text-[#60738f]">
                              {office.code || "—"}
                            </span>
                            {office.nameEn && (
                              <span className="max-w-[120px] truncate text-[9px] font-bold text-[#8da0bb]">
                                {office.nameEn}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="border-l border-[#e8ddc8]/70 px-2 text-[10px] font-black text-[#334155]">
                      <span className="block truncate">{office.city || "—"}</span>
                    </td>

                    <td className="border-l border-[#e8ddc8]/70 px-2">
                      <StatusBadge status={office.status} />
                    </td>

                    <td className="border-l border-[#e8ddc8]/70 px-2">
                      <RelTypeBadge type={office.relationshipType} />
                    </td>

                    <td className="border-l border-[#e8ddc8]/70 px-2 text-[10px] font-black text-[#334155]">
                      <span className="block truncate">{office.contactPerson || "—"}</span>
                    </td>

                    <td className="border-l border-[#e8ddc8]/70 px-2 font-mono text-[10px] font-bold text-[#334155]" dir="ltr">
                      <span className="block truncate">{office.contactMobile || "—"}</span>
                    </td>

                    <td className="border-l border-[#e8ddc8]/70 px-2 text-[10px] font-black">
                      <span className={office.receivableBalance > 0 ? "text-amber-600" : "text-[#8da0bb]"}>
                        {office.receivableBalance > 0
                          ? `${office.receivableBalance.toLocaleString("ar-SA")} ر.س`
                          : "—"}
                      </span>
                    </td>

                    <td className="border-l border-[#e8ddc8]/70 px-2 text-center">
                      <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-xl bg-cyan-50 px-2 text-[10px] font-black text-cyan-700">
                        {office.transactions?.length || 0}
                      </span>
                    </td>

                    <td className="px-1.5 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedOffice(office);
                          setShowDetailsDialog(true);
                        }}
                        className="inline-flex h-6 items-center gap-0.5 rounded-lg bg-cyan-50 px-1.5 text-[8px] font-black text-cyan-700 transition hover:bg-cyan-600 hover:text-white"
                        type="button"
                        title="عرض التفاصيل"
                      >
                        <Eye className="h-2.5 w-2.5" />
                        عرض
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="py-12 text-center">
                    <div className="mx-auto mb-3 grid h-16 w-16 place-items-center rounded-3xl border border-[#d8b46a]/35 bg-[#f8efe0] text-[#c5983c]">
                      <Search className="h-8 w-8" />
                    </div>
                    <p className="text-sm font-black text-[#123f59]">
                      لا توجد مكاتب مطابقة
                    </p>
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


function OfficeModalSection({ title, subtitle, icon, children }) {
  return (
    <section className="overflow-hidden rounded-[20px] border border-[#d8b46a]/25 bg-white shadow-[0_10px_28px_rgba(18,63,89,0.055)]">
      <div className="flex items-center gap-2 border-b border-[#e8ddc8]/70 bg-gradient-to-l from-[#fbf8f1] to-white px-4 py-3">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[#123f59] text-[#e2bf74]">
          {icon}
        </span>
        <div>
          <div className="text-[13px] font-black text-[#123f59]">{title}</div>
          {subtitle && (
            <div className="mt-0.5 text-[10px] font-bold text-[#8da0bb]">
              {subtitle}
            </div>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 p-4 md:grid-cols-2">{children}</div>
    </section>
  );
}

function OfficeInputField({
  label,
  required,
  value,
  onChange,
  placeholder,
  type = "text",
  dir,
  as = "input",
  rows = 2,
  className = "",
}) {
  const baseClass =
    "w-full rounded-xl border border-[#e8ddc8] bg-white px-3 text-[12px] font-bold text-[#123f59] outline-none transition placeholder:text-[#9aa8bd] focus:border-[#0e7490] focus:ring-2 focus:ring-[#0e7490]/10";
  const fieldClass =
    as === "textarea" ? `${baseClass} min-h-[70px] py-2` : `${baseClass} h-9`;

  return (
    <div className={className}>
      <label className="mb-1 block text-[10px] font-black text-[#60738f]">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      {as === "textarea" ? (
        <textarea
          rows={rows}
          value={value || ""}
          onChange={onChange}
          placeholder={placeholder}
          className={fieldClass}
          dir={dir}
          style={dir === "ltr" ? { textAlign: "right" } : undefined}
        />
      ) : (
        <input
          type={type}
          value={value || ""}
          onChange={onChange}
          placeholder={placeholder}
          className={fieldClass}
          dir={dir}
          style={dir === "ltr" ? { textAlign: "right" } : undefined}
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 animate-in fade-in"
      dir="rtl"
      onClick={onClose}
    >
      <div
        className="flex h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-[24px] border border-[#d8b46a]/25 bg-white shadow-[0_24px_70px_rgba(2,12,23,0.28)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative shrink-0 overflow-hidden bg-gradient-to-l from-[#08111c] via-[#0f3448] to-[#123f59] px-5 py-3 text-white">
          <div className="pointer-events-none absolute right-[-55px] top-[-60px] h-32 w-32 rounded-full bg-[#e2bf74]/20 blur-3xl" />
          <div className="pointer-events-none absolute left-[-60px] bottom-[-70px] h-36 w-36 rounded-full bg-cyan-300/15 blur-3xl" />

          <div className="relative z-10 flex items-center justify-between gap-3" style={{ direction: "ltr" }}>
            <button
              onClick={onClose}
              className="inline-flex h-9 items-center gap-2 rounded-xl bg-white/10 px-3 text-[11px] font-black text-white transition hover:bg-rose-500"
              type="button"
            >
              <X className="h-5 w-5" />
              إغلاق
            </button>

            <div className="flex min-w-0 items-center gap-3 text-right" dir="rtl">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#e2bf74] text-[#08111c]">
                <Building2 className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <h2 className="truncate text-[18px] font-black leading-tight text-white">
                  إضافة مكتب وسيط جديد
                </h2>
                <p className="mt-0.5 text-[10px] font-bold text-white/60">
                  أدخل بيانات المكتب الأساسية والتواصل والعلاقة داخل النظام.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-[linear-gradient(135deg,#fbf8f1_0%,#ffffff_55%,#f3f7f6_100%)] p-4 custom-scrollbar-slim">
          <div className="space-y-4">
            <OfficeModalSection
              title="بيانات التعريف"
              subtitle="البيانات الرسمية للمكتب كما ستظهر في السجلات والتقارير."
              icon={<Building2 className="h-4 w-4" />}
            >
              <OfficeInputField
                label="الاسم التجاري (عربي)"
                required
                value={formData.nameAr}
                onChange={(e) => setFormData((prev) => ({ ...prev, nameAr: e.target.value }))}
                placeholder="مثال: مكتب الحلول الهندسية"
              />
              <OfficeInputField
                label="الاسم التجاري (إنجليزي)"
                value={formData.nameEn}
                onChange={(e) => setFormData((prev) => ({ ...prev, nameEn: e.target.value }))}
                placeholder="Engineering Solutions"
              />
              <OfficeInputField
                label="السجل التجاري"
                required
                value={formData.commercialRegister}
                onChange={(e) => setFormData((prev) => ({ ...prev, commercialRegister: e.target.value }))}
                placeholder="1010456789"
                dir="ltr"
              />
              <OfficeInputField
                label="رقم الترخيص الهندسي"
                value={formData.engineeringLicense}
                onChange={(e) => setFormData((prev) => ({ ...prev, engineeringLicense: e.target.value }))}
                placeholder="ENG-2024-1122"
                dir="ltr"
              />
              <OfficeInputField
                label="الرقم الضريبي (VAT)"
                value={formData.vatNumber}
                onChange={(e) => setFormData((prev) => ({ ...prev, vatNumber: e.target.value }))}
                placeholder="310456789000003"
                dir="ltr"
              />
              <div>
                <label className="mb-1 block text-[10px] font-black text-[#60738f]">
                  حالة الضريبة
                </label>
                <select
                  value={formData.vatStatus}
                  onChange={(e) => setFormData((prev) => ({ ...prev, vatStatus: e.target.value }))}
                  className="h-9 w-full rounded-xl border border-[#e8ddc8] bg-white px-3 text-[12px] font-bold text-[#123f59] outline-none transition focus:border-[#0e7490] focus:ring-2 focus:ring-[#0e7490]/10"
                >
                  <option value="مسجل">مسجل</option>
                  <option value="غير مسجل">غير مسجل</option>
                </select>
              </div>
            </OfficeModalSection>

            <OfficeModalSection
              title="العنوان والتواصل"
              subtitle="بيانات الوصول والتواصل مع المكتب."
              icon={<MapPin className="h-4 w-4" />}
            >
              <OfficeInputField
                label="العنوان الوطني"
                value={formData.nationalAddress}
                onChange={(e) => setFormData((prev) => ({ ...prev, nationalAddress: e.target.value }))}
                placeholder="طريق الملك فهد، حي العليا، مبنى 14"
                className="md:col-span-2"
              />
              <OfficeInputField
                label="المدينة"
                required
                value={formData.city}
                onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
                placeholder="الرياض"
              />
              <OfficeInputField
                label="المنطقة"
                value={formData.region}
                onChange={(e) => setFormData((prev) => ({ ...prev, region: e.target.value }))}
                placeholder="منطقة الرياض"
              />
              <OfficeInputField
                label="البريد الإلكتروني"
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="info@example.sa"
                type="email"
                dir="ltr"
              />
              <OfficeInputField
                label="الهاتف"
                value={formData.phone}
                onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                placeholder="0114567890"
                type="tel"
                dir="ltr"
              />
              <OfficeInputField
                label="واتساب"
                value={formData.whatsapp}
                onChange={(e) => setFormData((prev) => ({ ...prev, whatsapp: e.target.value }))}
                placeholder="0551234567"
                type="tel"
                dir="ltr"
              />
              <OfficeInputField
                label="الموقع الإلكتروني"
                value={formData.website}
                onChange={(e) => setFormData((prev) => ({ ...prev, website: e.target.value }))}
                placeholder="www.example.sa"
                type="url"
                dir="ltr"
              />
            </OfficeModalSection>

            <OfficeModalSection
              title="التخصصات"
              subtitle="أضف تخصصات المكتب لتسهيل البحث والتصنيف."
              icon={<Briefcase className="h-4 w-4" />}
            >
              <div className="md:col-span-2">
                <label className="mb-1 block text-[10px] font-black text-[#60738f]">
                  إضافة تخصص
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleAddSpecialization()}
                    className="h-9 flex-1 rounded-xl border border-[#e8ddc8] bg-white px-3 text-[12px] font-bold text-[#123f59] outline-none transition placeholder:text-[#9aa8bd] focus:border-[#0e7490] focus:ring-2 focus:ring-[#0e7490]/10"
                    placeholder="أدخل تخصص واضغط Enter"
                  />
                  <button
                    onClick={handleAddSpecialization}
                    className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-[#0e7490] px-3 text-[11px] font-black text-white transition hover:bg-[#15536f]"
                    type="button"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    إضافة
                  </button>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {formData.specializations?.length > 0 ? (
                    formData.specializations.map((spec, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-[#0e7490]/15 bg-[#eef7f6] px-2.5 py-1 text-[11px] font-black text-[#0e7490]"
                      >
                        {spec}
                        <button
                          onClick={() => handleRemoveSpecialization(spec)}
                          className="rounded-md p-0.5 transition hover:bg-[#0e7490]/10"
                          type="button"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))
                  ) : (
                    <span className="rounded-xl border border-dashed border-[#e8ddc8] bg-[#fbf8f1] px-3 py-2 text-[11px] font-bold text-[#8da0bb]">
                      لا توجد تخصصات مضافة
                    </span>
                  )}
                </div>
              </div>
            </OfficeModalSection>

            <OfficeModalSection
              title="نوع العلاقة والحالة"
              subtitle="حدد صفة المكتب داخل النظام والمسؤول عنه."
              icon={<Users className="h-4 w-4" />}
            >
              <div>
                <label className="mb-1 block text-[10px] font-black text-[#60738f]">
                  نوع العلاقة
                </label>
                <select
                  value={formData.relationshipType}
                  onChange={(e) => setFormData((prev) => ({ ...prev, relationshipType: e.target.value }))}
                  className="h-9 w-full rounded-xl border border-[#e8ddc8] bg-white px-3 text-[12px] font-bold text-[#123f59] outline-none transition focus:border-[#0e7490] focus:ring-2 focus:ring-[#0e7490]/10"
                >
                  <option value="وسيط">وسيط</option>
                  <option value="شريك">شريك</option>
                  <option value="مكتب تابع">مكتب تابع</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-[10px] font-black text-[#60738f]">
                  الحالة
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}
                  className="h-9 w-full rounded-xl border border-[#e8ddc8] bg-white px-3 text-[12px] font-bold text-[#123f59] outline-none transition focus:border-[#0e7490] focus:ring-2 focus:ring-[#0e7490]/10"
                >
                  <option value="نشط">نشط</option>
                  <option value="موقوف">موقوف</option>
                  <option value="مجمد">مجمد</option>
                </select>
              </div>

              <OfficeInputField
                label="اسم المسؤول"
                value={formData.contactPerson}
                onChange={(e) => setFormData((prev) => ({ ...prev, contactPerson: e.target.value }))}
                placeholder="م. خالد العتيبي"
              />
              <OfficeInputField
                label="جوال المسؤول"
                value={formData.contactMobile}
                onChange={(e) => setFormData((prev) => ({ ...prev, contactMobile: e.target.value }))}
                placeholder="0551234567"
                type="tel"
                dir="ltr"
              />

              {formData.status === "موقوف" && (
                <OfficeInputField
                  label="سبب الإيقاف"
                  value={formData.suspensionReason}
                  onChange={(e) => setFormData((prev) => ({ ...prev, suspensionReason: e.target.value }))}
                  as="textarea"
                  className="md:col-span-2"
                />
              )}

              <OfficeInputField
                label="ملاحظات داخلية"
                value={formData.internalNotes}
                onChange={(e) => setFormData((prev) => ({ ...prev, internalNotes: e.target.value }))}
                placeholder="ملاحظات إضافية..."
                as="textarea"
                className="md:col-span-2"
              />
            </OfficeModalSection>
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-between gap-2 border-t border-[#e8ddc8]/70 bg-white px-5 py-3">
          <div className="text-[10px] font-bold text-[#8da0bb]">
            الحقول المميزة بعلامة * إلزامية للحفظ.
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-[#e8ddc8] bg-[#fbf8f1] px-4 text-[11px] font-black text-[#60738f] transition hover:bg-white"
              type="button"
            >
              <X className="h-3.5 w-3.5" />
              إلغاء
            </button>
            <button
              onClick={handleSubmit}
              disabled={isPending}
              className="inline-flex h-9 items-center gap-2 rounded-xl bg-[#0e7490] px-5 text-[12px] font-black text-white shadow-[0_10px_24px_rgba(14,116,144,0.20)] transition hover:bg-[#15536f] disabled:opacity-50"
              type="button"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              حفظ المكتب
            </button>
          </div>
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
    if (!formData.nameAr || !formData.commercialRegister || !formData.city) {
      toast.error("يرجى إدخال البيانات الإلزامية");
      return;
    }

    onUpdate(formData);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 animate-in fade-in"
      dir="rtl"
      onClick={onClose}
    >
      <div
        className="flex h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-[24px] border border-[#d8b46a]/25 bg-white shadow-[0_24px_70px_rgba(2,12,23,0.28)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative shrink-0 overflow-hidden bg-gradient-to-l from-[#08111c] via-[#0f3448] to-[#123f59] px-5 py-3 text-white">
          <div className="pointer-events-none absolute right-[-55px] top-[-60px] h-32 w-32 rounded-full bg-[#e2bf74]/20 blur-3xl" />
          <div className="pointer-events-none absolute left-[-60px] bottom-[-70px] h-36 w-36 rounded-full bg-cyan-300/15 blur-3xl" />

          <div className="relative z-10 flex items-center justify-between gap-3" style={{ direction: "ltr" }}>
            <button
              onClick={onClose}
              className="inline-flex h-9 items-center gap-2 rounded-xl bg-white/10 px-3 text-[11px] font-black text-white transition hover:bg-rose-500"
              type="button"
            >
              <X className="h-5 w-5" />
              إغلاق
            </button>

            <div className="flex min-w-0 items-center gap-3 text-right" dir="rtl">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#e2bf74] text-[#08111c]">
                <Building2 className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <h2 className="truncate text-[18px] font-black leading-tight text-white">
                  تعديل بيانات المكتب
                </h2>
                <p className="mt-0.5 text-[10px] font-bold text-white/60">
                  حدّث بيانات المكتب الرسمية والتواصل والتصنيف.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-[linear-gradient(135deg,#fbf8f1_0%,#ffffff_55%,#f3f7f6_100%)] p-4 custom-scrollbar-slim">
          <div className="space-y-4">
            <OfficeModalSection
              title="بيانات التعريف"
              subtitle="البيانات الرسمية للمكتب كما ستظهر في السجلات والتقارير."
              icon={<Building2 className="h-4 w-4" />}
            >
              <OfficeInputField
                label="الاسم التجاري (عربي)"
                required
                value={formData.nameAr}
                onChange={(e) => setFormData((prev) => ({ ...prev, nameAr: e.target.value }))}
                placeholder="مثال: مكتب الحلول الهندسية"
              />
              <OfficeInputField
                label="الاسم التجاري (إنجليزي)"
                value={formData.nameEn}
                onChange={(e) => setFormData((prev) => ({ ...prev, nameEn: e.target.value }))}
                placeholder="Engineering Solutions"
              />
              <OfficeInputField
                label="السجل التجاري"
                required
                value={formData.commercialRegister}
                onChange={(e) => setFormData((prev) => ({ ...prev, commercialRegister: e.target.value }))}
                placeholder="1010456789"
                dir="ltr"
              />
              <OfficeInputField
                label="رقم الترخيص الهندسي"
                value={formData.engineeringLicense}
                onChange={(e) => setFormData((prev) => ({ ...prev, engineeringLicense: e.target.value }))}
                placeholder="ENG-2024-1122"
                dir="ltr"
              />
              <OfficeInputField
                label="الرقم الضريبي (VAT)"
                value={formData.vatNumber}
                onChange={(e) => setFormData((prev) => ({ ...prev, vatNumber: e.target.value }))}
                placeholder="310456789000003"
                dir="ltr"
              />
              <div>
                <label className="mb-1 block text-[10px] font-black text-[#60738f]">
                  حالة الضريبة
                </label>
                <select
                  value={formData.vatStatus}
                  onChange={(e) => setFormData((prev) => ({ ...prev, vatStatus: e.target.value }))}
                  className="h-9 w-full rounded-xl border border-[#e8ddc8] bg-white px-3 text-[12px] font-bold text-[#123f59] outline-none transition focus:border-[#0e7490] focus:ring-2 focus:ring-[#0e7490]/10"
                >
                  <option value="مسجل">مسجل</option>
                  <option value="غير مسجل">غير مسجل</option>
                </select>
              </div>
            </OfficeModalSection>

            <OfficeModalSection
              title="العنوان والتواصل"
              subtitle="بيانات الوصول والتواصل مع المكتب."
              icon={<MapPin className="h-4 w-4" />}
            >
              <OfficeInputField
                label="العنوان الوطني"
                value={formData.nationalAddress}
                onChange={(e) => setFormData((prev) => ({ ...prev, nationalAddress: e.target.value }))}
                placeholder="طريق الملك فهد، حي العليا، مبنى 14"
                className="md:col-span-2"
              />
              <OfficeInputField
                label="المدينة"
                required
                value={formData.city}
                onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
                placeholder="الرياض"
              />
              <OfficeInputField
                label="المنطقة"
                value={formData.region}
                onChange={(e) => setFormData((prev) => ({ ...prev, region: e.target.value }))}
                placeholder="منطقة الرياض"
              />
              <OfficeInputField
                label="البريد الإلكتروني"
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="info@example.sa"
                type="email"
                dir="ltr"
              />
              <OfficeInputField
                label="الهاتف"
                value={formData.phone}
                onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                placeholder="0114567890"
                type="tel"
                dir="ltr"
              />
              <OfficeInputField
                label="واتساب"
                value={formData.whatsapp}
                onChange={(e) => setFormData((prev) => ({ ...prev, whatsapp: e.target.value }))}
                placeholder="0551234567"
                type="tel"
                dir="ltr"
              />
              <OfficeInputField
                label="الموقع الإلكتروني"
                value={formData.website}
                onChange={(e) => setFormData((prev) => ({ ...prev, website: e.target.value }))}
                placeholder="www.example.sa"
                type="url"
                dir="ltr"
              />
            </OfficeModalSection>

            <OfficeModalSection
              title="التخصصات"
              subtitle="أضف تخصصات المكتب لتسهيل البحث والتصنيف."
              icon={<Briefcase className="h-4 w-4" />}
            >
              <div className="md:col-span-2">
                <label className="mb-1 block text-[10px] font-black text-[#60738f]">
                  إضافة تخصص
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleAddSpecialization()}
                    className="h-9 flex-1 rounded-xl border border-[#e8ddc8] bg-white px-3 text-[12px] font-bold text-[#123f59] outline-none transition placeholder:text-[#9aa8bd] focus:border-[#0e7490] focus:ring-2 focus:ring-[#0e7490]/10"
                    placeholder="أدخل تخصص واضغط Enter"
                  />
                  <button
                    onClick={handleAddSpecialization}
                    className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-[#0e7490] px-3 text-[11px] font-black text-white transition hover:bg-[#15536f]"
                    type="button"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    إضافة
                  </button>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {formData.specializations?.length > 0 ? (
                    formData.specializations.map((spec, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-[#0e7490]/15 bg-[#eef7f6] px-2.5 py-1 text-[11px] font-black text-[#0e7490]"
                      >
                        {spec}
                        <button
                          onClick={() => handleRemoveSpecialization(spec)}
                          className="rounded-md p-0.5 transition hover:bg-[#0e7490]/10"
                          type="button"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))
                  ) : (
                    <span className="rounded-xl border border-dashed border-[#e8ddc8] bg-[#fbf8f1] px-3 py-2 text-[11px] font-bold text-[#8da0bb]">
                      لا توجد تخصصات مضافة
                    </span>
                  )}
                </div>
              </div>
            </OfficeModalSection>

            <OfficeModalSection
              title="نوع العلاقة والحالة"
              subtitle="حدد صفة المكتب داخل النظام والمسؤول عنه."
              icon={<Users className="h-4 w-4" />}
            >
              <div>
                <label className="mb-1 block text-[10px] font-black text-[#60738f]">
                  نوع العلاقة
                </label>
                <select
                  value={formData.relationshipType}
                  onChange={(e) => setFormData((prev) => ({ ...prev, relationshipType: e.target.value }))}
                  className="h-9 w-full rounded-xl border border-[#e8ddc8] bg-white px-3 text-[12px] font-bold text-[#123f59] outline-none transition focus:border-[#0e7490] focus:ring-2 focus:ring-[#0e7490]/10"
                >
                  <option value="وسيط">وسيط</option>
                  <option value="شريك">شريك</option>
                  <option value="مكتب تابع">مكتب تابع</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-[10px] font-black text-[#60738f]">
                  الحالة
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}
                  className="h-9 w-full rounded-xl border border-[#e8ddc8] bg-white px-3 text-[12px] font-bold text-[#123f59] outline-none transition focus:border-[#0e7490] focus:ring-2 focus:ring-[#0e7490]/10"
                >
                  <option value="نشط">نشط</option>
                  <option value="موقوف">موقوف</option>
                  <option value="مجمد">مجمد</option>
                </select>
              </div>

              <OfficeInputField
                label="اسم المسؤول"
                value={formData.contactPerson}
                onChange={(e) => setFormData((prev) => ({ ...prev, contactPerson: e.target.value }))}
                placeholder="م. خالد العتيبي"
              />
              <OfficeInputField
                label="جوال المسؤول"
                value={formData.contactMobile}
                onChange={(e) => setFormData((prev) => ({ ...prev, contactMobile: e.target.value }))}
                placeholder="0551234567"
                type="tel"
                dir="ltr"
              />

              {formData.status === "موقوف" && (
                <OfficeInputField
                  label="سبب الإيقاف"
                  value={formData.suspensionReason}
                  onChange={(e) => setFormData((prev) => ({ ...prev, suspensionReason: e.target.value }))}
                  as="textarea"
                  className="md:col-span-2"
                />
              )}

              <OfficeInputField
                label="ملاحظات داخلية"
                value={formData.internalNotes}
                onChange={(e) => setFormData((prev) => ({ ...prev, internalNotes: e.target.value }))}
                placeholder="ملاحظات إضافية..."
                as="textarea"
                className="md:col-span-2"
              />
            </OfficeModalSection>
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-between gap-2 border-t border-[#e8ddc8]/70 bg-white px-5 py-3">
          <div className="text-[10px] font-bold text-[#8da0bb]">
            الحقول المميزة بعلامة * إلزامية للحفظ.
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-[#e8ddc8] bg-[#fbf8f1] px-4 text-[11px] font-black text-[#60738f] transition hover:bg-white"
              type="button"
            >
              <X className="h-3.5 w-3.5" />
              إلغاء
            </button>
            <button
              onClick={handleSubmit}
              disabled={false}
              className="inline-flex h-9 items-center gap-2 rounded-xl bg-[#0e7490] px-5 text-[12px] font-black text-white shadow-[0_10px_24px_rgba(14,116,144,0.20)] transition hover:bg-[#15536f] disabled:opacity-50"
              type="button"
            >
              <Save className="h-4 w-4" />
              تحديث المكتب
            </button>
          </div>
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

  const toNumber = (value) => Number(value || 0);
  const money = (value) => `${toNumber(value).toLocaleString("ar-SA")} ر.س`;
  const safe = (value) =>
    value === null || value === undefined || value === "" ? "—" : String(value);

  const escapeHtml = (value) =>
    safe(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  const stats = {
    totalTransactions: office.transactions?.length || 0,
    completedTransactions:
      office.transactions?.filter((t) => t.status === "مكتملة").length || 0,
    inProgressTransactions:
      office.transactions?.filter((t) => t.status === "قيد العمل").length || 0,
    pendingTransactions:
      office.transactions?.filter((t) => t.status === "معلقة").length || 0,
    totalRevenue:
      office.transactions?.reduce((sum, t) => sum + toNumber(t.amount), 0) || 0,
    completedRevenue:
      office.transactions
        ?.filter((t) => t.status === "مكتملة")
        .reduce((sum, t) => sum + toNumber(t.amount), 0) || 0,
    totalAssets: office.officialAssets?.length || 0,
    activeAssets: office.officialAssets?.filter((a) => a.isActive).length || 0,
  };

  const buildReportHtml = () => {
    const rows =
      office.transactions?.length > 0
        ? office.transactions
            .slice(0, 18)
            .map(
              (transaction) => `
                <tr>
                  <td>${escapeHtml(transaction.transactionCode || transaction.code)}</td>
                  <td>${escapeHtml(transaction.category || transaction.type || "عامة")}</td>
                  <td>${escapeHtml(transaction.status || "—")}</td>
                  <td>${escapeHtml(money(transaction.amount))}</td>
                  <td>${escapeHtml(
                    transaction.createdAt
                      ? new Date(transaction.createdAt).toLocaleDateString("ar-SA")
                      : "—",
                  )}</td>
                </tr>`,
            )
            .join("")
        : `<tr><td colspan="5" class="empty">لا توجد معاملات مرتبطة بهذا المكتب</td></tr>`;

    return `<!doctype html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8" />
  <title>تقرير شامل عن المكتب - ${escapeHtml(office.nameAr)}</title>
  <style>
    @page {
      size: A4;
      margin: 12mm;
    }

    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    body {
      margin: 0;
      background: #ffffff;
      color: #123f59;
      font-family: "Tajawal", "Arial", sans-serif;
      direction: rtl;
    }

    .page {
      width: 100%;
      min-height: 100vh;
      padding: 0;
    }

    .top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 18px;
      padding: 18px 20px;
      border-radius: 18px;
      background: linear-gradient(270deg, #08111c, #0f3448, #123f59);
      color: white;
      margin-bottom: 16px;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .logo {
      width: 54px;
      height: 54px;
      border-radius: 16px;
      background: #e2bf74;
      color: #08111c;
      display: grid;
      place-items: center;
      font-size: 26px;
      font-weight: 900;
    }

    h1 {
      margin: 0 0 5px;
      font-size: 22px;
      line-height: 1.25;
    }

    .subtitle {
      font-size: 12px;
      color: rgba(255,255,255,.72);
      font-weight: 700;
    }

    .meta {
      text-align: left;
      font-size: 11px;
      line-height: 1.9;
      color: rgba(255,255,255,.82);
      min-width: 210px;
    }

    .office-card {
      border: 1px solid #e8ddc8;
      border-radius: 18px;
      padding: 16px;
      margin-bottom: 16px;
      background: #fbf8f1;
    }

    .office-row {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;
      border-bottom: 1px solid #e8ddc8;
      padding-bottom: 12px;
      margin-bottom: 12px;
    }

    .office-name {
      font-size: 18px;
      font-weight: 900;
      color: #123f59;
      margin-bottom: 4px;
    }

    .office-en {
      font-size: 11px;
      font-weight: 700;
      color: #8da0bb;
    }

    .badges {
      display: flex;
      flex-wrap: wrap;
      gap: 7px;
      justify-content: flex-start;
    }

    .badge {
      border-radius: 10px;
      padding: 5px 9px;
      font-size: 10px;
      font-weight: 900;
      border: 1px solid #d8b46a;
      background: white;
      color: #123f59;
    }

    .code {
      background: #123f59;
      color: white;
      border-color: #123f59;
      direction: ltr;
      font-family: monospace;
    }

    .report-date {
      display: flex;
      gap: 20px;
      color: #60738f;
      font-size: 11px;
      font-weight: 700;
    }

    .section-title {
      margin: 16px 0 10px;
      font-size: 14px;
      font-weight: 900;
      color: #123f59;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .section-title::before {
      content: "";
      width: 6px;
      height: 18px;
      border-radius: 999px;
      background: #d8b46a;
      display: inline-block;
    }

    .grid-4 {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
    }

    .grid-3 {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
    }

    .stat {
      border: 1px solid #e8ddc8;
      border-radius: 14px;
      background: white;
      padding: 12px;
      min-height: 78px;
    }

    .stat-label {
      font-size: 10px;
      font-weight: 800;
      color: #8da0bb;
      margin-bottom: 8px;
    }

    .stat-value {
      font-size: 20px;
      font-weight: 900;
      color: #123f59;
    }

    .blue { background: #eef7ff; border-color: #d7e8ff; }
    .green { background: #eafaf3; border-color: #bdebd5; }
    .amber { background: #fff8e7; border-color: #f1df9c; }
    .red { background: #fff0f0; border-color: #ffd2d2; }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
      border: 1px solid #e8ddc8;
      border-radius: 16px;
      background: #fbf8f1;
      padding: 14px;
      margin-bottom: 16px;
    }

    .info-item {
      background: white;
      border: 1px solid #eee3cf;
      border-radius: 12px;
      padding: 10px;
      min-height: 54px;
    }

    .info-label {
      font-size: 10px;
      font-weight: 800;
      color: #8da0bb;
      margin-bottom: 5px;
    }

    .info-value {
      font-size: 12px;
      font-weight: 900;
      color: #123f59;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      border: 1px solid #e8ddc8;
      border-radius: 14px;
      overflow: hidden;
      font-size: 10.5px;
    }

    th {
      background: #0f3448;
      color: white;
      padding: 9px;
      text-align: right;
      font-weight: 900;
      border-left: 1px solid rgba(255,255,255,.12);
    }

    td {
      padding: 8px 9px;
      border-top: 1px solid #e8ddc8;
      color: #334155;
      font-weight: 700;
    }

    tr:nth-child(even) td { background: #fbf8f1; }

    .empty {
      text-align: center;
      color: #8da0bb;
      padding: 22px;
    }

    .footer {
      margin-top: 18px;
      border-top: 1px solid #e8ddc8;
      padding-top: 10px;
      display: flex;
      justify-content: space-between;
      color: #8da0bb;
      font-size: 10px;
      font-weight: 700;
    }

    @media print {
      body { background: white; }
      .page { break-inside: avoid; }
    }
  </style>
</head>
<body>
  <main class="page">
    <section class="top">
      <div class="brand">
        <div class="logo">م</div>
        <div>
          <h1>تقرير شامل عن المكتب</h1>
          <div class="subtitle">مستخرج رسمي من نظام WMS Core Shell</div>
        </div>
      </div>

      <div class="meta">
        <div>تاريخ التقرير: ${escapeHtml(reportDate)}</div>
        <div>الوقت: ${escapeHtml(reportTime)}</div>
        <div>الكود: ${escapeHtml(office.code)}</div>
      </div>
    </section>

    <section class="office-card">
      <div class="office-row">
        <div>
          <div class="office-name">${escapeHtml(office.nameAr)}</div>
          <div class="office-en">${escapeHtml(office.nameEn)}</div>
        </div>
        <div class="badges">
          <span class="badge code">${escapeHtml(office.code)}</span>
          <span class="badge">${escapeHtml(office.status)}</span>
          <span class="badge">${escapeHtml(office.relationshipType)}</span>
        </div>
      </div>

      <div class="report-date">
        <span>تاريخ التقرير: ${escapeHtml(reportDate)}</span>
        <span>الوقت: ${escapeHtml(reportTime)}</span>
      </div>
    </section>

    <h2 class="section-title">الإحصائيات الرئيسية</h2>
    <section class="grid-4">
      <div class="stat blue"><div class="stat-label">إجمالي المعاملات</div><div class="stat-value">${stats.totalTransactions}</div></div>
      <div class="stat green"><div class="stat-label">معاملات مكتملة</div><div class="stat-value">${stats.completedTransactions}</div></div>
      <div class="stat amber"><div class="stat-label">قيد العمل</div><div class="stat-value">${stats.inProgressTransactions}</div></div>
      <div class="stat red"><div class="stat-label">معلقة</div><div class="stat-value">${stats.pendingTransactions}</div></div>
    </section>

    <h2 class="section-title">الملخص المالي</h2>
    <section class="grid-3">
      <div class="stat"><div class="stat-label">إجمالي قيمة المعاملات</div><div class="stat-value">${money(stats.totalRevenue)}</div></div>
      <div class="stat green"><div class="stat-label">الإيرادات المحققة</div><div class="stat-value">${money(stats.completedRevenue)}</div></div>
      <div class="stat amber"><div class="stat-label">رصيد الذمم المدينة</div><div class="stat-value">${money(office.receivableBalance)}</div></div>
    </section>

    <h2 class="section-title">بيانات المكتب</h2>
    <section class="info-grid">
      <div class="info-item"><div class="info-label">السجل التجاري</div><div class="info-value">${escapeHtml(office.commercialRegister)}</div></div>
      <div class="info-item"><div class="info-label">الترخيص الهندسي</div><div class="info-value">${escapeHtml(office.engineeringLicense)}</div></div>
      <div class="info-item"><div class="info-label">الرقم الضريبي</div><div class="info-value">${escapeHtml(office.vatNumber)}</div></div>
      <div class="info-item"><div class="info-label">حالة الضريبة</div><div class="info-value">${escapeHtml(office.vatStatus)}</div></div>
      <div class="info-item"><div class="info-label">المدينة</div><div class="info-value">${escapeHtml(office.city)}</div></div>
      <div class="info-item"><div class="info-label">المنطقة</div><div class="info-value">${escapeHtml(office.region)}</div></div>
    </section>

    <h2 class="section-title">آخر المعاملات</h2>
    <table>
      <thead>
        <tr>
          <th>المرجع</th>
          <th>النوع</th>
          <th>الحالة</th>
          <th>القيمة</th>
          <th>التاريخ</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>

    <section class="footer">
      <span>تم إنشاء هذا التقرير تلقائيًا بواسطة نظام WMS Core Shell</span>
      <span>Details WMS</span>
    </section>
  </main>
</body>
</html>`;
  };

  const openPrintableReport = (mode = "print") => {
    const printableWindow = window.open("", "_blank", "width=1200,height=900");

    if (!printableWindow) {
      toast.error("المتصفح منع فتح نافذة الطباعة. يرجى السماح بالنوافذ المنبثقة.");
      return;
    }

    printableWindow.document.open();
    printableWindow.document.write(buildReportHtml());
    printableWindow.document.close();

    const runPrint = () => {
      printableWindow.focus();
      printableWindow.print();
      if (mode === "pdf") {
        toast.success("تم فتح نافذة التصدير. اختر Save as PDF / حفظ كـ PDF.");
      } else {
        toast.success("تم فتح نافذة الطباعة.");
      }
    };

    setTimeout(runPrint, 450);
  };

  const handlePrint = () => openPrintableReport("print");
  const handleExportPdf = () => openPrintableReport("pdf");

  return (
    <div
      className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4 animate-in fade-in"
      dir="rtl"
    >
      <div className="bg-white rounded-[24px] border border-[#d8b46a]/25 shadow-[0_24px_70px_rgba(2,12,23,0.25)] flex flex-col w-full max-w-4xl overflow-hidden max-h-[90vh]">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gradient-to-l from-[#08111c] via-[#0f3448] to-[#123f59] text-white shrink-0">
          <h2 className="text-sm font-bold flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-[#e2bf74]" /> تقرير شامل عن
            المكتب
          </h2>
          <button
            onClick={onClose}
            className="hover:text-red-400 transition-colors"
            type="button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div id="office-report-preview" className="p-4 overflow-y-auto custom-scrollbar-slim space-y-4">
          {/* Report Header */}
          <div className="bg-gradient-to-l from-[#fbf8f1] to-white border border-[#e8ddc8] rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-[15px] text-slate-800 font-bold">
                  {office.nameAr}
                </h2>
                <p className="text-[11px] text-slate-400">{office.nameEn}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-[#123f59] text-white text-[11px] rounded font-bold font-mono">
                  {office.code}
                </span>
                <StatusBadge status={office.status} />
                <RelTypeBadge type={office.relationshipType} />
              </div>
            </div>
            <div className="flex items-center gap-4 text-[11px] text-slate-500 border-t border-[#e8ddc8] pt-3">
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
                  {money(stats.totalRevenue)}
                </div>
              </div>
              <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                <div className="text-[11px] text-emerald-600 mb-2">
                  الإيرادات المحققة
                </div>
                <div className="text-[16px] text-emerald-700 font-bold">
                  {money(stats.completedRevenue)}
                </div>
              </div>
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <div className="text-[11px] text-amber-600 mb-2">
                  رصيد الذمم المدينة
                </div>
                <div className="text-[16px] text-amber-700 font-bold">
                  {money(office.receivableBalance)}
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
                    {office.commercialRegister || "—"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">الترخيص الهندسي:</span>
                  <span className="text-slate-800 mr-2 font-mono font-bold">
                    {office.engineeringLicense || "—"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">الرقم الضريبي:</span>
                  <span className="text-slate-800 mr-2 font-mono font-bold">
                    {office.vatNumber || "—"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">حالة الضريبة:</span>
                  <span className="text-slate-800 mr-2 font-bold">
                    {office.vatStatus || "—"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">المدينة:</span>
                  <span className="text-slate-800 mr-2 font-bold">
                    {office.city || "—"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">المنطقة:</span>
                  <span className="text-slate-800 mr-2 font-bold">
                    {office.region || "—"}
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
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 text-[12px] text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
              type="button"
            >
              <Printer className="w-4 h-4" /> طباعة
            </button>
            <button
              onClick={handleExportPdf}
              className="flex items-center gap-2 px-4 py-2 text-[12px] text-white bg-[#0e7490] rounded-lg hover:bg-[#15536f] transition-colors"
              type="button"
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

  const tabs = [
    { id: "basic", label: "البيانات الأساسية", count: null, icon: FileText },
    { id: "contacts", label: "جهات الاتصال", count: office.contacts?.length || 0, icon: Users },
    { id: "assets", label: "المكونات الرسمية", count: office.officialAssets?.length || 0, icon: Palette },
    { id: "intermediaries", label: "الوسطاء", count: office.intermediaryLinks?.length || 0, icon: Link2 },
    { id: "transactions", label: "المعاملات", count: office.transactions?.length || 0, icon: TrendingUp },
  ];

  return (
    <>
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-3 animate-in fade-in"
        dir="rtl"
        onClick={onClose}
      >
        <div
          className="flex h-[88vh] w-full max-w-5xl flex-col overflow-hidden rounded-[24px] border border-[#d8b46a]/25 bg-white shadow-[0_24px_70px_rgba(2,12,23,0.28)]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Brokers-like header */}
          <div className="relative shrink-0 overflow-hidden bg-gradient-to-l from-[#08111c] via-[#0f3448] to-[#123f59] px-5 py-3 text-white">
            <div className="pointer-events-none absolute right-[-55px] top-[-60px] h-32 w-32 rounded-full bg-[#e2bf74]/20 blur-3xl" />
            <div className="pointer-events-none absolute left-[-60px] bottom-[-70px] h-36 w-36 rounded-full bg-cyan-300/15 blur-3xl" />

            <div className="relative z-10 flex items-center justify-between gap-3" style={{ direction: "ltr" }}>
              <button
                onClick={onClose}
                className="inline-flex h-9 items-center gap-2 rounded-xl bg-white/10 px-3 text-[11px] font-black text-white transition hover:bg-rose-500"
                type="button"
              >
                <X className="h-5 w-5" />
                إغلاق
              </button>

              <div className="flex min-w-0 items-center gap-3 text-right" dir="rtl">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#e2bf74] text-[#08111c] shadow-[0_8px_20px_rgba(226,191,116,0.20)]">
                  <Building2 className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                  <h2 className="truncate text-[18px] font-black leading-tight text-white">
                    {office.nameAr}
                  </h2>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <span className="rounded-lg bg-white/10 px-2 py-0.5 font-mono text-[10px] font-black text-white/70">
                      {office.code}
                    </span>
                    <StatusBadge status={office.status} />
                    <RelTypeBadge type={office.relationshipType} />
                  </div>
                </div>
              </div>
            </div>

            <div className="relative z-10 mt-3 flex flex-wrap items-center gap-2">
              <button
                onClick={() => setShowEditDialog(true)}
                className="inline-flex h-8 items-center gap-1.5 rounded-xl bg-[#0e7490] px-3 text-[10px] font-black text-white transition hover:bg-[#15536f]"
                type="button"
              >
                <Edit3 className="h-3.5 w-3.5" />
                تعديل البيانات
              </button>

              <button
                onClick={() => {
                  if (confirm("متأكد من تجميد/تنشيط المكتب؟")) onFreeze(office.id);
                }}
                className="inline-flex h-8 items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 text-[10px] font-black text-amber-700 transition hover:bg-amber-100"
                type="button"
              >
                <Pause className="h-3.5 w-3.5" />
                تجميد / تنشيط
              </button>

              <button
                onClick={() => {
                  if (confirm("حذف المكتب نهائياً؟")) onDelete(office.id);
                }}
                className="inline-flex h-8 items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 text-[10px] font-black text-rose-700 transition hover:bg-rose-100"
                type="button"
              >
                <Trash2 className="h-3.5 w-3.5" />
                حذف المكتب
              </button>

              <div className="flex-1" />

              <button
                onClick={() => setShowReportDialog(true)}
                className="inline-flex h-8 items-center gap-1.5 rounded-xl border border-[#d8b46a]/40 bg-[#e2bf74]/15 px-3 text-[10px] font-black text-[#ffe5a7] transition hover:bg-[#e2bf74]/25"
                type="button"
              >
                <ClipboardList className="h-3.5 w-3.5" />
                تقرير عن المكتب
              </button>

              <button
                onClick={() => setActiveTab("transactions")}
                className="inline-flex h-8 items-center gap-1.5 rounded-xl border border-emerald-200/30 bg-emerald-400/10 px-3 text-[10px] font-black text-emerald-100 transition hover:bg-emerald-400/15"
                type="button"
              >
                <TrendingUp className="h-3.5 w-3.5" />
                معاملات المكتب ({office.transactions?.length || 0})
              </button>
            </div>
          </div>

          {/* Compact tabs */}
          <div className="flex shrink-0 overflow-x-auto border-b border-[#e8ddc8]/70 bg-white custom-scrollbar-slim">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex cursor-pointer items-center gap-2 whitespace-nowrap border-b-2 px-4 py-2.5 text-[11px] font-black transition-all ${
                  activeTab === tab.id
                    ? "border-[#0e7490] bg-[#eef7f6]/55 text-[#0e7490]"
                    : "border-transparent text-[#8da0bb] hover:bg-[#fbf8f1] hover:text-[#123f59]"
                }`}
                type="button"
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
                {tab.count !== null && (
                  <span className="rounded-lg bg-[#fbf8f1] px-1.5 py-0.5 text-[9px] font-black text-[#60738f]">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="relative flex-1 overflow-y-auto bg-[linear-gradient(135deg,#fbf8f1_0%,#ffffff_55%,#f3f7f6_100%)] p-4 custom-scrollbar-slim">
            {activeTab === "basic" && <TabBasicData office={office} />}
            {activeTab === "contacts" && (
              <TabContacts officeId={office.id} contacts={office.contacts || []} />
            )}
            {activeTab === "assets" && (
              <TabOfficialAssets officeId={office.id} assets={office.officialAssets || []} />
            )}
            {activeTab === "intermediaries" && (
              <TabIntermediaryLinks officeId={office.id} links={office.intermediaryLinks || []} />
            )}
            {activeTab === "transactions" && (
              <TabTransactions transactions={office.transactions || []} officeName={office.nameAr} />
            )}
          </div>

          {/* Footer */}
          <div className="flex shrink-0 items-center justify-between gap-3 border-t border-[#e8ddc8]/70 bg-white px-5 py-3">
            <div className="flex flex-wrap items-center gap-3 text-[10px] font-bold text-[#8da0bb]">
              <div className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                أُنشئ: {office.createdAt || "—"}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                آخر تعديل: {office.updatedAt || "—"}
              </div>
            </div>

            <button
              onClick={onClose}
              className="inline-flex h-8 items-center gap-2 rounded-xl border border-[#e8ddc8] bg-[#fbf8f1] px-4 text-[11px] font-black text-[#123f59] transition hover:bg-white"
              type="button"
            >
              <X className="h-3.5 w-3.5" />
              إغلاق
            </button>
          </div>
        </div>
      </div>

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
  const FieldCard = ({ label, value, icon, mono }) => (
    <div className="rounded-xl border border-[#e8ddc8] bg-white p-3 shadow-[0_6px_16px_rgba(18,63,89,0.04)]">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="text-[10px] font-black text-[#8da0bb]">{label}</span>
        {icon && <span className="text-[#c5983c]">{icon}</span>}
      </div>
      <div
        className={`truncate text-[13px] font-black text-[#123f59] ${mono ? "font-mono" : ""}`}
        dir={mono ? "ltr" : "rtl"}
        style={{ textAlign: mono ? "right" : undefined }}
        title={value || "—"}
      >
        {value || <span className="text-[#cfd8e3]">—</span>}
      </div>
    </div>
  );

  const Section = ({ title, icon, children }) => (
    <section className="overflow-hidden rounded-[20px] border border-[#e8ddc8] bg-white/80 shadow-[0_10px_28px_rgba(18,63,89,0.05)]">
      <div className="flex items-center gap-2 border-b border-[#e8ddc8]/70 bg-gradient-to-l from-[#fbf8f1] to-white px-4 py-3">
        <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#123f59] text-[#e2bf74]">
          {icon}
        </span>
        <h3 className="text-[13px] font-black text-[#123f59]">{title}</h3>
      </div>
      <div className="p-4">{children}</div>
    </section>
  );

  return (
    <div className="space-y-4">
      <Section title="بيانات التعريف" icon={<Building2 className="h-4 w-4" />}>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          <FieldCard label="الاسم التجاري (عربي)" value={office.nameAr} />
          <FieldCard label="الاسم التجاري (إنجليزي)" value={office.nameEn} />
          <FieldCard
            label="السجل التجاري"
            value={office.commercialRegister}
            icon={<Hash className="h-3.5 w-3.5" />}
            mono
          />
          <FieldCard
            label="رقم الترخيص الهندسي"
            value={office.engineeringLicense}
            icon={<Shield className="h-3.5 w-3.5" />}
            mono
          />
          <FieldCard
            label="الرقم الضريبي (VAT)"
            value={office.vatNumber}
            icon={<FileText className="h-3.5 w-3.5" />}
            mono
          />
          <div className="rounded-xl border border-[#e8ddc8] bg-white p-3 shadow-[0_6px_16px_rgba(18,63,89,0.04)]">
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <span className="text-[10px] font-black text-[#8da0bb]">حالة الضريبة</span>
              <BadgeCheck className="h-3.5 w-3.5 text-[#c5983c]" />
            </div>
            <span
              className={`inline-flex items-center rounded-xl px-2.5 py-1 text-[11px] font-black ${
                office.vatStatus === "مسجل"
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-[#fbf8f1] text-[#60738f]"
              }`}
            >
              {office.vatStatus || "—"}
            </span>
          </div>
        </div>
      </Section>

      <Section title="العنوان والتواصل" icon={<MapPin className="h-4 w-4" />}>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          <div className="md:col-span-2 xl:col-span-3">
            <FieldCard
              label="العنوان الوطني"
              value={office.nationalAddress}
              icon={<MapPin className="h-3.5 w-3.5" />}
            />
          </div>
          <FieldCard label="المدينة" value={office.city} />
          <FieldCard label="المنطقة" value={office.region} />
          <FieldCard
            label="البريد الإلكتروني"
            value={office.email}
            icon={<Mail className="h-3.5 w-3.5" />}
            mono
          />
          <FieldCard
            label="الهاتف"
            value={office.phone}
            icon={<Phone className="h-3.5 w-3.5" />}
            mono
          />
          <FieldCard
            label="واتساب"
            value={office.whatsapp}
            icon={<MessageCircle className="h-3.5 w-3.5" />}
            mono
          />
          <FieldCard
            label="الموقع الإلكتروني"
            value={office.website}
            icon={<Globe className="h-3.5 w-3.5" />}
            mono
          />
        </div>
      </Section>

      <Section title="التخصصات" icon={<Briefcase className="h-4 w-4" />}>
        <div className="flex flex-wrap gap-2">
          {office.specializations?.length > 0 ? (
            office.specializations.map((spec, index) => (
              <span
                key={index}
                className="rounded-xl border border-[#0e7490]/15 bg-[#eef7f6] px-3 py-1.5 text-[11px] font-black text-[#0e7490]"
              >
                {spec}
              </span>
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-[#e8ddc8] bg-[#fbf8f1] px-3 py-2 text-[12px] font-bold text-[#8da0bb]">
              لم يتم تسجيل تخصصات
            </div>
          )}
        </div>
      </Section>

      {(office.status === "موقوف" && office.suspensionReason) || office.internalNotes ? (
        <Section title="ملاحظات وحالة المكتب" icon={<AlertCircle className="h-4 w-4" />}>
          <div className="space-y-3">
            {office.status === "موقوف" && office.suspensionReason && (
              <div className="rounded-xl border border-rose-100 bg-rose-50 p-3">
                <div className="mb-1 flex items-center gap-1.5 text-[11px] font-black text-rose-700">
                  <AlertCircle className="h-3.5 w-3.5" />
                  سبب الإيقاف
                </div>
                <p className="text-[12px] font-semibold leading-relaxed text-rose-600">
                  {office.suspensionReason}
                </p>
              </div>
            )}

            {office.internalNotes && (
              <div className="rounded-xl border border-amber-100 bg-amber-50 p-3">
                <div className="mb-1 flex items-center gap-1.5 text-[11px] font-black text-amber-700">
                  <FileText className="h-3.5 w-3.5" />
                  ملاحظات داخلية
                </div>
                <p className="text-[12px] font-semibold leading-relaxed text-amber-700">
                  {office.internalNotes}
                </p>
              </div>
            )}
          </div>
        </Section>
      ) : null}
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

  const inputClass =
    "h-9 w-full rounded-xl border border-[#e8ddc8] bg-white px-3 text-[12px] font-bold text-[#123f59] outline-none transition focus:border-[#0e7490] focus:ring-2 focus:ring-[#0e7490]/10";
  const labelClass = "mb-1 block text-[10px] font-black text-[#60738f]";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-[18px] border border-[#d8b46a]/25 bg-white/85 px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#123f59] text-[#e2bf74]">
            <Users className="h-4 w-4" />
          </span>
          <div>
            <div className="text-[13px] font-black text-[#123f59]">
              جهات الاتصال
            </div>
            <div className="text-[10px] font-bold text-[#8da0bb]">
              {contacts?.length || 0} جهة مسجلة داخل هذا المكتب
            </div>
          </div>
        </div>

        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="inline-flex h-8 items-center gap-1.5 rounded-xl bg-[#0e7490] px-3 text-[10px] font-black text-white shadow-sm transition hover:bg-[#15536f]"
            type="button"
          >
            <Plus className="h-3.5 w-3.5" />
            إضافة جهة اتصال
          </button>
        )}
      </div>

      {isAdding && (
        <form
          onSubmit={handleSubmit}
          className="overflow-hidden rounded-[20px] border border-[#d8b46a]/25 bg-white shadow-[0_10px_28px_rgba(18,63,89,0.06)] animate-in fade-in zoom-in-95"
        >
          <div className="flex items-center gap-2 border-b border-[#e8ddc8]/70 bg-gradient-to-l from-[#fbf8f1] to-white px-4 py-3">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#123f59] text-[#e2bf74]">
              <UserCheck className="h-4 w-4" />
            </span>
            <div>
              <div className="text-[13px] font-black text-[#123f59]">
                جهة اتصال جديدة
              </div>
              <div className="text-[10px] font-bold text-[#8da0bb]">
                أدخل بيانات الشخص المسؤول أو المعتمد داخل المكتب.
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 p-4 md:grid-cols-2">
            <div>
              <label className={labelClass}>الاسم *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className={inputClass}
                placeholder="اسم جهة الاتصال"
              />
            </div>

            <div>
              <label className={labelClass}>المنصب / الصفة</label>
              <input
                type="text"
                value={formData.position}
                onChange={(e) =>
                  setFormData({ ...formData, position: e.target.value })
                }
                className={inputClass}
                placeholder="مثال: مدير المكتب"
              />
            </div>

            <div>
              <label className={labelClass}>الجوال *</label>
              <input
                type="tel"
                value={formData.mobile}
                onChange={(e) =>
                  setFormData({ ...formData, mobile: e.target.value })
                }
                className={inputClass}
                dir="ltr"
                style={{ textAlign: "right" }}
                placeholder="05xxxxxxxx"
              />
            </div>

            <div>
              <label className={labelClass}>البريد الإلكتروني</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className={inputClass}
                dir="ltr"
                style={{ textAlign: "right" }}
                placeholder="email@example.com"
              />
            </div>

            <div className="md:col-span-2">
              <label className={labelClass}>ملاحظات</label>
              <input
                type="text"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                className={inputClass}
                placeholder="ملاحظات داخلية اختيارية"
              />
            </div>

            <div className="md:col-span-2">
              <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-[#e8ddc8] bg-[#fbf8f1] px-3 py-2">
                <input
                  type="checkbox"
                  checked={formData.isAuthorizedSigner}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      isAuthorizedSigner: e.target.checked,
                    })
                  }
                  className="h-4 w-4 accent-[#0e7490]"
                />
                <span className="text-[12px] font-black text-[#123f59]">
                  هذا الشخص معتمد للتوقيع المالي/الرسمي
                </span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t border-[#e8ddc8]/70 bg-[#fbf8f1] px-4 py-3">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="inline-flex h-8 items-center gap-1.5 rounded-xl border border-[#e8ddc8] bg-white px-4 text-[11px] font-black text-[#60738f] transition hover:bg-[#fbf8f1]"
            >
              <X className="h-3.5 w-3.5" />
              إلغاء
            </button>
            <button
              type="submit"
              disabled={addContactMutation.isPending}
              className="inline-flex h-8 items-center gap-1.5 rounded-xl bg-[#0e7490] px-4 text-[11px] font-black text-white transition hover:bg-[#15536f] disabled:opacity-50"
            >
              {addContactMutation.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              حفظ
            </button>
          </div>
        </form>
      )}

      {(!contacts || contacts.length === 0) && !isAdding ? (
        <div className="flex flex-col items-center justify-center rounded-[20px] border border-dashed border-[#e8ddc8] bg-white/75 py-12 text-center">
          <Users className="mb-3 h-11 w-11 text-[#cfd8e3]" />
          <div className="text-[14px] font-black text-[#123f59]">
            لا توجد جهات اتصال مسجلة
          </div>
          <div className="mt-1 text-[11px] font-bold text-[#8da0bb]">
            أضف جهة اتصال لتسهيل التواصل والتوقيع الرسمي.
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {contacts?.map((contact) => (
            <div
              key={contact.id}
              className={`group relative overflow-hidden rounded-[18px] border bg-white p-4 shadow-[0_8px_22px_rgba(18,63,89,0.055)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(18,63,89,0.09)] ${
                contact.isAuthorizedSigner
                  ? "border-emerald-200"
                  : "border-[#e8ddc8]"
              }`}
            >
              <div className={`absolute right-0 top-0 h-full w-1.5 ${contact.isAuthorizedSigner ? "bg-emerald-500" : "bg-[#0e7490]"}`} />

              <button
                onClick={() => {
                  if (confirm("حذف جهة الاتصال؟"))
                    deleteContactMutation.mutate(contact.id);
                }}
                className="absolute left-3 top-3 inline-flex h-7 items-center gap-1 rounded-lg bg-rose-50 px-2 text-[9px] font-black text-rose-600 opacity-0 transition hover:bg-rose-500 hover:text-white group-hover:opacity-100"
                type="button"
              >
                <Trash2 className="h-3 w-3" />
                حذف
              </button>

              <div className="flex items-start gap-3 pr-2">
                <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${contact.isAuthorizedSigner ? "bg-emerald-50 text-emerald-700" : "bg-[#eef7f6] text-[#0e7490]"}`}>
                  <UserCheck className="h-5 w-5" />
                </span>

                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-black text-[#123f59]">
                    {contact.name}
                  </div>
                  <div className="mt-0.5 truncate text-[11px] font-bold text-[#8da0bb]">
                    {contact.position || "—"}
                  </div>

                  {contact.isAuthorizedSigner && (
                    <span className="mt-2 inline-flex items-center gap-1 rounded-xl border border-emerald-200 bg-emerald-50 px-2 py-1 text-[10px] font-black text-emerald-700">
                      <UserCheck className="h-3 w-3" />
                      توقيع معتمد
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-3 grid gap-2 border-t border-[#e8ddc8]/70 pt-3">
                <div className="flex items-center gap-2 text-[11px] font-bold text-[#60738f]">
                  <Phone className="h-3.5 w-3.5 text-[#c5983c]" />
                  <span className="font-mono" dir="ltr">
                    {contact.mobile}
                  </span>
                </div>

                {contact.email && (
                  <div className="flex items-center gap-2 truncate text-[11px] font-bold text-[#60738f]">
                    <Mail className="h-3.5 w-3.5 shrink-0 text-[#c5983c]" />
                    <span className="truncate font-mono" dir="ltr">
                      {contact.email}
                    </span>
                  </div>
                )}

                {contact.notes && (
                  <div className="rounded-xl border border-[#e8ddc8] bg-[#fbf8f1] px-3 py-2 text-[11px] font-semibold text-[#60738f]">
                    {contact.notes}
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

  const inputClass =
    "h-9 w-full rounded-xl border border-[#e8ddc8] bg-white px-3 text-[12px] font-bold text-[#123f59] outline-none transition focus:border-[#0e7490] focus:ring-2 focus:ring-[#0e7490]/10";
  const labelClass = "mb-1 block text-[10px] font-black text-[#60738f]";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-[18px] border border-[#d8b46a]/25 bg-white/85 px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#123f59] text-[#e2bf74]">
            <Palette className="h-4 w-4" />
          </span>
          <div>
            <div className="text-[13px] font-black text-[#123f59]">
              المكونات الرسمية
            </div>
            <div className="text-[10px] font-bold text-[#8da0bb]">
              {assets?.length || 0} مكون رسمي محفوظ
            </div>
          </div>
        </div>

        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="inline-flex h-8 items-center gap-1.5 rounded-xl bg-[#0e7490] px-3 text-[10px] font-black text-white shadow-sm transition hover:bg-[#15536f]"
            type="button"
          >
            <UploadCloud className="h-3.5 w-3.5" />
            رفع مكون جديد
          </button>
        )}
      </div>

      {isAdding && (
        <form
          onSubmit={handleSubmit}
          className="overflow-hidden rounded-[20px] border border-[#d8b46a]/25 bg-white shadow-[0_10px_28px_rgba(18,63,89,0.06)] animate-in fade-in zoom-in-95"
        >
          <div className="flex items-center gap-2 border-b border-[#e8ddc8]/70 bg-gradient-to-l from-[#fbf8f1] to-white px-4 py-3">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#123f59] text-[#e2bf74]">
              <UploadCloud className="h-4 w-4" />
            </span>
            <div>
              <div className="text-[13px] font-black text-[#123f59]">
                رفع مكون رسمي جديد
              </div>
              <div className="text-[10px] font-bold text-[#8da0bb]">
                استخدم هذه المنطقة لرفع الشعارات، الأختام، التواقيع والقوالب.
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 p-4 md:grid-cols-2">
            <div>
              <label className={labelClass}>نوع المكون *</label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
                className={inputClass}
              >
                {Object.entries(assetTypeLabels).map(([val, lbl]) => (
                  <option key={val} value={val}>
                    {lbl}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>وصف أو اسم المكون *</label>
              <input
                type="text"
                value={formData.label}
                onChange={(e) =>
                  setFormData({ ...formData, label: e.target.value })
                }
                placeholder="مثال: الختم الرسمي 2025"
                className={inputClass}
              />
            </div>

            <div className="md:col-span-2">
              <label className={labelClass}>
                محتوى نصي للهيدر/الفوتر الديناميكي
              </label>
              <textarea
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                placeholder="أدخل النص هنا إذا لم يكن المكون عبارة عن صورة..."
                className="min-h-[72px] w-full rounded-xl border border-[#e8ddc8] bg-white px-3 py-2 text-[12px] font-bold text-[#123f59] outline-none transition focus:border-[#0e7490] focus:ring-2 focus:ring-[#0e7490]/10"
              />
            </div>

            <div className="md:col-span-2">
              <label className={labelClass}>إرفاق صورة/ملف</label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex cursor-pointer flex-col items-center justify-center rounded-[18px] border-2 border-dashed border-[#d8b46a]/55 bg-[#fbf8f1] p-5 transition hover:bg-white"
              >
                <UploadCloud className="mb-2 h-7 w-7 text-[#0e7490]" />
                <span className="text-[12px] font-black text-[#123f59]">
                  {formData.file ? formData.file.name : "اضغط لاختيار ملف"}
                </span>
                <span className="mt-1 text-[10px] font-bold text-[#8da0bb]">
                  يمكن رفع صورة أو PDF حسب نوع المكون
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

          <div className="flex justify-end gap-2 border-t border-[#e8ddc8]/70 bg-[#fbf8f1] px-4 py-3">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="inline-flex h-8 items-center gap-1.5 rounded-xl border border-[#e8ddc8] bg-white px-4 text-[11px] font-black text-[#60738f] transition hover:bg-[#fbf8f1]"
            >
              <X className="h-3.5 w-3.5" />
              إلغاء
            </button>
            <button
              type="submit"
              disabled={addAssetMutation.isPending}
              className="inline-flex h-8 items-center gap-1.5 rounded-xl bg-[#0e7490] px-4 text-[11px] font-black text-white transition hover:bg-[#15536f] disabled:opacity-50"
            >
              {addAssetMutation.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              اعتماد المكون
            </button>
          </div>
        </form>
      )}

      {(!assets || assets.length === 0) && !isAdding ? (
        <div className="flex flex-col items-center justify-center rounded-[20px] border border-dashed border-[#e8ddc8] bg-white/75 py-12 text-center">
          <Palette className="mb-3 h-11 w-11 text-[#cfd8e3]" />
          <div className="text-[14px] font-black text-[#123f59]">
            لا توجد مكونات رسمية مسجلة
          </div>
          <div className="mt-1 text-[11px] font-bold text-[#8da0bb]">
            ارفع الشعار، الختم، التوقيع أو قوالب المكتب.
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {assetGroups.map((group) => (
            <section
              key={group.type}
              className="overflow-hidden rounded-[20px] border border-[#e8ddc8] bg-white/85 shadow-[0_10px_28px_rgba(18,63,89,0.05)]"
            >
              <div className="flex items-center gap-2 border-b border-[#e8ddc8]/70 bg-gradient-to-l from-[#fbf8f1] to-white px-4 py-3">
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#123f59] text-[#e2bf74]">
                  <AssetTypeIcon type={group.type} className="h-4 w-4" />
                </span>
                <span className="text-[13px] font-black text-[#123f59]">
                  {group.label}
                </span>
                <span className="rounded-lg bg-white px-2 py-0.5 text-[10px] font-black text-[#60738f]">
                  {group.items.length}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3 p-4 md:grid-cols-2">
                {group.items.map((asset) => (
                  <div
                    key={asset.id}
                    className="group relative flex items-start gap-3 rounded-[18px] border border-[#e8ddc8] bg-white p-3 shadow-[0_8px_22px_rgba(18,63,89,0.045)] transition hover:border-[#0e7490]/35"
                  >
                    <button
                      onClick={() => {
                        if (confirm("حذف المكون نهائياً؟"))
                          deleteAssetMutation.mutate(asset.id);
                      }}
                      className="absolute left-3 top-3 inline-flex h-7 items-center gap-1 rounded-lg bg-rose-50 px-2 text-[9px] font-black text-rose-600 opacity-0 transition hover:bg-rose-500 hover:text-white group-hover:opacity-100"
                      type="button"
                    >
                      <Trash2 className="h-3 w-3" />
                      حذف
                    </button>

                    <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-[#eef7f6] text-[#0e7490]">
                      <AssetTypeIcon type={asset.type} className="mb-0.5 h-5 w-5" />
                      <span className="font-mono text-[8px] font-black text-[#8da0bb]">
                        v{asset.version}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1 pl-14">
                      <div className="mb-1 truncate text-[12px] font-black text-[#123f59]">
                        {asset.label}
                      </div>
                      {asset.fileName && (
                        <div className="mb-1 w-max max-w-full truncate rounded-lg bg-[#fbf8f1] px-2 py-0.5 font-mono text-[9px] font-black text-[#0e7490]">
                          {asset.fileName}
                        </div>
                      )}
                      {asset.content && (
                        <div className="mb-1 line-clamp-2 rounded-xl border border-[#e8ddc8] bg-[#fbf8f1] p-2 text-[10px] font-semibold text-[#60738f]">
                          {asset.content}
                        </div>
                      )}
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-[9px] font-bold text-[#8da0bb]">
                        <span>بواسطة: {asset.uploadedBy}</span>
                        <span>•</span>
                        <span className="font-mono">{asset.uploadedAt}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
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

  const inputClass =
    "h-9 w-full rounded-xl border border-[#e8ddc8] bg-white px-3 text-[12px] font-bold text-[#123f59] outline-none transition focus:border-[#0e7490] focus:ring-2 focus:ring-[#0e7490]/10";
  const labelClass = "mb-1 block text-[10px] font-black text-[#60738f]";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-[18px] border border-[#d8b46a]/25 bg-white/85 px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#123f59] text-[#e2bf74]">
            <Link2 className="h-4 w-4" />
          </span>
          <div>
            <div className="text-[13px] font-black text-[#123f59]">
              الوسطاء المرتبطون
            </div>
            <div className="text-[10px] font-bold text-[#8da0bb]">
              {links?.length || 0} وسيط مرتبط بهذا المكتب
            </div>
          </div>
        </div>

        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="inline-flex h-8 items-center gap-1.5 rounded-xl bg-[#0e7490] px-3 text-[10px] font-black text-white shadow-sm transition hover:bg-[#15536f]"
            type="button"
          >
            <Plus className="h-3.5 w-3.5" />
            إضافة وسيط
          </button>
        )}
      </div>

      {isAdding && (
        <form
          onSubmit={handleSubmit}
          className="overflow-hidden rounded-[20px] border border-[#d8b46a]/25 bg-white shadow-[0_10px_28px_rgba(18,63,89,0.06)] animate-in fade-in zoom-in-95"
        >
          <div className="flex items-center gap-2 border-b border-[#e8ddc8]/70 bg-gradient-to-l from-[#fbf8f1] to-white px-4 py-3">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#123f59] text-[#e2bf74]">
              <Link2 className="h-4 w-4" />
            </span>
            <div>
              <div className="text-[13px] font-black text-[#123f59]">
                ربط وسيط جديد بالمكتب
              </div>
              <div className="text-[10px] font-bold text-[#8da0bb]">
                حدد الوسيط والدور وطريقة احتساب العمولة.
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 p-4 md:grid-cols-2">
            <div>
              <label className={labelClass}>اسم الوسيط *</label>
              <input
                type="text"
                value={formData.intermediaryName}
                onChange={(e) =>
                  setFormData({ ...formData, intermediaryName: e.target.value })
                }
                className={inputClass}
                placeholder="مثال: عبدالله السبيعي"
              />
            </div>

            <div>
              <label className={labelClass}>الدور</label>
              <select
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
                className={inputClass}
              >
                <option value="مسؤول علاقات">مسؤول علاقات</option>
                <option value="محصل">محصل</option>
                <option value="مندوب متابعة">مندوب متابعة</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>نوع العمولة</label>
              <select
                value={formData.commissionType}
                onChange={(e) =>
                  setFormData({ ...formData, commissionType: e.target.value })
                }
                className={inputClass}
              >
                <option value="percentage">نسبة مئوية (%)</option>
                <option value="fixed">مبلغ ثابت (ر.س)</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>القيمة *</label>
              <input
                type="number"
                value={formData.commissionValue}
                onChange={(e) =>
                  setFormData({ ...formData, commissionValue: e.target.value })
                }
                className={inputClass}
                placeholder="0"
              />
            </div>

            <div className="md:col-span-2">
              <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-[#e8ddc8] bg-[#fbf8f1] px-3 py-2">
                <input
                  type="checkbox"
                  checked={formData.isDefault}
                  onChange={(e) =>
                    setFormData({ ...formData, isDefault: e.target.checked })
                  }
                  className="h-4 w-4 accent-[#0e7490]"
                />
                <span className="text-[12px] font-black text-[#123f59]">
                  تعيين كوسيط افتراضي لهذا المكتب
                </span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t border-[#e8ddc8]/70 bg-[#fbf8f1] px-4 py-3">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="inline-flex h-8 items-center gap-1.5 rounded-xl border border-[#e8ddc8] bg-white px-4 text-[11px] font-black text-[#60738f] transition hover:bg-[#fbf8f1]"
            >
              <X className="h-3.5 w-3.5" />
              إلغاء
            </button>
            <button
              type="submit"
              disabled={addLinkMutation.isPending}
              className="inline-flex h-8 items-center gap-1.5 rounded-xl bg-[#0e7490] px-4 text-[11px] font-black text-white transition hover:bg-[#15536f] disabled:opacity-50"
            >
              {addLinkMutation.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              ربط الوسيط
            </button>
          </div>
        </form>
      )}

      {(!links || links.length === 0) && !isAdding ? (
        <div className="flex flex-col items-center justify-center rounded-[20px] border border-dashed border-[#e8ddc8] bg-white/75 py-12 text-center">
          <Link2 className="mb-3 h-11 w-11 text-[#cfd8e3]" />
          <div className="text-[14px] font-black text-[#123f59]">
            لا توجد وسطاء مرتبطون
          </div>
          <div className="mt-1 text-[11px] font-bold text-[#8da0bb]">
            أضف الوسطاء المرتبطين بهذا المكتب لتسهيل الحسابات.
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {links?.map((link) => (
            <div
              key={link.id}
              className={`group relative overflow-hidden rounded-[18px] border bg-white p-4 shadow-[0_8px_22px_rgba(18,63,89,0.055)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(18,63,89,0.09)] ${
                link.isDefault ? "border-[#0e7490]/35" : "border-[#e8ddc8]"
              }`}
            >
              <div className={`absolute right-0 top-0 h-full w-1.5 ${link.isDefault ? "bg-[#0e7490]" : "bg-[#d8b46a]"}`} />

              <button
                onClick={() => {
                  if (confirm("فك ارتباط هذا الوسيط بالمكتب؟"))
                    deleteLinkMutation.mutate(link.id);
                }}
                className="absolute left-3 top-3 inline-flex h-7 items-center gap-1 rounded-lg bg-rose-50 px-2 text-[9px] font-black text-rose-600 opacity-0 transition hover:bg-rose-500 hover:text-white group-hover:opacity-100"
                type="button"
              >
                <Trash2 className="h-3 w-3" />
                حذف
              </button>

              <div className="flex items-start gap-3 pr-2">
                <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${link.isDefault ? "bg-[#eef7f6] text-[#0e7490]" : "bg-[#fbf8f1] text-[#c5983c]"}`}>
                  <Users className="h-5 w-5" />
                </span>

                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-black text-[#123f59]">
                    {link.intermediaryName}
                  </div>
                  <div className="mt-0.5 truncate text-[11px] font-bold text-[#8da0bb]">
                    {link.role}
                  </div>

                  {link.isDefault && (
                    <span className="mt-2 inline-flex items-center gap-1 rounded-xl border border-[#0e7490]/20 bg-[#eef7f6] px-2 py-1 text-[10px] font-black text-[#0e7490]">
                      <Star className="h-3 w-3 fill-current" />
                      افتراضي
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 border-t border-[#e8ddc8]/70 pt-3">
                <div className="rounded-xl bg-[#fbf8f1] px-3 py-2">
                  <div className="text-[9px] font-black text-[#8da0bb]">نوع العمولة</div>
                  <div className="mt-1 text-[11px] font-black text-[#123f59]">
                    {link.commissionType === "percentage" ? "نسبة مئوية" : "مبلغ ثابت"}
                  </div>
                </div>
                <div className="rounded-xl bg-[#fbf8f1] px-3 py-2">
                  <div className="text-[9px] font-black text-[#8da0bb]">القيمة</div>
                  <div className="mt-1 text-[11px] font-black text-[#0e7490]">
                    {link.commissionType === "percentage"
                      ? `${link.commissionValue}%`
                      : `${link.commissionValue} ر.س`}
                  </div>
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
      <div className="flex flex-col items-center justify-center rounded-[20px] border border-dashed border-[#e8ddc8] bg-white/75 py-12 text-center">
        <TrendingUp className="mb-3 h-11 w-11 text-[#cfd8e3]" />
        <div className="text-[14px] font-black text-[#123f59]">
          لا توجد معاملات مرتبطة
        </div>
        <div className="mt-1 text-[11px] font-bold text-[#8da0bb]">
          لم يتم تسجيل معاملات مخصصة لهذا المكتب في النظام بعد.
        </div>
      </div>
    );
  }

  const stats = {
    total: transactions.length,
    completed: transactions.filter((t) => t.status === "مكتملة").length,
    inProgress: transactions.filter((t) => t.status === "جارية").length,
    frozen: transactions.filter((t) => t.status === "مجمّدة").length,
    totalAmount: transactions.reduce((sum, t) => sum + (t.totalFees || 0), 0),
  };

  const StatCard = ({ label, value, tone = "slate" }) => {
    const toneClass = {
      slate: "bg-white text-[#123f59] border-[#e8ddc8]",
      green: "bg-emerald-50 text-emerald-700 border-emerald-200",
      amber: "bg-amber-50 text-amber-700 border-amber-200",
      blue: "bg-[#eef7f6] text-[#0e7490] border-[#b9e5ee]",
    }[tone];

    return (
      <div className={`rounded-[18px] border p-3 shadow-sm ${toneClass}`}>
        <div className="mb-1 text-[10px] font-black opacity-75">{label}</div>
        <div className="text-[18px] font-black">{value}</div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="إجمالي المعاملات" value={stats.total} />
        <StatCard label="مكتملة" value={stats.completed} tone="green" />
        <StatCard label="جارية" value={stats.inProgress} tone="amber" />
        <StatCard
          label="إجمالي القيمة"
          value={`${stats.totalAmount.toLocaleString("ar-SA")} ر.س`}
          tone="blue"
        />
      </div>

      <div className="overflow-hidden rounded-[20px] border border-[#e8ddc8] bg-white shadow-[0_10px_28px_rgba(18,63,89,0.05)]">
        <div className="flex items-center justify-between border-b border-[#e8ddc8]/70 bg-gradient-to-l from-[#fbf8f1] to-white px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#123f59] text-[#e2bf74]">
              <TrendingUp className="h-4 w-4" />
            </span>
            <div>
              <div className="text-[13px] font-black text-[#123f59]">
                المعاملات المرتبطة
              </div>
              <div className="text-[10px] font-bold text-[#8da0bb]">
                {transactions.length} معاملة مرتبطة بالمكتب
              </div>
            </div>
          </div>
        </div>

        <div className="custom-scrollbar-slim max-h-[430px] overflow-y-auto overflow-x-auto lg:overflow-x-hidden">
          <table dir="rtl" className="w-full min-w-[760px] table-fixed text-right text-[12px] lg:min-w-0">
            <colgroup>
              <col className="w-[18%]" />
              <col className="w-[22%]" />
              <col className="w-[18%]" />
              <col className="w-[20%]" />
              <col className="w-[22%]" />
            </colgroup>
            <thead className="sticky top-0 z-10 bg-[#0f3448] text-white shadow-sm">
              <tr className="h-[36px]">
                <th className="border-l border-white/10 px-2 text-[10px] font-black">الكود</th>
                <th className="border-l border-white/10 px-2 text-[10px] font-black">التصنيف</th>
                <th className="border-l border-white/10 px-2 text-[10px] font-black">الحالة</th>
                <th className="border-l border-white/10 px-2 text-[10px] font-black">القيمة</th>
                <th className="px-2 text-[10px] font-black">التاريخ / الإجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e8ddc8]/70">
              {transactions.map((tx, idx) => (
                <tr
                  key={tx.id}
                  className={`h-[44px] transition hover:bg-cyan-50/45 ${
                    idx % 2 === 1 ? "bg-[#fbf8f1]/55" : "bg-white"
                  }`}
                >
                  <td className="border-l border-[#e8ddc8]/70 px-2">
                    <span className="rounded-lg bg-[#eef7f6] px-2 py-1 font-mono text-[10px] font-black text-[#0e7490]">
                      {tx.transactionCode}
                    </span>
                  </td>
                  <td className="border-l border-[#e8ddc8]/70 px-2">
                    <div className="truncate text-[11px] font-black text-[#123f59]">
                      {tx.category || "معاملة عامة"}
                    </div>
                    <div className="truncate text-[9px] font-bold text-[#8da0bb]">
                      {tx.internalName || tx.client?.nameAr || "عميل"}
                    </div>
                  </td>
                  <td className="border-l border-[#e8ddc8]/70 px-2">
                    <TransactionStatusBadge status={tx.status} />
                  </td>
                  <td className="border-l border-[#e8ddc8]/70 px-2 font-mono text-[11px] font-black text-[#0e7490]">
                    {(tx.totalFees || 0).toLocaleString("ar-SA")} ر.س
                  </td>
                  <td className="px-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[9px] font-bold text-[#8da0bb]">
                        {new Date(tx.createdAt).toLocaleDateString("en-GB")}
                      </span>
                      <span
                        className="inline-flex h-6 items-center gap-1 rounded-lg bg-[#fbf8f1] px-2 text-[9px] font-black text-[#0e7490]"
                        title="المعاملة محفوظة في نظام المعاملات الرئيسي"
                      >
                        <ExternalLink className="h-3 w-3" />
                        في النظام الرئيسي
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Screen860IntermediaryOffices;
