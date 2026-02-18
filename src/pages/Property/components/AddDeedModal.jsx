import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createDeed } from "../../../api/propertyApi"; // تأكد من مسار الـ API
import { searchClients } from "../../../api/transactionApi"; // لاستخدامها في البحث عن العميل
import { X, Save, AlertTriangle, Loader2, User, Search, CheckCircle2, ChevronLeft } from "lucide-react";
import { toast } from "sonner";

// دالة مساعدة لضمان عرض الاسم بشكل صحيح (منع خطأ React Object)
const getSafeClientName = (client) => {
  if (!client) return "";
  const actualClient = client.data || client;
  const name = actualClient.name;
  if (!name) return "عميل جديد";
  if (typeof name === "string") return name;
  if (name.ar) return name.ar;
  if (typeof name === "object") {
    const { firstName, fatherName, grandFatherName, familyName } = name;
    return [firstName, fatherName, grandFatherName, familyName].filter(Boolean).join(" ");
  }
  return "اسم غير معروف";
};

const AddDeedModal = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();

  // State للنموذج
  const [formData, setFormData] = useState({
    clientId: null,
    deedNumber: "",    // يعمل كاسم العرض/رقم الصك
    district: "",
    city: "الرياض",    // افتراضي
    area: "",
    nationalId: "",    // الهوية العقارية
    deedDate: new Date().toISOString().split('T')[0], // افتراضي لتجنب أخطاء الباك اند
  });

  // State لبحث العملاء
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedClientName, setSelectedClientName] = useState("");

  // منطق البحث عن العميل
  React.useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.length > 1) {
        if (selectedClientName && searchQuery === selectedClientName) return;
        setIsSearching(true);
        try {
          const results = await searchClients(searchQuery);
          setSearchResults(results || []);
        } catch (error) {
          console.error(error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedClientName]);

  // منطق الحفظ
  const mutation = useMutation({
    mutationFn: createDeed,
    onSuccess: () => {
      toast.success("تم إنشاء ملف الملكية بنجاح");
      queryClient.invalidateQueries(['deeds']); // تحديث جدول الصكوك
      handleClose(); // إغلاق وتصفير النموذج
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "حدث خطأ أثناء الحفظ");
    }
  });

  const handleSubmit = () => {
    if (!formData.clientId) {
      toast.error("يجب اختيار المالك (العميل) أولاً");
      return;
    }
    
    // تجهيز البيانات كما يتوقعها الباك اند (propertyController)
    const payload = {
      clientId: formData.clientId,
      deedNumber: formData.deedNumber,
      district: formData.district,
      city: formData.city,
      area: parseFloat(formData.area),
      planNumber: formData.nationalId, // استخدام ההوية العقارية في حقل מخطط مؤقتاً أو إن كان هناك حقل مخصص لها
      deedDate: formData.deedDate,
      status: "Active"
    };

    mutation.mutate(payload);
  };

  const handleClose = () => {
    setFormData({ clientId: null, deedNumber: "", district: "", city: "الرياض", area: "", nationalId: "", deedDate: new Date().toISOString().split('T')[0] });
    setSearchQuery("");
    setSearchResults([]);
    setSelectedClientName("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-lg w-full max-w-2xl shadow-2xl overflow-hidden scale-100 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-800 text-white p-4 flex items-center justify-between">
          <h3 className="text-lg font-bold">إنشاء ملف ملكية (صك) جديد</h3>
          <button onClick={handleClose} className="p-1 hover:bg-white/20 rounded transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
          
          {/* رسالة النظام */}
          <div className="bg-blue-50 border border-blue-300 rounded-lg p-3">
            <p className="text-xs font-bold text-blue-900">كود النظام التلقائي: PRO-800-XXX</p>
            <p className="text-[10px] text-blue-700 mt-1">سيتم توليد الكود الخاص بالملكية تلقائياً عند الحفظ</p>
          </div>

          {/* 1. اختيار العميل (مهم جداً للربط) */}
          <div className="bg-stone-50 p-4 rounded-lg border border-stone-200 relative z-20">
            <label className="block text-sm font-bold text-stone-700 mb-2">المالك (العميل) <span className="text-red-500">*</span></label>
            <div className="relative">
              <Search className="absolute right-3 top-2.5 w-4 h-4 text-stone-400" />
              <input
                type="text"
                className={`w-full pl-3 pr-10 py-2 text-sm border rounded focus:outline-none transition-colors ${formData.clientId ? 'border-green-500 bg-green-50 text-green-900 font-bold' : 'border-stone-300 focus:border-blue-500'}`}
                placeholder="ابحث برقم الهوية، الجوال، أو الاسم..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (formData.clientId) {
                    setFormData(prev => ({ ...prev, clientId: null }));
                    setSelectedClientName("");
                  }
                }}
              />
              {isSearching && <Loader2 className="absolute left-3 top-2.5 w-4 h-4 text-blue-500 animate-spin" />}
              {formData.clientId && <CheckCircle2 className="absolute left-3 top-2.5 w-4 h-4 text-green-600" />}

              {/* نتائج البحث */}
              {searchResults.length > 0 && !formData.clientId && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-stone-200 rounded-lg shadow-xl z-50 max-h-48 overflow-y-auto">
                  {searchResults.map((client) => {
                    const safeName = getSafeClientName(client);
                    return (
                      <div
                        key={client.id}
                        onClick={() => {
                          setFormData({ ...formData, clientId: client.id });
                          setSelectedClientName(safeName);
                          setSearchQuery(safeName);
                          setSearchResults([]);
                        }}
                        className="flex items-center justify-between p-3 hover:bg-blue-50 cursor-pointer border-b border-stone-100 last:border-0"
                      >
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-stone-400" />
                          <div>
                            <div className="font-bold text-sm text-stone-800">{safeName}</div>
                            <div className="text-[10px] text-stone-500 font-mono">الهوية: {client.idNumber} | جوال: {client.mobile}</div>
                          </div>
                        </div>
                        <ChevronLeft className="w-4 h-4 text-stone-300" />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* 2. اسم العرض / رقم الصك */}
          <div>
            <label className="block text-sm font-bold text-stone-700 mb-1">اسم العرض / رقم الصك <span className="text-red-500">*</span></label>
            <input 
              type="text" 
              className="w-full px-3 py-2 text-sm border border-stone-300 rounded focus:outline-none focus:border-green-500" 
              placeholder="مثال: صك رقم 3101234567 أو أرض الياسمين" 
              value={formData.deedNumber}
              onChange={(e) => setFormData({...formData, deedNumber: e.target.value})}
            />
          </div>

          {/* 3. الحي والمدينة */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-stone-700 mb-1">الحي <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                className="w-full px-3 py-2 text-sm border border-stone-300 rounded focus:outline-none focus:border-green-500" 
                placeholder="الياسمين" 
                value={formData.district}
                onChange={(e) => setFormData({...formData, district: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-stone-700 mb-1">المدينة <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                className="w-full px-3 py-2 text-sm border border-stone-300 rounded focus:outline-none focus:border-green-500" 
                placeholder="الرياض" 
                value={formData.city}
                onChange={(e) => setFormData({...formData, city: e.target.value})}
              />
            </div>
          </div>

          {/* 4. المساحة والهوية العقارية */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-stone-700 mb-1">إجمالي المساحة (م²) <span className="text-red-500">*</span></label>
              <input 
                type="number" 
                className="w-full px-3 py-2 text-sm border border-stone-300 rounded focus:outline-none focus:border-green-500" 
                placeholder="1500" 
                value={formData.area}
                onChange={(e) => setFormData({...formData, area: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-stone-700 mb-1">الهوية العقارية (اختياري)</label>
              <input 
                type="text" 
                className="w-full px-3 py-2 text-sm border border-stone-300 rounded font-mono focus:outline-none focus:border-green-500" 
                placeholder="3102555123" 
                value={formData.nationalId}
                onChange={(e) => setFormData({...formData, nationalId: e.target.value})}
              />
            </div>
          </div>

          {/* ملاحظة */}
          <div className="bg-amber-50 border border-amber-400 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-bold text-amber-900">ملاحظة</p>
                <p className="text-[10px] text-amber-800 mt-1">يمكنك إضافة الوثائق المرفقة (ملف الـ PDF) وربط المعاملات بعد إنشاء الملف من شاشة التفاصيل.</p>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-4 border-t border-stone-200 bg-stone-50 rounded-b-lg">
          <button 
            onClick={handleClose} 
            className="px-4 py-2 text-sm text-stone-600 hover:bg-stone-200 rounded-lg font-bold transition-colors"
          >
            إلغاء
          </button>
          <button 
            onClick={handleSubmit}
            disabled={mutation.isPending || !formData.clientId || !formData.deedNumber || !formData.district || !formData.area}
            className="px-6 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold flex items-center gap-2 disabled:opacity-50 transition-colors shadow-sm"
          >
            {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            حفظ ملف الملكية
          </button>
        </div>

      </div>
    </div>
  );
};

export default AddDeedModal;