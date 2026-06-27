import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../../../api/axios";
import { toast } from "sonner";
import { X, Plus, Upload, Loader2, Save, User, Users, Briefcase } from "lucide-react";

const CreateTransactionModal = ({ onClose, selectedVaultId }) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    transactionType: "إيداع",
    direction: "INBOUND",
    category: "FEES",
    amount: "",
    transactionDate: new Date().toISOString().split("T")[0],
    description: "",
    
    // حقول الربط المنفصلة
    linkedTransactionId: "",
    linkedCustomerId: "",
    employeeId: "", // سنستخدمه لتحديد receivedBy أو deliveredBy
    recipientName: "",
    
    attachment: null,
  });

  // 1. جلب الموظفين
  const { data: employees = [] } = useQuery({ 
    queryKey: ["employees-list"], 
    queryFn: async () => {
      const res = await api.get("/employees");
      return res.data?.data || [];
    } 
  });

  // 2. جلب العملاء (باستخدام المسار المبسط الذي ذكرته)
  const { data: clients = [] } = useQuery({ 
    queryKey: ["simple-clients"], 
    queryFn: async () => {
      const res = await api.get("/clients/simple");
      // الباك إند يعيدها كـ [{ value: 'id', label: 'name' }]
      return res.data?.data || res.data || [];
    } 
  });

  // 3. جلب المعاملات
  const { data: systemTransactions = [] } = useQuery({ 
    queryKey: ["private-transactions-simple"], 
    queryFn: async () => {
      const res = await api.get("/private-transactions");
      return res.data?.data || [];
    } 
  });

  const handleTypeSelection = (type) => {
    let direction = "INBOUND";
    let category = "FEES";

    if (["سحب", "مصروف"].includes(type)) { 
      direction = "OUTBOUND"; category = "PENDING"; 
    } else if (type === "سلفة" || type === "عهدة") { 
      direction = "OUTBOUND"; category = "CUSTODY"; 
    } else if (type === "دعم بنك") { 
      direction = "INTERNAL_TRANSFER"; category = "BANK_SUPPORT"; 
    }

    setFormData({ ...formData, transactionType: type, direction, category });
  };

  const createMutation = useMutation({
    mutationFn: async (payload) => {
      const fd = new FormData();
      
      // تعبئة البيانات الأساسية
      Object.keys(payload).forEach(key => {
        if (key === "attachment" && payload[key]) {
          fd.append("files", payload[key]);
        } else if (key !== "employeeId" && payload[key] !== null && payload[key] !== "") {
          fd.append(key, payload[key]);
        }
      });
      
      fd.append("vaultId", selectedVaultId);

      // توجيه معرف الموظف بشكل ذكي بناءً على اتجاه الحركة
      if (payload.employeeId) {
        if (payload.direction === "INBOUND") {
          fd.append("deliveredBy", payload.employeeId); // الموظف هو من أودع/سلم المبلغ
        } else {
          fd.append("receivedBy", payload.employeeId);  // الموظف هو من سحب/استلم المبلغ
        }
      }

      return await api.post("/accounts/transactions", fd, { 
        headers: { "Content-Type": "multipart/form-data" } 
      });
    },
    onSuccess: () => {
      toast.success("تم تسجيل الحركة النقدية بنجاح");
      queryClient.invalidateQueries(["cash-transactions", selectedVaultId]);
      queryClient.invalidateQueries(["cash-vaults"]);
      onClose();
    },
    onError: (err) => toast.error(err.response?.data?.message || "خطأ أثناء التسجيل"),
  });

  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 animate-in fade-in" dir="rtl">
      <div className="bg-[var(--wms-surface-1)] border border-[var(--wms-border)] rounded-xl shadow-2xl w-full flex flex-col" style={{ maxWidth: "600px", maxHeight: "90vh" }}>
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--wms-border)] bg-slate-50 rounded-t-xl shrink-0">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg text-white">
              <Plus className="w-4 h-4" />
            </div>
            <span className="text-slate-800 font-bold">تسجيل حركة مالية (المعالج الذكي)</span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 bg-white p-1 rounded-md border shadow-sm transition-colors cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar-slim">
          
          {/* محرك التوجيه (Routing Engine) */}
          <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl space-y-4">
            <div>
              <label className="block mb-2 text-slate-700 text-xs font-bold">طبيعة الإجراء المالي</label>
              <div className="flex gap-2 flex-wrap">
                {["إيداع", "سحب", "تحصيل", "مصروف", "سلفة", "عهدة", "دعم بنك"].map((t) => (
                  <button
                    key={t} onClick={() => handleTypeSelection(t)}
                    className={`px-4 py-1.5 rounded-lg cursor-pointer border shadow-sm text-xs transition-all ${
                      formData.transactionType === t 
                        ? "bg-blue-600 border-blue-700 text-white font-bold ring-2 ring-blue-600/20" 
                        : "bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-1.5 text-slate-600 text-[11px] font-bold">توجيه الرصيد الداخلي (الفئة) *</label>
                <select 
                  value={formData.category} 
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })} 
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
                >
                  <option value="FEES">أتعاب معاملات (إيراد)</option>
                  <option value="RESERVE">احتياطي المكتب</option>
                  <option value="BANK_SUPPORT">دعم بنك (مخصص إيداع)</option>
                  <option value="PENDING">مبالغ معلقة / مصروفات</option>
                  <option value="CUSTODY">سلف وعهد قيد التسوية</option>
                </select>
              </div>
              <div>
                <label className="block mb-1.5 text-slate-600 text-[11px] font-bold">التاريخ الفعلي</label>
                <input 
                  type="date" 
                  value={formData.transactionDate} 
                  onChange={(e) => setFormData({ ...formData, transactionDate: e.target.value })} 
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 cursor-pointer" 
                />
              </div>
            </div>
          </div>

          {/* القيمة والبيان */}
          <div className="space-y-4">
            <div>
              <label className="block mb-1.5 text-slate-700 text-xs font-bold">المبلغ (ر.س) *</label>
              <div className="relative">
                <input 
                  type="number" 
                  value={formData.amount} 
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })} 
                  className={`w-full bg-white border-2 rounded-xl px-4 text-2xl font-mono font-bold outline-none transition-colors h-14 ${
                    formData.direction === "INBOUND" 
                      ? "border-green-400 focus:border-green-500 text-green-700" 
                      : "border-red-300 focus:border-red-500 text-red-700"
                  }`} 
                  placeholder="0.00" 
                  dir="ltr" 
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">SAR</div>
              </div>
            </div>
            <div>
              <label className="block mb-1.5 text-slate-700 text-xs font-bold">البيان المحاسبي الدقيق *</label>
              <input 
                type="text" 
                value={formData.description} 
                onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500" 
                placeholder="مثال: دفعة من العميل عن رخصة بناء..." 
              />
            </div>
          </div>

          {/* الربط التشغيلي */}
          <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/50 space-y-4">
            <h4 className="text-xs font-bold text-slate-700 border-b pb-2 mb-1 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-blue-500" />
              الربط التشغيلي (اختياري لتوثيق الحركة)
            </h4>
            
            <div className="grid grid-cols-2 gap-4">
              {/* المعاملات */}
              <div>
                <label className="block mb-1.5 text-slate-600 text-[11px] font-bold flex items-center gap-1">
                  ربط بمعاملة
                </label>
                <select 
                  value={formData.linkedTransactionId} 
                  onChange={(e) => setFormData({ ...formData, linkedTransactionId: e.target.value })} 
                  className="w-full bg-white border border-gray-300 rounded-lg px-2 py-2 text-xs outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="">بدون ربط</option>
                  {systemTransactions.map((tx) => (
                    <option key={tx.id || tx.dbId} value={tx.id || tx.dbId}>
                      {tx.transactionCode || tx.ref} - {tx.title || tx.client}
                    </option>
                  ))}
                </select>
              </div>

              {/* العملاء */}
              <div>
                <label className="block mb-1.5 text-slate-600 text-[11px] font-bold flex items-center gap-1">
                  <Users className="w-3 h-3 text-emerald-500" /> ربط بعميل
                </label>
                <select 
                  value={formData.linkedCustomerId} 
                  onChange={(e) => setFormData({ ...formData, linkedCustomerId: e.target.value })} 
                  className="w-full bg-white border border-gray-300 rounded-lg px-2 py-2 text-xs outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="">بدون ربط (مبلغ عام)</option>
                  {clients.map((c) => (
                    // يدعم الهيكلة المبسطة {value, label} أو الهيكلة الكاملة {id, name}
                    <option key={c.value || c.id} value={c.value || c.id}>
                      {c.label || c.name?.ar || "عميل"}
                    </option>
                  ))}
                </select>
              </div>

              {/* الموظفين */}
              <div>
                <label className="block mb-1.5 text-slate-600 text-[11px] font-bold flex items-center gap-1">
                  <User className="w-3 h-3 text-orange-500" /> ربط بموظف (عهد/سلف)
                </label>
                <select 
                  value={formData.employeeId} 
                  onChange={(e) => {
                    const empName = e.target.options[e.target.selectedIndex].text;
                    setFormData({ 
                      ...formData, 
                      employeeId: e.target.value,
                      recipientName: e.target.value ? empName : "" 
                    });
                  }} 
                  className="w-full bg-white border border-gray-300 rounded-lg px-2 py-2 text-xs outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="">غير محدد</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name || emp.firstNameAr || emp.employeeCode}
                    </option>
                  ))}
                </select>
              </div>

              {/* المرفقات */}
              <div>
                <label className="block mb-1.5 text-slate-600 text-[11px] font-bold">مستند الإثبات</label>
                <label className="flex items-center justify-center gap-2 p-1.5 border-2 border-dashed border-blue-200 rounded-lg bg-blue-50 text-blue-600 cursor-pointer hover:bg-blue-100 transition-colors h-[34px]">
                  <Upload className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold truncate max-w-[120px]">
                    {formData.attachment ? formData.attachment.name : "رفع إيصال/فاتورة"}
                  </span>
                  <input 
                    type="file" 
                    className="hidden" 
                    onChange={(e) => setFormData({ ...formData, attachment: e.target.files[0] })} 
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[var(--wms-border)] bg-gray-50 rounded-b-xl shrink-0">
          <button 
            onClick={onClose} 
            className="px-5 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 font-bold text-xs hover:bg-gray-100 cursor-pointer"
          >
            إلغاء
          </button>
          <button 
            onClick={() => createMutation.mutate(formData)} 
            disabled={createMutation.isPending} 
            className="flex items-center gap-2 px-6 py-2 rounded-lg bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 disabled:opacity-70 shadow-md cursor-pointer"
          >
            {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} 
            اعتماد وتحديث الرصيد
          </button>
        </div>

      </div>
    </div>
  );
};

export default CreateTransactionModal;