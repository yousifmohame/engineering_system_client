import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../../../api/axios";
import { toast } from "sonner";
import { X, Vault, Save, Loader2 } from "lucide-react";

const CreateVaultModal = ({ onClose }) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    vaultCode: "",
    vaultName: "",
    responsibleEmployeeId: "", // يجب ربطه بقائمة الموظفين
    openingBalance: 0,
    notes: ""
  });

  const createMutation = useMutation({
    mutationFn: async (payload) => await api.post("/accounts/cash-vaults", payload),
    onSuccess: () => {
      toast.success("تم إنشاء الخزنة بنجاح");
      queryClient.invalidateQueries(["cash-vaults"]);
      onClose();
    },
    onError: (err) => toast.error(err.response?.data?.message || "فشل إنشاء الخزنة")
  });

  return (
    <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Vault className="w-5 h-5 text-blue-600" /> تعريف خزنة جديدة
          </h3>
          <X className="w-5 h-5 cursor-pointer text-gray-400" onClick={onClose} />
        </div>
        
        <div className="space-y-4">
          <input className="w-full border p-2 rounded" placeholder="كود الخزنة (مثال: CASH-01)" onChange={e => setFormData({...formData, vaultCode: e.target.value})} />
          <input className="w-full border p-2 rounded" placeholder="اسم الخزنة" onChange={e => setFormData({...formData, vaultName: e.target.value})} />
          <input type="number" className="w-full border p-2 rounded" placeholder="الرصيد الافتتاحي" onChange={e => setFormData({...formData, openingBalance: e.target.value})} />
          <textarea className="w-full border p-2 rounded" placeholder="ملاحظات" onChange={e => setFormData({...formData, notes: e.target.value})} />
        </div>

        <button 
          onClick={() => createMutation.mutate(formData)}
          className="w-full mt-6 bg-blue-600 text-white p-2 rounded-lg font-bold flex items-center justify-center gap-2"
        >
          {createMutation.isPending ? <Loader2 className="animate-spin" /> : <Save className="w-4 h-4" />}
          حفظ الخزنة
        </button>
      </div>
    </div>
  );
};
export default CreateVaultModal;