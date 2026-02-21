import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAllClients } from "../../api/clientApi"; // 👈 تأكد من المسار
import {
  Search,
  RefreshCw,
  Copy,
  Eye,
  Plus,
  Upload,
  FileText,
  Phone,
  Mail,
  MapPin,
  Award,
  TrendingUp,
  X,
  Ban,
  PhoneCall,
  MessageCircle,
  Landmark,
  Receipt,
  History,
  BarChart3,
  Loader2,
  Users
} from "lucide-react";
import { toast } from "sonner";

// دالة مساعدة لاسم العميل
const getFullName = (nameObj) => {
  if (!nameObj) return "غير محدد";
  if (typeof nameObj === "string") return nameObj;
  if (nameObj.ar) return nameObj.ar;
  const parts = [nameObj.firstName, nameObj.fatherName, nameObj.grandFatherName, nameObj.familyName];
  return parts.filter(Boolean).join(" ").trim() || nameObj.en || "غير محدد";
};

const ClientsLog = ({ onOpenDetails }) => {
  // ==========================================
  // 1. States (الحالات)
  // ==========================================
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    type: "all",
    city: "all",
    rating: "all",
    status: "all",
  });
  const [selectedClient, setSelectedClient] = useState(null); // للوحة الجانبية
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  // ==========================================
  // 2. Fetch Data (جلب البيانات من الباك إند)
  // ==========================================
  const { data: clients = [], isLoading, refetch, isFetching } = useQuery({
    queryKey: ["clients", searchTerm],
    queryFn: () => getAllClients({ search: searchTerm }), // نرسل البحث للباك إند
  });

  // ==========================================
  // 3. Local Filtering & Stats (الفلترة المتقدمة والإحصائيات)
  // ==========================================
  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      const matchType = filters.type === "all" || client.type?.includes(filters.type);
      const matchCity = filters.city === "all" || client.address?.city?.includes(filters.city);
      const matchRating = filters.rating === "all" || client.grade === filters.rating;
      const matchStatus = filters.status === "all" || (filters.status === "active" ? client.isActive : !client.isActive);
      return matchType && matchCity && matchRating && matchStatus;
    });
  }, [clients, filters]);

  // حساب الإحصائيات العلوية ديناميكياً
  const stats = useMemo(() => {
    return {
      total: clients.length,
      active: clients.filter((c) => c.isActive).length,
      companies: clients.filter((c) => c.type === "شركة" || c.type === "مؤسسة").length,
      gradeA: clients.filter((c) => c.grade === "A" || c.grade === "أ").length,
      // يمكنك إضافة المزيد من المنطق هنا بناءً على بياناتك الفعلية (متعثرين، وثائق ناقصة، الخ)
      foreigners: clients.filter((c) => c.nationality !== "سعودي" && c.nationality).length,
    };
  }, [clients]);

  // ==========================================
  // 4. Handlers
  // ==========================================
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("تم النسخ!");
  };

  const handleRowClick = (client) => {
    setSelectedClient(client);
    setIsPanelOpen(true);
  };

  // ==========================================
  // 5. UI Helpers
  // ==========================================
  const getTypeBadge = (type) => {
    if (type?.includes("سعودي")) return "bg-emerald-100 text-emerald-700";
    if (type?.includes("أجنب") || type?.includes("غير سعودي")) return "bg-blue-100 text-blue-700";
    if (type?.includes("شرك") || type?.includes("مؤسس")) return "bg-violet-100 text-violet-700";
    if (type?.includes("حكوم")) return "bg-red-100 text-red-700";
    if (type?.includes("ورث")) return "bg-amber-100 text-amber-700";
    return "bg-slate-100 text-slate-700";
  };

  const getGradeBadge = (grade) => {
    if (grade === "A" || grade === "أ") return "bg-emerald-100 text-emerald-700";
    if (grade === "B" || grade === "ب") return "bg-blue-100 text-blue-700";
    if (grade === "C" || grade === "ج") return "bg-amber-100 text-amber-700";
    if (grade === "D" || grade === "د") return "bg-red-100 text-red-700";
    return "bg-slate-100 text-slate-700";
  };

  // ==========================================
  // 6. Components
  // ==========================================
  
  // اللوحة الجانبية التفصيلية (Slide Panel)
  const SidePanel = () => {
    if (!selectedClient) return null;
    const clientName = getFullName(selectedClient.name);

    return (
      <>
        {/* خلفية معتمة */}
        <div 
          className={`fixed inset-0 bg-slate-900/20 z-[1000] transition-opacity duration-300 ${isPanelOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
          onClick={() => setIsPanelOpen(false)}
        />
        
        {/* اللوحة نفسها */}
        <div className={`fixed top-0 bottom-0 right-0 w-[400px] max-w-[90vw] bg-white shadow-[-4px_0_12px_rgba(0,0,0,0.1)] z-[1001] transform transition-transform duration-300 flex flex-col ${isPanelOpen ? "translate-x-0" : "translate-x-full"}`} dir="rtl">
          
          {/* رأس اللوحة */}
          <div className="p-5 bg-slate-50 border-b border-slate-200">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-lg font-bold text-slate-800">ملخص العميل</h3>
              <button onClick={() => setIsPanelOpen(false)} className="p-1 bg-red-50 text-red-600 rounded hover:bg-red-100"><X className="w-4 h-4" /></button>
            </div>
            
            <div className="px-3 py-1.5 bg-blue-600 text-white rounded-md font-mono text-center font-bold tracking-widest mb-3">
              {selectedClient.clientCode}
            </div>
            
            <div className="text-center font-bold text-slate-800 text-lg mb-2 truncate">{clientName}</div>
            
            <div className="flex gap-2 justify-center">
              <span className={`px-3 py-1 rounded-md text-xs font-bold ${getTypeBadge(selectedClient.type)}`}>{selectedClient.type || "غير محدد"}</span>
              <span className={`px-3 py-1 rounded-md text-xs font-bold ${getGradeBadge(selectedClient.grade)}`}>تقييم {selectedClient.grade || "-"}</span>
            </div>
          </div>

          {/* محتوى اللوحة */}
          <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
            
            {/* الإحصائيات السريعة */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="bg-slate-50 p-3 rounded-lg text-center border border-slate-100">
                <div className="text-[11px] text-slate-500 mb-1">المعاملات</div>
                <div className="text-xl font-bold text-blue-600">{selectedClient._count?.transactions || 0}</div>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg text-center border border-slate-100">
                <div className="text-[11px] text-slate-500 mb-1">الوثائق</div>
                <div className="text-xl font-bold text-emerald-600">{selectedClient._count?.attachments || 0}</div>
              </div>
              <div className="col-span-2 bg-slate-50 p-3 rounded-lg text-center border border-slate-100">
                <div className="text-[11px] text-slate-500 mb-1">إجمالي التحصيل</div>
                <div className="text-xl font-bold text-emerald-600 dir-ltr">{(selectedClient.totalFees || 0).toLocaleString()} ر.س</div>
              </div>
            </div>

            {/* بيانات التواصل */}
            <div className="mb-6">
              <h4 className="text-sm font-bold text-slate-800 mb-3">معلومات الاتصال</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-600 font-mono" dir="ltr">{selectedClient.contact?.mobile || "لا يوجد"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-600">{selectedClient.contact?.email || "لا يوجد"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-600">{selectedClient.address?.city || ""} {selectedClient.address?.district ? `- ${selectedClient.address.district}` : ""}</span>
                </div>
              </div>
            </div>

            {/* أزرار الإجراءات */}
            <h4 className="text-sm font-bold text-slate-800 mb-3">إجراءات سريعة</h4>
            <div className="flex flex-col gap-2">
              <button 
                onClick={() => {
                  setIsPanelOpen(false);
                  if (onOpenDetails) onOpenDetails(selectedClient.id, selectedClient.clientCode);
                }} 
                className="flex items-center justify-center gap-2 w-full p-3 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700"
              >
                <Eye className="w-4 h-4" /> فتح ملف العميل بالكامل
              </button>
              <button className="flex items-center justify-center gap-2 w-full p-3 bg-emerald-500 text-white rounded-lg text-sm font-bold hover:bg-emerald-600">
                <Plus className="w-4 h-4" /> إنشاء معاملة (055)
              </button>
              <button className="flex items-center justify-center gap-2 w-full p-3 bg-amber-500 text-white rounded-lg text-sm font-bold hover:bg-amber-600">
                <Upload className="w-4 h-4" /> رفع وثيقة
              </button>
            </div>
            
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 p-6 custom-scrollbar overflow-y-auto" dir="rtl">
      
      {/* 1. الإحصائيات (Stats Grid) */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-5">
        <div className="p-4 bg-white rounded-xl border-2 border-blue-500 shadow-sm">
          <div className="text-[11px] text-slate-500 font-bold mb-1">إجمالي العملاء</div>
          <div className="text-2xl font-black text-blue-500">{stats.total}</div>
        </div>
        <div className="p-4 bg-white rounded-xl border-2 border-emerald-500 shadow-sm">
          <div className="text-[11px] text-slate-500 font-bold mb-1">نشط</div>
          <div className="text-2xl font-black text-emerald-500">{stats.active}</div>
        </div>
        <div className="p-4 bg-white rounded-xl border-2 border-violet-500 shadow-sm">
          <div className="text-[11px] text-slate-500 font-bold mb-1">شركات ومؤسسات</div>
          <div className="text-2xl font-black text-violet-500">{stats.companies}</div>
        </div>
        <div className="p-4 bg-white rounded-xl border-2 border-amber-500 shadow-sm">
          <div className="text-[11px] text-slate-500 font-bold mb-1">تقييم A (ممتاز)</div>
          <div className="text-2xl font-black text-amber-500">{stats.gradeA}</div>
        </div>
        <div className="p-4 bg-white rounded-xl border-2 border-cyan-500 shadow-sm">
          <div className="text-[11px] text-slate-500 font-bold mb-1 flex items-center gap-1"><Users className="w-3 h-3"/> أجانب</div>
          <div className="text-2xl font-black text-cyan-500">{stats.foreigners}</div>
        </div>
        <div className="p-4 bg-white rounded-xl border-2 border-red-500 shadow-sm">
          <div className="text-[11px] text-slate-500 font-bold mb-1">غير نشط</div>
          <div className="text-2xl font-black text-red-500">{stats.total - stats.active}</div>
        </div>
      </div>

      {/* 2. شريط الفلترة والبحث */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 mb-5">
        <div className="flex flex-wrap gap-3 items-center">
          
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="بحث (كود، اسم، جوال، هوية)..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-3 pr-9 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-500"
            />
          </div>

          <select value={filters.type} onChange={(e) => setFilters({...filters, type: e.target.value})} className="p-2 border border-slate-300 rounded-lg text-sm outline-none min-w-[120px]">
            <option value="all">كل الأنواع</option>
            <option value="فرد">أفراد</option>
            <option value="شركة">شركات</option>
            <option value="ورثة">ورثة</option>
          </select>

          <select value={filters.rating} onChange={(e) => setFilters({...filters, rating: e.target.value})} className="p-2 border border-slate-300 rounded-lg text-sm outline-none min-w-[120px]">
            <option value="all">كل التقييمات</option>
            <option value="أ">تقييم A</option>
            <option value="ب">تقييم B</option>
            <option value="ج">تقييم C</option>
          </select>

          <select value={filters.status} onChange={(e) => setFilters({...filters, status: e.target.value})} className="p-2 border border-slate-300 rounded-lg text-sm outline-none min-w-[120px]">
            <option value="all">كل الحالات</option>
            <option value="active">نشط</option>
            <option value="inactive">غير نشط</option>
          </select>

          <button onClick={() => refetch()} className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-bold hover:bg-blue-100 transition-colors">
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
            تحديث
          </button>
        </div>
        
        <div className="mt-3 text-xs text-slate-500 font-bold">
          النتائج: <span className="text-slate-800">{filteredClients.length} عميل</span>
        </div>
      </div>

      {/* 3. جدول البيانات */}
      <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[400px]">
        <div className="overflow-x-auto flex-1 custom-scrollbar">
          <table className="w-full text-right border-collapse min-w-[1000px]">
            <thead className="bg-slate-50 sticky top-0 z-10 border-b-2 border-slate-200">
              <tr>
                <th className="p-3 text-xs font-bold text-slate-600">كود</th>
                <th className="p-3 text-xs font-bold text-slate-600">النوع</th>
                <th className="p-3 text-xs font-bold text-slate-600">الاسم</th>
                <th className="p-3 text-xs font-bold text-slate-600">الهوية/السجل</th>
                <th className="p-3 text-xs font-bold text-slate-600">الجوال</th>
                <th className="p-3 text-xs font-bold text-slate-600">المدينة</th>
                <th className="p-3 text-xs font-bold text-slate-600 text-center">التقييم</th>
                <th className="p-3 text-xs font-bold text-slate-600 text-center">الحالة</th>
                <th className="p-3 text-xs font-bold text-slate-600 text-center">المعاملات</th>
                <th className="p-3 text-xs font-bold text-slate-600 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="10" className="p-10 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
                  </td>
                </tr>
              ) : filteredClients.length === 0 ? (
                <tr>
                  <td colSpan="10" className="p-10 text-center text-slate-500">لا توجد نتائج مطابقة للبحث.</td>
                </tr>
              ) : (
                filteredClients.map((client) => (
                  <tr 
                    key={client.id} 
                    onClick={() => handleRowClick(client)}
                    className="border-b border-slate-100 hover:bg-blue-50/50 cursor-pointer transition-colors"
                  >
                    {/* كود العميل مع زر النسخ */}
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-800">{client.clientCode}</span>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleCopy(client.clientCode); }}
                          className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-700"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                    
                    <td className="p-3">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold whitespace-nowrap ${getTypeBadge(client.type)}`}>
                        {client.type || "غير محدد"}
                      </span>
                    </td>
                    
                    <td className="p-3 text-sm font-bold text-slate-800 truncate max-w-[150px]">
                      {getFullName(client.name)}
                    </td>
                    
                    <td className="p-3 text-xs font-mono text-slate-500">{client.identification?.idNumber || "-"}</td>
                    <td className="p-3 text-xs font-mono text-slate-500" dir="ltr">{client.contact?.mobile || "-"}</td>
                    <td className="p-3 text-xs text-slate-500">{client.address?.city || "-"}</td>
                    
                    <td className="p-3 text-center">
                      <span className={`px-3 py-1 rounded-md text-xs font-bold ${getGradeBadge(client.grade)}`}>
                        {client.grade || "-"}
                      </span>
                    </td>
                    
                    <td className="p-3 text-center">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${client.isActive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                        {client.isActive ? "نشط" : "غير نشط"}
                      </span>
                    </td>
                    
                    <td className="p-3 text-center">
                      <span className="px-3 py-1 bg-slate-100 rounded-md text-xs font-bold text-slate-800">
                        {client._count?.transactions || 0}
                      </span>
                    </td>
                    
                    <td className="p-3">
                      <div className="flex justify-center gap-1">
                        <button 
                          title="فتح ملف العميل"
                          onClick={(e) => {
                            e.stopPropagation(); // منع فتح اللوحة الجانبية
                            if (onOpenDetails) onOpenDetails(client.id, client.clientCode);
                          }}
                          className="p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button title="معاملة جديدة" className="p-1.5 bg-emerald-50 text-emerald-600 rounded hover:bg-emerald-100">
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. إدراج اللوحة الجانبية */}
      <SidePanel />
      
    </div>
  );
};

export default ClientsLog;