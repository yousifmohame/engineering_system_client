import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Folder,
  FolderOpen,
  FileText,
  ChevronRight,
  ChevronDown,
  Plus,
  Trash2,
  Edit2,
  GripVertical,
  Search,
  Layers,
  List,
  CheckCircle,
  AlertCircle,
  Settings2,
  PanelLeft,
  X,
  Home,
  BarChart3,
  Filter,
  MoreVertical,
  Copy,
  Move,
  Info,
  Zap,
  Shield,
  Users,
  Activity,
  Maximize2,
  Minimize2,
} from 'lucide-react';

import usePermissionStore from '../../../../stores/usePermissionStore';

// ============================================================
// UTILITY COMPONENTS
// ============================================================

const StatCard = ({ icon: Icon, label, value, color, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay }}
    className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
  >
    <div className="flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>
        <Icon size={18} className="text-white" />
      </div>
      <div>
        <div className="text-2xl font-bold text-slate-800">{value}</div>
        <div className="text-xs text-slate-500 font-medium">{label}</div>
      </div>
    </div>
  </motion.div>
);

const Breadcrumb = ({ path, onNavigate }) => (
  <div className="flex items-center gap-2 text-sm overflow-x-auto">
    <button
      onClick={() => onNavigate(null)}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors whitespace-nowrap"
    >
      <Home size={14} />
      <span className="font-semibold">الرئيسية</span>
    </button>
    {path.map((node, index) => (
      <React.Fragment key={node.id}>
        <ChevronRight size={14} className="text-slate-400" />
        <button
          onClick={() => onNavigate(node.id)}
          className="px-3 py-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors whitespace-nowrap font-medium"
        >
          {node.name}
        </button>
      </React.Fragment>
    ))}
  </div>
);

const ActionButton = ({ icon: Icon, onClick, color, tooltip, disabled = false }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    title={tooltip}
    className={`p-2 rounded-lg transition-all duration-200 ${
      disabled
        ? 'opacity-30 cursor-not-allowed bg-slate-100'
        : `hover:bg-${color}-50 hover:text-${color}-600 text-slate-500`
    }`}
  >
    <Icon size={16} />
  </button>
);

// ============================================================
// MAIN COMPONENT
// ============================================================

const PermissionTreeBuilder = () => {
  // ==========================================
  // STATES
  // ==========================================
  const [viewMode, setViewMode] = useState('tree');
  const [editingNode, setEditingNode] = useState(null);
  const [editName, setEditName] = useState('');

  const [showAddGroup, setShowAddGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupParent, setNewGroupParent] = useState(null);

  const [isDragging, setIsDragging] = useState(false);
  const [dropTarget, setDropTarget] = useState(null);

  const [selectedNodeDetails, setSelectedNodeDetails] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [navigationPath, setNavigationPath] = useState([]);
  const [showStats, setShowStats] = useState(true);

  const treeContainerRef = useRef(null);

  // ==========================================
  // STORE
  // ==========================================
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
    expandAll,
    collapseAll,
    moveNode,
    addGroup,
    renameNode,
    deleteNode,
    loadPermissionTree,
    loadFlatPermissions,
    setSearchQuery,
  } = usePermissionStore();

  // ==========================================
  // COMPUTED VALUES
  // ==========================================
  const stats = useMemo(() => {
    const countNodes = (nodes) => {
      let count = 0;
      nodes.forEach(node => {
        count++;
        if (node.children) count += countNodes(node.children);
      });
      return count;
    };

    const totalNodes = countNodes(permissionTree);
    const groupsCount = permissionTree.filter(n => n.children?.length > 0).length;
    const permissionsCount = flatPermissions.length;
    const selectedCount = selectedNodes.size;

    return { totalNodes, groupsCount, permissionsCount, selectedCount };
  }, [permissionTree, flatPermissions, selectedNodes]);

  // ==========================================
  // LOAD
  // ==========================================
  useEffect(() => {
    loadPermissionTree();
    loadFlatPermissions();
  }, [loadPermissionTree, loadFlatPermissions]);

  // ==========================================
  // AUTO SCROLL WHILE DRAGGING
  // ==========================================
  useEffect(() => {
    const handleAutoScroll = (e) => {
      if (!isDragging) return;

      const scrollZone = 120;
      const scrollSpeed = 25;

      if (e.clientY < scrollZone) {
        window.scrollBy({
          top: -scrollSpeed,
          behavior: 'auto',
        });
      }

      if (window.innerHeight - e.clientY < scrollZone) {
        window.scrollBy({
          top: scrollSpeed,
          behavior: 'auto',
        });
      }
    };

    window.addEventListener('dragover', handleAutoScroll);

    return () => {
      window.removeEventListener('dragover', handleAutoScroll);
    };
  }, [isDragging]);

  // ==========================================
  // DRAG
  // ==========================================
  const handleDragStart = (e, node) => {
    setDraggedNode(node);
    setIsDragging(true);

    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedNode(null);
    setIsDragging(false);
    setDropTarget(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
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
  // EDIT
  // ==========================================
  const startEditing = (node) => {
    setEditingNode(node.id);
    setEditName(node.name);
  };

  const saveEdit = async () => {
    if (editingNode && editName.trim()) {
      await renameNode(editingNode, editName.trim());

      setEditingNode(null);
      setEditName('');
    }
  };

  const cancelEdit = () => {
    setEditingNode(null);
    setEditName('');
  };

  // ==========================================
  // ADD GROUP
  // ==========================================
  const handleAddGroup = async () => {
    if (newGroupName.trim()) {
      await addGroup(
        newGroupName.trim(),
        'sub_module',
        newGroupParent
      );

      setNewGroupName('');
      setNewGroupParent(null);
      setShowAddGroup(false);
    }
  };

  // ==========================================
  // DELETE
  // ==========================================
  const handleDelete = async (nodeId, nodeName) => {
    if (
      window.confirm(`هل أنت متأكد من حذف "${nodeName}" ؟`)
    ) {
      await deleteNode(nodeId);
    }
  };

  // ==========================================
  // SEARCH
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
        acc.push({
          ...node,
          children: filteredChildren,
        });
      }

      return acc;
    }, []);
  }, []);

  const filteredTree = filterTree(
    permissionTree,
    searchQuery
  );

  // ==========================================
  // SMART EXPAND
  // ==========================================
  const handleExpand = (nodeId) => {
    toggleNodeExpansion(nodeId);
  };

  // ==========================================
  // TREE NODE
  // ==========================================
  const renderTreeNode = (node, depth = 0) => {
    const isExpanded = expandedNodes.has(node.id);
    const isSelected = selectedNodes.has(node.id);

    const hasChildren =
      node.children && node.children.length > 0;

    const isDraggingCurrent =
      draggedNode?.id === node.id;

    return (
      <div key={node.id}>
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.15 }}
          draggable
          onDragStart={(e) =>
            handleDragStart(e, node)
          }
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, node)}
          onDragEnter={() =>
            setDropTarget(node.id)
          }
          onDragLeave={() =>
            setDropTarget(null)
          }
          onClick={() => {
            toggleNodeSelection(node.id);
            setSelectedNodeDetails(node);
          }}
          style={{
            paddingInlineStart: `${depth * 16 + 10}px`,
          }}
          className={`
            relative
            group
            flex
            items-center
            gap-2
            h-10
            px-2
            rounded-xl
            border
            cursor-pointer
            transition-all
            duration-200
            mb-1

            ${
              isSelected
                ? 'bg-[#eef7f6] border-[#0e7490]/30 shadow-sm'
                : 'bg-white border-transparent hover:border-[#e8ddc8] hover:bg-[#fbf8f1]'
            }

            ${
              isDraggingCurrent
                ? 'opacity-40 scale-[0.98]'
                : ''
            }

            ${
              dropTarget === node.id
                ? 'ring-2 ring-[#0e7490] bg-[#eef7f6]'
                : ''
            }
          `}
        >
          {/* DROP INDICATOR */}
          {dropTarget === node.id && (
            <div className="absolute inset-y-0 right-0 w-1 bg-[#0e7490] rounded-r-xl" />
          )}

          {/* GRIP */}
          <div className="cursor-grab active:cursor-grabbing text-[#cbd5e1] hover:text-[#0e7490]">
            <GripVertical size={14} />
          </div>

          {/* EXPAND */}
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleExpand(node.id);
              }}
              className="p-1 rounded hover:bg-[#eef7f6]"
            >
              {isExpanded ? (
                <ChevronDown
                  size={15}
                  className="text-[#0e7490]"
                />
              ) : (
                <ChevronRight
                  size={15}
                  className="text-[#94a3b8]"
                />
              )}
            </button>
          ) : (
            <div className="w-5" />
          )}

          {/* ICON */}
          {hasChildren ? (
            isExpanded ? (
              <FolderOpen
                size={17}
                className="text-[#d8b46a]"
              />
            ) : (
              <Folder
                size={17}
                className="text-[#0e7490]"
              />
            )
          ) : (
            <FileText
              size={15}
              className="text-[#94a3b8]"
            />
          )}

          {/* NAME */}
          {editingNode === node.id ? (
            <input
              value={editName}
              onChange={(e) =>
                setEditName(e.target.value)
              }
              onBlur={saveEdit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') saveEdit();

                if (e.key === 'Escape')
                  cancelEdit();
              }}
              autoFocus
              className="
                flex-1
                h-7
                px-2
                rounded-lg
                border
                border-[#0e7490]
                text-[11px]
                font-black
                outline-none
              "
            />
          ) : (
            <div className="flex-1 min-w-0">
              <div
                className={`
                  truncate
                  text-[11px]
                  font-black

                  ${
                    hasChildren
                      ? 'text-[#123f59]'
                      : 'text-[#475569]'
                  }
                `}
              >
                {node.name}
              </div>

              {node.code && (
                <div className="text-[8px] text-[#94a3b8] font-mono truncate">
                  {node.code}
                </div>
              )}
            </div>
          )}

          {/* ACTIONS */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                startEditing(node);
              }}
              className="p-1.5 rounded-lg hover:bg-[#eef7f6]"
            >
              <Edit2
                size={13}
                className="text-[#64748b]"
              />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setNewGroupParent(node.id);
                setShowAddGroup(true);
              }}
              className="p-1.5 rounded-lg hover:bg-green-50"
            >
              <Plus
                size={13}
                className="text-green-600"
              />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();

                handleDelete(
                  node.id,
                  node.name
                );
              }}
              className="p-1.5 rounded-lg hover:bg-red-50"
            >
              <Trash2
                size={13}
                className="text-red-500"
              />
            </button>
          </div>
        </motion.div>

        {/* CHILDREN */}
        <AnimatePresence>
          {isExpanded && hasChildren && (
            <motion.div
              initial={{
                opacity: 0,
                height: 0,
              }}
              animate={{
                opacity: 1,
                height: 'auto',
              }}
              exit={{
                opacity: 0,
                height: 0,
              }}
              transition={{
                duration: 0.18,
              }}
              className="relative"
            >
              {node.children.map((child) =>
                renderTreeNode(child, depth + 1)
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  // ==========================================
  // FLAT VIEW
  // ==========================================
  const renderFlatView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
      {flatPermissions
        .filter((p) =>
          p.name
            .toLowerCase()
            .includes(
              searchQuery.toLowerCase()
            )
        )
        .map((permission) => (
          <motion.div
            key={permission.id}
            initial={{
              opacity: 0,
              y: 10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="
              p-3
              bg-white
              border
              border-[#e8ddc8]
              rounded-2xl
              hover:shadow-md
              transition-all
            "
          >
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#eef7f6] flex items-center justify-center">
                <FileText
                  size={16}
                  className="text-[#0e7490]"
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-black text-[#123f59] truncate">
                  {permission.name}
                </div>

                <div className="mt-1 text-[9px] text-[#94a3b8] font-mono truncate">
                  {permission.code}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
    </div>
  );

  // ==========================================
  // JSX
  // ==========================================
  return (
    <div className="h-screen bg-[#f4f1ea] flex overflow-hidden">
      {/* SIDEBAR */}
      <div className="w-[420px] bg-white border-l border-[#e8ddc8] flex flex-col">
        {/* HEADER */}
        <div className="p-4 border-b border-[#e8ddc8]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PanelLeft
                size={20}
                className="text-[#0e7490]"
              />

              <div>
                <h1 className="text-[15px] font-black text-[#123f59]">
                  شجرة الصلاحيات
                </h1>

                <p className="text-[10px] text-[#64748b] mt-1">
                  اسحب وافلت لبناء الهيكل
                </p>
              </div>
            </div>
          </div>

          {/* SEARCH */}
          <div className="relative mt-4">
            <Search
              size={15}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8]"
            />

            <input
              value={searchQuery}
              onChange={(e) =>
                setSearchQuery(e.target.value)
              }
              placeholder="بحث..."
              className="
                w-full
                h-10
                pr-9
                pl-3
                rounded-xl
                border
                border-[#e8ddc8]
                bg-[#fbf8f1]
                text-[11px]
                font-black
                outline-none
              "
            />
          </div>

          {/* TOOLBAR */}
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={expandAll}
              className="
                flex-1
                h-9
                rounded-xl
                bg-[#eef7f6]
                text-[#0e7490]
                text-[10px]
                font-black
              "
            >
              توسيع الكل
            </button>

            <button
              onClick={collapseAll}
              className="
                flex-1
                h-9
                rounded-xl
                bg-[#fbf8f1]
                text-[#64748b]
                text-[10px]
                font-black
              "
            >
              طي الكل
            </button>
          </div>
        </div>

        {/* TREE */}
        <div
          ref={treeContainerRef}
          className="flex-1 overflow-y-auto p-3"
        >
          {viewMode === 'tree' ? (
            filteredTree.length > 0 ? (
              filteredTree.map((node) =>
                renderTreeNode(node)
              )
            ) : (
              <div className="h-full flex items-center justify-center text-[#94a3b8] text-[11px] font-black">
                لا توجد نتائج
              </div>
            )
          ) : (
            renderFlatView()
          )}
        </div>

        {/* FOOTER */}
        <div className="p-3 border-t border-[#e8ddc8] bg-[#fbf8f1]">
          <button
            onClick={() => {
              setNewGroupParent(null);
              setShowAddGroup(true);
            }}
            className="
              w-full
              h-11
              rounded-xl
              bg-[#0e7490]
              text-white
              text-[11px]
              font-black
              flex
              items-center
              justify-center
              gap-2
            "
          >
            <Plus size={16} />
            إضافة عنصر جديد
          </button>
        </div>
      </div>

      {/* DETAILS PANEL */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* TOP BAR */}
        <div className="h-[72px] bg-white border-b border-[#e8ddc8] px-6 flex items-center justify-between">
          <div>
            <h2 className="text-[16px] font-black text-[#123f59]">
              تفاصيل الصلاحية
            </h2>

            <p className="text-[11px] text-[#64748b] mt-1">
              اختر أي عنصر من الشجرة لعرض التفاصيل
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                setViewMode('tree')
              }
              className={`
                h-10
                px-4
                rounded-xl
                text-[10px]
                font-black
                transition-all

                ${
                  viewMode === 'tree'
                    ? 'bg-[#0e7490] text-white'
                    : 'bg-[#fbf8f1] text-[#64748b]'
                }
              `}
            >
              هرمي
            </button>

            <button
              onClick={() =>
                setViewMode('flat')
              }
              className={`
                h-10
                px-4
                rounded-xl
                text-[10px]
                font-black
                transition-all

                ${
                  viewMode === 'flat'
                    ? 'bg-[#0e7490] text-white'
                    : 'bg-[#fbf8f1] text-[#64748b]'
                }
              `}
            >
              مسطح
            </button>
          </div>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto p-6">
          {selectedNodeDetails ? (
            <div className="max-w-3xl">
              <div className="bg-white border border-[#e8ddc8] rounded-3xl p-6 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-[#eef7f6] flex items-center justify-center">
                    <Settings2
                      size={26}
                      className="text-[#0e7490]"
                    />
                  </div>

                  <div>
                    <h3 className="text-[22px] font-black text-[#123f59]">
                      {selectedNodeDetails.name}
                    </h3>

                    <p className="text-[11px] text-[#94a3b8] mt-1 font-mono">
                      {selectedNodeDetails.code ||
                        'NO_CODE'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-8">
                  <div className="p-4 rounded-2xl bg-[#fbf8f1] border border-[#e8ddc8]">
                    <div className="text-[10px] text-[#94a3b8] font-bold">
                      النوع
                    </div>

                    <div className="mt-2 text-[13px] font-black text-[#123f59]">
                      {selectedNodeDetails.children
                        ?.length
                        ? 'مجموعة / شاشة'
                        : 'صلاحية مفردة'}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#fbf8f1] border border-[#e8ddc8]">
                    <div className="text-[10px] text-[#94a3b8] font-bold">
                      الأبناء
                    </div>

                    <div className="mt-2 text-[13px] font-black text-[#123f59]">
                      {selectedNodeDetails.children
                        ?.length || 0}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center">
              <Layers
                size={60}
                className="text-[#dbe4ea]"
              />

              <h3 className="mt-4 text-[15px] font-black text-[#64748b]">
                اختر صلاحية
              </h3>

              <p className="text-[11px] text-[#94a3b8] mt-1">
                اضغط على أي عنصر داخل الشجرة
              </p>
            </div>
          )}
        </div>
      </div>

      {/* DRAG OVERLAY */}
      <AnimatePresence>
        {draggedNode && (
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.9,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              scale: 0.9,
            }}
            className="
              fixed
              bottom-6
              left-6
              z-[9999]
              pointer-events-none
            "
          >
            <div className="bg-[#123f59] text-white px-5 py-3 rounded-2xl shadow-2xl">
              <div className="text-[10px] text-white/70 font-bold">
                جاري نقل
              </div>

              <div className="text-[12px] font-black mt-1">
                {draggedNode.name}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LOADING */}
      {isLoading && (
        <div className="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-[99999]">
          <div className="w-12 h-12 rounded-full border-4 border-[#e8ddc8] border-t-[#0e7490] animate-spin"></div>
        </div>
      )}

      {/* ERROR */}
      {error && (
        <div className="fixed bottom-5 right-5 bg-red-500 text-white px-4 py-3 rounded-2xl shadow-2xl text-[11px] font-black z-[99999]">
          {error}
        </div>
      )}

      {/* ADD MODAL */}
      <AnimatePresence>
        {showAddGroup && (
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            className="
              fixed
              inset-0
              bg-black/40
              backdrop-blur-sm
              z-[99999]
              flex
              items-center
              justify-center
              p-4
            "
          >
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.95,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                scale: 0.95,
              }}
              className="
                w-full
                max-w-md
                bg-white
                rounded-3xl
                border
                border-[#e8ddc8]
                shadow-2xl
                p-6
              "
            >
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-[16px] font-black text-[#123f59]">
                    إضافة عنصر
                  </h3>

                  <p className="text-[10px] text-[#94a3b8] mt-1">
                    إنشاء مجموعة أو شاشة جديدة
                  </p>
                </div>

                <button
                  onClick={() =>
                    setShowAddGroup(false)
                  }
                  className="w-9 h-9 rounded-xl hover:bg-gray-100 flex items-center justify-center"
                >
                  <X size={16} />
                </button>
              </div>

              <input
                value={newGroupName}
                onChange={(e) =>
                  setNewGroupName(
                    e.target.value
                  )
                }
                placeholder="اسم العنصر..."
                className="
                  w-full
                  h-12
                  px-4
                  rounded-2xl
                  border
                  border-[#e8ddc8]
                  bg-[#fbf8f1]
                  text-[12px]
                  font-black
                  outline-none
                "
              />

              <div className="flex justify-end gap-2 mt-5">
                <button
                  onClick={() =>
                    setShowAddGroup(false)
                  }
                  className="
                    h-11
                    px-5
                    rounded-2xl
                    bg-[#fbf8f1]
                    text-[#64748b]
                    text-[11px]
                    font-black
                  "
                >
                  إلغاء
                </button>

                <button
                  onClick={handleAddGroup}
                  className="
                    h-11
                    px-5
                    rounded-2xl
                    bg-[#0e7490]
                    text-white
                    text-[11px]
                    font-black
                  "
                >
                  حفظ
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