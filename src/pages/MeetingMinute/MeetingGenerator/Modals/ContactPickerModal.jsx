import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, X, Users, Loader2, UserPlus, Building2, User } from "lucide-react";
import api from "../../../../api/axios"; // 💡 تأكد من مسار الـ api الصحيح

export default function ContactPickerModal({ onClose, onSelect }) {
  const [search, setSearch] = useState("");

  // 1. جلب البيانات مرة واحدة من السيرفر (باستخدام api وليس axios)
  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ["clients-simple"],
    queryFn: async () => {
      try {
        const res = await api.get("/clients/simple");
        // التعامل الآمن مع هيكل البيانات القادم من السيرفر
        return res.data?.data || res.data || [];
      } catch (error) {
        console.error("Failed to fetch clients:", error);
        return [];
      }
    },
    // ميزة إضافية: عدم إعادة الطلب من السيرفر عند كل فتح للنافذة لتسريع الأداء
    staleTime: 5 * 60 * 1000, 
  });

  // 2. فلترة محلية سريعة جداً (Instant Search) بدلاً من إرهاق السيرفر
  const filteredContacts = useMemo(() => {
    if (!search.trim()) return contacts;
    
    const term = search.toLowerCase();
    return contacts.filter(c => {
      const name = (c.name || c.displayName || "").toLowerCase();
      const company = (c.companyName || "").toLowerCase();
      return name.includes(term) || company.includes(term);
    });
  }, [contacts, search]);

  return (
    <div className="fixed inset-0 z-[300] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200" dir="rtl">
      {/* 💡 خلفية قابلة للنقر لإغلاق النافذة */}
      <div className="absolute inset-0" onClick={onClose}></div>

      <div className="bg-white rounded-[2rem] w-full max-w-md border border-slate-200 overflow-hidden shadow-2xl flex flex-col max-h-[85vh] relative z-10 zoom-in-95">
        
        {/* الترويسة */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
           <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center shadow-inner">
                <Users size={20}/>
             </div>
             <div>
               <h3 className="text-sm font-black text-slate-900">دليل العملاء</h3>
               <p className="text-[10px] font-bold text-slate-500 mt-0.5">اختر العميل لربطه بالمحضر</p>
             </div>
           </div>
           <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700 rounded-xl transition-colors">
             <X size={20}/>
           </button>
        </div>
        
        {/* شريط البحث */}
        <div className="p-4 border-b border-slate-100 bg-white">
           <div className="relative group">
              <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={16}/>
              <input 
                 type="text" 
                 value={search}
                 onChange={e => setSearch(e.target.value)}
                 placeholder="ابحث بالاسم أو اسم الشركة..." 
                 className="w-full pr-10 pl-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-500">
                  <X size={14} />
                </button>
              )}
           </div>
        </div>

        {/* قائمة العملاء */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5 custom-scrollbar bg-slate-50/30">
          {isLoading ? (
             <div className="flex flex-col items-center justify-center py-12 text-indigo-600">
               <Loader2 className="animate-spin mb-3" size={32}/>
               <span className="text-xs font-bold text-slate-500">جاري جلب البيانات...</span>
             </div>
          ) : filteredContacts.length > 0 ? (
             filteredContacts.map((contact, index) => {
               const name = contact.name || contact.displayName || "عميل غير معروف";
               const isCompany = !!contact.companyName;
               
               return (
                 <button
                   // 💡 السر هنا: دمجنا الـ id مع الـ index لضمان عدم تكرار المفتاح مهما حدث في الباك إند
                   key={`${contact.id || 'client'}-${index}`}
                   onClick={() => onSelect(contact)}
                   className="w-full text-right p-3 bg-white hover:bg-indigo-50 border border-slate-100 hover:border-indigo-200 rounded-2xl transition-all flex justify-between items-center group shadow-sm hover:shadow"
                 >
                   <div className="flex items-center gap-3">
                     {/* أيقونة تمييزية أو الحرف الأول */}
                     <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 transition-colors ${isCompany ? 'bg-amber-50 text-amber-600 group-hover:bg-amber-100' : 'bg-slate-100 text-slate-600 group-hover:bg-indigo-100 group-hover:text-indigo-600'}`}>
                       {name.charAt(0)}
                     </div>
                     
                     <div className="flex flex-col gap-0.5">
                       <p className="text-xs font-black text-slate-800 group-hover:text-indigo-700 transition-colors">
                         {name}
                       </p>
                       <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                         {isCompany ? <Building2 size={10} className="text-amber-500"/> : <User size={10}/>}
                         {contact.companyName || 'حساب أفراد'}
                       </p>
                     </div>
                   </div>

                   <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-indigo-600 transition-colors">
                      <UserPlus size={14} className="text-slate-400 group-hover:text-white transition-colors" />
                   </div>
                 </button>
               );
             })
          ) : (
             <div className="flex flex-col items-center justify-center py-12 text-slate-400">
               <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                 <Search className="w-6 h-6 opacity-50" />
               </div>
               <p className="text-xs font-black text-slate-600 mb-1">لا توجد نتائج مطابقة</p>
               <p className="text-[10px] font-bold text-slate-400">حاول البحث بكلمات مختلفة</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}