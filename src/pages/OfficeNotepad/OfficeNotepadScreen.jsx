import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { toast } from "sonner";
import {
  Search,
  Plus,
  Check,
  TriangleAlert,
  ChartNoAxesColumn,
  Flag,
  Edit2,
  ListTodo,
  FolderOpen,
  EllipsisVertical,
  Loader2,
  Trash2,
  MessageSquare,
  RotateCcw,
  Play,
  Snowflake,
  X,
  ClipboardList,
} from "lucide-react";

import AccessControl from "../../components/AccessControl";

import AddTaskModal from "./components/AddTaskModal";
import SubtasksModal from "./components/SubtasksModal";
import CommentsModal from "./components/CommentsModal";
import StatusConfirmModal from "./components/StatusConfirmModal";
import TaskDetailsModal from "./components/TaskDetailsModal";

const getRemainingDays = (dueDate, status) => {
  if (status === "completed") return "منجزة";
  if (status === "cancelled") return "ملغاة";
  if (!dueDate) return "مفتوحة";

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);

  const diffTime = due - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "اليوم ⚠️";
  if (diffDays < 0) return `متأخرة (${Math.abs(diffDays)}ي)`;

  return `${diffDays} يوم`;
};

const getRecordAgeDays = (createdAt) => {
  if (!createdAt) return "—";

  const created = new Date(createdAt);
  const today = new Date();

  created.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const diffDays = Math.floor((today - created) / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return "اليوم";
  if (diffDays === 1) return "منذ يوم";

  return `منذ ${diffDays} يوم`;
};

export default function OfficeNotepadScreen() {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [activeMenuId, setActiveMenuId] = useState(null);

  const [selectedTaskToView, setSelectedTaskToView] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [selectedTaskForSubtasks, setSelectedTaskForSubtasks] = useState(null);
  const [selectedTaskForComments, setSelectedTaskForComments] = useState(null);

  const [statusConfirmModal, setStatusConfirmModal] = useState({
    isOpen: false,
    task: null,
    newStatus: "",
  });

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["office-tasks"],
    queryFn: async () => {
      const res = await api.get("/office-tasks");
      return res.data.data;
    },
    refetchInterval: 30000,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/office-tasks/${id}`),
    onSuccess: () => {
      toast.success("تم الحذف");
      queryClient.invalidateQueries({ queryKey: ["office-tasks"] });
    },
    onError: () => toast.error("فشل الحذف"),
  });

  const stats = useMemo(
    () => ({
      active: tasks.filter((t) => t.status === "active").length,
      completed: tasks.filter((t) => t.status === "completed").length,
      overdue: tasks.filter(
        (t) =>
          t.status !== "completed" &&
          t.status !== "cancelled" &&
          t.dueDate &&
          new Date(t.dueDate) < new Date(),
      ).length,
    }),
    [tasks],
  );

  const filteredTasks = useMemo(
    () =>
      tasks.filter((t) => {
        const searchLower = searchQuery.toLowerCase();

        const matchSearch =
          (t.title && t.title.toLowerCase().includes(searchLower)) ||
          (t.description && t.description.toLowerCase().includes(searchLower));

        const matchPriority = filterPriority
          ? t.priority === filterPriority
          : true;

        const matchStatus = filterStatus ? t.status === filterStatus : true;

        return matchSearch && matchPriority && matchStatus;
      }),
    [tasks, searchQuery, filterPriority, filterStatus],
  );

  const getSafeEmployeesArray = (assignedEmployees) => {
    if (Array.isArray(assignedEmployees)) return assignedEmployees;

    if (typeof assignedEmployees === "string") {
      try {
        const parsed = JSON.parse(assignedEmployees);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        return [];
      }
    }

    return [];
  };

  const getPriorityIcon = (priority) => {
    if (priority === "high") {
      return <Flag className="h-3.5 w-3.5 shrink-0 text-rose-500" />;
    }

    if (priority === "medium") {
      return <Flag className="h-3.5 w-3.5 shrink-0 text-[#c5983c]" />;
    }

    return <Flag className="h-3.5 w-3.5 shrink-0 text-slate-400" />;
  };

  const getStatusBadge = (status) => {
    const classes = {
      completed: "border-emerald-200 bg-emerald-50 text-emerald-700",
      frozen: "border-cyan-200 bg-cyan-50 text-cyan-700",
      cancelled: "border-slate-200 bg-slate-50 text-slate-500",
      active: "border-[#d8b46a]/45 bg-[#f8efe0] text-[#9a6b16]",
    };

    const names = {
      completed: "تمت",
      frozen: "مجمدة",
      cancelled: "ملغاة",
      active: "نشطة",
    };

    return (
      <span
        className={`
          inline-flex items-center justify-center rounded-xl border
          px-2 py-1 text-[9px] font-black shadow-sm
          ${classes[status] || classes.active}
        `}
      >
        {names[status] || "نشطة"}
      </span>
    );
  };

  return (
    <div
      className="
        flex h-full flex-col overflow-hidden
        bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white
        p-2 md:p-3 2xl:p-4
      "
      dir="rtl"
    >
      {/* Single strip header */}
      <div
        className="
          relative mb-2 shrink-0 overflow-hidden
          rounded-[14px]
          border border-[#e2bf74]/35
          bg-gradient-to-l from-[#06111d] via-[#0b3f55] to-[#005f73]
          px-2.5 py-1.5
          shadow-[0_8px_20px_rgba(6,17,29,0.22)]
          2xl:rounded-[18px] 2xl:px-3 2xl:py-2
        "
      >
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute right-[-45px] top-[-45px] h-24 w-24 rounded-full bg-[#e2bf74]/18 blur-2xl" />
          <div className="absolute left-[-50px] bottom-[-50px] h-28 w-28 rounded-full bg-emerald-400/12 blur-2xl" />
        </div>

        <div className="relative z-10 flex items-center gap-2">
          {/* Title */}
          <div className="flex min-w-[180px] shrink-0 items-center gap-2">
            <span
              className="
                grid h-8 w-8 shrink-0 place-items-center rounded-xl
                bg-[#e2bf74] text-[#082032]
                shadow-[0_6px_14px_rgba(0,0,0,0.16)]
              "
            >
              <ClipboardList className="h-4 w-4" />
            </span>

            <div className="min-w-0">
              <h1 className="truncate text-[12px] font-black text-white">
                مفكرة المكتب
              </h1>

              <p className="truncate text-[8px] font-bold text-white/55">
                {filteredTasks.length} نتيجة من أصل {tasks.length}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="hidden shrink-0 items-center gap-1.5 md:flex">
            <MiniStatCard
              icon={ChartNoAxesColumn}
              label="نشطة"
              value={stats.active}
              tone="blue"
            />

            <MiniStatCard
              icon={Check}
              label="مكتملة"
              value={stats.completed}
              tone="green"
            />

            <MiniStatCard
              icon={TriangleAlert}
              label="متأخرة"
              value={stats.overdue}
              tone="red"
            />
          </div>

          {/* Search */}
          <div className="relative min-w-[180px] flex-1">
            <Search className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#d8a93d]" />

            <input
              placeholder="بحث في المهام..."
              className="
                h-8 w-full rounded-xl border border-white/20
                bg-white pr-9 pl-3
                text-[10px] font-bold text-[#082032]
                shadow-sm outline-none transition-all
                placeholder:text-[#6b7c8f]
                focus:border-[#e2bf74]
                focus:ring-2 focus:ring-[#e2bf74]/25
              "
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filters */}
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="
              h-8 w-[110px] rounded-xl border border-white/20
              bg-white px-2 text-[10px] font-black
              text-[#082032] outline-none
              focus:border-[#e2bf74]
              focus:ring-2 focus:ring-[#e2bf74]/25
            "
          >
            <option value="">كل الأولويات</option>
            <option value="high">عالية</option>
            <option value="medium">متوسطة</option>
            <option value="low">عادية</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="
              h-8 w-[105px] rounded-xl border border-white/20
              bg-white px-2 text-[10px] font-black
              text-[#082032] outline-none
              focus:border-[#e2bf74]
              focus:ring-2 focus:ring-[#e2bf74]/25
            "
          >
            <option value="">كل الحالات</option>
            <option value="active">نشطة</option>
            <option value="completed">تمت</option>
            <option value="frozen">مجمدة</option>
            <option value="cancelled">ملغاة</option>
          </select>

          {/* Add Button */}
          <AccessControl
            code="OFFICE_NOTEPAD_ADD_TASK"
            permissionNumber={54}
            name="إضافة مهمة جديدة في مفكرة المكتب"
            moduleName="مفكرة المكتب"
            tabName="المهام"
          >
            <button
              onClick={() => {
                setTaskToEdit(null);
                setIsAddModalOpen(true);
              }}
              className="
                flex h-8 shrink-0 items-center justify-center gap-1.5
                rounded-xl bg-[#e2bf74] px-3
                text-[10px] font-black text-[#082032]
                shadow-[0_8px_18px_rgba(226,191,116,0.22)]
                transition-all duration-300
                hover:-translate-y-[1px]
                hover:bg-[#f5d99b]
              "
              type="button"
            >
              <Plus className="h-3.5 w-3.5" />
              مهمة جديدة
            </button>
          </AccessControl>
        </div>
      </div>

      {/* Table Card */}
      <div
        className="
          flex min-h-0 flex-1 flex-col overflow-hidden
          rounded-[20px] 2xl:rounded-[28px]
          border border-[#d8b46a]/30 bg-white
          shadow-[0_14px_34px_rgba(18,63,89,0.10)]
        "
      >
        <div className="min-h-0 flex-1 overflow-auto custom-scrollbar-slim">
          <table className="w-full border-collapse text-right text-[11px]">
            <thead className="sticky top-0 z-10 bg-[#123f59] text-white shadow-sm">
              <tr>
                <TableHead className="w-10 text-center">#</TableHead>
                <TableHead className="min-w-[260px]">عنوان المهمة</TableHead>
                <TableHead className="w-24">المنشئ</TableHead>
                <TableHead className="w-28 text-center">منذ الإنشاء</TableHead>
                <TableHead className="w-28 text-center">المهام الفرعية</TableHead>
                <TableHead className="min-w-[140px]">الموظفين</TableHead>
                <TableHead className="w-20 text-center">ارتباط</TableHead>
                <TableHead className="w-20 text-center">الحالة</TableHead>
                <TableHead className="w-40 text-center">إجراء</TableHead>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#e8ddc8]/60">
              {isLoading ? (
                <tr>
                  <td colSpan="9" className="p-10 text-center">
                    <Loader2 className="mx-auto h-7 w-7 animate-spin text-[#c5983c]" />
                  </td>
                </tr>
              ) : filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan="9" className="p-10 text-center">
                    <div
                      className="
                        mx-auto max-w-sm rounded-[24px]
                        border border-dashed border-[#d8b46a]/45
                        bg-[#fbf8f1]/70 p-8
                      "
                    >
                      <p className="text-sm font-black text-[#123f59]">
                        لا توجد سجلات مطابقة
                      </p>
                      <p className="mt-1 text-xs font-bold text-[#64748b]">
                        جرّب تغيير البحث أو الفلاتر الحالية.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task, idx) => {
                  const isFrozen = task.status === "frozen";
                  const isCompleted = task.status === "completed";
                  const isCancelled = task.status === "cancelled";
                  const employeesArray = getSafeEmployeesArray(
                    task.assignedEmployees,
                  );

                  return (
                    <tr
                      key={task.id}
                      onClick={() => setSelectedTaskToView(task)}
                      className={`
                        cursor-pointer transition-all duration-200
                        hover:bg-[#fbf8f1]
                        ${
                          isFrozen || isCancelled
                            ? "opacity-60 grayscale-[0.2]"
                            : ""
                        }
                      `}
                    >
                      <TableCell className="text-center font-mono text-[#94a3b8]">
                        {idx + 1}
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getPriorityIcon(task.priority)}

                          <div className="min-w-0">
                            <span
                              className={`
                                block truncate font-black
                                ${
                                  isCompleted || isCancelled
                                    ? "text-slate-400 line-through"
                                    : "text-[#123f59]"
                                }
                              `}
                            >
                              {task.title || "بدون عنوان"}
                            </span>

                            <span
                              className="
                                mt-1 inline-flex rounded-xl
                                border border-[#d8b46a]/25
                                bg-[#f8efe0] px-2 py-0.5
                                text-[9px] font-black text-[#9a6b16]
                              "
                            >
                              {getRemainingDays(task.dueDate, task.status)}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="max-w-[100px] truncate font-bold text-[#64748b]">
                        {task.creatorName || "—"}
                      </TableCell>

                      <TableCell className="text-center">
                        <div className="flex flex-col items-center justify-center gap-1">
                          <span className="font-mono text-[10px] font-bold text-[#64748b]">
                            {task.createdAt
                              ? new Date(task.createdAt).toLocaleDateString("en-GB")
                              : "—"}
                          </span>

                          <span
                            className="
                              rounded-xl border border-[#d8b46a]/30
                              bg-[#f8efe0] px-2 py-0.5
                              text-[9px] font-black text-[#9a6b16]
                            "
                          >
                            {getRecordAgeDays(task.createdAt)}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell
                        className="text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <AccessControl
                          code="OFFICE_NOTEPAD_OPEN_SUBTASKS"
                          permissionNumber={55}
                          name="فتح المهام الفرعية"
                          moduleName="مفكرة المكتب"
                          tabName="المهام"
                        >
                          <button
                            onClick={() => setSelectedTaskForSubtasks(task)}
                            className="
                              mx-auto flex items-center justify-center gap-1
                              rounded-xl border border-cyan-200
                              bg-cyan-50 px-2 py-1
                              text-[9px] font-black text-cyan-700
                              transition hover:bg-cyan-600 hover:text-white
                            "
                            type="button"
                          >
                            <ListTodo size={11} />
                            {task.subTasks?.filter((s) => s.isCompleted)
                              .length || 0}
                            /{task.subTasks?.length || 0}
                          </button>
                        </AccessControl>
                      </TableCell>

                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {employeesArray.slice(0, 2).map((emp, i) => (
                            <span
                              key={i}
                              className="
                                rounded-xl border border-[#d8b46a]/25
                                bg-[#fbf8f1] px-2 py-0.5
                                text-[9px] font-black text-[#64748b]
                              "
                            >
                              {emp.name ? emp.name.split(" ")[0] : "موظف"}
                            </span>
                          ))}

                          {employeesArray.length > 2 && (
                            <span className="text-[9px] font-black text-[#94a3b8]">
                              +{employeesArray.length - 2}
                            </span>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="text-center">
                        {task.filePath ? (
                          <FolderOpen
                            size={15}
                            className="mx-auto text-emerald-500"
                          />
                        ) : (
                          <span className="text-slate-200">-</span>
                        )}
                      </TableCell>

                      <TableCell className="text-center">
                        {getStatusBadge(task.status)}
                      </TableCell>

                      <TableCell
                        className="text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-center gap-1">
                          {!isCompleted && !isFrozen && !isCancelled && (
                            <AccessControl
                              code="OFFICE_NOTEPAD_QUICK_COMPLETE_TASK"
                              permissionNumber={56}
                              name="إتمام المهمة بسرعة"
                              moduleName="مفكرة المكتب"
                              tabName="المهام"
                            >
                              <IconButton
                                label="إنهاء"
                                title="إتمام المهمة"
                                tone="green"
                                onClick={() =>
                                  setStatusConfirmModal({
                                    isOpen: true,
                                    task,
                                    newStatus: "completed",
                                  })
                                }
                              >
                                <Check size={14} />
                              </IconButton>
                            </AccessControl>
                          )}

                          <AccessControl
                            code="OFFICE_NOTEPAD_OPEN_COMMENTS"
                            permissionNumber={57}
                            name="فتح ملاحظات المهمة"
                            moduleName="مفكرة المكتب"
                            tabName="المهام"
                          >
                            <IconButton
                              label="ملاحظات"
                              title="الملاحظات"
                              tone="blue"
                              onClick={() => setSelectedTaskForComments(task)}
                              className="relative"
                            >
                              <MessageSquare size={13} />

                              {task.comments?.length > 0 && (
                                <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full border border-white bg-rose-500" />
                              )}
                            </IconButton>
                          </AccessControl>

                          <div className="relative">
                            <IconButton
                              label="خيارات"
                              title="خيارات إضافية"
                              tone="slate"
                              onClick={() =>
                                setActiveMenuId(
                                  activeMenuId === task.id ? null : task.id,
                                )
                              }
                            >
                              <EllipsisVertical size={13} />
                            </IconButton>

                            {activeMenuId === task.id && (
                              <>
                                <div
                                  className="fixed inset-0 z-10"
                                  onClick={() => setActiveMenuId(null)}
                                />

                                <div
                                  className="
                                    absolute left-0 top-full z-20 mt-1
                                    w-44 overflow-hidden rounded-2xl
                                    border border-[#d8b46a]/30 bg-white
                                    py-1.5 text-right text-[10px] font-black
                                    shadow-[0_18px_45px_rgba(15,23,42,0.18)]
                                    animate-in zoom-in-95
                                  "
                                >
                                  {!isCompleted &&
                                    !isCancelled &&
                                    !isFrozen && (
                                      <AccessControl
                                        code="OFFICE_NOTEPAD_EDIT_TASK"
                                        permissionNumber={58}
                                        name="تعديل بيانات المهمة"
                                        moduleName="مفكرة المكتب"
                                        tabName="المهام"
                                      >
                                        <MenuItem
                                          icon={Edit2}
                                          tone="blue"
                                          onClick={() => {
                                            setTaskToEdit(task);
                                            setIsAddModalOpen(true);
                                            setActiveMenuId(null);
                                          }}
                                        >
                                          تعديل البيانات
                                        </MenuItem>
                                      </AccessControl>
                                    )}

                                  {isFrozen ? (
                                    <AccessControl
                                      code="OFFICE_NOTEPAD_RESUME_TASK"
                                      permissionNumber={59}
                                      name="استئناف المهمة المجمدة"
                                      moduleName="مفكرة المكتب"
                                      tabName="المهام"
                                    >
                                      <MenuItem
                                        icon={Play}
                                        tone="blue"
                                        onClick={() => {
                                          setStatusConfirmModal({
                                            isOpen: true,
                                            task,
                                            newStatus: "active",
                                          });
                                          setActiveMenuId(null);
                                        }}
                                      >
                                        استئناف المهمة
                                      </MenuItem>
                                    </AccessControl>
                                  ) : (
                                    !isCompleted &&
                                    !isCancelled && (
                                      <AccessControl
                                        code="OFFICE_NOTEPAD_FREEZE_TASK"
                                        permissionNumber={60}
                                        name="تجميد المهمة"
                                        moduleName="مفكرة المكتب"
                                        tabName="المهام"
                                      >
                                        <MenuItem
                                          icon={Snowflake}
                                          tone="cyan"
                                          onClick={() => {
                                            setStatusConfirmModal({
                                              isOpen: true,
                                              task,
                                              newStatus: "frozen",
                                            });
                                            setActiveMenuId(null);
                                          }}
                                        >
                                          تجميد المهمة
                                        </MenuItem>
                                      </AccessControl>
                                    )
                                  )}

                                  {isCancelled ? (
                                    <AccessControl
                                      code="OFFICE_NOTEPAD_RESTORE_CANCELLED_TASK"
                                      permissionNumber={61}
                                      name="استعادة مهمة ملغاة"
                                      moduleName="مفكرة المكتب"
                                      tabName="المهام"
                                    >
                                      <MenuItem
                                        icon={RotateCcw}
                                        tone="blue"
                                        onClick={() => {
                                          setStatusConfirmModal({
                                            isOpen: true,
                                            task,
                                            newStatus: "active",
                                          });
                                          setActiveMenuId(null);
                                        }}
                                      >
                                        استعادة من الإلغاء
                                      </MenuItem>
                                    </AccessControl>
                                  ) : (
                                    !isCompleted && (
                                      <AccessControl
                                        code="OFFICE_NOTEPAD_CANCEL_TASK"
                                        permissionNumber={62}
                                        name="إلغاء المهمة"
                                        moduleName="مفكرة المكتب"
                                        tabName="المهام"
                                      >
                                        <MenuItem
                                          icon={X}
                                          tone="red"
                                          onClick={() => {
                                            setStatusConfirmModal({
                                              isOpen: true,
                                              task,
                                              newStatus: "cancelled",
                                            });
                                            setActiveMenuId(null);
                                          }}
                                        >
                                          إلغاء المهمة
                                        </MenuItem>
                                      </AccessControl>
                                    )
                                  )}

                                  {isCompleted && (
                                    <AccessControl
                                      code="OFFICE_NOTEPAD_REOPEN_COMPLETED_TASK"
                                      permissionNumber={63}
                                      name="إعادة فتح مهمة مكتملة"
                                      moduleName="مفكرة المكتب"
                                      tabName="المهام"
                                    >
                                      <MenuItem
                                        icon={RotateCcw}
                                        tone="blue"
                                        onClick={() => {
                                          setStatusConfirmModal({
                                            isOpen: true,
                                            task,
                                            newStatus: "active",
                                          });
                                          setActiveMenuId(null);
                                        }}
                                      >
                                        إعادة فتح المهمة
                                      </MenuItem>
                                    </AccessControl>
                                  )}

                                  <div className="my-1 border-t border-[#e8ddc8]" />

                                  <AccessControl
                                    code="OFFICE_NOTEPAD_DELETE_TASK"
                                    permissionNumber={64}
                                    name="حذف سجل المهمة"
                                    moduleName="مفكرة المكتب"
                                    tabName="المهام"
                                  >
                                    <MenuItem
                                      icon={Trash2}
                                      tone="red"
                                      onClick={() => {
                                        if (
                                          window.confirm("حذف المهمة نهائياً؟")
                                        ) {
                                          deleteMutation.mutate(task.id);
                                        }

                                        setActiveMenuId(null);
                                      }}
                                    >
                                      حذف السجل
                                    </MenuItem>
                                  </AccessControl>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </TableCell>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isAddModalOpen && (
        <AddTaskModal
          onClose={() => {
            setIsAddModalOpen(false);
            setTaskToEdit(null);
          }}
          currentUser={currentUser}
          taskToEdit={taskToEdit}
        />
      )}

      {selectedTaskForSubtasks && (
        <SubtasksModal
          task={selectedTaskForSubtasks}
          onClose={() => setSelectedTaskForSubtasks(null)}
          currentUser={currentUser}
        />
      )}

      {selectedTaskForComments && (
        <CommentsModal
          task={selectedTaskForComments}
          onClose={() => setSelectedTaskForComments(null)}
          currentUser={currentUser}
        />
      )}

      {statusConfirmModal.isOpen && (
        <StatusConfirmModal
          config={statusConfirmModal}
          onClose={() =>
            setStatusConfirmModal({
              isOpen: false,
              task: null,
              newStatus: "",
            })
          }
          currentUser={currentUser}
        />
      )}

      {selectedTaskToView && (
        <TaskDetailsModal
          task={selectedTaskToView}
          onClose={() => setSelectedTaskToView(null)}
        />
      )}
    </div>
  );
}

const MiniStatCard = ({ icon: Icon, label, value, tone }) => {
  const tones = {
    blue: "border-cyan-300/35 bg-cyan-400/[0.18] text-cyan-50",
    green: "border-emerald-300/35 bg-emerald-400/[0.18] text-emerald-50",
    red: "border-rose-300/35 bg-rose-400/[0.18] text-rose-50",
  };

  return (
    <div
      className={`
        flex min-w-[58px] items-center gap-1.5 rounded-xl
        border px-2 py-1.5 backdrop-blur-md
        ${tones[tone] || tones.blue}
      `}
    >
      <Icon className="h-3.5 w-3.5" />

      <div>
        <div className="font-mono text-[11px] font-black text-white">
          {value}
        </div>

        <div className="text-[7px] font-bold text-white/65">{label}</div>
      </div>
    </div>
  );
};

const TableHead = ({ children, className = "" }) => (
  <th
    className={`
      border-l border-white/10 px-3 py-2
      text-[11px] font-black text-white/85
      2xl:py-3 2xl:text-xs
      ${className}
    `}
  >
    {children}
  </th>
);

const TableCell = ({ children, className = "" }) => (
  <td
    className={`
      border-l border-[#e8ddc8]/60 px-3 py-2
      align-middle
      ${className}
    `}
  >
    {children}
  </td>
);

const IconButton = ({
  children,
  onClick,
  title,
  tone = "slate",
  className = "",
  label = "",
}) => {
  const tones = {
    green:
      "text-emerald-700 bg-emerald-50 hover:bg-emerald-600 hover:text-white border-emerald-200",
    blue:
      "text-cyan-700 bg-cyan-50 hover:bg-cyan-600 hover:text-white border-cyan-200",
    slate:
      "text-[#64748b] bg-[#fbf8f1] hover:bg-[#123f59] hover:text-[#e2bf74] border-[#d8b46a]/30",
  };

  return (
    <button
      onClick={onClick}
      title={title}
      className={`
        flex min-w-[58px] flex-col items-center justify-center
        gap-0.5 rounded-xl border px-1.5 py-1.5
        transition-all duration-200 hover:-translate-y-[1px]
        ${tones[tone] || tones.slate}
        ${className}
      `}
      type="button"
    >
      {children}

      {label && (
        <span className="text-[8px] font-black leading-none">
          {label}
        </span>
      )}
    </button>
  );
};

const MenuItem = ({ icon: Icon, children, onClick, tone = "blue" }) => {
  const tones = {
    blue: "text-cyan-700 group-hover:text-cyan-800",
    cyan: "text-cyan-700 group-hover:text-cyan-800",
    red: "text-rose-600 group-hover:text-rose-700",
  };

  return (
    <button
      onClick={onClick}
      className="
        group flex w-full items-center gap-2
        px-3 py-2 text-right
        transition hover:bg-[#f8efe0]
      "
      type="button"
    >
      <Icon className={`h-3.5 w-3.5 ${tones[tone] || tones.blue}`} />
      <span className="text-[#123f59]">{children}</span>
    </button>
  );
};
