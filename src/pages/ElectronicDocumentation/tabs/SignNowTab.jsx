import React, { useState } from "react";
import { FileSignature, Zap } from "lucide-react";
import { toast } from "sonner";

export const SignNowTab = ({ setActiveTab }) => {
  const [selectedItems, setSelectedItems] = useState([]);

  // يمكن لاحقاً ربط هذا بـ API يجلب المستندات المعلقة `PENDING_SIGNATURE`
  const pendingDocs = [
    {
      id: "mock-pen-1",
      type: "عقد مهني",
      name: "عقد تصميم فيلا السالم",
      client: "عبدالله السالم",
      date: "2026-04-18",
      ref: "CNT-2026-1049",
    },
    {
      id: "mock-pen-2",
      type: "عرض سعر",
      name: "تعديلات رخصة البناء",
      client: "مؤسسة البناء الحديث",
      date: "2026-04-17",
      ref: "QUT-2026-0881",
    },
    {
      id: "mock-pen-3",
      type: "فاتورة ضريبية",
      name: "دفعة أولى - مخططات تصميم",
      client: "شركة الأفق المحدودة",
      date: "2026-04-16",
      ref: "INV-2026-041",
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
              <FileSignature className="w-5 h-5 text-blue-600" /> أوامر التوقيع
              المعلقة (Bulk Sign)
            </h3>
            <p className="text-xs font-bold text-slate-500 mt-1">
              تحديد مجموعة مستندات لتطبيق توقيعك المعتمد دفعة واحدة.
            </p>
          </div>
          <button
            onClick={() => {
              if (selectedItems.length === 0)
                return toast.error("يرجى تحديد مستند واحد على الأقل للبدء");
              toast.success(
                `تم إرسال طلب التوقيع الجماعي لـ ${selectedItems.length} مستند وتطبيق الختم بنجاح.`,
              );
              setSelectedItems([]);
              setActiveTab("dashboard");
            }}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-black shadow-lg shadow-blue-600/20 hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
          >
            <Zap className="w-4 h-4" /> توقيع المحددة ({selectedItems.length})
          </button>
        </div>

        <div className="p-0 overflow-x-auto">
          <table className="w-full text-right text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500 text-xs shadow-sm border-b border-slate-200">
              <tr>
                <th className="p-4 w-12 text-center">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedItems(pendingDocs.map(doc => doc.id));
                      } else {
                        setSelectedItems([]);
                      }
                    }}
                    checked={selectedItems.length === pendingDocs.length && pendingDocs.length > 0}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600/20"
                  />
                </th>
                <th className="p-4 font-black">رقم المرجع (ID)</th>
                <th className="p-4 font-black">اسم المستند</th>
                <th className="p-4 font-black">الطرف الآخر (العميل)</th>
                <th className="p-4 font-black">تاريخ الإنشاء</th>
                <th className="p-4 font-black">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-bold text-slate-700">
              {pendingDocs.map((item) => (
                <tr
                  key={item.id}
                  className={`hover:bg-slate-50 transition-colors ${selectedItems.includes(item.id) ? 'bg-blue-50' : ''}`}
                >
                  <td className="p-4 text-center">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedItems([...selectedItems, item.id]);
                        } else {
                          setSelectedItems(
                            selectedItems.filter((i) => i !== item.id),
                          );
                        }
                      }}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600/20"
                    />
                  </td>
                  <td className="p-4">
                    <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs tracking-wider">
                      {item.ref}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                        <FileSignature className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-black text-slate-900">
                          {item.name}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {item.type}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">{item.client}</td>
                  <td className="p-4">{item.date}</td>
                  <td className="p-4">
                    <button className="px-3 py-1.5 border border-slate-200 text-slate-500 rounded-lg text-xs hover:bg-slate-50 hover:text-blue-600 transition-all">
                      مراجعة المستند
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};