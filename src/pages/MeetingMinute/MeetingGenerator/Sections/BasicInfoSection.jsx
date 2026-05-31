import React from "react";
import { FileText, Users, AlertCircle } from "lucide-react";

export default function BasicInfoSection({ minute, updateField, onOpenContacts }) {
  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
      
      {/* 💡 عنوان القسم */}
      <div className="flex items-center gap-2 rounded-[18px] border border-[#e8ddc8] bg-white px-4 py-3 shadow-sm mb-3">
        <FileText className="text-[#0e7490]" size={20} />
        <h3 className="text-sm font-black text-[#123f59]">البيانات الأساسية للمحضر</h3>
      </div>

      {/* 💡 الصف الأول: رقم المحضر والتاريخ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] font-bold text-[#64748b] mb-1">رقم المحضر</label>
          <input 
            className="w-full text-xs p-2 border border-[#e8ddc8] rounded-xl text-[#64748b] bg-[#fbf8f1] cursor-not-allowed outline-none" 
            readOnly 
            type="text" 
            value={minute.referenceNumber || ""} 
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-[#64748b] mb-1">
            تاريخ الاجتماع <span className="text-rose-500">*</span>
          </label>
          <input 
            className={`w-full text-xs p-2 border rounded-xl transition-all focus:ring-2 focus:ring-[#0e7490]/20 outline-none ${!minute.meetingDate ? 'border-amber-300 bg-amber-50/10' : 'border-[#e8ddc8]'}`} 
            type="date" 
            value={minute.meetingDate || ""} 
            onChange={(e) => updateField('meetingDate', e.target.value)} 
          />
        </div>
      </div>

      {/* 💡 الصف الثاني: عنوان الاجتماع */}
      <div>
        <label className="block text-[10px] font-bold text-[#64748b] mb-1">
          عنوان الاجتماع <span className="text-rose-500">*</span>
        </label>
        <input 
          className={`w-full text-sm font-bold p-2 border rounded-xl transition-all focus:ring-2 focus:ring-[#0e7490]/20 outline-none ${!minute.title ? 'border-amber-300 bg-amber-50/10' : 'border-[#e8ddc8]'}`} 
          placeholder="مثال: محضر اجتماع انطلاق المشروع" 
          type="text" 
          value={minute.title || ""} 
          onChange={(e) => updateField('title', e.target.value)} 
        />
        {!minute.title && (
          <p className="text-[9px] text-amber-600 mt-1 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> يفضل إدخال عنوان واضح لسهولة البحث.
          </p>
        )}
      </div>

      {/* 💡 الصف الثالث: نوع وصفة الاجتماع */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-[#e8ddc8]/70 pt-4 mt-2">
        <div>
          <label className="block text-[10px] font-bold text-[#64748b] mb-1">نوع الاجتماع</label>
          <select 
            className="w-full text-xs p-2 border border-[#e8ddc8] rounded-xl focus:ring-2 focus:ring-[#0e7490]/20 outline-none"
            value={minute.meetingType || "إداري"}
            onChange={(e) => updateField('meetingType', e.target.value)}
          >
            <option value="فني">فني</option>
            <option value="إداري">إداري</option>
            <option value="تعاقدي">تعاقدي</option>
            <option value="طارئ">طارئ</option>
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-bold text-[#64748b] mb-1">صفة الاجتماع</label>
          <select 
            className="w-full text-xs p-2 border border-[#e8ddc8] rounded-xl focus:ring-2 focus:ring-[#0e7490]/20 outline-none"
            value={minute.meetingCapacity || "استعراض"}
            onChange={(e) => updateField('meetingCapacity', e.target.value)}
          >
            <option value="استعراض">استعراض</option>
            <option value="تشاور">تشاور</option>
            <option value="اتخاذ قرار">اتخاذ قرار</option>
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-bold text-[#64748b] mb-1">التسلسل</label>
          <div className="flex bg-[#fbf8f1] rounded-xl p-0.5 border border-[#e8ddc8]">
            <button 
              type="button"
              onClick={() => updateField('isFollowUp', false)}
              className={`flex-1 text-[10px] py-1.5 font-bold rounded-xl transition-all ${!minute.isFollowUp ? 'bg-white shadow-sm text-[#0e7490] border border-[#e8ddc8]/50' : 'text-[#64748b] hover:text-[#334155]'}`}
            >
              أولي
            </button>
            <button 
              type="button"
              onClick={() => updateField('isFollowUp', true)}
              className={`flex-1 text-[10px] py-1.5 font-bold rounded-xl transition-all ${minute.isFollowUp ? 'bg-white shadow-sm text-[#0e7490] border border-[#e8ddc8]/50' : 'text-[#64748b] hover:text-[#334155]'}`}
            >
              متابعة
            </button>
          </div>
        </div>
      </div>

      {/* 💡 الصف الرابع: أوقات الاجتماع */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] font-bold text-[#64748b] mb-1">وقت البداية</label>
          <input 
            className="w-full text-xs p-2 border border-[#e8ddc8] rounded-xl focus:ring-2 focus:ring-[#0e7490]/20 outline-none" 
            type="time" 
            value={minute.startTime || ""} 
            onChange={(e) => updateField('startTime', e.target.value)} 
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-[#64748b] mb-1">وقت النهاية</label>
          <input 
            className="w-full text-xs p-2 border border-[#e8ddc8] rounded-xl focus:ring-2 focus:ring-[#0e7490]/20 outline-none" 
            type="time" 
            value={minute.endTime || ""} 
            onChange={(e) => updateField('endTime', e.target.value)} 
          />
        </div>
      </div>

      {/* 💡 الصف الخامس: العميل والجهة */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-[#e8ddc8]/70 pt-4 mt-2">
        <div>
          <label className="block text-[10px] font-bold text-[#64748b] mb-1">
            العميل / المعني <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input 
              className={`w-full text-xs p-2 pr-20 border rounded-xl transition-all focus:ring-2 focus:ring-[#0e7490]/20 outline-none ${!minute.clientName ? 'border-amber-300 bg-amber-50/10' : 'border-[#e8ddc8] bg-white'}`} 
              type="text" 
              placeholder="اكتب اسم العميل..."
              value={minute.clientName || ""} 
              onChange={(e) => updateField('clientName', e.target.value)} 
            />
            {/* زر جلب العميل من قاعدة البيانات */}
            <button 
              type="button" 
              onClick={onOpenContacts} 
              title="جلب عميل مسجل"
              className="absolute right-1.5 top-1/2 inline-flex h-7 -translate-y-1/2 items-center gap-1 rounded-xl border border-[#e8ddc8] bg-[#fbf8f1] px-2 text-[9px] font-black text-[#0e7490] shadow-sm transition hover:bg-[#eef7f6]"
            >
              <Users size={12} /> جلب
            </button>
          </div>
        </div>
        <div>
          <label className="block text-[10px] font-bold text-[#64748b] mb-1">الجهة الطالبة</label>
          <input 
            className="w-full text-xs p-2 border border-[#e8ddc8] rounded-xl focus:ring-2 focus:ring-[#0e7490]/20 outline-none" 
            type="text" 
            value={minute.requester || ""} 
            onChange={(e) => updateField('requester', e.target.value)} 
          />
        </div>
      </div>

      {/* 💡 الصف السادس: القناة والمكان */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] font-bold text-[#64748b] mb-1">قناة الاجتماع</label>
          <select 
            className="w-full text-xs p-2 border border-[#e8ddc8] rounded-xl focus:ring-2 focus:ring-[#0e7490]/20 outline-none"
            value={minute.channel || "اجتماع حضوري"}
            onChange={(e) => updateField('channel', e.target.value)}
          >
            <option value="اجتماع حضوري">حضوري</option>
            <option value="اجتماع عن بعد">عن بعد (Zoom/Teams)</option>
            <option value="اتصال هاتفي">مكالمة هاتفية</option>
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-bold text-[#64748b] mb-1">
            المكان <span className="text-rose-500">*</span>
          </label>
          <input 
            list="locationsList" 
            className={`w-full text-xs p-2 border rounded-xl transition-all focus:ring-2 focus:ring-[#0e7490]/20 outline-none ${!minute.location ? 'border-amber-300 bg-amber-50/10' : 'border-[#e8ddc8]'}`} 
            placeholder="مقر الشركة..." 
            type="text" 
            value={minute.location || ""} 
            onChange={(e) => updateField('location', e.target.value)} 
          />
          <datalist id="locationsList">
            <option value="المقر الرئيسي للشركة" />
            <option value="موقع المشروع" />
            <option value="مقر العميل" />
          </datalist>
        </div>
      </div>
      
    </div>
  );
}