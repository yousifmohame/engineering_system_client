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
    <header
      className="relative shrink-0 overflow-hidden border-b border-[#d8b46a]/15 bg-transparent px-2 py-2 sm:px-4 sm:py-3 lg:px-5 lg:py-4"
      dir="rtl"
    >
      {/* Fond décoratif du header */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-l from-[#f8efe0]/35 via-white/20 to-[#e8f0ef]/30" />
        <div className="absolute right-[20%] top-[-50px] h-28 w-28 rounded-full bg-[#123f59]/10 blur-3xl" />
        <div className="absolute left-[12%] bottom-[-55px] h-32 w-32 rounded-full bg-[#c5983c]/14 blur-3xl" />
      </div>

      {/* Toolbar */}
      <div
        className="
          relative z-10 flex min-w-0 items-center gap-2 overflow-hidden
          rounded-[22px] border border-white/60 bg-white/45
          px-2 py-2 shadow-[0_14px_34px_rgba(18,63,89,0.08)]
          backdrop-blur-xl
          sm:gap-3 sm:rounded-[24px] sm:px-3
          lg:gap-4 lg:rounded-[26px] lg:px-4 lg:py-3
        "
      >
        {/* Search */}
        <div className="relative min-w-0 flex-1">
          <div className="relative mx-auto w-full max-w-4xl">
            <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#123f59]/55 sm:right-4 sm:h-5 sm:w-5" />

            <input
              type="text"
              dir="auto"
              placeholder="البحث في البريد..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="
                h-10 w-full min-w-0 rounded-2xl border border-[#d8b46a]/30
                bg-white/80 pr-10 pl-4 text-sm font-semibold text-[#123f59]
                shadow-[inset_0_1px_0_rgba(255,255,255,0.65),0_8px_22px_rgba(18,63,89,0.06)]
                outline-none backdrop-blur-md transition-all
                placeholder:text-right placeholder:text-[#6b7a80]/65
                focus:border-[#c5983c]/65 focus:bg-white/95 focus:ring-4 focus:ring-[#c5983c]/12
                sm:h-11 sm:pr-12 sm:text-[15px]
                lg:h-12
              "
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <button
            onClick={handleRefresh}
            className="
              group grid h-10 w-10 place-items-center rounded-2xl
              border border-[#d8b46a]/25 bg-white/65 text-[#123f59]
              shadow-[0_8px_20px_rgba(18,63,89,0.07)]
              backdrop-blur-md transition-all duration-300
              hover:-translate-y-[1px] hover:border-[#c5983c]/55
              hover:bg-[#f8efe0]/80 hover:text-[#c5983c]
              hover:shadow-[0_12px_26px_rgba(18,63,89,0.12)]
              sm:h-11 sm:w-11 lg:h-12 lg:w-12
            "
            title="تحديث"
            type="button"
          >
            <RefreshCw className="h-4 w-4 transition-transform duration-500 group-hover:rotate-180 sm:h-5 sm:w-5" />
          </button>

          <button
            onClick={() => setShowAISmartSearch(true)}
            className="
              group grid h-10 w-10 place-items-center rounded-2xl
              border border-[#d8b46a]/35 bg-gradient-to-br from-[#123f59] to-[#1a5874]
              text-[#e2bf74] shadow-[0_10px_24px_rgba(18,63,89,0.20)]
              backdrop-blur-md transition-all duration-300
              hover:-translate-y-[1px] hover:shadow-[0_14px_30px_rgba(18,63,89,0.28)]
              sm:h-11 sm:w-11 lg:h-12 lg:w-12
            "
            title="البحث الذكي بالذكاء الاصطناعي"
            type="button"
          >
            <Sparkles className="h-4 w-4 transition-transform duration-300 group-hover:scale-110 sm:h-5 sm:w-5" />
          </button>

          <button
            onClick={() => setShowSignatureSettings(true)}
            className="
              group grid h-10 w-10 place-items-center rounded-2xl
              border border-[#d8b46a]/25 bg-white/65 text-[#123f59]
              shadow-[0_8px_20px_rgba(18,63,89,0.07)]
              backdrop-blur-md transition-all duration-300
              hover:-translate-y-[1px] hover:border-[#c5983c]/55
              hover:bg-[#f8efe0]/80 hover:text-[#c5983c]
              hover:shadow-[0_12px_26px_rgba(18,63,89,0.12)]
              sm:h-11 sm:w-11 lg:h-12 lg:w-12
            "
            title="إعدادات التوقيع"
            type="button"
          >
            <FileSignature className="h-4 w-4 transition-transform duration-300 group-hover:scale-110 sm:h-5 sm:w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}