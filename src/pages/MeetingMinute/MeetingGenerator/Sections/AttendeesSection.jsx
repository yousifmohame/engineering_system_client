import React from "react";
import { Users, Plus, Trash2, UserPlus } from "lucide-react";

export default function AttendeesSection({ minute, updateField, onOpenContacts }) {
  const addAttendee = () => {
    updateField("attendees", [
      ...(minute.attendees || []),
      { id: Date.now().toString(), name: "", entity: "الشركة", role: "", attendanceMethod: "حضوري" },
    ]);
  };

  const updateAttendee = (id, field, value) => {
    updateField("attendees", (minute.attendees || []).map((a) => (a.id === id ? { ...a, [field]: value } : a)));
  };

  const removeAttendee = (id) => {
    updateField("attendees", (minute.attendees || []).filter((a) => a.id !== id));
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-4 rounded-[18px] border border-[#e8ddc8] bg-white px-4 py-3 shadow-sm">
        <h3 className="text-sm font-black text-[#123f59] flex items-center gap-2">
          <Users className="w-4 h-4 text-[#0e7490]" /> قائمة الحضور
        </h3>
        <div className="flex gap-2">
          <button type="button"
            onClick={onOpenContacts}
            className="px-3 py-1.5 bg-white border border-[#e8ddc8] text-[#60738f] text-[10px] font-black rounded-xl hover:bg-[#fbf8f1] shadow-sm flex items-center gap-1"
          >
            <UserPlus className="w-3 h-3" /> جلب من العملاء
          </button>
          <button type="button"
            onClick={addAttendee}
            className="px-3 py-1.5 bg-[#eef7f6] text-[#0e7490] text-[10px] font-black rounded-xl hover:bg-[#eef7f6] flex items-center gap-1"
          >
            <Plus className="w-3 h-3" /> إضافة يدوياً
          </button>
        </div>
      </div>
      <div className="space-y-3">
        {(minute.attendees || []).map((attendee) => (
          <div key={attendee.id} className="p-3 bg-white border border-[#e8ddc8] rounded-xl relative group shadow-sm">
            <button type="button"
              onClick={() => removeAttendee(attendee.id)}
              className="absolute top-2 left-2 inline-flex h-7 items-center gap-1 rounded-xl bg-rose-50 px-2 text-[9px] font-black text-rose-600 opacity-0 transition hover:bg-rose-500 hover:text-white group-hover:opacity-100"
            >
              <Trash2 className="w-3 h-3" /> حذف
            </button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pr-4">
              <div>
                <label className="block text-[9px] font-bold text-[#64748b] mb-1">الاسم</label>
                <input
                  type="text"
                  value={attendee.name}
                  onChange={(e) => updateAttendee(attendee.id, "name", e.target.value)}
                  className="w-full text-xs p-1.5 border border-[#e8ddc8] rounded-xl bg-[#fbf8f1] focus:bg-white outline-none focus:border-[#0e7490]"
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-[#64748b] mb-1">الجهة</label>
                <select
                  value={attendee.entity}
                  onChange={(e) => updateAttendee(attendee.id, "entity", e.target.value)}
                  className="w-full text-xs p-1.5 border border-[#e8ddc8] rounded-xl bg-[#fbf8f1] focus:bg-white outline-none focus:border-[#0e7490]"
                >
                  <option value="الشركة">الشركة</option>
                  <option value="العميل">العميل</option>
                </select>
              </div>
              <div>
                <label className="block text-[9px] font-bold text-[#64748b] mb-1">الصفة</label>
                <input
                  type="text"
                  value={attendee.role}
                  onChange={(e) => updateAttendee(attendee.id, "role", e.target.value)}
                  className="w-full text-xs p-1.5 border border-[#e8ddc8] rounded-xl bg-[#fbf8f1] focus:bg-white outline-none focus:border-[#0e7490]"
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-[#64748b] mb-1">وسيلة الحضور</label>
                <select
                  value={attendee.attendanceMethod}
                  onChange={(e) => updateAttendee(attendee.id, "attendanceMethod", e.target.value)}
                  className="w-full text-xs p-1.5 border border-[#e8ddc8] rounded-xl bg-[#fbf8f1] focus:bg-white outline-none focus:border-[#0e7490]"
                >
                  <option value="حضوري">حضوري</option>
                  <option value="عن بعد">عن بعد</option>
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}