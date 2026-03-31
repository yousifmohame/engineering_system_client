import React from "react";
import { X, Activity, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import api from "../../../api/axios";

export default function SystemLogsModal({ file, onClose }) {
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["system-file-logs", file.id],
    queryFn: async () => (await api.get(`/system-files/logs/${file.id}`)).data?.logs || []
  });

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[600] p-4" onClick={onClose} dir="rtl">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4 bg-slate-800 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <Activity size={20} className="text-blue-400" />
            <div>
              <h3 className="font-bold text-sm">سجل حركات الملف (Audit Trail)</h3>
              <p className="text-[10px] text-slate-300 mt-0.5">{file.originalName || file.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors"><X size={20} /></button>
        </div>
        <div className="p-6 bg-slate-50 max-h-[60vh] overflow-y-auto custom-scrollbar-slim">
          {isLoading ? (
            <div className="flex justify-center py-10"><Loader2 className="animate-spin text-blue-500" /></div>
          ) : logs.length === 0 ? (
            <div className="text-center py-10 text-slate-400 font-bold border-2 border-dashed border-slate-200 rounded-xl">لا توجد حركات مسجلة لهذا الملف</div>
          ) : (
            <div className="space-y-4 relative before:absolute before:inset-0 before:mr-5 before:w-0.5 before:bg-slate-200">
              {logs.map((log) => (
                <div key={log.id} className="relative flex items-center">
                  <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-100 flex justify-center items-center shrink-0 z-10 mr-0 shadow-sm text-slate-500">
                    <Activity size={16} />
                  </div>
                  <div className="mr-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex-1 hover:border-blue-200 hover:shadow-md transition-all">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-slate-800 text-xs">{log.action}</span>
                      <span className="text-[10px] font-mono text-slate-500">{new Date(log.createdAt).toLocaleString("ar-EG")}</span>
                    </div>
                    <div className="text-[11px] text-slate-600 mt-2">بواسطة: <span className="font-bold text-blue-600">{log.performedBy}</span></div>
                    {log.ipAddress && <div className="text-[9px] text-slate-400 font-mono mt-1">IP: {log.ipAddress}</div>}
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