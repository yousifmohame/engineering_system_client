import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllClients, deleteClient } from "../../api/clientApi"; // افترض وجود deleteClient
import {
  Search, RefreshCw, Copy, Eye, Plus, Upload, Phone, Mail, MapPin,
  X, Loader2, Users, Edit, Trash2, MessageCircle, Calendar, FilterX,
  ChevronRight, ChevronLeft, MoreVertical
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

// دالة مساعدة لتنسيق التاريخ
const formatDate = (dateString) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("ar-SA", {
    year: 'numeric', month: 'short', day: 'numeric'
  });
};

const ClientsLog = ({ onOpenDetails, onEditClient }) => {
  const queryClient = useQueryClient();

  // ==========================================
  // 1. States (الحالات)
  // ==========================================
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({ type: "all", rating: "all", status: "all" });
  const [selectedClient, setSelectedClient] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // ==========================================
  // 2. Fetch Data (جلب البيانات)
  // ==========================================
  const { data: clients = [], isLoading, refetch, isFetching } = useQuery({
    queryKey: ["clients", searchTerm],
    queryFn: () => getAllClients({ search: searchTerm }),
  });

  // Mutation للحذف (مثال)
  const deleteMutation = useMutation({
    mutationFn: deleteClient,
    onSuccess: () => {
      toast.success("تم حذف العميل بنجاح");
      queryClient.invalidateQueries(["clients"]);
    },
    onError: () => toast.error("فشل حذف العميل لتجود ارتباطات مالية أو معاملات")
  });

  // ==========================================
  // 3. Local Filtering, Pagination & Stats
  // ==========================================
  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      const matchType = filters.type === "all" || client.type?.includes(filters.type);
      const matchRating = filters.rating === "all" || client.grade === filters.rating;
      const matchStatus = filters.status === "all" || (filters.status === "active" ? client.isActive : !client.isActive);
      return matchType && matchRating && matchStatus;
    });
  }, [clients, filters]);

  // حساب الترقيم
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
  const paginatedClients = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredClients.slice(start, start + itemsPerPage);
  }, [filteredClients, currentPage]);

  // إعادة الترقيم للصفحة 1 عند تغيير الفلاتر
  useMemo(() => setCurrentPage(1), [filters, searchTerm]);

  const stats = useMemo(() => {
    return {
      total: clients.length,
      active: clients.filter((c) => c.isActive).length,
      companies: clients.filter((c) => c.type === "شركة" || c.type === "مؤسسة").length,
      gradeA: clients.filter((c) => c.grade === "A" || c.grade === "أ").length,
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

  const handleDelete = (e, id) => {
    e.stopPropagation();
    if(window.confirm("هل أنت متأكد من رغبتك في حذف هذا العميل؟")) {
      deleteMutation.mutate(id);
    }
  };

  const clearFilters = () => {
    setFilters({ type: "all", rating: "all", status: "all" });
    setSearchTerm("");
  };

  const openWhatsApp = (phone) => {
    if (!phone) return toast.error("لا يوجد رقم جوال مسجل");
    // تنظيف الرقم من الأصفار والمسافات (إضافة مفتاح السعودية الافتراضي إذا لزم)
    let cleanPhone = phone.replace(/\D/g,'');
    if(cleanPhone.startsWith('05')) cleanPhone = '966' + cleanPhone.substring(1);
    window.open(`https://wa.me/${cleanPhone}`, '_blank');
  };

  // ==========================================
  // 5. UI Helpers
  // ==========================================
  const getTypeBadge = (type) => {
    if (type?.includes("سعودي")) return "bg-emerald-50 text-emerald-600 border border-emerald-200";
    if (type?.includes("أجنب") || type?.includes("غير سعودي")) return "bg-blue-50 text-blue-600 border border-blue-200";
    if (type?.includes("شرك") || type?.includes("مؤسس")) return "bg-violet-50 text-violet-600 border border-violet-200";
    if (type?.includes("حكوم")) return "bg-red-50 text-red-600 border border-red-200";
    if (type?.includes("ورث")) return "bg-amber-50 text-amber-600 border border-amber-200";
    return "bg-slate-50 text-slate-600 border border-slate-200";
  };

  const getGradeBadge = (grade) => {
    if (grade === "A" || grade === "أ") return "text-emerald-600 font-black";
    if (grade === "B" || grade === "ب") return "text-blue-600 font-bold";
    if (grade === "C" || grade === "ج") return "text-amber-600 font-bold";
    if (grade === "D" || grade === "د") return "text-red-600 font-bold";
    return "text-slate-500";
  };

  // ==========================================
  // 6. اللوحة الجانبية (Side Panel)
  // ==========================================
  const SidePanel = () => {
    if (!selectedClient) return null;
    const clientName = getFullName(selectedClient.name);

    return (
      <>
        <div className={`fixed inset-0 bg-slate-900/20 z-[1000] backdrop-blur-sm transition-opacity duration-300 ${isPanelOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`} onClick={() => setIsPanelOpen(false)} />
        
        <div className={`fixed top-0 bottom-0 right-0 w-[420px] max-w-[90vw] bg-white shadow-2xl z-[1001] transform transition-transform duration-300 flex flex-col ${isPanelOpen ? "translate-x-0" : "translate-x-full"}`} dir="rtl">
          
          {/* Header */}
          <div className="p-5 bg-gradient-to-l from-slate-50 to-white border-b border-slate-200">
            <div className="flex justify-between items-start mb-4">
              <div className="px-3 py-1 bg-slate-800 text-white rounded font-mono text-xs font-bold tracking-widest flex items-center gap-2">
                {selectedClient.clientCode}
                <button onClick={() => handleCopy(selectedClient.clientCode)} className="hover:text-blue-300"><Copy className="w-3 h-3"/></button>
              </div>
              <button onClick={() => setIsPanelOpen(false)} className="p-1.5 bg-slate-100 text-slate-500 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors"><X className="w-4 h-4" /></button>
            </div>
            <h2 className="font-black text-slate-800 text-xl mb-3 leading-tight">{clientName}</h2>
            <div className="flex gap-2">
              <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${getTypeBadge(selectedClient.type)}`}>{selectedClient.type || "غير محدد"}</span>
              <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-100 ${getGradeBadge(selectedClient.grade)}`}>تصنيف: {selectedClient.grade || "-"}</span>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-5 custom-scrollbar space-y-6">
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100 text-center">
                <div className="text-[11px] font-bold text-blue-600 mb-1">المعاملات النشطة</div>
                <div className="text-xl font-black text-blue-800">{selectedClient._count?.transactions || 0}</div>
              </div>
              <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-100 text-center">
                <div className="text-[11px] font-bold text-emerald-600 mb-1">إجمالي التحصيل</div>
                <div className="text-xl font-black text-emerald-800 dir-ltr">{(selectedClient.totalFees || 0).toLocaleString()} <span className="text-xs">ر.س</span></div>
              </div>
            </div>

            {/* Contact Info (Actionable) */}
            <div>
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">بيانات التواصل</h4>
              <div className="space-y-2">
                <div onClick={() => openWhatsApp(selectedClient.contact?.mobile)} className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg hover:border-emerald-400 hover:shadow-sm cursor-pointer transition-all group">
                  <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-colors"><MessageCircle className="w-4 h-4" /></div>
                  <div className="flex-1">
                    <div className="text-[10px] text-slate-500">رقم الجوال / واتساب</div>
                    <div className="text-sm font-bold text-slate-700 font-mono" dir="ltr">{selectedClient.contact?.mobile || "لا يوجد"}</div>
                  </div>
                </div>
                
                <a href={`mailto:${selectedClient.contact?.email}`} className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg hover:border-blue-400 hover:shadow-sm cursor-pointer transition-all group">
                  <div className="p-2 bg-blue-50 rounded-lg text-blue-600 group-hover:bg-blue-500 group-hover:text-white transition-colors"><Mail className="w-4 h-4" /></div>
                  <div className="flex-1">
                    <div className="text-[10px] text-slate-500">البريد الإلكتروني</div>
                    <div className="text-sm font-bold text-slate-700">{selectedClient.contact?.email || "لا يوجد"}</div>
                  </div>
                </a>

                <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="p-2 bg-slate-200 rounded-lg text-slate-600"><MapPin className="w-4 h-4" /></div>
                  <div className="flex-1">
                    <div className="text-[10px] text-slate-500">العنوان الوطني</div>
                    <div className="text-sm font-bold text-slate-700">{selectedClient.address?.city || "-"} {selectedClient.address?.district ? `/ ${selectedClient.address.district}` : ""}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* IDs */}
            <div>
               <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">البيانات الرسمية</h4>
               <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 border border-slate-200 rounded-lg">
                    <div className="text-[10px] text-slate-500 mb-1">رقم الهوية / السجل</div>
                    <div className="text-sm font-bold text-slate-800 font-mono">{selectedClient.identification?.idNumber || "-"}</div>
                  </div>
                  <div className="p-3 border border-slate-200 rounded-lg">
                    <div className="text-[10px] text-slate-500 mb-1">تاريخ الإضافة</div>
                    <div className="text-sm font-bold text-slate-800">{formatDate(selectedClient.createdAt)}</div>
                  </div>
               </div>
            </div>

          </div>

          {/* Footer Actions */}
          <div className="p-5 border-t border-slate-200 bg-white grid grid-cols-2 gap-3">
             <button onClick={() => { setIsPanelOpen(false); if (onOpenDetails) onOpenDetails(selectedClient.id, selectedClient.clientCode); }} className="col-span-2 flex items-center justify-center gap-2 py-3 bg-slate-800 text-white rounded-xl text-sm font-bold hover:bg-slate-700 shadow-md">
                <Eye className="w-4 h-4" /> فتح الملف الشامل
             </button>
             <button onClick={() => { setIsPanelOpen(false); if (onEditClient) onEditClient(selectedClient); }} className="flex items-center justify-center gap-2 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200">
                <Edit className="w-4 h-4" /> تعديل سريع
             </button>
             <button className="flex items-center justify-center gap-2 py-2.5 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold hover:bg-emerald-100">
                <Plus className="w-4 h-4" /> معاملة جديدة
             </button>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="flex flex-col h-full bg-slate-50/50 p-4 md:p-6 custom-scrollbar overflow-y-auto" dir="rtl">
      
      {/* 1. الإحصائيات (Stats Grid) */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
          <div className="text-xs text-slate-500 font-bold mb-1">إجمالي العملاء</div>
          <div className="text-2xl font-black text-slate-800">{stats.total}</div>
        </div>
        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 shadow-sm flex flex-col justify-center">
          <div className="text-xs text-emerald-600 font-bold mb-1">نشط</div>
          <div className="text-2xl font-black text-emerald-700">{stats.active}</div>
        </div>
        <div className="p-4 bg-violet-50 rounded-xl border border-violet-100 shadow-sm flex flex-col justify-center">
          <div className="text-xs text-violet-600 font-bold mb-1">شركات ومؤسسات</div>
          <div className="text-2xl font-black text-violet-700">{stats.companies}</div>
        </div>
        <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 shadow-sm flex flex-col justify-center">
          <div className="text-xs text-amber-600 font-bold mb-1">عملاء مميزين (A)</div>
          <div className="text-2xl font-black text-amber-700">{stats.gradeA}</div>
        </div>
        <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 shadow-sm flex flex-col justify-center">
          <div className="text-xs text-blue-600 font-bold mb-1">غير سعوديين</div>
          <div className="text-2xl font-black text-blue-700">{stats.foreigners}</div>
        </div>
      </div>

      {/* 2. شريط الفلترة والبحث */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 mb-6 flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-3 items-center flex-1">
          <div className="relative flex-1 min-w-[250px] max-w-[400px]">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="ابحث بالاسم، الكود، الهوية، الجوال..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-3 pr-9 py-2 border-2 border-slate-200 rounded-lg text-sm font-medium outline-none focus:border-blue-500 transition-colors bg-slate-50 focus:bg-white"
            />
          </div>

          <select value={filters.type} onChange={(e) => setFilters({...filters, type: e.target.value})} className="p-2 border-2 border-slate-200 bg-slate-50 focus:bg-white rounded-lg text-sm font-bold text-slate-700 outline-none min-w-[130px]">
            <option value="all">كل الأنواع</option>
            <option value="فرد">أفراد فقط</option>
            <option value="شركة">شركات ومؤسسات</option>
            <option value="ورثة">ورثة</option>
          </select>

          <select value={filters.rating} onChange={(e) => setFilters({...filters, rating: e.target.value})} className="p-2 border-2 border-slate-200 bg-slate-50 focus:bg-white rounded-lg text-sm font-bold text-slate-700 outline-none min-w-[130px]">
            <option value="all">كل التقييمات</option>
            <option value="أ">تصنيف أ (ممتاز)</option>
            <option value="ب">تصنيف ب (جيد)</option>
            <option value="ج">تصنيف ج (عادي)</option>
          </select>

          <select value={filters.status} onChange={(e) => setFilters({...filters, status: e.target.value})} className="p-2 border-2 border-slate-200 bg-slate-50 focus:bg-white rounded-lg text-sm font-bold text-slate-700 outline-none min-w-[130px]">
            <option value="all">كل الحالات</option>
            <option value="active">نشط</option>
            <option value="inactive">موقوف</option>
          </select>

          {(searchTerm || filters.type !== "all" || filters.rating !== "all" || filters.status !== "all") && (
            <button onClick={clearFilters} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="مسح الفلاتر">
              <FilterX className="w-5 h-5" />
            </button>
          )}
        </div>
        
        <button onClick={() => refetch()} className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-bold hover:bg-slate-700 transition-colors shadow-md">
          <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
          تحديث
        </button>
      </div>

      {/* 3. جدول البيانات الاحترافي */}
      <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1 custom-scrollbar">
          <table className="w-full text-right border-collapse min-w-[1100px]">
            <thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-200 shadow-sm">
              <tr>
                <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-wider">الكود / الإضافة</th>
                <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-wider">اسم العميل / النوع</th>
                <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-wider">البيانات الرسمية</th>
                <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-wider">التواصل</th>
                <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-wider text-center">التقييم</th>
                <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-wider text-center">النشاط</th>
                <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-wider text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="p-16 text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-blue-500 mx-auto mb-4" />
                    <div className="text-slate-500 font-bold">جاري تحميل سجلات العملاء...</div>
                  </td>
                </tr>
              ) : paginatedClients.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-16 text-center bg-slate-50/50">
                    <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <div className="text-slate-600 font-bold text-lg">لا توجد نتائج</div>
                    <div className="text-slate-400 text-sm mt-1">حاول تغيير كلمات البحث أو مسح الفلاتر.</div>
                  </td>
                </tr>
              ) : (
                paginatedClients.map((client) => (
                  <tr 
                    key={client.id} 
                    onClick={() => handleRowClick(client)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                  >
                    {/* الكود والتاريخ */}
                    <td className="p-4 align-top w-[140px]">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className="font-mono text-sm font-black text-slate-800">{client.clientCode}</span>
                        <button onClick={(e) => { e.stopPropagation(); handleCopy(client.clientCode); }} className="text-slate-300 hover:text-blue-600 transition-colors"><Copy className="w-3.5 h-3.5" /></button>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold">
                        <Calendar className="w-3 h-3" /> {formatDate(client.createdAt)}
                      </div>
                    </td>
                    
                    {/* الاسم والنوع */}
                    <td className="p-4 align-top min-w-[200px] max-w-[250px]">
                      <div className="text-sm font-bold text-slate-800 mb-1.5 truncate group-hover:text-blue-600 transition-colors" title={getFullName(client.name)}>
                        {getFullName(client.name)}
                      </div>
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold whitespace-nowrap ${getTypeBadge(client.type)}`}>
                        {client.type || "غير محدد"}
                      </span>
                    </td>
                    
                    {/* الهوية */}
                    <td className="p-4 align-top w-[180px]">
                      <div className="text-xs font-mono font-bold text-slate-600 mb-1">{client.identification?.idNumber || "—"}</div>
                      <div className="text-[10px] text-slate-400 font-bold bg-slate-100 px-1.5 py-0.5 rounded inline-block">
                        {client.identification?.idType || "غير محدد"}
                      </div>
                    </td>

                    {/* التواصل */}
                    <td className="p-4 align-top w-[160px]">
                      <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-700 mb-1.5" dir="ltr">
                        <Phone className="w-3 h-3 text-slate-400" /> {client.contact?.mobile || "—"}
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 truncate" title={client.address?.city}>
                        <MapPin className="w-3 h-3 text-slate-400" /> {client.address?.city || "—"}
                      </div>
                    </td>
                    
                    {/* التقييم */}
                    <td className="p-4 align-top text-center w-[100px]">
                      <div className={`text-lg mb-0.5 ${getGradeBadge(client.grade)}`}>{client.grade || "-"}</div>
                      <div className="text-[10px] text-slate-400 font-bold">المستوى</div>
                    </td>
                    
                    {/* النشاط (المعاملات والحالة) */}
                    <td className="p-4 align-top text-center w-[120px]">
                      <div className="mb-1.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${client.isActive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                          {client.isActive ? "حساب نشط" : "موقوف"}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-slate-500">
                        <span className="text-slate-800 font-black">{client._count?.transactions || 0}</span> معاملة
                      </div>
                    </td>
                    
                    {/* أزرار الإجراءات (Actions) */}
                    <td className="p-4 align-middle w-[180px]">
                      <div className="flex items-center justify-center gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity">
                        
                        {/* 1. فتح الملف (رئيسي) */}
                        <button 
                          title="فتح ملف العميل"
                          onClick={(e) => { e.stopPropagation(); if (onOpenDetails) onOpenDetails(client.id, client.clientCode); }}
                          className="p-1.5 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-600 hover:text-white transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        {/* 2. واتساب (مباشر) */}
                        <button 
                          title="مراسلة واتساب"
                          onClick={(e) => { e.stopPropagation(); openWhatsApp(client.contact?.mobile); }}
                          className="p-1.5 bg-emerald-50 text-emerald-600 rounded-md hover:bg-emerald-600 hover:text-white transition-colors"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </button>

                        {/* 3. إنشاء معاملة */}
                        <button 
                          title="إنشاء معاملة جديدة"
                          onClick={(e) => { e.stopPropagation(); /* logic */ toast.success('فتح شاشة إنشاء معاملة'); }}
                          className="p-1.5 bg-amber-50 text-amber-600 rounded-md hover:bg-amber-500 hover:text-white transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>

                        {/* 4. تعديل سريع */}
                        <button 
                          title="تعديل بيانات العميل"
                          onClick={(e) => { e.stopPropagation(); if(onEditClient) onEditClient(client); }}
                          className="p-1.5 bg-slate-100 text-slate-600 rounded-md hover:bg-slate-600 hover:text-white transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        {/* 5. حذف */}
                        <button 
                          title="حذف العميل"
                          onClick={(e) => handleDelete(e, client.id)}
                          className="p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded-md transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 4. الترقيم (Pagination Footer) */}
        {!isLoading && filteredClients.length > 0 && (
          <div className="border-t border-slate-200 bg-slate-50 p-4 flex items-center justify-between">
            <div className="text-xs font-bold text-slate-500">
              إظهار <span className="text-slate-800">{(currentPage - 1) * itemsPerPage + 1}</span> إلى <span className="text-slate-800">{Math.min(currentPage * itemsPerPage, filteredClients.length)}</span> من أصل <span className="text-slate-800">{filteredClients.length}</span> عميل
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              
              <div className="text-xs font-bold text-slate-700 px-3 py-1 bg-white border border-slate-200 rounded">
                صفحة {currentPage} من {totalPages}
              </div>

              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* إدراج اللوحة الجانبية */}
      <SidePanel />
      
    </div>
  );
};

export default ClientsLog;