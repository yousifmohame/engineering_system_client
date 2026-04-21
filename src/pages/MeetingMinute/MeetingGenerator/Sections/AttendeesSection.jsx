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
      <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-2">
        <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
          <Users className="w-4 h-4 text-indigo-600" /> قائمة الحضور
        </h3>
        <div className="flex gap-2">
          <button
            onClick={onOpenContacts}
            className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 text-[10px] font-black rounded-lg hover:bg-slate-50 shadow-sm flex items-center gap-1"
          >
            <UserPlus className="w-3 h-3" /> جلب من العملاء
          </button>
          <button
            onClick={addAttendee}
            className="px-3 py-1.5 bg-blue-50 text-blue-700 text-[10px] font-black rounded-lg hover:bg-blue-100 flex items-center gap-1"
          >
            <Plus className="w-3 h-3" /> إضافة يدوياً
          </button>
        </div>
      </div>
      <div className="space-y-3">
        {(minute.attendees || []).map((attendee) => (
          <div key={attendee.id} className="p-3 bg-white border border-slate-200 rounded-xl relative group shadow-sm">
            <button
              onClick={() => removeAttendee(attendee.id)}
              className="absolute top-2 left-2 p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pr-4">
              <div>
                <label className="block text-[9px] font-bold text-slate-500 mb-1">الاسم</label>
                <input
                  type="text"
                  value={attendee.name}
                  onChange={(e) => updateAttendee(attendee.id, "name", e.target.value)}
                  className="w-full text-xs p-1.5 border border-slate-200 rounded-md bg-slate-50 focus:bg-white outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-slate-500 mb-1">الجهة</label>
                <select
                  value={attendee.entity}
                  onChange={(e) => updateAttendee(attendee.id, "entity", e.target.value)}
                  className="w-full text-xs p-1.5 border border-slate-200 rounded-md bg-slate-50 focus:bg-white outline-none focus:border-indigo-500"
                >
                  <option value="الشركة">الشركة</option>
                  <option value="العميل">العميل</option>
                </select>
              </div>
              <div>
                <label className="block text-[9px] font-bold text-slate-500 mb-1">الصفة</label>
                <input
                  type="text"
                  value={attendee.role}
                  onChange={(e) => updateAttendee(attendee.id, "role", e.target.value)}
                  className="w-full text-xs p-1.5 border border-slate-200 rounded-md bg-slate-50 focus:bg-white outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-slate-500 mb-1">وسيلة الحضور</label>
                <select
                  value={attendee.attendanceMethod}
                  onChange={(e) => updateAttendee(attendee.id, "attendanceMethod", e.target.value)}
                  className="w-full text-xs p-1.5 border border-slate-200 rounded-md bg-slate-50 focus:bg-white outline-none focus:border-indigo-500"
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