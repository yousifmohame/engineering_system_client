import React from "react";
import { Star, Archive, Trash2, Mail, Loader2 } from "lucide-react";

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
    return text
      .replace(/<[^>]*>/g, "")
      .replace(/\s+/g, " ")
      .trim();
  };

  const LocalLoadingSkeleton = () => (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-[24px] border border-emerald-200/50 bg-white/75 px-5 py-4 shadow-[0_10px_26px_rgba(18,63,89,0.07)]"
        >
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 shrink-0 rounded-2xl bg-emerald-50" />

            <div className="min-w-0 flex-1 space-y-3">
              <div className="flex items-center justify-between gap-4">
                <div className="h-3.5 w-36 rounded-full bg-emerald-100" />
                <div className="h-5 w-20 rounded-full bg-[#d8b46a]/20" />
              </div>

              <div className="h-4 w-3/4 rounded-full bg-emerald-50" />
              <div className="h-3 w-full rounded-full bg-[#e8ddc8]/70" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // أضف هذه الدالة داخل مكون MessageList
  const getEmptyMessageTitle = () => {
    switch (currentView) {
      case "sent": return "صندوق الصادر فارغ";
      case "starred": return "لا توجد رسائل مميزة";
      case "archived": return "الأرشيف فارغ";
      case "drafts": return "لا توجد مسودات";
      case "trash": return "سلة المهملات فارغة";
      default: return "صندوق الوارد فارغ";
    }
  };

  const NoResults = () => (
    <div className="flex min-h-[360px] w-full items-center justify-center rounded-[28px] border border-[#d8b46a]/25 bg-white/75 px-4 py-10 shadow-[0_18px_45px_rgba(18,63,89,0.10)]">
      <div className="mx-auto flex max-w-sm flex-col items-center justify-center text-center">
        <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-[24px] bg-gradient-to-br from-[#123f59] to-[#1a5874] text-[#e2bf74] shadow-[0_16px_34px_rgba(18,63,89,0.25)]">
          <Mail className="h-10 w-10" />
        </div>

        {/* 💡 التعديل هنا: استخدام الدالة بدلاً من النص الثابت */}
        <h3 className="mb-2 text-xl font-black text-[#123f59]">
          {getEmptyMessageTitle()}
        </h3>

        <p className="max-w-xs text-sm font-semibold leading-7 text-[#53676d]">
          {searchQuery
            ? "لا توجد نتائج مطابقة للبحث الحالي"
            : "لم يتم العثور على رسائل في هذا القسم"}
        </p>
      </div>
    </div>
  );

  return (
    <div
      ref={listRef}
      className="relative min-w-0 max-w-full flex-1 overflow-y-auto overflow-x-hidden px-3 py-3 custom-scrollbar-slim sm:px-4 sm:py-4"
      onScroll={handleScroll}
      dir="rtl"
    >
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#ecfdf5]/35 via-white/50 to-[#fff7ed]/35" />
        <div className="absolute left-[-90px] top-20 h-56 w-56 rounded-full bg-emerald-400/8 blur-3xl" />
        <div className="absolute right-[-90px] bottom-20 h-56 w-56 rounded-full bg-rose-400/7 blur-3xl" />
      </div>

      <div className="relative z-10 min-w-0 max-w-full overflow-hidden">
        {isLoading ? (
          <LocalLoadingSkeleton />
        ) : sortedMessages.length === 0 ? (
          <NoResults />
        ) : (
          <div className="min-w-0 max-w-full space-y-3 overflow-hidden">
            {sortedMessages.map((msg) => {
              const isUnread = !msg.isRead;

              const sender =
                msg.from?.split("<")[0].replace(/"/g, "").trim() || "بدون مرسل";

              const bodyPreview = cleanText(msg.body).substring(0, 105);

              return (
                <div
                  key={msg.id}
                  onClick={() => handleSelectMessage(msg)}
                  className={`group relative w-full min-w-0 max-w-full cursor-pointer overflow-hidden rounded-[22px] border transition-all duration-300 sm:rounded-[24px] ${
                    isUnread
                      ? "border-rose-300/65 bg-gradient-to-l from-rose-50/80 via-white to-rose-50/60 shadow-[0_14px_34px_rgba(190,18,60,0.10)] ring-1 ring-rose-200/50"
                      : "border-emerald-300/60 bg-gradient-to-l from-emerald-50/75 via-white to-emerald-50/55 shadow-[0_14px_34px_rgba(5,150,105,0.10)] ring-1 ring-emerald-200/45"
                  } hover:-translate-y-[1px] ${
                    isUnread
                      ? "hover:border-rose-400 hover:shadow-[0_18px_42px_rgba(190,18,60,0.14)]"
                      : "hover:border-emerald-400 hover:shadow-[0_18px_42px_rgba(5,150,105,0.14)]"
                  } backdrop-blur-xl`}
                >
                  {isUnread ? (
                    <>
                      <div className="absolute right-0 top-0 h-full w-2 bg-gradient-to-b from-rose-500 via-rose-400 to-rose-500" />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-l from-rose-400/8 via-transparent to-rose-700/4" />
                    </>
                  ) : (
                    <>
                      <div className="absolute right-0 top-0 h-full w-2 bg-gradient-to-b from-emerald-500 via-emerald-400 to-emerald-500" />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-l from-emerald-400/8 via-transparent to-emerald-700/4" />
                    </>
                  )}

                  <div className="relative z-10 flex min-w-0 max-w-full items-center gap-3 overflow-hidden px-3 py-3 sm:gap-4 sm:px-5 sm:py-4">
                    <div className="flex shrink-0 flex-col items-center gap-2">
                      <MailActionButton
                        label={msg.isStarred ? "مميزة" : "تمييز"}
                        title="تمييز الرسالة"
                        tone={msg.isStarred ? "gold" : isUnread ? "rose" : "emerald"}
                        onClick={(e) => {
                          e.stopPropagation();
                          updateMessageInDB(msg, {
                            isStarred: !msg.isStarred,
                          });
                        }}
                      >
                        <Star
                          className={`h-4 w-4 ${
                            msg.isStarred ? "fill-[#c5983c]" : ""
                          }`}
                        />
                      </MailActionButton>

                      {isUnread ? (
                        <div className="relative h-3.5 w-3.5 rounded-full bg-rose-500 shadow-[0_0_0_5px_rgba(190,18,60,0.13)]">
                          <span className="absolute inset-0 rounded-full bg-rose-400 opacity-45 animate-ping" />
                        </div>
                      ) : (
                        <div className="h-3.5 w-3.5 rounded-full bg-emerald-500 shadow-[0_0_0_5px_rgba(5,150,105,0.12)]" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1 overflow-hidden">
                      <div className="mb-1.5 flex min-w-0 items-center justify-between gap-3 overflow-hidden sm:gap-4">
                        <div className="flex min-w-0 items-center gap-2">
                          {isUnread ? (
                            <span className="shrink-0 rounded-full bg-rose-500 px-2.5 py-1 text-[10px] font-black text-white shadow-[0_6px_14px_rgba(190,18,60,0.16)]">
                              غير مقروء
                            </span>
                          ) : (
                            <span className="shrink-0 rounded-full bg-emerald-500 px-2.5 py-1 text-[10px] font-black text-white shadow-[0_6px_14px_rgba(5,150,105,0.16)]">
                              مقروء
                            </span>
                          )}

                          <span
                            className={`min-w-0 truncate ${
                              isUnread
                                ? "text-[14px] font-black text-rose-950"
                                : "text-[14px] font-black text-emerald-950"
                            }`}
                          >
                            {sender}
                          </span>
                        </div>

                        <span
                          className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-black ${
                            isUnread
                              ? "bg-rose-500 text-white shadow-[0_6px_14px_rgba(190,18,60,0.16)]"
                              : "bg-emerald-500 text-white shadow-[0_6px_14px_rgba(5,150,105,0.16)]"
                          }`}
                        >
                          {formatDate(msg.date)}
                        </span>
                      </div>

                      <div className="flex min-w-0 max-w-full items-baseline gap-2 overflow-hidden">
                        <h4
                          className={`min-w-0 flex-1 truncate ${
                            isUnread
                              ? "text-[15px] font-black text-[#111827]"
                              : "text-[15px] font-black text-emerald-950"
                          }`}
                        >
                          <span>{msg.subject || "(بدون موضوع)"}</span>

                          <span
                            className={`mx-2 font-black ${
                              isUnread ? "text-rose-500" : "text-emerald-500"
                            }`}
                          >
                            —
                          </span>

                          <span
                            className={`text-xs ${
                              isUnread
                                ? "font-bold text-[#263238]"
                                : "font-bold text-emerald-900"
                            }`}
                          >
                            {bodyPreview}
                          </span>
                        </h4>
                      </div>
                    </div>

                    <div
                      className={`hidden shrink-0 items-center gap-1.5 rounded-2xl border p-1 shadow-[0_10px_24px_rgba(18,63,89,0.08)] backdrop-blur-md transition-all duration-300 md:flex ${
                        isUnread
                          ? "border-rose-200 bg-white/85 opacity-100"
                          : "border-emerald-200 bg-white/85 opacity-0 group-hover:opacity-100"
                      }`}
                    >
                      {currentView === "trash" ? (
                        <>
                          <MailActionButton
                            label="استعادة"
                            title="استعادة"
                            tone="emerald"
                            compact
                            onClick={(e) => {
                              e.stopPropagation();
                              updateMessageInDB(msg, { isDeleted: false });
                            }}
                          >
                            <Archive className="h-4 w-4" />
                          </MailActionButton>

                          <MailActionButton
                            label="حذف نهائي"
                            title="حذف نهائي"
                            tone="rose"
                            compact
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(msg);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </MailActionButton>
                        </>
                      ) : (
                        <>
                          <MailActionButton
                            label="أرشفة"
                            title="أرشفة"
                            tone="emerald"
                            compact
                            onClick={(e) => {
                              e.stopPropagation();
                              updateMessageInDB(msg, { isArchived: true });
                            }}
                          >
                            <Archive className="h-4 w-4" />
                          </MailActionButton>

                          <MailActionButton
                            label="حذف"
                            title="حذف"
                            tone="rose"
                            compact
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(msg);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </MailActionButton>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {isFetchingMore && (
              <div className="flex justify-center py-5">
                <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-white/80 px-4 py-2 text-emerald-800 shadow-sm backdrop-blur-xl">
                  <Loader2 className="h-5 w-5 animate-spin text-emerald-500" />
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


const MailActionButton = ({
  label,
  title,
  tone = "emerald",
  onClick,
  children,
  compact = false,
}) => {
  const tones = {
    emerald:
      "border-emerald-200 bg-white/90 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800",
    rose:
      "border-rose-200 bg-white/90 text-rose-600 hover:bg-rose-50 hover:text-rose-700",
    gold:
      "border-[#c5983c]/60 bg-[#f8efe0] text-[#c5983c] hover:bg-[#f4e3bf]",
  };

  return (
    <button
      onClick={onClick}
      title={title}
      className={`
        flex flex-col items-center justify-center gap-0.5 rounded-xl border
        transition-all duration-200 hover:-translate-y-[1px]
        ${compact ? "min-w-[50px] px-1.5 py-1" : "min-w-[50px] px-1.5 py-1.5"}
        ${tones[tone] || tones.emerald}
      `}
      type="button"
    >
      {children}
      <span className="whitespace-nowrap text-[8px] font-black leading-none">
        {label}
      </span>
    </button>
  );
};
