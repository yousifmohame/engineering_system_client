import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../api/axios";
import { toast } from "sonner";
import {
  Landmark,
  Search,
  LayoutGrid,
  List,
  Plus,
  MapPin,
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
  ShieldCheck,
  FolderCog,
  ExternalLink,
  Image as ImageIcon,
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


const emptySectorData = {
  id: null,
  name: "",
  officialLink: "",
  mapImage: "",
  satelliteImage: "",
};

const Screen40_Sectors = () => {
  const queryClient = useQueryClient();

  const [viewMode, setViewMode] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");

  const [modal, setModal] = useState({
    isOpen: false,
    mode: "create",
    data: emptySectorData,
  });

  const { data: sectors = [], isLoading } = useQuery({
    queryKey: ["sectors-list"],
    queryFn: async () => {
      const response = await api.get("/riyadh-streets/sectors");
      return response.data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (payload) => {
      if (modal.mode === "create") {
        return await api.post("/riyadh-streets/sectors", payload);
      }

      return await api.put(`/riyadh-streets/sectors/${payload.id}`, payload);
    },
    onSuccess: () => {
      toast.success(
        modal.mode === "create"
          ? "تم تسجيل القطاع بنجاح"
          : "تم تحديث بيانات القطاع",
      );

      queryClient.invalidateQueries({ queryKey: ["sectors-list"] });
      queryClient.invalidateQueries({ queryKey: ["riyadh-tree"] });

      setModal((prev) => ({ ...prev, isOpen: false }));
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "حدث خطأ في الحفظ");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => await api.delete(`/riyadh-streets/sectors/${id}`),
    onSuccess: () => {
      toast.success("تم حذف القطاع بنجاح");

      queryClient.invalidateQueries({ queryKey: ["sectors-list"] });
      queryClient.invalidateQueries({ queryKey: ["riyadh-tree"] });

      setModal((prev) => ({ ...prev, isOpen: false }));
    },
    onError: (err) => {
      toast.error(
        err.response?.data?.message ||
          "فشل الحذف، قد يكون القطاع مرتبطاً ببيانات أخرى.",
      );
    },
  });

  const handleDelete = (id, name) => {
    const confirmed = window.confirm(
      `هل أنت متأكد من رغبتك في حذف (قطاع ${name}) نهائياً؟ لا يمكن التراجع عن هذا الإجراء.`,
    );

    if (confirmed) {
      deleteMutation.mutate(id);
    }
  };

  const filteredSectors = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) return sectors;

    return sectors.filter((sector) => {
      const name = String(sector.name || "").toLowerCase();
      const code = String(sector.code || "").toLowerCase();

      return name.includes(query) || code.includes(query);
    });
  }, [sectors, searchQuery]);

  const kpis = useMemo(() => {
    const totalDistricts = sectors.reduce(
      (acc, curr) => acc + (curr._count?.districts || 0),
      0,
    );

    const totalStreets = sectors.reduce(
      (acc, curr) => acc + (curr._count?.streets || 0),
      0,
    );

    const linkedMaps = sectors.filter((sector) => sector.officialLink).length;

    return {
      totalSectors: sectors.length,
      totalDistricts,
      totalStreets,
      coverage:
        sectors.length > 0 ? Math.round((linkedMaps / sectors.length) * 100) : 0,
    };
  }, [sectors]);

  const getSectorStyle = (name = "") => {
    if (name.includes("وسط")) {
      return {
        color: "text-rose-700",
        bg: "bg-rose-50",
        border: "border-rose-200",
        gradient: "from-rose-50 via-white to-white",
      };
    }

    if (name.includes("شمال")) {
      return {
        color: "text-[#15536f]",
        bg: "bg-[#eef7f6]",
        border: "border-[#d8b46a]/35",
        gradient: "from-[#eef7f6] via-white to-white",
      };
    }

    if (name.includes("جنوب")) {
      return {
        color: "text-emerald-700",
        bg: "bg-emerald-50",
        border: "border-emerald-200",
        gradient: "from-emerald-50 via-white to-white",
      };
    }

    if (name.includes("شرق")) {
      return {
        color: "text-orange-700",
        bg: "bg-orange-50",
        border: "border-orange-200",
        gradient: "from-orange-50 via-white to-white",
      };
    }

    if (name.includes("غرب")) {
      return {
        color: "text-[#15536f]",
        bg: "bg-[#eef7f6]",
        border: "border-[#d8b46a]/35",
        gradient: "from-[#eef7f6] via-white to-white",
      };
    }

    return {
      color: "text-[#123f59]",
      bg: "bg-[#eef7f6]",
      border: "border-[#d8b46a]/35",
      gradient: "from-[#eef7f6] via-white to-[#fbf8f1]",
    };
  };

  const openCreateModal = () => {
    setModal({
      isOpen: true,
      mode: "create",
      data: emptySectorData,
    });
  };

  const openEditModal = (sector) => {
    setModal({
      isOpen: true,
      mode: "edit",
      data: sector,
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCSV = () => {
    const headers = [
      "اسم القطاع",
      "الكود الداخلي",
      "عدد الأحياء",
      "عدد الشوارع",
      "رابط الخريطة الرسمية",
    ];

    const rows = filteredSectors.map((sector) => [
      `قطاع ${sector.name}`,
      sector.code || "N/A",
      sector._count?.districts || 0,
      sector._count?.streets || 0,
      sector.officialLink || "غير متوفر",
    ]);

    const csvContent = buildCsvContent(headers, rows);

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Riyadh_Sectors_Report_${getExportDateStamp()}.csv`;
    link.click();

    toast.success("تم تصدير التقرير بنجاح");
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-[#eef7f6]">
        <div className="flex flex-col items-center gap-3">
          <div className="inline-flex h-8 shrink-0 items-center justify-center gap-1.5 px-2.5 rounded-2xl border border-[#d8b46a]/40 bg-white shadow-[0_8px_22px_rgba(18,63,89,0.06)]">
            <Loader2 className="h-6 w-6 animate-spin text-[#123f59]" />
          </div>

          <p className="text-xs font-black text-[#123f59]">
            جاري تحميل بيانات القطاعات...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex h-full w-full max-w-full min-w-0 flex-col overflow-hidden overflow-x-hidden bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white font-[Tajawal] text-right text-[#123f59]"
      dir="rtl"
    
      style={{
        width: "min(100%, calc(100vw - 285px))",
        maxWidth: "min(100%, calc(100vw - 285px))",
        marginInlineStart: "auto",
        marginInlineEnd: 0,
      }}
    >

      <style>
        {`
          @media print {
            @page {
              size: A4 landscape;
              margin: 8mm;
            }

            html,
            body {
              margin: 0 !important;
              padding: 0 !important;
              width: 100% !important;
              height: auto !important;
              overflow: visible !important;
              background: #ffffff !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }

            body * {
              visibility: hidden !important;
            }

            [data-print-root="riyadh-sectors-report"],
            [data-print-root="riyadh-sectors-report"] * {
              visibility: visible !important;
            }

            [data-print-root="riyadh-sectors-report"] {
              display: block !important;
              position: fixed !important;
              inset: 0 auto auto 0 !important;
              width: 100vw !important;
              max-width: 100vw !important;
              min-height: auto !important;
              margin: 0 !important;
              padding: 0 !important;
              background: #ffffff !important;
              color: #123f59 !important;
              box-shadow: none !important;
              overflow: visible !important;
              z-index: 999999 !important;
            }

            .print\\:hidden,
            .no-print,
            [data-no-print="true"] {
              display: none !important;
            }
          }
        `}
      </style>

      {/* Print Area */}
      <div data-print-root="riyadh-sectors-report" className="hidden bg-white p-4 text-black print:block">
        <div className="mb-6 border-b-2 border-[#123f59] pb-4 text-center">
          <h1 className="mb-2 text-sm font-black">
            تقرير التقسيم الإداري لمدينة الرياض
          </h1>
          <p className="text-sm text-[#94a3b8]">إحصائيات القطاعات البلدية</p>
        </div>

        <div className="mb-8 grid grid-cols-4 gap-2.5 text-center">
          <div className="rounded-xl border p-4">
            <strong>إجمالي القطاعات:</strong> {kpis.totalSectors}
          </div>
          <div className="rounded-xl border p-4">
            <strong>الأحياء المعتمدة:</strong> {kpis.totalDistricts}
          </div>
          <div className="rounded-xl border p-4">
            <strong>الشوارع المسجلة:</strong> {kpis.totalStreets}
          </div>
          <div className="rounded-xl border p-4">
            <strong>تغطية الخرائط:</strong> {kpis.coverage}%
          </div>
        </div>

        <table className="w-full border-collapse border border-[#cbd5e1] text-sm">
          <thead>
            <tr className="bg-[#fbf8f1]">
              <th className="border border-[#cbd5e1] p-3">اسم القطاع</th>
              <th className="border border-[#cbd5e1] p-3">الكود</th>
              <th className="border border-[#cbd5e1] p-3">عدد الأحياء</th>
              <th className="border border-[#cbd5e1] p-3">عدد الشوارع</th>
            </tr>
          </thead>

          <tbody>
            {filteredSectors.map((sector) => (
              <tr key={sector.id}>
                <td className="border border-[#cbd5e1] p-3 font-bold">
                  قطاع {sector.name}
                </td>
                <td className="border border-[#cbd5e1] p-3 text-center">
                  {sector.code}
                </td>
                <td className="border border-[#cbd5e1] p-3 text-center">
                  {sector._count?.districts || 0}
                </td>
                <td className="border border-[#cbd5e1] p-3 text-center">
                  {sector._count?.streets || 0}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex h-full min-h-0 w-full max-w-full min-w-0 flex-col overflow-hidden overflow-x-hidden print:hidden">
        {/* Header Compact */}
        <header className="relative z-10 shrink-0 overflow-hidden border-b border-[#d8b46a]/25 bg-gradient-to-l from-[#06111d] via-[#123f59] to-[#0e7490] px-4 py-3 text-white shadow-[0_10px_24px_rgba(18,63,89,0.16)]">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute right-[-60px] top-[-70px] h-36 w-36 rounded-full bg-[#e2bf74]/16 blur-3xl" />
            <div className="absolute left-[-70px] bottom-[-80px] h-44 w-44 rounded-full bg-cyan-400/16 blur-3xl" />
          </div>

          <div className="relative z-10 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <div className="inline-flex h-8 shrink-0 items-center justify-center gap-1.5 px-2.5 rounded-2xl border border-[#e2bf74]/35 bg-white/10 text-[#e2bf74] shadow-[0_8px_18px_rgba(18,63,89,0.05)] backdrop-blur-xl">
                <IconWithText
                  icon={Landmark}
                  text="قطاعات"
                  vertical
                  iconClassName="h-5 w-5"
                  textClassName="text-[7px] font-black leading-none"
                />
              </div>

              <div className="min-w-0">
                <h1 className="truncate text-sm font-black">
                  إدارة القطاعات البلدية
                </h1>
                <p className="mt-0.5 truncate text-[11px] font-bold text-white/60">
                  التحكم في التقسيم الإداري، الخرائط، الأحياء، والشوارع.
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
                label="قطاع جديد"
                onClick={openCreateModal}
                variant="primary"
              />
            </div>
          </div>
        </header>

        {/* Content Compact */}
        <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-4 custom-scrollbar-slim">
          <div className="space-y-2.5">
            {/* KPI Compact */}
            <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
              <KpiCard
                icon={Landmark}
                label="إجمالي القطاعات"
                value={kpis.totalSectors}
                tone="blue"
              />

              <KpiCard
                icon={MapPin}
                label="الأحياء المعتمدة"
                value={kpis.totalDistricts}
                tone="emerald"
              />

              <KpiCard
                icon={Route}
                label="الشوارع المسجلة"
                value={kpis.totalStreets}
                tone="amber"
              />

              <KpiCard
                icon={Globe}
                label="تغطية الخرائط"
                value={`${kpis.coverage}%`}
                tone="violet"
              />
            </section>

            {/* Toolbar Compact */}
            <section className="rounded-[16px] border border-[#d8b46a]/25 bg-white/85 p-3 shadow-[0_8px_22px_rgba(18,63,89,0.06)] backdrop-blur-xl">
              <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                <div className="relative w-full xl:max-w-xl">
                  <Search className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#c5983c]" />

                  <input
                    type="text"
                    placeholder="بحث باسم القطاع أو الكود..."
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

                <div className="flex items-center justify-between gap-2">
                  <div className="rounded-xl border border-[#d8b46a]/25 bg-[#fbf8f1] px-3 py-2 text-[11px] font-black text-[#64748b]">
                    النتائج:{" "}
                    <span className="font-black text-[#123f59]">
                      {filteredSectors.length}
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
            {filteredSectors.length === 0 ? (
              <EmptyState />
            ) : viewMode === "grid" ? (
              <section className="grid grid-cols-1 gap-2.5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {filteredSectors.map((sector) => (
                  <SectorCard
                    key={sector.id}
                    sector={sector}
                    style={getSectorStyle(sector.name)}
                    onEdit={() => openEditModal(sector)}
                    onDelete={() => handleDelete(sector.id, sector.name)}
                  />
                ))}
              </section>
            ) : (
              <SectorTable
                sectors={filteredSectors}
                getSectorStyle={getSectorStyle}
                onEdit={openEditModal}
                onDelete={handleDelete}
              />
            )}
          </div>
        </main>
      </div>

      {/* Modal */}
      {modal.isOpen && (
        <SectorModal
          modal={modal}
          setModal={setModal}
          saveMutation={saveMutation}
          deleteMutation={deleteMutation}
          handleDelete={handleDelete}
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

const KpiCard = ({ icon: Icon, label, value, tone }) => {
  const tones = {
    blue: "border-[#d8b46a]/35 bg-[#eef7f6] text-[#15536f]",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
    amber: "border-amber-200 bg-amber-50 text-amber-700",
    violet: "border-[#d8b46a]/35 bg-[#eef7f6] text-[#15536f]",
  };

  return (
    <div className="relative overflow-hidden rounded-[20px] border border-[#d8b46a]/25 bg-white/95 p-3.5 shadow-[0_8px_22px_rgba(18,63,89,0.06)] backdrop-blur-xl">
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
            grid h-10 w-10 shrink-0 place-items-center rounded-2xl border
            ${tones[tone] || tones.blue}
          `}
        >
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </div>
  );
};

const SectorCard = ({ sector, style, onEdit, onDelete }) => {
  return (
    <article className="group flex overflow-hidden rounded-[16px] border border-[#d8b46a]/25 bg-white/95 shadow-[0_8px_22px_rgba(18,63,89,0.06)] backdrop-blur-xl transition-all hover:-translate-y-[1px] hover:shadow-[0_16px_34px_rgba(18,63,89,0.12)]">
      <div className="flex min-h-full w-full flex-col">
        <div
          className={`
            relative overflow-hidden border-b p-3
            ${style.border}
            bg-gradient-to-bl ${style.gradient}
          `}
        >
          <div className="absolute -bottom-12 -left-12 h-24 w-24 rounded-full bg-[#e2bf74]/18 blur-2xl" />

          <div className="relative z-10 flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div
                className={`
                  mb-2 inline-flex h-8 shrink-0 items-center justify-center gap-1.5 px-2.5 rounded-xl border
                  ${style.bg} ${style.border} ${style.color}
                `}
              >
                <IconWithText
                  icon={Landmark}
                  text="قطاع"
                  vertical
                  iconClassName="h-4 w-4"
                  textClassName="text-[6px] font-black leading-none"
                />
              </div>

              <h3 className="truncate text-sm font-black text-[#123f59]">
                قطاع {sector.name}
              </h3>

              <span className="mt-1.5 inline-flex items-center gap-1 rounded-lg border border-[#d8b46a]/25 bg-white/80 px-2 py-0.5 text-[9px] font-black text-[#64748b]">
                <FolderCog className="h-3 w-3 text-[#c5983c]" />
                {sector.code || "N/A"}
              </span>
            </div>

            <div className="flex shrink-0 items-center gap-1">
              <CardIconButton icon={Edit} label="تعديل" onClick={onEdit} />
              <CardIconButton
                icon={Trash2}
                label="حذف"
                onClick={onDelete}
                danger
              />
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-3 p-3">
          <div className="grid grid-cols-2 gap-2">
            <MiniStat
              icon={Building2}
              label="الأحياء"
              value={sector._count?.districts || 0}
            />

            <MiniStat
              icon={Route}
              label="الشوارع"
              value={sector._count?.streets || 0}
            />
          </div>

          <div className="relative h-24 overflow-hidden rounded-2xl border border-[#d8b46a]/25 bg-[#06111d]">
            {sector.mapImage ? (
              <img
                src={sector.mapImage}
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
              صورة المخطط
            </div>
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between gap-2 border-t border-[#e8ddc8] bg-[#fbf8f1]/75 p-2.5">
          {sector.officialLink ? (
            <a
              href={sector.officialLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded-lg border border-[#d8b46a]/35 bg-[#eef7f6] px-2.5 py-1.5 text-[10px] font-black text-[#15536f] transition hover:bg-[#d8b46a]/25"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              الخريطة التفاعلية
            </a>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-lg border border-[#e8ddc8] bg-white px-2.5 py-1.5 text-[9px] font-black text-[#94a3b8]">
              <Globe className="h-3.5 w-3.5" />
              غير مرتبط
            </span>
          )}

          {sector.officialLink && (
            <div className="inline-flex h-8 shrink-0 items-center justify-center gap-1.5 px-2.5 rounded-lg border border-[#e8ddc8] bg-white p-1 shadow-[0_6px_14px_rgba(18,63,89,0.04)]">
              <QRCodeSVG
                value={sector.officialLink}
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

const MiniStat = ({ icon: Icon, label, value }) => {
  return (
    <div className="rounded-2xl border border-[#e8ddc8] bg-[#fbf8f1]/75 p-2.5">
      <div className="mb-1.5 flex items-center gap-1.5 text-[9px] font-black text-[#64748b]">
        <Icon className="h-3.5 w-3.5 text-[#c5983c]" />
        {label}
      </div>

      <div className="text-sm font-black leading-none text-[#123f59]">
        {value}
      </div>
    </div>
  );
};

const SectorTable = ({ sectors, getSectorStyle, onEdit, onDelete }) => {
  return (
    <section className="overflow-hidden rounded-[16px] border border-[#d8b46a]/25 bg-white/95 shadow-[0_8px_22px_rgba(18,63,89,0.06)] backdrop-blur-xl">
      <div className="overflow-x-auto custom-scrollbar-slim">
        <table className="w-full min-w-[680px] text-right text-sm">
          <thead className="border-b border-[#e8ddc8] bg-[#fbf8f1] text-[11px] font-black text-[#64748b]">
            <tr>
              <th className="px-3 py-3">اسم القطاع</th>
              <th className="px-3 py-3">الكود الداخلي</th>
              <th className="px-3 py-3 text-center">عدد الأحياء</th>
              <th className="px-3 py-3 text-center">عدد الشوارع</th>
              <th className="px-3 py-3">الارتباط الجغرافي</th>
              <th className="w-32 px-3 py-3 text-center">إجراءات</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#e8ddc8]">
            {sectors.map((sector) => {
              const style = getSectorStyle(sector.name);

              return (
                <tr
                  key={sector.id}
                  className="transition-colors hover:bg-[#fbf8f1]/65"
                >
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <div
                        className={`
                          inline-flex h-8 shrink-0 items-center justify-center gap-1.5 px-2.5 rounded-xl border
                          ${style.bg} ${style.border} ${style.color}
                        `}
                      >
                        <Landmark className="h-4 w-4" />
                      </div>

                      <span className="font-black text-[#123f59]">
                        قطاع {sector.name}
                      </span>
                    </div>
                  </td>

                  <td className="px-3 py-3">
                    <span className="rounded-lg border border-[#e8ddc8] bg-[#fbf8f1] px-2 py-1 font-mono text-xs font-black text-[#64748b]">
                      {sector.code || "N/A"}
                    </span>
                  </td>

                  <td className="px-3 py-3 text-center font-black text-[#123f59]">
                    {sector._count?.districts || 0}
                  </td>

                  <td className="px-3 py-3 text-center font-black text-[#123f59]">
                    {sector._count?.streets || 0}
                  </td>

                  <td className="px-3 py-3">
                    <div className="flex gap-2">
                      <StatusIcon
                        available={Boolean(sector.officialLink)}
                        icon={Link2}
                      />
                      <StatusIcon
                        available={Boolean(sector.mapImage)}
                        icon={Map}
                      />
                      <StatusIcon
                        available={Boolean(sector.satelliteImage)}
                        icon={Satellite}
                      />
                    </div>
                  </td>

                  <td className="px-3 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <SmallActionButton
                        icon={Edit}
                        label="تعديل"
                        onClick={() => onEdit(sector)}
                      />
                      <SmallActionButton
                        icon={Trash2}
                        label="حذف"
                        onClick={() => onDelete(sector.id, sector.name)}
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
    <section className="flex flex-col items-center justify-center rounded-[16px] border border-dashed border-[#d8b46a]/40 bg-white/75 py-12 text-center shadow-[0_6px_14px_rgba(18,63,89,0.04)]">
      <div className="mb-3 grid h-10 w-10 place-items-center rounded-2xl bg-[#fbf8f1] text-[#c5983c]">
        <Landmark className="h-7 w-7" />
      </div>

      <h3 className="text-sm font-black text-[#123f59]">
        لا توجد قطاعات مطابقة للبحث
      </h3>

      <p className="mt-1.5 text-xs font-bold text-[#64748b]">
        جرّب تغيير كلمات البحث أو أضف قطاعاً جديداً.
      </p>
    </section>
  );
};

const SectorModal = ({
  modal,
  setModal,
  saveMutation,
  deleteMutation,
  handleDelete,
}) => {
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
      <div className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-[18px] border border-[#d8b46a]/35 bg-white shadow-[0_32px_90px_rgba(0,0,0,0.35)]">
        <div className="relative overflow-hidden border-b border-[#d8b46a]/25 bg-gradient-to-l from-[#06111d] via-[#123f59] to-[#0e7490] px-3 py-4 text-white">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute right-[-50px] top-[-50px] h-32 w-32 rounded-full bg-[#e2bf74]/20 blur-3xl" />
            <div className="absolute left-[-60px] bottom-[-60px] h-36 w-36 rounded-full bg-cyan-400/20 blur-3xl" />
          </div>

          <div className="relative z-10 flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-8 shrink-0 items-center justify-center gap-1.5 px-2.5 rounded-2xl border border-[#e2bf74]/40 bg-white/10 text-[#e2bf74]">
                <IconWithText
                  icon={Landmark}
                  text={modal.mode === "create" ? "جديد" : "تعديل"}
                  vertical
                  iconClassName="h-5 w-5"
                  textClassName="text-[7px] font-black leading-none"
                />
              </div>

              <div>
                <h3 className="text-sm font-black">
                  {modal.mode === "create"
                    ? "تسجيل قطاع جديد"
                    : "تعديل بيانات القطاع"}
                </h3>

                <p className="mt-0.5 text-[10px] font-bold text-white/60">
                  إدارة البيانات الأساسية والروابط الجغرافية للقطاع.
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
          id="sectorForm"
          onSubmit={(e) => {
            e.preventDefault();
            saveMutation.mutate(modal.data);
          }}
          className="min-h-0 flex-1 space-y-2.5 overflow-y-auto overflow-x-hidden p-3 custom-scrollbar-slim"
        >
          <FormSection
            icon={FileText}
            title="البيانات الأساسية"
            subtitle="اسم القطاع والكود الداخلي عند التعديل."
          >
            <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
              <Field label="اسم القطاع" required>
                <input
                  type="text"
                  required
                  value={modal.data.name || ""}
                  onChange={(e) => updateModalData("name", e.target.value)}
                  className={INPUT_CLASS}
                  placeholder="مثال: وسط، شمال، غرب..."
                />
              </Field>

              {modal.mode === "edit" && (
                <Field label="كود القطاع الداخلي">
                  <input
                    type="text"
                    readOnly
                    dir="ltr"
                    value={modal.data.code || "يتم توليده تلقائياً"}
                    className={`${INPUT_CLASS} cursor-not-allowed bg-[#f1f5f9] font-mono text-left text-[#64748b]`}
                  />
                </Field>
              )}
            </div>
          </FormSection>

          <FormSection
            icon={Globe}
            title="الروابط والخرائط"
            subtitle="الخريطة الرسمية، صورة المخطط، وصورة القمر الصناعي."
          >
            <div className="space-y-3">
              <Field label="رابط الخريطة الرسمية URL">
                <InputWithIcon
                  icon={Link2}
                  value={modal.data.officialLink || ""}
                  onChange={(value) => updateModalData("officialLink", value)}
                  placeholder="https://maps.example.com/..."
                />
              </Field>

              <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
                <Field label="رابط صورة المخطط">
                  <InputWithIcon
                    icon={Map}
                    value={modal.data.mapImage || ""}
                    onChange={(value) => updateModalData("mapImage", value)}
                    placeholder="https://..."
                  />
                </Field>

                <Field label="رابط صورة القمر الصناعي">
                  <InputWithIcon
                    icon={Satellite}
                    value={modal.data.satelliteImage || ""}
                    onChange={(value) => updateModalData("satelliteImage", value)}
                    placeholder="https://..."
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <PreviewStatus
                  icon={Globe}
                  label="الرابط الرسمي"
                  active={Boolean(modal.data.officialLink)}
                />

                <PreviewStatus
                  icon={ImageIcon}
                  label="صورة المخطط"
                  active={Boolean(modal.data.mapImage)}
                />

                <PreviewStatus
                  icon={Satellite}
                  label="القمر الصناعي"
                  active={Boolean(modal.data.satelliteImage)}
                />
              </div>
            </div>
          </FormSection>
        </form>

        <div className="flex shrink-0 flex-wrap items-center gap-3 border-t border-[#d8b46a]/25 bg-[#fbf8f1] p-3">
          {modal.mode === "edit" && (
            <button
              type="button"
              onClick={() => handleDelete(modal.data.id, modal.data.name)}
              disabled={deleteMutation.isPending}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 text-xs font-black text-rose-600 transition hover:bg-rose-100 disabled:opacity-50"
            >
              <IconWithText icon={Trash2} text="حذف القطاع" iconClassName="h-4 w-4" /></button>
          )}

          <div className="flex-1" />

          <button
            type="button"
            onClick={() => setModal((prev) => ({ ...prev, isOpen: false }))}
            className="h-10 rounded-xl border border-[#d8b46a]/30 bg-white px-3 text-xs font-black text-[#64748b] transition hover:bg-[#fbf8f1]"
          >
            إلغاء
          </button>

          <button
            type="submit"
            form="sectorForm"
            disabled={saveMutation.isPending}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-[#123f59] via-[#15536f] to-[#0e7490] px-3 text-xs font-black text-white shadow-[0_10px_24px_rgba(18,63,89,0.18)] transition hover:-translate-y-[1px] disabled:opacity-50"
          >
            {saveMutation.isPending ? (
              <Loader2 className="h-5 w-5 animate-spin text-[#e2bf74]" />
            ) : (
              <>
                <CircleCheck className="h-5 w-5 text-[#e2bf74]" />
                {modal.mode === "create" ? "حفظ وإنشاء" : "تحديث البيانات"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const FormSection = ({ icon: Icon, title, subtitle, children }) => {
  return (
    <section className="overflow-hidden rounded-[16px] border border-[#d8b46a]/25 bg-white shadow-[0_6px_14px_rgba(18,63,89,0.04)]">
      <div className="flex items-center gap-3 border-b border-[#e8ddc8] bg-gradient-to-l from-[#fbf8f1] via-white to-[#eef7f6] px-4 py-3">
        <span className="inline-flex h-8 shrink-0 items-center justify-center gap-1.5 px-2.5 rounded-xl bg-[#123f59] text-[#e2bf74]">
          <Icon className="h-4.5 w-4.5" />
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

const Field = ({ label, required = false, children }) => {
  return (
    <label className="block space-y-1.5">
      <span className="text-[10px] font-black text-[#64748b]">
        {label}
        {required && <span className="mr-1 text-rose-500">*</span>}
      </span>

      {children}
    </label>
  );
};

const InputWithIcon = ({ icon: Icon, value, onChange, placeholder }) => {
  return (
    <div className="relative">
      <Icon className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#c5983c]" />

      <input
        type="url"
        dir="ltr"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${INPUT_CLASS} pr-10 font-mono text-left`}
        placeholder={placeholder}
      />
    </div>
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

export default Screen40_Sectors;