import React from "react";
import { FileText } from "lucide-react";

export default function LinksSection({ minute, onGoToTransaction }) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      
      {/* بيانات السجل */}
      <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl shadow-sm">
        <h3 className="text-sm font-black text-slate-800 mb-4">بيانات السجل</h3>
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div><span className="text-slate-500 block">بواسطة:</span> <span className="font-bold">{minute.createdBy || 'مدير النظام'}</span></div>
          <div><span className="text-slate-500 block">آخر تعديل:</span> <span className="font-bold">{minute.updatedAt ? new Date(minute.updatedAt).toLocaleTimeString('ar-SA') : '--:--'}</span></div>
          <div><span className="text-slate-500 block">الحالة:</span> <span className="font-bold">{minute.status || 'مسودة'}</span></div>
          <div><span className="text-slate-500 block">المرفقات:</span> <span className="font-bold">{minute.attachments?.length || 0} مرفقات</span></div>
        </div>
      </div>

      {/* المرجع والتكامل */}
      <div className="p-5 bg-blue-50 border border-blue-200 rounded-2xl shadow-sm">
        <h3 className="text-sm font-black text-blue-900 mb-4">المرجع والتكامل</h3>
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div><span className="text-blue-700 block">العميل المرتبط:</span> <span className="font-bold">{minute.clientName || 'غير محدد'}</span></div>
          <div><span className="text-blue-700 block">رقم المعاملة:</span> <span className="font-bold">{minute.transactionId || 'غير مرتبط بمعاملة'}</span></div>
          <div className="col-span-2"><span className="text-blue-700 block">المرجع الداخلي للمحضر:</span> <span className="font-bold">{minute.referenceNumber || 'غير محدد'}</span></div>
        </div>
      </div>

      {/* الخطوات والإجراءات التالية */}
      <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm">
        <h3 className="text-sm font-black text-slate-800 mb-4">الخطوات والإجراءات التالية</h3>
        <div className="grid grid-cols-2 gap-3">
          <button className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-indigo-600 transition-all flex flex-col items-center gap-2 group shadow-sm">
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
              <FileText className="w-4 h-4 text-slate-500 group-hover:text-indigo-600 transition-colors" />
            </div>
            <span className="text-xs font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">إنشاء عرض سعر</span>
          </button>
          
          <button className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-indigo-600 transition-all flex flex-col items-center gap-2 group shadow-sm">
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
              <FileText className="w-4 h-4 text-slate-500 group-hover:text-indigo-600 transition-colors" />
            </div>
            <span className="text-xs font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">إنشاء معاملة جديدة</span>
          </button>
          
          <button 
            disabled={!minute.transactionId} 
            onClick={() => onGoToTransaction && onGoToTransaction(minute.transactionId)}
            className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-indigo-600 transition-all flex flex-col items-center gap-2 group shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
              <FileText className="w-4 h-4 text-slate-500 group-hover:text-indigo-600 transition-colors" />
            </div>
            <span className="text-xs font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">فتح المعاملة</span>
          </button>
          
          <button className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-indigo-600 transition-all flex flex-col items-center gap-2 group shadow-sm">
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
              <FileText className="w-4 h-4 text-slate-500 group-hover:text-indigo-600 transition-colors" />
            </div>
            <span className="text-xs font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">إنشاء عقد</span>
          </button>
        </div>
      </div>

    </div>
  );
}