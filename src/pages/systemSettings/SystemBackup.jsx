import React from "react";
import { toast } from "sonner";
import api from "../../api/axios";
import { Database, FolderArchive, AlertTriangle, Download, Server } from "lucide-react";

export default function SystemBackup() {

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
      <div className="flex items-center gap-3 px-6 py-5 bg-white border-b border-gray-200 shrink-0 shadow-sm">
        <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center shadow-inner">
          <Database className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h1 className="text-lg font-black text-slate-800">النسخ الاحتياطي (Backup)</h1>
          <p className="text-xs font-semibold text-slate-500">حفظ نسخة من قواعد البيانات والملفات المرفوعة</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in">
          
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-blue-900 mb-1">أهمية النسخ الاحتياطي</h4>
              <p className="text-xs text-blue-700 leading-relaxed font-semibold">
                يُرجى أخذ نسخة احتياطية بشكل دوري (أسبوعياً على الأقل) والاحتفاظ بها في مكان آمن (فلاش ميموري أو هارد خارجي) لضمان عدم ضياع أي بيانات مالية أو مرفقات في حال تعطل السيرفر.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* DB Backup */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-4">
                <Database className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-gray-800 mb-2">قاعدة البيانات (SQL)</h3>
              <p className="text-xs text-gray-500 font-semibold mb-6">
                تحميل نسخة كاملة من جميع الجداول، السجلات، الحسابات والمعاملات بصيغة خفيفة يسهل استرجاعها.
              </p>
              <button 
                onClick={handleDbBackup}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-md"
              >
                <Download className="w-4 h-4" /> تحميل قاعدة البيانات
              </button>
            </div>

            {/* Uploads Backup */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-4">
                <FolderArchive className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-gray-800 mb-2">مجلد المرفقات (Uploads)</h3>
              <p className="text-xs text-gray-500 font-semibold mb-6">
                تحميل ملف مضغوط (ZIP) يحتوي على جميع الصور، ملفات الـ PDF، والمرفقات الخاصة بالعملاء والمعاملات.
              </p>
              <button 
                onClick={handleUploadsBackup}
                className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-md"
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