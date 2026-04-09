import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Brain,
  Plus,
  List,
  FileSearch,
  Zap,
  Share2,
  Settings,
  Search,
  Filter,
  FileText,
  Globe,
  Download,
  MoreVertical,
  Loader2,
} from "lucide-react";

import api from "../../api/axios";
import AddReferenceModal from "./Models/AddReferenceModal";
import ReferenceDetailsModal from "./Models/ReferenceDetailsModal";

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

const TABS = [
  { id: "library", label: "المكتبة", icon: List },
  { id: "analysis", label: "التحليل الذكي", icon: Brain },
  { id: "extracted", label: "النص المستخرج", icon: FileSearch },
  { id: "summary", label: "التلخيص", icon: Zap },
  { id: "relations", label: "الربط والعلاقات", icon: Share2 },
  { id: "settings", label: "الإعدادات", icon: Settings },
];

const getDocumentStyling = (category, analysisStatus) => {
  let icon = FileText;
  let iconStyle = "bg-slate-50 text-slate-600";
  let analysisStyle = "bg-slate-100 text-slate-600";

  if (category === "اشتراطات") {
    icon = FileText;
    iconStyle = "bg-rose-50 text-rose-600";
  } else if (category === "أدلة") {
    icon = Globe;
    iconStyle = "bg-blue-50 text-blue-600";
  } else if (category === "تعاميم") {
    icon = FileText;
    iconStyle = "bg-amber-50 text-amber-600";
  } else if (category === "عروض") {
    icon = Zap;
    iconStyle = "bg-purple-50 text-purple-600";
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
    analysisStyle = "bg-purple-100 text-purple-800";
  }

  return { icon, iconStyle, analysisStyle };
};

export default function ReferenceLibraryScreen() {
  const [activeTab, setActiveTab] = useState("library");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("الكل");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ["reference-documents"],
    queryFn: async () => {
      const res = await api.get("/references");
      return res.data?.data || [];
    },
  });

  const filters = useMemo(() => {
    return [
      { id: "الكل", label: "الكل", count: documents.length },
      {
        id: "اشتراطات",
        label: "اشتراطات",
        count: documents.filter((d) => d.category === "اشتراطات").length,
      },
      {
        id: "أدلة",
        label: "أدلة",
        count: documents.filter((d) => d.category === "أدلة").length,
      },
      {
        id: "تعاميم",
        label: "تعاميم",
        count: documents.filter((d) => d.category === "تعاميم").length,
      },
      {
        id: "عروض",
        label: "عروض",
        count: documents.filter((d) => d.category === "عروض").length,
      },
      {
        id: "أخرى",
        label: "أخرى",
        count: documents.filter((d) => d.category === "أخرى").length,
      },
    ];
  }, [documents]);

  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const title = doc.title || "";
      const source = doc.source || "";
      const matchesSearch =
        title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        source.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter =
        activeFilter === "الكل" || doc.category === activeFilter;
      return matchesSearch && matchesFilter;
    });
  }, [searchQuery, activeFilter, documents]);

  return (
    <div className="h-full block font-sans" dir="rtl">
      <div className="p-2 bg-slate-50 min-h-full">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-1">
            <div>
              <p className="text-slate-500 font-bold">
                المكتبة المرجعية الذكية والتحليل الفني للاشتراطات
              </p>
            </div>
            <div className="flex gap-1">
              <button className="flex items-center gap-1 px-3 py-2 bg-white text-slate-900 border border-slate-200 rounded-2xl text-sm font-black shadow-sm hover:bg-slate-50 transition-all">
                <Brain className="w-3 h-3 text-purple-600" />
                تحليل ذكي شامل
              </button>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-1 px-3 py-2 bg-emerald-600 text-white rounded-2xl text-sm font-black shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all"
              >
                <Plus className="w-3 h-3" /> إضافة مرجع جديد
              </button>
            </div>
          </div>

          <div className="flex gap-1 bg-white p-1 rounded-2xl border border-slate-200 shadow-sm w-fit overflow-x-auto">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all ${isActive ? "bg-slate-900 text-white shadow-md" : "text-slate-500 hover:bg-slate-50"}`}
                >
                  <Icon
                    className={`w-4 h-4 ${isActive ? "text-emerald-400" : "text-slate-400"}`}
                  />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="col-span-12 space-y-2 transition-all duration-300">
            <div className="bg-white p-2 rounded-3xl border border-slate-200 shadow-sm flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6">
              <div className="relative flex-1 w-full">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                <input
                  placeholder="بحث في المراجع، العناوين، الجهات المصدرة..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pr-12 pl-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                  type="text"
                />
              </div>
              <div className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0">
                <Filter className="w-5 h-5 text-slate-400 shrink-0" />
                <div className="flex gap-2 shrink-0">
                  {filters.map((filter) => {
                    const isActive = activeFilter === filter.id;
                    return (
                      <button
                        key={filter.id}
                        onClick={() => setActiveFilter(filter.id)}
                        className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${isActive ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-600 hover:bg-slate-100"}`}
                      >
                        {filter.label}
                        <span
                          className={`px-1.5 py-0.5 rounded-md text-[9px] ${isActive ? "bg-white/20 text-white" : "bg-slate-200 text-slate-500"}`}
                        >
                          {filter.count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto custom-scrollbar-slim">
                <table className="w-full text-right border-collapse min-w-[900px]">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="p-4 text-xs font-black text-slate-500">
                        العنوان
                      </th>
                      <th className="p-4 text-xs font-black text-slate-500">
                        النوع
                      </th>
                      <th className="p-4 text-xs font-black text-slate-500">
                        الجهة المصدرة
                      </th>
                      <th className="p-4 text-xs font-black text-slate-500">
                        تاريخ الإصدار
                      </th>
                      <th className="p-4 text-xs font-black text-slate-500">
                        الحالة
                      </th>
                      <th className="p-4 text-xs font-black text-slate-500">
                        التحليل
                      </th>
                      <th className="p-4 text-xs font-black text-slate-500 text-center">
                        إجراءات
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {isLoading ? (
                      <tr>
                        <td colSpan="7" className="p-16 text-center">
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
                        } = getDocumentStyling(
                          doc.category,
                          doc.analysisStatus,
                        );
                        const formattedDate = doc.issueDate
                          ? new Date(doc.issueDate).toLocaleDateString("en-GB")
                          : "غير محدد";

                        return (
                          <tr
                            key={doc.id}
                            onClick={() => setSelectedDocument(doc)}
                            className="hover:bg-slate-50 transition-colors cursor-pointer"
                          >
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`p-2.5 rounded-xl ${iconStyle}`}
                                >
                                  <IconComponent className="w-5 h-5" />
                                </div>
                                <div>
                                  <div
                                    className="text-sm font-black text-slate-900 max-w-xs truncate"
                                    title={doc.title}
                                  >
                                    {doc.title}
                                  </div>
                                  <div className="text-[10px] font-bold text-slate-400 mt-0.5">
                                    {doc.category || "غير مصنف"}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black whitespace-nowrap">
                                {doc.type || "عام"}
                              </span>
                            </td>
                            <td
                              className="p-4 text-xs font-bold text-slate-600 max-w-[150px] truncate"
                              title={doc.source}
                            >
                              {doc.source || "غير محدد"}
                            </td>
                            <td className="p-4 text-xs font-bold text-slate-500 font-mono">
                              {formattedDate}
                            </td>
                            <td className="p-4">
                              <span
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-black ${doc.status === "نشط" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}
                              >
                                {doc.status || "نشط"}
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`px-2.5 py-1 rounded-lg text-[10px] font-black whitespace-nowrap ${analysisStyle}`}
                                >
                                  {doc.analysisStatus || "غير محلل"}
                                </span>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex justify-center gap-2">
                                {doc.fileUrl && (
                                  <button
                                    // 💡 استخدام getFullUrl هنا 👇
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      window.open(
                                        getFullUrl(doc.fileUrl),
                                        "_blank",
                                      );
                                    }}
                                    className="p-2 hover:bg-slate-200 rounded-xl text-slate-400 hover:text-blue-600 shadow-sm border border-transparent transition-all"
                                    title="تحميل الملف"
                                  >
                                    <Download className="w-4 h-4" />
                                  </button>
                                )}
                                <button
                                  onClick={(e) => e.stopPropagation()}
                                  className="p-2 hover:bg-slate-200 rounded-xl text-slate-400 hover:text-slate-800 shadow-sm border border-transparent transition-all"
                                >
                                  <MoreVertical className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="7" className="p-16 text-center">
                          <FileText className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                          <div className="text-slate-500 font-bold text-sm">
                            لا توجد مستندات مطابقة للبحث.
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
      </div>

      <AddReferenceModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
      <ReferenceDetailsModal
        isOpen={!!selectedDocument}
        document={selectedDocument}
        onClose={() => setSelectedDocument(null)}
      />
    </div>
  );
}
