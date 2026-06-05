import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAllClients } from "../../../api/clientApi"; // استخراج المرفقات من العملاء مؤقتاً
import { FileCheck, ExternalLink, Zap, Search, Loader2 } from "lucide-react";

const ClientsDocsPanel = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ["clients_docs"],
    queryFn: () => getAllClients({ includeAttachments: "true" }), // 👈 هنا نرسل الطلب
  });

  // استخراج كل المرفقات من كل العملاء في مصفوفة واحدة مسطحة (Flat Array)
  const allDocs = useMemo(() => {
    let docs = [];
    clients.forEach((client) => {
      if (client.attachments && client.attachments.length > 0) {
        client.attachments.forEach((att) => {
          docs.push({
            ...att,
            clientName: client.name?.ar || client.name?.firstName || "غير محدد",
            clientCode: client.clientCode,
          });
        });
      }
    });
    return docs;
  }, [clients]);

  // الفلترة
  const filteredDocs = useMemo(() => {
    if (!searchTerm) return allDocs;
    return allDocs.filter(
      (doc) =>
        doc.fileName?.includes(searchTerm) ||
        doc.clientCode?.includes(searchTerm) ||
        doc.clientName?.includes(searchTerm),
    );
  }, [allDocs, searchTerm]);

  // الإحصائيات
  const stats = useMemo(() => {
    return {
      total: allDocs.length,
      active: allDocs.length, // كمثال: نفترض أن كلها سارية حالياً
      expiring: 0,
      expired: 0,
    };
  }, [allDocs]);

  if (isLoading)
    return (
      <div className="p-10 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
      </div>
    );

  return (
    <div className="animate-in fade-in zoom-in-95 duration-300">
      {/* Header */}
      <div className="flex justify-between items-center mb-5">
        <div className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <FileCheck className="w-5 h-5 text-violet-500" /> وثائق العملاء
          المركزية
        </div>
        <button className="flex items-center gap-1 px-3 py-1.5 bg-violet-50 text-violet-600 rounded-lg text-xs font-bold hover:bg-violet-100 transition-colors border border-violet-200">
          <ExternalLink className="w-3 h-3" /> إدارة الأنواع (942)
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm text-center">
          <div className="text-3xl font-bold text-blue-500">{stats.total}</div>
          <div className="text-xs text-slate-500 mt-1">إجمالي الوثائق</div>
        </div>
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm text-center">
          <div className="text-3xl font-bold text-emerald-500">
            {stats.active}
          </div>
          <div className="text-xs text-slate-500 mt-1">سارية</div>
        </div>
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm text-center">
          <div className="text-3xl font-bold text-amber-500">
            {stats.expiring}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            تنتهي قريباً (30 يوم)
          </div>
        </div>
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm text-center">
          <div className="text-3xl font-bold text-red-500">{stats.expired}</div>
          <div className="text-xs text-slate-500 mt-1">منتهية</div>
        </div>
      </div>

      {/* Search & AI Bar */}
      <div className="mb-4 relative">
        <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="بحث بالوثيقة أو كود العميل..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2.5 pr-9 border border-slate-300 rounded-xl text-sm outline-none focus:border-violet-500"
        />
      </div>

      <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl mb-4 flex items-center gap-3">
        <Zap className="w-6 h-6 text-violet-600" />
        <div>
          <div className="text-sm font-bold text-violet-800">
            استخراج ذكي (OCR / GPT)
          </div>
          <div className="text-xs text-violet-600 mt-0.5">
            ارفع وثيقة وسيتم استخراج البيانات وربطها بالعميل تلقائياً — قريباً
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead className="bg-slate-50">
              <tr>
                <th className="p-3 text-xs text-slate-500 font-bold border-b-2 border-slate-200">
                  الوثيقة
                </th>
                <th className="p-3 text-xs text-slate-500 font-bold border-b-2 border-slate-200">
                  العميل
                </th>
                <th className="p-3 text-xs text-slate-500 font-bold border-b-2 border-slate-200">
                  النوع
                </th>
                <th className="p-3 text-xs text-slate-500 font-bold border-b-2 border-slate-200">
                  تاريخ الرفع
                </th>
                <th className="p-3 text-xs text-slate-500 font-bold border-b-2 border-slate-200">
                  الحالة
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-500">
                    لا توجد وثائق مطابقة
                  </td>
                </tr>
              ) : (
                filteredDocs.map((doc) => (
                  <tr
                    key={doc.id}
                    className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <FileCheck className="w-4 h-4 text-blue-500" />
                        <span className="font-bold text-sm text-slate-700">
                          {doc.fileName}
                        </span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="font-bold text-xs text-slate-800">
                        {doc.clientName}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {doc.clientCode}
                      </div>
                    </td>
                    <td className="p-3 text-xs text-slate-600">
                      {doc.fileType || "عام"}
                    </td>
                    <td className="p-3 text-xs text-slate-600">
                      {new Date(doc.createdAt).toLocaleDateString("ar-SA")}
                    </td>
                    <td className="p-3">
                      <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded-lg text-[10px] font-bold">
                        سارية
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ClientsDocsPanel;
