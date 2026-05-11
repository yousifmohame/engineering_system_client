import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Brain,
  Plus,
  FileSearch,
  Zap,
  Share2,
  Settings,
  Search,
  FileText,
  Globe,
  Download,
  MoreVertical,
  Loader2,
  Trash2,
  Edit2,
  Snowflake,
  Play,
  X,
  AlertTriangle,
  BellRing,
} from "lucide-react";

import api from "../../api/axios";
import AddReferenceModal from "./Models/AddReferenceModal";
import ReferenceDetailsModal from "./Models/ReferenceDetailsModal";
import ModalUploadReferenceAi from "./Models/ModalUploadReferenceAi"; // 👈 استيراد نافذة الرفع الذكي

// 💡 دالة تحويل الرابط
const getFullUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  let fixedUrl = url;
  if (url.startsWith("/uploads/")) {
    fixedUrl = `/api${url}`;
  }
  const baseUrl = "https://details-worksystem1.com";
  return `${baseUrl}${fixedUrl}`;
};

const getDocumentStyling = (category, analysisStatus) => {
  let icon = FileText;
  let iconStyle = "bg-slate-50 text-slate-600";
  let analysisStyle = "bg-slate-100 text-slate-600";

  if (category === "اشتراطات") {
    icon = FileText;
    iconStyle = "bg-purple-50 text-purple-600";
  } else if (category === "أدلة") {
    icon = Globe;
    iconStyle = "bg-blue-50 text-blue-600";
  } else if (category === "تعاميم") {
    icon = BellRing;
    iconStyle = "bg-amber-50 text-amber-600";
  } else if (category === "حالات خاصة واستثناءات") {
    icon = AlertTriangle;
    iconStyle = "bg-emerald-50 text-emerald-600";
  }

  if (
    analysisStatus === "تم اعتماد الشرح" ||
    analysisStatus === "مكتمل" ||
    analysisStatus === "محلل"
  ) {
    analysisStyle = "bg-emerald-100 text-emerald-800";
  } else if (analysisStatus === "يحتاج مراجعة") {
    analysisStyle = "bg-amber-100 text-amber-800";
  } else if (analysisStatus === "قيد التحليل") {
    analysisStyle = "bg-purple-100 text-purple-800 animate-pulse";
  }

  return { icon, iconStyle, analysisStyle };
};

export default function ReferenceLibraryScreen() {
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("الكل"); // 👈 فلتر البطاقات النشط

  // التحكم في النوافذ (Modals)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAiUploadModalOpen, setIsAiUploadModalOpen] = useState(false); // 👈 حالة نافذة الذكاء الاصطناعي

  const [activeMenuId, setActiveMenuId] = useState(null);
  const [documentToEdit, setDocumentToEdit] = useState(null);
  const [freezeModal, setFreezeModal] = useState({
    isOpen: false,
    doc: null,
    reason: "",
  });
  const [selectedDocumentId, setSelectedDocumentId] = useState(null);

  // جلب البيانات (مع التحديث التلقائي الصامت كل 5 ثواني لمتابعة مهام الخلفية)
  const { data: documents = [], isLoading } = useQuery({
    queryKey: ["reference-documents"],
    queryFn: async () => {
      const res = await api.get("/references");
      return res.data?.data || [];
    },
    refetchInterval: 5000,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/references/${id}`),
    onSuccess: () => {
      toast.success("تم حذف المرجع بنجاح");
      queryClient.invalidateQueries({ queryKey: ["reference-documents"] });
    },
    onError: () => toast.error("فشل حذف المرجع"),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status, reason }) =>
      api.put(`/references/${id}/status`, { status, freezeReason: reason }),
    onSuccess: () => {
      toast.success("تم تحديث حالة المرجع بنجاح");
      queryClient.invalidateQueries({ queryKey: ["reference-documents"] });
      setFreezeModal({ isOpen: false, doc: null, reason: "" });
    },
    onError: () => toast.error("حدث خطأ أثناء تحديث الحالة"),
  });

  const selectedDocument = useMemo(() => {
    if (!selectedDocumentId) return null;
    return documents.find((doc) => doc.id === selectedDocumentId) || null;
  }, [documents, selectedDocumentId]);

  // إحصائيات البطاقات الأربع
  const stats = useMemo(() => {
    return {
      اشتراطات: documents.filter((d) => d.category === "اشتراطات").length,
      أدلة: documents.filter((d) => d.category === "أدلة").length,
      تعاميم: documents.filter((d) => d.category === "تعاميم").length,
      "حالات خاصة واستثناءات": documents.filter(
        (d) => d.category === "حالات خاصة واستثناءات",
      ).length,
    };
  }, [documents]);

  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const title = doc.title || "";
      const source = doc.source || "";
      const matchesSearch =
        title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        source.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        activeCategory === "الكل" || doc.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory, documents]);

  return (
    <div className="h-full block font-sans relative" dir="rtl">
      <div className="p-4 bg-[#fafbfc] min-h-full">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* العنوان الرئيسي */}
          <div>
            <h1 className="text-xl font-black text-slate-800">
              المكتبة المرجعية الذكية
            </h1>
            <p className="text-xs font-bold text-slate-500 mt-1">
              تصفح الأدلة، الاشتراطات، التعاميم واستثناءات البناء
            </p>
          </div>

          {/* 🚀 البطاقات الأربع (الفلاتر الرئيسية) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-1">
            {/* بطاقة 1: اشتراطات */}
            <div
              onClick={() =>
                setActiveCategory(
                  activeCategory === "اشتراطات" ? "الكل" : "اشتراطات",
                )
              }
              className={`p-4 rounded-2xl cursor-pointer transition-all border-2 ${activeCategory === "اشتراطات" ? "bg-purple-50 border-purple-400 shadow-md" : "bg-white border-transparent hover:border-purple-200 shadow-sm"}`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className={`p-2.5 rounded-xl ${activeCategory === "اشتراطات" ? "bg-purple-500 text-white" : "bg-purple-100 text-purple-600"}`}
                >
                  <FileText size={20} />
                </div>
                <span
                  className={`text-sm font-black ${activeCategory === "اشتراطات" ? "text-purple-900" : "text-slate-700"}`}
                >
                  اشتراطات
                </span>
              </div>
              <div className="text-2xl font-black text-slate-800">
                {stats["اشتراطات"]}
              </div>
              <div className="text-[10px] font-bold text-slate-400 mt-1">
                مرجع مسجل
              </div>
            </div>

            {/* بطاقة 2: أدلة */}
            <div
              onClick={() =>
                setActiveCategory(activeCategory === "أدلة" ? "الكل" : "أدلة")
              }
              className={`p-4 rounded-2xl cursor-pointer transition-all border-2 ${activeCategory === "أدلة" ? "bg-blue-50 border-blue-400 shadow-md" : "bg-white border-transparent hover:border-blue-200 shadow-sm"}`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className={`p-2.5 rounded-xl ${activeCategory === "أدلة" ? "bg-blue-500 text-white" : "bg-blue-100 text-blue-600"}`}
                >
                  <Globe size={20} />
                </div>
                <span
                  className={`text-sm font-black ${activeCategory === "أدلة" ? "text-blue-900" : "text-slate-700"}`}
                >
                  أدلة
                </span>
              </div>
              <div className="text-2xl font-black text-slate-800">
                {stats["أدلة"]}
              </div>
              <div className="text-[10px] font-bold text-slate-400 mt-1">
                دليل مسجل
              </div>
            </div>

            {/* بطاقة 3: تعاميم */}
            <div
              onClick={() =>
                setActiveCategory(
                  activeCategory === "تعاميم" ? "الكل" : "تعاميم",
                )
              }
              className={`p-4 rounded-2xl cursor-pointer transition-all border-2 ${activeCategory === "تعاميم" ? "bg-amber-50 border-amber-400 shadow-md" : "bg-white border-transparent hover:border-amber-200 shadow-sm"}`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className={`p-2.5 rounded-xl ${activeCategory === "تعاميم" ? "bg-amber-500 text-white" : "bg-amber-100 text-amber-600"}`}
                >
                  <BellRing size={20} />
                </div>
                <span
                  className={`text-sm font-black ${activeCategory === "تعاميم" ? "text-amber-900" : "text-slate-700"}`}
                >
                  تعاميم
                </span>
              </div>
              <div className="text-2xl font-black text-slate-800">
                {stats["تعاميم"]}
              </div>
              <div className="text-[10px] font-bold text-slate-400 mt-1">
                تعميم صادر
              </div>
            </div>

            {/* بطاقة 4: حالات خاصة واستثناءات */}
            <div
              onClick={() =>
                setActiveCategory(
                  activeCategory === "حالات خاصة واستثناءات"
                    ? "الكل"
                    : "حالات خاصة واستثناءات",
                )
              }
              className={`p-4 rounded-2xl cursor-pointer transition-all border-2 ${activeCategory === "حالات خاصة واستثناءات" ? "bg-emerald-50 border-emerald-400 shadow-md" : "bg-white border-transparent hover:border-emerald-200 shadow-sm"}`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className={`p-2.5 rounded-xl ${activeCategory === "حالات خاصة واستثناءات" ? "bg-emerald-500 text-white" : "bg-emerald-100 text-emerald-600"}`}
                >
                  <AlertTriangle size={20} />
                </div>
                <span
                  className={`text-sm font-black ${activeCategory === "حالات خاصة واستثناءات" ? "text-emerald-900" : "text-slate-700"}`}
                >
                  حالات خاصة واستثناءات
                </span>
              </div>
              <div className="text-2xl font-black text-slate-800">
                {stats["حالات خاصة واستثناءات"]}
              </div>
              <div className="text-[10px] font-bold text-slate-400 mt-1">
                حالة مسجلة
              </div>
            </div>
          </div>

          {/* شريط الإجراءات والبحث */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                placeholder="ابحث في العناوين والجهات المصدرة..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-10 pl-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:border-blue-400 focus:bg-white outline-none transition-all"
                type="text"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setIsAiUploadModalOpen(true)} // 👈 فتح نافذة الذكاء الاصطناعي
                className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-xl text-xs font-black shadow-md shadow-purple-200 hover:bg-purple-700 transition-all"
              >
                <Brain className="w-4 h-4" /> تحليل وإضافة (AI)
              </button>
              <button
                onClick={() => {
                  setDocumentToEdit(null);
                  setIsAddModalOpen(true);
                }}
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 text-white rounded-xl text-xs font-black shadow-md hover:bg-slate-900 transition-all"
              >
                <Plus className="w-4 h-4" /> إضافة يدوية
              </button>
            </div>
          </div>

          {/* الجدول */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto custom-scrollbar-slim pb-24 min-h-[400px]">
              <table className="w-full text-right border-collapse min-w-[900px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="p-4 text-xs font-black text-slate-500">
                      عنوان المرجع
                    </th>
                    <th className="p-4 text-xs font-black text-slate-500">
                      التصنيف
                    </th>
                    <th className="p-4 text-xs font-black text-slate-500">
                      الجهة المصدرة
                    </th>
                    <th className="p-4 text-xs font-black text-slate-500">
                      تاريخ الإصدار
                    </th>
                    <th className="p-4 text-xs font-black text-slate-500">
                      التحليل الفني
                    </th>
                    <th className="p-4 text-xs font-black text-slate-500 text-center">
                      إجراءات
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isLoading ? (
                    <tr>
                      <td colSpan="6" className="p-16 text-center">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500 mb-4" />
                        <span className="text-sm font-bold text-slate-500">
                          جاري تحميل المراجع...
                        </span>
                      </td>
                    </tr>
                  ) : filteredDocuments.length > 0 ? (
                    filteredDocuments.map((doc) => {
                      const {
                        icon: IconComponent,
                        iconStyle,
                        analysisStyle,
                      } = getDocumentStyling(doc.category, doc.analysisStatus);
                      const isFrozen = doc.status === "مجمد";

                      return (
                        <tr
                          key={doc.id}
                          onClick={() => setSelectedDocumentId(doc.id)}
                          className={`hover:bg-slate-50 transition-colors cursor-pointer ${isFrozen ? "opacity-60 grayscale-[0.3]" : ""}`}
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className={`p-2.5 rounded-xl ${iconStyle}`}>
                                <IconComponent className="w-5 h-5" />
                              </div>
                              <div>
                                <div
                                  className={`text-sm font-black max-w-xs truncate ${isFrozen ? "line-through text-slate-400" : "text-slate-900"}`}
                                  title={doc.title}
                                >
                                  {doc.title}
                                </div>
                                <div className="text-[10px] font-bold text-slate-400 mt-0.5">
                                  {doc.type || "عام"}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black">
                              {doc.category || "غير مصنف"}
                            </span>
                          </td>
                          <td
                            className="p-4 text-xs font-bold text-slate-600 max-w-[150px] truncate"
                            title={doc.source}
                          >
                            {doc.source || "—"}
                          </td>
                          <td className="p-4 text-xs font-bold text-slate-500 font-mono">
                            {doc.issueDate
                              ? new Date(doc.issueDate).toLocaleDateString(
                                  "en-GB",
                                )
                              : "—"}
                          </td>
                          <td className="p-4">
                            <span
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-black whitespace-nowrap ${analysisStyle}`}
                            >
                              {doc.analysisStatus || "غير محلل"}
                            </span>
                          </td>
                          <td
                            className="p-4"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex justify-center gap-2 relative">
                              {doc.fileUrl && (
                                <button
                                  onClick={() =>
                                    window.open(
                                      getFullUrl(doc.fileUrl.split(",")[0]),
                                      "_blank",
                                    )
                                  }
                                  className="p-2 hover:bg-slate-200 rounded-xl text-slate-400 hover:text-blue-600 transition-all"
                                  title="تحميل الملف"
                                >
                                  <Download className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() =>
                                  setActiveMenuId(
                                    activeMenuId === doc.id ? null : doc.id,
                                  )
                                }
                                className="p-2 hover:bg-slate-200 rounded-xl text-slate-400 hover:text-slate-800 transition-all"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>

                              {/* القائمة المنسدلة */}
                              {activeMenuId === doc.id && (
                                <>
                                  <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setActiveMenuId(null)}
                                  ></div>
                                  <div className="absolute left-10 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-20 w-40 py-1 font-bold text-xs animate-in zoom-in-95">
                                    <button
                                      onClick={() => {
                                        setDocumentToEdit(doc);
                                        setIsAddModalOpen(true);
                                        setActiveMenuId(null);
                                      }}
                                      className="flex items-center gap-2 w-full text-right px-4 py-2 hover:bg-slate-50 text-slate-700"
                                    >
                                      <Edit2
                                        size={14}
                                        className="text-blue-500"
                                      />{" "}
                                      تعديل المرجع
                                    </button>
                                    {doc.status === "نشط" ? (
                                      <button
                                        onClick={() => {
                                          setFreezeModal({
                                            isOpen: true,
                                            doc,
                                            reason: "",
                                          });
                                          setActiveMenuId(null);
                                        }}
                                        className="flex items-center gap-2 w-full text-right px-4 py-2 hover:bg-cyan-50 text-cyan-700"
                                      >
                                        <Snowflake size={14} /> تجميد وإيقاف
                                      </button>
                                    ) : (
                                      <button
                                        onClick={() => {
                                          statusMutation.mutate({
                                            id: doc.id,
                                            status: "نشط",
                                            reason: "إعادة تنشيط",
                                          });
                                          setActiveMenuId(null);
                                        }}
                                        className="flex items-center gap-2 w-full text-right px-4 py-2 hover:bg-emerald-50 text-emerald-700"
                                      >
                                        <Play size={14} /> إعادة تنشيط
                                      </button>
                                    )}
                                    <div className="border-t border-slate-100 my-1"></div>
                                    <button
                                      onClick={() => {
                                        if (
                                          window.confirm("حذف المرجع نهائياً؟")
                                        )
                                          deleteMutation.mutate(doc.id);
                                        setActiveMenuId(null);
                                      }}
                                      className="flex items-center gap-2 w-full text-right px-4 py-2 hover:bg-rose-50 text-rose-600"
                                    >
                                      <Trash2 size={14} /> حذف نهائي
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="6" className="p-16 text-center">
                        <FileText className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                        <div className="text-slate-500 font-bold text-sm">
                          لا توجد مستندات مطابقة للبحث أو الفلتر.
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {isAddModalOpen && (
        <AddReferenceModal
          isOpen={true}
          onClose={() => {
            setIsAddModalOpen(false);
            setDocumentToEdit(null);
          }}
          documentToEdit={documentToEdit}
        />
      )}
      <ReferenceDetailsModal
        isOpen={!!selectedDocument}
        document={selectedDocument}
        onClose={() => setSelectedDocumentId(null)}
      />

      {/* 🚀 نافذة الرفع والتحليل بالذكاء الاصطناعي (تعمل في الخلفية) */}
      {isAiUploadModalOpen && (
        <ModalUploadReferenceAi onClose={() => setIsAiUploadModalOpen(false)} />
      )}

      {freezeModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-[200] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 relative animate-in zoom-in-95">
            <button
              onClick={() =>
                setFreezeModal({ isOpen: false, doc: null, reason: "" })
              }
              className="absolute top-4 left-4 text-slate-400"
            >
              <X size={20} />
            </button>
            <div className="w-12 h-12 bg-cyan-50 text-cyan-600 rounded-full flex items-center justify-center mb-4 mx-auto">
              <Snowflake size={24} />
            </div>
            <h3 className="text-lg font-black text-center text-slate-800 mb-2">
              تأكيد تجميد المرجع
            </h3>
            <textarea
              placeholder="سبب التجميد..."
              value={freezeModal.reason}
              onChange={(e) =>
                setFreezeModal({ ...freezeModal, reason: e.target.value })
              }
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold outline-none min-h-[100px] mb-4"
            />
            <button
              onClick={() =>
                statusMutation.mutate({
                  id: freezeModal.doc.id,
                  status: "مجمد",
                  reason: freezeModal.reason,
                })
              }
              disabled={!freezeModal.reason.trim() || statusMutation.isPending}
              className="w-full py-3 bg-cyan-600 text-white rounded-xl font-black hover:bg-cyan-700 flex justify-center items-center gap-2"
            >
              تأكيد التجميد
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
