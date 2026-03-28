import React, {
  useState,
  useMemo,
  useRef,
  useCallback,
  useEffect,
} from "react";
import {
  Folder,
  FolderOpen,
  File,
  FileText,
  FolderPlus,
  Upload,
  Trash2,
  X,
  Check,
  Image,
  FileSpreadsheet,
  Archive,
  Video,
  Music,
  Code,
  Search,
  List,
  Clock,
  Settings,
  Plus,
  Building2,
  User,
  CheckSquare,
  ChevronRight,
  Download,
  Eye,
  ArrowLeft,
  Home,
  Copy,
  LayoutGrid,
  Loader2,
  Save,
  ArrowRight
} from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../api/axios"; // 💡 تأكد من المسار الصحيح للـ API الخاص بك

// ============================================================================
// 💡 DEFAULTS (في حال لم يكن هناك داتا في الباك إند بعد)
// ============================================================================

const DEFAULT_CATEGORIES = [
  { id: "cat-1", name: "مرفقات", icon: "📎", color: "#3b82f6", order: 1 },
  { id: "cat-2", name: "منشأة", icon: "📝", color: "#10b981", order: 2 },
  { id: "cat-3", name: "مولدة", icon: "⚙️", color: "#8b5cf6", order: 3 },
  { id: "cat-4", name: "صكوك", icon: "📜", color: "#f59e0b", order: 4 },
  { id: "cat-5", name: "هويات", icon: "🪪", color: "#06b6d4", order: 5 },
  { id: "cat-6", name: "عقود", icon: "📋", color: "#ec4899", order: 6 },
];

// ============================================================================
// 💡 HELPERS
// ============================================================================

const copyToClipboard = (text, label = "النص") => {
  if (!text) return toast.error("الحقل فارغ لا يوجد شيء لنسخه!");
  navigator.clipboard.writeText(text);
  toast.success("تم النسخ بنجاح! 📋", { description: label });
};

function formatFileSize(bytes) {
  if (bytes === 0 || !bytes) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function getFileIcon(type) {
  if (!type) return File;
  const ext = type.toLowerCase();
  if (["pdf"].includes(ext)) return FileText;
  if (["doc", "docx", "txt"].includes(ext)) return FileText;
  if (["png", "jpg", "jpeg", "gif", "webp"].includes(ext)) return Image;
  if (["xls", "xlsx", "csv"].includes(ext)) return FileSpreadsheet;
  if (["zip", "rar", "7z"].includes(ext)) return Archive;
  if (["mp4", "mkv", "avi"].includes(ext)) return Video;
  if (["mp3", "wav", "ogg"].includes(ext)) return Music;
  if (["html", "css", "js", "json"].includes(ext)) return Code;
  return File;
}

function getFileColor(type) {
  if (!type) return "#64748b";
  const ext = type.toLowerCase();
  if (["pdf"].includes(ext)) return "#dc2626";
  if (["doc", "docx", "txt"].includes(ext)) return "#2563eb";
  if (["png", "jpg", "jpeg", "gif", "webp"].includes(ext)) return "#16a34a";
  if (["xls", "xlsx", "csv"].includes(ext)) return "#15803d";
  if (["zip", "rar", "7z"].includes(ext)) return "#92400e";
  if (["mp4", "mkv", "avi"].includes(ext)) return "#7c3aed";
  if (["mp3", "wav", "ogg"].includes(ext)) return "#db2777";
  if (["html", "css", "js", "json"].includes(ext)) return "#475569";
  return "#64748b";
}

const getFullUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  let fixedUrl = url;
  if (url.startsWith("/uploads/")) {
    fixedUrl = `/api${url}`;
  }
  const baseUrl = "http://95.216.73.243"; // 💡 الدومين أو الـ IP الخاص بك
  return `${baseUrl}${fixedUrl}`;
};

// ============================================================================
// 💡 COMPONENTS
// ============================================================================

function CopyableCell({ text, className = "", label = "" }) {
  const [showCopy, setShowCopy] = useState(false);
  return (
    <div
      className={`relative group ${className}`}
      onMouseEnter={() => setShowCopy(true)}
      onMouseLeave={() => setShowCopy(false)}
    >
      <span className="truncate block">{text}</span>
      {showCopy && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            copyToClipboard(text, label);
          }}
          className="absolute left-1 top-1/2 -translate-y-1/2 p-1 bg-blue-600 text-white rounded shadow-md hover:bg-blue-700 transition-colors z-10"
        >
          <Copy size={12} />
        </button>
      )}
    </div>
  );
}

// ============================================================================
// 💡 MODALS
// ============================================================================

function FolderCategoriesModal({ categories, onSave, isSaving, onClose }) {
  const [localCategories, setLocalCategories] = useState(categories);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryIcon, setNewCategoryIcon] = useState("📁");
  const [newCategoryColor, setNewCategoryColor] = useState("#64748b");

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return toast.error("يرجى إدخال اسم التصنيف");
    const newCategory = {
      id: `cat-${Date.now()}`,
      name: newCategoryName,
      icon: newCategoryIcon,
      color: newCategoryColor,
      order: localCategories.length + 1,
    };
    setLocalCategories([...localCategories, newCategory]);
    setNewCategoryName("");
    toast.success("تم إضافة التصنيف محلياً");
  };

  const handleDeleteCategory = (id) => {
    setLocalCategories(localCategories.filter((c) => c.id !== id));
    toast.success("تم إزالة التصنيف محلياً");
  };

  const handleSave = () => {
    onSave(localCategories);
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[300]"
      onClick={onClose}
      dir="rtl"
    >
      <div
        className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
          <div className="flex items-center gap-2 text-gray-900">
            <Settings size={20} className="text-blue-600" />
            <h3 className="text-lg font-bold">إعدادات تصنيفات المجلدات</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-200 text-gray-500"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h4 className="text-sm font-semibold text-blue-900 mb-3">
              إضافة تصنيف جديد
            </h4>
            <div className="grid grid-cols-[1fr_100px_120px_auto] gap-3">
              <input
                type="text"
                placeholder="اسم التصنيف"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="px-3 py-2 border border-blue-300 rounded text-sm outline-none focus:ring-1 focus:ring-blue-500 bg-white"
              />
              <input
                type="text"
                placeholder="رمز"
                value={newCategoryIcon}
                onChange={(e) => setNewCategoryIcon(e.target.value)}
                className="px-3 py-2 border border-blue-300 rounded text-sm text-center outline-none focus:ring-1 focus:ring-blue-500 bg-white"
              />
              <input
                type="color"
                value={newCategoryColor}
                onChange={(e) => setNewCategoryColor(e.target.value)}
                className="h-10 w-full border border-blue-300 rounded cursor-pointer bg-white"
              />
              <button
                onClick={handleAddCategory}
                className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 flex items-center gap-1"
              >
                <Plus size={16} /> إضافة
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">
              التصنيفات الحالية
            </h4>
            {localCategories.map((category) => (
              <div
                key={category.id}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="text-2xl">{category.icon}</div>
                <div className="flex-1 font-medium text-gray-900">
                  {category.name}
                </div>
                <div
                  className="w-10 h-10 rounded border border-gray-300"
                  style={{ backgroundColor: category.color }}
                />
                <button
                  onClick={() => handleDeleteCategory(category.id)}
                  className="p-2 rounded hover:bg-red-50 text-red-600"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 rounded transition-colors font-medium"
          >
            إلغاء
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving ? <Loader2 size={16} className="animate-spin"/> : <Save size={16} />} 
            حفظ الإعدادات
          </button>
        </div>
      </div>
    </div>
  );
}

function CreateFolderModal({ categories, onConfirm, onClose, isPending }) {
  const [folderName, setFolderName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const handleCreate = () => {
    if (!folderName.trim()) return toast.error("يرجى إدخال اسم المجلد");
    if (!selectedCategory) return toast.error("يرجى اختيار تصنيف المجلد");
    onConfirm(folderName, selectedCategory);
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[350]"
      onClick={onClose}
      dir="rtl"
    >
      <div
        className="bg-white rounded-lg shadow-2xl w-full max-w-md flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
          <div className="flex items-center gap-2 text-gray-900">
            <FolderPlus size={20} className="text-blue-600" />
            <h3 className="text-lg font-bold">إنشاء مجلد جديد</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-200 text-gray-500"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              اسم المجلد
            </label>
            <input
              type="text"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="أدخل اسم المجلد..."
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 focus:bg-white transition-all font-semibold"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              تصنيف المجلد
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto custom-scrollbar-slim">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all font-bold text-sm ${selectedCategory === category.id ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-blue-300 bg-white"}`}
                  style={{
                    backgroundColor:
                      selectedCategory === category.id
                        ? `${category.color}10`
                        : undefined,
                  }}
                >
                  <span className="text-xl">{category.icon}</span>
                  <span>{category.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 rounded transition-colors font-medium"
          >
            إلغاء
          </button>
          <button
            onClick={handleCreate}
            disabled={isPending}
            className="flex items-center gap-2 px-6 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
          >
            {isPending && <Loader2 size={14} className="animate-spin" />} إنشاء
            المجلد
          </button>
        </div>
      </div>
    </div>
  );
}

function TrashModal({ deletedItems, onRestore, onPermanentDelete, onClose }) {
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[300]"
      onClick={onClose}
      dir="rtl"
    >
      <div
        className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-red-50 rounded-t-lg">
          <div className="flex items-center gap-2 text-red-900">
            <Trash2 size={20} className="text-red-600" />
            <h3 className="text-lg font-bold">سلة المحذوفات</h3>
            <span className="text-sm text-red-600 bg-white px-2 py-0.5 rounded-full font-mono">
              {deletedItems.length} عناصر
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-red-100 text-red-500"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
          {deletedItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 opacity-60">
              <Trash2 size={64} strokeWidth={1.5} className="mb-4" />
              <p className="text-lg font-bold">سلة المحذوفات فارغة</p>
            </div>
          ) : (
            <div className="space-y-3">
              {deletedItems.map((deleted) => (
                <div
                  key={deleted.id}
                  className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 shadow-sm hover:border-gray-300 transition-colors"
                >
                  <FolderOpen size={32} className="text-amber-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-gray-900 text-sm truncate">
                      {deleted.item?.name || "مجلد"}
                    </div>
                    <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                      <User size={12} /> بواسطة {deleted.deletedBy}
                      <span className="text-gray-300">|</span>
                      <Clock size={12} /> {deleted.deletedAt}
                    </div>
                    <div className="text-xs text-gray-400 mt-1 font-mono">
                      {deleted.originalPath}
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                    <button
                      onClick={() => onRestore(deleted.id)}
                      className="px-4 py-2 text-xs font-bold bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 transition-colors flex items-center justify-center"
                    >
                      استعادة
                    </button>
                    <button
                      onClick={() => onPermanentDelete(deleted.id)}
                      className="px-4 py-2 text-xs font-bold bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center gap-1"
                    >
                      <Trash2 size={14} /> حذف نهائي
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 💡 WINDOWS EXPLORER (FolderViewerWindow) - 100% Real API Integration
// ============================================================================

function FolderViewerWindow({ transaction, categories, onClose }) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);

  const [pathStack, setPathStack] = useState([{ id: null, name: "الرئيسية" }]);
  const currentFolderId = pathStack[pathStack.length - 1].id;

  const [selectedItems, setSelectedItems] = useState(new Set());
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [contextMenu, setContextMenu] = useState({
    show: false,
    x: 0,
    y: 0,
    item: null,
    type: null,
  });

  const [activeUploads, setActiveUploads] = useState({});
  const [showUploadManager, setShowUploadManager] = useState(false);

  // 1. جلب محتويات المجلد الحالي من الباك إند
  const { data: contents = { folders: [], files: [] }, isLoading } = useQuery({
    queryKey: ["folder-contents", transaction.transactionId, currentFolderId],
    queryFn: async () => {
      const res = await api.get(
        `/files/contents?transactionId=${transaction.transactionId}&folderId=${currentFolderId || ""}`,
      );
      return res.data;
    },
  });

  // 2. إنشاء المجلد
  const createFolderMutation = useMutation({
    mutationFn: async (data) =>
      await api.post("/files/folder", {
        name: data.name,
        transactionId: transaction.transactionId,
        parentId: currentFolderId,
      }),
    onSuccess: () => {
      toast.success("تم إنشاء المجلد");
      queryClient.invalidateQueries([
        "folder-contents",
        transaction.transactionId,
        currentFolderId,
      ]);
      setShowCreateFolderModal(false);
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "خطأ في إنشاء المجلد"),
  });

  // 3. الرفع الفعلي
  const handleFilesSelection = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setShowUploadManager(true);
    const uploadId = Date.now().toString();
    const startTime = Date.now();

    setActiveUploads((prev) => ({
      ...prev,
      [uploadId]: {
        filesCount: files.length,
        progress: 0,
        speed: "0 KB/s",
        timeRemaining: "جاري الاتصال...",
        status: "uploading",
      },
    }));

    const fd = new FormData();
    files.forEach((f) => fd.append("files", f)); 
    fd.append("transactionId", transaction.transactionId);
    if (currentFolderId) fd.append("folderId", currentFolderId);
    fd.append("uploadedBy", "مدير النظام");

    try {
      await api.post("/files/upload", fd, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          );
          const timeElapsed = (Date.now() - startTime) / 1000;
          let uploadSpeed = 0;
          if (timeElapsed > 0) uploadSpeed = progressEvent.loaded / timeElapsed;

          let speedText = `${(uploadSpeed / 1024 / 1024).toFixed(2)} MB/s`;
          if (uploadSpeed < 1024 * 1024)
            speedText = `${(uploadSpeed / 1024).toFixed(2)} KB/s`;

          const bytesRemaining = progressEvent.total - progressEvent.loaded;
          const secondsRemaining =
            uploadSpeed > 0 ? Math.round(bytesRemaining / uploadSpeed) : 0;

          let timeText = `${secondsRemaining} ثانية`;
          if (secondsRemaining > 60)
            timeText = `${Math.floor(secondsRemaining / 60)} دقيقة`;

          setActiveUploads((prev) => ({
            ...prev,
            [uploadId]: {
              ...prev[uploadId],
              progress: percentCompleted,
              speed: speedText,
              timeRemaining: timeText,
            },
          }));
        },
      });

      setActiveUploads((prev) => ({
        ...prev,
        [uploadId]: {
          ...prev[uploadId],
          status: "success",
          progress: 100,
          timeRemaining: "اكتمل",
        },
      }));
      toast.success("تم رفع الملفات بنجاح!");
      queryClient.invalidateQueries([
        "folder-contents",
        transaction.transactionId,
        currentFolderId,
      ]);

      setTimeout(() => {
        setActiveUploads((prev) => {
          const next = { ...prev };
          delete next[uploadId];
          return next;
        });
        if (Object.keys(activeUploads).length <= 1) setShowUploadManager(false);
      }, 3000);
    } catch (error) {
      setActiveUploads((prev) => ({
        ...prev,
        [uploadId]: {
          ...prev[uploadId],
          status: "error",
          timeRemaining: "فشل الرفع",
        },
      }));
      toast.error(error.response?.data?.message || "حدث خطأ أثناء الرفع");
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // 4. الحذف החقيقي
  const deleteMutation = useMutation({
    mutationFn: async (payload) => await api.post("/files/delete", payload),
    onSuccess: () => {
      toast.success("تم الحذف بنجاح");
      queryClient.invalidateQueries([
        "folder-contents",
        transaction.transactionId,
        currentFolderId,
      ]);
      setSelectedItems(new Set());
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "خطأ أثناء الحذف"),
  });

  const handleDeleteSelected = () => {
    if (selectedItems.size === 0) return;
    if (
      !window.confirm(`هل أنت متأكد من حذف ${selectedItems.size} عنصر نهائياً؟`)
    )
      return;

    const folderIds = [];
    const fileIds = [];
    selectedItems.forEach((id) => {
      if (contents.folders.find((f) => f.id === id)) folderIds.push(id);
      else fileIds.push(id);
    });

    deleteMutation.mutate({ folderIds, fileIds });
  };

  const handleItemDoubleClick = (item, type) => {
    if (type === "folder") {
      setPathStack([...pathStack, { id: item.id, name: item.name }]);
      setSelectedItems(new Set());
    } else {
      window.open(getFullUrl(item.url), "_blank");
    }
  };

  const handleNavigateBack = () => {
    if (pathStack.length > 1) {
      setPathStack(pathStack.slice(0, -1));
      setSelectedItems(new Set());
    }
  };

  const handleNavigateToPath = (index) => {
    setPathStack(pathStack.slice(0, index + 1));
    setSelectedItems(new Set());
  };

  const handleItemClick = (itemId, e) => {
    if (e.ctrlKey || e.metaKey) {
      setSelectedItems((prev) => {
        const newSet = new Set(prev);
        newSet.has(itemId) ? newSet.delete(itemId) : newSet.add(itemId);
        return newSet;
      });
    } else {
      setSelectedItems(new Set([itemId]));
    }
  };

  const handleContextMenu = (e, item, type) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ show: true, x: e.clientX, y: e.clientY, item, type });
    if (!selectedItems.has(item.id)) setSelectedItems(new Set([item.id]));
  };

  const closeContextMenu = () => {
    setContextMenu({ show: false, x: 0, y: 0, item: null, type: null });
  };

  const handleBgClick = () => {
    setSelectedItems(new Set());
    closeContextMenu();
  };

  const handleSelectAll = () => {
    const allIds = [
      ...contents.folders.map((f) => f.id),
      ...contents.files.map((f) => f.id),
    ];
    setSelectedItems(new Set(allIds));
    toast.success(`تم تحديد ${allIds.length} عنصر`);
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-[250] p-4"
      onClick={onClose}
      dir="rtl"
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-[95vw] h-[95vh] flex flex-col overflow-hidden animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 py-3 bg-slate-800 text-white shrink-0">
          <div className="flex items-center gap-3">
            <FolderOpen size={20} className="text-amber-400" />
            <div>
              <h2 className="text-sm font-bold leading-tight">
                ملفات المعاملة: {transaction.transactionCode}
              </h2>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {transaction.ownerFirstName} {transaction.ownerLastName} -{" "}
                {transaction.district}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="hover:bg-white/20 p-1.5 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Toolbar ── */}
        <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 border-b border-gray-200 shrink-0">
          <button
            onClick={handleNavigateBack}
            disabled={pathStack.length <= 1}
            className={`p-2 rounded hover:bg-gray-200 disabled:opacity-50 transition-colors text-gray-700`}
            title="رجوع"
          >
            <ArrowRight size={18} />
          </button>

          {/* Breadcrumb */}
          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-md px-3 py-1.5 flex-1 overflow-x-auto custom-scrollbar-slim">
            <Home size={14} className="text-blue-600 shrink-0" />
            {pathStack.map((step, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && (
                  <ChevronLeft
                    size={14}
                    className="text-gray-400 mx-1 shrink-0"
                  />
                )}
                <button
                  onClick={() => handleNavigateToPath(idx)}
                  className={`text-xs whitespace-nowrap transition-colors ${idx === pathStack.length - 1 ? "font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded" : "font-medium text-gray-600 hover:text-blue-600"}`}
                >
                  {step.name}
                </button>
              </React.Fragment>
            ))}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowCreateFolderModal(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded hover:bg-blue-100 text-xs font-bold transition-colors"
            >
              <FolderPlus size={14} /> مجلد جديد
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded hover:bg-indigo-100 text-xs font-bold transition-colors"
            >
              <Upload size={14} /> رفع ملفات
            </button>
            {selectedItems.size > 0 && (
              <button
                onClick={handleDeleteSelected}
                disabled={deleteMutation.isPending}
                className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded hover:bg-red-100 text-xs font-bold transition-colors"
              >
                {deleteMutation.isPending ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Trash2 size={14} />
                )}{" "}
                حذف ({selectedItems.size})
              </button>
            )}
          </div>

          <div className="h-6 w-px bg-gray-300 mx-1" />

          <button
            onClick={handleSelectAll}
            className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded hover:bg-gray-50 text-xs font-bold text-gray-700 transition-colors"
          >
            <CheckSquare size={14} className="text-blue-600" /> تحديد الكل
          </button>

          <div className="h-6 w-px bg-gray-300 mx-1" />

          {/* View Toggles */}
          <div className="flex bg-gray-200 p-0.5 rounded">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded transition-colors ${viewMode === "grid" ? "bg-white shadow-sm text-blue-600" : "text-gray-500 hover:text-gray-800"}`}
              title="عرض شبكة"
            >
              <LayoutGrid size={14} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded transition-colors ${viewMode === "list" ? "bg-white shadow-sm text-blue-600" : "text-gray-500 hover:text-gray-800"}`}
              title="عرض قائمة"
            >
              <List size={14} />
            </button>
          </div>
        </div>

        {/* ── Explorer Area ── */}
        <div
          className="flex-1 overflow-auto bg-[#fafbfc] p-6 relative"
          onClick={handleBgClick}
          onContextMenu={(e) => {
            e.preventDefault();
            handleBgClick();
          }}
        >
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="animate-spin text-blue-500" size={40} />
            </div>
          ) : contents.folders.length === 0 && contents.files.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 pointer-events-none">
              <FolderOpen
                size={72}
                strokeWidth={1}
                className="mb-4 opacity-50"
              />
              <p className="text-xl font-bold text-gray-500">المجلد فارغ</p>
              <p className="text-sm mt-2 font-medium">
                ابدأ بإنشاء مجلدات أو ارفع الملفات هنا
              </p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-4 content-start">
              {contents.folders.map((folder) => (
                <div
                  key={folder.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleItemClick(folder.id, e);
                  }}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    handleItemDoubleClick(folder, "folder");
                  }}
                  onContextMenu={(e) => handleContextMenu(e, folder, "folder")}
                  className={`group relative flex flex-col items-center justify-start p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 h-32 ${selectedItems.has(folder.id) ? "border-blue-500 bg-blue-50/50 shadow-sm" : "border-transparent hover:bg-gray-50 hover:border-gray-200"}`}
                >
                  <div
                    className={`absolute top-2 right-2 w-4 h-4 rounded-md border-2 flex items-center justify-center transition-all ${selectedItems.has(folder.id) ? "bg-blue-600 border-blue-600" : "border-gray-300 bg-white opacity-0 group-hover:opacity-100"}`}
                  >
                    {selectedItems.has(folder.id) && (
                      <Check size={10} className="text-white" strokeWidth={3} />
                    )}
                  </div>

                  <Folder
                    size={52}
                    fill="#FDB022"
                    color="#B45309"
                    strokeWidth={1}
                    className={`mb-2 transition-transform duration-200 ${selectedItems.has(folder.id) ? "scale-110" : "group-hover:scale-110"}`}
                  />

                  <span
                    className="text-[11px] font-bold text-gray-800 text-center w-full line-clamp-2 leading-tight"
                    title={folder.name}
                  >
                    {folder.name}
                  </span>
                </div>
              ))}

              {contents.files.map((file) => {
                const Icon = getFileIcon(file.extension);
                const color = getFileColor(file.extension);
                return (
                  <div
                    key={file.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleItemClick(file.id, e);
                    }}
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      handleItemDoubleClick(file, "file");
                    }}
                    onContextMenu={(e) => handleContextMenu(e, file, "file")}
                    className={`group relative flex flex-col items-center justify-start p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 h-32 ${selectedItems.has(file.id) ? "border-blue-500 bg-blue-50/50 shadow-sm" : "border-transparent hover:bg-gray-50 hover:border-gray-200"}`}
                  >
                    <div
                      className={`absolute top-2 right-2 w-4 h-4 rounded-md border-2 flex items-center justify-center transition-all ${selectedItems.has(file.id) ? "bg-blue-600 border-blue-600" : "border-gray-300 bg-white opacity-0 group-hover:opacity-100"}`}
                    >
                      {selectedItems.has(file.id) && (
                        <Check
                          size={10}
                          className="text-white"
                          strokeWidth={3}
                        />
                      )}
                    </div>

                    <Icon
                      size={52}
                      color={color}
                      strokeWidth={1}
                      className={`mb-2 transition-transform duration-200 ${selectedItems.has(file.id) ? "scale-110" : "group-hover:scale-110"}`}
                    />

                    <span
                      className="text-[11px] font-bold text-gray-800 text-center w-full line-clamp-2 leading-tight"
                      dir="ltr"
                      title={file.name || file.originalName}
                    >
                      {file.name || file.originalName}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            // List View
            <table className="w-full text-right text-xs">
              <thead className="bg-gray-50 text-gray-500 font-bold sticky top-0 shadow-sm z-10">
                <tr>
                  <th className="p-3 border-b border-gray-200">الاسم</th>
                  <th className="p-3 border-b border-gray-200">
                    تاريخ التعديل
                  </th>
                  <th className="p-3 border-b border-gray-200">النوع</th>
                  <th className="p-3 border-b border-gray-200">الحجم</th>
                  <th className="p-3 border-b border-gray-200">بواسطة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {contents.folders.map((folder) => (
                  <tr
                    key={folder.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleItemClick(folder.id, e);
                    }}
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      handleItemDoubleClick(folder, "folder");
                    }}
                    onContextMenu={(e) =>
                      handleContextMenu(e, folder, "folder")
                    }
                    className={`cursor-pointer transition-colors ${selectedItems.has(folder.id) ? "bg-blue-50" : "hover:bg-gray-50"}`}
                  >
                    <td className="p-3 flex items-center gap-3">
                      <div
                        className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all ${selectedItems.has(folder.id) ? "bg-blue-600 border-blue-600" : "border-gray-300 bg-white"}`}
                      >
                        {selectedItems.has(folder.id) && (
                          <Check
                            size={10}
                            className="text-white"
                            strokeWidth={3}
                          />
                        )}
                      </div>
                      <Folder
                        size={20}
                        fill="#FDB022"
                        color="#B45309"
                        className="shrink-0"
                      />
                      <span className="font-bold text-gray-800">
                        {folder.name}
                      </span>
                    </td>
                    <td className="p-3 text-gray-500 font-mono">
                      {new Date(folder.createdAt).toLocaleDateString("en-GB")}
                    </td>
                    <td className="p-3 text-gray-500">مجلد ملفات</td>
                    <td className="p-3 text-gray-500 font-mono">—</td>
                    <td className="p-3 text-gray-500">النظام</td>
                  </tr>
                ))}
                {contents.files.map((file) => {
                  const Icon = getFileIcon(file.extension);
                  const color = getFileColor(file.extension);
                  return (
                    <tr
                      key={file.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleItemClick(file.id, e);
                      }}
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        handleItemDoubleClick(file, "file");
                      }}
                      onContextMenu={(e) => handleContextMenu(e, file, "file")}
                      className={`cursor-pointer transition-colors ${selectedItems.has(file.id) ? "bg-blue-50" : "hover:bg-gray-50"}`}
                    >
                      <td className="p-3 flex items-center gap-3">
                        <div
                          className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all ${selectedItems.has(file.id) ? "bg-blue-600 border-blue-600" : "border-gray-300 bg-white"}`}
                        >
                          {selectedItems.has(file.id) && (
                            <Check
                              size={10}
                              className="text-white"
                              strokeWidth={3}
                            />
                          )}
                        </div>
                        <Icon
                          size={20}
                          color={color}
                          className="shrink-0"
                        />
                        <span
                          className="font-bold text-gray-800"
                          dir="ltr"
                        >
                          {file.name || file.originalName}
                        </span>
                      </td>
                      <td className="p-3 text-gray-500 font-mono">
                        {new Date(file.createdAt).toLocaleDateString("en-GB")}
                      </td>
                      <td className="p-3 text-gray-500 uppercase">
                        {file.extension} File
                      </td>
                      <td className="p-3 text-gray-500 font-mono">
                        {formatFileSize(file.size)}
                      </td>
                      <td className="p-3 text-gray-500">
                        {file.uploadedBy}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* ── Context Menu ── */}
        {contextMenu.show && contextMenu.item && (
          <>
            <div
              className="fixed inset-0 z-[300]"
              onClick={closeContextMenu}
              onContextMenu={(e) => {
                e.preventDefault();
                closeContextMenu();
              }}
            />
            <div
              className="fixed z-[310] bg-white rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.2)] border border-gray-200 py-1.5 min-w-[200px] font-bold"
              style={{ top: contextMenu.y, left: contextMenu.x }}
            >
              <div className="px-4 py-2 border-b border-gray-100 mb-1 bg-gray-50/50">
                <p
                  className="text-xs text-gray-800 truncate"
                  title={contextMenu.item.name || contextMenu.item.originalName}
                >
                  {contextMenu.item.name || contextMenu.item.originalName}
                </p>
              </div>

              {contextMenu.type === "file" && (
                <>
                  <button
                    onClick={() => {
                      handleItemDoubleClick(contextMenu.item, "file");
                      closeContextMenu();
                    }}
                    className="w-full text-right px-4 py-2.5 hover:bg-blue-50 flex items-center gap-3 text-blue-600 text-[11px] transition-colors"
                  >
                    <Eye size={16} /> عرض وفتح
                  </button>
                  <button
                    onClick={() => {
                      window.open(getFullUrl(contextMenu.item.url), "_blank");
                      closeContextMenu();
                    }}
                    className="w-full text-right px-4 py-2.5 hover:bg-green-50 flex items-center gap-3 text-green-600 text-[11px] transition-colors"
                  >
                    <Download size={16} /> تحميل الملف
                  </button>
                  <div className="border-t border-gray-100 my-1" />
                </>
              )}
              {contextMenu.type === "folder" && (
                <>
                  <button
                    onClick={() => {
                      handleItemDoubleClick(contextMenu.item, "folder");
                      closeContextMenu();
                    }}
                    className="w-full text-right px-4 py-2.5 hover:bg-blue-50 flex items-center gap-3 text-blue-600 text-[11px] transition-colors"
                  >
                    <FolderOpen size={16} /> فتح المجلد
                  </button>
                  <div className="border-t border-gray-100 my-1" />
                </>
              )}

              <button
                onClick={() => {
                  copyToClipboard(
                    contextMenu.item.name || contextMenu.item.originalName,
                    "الاسم",
                  );
                  closeContextMenu();
                }}
                className="w-full text-right px-4 py-2.5 hover:bg-gray-50 flex items-center gap-3 text-gray-700 text-[11px] transition-colors"
              >
                <Copy size={16} className="text-gray-500" /> نسخ الاسم
              </button>

              <div className="border-t border-gray-100 my-1" />

              <button
                onClick={() => {
                  handleDeleteSelected();
                  closeContextMenu();
                }}
                className="w-full text-right px-4 py-2.5 hover:bg-red-50 flex items-center gap-3 text-red-600 text-[11px] transition-colors"
              >
                <Trash2 size={16} /> حذف{" "}
                {contextMenu.type === "folder" ? "المجلد" : "الملف"}
              </button>
            </div>
          </>
        )}

        {/* ── Upload Manager Widget ── */}
        {showUploadManager && Object.keys(activeUploads).length > 0 && (
          <div className="absolute bottom-4 left-4 w-80 bg-white rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.2)] border border-gray-200 overflow-hidden z-[200] animate-in slide-in-from-bottom-4">
            <div className="bg-slate-800 px-4 py-3 flex justify-between items-center">
              <span className="text-white text-xs font-bold flex items-center gap-2">
                <Upload size={14} /> جاري رفع الملفات
              </span>
              <button
                onClick={() => setShowUploadManager(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={14} />
              </button>
            </div>
            <div className="p-4 space-y-4 max-h-64 overflow-y-auto custom-scrollbar-slim">
              {Object.entries(activeUploads).map(([id, upload]) => (
                <div key={id} className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-bold text-gray-700">
                    <span>رفع {upload.filesCount} ملفات...</span>
                    <span>{upload.progress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${upload.status === "error" ? "bg-red-500" : upload.status === "success" ? "bg-green-500" : "bg-blue-600"}`}
                      style={{ width: `${upload.progress}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-[9px] text-gray-500 font-mono">
                    <span>السرعة: {upload.speed}</span>
                    <span>متبقي: {upload.timeRemaining}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer Bar */}
        <div className="px-6 py-3 bg-white border-t border-gray-200 text-[11px] font-bold text-gray-500 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-4">
            <span className="bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200">
              {contents.folders.length + contents.files.length} عناصر في هذا المجلد
            </span>
            {selectedItems.size > 0 && (
              <span className="text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200">
                {selectedItems.size} عناصر محددة
              </span>
            )}
          </div>
          <div className="text-gray-400 flex items-center gap-1.5">
            <Settings size={12} /> كليك يمين للخيارات • Ctrl للتحديد المتعدد
          </div>
        </div>

        {/* Hidden Input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFilesSelection}
        />

        {/* Create Folder Modal */}
        {showCreateFolderModal && (
          <CreateFolderModal
            categories={categories}
            isPending={createFolderMutation.isPending}
            onConfirm={(name, cat) =>
              createFolderMutation.mutate({ name, categoryId: cat })
            }
            onClose={() => setShowCreateFolderModal(false)}
          />
        )}
      </div>
    </div>
  );
}

// ============================================================================
// 💡 ENHANCED LIST ITEM (MAIN TABLE ROW FOR DASHBOARD)
// ============================================================================

function EnhancedListItem({
  transaction,
  isSelected,
  onClick,
  onDoubleClick,
  onContextMenu,
}) {
  const isLocked = transaction.locked;

  return (
    <div
      onClick={isLocked ? undefined : onClick}
      onDoubleClick={isLocked ? undefined : onDoubleClick}
      onContextMenu={(e) => onContextMenu(e, transaction)}
      className={`
        grid gap-3 items-center px-4 py-3 cursor-pointer transition-all border-b border-gray-200 relative bg-white
        ${isSelected && !isLocked ? "bg-blue-50 border-l-4 border-l-blue-600 shadow-sm z-10" : "hover:bg-gray-50 border-l-4 border-l-transparent"}
        ${isLocked ? "opacity-60 cursor-not-allowed bg-gray-50" : ""}
      `}
      style={{
        gridTemplateColumns:
          "50px 350px 90px 90px 90px 80px 90px 80px 100px 100px 80px 60px 50px",
      }}
      dir="rtl"
    >
      {/* Checkbox + Icon */}
      <div className="flex flex-col items-center gap-1.5">
        <div
          className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${isSelected ? "bg-blue-600 border-blue-600" : "border-gray-300 bg-white"}`}
        >
          {isSelected && (
            <Check size={12} className="text-white" strokeWidth={3} />
          )}
        </div>
        <FolderOpen
          size={22}
          className={isLocked ? "text-gray-400" : "text-amber-500"}
          strokeWidth={1.5}
        />
      </div>

      {/* Main Info */}
      <div className="flex flex-col min-w-0">
        <CopyableCell
          text={`${transaction.ownerFirstName} ${transaction.ownerLastName} || ${transaction.district} || ${transaction.commonName}`}
          className="text-xs font-bold text-gray-900"
          label="اسم المجلد"
        />
        {transaction.officeName && (
          <span className="text-[10px] font-semibold text-gray-500 mt-1 flex items-center gap-1">
            <Building2 size={10} /> {transaction.officeName}
          </span>
        )}
      </div>

      <CopyableCell
        text={isLocked ? "●●●" : transaction.transactionCode}
        className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded inline-block w-max"
        label="الرقم"
      />
      <CopyableCell
        text={isLocked ? "●●" : transaction.transactionType}
        className="text-xs font-bold text-gray-700"
        label="النوع"
      />
      <CopyableCell
        text={isLocked ? "●●" : transaction.district}
        className="text-xs font-bold text-gray-700"
        label="الحي"
      />
      <CopyableCell
        text={
          isLocked ? "●" : formatFileSize(transaction.rootFolder?.totalSize)
        }
        className="text-xs font-mono font-bold text-gray-600"
        label="الحجم"
      />

      <div className="text-[10px] font-mono font-bold text-gray-500">
        {isLocked ? "●●●" : transaction.rootFolder?.modifiedAt?.split("T")[0]}
      </div>

      <div className="flex flex-col items-center bg-gray-100 border border-gray-200 rounded px-2 py-1 w-max">
        <span className="text-[10px] font-bold text-gray-800">
          {transaction.createdMonth}
        </span>
        <span className="text-[9px] font-mono text-gray-500">
          {transaction.createdYear}
        </span>
      </div>

      <CopyableCell
        text={isLocked ? "●●●" : transaction.ownerFirstName || "—"}
        className="text-xs font-bold text-gray-700"
        label="المالك"
      />
      <CopyableCell
        text={isLocked ? "●●●" : transaction.clientPhone || "—"}
        className="text-[11px] font-mono font-bold text-gray-600 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded w-max"
        label="الجوال"
      />

      {/* Status */}
      <div className="text-center">
        {transaction.status === "approved" ? (
          <span className="bg-green-100 text-green-800 border border-green-200 px-2 py-1 rounded-md text-[10px] font-bold">
            مكتملة
          </span>
        ) : transaction.status === "cancelled" ? (
          <span className="bg-red-100 text-red-800 border border-red-200 px-2 py-1 rounded-md text-[10px] font-bold">
            ملغاة
          </span>
        ) : (
          <span className="bg-blue-100 text-blue-800 border border-blue-200 px-2 py-1 rounded-md text-[10px] font-bold">
            جارية
          </span>
        )}
      </div>

      {/* Lock */}
      <div className="text-center">
        <div
          className={`w-6 h-6 mx-auto rounded-md border-2 flex items-center justify-center transition-all ${isLocked ? "bg-red-600 border-red-600" : "bg-gray-50 border-gray-200"}`}
        >
          {isLocked && (
            <Check size={14} className="text-white" strokeWidth={3} />
          )}
        </div>
      </div>

      {/* Open Button */}
      <div className="text-center">
        <button
          onClick={isLocked ? undefined : onDoubleClick}
          disabled={isLocked}
          className={`p-1.5 rounded-lg transition-colors ${isLocked ? "bg-gray-100 text-gray-400" : "bg-blue-100 text-blue-700 hover:bg-blue-200"}`}
        >
          <Eye size={16} />
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// 💡 MAIN EXPORT (Dashboard)
// ============================================================================

export function TransactionFilesManager({ onClose }) {
  // 💡 إضافة استدعاء الـ QueryClient
  const queryClient = useQueryClient();

  const [deletedItems, setDeletedItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [openedTransaction, setOpenedTransaction] = useState(null);

  const [showCategoriesModal, setShowCategoriesModal] = useState(false);
  const [showTrashModal, setShowTrashModal] = useState(false);

  // 💡 State الخاصة بالكليك يمين في القائمة الرئيسية
  const [mainContextMenu, setMainContextMenu] = useState({
    show: false,
    x: 0,
    y: 0,
    transaction: null,
  });

  // 1. 💡 جلب المعاملات الحقيقية من الباك إند
  const { data: rawTransactions = [], isLoading: txLoading } = useQuery({
    queryKey: ["private-transactions-files-list"],
    queryFn: async () => {
      const res = await api.get("/private-transactions");
      return res.data?.data || [];
    },
  });

  // 2. 💡 جلب تصنيفات المجلدات من الباك إند
  const { data: categories = DEFAULT_CATEGORIES } = useQuery({
    queryKey: ["folder-categories"],
    queryFn: async () => {
      try {
        const res = await api.get("/files/categories");
        return res.data?.data?.length > 0 ? res.data.data : DEFAULT_CATEGORIES;
      } catch (e) {
        return DEFAULT_CATEGORIES;
      }
    },
  });

  // 3. 💡 حفظ التصنيفات في الباك إند
  const saveCategoriesMutation = useMutation({
    mutationFn: async (cats) =>
      await api.post("/files/categories", { categories: cats }),
    onSuccess: () => {
      queryClient.invalidateQueries(["folder-categories"]);
      toast.success("تم حفظ الإعدادات في السيرفر بنجاح");
      setShowCategoriesModal(false);
    },
    onError: () => {
      toast.error("حدث خطأ أثناء الحفظ في السيرفر (تم الحفظ محلياً)");
      setShowCategoriesModal(false);
    },
  });

  // تحويل المعاملات الحقيقية لشكل يناسب مستكشف الملفات
  const transactions = useMemo(() => {
    return rawTransactions.map((tx) => ({
      id: tx.id,
      transactionId: tx.id,
      transactionCode: tx.ref || tx.id.substring(0, 8),
      ownerFirstName: tx.clientName || tx.client || "عميل",
      ownerLastName: "",
      transactionType: tx.type || "معاملة",
      district: tx.district || "غير محدد",
      commonName: tx.internalName || "",
      officeName: tx.engineeringOffice || tx.externalSource || "",
      clientPhone: tx.phone || "",
      createdMonth: new Date(tx.createdAt || Date.now()).toLocaleDateString(
        "ar-EG",
        { month: "short" },
      ),
      createdYear: new Date(tx.createdAt || Date.now())
        .getFullYear()
        .toString(),
      status:
        tx.status === "مكتملة"
          ? "approved"
          : tx.status === "ملغاة"
            ? "cancelled"
            : "in-progress",
      locked: tx.locked || false,
      rootFolder: {
        id: null,
        name: "الرئيسية",
        totalSize: 0,
        modifiedAt: new Date(tx.createdAt || Date.now())
          .toISOString()
          .split("T")[0],
      },
    }));
  }, [rawTransactions]);

  // Filter and Sort
  const filteredTransactions = useMemo(() => {
    let result = transactions;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (tx) =>
          tx.transactionCode.toLowerCase().includes(q) ||
          tx.ownerFirstName.toLowerCase().includes(q) ||
          tx.ownerLastName.toLowerCase().includes(q) ||
          tx.brokerName?.toLowerCase().includes(q) ||
          tx.officeName?.toLowerCase().includes(q) ||
          tx.clientPhone?.includes(q),
      );
    }
    result = [...result].sort((a, b) => {
      if (sortBy === "newest")
        return (
          new Date(b.rootFolder.createdAt).getTime() -
          new Date(a.rootFolder.createdAt).getTime()
        );
      if (sortBy === "modified")
        return (
          new Date(b.rootFolder.modifiedAt).getTime() -
          new Date(a.rootFolder.modifiedAt).getTime()
        );
      if (sortBy === "largest")
        return (b.rootFolder.totalSize || 0) - (a.rootFolder.totalSize || 0);
      return 0;
    });
    return result;
  }, [transactions, searchQuery, sortBy]);

  // 💡 دوال الكليك والكليك يمين في القائمة الرئيسية
  const handleItemClick = (id, e) => {
    if (e.ctrlKey || e.metaKey) {
      const newSet = new Set(selectedItems);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      setSelectedItems(newSet);
    } else {
      setSelectedItems(new Set([id]));
    }
  };

  const handleSelectAll = () => {
    setSelectedItems(new Set(filteredTransactions.map((t) => t.transactionId)));
    toast.success(`تم تحديد ${filteredTransactions.length} مجلد`);
  };

  const handleMainContextMenu = (e, transaction) => {
    e.preventDefault();
    e.stopPropagation();
    setMainContextMenu({ show: true, x: e.clientX, y: e.clientY, transaction });
    if (!selectedItems.has(transaction.transactionId)) {
      setSelectedItems(new Set([transaction.transactionId]));
    }
  };

  const closeMainContextMenu = () => {
    setMainContextMenu({ show: false, x: 0, y: 0, transaction: null });
  };

  return (
    <div 
      className="flex flex-col h-full bg-gray-50 font-[Tajawal]" 
      dir="rtl"
      onClick={() => {
        setSelectedItems(new Set());
        closeMainContextMenu();
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        closeMainContextMenu();
      }}
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 shadow-sm shrink-0 z-10" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3">
          <div className="bg-orange-100 p-2.5 rounded-xl">
            <FolderOpen size={24} className="text-orange-600" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-800">
              نظام إدارة ملفات المعاملات
            </h2>
            <p className="text-[11px] font-bold text-slate-500 mt-0.5">
              استكشاف، تنظيم، ومشاركة المستندات بفعالية
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCategoriesModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors"
          >
            <Settings size={16} /> إعدادات المجلدات
          </button>
          <button
            onClick={() => setShowTrashModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-lg transition-colors relative"
          >
            <Trash2 size={16} /> سلة المحذوفات
            {deletedItems.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white flex items-center justify-center rounded-full text-[10px]">
                {deletedItems.length}
              </span>
            )}
          </button>
          <div className="w-px h-6 bg-gray-300 mx-2" />
          <button
            onClick={onClose}
            className="p-2 bg-gray-100 hover:bg-red-50 hover:text-red-600 rounded-lg text-gray-500 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200 shrink-0 z-10" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 w-1/2 max-w-lg">
          <div className="relative w-full">
            <Search
              size={16}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث في مجلدات المعاملات برقم، مالك، أو جوال..."
              className="w-full pl-3 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:bg-white focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] font-bold text-gray-500">ترتيب:</span>
          <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
            <button
              onClick={() => setSortBy("newest")}
              className={`px-3 py-1.5 text-[11px] font-bold rounded-md transition-colors ${sortBy === "newest" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-800"}`}
            >
              الأحدث
            </button>
            <button
              onClick={() => setSortBy("modified")}
              className={`px-3 py-1.5 text-[11px] font-bold rounded-md transition-colors ${sortBy === "modified" ? "bg-white text-green-600 shadow-sm" : "text-gray-500 hover:text-gray-800"}`}
            >
              آخر تعديل
            </button>
            <button
              onClick={() => setSortBy("largest")}
              className={`px-3 py-1.5 text-[11px] font-bold rounded-md transition-colors ${sortBy === "largest" ? "bg-white text-purple-600 shadow-sm" : "text-gray-500 hover:text-gray-800"}`}
            >
              الحجم
            </button>
          </div>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          <button
            onClick={handleSelectAll}
            className="flex items-center gap-1.5 px-3 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-[11px] font-bold transition-colors"
          >
            <CheckSquare size={14} /> تحديد الكل
          </button>
        </div>
      </div>

      {/* ── Table Header ── */}
      <div className="px-6 pt-6 shrink-0 z-10" onClick={e => e.stopPropagation()}>
        <div
          className="grid gap-3 px-4 py-3 bg-slate-800 text-white rounded-t-xl text-[11px] font-bold shadow-md"
          style={{
            gridTemplateColumns:
              "50px 350px 90px 90px 90px 80px 90px 80px 100px 100px 80px 60px 50px",
          }}
        >
          <div className="text-center">تحديد</div>
          <div>اسم المجلد / العميل / الموقع</div>
          <div>رقم المعاملة</div>
          <div>النوع</div>
          <div>الحي</div>
          <div>إجمالي الحجم</div>
          <div>تاريخ التعديل</div>
          <div className="text-center">الإنشاء</div>
          <div>المكتب المسؤول</div>
          <div>جوال العميل</div>
          <div className="text-center">الحالة</div>
          <div className="text-center">قفل</div>
          <div className="text-center">فتح</div>
        </div>
      </div>

      {/* ── Table Body ── */}
      <div className="flex-1 overflow-auto px-6 pb-6 custom-scrollbar-slim relative z-0" onClick={e => e.stopPropagation()}>
        <div className="bg-white border-x border-b border-gray-200 rounded-b-xl shadow-sm overflow-hidden min-h-[500px]">
          {txLoading ? (
            <div className="flex justify-center items-center h-[400px]">
              <Loader2 className="animate-spin text-blue-500" size={48} />
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[400px] text-gray-400">
              <FolderOpen
                size={64}
                strokeWidth={1}
                className="mb-4 opacity-50"
              />
              <p className="text-xl font-bold text-gray-600 mb-1">
                لا توجد مجلدات معاملات
              </p>
              <p className="text-xs font-semibold">
                تأكد من شريط البحث أو ابدأ بإنشاء معاملة جديدة ليتم تكوين مجلدها
                تلقائياً
              </p>
            </div>
          ) : (
            filteredTransactions.map((tx) => (
              <EnhancedListItem
                key={tx.transactionId}
                transaction={tx}
                isSelected={selectedItems.has(tx.transactionId)}
                onClick={(e) => handleItemClick(tx.transactionId, e)}
                onDoubleClick={() => setOpenedTransaction(tx)}
                onContextMenu={handleMainContextMenu} // 💡 🚀 ربطنا الكليك يمين هنا
              />
            ))
          )}
        </div>
      </div>

      {/* ── Main Context Menu ── */}
      {mainContextMenu.show && mainContextMenu.transaction && (
        <>
          <div className="fixed inset-0 z-[300]" onClick={closeMainContextMenu} onContextMenu={(e) => { e.preventDefault(); closeMainContextMenu(); }} />
          <div
            className="fixed z-[310] bg-white rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.2)] border border-gray-200 py-1.5 min-w-[200px] font-bold animate-in fade-in"
            style={{ top: mainContextMenu.y, left: mainContextMenu.x }}
          >
            <div className="px-4 py-2 border-b border-gray-100 mb-1 bg-blue-50/50">
              <p className="text-xs text-blue-800 truncate" title={mainContextMenu.transaction.transactionCode}>
                مجلد المعاملة: {mainContextMenu.transaction.transactionCode}
              </p>
            </div>

            <button
              onClick={() => {
                if(!mainContextMenu.transaction.locked) {
                  setOpenedTransaction(mainContextMenu.transaction);
                } else {
                  toast.error("المعاملة مقفلة ولا يمكن فتحها");
                }
                closeMainContextMenu();
              }}
              className="w-full text-right px-4 py-2.5 hover:bg-blue-50 flex items-center gap-3 text-blue-600 text-[11px] transition-colors"
            >
              <FolderOpen size={16} /> <span>فتح المجلد</span>
            </button>

            <div className="border-t border-gray-100 my-1" />

            <button
              onClick={() => {
                copyToClipboard(mainContextMenu.transaction.transactionCode, "رقم المعاملة");
                closeMainContextMenu();
              }}
              className="w-full text-right px-4 py-2.5 hover:bg-gray-50 flex items-center gap-3 text-gray-700 text-[11px] transition-colors"
            >
              <Copy size={16} className="text-gray-500" /> <span>نسخ رقم المعاملة</span>
            </button>
            <button
              onClick={() => {
                copyToClipboard(`${mainContextMenu.transaction.ownerFirstName} ${mainContextMenu.transaction.ownerLastName}`, "اسم المالك");
                closeMainContextMenu();
              }}
              className="w-full text-right px-4 py-2.5 hover:bg-gray-50 flex items-center gap-3 text-gray-700 text-[11px] transition-colors"
            >
              <User size={16} className="text-gray-500" /> <span>نسخ اسم المالك</span>
            </button>

            <div className="border-t border-gray-100 my-1" />

            <button
              onClick={() => {
                toast.info("حذف مجلدات المعاملات يتم من شاشة سجل المعاملات لأغراض أمنية");
                closeMainContextMenu();
              }}
              className="w-full text-right px-4 py-2.5 hover:bg-red-50 flex items-center gap-3 text-red-600 text-[11px] transition-colors"
            >
              <Trash2 size={16} /> <span>حذف المجلد</span>
            </button>
          </div>
        </>
      )}

      {/* ── Sub Modals ── */}
      {openedTransaction && (
        <FolderViewerWindow
          transaction={openedTransaction}
          categories={categories}
          onClose={() => setOpenedTransaction(null)}
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