import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/axios";
import { toast } from "sonner";
import {
  Search,
  Plus,
  X,
  Handshake,
  Phone,
  Mail,
  FileText,
  Wallet,
  Receipt,
  Paperclip,
  Upload,
  Loader2,
  Edit3,
  Trash2,
  Eye,
  Globe,
  User,
  Banknote,
  CheckSquare,
  Square,
  Archive,
  Download,
  UserPlus,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { usePrivacy } from "../context/PrivacyContext";

// 💡 استيراد المكون الشامل من مساره الصحيح (تأكد من مسار الملف لديك)
import { AddPersonModal } from "../components/AddPersonModal"; // افترضت أنه في نفس المجلد أو قم بتعديل المسار

const safeText = (val) => {
  if (val === null || val === undefined) return "—";
  if (typeof val === "object")
    return val.ar || val.name || val.en || JSON.stringify(val);
  return String(val);
};

export default function BrokersPage() {
  const queryClient = useQueryClient();
  const { maskAmount } = usePrivacy();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterAgreement, setFilterAgreement] = useState("all");
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [activeTab, setActiveTab] = useState("data");

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // "add" or "edit"
  const [editingPerson, setEditingPerson] = useState(null);

  const [previewData, setPreviewData] = useState(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  // 💡 Data Fetching
  const { data: brokersList = [], isLoading } = useQuery({
    queryKey: ["brokers-directory"],
    queryFn: async () => {
      const res = await api.get("/persons");
      const allPersons = res.data?.data || [];
      return allPersons.filter(
        (p) => p.role === "وسيط" || p.role === "وسيط المكتب الهندسي",
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => await api.delete(`/persons/${id}`),
    onSuccess: () => {
      toast.success("تم الحذف بنجاح");
      queryClient.invalidateQueries(["brokers-directory"]);
      if (selectedPerson) setSelectedPerson(null);
    },
    onError: (err) => toast.error(err.response?.data?.message || "حدث خطأ"),
  });

  const removeAttachmentMutation = useMutation({
    mutationFn: async ({ id, fileUrl }) => {
      const res = await api.put(`/persons/${id}/attachments/remove`, {
        fileUrl,
      });
      return res.data;
    },
    onSuccess: (res) => {
      toast.success("تم حذف المرفق بنجاح");
      queryClient.invalidateQueries(["brokers-directory"]);
      if (selectedPerson)
        setSelectedPerson((prev) => ({
          ...prev,
          attachments: res.data?.attachments || prev.attachments,
        }));
    },
  });

  const closePreview = () => {
    if (previewData) URL.revokeObjectURL(previewData.url);
    setPreviewData(null);
  };

  const filteredData = useMemo(() => {
    return brokersList.filter((p) => {
      const matchSearch =
        p.name.includes(searchQuery) ||
        (p.phone && p.phone.includes(searchQuery));
      const matchAgreement =
        filterAgreement === "all" || p.agreementType === filterAgreement;
      return matchSearch && matchAgreement;
    });
  }, [brokersList, searchQuery, filterAgreement]);

  const handleViewAttachment = async (e, attachmentUrl) => {
    e.stopPropagation();
    if (!attachmentUrl) return;
    setIsPreviewLoading(true);
    try {
      const response = await api.get(attachmentUrl, { responseType: "blob" });
      const contentType = response.headers["content-type"];
      setPreviewData({
        url: URL.createObjectURL(response.data),
        isPdf:
          contentType?.includes("pdf") ||
          attachmentUrl.toLowerCase().endsWith(".pdf"),
      });
    } catch (error) {
      toast.error("فشل في تحميل المرفق.");
    } finally {
      setIsPreviewLoading(false);
    }
  };

  return (
    <>
      <div
        className="p-3 flex flex-col h-full overflow-hidden bg-[var(--wms-bg-0)] font-sans"
        dir="rtl"
      >
        {/* Header Toolbar */}
        <div className="flex items-center gap-3 mb-3 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md flex items-center justify-center bg-blue-50 border border-blue-100">
              <Handshake className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <div className="text-[var(--wms-text)] text-[15px] font-bold">
                سجل الوسطاء والمسوقين
              </div>
              <div className="text-[var(--wms-text-muted)] text-[10px]">
                {brokersList.length} وسيط مسجل
              </div>
            </div>
          </div>
          <div className="flex-1"></div>
          <div className="relative">
            <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--wms-text-muted)]" />
            <input
              type="text"
              placeholder="بحث بالاسم أو الجوال..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[var(--wms-surface-2)] border border-[var(--wms-border)] rounded-md pr-8 pl-3 text-[var(--wms-text)] outline-none w-[220px] h-[32px] text-[12px]"
            />
          </div>
          <button
            onClick={() => {
              setModalMode("add");
              setEditingPerson(null);
              setIsAddOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 rounded-md bg-[var(--wms-accent-blue)] text-white hover:opacity-90 h-[32px] text-[12px] font-semibold shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>تسجيل وسيط جديد</span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1.5 flex-wrap mb-3 shrink-0">
          <span className="text-[11px] font-bold text-gray-500 ml-2">
            نوع الاتفاق المالي:
          </span>
          <button
            onClick={() => setFilterAgreement("all")}
            className={`px-2.5 py-1 rounded-md transition-colors text-[11px] font-bold ${filterAgreement === "all" ? "bg-[var(--wms-accent-blue)] text-white" : "bg-[var(--wms-surface-2)] text-[var(--wms-text-sec)]"}`}
          >
            الكل
          </button>
          <button
            onClick={() => setFilterAgreement("نسبة")}
            className={`px-2.5 py-1 rounded-md transition-colors text-[11px] font-bold ${filterAgreement === "نسبة" ? "bg-[var(--wms-accent-blue)] text-white" : "bg-[var(--wms-surface-2)] text-[var(--wms-text-sec)]"}`}
          >
            نسبة مئوية
          </button>
          <button
            onClick={() => setFilterAgreement("مبلغ ثابت")}
            className={`px-2.5 py-1 rounded-md transition-colors text-[11px] font-bold ${filterAgreement === "مبلغ ثابت" ? "bg-[var(--wms-accent-blue)] text-white" : "bg-[var(--wms-surface-2)] text-[var(--wms-text-sec)]"}`}
          >
            مبلغ ثابت
          </button>
        </div>

        {/* Main Table */}
        <div className="bg-[var(--wms-surface-1)] border border-[var(--wms-border)] rounded-lg overflow-hidden flex flex-col flex-1 min-h-0 shadow-sm">
          <div className="overflow-auto custom-scrollbar-slim flex-1">
            <table className="w-full text-right whitespace-nowrap text-[12px]">
              <thead className="sticky top-0 z-10 bg-[var(--wms-surface-2)]">
                <tr className="h-[36px]">
                  <th className="px-3 text-[var(--wms-text-sec)] font-bold text-[11px]">
                    اسم الوسيط
                  </th>
                  <th className="px-3 text-[var(--wms-text-sec)] font-bold text-[11px]">
                    الجوال
                  </th>
                  <th className="px-3 text-[var(--wms-text-sec)] font-bold text-[11px]">
                    نوع الاتفاق
                  </th>
                  <th className="px-3 text-[var(--wms-text-sec)] font-bold text-[11px]">
                    طرق الدفع
                  </th>
                  <th className="px-3 text-center text-[var(--wms-text-sec)] font-bold text-[11px]">
                    إجراءات
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="5" className="text-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-500 mx-auto" />
                    </td>
                  </tr>
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="text-center py-8 text-gray-500 font-semibold"
                    >
                      لا يوجد وسطاء مسجلين
                    </td>
                  </tr>
                ) : (
                  filteredData.map((row, idx) => {
                    let methodsLabel = "—";
                    if (row.transferMethod) {
                      try {
                        const parsed = JSON.parse(row.transferMethod);
                        if (Array.isArray(parsed) && parsed.length > 0)
                          methodsLabel = parsed.join(" + ");
                      } catch (e) {
                        methodsLabel = row.transferMethod;
                      }
                    }
                    return (
                      <tr
                        key={row.id}
                        className={`border-b border-[var(--wms-border)]/30 hover:bg-[var(--wms-surface-2)]/40 transition-colors h-[40px] ${idx % 2 === 1 ? "bg-[var(--wms-row-alt)]" : "bg-transparent"}`}
                      >
                        <td className="px-3 text-[var(--wms-text)] font-bold">
                          {safeText(row.name)}
                          {row.role === "وسيط المكتب الهندسي" && (
                            <span className="mr-2 text-[9px] bg-cyan-100 text-cyan-700 px-1.5 py-0.5 rounded">
                              مكتب هندسي
                            </span>
                          )}
                        </td>
                        <td
                          className="px-3 text-[var(--wms-text-sec)] font-mono text-[11px] font-bold"
                          dir="ltr"
                        >
                          {safeText(row.phone)}
                        </td>
                        <td className="px-3 text-[var(--wms-text-muted)] text-[10px] font-semibold">
                          {safeText(row.agreementType)}
                        </td>
                        <td
                          className="px-3 text-blue-600 text-[10px] font-bold truncate max-w-[150px]"
                          title={methodsLabel}
                        >
                          {methodsLabel}
                        </td>
                        <td className="px-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedPerson(row);
                                setActiveTab("data");
                              }}
                              className="text-blue-500 hover:bg-blue-50 p-1.5 rounded transition-colors"
                              title="عرض التفاصيل"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setModalMode("edit");
                                setEditingPerson(row);
                                setIsAddOpen(true);
                              }}
                              className="text-amber-500 hover:bg-amber-50 p-1.5 rounded transition-colors"
                              title="تعديل"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm("متأكد من حذف الوسيط؟"))
                                  deleteMutation.mutate(row.id);
                              }}
                              className="text-red-500 hover:bg-red-50 p-1.5 rounded transition-colors"
                              title="حذف"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
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
      </div>

      {isAddOpen && (
        <AddPersonModal
          type="وسيط"
          mode={modalMode} // "add" أو "edit"
          personData={editingPerson}
          onClose={() => setIsAddOpen(false)}
        />
      )}

      {/* ========================================== */}
      {/* 🌟 2. Details Modal */}
      {/* ========================================== */}
      {selectedPerson && (
        <div
          className="fixed inset-0 z-[50] flex items-center justify-center bg-black/60 p-4 animate-in fade-in"
          dir="rtl"
          onClick={() => setSelectedPerson(null)}
        >
          <div
            className="bg-white border border-gray-200 rounded-2xl shadow-2xl flex flex-col overflow-hidden w-full max-w-5xl h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0 bg-gray-50/80">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-[18px] shadow-sm bg-blue-600 text-white">
                  {safeText(selectedPerson.name).charAt(0)}
                </div>
                <div>
                  <div className="text-gray-800 text-[18px] font-black">
                    {safeText(selectedPerson.name)}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold border bg-blue-50 text-blue-700 border-blue-700">
                      {safeText(selectedPerson.role)}
                    </span>
                    <span className="text-gray-400 font-mono text-[11px] font-bold">
                      {safeText(selectedPerson.personCode)}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedPerson(null)}
                className="text-gray-400 hover:text-red-500 bg-white p-2 rounded-md border shadow-sm transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs Navigation */}
            <div className="flex border-b border-gray-200 overflow-x-auto custom-scrollbar-slim bg-white shrink-0">
              {[
                { id: "data", label: "بيانات الوسيط", icon: User },
                {
                  id: "transactions",
                  label: "المعاملات المرتبطة",
                  icon: FileText,
                },
                { id: "settlements", label: "تسويات الوسيط", icon: Handshake },
                { id: "collections", label: "التحصيلات", icon: Wallet },
                { id: "disbursements", label: "المنصرفات", icon: Receipt },
                { id: "attachments", label: "المرفقات", icon: Paperclip },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3.5 whitespace-nowrap cursor-pointer transition-all text-xs font-bold border-b-2 ${activeTab === tab.id ? "text-blue-600 border-blue-600 bg-blue-50/30" : "text-gray-500 border-transparent hover:text-gray-800 hover:bg-gray-50"}`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Tabs Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50 relative">
              {/* TAB 1: Data */}
              {activeTab === "data" && (
                <div className="space-y-6 animate-in fade-in">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                      <div className="text-gray-400 text-[10px] font-bold mb-1 uppercase">
                        رقم التواصل
                      </div>
                      <div
                        className="text-[14px] font-mono text-gray-800 font-bold"
                        dir="ltr"
                      >
                        {safeText(selectedPerson.phone)}
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                      <div className="text-gray-400 text-[10px] font-bold mb-1 uppercase">
                        نوع الاتفاق
                      </div>
                      <div className="text-[14px] font-bold text-gray-800">
                        {safeText(selectedPerson.agreementType)}
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                      <div className="text-gray-400 text-[10px] font-bold mb-1 uppercase">
                        الدولة
                      </div>
                      <div className="text-[14px] font-bold text-gray-800">
                        {safeText(selectedPerson.country) || "غير محدد"}
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                      <div className="text-gray-400 text-[10px] font-bold mb-1 uppercase">
                        رقم الهوية
                      </div>
                      <div className="text-[14px] font-mono font-bold text-gray-800">
                        {safeText(selectedPerson.idNumber) || "غير محدد"}
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <div className="text-gray-400 text-[10px] font-bold mb-2 uppercase">
                      طرق الدفع والاستلام المفضلة
                    </div>
                    <div className="text-[13px] font-bold text-blue-600">
                      {selectedPerson.transferMethod
                        ? selectedPerson.transferMethod
                            .replace(/[\[\]"]/g, "")
                            .replace(/,/g, " + ")
                        : "غير محدد"}
                    </div>
                    {selectedPerson.transferDetails &&
                      Object.keys(selectedPerson.transferDetails).length >
                        0 && (
                        <pre
                          className="mt-3 bg-gray-50 p-3 rounded-lg border border-gray-100 text-xs text-gray-700 font-mono"
                          dir="ltr"
                        >
                          {JSON.stringify(
                            selectedPerson.transferDetails,
                            null,
                            2,
                          )}
                        </pre>
                      )}
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <div className="text-gray-400 text-[10px] font-bold mb-2 uppercase">
                      ملاحظات مسجلة
                    </div>
                    <div className="text-[13px] whitespace-pre-wrap text-gray-700 leading-relaxed font-semibold">
                      {selectedPerson.notes || "لا توجد ملاحظات."}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: Transactions */}
              {activeTab === "transactions" && (
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden animate-in fade-in">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-3 font-bold text-gray-600">
                          المرجع
                        </th>
                        <th className="px-4 py-3 font-bold text-gray-600">
                          النوع
                        </th>
                        <th className="px-4 py-3 font-bold text-gray-600">
                          الدور
                        </th>
                        <th className="px-4 py-3 font-bold text-gray-600">
                          الأتعاب
                        </th>
                        <th className="px-4 py-3 font-bold text-gray-600">
                          التاريخ
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {!selectedPerson.brokeredTransactions &&
                      !selectedPerson.assignedBrokers ? (
                        <tr>
                          <td
                            colSpan="5"
                            className="text-center py-8 text-gray-400 font-bold"
                          >
                            لا توجد معاملات مرتبطة
                          </td>
                        </tr>
                      ) : (
                        <>
                          {selectedPerson.brokeredTransactions?.map((tx) => (
                            <tr
                              key={tx.id}
                              className="border-b border-gray-100 hover:bg-gray-50"
                            >
                              <td className="px-4 py-3 font-mono text-blue-600 font-bold">
                                {tx.transactionCode}
                              </td>
                              <td className="px-4 py-3 text-gray-700 font-bold">
                                {tx.category || "عامة"}
                              </td>
                              <td className="px-4 py-3 text-gray-500 font-bold">
                                مسوق أساسي
                              </td>
                              <td className="px-4 py-3 text-gray-700 font-bold">
                                —
                              </td>
                              <td className="px-4 py-3 text-gray-500 font-mono">
                                {new Date(tx.createdAt).toLocaleDateString(
                                  "ar-SA",
                                )}
                              </td>
                            </tr>
                          ))}
                        </>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* TAB 3: Settlements */}
              {activeTab === "settlements" && (
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden animate-in fade-in">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-3 font-bold text-gray-600">
                          التاريخ
                        </th>
                        <th className="px-4 py-3 font-bold text-gray-600">
                          المبلغ
                        </th>
                        <th className="px-4 py-3 font-bold text-gray-600">
                          المصدر
                        </th>
                        <th className="px-4 py-3 font-bold text-gray-600">
                          الحالة
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {!selectedPerson.settlementsTarget ||
                      selectedPerson.settlementsTarget.length === 0 ? (
                        <tr>
                          <td
                            colSpan="4"
                            className="text-center py-8 text-gray-400 font-bold"
                          >
                            لا توجد تسويات مالية
                          </td>
                        </tr>
                      ) : (
                        selectedPerson.settlementsTarget.map((s) => (
                          <tr
                            key={s.id}
                            className="border-b border-gray-100 hover:bg-gray-50"
                          >
                            <td className="px-4 py-3 font-mono text-gray-500">
                              {new Date(s.createdAt).toLocaleDateString(
                                "ar-SA",
                              )}
                            </td>
                            <td className="px-4 py-3 font-mono font-bold text-green-600">
                              {s.amount.toLocaleString()} ر.س
                            </td>
                            <td className="px-4 py-3 text-gray-700 font-bold">
                              {s.source}
                            </td>
                            <td className="px-4 py-3">
                              <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-[10px] font-bold">
                                {s.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* TAB 4: Collections */}
              {activeTab === "collections" && (
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden animate-in fade-in">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-3 font-bold text-gray-600">
                          التاريخ
                        </th>
                        <th className="px-4 py-3 font-bold text-gray-600">
                          المبلغ
                        </th>
                        <th className="px-4 py-3 font-bold text-gray-600">
                          المرجع
                        </th>
                        <th className="px-4 py-3 font-bold text-gray-600">
                          الطريقة
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {!selectedPerson.paymentsCollected ||
                      selectedPerson.paymentsCollected.length === 0 ? (
                        <tr>
                          <td
                            colSpan="4"
                            className="text-center py-8 text-gray-400 font-bold"
                          >
                            لا توجد تحصيلات مسجلة
                          </td>
                        </tr>
                      ) : (
                        selectedPerson.paymentsCollected.map((p) => (
                          <tr
                            key={p.id}
                            className="border-b border-gray-100 hover:bg-gray-50"
                          >
                            <td className="px-4 py-3 font-mono text-gray-500">
                              {new Date(p.date).toLocaleDateString("ar-SA")}
                            </td>
                            <td className="px-4 py-3 font-mono font-bold text-blue-600">
                              {p.amount.toLocaleString()} ر.س
                            </td>
                            <td className="px-4 py-3 text-gray-700 font-bold">
                              {p.periodRef || "—"}
                            </td>
                            <td className="px-4 py-3 text-gray-500 font-bold">
                              {p.method}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* TAB 5: Disbursements */}
              {activeTab === "disbursements" && (
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden animate-in fade-in">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-3 font-bold text-gray-600">
                          التاريخ
                        </th>
                        <th className="px-4 py-3 font-bold text-gray-600">
                          المبلغ
                        </th>
                        <th className="px-4 py-3 font-bold text-gray-600">
                          السبب/النوع
                        </th>
                        <th className="px-4 py-3 font-bold text-gray-600">
                          ملاحظات
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {!selectedPerson.disbursements ||
                      selectedPerson.disbursements.length === 0 ? (
                        <tr>
                          <td
                            colSpan="4"
                            className="text-center py-8 text-gray-400 font-bold"
                          >
                            لا توجد منصرفات أو سلف
                          </td>
                        </tr>
                      ) : (
                        selectedPerson.disbursements.map((d) => (
                          <tr
                            key={d.id}
                            className="border-b border-gray-100 hover:bg-gray-50"
                          >
                            <td className="px-4 py-3 font-mono text-gray-500">
                              {new Date(d.date).toLocaleDateString("ar-SA")}
                            </td>
                            <td className="px-4 py-3 font-mono font-bold text-red-600">
                              {d.amount.toLocaleString()} ر.س
                            </td>
                            <td className="px-4 py-3 text-gray-700 font-bold">
                              {d.type}
                            </td>
                            <td className="px-4 py-3 text-gray-500 font-semibold">
                              {d.notes}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* TAB 6: Attachments */}
              {activeTab === "attachments" && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm flex items-center justify-between">
                    <div>
                      <h3 className="text-gray-800 font-black text-sm">
                        مرفقات ووثائق الشخص
                      </h3>
                      <p className="text-gray-500 text-xs font-semibold mt-1">
                        يمكنك عرض الملفات المرفقة أو حذفها من هنا.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {!selectedPerson.attachments ||
                    selectedPerson.attachments.length === 0 ? (
                      <div className="col-span-full text-center py-10 bg-white border border-dashed border-gray-300 rounded-xl">
                        <Archive className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                        <span className="text-gray-400 font-bold text-sm">
                          لا توجد مرفقات محفوظة
                        </span>
                      </div>
                    ) : (
                      selectedPerson.attachments.map((file, i) => (
                        <div
                          key={i}
                          className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col items-center text-center group hover:border-blue-300 transition-colors"
                        >
                          <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center mb-3 text-blue-500">
                            <FileText className="w-6 h-6" />
                          </div>
                          <span
                            className="text-xs font-bold text-gray-700 truncate w-full mb-3"
                            title={file.name}
                          >
                            {file.name}
                          </span>
                          <div className="flex items-center gap-2 w-full">
                            <button
                              onClick={(e) => handleViewAttachment(e, file.url)}
                              className="flex-1 bg-blue-50 text-blue-600 py-1.5 rounded-md text-[10px] font-bold hover:bg-blue-600 hover:text-white transition-colors"
                            >
                              معاينة
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm("هل تريد حذف المرفق؟"))
                                  removeAttachmentMutation.mutate({
                                    id: selectedPerson.id,
                                    fileUrl: file.url,
                                  });
                              }}
                              className="p-1.5 bg-red-50 text-red-500 rounded-md hover:bg-red-500 hover:text-white transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Preview File */}
      {previewData && (
        <div
          className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 animate-in fade-in"
          dir="rtl"
          onClick={closePreview}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden w-full max-w-5xl h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0 bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Eye className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-gray-800 font-bold text-[16px]">
                  معاينة المستند
                </span>
              </div>
              <div className="flex gap-2">
                <a
                  href={previewData.url}
                  download
                  className="p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-100 text-gray-700 transition-colors"
                  title="تحميل"
                >
                  <Download className="w-5 h-5" />
                </a>
                <button
                  onClick={closePreview}
                  className="text-gray-500 hover:text-red-500 bg-white border border-gray-200 shadow-sm p-2 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="flex-1 bg-gray-200 p-6 flex items-center justify-center overflow-hidden">
              {previewData.isPdf ? (
                <iframe
                  src={previewData.url}
                  className="w-full h-full rounded-xl border border-gray-300 shadow-lg bg-white"
                  title="PDF Preview"
                />
              ) : (
                <img
                  src={previewData.url}
                  alt="مرفق"
                  className="max-w-full max-h-full rounded-xl shadow-lg border border-gray-300 object-contain bg-white"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
