import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../api/axios";
import { toast } from "sonner";
import {
  X,
  Flag,
  FolderOpen,
  Search,
  User,
  Loader2,
  Save,
  Upload,
} from "lucide-react";
import FileSelectorModal from "./FileSelectorModal";

export default function AddTaskModal({ onClose, currentUser, taskToEdit }) {
  const queryClient = useQueryClient();
  const [isExplorerOpen, setIsExplorerOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null); // 💡 لإرفاق مرفق حقيقي

  const [formData, setFormData] = useState({
    description: "",
    dueDate: "",
    priority: "medium",
    filePath: "",
    additionalNotes: "",
    assignedEmployees: [],
  });

  // 💡 تعبئة البيانات عند وضع التعديل
  useEffect(() => {
    if (taskToEdit) {
      setFormData({
        description: taskToEdit.description || "",
        dueDate: taskToEdit.dueDate ? taskToEdit.dueDate.split("T")[0] : "",
        priority: taskToEdit.priority || "medium",
        filePath: taskToEdit.filePath || "",
        additionalNotes: taskToEdit.additionalNotes || "",
        assignedEmployees: taskToEdit.assignedEmployees || [],
      });
    }
  }, [taskToEdit]);

  const { data: employees = [] } = useQuery({
    queryKey: ["persons-for-tasks"],
    queryFn: async () => {
      const res = await api.get("/persons");
      return res.data.data || [];
    },
  });

  // 🚀 Mutation الموحد (إضافة وتعديل)
  const saveMutation = useMutation({
    mutationFn: (payload) => {
      // استخدام FormData لدعم المرفقات الحقيقية
      const data = new FormData();
      Object.keys(payload).forEach((key) => {
        if (key === "assignedEmployees")
          data.append(key, JSON.stringify(payload[key]));
        else data.append(key, payload[key]);
      });
      if (selectedFile) data.append("file", selectedFile);
      data.append("creatorName", currentUser?.name || "موظف");

      if (taskToEdit) return api.put(`/office-tasks/${taskToEdit.id}`, data);
      return api.post("/office-tasks", data);
    },
    onSuccess: () => {
      toast.success(taskToEdit ? "تم تحديث المهمة" : "تمت إضافة المهمة بنجاح");
      queryClient.invalidateQueries({ queryKey: ["office-tasks"] });
      onClose();
    },
  });

  return (
    <div
      className="fixed inset-0 bg-slate-900/60 z-[200] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in"
      dir="rtl"
    >
      <div className="relative bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
          <h3 className="text-xl font-black text-slate-900">
            {taskToEdit ? "تعديل المهمة" : "إضافة مهمة جديدة"}
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:bg-slate-200 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar-slim">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">
              وصف المهمة <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="اكتب تفاصيل المهمة هنا..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-emerald-500 min-h-[100px] resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">
                تاريخ الإتمام (اختياري)
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) =>
                  setFormData({ ...formData, dueDate: e.target.value })
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">
                الأولوية
              </label>
              <div className="flex gap-2 font-bold">
                {["high", "medium", "low"].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setFormData({ ...formData, priority: p })}
                    className={`flex-1 py-2 rounded-xl text-xs border transition-all ${formData.priority === p ? "bg-slate-900 text-white border-slate-900" : "bg-white border-slate-200 text-slate-500"}`}
                  >
                    {p === "high"
                      ? "عالية"
                      : p === "medium"
                        ? "متوسطة"
                        : "منخفضة"}
                  </button>
                ))}
              </div>
            </div>

            {/* 🚀 إرفاق ملف حقيقي */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">
                ارفاق مرفق حقيقي (Upload)
              </label>
              <div className="relative">
                <div className="flex items-center gap-2 p-2.5 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl hover:border-emerald-500 transition-colors cursor-pointer text-center justify-center">
                  <Upload size={16} className="text-slate-400" />
                  <span className="text-xs text-slate-500 font-bold">
                    {selectedFile
                      ? selectedFile.name
                      : formData.filePath
                        ? "يوجد ملف مرفق بالفعل (انقر للتغيير)"
                        : "اختر ملفاً لرفعه"}
                  </span>
                  <input
                    type="file"
                    onChange={(e) => setSelectedFile(e.target.files[0])}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* 🚀 ربط مسار من السيرفر */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">
                ربط مسار من النظام (Browse)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.filePath}
                  readOnly
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-left"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setIsExplorerOpen(true)}
                  className="p-2.5 bg-slate-800 text-white rounded-xl hover:bg-black transition-colors"
                >
                  <Search size={18} />
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">
              تعيين الموظفين
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border border-slate-200 rounded-xl bg-slate-50 p-2 custom-scrollbar-slim">
              {employees.map((emp) => (
                <label
                  key={emp.id}
                  className="flex items-center gap-3 p-2 hover:bg-white rounded-lg cursor-pointer border border-transparent hover:border-slate-200 transition-all"
                >
                  <input
                    type="checkbox"
                    checked={formData.assignedEmployees.some(
                      (e) => e.id === emp.id,
                    )}
                    className="w-4 h-4 text-emerald-600 rounded"
                    onChange={(e) => {
                      const newEmps = e.target.checked
                        ? [
                            ...formData.assignedEmployees,
                            { id: emp.id, name: emp.name },
                          ]
                        : formData.assignedEmployees.filter(
                            (e2) => e2.id !== emp.id,
                          );
                      setFormData({ ...formData, assignedEmployees: newEmps });
                    }}
                  />
                  <span className="text-xs font-bold text-slate-700">
                    {emp.name}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-50"
          >
            إلغاء
          </button>
          <button
            onClick={() => saveMutation.mutate(formData)}
            disabled={!formData.description || saveMutation.isPending}
            className="px-6 py-2.5 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2"
          >
            {saveMutation.isPending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}{" "}
            {taskToEdit ? "تحديث التعديلات" : "حفظ المهمة"}
          </button>
        </div>
      </div>

      <FileSelectorModal
        isOpen={isExplorerOpen}
        onClose={() => setIsExplorerOpen(false)}
        onSelect={(path) => {
          setFormData({ ...formData, filePath: path });
          setIsExplorerOpen(false);
        }}
      />
    </div>
  );
}
