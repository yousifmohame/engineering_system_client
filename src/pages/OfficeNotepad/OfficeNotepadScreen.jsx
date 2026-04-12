import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../api/axios"; // مسار الـ API الخاص بك
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
} from "lucide-react";

// استيراد المكونات المنفصلة
import AddTaskModal from "./components/AddTaskModal";
import SubtasksModal from "./components/SubtasksModal";
import CommentsModal from "./components/CommentsModal";
import StatusConfirmModal from "./components/StatusConfirmModal";
import TaskDetailsModal from "./components/TaskDetailsModal";

// 💡 دالة مساعدة لحساب الأيام المتبقية (نسخة مختصرة للتكثيف)
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

export default function OfficeNotepadScreen() {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();

  // حالات البحث والفلترة
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [activeMenuId, setActiveMenuId] = useState(null);

  // حالات النوافذ
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

  // 1. جلب البيانات
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["office-tasks"],
    queryFn: async () => {
      const res = await api.get("/office-tasks");
      return res.data.data;
    },
    refetchInterval: 30000,
  });

  // 2. حذف المهمة
  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/office-tasks/${id}`),
    onSuccess: () => {
      toast.success("تم الحذف");
      queryClient.invalidateQueries({ queryKey: ["office-tasks"] });
    },
    onError: () => toast.error("فشل الحذف"),
  });

  // الإحصائيات
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

  // الفلترة (تبحث في العنوان والوصف)
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

  const getPriorityIcon = (priority) => {
    if (priority === "high")
      return <Flag className="w-3 h-3 text-rose-500 shrink-0" />;
    if (priority === "medium")
      return <Flag className="w-3 h-3 text-amber-500 shrink-0" />;
    return <Flag className="w-3 h-3 text-slate-400 shrink-0" />;
  };

  const getStatusBadge = (status) => {
    const classes = {
      completed: "bg-emerald-50 text-emerald-600 border-emerald-100",
      frozen: "bg-blue-50 text-blue-600 border-blue-100",
      cancelled: "bg-slate-50 text-slate-500 border-slate-100",
      active: "bg-amber-50 text-amber-600 border-amber-100",
    };
    const names = {
      completed: "تمت",
      frozen: "مجمدة",
      cancelled: "ملغاة",
      active: "نشطة",
    };
    return (
      <span
        className={`px-1.5 py-0.5 rounded text-[9px] font-black border ${classes[status] || classes.active}`}
      >
        {names[status] || "نشطة"}
      </span>
    );
  };

  return (
    <div
      className="h-full flex flex-col bg-slate-50 p-1 md:p-2 overflow-hidden"
      dir="rtl"
    >
      {/* 🚀 Header & Stats (Ultra Compact) */}
      <div className="mb-1.5 flex items-center justify-between gap-2 bg-white p-1.5 rounded-lg border border-slate-200 shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <div className="hidden sm:block border-l border-slate-100 pl-3">
            <h1 className="text-sm font-black text-slate-900 leading-none">
              مفكرة المكتب
            </h1>
            <p className="text-[8px] font-bold text-slate-400">
              نظام إدارة المهام
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <ChartNoAxesColumn className="w-3 h-3 text-blue-500" />
              <div className="flex flex-col">
                <p className="text-[10px] font-black text-slate-700 leading-none">
                  {stats.active}
                </p>
                <p className="text-[7px] font-bold text-slate-400">نشطة</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-3 h-3 text-emerald-500" />
              <div className="flex flex-col">
                <p className="text-[10px] font-black text-slate-700 leading-none">
                  {stats.completed}
                </p>
                <p className="text-[7px] font-bold text-slate-400">مكتملة</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <TriangleAlert className="w-3 h-3 text-rose-500" />
              <div className="flex flex-col">
                <p className="text-[10px] font-black text-slate-700 leading-none">
                  {stats.overdue}
                </p>
                <p className="text-[7px] font-bold text-slate-400">متأخرة</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="relative">
            <input
              placeholder="بحث..."
              className="bg-slate-50 border border-slate-200 text-slate-700 text-[10px] font-bold rounded-md pl-2 pr-6 py-1 focus:outline-none focus:ring-1 focus:ring-emerald-500 w-28 md:w-44"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="w-3 h-3 text-slate-400 absolute right-1.5 top-1/2 -translate-y-1/2" />
          </div>
          <button
            onClick={() => {
              setTaskToEdit(null);
              setIsAddModalOpen(true);
            }}
            className="px-2.5 py-1 bg-emerald-600 text-white text-[10px] font-bold rounded-md hover:bg-emerald-700 transition-all flex items-center gap-1 shadow-sm"
          >
            <Plus className="w-3 h-3" /> مهمة
          </button>
        </div>
      </div>

      {/* 🚀 Table Area (Dense) */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex-1 flex flex-col">
        <div className="overflow-auto flex-1 custom-scrollbar-slim">
          <table className="w-full text-right text-[11px] border-collapse">
            <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
              <tr className="text-slate-500">
                <th className="px-1 py-1.5 border-b border-l border-slate-100 w-8 text-center font-bold">
                  #
                </th>
                <th className="px-2 py-1.5 border-b border-l border-slate-100 min-w-[200px] font-bold text-slate-700">
                  عنوان المهمة
                </th>
                <th className="px-2 py-1.5 border-b border-l border-slate-100 w-20 font-bold">
                  المنشئ
                </th>
                <th className="px-2 py-1.5 border-b border-l border-slate-100 w-20 font-bold">
                  تاريخ
                </th>
                <th className="px-2 py-1.5 border-b border-l border-slate-100 w-20 text-center font-bold">
                  الفرعية
                </th>
                <th className="px-2 py-1.5 border-b border-l border-slate-100 font-bold">
                  الموظفين
                </th>
                <th className="px-2 py-1.5 border-b border-l border-slate-100 w-16 text-center font-bold">
                  ارتباط
                </th>
                <th className="px-2 py-1.5 border-b border-l border-slate-100 w-16 text-center font-bold">
                  الحالة
                </th>
                <th className="px-2 py-1.5 border-b border-slate-100 w-24 text-center font-bold">
                  إجراء
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr>
                  <td colSpan="9" className="p-4 text-center">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto text-emerald-600" />
                  </td>
                </tr>
              ) : filteredTasks.length === 0 ? (
                <tr>
                  <td
                    colSpan="9"
                    className="p-4 text-center font-bold text-slate-300 italic"
                  >
                    لا توجد سجلات
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task, idx) => {
                  const isFrozen = task.status === "frozen";
                  const isCompleted = task.status === "completed";
                  const isCancelled = task.status === "cancelled";

                  return (
                    <tr
                      key={task.id}
                      className={`hover:bg-slate-50 transition-colors cursor-pointer ${isFrozen || isCancelled ? "opacity-60 grayscale-[0.2]" : ""}`}
                      onClick={() => setSelectedTaskToView(task)}
                    >
                      <td className="px-1 py-1 border-l border-slate-50 text-center font-mono text-[10px] text-slate-400">
                        {idx + 1}
                      </td>
                      <td className="px-2 py-1 border-l border-slate-50">
                        <div className="flex items-center gap-1.5">
                          {getPriorityIcon(task.priority)}
                          <div className="flex flex-col">
                            <span
                              className={`font-black text-slate-800 ${isCompleted || isCancelled ? "line-through text-slate-400" : ""}`}
                            >
                              {task.title || "بدون عنوان"}
                            </span>
                            <span className="text-[8px] font-bold text-blue-500 bg-blue-50/50 px-1 rounded-sm w-fit">
                              {getRemainingDays(task.dueDate, task.status)}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-2 py-1 border-l border-slate-50 font-bold text-slate-600 truncate max-w-[80px]">
                        {task.creatorName}
                      </td>
                      <td className="px-2 py-1 border-l border-slate-50 font-mono text-[10px] text-slate-400">
                        {new Date(task.createdAt).toLocaleDateString("en-GB")}
                      </td>
                      <td
                        className="px-2 py-1 border-l border-slate-50 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => setSelectedTaskForSubtasks(task)}
                          className="flex items-center justify-center gap-1 px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100 hover:bg-blue-100 text-[9px] font-black"
                        >
                          <ListTodo size={10} />
                          {task.subTasks?.filter((s) => s.isCompleted).length ||
                            0}
                          /{task.subTasks?.length || 0}
                        </button>
                      </td>
                      <td className="px-2 py-1 border-l border-slate-50">
                        <div className="flex flex-wrap gap-0.5">
                          {task.assignedEmployees?.slice(0, 2).map((emp, i) => (
                            <span
                              key={i}
                              className="bg-slate-100 text-slate-500 text-[8px] font-bold px-1 rounded leading-tight"
                            >
                              {emp.name.split(" ")[0]}
                            </span>
                          ))}
                          {task.assignedEmployees?.length > 2 && (
                            <span className="text-[8px] text-slate-400">
                              +{task.assignedEmployees.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-2 py-1 border-l border-slate-50 text-center">
                        {task.filePath ? (
                          <FolderOpen
                            size={12}
                            className="text-emerald-500 mx-auto"
                          />
                        ) : (
                          <span className="text-slate-200">-</span>
                        )}
                      </td>
                      <td className="px-2 py-1 border-l border-slate-50 text-center">
                        {getStatusBadge(task.status)}
                      </td>

                      {/* --- الإجراءات (Actions) --- */}
                      <td
                        className="px-2 py-1 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-center gap-1">
                          {/* زر الإتمام السريع (يظهر فقط للمهمة النشطة) */}
                          {!isCompleted && !isFrozen && !isCancelled && (
                            <button
                              onClick={() =>
                                setStatusConfirmModal({
                                  isOpen: true,
                                  task,
                                  newStatus: "completed",
                                })
                              }
                              className="p-1 text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                              title="إتمام المهمة"
                            >
                              <Check size={14} />
                            </button>
                          )}

                          {/* زر التعليقات */}
                          <button
                            onClick={() => setSelectedTaskForComments(task)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded relative"
                            title="الملاحظات"
                          >
                            <MessageSquare size={13} />
                            {task.comments?.length > 0 && (
                              <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-rose-500 rounded-full border border-white"></span>
                            )}
                          </button>

                          {/* قائمة الخيارات الثلاث نقط */}
                          <div className="relative">
                            <button
                              onClick={() =>
                                setActiveMenuId(
                                  activeMenuId === task.id ? null : task.id,
                                )
                              }
                              className="p-1 text-slate-400 hover:bg-slate-100 rounded transition-colors"
                            >
                              <EllipsisVertical size={13} />
                            </button>

                            {activeMenuId === task.id && (
                              <>
                                <div
                                  className="fixed inset-0 z-10"
                                  onClick={() => setActiveMenuId(null)}
                                ></div>
                                <div className="absolute left-0 top-full mt-0.5 bg-white border border-slate-200 rounded-lg shadow-xl z-20 w-36 py-1 font-bold text-[10px] overflow-hidden text-right animate-in zoom-in-95">
                                  {/* 1. خيار التعديل */}
                                  {!isCompleted &&
                                    !isCancelled &&
                                    !isFrozen && (
                                      <button
                                        onClick={() => {
                                          setTaskToEdit(task);
                                          setIsAddModalOpen(true);
                                          setActiveMenuId(null);
                                        }}
                                        className="flex items-center gap-2 w-full px-3 py-1.5 hover:bg-slate-50 text-slate-700"
                                      >
                                        <Edit2
                                          size={10}
                                          className="text-blue-500"
                                        />{" "}
                                        تعديل البيانات
                                      </button>
                                    )}

                                  {/* 2. خيارات تغيير الحالة (ديناميكية) */}
                                  {isFrozen ? (
                                    <button
                                      onClick={() => {
                                        setStatusConfirmModal({
                                          isOpen: true,
                                          task,
                                          newStatus: "active",
                                        });
                                        setActiveMenuId(null);
                                      }}
                                      className="flex items-center gap-2 w-full px-3 py-1.5 hover:bg-blue-50 text-blue-700"
                                    >
                                      <Play size={10} /> استئناف (تنشيط)
                                    </button>
                                  ) : (
                                    !isCompleted &&
                                    !isCancelled && (
                                      <button
                                        onClick={() => {
                                          setStatusConfirmModal({
                                            isOpen: true,
                                            task,
                                            newStatus: "frozen",
                                          });
                                          setActiveMenuId(null);
                                        }}
                                        className="flex items-center gap-2 w-full px-3 py-1.5 hover:bg-cyan-50 text-cyan-700"
                                      >
                                        <Snowflake size={10} /> تجميد المهمة
                                      </button>
                                    )
                                  )}

                                  {isCancelled ? (
                                    <button
                                      onClick={() => {
                                        setStatusConfirmModal({
                                          isOpen: true,
                                          task,
                                          newStatus: "active",
                                        });
                                        setActiveMenuId(null);
                                      }}
                                      className="flex items-center gap-2 w-full px-3 py-1.5 hover:bg-blue-50 text-blue-700"
                                    >
                                      <RotateCcw size={10} /> استعادة من الإلغاء
                                    </button>
                                  ) : (
                                    !isCompleted && (
                                      <button
                                        onClick={() => {
                                          setStatusConfirmModal({
                                            isOpen: true,
                                            task,
                                            newStatus: "cancelled",
                                          });
                                          setActiveMenuId(null);
                                        }}
                                        className="flex items-center gap-2 w-full px-3 py-1.5 hover:bg-rose-50 text-rose-700"
                                      >
                                        <X size={10} /> إلغاء المهمة
                                      </button>
                                    )
                                  )}

                                  {/* إعادة المهمة للعمل إذا كانت مكتملة بالخطأ */}
                                  {isCompleted && (
                                    <button
                                      onClick={() => {
                                        setStatusConfirmModal({
                                          isOpen: true,
                                          task,
                                          newStatus: "active",
                                        });
                                        setActiveMenuId(null);
                                      }}
                                      className="flex items-center gap-2 w-full px-3 py-1.5 hover:bg-blue-50 text-blue-700"
                                    >
                                      <RotateCcw size={10} /> إعادة فتح المهمة
                                    </button>
                                  )}

                                  <div className="border-t border-slate-100 my-1"></div>

                                  {/* 3. خيار الحذف */}
                                  <button
                                    onClick={() => {
                                      if (window.confirm("حذف المهمة نهائياً؟"))
                                        deleteMutation.mutate(task.id);
                                      setActiveMenuId(null);
                                    }}
                                    className="flex items-center gap-2 w-full px-3 py-1.5 hover:bg-rose-50 text-rose-600"
                                  >
                                    <Trash2 size={10} /> حذف السجل
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- النوافذ المنبثقة --- */}
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
            setStatusConfirmModal({ isOpen: false, task: null, newStatus: "" })
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
