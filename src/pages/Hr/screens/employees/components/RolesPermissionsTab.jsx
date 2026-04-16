import React from "react";
import { Plus, Search, Edit, Trash2, KeyRound, ShieldCheck, Layers, X, AlertCircle, Loader2, Settings2 } from "lucide-react";

export default function RolesPermissionsTab({ roles, selectedRole, onSelectRole, onAddRole, onEditRole, onDeleteRole, onRemovePermission, searchTerm, onSearch, isLoading }) {
  return (
    <div className="flex flex-col lg:flex-row h-full gap-2 p-2 sm:p-3 min-h-0 animate-in fade-in">
      
      {/* Left Pane: الأدوار */}
      <div className="w-full lg:w-1/3 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col min-h-[300px] lg:min-h-0 shrink-0">
        <div className="p-2.5 border-b border-slate-100 bg-slate-50 shrink-0">
          <button onClick={onAddRole} className="w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-[11px] font-black flex items-center justify-center gap-1.5 shadow-sm mb-2 transition-colors">
            <Plus className="w-3.5 h-3.5" /> إنشاء دور وظيفي
          </button>
          <div className="relative">
            <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input type="text" placeholder="بحث في الأدوار..." value={searchTerm} onChange={(e) => onSearch(e.target.value)} className="w-full pl-2 pr-8 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold outline-none focus:border-blue-400" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-1.5 space-y-1 bg-slate-50/30">
          {isLoading ? (
            <div className="p-6 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-blue-500" /></div>
          ) : (
            roles.filter((r) => (r.nameAr || "").includes(searchTerm)).map((role) => (
              <div key={role.id} className="flex gap-1 group">
                <button onClick={() => onSelectRole(role)} className={`flex-1 text-right p-2 rounded-lg border transition-all ${selectedRole?.id === role.id ? "bg-blue-50 border-blue-400 shadow-sm" : "bg-white border-transparent hover:border-slate-200"}`}>
                  <div className="flex justify-between items-start mb-0.5">
                    <span className={`font-black text-[11px] ${selectedRole?.id === role.id ? "text-blue-800" : "text-slate-700"}`}>{role.nameAr}</span>
                    <span className="text-[9px] font-black text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">{role._count?.employees || 0} مستخدم</span>
                  </div>
                  <div className="text-[9px] font-bold text-slate-400 truncate">{role.description || "بدون وصف"}</div>
                </button>
                <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity justify-center px-0.5">
                  <button onClick={() => onEditRole(role)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded bg-white border border-slate-100 shadow-sm"><Edit className="w-3 h-3" /></button>
                  <button onClick={() => onDeleteRole(role.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded bg-white border border-slate-100 shadow-sm"><Trash2 className="w-3 h-3" /></button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Pane: الصلاحيات */}
      <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col min-h-0">
        {selectedRole ? (
          <>
            <div className="p-3.5 border-b border-slate-100 flex justify-between items-center bg-gradient-to-l from-slate-50 to-white shrink-0">
              <div>
                <h3 className="text-[15px] font-black text-slate-800 flex items-center gap-1.5"><KeyRound className="w-4 h-4 text-amber-500" /> {selectedRole.nameAr}</h3>
                <p className="text-[10px] font-bold text-slate-500 mt-0.5">{selectedRole.description}</p>
              </div>
              <div className="text-[10px] bg-amber-100 text-amber-800 px-2.5 py-1 rounded-lg font-black flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5" /> إجمالي: {selectedRole.permissions?.length || 0}</div>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-3 bg-slate-50/50">
              <div className="mb-3 flex items-start gap-2 bg-blue-50 p-2.5 rounded-lg border border-blue-100">
                <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-[10px] font-bold text-blue-800 leading-relaxed">
                  <strong>كيف أضيف صلاحيات؟</strong> إضافة الصلاحيات تتم بصرياً وديناميكياً عبر النقر على زر <strong>"وضع البناء"</strong> أسفل يسار الشاشة أثناء تصفح النظام.
                </div>
              </div>

              {selectedRole.permissions?.length === 0 ? (
                <div className="text-center p-10 text-slate-400 font-bold text-[11px]">لا توجد صلاحيات مسجلة لهذا الدور حتى الآن.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {selectedRole.permissions?.map((perm) => (
                    <div key={perm.id} className="bg-white p-2 rounded-lg border border-slate-200 flex justify-between items-center shadow-sm group hover:border-blue-300 transition-colors">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 bg-slate-50 rounded text-indigo-500"><Layers className="w-3.5 h-3.5" /></div>
                        <div>
                          <div className="font-black text-[11px] text-slate-700 leading-tight">{perm.name}</div>
                          <div className="text-[9px] font-bold text-slate-400 mt-0.5">شاشة: {perm.screenName || "عام"} | {perm.code}</div>
                        </div>
                      </div>
                      <button onClick={() => onRemovePermission(selectedRole.id, perm.id, perm.name)} className="p-1.5 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="إزالة">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <Settings2 className="w-12 h-12 mb-3 opacity-20" />
            <div className="text-sm font-black text-slate-600">اختر دوراً وظيفياً من القائمة</div>
            <p className="text-[10px] font-bold mt-1">لعرض وإدارة الصلاحيات المرتبطة به</p>
          </div>
        )}
      </div>
    </div>
  );
}