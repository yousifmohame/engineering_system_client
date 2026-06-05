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
  BookOpen,
  Settings,
  AlertCircle,
  Snowflake,
  Play,
  CheckCircle,
  Clock,
  PieChart,
} from "lucide-react";
import api from "../../api/axios";
import { toast } from "sonner";
import CreateContractModal from "./modelss/CreateContractModal";
import { generateContractPdf } from "./utils/contractExporter";

export default function ContractsManagementScreen() {
  const [activeTab, setActiveTab] = useState("contracts");
  const [searchQuery, setSearchQuery] = useState("");

  // حالات المودال الخاص بالتجميد
  const [isFreezeModalOpen, setIsFreezeModalOpen] = useState(false);
  const [contractToFreeze, setContractToFreeze] = useState(null);
  const [freezeReason, setFreezeReason] = useState("");

  const [isCreateContractOpen, setIsCreateContractOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);

  const queryClient = useQueryClient();

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

  const deleteMutation = useMutation({
    mutationFn: async (id) => await api.delete(`/contracts-management/${id}`),
    onSuccess: () => {
      toast.success("تم حذف العقد بنجاح");
      queryClient.invalidateQueries(["advanced-contracts"]);
    },
    onError: () => toast.error("حدث خطأ أثناء الحذف"),
  });

  // ميوتيشن لتغيير حالة العقد (تجميد، تنشيط، الخ)
  const statusMutation = useMutation({
    mutationFn: async ({ id, status, reason }) => {
      return await api.patch(`/contracts-management/${id}/status`, {
        status: status,
        freezeReason: reason,
      });
    },
    onSuccess: (data, variables) => {
      const action = variables.status === "مجمد" ? "تجميد" : "تحديث حالة";
      toast.success(`تم ${action} العقد بنجاح`);
      queryClient.invalidateQueries(["advanced-contracts"]);
      setIsFreezeModalOpen(false);
      setFreezeReason("");
      setContractToFreeze(null);
    },
    onError: () => toast.error("حدث خطأ أثناء تحديث حالة العقد"),
  });

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

  // حساب الإحصائيات لشريط التحليل
  const stats = useMemo(() => {
    if (!contractsData)
      return { total: 0, active: 0, draft: 0, frozen: 0, completed: 0 };
    return {
      total: contractsData.length,
      active: contractsData.filter(
        (c) => c.status === "نشط" || c.status === "active",
      ).length,
      draft: contractsData.filter(
        (c) => c.status === "مسودة" || c.status === "draft",
      ).length,
      frozen: contractsData.filter(
        (c) => c.status === "مجمد" || c.status === "frozen",
      ).length,
      completed: contractsData.filter(
        (c) => c.status === "مكتمل" || c.status === "completed",
      ).length,
    };
  }, [contractsData]);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("ar-SA", {
      style: "currency",
      currency: "SAR",
    }).format(amount || 0);

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
      case "frozen":
      case "مجمد":
        return (
          <span className="px-2 py-0.5 bg-cyan-50 text-cyan-700 border border-cyan-200 rounded text-[9px] font-bold">
            مجمد
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

  const handleCreateNew = () => {
    setSelectedContract(null);
    setIsCreateContractOpen(true);
  };
  const handleEditContract = (c) => {
    try {
      setSelectedContract({ ...c });
      setIsCreateContractOpen(true);
    } catch (error) {
      console.error("Contract edit failed:", error);
      toast.error("تعذر فتح نافذة التعديل");
    }
  };
  const handlePreviewContract = (c) => {
    try {
      generateContractPdf(c);
    } catch (error) {
      console.error("Contract preview failed:", error);
      toast.error("تعذر فتح معاينة العقد");
    }
  };

  const handleFreezeClick = (contract) => {
    setContractToFreeze(contract);
    setIsFreezeModalOpen(true);
  };

  const handleStatusChange = (contract, newStatus) => {
    statusMutation.mutate({ id: contract.id, status: newStatus });
  };

  return (
    <div
      className="h-full flex flex-col bg-[#eef5f7] font-cairo overflow-hidden"
      dir="rtl"
    >
      {/* ─── Header ─── */}
      <header className="m-3 mb-2 rounded-[24px] bg-gradient-to-l from-[#071927] via-[#0b2f3f] to-[#147785] border border-[#d9b85b]/25 shadow-[0_14px_28px_rgba(8,54,70,0.14)] px-4 py-3 shrink-0">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-[16px] bg-[#d9b85b] text-[#083646] flex items-center justify-center shrink-0 shadow-sm">
              <FilePenLine className="w-5 h-5" />
            </div>
            <div className="min-w-0" style={{ fontFamily: "Tajawal, sans-serif" }}>
              <h1 className="text-[16px] font-bold leading-tight whitespace-nowrap text-white">إدارة العقود</h1>
              <p className="text-[10px] font-semibold text-white/75 mt-0.5 whitespace-nowrap">مركز التحكم في الوثائق القانونية والعقود</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="hidden lg:flex items-center gap-2 bg-white/10 border border-white/15 px-2.5 py-1.5 rounded-[14px]">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-white/85">
                <PieChart size={12} className="text-[#d9b85b]" />
                الإجمالي <span className="bg-white/15 px-2 py-0.5 rounded-lg text-white">{stats.total}</span>
              </div>
              <div className="w-px h-5 bg-white/15" />
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-200">
                <CheckCircle size={12} /> نشطة {stats.active}
              </div>
              <div className="w-px h-5 bg-white/15" />
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-200">
                <Clock size={12} /> مسودات {stats.draft}
              </div>
            </div>
            <button
              onClick={handleCreateNew}
              className="h-10 px-4 bg-[#d9b85b] text-[#083646] rounded-[15px] text-[13px] font-black flex items-center gap-2 hover:bg-[#e6c86c] shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" /> إنشاء عقد
            </button>
          </div>
        </div>
      </header>

      {/* ─── Tabs ─── */}
      <div className="mx-3 mb-2 bg-white border border-[#d8e6ee] rounded-[18px] p-1.5 shrink-0 shadow-sm flex items-center gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab("contracts")}
          className={`h-9 px-4 rounded-[13px] text-[12px] font-black flex items-center gap-2 transition-all ${activeTab === "contracts" ? "bg-[#083646] text-white shadow-sm" : "bg-[#f7fbfd] text-[#52677e] hover:bg-[#eef5f7]"}`}
        >
          <FileText className="w-4 h-4" /> العقود <span className="text-[10px] opacity-80">({contractsData?.length || 0})</span>
        </button>
        <button
          onClick={() => setActiveTab("templates")}
          className={`h-9 px-4 rounded-[13px] text-[12px] font-black flex items-center gap-2 transition-all ${activeTab === "templates" ? "bg-[#083646] text-white shadow-sm" : "bg-[#f7fbfd] text-[#52677e] hover:bg-[#eef5f7]"}`}
        >
          <BookOpen className="w-4 h-4" /> نماذج العقود
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          className={`h-9 px-4 rounded-[13px] text-[12px] font-black flex items-center gap-2 transition-all ${activeTab === "settings" ? "bg-[#083646] text-white shadow-sm" : "bg-[#f7fbfd] text-[#52677e] hover:bg-[#eef5f7]"}`}
        >
          <Settings className="w-4 h-4" /> الإعدادات
        </button>
      </div>

      {/* ─── Tab Content ─── */}
      <div className="flex-1 overflow-hidden px-3 pb-3 flex flex-col">
        {activeTab === "contracts" && (
          <div className="bg-white rounded-[22px] border border-[#d8e6ee] shadow-sm flex flex-col h-full overflow-hidden animate-in fade-in">
            <div className="px-4 py-3 border-b border-[#d8e6ee] flex flex-wrap gap-3 items-center justify-between bg-[#f7fbfd] shrink-0">
              <div className="relative flex-1 max-w-md min-w-[260px]">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8aa0b4]" />
                <input
                  type="text"
                  placeholder="ابحث برقم العقد، اسم المشروع أو العميل..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 pl-3 pr-10 bg-white border border-[#d8e6ee] rounded-[15px] text-[12px] font-bold text-[#123B5D] placeholder:text-[#8aa0b4] outline-none focus:border-[#d9b85b] transition-all"
                />
              </div>
              <div className="text-[11px] font-black text-[#52677e] bg-white border border-[#d8e6ee] px-3 py-2 rounded-[13px]">
                النتائج: <span className="text-[#123B5D]">{filteredContracts.length}</span>
              </div>
            </div>

            <div className="flex-1 overflow-auto custom-scrollbar-slim">
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
                    فشل الاتصال بالخادم
                  </p>
                </div>
              ) : filteredContracts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-3 py-20">
                  <FileText className="w-12 h-12 text-slate-200" />
                  <p className="text-xs font-bold">لا توجد عقود</p>
                </div>
              ) : (
                <table className="w-full text-right border-collapse text-[12px]">
                  <thead className="bg-[#083646] sticky top-0 z-10 border-b border-[#d9b85b]/30 text-white">
                    <tr>
                      <th className="px-3 py-2.5 text-[11px] font-black text-white">
                        رقم العقد
                      </th>
                      <th className="px-3 py-2.5 text-[11px] font-black text-white">
                        اسم المشروع
                      </th>
                      <th className="px-3 py-2.5 text-[11px] font-black text-white">
                        العميل
                      </th>
                      <th className="px-3 py-2.5 text-[11px] font-black text-white">
                        النوع
                      </th>
                      <th className="px-3 py-2.5 text-[11px] font-black text-white">
                        القيمة
                      </th>
                      <th className="px-3 py-2.5 text-[11px] font-black text-white text-center">
                        الحالة
                      </th>
                      <th className="px-3 py-2.5 text-[11px] font-black text-white text-center">
                        إجراءات
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredContracts.map((c) => {
                      const isFrozen =
                        c.status === "مجمد" || c.status === "frozen";
                      return (
                        <tr
                          key={c.id}
                          className={`hover:bg-[#f7fbfd] transition-colors border-b border-[#e7eef2] ${isFrozen ? "bg-slate-50/30 opacity-70" : ""}`}
                        >
                          <td className="px-3 py-2.5 text-[11px] font-mono font-black text-[#123B5D]">
                            {c.code}
                          </td>
                          <td className="px-3 py-2.5 text-[12px] font-black text-[#123B5D] min-w-[200px]">
                            {c.name}
                            {isFrozen && c.projectDetails?.freezeReason && (
                              <div className="text-[9px] text-rose-500 font-bold mt-1 bg-rose-50 w-fit px-1.5 py-0.5 rounded border border-rose-100">
                                سبب التجميد: {c.projectDetails.freezeReason}
                              </div>
                            )}
                          </td>
                          <td className="px-3 py-2.5 text-[11px] font-bold text-[#52677e]">
                            {c.partyBDetails?.representant ||
                              c.partyB ||
                              "غير محدد"}
                          </td>
                          <td className="px-3 py-2.5 text-[10px] font-bold text-[#52677e]">
                            <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                              {c.type}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 text-[11px] font-black text-[#0f6d7c]">
                            {formatCurrency(c.contractValue)}
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            {getStatusBadge(c.status)}
                          </td>
                          <td className="px-3 py-2 text-center">
                            <div className="grid grid-cols-2 gap-1.5 min-w-[150px] max-w-[170px] mx-auto">
                              <button
                                onClick={() => handlePreviewContract(c)}
                                className="h-8 px-2 rounded-xl bg-cyan-50 text-[#0f6d7c] hover:bg-cyan-100 border border-cyan-100 flex items-center justify-center gap-1 text-[10px] font-black transition-colors"
                                title="عرض وطباعة"
                              >
                                <Eye size={12} />
                                <span>عرض</span>
                              </button>

                              {!isFrozen ? (
                                <button
                                  onClick={() => handleEditContract(c)}
                                  className="h-8 px-2 rounded-xl bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-100 flex items-center justify-center gap-1 text-[10px] font-black transition-colors"
                                  title="تعديل العقد"
                                >
                                  <FilePenLine size={12} />
                                  <span>تعديل</span>
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleStatusChange(c, "نشط")}
                                  className="h-8 px-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-100 flex items-center justify-center gap-1 text-[10px] font-black transition-colors"
                                  title="تنشيط العقد"
                                >
                                  <Play size={12} />
                                  <span>تنشيط</span>
                                </button>
                              )}

                              {!isFrozen && (
                                <button
                                  onClick={() => handleFreezeClick(c)}
                                  className="h-8 px-2 rounded-xl bg-slate-50 text-[#52677e] hover:bg-slate-100 border border-slate-100 flex items-center justify-center gap-1 text-[10px] font-black transition-colors"
                                  title="تجميد العقد"
                                >
                                  <Snowflake size={12} />
                                  <span>تجميد</span>
                                </button>
                              )}

                              <button
                                onClick={() => {
                                  if (window.confirm("حذف العقد؟")) deleteMutation.mutate(c.id);
                                }}
                                className="h-8 px-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-100 flex items-center justify-center gap-1 text-[10px] font-black transition-colors"
                                title="حذف العقد"
                              >
                                <Trash2 size={12} />
                                <span>حذف</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 🚀 نافذة إدخال سبب التجميد */}
      {isFreezeModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-[24px] w-full max-w-sm shadow-2xl p-5 border border-[#d8e6ee]">
            <h3 className="font-black text-[#123B5D] text-[15px] mb-2 flex items-center gap-2">
              <Snowflake size={16} className="text-cyan-500" /> تجميد العقد
            </h3>
            <p className="text-[10px] text-slate-500 font-bold mb-4">
              يرجى إدخال سبب تجميد عقد ({contractToFreeze?.name}) للرجوع إليه
              لاحقاً.
            </p>
            <textarea
              value={freezeReason}
              onChange={(e) => setFreezeReason(e.target.value)}
              placeholder="مثال: بناءً على طلب المالك بتعليق الأعمال..."
              className="w-full border border-slate-300 rounded-xl p-3 text-xs font-bold outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 min-h-[100px] resize-none mb-4"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setIsFreezeModalOpen(false);
                  setFreezeReason("");
                }}
                className="px-4 py-2 bg-[#eef5f7] text-[#52677e] text-xs font-bold rounded-xl hover:bg-[#e4eef3]"
              >
                إلغاء
              </button>
              <button
                onClick={() =>
                  statusMutation.mutate({
                    id: contractToFreeze.id,
                    status: "مجمد",
                    reason: freezeReason,
                  })
                }
                disabled={!freezeReason.trim() || statusMutation.isPending}
                className="px-4 py-2 bg-[#083646] text-white text-xs font-bold rounded-xl hover:bg-[#0f6d7c] disabled:opacity-50 flex items-center gap-2"
              >
                {statusMutation.isPending && (
                  <Loader2 size={14} className="animate-spin" />
                )}{" "}
                تأكيد التجميد
              </button>
            </div>
          </div>
        </div>
      )}

      {isCreateContractOpen && (
        <CreateContractModal
          initialData={selectedContract}
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
