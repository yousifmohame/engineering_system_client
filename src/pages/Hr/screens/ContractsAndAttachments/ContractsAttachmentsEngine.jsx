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
  X,
  RefreshCw,
  Sparkles,
  Clock
} from "lucide-react";
import { toast } from "sonner";
import api from "../../../../api/axios";
import { useAuth } from "../../../../context/AuthContext";
// استيراد دالة getFullUrl لتظبيط الروابط
import { getFullUrl } from "../../../../utils/urlUtils";

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

const formatDateTime = (dateString) => {
  if (!dateString) return "غير متوفر";
  const d = new Date(dateString);
  return {
    date: d.toLocaleDateString("ar-SA"),
    time: d.toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" }),
  };
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
  const { user } = useAuth(); // استدعاء AuthContext لمعرفة المستخدم الحالي

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
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-300 rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-blob"></div>
      <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-teal-300 rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] bg-amber-200 rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-blob animation-delay-4000"></div>

      {/* ─── القائمة الجانبية ─── */}
      <div className="w-80 shrink-0 bg-white/40 backdrop-blur-xl border-l border-white/50 flex flex-col z-10 shadow-[8px_0_32px_rgba(31,38,135,0.05)]">
        <div className="p-5 border-b border-white/40">
          <h3 className="text-lg font-black text-[#123f59] mb-4 flex items-center gap-2 drop-shadow-sm">
            <User className="h-6 w-6" /> سجل الموظفين
          </h3>
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
            <input
              type="text"
              placeholder="ابحث بالاسم أو الرقم..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-12 pl-3 pr-10 rounded-2xl border border-white/60 bg-white/30 backdrop-blur-sm text-sm font-bold outline-none transition focus:bg-white/60 focus:ring-2 focus:ring-teal-400/30 placeholder-gray-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
          {isLoadingEmployees ? (
            <div className="p-4 text-center text-base font-bold text-gray-600 animate-pulse">
              جاري التحميل...
            </div>
          ) : (
            filteredEmployees.map((emp) => (
              <button
                key={emp.id}
                onClick={() => setSelectedEmpId(emp.id)}
                className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-300 border ${
                  selectedEmpId === emp.id
                    ? "bg-[#123f59]/90 backdrop-blur-md border-[#123f59] shadow-lg text-white scale-[1.02]"
                    : "bg-white/40 border-white/40 hover:bg-white/60 text-[#123f59]"
                }`}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div
                    className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 font-black text-lg shadow-inner ${selectedEmpId === emp.id ? "bg-white/20 text-white" : "bg-gradient-to-br from-teal-400/20 to-teal-600/20 text-teal-800 border border-teal-500/20"}`}
                  >
                    {emp.name?.charAt(0)}
                  </div>
                  <div className="text-right min-w-0 flex-1">
                    <p className="text-base font-black truncate drop-shadow-sm">
                      {emp.name}
                    </p>
                    <p
                      className={`text-xs font-bold mt-1 ${selectedEmpId === emp.id ? "text-teal-100" : "text-gray-600"}`}
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
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500 gap-6">
            <div className="h-36 w-36 rounded-full bg-white/30 backdrop-blur-xl border border-white/50 flex items-center justify-center shadow-xl">
              <FolderOpen className="h-16 w-16 text-teal-600/60" />
            </div>
            <p className="text-2xl font-black drop-shadow-md text-[#123f59]">
              يرجى اختيار موظف لاستعراض محفظة المستندات
            </p>
          </div>
        ) : (
          <>
            <div className="shrink-0 p-6 border-b border-white/40 flex flex-wrap gap-4 items-center justify-between bg-white/40 backdrop-blur-md">
              <div>
                <h2 className="text-2xl font-black text-[#123f59] flex items-center gap-3 drop-shadow-sm">
                  {selectedEmp?.name}
                  {selectedEmp?.status === "active" ? (
                    <span className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-800 text-sm px-4 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
                      <CheckCircle2 className="h-4 w-4" /> نشط
                    </span>
                  ) : (
                    <span className="bg-rose-500/20 border border-rose-500/30 text-rose-800 text-sm px-4 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
                      <AlertCircle className="h-4 w-4" /> غير نشط
                    </span>
                  )}
                </h2>

                <div className="flex flex-wrap items-center gap-3 mt-5">
                  <button
                    onClick={() => setActiveFilter("ALL")}
                    className={`px-5 py-2 rounded-xl text-sm font-black transition-all border ${activeFilter === "ALL" ? "bg-[#123f59]/90 text-white border-[#123f59] shadow-md" : "bg-white/50 border-white/60 text-[#123f59] hover:bg-white/80"}`}
                  >
                    الكل
                  </button>
                  {ATTACHMENT_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setActiveFilter(cat.id)}
                      className={`px-5 py-2 rounded-xl text-sm font-black transition-all flex items-center gap-2 border ${activeFilter === cat.id ? "bg-[#123f59]/90 text-white border-[#123f59] shadow-md" : `bg-white/50 border-white/60 ${cat.color} hover:bg-white/80`}`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setUploadModalOpen(true)}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-teal-500 to-teal-600 px-8 text-base font-black text-white shadow-[0_8px_20px_rgba(20,184,166,0.3)] transition-all hover:scale-105 hover:shadow-[0_10px_25px_rgba(20,184,166,0.4)] border border-teal-400/50"
              >
                <UploadCloud className="h-6 w-6" /> إضافة مستند جديد
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              {isLoadingAttachments ? (
                <div className="flex justify-center items-center h-full">
                  <p className="font-bold text-[#123f59] animate-pulse text-xl">
                    جاري استحضار المستندات...
                  </p>
                </div>
              ) : attachments.length === 0 ? (
                <div className="text-center py-32 text-gray-500">
                  <FileText className="h-20 w-20 mx-auto mb-5 text-[#123f59]/30" />
                  <p className="font-black text-xl drop-shadow-sm">
                    لا توجد مستندات مسجلة ضمن هذا التصنيف.
                  </p>
                </div>
              ) : (
                <div className="bg-white/50 backdrop-blur-xl border border-white/60 rounded-3xl overflow-hidden shadow-lg">
                  <div className="overflow-x-auto">
                    <table className="w-full text-right border-collapse">
                      <thead>
                        <tr className="bg-[#123f59]/10 text-[#123f59] border-b border-white/60">
                          <th className="p-5 font-black text-base whitespace-nowrap">المستند</th>
                          <th className="p-5 font-black text-base whitespace-nowrap">التصنيف</th>
                          <th className="p-5 font-black text-base whitespace-nowrap">الرفع والاعتماد</th>
                          <th className="p-5 font-black text-base whitespace-nowrap">التواريخ</th>
                          <th className="p-5 font-black text-base whitespace-nowrap">الحالة</th>
                          <th className="p-5 font-black text-base whitespace-nowrap text-center">الإجراءات</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/40">
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
                          const uploadedAt = formatDateTime(file.createdAt);
                          const uploaderName = file.uploadedBy?.name || user?.name || "النظام";

                          return (
                            <tr
                              key={file.id}
                              className="hover:bg-white/60 transition-colors duration-200 group"
                            >
                              <td className="p-5 align-middle">
                                <div className="flex items-center gap-4">
                                  <div className={`h-12 w-12 shrink-0 rounded-2xl flex items-center justify-center ${meta.bg} ${meta.color} border border-white/50 shadow-inner`}>
                                    <FileTypeIcon className="h-6 w-6" strokeWidth={1.5} />
                                  </div>
                                  <div>
                                    <h4 className="text-base font-black text-[#123f59] mb-1 drop-shadow-sm max-w-[200px] truncate" title={file.customName || file.fileName}>
                                      {file.customName || file.fileName}
                                    </h4>
                                    <p className="text-xs font-bold text-gray-500 truncate max-w-[200px]" dir="ltr">
                                      {file.fileName}
                                    </p>
                                  </div>
                                </div>
                              </td>

                              <td className="p-5 align-middle">
                                <span className={`text-sm font-black px-3 py-1.5 rounded-xl border bg-white/50 backdrop-blur-sm ${catInfo.border} ${catInfo.color} inline-flex items-center gap-1.5`}>
                                  <catInfo.icon className="h-4 w-4" />
                                  {catInfo.label}
                                </span>
                              </td>

                              <td className="p-5 align-middle">
                                <div className="flex flex-col gap-1.5">
                                  <div className="flex items-center gap-2 text-sm font-bold text-[#123f59]">
                                    <User className="h-4 w-4 text-teal-600" />
                                    <span>{uploaderName}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                                    <Clock className="h-3.5 w-3.5" />
                                    <span>{uploadedAt.date} - {uploadedAt.time}</span>
                                  </div>
                                </div>
                              </td>

                              <td className="p-5 align-middle">
                                <div className="flex flex-col gap-1 text-sm font-bold text-[#123f59]">
                                  {file.issueDate && (
                                    <p className="flex items-center gap-2">
                                      <span className="text-gray-500">الإصدار:</span>
                                      {new Date(file.issueDate).toLocaleDateString("ar-SA")}
                                    </p>
                                  )}
                                  {file.expiryDate && !file.isPermanent ? (
                                    <p className="flex items-center gap-2">
                                      <span className="text-gray-500">الانتهاء:</span>
                                      {new Date(file.expiryDate).toLocaleDateString("ar-SA")}
                                    </p>
                                  ) : (
                                    <p className="flex items-center gap-2 text-emerald-600">
                                      <span className="text-gray-500">الانتهاء:</span>
                                      دائم
                                    </p>
                                  )}
                                </div>
                              </td>

                              <td className="p-5 align-middle">
                                <div className={`inline-flex px-3 py-1.5 rounded-xl text-sm font-black border items-center gap-1.5 backdrop-blur-sm ${docStatus.classes}`}>
                                  {docStatus.status === "EXPIRED" ? (
                                    <AlertCircle className="h-4 w-4" />
                                  ) : (
                                    <CheckCircle2 className="h-4 w-4" />
                                  )}
                                  {docStatus.text}
                                </div>
                              </td>

                              <td className="p-5 align-middle">
                                <div className="flex items-center justify-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                                  {docStatus.status === "EXPIRED" && (
                                    <button
                                      onClick={() => openRenewModal(file)}
                                      className="h-10 px-4 rounded-xl bg-indigo-500/10 text-indigo-700 border border-indigo-500/20 hover:bg-indigo-500 hover:text-white text-sm font-black flex items-center gap-1.5 transition-all"
                                      title="تجديد المستند"
                                    >
                                      <RefreshCw className="h-4 w-4" /> تجديد
                                    </button>
                                  )}
                                  <button
                                    onClick={() => setFileToView(file)}
                                    className="h-10 w-10 rounded-xl bg-white/50 text-[#123f59] border border-white/60 hover:bg-white hover:shadow-md flex items-center justify-center transition-all"
                                    title="معاينة ونتائج الذكاء الاصطناعي"
                                  >
                                    <Eye className="h-5 w-5" />
                                  </button>
                                  {/* تم استخدام getFullUrl هنا */}
                                  <a
                                    href={getFullUrl(file.filePath)}
                                    download={file.fileName}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="h-10 w-10 rounded-xl bg-white/50 text-emerald-600 border border-white/60 hover:bg-white hover:shadow-md flex items-center justify-center transition-all"
                                    title="تحميل"
                                  >
                                    <Download className="h-5 w-5" />
                                  </a>
                                  <button
                                    onClick={() =>
                                      window.confirm("هل أنت متأكد من حذف المستند نهائياً؟") &&
                                      deleteMutation.mutate(file.id)
                                    }
                                    className="h-10 w-10 rounded-xl bg-rose-500/10 text-rose-600 border border-rose-500/20 hover:bg-rose-500 hover:text-white flex items-center justify-center transition-all"
                                    title="حذف المستند"
                                  >
                                    <Trash2 className="h-5 w-5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* ─── نافذة الرفع والتجديد (Liquid Glass) ─── */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-[#06111d]/60 backdrop-blur-md overflow-y-auto">
          <form
            onSubmit={handleUpload}
            className="bg-white/80 backdrop-blur-2xl border border-white/70 rounded-[32px] w-full max-w-2xl shadow-[0_20px_60px_rgba(0,0,0,0.2)] my-auto relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-full h-32 bg-gradient-to-b from-teal-400/20 to-transparent pointer-events-none"></div>

            <div className="p-6 border-b border-white/50 flex justify-between items-center relative z-10">
              <div>
                <h3 className="font-black text-2xl text-[#123f59] flex items-center gap-3 drop-shadow-sm">
                  {renewingDoc ? (
                    <RefreshCw className="h-7 w-7 text-indigo-600" />
                  ) : (
                    <UploadCloud className="h-7 w-7 text-teal-600" />
                  )}
                  {renewingDoc ? "تجديد مستند منتهي" : "إضافة مستند جديد"}
                </h3>
                <p className="text-sm text-gray-600 font-bold mt-1">
                  يتم الحفظ في ملف الموظف:{" "}
                  <span className="text-teal-700">{selectedEmp?.name}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="h-12 w-12 rounded-full bg-white/50 border border-white/60 text-gray-600 hover:bg-rose-500/20 hover:text-rose-600 flex items-center justify-center transition shadow-sm"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-6 relative z-10">
              <div>
                <label className="block text-sm font-black text-[#123f59] mb-3 drop-shadow-sm">
                  تصنيف المستند
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {ATTACHMENT_CATEGORIES.map((cat) => (
                    <button
                      type="button"
                      key={cat.id}
                      disabled={!!renewingDoc}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`flex flex-col items-center justify-center gap-3 p-4 rounded-2xl border transition-all duration-300 ${
                        selectedCategory === cat.id
                          ? `bg-[#123f59]/90 backdrop-blur-md text-white border-[#123f59] shadow-lg scale-[1.03]`
                          : "bg-white/50 border-white/60 text-[#123f59] hover:bg-white/80 disabled:opacity-50 disabled:hover:scale-100"
                      }`}
                    >
                      <cat.icon className="h-6 w-6" />
                      <span className="text-sm font-black">
                        {cat.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-black text-[#123f59] mb-3 drop-shadow-sm">
                  اسم المستند (كما سيظهر في النظام)
                </label>
                <input
                  type="text"
                  required
                  value={documentName}
                  onChange={(e) => setDocumentName(e.target.value)}
                  className="w-full h-14 px-5 bg-white/60 backdrop-blur-sm border border-white/60 rounded-2xl text-base font-bold text-[#123f59] outline-none focus:bg-white/90 focus:ring-2 focus:ring-teal-500/40 transition-all placeholder-gray-400 shadow-inner"
                  placeholder="مثال: هوية وطنية، عقد عمل، شهادة هندسية..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="bg-white/40 backdrop-blur-sm p-5 rounded-2xl border border-white/60">
                  <label className="block text-sm font-black text-[#123f59] mb-3">
                    تاريخ الإصدار (اختياري)
                  </label>
                  <input
                    type="date"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="w-full h-12 px-4 bg-white/70 border border-white/60 rounded-xl text-base font-bold outline-none focus:bg-white focus:ring-2 focus:ring-teal-500/40"
                  />
                  {issueDate && (
                    <p className="text-sm text-teal-700 font-bold mt-3 bg-teal-500/10 p-2 rounded-lg border border-teal-500/20 text-center">
                      يوافق هجري: {getHijriDate(issueDate)}
                    </p>
                  )}
                </div>

                <div className="bg-white/40 backdrop-blur-sm p-5 rounded-2xl border border-white/60">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-black text-[#123f59]">
                      تاريخ الانتهاء
                    </label>
                    <label className="flex items-center gap-2 text-sm font-bold text-[#123f59] cursor-pointer bg-white/60 px-3 py-1.5 rounded-lg border border-white/60">
                      <input
                        type="checkbox"
                        checked={isPermanent}
                        onChange={(e) => {
                          setIsPermanent(e.target.checked);
                          if (e.target.checked) setExpiryDate("");
                        }}
                        className="accent-teal-600 w-4 h-4"
                      />
                      بدون تاريخ (دائم)
                    </label>
                  </div>
                  <input
                    type="date"
                    disabled={isPermanent}
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full h-12 px-4 bg-white/70 border border-white/60 rounded-xl text-base font-bold outline-none focus:bg-white focus:ring-2 focus:ring-rose-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  {expiryDate && !isPermanent && (
                    <p className="text-sm text-rose-700 font-bold mt-3 bg-rose-500/10 p-2 rounded-lg border border-rose-500/20 text-center">
                      يوافق هجري: {getHijriDate(expiryDate)}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-black text-[#123f59] mb-3 drop-shadow-sm">
                  ملاحظات{" "}
                  {renewingDoc && (
                    <span className="text-rose-600 text-xs bg-rose-100 px-2 py-1 rounded-lg">
                      إجباري لبيان سبب التجديد
                    </span>
                  )}
                </label>
                <textarea
                  value={notes}
                  required={!!renewingDoc}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-5 bg-white/60 backdrop-blur-sm border border-white/60 rounded-2xl text-sm font-bold text-[#123f59] outline-none focus:bg-white/90 focus:ring-2 focus:ring-teal-500/40 transition-all shadow-inner custom-scrollbar"
                  rows="3"
                  placeholder="أضف أي ملاحظات أو تفاصيل إضافية..."
                ></textarea>
              </div>

              <div className="bg-white/50 backdrop-blur-md border-2 border-dashed border-teal-500/50 rounded-3xl p-6 text-center hover:bg-white/80 transition-all relative group overflow-hidden">
                <input
                  type="file"
                  onChange={(e) => setFileToUpload(e.target.files[0])}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                />
                <div className="relative z-10 pointer-events-none flex flex-col items-center gap-4">
                  <div
                    className={`h-16 w-16 rounded-full flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 ${fileToUpload ? "bg-teal-500 text-white" : "bg-white border border-teal-200 text-teal-600"}`}
                  >
                    {fileToUpload ? (
                      <CheckCircle2 className="h-8 w-8" />
                    ) : (
                      <UploadCloud className="h-8 w-8" />
                    )}
                  </div>
                  <div>
                    <p className="text-base font-black text-[#123f59]">
                      {fileToUpload
                        ? fileToUpload.name
                        : "اضغط هنا لاختيار المستند المرفق"}
                    </p>
                    <p className="text-sm font-bold text-gray-500 mt-2">
                      يدعم PDF, الصور, والملفات المضغوطة
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white/40 backdrop-blur-md border-t border-white/50 flex justify-end gap-4 relative z-10">
              <button
                type="button"
                onClick={closeModal}
                className="px-8 py-3 rounded-2xl text-base font-black text-[#123f59] bg-white/60 border border-white/60 hover:bg-white transition-all shadow-sm"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={uploadMutation.isPending}
                className="px-10 py-3 rounded-2xl text-base font-black bg-gradient-to-r from-teal-500 to-teal-600 text-white hover:from-teal-600 hover:to-teal-700 shadow-[0_8px_20px_rgba(20,184,166,0.3)] flex items-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {uploadMutation.isPending ? (
                  <RefreshCw className="h-6 w-6 animate-spin" />
                ) : renewingDoc ? (
                  <RefreshCw className="h-6 w-6" />
                ) : (
                  <UploadCloud className="h-6 w-6" />
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

      {/* ─── نافذة العرض الجانبية للذكاء الاصطناعي والمستند ─── */}
      {fileToView && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6 bg-[#06111d]/70 backdrop-blur-md font-cairo" dir="rtl">
          <div className="bg-white/90 backdrop-blur-xl border border-white/50 rounded-[32px] w-full max-w-[1400px] h-[90vh] flex flex-col shadow-[0_20px_60px_rgba(0,0,0,0.3)] overflow-hidden relative">
            
            <div className="flex justify-between items-center p-5 border-b border-gray-200/60 bg-white/50">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-teal-500/20 text-teal-700 flex items-center justify-center border border-teal-500/30">
                  <FileText className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-black text-xl text-[#123f59]">{fileToView.customName || fileToView.fileName}</h3>
                  <p className="text-sm font-bold text-gray-500 dir-ltr">{fileToView.fileName}</p>
                </div>
              </div>
              <button 
                onClick={() => setFileToView(null)} 
                className="h-12 w-12 rounded-full bg-white border border-gray-200 text-gray-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 flex items-center justify-center transition-all shadow-sm"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
              
              <div className="w-full md:w-1/3 h-full overflow-y-auto p-6 bg-gradient-to-b from-gray-50/50 to-white border-l border-gray-200/60 custom-scrollbar">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-600 border border-indigo-500/20">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <h4 className="font-black text-lg text-[#123f59]">الاستخراج الذكي للبيانات</h4>
                </div>

                {fileToView.aiExtractionData || fileToView.aiData ? (
                  <div className="space-y-4">
                    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                       <pre className="text-sm font-bold text-gray-700 whitespace-pre-wrap font-cairo">
                         {JSON.stringify(fileToView.aiExtractionData || fileToView.aiData, null, 2)}
                       </pre>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[60%] text-gray-400 gap-4">
                    <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
                      <Sparkles className="h-10 w-10 text-gray-300" />
                    </div>
                    <p className="font-bold text-base">لم يتم العثور على بيانات مستخرجة بالذكاء الاصطناعي لهذا المستند.</p>
                  </div>
                )}
              </div>

              <div className="w-full md:w-2/3 h-full bg-gray-200/50 p-4 relative flex flex-col">
                <div className="bg-white flex-1 rounded-2xl shadow-inner border border-gray-300 overflow-hidden relative flex items-center justify-center">
                  {/* تم استخدام getFullUrl هنا أيضاً */}
                  {["png", "jpg", "jpeg", "webp", "gif"].includes(fileToView.fileName?.split('.').pop()?.toLowerCase()) ? (
                    <img 
                      src={getFullUrl(fileToView.filePath)} 
                      alt="preview" 
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : fileToView.fileName?.split('.').pop()?.toLowerCase() === "pdf" ? (
                    <iframe 
                      src={getFullUrl(fileToView.filePath)} 
                      className="w-full h-full border-none"
                      title="PDF Preview"
                    />
                  ) : (
                    <div className="text-center text-gray-500">
                      <FileBox className="h-24 w-24 mx-auto mb-4 opacity-50" />
                      <p className="font-bold text-lg">هذا النوع من الملفات لا يدعم المعاينة المباشرة.</p>
                      {/* تم استخدام getFullUrl هنا كذلك للتحميل المباشر من المودال */}
                      <a 
                        href={getFullUrl(fileToView.filePath)}
                        download={fileToView.fileName}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 mt-4 px-6 py-2 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition"
                      >
                        <Download className="h-5 w-5"/> تحميل الملف
                      </a>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}