import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllClients, deleteClient } from "../../api/clientApi";
import {
  Search,
  RefreshCw,
  Copy,
  Eye,
  Plus,
  Upload,
  Phone,
  Mail,
  MapPin,
  X,
  Loader2,
  Users,
  Edit,
  Trash2,
  MessageCircle,
  Calendar,
  FilterX,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  TrendingUp,
  Ban,
  FileText,
} from "lucide-react";
import { toast } from "sonner";

// دالة مساعدة لاسم العميل
const getFullName = (nameObj) => {
  if (!nameObj) return "غير محدد";
  if (typeof nameObj === "string") return nameObj;
  if (nameObj.ar) return nameObj.ar;
  const parts = [
    nameObj.firstName,
    nameObj.fatherName,
    nameObj.grandFatherName,
    nameObj.familyName,
  ];
  return parts.filter(Boolean).join(" ").trim() || nameObj.en || "غير محدد";
};

// دالة مساعدة لتنسيق التاريخ
const formatDate = (dateString) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

// دالة مساعدة لقراءة حقل JSON الخاص بالوكيل بأمان
const getRepresentative = (repData) => {
  if (!repData) return null;
  if (typeof repData === "string") {
    try {
      return JSON.parse(repData);
    } catch (e) {
      return null;
    }
  }
  return repData;
};

const ClientsLog = ({ onOpenDetails, onEditClient }) => {
  const queryClient = useQueryClient();

  // ==========================================
  // 1. States (الحالات)
  // ==========================================
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    type: "all",
    city: "all",
    rating: "all",
    status: "all",
    hasRep: "all",
    expiry: "all",
  });

  const [selectedClient, setSelectedClient] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // ==========================================
  // 2. Fetch Data (جلب البيانات)
  // ==========================================
  const {
    data: clients = [],
    isLoading,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["clients"],
    queryFn: () => getAllClients({}),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteClient,
    onSuccess: () => {
      toast.success("تم حذف العميل بنجاح");
      queryClient.invalidateQueries(["clients"]);
      setIsPanelOpen(false);
    },
    onError: () =>
      toast.error("فشل حذف العميل لوجود ارتباطات مالية أو معاملات"),
  });

  // ==========================================
  // 3. Local Filtering & Stats
  // ==========================================
  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      const searchMatch =
        !searchTerm ||
        client.clientCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.mobile?.includes(searchTerm) ||
        client.idNumber?.includes(searchTerm) ||
        getFullName(client.name)
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchType =
        filters.type === "all" ||
        client.type === filters.type ||
        (filters.type === "company" && client.type === "شركة");
      const matchCity =
        filters.city === "all" || client.address?.city === filters.city;
      const matchRating =
        filters.rating === "all" || client.grade === filters.rating;
      const matchStatus =
        filters.status === "all" ||
        (filters.status === "active" ? client.isActive : !client.isActive);

      return (
        searchMatch && matchType && matchCity && matchRating && matchStatus
      );
    });
  }, [clients, filters, searchTerm]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredClients.length / itemsPerPage),
  );
  const paginatedClients = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredClients.slice(start, start + itemsPerPage);
  }, [filteredClients, currentPage]);

  const stats = useMemo(() => {
    return {
      total: clients.length,
      active: clients.filter((c) => c.isActive).length,
      companies: clients.filter((c) => c.type === "شركة" || c.type === "مؤسسة")
        .length,
      foreigners: clients.filter(
        (c) => c.nationality !== "سعودي" && c.nationality,
      ).length,
      investors: 1, // افتراضي للتصميم
      missingDocs: 2, // افتراضي للتصميم
      expiringReps: 2, // افتراضي للتصميم
      blocked: clients.filter((c) => !c.isActive).length,
      unreachable: 11, // افتراضي للتصميم
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
    if (window.confirm("هل أنت متأكد من رغبتك في حذف هذا العميل؟")) {
      deleteMutation.mutate(id);
    }
  };

  const clearFilters = () => {
    setFilters({
      type: "all",
      city: "all",
      rating: "all",
      status: "all",
      hasRep: "all",
      expiry: "all",
    });
    setSearchTerm("");
    setCurrentPage(1);
  };

  const openWhatsApp = (phone) => {
    if (!phone) return toast.error("لا يوجد رقم جوال مسجل");
    let cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.startsWith("05"))
      cleanPhone = "966" + cleanPhone.substring(1);
    window.open(`https://wa.me/${cleanPhone}`, "_blank");
  };

  // ==========================================
  // 5. UI Helpers
  // ==========================================
  const getTypeBadge = (type) => {
    if (type?.includes("سعودي"))
      return "bg-emerald-50 text-emerald-600 border border-emerald-200";
    if (type?.includes("أجنب") || type?.includes("غير سعودي"))
      return "bg-blue-50 text-blue-600 border border-blue-200";
    if (type?.includes("شرك") || type?.includes("مؤسس"))
      return "bg-violet-50 text-violet-600 border border-violet-200";
    if (type?.includes("حكوم"))
      return "bg-red-50 text-red-600 border border-red-200";
    if (type?.includes("ورث"))
      return "bg-amber-50 text-amber-600 border border-amber-200";
    return "bg-slate-50 text-slate-600 border border-slate-200";
  };

  const getGradeBadge = (grade) => {
    if (grade === "A" || grade === "أ")
      return "bg-emerald-100 text-emerald-700";
    if (grade === "B" || grade === "ب") return "bg-blue-100 text-blue-700";
    if (grade === "C" || grade === "ج") return "bg-amber-100 text-amber-700";
    if (grade === "D" || grade === "د") return "bg-red-100 text-red-700";
    return "bg-slate-100 text-slate-500";
  };

  // ==========================================
  // 6. اللوحة الجانبية (Side Panel)
  // ==========================================
  const SidePanel = () => {
    if (!selectedClient) return null;
    const clientName = getFullName(selectedClient.name);

    return (
      <>
        <div
          className={`fixed inset-0 bg-slate-900/20 z-[1000] backdrop-blur-sm transition-opacity duration-300 ${isPanelOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
          onClick={() => setIsPanelOpen(false)}
        />
        <div
          className={`fixed top-0 bottom-0 right-0 w-[420px] max-w-[90vw] bg-white shadow-2xl z-[1001] transform transition-transform duration-300 flex flex-col ${isPanelOpen ? "translate-x-0" : "translate-x-full"}`}
          dir="rtl"
        >
          {/* Header */}
          <div className="p-5 bg-gradient-to-l from-slate-50 to-white border-b border-slate-200">
            <div className="flex justify-between items-start mb-4">
              <div className="px-3 py-1 bg-slate-800 text-white rounded font-mono text-xs font-bold tracking-widest flex items-center gap-2">
                {selectedClient.clientCode}
                <button
                  onClick={() => handleCopy(selectedClient.clientCode)}
                  className="hover:text-blue-300"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>
              <button
                onClick={() => setIsPanelOpen(false)}
                className="p-1.5 bg-slate-100 text-slate-500 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <h2 className="font-black text-slate-800 text-xl mb-3 leading-tight">
              {clientName}
            </h2>
            <div className="flex gap-2">
              <span
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${getTypeBadge(selectedClient.type)}`}
              >
                {selectedClient.type || "غير محدد"}
              </span>
              <span
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${getGradeBadge(selectedClient.grade)}`}
              >
                تصنيف: {selectedClient.grade || "-"}
              </span>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-5 custom-scrollbar space-y-6">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100 text-center">
                <div className="text-[11px] font-bold text-blue-600 mb-1">
                  المعاملات النشطة
                </div>
                <div className="text-xl font-black text-blue-800">
                  {selectedClient._count?.transactions || 0}
                </div>
              </div>
              <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-100 text-center">
                <div className="text-[11px] font-bold text-emerald-600 mb-1">
                  إجمالي التحصيل
                </div>
                <div className="text-xl font-black text-emerald-800 dir-ltr">
                  {(selectedClient.totalFees || 0).toLocaleString()}{" "}
                  <span className="text-xs">ر.س</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">
                بيانات التواصل
              </h4>
              <div className="space-y-2">
                <div
                  onClick={() =>
                    openWhatsApp(
                      selectedClient.contact?.mobile || selectedClient.mobile,
                    )
                  }
                  className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg hover:border-emerald-400 hover:shadow-sm cursor-pointer transition-all group"
                >
                  <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                    <MessageCircle className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="text-[10px] text-slate-500">
                      رقم الجوال / واتساب
                    </div>
                    <div
                      className="text-sm font-bold text-slate-700 font-mono"
                      dir="ltr"
                    >
                      {/* 👈 التعديل هنا أيضاً للوحة الجانبية */}
                      {selectedClient.mobile?.startsWith("غير متوفر")
                        ? "غير متوفر"
                        : selectedClient.contact?.mobile ||
                          selectedClient.mobile ||
                          "لا يوجد"}
                    </div>
                  </div>
                </div>

                <a
                  href={`mailto:${selectedClient.contact?.email || selectedClient.email}`}
                  className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg hover:border-blue-400 hover:shadow-sm cursor-pointer transition-all group"
                >
                  <div className="p-2 bg-blue-50 rounded-lg text-blue-600 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="text-[10px] text-slate-500">
                      البريد الإلكتروني
                    </div>
                    <div className="text-sm font-bold text-slate-700">
                      {selectedClient.contact?.email ||
                        selectedClient.email ||
                        "لا يوجد"}
                    </div>
                  </div>
                </a>

                <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="p-2 bg-slate-200 rounded-lg text-slate-600">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="text-[10px] text-slate-500">
                      العنوان الوطني
                    </div>
                    <div className="text-sm font-bold text-slate-700">
                      {selectedClient.address?.city || "-"}{" "}
                      {selectedClient.address?.district
                        ? `/ ${selectedClient.address.district}`
                        : ""}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">
                البيانات الرسمية
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 border border-slate-200 rounded-lg bg-slate-50">
                  <div className="text-[10px] text-slate-500 mb-1">
                    رقم الهوية / السجل
                  </div>
                  <div className="text-sm font-bold text-slate-800 font-mono">
                    {selectedClient.identification?.idNumber ||
                      selectedClient.idNumber ||
                      "-"}
                  </div>
                </div>
                <div className="p-3 border border-slate-200 rounded-lg bg-slate-50">
                  <div className="text-[10px] text-slate-500 mb-1">
                    تاريخ الإضافة
                  </div>
                  <div className="text-sm font-bold text-slate-800 font-mono">
                    {formatDate(selectedClient.createdAt)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-5 border-t border-slate-200 bg-white grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                setIsPanelOpen(false);
                if (onOpenDetails)
                  onOpenDetails(selectedClient.id, selectedClient.clientCode);
              }}
              className="col-span-2 flex items-center justify-center gap-2 py-3 bg-slate-800 text-white rounded-xl text-sm font-bold hover:bg-slate-700 shadow-md transition-all"
            >
              <Eye className="w-4 h-4" /> فتح الملف الشامل
            </button>
            <button
              onClick={() => {
                setIsPanelOpen(false);
                if (onEditClient) onEditClient(selectedClient);
              }}
              className="flex items-center justify-center gap-2 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors"
            >
              <Edit className="w-4 h-4" /> تعديل سريع
            </button>
            <button className="flex items-center justify-center gap-2 py-2.5 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-colors">
              <Plus className="w-4 h-4" /> معاملة جديدة
            </button>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-4 md:p-6" dir="rtl">
      <div className="flex flex-col gap-4">
        {/* 1. الإحصائيات (Stats Grid) */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
          <div className="p-3 bg-blue-50 rounded-lg shadow-sm border-2 border-blue-500 flex flex-col justify-between">
            <div className="text-[10px] text-slate-500 mb-1 font-bold">
              إجمالي العملاء
            </div>
            <div className="text-2xl font-black text-blue-500 mb-1">
              {stats.total}
            </div>
            <div className="grid grid-cols-3 gap-1 border-t border-blue-500/20 pt-1.5 text-center mt-auto">
              <div>
                <div className="text-[8px] text-slate-500">أسبوع</div>
                <div className="text-[11px] font-bold text-blue-500">1</div>
              </div>
              <div>
                <div className="text-[8px] text-slate-500">شهر</div>
                <div className="text-[11px] font-bold text-blue-500">2</div>
              </div>
              <div>
                <div className="text-[8px] text-slate-500">سنة</div>
                <div className="text-[11px] font-bold text-blue-500">11</div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-emerald-50 rounded-lg shadow-sm border-2 border-emerald-500 flex flex-col justify-between">
            <div className="text-[10px] text-slate-500 mb-1 font-bold">نشط</div>
            <div className="text-2xl font-black text-emerald-500 mb-1">
              {stats.active}
            </div>
            <div className="grid grid-cols-3 gap-1 border-t border-emerald-500/20 pt-1.5 text-center mt-auto">
              <div>
                <div className="text-[8px] text-slate-500">أسبوع</div>
                <div className="text-[11px] font-bold text-emerald-500">1</div>
              </div>
              <div>
                <div className="text-[8px] text-slate-500">شهر</div>
                <div className="text-[11px] font-bold text-emerald-500">2</div>
              </div>
              <div>
                <div className="text-[8px] text-slate-500">سنة</div>
                <div className="text-[11px] font-bold text-emerald-500">10</div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-amber-50 rounded-lg shadow-sm border-2 border-amber-500 flex flex-col justify-between">
            <div className="text-[10px] text-slate-500 mb-1 font-bold">
              متعثرين
            </div>
            <div className="text-2xl font-black text-amber-500 mb-1">1</div>
            <div className="grid grid-cols-3 gap-1 border-t border-amber-500/20 pt-1.5 text-center mt-auto">
              <div>
                <div className="text-[8px] text-slate-500">أسبوع</div>
                <div className="text-[11px] font-bold text-amber-500">0</div>
              </div>
              <div>
                <div className="text-[8px] text-slate-500">شهر</div>
                <div className="text-[11px] font-bold text-amber-500">0</div>
              </div>
              <div>
                <div className="text-[8px] text-slate-500">سنة</div>
                <div className="text-[11px] font-bold text-amber-500">1</div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-red-50 rounded-lg shadow-sm border-2 border-red-500 flex flex-col justify-between">
            <div className="text-[10px] text-slate-500 mb-1 font-bold">
              وثائق ناقصة
            </div>
            <div className="text-2xl font-black text-red-500 mb-1">
              {stats.missingDocs}
            </div>
            <div className="grid grid-cols-3 gap-1 border-t border-red-500/20 pt-1.5 text-center mt-auto">
              <div>
                <div className="text-[8px] text-slate-500">أسبوع</div>
                <div className="text-[11px] font-bold text-red-500">0</div>
              </div>
              <div>
                <div className="text-[8px] text-slate-500">شهر</div>
                <div className="text-[11px] font-bold text-red-500">0</div>
              </div>
              <div>
                <div className="text-[8px] text-slate-500">سنة</div>
                <div className="text-[11px] font-bold text-red-500">2</div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-purple-50 rounded-lg shadow-sm border-2 border-purple-500 flex flex-col justify-between">
            <div className="text-[10px] text-slate-500 mb-1 font-bold">
              شركات
            </div>
            <div className="text-2xl font-black text-purple-500 mb-1">
              {stats.companies}
            </div>
            <div className="grid grid-cols-3 gap-1 border-t border-purple-500/20 pt-1.5 text-center mt-auto">
              <div>
                <div className="text-[8px] text-slate-500">أسبوع</div>
                <div className="text-[11px] font-bold text-purple-500">1</div>
              </div>
              <div>
                <div className="text-[8px] text-slate-500">شهر</div>
                <div className="text-[11px] font-bold text-purple-500">2</div>
              </div>
              <div>
                <div className="text-[8px] text-slate-500">سنة</div>
                <div className="text-[11px] font-bold text-purple-500">3</div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-orange-50 rounded-lg shadow-sm border-2 border-orange-500 flex flex-col justify-center">
            <div className="text-[10px] text-slate-500 mb-1 font-bold">
              تفويضات قاربت الانتهاء
            </div>
            <div className="text-2xl font-black text-orange-500">
              {stats.expiringReps}
            </div>
          </div>

          <div className="p-3 bg-rose-50 rounded-lg shadow-sm border-2 border-rose-500 flex flex-col justify-center">
            <div className="text-[10px] text-slate-500 mb-1 font-bold flex items-center gap-1">
              <Ban className="w-3 h-3 text-rose-500" /> محظور تواصلهم
            </div>
            <div className="text-2xl font-black text-rose-600">
              {stats.blocked}
            </div>
          </div>

          <div className="p-3 bg-cyan-50 rounded-lg shadow-sm border-2 border-cyan-500 flex flex-col justify-center">
            <div className="text-[10px] text-slate-500 mb-1 font-bold flex items-center gap-1">
              <Phone className="w-3 h-3 text-cyan-600" /> تواصل غير محقق
            </div>
            <div className="text-2xl font-black text-cyan-600">
              {stats.unreachable}
            </div>
          </div>
        </div>

        {/* 2. شريط الفلترة والبحث */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-[300px]">
              <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="بحث (كود/اسم/جوال)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-3 pr-8 py-2 border border-slate-300 rounded-md text-xs font-medium outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-all bg-slate-50 focus:bg-white"
              />
            </div>
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="p-2 border border-slate-300 rounded-md text-xs font-bold text-slate-700 outline-none focus:border-blue-500 bg-slate-50"
            >
              <option value="all">كل الأنواع</option>
              <option value="فرد سعودي">فرد سعودي</option>
              <option value="فرد غير سعودي">فرد أجنبي</option>
              <option value="شركة">شركة / مؤسسة</option>
              <option value="جهة حكومية">جهة حكومية</option>
              <option value="ورثة">ورثة</option>
            </select>
            <select
              value={filters.city}
              onChange={(e) => setFilters({ ...filters, city: e.target.value })}
              className="p-2 border border-slate-300 rounded-md text-xs font-bold text-slate-700 outline-none focus:border-blue-500 bg-slate-50"
            >
              <option value="all">كل المدن</option>
              <option value="الرياض">الرياض</option>
              <option value="جدة">جدة</option>
              <option value="الدمام">الدمام</option>
            </select>
            <select
              value={filters.rating}
              onChange={(e) =>
                setFilters({ ...filters, rating: e.target.value })
              }
              className="p-2 border border-slate-300 rounded-md text-xs font-bold text-slate-700 outline-none focus:border-blue-500 bg-slate-50"
            >
              <option value="all">كل التقييمات</option>
              <option value="أ">A</option>
              <option value="ب">B</option>
              <option value="ج">C</option>
              <option value="د">D</option>
            </select>
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
              className="p-2 border border-slate-300 rounded-md text-xs font-bold text-slate-700 outline-none focus:border-blue-500 bg-slate-50"
            >
              <option value="all">كل الحالات</option>
              <option value="active">نشط</option>
              <option value="inactive">موقوف</option>
            </select>

            {(searchTerm ||
              filters.type !== "all" ||
              filters.status !== "all" ||
              filters.city !== "all" ||
              filters.rating !== "all") && (
              <button
                onClick={clearFilters}
                className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors border border-transparent hover:border-red-200"
                title="مسح الفلاتر"
              >
                <FilterX className="w-4 h-4" />
              </button>
            )}

            <div className="flex-1 flex justify-end">
              <button
                onClick={() => refetch()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-xs font-bold cursor-pointer inline-flex items-center gap-1.5 shadow-sm hover:bg-blue-700 transition-all active:scale-95"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`}
                />{" "}
                تحديث
              </button>
            </div>
          </div>
          <div className="text-xs text-slate-500 font-bold">
            إجمالي المطابق:{" "}
            <strong className="text-blue-600">{filteredClients.length}</strong>{" "}
            عميل
          </div>
        </div>

        {/* 3. الجدول الرئيسي (باستخدام Tailwind ليدعم الـ Hover) */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 flex flex-col">
          <div className="overflow-auto custom-scrollbar">
            <table className="w-full text-right border-collapse min-w-[1200px]">
              <thead className="sticky top-0 z-10">
                <tr className="bg-slate-800 border-b border-slate-700 text-white">
                  <th className="p-3 text-center text-[11px] font-bold border-l border-slate-700 whitespace-nowrap">
                    #
                  </th>
                  <th className="p-3 text-right text-[11px] font-bold border-l border-slate-700 whitespace-nowrap">
                    كود العميل
                  </th>
                  <th className="p-3 text-center text-[11px] font-bold border-l border-slate-700 whitespace-nowrap">
                    النوع
                  </th>
                  <th className="p-3 text-right text-[11px] font-bold border-l border-slate-700 whitespace-nowrap">
                    الاسم الرباعي / الجهة
                  </th>
                  <th className="p-3 text-right text-[11px] font-bold border-l border-slate-700 whitespace-nowrap">
                    رقم الهوية / السجل
                  </th>
                  <th className="p-3 text-right text-[11px] font-bold border-l border-slate-700 whitespace-nowrap">
                    الجوال
                  </th>
                  <th className="p-3 text-right text-[11px] font-bold border-l border-slate-700 whitespace-nowrap">
                    المدينة
                  </th>
                  <th className="p-3 text-center text-[11px] font-bold border-l border-slate-700 whitespace-nowrap">
                    التقييم
                  </th>
                  <th className="p-3 text-center text-[11px] font-bold border-l border-slate-700 whitespace-nowrap">
                    الحالة
                  </th>
                  <th className="p-3 text-center text-[11px] font-bold border-l border-slate-700 whitespace-nowrap">
                    الممثل
                  </th>
                  <th className="p-3 text-center text-[11px] font-bold border-l border-slate-700 whitespace-nowrap">
                    الوثائق
                  </th>
                  <th className="p-3 text-center text-[11px] font-bold border-l border-slate-700 whitespace-nowrap">
                    المعاملات
                  </th>
                  <th className="p-3 text-center text-[11px] font-bold border-l border-slate-700 whitespace-nowrap">
                    تاريخ الإضافة
                  </th>
                  <th className="p-3 text-center text-[11px] font-bold whitespace-nowrap w-32">
                    إجراءات
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="14" className="p-16 text-center">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500 mb-3" />
                      <span className="text-slate-500 font-bold">
                        جاري تحميل سجلات العملاء...
                      </span>
                    </td>
                  </tr>
                ) : paginatedClients.length === 0 ? (
                  <tr>
                    <td
                      colSpan="14"
                      className="p-16 text-center text-slate-500 bg-slate-50"
                    >
                      <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <span className="font-bold">
                        لا يوجد عملاء مطابقين لخيارات البحث
                      </span>
                    </td>
                  </tr>
                ) : (
                  paginatedClients.map((client, index) => {
                    const grade = client.grade || "ج";
                    const rep = getRepresentative(client.representative);

                    return (
                      <tr
                        key={client.id}
                        onClick={() => handleRowClick(client)}
                        className="cursor-pointer transition-colors border-b border-slate-200 odd:bg-white even:bg-slate-50 hover:bg-blue-50/60 group"
                      >
                        <td className="p-2.5 text-center text-[11px] text-slate-500 font-mono border-l border-slate-200">
                          {index + 1 + (currentPage - 1) * itemsPerPage}
                        </td>
                        <td className="p-2.5 border-l border-slate-200">
                          <span className="font-mono text-[11px] font-bold text-slate-800">
                            {client.clientCode?.replace("CLT-", "") || "---"}
                          </span>
                        </td>
                        <td className="p-2.5 text-center border-l border-slate-200">
                          <span
                            className={`px-2 py-1 rounded text-[10px] font-bold whitespace-nowrap ${getTypeBadge(client.type)}`}
                          >
                            {client.type || "غير محدد"}
                          </span>
                        </td>
                        <td className="p-2.5 text-[11px] text-slate-800 font-bold border-l border-slate-200 group-hover:text-blue-700 transition-colors">
                          {getFullName(client.name)}
                        </td>
                        <td className="p-2.5 border-l border-slate-200">
                          <span className="font-mono text-[11px] text-slate-600">
                            {client.idNumber ||
                              client.identification?.idNumber ||
                              "---"}
                          </span>
                        </td>
                        <td className="p-2.5 border-l border-slate-200">
                          <span
                            className="font-mono text-[11px] text-slate-600"
                            dir="ltr"
                          >
                            {/* 👈 التعديل هنا: إذا كان يبدأ بكلمة "غير متوفر" نعرضها نظيفة */}
                            {client.mobile?.startsWith("غير متوفر")
                              ? "غير متوفر"
                              : client.mobile ||
                                client.contact?.mobile ||
                                "---"}
                          </span>
                        </td>
                        <td className="p-2.5 text-[11px] text-slate-600 border-l border-slate-200">
                          {client.address?.city || "-"}
                        </td>
                        <td className="p-2.5 text-center border-l border-slate-200">
                          <span
                            className={`inline-block w-6 text-center py-0.5 rounded text-[11px] font-black ${getGradeBadge(grade)}`}
                          >
                            {grade}
                          </span>
                        </td>
                        <td className="p-2.5 text-center border-l border-slate-200">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${client.isActive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}
                          >
                            {client.isActive ? "نشط" : "موقوف"}
                          </span>
                        </td>
                        <td className="p-2.5 text-center border-l border-slate-200">
                          {rep?.hasRepresentative ? (
                            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-[10px] font-bold whitespace-nowrap">
                              له {rep.type || "مفوض"}
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-300">
                              —
                            </span>
                          )}
                        </td>
                        <td className="p-2.5 text-center border-l border-slate-200">
                          <span className="px-2 py-0.5 bg-slate-200 text-slate-700 rounded text-[11px] font-bold font-mono">
                            {client._count?.attachments || 0}
                          </span>
                        </td>
                        <td className="p-2.5 text-center border-l border-slate-200">
                          <span className="text-[12px] font-black text-slate-800 font-mono">
                            {client._count?.transactions || 0}
                          </span>
                        </td>
                        <td className="p-2.5 text-center text-[10px] text-slate-500 font-mono border-l border-slate-200">
                          {formatDate(client.createdAt)}
                        </td>
                        <td className="p-2.5">
                          <div className="flex gap-1.5 justify-center opacity-40 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (onOpenDetails)
                                  onOpenDetails(client.id, client.clientCode);
                              }}
                              title="فتح الملف"
                              className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              title="إنشاء معاملة"
                              onClick={(e) => e.stopPropagation()}
                              className="p-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                            <button
                              title="مراسلة واتساب"
                              onClick={(e) => {
                                e.stopPropagation();
                                openWhatsApp(
                                  client.mobile || client.contact?.mobile,
                                );
                              }}
                              className="p-1.5 bg-green-50 text-green-600 hover:bg-green-600 hover:text-white rounded transition-colors"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => handleDelete(e, client.id)}
                              title="حذف"
                              className="p-1.5 bg-red-50 text-red-500 hover:bg-red-600 hover:text-white rounded transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* 4. شريط الترقيم السفلي */}
          {!isLoading && filteredClients.length > 0 && (
            <div className="bg-slate-50 p-3 flex justify-between items-center border-t border-slate-200">
              <div className="text-[11px] font-bold text-slate-500">
                إظهار {(currentPage - 1) * itemsPerPage + 1} إلى{" "}
                {Math.min(currentPage * itemsPerPage, filteredClients.length)}{" "}
                من {filteredClients.length} سجل
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-md bg-white border border-slate-300 text-slate-700 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 disabled:opacity-50 disabled:pointer-events-none transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <div className="text-[11px] font-bold text-slate-700 px-3 py-1 bg-white border border-slate-300 rounded-md">
                  {currentPage} / {totalPages}
                </div>
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-md bg-white border border-slate-300 text-slate-700 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 disabled:opacity-50 disabled:pointer-events-none transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* اللوحة الجانبية للتفاصيل السريعة */}
      <SidePanel />
    </div>
  );
};

export default ClientsLog;
