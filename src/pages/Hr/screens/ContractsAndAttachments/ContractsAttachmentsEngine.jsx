import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Search,
  FileText,
  UploadCloud,
  FolderOpen,
  Trash2,
  Eye,
  Download,
  FileCheck,
  ShieldAlert,
  User,
  CheckCircle2,
  AlertCircle,
  FileImage,
  FileBox,
  File,
  Clock,
  X,
} from "lucide-react";
import { toast } from "sonner";
import api from "../../../../api/axios";
import { useAuth } from "../../../../context/AuthContext";
import FileViewerModal from "../../../FilesExplorer/modals/FileViewerModal";

// --- دوال مساعدة لاستخراج الأيقونات ---
const getFileMeta = (fileName) => {
  const ext = fileName?.split(".").pop()?.toLowerCase() || "";
  if (["png", "jpg", "jpeg", "webp", "gif", "svg"].includes(ext)) {
    return {
      icon: FileImage,
      color: "text-blue-500",
      bg: "bg-blue-50",
      label: "صورة",
    };
  }
  if (ext === "pdf") {
    return {
      icon: FileText,
      color: "text-rose-500",
      bg: "bg-rose-50",
      label: "PDF",
    };
  }
  if (["zip", "rar", "7z"].includes(ext)) {
    return {
      icon: FileBox,
      color: "text-amber-500",
      bg: "bg-amber-50",
      label: "مضغوط",
    };
  }
  return {
    icon: File,
    color: "text-gray-500",
    bg: "bg-gray-50",
    label: ext.toUpperCase() || "ملف",
  };
};

const formatBytes = (bytes) => {
  if (!bytes) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const ATTACHMENT_CATEGORIES = [
  {
    id: "CONTRACT",
    label: "عقود واتفاقيات",
    icon: FileText,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    id: "ID_PASSPORT",
    label: "هويات وجوازات",
    icon: ShieldAlert,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    id: "CERTIFICATE",
    label: "مؤهلات وشهادات",
    icon: FileCheck,
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
  {
    id: "OTHER",
    label: "مرفقات أخرى",
    icon: FolderOpen,
    color: "text-gray-600",
    bg: "bg-gray-50",
  },
];

export default function ContractsAttachmentsEngine() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmpId, setSelectedEmpId] = useState(null);
  const [activeFilter, setActiveFilter] = useState("ALL");

  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [fileToView, setFileToView] = useState(null);

  const [selectedCategory, setSelectedCategory] = useState("CONTRACT");
  const [fileToUpload, setFileToUpload] = useState(null);

  const { data: employeesRes, isLoading: isLoadingEmployees } = useQuery({
    queryKey: ["employeesList"],
    queryFn: () => api.get("/employees"),
  });
  const employees = employeesRes?.data?.data || employeesRes?.data || [];

  const filteredEmployees = useMemo(() => {
    return employees.filter(
      (emp) =>
        emp.name?.includes(searchTerm) ||
        emp.employeeCode?.toString().includes(searchTerm),
    );
  }, [employees, searchTerm]);

  const { data: attachmentsRes, isLoading: isLoadingAttachments } = useQuery({
    queryKey: ["employeeAttachments", selectedEmpId],
    queryFn: () => api.get(`/employees/${selectedEmpId}/attachments`),
    enabled: !!selectedEmpId,
  });

  const attachments = useMemo(() => {
    let list = attachmentsRes?.data || [];
    if (activeFilter !== "ALL") {
      list = list.filter((f) => f.category === activeFilter); // يقرأ الـ category بشكل سليم
    }
    return list;
  }, [attachmentsRes, activeFilter]);

  const uploadMutation = useMutation({
    mutationFn: async (formData) => {
      return api.post(`/employees/${selectedEmpId}/attachments`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: () => {
      toast.success("تم رفع المستند بنجاح");
      queryClient.invalidateQueries({
        queryKey: ["employeeAttachments", selectedEmpId],
      });
      setUploadModalOpen(false);
      setFileToUpload(null);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "حدث خطأ أثناء رفع الملف");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (attachmentId) => {
      return api.delete(`/employees/attachments/${attachmentId}`);
    },
    onSuccess: () => {
      toast.success("تم حذف المستند بنجاح");
      queryClient.invalidateQueries({
        queryKey: ["employeeAttachments", selectedEmpId],
      });
    },
    onError: () => toast.error("حدث خطأ أثناء الحذف"),
  });

  const handleUpload = (e) => {
    e.preventDefault();
    if (!fileToUpload) return toast.error("الرجاء اختيار ملف");
    if (!user || !user.id) return toast.error("غير مصرح لك بالرفع");

    const formData = new FormData();
    formData.append("file", fileToUpload);
    formData.append("category", selectedCategory); // يتم إرسال التصنيف

    uploadMutation.mutate(formData);
  };

  const selectedEmp = employees.find((e) => e.id === selectedEmpId);

  return (
    <div
      className="flex h-full w-full overflow-hidden bg-[#fbf8f1] font-cairo"
      dir="rtl"
    >
      {/* ─── القائمة الجانبية للموظفين ─── */}
      <div className="w-72 shrink-0 border-l border-[#e8ddc8] bg-white flex flex-col z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <div className="p-4 border-b border-[#e8ddc8] bg-gradient-to-br from-[#f8f9fa] to-white">
          <h3 className="text-sm font-black text-[#123f59] mb-4 flex items-center gap-2">
            <User className="h-4 w-4" /> سجل الموظفين
          </h3>
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="ابحث بالاسم أو الرقم..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 pl-3 pr-9 rounded-xl border border-gray-200 bg-gray-50 text-[12px] font-bold outline-none transition focus:border-[#e2bf74] focus:ring-1 focus:ring-[#e2bf74]/30"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2 bg-[#fdfdfc]">
          {isLoadingEmployees ? (
            <div className="p-4 text-center text-xs font-bold text-gray-500">
              جاري التحميل...
            </div>
          ) : (
            filteredEmployees.map((emp) => (
              <button
                key={emp.id}
                onClick={() => setSelectedEmpId(emp.id)}
                className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all duration-200 ${
                  selectedEmpId === emp.id
                    ? "bg-gradient-to-l from-[#0e7490] to-[#123f59] border-transparent shadow-[0_4px_12px_rgba(14,116,144,0.2)] text-white"
                    : "bg-white border-gray-100 hover:border-[#e2bf74]/40 hover:shadow-sm text-gray-700"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 font-black text-sm ${
                      selectedEmpId === emp.id
                        ? "bg-white/20 text-white"
                        : "bg-[#eef7f6] text-[#0e7490]"
                    }`}
                  >
                    {emp.name?.charAt(0)}
                  </div>
                  <div className="text-right min-w-0 flex-1">
                    <p className="text-[12px] font-black truncate">
                      {emp.name}
                    </p>
                    <p
                      className={`text-[10px] font-bold mt-0.5 ${selectedEmpId === emp.id ? "text-white/80" : "text-gray-400"}`}
                    >
                      {emp.employeeCode} | {emp.position}
                    </p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* ─── مساحة العمل (المرفقات) ─── */}
      <div className="flex-1 flex flex-col min-w-0 relative bg-[#fbf8f1]">
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-[#eef7f6] to-transparent opacity-60 pointer-events-none"></div>

        {!selectedEmpId ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-4 z-10">
            <div className="h-24 w-24 rounded-full bg-white border-2 border-dashed border-gray-300 flex items-center justify-center shadow-sm">
              <FolderOpen className="h-10 w-10 text-gray-300" />
            </div>
            <p className="text-base font-black text-gray-500">
              اختر موظفاً من القائمة الجانبية لعرض المستندات
            </p>
          </div>
        ) : (
          <>
            <div className="shrink-0 p-5 border-b border-[#e8ddc8]/60 flex items-center justify-between bg-white/70 backdrop-blur-md z-10">
              <div>
                <h2 className="text-lg font-black text-[#06111d] flex items-center gap-2">
                  محفظة المستندات: {selectedEmp?.name}
                  {selectedEmp?.status === "active" ? (
                    <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> نشط
                    </span>
                  ) : (
                    <span className="bg-rose-100 text-rose-700 text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> غير نشط
                    </span>
                  )}
                </h2>

                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={() => setActiveFilter("ALL")}
                    className={`px-3 py-1 rounded-lg text-[10px] font-black transition ${activeFilter === "ALL" ? "bg-[#06111d] text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}
                  >
                    الكل
                  </button>
                  {ATTACHMENT_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setActiveFilter(cat.id)}
                      className={`px-3 py-1 rounded-lg text-[10px] font-black transition flex items-center gap-1 ${activeFilter === cat.id ? "bg-[#06111d] text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setUploadModalOpen(true)}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-[#d4af37] to-[#e2bf74] px-5 text-sm font-black text-[#06111d] shadow-[0_8px_18px_rgba(226,191,116,0.25)] transition hover:-translate-y-0.5"
              >
                <UploadCloud className="h-5 w-5" />
                رفع مستند جديد
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar z-10">
              {isLoadingAttachments ? (
                <div className="flex justify-center items-center h-full">
                  <p className="font-bold text-gray-500 animate-pulse">
                    جاري تحميل المستندات...
                  </p>
                </div>
              ) : attachments.length === 0 ? (
                <div className="text-center py-24 text-gray-400">
                  <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p className="font-bold">لا توجد مستندات مسجلة.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-5">
                  {attachments.map((file) => {
                    const catInfo =
                      ATTACHMENT_CATEGORIES.find(
                        (c) => c.id === file.category,
                      ) || ATTACHMENT_CATEGORIES[3];
                    const meta = getFileMeta(file.fileName);
                    const FileTypeIcon = meta.icon;

                    return (
                      <div
                        key={file.id}
                        className="group relative bg-white border border-gray-100 rounded-[20px] p-4 shadow-sm hover:shadow-[0_8px_24px_rgba(0,0,0,0.04)] transition-all duration-300 hover:border-[#e2bf74]/50 flex flex-col h-[200px]"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div
                            className={`h-12 w-12 rounded-2xl flex items-center justify-center ${meta.bg} ${meta.color} shadow-inner`}
                          >
                            <FileTypeIcon
                              className="h-6 w-6"
                              strokeWidth={1.5}
                            />
                          </div>
                          <span className="text-[10px] font-black bg-gray-100 text-gray-600 px-2.5 py-1 rounded-lg flex items-center gap-1 border border-gray-200/50">
                            <catInfo.icon className="h-3 w-3" /> {catInfo.label}
                          </span>
                        </div>

                        <div className="min-w-0 flex-1">
                          <h4
                            className="text-[13px] font-black text-[#06111d] truncate mb-1"
                            title={file.fileName}
                          >
                            {file.fileName}
                          </h4>
                          <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400">
                            <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">
                              {meta.label}
                            </span>
                            <span>{formatBytes(file.fileSize)}</span>
                          </div>
                        </div>

                        <div className="pt-3 mt-auto border-t border-gray-100 flex items-center justify-between">
                          <div className="flex items-center gap-2 max-w-[50%]">
                            <div className="h-6 w-6 rounded-full bg-[#123f59] flex items-center justify-center text-white text-[9px] font-black shrink-0">
                              {file.uploadedBy?.name?.charAt(0) || (
                                <User className="h-3 w-3" />
                              )}
                            </div>
                            <div className="truncate">
                              <p className="text-[9px] font-black text-gray-700 truncate">
                                {file.uploadedBy?.name || "مستخدم النظام"}
                              </p>
                              <p className="text-[8px] font-bold text-gray-400 flex items-center gap-0.5">
                                <Clock className="h-2.5 w-2.5" />{" "}
                                {new Date(file.createdAt).toLocaleDateString(
                                  "ar-SA",
                                )}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {/* 🚀 إرسال البيانات للمودل بصيغته المتوقعة تماماً */}
                            <button
                              onClick={() =>
                                setFileToView({
                                  url: file.filePath,
                                  extension: file.fileName
                                    ?.split(".")
                                    .pop()
                                    ?.toLowerCase(),
                                  name: file.fileName,
                                  originalName: file.fileName,
                                  size: file.fileSize,
                                })
                              }
                              className="h-8 w-8 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white flex items-center justify-center transition shadow-sm"
                              title="معاينة الملف"
                            >
                              <Eye className="h-4 w-4" />
                            </button>

                            <a
                              href={
                                api.defaults.baseURL.replace("/api", "") +
                                file.filePath
                              } // 👈 استخدام الرابط الكامل للتحميل
                              download
                              target="_blank"
                              rel="noreferrer"
                              className="h-8 w-8 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white flex items-center justify-center transition shadow-sm"
                              title="تحميل"
                            >
                              <Download className="h-4 w-4" />
                            </a>

                            <button
                              onClick={() => {
                                if (
                                  window.confirm(
                                    "هل أنت متأكد من حذف هذا المستند نهائياً؟",
                                  )
                                ) {
                                  deleteMutation.mutate(file.id);
                                }
                              }}
                              className="h-8 w-8 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white flex items-center justify-center transition shadow-sm"
                              title="حذف"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {uploadModalOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#06111d]/60 backdrop-blur-sm p-4">
          <form
            onSubmit={handleUpload}
            className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95"
          >
            <div className="p-5 border-b border-gray-100 bg-gradient-to-br from-gray-50 to-white flex justify-between items-center">
              <div>
                <h3 className="font-black text-[15px] text-[#06111d]">
                  إضافة مستند جديد
                </h3>
                <p className="text-[11px] text-gray-500 font-bold mt-1">
                  يتم الرفع إلى ملف: {selectedEmp?.name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setUploadModalOpen(false)}
                className="h-8 w-8 rounded-full bg-gray-100 text-gray-500 hover:bg-rose-100 hover:text-rose-600 flex items-center justify-center transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-5 space-y-5">
              <div>
                <label className="block text-xs font-black text-gray-700 mb-2">
                  تصنيف المستند
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {ATTACHMENT_CATEGORIES.map((cat) => (
                    <button
                      type="button"
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`flex items-center gap-2 p-3 rounded-xl border text-[11px] font-black transition ${
                        selectedCategory === cat.id
                          ? `border-[#0e7490] bg-[#0e7490] text-white shadow-md`
                          : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:border-gray-300"
                      }`}
                    >
                      <cat.icon className="h-4 w-4 shrink-0" />
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-gray-700 mb-2">
                  الملف المرفق
                </label>
                <div className="relative group">
                  <input
                    type="file"
                    onChange={(e) => setFileToUpload(e.target.files[0])}
                    className="block w-full text-xs text-gray-500 file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-[11px] file:font-black file:bg-[#eef7f6] file:text-[#0e7490] hover:file:bg-[#0e7490] hover:file:text-white file:transition-all cursor-pointer border-2 border-dashed border-gray-300 rounded-2xl p-3 bg-gray-50 group-hover:border-[#0e7490]/50 transition-colors"
                  />
                </div>
              </div>
            </div>
            <div className="p-5 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setUploadModalOpen(false)}
                className="px-5 py-2.5 rounded-xl text-[12px] font-black text-gray-600 bg-white border border-gray-200 hover:bg-gray-100 transition"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={uploadMutation.isPending}
                className="px-6 py-2.5 rounded-xl text-[12px] font-black bg-[#0e7490] text-white hover:bg-[#0b5b73] shadow-[0_4px_12px_rgba(14,116,144,0.25)] flex items-center gap-2 transition disabled:opacity-70"
              >
                {uploadMutation.isPending ? (
                  "جاري الرفع..."
                ) : (
                  <>
                    <UploadCloud className="h-4 w-4" /> حفظ المستند
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ─── نافذة عرض الملفات ─── */}
      {fileToView && (
        <FileViewerModal
          file={fileToView}
          onClose={() => setFileToView(null)}
        />
      )}
    </div>
  );
}
