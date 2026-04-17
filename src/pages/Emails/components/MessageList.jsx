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
  return (
    <div
      ref={listRef}
      className="flex-1 overflow-y-auto custom-scrollbar-slim"
      onScroll={handleScroll}
    >
      {isLoading ? (
        <LoadingSkeleton />
      ) : sortedMessages.length === 0 ? (
        <EmptyState
          icon={Mail}
          title="صندوق الوارد فارغ"
          message={searchQuery ? "لا توجد نتائج مطابقة للبحث" : "لم يتم العثور على رسائل"}
        />
      ) : (
        <div className="divide-y divide-gray-100">
          {sortedMessages.map((msg) => (
            <div
              key={msg.id}
              onClick={() => handleSelectMessage(msg)}
              className={`group px-6 py-4 cursor-pointer transition-all hover:shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] hover:z-10 relative bg-white ${
                !msg.isRead ? "bg-blue-50/20" : ""
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-center gap-2 shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      updateMessageInDB(msg, { isStarred: !msg.isStarred });
                    }}
                    className="text-gray-300 hover:text-yellow-400"
                  >
                    <Star
                      className={`w-4 h-4 ${msg.isStarred ? "text-yellow-400 fill-yellow-400" : ""}`}
                    />
                  </button>
                  {!msg.isRead && (
                    <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-[13px] truncate ${
                        !msg.isRead ? "font-bold text-gray-900" : "font-semibold text-gray-700"
                      }`}
                    >
                      {msg.from?.split("<")[0].replace(/"/g, "") || "بدون مرسل"}
                    </span>
                    <span
                      className={`text-[11px] shrink-0 ${
                        !msg.isRead ? "font-bold text-blue-600" : "text-gray-400"
                      }`}
                    >
                      {formatDate(msg.date)}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <h4
                      className={`text-sm truncate flex-1 ${
                        !msg.isRead ? "font-bold text-gray-900" : "text-gray-600 font-medium"
                      }`}
                    >
                      {msg.subject || "(بدون موضوع)"}
                      <span className="text-gray-400 font-normal mx-2">-</span>
                      <span className="text-gray-500 font-normal text-xs">
                        {msg.body?.replace(/<[^>]*>/g, "").substring(0, 80)}
                      </span>
                    </h4>
                  </div>
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 bg-white shadow-sm border border-gray-100 rounded-lg p-1">
                  {currentView === "trash" ? (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateMessageInDB(msg, { isDeleted: false });
                        }}
                        className="p-1.5 text-gray-400 hover:text-emerald-600 rounded"
                      >
                        <Archive className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(msg);
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-600 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateMessageInDB(msg, { isArchived: true });
                        }}
                        className="p-1.5 text-gray-400 hover:text-gray-700 rounded"
                      >
                        <Archive className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(msg);
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-600 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isFetchingMore && (
            <div className="py-4 flex justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}