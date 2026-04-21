import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../api/axios"; // 💡 تأكد من مسار الـ axios الصحيح لمشروعك
import { toast } from "sonner";
import {
  Plus,
  Search,
  Filter,
  CalendarDays,
  Users,
  FileText,
  ChevronLeft,
  Briefcase,
  Link as LinkIcon,
  Trash2,
  Copy,
  CheckCircle,
  ClipboardList,
  Sparkles,
  AlertTriangle,
  Zap,
  Gauge,
  Bot,
  Loader2,
} from "lucide-react";
import MeetingMinuteGenerator from "./MeetingGenerator/MeetingMinuteGenerator";

export default function MeetingsMain({
  onCreateQuote,
  onCreateTransaction,
  onNavigate,
}) {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredStatus, setFilteredStatus] = useState("all");
  const [selectedMinute, setSelectedMinute] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // =========================================
  // 🚀 1. جلب البيانات من الباك إند
  // =========================================
  const { data: minutes = [], isLoading } = useQuery({
    queryKey: ["meeting-minutes"],
    queryFn: async () => {
      const res = await api.get("/meeting-minutes");
      return res.data?.data || [];
    },
  });

  // =========================================
  // 🚀 2. عمليات الحفظ (إنشاء وتحديث)
  // =========================================
  const saveMutation = useMutation({
    mutationFn: async (minuteData) => {
      if (minuteData.isNewRecord) {
        return await api.post("/meeting-minutes", minuteData);
      } else {
        return await api.put(`/meeting-minutes/${minuteData.id}`, minuteData);
      }
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries(["meeting-minutes"]);
      // إذا كان سجلاً جديداً، نحدث الحالة بالـ ID القادم من السيرفر لكي يعمل الحفظ التلقائي لاحقاً كتحديث
      if (selectedMinute && selectedMinute.isNewRecord) {
        setSelectedMinute({ ...res.data, isNewRecord: false });
      }
    },
    onError: (error) => {
      toast.error("حدث خطأ أثناء حفظ المحضر");
    },
  });

  // 🚀 دالة الحفظ المحدثة (ترجع الـ Promise للمكون الفرعي)
  const handleSave = async (savedMinute, closeAfter = true) => {
    try {
      // نستخدم mutateAsync لكي ننتظر الرد من السيرفر
      const res = await saveMutation.mutateAsync(savedMinute);

      if (closeAfter) {
        setIsGenerating(false);
        setSelectedMinute(null);
        toast.success("تم حفظ المحضر بنجاح");
      } else {
        // تحديث العنصر المحدد لكي لا يتم إنشاؤه مرة أخرى
        if (selectedMinute && selectedMinute.isNewRecord) {
          setSelectedMinute({ ...res.data, isNewRecord: false });
        }
      }
      return res.data; // 💡 إرجاع بيانات السيرفر (تحتوي على الـ ID الحقيقي)
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  // =========================================
  // 🚀 3. عملية الحذف
  // =========================================
  const deleteMutation = useMutation({
    mutationFn: async (id) => await api.delete(`/meeting-minutes/${id}`),
    onSuccess: () => {
      toast.success("تم حذف المحضر بنجاح");
      queryClient.invalidateQueries(["meeting-minutes"]);
    },
  });

  const handleDelete = (id, e) => {
    e.stopPropagation();
    if (window.confirm("هل أنت متأكد من حذف هذا المحضر نهائياً؟")) {
      deleteMutation.mutate(id);
    }
  };

  // =========================================
  // 🚀 4. عملية النسخ (Duplication)
  // =========================================
  const handleDuplicate = (id, e) => {
    e.stopPropagation();
    const original = minutes.find((m) => m.id === id);
    if (original) {
      const { id: oldId, ...rest } = original; // إزالة الـ ID القديم
      const duplicate = {
        ...rest,
        isNewRecord: true,
        referenceNumber: `MM-${new Date().getFullYear()}-${String(minutes.length + 1).padStart(3, "0")}`,
        title: `${original.title} (نسخة)`,
        status: "مسودة",
      };

      const duplicateToast = toast.loading("جاري نسخ المحضر...");
      saveMutation.mutate(duplicate, {
        onSuccess: () => {
          toast.success("تم نسخ المحضر بنجاح", { id: duplicateToast });
        },
      });
    }
  };

  // =========================================
  // 💡 دوال مساعدة وتحضير البيانات
  // =========================================
  const handleCreateNew = () => {
    const newMinute = {
      isNewRecord: true, // 💡 علامة للميوتيشن أنه جديد
      referenceNumber: `MM-${new Date().getFullYear()}-${String(minutes.length + 1).padStart(3, "0")}`,
      title: "",
      status: "مسودة",
      meetingType: "إداري",
      meetingCapacity: "استعراض",
      isFollowUp: false,
      meetingDate: new Date().toISOString().split("T")[0],
      startTime: "10:00",
      endTime: "11:00",
      preparationDate: new Date().toISOString().split("T")[0],
      location: "مقر الشركة",
      channel: "اجتماع حضوري",
      requester: "",
      clientName: "",
      attendees: [],
      axes: [],
      steps: [],
      attachments: [],
    };
    setSelectedMinute(newMinute);
    setIsGenerating(true);
  };

  const filteredMinutes = minutes.filter((m) => {
    const matchesSearch =
      (m.title || "").includes(searchTerm) ||
      (m.clientName || "").includes(searchTerm) ||
      (m.referenceNumber || "").includes(searchTerm);
    const matchesStatus =
      filteredStatus === "all" || m.status === filteredStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "مسودة":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "مؤرشف":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div
      className="h-full flex flex-col bg-slate-50 font-sans overflow-hidden"
      dir="rtl"
    >
      {/* 💡 الشريط العلوي المكثف (Ultra-Dense Top Bar) */}
      <header className="bg-white p-2 sm:px-4 sm:py-2.5 border-b border-slate-200 shrink-0 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-3 shadow-sm z-10">
        {/* العنوان */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-md text-white">
            <ClipboardList className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm font-black text-slate-900 leading-tight">
              إدارة محاضر الاجتماعات
            </h1>
            <div className="flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 text-amber-500" />
              <p className="text-[9px] font-bold text-slate-500">
                نظام توثيق مدعوم بالذكاء الاصطناعي
              </p>
            </div>
          </div>
        </div>

        {/* الإحصائيات المكثفة (Ultra-Compact Stats) */}
        <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar w-full xl:w-auto pb-1 xl:pb-0">
          {[
            {
              label: "إجمالي المحاضر",
              count: minutes.length,
              icon: FileText,
              color: "text-indigo-600",
              bg: "bg-indigo-50 border-indigo-100",
            },
            {
              label: "أداء التوثيق",
              count: "94%",
              icon: Gauge,
              color: "text-emerald-600",
              bg: "bg-emerald-50 border-emerald-100",
            },
            {
              label: "مسودات قيد العمل",
              count: minutes.filter((m) => m.status === "مسودة").length,
              icon: CalendarDays,
              color: "text-amber-600",
              bg: "bg-amber-50 border-amber-100",
            },
          ].map((s, i) => (
            <div
              key={i}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border shrink-0 ${s.bg}`}
            >
              <s.icon className={`w-3.5 h-3.5 ${s.color}`} />
              <div className="flex flex-col">
                <span
                  className={`text-[8px] font-black uppercase leading-none mb-0.5 ${s.color}`}
                >
                  {s.label}
                </span>
                <span className="text-[11px] font-black text-slate-800 leading-none">
                  {isLoading ? "-" : s.count}
                </span>
              </div>
            </div>
          ))}

          {/* مؤشر الـ Copilot */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-900 rounded-lg border border-slate-800 shrink-0">
            <Bot className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
            <div className="flex flex-col">
              <span className="text-[8px] font-black uppercase text-indigo-400 leading-none mb-0.5">
                Meeting Copilot
              </span>
              <span className="text-[9px] font-bold text-slate-300 leading-none">
                نشط وجاهز
              </span>
            </div>
          </div>
        </div>

        {/* أزرار الإجراءات والبحث */}
        <div className="flex items-center gap-1.5 shrink-0 w-full xl:w-auto">
          <div className="relative flex-1 xl:w-48">
            <Search className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="بحث سريع..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-2 pr-8 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-bold focus:ring-1 focus:ring-indigo-500 outline-none"
            />
          </div>

          <select
            value={filteredStatus}
            onChange={(e) => setFilteredStatus(e.target.value)}
            className="px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">كل الحالات</option>
            <option value="مسودة">مسودة</option>
            <option value="مؤرشف">مؤرشف</option>
          </select>

          <button
            onClick={handleCreateNew}
            className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-[10px] font-black shadow-sm flex justify-center items-center gap-1.5 hover:bg-indigo-700 transition-all shrink-0"
          >
            <Plus className="w-3 h-3" /> محضر جديد
          </button>
        </div>
      </header>

      {/* 💡 منطقة الجدول المكثف */}
      <div className="flex-1 p-2 sm:p-3 overflow-hidden flex flex-col min-w-0">
        <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="overflow-x-auto overflow-y-auto custom-scrollbar flex-1">
            <table className="w-full text-right relative">
              <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="px-3 py-2.5 text-[10px] font-black text-slate-500 uppercase tracking-tighter whitespace-nowrap">
                    المرجع والتفاصيل
                  </th>
                  <th className="px-3 py-2.5 text-[10px] font-black text-slate-500 uppercase tracking-tighter whitespace-nowrap">
                    العميل / المعني
                  </th>
                  <th className="px-3 py-2.5 text-[10px] font-black text-slate-500 uppercase tracking-tighter whitespace-nowrap">
                    تاريخ ومكان الاجتماع
                  </th>
                  <th className="px-3 py-2.5 text-[10px] font-black text-slate-500 uppercase tracking-tighter whitespace-nowrap text-center">
                    التحليل (AI)
                  </th>
                  <th className="px-3 py-2.5 text-[10px] font-black text-slate-500 uppercase tracking-tighter whitespace-nowrap text-center">
                    الحالة
                  </th>
                  <th className="px-3 py-2.5 text-[10px] font-black text-slate-500 uppercase tracking-tighter whitespace-nowrap w-24">
                    إجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center">
                      <Loader2 className="w-6 h-6 animate-spin text-indigo-500 mx-auto mb-2" />
                      <span className="text-[10px] font-bold text-slate-400">
                        جاري جلب المحاضر...
                      </span>
                    </td>
                  </tr>
                ) : (
                  filteredMinutes.map((minute) => (
                    <tr
                      key={minute.id}
                      onClick={() => {
                        setSelectedMinute(minute);
                        setIsGenerating(true);
                      }}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    >
                      {/* العمود الأول: المرجع والعنوان */}
                      <td className="px-3 py-2 align-middle">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-1.5 rounded">
                              {minute.referenceNumber}
                            </span>
                            {/* أيقونات الربط المدمجة */}
                            <div className="flex gap-0.5 opacity-70">
                              {minute.linkedQuoteId && (
                                <FileText
                                  className="w-3 h-3 text-emerald-500"
                                  title="مربوط بعرض سعر"
                                />
                              )}
                              {minute.linkedContractId && (
                                <Briefcase
                                  className="w-3 h-3 text-indigo-500"
                                  title="مربوط بعقد"
                                />
                              )}
                              {minute.transactionId && (
                                <LinkIcon
                                  className="w-3 h-3 text-blue-500"
                                  title="مربوط بمعاملة"
                                />
                              )}
                            </div>
                          </div>
                          <span
                            className="text-[11px] font-black text-slate-800 truncate max-w-[200px]"
                            title={minute.title}
                          >
                            {minute.title || "محضر بدون عنوان"}
                          </span>
                        </div>
                      </td>

                      {/* العمود الثاني: العميل */}
                      <td className="px-3 py-2 align-middle">
                        <div className="flex items-center gap-1.5">
                          <div className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                            <Users className="w-3 h-3" />
                          </div>
                          <span className="text-[11px] font-bold text-slate-700 truncate max-w-[120px]">
                            {minute.clientName || "غير محدد"}
                          </span>
                        </div>
                      </td>

                      {/* العمود الثالث: التاريخ والمكان */}
                      <td className="px-3 py-2 align-middle">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black text-slate-700">
                            {minute.meetingDate || "غير محدد"}
                          </span>
                          <span
                            className="text-[9px] text-slate-400 truncate max-w-[120px]"
                            title={minute.location || minute.channel}
                          >
                            {minute.location || minute.channel}
                          </span>
                        </div>
                      </td>

                      {/* العمود الرابع: تحليل الذكاء الاصطناعي (مبسط) */}
                      <td className="px-3 py-2 align-middle text-center">
                        <div className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-100 px-2 py-1 rounded-md">
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${minute.finalOutcomes ? "bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.5)]" : "bg-amber-400"}`}
                          ></div>
                          <span
                            className={`text-[9px] font-black ${minute.finalOutcomes ? "text-emerald-700" : "text-amber-700"}`}
                          >
                            {minute.finalOutcomes ? "موجز ذكي" : "قيد المعالجة"}
                          </span>
                        </div>
                      </td>

                      {/* العمود الخامس: الحالة */}
                      <td className="px-3 py-2 align-middle text-center">
                        <span
                          className={`inline-block px-2 py-0.5 text-[9px] font-black rounded border ${getStatusColor(minute.status)}`}
                        >
                          {minute.status}
                        </span>
                      </td>

                      {/* العمود السادس: الإجراءات */}
                      <td className="px-3 py-2 align-middle">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onCreateQuote?.(minute);
                            }}
                            title="إنشاء عرض سعر"
                            className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>

                          {minute.transactionId ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (onNavigate) onNavigate("transactions");
                              }}
                              title="عرض المعاملة"
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            >
                              <LinkIcon className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onCreateTransaction?.(minute);
                              }}
                              title="إنشاء معاملة"
                              className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors"
                            >
                              <Briefcase className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            onClick={(e) => handleDuplicate(minute.id, e)}
                            title="نسخ المحضر"
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={(e) => handleDelete(minute.id, e)}
                            title="حذف المحضر"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}

                {/* 💡 بديل EmptyState المدمج */}
                {!isLoading && filteredMinutes.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12">
                      <div className="flex flex-col items-center justify-center text-slate-400">
                        <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                          <ClipboardList className="w-6 h-6 opacity-50" />
                        </div>
                        <p className="text-xs font-black text-slate-600 mb-1">
                          لا توجد محاضر مطابقة
                        </p>
                        <p className="text-[10px] font-bold text-slate-400 mb-4">
                          لم يتم العثور على أي محاضر اجتماعات تطابق بحثك.
                        </p>
                        <button
                          onClick={handleCreateNew}
                          className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black hover:bg-indigo-100 transition-colors"
                        >
                          إنشاء محضر جديد
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isGenerating && selectedMinute && (
        <MeetingMinuteGenerator
          minute={selectedMinute}
          onClose={() => {
            setIsGenerating(false);
            setSelectedMinute(null);
          }}
          onSave={handleSave}
          onGoToTransaction={
            onNavigate ? () => onNavigate("transactions") : undefined
          }
          isNew={selectedMinute.isNewRecord}
        />
      )}
    </div>
  );
}
