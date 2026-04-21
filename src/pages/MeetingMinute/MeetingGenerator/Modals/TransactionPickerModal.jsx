import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, X, Briefcase, Loader2, CheckCircle2 } from "lucide-react";
import api from "../../../../api/axios"; // 💡 تأكد من مسار الـ api

export default function TransactionPickerModal({ onClose, onSelect }) {
  const [search, setSearch] = useState("");

  // 1. جلب البيانات بشكل آمن
  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["private-transactions"],
    queryFn: async () => {
      try {
        const res = await api.get("/private-transactions");
        // 💡 التعامل الآمن مع هيكل البيانات القادم من الباك إند
        return res.data?.data || res.data || [];
      } catch (error) {
        console.error("Failed to fetch transactions:", error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // الاحتفاظ بالبيانات لـ 5 دقائق لتسريع الفتح
  });

  // 2. فلترة ذكية ومطابقة لمنطق الصفحة الرئيسية (TransactionsPage)
  const filtered = useMemo(() => {
    if (!search.trim()) return transactions;
    
    const term = search.toLowerCase();
    return transactions.filter(tx => {
      // البحث في المرجع (Ref) أو الـ (ID)
      const txRef = (tx.ref || tx.id || "").toLowerCase();
      
      // البحث في العميل أو المالك (مطابق للرئيسية)
      const clientName = (tx.client || tx.owner || "").toLowerCase();
      
      // البحث في الاسم المتداول (Internal Name)
      const internalName = (tx.internalName || tx.notes?.internalName || "").toLowerCase();

      return txRef.includes(term) || clientName.includes(term) || internalName.includes(term);
    });
  }, [transactions, search]);

  return (
    <div className="fixed inset-0 z-[300] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200" dir="rtl">
      {/* 💡 خلفية قابلة للنقر لإغلاق النافذة */}
      <div className="absolute inset-0" onClick={onClose}></div>

      <div className="bg-white rounded-[2.5rem] w-full max-w-lg border border-slate-200 overflow-hidden shadow-2xl flex flex-col max-h-[80vh] relative z-10 zoom-in-95">
        
        {/* الترويسة */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
           <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
             <Briefcase className="text-emerald-600 w-5 h-5"/> 
             ربط بمعاملة نشطة
           </h3>
           <button onClick={onClose} className="p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 rounded-xl transition-colors">
             <X size={20}/>
           </button>
        </div>
        
        {/* شريط البحث */}
        <div className="p-4 border-b border-slate-100 bg-white">
           <div className="relative group">
              <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors" size={16}/>
              <input 
                 type="text" 
                 value={search}
                 onChange={e => setSearch(e.target.value)}
                 placeholder="ابحث بالرقم، المالك، أو الاسم المتداول..." 
                 className="w-full pr-10 pl-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-500">
                  <X size={14} />
                </button>
              )}
           </div>
        </div>

        {/* قائمة المعاملات */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar bg-slate-50/30">
          {isLoading ? (
             <div className="flex flex-col items-center justify-center py-12 text-emerald-600">
               <Loader2 className="animate-spin mb-3" size={32}/>
               <span className="text-xs font-bold text-slate-500">جاري جلب المعاملات...</span>
             </div>
          ) : filtered.length > 0 ? (
             filtered.map((tx, index) => {
               // 💡 استخدام نفس المتغيرات الموجودة في الصفحة الرئيسية تماماً
               const clientName = tx.client || tx.owner || 'عميل غير محدد';
               const txRef = tx.ref || tx.id;
               const sysStatus = tx.status || tx.transactionStatus || "مسجلة";
               const internalName = tx.internalName || tx.notes?.internalName;
               
               return (
                 <button
                   key={`${tx.id || 'tx'}-${index}`}
                   onClick={() => onSelect(tx)}
                   className="w-full flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:border-emerald-300 hover:bg-emerald-50 transition-all text-right group shadow-sm hover:shadow"
                 >
                   <div className="flex flex-col gap-1.5">
                      <span className="text-xs font-black text-slate-800 group-hover:text-emerald-800 transition-colors">
                        {clientName}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-emerald-700 bg-emerald-100/50 px-2 py-0.5 rounded-md border border-emerald-200 w-fit">
                          {txRef}
                        </span>
                        {internalName && (
                          <span className="text-[9px] font-bold text-slate-400 truncate max-w-[120px]">
                            {internalName}
                          </span>
                        )}
                      </div>
                   </div>
                   <div className="flex items-center gap-3">
                      <div className="bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg text-[9px] font-black text-slate-500 group-hover:bg-white transition-colors">
                        {sysStatus}
                      </div>
                      <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-emerald-100 transition-colors hidden sm:flex">
                        <CheckCircle2 size={16} className="text-slate-300 group-hover:text-emerald-600 transition-colors" />
                      </div>
                   </div>
                 </button>
               );
             })
          ) : (
             <div className="flex flex-col items-center justify-center py-12 text-slate-400">
               <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                 <Briefcase className="w-6 h-6 opacity-50" />
               </div>
               <p className="text-xs font-black text-slate-600 mb-1">لا توجد معاملات مطابقة للبحث</p>
               <p className="text-[10px] font-bold text-slate-400">تأكد من رقم المعاملة أو اسم العميل</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}