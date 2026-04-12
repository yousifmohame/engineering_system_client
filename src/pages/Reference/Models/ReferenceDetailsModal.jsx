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
      toast.success("تم التحديث");
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
    onSuccess: () => toast.success("بدأ التحليل الذكي..."),
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
      className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/40 backdrop-blur-[2px] p-2 md:p-4 animate-in fade-in"
      dir="rtl"
    >
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col w-full max-w-6xl max-h-[95vh] animate-in zoom-in-95">
        {/* ─── Header (Compact) ─── */}
        <div className="bg-slate-900 px-4 py-3 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500 rounded-lg shadow-lg">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-black truncate max-w-md">
                {document.title}
              </h3>
              <div className="flex gap-3 mt-0.5 opacity-70">
                <span className="text-[9px] font-bold">
                  المصدر: {document.source}
                </span>
                <span className="text-[9px] font-bold">
                  الإصدار:{" "}
                  {document.issueDate
                    ? new Date(document.issueDate).toLocaleDateString("en-GB")
                    : "---"}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => reanalyzeMutation.mutate("full")}
              className="flex items-center gap-1 px-2 py-1 bg-purple-600 hover:bg-purple-700 text-[9px] font-black rounded-lg transition-all ml-2"
            >
              <Brain size={12} /> إعادة التحليل
            </button>
            <button
              onClick={() => {
                if (window.confirm("حذف نهائي؟"))
                  api
                    .delete(`/references/${document.id}`)
                    .then(() => onClose());
              }}
              className="p-1.5 hover:bg-rose-500/20 rounded-lg text-slate-400 hover:text-rose-400 transition-colors"
            >
              <Trash2 size={14} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-white/10 rounded-lg text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* ─── Main Body (Two Columns Layout) ─── */}
        <div className="flex-1 overflow-hidden grid grid-cols-12 gap-0 bg-slate-50">
          {/* 👈 Left Column: Analysis & Summary (Scrollable) */}
          <div className="col-span-12 lg:col-span-7 overflow-y-auto p-3 space-y-3 custom-scrollbar-slim border-l border-slate-200 bg-white">
            {/* AI Summary Box */}
            <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-3 relative group">
              <div className="flex items-center justify-between mb-2">
                <h5 className="text-[11px] font-black text-emerald-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> الملخص
                  الذكي (AI)
                </h5>
                <span className="text-[8px] font-black bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded uppercase">
                  Verified Analysis
                </span>
              </div>
              <p className="text-[10.5px] font-bold text-emerald-800 leading-relaxed">
                {parsedAI.summary || "جاري جلب الملخص..."}
              </p>
            </div>

            {/* Key Rules (Dense Grid) */}
            <div className="bg-amber-50/30 border border-amber-100 rounded-xl p-3">
              <h5 className="text-[11px] font-black text-amber-900 mb-3 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> أهم
                الاشتراطات والقواعد الإلزامية
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {document.keyRules?.map((rule, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 bg-white/60 p-2 rounded-lg border border-amber-100/50"
                  >
                    <span className="w-4 h-4 rounded bg-amber-200 text-amber-800 flex items-center justify-center text-[9px] font-black shrink-0">
                      {idx + 1}
                    </span>
                    <p className="text-[9.5px] font-bold text-slate-700 leading-tight">
                      {rule}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Protocols & Technical Details */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-cyan-50/50 border border-cyan-100 rounded-xl p-3">
                <h5 className="text-[10px] font-black text-cyan-900 mb-1 flex items-center gap-1">
                  <Wind size={12} /> الرياح والطقس
                </h5>
                <p className="text-[9px] font-bold text-cyan-800">
                  {document.windProtocol || "لا يوجد بروتوكول محدد"}
                </p>
              </div>
              <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3">
                <h5 className="text-[10px] font-black text-blue-900 mb-1 flex items-center gap-1">
                  <Activity size={12} /> الرصد والامتثال
                </h5>
                <p className="text-[9px] font-bold text-blue-800">
                  {document.monitoringProtocol || "لا يوجد بروتوكول محدد"}
                </p>
              </div>
            </div>

            {/* Original Attachments (Horizontal Scroll/Grid) */}
            <div className="pt-2 border-t border-slate-100">
              <h5 className="text-[10px] font-black text-slate-500 mb-2 flex items-center gap-1.5">
                <Paperclip size={12} /> المرفقات الأصلية ({fileUrls.length})
              </h5>
              <div className="flex flex-wrap gap-2">
                {fileUrls.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => window.open(getFullUrl(url), "_blank")}
                    className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-blue-50 border border-slate-200 rounded-lg transition-all group"
                  >
                    <FileText
                      size={12}
                      className="text-slate-400 group-hover:text-blue-500"
                    />
                    <span
                      className="text-[9px] font-black text-slate-600 truncate max-w-[120px]"
                      dir="ltr"
                    >
                      {url.split("/").pop()}
                    </span>
                    <Eye size={10} className="text-slate-300" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 👉 Right Column: Metadata & Management (Scrollable) */}
          <div className="col-span-12 lg:col-span-5 overflow-y-auto p-3 space-y-4 custom-scrollbar-slim bg-slate-50/50">
            {/* Applicability Scope (Ultra Dense Grid) */}
            <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
              <h5 className="text-[11px] font-black text-slate-900 mb-3 flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-emerald-500" /> نطاق
                الانطباق
              </h5>
              <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                {[
                  { label: "نوع المعاملة", val: document.txType },
                  {
                    label: "المدينة/القطاع",
                    val: `${document.city || "الكل"} / ${document.sector || "الكل"}`,
                  },
                  {
                    label: "مساحة الأرض",
                    val: document.landAreaFrom
                      ? `${document.landAreaFrom}-${document.landAreaTo} م²`
                      : "الكل",
                  },
                  {
                    label: "عدد الأدوار",
                    val: document.floorsFrom
                      ? `${document.floorsFrom}-${document.floorsTo}`
                      : "الكل",
                  },
                  {
                    label: "عرض الشارع",
                    val: document.streetWidthFrom
                      ? `${document.streetWidthFrom}-${document.streetWidthTo} م`
                      : "الكل",
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col border-r-2 border-slate-100 pr-2"
                  >
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">
                      {item.label}
                    </span>
                    <span className="text-[10px] font-black text-slate-700 truncate">
                      {item.val || "غير محدد"}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-3 pt-3 border-t border-slate-50">
                <span className="text-[8px] font-bold text-slate-400 block mb-1">
                  الأحياء المستهدفة
                </span>
                <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto pr-1">
                  {(document.districts?.length
                    ? document.districts
                    : ["الكل"]
                  ).map((d) => (
                    <span
                      key={d}
                      className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[8px] font-bold border border-slate-200"
                    >
                      {d}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Management Notes (Manual) */}
            <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
              <h5 className="text-[11px] font-black text-slate-900 mb-2 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-blue-500" /> توجيهات
                الإدارة
              </h5>
              <textarea
                value={manualNotes}
                onChange={(e) => setManualNotes(e.target.value)}
                placeholder="أدخل توجيهات فنية للفريق..."
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-bold focus:ring-1 focus:ring-blue-500 outline-none min-h-[60px] resize-none"
              />
              <div className="flex justify-end mt-2">
                <button
                  onClick={() => updateNotesMutation.mutate(manualNotes)}
                  disabled={updateNotesMutation.isPending}
                  className="px-3 py-1 bg-slate-900 text-white rounded-lg text-[9px] font-black hover:bg-black transition-all flex items-center gap-1.5"
                >
                  {updateNotesMutation.isPending ? (
                    <Loader2 size={10} className="animate-spin" />
                  ) : (
                    <CheckCircle2 size={10} />
                  )}
                  حفظ الشرح
                </button>
              </div>
            </div>

            {/* Audit Logs (Condensed) */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <button
                onClick={() => setShowLogs(!showLogs)}
                className="w-full flex items-center justify-between p-3 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <History className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-[10px] font-black text-slate-700">
                    سجل الأحداث
                  </span>
                </div>
                {showLogs ? (
                  <ChevronUp size={14} className="text-slate-400" />
                ) : (
                  <ChevronDown size={14} className="text-slate-400" />
                )}
              </button>

              {showLogs && (
                <div className="p-2 bg-slate-50 space-y-1 max-h-32 overflow-y-auto custom-scrollbar-slim">
                  {isLoadingLogs ? (
                    <Loader2 size={12} className="animate-spin mx-auto my-2" />
                  ) : logs.length === 0 ? (
                    <p className="text-[9px] text-center text-slate-400 py-2">
                      لا يوجد سجل
                    </p>
                  ) : (
                    logs.map((log) => (
                      <div
                        key={log.id}
                        className="text-[8.5px] font-bold bg-white p-1.5 rounded border border-slate-100 flex justify-between gap-2"
                      >
                        <span className="text-slate-800 truncate">
                          {log.action}
                        </span>
                        <span className="text-slate-400 font-mono shrink-0">
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

        {/* ─── Footer (Static) ─── */}
        <div className="p-3 border-t border-slate-100 bg-white flex justify-between items-center shrink-0">
          <div className="flex gap-2">
            <span
              className={`px-2 py-0.5 rounded-full text-[8px] font-black border ${document.analysisStatus === "محلل" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-purple-50 text-purple-600 border-purple-100"}`}
            >
              التحليل: {document.analysisStatus}
            </span>
            <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full text-[8px] font-black border border-slate-200">
              ID: {document.id.slice(-6)}
            </span>
          </div>
          <div className="flex gap-2">
            <button className="p-1.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-all border border-slate-200">
              <Share2 size={14} />
            </button>
            <button
              onClick={onClose}
              className="px-5 py-1.5 bg-slate-900 text-white rounded-lg text-[10px] font-black hover:bg-black transition-all"
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
