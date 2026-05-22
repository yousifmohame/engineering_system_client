import React, { useState } from "react";
import { 
  ShieldAlert, 
  X, 
  Paperclip, 
  User, 
  Clock, 
  Trash2, 
  FolderOpen, 
  Download 
} from "lucide-react";
import { useAuth } from "../../../../../context/AuthContext"; // تأكد من صحة المسار حسب مشروعك

export default function SpecialRegTab({ planModal, setPlanModal }) {
  const { user: currentUser } = useAuth();
  

const IconWithText = ({
  icon: Icon,
  text,
  className = "",
  iconClassName = "",
  textClassName = "",
  vertical = false,
}) => {
  return (
    <span
      className={`inline-flex min-w-0 items-center justify-center ${
        vertical ? "flex-col gap-0.5" : "gap-1.5"
      } ${className}`}
    >
      {Icon && <Icon className={iconClassName || "h-3.5 w-3.5 shrink-0"} />}
      {text && (
        <span
          className={
            textClassName ||
            "min-w-0 whitespace-nowrap text-[10px] font-black leading-none"
          }
        >
          {text}
        </span>
      )}
    </span>
  );
};


  // 💡 State محلية خاصة بهذا التاب فقط لإدارة المدخلات الجديدة
  const [newReg, setNewReg] = useState({ text: "", files: [] });
  const [fileInputKey, setFileInputKey] = useState(Date.now());

  // معالجة رفع الملفات الداعمة للتنظيم وتحويلها لـ Base64
  const handleFileInputChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setNewReg((prev) => ({
          ...prev,
          files: [
            ...(prev.files || []),
            {
              id: Date.now() + Math.random(),
              name: file.name,
              url: event.target.result,
              type: file.type,
            },
          ],
        }));
      };
      reader.readAsDataURL(file);
    });

    // تفريغ المدخل لتجنب التعليق عند رفع نفس الملف
    e.target.value = null;
    setFileInputKey(Date.now());
  };

  // دالة إضافة التنظيم إلى المصفوفة الرئيسية للمخطط
  const handleAddRegulation = () => {
    if (!newReg.text.trim() && newReg.files.length === 0) return;
    
    const regulationItem = {
      id: Date.now().toString(),
      text: newReg.text,
      files: newReg.files,
      authorName: currentUser?.name || "مدير النظام",
      createdAt: new Date().toISOString(),
    };

    setPlanModal((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        specialRegulations: [
          regulationItem,
          ...(prev.data.specialRegulations || []),
        ],
      },
    }));

    // تصفير الحقول بعد الإضافة بنجاح
    setNewReg({ text: "", files: [] });
  };

  // دالة حذف تنظيم مسجل مسبقاً
  const handleDeleteRegulation = (regId) => {
    if (window.confirm("هل أنت متأكد من حذف هذا التنظيم السجلي؟")) {
      setPlanModal((prev) => ({
        ...prev,
        data: {
          ...prev.data,
          specialRegulations: (prev.data.specialRegulations || []).filter(
            (r) => r.id !== regId
          ),
        },
      }));
    }
  };

  return (
    <div className="space-y-3 animate-in fade-in h-full flex flex-col overflow-hidden p-3" dir="rtl">
      
      {/* ------------------ Header ------------------ */}
      <div className="flex items-center gap-3 border-b border-[#e8ddc8] pb-4 shrink-0">
        <div className="w-10 h-10 bg-[#eef7f6] text-[#0e7490] rounded-xl flex items-center justify-center shadow-inner">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-black text-[#123f59]">
            التنظيمات الخاصة والاستثناءات
          </h4>
          <p className="text-xs font-bold text-[#94a3b8] mt-0.5">
            سجل هنا أي قرارات أو اشتراطات أو استثناءات تخص هذا المخطط بالتحديد.
          </p>
        </div>
      </div>

      {/* ------------------ إدخال تنظيم جديد ------------------ */}
      <div className="bg-[#fbf8f1] border border-[#e8ddc8] rounded-2xl p-3 shadow-inner shrink-0">
        <textarea
          placeholder="اكتب نص التنظيم، القرار، أو التعليق هنا..."
          value={newReg.text}
          onChange={(e) => setNewReg((prev) => ({ ...prev, text: e.target.value }))}
          className="w-full bg-white border border-[#e8ddc8] rounded-xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-[#0e7490] min-h-[100px] resize-none transition-all shadow-[0_6px_14px_rgba(18,63,89,0.04)]"
        />

        {/* عرض الملفات المرفوعة للتنظيم الجديد قبل الحفظ */}
        {(newReg.files || []).length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {newReg.files.map((f) => (
              <div
                key={f.id}
                className="bg-white border border-[#e8ddc8] px-3 py-1.5 rounded-lg text-xs font-bold text-[#64748b] flex items-center gap-2 shadow-[0_6px_14px_rgba(18,63,89,0.04)]"
              >
                <span className="truncate max-w-[120px]" dir="ltr">
                  {f.name}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setNewReg((p) => ({
                      ...p,
                      files: (p.files || []).filter((file) => file.id !== f.id),
                    }))
                  }
                  className="text-[#94a3b8] hover:text-rose-500 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-between items-center mt-4 pt-4 border-t border-[#e8ddc8]/50">
          <div className="relative">
            <button
              type="button"
              className="flex items-center gap-2 text-xs font-black text-[#15536f] bg-[#d8b46a]/25 hover:bg-[#d8b46a]/35 px-4 py-2 rounded-xl transition-colors pointer-events-none"
            >
              <Paperclip size={16} /> إرفاق ملفات داعمة (قرارات/تعاميم)
            </button>
            <input
              key={fileInputKey}
              type="file"
              multiple
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleFileInputChange}
            />
          </div>
          <button
            type="button"
            onClick={handleAddRegulation}
            disabled={!newReg.text.trim() && (newReg.files || []).length === 0}
            className="px-3 py-2.5 bg-[#0e7490] text-white text-xs font-black rounded-xl hover:bg-[#15536f] disabled:opacity-50 disabled:bg-[#cbd5e1] shadow-[0_8px_18px_rgba(18,63,89,0.05)] transition-all active:scale-95"
          >
            حفظ التنظيم في السجل
          </button>
        </div>
      </div>

      {/* ------------------ عرض التنظيمات السابقة ------------------ */}
      <div className="flex-1 overflow-y-auto custom-scrollbar-slim space-y-2.5 pr-2 custom-scrollbar">
        {(planModal.data.specialRegulations || []).map((reg) => (
          <div
            key={reg.id}
            className="bg-white border border-[#e8ddc8] rounded-2xl p-3 shadow-[0_6px_14px_rgba(18,63,89,0.04)] relative group hover:border-[#d8b46a]/35 transition-colors"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-[#fbf8f1] rounded-full flex items-center justify-center text-[#94a3b8] shadow-inner">
                  <User size={16} />
                </div>
                <div>
                  <div className="text-xs font-black text-[#123f59]">
                    {reg.authorName}
                  </div>
                  <div className="text-[10px] text-[#94a3b8] font-mono font-bold flex items-center gap-1 mt-0.5">
                    <Clock size={10} />{" "}
                    {new Date(reg.createdAt).toLocaleString("ar-SA")}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleDeleteRegulation(reg.id)}
                className="text-[#cbd5e1] hover:text-rose-500 hover:bg-rose-50 rounded-lg p-1.5 opacity-0 group-hover:opacity-100 transition-all"
                title="حذف هذا التنظيم"
              >
                <Trash2 size={16} />
              </button>
            </div>
            
            {reg.text && (
              <p className="text-sm font-bold text-[#475569] leading-loose whitespace-pre-wrap border-r-2 border-[#d8b46a]/40 pr-4">
                {reg.text}
              </p>
            )}

            {reg.files && reg.files.length > 0 && (
              <div className="mt-5 pt-4 border-t border-[#fbf8f1] flex flex-wrap gap-2">
                {reg.files.map((file, i) => (
                  <a
                    key={i}
                    href={file.url}
                    download={file.name}
                    className="flex items-center gap-2 bg-[#fbf8f1] hover:bg-[#eef7f6] border border-[#e8ddc8] hover:border-[#d8b46a]/35 px-3 py-2 rounded-xl transition-colors group/file"
                  >
                    <FolderOpen
                      size={14}
                      className="text-[#94a3b8] group-hover/file:text-[#0e7490]"
                    />
                    <span
                      className="text-[11px] font-black text-[#64748b] truncate max-w-[150px]"
                      dir="ltr"
                    >
                      {file.name}
                    </span>
                    <Download size={14} className="text-[#94a3b8]" />
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
        
        {/* حالة عدم وجود تنظيمات */}
        {(planModal.data.specialRegulations || []).length === 0 && (
          <div className="text-center py-16 text-[#94a3b8] flex flex-col items-center">
            <ShieldAlert className="w-9 h-9 mb-3 opacity-20" />
            <span className="text-xs font-bold">
              لا توجد تنظيمات خاصة مسجلة لهذا المخطط حتى الآن.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}