import React, { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getEmployees, createEmployee, deleteEmployee, toggleEmployeeStatus, 
  getRoles, getPermissions, updateRolePermissions, createRole // 👈 تأكد من استيراد createRole
} from "../../api/employeeApi";
import {
  Users, Shield, Search, Plus, Edit, Trash2, CheckCircle, X, Loader2,
  Lock, Mail, User, BadgeAlert, ShieldCheck, Phone, Briefcase, Building, 
  CreditCard, KeyRound, Check, Layers, Monitor, ChevronDown, CheckSquare, Square
} from "lucide-react";
import { toast } from "sonner";

const EmployeesManagement = () => {
  const queryClient = useQueryClient();

  // ==========================================
  // States
  // ==========================================
  const [activeTab, setActiveTab] = useState("employees"); // 'employees' | 'roles'
  const [searchTerm, setSearchTerm] = useState("");
  const [roleSearchTerm, setRoleSearchTerm] = useState("");
  
  // حالات موظف جديد
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "", email: "", password: "", nationalId: "", phone: "",
    position: "", department: "", hireDate: new Date().toISOString().split("T")[0],
    type: "full-time", roleId: "",
  });

  // 👈 حالات إنشاء دور وظيفي جديد
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [roleFormData, setRoleFormData] = useState({ nameAr: "", description: "" });
  const [newRolePermissions, setNewRolePermissions] = useState([]); // الصلاحيات المحددة للدور الجديد

  // حالات شاشة تفاصيل الأدوار
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedPermissions, setSelectedPermissions] = useState([]); 

  // ==========================================
  // Queries
  // ==========================================
  const { data: employees = [], isLoading: isLoadingEmployees } = useQuery({ 
    queryKey: ["employees"], queryFn: getEmployees 
  });

  const { data: roles = [], isLoading: isLoadingRoles } = useQuery({ 
    queryKey: ["roles"], queryFn: getRoles 
  });

  const { data: allPermissions = [] } = useQuery({ 
    queryKey: ["permissions"], queryFn: getPermissions 
  });

  // ==========================================
  // Mutations
  // ==========================================
  // (تم اختصارها للتركيز على الأدوار - نفس الدوال السابقة)
  const createEmpMutation = useMutation({
    mutationFn: createEmployee,
    onSuccess: () => { toast.success("تم إضافة الموظف"); queryClient.invalidateQueries(["employees"]); setIsModalOpen(false); },
  });

  const deleteEmpMutation = useMutation({
    mutationFn: deleteEmployee,
    onSuccess: () => { toast.success("تم الحذف"); queryClient.invalidateQueries(["employees"]); },
  });

  const updateRoleMutation = useMutation({
    mutationFn: updateRolePermissions,
    onSuccess: () => { toast.success("تم تحديث الصلاحيات"); queryClient.invalidateQueries(["roles"]); },
  });

  // 👈 إضافة Mutation لإنشاء الدور الجديد
  const createRoleMutation = useMutation({
    mutationFn: createRole,
    onSuccess: () => { 
      toast.success("تم إنشاء الدور الوظيفي بنجاح!"); 
      queryClient.invalidateQueries(["roles"]); 
      setIsRoleModalOpen(false);
      setRoleFormData({ nameAr: "", description: "" });
      setNewRolePermissions([]);
    },
    onError: (err) => toast.error(err.response?.data?.message || "فشل إنشاء الدور")
  });

  // ==========================================
  // Logic & Grouping (الهيكلة الهرمية للصلاحيات)
  // ==========================================
  
  // 👈 دالة سحرية لتحويل مصفوفة الصلاحيات إلى (شاشة -> تاب -> حقل)
  const structuredPermissions = useMemo(() => {
    if (!Array.isArray(allPermissions)) return {};
    
    const structure = {};
    
    allPermissions.forEach(perm => {
      const screen = perm.screenName || "إعدادات عامة";
      const tab = perm.tabName || "إجراءات أساسية";
      
      if (!structure[screen]) structure[screen] = {};
      if (!structure[screen][tab]) structure[screen][tab] = [];
      
      structure[screen][tab].push(perm);
    });
    
    return structure;
  }, [allPermissions]);

  // تحديث الصلاحيات المحددة عند اختيار دور من القائمة
  useEffect(() => {
    if (selectedRole && selectedRole.permissions) {
      setSelectedPermissions(selectedRole.permissions.map(p => p.id));
    } else {
      setSelectedPermissions([]);
    }
  }, [selectedRole]);

  // دوال تحديد صلاحيات الدور الجديد
  const toggleNewRolePermission = (permId) => {
    setNewRolePermissions(prev => 
      prev.includes(permId) ? prev.filter(id => id !== permId) : [...prev, permId]
    );
  };

  // 👈 تحديد كل الصلاحيات داخل تاب معين دفعة واحدة (اختصار للوقت)
  const toggleAllInTab = (tabPermissions, isSelectedAll) => {
    const tabPermIds = tabPermissions.map(p => p.id);
    if (isSelectedAll) {
      setNewRolePermissions(prev => prev.filter(id => !tabPermIds.includes(id)));
    } else {
      setNewRolePermissions(prev => Array.from(new Set([...prev, ...tabPermIds])));
    }
  };

  const handleCreateRoleSubmit = (e) => {
    e.preventDefault();
    if (!roleFormData.nameAr) return toast.error("اسم الدور مطلوب");
    if (newRolePermissions.length === 0) return toast.error("يجب تحديد صلاحية واحدة على الأقل");
    
    createRoleMutation.mutate({
      ...roleFormData,
      permissions: newRolePermissions
    });
  };

  // فلترة الموظفين (لجدول الموظفين)
  const filteredEmployees = useMemo(() => { /* ... كود الفلترة السابق ... */ return employees; }, [employees, searchTerm]);
  const stats = { total: employees.length, active: employees.length, inactive: 0, remaining: 50 };

  // ==========================================
  // 👈 نافذة إنشاء دور جديد (Modal)
  // ==========================================
  const renderCreateRoleModal = () => {
    if (!isRoleModalOpen) return null;

    return (
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 md:p-6 animate-in fade-in duration-200" dir="rtl">
        <div className="bg-white rounded-2xl w-full max-w-5xl shadow-2xl flex flex-col max-h-[95vh] animate-in zoom-in-95">
          
          {/* Header */}
          <div className="p-5 border-b border-slate-200 bg-slate-50 rounded-t-2xl flex justify-between items-center shrink-0">
            <div>
              <h3 className="font-black text-xl text-slate-800 flex items-center gap-2">
                <Shield className="w-6 h-6 text-indigo-600" /> بناء دور وظيفي جديد
              </h3>
              <p className="text-xs text-slate-500 mt-1">قم بتسمية الدور وتحديد نطاق وصوله للشاشات والتابات والحقول.</p>
            </div>
            <button onClick={() => setIsRoleModalOpen(false)} className="p-2 text-slate-400 hover:bg-slate-200 rounded-lg transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {/* Body (Scrollable) */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-slate-50/50">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* القسم الأيمن: البيانات الأساسية للدور */}
              <div className="lg:col-span-4 space-y-4">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm sticky top-0">
                  <h4 className="font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">بيانات الدور</h4>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">مسمى الدور (عربي) *</label>
                    <input 
                      type="text" required value={roleFormData.nameAr} onChange={e => setRoleFormData({...roleFormData, nameAr: e.target.value})}
                      className="w-full p-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:border-indigo-500 bg-slate-50 focus:bg-white transition-colors" 
                      placeholder="مثال: مراجع قانوني"
                    />
                  </div>
                  <div className="mt-4">
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">وصف مهام الدور</label>
                    <textarea 
                      value={roleFormData.description} onChange={e => setRoleFormData({...roleFormData, description: e.target.value})}
                      className="w-full p-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:border-indigo-500 bg-slate-50 focus:bg-white resize-none h-24" 
                      placeholder="وصف مختصر للمهام التي يقوم بها هذا الدور..."
                    />
                  </div>
                  <div className="mt-4 p-3 bg-indigo-50 border border-indigo-100 rounded-lg text-xs text-indigo-700 font-bold">
                    إجمالي الصلاحيات المحددة: <span className="text-lg bg-white px-2 py-0.5 rounded shadow-sm mx-1">{newRolePermissions.length}</span>
                  </div>
                </div>
              </div>

              {/* القسم الأيسر: شجرة الصلاحيات (Screens > Tabs > Fields) */}
              <div className="lg:col-span-8 space-y-6">
                <h4 className="font-black text-slate-800 text-lg flex items-center gap-2">
                  <Layers className="w-5 h-5 text-indigo-500" /> هيكل صلاحيات النظام
                </h4>

                {Object.keys(structuredPermissions).length === 0 ? (
                   <div className="p-10 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
                     <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-400 mb-3"/>
                     جاري تحميل خريطة النظام...
                   </div>
                ) : (
                  Object.entries(structuredPermissions).map(([screenName, tabs]) => (
                    <div key={screenName} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                      {/* هيدر الشاشة */}
                      <div className="bg-slate-800 text-white px-5 py-3 flex items-center gap-2 font-bold">
                        <Monitor className="w-5 h-5 text-indigo-300" />
                        شاشة: {screenName}
                      </div>

                      {/* تابات الشاشة */}
                      <div className="p-4 space-y-4 bg-slate-50/50">
                        {Object.entries(tabs).map(([tabName, permissions]) => {
                          const isAllSelected = permissions.every(p => newRolePermissions.includes(p.id));
                          const isSomeSelected = permissions.some(p => newRolePermissions.includes(p.id)) && !isAllSelected;

                          return (
                            <div key={tabName} className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                              {/* هيدر التاب */}
                              <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex justify-between items-center">
                                <span className="font-bold text-slate-700 text-sm flex items-center gap-1.5">
                                  <Layers className="w-4 h-4 text-slate-400" /> تاب: {tabName}
                                </span>
                                <button 
                                  type="button"
                                  onClick={() => toggleAllInTab(permissions, isAllSelected)}
                                  className={`text-[10px] font-bold px-2 py-1 rounded transition-colors flex items-center gap-1 ${isAllSelected ? "bg-indigo-100 text-indigo-700 hover:bg-indigo-200" : "bg-white border border-slate-300 text-slate-600 hover:bg-slate-50"}`}
                                >
                                  {isAllSelected ? <CheckSquare className="w-3.5 h-3.5" /> : isSomeSelected ? <Square className="w-3.5 h-3.5 text-indigo-400 fill-indigo-100" /> : <Square className="w-3.5 h-3.5" />}
                                  {isAllSelected ? "إلغاء تحديد الكل" : "تحديد الكل"}
                                </button>
                              </div>

                              {/* حقول وإجراءات التاب */}
                              <div className="p-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {permissions.map(perm => (
                                  <label key={perm.id} className={`flex items-start gap-2.5 p-2 rounded-lg cursor-pointer border transition-all ${newRolePermissions.includes(perm.id) ? "bg-indigo-50/50 border-indigo-200" : "bg-transparent border-transparent hover:bg-slate-50"}`}>
                                    <div className="relative flex items-center justify-center w-4 h-4 mt-0.5 shrink-0">
                                      <input 
                                        type="checkbox" className="peer sr-only" 
                                        checked={newRolePermissions.includes(perm.id)}
                                        onChange={() => toggleNewRolePermission(perm.id)} 
                                      />
                                      <div className="w-4 h-4 border border-slate-300 rounded peer-checked:bg-indigo-600 peer-checked:border-indigo-600 transition-colors flex items-center justify-center bg-white">
                                        <Check className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100" strokeWidth={4} />
                                      </div>
                                    </div>
                                    <div className="flex flex-col">
                                      <span className={`text-xs font-bold transition-colors ${newRolePermissions.includes(perm.id) ? "text-indigo-800" : "text-slate-700"}`}>
                                        {perm.name}
                                      </span>
                                      {/* عرض اسم برمجي مصغر للتوضيح (اختياري) */}
                                      <span className="text-[9px] text-slate-400 font-mono mt-0.5">{perm.actionType || perm.code}</span>
                                    </div>
                                  </label>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>

            </div>
          </div>

          {/* Footer */}
          <div className="p-5 border-t border-slate-200 bg-white rounded-b-2xl flex gap-3 justify-end shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <button onClick={() => setIsRoleModalOpen(false)} className="px-6 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors">
              إلغاء
            </button>
            <button 
              onClick={handleCreateRoleSubmit} disabled={createRoleMutation.isPending}
              className="px-8 py-2.5 bg-indigo-600 text-white font-bold rounded-xl shadow-md shadow-indigo-200 hover:bg-indigo-700 flex items-center gap-2 transition-all disabled:opacity-70"
            >
              {createRoleMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />} 
              حفظ واعتماد الدور
            </button>
          </div>

        </div>
      </div>
    );
  };

  // --- دوال الريندر للتابات الأساسية ---
  const renderEmployeesTab = () => (
    <div className="p-6">
       {/* استبدل هذا بنسخة جدول الموظفين الذي أرسلته لك سابقاً للحفاظ على الكود نظيفاً */}
       <div className="bg-white p-10 text-center rounded-xl border border-slate-200">هنا جدول الموظفين (موجود في الكود السابق)</div>
    </div>
  );

  const renderRolesTab = () => (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-300 h-[calc(100vh-220px)] p-6">
      {/* 1. قائمة الأدوار */}
      <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50">
          <button 
            onClick={() => setIsRoleModalOpen(true)} // 👈 فتح نافذة إنشاء دور
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-sm mb-4"
          >
            <Plus className="w-4 h-4" /> إنشاء دور وظيفي جديد
          </button>
          {/* ... باقي قائمة الأدوار ... */}
        </div>
      </div>

      {/* 2. عرض تفاصيل الصلاحيات للدور المختار */}
      <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col overflow-hidden">
         {/* ... تفاصيل الدور المحدد (موجود في الكود السابق) ... */}
      </div>
    </div>
  );

  return (
    <div className="flex-1 overflow-hidden flex flex-col bg-slate-50" dir="rtl">
      {/* Header & Tabs */}
      <div className="bg-white border-b border-slate-200 px-4 md:px-8 pt-6 shrink-0 shadow-sm z-10 relative">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
              <ShieldCheck className="w-7 h-7 text-blue-600" /> إدارة الموظفين والصلاحيات
            </h1>
            <p className="text-slate-500 text-sm mt-1">تحكم كامل بحسابات فريق العمل ومستوى وصولهم للنظام</p>
          </div>
          {activeTab === "employees" && (
            <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-md shadow-blue-200">
              <Plus className="w-5 h-5" /> إضافة موظف جديد
            </button>
          )}
        </div>

        <div className="flex gap-6">
          <button onClick={() => setActiveTab("employees")} className={`pb-3 text-sm font-bold flex items-center gap-2 transition-colors border-b-4 ${activeTab === "employees" ? "border-blue-600 text-blue-700" : "border-transparent text-slate-500 hover:text-slate-700"}`}>
            <Users className="w-4 h-4" /> سجل الموظفين
          </button>
          <button onClick={() => setActiveTab("roles")} className={`pb-3 text-sm font-bold flex items-center gap-2 transition-colors border-b-4 ${activeTab === "roles" ? "border-blue-600 text-blue-700" : "border-transparent text-slate-500 hover:text-slate-700"}`}>
            <KeyRound className="w-4 h-4" /> الأدوار والصلاحيات
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto custom-scrollbar relative">
        {activeTab === "employees" ? renderEmployeesTab() : renderRolesTab()}
      </div>

      {/* نوافذ المودال */}
      {renderCreateRoleModal()}
    </div>
  );
};

export default EmployeesManagement;