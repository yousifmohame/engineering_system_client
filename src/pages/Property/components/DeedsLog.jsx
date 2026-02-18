import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getDeeds } from "../../../api/propertyApi";
import {
  Search,
  Plus,
  CheckCircle,
  AlertTriangle,
  Maximize2,
  Loader2,
  FileText,
} from "lucide-react";
import { format } from "date-fns";
import AddDeedModal from "./AddDeedModal";
import DeedDetailsModal from "./DeedDetailsModal";

// ✅ دالة معالجة الاسم الآمنة (لمنع خطأ React Object)
const getSafeClientName = (client) => {
  if (!client) return "غير محدد";
  const name = client.name;
  if (!name) return "غير محدد";
  if (typeof name === "string") return name;
  if (name.ar) return name.ar;
  if (typeof name === "object") {
    const { firstName, fatherName, grandFatherName, familyName } = name;
    const fullName = [firstName, fatherName, grandFatherName, familyName]
      .filter(Boolean)
      .join(" ");
    return fullName || "اسم غير معروف";
  }
  return "صيغة غير معروفة";
};

const DeedsLog = ({ onSelectDeed, onAddNewDeed }) => {
  const [search, setSearch] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedDeedId, setSelectedDeedId] = useState(null);

  // جلب البيانات الحقيقية من السيرفر
  const { data, isLoading } = useQuery({
    queryKey: ["deeds", search],
    queryFn: () => getDeeds({ search }),
  });

  const deeds = data?.data || [];
  const totalCount = data?.pagination?.total || deeds.length;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden animate-in fade-in duration-500 bg-slate-50">
      {/* 1. Header (مطابق للتصميم المطلوب) */}
      <div className="flex items-start justify-between gap-3 p-3 bg-gradient-to-l from-blue-50 to-purple-50 border-b-2 border-blue-300 mb-3 shrink-0">
        <div className="flex items-start gap-2">
          <div className="inline-flex items-center justify-center min-w-[48px] h-8 bg-blue-700 text-white text-sm font-bold rounded px-2 border-2 border-blue-800 shadow-sm">
            310
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-blue-900">
                سجل ملفات الملكية
              </h1>
            </div>
            <p className="text-xs text-stone-600 mt-0.5">
              قاعدة بيانات الوثائق والمخططات
            </p>
          </div>
        </div>

        {/* الإحصائيات المصغرة */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 pr-3 border-r-2 border-blue-300">
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-700 text-slate-100 border border-white/10 shadow-sm">
              <span className="text-[10px] opacity-80">إجمالي الصكوك:</span>
              <span className="text-[10px] font-bold">{totalCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. شريط البحث والإجراءات */}
      <div className="px-3 space-y-2 shrink-0">
        <div className="bg-white border border-stone-300 rounded-lg p-2 flex items-center gap-2 shadow-sm">
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder="بحث برقم الصك، الحي، رقم المخطط، اسم المالك..."
              className="w-full pl-3 pr-10 py-1.5 text-xs border border-stone-300 rounded focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-all bg-stone-50 focus:bg-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)} // 👈 تفعيل النافذة
            className="px-4 py-1.5 text-xs font-bold bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            تسجيل صك جديد
          </button>
        </div>
      </div>

      {/* 3. الجدول الاحترافي */}
      <div className="flex-1 p-3 overflow-hidden flex flex-col">
        <div className="bg-white border border-stone-300 rounded-lg overflow-hidden flex-1 flex flex-col shadow-sm">
          <div className="flex-1 overflow-auto custom-scrollbar">
            <table className="w-full text-[10px] text-right">
              <thead className="bg-stone-200 sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="px-3 py-2 font-bold text-stone-700">
                    كود النظام
                  </th>
                  <th className="px-3 py-2 font-bold text-stone-700">
                    المالك / العميل
                  </th>
                  <th className="px-3 py-2 font-bold text-stone-700">
                    رقم الصك
                  </th>
                  <th className="px-3 py-2 font-bold text-stone-700">
                    تاريخ الصك
                  </th>
                  <th className="px-3 py-2 font-bold text-stone-700">الحي</th>
                  <th className="px-3 py-2 font-bold text-stone-700 text-center">
                    رقم المخطط
                  </th>
                  <th className="px-3 py-2 font-bold text-stone-700 text-center">
                    رقم القطعة
                  </th>
                  <th className="px-3 py-2 font-bold text-stone-700 text-center">
                    المساحة
                  </th>
                  <th className="px-3 py-2 font-bold text-stone-700 text-center">
                    الحالة
                  </th>
                  <th className="px-3 py-2 font-bold text-stone-700 text-center">
                    إجراء
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {isLoading ? (
                  <tr>
                    <td
                      colSpan="10"
                      className="px-4 py-10 text-center text-stone-400"
                    >
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
                      جاري تحميل البيانات...
                    </td>
                  </tr>
                ) : deeds.length === 0 ? (
                  <tr>
                    <td
                      colSpan="10"
                      className="px-4 py-10 text-center text-stone-400"
                    >
                      <FileText className="w-8 h-8 mx-auto mb-2 opacity-20" />
                      لا توجد صكوك مطابقة للبحث
                    </td>
                  </tr>
                ) : (
                  deeds.map((deed) => (
                    <tr
                      key={deed.id}
                      onDoubleClick={() => onSelectDeed(deed.id)}
                      className="hover:bg-blue-50/60 cursor-pointer transition-colors"
                    >
                      {/* كود النظام */}
                      <td className="px-3 py-2 font-mono font-bold text-green-700">
                        {deed.code || "OWN-..."}
                      </td>

                      {/* المالك */}
                      <td className="px-3 py-2 font-bold text-stone-800">
                        {getSafeClientName(deed.client)}
                      </td>

                      {/* رقم الصك */}
                      <td className="px-3 py-2 font-mono text-[11px] font-bold text-blue-800">
                        {deed.deedNumber || "بدون رقم"}
                      </td>

                      {/* تاريخ الصك */}
                      <td className="px-3 py-2 text-stone-500 font-mono">
                        {deed.deedDate
                          ? format(new Date(deed.deedDate), "yyyy/MM/dd")
                          : "-"}
                      </td>

                      {/* الحي */}
                      <td className="px-3 py-2 text-stone-700">
                        {deed.district || "-"}
                      </td>

                      {/* رقم المخطط */}
                      <td className="px-3 py-2 text-center">
                        <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-900 font-bold">
                          {deed.planNumber || "-"}
                        </span>
                      </td>

                      {/* رقم القطعة */}
                      <td className="px-3 py-2 text-center">
                        <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-900 font-bold">
                          {deed.plotNumber || "-"}
                        </span>
                      </td>

                      {/* المساحة */}
                      <td className="px-3 py-2 text-center font-bold text-stone-700">
                        {deed.area ? `${deed.area} م²` : "-"}
                      </td>

                      {/* الحالة */}
                      <td className="px-3 py-2 text-center">
                        {deed.status === "Active" ? (
                          <span className="px-2 py-0.5 rounded bg-green-600 text-white text-[9px] font-bold flex items-center gap-1 w-fit mx-auto shadow-sm">
                            <CheckCircle className="w-3 h-3" /> معتمد
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-amber-500 text-white text-[9px] font-bold flex items-center gap-1 w-fit mx-auto shadow-sm">
                            <AlertTriangle className="w-3 h-3" /> مؤقت
                          </span>
                        )}
                      </td>

                      {/* إجراء */}
                      <td className="px-3 py-2 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDeedId(deed.id); // 👈 عند الضغط، نمرر الـ ID ليفتح المودال
                          }}
                          className="px-2 py-1 bg-blue-600 text-white rounded text-[9px] font-bold hover:bg-blue-700 flex items-center gap-1 mx-auto transition-transform hover:scale-105 shadow-sm"
                        >
                          <Maximize2 className="w-3 h-3" /> فتح
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {/* استدعاء المودال */}
      <AddDeedModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
      {/* 👈 استدعاء النافذة التفصيلية */}
      <DeedDetailsModal
        isOpen={!!selectedDeedId}
        deedId={selectedDeedId}
        onClose={() => setSelectedDeedId(null)}
      />
    </div>
  );
};

export default DeedsLog;
