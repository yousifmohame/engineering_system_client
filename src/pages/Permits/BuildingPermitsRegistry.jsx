import React, { useState, useMemo, useCallback, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../api/axios";
import { toast } from "sonner";
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
} from "lucide-react";

import { SmartDropdownButton } from "../../components/SmartDropdownButton";
import { ModalManualPermit } from "../../components/ModalManualPermit";
import { ModalUploadAi } from "../../components/ModalUploadAi";
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
// 💡 مكونات Badges المساعدة للجدول
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
      className={`px-1.5 py-0.5 rounded text-[10px] ${config.bg} ${config.text}`}
    >
      {form || "—"}
    </span>
  );
}

// ==========================================
// 💡 السجل المركزي للرخص (الشاشة الرئيسية)
// ==========================================
export default function BuildingPermitsRegistry() {
  const queryClient = useQueryClient();

  const [searchText, setSearchText] = useState("");
  const [filterSource, setFilterSource] = useState("");
  const [filterForm, setFilterForm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [hiddenCols, setHiddenCols] = useState(new Set());
  const [sort, setSort] = useState({ key: "archiveDate", dir: "desc" });

  const [selectedPermit, setSelectedPermit] = useState(null); // 👈 للمعاينة ModalPermitDetails
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [colWidths, setColWidths] = useState(COLUMNS.map((c) => c.width));
  const [activeModal, setActiveModal] = useState(null);
  const [modalMode, setModalMode] = useState("add");
  const [editingPermit, setEditingPermit] = useState(null);
  const [chipFilter, setChipFilter] = useState("");
  const [copiedId, setCopiedId] = useState(null);
  const tableRef = useRef(null);

  // 💡 جلب البيانات
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
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "حدث خطأ أثناء الحذف"),
  });

  const visibleColumns = useMemo(
    () => COLUMNS.filter((c) => !hiddenCols.has(c.key)),
    [hiddenCols],
  );

  const filtered = useMemo(() => {
    let data = serverPermits;
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
  }, [serverPermits, searchText, filterSource, filterForm, chipFilter]);

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

  const stats = useMemo(() => {
    return {
      total: serverPermits.length,
      fromTransactions: serverPermits.filter(
        (p) => p.source === "نظام المعاملات",
      ).length,
      fromAI: serverPermits.filter((p) => p.source === "رفع يدوي (AI)").length,
      greenPermits: serverPermits.filter((p) => p.form === "أخضر").length,
    };
  }, [serverPermits]);

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
      {/* ── Dashboard Summary Cards ── */}
      <div className="shrink-0 flex items-center gap-3 px-4 py-3 bg-white border-b border-slate-200">
        {[
          {
            label: "إجمالي الرخص بالسجل",
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

      {/* ── Header Bar ── */}
      <div className="shrink-0 bg-white border-b border-slate-200">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-2">
            <Layers size={18} className="text-blue-600" />
            <span className="text-base font-black text-slate-800">
              السجل المركزي لرخص البناء
            </span>
            <span className="text-[10px] font-bold bg-slate-100 text-slate-500 rounded px-2 py-0.5 mt-1">
              {filtered.length} رخصة
            </span>
          </div>

          <div className="flex items-center gap-2">
            <SmartDropdownButton
              label="إضافه رخصة"
              icon={<Plus size={14} />}
              color="blue"
              options={[
                {
                  id: "manual",
                  label: "إدخال بيانات رخصة يدوياً",
                  icon: <Edit3 size={12} />,
                  description: "إضافة سجل رخصة جديد",
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
                  description: "استخراج البيانات تلقائياً من PDF أو صورة",
                },
                {
                  id: "manual",
                  label: "إدخال بيانات رخصة يدوياً",
                  icon: <Edit3 size={12} />,
                  description: "إضافة سجل رخصة جديد يدوياً",
                  divider: true,
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

        {/* Search Row */}
        <div className="flex items-center gap-2 px-4 py-2 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-1.5 flex-1 max-w-md shadow-sm">
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

      {/* ── Content Area: Table ── */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden bg-white relative">
          {/* Quick Filter Chips */}
          <div className="shrink-0 flex items-center gap-2 px-4 py-2 bg-white border-b border-slate-100">
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
                                <span className="font-mono font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
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
                                  className="opacity-0 group-hover/copy:opacity-100 text-slate-400 hover:text-blue-600"
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
                            {/* 💡 زر المعاينة يفتح الـ Modal المخصص */}
                            <button
                              onClick={() => setSelectedPermit(permit)}
                              title="معاينة التفاصيل"
                              className="p-1.5 bg-blue-50 hover:bg-blue-100 rounded-lg text-blue-600 transition-colors"
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
                              className="p-1.5 bg-amber-50 hover:bg-amber-100 rounded-lg text-amber-600 transition-colors"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm("حذف الرخصة؟"))
                                  deleteMutation.mutate(permit.id);
                              }}
                              title="حذف الرخصة"
                              className="p-1.5 bg-red-50 hover:bg-red-100 rounded-lg text-red-600 transition-colors"
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
        </div>
      </div>

      {/* 💡 استدعاء المودلز المساعدة والنافذة الخاصة بالتفاصيل */}
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
        />
      )}
      {activeModal === "upload-ai" && (
        <ModalUploadAi onClose={() => setActiveModal(null)} />
      )}
    </div>
  );
}
