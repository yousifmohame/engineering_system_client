import React from "react";
import { Plus, Search, Edit, Trash2, KeyRound, ShieldCheck, Layers, X, AlertCircle, Loader2, Settings2 } from "lucide-react";


const IconWithText = ({
  icon: Icon,
  text,
  className = "",
  iconClassName = "",
  textClassName = "",
  vertical = false,
}) => {
  return (
    <span
      className={`inline-flex min-w-0 items-center justify-center ${
        vertical ? "flex-col gap-0.5" : "gap-1.5"
      } ${className}`}
    >
      {Icon && <Icon className={iconClassName || "h-3.5 w-3.5 shrink-0"} />}
      {text && (
        <span
          className={
            textClassName ||
            "min-w-0 whitespace-nowrap text-[10px] font-black leading-none"
          }
        >
          {text}
        </span>
      )}
    </span>
  );
};


export default function RolesPermissionsTab({ roles, selectedRole, onSelectRole, onAddRole, onEditRole, onDeleteRole, onRemovePermission, searchTerm, onSearch, isLoading }) {
  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col gap-2 overflow-hidden p-2 sm:p-3 lg:flex-row animate-in fade-in">
      
      {/* Left Pane: الأدوار */}
      <div className="w-full shrink-0 lg:w-[280px] xl:w-[300px] bg-white/95 border border-[#e8ddc8] rounded-xl shadow-[0_6px_14px_rgba(18,63,89,0.04)] flex flex-col min-h-[300px] lg:min-h-0 shrink-0">
        <div className="p-2.5 border-b border-[#e8ddc8] bg-[#fbf8f1] shrink-0">
          <button onClick={onAddRole} className="w-full bg-[#0e7490] hover:bg-[#0e7490] text-white px-3 py-2 rounded-lg text-[11px] font-black flex items-center justify-center gap-1.5 shadow-[0_6px_14px_rgba(18,63,89,0.04)] mb-2 transition-colors">
            <IconWithText icon={Plus} text="إنشاء دور وظيفي" iconClassName="w-3.5 h-3.5" /></button>
          <div className="relative">
            <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#94a3b8]" />
            <input type="text" placeholder="بحث في الأدوار..." value={searchTerm} onChange={(e) => onSearch(e.target.value)} className="w-full pl-2 pr-8 py-1.5 bg-white/95 border border-[#e8ddc8] rounded-lg text-[10px] font-bold outline-none focus:border-[#d8b46a]/35" />
          </div>
        </div>
        <div className="min-w-0 flex-1 overflow-y-auto custom-scrollbar-slim custom-scrollbar p-1.5 space-y-1 bg-[#fbf8f1]/30">
          {isLoading ? (
            <div className="p-3 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-[#0e7490]" /></div>
          ) : (
            roles.filter((r) => (r.nameAr || "").includes(searchTerm)).map((role) => (
              <div key={role.id} className="flex gap-1 group">
                <button onClick={() => onSelectRole(role)} className={`flex-1 text-right p-2 rounded-lg border transition-all ${selectedRole?.id === role.id ? "bg-[#eef7f6] border-[#d8b46a]/35 shadow-[0_6px_14px_rgba(18,63,89,0.04)]" : "bg-white/95 border-transparent hover:border-[#e8ddc8]"}`}>
                  <div className="flex justify-between items-start mb-0.5">
                    <span className={`font-black text-[11px] ${selectedRole?.id === role.id ? "text-[#123f59]" : "text-[#475569]"}`}>{role.nameAr}</span>
                    <span className="text-[9px] font-black text-[#94a3b8] bg-[#fbf8f1] px-1.5 py-0.5 rounded">{role._count?.employees || 0} مستخدم</span>
                  </div>
                  <div className="text-[9px] font-bold text-[#94a3b8] truncate">{role.description || "بدون وصف"}</div>
                </button>
                <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity justify-center px-0.5">
                  <button onClick={() => onEditRole(role)} className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-[#e8ddc8] bg-white px-2 text-[9px] font-black text-[#0e7490] shadow-[0_6px_14px_rgba(18,63,89,0.04)] hover:bg-[#eef7f6]"><IconWithText icon={Edit} text="تعديل" iconClassName="w-3 h-3" /></button>
                  <button onClick={() => onDeleteRole(role.id)} className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-red-100 bg-white px-2 text-[9px] font-black text-red-500 shadow-[0_6px_14px_rgba(18,63,89,0.04)] hover:bg-red-50"><IconWithText icon={Trash2} text="حذف" iconClassName="w-3 h-3" /></button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Pane: الصلاحيات */}
      <div className="min-w-0 flex-1 bg-white/95 border border-[#e8ddc8] rounded-xl shadow-[0_6px_14px_rgba(18,63,89,0.04)] flex flex-col min-h-0">
        {selectedRole ? (
          <>
            <div className="p-3.5 border-b border-[#e8ddc8] flex justify-between items-center bg-gradient-to-l from-[#fbf8f1] to-white shrink-0">
              <div>
                <h3 className="text-[15px] font-black text-[#123f59] flex items-center gap-1.5"><KeyRound className="w-4 h-4 text-[#e2bf74]" /> {selectedRole.nameAr}</h3>
                <p className="text-[10px] font-bold text-[#94a3b8] mt-0.5">{selectedRole.description}</p>
              </div>
              <div className="text-[10px] bg-[#f8edcf] text-[#80580d] px-2.5 py-1 rounded-lg font-black flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5" /> إجمالي: {selectedRole.permissions?.length || 0}</div>
            </div>
            <div className="min-w-0 flex-1 overflow-y-auto custom-scrollbar-slim custom-scrollbar p-3 bg-[#fbf8f1]/50">
              <div className="mb-3 flex items-start gap-2 bg-[#eef7f6] p-2.5 rounded-lg border border-[#d8b46a]/25">
                <AlertCircle className="w-4 h-4 text-[#0e7490] shrink-0 mt-0.5" />
                <div className="text-[10px] font-bold text-[#123f59] leading-relaxed">
                  <strong>كيف أضيف صلاحيات؟</strong> إضافة الصلاحيات تتم بصرياً وديناميكياً عبر النقر على زر <strong>"وضع البناء"</strong> أسفل يسار الشاشة أثناء تصفح النظام.
                </div>
              </div>

              {selectedRole.permissions?.length === 0 ? (
                <div className="text-center p-4 text-[#94a3b8] font-bold text-[11px]">لا توجد صلاحيات مسجلة لهذا الدور حتى الآن.</div>
              ) : (
                <div className="grid min-w-0 grid-cols-1 md:grid-cols-2 gap-2">
                  {selectedRole.permissions?.map((perm) => (
                    <div key={perm.id} className="bg-white/95 p-2 rounded-lg border border-[#e8ddc8] flex justify-between items-center shadow-[0_6px_14px_rgba(18,63,89,0.04)] group hover:border-[#d8b46a]/40 transition-colors">
                      <div className="flex items-center gap-2.5">
                        <div className="inline-flex h-8 items-center justify-center gap-1.5 px-2.5 bg-[#fbf8f1] rounded text-[#0e7490]"><Layers className="w-3.5 h-3.5" /></div>
                        <div>
                          <div className="font-black text-[11px] text-[#475569] leading-tight">{perm.name}</div>
                          <div className="text-[9px] font-bold text-[#94a3b8] mt-0.5">شاشة: {perm.screenName || "عام"} | {perm.code}</div>
                        </div>
                      </div>
                      <button onClick={() => onRemovePermission(selectedRole.id, perm.id, perm.name)} className="inline-flex h-8 items-center justify-center gap-1.5 px-2.5 text-[#cbd5e1] hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="إزالة">
                        <IconWithText icon={X} text="إزالة" iconClassName="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-[#94a3b8]">
            <Settings2 className="w-9 h-9 mb-3 opacity-20" />
            <div className="text-sm font-black text-[#64748b]">اختر دوراً وظيفياً من القائمة</div>
            <p className="text-[10px] font-bold mt-1">لعرض وإدارة الصلاحيات المرتبطة به</p>
          </div>
        )}
      </div>
    </div>
  );
}