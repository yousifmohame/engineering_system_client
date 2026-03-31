import React from "react";
import { X, History, Download, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import api from "../../../api/axios";
import { formatFileSize, getFullUrl } from "../utils";

export default function SystemVersionsModal({ file, onClose }) {
  const { data: versions = [], isLoading } = useQuery({
    queryKey: ["system-file-versions", file.id],
    queryFn: async () => (await api.get(`/system-files/versions/${file.id}`)).data?.versions || []
  });

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[600] p-4" onClick={onClose} dir="rtl">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl flex flex-col overflow-hidden animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4 bg-slate-800 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <History size={20} className="text-purple-400" />
            <div>
              <h3 className="font-bold text-sm">الإصدارات السابقة للملف</h3>
              <p className="text-[10px] text-slate-300 mt-0.5">{file.originalName || file.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors"><X size={20} /></button>
        </div>
        <div className="p-0 max-h-[60vh] overflow-y-auto custom-scrollbar-slim">
          {isLoading ? (
            <div className="flex justify-center py-10"><Loader2 className="animate-spin text-purple-500" /></div>
          ) : versions.length === 0 ? (
            <div className="text-center py-12 text-slate-400 font-bold bg-slate-50">لا يوجد إصدارات سابقة لهذا الملف</div>
          ) : (
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 border-b border-gray-200 text-slate-500 font-bold sticky top-0">
                <tr>
                  <th className="p-4">الإصدار</th>
                  <th className="p-4">تاريخ الرفع</th>
                  <th className="p-4">الحجم</th>
                  <th className="p-4">بواسطة</th>
                  <th className="p-4 text-center">تحميل</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {versions.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-black text-purple-600">v{v.versionNumber}</td>
                    <td className="p-4 font-mono text-slate-500">{new Date(v.createdAt).toLocaleString("en-GB")}</td>
                    <td className="p-4 font-mono text-slate-500">{formatFileSize(v.size)}</td>
                    <td className="p-4 font-bold text-slate-700">{v.uploadedBy}</td>
                    <td className="p-4 text-center">
                      <button onClick={() => window.open(getFullUrl(v.url), "_blank")} className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg transition-colors inline-block shadow-sm">
                        <Download size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}