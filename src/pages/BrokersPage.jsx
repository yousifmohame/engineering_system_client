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
  Globe,
  User,
  Lock,
  Archive,
  Download,
  ChevronRight,
  Settings,
  ShieldCheck,
  Banknote,
} from "lucide-react";
import { usePrivacy } from "../context/PrivacyContext";
import { AddPersonModal } from "../components/AddPersonModal";

const safeText = (val) => {
  if (val === null || val === undefined) return "—";
  if (typeof val === "object") {
    return val.ar || val.name || val.en || JSON.stringify(val);
  }
  return String(val);
};

const getPaymentMethodsLabel = (transferMethod) => {
  if (!transferMethod) return "—";

  try {
    const parsed = JSON.parse(transferMethod);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed.join(" + ");
  } catch (e) {
    return transferMethod;
  }

  return transferMethod;
};

const DataCard = ({ label, value, icon: Icon, tone = "blue", dir }) => {
  const tones = {
    blue: {
      box: "border-[#123f59]/20 bg-[#f8fafc]",
      icon: "bg-[#123f59] text-[#e2bf74]",
      label: "text-[#64748b]",
      value: "text-[#123f59]",
    },
    gold: {
      box: "border-[#d8b46a]/35 bg-[#fbf8f1]",
      icon: "bg-[#f8efe0] text-[#c5983c]",
      label: "text-[#64748b]",
      value: "text-[#123f59]",
    },
    emerald: {
      box: "border-emerald-300/45 bg-emerald-50/70",
      icon: "bg-emerald-600 text-white",
      label: "text-emerald-700",
      value: "text-emerald-950",
    },
    rose: {
      box: "border-rose-300/45 bg-rose-50/70",
      icon: "bg-rose-500 text-white",
      label: "text-rose-700",
      value: "text-rose-950",
    },
  };

  const t = tones[tone] || tones.blue;

  return (
    <div className={`rounded-2xl border p-4 shadow-sm ${t.box}`}>
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className={`text-[10px] font-black uppercase ${t.label}`}>
          {label}
        </div>

        {Icon && (
          <span className={`grid h-9 w-9 place-items-center rounded-2xl ${t.icon}`}>
            <Icon className="h-4 w-4" />
          </span>
        )}
      </div>

      <div
        className={`truncate text-sm font-black ${t.value}`}
        dir={dir || "rtl"}
        title={safeText(value)}
      >
        {safeText(value)}
      </div>
    </div>
  );
};

export default function BrokersPage() {
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
    return brokersList.filter((p) => {
      const name = safeText(p.name);
      const phone = safeText(p.phone);

      const matchSearch =
        name.includes(searchQuery) || phone.includes(searchQuery);

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

  const filterButtonClass = (active) =>
    active
      ? "border-[#c5983c]/45 bg-[#123f59] text-white shadow-[0_10px_24px_rgba(18,63,89,0.18)]"
      : "border-[#d8b46a]/25 bg-white text-[#123f59] hover:border-[#c5983c]/45 hover:bg-[#f8efe0]";

  const tabs = [
    { id: "data", label: "بيانات الوسيط", icon: User },
    { id: "transactions", label: "المعاملات المرتبطة", icon: FileText },
    { id: "settlements", label: "تسويات الوسيط", icon: Handshake },
    { id: "collections", label: "التحصيلات", icon: Wallet },
    { id: "disbursements", label: "المنصرفات", icon: Receipt },
    { id: "attachments", label: "المرفقات", icon: Paperclip },
  ];

  return (
    <>
      <div
        className="
          flex h-full flex-col overflow-hidden
          bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white
          p-4 font-sans md:p-5
        "
        dir="rtl"
      >
        {/* Header */}
        <div
          className="
            relative mb-4 shrink-0 overflow-hidden rounded-[26px]
            border border-[#c5983c]/25
            bg-gradient-to-l from-[#08111c] via-[#0f3448] to-[#123f59]
            p-4 shadow-[0_20px_55px_rgba(18,63,89,0.20)]
          "
        >
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute right-[-70px] top-[-70px] h-44 w-44 rounded-full bg-[#c5983c]/18 blur-3xl" />
            <div className="absolute left-[-80px] bottom-[-80px] h-52 w-52 rounded-full bg-cyan-400/12 blur-3xl" />
          </div>

          <div className="relative z-10 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center gap-3">
              <button
                className="
                  grid h-11 w-11 place-items-center rounded-2xl
                  border border-white/15 bg-white/10 text-[#e2bf74]
                  transition hover:bg-white/15
                "
                type="button"
              >
                <ChevronRight className="h-5 w-5" />
              </button>

              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#e2bf74] text-[#123f59] shadow-sm">
                <Handshake className="h-6 w-6" />
              </div>

              <div>
                <h2 className="text-xl font-black text-white">
                  سجل الوسطاء والمسوقين
                </h2>
                <p className="mt-1 text-xs font-bold text-white/55">
                  {brokersList.length} وسيط مسجل في النظام
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#c5983c]" />

                <input
                  type="text"
                  placeholder="بحث بالاسم أو الجوال..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="
                    h-11 w-[260px] rounded-2xl border border-white/15
                    bg-white/10 pr-10 pl-3 text-xs font-bold text-white
                    outline-none backdrop-blur-xl transition
                    placeholder:text-white/45
                    focus:border-[#e2bf74]/60 focus:bg-white/15
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
                  flex h-11 items-center gap-2 rounded-2xl
                  bg-white px-4 text-xs font-black text-[#123f59]
                  shadow-[0_12px_30px_rgba(255,255,255,0.14)]
                  transition hover:-translate-y-[1px] hover:bg-[#fbf8f1]
                "
                type="button"
              >
                <Plus className="h-4 w-4 text-[#c5983c]" />
                تسجيل وسيط جديد
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-4 flex shrink-0 flex-wrap items-center gap-2">
          <span className="ml-1 text-[11px] font-black text-[#64748b]">
            نوع الاتفاق المالي:
          </span>

          <button
            onClick={() => setFilterAgreement("all")}
            className={`rounded-2xl border px-3 py-2 text-[11px] font-black transition-all ${filterButtonClass(
              filterAgreement === "all",
            )}`}
            type="button"
          >
            الكل
          </button>

          <button
            onClick={() => setFilterAgreement("نسبة")}
            className={`rounded-2xl border px-3 py-2 text-[11px] font-black transition-all ${filterButtonClass(
              filterAgreement === "نسبة",
            )}`}
            type="button"
          >
            نسبة مئوية
          </button>

          <button
            onClick={() => setFilterAgreement("مبلغ ثابت")}
            className={`rounded-2xl border px-3 py-2 text-[11px] font-black transition-all ${filterButtonClass(
              filterAgreement === "مبلغ ثابت",
            )}`}
            type="button"
          >
            مبلغ ثابت
          </button>
        </div>

        {/* Main Table */}
        <div
          className="
            min-h-0 flex-1 overflow-hidden rounded-[26px]
            border border-[#d8b46a]/30 bg-white
            shadow-[0_18px_45px_rgba(18,63,89,0.10)]
          "
        >
          <div className="custom-scrollbar-slim h-full overflow-auto">
            <table className="w-full min-w-[880px] text-right text-[12px]">
              <thead className="sticky top-0 z-10 bg-[#0f3448] text-white">
                <tr className="h-[44px]">
                  <th className="border-l border-white/10 px-4 text-[11px] font-black">
                    اسم الوسيط
                  </th>
                  <th className="border-l border-white/10 px-4 text-[11px] font-black">
                    الجوال
                  </th>
                  <th className="border-l border-white/10 px-4 text-[11px] font-black">
                    نوع الاتفاق
                  </th>
                  <th className="border-l border-white/10 px-4 text-[11px] font-black">
                    طرق الدفع
                  </th>
                  <th className="px-4 text-center text-[11px] font-black">
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
                        لا يوجد وسطاء مسجلين
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredData.map((row, idx) => {
                    const methodsLabel = getPaymentMethodsLabel(row.transferMethod);

                    return (
                      <tr
                        key={row.id}
                        className={`h-[48px] transition-colors hover:bg-cyan-50/45 ${
                          idx % 2 === 1 ? "bg-[#fbf8f1]/55" : "bg-white"
                        }`}
                      >
                        <td className="border-l border-[#e8ddc8]/70 px-4">
                          <div className="flex items-center gap-2">
                            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-[#123f59] text-white">
                              <User className="h-4 w-4 text-[#e2bf74]" />
                            </span>

                            <div className="min-w-0">
                              <div className="truncate text-[12px] font-black text-[#123f59]">
                                {safeText(row.name)}
                              </div>

                              {row.role === "وسيط المكتب الهندسي" && (
                                <span className="mt-1 inline-block rounded-xl border border-cyan-200 bg-cyan-50 px-2 py-0.5 text-[9px] font-black text-cyan-700">
                                  مكتب هندسي
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        <td
                          className="border-l border-[#e8ddc8]/70 px-4 font-mono text-[11px] font-black text-[#334155]"
                          dir="ltr"
                        >
                          {safeText(row.phone)}
                        </td>

                        <td className="border-l border-[#e8ddc8]/70 px-4">
                          <span className="rounded-xl border border-[#d8b46a]/35 bg-[#f8efe0] px-2.5 py-1 text-[10px] font-black text-[#123f59]">
                            {safeText(row.agreementType)}
                          </span>
                        </td>

                        <td
                          className="max-w-[180px] truncate border-l border-[#e8ddc8]/70 px-4 text-[10px] font-black text-cyan-700"
                          title={methodsLabel}
                        >
                          {methodsLabel}
                        </td>

                        <td className="px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => {
                                setSelectedPerson(row);
                                setActiveTab("data");
                              }}
                              className="grid h-8 w-8 place-items-center rounded-xl bg-cyan-50 text-cyan-700 transition hover:bg-cyan-600 hover:text-white"
                              title="عرض التفاصيل"
                              type="button"
                            >
                              <Eye className="h-4 w-4" />
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setModalMode("edit");
                                setEditingPerson(row);
                                setIsAddOpen(true);
                              }}
                              className="grid h-8 w-8 place-items-center rounded-xl bg-amber-50 text-amber-600 transition hover:bg-amber-500 hover:text-white"
                              title="تعديل"
                              type="button"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm("متأكد من حذف الوسيط؟")) {
                                  deleteMutation.mutate(row.id);
                                }
                              }}
                              className="grid h-8 w-8 place-items-center rounded-xl bg-rose-50 text-rose-600 transition hover:bg-rose-500 hover:text-white"
                              title="حذف"
                              type="button"
                            >
                              <Trash2 className="h-4 w-4" />
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
          mode={modalMode}
          personData={editingPerson}
          onClose={() => setIsAddOpen(false)}
        />
      )}

      {/* Details Modal */}
      {selectedPerson && (
        <div
          className="fixed inset-0 z-[50] flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm animate-in fade-in"
          dir="rtl"
          onClick={() => setSelectedPerson(null)}
        >
          <div
            className="
              flex h-[85vh] w-full max-w-5xl flex-col overflow-hidden
              rounded-[30px] border border-[#d8b46a]/30 bg-white
              shadow-[0_28px_80px_rgba(15,23,42,0.34)]
            "
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="relative shrink-0 overflow-hidden bg-gradient-to-l from-[#08111c] via-[#0f3448] to-[#123f59] px-6 py-5 text-white">
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute right-[-70px] top-[-70px] h-44 w-44 rounded-full bg-[#c5983c]/18 blur-3xl" />
                <div className="absolute left-[-80px] bottom-[-80px] h-52 w-52 rounded-full bg-cyan-400/12 blur-3xl" />
              </div>

              <div className="relative z-10 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="grid h-14 w-14 place-items-center rounded-3xl bg-[#e2bf74] text-[#123f59] shadow-sm">
                    <span className="text-xl font-black">
                      {safeText(selectedPerson.name).charAt(0)}
                    </span>
                  </div>

                  <div>
                    <div className="text-xl font-black">
                      {safeText(selectedPerson.name)}
                    </div>

                    <div className="mt-2 flex items-center gap-2">
                      <span className="rounded-xl border border-white/15 bg-white/10 px-2.5 py-1 text-[11px] font-black text-[#e2bf74]">
                        {safeText(selectedPerson.role)}
                      </span>

                      <span className="font-mono text-[11px] font-bold text-white/55">
                        {safeText(selectedPerson.personCode)}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedPerson(null)}
                  className="grid h-10 w-10 place-items-center rounded-2xl bg-white/10 text-white transition hover:bg-rose-500"
                  type="button"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="custom-scrollbar-slim flex shrink-0 overflow-x-auto border-b border-[#e8ddc8] bg-[#fbf8f1] px-2">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 border-b-2 px-5 py-3.5 text-xs font-black transition-all ${
                      isActive
                        ? "border-[#c5983c] text-[#123f59]"
                        : "border-transparent text-[#64748b] hover:bg-white hover:text-[#123f59]"
                    }`}
                    type="button"
                  >
                    <tab.icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Content */}
            <div className="custom-scrollbar-slim relative flex-1 overflow-y-auto bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white p-6">
              {activeTab === "data" && (
                <div className="space-y-6 animate-in fade-in">
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    <DataCard
                      label="رقم التواصل"
                      value={selectedPerson.phone}
                      icon={Phone}
                      tone="blue"
                      dir="ltr"
                    />

                    <DataCard
                      label="نوع الاتفاق"
                      value={selectedPerson.agreementType}
                      icon={Handshake}
                      tone="gold"
                    />

                    <DataCard
                      label="الدولة"
                      value={selectedPerson.country || "غير محدد"}
                      icon={Globe}
                      tone="emerald"
                    />

                    <DataCard
                      label="رقم الهوية"
                      value={selectedPerson.idNumber || "غير محدد"}
                      icon={ShieldCheck}
                      tone="blue"
                      dir="ltr"
                    />
                  </div>

                  <div className="rounded-2xl border border-[#d8b46a]/35 bg-white p-5 shadow-sm">
                    <div className="mb-3 flex items-center gap-2">
                      <span className="grid h-9 w-9 place-items-center rounded-2xl bg-[#f8efe0] text-[#c5983c]">
                        <Banknote className="h-4 w-4" />
                      </span>

                      <div>
                        <div className="text-xs font-black text-[#123f59]">
                          طرق الدفع والاستلام المفضلة
                        </div>

                        <div className="mt-1 text-sm font-black text-cyan-700">
                          {selectedPerson.transferMethod
                            ? selectedPerson.transferMethod
                                .replace(/[\[\]"]/g, "")
                                .replace(/,/g, " + ")
                            : "غير محدد"}
                        </div>
                      </div>
                    </div>

                    {selectedPerson.transferDetails &&
                      Object.keys(selectedPerson.transferDetails).length > 0 && (
                        <pre
                          className="mt-3 rounded-2xl border border-[#e8ddc8] bg-[#fbf8f1] p-4 font-mono text-xs font-bold text-[#334155]"
                          dir="ltr"
                        >
                          {JSON.stringify(selectedPerson.transferDetails, null, 2)}
                        </pre>
                      )}
                  </div>

                  <div className="rounded-2xl border border-[#d8b46a]/35 bg-white p-5 shadow-sm">
                    <div className="mb-2 text-xs font-black text-[#123f59]">
                      ملاحظات مسجلة
                    </div>

                    <div className="whitespace-pre-wrap text-sm font-semibold leading-relaxed text-[#334155]">
                      {selectedPerson.notes || "لا توجد ملاحظات."}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "transactions" && (
                <SimpleTable
                  columns={["المرجع", "النوع", "الدور", "الأتعاب", "التاريخ"]}
                  emptyText="لا توجد معاملات مرتبطة"
                  rows={selectedPerson.brokeredTransactions}
                  renderRow={(tx) => (
                    <tr
                      key={tx.id}
                      className="border-b border-[#e8ddc8]/70 bg-white hover:bg-cyan-50/45"
                    >
                      <td className="px-4 py-3 font-mono font-black text-cyan-700">
                        {tx.transactionCode}
                      </td>
                      <td className="px-4 py-3 font-bold text-[#334155]">
                        {tx.category || "عامة"}
                      </td>
                      <td className="px-4 py-3 font-bold text-[#64748b]">
                        مسوق أساسي
                      </td>
                      <td className="px-4 py-3 font-bold text-[#64748b]">
                        —
                      </td>
                      <td className="px-4 py-3 font-mono text-[#64748b]">
                        {new Date(tx.createdAt).toLocaleDateString("ar-SA")}
                      </td>
                    </tr>
                  )}
                />
              )}

              {activeTab === "settlements" && (
                <SimpleTable
                  columns={["التاريخ", "المبلغ", "المصدر", "الحالة"]}
                  emptyText="لا توجد تسويات مالية"
                  rows={selectedPerson.settlementsTarget}
                  renderRow={(s) => (
                    <tr
                      key={s.id}
                      className="border-b border-[#e8ddc8]/70 bg-white hover:bg-cyan-50/45"
                    >
                      <td className="px-4 py-3 font-mono text-[#64748b]">
                        {new Date(s.createdAt).toLocaleDateString("ar-SA")}
                      </td>
                      <td className="px-4 py-3 font-mono font-black text-emerald-700">
                        {maskAmount
                          ? maskAmount(s.amount)
                          : `${s.amount.toLocaleString()} ر.س`}
                      </td>
                      <td className="px-4 py-3 font-bold text-[#334155]">
                        {s.source}
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-xl bg-emerald-50 px-2.5 py-1 text-[10px] font-black text-emerald-700">
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  )}
                />
              )}

              {activeTab === "collections" && (
                <SimpleTable
                  columns={["التاريخ", "المبلغ", "المرجع", "الطريقة"]}
                  emptyText="لا توجد تحصيلات مسجلة"
                  rows={selectedPerson.paymentsCollected}
                  renderRow={(p) => (
                    <tr
                      key={p.id}
                      className="border-b border-[#e8ddc8]/70 bg-white hover:bg-cyan-50/45"
                    >
                      <td className="px-4 py-3 font-mono text-[#64748b]">
                        {new Date(p.date).toLocaleDateString("ar-SA")}
                      </td>
                      <td className="px-4 py-3 font-mono font-black text-cyan-700">
                        {maskAmount
                          ? maskAmount(p.amount)
                          : `${p.amount.toLocaleString()} ر.س`}
                      </td>
                      <td className="px-4 py-3 font-bold text-[#334155]">
                        {p.periodRef || "—"}
                      </td>
                      <td className="px-4 py-3 font-bold text-[#64748b]">
                        {p.method}
                      </td>
                    </tr>
                  )}
                />
              )}

              {activeTab === "disbursements" && (
                <SimpleTable
                  columns={["التاريخ", "المبلغ", "السبب/النوع", "ملاحظات"]}
                  emptyText="لا توجد منصرفات أو سلف"
                  rows={selectedPerson.disbursements}
                  renderRow={(d) => (
                    <tr
                      key={d.id}
                      className="border-b border-[#e8ddc8]/70 bg-white hover:bg-cyan-50/45"
                    >
                      <td className="px-4 py-3 font-mono text-[#64748b]">
                        {new Date(d.date).toLocaleDateString("ar-SA")}
                      </td>
                      <td className="px-4 py-3 font-mono font-black text-rose-600">
                        {maskAmount
                          ? maskAmount(d.amount)
                          : `${d.amount.toLocaleString()} ر.س`}
                      </td>
                      <td className="px-4 py-3 font-bold text-[#334155]">
                        {d.type}
                      </td>
                      <td className="px-4 py-3 font-semibold text-[#64748b]">
                        {d.notes}
                      </td>
                    </tr>
                  )}
                />
              )}

              {activeTab === "attachments" && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between rounded-2xl border border-[#d8b46a]/35 bg-white p-5 shadow-sm">
                    <div>
                      <h3 className="text-sm font-black text-[#123f59]">
                        مرفقات ووثائق الشخص
                      </h3>
                      <p className="mt-1 text-xs font-semibold text-[#64748b]">
                        يمكنك عرض الملفات المرفقة أو حذفها من هنا.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    {!selectedPerson.attachments ||
                    selectedPerson.attachments.length === 0 ? (
                      <div className="col-span-full rounded-2xl border border-dashed border-[#d8b46a]/45 bg-white py-12 text-center">
                        <Archive className="mx-auto mb-2 h-10 w-10 text-[#c5983c]/50" />
                        <span className="text-sm font-black text-[#64748b]">
                          لا توجد مرفقات محفوظة
                        </span>
                      </div>
                    ) : (
                      selectedPerson.attachments.map((file, i) => (
                        <div
                          key={i}
                          className="group flex flex-col items-center rounded-2xl border border-[#d8b46a]/35 bg-white p-4 text-center shadow-sm transition hover:border-[#c5983c]/55"
                        >
                          <div className="mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-[#f8efe0] text-[#c5983c]">
                            <FileText className="h-6 w-6" />
                          </div>

                          <span
                            className="mb-3 w-full truncate text-xs font-black text-[#334155]"
                            title={file.name}
                          >
                            {file.name}
                          </span>

                          <div className="flex w-full items-center gap-2">
                            <button
                              onClick={(e) => handleViewAttachment(e, file.url)}
                              className="flex-1 rounded-xl bg-cyan-50 py-1.5 text-[10px] font-black text-cyan-700 transition hover:bg-cyan-600 hover:text-white"
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
                              className="rounded-xl bg-rose-50 p-1.5 text-rose-500 transition hover:bg-rose-500 hover:text-white"
                              type="button"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
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

      {/* Loading Preview */}
      {isPreviewLoading && (
        <div className="fixed inset-0 z-[160] grid place-items-center bg-black/45 backdrop-blur-sm">
          <div className="rounded-2xl bg-white px-5 py-4 shadow-xl">
            <Loader2 className="mx-auto h-7 w-7 animate-spin text-[#c5983c]" />
            <p className="mt-2 text-xs font-black text-[#123f59]">
              جاري تحميل المرفق...
            </p>
          </div>
        </div>
      )}

      {/* Preview File */}
      {previewData && (
        <div
          className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in"
          dir="rtl"
          onClick={closePreview}
        >
          <div
            className="
              flex h-[90vh] w-full max-w-5xl flex-col overflow-hidden
              rounded-[28px] bg-white shadow-2xl
            "
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex shrink-0 items-center justify-between border-b border-[#e8ddc8] bg-gradient-to-l from-[#08111c] via-[#0f3448] to-[#123f59] px-6 py-4 text-white">
              <div className="flex items-center gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-2xl bg-[#e2bf74] text-[#123f59]">
                  <Eye className="h-4 w-4" />
                </div>

                <span className="text-base font-black">معاينة المستند</span>
              </div>

              <div className="flex gap-2">
                <a
                  href={previewData.url}
                  download
                  className="grid h-9 w-9 place-items-center rounded-2xl bg-white/10 text-white transition hover:bg-white/15"
                  title="تحميل"
                >
                  <Download className="h-5 w-5" />
                </a>

                <button
                  onClick={closePreview}
                  className="grid h-9 w-9 place-items-center rounded-2xl bg-white/10 text-white transition hover:bg-rose-500"
                  type="button"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="flex flex-1 items-center justify-center overflow-hidden bg-[#eef7f6] p-6">
              {previewData.isPdf ? (
                <iframe
                  src={previewData.url}
                  className="h-full w-full rounded-2xl border border-[#d8b46a]/35 bg-white shadow-lg"
                  title="PDF Preview"
                />
              ) : (
                <img
                  src={previewData.url}
                  alt="مرفق"
                  className="max-h-full max-w-full rounded-2xl border border-[#d8b46a]/35 bg-white object-contain shadow-lg"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const SimpleTable = ({ columns, rows, emptyText, renderRow }) => {
  const safeRows = Array.isArray(rows) ? rows : [];

  return (
    <div className="overflow-hidden rounded-2xl border border-[#d8b46a]/35 bg-white shadow-sm animate-in fade-in">
      <table className="w-full text-right text-xs">
        <thead className="bg-[#0f3448] text-white">
          <tr>
            {columns.map((col) => (
              <th key={col} className="px-4 py-3 font-black">
                {col}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {safeRows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="py-10 text-center text-sm font-black text-[#64748b]"
              >
                {emptyText}
              </td>
            </tr>
          ) : (
            safeRows.map(renderRow)
          )}
        </tbody>
      </table>
    </div>
  );
};