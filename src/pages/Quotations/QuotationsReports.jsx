import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "../../api/axios";
import {
  ChartColumn,
  Download,
  Search,
  Filter,
  DollarSign,
  ArrowDownRight,
  ArrowUpRight,
  CircleCheckBig,
  Clock,
  TriangleAlert,
  Loader2,
  Printer,
  CreditCard,
  Eye,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { arSA } from "date-fns/locale";
const IconWithText = ({
  icon: Icon,
  text,
  className = "",
  iconClassName = "",
  textClassName = "",
  vertical = false,
}) => {
  return (
    <span
      className={`
        inline-flex min-w-0 items-center justify-center
        ${vertical ? "flex-col gap-0.5" : "gap-1.5"}
        ${className}
      `}
    >
      {Icon && <Icon className={iconClassName || "h-4 w-4 shrink-0"} />}
      {text && (
        <span
          className={
            textClassName ||
            "min-w-0 break-words text-[10px] font-black leading-tight"
          }
        >
          {text}
        </span>
      )}
    </span>
  );
};

// ==========================================
// 1. إعدادات الحالات والألوان
// ==========================================
const STATUS_CONFIG = {
  DRAFT: {
    label: "مسودة",
    color: "bg-[#fbf8f1]0",
    text: "text-[#475569]",
    bar: "bg-[#fbf8f1]0",
    badgeBg: "bg-[#fbf8f1]",
  },
  PENDING_APPROVAL: {
    label: "تحت المراجعة",
    color: "bg-[#123f59]",
    text: "text-[#123f59]",
    bar: "bg-[#123f59]",
    badgeBg: "bg-blue-100",
  },
  REJECTED: {
    label: "راجع بملاحظات",
    color: "bg-orange-600",
    text: "text-orange-700",
    bar: "bg-orange-600",
    badgeBg: "bg-orange-100",
  },
  SENT: {
    label: "بانتظار توقيع المالك",
    color: "bg-amber-600",
    text: "text-amber-700",
    bar: "bg-amber-600",
    badgeBg: "bg-amber-100",
  },
  APPROVED: {
    label: "معتمد — بانتظار الدفع",
    color: "bg-[#123f59]",
    text: "text-[#0f766e]",
    bar: "bg-[#123f59]",
    badgeBg: "bg-emerald-100",
  },
  PARTIALLY_PAID: {
    label: "مسدد جزئياً",
    color: "bg-yellow-500",
    text: "text-yellow-700",
    bar: "bg-yellow-500",
    badgeBg: "bg-yellow-100",
  },
  ACCEPTED: {
    label: "مسدد بالكامل",
    color: "bg-green-600",
    text: "text-green-700",
    bar: "bg-green-600",
    badgeBg: "bg-green-100",
  },
  EXPIRED: {
    label: "منتهي الصلاحية",
    color: "bg-red-700",
    text: "text-red-800",
    bar: "bg-red-700",
    badgeBg: "bg-red-50",
  },
  CANCELLED: {
    label: "ملغى",
    color: "bg-red-600",
    text: "text-red-700",
    bar: "bg-red-600",
    badgeBg: "bg-red-100",
  },
};

const getClientName = (client) => {
  if (!client || !client.name) return "عميل غير محدد";
  if (typeof client.name === "object")
    return client.name.ar || client.name.en || "عميل غير محدد";
  return client.name;
};

// ==========================================
// مكون شارة الحالة (Status Badge)
// ==========================================
const StatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.DRAFT;

  return (
    <span
      className={`inline-flex min-w-0 items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${config.badgeBg} ${config.text}`}
    >
      {config.label}
    </span>
  );
};

// ==========================================
// 2. المكون الرئيسي
// ==========================================
const QuotationsReports = () => {
  const [filterStatus, setFilterStatus] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [activeTab, setActiveTab] = useState("overview"); // overview, status, financial, client, monthly

  // جلب البيانات من السيرفر
  const { data: quotations = [], isLoading } = useQuery({
    queryKey: ["quotations-reports"],
    queryFn: async () => {
      const response = await axios.get("/quotations");
      return response.data.data;
    },
  });

  // ==========================================
  // العمليات الحسابية والفلترة (Data Processing)
  // ==========================================
  const processedData = useMemo(() => {
    // 1. الفلترة
    const filtered = quotations.filter((q) => {
      let matchesStatus = filterStatus === "all" || q.status === filterStatus;
      let matchesDateFrom =
        !dateFrom || new Date(q.issueDate) >= new Date(dateFrom);
      let matchesDateTo = !dateTo || new Date(q.issueDate) <= new Date(dateTo);
      return matchesStatus && matchesDateFrom && matchesDateTo;
    });

    // 2. حساب المؤشرات العامة (KPIs)
    let totalValue = 0;
    let totalCollected = 0;
    let convertedCount = 0;

    // إحصائيات المالية
    let fullyPaidCount = 0;
    let partiallyPaidCount = 0;
    let pendingPaymentCount = 0;

    // تجهيز العروض بالبيانات المالية المكتملة
    const financialQuotes = [];

    filtered.forEach((q) => {
      const quoteTotal = Number(q.total) || 0;
      const collected = Number(q.collectedAmount) || 0;
      const remaining = Math.max(0, quoteTotal - collected);
      const progress =
        quoteTotal > 0 ? Math.round((collected / quoteTotal) * 100) : 0;

      if (!["DRAFT", "CANCELLED", "REJECTED"].includes(q.status)) {
        totalValue += quoteTotal;
        totalCollected += collected;

        if (q.status === "ACCEPTED") fullyPaidCount++;
        else if (q.status === "PARTIALLY_PAID") partiallyPaidCount++;
        else if (["APPROVED", "SENT"].includes(q.status)) pendingPaymentCount++;

        financialQuotes.push({
          ...q,
          quoteTotal,
          collected,
          remaining,
          progress,
        });
      }

      if (["ACCEPTED", "PARTIALLY_PAID", "APPROVED"].includes(q.status)) {
        convertedCount++;
      }
    });

    const totalUncollected = Math.max(0, totalValue - totalCollected);
    const avgValue = filtered.length > 0 ? totalValue / filtered.length : 0;
    const conversionRate =
      filtered.length > 0
        ? Math.round((convertedCount / filtered.length) * 100)
        : 0;

    // 3. التجميع حسب الحالة
    const statusDistribution = {};
    filtered.forEach((q) => {
      if (!statusDistribution[q.status])
        statusDistribution[q.status] = { count: 0, value: 0 };
      statusDistribution[q.status].count++;
      statusDistribution[q.status].value += Number(q.total) || 0;
    });

    // 4. التجميع حسب العميل (Client Analysis)
    const clientDistribution = {};
    financialQuotes.forEach((q) => {
      const cName = getClientName(q.client);
      if (!clientDistribution[cName]) {
        clientDistribution[cName] = { count: 0, total: 0, collected: 0 };
      }
      clientDistribution[cName].count++;
      clientDistribution[cName].total += q.quoteTotal;
      clientDistribution[cName].collected += q.collected;
    });

    const clientArray = Object.entries(clientDistribution)
      .map(([name, data]) => ({
        name,
        ...data,
        remaining: data.total - data.collected,
      }))
      .sort((a, b) => b.total - a.total);

    // 5. التجميع حسب الشهر
    const monthlyDistribution = {};
    financialQuotes.forEach((q) => {
      const monthKey = format(parseISO(q.issueDate), "yyyy-MM");
      if (!monthlyDistribution[monthKey])
        monthlyDistribution[monthKey] = { count: 0, value: 0, collected: 0 };
      monthlyDistribution[monthKey].count++;
      monthlyDistribution[monthKey].value += q.quoteTotal;
      monthlyDistribution[monthKey].collected += q.collected;
    });

    const monthlyArray = Object.keys(monthlyDistribution)
      .map((key) => ({
        month: key,
        ...monthlyDistribution[key],
        remaining:
          monthlyDistribution[key].value - monthlyDistribution[key].collected,
      }))
      .sort((a, b) => b.month.localeCompare(a.month));

    return {
      filtered,
      financialQuotes,
      totalValue,
      totalCollected,
      totalUncollected,
      avgValue,
      conversionRate,
      fullyPaidCount,
      partiallyPaidCount,
      pendingPaymentCount,
      statusDistribution,
      clientArray,
      monthlyArray,
    };
  }, [quotations, filterStatus, dateFrom, dateTo]);
  const formatDualReportDate = (value = new Date()) => {
    const toArabicDigits = (input) =>
      String(input ?? "").replace(/\d/g, (digit) => "٠١٢٣٤٥٦٧٨٩"[Number(digit)]);

    const getDatePart = (formatter, date, type) =>
      formatter.formatToParts(date).find((part) => part.type === type)?.value || "";

    const date = value ? new Date(value) : new Date();

    if (Number.isNaN(date.getTime())) {
      return String(value || "");
    }

    const gregorianFormatter = new Intl.DateTimeFormat("ar-SA-u-ca-gregory", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });

    const hijriFormatter = new Intl.DateTimeFormat("ar-SA-u-ca-islamic-umalqura", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });

    const gregorian = toArabicDigits(
      `${getDatePart(gregorianFormatter, date, "day")}/${getDatePart(
        gregorianFormatter,
        date,
        "month",
      )}/${getDatePart(gregorianFormatter, date, "year")}`,
    );

    const hijri = toArabicDigits(
      `${getDatePart(hijriFormatter, date, "day")}/${getDatePart(
        hijriFormatter,
        date,
        "month",
      )}/${getDatePart(hijriFormatter, date, "year")}`,
    );

    return `ميلادي: ${gregorian} / هجري: ${hijri}`;
  };


  // ==========================================
  // دالة الطباعة (HTML PDF Export)
  // ==========================================
  const handlePrint = () => {
    const printWindow = window.open("", "", "width=900,height=800");

    const clientRows = processedData.clientArray
      .map(
        (c, i) => `
      <tr>
        <td>${i + 1}</td>
        <td style="font-weight:bold">${c.name}</td>
        <td style="font-family:monospace">${c.count}</td>
        <td style="font-family:monospace;color:#1d4ed8">${c.total.toLocaleString()} ر.س</td>
        <td style="font-family:monospace;color:#15803d">${c.collected.toLocaleString()} ر.س</td>
        <td style="font-family:monospace;color:#dc2626">${c.remaining.toLocaleString()} ر.س</td>
      </tr>
    `,
      )
      .join("");

    const htmlContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>تقرير عروض الأسعار</title>
        <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;800&display=swap" rel="stylesheet">
        <style>
          body { font-family: 'Tajawal', sans-serif; background: #fff; padding: 40px; color: #1f2937; }
          .rpt-header { display: flex; justify-content: space-between; border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
          .rpt-logo { width: 170px; height: 64px; object-fit: contain; display: block; }
          .rpt-title-bar { background: #f8fafc; padding: 15px 20px; border-radius: 8px; margin-bottom: 30px; border: 1px solid #e2e8f0; }
          .rpt-kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 30px; }
          .rpt-kpi { border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px; text-align: center; }
          .rpt-kpi .num { font-size: 20px; font-weight: bold; margin-bottom: 5px; font-family: monospace; }
          .rpt-table { width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 30px;}
          .rpt-table th { background: #f1f5f9; padding: 10px; text-align: right; border-bottom: 2px solid #e2e8f0; }
          .rpt-table td { padding: 10px; border-bottom: 1px solid #f1f5f9; }
          .details-footer { position: fixed; bottom: 9mm; left: 12mm; right: 12mm; border-top: 2.5px solid #0f5570; padding-top: 5px; color: #0f5570; font-size: 10.5px; font-weight: 900; line-height: 1.35; }
          .details-footer-inner { display: flex; align-items: flex-start; gap: 8px; direction: ltr; }
          .details-qr { width: 16mm; height: 16mm; flex-shrink: 0; }
          .details-qr img { width: 100%; height: 100%; object-fit: contain; display: block; }
          .details-ar { text-align: right; direction: rtl; white-space: nowrap; }
          .details-en { text-align: left; direction: ltr; white-space: nowrap; margin-top: 2px; }
          @media print { body { padding-bottom: 35mm !important; } }
        </style>
      </head>
      <body>
        <div class="rpt-header">
          <div style="display:flex; align-items:center;">
            <img class="rpt-logo" src="/logo.jpeg" alt="Details Consulting Engineers" />
          </div>
          <div style="text-align:left;font-size:10px;color:#4b5563;">تاريخ الإصدار: ${formatDualReportDate(new Date())}</div>
        </div>

        <div class="rpt-title-bar">
          <h1 style="margin:0 0 5px 0;font-size:20px;color:#1e40af">التقرير الشامل لعروض الأسعار</h1>
          <div style="font-size:12px;color:#64748b">${processedData.filtered.length} عرض مستخرج بناءً على الفلاتر المحددة</div>
        </div>

        <div class="rpt-kpi-grid">
          <div class="rpt-kpi"><div class="num" style="color:#1d4ed8">${processedData.totalValue.toLocaleString()}</div><div style="font-size:11px;color:#64748b">إجمالي المستحقات</div></div>
          <div class="rpt-kpi"><div class="num" style="color:#15803d">${processedData.totalCollected.toLocaleString()}</div><div style="font-size:11px;color:#64748b">إجمالي المحصّل</div></div>
          <div class="rpt-kpi"><div class="num" style="color:#dc2626">${processedData.totalUncollected.toLocaleString()}</div><div style="font-size:11px;color:#64748b">المتبقي غير المحصل</div></div>
          <div class="rpt-kpi"><div class="num" style="color:#8b5cf6">${processedData.conversionRate}%</div><div style="font-size:11px;color:#64748b">معدل التحويل</div></div>
        </div>

        <h3 style="color:#1e40af; border-bottom:1px solid #e2e8f0; padding-bottom:5px;">تحليل العملاء (الأعلى قيمة)</h3>
        <table class="rpt-table">
          <thead><tr><th>#</th><th>العميل</th><th>عدد العروض</th><th>إجمالي القيمة</th><th>المحصّل</th><th>المتبقي</th></tr></thead>
          <tbody>${clientRows}</tbody>
        </table>
        

        
        <div class="details-footer">
          <div class="details-footer-inner">
            <div class="details-qr">
              <img src="/qrcode.png" alt="QR Code" />
            </div>
            <div style="flex:1;">
              <div class="details-ar">📍 حي الملك فهد - الرياض - المملكة العربية السعودية - الرمز البريدي : ١٢٢٧٤ · جوال : ٠٥٩٠٧٢٢٨٢٧ · الرقم الوطني الموحد : ٧٠٥٢٣٠٣٨٢٨</div>
              <div class="details-en">📍 King Fahd Dist - RIYADH - Kingdom of Saudi Arabia -POSTAL CODE :12274 ☎ 0590722827 - N.N: 7052303828 ✉ info@details-consults.sa</div>
            </div>
          </div>
        </div>
<script>setTimeout(() => { window.print(); }, 500);</script>
      </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  // ==========================================
  // Sub-Renders
  // ==========================================

  const renderOverview = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-3 animate-in fade-in">
      <div className="p-3 bg-white rounded-xl border border-[#d8b46a]/25 shadow-[0_8px_22px_rgba(18,63,89,0.06)] text-center">
        <div className="text-[20px] font-bold text-[#123f59] font-mono">
          {processedData.filtered.length}
        </div>
        <div className="text-[10px] text-[#64748b] mt-0.5">إجمالي العروض</div>
      </div>
      <div className="p-3 bg-white rounded-xl border border-[#d8b46a]/25 shadow-[0_8px_22px_rgba(18,63,89,0.06)] text-center">
        <div className="text-[20px] font-bold text-indigo-700 font-mono">
          {processedData.totalValue.toLocaleString()}
        </div>
        <div className="text-[10px] text-[#64748b] mt-0.5">
          القيمة الإجمالية (ر.س)
        </div>
      </div>
      <div className="p-3 bg-white rounded-xl border border-[#d8b46a]/25 shadow-[0_8px_22px_rgba(18,63,89,0.06)] text-center">
        <div className="text-[20px] font-bold text-[#0f766e] font-mono">
          {processedData.totalCollected.toLocaleString()}
        </div>
        <div className="text-[10px] text-[#64748b] mt-0.5">المحصّل (ر.س)</div>
      </div>
      <div className="p-3 bg-white rounded-xl border border-[#d8b46a]/25 shadow-[0_8px_22px_rgba(18,63,89,0.06)] text-center">
        <div className="text-[20px] font-bold text-red-600 font-mono">
          {processedData.totalUncollected.toLocaleString()}
        </div>
        <div className="text-[10px] text-[#64748b] mt-0.5">غير محصّل (ر.س)</div>
      </div>
      <div className="p-3 bg-white rounded-xl border border-[#d8b46a]/25 shadow-[0_8px_22px_rgba(18,63,89,0.06)] text-center">
        <div className="text-[20px] font-bold text-purple-600 font-mono">
          {Math.round(processedData.avgValue).toLocaleString()}
        </div>
        <div className="text-[10px] text-[#64748b] mt-0.5">
          متوسط قيمة العرض
        </div>
      </div>
      <div className="p-3 bg-white rounded-xl border border-[#d8b46a]/25 shadow-[0_8px_22px_rgba(18,63,89,0.06)] text-center">
        <div className="text-[20px] font-bold text-cyan-600 font-mono">
          {processedData.conversionRate}%
        </div>
        <div className="text-[10px] text-[#64748b] mt-0.5">
          معدل التحويل (مقبول)
        </div>
      </div>
    </div>
  );

  const renderStatus = () => (
    <div className="p-3.5 bg-white rounded-xl border border-[#d8b46a]/25 shadow-[0_8px_22px_rgba(18,63,89,0.06)] animate-in fade-in max-w-3xl">
      <div className="text-[13px] font-bold text-[#123f59] mb-3">
        توزيع حسب الحالة
      </div>
      <div className="flex flex-col gap-3">
        {Object.entries(processedData.statusDistribution)
          .sort((a, b) => b[1].count - a[1].count)
          .map(([status, data]) => {
            const config = STATUS_CONFIG[status] || STATUS_CONFIG.DRAFT;
            const percentage =
              Math.round((data.count / processedData.filtered.length) * 100) ||
              0;
            return (
              <div key={status}>
                <div className="flex min-w-0 justify-between text-[11px] mb-1">
                  <span className={`font-bold ${config.text}`}>
                    {config.label}
                  </span>
                  <span className="text-[#64748b]">
                    {data.count} عرض ({percentage}%) —{" "}
                    <strong className="text-[#123f59] font-mono">
                      {data.value.toLocaleString()} ر.س
                    </strong>
                  </span>
                </div>
                <div className="h-2 bg-[#fbf8f1] rounded-full overflow-hidden">
                  <div
                    className={`h-full ${config.bar} transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );

  const renderFinancial = () => (
    <div className="animate-in fade-in">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-3">
        <div className="p-3.5 bg-white rounded-xl border border-[#d8b46a]/25 shadow-[0_8px_22px_rgba(18,63,89,0.06)] flex min-w-0 items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-500 flex min-w-0 items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-[#64748b]">إجمالي المستحقات</div>
            <div className="text-base font-bold text-[#123f59] font-mono">
              {processedData.totalValue.toLocaleString()} ر.س
            </div>
          </div>
        </div>
        <div className="p-3.5 bg-white rounded-xl border border-[#d8b46a]/25 shadow-[0_8px_22px_rgba(18,63,89,0.06)] flex min-w-0 items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-green-50 text-green-600 flex min-w-0 items-center justify-center">
            <ArrowDownRight className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-[#64748b]">إجمالي المحصّل</div>
            <div className="text-base font-bold text-[#123f59] font-mono">
              {processedData.totalCollected.toLocaleString()} ر.س
            </div>
          </div>
        </div>
        <div className="p-3.5 bg-white rounded-xl border border-[#d8b46a]/25 shadow-[0_8px_22px_rgba(18,63,89,0.06)] flex min-w-0 items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-500 flex min-w-0 items-center justify-center">
            <ArrowUpRight className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-[#64748b]">المتبقي</div>
            <div className="text-base font-bold text-[#123f59] font-mono">
              {processedData.totalUncollected.toLocaleString()} ر.س
            </div>
          </div>
        </div>
        <div className="p-3.5 bg-white rounded-xl border border-[#d8b46a]/25 shadow-[0_8px_22px_rgba(18,63,89,0.06)] flex min-w-0 items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-green-50 text-green-600 flex min-w-0 items-center justify-center">
            <CircleCheckBig className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-[#64748b]">مسددة بالكامل</div>
            <div className="text-base font-bold text-[#123f59]">
              {processedData.fullyPaidCount}
            </div>
          </div>
        </div>
        <div className="p-3.5 bg-white rounded-xl border border-[#d8b46a]/25 shadow-[0_8px_22px_rgba(18,63,89,0.06)] flex min-w-0 items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-yellow-50 text-yellow-600 flex min-w-0 items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-[#64748b]">مسددة جزئياً</div>
            <div className="text-base font-bold text-[#123f59]">
              {processedData.partiallyPaidCount}
            </div>
          </div>
        </div>
        <div className="p-3.5 bg-white rounded-xl border border-[#d8b46a]/25 shadow-[0_8px_22px_rgba(18,63,89,0.06)] flex min-w-0 items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex min-w-0 items-center justify-center">
            <TriangleAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-[#64748b]">بانتظار الدفع</div>
            <div className="text-base font-bold text-[#123f59]">
              {processedData.pendingPaymentCount}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#d8b46a]/25 shadow-[0_8px_22px_rgba(18,63,89,0.06)] overflow-hidden">
        <div className="p-3 border-b border-[#d8b46a]/25 bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white flex min-w-0 items-center gap-2">
          <CreditCard className="w-4 h-4 text-[#0f766e]" />
          <span className="text-xs font-bold text-[#475569]">
            تفاصيل الدفعات والتحصيل
          </span>
        </div>
        <div className="overflow-x-auto custom-scrollbar-slim max-h-[400px] custom-scrollbar-slim">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white">
                <th className="p-3 text-[11px] text-[#64748b] font-bold whitespace-nowrap sticky top-0 bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white shadow-[0_8px_22px_rgba(18,63,89,0.06)]">
                  الكود
                </th>
                <th className="p-3 text-[11px] text-[#64748b] font-bold whitespace-nowrap sticky top-0 bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white shadow-[0_8px_22px_rgba(18,63,89,0.06)]">
                  العميل
                </th>
                <th className="p-3 text-[11px] text-[#64748b] font-bold whitespace-nowrap sticky top-0 bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white shadow-[0_8px_22px_rgba(18,63,89,0.06)]">
                  إجمالي العرض
                </th>
                <th className="p-3 text-[11px] text-[#64748b] font-bold whitespace-nowrap sticky top-0 bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white shadow-[0_8px_22px_rgba(18,63,89,0.06)]">
                  المسدد
                </th>
                <th className="p-3 text-[11px] text-[#64748b] font-bold whitespace-nowrap sticky top-0 bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white shadow-[0_8px_22px_rgba(18,63,89,0.06)]">
                  المتبقي
                </th>
                <th className="p-3 text-[11px] text-[#64748b] font-bold whitespace-nowrap sticky top-0 bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white shadow-[0_8px_22px_rgba(18,63,89,0.06)]">
                  نسبة التحصيل
                </th>
                <th className="p-3 text-[11px] text-[#64748b] font-bold whitespace-nowrap sticky top-0 bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white shadow-[0_8px_22px_rgba(18,63,89,0.06)]">
                  الحالة
                </th>
              </tr>
            </thead>
            <tbody>
              {processedData.financialQuotes.map((q) => {
                let progressColor = "bg-blue-500";
                if (q.progress === 100) progressColor = "bg-green-600";
                else if (q.progress > 0) progressColor = "bg-yellow-500";

                return (
                  <tr
                    key={q.id}
                    className="border-b border-[#e8ddc8] hover:bg-[#fbf8f1]/50 transition-colors"
                  >
                    <td className="p-3 text-xs font-bold text-[#123f59] font-mono">
                      {q.number}
                    </td>
                    <td className="p-3 text-xs text-[#475569] font-bold">
                      {getClientName(q.client)}
                    </td>
                    <td className="p-3 text-xs text-[#475569] font-mono">
                      {q.quoteTotal.toLocaleString()}
                    </td>
                    <td className="p-3 text-xs text-green-600 font-mono font-bold">
                      {q.collected.toLocaleString()}
                    </td>
                    <td className="p-3 text-xs text-red-600 font-mono font-bold">
                      {q.remaining.toLocaleString()}
                    </td>
                    <td className="h-full min-h-0 overflow-y-auto overflow-x-hidden custom-scrollbar-slim p-3">
                      <div className="flex min-w-0 items-center gap-2">
                        <div className="flex-1 h-1.5 bg-[#eef7f6] rounded-full overflow-hidden w-16">
                          <div
                            className={`h-full ${progressColor} transition-all duration-500`}
                            style={{ width: `${q.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-[10px] font-bold text-[#64748b] min-w-[32px]">
                          {q.progress}%
                        </span>
                      </div>
                    </td>
                    <td className="h-full min-h-0 overflow-y-auto overflow-x-hidden custom-scrollbar-slim p-3">
                      <StatusBadge status={q.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderClient = () => (
    <div className="p-3.5 bg-white rounded-xl border border-[#d8b46a]/25 shadow-[0_8px_22px_rgba(18,63,89,0.06)] animate-in fade-in">
      <div className="text-[13px] font-bold text-[#123f59] mb-3">
        تحليل حسب العميل
      </div>
      <div className="overflow-x-auto custom-scrollbar-slim">
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white border-b border-[#d8b46a]/25">
              <th className="p-3 text-[11px] text-[#64748b] font-bold">#</th>
              <th className="p-3 text-[11px] text-[#64748b] font-bold">
                العميل
              </th>
              <th className="p-3 text-[11px] text-[#64748b] font-bold">
                عدد العروض
              </th>
              <th className="p-3 text-[11px] text-[#64748b] font-bold">
                إجمالي القيمة
              </th>
              <th className="p-3 text-[11px] text-[#64748b] font-bold">
                المحصّل
              </th>
              <th className="p-3 text-[11px] text-[#64748b] font-bold">
                المتبقي
              </th>
            </tr>
          </thead>
          <tbody>
            {processedData.clientArray.map((c, idx) => (
              <tr
                key={c.name}
                className="border-b border-[#e8ddc8] hover:bg-[#fbf8f1]"
              >
                <td className="p-3 text-[10px] text-[#94a3b8] font-mono">
                  {idx + 1}
                </td>
                <td className="p-3 text-xs font-bold text-[#475569]">
                  {c.name}
                </td>
                <td className="p-3 text-xs text-[#64748b] font-mono">
                  {c.count}
                </td>
                <td className="p-3 text-xs font-bold text-[#123f59] font-mono">
                  {c.total.toLocaleString()} ر.س
                </td>
                <td className="p-3 text-xs font-bold text-green-600 font-mono">
                  {c.collected.toLocaleString()} ر.س
                </td>
                <td className="p-3 text-xs font-bold text-red-600 font-mono">
                  {c.remaining.toLocaleString()} ر.س
                </td>
              </tr>
            ))}
            {processedData.clientArray.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="p-3 text-center text-[#94a3b8] text-xs"
                >
                  لا توجد بيانات متاحة
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderMonthly = () => (
    <div className="p-3.5 bg-white rounded-xl border border-[#d8b46a]/25 shadow-[0_8px_22px_rgba(18,63,89,0.06)] animate-in fade-in max-w-4xl">
      <div className="text-[13px] font-bold text-[#123f59] mb-3">
        التحليل الشهري
      </div>
      <div className="overflow-x-auto custom-scrollbar-slim">
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white border-b border-[#d8b46a]/25">
              <th className="p-3 text-[11px] text-[#64748b] font-bold">
                الشهر
              </th>
              <th className="p-3 text-[11px] text-[#64748b] font-bold">
                العدد
              </th>
              <th className="p-3 text-[11px] text-[#64748b] font-bold">
                القيمة
              </th>
              <th className="p-3 text-[11px] text-[#64748b] font-bold">
                المحصّل
              </th>
              <th className="p-3 text-[11px] text-[#64748b] font-bold">
                المتبقي
              </th>
              <th className="p-3 text-[11px] text-[#64748b] font-bold">
                نسبة التحصيل
              </th>
            </tr>
          </thead>
          <tbody>
            {processedData.monthlyArray.map((m) => {
              const progress =
                m.value > 0 ? Math.round((m.collected / m.value) * 100) : 0;
              return (
                <tr
                  key={m.month}
                  className="border-b border-[#e8ddc8] hover:bg-[#fbf8f1]"
                >
                  <td className="p-3 text-xs font-bold text-[#475569] font-mono">
                    {m.month}
                  </td>
                  <td className="p-3 text-xs text-[#64748b] font-mono">
                    {m.count}
                  </td>
                  <td className="p-3 text-xs font-bold text-[#123f59] font-mono">
                    {m.value.toLocaleString()} ر.س
                  </td>
                  <td className="p-3 text-xs font-bold text-green-600 font-mono">
                    {m.collected.toLocaleString()} ر.س
                  </td>
                  <td className="p-3 text-xs font-bold text-red-600 font-mono">
                    {m.remaining.toLocaleString()} ر.س
                  </td>
                  <td className="h-full min-h-0 overflow-y-auto overflow-x-hidden custom-scrollbar-slim p-3">
                    <div className="flex min-w-0 items-center gap-2">
                      <div className="flex-1 h-1.5 bg-[#eef7f6] rounded-full overflow-hidden w-16">
                        <div
                          className={`h-full bg-blue-500 transition-all duration-500`}
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                      <span className="text-[10px] font-bold text-[#64748b] min-w-[32px]">
                        {progress}%
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  // ==========================================
  // Render App
  // ==========================================
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar-slim bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white" dir="rtl">
      <div className="h-full min-h-0 overflow-y-auto overflow-x-hidden custom-scrollbar-slim p-3.5 md:p-3 font-[Tajawal] max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex min-w-0 justify-between items-center mb-3">
          <div className="text-base font-bold text-[#123f59] flex min-w-0 items-center gap-2">
            <ChartColumn className="w-5 h-5 text-indigo-600" /> تقارير عروض
            الأسعار
            <span className="text-[11px] text-[#64748b] font-normal">
              ({processedData.filtered.length} عرض)
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-blue-50 text-[#123f59] border border-blue-200 rounded-xl text-[11px] font-bold cursor-pointer flex min-w-0 items-center gap-1.5 hover:bg-blue-100 transition-colors"
            >
              <IconWithText icon={Printer} text="طباعة تقرير احترافي" iconClassName="w-3.5 h-3.5" />
            </button>
            <button className="px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-xl text-[11px] font-bold cursor-pointer flex min-w-0 items-center gap-1.5 hover:bg-green-100 transition-colors">
              <IconWithText icon={Download} text="Excel" iconClassName="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-3 items-end flex-wrap p-3 bg-white rounded-xl border border-[#d8b46a]/25 shadow-[0_8px_22px_rgba(18,63,89,0.06)]">
          <div>
            <label className="text-[10px] font-bold text-[#64748b] block mb-1">
              الحالة
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-2 py-1.5 border border-[#d8b46a]/25 rounded-xl text-[11px] outline-none min-w-[150px]"
            >
              <option value="all">جميع الحالات</option>
              {Object.keys(STATUS_CONFIG).map((key) => (
                <option key={key} value={key}>
                  {STATUS_CONFIG[key].label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold text-[#64748b] block mb-1">
              من تاريخ
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-2 py-1 border border-[#d8b46a]/25 rounded-xl text-[11px] outline-none"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-[#64748b] block mb-1">
              إلى تاريخ
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-2 py-1 border border-[#d8b46a]/25 rounded-xl text-[11px] outline-none"
            />
          </div>
        </div>

        {/* Sub Tabs */}
        <div className="flex gap-1 mb-3 border-b-2 border-[#d8b46a]/25">
          {[
            { id: "overview", label: "نظرة عامة" },
            { id: "status", label: "حسب الحالة" },
            { id: "financial", label: "مالي" },
            { id: "client", label: "حسب العميل" },
            { id: "monthly", label: "شهري" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-[11px] font-bold transition-all border-x-2 border-t-2 rounded-t-lg -mb-[2px] ${activeTab === tab.id ? "bg-indigo-600 text-white border-indigo-600" : "bg-transparent text-[#64748b] border-transparent hover:text-[#475569]"}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dynamic Content */}
        {activeTab === "overview" && renderOverview()}
        {activeTab === "status" && renderStatus()}
        {activeTab === "financial" && renderFinancial()}
        {activeTab === "client" && renderClient()}
        {activeTab === "monthly" && renderMonthly()}
      </div>
    </div>
  );
};

export default QuotationsReports;
