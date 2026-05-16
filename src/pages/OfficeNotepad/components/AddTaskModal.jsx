import React, { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../api/axios";
import { toast } from "sonner";

import {
  X,
  Search,
  User,
  Loader2,
  Save,
  Upload,
  Link as LinkIcon,
  FileText,
  Building2,
  ClipboardList,
  MapPin,
  Type,
  Calendar,
  Flag,
  FolderOpen,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

import FileSelectorModal from "./FileSelectorModal";

const getSafeName = (nameData) => {
  if (!nameData) return "غير محدد";

  if (typeof nameData === "string") return nameData;

  if (nameData.ar && typeof nameData.ar === "string") {
    return nameData.ar;
  }

  if (typeof nameData === "object") {
    const { firstName, fatherName, grandFatherName, familyName } = nameData;

    const fullName = [
      firstName,
      fatherName,
      grandFatherName,
      familyName,
    ]
      .filter(Boolean)
      .join(" ");

    return fullName || "اسم غير معروف";
  }

  return "بيانات اسم غير صالحة";
};

export default function AddTaskModal({
  onClose,
  currentUser,
  taskToEdit,
}) {
  const queryClient = useQueryClient();

  const [isExplorerOpen, setIsExplorerOpen] = useState(false);

  const [selectedFile, setSelectedFile] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
    priority: "medium",
    filePath: "",
    additionalNotes: "",
    assignedEmployees: [],
    clientId: "",
    transactionId: "",
    ownershipId: "",
  });

  const { data: clients = [] } = useQuery({
    queryKey: ["simple-clients-list"],
    queryFn: () =>
      api.get("/clients").then((res) => res.data || []),
  });

  const { data: transactionsData } = useQuery({
    queryKey: ["simple-transactions-list"],
    queryFn: () =>
      api.get("/private-transactions").then((res) => res.data),
  });

  const transactions = transactionsData?.data || [];

  const { data: deedsData } = useQuery({
    queryKey: ["simple-properties-list"],
    queryFn: () =>
      api.get("/properties").then((res) => res.data),
  });

  const ownerships = deedsData?.data || [];

  const handlePaste = useCallback((e) => {
    const items = e.clipboardData.items;

    for (let i = 0; i < items.length; i++) {
      if (
        items[i].type.indexOf("image") !== -1 ||
        items[i].type.indexOf("pdf") !== -1
      ) {
        const file = items[i].getAsFile();

        if (file) {
          setSelectedFile(file);

          toast.success(
            `تم التقاط ملف من الذاكرة: ${
              file.name || "صورة ملصقة"
            }`,
          );
        }
      }
    }
  }, []);

  useEffect(() => {
    window.addEventListener("paste", handlePaste);

    return () =>
      window.removeEventListener("paste", handlePaste);
  }, [handlePaste]);

  useEffect(() => {
    if (taskToEdit) {
      setFormData({
        title: taskToEdit.title || "",
        description: taskToEdit.description || "",
        dueDate: taskToEdit.dueDate
          ? taskToEdit.dueDate.split("T")[0]
          : "",
        priority: taskToEdit.priority || "medium",
        filePath: taskToEdit.filePath || "",
        additionalNotes: taskToEdit.additionalNotes || "",
        assignedEmployees:
          taskToEdit.assignedEmployees || [],
        clientId: taskToEdit.clientId || "",
        transactionId: taskToEdit.transactionId || "",
        ownershipId: taskToEdit.ownershipId || "",
      });
    }
  }, [taskToEdit]);

  const { data: employees = [] } = useQuery({
    queryKey: ["persons-for-tasks"],

    queryFn: async () => {
      const res = await api.get("/persons");
      return res.data.data || [];
    },
  });

  const saveMutation = useMutation({
    mutationFn: (payload) => {
      const data = new FormData();

      Object.keys(payload).forEach((key) => {
        if (key === "assignedEmployees") {
          data.append(key, JSON.stringify(payload[key]));
        } else if (payload[key]) {
          data.append(key, payload[key]);
        }
      });

      if (selectedFile) {
        data.append("file", selectedFile);
      }

      data.append(
        "creatorName",
        currentUser?.name || "موظف",
      );

      if (taskToEdit) {
        return api.put(
          `/office-tasks/${taskToEdit.id}`,
          data,
        );
      }

      return api.post("/office-tasks", data);
    },

    onSuccess: () => {
      toast.success(
        taskToEdit
          ? "تم تحديث المهمة"
          : "تمت إضافة المهمة بنجاح",
      );

      queryClient.invalidateQueries({
        queryKey: ["office-tasks"],
      });

      onClose();
    },
  });

  const priorities = [
    {
      id: "high",
      label: "عالية",
      emoji: "🚩",
      className:
        "border-rose-200 bg-rose-50 text-rose-700",
    },

    {
      id: "medium",
      label: "متوسطة",
      emoji: "🛡️",
      className:
        "border-amber-200 bg-amber-50 text-amber-700",
    },

    {
      id: "low",
      label: "منخفضة",
      emoji: "🏳️",
      className:
        "border-slate-200 bg-slate-100 text-slate-700",
    },
  ];

  return (
    <div
      className="
        fixed inset-0 z-[200] flex items-center justify-center
        bg-[#06111d]/70 p-4 backdrop-blur-md
        animate-in fade-in
      "
      dir="rtl"
    >
      <div
        className="
          flex max-h-[95vh] w-full max-w-5xl flex-col overflow-hidden
          rounded-[32px] border border-[#d8b46a]/35
          bg-white shadow-[0_30px_90px_rgba(0,0,0,0.35)]
          animate-in zoom-in-95 duration-200
        "
      >
        {/* Header */}
        <div
          className="
            relative shrink-0 overflow-hidden border-b border-[#d8b46a]/25
            bg-gradient-to-l from-[#06111d] via-[#123f59] to-[#0e7490]
            px-5 py-4 text-white md:px-6
          "
        >
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute right-[-70px] top-[-70px] h-44 w-44 rounded-full bg-[#e2bf74]/18 blur-3xl" />
            <div className="absolute left-[-70px] bottom-[-70px] h-44 w-44 rounded-full bg-emerald-400/14 blur-3xl" />
          </div>

          <div className="relative z-10 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <div
                  className="
                    grid h-12 w-12 place-items-center rounded-2xl
                    border border-[#e2bf74]/35 bg-white/12
                    text-[#e2bf74]
                    shadow-[0_14px_30px_rgba(0,0,0,0.20)]
                  "
                >
                  <ClipboardList className="h-6 w-6" />
                </div>

                <div>
                  <h3 className="text-lg font-black md:text-xl">
                    {taskToEdit
                      ? "تعديل بيانات المهمة"
                      : "إضافة مهمة جديدة"}
                  </h3>

                  <p className="mt-1 text-xs font-bold text-white/65">
                    إنشاء مهمة جديدة وربطها بالملفات والأنظمة الداخلية.
                  </p>
                </div>
              </div>

              <div
                className="
                  mt-4 inline-flex items-center gap-1.5 rounded-xl
                  border border-white/15 bg-white/10
                  px-3 py-1.5 text-[10px] font-black text-white
                "
              >
                <Sparkles className="h-3.5 w-3.5 text-[#e2bf74]" />
                يرجى تعبئة البيانات بدقة لضمان سهولة المتابعة.
              </div>
            </div>

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

        {/* Body */}
        <div
          className="
            min-h-0 flex-1 overflow-y-auto
            bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white
            p-4 custom-scrollbar-slim md:p-6
          "
        >
          <div className="space-y-5">
            {/* Title */}
            <SectionCard
              icon={Type}
              title="عنوان المهمة"
              subtitle="مختصر واضح يساعد في التعرف على المهمة بسرعة."
            >
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    title: e.target.value,
                  })
                }
                placeholder="مثال: إصدار رخصة بناء..."
                className="
                  h-12 w-full rounded-2xl
                  border border-[#d8b46a]/25 bg-white
                  px-4 text-sm font-black text-[#123f59]
                  shadow-sm outline-none transition-all
                  placeholder:text-slate-400
                  focus:border-[#c5983c]/70
                  focus:ring-4 focus:ring-[#c5983c]/10
                "
              />
            </SectionCard>

            {/* Description */}
            <SectionCard
              icon={FileText}
              title="وصف المهمة"
              subtitle="كافة التعليمات والتفاصيل الخاصة بالتنفيذ."
            >
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    description: e.target.value,
                  })
                }
                placeholder="اكتب كافة التعليمات والملاحظات..."
                className="
                  min-h-[130px] w-full resize-none rounded-2xl
                  border border-[#d8b46a]/25 bg-white
                  px-4 py-3 text-sm font-black leading-7 text-[#123f59]
                  shadow-sm outline-none transition-all
                  placeholder:text-slate-400
                  focus:border-[#c5983c]/70
                  focus:ring-4 focus:ring-[#c5983c]/10
                "
              />
            </SectionCard>

            {/* Smart linking */}
            <SectionCard
              icon={LinkIcon}
              title="الربط مع قاعدة البيانات"
              subtitle="ربط المهمة مع العميل أو المعاملة أو الملكية."
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <SelectField
                  icon={User}
                  label="العميل"
                  value={formData.clientId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      clientId: e.target.value,
                    })
                  }
                >
                  <option value="">-- غير مرتبط --</option>

                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {getSafeName(client.name)}
                    </option>
                  ))}
                </SelectField>

                <SelectField
                  icon={Building2}
                  label="المعاملة"
                  value={formData.transactionId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      transactionId: e.target.value,
                    })
                  }
                >
                  <option value="">-- غير مرتبط --</option>

                  {transactions.map((tx) => (
                    <option key={tx.id} value={tx.id}>
                      {tx.code || tx.transactionCode} |{" "}
                      {tx.internalName ||
                        tx.title ||
                        "بدون عنوان"}
                    </option>
                  ))}
                </SelectField>

                <SelectField
                  icon={MapPin}
                  label="الصك / الملكية"
                  value={formData.ownershipId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      ownershipId: e.target.value,
                    })
                  }
                >
                  <option value="">-- غير مرتبط --</option>

                  {ownerships.map((o) => (
                    <option key={o.id} value={o.id}>
                      صك: {o.deedNumber || o.code}
                    </option>
                  ))}
                </SelectField>
              </div>
            </SectionCard>

            {/* Grid */}
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              {/* Due date */}
              <SectionCard
                icon={Calendar}
                title="تاريخ التسليم"
                subtitle="الموعد المتوقع لإنجاز المهمة."
              >
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      dueDate: e.target.value,
                    })
                  }
                  className="
                    h-12 w-full rounded-2xl
                    border border-[#d8b46a]/25 bg-white
                    px-4 text-sm font-black text-[#123f59]
                    shadow-sm outline-none transition-all
                    focus:border-[#c5983c]/70
                    focus:ring-4 focus:ring-[#c5983c]/10
                  "
                />
              </SectionCard>

              {/* Priority */}
              <SectionCard
                icon={Flag}
                title="مستوى الأولوية"
                subtitle="حدد أهمية المهمة وسرعة التعامل معها."
              >
                <div className="grid grid-cols-3 gap-2">
                  {priorities.map((priority) => (
                    <button
                      key={priority.id}
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          priority: priority.id,
                        })
                      }
                      className={`
                        rounded-2xl border px-3 py-3
                        text-xs font-black transition-all
                        ${
                          formData.priority === priority.id
                            ? `${priority.className} scale-[1.02] shadow-sm`
                            : "border-[#d8b46a]/20 bg-white text-[#64748b] hover:bg-[#fbf8f1]"
                        }
                      `}
                    >
                      <div className="text-base">
                        {priority.emoji}
                      </div>

                      <div className="mt-1">
                        {priority.label}
                      </div>
                    </button>
                  ))}
                </div>
              </SectionCard>

              {/* Upload */}
              <SectionCard
                icon={Upload}
                title="رفع الملفات"
                subtitle="إرفاق مستندات أو صور مرتبطة بالمهمة."
              >
                <div
                  className={`
                    relative flex flex-col items-center justify-center
                    rounded-[24px] border-2 border-dashed p-6
                    transition-all
                    ${
                      selectedFile
                        ? "border-emerald-300 bg-emerald-50"
                        : "border-[#d8b46a]/30 bg-[#fbf8f1]/70 hover:border-[#c5983c]/55"
                    }
                  `}
                >
                  <Upload
                    className={
                      selectedFile
                        ? "h-8 w-8 text-emerald-600"
                        : "h-8 w-8 text-[#64748b]"
                    }
                  />

                  <p className="mt-3 text-xs font-black text-[#123f59]">
                    {selectedFile
                      ? selectedFile.name
                      : "اضغط للرفع أو استخدم Ctrl + V"}
                  </p>

                  <p className="mt-1 text-[10px] font-bold text-[#64748b]">
                    PDF / صور / ملفات
                  </p>

                  <input
                    type="file"
                    onChange={(e) =>
                      setSelectedFile(e.target.files[0])
                    }
                    className="absolute inset-0 cursor-pointer opacity-0"
                  />
                </div>
              </SectionCard>

              {/* Archive path */}
              <SectionCard
                icon={FolderOpen}
                title="مسار الأرشيف"
                subtitle="ربط المهمة بمجلد من النظام."
              >
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.filePath}
                    readOnly
                    placeholder="اختر مجلداً..."
                    className="
                      h-12 flex-1 rounded-2xl
                      border border-[#d8b46a]/25 bg-white
                      px-4 text-xs font-black text-[#64748b]
                      shadow-sm outline-none
                    "
                    dir="ltr"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setIsExplorerOpen(true)
                    }
                    className="
                      grid h-12 w-12 place-items-center rounded-2xl
                      bg-[#123f59] text-white
                      shadow-[0_14px_30px_rgba(18,63,89,0.22)]
                      transition hover:bg-[#0f3448]
                    "
                  >
                    <Search className="h-5 w-5 text-[#e2bf74]" />
                  </button>
                </div>
              </SectionCard>
            </div>

            {/* Employees */}
            <SectionCard
              icon={User}
              title="تعيين الموظفين"
              subtitle="الموظفون المسؤولون عن تنفيذ المهمة."
            >
              <div
                className="
                  grid max-h-52 grid-cols-2 gap-2 overflow-y-auto
                  rounded-[24px] border border-[#d8b46a]/20
                  bg-[#fbf8f1]/60 p-3
                  custom-scrollbar-slim sm:grid-cols-3 lg:grid-cols-4
                "
              >
                {employees.map((employee) => {
                  const isSelected =
                    formData.assignedEmployees.some(
                      (e) => e.id === employee.id,
                    );

                  return (
                    <label
                      key={employee.id}
                      className={`
                        flex cursor-pointer items-center gap-3
                        rounded-2xl border p-3 transition-all
                        ${
                          isSelected
                            ? "border-blue-200 bg-white shadow-sm"
                            : "border-transparent bg-white/70 hover:border-[#d8b46a]/30"
                        }
                      `}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        className="h-4 w-4 rounded-md text-blue-600"
                        onChange={(e) => {
                          const newEmployees =
                            e.target.checked
                              ? [
                                  ...formData.assignedEmployees,
                                  {
                                    id: employee.id,
                                    name: employee.name,
                                  },
                                ]
                              : formData.assignedEmployees.filter(
                                  (item) =>
                                    item.id !== employee.id,
                                );

                          setFormData({
                            ...formData,
                            assignedEmployees:
                              newEmployees,
                          });
                        }}
                      />

                      <span
                        className="
                          truncate text-[11px] font-black
                          text-[#123f59]
                        "
                      >
                        {employee.name}
                      </span>

                      {isSelected && (
                        <CheckCircle2 className="mr-auto h-4 w-4 text-emerald-600" />
                      )}
                    </label>
                  );
                })}
              </div>
            </SectionCard>
          </div>
        </div>

        {/* Footer */}
        <div
          className="
            shrink-0 border-t border-[#e8ddc8]
            bg-gradient-to-l from-[#fbf8f1] via-white to-[#eef7f6]
            px-5 py-4
          "
        >
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-[10px] font-bold text-[#64748b]">
              <ShieldCheck className="h-4 w-4 text-[#c5983c]" />
              سيتم حفظ المهمة وربطها بالنظام المركزي.
            </div>

            <div className="flex flex-col-reverse gap-2 sm:flex-row">
              <button
                onClick={onClose}
                className="
                  h-11 rounded-2xl border border-[#d8b46a]/30
                  bg-white px-6 text-xs font-black text-[#64748b]
                  transition hover:bg-[#f8efe0]
                "
                type="button"
              >
                إلغاء
              </button>

              <button
                onClick={() =>
                  saveMutation.mutate(formData)
                }
                disabled={
                  !formData.description ||
                  !formData.title ||
                  saveMutation.isPending
                }
                className="
                  flex h-11 items-center justify-center gap-2
                  rounded-2xl bg-gradient-to-l
                  from-[#123f59] via-[#15536f] to-[#0e7490]
                  px-8 text-xs font-black text-white
                  shadow-[0_14px_30px_rgba(18,63,89,0.22)]
                  transition hover:-translate-y-[1px]
                  disabled:cursor-not-allowed disabled:opacity-50
                "
                type="button"
              >
                {saveMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin text-[#e2bf74]" />
                ) : (
                  <Save className="h-4 w-4 text-[#e2bf74]" />
                )}

                {taskToEdit
                  ? "حفظ التعديلات"
                  : "اعتماد المهمة"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <FileSelectorModal
        isOpen={isExplorerOpen}
        onClose={() => setIsExplorerOpen(false)}
        onSelect={(path) => {
          setFormData({
            ...formData,
            filePath: path,
          });

          setIsExplorerOpen(false);
        }}
      />
    </div>
  );
}

const SectionCard = ({
  icon: Icon,
  title,
  subtitle,
  children,
}) => (
  <section
    className="
      overflow-hidden rounded-[28px]
      border border-[#d8b46a]/30 bg-white/90
      shadow-[0_16px_40px_rgba(18,63,89,0.08)]
      backdrop-blur-xl
    "
  >
    <div
      className="
        flex items-center gap-3 border-b border-[#e8ddc8]
        bg-gradient-to-l from-[#fbf8f1] via-white to-[#eef7f6]
        px-5 py-4
      "
    >
      <span
        className="
          grid h-10 w-10 place-items-center
          rounded-2xl bg-[#123f59] text-[#e2bf74]
        "
      >
        <Icon className="h-5 w-5" />
      </span>

      <div>
        <h4 className="text-sm font-black text-[#123f59]">
          {title}
        </h4>

        <p className="mt-0.5 text-[11px] font-bold text-[#64748b]">
          {subtitle}
        </p>
      </div>
    </div>

    <div className="p-5">{children}</div>
  </section>
);

const SelectField = ({
  icon: Icon,
  label,
  value,
  onChange,
  children,
}) => (
  <div className="space-y-2">
    <label
      className="
        flex items-center gap-1.5 text-[11px]
        font-black text-[#123f59]
      "
    >
      <Icon className="h-3.5 w-3.5 text-[#c5983c]" />
      {label}
    </label>

    <select
      value={value}
      onChange={onChange}
      className="
        h-11 w-full rounded-2xl
        border border-[#d8b46a]/25 bg-white
        px-4 text-[11px] font-black text-[#123f59]
        shadow-sm outline-none transition-all
        focus:border-[#c5983c]/70
        focus:ring-4 focus:ring-[#c5983c]/10
      "
    >
      {children}
    </select>
  </div>
);