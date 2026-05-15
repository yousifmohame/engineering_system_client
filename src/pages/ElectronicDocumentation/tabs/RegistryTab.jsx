import React, { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Search,
  Filter,
  Eye,
  ExternalLink,
  Download,
  CheckCircle2,
  Ban,
  Loader2,
  AlertTriangle,
  FileText,
  Trash2
} from "lucide-react";
import { toast } from "sonner";
import api from "../../../api/axios";

export default function RegistryTab() {
  const queryClient = useQueryClient();
  
  // 💡 حالات التحكم في الجدول
  const [selectedItems, setSelectedItems] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterType, setFilterType] = useState("ALL"); // ALL, CONTRACT, INVOICE, QUOTATION, EXTERNAL
  const [filterStatus, setFilterStatus] = useState("ALL"); // ALL, VALID, REVOKED

  // تأخير البحث (Debounce) لعدم إرهاق السيرفر
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchInput), 500);
    return () => clearTimeout(handler);
  }, [searchInput]);

  // 🚀 جلب البيانات من الباك إند
  const { data: documentedItems = [], isLoading, isFetching } = useQuery({
    queryKey: ["registry", debouncedSearch, filterType, filterStatus],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (debouncedSearch) params.append("search", debouncedSearch);
      if (filterType !== "ALL") params.append("type", filterType);
      if (filterStatus !== "ALL") params.append("status", filterStatus);

      const res = await api.get(`/documentation/registry?${params.toString()}`);
      return res.data.data; // نتوقع مصفوفة الوثائق
    },
    keepPreviousData: true
  });

  // 🛑 دالة إبطال الوثيقة (Revoke)
  const handleRevoke = async (id, name) => {
    if (!window.confirm(`هل أنت متأكد من إبطال الوثيقة: ${name}؟ لن يمكن التراجع عن هذا الإجراء.`)) return;

    try {
      await api.put(`/documentation/${id}/revoke`);
      toast.success("تم إبطال الوثيقة بنجاح وإيقاف صلاحية الأختام.");
      // تحديث الجدول فوراً
      queryClient.invalidateQueries(["registry"]);
      queryClient.invalidateQueries(["documentation-dashboard"]); // تحديث الإحصائيات أيضاً
    } catch (error) {
      toast.error("حدث خطأ أثناء محاولة إبطال الوثيقة.");
    }
  };

  // دوال مساعدة للتنسيق
  const getTypeProps = (type) => {
    switch (type) {
      case "CONTRACT": return { label: "عقد", bg: "bg-blue-100 text-blue-700" };
      case "INVOICE": return { label: "فاتورة", bg: "bg-indigo-100 text-indigo-700" };
      case "QUOTATION": return { label: "عرض سعر", bg: "bg-violet-100 text-violet-700" };
      default: return { label: "ملف خارجي", bg: "bg-amber-100 text-amber-700" };
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      
      {/* 🛠️ شريط الإجراءات الجماعية (يظهر عند التحديد) */}
      {selectedItems.length > 0 && (
        <div className="bg-slate-900 px-6 py-3 rounded-2xl text-white flex items-center justify-between animate-in slide-in-from-top-2 shadow-lg">
          <div className="flex items-center gap-4">
            <span className="text-sm font-black text-blue-400">
              {selectedItems.length} مستند محدد
            </span>
            <div className="h-4 w-px bg-slate-700" />
            <button className="text-xs font-bold hover:text-blue-400 transition-colors flex items-center gap-1">
              <Download className="w-3.5 h-3.5" /> تحميل الكل (ZIP)
            </button>
          </div>
          <button
            onClick={() => setSelectedItems([])}
            className="text-xs font-bold text-slate-400 hover:text-white transition-colors"
          >
            إلغاء التحديد
          </button>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        
        {/* 🔍 شريط البحث والفلاتر */}
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="البحث بالاسم، السيريال، أو الطرف الثاني..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pr-10 pl-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all"
            />
            {isFetching && <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-600 animate-spin" />}
          </div>
          
          <div className="flex gap-2">
            <select 
              value={filterType} 
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 outline-none cursor-pointer"
            >
              <option value="ALL">كل الأنواع</option>
              <option value="CONTRACT">عقود</option>
              <option value="INVOICE">فواتير</option>
              <option value="QUOTATION">عروض أسعار</option>
              <option value="EXTERNAL">ملفات خارجية</option>
            </select>
            
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 outline-none cursor-pointer"
            >
              <option value="ALL">كل الحالات</option>
              <option value="VALID">موثق وساري</option>
              <option value="REVOKED">مبطل (Revoked)</option>
            </select>
          </div>
        </div>

        {/* 📋 الجدول */}
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-right whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200">
                <th className="px-6 py-4 w-10">
                  <input
                    type="checkbox"
                    onChange={(e) => setSelectedItems(e.target.checked ? documentedItems.map((i) => i.id) : [])}
                    checked={selectedItems.length === documentedItems.length && documentedItems.length > 0}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600/20 cursor-pointer"
                  />
                </th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-500 uppercase tracking-wider">المستند</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-500 uppercase tracking-wider">النوع</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-500 uppercase tracking-wider">الطرف الثاني</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-500 uppercase tracking-wider">السريال ورمز التحقق</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-500 uppercase tracking-wider">الحالة</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-500 uppercase tracking-wider text-left">الإجراءات</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="p-12 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
                  </td>
                </tr>
              ) : documentedItems.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-12 text-center text-slate-400">
                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p className="font-bold">لا توجد وثائق مطابقة للبحث أو الفلتر.</p>
                  </td>
                </tr>
              ) : (
                documentedItems.map((item) => {
                  const isRevoked = item.status === "REVOKED";
                  const typeProps = getTypeProps(item.type);

                  return (
                    <tr
                      key={item.id}
                      className={`transition-colors group ${
                        selectedItems.includes(item.id) ? "bg-blue-50/50" : "hover:bg-slate-50"
                      } ${isRevoked ? "bg-rose-50/30 opacity-75" : ""}`}
                    >
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item.id)}
                          onChange={() => setSelectedItems((prev) => prev.includes(item.id) ? prev.filter((id) => id !== item.id) : [...prev, item.id])}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600/20 cursor-pointer"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className={`text-sm font-black ${isRevoked ? 'text-slate-500 line-through' : 'text-slate-800'}`}>
                          {item.name}
                        </div>
                        <div className="text-[10px] font-bold text-slate-400 mt-0.5">
                          {new Date(item.createdAt).toLocaleString("ar-SA")}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${typeProps.bg}`}>
                          {typeProps.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-bold text-slate-700">
                        {item.partyB || "غير محدد"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-[11px] font-bold text-slate-500">{item.serialNumber}</span>
                          <code className="px-2 py-0.5 w-max bg-slate-100 rounded text-[11px] font-black text-slate-700 font-mono tracking-widest border border-slate-200">
                            {item.verificationToken}
                          </code>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {isRevoked ? (
                          <div className="flex items-center gap-1.5 text-rose-600 text-[10px] font-black bg-rose-100/50 px-2 py-1 rounded-lg w-max">
                            <Ban className="w-3.5 h-3.5" /> مبطلة
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-emerald-600 text-[10px] font-black bg-emerald-100/50 px-2 py-1 rounded-lg w-max">
                            <CheckCircle2 className="w-3.5 h-3.5" /> موثق ساري
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <a 
                            href={`${api.defaults.baseURL.replace('/api', '')}${item.fileUrl}`} 
                            target="_blank" 
                            rel="noreferrer" 
                            title="عرض المستند"
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                          
                          {/* 🛑 زر الإبطال (يظهر فقط إذا كانت الوثيقة سارية) */}
                          {!isRevoked && (
                            <button 
                              onClick={() => handleRevoke(item.id, item.name)}
                              title="إبطال الوثيقة أمنياً"
                              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                            >
                              <AlertTriangle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}