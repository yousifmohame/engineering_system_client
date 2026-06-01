import React, { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import axios from "../../../../api/axios"; // 👈 تأكد من مسار الأكسيوس الصحيح
import {
  Folder,
  FileText,
  ChevronDown,
  ChevronUp,
  Search,
  Layers,
  PanelRight,
  Maximize2,
  Minimize2,
  UserCheck,
  ShieldCheck,
  X,
  Save,
  CheckCircle2,
  Loader2,
} from "lucide-react";

import usePermissionStore from "../../../../stores/usePermissionStore";

// ============================================================
// CSS الخاص بالهيكل التنظيمي (RTL)
// ============================================================
const advancedOrgStyles = `
  .org-wrapper { display: flex; justify-content: center; direction: rtl; padding: 40px; min-width: max-content; }
  .org-node-container { display: flex; flex-direction: column; align-items: center; }
  .org-children { display: flex; padding-top: 32px; position: relative; justify-content: center; }
  .org-children::before { content: ''; position: absolute; top: 0; right: 50%; width: 2px; height: 32px; background-color: #cbd5e1; margin-right: -1px; }
  .org-child { padding-top: 32px; position: relative; display: flex; justify-content: center; padding-left: 12px; padding-right: 12px; }
  .org-child::before { content: ''; position: absolute; top: 0; right: 0; left: 0; height: 2px; background-color: #cbd5e1; }
  .org-child:first-child::before { right: 50%; }
  .org-child:last-child::before { left: 50%; }
  .org-child:only-child::before { display: none; }
  .org-child::after { content: ''; position: absolute; top: 0; right: 50%; width: 2px; height: 32px; background-color: #cbd5e1; margin-right: -1px; }
`;

// ============================================================
// MAIN COMPONENT
// ============================================================
const RoleAssignmentTreeEmploye = () => {
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState("tree");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const treeContainerRef = useRef(null);

  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [assignedPermissions, setAssignedPermissions] = useState(new Map());

  const {
    permissionTree,
    flatPermissions,
    expandedNodes,
    searchQuery,
    toggleNodeExpansion,
    loadPermissionTree,
    loadFlatPermissions,
    setSearchQuery,
  } = usePermissionStore();

  // 1. تحميل شجرة الصلاحيات العامة
  useEffect(() => {
    loadPermissionTree();
    loadFlatPermissions();
  }, [loadPermissionTree, loadFlatPermissions]);

  // ==========================================
  // 🚀 API QUERIES (الربط الحقيقي بالباك-إند)
  // ==========================================

  // 2. جلب الموظفين لملء الدروب داون
  const { data: employees = [], isLoading: isLoadingEmployees } = useQuery({
    queryKey: ["employees-list"],
    queryFn: async () => {
      const res = await axios.get("/employees"); // 👈 عدل مسار API الموظفين إذا لزم الأمر
      return res.data?.data || res.data || [];
    },
  });

  // 3. جلب تفاصيل الموظف المحدد (للحصول على صلاحياته الحالية)
  const { data: employeeDetails, isFetching: isFetchingDetails } = useQuery({
    queryKey: ["employee-details", selectedEmployeeId],
    queryFn: async () => {
      const res = await axios.get(`/employees/${selectedEmployeeId}`);
      return res.data?.data || res.data;
    },
    enabled: !!selectedEmployeeId, // لا تعمل إلا إذا تم اختيار موظف
  });

  // 4. تعبئة الصلاحيات السابقة للموظف في السلة عند تحميل تفاصيله
  useEffect(() => {
    if (employeeDetails && flatPermissions.length > 0) {
      const newMap = new Map();

      // نفترض أن الباك-إند يرجع الصلاحيات المباشرة داخل employeeDetails.permissions
      // أو بداخل أدوار employeeDetails.roles[].permissions
      const currentPerms = employeeDetails.permissions || [];

      currentPerms.forEach((perm) => {
        // نبحث عن الصلاحية في flatPermissions لنجلب اسمها وبياناتها الكاملة
        const fullPermObj = flatPermissions.find(
          (p) => p.id === perm.id || p.id === perm,
        );
        if (fullPermObj) {
          newMap.set(fullPermObj.id, fullPermObj);
        }
      });

      setAssignedPermissions(newMap);
    } else if (!selectedEmployeeId) {
      setAssignedPermissions(new Map());
    }
  }, [employeeDetails, flatPermissions, selectedEmployeeId]);

  // 5. رفع الصلاحيات الجديدة للباك-إند (Save Mutation)
  const assignMutation = useMutation({
    mutationFn: async (payload) => {
      // 👈 افترضنا أن الراوت هو PUT /employees/:id/permissions
      // قم بتغييره حسب تصميم الباك-إند الخاص بك
      return await axios.put(`/employees/${payload.employeeId}/permissions`, {
        permissionIds: payload.permissionIds,
      });
    },
    onSuccess: () => {
      toast.success("تم تحديث وحفظ صلاحيات الموظف بنجاح!");
      queryClient.invalidateQueries(["employee-details", selectedEmployeeId]);
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "حدث خطأ أثناء حفظ الصلاحيات",
      );
    },
  });

  // ==========================================
  // ASSIGNMENT LOGIC (تفاعل الواجهة)
  // ==========================================
  const handleAssignPermission = (node) => {
    if (!selectedEmployeeId) {
      toast.error("الرجاء اختيار الموظف أولاً من القائمة العلوية!");
      return;
    }
    setAssignedPermissions((prev) => {
      const newMap = new Map(prev);
      if (!newMap.has(node.id)) newMap.set(node.id, node);
      return newMap;
    });
  };

  const handleRemovePermission = (nodeId) => {
    setAssignedPermissions((prev) => {
      const newMap = new Map(prev);
      newMap.delete(nodeId);
      return newMap;
    });
  };

  const saveEmployeeRoles = () => {
    if (!selectedEmployeeId) return;

    // استخراج مصفوفة الـ IDs للصلاحيات المختارة
    const permissionIds = Array.from(assignedPermissions.keys());

    // إرسال الطلب للباك-إند
    assignMutation.mutate({
      employeeId: selectedEmployeeId,
      permissionIds: permissionIds,
    });
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
  // 🎨 NODE STYLING
  // ==========================================
  const getNodeStyle = (depth, isAssigned) => {
    if (isAssigned) {
      return "bg-rose-50 border-[3px] border-rose-500 text-rose-900 shadow-[0_8px_20px_rgba(225,29,72,0.2)] rounded-xl opacity-90 cursor-not-allowed";
    }
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
  // TREE NODE RENDERER
  // ==========================================
  const renderOrgNode = (node, depth = 0) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children && node.children.length > 0;
    const isDeepNode = depth >= 3;
    const isAssigned = assignedPermissions.has(node.id);

    return (
      <div className="org-node-container" key={node.id}>
        <div className="relative pt-2">
          <motion.div
            layout="position"
            onClick={(e) => {
              e.stopPropagation();
              if (!isAssigned) handleAssignPermission(node);
            }}
            className={`
              relative group flex flex-col items-center justify-center min-w-[160px] max-w-[220px] transition-all duration-300
              ${getNodeStyle(depth, isAssigned)}
              ${!isAssigned ? "hover:-translate-y-1 hover:shadow-xl cursor-pointer" : ""}
            `}
            style={{ padding: isDeepNode ? "10px 24px" : "18px" }}
          >
            {isAssigned && (
              <div className="absolute -top-3 -right-3 w-7 h-7 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-md">
                <CheckCircle2 size={16} />
              </div>
            )}

            <div className="text-center w-full">
              <div
                className={`font-black break-words leading-snug ${isDeepNode ? "text-sm" : "text-[15px]"}`}
              >
                {node.name}
              </div>
              {isAssigned && (
                <div className="text-[10px] text-rose-600 font-bold mt-1">
                  تم تعيين الصلاحية
                </div>
              )}
            </div>

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
        .map((permission) => {
          const isAssigned = assignedPermissions.has(permission.id);
          return (
            <div
              key={permission.id}
              onClick={() => !isAssigned && handleAssignPermission(permission)}
              className={`p-4 border rounded-2xl shadow-sm transition-all ${
                isAssigned
                  ? "bg-rose-50 border-rose-300 cursor-not-allowed opacity-80"
                  : "bg-white border-slate-200 hover:shadow-md cursor-pointer hover:border-indigo-300"
              }`}
            >
              <div className="flex gap-3 items-center">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isAssigned ? "bg-rose-100" : "bg-indigo-50"}`}
                >
                  <FileText
                    size={18}
                    className={isAssigned ? "text-rose-600" : "text-indigo-600"}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div
                    className={`text-sm font-black truncate ${isAssigned ? "text-rose-800" : "text-slate-800"}`}
                  >
                    {permission.name}
                  </div>
                  {isAssigned && (
                    <div className="text-[10px] text-rose-600 font-bold">
                      تم الاختيار
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
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
          {/* اختيار الموظف (Real Data) */}
          <div className="pointer-events-auto flex items-center gap-3 bg-white/95 backdrop-blur p-2.5 rounded-2xl border border-slate-200 shadow-lg">
            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
              {isLoadingEmployees ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <UserCheck size={20} />
              )}
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-500 mb-0.5">
                تعيين الصلاحيات لـ:
              </div>
              <select
                value={selectedEmployeeId}
                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                disabled={isLoadingEmployees}
                className="bg-transparent text-sm font-black text-slate-800 outline-none cursor-pointer w-48 disabled:opacity-50"
              >
                <option value="">-- اختر الموظف --</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} {emp.position ? `(${emp.position})` : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pointer-events-auto flex items-center gap-2 bg-white/95 backdrop-blur p-2 rounded-2xl border border-slate-200 shadow-lg">
            <div className="relative w-64 mr-2">
              <Search
                size={16}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="البحث في الصلاحيات..."
                className="w-full h-10 pr-10 pl-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            <div className="w-px h-6 bg-slate-300 mx-1"></div>
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
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
            >
              {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>
          </div>
        </div>

        {/* TREE CANVAS */}
        <div
          ref={treeContainerRef}
          className="flex-1 overflow-auto p-16 cursor-grab active:cursor-grabbing"
          style={{ paddingTop: "120px" }}
          onMouseDown={(e) => {
            if (
              e.target.closest("button") ||
              e.target.closest("select") ||
              e.target.closest("input") ||
              e.target.closest(".org-node-container")
            )
              return;
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
                    لا توجد نتائج للبحث
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
            <ShieldCheck className="text-emerald-600" size={24} /> الصلاحيات
            الممنوحة
          </h2>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            {selectedEmployeeId
              ? `يتم الآن تعيين الصلاحيات للموظف المحدد.`
              : "الرجاء تحديد الموظف أولاً للبدء في منح الصلاحيات."}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 bg-slate-50/30 custom-scrollbar">
          {!selectedEmployeeId ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
              <UserCheck size={56} className="text-slate-300 mb-4" />
              <p className="text-sm font-bold text-slate-600">
                لم يتم تحديد الموظف
              </p>
            </div>
          ) : isFetchingDetails ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
              <Loader2
                size={40}
                className="text-indigo-500 animate-spin mb-4"
              />
              <p className="text-sm font-bold text-slate-600">
                جاري تحميل الصلاحيات...
              </p>
            </div>
          ) : assignedPermissions.size === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
              <Layers size={56} className="text-slate-300 mb-4" />
              <p className="text-sm font-bold text-slate-600">
                لا توجد صلاحيات
              </p>
              <p className="text-[11px] text-slate-400 mt-2 max-w-[200px]">
                قم بالضغط على البطاقات في الهيكل لإضافتها هنا.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-[11px] font-bold text-slate-500 mb-3 text-left">
                إجمالي المحدد:{" "}
                <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                  {assignedPermissions.size}
                </span>
              </div>

              {Array.from(assignedPermissions.values()).map((node) => (
                <div
                  key={node.id}
                  className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-rose-200 transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                      <CheckCircle2 size={14} className="text-emerald-600" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-black text-slate-800 truncate">
                        {node.name}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemovePermission(node.id)}
                    className="p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 rounded-md transition-colors"
                    title="إلغاء الصلاحية"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Save Button */}
        <div className="p-5 border-t border-slate-200 bg-white">
          <button
            onClick={saveEmployeeRoles}
            disabled={
              !selectedEmployeeId ||
              isFetchingDetails ||
              assignMutation.isPending
            }
            className="w-full h-12 flex items-center justify-center gap-2 bg-indigo-600 text-white rounded-xl text-sm font-black hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all"
          >
            {assignMutation.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Save size={18} />
            )}
            {assignMutation.isPending
              ? "جاري الحفظ..."
              : "حفظ الصلاحيات للموظف"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleAssignmentTreeEmploye;
