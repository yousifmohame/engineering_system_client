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
  User,
  Edit2,
  Upload,
  ListTodo,
  FolderOpen,
  EllipsisVertical,
  Loader2,
  Trash2,
  MessageSquare,
} from "lucide-react";

// استيراد المكونات المنفصلة
import AddTaskModal from "./components/AddTaskModal";
import SubtasksModal from "./components/SubtasksModal";
import CommentsModal from "./components/CommentsModal";
import StatusConfirmModal from "./components/StatusConfirmModal";
// في أعلى الملف بجانب المكونات الأخرى
import TaskDetailsModal from "./components/TaskDetailsModal";

// 💡 دالة مساعدة لحساب الأيام المتبقية
const getRemainingDays = (dueDate, status) => {
  if (status === "completed") return "منجزة ✅";
  if (!dueDate) return "بدون موعد";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  const diffTime = due - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "تنتهي اليوم ⚠️";
  if (diffDays < 0) return `متأخرة (${Math.abs(diffDays)} يوم) 🚨`;
  return `${diffDays} يوم متبقي`;
};

export default function OfficeNotepadScreen() {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [activeMenuId, setActiveMenuId] = useState(null); // لإدارة قائمة الإجراءات لكل سطر
  // داخل المكون OfficeNotepadScreen أضف:
  const [selectedTaskToView, setSelectedTaskToView] = useState(null);
  // حالات المودالات
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
      toast.success("تم حذف المهمة بنجاح");
      queryClient.invalidateQueries({ queryKey: ["office-tasks"] });
    },
    onError: () => toast.error("فشل الحذف، قد تكون المهمة مرتبطة ببيانات أخرى"),
  });

  const stats = useMemo(
    () => ({
      active: tasks.filter((t) => t.status === "active").length,
      completed: tasks.filter((t) => t.status === "completed").length,
      overdue: tasks.filter(
        (t) =>
          t.status !== "completed" &&
          t.dueDate &&
          new Date(t.dueDate) < new Date(),
      ).length,
    }),
    [tasks],
  );

  const filteredTasks = useMemo(
    () =>
      tasks.filter((t) => {
        const matchSearch = t.description
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
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
      return <Flag className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />;
    if (priority === "medium")
      return <Flag className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />;
    return <Flag className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />;
  };

  const getStatusBadge = (status) => {
    const classes = {
      completed: "bg-emerald-100 text-emerald-700 border-emerald-200",
      frozen: "bg-blue-100 text-blue-700 border-blue-200",
      cancelled: "bg-slate-100 text-slate-700 border-slate-200",
      active: "bg-amber-100 text-amber-700 border-amber-200",
    };
    const names = {
      completed: "مكتملة",
      frozen: "مجمدة",
      cancelled: "ملغاة",
      active: "نشطة",
    };
    return (
      <span
        className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${classes[status] || classes.active}`}
      >
        {names[status] || "نشطة"}
      </span>
    );
  };

  return (
    <div
      className="h-full flex flex-col bg-slate-50 p-2 md:p-4 overflow-hidden"
      dir="rtl"
    >
      {/* Header & Stats (مختصرة للتركيز على الجدول) */}
      <div className="mb-3 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-black text-slate-900 tracking-tight">
            مفكرة المكتب
          </h1>
          <div className="flex items-center gap-4 text-xs font-bold">
            <span className="text-blue-600">نشطة: {stats.active}</span>
            <span className="text-emerald-600">مكتملة: {stats.completed}</span>
            <span className="text-rose-600">متأخرة: {stats.overdue}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              placeholder="بحث..."
              className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-lg pl-3 pr-8 py-1.5 focus:ring-2 focus:ring-emerald-500 w-48"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2" />
          </div>
          <button
            onClick={() => {
              setTaskToEdit(null);
              setIsAddModalOpen(true);
            }}
            className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-sm shadow-emerald-600/20"
          >
            <Plus size={14} /> مهمة جديدة
          </button>
        </div>
      </div>

      {/* Table Area */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto overflow-y-auto flex-1 custom-scrollbar-slim">
          <table className="w-full text-right text-sm border-collapse">
            <thead className="bg-slate-100 sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="px-2 py-3 font-black text-slate-700 border-b border-slate-200 border-l border-slate-200 w-10 text-center text-xs">
                  #
                </th>
                <th className="px-4 py-3 font-black text-slate-700 border-b border-slate-200 border-l border-slate-200 min-w-[250px] text-xs">
                  وصف المهمة
                </th>
                <th className="px-4 py-3 font-black text-slate-700 border-b border-slate-200 border-l border-slate-200 text-xs">
                  المنشئ
                </th>
                <th className="px-4 py-3 font-black text-slate-700 border-b border-slate-200 border-l border-slate-200 text-xs">
                  تاريخ الإنشاء
                </th>
                <th className="px-4 py-3 font-black text-slate-700 border-b border-slate-200 border-l border-slate-200 text-xs">
                  تاريخ الإتمام
                </th>
                <th className="px-4 py-3 font-black text-slate-700 border-b border-slate-200 border-l border-slate-200 text-xs text-center">
                  المهام الفرعية
                </th>
                <th className="px-4 py-3 font-black text-slate-700 border-b border-slate-200 border-l border-slate-200 text-xs">
                  الموظفين
                </th>
                <th className="px-4 py-3 font-black text-slate-700 border-b border-slate-200 border-l border-slate-200 text-xs">
                  ارتباط ملفات
                </th>
                <th className="px-4 py-3 font-black text-slate-700 border-b border-slate-200 border-l border-slate-200 text-xs text-center">
                  الحالة
                </th>
                <th className="px-4 py-3 font-black text-slate-700 border-b border-slate-200 text-xs text-center">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {isLoading ? (
                <tr>
                  <td colSpan="10" className="p-10 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-emerald-600" />
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task, idx) => (
                  <tr
                    key={task.id}
                    className="hover:bg-slate-50 transition-colors group cursor-pointer"
                    onClick={() => setSelectedTaskToView(task)}
                  >
                    <td className="px-2 py-3 border-l border-slate-200 text-center font-mono text-xs text-slate-400">
                      {idx + 1}
                    </td>
                    <td className="px-4 py-3 border-l border-slate-200 font-bold text-slate-800">
                      <div className="flex items-start gap-2">
                        {getPriorityIcon(task.priority)}
                        <div className="flex flex-col gap-1">
                          <span
                            className={`text-xs ${task.status === "completed" ? "line-through text-slate-400" : "text-slate-700"}`}
                          >
                            {task.description}
                          </span>
                          <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md w-max">
                            ⏳ {getRemainingDays(task.dueDate, task.status)}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 border-l border-slate-200 text-xs font-bold text-slate-600">
                      {task.creatorName}
                    </td>
                    <td className="px-4 py-3 border-l border-slate-200 text-xs font-mono text-slate-500">
                      {new Date(task.createdAt).toLocaleDateString("en-GB")}
                    </td>
                    <td className="px-4 py-3 border-l border-slate-200 text-xs font-mono font-bold text-slate-600">
                      {task.dueDate
                        ? new Date(task.dueDate).toLocaleDateString("en-GB")
                        : "---"}
                    </td>
                    <td className="px-4 py-3 border-l border-slate-200 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setSelectedTaskForSubtasks(task)}
                        className="flex items-center justify-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-black w-full bg-blue-50 text-blue-700 border border-blue-200"
                      >
                        <ListTodo size={14} />{" "}
                        {task.subTasks?.filter((s) => s.isCompleted).length ||
                          0}
                        /{task.subTasks?.length || 0}
                      </button>
                    </td>
                    <td className="px-4 py-3 border-l border-slate-200">
                      <div className="flex flex-wrap gap-1">
                        {task.assignedEmployees?.map((emp, i) => (
                          <span
                            key={i}
                            className="bg-slate-100 text-slate-600 text-[9px] font-bold px-1.5 py-0.5 rounded"
                          >
                            {emp.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 border-l border-slate-200 font-mono text-[10px]">
                      {task.filePath ? (
                        <div
                          className="flex items-center gap-1.5 text-emerald-600 truncate max-w-[120px]"
                          dir="ltr"
                        >
                          <FolderOpen size={12} />{" "}
                          {task.filePath.split("/").pop()}
                        </div>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-4 py-3 border-l border-slate-200 text-center">
                      {getStatusBadge(task.status)}
                    </td>
                    <td
                      className="px-4 py-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() =>
                            setStatusConfirmModal({
                              isOpen: true,
                              task,
                              newStatus: "completed",
                            })
                          }
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={() => setSelectedTaskForComments(task)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg relative"
                        >
                          <MessageSquare size={16} />
                          {task.comments?.length > 0 && (
                            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                          )}
                        </button>
                        <div className="relative">
                          <button
                            onClick={() =>
                              setActiveMenuId(
                                activeMenuId === task.id ? null : task.id,
                              )
                            }
                            className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <EllipsisVertical size={16} />
                          </button>
                          {activeMenuId === task.id && (
                            <>
                              <div
                                className="fixed inset-0 z-10"
                                onClick={() => setActiveMenuId(null)}
                              ></div>
                              <div className="absolute left-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-20 w-36 py-1 animate-in zoom-in-95 overflow-hidden font-bold">
                                <button
                                  onClick={() => {
                                    setTaskToEdit(task);
                                    setIsAddModalOpen(true);
                                    setActiveMenuId(null);
                                  }}
                                  className="flex items-center gap-2 w-full text-right px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                                >
                                  <Edit2 size={12} className="text-blue-500" />{" "}
                                  تعديل
                                </button>
                                <button
                                  onClick={() => {
                                    if (
                                      window.confirm("حذف هذه المهمة نهائياً؟")
                                    )
                                      deleteMutation.mutate(task.id);
                                    setActiveMenuId(null);
                                  }}
                                  className="flex items-center gap-2 w-full text-right px-4 py-2 text-xs text-rose-600 hover:bg-rose-50"
                                >
                                  <Trash2 size={12} /> حذف
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- النوافذ المنبثقة --- */}
      {isAddModalOpen && (
        <AddTaskModal
          onClose={() => setIsAddModalOpen(false)}
          currentUser={currentUser}
          taskToEdit={taskToEdit}
        />
      )}
      {selectedTaskForSubtasks && (
        <SubtasksModal
          task={selectedTaskForSubtasks}
          onClose={() => setSelectedTaskForSubtasks(null)}
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
      {/* 🚀 النافذة المنبثقة الجديدة لعرض التفاصيل */}
      {selectedTaskToView && (
        <TaskDetailsModal
          task={selectedTaskToView}
          onClose={() => setSelectedTaskToView(null)}
        />
      )}
    </div>
  );
}
