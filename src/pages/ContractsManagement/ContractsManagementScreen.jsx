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
  MoreVertical,
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
  const [activeMenuId, setActiveMenuId] = useState(null); // لإدارة قائمة الإجراءات لكل صف

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
    setSelectedContract(c);
    setIsCreateContractOpen(true);
  };
  const handlePreviewContract = (c) => {
    generateContractPdf(c);
  };

  const handleFreezeClick = (contract) => {
    setContractToFreeze(contract);
    setIsFreezeModalOpen(true);
    setActiveMenuId(null);
  };

  const handleStatusChange = (contract, newStatus) => {
    statusMutation.mutate({ id: contract.id, status: newStatus });
    setActiveMenuId(null);
  };

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
        <div className="flex items-center gap-3">
          {/* شريط الإحصائيات السريع العرضي */}
          <div className="hidden md:flex items-center gap-4 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600">
              <PieChart size={12} className="text-slate-400" />
              الإجمالي: <span className="text-slate-900">{stats.total}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600">
              <CheckCircle size={12} />
              نشطة: {stats.active}
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
              <Clock size={12} />
              مسودات: {stats.draft}
            </div>
          </div>
          <button
            onClick={handleCreateNew}
            className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-[10px] font-black flex items-center gap-1.5 hover:bg-emerald-700 shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> إنشاء عقد
          </button>
        </div>
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
        {activeTab === "contracts" && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden animate-in fade-in">
            <div className="p-3 border-b border-slate-100 flex gap-3 items-center bg-slate-50/50 shrink-0">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="ابحث برقم العقد، اسم العميل..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-3 pr-9 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold outline-none focus:border-emerald-500 transition-all"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar-slim pb-20">
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
                <table className="w-full text-right border-collapse">
                  <thead className="bg-slate-50/80 sticky top-0 z-10 backdrop-blur-sm border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase">
                        رقم العقد
                      </th>
                      <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase">
                        اسم المشروع
                      </th>
                      <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase">
                        العميل
                      </th>
                      <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase">
                        النوع
                      </th>
                      <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase">
                        القيمة
                      </th>
                      <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase text-center">
                        الحالة
                      </th>
                      <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase text-center">
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
                          className={`hover:bg-slate-50/50 transition-colors ${isFrozen ? "bg-slate-50/30 opacity-70" : ""}`}
                        >
                          <td className="px-4 py-3 text-xs font-mono font-bold text-slate-700">
                            {c.code}
                          </td>
                          <td className="px-4 py-3 text-xs font-bold text-slate-900 min-w-[200px]">
                            {c.name}
                            {isFrozen && c.projectDetails?.freezeReason && (
                              <div className="text-[9px] text-rose-500 font-bold mt-1 bg-rose-50 w-fit px-1.5 py-0.5 rounded border border-rose-100">
                                سبب التجميد: {c.projectDetails.freezeReason}
                              </div>
                            )}
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
                          <td className="px-4 py-3 text-center">
                            {getStatusBadge(c.status)}
                          </td>
                          <td className="px-4 py-3 text-center relative">
                            {/* زر الثلاث نقاط للخيارات */}
                            <button
                              onClick={() =>
                                setActiveMenuId(
                                  activeMenuId === c.id ? null : c.id,
                                )
                              }
                              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                              <MoreVertical size={16} />
                            </button>

                            {/* القائمة المنسدلة للخيارات */}
                            {activeMenuId === c.id && (
                              <>
                                <div
                                  className="fixed inset-0 z-20"
                                  onClick={() => setActiveMenuId(null)}
                                ></div>
                                <div className="absolute left-4 top-10 bg-white border border-slate-200 rounded-xl shadow-xl z-30 w-40 py-1 animate-in zoom-in-95 overflow-hidden text-right font-bold text-[10px]">
                                  <button
                                    onClick={() => {
                                      handlePreviewContract(c);
                                      setActiveMenuId(null);
                                    }}
                                    className="flex items-center gap-2 w-full px-3 py-2 hover:bg-slate-50 text-slate-700"
                                  >
                                    <Eye size={12} className="text-blue-500" />{" "}
                                    عرض وطباعة
                                  </button>

                                  {!isFrozen && (
                                    <button
                                      onClick={() => {
                                        handleEditContract(c);
                                        setActiveMenuId(null);
                                      }}
                                      className="flex items-center gap-2 w-full px-3 py-2 hover:bg-slate-50 text-slate-700"
                                    >
                                      <FilePenLine
                                        size={12}
                                        className="text-emerald-500"
                                      />{" "}
                                      تعديل العقد
                                    </button>
                                  )}

                                  {isFrozen ? (
                                    <button
                                      onClick={() =>
                                        handleStatusChange(c, "نشط")
                                      }
                                      className="flex items-center gap-2 w-full px-3 py-2 hover:bg-blue-50 text-blue-700"
                                    >
                                      <Play size={12} /> تنشيط العقد
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => handleFreezeClick(c)}
                                      className="flex items-center gap-2 w-full px-3 py-2 hover:bg-cyan-50 text-cyan-700"
                                    >
                                      <Snowflake size={12} /> تجميد العقد
                                    </button>
                                  )}

                                  <div className="border-t border-slate-100 my-1"></div>

                                  <button
                                    onClick={() => {
                                      if (window.confirm("حذف العقد؟"))
                                        deleteMutation.mutate(c.id);
                                      setActiveMenuId(null);
                                    }}
                                    className="flex items-center gap-2 w-full px-3 py-2 hover:bg-rose-50 text-rose-600"
                                  >
                                    <Trash2 size={12} /> حذف العقد
                                  </button>
                                </div>
                              </>
                            )}
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
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6">
            <h3 className="font-black text-slate-800 text-sm mb-2 flex items-center gap-2">
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
                className="px-4 py-2 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-200"
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
                className="px-4 py-2 bg-cyan-600 text-white text-xs font-bold rounded-lg hover:bg-cyan-700 disabled:opacity-50 flex items-center gap-2"
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
