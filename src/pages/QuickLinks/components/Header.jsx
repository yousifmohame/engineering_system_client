import React from "react";
import { ChevronRight, Link2, Pin, Lock, Search, Plus, Settings } from "lucide-react";
import { MiniStatCard } from "./UI/SharedUI";

export default function Header({ stats, searchQuery, setSearchQuery, sortBy, setSortBy, onOpenLinkModal, onOpenCategoryModal }) {
  return (
    <div className="relative shrink-0 overflow-hidden rounded-[14px] 2xl:rounded-[18px] border border-[#e2bf74]/35 bg-gradient-to-l from-[#06111d] via-[#0b3f55] to-[#005f73] px-2.5 py-1.5 2xl:px-3 2xl:py-2 shadow-[0_8px_20px_rgba(6,17,29,0.22)]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-[-45px] top-[-45px] h-24 w-24 rounded-full bg-[#e2bf74]/18 blur-2xl" />
        <div className="absolute left-[-50px] bottom-[-50px] h-28 w-28 rounded-full bg-emerald-400/12 blur-2xl" />
      </div>

      <div className="relative z-10 flex items-center gap-2">
        <div className="flex min-w-[190px] shrink-0 items-center gap-2">
          <button className="grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-white/20 bg-white/10 text-[#e2bf74] transition hover:bg-white/15" type="button">
            <ChevronRight className="h-4 w-4" />
          </button>
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[#e2bf74] text-[#082032] shadow-sm">
            <Link2 className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <h3 className="truncate text-[12px] font-black text-white">الروابط السريعة</h3>
            <p className="truncate text-[8px] font-bold text-white/55">{stats.total} رابط · {stats.categoriesCount} تصنيف</p>
          </div>
        </div>

        <div className="hidden shrink-0 items-center gap-1.5 md:flex">
          <MiniStatCard icon={Link2} label="الروابط" value={stats.total} tone="blue" />
          <MiniStatCard icon={Pin} label="مثبتة" value={stats.pinned} tone="gold" />
          <MiniStatCard icon={Lock} label="محمية" value={stats.protected} tone="red" />
        </div>

        <div className="relative min-w-[190px] flex-1">
          <Search className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#d8a93d]" />
          <input
            placeholder="بحث في الروابط..."
            className="h-8 w-full rounded-xl border border-white/20 bg-white pr-9 pl-3 text-[10px] font-bold text-[#082032] shadow-sm outline-none transition-all placeholder:text-[#6b7c8f] focus:border-[#e2bf74] focus:ring-2 focus:ring-[#e2bf74]/25"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <button onClick={() => setSortBy("usage")} className={`h-8 shrink-0 rounded-xl border px-3 text-[10px] font-black transition-all ${sortBy === "usage" ? "border-[#e2bf74]/45 bg-[#e2bf74] text-[#082032]" : "border-white/20 bg-white/10 text-white hover:bg-white/15"}`} type="button">
          الأكثر استخداماً
        </button>
        <button onClick={() => setSortBy("date")} className={`h-8 shrink-0 rounded-xl border px-3 text-[10px] font-black transition-all ${sortBy === "date" ? "border-[#e2bf74]/45 bg-[#e2bf74] text-[#082032]" : "border-white/20 bg-white/10 text-white hover:bg-white/15"}`} type="button">
          الأحدث
        </button>

        <button onClick={onOpenLinkModal} className="flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-[#e2bf74] px-3 text-[10px] font-black text-[#082032] shadow-[0_8px_18px_rgba(226,191,116,0.22)] transition-all duration-300 hover:-translate-y-[1px] hover:bg-[#f5d99b]" type="button">
          <Plus className="h-3.5 w-3.5" /> رابط جديد
        </button>

        <button onClick={onOpenCategoryModal} className="grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-white/20 bg-white/10 text-[#e2bf74] transition hover:bg-white/15" type="button" title="إدارة التصنيفات">
          <Settings className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}