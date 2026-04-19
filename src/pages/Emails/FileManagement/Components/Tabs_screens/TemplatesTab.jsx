import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../../../api/axios';
import { 
  Plus, Edit, Trash2, LayoutTemplate, Search, 
  MessageSquare, Send, Sparkles, Loader2, Info 
} from 'lucide-react';
import { toast } from 'sonner';

export default function TemplatesTab() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);

  // جلب القوالب
  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['notification-templates'],
    queryFn: async () => {
      const res = await api.get('/transfer-center/templates');
      return res.data?.data || [];
    }
  });

  // حذف قالب
  const deleteMutation = useMutation({
    mutationFn: async (id) => await api.delete(`/transfer-center/templates/${id}`),
    onSuccess: () => {
      toast.success('تم حذف القالب بنجاح');
      queryClient.invalidateQueries(['notification-templates']);
    }
  });

  const handleEdit = (tpl) => {
    setEditingTemplate(tpl);
    setIsModalOpen(true);
  };

  const filteredTemplates = templates.filter(t => 
    t.title.includes(searchTerm) || t.content.includes(searchTerm)
  );

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white">
      {/* Header Bar */}
      <div className="p-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between shrink-0">
        <div className="relative w-64">
          <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input 
            type="text" 
            placeholder="بحث في القوالب..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-3 pr-8 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
        <button 
          onClick={() => { setEditingTemplate(null); setIsModalOpen(true); }}
          className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-[10px] font-black flex items-center gap-1.5 hover:bg-indigo-700 transition-all shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" /> إضافة قالب جديد
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {isLoading ? (
          <div className="flex justify-center p-12"><Loader2 className="w-6 h-6 animate-spin text-indigo-500" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredTemplates.map(tpl => (
              <div key={tpl.id} className="group border border-slate-200 rounded-2xl p-4 bg-white hover:border-indigo-300 hover:shadow-md transition-all relative">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${tpl.type === 'request' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                      <LayoutTemplate className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-800">{tpl.title}</h4>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{tpl.type === 'request' ? 'طلب وارد' : 'إرسال صادر'}</span>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEdit(tpl)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><Edit className="w-3.5 h-3.5"/></button>
                    <button onClick={() => deleteMutation.mutate(tpl.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5"/></button>
                  </div>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 min-h-[80px]">
                  <p className="text-[10px] font-bold text-slate-600 leading-relaxed line-clamp-4 whitespace-pre-wrap">{tpl.content}</p>
                </div>
                <div className="mt-3 flex items-center gap-3 text-[9px] font-black text-slate-400">
                  <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3"/> واتساب</span>
                  <span className="flex items-center gap-1"><Send className="w-3 h-3"/> SMS</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <TemplateFormModal 
          template={editingTemplate} 
          onClose={() => setIsModalOpen(false)} 
          queryClient={queryClient}
        />
      )}
    </div>
  );
}

// ==========================================
// مكون المودل الداخلي (Add/Edit Template)
// ==========================================
function TemplateFormModal({ template, onClose, queryClient }) {
  const [formData, setFormData] = useState(template || {
    title: '', content: '', type: 'request', code: ''
  });

  const mutation = useMutation({
    mutationFn: async (data) => {
      if (template) return await api.put(`/transfer-center/templates/${template.id}`, data);
      return await api.post('/transfer-center/templates', data);
    },
    onSuccess: () => {
      toast.success('تم حفظ القالب بنجاح');
      queryClient.invalidateQueries(['notification-templates']);
      onClose();
    }
  });

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-800">{template ? 'تعديل القالب' : 'إضافة قالب جديد'}</h3>
          <button onClick={onClose} className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-xl transition-colors"><Plus className="w-5 h-5 rotate-45" /></button>
        </div>
        
        <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(formData); }} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-[10px] font-black text-slate-500 mb-1.5 uppercase">اسم القالب</label>
              <input 
                required type="text" value={formData.title} 
                onChange={e => setFormData({...formData, title: e.target.value})}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
                placeholder="مثال: تذكير بموعد انتهاء الرابط"
              />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-[10px] font-black text-slate-500 mb-1.5 uppercase">نوع العملية</label>
              <select 
                value={formData.type} 
                onChange={e => setFormData({...formData, type: e.target.value})}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="request">طلب وثائق (وارد)</option>
                <option value="send">إرسال حزمة (صادر)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-500 mb-1.5 uppercase">محتوى الرسالة</label>
            <textarea 
              required value={formData.content} 
              onChange={e => setFormData({...formData, content: e.target.value})}
              className="w-full h-32 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none leading-relaxed"
              placeholder="اكتب نص الرسالة هنا..."
            />
          </div>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
             <div className="flex gap-2 text-amber-800 text-[10px] font-bold">
               <Info className="w-4 h-4 shrink-0" />
               <p>يمكنك استخدام المتغيرات التالية: <code className="bg-white px-1 rounded text-rose-600">{"{targetName}"}</code>, <code className="bg-white px-1 rounded text-rose-600">{"{title}"}</code>, <code className="bg-white px-1 rounded text-rose-600">{"{url}"}</code>, <code className="bg-white px-1 rounded text-rose-600">{"{pin_info}"}</code></p>
             </div>
          </div>

          <div className="flex gap-3 pt-4">
             <button type="submit" disabled={mutation.isPending} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl text-xs font-black shadow-lg hover:bg-indigo-700 flex justify-center items-center gap-2">
               {mutation.isPending ? <Loader2 className="animate-spin w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
               حفظ القالب
             </button>
          </div>
        </form>
      </div>
    </div>
  );
}