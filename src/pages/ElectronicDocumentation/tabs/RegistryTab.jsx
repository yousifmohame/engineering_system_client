import React from "react";
import {
  Search,
  Filter,
  Eye,
  ExternalLink,
  Download,
  CheckCircle2,
} from "lucide-react";

export const RegistryTab = ({
  selectedItems,
  setSelectedItems,
  searchQuery,
  setSearchQuery,
  documentedItems,
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {selectedItems.length > 0 && (
        <div className="bg-slate-900 px-6 py-3 rounded-2xl text-white flex items-center justify-between animate-in slide-in-from-top-2">
          <div className="flex items-center gap-4">
            <span className="text-xs font-black">
              {selectedItems.length} مستند محدد
            </span>
            <div className="h-4 w-px bg-slate-700" />
            <button className="text-[10px] font-black hover:text-blue-400 transition-colors">
              تحميل الكل (ZIP)
            </button>
            <button className="text-[10px] font-black hover:text-blue-400 transition-colors">
              إعادة توثيق جماعي
            </button>
          </div>
          <button
            onClick={() => setSelectedItems([])}
            className="text-[10px] font-black text-slate-400 hover:text-white transition-colors"
          >
            إلغاء التحديد
          </button>
        </div>
      )}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="البحث في سجل التوثيق..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-10 pl-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-600/20 outline-none transition-all"
            />
          </div>
          <div className="flex gap-2">
            <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 w-10">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked)
                        setSelectedItems(documentedItems.map((i) => i.id));
                      else setSelectedItems([]);
                    }}
                    checked={
                      selectedItems.length === documentedItems.length &&
                      documentedItems.length > 0
                    }
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600/20"
                  />
                </th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">
                  المستند
                </th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">
                  النوع
                </th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">
                  التحقق
                </th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">
                  الطرف الثاني
                </th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">
                  تاريخ التوثيق
                </th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">
                  السريال الرقمي
                </th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">
                  الحالة
                </th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {documentedItems.map((item) => (
                <tr
                  key={item.id}
                  className={`hover:bg-slate-50 transition-colors group ${selectedItems.includes(item.id) ? "bg-blue-50" : ""}`}
                >
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.id)}
                      onChange={() => {
                        setSelectedItems((prev) =>
                          prev.includes(item.id)
                            ? prev.filter((id) => id !== item.id)
                            : [...prev, item.id],
                        );
                      }}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600/20"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-black text-slate-800">
                      {item.name}
                    </div>
                    <div className="text-[10px] font-bold text-slate-400 mt-0.5">
                      {item.id}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                        item.type === "CONTRACT"
                          ? "bg-blue-100 text-blue-700"
                          : item.type === "INVOICE"
                            ? "bg-indigo-100 text-indigo-700"
                            : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {item.type === "CONTRACT"
                        ? "عقد"
                        : item.type === "INVOICE"
                          ? "فاتورة"
                          : "ملف خارجي"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Eye className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-xs font-black text-slate-700">
                        {Math.floor(Math.random() * 50) + 12}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">
                        تحقق
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-700">
                    {item.partyB}
                  </td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-600">
                    {/* دعم createdAt الخاص بـ Prisma */}
                    {new Date(item.createdAt || item.timestamp).toLocaleDateString("ar-SA")}
                  </td>
                  <td className="px-6 py-4">
                    <code className="px-2 py-1 bg-slate-100 rounded text-[10px] font-black text-slate-700 font-mono">
                      {item.serialNumber || item.serial}
                    </code>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-emerald-600 text-[10px] font-black">
                      <CheckCircle2 className="w-3.5 h-3.5" /> موثق
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {/* فتح الملف من السيرفر */}
                      <a href={item.fileUrl} target="_blank" rel="noreferrer" className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <a href={item.fileUrl} download className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
                        <Download className="w-4 h-4" />
                      </a>
                    </div>
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