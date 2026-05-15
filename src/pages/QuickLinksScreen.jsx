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
  AlertCircle,
  ArrowUp,
  ArrowDown,
  X,
  Link2,
  ShieldCheck,
  CalendarDays,
  Activity,
} from "lucide-react";
import api from "../api/axios";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";

const getRemainingTime = (dateString) => {
  if (!dateString) return null;

  const target = new Date(dateString);
  const now = new Date();
  const diff = target - now;

  if (diff <= 0) {
    return {
      text: "منتهي الصلاحية",
      color: "bg-rose-50 text-rose-700 border-rose-200",
    };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  return {
    text: `متبقي ${days} يوم`,
    color:
      days < 3
        ? "bg-amber-50 text-amber-700 border-amber-200"
        : "bg-emerald-50 text-emerald-700 border-emerald-200",
  };
};

const getDaysSince = (dateString) => {
  if (!dateString) return "";

  const diff = new Date() - new Date(dateString);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return "اليوم";
  if (days === 1) return "أمس";

  return `منذ ${days} يوم`;
};

const getImportanceBadge = (imp) => {
  if (imp === "عالي الأهمية") {
    return "bg-rose-50 text-rose-700 border-rose-200";
  }

  if (imp === "متوسط") {
    return "bg-amber-50 text-amber-700 border-amber-200";
  }

  return "bg-cyan-50 text-cyan-700 border-cyan-200";
};

export default function QuickLinksScreen() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const currentUser = user?.name || "موظف النظام";

  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState("usage");
  const [revealedPasswords, setRevealedPasswords] = useState({});
  const [editingLink, setEditingLink] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState("");

  const initialForm = {
    title: "",
    url: "",
    description: "",
    categoryId: "",
    accessLevel: "الموظفين",
    requiresLogin: false,
    loginData: "",
    assignedEmployees: "",
    hasInfiniteExpiry: false,
    validUntil: "",
    loginExpiry: "",
    importance: "عادي",
    notes: "",
  };

  const [formData, setFormData] = useState(initialForm);

  const { data: links = [] } = useQuery({
    queryKey: ["quick-links"],
    queryFn: async () => (await api.get("/quick-links")).data.data,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["link-categories"],
    queryFn: async () => (await api.get("/quick-links/categories")).data.data,
  });

  const saveLinkMutation = useMutation({
    mutationFn: async (data) => {
      const payload = { ...data };

      if (payload.hasInfiniteExpiry) {
        payload.validUntil = null;
      }

      if (editingLink) {
        payload.updatedBy = currentUser;
        return api.put(`/quick-links/${editingLink.id}`, payload);
      }

      payload.createdBy = currentUser;
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
      api.put(`/quick-links/${id}`, { isPinned, updatedBy: currentUser }),
    onSuccess: () => queryClient.invalidateQueries(["quick-links"]),
  });

  const reorderLinksMutation = useMutation({
    mutationFn: async (data) => api.post("/quick-links/reorder", data),
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
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id) => api.delete(`/quick-links/categories/${id}`),
    onSuccess: () => {
      toast.success("تم الحذف");
      queryClient.invalidateQueries(["link-categories"]);
    },
  });

  const groupedLinks = useMemo(() => {
    const sorted = [...links];

    if (sortBy === "usage") {
      sorted.sort((a, b) => {
        if (a.isPinned && b.isPinned) return a.pinOrder - b.pinOrder;
        if (a.isPinned) return -1;
        if (b.isPinned) return 1;
        return b.usageCount - a.usageCount;
      });
    }

    if (sortBy === "date") {
      sorted.sort((a, b) => {
        if (a.isPinned && b.isPinned) return a.pinOrder - b.pinOrder;
        if (a.isPinned) return -1;
        if (b.isPinned) return 1;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
    }

    const groups = {};

    sorted.forEach((link) => {
      const catName = link.category?.name || "بدون تصنيف";

      if (!groups[catName]) {
        groups[catName] = [];
      }

      groups[catName].push(link);
    });

    return groups;
  }, [links, sortBy]);

  const handleOpenLink = (link) => {
    incrementUsageMutation.mutate(link.id);
    window.open(link.url, "_blank");
  };

  const handlePinToggle = (link) => {
    const pinnedCount = links.filter((l) => l.isPinned).length;

    if (!link.isPinned && pinnedCount >= 10) {
      return toast.error("لا يمكن تثبيت أكثر من 10 روابط (الحد الأقصى).");
    }

    togglePinMutation.mutate({ id: link.id, isPinned: !link.isPinned });
  };

  const handleMovePinned = (catLinks, index, direction) => {
    const pinnedOnly = catLinks.filter((l) => l.isPinned);

    const globalIndex = pinnedOnly.findIndex(
      (l) => l.id === catLinks[index].id,
    );

    if (direction === "up" && globalIndex > 0) {
      reorderLinksMutation.mutate({
        link1Id: pinnedOnly[globalIndex].id,
        link1Order: pinnedOnly[globalIndex - 1].pinOrder || 0,
        link2Id: pinnedOnly[globalIndex - 1].id,
        link2Order: pinnedOnly[globalIndex].pinOrder || 0,
      });
    } else if (direction === "down" && globalIndex < pinnedOnly.length - 1) {
      reorderLinksMutation.mutate({
        link1Id: pinnedOnly[globalIndex].id,
        link1Order: pinnedOnly[globalIndex + 1].pinOrder || 0,
        link2Id: pinnedOnly[globalIndex + 1].id,
        link2Order: pinnedOnly[globalIndex].pinOrder || 0,
      });
    }
  };

  const openLinkModal = (link = null) => {
    if (link) {
      setEditingLink(link);
      setFormData({
        ...link,
        hasInfiniteExpiry: !link.validUntil,
        validUntil: link.validUntil ? link.validUntil.split("T")[0] : "",
        loginExpiry: link.loginExpiry ? link.loginExpiry.split("T")[0] : "",
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
    <div
      className="
        min-h-screen space-y-5 overflow-hidden
        bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white
        p-4 font-sans md:p-6
      "
      dir="rtl"
    >
      {/* Header */}
      <div
        className="
          relative overflow-hidden rounded-[26px]
          border border-[#c5983c]/25
          bg-gradient-to-l from-[#08111c] via-[#0f3448] to-[#123f59]
          p-4 shadow-[0_20px_55px_rgba(18,63,89,0.22)]
        "
      >
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute right-[-70px] top-[-70px] h-44 w-44 rounded-full bg-[#c5983c]/18 blur-3xl" />
          <div className="absolute left-[-80px] bottom-[-80px] h-52 w-52 rounded-full bg-cyan-400/12 blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <button
              className="
                grid h-11 w-11 place-items-center rounded-2xl
                border border-white/15 bg-white/10 text-[#e2bf74]
                transition hover:bg-white/15
              "
              type="button"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span
                  className="
                    grid h-9 w-9 place-items-center rounded-2xl
                    bg-[#e2bf74] text-[#123f59] shadow-sm
                  "
                >
                  <Link2 className="h-4 w-4" />
                </span>

                <h3 className="text-xl font-black text-white">
                  الروابط السريعة
                </h3>
              </div>

              <p className="mt-1 text-xs font-bold text-white/55">
                إدارة روابط الأنظمة والمنصات المهمة مع الصلاحيات وبيانات الدخول.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSortBy("usage")}
              className={`rounded-2xl border px-4 py-2 text-xs font-black transition-all ${
                sortBy === "usage"
                  ? "border-[#e2bf74]/45 bg-[#e2bf74] text-[#123f59] shadow-[0_10px_24px_rgba(226,191,116,0.20)]"
                  : "border-white/15 bg-white/10 text-white hover:bg-white/15"
              }`}
              type="button"
            >
              الأكثر استخداماً
            </button>

            <button
              onClick={() => setSortBy("date")}
              className={`rounded-2xl border px-4 py-2 text-xs font-black transition-all ${
                sortBy === "date"
                  ? "border-[#e2bf74]/45 bg-[#e2bf74] text-[#123f59] shadow-[0_10px_24px_rgba(226,191,116,0.20)]"
                  : "border-white/15 bg-white/10 text-white hover:bg-white/15"
              }`}
              type="button"
            >
              الأحدث
            </button>

            <button
              onClick={() => openLinkModal()}
              className="
                flex items-center gap-2 rounded-2xl
                bg-white px-4 py-2 text-xs font-black text-[#123f59]
                shadow-[0_12px_30px_rgba(255,255,255,0.16)]
                transition hover:-translate-y-[1px] hover:bg-[#fbf8f1]
              "
              type="button"
            >
              <Plus className="h-4 w-4 text-[#c5983c]" />
              رابط جديد
            </button>

            <button
              onClick={() => setIsCategoryModalOpen(true)}
              className="
                grid h-10 w-10 place-items-center rounded-2xl
                border border-white/15 bg-white/10 text-[#e2bf74]
                transition hover:bg-white/15
              "
              type="button"
              title="إدارة التصنيفات"
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Tables Grouped by Category */}
      <div
        className="
          overflow-hidden rounded-[26px] border border-[#d8b46a]/30
          bg-white shadow-[0_18px_45px_rgba(18,63,89,0.10)]
        "
      >
        {Object.entries(groupedLinks).map(
          ([categoryName, catLinks], catIdx) => (
            <div
              key={categoryName}
              className={catIdx !== 0 ? "border-t-4 border-[#f8efe0]" : ""}
            >
              <div
                className="
                  flex items-center justify-between gap-3
                  border-b border-[#e8ddc8]
                  bg-gradient-to-l from-[#f8efe0] via-white to-[#eef7f6]
                  px-4 py-3
                "
              >
                <div className="flex items-center gap-2">
                  <span className="h-6 w-1.5 rounded-full bg-[#c5983c]" />
                  <div>
                    <div className="text-sm font-black text-[#123f59]">
                      {categoryName}
                    </div>
                    <div className="text-[10px] font-bold text-[#64748b]">
                      {catLinks.length} رابط داخل هذا التصنيف
                    </div>
                  </div>
                </div>

                <span
                  className="
                    rounded-2xl border border-[#c5983c]/25
                    bg-white px-3 py-1 text-[10px]
                    font-black text-[#123f59]
                  "
                >
                  Quick Links
                </span>
              </div>

              <div className="overflow-x-auto custom-scrollbar-slim">
                <table className="w-full min-w-[1100px] text-right text-[11px]">
                  <thead
                    className="
                      bg-[#0f3448] text-[10px]
                      font-black text-white
                    "
                  >
                    <tr>
                      <th className="border-l border-white/10 px-3 py-3">
                        الرابط
                      </th>
                      <th className="border-l border-white/10 px-3 py-3">
                        الأهمية
                      </th>
                      <th className="border-l border-white/10 px-3 py-3">
                        مستوى الوصول
                      </th>
                      <th className="border-l border-white/10 px-3 py-3">
                        الدخول/الباسوورد
                      </th>
                      <th className="border-l border-white/10 px-3 py-3">
                        الصلاحية
                      </th>
                      <th className="border-l border-white/10 px-3 py-3">
                        الإنشاء
                      </th>
                      <th className="border-l border-white/10 px-3 py-3">
                        آخر تعديل
                      </th>
                      <th className="border-l border-white/10 px-3 py-3 text-center">
                        استخدام
                      </th>
                      <th className="px-3 py-3 text-center">إجراءات</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-[#e8ddc8]/70">
                    {catLinks.map((link, index) => {
                      const validity = link.validUntil
                        ? getRemainingTime(link.validUntil)
                        : null;

                      return (
                        <tr
                          key={link.id}
                          className={`transition-colors hover:bg-cyan-50/45 ${
                            link.isPinned ? "bg-[#fff7ed]" : "bg-white"
                          }`}
                        >
                          <td className="border-l border-[#e8ddc8]/70 px-3 py-2.5">
                            <button
                              onClick={() => handleOpenLink(link)}
                              className="
                                flex w-fit items-center gap-1.5 rounded-xl
                                border border-[#d8b46a]/35
                                bg-[#fbf8f1] px-3 py-1.5
                                text-[11px] font-black text-[#123f59]
                                shadow-sm transition-all
                                hover:-translate-y-[1px] hover:bg-[#123f59] hover:text-white
                              "
                              type="button"
                            >
                              {link.title}
                              <ExternalLink className="h-3 w-3" />
                            </button>
                          </td>

                          <td className="border-l border-[#e8ddc8]/70 px-3 py-2.5">
                            <span
                              className={`rounded-xl border px-2 py-1 text-[10px] font-black ${getImportanceBadge(
                                link.importance,
                              )}`}
                            >
                              {link.importance}
                            </span>
                          </td>

                          <td className="border-l border-[#e8ddc8]/70 px-3 py-2.5 font-black text-[#334155]">
                            {link.accessLevel}

                            {link.assignedEmployees && (
                              <div className="mt-0.5 max-w-[110px] truncate text-[9px] font-bold text-[#64748b]">
                                {link.assignedEmployees}
                              </div>
                            )}
                          </td>

                          <td className="border-l border-[#e8ddc8]/70 px-3 py-2.5">
                            {link.requiresLogin ? (
                              <button
                                onClick={() => togglePassword(link.id)}
                                className="
                                  flex items-center gap-1.5 rounded-xl
                                  border border-rose-200 bg-rose-50
                                  px-2.5 py-1 text-[10px]
                                  font-black text-rose-700
                                  transition hover:bg-rose-100
                                "
                                type="button"
                              >
                                <Lock className="h-3 w-3" />
                                {revealedPasswords[link.id]
                                  ? link.loginData
                                  : "*****"}
                              </button>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>

                          <td className="border-l border-[#e8ddc8]/70 px-3 py-2.5">
                            {validity ? (
                              <div
                                className={`inline-block rounded-xl border px-2 py-1 text-[9px] font-black ${validity.color}`}
                              >
                                <span className="block">
                                  {link.validUntil?.split("T")[0]}
                                </span>

                                <span className="mt-0.5 block opacity-80">
                                  {validity.text}
                                </span>
                              </div>
                            ) : (
                              <span
                                className="
                                  rounded-xl border border-[#d8b46a]/30
                                  bg-[#f8efe0] px-2 py-1
                                  text-[9px] font-black text-[#123f59]
                                "
                              >
                                غير محدد
                              </span>
                            )}
                          </td>

                          <td className="border-l border-[#e8ddc8]/70 px-3 py-2.5 text-[#334155]">
                            <div className="text-[10px] font-black">
                              {link.createdBy}
                            </div>

                            <div className="font-mono text-[9px] font-bold">
                              {link.createdAt?.split("T")[0]}
                            </div>

                            <div className="mt-0.5 w-max rounded-lg bg-cyan-50 px-1.5 py-0.5 text-[8.5px] font-black text-cyan-700">
                              {getDaysSince(link.createdAt)}
                            </div>
                          </td>

                          <td className="border-l border-[#e8ddc8]/70 px-3 py-2.5 text-[#334155]">
                            <div className="text-[10px] font-black">
                              {link.updatedBy}
                            </div>

                            <div className="font-mono text-[9px] font-bold">
                              {link.updatedAt?.split("T")[0]}
                            </div>

                            <div className="mt-0.5 w-max rounded-lg bg-emerald-50 px-1.5 py-0.5 text-[8.5px] font-black text-emerald-700">
                              {getDaysSince(link.updatedAt)}
                            </div>
                          </td>

                          <td className="border-l border-[#e8ddc8]/70 px-3 py-2.5 text-center">
                            <span
                              className="
                                inline-flex items-center gap-1 rounded-xl
                                bg-[#123f59] px-2 py-1
                                font-mono text-[10px] font-black text-white
                              "
                            >
                              <Activity className="h-3 w-3 text-[#e2bf74]" />
                              {link.usageCount}
                            </span>
                          </td>

                          <td className="px-3 py-2.5 text-center">
                            <div className="flex items-center justify-center gap-1">
                              {link.isPinned && sortBy === "usage" && (
                                <div className="ml-1 mr-2 flex flex-col gap-0.5">
                                  <button
                                    onClick={() =>
                                      handleMovePinned(catLinks, index, "up")
                                    }
                                    className="
                                      rounded-lg bg-[#f8efe0] p-0.5
                                      text-[#64748b] transition
                                      hover:text-[#123f59]
                                    "
                                    type="button"
                                  >
                                    <ArrowUp className="h-3 w-3" />
                                  </button>

                                  <button
                                    onClick={() =>
                                      handleMovePinned(catLinks, index, "down")
                                    }
                                    className="
                                      rounded-lg bg-[#f8efe0] p-0.5
                                      text-[#64748b] transition
                                      hover:text-[#123f59]
                                    "
                                    type="button"
                                  >
                                    <ArrowDown className="h-3 w-3" />
                                  </button>
                                </div>
                              )}

                              <button
                                onClick={() => handlePinToggle(link)}
                                className={`rounded-xl p-1.5 transition-colors ${
                                  link.isPinned
                                    ? "bg-amber-50 text-amber-600"
                                    : "text-slate-400 hover:bg-[#f8efe0] hover:text-[#c5983c]"
                                }`}
                                title={
                                  link.isPinned
                                    ? "إلغاء التثبيت"
                                    : "تثبيت في الأعلى"
                                }
                                type="button"
                              >
                                <Pin className="h-3.5 w-3.5" />
                              </button>

                              <button
                                onClick={() => openLinkModal(link)}
                                className="
                                  rounded-xl p-1.5 text-slate-400
                                  transition-colors hover:bg-cyan-50 hover:text-cyan-700
                                "
                                type="button"
                              >
                                <Pen className="h-3.5 w-3.5" />
                              </button>

                              <button
                                onClick={() => {
                                  if (window.confirm("حذف؟")) {
                                    deleteLinkMutation.mutate(link.id);
                                  }
                                }}
                                className="
                                  rounded-xl p-1.5 text-slate-400
                                  transition-colors hover:bg-rose-50 hover:text-rose-600
                                "
                                type="button"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ),
        )}

        {Object.keys(groupedLinks).length === 0 && (
          <div className="p-12 text-center">
            <div
              className="
                mx-auto mb-3 grid h-16 w-16 place-items-center
                rounded-3xl border border-[#d8b46a]/35
                bg-[#f8efe0] text-[#c5983c]
              "
            >
              <AlertCircle className="h-8 w-8" />
            </div>

            <p className="text-sm font-black text-[#123f59]">
              لا توجد روابط مضافة بعد.
            </p>
          </div>
        )}
      </div>

      {/* Modal: إضافة/تعديل رابط */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/65 p-4 backdrop-blur-sm">
          <div
            className="
              flex max-h-[90vh] w-full max-w-2xl flex-col
              overflow-hidden rounded-[28px] bg-white
              shadow-[0_28px_80px_rgba(15,23,42,0.34)]
            "
          >
            <div className="shrink-0 bg-gradient-to-l from-[#08111c] via-[#0f3448] to-[#123f59] px-5 py-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="grid h-9 w-9 place-items-center rounded-2xl bg-[#e2bf74] text-[#123f59]">
                    <Plus className="h-4 w-4" />
                  </span>

                  <h3 className="text-sm font-black">
                    {editingLink
                      ? "تعديل بيانات الرابط"
                      : "إضافة رابط سريع جديد"}
                  </h3>
                </div>

                <button
                  onClick={closeLinkModal}
                  className="grid h-8 w-8 place-items-center rounded-2xl bg-white/10 transition hover:bg-white/15"
                  type="button"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="custom-scrollbar-slim space-y-6 overflow-y-auto p-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-[#123f59]">
                    اسم الرابط *
                  </label>

                  <input
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="نظام بلدي..."
                    className="
                      w-full rounded-xl border border-[#d8b46a]/35
                      p-2.5 text-xs font-bold outline-none
                      focus:border-[#c5983c] focus:ring-4 focus:ring-[#c5983c]/10
                    "
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-[#123f59]">
                    التصنيف *
                  </label>

                  <select
                    value={formData.categoryId}
                    onChange={(e) =>
                      setFormData({ ...formData, categoryId: e.target.value })
                    }
                    className="
                      w-full rounded-xl border border-[#d8b46a]/35
                      bg-white p-2.5 text-xs font-bold outline-none
                    "
                  >
                    <option value="">اختر...</option>

                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2 space-y-1">
                  <label className="text-[10px] font-black text-[#123f59]">
                    الرابط (URL) *
                  </label>

                  <input
                    value={formData.url}
                    onChange={(e) =>
                      setFormData({ ...formData, url: e.target.value })
                    }
                    dir="ltr"
                    placeholder="https://..."
                    className="
                      w-full rounded-xl border border-[#d8b46a]/35
                      p-2.5 text-left font-mono text-xs font-bold
                      outline-none focus:border-[#c5983c]
                      focus:ring-4 focus:ring-[#c5983c]/10
                    "
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 border-t border-[#e8ddc8] pt-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-[#123f59]">
                    الأهمية
                  </label>

                  <select
                    value={formData.importance}
                    onChange={(e) =>
                      setFormData({ ...formData, importance: e.target.value })
                    }
                    className="
                      w-full rounded-xl border border-[#d8b46a]/35
                      bg-white p-2.5 text-xs font-bold outline-none
                    "
                  >
                    <option value="عادي">عادي</option>
                    <option value="متوسط">متوسط</option>
                    <option value="عالي الأهمية">عالي الأهمية</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-[#123f59]">
                    مستوى الوصول
                  </label>

                  <select
                    value={formData.accessLevel}
                    onChange={(e) =>
                      setFormData({ ...formData, accessLevel: e.target.value })
                    }
                    className="
                      w-full rounded-xl border border-[#d8b46a]/35
                      bg-white p-2.5 text-xs font-bold outline-none
                    "
                  >
                    <option>الإدارة العليا</option>
                    <option>الموظفين</option>
                    <option>الكل</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-[#123f59]">
                    تاريخ الانتهاء
                  </label>

                  <label className="mb-1 mt-1 flex cursor-pointer items-center gap-1">
                    <input
                      type="checkbox"
                      className="accent-[#123f59]"
                      checked={formData.hasInfiniteExpiry}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          hasInfiniteExpiry: e.target.checked,
                          validUntil: "",
                        })
                      }
                    />

                    <span className="text-[9px] font-black text-[#123f59]">
                      غير محدد
                    </span>
                  </label>

                  <input
                    type="date"
                    disabled={formData.hasInfiniteExpiry}
                    value={formData.validUntil}
                    onChange={(e) =>
                      setFormData({ ...formData, validUntil: e.target.value })
                    }
                    className="
                      w-full rounded-xl border border-[#d8b46a]/35
                      p-2 text-xs font-bold outline-none
                      disabled:bg-slate-100 disabled:text-slate-400
                    "
                  />
                </div>
              </div>

              <div className="space-y-3 rounded-2xl border border-[#d8b46a]/35 bg-[#fbf8f1] p-4">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-[#123f59]"
                    checked={formData.requiresLogin}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        requiresLogin: e.target.checked,
                      })
                    }
                  />

                  <span className="text-xs font-black text-[#123f59]">
                    تفعيل حماية بيانات الدخول
                  </span>
                </label>

                {formData.requiresLogin && (
                  <input
                    type="text"
                    value={formData.loginData}
                    onChange={(e) =>
                      setFormData({ ...formData, loginData: e.target.value })
                    }
                    placeholder="بيانات الدخول..."
                    className="
                      w-full rounded-xl border border-[#d8b46a]/35
                      p-2.5 text-xs font-bold outline-none
                    "
                  />
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-[#123f59]">
                  وصف / ملاحظات
                </label>

                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="
                    min-h-[70px] w-full resize-none rounded-2xl
                    border border-[#d8b46a]/35 p-3
                    text-xs font-bold outline-none
                    focus:border-[#c5983c]
                    focus:ring-4 focus:ring-[#c5983c]/10
                  "
                />
              </div>
            </div>

            <div className="flex shrink-0 justify-end gap-2 border-t border-[#e8ddc8] bg-[#fbf8f1] p-4">
              <button
                onClick={closeLinkModal}
                className="
                  rounded-xl border border-[#d8b46a]/35
                  bg-white px-6 py-2 text-xs font-black
                  text-[#64748b] transition hover:bg-[#f8efe0]
                "
                type="button"
              >
                إلغاء
              </button>

              <button
                onClick={() => saveLinkMutation.mutate(formData)}
                disabled={
                  saveLinkMutation.isPending ||
                  !formData.title ||
                  !formData.url ||
                  !formData.categoryId
                }
                className="
                  rounded-xl bg-[#123f59] px-8 py-2
                  text-xs font-black text-white shadow-sm
                  transition hover:bg-[#0f3448]
                  disabled:opacity-50
                "
                type="button"
              >
                {saveLinkMutation.isPending ? "جاري الحفظ..." : "حفظ الرابط"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: إدارة التصنيفات */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm">
          <div
            className="
              w-full max-w-xs overflow-hidden rounded-[26px]
              bg-white shadow-[0_24px_70px_rgba(15,23,42,0.30)]
            "
            dir="rtl"
          >
            <div className="bg-gradient-to-l from-[#08111c] via-[#0f3448] to-[#123f59] px-5 py-4 text-white">
              <h3 className="flex items-center gap-2 text-sm font-black">
                <Settings className="h-4 w-4 text-[#e2bf74]" />
                التصنيفات
              </h3>
            </div>

            <div className="space-y-4 p-5">
              <div className="custom-scrollbar-slim max-h-48 space-y-2 overflow-y-auto pr-1">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="
                      flex items-center justify-between rounded-2xl
                      border border-[#d8b46a]/25
                      bg-[#fbf8f1] p-2.5
                    "
                  >
                    <span className="text-xs font-black text-[#123f59]">
                      {cat.name}
                    </span>

                    <button
                      onClick={() => deleteCategoryMutation.mutate(cat.id)}
                      className="text-rose-400 transition hover:text-rose-600"
                      type="button"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="تصنيف جديد..."
                  className="
                    flex-1 rounded-xl border border-[#d8b46a]/35
                    p-2 text-xs font-bold outline-none
                    focus:border-[#c5983c]
                  "
                />

                <button
                  onClick={() => addCategoryMutation.mutate(newCategoryName)}
                  disabled={!newCategoryName.trim()}
                  className="
                    rounded-xl bg-[#123f59] p-2
                    text-white transition hover:bg-[#0f3448]
                    disabled:opacity-50
                  "
                  type="button"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="
                  w-full rounded-xl bg-[#08111c] p-2
                  text-xs font-black text-white transition hover:bg-[#123f59]
                "
                type="button"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}