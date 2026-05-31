import React, { useState, useEffect, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "../../../../api/axios";
import { useAuth } from "../../../../context/AuthContext";
import {
  X,
  Trash2,
  BookOpen,
  Brain,
  Sparkles,
  MessageSquare,
  Filter,
  History,
  Share2,
  Loader2,
  AlertTriangle,
  Wind,
  Activity,
  CheckCircle2,
  Paperclip,
  FileText,
  Eye,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const getFullUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  let fixedUrl = url;
  if (url.startsWith("/uploads/")) fixedUrl = `/api${url}`;
  const baseUrl = "https://details-worksystem1.com";
  return `${baseUrl}${fixedUrl}`;
};

export default function ReferenceDetailsModal({ isOpen, onClose, document }) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [manualNotes, setManualNotes] = useState("");
  const [showLogs, setShowLogs] = useState(false);

  useEffect(() => {
    if (document) setManualNotes(document.manualNotes || "");
  }, [document]);

  const { data: logs = [], isLoading: isLoadingLogs } = useQuery({
    queryKey: ["reference-logs", document?.id],
    queryFn: async () =>
      (await api.get(`/references/${document.id}/logs`)).data.data,
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
      toast.success("تم التحديث بنجاح");
      queryClient.invalidateQueries(["reference-documents"]);
    },
  });

  const reanalyzeMutation = useMutation({
    mutationFn: async (type) =>
      api.post(`/references/${document.id}/reanalyze`, {
        type,
        userName: user?.name,
        userEmail: user?.email,
      }),
    onSuccess: () => toast.success("بدأ التحليل الذكي في الخلفية..."),
  });

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
      console.error(e);
    }
    return { summary, rules, audience };
  }, [document]);

  if (!isOpen || !document) return null;

  const fileUrls = document.fileUrl
    ? document.fileUrl.split(",").filter((url) => url.trim() !== "")
    : [];

  return (
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center bg-[#0f3d50]/60 backdrop-blur-sm p-4 md:p-6 animate-in fade-in"
      dir="rtl"
    >
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col w-full max-w-[1400px] h-[92vh] animate-in zoom-in-95">
        {/* ─── Header ─── */}
        <div className="bg-[#0f3d50] px-6 py-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-500 rounded-xl shadow-lg">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-black truncate max-w-2xl">
                {document.title}
              </h3>
              <div className="flex gap-4 mt-1 opacity-80">
                <span className="text-xs font-bold">
                  الجهة المصدرة: {document.source}
                </span>
                <span className="text-xs font-bold">
                  تاريخ الإصدار:{" "}
                  {document.issueDate
                    ? new Date(document.issueDate).toLocaleDateString("en-GB")
                    : "غير محدد"}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => reanalyzeMutation.mutate("full")}
              className="flex items-center gap-2 px-4 py-2 bg-[#0f3d50] hover:bg-[#12495f] text-xs font-black rounded-xl transition-all ml-2 shadow-md"
            >
              <Brain size={16} /> إعادة التحليل الذكي
            </button>
            <button
              onClick={() => {
                if (window.confirm("هل أنت متأكد من الحذف النهائي؟"))
                  api
                    .delete(`/references/${document.id}`)
                    .then(() => onClose());
              }}
              className="p-2.5 hover:bg-rose-500/20 rounded-xl text-slate-400 hover:text-rose-400 transition-colors"
              title="حذف المرجع"
            >
              <Trash2 size={20} />
            </button>
            <button
              onClick={onClose}
              className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors"
              title="إغلاق النافذة"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* ─── Main Body (Two Columns Layout) ─── */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12 gap-0 bg-slate-50">
          {/* 👈 Left Column: Analysis & Summary (Scrollable) */}
          <div className="col-span-12 md:col-span-7 lg:col-span-8 overflow-y-auto p-6 space-y-6 custom-scrollbar border-l border-slate-200 bg-white">
            {/* AI Summary Box */}
            <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-5 relative group shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h5 className="text-base font-black text-emerald-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-600" /> الملخص الذكي
                  (AI)
                </h5>
                <span className="text-xs font-black bg-emerald-100 text-emerald-700 px-3 py-1 rounded-lg uppercase tracking-wider">
                  Verified Analysis
                </span>
              </div>
              <p className="text-sm md:text-[15px] font-bold text-emerald-800 leading-loose whitespace-pre-wrap">
                {parsedAI.summary || "جاري جلب الملخص..."}
              </p>
            </div>

            {/* Key Rules (Dense Grid) */}
            <div className="bg-amber-50/30 border border-amber-100 rounded-2xl p-5 shadow-sm">
              <h5 className="text-base font-black text-amber-900 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" /> أهم
                الاشتراطات والقواعد الإلزامية
              </h5>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {document.keyRules?.map((rule, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 bg-white/80 p-3.5 rounded-xl border border-amber-100/50 hover:shadow-md transition-shadow"
                  >
                    <span className="w-6 h-6 rounded-lg bg-amber-200 text-amber-800 flex items-center justify-center text-xs font-black shrink-0 shadow-sm">
                      {idx + 1}
                    </span>
                    <p className="text-xs md:text-sm font-bold text-slate-700 leading-relaxed">
                      {rule}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Protocols & Technical Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-cyan-50/50 border border-cyan-100 rounded-2xl p-5 shadow-sm">
                <h5 className="text-sm font-black text-cyan-900 mb-2 flex items-center gap-2">
                  <Wind size={18} className="text-cyan-600" /> بروتوكول الرياح
                  والطقس
                </h5>
                <p className="text-xs md:text-sm font-bold text-cyan-800 leading-relaxed">
                  {document.windProtocol ||
                    "لا يوجد بروتوكول محدد في هذا المرجع"}
                </p>
              </div>
              <div className="bg-[#f4f7f8]/50 border border-[#e8dcc8] rounded-2xl p-5 shadow-sm">
                <h5 className="text-sm font-black text-[#123B5D] mb-2 flex items-center gap-2">
                  <Activity size={18} className="text-[#123B5D]" /> الرصد
                  والامتثال البيئي
                </h5>
                <p className="text-xs md:text-sm font-bold text-[#123B5D] leading-relaxed">
                  {document.monitoringProtocol ||
                    "لا يوجد بروتوكول محدد في هذا المرجع"}
                </p>
              </div>
            </div>

            {/* Original Attachments */}
            <div className="pt-4 border-t border-slate-100">
              <h5 className="text-sm font-black text-slate-600 mb-4 flex items-center gap-2">
                <Paperclip size={18} /> المرفقات الأصلية والملفات (
                {fileUrls.length})
              </h5>
              <div className="flex flex-wrap gap-3">
                {fileUrls.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => window.open(getFullUrl(url), "_blank")}
                    className="flex items-center gap-3 px-4 py-2.5 bg-slate-100 hover:bg-[#f4f7f8] border border-slate-200 hover:border-[#e8dcc8] rounded-xl transition-all group shadow-sm"
                  >
                    <FileText
                      size={18}
                      className="text-slate-400 group-hover:text-[#0f3d50]"
                    />
                    <span
                      className="text-xs md:text-sm font-black text-slate-700 truncate max-w-[200px]"
                      dir="ltr"
                    >
                      {url.split("/").pop()}
                    </span>
                    <Eye
                      size={16}
                      className="text-slate-300 group-hover:text-[#0f3d50] ml-2"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 👉 Right Column: Metadata & Management (Scrollable) */}
          <div className="col-span-12 md:col-span-5 lg:col-span-4 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-50/50">
            {/* Applicability Scope */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <h5 className="text-sm md:text-base font-black text-slate-900 mb-5 flex items-center gap-2">
                <Filter className="w-5 h-5 text-emerald-500" /> نطاق الانطباق
              </h5>
              <div className="grid grid-cols-2 gap-y-5 gap-x-4">
                {[
                  { label: "نوع المعاملة المستهدفة", val: document.txType },
                  {
                    label: "المدينة / القطاع",
                    val: `${document.city || "الكل"} / ${document.sector || "الكل"}`,
                  },
                  {
                    label: "مساحة الأرض المشمولة",
                    val: document.landAreaFrom
                      ? `${document.landAreaFrom} إلى ${document.landAreaTo} م²`
                      : "الكل",
                  },
                  {
                    label: "عدد الأدوار",
                    val: document.floorsFrom
                      ? `${document.floorsFrom} إلى ${document.floorsTo}`
                      : "الكل",
                  },
                  {
                    label: "عرض الشارع",
                    val: document.streetWidthFrom
                      ? `${document.streetWidthFrom} إلى ${document.streetWidthTo} م`
                      : "الكل",
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col border-r-4 border-slate-100 pr-3"
                  >
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      {item.label}
                    </span>
                    <span
                      className="text-sm font-black text-slate-700 truncate"
                      title={item.val || "غير محدد"}
                    >
                      {item.val || "غير محدد"}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-5 pt-5 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-500 block mb-2">
                  الأحياء المشمولة بالنطاق:
                </span>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto pr-1 custom-scrollbar-slim">
                  {(document.districts?.length
                    ? document.districts
                    : ["مطبق على جميع الأحياء"]
                  ).map((d) => (
                    <span
                      key={d}
                      className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold border border-slate-200"
                    >
                      {d}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Management Notes (Manual) */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <h5 className="text-sm md:text-base font-black text-slate-900 mb-3 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#0f3d50]" /> توجيهات
                وشروحات الإدارة
              </h5>
              <textarea
                value={manualNotes}
                onChange={(e) => setManualNotes(e.target.value)}
                placeholder="أدخل توجيهات فنية أو شروحات إضافية لفريق العمل..."
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-[#d7b96d] outline-none min-h-[120px] resize-none transition-all"
              />
              <div className="flex justify-end mt-3">
                <button
                  onClick={() => updateNotesMutation.mutate(manualNotes)}
                  disabled={updateNotesMutation.isPending}
                  className="px-5 py-2.5 bg-[#0f3d50] text-white rounded-xl text-xs md:text-sm font-black hover:bg-[#12495f] transition-all flex items-center gap-2 shadow-md"
                >
                  {updateNotesMutation.isPending ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <CheckCircle2 size={16} />
                  )}
                  حفظ الشروحات
                </button>
              </div>
            </div>

            {/* Audit Logs */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <button
                onClick={() => setShowLogs(!showLogs)}
                className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <History className="w-5 h-5 text-slate-400" />
                  <span className="text-sm font-black text-slate-700">
                    سجل أحداث المرجع
                  </span>
                </div>
                {showLogs ? (
                  <ChevronUp size={18} className="text-slate-400" />
                ) : (
                  <ChevronDown size={18} className="text-slate-400" />
                )}
              </button>

              {showLogs && (
                <div className="p-3 bg-slate-50 space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                  {isLoadingLogs ? (
                    <Loader2
                      size={20}
                      className="animate-spin mx-auto my-4 text-slate-400"
                    />
                  ) : logs.length === 0 ? (
                    <p className="text-xs text-center text-slate-500 py-4 font-bold">
                      لا توجد أحداث مسجلة لهذا المرجع
                    </p>
                  ) : (
                    logs.map((log) => (
                      <div
                        key={log.id}
                        className="text-xs font-bold bg-white p-2.5 rounded-xl border border-slate-200 flex justify-between items-center gap-3 shadow-sm"
                      >
                        <span
                          className="text-slate-800 truncate"
                          title={log.action}
                        >
                          {log.action}
                        </span>
                        <span className="text-slate-400 font-mono shrink-0 text-[10px] bg-slate-50 px-2 py-1 rounded-md">
                          {new Date(log.createdAt).toLocaleDateString("en-GB")}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ─── Footer ─── */}
        <div className="p-4 px-6 border-t border-slate-200 bg-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <span
              className={`px-4 py-1.5 rounded-xl text-xs font-black border shadow-sm ${
                document.analysisStatus === "محلل"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-[#f4f7f8] text-[#123B5D] border-[#e8dcc8]"
              }`}
            >
              حالة التحليل: {document.analysisStatus}
            </span>
            <span className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-xl text-xs font-black border border-slate-200 shadow-sm">
              رقم السجل: {document.id.slice(-8).toUpperCase()}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2.5 bg-slate-50 text-slate-600 rounded-xl hover:bg-[#f4f7f8] hover:text-[#123B5D] transition-all border border-slate-200 shadow-sm">
              <Share2 size={18} />
            </button>
            <button
              onClick={onClose}
              className="px-8 py-2.5 bg-[#0f3d50] text-white rounded-xl text-sm font-black hover:bg-[#12495f] transition-all shadow-md"
            >
              إغلاق النافذة
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
