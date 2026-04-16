import React from "react";
import { X, User, Briefcase, KeyRound, Loader2, CheckCircle } from "lucide-react";
import { DEPARTMENTS, POSITIONS, EMPLOYEE_CODES } from "../constants";

export default function EmployeeModal({ modal, setModal, roles, usedEmployeeCodes, onSubmit, isPending }) {
  if (!modal.isOpen) return null;

  const handleRoleToggle = (roleId) => {
    setModal((prev) => {
      const currentRoles = prev.data.roleIds;
      if (currentRoles.includes(roleId)) {
        return { ...prev, data: { ...prev.data, roleIds: currentRoles.filter((id) => id !== roleId) } };
      } else {
        return { ...prev, data: { ...prev.data, roleIds: [...currentRoles, roleId] } };
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-2 sm:p-4 font-cairo">
      <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[95vh] sm:max-h-[90vh] animate-in zoom-in-95 overflow-hidden">
        
        {/* Header */}
        <div className="p-3 sm:p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
          <div>
            <h3 className="font-black text-sm text-slate-800 flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" />
              {modal.mode === "create" ? "إضافة موظف جديد" : "تعديل بيانات الموظف"}
            </h3>
            <p className="text-[9px] text-slate-500 mt-1 font-bold">يمكن للموظف الدخول باستخدام (الإيميل، الجوال، أو الرقم الوظيفي)</p>
          </div>
          <button onClick={() => setModal({ ...modal, isOpen: false })} className="p-1.5 bg-slate-200 hover:bg-red-100 hover:text-red-600 rounded-lg transition-colors">
            <X className="w-4 h-4 text-slate-600" />
          </button>
        </div>

        {/* Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 custom-scrollbar">
          <form id="empForm" onSubmit={onSubmit} className="space-y-3">
            
            {/* Section 1: Basic Info */}
            <div className="bg-blue-50/30 p-3 rounded-xl border border-blue-100">
              <h4 className="text-[11px] font-black text-blue-800 mb-2.5 flex items-center gap-1.5 border-b border-blue-100 pb-1.5">
                <User className="w-3.5 h-3.5" /> البيانات الأساسية وبيانات الدخول
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                <div className="md:col-span-1">
                  <label className="block text-[9px] font-black mb-1 text-slate-600">الرقم الوظيفي *</label>
                  <select required value={modal.data.employeeCode} onChange={(e) => setModal({ ...modal, data: { ...modal.data, employeeCode: e.target.value } })} className="w-full p-2 border border-slate-300 rounded-lg text-[11px] font-bold bg-white focus:border-blue-500 outline-none">
                    <option value="">-- اختر --</option>
                    {EMPLOYEE_CODES.map((code) => {
                      const isUsed = usedEmployeeCodes.includes(code) && modal.data.employeeCode !== code;
                      return <option key={code} value={code} disabled={isUsed} className={isUsed ? "text-slate-300" : "text-slate-800"}>{code} {isUsed ? "(مستخدم)" : ""}</option>;
                    })}
                  </select>
                </div>
                <div className="md:col-span-3">
                  <label className="block text-[9px] font-black mb-1 text-slate-600">الاسم الكامل *</label>
                  <input required value={modal.data.name} onChange={(e) => setModal({ ...modal, data: { ...modal.data, name: e.target.value } })} className="w-full p-2 border border-slate-300 rounded-lg text-[11px] font-bold focus:border-blue-500 outline-none" placeholder="الاسم الرباعي" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[9px] font-black mb-1 text-slate-600">البريد الإلكتروني *</label>
                  <input required type="email" dir="ltr" value={modal.data.email} onChange={(e) => setModal({ ...modal, data: { ...modal.data, email: e.target.value } })} className="w-full p-2 border border-slate-300 rounded-lg text-[11px] font-bold focus:border-blue-500 outline-none text-left" placeholder="email@example.com" />
                </div>
                <div className="md:col-span-1">
                  <label className="block text-[9px] font-black mb-1 text-slate-600">رقم الجوال *</label>
                  <input required dir="ltr" value={modal.data.phone} onChange={(e) => setModal({ ...modal, data: { ...modal.data, phone: e.target.value } })} className="w-full p-2 border border-slate-300 rounded-lg text-[11px] font-bold focus:border-blue-500 outline-none text-left" placeholder="05XXXXXXXX" />
                </div>
                <div className="md:col-span-1">
                  <label className="block text-[9px] font-black mb-1 text-slate-600">كلمة المرور {modal.mode === "edit" && <span className="text-slate-400 font-normal">(اتركها فارغة لعدم التغيير)</span>}</label>
                  <input type="text" dir="ltr" required={modal.mode === "create"} value={modal.data.password} onChange={(e) => setModal({ ...modal, data: { ...modal.data, password: e.target.value } })} className="w-full p-2 border border-slate-300 rounded-lg text-[11px] font-bold focus:border-blue-500 outline-none text-left" placeholder="********" />
                </div>
              </div>
            </div>

            {/* Section 2: Work Info */}
            <div className="bg-emerald-50/30 p-3 rounded-xl border border-emerald-100">
              <h4 className="text-[11px] font-black text-emerald-800 mb-2.5 flex items-center gap-1.5 border-b border-emerald-100 pb-1.5">
                <Briefcase className="w-3.5 h-3.5" /> التسكين الوظيفي
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                <div className="md:col-span-1">
                  <label className="block text-[9px] font-black mb-1 text-slate-600">رقم الهوية / الإقامة *</label>
                  <input required dir="ltr" value={modal.data.nationalId} onChange={(e) => setModal({ ...modal, data: { ...modal.data, nationalId: e.target.value } })} className="w-full p-2 border border-slate-300 rounded-lg text-[11px] font-bold focus:border-emerald-500 outline-none text-left" />
                </div>
                <div className="md:col-span-1">
                  <label className="block text-[9px] font-black mb-1 text-slate-600">القسم / الإدارة *</label>
                  <select required value={modal.data.department} onChange={(e) => setModal({ ...modal, data: { ...modal.data, department: e.target.value } })} className="w-full p-2 border border-slate-300 rounded-lg text-[11px] font-bold bg-white focus:border-emerald-500 outline-none">
                    <option value="">-- اختر --</option>
                    {DEPARTMENTS.map((dept) => <option key={dept} value={dept}>{dept}</option>)}
                  </select>
                </div>
                <div className="md:col-span-1">
                  <label className="block text-[9px] font-black mb-1 text-slate-600">المسمى الداخلي *</label>
                  <select required value={modal.data.position} onChange={(e) => setModal({ ...modal, data: { ...modal.data, position: e.target.value } })} className="w-full p-2 border border-slate-300 rounded-lg text-[11px] font-bold bg-white focus:border-emerald-500 outline-none">
                    <option value="">-- اختر --</option>
                    {POSITIONS.map((pos) => <option key={pos} value={pos}>{pos}</option>)}
                  </select>
                </div>
                <div className="md:col-span-1">
                  <label className="block text-[9px] font-black mb-1 text-slate-600">مسمى قوى (اختياري)</label>
                  <input value={modal.data.qiwaPosition} onChange={(e) => setModal({ ...modal, data: { ...modal.data, qiwaPosition: e.target.value } })} className="w-full p-2 border border-slate-300 rounded-lg text-[11px] font-bold focus:border-emerald-500 outline-none" placeholder="مسمى العقد..." />
                </div>
              </div>
            </div>

            {/* Section 3: Roles & Permissions */}
            <div className="bg-purple-50/30 p-3 rounded-xl border border-purple-100">
              <h4 className="text-[11px] font-black text-purple-800 mb-1.5 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5" /> الأدوار والصلاحيات (تراكمية) *
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 bg-white p-2 rounded-lg border border-purple-100 max-h-32 overflow-y-auto custom-scrollbar">
                {roles.map((r) => (
                  <label key={r.id} className={`flex items-start gap-1.5 p-1.5 rounded-lg cursor-pointer transition-colors border ${modal.data.roleIds.includes(r.id) ? "bg-purple-50 border-purple-200" : "hover:bg-slate-50 border-transparent"}`}>
                    <input type="checkbox" checked={modal.data.roleIds.includes(r.id)} onChange={() => handleRoleToggle(r.id)} className="mt-0.5 w-3.5 h-3.5 text-purple-600 rounded cursor-pointer" />
                    <div>
                      <div className={`text-[10px] font-black ${modal.data.roleIds.includes(r.id) ? "text-purple-800" : "text-slate-700"}`}>{r.nameAr}</div>
                      <div className="text-[8px] font-bold text-slate-500 leading-tight line-clamp-1">{r.description}</div>
                    </div>
                  </label>
                ))}
              </div>
              {modal.data.roleIds.length === 0 && <div className="text-[9px] text-red-500 mt-1 font-black">⚠️ يجب اختيار دور واحد على الأقل</div>}
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-100 bg-slate-50 flex gap-2 shrink-0">
          <button type="button" onClick={() => setModal({ ...modal, isOpen: false })} className="px-5 py-2 bg-white border border-slate-300 text-slate-600 rounded-lg text-[11px] font-black hover:bg-slate-100 transition-colors">
            إلغاء
          </button>
          <button type="submit" form="empForm" disabled={isPending} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-black flex justify-center items-center gap-1.5 shadow-sm disabled:opacity-50">
            {isPending ? <Loader2 className="animate-spin w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
            حفظ البيانات
          </button>
        </div>
      </div>
    </div>
  );
}