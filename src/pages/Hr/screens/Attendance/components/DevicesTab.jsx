import React from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../../../../../api/axios"; // ⚠️ تأكد من صحة مسار ملف الـ API
import { Wifi, Fingerprint, FileDown, RefreshCw, Smartphone, Ban } from "lucide-react";

export default function DevicesTab() {
  const { data: devices = [], isLoading, refetch } = useQuery({
    queryKey: ['zk-devices'],
    queryFn: async () => (await api.get('/attendance/zk-devices')).data.data
  });

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden max-w-5xl mx-auto flex flex-col lg:flex-row min-h-[600px] mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* ── Add & Import Panel ── */}
      <div className="w-full lg:w-1/3 bg-slate-50/50 border-l border-slate-200/60 flex flex-col relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent -z-10"></div>
        <div className="p-6 border-b border-slate-200/60">
          <h3 className="font-black text-slate-800 text-sm flex items-center gap-2">
            <Wifi className="w-4 h-4 text-indigo-600" /> إدارة أجهزة وبيانات البصمة
          </h3>
        </div>
        <div className="p-6 flex-1 space-y-6 flex flex-col relative z-10">
          <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm text-center flex flex-col items-center border-dashed group hover:border-indigo-400 transition-colors cursor-pointer">
            <Fingerprint className="w-8 h-8 text-indigo-400 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-black text-slate-700">تحميل ملف البصمة (Log File)</span>
            <button className="mt-4 w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-md transition-colors flex items-center justify-center gap-2">
              <FileDown className="w-4 h-4" /> اختيار الملف
            </button>
          </div>
          <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm">
            <h4 className="text-xs font-black text-slate-800 mb-3 flex items-center gap-2">
              <Wifi className="w-4 h-4 text-emerald-500" /> سحب البيانات المباشر (Network)
            </h4>
            <button onClick={() => refetch()} className="w-full py-2.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl text-xs font-black transition-colors flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4" /> تحديث حالة الأجهزة
            </button>
          </div>
        </div>
      </div>

      {/* ── Connected Devices ── */}
      <div className="w-full lg:w-2/3 flex flex-col bg-slate-50/50">
        <div className="p-6 border-b border-slate-200/60 flex justify-between items-center bg-white/50 backdrop-blur">
          <h3 className="font-black text-slate-800 text-sm">الأجهزة المتصلة وبوابات الدخول</h3>
          <button className="px-4 py-2 bg-slate-900 text-white text-xs font-black rounded-xl hover:bg-slate-800 shadow-xl transition-all">إضافة جهاز جديد</button>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 content-start">
          {isLoading ? (
            <div className="col-span-2 text-center py-10 text-slate-400 font-bold">جاري جلب الأجهزة المربوطة...</div>
          ) : devices.length === 0 ? (
            <div className="col-span-2 text-center py-10 text-slate-400 font-bold">لم يتم إضافة أي أجهزة ZKTeco بعد.</div>
          ) : devices.map(device => (
            <div key={device.id} className={`bg-white border border-slate-200/60 rounded-3xl p-6 flex flex-col relative overflow-hidden shadow-sm hover:shadow-md transition-shadow ${device.status === 'متصل' ? '' : 'grayscale opacity-70 hover:opacity-100'}`}>
              <div className={`absolute top-0 right-0 w-2 h-full ${device.status === 'متصل' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
              <div className="flex justify-between items-start mb-5">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-600 shrink-0 border border-slate-100 shadow-sm">
                  {/* يمكن تبديل الأيقونة حسب نوع الجهاز إذا لزم الأمر */}
                  <Fingerprint className="w-6 h-6" />
                </div>
                <span className={`border text-[10px] font-black px-2.5 py-1 rounded-xl flex items-center gap-1.5 shadow-sm ${device.status === 'متصل' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-rose-50 border-rose-100 text-rose-700'}`}>
                  {device.status === 'متصل' ? <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> : <Ban className="w-3 h-3 text-rose-500" />}
                  {device.status}
                </span>
              </div>
              <h4 className="font-black text-slate-900 text-sm mb-1 line-clamp-1">{device.name}</h4>
              <div className="text-[10px] font-bold text-slate-500 mb-5 tracking-widest font-mono">IP: {device.ipAddress} | Port: {device.port}</div>
              <div className="mt-auto pt-4 border-t border-slate-100 flex justify-between text-[10px] font-bold text-slate-500">
                <span>آخر تزامن: {device.lastSync ? new Date(device.lastSync).toLocaleString('en-GB') : "لم يتزامن بعد"}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}