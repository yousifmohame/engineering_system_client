import React, { useState, useMemo, useEffect } from "react";
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


export default function EmployeesManagement({ initialAction = null }) {
  const queryClient = useQueryClient();

  // ── States ──
  const [activeTab, setActiveTab] = useState("employees");
  const [empSearchTerm, setEmpSearchTerm] = useState("");
  const [roleSearchTerm, setRoleSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState(null);

  const [empModal, setEmpModal] = useState({
    isOpen: false,
    mode: "create",
    data: { ...initialEmpData },
  });
  const [roleModal, setRoleModal] = useState({
    isOpen: false,
    mode: "create",
    data: { nameAr: "", description: "" },
  });

  useEffect(() => {
    if (initialAction === "create") {
      setActiveTab("employees");
      setEmpModal({
        isOpen: true,
        mode: "create",
        data: { ...initialEmpData },
      });
    }
  }, [initialAction]);

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
      setEmpModal({ isOpen: false, mode: "create", data: { ...initialEmpData } });
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
      className="absolute inset-0 flex min-w-0 flex-col overflow-hidden bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white font-cairo"
      dir="rtl"
    >
      {/* Premium Compact Header */}
      <div className="z-10 shrink-0 border-b border-[#d8b46a]/25 bg-gradient-to-l from-[#0e7490] via-[#123f59] to-[#06111d] px-2.5 py-1.5 text-white shadow-[0_8px_22px_rgba(18,63,89,0.12)]">
        <div className="flex flex-col gap-1.5 md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 items-center gap-2">
            <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border border-[#e2bf74]/35 bg-white/10 text-[#e2bf74]">
              <ShieldCheck className="h-3.5 w-3.5" />
            </span>
            <div className="min-w-0">
              <h1 className="truncate text-[13px] font-black leading-tight text-white">
                إدارة الموظفين والصلاحيات
              </h1>
              <p className="hidden text-[9px] font-bold text-white/55 xl:block">
                سجل الموظفين، الحسابات، الأدوار والصلاحيات.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1">
            {activeTab === "employees" && (
              <button
                onClick={() =>
                  setEmpModal({
                    isOpen: true,
                    mode: "create",
                    data: { ...initialEmpData },
                  })
                }
                className="inline-flex h-7 items-center justify-center gap-1 rounded-lg bg-[#e2bf74] px-2.5 text-[9px] font-black text-[#06111d] shadow-[0_8px_18px_rgba(226,191,116,0.14)] transition hover:bg-[#f1d38f]"
              >
                <IconWithText icon={Plus} text="إضافة موظف" iconClassName="h-3.5 w-3.5" />
              </button>
            )}

            <button
              onClick={() => setActiveTab("employees")}
              className={`inline-flex h-7 items-center justify-center gap-1 rounded-lg border px-2 text-[9px] font-black transition ${
                activeTab === "employees"
                  ? "border-[#e2bf74]/45 bg-white text-[#123f59]"
                  : "border-white/10 bg-white/10 text-white/65 hover:bg-white/15 hover:text-white"
              }`}
            >
              <IconWithText icon={Users} text="سجل الموظفين" iconClassName="h-3.5 w-3.5" />
            </button>

            <button
              onClick={() => setActiveTab("roles")}
              className={`inline-flex h-7 items-center justify-center gap-1 rounded-lg border px-2 text-[9px] font-black transition ${
                activeTab === "roles"
                  ? "border-[#e2bf74]/45 bg-white text-[#123f59]"
                  : "border-white/10 bg-white/10 text-white/65 hover:bg-white/15 hover:text-white"
              }`}
            >
              <IconWithText icon={KeyRound} text="الأدوار والصلاحيات" iconClassName="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Content Area (Takes remaining space, handles own scroll) */}
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
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
