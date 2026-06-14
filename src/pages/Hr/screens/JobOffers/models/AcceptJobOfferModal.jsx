import React, { useState } from "react";
import { X, CheckCircle, UploadCloud, Loader2 } from "lucide-react";
import { acceptJobOffer } from "../../../../../api/jobOfferApi";

export default function AcceptJobOfferModal({ offer, onClose, onSuccess, onNavigate }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert("يرجى إرفاق العرض الموقع بصيغة PDF");

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("signedOfferFile", file);

      await acceptJobOffer(offer.id, formData);
      onSuccess();
      
      // إغلاق النافذة الحالية وتوجيه النظام لفتح شاشة إضافة موظف جديد
      onClose();
      
      // توجيه الـ Wrapper لفتح شاشة الموظفين وتمرير حالة (action: "create")
      // في نظام حقيقي، يمكنك إرسال بيانات العرض (offer) في State خارجي 
      // أو Context ليقوم فورم إضافة الموظف بقراءتها
      if (onNavigate) {
        onNavigate("HR_EMPLOYEES", { action: "create", prefilledData: offer });
      }

    } catch (error) {
      console.error("Error:", error);
      alert("فشل تسجيل القبول");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" dir="rtl">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95">
        
        <div className="flex items-center justify-between bg-green-600 px-5 py-4 text-white">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            تسجيل قبول العرض الوظيفي
          </h2>
          <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6 text-center">
            <p className="text-gray-600 mb-1">المرشح:</p>
            <p className="text-xl font-bold text-gray-800">{offer.candidateName}</p>
            <p className="text-sm text-gray-500 mt-1">{offer.jobTitle} - {offer.basicSalary} ر.س</p>
          </div>

          <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-100 transition-colors">
            <UploadCloud className="w-10 h-10 text-gray-400 mx-auto mb-3" />
            <p className="text-sm font-bold text-gray-700 mb-1">ارفع نسخة العرض الموقعة</p>
            <p className="text-xs text-gray-500 mb-4">يجب أن تحتوي النسخة على توقيع الشركة والمرشح</p>
            
            <input 
              type="file" 
              accept=".pdf" 
              required
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-green-50 file:text-green-700"
            />
          </div>

          <div className="mt-8 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 text-gray-600 font-bold bg-gray-100 rounded-xl hover:bg-gray-200">
              تراجع
            </button>
            <button type="submit" disabled={loading} className="flex-1 py-2.5 text-white font-bold bg-green-600 rounded-xl hover:bg-green-700 disabled:opacity-70 flex items-center justify-center gap-2">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "اعتماد وفتح ملف وظيفي"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}