import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../api/axios";
import { toast } from "sonner";
import {
  MapPin,
  Search,
  LayoutGrid,
  List,
  Plus,
  Building2,
  Edit,
  Trash2,
  Globe,
  Link2,
  Download,
  Printer,
  Loader2,
  X,
  FileText,
  Map,
  Satellite,
  CircleCheck,
  Route,
  Eye,
  ShieldCheck,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

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
        inline-flex items-center justify-center
        ${vertical ? "flex-col gap-0.5" : "gap-1.5"}
        ${className}
      `}
    >
      {Icon && <Icon className={iconClassName || "h-3.5 w-3.5 shrink-0"} />}

      {text && (
        <span className={textClassName || "text-[10px] font-black leading-none"}>
          {text}
        </span>
      )}
    </span>
  );
};


const printRiyadhNode = (selector, title = "Riyadh Report") => {
  const node = document.querySelector(selector);

  if (!node) {
    window.print();
    return;
  }

  const styles = Array.from(
    document.querySelectorAll('link[rel="stylesheet"], style'),
  )
    .map((item) => item.outerHTML)
    .join("\n");

  const popup = window.open("", "_blank", "width=1200,height=900");

  if (!popup) {
    window.print();
    return;
  }

  popup.document.open();
  popup.document.write(`
    <!doctype html>
    <html lang="ar" dir="rtl">
      <head>
        <meta charset="utf-8" />
        <title>${title}</title>
        ${styles}
        <style>
          @page {
            size: A4 landscape;
            margin: 8mm;
          }

          * {
            box-sizing: border-box;
          }

          html,
          body {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            color: #123f59 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            font-family: Tajawal, Arial, sans-serif !important;
          }

          body {
            width: 100% !important;
            overflow: visible !important;
          }

          #print-root {
            width: 100% !important;
            max-width: 100% !important;
            min-height: auto !important;
            overflow: visible !important;
            background: #ffffff !important;
          }

          #print-root * {
            max-width: 100% !important;
          }

          #print-root .districts-print-report {
            display: block !important;
            width: 100% !important;
            direction: rtl !important;
            background: #ffffff !important;
            color: #123f59 !important;
          }

          #print-root .districts-print-header {
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
            gap: 12px !important;
            border-bottom: 2px solid #123f59 !important;
            padding-bottom: 10px !important;
            margin-bottom: 12px !important;
          }

          #print-root .districts-print-title {
            font-size: 18px !important;
            font-weight: 900 !important;
            color: #123f59 !important;
            margin: 0 !important;
          }

          #print-root .districts-print-subtitle {
            font-size: 11px !important;
            font-weight: 700 !important;
            color: #64748b !important;
            margin-top: 4px !important;
          }

          #print-root .districts-print-meta {
            display: grid !important;
            grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
            gap: 8px !important;
            margin: 10px 0 12px !important;
          }

          #print-root .districts-print-card {
            border: 1px solid #d8b46a !important;
            border-radius: 10px !important;
            padding: 8px !important;
            background: #fbf8f1 !important;
            page-break-inside: avoid !important;
          }

          #print-root .districts-print-card-label {
            display: block !important;
            font-size: 10px !important;
            font-weight: 800 !important;
            color: #64748b !important;
            margin-bottom: 4px !important;
          }

          #print-root .districts-print-card-value {
            display: block !important;
            font-size: 16px !important;
            font-weight: 900 !important;
            color: #123f59 !important;
          }

          #print-root .districts-print-table {
            width: 100% !important;
            border-collapse: collapse !important;
            font-size: 10px !important;
          }

          #print-root .districts-print-table th {
            background: #123f59 !important;
            color: #ffffff !important;
            font-weight: 900 !important;
            border: 1px solid #123f59 !important;
            padding: 7px 6px !important;
            text-align: right !important;
          }

          #print-root .districts-print-table td {
            border: 1px solid #d8b46a !important;
            padding: 6px !important;
            vertical-align: top !important;
            color: #123f59 !important;
            text-align: right !important;
          }

          #print-root .districts-print-table tr:nth-child(even) td {
            background: #fbf8f1 !important;
          }

          #print-root .districts-print-footer {
            margin-top: 12px !important;
            padding-top: 8px !important;
            border-top: 1px solid #d8b46a !important;
            font-size: 9px !important;
            color: #64748b !important;
            text-align: center !important;
          }

          [data-no-print="true"],
          .no-print,
          .print-hidden,
          button,
          select,
          input,
          textarea {
            display: none !important;
          }

          .hidden {
            display: block !important;
          }

          .print\\:hidden {
            display: none !important;
          }

          .print\\:block {
            display: block !important;
          }

          .overflow-hidden,
          .overflow-y-auto,
          .overflow-x-auto,
          .overflow-auto,
          .custom-scrollbar-slim {
            overflow: visible !important;
          }

          .fixed,
          .sticky {
            position: static !important;
          }

          .shadow-xl,
          .shadow-lg,
          .shadow-md,
          .shadow-sm,
          [class*="shadow-"] {
            box-shadow: none !important;
          }

          .grid {
            page-break-inside: avoid;
          }

          table {
            width: 100% !important;
            border-collapse: collapse !important;
            page-break-inside: auto;
          }

          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }

          th,
          td {
            border-color: #d8b46a !important;
            padding: 6px !important;
          }

          svg {
            max-width: 100% !important;
          }
        </style>
      </head>

      <body>
        <main id="print-root">${node.outerHTML}</main>
      </body>
    </html>
  `);
  popup.document.close();

  setTimeout(() => {
    popup.focus();
    popup.print();
    setTimeout(() => popup.close(), 600);
  }, 350);
};

const escapeCsvValue = (value) => {
  const text = String(value ?? "");
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
};

const buildCsvContent = (headers, rows) => {
  return (
    "\uFEFF" +
    [
      headers.map(escapeCsvValue).join(","),
      ...rows.map((row) => row.map(escapeCsvValue).join(",")),
    ].join("\n")
  );
};

const getExportDateStamp = () => new Date().toISOString().slice(0, 10);


const emptyDistrictData = {
  id: null,
  name: "",
  sectorId: "",
  officialLink: "",
  mapImage: "",
  satelliteImage: "",
};

const emptyStreetData = {
  id: null,
  name: "",
  width: "",
  length: "",
  lanes: "2",
  type: "normal",
  lighting: true,
  sidewalks: true,
};

const Screen41_Districts = () => {
  const queryClient = useQueryClient();

  const [viewMode, setViewMode] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [sectorFilter, setSectorFilter] = useState("all");

  const [modal, setModal] = useState({
    isOpen: false,
    mode: "create",
    data: emptyDistrictData,
  });

  const [streetsModal, setStreetsModal] = useState({
    isOpen: false,
    district: null,
  });

  const [editStreetModal, setEditStreetModal] = useState({
    isOpen: false,
    data: emptyStreetData,
  });

  const { data: districts = [], isLoading: loadingDistricts } = useQuery({
    queryKey: ["districts-list"],
    queryFn: async () => {
      const response = await api.get("/riyadh-streets/tree");

      let allDistricts = [];

      response.data.forEach((sector) => {
        if (sector.neighborhoods) {
          const mappedNeighborhoods = sector.neighborhoods.map((neighborhood) => ({
            ...neighborhood,
            sector: {
              id: sector.id,
              name: sector.name,
            },
            sectorId: sector.id,
            _count: {
              streets: neighborhood.streets?.length || 0,
              plans: 0,
            },
          }));

          allDistricts = [...allDistricts, ...mappedNeighborhoods];
        }
      });

      return allDistricts;
    },
  });

  const { data: sectors = [], isLoading: loadingSectors } = useQuery({
    queryKey: ["sectors-list"],
    queryFn: async () => {
      const response = await api.get("/riyadh-streets/sectors");
      return response.data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (payload) => {
      if (modal.mode === "create") {
        return await api.post("/riyadh-streets/districts", payload);
      }

      return await api.put(`/riyadh-streets/districts/${payload.id}`, payload);
    },
    onSuccess: () => {
      toast.success(
        modal.mode === "create"
          ? "تم تسجيل الحي بنجاح"
          : "تم تحديث بيانات الحي",
      );

      queryClient.invalidateQueries({ queryKey: ["districts-list"] });
      queryClient.invalidateQueries({ queryKey: ["riyadh-tree"] });

      setModal((prev) => ({
        ...prev,
        isOpen: false,
      }));
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "حدث خطأ في الحفظ");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => await api.delete(`/riyadh-streets/districts/${id}`),
    onSuccess: () => {
      toast.success("تم حذف الحي بنجاح");

      queryClient.invalidateQueries({ queryKey: ["districts-list"] });
      queryClient.invalidateQueries({ queryKey: ["riyadh-tree"] });
    },
    onError: (err) => {
      toast.error(
        err.response?.data?.message || "فشل الحذف، الحي مرتبط ببيانات أخرى.",
      );
    },
  });

  const streetUpdateMutation = useMutation({
    mutationFn: async (payload) =>
      await api.put(`/riyadh-streets/${payload.id}`, payload),
    onSuccess: () => {
      toast.success("تم تحديث الشارع بنجاح");

      queryClient.invalidateQueries({ queryKey: ["districts-list"] });
      queryClient.invalidateQueries({ queryKey: ["riyadh-tree"] });

      setEditStreetModal({
        isOpen: false,
        data: emptyStreetData,
      });

      setStreetsModal({
        isOpen: false,
        district: null,
      });
    },
    onError: () => {
      toast.error("حدث خطأ في تحديث الشارع");
    },
  });

  const streetDeleteMutation = useMutation({
    mutationFn: async (id) => await api.delete(`/riyadh-streets/${id}`),
    onSuccess: () => {
      toast.success("تم حذف الشارع بنجاح");

      queryClient.invalidateQueries({ queryKey: ["districts-list"] });
      queryClient.invalidateQueries({ queryKey: ["riyadh-tree"] });

      setStreetsModal({
        isOpen: false,
        district: null,
      });
    },
    onError: () => {
      toast.error("فشل حذف الشارع");
    },
  });

  const handleDelete = (id, name) => {
    const confirmed = window.confirm(`هل أنت متأكد من رغبتك في حذف (حي ${name})؟`);

    if (confirmed) {
      deleteMutation.mutate(id);
    }
  };

  const handleDeleteStreet = (id, name) => {
    const confirmed = window.confirm(
      `هل أنت متأكد من حذف الشارع (${name}) نهائياً؟`,
    );

    if (confirmed) {
      streetDeleteMutation.mutate(id);
    }
  };

  const filteredDistricts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return districts.filter((district) => {
      const name = String(district.name || "").toLowerCase();
      const code = String(district.code || "").toLowerCase();

      const matchesSearch =
        !query || name.includes(query) || code.includes(query);

      const matchesSector =
        sectorFilter === "all" || String(district.sectorId) === String(sectorFilter);

      return matchesSearch && matchesSector;
    });
  }, [districts, searchQuery, sectorFilter]);

  const kpis = useMemo(() => {
    const totalStreets = filteredDistricts.reduce(
      (acc, curr) => acc + (curr._count?.streets || 0),
      0,
    );

    const linkedMaps = filteredDistricts.filter(
      (district) => district.officialLink,
    ).length;

    return {
      totalDistricts: filteredDistricts.length,
      totalStreets,
      coverage:
        filteredDistricts.length > 0
          ? Math.round((linkedMaps / filteredDistricts.length) * 100)
          : 0,
    };
  }, [filteredDistricts]);

  const getSectorBadge = (sectorName = "") => {
    if (sectorName.includes("وسط")) {
      return {
        bg: "bg-rose-50",
        text: "text-rose-700",
        border: "border-rose-200",
        gradient: "from-rose-50 via-white to-white",
      };
    }

    if (sectorName.includes("شمال")) {
      return {
        bg: "bg-[#eef7f6]",
        text: "text-[#15536f]",
        border: "border-[#d8b46a]/35",
        gradient: "from-[#eef7f6] via-white to-white",
      };
    }

    if (sectorName.includes("جنوب")) {
      return {
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        border: "border-emerald-200",
        gradient: "from-emerald-50 via-white to-white",
      };
    }

    if (sectorName.includes("شرق")) {
      return {
        bg: "bg-orange-50",
        text: "text-orange-700",
        border: "border-orange-200",
        gradient: "from-orange-50 via-white to-white",
      };
    }

    if (sectorName.includes("غرب")) {
      return {
        bg: "bg-[#eef7f6]",
        text: "text-[#15536f]",
        border: "border-[#d8b46a]/35",
        gradient: "from-[#eef7f6] via-white to-white",
      };
    }

    return {
      bg: "bg-[#eef7f6]",
      text: "text-[#123f59]",
      border: "border-[#d8b46a]/35",
      gradient: "from-[#eef7f6] via-white to-[#fbf8f1]",
    };
  };

  const openCreateModal = () => {
    setModal({
      isOpen: true,
      mode: "create",
      data: emptyDistrictData,
    });
  };

  const openEditModal = (district) => {
    setModal({
      isOpen: true,
      mode: "edit",
      data: district,
    });
  };

  const handlePrint = () => {
    const escapeHtml = (value) =>
      String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

    const rowsHtml = filteredDistricts.length
      ? filteredDistricts
          .map(
            (district, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>حي ${escapeHtml(district.name || "غير محدد")}</td>
                <td>${escapeHtml(district.code || "N/A")}</td>
                <td>قطاع ${escapeHtml(district.sector?.name || "غير محدد")}</td>
                <td>${escapeHtml(district._count?.streets || 0)}</td>
                <td>${escapeHtml(district.officialLink || "غير مرتبط")}</td>
              </tr>
            `,
          )
          .join("")
      : `<tr><td colspan="6" class="empty">لا توجد أحياء مطابقة للفلترة الحالية.</td></tr>`;

    const reportHtml = `
      <!doctype html>
      <html lang="ar" dir="rtl">
        <head>
          <meta charset="utf-8" />
          <title>تقرير الأحياء السكنية</title>
          <style>
            @page {
              size: A4 landscape;
              margin: 8mm;
            }

            * {
              box-sizing: border-box;
            }

            html,
            body {
              margin: 0;
              padding: 0;
              background: #ffffff;
              color: #123f59;
              font-family: Tajawal, Arial, sans-serif;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            body {
              direction: rtl;
            }

            .report {
              width: 100%;
              padding: 0;
            }

            .header {
              display: flex;
              align-items: center;
              justify-content: space-between;
              gap: 16px;
              border-bottom: 2px solid #123f59;
              padding-bottom: 10px;
              margin-bottom: 12px;
            }

            .title {
              margin: 0;
              font-size: 20px;
              font-weight: 900;
              color: #123f59;
            }

            .subtitle {
              margin: 4px 0 0;
              font-size: 11px;
              font-weight: 700;
              color: #64748b;
            }

            .brand {
              text-align: left;
              font-size: 10px;
              font-weight: 700;
              color: #64748b;
              line-height: 1.6;
              white-space: nowrap;
            }

            .meta {
              display: grid;
              grid-template-columns: repeat(3, minmax(0, 1fr));
              gap: 8px;
              margin: 10px 0 12px;
            }

            .card {
              border: 1px solid #d8b46a;
              border-radius: 10px;
              padding: 8px;
              background: #fbf8f1;
              page-break-inside: avoid;
            }

            .card-label {
              display: block;
              font-size: 10px;
              font-weight: 800;
              color: #64748b;
              margin-bottom: 4px;
            }

            .card-value {
              display: block;
              font-size: 17px;
              font-weight: 900;
              color: #123f59;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              font-size: 10px;
            }

            th {
              background: #123f59;
              color: #ffffff;
              font-weight: 900;
              border: 1px solid #123f59;
              padding: 7px 6px;
              text-align: right;
            }

            td {
              border: 1px solid #d8b46a;
              padding: 6px;
              vertical-align: top;
              color: #123f59;
              text-align: right;
            }

            tr:nth-child(even) td {
              background: #fbf8f1;
            }

            .empty {
              text-align: center;
              padding: 18px;
              color: #64748b;
              font-weight: 800;
            }

            .footer {
              margin-top: 12px;
              padding-top: 8px;
              border-top: 1px solid #d8b46a;
              font-size: 9px;
              color: #64748b;
              text-align: center;
            }
          </style>
        </head>

        <body>
          <main class="report">
            <section class="header">
              <div>
                <h1 class="title">تقرير الأحياء السكنية</h1>
                <p class="subtitle">
                  قائمة الأحياء المعتمدة حسب الفلترة الحالية مع القطاع وعدد الشوارع والروابط.
                </p>
              </div>

              <div class="brand">
                <div>Details WMS</div>
                <div>${new Date().toLocaleDateString("fr-FR")}</div>
              </div>
            </section>

            <section class="meta">
              <div class="card">
                <span class="card-label">عدد الأحياء</span>
                <span class="card-value">${filteredDistricts.length}</span>
              </div>

              <div class="card">
                <span class="card-label">الشوارع المشمولة</span>
                <span class="card-value">${kpis.totalStreets}</span>
              </div>

              <div class="card">
                <span class="card-label">تغطية الروابط</span>
                <span class="card-value">${kpis.coverage}%</span>
              </div>
            </section>

            <table>
              <thead>
                <tr>
                  <th style="width: 42px">م</th>
                  <th>اسم الحي</th>
                  <th>الكود</th>
                  <th>القطاع</th>
                  <th style="width: 90px">عدد الشوارع</th>
                  <th>الرابط الرسمي</th>
                </tr>
              </thead>
              <tbody>${rowsHtml}</tbody>
            </table>

            <div class="footer">
              تم إنشاء هذا التقرير من نظام Details WMS — إدارة الأحياء السكنية.
            </div>
          </main>
        </body>
      </html>
    `;

    const popup = window.open("", "_blank", "width=1200,height=900");

    if (!popup) {
      toast.error("المتصفح منع فتح نافذة الطباعة");
      return;
    }

    popup.document.open();
    popup.document.write(reportHtml);
    popup.document.close();

    setTimeout(() => {
      popup.focus();
      popup.print();
    }, 450);
  };

  const handleDownloadCSV = () => {
    const headers = [
      "اسم الحي",
      "الكود الداخلي",
      "القطاع",
      "عدد الشوارع",
      "رابط الخريطة الرسمية",
    ];

    const rows = filteredDistricts.map((district) => [
      district.name || "",
      district.code || "N/A",
      district.sector?.name || "غير محدد",
      district._count?.streets || 0,
      district.officialLink || "غير متوفر",
    ]);

    const csvContent = buildCsvContent(headers, rows);

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Riyadh_Districts_Report_${getExportDateStamp()}.csv`;
    link.click();

    toast.success("تم تصدير التقرير بنجاح");
  };

  if (loadingDistricts || loadingSectors) {
    return (
      <div className="flex h-full items-center justify-center bg-[#eef7f6]">
        <div className="flex flex-col items-center gap-3">
          <div className="inline-flex h-8 shrink-0 items-center justify-center gap-1.5 px-2.5 rounded-2xl border border-[#d8b46a]/40 bg-white shadow-[0_8px_22px_rgba(18,63,89,0.06)]">
            <Loader2 className="h-6 w-6 animate-spin text-[#123f59]" />
          </div>

          <p className="text-xs font-black text-[#123f59]">
            جاري تحميل بيانات الأحياء...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="
        flex h-full w-full max-w-full min-w-0 flex-col overflow-hidden overflow-x-hidden
        bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white
        font-[Tajawal] text-right text-[#123f59]
      "
      dir="rtl"
    
      style={{
        width: "min(100%, calc(100vw - 285px))",
        maxWidth: "min(100%, calc(100vw - 285px))",
        marginInlineStart: "auto",
        marginInlineEnd: 0,
      }}
    >

      <div className="flex h-full min-h-0 w-full max-w-full min-w-0 flex-col overflow-hidden overflow-x-hidden print:hidden">
        {/* Header Compact */}
        <header
          className="
            relative z-10 w-full max-w-full shrink-0 overflow-hidden
            border-b border-[#d8b46a]/25
            bg-gradient-to-l from-[#06111d] via-[#123f59] to-[#0e7490]
            px-4 py-3 text-white
            shadow-[0_10px_24px_rgba(18,63,89,0.16)]
          "
        >
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute right-[-60px] top-[-70px] h-36 w-36 rounded-full bg-[#e2bf74]/16 blur-3xl" />
            <div className="absolute left-[-70px] bottom-[-80px] h-44 w-44 rounded-full bg-emerald-400/16 blur-3xl" />
          </div>

          <div className="relative z-10 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <div
                className="
                  inline-flex h-8 shrink-0 items-center justify-center gap-1.5 px-2.5
                  rounded-2xl border border-[#e2bf74]/35
                  bg-white/10 text-[#e2bf74]
                  shadow-[0_8px_18px_rgba(18,63,89,0.05)] backdrop-blur-xl
                "
              >
                <IconWithText
                  icon={MapPin}
                  text="أحياء"
                  vertical
                  iconClassName="h-5 w-5"
                  textClassName="text-[7px] font-black leading-none"
                />
              </div>

              <div className="min-w-0">
                <h1 className="truncate text-sm font-black">
                  إدارة الأحياء السكنية
                </h1>

                <p className="mt-0.5 truncate text-[11px] font-bold text-white/60">
                  سجل الأحياء المعتمدة، الخرائط، الشوارع، والتوزيع الجغرافي.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <HeaderActionButton
                icon={Download}
                label="تصدير"
                onClick={handleDownloadCSV}
                variant="ghost"
              />

              <HeaderActionButton
                icon={Printer}
                label="طباعة"
                onClick={handlePrint}
                variant="ghost"
              />

              <div className="mx-1 hidden h-7 w-px bg-white/15 sm:block" />

              <HeaderActionButton
                icon={Plus}
                label="حي جديد"
                onClick={openCreateModal}
                variant="primary"
              />
            </div>
          </div>
        </header>

        {/* Main Content Compact */}
        <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-4 custom-scrollbar-slim">
          <div className="space-y-2.5">
            {/* KPIs Compact */}
            <section className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <KpiCard
                icon={MapPin}
                label="الأحياء حسب الفلتر"
                value={kpis.totalDistricts}
                tone="emerald"
              />

              <KpiCard
                icon={Route}
                label="الشوارع المشمولة"
                value={kpis.totalStreets}
                tone="amber"
              />

              <KpiCard
                icon={Globe}
                label="تغطية الروابط"
                value={`${kpis.coverage}%`}
                tone="blue"
              />
            </section>

            {/* Toolbar Compact */}
            <section
              className="
                rounded-[16px] border border-[#d8b46a]/25
                bg-white/85 p-3
                shadow-[0_8px_22px_rgba(18,63,89,0.06)]
                backdrop-blur-xl
              "
            >
              <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex w-full flex-col gap-2 xl:flex-row xl:items-center">
                  <div className="relative w-full xl:max-w-sm">
                    <Search className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#c5983c]" />

                    <input
                      type="text"
                      placeholder="بحث باسم الحي أو الكود..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="
                        h-10 w-full rounded-2xl border border-[#d8b46a]/25
                        bg-[#fbf8f1]/80 pr-10 pl-4 text-xs font-bold
                        text-[#123f59] outline-none transition-all
                        placeholder:text-[#94a3b8]
                        focus:border-[#c5983c]/70 focus:bg-white
                        focus:ring-4 focus:ring-[#c5983c]/10
                      "
                    />
                  </div>

                  <select
                    value={sectorFilter}
                    onChange={(e) => setSectorFilter(e.target.value)}
                    className="
                      h-10 min-w-[180px] rounded-2xl border border-[#d8b46a]/25
                      bg-[#fbf8f1]/80 px-3 text-xs font-black
                      text-[#123f59] outline-none transition-all
                      focus:border-[#c5983c]/70 focus:bg-white
                      focus:ring-4 focus:ring-[#c5983c]/10
                    "
                  >
                    <option value="all">جميع القطاعات</option>

                    {sectors.map((sector) => (
                      <option key={sector.id} value={sector.id}>
                        قطاع {sector.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <div
                    className="
                      rounded-xl border border-[#d8b46a]/25
                      bg-[#fbf8f1] px-3 py-2
                      text-[11px] font-black text-[#64748b]
                    "
                  >
                    النتائج:{" "}
                    <span className="font-black text-[#123f59]">
                      {filteredDistricts.length}
                    </span>
                  </div>

                  <div className="flex items-center rounded-xl border border-[#d8b46a]/25 bg-[#fbf8f1] p-1">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`
                        inline-flex h-8 shrink-0 items-center justify-center gap-1.5 px-2.5 rounded-lg transition-all
                        ${
                          viewMode === "grid"
                            ? "bg-[#123f59] text-[#e2bf74] shadow-[0_8px_18px_rgba(18,63,89,0.05)]"
                            : "text-[#64748b] hover:bg-white hover:text-[#123f59]"
                        }
                      `}
                      type="button"
                      title="عرض البطاقات"
                    >
                      <IconWithText
                        icon={LayoutGrid}
                        text="بطاقات"
                        vertical
                        iconClassName="h-4 w-4"
                        textClassName="text-[6px] font-black leading-none"
                      />
                    </button>

                    <button
                      onClick={() => setViewMode("table")}
                      className={`
                        inline-flex h-8 shrink-0 items-center justify-center gap-1.5 px-2.5 rounded-lg transition-all
                        ${
                          viewMode === "table"
                            ? "bg-[#123f59] text-[#e2bf74] shadow-[0_8px_18px_rgba(18,63,89,0.05)]"
                            : "text-[#64748b] hover:bg-white hover:text-[#123f59]"
                        }
                      `}
                      type="button"
                      title="عرض الجدول"
                    >
                      <IconWithText
                        icon={List}
                        text="جدول"
                        vertical
                        iconClassName="h-4 w-4"
                        textClassName="text-[6px] font-black leading-none"
                      />
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Data */}
            {filteredDistricts.length === 0 ? (
              <EmptyState />
            ) : viewMode === "grid" ? (
              <section className="grid grid-cols-1 gap-2.5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {filteredDistricts.map((district) => (
                  <DistrictCard
                    key={district.id}
                    district={district}
                    sectorBadge={getSectorBadge(district.sector?.name)}
                    onEdit={() => openEditModal(district)}
                    onDelete={() => handleDelete(district.id, district.name)}
                    onShowStreets={() =>
                      setStreetsModal({
                        isOpen: true,
                        district,
                      })
                    }
                  />
                ))}
              </section>
            ) : (
              <DistrictTable
                districts={filteredDistricts}
                getSectorBadge={getSectorBadge}
                onEdit={openEditModal}
                onDelete={handleDelete}
                onShowStreets={(district) =>
                  setStreetsModal({
                    isOpen: true,
                    district,
                  })
                }
              />
            )}
          </div>
        </main>
      </div>

      {/* District Modal */}
      {modal.isOpen && (
        <DistrictModal
          modal={modal}
          setModal={setModal}
          sectors={sectors}
          saveMutation={saveMutation}
        />
      )}

      {/* Streets List Modal */}
      {streetsModal.isOpen && streetsModal.district && (
        <StreetsModal
          streetsModal={streetsModal}
          setStreetsModal={setStreetsModal}
          setEditStreetModal={setEditStreetModal}
          handleDeleteStreet={handleDeleteStreet}
        />
      )}

      {/* Edit Street Modal */}
      {editStreetModal.isOpen && (
        <EditStreetModal
          editStreetModal={editStreetModal}
          setEditStreetModal={setEditStreetModal}
          streetUpdateMutation={streetUpdateMutation}
        />
      )}
    </div>
  );
};

const HeaderActionButton = ({ icon: Icon, label, onClick, variant = "ghost" }) => {
  const variants = {
    primary:
      "border-[#e2bf74]/40 bg-[#e2bf74] text-[#082032] hover:bg-[#f5d99b] shadow-[0_10px_20px_rgba(226,191,116,0.18)]",
    ghost:
      "border-white/15 bg-white/10 text-white hover:bg-white/18 hover:border-[#e2bf74]/35",
  };

  return (
    <button
      onClick={onClick}
      className={`
        flex h-10 items-center justify-center gap-1.5 rounded-xl
        border px-3 text-xs font-black transition-all hover:-translate-y-[1px]
        ${variants[variant] || variants.ghost}
      `}
      type="button"
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
};

const KpiCard = ({ icon: Icon, label, value, tone = "emerald" }) => {
  const tones = {
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
    amber: "border-amber-200 bg-amber-50 text-amber-700",
    blue: "border-[#d8b46a]/35 bg-[#eef7f6] text-[#15536f]",
  };

  return (
    <div
      className="
        relative overflow-hidden rounded-[20px]
        border border-[#d8b46a]/25 bg-white/95
        p-3.5 shadow-[0_8px_22px_rgba(18,63,89,0.06)]
        backdrop-blur-xl
      "
    >
      <div className="absolute -left-10 -top-4 h-24 w-24 rounded-full bg-[#e2bf74]/10 blur-2xl" />

      <div className="relative z-10 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[11px] font-black text-[#64748b]">
            {label}
          </p>

          <p className="mt-1 text-sm font-black leading-none text-[#123f59]">
            {value}
          </p>
        </div>

        <span
          className={`
            grid h-10 w-10 shrink-0 place-items-center
            rounded-2xl border
            ${tones[tone] || tones.emerald}
          `}
        >
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </div>
  );
};

const DistrictCard = ({
  district,
  sectorBadge,
  onEdit,
  onDelete,
  onShowStreets,
}) => {
  return (
    <article
      className="
        group flex overflow-hidden rounded-[16px]
        border border-[#d8b46a]/25 bg-white/95
        shadow-[0_8px_22px_rgba(18,63,89,0.06)]
        backdrop-blur-xl transition-all
        hover:-translate-y-[1px] hover:shadow-[0_16px_34px_rgba(18,63,89,0.12)]
      "
    >
      <div className="flex min-h-full w-full flex-col">
        <div
          className={`
            relative overflow-hidden border-b p-3
            ${sectorBadge.border}
            bg-gradient-to-bl ${sectorBadge.gradient}
          `}
        >
          <div className="absolute -bottom-12 -left-12 h-24 w-24 rounded-full bg-[#e2bf74]/18 blur-2xl" />

          <div className="relative z-10 flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div
                className={`
                  mb-2 inline-flex h-8 shrink-0 items-center justify-center gap-1.5 px-2.5 rounded-xl border
                  ${sectorBadge.bg} ${sectorBadge.border} ${sectorBadge.text}
                `}
              >
                <IconWithText
                  icon={MapPin}
                  text="حي"
                  vertical
                  iconClassName="h-4 w-4"
                  textClassName="text-[6px] font-black leading-none"
                />
              </div>

              <h3 className="truncate text-sm font-black text-[#123f59]">
                حي {district.name}
              </h3>

              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                <span
                  className="
                    inline-flex items-center gap-1 rounded-lg
                    border border-[#d8b46a]/25 bg-white/80
                    px-2 py-0.5 text-[9px] font-black text-[#64748b]
                  "
                >
                  {district.code || "N/A"}
                </span>

                <span
                  className={`
                    inline-flex items-center gap-1 rounded-lg border
                    px-2 py-0.5 text-[9px] font-black
                    ${sectorBadge.bg} ${sectorBadge.text} ${sectorBadge.border}
                  `}
                >
                  <Building2 className="h-3 w-3" />
                  قطاع {district.sector?.name || "غير محدد"}
                </span>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1">
              <CardIconButton icon={Edit} label="تعديل" onClick={onEdit} />
              <CardIconButton icon={Trash2} label="حذف" onClick={onDelete} danger />
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-3 p-3">
          <button
            onClick={onShowStreets}
            className="
              flex items-center justify-between rounded-2xl
              border border-orange-200 bg-orange-50/65
              px-3 py-2.5 text-right transition
              hover:bg-orange-100
            "
            type="button"
          >
            <span className="flex items-center gap-2 text-[10px] font-black text-orange-700">
              <Route className="h-4 w-4" />
              عرض الشوارع
            </span>

            <span className="text-sm font-black leading-none text-[#123f59]">
              {district._count?.streets || 0}
            </span>
          </button>

          <div className="relative h-24 overflow-hidden rounded-2xl border border-[#d8b46a]/25 bg-[#06111d]">
            {district.mapImage ? (
              <img
                src={district.mapImage}
                alt="Map"
                className="h-full w-full object-cover opacity-80 transition group-hover:scale-105"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white/65">
                <Map className="mb-1 h-6 w-6 opacity-70" />
                <span className="text-[9px] font-black">لا توجد خريطة</span>
              </div>
            )}

            <div className="absolute bottom-2 right-2 rounded-lg bg-black/45 px-2 py-0.5 text-[8px] font-black text-white backdrop-blur-md">
              صورة الحي
            </div>
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between gap-2 border-t border-[#e8ddc8] bg-[#fbf8f1]/75 p-2.5">
          {district.officialLink ? (
            <a
              href={district.officialLink}
              target="_blank"
              rel="noreferrer"
              className="
                inline-flex items-center gap-1 rounded-lg
                border border-[#d8b46a]/35 bg-[#eef7f6]
                px-2.5 py-1.5 text-[10px] font-black text-[#15536f]
                transition hover:bg-[#d8b46a]/25
              "
            >
              <ExternalLink className="h-3.5 w-3.5" />
              الرابط الرسمي
            </a>
          ) : (
            <span
              className="
                inline-flex items-center gap-1 rounded-lg
                border border-[#e8ddc8] bg-white
                px-2.5 py-1.5 text-[9px] font-black text-[#94a3b8]
              "
            >
              <Globe className="h-3.5 w-3.5" />
              غير مرتبط
            </span>
          )}

          {district.officialLink && (
            <div className="inline-flex h-8 shrink-0 items-center justify-center gap-1.5 px-2.5 rounded-lg border border-[#e8ddc8] bg-white p-1 shadow-[0_6px_14px_rgba(18,63,89,0.04)]">
              <QRCodeSVG
                value={district.officialLink}
                size={100}
                className="h-full w-full"
              />
            </div>
          )}
        </div>
      </div>
    </article>
  );
};

const CardIconButton = ({ icon: Icon, label, onClick, danger = false }) => {
  return (
    <button
      onClick={onClick}
      className={`
        grid h-8 w-8 place-items-center rounded-lg border bg-white shadow-[0_6px_14px_rgba(18,63,89,0.04)] transition-all
        ${
          danger
            ? "border-rose-200 text-rose-500 hover:bg-rose-50"
            : "border-[#d8b46a]/35 text-[#0e7490] hover:bg-[#eef7f6]"
        }
      `}
      type="button"
      title={label}
    >
      <IconWithText
        icon={Icon}
        text={label}
        vertical
        iconClassName="h-3.5 w-3.5"
        textClassName="text-[5.5px] font-black leading-none"
      />
    </button>
  );
};

const DistrictTable = ({
  districts,
  getSectorBadge,
  onEdit,
  onDelete,
  onShowStreets,
}) => {
  return (
    <section
      className="
        overflow-hidden rounded-[16px]
        border border-[#d8b46a]/25 bg-white/95
        shadow-[0_8px_22px_rgba(18,63,89,0.06)]
        backdrop-blur-xl
      "
    >
      <div className="overflow-x-auto custom-scrollbar-slim">
        <table className="w-full min-w-[920px] text-right text-sm">
          <thead className="border-b border-[#e8ddc8] bg-[#fbf8f1] text-[11px] font-black text-[#64748b]">
            <tr>
              <th className="px-3 py-3">اسم الحي</th>
              <th className="px-3 py-3">القطاع التابع له</th>
              <th className="px-3 py-3 text-center">عدد الشوارع</th>
              <th className="px-3 py-3 text-center">الارتباط الجغرافي</th>
              <th className="w-40 px-3 py-3 text-center">إجراءات</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#e8ddc8]">
            {districts.map((district) => {
              const sectorBadge = getSectorBadge(district.sector?.name);

              return (
                <tr
                  key={district.id}
                  className="transition-colors hover:bg-[#fbf8f1]/65"
                >
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <div
                        className={`
                          inline-flex h-8 shrink-0 items-center justify-center gap-1.5 px-2.5 rounded-xl border
                          ${sectorBadge.bg} ${sectorBadge.border} ${sectorBadge.text}
                        `}
                      >
                        <MapPin className="h-4 w-4" />
                      </div>

                      <div>
                        <div className="font-black text-[#123f59]">
                          حي {district.name}
                        </div>

                        <div className="mt-0.5 font-mono text-[10px] font-black text-[#94a3b8]">
                          {district.code || "N/A"}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-3 py-3">
                    <span
                      className={`
                        inline-flex items-center gap-1 rounded-lg border
                        px-2 py-1 text-[10px] font-black
                        ${sectorBadge.bg} ${sectorBadge.text} ${sectorBadge.border}
                      `}
                    >
                      <Building2 className="h-3.5 w-3.5" />
                      قطاع {district.sector?.name || "غير محدد"}
                    </span>
                  </td>

                  <td className="px-3 py-3 text-center">
                    <button
                      onClick={() => onShowStreets(district)}
                      className="
                        inline-flex items-center gap-1 rounded-lg
                        border border-orange-200 bg-orange-50
                        px-2.5 py-1.5 text-[10px]
                        font-black text-orange-700
                        transition hover:bg-orange-100
                      "
                      type="button"
                    >
                      <Route className="h-3.5 w-3.5" />
                      {district._count?.streets || 0} شارع
                    </button>
                  </td>

                  <td className="px-3 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <StatusIcon
                        available={Boolean(district.officialLink)}
                        icon={Link2}
                      />
                      <StatusIcon available={Boolean(district.mapImage)} icon={Map} />
                      <StatusIcon
                        available={Boolean(district.satelliteImage)}
                        icon={Satellite}
                      />
                    </div>
                  </td>

                  <td className="px-3 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <SmallActionButton
                        icon={Eye}
                        label="شوارع"
                        onClick={() => onShowStreets(district)}
                      />

                      <SmallActionButton
                        icon={Edit}
                        label="تعديل"
                        onClick={() => onEdit(district)}
                      />

                      <SmallActionButton
                        icon={Trash2}
                        label="حذف"
                        onClick={() => onDelete(district.id, district.name)}
                        danger
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
};

const StatusIcon = ({ available, icon: Icon }) => {
  return (
    <div
      className={`
        grid h-7 w-7 place-items-center rounded-lg border
        ${
          available
            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
            : "border-[#e8ddc8] bg-[#fbf8f1] text-[#94a3b8]"
        }
      `}
    >
      <Icon className="h-3.5 w-3.5" />
    </div>
  );
};

const SmallActionButton = ({ icon: Icon, label, onClick, danger = false }) => {
  return (
    <button
      onClick={onClick}
      className={`
        inline-flex h-8 items-center justify-center gap-1 rounded-lg border px-2.5
        text-[9px] font-black transition
        ${
          danger
            ? "border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100"
            : "border-[#d8b46a]/35 bg-[#eef7f6] text-[#15536f] hover:bg-[#d8b46a]/25"
        }
      `}
      type="button"
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
};

const EmptyState = () => {
  return (
    <section
      className="
        flex flex-col items-center justify-center
        rounded-[16px] border border-dashed border-[#d8b46a]/40
        bg-white/75 py-12 text-center shadow-[0_6px_14px_rgba(18,63,89,0.04)]
      "
    >
      <div className="mb-3 grid h-10 w-10 place-items-center rounded-2xl bg-[#fbf8f1] text-[#c5983c]">
        <MapPin className="h-7 w-7" />
      </div>

      <h3 className="text-sm font-black text-[#123f59]">
        لا توجد أحياء مطابقة
      </h3>

      <p className="mt-1.5 text-xs font-bold text-[#64748b]">
        جرّب تغيير البحث أو فلتر القطاع.
      </p>
    </section>
  );
};

const DistrictModal = ({ modal, setModal, sectors, saveMutation }) => {
  const updateModalData = (field, value) => {
    setModal((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        [field]: value,
      },
    }));
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#06111d]/70 p-4 backdrop-blur-md"
      dir="rtl"
    >
      <div
        className="
          flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden
          rounded-[18px] border border-[#d8b46a]/35
          bg-white shadow-[0_32px_90px_rgba(0,0,0,0.35)]
        "
      >
        <div
          className="
            relative overflow-hidden border-b border-[#d8b46a]/25
            bg-gradient-to-l from-[#06111d] via-[#123f59] to-[#0e7490]
            px-3 py-4 text-white
          "
        >
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute right-[-50px] top-[-50px] h-32 w-32 rounded-full bg-[#e2bf74]/20 blur-3xl" />
            <div className="absolute left-[-60px] bottom-[-60px] h-36 w-36 rounded-full bg-emerald-400/20 blur-3xl" />
          </div>

          <div className="relative z-10 flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-3">
              <div
                className="
                  inline-flex h-8 shrink-0 items-center justify-center gap-1.5 px-2.5 rounded-2xl
                  border border-[#e2bf74]/40 bg-white/10 text-[#e2bf74]
                "
              >
                <IconWithText
                  icon={MapPin}
                  text={modal.mode === "create" ? "جديد" : "تعديل"}
                  vertical
                  iconClassName="h-5 w-5"
                  textClassName="text-[7px] font-black leading-none"
                />
              </div>

              <div>
                <h3 className="text-sm font-black">
                  {modal.mode === "create"
                    ? "تسجيل حي جديد"
                    : "تعديل بيانات الحي"}
                </h3>

                <p className="mt-0.5 text-[10px] font-bold text-white/60">
                  تسجيل وربط الحي بالقطاع المناسب.
                </p>
              </div>
            </div>

            <button
              onClick={() => setModal((prev) => ({ ...prev, isOpen: false }))}
              className="inline-flex h-8 shrink-0 items-center justify-center gap-1.5 px-2.5 rounded-xl border border-white/15 bg-white/10 text-white transition hover:bg-rose-500/35"
              type="button"
            >
              <IconWithText icon={X} text="إغلاق" iconClassName="h-5 w-5" /></button>
          </div>
        </div>

        <form
          id="districtForm"
          onSubmit={(e) => {
            e.preventDefault();
            saveMutation.mutate(modal.data);
          }}
          className="min-h-0 flex-1 space-y-2.5 overflow-y-auto overflow-x-hidden p-3 custom-scrollbar-slim"
        >
          <FormSection
            icon={FileText}
            title="البيانات الأساسية"
            subtitle="اسم الحي والقطاع التابع له."
          >
            <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
              <Field label="القطاع التابع له" required className="md:col-span-2">
                <select
                  required
                  value={modal.data.sectorId || ""}
                  onChange={(e) => updateModalData("sectorId", e.target.value)}
                  className={INPUT_CLASS}
                >
                  <option value="" disabled>
                    -- اختر القطاع --
                  </option>

                  {sectors.map((sector) => (
                    <option key={sector.id} value={sector.id}>
                      قطاع {sector.name}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="اسم الحي" required>
                <input
                  type="text"
                  required
                  value={modal.data.name || ""}
                  onChange={(e) => updateModalData("name", e.target.value)}
                  className={INPUT_CLASS}
                  placeholder="مثال: العليا..."
                />
              </Field>

              {modal.mode === "edit" && (
                <Field label="كود الحي الداخلي">
                  <input
                    type="text"
                    readOnly
                    dir="ltr"
                    value={modal.data.code || "تلقائي"}
                    className={`${INPUT_CLASS} cursor-not-allowed bg-[#f1f5f9] font-mono text-left text-[#64748b]`}
                  />
                </Field>
              )}
            </div>
          </FormSection>
        </form>

        <div className="flex shrink-0 flex-wrap items-center gap-3 border-t border-[#d8b46a]/25 bg-[#fbf8f1] p-3">
          <button
            type="button"
            onClick={() => setModal((prev) => ({ ...prev, isOpen: false }))}
            className="h-10 rounded-xl border border-[#d8b46a]/30 bg-white px-3 text-xs font-black text-[#64748b] transition hover:bg-[#fbf8f1]"
          >
            إلغاء
          </button>

          <button
            type="submit"
            form="districtForm"
            disabled={saveMutation.isPending}
            className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-[#123f59] via-[#15536f] to-[#0e7490] px-3 text-xs font-black text-white shadow-[0_10px_24px_rgba(18,63,89,0.18)] transition hover:-translate-y-[1px] disabled:opacity-50"
          >
            {saveMutation.isPending ? (
              <Loader2 className="h-5 w-5 animate-spin text-[#e2bf74]" />
            ) : (
              <>
                <CircleCheck className="h-5 w-5 text-[#e2bf74]" />
                حفظ
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const StreetsModal = ({
  streetsModal,
  setStreetsModal,
  setEditStreetModal,
  handleDeleteStreet,
}) => {
  const streets = streetsModal.district?.streets || [];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#06111d]/70 p-4 backdrop-blur-md"
      dir="rtl"
    >
      <div
        className="
          flex h-[82vh] w-full max-w-4xl flex-col overflow-hidden
          rounded-[18px] border border-[#d8b46a]/35
          bg-white shadow-[0_32px_90px_rgba(0,0,0,0.35)]
        "
      >
        <div
          className="
            relative overflow-hidden border-b border-[#d8b46a]/25
            bg-gradient-to-l from-[#06111d] via-[#123f59] to-[#0e7490]
            px-3 py-4 text-white
          "
        >
          <div className="relative z-10 flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-3">
              <div
                className="
                  inline-flex h-8 shrink-0 items-center justify-center gap-1.5 px-2.5 rounded-2xl
                  border border-[#e2bf74]/40 bg-white/10 text-[#e2bf74]
                "
              >
                <IconWithText
                  icon={Route}
                  text="شوارع"
                  vertical
                  iconClassName="h-5 w-5"
                  textClassName="text-[7px] font-black leading-none"
                />
              </div>

              <div>
                <h3 className="text-sm font-black">
                  شوارع حي {streetsModal.district.name}
                </h3>

                <p className="mt-0.5 text-[10px] font-bold text-white/60">
                  إدارة وتعديل الشوارع والمحاور التابعة للحي.
                </p>
              </div>
            </div>

            <button
              onClick={() =>
                setStreetsModal({
                  isOpen: false,
                  district: null,
                })
              }
              className="inline-flex h-8 shrink-0 items-center justify-center gap-1.5 px-2.5 rounded-xl border border-white/15 bg-white/10 text-white transition hover:bg-rose-500/35"
              type="button"
            >
              <IconWithText icon={X} text="إغلاق" iconClassName="h-5 w-5" /></button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden bg-[#fbf8f1]/55 p-4 custom-scrollbar-slim">
          {streets.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-[#94a3b8]">
              <Route className="mb-3 h-9 w-9 opacity-35" />
              <p className="text-sm font-black">
                لا توجد شوارع مسجلة في هذا الحي حتى الآن.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-[16px] border border-[#d8b46a]/25 bg-white shadow-[0_6px_14px_rgba(18,63,89,0.04)]">
              <div className="overflow-x-auto custom-scrollbar-slim">
                <table className="w-full min-w-[760px] text-right text-sm">
                  <thead className="border-b border-[#e8ddc8] bg-[#fbf8f1] text-[11px] font-black text-[#64748b]">
                    <tr>
                      <th className="px-4 py-3">اسم الشارع</th>
                      <th className="px-4 py-3 text-center">النوع</th>
                      <th className="px-4 py-3 text-center">العرض</th>
                      <th className="px-4 py-3 text-center">كود الشارع</th>
                      <th className="w-28 px-4 py-3 text-center">إجراءات</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-[#e8ddc8]">
                    {streets.map((street) => (
                      <tr
                        key={street.id}
                        className="transition-colors hover:bg-orange-50/40"
                      >
                        <td className="px-4 py-3 font-black text-[#123f59]">
                          {street.name}
                        </td>

                        <td className="px-4 py-3 text-center">
                          {street.type === "main" ? (
                            <span className="rounded-lg border border-amber-200 bg-amber-50 px-2 py-1 text-[10px] font-black text-amber-700">
                              طريق محوري
                            </span>
                          ) : (
                            <span className="rounded-lg border border-[#e8ddc8] bg-[#fbf8f1] px-2 py-1 text-[10px] font-black text-[#64748b]">
                              شارع داخلي
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3 text-center font-mono font-black text-[#64748b]">
                          {street.width}
                        </td>

                        <td className="px-4 py-3 text-center font-mono text-[10px] font-black text-[#94a3b8]">
                          {street.code}
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <SmallActionButton
                              icon={Edit}
                              label="تعديل"
                              onClick={() =>
                                setEditStreetModal({
                                  isOpen: true,
                                  data: {
                                    id: street.id,
                                    name: street.name,
                                    width: String(street.width || "").replace(
                                      "م",
                                      "",
                                    ),
                                    type: street.type || "normal",
                                  },
                                })
                              }
                            />

                            <SmallActionButton
                              icon={Trash2}
                              label="حذف"
                              onClick={() =>
                                handleDeleteStreet(street.id, street.name)
                              }
                              danger
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const EditStreetModal = ({
  editStreetModal,
  setEditStreetModal,
  streetUpdateMutation,
}) => {
  const updateStreetData = (field, value) => {
    setEditStreetModal((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        [field]: value,
      },
    }));
  };

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-[#06111d]/70 p-4 backdrop-blur-md"
      dir="rtl"
    >
      <div
        className="
          flex w-full max-w-md flex-col overflow-hidden
          rounded-[18px] border border-[#d8b46a]/35
          bg-white shadow-[0_32px_90px_rgba(0,0,0,0.35)]
        "
      >
        <div
          className="
            flex items-center justify-between gap-3
            border-b border-[#d8b46a]/25
            bg-gradient-to-l from-[#06111d] via-[#123f59] to-[#0e7490]
            px-3 py-4 text-white
          "
        >
          <div className="flex items-center gap-3">
            <div
              className="
                grid h-10 w-10 place-items-center rounded-xl
                border border-[#e2bf74]/40 bg-white/10 text-[#e2bf74]
              "
            >
              <Edit className="h-5 w-5" />
            </div>

            <h3 className="text-sm font-black">تعديل بيانات الشارع</h3>
          </div>

          <button
            onClick={() =>
              setEditStreetModal((prev) => ({
                ...prev,
                isOpen: false,
              }))
            }
            className="grid h-8 w-8 place-items-center rounded-xl border border-white/15 bg-white/10 text-white transition hover:bg-rose-500/35"
            type="button"
          >
            <IconWithText icon={X} text="إغلاق" iconClassName="h-4 w-4" /></button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            streetUpdateMutation.mutate(editStreetModal.data);
          }}
          className="space-y-2.5 p-3"
        >
          <Field label="اسم الشارع" required>
            <input
              type="text"
              required
              value={editStreetModal.data.name || ""}
              onChange={(e) => updateStreetData("name", e.target.value)}
              className={INPUT_CLASS}
            />
          </Field>

          <div className="grid grid-cols-2 gap-2.5">
            <Field label="العرض بالمتر" required>
              <input
                type="number"
                required
                value={editStreetModal.data.width || ""}
                onChange={(e) => updateStreetData("width", e.target.value)}
                className={`${INPUT_CLASS} font-mono`}
              />
            </Field>

            <Field label="النوع">
              <select
                value={editStreetModal.data.type || "normal"}
                onChange={(e) => updateStreetData("type", e.target.value)}
                className={INPUT_CLASS}
              >
                <option value="normal">داخلي</option>
                <option value="main">طريق محوري</option>
              </select>
            </Field>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() =>
                setEditStreetModal((prev) => ({
                  ...prev,
                  isOpen: false,
                }))
              }
              className="h-10 flex-1 rounded-xl border border-[#d8b46a]/30 bg-white text-xs font-black text-[#64748b] transition hover:bg-[#fbf8f1]"
            >
              إلغاء
            </button>

            <button
              type="submit"
              disabled={streetUpdateMutation.isPending}
              className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-[#123f59] via-[#15536f] to-[#0e7490] text-xs font-black text-white shadow-[0_10px_24px_rgba(18,63,89,0.18)] transition hover:-translate-y-[1px] disabled:opacity-50"
            >
              {streetUpdateMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin text-[#e2bf74]" />
              ) : (
                "حفظ التعديلات"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const FormSection = ({ icon: Icon, title, subtitle, children }) => {
  return (
    <section className="overflow-hidden rounded-[16px] border border-[#d8b46a]/25 bg-white shadow-[0_6px_14px_rgba(18,63,89,0.04)]">
      <div className="flex items-center gap-3 border-b border-[#e8ddc8] bg-gradient-to-l from-[#fbf8f1] via-white to-[#eef7f6] px-4 py-3">
        <span className="inline-flex h-8 shrink-0 items-center justify-center gap-1.5 px-2.5 rounded-xl bg-[#123f59] text-[#e2bf74]">
          <Icon className="h-4 w-4" />
        </span>

        <div>
          <h4 className="text-xs font-black text-[#123f59]">{title}</h4>

          <p className="mt-0.5 text-[10px] font-bold text-[#64748b]">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="p-4">{children}</div>
    </section>
  );
};

const Field = ({ label, required = false, children, className = "" }) => {
  return (
    <label className={`block space-y-1.5 ${className}`}>
      <span className="text-[10px] font-black text-[#64748b]">
        {label}
        {required && <span className="mr-1 text-rose-500">*</span>}
      </span>

      {children}
    </label>
  );
};

const PreviewStatus = ({ icon: Icon, label, active }) => {
  return (
    <div
      className={`
        flex items-center gap-2 rounded-xl border px-3 py-2.5
        ${
          active
            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
            : "border-[#e8ddc8] bg-[#fbf8f1] text-[#94a3b8]"
        }
      `}
    >
      <Icon className="h-4 w-4" />
      <span className="text-[9px] font-black">{label}</span>

      <span className="mr-auto">
        {active ? (
          <ShieldCheck className="h-4 w-4" />
        ) : (
          <Sparkles className="h-4 w-4 opacity-40" />
        )}
      </span>
    </div>
  );
};

const INPUT_CLASS = `
  h-10 w-full rounded-xl
  border border-[#d8b46a]/25 bg-white
  px-3 text-xs font-bold text-[#123f59]
  shadow-[0_6px_14px_rgba(18,63,89,0.04)] outline-none transition-all
  placeholder:text-[#94a3b8]
  focus:border-[#c5983c]/70
  focus:bg-white
  focus:ring-4 focus:ring-[#c5983c]/10
`;

export default Screen41_Districts;