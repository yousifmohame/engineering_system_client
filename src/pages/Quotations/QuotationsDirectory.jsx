import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "../../api/axios";
import {
  FileText,
  Filter,
  Search,
  ArrowUpDown,
  Eye,
  Printer,
  Copy,
  Download,
  Send,
  Ban,
  Stamp,
  MessageSquare,
  X,
  ExternalLink,
  Loader2,
  Trash2,
  ShieldCheck,
  Calendar
} from "lucide-react";
import { format } from "date-fns";
import { arSA } from "date-fns/locale";
import { toast } from "sonner";
import AccessControl from "../../components/AccessControl";

// ==========================================
// مكونات مساعدة للحالات (Badges)
// ==========================================
const StatusBadge = ({ status }) => {
  const config = {
    DRAFT: { label: "مسودة", bg: "bg-slate-100", text: "text-slate-500" },
    PENDING_APPROVAL: {
      label: "تحت المراجعة",
      bg: "bg-blue-100",
      text: "text-blue-700",
    },
    REJECTED: {
      label: "راجع بملاحظات",
      bg: "bg-orange-100",
      text: "text-orange-700",
    },
    SENT: {
      label: "بانتظار توقيع المالك",
      bg: "bg-amber-100",
      text: "text-amber-700",
    },
    APPROVED: {
      label: "معتمد — بانتظار الدفع",
      bg: "bg-emerald-100",
      text: "text-emerald-700",
    },
    PARTIALLY_PAID: {
      label: "مسدد جزئياً",
      bg: "bg-yellow-100",
      text: "text-yellow-700",
    },
    ACCEPTED: {
      label: "مسدد بالكامل",
      bg: "bg-green-100",
      text: "text-green-700",
    },
    EXPIRED: { label: "منتهي الصلاحية", bg: "bg-red-50", text: "text-red-700" },
    CANCELLED: { label: "ملغى", bg: "bg-red-100", text: "text-red-800" },
  };
  const current = config[status] || config.DRAFT;
  return (
    <span
      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${current.bg} ${current.text}`}
    >
      {current.label}
    </span>
  );
};

const getClientName = (client) => {
  if (!client || !client.name) return "عميل غير محدد";
  if (typeof client.name === "object") {
    return client.name.ar || client.name.en || "عميل غير محدد";
  }
  return client.name;
};

// ==========================================
// المكون الرئيسي
// ==========================================
const QuotationsDirectory = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [selectedQuoteId, setSelectedQuoteId] = useState(null);

  // 👈 1. حالة فتح نافذة الطباعة
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // جلب البيانات من السيرفر
  const { data: quotationsData, isLoading } = useQuery({
    queryKey: ["quotations-list"],
    queryFn: async () => {
      const response = await axios.get("/quotations");
      return response.data.data;
    },
  });

  // دالة الحذف (Mutation)
  const deleteQuotationMutation = useMutation({
    mutationFn: async (id) => {
      const response = await axios.delete(`/quotations/${id}`);
      return response.data;
    },
    onSuccess: () => {
      toast.success("تم نقل عرض السعر إلى سلة المحذوفات بنجاح");
      queryClient.invalidateQueries(["quotations-list"]);
    },
    onError: (err) => {
      const errorMsg =
        err.response?.data?.message || "حدث خطأ أثناء محاولة حذف العرض";
      toast.error(errorMsg);
    },
  });

  const handleDelete = (e, id) => {
    e.stopPropagation();
    if (
      window.confirm(
        "هل أنت متأكد من رغبتك في نقل عرض السعر هذا إلى سلة المحذوفات؟",
      )
    ) {
      deleteQuotationMutation.mutate(id);
      if (selectedQuoteId === id) setSelectedQuoteId(null);
    }
  };

  const filteredData = (quotationsData || []).filter((q) => {
    if (q.isDeleted || q.status === "TRASHED") return false;
    const matchesSearch =
      q.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (getClientName(q.client) || "").includes(searchTerm) ||
      (q.ownership?.code || "").includes(searchTerm);
    const matchesStatus = filterStatus === "ALL" || q.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const selectedQuote = selectedQuoteId
    ? filteredData.find((q) => q.id === selectedQuoteId)
    : null;

  const totalAmount = filteredData.reduce((sum, q) => sum + Number(q.total), 0);
  const totalPaid = 0;
  const totalRemaining = totalAmount - totalPaid;

  const getStatusCount = (status) =>
    (quotationsData || []).filter((q) => q.status === status && !q.isDeleted)
      .length;

  // 👈 2. دالة فتح الطباعة
  const handleOpenPrint = (e, id) => {
    e.stopPropagation();
    setSelectedQuoteId(id);
    setIsPrintModalOpen(true);
  };

  return (
    <div className="flex h-full bg-slate-50 font-sans relative" dir="rtl">
      {/* الجزء الأيمن (الجدول الرئيسي) */}
      <div
        className={`flex-1 overflow-y-auto p-4 md:p-5 transition-all ${selectedQuote && !isPrintModalOpen ? "w-[62%] max-w-[62%]" : "w-full"}`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="text-base font-bold text-slate-800 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" /> دليل عروض الأسعار
            <span className="text-xs text-slate-500 font-normal">
              ({filteredData.length} من {quotationsData?.length || 0})
            </span>
          </div>
          <button className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-[11px] font-bold text-slate-500 flex items-center gap-1.5 hover:bg-slate-50">
            <Filter className="w-3 h-3" /> فلاتر
          </button>
        </div>

        <div className="relative mb-3">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="بحث ذكي: اسم العميل، الكود، آخر 4 أرقام..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full py-2 pr-9 pl-3 border border-slate-300 rounded-lg text-xs outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex gap-1.5 mb-3 flex-wrap">
          <button
            onClick={() => setFilterStatus("ALL")}
            className={`px-3 py-1 rounded-md text-[10px] font-bold border transition-colors ${filterStatus === "ALL" ? "bg-blue-50 border-blue-200 text-blue-600" : "bg-white border-slate-200 text-slate-500"}`}
          >
            الكل ({filteredData.length})
          </button>
          <button
            onClick={() => setFilterStatus("DRAFT")}
            className={`px-3 py-1 rounded-md text-[10px] font-bold border transition-colors ${filterStatus === "DRAFT" ? "bg-blue-50 border-blue-200 text-blue-600" : "bg-white border-slate-200 text-slate-500"}`}
          >
            مسودة ({getStatusCount("DRAFT")})
          </button>
          <button
            onClick={() => setFilterStatus("PENDING_APPROVAL")}
            className={`px-3 py-1 rounded-md text-[10px] font-bold border transition-colors ${filterStatus === "PENDING_APPROVAL" ? "bg-blue-50 border-blue-200 text-blue-600" : "bg-white border-slate-200 text-slate-500"}`}
          >
            تحت المراجعة ({getStatusCount("PENDING_APPROVAL")})
          </button>
          <button
            onClick={() => setFilterStatus("SENT")}
            className={`px-3 py-1 rounded-md text-[10px] font-bold border transition-colors ${filterStatus === "SENT" ? "bg-blue-50 border-blue-200 text-blue-600" : "bg-white border-slate-200 text-slate-500"}`}
          >
            بانتظار التوقيع ({getStatusCount("SENT")})
          </button>
          <button
            onClick={() => setFilterStatus("APPROVED")}
            className={`px-3 py-1 rounded-md text-[10px] font-bold border transition-colors ${filterStatus === "APPROVED" ? "bg-blue-50 border-blue-200 text-blue-600" : "bg-white border-slate-200 text-slate-500"}`}
          >
            معتمد ({getStatusCount("APPROVED")})
          </button>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto min-h-[300px]">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin mb-2" /> جاري
                التحميل...
              </div>
            ) : (
              <table className="w-full text-right border-collapse min-w-[1200px]">
                <thead>
                  <tr className="bg-slate-50 border-b-2 border-slate-200">
                    <th className="p-2 text-[10px] text-slate-500 font-bold w-10">
                      #
                    </th>
                    <th className="p-2 text-[10px] text-slate-500 font-bold">
                      رقم العرض
                    </th>
                    <th className="p-2 text-[10px] text-slate-500 font-bold">
                      التاريخ
                    </th>
                    <th className="p-2 text-[10px] text-slate-500 font-bold">
                      العميل
                    </th>
                    <th className="p-2 text-[10px] text-slate-500 font-bold">
                      الملكية
                    </th>
                    <th className="p-2 text-[10px] text-slate-500 font-bold">
                      قبل الضريبة
                    </th>
                    <th className="p-2 text-[10px] text-slate-500 font-bold">
                      ضريبة
                    </th>
                    <th className="p-2 text-[10px] text-slate-500 font-bold">
                      الإجمالي
                    </th>
                    <th className="p-2 text-[10px] text-slate-500 font-bold">
                      الحالة
                    </th>
                    <th className="p-2 text-[10px] text-slate-500 font-bold text-center">
                      إجراءات
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((q, idx) => (
                    <tr
                      key={q.id}
                      className={`border-b border-slate-100 hover:bg-slate-50/70 transition-colors ${selectedQuoteId === q.id ? "bg-blue-50/40" : ""}`}
                    >
                      <td className="p-2 text-[10px] text-slate-400 font-mono">
                        {idx + 1}
                      </td>
                      <td className="p-2">
                        <div
                          className="flex items-center gap-1.5"
                          onClick={() => setSelectedQuoteId(q.id)}
                        >
                          <span className="font-mono text-[11px] font-bold text-blue-600 cursor-pointer hover:underline">
                            {q.number}
                          </span>
                          <span className="text-[8px] text-purple-600 font-bold bg-purple-50 px-1 rounded">
                            {q.templateType === "DETAILED" ? "T" : "S"}
                          </span>
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="text-[10px] font-mono">
                          {format(new Date(q.issueDate), "yyyy-MM-dd")}
                        </div>
                        <div className="text-[8px] text-slate-400">
                          {format(new Date(q.issueDate), "EEEE", {
                            locale: arSA,
                          })}
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="font-bold text-[11px] text-slate-700">
                          {getClientName(q.client)}
                        </div>
                        {q.client?.clientCode && (
                          <div className="text-[9px] text-slate-400 font-mono">
                            {q.client.clientCode}
                          </div>
                        )}
                      </td>
                      <td className="p-2">
                        {q.ownership ? (
                          <span className="font-mono text-[10px] text-emerald-600 font-bold">
                            {q.ownership.code}
                          </span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                      <td className="p-2 text-[10px] text-slate-600 font-mono">
                        {Number(q.subtotal).toLocaleString()}
                      </td>
                      <td className="p-2 text-[10px] text-slate-500 font-mono">
                        {Number(q.taxAmount).toLocaleString()}{" "}
                        <span className="text-[8px]">({q.taxRate * 100}%)</span>
                      </td>
                      <td className="p-2 text-[11px] font-bold text-blue-700 font-mono">
                        {Number(q.total).toLocaleString()}
                      </td>
                      <td className="p-2">
                        <StatusBadge status={q.status} />
                      </td>
                      <td className="p-2">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setSelectedQuoteId(q.id)}
                            className="p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                            title="تفاصيل"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* 👈 زر الطباعة في الجدول */}
                          <button
                            onClick={(e) => handleOpenPrint(e, q.id)}
                            className="p-1.5 bg-slate-100 text-slate-600 rounded hover:bg-slate-200 transition-colors"
                            title="طباعة العرض"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          <AccessControl
                            code="QUOTE_ACTION_DELETE"
                            name="حذف عرض السعر"
                            moduleName="عروض الأسعار"
                            tabName="الجدول"
                          >
                            <button
                              onClick={(e) => handleDelete(e, q.id)}
                              disabled={deleteQuotationMutation.isPending}
                              className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors disabled:opacity-50"
                              title="نقل لسلة المحذوفات"
                            >
                              {deleteQuotationMutation.isPending &&
                              selectedQuoteId === q.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </AccessControl>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredData.length === 0 && (
                    <tr>
                      <td
                        colSpan="10"
                        className="p-8 text-center text-slate-400 text-xs"
                      >
                        لا يوجد عروض أسعار مطابقة للبحث
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* الجزء الأيسر (المعاينة السريعة / Side Panel) */}
      {selectedQuote && !isPrintModalOpen && (
        <div className="hidden lg:flex flex-col w-[38%] border-r border-slate-200 bg-white p-4 h-full overflow-y-auto custom-scrollbar shadow-[-5px_0_20px_rgba(0,0,0,0.03)] animate-in slide-in-from-left-4 duration-300">
          {/* ... محتوى Side Panel العادي كما هو ... */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-600" />
              <div>
                <div className="text-sm font-bold text-slate-800">
                  تفاصيل عرض السعر
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  {selectedQuote.number}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={selectedQuote.status} />
              <button
                onClick={() => setSelectedQuoteId(null)}
                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="p-2 bg-slate-50 rounded-lg">
              <div className="text-[9px] text-slate-500">العميل</div>
              <div className="text-[11px] font-bold text-slate-800 truncate">
                {getClientName(selectedQuote.client)}
              </div>
            </div>
            <div className="p-2 bg-slate-50 rounded-lg">
              <div className="text-[9px] text-slate-500">الملكية</div>
              <div className="text-[11px] font-bold text-emerald-700 truncate">
                {selectedQuote.ownership?.code || "—"}
              </div>
            </div>
            <div className="p-2 bg-slate-50 rounded-lg">
              <div className="text-[9px] text-slate-500">تاريخ الإنشاء</div>
              <div className="text-[11px] font-bold text-slate-800 font-mono">
                {format(new Date(selectedQuote.issueDate), "yyyy-MM-dd")}
              </div>
            </div>
            <div className="p-2 bg-slate-50 rounded-lg">
              <div className="text-[9px] text-slate-500">صلاحية حتى</div>
              <div className="text-[11px] font-bold text-slate-800 font-mono">
                {format(new Date(selectedQuote.expiryDate), "yyyy-MM-dd")}
              </div>
            </div>
          </div>

          <div className="mb-4">
            <div className="text-[11px] font-bold text-slate-700 mb-2">
              بنود العرض ({selectedQuote.items?.length || 0}):
            </div>
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-right text-[10px]">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="p-1.5 text-slate-500">الوصف</th>
                    <th className="p-1.5 text-slate-500 text-center">الكمية</th>
                    <th className="p-1.5 text-slate-500 text-center">السعر</th>
                    <th className="p-1.5 text-slate-500 text-left">الإجمالي</th>
                  </tr>
                </thead>
                <tbody>
                  {(selectedQuote.items || []).map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-slate-100 last:border-0"
                    >
                      <td className="p-1.5 text-slate-700 font-medium truncate max-w-[120px]">
                        {item.title}
                      </td>
                      <td className="p-1.5 text-center font-mono text-slate-600">
                        {item.quantity}
                      </td>
                      <td className="p-1.5 text-center font-mono text-slate-600">
                        {Number(item.unitPrice).toLocaleString()}
                      </td>
                      <td className="p-1.5 text-left font-bold font-mono text-slate-800">
                        {Number(item.subtotal).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="bg-blue-50/50 p-2 flex justify-between text-[11px] border-t border-slate-200">
                <span className="text-slate-600">الإجمالي الشامل:</span>
                <strong className="text-blue-700 font-mono">
                  {Number(selectedQuote.total).toLocaleString()} ر.س
                </strong>
              </div>
            </div>
          </div>

          <div className="flex-1"></div>

          <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-2 gap-2">
            {/* 👈 زر الطباعة في اللوحة الجانبية */}
            <button
              onClick={(e) => handleOpenPrint(e, selectedQuote.id)}
              className="py-2 bg-blue-600 text-white rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 hover:bg-blue-700"
            >
              <Printer className="w-3.5 h-3.5" /> طباعة احترافية
            </button>
            <button className="py-2 bg-slate-100 text-slate-700 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 hover:bg-slate-200">
              <Send className="w-3.5 h-3.5" /> إرسال للعميل
            </button>
          </div>
        </div>
      )}

      {/* 👈 3. شاشة (Modal) الطباعة الاحترافية */}
      {isPrintModalOpen && selectedQuote && (
        <div className="fixed inset-0 bg-slate-900/70 z-[2000] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            dir="rtl"
            style={{
              backgroundColor: "white",
              borderRadius: "14px",
              width: "1060px",
              maxHeight: "96vh",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              boxShadow: "rgba(0, 0, 0, 0.3) 0px 25px 60px",
              transition: "width 0.3s",
              position: "relative",
            }}
          >
            {/* رأس النافذة (Toolbar) */}
            <div
              style={{
                padding: "10px 16px",
                borderBottom: "1px solid rgb(226, 232, 240)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                backgroundColor: "rgb(248, 250, 252)",
                flexWrap: "wrap",
                gap: "6px",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <Printer className="w-4 h-4 text-blue-600" />
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: "bold",
                    color: "rgb(31, 41, 55)",
                  }}
                >
                  عرض سعر احترافي
                </span>
                <span
                  style={{
                    fontFamily: "monospace",
                    fontSize: "10px",
                    color: "rgb(59, 130, 246)",
                    backgroundColor: "rgb(239, 246, 255)",
                    padding: "2px 6px",
                    borderRadius: "4px",
                  }}
                >
                  {selectedQuote.number}
                </span>
              </div>

              <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                <button
                  style={{
                    padding: "4px 10px",
                    backgroundColor: "white",
                    color: "rgb(107, 114, 128)",
                    border: "1px solid rgb(209, 213, 219)",
                    borderRadius: "5px",
                    fontSize: "10px",
                    fontWeight: "bold",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "3px",
                    whiteSpace: "nowrap",
                  }}
                >
                  <Eye className="w-3 h-3" /> إخفاء الحساس
                </button>
                <button
                  style={{
                    padding: "4px 10px",
                    backgroundColor: "white",
                    color: "rgb(107, 114, 128)",
                    border: "1px solid rgb(209, 213, 219)",
                    borderRadius: "5px",
                    fontSize: "10px",
                    fontWeight: "bold",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "3px",
                    whiteSpace: "nowrap",
                  }}
                >
                  <ShieldCheck className="w-3 h-3" /> إخفاء البنكي
                </button>
                <button
                  style={{
                    padding: "4px 10px",
                    backgroundColor: "white",
                    color: "rgb(8, 145, 178)",
                    border: "1px solid rgb(209, 213, 219)",
                    borderRadius: "5px",
                    fontSize: "10px",
                    fontWeight: "bold",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "3px",
                    whiteSpace: "nowrap",
                  }}
                >
                  <Calendar className="w-3 h-3" /> إدارة الصلاحية
                </button>
                <button
                  style={{
                    padding: "4px 10px",
                    backgroundColor: "white",
                    color: "rgb(124, 58, 237)",
                    border: "1px solid rgb(209, 213, 219)",
                    borderRadius: "5px",
                    fontSize: "10px",
                    fontWeight: "bold",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "3px",
                    whiteSpace: "nowrap",
                  }}
                >
                  <SaveIcon className="w-3 h-3" /> حفظ كنموذج
                </button>
                <button
                  style={{
                    padding: "4px 10px",
                    backgroundColor: "white",
                    color: "rgb(22, 163, 74)",
                    border: "1px solid rgb(209, 213, 219)",
                    borderRadius: "5px",
                    fontSize: "10px",
                    fontWeight: "bold",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "3px",
                    whiteSpace: "nowrap",
                  }}
                >
                  <GlobeIcon className="w-3 h-3" /> نسخة إنجليزية AI
                </button>
                <div
                  style={{
                    width: "1px",
                    backgroundColor: "rgb(226, 232, 240)",
                    margin: "0px 4px",
                  }}
                ></div>
                <button
                  style={{
                    padding: "4px 10px",
                    backgroundColor: "rgba(124, 58, 237, 0.082)",
                    color: "rgb(124, 58, 237)",
                    border: "1px solid rgba(124, 58, 237, 0.25)",
                    borderRadius: "5px",
                    fontSize: "10px",
                    fontWeight: "bold",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "3px",
                    whiteSpace: "nowrap",
                  }}
                >
                  <Stamp className="w-3 h-3" /> إخفاء الختم
                </button>
                <button
                  style={{
                    padding: "4px 10px",
                    backgroundColor: "rgba(8, 145, 178, 0.082)",
                    color: "rgb(8, 145, 178)",
                    border: "1px solid rgba(8, 145, 178, 0.25)",
                    borderRadius: "5px",
                    fontSize: "10px",
                    fontWeight: "bold",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "3px",
                    whiteSpace: "nowrap",
                  }}
                >
                  <QrCodeIcon className="w-3 h-3" /> إخفاء QR
                </button>
                <div
                  style={{
                    width: "1px",
                    backgroundColor: "rgb(226, 232, 240)",
                    margin: "0px 4px",
                  }}
                ></div>
                <button
                  style={{
                    padding: "6px 14px",
                    backgroundColor: "rgb(29, 78, 216)",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    fontSize: "11px",
                    fontWeight: "bold",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <Printer className="w-3.5 h-3.5" /> طباعة / تصدير
                </button>
                <button
                  onClick={() => setIsPrintModalOpen(false)}
                  style={{
                    padding: "4px",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  <X className="w-5 h-5 text-gray-400 hover:text-red-500" />
                </button>
              </div>
            </div>

            {/* محتوى الورقة (A4 Preview) */}
            <div
              style={{ display: "flex", flex: "1 1 0%", overflow: "hidden" }}
            >
              <div
                style={{
                  flex: "1 1 0%",
                  overflowY: "auto",
                  padding: "16px 20px",
                  backgroundColor: "rgb(226, 232, 240)",
                }}
              >
                <div style={{ maxWidth: "780px", margin: "0px auto" }}>
                  {/* الصفحة الأولى */}
                  <div
                    style={{
                      backgroundColor: "white",
                      borderRadius: "4px",
                      boxShadow: "rgba(0, 0, 0, 0.08) 0px 2px 16px",
                      padding: "0px",
                      marginBottom: "16px",
                      position: "relative",
                      overflow: "hidden",
                      minHeight: "520px",
                    }}
                  >
                    <div
                      style={{
                        height: "6px",
                        background:
                          "linear-gradient(to left, rgb(29, 78, 216), rgb(59, 130, 246), rgb(96, 165, 250))",
                      }}
                    ></div>

                    {/* ترويسة الورقة (Header) */}
                    <div
                      style={{
                        position: "relative",
                        zIndex: 1,
                        textAlign: "center",
                        padding: "40px 32px 32px",
                      }}
                    >
                      <div
                        style={{
                          width: "68px",
                          height: "68px",
                          borderRadius: "14px",
                          background:
                            "linear-gradient(135deg, rgb(29, 78, 216), rgb(59, 130, 246))",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                          fontSize: "22px",
                          fontWeight: "800",
                          margin: "0px auto 12px",
                          boxShadow: "rgba(29, 78, 216, 0.25) 0px 4px 14px",
                        }}
                      >
                        خ م
                      </div>
                      <div
                        style={{
                          fontSize: "14px",
                          fontWeight: "700",
                          color: "rgb(29, 78, 216)",
                          marginBottom: "2px",
                        }}
                      >
                        مكتب الخبراء المتحدون للاستشارات العقارية
                      </div>
                      <div
                        style={{
                          fontSize: "10px",
                          color: "rgb(156, 163, 175)",
                          marginBottom: "28px",
                        }}
                      >
                        United Experts Real Estate Consultancy
                      </div>
                      <div
                        style={{
                          fontSize: "28px",
                          fontWeight: "800",
                          color: "rgb(29, 78, 216)",
                          marginBottom: "2px",
                          letterSpacing: "1px",
                        }}
                      >
                        عرض سعر
                      </div>
                      <div
                        style={{
                          fontSize: "11px",
                          color: "rgb(156, 163, 175)",
                          marginBottom: "20px",
                          letterSpacing: "3px",
                        }}
                      >
                        PRICE QUOTATION
                      </div>
                      <div
                        style={{
                          display: "inline-block",
                          fontSize: "18px",
                          fontFamily: "monospace",
                          fontWeight: "700",
                          color: "rgb(55, 65, 81)",
                          padding: "8px 28px",
                          backgroundColor: "rgb(248, 250, 252)",
                          borderRadius: "8px",
                          border: "2px solid rgb(226, 232, 240)",
                          marginBottom: "16px",
                        }}
                      >
                        {selectedQuote.number}
                      </div>

                      <div style={{ marginBottom: "24px" }}>
                        <StatusBadge status={selectedQuote.status} />
                      </div>

                      {/* صندوق ملخص العرض */}
                      <div
                        style={{
                          maxWidth: "420px",
                          margin: "0px auto",
                          padding: "18px 20px",
                          backgroundColor: "rgb(248, 250, 252)",
                          borderRadius: "10px",
                          border: "1px solid rgb(226, 232, 240)",
                          textAlign: "right",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "11px",
                            fontWeight: "700",
                            color: "rgb(29, 78, 216)",
                            marginBottom: "10px",
                            textAlign: "center",
                            paddingBottom: "8px",
                            borderBottom: "1px solid rgb(226, 232, 240)",
                          }}
                        >
                          تفاصيل العرض
                        </div>
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "100px 1fr",
                            gap: "6px 12px",
                            fontSize: "11px",
                            color: "rgb(55, 65, 81)",
                          }}
                        >
                          <span style={{ color: "rgb(107, 114, 128)" }}>
                            العنوان:
                          </span>
                          <span style={{ fontWeight: "700" }}>
                            عرض سعر — استشارات وخدمات عقارية
                          </span>
                          <span style={{ color: "rgb(107, 114, 128)" }}>
                            العميل:
                          </span>
                          <span
                            style={{
                              fontWeight: "700",
                              color: "rgb(29, 78, 216)",
                            }}
                          >
                            {getClientName(selectedQuote.client)}
                          </span>
                          <span style={{ color: "rgb(107, 114, 128)" }}>
                            رقم الملكية:
                          </span>
                          <span
                            style={{
                              fontFamily: "monospace",
                              color: "rgb(5, 150, 105)",
                            }}
                          >
                            {selectedQuote.ownership?.code || "—"}
                          </span>
                          <span style={{ color: "rgb(107, 114, 128)" }}>
                            التاريخ:
                          </span>
                          <span>
                            {format(
                              new Date(selectedQuote.issueDate),
                              "yyyy-MM-dd",
                            )}
                          </span>
                          <span style={{ color: "rgb(107, 114, 128)" }}>
                            صالح حتى:
                          </span>
                          <span style={{ color: "rgb(55, 65, 81)" }}>
                            {format(
                              new Date(selectedQuote.expiryDate),
                              "yyyy-MM-dd",
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* الصفحة الثانية (التفاصيل) */}
                  <div
                    style={{
                      backgroundColor: "white",
                      borderRadius: "4px",
                      boxShadow: "rgba(0, 0, 0, 0.08) 0px 2px 16px",
                      padding: "28px 32px",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    {/* الترحيب */}
                    <div
                      style={{
                        marginBottom: "18px",
                        padding: "16px 20px",
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        borderRadius: "10px",
                        border: "1px solid rgb(226, 232, 240)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "baseline",
                          marginBottom: "4px",
                          fontSize: "13px",
                          lineHeight: "1.8",
                        }}
                      >
                        <div>
                          <span style={{ color: "rgb(55, 65, 81)" }}>
                            المكرم /
                          </span>{" "}
                          <strong
                            style={{
                              color: "rgb(30, 58, 95)",
                              fontSize: "14px",
                            }}
                          >
                            {getClientName(selectedQuote.client)}
                          </strong>
                        </div>
                        <span
                          style={{
                            color: "rgb(107, 114, 128)",
                            fontSize: "12px",
                            fontStyle: "italic",
                          }}
                        >
                          حفظه الله
                        </span>
                      </div>
                      <div
                        style={{
                          marginTop: "10px",
                          fontSize: "13px",
                          color: "rgb(55, 65, 81)",
                          fontWeight: "600",
                        }}
                      >
                        السلام عليكم ورحمة الله وبركاته
                      </div>
                      <div
                        style={{
                          marginTop: "8px",
                          fontSize: "11px",
                          color: "rgb(75, 85, 99)",
                          lineHeight: "1.8",
                        }}
                      >
                        نقدم لسعادتكم عرض سعر بناءً على طلبكم، وفيما يلي تفاصيل
                        البنود والأسعار:
                      </div>
                    </div>

                    {/* جدول البنود */}
                    <div style={{ marginBottom: "18px" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          paddingBottom: "6px",
                          borderBottom: "2px solid rgb(29, 78, 216)",
                          marginBottom: "10px",
                        }}
                      >
                        <div
                          style={{
                            width: "26px",
                            height: "26px",
                            borderRadius: "6px",
                            background:
                              "linear-gradient(135deg, rgb(29, 78, 216), rgb(59, 130, 246))",
                            color: "white",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "12px",
                            fontWeight: "800",
                          }}
                        >
                          D
                        </div>
                        <div
                          style={{
                            fontSize: "12px",
                            fontWeight: "700",
                            color: "rgb(30, 58, 95)",
                          }}
                        >
                          البنود والتسعير
                        </div>
                      </div>
                      <table
                        style={{
                          width: "100%",
                          borderCollapse: "collapse",
                          border: "1px solid rgb(226, 232, 240)",
                          borderRadius: "8px",
                          overflow: "hidden",
                        }}
                      >
                        <thead>
                          <tr style={{ backgroundColor: "rgb(29, 78, 216)" }}>
                            <th
                              style={{
                                padding: "7px 10px",
                                textAlign: "center",
                                fontSize: "10px",
                                color: "white",
                                fontWeight: "700",
                              }}
                            >
                              #
                            </th>
                            <th
                              style={{
                                padding: "7px 10px",
                                textAlign: "right",
                                fontSize: "10px",
                                color: "white",
                                fontWeight: "700",
                              }}
                            >
                              الوصف
                            </th>
                            <th
                              style={{
                                padding: "7px 10px",
                                textAlign: "center",
                                fontSize: "10px",
                                color: "white",
                                fontWeight: "700",
                              }}
                            >
                              الكمية
                            </th>
                            <th
                              style={{
                                padding: "7px 10px",
                                textAlign: "center",
                                fontSize: "10px",
                                color: "white",
                                fontWeight: "700",
                              }}
                            >
                              السعر
                            </th>
                            <th
                              style={{
                                padding: "7px 10px",
                                textAlign: "left",
                                fontSize: "10px",
                                color: "white",
                                fontWeight: "700",
                              }}
                            >
                              الإجمالي
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {(selectedQuote.items || []).map((item, i) => (
                            <tr key={i} style={{ backgroundColor: "white" }}>
                              <td
                                style={{
                                  padding: "6px 10px",
                                  fontSize: "10px",
                                  color: "rgb(156, 163, 175)",
                                  borderBottom: "1px solid rgb(241, 245, 249)",
                                  textAlign: "center",
                                }}
                              >
                                {i + 1}
                              </td>
                              <td
                                style={{
                                  padding: "6px 10px",
                                  fontSize: "10px",
                                  color: "rgb(55, 65, 81)",
                                  borderBottom: "1px solid rgb(241, 245, 249)",
                                  fontWeight: "bold",
                                }}
                              >
                                {item.title}
                              </td>
                              <td
                                style={{
                                  padding: "6px 10px",
                                  fontSize: "10px",
                                  color: "rgb(55, 65, 81)",
                                  borderBottom: "1px solid rgb(241, 245, 249)",
                                  fontFamily: "monospace",
                                  textAlign: "center",
                                }}
                              >
                                {item.quantity}
                              </td>
                              <td
                                style={{
                                  padding: "6px 10px",
                                  fontSize: "10px",
                                  color: "rgb(55, 65, 81)",
                                  borderBottom: "1px solid rgb(241, 245, 249)",
                                  fontFamily: "monospace",
                                  textAlign: "center",
                                }}
                              >
                                {Number(item.unitPrice).toLocaleString()}
                              </td>
                              <td
                                style={{
                                  padding: "6px 10px",
                                  fontSize: "10px",
                                  color: "rgb(55, 65, 81)",
                                  borderBottom: "1px solid rgb(241, 245, 249)",
                                  fontFamily: "monospace",
                                  fontWeight: "bold",
                                  textAlign: "left",
                                }}
                              >
                                {Number(item.subtotal).toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      {/* المجاميع الفرعية والضريبة */}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "flex-end",
                          marginTop: "6px",
                        }}
                      >
                        <div
                          style={{
                            width: "280px",
                            border: "1px solid rgb(226, 232, 240)",
                            borderRadius: "8px",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              padding: "5px 12px",
                              fontSize: "11px",
                              borderBottom: "1px solid rgb(241, 245, 249)",
                            }}
                          >
                            <span style={{ color: "rgb(107, 114, 128)" }}>
                              المجموع الفرعي
                            </span>
                            <span
                              style={{
                                fontWeight: "700",
                                fontFamily: "monospace",
                              }}
                            >
                              {Number(selectedQuote.subtotal).toLocaleString()}{" "}
                              ر.س
                            </span>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              padding: "5px 12px",
                              fontSize: "11px",
                              borderBottom: "1px solid rgb(241, 245, 249)",
                            }}
                          >
                            <span style={{ color: "rgb(107, 114, 128)" }}>
                              ضريبة القيمة المضافة (
                              {selectedQuote.taxRate * 100}%)
                            </span>
                            <span
                              style={{
                                fontWeight: "700",
                                fontFamily: "monospace",
                              }}
                            >
                              {Number(selectedQuote.taxAmount).toLocaleString()}{" "}
                              ر.س
                            </span>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              padding: "8px 12px",
                              backgroundColor: "rgb(29, 78, 216)",
                              color: "white",
                              fontWeight: "700",
                              fontSize: "13px",
                            }}
                          >
                            <span>الإجمالي شامل الضريبة</span>
                            <span>
                              {Number(selectedQuote.total).toLocaleString()} ر.س
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* الدفعات */}
                    <div style={{ marginBottom: "18px" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          paddingBottom: "6px",
                          borderBottom: "2px solid rgb(29, 78, 216)",
                          marginBottom: "10px",
                        }}
                      >
                        <div
                          style={{
                            width: "26px",
                            height: "26px",
                            borderRadius: "6px",
                            background:
                              "linear-gradient(135deg, rgb(29, 78, 216), rgb(59, 130, 246))",
                            color: "white",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "12px",
                            fontWeight: "800",
                          }}
                        >
                          F
                        </div>
                        <div
                          style={{
                            fontSize: "12px",
                            fontWeight: "700",
                            color: "rgb(30, 58, 95)",
                          }}
                        >
                          شروط السداد
                        </div>
                      </div>
                      <table
                        style={{
                          width: "100%",
                          borderCollapse: "collapse",
                          border: "1px solid rgb(226, 232, 240)",
                        }}
                      >
                        <thead>
                          <tr>
                            <th
                              style={{
                                padding: "5px 8px",
                                textAlign: "right",
                                fontSize: "9px",
                                color: "rgb(55, 65, 81)",
                                backgroundColor: "rgb(241, 245, 249)",
                                borderBottom: "1px solid rgb(203, 213, 225)",
                                fontWeight: "700",
                              }}
                            >
                              الدفعة
                            </th>
                            <th
                              style={{
                                padding: "5px 8px",
                                textAlign: "right",
                                fontSize: "9px",
                                color: "rgb(55, 65, 81)",
                                backgroundColor: "rgb(241, 245, 249)",
                                borderBottom: "1px solid rgb(203, 213, 225)",
                                fontWeight: "700",
                              }}
                            >
                              النسبة
                            </th>
                            <th
                              style={{
                                padding: "5px 8px",
                                textAlign: "left",
                                fontSize: "9px",
                                color: "rgb(55, 65, 81)",
                                backgroundColor: "rgb(241, 245, 249)",
                                borderBottom: "1px solid rgb(203, 213, 225)",
                                fontWeight: "700",
                              }}
                            >
                              المبلغ
                            </th>
                            <th
                              style={{
                                padding: "5px 8px",
                                textAlign: "right",
                                fontSize: "9px",
                                color: "rgb(55, 65, 81)",
                                backgroundColor: "rgb(241, 245, 249)",
                                borderBottom: "1px solid rgb(203, 213, 225)",
                                fontWeight: "700",
                              }}
                            >
                              الاستحقاق
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {(selectedQuote.payments || []).map((p, idx) => (
                            <tr key={idx}>
                              <td
                                style={{
                                  padding: "4px 8px",
                                  fontSize: "10px",
                                  color: "rgb(55, 65, 81)",
                                  borderBottom: "1px solid rgb(241, 245, 249)",
                                }}
                              >
                                الدفعة {idx + 1}
                              </td>
                              <td
                                style={{
                                  padding: "4px 8px",
                                  fontSize: "10px",
                                  color: "rgb(55, 65, 81)",
                                  borderBottom: "1px solid rgb(241, 245, 249)",
                                }}
                              >
                                {p.percentage}%
                              </td>
                              <td
                                style={{
                                  padding: "4px 8px",
                                  fontSize: "10px",
                                  color: "rgb(21, 128, 61)",
                                  borderBottom: "1px solid rgb(241, 245, 249)",
                                  fontWeight: "bold",
                                  textAlign: "left",
                                }}
                              >
                                {Number(p.amount).toLocaleString()} ر.س
                              </td>
                              <td
                                style={{
                                  padding: "4px 8px",
                                  fontSize: "10px",
                                  color: "rgb(55, 65, 81)",
                                  borderBottom: "1px solid rgb(241, 245, 249)",
                                }}
                              >
                                {p.dueCondition}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* التوقيعات */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "16px",
                        marginTop: "30px",
                        marginBottom: "16px",
                      }}
                    >
                      <div
                        style={{
                          border: "2px solid rgb(29, 78, 216)",
                          borderRadius: "12px",
                          overflow: "hidden",
                          backgroundColor: "white",
                        }}
                      >
                        <div
                          style={{
                            background:
                              "linear-gradient(135deg, rgb(29, 78, 216), rgb(59, 130, 246))",
                            padding: "8px 14px",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "11px",
                              fontWeight: "bold",
                              color: "white",
                            }}
                          >
                            توقيع المكتب
                          </span>
                        </div>
                        <div
                          style={{
                            padding: "16px",
                            minHeight: "80px",
                            position: "relative",
                          }}
                        >
                          <div
                            style={{
                              position: "absolute",
                              bottom: "10px",
                              right: "16px",
                              fontSize: "10px",
                              color: "rgb(107, 114, 128)",
                            }}
                          >
                            م. {selectedQuote.createdBy || "الإدارة"}
                          </div>
                        </div>
                      </div>
                      <div
                        style={{
                          border: "2px solid rgb(5, 150, 105)",
                          borderRadius: "12px",
                          overflow: "hidden",
                          backgroundColor: "white",
                        }}
                      >
                        <div
                          style={{
                            background:
                              "linear-gradient(135deg, rgb(5, 150, 105), rgb(16, 185, 129))",
                            padding: "8px 14px",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "11px",
                              fontWeight: "bold",
                              color: "white",
                            }}
                          >
                            توقيع العميل بالموافقة
                          </span>
                        </div>
                        <div
                          style={{
                            padding: "16px",
                            minHeight: "80px",
                            position: "relative",
                          }}
                        >
                          <div
                            style={{
                              position: "absolute",
                              bottom: "10px",
                              right: "16px",
                              fontSize: "10px",
                              color: "rgb(107, 114, 128)",
                            }}
                          >
                            {getClientName(selectedQuote.client)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* الفوتر */}
                    <div
                      style={{
                        marginTop: "24px",
                        paddingTop: "10px",
                        borderTop: "3px solid rgb(29, 78, 216)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-end",
                        fontSize: "9px",
                        color: "rgb(156, 163, 175)",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontSize: "10px",
                            fontWeight: "700",
                            color: "rgb(29, 78, 216)",
                            marginBottom: "2px",
                          }}
                        >
                          مكتب الخبراء المتحدون للاستشارات العقارية
                        </div>
                        حي العليا — طريق الملك فهد — الرياض 12212
                        <br />
                        +966 11 XXX XXXX | info@united-experts.sa
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <div
                          style={{
                            fontFamily: "monospace",
                            fontSize: "10px",
                            fontWeight: "700",
                            color: "rgb(55, 65, 81)",
                            marginBottom: "2px",
                          }}
                        >
                          {selectedQuote.number}
                        </div>
                        <div style={{ fontSize: "8px" }}>صفحة 1/1</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// أيقونات مساعدة مستخرجة من الكود الأصلي
const SaveIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"></path>
    <path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7"></path>
    <path d="M7 3v4a1 1 0 0 0 1 1h7"></path>
  </svg>
);
const GlobeIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="10"></circle>
    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path>
    <path d="M2 12h20"></path>
  </svg>
);
const QrCodeIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="5" height="5" x="3" y="3" rx="1"></rect>
    <rect width="5" height="5" x="16" y="3" rx="1"></rect>
    <rect width="5" height="5" x="3" y="16" rx="1"></rect>
    <path d="M21 16h-3a2 2 0 0 0-2 2v3"></path>
    <path d="M21 21v.01"></path>
    <path d="M12 7v3a2 2 0 0 1-2 2H7"></path>
    <path d="M3 12h.01"></path>
    <path d="M12 3h.01"></path>
    <path d="M12 16v.01"></path>
    <path d="M16 12h1"></path>
    <path d="M21 12v.01"></path>
    <path d="M12 21v-1"></path>
  </svg>
);

export default QuotationsDirectory;
