import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ChevronRight,
  ExternalLink,
  Plus,
  Settings,
  Lock,
  Pin,
  Pen,
  Trash2,
  LayoutDashboard,
  X,
  CheckCircle2,
  Loader2
} from "lucide-react";
import api from "../api/axios"; // تأكد من مسار الـ axios
import { toast } from "sonner";

// دالة لحساب الوقت المتبقي
const getRemainingTime = (dateString) => {
  if (!dateString) return null;
  const target = new Date(dateString);
  const now = new Date();
  const diff = target - now;

  if (diff <= 0)
    return { text: "منتهي الصلاحية", color: "bg-rose-100 text-rose-700" };

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);

  return {
    text: `متبقي ${days} يوم و ${hours} ساعة`,
    color:
      days < 3
        ? "bg-amber-100 text-amber-700"
        : "bg-emerald-100 text-emerald-700",
  };
};

export default function QuickLinksScreen() {
  const queryClient = useQueryClient();

  // States
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState("usage"); // usage | date
  const [revealedPasswords, setRevealedPasswords] = useState({});
  const [editingLink, setEditingLink] = useState(null);

  // Form States
  const [newCategoryName, setNewCategoryName] = useState("");
  const [customField, setCustomField] = useState({ key: "", value: "" });

  const initialForm = {
    title: "",
    url: "",
    description: "",
    categoryId: "",
    accessLevel: "الموظفين",
    requiresLogin: false,
    loginData: "",
    assignedEmployees: "",
    validUntil: "",
    loginExpiry: "",
    notes: "",
    customFields: [],
  };
  const [formData, setFormData] = useState(initialForm);

  // Queries
  const { data: links = [], isLoading: loadingLinks } = useQuery({
    queryKey: ["quick-links"],
    queryFn: async () => (await api.get("/quick-links")).data.data,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["link-categories"],
    queryFn: async () => (await api.get("/quick-links/categories")).data.data,
  });

  // Mutations
  const saveLinkMutation = useMutation({
    mutationFn: async (data) => {
      // تنظيف البيانات الفارغة للتواريخ
      const payload = { ...data };
      if (!payload.validUntil) delete payload.validUntil;
      if (!payload.loginExpiry) delete payload.loginExpiry;

      if (editingLink)
        return api.put(`/quick-links/${editingLink.id}`, payload);
      return api.post("/quick-links", payload);
    },
    onSuccess: () => {
      toast.success("تم حفظ الرابط بنجاح");
      queryClient.invalidateQueries(["quick-links"]);
      closeLinkModal();
    },
  });

  const deleteLinkMutation = useMutation({
    mutationFn: async (id) => api.delete(`/quick-links/${id}`),
    onSuccess: () => {
      toast.success("تم الحذف");
      queryClient.invalidateQueries(["quick-links"]);
    },
  });

  const togglePinMutation = useMutation({
    mutationFn: async ({ id, isPinned }) =>
      api.put(`/quick-links/${id}`, { isPinned }),
    onSuccess: () => queryClient.invalidateQueries(["quick-links"]),
  });

  const incrementUsageMutation = useMutation({
    mutationFn: async (id) => api.post(`/quick-links/${id}/increment`),
    onSuccess: () => queryClient.invalidateQueries(["quick-links"]),
  });

  const addCategoryMutation = useMutation({
    mutationFn: async (name) => api.post("/quick-links/categories", { name }),
    onSuccess: () => {
      toast.success("تم إضافة التصنيف");
      setNewCategoryName("");
      queryClient.invalidateQueries(["link-categories"]);
    },
    onError: (err) => toast.error(err.response?.data?.message || "خطأ"),
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id) => api.delete(`/quick-links/categories/${id}`),
    onSuccess: () => {
      toast.success("تم الحذف");
      queryClient.invalidateQueries(["link-categories"]);
    },
    onError: (err) => toast.error(err.response?.data?.message || "خطأ"),
  });

  // Logic
  const groupedLinks = useMemo(() => {
    let sorted = [...links];
    if (sortBy === "usage") sorted.sort((a, b) => b.usageCount - a.usageCount);
    if (sortBy === "date")
      sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const groups = {};
    sorted.forEach((link) => {
      const catName = link.category?.name || "بدون تصنيف";
      if (!groups[catName]) groups[catName] = [];
      groups[catName].push(link);
    });
    return groups;
  }, [links, sortBy]);

  const handleOpenLink = (link) => {
    incrementUsageMutation.mutate(link.id);
    window.open(link.url, "_blank");
  };

  const openLinkModal = (link = null) => {
    if (link) {
      setEditingLink(link);
      setFormData({
        ...link,
        validUntil: link.validUntil ? link.validUntil.split("T")[0] : "",
        loginExpiry: link.loginExpiry ? link.loginExpiry.split("T")[0] : "",
        customFields: link.customFields || [],
      });
    } else {
      setEditingLink(null);
      setFormData({ ...initialForm, categoryId: categories[0]?.id || "" });
    }
    setIsLinkModalOpen(true);
  };

  const closeLinkModal = () => {
    setIsLinkModalOpen(false);
    setEditingLink(null);
    setFormData(initialForm);
  };

  const togglePassword = (id) => {
    setRevealedPasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="p-8 space-y-8 font-sans bg-slate-50 min-h-screen" dir="rtl">
      {/* Header */}
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
            <ChevronRight className="w-5 h-5 text-slate-600" />
          </button>
          <h3 className="text-2xl font-black text-slate-900">
            الروابط السريعة
          </h3>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex justify-between items-center flex-wrap gap-4">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <ExternalLink className="w-5 h-5 text-blue-600" /> إدارة الروابط
            </h3>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSortBy("usage")}
                className={`px-4 py-2 rounded-xl text-xs font-bold ${sortBy === "usage" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600"}`}
              >
                ترتيب بالاستخدام
              </button>
              <button
                onClick={() => setSortBy("date")}
                className={`px-4 py-2 rounded-xl text-xs font-bold ${sortBy === "date" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600"}`}
              >
                ترتيب بالتاريخ
              </button>
              <button
                onClick={() => openLinkModal()}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" /> إضافة رابط
              </button>
              <button
                onClick={() => setIsCategoryModalOpen(true)}
                className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl text-xs font-bold flex items-center gap-2"
              >
                <Settings className="w-4 h-4" /> إعدادات التصنيفات
              </button>
            </div>
          </div>

          {/* Tables Grouped by Category */}
          {Object.entries(groupedLinks).map(([categoryName, catLinks]) => (
            <div key={categoryName} className="mb-8">
              <div className="px-6 py-3 bg-slate-100 border-b border-slate-200 font-black text-slate-800 text-sm flex items-center gap-2">
                <div className="w-1 h-5 bg-blue-600 rounded-full"></div>
                {categoryName}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold whitespace-nowrap">
                    <tr>
                      <th className="p-4">#</th>
                      <th className="p-4">اسم الرابط</th>
                      <th className="p-4">الوصف</th>
                      <th className="p-4">مستوى الوصول</th>
                      <th className="p-4">يلزم دخول</th>
                      <th className="p-4">بيانات الدخول</th>
                      <th class="p-4">الموظفون</th>
                      <th className="p-4">الصلاحية</th>
                      <th className="p-4">الإنشاء</th>
                      <th className="p-4">استخدام</th>
                      <th className="p-4">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {catLinks.map((link, index) => {
                      const validity = getRemainingTime(link.validUntil);
                      return (
                        <tr key={link.id} className="hover:bg-slate-50">
                          <td className="p-4 font-bold text-slate-400">
                            {index + 1}
                          </td>
                          <td className="p-4">
                            <button
                              onClick={() => handleOpenLink(link)}
                              className="px-4 py-2 bg-slate-100 text-slate-900 rounded-lg font-bold flex items-center gap-2 hover:bg-blue-50 hover:text-blue-600 transition-colors w-fit"
                            >
                              {link.title} <ExternalLink className="w-3 h-3" />
                            </button>
                          </td>
                          <td
                            className="p-4 text-slate-500 text-[10px] max-w-[150px] truncate"
                            title={link.description}
                          >
                            {link.description || "-"}
                          </td>
                          <td className="p-4 font-bold text-slate-700">
                            {link.accessLevel}
                          </td>
                          <td className="p-4 font-bold text-slate-700">
                            {link.requiresLogin ? "نعم" : "لا"}
                          </td>
                          <td className="p-4">
                            {link.requiresLogin && link.loginData ? (
                              <button
                                onClick={() => togglePassword(link.id)}
                                className="px-3 py-1 bg-rose-50 text-rose-700 rounded-lg font-bold flex items-center gap-2 hover:bg-rose-100"
                              >
                                <Lock className="w-3 h-3" />{" "}
                                {revealedPasswords[link.id]
                                  ? link.loginData
                                  : "*****"}
                              </button>
                            ) : (
                              "-"
                            )}
                          </td>
                          <td className="p-4 font-bold text-slate-700">
                            {link.assignedEmployees || "الكل"}
                          </td>
                          <td className="p-4">
                            {validity ? (
                              <div
                                className={`px-2 py-1 rounded text-[10px] font-black text-center ${validity.color}`}
                              >
                                <div className="flex flex-col gap-0.5">
                                  <span>{link.validUntil.split("T")[0]}</span>
                                  <span className="text-[8px] opacity-80">
                                    {validity.text}
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <div className="px-2 py-1 rounded text-[10px] font-black text-center bg-slate-100 text-slate-600">
                                مفتوح
                              </div>
                            )}
                          </td>
                          <td className="p-4 text-slate-500">
                            <div className="font-bold">{link.createdBy}</div>
                            <div className="text-[9px]">
                              {link.createdAt.split("T")[0]}
                            </div>
                          </td>
                          <td className="p-4 font-black text-slate-900">
                            {link.usageCount}
                          </td>
                          <td className="p-4 flex gap-2">
                            <button
                              onClick={() =>
                                togglePinMutation.mutate({
                                  id: link.id,
                                  isPinned: !link.isPinned,
                                })
                              }
                              className={
                                link.isPinned
                                  ? "text-blue-600"
                                  : "text-slate-400 hover:text-blue-600"
                              }
                            >
                              <Pin className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openLinkModal(link)}
                              className="text-slate-400 hover:text-blue-600"
                            >
                              <Pen className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm("حذف؟"))
                                  deleteLinkMutation.mutate(link.id);
                              }}
                              className="text-slate-400 hover:text-rose-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
          {Object.keys(groupedLinks).length === 0 && (
            <div className="p-10 text-center text-slate-400 font-bold">
              لا توجد روابط مضافة بعد.
            </div>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* Modal: إضافة/تعديل رابط */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 bg-slate-900 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <Plus className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-black">
                  {editingLink ? "تعديل الرابط" : "إضافة رابط سري جديد"}
                </h3>
              </div>
              <button
                onClick={closeLinkModal}
                className="p-2 hover:bg-slate-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8 overflow-y-auto space-y-8 custom-scrollbar">
              <section className="space-y-4">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <LayoutDashboard className="w-4 h-4" /> البيانات الأساسية
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 mr-1">
                      اسم الرابط *
                    </label>
                    <input
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      placeholder="مثلاً: نظام بلدي"
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500/20 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 mr-1">
                      التصنيف *
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={formData.categoryId}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            categoryId: e.target.value,
                          })
                        }
                        className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none"
                      >
                        <option value="">اختر التصنيف...</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => setIsCategoryModalOpen(true)}
                        className="p-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 mr-1">
                    الرابط (URL) *
                  </label>
                  <div className="relative">
                    <ExternalLink className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      value={formData.url}
                      onChange={(e) =>
                        setFormData({ ...formData, url: e.target.value })
                      }
                      dir="ltr"
                      placeholder="https://example.com"
                      className="w-full p-3 pr-10 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none text-left"
                    />
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Lock className="w-4 h-4" /> الوصول والأمان
                </h4>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 mr-1">
                      مستوى الوصول
                    </label>
                    <select
                      value={formData.accessLevel}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          accessLevel: e.target.value,
                        })
                      }
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none"
                    >
                      <option>الإدارة العليا</option>
                      <option>الموظفين</option>
                      <option>الكل</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 mr-1">
                      تاريخ انتهاء الصلاحية
                    </label>
                    <input
                      type="date"
                      value={formData.validUntil}
                      onChange={(e) =>
                        setFormData({ ...formData, validUntil: e.target.value })
                      }
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 mr-1">
                      الموظفون المخولون (فصل بفاصلة)
                    </label>
                    <input
                      type="text"
                      value={formData.assignedEmployees}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          assignedEmployees: e.target.value,
                        })
                      }
                      placeholder="فهد, أحمد..."
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none"
                    />
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div
                      className={`w-10 h-6 rounded-full transition-all relative ${formData.requiresLogin ? "bg-blue-600" : "bg-slate-300"}`}
                    >
                      <div
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.requiresLogin ? "left-1" : "right-1"}`}
                      ></div>
                    </div>
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={formData.requiresLogin}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          requiresLogin: e.target.checked,
                        })
                      }
                    />
                    <span className="text-sm font-black text-slate-700">
                      تفعيل حماية بيانات الدخول (يوزر/باسوورد)
                    </span>
                  </label>
                  {formData.requiresLogin && (
                    <input
                      type="text"
                      value={formData.loginData}
                      onChange={(e) =>
                        setFormData({ ...formData, loginData: e.target.value })
                      }
                      placeholder="بيانات الدخول (مثال: admin / 12345)"
                      className="w-full p-3 border rounded-xl text-sm font-bold outline-none"
                    />
                  )}
                </div>
              </section>

              <section className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 mr-1">
                  وصف / ملاحظات
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="أي ملاحظات تظهر أسفل الرابط..."
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none min-h-[80px] resize-none"
                ></textarea>
              </section>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-200 flex gap-4 shrink-0">
              <button
                onClick={() => saveLinkMutation.mutate(formData)}
                disabled={
                  saveLinkMutation.isPending ||
                  !formData.title ||
                  !formData.url ||
                  !formData.categoryId
                }
                className="flex-1 p-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {saveLinkMutation.isPending ? (
                  <Loader2 className="animate-spin w-5 h-5" />
                ) : (
                  <CheckCircle2 className="w-5 h-5" />
                )}{" "}
                حفظ الرابط
              </button>
              <button
                onClick={closeLinkModal}
                className="px-8 p-4 bg-white text-slate-600 border border-slate-200 rounded-2xl font-black hover:bg-slate-50 transition-all"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* Modal: إدارة التصنيفات */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-[110] flex items-center justify-center p-4">
          <div
            className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm p-8 space-y-6"
            dir="rtl"
          >
            <h3 className="text-xl font-black flex items-center gap-2">
              <Settings className="w-5 h-5 text-blue-600" /> إدارة التصنيفات
            </h3>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar-slim">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100"
                >
                  <span className="font-bold text-sm">{cat.name}</span>
                  <button
                    onClick={() => deleteCategoryMutation.mutate(cat.id)}
                    className="text-rose-400 hover:text-rose-600 bg-white p-1.5 rounded-lg shadow-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {categories.length === 0 && (
                <div className="text-center text-xs text-slate-400 font-bold py-4">
                  لا توجد تصنيفات.
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <input
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="تصنيف جديد..."
                className="flex-1 p-3 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-blue-500 bg-slate-50"
                type="text"
              />
              <button
                onClick={() => addCategoryMutation.mutate(newCategoryName)}
                disabled={
                  !newCategoryName.trim() || addCategoryMutation.isPending
                }
                className="p-3 bg-blue-600 text-white rounded-xl disabled:opacity-50"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            <button
              onClick={() => setIsCategoryModalOpen(false)}
              className="w-full p-3 bg-slate-900 text-white rounded-xl font-black hover:bg-slate-800"
            >
              إغلاق
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
