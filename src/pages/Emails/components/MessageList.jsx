import React from "react";
import { Star, Archive, Trash2, Mail, Loader2 } from "lucide-react";
import { LoadingSkeleton, EmptyState } from "./SharedComponents";

export default function MessageList({
  sortedMessages,
  isLoading,
  isFetchingMore,
  searchQuery,
  currentView,
  listRef,
  handleScroll,
  handleSelectMessage,
  updateMessageInDB,
  handleDelete,
  formatDate,
}) {
  const cleanText = (text = "") => {
    return text.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
  };

  return (
    <div
      ref={listRef}
      className="relative min-w-0 max-w-full flex-1 overflow-y-auto overflow-x-hidden px-4 py-4 custom-scrollbar-slim"
      onScroll={handleScroll}
      dir="rtl"
    >
      {/* خلفية ناعمة داخل منطقة الرسائل */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-white/35 via-[#f8efe0]/20 to-white/25" />
        <div className="absolute left-[-90px] top-20 h-56 w-56 rounded-full bg-[#c5983c]/10 blur-3xl" />
        <div className="absolute right-[-90px] bottom-20 h-56 w-56 rounded-full bg-[#123f59]/10 blur-3xl" />
      </div>

      <div className="relative z-10 min-w-0 max-w-full overflow-x-hidden">
        {isLoading ? (
          <div className="max-w-full overflow-hidden rounded-[26px] border border-white/60 bg-white/45 p-4 shadow-[0_16px_40px_rgba(18,63,89,0.08)] backdrop-blur-xl">
            <LoadingSkeleton />
          </div>
        ) : sortedMessages.length === 0 ? (
          <div className="flex min-h-[420px] max-w-full items-center justify-center overflow-hidden rounded-[28px] border border-white/65 bg-white/50 shadow-[0_18px_45px_rgba(18,63,89,0.08)] backdrop-blur-xl">
            <EmptyState
              icon={Mail}
              title="صندوق الوارد فارغ"
              message={
                searchQuery
                  ? "لا توجد نتائج مطابقة للبحث"
                  : "لم يتم العثور على رسائل"
              }
            />
          </div>
        ) : (
          <div className="min-w-0 max-w-full space-y-3 overflow-x-hidden">
            {sortedMessages.map((msg) => {
              const isUnread = !msg.isRead;
              const sender =
                msg.from?.split("<")[0].replace(/"/g, "").trim() ||
                "بدون مرسل";
              const bodyPreview = cleanText(msg.body).substring(0, 95);

              return (
                <div
                  key={msg.id}
                  onClick={() => handleSelectMessage(msg)}
                  className={`group relative w-full min-w-0 max-w-full cursor-pointer overflow-hidden rounded-[24px] border transition-all duration-300 ${
                    isUnread
                      ? "border-[#d8b46a]/45 bg-white/72 shadow-[0_14px_34px_rgba(18,63,89,0.12)]"
                      : "border-white/60 bg-white/46 shadow-[0_10px_26px_rgba(18,63,89,0.07)]"
                  } hover:-translate-y-[1px] hover:border-[#c5983c]/55 hover:bg-white/78 hover:shadow-[0_18px_42px_rgba(18,63,89,0.15)] backdrop-blur-xl`}
                >
                  {/* خط ذهبي/أزرق جانبي للرسائل غير المقروءة */}
                  {isUnread && (
                    <div className="absolute right-0 top-1/2 h-12 w-1.5 -translate-y-1/2 rounded-l-full bg-gradient-to-b from-[#c5983c] to-[#123f59]" />
                  )}

                  {/* لمعة داخلية خفيفة */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-l from-white/22 via-transparent to-[#f8efe0]/16 opacity-80" />

                  <div className="relative z-10 flex min-w-0 max-w-full items-center gap-4 overflow-hidden px-5 py-4">
                    {/* Star + unread dot */}
                    <div className="flex shrink-0 flex-col items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateMessageInDB(msg, {
                            isStarred: !msg.isStarred,
                          });
                        }}
                        className={`grid h-9 w-9 place-items-center rounded-2xl border transition-all duration-300 ${
                          msg.isStarred
                            ? "border-[#d8b46a]/50 bg-[#f8efe0] text-[#c5983c]"
                            : "border-white/50 bg-white/35 text-[#94a3b8] hover:border-[#d8b46a]/45 hover:bg-[#f8efe0]/75 hover:text-[#c5983c]"
                        }`}
                        title="تمييز الرسالة"
                        type="button"
                      >
                        <Star
                          className={`h-4 w-4 ${
                            msg.isStarred ? "fill-[#c5983c]" : ""
                          }`}
                        />
                      </button>

                      {isUnread && (
                        <div className="h-2.5 w-2.5 rounded-full bg-[#c5983c] shadow-[0_0_0_4px_rgba(197,152,60,0.14)]" />
                      )}
                    </div>

                    {/* Main content */}
                    <div className="min-w-0 flex-1 overflow-hidden">
                      <div className="mb-1.5 flex min-w-0 items-center justify-between gap-4 overflow-hidden">
                        <span
                          className={`min-w-0 truncate text-[13px] ${
                            isUnread
                              ? "font-extrabold text-[#123f59]"
                              : "font-bold text-[#304b57]"
                          }`}
                        >
                          {sender}
                        </span>

                        <span
                          className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${
                            isUnread
                              ? "bg-[#123f59] text-white"
                              : "bg-white/40 text-[#64748b]"
                          }`}
                        >
                          {formatDate(msg.date)}
                        </span>
                      </div>

                      <div className="flex min-w-0 max-w-full items-baseline gap-2 overflow-hidden">
                        <h4
                          className={`min-w-0 flex-1 truncate text-sm ${
                            isUnread
                              ? "font-extrabold text-[#1b3240]"
                              : "font-semibold text-[#53636b]"
                          }`}
                        >
                          <span className="truncate">
                            {msg.subject || "(بدون موضوع)"}
                          </span>

                          <span className="mx-2 font-normal text-[#c5983c]">
                            —
                          </span>

                          <span className="text-xs font-medium text-[#6b7a80]">
                            {bodyPreview}
                          </span>
                        </h4>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex shrink-0 items-center gap-1 rounded-2xl border border-white/55 bg-white/45 p-1 opacity-0 shadow-[0_10px_24px_rgba(18,63,89,0.10)] backdrop-blur-md transition-all duration-300 group-hover:opacity-100">
                      {currentView === "trash" ? (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateMessageInDB(msg, { isDeleted: false });
                            }}
                            className="grid h-8 w-8 place-items-center rounded-xl text-[#64748b] transition hover:bg-emerald-50 hover:text-emerald-600"
                            title="استعادة"
                            type="button"
                          >
                            <Archive className="h-4 w-4" />
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(msg);
                            }}
                            className="grid h-8 w-8 place-items-center rounded-xl text-[#64748b] transition hover:bg-red-50 hover:text-red-600"
                            title="حذف نهائي"
                            type="button"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateMessageInDB(msg, { isArchived: true });
                            }}
                            className="grid h-8 w-8 place-items-center rounded-xl text-[#64748b] transition hover:bg-[#f8efe0] hover:text-[#123f59]"
                            title="أرشفة"
                            type="button"
                          >
                            <Archive className="h-4 w-4" />
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(msg);
                            }}
                            className="grid h-8 w-8 place-items-center rounded-xl text-[#64748b] transition hover:bg-red-50 hover:text-red-600"
                            title="حذف"
                            type="button"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {isFetchingMore && (
              <div className="flex justify-center py-5">
                <div className="flex items-center gap-2 rounded-2xl border border-white/60 bg-white/55 px-4 py-2 text-[#123f59] shadow-sm backdrop-blur-xl">
                  <Loader2 className="h-5 w-5 animate-spin text-[#c5983c]" />
                  <span className="text-xs font-bold">
                    جاري تحميل المزيد...
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}