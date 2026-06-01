import React, { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Folder,
  FileText,
  ChevronDown,
  ChevronUp,
  Trash2,
  Edit2,
  GripHorizontal,
  Search,
  Layers,
  Settings2,
  PanelRight,
  X,
  Maximize2,
  Minimize2,
  Unlink,
  Plus,
} from "lucide-react";

import usePermissionStore from "../../../../stores/usePermissionStore";

// ============================================================
// 🚀 CSS المُهندس خصيصاً للغة العربية (RTL) - لا ينكسر أبداً
// ============================================================
const advancedOrgStyles = `
  /* حاوية الهيكل الأساسية */
  .org-wrapper {
    display: flex;
    justify-content: center;
    direction: rtl;
    padding: 40px;
    min-width: max-content;
  }
  /* عقدة الشجرة (تحوي البطاقة وأبنائها) */
  .org-node-container {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  /* حاوية الأبناء */
  .org-children {
    display: flex;
    padding-top: 32px;
    position: relative;
    justify-content: center;
  }
  /* الخط العمودي النازل من الأب إلى حاوية الأبناء */
  .org-children::before {
    content: '';
    position: absolute;
    top: 0;
    right: 50%;
    width: 2px;
    height: 32px;
    background-color: #94a3b8;
    margin-right: -1px; /* تمركز دقيق للخط */
  }
  /* الابن الفردي */
  .org-child {
    padding-top: 32px;
    position: relative;
    display: flex;
    justify-content: center;
    padding-left: 12px;
    padding-right: 12px;
  }
  /* الخط الأفقي الرابط بين الأبناء */
  .org-child::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
    height: 2px;
    background-color: #94a3b8;
  }
  /* ضبط الخط الأفقي للابن الأول والأخير (RTL) */
  .org-child:first-child::before {
    right: 50%;
  }
  .org-child:last-child::before {
    left: 50%;
  }
  /* إخفاء الخط الأفقي إذا كان ابناً وحيداً */
  .org-child:only-child::before {
    display: none;
  }
  /* الخط العمودي النازل من الخط الأفقي إلى البطاقة */
  .org-child::after {
    content: '';
    position: absolute;
    top: 0;
    right: 50%;
    width: 2px;
    height: 32px;
    background-color: #94a3b8;
    margin-right: -1px;
  }
`;

// ============================================================
// UTILITY COMPONENTS
// ============================================================
const ActionButton = ({
  icon: Icon,
  onClick,
  color,
  tooltip,
  disabled = false,
}) => (
  <button
    onClick={(e) => {
      e.stopPropagation();
      onClick(e);
    }}
    disabled={disabled}
    title={tooltip}
    className={`p-[7px] rounded-full transition-all duration-300 bg-white shadow-md border border-slate-100 ${
      disabled
        ? "opacity-30 cursor-not-allowed"
        : `hover:bg-${color}-50 text-${color}-600 hover:scale-110 hover:shadow-lg`
    }`}
  >
    <Icon size={14} strokeWidth={2.5} />
  </button>
);

// ============================================================
// MAIN COMPONENT
// ============================================================
const PermissionTreeBuilder = () => {
  const [viewMode, setViewMode] = useState("tree");
  const [editingNode, setEditingNode] = useState(null);
  const [editName, setEditName] = useState("");

  const [showAddGroup, setShowAddGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");

  const [isDragging, setIsDragging] = useState(false);
  const [dropTarget, setDropTarget] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [selectedNodeDetails, setSelectedNodeDetails] = useState(null);
  const treeContainerRef = useRef(null);

  const {
    permissionTree,
    flatPermissions,
    expandedNodes,
    selectedNodes,
    draggedNode,
    isLoading,
    error,
    searchQuery,

    toggleNodeExpansion,
    toggleNodeSelection,
    setDraggedNode,
    moveNode,
    addGroup,
    renameNode,
    deleteNode,
    loadPermissionTree,
    loadFlatPermissions,
    setSearchQuery,
  } = usePermissionStore();

  useEffect(() => {
    loadPermissionTree();
    loadFlatPermissions();
  }, [loadPermissionTree, loadFlatPermissions]);

  // ==========================================
  // ⚡ DRAG & DROP (PERFORMANCE OPTIMIZED)
  // ==========================================
  const handleDragStart = (e, node) => {
    e.stopPropagation();
    setDraggedNode(node);
    setIsDragging(true);
    e.dataTransfer.effectAllowed = "move";

    // صورة شفافة للماوس أثناء السحب لتجنب الظل المزعج للمتصفح
    const img = new Image();
    img.src =
      "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
    e.dataTransfer.setDragImage(img, 0, 0);
  };

  const handleDragEnd = () => {
    setDraggedNode(null);
    setIsDragging(false);
    setDropTarget(null);
  };

  // 🚀 تقليل الـ Renders: لا تقم بتحديث الـ State إلا إذا تغير الهدف الفعلي
  const handleDragOver = useCallback(
    (e, nodeId) => {
      e.preventDefault();
      e.stopPropagation();
      e.dataTransfer.dropEffect = "move";
      if (dropTarget !== nodeId) {
        setDropTarget(nodeId);
      }
    },
    [dropTarget],
  );

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e, targetNode) => {
    e.preventDefault();
    e.stopPropagation();

    if (draggedNode && draggedNode.id !== targetNode.id) {
      await moveNode(draggedNode.id, targetNode.id);
      if (!expandedNodes.has(targetNode.id)) {
        toggleNodeExpansion(targetNode.id);
      }
    }

    setDraggedNode(null);
    setIsDragging(false);
    setDropTarget(null);
  };

  // ==========================================
  // EDIT & UNLINK & DELETE
  // ==========================================
  const startEditing = (node) => {
    setEditingNode(node.id);
    setEditName(node.name);
  };

  const saveEdit = async () => {
    if (editingNode && editName.trim()) {
      await renameNode(editingNode, editName.trim());
      setEditingNode(null);
      setEditName("");
    }
  };

  const handleUnlink = async (node) => {
    if (
      window.confirm(
        `هل أنت متأكد من فك ارتباط "${node.name}" وجعله عنصراً رئيسياً مستقلاً؟`,
      )
    ) {
      await moveNode(node.id, null);
    }
  };

  const handleAddGroup = async () => {
    if (newGroupName.trim()) {
      await addGroup(newGroupName.trim(), "sub_module", null);
      setNewGroupName("");
      setShowAddGroup(false);
    }
  };

  const handleDelete = async (nodeId, nodeName) => {
    if (window.confirm(`هل أنت متأكد من حذف "${nodeName}" وكل ما يتفرع منه؟`)) {
      await deleteNode(nodeId);
      if (selectedNodeDetails?.id === nodeId) setSelectedNodeDetails(null);
    }
  };

  // ==========================================
  // SEARCH FILTER
  // ==========================================
  const filterTree = useCallback((nodes, query) => {
    if (!query) return nodes;
    return nodes.reduce((acc, node) => {
      const matchesSearch = node.name
        .toLowerCase()
        .includes(query.toLowerCase());
      const filteredChildren = node.children
        ? filterTree(node.children, query)
        : [];
      if (matchesSearch || filteredChildren.length > 0) {
        acc.push({ ...node, children: filteredChildren });
      }
      return acc;
    }, []);
  }, []);

  const filteredTree = filterTree(permissionTree, searchQuery);

  // ==========================================
  // 🎨 NODE STYLING (Matching the Provided Image)
  // ==========================================
  const getNodeStyle = (depth) => {
    switch (depth) {
      case 0:
        return "bg-slate-50 border-[3px] border-slate-300 text-slate-800 shadow-[0_8px_20px_rgba(0,0,0,0.06)] rounded-xl";
      case 1:
        return "bg-sky-50 border-[3px] border-sky-400 text-sky-900 shadow-[0_8px_20px_rgba(56,189,248,0.15)] rounded-xl";
      case 2:
        return "bg-emerald-50 border-[3px] border-emerald-500 text-emerald-900 shadow-[0_8px_20px_rgba(16,185,129,0.15)] rounded-xl";
      default:
        return "bg-[#3b82f6] border-[3px] border-[#2563eb] text-white shadow-lg rounded-full px-8 py-3";
    }
  };

  // ==========================================
  // TREE NODE RENDERER (Robust Structural Layout)
  // ==========================================
  const renderOrgNode = (node, depth = 0) => {
    const isExpanded = expandedNodes.has(node.id);
    const isSelected = selectedNodes.has(node.id);
    const hasChildren = node.children && node.children.length > 0;
    const isDraggingCurrent = draggedNode?.id === node.id;
    const isDropTarget = dropTarget === node.id;
    const isDeepNode = depth >= 3;

    return (
      <div className="org-node-container" key={node.id}>
        {/* 🔥 منطقة الهيت بوكس (Hitbox) لتسهيل الإفلات */}
        <div
          className="relative pt-2"
          onDragOver={(e) => handleDragOver(e, node.id)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, node)}
        >
          {/* THE CARD */}
          <motion.div
            layout="position"
            draggable
            onDragStart={(e) => handleDragStart(e, node)}
            onDragEnd={handleDragEnd}
            onClick={(e) => {
              e.stopPropagation();
              toggleNodeSelection(node.id);
              setSelectedNodeDetails(node);
            }}
            className={`
              relative group flex flex-col items-center justify-center min-w-[160px] max-w-[220px] cursor-pointer transition-all duration-300
              ${getNodeStyle(depth)}
              ${isDraggingCurrent ? "opacity-30 scale-90" : "hover:-translate-y-1"}
              ${isDropTarget ? "ring-4 ring-orange-500 ring-offset-4 scale-105 z-50 bg-orange-50" : ""}
              ${isSelected && !isDeepNode ? "ring-2 ring-indigo-600 ring-offset-2" : ""}
            `}
            style={{ padding: isDeepNode ? "10px 24px" : "18px" }}
          >
            {/* مقبض السحب */}
            {!isDeepNode && (
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 cursor-grab text-current/40 hover:text-current/80 transition-colors">
                <GripHorizontal size={16} />
              </div>
            )}

            {/* الاسم وحالة التعديل */}
            {editingNode === node.id ? (
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={saveEdit}
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveEdit();
                  if (e.key === "Escape") cancelEdit();
                }}
                onClick={(e) => e.stopPropagation()}
                autoFocus
                className="w-full text-center px-2 py-1 text-sm font-bold text-slate-800 bg-white border-2 border-indigo-400 rounded-md outline-none"
              />
            ) : (
              <div className="text-center w-full">
                <div
                  className={`font-black break-words leading-snug ${isDeepNode ? "text-sm" : "text-[15px]"}`}
                >
                  {node.name}
                </div>
              </div>
            )}

            {/* الأزرار العائمة (Quick Actions) */}
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-auto">
              <ActionButton
                icon={Edit2}
                onClick={() => startEditing(node)}
                color="blue"
                tooltip="تعديل الاسم"
              />
              {depth > 0 && (
                <ActionButton
                  icon={Unlink}
                  onClick={() => handleUnlink(node)}
                  color="amber"
                  tooltip="فك الارتباط"
                />
              )}
              <ActionButton
                icon={Trash2}
                onClick={() => handleDelete(node.id, node.name)}
                color="rose"
                tooltip="حذف العنصر"
              />
            </div>

            {/* زر التوسيع والطي (Expand/Collapse) */}
            {hasChildren && !isDeepNode && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleNodeExpansion(node.id);
                }}
                className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-7 h-7 bg-white border-2 border-slate-300 rounded-full flex items-center justify-center text-slate-700 hover:bg-slate-100 hover:scale-110 transition-transform shadow-sm z-10"
              >
                {isExpanded ? (
                  <ChevronUp size={16} strokeWidth={3} />
                ) : (
                  <ChevronDown size={16} strokeWidth={3} />
                )}
              </button>
            )}
          </motion.div>
        </div>

        {/* RECURSIVE CHILDREN */}
        <AnimatePresence>
          {isExpanded && hasChildren && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="org-children overflow-hidden"
            >
              {node.children.map((child) => (
                <div className="org-child" key={child.id}>
                  {renderOrgNode(child, depth + 1)}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const renderFlatView = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 p-6">
      {flatPermissions
        .filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
        .map((permission) => (
          <div
            key={permission.id}
            className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex gap-3 items-center">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                <FileText size={18} className="text-indigo-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-black text-slate-800 truncate">
                  {permission.name}
                </div>
              </div>
            </div>
          </div>
        ))}
    </div>
  );

  return (
    <div
      className={`bg-slate-50 flex overflow-hidden ${isFullscreen ? "fixed inset-0 z-[99999]" : "h-[calc(100vh-80px)] rounded-3xl border border-slate-200 m-4 shadow-xl"}`}
      dir="rtl"
    >
      <style>{advancedOrgStyles}</style>

      {/* MAIN ORG CHART AREA */}
      <div className="flex-1 flex flex-col relative overflow-hidden bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9IiNjYmQ1ZTEiLz48L3N2Zz4=')]">
        {/* HEADER TOOLBAR */}
        <div className="absolute top-5 left-5 right-5 z-40 flex items-center justify-between pointer-events-none">
          <div className="pointer-events-auto relative w-80 shadow-lg rounded-2xl overflow-hidden">
            <Search
              size={18}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="البحث في الهيكل..."
              className="w-full h-12 pr-12 pl-4 bg-white/95 backdrop-blur border border-slate-200 text-sm font-bold outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div className="pointer-events-auto flex items-center gap-2 bg-white/95 backdrop-blur p-2 rounded-2xl border border-slate-200 shadow-lg">
            <button
              onClick={() => setViewMode(viewMode === "tree" ? "flat" : "tree")}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 flex items-center gap-2 transition-colors"
            >
              {viewMode === "tree" ? (
                <Layers size={16} />
              ) : (
                <PanelRight size={16} />
              )}
              {viewMode === "tree" ? "عرض القائمة" : "عرض الهيكل"}
            </button>
            <div className="w-px h-6 bg-slate-300 mx-1"></div>
            <button
              onClick={() => setShowAddGroup(true)}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 flex items-center gap-2 shadow-md transition-colors"
            >
              <Plus size={16} strokeWidth={3} /> كيان إداري جديد
            </button>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 ml-1 transition-colors"
            >
              {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>
          </div>
        </div>

        {/* TREE CANVAS */}
        <div
          ref={treeContainerRef}
          className="flex-1 overflow-auto p-16 cursor-grab active:cursor-grabbing"
          style={{ paddingTop: "100px" }}
          onMouseDown={(e) => {
            if (e.target.closest("button") || e.target.closest("input")) return;
            const el = treeContainerRef.current;
            let startX = e.pageX - el.offsetLeft;
            let startY = e.pageY - el.offsetTop;
            let scrollLeft = el.scrollLeft;
            let scrollTop = el.scrollTop;

            const onMouseMove = (e) => {
              e.preventDefault();
              const x = e.pageX - el.offsetLeft;
              const y = e.pageY - el.offsetTop;
              el.scrollLeft = scrollLeft - (x - startX);
              el.scrollTop = scrollTop - (y - startY);
            };

            const onMouseUp = () => {
              window.removeEventListener("mousemove", onMouseMove);
              window.removeEventListener("mouseup", onMouseUp);
            };

            window.addEventListener("mousemove", onMouseMove);
            window.addEventListener("mouseup", onMouseUp);
          }}
        >
          {viewMode === "tree" ? (
            <div className="org-wrapper">
              {filteredTree.length > 0 ? (
                <div className="org-children" style={{ paddingTop: 0 }}>
                  {/* Root level mapping */}
                  {filteredTree.map((node) => (
                    <div
                      className="org-child"
                      key={node.id}
                      style={{ paddingTop: 0 }}
                    >
                      {renderOrgNode(node, 0)}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-32 flex flex-col items-center text-slate-400 bg-white/50 p-10 rounded-3xl border border-slate-200">
                  <Layers
                    size={64}
                    className="mb-4 opacity-50 text-indigo-300"
                  />
                  <p className="font-black text-lg text-slate-600">
                    الشجرة فارغة أو لا توجد نتائج
                  </p>
                  <p className="text-sm mt-2">
                    قم بإنشاء كيان إداري جديد للبدء
                  </p>
                </div>
              )}
            </div>
          ) : (
            renderFlatView()
          )}
        </div>
      </div>

      {/* DETAILS SIDEBAR */}
      <div className="w-[340px] bg-white border-r border-slate-200 flex flex-col z-30 shadow-[-10px_0_30px_rgba(0,0,0,0.03)] shrink-0">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
            <Settings2 className="text-indigo-600" size={20} /> تفاصيل العنصر
          </h2>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            اضغط على أي بطاقة في الهيكل التنظيمي لعرض وتعديل خصائصها.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {selectedNodeDetails ? (
            <div className="space-y-6">
              <div className="text-center bg-slate-50 p-6 rounded-3xl border border-slate-100">
                <div className="w-20 h-20 mx-auto bg-white text-indigo-600 rounded-full flex items-center justify-center mb-4 shadow-sm border border-slate-200">
                  <Folder size={36} strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-black text-slate-800 leading-tight">
                  {selectedNodeDetails.name}
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
                  <div className="text-[11px] text-slate-500 font-bold mb-2">
                    المستوى والتصنيف
                  </div>
                  <div className="text-sm font-black text-indigo-700 bg-indigo-50 py-1 rounded-lg">
                    {selectedNodeDetails.children?.length
                      ? "مجموعة مُديرة"
                      : "موظف / نهاية فرع"}
                  </div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
                  <div className="text-[11px] text-slate-500 font-bold mb-2">
                    الكيانات التابعة
                  </div>
                  <div className="text-2xl font-black text-emerald-600">
                    {selectedNodeDetails.children?.length || 0}
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 space-y-3">
                <button
                  onClick={() => startEditing(selectedNodeDetails)}
                  className="w-full py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm font-black hover:bg-white hover:border-indigo-300 hover:text-indigo-700 transition-all flex justify-center items-center gap-2 shadow-sm"
                >
                  <Edit2 size={16} /> تغيير اسم الكيان
                </button>
                <button
                  onClick={() =>
                    handleDelete(
                      selectedNodeDetails.id,
                      selectedNodeDetails.name,
                    )
                  }
                  className="w-full py-3 bg-rose-50 text-rose-700 rounded-xl text-sm font-black hover:bg-rose-100 hover:text-rose-800 transition-all flex justify-center items-center gap-2"
                >
                  <Trash2 size={16} /> حذف الكيان بالكامل
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
              <PanelRight
                size={64}
                className="text-slate-300 mb-6"
                strokeWidth={1}
              />
              <p className="text-base font-black text-slate-600">
                اللوحة فارغة
              </p>
              <p className="text-xs text-slate-400 mt-2 max-w-[200px]">
                قم بتحديد أي بطاقة من الهيكل التنظيمي لاستعراضها.
              </p>
            </div>
          )}
        </div>
      </div>

      {isLoading && (
        <div className="fixed inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center z-[99999]">
          <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      )}

      {error && (
        <div className="fixed bottom-8 right-8 bg-rose-600 text-white px-5 py-4 rounded-2xl shadow-2xl text-sm font-bold z-[99999] flex items-center gap-3">
          <X size={20} /> {error}
        </div>
      )}

      <AnimatePresence>
        {showAddGroup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[99999] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl p-8 border border-slate-100"
            >
              <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                <Plus size={28} strokeWidth={2.5} />
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-2">
                إضافة كيان إداري جديد
              </h3>
              <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                سيظهر هذا الكيان كمستوى رئيسي في أعلى الشجرة. يمكنك لاحقاً سحبه
                وإفلاته ليكون تحت أي قسم آخر.
              </p>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">
                  اسم الكيان / الإدارة
                </label>
                <input
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="مثال: إدارة الإنتاج، موظف مبيعات..."
                  autoFocus
                  className="w-full h-14 px-4 rounded-2xl border-[2px] border-slate-200 bg-slate-50 text-sm font-bold outline-none focus:border-indigo-500 focus:bg-white transition-colors"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddGroup();
                  }}
                />
              </div>

              <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-100">
                <button
                  onClick={() => setShowAddGroup(false)}
                  className="px-6 py-3 rounded-xl bg-slate-100 text-slate-600 text-sm font-black hover:bg-slate-200 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleAddGroup}
                  disabled={!newGroupName.trim()}
                  className="px-8 py-3 rounded-xl bg-indigo-600 text-white text-sm font-black hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-md hover:shadow-lg"
                >
                  إنشاء الكيان
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PermissionTreeBuilder;
