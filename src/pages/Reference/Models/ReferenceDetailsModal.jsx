import React, { useState, useEffect, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "../../../api/axios";
import { useAuth } from "../../../context/AuthContext";
import {
  X,
  Trash2,
  BookOpen,
  Brain,
  Zap,
  Sparkles,
  MessageSquare,
  Filter,
  History,
  Share2,
  Loader2,
  Info,
  Target,
  AlertTriangle,
  Wind,
  Activity,
  CheckCircle2,
  Paperclip,
  FileText,
  Eye,
} from "lucide-react";

// 💡 دالة تحويل الرابط للملفات
const getFullUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  let fixedUrl = url;
  if (url.startsWith("/uploads/")) {
    fixedUrl = `/api${url}`;
  }
  const baseUrl = "https://details-worksystem1.com";
  return `${baseUrl}${fixedUrl}`;
};

export default function ReferenceDetailsModal({ isOpen, onClose, document }) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [manualNotes, setManualNotes] = useState("");
  const [showLogs, setShowLogs] = useState(false);

  useEffect(() => {
    if (document) {
      setManualNotes(document.manualNotes || "");
    }
  }, [document]);

  const { data: logs = [], isLoading: isLoadingLogs } = useQuery({
    queryKey: ["reference-logs", document?.id],
    queryFn: async () => {
      const res = await api.get(`/references/${document.id}/logs`);
      return res.data.data;
    },
    enabled: !!document?.id && showLogs,
  });

  const updateNotesMutation = useMutation({
    mutationFn: async (notes) =>
      api.put(`/references/${document.id}/notes`, {
        manualNotes: notes,
        userName: user?.name,
        userEmail: user?.email,
      }),
    onSuccess: () => {
      toast.success("تم حفظ التوجيهات وتحديث السجل");
      queryClient.invalidateQueries(["reference-documents"]);
      queryClient.invalidateQueries(["reference-logs", document?.id]);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => api.delete(`/references/${document.id}`),
    onSuccess: () => {
      toast.success("تم حذف المستند بنجاح");
      queryClient.invalidateQueries(["reference-documents"]);
      onClose();
    },
  });

  const reanalyzeMutation = useMutation({
    mutationFn: async (type) =>
      api.post(`/references/${document.id}/reanalyze`, {
        type,
        userName: user?.name,
        userEmail: user?.email,
      }),
    onSuccess: () => {
      toast.success("بدأت عملية التحليل.. تم تسجيل الإجراء في السجل");
      queryClient.invalidateQueries(["reference-documents"]);
      queryClient.invalidateQueries(["reference-logs", document?.id]);
    },
  });

  const handleDelete = () => {
    if (window.confirm("هل أنت متأكد من حذف هذا المستند نهائياً؟")) {
      deleteMutation.mutate();
    }
  };

  // 🚀 استخراج ذكي للملخص، القواعد، والمستهدفين من النص المدمج (aiSummary)
  const parsedAI = useMemo(() => {
    if (!document || !document.aiSummary)
      return { summary: "", rules: [], audience: "" };

    let summary = document.aiSummary;
    let rules = [];
    let audience = "غير محدد";

    try {
      if (document.aiSummary.includes("⚠️ أهم الاشتراطات:")) {
        const parts = document.aiSummary.split("⚠️ أهم الاشتراطات:");
        summary = parts[0].replace("📌 الملخص:", "").trim();

        const rulesPart = parts[1];
        if (rulesPart.includes("🎯 المستهدفون:")) {
          const subParts = rulesPart.split("🎯 المستهدفون:");
          audience = subParts[1].replace(/[:\n]/g, "").trim();
          rules = subParts[0]
            .split(/\n-|\n•/)
            .map((r) => r.replace(/^[-•]/, "").trim())
            .filter(Boolean);
        } else {
          rules = rulesPart
            .split(/\n-|\n•/)
            .map((r) => r.replace(/^[-•]/, "").trim())
            .filter(Boolean);
        }
      }
    } catch (e) {
      console.error("Error parsing AI summary", e);
    }

    return { summary, rules, audience };
  }, [document]);

  if (!isOpen || !document) return null;

  const issueDate = document.issueDate
    ? new Date(document.issueDate).toLocaleDateString("en-GB")
    : "غير محدد";
  const expiryDate = document.expiryDate
    ? new Date(document.expiryDate).toLocaleDateString("en-GB")
    : "غير محدد";
  const bldTypes = document.buildingTypes?.length
    ? document.buildingTypes
    : ["الكل"];
  const districts = document.districts?.length ? document.districts : ["الكل"];

  // معالجة الملفات المتعددة
  const fileUrls = document.fileUrl
    ? document.fileUrl.split(",").filter((url) => url.trim() !== "")
    : [];

  return (
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in"
      dir="rtl"
    >
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col w-full max-w-5xl max-h-[90vh] animate-in zoom-in-95 relative">
        {/* ─── Header ─── */}
        <div className="bg-slate-900 p-6 text-white relative shrink-0">
          <div className="absolute top-4 left-4 flex gap-2">
            <button
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors"
            >
              {deleteMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin text-rose-400" />
              ) : (
                <Trash2 className="w-4 h-4 text-slate-400 hover:text-rose-400" />
              )}
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors bg-white/5"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>

          <div className="flex items-center gap-4 mb-4 pr-2">
            <div className="p-3 bg-emerald-500 rounded-2xl shadow-lg shadow-emerald-500/20">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-black leading-tight mb-1">
                {document.title}
              </h3>
              <p className="text-xs text-slate-400 font-bold">
                {document.source}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <span className="px-3 py-1 bg-white/10 rounded-lg text-[10px] font-black border border-white/5">
              إصدار: {issueDate}
            </span>
            <span
              className={`px-3 py-1 rounded-lg text-[10px] font-black border border-white/5 ${document.status === "نشط" ? "bg-emerald-500/20 text-emerald-300" : "bg-white/10 text-white"}`}
            >
              الحالة: {document.status || "نشط"}
            </span>
            <span className="px-3 py-1 bg-white/10 rounded-lg text-[10px] font-black border border-white/5">
              النوع: {document.type || "عام"}
            </span>
          </div>
        </div>

        {/* ─── Body ─── */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar-slim">
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => reanalyzeMutation.mutate("full")}
              disabled={
                reanalyzeMutation.isPending ||
                document.analysisStatus === "قيد التحليل"
              }
              className="flex items-center justify-center gap-2 py-3 bg-purple-50 text-purple-700 rounded-xl text-xs font-black hover:bg-purple-100 transition-all border border-purple-100 disabled:opacity-50"
            >
              {reanalyzeMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Brain className="w-4 h-4" />
              )}{" "}
              إعادة التحليل الذكي
            </button>
            <button
              onClick={() => reanalyzeMutation.mutate("quick")}
              disabled={
                reanalyzeMutation.isPending ||
                document.analysisStatus === "قيد التحليل"
              }
              className="flex items-center justify-center gap-2 py-3 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-black hover:bg-emerald-100 transition-all border border-emerald-100 disabled:opacity-50"
            >
              {reanalyzeMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Zap className="w-4 h-4" />
              )}{" "}
              تلخيص سريع
            </button>
          </div>

          <div className="space-y-8">
            {/* 🚀 التقرير التحليلي الشامل 🚀 */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-black text-slate-900 flex items-center gap-2 border-r-4 border-purple-500 pr-3">
                  <Sparkles className="w-5 h-5 text-purple-500" /> التقرير
                  التحليلي الشامل (AI)
                </h4>
                <span
                  className={`text-[10px] font-black px-3 py-1 rounded-lg ${document.analysisStatus === "محلل" ? "bg-emerald-100 text-emerald-700" : "bg-purple-100 text-purple-700 animate-pulse"}`}
                >
                  {document.analysisStatus || "غير محلل"}
                </span>
              </div>
              {/* 1. الملخص الذكي */}
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 shadow-sm">
                <h5 className="text-sm font-black text-emerald-900 mb-3 flex items-center gap-2">
                  <Brain className="w-4 h-4 text-emerald-600" /> الملخص التنفيذي
                  (AI)
                </h5>
                <div className="text-xs font-bold text-emerald-800 leading-loose whitespace-pre-wrap">
                  {parsedAI.summary ||
                    "لم يتم توليد ملخص ذكي لهذا المستند حتى الآن. اضغط على زر التحليل الذكي للبدء."}
                </div>
              </div>
              {/* 2. النطاق والبروتوكولات المستخرجة */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* بطاقة النطاق والمستهدفون */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                  <h5 className="text-sm font-black text-slate-900 mb-4 flex items-center gap-2">
                    <Target className="w-4 h-4 text-indigo-500" /> النطاق
                    والمستهدفون
                  </h5>
                  <div className="space-y-3 text-xs font-bold text-slate-700 leading-relaxed">
                    <p>
                      <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded mr-1">
                        المدينة والقطاع:
                      </span>{" "}
                      {document.city || "كافة المدن"} -{" "}
                      {document.sector || "كافة القطاعات"}
                    </p>
                    <p>
                      <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded mr-1">
                        المعاملات:
                      </span>{" "}
                      {document.txType || "كافة المعاملات"}
                    </p>
                    <p>
                      <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded mr-1">
                        المباني المستهدفة:
                      </span>{" "}
                      {bldTypes.join("، ")}
                    </p>
                    {document.analysisStatus === "محلل" && (
                      <p className="mt-2 text-slate-500 border-t border-slate-100 pt-2 flex items-start gap-2">
                        <Info className="w-3.5 h-3.5 mt-0.5 text-slate-400 shrink-0" />
                        <span className="text-indigo-800">
                          {parsedAI.audience}
                        </span>
                      </p>
                    )}
                  </div>
                </div>

                {/* البروتوكولات الفنية (مستخرجة من الذكاء الاصطناعي) */}
                <div className="space-y-4">
                  <div className="bg-cyan-50 border border-cyan-100 rounded-2xl p-5 shadow-sm">
                    <h5 className="text-sm font-black text-cyan-900 mb-2 flex items-center gap-2">
                      <Wind className="w-4 h-4 text-cyan-600" /> بروتوكول
                      التشغيل (الرياح)
                    </h5>
                    <div className="text-[11px] font-bold text-cyan-800 mt-2 leading-relaxed">
                      {document.windProtocol ? (
                        <span className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 text-cyan-500 shrink-0" />{" "}
                          {document.windProtocol}
                        </span>
                      ) : (
                        <span className="text-cyan-600/60">
                          لم يُذكر بروتوكول محدد للرياح أو الطقس في هذا المستند.
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 shadow-sm">
                    <h5 className="text-sm font-black text-blue-900 mb-2 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-blue-600" /> بروتوكول
                      الرصد والامتثال
                    </h5>
                    <div className="text-[11px] font-bold text-blue-800 mt-2 leading-relaxed">
                      {document.monitoringProtocol ? (
                        <span className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 text-blue-500 shrink-0" />{" "}
                          {document.monitoringProtocol}
                        </span>
                      ) : (
                        <span className="text-blue-600/60">
                          لم يُذكر بروتوكول للرصد البيئي في هذا المستند.
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-amber-50/50 border border-amber-200 rounded-3xl p-6 shadow-sm mt-4">
                <h5 className="text-base font-black text-amber-900 mb-5 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600" /> أهم
                  الاشتراطات والقواعد الإلزامية (Key Rules)
                </h5>

                {/* 🚀 القراءة مباشرة من المصفوفة في الداتابيز */}
                {document.keyRules && document.keyRules.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {document.keyRules.map((rule, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 bg-amber-100/40 p-3.5 rounded-xl border border-amber-100/50"
                      >
                        <div className="w-6 h-6 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center text-[11px] font-black shrink-0">
                          {index + 1}
                        </div>
                        <p className="text-[11px] font-bold text-slate-700 leading-relaxed mt-0.5">
                          {rule}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-white/50 rounded-2xl border border-dashed border-amber-200">
                    <p className="text-amber-700/60 text-sm font-bold">
                      {document.analysisStatus === "قيد التحليل"
                        ? "جاري استخراج القواعد الإلزامية..."
                        : "لم يتم استخراج قواعد لهذا المستند."}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* توجيهات الإدارة */}
            <div className="space-y-3 pt-6 border-t border-slate-100">
              <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-500" /> شرح وتوجيهات
                الإدارة (يدوي)
              </h4>
              <textarea
                value={manualNotes}
                onChange={(e) => setManualNotes(e.target.value)}
                placeholder="أضف ملاحظات أو توجيهات داخلية للفريق..."
                className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none min-h-[100px] transition-all shadow-sm resize-none"
              />
              <div className="flex justify-end">
                <button
                  onClick={() => updateNotesMutation.mutate(manualNotes)}
                  disabled={updateNotesMutation.isPending}
                  className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black hover:bg-slate-800 transition-colors shadow-md disabled:opacity-50 flex items-center gap-2"
                >
                  {updateNotesMutation.isPending && (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  )}{" "}
                  حفظ التوجيهات
                </button>
              </div>
            </div>

            {/* محددات الانطباق التفصيلية */}
            <div className="space-y-4 p-5 bg-slate-50/50 rounded-3xl border border-slate-200">
              <h4 className="text-sm font-black text-slate-900 flex items-center gap-2 mb-4">
                <Filter className="w-4 h-4 text-emerald-500" /> محددات الانطباق
                (Applicability Scope)
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4 md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5 p-3 bg-white border border-slate-100 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-400">
                      نوع المعاملة
                    </span>
                    <div className="text-xs font-bold text-slate-800">
                      {document.txType || "الكل"}
                    </div>
                  </div>
                  <div className="space-y-1.5 p-3 bg-white border border-slate-100 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-400">
                      التصنيف الرئيسي
                    </span>
                    <div className="text-xs font-bold text-slate-800">
                      {document.txMainCategory || "الكل"}
                    </div>
                  </div>
                  <div className="space-y-1.5 p-3 bg-white border border-slate-100 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-400">
                      التصنيف الفرعي
                    </span>
                    <div className="text-xs font-bold text-slate-800">
                      {document.txSubCategory || "الكل"}
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 p-3 bg-white border border-slate-100 rounded-xl md:col-span-1">
                  <span className="text-[10px] font-bold text-slate-400">
                    أنواع المباني
                  </span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {bldTypes.map((b) => (
                      <span
                        key={b}
                        className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-md text-[10px] font-bold text-slate-700"
                      >
                        {b}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5 p-3 bg-white border border-slate-100 rounded-xl md:col-span-2">
                  <span className="text-[10px] font-bold text-slate-400">
                    نطاق مساحة الأرض م²
                  </span>
                  <div
                    className="text-xs font-bold text-slate-800 mt-1"
                    dir="ltr"
                  >
                    {document.landAreaFrom || document.landAreaTo
                      ? `${document.landAreaFrom || 0} - ${document.landAreaTo || "∞"}`
                      : "غير محدد"}
                  </div>
                </div>

                <div className="space-y-1.5 p-3 bg-white border border-slate-100 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-400">
                    المدينة / القطاع
                  </span>
                  <div className="text-xs font-bold text-slate-800 mt-1">
                    {document.city || "الكل"} - {document.sector || "الكل"}
                  </div>
                </div>

                <div className="space-y-1.5 p-3 bg-white border border-slate-100 rounded-xl md:col-span-2">
                  <span className="text-[10px] font-bold text-slate-400">
                    الأحياء
                  </span>
                  <div className="flex flex-wrap gap-1.5 mt-1 max-h-20 overflow-y-auto custom-scrollbar-slim pr-1">
                    {districts.map((d) => (
                      <span
                        key={d}
                        className="px-2 py-1 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-md text-[10px] font-bold"
                      >
                        {d}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5 p-3 bg-white border border-slate-100 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-400">
                    عدد الأدوار
                  </span>
                  <div
                    className="text-xs font-bold text-slate-800 mt-1"
                    dir="ltr"
                  >
                    {document.floorsFrom || document.floorsTo
                      ? `${document.floorsFrom || 0} - ${document.floorsTo || "∞"}`
                      : "غير محدد"}
                  </div>
                </div>

                <div className="space-y-1.5 p-3 bg-white border border-slate-100 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-400">
                    عرض الشارع (متر)
                  </span>
                  <div
                    className="text-xs font-bold text-slate-800 mt-1"
                    dir="ltr"
                  >
                    {document.streetWidthFrom || document.streetWidthTo
                      ? `${document.streetWidthFrom || 0} - ${document.streetWidthTo || "∞"}`
                      : "غير محدد"}
                  </div>
                </div>

                <div className="space-y-1.5 p-3 bg-white border border-slate-100 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-400">
                    الصلاحية الزمنية
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-emerald-100 text-emerald-700">
                      ساري
                    </span>
                    <span className="text-[10px] text-slate-500 font-bold">
                      ينتهي: {expiryDate}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 🚀 قسم المرفقات المتعددة 🚀 */}
            <div className="space-y-4 pt-6 border-t border-slate-100">
              <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-blue-500" /> المرفقات
                والمستندات الأصلية
              </h4>
              {fileUrls.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {fileUrls.map((url, index) => {
                    const fileName = url.split("/").pop();
                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl hover:border-blue-300 transition-colors"
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="p-2 bg-blue-100 text-blue-600 rounded-lg shrink-0">
                            <FileText className="w-4 h-4" />
                          </div>
                          <span
                            className="text-xs font-bold text-slate-700 truncate"
                            dir="ltr"
                            title={fileName}
                          >
                            {fileName}
                          </span>
                        </div>
                        <button
                          onClick={() => window.open(getFullUrl(url), "_blank")}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-[10px] font-black rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-colors shrink-0"
                        >
                          <Eye className="w-3.5 h-3.5" /> معاينة
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6 bg-slate-50 border border-slate-200 border-dashed rounded-xl text-xs font-bold text-slate-400">
                  لا توجد مرفقات مرتبطة بهذا المرجع.
                </div>
              )}
            </div>

            {/* سجل التحديثات */}
            <div className="pt-4 border-t border-slate-100">
              <button
                onClick={() => setShowLogs(!showLogs)}
                className="w-full flex items-center justify-between p-4 hover:bg-slate-50 border border-slate-200 rounded-2xl transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-blue-100 transition-colors">
                    <History className="w-4 h-4 text-slate-500 group-hover:text-blue-600" />
                  </div>
                  <span className="text-xs font-black text-slate-700">
                    سجل التحديثات والأحداث
                  </span>
                </div>
                <div className="px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-bold text-slate-500 flex items-center gap-1">
                  {showLogs ? "إخفاء السجل" : "انقر للاستعراض"}
                </div>
              </button>
            </div>

            {showLogs && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 animate-in slide-in-from-top-2 max-h-[250px] overflow-y-auto custom-scrollbar-slim">
                {isLoadingLogs ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                  </div>
                ) : logs.length === 0 ? (
                  <div className="text-center text-xs text-slate-400 font-bold py-4">
                    لا توجد سجلات محفوظة حتى الآن
                  </div>
                ) : (
                  logs.map((log) => (
                    <div
                      key={log.id}
                      className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 text-[10px] font-bold bg-white p-3 rounded-xl border border-slate-100 shadow-sm"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 uppercase">
                          {log.userName?.substring(0, 2)}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-slate-800">{log.userName}</span>
                          <span className="text-slate-500">{log.action}</span>
                        </div>
                      </div>
                      <div
                        className="text-slate-400 font-mono shrink-0"
                        dir="ltr"
                      >
                        {new Date(log.createdAt).toLocaleString("en-GB")}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer (أصبح للمشاركة فقط بعد نقل عرض الملفات للأعلى) */}
        <div className="flex justify-end gap-3 p-4 border-t border-slate-100 bg-slate-50 shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-[11px] font-black hover:bg-slate-100 transition-all shadow-sm"
          >
            إغلاق النافذة
          </button>
          <button
            className="p-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all shadow-sm"
            title="مشاركة المرجع"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
