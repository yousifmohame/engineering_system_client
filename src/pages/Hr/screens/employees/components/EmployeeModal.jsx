import React from "react";
import { X, User, Briefcase, KeyRound, Loader2, CheckCircle, MapPin, Calendar, Eye, EyeOff } from "lucide-react";
import { DEPARTMENTS, POSITIONS, EMPLOYEE_CODES } from "../constants";

export default function EmployeeModal({ modal, setModal, roles, usedEmployeeCodes, onSubmit, isPending }) {
  if (!modal.isOpen) return null;

  const data = modal.data || {};

  // دالة لتحديث البيانات بسهولة
  const updateData = (field, value) => {
    setModal((prev) => ({ ...prev, data: { ...prev.data, [field]: value } }));
  };

  // معالجة اختيار الأدوار
  const handleRoleToggle = (roleId) => {
    const currentRoles = data.roleIds || [];
    if (currentRoles.includes(roleId)) {
      updateData("roleIds", currentRoles.filter((id) => id !== roleId));
    } else {
      updateData("roleIds", [...currentRoles, roleId]);
    }
  };

  // معالجة العنوان المختصر (إجبار حروف كبيرة وأرقام فقط)
  const handleShortAddressChange = (e) => {
    const formatted = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    updateData("shortAddress", formatted);
  };

  // حساب العمر برمجياً
  const calculateAge = (birthDateString) => {
    if (!birthDateString) return "-";
    const today = new Date();
    const birthDate = new Date(birthDateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-2 sm:p-4 font-cairo">
      <div className="bg-white rounded-2xl w-full max-w-5xl shadow-2xl flex flex-col max-h-[95vh] sm:max-h-[90vh] animate-in zoom-in-95 overflow-hidden">
        
        {/* Header */}
        <div className="p-3 sm:p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
          <div>
            <h3 className="font-black text-sm text-slate-800 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              {modal.mode === "create" ? "إضافة موظف جديد" : "تعديل بيانات الموظف"}
            </h3>
            <p className="text-[10px] text-slate-500 mt-1 font-bold">يرجى تعبئة بيانات الموظف بدقة لتطابق السجلات الرسمية</p>
          </div>
          <button onClick={() => setModal({ ...modal, isOpen: false })} className="p-1.5 bg-slate-200 hover:bg-red-100 hover:text-red-600 rounded-lg transition-colors">
            <X className="w-4 h-4 text-slate-600" />
          </button>
        </div>

        {/* Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 custom-scrollbar bg-slate-50/50">
          <form id="empForm" onSubmit={onSubmit} className="space-y-4">
            
            {/* Section 1: Basic & Login Info */}
            <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm">
              <h4 className="text-xs font-black text-blue-800 mb-3 flex items-center gap-1.5 border-b border-blue-50 pb-2">
                <KeyRound className="w-4 h-4" /> بيانات الحساب والاتصال
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div className="md:col-span-1">
                  <label className="block text-[10px] font-black mb-1 text-slate-600">الرقم الوظيفي *</label>
                  <select required value={data.employeeCode} onChange={(e) => updateData("employeeCode", e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg text-xs font-bold bg-slate-50 focus:border-blue-500 outline-none">
                    <option value="">-- اختر --</option>
                    {EMPLOYEE_CODES.map((code) => {
                      const isUsed = usedEmployeeCodes.includes(code) && data.employeeCode !== code;
                      return <option key={code} value={code} disabled={isUsed} className={isUsed ? "text-slate-300" : "text-slate-800"}>{code} {isUsed ? "(مستخدم)" : ""}</option>;
                    })}
                  </select>
                </div>
                <div className="md:col-span-1">
                  <label className="block text-[10px] font-black mb-1 text-slate-600">رقم الهوية / الإقامة *</label>
                  <input required dir="ltr" value={data.nationalId} onChange={(e) => updateData("nationalId", e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg text-xs font-bold focus:border-blue-500 outline-none text-left" placeholder="10XXXXX" />
                </div>
                <div className="md:col-span-1">
                  <label className="block text-[10px] font-black mb-1 text-slate-600">البريد الإلكتروني *</label>
                  <input required type="email" dir="ltr" value={data.email} onChange={(e) => updateData("email", e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg text-xs font-bold focus:border-blue-500 outline-none text-left" placeholder="email@domain.com" />
                </div>
                <div className="md:col-span-1">
                  <label className="block text-[10px] font-black mb-1 text-slate-600">رقم الجوال *</label>
                  <input required dir="ltr" value={data.phone} onChange={(e) => updateData("phone", e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg text-xs font-bold focus:border-blue-500 outline-none text-left" placeholder="05XXXXXXXX" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black mb-1 text-slate-600">كلمة المرور {modal.mode === "edit" && <span className="text-slate-400 font-normal">(اتركها فارغة لعدم التغيير)</span>}</label>
                  <input type="text" dir="ltr" required={modal.mode === "create"} value={data.password || ""} onChange={(e) => updateData("password", e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg text-xs font-bold focus:border-blue-500 outline-none text-left" placeholder="********" />
                </div>
              </div>
            </div>

            {/* Section 2: Personal Names & Details */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                  <User className="w-4 h-4" /> البيانات الشخصية (الاسم الرباعي)
                </h4>
                {/* مفاتيح التحكم بالخصوصية */}
                <div className="flex gap-4">
                   <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600 cursor-pointer hover:text-blue-600">
                     <input type="checkbox" checked={data.isPhotoVisible ?? true} onChange={(e) => updateData("isPhotoVisible", e.target.checked)} className="accent-blue-600" /> عرض الصورة
                   </label>
                   <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600 cursor-pointer hover:text-blue-600">
                     <input type="checkbox" checked={data.isAgeVisible ?? true} onChange={(e) => updateData("isAgeVisible", e.target.checked)} className="accent-blue-600" /> إظهار العمر
                   </label>
                </div>
              </div>

              {/* الأسماء بالعربية */}
              <div className="grid grid-cols-4 gap-2 mb-3">
                <div>
                  <label className="block text-[9px] font-bold mb-1 text-slate-500">الاسم الأول (عربي) *</label>
                  <input required value={data.firstNameAr || ""} onChange={(e) => updateData("firstNameAr", e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-bold outline-none focus:border-blue-400" />
                </div>
                <div>
                  <label className="block text-[9px] font-bold mb-1 text-slate-500">اسم الأب</label>
                  <input value={data.secondNameAr || ""} onChange={(e) => updateData("secondNameAr", e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-bold outline-none focus:border-blue-400" />
                </div>
                <div>
                  <label className="block text-[9px] font-bold mb-1 text-slate-500">اسم الجد</label>
                  <input value={data.thirdNameAr || ""} onChange={(e) => updateData("thirdNameAr", e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-bold outline-none focus:border-blue-400" />
                </div>
                <div>
                  <label className="block text-[9px] font-bold mb-1 text-slate-500">العائلة *</label>
                  <input required value={data.fourthNameAr || ""} onChange={(e) => updateData("fourthNameAr", e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-bold outline-none focus:border-blue-400" />
                </div>
              </div>

              {/* الأسماء بالإنجليزية */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                <div>
                  <label className="block text-[9px] font-bold mb-1 text-slate-500 text-right">First Name</label>
                  <input value={data.firstNameEn || ""} onChange={(e) => updateData("firstNameEn", e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-bold outline-none focus:border-blue-400 text-left" />
                </div>
                <div>
                  <label className="block text-[9px] font-bold mb-1 text-slate-500 text-right">Father Name</label>
                  <input value={data.secondNameEn || ""} onChange={(e) => updateData("secondNameEn", e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-bold outline-none focus:border-blue-400 text-left" />
                </div>
                <div>
                  <label className="block text-[9px] font-bold mb-1 text-slate-500 text-right">Grandfather</label>
                  <input value={data.thirdNameEn || ""} onChange={(e) => updateData("thirdNameEn", e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-bold outline-none focus:border-blue-400 text-left" />
                </div>
                <div>
                  <label className="block text-[9px] font-bold mb-1 text-slate-500 text-right">Family Name</label>
                  <input value={data.fourthNameEn || ""} onChange={(e) => updateData("fourthNameEn", e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-bold outline-none focus:border-blue-400 text-left" />
                </div>
              </div>

              {/* الميلاد والجنسية */}
              <div className="grid grid-cols-4 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[10px] font-black mb-1 text-slate-600">تاريخ الميلاد</label>
                  <input type="date" value={data.birthDate ? data.birthDate.split('T')[0] : ""} onChange={(e) => updateData("birthDate", e.target.value)} className="w-full p-1.5 border border-slate-300 rounded text-[11px] font-bold outline-none" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[10px] font-black mb-1 text-slate-600">العمر</label>
                  <div className="w-full p-1.5 bg-slate-200 border border-slate-300 rounded text-[11px] font-bold text-center text-slate-500 flex items-center justify-center gap-2">
                     {calculateAge(data.birthDate)} سنة
                     {!(data.isAgeVisible ?? true) && <EyeOff size={12} className="text-red-400" title="مخفي في الملف الشخصي" />}
                  </div>
                </div>
                <div className="col-span-4 sm:col-span-2">
                  <label className="block text-[10px] font-black mb-1 text-slate-600">الجنسية</label>
                  <input value={data.nationality || ""} onChange={(e) => updateData("nationality", e.target.value)} className="w-full p-1.5 border border-slate-300 rounded text-[11px] font-bold outline-none" placeholder="سعودي، مصري، أردني..." />
                </div>
              </div>
            </div>

            {/* Section 3: Work Info */}
            <div className="bg-emerald-50/30 p-4 rounded-xl border border-emerald-200 shadow-sm">
              <div className="flex items-center justify-between border-b border-emerald-100 pb-2 mb-3">
                <h4 className="text-xs font-black text-emerald-800 flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4" /> التسكين الوظيفي والتواريخ
                </h4>
                <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600 cursor-pointer hover:text-emerald-700">
                  <input type="checkbox" checked={data.isInternalTitleVisible ?? true} onChange={(e) => updateData("isInternalTitleVisible", e.target.checked)} className="accent-emerald-600" /> إظهار المسمى الداخلي
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div className="md:col-span-1">
                  <label className="block text-[10px] font-black mb-1 text-emerald-900">القسم / الإدارة *</label>
                  <select required value={data.department} onChange={(e) => updateData("department", e.target.value)} className="w-full p-2 border border-emerald-200 rounded-lg text-xs font-bold bg-white focus:border-emerald-500 outline-none">
                    <option value="">-- اختر --</option>
                    {DEPARTMENTS.map((dept) => <option key={dept} value={dept}>{dept}</option>)}
                  </select>
                </div>
                <div className="md:col-span-1">
                  <label className="block text-[10px] font-black mb-1 text-emerald-900">المسمى الداخلي للمكتب *</label>
                  <select required value={data.position} onChange={(e) => updateData("position", e.target.value)} className="w-full p-2 border border-emerald-200 rounded-lg text-xs font-bold bg-white focus:border-emerald-500 outline-none">
                    <option value="">-- اختر --</option>
                    {POSITIONS.map((pos) => <option key={pos} value={pos}>{pos}</option>)}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black mb-1 text-emerald-900">المسمى الوظيفي الرسمي (قوى / التأمينات)</label>
                  <input value={data.qiwaPosition || ""} onChange={(e) => updateData("qiwaPosition", e.target.value)} className="w-full p-2 border border-emerald-200 rounded-lg text-xs font-bold focus:border-emerald-500 outline-none" placeholder="كما هو مسجل في المنصات الرسمية" />
                </div>
                
                {/* التواريخ */}
                <div className="md:col-span-2 bg-white p-2 rounded-lg border border-emerald-100 flex gap-3">
                   <div className="flex-1">
                      <label className="block text-[9px] font-bold mb-1 text-slate-500"><Calendar className="inline w-3 h-3 mr-1"/> تاريخ توقيع العقد *</label>
                      <input required type="date" value={data.hireDate ? data.hireDate.split('T')[0] : ""} onChange={(e) => updateData("hireDate", e.target.value)} className="w-full p-1.5 border border-slate-200 rounded text-[11px] outline-none focus:border-emerald-400" />
                   </div>
                   <div className="flex-1">
                      <label className="block text-[9px] font-bold mb-1 text-slate-500"><Calendar className="inline w-3 h-3 mr-1"/> تاريخ المباشرة الفعلي</label>
                      <input type="date" value={data.actualStartDate ? data.actualStartDate.split('T')[0] : ""} onChange={(e) => updateData("actualStartDate", e.target.value)} className="w-full p-1.5 border border-slate-200 rounded text-[11px] outline-none focus:border-emerald-400" />
                   </div>
                </div>
              </div>
            </div>

            {/* Section 4: National Address */}
            <div className="bg-amber-50/30 p-4 rounded-xl border border-amber-200 shadow-sm">
              <h4 className="text-xs font-black text-amber-800 mb-3 flex items-center gap-1.5 border-b border-amber-100 pb-2">
                <MapPin className="w-4 h-4" /> تفاصيل العنوان الوطني
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                <div className="col-span-2">
                  <label className="block text-[10px] font-black mb-1 text-amber-900">العنوان المختصر</label>
                  <input value={data.shortAddress || ""} onChange={handleShortAddressChange} dir="ltr" className="w-full p-2 border border-amber-200 rounded-lg text-xs font-bold focus:border-amber-500 outline-none text-left tracking-widest placeholder:text-amber-200" placeholder="RRRD2929" />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-black mb-1 text-amber-900">المدينة</label>
                  <input value={data.cityAr || ""} onChange={(e) => updateData("cityAr", e.target.value)} className="w-full p-2 border border-amber-200 rounded-lg text-xs font-bold focus:border-amber-500 outline-none" placeholder="الرياض" />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-black mb-1 text-amber-900">الحي</label>
                  <input value={data.districtAr || ""} onChange={(e) => updateData("districtAr", e.target.value)} className="w-full p-2 border border-amber-200 rounded-lg text-xs font-bold focus:border-amber-500 outline-none" placeholder="الملقا" />
                </div>
                <div className="col-span-3 sm:col-span-2">
                  <label className="block text-[10px] font-black mb-1 text-amber-900">اسم الشارع</label>
                  <input value={data.streetNameAr || ""} onChange={(e) => updateData("streetNameAr", e.target.value)} className="w-full p-2 border border-amber-200 rounded-lg text-xs font-bold focus:border-amber-500 outline-none" placeholder="طريق أنس بن مالك" />
                </div>
                <div className="col-span-1">
                  <label className="block text-[10px] font-black mb-1 text-amber-900">رقم المبنى</label>
                  <input value={data.buildingNumber || ""} onChange={(e) => updateData("buildingNumber", e.target.value)} dir="ltr" className="w-full p-2 border border-amber-200 rounded-lg text-xs font-bold focus:border-amber-500 outline-none text-center" placeholder="1234" />
                </div>
                <div className="col-span-1">
                  <label className="block text-[10px] font-black mb-1 text-amber-900">الرمز البريدي</label>
                  <input value={data.postalCode || ""} onChange={(e) => updateData("postalCode", e.target.value)} dir="ltr" className="w-full p-2 border border-amber-200 rounded-lg text-xs font-bold focus:border-amber-500 outline-none text-center" placeholder="13521" />
                </div>
                <div className="col-span-1">
                  <label className="block text-[10px] font-black mb-1 text-amber-900">الرقم الإضافي</label>
                  <input value={data.additionalNumber || ""} onChange={(e) => updateData("additionalNumber", e.target.value)} dir="ltr" className="w-full p-2 border border-amber-200 rounded-lg text-xs font-bold focus:border-amber-500 outline-none text-center" placeholder="5678" />
                </div>
                <div className="col-span-1 border-r border-amber-100 pr-2">
                  <label className="block text-[10px] font-black mb-1 text-slate-400">رقم الوحدة/الدور</label>
                  <div className="flex gap-1">
                    <input value={data.unitNumber || ""} onChange={(e) => updateData("unitNumber", e.target.value)} className="w-1/2 p-1.5 border border-amber-200 rounded text-[10px] text-center outline-none" placeholder="وحدة" />
                    <input value={data.floorNumber || ""} onChange={(e) => updateData("floorNumber", e.target.value)} className="w-1/2 p-1.5 border border-amber-200 rounded text-[10px] text-center outline-none" placeholder="دور" />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 5: Roles & Permissions */}
            <div className="bg-purple-50/30 p-4 rounded-xl border border-purple-200 shadow-sm">
              <h4 className="text-xs font-black text-purple-800 mb-2.5 flex items-center gap-1.5">
                <KeyRound className="w-4 h-4" /> الأدوار والصلاحيات (تراكمية) *
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 bg-white p-3 rounded-xl border border-purple-100 max-h-40 overflow-y-auto custom-scrollbar">
                {roles.map((r) => (
                  <label key={r.id} className={`flex items-start gap-2 p-2 rounded-lg cursor-pointer transition-colors border ${data.roleIds?.includes(r.id) ? "bg-purple-50 border-purple-300 shadow-sm" : "hover:bg-slate-50 border-transparent"}`}>
                    <input type="checkbox" checked={data.roleIds?.includes(r.id) || false} onChange={() => handleRoleToggle(r.id)} className="mt-1 w-4 h-4 text-purple-600 rounded cursor-pointer accent-purple-600" />
                    <div>
                      <div className={`text-xs font-black ${data.roleIds?.includes(r.id) ? "text-purple-800" : "text-slate-700"}`}>{r.nameAr}</div>
                      <div className="text-[9px] font-bold text-slate-500 leading-tight line-clamp-2 mt-0.5">{r.description}</div>
                    </div>
                  </label>
                ))}
              </div>
              {(!data.roleIds || data.roleIds.length === 0) && <div className="text-[10px] text-red-500 mt-2 font-black">⚠️ يجب اختيار دور واحد على الأقل لمنح الموظف صلاحية الدخول</div>}
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-white flex gap-3 shrink-0 shadow-[0_-4px_10px_rgba(0,0,0,0.02)] z-10">
          <button type="button" onClick={() => setModal({ ...modal, isOpen: false })} className="px-6 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-black hover:bg-slate-200 transition-colors">
            إلغاء
          </button>
          <button type="submit" form="empForm" disabled={isPending} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-black flex justify-center items-center gap-2 shadow-md shadow-blue-200 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:translate-y-0">
            {isPending ? <Loader2 className="animate-spin w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
            اعتماد وحفظ بيانات الموظف
          </button>
        </div>
      </div>
    </div>
  );
}