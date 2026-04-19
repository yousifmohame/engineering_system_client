import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../../api/axios';
import { toast } from 'sonner';
import { Search, MessageCircle, Mail, MessageSquare, Send, Star, SearchX, Check, Plus, Edit, Trash2, Loader2, X } from 'lucide-react';

export default function ContactPicker({ onSelect, onClose, multiSelect = false, channelFilter = 'all' }) {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [filterType, setFilterType] = useState('all');
  
  // حالات الفورم (لإضافة أو تعديل)
  const [showForm, setShowForm] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [formData, setFormData] = useState({
    displayName: '', mobile1: '', email1: '', capacity: '', isFavorite: false, status: 'active'
  });

  // 🚀 جلب جهات الاتصال من الباك إند
  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ['contacts-list'],
    queryFn: async () => {
      const res = await api.get('/contacts');
      return res.data?.data || [];
    }
  });

  // 🚀 ميوتيشن الحفظ (إضافة / تعديل)
  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (editingContact) {
        return await api.put(`/contacts/${editingContact.id}`, data);
      }
      return await api.post('/contacts', data);
    },
    onSuccess: (res) => {
      toast.success(res.data?.message || 'تم الحفظ بنجاح');
      queryClient.invalidateQueries(['contacts-list']);
      closeForm();
    },
    onError: () => toast.error('حدث خطأ أثناء الحفظ')
  });

  // 🚀 ميوتيشن الحذف
  const deleteMutation = useMutation({
    mutationFn: async (id) => await api.delete(`/contacts/${id}`),
    onSuccess: (res) => {
      toast.success(res.data?.message || 'تم الحذف بنجاح');
      queryClient.invalidateQueries(['contacts-list']);
    }
  });

  // دوال الفورم
  const openForm = (contact = null) => {
    if (contact) {
      setEditingContact(contact);
      setFormData({
        displayName: contact.displayName, mobile1: contact.mobile1, email1: contact.email1,
        capacity: contact.capacity, isFavorite: contact.isFavorite, status: contact.status
      });
    } else {
      setEditingContact(null);
      setFormData({ displayName: '', mobile1: '', email1: '', capacity: '', isFavorite: false, status: 'active' });
    }
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingContact(null);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.displayName || !formData.mobile1) return toast.error('الاسم ورقم الجوال مطلوبان');
    saveMutation.mutate(formData);
  };

  const handleDelete = (id) => {
    if (window.confirm('هل أنت متأكد من حذف جهة الاتصال هذه؟')) {
      deleteMutation.mutate(id);
    }
  };

  // فلترة العرض
  const filteredContacts = contacts.filter(c => {
    if (searchTerm && !c.displayName.includes(searchTerm) && !c.mobile1.includes(searchTerm)) return false;
    if (filterType === 'favorites' && !c.isFavorite) return false;
    if (filterType === 'clients' && c.detailedType !== 'client') return false;
    if (filterType === 'officials' && c.detailedType !== 'official') return false;
    if (c.status !== 'active') return false;
    if (channelFilter === 'email' && !c.acceptsEmail) return false;
    if (channelFilter === 'whatsapp' && !c.acceptsWhatsApp) return false;
    return true;
  });

  const toggleSelect = (id) => {
    if (!multiSelect) {
      setSelectedIds(selectedIds.includes(id) ? [] : [id]);
    } else {
      setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    }
  };

  const handleConfirm = () => {
    const selected = contacts.filter(c => selectedIds.includes(c.id));
    onSelect(selected);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex justify-center items-center p-4 animate-in fade-in" dir="rtl">
       <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 max-h-[90vh]">
         
         {/* شاشة الإضافة والتعديل */}
         {showForm ? (
           <div className="flex flex-col h-full">
             <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
               <h3 className="text-sm font-black text-slate-800">{editingContact ? 'تعديل جهة اتصال' : 'إضافة جهة اتصال جديدة'}</h3>
               <button onClick={closeForm} className="p-2 bg-white rounded-xl hover:bg-rose-50 text-slate-500 hover:text-rose-500 transition-colors"><X className="w-4 h-4"/></button>
             </div>
             <form onSubmit={handleFormSubmit} className="p-5 space-y-4 overflow-y-auto">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">الاسم الكريم *</label>
                  <input type="text" value={formData.displayName} onChange={e => setFormData({...formData, displayName: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500/20" placeholder="أدخل اسم جهة الاتصال" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">رقم الجوال *</label>
                    <input type="text" value={formData.mobile1} onChange={e => setFormData({...formData, mobile1: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500/20" placeholder="+9665XXXXXXXX" dir="ltr" required />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">البريد الإلكتروني</label>
                    <input type="email" value={formData.email1} onChange={e => setFormData({...formData, email1: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500/20" placeholder="example@domain.com" dir="ltr" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">المسمى / الصفة</label>
                  <input type="text" value={formData.capacity} onChange={e => setFormData({...formData, capacity: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500/20" placeholder="مثال: مدير مشروع، مالك العقار" />
                </div>
                <label className="flex items-center gap-2 cursor-pointer pt-2">
                  <input type="checkbox" checked={formData.isFavorite} onChange={e => setFormData({...formData, isFavorite: e.target.checked})} className="accent-amber-500 w-4 h-4" />
                  <span className="text-xs font-bold text-slate-700">إضافة للمفضلة</span>
                </label>
                <div className="flex gap-3 pt-4 border-t border-slate-100">
                  <button type="submit" disabled={saveMutation.isPending} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl text-xs font-black hover:bg-indigo-700 transition flex justify-center items-center gap-2">
                    {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin"/> : <Check className="w-4 h-4"/>} حفظ البيانات
                  </button>
                </div>
             </form>
           </div>
         ) : (
           // شاشة اختيار جهات الاتصال (الرئيسية)
           <div className="flex flex-col h-full">
             <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
               <div>
                 <h3 className="text-sm font-black text-slate-800">اختيار جهة {multiSelect ? 'أو أكثر ' : ''}للتواصل</h3>
                 <p className="text-[10px] font-bold text-slate-500 mt-1 flex items-center gap-1">
                   فلتر الإرسال: 
                   {channelFilter === 'email' && <span className="bg-indigo-100 text-indigo-700 px-1.5 rounded flex items-center gap-1"><Mail className="w-3 h-3"/> إيميل</span>}
                   {channelFilter === 'whatsapp' && <span className="bg-emerald-100 text-emerald-700 px-1.5 rounded flex items-center gap-1"><MessageCircle className="w-3 h-3"/> واتساب</span>}
                   {channelFilter === 'sms' && <span className="bg-sky-100 text-sky-700 px-1.5 rounded flex items-center gap-1"><MessageSquare className="w-3 h-3"/> SMS</span>}
                   {channelFilter === 'all' && <span className="bg-slate-200 text-slate-600 px-1.5 rounded">الكل</span>}
                 </p>
               </div>
               <div className="flex gap-2">
                 <button onClick={() => openForm()} className="p-2 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-xl hover:bg-indigo-600 hover:text-white transition-colors" title="إضافة جهة جديدة"><Plus className="w-4 h-4"/></button>
                 <button onClick={onClose} className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-slate-500"><X className="w-4 h-4"/></button>
               </div>
             </div>

             <div className="p-4 border-b border-slate-100 shrink-0 space-y-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  <input type="text" placeholder="ابحث بالاسم أو الجوال..." className="w-full pl-3 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
                <div className="flex gap-2">
                   <button onClick={() => setFilterType('all')} className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-colors ${filterType === 'all' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>الكل</button>
                   <button onClick={() => setFilterType('favorites')} className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-colors flex items-center gap-1 ${filterType === 'favorites' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}><Star className="w-3 h-3"/> المفضلة</button>
                </div>
             </div>

             <div className="flex-1 overflow-y-auto max-h-[350px] p-3 space-y-2 custom-scrollbar">
               {isLoading ? (
                 <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-indigo-500"/></div>
               ) : filteredContacts.length === 0 ? (
                 <div className="p-8 text-center text-slate-400 flex flex-col items-center">
                   <SearchX className="w-8 h-8 mb-2 opacity-50" />
                   <p className="text-xs font-bold">لا توجد جهات اتصال توافق هذا البحث/الفلتر.</p>
                   <button onClick={() => openForm()} className="mt-3 text-[10px] text-indigo-600 font-bold hover:underline">إضافة جهة اتصال جديدة؟</button>
                 </div>
               ) : (
                 filteredContacts.map(contact => (
                   <div key={contact.id} className={`p-3 rounded-xl border transition-colors flex items-center justify-between group ${selectedIds.includes(contact.id) ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-100 hover:bg-slate-50'}`}>
                     <div className="flex items-center gap-3 cursor-pointer flex-1" onClick={() => toggleSelect(contact.id)}>
                       <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${selectedIds.includes(contact.id) ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 bg-white'}`}>
                         {selectedIds.includes(contact.id) && <Check className="w-3 h-3" />}
                       </div>
                       <div className="flex-1 min-w-0">
                         <div className="flex items-center gap-2 mb-1">
                           <p className="text-xs font-black text-slate-800 truncate">{contact.displayName}</p>
                           {contact.isFavorite && <Star className="w-3 h-3 text-amber-400 fill-current shrink-0" />}
                         </div>
                         <div className="flex flex-wrap gap-x-2 gap-y-1 text-[10px] text-slate-500 font-medium">
                           <span>{contact.capacity}</span><span>•</span><span className="font-mono text-emerald-600" dir="ltr">{contact.mobile1}</span>
                         </div>
                       </div>
                     </div>
                     {/* أزرار التعديل والحذف - تظهر عند تمرير الماوس */}
                     <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                       <button onClick={(e) => { e.stopPropagation(); openForm(contact); }} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-100 rounded-lg"><Edit className="w-3.5 h-3.5"/></button>
                       <button onClick={(e) => { e.stopPropagation(); handleDelete(contact.id); }} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-100 rounded-lg"><Trash2 className="w-3.5 h-3.5"/></button>
                     </div>
                   </div>
                 ))
               )}
             </div>

             <div className="p-4 border-t border-slate-100 bg-slate-50 shrink-0 flex justify-between items-center">
               <span className="text-xs font-bold text-slate-600">تم تحديد: <strong className="text-indigo-600">{selectedIds.length}</strong></span>
               <div className="flex gap-2">
                 <button onClick={onClose} className="px-4 py-2 border border-slate-200 bg-white text-slate-600 rounded-xl text-xs font-black hover:bg-slate-100">إلغاء</button>
                 <button 
                   onClick={handleConfirm} disabled={selectedIds.length === 0}
                   className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 disabled:opacity-50 disabled:shadow-none transition-all"
                 >تأكيد الاختيار</button>
               </div>
             </div>
           </div>
         )}
       </div>
    </div>
  );
}