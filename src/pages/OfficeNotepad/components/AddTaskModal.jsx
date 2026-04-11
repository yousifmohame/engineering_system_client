import React, { useState, useEffect, useCallback } from "react";
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
  Link as LinkIcon,
  FileText,
  Building2,
  ClipboardList,
  MapPin,
} from "lucide-react";
import FileSelectorModal from "./FileSelectorModal";

// =========================================================================
// 🛠️ دالة معالجة الأسماء (لحل الخطأ #31)
// =========================================================================
const getSafeName = (nameData) => {
  if (!nameData) return "غير محدد";

  // إذا كان الاسم نصاً جاهزاً
  if (typeof nameData === "string") return nameData;

  // إذا كان كائناً يحتوي على لغات (ar/en)
  if (nameData.ar && typeof nameData.ar === "string") return nameData.ar;

  // إذا كان كائناً يحتوي على تفاصيل الاسم ( firstName, fatherName, familyName )
  if (typeof nameData === "object") {
    const { firstName, fatherName, grandFatherName, familyName } = nameData;
    const fullName = [firstName, fatherName, grandFatherName, familyName]
      .filter(Boolean)
      .join(" ");
    return fullName || "اسم غير معروف";
  }

  return "بيانات اسم غير صالحة";
};

export default function AddTaskModal({ onClose, currentUser, taskToEdit }) {
  const queryClient = useQueryClient();
  const [isExplorerOpen, setIsExplorerOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const [formData, setFormData] = useState({
    description: "",
    dueDate: "",
    priority: "medium",
    filePath: "",
    additionalNotes: "",
    assignedEmployees: [],
    clientId: "",
    transactionId: "",
    ownershipId: "",
  });

  // 1. جلب بيانات العملاء
  const { data: clients = [] } = useQuery({
    queryKey: ["simple-clients-list"],
    queryFn: () => api.get("/clients").then((res) => res.data || []),
  });

  // 2. جلب بيانات المعاملات
  const { data: transactionsData } = useQuery({
    queryKey: ["simple-transactions-list"],
    queryFn: () => api.get("/private-transactions").then((res) => res.data),
  });
  const transactions = transactionsData?.data || [];

  // 3. جلب بيانات الملكيات (الصكوك)
  const { data: deedsData } = useQuery({
    queryKey: ["simple-ownerships-list"],
    queryFn: () => api.get("/ownerships").then((res) => res.data),
  });
  const ownerships = deedsData?.data || [];

  // 💡 وظيفة اللصق من الكليبورد
  const handlePaste = useCallback((e) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (
        items[i].type.indexOf("image") !== -1 ||
        items[i].type.indexOf("pdf") !== -1
      ) {
        const file = items[i].getAsFile();
        if (file) {
          setSelectedFile(file);
          toast.success(
            `تم التقاط ملف من الذاكرة: ${file.name || "صورة ملصقة"}`,
          );
        }
      }
    }
  }, []);

  useEffect(() => {
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [handlePaste]);

  useEffect(() => {
    if (taskToEdit) {
      setFormData({
        description: taskToEdit.description || "",
        dueDate: taskToEdit.dueDate ? taskToEdit.dueDate.split("T")[0] : "",
        priority: taskToEdit.priority || "medium",
        filePath: taskToEdit.filePath || "",
        additionalNotes: taskToEdit.additionalNotes || "",
        assignedEmployees: taskToEdit.assignedEmployees || [],
        clientId: taskToEdit.clientId || "",
        transactionId: taskToEdit.transactionId || "",
        ownershipId: taskToEdit.ownershipId || "",
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

  const saveMutation = useMutation({
    mutationFn: (payload) => {
      const data = new FormData();
      Object.keys(payload).forEach((key) => {
        if (key === "assignedEmployees")
          data.append(key, JSON.stringify(payload[key]));
        else if (payload[key]) data.append(key, payload[key]);
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
      <div className="relative bg-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
          <div>
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <ClipboardList className="text-blue-600" size={24} />
              {taskToEdit ? "تعديل بيانات المهمة" : "إضافة مهمة جديدة"}
            </h3>
            <p className="text-[10px] font-bold text-slate-400 mt-1 leading-tight">
              يرجى ربط المهمة بالسجل الصحيح لضمان دقة التقارير
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:bg-slate-200 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar-slim bg-white">
          {/* 1. وصف المهمة */}
          <div className="space-y-2">
            <label className="text-sm font-black text-slate-700 flex items-center gap-2">
              <FileText size={16} className="text-blue-500" /> تفاصيل المهمة
              المطلوبة <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="اكتب هنا تفاصيل العمل... (يمكنك استخدام Ctrl+V للصق الصور)"
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold focus:ring-4 focus:ring-blue-50 focus:border-blue-400 min-h-[90px] resize-none transition-all"
            />
          </div>

          {/* 2. قسم الربط الذكي - تم التصحيح هنا */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="md:col-span-3 flex items-center gap-2 text-blue-800 text-xs font-black mb-1">
              <LinkIcon size={14} /> الربط مع قاعدة البيانات (اختياري)
            </div>

            {/* العميل */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 mr-1 flex items-center gap-1">
                <User size={10} /> العميل
              </label>
              <select
                value={formData.clientId}
                onChange={(e) =>
                  setFormData({ ...formData, clientId: e.target.value })
                }
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-[11px] font-bold outline-none focus:border-blue-500 shadow-sm"
              >
                <option value="">-- غير مرتبط --</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {/* ✅ استخدام دالة المعالجة هنا لحل الخطأ #31 */}
                    {getSafeName(c.name)}
                  </option>
                ))}
              </select>
            </div>

            {/* المعاملة */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 mr-1 flex items-center gap-1">
                <Building2 size={10} /> المعاملة
              </label>
              <select
                value={formData.transactionId}
                onChange={(e) =>
                  setFormData({ ...formData, transactionId: e.target.value })
                }
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-[11px] font-bold outline-none focus:border-blue-500 shadow-sm"
              >
                <option value="">-- غير مرتبط --</option>
                {transactions.map((tx) => (
                  <option key={tx.id} value={tx.id}>
                    {tx.code || tx.transactionCode} |{" "}
                    {tx.internalName || tx.title || "بدون عنوان"}
                  </option>
                ))}
              </select>
            </div>

            {/* الملكية */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 mr-1 flex items-center gap-1">
                <MapPin size={10} /> الصك / الملكية
              </label>
              <select
                value={formData.ownershipId}
                onChange={(e) =>
                  setFormData({ ...formData, ownershipId: e.target.value })
                }
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-[11px] font-bold outline-none focus:border-blue-500 shadow-sm"
              >
                <option value="">-- غير مرتبط --</option>
                {ownerships.map((o) => (
                  <option key={o.id} value={o.id}>
                    صك: {o.deedNumber || o.code} | {o.district || "بدون حي"}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-black text-slate-700">
                تاريخ التسليم المتوقع
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) =>
                  setFormData({ ...formData, dueDate: e.target.value })
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-4 focus:ring-blue-50 focus:border-blue-400 outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-black text-slate-700">
                الأولوية
              </label>
              <div className="flex gap-2">
                {[
                  { id: "high", label: "عالية 🚩" },
                  { id: "medium", label: "متوسطة 🛡️" },
                  { id: "low", label: "منخفضة 🏳️" },
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, priority: p.id })}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-black border transition-all ${formData.priority === p.id ? "bg-slate-900 text-white border-slate-900 shadow-lg" : "bg-white border-slate-200 text-slate-400 hover:bg-slate-50"}`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-black text-slate-700 flex justify-between">
                <span>رفع ملفات المهمة</span>
                {selectedFile && (
                  <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full animate-pulse">
                    مستند جاهز
                  </span>
                )}
              </label>
              <div
                className={`relative group flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-2xl transition-all ${selectedFile ? "border-emerald-500 bg-emerald-50" : "border-slate-200 bg-slate-50 hover:border-blue-400 cursor-pointer"}`}
              >
                <Upload
                  className={
                    selectedFile ? "text-emerald-500" : "text-slate-400"
                  }
                  size={24}
                />
                <span className="text-[10px] font-black mt-2 text-slate-500 text-center leading-tight">
                  {selectedFile
                    ? selectedFile.name
                    : "انقر للرفع أو استخدم Ctrl+V"}
                </span>
                <input
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-black text-slate-700">
                ارتباط بمسار أرشيف
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.filePath}
                  readOnly
                  placeholder="اختر مجلداً..."
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-left text-slate-500"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setIsExplorerOpen(true)}
                  className="p-3 bg-slate-800 text-white rounded-xl hover:bg-black transition-colors shadow-md"
                >
                  <Search size={18} />
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-black text-slate-700 flex items-center gap-2">
              <User size={16} className="text-blue-500" /> تعيين الموظفين
              المسؤولين
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-32 overflow-y-auto border border-slate-100 rounded-2xl bg-slate-50/50 p-3 custom-scrollbar-slim">
              {employees.map((emp) => (
                <label
                  key={emp.id}
                  className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer border transition-all ${formData.assignedEmployees.some((e) => e.id === emp.id) ? "bg-white border-blue-200 shadow-sm" : "border-transparent hover:bg-white"}`}
                >
                  <input
                    type="checkbox"
                    checked={formData.assignedEmployees.some(
                      (e) => e.id === emp.id,
                    )}
                    className="w-4 h-4 text-blue-600 rounded-md border-slate-300"
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
                  <span className="text-[11px] font-black text-slate-700 truncate">
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
            className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-100 transition-colors"
          >
            إلغاء
          </button>
          <button
            onClick={() => saveMutation.mutate(formData)}
            disabled={!formData.description || saveMutation.isPending}
            className="px-10 py-2.5 bg-blue-600 text-white text-sm font-black rounded-xl hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-blue-200"
          >
            {saveMutation.isPending ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Save size={18} />
            )}
            {taskToEdit ? "حفظ التعديلات" : "اعتماد المهمة"}
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
