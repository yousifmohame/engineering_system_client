import React, { useState, useMemo } from "react";
import {
  FolderOpen,
  Settings,
  Trash2,
  X,
  Search,
  CheckSquare,
  Loader2,
  Star,
  User,
  Copy,
  FolderOpen as FolderIcon,
} from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../api/axios";
import { useAuth } from "../../../context/AuthContext";

// 💡 استيراد الثوابت والمكونات
import { DEFAULT_CATEGORIES, GRID_COLUMNS } from "./utils";
import EnhancedListItem from "./components/EnhancedListItem";
import FolderViewerWindow from "./components/FolderViewerWindow";
import FolderCategoriesModal from "./components/modals/FolderCategoriesModal";
import TrashModal from "./components/modals/TrashModal";
import { LinkedTransactionsModal } from "./components/modals/Modals";

// ============================================================================
// 💡 TABLE HEADER COMPONENT (مكون منفصل لضمان التطابق)
// ============================================================================

function TableHeaderRow({ gridColumns }) {
  return (
    <div
      className="grid gap-2 items-center px-3 py-2.5 bg-slate-800 text-white rounded-t-xl text-[11px] font-bold sticky top-0 z-20 shadow-sm"
      style={{ gridTemplateColumns: gridColumns }}
      dir="rtl"
    >
      <div className="text-center">✓</div>
      <div className="text-center">
        <Star size={13} className="mx-auto" />
      </div>
      <div>المجلد / المالك</div>
      <div>رقم / نوع</div>
      <div>القطاع / الحي</div>
      <div>المكتب المنفذ</div>
      <div>الحجم</div>
      <div>آخر تعديل</div>
      <div>تاريخ الإنشاء</div>
      <div className="text-center">تواصل</div>
      <div className="text-center">حالة</div>
      <div className="text-center">🔒</div>
      <div className="text-center">➡️</div>
    </div>
  );
}

// ============================================================================
// 💡 MAIN COMPONENT
// ============================================================================

export default function TransactionFilesManager({ onClose }) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [deletedItems, setDeletedItems] = useState([]);
  const [openedTransaction, setOpenedTransaction] = useState(null);
  const [viewLinkedTx, setViewLinkedTx] = useState(null);
  const [showCategoriesModal, setShowCategoriesModal] = useState(false);
  const [showTrashModal, setShowTrashModal] = useState(false);
  const [mainContextMenu, setMainContextMenu] = useState({
    show: false,
    x: 0,
    y: 0,
    transaction: null,
  });

  // 1. جلب المعاملات
  const { data: rawTransactions = [], isLoading: txLoading } = useQuery({
    queryKey: ["private-transactions-files-list"],
    queryFn: async () => {
      const res = await api.get("/private-transactions");
      return res.data?.data || [];
    },
  });

  // 2. جلب التصنيفات
  const { data: categories = DEFAULT_CATEGORIES } = useQuery({
    queryKey: ["folder-categories"],
    queryFn: async () => {
      try {
        const res = await api.get("/files/categories");
        return res.data?.data?.length > 0 ? res.data.data : DEFAULT_CATEGORIES;
      } catch {
        return DEFAULT_CATEGORIES;
      }
    },
  });

  const saveCategoriesMutation = useMutation({
    mutationFn: async (cats) =>
      await api.post("/files/categories", { categories: cats }),
    onSuccess: () => {
      queryClient.invalidateQueries(["folder-categories"]);
      setShowCategoriesModal(false);
      toast.success("تم الحفظ");
    },
  });

  // 3. تحويل البيانات
  const transactions = useMemo(() => {
    return rawTransactions.map((tx) => {
      const fullName =
        tx.clientName || tx.client || tx.ownerNames || "عميل غير محدد";
      const nameParts = fullName.trim().split(" ");
      return {
        id: tx.id,
        transactionId: tx.id,
        transactionCode: tx.ref || tx.transactionCode || tx.id.substring(0, 8),
        ownerFirstName: nameParts[0] || "عميل",
        ownerLastName:
          nameParts.length > 1 ? nameParts[nameParts.length - 1] : "",
        transactionType: tx.type || tx.category || "معاملة",
        district: tx.districtName || tx.district || "غير محدد",
        sector: tx.sector || "غير محدد",
        commonName: tx.internalName || "",
        officeName: tx.source || tx.officeName || "",
        brokerName: tx.brokerName || "",
        agentName: tx.agentName || "",
        stakeholderName: tx.stakeholderName || "",
        totalSize: tx.totalSize || 0,
        createdAt: tx.createdAt || new Date().toISOString(),
        createdBy: tx.createdBy || "النظام",
        modifiedAt: tx.modifiedAt || tx.createdAt || new Date().toISOString(),
        modifiedBy: tx.modifiedBy || tx.createdBy || "النظام",
        clientPhone: tx.phone || tx.client?.phone || "",
        clientEmail: tx.email || tx.client?.email || "",
        status: tx.status || "جارية",
        isUrgent: tx.isUrgent || false,
        locked: tx.locked || false,
        hasLinked:
          tx.linkedParentId ||
          (tx.linkedChildren && tx.linkedChildren.length > 0) ||
          false,
      };
    });
  }, [rawTransactions]);

  // 4. الفلترة والترتيب
  const filteredTransactions = useMemo(() => {
    let result = transactions;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (tx) =>
          tx.transactionCode.toLowerCase().includes(q) ||
          tx.ownerFirstName.toLowerCase().includes(q) ||
          tx.ownerLastName.toLowerCase().includes(q) ||
          tx.district.toLowerCase().includes(q) ||
          tx.clientPhone?.includes(q),
      );
    }
    return [...result].sort((a, b) => {
      if (sortBy === "newest")
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      if (sortBy === "modified")
        return (
          new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime()
        );
      if (sortBy === "largest") return (b.totalSize || 0) - (a.totalSize || 0);
      return 0;
    });
  }, [transactions, searchQuery, sortBy]);

  const handleSelectAll = () => {
    setSelectedItems(new Set(filteredTransactions.map((t) => t.transactionId)));
    toast.success(`تم تحديد ${filteredTransactions.length} مجلد`);
  };


  const handleStatusChange = async (id, newStatus) =>
    toast.success(`تم تغيير الحالة إلى ${newStatus}`);
  const handleUrgentToggle = async (id, isUrgent) =>
    toast.success(isUrgent ? "تم تفعيل الاستعجال" : "إلغاء الاستعجال");
  const handleMainContextMenu = (e, transaction) => {
    e.preventDefault();
    e.stopPropagation();
    setMainContextMenu({ show: true, x: e.clientX, y: e.clientY, transaction });
    if (!selectedItems.has(transaction.transactionId))
      setSelectedItems(new Set([transaction.transactionId]));
  };
  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success("تم النسخ", { description: label });
  };

  return (
    <div
      className="flex flex-col h-full bg-gray-50 font-[Tajawal] overflow-hidden"
      dir="rtl"
      onClick={() => {
        setSelectedItems(new Set());
        setMainContextMenu({ show: false, x: 0, y: 0, transaction: null });
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        setMainContextMenu({ show: false, x: 0, y: 0, transaction: null });
      }}
    >
      {/* ── Header ── */}
      <div
        className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 bg-white border-b border-gray-200 shadow-sm shrink-0 z-30"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="bg-orange-100 p-2 sm:p-2.5 rounded-xl">
            <FolderOpen size={20} className="text-orange-600 sm:size-6" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-800">
              نظام إدارة ملفات المعاملات
            </h2>
            <p className="text-[10px] sm:text-[11px] font-bold text-slate-500 mt-0.5 hidden sm:block">
              استكشاف، تنظيم، ومشاركة المستندات بفعالية
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setShowCategoriesModal(true)}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] sm:text-xs font-bold rounded-lg transition-colors"
          >
            <Settings size={14} className="sm:size-16" />{" "}
            <span className="hidden sm:inline">إعدادات</span>
          </button>
          <button
            onClick={() => setShowTrashModal(true)}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-[10px] sm:text-xs font-bold rounded-lg transition-colors relative"
          >
            <Trash2 size={16} />{" "}
            <span className="hidden sm:inline">سلة المحذوفات</span>
            {deletedItems.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white flex items-center justify-center rounded-full text-[10px]">
                {deletedItems.length}
              </span>
            )}
          </button>
          <div className="w-px h-6 bg-gray-300 mx-1 sm:mx-2" />
          <button
            onClick={onClose}
            className="p-2 bg-gray-100 hover:bg-red-50 hover:text-red-600 rounded-lg text-gray-500 transition-colors"
          >
            <X size={18} className="sm:size-20" />
          </button>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div
        className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 px-4 sm:px-6 py-3 bg-white border-b border-gray-200 shrink-0 z-20"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative w-full sm:max-w-lg">
          <Search
            size={14}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث برقم المعاملة، المالك، الحي..."
            className="w-full pl-3 pr-9 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:bg-white focus:border-blue-500 transition-all"
          />
        </div>
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center sm:justify-end">
          <span className="text-[10px] sm:text-[11px] font-bold text-gray-500">
            ترتيب:
          </span>
          <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
            {["newest", "modified", "largest"].map((key) => (
              <button
                key={key}
                onClick={() => setSortBy(key)}
                className={`px-2.5 sm:px-3 py-1.5 text-[9px] sm:text-[11px] font-bold rounded-md transition-colors ${sortBy === key ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-800"}`}
              >
                {key === "newest"
                  ? "الأحدث"
                  : key === "modified"
                    ? "آخر تعديل"
                    : "الحجم"}
              </button>
            ))}
          </div>
          <div className="w-px h-6 bg-gray-300 mx-1 hidden sm:block" />
          <button
            onClick={handleSelectAll}
            className="flex items-center gap-1.5 px-3 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-[10px] sm:text-[11px] font-bold transition-colors"
          >
            <CheckSquare size={14} />{" "}
            <span className="hidden sm:inline">تحديد الكل</span>
          </button>
        </div>
      </div>

      {/* ── 🔥 FIXED: TABLE CONTAINER WITH SYNCED SCROLL 🔥 ── */}
      <div className="flex-1 overflow-hidden px-4 sm:px-6 pb-6 relative z-10">
        {/* 💡 الحاوية الخارجية: تتحكم في التمرير الأفقي والرأسي معاً */}
        <div className="overflow-auto h-full scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 rounded-xl">
          {/* 💡 الحاوية الداخلية: تمنع انكماش الجدول وتضمن تطابق الأعمدة */}
          <div className="min-w-max inline-block align-middle w-full">
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col">
              {/* الـ Header - sticky للأعلى داخل الحاوية القابلة للتمرير */}
              <TableHeaderRow gridColumns={GRID_COLUMNS} />

              {/* الـ Body - بدون overflow داخلي ليتم التمرير عبر الحاوية الخارجية */}
              <div className="divide-y divide-gray-100">
                {txLoading ? (
                  <div className="flex justify-center items-center h-[300px]">
                    <Loader2 className="animate-spin text-blue-500" size={40} />
                  </div>
                ) : filteredTransactions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-[300px] text-gray-400">
                    <FolderOpen size={48} className="mb-3 opacity-30" />
                    <p className="text-sm font-bold">لا توجد نتائج</p>
                    <p className="text-xs">جرب تعديل بحثك</p>
                  </div>
                ) : (
                  filteredTransactions.map((tx) => (
                    <EnhancedListItem
                      key={tx.transactionId}
                      transaction={tx}
                      isSelected={selectedItems.has(tx.transactionId)}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedItems(new Set([tx.transactionId]));
                      }}
                      onDoubleClick={() => setOpenedTransaction(tx)}
                      onContextMenu={handleMainContextMenu}
                      onStatusChange={handleStatusChange}
                      onUrgentToggle={handleUrgentToggle}
                      onOpenLinks={(tx) => setViewLinkedTx(tx)}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Context Menu ── */}
      {mainContextMenu.show && mainContextMenu.transaction && (
        <div
          className="fixed z-[500] bg-white rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.2)] border border-gray-200 py-1.5 min-w-[180px] font-bold animate-in fade-in"
          style={{ top: mainContextMenu.y, left: mainContextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-4 py-2 border-b border-gray-100 mb-1 bg-blue-50/50">
            <p className="text-xs text-blue-800 truncate">
              {mainContextMenu.transaction.transactionCode}
            </p>
          </div>
          <button
            onClick={() => {
              if (!mainContextMenu.transaction.locked)
                setOpenedTransaction(mainContextMenu.transaction);
              else toast.error("المعاملة مقفلة");
              setMainContextMenu({ show: false });
            }}
            className="w-full text-right px-4 py-2.5 hover:bg-blue-50 flex items-center gap-3 text-blue-600 text-[11px] transition-colors"
          >
            <FolderIcon size={16} /> <span>فتح المجلد</span>
          </button>
          <div className="border-t border-gray-100 my-1" />
          <button
            onClick={() => {
              copyToClipboard(
                mainContextMenu.transaction.transactionCode,
                "رقم المعاملة",
              );
              setMainContextMenu({ show: false });
            }}
            className="w-full text-right px-4 py-2.5 hover:bg-gray-50 flex items-center gap-3 text-gray-700 text-[11px] transition-colors"
          >
            <Copy size={16} className="text-gray-500" /> <span>نسخ الرقم</span>
          </button>
          <button
            onClick={() => {
              copyToClipboard(
                `${mainContextMenu.transaction.ownerFirstName} ${mainContextMenu.transaction.ownerLastName}`,
                "اسم المالك",
              );
              setMainContextMenu({ show: false });
            }}
            className="w-full text-right px-4 py-2.5 hover:bg-gray-50 flex items-center gap-3 text-gray-700 text-[11px] transition-colors"
          >
            <User size={16} className="text-gray-500" />{" "}
            <span>نسخ اسم المالك</span>
          </button>
        </div>
      )}

      {/* ── Modals ── */}
      {viewLinkedTx && (
        <LinkedTransactionsModal
          transaction={viewLinkedTx}
          onClose={() => setViewLinkedTx(null)}
        />
      )}
      {openedTransaction && (
        <FolderViewerWindow
          transaction={openedTransaction}
          categories={categories}
          onClose={() => setOpenedTransaction(null)}
          user={user}
        />
      )}
      {showCategoriesModal && (
        <FolderCategoriesModal
          categories={categories}
          isSaving={saveCategoriesMutation.isPending}
          onSave={(cats) => saveCategoriesMutation.mutate(cats)}
          onClose={() => setShowCategoriesModal(false)}
        />
      )}
      {showTrashModal && (
        <TrashModal
          deletedItems={deletedItems}
          onRestore={(id) =>
            setDeletedItems((d) => d.filter((x) => x.id !== id))
          }
          onPermanentDelete={(id) =>
            setDeletedItems((d) => d.filter((x) => x.id !== id))
          }
          onClose={() => setShowTrashModal(false)}
        />
      )}
    </div>
  );
}
