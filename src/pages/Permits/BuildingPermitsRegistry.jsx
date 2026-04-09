import React, { useState, useMemo, useCallback, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../api/axios";
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
  Copy,
  Eye,
  RefreshCw
} from "lucide-react";

import { SmartDropdownButton } from "../../components/SmartDropdownButton";
import { ModalPermitDetails } from "../../components/ModalPermitDetails";
import { ModalManualPermit } from "./components/ModalManualPermit"; // مسار المودال اليدوي
import { ModalUploadAi } from "./components/ModalUploadAi"; // مسار مودال الذكاء الاصطناعي
import { AiBadge, FormBadge } from "./components/PermitSharedUI"; // مسار الـ Badges
import { formatDate } from "./utils/permitHelpers";

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
  { key: "aiStatus", label: "حالة التحليل (AI)", width: 105 },
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

  const scanForDuplicates = useCallback(() => {
    setIsScanningDuplicates(true);
    setTimeout(() => {
      const groups = [];
      const processedIds = new Set();
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
      if (groups.length === 0)
        toast.success("السجل سليم! لا توجد أي تكرارات أو تشابهات.", {
          icon: "✨",
        });
      else
        toast.warning(`تم اكتشاف ${groups.length} حالة تشابه تحتاج للمراجعة.`);
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
      {/* (1) Statistics Bar */}
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

      {/* (2) Actions Bar */}
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

      {/* (3) Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Duplicates Panel */}
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
                            )}{" "}
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

        {/* Table Data */}
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
                        {col.label}{" "}
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
                                    copyToClipboardFunc(
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

      {selectedPermit && (
        <ModalPermitDetails
          permit={selectedPermit}
          onClose={() => setSelectedPermit(null)}
        />
      )}

      {/* استدعاء الموديلز المنفصلة */}
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
