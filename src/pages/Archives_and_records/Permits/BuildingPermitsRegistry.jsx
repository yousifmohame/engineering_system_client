import React, { useState, useMemo, useCallback, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../api/axios";
import { toast } from "sonner";
import {
  Search,
  Edit3,
  Layers,
  CheckCircle2,
  AlertTriangle,
  ScanLine,
  Database,
  Check,
  FolderOpen,
  Trash2,
  Brain,
  Loader2,
  BellRing,
  Files,
  ChevronRight,
  Sparkles,
  Plus,
  ArrowDown,
  ArrowUp,
  Copy,
  Eye,
  RefreshCw,
  X,
} from "lucide-react";
import { ModalPermitDetails } from "./PermitDetails/ModalPermitDetails";
import { ModalManualPermit } from "./components/ModalManualPermit";
import { ModalUploadAi } from "./components/ModalUploadAi";
import { AiBadge, FormBadge } from "./components/PermitSharedUI";

const COLUMNS = [
  { key: "permitNumber", label: "رقم الرخصة", width: 110 },
  { key: "year", label: "السنة", width: 60 },
  { key: "source", label: "مصدر السجل", width: 130 },
  { key: "type", label: "نوع الرخصة", width: 110 },
  { key: "form", label: "شكل الرخصة", width: 80 },
  { key: "ownerName", label: "اسم المالك", width: 170 },
  { key: "idNumber", label: "رقم الهوية", width: 105 },
  { key: "district", label: "الحي", width: 80 },
  { key: "planNumber", label: "رقم المخطط", width: 95 },
  { key: "usage", label: "الاستخدام", width: 90 },
  { key: "aiStatus", label: "حالة التحليل (AI)", width: 120 }, // تمت زيادة العرض قليلاً
  { key: "archiveDate", label: "تاريخ الأرشفة", width: 100 },
];

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
  const tableRef = useRef(null);

  // 💡 1. التحديث التلقائي الصامت للجدول (Auto-Polling) كل 5 ثواني
  const { data: serverPermits = [], isLoading } = useQuery({
    queryKey: ["building-permits"],
    queryFn: async () => {
      const res = await api.get("/permits");
      return res.data?.data || [];
    },
    refetchInterval: 5000, // يضمن ظهور الرخص المضافة في الخلفية تلقائياً
  });

  // 💡 2. جلب التكرارات من الباك إند
  const {
    data: duplicatesData = [],
    isFetching: isScanningDuplicates,
    refetch: refetchDuplicates,
  } = useQuery({
    queryKey: ["permit-duplicates"],
    queryFn: async () => {
      const res = await api.get("/permits/duplicates");
      return res.data?.data || [];
    },
    enabled: showDuplicatesPanel, // يعمل فقط عند فتح اللوحة
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => await api.delete(`/permits/${id}`),
    onSuccess: () => {
      toast.success("تم حذف الرخصة بنجاح");
      queryClient.invalidateQueries(["building-permits"]);
      queryClient.invalidateQueries(["permit-duplicates"]);
      if (selectedPermit) setSelectedPermit(null);
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "حدث خطأ أثناء الحذف"),
  });

  // 💡 3. زر الدمج المباشر من اللوحة الجانبية
  const autoMergeMutation = useMutation({
    mutationFn: async (duplicateId) =>
      await api.post(`/permits/${duplicateId}/auto-merge`),
    onSuccess: (res) => {
      toast.success(res.data?.message || "تم دمج الرخصة بنجاح! 🚀");
      queryClient.invalidateQueries(["building-permits"]);
      queryClient.invalidateQueries(["permit-duplicates"]);
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "حدث خطأ أثناء الدمج"),
  });

  const visibleColumns = useMemo(
    () => COLUMNS.filter((c) => !hiddenCols.has(c.key)),
    [hiddenCols],
  );

  const filtered = useMemo(() => {
    let data = serverPermits;
    if (fixedOffice)
      data = data.filter((p) => p.engineeringOffice === fixedOffice);
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

  const copyToClipboardFunc = (text, id) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const stats = useMemo(() => {
    return {
      total: filtered.length,
      fromTransactions: filtered.filter((p) => p.source === "نظام المعاملات")
        .length,
      fromAI: filtered.filter((p) => p.source === "رفع يدوي (AI)").length,
      greenPermits: filtered.filter((p) => p.form === "أخضر").length,
      potentialDuplicates: serverPermits.filter(
        (p) => p.aiStatus === "مكرر - بانتظار الدمج",
      ).length,
    };
  }, [filtered, serverPermits]);

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

    // 💡 4. تلوين الصف المكرر باللون البرتقالي
    if (permit.aiStatus === "مكرر - بانتظار الدمج") {
      bg = "rgba(245, 158, 11, 0.08)"; // لون برتقالي فاتح جداً
      borderLeft = "3px solid #f59e0b"; // حدود برتقالية
    } else {
      if (permit.source === "نظام المعاملات") borderLeft = "3px solid #10b981";
      else if (permit.source === "رفع يدوي (AI)")
        borderLeft = "3px solid #a855f7";
      else if (permit.form === "أخضر") borderLeft = "3px solid #22c55e";
    }

    if (isActive || isSelected) {
      bg = "rgba(59, 130, 246, 0.08)";
      borderLeft = "3px solid #3b82f6";
    }
    return { backgroundColor: bg, borderRight: borderLeft };
  };

  const renderCell = (permit, col) => {
    const val = permit[col.key];
    if (col.key === "form") return <FormBadge form={val} />;
    if (col.key === "source")
      return (
        <span className="px-1.5 py-0.5 bg-[#f4f7f8] text-[#123B5D] rounded text-[10px] font-bold border border-[#e8dcc8]">
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
      {/* Statistics Bar */}
      <div className="shrink-0 grid grid-cols-1 md:grid-cols-4 gap-2 px-4 py-2 bg-[#f4f7f8] border-b border-slate-200">
        {[
          {
            label: fixedOffice
              ? `إجمالي رخص ${fixedOffice}`
              : "إجمالي الرخص بالسجل",
            value: stats.total,
            icon: <Database size={16} />,
            color: "text-[#123B5D]",
            bg: "bg-[#f4f7f8]",
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
            color: "text-[#123B5D]",
            bg: "bg-[#f4f7f8]",
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
            className="flex items-center justify-between gap-2 px-3 py-2 bg-white border border-[#e8dcc8] rounded-2xl min-w-0 shadow-sm"
          >
            <div
              className={`w-9 h-9 rounded-xl ${card.bg} flex items-center justify-center ${card.color} shrink-0 border border-white/60`}
            >
              {card.icon}
            </div>
            <div className="min-w-0">
              <div className="text-lg font-black text-[#123B5D]">
                {card.value}
              </div>
              <div className="text-[10px] font-bold text-slate-500 truncate">
                {card.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Actions Bar */}
      <div className="shrink-0 bg-white border-b border-slate-200 relative z-20">
        <div className="flex items-center justify-between px-4 py-3 bg-[#0f3d50] text-white">
          <div className="flex items-center gap-2">
            <Layers size={18} className="text-[#d7b96d]" />
            <span className="text-lg font-black text-white">
              {fixedOffice ? `رخص ${fixedOffice}` : "السجل المركزي لرخص البناء"}
            </span>
            <span className="text-[10px] font-bold bg-white/10 text-white/80 rounded-lg px-2 py-0.5 mt-1 border border-white/10">
              {filtered.length} رخصة
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowDuplicatesPanel(!showDuplicatesPanel)}
              className={`relative flex items-center gap-1.5 px-3 py-2 rounded-xl border transition-all shadow-sm ${showDuplicatesPanel ? "bg-orange-50 border-orange-300 text-orange-700" : "bg-white/10 border-white/15 text-white hover:bg-white/20"}`}
            >
              <BellRing
                size={14}
                className={
                  stats.potentialDuplicates > 0
                    ? "text-orange-500 animate-pulse"
                    : "text-slate-400"
                }
              />
              <span className="text-xs font-bold">فحص التكرارات</span>
              {stats.potentialDuplicates > 0 && !showDuplicatesPanel && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full animate-bounce">
                  {stats.potentialDuplicates}
                </span>
              )}
            </button>
            <div className="w-px h-6 bg-white/20 mx-1"></div>
            <button
              onClick={() => {
                setModalMode("add");
                setEditingPermit(null);
                setActiveModal("manual");
              }}
              className="flex items-center gap-2 px-4 py-2 bg-[#d7b96d] text-[#0f3d50] rounded-xl text-xs font-black shadow-sm hover:bg-[#e4c87d] transition-all"
            >
              <Plus size={14} /> إضافة رخصة
            </button>
            <button
              onClick={() => {
                setModalMode("add");
                setEditingPermit(null);
                setActiveModal("upload-ai");
              }}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-xl text-xs font-black border border-white/15 hover:bg-white/20 transition-all"
            >
              <Brain size={14} /> تحليل AI
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 border-t border-slate-100 bg-[#f4f7f8]">
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 flex-1 max-w-md shadow-sm focus-within:border-[#d7b96d] focus-within:ring-1 focus-within:ring-[#d7b96d]/20 transition-all">
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
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* 💡 5. لوحة التكرارات המربوطة بالـ Backend مباشرة */}
        {showDuplicatesPanel && (
          <div className="w-[420px] bg-white border-l border-slate-200 flex flex-col shadow-xl z-10 shrink-0 animate-in slide-in-from-right-4 duration-300">
            <div className="p-4 border-b border-slate-100 bg-orange-50/30 flex justify-between items-center">
              <div className="flex items-center gap-2 text-orange-800">
                <Files size={18} className="text-orange-500" />
                <h3 className="font-black text-sm">
                  مراجعة التكرارات والتشابهات
                </h3>
              </div>
              <button
                onClick={() => setShowDuplicatesPanel(false)}
                className="p-1.5 text-slate-400 hover:bg-white hover:text-slate-700 rounded-lg transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
            <div className="p-3 border-b border-slate-100 flex justify-between items-center bg-white">
              <span className="text-xs font-bold text-slate-600">
                نتائج الفحص الذكي:
              </span>
              <button
                onClick={() => refetchDuplicates()}
                disabled={isScanningDuplicates}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-[#edf2f4] text-slate-700 text-[10px] font-bold rounded-lg transition-colors"
              >
                <RefreshCw
                  size={12}
                  className={isScanningDuplicates ? "animate-spin" : ""}
                />{" "}
                تحديث الفحص
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar-slim bg-slate-50/50">
              {isScanningDuplicates ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <Loader2
                    size={40}
                    className="text-orange-300 animate-spin mb-4"
                  />
                  <p className="text-sm font-bold text-slate-600 mb-1">
                    جاري جلب التشابهات من الداتا بيز...
                  </p>
                </div>
              ) : duplicatesData.length > 0 ? (
                <div className="space-y-4">
                  {duplicatesData.map((group) => (
                    <div
                      key={group.duplicateId}
                      className={`rounded-xl border bg-orange-50 border-orange-200 overflow-hidden shadow-sm`}
                    >
                      <div
                        className={`px-3 py-2 border-b border-orange-200 flex justify-between items-center bg-white/50`}
                      >
                        <span
                          className={`text-[11px] font-black text-orange-800 flex items-center gap-1.5`}
                        >
                          <AlertTriangle size={12} /> {group.reason}
                        </span>

                        {/* 💡 زر الدمج المباشر من اللوحة */}
                        <button
                          onClick={() =>
                            autoMergeMutation.mutate(group.duplicateId)
                          }
                          disabled={autoMergeMutation.isPending}
                          className="px-3 py-1 bg-orange-500 text-white text-[10px] font-bold rounded shadow-sm hover:bg-orange-600 disabled:opacity-50 flex items-center gap-1"
                        >
                          {autoMergeMutation.isPending ? (
                            <Loader2 size={10} className="animate-spin" />
                          ) : (
                            <Layers size={10} />
                          )}{" "}
                          دمج السجلين
                        </button>
                      </div>

                      <div className="p-2 space-y-2">
                        {/* السجل الأساسي */}
                        <div
                          onClick={() =>
                            setSelectedPermit(group.originalPermit)
                          }
                          className="bg-white border border-emerald-200 p-2 rounded-lg cursor-pointer hover:shadow-md relative"
                        >
                          <span className="absolute top-0 right-0 bg-emerald-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-bl-lg">
                            الأساسي الأقدم
                          </span>
                          <div className="mt-2 text-xs font-bold text-slate-700">
                            {group.originalPermit.ownerName} -{" "}
                            {group.originalPermit.permitNumber}
                          </div>
                        </div>

                        {/* السجل المكرر (المرفوع بالذكاء) */}
                        <div
                          onClick={() =>
                            setSelectedPermit(group.duplicatePermit)
                          }
                          className="bg-white border border-red-200 p-2 rounded-lg cursor-pointer hover:shadow-md relative opacity-80"
                        >
                          <span className="absolute top-0 right-0 bg-red-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-bl-lg">
                            مكرر (مرفوع AI)
                          </span>
                          <div className="mt-2 text-xs font-bold text-slate-700">
                            {group.duplicatePermit.ownerName} -{" "}
                            {group.duplicatePermit.permitNumber}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-16 h-16 bg-emerald-50 border-2 border-emerald-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 size={24} className="text-emerald-500" />
                  </div>
                  <h4 className="text-sm font-black text-slate-700 mb-1">
                    السجل سليم تماماً!
                  </h4>
                  <p className="text-xs text-slate-500">
                    لا توجد أي رخص معلقة بانتظار الدمج.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Table Data */}
        <div className="flex-1 flex flex-col overflow-hidden bg-white relative">
          <div
            className="flex-1 overflow-auto custom-scrollbar-slim"
            ref={tableRef}
          >
            <table className="w-max min-w-full text-[11px] border-collapse">
              <thead className="sticky top-0 z-10">
                <tr className="bg-[#f4f7f8] shadow-sm">
                  <th className="sticky right-0 z-20 bg-[#f4f7f8] px-2 py-2 border-b border-l border-slate-200 w-10 text-center">
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
                      className="px-3 py-2 border-b border-l border-slate-200 text-right text-[11px] font-black text-slate-700 select-none cursor-pointer hover:bg-[#edf2f4]"
                      style={{ width: colWidths[ci] }}
                      onClick={() => handleSort(col.key)}
                    >
                      <span className="flex items-center gap-1">
                        {col.label}{" "}
                        {sort.key === col.key &&
                          (sort.dir === "asc" ? (
                            <ArrowUp size={10} className="text-[#d7b96d]" />
                          ) : (
                            <ArrowDown size={10} className="text-[#d7b96d]" />
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
                      <Loader2 className="w-6 h-6 animate-spin text-[#0f3d50] mx-auto" />
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
                        className="border-b border-slate-100 cursor-pointer hover:shadow-sm"
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
                                <span className="font-mono font-bold text-[#123B5D] bg-[#f4f7f8] px-1.5 py-0.5 rounded border border-[#e8dcc8]/50">
                                  {String(permit[col.key] || "—")}
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    copyToClipboardFunc(
                                      String(permit[col.key]),
                                      `${permit.id}-${col.key}`,
                                    );
                                  }}
                                  className="opacity-0 group-hover/copy:opacity-100 text-slate-400 hover:text-[#123B5D]"
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
                              className="px-2 py-1.5 bg-[#f4f7f8] text-[#123B5D] rounded-lg hover:bg-[#edf2f4] flex items-center gap-1"
                            >
                              <Eye size={14} />
                              <span className="text-[10px] font-bold">عرض</span>
                            </button>
                            <button
                              onClick={() => {
                                setModalMode("edit");
                                setEditingPermit(permit);
                                setActiveModal("manual");
                              }}
                              className="px-2 py-1.5 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 flex items-center gap-1"
                            >
                              <Edit3 size={14} />
                              <span className="text-[10px] font-bold">
                                تعديل
                              </span>
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm("حذف الرخصة؟"))
                                  deleteMutation.mutate(permit.id);
                              }}
                              className="px-2 py-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 flex items-center gap-1"
                            >
                              <Trash2 size={14} />
                              <span className="text-[10px] font-bold">حذف</span>
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
        </div>
      </div>

      {selectedPermit && (
        <ModalPermitDetails
          permit={selectedPermit}
          onClose={() => setSelectedPermit(null)}
        />
      )}
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
