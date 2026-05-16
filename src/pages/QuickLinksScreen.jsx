import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ChevronRight,
  Search,
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

const MiniStatCard = ({ icon: Icon, label, value, tone }) => {
  const tones = {
    blue: "border-cyan-300/35 bg-cyan-400/[0.18] text-cyan-50",
    gold: "border-[#e2bf74]/45 bg-[#e2bf74]/20 text-[#fff4cc]",
    red: "border-rose-300/35 bg-rose-400/[0.18] text-rose-50",
  };

  return (
    <div
      className={`
        flex min-w-[58px] items-center gap-1.5 rounded-xl
        border px-2 py-1.5 backdrop-blur-md
        ${tones[tone] || tones.blue}
      `}
    >
      <Icon className="h-3.5 w-3.5" />

      <div>
        <div className="font-mono text-[11px] font-black text-white">
          {value}
        </div>

        <div className="text-[7px] font-bold text-white/65">
          {label}
        </div>
      </div>
    </div>
  );
};

const ActionToolButton = ({
  label,
  title,
  tone = "slate",
  onClick,
  children,
}) => {
  const tones = {
    slate:
      "border-slate-200 bg-white text-slate-500 hover:border-[#d8b46a]/50 hover:bg-[#f8efe0] hover:text-[#123f59]",
    gold:
      "border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-100",
    cyan:
      "border-cyan-200 bg-cyan-50 text-cyan-700 hover:bg-cyan-100",
    rose:
      "border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100",
  };

  return (
    <button
      onClick={onClick}
      title={title}
      className={`
        flex min-w-[54px] flex-col items-center justify-center
        gap-0.5 rounded-xl border px-1.5 py-1
        transition-all duration-200
        hover:-translate-y-[1px]
        ${tones[tone] || tones.slate}
      `}
      type="button"
    >
      <span className="text-[8px] font-black leading-none">
        {label}
      </span>

      {children}
    </button>
  );
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
  const [searchQuery, setSearchQuery] = useState("");

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
    const q = searchQuery.trim().toLowerCase();

    const filtered = !q
      ? links
      : links.filter((link) => {
          return (
            link.title?.toLowerCase().includes(q) ||
            link.url?.toLowerCase().includes(q) ||
            link.description?.toLowerCase().includes(q) ||
            link.category?.name?.toLowerCase().includes(q) ||
            link.accessLevel?.toLowerCase().includes(q)
          );
        });

    const sorted = [...filtered];

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
  }, [links, sortBy, searchQuery]);

  const totalLinks = links.length;
  const pinnedLinks = links.filter((link) => link.isPinned).length;
  const protectedLinks = links.filter((link) => link.requiresLogin).length;

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
        flex min-h-screen flex-col gap-2 overflow-hidden
        bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white
        p-2 font-sans md:p-3 2xl:p-4
      "
      dir="rtl"
    >
      {/* Single strip header */}
      <div
        className="
          relative shrink-0 overflow-hidden
          rounded-[14px] 2xl:rounded-[18px]
          border border-[#e2bf74]/35
          bg-gradient-to-l from-[#06111d] via-[#0b3f55] to-[#005f73]
          px-2.5 py-1.5 2xl:px-3 2xl:py-2
          shadow-[0_8px_20px_rgba(6,17,29,0.22)]
        "
      >
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute right-[-45px] top-[-45px] h-24 w-24 rounded-full bg-[#e2bf74]/18 blur-2xl" />
          <div className="absolute left-[-50px] bottom-[-50px] h-28 w-28 rounded-full bg-emerald-400/12 blur-2xl" />
        </div>

        <div className="relative z-10 flex items-center gap-2">
          {/* Title */}
          <div className="flex min-w-[190px] shrink-0 items-center gap-2">
            <button
              className="
                grid h-8 w-8 shrink-0 place-items-center rounded-xl
                border border-white/20 bg-white/10 text-[#e2bf74]
                transition hover:bg-white/15
              "
              type="button"
            >
              <ChevronRight className="h-4 w-4" />
            </button>

            <span
              className="
                grid h-8 w-8 shrink-0 place-items-center rounded-xl
                bg-[#e2bf74] text-[#082032] shadow-sm
              "
            >
              <Link2 className="h-4 w-4" />
            </span>

            <div className="min-w-0">
              <h3 className="truncate text-[12px] font-black text-white">
                الروابط السريعة
              </h3>

              <p className="truncate text-[8px] font-bold text-white/55">
                {links.length} رابط · {Object.keys(groupedLinks).length} تصنيف
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="hidden shrink-0 items-center gap-1.5 md:flex">
            <MiniStatCard icon={Link2} label="الروابط" value={totalLinks} tone="blue" />
            <MiniStatCard icon={Pin} label="مثبتة" value={pinnedLinks} tone="gold" />
            <MiniStatCard icon={Lock} label="محمية" value={protectedLinks} tone="red" />
          </div>

          {/* Search */}
          <div className="relative min-w-[190px] flex-1">
            <Search className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#d8a93d]" />

            <input
              placeholder="بحث في الروابط..."
              className="
                h-8 w-full rounded-xl border border-white/20
                bg-white pr-9 pl-3
                text-[10px] font-bold text-[#082032]
                shadow-sm outline-none transition-all
                placeholder:text-[#6b7c8f]
                focus:border-[#e2bf74]
                focus:ring-2 focus:ring-[#e2bf74]/25
              "
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Sort buttons */}
          <button
            onClick={() => setSortBy("usage")}
            className={`h-8 shrink-0 rounded-xl border px-3 text-[10px] font-black transition-all ${
              sortBy === "usage"
                ? "border-[#e2bf74]/45 bg-[#e2bf74] text-[#082032]"
                : "border-white/20 bg-white/10 text-white hover:bg-white/15"
            }`}
            type="button"
          >
            الأكثر استخداماً
          </button>

          <button
            onClick={() => setSortBy("date")}
            className={`h-8 shrink-0 rounded-xl border px-3 text-[10px] font-black transition-all ${
              sortBy === "date"
                ? "border-[#e2bf74]/45 bg-[#e2bf74] text-[#082032]"
                : "border-white/20 bg-white/10 text-white hover:bg-white/15"
            }`}
            type="button"
          >
            الأحدث
          </button>

          {/* Actions */}
          <button
            onClick={() => openLinkModal()}
            className="
              flex h-8 shrink-0 items-center justify-center gap-1.5
              rounded-xl bg-[#e2bf74] px-3
              text-[10px] font-black text-[#082032]
              shadow-[0_8px_18px_rgba(226,191,116,0.22)]
              transition-all duration-300
              hover:-translate-y-[1px]
              hover:bg-[#f5d99b]
            "
            type="button"
          >
            <Plus className="h-3.5 w-3.5" />
            رابط جديد
          </button>

          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="
              grid h-8 w-8 shrink-0 place-items-center rounded-xl
              border border-white/20 bg-white/10
              text-[#e2bf74] transition hover:bg-white/15
            "
            type="button"
            title="إدارة التصنيفات"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Tables Grouped by Category */}
      <div
        className="
          min-h-0 flex-1 overflow-auto rounded-[20px]
          border border-[#d8b46a]/30 bg-white
          shadow-[0_14px_34px_rgba(18,63,89,0.10)]
          2xl:rounded-[26px]
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
                  px-4 py-2
                "
              >
                <div className="flex items-center gap-2">
                  <span className="h-6 w-1.5 rounded-full bg-[#c5983c]" />
                  <div>
                    <div className="text-xs font-black text-[#123f59]">
                      {categoryName}
                    </div>
                    <div className="text-[9px] font-bold text-[#64748b]">
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
                        بيانات الدخول
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
                      <th className="w-[240px] px-3 py-3 text-center">إجراءات</th>
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
                            <div className="flex items-center justify-center gap-1.5">
                              {link.isPinned && sortBy === "usage" && (
                                <div className="ml-1 mr-2 flex items-center gap-1">
                                  <ActionToolButton
                                    label="رفع"
                                    title="رفع ترتيب الرابط"
                                    tone="slate"
                                    onClick={() =>
                                      handleMovePinned(catLinks, index, "up")
                                    }
                                  >
                                    <ArrowUp className="h-3.5 w-3.5" />
                                  </ActionToolButton>

                                  <ActionToolButton
                                    label="خفض"
                                    title="خفض ترتيب الرابط"
                                    tone="slate"
                                    onClick={() =>
                                      handleMovePinned(catLinks, index, "down")
                                    }
                                  >
                                    <ArrowDown className="h-3.5 w-3.5" />
                                  </ActionToolButton>
                                </div>
                              )}

                              <ActionToolButton
                                label="تثبيت/إلغاء"
                                title="تثبيت الرابط في الأعلى أو إلغاء تثبيته"
                                tone={link.isPinned ? "gold" : "slate"}
                                onClick={() => handlePinToggle(link)}
                              >
                                <Pin className="h-3.5 w-3.5" />
                              </ActionToolButton>

                              <ActionToolButton
                                label="تعديل"
                                title="تعديل الرابط"
                                tone="cyan"
                                onClick={() => openLinkModal(link)}
                              >
                                <Pen className="h-3.5 w-3.5" />
                              </ActionToolButton>

                              <ActionToolButton
                                label="حذف"
                                title="حذف الرابط"
                                tone="rose"
                                onClick={() => {
                                  if (window.confirm("حذف؟")) {
                                    deleteLinkMutation.mutate(link.id);
                                  }
                                }}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </ActionToolButton>
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