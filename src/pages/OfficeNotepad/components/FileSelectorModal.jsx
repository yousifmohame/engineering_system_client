import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../../../api/axios"; // 💡 تأكد من مسار الـ API
import { FolderOpen, X, Home, ChevronLeft, Folder, File, Loader2 } from "lucide-react";

// ثوابت مجلدات النظام الأساسية
const SYSTEM_ROOT_FOLDERS = [
  { id: "sys-transactions", name: "ملفات المعاملات", isSystemRoot: true },
  { id: "sys-forms", name: "مخرجات النماذج الداخلية", isSystemRoot: true },
  { id: "sys-hr", name: "شؤون الموظفين (HR)", isSystemRoot: true },
  { id: "sys-finance", name: "الإدارة المالية", isSystemRoot: true },
  { id: "sys-legal", name: "الشؤون القانونية", isSystemRoot: true },
  { id: "sys-archive", name: "الأرشيف العام", isSystemRoot: true },
];

export default function FileSelectorModal({ isOpen, onClose, onSelect }) {
  const [pathStack, setPathStack] = useState([{ id: "root", name: "ملفات النظام المركزية" }]);
  const currentFolder = pathStack[pathStack.length - 1];
  const isAtRoot = currentFolder.id === "root";
  
  const { data: folderContents, isLoading } = useQuery({
    queryKey: ["system-files-picker", currentFolder.id],
    queryFn: async () => {
      if (isAtRoot) return { folders: SYSTEM_ROOT_FOLDERS, files: [] };
      const res = await api.get(`/system-files/contents?folderId=${currentFolder.id}`);
      return res.data.data || { folders: [], files: [] };
    },
    enabled: isOpen,
  });

  if (!isOpen) return null;

  const handleNavigateForward = (folder) => {
    setPathStack([...pathStack, { id: folder.id, name: folder.name }]);
  };

  const handleNavigateToStep = (index) => {
    setPathStack(pathStack.slice(0, index + 1));
  };

  const buildPathString = (itemName = "") => {
    const basePath = pathStack.map(p => p.name).join('/');
    return itemName ? `${basePath}/${itemName}` : basePath;
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 z-[300] flex items-center justify-center p-4 backdrop-blur-sm" dir="rtl">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl flex flex-col max-h-[80vh] overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center bg-slate-50">
          <h4 className="font-black text-slate-800 flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-emerald-600" /> اختيار ملف أو مجلد من النظام
          </h4>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-full text-slate-400"><X className="w-5 h-5" /></button>
        </div>

        {/* Breadcrumbs */}
        <div className="p-3 bg-white border-b flex items-center gap-2 text-xs font-bold text-slate-500 overflow-x-auto whitespace-nowrap custom-scrollbar-slim shadow-sm">
            <button onClick={() => handleNavigateToStep(0)} className="hover:text-emerald-600 text-slate-400"><Home className="w-4 h-4" /></button>
            {pathStack.length > 1 && <ChevronLeft className="w-4 h-4 text-slate-300 shrink-0" />}
            {pathStack.slice(1).map((step, idx) => (
                <React.Fragment key={step.id}>
                    <button 
                        onClick={() => handleNavigateToStep(idx + 1)} 
                        className={`hover:text-emerald-600 transition-colors ${idx === pathStack.length - 2 ? "text-slate-800 bg-slate-100 px-2 py-0.5 rounded" : ""}`}
                    >
                        {step.name}
                    </button>
                    {idx < pathStack.length - 2 && <ChevronLeft className="w-4 h-4 text-slate-300 shrink-0" />}
                </React.Fragment>
            ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar-slim bg-slate-50/50">
          {isLoading ? (
            <div className="flex justify-center items-center h-40"><Loader2 className="w-8 h-8 animate-spin text-emerald-600" /></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {folderContents?.folders?.map((folder) => (
                <div key={folder.id} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl hover:border-emerald-300 hover:shadow-md transition-all group">
                  <div className="flex items-center gap-3 overflow-hidden cursor-pointer flex-1" onClick={() => handleNavigateForward(folder)}>
                    <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                        <Folder className="w-5 h-5 text-amber-500" />
                    </div>
                    <span className="text-sm font-bold text-slate-700 truncate">{folder.name}</span>
                  </div>
                  <button 
                      onClick={() => onSelect(buildPathString(folder.name))}
                      className="px-3 py-1.5 bg-slate-100 text-slate-600 text-[10px] font-black rounded-lg opacity-0 group-hover:opacity-100 hover:bg-emerald-600 hover:text-white transition-all shrink-0"
                  > تحديد المجلد </button>
                </div>
              ))}
              
              {folderContents?.files?.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all group">
                  <div className="flex items-center gap-3 overflow-hidden flex-1">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                        <File className="w-5 h-5 text-blue-500" />
                    </div>
                    <span className="text-sm font-bold text-slate-700 truncate" title={file.originalName || file.name}>{file.originalName || file.name}</span>
                  </div>
                  <button 
                      onClick={() => onSelect(buildPathString(file.originalName || file.name))}
                      className="px-3 py-1.5 bg-blue-50 text-blue-600 text-[10px] font-black rounded-lg opacity-0 group-hover:opacity-100 hover:bg-blue-600 hover:text-white transition-all shrink-0"
                  > إرفاق الملف </button>
                </div>
              ))}

              {folderContents?.folders?.length === 0 && folderContents?.files?.length === 0 && (
                  <div className="col-span-1 sm:col-span-2 text-center py-10 text-slate-400 font-bold">هذا المجلد فارغ</div>
              )}
            </div>
          )}
        </div>
        <div className="p-4 border-t bg-slate-50 flex justify-between items-center">
            <button 
                onClick={() => onSelect(buildPathString())} 
                disabled={isAtRoot}
                className="text-xs font-bold text-emerald-600 hover:bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-30"
            > اختيار المجلد الحالي بالكامل </button>
            <button onClick={onClose} className="px-5 py-2 bg-white border border-slate-200 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-100">إلغاء</button>
        </div>
      </div>
    </div>
  );
}