import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
} from "lucide-react";
import { format } from "date-fns";
import { arSA } from "date-fns/locale";

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

// دالة مساعدة لاستخراج اسم العميل بشكل صحيح (لتجنب خطأ Object React Child)
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
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [selectedQuoteId, setSelectedQuoteId] = useState(null);

  // 1. جلب البيانات من السيرفر
  const { data: quotationsData, isLoading } = useQuery({
    queryKey: ["quotations-list"],
    queryFn: async () => {
      const response = await axios.get("/quotations");
      return response.data.data;
    },
  });

  // 2. فلترة البيانات محلياً
  const filteredData = (quotationsData || []).filter((q) => {
    const matchesSearch =
      q.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (getClientName(q.client) || "").includes(searchTerm) ||
      (q.ownership?.code || "").includes(searchTerm);

    const matchesStatus = filterStatus === "ALL" || q.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  // 3. العرض المحدد في الشريط الجانبي (Side Panel)
  const selectedQuote = selectedQuoteId
    ? filteredData.find((q) => q.id === selectedQuoteId)
    : null;

  // 4. المجاميع السفلية
  const totalAmount = filteredData.reduce((sum, q) => sum + Number(q.total), 0);
  const totalPaid = 0; // سيتم تحديثه لاحقاً عند ربط الدفعات الفعلية
  const totalRemaining = totalAmount - totalPaid;

  const getStatusCount = (status) =>
    (quotationsData || []).filter((q) => q.status === status).length;

  return (
    <div className="flex h-full bg-slate-50 font-sans" dir="rtl">
      {/* الجزء الأيمن (الجدول الرئيسي) */}
      <div
        className={`flex-1 overflow-y-auto p-4 md:p-5 transition-all ${selectedQuote ? "w-[62%] max-w-[62%]" : "w-full"}`}
      >
        {/* الهيدر والفلاتر */}
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
            placeholder="بحث ذكي: اسم العميل، الكود، آخر 4 أرقام، رقم الملكية، المعاملة..."
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
            الكل ({quotationsData?.length || 0})
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

        {/* الجدول */}
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
                      <div className="flex items-center gap-1 cursor-pointer">
                        رقم العرض{" "}
                        <ArrowUpDown className="w-2.5 h-2.5 opacity-30" />
                      </div>
                    </th>
                    <th className="p-2 text-[10px] text-slate-500 font-bold">
                      <div className="flex items-center gap-1 cursor-pointer">
                        التاريخ <ArrowUpDown className="w-2.5 h-2.5" />
                      </div>
                    </th>
                    <th className="p-2 text-[10px] text-slate-500 font-bold">
                      <div className="flex items-center gap-1 cursor-pointer">
                        العميل{" "}
                        <ArrowUpDown className="w-2.5 h-2.5 opacity-30" />
                      </div>
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
                            className="p-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                            title="تفاصيل"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            className="p-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                            title="طباعة"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                          <button
                            className="p-1 bg-cyan-50 text-cyan-700 rounded hover:bg-cyan-100 transition-colors"
                            title="تحميل PDF"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
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

          <div className="flex gap-4 p-3 bg-slate-50 border-t-2 border-slate-200 text-[11px] text-slate-500 flex-wrap">
            <span>
              الإجمالي (النشط):{" "}
              <strong className="text-blue-700 text-xs font-mono">
                {totalAmount.toLocaleString()} ر.س
              </strong>
            </span>
            <span>
              المحصّل:{" "}
              <strong className="text-emerald-700 text-xs font-mono">
                {totalPaid.toLocaleString()} ر.س
              </strong>
            </span>
            <span>
              المتبقي:{" "}
              <strong className="text-red-600 text-xs font-mono">
                {totalRemaining.toLocaleString()} ر.س
              </strong>
            </span>
          </div>
        </div>
      </div>

      {/* الجزء الأيسر (المعاينة السريعة / Side Panel) */}
      {selectedQuote && (
        <div className="hidden lg:flex flex-col w-[38%] border-r border-slate-200 bg-white p-4 h-full overflow-y-auto custom-scrollbar shadow-[-5px_0_20px_rgba(0,0,0,0.03)] animate-in slide-in-from-left-4 duration-300">
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
              <div className="text-[9px] text-slate-500 flex justify-between">
                العميل{" "}
                <Copy className="w-2.5 h-2.5 cursor-pointer hover:text-blue-500" />
              </div>
              <div className="text-[11px] font-bold text-slate-800 truncate">
                {getClientName(selectedQuote.client)}
              </div>
            </div>
            <div className="p-2 bg-slate-50 rounded-lg">
              <div className="text-[9px] text-slate-500 flex justify-between">
                الملكية{" "}
                <ExternalLink className="w-2.5 h-2.5 cursor-pointer text-blue-500 hover:text-blue-700" />
              </div>
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

          <div className="mb-4">
            <div className="text-[11px] font-bold text-slate-700 mb-2">
              الدفعات المجدولة ({selectedQuote.payments?.length || 0}):
            </div>
            <div className="space-y-1.5">
              {(selectedQuote.payments || []).map((p, idx) => (
                <div
                  key={p.id}
                  className="flex justify-between items-center p-2 text-[10px] border border-slate-100 rounded-md bg-slate-50"
                >
                  <span className="font-bold text-slate-700">
                    دفعة {idx + 1} ({p.percentage}%)
                  </span>
                  <span className="text-slate-500">{p.dueCondition}</span>
                  <span className="font-bold font-mono text-emerald-700">
                    {Number(p.amount).toLocaleString()} ر.س
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1"></div>

          <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-2 gap-2">
            <button className="py-2 bg-blue-600 text-white rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 hover:bg-blue-700">
              <Printer className="w-3.5 h-3.5" /> طباعة احترافية
            </button>
            <button className="py-2 bg-slate-100 text-slate-700 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 hover:bg-slate-200">
              <Send className="w-3.5 h-3.5" /> إرسال للعميل
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuotationsDirectory;
