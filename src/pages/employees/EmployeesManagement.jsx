import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getRoles,
  createRole,
  updateRole,
  deleteRole,
  removePermissionFromRole,
} from "../../api/employeeApi";
import {
  Users,
  Shield,
  Search,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  X,
  Loader2,
  Lock,
  Mail,
  User,
  BadgeAlert,
  ShieldCheck,
  Phone,
  Briefcase,
  Building,
  CreditCard,
  KeyRound,
  Settings2,
  Layers,
  AlertCircle,
  CheckSquare,
} from "lucide-react";
import { toast } from "sonner";

// ==========================================
// ثوابت القوائم المنسدلة
// ==========================================
const DEPARTMENTS = [
  "الإدارة العليا",
  "الشؤون الهندسية والتصميم",
  "الإشراف والمواقع",
  "المبيعات والتسويق",
  "المالية والمحاسبة",
  "الموارد البشرية",
  "تقنية المعلومات",
  "خدمة العملاء",
];

const POSITIONS = [
  "مدير عام",
  "مدير مشروع",
  "مهندس معماري",
  "مهندس مدني / إنشائي",
  "مهندس كهرباء",
  "مهندس ميكانيكا",
  "رسام هندسي (أوتوكاد)",
  "مساح",
  "محاسب",
  "أخصائي موارد بشرية",
  "موظف استقبال",
  "مدخل بيانات",
];

// توليد الأرقام الوظيفية من 1001 إلى 1100
const EMPLOYEE_CODES = Array.from({ length: 100 }, (_, i) =>
  (1001 + i).toString(),
);

const initialEmpData = {
  employeeCode: "", // الرقم الوظيفي من القائمة
  name: "",
  email: "",
  password: "",
  nationalId: "",
  phone: "",
  position: "", // قائمة منسدلة
  qiwaPosition: "", // 👈 حقل مسمى قوى الجديد
  department: "", // قائمة منسدلة
  hireDate: new Date().toISOString().split("T")[0],
  type: "full-time",
  roleIds: [], // 👈 تحولت لمصفوفة لتدعم أكثر من دور
  status: "active",
};

const EmployeesManagement = () => {
  const queryClient = useQueryClient();

  // ==========================================
  // States
  // ==========================================
  const [activeTab, setActiveTab] = useState("employees");
  const [searchTerm, setSearchTerm] = useState("");
  const [roleSearchTerm, setRoleSearchTerm] = useState("");

  const [empModal, setEmpModal] = useState({
    isOpen: false,
    mode: "create",
    data: initialEmpData,
  });

  const [roleModal, setRoleModal] = useState({
    isOpen: false,
    mode: "create",
    data: { nameAr: "", description: "" },
  });
  const [selectedRole, setSelectedRole] = useState(null);

  // ==========================================
  // Queries
  // ==========================================
  const { data: employees = [], isLoading: isLoadingEmployees } = useQuery({
    queryKey: ["employees"],
    queryFn: getEmployees,
  });

  const { data: roles = [], isLoading: isLoadingRoles } = useQuery({
    queryKey: ["roles"],
    queryFn: getRoles,
  });

  // 👈 استخراج الأرقام الوظيفية المستخدمة حالياً لقفلها في القائمة
  const usedEmployeeCodes = useMemo(() => {
    if (!Array.isArray(employees)) return [];
    return employees.map((emp) => emp.employeeCode?.toString()).filter(Boolean);
  }, [employees]);

  // ==========================================
  // Mutations
  // ==========================================
  const empMutation = useMutation({
    mutationFn: (payload) =>
      empModal.mode === "create"
        ? createEmployee(payload)
        : updateEmployee({ id: empModal.data.id, data: payload }),
    onSuccess: () => {
      toast.success(
        empModal.mode === "create"
          ? "تم إضافة الموظف بنجاح"
          : "تم تعديل الموظف بنجاح",
      );
      queryClient.invalidateQueries(["employees"]);
      setEmpModal({ isOpen: false, mode: "create", data: initialEmpData });
    },
    onError: (err) =>
      toast.error(
        err.response?.data?.message ||
          "حدث خطأ في العملية. تأكد من عدم تكرار الإيميل أو الجوال.",
      ),
  });

  const deleteEmpMutation = useMutation({
    mutationFn: deleteEmployee,
    onSuccess: () => {
      toast.success("تم إيقاف الموظف بنجاح");
      queryClient.invalidateQueries(["employees"]);
    },
  });

  const roleMutation = useMutation({
    // ... (كود الأدوار كما هو)
    mutationFn: (payload) =>
      roleModal.mode === "create"
        ? createRole(payload)
        : updateRole({ id: roleModal.data.id, data: payload }),
    onSuccess: () => {
      toast.success(
        roleModal.mode === "create"
          ? "تم إنشاء الدور بنجاح"
          : "تم تحديث الدور بنجاح",
      );
      queryClient.invalidateQueries(["roles"]);
      setRoleModal({
        isOpen: false,
        mode: "create",
        data: { nameAr: "", description: "" },
      });
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "حدث خطأ في العملية"),
  });

  const deleteRoleMutation = useMutation({
    mutationFn: deleteRole,
    onSuccess: () => {
      toast.success("تم حذف الدور بنجاح");
      setSelectedRole(null);
      queryClient.invalidateQueries(["roles"]);
    },
    onError: () => toast.error("لا يمكن حذف الدور (قد يكون مرتبطاً بموظفين)"),
  });

  const removePermissionMutation = useMutation({
    mutationFn: removePermissionFromRole,
    onSuccess: () => {
      toast.success("تم إزالة الصلاحية من الدور");
      queryClient.invalidateQueries(["roles"]);
      if (selectedRole) queryClient.refetchQueries(["roles"]);
    },
  });

  // ==========================================
  // Handlers
  // ==========================================
  const filteredEmployees = useMemo(() => {
    if (!Array.isArray(employees)) return [];
    return employees.filter(
      (emp) =>
        emp.name?.includes(searchTerm) ||
        emp.employeeCode?.toString().includes(searchTerm) ||
        emp.nationalId?.includes(searchTerm) ||
        emp.phone?.includes(searchTerm),
    );
  }, [employees, searchTerm]);

  const stats = useMemo(
    () => ({
      total: Array.isArray(employees) ? employees.length : 0,
      active: Array.isArray(employees)
        ? employees.filter((e) => e.status === "active").length
        : 0,
      inactive: Array.isArray(employees)
        ? employees.filter((e) => e.status !== "active").length
        : 0,
      remaining: 50 - (Array.isArray(employees) ? employees.length : 0),
    }),
    [employees],
  );

  useMemo(() => {
    if (selectedRole) {
      const updated = roles.find((r) => r.id === selectedRole.id);
      if (updated) setSelectedRole(updated);
    }
  }, [roles]);

  const handleEmpSubmit = (e) => {
    e.preventDefault();
    if (empModal.data.roleIds.length === 0) {
      return toast.error("يرجى تحديد دور وظيفي واحد على الأقل للموظف");
    }
    if (!empModal.data.employeeCode) {
      return toast.error("يرجى تحديد الرقم الوظيفي");
    }
    empMutation.mutate(empModal.data);
  };

  const handleRoleSubmit = (e) => {
    e.preventDefault();
    if (!roleModal.data.nameAr) return toast.error("اسم الدور مطلوب");
    roleMutation.mutate(roleModal.data);
  };

  const openEditEmp = (emp) =>
    setEmpModal({
      isOpen: true,
      mode: "edit",
      data: {
        ...emp,
        password: "",
        qiwaPosition: emp.qiwaPosition || "", // ضمان وجود الحقل
        roleIds: emp.roles ? emp.roles.map((r) => r.id) : [], // 👈 جلب معرفات كل الأدوار
        hireDate: emp.hireDate
          ? new Date(emp.hireDate).toISOString().split("T")[0]
          : "",
      },
    });

  const openEditRole = (role) =>
    setRoleModal({ isOpen: true, mode: "edit", data: role });

  // 👈 دالة للتعامل مع الشيك بوكس الخاص بالأدوار
  const handleRoleToggle = (roleId) => {
    setEmpModal((prev) => {
      const currentRoles = prev.data.roleIds;
      if (currentRoles.includes(roleId)) {
        return {
          ...prev,
          data: {
            ...prev.data,
            roleIds: currentRoles.filter((id) => id !== roleId),
          },
        };
      } else {
        return {
          ...prev,
          data: { ...prev.data, roleIds: [...currentRoles, roleId] },
        };
      }
    });
  };

  // ==========================================
  // Renders
  // ==========================================

  const renderEmployeesTab = () => (
    <div className="space-y-6 animate-in fade-in duration-300 p-6">
      {/* الإحصائيات */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* ... (نفس الإحصائيات السابقة) ... */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-xs font-bold mb-1">
            إجمالي الموظفين
          </div>
          <div className="text-3xl font-black text-slate-800">
            {stats.total}
          </div>
        </div>
        <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100 shadow-sm">
          <div className="text-emerald-600 text-xs font-bold mb-1">
            حسابات نشطة
          </div>
          <div className="text-3xl font-black text-emerald-700">
            {stats.active}
          </div>
        </div>
        <div className="bg-red-50 p-5 rounded-2xl border border-red-100 shadow-sm">
          <div className="text-red-600 text-xs font-bold mb-1">
            حسابات موقوفة
          </div>
          <div className="text-3xl font-black text-red-700">
            {stats.inactive}
          </div>
        </div>
        <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100 shadow-sm">
          <div className="text-blue-600 text-xs font-bold mb-1">
            المقاعد المتبقية
          </div>
          <div className="text-3xl font-black text-blue-700 flex items-baseline gap-1">
            {stats.remaining} <span className="text-sm font-normal">/ 50</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="relative w-full max-w-md">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="ابحث بالاسم، الرقم الوظيفي، الهوية، الجوال..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-4 pr-10 py-2.5 bg-white border border-slate-300 rounded-xl text-sm outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-right text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
              <tr>
                <th className="p-4 font-bold">الرقم الوظيفي</th>
                <th className="p-4 font-bold">الموظف / الدخول</th>
                <th className="p-4 font-bold">المسمى (الداخلي / قوى)</th>
                <th className="p-4 font-bold">الأدوار والصلاحيات</th>
                <th className="p-4 font-bold text-center">الحالة</th>
                <th className="p-4 font-bold text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoadingEmployees ? (
                <tr>
                  <td colSpan="6" className="p-10 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500" />
                  </td>
                </tr>
              ) : filteredEmployees.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="p-10 text-center text-slate-500 font-bold"
                  >
                    لا يوجد موظفين
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => (
                  <tr
                    key={emp.id}
                    className="hover:bg-blue-50/50 transition-colors group"
                  >
                    <td className="p-4">
                      <span className="font-mono text-sm font-black text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
                        {emp.employeeCode ? `#${emp.employeeCode}` : "غير محدد"}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-800">
                            {emp.name}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                            {emp.email} | {emp.phone}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-700">
                        {emp.position}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        قوى:{" "}
                        <span className="text-slate-500">
                          {emp.qiwaPosition || "غير مسجل"}
                        </span>{" "}
                        | {emp.department}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {emp.roles && emp.roles.length > 0 ? (
                          emp.roles.map((r) => (
                            <span
                              key={r.id}
                              className="inline-flex items-center px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded text-[10px] font-bold"
                            >
                              {r.nameAr}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400">
                            بدون صلاحيات
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${emp.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}
                      >
                        {emp.status === "active" ? "نشط" : "موقوف"}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2 opacity-40 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEditEmp(emp)}
                          className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="تعديل"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm("إيقاف الموظف؟"))
                              deleteEmpMutation.mutate(emp.id);
                          }}
                          className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                          title="إيقاف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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

  const renderRolesTab = () => (
    // ... (نفس كود تبويب الأدوار السابق بدون تغيير) ...
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-300 h-[calc(100vh-220px)] p-6">
      {/* 1. قائمة الأدوار */}
      <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50">
          <button
            onClick={() =>
              setRoleModal({
                isOpen: true,
                mode: "create",
                data: { nameAr: "", description: "" },
              })
            }
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm mb-4"
          >
            <Plus className="w-4 h-4" /> إنشاء دور وظيفي
          </button>
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="بحث في الأدوار..."
              value={roleSearchTerm}
              onChange={(e) => setRoleSearchTerm(e.target.value)}
              className="w-full pl-4 pr-9 py-2 bg-white border border-slate-300 rounded-lg text-xs outline-none focus:border-blue-500"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1.5 bg-slate-50/50">
          {isLoadingRoles ? (
            <div className="p-10 flex justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            </div>
          ) : (
            roles
              .filter((r) => (r.nameAr || "").includes(roleSearchTerm))
              .map((role) => (
                <div key={role.id} className="flex gap-1 group">
                  <button
                    onClick={() => setSelectedRole(role)}
                    className={`flex-1 text-right p-3 rounded-xl border transition-all ${selectedRole?.id === role.id ? "bg-blue-50 border-blue-500 shadow-sm" : "bg-white border-transparent hover:border-slate-200"}`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span
                        className={`font-bold text-sm ${selectedRole?.id === role.id ? "text-blue-800" : "text-slate-800"}`}
                      >
                        {role.nameAr}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {role._count?.employees || 0} مستخدم
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">
                      {role.description || "بدون وصف"}
                    </div>
                  </button>
                  <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity px-1">
                    <button
                      onClick={() => openEditRole(role)}
                      className="p-1.5 bg-white border border-slate-200 text-blue-600 rounded hover:bg-blue-50"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm("حذف الدور بالكامل؟"))
                          deleteRoleMutation.mutate(role.id);
                      }}
                      className="p-1.5 bg-white border border-slate-200 text-red-600 rounded hover:bg-red-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
          )}
        </div>
      </div>

      {/* 2. تفاصيل الصلاحيات */}
      <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col overflow-hidden">
        {selectedRole ? (
          <>
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-gradient-to-l from-slate-50 to-white">
              <div>
                <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-amber-500" />{" "}
                  {selectedRole.nameAr}
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  {selectedRole.description}
                </p>
              </div>
              <div className="text-xs bg-amber-100 text-amber-800 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" /> إجمالي الصلاحيات:{" "}
                {selectedRole.permissions?.length || 0}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-slate-50">
              <div className="mb-4 flex items-start gap-3 bg-blue-50 p-4 rounded-xl border border-blue-200">
                <AlertCircle className="w-5 h-5 text-blue-600 shrink-0" />
                <div className="text-sm text-blue-800">
                  <strong>كيف أضيف صلاحيات جديدة؟</strong> يتم إضافة الصلاحيات
                  لهذا الدور بشكل مرئي وديناميكي عبر النقر على زر{" "}
                  <strong>"وضع البناء"</strong> الموجود أسفل يسار الشاشة أثناء
                  تصفح النظام.
                </div>
              </div>

              {selectedRole.permissions?.length === 0 ? (
                <div className="text-center p-10 text-slate-400">
                  لا توجد صلاحيات مسجلة لهذا الدور حتى الآن.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedRole.permissions?.map((perm) => (
                    <div
                      key={perm.id}
                      className="bg-white p-3 rounded-xl border border-slate-200 flex justify-between items-center shadow-sm group hover:border-blue-300 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-50 rounded-lg">
                          <Layers className="w-4 h-4 text-indigo-500" />
                        </div>
                        <div>
                          <div className="font-bold text-sm text-slate-800">
                            {perm.name}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            شاشة: {perm.screenName || "عام"} | كود: {perm.code}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          if (window.confirm(`إزالة صلاحية ${perm.name}؟`))
                            removePermissionMutation.mutate({
                              roleId: selectedRole.id,
                              permissionId: perm.id,
                            });
                        }}
                        className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="إزالة الصلاحية"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <Settings2 className="w-16 h-16 mb-4 opacity-20" />
            <div className="text-lg font-bold text-slate-600">
              اختر دوراً وظيفياً من القائمة
            </div>
            <p className="text-sm mt-1">لعرض الصلاحيات المرتبطة به وإدارتها</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex-1 overflow-hidden flex flex-col bg-slate-50" dir="rtl">
      {/* Header & Tabs */}
      <div className="bg-white border-b border-slate-200 px-4 md:px-8 pt-6 shrink-0 shadow-sm z-10 relative">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-blue-600" /> إدارة الموظفين
            والصلاحيات
          </h1>
          {activeTab === "employees" && (
            <button
              onClick={() =>
                setEmpModal({
                  isOpen: true,
                  mode: "create",
                  data: initialEmpData,
                })
              }
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-md"
            >
              <Plus className="w-5 h-5" /> إضافة موظف
            </button>
          )}
        </div>
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab("employees")}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-4 ${activeTab === "employees" ? "border-blue-600 text-blue-700" : "border-transparent text-slate-500 hover:text-slate-700"}`}
          >
            <Users className="w-4 h-4" /> سجل الموظفين
          </button>
          <button
            onClick={() => setActiveTab("roles")}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-4 ${activeTab === "roles" ? "border-blue-600 text-blue-700" : "border-transparent text-slate-500 hover:text-slate-700"}`}
          >
            <KeyRound className="w-4 h-4" /> الأدوار والصلاحيات
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar relative">
        {activeTab === "employees" ? renderEmployeesTab() : renderRolesTab()}
      </div>

      {/* Modal: الموظفين */}
      {empModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl flex flex-col max-h-[95vh] animate-in zoom-in-95">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0 rounded-t-2xl">
              <div>
                <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />{" "}
                  {empModal.mode === "create"
                    ? "إضافة موظف جديد"
                    : "تعديل بيانات الموظف"}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  ملاحظة: يمكن للموظف تسجيل الدخول باستخدام (الإيميل، رقم
                  الجوال، أو الرقم الوظيفي)
                </p>
              </div>
              <button
                onClick={() => setEmpModal({ ...empModal, isOpen: false })}
                className="p-2 bg-slate-200 hover:bg-slate-300 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-slate-600" />
              </button>
            </div>

            <div className="overflow-y-auto p-6 custom-scrollbar">
              <form
                id="empForm"
                onSubmit={handleEmpSubmit}
                className="space-y-5"
              >
                {/* القسم الأول: بيانات الدخول والأساسيات */}
                <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                  <h4 className="text-sm font-black text-slate-700 mb-3 flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-500" /> البيانات الأساسية
                    وبيانات الدخول
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-1">
                      <label className="block text-[11px] font-bold mb-1.5 text-slate-600">
                        الرقم الوظيفي (للدخول) *
                      </label>
                      <select
                        required
                        value={empModal.data.employeeCode}
                        onChange={(e) =>
                          setEmpModal({
                            ...empModal,
                            data: {
                              ...empModal.data,
                              employeeCode: e.target.value,
                            },
                          })
                        }
                        className="w-full p-2.5 border border-slate-300 rounded-lg text-sm bg-white font-mono focus:border-blue-500 outline-none"
                      >
                        <option value="">-- اختر رقم --</option>
                        {EMPLOYEE_CODES.map((code) => {
                          // تحقق هل الرقم مستخدم من موظف آخر
                          const isUsed =
                            usedEmployeeCodes.includes(code) &&
                            empModal.data.employeeCode !== code;
                          return (
                            <option
                              key={code}
                              value={code}
                              disabled={isUsed}
                              className={
                                isUsed ? "text-slate-300" : "text-slate-800"
                              }
                            >
                              {code} {isUsed ? "(غير متاح)" : ""}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[11px] font-bold mb-1.5 text-slate-600">
                        الاسم الكامل *
                      </label>
                      <input
                        required
                        value={empModal.data.name}
                        onChange={(e) =>
                          setEmpModal({
                            ...empModal,
                            data: { ...empModal.data, name: e.target.value },
                          })
                        }
                        className="w-full p-2.5 border border-slate-300 rounded-lg text-sm focus:border-blue-500 outline-none"
                        placeholder="الاسم الرباعي"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold mb-1.5 text-slate-600">
                        البريد الإلكتروني (للدخول) *
                      </label>
                      <input
                        required
                        type="email"
                        dir="ltr"
                        value={empModal.data.email}
                        onChange={(e) =>
                          setEmpModal({
                            ...empModal,
                            data: { ...empModal.data, email: e.target.value },
                          })
                        }
                        className="w-full p-2.5 border border-slate-300 rounded-lg text-sm text-left focus:border-blue-500 outline-none"
                        placeholder="email@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold mb-1.5 text-slate-600">
                        رقم الجوال (للدخول) *
                      </label>
                      <input
                        required
                        dir="ltr"
                        value={empModal.data.phone}
                        onChange={(e) =>
                          setEmpModal({
                            ...empModal,
                            data: { ...empModal.data, phone: e.target.value },
                          })
                        }
                        className="w-full p-2.5 border border-slate-300 rounded-lg text-sm text-left font-mono focus:border-blue-500 outline-none"
                        placeholder="9665XXXXXXXX"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold mb-1.5 text-slate-600">
                        كلمة المرور{" "}
                        {empModal.mode === "edit" && (
                          <span className="text-slate-400 font-normal">
                            (اتركها فارغة لعدم التغيير)
                          </span>
                        )}
                      </label>
                      <input
                        type="text"
                        dir="ltr"
                        required={empModal.mode === "create"}
                        value={empModal.data.password}
                        onChange={(e) =>
                          setEmpModal({
                            ...empModal,
                            data: {
                              ...empModal.data,
                              password: e.target.value,
                            },
                          })
                        }
                        className="w-full p-2.5 border border-slate-300 rounded-lg text-sm text-left font-mono focus:border-blue-500 outline-none"
                        placeholder="********"
                      />
                    </div>
                  </div>
                </div>

                {/* القسم الثاني: بيانات العمل */}
                <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                  <h4 className="text-sm font-black text-slate-700 mb-3 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-emerald-500" /> التسكين
                    الوظيفي
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold mb-1.5 text-slate-600">
                        رقم الهوية الوطنية / الإقامة *
                      </label>
                      <input
                        required
                        dir="ltr"
                        value={empModal.data.nationalId}
                        onChange={(e) =>
                          setEmpModal({
                            ...empModal,
                            data: {
                              ...empModal.data,
                              nationalId: e.target.value,
                            },
                          })
                        }
                        className="w-full p-2.5 border border-slate-300 rounded-lg text-sm text-left font-mono focus:border-emerald-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold mb-1.5 text-slate-600">
                        القسم / الإدارة *
                      </label>
                      <select
                        required
                        value={empModal.data.department}
                        onChange={(e) =>
                          setEmpModal({
                            ...empModal,
                            data: {
                              ...empModal.data,
                              department: e.target.value,
                            },
                          })
                        }
                        className="w-full p-2.5 border border-slate-300 rounded-lg text-sm bg-white focus:border-emerald-500 outline-none"
                      >
                        <option value="">-- اختر القسم --</option>
                        {DEPARTMENTS.map((dept) => (
                          <option key={dept} value={dept}>
                            {dept}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold mb-1.5 text-slate-600">
                        المسمى الوظيفي (الداخلي) *
                      </label>
                      <select
                        required
                        value={empModal.data.position}
                        onChange={(e) =>
                          setEmpModal({
                            ...empModal,
                            data: {
                              ...empModal.data,
                              position: e.target.value,
                            },
                          })
                        }
                        className="w-full p-2.5 border border-slate-300 rounded-lg text-sm bg-white focus:border-emerald-500 outline-none"
                      >
                        <option value="">-- اختر المسمى --</option>
                        {POSITIONS.map((pos) => (
                          <option key={pos} value={pos}>
                            {pos}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="md:col-span-3">
                      <label className="block text-[11px] font-bold mb-1.5 text-slate-600">
                        المسمى الوظيفي في منصة (قوى){" "}
                        <span className="text-slate-400 font-normal">
                          اختياري
                        </span>
                      </label>
                      <input
                        value={empModal.data.qiwaPosition}
                        onChange={(e) =>
                          setEmpModal({
                            ...empModal,
                            data: {
                              ...empModal.data,
                              qiwaPosition: e.target.value,
                            },
                          })
                        }
                        className="w-full p-2.5 border border-slate-300 rounded-lg text-sm focus:border-emerald-500 outline-none"
                        placeholder="المسمى كما هو مسجل في العقود الحكومية..."
                      />
                    </div>
                  </div>
                </div>

                {/* القسم الثالث: الصلاحيات المتعددة */}
                <div className="bg-purple-50/30 p-4 rounded-xl border border-purple-100">
                  <h4 className="text-sm font-black text-purple-800 mb-2 flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-purple-600" /> الأدوار
                    والصلاحيات بالنظام *
                  </h4>
                  <p className="text-[10px] text-purple-600/80 mb-3">
                    يمكنك اختيار أكثر من دور وظيفي للموظف الواحد. الصلاحيات
                    ستكون تراكمية.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 bg-white p-3 rounded-lg border border-purple-100 max-h-40 overflow-y-auto custom-scrollbar">
                    {roles.map((r) => (
                      <label
                        key={r.id}
                        className={`flex items-start gap-2 p-2 rounded-lg cursor-pointer transition-colors border ${empModal.data.roleIds.includes(r.id) ? "bg-purple-50 border-purple-300" : "hover:bg-slate-50 border-transparent"}`}
                      >
                        <div className="pt-0.5">
                          <input
                            type="checkbox"
                            checked={empModal.data.roleIds.includes(r.id)}
                            onChange={() => handleRoleToggle(r.id)}
                            className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500 cursor-pointer"
                          />
                        </div>
                        <div>
                          <div
                            className={`text-xs font-bold ${empModal.data.roleIds.includes(r.id) ? "text-purple-800" : "text-slate-700"}`}
                          >
                            {r.nameAr}
                          </div>
                          <div className="text-[9px] text-slate-500 leading-tight mt-0.5 line-clamp-2">
                            {r.description}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                  {empModal.data.roleIds.length === 0 && (
                    <div className="text-[10px] text-red-500 mt-2 font-bold">
                      ⚠️ يجب اختيار دور واحد على الأقل
                    </div>
                  )}
                </div>
              </form>
            </div>

            <div className="p-5 border-t border-slate-100 bg-slate-50 flex gap-3 shrink-0 rounded-b-2xl">
              <button
                type="button"
                onClick={() => setEmpModal({ ...empModal, isOpen: false })}
                className="px-6 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-xl font-bold hover:bg-slate-100 transition-colors"
              >
                إلغاء
              </button>
              <button
                type="submit"
                form="empForm"
                disabled={empMutation.isPending}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex justify-center items-center gap-2 transition-colors shadow-md"
              >
                {empMutation.isPending ? (
                  <Loader2 className="animate-spin w-5 h-5" />
                ) : (
                  <CheckCircle className="w-5 h-5" />
                )}
                حفظ بيانات الموظف
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: الأدوار (لم يتغير) */}
      {roleModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-in zoom-in-95">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-indigo-600" />{" "}
                {roleModal.mode === "create"
                  ? "إنشاء دور وظيفي جديد"
                  : "تعديل اسم الدور"}
              </h3>
              <button
                onClick={() => setRoleModal({ ...roleModal, isOpen: false })}
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleRoleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1.5">
                  مسمى الدور (عربي) *
                </label>
                <input
                  required
                  value={roleModal.data.nameAr}
                  onChange={(e) =>
                    setRoleModal({
                      ...roleModal,
                      data: { ...roleModal.data, nameAr: e.target.value },
                    })
                  }
                  className="w-full p-2.5 border rounded-xl text-sm"
                  placeholder="مثال: مهندس مشاريع"
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1.5">الوصف</label>
                <textarea
                  value={roleModal.data.description}
                  onChange={(e) =>
                    setRoleModal({
                      ...roleModal,
                      data: { ...roleModal.data, description: e.target.value },
                    })
                  }
                  className="w-full p-2.5 border rounded-xl text-sm h-24 resize-none"
                  placeholder="وصف مهام الدور..."
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setRoleModal({ ...roleModal, isOpen: false })}
                  className="px-6 py-2.5 bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={roleMutation.isPending}
                  className="flex-1 bg-indigo-600 text-white rounded-xl font-bold flex justify-center items-center gap-2"
                >
                  {roleMutation.isPending ? (
                    <Loader2 className="animate-spin w-5 h-5" />
                  ) : (
                    <CheckCircle className="w-5 h-5" />
                  )}{" "}
                  حفظ الدور
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeesManagement;
