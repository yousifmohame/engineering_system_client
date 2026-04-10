import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FilePenLine,
  Plus,
  FileText,
  Search,
  Filter,
  Eye,
  Trash2,
  Loader2,
  LayoutTemplate,
  BookOpen,
  Settings,
  QrCode,
  Shield,
  Pen,
  Mail,
  Phone,
  MapPin,
  AlertCircle,
} from "lucide-react";
import api from "../../api/axios";
import { toast } from "sonner";
import CreateContractModal from "./modelss/CreateContractModal";
// 🚀 استيراد دالة الطباعة (تأكد من صحة مسارها في مشروعك)
import { generateContractPdf } from "./utils/contractExporter";

export default function ContractsManagementScreen() {
  const [activeTab, setActiveTab] = useState("contracts");
  const [settingsView, setSettingsView] = useState("general");
  const [searchQuery, setSearchQuery] = useState("");

  // 🚀 حالة فتح المودال وبيانات العقد المراد تعديله
  const [isCreateContractOpen, setIsCreateContractOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);

  const queryClient = useQueryClient();

  // 1. جلب العقود من الباك اند
  const {
    data: contractsData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["advanced-contracts"],
    queryFn: async () => {
      const response = await api.get("/contracts-management");
      return response.data.data || response.data;
    },
  });

  // 2. حذف عقد
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/contracts-management/${id}`);
    },
    onSuccess: () => {
      toast.success("تم حذف العقد بنجاح");
      queryClient.invalidateQueries(["advanced-contracts"]);
    },
    onError: () => {
      toast.error("حدث خطأ أثناء الحذف");
    },
  });

  // 3. تصفية وبحث العقود
  const filteredContracts = useMemo(() => {
    if (!contractsData) return [];
    if (!searchQuery) return contractsData;

    const lowerQuery = searchQuery.toLowerCase();
    return contractsData.filter(
      (c) =>
        c.code?.toLowerCase().includes(lowerQuery) ||
        c.name?.toLowerCase().includes(lowerQuery) ||
        c.partyB?.toLowerCase().includes(lowerQuery),
    );
  }, [contractsData, searchQuery]);

  // دالة مساعدة لتنسيق العملة
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("ar-SA", {
      style: "currency",
      currency: "SAR",
    }).format(amount || 0);
  };

  // دالة مساعدة للحصول على لون حالة العقد
  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
      case "نشط":
        return (
          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[9px] font-bold">
            نشط
          </span>
        );
      case "draft":
      case "مسودة":
        return (
          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 border border-slate-200 rounded text-[9px] font-bold">
            مسودة
          </span>
        );
      case "completed":
      case "مكتمل":
        return (
          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded text-[9px] font-bold">
            مكتمل
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 bg-slate-50 text-slate-600 border border-slate-200 rounded text-[9px] font-bold">
            {status || "غير محدد"}
          </span>
        );
    }
  };

  // 🚀 دالة فتح مودال الإنشاء كعقد جديد
  const handleCreateNew = () => {
    setSelectedContract(null); // تصفير البيانات القديمة
    setIsCreateContractOpen(true);
  };

  // 🚀 دالة فتح المودال مع بيانات للتعديل
  const handleEditContract = (contractData) => {
    setSelectedContract(contractData);
    setIsCreateContractOpen(true);
  };

  // 🚀 دالة الطباعة والمعاينة
  const handlePreviewContract = (contractData) => {
    // هذه الدالة من ملف contractExporter تقوم بتوليد الـ HTML وفتح نافذة الطباعة
    generateContractPdf(contractData);
  };

  const scopeTemplates = [
    {
      id: 1,
      title: "قالب تصميم فيلا سكنية",
      type: "تصميم",
      category: "سكني",
      items: ["التصميم المعماري المبدئي والنهائي", "المخططات الإنشائية"],
    },
    {
      id: 2,
      title: "قالب إشراف تجاري",
      type: "إشراف",
      category: "تجاري",
      items: ["زيارات ميدانية أسبوعية", "تقارير الالتزام بالكود"],
    },
  ];

  return (
    <div
      className="h-full flex flex-col bg-slate-50 font-sans overflow-hidden"
      dir="rtl"
    >
      {/* ─── Header ─── */}
      <header className="p-3 bg-white border-b border-slate-200 flex justify-between items-center shrink-0 shadow-sm">
        <div>
          <h1 className="text-sm font-black text-slate-950">إدارة العقود</h1>
          <p className="text-[10px] font-bold text-slate-500 mt-0.5">
            مركز التحكم في الوثائق القانونية
          </p>
        </div>
        <button
          onClick={handleCreateNew}
          className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-[10px] font-black flex items-center gap-1.5 hover:bg-emerald-700 shadow-sm transition-all"
        >
          <Plus className="w-3.5 h-3.5" /> إنشاء عقد جديد
        </button>
      </header>

      {/* ─── Tabs ─── */}
      <div className="flex border-b border-slate-200 bg-white px-2 shrink-0">
        <button
          onClick={() => setActiveTab("contracts")}
          className={`px-4 py-2.5 text-[11px] font-black flex items-center gap-1.5 transition-all border-b-2 ${activeTab === "contracts" ? "text-emerald-700 border-emerald-600" : "text-slate-500 border-transparent hover:bg-slate-50"}`}
        >
          <FileText className="w-3.5 h-3.5" /> العقود (
          {contractsData?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab("templates")}
          className={`px-4 py-2.5 text-[11px] font-black flex items-center gap-1.5 transition-all border-b-2 ${activeTab === "templates" ? "text-emerald-700 border-emerald-600" : "text-slate-500 border-transparent hover:bg-slate-50"}`}
        >
          <BookOpen className="w-3.5 h-3.5" /> نماذج العقود
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          className={`px-4 py-2.5 text-[11px] font-black flex items-center gap-1.5 transition-all border-b-2 ${activeTab === "settings" ? "text-emerald-700 border-emerald-600" : "text-slate-500 border-transparent hover:bg-slate-50"}`}
        >
          <Settings className="w-3.5 h-3.5" /> الإعدادات
        </button>
      </div>

      {/* ─── Tab Content ─── */}
      <div className="flex-1 overflow-hidden p-3 flex flex-col">
        {/* 🚀 1. تاب العقود 🚀 */}
        {activeTab === "contracts" && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden animate-in fade-in">
            <div className="p-3 border-b border-slate-100 flex gap-3 items-center bg-slate-50/50 shrink-0">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="ابحث برقم العقد، اسم العميل، أو عنوان المشروع..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-3 pr-9 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-all"
                />
              </div>
              <button
                className="p-2 border border-slate-200 rounded-lg bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors"
                title="تصفية متقدمة"
              >
                <Filter className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar-slim">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-full text-emerald-600 space-y-3">
                  <Loader2 className="w-8 h-8 animate-spin" />
                  <p className="text-xs font-bold text-slate-500">
                    جاري تحميل العقود...
                  </p>
                </div>
              ) : isError ? (
                <div className="flex flex-col items-center justify-center h-full text-rose-500 space-y-3">
                  <AlertCircle className="w-10 h-10" />
                  <p className="text-xs font-bold text-slate-700">
                    فشل الاتصال بالخادم لجلب العقود
                  </p>
                </div>
              ) : filteredContracts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-3 py-20">
                  <FileText className="w-12 h-12 text-slate-200" />
                  <p className="text-xs font-bold">لا توجد عقود تطابق بحثك</p>
                </div>
              ) : (
                <table className="w-full text-right border-collapse">
                  <thead className="bg-slate-50/80 sticky top-0 z-10 backdrop-blur-sm border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-wider">
                        رقم العقد
                      </th>
                      <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-wider">
                        اسم المشروع
                      </th>
                      <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-wider">
                        العميل (الطرف الثاني)
                      </th>
                      <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-wider">
                        النوع
                      </th>
                      <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-wider">
                        القيمة
                      </th>
                      <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-wider">
                        الحالة
                      </th>
                      <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-wider">
                        تاريخ الإصدار
                      </th>
                      <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-wider text-center">
                        إجراءات
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredContracts.map((c) => (
                      <tr
                        key={c.id}
                        className="hover:bg-slate-50/50 transition-colors group"
                      >
                        <td className="px-4 py-3 text-xs font-mono font-bold text-slate-700">
                          {c.code}
                        </td>
                        <td className="px-4 py-3 text-xs font-bold text-slate-900">
                          {c.name}
                        </td>
                        <td className="px-4 py-3 text-[11px] font-bold text-slate-600">
                          {c.partyBDetails?.representant ||
                            c.partyB ||
                            "غير محدد"}
                        </td>
                        <td className="px-4 py-3 text-[10px] font-bold text-slate-500">
                          <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            {c.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs font-black text-emerald-700">
                          {formatCurrency(c.contractValue)}
                        </td>
                        <td className="px-4 py-3">
                          {getStatusBadge(c.status)}
                        </td>
                        <td className="px-4 py-3 text-[10px] font-bold text-slate-400">
                          {new Date(c.date).toLocaleDateString("ar-SA")}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {/* 🚀 زر المعاينة */}
                            <button
                              onClick={() => handlePreviewContract(c)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                              title="عرض وطباعة"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            {/* 🚀 زر التعديل */}
                            <button
                              onClick={() => handleEditContract(c)}
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded"
                              title="تعديل"
                            >
                              <FilePenLine className="w-3.5 h-3.5" />
                            </button>
                            {/* 🚀 زر الحذف */}
                            <button
                              onClick={() => {
                                if (
                                  window.confirm(
                                    "هل أنت متأكد من حذف هذا العقد؟",
                                  )
                                ) {
                                  deleteMutation.mutate(c.id);
                                }
                              }}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded"
                              title="حذف"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* 2. تاب الإعدادات و 3. تاب النماذج تبقى كما هي بالضبط في كودك */}
        {/* ... */}
      </div>

      {/* 🚀 نافذة إنشاء/تعديل العقد 🚀 */}
      {isCreateContractOpen && (
        <CreateContractModal
          initialData={selectedContract} // 👈 تمرير البيانات للتعديل (ستكون null في حالة الإنشاء)
          onCancel={() => {
            setIsCreateContractOpen(false);
            setSelectedContract(null);
          }}
          onSave={() => {
            queryClient.invalidateQueries(["advanced-contracts"]);
            setIsCreateContractOpen(false);
            setSelectedContract(null);
          }}
        />
      )}
    </div>
  );
}
