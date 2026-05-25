import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Folder, FolderOpen, FileText, ChevronRight, ChevronDown,
  Plus, Trash2, Edit2, GripVertical, Search, Layers, List,
  CheckCircle, AlertCircle, Settings2
} from 'lucide-react';
import usePermissionStore from '../../../../stores/usePermissionStore';

const PermissionTreeBuilder = () => {
  // --- Local State ---
  const [viewMode, setViewMode] = useState('tree'); // 'tree' | 'flat'
  const [editingNode, setEditingNode] = useState(null);
  const [editName, setEditName] = useState('');
  const [showAddGroup, setShowAddGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupParent, setNewGroupParent] = useState(null);
  
  // --- Global Store ---
  const {
    permissionTree, flatPermissions, expandedNodes, selectedNodes, draggedNode,
    isLoading, error, searchQuery, toggleNodeExpansion, toggleNodeSelection,
    setDraggedNode, expandAll, collapseAll, moveNode, addGroup, renameNode,
    deleteNode, loadPermissionTree, loadFlatPermissions, setSearchQuery
  } = usePermissionStore();

  // Load data on mount
  useEffect(() => {
    loadPermissionTree();
    loadFlatPermissions();
  }, [loadPermissionTree, loadFlatPermissions]);

  // --- Drag & Drop Handlers ---
  const handleDragStart = (e, node) => {
    setDraggedNode(node);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, targetNode) => {
    e.preventDefault();
    if (draggedNode && draggedNode.id !== targetNode.id) {
      await moveNode(draggedNode.id, targetNode.id);
    }
    setDraggedNode(null);
  };

  // --- Editing Handlers ---
  const startEditing = (node) => {
    setEditingNode(node.id);
    setEditName(node.name);
  };

  const saveEdit = async () => {
    if (editingNode && editName.trim()) {
      await renameNode(editingNode, editName.trim());
      cancelEdit();
    }
  };

  const cancelEdit = () => {
    setEditingNode(null);
    setEditName('');
  };

  // --- Group Handlers ---
  const handleAddGroup = async () => {
    if (newGroupName.trim()) {
      await addGroup(newGroupName.trim(), 'sub_module', newGroupParent);
      setNewGroupName('');
      setNewGroupParent(null);
      setShowAddGroup(false);
    }
  };

  const handleDelete = async (nodeId, nodeName) => {
    if (window.confirm(`هل أنت متأكد من حذف "${nodeName}"؟`)) {
      await deleteNode(nodeId);
    }
  };

  // --- Search & Filter ---
  const filterTree = useCallback((nodes, query) => {
    if (!query) return nodes;
    
    return nodes.reduce((acc, node) => {
      const matchesSearch = node.name.toLowerCase().includes(query.toLowerCase());
      const filteredChildren = node.children ? filterTree(node.children, query) : [];
      
      if (matchesSearch || filteredChildren.length > 0) {
        acc.push({ ...node, children: filteredChildren });
      }
      return acc;
    }, []);
  }, []);

  const filteredTree = filterTree(permissionTree, searchQuery);

  // ==========================================
  // Render: Tree Node (Recursive Component)
  // ==========================================
  const renderTreeNode = (node, depth = 0) => {
    const isExpanded = expandedNodes.has(node.id);
    const isSelected = selectedNodes.has(node.id);
    const isDragging = draggedNode?.id === node.id;
    const hasChildren = node.children && node.children.length > 0;
    const isPermission = node.type === 'permission';

    return (
      <div key={node.id} className="select-none">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className={`
            group flex items-center gap-2.5 p-2 rounded-lg cursor-pointer transition-all duration-200 border
            ${isDragging ? 'opacity-50 bg-[#eef7f6] border-[#0e7490]/30 border-dashed' : ''}
            ${isSelected ? 'bg-[#fbf8f1] border-[#d8b46a]/40 shadow-sm' : 'border-transparent hover:bg-white hover:border-[#e8ddc8] hover:shadow-[0_2px_8px_rgba(18,63,89,0.04)]'}
            ${!isPermission ? 'drop-target' : ''}
          `}
          // إصلاح مشكلة الـ RTL باستخدام paddingInlineStart بدلاً من marginLeft
          style={{ paddingInlineStart: `${(depth * 20) + 8}px` }}
          draggable={!isPermission}
          onDragStart={(e) => handleDragStart(e, node)}
          onDragOver={(e) => !isPermission && handleDragOver(e)}
          onDrop={(e) => !isPermission && handleDrop(e, node)}
          onClick={() => toggleNodeSelection(node.id)}
        >
          {/* مقبض السحب (Drag Handle) للمجلدات فقط */}
          {!isPermission ? (
            <div className="cursor-grab active:cursor-grabbing text-[#cbd5e1] hover:text-[#0e7490] transition-colors p-1">
              <GripVertical size={14} />
            </div>
          ) : (
            <div className="w-5 h-5 flex items-center justify-center text-[#cbd5e1]">
              <div className="w-1 h-1 rounded-full bg-[#cbd5e1]" />
            </div>
          )}

          {/* زر التوسيع / الطي */}
          {!isPermission && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleNodeExpansion(node.id);
              }}
              className={`p-0.5 rounded transition-colors ${isExpanded ? 'text-[#0e7490]' : 'text-[#94a3b8] hover:bg-[#eef7f6] hover:text-[#0e7490]'}`}
            >
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} className="rtl:rotate-180" />}
            </button>
          )}
          
          {/* الأيقونة */}
          {isPermission ? (
            <FileText size={16} className="text-[#94a3b8]" />
          ) : isExpanded ? (
            <FolderOpen size={18} className="text-[#d8b46a]" />
          ) : (
            <Folder size={18} className="text-[#0e7490]" />
          )}
          
          {/* اسم العقدة أو حقل التعديل */}
          {editingNode === node.id ? (
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={saveEdit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') saveEdit();
                if (e.key === 'Escape') cancelEdit();
              }}
              className="flex-1 px-2 py-1 text-[12px] font-black text-[#123f59] border border-[#0e7490] rounded bg-white focus:outline-none focus:ring-2 focus:ring-[#0e7490]/20"
              autoFocus
            />
          ) : (
            <span className={`flex-1 text-[12px] font-black mt-0.5 ${isPermission ? 'text-[#475569]' : 'text-[#123f59]'}`}>
              {node.name}
            </span>
          )}
          
          {/* أزرار الإجراءات (تظهر عند الـ Hover) */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pr-2">
            {!isPermission && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    startEditing(node);
                  }}
                  className="p-1.5 hover:bg-[#eef7f6] rounded text-[#94a3b8] hover:text-[#0e7490] transition-colors"
                  title="تعديل الاسم"
                >
                  <Edit2 size={13} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setNewGroupParent(node.id);
                    setShowAddGroup(true);
                  }}
                  className="p-1.5 hover:bg-[#eef7f6] rounded text-[#94a3b8] hover:text-green-600 transition-colors"
                  title="إضافة مجموعة فرعية"
                >
                  <Plus size={13} />
                </button>
              </>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(node.id, node.name);
              }}
              className="p-1.5 hover:bg-red-50 rounded text-[#94a3b8] hover:text-red-500 transition-colors"
              title="حذف"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </motion.div>
        
        {/* الأبناء (Sub-nodes) */}
        <AnimatePresence>
          {isExpanded && hasChildren && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-1 relative before:content-[''] before:absolute before:right-6 before:top-0 before:bottom-0 before:w-px before:bg-[#e8ddc8]/60"
            >
              {node.children.map(child => renderTreeNode(child, depth + 1))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  // ==========================================
  // Render: Flat View (القائمة المسطحة)
  // ==========================================
  const renderFlatView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {flatPermissions
        .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
        .map(permission => (
          <motion.div
            key={permission.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-3 p-3 bg-white border border-[#e8ddc8] rounded-xl hover:border-[#d8b46a]/50 hover:shadow-md transition-all group"
          >
            <div className="bg-[#fbf8f1] p-2 rounded-lg text-[#0e7490] mt-0.5 group-hover:bg-[#0e7490] group-hover:text-white transition-colors">
              <FileText size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-black text-[11px] text-[#123f59] leading-tight truncate">{permission.name}</h4>
              <p className="text-[9px] font-mono font-bold text-[#94a3b8] mt-1 bg-gray-50 inline-block px-1.5 py-0.5 rounded border border-gray-100 truncate max-w-full">
                {permission.code}
              </p>
            </div>
            <div className="text-[9px] font-black px-2 py-1 bg-[#eef7f6] text-[#0e7490] rounded-md shrink-0 border border-[#0e7490]/10">
              {permission.level || 'عام'}
            </div>
          </motion.div>
        ))}
    </div>
  );

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 p-4 animate-in fade-in bg-[#f4f1ea]">
      
      {/* Header & Description */}
      <div className="bg-white p-5 rounded-xl border border-[#e8ddc8] shadow-sm shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-[#123f59] flex items-center gap-2">
            <Settings2 className="w-6 h-6 text-[#d8b46a]" />
            باني الأدوار الاستراتيجي والمجموعات
          </h1>
          <p className="text-[11px] font-bold text-[#64748b] mt-1.5 max-w-2xl leading-relaxed">
            قم بتنظيم الصلاحيات في هيكل شجري هرمي عبر السحب والإفلات. يمكنك إعادة تسمية المجموعات، بناء تفريعات عميقة، وحفظها لتنعكس على كامل النظام والصلاحيات.
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-xl border border-[#e8ddc8] shadow-sm p-3 shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#94a3b8]" size={16} />
          <input
            type="text"
            placeholder="بحث عن صلاحية أو مجموعة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-9 pl-3 py-2 bg-[#fbf8f1] border border-[#e8ddc8] rounded-lg text-[11px] font-bold text-[#123f59] focus:outline-none focus:border-[#d8b46a] focus:ring-1 focus:ring-[#d8b46a]/30 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-[#fbf8f1] border border-[#e8ddc8] rounded-lg p-1">
            <button
              onClick={() => setViewMode('tree')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors text-[10px] font-black ${
                viewMode === 'tree' ? 'bg-white shadow-sm text-[#0e7490] border border-[#e8ddc8]/50' : 'text-[#64748b] hover:text-[#123f59]'
              }`}
            >
              <Layers size={14} /> عرض شجري
            </button>
            <button
              onClick={() => setViewMode('flat')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors text-[10px] font-black ${
                viewMode === 'flat' ? 'bg-white shadow-sm text-[#0e7490] border border-[#e8ddc8]/50' : 'text-[#64748b] hover:text-[#123f59]'
              }`}
            >
              <List size={14} /> مسطح
            </button>
          </div>

          {/* Tree Controls */}
          {viewMode === 'tree' && (
            <>
              <div className="h-6 w-px bg-[#e8ddc8] mx-1 hidden sm:block"></div>
              <button
                onClick={expandAll}
                className="flex items-center gap-1.5 px-3 py-2 text-[10px] font-black bg-white border border-[#e8ddc8] text-[#123f59] hover:bg-[#fbf8f1] rounded-lg transition-colors shadow-sm"
              >
                <FolderOpen size={14} className="text-[#d8b46a]" /> توسيع الكل
              </button>
              <button
                onClick={collapseAll}
                className="flex items-center gap-1.5 px-3 py-2 text-[10px] font-black bg-white border border-[#e8ddc8] text-[#123f59] hover:bg-[#fbf8f1] rounded-lg transition-colors shadow-sm"
              >
                <Folder size={14} className="text-[#94a3b8]" /> طي الكل
              </button>
              <button
                onClick={() => {
                  setNewGroupParent(null);
                  setShowAddGroup(true);
                }}
                className="flex items-center gap-1.5 px-3 py-2 text-[10px] font-black bg-[#0e7490] text-white hover:bg-[#0e7490]/90 rounded-lg transition-colors shadow-md"
              >
                <Plus size={14} /> إضافة مجموعة
              </button>
            </>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 shrink-0 animate-in slide-in-from-top-2">
          <AlertCircle className="text-red-500 shrink-0" size={18} />
          <span className="text-[11px] font-bold text-red-700">{error}</span>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 bg-white border border-[#e8ddc8] rounded-xl shadow-sm overflow-hidden flex flex-col relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center z-10">
            <div className="w-10 h-10 border-4 border-[#e8ddc8] border-t-[#0e7490] rounded-full animate-spin"></div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-gradient-to-b from-[#fbf8f1]/30 to-transparent">
          {viewMode === 'tree' ? (
            <div className="space-y-1.5 max-w-4xl mx-auto">
              {filteredTree.length > 0 ? (
                filteredTree.map(node => renderTreeNode(node))
              ) : (
                <div className="text-center py-16 flex flex-col items-center justify-center border-2 border-dashed border-[#e8ddc8] rounded-xl">
                  <Layers size={48} className="text-[#cbd5e1] mb-3" />
                  <p className="text-[12px] font-black text-[#64748b]">لا توجد مجموعات أو صلاحيات</p>
                  <button
                    onClick={() => setShowAddGroup(true)}
                    className="mt-4 px-4 py-2 bg-[#fbf8f1] border border-[#d8b46a]/50 text-[#80580d] hover:bg-[#d8b46a] hover:text-white rounded-lg text-[11px] font-black transition-colors"
                  >
                    بناء الهيكل وإنشاء مجموعة جديدة
                  </button>
                </div>
              )}
            </div>
          ) : (
            renderFlatView()
          )}
        </div>

        {/* Instructions Footer (Visible only in Tree Mode) */}
        {viewMode === 'tree' && (
          <div className="p-3 bg-[#eef7f6] border-t border-[#0e7490]/10 flex items-start gap-2 shrink-0">
            <CheckCircle size={16} className="text-[#0e7490] shrink-0 mt-0.5" />
            <div className="text-[10px] font-bold text-[#123f59] leading-relaxed">
              <strong>تلميح سريع:</strong> اسحب المجلدات <GripVertical size={12} className="inline text-gray-400" /> لتغيير ترتيبها أو إدخالها داخل مجموعات أخرى. التغييرات تحفظ وتتزامن مع السيرفر آلياً.
            </div>
          </div>
        )}
      </div>

      {/* Add Group Modal */}
      {showAddGroup && (
        <div className="fixed inset-0 bg-[#123f59]/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white rounded-xl shadow-2xl p-5 w-full max-w-sm border border-[#e8ddc8]"
          >
            <h3 className="text-[15px] font-black text-[#123f59] mb-4 flex items-center gap-2">
              <FolderPlus size={18} className="text-[#0e7490]" /> 
              {newGroupParent ? 'إضافة تفريع فرعي' : 'إضافة مجموعة رئيسية جديدة'}
            </h3>
            
            <div className="mb-5">
              <label className="block text-[11px] font-bold text-[#475569] mb-1.5">
                اسم المجموعة / الموديول
              </label>
              <input
                type="text"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="مثال: إدارة الموارد البشرية..."
                className="w-full px-3 py-2.5 bg-[#fbf8f1] border border-[#e8ddc8] rounded-lg text-[12px] font-black text-[#123f59] focus:outline-none focus:border-[#d8b46a] focus:ring-1 focus:ring-[#d8b46a]/30 transition-all"
                autoFocus
              />
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => {
                  setShowAddGroup(false);
                  setNewGroupName('');
                  setNewGroupParent(null);
                }}
                className="px-4 py-2 text-[11px] font-black text-[#64748b] bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
              >
                إلغاء
              </button>
              <button
                onClick={handleAddGroup}
                disabled={!newGroupName.trim()}
                className="px-4 py-2 text-[11px] font-black bg-[#0e7490] text-white rounded-lg hover:bg-[#0e7490]/90 transition-colors disabled:opacity-50 shadow-sm"
              >
                حفظ وإنشاء
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

// Component required Icon
const FolderPlus = ({ size, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/>
    <line x1="12" y1="10" x2="12" y2="16"/>
    <line x1="9" y1="13" x2="15" y2="13"/>
  </svg>
);

export default PermissionTreeBuilder;