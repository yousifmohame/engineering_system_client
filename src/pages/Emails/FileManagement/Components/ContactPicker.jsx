import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../../api/axios";
import { toast } from "sonner";
import {
  Search,
  MessageCircle,
  Mail,
  MessageSquare,
  Star,
  SearchX,
  Check,
  Plus,
  Edit,
  Trash2,
  Loader2,
  X,
  Users,
  UserPlus,
  Phone,
  AtSign,
  Briefcase,
  Save,
  ShieldCheck,
} from "lucide-react";

export default function ContactPicker({
  onSelect,
  onClose,
  multiSelect = false,
  channelFilter = "all",
}) {
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [filterType, setFilterType] = useState("all");

  const [showForm, setShowForm] = useState(false);
  const [editingContact, setEditingContact] = useState(null);

  const [formData, setFormData] = useState({
    displayName: "",
    mobile1: "",
    email1: "",
    capacity: "",
    isFavorite: false,
    status: "active",
  });

  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ["contacts-list"],
    queryFn: async () => {
      const res = await api.get("/contacts");
      return res.data?.data || [];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (editingContact) {
        return await api.put(`/contacts/${editingContact.id}`, data);
      }

      return await api.post("/contacts", data);
    },

    onSuccess: (res) => {
      toast.success(res.data?.message || "تم الحفظ بنجاح");
      queryClient.invalidateQueries(["contacts-list"]);
      closeForm();
    },

    onError: () => {
      toast.error("حدث خطأ أثناء الحفظ");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return await api.delete(`/contacts/${id}`);
    },

    onSuccess: (res) => {
      toast.success(res.data?.message || "تم الحذف بنجاح");
      queryClient.invalidateQueries(["contacts-list"]);
    },

    onError: () => {
      toast.error("حدث خطأ أثناء الحذف");
    },
  });

  const openForm = (contact = null) => {
    if (contact) {
      setEditingContact(contact);
      setFormData({
        displayName: contact.displayName || "",
        mobile1: contact.mobile1 || "",
        email1: contact.email1 || "",
        capacity: contact.capacity || "",
        isFavorite: !!contact.isFavorite,
        status: contact.status || "active",
      });
    } else {
      setEditingContact(null);
      setFormData({
        displayName: "",
        mobile1: "",
        email1: "",
        capacity: "",
        isFavorite: false,
        status: "active",
      });
    }

    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingContact(null);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    if (!formData.displayName || !formData.mobile1) {
      return toast.error("الاسم ورقم الجوال مطلوبان");
    }

    saveMutation.mutate(formData);
  };

  const handleDelete = (id) => {
    if (window.confirm("هل أنت متأكد من حذف جهة الاتصال هذه؟")) {
      deleteMutation.mutate(id);
    }
  };

  const filteredContacts = contacts.filter((contact) => {
    const query = searchTerm.trim();

    const displayName = String(contact.displayName || "");
    const mobile = String(contact.mobile1 || "");
    const email = String(contact.email1 || "");
    const capacity = String(contact.capacity || "");

    if (
      query &&
      !displayName.includes(query) &&
      !mobile.includes(query) &&
      !email.includes(query) &&
      !capacity.includes(query)
    ) {
      return false;
    }

    if (filterType === "favorites" && !contact.isFavorite) return false;
    if (filterType === "clients" && contact.detailedType !== "client") return false;
    if (filterType === "officials" && contact.detailedType !== "official") return false;

    if (contact.status !== "active") return false;

    if (channelFilter === "email" && !contact.acceptsEmail) return false;
    if (channelFilter === "whatsapp" && !contact.acceptsWhatsApp) return false;

    return true;
  });

  const toggleSelect = (id) => {
    if (!multiSelect) {
      setSelectedIds(selectedIds.includes(id) ? [] : [id]);
      return;
    }

    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleConfirm = () => {
    const selected = contacts.filter((contact) => selectedIds.includes(contact.id));
    onSelect(selected);
  };

  return (
    <div
      className="
        fixed inset-0 z-[100] flex items-center justify-center
        bg-[#06111d]/70 p-4 backdrop-blur-md
        animate-in fade-in
      "
      dir="rtl"
    >
      <div
        className="
          flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden
          rounded-[32px] border border-[#d8b46a]/35
          bg-white shadow-[0_30px_90px_rgba(0,0,0,0.35)]
          animate-in zoom-in-95 duration-200
        "
      >
        {showForm ? (
          <div className="flex min-h-0 flex-1 flex-col">
            {/* Form header */}
            <div
              className="
                relative shrink-0 overflow-hidden border-b border-[#d8b46a]/25
                bg-gradient-to-l from-[#06111d] via-[#123f59] to-[#0e7490]
                px-5 py-4 text-white
              "
            >
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute right-[-55px] top-[-55px] h-32 w-32 rounded-full bg-[#e2bf74]/18 blur-3xl" />
                <div className="absolute left-[-55px] bottom-[-55px] h-32 w-32 rounded-full bg-emerald-400/14 blur-3xl" />
              </div>

              <div className="relative z-10 flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className="
                      grid h-11 w-11 shrink-0 place-items-center rounded-2xl
                      border border-[#e2bf74]/35 bg-white/12 text-[#e2bf74]
                    "
                  >
                    <UserPlus className="h-5 w-5" />
                  </span>

                  <div className="min-w-0">
                    <h3 className="truncate text-base font-black">
                      {editingContact ? "تعديل جهة اتصال" : "إضافة جهة اتصال جديدة"}
                    </h3>

                    <p className="mt-0.5 truncate text-[11px] font-bold text-white/60">
                      Contact information
                    </p>
                  </div>
                </div>

                <button
                  onClick={closeForm}
                  className="
                    flex min-w-[54px] flex-col items-center justify-center gap-0.5
                    rounded-xl border border-white/15 bg-white/10
                    px-2 py-1 text-[8px] font-black leading-none text-white
                    transition hover:bg-red-500/30
                  "
                  type="button"
                >
                  <X className="h-4 w-4" />
                  إغلاق
                </button>
              </div>
            </div>

            {/* Form body */}
            <form
              onSubmit={handleFormSubmit}
              className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5 custom-scrollbar"
            >
              <FormField label="الاسم الكريم" icon={Users} required>
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      displayName: e.target.value,
                    })
                  }
                  className={INPUT_CLASS}
                  placeholder="أدخل اسم جهة الاتصال"
                  required
                />
              </FormField>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField label="رقم الجوال" icon={Phone} required>
                  <input
                    type="text"
                    value={formData.mobile1}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        mobile1: e.target.value,
                      })
                    }
                    className={`${INPUT_CLASS} text-left font-mono`}
                    placeholder="+9665XXXXXXXX"
                    dir="ltr"
                    required
                  />
                </FormField>

                <FormField label="البريد الإلكتروني" icon={AtSign}>
                  <input
                    type="email"
                    value={formData.email1}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        email1: e.target.value,
                      })
                    }
                    className={`${INPUT_CLASS} text-left font-mono`}
                    placeholder="example@domain.com"
                    dir="ltr"
                  />
                </FormField>
              </div>

              <FormField label="المسمى / الصفة" icon={Briefcase}>
                <input
                  type="text"
                  value={formData.capacity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      capacity: e.target.value,
                    })
                  }
                  className={INPUT_CLASS}
                  placeholder="مثال: مدير مشروع، مالك العقار"
                />
              </FormField>

              <button
                onClick={() =>
                  setFormData({
                    ...formData,
                    isFavorite: !formData.isFavorite,
                  })
                }
                className={`
                  flex w-full items-center justify-between gap-3
                  rounded-2xl border p-4 text-right transition-all
                  ${
                    formData.isFavorite
                      ? "border-amber-200 bg-amber-50 text-amber-800"
                      : "border-[#d8b46a]/25 bg-white text-[#64748b] hover:bg-[#fbf8f1]"
                  }
                `}
                type="button"
              >
                <span className="flex items-center gap-2 text-xs font-black">
                  <Star
                    className={`h-4 w-4 ${
                      formData.isFavorite ? "fill-current text-amber-500" : "text-[#c5983c]"
                    }`}
                  />
                  إضافة للمفضلة
                </span>

                <span
                  className={`
                    relative h-6 w-12 rounded-full transition-colors
                    ${formData.isFavorite ? "bg-[#123f59]" : "bg-slate-300"}
                  `}
                >
                  <span
                    className={`
                      absolute top-1 h-4 w-4 rounded-full bg-white transition-all
                      ${formData.isFavorite ? "left-1" : "left-7"}
                    `}
                  />
                </span>
              </button>

              <div className="flex flex-col-reverse gap-3 border-t border-[#e8ddc8] pt-4 sm:flex-row">
                <button
                  type="button"
                  onClick={closeForm}
                  className="
                    h-11 rounded-2xl border border-[#d8b46a]/30
                    bg-white px-6 text-xs font-black text-[#64748b]
                    transition hover:bg-[#f8efe0]
                  "
                >
                  إلغاء
                </button>

                <button
                  type="submit"
                  disabled={saveMutation.isPending}
                  className="
                    flex h-11 flex-1 items-center justify-center gap-2
                    rounded-2xl bg-gradient-to-l from-[#123f59] via-[#15536f] to-[#0e7490]
                    text-xs font-black text-white
                    shadow-[0_14px_30px_rgba(18,63,89,0.22)]
                    transition hover:-translate-y-[1px]
                    disabled:cursor-not-allowed disabled:opacity-70
                  "
                >
                  {saveMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin text-[#e2bf74]" />
                  ) : (
                    <Save className="h-4 w-4 text-[#e2bf74]" />
                  )}
                  حفظ البيانات
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col">
            {/* Main header */}
            <div
              className="
                relative shrink-0 overflow-hidden border-b border-[#d8b46a]/25
                bg-gradient-to-l from-[#06111d] via-[#123f59] to-[#0e7490]
                px-5 py-4 text-white
              "
            >
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute right-[-55px] top-[-55px] h-32 w-32 rounded-full bg-[#e2bf74]/18 blur-3xl" />
                <div className="absolute left-[-55px] bottom-[-55px] h-32 w-32 rounded-full bg-emerald-400/14 blur-3xl" />
              </div>

              <div className="relative z-10 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <span
                      className="
                        grid h-11 w-11 shrink-0 place-items-center rounded-2xl
                        border border-[#e2bf74]/35 bg-white/12 text-[#e2bf74]
                      "
                    >
                      <Users className="h-5 w-5" />
                    </span>

                    <div className="min-w-0">
                      <h3 className="truncate text-base font-black">
                        اختيار جهة {multiSelect ? "أو أكثر " : ""}للتواصل
                      </h3>

                      <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px] font-bold text-white/65">
                        <span>فلتر الإرسال:</span>
                        <ChannelBadge channelFilter={channelFilter} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <button
                    onClick={() => openForm()}
                    className="
                      flex min-w-[54px] flex-col items-center justify-center gap-0.5
                      rounded-xl border border-[#e2bf74]/25 bg-[#e2bf74]
                      px-2 py-1 text-[8px] font-black leading-none text-[#082032]
                      transition hover:bg-[#f5d99b]
                    "
                    title="إضافة جهة جديدة"
                    type="button"
                  >
                    <Plus className="h-4 w-4" />
                    إضافة
                  </button>

                  <button
                    onClick={onClose}
                    className="
                      flex min-w-[54px] flex-col items-center justify-center gap-0.5
                      rounded-xl border border-white/15 bg-white/10
                      px-2 py-1 text-[8px] font-black leading-none text-white
                      transition hover:bg-red-500/30
                    "
                    type="button"
                  >
                    <X className="h-4 w-4" />
                    إغلاق
                  </button>
                </div>
              </div>
            </div>

            {/* Search and filters */}
            <div
              className="
                shrink-0 space-y-3 border-b border-[#e8ddc8]
                bg-white/80 p-4 backdrop-blur-xl
              "
            >
              <div className="relative">
                <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#c5983c]" />

                <input
                  type="text"
                  placeholder="ابحث بالاسم أو الجوال..."
                  className="
                    h-10 w-full rounded-2xl border border-[#d8b46a]/30
                    bg-white pr-10 pl-3 text-xs font-bold text-[#123f59]
                    outline-none transition-all
                    placeholder:text-slate-400
                    focus:border-[#c5983c]/70
                    focus:ring-4 focus:ring-[#c5983c]/10
                  "
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <FilterButton
                  active={filterType === "all"}
                  label="الكل"
                  onClick={() => setFilterType("all")}
                />

                <FilterButton
                  active={filterType === "favorites"}
                  label="المفضلة"
                  icon={Star}
                  onClick={() => setFilterType("favorites")}
                />
              </div>
            </div>

            {/* List */}
            <div className="min-h-0 flex-1 overflow-y-auto p-3 custom-scrollbar">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-14">
                  <Loader2 className="mb-3 h-8 w-8 animate-spin text-[#c5983c]" />
                  <p className="text-xs font-black text-[#123f59]">
                    جاري تحميل جهات الاتصال...
                  </p>
                </div>
              ) : filteredContacts.length === 0 ? (
                <div
                  className="
                    flex flex-col items-center justify-center
                    rounded-[24px] border border-dashed border-[#d8b46a]/35
                    bg-[#fbf8f1]/70 p-8 text-center
                  "
                >
                  <SearchX className="mb-3 h-9 w-9 text-[#c5983c]/60" />

                  <p className="text-xs font-black text-[#64748b]">
                    لا توجد جهات اتصال توافق هذا البحث/الفلتر.
                  </p>

                  <button
                    onClick={() => openForm()}
                    className="mt-3 text-[10px] font-black text-[#123f59] hover:underline"
                    type="button"
                  >
                    إضافة جهة اتصال جديدة؟
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredContacts.map((contact) => {
                    const isSelected = selectedIds.includes(contact.id);

                    return (
                      <div
                        key={contact.id}
                        className={`
                          group relative overflow-hidden rounded-[22px]
                          border p-3 transition-all
                          ${
                            isSelected
                              ? "border-[#d8b46a]/45 bg-[#fbf8f1] ring-2 ring-[#c5983c]/15"
                              : "border-[#e8ddc8] bg-white hover:border-[#d8b46a]/40 hover:bg-[#fbf8f1]/70"
                          }
                        `}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div
                            className="flex min-w-0 flex-1 cursor-pointer items-center gap-3"
                            onClick={() => toggleSelect(contact.id)}
                          >
                            <div
                              className={`
                                grid h-5 w-5 shrink-0 place-items-center rounded-md border
                                ${
                                  isSelected
                                    ? "border-[#123f59] bg-[#123f59] text-white"
                                    : "border-[#d8b46a]/40 bg-white"
                                }
                              `}
                            >
                              {isSelected && <Check className="h-3.5 w-3.5" />}
                            </div>

                            <div
                              className="
                                grid h-10 w-10 shrink-0 place-items-center
                                rounded-2xl bg-gradient-to-br from-[#123f59] to-[#0e7490]
                                text-sm font-black text-[#e2bf74]
                              "
                            >
                              {contact.displayName?.charAt(0) || "؟"}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="mb-1 flex items-center gap-2">
                                <p className="truncate text-xs font-black text-[#123f59]">
                                  {contact.displayName}
                                </p>

                                {contact.isFavorite && (
                                  <Star className="h-3.5 w-3.5 shrink-0 fill-current text-amber-400" />
                                )}
                              </div>

                              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] font-bold text-[#64748b]">
                                {contact.capacity && <span>{contact.capacity}</span>}
                                {contact.capacity && <span>•</span>}
                                <span className="font-mono text-emerald-600" dir="ltr">
                                  {contact.mobile1}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex shrink-0 items-center gap-1.5">
                            <ActionButton
                              label="تعديل"
                              tone="blue"
                              onClick={(e) => {
                                e.stopPropagation();
                                openForm(contact);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </ActionButton>

                            <ActionButton
                              label="حذف"
                              tone="rose"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(contact.id);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </ActionButton>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div
              className="
                shrink-0 border-t border-[#e8ddc8]
                bg-gradient-to-l from-[#fbf8f1] via-white to-[#eef7f6]
                p-4
              "
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-xs font-bold text-[#64748b]">
                  تم تحديد:{" "}
                  <strong className="text-[#123f59]">{selectedIds.length}</strong>
                </span>

                <div className="flex gap-2">
                  <button
                    onClick={onClose}
                    className="
                      h-10 rounded-2xl border border-[#d8b46a]/30
                      bg-white px-5 text-xs font-black text-[#64748b]
                      transition hover:bg-[#f8efe0]
                    "
                    type="button"
                  >
                    إلغاء
                  </button>

                  <button
                    onClick={handleConfirm}
                    disabled={selectedIds.length === 0}
                    className="
                      flex h-10 items-center gap-2 rounded-2xl
                      bg-gradient-to-l from-[#123f59] via-[#15536f] to-[#0e7490]
                      px-6 text-xs font-black text-white
                      shadow-[0_14px_30px_rgba(18,63,89,0.22)]
                      transition hover:-translate-y-[1px]
                      disabled:cursor-not-allowed disabled:opacity-50
                    "
                    type="button"
                  >
                    <Check className="h-4 w-4 text-[#e2bf74]" />
                    تأكيد الاختيار
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const ChannelBadge = ({ channelFilter }) => {
  if (channelFilter === "email") {
    return (
      <span className="inline-flex items-center gap-1 rounded-xl border border-cyan-200 bg-cyan-50 px-2 py-0.5 text-cyan-800">
        <Mail className="h-3 w-3" />
        إيميل
      </span>
    );
  }

  if (channelFilter === "whatsapp") {
    return (
      <span className="inline-flex items-center gap-1 rounded-xl border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-emerald-700">
        <MessageCircle className="h-3 w-3" />
        واتساب
      </span>
    );
  }

  if (channelFilter === "sms") {
    return (
      <span className="inline-flex items-center gap-1 rounded-xl border border-sky-200 bg-sky-50 px-2 py-0.5 text-sky-700">
        <MessageSquare className="h-3 w-3" />
        SMS
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-xl border border-white/15 bg-white/10 px-2 py-0.5 text-white/80">
      <ShieldCheck className="h-3 w-3" />
      الكل
    </span>
  );
};

const FilterButton = ({ active, label, icon: Icon, onClick }) => (
  <button
    onClick={onClick}
    className={`
      flex items-center gap-1.5 rounded-xl px-3 py-1.5
      text-[10px] font-black transition-all
      ${
        active
          ? "bg-[#123f59] text-white shadow-sm"
          : "bg-[#fbf8f1] text-[#64748b] hover:bg-[#f8efe0] hover:text-[#123f59]"
      }
    `}
    type="button"
  >
    {Icon && <Icon className="h-3 w-3" />}
    {label}
  </button>
);

const ActionButton = ({
  children,
  label,
  tone = "blue",
  onClick,
  disabled,
}) => {
  const tones = {
    blue: "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100",
    rose: "border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        flex min-w-[48px] flex-col items-center justify-center gap-0.5
        rounded-xl border px-2 py-1.5
        text-[8px] font-black leading-none
        transition-all hover:-translate-y-[1px]
        disabled:cursor-not-allowed disabled:opacity-50
        ${tones[tone] || tones.blue}
      `}
      type="button"
    >
      {children}
      <span>{label}</span>
    </button>
  );
};

const FormField = ({ label, icon: Icon, required, children }) => (
  <div>
    <label className="mb-1.5 flex items-center gap-1.5 text-xs font-black text-[#123f59]">
      {Icon && <Icon className="h-3.5 w-3.5 text-[#c5983c]" />}
      {label}
      {required && <span className="text-rose-500">*</span>}
    </label>

    {children}
  </div>
);

const INPUT_CLASS = `
  w-full rounded-2xl border border-[#d8b46a]/25
  bg-white px-4 py-3 text-sm font-bold text-[#123f59]
  shadow-sm outline-none transition-all
  placeholder:text-slate-400
  focus:border-[#c5983c]/70
  focus:bg-white
  focus:ring-4
  focus:ring-[#c5983c]/10
`;