import React from "react";
import { Search, RefreshCw, Sparkles, FileSignature } from "lucide-react";

export default function Header({
  searchQuery,
  setSearchQuery,
  handleRefresh,
  setShowAISmartSearch,
  setShowSignatureSettings,
}) {
  return (
    <div className="bg-white border-b border-gray-100 px-6 py-3 flex items-center gap-4 shrink-0">
      <div className="flex-1 relative max-w-2xl">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="البحث في البريد..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pr-10 pl-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
        />
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={handleRefresh}
          className="p-2.5 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors"
          title="تحديث"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
        <button
          onClick={() => setShowAISmartSearch(true)}
          className="p-2.5 text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors"
          title="البحث الذكي بالذكاء الاصطناعي"
        >
          <Sparkles className="w-4 h-4" />
        </button>
        <button
          onClick={() => setShowSignatureSettings(true)}
          className="p-2.5 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors"
          title="إعدادات التوقيع"
        >
          <FileSignature className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}