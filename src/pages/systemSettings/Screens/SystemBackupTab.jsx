import React from "react";
import { toast } from "sonner";
import api from "../../../api/axios";
import { Database, FolderArchive, AlertTriangle, Download, Server } from "lucide-react";

export default function SystemBackupTab() {

  const handleDbBackup = async () => {
    toast.info("جاري تجهيز وتنزيل قاعدة البيانات، يرجى الانتظار...");
    try {
      // استخدام Axios لتحميل الملف مع الـ Token
      const response = await api.get("/server/backup", { responseType: "blob" });
      
      // إنشاء رابط وهمي لتحميل الملف في المتصفح
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `database_backup_${new Date().toISOString().split('T')[0]}.sql`);
      document.body.appendChild(link);
      link.click();
      link.remove(); // تنظيف
      
      toast.success("تم تحميل قاعدة البيانات بنجاح!");
    } catch (error) {
      toast.error("فشل في تحميل قاعدة البيانات. تأكد من صلاحياتك.");
    }
  };

  const handleUploadsBackup = async () => {
    toast.info("جاري ضغط وتنزيل المرفقات... قد يستغرق هذا عدة دقائق.");
    try {
      // استخدام Axios مع تحديد responseType: 'blob'
      const response = await api.get("/server/backup-uploads", { responseType: "blob" });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `uploads_backup_${new Date().toISOString().split('T')[0]}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success("تم تحميل مجلد المرفقات بنجاح!");
    } catch (error) {
      // إذا كان الخطأ 404 (المجلد غير موجود)
      if (error.response && error.response.status === 404) {
        toast.error("مجلد المرفقات غير موجود على السيرفر!");
      } else {
        toast.error("فشل في تحميل المرفقات. حجم الملف قد يكون كبيراً جداً.");
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50/50" dir="rtl" style={{ fontFamily: "Tajawal, sans-serif" }}>
      {/* Header */}
      <div className="sys-compact-page-header flex items-center justify-between gap-3 mx-4 mt-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-[13px] bg-[#d9b85b] text-[#083646] flex items-center justify-center shrink-0 shadow-sm">
            <Database className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h1 className="text-[16px] font-bold leading-tight whitespace-nowrap text-white">النسخ الاحتياطي</h1>
            <p className="text-[10px] font-semibold text-white/75 mt-0.5 whitespace-nowrap">حفظ نسخة من قواعد البيانات والملفات المرفوعة</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in">
          
          <div className="bg-blue-50 border border-[#d8e6ee] rounded-xl p-5 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-[#0f6d7c] shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-blue-900 mb-1">أهمية النسخ الاحتياطي</h4>
              <p className="text-xs text-blue-700 leading-relaxed font-semibold">
                يُرجى أخذ نسخة احتياطية بشكل دوري (أسبوعياً على الأقل) والاحتفاظ بها في مكان آمن (فلاش ميموري أو هارد خارجي) لضمان عدم ضياع أي بيانات مالية أو مرفقات في حال تعطل السيرفر.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* DB Backup */}
            <div className="bg-white border border-gray-200 rounded-[22px] p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-[22px] flex items-center justify-center mb-4">
                <Database className="w-8 h-8" />
              </div>
              <h3 className="text-base font-black text-[#123B5D] mb-2">قاعدة البيانات (SQL)</h3>
              <p className="text-xs text-gray-500 font-semibold mb-6">
                تحميل نسخة كاملة من جميع الجداول، السجلات، الحسابات والمعاملات بصيغة خفيفة يسهل استرجاعها.
              </p>
              <button 
                onClick={handleDbBackup}
                className="w-full flex items-center justify-center gap-2 bg-[#083646] text-white py-3 rounded-xl font-bold hover:bg-[#0f6d7c] transition-colors shadow-md"
              >
                <Download className="w-4 h-4" /> تحميل قاعدة البيانات
              </button>
            </div>

            {/* Uploads Backup */}
            <div className="bg-white border border-gray-200 rounded-[22px] p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-emerald-50 text-[#0f6d7c] rounded-[22px] flex items-center justify-center mb-4">
                <FolderArchive className="w-8 h-8" />
              </div>
              <h3 className="text-base font-black text-[#123B5D] mb-2">مجلد المرفقات (Uploads)</h3>
              <p className="text-xs text-gray-500 font-semibold mb-6">
                تحميل ملف مضغوط (ZIP) يحتوي على جميع الصور، ملفات الـ PDF، والمرفقات الخاصة بالعملاء والمعاملات.
              </p>
              <button 
                onClick={handleUploadsBackup}
                className="w-full flex items-center justify-center gap-2 bg-[#083646] text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-md"
              >
                <Download className="w-4 h-4" /> تحميل مجلد المرفقات
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}