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
  FileText,
  Wallet,
  Receipt,
  Paperclip,
  Loader2,
  Edit3,
  Trash2,
  Eye,
  Archive,
  Download,
  User,
  Banknote,
} from "lucide-react";
import { usePrivacy } from "../context/PrivacyContext";
import { AddPersonModal } from "../components/AddPersonModal";

const safeText = (val) => {
  if (val === null || val === undefined || val === "") return "—";
  if (typeof val === "object") {
    return val.ar || val.name || val.en || JSON.stringify(val);
  }
  return String(val);
};

const normalizeTransferMethods = (value) => {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed || trimmed === "[]" || trimmed === "{}") return [];

    try {
      const parsed = JSON.parse(trimmed);
      return normalizeTransferMethods(parsed);
    } catch {
      return trimmed
        .replace(/[\[\]"]/g, "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }

  return [String(value)];
};

const getPaymentMethodsLabel = (value) => {
  const methods = normalizeTransferMethods(value);
  return methods.length ? methods.join(" + ") : "—";
};

const formatPaymentMethods = (methods) => {
  if (!methods) return "—";

  if (typeof methods === "string") {
    try {
      return formatPaymentMethods(JSON.parse(methods));
    } catch {
      return methods.trim() || "—";
    }
  }

  if (Array.isArray(methods)) {
    return methods.filter(Boolean).join(" + ") || "—";
  }

  if (typeof methods === "object") {
    const labels = {
      cash: "نقدي",
      bank: "حساب بنكي",
      localBank: "حساب بنكي محلي",
      internationalBank: "حساب بنكي دولي",
      cheque: "شيك",
      transfer: "تحويل بنكي",
      cashNote: "ملاحظة نقدية",
      bankName: "اسم البنك",
      iban: "IBAN",
      accountNumber: "رقم الحساب",
    };

    const parts = Object.entries(methods)
      .filter(([, value]) => value !== "" && value !== null && value !== undefined && value !== false)
      .map(([key, value]) => (value === true ? labels[key] || key : `${labels[key] || key}: ${value}`));

    return parts.length ? parts.join(" + ") : "—";
  }

  return String(methods);
};

const DataCard = ({ label, value, dir = "rtl", icon: Icon }) => (
  <div className="rounded-xl border border-[#e8ddc8] bg-white p-3 shadow-[0_6px_16px_rgba(18,63,89,0.04)]">
    <div className="mb-1.5 flex items-center justify-between gap-2">
      <span className="text-[10px] font-black text-[#8da0bb]">{label}</span>
      {Icon && <Icon className="h-3.5 w-3.5 text-[#c5983c]" />}
    </div>
    <div className="truncate text-[13px] font-black text-[#123f59]" dir={dir} title={safeText(value)}>
      {safeText(value)}
    </div>
  </div>
);

const EmptyState = ({ title }) => (
  <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#e8ddc8] bg-white py-8 text-center">
    <Archive className="mb-2 h-9 w-9 text-[#cfd8e3]" />
    <span className="text-[12px] font-black text-[#8da0bb]">{title}</span>
  </div>
);

export default function PartnersPage() {
  const queryClient = useQueryClient();
  const { maskAmount } = usePrivacy();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterAgreement, setFilterAgreement] = useState("all");
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [activeTab, setActiveTab] = useState("data");

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [editingPerson, setEditingPerson] = useState(null);

  const [previewData, setPreviewData] = useState(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  const { data: partnersList = [], isLoading } = useQuery({
    queryKey: ["partners-directory"],
    queryFn: async () => {
      const res = await api.get("/persons");
      const allPersons = res.data?.data || [];
      return allPersons.filter((p) => p.role === "شريك");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => api.delete(`/persons/${id}`),
    onSuccess: () => {
      toast.success("تم الحذف بنجاح");
      queryClient.invalidateQueries(["partners-directory"]);
      queryClient.invalidateQueries(["persons-directory"]);
      if (selectedPerson) setSelectedPerson(null);
    },
    onError: (err) => toast.error(err.response?.data?.message || "حدث خطأ"),
  });

  const removeAttachmentMutation = useMutation({
    mutationFn: async ({ id, fileUrl }) => {
      const res = await api.put(`/persons/${id}/attachments/remove`, { fileUrl });
      return res.data;
    },
    onSuccess: (res) => {
      toast.success("تم حذف المرفق بنجاح");
      queryClient.invalidateQueries(["partners-directory"]);
      if (selectedPerson) {
        setSelectedPerson((prev) => ({
          ...prev,
          attachments: res.data?.attachments || prev.attachments,
        }));
      }
    },
  });

  const closePreview = () => {
    if (previewData) URL.revokeObjectURL(previewData.url);
    setPreviewData(null);
  };

  const filteredData = useMemo(() => {
    return partnersList.filter((p) => {
      const name = safeText(p.name);
      const phone = safeText(p.phone);
      const matchSearch =
        !searchQuery ||
        name.includes(searchQuery) ||
        phone.includes(searchQuery) ||
        safeText(p.personCode).includes(searchQuery);
      const matchAgreement =
        filterAgreement === "all" || p.agreementType === filterAgreement;
      return matchSearch && matchAgreement;
    });
  }, [partnersList, searchQuery, filterAgreement]);

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
    } catch {
      toast.error("فشل في تحميل المرفق.");
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const filterButtons = [
    { value: "all", label: "الكل" },
    { value: "نسبة", label: "نسبة مئوية" },
    { value: "مبلغ ثابت", label: "مبلغ ثابت" },
  ];

  return (
    <>
      <div
        className="flex h-full flex-col overflow-hidden bg-[radial-gradient(circle_at_top_left,#eef7f6,transparent_32%),linear-gradient(135deg,#fbf8f1_0%,#ffffff_48%,#f3f7f6_100%)] p-2.5 font-sans md:p-3"
        dir="rtl"
      >
        <div
          className="
            relative mb-2 shrink-0 overflow-hidden rounded-[22px]
            border border-[#c5983c]/25
            bg-gradient-to-l from-[#08111c] via-[#0f3448] to-[#123f59]
            p-2.5 shadow-[0_12px_32px_rgba(18,63,89,0.16)]
          "
        >
          <div className="pointer-events-none absolute right-[-55px] top-[-60px] h-32 w-32 rounded-full bg-[#e2bf74]/20 blur-3xl" />
          <div className="pointer-events-none absolute left-[-60px] bottom-[-70px] h-36 w-36 rounded-full bg-cyan-300/15 blur-3xl" />

          <div className="relative z-10 flex flex-col gap-2 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => window.history.back()}
                className="
                  inline-flex h-9 items-center gap-2 rounded-xl
                  border border-white/15 bg-white/10 px-3 text-[11px] font-black text-[#e2bf74]
                  transition hover:bg-white/15
                "
                type="button"
              >
                <span>رجوع</span>
              </button>

              <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#e2bf74] text-[#08111c]">
                <Handshake className="h-5 w-5" />
              </div>

              <div>
                <h1 className="text-lg font-black leading-tight text-white">
                  سجل الشركاء
                </h1>
                <p className="mt-0.5 text-[11px] font-bold leading-tight text-white/55">
                  {filteredData.length} شريك ظاهر من أصل {partnersList.length} شريك مسجل في النظام
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-full sm:w-auto">
                <Search className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/45" />
                <input
                  type="text"
                  placeholder="بحث بالاسم أو الجوال..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="
                    h-9 w-full sm:w-[240px] rounded-xl border border-white/15 bg-white/10
                    pr-9 pl-3 text-[11px] font-bold text-white outline-none
                    placeholder:text-white/45 focus:border-[#e2bf74]/70 focus:bg-white/15
                  "
                />
              </div>

              <button
                onClick={() => {
                  setModalMode("add");
                  setEditingPerson(null);
                  setIsAddOpen(true);
                }}
                className="
                  flex h-9 items-center gap-2 rounded-xl
                  bg-white px-3.5 text-[11px] font-black text-[#123f59]
                  shadow-[0_10px_24px_rgba(255,255,255,0.12)]
                  transition hover:-translate-y-0.5 hover:bg-[#fbf8f1]
                "
                type="button"
              >
                <Plus className="h-3.5 w-3.5 text-[#c5983c]" />
                تسجيل شريك جديد
              </button>
            </div>
          </div>
        </div>

        <div className="mb-2 flex shrink-0 flex-wrap items-center gap-1.5 rounded-[18px] border border-[#d8b46a]/25 bg-white/80 px-3 py-2 shadow-sm">
          <span className="ml-1 text-[10px] font-black text-[#64748b]">
            نوع الاتفاق المالي:
          </span>

          {filterButtons.map((button) => (
            <button
              key={button.value}
              type="button"
              onClick={() => setFilterAgreement(button.value)}
              className={`rounded-xl border px-3 py-1.5 text-[10px] font-black transition ${
                filterAgreement === button.value
                  ? "border-[#123f59] bg-[#123f59] text-white shadow-[0_8px_20px_rgba(18,63,89,0.16)]"
                  : "border-[#e8ddc8] bg-white text-[#123f59] hover:bg-[#fbf8f1]"
              }`}
            >
              {button.label}
            </button>
          ))}
        </div>

        <div
          className="
            min-h-0 flex-1 overflow-hidden rounded-[20px]
            border border-[#d8b46a]/30 bg-white
            shadow-[0_10px_28px_rgba(18,63,89,0.08)]
          "
        >
          <div className="custom-scrollbar-slim h-full overflow-y-auto overflow-x-auto md:overflow-x-hidden">
            <table dir="rtl" className="w-full min-w-[680px] table-fixed text-right text-[12px] md:min-w-0">
              <colgroup>
                <col className="w-[32%]" />
                <col className="w-[15%]" />
                <col className="w-[15%]" />
                <col className="w-[18%]" />
                <col className="w-[20%]" />
              </colgroup>

              <thead className="sticky top-0 z-10 bg-[#0f3448] text-white shadow-sm">
                <tr className="h-[36px]">
                  <th className="border-l border-white/10 px-2 text-[10px] font-black">
                    اسم الشريك
                  </th>
                  <th className="border-l border-white/10 px-2 text-[10px] font-black">
                    الجوال
                  </th>
                  <th className="border-l border-white/10 px-2 text-[10px] font-black">
                    نوع الاتفاق
                  </th>
                  <th className="border-l border-white/10 px-2 text-[10px] font-black">
                    طرق الدفع
                  </th>
                  <th className="px-1.5 text-center text-[10px] font-black">
                    إجراءات
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#e8ddc8]/70">
                {isLoading ? (
                  <tr>
                    <td colSpan="5" className="py-10 text-center">
                      <Loader2 className="mx-auto h-7 w-7 animate-spin text-[#c5983c]" />
                    </td>
                  </tr>
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-12 text-center">
                      <div className="mx-auto mb-3 grid h-16 w-16 place-items-center rounded-3xl border border-[#d8b46a]/35 bg-[#f8efe0] text-[#c5983c]">
                        <Archive className="h-8 w-8" />
                      </div>
                      <p className="text-sm font-black text-[#123f59]">
                        لا يوجد شركاء مسجلين
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredData.map((row, idx) => {
                    const methodsLabel = getPaymentMethodsLabel(row.transferMethod);

                    return (
                      <tr
                        key={row.id}
                        className={`h-[40px] transition-colors hover:bg-cyan-50/45 ${
                          idx % 2 === 1 ? "bg-[#fbf8f1]/55" : "bg-white"
                        }`}
                      >
                        <td className="border-l border-[#e8ddc8]/70 px-2">
                          <div className="flex items-center gap-2">
                            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[#123f59] text-white">
                              <Handshake className="h-3.5 w-3.5 text-[#e2bf74]" />
                            </span>

                            <div className="min-w-0">
                              <div className="truncate text-[12px] font-black text-[#123f59]">
                                {safeText(row.name)}
                              </div>

                              <span className="mt-1 inline-block rounded-xl border border-cyan-200 bg-cyan-50 px-2 py-0.5 text-[9px] font-black text-cyan-700">
                                شريك
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="border-l border-[#e8ddc8]/70 px-2 font-mono text-[10px] font-bold text-[#334155]" dir="ltr">
                          {safeText(row.phone)}
                        </td>

                        <td className="border-l border-[#e8ddc8]/70 px-2">
                          <span className="inline-flex items-center rounded-xl border border-[#e8ddc8] bg-[#fbf8f1] px-2 py-1 text-[10px] font-black text-[#123f59]">
                            {safeText(row.agreementType)}
                          </span>
                        </td>

                        <td
                          className="border-l border-[#e8ddc8]/70 px-2 text-[10px] font-black text-[#0e7490]"
                          title={methodsLabel}
                        >
                          <span className="block truncate">{methodsLabel}</span>
                        </td>

                        <td className="px-1.5 text-center">
                          <div className="flex flex-wrap items-center justify-center gap-1">
                            <button
                              onClick={() => {
                                setSelectedPerson(row);
                                setActiveTab("data");
                              }}
                              className="inline-flex h-6 items-center gap-0.5 rounded-lg bg-cyan-50 px-1.5 text-[8px] font-black text-cyan-700 transition hover:bg-cyan-600 hover:text-white"
                              title="عرض التفاصيل"
                              type="button"
                            >
                              <Eye className="h-2.5 w-2.5" />
                              عرض
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setModalMode("edit");
                                setEditingPerson(row);
                                setIsAddOpen(true);
                              }}
                              className="inline-flex h-6 items-center gap-0.5 rounded-lg bg-amber-50 px-1.5 text-[8px] font-black text-amber-600 transition hover:bg-amber-500 hover:text-white"
                              title="تعديل"
                              type="button"
                            >
                              <Edit3 className="h-2.5 w-2.5" />
                              تعديل
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm("متأكد من حذف الشريك؟")) {
                                  deleteMutation.mutate(row.id);
                                }
                              }}
                              className="inline-flex h-6 items-center gap-0.5 rounded-lg bg-rose-50 px-1.5 text-[8px] font-black text-rose-600 transition hover:bg-rose-500 hover:text-white"
                              title="حذف"
                              type="button"
                            >
                              <Trash2 className="h-2.5 w-2.5" />
                              حذف
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
          type="شريك"
          mode={modalMode}
          personData={editingPerson}
          onClose={() => setIsAddOpen(false)}
        />
      )}

      {selectedPerson && (
        <div
          className="fixed inset-0 z-[50] flex items-center justify-center bg-black/60 p-3 animate-in fade-in"
          dir="rtl"
          onClick={() => setSelectedPerson(null)}
        >
          <div
            className="flex h-[84vh] w-full max-w-5xl flex-col overflow-hidden rounded-[24px] border border-[#d8b46a]/25 bg-white shadow-[0_24px_70px_rgba(2,12,23,0.28)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative shrink-0 overflow-hidden bg-gradient-to-l from-[#08111c] via-[#0f3448] to-[#123f59] px-5 py-3 text-white">
              <div className="flex items-center justify-between gap-3" style={{ direction: "ltr" }}>
                <button
                  onClick={() => setSelectedPerson(null)}
                  className="inline-flex h-9 items-center gap-2 rounded-xl bg-white/10 px-3 text-[11px] font-black text-white transition hover:bg-rose-500"
                  type="button"
                >
                  <X className="h-5 w-5" />
                  إغلاق
                </button>

                <div className="flex min-w-0 items-center gap-3 text-right" dir="rtl">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#e2bf74] text-[#08111c]">
                    <Handshake className="h-5 w-5" />
                  </div>

                  <div className="min-w-0">
                    <h2 className="truncate text-[17px] font-black">
                      {safeText(selectedPerson.name)}
                    </h2>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="rounded-lg bg-white/10 px-2 py-0.5 text-[10px] font-black text-white/75">
                        {safeText(selectedPerson.personCode)}
                      </span>
                      <span className="rounded-lg bg-[#e2bf74] px-2 py-0.5 text-[10px] font-black text-[#08111c]">
                        شريك
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex shrink-0 overflow-x-auto border-b border-[#e8ddc8]/70 bg-white custom-scrollbar-slim">
              {[
                { id: "data", label: "بيانات الشريك", icon: User },
                { id: "transactions", label: "المعاملات المرتبطة", icon: FileText },
                { id: "settlements", label: "تسويات الشريك", icon: Handshake },
                { id: "collections", label: "التحصيلات", icon: Wallet },
                { id: "disbursements", label: "المنصرفات", icon: Receipt },
                { id: "attachments", label: "المرفقات", icon: Paperclip },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex cursor-pointer items-center gap-2 whitespace-nowrap border-b-2 px-4 py-2.5 text-[11px] font-black transition-all ${
                    activeTab === tab.id
                      ? "border-[#0e7490] bg-[#eef7f6]/45 text-[#0e7490]"
                      : "border-transparent text-[#8da0bb] hover:bg-[#fbf8f1] hover:text-[#123f59]"
                  }`}
                  type="button"
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            <div className="relative flex-1 overflow-y-auto bg-[linear-gradient(135deg,#fbf8f1_0%,#ffffff_55%,#f3f7f6_100%)] p-4">
              {activeTab === "data" && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    <DataCard label="رقم التواصل" value={selectedPerson.phone} dir="ltr" icon={Phone} />
                    <DataCard label="نوع الاتفاق" value={selectedPerson.agreementType} icon={Banknote} />
                    <DataCard label="الدولة" value={selectedPerson.country || "غير محدد"} />
                    <DataCard label="رقم الهوية" value={selectedPerson.idNumber || "غير محدد"} dir="ltr" />
                  </div>

                  <div className="rounded-xl border border-[#e8ddc8] bg-white p-4 shadow-[0_6px_16px_rgba(18,63,89,0.04)]">
                    <div className="mb-2 text-[10px] font-black uppercase text-[#8da0bb]">
                      طرق الدفع والاستلام المفضلة
                    </div>

                    {normalizeTransferMethods(selectedPerson.transferMethod).length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {normalizeTransferMethods(selectedPerson.transferMethod).map((method) => (
                          <span
                            key={method}
                            className="rounded-xl border border-[#0e7490]/15 bg-[#eef7f6] px-3 py-1.5 text-[12px] font-black text-[#0e7490]"
                          >
                            {method}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-xl border border-dashed border-[#e8ddc8] bg-[#fbf8f1] px-3 py-2 text-[12px] font-bold text-[#8da0bb]">
                        غير محدد
                      </div>
                    )}

                    {selectedPerson.transferDetails &&
                      formatPaymentMethods(selectedPerson.transferDetails) !== "—" && (
                        <div
                          className="mt-3 rounded-xl border border-[#e8ddc8] bg-[#fbf8f1] px-3 py-2 text-[12px] font-bold leading-relaxed text-[#60738f]"
                          dir="rtl"
                        >
                          {formatPaymentMethods(selectedPerson.transferDetails)}
                        </div>
                      )}
                  </div>

                  <div className="rounded-xl border border-[#e8ddc8] bg-white p-4 shadow-[0_6px_16px_rgba(18,63,89,0.04)]">
                    <div className="mb-2 text-[10px] font-black uppercase text-[#8da0bb]">
                      ملاحظات مسجلة
                    </div>
                    <div className="whitespace-pre-wrap text-[13px] font-semibold leading-relaxed text-[#60738f]">
                      {selectedPerson.notes || "لا توجد ملاحظات."}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "transactions" && (
                <div className="overflow-hidden rounded-xl border border-[#e8ddc8] bg-white shadow-sm animate-in fade-in">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-[#0f3448] text-white">
                      <tr>
                        <th className="px-4 py-3 font-black">المرجع</th>
                        <th className="px-4 py-3 font-black">النوع</th>
                        <th className="px-4 py-3 font-black">الدور</th>
                        <th className="px-4 py-3 font-black">الأتعاب</th>
                        <th className="px-4 py-3 font-black">التاريخ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {!selectedPerson.stakeholderTransactions ||
                      selectedPerson.stakeholderTransactions.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="py-8 text-center font-bold text-[#8da0bb]">
                            لا توجد معاملات مرتبطة كصاحب مصلحة / شريك
                          </td>
                        </tr>
                      ) : (
                        selectedPerson.stakeholderTransactions.map((tx) => (
                          <tr key={tx.id} className="border-b border-[#e8ddc8]/60 hover:bg-[#fbf8f1]">
                            <td className="px-4 py-3 font-mono font-bold text-[#0e7490]">
                              {tx.transactionCode}
                            </td>
                            <td className="px-4 py-3 font-bold text-[#60738f]">
                              {tx.category || "عامة"}
                            </td>
                            <td className="px-4 py-3 font-bold text-[#8da0bb]">
                              شريك / صاحب مصلحة
                            </td>
                            <td className="px-4 py-3 font-bold text-[#60738f]">—</td>
                            <td className="px-4 py-3 font-mono text-[#8da0bb]">
                              {new Date(tx.createdAt).toLocaleDateString("ar-SA")}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === "settlements" && (
                <div className="overflow-hidden rounded-xl border border-[#e8ddc8] bg-white shadow-sm animate-in fade-in">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-[#0f3448] text-white">
                      <tr>
                        <th className="px-4 py-3 font-black">التاريخ</th>
                        <th className="px-4 py-3 font-black">المبلغ</th>
                        <th className="px-4 py-3 font-black">المصدر</th>
                        <th className="px-4 py-3 font-black">الحالة</th>
                      </tr>
                    </thead>
                    <tbody>
                      {!selectedPerson.settlementsTarget ||
                      selectedPerson.settlementsTarget.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="py-8 text-center font-bold text-[#8da0bb]">
                            لا توجد تسويات مالية
                          </td>
                        </tr>
                      ) : (
                        selectedPerson.settlementsTarget.map((s) => (
                          <tr key={s.id} className="border-b border-[#e8ddc8]/60 hover:bg-[#fbf8f1]">
                            <td className="px-4 py-3 font-mono text-[#8da0bb]">
                              {new Date(s.createdAt).toLocaleDateString("ar-SA")}
                            </td>
                            <td className="px-4 py-3 font-mono font-bold text-green-600">
                              {maskAmount ? maskAmount(s.amount) : s.amount?.toLocaleString()} ر.س
                            </td>
                            <td className="px-4 py-3 font-bold text-[#60738f]">{s.source}</td>
                            <td className="px-4 py-3">
                              <span className="rounded bg-green-100 px-2 py-1 text-[10px] font-bold text-green-700">
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

              {activeTab === "collections" && (
                <div className="overflow-hidden rounded-xl border border-[#e8ddc8] bg-white shadow-sm animate-in fade-in">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-[#0f3448] text-white">
                      <tr>
                        <th className="px-4 py-3 font-black">التاريخ</th>
                        <th className="px-4 py-3 font-black">المبلغ</th>
                        <th className="px-4 py-3 font-black">المرجع</th>
                        <th className="px-4 py-3 font-black">الطريقة</th>
                      </tr>
                    </thead>
                    <tbody>
                      {!selectedPerson.paymentsCollected ||
                      selectedPerson.paymentsCollected.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="py-8 text-center font-bold text-[#8da0bb]">
                            لا توجد تحصيلات مسجلة
                          </td>
                        </tr>
                      ) : (
                        selectedPerson.paymentsCollected.map((payment) => (
                          <tr key={payment.id} className="border-b border-[#e8ddc8]/60 hover:bg-[#fbf8f1]">
                            <td className="px-4 py-3 font-mono text-[#8da0bb]">
                              {new Date(payment.date).toLocaleDateString("ar-SA")}
                            </td>
                            <td className="px-4 py-3 font-mono font-bold text-[#0e7490]">
                              {maskAmount ? maskAmount(payment.amount) : payment.amount?.toLocaleString()} ر.س
                            </td>
                            <td className="px-4 py-3 font-bold text-[#60738f]">
                              {payment.periodRef || "—"}
                            </td>
                            <td className="px-4 py-3 font-bold text-[#8da0bb]">
                              {payment.method}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === "disbursements" && (
                <div className="overflow-hidden rounded-xl border border-[#e8ddc8] bg-white shadow-sm animate-in fade-in">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-[#0f3448] text-white">
                      <tr>
                        <th className="px-4 py-3 font-black">التاريخ</th>
                        <th className="px-4 py-3 font-black">المبلغ</th>
                        <th className="px-4 py-3 font-black">السبب/النوع</th>
                        <th className="px-4 py-3 font-black">ملاحظات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {!selectedPerson.disbursements ||
                      selectedPerson.disbursements.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="py-8 text-center font-bold text-[#8da0bb]">
                            لا توجد منصرفات أو سلف
                          </td>
                        </tr>
                      ) : (
                        selectedPerson.disbursements.map((item) => (
                          <tr key={item.id} className="border-b border-[#e8ddc8]/60 hover:bg-[#fbf8f1]">
                            <td className="px-4 py-3 font-mono text-[#8da0bb]">
                              {new Date(item.date).toLocaleDateString("ar-SA")}
                            </td>
                            <td className="px-4 py-3 font-mono font-bold text-red-600">
                              {maskAmount ? maskAmount(item.amount) : item.amount?.toLocaleString()} ر.س
                            </td>
                            <td className="px-4 py-3 font-bold text-[#60738f]">
                              {item.type}
                            </td>
                            <td className="px-4 py-3 font-semibold text-[#8da0bb]">
                              {item.notes}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === "attachments" && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between rounded-xl border border-[#e8ddc8] bg-white p-4 shadow-sm">
                    <div>
                      <h3 className="text-sm font-black text-[#123f59]">
                        مرفقات ووثائق الشخص
                      </h3>
                      <p className="mt-1 text-xs font-semibold text-[#8da0bb]">
                        يمكنك عرض الملفات المرفقة أو حذفها من هنا.
                      </p>
                    </div>
                  </div>

                  {!selectedPerson.attachments || selectedPerson.attachments.length === 0 ? (
                    <EmptyState title="لا توجد مرفقات محفوظة" />
                  ) : (
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                      {selectedPerson.attachments.map((file, index) => (
                        <div
                          key={index}
                          className="flex flex-col items-center rounded-xl border border-[#e8ddc8] bg-white p-4 text-center shadow-sm transition hover:border-[#0e7490]"
                        >
                          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-[#fbf8f1] text-[#0e7490]">
                            <FileText className="h-6 w-6" />
                          </div>
                          <span
                            className="mb-3 w-full truncate text-xs font-bold text-[#60738f]"
                            title={file.name}
                          >
                            {file.name}
                          </span>
                          <div className="flex w-full items-center gap-2">
                            <button
                              onClick={(e) => handleViewAttachment(e, file.url)}
                              className="flex-1 rounded-md bg-[#eef7f6] py-1.5 text-[10px] font-bold text-[#0e7490] transition hover:bg-[#0e7490] hover:text-white"
                              type="button"
                            >
                              معاينة
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm("هل تريد حذف المرفق؟")) {
                                  removeAttachmentMutation.mutate({
                                    id: selectedPerson.id,
                                    fileUrl: file.url,
                                  });
                                }
                              }}
                              className="inline-flex items-center gap-1 rounded-md bg-red-50 px-2 py-1.5 text-[10px] font-black text-red-500 transition hover:bg-red-500 hover:text-white"
                              type="button"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              حذف
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {isPreviewLoading && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center bg-black/40">
          <Loader2 className="h-10 w-10 animate-spin text-white" />
        </div>
      )}

      {previewData && (
        <div
          className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 p-4 animate-in fade-in"
          dir="rtl"
          onClick={closePreview}
        >
          <div
            className="flex h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex shrink-0 items-center justify-between border-b border-[#e8ddc8] bg-[#fbf8f1] px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#eef7f6]">
                  <Eye className="h-4 w-4 text-[#0e7490]" />
                </div>
                <span className="text-[16px] font-bold text-[#123f59]">
                  معاينة المستند
                </span>
              </div>
              <div className="flex gap-2">
                <a
                  href={previewData.url}
                  download
                  className="inline-flex items-center gap-2 rounded-lg border border-[#e8ddc8] bg-white px-3 py-2 text-[11px] font-black text-[#60738f] transition hover:bg-[#eef7f6]"
                  title="تحميل"
                >
                  <Download className="h-4 w-4" />
                  تحميل
                </a>
                <button
                  onClick={closePreview}
                  className="inline-flex items-center gap-2 rounded-lg border border-[#e8ddc8] bg-white px-3 py-2 text-[11px] font-black text-[#8da0bb] transition hover:text-red-500"
                  type="button"
                >
                  <X className="h-4 w-4" />
                  إغلاق
                </button>
              </div>
            </div>

            <div className="flex flex-1 items-center justify-center overflow-hidden bg-gray-200 p-6">
              {previewData.isPdf ? (
                <iframe
                  src={previewData.url}
                  className="h-full w-full rounded-xl border border-gray-300 bg-white shadow-lg"
                  title="PDF Preview"
                />
              ) : (
                <img
                  src={previewData.url}
                  alt="مرفق"
                  className="max-h-full max-w-full rounded-xl border border-gray-300 bg-white object-contain shadow-lg"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
