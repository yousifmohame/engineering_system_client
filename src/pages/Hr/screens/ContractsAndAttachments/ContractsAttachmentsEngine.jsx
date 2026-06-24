import React, { useState, useMemo, useEffect } from "react";
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
  CalendarDays,
  RefreshCw,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import api from "../../../../api/axios";
import { useAuth } from "../../../../context/AuthContext";
import FileViewerModal from "../../../FilesExplorer/modals/FileViewerModal";

// --- دوال مساعدة ---
const getFileMeta = (fileName) => {
  const ext = fileName?.split(".").pop()?.toLowerCase() || "";
  if (["png", "jpg", "jpeg", "webp", "gif", "svg"].includes(ext))
    return {
      icon: FileImage,
      color: "text-blue-600",
      bg: "bg-blue-500/20",
      label: "صورة",
    };
  if (ext === "pdf")
    return {
      icon: FileText,
      color: "text-rose-600",
      bg: "bg-rose-500/20",
      label: "PDF",
    };
  if (["zip", "rar", "7z"].includes(ext))
    return {
      icon: FileBox,
      color: "text-amber-600",
      bg: "bg-amber-500/20",
      label: "مضغوط",
    };
  return {
    icon: File,
    color: "text-gray-600",
    bg: "bg-gray-500/20",
    label: ext.toUpperCase() || "ملف",
  };
};

const formatBytes = (bytes) => {
  if (!bytes) return "0 Bytes";
  const k = 1024,
    sizes = ["Bytes", "KB", "MB", "GB"],
    i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// تحويل الميلادي إلى هجري للعرض
const getHijriDate = (gregorianDate) => {
  if (!gregorianDate) return "";
  try {
    return new Intl.DateTimeFormat("ar-SA-u-ca-islamic", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(gregorianDate));
  } catch (e) {
    return "";
  }
};

// حساب الأيام المتبقية وحالة المستند
const getDocumentStatus = (expiryDate, isPermanent) => {
  if (isPermanent || !expiryDate)
    return {
      status: "VALID",
      text: "ساري (دائم)",
      classes: "bg-emerald-500/20 text-emerald-800 border-emerald-500/30",
    };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expDate = new Date(expiryDate);
  const diffTime = expDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0)
    return {
      status: "EXPIRED",
      text: `منتهي منذ ${Math.abs(diffDays)} يوم`,
      classes:
        "bg-rose-500/20 text-rose-800 border-rose-500/30 shadow-[0_0_10px_rgba(244,63,94,0.3)]",
    };
  if (diffDays <= 30)
    return {
      status: "WARNING",
      text: `ينتهي قريباً (${diffDays} يوم)`,
      classes:
        "bg-amber-500/20 text-amber-800 border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.3)] animate-pulse",
    };
  return {
    status: "VALID",
    text: `ساري (متبقي ${diffDays} يوم)`,
    classes: "bg-emerald-500/20 text-emerald-800 border-emerald-500/30",
  };
};

const ATTACHMENT_CATEGORIES = [
  {
    id: "CONTRACT",
    label: "عقود واتفاقيات",
    icon: FileText,
    color: "text-blue-700",
    border: "border-blue-200",
  },
  {
    id: "ID_PASSPORT",
    label: "هويات وجوازات",
    icon: ShieldAlert,
    color: "text-emerald-700",
    border: "border-emerald-200",
  },
  {
    id: "CERTIFICATE",
    label: "مؤهلات وشهادات",
    icon: FileCheck,
    color: "text-purple-700",
    border: "border-purple-200",
  },
  {
    id: "OTHER",
    label: "مرفقات أخرى",
    icon: FolderOpen,
    color: "text-gray-700",
    border: "border-gray-200",
  },
];

export default function ContractsAttachmentsEngine() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmpId, setSelectedEmpId] = useState(null);
  const [activeFilter, setActiveFilter] = useState("ALL");

  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [renewingDoc, setRenewingDoc] = useState(null);
  const [fileToView, setFileToView] = useState(null);

  // حقول النموذج
  const [selectedCategory, setSelectedCategory] = useState("CONTRACT");
  const [fileToUpload, setFileToUpload] = useState(null);
  const [documentName, setDocumentName] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [isPermanent, setIsPermanent] = useState(false);
  const [notes, setNotes] = useState("");

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
    if (activeFilter !== "ALL")
      list = list.filter((f) => f.category === activeFilter);
    return list;
  }, [attachmentsRes, activeFilter]);

  const uploadMutation = useMutation({
    mutationFn: async (formData) => {
      const endpoint = renewingDoc
        ? `/employees/attachments/${renewingDoc.id}/renew`
        : `/employees/${selectedEmpId}/attachments`;
      return api.post(endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: () => {
      toast.success(
        renewingDoc
          ? "تم تجديد المستند وأرشفة القديم بنجاح"
          : "تم حفظ المستند بنجاح",
      );
      queryClient.invalidateQueries({
        queryKey: ["employeeAttachments", selectedEmpId],
      });
      closeModal();
    },
    onError: (error) =>
      toast.error(error?.response?.data?.message || "حدث خطأ أثناء حفظ الملف"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (attachmentId) =>
      api.delete(`/employees/attachments/${attachmentId}`),
    onSuccess: () => {
      toast.success("تم حذف المستند بنجاح");
      queryClient.invalidateQueries({
        queryKey: ["employeeAttachments", selectedEmpId],
      });
    },
    onError: () => toast.error("حدث خطأ أثناء الحذف"),
  });

  const closeModal = () => {
    setUploadModalOpen(false);
    setRenewingDoc(null);
    setFileToUpload(null);
    setDocumentName("");
    setIssueDate("");
    setExpiryDate("");
    setIsPermanent(false);
    setNotes("");
  };

  const openRenewModal = (doc) => {
    setRenewingDoc(doc);
    setSelectedCategory(doc.category);
    setDocumentName(doc.customName || doc.fileName);
    setIsPermanent(false);
    setUploadModalOpen(true);
  };

  const handleUpload = (e) => {
    e.preventDefault();
    if (!fileToUpload && !renewingDoc)
      return toast.error("الرجاء إرفاق النسخة الجديدة");
    if (!documentName.trim()) return toast.error("الرجاء إدخال اسم المستند");
    if (!isPermanent && !expiryDate)
      return toast.error("الرجاء تحديد تاريخ الانتهاء أو اختيار 'بدون انتهاء'");

    const formData = new FormData();
    if (fileToUpload) formData.append("file", fileToUpload);
    formData.append("category", selectedCategory);
    formData.append("customName", documentName);
    if (issueDate) formData.append("issueDate", issueDate);
    formData.append("isPermanent", isPermanent);
    if (!isPermanent && expiryDate) formData.append("expiryDate", expiryDate);
    formData.append("notes", notes);

    uploadMutation.mutate(formData);
  };

  const selectedEmp = employees.find((e) => e.id === selectedEmpId);

  return (
    <div
      className="flex h-full w-full overflow-hidden bg-gradient-to-br from-[#e0eafc] to-[#cfdef3] font-cairo relative"
      dir="rtl"
    >
      {/* خلفية جمالية للتصميم الزجاجي */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-300 rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-blob"></div>
      <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-teal-300 rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] bg-amber-200 rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-blob animation-delay-4000"></div>

      {/* ─── القائمة الجانبية ─── */}
      <div className="w-80 shrink-0 bg-white/40 backdrop-blur-xl border-l border-white/50 flex flex-col z-10 shadow-[8px_0_32px_rgba(31,38,135,0.05)]">
        <div className="p-5 border-b border-white/40">
          <h3 className="text-[15px] font-black text-[#123f59] mb-4 flex items-center gap-2 drop-shadow-sm">
            <User className="h-5 w-5" /> سجل الموظفين
          </h3>
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder="ابحث بالاسم أو الرقم..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-11 pl-3 pr-10 rounded-2xl border border-white/60 bg-white/30 backdrop-blur-sm text-[13px] font-bold outline-none transition focus:bg-white/60 focus:ring-2 focus:ring-teal-400/30 placeholder-gray-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
          {isLoadingEmployees ? (
            <div className="p-4 text-center text-sm font-bold text-gray-600 animate-pulse">
              جاري التحميل...
            </div>
          ) : (
            filteredEmployees.map((emp) => (
              <button
                key={emp.id}
                onClick={() => setSelectedEmpId(emp.id)}
                className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all duration-300 border ${
                  selectedEmpId === emp.id
                    ? "bg-[#123f59]/80 backdrop-blur-md border-[#123f59] shadow-lg text-white"
                    : "bg-white/30 border-white/40 hover:bg-white/60 text-[#123f59]"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`h-11 w-11 rounded-[14px] flex items-center justify-center shrink-0 font-black text-sm shadow-inner ${selectedEmpId === emp.id ? "bg-white/20 text-white" : "bg-gradient-to-br from-teal-400/20 to-teal-600/20 text-teal-800 border border-teal-500/20"}`}
                  >
                    {emp.name?.charAt(0)}
                  </div>
                  <div className="text-right min-w-0 flex-1">
                    <p className="text-[13px] font-black truncate drop-shadow-sm">
                      {emp.name}
                    </p>
                    <p
                      className={`text-[10px] font-bold mt-1 ${selectedEmpId === emp.id ? "text-teal-100" : "text-gray-600"}`}
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

      {/* ─── مساحة العمل ─── */}
      <div className="flex-1 flex flex-col min-w-0 z-10 relative">
        {!selectedEmpId ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500 gap-5">
            <div className="h-32 w-32 rounded-full bg-white/30 backdrop-blur-xl border border-white/50 flex items-center justify-center shadow-xl">
              <FolderOpen className="h-14 w-14 text-teal-600/60" />
            </div>
            <p className="text-lg font-black drop-shadow-md text-[#123f59]">
              يرجى اختيار موظف لاستعراض محفظة المستندات
            </p>
          </div>
        ) : (
          <>
            <div className="shrink-0 p-6 border-b border-white/40 flex flex-wrap gap-4 items-center justify-between bg-white/40 backdrop-blur-md">
              <div>
                <h2 className="text-xl font-black text-[#123f59] flex items-center gap-3 drop-shadow-sm">
                  {selectedEmp?.name}
                  {selectedEmp?.status === "active" ? (
                    <span className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-800 text-[11px] px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                      <CheckCircle2 className="h-3.5 w-3.5" /> نشط
                    </span>
                  ) : (
                    <span className="bg-rose-500/20 border border-rose-500/30 text-rose-800 text-[11px] px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                      <AlertCircle className="h-3.5 w-3.5" /> غير نشط
                    </span>
                  )}
                </h2>

                <div className="flex flex-wrap items-center gap-2 mt-4">
                  <button
                    onClick={() => setActiveFilter("ALL")}
                    className={`px-4 py-1.5 rounded-xl text-[11px] font-black transition-all border ${activeFilter === "ALL" ? "bg-[#123f59]/80 text-white border-[#123f59] shadow-md" : "bg-white/40 border-white/50 text-[#123f59] hover:bg-white/60"}`}
                  >
                    الكل
                  </button>
                  {ATTACHMENT_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setActiveFilter(cat.id)}
                      className={`px-4 py-1.5 rounded-xl text-[11px] font-black transition-all flex items-center gap-1.5 border ${activeFilter === cat.id ? "bg-[#123f59]/80 text-white border-[#123f59] shadow-md" : `bg-white/40 border-white/50 ${cat.color} hover:bg-white/60`}`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setUploadModalOpen(true)}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-teal-500 to-teal-600 px-6 text-[13px] font-black text-white shadow-[0_8px_20px_rgba(20,184,166,0.3)] transition-all hover:scale-105 hover:shadow-[0_10px_25px_rgba(20,184,166,0.4)] border border-teal-400/50"
              >
                <UploadCloud className="h-5 w-5" /> إضافة مستند جديد
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              {isLoadingAttachments ? (
                <div className="flex justify-center items-center h-full">
                  <p className="font-bold text-[#123f59] animate-pulse text-lg">
                    جاري استحضار المستندات...
                  </p>
                </div>
              ) : attachments.length === 0 ? (
                <div className="text-center py-32 text-gray-500">
                  <FileText className="h-16 w-16 mx-auto mb-4 text-[#123f59]/30" />
                  <p className="font-black text-lg drop-shadow-sm">
                    لا توجد مستندات مسجلة ضمن هذا التصنيف.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
                  {attachments.map((file) => {
                    const catInfo =
                      ATTACHMENT_CATEGORIES.find(
                        (c) => c.id === file.category,
                      ) || ATTACHMENT_CATEGORIES[3];
                    const meta = getFileMeta(file.fileName);
                    const FileTypeIcon = meta.icon;
                    const docStatus = getDocumentStatus(
                      file.expiryDate,
                      file.isPermanent,
                    );

                    return (
                      <div
                        key={file.id}
                        className="group relative bg-white/40 backdrop-blur-xl border border-white/60 rounded-[28px] p-5 shadow-[0_8px_32px_rgba(31,38,135,0.07)] hover:bg-white/60 hover:-translate-y-1 transition-all duration-300 flex flex-col h-[260px] overflow-hidden"
                      >
                        {/* غلور في خلفية الكرت لجمالية إضافية */}
                        <div className="absolute -top-10 -right-10 w-24 h-24 bg-white/40 rounded-full blur-2xl"></div>

                        {/* الهيدر (الحالة والتصنيف) */}
                        <div className="flex justify-between items-start mb-3 z-10">
                          <div
                            className={`px-2.5 py-1 rounded-xl text-[10px] font-black border flex items-center gap-1 backdrop-blur-sm ${docStatus.classes}`}
                          >
                            {docStatus.status === "EXPIRED" ? (
                              <AlertCircle className="h-3 w-3" />
                            ) : (
                              <CheckCircle2 className="h-3 w-3" />
                            )}
                            {docStatus.text}
                          </div>
                          <div
                            className={`h-12 w-12 rounded-2xl flex items-center justify-center ${meta.bg} ${meta.color} border border-white/50 shadow-inner`}
                          >
                            <FileTypeIcon
                              className="h-6 w-6"
                              strokeWidth={1.5}
                            />
                          </div>
                        </div>

                        {/* البيانات */}
                        <div className="z-10 flex-1">
                          <span
                            className={`text-[9px] font-black px-2 py-0.5 rounded-lg border bg-white/50 backdrop-blur-sm ${catInfo.border} ${catInfo.color} mb-2 inline-block`}
                          >
                            {catInfo.label}
                          </span>
                          <h4
                            className="text-[15px] font-black text-[#123f59] truncate mb-1 drop-shadow-sm"
                            title={file.customName || file.fileName}
                          >
                            {file.customName || file.fileName}
                          </h4>
                          <p
                            className="text-[10px] font-bold text-gray-500 truncate"
                            dir="ltr"
                          >
                            {file.fileName}
                          </p>

                          {/* التواريخ */}
                          {(file.issueDate || file.expiryDate) && (
                            <div className="mt-3 space-y-1 text-[10px] font-bold text-[#123f59]/80 bg-white/30 p-2 rounded-xl border border-white/40">
                              {file.issueDate && (
                                <p className="flex justify-between">
                                  <span>الإصدار:</span>{" "}
                                  <span>
                                    {new Date(
                                      file.issueDate,
                                    ).toLocaleDateString("ar-SA")}
                                  </span>
                                </p>
                              )}
                              {file.expiryDate && !file.isPermanent && (
                                <p className="flex justify-between">
                                  <span>الانتهاء:</span>{" "}
                                  <span>
                                    {new Date(
                                      file.expiryDate,
                                    ).toLocaleDateString("ar-SA")}
                                  </span>
                                </p>
                              )}
                            </div>
                          )}
                        </div>

                        {/* الأزرار والإجراءات */}
                        <div className="pt-4 mt-auto border-t border-white/50 flex items-center justify-between z-10">
                          <div className="flex gap-1.5">
                            {docStatus.status === "EXPIRED" && (
                              <button
                                onClick={() => openRenewModal(file)}
                                className="h-9 px-3 rounded-xl bg-indigo-500/20 text-indigo-700 border border-indigo-500/30 hover:bg-indigo-500/40 text-[11px] font-black flex items-center gap-1.5 shadow-sm transition"
                              >
                                <RefreshCw className="h-3.5 w-3.5" /> تجديد
                              </button>
                            )}
                            <button
                              onClick={() =>
                                setFileToView({
                                  url: file.filePath,
                                  extension: file.fileName
                                    ?.split(".")
                                    .pop()
                                    ?.toLowerCase(),
                                  name: file.customName || file.fileName,
                                })
                              }
                              className="h-9 w-9 rounded-xl bg-white/50 text-[#123f59] border border-white/60 hover:bg-white flex items-center justify-center shadow-sm transition"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <a
                              href={
                                api.defaults.baseURL.replace("/api", "") +
                                file.filePath
                              }
                              download
                              target="_blank"
                              rel="noreferrer"
                              className="h-9 w-9 rounded-xl bg-white/50 text-emerald-600 border border-white/60 hover:bg-white flex items-center justify-center shadow-sm transition"
                            >
                              <Download className="h-4 w-4" />
                            </a>
                          </div>

                          <button
                            onClick={() =>
                              window.confirm(
                                "هل أنت متأكد من حذف المستند نهائياً؟",
                              ) && deleteMutation.mutate(file.id)
                            }
                            className="h-9 w-9 rounded-xl bg-rose-500/10 text-rose-600 border border-rose-500/20 hover:bg-rose-500 hover:text-white flex items-center justify-center shadow-sm transition"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
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

      {/* ─── نافذة الرفع والتجديد (Liquid Glass) ─── */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-[#06111d]/40 backdrop-blur-md overflow-y-auto">
          <form
            onSubmit={handleUpload}
            className="bg-white/60 backdrop-blur-2xl border border-white/70 rounded-[32px] w-full max-w-2xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] my-auto relative overflow-hidden"
          >
            {/* تأثيرات لونية داخل المودل */}
            <div className="absolute top-0 right-0 w-full h-32 bg-gradient-to-b from-teal-400/20 to-transparent pointer-events-none"></div>

            <div className="p-6 border-b border-white/50 flex justify-between items-center relative z-10">
              <div>
                <h3 className="font-black text-xl text-[#123f59] flex items-center gap-2 drop-shadow-sm">
                  {renewingDoc ? (
                    <RefreshCw className="h-6 w-6 text-indigo-600" />
                  ) : (
                    <UploadCloud className="h-6 w-6 text-teal-600" />
                  )}
                  {renewingDoc ? "تجديد مستند منتهي" : "إضافة مستند جديد"}
                </h3>
                <p className="text-[12px] text-gray-600 font-bold mt-1">
                  يتم الحفظ في ملف الموظف:{" "}
                  <span className="text-teal-700">{selectedEmp?.name}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="h-10 w-10 rounded-full bg-white/50 border border-white/60 text-gray-600 hover:bg-rose-500/20 hover:text-rose-600 flex items-center justify-center transition shadow-sm"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 relative z-10">
              {/* التصنيف (معطل في حالة التجديد للحفاظ على نفس التصنيف) */}
              <div>
                <label className="block text-[13px] font-black text-[#123f59] mb-2 drop-shadow-sm">
                  تصنيف المستند
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {ATTACHMENT_CATEGORIES.map((cat) => (
                    <button
                      type="button"
                      key={cat.id}
                      disabled={!!renewingDoc}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border transition-all duration-300 ${
                        selectedCategory === cat.id
                          ? `bg-[#123f59]/90 backdrop-blur-md text-white border-[#123f59] shadow-lg scale-105`
                          : "bg-white/40 border-white/60 text-[#123f59] hover:bg-white/70 disabled:opacity-50 disabled:hover:scale-100"
                      }`}
                    >
                      <cat.icon className="h-5 w-5" />
                      <span className="text-[11px] font-black">
                        {cat.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* اسم المستند */}
              <div>
                <label className="block text-[13px] font-black text-[#123f59] mb-2 drop-shadow-sm">
                  اسم المستند (كما سيظهر في النظام)
                </label>
                <input
                  type="text"
                  required
                  value={documentName}
                  onChange={(e) => setDocumentName(e.target.value)}
                  className="w-full h-12 px-4 bg-white/50 backdrop-blur-sm border border-white/60 rounded-2xl text-[14px] font-bold text-[#123f59] outline-none focus:bg-white/80 focus:ring-2 focus:ring-teal-500/40 transition-all placeholder-gray-400 shadow-inner"
                  placeholder="مثال: هوية وطنية، عقد عمل، شهادة هندسية..."
                />
              </div>

              {/* التواريخ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* تاريخ الإصدار */}
                <div className="bg-white/30 backdrop-blur-sm p-4 rounded-2xl border border-white/50">
                  <label className="block text-[12px] font-black text-[#123f59] mb-2">
                    تاريخ الإصدار (اختياري)
                  </label>
                  <input
                    type="date"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="w-full h-11 px-3 bg-white/60 border border-white/60 rounded-xl text-sm font-bold outline-none focus:bg-white focus:ring-2 focus:ring-teal-500/40"
                  />
                  {issueDate && (
                    <p className="text-[11px] text-teal-700 font-bold mt-2 bg-teal-500/10 p-1.5 rounded-lg border border-teal-500/20 text-center">
                      يوافق هجري: {getHijriDate(issueDate)}
                    </p>
                  )}
                </div>

                {/* تاريخ الانتهاء */}
                <div className="bg-white/30 backdrop-blur-sm p-4 rounded-2xl border border-white/50">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[12px] font-black text-[#123f59]">
                      تاريخ الانتهاء
                    </label>
                    <label className="flex items-center gap-1.5 text-[11px] font-bold text-[#123f59] cursor-pointer bg-white/50 px-2 py-1 rounded-lg border border-white/60">
                      <input
                        type="checkbox"
                        checked={isPermanent}
                        onChange={(e) => {
                          setIsPermanent(e.target.checked);
                          if (e.target.checked) setExpiryDate("");
                        }}
                        className="accent-teal-600 w-3.5 h-3.5"
                      />
                      بدون تاريخ (دائم)
                    </label>
                  </div>
                  <input
                    type="date"
                    disabled={isPermanent}
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full h-11 px-3 bg-white/60 border border-white/60 rounded-xl text-sm font-bold outline-none focus:bg-white focus:ring-2 focus:ring-rose-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  {expiryDate && !isPermanent && (
                    <p className="text-[11px] text-rose-700 font-bold mt-2 bg-rose-500/10 p-1.5 rounded-lg border border-rose-500/20 text-center">
                      يوافق هجري: {getHijriDate(expiryDate)}
                    </p>
                  )}
                </div>
              </div>

              {/* الملاحظات */}
              <div>
                <label className="flex items-center gap-2 text-[13px] font-black text-[#123f59] mb-2 drop-shadow-sm">
                  ملاحظات{" "}
                  {renewingDoc && (
                    <span className="text-rose-600 text-[10px] bg-rose-100 px-2 py-0.5 rounded-lg">
                      إجباري لبيان سبب التجديد
                    </span>
                  )}
                </label>
                <textarea
                  value={notes}
                  required={!!renewingDoc}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-4 bg-white/50 backdrop-blur-sm border border-white/60 rounded-2xl text-[13px] font-bold text-[#123f59] outline-none focus:bg-white/80 focus:ring-2 focus:ring-teal-500/40 transition-all shadow-inner custom-scrollbar"
                  rows="2"
                  placeholder="أضف أي ملاحظات أو تفاصيل إضافية..."
                ></textarea>
              </div>

              {/* رفع الملف */}
              <div className="bg-white/40 backdrop-blur-md border-2 border-dashed border-teal-500/40 rounded-3xl p-5 text-center hover:bg-white/60 transition-all relative group overflow-hidden">
                <input
                  type="file"
                  onChange={(e) => setFileToUpload(e.target.files[0])}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                />
                <div className="relative z-10 pointer-events-none flex flex-col items-center gap-3">
                  <div
                    className={`h-14 w-14 rounded-full flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 ${fileToUpload ? "bg-teal-500 text-white" : "bg-white border border-teal-200 text-teal-600"}`}
                  >
                    {fileToUpload ? (
                      <CheckCircle2 className="h-7 w-7" />
                    ) : (
                      <UploadCloud className="h-7 w-7" />
                    )}
                  </div>
                  <div>
                    <p className="text-[14px] font-black text-[#123f59]">
                      {fileToUpload
                        ? fileToUpload.name
                        : "اضغط هنا لاختيار المستند المرفق"}
                    </p>
                    <p className="text-[11px] font-bold text-gray-500 mt-1">
                      يدعم PDF, الصور, والملفات المضغوطة
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white/30 backdrop-blur-md border-t border-white/50 flex justify-end gap-4 relative z-10">
              <button
                type="button"
                onClick={closeModal}
                className="px-6 py-2.5 rounded-2xl text-[13px] font-black text-[#123f59] bg-white/50 border border-white/60 hover:bg-white transition-all shadow-sm"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={uploadMutation.isPending}
                className="px-8 py-2.5 rounded-2xl text-[13px] font-black bg-gradient-to-r from-teal-500 to-teal-600 text-white hover:from-teal-600 hover:to-teal-700 shadow-[0_8px_20px_rgba(20,184,166,0.3)] flex items-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {uploadMutation.isPending ? (
                  <RefreshCw className="h-5 w-5 animate-spin" />
                ) : renewingDoc ? (
                  <RefreshCw className="h-5 w-5" />
                ) : (
                  <UploadCloud className="h-5 w-5" />
                )}
                {uploadMutation.isPending
                  ? "جاري المعالجة..."
                  : renewingDoc
                    ? "اعتماد التجديد"
                    : "حفظ المستند"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ─── نافذة العرض ─── */}
      {fileToView && (
        <FileViewerModal
          file={fileToView}
          onClose={() => setFileToView(null)}
        />
      )}
    </div>
  );
}
