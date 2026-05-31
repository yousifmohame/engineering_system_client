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
  onCreateContract,
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

  const handleViewMinute = (minute, e) => {
    e?.stopPropagation?.();
    if (!minute) return;
    setSelectedMinute({ ...minute, isNewRecord: false });
    setIsGenerating(true);
  };

  const goToModule = (route, payload = {}) => {
    const detail = {
      route,
      payload,
      source: "meeting-minutes",
      minuteId: payload?.minute?.id || payload?.minuteId || null,
      minuteReference: payload?.minute?.referenceNumber || payload?.referenceNumber || null,
    };

    if (typeof onNavigate === "function") {
      onNavigate(route, detail);
      return true;
    }

    window.dispatchEvent(new CustomEvent("wms:navigate", { detail }));
    window.dispatchEvent(new CustomEvent("wms:open-module", { detail }));

    try {
      window.location.hash = route.startsWith("#") ? route : `#/${route}`;
    } catch (_) {}

    toast.success("تم إرسال أمر الانتقال للصفحة المطلوبة.");
    return true;
  };

  const handleCreateQuoteFromMinute = (minute, e) => {
    e?.stopPropagation?.();
    if (typeof onCreateQuote === "function") {
      onCreateQuote(minute);
      return;
    }
    goToModule("quotes", {
      action: "create",
      source: "meeting-minute",
      minute,
      minuteId: minute?.id,
      referenceNumber: minute?.referenceNumber,
    });
  };

  const handleCreateTransactionFromMinute = (minute, e) => {
    e?.stopPropagation?.();
    if (typeof onCreateTransaction === "function") {
      onCreateTransaction(minute);
      return;
    }
    goToModule("transactions", {
      action: "create",
      source: "meeting-minute",
      minute,
      minuteId: minute?.id,
      referenceNumber: minute?.referenceNumber,
    });
  };

  const handleOpenTransactionFromMinute = (minute, e) => {
    e?.stopPropagation?.();
    goToModule("transactions", {
      action: "open",
      transactionId: minute?.transactionId,
      transactionRef: minute?.transactionRef,
      source: "meeting-minute",
      minute,
      minuteId: minute?.id,
    });
  };

  const handleCreateContractFromMinute = (minute, e) => {
    e?.stopPropagation?.();
    if (typeof onCreateContract === "function") {
      onCreateContract(minute);
      return;
    }
    goToModule("contracts", {
      action: "create",
      source: "meeting-minute",
      minute,
      minuteId: minute?.id,
      referenceNumber: minute?.referenceNumber,
    });
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
        return "bg-[#fbf8f1] text-[#334155] border-[#e8ddc8]";
    }
  };

  return (
    <div
      className="flex h-full flex-col overflow-hidden bg-[radial-gradient(circle_at_top_left,#eef7f6,transparent_32%),linear-gradient(135deg,#fbf8f1_0%,#ffffff_48%,#f3f7f6_100%)] p-2.5 font-sans md:p-3"
      dir="rtl"
    >
      {/* الشريط العلوي - تنظيم أوضح بدون قصّ النصوص */}
      <header className="relative z-10 mb-3 shrink-0 overflow-hidden rounded-[24px] border border-[#c5983c]/25 bg-gradient-to-l from-[#08111c] via-[#0f3448] to-[#123f59] p-2.5 shadow-[0_12px_28px_rgba(18,63,89,0.16)] md:p-3">
        <div className="flex flex-col gap-2">
          {/* الصف الأول: العنوان + زر الإنشاء */}
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#e2bf74] text-[#08111c] shadow-sm">
                <ClipboardList className="h-4 w-4" />
              </div>

              <div className="min-w-0">
                <h1 className="text-lg font-black leading-tight text-white md:text-xl">
                  إدارة محاضر الاجتماعات
                </h1>
                <div className="mt-0.5 flex items-start gap-1.5">
                  <Sparkles className="mt-0.5 h-3 w-3 shrink-0 text-amber-400" />
                  <p className="text-[11px] font-bold leading-relaxed text-white/70">
                    نظام توثيق مدعوم بالذكاء الاصطناعي
                  </p>
                </div>
              </div>
            </div>

            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
              <select
                value={filteredStatus}
                onChange={(e) => setFilteredStatus(e.target.value)}
                className="h-9 w-full rounded-xl border border-white/15 bg-white/10 px-3 text-[12px] font-black text-white outline-none transition focus:border-[#e2bf74]/70 focus:bg-white/15 sm:w-[155px] [&_option]:bg-white [&_option]:text-[#123f59]"
              >
                <option value="all" className="bg-white text-[#123f59]">كل الحالات</option>
                <option value="مسودة" className="bg-white text-[#123f59]">مسودة</option>
                <option value="مؤرشف" className="bg-white text-[#123f59]">مؤرشف</option>
              </select>

              <button
                type="button"
                onClick={handleCreateNew}
                className="inline-flex h-9 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-4 text-[12px] font-black text-[#123f59] shadow-[0_10px_20px_rgba(255,255,255,0.10)] transition hover:-translate-y-0.5 hover:bg-[#fbf8f1] sm:w-auto"
              >
                <Plus className="h-4 w-4" />
                محضر جديد
              </button>
            </div>
          </div>

          {/* الصف الثاني: الفلاتر والإحصائيات */}
          <div className="grid grid-cols-1 gap-2 xl:grid-cols-[minmax(260px,330px)_1fr] xl:items-stretch">
            {/* البحث */}
            <div className="relative">
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#dbe7ef]/70" />
              <input
                type="text"
                placeholder="بحث سريع باسم المحضر، العميل أو المرجع..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-10 w-full rounded-xl border border-white/15 bg-white/10 pr-10 pl-3 text-[12px] font-bold text-white outline-none placeholder:text-white/45 focus:border-[#e2bf74]/70 focus:bg-white/15"
              />
            </div>

            {/* الإحصائيات: نسخة أفقية مدمجة مثل التصميم المقترح */}
            <div className="grid grid-cols-1 gap-1.5 md:grid-cols-3">
              {[
                {
                  label: "إجمالي المحاضر",
                  count: minutes.length,
                  icon: FileText,
                  color: "text-[#0e7490]",
                  bg: "from-[#f8fdff] to-[#eaf6fb] border-[#b9dcea]",
                  iconBg: "bg-white/75",
                  separator: "bg-[#b9dcea]",
                },
                {
                  label: "أداء التوثيق",
                  count: "94%",
                  icon: Gauge,
                  color: "text-emerald-600",
                  bg: "from-[#f1fff9] to-[#dff8ed] border-emerald-100",
                  iconBg: "bg-white/70",
                  separator: "bg-emerald-100",
                },
                {
                  label: "مسودات قيد العمل",
                  count: minutes.filter((m) => m.status === "مسودة").length,
                  icon: CalendarDays,
                  color: "text-amber-600",
                  bg: "from-[#fffaf0] to-[#fff3cf] border-amber-100",
                  iconBg: "bg-white/75",
                  separator: "bg-amber-100",
                },
              ].map((s, i) => (
                <div
                  key={i}
                  className={`flex h-[36px] min-w-0 items-center gap-1.5 rounded-[14px] border bg-gradient-to-l px-2 shadow-[0_6px_14px_rgba(0,0,0,0.09)] ${s.bg}`}
                >
                  <div className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg ${s.iconBg}`}>
                    <s.icon className={`h-3.5 w-3.5 ${s.color}`} />
                  </div>

                  <span className={`min-w-0 flex-1 truncate text-right text-[10.5px] font-black leading-none ${s.color}`}>
                    {s.label}
                  </span>

                  <span className={`h-5 w-px shrink-0 ${s.separator}`} />

                  <span className="shrink-0 text-[18px] font-black leading-none tracking-tight text-[#123f59]">
                    {isLoading ? "-" : s.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* 💡 منطقة الجدول المكثف */}
      <div className="flex-1 overflow-hidden flex flex-col min-w-0">
        <div className="flex-1 overflow-hidden rounded-[20px] border border-[#d8b46a]/30 bg-white shadow-[0_10px_28px_rgba(18,63,89,0.08)] flex flex-col">
          <div className="custom-scrollbar-slim flex-1 overflow-x-auto overflow-y-auto">
            <table className="w-full min-w-[980px] xl:min-w-full table-fixed text-right relative">
              <colgroup>
                <col className="w-[28%]" />
                <col className="w-[24%]" />
                <col className="w-[15%]" />
                <col className="w-[13%]" />
                <col className="w-[8%]" />
                <col className="w-[12%]" />
              </colgroup>
              <thead className="sticky top-0 z-10 bg-[#0f3448] text-white shadow-sm">
                <tr>
                  <th className="border-l border-white/10 px-3 py-2 text-[10px] font-black text-white whitespace-nowrap">
                    المرجع والتفاصيل
                  </th>
                  <th className="border-l border-white/10 px-3 py-2 text-[10px] font-black text-white whitespace-nowrap">
                    العميل / المعني
                  </th>
                  <th className="border-l border-white/10 px-3 py-2 text-[10px] font-black text-white whitespace-nowrap">
                    تاريخ ومكان الاجتماع
                  </th>
                  <th className="border-l border-white/10 px-3 py-2 text-[10px] font-black text-white whitespace-nowrap text-center">
                    التحليل (AI)
                  </th>
                  <th className="border-l border-white/10 px-3 py-2 text-[10px] font-black text-white whitespace-nowrap text-center">
                    الحالة
                  </th>
                  <th className="border-l border-white/10 px-2 py-2 text-center text-[10px] font-black text-white whitespace-nowrap">
                    إجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e8ddc8]/70">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center">
                      <Loader2 className="w-6 h-6 animate-spin text-[#0e7490] mx-auto mb-2" />
                      <span className="text-[10px] font-bold text-[#8da0bb]">
                        جاري جلب المحاضر...
                      </span>
                    </td>
                  </tr>
                ) : (
                  filteredMinutes.map((minute) => (
                    <tr
                      key={minute.id}
                      onClick={() => handleViewMinute(minute)}
                      className="group cursor-pointer transition-colors hover:bg-[#eef7f6]/65"
                    >
                      {/* العمود الأول: المرجع والعنوان */}
                      <td className="px-2 py-2 align-middle">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5">
                            <span className="shrink-0 rounded-lg bg-[#eef7f6] px-2 py-0.5 text-[10px] font-black text-[#0e7490]">
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
                                  className="w-3 h-3 text-[#0e7490]"
                                  title="مربوط بعقد"
                                />
                              )}
                              {minute.transactionId && (
                                <LinkIcon
                                  className="w-3 h-3 text-[#0e7490]"
                                  title="مربوط بمعاملة"
                                />
                              )}
                            </div>
                          </div>
                          <span
                            className="block text-[11px] font-black leading-relaxed text-[#123f59] whitespace-normal break-words"
                            title={minute.title}
                          >
                            {minute.title || "محضر بدون عنوان"}
                          </span>
                        </div>
                      </td>

                      {/* العمود الثاني: العميل */}
                      <td className="px-2 py-2 align-middle">
                        <div className="flex items-start gap-2">
                          <div className="grid h-7 w-7 shrink-0 place-items-center rounded-xl border border-[#e8ddc8] bg-[#fbf8f1] text-[#8da0bb]">
                            <Users className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <span className="block text-[11px] font-black leading-relaxed text-[#334155] whitespace-normal break-words">
                              {minute.clientName || "غير محدد"}
                            </span>
                            {minute.attendees?.length > 0 && (
                              <span className="mt-1 inline-flex rounded-lg bg-[#eef7f6] px-2 py-0.5 text-[9px] font-black text-[#0e7490]">
                                {minute.attendees.length} حاضر
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* العمود الثالث: التاريخ والمكان */}
                      <td className="px-2 py-2 align-middle">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black text-[#334155]">
                            {minute.meetingDate || "غير محدد"}
                          </span>
                          <span
                            className="text-[9px] font-bold leading-relaxed text-[#8da0bb] whitespace-normal break-words"
                            title={minute.location || minute.channel}
                          >
                            {minute.location || minute.channel}
                          </span>
                        </div>
                      </td>

                      {/* العمود الرابع: تحليل الذكاء الاصطناعي (مبسط) */}
                      <td className="px-2 py-2 align-middle text-center">
                        <div className="inline-flex items-center justify-center gap-1 rounded-xl border border-[#e8ddc8]/70 bg-[#fbf8f1] px-2 py-1">
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
                      <td className="px-2 py-2 align-middle text-center">
                        <span
                          className={`inline-block px-2 py-0.5 text-[9px] font-black rounded border ${getStatusColor(minute.status)}`}
                        >
                          {minute.status}
                        </span>
                      </td>

                      {/* العمود السادس: الإجراءات */}
                      <td className="px-2 py-2 align-middle">
                        <div className="grid grid-cols-2 gap-1">
                          <button type="button"
                            onClick={(e) => handleViewMinute(minute, e)}
                            title="عرض / معاينة المحضر"
                            className="inline-flex h-6 items-center justify-center gap-0.5 rounded-lg bg-emerald-50 px-1.5 text-[8px] font-black text-emerald-700 transition hover:bg-emerald-600 hover:text-white"
                          >
                            <FileText className="w-2.5 h-2.5" /> عرض
                          </button>

                          {minute.transactionId ? (
                            <button type="button"
                              onClick={(e) => handleOpenTransactionFromMinute(minute, e)}
                              title="عرض المعاملة"
                              className="inline-flex h-6 items-center justify-center gap-0.5 rounded-lg bg-[#eef7f6] px-1.5 text-[8px] font-black text-[#0e7490] transition hover:bg-[#0e7490] hover:text-white"
                            >
                              <LinkIcon className="w-2.5 h-2.5" /> فتح
                            </button>
                          ) : (
                            <button type="button"
                              onClick={(e) => handleCreateTransactionFromMinute(minute, e)}
                              title="إنشاء معاملة"
                              className="inline-flex h-6 items-center justify-center gap-0.5 rounded-lg bg-amber-50 px-1.5 text-[8px] font-black text-amber-700 transition hover:bg-amber-500 hover:text-white"
                            >
                              <Briefcase className="w-2.5 h-2.5" /> معاملة
                            </button>
                          )}

                          <button type="button"
                            onClick={(e) => handleDuplicate(minute.id, e)}
                            title="نسخ المحضر"
                            className="inline-flex h-6 items-center justify-center gap-0.5 rounded-lg bg-[#eef7f6] px-1.5 text-[8px] font-black text-[#0e7490] transition hover:bg-[#0e7490] hover:text-white"
                          >
                            <Copy className="w-2.5 h-2.5" /> نسخ
                          </button>

                          <button type="button"
                            onClick={(e) => handleDelete(minute.id, e)}
                            title="حذف المحضر"
                            className="inline-flex h-6 items-center justify-center gap-0.5 rounded-lg bg-rose-50 px-1.5 text-[8px] font-black text-rose-600 transition hover:bg-rose-500 hover:text-white"
                          >
                            <Trash2 className="w-2.5 h-2.5" /> حذف
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
                      <div className="flex flex-col items-center justify-center text-[#8da0bb]">
                        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-[#e8ddc8] bg-[#fbf8f1]">
                          <ClipboardList className="w-6 h-6 opacity-50" />
                        </div>
                        <p className="text-xs font-black text-[#60738f] mb-1">
                          لا توجد محاضر مطابقة
                        </p>
                        <p className="text-[10px] font-bold text-[#8da0bb] mb-4">
                          لم يتم العثور على أي محاضر اجتماعات تطابق بحثك.
                        </p>
                        <button type="button"
                          onClick={handleCreateNew}
                          className="px-4 py-2 bg-[#eef7f6] text-[#0e7490] rounded-xl text-[10px] font-black hover:bg-[#eef7f6] transition-colors"
                        >
                          <Plus className="inline h-3 w-3 ml-1" /> إنشاء محضر جديد
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
          onCreateQuote={handleCreateQuoteFromMinute}
          onCreateTransaction={handleCreateTransactionFromMinute}
          onCreateContract={handleCreateContractFromMinute}
          onNavigate={goToModule}
          isNew={selectedMinute.isNewRecord}
        />
      )}
    </div>
  );
}
