import React from "react";
import { Search, Loader2, Users, User, Edit, Trash2 } from "lucide-react";

export default function EmployeesListTab({ employees, stats, searchTerm, onSearch, onEdit, onDelete, isLoading }) {
  return (
    <div className="flex flex-col h-full gap-2 p-2 sm:p-3 min-h-0 animate-in fade-in">
      
      {/* الإحصائيات - Ultra Dense */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 shrink-0">
        <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div><div className="text-slate-500 text-[9px] font-black mb-0.5">إجمالي الموظفين</div><div className="text-xl font-black text-slate-800">{stats.total}</div></div>
          <Users className="w-6 h-6 text-slate-200" />
        </div>
        <div className="bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100 shadow-sm flex items-center justify-between">
          <div><div className="text-emerald-600 text-[9px] font-black mb-0.5">حسابات نشطة</div><div className="text-xl font-black text-emerald-700">{stats.active}</div></div>
        </div>
        <div className="bg-red-50/50 p-2.5 rounded-xl border border-red-100 shadow-sm flex items-center justify-between">
          <div><div className="text-red-600 text-[9px] font-black mb-0.5">حسابات موقوفة</div><div className="text-xl font-black text-red-700">{stats.inactive}</div></div>
        </div>
        <div className="bg-blue-50/50 p-2.5 rounded-xl border border-blue-100 shadow-sm flex items-center justify-between">
          <div><div className="text-blue-600 text-[9px] font-black mb-0.5">المقاعد المتبقية</div><div className="text-xl font-black text-blue-700">{stats.remaining}<span className="text-[10px] font-bold text-blue-400">/50</span></div></div>
        </div>
      </div>

      {/* الجدول والبحث */}
      <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-0">
        
        <div className="p-2 border-b border-slate-100 bg-slate-50/50 shrink-0">
          <div className="relative w-full max-w-sm">
            <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input type="text" placeholder="ابحث بالاسم، الرقم الوظيفي، الهوية..." value={searchTerm} onChange={(e) => onSearch(e.target.value)} className="w-full pl-3 pr-8 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] font-bold outline-none focus:border-blue-400 transition-colors" />
          </div>
        </div>

        <div className="flex-1 overflow-auto custom-scrollbar">
          <table className="w-full text-right whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
              <tr>
                <th className="p-2 text-[10px] font-black text-slate-600 border-l border-slate-200 w-16 text-center">الكود</th>
                <th className="p-2 text-[10px] font-black text-slate-600 border-l border-slate-200">الموظف / الدخول</th>
                <th className="p-2 text-[10px] font-black text-slate-600 border-l border-slate-200 hidden sm:table-cell">المسمى (داخلي / قوى)</th>
                <th className="p-2 text-[10px] font-black text-slate-600 border-l border-slate-200 hidden md:table-cell">الأدوار والصلاحيات</th>
                <th className="p-2 text-[10px] font-black text-slate-600 border-l border-slate-200 text-center w-20">الحالة</th>
                <th className="p-2 text-[10px] font-black text-slate-600 text-center w-20">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr><td colSpan="6" className="p-10 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-500" /></td></tr>
              ) : employees.length === 0 ? (
                <tr><td colSpan="6" className="p-10 text-center text-[11px] text-slate-500 font-bold">لا يوجد موظفين مطابقين</td></tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-blue-50/50 transition-colors group">
                    <td className="p-2 text-center border-l border-slate-100">
                      <span className="font-mono text-[10px] font-black text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">{emp.employeeCode ? `#${emp.employeeCode}` : "-"}</span>
                    </td>
                    <td className="p-2 border-l border-slate-100">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 shrink-0"><User className="w-3.5 h-3.5" /></div>
                        <div>
                          <div className="font-black text-[11px] text-slate-800">{emp.name}</div>
                          <div className="text-[9px] text-slate-500 font-mono font-bold mt-0.5">{emp.email} | {emp.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-2 border-l border-slate-100 hidden sm:table-cell">
                      <div className="font-black text-[11px] text-slate-700">{emp.position}</div>
                      <div className="text-[9px] font-bold text-slate-400 mt-0.5">قوى: <span className="text-slate-500">{emp.qiwaPosition || "-"}</span> | {emp.department}</div>
                    </td>
                    <td className="p-2 border-l border-slate-100 hidden md:table-cell max-w-[200px] truncate">
                      <div className="flex flex-wrap gap-1">
                        {emp.roles?.length > 0 ? emp.roles.map((r) => (
                          <span key={r.id} className="px-1.5 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded text-[9px] font-black">{r.nameAr}</span>
                        )) : <span className="text-[9px] text-slate-400 font-bold">بدون صلاحيات</span>}
                      </div>
                    </td>
                    <td className="p-2 text-center border-l border-slate-100">
                      <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded text-[9px] font-black ${emp.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                        {emp.status === "active" ? "نشط" : "موقوف"}
                      </span>
                    </td>
                    <td className="p-2 text-center">
                      <div className="flex items-center justify-center gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => onEdit(emp)} className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-100 rounded transition-colors"><Edit className="w-3.5 h-3.5" /></button>
                        <button onClick={() => onDelete(emp.id)} className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-100 rounded transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}