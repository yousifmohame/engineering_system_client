import React, { useState, useRef } from "react";
import {
  Folder,
  FolderOpen,
  FolderPlus,
  Upload,
  Trash2,
  X,
  Check,
  Image as ImageIcon,
  List,
  Settings,
  CheckSquare,
  Download,
  Eye,
  Home,
  Copy,
  LayoutGrid,
  Loader2,
  ArrowRight,
  ChevronLeft,
  Edit2,
} from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../../api/axios"; // 💡 تأكد من مسارك الخاص

import {
  getFileIcon,
  getFileColor,
  formatFileSize,
  getFullUrl,
  copyToClipboard,
} from "../utils";

import FileViewerModal from "./modals/FileViewerModal";
import CreateFolderModal from "./modals/CreateFolderModal";

// 💡 استيراد هوك المستخدم (تأكد من المسار الصحيح في مشروعك)
import { useAuth } from "../../../../context/AuthContext";

export default function FolderViewerWindow({
  transaction,
  categories,
  onClose,
}) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);

  // 💡 جلب بيانات الموظف الحالي
  const { user } = useAuth();
  const currentUser =
    user?.name ||
    (user?.firstName ? `${user.firstName} ${user.lastName}` : "مدير النظام");

  const [pathStack, setPathStack] = useState([
    { id: null, name: "الرئيسية", type: "root" },
  ]);
  const currentFolderId = pathStack[pathStack.length - 1].id;

  const [selectedItems, setSelectedItems] = useState(new Set());
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);

  // 💡 التعديل هنا: جعل القائمة (List) هي الوضع الافتراضي
  const [viewMode, setViewMode] = useState("list");

  const [contextMenu, setContextMenu] = useState({
    show: false,
    x: 0,
    y: 0,
    item: null,
    type: null,
  });

  // 💡 Rename Modal State
  const [renameModal, setRenameModal] = useState({
    show: false,
    item: null,
    type: "",
    newName: "",
  });

  const [activeUploads, setActiveUploads] = useState({});
  const [showUploadManager, setShowUploadManager] = useState(false);
  const [viewerFile, setViewerFile] = useState(null);

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

  // 2. إنشاء المجلدات
  const createFolderMutation = useMutation({
    mutationFn: async (foldersToCreateArray) => {
      for (const folderData of foldersToCreateArray) {
        const res = await api.post("/files/folder", {
          name: folderData.name,
          transactionId: transaction.transactionId,
          parentId: currentFolderId,
          createdBy: currentUser, // 💡 إرسال اسم الموظف
        });

        const newFolderId = res.data?.folder?.id;

        if (
          newFolderId &&
          folderData.subFolders &&
          folderData.subFolders.length > 0
        ) {
          for (const subName of folderData.subFolders) {
            await api.post("/files/folder", {
              name: subName,
              transactionId: transaction.transactionId,
              parentId: newFolderId,
              createdBy: currentUser,
            });
          }
        }
      }
      return true;
    },
    onSuccess: () => {
      toast.success("تم إنشاء المجلدات بنجاح");
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

    // 💡 إرسال اسم الموظف الفعلي
    fd.append("uploadedBy", currentUser);

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
          speed: "0 KB/s",
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

  // 4. الحذف الحقيقي
  const deleteMutation = useMutation({
    mutationFn: async (payload) =>
      await api.post("/files/delete", { ...payload, deletedBy: currentUser }),
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

    deleteMutation.mutate({
      folderIds,
      fileIds,
      transactionId: transaction.transactionId,
    });
  };

  // 5. 💡 تغيير الاسم
  const renameMutation = useMutation({
    mutationFn: async (payload) =>
      await api.put("/files/rename", { ...payload, modifiedBy: currentUser }),
    onSuccess: () => {
      toast.success("تم تغيير الاسم بنجاح");
      queryClient.invalidateQueries([
        "folder-contents",
        transaction.transactionId,
        currentFolderId,
      ]);
      setRenameModal({ show: false, item: null, type: "", newName: "" });
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "فشل تغيير الاسم"),
  });

  const handleRenameSubmit = (e) => {
    e.preventDefault();
    if (!renameModal.newName.trim()) return toast.error("يرجى إدخال اسم صحيح");
    renameMutation.mutate({
      id: renameModal.item.id,
      type: renameModal.type,
      newName: renameModal.newName,
    });
  };

  // ==================== Interactions ====================
  const handleItemDoubleClick = (item, type) => {
    if (type === "folder") {
      setPathStack([...pathStack, { id: item.id, name: item.name }]);
      setSelectedItems(new Set());
    } else {
      const ext = item.extension?.toLowerCase();
      const inAppSupported = [
        "pdf",
        "png",
        "jpg",
        "jpeg",
        "webp",
        "gif",
      ].includes(ext);

      if (inAppSupported) setViewerFile(item);
      else window.open(getFullUrl(item.url), "_blank");
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
    if (e) e.stopPropagation();
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) newSet.delete(itemId);
      else newSet.add(itemId);
      return newSet;
    });
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
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-[250] p-4"
      onClick={onClose}
      dir="rtl"
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-[95vw] h-[95vh] flex flex-col overflow-hidden animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        {/* ── داخل ملف FolderViewerWindow.jsx ابحث عن هذا الجزء ── */}

        <div className="flex items-center justify-between px-5 py-3 bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-800 rounded-lg border border-slate-700">
              <FolderOpen size={20} className="text-amber-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold leading-tight tracking-wide">
                ملفات المعاملة:{" "}
                <span className="font-mono text-blue-300">
                  {transaction.transactionCode}
                </span>
              </h2>

              {/* 💡 التحديث هنا: إضافة الهاتف والمكتب للمعلومات المعروضة في رأس النافذة */}
              <div className="flex items-center gap-2 mt-1">
                <p className="text-[10px] text-slate-400 font-semibold">
                  المالك: {transaction.ownerFirstName}{" "}
                  {transaction.ownerLastName}
                </p>

                {/* إذا كان الهاتف موجوداً في الـ transaction prop */}
                {transaction.clientPhone && (
                  <p className="text-[10px] font-mono bg-slate-800 text-green-400 px-1.5 py-0.5 rounded">
                    📞 {transaction.clientPhone}
                  </p>
                )}

                {/* إذا كان المكتب موجوداً في الـ transaction prop */}
                {transaction.officeName && (
                  <p className="text-[10px] bg-slate-800 text-indigo-300 px-1.5 py-0.5 rounded">
                    🏢 {transaction.officeName}
                  </p>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="hover:bg-red-500 hover:text-white p-2 rounded-lg transition-colors text-slate-400"
          >
            <X size={20} />
          </button>
        </div>

        {/* ── Toolbar ── */}
        <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 border-b border-gray-200 shrink-0 shadow-sm z-10">
          <button
            onClick={handleNavigateBack}
            disabled={pathStack.length <= 1}
            className={`p-2 rounded-lg border transition-all ${pathStack.length > 1 ? "bg-white border-gray-300 hover:bg-gray-100 text-gray-800 shadow-sm" : "bg-gray-100 border-transparent text-gray-400 cursor-not-allowed"}`}
            title="رجوع"
          >
            <ArrowRight size={18} />
          </button>

          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-3 py-2 flex-1 overflow-x-auto custom-scrollbar-slim shadow-inner">
            <Home size={14} className="text-blue-600 shrink-0" />
            {pathStack.map((step, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && (
                  <ChevronLeft
                    size={14}
                    className="text-gray-400 mx-0.5 shrink-0"
                  />
                )}
                <button
                  onClick={() => handleNavigateToPath(idx)}
                  className={`text-xs whitespace-nowrap transition-colors rounded px-1.5 py-0.5 ${idx === pathStack.length - 1 ? "font-black text-slate-800 bg-slate-100" : "font-bold text-gray-500 hover:text-blue-600 hover:bg-blue-50"}`}
                >
                  {step.name}
                </button>
              </React.Fragment>
            ))}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowCreateFolderModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 text-xs font-bold transition-all shadow-sm"
            >
              <FolderPlus size={16} />{" "}
              <span className="hidden sm:inline">إنشاء مجلد</span>
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-xs font-bold transition-all shadow-md"
            >
              <Upload size={16} />{" "}
              <span className="hidden sm:inline">رفع ملفات</span>
            </button>
            {selectedItems.size > 0 && (
              <button
                onClick={handleDeleteSelected}
                disabled={deleteMutation.isPending}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 text-xs font-bold transition-all shadow-sm"
              >
                {deleteMutation.isPending ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Trash2 size={16} />
                )}
                <span className="hidden sm:inline">
                  حذف ({selectedItems.size})
                </span>
              </button>
            )}
          </div>

          <div className="h-8 w-px bg-gray-200 mx-1" />

          {/* View Toggles */}
          <div className="flex bg-gray-200 p-1 rounded-lg border border-gray-300">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-md transition-all ${viewMode === "grid" ? "bg-white shadow text-blue-600" : "text-gray-500 hover:text-gray-800 hover:bg-gray-300"}`}
              title="عرض شبكة"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-md transition-all ${viewMode === "list" ? "bg-white shadow text-blue-600" : "text-gray-500 hover:text-gray-800 hover:bg-gray-300"}`}
              title="عرض قائمة"
            >
              <List size={16} />
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
              <Loader2 className="animate-spin text-blue-500" size={48} />
            </div>
          ) : contents.folders.length === 0 && contents.files.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 pointer-events-none">
              <FolderOpen
                size={80}
                strokeWidth={1}
                className="mb-4 opacity-40 text-blue-300"
              />
              <p className="text-xl font-black text-slate-700">
                المجلد فارغ تماماً
              </p>
              <p className="text-sm mt-2 font-bold text-slate-400">
                انقر على "رفع ملفات" أو قم بسحب المستندات وإفلاتها هنا
              </p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-5 content-start">
              {/* Folders */}
              {contents.folders.map((folder) => {
                const isSelected = selectedItems.has(folder.id);
                return (
                  <div
                    key={folder.id}
                    onClick={(e) => handleItemClick(folder.id, e)}
                    onDoubleClick={(e) =>
                      handleItemDoubleClick(folder, "folder")
                    }
                    onContextMenu={(e) =>
                      handleContextMenu(e, folder, "folder")
                    }
                    className={`group relative flex flex-col items-center justify-start p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 h-36 ${isSelected ? "border-blue-500 bg-blue-50 shadow-md ring-4 ring-blue-500/10" : "border-transparent bg-white shadow-sm hover:border-blue-300 hover:shadow-lg hover:-translate-y-1"}`}
                  >
                    <div
                      className={`absolute top-3 right-3 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${isSelected ? "bg-blue-600 border-blue-600" : "border-gray-300 bg-white opacity-0 group-hover:opacity-100"}`}
                    >
                      {isSelected && (
                        <Check
                          size={12}
                          className="text-white"
                          strokeWidth={3}
                        />
                      )}
                    </div>
                    <Folder
                      size={64}
                      fill="#FDB022"
                      color="#B45309"
                      strokeWidth={1}
                      className={`mb-3 transition-transform duration-200 ${isSelected ? "scale-105" : "group-hover:scale-105"}`}
                    />
                    <span
                      className="text-xs font-bold text-gray-800 text-center w-full line-clamp-2 leading-tight"
                      title={folder.name}
                    >
                      {folder.name}
                    </span>
                  </div>
                );
              })}

              {/* Files Grid View (With Thumbnails) */}
              {contents.files.map((file) => {
                const Icon = getFileIcon(file.extension);
                const color = getFileColor(file.extension);
                const isSelected = selectedItems.has(file.id);
                const isImage = ["png", "jpg", "jpeg", "gif", "webp"].includes(
                  file.extension?.toLowerCase(),
                );

                return (
                  <div
                    key={file.id}
                    onClick={(e) => handleItemClick(file.id, e)}
                    onDoubleClick={(e) => handleItemDoubleClick(file, "file")}
                    onContextMenu={(e) => handleContextMenu(e, file, "file")}
                    className={`group relative flex flex-col items-center justify-start p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 h-36 overflow-hidden ${isSelected ? "border-blue-500 bg-blue-50 shadow-md ring-4 ring-blue-500/10" : "border-transparent bg-white shadow-sm hover:border-blue-300 hover:shadow-lg hover:-translate-y-1"}`}
                  >
                    <div
                      className={`absolute top-3 right-3 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all z-10 ${isSelected ? "bg-blue-600 border-blue-600" : "border-gray-300 bg-white opacity-0 group-hover:opacity-100"}`}
                    >
                      {isSelected && (
                        <Check
                          size={12}
                          className="text-white"
                          strokeWidth={3}
                        />
                      )}
                    </div>

                    {/* 💡 الصورة المصغرة في الشبكة */}
                    {isImage ? (
                      <div className="w-16 h-16 mb-3 rounded-lg overflow-hidden border border-gray-200 shadow-sm shrink-0">
                        <img
                          src={getFullUrl(file.url)}
                          alt="thumbnail"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <Icon
                        size={60}
                        color={color}
                        strokeWidth={1}
                        className={`mb-3 transition-transform duration-200 ${isSelected ? "scale-105" : "group-hover:scale-105"}`}
                      />
                    )}

                    <span
                      className="text-[11px] font-bold text-gray-800 text-center w-full line-clamp-2 leading-tight"
                      dir="ltr"
                      title={file.originalName || file.name}
                    >
                      {file.originalName || file.name}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            // 💡 List View (الوضع الافتراضي مع الصور المصغرة)
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold sticky top-0 border-b border-gray-200 z-10">
                  <tr>
                    <th className="p-4 w-10 text-center">
                      <button onClick={handleSelectAll}>
                        <CheckSquare
                          size={16}
                          className="text-gray-400 hover:text-blue-600 mx-auto"
                        />
                      </button>
                    </th>
                    <th className="p-4">الاسم (موضح المصغرات)</th>
                    <th className="p-4">تاريخ التعديل</th>
                    <th className="p-4">النوع</th>
                    <th className="p-4">الحجم</th>
                    <th className="p-4">بواسطة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-semibold text-gray-700">
                  {/* Folders List */}
                  {contents.folders.map((folder) => {
                    const isSelected = selectedItems.has(folder.id);
                    return (
                      <tr
                        key={folder.id}
                        onClick={(e) => handleItemClick(folder.id, e)}
                        onDoubleClick={(e) =>
                          handleItemDoubleClick(folder, "folder")
                        }
                        onContextMenu={(e) =>
                          handleContextMenu(e, folder, "folder")
                        }
                        className={`cursor-pointer transition-colors ${isSelected ? "bg-blue-50/60" : "hover:bg-slate-50"}`}
                      >
                        <td className="p-4 text-center">
                          <div
                            className={`w-4 h-4 mx-auto rounded border-2 flex items-center justify-center transition-all ${isSelected ? "bg-blue-600 border-blue-600" : "border-gray-300 bg-white"}`}
                          >
                            {isSelected && (
                              <Check
                                size={10}
                                className="text-white"
                                strokeWidth={3}
                              />
                            )}
                          </div>
                        </td>
                        <td className="p-4 flex items-center gap-3 font-bold text-gray-900">
                          <Folder
                            size={28}
                            fill="#FDB022"
                            color="#B45309"
                            className="shrink-0"
                          />
                          {folder.name}
                        </td>
                        <td className="p-4 text-gray-500 font-mono">
                          {new Date(folder.createdAt).toLocaleDateString(
                            "en-GB",
                          )}
                        </td>
                        <td className="p-4 text-gray-500">مجلد ملفات</td>
                        <td className="p-4 text-gray-400 font-mono">—</td>
                        <td className="p-4 text-gray-500">
                          {folder.createdBy || "النظام"}
                        </td>
                      </tr>
                    );
                  })}

                  {/* Files List (With Thumbnails) */}
                  {contents.files.map((file) => {
                    const Icon = getFileIcon(file.extension);
                    const color = getFileColor(file.extension);
                    const isSelected = selectedItems.has(file.id);
                    const isImage = [
                      "png",
                      "jpg",
                      "jpeg",
                      "gif",
                      "webp",
                    ].includes(file.extension?.toLowerCase());

                    return (
                      <tr
                        key={file.id}
                        onClick={(e) => handleItemClick(file.id, e)}
                        onDoubleClick={(e) =>
                          handleItemDoubleClick(file, "file")
                        }
                        onContextMenu={(e) =>
                          handleContextMenu(e, file, "file")
                        }
                        className={`cursor-pointer transition-colors ${isSelected ? "bg-blue-50/60" : "hover:bg-slate-50"}`}
                      >
                        <td className="p-4 text-center">
                          <div
                            className={`w-4 h-4 mx-auto rounded border-2 flex items-center justify-center transition-all ${isSelected ? "bg-blue-600 border-blue-600" : "border-gray-300 bg-white"}`}
                          >
                            {isSelected && (
                              <Check
                                size={10}
                                className="text-white"
                                strokeWidth={3}
                              />
                            )}
                          </div>
                        </td>
                        <td className="p-4 flex items-center gap-3 font-bold text-gray-900">
                          {/* 💡 الصورة المصغرة هنا */}
                          {isImage ? (
                            <div className="w-8 h-8 rounded overflow-hidden border border-gray-200 shadow-sm shrink-0">
                              <img
                                src={getFullUrl(file.url)}
                                alt="thumb"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <Icon
                              size={28}
                              color={color}
                              className="shrink-0"
                            />
                          )}
                          <span dir="ltr" className="truncate max-w-xs">
                            {file.originalName || file.name}
                          </span>
                        </td>
                        <td className="p-4 text-gray-500 font-mono">
                          {new Date(file.createdAt).toLocaleDateString("en-GB")}
                        </td>
                        <td className="p-4 text-gray-500 uppercase">
                          {file.extension} File
                        </td>
                        <td className="p-4 text-gray-500 font-mono">
                          {formatFileSize(file.size)}
                        </td>
                        <td className="p-4 text-gray-500">{file.uploadedBy}</td>
                      </tr>
                    );
                  })}
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
              <div className="px-4 py-2 border-b border-gray-100 mb-1 bg-slate-50">
                <p
                  className="text-xs text-slate-800 truncate"
                  title={contextMenu.item.originalName || contextMenu.item.name}
                >
                  {contextMenu.item.originalName || contextMenu.item.name}
                </p>
                <p className="text-[10px] font-mono text-gray-400 mt-1">
                  {contextMenu.type === "folder"
                    ? "مجلد نظام"
                    : formatFileSize(contextMenu.item.size)}
                </p>
              </div>

              {contextMenu.type === "file" && (
                <>
                  <button
                    onClick={() => {
                      handleItemDoubleClick(contextMenu.item, "file");
                      closeContextMenu();
                    }}
                    className="w-full text-right px-4 py-2.5 hover:bg-blue-50 flex items-center gap-3 text-blue-600 text-xs transition-colors"
                  >
                    <Eye size={16} /> عرض وفتح
                  </button>
                  <button
                    onClick={() => {
                      window.open(getFullUrl(contextMenu.item.url), "_blank");
                      closeContextMenu();
                    }}
                    className="w-full text-right px-4 py-2.5 hover:bg-green-50 flex items-center gap-3 text-green-600 text-xs transition-colors"
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
                    className="w-full text-right px-4 py-2.5 hover:bg-blue-50 flex items-center gap-3 text-blue-600 text-xs transition-colors"
                  >
                    <FolderOpen size={16} /> فتح المجلد
                  </button>
                  <div className="border-t border-gray-100 my-1" />
                </>
              )}

              {/* 💡 زر إعادة التسمية */}
              <button
                onClick={() => {
                  setRenameModal({
                    show: true,
                    item: contextMenu.item,
                    type: contextMenu.type,
                    newName:
                      contextMenu.item.originalName || contextMenu.item.name,
                  });
                  closeContextMenu();
                }}
                className="w-full text-right px-4 py-2.5 hover:bg-blue-50 flex items-center gap-3 text-blue-600 text-xs transition-colors"
              >
                <Edit2 size={16} /> تغيير الاسم
              </button>

              <button
                onClick={() => {
                  copyToClipboard(
                    contextMenu.item.originalName || contextMenu.item.name,
                    "الاسم",
                  );
                  closeContextMenu();
                }}
                className="w-full text-right px-4 py-2.5 hover:bg-gray-50 flex items-center gap-3 text-gray-700 text-xs transition-colors"
              >
                <Copy size={16} className="text-gray-500" /> نسخ الاسم
              </button>

              <div className="border-t border-gray-100 my-1" />

              <button
                onClick={() => {
                  handleDeleteSelected();
                  closeContextMenu();
                }}
                className="w-full text-right px-4 py-2.5 hover:bg-red-50 flex items-center gap-3 text-red-600 text-xs transition-colors"
              >
                <Trash2 size={16} /> حذف{" "}
                {contextMenu.type === "folder" ? "المجلد" : "الملف"}
              </button>
            </div>
          </>
        )}

        {/* ── Upload Manager Widget ── */}
        {showUploadManager && Object.keys(activeUploads).length > 0 && (
          <div className="absolute bottom-6 left-6 w-80 bg-white rounded-xl shadow-[0_15px_50px_rgba(0,0,0,0.2)] border border-gray-200 overflow-hidden z-[200] animate-in slide-in-from-bottom-6">
            <div className="bg-slate-900 px-4 py-3 flex justify-between items-center text-white">
              <span className="text-xs font-bold flex items-center gap-2">
                <Upload size={16} className="text-blue-400" /> جاري الرفع...
              </span>
              <button
                onClick={() => setShowUploadManager(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-5 space-y-5 max-h-72 overflow-y-auto">
              {Object.entries(activeUploads).map(([id, upload]) => (
                <div key={id} className="space-y-2">
                  <div className="flex justify-between text-[11px] font-bold text-gray-700">
                    <span>{upload.filesCount} ملفات</span>
                    <span
                      className={
                        upload.status === "success"
                          ? "text-green-600"
                          : "text-blue-600"
                      }
                    >
                      {upload.progress}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden border">
                    <div
                      className={`h-full transition-all ${upload.status === "error" ? "bg-red-500" : upload.status === "success" ? "bg-green-500" : "bg-blue-600"}`}
                      style={{ width: `${upload.progress}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer Bar */}
        <div className="px-6 py-3 bg-white border-t border-gray-200 text-xs font-bold text-gray-500 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-4">
            <span className="bg-slate-100 px-3 py-1.5 rounded-lg border text-slate-700">
              {contents.folders.length + contents.files.length} عناصر
            </span>
            {selectedItems.size > 0 && (
              <span className="text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200">
                {selectedItems.size} عناصر محددة
              </span>
            )}
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

        {/* Modals */}
        {showCreateFolderModal && (
          <CreateFolderModal
            categories={categories}
            isPending={createFolderMutation.isPending}
            onConfirm={(foldersArray) =>
              createFolderMutation.mutate(foldersArray)
            }
            onClose={() => setShowCreateFolderModal(false)}
          />
        )}

        {/* 💡 نافذة تغيير الاسم */}
        {renameModal.show && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[500]"
            onClick={() => setRenameModal({ ...renameModal, show: false })}
            dir="rtl"
          >
            <div
              className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-5 py-4 border-b border-gray-200 bg-slate-50 flex items-center justify-between">
                <h3 className="font-bold text-slate-800">تغيير الاسم</h3>
                <button
                  onClick={() =>
                    setRenameModal({ ...renameModal, show: false })
                  }
                  className="text-gray-400 hover:text-red-500"
                >
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={handleRenameSubmit} className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2">
                    الاسم الجديد
                  </label>
                  <input
                    type="text"
                    autoFocus
                    value={renameModal.newName}
                    onChange={(e) =>
                      setRenameModal({
                        ...renameModal,
                        newName: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    dir="auto"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() =>
                      setRenameModal({ ...renameModal, show: false })
                    }
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={renameMutation.isPending}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold flex items-center gap-2"
                  >
                    {renameMutation.isPending && (
                      <Loader2 size={12} className="animate-spin" />
                    )}{" "}
                    حفظ التغييرات
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {viewerFile && (
          <FileViewerModal
            file={viewerFile}
            onClose={() => setViewerFile(null)}
          />
        )}
      </div>
    </div>
  );
}
