import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ShieldCheck, Users, KeyRound, Plus } from "lucide-react";
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
} from "../../../../api/employeeApi";

// المكونات الفرعية والثوابت
import { initialEmpData } from "./constants";
import EmployeeModal from "./components/EmployeeModal";
import RoleModal from "./components/RoleModal";
import EmployeesListTab from "./components/EmployeesListTab";
import RolesPermissionsTab from "./components/RolesPermissionsTab";

export default function EmployeesManagement() {
  const queryClient = useQueryClient();

  // ── States ──
  const [activeTab, setActiveTab] = useState("employees");
  const [empSearchTerm, setEmpSearchTerm] = useState("");
  const [roleSearchTerm, setRoleSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState(null);

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

  // ── Queries ──
  const { data: employees = [], isLoading: isLoadingEmployees } = useQuery({
    queryKey: ["employees"],
    queryFn: getEmployees,
  });
  const { data: roles = [], isLoading: isLoadingRoles } = useQuery({
    queryKey: ["roles"],
    queryFn: getRoles,
  });

  const usedEmployeeCodes = useMemo(
    () =>
      Array.isArray(employees)
        ? employees.map((emp) => emp.employeeCode?.toString()).filter(Boolean)
        : [],
    [employees],
  );

  // ── Mutations ──
  const empMutation = useMutation({
    mutationFn: (payload) =>
      empModal.mode === "create"
        ? createEmployee(payload)
        : updateEmployee({ id: empModal.data.id, data: payload }),
    onSuccess: () => {
      toast.success(
        empModal.mode === "create" ? "تم الإضافة بنجاح" : "تم التعديل بنجاح",
      );
      queryClient.invalidateQueries(["employees"]);
      setEmpModal({ isOpen: false, mode: "create", data: initialEmpData });
    },
    onError: (err) =>
      toast.error(
        err.response?.data?.message ||
          "خطأ. تأكد من عدم تكرار الإيميل أو الجوال.",
      ),
  });

  const deleteEmpMutation = useMutation({
    mutationFn: deleteEmployee,
    onSuccess: () => {
      toast.success("تم إيقاف الموظف");
      queryClient.invalidateQueries(["employees"]);
    },
  });

  const roleMutation = useMutation({
    mutationFn: (payload) =>
      roleModal.mode === "create"
        ? createRole(payload)
        : updateRole({ id: roleModal.data.id, data: payload }),
    onSuccess: () => {
      toast.success("تم الحفظ بنجاح");
      queryClient.invalidateQueries(["roles"]);
      setRoleModal({
        isOpen: false,
        mode: "create",
        data: { nameAr: "", description: "" },
      });
    },
    onError: (err) => toast.error(err.response?.data?.message || "حدث خطأ"),
  });

  const deleteRoleMutation = useMutation({
    mutationFn: deleteRole,
    onSuccess: () => {
      toast.success("تم حذف الدور");
      setSelectedRole(null);
      queryClient.invalidateQueries(["roles"]);
    },
    onError: () => toast.error("لا يمكن الحذف (مرتبط بموظفين)"),
  });

  const removePermissionMutation = useMutation({
    mutationFn: removePermissionFromRole,
    onSuccess: () => {
      toast.success("تم إزالة الصلاحية");
      queryClient.invalidateQueries(["roles"]);
      if (selectedRole) queryClient.refetchQueries(["roles"]); // لتحديث الشاشة اليمنى
    },
  });

  // ── Handlers & Computations ──
  const filteredEmployees = useMemo(() => {
    if (!Array.isArray(employees)) return [];
    return employees.filter(
      (emp) =>
        emp.name?.includes(empSearchTerm) ||
        emp.employeeCode?.toString().includes(empSearchTerm) ||
        emp.nationalId?.includes(empSearchTerm) ||
        emp.phone?.includes(empSearchTerm),
    );
  }, [employees, empSearchTerm]);

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
    if (empModal.data.roleIds.length === 0)
      return toast.error("حدد دور واحد على الأقل");
    if (!empModal.data.employeeCode) return toast.error("حدد الرقم الوظيفي");
    empMutation.mutate(empModal.data);
  };

  const handleRoleSubmit = (e) => {
    e.preventDefault();
    if (!roleModal.data.nameAr) return toast.error("اسم الدور مطلوب");
    roleMutation.mutate(roleModal.data);
  };

  // 💡 الحل الجذري للتمرير: الحاوية الرئيسية `absolute inset-0 flex flex-col`
  return (
    <div
      className="absolute inset-0 flex flex-col bg-slate-50 font-cairo"
      dir="rtl"
    >
      {/* Header & Tabs (Ultra Dense) */}
      <div className="bg-white border-b border-slate-200 px-3 md:px-6 pt-3 shrink-0 shadow-sm z-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3">
          <h1 className="text-[17px] font-black text-slate-800 flex items-center gap-1.5">
            <ShieldCheck className="w-5 h-5 text-blue-600" /> الموظفين
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
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-[11px] font-black flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> إضافة موظف
            </button>
          )}
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab("employees")}
            className={`pb-2 text-[11px] font-black flex items-center gap-1.5 border-b-[3px] transition-colors ${activeTab === "employees" ? "border-blue-600 text-blue-700" : "border-transparent text-slate-500 hover:text-slate-700"}`}
          >
            <Users className="w-3.5 h-3.5" /> سجل الموظفين
          </button>
          <button
            onClick={() => setActiveTab("roles")}
            className={`pb-2 text-[11px] font-black flex items-center gap-1.5 border-b-[3px] transition-colors ${activeTab === "roles" ? "border-blue-600 text-blue-700" : "border-transparent text-slate-500 hover:text-slate-700"}`}
          >
            <KeyRound className="w-3.5 h-3.5" /> الأدوار والصلاحيات
          </button>
        </div>
      </div>

      {/* Content Area (Takes remaining space, handles own scroll) */}
      <div className="flex-1 flex flex-col min-h-0 relative">
        {activeTab === "employees" ? (
          <EmployeesListTab
            employees={filteredEmployees}
            stats={stats}
            searchTerm={empSearchTerm}
            onSearch={setEmpSearchTerm}
            isLoading={isLoadingEmployees}
            onDelete={(id) => {
              if (window.confirm("إيقاف الموظف؟")) deleteEmpMutation.mutate(id);
            }}
            onEdit={(emp) =>
              setEmpModal({
                isOpen: true,
                mode: "edit",
                data: {
                  ...emp,
                  password: "",
                  qiwaPosition: emp.qiwaPosition || "",
                  roleIds: emp.roles?.map((r) => r.id) || [],
                  hireDate: emp.hireDate
                    ? new Date(emp.hireDate).toISOString().split("T")[0]
                    : "",
                },
              })
            }
          />
        ) : (
          <RolesPermissionsTab
            roles={roles}
            selectedRole={selectedRole}
            onSelectRole={setSelectedRole}
            searchTerm={roleSearchTerm}
            onSearch={setRoleSearchTerm}
            isLoading={isLoadingRoles}
            onAddRole={() =>
              setRoleModal({
                isOpen: true,
                mode: "create",
                data: { nameAr: "", description: "" },
              })
            }
            onEditRole={(role) =>
              setRoleModal({ isOpen: true, mode: "edit", data: role })
            }
            onDeleteRole={(id) => {
              if (window.confirm("حذف الدور بالكامل؟"))
                deleteRoleMutation.mutate(id);
            }}
            onRemovePermission={(roleId, permissionId, name) => {
              if (window.confirm(`إزالة صلاحية ${name}؟`))
                removePermissionMutation.mutate({ roleId, permissionId });
            }}
          />
        )}
      </div>

      {/* Modals */}
      <EmployeeModal
        modal={empModal}
        setModal={setEmpModal}
        roles={roles}
        usedEmployeeCodes={usedEmployeeCodes}
        onSubmit={handleEmpSubmit}
        isPending={empMutation.isPending}
      />
      <RoleModal
        modal={roleModal}
        setModal={setRoleModal}
        onSubmit={handleRoleSubmit}
        isPending={roleMutation.isPending}
      />
    </div>
  );
}
