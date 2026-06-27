// src/pages/Hr/screens/payroll/components/TopBar.jsx
import React from "react";
import { Search, Calendar } from "lucide-react";

export default function TopBar({ searchQuery, setSearchQuery, filterMonth, setFilterMonth }) {
  return (
    <div className="h-20 shrink-0 bg-white/40 backdrop-blur-md border-b border-white/60 px-6 flex items-center justify-between z-10">
      
      {/* شريط البحث الاحترافي */}
      <div className="relative flex-1 max-w-xl group">
        <div className="absolute inset-y-0 right-0 pl-3 flex items-center pointer-events-none pr-4">
          <Search className="h-5 w-5 text-gray-400 group-focus-within:text-teal-500 transition-colors" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ابحث عن موظف بالاسم، أو الرقم الوظيفي..."
          className="block w-full pl-10 pr-12 py-3 border-transparent rounded-2xl text-sm bg-white/60 backdrop-blur-sm shadow-sm placeholder-gray-400 focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-500/20 transition-all outline-none font-bold"
        />
      </div>

      {/* فلتر الشهر */}
      <div className="flex items-center gap-3 ml-4">
        <div className="flex items-center gap-2 bg-white/60 px-4 py-2.5 rounded-2xl shadow-sm border border-white/60">
          <Calendar className="text-teal-600" size={20} />
          <input 
            type="month" 
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="bg-transparent border-none outline-none font-black text-[#123f59] text-sm cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}