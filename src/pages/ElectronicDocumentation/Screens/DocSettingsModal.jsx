import React, { useState } from "react";
import { motion } from "framer-motion";
import { X, Save, Plus, Palette, Settings2, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../api/axios";
import { toast } from "sonner";

export default function DocSettingsModal({ isOpen, onClose }) {
  const queryClient = useQueryClient();
  const [editingTemplate, setEditingTemplate] = useState(null);

  const { data: templates = [] } = useQuery({
    queryKey: ["seal-templates"],
    queryFn: async () => (await api.get("/documentation/templates")).data.data,
    enabled: isOpen
  });

  const saveMutation = useMutation({
    mutationFn: (data) => api.post("/documentation/templates", data),
    onSuccess: () => {
      queryClient.invalidateQueries(["seal-templates"]);
      toast.success("تم حفظ القالب بنجاح");
      setEditingTemplate(null);
    }
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-end font-tajawal">
      <div onClick={onClose} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
      <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} className="relative w-full max-w-md h-full bg-white shadow-2xl flex flex-col p-8">
        
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-black text-slate-800">إعدادات قوالب الأختام</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full"><X/></button>
        </div>

        {/* Form */}
        <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 mb-8">
          <h3 className="text-xs font-black text-blue-600 uppercase mb-4 tracking-widest">إضافة/تعديل قالب</h3>
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 mr-2">اسم القالب</label>
              <input 
                type="text" className="w-full p-3 border rounded-xl text-sm font-bold outline-none focus:border-blue-500"
                placeholder="مثال: ختم الاعتماد الرسمي" 
                value={editingTemplate?.name || ""} onChange={(e) => setEditingTemplate({...editingTemplate, name: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 mr-2">بادئة السيريال</label>
                <input 
                  type="text" className="w-full p-3 border rounded-xl text-sm font-bold uppercase outline-none focus:border-blue-500"
                  placeholder="SEC-" 
                  value={editingTemplate?.serialPrefix || ""} onChange={(e) => setEditingTemplate({...editingTemplate, serialPrefix: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 mr-2">لون الختم</label>
                <input 
                  type="color" className="w-full h-[46px] p-1 border rounded-xl cursor-pointer"
                  value={editingTemplate?.color || "#1d3d75"} onChange={(e) => setEditingTemplate({...editingTemplate, color: e.target.value})}
                />
              </div>
            </div>
            <button 
              onClick={() => saveMutation.mutate(editingTemplate)}
              className="w-full py-3 bg-blue-600 text-white rounded-xl text-xs font-black flex justify-center items-center gap-2 hover:bg-blue-700 transition-all"
            >
              <Save size={16}/> حفظ إعدادات القالب
            </button>
          </div>
        </div>

        {/* Templates List */}
        <div className="flex-1 overflow-auto space-y-3 custom-scrollbar">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">القوالب الحالية</h3>
          {templates.map(t => (
            <div key={t.id} className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center justify-between group hover:border-blue-200 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: t.color || "#1d3d75" }} />
                <div>
                  <div className="text-sm font-black text-slate-700">{t.name}</div>
                  <div className="text-[10px] font-bold text-slate-400">Prefix: {t.serialPrefix}</div>
                </div>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => setEditingTemplate(t)} className="p-2 text-slate-400 hover:text-blue-600"><Settings2 size={16}/></button>
                <button className="p-2 text-slate-400 hover:text-rose-600"><Trash2 size={16}/></button>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}