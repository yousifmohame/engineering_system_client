import { create } from 'zustand';
import api from '../api/axios';
// =========================================================
// Helper Functions (دوال مساعدة للتعامل مع الهيكل الشجري)
// =========================================================

const cloneTree = (tree) => JSON.parse(JSON.stringify(tree));

const removeNode = (nodes, id) => {
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].id === id) {
      return nodes.splice(i, 1)[0];
    }
    if (nodes[i].children) {
      const found = removeNode(nodes[i].children, id);
      if (found) return found;
    }
  }
  return null;
};

const insertNode = (nodes, nodeToInsert, parentId, pos = 'end') => {
  if (!parentId || parentId === 'root') {
    pos === 'end' ? nodes.push(nodeToInsert) : nodes.unshift(nodeToInsert);
    return true;
  }
  
  for (let node of nodes) {
    if (node.id === parentId) {
      if (!node.children) node.children = [];
      pos === 'end' ? node.children.push(nodeToInsert) : node.children.unshift(nodeToInsert);
      return true;
    }
    if (node.children && insertNode(node.children, nodeToInsert, parentId, pos)) {
      return true;
    }
  }
  return false;
};

const renameInTree = (nodes, id, name) => {
  for (let node of nodes) {
    if (node.id === id) {
      node.name = name;
      return true;
    }
    if (node.children && renameInTree(node.children, id, name)) return true;
  }
  return false;
};

const deleteFromTree = (nodes, id) => {
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].id === id) {
      nodes.splice(i, 1);
      return true;
    }
    if (nodes[i].children && deleteFromTree(nodes[i].children, id)) return true;
  }
  return false;
};

const collectAllNodeIds = (nodes, expanded = new Set()) => {
  nodes.forEach(node => {
    expanded.add(node.id);
    if (node.children && node.children.length > 0) {
      collectAllNodeIds(node.children, expanded);
    }
  });
  return expanded;
};


// =========================================================
// Zustand Store (إدارة الحالة)
// =========================================================

const usePermissionStore = create((set, get) => ({
  // --- State ---
  permissionTree: [],
  flatPermissions: [],
  selectedNodes: new Set(),
  expandedNodes: new Set(['root']),
  draggedNode: null,
  isLoading: false,
  error: null,
  searchQuery: '',
  
  // --- Basic Actions ---
  setPermissionTree: (tree) => set({ permissionTree: tree }),
  setFlatPermissions: (permissions) => set({ flatPermissions: permissions }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setDraggedNode: (node) => set({ draggedNode: node }),
  
  // --- Toggles & Expansions ---
  toggleNodeExpansion: (nodeId) => {
    const expandedNodes = new Set(get().expandedNodes);
    expandedNodes.has(nodeId) ? expandedNodes.delete(nodeId) : expandedNodes.add(nodeId);
    set({ expandedNodes });
  },
  
  toggleNodeSelection: (nodeId) => {
    const selectedNodes = new Set(get().selectedNodes);
    selectedNodes.has(nodeId) ? selectedNodes.delete(nodeId) : selectedNodes.add(nodeId);
    set({ selectedNodes });
  },
  
  expandAll: () => {
    set({ expandedNodes: collectAllNodeIds(get().permissionTree) });
  },
  
  collapseAll: () => {
    set({ expandedNodes: new Set(['root']) });
  },
  
  // --- Tree Manipulations ---
  moveNode: async (nodeId, targetParentId, position = 'end') => {
    const { permissionTree, syncWithBackend } = get();
    const newTree = cloneTree(permissionTree);
    const nodeToMove = removeNode(newTree, nodeId);
    
    if (nodeToMove) {
      insertNode(newTree, nodeToMove, targetParentId, position);
      set({ permissionTree: newTree });
      await syncWithBackend(newTree);
    }
  },
  
  addGroup: async (name, type = 'sub_module', parentId = null) => {
    const { permissionTree, syncWithBackend } = get();
    const newGroup = {
      id: `sub-${Date.now()}`, // Temporary ID
      name,
      type,
      children: []
    };
    
    const newTree = cloneTree(permissionTree);
    insertNode(newTree, newGroup, parentId, 'end');
    set({ permissionTree: newTree });
    
    await syncWithBackend(newTree);
  },
  
  renameNode: async (nodeId, newName) => {
    const { permissionTree, syncWithBackend } = get();
    const newTree = cloneTree(permissionTree);
    
    if (renameInTree(newTree, nodeId, newName)) {
      set({ permissionTree: newTree });
      await syncWithBackend(newTree);
    }
  },
  
  deleteNode: async (nodeId) => {
    const { permissionTree, syncWithBackend } = get();
    const newTree = cloneTree(permissionTree);
    
    if (deleteFromTree(newTree, nodeId)) {
      set({ permissionTree: newTree });
      await syncWithBackend(newTree);
    }
  },
  
  // --- API Integrations ---
  syncWithBackend: async (tree) => {
    try {
      set({ isLoading: true, error: null });
      
      // استخدام axios بدلاً من fetch لإرسال التوكن تلقائياً
      await api.post('/permissions/tree/sync', { tree });
      
      await get().loadPermissionTree();
    } catch (error) {
      set({ error: error.response?.data?.message || error.message });
      console.error('Sync error:', error);
    } finally {
      set({ isLoading: false });
    }
  },
  
  loadPermissionTree: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await api.get('/permissions/tree');
      set({ permissionTree: response.data });
      
    } catch (error) {
      set({ error: error.response?.data?.message || error.message });
      console.error('Load error:', error);
    } finally {
      set({ isLoading: false });
    }
  },
  
  loadFlatPermissions: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await api.get('/permissions/individual');
      set({ flatPermissions: response.data });
      
    } catch (error) {
      set({ error: error.response?.data?.message || error.message });
      console.error('Load error:', error);
    } finally {
      set({ isLoading: false });
    }
  },
}));

export default usePermissionStore;