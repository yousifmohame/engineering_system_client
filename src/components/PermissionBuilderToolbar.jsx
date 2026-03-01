import React, { useState, useEffect } from "react";
import { usePermissionBuilder } from "../context/PermissionBuilderContext";
import { useAuth } from "../context/AuthContext"; // 👈 1. استيراد سياق المصادقة
import { ShieldAlert, X } from "lucide-react";
import api from "../api/axios";

const PermissionBuilderToolbar = () => {
  const { isBuilderMode, setIsBuilderMode, activeRoleId, setActiveRoleId } = usePermissionBuilder();
  const [roles, setRoles] = useState([]);
  
  // 👈 2. جلب بيانات المستخدم الحالي
  const { user } = useAuth(); 

  // 👈 3. تحديد المدير العام بناءً على الإيميل (نفس الإيميل الذي استخدمناه في السايدبار)
  const isSuperAdmin = user?.email === "admin@wms.com"; // ⚠️ ضع إيميلك الحقيقي هنا

  // جلب الأدوار لملء القائمة المنسدلة
  useEffect(() => {
    // أضفنا شرط isSuperAdmin هنا لعدم استهلاك السيرفر بطلبات من موظفين عاديين
    if (isBuilderMode && isSuperAdmin) {
      api.get("/roles").then(res => setRoles(res.data)).catch(console.error);
    }
  }, [isBuilderMode, isSuperAdmin]);

  // 👈 4. السطر السحري الحامي: إذا لم يكن المدير، لا ترسم أي شيء إطلاقاً!
  if (!isSuperAdmin) {
    return null;
  }

  // ==========================================
  // من هنا ورايح، الأكواد لن تنفذ ولن تظهر إلا للمدير العام
  // ==========================================

  // الزر العائم لتفعيل وضع البناء
  if (!isBuilderMode) {
    return (
      <button 
        onClick={() => setIsBuilderMode(true)}
        className="fixed bottom-6 left-6 z-[9999] bg-slate-900 text-white p-3 rounded-full shadow-2xl flex items-center gap-2 hover:bg-slate-800 transition-all border border-slate-700"
        title="تفعيل وضع بناء الصلاحيات"
      >
        <ShieldAlert className="w-5 h-5 text-amber-400" />
      </button>
    );
  }

  // الشريط العلوي أثناء وضع البناء
  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] bg-slate-900 text-white p-3 shadow-2xl flex flex-wrap justify-between items-center border-b-4 border-red-500" dir="rtl">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 font-bold text-red-400 animate-pulse">
          <ShieldAlert className="w-5 h-5" /> وضع تعيين الصلاحيات نشط
        </div>
        
        <div className="h-6 w-px bg-slate-700 mx-2 hidden sm:block"></div>
        
        <div className="flex items-center gap-2 bg-slate-800 p-1.5 rounded-lg border border-slate-600">
          <span className="text-xs text-slate-300">اختر الدور المستهدف:</span>
          <select 
            value={activeRoleId}
            onChange={(e) => setActiveRoleId(e.target.value)}
            className="bg-white text-slate-900 text-sm font-bold p-1 rounded outline-none w-48"
          >
            <option value="" disabled>-- حدد الدور الوظيفي --</option>
            {roles.map(r => <option key={r.id} value={r.id}>{r.nameAr || r.name}</option>)}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-4 mt-2 sm:mt-0">
        <p className="text-xs text-slate-400 hidden md:block">
          (تصفح النظام بشكل طبيعي وانقر على أي عنصر محدد بإطار أحمر لتسجيله)
        </p>
        <button 
          onClick={() => { setIsBuilderMode(false); setActiveRoleId(""); }} 
          className="bg-red-600 hover:bg-red-700 p-1.5 px-3 rounded-lg flex items-center gap-1 text-sm font-bold transition-colors"
        >
          إغلاق <X className="w-4 h-4"/>
        </button>
      </div>
    </div>
  );
};

export default PermissionBuilderToolbar;