import React, { useState, useMemo, useRef } from "react";
import {
  Folder,
  FolderOpen,
  FileText,
  Users,
  Calculator,
  ShieldCheck,
  Search,
  LayoutGrid,
  List,
  ArrowRight,
  ChevronLeft,
  Home,
  Download,
  Eye,
  Loader2,
  X,
  Lock,
  Archive,
  Plus,
  Trash2,
  Edit2,
  Copy,
  Upload,
  History,
  Activity,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "../../api/axios";

// 💡 دوال مساعدة
import {
  getFileIcon,
  getFileColor,
  formatFileSize,
  getFullUrl,
  copyToClipboard,
} from "./utils";
import { useAuth } from "../../context/AuthContext";

// 💡 استيراد المكونات المنفصلة
import FileViewerModal from "./modals/FileViewerModal";
import SystemLogsModal from "./modals/SystemLogsModal";
import SystemVersionsModal from "./modals/SystemVersionsModal";
import SystemTrashModal from "./modals/SystemTrashModal";

// ============================================================================
// 💡 1. مجلدات النظام الأساسية الثابتة
// ============================================================================
const SYSTEM_ROOT_FOLDERS = [
  {
    id: "sys-transactions",
    name: "ملفات المعاملات",
    icon: FolderOpen,
    color: "#f59e0b",
    bgClass: "bg-amber-50 text-amber-600 border-amber-200",
    desc: "أرشفة جميع المعاملات والمشاريع",
    isSystemRoot: true,
  },
  {
    id: "sys-forms",
    name: "مخرجات النماذج الداخلية",
    icon: FileText,
    color: "#3b82f6",
    bgClass: "bg-blue-50 text-blue-600 border-blue-200",
    desc: "النماذج المعبأة والمصدرة كـ PDF",
    isSystemRoot: true,
  },
  {
    id: "sys-hr",
    name: "شؤون الموظفين (HR)",
    icon: Users,
    color: "#10b981",
    bgClass: "bg-emerald-50 text-emerald-600 border-emerald-200",
    desc: "عقود، هويات، ومستندات الموظفين",
    isSystemRoot: true,
  },
  {
    id: "sys-finance",
    name: "الإدارة المالية",
    icon: Calculator,
    color: "#8b5cf6",
    bgClass: "bg-violet-50 text-violet-600 border-violet-200",
    desc: "فواتير، إيصالات، وتسويات",
    isSystemRoot: true,
  },
  {
    id: "sys-legal",
    name: "الشؤون القانونية",
    icon: ShieldCheck,
    color: "#ef4444",
    bgClass: "bg-red-50 text-red-600 border-red-200",
    desc: "السجلات التجارية والعقود الرسمية",
    isSystemRoot: true,
  },
  {
    id: "sys-archive",
    name: "الأرشيف العام",
    icon: Archive,
    color: "#64748b",
    bgClass: "bg-slate-50 text-slate-600 border-slate-200",
    desc: "ملفات عامة ومؤرشفة",
    isSystemRoot: true,
  },
];

// 💡 تمرير onClose هنا لحل خطأ ReferenceError
export default function SystemFilesExplorer({ onClose }) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const updateFileInputRef = useRef(null);

  const { user } = useAuth();
  const currentUser =
    user?.name ||
    (user?.firstName ? `${user.firstName} ${user.lastName}` : "مدير النظام");

  // ── States ──
  const [viewMode, setViewMode] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItems, setSelectedItems] = useState(new Set());

  // نظام المسارات (Breadcrumbs)
  const [pathStack, setPathStack] = useState([
    { id: "root", name: "ملفات النظام المركزية" },
  ]);
  const currentFolder = pathStack[pathStack.length - 1];
  const isAtRoot = currentFolder.id === "root";

  // النوافذ المنبثقة
  const [viewerFile, setViewerFile] = useState(null);
  const [contextMenu, setContextMenu] = useState({
    show: false,
    x: 0,
    y: 0,
    item: null,
    type: null,
  });
  const [createFolderModal, setCreateFolderModal] = useState({
    show: false,
    name: "",
  });
  const [renameModal, setRenameModal] = useState({
    show: false,
    item: null,
    type: "",
    newName: "",
  });
  const [showTrashModal, setShowTrashModal] = useState(false);

  const [fileToUpdate, setFileToUpdate] = useState(null);
  const [logsModal, setLogsModal] = useState({ show: false, file: null });
  const [versionsModal, setVersionsModal] = useState({
    show: false,
    file: null,
  });

  // ── 1. جلب البيانات ──
  const { data: folderContents, isLoading } = useQuery({
    queryKey: ["system-files", currentFolder.id],
    queryFn: async () => {
      if (isAtRoot) return { folders: SYSTEM_ROOT_FOLDERS, files: [] };
      const res = await api.get(
        `/system-files/contents?folderId=${currentFolder.id}`,
      );
      return res.data.data || { folders: [], files: [] };
    },
  });

  // ── جلب عناصر سلة المحذوفات لمعرفة العدد ──
  const { data: trashData } = useQuery({
    queryKey: ["system-trash-items"],
    queryFn: async () => {
      const res = await api.get("/system-files/trash");
      return res.data.data || { folders: [], files: [] };
    },
  });

  const trashCount =
    (trashData?.folders?.length || 0) + (trashData?.files?.length || 0);

  const displayedItems = useMemo(() => {
    if (!folderContents) return [];
    let items = [
      ...(folderContents.folders || []).map((f) => ({ ...f, _type: "folder" })),
      ...(folderContents.files || []).map((f) => ({ ...f, _type: "file" })),
    ];
    if (searchQuery)
      items = items.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    return items;
  }, [folderContents, searchQuery]);

  // ── 2. العمليات (Mutations) ──
  const createFolderMutation = useMutation({
    mutationFn: async (name) =>
      api.post("/system-files/folder", {
        name,
        parentId: currentFolder.id,
        createdBy: currentUser,
      }),
    onSuccess: () => {
      toast.success("تم إنشاء المجلد بنجاح");
      queryClient.invalidateQueries(["system-files", currentFolder.id]);
      setCreateFolderModal({ show: false, name: "" });
    },
  });

  const renameMutation = useMutation({
    mutationFn: async ({ id, type, newName }) =>
      api.put("/system-files/rename", {
        id,
        type,
        newName,
        modifiedBy: currentUser,
      }),
    onSuccess: () => {
      toast.success("تم تغيير الاسم بنجاح");
      queryClient.invalidateQueries(["system-files", currentFolder.id]);
      setRenameModal({ show: false, item: null, type: "", newName: "" });
    },
  });

  const softDeleteMutation = useMutation({
    mutationFn: async (payload) =>
      api.post("/system-files/delete", { ...payload, deletedBy: currentUser }),
    onSuccess: () => {
      toast.success("تم نقل العناصر إلى سلة المحذوفات");
      queryClient.invalidateQueries(["system-files", currentFolder.id]);
      queryClient.invalidateQueries(["system-trash-items"]);
      setSelectedItems(new Set());
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (files) => {
      const fd = new FormData();
      Array.from(files).forEach((f) =>
        fd.append("files", f, encodeURIComponent(f.name)),
      );
      fd.append("folderId", currentFolder.id);
      fd.append("uploadedBy", currentUser);

      return api.post("/system-files/upload", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: (response) => {
      toast.success("تم رفع الملفات بنجاح");
      queryClient.invalidateQueries(["system-files", currentFolder.id]);

      // 💡 استقبال تنبيهات الباك اند (مثل وجود الملف في السلة) وعرضها للعميل
      if (response.data?.warnings && response.data.warnings.length > 0) {
        response.data.warnings.forEach((warn) =>
          toast.info(warn, { duration: 7000 }),
        );
      }
    },
  });

  const uploadVersionMutation = useMutation({
    mutationFn: async ({ file, fileId }) => {
      // 💡 التعديل هنا: استلام الملف والـ ID معاً
      const fd = new FormData();
      fd.append("files", file, encodeURIComponent(file.name));
      fd.append("folderId", currentFolder.id);
      fd.append("uploadedBy", currentUser);
      fd.append("replaceFileId", fileId); // 💡 التعديل هنا: استخدام الـ ID الممرر مباشرة

      return api.post("/system-files/upload-version", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: () => {
      toast.success("تم تحديث إصدار الملف بنجاح");
      queryClient.invalidateQueries(["system-files", currentFolder.id]);
      setFileToUpdate(null);
    },
    onError: (error) => {
      toast.error("حدث خطأ أثناء رفع الإصدار الجديد");
      console.error(error);
    },
  });

  // ── Handlers ──
  const handleNavigateForward = (folder) => {
    setPathStack([
      ...pathStack,
      { id: folder.id, name: folder.name, isSystemRoot: folder.isSystemRoot },
    ]);
    setSearchQuery("");
    setSelectedItems(new Set());
  };

  const handleNavigateBack = () => {
    if (pathStack.length > 1) {
      setPathStack(pathStack.slice(0, -1));
      setSearchQuery("");
      setSelectedItems(new Set());
    }
  };

  const handleNavigateToStep = (index) => {
    setPathStack(pathStack.slice(0, index + 1));
    setSearchQuery("");
    setSelectedItems(new Set());
  };

  const handleItemClick = (e, id) => {
    e.stopPropagation();
    closeContextMenu();

    // 💡 تعديل: السماح باختيار متعدد بمجرد الضغط (Toggle)
    const newSet = new Set(selectedItems);
    if (newSet.has(id)) {
      newSet.delete(id); // إذا كان محدد مسبقاً، قم بإلغاء التحديد
    } else {
      newSet.add(id); // إذا لم يكن محدد، أضفه للمجموعة
    }

    setSelectedItems(newSet);
  };

  const handleFileClick = (file) => {
    const ext = file.extension?.toLowerCase();
    if (["pdf", "png", "jpg", "jpeg", "webp", "gif"].includes(ext)) {
      setViewerFile(file);
    } else {
      toast.info("جاري تحميل الملف...");
      window.open(getFullUrl(file.url), "_blank");
    }
  };

  const handleContextMenu = (e, item, type) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ show: true, x: e.clientX, y: e.clientY, item, type });
    if (!selectedItems.has(item.id)) setSelectedItems(new Set([item.id]));
  };

  const closeContextMenu = () =>
    setContextMenu({ show: false, x: 0, y: 0, item: null, type: null });

  const handleDeleteSelected = () => {
    if (selectedItems.size === 0) return;
    const itemsToDelete = displayedItems.filter((item) =>
      selectedItems.has(item.id),
    );
    if (itemsToDelete.some((item) => item.isSystemRoot))
      return toast.error("لا يمكن حذف مجلدات النظام الأساسية!");
    if (!window.confirm("هل أنت متأكد من نقل العناصر المحددة لسلة المحذوفات؟"))
      return;

    const folderIds = itemsToDelete
      .filter((i) => i._type === "folder")
      .map((i) => i.id);
    const fileIds = itemsToDelete
      .filter((i) => i._type === "file")
      .map((i) => i.id);

    softDeleteMutation.mutate({ folderIds, fileIds });
  };

  return (
    <div
      className="flex flex-col h-full bg-[#f8fafc] font-[Tajawal] relative"
      dir="rtl"
      onClick={() => {
        setSelectedItems(new Set());
        closeContextMenu();
      }}
    >
      {/* ── 1. Header ── */}
      <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white shrink-0 shadow-md z-20">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600/30 p-2.5 rounded-xl border border-blue-500/50">
            <Lock size={22} className="text-blue-300" />
          </div>
          <div>
            <h2 className="text-base font-black tracking-wide">
              ملفات النظام المركزية (System Explorer)
            </h2>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
              إدارة مركزية، حماية، وسجل إصدارات للملفات
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowTrashModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-400 text-xs font-bold rounded-lg transition-colors border border-slate-700 hover:border-red-500/50"
          >
            <Trash2 size={16} /> سلة المحذوفات
            {trashCount > 0 && (
              <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                {trashCount}
              </span>
            )}
          </button>
          {/* 💡 يظهر زر الإغلاق فقط إذا تم تمرير الدالة onClose (عند فتح الشاشة كنافذة) */}
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 bg-slate-800 hover:bg-red-500 hover:text-white rounded-lg text-slate-400 transition-colors"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* ── 2. Toolbar & Breadcrumbs ── */}
      <div
        className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between px-6 py-3 bg-white border-b border-slate-200 shrink-0 gap-4 shadow-sm z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar-slim pb-1 sm:pb-0">
          <button
            onClick={handleNavigateBack}
            disabled={isAtRoot}
            className={`p-1.5 rounded-lg border transition-all shrink-0 ${!isAtRoot ? "bg-white border-slate-300 hover:bg-slate-100 text-slate-700 shadow-sm" : "bg-slate-50 border-transparent text-slate-300 cursor-not-allowed"}`}
          >
            <ArrowRight size={18} />
          </button>
          <div className="h-6 w-px bg-slate-200 mx-1"></div>
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
            <button
              onClick={() => handleNavigateToStep(0)}
              className="text-blue-600 hover:bg-blue-100 p-1 rounded transition-colors shrink-0"
            >
              <Home size={16} />
            </button>
            {pathStack.length > 1 && (
              <ChevronLeft size={14} className="text-slate-400 mx-1 shrink-0" />
            )}
            {pathStack.slice(1).map((step, idx) => (
              <React.Fragment key={step.id}>
                <button
                  onClick={() => handleNavigateToStep(idx + 1)}
                  className={`text-xs whitespace-nowrap px-2 py-1 rounded transition-colors ${idx === pathStack.length - 2 ? "font-bold text-slate-800 bg-white shadow-sm border border-slate-200" : "font-semibold text-slate-500 hover:text-blue-600 hover:bg-blue-50"}`}
                >
                  {step.name}
                </button>
                {idx < pathStack.length - 2 && (
                  <ChevronLeft
                    size={14}
                    className="text-slate-400 mx-1 shrink-0"
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {!isAtRoot && (
            <div className="flex items-center gap-2 mr-2">
              <button
                onClick={() => setCreateFolderModal({ show: true, name: "" })}
                className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 rounded-lg text-xs font-bold transition-all shadow-sm"
              >
                <Folder size={14} /> إنشاء مجلد
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-xs font-bold transition-all shadow-md"
              >
                <Upload size={14} /> رفع ملف
              </button>
              {selectedItems.size > 0 && (
                <button
                  onClick={handleDeleteSelected}
                  disabled={softDeleteMutation.isPending}
                  className="flex items-center gap-1.5 px-3 py-2 bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 rounded-lg text-xs font-bold transition-all shadow-sm"
                >
                  {softDeleteMutation.isPending ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Trash2 size={14} />
                  )}{" "}
                  حذف ({selectedItems.size})
                </button>
              )}
            </div>
          )}
          <div className="relative">
            <Search
              size={14}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث..."
              className="w-48 pl-3 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:bg-white focus:border-blue-500 transition-all"
            />
          </div>
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-md transition-all ${viewMode === "grid" ? "bg-white shadow text-blue-600" : "text-slate-500 hover:text-slate-800"}`}
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-md transition-all ${viewMode === "list" ? "bg-white shadow text-blue-600" : "text-slate-500 hover:text-slate-800"}`}
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* ── 3. Content Area ── */}
      <div className="flex-1 overflow-auto bg-[#f8fafc] p-6 relative custom-scrollbar">
        {isLoading ? (
          <div className="flex flex-col justify-center items-center h-full text-blue-500 gap-3">
            <Loader2 className="animate-spin" size={40} />
            <span className="text-sm font-bold">جاري التحميل...</span>
          </div>
        ) : displayedItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 pointer-events-none">
            <FolderOpen
              size={80}
              strokeWidth={1}
              className="mb-4 opacity-30 text-blue-300"
            />
            <p className="text-xl font-black text-slate-600">المجلد فارغ</p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-5 content-start">
            {displayedItems.map((item) => {
              const isSelected = selectedItems.has(item.id);
              if (item._type === "folder") {
                return (
                  <button
                    key={item.id}
                    onClick={(e) => handleItemClick(e, item.id)}
                    onDoubleClick={() => handleNavigateForward(item)}
                    onContextMenu={(e) => handleContextMenu(e, item, "folder")}
                    className={`group flex flex-col items-center justify-start p-5 rounded-2xl border-2 cursor-pointer transition-all h-36 relative overflow-hidden ${isSelected ? "border-blue-500 bg-blue-50 shadow-md" : "border-transparent bg-white shadow-sm hover:border-blue-300 hover:shadow-lg hover:-translate-y-1"}`}
                  >
                    {item.isSystemRoot && (
                      <div className="absolute top-0 right-0 w-full h-1.5 bg-slate-800/10"></div>
                    )}
                    <div
                      className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-3 transition-transform group-hover:scale-105 ${item.bgClass || "bg-amber-50 text-amber-500"}`}
                    >
                      {item.icon ? (
                        <item.icon size={32} />
                      ) : (
                        <Folder size={32} />
                      )}
                    </div>
                    <span className="text-xs font-bold text-slate-800 text-center line-clamp-2 w-full">
                      {item.name}
                    </span>
                  </button>
                );
              } else {
                const isImage = ["png", "jpg", "jpeg", "gif", "webp"].includes(
                  item.extension?.toLowerCase(),
                );
                return (
                  <button
                    key={item.id}
                    onClick={(e) => handleItemClick(e, item.id)}
                    onDoubleClick={() => handleFileClick(item)}
                    onContextMenu={(e) => handleContextMenu(e, item, "file")}
                    className={`group relative flex flex-col items-center justify-start p-4 rounded-2xl border-2 cursor-pointer transition-all h-36 ${isSelected ? "border-blue-500 bg-blue-50 shadow-md" : "border-transparent bg-white shadow-sm hover:border-blue-300 hover:-translate-y-1"}`}
                  >
                    <div className="absolute top-2 left-2 flex flex-col gap-1 items-start">
                      {item.version > 1 && (
                        <span className="bg-purple-100 text-purple-700 text-[9px] font-black px-1.5 py-0.5 rounded shadow-sm">
                          v{item.version}
                        </span>
                      )}
                    </div>

                    {isImage ? (
                      <div className="w-14 h-14 mb-3 rounded-lg overflow-hidden border border-slate-200 shadow-sm shrink-0 group-hover:scale-105 transition-transform">
                        {/* 💡 حل تحذير الصور width, height, loading="lazy" */}
                        <img
                          src={getFullUrl(item.url)}
                          alt={item.originalName || item.name}
                          width="56"
                          height="56"
                          loading="lazy"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-14 h-14 mb-3 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        {React.createElement(getFileIcon(item.extension), {
                          size: 32,
                          color: getFileColor(item.extension),
                        })}
                      </div>
                    )}

                    <div className="w-full flex items-center justify-center gap-1">
                      {item.fileHash && (
                        <ShieldCheck
                          size={12}
                          className="text-green-500 shrink-0"
                          title="ملف موثق ومحمي"
                        />
                      )}
                      <span
                        className="text-[11px] font-bold text-slate-800 truncate w-full"
                        dir="ltr"
                        title={item.originalName || item.name}
                      >
                        {item.originalName || item.name}
                      </span>
                    </div>
                    <span className="text-[9px] font-mono text-slate-400 mt-1">
                      {formatFileSize(item.size)}
                    </span>
                  </button>
                );
              }
            })}
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-4 w-10">#</th>
                  <th className="p-4">الاسم</th>
                  <th className="p-4">تاريخ الرفع</th>
                  <th className="p-4">الحجم</th>
                  <th className="p-4 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                {displayedItems.map((item, index) => (
                  <tr
                    key={item.id}
                    onClick={(e) => handleItemClick(e, item.id)}
                    onContextMenu={(e) =>
                      handleContextMenu(e, item, item._type)
                    }
                    className={`cursor-pointer transition-colors ${selectedItems.has(item.id) ? "bg-blue-50" : "hover:bg-slate-50"}`}
                  >
                    <td className="p-4 text-slate-400 text-[10px]">
                      {index + 1}
                    </td>
                    <td className="p-4 flex items-center gap-3">
                      {item._type === "folder" ? (
                        <div
                          className={`p-1.5 rounded-lg ${item.bgClass || "bg-amber-50 text-amber-500"}`}
                        >
                          {item.icon ? (
                            <item.icon size={18} />
                          ) : (
                            <Folder size={18} />
                          )}
                        </div>
                      ) : (
                        React.createElement(getFileIcon(item.extension), {
                          size: 24,
                          color: getFileColor(item.extension),
                        })
                      )}
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          {item.fileHash && (
                            <ShieldCheck
                              size={12}
                              className="text-green-500"
                              title="موثق"
                            />
                          )}
                          <span
                            className={`font-bold ${item._type === "folder" ? "text-slate-900 hover:text-blue-600 hover:underline" : "text-slate-800"}`}
                            onClick={() =>
                              item._type === "folder" &&
                              handleNavigateForward(item)
                            }
                          >
                            {item.originalName || item.name}
                          </span>
                        </div>
                        {item.version > 1 && (
                          <span className="bg-purple-100 text-purple-700 text-[9px] font-bold px-1.5 py-0.5 rounded w-max mt-1">
                            الإصدار {item.version}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 font-mono text-slate-500">
                      {new Date(
                        item.createdAt || Date.now(),
                      ).toLocaleDateString("en-GB")}
                    </td>
                    <td className="p-4 font-mono text-slate-500">
                      {item._type === "folder"
                        ? "—"
                        : formatFileSize(item.size)}
                    </td>
                    <td className="p-4 text-center">
                      {item._type === "folder" ? (
                        <button
                          onClick={() => handleNavigateForward(item)}
                          className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded text-[10px] font-bold hover:bg-blue-600 hover:text-white transition-colors"
                        >
                          فتح المجلد
                        </button>
                      ) : (
                        <button
                          onClick={() => handleFileClick(item)}
                          className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded text-[10px] font-bold hover:bg-slate-800 hover:text-white transition-colors"
                        >
                          عرض
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
            className="fixed z-[310] bg-white rounded-xl shadow-[0_15px_50px_rgba(0,0,0,0.2)] border border-gray-200 py-1.5 min-w-[220px] font-bold animate-in fade-in zoom-in-95 duration-100"
            style={{ top: contextMenu.y, left: contextMenu.x }}
          >
            <div className="px-4 py-2 border-b border-gray-100 mb-1 bg-slate-50 text-xs text-slate-800 truncate">
              {contextMenu.item.originalName || contextMenu.item.name}
            </div>

            {contextMenu.type === "folder" ? (
              <button
                onClick={() => {
                  handleNavigateForward(contextMenu.item);
                  closeContextMenu();
                }}
                className="w-full text-right px-4 py-2 hover:bg-blue-50 flex items-center gap-3 text-blue-600 text-xs"
              >
                <FolderOpen size={14} /> فتح المجلد
              </button>
            ) : (
              <>
                <button
                  onClick={() => {
                    handleFileClick(contextMenu.item);
                    closeContextMenu();
                  }}
                  className="w-full text-right px-4 py-2.5 hover:bg-blue-50 flex items-center gap-3 text-blue-600 text-xs"
                >
                  <Eye size={15} /> عرض وفتح
                </button>
                <button
                  onClick={() => {
                    window.open(getFullUrl(contextMenu.item.url), "_blank");
                    closeContextMenu();
                  }}
                  className="w-full text-right px-4 py-2.5 hover:bg-green-50 flex items-center gap-3 text-green-600 text-xs"
                >
                  <Download size={15} /> تحميل مباشر
                </button>

                <div className="border-t border-gray-100 my-1" />
                <button
                  onClick={() => {
                    setFileToUpdate(contextMenu.item);
                    updateFileInputRef.current.click();
                    closeContextMenu();
                  }}
                  className="w-full text-right px-4 py-2.5 hover:bg-purple-50 flex items-center gap-3 text-purple-600 text-xs"
                >
                  <Upload size={15} /> رفع إصدار جديد للملف
                </button>
                <button
                  onClick={() => {
                    setVersionsModal({ show: true, file: contextMenu.item });
                    closeContextMenu();
                  }}
                  className="w-full text-right px-4 py-2.5 hover:bg-slate-50 flex items-center gap-3 text-slate-700 text-xs"
                >
                  <History size={15} /> سجل الإصدارات السابقة
                </button>
                <button
                  onClick={() => {
                    setLogsModal({ show: true, file: contextMenu.item });
                    closeContextMenu();
                  }}
                  className="w-full text-right px-4 py-2.5 hover:bg-slate-50 flex items-center gap-3 text-slate-700 text-xs"
                >
                  <Activity size={15} /> سجل الحركات (Audit Trail)
                </button>
              </>
            )}

            {!contextMenu.item.isSystemRoot && (
              <>
                <div className="border-t border-gray-100 my-1" />
                <button
                  onClick={() => {
                    setRenameModal({
                      show: true,
                      item: contextMenu.item,
                      type: contextMenu.type,
                      newName: contextMenu.item.name,
                    });
                    closeContextMenu();
                  }}
                  className="w-full text-right px-4 py-2.5 hover:bg-blue-50 flex items-center gap-3 text-blue-600 text-xs"
                >
                  <Edit2 size={15} /> تغيير الاسم
                </button>
                <button
                  onClick={() => {
                    copyToClipboard(contextMenu.item.name, "الاسم");
                    closeContextMenu();
                  }}
                  className="w-full text-right px-4 py-2.5 hover:bg-slate-50 flex items-center gap-3 text-slate-700 text-xs"
                >
                  <Copy size={15} /> نسخ الاسم
                </button>
                <div className="border-t border-gray-100 my-1" />
                <button
                  onClick={() => {
                    handleDeleteSelected();
                    closeContextMenu();
                  }}
                  className="w-full text-right px-4 py-2.5 hover:bg-red-50 flex items-center gap-3 text-red-600 text-xs"
                >
                  <Trash2 size={15} /> نقل لسلة المحذوفات
                </button>
              </>
            )}
          </div>
        </>
      )}

      {/* ── Hidden Inputs ── */}
      <input
        type="file"
        multiple
        ref={fileInputRef}
        className="hidden"
        onChange={(e) => uploadMutation.mutate(e.target.files)}
      />
      <input
        type="file"
        ref={updateFileInputRef}
        className="hidden"
        // 💡 الحل السحري: تصفير الحقل عند النقر، ليتم إطلاق حدث onChange دائماً
        onClick={(e) => {
          e.target.value = null;
        }}
        onChange={(e) => {
          const file = e.target.files[0];
          if (file && fileToUpdate) {
            const toastId = toast.loading("جاري رفع الإصدار الجديد...");
            uploadVersionMutation.mutate(
              { file, fileId: fileToUpdate.id },
              { onSettled: () => toast.dismiss(toastId) },
            );
          }
        }}
      />

      {/* ── Modals ── */}
      {createFolderModal.show && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[500]"
          onClick={() => setCreateFolderModal({ show: false, name: "" })}
        >
          <div
            className="bg-white rounded-xl p-6 w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-bold text-slate-800 mb-4">إنشاء مجلد جديد</h3>
            <input
              type="text"
              autoFocus
              value={createFolderModal.name}
              onChange={(e) =>
                setCreateFolderModal({
                  ...createFolderModal,
                  name: e.target.value,
                })
              }
              className="w-full border border-gray-300 p-2.5 rounded-lg text-sm mb-4 outline-none focus:border-blue-500"
              placeholder="اسم المجلد..."
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setCreateFolderModal({ show: false, name: "" })}
                className="px-4 py-2 bg-slate-100 rounded-lg text-xs font-bold text-gray-700"
              >
                إلغاء
              </button>
              <button
                onClick={() =>
                  createFolderMutation.mutate(createFolderModal.name)
                }
                disabled={
                  createFolderMutation.isPending || !createFolderModal.name
                }
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold"
              >
                حفظ
              </button>
            </div>
          </div>
        </div>
      )}

      {renameModal.show && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[500]"
          onClick={() => setRenameModal({ ...renameModal, show: false })}
        >
          <div
            className="bg-white rounded-xl p-6 w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-bold text-slate-800 mb-4">تغيير الاسم</h3>
            <input
              type="text"
              autoFocus
              value={renameModal.newName}
              onChange={(e) =>
                setRenameModal({ ...renameModal, newName: e.target.value })
              }
              className="w-full border border-gray-300 p-2.5 rounded-lg text-sm mb-4 outline-none focus:border-blue-500"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setRenameModal({ ...renameModal, show: false })}
                className="px-4 py-2 bg-slate-100 rounded-lg text-xs font-bold text-gray-700"
              >
                إلغاء
              </button>
              <button
                onClick={() =>
                  renameMutation.mutate({
                    id: renameModal.item.id,
                    type: renameModal.type,
                    newName: renameModal.newName,
                  })
                }
                disabled={renameMutation.isPending || !renameModal.newName}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold"
              >
                حفظ
              </button>
            </div>
          </div>
        </div>
      )}

      {viewerFile && (
        <FileViewerModal
          file={viewerFile}
          onClose={() => setViewerFile(null)}
        />
      )}
      {logsModal.show && (
        <SystemLogsModal
          file={logsModal.file}
          onClose={() => setLogsModal({ show: false, file: null })}
        />
      )}
      {versionsModal.show && (
        <SystemVersionsModal
          file={versionsModal.file}
          onClose={() => setVersionsModal({ show: false, file: null })}
        />
      )}
      {showTrashModal && (
        <SystemTrashModal
          onClose={() => setShowTrashModal(false)}
          currentUser={currentUser}
        />
      )}
    </div>
  );
}
