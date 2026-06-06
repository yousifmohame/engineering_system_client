import React, { useState } from "react";
import {
  Clock,
  Search,
  Plus,
  Eye,
  AlertCircle,
  UploadCloud,
  Activity,
  Send,
  Settings,
  FileText,
  ShieldCheck,
} from "lucide-react";

export default function HistoryTab({ logs = [] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [eventFilter, setEventFilter] = useState("all");

  const getLogStyle = (actionText = "") => {
    const action = String(actionText || "");

    if (action.includes("إنشاء")) {
      return {
        icon: Plus,
        type: "create",
        iconClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
        badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
        lineClass: "bg-emerald-400",
      };
    }

    if (action.includes("فتح")) {
      return {
        icon: Eye,
        type: "view",
        iconClass: "bg-cyan-50 text-cyan-800 border-cyan-200",
        badgeClass: "bg-cyan-50 text-cyan-800 border-cyan-200",
        lineClass: "bg-cyan-400",
      };
    }

    if (action.includes("فشل") || action.includes("خطأ")) {
      return {
        icon: AlertCircle,
        type: "error",
        iconClass: "bg-rose-50 text-rose-600 border-rose-200",
        badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
        lineClass: "bg-rose-500",
      };
    }

    if (action.includes("رفع") || action.includes("تنزيل")) {
      return {
        icon: UploadCloud,
        type: "file",
        iconClass: "bg-blue-50 text-blue-700 border-blue-200",
        badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
        lineClass: "bg-blue-400",
      };
    }

    if (action.includes("إرسال") || action.includes("مشاركة")) {
      return {
        icon: Send,
        type: "send",
        iconClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
        badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
        lineClass: "bg-emerald-400",
      };
    }

    if (action.includes("تغيير") || action.includes("تحديث")) {
      return {
        icon: Settings,
        type: "update",
        iconClass: "bg-[#f8efe0] text-[#c5983c] border-[#d8b46a]/35",
        badgeClass: "bg-[#f8efe0] text-[#9a6b16] border-[#d8b46a]/35",
        lineClass: "bg-[#c5983c]",
      };
    }

    return {
      icon: Activity,
      type: "other",
      iconClass: "bg-slate-100 text-slate-600 border-slate-200",
      badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
      lineClass: "bg-slate-400",
    };
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";

    return new Date(dateString).toLocaleString("ar-SA", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredLogs = logs.filter((log) => {
    const action = String(log.action || "");
    const target = String(log.target || "");
    const user = String(log.user || "");
    const meta = String(log.meta || "");

    const searchMatch =
      action.includes(searchTerm) ||
      target.includes(searchTerm) ||
      user.includes(searchTerm) ||
      meta.includes(searchTerm);

    const style = getLogStyle(action);

    const filterMatch =
      eventFilter === "all" ||
      (eventFilter === "create" &&
        (style.type === "create" || style.type === "update")) ||
      (eventFilter === "file" && style.type === "file") ||
      (eventFilter === "error" && style.type === "error") ||
      (eventFilter === "send" && style.type === "send");

    return searchMatch && filterMatch;
  });

  return (
    <div
      className="
        flex h-full flex-1 flex-col overflow-hidden
        bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white
        font-[Tajawal]
      "
      dir="rtl"
    >
      {/* Header */}
      <div
        className="
          relative shrink-0 overflow-hidden
          border-b border-[#d8b46a]/30
          bg-gradient-to-l from-[#06111d] via-[#123f59] to-[#0e7490]
          px-5 py-4 text-white
          shadow-[0_14px_34px_rgba(18,63,89,0.16)]
          md:px-6
        "
      >
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute right-[-70px] top-[-70px] h-44 w-44 rounded-full bg-[#e2bf74]/18 blur-3xl" />
          <div className="absolute left-[-70px] bottom-[-70px] h-44 w-44 rounded-full bg-emerald-400/14 blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div
              className="
                grid h-12 w-12 shrink-0 place-items-center
                rounded-2xl border border-[#e2bf74]/35
                bg-white/12 text-[#e2bf74]
                shadow-[0_14px_30px_rgba(0,0,0,0.20)]
              "
            >
              <Clock className="h-6 w-6" />
            </div>

            <div className="min-w-0">
              <h2 className="truncate text-lg font-black md:text-xl">
                السجل الشامل Audit Trail
              </h2>

              <p className="mt-1 truncate text-xs font-bold text-white/65">
                مراقبة توثيقية لجميع الحركات التي تمت على الروابط والملفات.
              </p>
            </div>
          </div>

          <div
            className="
              flex w-fit items-center gap-2 rounded-2xl
              border border-emerald-300/25 bg-emerald-400/15
              px-3 py-2 text-[11px] font-black text-emerald-100
            "
          >
            <ShieldCheck className="h-4 w-4" />
            سجل مراقبة النظام
          </div>
        </div>
      </div>

      {/* Filters */}
      <div
        className="
          shrink-0 border-b border-[#e8ddc8]
          bg-white/75 px-4 py-4 backdrop-blur-xl md:px-6
        "
      >
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-sm font-black text-[#123f59]">
              سجل العمليات
            </h3>

            <p className="mt-0.5 text-[11px] font-bold text-[#64748b]">
              {filteredLogs.length} نتيجة معروضة من أصل {logs.length}
            </p>
          </div>

          <div className="flex w-full flex-col gap-2 sm:flex-row md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#c5983c]" />

              <input
                type="text"
                placeholder="ابحث في السجل..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="
                  h-10 w-full rounded-2xl border border-[#d8b46a]/30
                  bg-white pr-10 pl-3 text-xs font-bold text-[#123f59]
                  outline-none transition-all
                  placeholder:text-slate-400
                  focus:border-[#c5983c]/70
                  focus:ring-4 focus:ring-[#c5983c]/10
                "
              />
            </div>

            <select
              value={eventFilter}
              onChange={(e) => setEventFilter(e.target.value)}
              className="
                h-10 rounded-2xl border border-[#d8b46a]/30
                bg-white px-3 text-xs font-black text-[#123f59]
                outline-none transition-all
                focus:border-[#c5983c]/70
                focus:ring-4 focus:ring-[#c5983c]/10
              "
            >
              <option value="all">كل الأحداث</option>
              <option value="create">إنشاء / تعديل</option>
              <option value="file">تحميل / رفع</option>
              <option value="send">إرسال / مشاركة</option>
              <option value="error">أخطاء / محاولات</option>
            </select>
          </div>
        </div>
      </div>

      {/* Logs */}
      <div className="min-h-0 flex-1 overflow-y-auto p-4 custom-scrollbar md:p-6">
        <div className="mx-auto max-w-5xl space-y-3">
          {filteredLogs.length === 0 ? (
            <div
              className="
                flex flex-col items-center justify-center
                rounded-[28px] border border-dashed border-[#d8b46a]/40
                bg-white/75 px-5 py-16 text-center
                shadow-[0_18px_45px_rgba(18,63,89,0.08)]
              "
            >
              <div
                className="
                  mb-4 grid h-16 w-16 place-items-center
                  rounded-[24px] bg-gradient-to-br from-[#123f59] to-[#0e7490]
                  text-[#e2bf74]
                  shadow-[0_16px_34px_rgba(18,63,89,0.22)]
                "
              >
                <FileText className="h-8 w-8" />
              </div>

              <p className="text-sm font-black text-[#123f59]">
                لا توجد سجلات لعرضها
              </p>

              <p className="mt-1 text-xs font-bold text-[#64748b]">
                جرّب تغيير كلمات البحث أو اختيار فلتر آخر.
              </p>
            </div>
          ) : (
            filteredLogs.map((log) => {
              const style = getLogStyle(log.action);
              const Icon = style.icon;

              return (
                <div
                  key={log.id}
                  className="
                    group relative overflow-hidden rounded-[24px]
                    border border-[#d8b46a]/25 bg-white/90
                    p-4 shadow-[0_14px_34px_rgba(18,63,89,0.08)]
                    backdrop-blur-xl transition-all
                    hover:-translate-y-[1px]
                    hover:border-[#c5983c]/45
                    hover:shadow-[0_20px_45px_rgba(18,63,89,0.12)]
                  "
                >
                  <div
                    className={`absolute right-0 top-4 bottom-4 w-1.5 rounded-l-full ${style.lineClass}`}
                  />

                  <div className="flex gap-4 pr-2">
                    <div
                      className={`
                        grid h-11 w-11 shrink-0 place-items-center
                        rounded-2xl border shadow-sm
                        ${style.iconClass}
                      `}
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-black text-[#123f59]">
                            {log.action}
                          </p>

                          <p className="mt-1 truncate text-xs font-bold text-[#64748b]">
                            {log.target}
                          </p>
                        </div>

                        <span
                          className="
                            inline-flex w-fit shrink-0 items-center gap-1.5
                            rounded-xl border border-[#d8b46a]/25 bg-[#fbf8f1]
                            px-2.5 py-1 text-[10px] font-black text-[#9a6b16]
                          "
                        >
                          <Clock className="h-3.5 w-3.5" />
                          {formatDate(log.createdAt)}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold text-[#64748b]">
                        <span
                          className="
                            rounded-xl border border-[#e8ddc8]
                            bg-[#fbf8f1] px-2.5 py-1
                          "
                        >
                          <span className="text-[#94a3b8]">المنفذ:</span>{" "}
                          <span className="text-[#123f59]">{log.user}</span>
                        </span>

                        {log.meta && (
                          <span
                            className={`
                              rounded-xl border px-2.5 py-1
                              ${style.badgeClass}
                            `}
                          >
                            {log.meta}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}