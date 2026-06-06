import React from "react";
import { AlertCircle } from "lucide-react";
import LinkRow from "./LinkRow";

export default function LinksTable({ groupedLinks, sortBy, onOpenLink, onPinToggle, onMovePinned, onEdit, onDelete }) {
  if (Object.keys(groupedLinks).length === 0) {
    return (
      <div className="p-12 text-center">
        <div className="mx-auto mb-3 grid h-16 w-16 place-items-center rounded-3xl border border-[#d8b46a]/35 bg-[#f8efe0] text-[#c5983c]">
          <AlertCircle className="h-8 w-8" />
        </div>
        <p className="text-sm font-black text-[#123f59]">لا توجد روابط مطابقة.</p>
      </div>
    );
  }

  return (
    <>
      {Object.entries(groupedLinks).map(([categoryName, catLinks], catIdx) => (
        <div key={categoryName} className={catIdx !== 0 ? "border-t-4 border-[#f8efe0]" : ""}>
          <div className="flex items-center justify-between gap-3 border-b border-[#e8ddc8] bg-gradient-to-l from-[#f8efe0] via-white to-[#eef7f6] px-4 py-2">
            <div className="flex items-center gap-2">
              <span className="h-6 w-1.5 rounded-full bg-[#c5983c]" />
              <div>
                <div className="text-xs font-black text-[#123f59]">{categoryName}</div>
                <div className="text-[9px] font-bold text-[#64748b]">{catLinks.length} رابط داخل هذا التصنيف</div>
              </div>
            </div>
            <span className="rounded-2xl border border-[#c5983c]/25 bg-white px-3 py-1 text-[10px] font-black text-[#123f59]">
              Quick Links
            </span>
          </div>

          <div className="overflow-x-auto custom-scrollbar-slim">
            <table className="w-full min-w-[1100px] text-right text-[11px]">
              <thead className="bg-[#0f3448] text-[10px] font-black text-white">
                <tr>
                  <th className="border-l border-white/10 px-3 py-3">الرابط</th>
                  <th className="border-l border-white/10 px-3 py-3">الأهمية</th>
                  <th className="border-l border-white/10 px-3 py-3">مستوى الوصول</th>
                  <th className="border-l border-white/10 px-3 py-3">بيانات الدخول</th>
                  <th className="border-l border-white/10 px-3 py-3">الصلاحية</th>
                  <th className="border-l border-white/10 px-3 py-3">الإنشاء</th>
                  <th className="border-l border-white/10 px-3 py-3">آخر تعديل</th>
                  <th className="border-l border-white/10 px-3 py-3 text-center">استخدام</th>
                  <th className="w-[240px] px-3 py-3 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e8ddc8]/70">
                {catLinks.map((link, index) => (
                  <LinkRow 
                    key={link.id} link={link} index={index} catLinks={catLinks} sortBy={sortBy}
                    onOpenLink={onOpenLink} onPinToggle={onPinToggle}
                    onMovePinned={onMovePinned} onEdit={onEdit} onDelete={onDelete}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </>
  );
}