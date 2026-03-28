import React, {
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect,
} from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../api/axios";
import { toast } from "sonner";
import moment from "moment-hijri";
import {
  Search,
  Filter,
  Plus,
  Brain,
  Eye,
  Copy,
  ArrowUp,
  ArrowDown,
  X,
  Edit3,
  Layers,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ScanLine,
  Database,
  Check,
  FolderOpen,
  Trash2,
  Minus,
  Sparkles,
  Loader2,
  BellRing,
  Files,
  ChevronRight,
  CloudUpload,
  FileText,
  ChevronLeft,
  MapPin,
  Save,
  Link,
  User,
  Briefcase,
  Building,
  FileSignature,
  CalendarDays,
  Clock,
} from "lucide-react";

import { SmartDropdownButton } from "../../components/SmartDropdownButton";
import { ModalPermitDetails } from "../../components/ModalPermitDetails";

// ─── Column Definitions ──────────────────────────────────────
const COLUMNS = [
  { key: "permitNumber", label: "رقم الرخصة", width: 110 },
  { key: "source", label: "مصدر السجل", width: 130 },
  { key: "year", label: "السنة", width: 60 },
  { key: "type", label: "نوع الرخصة", width: 110 },
  { key: "form", label: "شكل الرخصة", width: 80 },
  { key: "ownerName", label: "اسم المالك", width: 170 },
  { key: "idNumber", label: "رقم الهوية", width: 105 },
  { key: "district", label: "الحي", width: 80 },
  { key: "planNumber", label: "رقم المخطط", width: 95 },
  { key: "usage", label: "الاستخدام", width: 90 },
  { key: "aiStatus", label: "حالة التحليل (AI)", width: 105 },
  { key: "archiveDate", label: "تاريخ الأرشفة", width: 100 },
];

// ==========================================
// 💡 دوال مساعدة
// ==========================================
const toEnglishNumbers = (str) => {
  if (str === null || str === undefined) return "";
  return String(str).replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d));
};

const normalizeArabicText = (str) => {
  if (!str) return "";
  return toEnglishNumbers(str)
    .replace(/(^|\s)(حي|مخطط|رقم)(\s+|$)/g, "")
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ي/g, "ى")
    .replace(/[\s\-_]/g, "")
    .toLowerCase();
};

const normalizePlan = (str) => {
  if (!str) return "";
  let cleaned = toEnglishNumbers(str).replace(/\s+/g, "").replace(/\\/g, "/");
  if (cleaned.includes("/")) {
    cleaned = cleaned.split("/").sort().join("/");
  }
  return cleaned.toLowerCase();
};

const copyToClipboard = (text) => {
  if (!text) return toast.error("الحقل فارغ لا يوجد شيء لنسخه!");
  navigator.clipboard.writeText(text);
  toast.success("تم النسخ بنجاح! 📋");
};

const formatDate = (dateString) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

// ==========================================
// 💡 مكونات مساعدة
// ==========================================
function AiBadge({ status }) {
  if (!status || status === "غير مطبق")
    return <span className="text-[10px] text-slate-400 font-bold">—</span>;
  const config = {
    "تم التحليل": {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-200",
      icon: <CheckCircle2 size={10} />,
    },
    "يحتاج مراجعة": {
      bg: "bg-amber-50",
      text: "text-amber-700",
      border: "border-amber-200",
      icon: <AlertTriangle size={10} />,
    },
    "فشل التحليل": {
      bg: "bg-red-50",
      text: "text-red-700",
      border: "border-red-200",
      icon: <XCircle size={10} />,
    },
  }[status] || {
    bg: "bg-slate-50",
    text: "text-slate-500",
    border: "border-slate-200",
    icon: <Minus size={10} />,
  };

  return (
    <span
      className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] border ${config.bg} ${config.text} ${config.border}`}
    >
      {config.icon} {status}
    </span>
  );
}

function FormBadge({ form }) {
  const config = {
    يدوي: { bg: "bg-slate-100", text: "text-slate-600" },
    أصفر: { bg: "bg-yellow-50", text: "text-yellow-700" },
    أخضر: { bg: "bg-green-50", text: "text-green-700" },
  }[form] || { bg: "bg-gray-100", text: "text-gray-600" };

  return (
    <span
      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${config.bg} ${config.text}`}
    >
      {form || "—"}
    </span>
  );
}

// ==========================================
// 💡 السجل المركزي للرخص (الشاشة الرئيسية)
// ==========================================
// 🚀 التعديل 1: تمرير fixedOffice كـ Prop للشاشة (مثلاً: "مكتب ديتيلز")
export default function BuildingPermitsRegistry({ fixedOffice = null }) {
  const queryClient = useQueryClient();

  const [searchText, setSearchText] = useState("");
  const [filterSource, setFilterSource] = useState("");
  const [filterForm, setFilterForm] = useState("");
  const [hiddenCols, setHiddenCols] = useState(new Set());
  const [sort, setSort] = useState({ key: "archiveDate", dir: "desc" });

  const [selectedPermit, setSelectedPermit] = useState(null);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [colWidths, setColWidths] = useState(COLUMNS.map((c) => c.width));
  const [activeModal, setActiveModal] = useState(null);
  const [modalMode, setModalMode] = useState("add");
  const [editingPermit, setEditingPermit] = useState(null);
  const [chipFilter, setChipFilter] = useState("");
  const [copiedId, setCopiedId] = useState(null);

  const [showDuplicatesPanel, setShowDuplicatesPanel] = useState(false);
  const [isScanningDuplicates, setIsScanningDuplicates] = useState(false);
  const [duplicateGroups, setDuplicateGroups] = useState([]);

  const tableRef = useRef(null);

  const { data: serverPermits = [], isLoading } = useQuery({
    queryKey: ["building-permits"],
    queryFn: async () => {
      const res = await api.get("/permits");
      return res.data?.data || [];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => await api.delete(`/permits/${id}`),
    onSuccess: () => {
      toast.success("تم حذف الرخصة بنجاح");
      queryClient.invalidateQueries(["building-permits"]);
      if (selectedPermit) setSelectedPermit(null);
      if (showDuplicatesPanel) scanForDuplicates();
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "حدث خطأ أثناء الحذف"),
  });

  const visibleColumns = useMemo(
    () => COLUMNS.filter((c) => !hiddenCols.has(c.key)),
    [hiddenCols],
  );

  // 🚀 التعديل 2: فلترة السجل بناءً على المكتب المحدد
  const filtered = useMemo(() => {
    let data = serverPermits;

    // فلترة السجلات لتعرض رخص مكتبنا فقط
    if (fixedOffice) {
      data = data.filter((p) => p.engineeringOffice === fixedOffice);
    }

    if (searchText) {
      const s = searchText.toLowerCase();
      data = data.filter(
        (p) =>
          p.permitNumber?.includes(s) ||
          p.ownerName?.includes(s) ||
          p.idNumber?.includes(s) ||
          p.planNumber?.includes(s) ||
          p.district?.includes(s),
      );
    }
    if (filterSource) data = data.filter((p) => p.source === filterSource);
    if (filterForm) data = data.filter((p) => p.form === filterForm);

    if (chipFilter === "transactions")
      data = data.filter((p) => p.source === "نظام المعاملات");
    if (chipFilter === "ai-manual")
      data = data.filter((p) => p.source === "رفع يدوي (AI)");
    if (chipFilter === "green") data = data.filter((p) => p.form === "أخضر");
    return data;
  }, [
    serverPermits,
    searchText,
    filterSource,
    filterForm,
    chipFilter,
    fixedOffice,
  ]);

  const sorted = useMemo(() => {
    if (!sort.dir) return filtered;
    return [...filtered].sort((a, b) => {
      const av = a[sort.key];
      const bv = b[sort.key];
      if (typeof av === "number" && typeof bv === "number")
        return sort.dir === "asc" ? av - bv : bv - av;
      return sort.dir === "asc"
        ? String(av).localeCompare(String(bv), "ar")
        : String(bv).localeCompare(String(av), "ar");
    });
  }, [filtered, sort]);

  const handleSort = useCallback((key) => {
    setSort((prev) => ({
      key,
      dir:
        prev.key === key
          ? prev.dir === "asc"
            ? "desc"
            : prev.dir === "desc"
              ? null
              : "asc"
          : "asc",
    }));
  }, []);

  const toggleRow = (id) => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedRows.size === sorted.length) setSelectedRows(new Set());
    else setSelectedRows(new Set(sorted.map((p) => p.id)));
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const scanForDuplicates = useCallback(() => {
    setIsScanningDuplicates(true);
    setTimeout(() => {
      const groups = [];
      const processedIds = new Set();
      // 🚀 التعديل 3: الفحص يعمل على القائمة المفلترة فقط
      filtered.forEach((permit1) => {
        if (processedIds.has(permit1.id)) return;

        const similarPermits = filtered.filter((permit2) => {
          if (permit1.id === permit2.id) return false;
          const isExactPermitMatch =
            permit1.permitNumber &&
            permit1.permitNumber === permit2.permitNumber;
          const isIdAndPlanMatch =
            permit1.idNumber &&
            permit2.idNumber &&
            permit1.planNumber &&
            permit2.planNumber &&
            permit1.idNumber === permit2.idNumber &&
            permit1.planNumber === permit2.planNumber;
          const isPlotAndDistrictMatch =
            permit1.plotNumber &&
            permit2.plotNumber &&
            permit1.district &&
            permit2.district &&
            permit1.plotNumber === permit2.plotNumber &&
            permit1.district === permit2.district;
          return (
            isExactPermitMatch || isIdAndPlanMatch || isPlotAndDistrictMatch
          );
        });

        if (similarPermits.length > 0) {
          const groupMembers = [permit1, ...similarPermits];
          let reason = "تشابه محتمل";
          let type = "warning";
          if (
            similarPermits.some((p) => p.permitNumber === permit1.permitNumber)
          ) {
            reason = "تطابق تام في رقم الرخصة";
            type = "danger";
          } else if (
            similarPermits.some(
              (p) =>
                p.idNumber === permit1.idNumber &&
                p.planNumber === permit1.planNumber,
            )
          ) {
            reason = "تطابق في هوية المالك ورقم المخطط";
            type = "warning";
          } else {
            reason = "تطابق في رقم القطعة والحي";
            type = "info";
          }

          groups.push({
            id: `group-${permit1.id}`,
            reason,
            type,
            members: groupMembers,
          });
          groupMembers.forEach((p) => processedIds.add(p.id));
        }
      });

      setDuplicateGroups(groups.sort((a, b) => (a.type === "danger" ? -1 : 1)));
      setIsScanningDuplicates(false);

      if (groups.length === 0) {
        toast.success("السجل سليم! لا توجد أي تكرارات أو تشابهات.", {
          icon: "✨",
        });
      } else {
        toast.warning(`تم اكتشاف ${groups.length} حالة تشابه تحتاج للمراجعة.`);
      }
    }, 800);
  }, [filtered]);

  const stats = useMemo(() => {
    const permitNumbers = filtered.map((p) => p.permitNumber).filter(Boolean);
    const duplicatesCount = permitNumbers.length - new Set(permitNumbers).size;

    return {
      total: filtered.length,
      fromTransactions: filtered.filter((p) => p.source === "نظام المعاملات")
        .length,
      fromAI: filtered.filter((p) => p.source === "رفع يدوي (AI)").length,
      greenPermits: filtered.filter((p) => p.form === "أخضر").length,
      potentialDuplicates: duplicatesCount,
    };
  }, [filtered]);

  const chipFilters = [
    {
      id: "transactions",
      label: "من المعاملات",
      count: stats.fromTransactions,
      color: "emerald",
    },
    {
      id: "ai-manual",
      label: "أرشفة ذكية (AI)",
      count: stats.fromAI,
      color: "purple",
    },
    {
      id: "green",
      label: "رخص خضراء",
      count: stats.greenPermits,
      color: "green",
    },
  ];

  const getRowStyle = (permit, isActive, isSelected, isEven) => {
    let bg = isEven ? "rgba(248, 250, 252, 0.5)" : "transparent";
    let borderLeft = "3px solid transparent";

    if (permit.source === "نظام المعاملات") borderLeft = "3px solid #10b981";
    else if (permit.source === "رفع يدوي (AI)")
      borderLeft = "3px solid #a855f7";
    else if (permit.form === "أخضر") borderLeft = "3px solid #22c55e";

    if (isActive || isSelected) {
      bg = "rgba(59, 130, 246, 0.08)";
      borderLeft = "3px solid #3b82f6";
    }

    if (
      !showDuplicatesPanel &&
      duplicateGroups.some((g) => g.members.some((m) => m.id === permit.id))
    ) {
      bg = "rgba(239, 68, 68, 0.05)";
    }

    return { backgroundColor: bg, borderRight: borderLeft };
  };

  const renderCell = (permit, col) => {
    const val = permit[col.key];
    if (col.key === "form") return <FormBadge form={val} />;
    if (col.key === "source")
      return (
        <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-bold border border-blue-100">
          {val || "—"}
        </span>
      );
    if (col.key === "aiStatus") return <AiBadge status={val} />;
    if (col.key === "archiveDate")
      return (
        <span className="font-mono text-[10px] text-slate-500">
          {new Date(val).toLocaleDateString("en-GB")}
        </span>
      );

    return (
      <span className="truncate block font-semibold text-slate-700">
        {String(val || "—")}
      </span>
    );
  };

  return (
    <div
      className="flex-1 flex flex-col h-full overflow-hidden bg-[#fafbfc]"
      style={{ fontFamily: "Tajawal, sans-serif" }}
      dir="rtl"
    >
      <div className="shrink-0 flex items-center gap-3 px-4 py-3 bg-white border-b border-slate-200">
        {[
          {
            label: fixedOffice
              ? `إجمالي رخص ${fixedOffice}`
              : "إجمالي الرخص بالسجل",
            value: stats.total,
            icon: <Database size={16} />,
            color: "text-blue-600",
            bg: "bg-blue-50",
          },
          {
            label: "مخرجات نظام المعاملات",
            value: stats.fromTransactions,
            icon: <CheckCircle2 size={16} />,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
          },
          {
            label: "تمت أرشفتها بالذكاء الاصطناعي",
            value: stats.fromAI,
            icon: <Brain size={16} />,
            color: "text-purple-600",
            bg: "bg-purple-50",
          },
          {
            label: "رخص خضراء (إلكترونية)",
            value: stats.greenPermits,
            icon: <ScanLine size={16} />,
            color: "text-green-600",
            bg: "bg-green-50",
          },
        ].map((card, i) => (
          <div
            key={i}
            className="flex items-center gap-3 px-4 py-2 bg-white border border-slate-200 rounded-xl flex-1 min-w-0 shadow-sm"
          >
            <div
              className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center ${card.color} shrink-0`}
            >
              {card.icon}
            </div>
            <div className="min-w-0">
              <div className="text-lg font-black text-slate-800">
                {card.value}
              </div>
              <div className="text-[10px] font-bold text-slate-500 truncate">
                {card.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="shrink-0 bg-white border-b border-slate-200 relative z-20">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-2">
            <Layers size={18} className="text-blue-600" />
            <span className="text-base font-black text-slate-800">
              {fixedOffice ? `رخص ${fixedOffice}` : "السجل المركزي لرخص البناء"}
            </span>
            <span className="text-[10px] font-bold bg-slate-100 text-slate-500 rounded px-2 py-0.5 mt-1">
              {filtered.length} رخصة
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (!showDuplicatesPanel) scanForDuplicates();
                setShowDuplicatesPanel(!showDuplicatesPanel);
              }}
              className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all shadow-sm ${showDuplicatesPanel ? "bg-orange-50 border-orange-300 text-orange-700" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}
            >
              {isScanningDuplicates ? (
                <Loader2 size={14} className="animate-spin text-orange-500" />
              ) : (
                <BellRing
                  size={14}
                  className={
                    stats.potentialDuplicates > 0
                      ? "text-orange-500 animate-pulse"
                      : "text-slate-400"
                  }
                />
              )}
              <span className="text-xs font-bold">فحص التكرارات</span>
              {stats.potentialDuplicates > 0 && !showDuplicatesPanel && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full animate-bounce">
                  {stats.potentialDuplicates}
                </span>
              )}
            </button>

            <div className="w-px h-6 bg-slate-200 mx-1"></div>

            <SmartDropdownButton
              label="إضافه رخصة"
              icon={<Plus size={14} />}
              color="blue"
              options={[
                {
                  id: "manual",
                  label: "إدخال بيانات رخصة يدوياً",
                  icon: <Edit3 size={12} />,
                },
              ]}
              onSelect={() => {
                setModalMode("add");
                setEditingPermit(null);
                setActiveModal("manual");
              }}
              onMainClick={() => {
                setModalMode("add");
                setEditingPermit(null);
                setActiveModal("manual");
              }}
            />
            <SmartDropdownButton
              label="تحليل AI"
              icon={<Brain size={14} />}
              color="purple"
              options={[
                {
                  id: "upload-ai",
                  label: "رفع وتحليل رخصة (AI)",
                  icon: <Sparkles size={12} />,
                },
              ]}
              onSelect={(selectedId) => {
                setModalMode("add");
                setEditingPermit(null);
                setActiveModal(selectedId);
              }}
              onMainClick={() => {
                setModalMode("add");
                setEditingPermit(null);
                setActiveModal("upload-ai");
              }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-1.5 flex-1 max-w-md shadow-sm focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-100 transition-all">
            <Search size={14} className="text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="ابحث برقم الرخصة، الهوية، المالك..."
              className="bg-transparent text-xs font-bold text-slate-700 placeholder-slate-400 outline-none flex-1"
            />
            {searchText && (
              <button onClick={() => setSearchText("")}>
                <X size={12} className="text-slate-400 hover:text-red-500" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 mr-auto">
            <span className="text-[10px] font-bold text-slate-400 shrink-0">
              تصنيفات سريعة:
            </span>
            {chipFilters.map((chip) => {
              const isActive = chipFilter === chip.id;
              const colors = {
                emerald: isActive
                  ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                  : "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100",
                purple: isActive
                  ? "bg-purple-100 text-purple-800 border-purple-300"
                  : "bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100",
                green: isActive
                  ? "bg-green-100 text-green-800 border-green-300"
                  : "bg-green-50 text-green-600 border-green-200 hover:bg-green-100",
              }[chip.color];

              return (
                <button
                  key={chip.id}
                  onClick={() => setChipFilter(isActive ? "" : chip.id)}
                  className={`flex items-center gap-1.5 text-[10px] font-bold px-3 py-1 rounded-full border transition-all ${colors}`}
                >
                  {chip.label}{" "}
                  <span className="opacity-70 bg-white/50 px-1.5 rounded-full">
                    {chip.count}
                  </span>
                  {isActive && <X size={10} />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        {showDuplicatesPanel && (
          <div className="w-[380px] bg-white border-l border-slate-200 flex flex-col shadow-xl z-10 shrink-0 animate-in slide-in-from-right-4 duration-300">
            <div className="p-4 border-b border-slate-100 bg-orange-50/30 flex justify-between items-center">
              <div className="flex items-center gap-2 text-orange-800">
                <Files size={18} className="text-orange-500" />
                <h3 className="font-black text-sm">
                  مراجعة التكرارات والتشابهات
                </h3>
              </div>
              <button
                onClick={() => setShowDuplicatesPanel(false)}
                className="p-1.5 text-slate-400 hover:bg-white hover:text-slate-700 rounded-lg border border-transparent hover:border-slate-200 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            <div className="p-3 border-b border-slate-100 flex justify-between items-center bg-white">
              <span className="text-xs font-bold text-slate-600">
                نتائج الفحص الذكي:
              </span>
              <button
                onClick={scanForDuplicates}
                disabled={isScanningDuplicates}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold rounded-lg transition-colors"
              >
                <RefreshCw
                  size={12}
                  className={isScanningDuplicates ? "animate-spin" : ""}
                />{" "}
                إعادة الفحص
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar-slim bg-slate-50/50">
              {isScanningDuplicates ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <Brain
                    size={40}
                    className="text-orange-300 animate-pulse mb-4"
                  />
                  <p className="text-sm font-bold text-slate-600 mb-1">
                    جاري فحص وتدقيق السجلات...
                  </p>
                  <p className="text-[10px] text-slate-400">
                    نبحث عن أي تطابق في أرقام الرخص، الهويات، أو المواقع
                  </p>
                </div>
              ) : duplicateGroups.length > 0 ? (
                <div className="space-y-4">
                  {duplicateGroups.map((group, idx) => {
                    const isDanger = group.type === "danger";
                    const colors = isDanger
                      ? {
                          bg: "bg-red-50",
                          border: "border-red-200",
                          text: "text-red-800",
                          badge: "bg-red-100 text-red-700 border-red-200",
                        }
                      : {
                          bg: "bg-orange-50",
                          border: "border-orange-200",
                          text: "text-orange-800",
                          badge:
                            "bg-orange-100 text-orange-700 border-orange-200",
                        };

                    return (
                      <div
                        key={group.id}
                        className={`rounded-xl border ${colors.bg} ${colors.border} overflow-hidden shadow-sm`}
                      >
                        <div
                          className={`px-3 py-2 border-b ${colors.border} flex justify-between items-center bg-white/50`}
                        >
                          <span
                            className={`text-[11px] font-black ${colors.text} flex items-center gap-1.5`}
                          >
                            {isDanger ? (
                              <AlertTriangle size={12} />
                            ) : (
                              <Files size={12} />
                            )}
                            {group.reason}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border ${colors.badge}`}
                          >
                            {group.members.length} سجلات
                          </span>
                        </div>
                        <div className="p-2 space-y-1.5">
                          {group.members.map((member, mIdx) => (
                            <div
                              key={member.id}
                              onClick={() => setSelectedPermit(member)}
                              className="bg-white border border-slate-200 p-2.5 rounded-lg cursor-pointer hover:border-blue-400 hover:shadow-md transition-all group/item"
                            >
                              <div className="flex justify-between items-start mb-1.5">
                                <span className="font-mono text-xs font-bold text-blue-700 group-hover/item:underline">
                                  {member.permitNumber || "بدون رقم"}
                                </span>
                                <span className="text-[9px] text-slate-400 bg-slate-100 px-1.5 rounded">
                                  {formatDate(member.archiveDate)}
                                </span>
                              </div>
                              <div
                                className="text-[11px] font-bold text-slate-700 truncate mb-1"
                                title={member.ownerName}
                              >
                                {member.ownerName || "—"}
                              </div>
                              <div className="flex justify-between items-center text-[10px] text-slate-500">
                                <span>{member.district || "—"}</span>
                                <span className="font-mono bg-slate-50 border border-slate-100 px-1 rounded">
                                  {member.idNumber || "—"}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-16 h-16 bg-emerald-50 border-2 border-emerald-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 size={24} className="text-emerald-500" />
                  </div>
                  <h4 className="text-sm font-black text-slate-700 mb-1">
                    السجل سليم تماماً!
                  </h4>
                  <p className="text-xs text-slate-500 max-w-[200px]">
                    لم يكتشف الذكاء الاصطناعي أي تكرارات أو تشابهات مريبة في
                    الرخص المسجلة.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex-1 flex flex-col overflow-hidden bg-white relative">
          <div
            className="flex-1 overflow-auto custom-scrollbar-slim"
            ref={tableRef}
          >
            <table className="w-max min-w-full text-[11px] border-collapse">
              <thead className="sticky top-0 z-10">
                <tr className="bg-slate-100 shadow-sm">
                  <th className="sticky right-0 z-20 bg-slate-100 px-2 py-2 border-b border-l border-slate-200 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={
                        selectedRows.size === sorted.length && sorted.length > 0
                      }
                      onChange={toggleAll}
                      className="w-3.5 h-3.5 accent-blue-600 rounded"
                    />
                  </th>
                  {visibleColumns.map((col, ci) => (
                    <th
                      key={col.key}
                      className="px-3 py-2 border-b border-l border-slate-200 text-right text-[11px] font-black text-slate-700 select-none whitespace-nowrap cursor-pointer hover:bg-slate-200 transition-colors"
                      style={{ width: colWidths[ci] }}
                      onClick={() => handleSort(col.key)}
                    >
                      <span className="flex items-center gap-1">
                        {col.label}
                        {sort.key === col.key &&
                          (sort.dir === "asc" ? (
                            <ArrowUp size={10} className="text-blue-600" />
                          ) : (
                            <ArrowDown size={10} className="text-blue-600" />
                          ))}
                      </span>
                    </th>
                  ))}
                  <th className="px-3 py-2 border-b border-slate-200 text-[11px] font-black text-slate-700 text-center w-28">
                    إجراءات
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={visibleColumns.length + 2}
                      className="text-center py-12"
                    >
                      <Loader2 className="w-6 h-6 animate-spin text-blue-500 mx-auto" />
                    </td>
                  </tr>
                ) : sorted.length === 0 ? (
                  <tr>
                    <td
                      colSpan={visibleColumns.length + 2}
                      className="text-center py-12 text-slate-400 font-bold text-sm"
                    >
                      <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />{" "}
                      لا توجد رخص مسجلة
                    </td>
                  </tr>
                ) : (
                  sorted.map((permit, ri) => {
                    const isActive = selectedPermit?.id === permit.id;
                    const isSelected = selectedRows.has(permit.id);
                    const rowStyle = getRowStyle(
                      permit,
                      isActive,
                      isSelected,
                      ri % 2 === 0,
                    );

                    return (
                      <tr
                        key={permit.id}
                        className="border-b border-slate-100 cursor-pointer transition-all hover:shadow-sm"
                        style={rowStyle}
                        onClick={() => setSelectedPermit(permit)}
                      >
                        <td
                          className="sticky right-0 z-10 px-2 py-1.5 border-l border-slate-100 text-center"
                          style={{ backgroundColor: "inherit" }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            checked={selectedRows.has(permit.id)}
                            onChange={() => toggleRow(permit.id)}
                            className="w-3.5 h-3.5 accent-blue-600 rounded"
                          />
                        </td>
                        {visibleColumns.map((col) => (
                          <td
                            key={col.key}
                            className="px-3 py-2 border-l border-slate-100 whitespace-nowrap"
                          >
                            {col.key === "permitNumber" ||
                            col.key === "idNumber" ? (
                              <span className="flex items-center gap-1 group/copy">
                                <span className="font-mono font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100/50">
                                  {String(permit[col.key] || "—")}
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    copyToClipboard(
                                      String(permit[col.key]),
                                      `${permit.id}-${col.key}`,
                                    );
                                  }}
                                  className="opacity-0 group-hover/copy:opacity-100 text-slate-400 hover:text-blue-600 transition-opacity"
                                >
                                  {copiedId === `${permit.id}-${col.key}` ? (
                                    <Check
                                      size={11}
                                      className="text-emerald-500"
                                    />
                                  ) : (
                                    <Copy size={11} />
                                  )}
                                </button>
                              </span>
                            ) : (
                              renderCell(permit, col)
                            )}
                          </td>
                        ))}
                        <td
                          className="px-2 py-1.5 text-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => setSelectedPermit(permit)}
                              title="معاينة التفاصيل"
                              className="p-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-100 rounded-lg text-blue-600 transition-colors"
                            >
                              <Eye size={14} />
                            </button>
                            <button
                              onClick={() => {
                                setModalMode("edit");
                                setEditingPermit(permit);
                                setActiveModal("manual");
                              }}
                              title="تعديل الرخصة"
                              className="p-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-100 rounded-lg text-amber-600 transition-colors"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button
                              onClick={() => {
                                if (
                                  window.confirm(
                                    "حذف الرخصة نهائياً؟ لا يمكن التراجع عن هذا الإجراء.",
                                  )
                                )
                                  deleteMutation.mutate(permit.id);
                              }}
                              title="حذف الرخصة"
                              className="p-1.5 bg-red-50 hover:bg-red-100 border border-red-100 rounded-lg text-red-500 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Footer Bar */}
          <div className="bg-slate-50 border-t border-slate-200 p-2 text-[11px] text-slate-500 font-bold flex justify-between items-center shrink-0">
            <span>
              تم عرض {sorted.length} من أصل {serverPermits.length} رخصة
            </span>
            {showDuplicatesPanel && duplicateGroups.length > 0 && (
              <span className="text-red-500 flex items-center gap-1">
                <AlertTriangle size={12} /> يرجى مراجعة التشابهات المكتشفة
                باللوحة الجانبية
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 💡 المودلز المساعدة والنافذة الخاصة بالتفاصيل */}
      {selectedPermit && (
        <ModalPermitDetails
          permit={selectedPermit}
          onClose={() => setSelectedPermit(null)}
        />
      )}

      {/* 🚀 التعديل 4: تمرير fixedOffice للمودلز عند الفتح */}
      {activeModal === "manual" && (
        <ModalManualPermit
          mode={modalMode}
          permitData={editingPermit}
          onClose={() => setActiveModal(null)}
          fixedOffice={fixedOffice}
        />
      )}
      {activeModal === "upload-ai" && (
        <ModalUploadAi
          onClose={() => setActiveModal(null)}
          fixedOffice={fixedOffice}
        />
      )}
    </div>
  );
}

// ==========================================
// 💡 مكون القائمة الذكية القابلة للبحث
// ==========================================
const SearchableDropdown = ({
  options,
  value,
  onChange,
  placeholder,
  isAdding,
  onQuickAdd,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target))
        setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = useMemo(() => {
    if (!searchTerm) return options;
    return options.filter((opt) =>
      opt.label.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [options, searchTerm]);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div className="flex gap-2">
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-bold text-slate-700 cursor-pointer flex items-center justify-between hover:border-blue-400 focus:ring-1 focus:ring-blue-400 focus:bg-white transition-all"
        >
          <span>{selectedOption ? selectedOption.label : placeholder}</span>
          <ChevronLeft
            size={14}
            className={`text-slate-400 transition-transform ${isOpen ? "-rotate-90" : ""}`}
          />
        </div>
        {onQuickAdd && (
          <button
            onClick={onQuickAdd}
            disabled={isAdding}
            className="px-3 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 disabled:opacity-50 transition-colors"
            title="إضافة سريعة"
          >
            {isAdding ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Plus size={16} />
            )}
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute z-[100] w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
          <div className="p-2 border-b border-slate-100 bg-slate-50 sticky top-0">
            <div className="relative">
              <Search
                size={14}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                className="w-full pl-3 pr-8 py-2 text-[11px] font-bold border border-slate-200 rounded-lg outline-none focus:border-blue-400"
                placeholder="اكتب للبحث..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />
            </div>
          </div>
          <div className="overflow-y-auto p-1 custom-scrollbar-slim">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <div
                  key={opt.value}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                    setSearchTerm("");
                  }}
                  className={`px-3 py-2 text-[11px] font-bold rounded-lg cursor-pointer transition-colors ${value === opt.value ? "bg-blue-50 text-blue-700" : "text-slate-700 hover:bg-slate-50"}`}
                >
                  {opt.label}
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-[11px] text-slate-400 font-bold">
                لا توجد نتائج مطابقة
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 💡 مكون الحقل الذكي للربط
// ==========================================
const SmartLinkedField = ({
  label,
  value,
  onChange,
  options,
  matchFn,
  onQuickAdd,
  isAdding,
  placeholder,
  listId,
  linkedId,
  disabled = false,
}) => {
  const isLinked = useMemo(() => {
    if (linkedId) return true;
    if (!value || value.trim() === "") return false;
    return options.some((opt) => matchFn(opt, value));
  }, [value, options, matchFn, linkedId]);

  return (
    <div className="flex flex-col gap-1 w-full">
      <div className="flex items-center justify-between mb-0.5">
        <label className="text-[11px] font-bold text-slate-500 flex items-center gap-2">
          {label}
          <button
            onClick={() => copyToClipboard(value)}
            className="text-slate-400 hover:text-blue-600 transition-colors"
            title="نسخ المحتوى"
          >
            <Copy size={12} />
          </button>
        </label>
        {!disabled &&
          value &&
          value.trim() !== "" &&
          (isLinked ? (
            <span className="flex items-center gap-1 text-[9px] text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded font-bold shadow-sm">
              <CheckCircle2 size={10} /> مسجل
            </span>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded font-bold flex items-center gap-0.5 shadow-sm">
                <AlertTriangle size={10} /> غير مسجل
              </span>
              {onQuickAdd && (
                <button
                  onClick={onQuickAdd}
                  disabled={isAdding}
                  className="text-[9px] bg-blue-600 text-white hover:bg-blue-700 px-2 py-0.5 rounded font-bold flex items-center gap-1 transition-all shadow-sm disabled:opacity-50"
                  title="إضافة سريعة للنظام"
                >
                  {isAdding ? (
                    <Loader2 size={10} className="animate-spin" />
                  ) : (
                    <Plus size={10} />
                  )}{" "}
                  إضافة
                </button>
              )}
            </div>
          ))}
      </div>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(toEnglishNumbers(e.target.value))}
          disabled={disabled}
          className={`w-full px-3 py-2 border rounded-lg text-[11px] font-bold outline-none transition-all ${
            disabled
              ? "bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed"
              : value && isLinked
                ? "border-emerald-300 focus:ring-1 focus:ring-emerald-400 bg-white text-slate-700"
                : "bg-slate-50 border-slate-200 focus:ring-1 focus:ring-blue-400 focus:bg-white text-slate-700"
          }`}
          placeholder={placeholder}
          list={listId}
        />
        {!disabled && (
          <datalist id={listId}>
            {options.map((opt, idx) => (
              <option
                key={idx}
                value={opt.name || opt.nameAr || opt.label || opt.planNumber}
              />
            ))}
          </datalist>
        )}
      </div>
    </div>
  );
};

// ==========================================
// 💡 مكون الإدخال العادي القابل للنسخ
// ==========================================
const CopyableInput = ({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  dir = "rtl",
  style = {},
  warning = null,
  disabled = false,
}) => (
  <div className="space-y-1">
    <div className="flex items-center justify-between mb-0.5">
      <label className="text-[11px] font-bold text-slate-500 flex items-center gap-2">
        {label}
        {warning && (
          <span className="flex items-center gap-1 bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded text-[9px] border border-amber-300 shadow-sm animate-pulse">
            <AlertTriangle size={10} /> {warning}
          </span>
        )}
        <button
          onClick={() => copyToClipboard(value)}
          className="text-slate-400 hover:text-blue-600 transition-colors"
          title="نسخ المحتوى"
        >
          <Copy size={12} />
        </button>
      </label>
    </div>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      dir={dir}
      style={style}
      disabled={disabled}
      className={`w-full text-[11px] font-bold border rounded-lg px-3 py-2 outline-none transition-colors ${disabled ? "bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed" : warning ? "border-amber-400 bg-amber-50 focus:ring-amber-500 text-amber-900" : "border-slate-200 bg-slate-50 text-slate-700 focus:ring-blue-400 focus:bg-white"}`}
    />
  </div>
);
// ==========================================
// 💡 المودل الرئيسي للإضافة اليدوية
// ==========================================
// ==========================================
// 💡 المودل الرئيسي للإضافة اليدوية
// ==========================================
export function ModalManualPermit({
  mode = "add",
  permitData = null,
  onClose,
  fixedOffice,
}) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);

  const { data: clients = [] } = useQuery({
    queryKey: ["clients-simple"],
    queryFn: async () => (await api.get("/clients/simple")).data || [],
  });
  const { data: offices = [] } = useQuery({
    queryKey: ["offices-list"],
    queryFn: async () =>
      (await api.get("/intermediary-offices")).data?.data || [],
  });
  const { data: districtsTree = [], isLoading: loadingDistricts } = useQuery({
    queryKey: ["districts-tree-list"],
    queryFn: async () => (await api.get("/riyadh-streets/tree")).data || [],
  });
  const { data: sectors = [] } = useQuery({
    queryKey: ["sectors-list"],
    queryFn: async () => (await api.get("/riyadh-streets/sectors")).data || [],
  });
  const { data: plans = [] } = useQuery({
    queryKey: ["plans-list"],
    queryFn: async () => (await api.get("/riyadh-streets/plans")).data || [],
  });
  const { data: ownerships = [] } = useQuery({
    queryKey: ["properties-list"],
    queryFn: async () => (await api.get("/properties")).data?.data || [],
  });
  const { data: privateTransactions = [] } = useQuery({
    queryKey: ["private-transactions-list"],
    queryFn: async () =>
      (await api.get("/private-transactions")).data?.data || [],
  });
  const { data: existingPermits = [] } = useQuery({
    queryKey: ["building-permits"],
    queryFn: async () => (await api.get("/permits")).data?.data || [],
  });

  const flatDistricts = useMemo(() => {
    let all = [];
    districtsTree.forEach((s) => {
      if (s.neighborhoods)
        all = [
          ...all,
          ...s.neighborhoods.map((n) => ({ ...n, sectorName: s.name })),
        ];
    });
    return all;
  }, [districtsTree]);

  const quickAddClient = useMutation({
    mutationFn: async (data) => await api.post("/clients", data),
    onSuccess: () => {
      toast.success("تمت إضافة العميل بنجاح!");
      queryClient.invalidateQueries(["clients-simple"]);
    },
  });
  const quickAddDistrict = useMutation({
    mutationFn: async (data) =>
      await api.post("/riyadh-streets/districts", data),
    onSuccess: () => {
      toast.success("تمت إضافة الحي بنجاح!");
      queryClient.invalidateQueries(["districts-tree-list"]);
    },
  });
  const quickAddOffice = useMutation({
    mutationFn: async (data) => await api.post("/intermediary-offices", data),
    onSuccess: () => {
      toast.success("تمت إضافة المكتب بنجاح!");
      queryClient.invalidateQueries(["offices-list"]);
    },
  });
  const quickAddPlan = useMutation({
    mutationFn: async (data) => await api.post("/riyadh-streets/plans", data),
    onSuccess: () => {
      toast.success("تمت إضافة المخطط بنجاح!");
      queryClient.invalidateQueries(["plans-list"]);
    },
  });

  // 💡 State الخاصة بأزرار ولوحة الربط العلوية
  const [linkingMode, setLinkingMode] = useState(null);
  const [selectedValue, setSelectedValue] = useState("");

  const [formData, setFormData] = useState({
    permitNumber: "",
    year: "1446",
    type: "بناء جديد",
    form: "يدوي",
    ownerName: "",
    idNumber: "",
    district: "",
    sector: "",
    plotNumber: "",
    planNumber: "",
    landArea: "",
    mainUsage: "سكني",
    subUsage: "",
    engineeringOffice: fixedOffice || "",
    source: "يدوي",
    notes: "",
    issueDate: "",
    expiryDate: "",
    file: null,

    // 💡 حقول الربط
    linkedClientId: "",
    linkedOfficeId: "",
    linkedOwnershipId: "",
    linkedTransactionId: "",
  });

  useEffect(() => {
    if (mode === "edit" && permitData) {
      setFormData({
        ...permitData,
        mainUsage: permitData.mainUsage || permitData.usage || "سكني",
        subUsage: permitData.subUsage || "",
        landArea: permitData.landArea || "",
        notes: permitData.notes || "",
        expiryDate: permitData.expiryDate || "",
        engineeringOffice: fixedOffice || permitData.engineeringOffice || "",
        linkedClientId: permitData.linkedClientId || "",
        linkedOfficeId: permitData.linkedOfficeId || "",
        linkedOwnershipId: permitData.linkedOwnershipId || "",
        linkedTransactionId: permitData.linkedTransactionId || "",
        file: null,
      });
    }
  }, [mode, permitData, fixedOffice]);

  useEffect(() => {
    if (formData.district && flatDistricts.length > 0) {
      const found = flatDistricts.find((d) => d.name === formData.district);
      if (found && formData.sector !== `قطاع ${found.sectorName}`) {
        setFormData((prev) => ({
          ...prev,
          sector: `قطاع ${found.sectorName}`,
        }));
      }
    }
  }, [formData.district, flatDistricts]);

  const duplicateWarning = useMemo(() => {
    if (!formData.permitNumber || formData.permitNumber.trim() === "")
      return null;
    const others =
      mode === "edit"
        ? existingPermits.filter((p) => p.id !== permitData.id)
        : existingPermits;
    const duplicatePermit = others.find(
      (p) =>
        String(p.permitNumber) ===
        String(toEnglishNumbers(formData.permitNumber)),
    );
    if (duplicatePermit) {
      return {
        ownerName: duplicatePermit.ownerName || "غير محدد",
        year: duplicatePermit.year || "غير محدد",
        idNumber: duplicatePermit.idNumber || "غير محدد",
      };
    }
    return null;
  }, [formData.permitNumber, existingPermits, mode, permitData]);

  const expiryInfo = useMemo(() => {
    if (!formData.expiryDate) return null;
    try {
      const gregorianDate = moment(
        toEnglishNumbers(formData.expiryDate),
        "iYYYY/iM/iD",
      ).format("YYYY-MM-DD");
      if (gregorianDate === "Invalid date") return null;
      const end = new Date(gregorianDate);
      const now = new Date();
      end.setHours(0, 0, 0, 0);
      now.setHours(0, 0, 0, 0);
      const diffTime = end - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return {
        gregorian: gregorianDate,
        diffDays: diffDays,
        isValid: diffDays >= 0,
      };
    } catch (e) {
      return null;
    }
  }, [formData.expiryDate]);

  const issueInfo = useMemo(() => {
    if (!formData.year || formData.year.length !== 4) return null;
    const currentHijriYear = moment().iYear();
    const parsedYear = parseInt(toEnglishNumbers(formData.year));
    if (isNaN(parsedYear)) return null;
    const diff = currentHijriYear - parsedYear;
    return diff >= 0 ? diff : 0;
  }, [formData.year]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      const fd = new FormData();
      Object.keys(data).forEach((key) => {
        let safeValue = data[key];
        if (
          [
            "permitNumber",
            "idNumber",
            "plotNumber",
            "planNumber",
            "landArea",
            "year",
            "expiryDate",
          ].includes(key)
        ) {
          safeValue = toEnglishNumbers(data[key]);
        }
        if (key === "file" && data.file) fd.append("file", data.file);
        else if (
          key !== "file" &&
          safeValue !== null &&
          safeValue !== undefined &&
          safeValue !== ""
        )
          fd.append(key, safeValue);
      });

      if (mode === "edit")
        return await api.put(`/permits/${permitData.id}`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      else
        return await api.post("/permits", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
    },
    onSuccess: () => {
      toast.success(
        mode === "add"
          ? "تم حفظ وتسجيل الرخصة بنجاح"
          : "تم تحديث بيانات الرخصة بنجاح",
      );
      queryClient.invalidateQueries(["building-permits"]);
      onClose();
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "حدث خطأ أثناء الحفظ"),
  });

  const handleSubmit = () => {
    if (!formData.permitNumber || !formData.ownerName)
      return toast.error("يرجى إدخال رقم الرخصة واسم المالك كحد أدنى");
    saveMutation.mutate(formData);
  };

  // 💡 دوال الربط اليدوي العلوية
  const handleApplyLink = () => {
    if (!selectedValue) return toast.error("يرجى اختيار السجل من القائمة");

    if (linkingMode === "client")
      setFormData({ ...formData, linkedClientId: selectedValue });
    if (linkingMode === "office")
      setFormData({ ...formData, linkedOfficeId: selectedValue });
    if (linkingMode === "ownership")
      setFormData({ ...formData, linkedOwnershipId: selectedValue });
    if (linkingMode === "privateTransaction")
      setFormData({ ...formData, linkedTransactionId: selectedValue });

    setLinkingMode(null);
    setSelectedValue("");
    toast.success("تم تحديد السجل للربط، سيتم حفظه مع الرخصة.");
  };

  const getOptions = (mode) => {
    if (mode === "client")
      return clients.map((c) => ({ label: c.name, value: c.id }));
    if (mode === "office")
      return offices.map((o) => ({ label: o.nameAr || o.name, value: o.id }));
    if (mode === "ownership")
      return ownerships.map((o) => ({
        label: `صك رقم: ${o.deedNumber || o.id}`,
        value: o.id,
      }));
    if (mode === "privateTransaction")
      return privateTransactions.map((t) => ({
        label: `رقم: ${t.ref || t.id} - ${t.client}`,
        value: t.id,
      }));
    return [];
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4 animate-in fade-in"
      dir="rtl"
    >
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-5xl w-full mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 rounded-t-xl bg-blue-600 shrink-0">
          <div className="flex items-center gap-2 text-white">
            <Edit3 className="w-5 h-5" />
            <span className="text-base font-bold">
              {mode === "add" ? "إضافة رخصة يدوية ذكية" : "تعديل بيانات الرخصة"}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/20 rounded-lg text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 💡 أزرار الربط في أعلى النموذج (إضافة جديدة) */}
        <div className="bg-slate-50 p-4 border-b border-slate-200 shrink-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-slate-600 ml-2">
              <Link size={14} className="inline mr-1 text-blue-500" /> إضافة
              ارتباط للرخصة:
            </span>
            {!formData.linkedClientId && (
              <button
                onClick={() => {
                  setLinkingMode("client");
                  setSelectedValue("");
                }}
                className={`flex-1 min-w-[100px] p-2 border rounded-lg flex items-center justify-center gap-1.5 transition-all ${linkingMode === "client" ? "border-blue-500 bg-blue-100 text-blue-700 shadow-sm" : "border-slate-200 bg-white text-slate-500 hover:border-blue-300"}`}
              >
                <User size={14} />{" "}
                <span className="text-[10px] font-black">بعميل</span>
              </button>
            )}
            {!formData.linkedOfficeId && (
              <button
                onClick={() => {
                  setLinkingMode("office");
                  setSelectedValue("");
                }}
                className={`flex-1 min-w-[100px] p-2 border rounded-lg flex items-center justify-center gap-1.5 transition-all ${linkingMode === "office" ? "border-blue-500 bg-blue-100 text-blue-700 shadow-sm" : "border-slate-200 bg-white text-slate-500 hover:border-blue-300"}`}
              >
                <Briefcase size={14} />{" "}
                <span className="text-[10px] font-black">بمكتب</span>
              </button>
            )}
            {!formData.linkedOwnershipId && (
              <button
                onClick={() => {
                  setLinkingMode("ownership");
                  setSelectedValue("");
                }}
                className={`flex-1 min-w-[100px] p-2 border rounded-lg flex items-center justify-center gap-1.5 transition-all ${linkingMode === "ownership" ? "border-blue-500 bg-blue-100 text-blue-700 shadow-sm" : "border-slate-200 bg-white text-slate-500 hover:border-blue-300"}`}
              >
                <Building size={14} />{" "}
                <span className="text-[10px] font-black">بملكية</span>
              </button>
            )}
            {!formData.linkedTransactionId && (
              <button
                onClick={() => {
                  setLinkingMode("privateTransaction");
                  setSelectedValue("");
                }}
                className={`flex-1 min-w-[100px] p-2 border rounded-lg flex items-center justify-center gap-1.5 transition-all ${linkingMode === "privateTransaction" ? "border-blue-500 bg-blue-100 text-blue-700 shadow-sm" : "border-slate-200 bg-white text-slate-500 hover:border-blue-300"}`}
              >
                <FileSignature size={14} />{" "}
                <span className="text-[10px] font-black">بمعاملة فرعية</span>
              </button>
            )}
          </div>

          {/* منطقة البحث المنسدلة للربط */}
          {linkingMode && (
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-2">
              <div className="flex-1">
                <SearchableDropdown
                  options={getOptions(linkingMode)}
                  value={selectedValue}
                  onChange={(val) => setSelectedValue(val)}
                  placeholder={`ابحث واختر ${linkingMode === "client" ? "العميل" : linkingMode === "office" ? "المكتب" : linkingMode === "ownership" ? "الملكية" : "المعاملة"}...`}
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleApplyLink}
                  className="px-4 py-2.5 bg-blue-600 text-white text-[10px] font-black rounded-lg hover:bg-blue-700 shadow-sm transition-colors"
                >
                  اختيار وربط
                </button>
                <button
                  onClick={() => setLinkingMode(null)}
                  className="px-3 py-2.5 bg-white text-slate-500 border border-slate-200 text-[10px] font-black rounded-lg hover:bg-slate-50 transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </div>
          )}

          {/* استعراض السجلات المربوطة المضافة حديثاً */}
          <div className="flex flex-wrap gap-2 mt-3">
            {formData.linkedClientId && (
              <span className="flex items-center gap-1.5 bg-emerald-100 text-emerald-800 px-3 py-1.5 rounded-lg text-[10px] font-bold border border-emerald-200">
                <User size={12} /> عميل:{" "}
                {clients.find((c) => c.id === formData.linkedClientId)?.name ||
                  "مربوط"}
                <button
                  onClick={() =>
                    setFormData({ ...formData, linkedClientId: "" })
                  }
                  className="text-emerald-500 hover:text-red-500 ml-1"
                >
                  <X size={12} />
                </button>
              </span>
            )}
            {formData.linkedOfficeId && (
              <span className="flex items-center gap-1.5 bg-emerald-100 text-emerald-800 px-3 py-1.5 rounded-lg text-[10px] font-bold border border-emerald-200">
                <Briefcase size={12} /> مكتب:{" "}
                {offices.find((o) => o.id === formData.linkedOfficeId)
                  ?.nameAr || "مربوط"}
                <button
                  onClick={() =>
                    setFormData({ ...formData, linkedOfficeId: "" })
                  }
                  className="text-emerald-500 hover:text-red-500 ml-1"
                >
                  <X size={12} />
                </button>
              </span>
            )}
            {formData.linkedOwnershipId && (
              <span className="flex items-center gap-1.5 bg-emerald-100 text-emerald-800 px-3 py-1.5 rounded-lg text-[10px] font-bold border border-emerald-200">
                <Building size={12} /> ملكية:{" "}
                {ownerships.find((o) => o.id === formData.linkedOwnershipId)
                  ?.deedNumber || "مربوط"}
                <button
                  onClick={() =>
                    setFormData({ ...formData, linkedOwnershipId: "" })
                  }
                  className="text-emerald-500 hover:text-red-500 ml-1"
                >
                  <X size={12} />
                </button>
              </span>
            )}
            {formData.linkedTransactionId && (
              <span className="flex items-center gap-1.5 bg-emerald-100 text-emerald-800 px-3 py-1.5 rounded-lg text-[10px] font-bold border border-emerald-200">
                <FileSignature size={12} /> معاملة:{" "}
                {privateTransactions.find(
                  (t) => t.id === formData.linkedTransactionId,
                )?.ref || "مربوط"}
                <button
                  onClick={() =>
                    setFormData({ ...formData, linkedTransactionId: "" })
                  }
                  className="text-emerald-500 hover:text-red-500 ml-1"
                >
                  <X size={12} />
                </button>
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6 custom-scrollbar-slim bg-[#fafbfc]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2">
              <SmartLinkedField
                label="اسم المالك (العميل) *"
                value={formData.ownerName}
                linkedId={formData.linkedClientId}
                onChange={(val) => {
                  const found = clients.find(
                    (c) => c.name === val || c.idNumber === formData.idNumber,
                  );
                  setFormData({
                    ...formData,
                    ownerName: val,
                    linkedClientId: found ? found.id : "",
                  });
                }}
                options={clients}
                listId="manualClientsList"
                placeholder="ابحث أو اكتب اسم العميل..."
                matchFn={(opt, val) =>
                  normalizeArabicText(opt.fullNameRaw) ===
                    normalizeArabicText(val) ||
                  opt.idNumber === formData.idNumber
                }
                isAdding={quickAddClient.isPending}
                onQuickAdd={() =>
                  quickAddClient.mutate({
                    name: JSON.stringify({ ar: formData.ownerName }),
                    officialNameAr: formData.ownerName,
                    idNumber: formData.idNumber || `TMP-${Date.now()}`,
                    type: "individual",
                    mobile: "0500000000",
                  })
                }
              />
            </div>

            <CopyableInput
              label="رقم الهوية"
              value={formData.idNumber}
              onChange={(val) => setFormData({ ...formData, idNumber: val })}
              placeholder="10 أرقام"
              dir="ltr"
              style={{ textAlign: "right" }}
            />

            <div className="space-y-1 relative">
              <div className="flex items-center justify-between mb-0.5">
                <label className="text-[11px] font-bold text-slate-500 flex items-center gap-2">
                  رقم الرخصة *
                  {duplicateWarning && (
                    <span className="flex items-center gap-1 bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded text-[9px] border border-amber-300 shadow-sm animate-pulse">
                      <AlertTriangle size={10} /> تنبيه: مكرر
                    </span>
                  )}
                  <button
                    onClick={() => copyToClipboard(formData.permitNumber)}
                    className="text-slate-400 hover:text-blue-600 transition-colors"
                    title="نسخ المحتوى"
                  >
                    <Copy size={12} />
                  </button>
                </label>
              </div>
              <input
                type="text"
                value={formData.permitNumber}
                onChange={(e) =>
                  setFormData({ ...formData, permitNumber: e.target.value })
                }
                placeholder="مثال: 1445/1234"
                dir="rtl"
                className={`w-full text-[11px] font-bold border rounded-lg px-3 py-2 outline-none focus:ring-1 transition-colors ${duplicateWarning ? "bg-amber-50 border-amber-300 focus:ring-amber-400 text-amber-900" : "bg-slate-50 border-slate-200 text-slate-700 focus:ring-blue-400 focus:bg-white"}`}
              />
              {duplicateWarning && (
                <div className="absolute top-[100%] left-0 right-0 mt-1 z-10 bg-amber-50 border border-amber-200 rounded-lg p-2.5 shadow-lg text-[10px] leading-relaxed animate-in fade-in zoom-in-95">
                  <div className="font-bold text-amber-800 mb-1 flex items-center gap-1">
                    <AlertTriangle size={12} className="text-amber-600" /> هذا
                    الرقم مسجل في النظام مسبقاً!
                  </div>
                  <div className="text-amber-700 font-semibold space-y-0.5">
                    <div>
                      المالك السابق:{" "}
                      <span className="font-bold">
                        {duplicateWarning.ownerName}
                      </span>
                    </div>
                    <div className="flex gap-3">
                      <span>
                        السنة:{" "}
                        <span className="font-bold">
                          {duplicateWarning.year}
                        </span>
                      </span>
                      <span>
                        الهوية:{" "}
                        <span className="font-bold">
                          {duplicateWarning.idNumber}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <CopyableInput
                label="سنة الرخصة"
                type="text"
                value={formData.year}
                onChange={(val) => setFormData({ ...formData, year: val })}
                placeholder="مثال: 1447"
              />
              {issueInfo !== null && (
                <div className="text-[9px] text-slate-500 font-bold flex items-center gap-1">
                  <Clock size={10} /> صُدرت منذ {issueInfo} سنة
                </div>
              )}
            </div>

            <div className="space-y-1">
              <CopyableInput
                label="تاريخ الانتهاء (هجري)"
                type="text"
                value={formData.expiryDate}
                onChange={(val) =>
                  setFormData({ ...formData, expiryDate: val })
                }
                placeholder="يوم/شهر/سنة (مثال: 1445/05/12)"
              />
              {expiryInfo && (
                <div className="flex flex-col gap-0.5 mt-1">
                  <div className="text-[9px] font-bold text-slate-500 flex items-center gap-1">
                    <CalendarDays size={10} /> الميلادي:{" "}
                    <span dir="ltr">{expiryInfo.gregorian}</span>
                  </div>
                  <div
                    className={`text-[9px] font-bold flex items-center gap-1 ${expiryInfo.isValid ? "text-emerald-600" : "text-red-600"}`}
                  >
                    <Clock size={10} />{" "}
                    {expiryInfo.isValid
                      ? `سارية المفعول (متبقي ${expiryInfo.diffDays} يوم)`
                      : `منتهية (منذ ${Math.abs(expiryInfo.diffDays)} يوم)`}
                  </div>
                </div>
              )}
            </div>

            <CopyableInput
              label="القطاع (تلقائي)"
              value={formData.sector}
              onChange={() => {}}
              placeholder="يحدد تلقائياً حسب الحي"
              disabled={true}
            />

            <div>
              <SmartLinkedField
                label="الحي"
                value={formData.district} // 👈 لاحظ استخدمنا formData
                linkedId={formData.linkedDistrictId}
                onChange={(val) =>
                  setFormData({
                    ...formData,
                    district: val,
                    linkedDistrictId: "",
                  })
                }
                options={flatDistricts}
                listId="manualDistrictsList"
                placeholder={
                  loadingDistricts ? "جاري التحميل..." : "ابحث أو اكتب الحي..."
                }
                matchFn={(opt, val) => {
                  const normOpt = normalizeArabicText(opt.name);
                  const normVal = normalizeArabicText(val);
                  // 💡 التعديل هنا: منع التطابق إذا كانت القيمة فارغة
                  if (!normOpt || !normVal) return false;
                  return normOpt.includes(normVal) || normVal.includes(normOpt);
                }}
                isAdding={quickAddDistrict.isPending}
                onQuickAdd={() =>
                  quickAddDistrict.mutate({
                    name: formData.district,
                    sectorId: sectors[0]?.id,
                  })
                }
              />
            </div>
            <div>
              <SmartLinkedField
                label="رقم المخطط"
                value={formData.planNumber}
                linkedId={formData.linkedPlanId}
                onChange={(val) =>
                  setFormData({
                    ...formData,
                    planNumber: val,
                    linkedPlanId: "",
                  })
                }
                options={plans}
                listId="manualPlansList"
                placeholder="ابحث أو اكتب رقم المخطط..."
                matchFn={(opt, val) =>
                  normalizePlan(opt.name) === normalizePlan(val) ||
                  normalizePlan(opt.planNumber) === normalizePlan(val)
                }
                isAdding={quickAddPlan.isPending}
                onQuickAdd={() =>
                  quickAddPlan.mutate({
                    name: formData.planNumber,
                    planNumber: formData.planNumber,
                  })
                }
              />
            </div>

            <CopyableInput
              label="رقم القطعة"
              value={formData.plotNumber}
              onChange={(val) => setFormData({ ...formData, plotNumber: val })}
              placeholder="رقم القطعة"
            />
            <CopyableInput
              label="مساحة الأرض (م²)"
              type="text"
              value={formData.landArea}
              onChange={(val) => setFormData({ ...formData, landArea: val })}
              placeholder="المساحة"
            />

            <div className="space-y-1">
              <div className="flex items-center justify-between mb-0.5">
                <label className="text-[11px] font-bold text-slate-500 flex items-center gap-2">
                  التصنيف الرئيسي{" "}
                  <button
                    onClick={() => copyToClipboard(formData.mainUsage)}
                    className="text-slate-400 hover:text-blue-600 transition-colors"
                  >
                    <Copy size={12} />
                  </button>
                </label>
              </div>
              <input
                type="text"
                value={formData.mainUsage}
                onChange={(e) =>
                  setFormData({ ...formData, mainUsage: e.target.value })
                }
                className="w-full text-[11px] font-bold border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 outline-none focus:ring-1 focus:ring-blue-400"
                placeholder="مثال: سكني، تجاري"
              />
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between mb-0.5">
                <label className="text-[11px] font-bold text-slate-500 flex items-center gap-2">
                  التصنيف الفرعي{" "}
                  <button
                    onClick={() => copyToClipboard(formData.subUsage)}
                    className="text-slate-400 hover:text-blue-600 transition-colors"
                  >
                    <Copy size={12} />
                  </button>
                </label>
              </div>
              <input
                type="text"
                value={formData.subUsage}
                onChange={(e) =>
                  setFormData({ ...formData, subUsage: e.target.value })
                }
                className="w-full text-[11px] font-bold border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 outline-none focus:ring-1 focus:ring-blue-400"
                placeholder="مثال: مستودعات، مكتبي، فيلا"
              />
            </div>

            {/* 🚀 تعطيل حقل المكتب الهندسي إذا كان fixedOffice موجوداً */}
            <div>
              <SmartLinkedField
                label="المكتب الهندسي"
                value={formData.engineeringOffice}
                disabled={!!fixedOffice}
                linkedId={formData.linkedOfficeId}
                onChange={(val) => {
                  const found = offices.find(
                    (o) => o.nameAr === val || o.nameEn === val,
                  );
                  setFormData({
                    ...formData,
                    engineeringOffice: val,
                    linkedOfficeId: found ? found.id : "",
                  });
                }}
                options={offices}
                listId="manualOfficesList"
                placeholder="ابحث أو اكتب المكتب..."
                matchFn={(opt, val) =>
                  normalizeArabicText(opt.nameAr).includes(
                    normalizeArabicText(val),
                  ) ||
                  normalizeArabicText(opt.nameEn).includes(
                    normalizeArabicText(val),
                  )
                }
                isAdding={quickAddOffice.isPending}
                onQuickAdd={() =>
                  quickAddOffice.mutate({
                    nameAr: formData.engineeringOffice,
                    nameEn: formData.engineeringOffice,
                    phone: "0500000000",
                    commercialRegister: "0000000000",
                    city: "الرياض",
                    status: "نشط",
                  })
                }
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 block">
                شكل الرخصة
              </label>
              <select
                value={formData.form}
                onChange={(e) =>
                  setFormData({ ...formData, form: e.target.value })
                }
                className="w-full text-[11px] font-bold border border-slate-200 rounded-lg px-3 py-2 bg-slate-50"
              >
                {["يدوي", "أصفر", "أخضر"].map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 block">
                المصدر
              </label>
              <select
                value={formData.source}
                onChange={(e) =>
                  setFormData({ ...formData, source: e.target.value })
                }
                className="w-full text-[11px] font-bold border border-slate-200 rounded-lg px-3 py-2 bg-slate-50"
              >
                {[
                  "نظام المعاملات",
                  "رفع يدوي (AI)",
                  "بوابة بلدي",
                  "استيراد تاريخي",
                  "يدوي",
                ].map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="lg:col-span-3 space-y-1 mt-2">
              <CopyableInput
                label="ملاحظات"
                value={formData.notes}
                onChange={(val) => setFormData({ ...formData, notes: val })}
                placeholder="ملاحظات إضافية (اختياري)"
              />
            </div>
          </div>

          <div className="mt-6 border-t border-slate-200 pt-5">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-700 flex items-center gap-2">
                <CloudUpload className="w-4 h-4 text-blue-500" /> إرفاق مستند
                الرخصة
                <span className="text-[10px] text-slate-400 font-normal">
                  {mode === "edit"
                    ? "(ارفع ملفاً جديداً لاستبدال القديم)"
                    : "(اختياري)"}
                </span>
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-blue-400 hover:bg-blue-50/50 transition-colors cursor-pointer bg-white shadow-sm"
              >
                <CloudUpload className="w-8 h-8 mx-auto text-blue-400 mb-2" />
                <div className="text-[12px] font-bold text-slate-700">
                  {formData.file
                    ? formData.file.name
                    : "اسحب الملف هنا أو اضغط للاختيار"}
                </div>
                <div className="text-[10px] font-bold text-slate-400 mt-1">
                  يدعم PDF, JPG, PNG - حد أقصى 25MB
                </div>
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
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-slate-200 bg-white rounded-b-xl shrink-0">
          <button
            onClick={onClose}
            className="px-6 text-xs font-bold bg-slate-100 text-slate-600 rounded-xl py-2.5 hover:bg-slate-200 transition-colors"
          >
            إلغاء
          </button>
          <button
            onClick={handleSubmit}
            disabled={saveMutation.isPending}
            className="px-8 text-xs font-bold bg-blue-600 text-white rounded-xl py-2.5 hover:bg-blue-700 flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-md shadow-blue-600/20"
          >
            {saveMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            {mode === "add" ? "حفظ وتسجيل السجل" : "اعتماد التعديلات"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 💡 المودل الرئيسي لرفع الذكاء الاصطناعي (محدث ليدعم الربط المباشر في الأعلى)
// ==========================================
export function ModalUploadAi({ onClose, fixedOffice }) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);

  const [step, setStep] = useState(1);
  const [file, setFile] = useState(null);
  const [permits, setPermits] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // 💡 State الخاصة بأزرار ولوحة الربط العلوية
  const [linkingMode, setLinkingMode] = useState(null);
  const [selectedValue, setSelectedValue] = useState("");

  const { data: clients = [] } = useQuery({
    queryKey: ["clients-simple"],
    queryFn: async () => (await api.get("/clients/simple")).data || [],
  });
  const { data: offices = [] } = useQuery({
    queryKey: ["offices-list"],
    queryFn: async () =>
      (await api.get("/intermediary-offices")).data?.data || [],
  });
  const { data: districtsTree = [], isLoading: loadingDistricts } = useQuery({
    queryKey: ["districts-tree-list"],
    queryFn: async () => (await api.get("/riyadh-streets/tree")).data || [],
  });
  const { data: sectors = [] } = useQuery({
    queryKey: ["sectors-list"],
    queryFn: async () => (await api.get("/riyadh-streets/sectors")).data || [],
  });
  const { data: plans = [] } = useQuery({
    queryKey: ["plans-list"],
    queryFn: async () => (await api.get("/riyadh-streets/plans")).data || [],
  });
  const { data: ownerships = [] } = useQuery({
    queryKey: ["properties-list"],
    queryFn: async () => (await api.get("/properties")).data?.data || [],
  });
  const { data: privateTransactions = [] } = useQuery({
    queryKey: ["private-transactions-list"],
    queryFn: async () =>
      (await api.get("/private-transactions")).data?.data || [],
  });
  const { data: existingPermits = [] } = useQuery({
    queryKey: ["building-permits"],
    queryFn: async () => (await api.get("/permits")).data?.data || [],
  });

  const flatDistricts = useMemo(() => {
    let all = [];
    districtsTree.forEach((s) => {
      if (s.neighborhoods) {
        all = [
          ...all,
          ...s.neighborhoods.map((n) => ({ ...n, sectorName: s.name })),
        ];
      }
    });
    return all;
  }, [districtsTree]);

  const quickAddClient = useMutation({
    mutationFn: async (data) => await api.post("/clients", data),
    onSuccess: () => {
      toast.success("تمت إضافة العميل بنجاح!");
      queryClient.invalidateQueries(["clients-simple"]);
    },
  });
  const quickAddDistrict = useMutation({
    mutationFn: async (data) =>
      await api.post("/riyadh-streets/districts", data),
    onSuccess: () => {
      toast.success("تمت إضافة الحي بنجاح!");
      queryClient.invalidateQueries(["districts-tree-list"]);
    },
  });
  const quickAddOffice = useMutation({
    mutationFn: async (data) => await api.post("/intermediary-offices", data),
    onSuccess: () => {
      toast.success("تمت إضافة المكتب بنجاح!");
      queryClient.invalidateQueries(["offices-list"]);
    },
  });
  const quickAddPlan = useMutation({
    mutationFn: async (data) => await api.post("/riyadh-streets/plans", data),
    onSuccess: () => {
      toast.success("تمت إضافة المخطط بنجاح!");
      queryClient.invalidateQueries(["plans-list"]);
    },
  });

  const analyzeMutation = useMutation({
    mutationFn: async (selectedFile) => {
      const fd = new FormData();
      fd.append("file", selectedFile);
      return await api.post("/permits/analyze", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: (res) => {
      const aiPermits = res.data.data || [];
      if (aiPermits.length === 0)
        return toast.error("لم يتم العثور على أي رخص صالحة في الملف.");

      toast.success(
        `تم استخراج ومطابقة بيانات ${aiPermits.length} رخصة بنجاح!`,
      );

      const mappedPermits = aiPermits.map((p) => ({
        ...p,
        permitNumber: toEnglishNumbers(p.permitNumber || ""),
        issueDate: toEnglishNumbers(p.issueDate || ""),
        expiryDate: toEnglishNumbers(p.expiryDate || ""),
        year: toEnglishNumbers(p.year || new Date().getFullYear()),
        type: p.type || "غير محدد",
        form: p.form || "أخضر",
        ownerName: p.ownerName || "",
        idNumber: toEnglishNumbers(p.idNumber || ""),
        district: p.district || "",
        sector: p.sector || "",
        plotNumber: toEnglishNumbers(p.plotNumber || ""),
        planNumber: toEnglishNumbers(p.planNumber || ""),
        landArea: toEnglishNumbers(p.landArea || ""),
        mainUsage: p.mainUsage || p.usage || "سكني",
        subUsage: p.subUsage || "",
        engineeringOffice: fixedOffice || p.engineeringOffice || "",
        notes: p.notes || "",
        detailedReport: p.detailedReport || "",
        componentsData: p.componentsData || [],
        boundariesData: p.boundariesData || [],
        source: "رفع يدوي (AI)",

        linkedClientId: p.linkedClientId || "",
        linkedOfficeId: p.linkedOfficeId || "",
        linkedDistrictId: p.linkedDistrictId || "",
        linkedPlanId: p.linkedPlanId || "",
        linkedOwnershipId: "",
        linkedTransactionId: "",
      }));

      setPermits(mappedPermits);
      setStep(2);
    },
    onError: (err) => {
      toast.error(
        err.response?.data?.message || "فشل التحليل، تأكد من وضوح الملف.",
      );
      setFile(null);
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const promises = permits.map((permit) => {
        const fd = new FormData();
        Object.keys(permit).forEach((key) => {
          if (key === "componentsData" || key === "boundariesData") {
            fd.append(key, JSON.stringify(permit[key]));
          } else if (
            permit[key] !== null &&
            permit[key] !== undefined &&
            permit[key] !== ""
          ) {
            fd.append(key, permit[key]);
          }
        });
        if (file) fd.append("file", file);
        return api.post("/permits", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      });

      return await Promise.allSettled(promises);
    },
    onSuccess: (results) => {
      const succeeded = results.filter((r) => r.status === "fulfilled");
      const failed = results.filter((r) => r.status === "rejected");
      if (succeeded.length > 0) {
        toast.success(`تم حفظ واعتماد ${succeeded.length} رخصة بنجاح!`);
        queryClient.invalidateQueries(["building-permits"]);
      }
      if (failed.length > 0) {
        failed.forEach((f) =>
          toast.error(
            f.reason?.response?.data?.message || "فشل الحفظ لبعض السجلات",
          ),
        );
      }
      if (failed.length === 0) onClose();
    },
  });

  const handleFinalSave = () => {
    if (permits.some((p) => !p.permitNumber || !p.ownerName))
      return toast.error(
        "يرجى التأكد من إدخال رقم الرخصة واسم المالك كحد أدنى.",
      );
    saveMutation.mutate();
  };

  const updateCurrentPermit = (field, value, linkedFieldToClear = null) => {
    const updated = [...permits];
    updated[currentIndex][field] = toEnglishNumbers(value);

    if (linkedFieldToClear) {
      updated[currentIndex][linkedFieldToClear] = "";
    }
    setPermits(updated);
  };

  const updateTableData = (table, index, field, value) => {
    const updated = [...permits];
    updated[currentIndex][table][index][field] = toEnglishNumbers(value);
    setPermits(updated);
  };

  const handleApplyLink = () => {
    if (!selectedValue) return toast.error("يرجى اختيار السجل من القائمة");

    const updated = [...permits];
    if (linkingMode === "client")
      updated[currentIndex].linkedClientId = selectedValue;
    if (linkingMode === "office")
      updated[currentIndex].linkedOfficeId = selectedValue;
    if (linkingMode === "ownership")
      updated[currentIndex].linkedOwnershipId = selectedValue;
    if (linkingMode === "privateTransaction")
      updated[currentIndex].linkedTransactionId = selectedValue;

    setPermits(updated);
    setLinkingMode(null);
    setSelectedValue("");
    toast.success("تم تحديد السجل للربط، سيتم حفظه مع الرخصة.");
  };

  const getOptions = (mode) => {
    if (mode === "client")
      return clients.map((c) => ({ label: c.name, value: c.id }));
    if (mode === "office")
      return offices.map((o) => ({ label: o.nameAr || o.name, value: o.id }));
    if (mode === "ownership")
      return ownerships.map((o) => ({
        label: `صك رقم: ${o.deedNumber || o.id}`,
        value: o.id,
      }));
    if (mode === "privateTransaction")
      return privateTransactions.map((t) => ({
        label: `رقم: ${t.ref || t.id} - ${t.client}`,
        value: t.id,
      }));
    return [];
  };

  if (step === 1) {
    return (
      <div
        className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4 animate-in fade-in"
        dir="rtl"
      >
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center flex flex-col items-center border border-purple-100 relative">
          <button
            onClick={onClose}
            className="absolute top-4 left-4 p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-5">
            <Brain className="w-8 h-8 text-purple-600" />
          </div>
          <h3 className="text-xl font-black text-slate-800 mb-2">
            استخراج البيانات بذكاء
          </h3>
          <p className="text-sm text-slate-500 font-semibold mb-6 px-4">
            ارفع ملف الرخصة وسنقوم بتفريغ كل الحقول والجداول بدقة متناهية
            ومطابقتها مع النظام.
          </p>
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`w-full border-2 border-dashed rounded-xl p-8 mb-6 cursor-pointer transition-colors ${file ? "border-emerald-300 bg-emerald-50" : "border-purple-200 bg-slate-50 hover:bg-purple-50"}`}
          >
            {file ? (
              <>
                <FileText className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <div className="text-sm font-bold text-emerald-700 truncate px-2">
                  {file.name}
                </div>
              </>
            ) : (
              <>
                <CloudUpload className="w-10 h-10 text-purple-400 mx-auto mb-2" />
                <div className="text-sm font-bold text-slate-700">
                  اختر ملف الرخصة
                </div>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,image/*"
              className="hidden"
              onChange={(e) => setFile(e.target.files[0])}
            />
          </div>
          <div className="flex gap-3 w-full">
            <button
              onClick={onClose}
              className="flex-[0.4] py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 text-sm"
            >
              إلغاء
            </button>
            <button
              onClick={() => analyzeMutation.mutate(file)}
              disabled={!file || analyzeMutation.isPending}
              className="flex-1 py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 flex items-center justify-center gap-2"
            >
              {analyzeMutation.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Sparkles className="w-5 h-5" />
              )}{" "}
              بدء التحليل والمطابقة
            </button>
          </div>
        </div>
      </div>
    );
  }

  const current = permits[currentIndex];

  const isDuplicatePermit = existingPermits.some(
    (p) =>
      String(p.permitNumber) === String(current.permitNumber) &&
      String(p.year) === String(current.year),
  );

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4 animate-in fade-in"
      dir="rtl"
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full flex flex-col border border-purple-200 max-h-[95vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-purple-100 bg-purple-50 rounded-t-2xl shrink-0">
          <div className="flex items-center gap-3">
            <Brain className="w-6 h-6 text-purple-600" />
            <div>
              <h3 className="font-black text-purple-900 text-base">
                المراجعة والربط الذكي
              </h3>
              <p className="text-[11px] text-purple-600 font-bold mt-0.5">
                قم بتأكيد البيانات وتصحيحها إن لزم الأمر قبل الاعتماد النهائي
              </p>
            </div>
          </div>
          {permits.length > 1 && (
            <div className="flex items-center gap-4 bg-white px-3 py-1.5 rounded-lg border border-purple-200 shadow-sm">
              <button
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((i) => i - 1)}
                className="p-1 hover:bg-slate-100 rounded disabled:opacity-30"
              >
                <ChevronRight size={18} />
              </button>
              <span className="text-xs font-bold text-purple-800">
                رخصة {currentIndex + 1} من {permits.length}
              </span>
              <button
                disabled={currentIndex === permits.length - 1}
                onClick={() => setCurrentIndex((i) => i + 1)}
                className="p-1 hover:bg-slate-100 rounded disabled:opacity-30"
              >
                <ChevronLeft size={18} />
              </button>
            </div>
          )}
          <button
            onClick={onClose}
            className="p-2 hover:bg-white rounded-lg text-purple-400 hover:text-purple-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 💡 أزرار الربط في أعلى النموذج (نفس تصميم المودال اليدوي) */}
        <div className="bg-slate-50 p-4 border-b border-slate-200 shrink-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-slate-600 ml-2">
              <Link size={14} className="inline mr-1 text-blue-500" /> إضافة
              ارتباط للرخصة:
            </span>
            {!current.linkedClientId && (
              <button
                onClick={() => {
                  setLinkingMode("client");
                  setSelectedValue("");
                }}
                className={`flex-1 min-w-[100px] p-2 border rounded-lg flex items-center justify-center gap-1.5 transition-all ${linkingMode === "client" ? "border-blue-500 bg-blue-100 text-blue-700 shadow-sm" : "border-slate-200 bg-white text-slate-500 hover:border-blue-300"}`}
              >
                <User size={14} />{" "}
                <span className="text-[10px] font-black">بعميل</span>
              </button>
            )}
            {!current.linkedOfficeId && (
              <button
                onClick={() => {
                  setLinkingMode("office");
                  setSelectedValue("");
                }}
                className={`flex-1 min-w-[100px] p-2 border rounded-lg flex items-center justify-center gap-1.5 transition-all ${linkingMode === "office" ? "border-blue-500 bg-blue-100 text-blue-700 shadow-sm" : "border-slate-200 bg-white text-slate-500 hover:border-blue-300"}`}
              >
                <Briefcase size={14} />{" "}
                <span className="text-[10px] font-black">بمكتب</span>
              </button>
            )}
            {!current.linkedOwnershipId && (
              <button
                onClick={() => {
                  setLinkingMode("ownership");
                  setSelectedValue("");
                }}
                className={`flex-1 min-w-[100px] p-2 border rounded-lg flex items-center justify-center gap-1.5 transition-all ${linkingMode === "ownership" ? "border-blue-500 bg-blue-100 text-blue-700 shadow-sm" : "border-slate-200 bg-white text-slate-500 hover:border-blue-300"}`}
              >
                <Building size={14} />{" "}
                <span className="text-[10px] font-black">بملكية</span>
              </button>
            )}
            {!current.linkedTransactionId && (
              <button
                onClick={() => {
                  setLinkingMode("privateTransaction");
                  setSelectedValue("");
                }}
                className={`flex-1 min-w-[100px] p-2 border rounded-lg flex items-center justify-center gap-1.5 transition-all ${linkingMode === "privateTransaction" ? "border-blue-500 bg-blue-100 text-blue-700 shadow-sm" : "border-slate-200 bg-white text-slate-500 hover:border-blue-300"}`}
              >
                <FileSignature size={14} />{" "}
                <span className="text-[10px] font-black">بمعاملة فرعية</span>
              </button>
            )}
          </div>

          {/* منطقة البحث المنسدلة للربط */}
          {linkingMode && (
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-2">
              <div className="flex-1">
                <SearchableDropdown
                  options={getOptions(linkingMode)}
                  value={selectedValue}
                  onChange={(val) => setSelectedValue(val)}
                  placeholder={`ابحث واختر ${linkingMode === "client" ? "العميل" : linkingMode === "office" ? "المكتب" : linkingMode === "ownership" ? "الملكية" : "المعاملة"}...`}
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleApplyLink}
                  className="px-4 py-2.5 bg-blue-600 text-white text-[10px] font-black rounded-lg hover:bg-blue-700 shadow-sm transition-colors"
                >
                  اختيار وربط
                </button>
                <button
                  onClick={() => setLinkingMode(null)}
                  className="px-3 py-2.5 bg-white text-slate-500 border border-slate-200 text-[10px] font-black rounded-lg hover:bg-slate-50 transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </div>
          )}

          {/* استعراض السجلات المربوطة */}
          <div className="flex flex-wrap gap-2 mt-3">
            {current.linkedClientId && (
              <span className="flex items-center gap-1.5 bg-emerald-100 text-emerald-800 px-3 py-1.5 rounded-lg text-[10px] font-bold border border-emerald-200">
                <User size={12} /> عميل:{" "}
                {clients.find((c) => c.id === current.linkedClientId)?.name ||
                  "مربوط"}
                <button
                  onClick={() => updateCurrentPermit("linkedClientId", "")}
                  className="text-emerald-500 hover:text-red-500 ml-1"
                >
                  <X size={12} />
                </button>
              </span>
            )}
            {current.linkedOfficeId && (
              <span className="flex items-center gap-1.5 bg-emerald-100 text-emerald-800 px-3 py-1.5 rounded-lg text-[10px] font-bold border border-emerald-200">
                <Briefcase size={12} /> مكتب:{" "}
                {offices.find((o) => o.id === current.linkedOfficeId)?.nameAr ||
                  "مربوط"}
                <button
                  onClick={() => updateCurrentPermit("linkedOfficeId", "")}
                  className="text-emerald-500 hover:text-red-500 ml-1"
                >
                  <X size={12} />
                </button>
              </span>
            )}
            {current.linkedOwnershipId && (
              <span className="flex items-center gap-1.5 bg-emerald-100 text-emerald-800 px-3 py-1.5 rounded-lg text-[10px] font-bold border border-emerald-200">
                <Building size={12} /> ملكية:{" "}
                {ownerships.find((o) => o.id === current.linkedOwnershipId)
                  ?.deedNumber || "مربوط"}
                <button
                  onClick={() => updateCurrentPermit("linkedOwnershipId", "")}
                  className="text-emerald-500 hover:text-red-500 ml-1"
                >
                  <X size={12} />
                </button>
              </span>
            )}
            {current.linkedTransactionId && (
              <span className="flex items-center gap-1.5 bg-emerald-100 text-emerald-800 px-3 py-1.5 rounded-lg text-[10px] font-bold border border-emerald-200">
                <FileSignature size={12} /> معاملة:{" "}
                {privateTransactions.find(
                  (t) => t.id === current.linkedTransactionId,
                )?.ref || "مربوط"}
                <button
                  onClick={() => updateCurrentPermit("linkedTransactionId", "")}
                  className="text-emerald-500 hover:text-red-500 ml-1"
                >
                  <X size={12} />
                </button>
              </span>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-[#fafbfc] custom-scrollbar-slim space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h4 className="text-sm font-black text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Edit3 className="w-4 h-4 text-blue-500" /> المعلومات الأساسية
              للرخصة
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-5">
              <div className="lg:col-span-2">
                <SmartLinkedField
                  label="اسم المالك (العميل) *"
                  value={current.ownerName}
                  linkedId={current.linkedClientId}
                  onChange={(val) => {
                    const found = clients.find(
                      (c) => c.name === val || c.idNumber === current.idNumber,
                    );
                    updateCurrentPermit("ownerName", val, "linkedClientId");
                    if (found) updateCurrentPermit("linkedClientId", found.id);
                  }}
                  options={clients}
                  listId="aiClientsList"
                  placeholder="ابحث أو اكتب اسم العميل..."
                  matchFn={(opt, val) =>
                    normalizeArabicText(opt.fullNameRaw) ===
                      normalizeArabicText(val) ||
                    opt.idNumber === current.idNumber
                  }
                  isAdding={quickAddClient.isPending}
                  onQuickAdd={() =>
                    quickAddClient.mutate({
                      name: JSON.stringify({ ar: current.ownerName }),
                      officialNameAr: current.ownerName,
                      idNumber: current.idNumber || `TMP-${Date.now()}`,
                      type: "individual",
                      mobile: `0500${Math.floor(100000 + Math.random() * 900000)}`,
                    })
                  }
                />
              </div>

              <CopyableInput
                label="رقم الهوية"
                value={current.idNumber}
                onChange={(val) => updateCurrentPermit("idNumber", val)}
                placeholder="10 أرقام"
                dir="ltr"
                style={{ textAlign: "right" }}
              />
              <div className="space-y-1 relative">
                <div className="flex items-center justify-between mb-0.5">
                  <label className="text-[11px] font-bold text-slate-500 flex items-center gap-2">
                    رقم الرخصة *
                    {isDuplicatePermit && (
                      <span className="flex items-center gap-1 bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded text-[9px] border border-amber-300 shadow-sm animate-pulse">
                        <AlertTriangle size={10} /> مكرر
                      </span>
                    )}
                    <button
                      onClick={() => copyToClipboard(current.permitNumber)}
                      className="text-slate-400 hover:text-blue-600 transition-colors"
                      title="نسخ المحتوى"
                    >
                      <Copy size={12} />
                    </button>
                  </label>
                </div>
                <input
                  type="text"
                  value={current.permitNumber}
                  onChange={(e) =>
                    updateCurrentPermit("permitNumber", e.target.value)
                  }
                  placeholder="مثال: 1445/1234"
                  dir="rtl"
                  className={`w-full text-[11px] font-bold border rounded-lg px-3 py-2 outline-none focus:ring-1 transition-colors ${isDuplicatePermit ? "bg-amber-50 border-amber-300 focus:ring-amber-400 text-amber-900" : "bg-slate-50 border-slate-200 text-slate-700 focus:ring-blue-400 focus:bg-white"}`}
                />
              </div>
              <CopyableInput
                label="تاريخ الإصدار"
                value={current.issueDate}
                onChange={(val) => updateCurrentPermit("issueDate", val)}
              />
              <CopyableInput
                label="تاريخ الانتهاء"
                value={current.expiryDate}
                onChange={(val) => updateCurrentPermit("expiryDate", val)}
              />
              <CopyableInput
                label="سنة الرخصة (للفلترة)"
                value={current.year}
                onChange={(val) => updateCurrentPermit("year", val)}
              />

              <div>
                <SmartLinkedField
                  label="الحي"
                  value={current.district}
                  linkedId={current.linkedDistrictId}
                  onChange={(val) =>
                    updateCurrentPermit("district", val, "linkedDistrictId")
                  }
                  options={flatDistricts}
                  listId="aiDistrictsList"
                  placeholder={
                    loadingDistricts ? "جاري التحميل..." : "ابحث أو اكتب..."
                  }
                  matchFn={(opt, val) => {
                    const normOpt = normalizeArabicText(opt.name);
                    const normVal = normalizeArabicText(val);
                    // 💡 التعديل هنا: منع التطابق إذا كانت القيمة فارغة
                    if (!normOpt || !normVal) return false;
                    return (
                      normOpt.includes(normVal) || normVal.includes(normOpt)
                    );
                  }}
                  isAdding={quickAddDistrict.isPending}
                  onQuickAdd={() =>
                    quickAddDistrict.mutate({
                      name: current.district,
                      sectorId: sectors[0]?.id,
                    })
                  }
                />
              </div>

              <div>
                <SmartLinkedField
                  label="رقم المخطط"
                  value={current.planNumber}
                  linkedId={current.linkedPlanId}
                  onChange={(val) =>
                    updateCurrentPermit("planNumber", val, "linkedPlanId")
                  }
                  options={plans}
                  listId="aiPlansList"
                  placeholder="ابحث أو اكتب رقم المخطط..."
                  matchFn={(opt, val) =>
                    normalizePlan(opt.name) === normalizePlan(val) ||
                    normalizePlan(opt.planNumber) === normalizePlan(val)
                  }
                  isAdding={quickAddPlan.isPending}
                  onQuickAdd={() =>
                    quickAddPlan.mutate({
                      name: current.planNumber,
                      planNumber: current.planNumber,
                    })
                  }
                />
              </div>

              <CopyableInput
                label="القطاع / البلدية"
                value={current.sector}
                onChange={(val) => updateCurrentPermit("sector", val)}
              />
              <CopyableInput
                label="رقم القطعة"
                value={current.plotNumber}
                onChange={(val) => updateCurrentPermit("plotNumber", val)}
              />
              <CopyableInput
                label="مساحة الأرض (م²)"
                type="text"
                value={current.landArea}
                onChange={(val) => updateCurrentPermit("landArea", val)}
              />
              <CopyableInput
                label="التصنيف الرئيسي"
                value={current.mainUsage}
                onChange={(val) => updateCurrentPermit("mainUsage", val)}
                placeholder="مثال: سكني"
              />
              <CopyableInput
                label="التصنيف الفرعي"
                value={current.subUsage}
                onChange={(val) => updateCurrentPermit("subUsage", val)}
                placeholder="مثال: فيلا"
              />
              <CopyableInput
                label="نوع الطلب"
                value={current.type}
                onChange={(val) => updateCurrentPermit("type", val)}
              />
              <CopyableInput
                label="شكل الرخصة (تلقائي)"
                value={current.form}
                onChange={() => {}}
                disabled={true}
                style={{ backgroundColor: "#f1f5f9", cursor: "not-allowed" }}
              />

              <div className="md:col-span-2">
                <SmartLinkedField
                  label="المكتب الهندسي"
                  value={current.engineeringOffice}
                  linkedId={current.linkedOfficeId}
                  disabled={!!fixedOffice}
                  onChange={(val) => {
                    const found = offices.find(
                      (o) => o.nameAr === val || o.nameEn === val,
                    );
                    updateCurrentPermit(
                      "engineeringOffice",
                      val,
                      "linkedOfficeId",
                    );
                    if (found) updateCurrentPermit("linkedOfficeId", found.id);
                  }}
                  options={offices}
                  listId="aiOfficesList"
                  placeholder="ابحث أو اكتب المكتب..."
                  matchFn={(opt, val) =>
                    normalizeArabicText(opt.nameAr).includes(
                      normalizeArabicText(val),
                    ) ||
                    normalizeArabicText(opt.nameEn).includes(
                      normalizeArabicText(val),
                    )
                  }
                  isAdding={quickAddOffice.isPending}
                  onQuickAdd={() =>
                    quickAddOffice.mutate({
                      nameAr: current.engineeringOffice,
                      nameEn: current.engineeringOffice,
                      phone: "0500000000",
                      commercialRegister: "0000000000",
                      city: "الرياض",
                      status: "نشط",
                    })
                  }
                />
              </div>

              <div className="md:col-span-4">
                <div className="flex items-center justify-between mb-0.5">
                  <label className="text-[11px] font-bold text-slate-500 flex items-center gap-2">
                    ملاحظات / اشتراطات{" "}
                    <button
                      onClick={() => copyToClipboard(current.notes)}
                      className="text-slate-400 hover:text-blue-600 transition-colors"
                    >
                      <Copy size={12} />
                    </button>
                  </label>
                </div>
                <textarea
                  rows={2}
                  value={current.notes}
                  onChange={(e) => updateCurrentPermit("notes", e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[13px] font-bold outline-none focus:ring-1 focus:ring-purple-400 leading-relaxed"
                ></textarea>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <h4 className="text-xs font-black text-slate-800 mb-3 flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-500" /> تفاصيل المكونات
              </h4>
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-[11px] text-right">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      <th className="p-2 border-b border-slate-200 w-1/3">
                        المكون
                      </th>
                      <th className="p-2 border-b border-slate-200 w-1/4">
                        الاستخدام
                      </th>
                      <th className="p-2 border-b border-slate-200 w-1/4">
                        المساحة
                      </th>
                      <th className="p-2 border-b border-slate-200 w-1/6">
                        الوحدات
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {current.componentsData.map((comp, i) => (
                      <tr
                        key={i}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="p-1">
                          <input
                            value={comp.name || ""}
                            onChange={(e) =>
                              updateTableData(
                                "componentsData",
                                i,
                                "name",
                                e.target.value,
                              )
                            }
                            className="w-full p-1.5 border border-transparent hover:border-slate-200 focus:border-purple-400 rounded outline-none font-bold text-slate-700 bg-transparent"
                          />
                        </td>
                        <td className="p-1">
                          <input
                            value={comp.usage || ""}
                            onChange={(e) =>
                              updateTableData(
                                "componentsData",
                                i,
                                "usage",
                                e.target.value,
                              )
                            }
                            className="w-full p-1.5 border border-transparent hover:border-slate-200 focus:border-purple-400 rounded outline-none font-bold text-slate-700 bg-transparent"
                          />
                        </td>
                        <td className="p-1">
                          <input
                            value={comp.area || ""}
                            onChange={(e) =>
                              updateTableData(
                                "componentsData",
                                i,
                                "area",
                                e.target.value,
                              )
                            }
                            className="w-full p-1.5 border border-transparent hover:border-slate-200 focus:border-purple-400 rounded outline-none font-bold text-slate-700 bg-transparent text-center font-mono"
                          />
                        </td>
                        <td className="p-1">
                          <input
                            value={comp.units || comp.rooms || ""}
                            onChange={(e) =>
                              updateTableData(
                                "componentsData",
                                i,
                                "units",
                                e.target.value,
                              )
                            }
                            className="w-full p-1.5 border border-transparent hover:border-slate-200 focus:border-purple-400 rounded outline-none font-bold text-slate-700 bg-transparent text-center font-mono"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <h4 className="text-xs font-black text-slate-800 mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-orange-500" /> الحدود والأبعاد
              </h4>
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-[11px] text-right">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      <th className="p-2 border-b border-slate-200 w-24">
                        الاتجاه
                      </th>
                      <th className="p-2 border-b border-slate-200 w-20">
                        الطول (م)
                      </th>
                      <th className="p-2 border-b border-slate-200">
                        يحدها / الشارع
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {current.boundariesData.map((bound, i) => (
                      <tr
                        key={i}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="p-1">
                          <input
                            value={bound.direction || ""}
                            onChange={(e) =>
                              updateTableData(
                                "boundariesData",
                                i,
                                "direction",
                                e.target.value,
                              )
                            }
                            className="w-full p-1.5 border border-transparent hover:border-slate-200 focus:border-purple-400 rounded outline-none font-bold text-slate-700 bg-transparent"
                          />
                        </td>
                        <td className="p-1">
                          <input
                            value={bound.length || ""}
                            onChange={(e) =>
                              updateTableData(
                                "boundariesData",
                                i,
                                "length",
                                e.target.value,
                              )
                            }
                            className="w-full p-1.5 border border-transparent hover:border-slate-200 focus:border-purple-400 rounded outline-none font-bold text-slate-700 bg-transparent text-center font-mono"
                          />
                        </td>
                        <td className="p-1">
                          <input
                            value={bound.neighbor || ""}
                            onChange={(e) =>
                              updateTableData(
                                "boundariesData",
                                i,
                                "neighbor",
                                e.target.value,
                              )
                            }
                            className="w-full p-1.5 border border-transparent hover:border-slate-200 focus:border-purple-400 rounded outline-none font-bold text-slate-700 bg-transparent"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white border-t border-slate-200 rounded-b-2xl flex items-center justify-between shrink-0">
          <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
            رخصة {currentIndex + 1} من {permits.length} جاهزة للاعتماد
          </span>
          <div className="flex gap-3">
            <button
              onClick={() => setStep(1)}
              className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 text-xs shadow-sm transition-colors"
            >
              إلغاء وإعادة الرفع
            </button>
            <button
              onClick={handleFinalSave}
              disabled={saveMutation.isPending}
              className="px-8 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 text-sm transition-all disabled:opacity-50"
            >
              {saveMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}{" "}
              اعتماد وحفظ السجلات
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
