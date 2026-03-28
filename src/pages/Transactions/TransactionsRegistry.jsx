import React, { useState, useMemo, useCallback, useRef, useEffect } from "react";
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
  Save,
  Link,
  User,
  Briefcase,
  FileSignature,
  DollarSign,
  Clock,
  Banknote,
  Activity
} from "lucide-react";

import { SmartDropdownButton } from "../../components/SmartDropdownButton";
// ملاحظة: تأكد من إنشاء ModalTransactionDetails لاحقاً لعرض تفاصيل المعاملة
// import { ModalTransactionDetails } from "../../components/ModalTransactionDetails"; 

// ─── Column Definitions ──────────────────────────────────────
const COLUMNS = [
  { key: "txNumber", label: "رقم المعاملة", width: 120 },
  { key: "source", label: "المصدر", width: 110 },
  { key: "type", label: "نوع المعاملة", width: 130 },
  { key: "status", label: "الحالة", width: 100 },
  { key: "clientName", label: "اسم العميل", width: 170 },
  { key: "idNumber", label: "رقم الهوية", width: 105 },
  { key: "amount", label: "قيمة المعاملة", width: 100 },
  { key: "paymentStatus", label: "حالة السداد", width: 100 },
  { key: "aiStatus", label: "حالة التحليل (AI)", width: 105 },
  { key: "createdAt", label: "تاريخ الإنشاء", width: 100 },
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
    .replace(/(^|\s)(ال|بن|أبو|ابو)(\s+|$)/g, " ")
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ي/g, "ى")
    .replace(/[\s\-_]/g, "")
    .toLowerCase();
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
    "تم التحليل": { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", icon: <CheckCircle2 size={10} /> },
    "يحتاج مراجعة": { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", icon: <AlertTriangle size={10} /> },
    "فشل التحليل": { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", icon: <XCircle size={10} /> },
  }[status] || { bg: "bg-slate-50", text: "text-slate-500", border: "border-slate-200", icon: <Minus size={10} /> };

  return (
    <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] border ${config.bg} ${config.text} ${config.border}`}>
      {config.icon} {status}
    </span>
  );
}

function StatusBadge({ status }) {
  const config = {
    "نشطة": { bg: "bg-blue-50", text: "text-blue-700" },
    "معلقة": { bg: "bg-amber-50", text: "text-amber-700" },
    "مكتملة": { bg: "bg-emerald-50", text: "text-emerald-700" },
    "ملغاة": { bg: "bg-red-50", text: "text-red-700" },
  }[status] || { bg: "bg-slate-100", text: "text-slate-600" };

  return (
    <span className={`px-2 py-1 rounded-md text-[10px] font-bold border border-transparent ${config.bg} ${config.text}`}>
      {status || "—"}
    </span>
  );
}

function PaymentBadge({ status }) {
  const config = {
    "مدفوع بالكامل": { bg: "bg-emerald-100", text: "text-emerald-800" },
    "دفعة أولى": { bg: "bg-blue-100", text: "text-blue-800" },
    "غير مدفوع": { bg: "bg-red-100", text: "text-red-800" },
  }[status] || { bg: "bg-slate-100", text: "text-slate-600" };

  return (
    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${config.bg} ${config.text}`}>
      {status || "—"}
    </span>
  );
}

// ==========================================
// 💡 السجل المركزي للمعاملات (الشاشة الرئيسية)
// ==========================================
export default function TransactionsRegistry({ fixedOffice = null }) {
  const queryClient = useQueryClient();

  const [searchText, setSearchText] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [hiddenCols, setHiddenCols] = useState(new Set());
  const [sort, setSort] = useState({ key: "createdAt", dir: "desc" });

  const [selectedTx, setSelectedTx] = useState(null);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [colWidths, setColWidths] = useState(COLUMNS.map((c) => c.width));
  const [activeModal, setActiveModal] = useState(null);
  const [modalMode, setModalMode] = useState("add");
  const [editingTx, setEditingTx] = useState(null);
  const [chipFilter, setChipFilter] = useState("");
  const [copiedId, setCopiedId] = useState(null);
  
  const [showDuplicatesPanel, setShowDuplicatesPanel] = useState(false);
  const [isScanningDuplicates, setIsScanningDuplicates] = useState(false);
  const [duplicateGroups, setDuplicateGroups] = useState([]);

  const tableRef = useRef(null);

  // 💡 جلب المعاملات (تغيير الـ Endpoint إلى transactions)
  const { data: serverTransactions = [], isLoading } = useQuery({
    queryKey: ["transactions-list"],
    queryFn: async () => {
      const res = await api.get("/private-transactions"); // أو "/transactions" حسب مسارك
      return res.data?.data || [];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => await api.delete(`/private-transactions/${id}`),
    onSuccess: () => {
      toast.success("تم حذف المعاملة بنجاح");
      queryClient.invalidateQueries(["transactions-list"]);
      if (selectedTx) setSelectedTx(null);
      if (showDuplicatesPanel) scanForDuplicates(); 
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "حدث خطأ أثناء الحذف"),
  });

  const visibleColumns = useMemo(
    () => COLUMNS.filter((c) => !hiddenCols.has(c.key)),
    [hiddenCols],
  );

  const filtered = useMemo(() => {
    let data = serverTransactions;
    
    // فلترة إذا كان هناك مكتب ثابت
    if (fixedOffice) {
      data = data.filter((t) => t.engineeringOffice === fixedOffice || t.externalSource === fixedOffice);
    }

    if (searchText) {
      const s = searchText.toLowerCase();
      data = data.filter(
        (t) =>
          t.txNumber?.includes(s) ||
          t.clientName?.includes(s) ||
          t.idNumber?.includes(s) ||
          t.type?.includes(s)
      );
    }
    if (filterType) data = data.filter((t) => t.type === filterType);
    if (filterStatus) data = data.filter((t) => t.status === filterStatus);

    if (chipFilter === "active") data = data.filter((t) => t.status === "نشطة");
    if (chipFilter === "ai-manual") data = data.filter((t) => t.source === "رفع يدوي (AI)");
    if (chipFilter === "unpaid") data = data.filter((t) => t.paymentStatus === "غير مدفوع");
    return data;
  }, [serverTransactions, searchText, filterType, filterStatus, chipFilter, fixedOffice]);

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
      dir: prev.key === key ? (prev.dir === "asc" ? "desc" : prev.dir === "desc" ? null : "asc") : "asc",
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
    else setSelectedRows(new Set(sorted.map((t) => t.id)));
  };

  // 💡 فحص تكرار المعاملات
  const scanForDuplicates = useCallback(() => {
    setIsScanningDuplicates(true);
    setTimeout(() => {
      const groups = [];
      const processedIds = new Set();
      
      filtered.forEach((tx1) => {
        if (processedIds.has(tx1.id)) return;

        const similarTxs = filtered.filter(tx2 => {
          if (tx1.id === tx2.id) return false;
          // تطابق تام في رقم المعاملة
          const isExactMatch = tx1.txNumber && tx1.txNumber === tx2.txNumber;
          // تطابق في العميل ونوع المعاملة (في نفس الشهر مثلاً)
          const isClientAndTypeMatch = tx1.idNumber && tx2.idNumber && tx1.type && tx2.type &&
                                       tx1.idNumber === tx2.idNumber && tx1.type === tx2.type;
          return isExactMatch || isClientAndTypeMatch;
        });

        if (similarTxs.length > 0) {
          const groupMembers = [tx1, ...similarTxs];
          let reason = "تشابه محتمل";
          let type = "warning";
          if (similarTxs.some(t => t.txNumber === tx1.txNumber)) {
            reason = "تطابق تام في رقم المعاملة";
            type = "danger";
          } else {
            reason = "نفس العميل لنفس نوع المعاملة";
            type = "info";
          }

          groups.push({ id: `group-${tx1.id}`, reason, type, members: groupMembers });
          groupMembers.forEach(t => processedIds.add(t.id));
        }
      });

      setDuplicateGroups(groups.sort((a, b) => a.type === 'danger' ? -1 : 1));
      setIsScanningDuplicates(false);
      
      if (groups.length === 0) {
        toast.success("سجل المعاملات سليم! لا يوجد تكرار.", { icon: "✨" });
      } else {
        toast.warning(`تم اكتشاف ${groups.length} حالة تكرار تحتاج للمراجعة.`);
      }
    }, 800); 
  }, [filtered]);

  const stats = useMemo(() => {
    const txNumbers = filtered.map(t => t.txNumber).filter(Boolean);
    const duplicatesCount = txNumbers.length - new Set(txNumbers).size;

    return {
      total: filtered.length,
      active: filtered.filter((t) => t.status === "نشطة").length,
      fromAI: filtered.filter((t) => t.source === "رفع يدوي (AI)").length,
      unpaid: filtered.filter((t) => t.paymentStatus === "غير مدفوع").length,
      potentialDuplicates: duplicatesCount
    };
  }, [filtered]);

  const chipFilters = [
    { id: "active", label: "معاملات نشطة", count: stats.active, color: "blue" },
    { id: "unpaid", label: "غير مدفوعة", count: stats.unpaid, color: "orange" },
    { id: "ai-manual", label: "مستخرجة بالـ AI", count: stats.fromAI, color: "purple" },
  ];

  const getRowStyle = (tx, isActive, isSelected, isEven) => {
    let bg = isEven ? "rgba(248, 250, 252, 0.5)" : "transparent";
    let borderLeft = "3px solid transparent";

    if (tx.status === "مكتملة") borderLeft = "3px solid #10b981";
    else if (tx.status === "نشطة") borderLeft = "3px solid #3b82f6";
    else if (tx.status === "معلقة") borderLeft = "3px solid #f59e0b";

    if (isActive || isSelected) {
      bg = "rgba(59, 130, 246, 0.08)";
      borderLeft = "3px solid #3b82f6";
    }
    
    if (!showDuplicatesPanel && duplicateGroups.some(g => g.members.some(m => m.id === tx.id))) {
       bg = "rgba(239, 68, 68, 0.05)";
    }

    return { backgroundColor: bg, borderRight: borderLeft };
  };

  const renderCell = (tx, col) => {
    const val = tx[col.key];
    if (col.key === "status") return <StatusBadge status={val} />;
    if (col.key === "paymentStatus") return <PaymentBadge status={val} />;
    if (col.key === "source")
      return (
        <span className="px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-bold border border-slate-200">
          {val || "—"}
        </span>
      );
    if (col.key === "aiStatus") return <AiBadge status={val} />;
    if (col.key === "amount")
      return (
        <span className="font-mono text-[11px] font-bold text-emerald-700 bg-emerald-50 px-1.5 rounded">
          {val ? Number(val).toLocaleString() : "0"} ر.س
        </span>
      );
    if (col.key === "createdAt")
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
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#fafbfc]" style={{ fontFamily: "Tajawal, sans-serif" }} dir="rtl">
      {/* ── Dashboard Summary Cards ── */}
      <div className="shrink-0 flex items-center gap-3 px-4 py-3 bg-white border-b border-slate-200">
        {[
          { label: fixedOffice ? `إجمالي معاملات ${fixedOffice}` : "إجمالي المعاملات", value: stats.total, icon: <Database size={16} />, color: "text-slate-600", bg: "bg-slate-100" },
          { label: "معاملات نشطة (قيد العمل)", value: stats.active, icon: <Activity size={16} />, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "معاملات تتطلب الدفع", value: stats.unpaid, icon: <Banknote size={16} />, color: "text-orange-600", bg: "bg-orange-50" },
          { label: "معاملات تمت بالذكاء الاصطناعي", value: stats.fromAI, icon: <Brain size={16} />, color: "text-purple-600", bg: "bg-purple-50" },
        ].map((card, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-2 bg-white border border-slate-200 rounded-xl flex-1 min-w-0 shadow-sm">
            <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center ${card.color} shrink-0`}>
              {card.icon}
            </div>
            <div className="min-w-0">
              <div className="text-lg font-black text-slate-800">{card.value}</div>
              <div className="text-[10px] font-bold text-slate-500 truncate">{card.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Header Bar ── */}
      <div className="shrink-0 bg-white border-b border-slate-200 relative z-20">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-2">
            <FileSignature size={18} className="text-blue-600" />
            <span className="text-base font-black text-slate-800">
              {fixedOffice ? `معاملات ${fixedOffice}` : "السجل المركزي للمعاملات"}
            </span>
            <span className="text-[10px] font-bold bg-slate-100 text-slate-500 rounded px-2 py-0.5 mt-1">
              {filtered.length} معاملة
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                if(!showDuplicatesPanel) scanForDuplicates();
                setShowDuplicatesPanel(!showDuplicatesPanel);
              }}
              className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all shadow-sm ${showDuplicatesPanel ? 'bg-orange-50 border-orange-300 text-orange-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
               {isScanningDuplicates ? (
                 <Loader2 size={14} className="animate-spin text-orange-500" />
               ) : (
                 <BellRing size={14} className={stats.potentialDuplicates > 0 ? "text-orange-500 animate-pulse" : "text-slate-400"} />
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
              label="إضافه معاملة"
              icon={<Plus size={14} />}
              color="blue"
              options={[
                { id: "manual", label: "إنشاء معاملة يدوياً", icon: <Edit3 size={12} /> },
              ]}
              onSelect={() => {
                setModalMode("add");
                setEditingTx(null);
                setActiveModal("manual");
              }}
              onMainClick={() => {
                setModalMode("add");
                setEditingTx(null);
                setActiveModal("manual");
              }}
            />
            <SmartDropdownButton
              label="تحليل AI"
              icon={<Brain size={14} />}
              color="purple"
              options={[
                { id: "upload-ai", label: "استخراج بيانات معاملة (AI)", icon: <Sparkles size={12} /> },
              ]}
              onSelect={(selectedId) => {
                setModalMode("add");
                setEditingTx(null);
                setActiveModal(selectedId);
              }}
              onMainClick={() => {
                setModalMode("add");
                setEditingTx(null);
                setActiveModal("upload-ai");
              }}
            />
          </div>
        </div>

        {/* Search Row */}
        <div className="flex items-center gap-2 px-4 py-2 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-1.5 flex-1 max-w-md shadow-sm focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-100 transition-all">
            <Search size={14} className="text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="ابحث برقم المعاملة، هوية العميل..."
              className="bg-transparent text-xs font-bold text-slate-700 placeholder-slate-400 outline-none flex-1"
            />
            {searchText && (
              <button onClick={() => setSearchText("")}>
                <X size={12} className="text-slate-400 hover:text-red-500" />
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-2 mr-auto">
            <span className="text-[10px] font-bold text-slate-400 shrink-0">تصنيفات سريعة:</span>
            {chipFilters.map((chip) => {
              const isActive = chipFilter === chip.id;
              const colors = {
                blue: isActive ? "bg-blue-100 text-blue-800 border-blue-300" : "bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100",
                purple: isActive ? "bg-purple-100 text-purple-800 border-purple-300" : "bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100",
                orange: isActive ? "bg-orange-100 text-orange-800 border-orange-300" : "bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100",
              }[chip.color];

              return (
                <button
                  key={chip.id}
                  onClick={() => setChipFilter(isActive ? "" : chip.id)}
                  className={`flex items-center gap-1.5 text-[10px] font-bold px-3 py-1 rounded-full border transition-all ${colors}`}
                >
                  {chip.label} <span className="opacity-70 bg-white/50 px-1.5 rounded-full">{chip.count}</span>
                  {isActive && <X size={10} />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Content Area: Table & Duplicates Panel ── */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* 💡 لوحة التكرارات */}
        {showDuplicatesPanel && (
          <div className="w-[380px] bg-white border-l border-slate-200 flex flex-col shadow-xl z-10 shrink-0 animate-in slide-in-from-right-4 duration-300">
            <div className="p-4 border-b border-slate-100 bg-orange-50/30 flex justify-between items-center">
              <div className="flex items-center gap-2 text-orange-800">
                <Files size={18} className="text-orange-500" />
                <h3 className="font-black text-sm">مراجعة تكرار المعاملات</h3>
              </div>
              <button onClick={() => setShowDuplicatesPanel(false)} className="p-1.5 text-slate-400 hover:bg-white hover:text-slate-700 rounded-lg transition-colors">
                <ChevronRight size={16} />
              </button>
            </div>

            <div className="p-3 border-b border-slate-100 flex justify-between items-center bg-white">
               <span className="text-xs font-bold text-slate-600">نتائج الفحص:</span>
               <button onClick={scanForDuplicates} disabled={isScanningDuplicates} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold rounded-lg transition-colors">
                 <RefreshCw size={12} className={isScanningDuplicates ? "animate-spin" : ""} /> إعادة الفحص
               </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar-slim bg-slate-50/50">
              {isScanningDuplicates ? (
                 <div className="flex flex-col items-center justify-center py-20 text-center">
                   <Brain size={40} className="text-orange-300 animate-pulse mb-4" />
                   <p className="text-sm font-bold text-slate-600 mb-1">جاري فحص المعاملات...</p>
                 </div>
              ) : duplicateGroups.length > 0 ? (
                <div className="space-y-4">
                  {duplicateGroups.map((group) => {
                    const isDanger = group.type === 'danger';
                    const colors = isDanger 
                      ? { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', badge: 'bg-red-100' }
                      : { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-800', badge: 'bg-orange-100' };

                    return (
                      <div key={group.id} className={`rounded-xl border ${colors.bg} ${colors.border} overflow-hidden shadow-sm`}>
                        <div className={`px-3 py-2 border-b ${colors.border} flex justify-between items-center bg-white/50`}>
                           <span className={`text-[11px] font-black ${colors.text} flex items-center gap-1.5`}>
                             {isDanger ? <AlertTriangle size={12} /> : <Files size={12} />} {group.reason}
                           </span>
                           <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${colors.badge}`}>{group.members.length} سجلات</span>
                        </div>
                        <div className="p-2 space-y-1.5">
                          {group.members.map((member) => (
                            <div 
                              key={member.id} 
                              onClick={() => setSelectedTx(member)}
                              className="bg-white border border-slate-200 p-2.5 rounded-lg cursor-pointer hover:border-blue-400 transition-all"
                            >
                              <div className="flex justify-between items-start mb-1.5">
                                <span className="font-mono text-xs font-bold text-blue-700">{member.txNumber || "بدون رقم"}</span>
                                <span className="text-[9px] text-slate-400 bg-slate-100 px-1.5 rounded">{formatDate(member.createdAt)}</span>
                              </div>
                              <div className="text-[11px] font-bold text-slate-700 truncate mb-1">{member.clientName || "—"}</div>
                              <div className="flex justify-between items-center text-[10px] text-slate-500">
                                <span>{member.type || "—"}</span>
                                <span className="font-mono bg-slate-50 px-1 rounded border border-slate-100">{member.idNumber || "—"}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                   <div className="w-16 h-16 bg-emerald-50 border-2 border-emerald-100 rounded-full flex items-center justify-center mb-4">
                     <CheckCircle2 size={24} className="text-emerald-500" />
                   </div>
                   <h4 className="text-sm font-black text-slate-700 mb-1">السجل سليم تماماً!</h4>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 💡 الجدول الرئيسي للمعاملا */}
        <div className="flex-1 flex flex-col overflow-hidden bg-white relative">
          <div className="flex-1 overflow-auto custom-scrollbar-slim" ref={tableRef}>
            <table className="w-max min-w-full text-[11px] border-collapse">
              <thead className="sticky top-0 z-10">
                <tr className="bg-slate-100 shadow-sm">
                  <th className="sticky right-0 z-20 bg-slate-100 px-2 py-2 border-b border-l border-slate-200 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={selectedRows.size === sorted.length && sorted.length > 0}
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
                        {sort.key === col.key && (sort.dir === "asc" ? <ArrowUp size={10} className="text-blue-600" /> : <ArrowDown size={10} className="text-blue-600" />)}
                      </span>
                    </th>
                  ))}
                  <th className="px-3 py-2 border-b border-slate-200 text-[11px] font-black text-slate-700 text-center w-28">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={visibleColumns.length + 2} className="text-center py-12">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-500 mx-auto" />
                    </td>
                  </tr>
                ) : sorted.length === 0 ? (
                  <tr>
                    <td colSpan={visibleColumns.length + 2} className="text-center py-12 text-slate-400 font-bold text-sm">
                      <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-50" /> لا توجد معاملات مسجلة
                    </td>
                  </tr>
                ) : (
                  sorted.map((tx, ri) => {
                    const isActive = selectedTx?.id === tx.id;
                    const isSelected = selectedRows.has(tx.id);
                    const rowStyle = getRowStyle(tx, isActive, isSelected, ri % 2 === 0);

                    return (
                      <tr
                        key={tx.id}
                        className="border-b border-slate-100 cursor-pointer transition-all hover:shadow-sm"
                        style={rowStyle}
                        onClick={() => setSelectedTx(tx)}
                      >
                        <td
                          className="sticky right-0 z-10 px-2 py-1.5 border-l border-slate-100 text-center"
                          style={{ backgroundColor: "inherit" }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            checked={selectedRows.has(tx.id)}
                            onChange={() => toggleRow(tx.id)}
                            className="w-3.5 h-3.5 accent-blue-600 rounded"
                          />
                        </td>
                        {visibleColumns.map((col) => (
                          <td key={col.key} className="px-3 py-2 border-l border-slate-100 whitespace-nowrap">
                            {col.key === "txNumber" || col.key === "idNumber" ? (
                              <span className="flex items-center gap-1 group/copy">
                                <span className="font-mono font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100/50">
                                  {String(tx[col.key] || "—")}
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    copyToClipboard(String(tx[col.key]), `${tx.id}-${col.key}`);
                                  }}
                                  className="opacity-0 group-hover/copy:opacity-100 text-slate-400 hover:text-blue-600 transition-opacity"
                                >
                                  {copiedId === `${tx.id}-${col.key}` ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                                </button>
                              </span>
                            ) : (
                              renderCell(tx, col)
                            )}
                          </td>
                        ))}
                        <td className="px-2 py-1.5 text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-1.5">
                            <button onClick={() => setSelectedTx(tx)} title="معاينة التفاصيل" className="p-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-100 rounded-lg text-blue-600 transition-colors">
                              <Eye size={14} />
                            </button>
                            <button onClick={() => { setModalMode("edit"); setEditingTx(tx); setActiveModal("manual"); }} title="تعديل المعاملة" className="p-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-100 rounded-lg text-amber-600 transition-colors">
                              <Edit3 size={14} />
                            </button>
                            <button onClick={() => { if (window.confirm("حذف المعاملة نهائياً؟")) deleteMutation.mutate(tx.id); }} title="حذف المعاملة" className="p-1.5 bg-red-50 hover:bg-red-100 border border-red-100 rounded-lg text-red-500 transition-colors">
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
          
          <div className="bg-slate-50 border-t border-slate-200 p-2 text-[11px] text-slate-500 font-bold flex justify-between items-center shrink-0">
             <span>تم عرض {sorted.length} من أصل {serverTransactions.length} معاملة</span>
             {showDuplicatesPanel && duplicateGroups.length > 0 && (
               <span className="text-red-500 flex items-center gap-1"><AlertTriangle size={12}/> يرجى مراجعة التشابهات المكتشفة</span>
             )}
          </div>
        </div>
      </div>

      {/* 💡 النوافذ المنبثقة (Modals) الخاصة بالمعاملات */}
      {/* {selectedTx && (
        <ModalTransactionDetails
          transaction={selectedTx}
          onClose={() => setSelectedTx(null)}
        />
      )} */}
      
      {activeModal === "manual" && (
        <ModalManualTransaction
          mode={modalMode}
          transactionData={editingTx}
          onClose={() => setActiveModal(null)}
          fixedOffice={fixedOffice}
        />
      )}
      {activeModal === "upload-ai" && (
        <ModalUploadTxAi 
          onClose={() => setActiveModal(null)} 
          fixedOffice={fixedOffice}
        />
      )}
    </div>
  );
}

// ==========================================
// 💡 نافذة المعاملات اليدوية (ModalManualTransaction)
// ==========================================
export function ModalManualTransaction({ mode = "add", transactionData = null, onClose, fixedOffice }) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);

  const { data: clients = [] } = useQuery({ queryKey: ["clients-simple"], queryFn: async () => (await api.get("/clients/simple")).data || [] });
  const { data: offices = [] } = useQuery({ queryKey: ["offices-list"], queryFn: async () => (await api.get("/intermediary-offices")).data?.data || [] });
  const { data: existingTxs = [] } = useQuery({ queryKey: ["transactions-list"], queryFn: async () => (await api.get("/private-transactions")).data?.data || [] });

  const quickAddClient = useMutation({ mutationFn: async (data) => await api.post("/clients", data), onSuccess: () => { toast.success("تمت إضافة العميل بنجاح!"); queryClient.invalidateQueries(["clients-simple"]); } });
  const quickAddOffice = useMutation({ mutationFn: async (data) => await api.post("/intermediary-offices", data), onSuccess: () => { toast.success("تمت إضافة المكتب بنجاح!"); queryClient.invalidateQueries(["offices-list"]); } });

  const [formData, setFormData] = useState({
    txNumber: "",
    type: "فرز",
    status: "نشطة",
    ownerName: "",
    idNumber: "",
    amount: "",
    paymentStatus: "غير مدفوع",
    engineeringOffice: fixedOffice || "",
    source: "يدوي",
    notes: "",
    file: null,
  });

  useEffect(() => {
    if (mode === "edit" && transactionData) {
      setFormData({
        ...transactionData,
        engineeringOffice: fixedOffice || transactionData.engineeringOffice || "",
        file: null,
      });
    }
  }, [mode, transactionData, fixedOffice]);

  const duplicateWarning = useMemo(() => {
    if (!formData.txNumber || formData.txNumber.trim() === "") return null;
    const others = mode === "edit" ? existingTxs.filter((t) => t.id !== transactionData.id) : existingTxs;
    const dup = others.find((t) => String(t.txNumber) === String(toEnglishNumbers(formData.txNumber)));
    return dup ? { ownerName: dup.clientName || "غير محدد", type: dup.type || "غير محدد", idNumber: dup.idNumber || "غير محدد" } : null;
  }, [formData.txNumber, existingTxs, mode, transactionData]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      const fd = new FormData();
      Object.keys(data).forEach((key) => {
        let safeValue = data[key];
        if (["txNumber", "idNumber", "amount"].includes(key)) safeValue = toEnglishNumbers(data[key]);
        if (key === "file" && data.file) fd.append("file", data.file);
        else if (key !== "file" && safeValue !== null && safeValue !== undefined && safeValue !== "") fd.append(key, safeValue);
      });

      if (mode === "edit") return await api.put(`/private-transactions/${transactionData.id}`, fd, { headers: { "Content-Type": "multipart/form-data" } });
      else return await api.post("/private-transactions", fd, { headers: { "Content-Type": "multipart/form-data" } });
    },
    onSuccess: () => {
      toast.success(mode === "add" ? "تم تسجيل المعاملة بنجاح" : "تم التحديث بنجاح");
      queryClient.invalidateQueries(["transactions-list"]);
      onClose();
    },
    onError: (err) => toast.error(err.response?.data?.message || "حدث خطأ أثناء الحفظ"),
  });

  const handleSubmit = () => {
    if (!formData.txNumber || !formData.ownerName) return toast.error("يرجى إدخال رقم المعاملة واسم العميل كحد أدنى");
    saveMutation.mutate(formData);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4 animate-in fade-in" dir="rtl">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 rounded-t-xl bg-blue-600 shrink-0">
          <div className="flex items-center gap-2 text-white">
            <Edit3 className="w-5 h-5" />
            <span className="text-base font-bold">{mode === "add" ? "إنشاء معاملة يدوية" : "تعديل بيانات المعاملة"}</span>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/20 rounded-lg text-white/80 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
        </div>

        <div className="flex-1 overflow-auto p-6 custom-scrollbar-slim bg-[#fafbfc] space-y-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2 pb-2 border-b border-slate-100 flex items-center gap-2">
               <FileSignature className="w-4 h-4 text-blue-500" />
               <h4 className="font-bold text-slate-800 text-sm">بيانات المعاملة</h4>
            </div>

            <div>
              <SmartLinkedField
                label="اسم العميل *"
                value={formData.ownerName}
                onChange={(val) => setFormData({ ...formData, ownerName: val })}
                options={clients}
                listId="manualTxClientsList"
                placeholder="ابحث أو اكتب اسم العميل..."
                matchFn={(opt, val) => normalizeArabicText(opt.fullNameRaw) === normalizeArabicText(val) || opt.idNumber === formData.idNumber}
                isAdding={quickAddClient.isPending}
                onQuickAdd={() => quickAddClient.mutate({ name: JSON.stringify({ ar: formData.ownerName }), officialNameAr: formData.ownerName, idNumber: formData.idNumber, type: "individual", mobile: "0500000000" })}
              />
            </div>

            <CopyableInput label="رقم الهوية" value={formData.idNumber} onChange={(val) => setFormData({ ...formData, idNumber: val })} placeholder="10 أرقام" dir="ltr" style={{ textAlign: "right" }} />

            <div className="space-y-1 relative">
              <div className="flex items-center justify-between mb-0.5">
                <label className="text-[11px] font-bold text-slate-500 flex items-center gap-2">
                  رقم المعاملة *
                  {duplicateWarning && (
                    <span className="flex items-center gap-1 bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded text-[9px] border border-amber-300 shadow-sm animate-pulse">
                      <AlertTriangle size={10} /> مكرر
                    </span>
                  )}
                </label>
              </div>
              <input type="text" value={formData.txNumber} onChange={(e) => setFormData({ ...formData, txNumber: e.target.value })} placeholder="مثال: 1445-55" dir="rtl" className={`w-full text-[11px] font-bold border rounded-lg px-3 py-2 outline-none focus:ring-1 transition-colors ${duplicateWarning ? "bg-amber-50 border-amber-300" : "bg-slate-50 border-slate-200"}`} />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 block">نوع المعاملة</label>
              <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="w-full text-[11px] font-bold border border-slate-200 rounded-lg px-3 py-2 bg-slate-50">
                {["فرز", "دمج", "تجزئة", "نقل ملكية", "أخرى"].map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 block">حالة المعاملة</label>
              <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full text-[11px] font-bold border border-slate-200 rounded-lg px-3 py-2 bg-slate-50">
                {["نشطة", "معلقة", "مكتملة", "ملغاة"].map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <CopyableInput label="المبلغ (ر.س)" value={formData.amount} onChange={(val) => setFormData({ ...formData, amount: val })} placeholder="0" />

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 block">حالة السداد</label>
              <select value={formData.paymentStatus} onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })} className="w-full text-[11px] font-bold border border-slate-200 rounded-lg px-3 py-2 bg-slate-50">
                {["غير مدفوع", "دفعة أولى", "مدفوع بالكامل"].map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div>
              <SmartLinkedField
                label="جهة الإسناد / المكتب الهندسي"
                value={formData.engineeringOffice}
                disabled={!!fixedOffice} 
                onChange={(val) => setFormData({ ...formData, engineeringOffice: val })}
                options={offices}
                listId="txOfficesList"
                placeholder="ابحث أو اكتب المكتب..."
                matchFn={(opt, val) => normalizeArabicText(opt.nameAr).includes(normalizeArabicText(val))}
                isAdding={quickAddOffice.isPending}
                onQuickAdd={() => quickAddOffice.mutate({ nameAr: formData.engineeringOffice, status: "نشط" })}
              />
            </div>

            <div className="md:col-span-2 space-y-1">
              <label className="text-[11px] font-bold text-slate-500 block">ملاحظات</label>
              <textarea rows={2} value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[13px] font-bold outline-none focus:ring-1 focus:ring-blue-400"></textarea>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-slate-200 bg-white rounded-b-xl shrink-0">
          <button onClick={onClose} className="px-6 text-xs font-bold bg-slate-100 text-slate-600 rounded-xl py-2.5 hover:bg-slate-200 transition-colors">إلغاء</button>
          <button onClick={handleSubmit} disabled={saveMutation.isPending} className="px-8 text-xs font-bold bg-blue-600 text-white rounded-xl py-2.5 hover:bg-blue-700 flex items-center justify-center gap-2 disabled:opacity-50">
            {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} حفظ المعاملة
          </button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 💡 نافذة رفع معاملات بالذكاء الاصطناعي
// ==========================================
export function ModalUploadTxAi({ onClose, fixedOffice }) {
  const fileInputRef = useRef(null);
  
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4 animate-in fade-in" dir="rtl">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center flex flex-col items-center border border-purple-100 relative">
        <button onClick={onClose} className="absolute top-4 left-4 p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5" /></button>
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-5"><Brain className="w-8 h-8 text-purple-600" /></div>
        <h3 className="text-xl font-black text-slate-800 mb-2">استخراج بيانات المعاملة (AI)</h3>
        <p className="text-sm text-slate-500 font-semibold mb-6 px-4">ارفع ملف الإحالة أو العقد وسنقوم بتفريغ البيانات آلياً.</p>
        
        <div onClick={() => fileInputRef.current?.click()} className="w-full border-2 border-dashed border-purple-200 bg-slate-50 rounded-xl p-8 mb-6 cursor-pointer hover:bg-purple-50 transition-colors">
          <CloudUpload className="w-10 h-10 text-purple-400 mx-auto mb-2" />
          <div className="text-sm font-bold text-slate-700">اختر ملف المعاملة</div>
          <input ref={fileInputRef} type="file" accept=".pdf,image/*" className="hidden" onChange={() => toast.info('سيتم تفعيل محرك الذكاء الاصطناعي للمعاملات قريباً')} />
        </div>
        
        <div className="flex gap-3 w-full">
          <button onClick={onClose} className="flex-[0.4] py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 text-sm">إلغاء</button>
          <button onClick={() => toast.info('سيتم تفعيل هذه الميزة قريباً')} className="flex-1 py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5" /> بدء التحليل والمطابقة
          </button>
        </div>
      </div>
    </div>
  );
}