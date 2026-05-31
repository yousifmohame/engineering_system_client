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
    <div className="fixed inset-0 z-[300] bg-[#08111c]/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200" dir="rtl">
      {/* 💡 خلفية قابلة للنقر لإغلاق النافذة */}
      <div className="absolute inset-0" onClick={onClose}></div>

      <div className="bg-white rounded-[24px] w-full max-w-md sm:max-w-lg border border-[#d8b46a]/25 overflow-hidden shadow-[0_24px_70px_rgba(2,12,23,0.28)] flex flex-col max-h-[88vh] relative z-10 zoom-in-95">
        
        {/* الترويسة */}
        <div className="px-5 py-3 border-b border-[#e8ddc8] bg-gradient-to-l from-[#08111c] via-[#0f3448] to-[#123f59] text-white flex items-center justify-between">
           <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-[#e2bf74] text-[#08111c] rounded-xl flex items-center justify-center shadow-inner">
                <Users size={20}/>
             </div>
             <div>
               <h3 className="text-sm font-black text-white">دليل العملاء</h3>
               <p className="text-[10px] font-bold text-white/60 mt-0.5">اختر العميل لربطه بالمحضر</p>
             </div>
           </div>
           <button type="button" onClick={onClose} className="inline-flex h-8 items-center gap-1 rounded-xl bg-white/10 px-2 text-[10px] font-black text-white transition hover:bg-rose-500">
             <X size={16}/> إغلاق
           </button>
        </div>
        
        {/* شريط البحث */}
        <div className="p-3 border-b border-[#e8ddc8] bg-white">
           <div className="relative group">
              <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8da0bb] group-focus-within:text-[#0e7490] transition-colors" size={16}/>
              <input 
                 type="text" 
                 value={search}
                 onChange={e => setSearch(e.target.value)}
                 placeholder="ابحث بالاسم أو اسم الشركة..." 
                 className="w-full pr-10 pl-4 py-3 bg-[#fbf8f1] border border-[#e8ddc8] rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-[#0e7490]/20 focus:border-[#0e7490] focus:bg-white transition-all"
              />
              {search && (
                <button type="button" onClick={() => setSearch("")} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8da0bb] hover:text-rose-500">
                  <X size={14} />
                </button>
              )}
           </div>
        </div>

        {/* قائمة العملاء */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5 custom-scrollbar bg-[#fbf8f1]/50">
          {isLoading ? (
             <div className="flex flex-col items-center justify-center py-12 text-[#0e7490]">
               <Loader2 className="animate-spin mb-3" size={32}/>
               <span className="text-xs font-bold text-[#64748b]">جاري جلب البيانات...</span>
             </div>
          ) : filteredContacts.length > 0 ? (
             filteredContacts.map((contact, index) => {
               const name = contact.name || contact.displayName || "عميل غير معروف";
               const isCompany = !!contact.companyName;
               
               return (
                 <button type="button"
                   // 💡 السر هنا: دمجنا الـ id مع الـ index لضمان عدم تكرار المفتاح مهما حدث في الباك إند
                   key={`${contact.id || 'client'}-${index}`}
                   onClick={() => onSelect(contact)}
                   className="w-full text-right p-3 bg-white hover:bg-[#eef7f6] border border-[#e8ddc8]/70 hover:border-[#b9e5ee] rounded-2xl transition-all flex justify-between items-center group shadow-sm hover:shadow"
                 >
                   <div className="flex items-center gap-3">
                     {/* أيقونة تمييزية أو الحرف الأول */}
                     <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 transition-colors ${isCompany ? 'bg-amber-50 text-amber-600 group-hover:bg-amber-100' : 'bg-[#eef7f6] text-[#0e7490] group-hover:bg-[#0e7490] group-hover:text-[#0e7490]'}`}>
                       {name.charAt(0)}
                     </div>
                     
                     <div className="flex flex-col gap-0.5">
                       <p className="text-xs font-black text-[#123f59] group-hover:text-[#0e7490] transition-colors">
                         {name}
                       </p>
                       <p className="text-[10px] font-bold text-[#8da0bb] flex items-center gap-1">
                         {isCompany ? <Building2 size={10} className="text-amber-500"/> : <User size={10}/>}
                         {contact.companyName || 'حساب أفراد'}
                       </p>
                     </div>
                   </div>

                   <div className="inline-flex h-8 items-center gap-1 rounded-xl bg-[#eef7f6] px-2 text-[9px] font-black text-[#0e7490] transition group-hover:bg-[#0e7490] group-hover:text-white">
                      <UserPlus size={13} className="transition-colors" /> اختيار
                   </div>
                 </button>
               );
             })
          ) : (
             <div className="flex flex-col items-center justify-center py-12 text-[#8da0bb]">
               <div className="w-14 h-14 bg-[#fbf8f1] rounded-2xl border border-[#e8ddc8] flex items-center justify-center mb-3">
                 <Search className="w-6 h-6 opacity-50" />
               </div>
               <p className="text-xs font-black text-[#60738f] mb-1">لا توجد نتائج مطابقة</p>
               <p className="text-[10px] font-bold text-[#8da0bb]">حاول البحث بكلمات مختلفة</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}