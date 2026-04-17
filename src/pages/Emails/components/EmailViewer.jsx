import React from "react";
import {
  ArrowRight,
  Archive,
  Trash2,
  CircleDot,
  Reply,
  ReplyAll,
  Forward,
  Bot,
  Sparkles,
  CheckCircle,
  RefreshCw,
  FileText,
  Building2,
  Clock,
  CheckCircle2,
  Paperclip,
  Download,
  User
} from "lucide-react";

export default function EmailViewer({
  selectedMessage,
  setSelectedMessage,
  updateMessageInDB,
  handleCompose,
  analyzeMutation,
}) {
  // دالة مساعدة لعرض المربع
  const InfoCard = ({
    label,
    value,
    icon: Icon,
    colorClass = "text-emerald-600",
  }) => {
    if (!value) return null;
    return (
      <div className="bg-white rounded-xl p-4 border border-emerald-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-1 h-full bg-emerald-500 opacity-50 group-hover:opacity-100 transition-opacity"></div>
        <div className="flex items-center justify-between mb-2">
          <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
            {label}
          </div>
          {Icon && <Icon className={`w-4 h-4 ${colorClass}`} />}
        </div>
        <div className="font-black text-gray-900 text-sm">{value}</div>
      </div>
    );
  };

  return (
    <div className="absolute inset-0 z-20 flex flex-col bg-white animate-in slide-in-from-right-4 duration-300">
      {/* HEADER */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100 bg-white shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSelectedMessage(null)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <ArrowRight className="w-4 h-4" /> العودة
          </button>
          <div className="w-px h-5 bg-gray-200"></div>
          <button
            onClick={() =>
              updateMessageInDB(selectedMessage, { isArchived: true }).then(
                () => setSelectedMessage(null),
              )
            }
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
          >
            <Archive className="w-4 h-4" />
          </button>
          <button
            onClick={() =>
              updateMessageInDB(selectedMessage, { isDeleted: true }).then(() =>
                setSelectedMessage(null),
              )
            }
            className="p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-lg"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              updateMessageInDB(selectedMessage, { isRead: false });
              setSelectedMessage(null);
            }}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
          >
            <CircleDot className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleCompose("reply", selectedMessage)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-gray-600 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors"
          >
            <Reply className="w-3.5 h-3.5" /> رد
          </button>
          <button
            onClick={() => handleCompose("replyall", selectedMessage)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-gray-600 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors"
          >
            <ReplyAll className="w-3.5 h-3.5" /> للجميع
          </button>
          <button
            onClick={() => handleCompose("forward", selectedMessage)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-gray-600 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors"
          >
            <Forward className="w-3.5 h-3.5" /> تحويل
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 max-w-5xl mx-auto w-full custom-scrollbar-slim">
        {/* MESSAGE INFO */}
        <div className="flex items-start justify-between mb-8">
          <h1 className="text-2xl font-black text-gray-900 leading-tight">
            {selectedMessage.subject || "(بدون موضوع)"}
          </h1>
        </div>

        <div className="flex items-start gap-4 mb-8 border-b border-gray-100 pb-6">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-lg border border-blue-200 shadow-sm shrink-0">
            {selectedMessage.from?.charAt(0).toUpperCase() || "?"}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-2">
                <span className="font-bold text-gray-900 text-sm">
                  {selectedMessage.from?.split("<")[0].replace(/"/g, "")}
                </span>
                <span className="text-xs text-gray-500 font-mono" dir="ltr">
                  {selectedMessage.from?.match(/<([^>]+)>/)?.[1] ||
                    selectedMessage.from}
                </span>
              </div>
              <span className="text-xs text-gray-500 font-medium">
                {new Date(selectedMessage.date).toLocaleString("ar-SA", {
                  dateStyle: "full",
                  timeStyle: "short",
                })}
              </span>
            </div>
            <div className="text-xs text-gray-400 mt-1">
              إلى: {selectedMessage.to || "أنا"}
            </div>
          </div>
        </div>

        {/* MESSAGE BODY */}
        <div className="prose max-w-none text-gray-800 text-[15px] leading-relaxed mb-6">
          {selectedMessage.html ? (
            <div dangerouslySetInnerHTML={{ __html: selectedMessage.html }} />
          ) : (
            <div className="whitespace-pre-wrap">
              {selectedMessage.body || selectedMessage.text}
            </div>
          )}

          {/* 💡 عرض التوقيع والفوتر (في حالة المسودات أو الرسائل التي لم تُدمج بعد كـ HTML) */}
          {(selectedMessage.signature || selectedMessage.footerText) &&
            !selectedMessage.html && (
              <div className="mt-8 pt-6 border-t border-gray-100">
                {selectedMessage.signature && (
                  <div
                    className="mb-4"
                    dangerouslySetInnerHTML={{
                      __html: selectedMessage.signature,
                    }}
                  />
                )}
                {selectedMessage.footerText && (
                  <div
                    style={{
                      color: selectedMessage.footerColor || "#64748b",
                      fontSize: selectedMessage.footerSize || "11px",
                      textAlign: "center",
                      marginTop: "20px",
                    }}
                  >
                    {selectedMessage.footerText}
                  </div>
                )}
              </div>
            )}
        </div>

        {/* 💡 عرض المرفقات */}
        {selectedMessage.attachments &&
          selectedMessage.attachments.length > 0 && (
            <div className="mb-10 px-6 py-4 bg-gray-50 rounded-xl border border-gray-200">
              <h4 className="text-xs font-bold text-gray-500 mb-3 flex items-center gap-2">
                <Paperclip className="w-4 h-4" /> المرفقات (
                {selectedMessage.attachments.length})
              </h4>
              <div className="flex flex-wrap gap-3">
                {selectedMessage.attachments.map((att, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-3 bg-white border border-gray-200 px-4 py-2 rounded-lg shadow-sm w-fit min-w-[200px]"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                      <span className="text-xs font-bold text-gray-700 truncate max-w-[150px]">
                        {att.filename || att.name || "مرفق"}
                      </span>
                    </div>
                    {(att.path || att.url) && (
                      <a
                        href={att.path || att.url}
                        download={att.filename || att.name || "attachment"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-blue-600 transition-colors"
                        title="تحميل المرفق"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        {/* AI ANALYSIS SECTION */}
        <div className="mt-auto border-t border-gray-100 pt-8">
          {!selectedMessage.isAnalyzed ? (
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl border border-purple-100 p-6 text-center">
              <Bot className="w-10 h-10 text-purple-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-purple-900 mb-2">
                هل تريد استخراج البيانات من هذه الرسالة؟
              </h3>
              <p className="text-xs text-gray-600 mb-4 max-w-md mx-auto">
                سيقوم الذكاء الاصطناعي بقراءة النص واستخراج التفاصيل كالأرقام
                والملاحظات تلقائياً.
              </p>
              <button
                onClick={() => analyzeMutation.mutate(selectedMessage)}
                disabled={analyzeMutation.isPending}
                className="px-6 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-bold hover:bg-purple-700 transition-all disabled:opacity-50 flex items-center gap-2 mx-auto shadow-md"
              >
                {analyzeMutation.isPending ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                بدء التحليل الذكي
              </button>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200 p-8 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-full h-1.5 bg-gradient-to-r from-emerald-400 to-teal-400"></div>

              <div className="flex items-center justify-between mb-6 border-b border-emerald-100 pb-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-6 h-6 text-emerald-600" />
                  <h3 className="font-black text-lg text-emerald-900">
                    ملخص التحليل الذكي للرسالة
                  </h3>
                </div>
                {selectedMessage.linkedTxId && (
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5" /> مربوط بمعاملة في
                    النظام
                  </div>
                )}
              </div>

              {/* Grid 1: Basic Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <InfoCard
                  label="رقم الطلب"
                  value={selectedMessage.reqNumber}
                  icon={FileText}
                />
                <InfoCard label="سنة الطلب" value={selectedMessage.reqYear} />
                <InfoCard
                  label="رقم الخدمة"
                  value={selectedMessage.serviceNumber}
                  icon={FileText}
                  colorClass="text-teal-600"
                />
                <InfoCard
                  label="سنة الخدمة"
                  value={selectedMessage.serviceYear}
                />
              </div>

              {/* Grid 2: Owner & Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <InfoCard
                  label="اسم المالك"
                  value={selectedMessage.ownerName}
                  icon={User}
                  colorClass="text-blue-600"
                />
                <InfoCard
                  label="نوع الخدمة"
                  value={selectedMessage.serviceType}
                />
              </div>

              {/* Grid 3: Location & Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <InfoCard
                  label="اسم الجهة المصدرة"
                  value={selectedMessage.entityName}
                  icon={Building2}
                />
                <InfoCard label="القطاع" value={selectedMessage.sectorName} />
                <InfoCard
                  label="وقت الإطلاع"
                  value={selectedMessage.viewTime}
                  icon={Clock}
                  colorClass="text-amber-500"
                />
              </div>

              {/* Full Width: Notes/Reply */}
              {selectedMessage.replyText && (
                <div className="bg-white rounded-xl p-5 border border-emerald-100 shadow-sm mt-4">
                  <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-500" /> الإفادة /
                    الملاحظات
                  </div>
                  <div className="font-semibold text-gray-800 text-sm leading-relaxed bg-emerald-50/50 p-4 rounded-lg border border-emerald-50">
                    {selectedMessage.replyText}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
