import React, { useState, useEffect } from "react";
import api from "../../api/axios"; // استيراد الـ API Instance
import {
  Building2,
  Plus,
  Search,
  Clock,
  Banknote,
  ListChecks,
  Pencil,
  Trash2,
  Loader2,
} from "lucide-react";
import CreateServiceForm from "./CreateServiceForm";

export default function OfficeServicesScreen() {
  const [services, setServices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // حالات المودال (إضافة / تعديل)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);

  // جلب البيانات من الـ API
  const fetchServices = async () => {
    setIsLoading(true);
    try {
      // استخدام الـ API بدلاً من axios مباشرة
      const res = await api.get("/services");
      // تأكد أن هيكل البيانات في الـ response يتناسب مع ما تتوقعه (res.data أو res.data.data)
      setServices(Array.isArray(res.data) ? res.data : res.data.data || []);
    } catch (error) {
      console.error("Error fetching services:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  // الحذف
  const handleDelete = async (id) => {
    if (!window.confirm("هل أنت متأكد من حذف هذه الخدمة نهائياً؟")) return;
    try {
      await api.delete(`/services/${id}`);
      fetchServices(); // تحديث القائمة بعد الحذف
    } catch (error) {
      console.error("Error deleting service:", error);
      alert("فشل الحذف، حاول مجدداً");
    }
  };

  // فتح مودال التعديل
  const openEditModal = (service) => {
    setEditingService(service);
    setIsModalOpen(true);
  };

  // فتح مودال الإضافة
  const openCreateModal = () => {
    setEditingService(null);
    setIsModalOpen(true);
  };

  // تجميع البيانات حسب التصنيف (Category)
  const groupedServices = services.reduce((acc, curr) => {
    const cat = curr.mainCategory || "غير مصنف";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(curr);
    return acc;
  }, {});

  const filteredGroups = Object.keys(groupedServices).reduce((acc, cat) => {
    const filtered = groupedServices[cat].filter(
      (s) =>
        s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.code?.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    if (filtered.length > 0) acc[cat] = filtered;
    return acc;
  }, {});

  const activeCount = services.filter((s) => s.isActive).length;
  const privateCount = services.filter(
    (s) => s.visibility === "private",
  ).length;

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-slate-50 font-sans" dir="rtl">
      {/* ---------------- Sidebar ---------------- */}
      <div className="w-80 lg:w-96 border-l border-slate-200 bg-white flex flex-col shrink-0 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.05)] z-30 relative">
        <div className="p-6 border-b border-slate-100 space-y-5 bg-white/95 backdrop-blur-sm sticky top-0 z-20">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-500" /> الخدمات
              </h2>
              <p className="text-[11px] text-slate-500 font-bold mt-1">
                إدارة باقات وبطاقات خدمات المكتب
              </p>
            </div>
            <button
              onClick={openCreateModal}
              className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm hover:shadow-md border border-indigo-100"
              title="إضافة خدمة جديدة"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          <div className="flex gap-2 text-[10px] font-black text-slate-600 bg-slate-50 border border-slate-100 p-1.5 rounded-2xl shadow-inner">
            <div className="flex-1 text-center py-1.5 bg-white rounded-xl shadow-sm border border-slate-100">
              <span className="text-lg block text-indigo-700 leading-none mb-1">
                {services.length}
              </span>{" "}
              الإجمالي
            </div>
            <div className="flex-1 text-center py-1.5 bg-white rounded-xl shadow-sm border border-slate-100">
              <span className="text-lg block text-emerald-600 leading-none mb-1">
                {activeCount}
              </span>{" "}
              نشطة
            </div>
            <div className="flex-1 text-center py-1.5 bg-white rounded-xl shadow-sm border border-slate-100">
              <span className="text-lg block text-amber-500 leading-none mb-1">
                {privateCount}
              </span>{" "}
              داخلية
            </div>
          </div>

          <div className="relative group">
            <Search className="w-4 h-4 text-slate-400 absolute right-4 top-3.5 group-focus-within:text-indigo-500 transition-colors" />
            <input
              placeholder="البحث بالاسم أو الكود..."
              className="w-full bg-slate-50/50 border-2 border-slate-200 rounded-2xl pr-11 pl-4 py-3 text-xs outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 font-bold text-slate-700 transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* ---------------- Main Content ---------------- */}
      <div className="flex-1 overflow-y-auto p-4 space-y-8 custom-scrollbar bg-slate-50/30">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
          </div>
        ) : Object.keys(filteredGroups).length === 0 ? (
          <div className="flex flex-col items-center justify-center text-slate-400 h-full">
            <Building2 className="w-16 h-16 opacity-20 mb-4" />
            <h3 className="font-bold">لا توجد خدمات مطابقة للبحث</h3>
          </div>
        ) : (
          Object.keys(filteredGroups).map((category, index) => (
            <div key={index} className="space-y-3">
              <h3 className="text-[11px] font-black text-slate-400 uppercase sticky top-0 bg-white/90 backdrop-blur-sm py-1.5 z-10 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slate-200"></span>
                {category}
              </h3>

              {filteredGroups[category].map((item) => (
                <div
                  key={item.id}
                  className="relative p-5 rounded-3xl border-2 transition-all duration-300 group overflow-hidden border-slate-200/60 hover:border-indigo-300 hover:shadow-lg bg-white shadow-sm"
                >
                  <div className="absolute top-4 left-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                    <button
                      onClick={() => openEditModal(item)}
                      className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-600 hover:text-white transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="absolute top-0 right-0 w-1.5 h-full transition-colors bg-transparent group-hover:bg-indigo-200"></div>

                  <div className="flex justify-between items-start mb-2.5">
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-3 h-3 mt-1 shrink-0 rounded-full ring-2 ring-white shadow-sm ${item.isActive ? "bg-emerald-500" : "bg-slate-300"}`}
                      />
                      <div>
                        <h3 className="text-sm font-black transition-colors leading-snug pr-2 text-slate-800 group-hover:text-indigo-700">
                          {item.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="inline-flex items-center text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200 font-mono font-black">
                            {item.code}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] line-clamp-2 my-4 font-bold leading-relaxed text-slate-500">
                    {item.description || "لا يوجد وصف"}
                  </p>

                  <div className="flex flex-wrap gap-2 mt-auto border-t border-slate-100/80 pt-4">
                    <span className="flex items-center gap-1.5 bg-slate-50 text-slate-700 px-2.5 py-1.5 rounded-xl text-[10px] font-black border">
                      <Clock className="w-3.5 h-3.5" /> {item.duration} يوم
                    </span>
                    <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 px-2.5 py-1.5 rounded-xl text-[10px] font-black border">
                      <Banknote className="w-3.5 h-3.5" /> {item.price} ر.س
                    </span>
                    <span className="flex items-center gap-1.5 bg-blue-50 text-blue-800 px-2.5 py-1.5 rounded-xl text-[10px] font-black border">
                      <ListChecks className="w-3.5 h-3.5" />{" "}
                      {item.stages?.length || 0} مراحل
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
      </div>

      {/* ================= مودل الإضافة/التعديل ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-4xl max-h-[95vh] overflow-y-auto bg-slate-50 rounded-3xl shadow-2xl border border-slate-200 custom-scrollbar">
            <CreateServiceForm
              initialData={editingService}
              onClose={() => setIsModalOpen(false)}
              onSuccess={fetchServices} // تحديث القائمة بعد الحفظ
            />
          </div>
        </div>
      )}
    </div>
  );
}
