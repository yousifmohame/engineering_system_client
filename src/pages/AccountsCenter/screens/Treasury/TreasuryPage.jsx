import React, { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../../api/axios";
import { toast } from "sonner";
import { Vault } from "lucide-react";

// استدعاء المكونات
import VaultHeader from "./components/VaultHeader";
import VaultBalances from "./components/VaultBalances";
import VaultToolbar from "./components/VaultToolbar";
import TransactionsTable from "./components/TransactionsTable";

// استدعاء النوافذ المنبثقة (Modals)
import CreateTransactionModal from "./modals/CreateTransactionModal";
import CreateVaultModal from "./modals/CreateVaultModal";
import TransactionDetailsModal from "./modals/TransactionDetailsModal";
import VaultAuditLogsModal from "./modals/VaultAuditLogsModal";
import ExportModal from "./modals/ExportModal";

const TreasuryPage = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVaultId, setSelectedVaultId] = useState("");

  // حالات النوافذ المنبثقة
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [viewingTransaction, setViewingTransaction] = useState(null);
  const [isCreateVaultModalOpen, setIsCreateVaultModalOpen] = useState(false);
  const [isAuditLogsOpen, setIsAuditLogsOpen] = useState(false);

  // 1. جلب الخزن
  const { data: vaults = [], isLoading: isLoadingVaults } = useQuery({
    queryKey: ["cash-vaults"],
    queryFn: async () => {
      const res = await api.get("/accounts/cash-vaults");
      return res.data?.data || [];
    },
  });

  // 💡 [الحل الجذري]: تحديث الخزنة المحددة تلقائياً بمجرد توفر خزن
  useEffect(() => {
    if (vaults.length > 0 && !selectedVaultId) {
      setSelectedVaultId(vaults[0].id);
    }
  }, [vaults, selectedVaultId]);

  const activeVault = useMemo(
    () => vaults.find((v) => v.id === selectedVaultId) || vaults[0],
    [vaults, selectedVaultId],
  );

  // 2. جلب حركات الخزنة المحددة
  const { data: transactions = [], isLoading: isLoadingTx } = useQuery({
    queryKey: ["cash-transactions", selectedVaultId],
    queryFn: async () => {
      if (!selectedVaultId) return [];
      const res = await api.get(
        `/accounts/cash-vaults/${selectedVaultId}/transactions`,
      );
      return res.data?.data || [];
    },
    enabled: !!selectedVaultId, // لا تقم بالجلب إلا إذا كان الـ ID موجوداً
  });

  // 3. فلترة البيانات
  const activeTransactions = useMemo(
    () => transactions.filter((t) => t.status === "APPROVED"),
    [transactions],
  );

  const filteredData = useMemo(() => {
    if (!searchQuery) return transactions;
    const q = searchQuery.toLowerCase();
    return transactions.filter(
      (t) =>
        t.description?.toLowerCase().includes(q) ||
        t.transactionNo?.toLowerCase().includes(q) ||
        t.notes?.toLowerCase().includes(q),
    );
  }, [transactions, searchQuery]);

  // 4. إلغاء حركة (قيد عكسي)
  const toggleStatusMutation = useMutation({
    mutationFn: async (id) =>
      await api.post(`/accounts/transactions/${id}/cancel`),
    onSuccess: () => {
      toast.success("تم إلغاء الحركة وإنشاء قيد عكسي بنجاح");
      queryClient.invalidateQueries(["cash-transactions", selectedVaultId]);
      queryClient.invalidateQueries(["cash-vaults"]);
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "حدث خطأ أثناء الإلغاء"),
  });

  const handleOpenTransactionModal = () => {
    if (!selectedVaultId) {
      toast.error("الرجاء تحديد الخزنة أولاً قبل تسجيل الحركة");
      return;
    }
    setIsAddModalOpen(true);
  };

  if (isLoadingVaults) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-blue-600">
        جاري تحميل المركز المالي...
      </div>
    );
  }

  return (
    <div
      className="p-3 flex flex-col h-full overflow-hidden bg-[var(--wms-bg-0)] font-sans"
      dir="rtl"
    >
      <div
        className="space-y-3 flex-1 flex flex-col min-h-0"
        id="treasury-report"
      >
        {vaults.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-xl shrink-0">
            <Vault className="w-12 h-12 text-gray-300 mb-4" />
            <p className="text-gray-500 mb-4">
              لا توجد خزن معرفة في النظام حالياً
            </p>
            <button
              onClick={() => setIsCreateVaultModalOpen(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 cursor-pointer"
            >
              تعريف خزنة جديدة الآن
            </button>
          </div>
        )}

        {vaults.length > 0 && (
          <>
            <VaultHeader
              vaults={vaults}
              selectedVaultId={selectedVaultId}
              setSelectedVaultId={setSelectedVaultId}
            />

            {activeVault && <VaultBalances vault={activeVault} />}

            <VaultToolbar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onAdd={handleOpenTransactionModal}
              onExport={() => setIsExportModalOpen(true)}
              onOpenLogs={() => setIsAuditLogsOpen(true)}
            />

            <TransactionsTable
              data={filteredData}
              isLoading={isLoadingTx}
              onView={(tx) => setViewingTransaction(tx)}
              onCancel={(id) => {
                if (
                  window.confirm(
                    "هل أنت متأكد من إلغاء الحركة؟ سيتم إنشاء قيد عكسي للحفاظ على التسلسل المحاسبي.",
                  )
                ) {
                  toggleStatusMutation.mutate(id);
                }
              }}
              isCanceling={toggleStatusMutation.isPending}
            />
          </>
        )}
      </div>

      {/* النوافذ المنبثقة */}
      {isAddModalOpen && selectedVaultId && (
        <CreateTransactionModal
          onClose={() => setIsAddModalOpen(false)}
          selectedVaultId={selectedVaultId} // الآن نحن متأكدون أنه ليس فارغاً
        />
      )}

      {isAuditLogsOpen && selectedVaultId && (
        <VaultAuditLogsModal
          selectedVaultId={selectedVaultId}
          onClose={() => setIsAuditLogsOpen(false)}
        />
      )}

      {isCreateVaultModalOpen && (
        <CreateVaultModal onClose={() => setIsCreateVaultModalOpen(false)} />
      )}

      {viewingTransaction && (
        <TransactionDetailsModal
          transaction={viewingTransaction}
          onClose={() => setViewingTransaction(null)}
        />
      )}

      {isExportModalOpen && activeVault && (
        <ExportModal
          onClose={() => setIsExportModalOpen(false)}
          activeVault={activeVault}
          transactions={activeTransactions}
        />
      )}
    </div>
  );
};

export default TreasuryPage;
