import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../../api/axios";
import { toast } from "sonner";
import {
  FileText,
  Edit3,
  X,
  Save,
  Loader2,
  User,
  EyeOff,
  MapPinned,
  CreditCard,
  CalendarDays,
  Clock,
  AlertTriangle,
  MessageSquareText,
  Building2,
  Image as ImageIcon,
  QrCode,
  Globe,
  Upload,
  Building,
  Plus,
  Paperclip,
  Trash2,
  Users,
  Layers,
  CheckCircle,
  ShieldCheck,
  Map,
  Landmark,
  Ruler,
} from "lucide-react";
import { SearchableSelect } from "../TransactionSharedUI";
import AccessControl from "../../../../components/AccessControl";

const toEnglishNumbers = (str) => {
  if (str === null || str === undefined) return "";
  return String(str).replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d));
};

export const BasicTab = ({
  tx,
  isEditingBasic,
  setIsEditingBasic,
  editFormData,
  setEditFormData,
  saveBasicEdits,
  updateTxMutation,
  clientsOptions,
  districtsOptions,
  offices,
  persons,
  formatDateTime,
  safeText,
  backendUrl,
  currentUser,
}) => {
  const queryClient = useQueryClient();

  const { data: plansData = [] } = useQuery({
    queryKey: ["riyadh-plans"],
    queryFn: async () => (await api.get("/riyadh-streets/plans")).data,
  });

  const plansOptions = plansData.map((p) => ({
    value: p.planNumber,
    label: p.planNumber,
    id: p.id,
  }));

  const [isQuickAddPlanOpen, setIsQuickAddPlanOpen] = useState(false);
  const [newPlanName, setNewPlanName] = useState("");

  const quickAddPlanMutation = useMutation({
    mutationFn: async (planNumber) => {
      return await api.post("/riyadh-streets/plans", {
        planNumber,
        status: "معتمد",
        isWithout: false,
      });
    },
    onSuccess: (res) => {
      toast.success("تم تسجيل المخطط الجديد بنجاح");

      queryClient.invalidateQueries({
        queryKey: ["riyadh-plans"],
      });

      setEditFormData((prev) => ({
        ...prev,
        plan: res.data.planNumber,
      }));

      setNewPlanName("");
      setIsQuickAddPlanOpen(false);
    },
    onError: () => toast.error("فشل إضافة المخطط، قد يكون مكرراً"),
  });

  const createdDate = new Date(tx.createdAt);
  const updatedDate = new Date(tx.updatedAt || tx.createdAt);
  const today = new Date();

  const daysSinceCreation = Math.floor(
    (today - createdDate) / (1000 * 60 * 60 * 24),
  );

  const daysSinceUpdate = Math.floor(
    (today - updatedDate) / (1000 * 60 * 60 * 24),
  );

  const delayStatus =
    daysSinceUpdate > 7
      ? "متأخرة"
      : daysSinceUpdate > 3
        ? "تحتاج متابعة"
        : "منتظمة";

  const delayTone =
    delayStatus === "متأخرة"
      ? "rose"
      : delayStatus === "تحتاج متابعة"
        ? "amber"
        : "emerald";

  const [siteImagePreview, setSiteImagePreview] = useState(
    tx.notes?.refs?.siteImage
      ? `${backendUrl || ""}${tx.notes.refs.siteImage}`
      : null,
  );

  const [isSiteImageModalOpen, setIsSiteImageModalOpen] = useState(false);

  const handleEditChange = (field, value) => {
    setEditFormData((prev) => ({
      ...prev,
      [field]: toEnglishNumbers(value),
    }));
  };

  const handleTextChange = (field, value) => {
    setEditFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSiteImageChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      setEditFormData((prev) => ({
        ...prev,
        newSiteImage: file,
      }));

      const reader = new FileReader();

      reader.onloadend = () => setSiteImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const addOwnerRow = () => {
    setEditFormData((prev) => {
      const currentOwners = prev.additionalOwners || [];

      return {
        ...prev,
        additionalOwners: [...currentOwners, { clientId: "", ownerName: "" }],
      };
    });
  };

  const removeOwnerRow = (index) => {
    setEditFormData((prev) => {
      const newOwners = [...prev.additionalOwners];

      newOwners.splice(index, 1);

      return {
        ...prev,
        additionalOwners: newOwners,
      };
    });
  };

  const updateAdditionalOwner = (index, val, opt) => {
    setEditFormData((prev) => {
      const newOwners = [...prev.additionalOwners];

      newOwners[index] = {
        clientId: val,
        ownerName: opt.label,
      };

      return {
        ...prev,
        additionalOwners: newOwners,
      };
    });
  };

  let plotsArray = [];

  const sourcePlots = isEditingBasic
    ? editFormData.plots
    : tx.plots?.length > 0
      ? tx.plots
      : tx.notes?.refs?.plots;

  if (Array.isArray(sourcePlots)) {
    plotsArray = sourcePlots;
  } else if (typeof sourcePlots === "string") {
    plotsArray = sourcePlots
      .split(/[,،]/)
      .map((s) => s.trim())
      .filter(Boolean);
  }

  const displayOwners = tx.ownerNames
    ? tx.ownerNames.split(" و ")
    : [tx.client || tx.owner];

  const handleSaveAll = () => {
    let finalNames = [editFormData.clientName];

    let detailedOwners = [
      {
        clientId: editFormData.clientId,
        ownerName: editFormData.clientName,
        isPrimary: true,
      },
    ];

    if (
      editFormData.additionalOwners &&
      editFormData.additionalOwners.length > 0
    ) {
      const additionalValid = editFormData.additionalOwners.filter(
        (o) => o.ownerName && o.ownerName.trim() !== "",
      );

      finalNames = [...finalNames, ...additionalValid.map((o) => o.ownerName)];

      additionalValid.forEach((o) => {
        detailedOwners.push({
          clientId: o.clientId,
          ownerName: o.ownerName,
          isPrimary: false,
        });
      });
    }

    const finalOwnerNamesString = finalNames.join(" و ");

    const updatedData = {
      ...editFormData,
      ownerNames: finalOwnerNamesString,
      notes: {
        ...editFormData.notes,
        detailedOwnersList: detailedOwners,
      },
      updatedBy: currentUser?.name || "مدير النظام",
    };

    setEditFormData(updatedData);
    saveBasicEdits(updatedData);
  };

  return (
    <div
      className="
        relative h-full min-h-0 space-y-5 overflow-y-auto overflow-x-hidden
        bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white
        p-4 pb-20 font-[Tajawal] animate-in fade-in
        custom-scrollbar-slim
      "
      dir="rtl"
    >
      {/* Header */}
      <div
        className="
          relative overflow-hidden rounded-[30px]
          border border-[#d8b46a]/30
          bg-gradient-to-l from-[#06111d] via-[#123f59] to-[#0e7490]
          p-5 text-white
          shadow-[0_18px_45px_rgba(18,63,89,0.16)]
        "
      >
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute right-[-70px] top-[-70px] h-44 w-44 rounded-full bg-[#e2bf74]/18 blur-3xl" />
          <div className="absolute left-[-80px] bottom-[-80px] h-48 w-48 rounded-full bg-cyan-400/14 blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div
              className="
                grid h-12 w-12 shrink-0 place-items-center
                rounded-2xl border border-[#e2bf74]/35
                bg-white/12 text-[#e2bf74]
                shadow-[0_14px_30px_rgba(0,0,0,0.20)]
              "
            >
              <FileText className="h-6 w-6" />
            </div>

            <div className="min-w-0">
              <h3 className="truncate text-lg font-black md:text-xl">
                البيانات الرئيسية
              </h3>

              <p className="mt-1 text-xs font-bold text-white/65">
                عرض وتعديل معلومات العميل، الموقع، المخطط، المكاتب، والملاحظات.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <StatusPill tone={delayTone} label={delayStatus} />

            <AccessControl
              code="EDIT_TRANSACTION"
              permissionNumber={42}
              name="تعديل البيانات الأساسية للمعاملة"
              moduleName="تفاصيل المعاملة"
              tabName="البيانات الأساسية"
            >
              <button
                onClick={() => {
                  if (!isEditingBasic) {
                    const existingNames = tx.ownerNames
                      ? tx.ownerNames.split(" و ")
                      : [];

                    if (existingNames.length > 1) {
                      const additional = existingNames.slice(1).map((name) => ({
                        clientId: "",
                        ownerName: name.trim(),
                      }));

                      setEditFormData((prev) => ({
                        ...prev,
                        additionalOwners: additional,
                      }));
                    } else {
                      setEditFormData((prev) => ({
                        ...prev,
                        additionalOwners: [],
                      }));
                    }
                  }

                  setIsEditingBasic(!isEditingBasic);
                }}
                className={`
                  flex h-11 items-center justify-center gap-2 rounded-2xl
                  px-5 text-xs font-black transition-all hover:-translate-y-[1px]
                  ${
                    isEditingBasic
                      ? "border border-rose-300/30 bg-rose-500/20 text-rose-50 hover:bg-rose-500/35"
                      : "bg-[#e2bf74] text-[#082032] shadow-[0_12px_28px_rgba(226,191,116,0.25)] hover:bg-[#f5d99b]"
                  }
                `}
                type="button"
              >
                {isEditingBasic ? (
                  <X className="h-4 w-4" />
                ) : (
                  <Edit3 className="h-4 w-4" />
                )}

                {isEditingBasic ? "إلغاء التعديل" : "تعديل البيانات"}
              </button>
            </AccessControl>
          </div>
        </div>
      </div>

      {/* Meta cards */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
        <MetaCard
          icon={User}
          label="منشئ المعاملة"
          value={tx.createdBy || tx.notes?.createdBy || "مدير النظام"}
          tone="blue"
        />

        <MetaCard
          icon={CalendarDays}
          label="تاريخ الإنشاء"
          value={`${createdDate.getDate().toString().padStart(2, "0")} ${createdDate.toLocaleString("ar-SA", { month: "short" })} ${createdDate.getFullYear()}`}
          tone="cyan"
        />

        <MetaCard
          icon={Clock}
          label="أيام منذ الإنشاء"
          value={`${daysSinceCreation} يوم`}
          tone="slate"
        />

        <MetaCard
          icon={Edit3}
          label="منذ آخر تعديل"
          value={`${daysSinceUpdate} يوم`}
          tone={delayTone}
        />
      </div>

      {/* Owners + transaction identifiers */}
      <div className="relative z-[60] grid grid-cols-1 gap-5 xl:grid-cols-4">
        <SectionCard
          className="xl:col-span-2"
          icon={Users}
          title="المُلّاك / أصحاب المعاملة"
          subtitle="المالك الرئيسي والشركاء الإضافيون المرتبطون بالمعاملة."
        >
          {isEditingBasic ? (
            <div className="space-y-4">
              <OwnerEditorBlock label="المالك الرئيسي *" tone="blue">
                <DropdownLayer>
                  <SearchableSelect
                    options={clientsOptions}
                    value={editFormData.clientId}
                    placeholder={
                      editFormData.clientName ||
                      displayOwners[0] ||
                      "ابحث بالاسم..."
                    }
                    onChange={(val, opt) =>
                      setEditFormData({
                        ...editFormData,
                        clientId: val,
                        clientName: opt.label,
                        client: opt.label,
                      })
                    }
                  />
                </DropdownLayer>
              </OwnerEditorBlock>

              {(editFormData.additionalOwners || []).map((owner, idx) => (
                <OwnerEditorBlock
                  key={idx}
                  label="شريك إضافي"
                  tone="slate"
                  action={
                    <AccessControl
                      code="BASIC_TAB_REMOVE_OWNER"
                      permissionNumber={43}
                      name="إزالة مالك إضافي من المعاملة"
                      moduleName="تفاصيل المعاملة"
                      tabName="البيانات الأساسية"
                    >
                      <button
                        onClick={() => removeOwnerRow(idx)}
                        className="
                          grid h-10 w-10 shrink-0 place-items-center
                          rounded-xl border border-rose-200
                          bg-rose-50 text-rose-600
                          transition hover:bg-rose-100
                        "
                        title="إزالة الشريك"
                        type="button"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </AccessControl>
                  }
                >
                  <DropdownLayer>
                    <SearchableSelect
                      options={clientsOptions}
                      value={owner.clientId}
                      placeholder={owner.ownerName || "ابحث عن الشريك..."}
                      onChange={(val, opt) =>
                        updateAdditionalOwner(idx, val, opt)
                      }
                    />
                  </DropdownLayer>
                </OwnerEditorBlock>
              ))}

              <AccessControl
                code="BASIC_TAB_ADD_OWNER"
                permissionNumber={44}
                name="إضافة مالك أو شريك إضافي"
                moduleName="تفاصيل المعاملة"
                tabName="البيانات الأساسية"
              >
                <button
                  onClick={addOwnerRow}
                  className="
                    flex h-11 w-full items-center justify-center gap-2
                    rounded-2xl border border-dashed border-[#d8b46a]/45
                    bg-[#fbf8f1] text-xs font-black text-[#123f59]
                    transition hover:bg-[#f8efe0]
                  "
                  type="button"
                >
                  <Plus className="h-4 w-4 text-[#c5983c]" />
                  إضافة شريك / مالك آخر
                </button>
              </AccessControl>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="space-y-2">
                {displayOwners.map((ownerName, idx) => (
                  <div
                    key={idx}
                    className="
                      flex items-center justify-between gap-3
                      rounded-2xl border border-[#e8ddc8]
                      bg-[#fbf8f1]/65 px-4 py-3
                    "
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <span
                        className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                          idx === 0 ? "bg-[#123f59]" : "bg-[#c5983c]"
                        }`}
                      />

                      <span className="truncate text-sm font-black text-[#123f59]">
                        {safeText(ownerName)}
                      </span>
                    </div>

                    {idx === 0 && displayOwners.length > 1 && (
                      <span
                        className="
                          shrink-0 rounded-xl border border-blue-200
                          bg-blue-50 px-2.5 py-1
                          text-[9px] font-black text-blue-700
                        "
                      >
                        رئيسي
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {tx.clientObj && (
                <div className="grid grid-cols-1 gap-2 border-t border-[#e8ddc8] pt-3 sm:grid-cols-3">
                  <MiniInfo
                    icon={CreditCard}
                    label="الهوية"
                    value={
                      tx.clientObj.idNumber ||
                      tx.clientObj.identification?.idNumber ||
                      "—"
                    }
                    dir="ltr"
                  />

                  <MiniInfo
                    icon={ShieldCheck}
                    label="فئة التصنيف"
                    value={
                      tx.clientObj.grade
                        ? `الفئة ${tx.clientObj.grade}`
                        : "غير مصنف"
                    }
                  />

                  <MiniInfo
                    icon={FileText}
                    label="معاملات العميل"
                    value={tx.clientObj._count?.transactions || 1}
                    dir="ltr"
                  />
                </div>
              )}
            </div>
          )}
        </SectionCard>

        <SectionCard
          icon={Landmark}
          title="رقم المعاملة"
          subtitle="الرقم الداخلي في النظام."
        >
          {isEditingBasic ? (
            <div className="grid grid-cols-2 gap-2">
              <select
                value={editFormData.year}
                onChange={(e) => handleTextChange("year", e.target.value)}
                className={INPUT_CLASS}
              >
                {[2023, 2024, 2025, 2026, 2027].map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>

              <select
                value={editFormData.month}
                onChange={(e) => handleTextChange("month", e.target.value)}
                className={INPUT_CLASS}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                  <option key={m} value={String(m).padStart(2, "0")}>
                    {String(m).padStart(2, "0")}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div
              className="font-mono text-3xl font-black text-[#123f59]"
              dir="ltr"
            >
              {tx.ref || tx.id.slice(-6)}
            </div>
          )}
        </SectionCard>

        <SectionCard
          icon={Layers}
          title="نوع المعاملة"
          subtitle="تصنيف العملية الحالية."
        >
          {isEditingBasic ? (
            <select
              value={editFormData.type}
              onChange={(e) => handleTextChange("type", e.target.value)}
              className={INPUT_CLASS}
            >
              <option>اصدار</option>
              <option>تجديد وتعديل</option>
              <option>تصحيح وضع مبني قائم</option>
            </select>
          ) : (
            <div className="text-lg font-black text-[#123f59]">
              {safeText(tx.type || tx.category)}
            </div>
          )}
        </SectionCard>
      </div>

      {/* Internal name + general notes */}
      <div className="relative z-[20] grid grid-cols-1 gap-5 xl:grid-cols-2">
        <SectionCard
          icon={EyeOff}
          title="الاسم المتداول للمعاملة"
          subtitle="مرجع داخلي لتسهيل التعرف على المعاملة."
        >
          <div className="space-y-3">
            {isEditingBasic && (
              <label
                className="
                  flex w-fit cursor-pointer items-center gap-2
                  rounded-2xl border border-[#d8b46a]/25
                  bg-[#fbf8f1] px-3 py-2
                  text-[10px] font-black text-[#64748b]
                  transition hover:bg-[#f8efe0]
                "
              >
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-[#123f59]"
                  checked={editFormData.isInternalNameHidden}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      isInternalNameHidden: e.target.checked,
                    })
                  }
                />

                <EyeOff className="h-3.5 w-3.5 text-[#c5983c]" />
                إخفاء من التقارير
              </label>
            )}

            {isEditingBasic ? (
              <input
                type="text"
                value={editFormData.internalName}
                onChange={(e) =>
                  handleTextChange("internalName", e.target.value)
                }
                className={INPUT_CLASS}
                placeholder="مثال: فيلا الياسمين..."
              />
            ) : (
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xl font-black leading-tight text-[#123f59]">
                  {tx.internalName || tx.notes?.internalName || "—"}
                </span>

                {tx.notes?.isInternalNameHidden && (
                  <span
                    className="
                      inline-flex items-center gap-1 rounded-xl
                      border border-slate-200 bg-slate-100
                      px-2.5 py-1 text-[9px]
                      font-black text-slate-600
                    "
                  >
                    <EyeOff className="h-3 w-3" />
                    سري / داخلي
                  </span>
                )}
              </div>
            )}
          </div>
        </SectionCard>

        <SectionCard
          icon={MessageSquareText}
          title="ملاحظات عامة وإرشادات"
          subtitle={
            tx.notes?.generalNotes && !isEditingBasic
              ? `آخر تعديل: ${tx.notes?.generalNotesUpdatedBy || "موظف"}`
              : "ملاحظات تشغيلية مرتبطة بالمعاملة."
          }
        >
          {isEditingBasic ? (
            <div className="space-y-3">
              <textarea
                value={editFormData.generalNotes || tx.notes?.generalNotes || ""}
                onChange={(e) =>
                  handleTextChange("generalNotes", e.target.value)
                }
                placeholder="اكتب الملاحظات..."
                className={`${INPUT_CLASS} min-h-[110px] resize-none leading-7`}
              />

              <div
                className="
                  flex flex-col gap-2 rounded-2xl
                  border border-amber-200 bg-amber-50/65
                  p-3 sm:flex-row sm:items-center sm:justify-between
                "
              >
                <AccessControl
                  code="BASIC_TAB_UPLOAD_GENERAL_NOTES_FILE"
                  permissionNumber={45}
                  name="إرفاق مستند توضيحي للملاحظات العامة"
                  moduleName="تفاصيل المعاملة"
                  tabName="البيانات الأساسية"
                >
                  <label
                    className="
                      flex cursor-pointer items-center gap-2
                      rounded-xl border border-amber-200 bg-white
                      px-3 py-2 text-[10px]
                      font-black text-amber-700
                      transition hover:bg-amber-100
                    "
                  >
                    <Paperclip className="h-4 w-4" />
                    إرفاق مستند للتوضيح

                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) =>
                        setEditFormData((prev) => ({
                          ...prev,
                          generalNotesFile: e.target.files[0],
                        }))
                      }
                    />
                  </label>
                </AccessControl>

                {editFormData.generalNotesFile && (
                  <span
                    className="
                      max-w-[220px] truncate rounded-xl
                      border border-amber-200 bg-white
                      px-3 py-1.5 font-mono text-[10px]
                      font-black text-[#123f59]
                    "
                  >
                    {editFormData.generalNotesFile.name}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div
              className="
                rounded-[22px] border border-amber-200
                bg-amber-50/55 p-4
                text-sm font-bold leading-8 text-[#475569]
                whitespace-pre-wrap
              "
            >
              {tx.notes?.generalNotes || (
                <span className="text-xs font-normal italic text-[#94a3b8]">
                  لا توجد ملاحظات عامة مسجلة.
                </span>
              )}

              {tx.notes?.generalNotesFileUrl && (
                <div className="mt-4 border-t border-amber-200 pt-3">
                  <AccessControl
                    code="BASIC_TAB_OPEN_GENERAL_NOTES_ATTACHMENT"
                    permissionNumber={46}
                    name="عرض المرفق التوضيحي للملاحظات العامة"
                    moduleName="تفاصيل المعاملة"
                    tabName="البيانات الأساسية"
                  >
                    <button
                      onClick={() =>
                        window.open(
                          `${backendUrl || ""}${tx.notes.generalNotesFileUrl}`,
                          "_blank",
                        )
                      }
                      className="
                        inline-flex items-center gap-1.5 rounded-2xl
                        border border-blue-200 bg-blue-50
                        px-3 py-2 text-[10px]
                        font-black text-blue-700
                        transition hover:bg-blue-100
                      "
                      type="button"
                    >
                      <Paperclip className="h-3.5 w-3.5" />
                      عرض المرفق التوضيحي
                    </button>
                  </AccessControl>
                </div>
              )}
            </div>
          )}
        </SectionCard>
      </div>

      {/* Location */}
      <div className="relative z-[10]">
        <SectionCard
          icon={MapPinned}
          title="تفاصيل الموقع والمساحة والتخطيط"
          subtitle="بيانات الأرض، الحي، المخطط، القطع، الخرائط، والصورة الجوية."
        >
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
            <div className="space-y-6 xl:col-span-8">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <FieldBlock label="رقم المخطط">
                  {isEditingBasic ? (
                    <div className="flex gap-2">
                      <div className="min-w-0 flex-1">
                        <DropdownLayer>
                          <SearchableSelect
                            options={plansOptions}
                            value={editFormData.plan}
                            placeholder={editFormData.plan || "اختر المخطط..."}
                            onChange={(val) =>
                              setEditFormData((p) => ({
                                ...p,
                                plan: val,
                              }))
                            }
                          />
                        </DropdownLayer>
                      </div>

                      <AccessControl
                        code="BASIC_TAB_OPEN_QUICK_ADD_PLAN"
                        permissionNumber={47}
                        name="فتح نافذة إضافة مخطط جديد"
                        moduleName="تفاصيل المعاملة"
                        tabName="البيانات الأساسية"
                      >
                        <button
                          type="button"
                          onClick={() => setIsQuickAddPlanOpen(true)}
                          className="
                            grid h-11 w-11 shrink-0 place-items-center
                            rounded-2xl border border-blue-200
                            bg-blue-50 text-blue-700
                            transition hover:bg-blue-600 hover:text-white
                          "
                        >
                          <Plus className="h-5 w-5" />
                        </button>
                      </AccessControl>
                    </div>
                  ) : (
                    <ReadValue
                      icon={Layers}
                      value={
                        tx.plan ||
                        tx.planNumber ||
                        tx.notes?.refs?.plan ||
                        "—"
                      }
                      dir="ltr"
                    />
                  )}
                </FieldBlock>

                <FieldBlock label="الحي والقطاع">
                  {isEditingBasic ? (
                    <DropdownLayer>
                      <SearchableSelect
                        options={districtsOptions}
                        value={editFormData.districtId}
                        placeholder={
                          editFormData.district ||
                          tx.districtNode?.name ||
                          tx.districtName ||
                          "تعديل الحي..."
                        }
                        onChange={(val, opt) =>
                          setEditFormData({
                            ...editFormData,
                            districtId: val,
                            district: opt.label.split(" (")[0],
                            districtName: opt.label.split(" (")[0],
                            sector: opt.sectorName,
                          })
                        }
                      />
                    </DropdownLayer>
                  ) : (
                    <ReadValue
                      icon={Map}
                      value={`${safeText(
                        tx.districtNode?.name ||
                          tx.districtName ||
                          tx.district ||
                          tx.notes?.refs?.districtName,
                      )} | ${safeText(
                        tx.districtNode?.sector?.name ||
                          tx.sector ||
                          tx.notes?.refs?.sector,
                      )}`}
                    />
                  )}
                </FieldBlock>

                <FieldBlock label="موقع استراتيجي">
                  {isEditingBasic ? (
                    <select
                      value={
                        editFormData.isOnAxis !== undefined
                          ? editFormData.isOnAxis
                          : tx.isOnAxis || tx.notes?.refs?.isOnAxis || "لا"
                      }
                      onChange={(e) =>
                        handleTextChange("isOnAxis", e.target.value)
                      }
                      className={INPUT_CLASS}
                    >
                      <option value="لا">لا يقع على المحاور</option>
                      <option value="نعم">نعم (يقع على المحاور)</option>
                    </select>
                  ) : (
                    <ReadValue
                      icon={Globe}
                      tone={
                        (tx.isOnAxis || tx.notes?.refs?.isOnAxis) === "نعم"
                          ? "amber"
                          : "slate"
                      }
                      value={
                        (tx.isOnAxis || tx.notes?.refs?.isOnAxis) === "نعم"
                          ? "يقع على المحاور التجارية"
                          : "طبيعي (داخل الحي)"
                      }
                    />
                  )}
                </FieldBlock>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FieldBlock label="المساحة الإجمالية">
                  {isEditingBasic ? (
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={editFormData.area}
                        onChange={(e) =>
                          handleEditChange("area", e.target.value)
                        }
                        className={`${INPUT_CLASS} font-mono text-lg`}
                        placeholder="0"
                      />

                      <span
                        className="
                          flex h-12 items-center justify-center
                          rounded-2xl border border-[#d8b46a]/25
                          bg-[#fbf8f1] px-4
                          text-xs font-black text-[#64748b]
                        "
                      >
                        م²
                      </span>
                    </div>
                  ) : (
                    <ReadValue
                      icon={Ruler}
                      tone="blue"
                      dir="ltr"
                      value={
                        tx.landArea ||
                        tx.notes?.refs?.landArea ||
                        tx.notes?.refs?.area
                          ? `${parseFloat(
                              tx.landArea ||
                                tx.notes?.refs?.landArea ||
                                tx.notes?.refs?.area,
                            ).toLocaleString()} م²`
                          : "—"
                      }
                    />
                  )}
                </FieldBlock>

                <FieldBlock label="اسم الشارع المطل عليه وعرضه">
                  {isEditingBasic ? (
                    <input
                      type="text"
                      value={editFormData.streetName}
                      onChange={(e) =>
                        handleTextChange("streetName", e.target.value)
                      }
                      className={INPUT_CLASS}
                      placeholder="مثال: شارع العليا (عرض 36م)"
                    />
                  ) : (
                    <ReadValue
                      icon={Globe}
                      value={
                        tx.streetName ||
                        tx.notes?.refs?.streetName ||
                        "غير مسجل"
                      }
                    />
                  )}
                </FieldBlock>
              </div>

              <div className="border-t border-[#e8ddc8] pt-5">
                <h5 className="mb-3 text-xs font-black text-[#123f59]">
                  خرائط وروابط الموقع
                </h5>

                {isEditingBasic ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      dir="ltr"
                      value={editFormData.mapsLink}
                      onChange={(e) =>
                        handleTextChange("mapsLink", e.target.value)
                      }
                      className={`${INPUT_CLASS} font-mono text-xs`}
                      placeholder="رابط Google Maps"
                    />

                    <input
                      type="text"
                      dir="ltr"
                      value={editFormData.officialMapLink}
                      onChange={(e) =>
                        handleTextChange("officialMapLink", e.target.value)
                      }
                      className={`${INPUT_CLASS} font-mono text-xs`}
                      placeholder="رابط الخريطة الرسمية / الأمانة"
                    />
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    {tx.notes?.refs?.mapsLink ? (
                      <MapLinkCard
                        icon={MapPinned}
                        title="خرائط جوجل"
                        subtitle="Google Maps"
                        onOpen={() =>
                          window.open(tx.notes.refs.mapsLink, "_blank")
                        }
                        permission={{
                          code: "BASIC_TAB_OPEN_GOOGLE_MAPS",
                          permissionNumber: 48,
                          name: "فتح رابط Google Maps",
                        }}
                      />
                    ) : (
                      <EmptyInline text="لم يتم إدراج رابط Google Maps" />
                    )}

                    {(tx.officialMapLink ||
                      tx.notes?.refs?.officialMapLink) && (
                      <MapLinkCard
                        icon={Globe}
                        title="مستكشف الرياض / الأمانة"
                        subtitle="الخريطة الرسمية"
                        onOpen={() =>
                          window.open(
                            tx.officialMapLink ||
                              tx.notes.refs.officialMapLink,
                            "_blank",
                          )
                        }
                        permission={{
                          code: "BASIC_TAB_OPEN_OFFICIAL_MAP",
                          permissionNumber: 49,
                          name: "فتح رابط الخريطة الرسمية",
                        }}
                      />
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4 xl:col-span-4">
              <div
                className="
                  rounded-[24px] border border-[#d8b46a]/30
                  bg-[#fbf8f1]/75 p-4
                "
              >
                <div className="mb-3 flex items-center justify-between gap-2 border-b border-[#e8ddc8] pb-3">
                  <h5 className="text-xs font-black text-[#123f59]">
                    أرقام القطع
                  </h5>

                  <span
                    className="
                      rounded-xl border border-blue-200
                      bg-blue-50 px-2.5 py-1
                      text-[10px] font-black text-blue-700
                    "
                  >
                    العدد: {plotsArray.length}
                  </span>
                </div>

                {isEditingBasic ? (
                  <div className="space-y-2">
                    <textarea
                      value={
                        Array.isArray(editFormData.plots)
                          ? editFormData.plots.join(", ")
                          : editFormData.plots || ""
                      }
                      onChange={(e) =>
                        handleEditChange("plots", e.target.value)
                      }
                      className={`${INPUT_CLASS} min-h-[110px] resize-none font-mono text-xs`}
                      placeholder="أدخل أرقام القطع مفصولة بفاصلة (12, 13, 14)..."
                    />

                    <p className="text-[9px] font-bold text-[#94a3b8]">
                      افصل بين كل رقم بفاصلة (,)
                    </p>
                  </div>
                ) : (
                  <div className="max-h-[150px] space-y-2 overflow-y-auto pr-1 custom-scrollbar-slim">
                    {plotsArray.length > 0 ? (
                      plotsArray.map((plot, i) => (
                        <div
                          key={i}
                          className="
                            rounded-xl border border-[#e8ddc8]
                            bg-white px-3 py-2
                            text-center font-mono text-sm
                            font-black text-[#123f59] shadow-sm
                          "
                        >
                          {plot}
                        </div>
                      ))
                    ) : (
                      <div className="py-6 text-center text-xs font-bold text-[#94a3b8]">
                        لا توجد قطع
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div
                className="
                  group relative flex min-h-[170px] flex-col
                  items-center justify-center overflow-hidden
                  rounded-[24px] border border-[#123f59]/20
                  bg-[#06111d] text-center shadow-sm
                "
              >
                {siteImagePreview ? (
                  <>
                    <img
                      src={siteImagePreview}
                      alt="الموقع"
                      className="
                        absolute inset-0 h-full w-full object-cover
                        opacity-55 transition-opacity group-hover:opacity-35
                      "
                    />

                    <div className="relative z-10 flex flex-col items-center gap-2">
                      <AccessControl
                        code="BASIC_TAB_PREVIEW_SITE_IMAGE"
                        permissionNumber={50}
                        name="معاينة الصورة الجوية للموقع"
                        moduleName="تفاصيل المعاملة"
                        tabName="البيانات الأساسية"
                      >
                        <button
                          onClick={() =>
                            !isEditingBasic && setIsSiteImageModalOpen(true)
                          }
                          className="
                            grid h-12 w-12 place-items-center
                            rounded-2xl border border-white/20
                            bg-white/15 text-white
                            backdrop-blur-md transition hover:bg-white/30
                          "
                          type="button"
                        >
                          <ImageIcon className="h-6 w-6" />
                        </button>
                      </AccessControl>

                      <span className="text-[11px] font-black text-white drop-shadow">
                        الصورة الجوية للموقع
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-2 opacity-70">
                    <ImageIcon className="h-9 w-9 text-white" />

                    <span className="text-[11px] font-black text-white">
                      لا توجد صورة جوية
                    </span>
                  </div>
                )}

                {isEditingBasic && (
                  <AccessControl
                    code="BASIC_TAB_UPLOAD_SITE_IMAGE"
                    permissionNumber={51}
                    name="تغيير الصورة الجوية للموقع"
                    moduleName="تفاصيل المعاملة"
                    tabName="البيانات الأساسية"
                  >
                    <label
                      className="
                        absolute inset-0 z-20 flex cursor-pointer flex-col
                        items-center justify-center bg-black/55
                        opacity-0 transition-opacity group-hover:opacity-100
                      "
                    >
                      <Upload className="mb-1 h-7 w-7 text-white" />

                      <span className="text-xs font-black text-white">
                        تغيير الصورة
                      </span>

                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleSiteImageChange}
                      />
                    </label>
                  </AccessControl>
                )}
              </div>
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Offices */}
      <div className="relative z-[5] grid grid-cols-1 gap-5 xl:grid-cols-2">
        <OfficeCard
          icon={Building2}
          title="المكتب المشرف"
          subtitle="الجهة الإشرافية المعتمدة."
          tone="purple"
          isEditing={isEditingBasic}
          value={
            editFormData.supervisingOfficeId ||
            tx.supervisorOfficeId ||
            tx.requestData?.supervisorOffice ||
            ""
          }
          onChange={(e) =>
            handleTextChange("supervisingOfficeId", e.target.value)
          }
          offices={offices}
          displayValue={
            tx.supervisorOfficeId || tx.requestData?.supervisorOffice
              ? offices.find(
                  (o) =>
                    o.id ===
                      (tx.supervisorOfficeId ||
                        tx.requestData?.supervisorOffice) ||
                    o.name ===
                      (tx.supervisorOfficeId ||
                        tx.requestData?.supervisorOffice),
                )?.name ||
                tx.supervisorOfficeId ||
                tx.requestData?.supervisorOffice
              : ""
          }
          emptyText="لم يتم تحديد مكتب مشرف لهذه المعاملة"
        />

        <OfficeCard
          icon={Building}
          title="المكتب المصمم"
          subtitle="الجهة المسؤولة عن التصميم."
          tone="cyan"
          isEditing={isEditingBasic}
          value={
            editFormData.designingOfficeId ||
            tx.designerOfficeId ||
            tx.requestData?.designerOffice ||
            ""
          }
          onChange={(e) =>
            handleTextChange("designingOfficeId", e.target.value)
          }
          offices={offices}
          displayValue={
            tx.designerOfficeId || tx.requestData?.designerOffice
              ? offices.find(
                  (o) =>
                    o.id ===
                      (tx.designerOfficeId || tx.requestData?.designerOffice) ||
                    o.name ===
                      (tx.designerOfficeId || tx.requestData?.designerOffice),
                )?.name ||
                tx.designerOfficeId ||
                tx.requestData?.designerOffice
              : ""
          }
          emptyText="هذه المعاملة بتصميم داخلي (مكتب ديتيلز)"
        />
      </div>

      {/* Quick add plan modal */}
      {isQuickAddPlanOpen && (
        <QuickAddPlanModal
          newPlanName={newPlanName}
          setNewPlanName={setNewPlanName}
          onClose={() => setIsQuickAddPlanOpen(false)}
          onConfirm={() => quickAddPlanMutation.mutate(newPlanName)}
          isPending={quickAddPlanMutation.isPending}
        />
      )}

      {/* Save button */}
      {isEditingBasic && (
        <div
          className="
            relative z-10 mx-auto my-6 flex w-full justify-center
            rounded-[28px] border border-[#d8b46a]/25
            bg-white/65 px-4 py-5
            shadow-[0_12px_30px_rgba(18,63,89,0.06)]
            backdrop-blur-xl
            animate-in slide-in-from-bottom-5
          "
        >
          <AccessControl
            code="BASIC_TAB_SAVE_COMPREHENSIVE_EDITS"
            permissionNumber={53}
            name="حفظ وتطبيق التعديلات الشاملة"
            moduleName="تفاصيل المعاملة"
            tabName="البيانات الأساسية"
          >
            <button
              onClick={handleSaveAll}
              disabled={updateTxMutation.isPending}
              className="
                flex max-w-full items-center justify-center gap-3 rounded-full
                bg-gradient-to-l from-[#123f59] via-[#15536f] to-[#0e7490]
                px-8 py-3.5 text-sm font-black text-white
                shadow-[0_18px_45px_rgba(18,63,89,0.22)]
                transition hover:-translate-y-[2px]
                disabled:cursor-not-allowed disabled:opacity-50
              "
              type="button"
            >
              {updateTxMutation.isPending ? (
                <Loader2 className="h-5 w-5 animate-spin text-[#e2bf74]" />
              ) : (
                <Save className="h-5 w-5 text-[#e2bf74]" />
              )}

              حفظ وتطبيق التعديلات الشاملة
            </button>
          </AccessControl>
        </div>
      )}

      {/* Site image modal */}
      {isSiteImageModalOpen && siteImagePreview && (
        <div
          className="
            fixed inset-0 z-[200] flex items-center justify-center
            bg-black/90 p-4 backdrop-blur-sm animate-in fade-in
          "
          onClick={() => setIsSiteImageModalOpen(false)}
        >
          <div
            className="relative h-[82vh] w-full max-w-6xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsSiteImageModalOpen(false)}
              className="
                absolute -top-14 right-0 grid h-11 w-11
                place-items-center rounded-2xl
                bg-white/10 text-white
                transition hover:bg-white/30
              "
              type="button"
            >
              <X className="h-6 w-6" />
            </button>

            <img
              src={siteImagePreview}
              alt="الصورة الجوية"
              className="
                h-full w-full rounded-3xl object-contain
                border border-white/15 bg-black
                shadow-[0_28px_80px_rgba(0,0,0,0.45)]
              "
            />
          </div>
        </div>
      )}
    </div>
  );
};

const DropdownLayer = ({ children }) => (
  <div className="relative z-[9999] overflow-visible">{children}</div>
);

const SectionCard = ({ icon: Icon, title, subtitle, children, className = "" }) => (
  <section
    className={`
      relative overflow-visible rounded-[28px]
      border border-[#d8b46a]/30 bg-white/90
      shadow-[0_16px_40px_rgba(18,63,89,0.08)]
      backdrop-blur-xl
      ${className}
    `}
  >
    <div
      className="
        overflow-hidden rounded-t-[28px]
        flex items-center gap-3 border-b border-[#e8ddc8]
        bg-gradient-to-l from-[#fbf8f1] via-white to-[#eef7f6]
        px-5 py-4
      "
    >
      <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#123f59] text-[#e2bf74]">
        <Icon className="h-5 w-5" />
      </span>

      <div className="min-w-0">
        <h4 className="truncate text-sm font-black text-[#123f59]">
          {title}
        </h4>

        <p className="mt-0.5 text-[11px] font-bold text-[#64748b]">
          {subtitle}
        </p>
      </div>
    </div>

    <div className="relative z-20 overflow-visible p-5">{children}</div>
  </section>
);

const MetaCard = ({ icon: Icon, label, value, tone = "blue" }) => {
  const tones = {
    blue: "border-blue-200 bg-blue-50 text-blue-700",
    cyan: "border-cyan-200 bg-cyan-50 text-cyan-800",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
    amber: "border-amber-200 bg-amber-50 text-amber-700",
    rose: "border-rose-200 bg-rose-50 text-rose-700",
    slate: "border-slate-200 bg-slate-100 text-slate-700",
  };

  return (
    <div
      className="
        rounded-[24px] border border-[#d8b46a]/30
        bg-white/90 p-4
        shadow-[0_14px_34px_rgba(18,63,89,0.08)]
        backdrop-blur-xl
      "
    >
      <div className="flex items-center gap-3">
        <span
          className={`
            grid h-11 w-11 shrink-0 place-items-center
            rounded-2xl border
            ${tones[tone] || tones.blue}
          `}
        >
          <Icon className="h-5 w-5" />
        </span>

        <div className="min-w-0">
          <p className="text-[11px] font-black text-[#64748b]">{label}</p>

          <p className="mt-1 truncate text-sm font-black text-[#123f59]">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
};

const StatusPill = ({ tone, label }) => {
  const tones = {
    emerald: "border-emerald-300/25 bg-emerald-400/15 text-emerald-100",
    amber: "border-amber-300/25 bg-amber-400/15 text-amber-100",
    rose: "border-rose-300/25 bg-rose-400/15 text-rose-100",
  };

  return (
    <div
      className={`
        flex h-11 items-center gap-2 rounded-2xl border px-4
        text-xs font-black
        ${tones[tone] || tones.emerald}
      `}
    >
      <AlertTriangle
        className={tone === "rose" ? "h-4 w-4 animate-pulse" : "h-4 w-4"}
      />
      {label}
    </div>
  );
};

const OwnerEditorBlock = ({ label, tone = "blue", children, action }) => {
  const tones = {
    blue: "border-blue-200 bg-blue-50 text-blue-700",
    slate: "border-slate-200 bg-slate-100 text-slate-600",
  };

  return (
    <div
      className="
        relative overflow-visible rounded-[22px]
        border border-[#e8ddc8]
        bg-[#fbf8f1]/70 p-3 pt-5
      "
    >
      <span
        className={`
          absolute -top-2.5 right-4 rounded-xl border
          px-2.5 py-0.5 text-[9px] font-black
          ${tones[tone] || tones.blue}
        `}
      >
        {label}
      </span>

      <div className="relative z-20 flex items-center gap-2 overflow-visible">
        <div className="min-w-0 flex-1 overflow-visible">{children}</div>
        {action}
      </div>
    </div>
  );
};

const MiniInfo = ({ icon: Icon, label, value, dir = "rtl" }) => (
  <div
    className="
      rounded-2xl border border-[#e8ddc8]
      bg-[#fbf8f1]/70 p-3
    "
  >
    <p className="mb-1 flex items-center gap-1 text-[9px] font-black text-[#94a3b8]">
      <Icon className="h-3 w-3 text-[#c5983c]" />
      {label}
    </p>

    <p className="truncate text-xs font-black text-[#123f59]" dir={dir}>
      {value}
    </p>
  </div>
);

const FieldBlock = ({ label, children }) => (
  <div className="relative z-20 space-y-1.5 overflow-visible">
    <label className="block text-[10px] font-black text-[#64748b]">
      {label}
    </label>

    {children}
  </div>
);

const ReadValue = ({ icon: Icon, value, tone = "slate", dir = "rtl" }) => {
  const tones = {
    blue: "border-blue-200 bg-blue-50 text-blue-700",
    amber: "border-amber-200 bg-amber-50 text-amber-700",
    slate: "border-[#e8ddc8] bg-[#fbf8f1] text-[#123f59]",
  };

  return (
    <div
      className={`
        flex min-h-[46px] items-center gap-2
        rounded-2xl border px-3 py-2
        text-sm font-black
        ${tones[tone] || tones.slate}
      `}
      dir={dir}
    >
      <Icon className="h-4 w-4 shrink-0 text-[#c5983c]" />
      <span className="truncate">{value}</span>
    </div>
  );
};

const MapLinkCard = ({ icon: Icon, title, subtitle, onOpen, permission }) => (
  <div
    className="
      flex items-center gap-3 rounded-[22px]
      border border-[#d8b46a]/25 bg-white
      p-3 shadow-sm
    "
  >
    <AccessControl
      code={permission.code}
      permissionNumber={permission.permissionNumber}
      name={permission.name}
      moduleName="تفاصيل المعاملة"
      tabName="البيانات الأساسية"
    >
      <button
        onClick={onOpen}
        className="
          grid h-11 w-11 place-items-center
          rounded-2xl bg-[#123f59]
          text-[#e2bf74]
          transition hover:bg-[#0f3448]
        "
        type="button"
      >
        <Icon className="h-5 w-5" />
      </button>
    </AccessControl>

    <div>
      <div className="text-[10px] font-black text-[#94a3b8]">{title}</div>

      <div className="text-xs font-black text-[#123f59]">{subtitle}</div>
    </div>

    <div
      className="
        grid h-12 w-12 place-items-center rounded-2xl
        border border-[#e8ddc8] bg-[#fbf8f1]
      "
    >
      <QrCode className="h-7 w-7 text-[#64748b]/60" />
    </div>
  </div>
);

const EmptyInline = ({ text }) => (
  <div
    className="
      rounded-2xl border border-dashed border-[#d8b46a]/35
      bg-[#fbf8f1]/70 px-4 py-3
      text-xs font-black text-[#94a3b8]
    "
  >
    {text}
  </div>
);

const OfficeCard = ({
  icon: Icon,
  title,
  subtitle,
  isEditing,
  value,
  onChange,
  offices,
  displayValue,
  emptyText,
  tone = "cyan",
}) => {
  const tones = {
    cyan: "border-cyan-200 bg-cyan-50 text-cyan-800",
    purple: "border-purple-200 bg-purple-50 text-purple-700",
  };

  return (
    <SectionCard icon={Icon} title={title} subtitle={subtitle}>
      {isEditing ? (
        <select value={value} onChange={onChange} className={INPUT_CLASS}>
          <option value="">-- اختر من القائمة --</option>

          {offices.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name}
            </option>
          ))}
        </select>
      ) : displayValue ? (
        <div
          className={`
            rounded-[22px] border p-4
            ${tones[tone] || tones.cyan}
          `}
        >
          <div className="mb-1 text-lg font-black">{displayValue}</div>

          <div className="text-xs font-bold opacity-80">{subtitle}</div>
        </div>
      ) : (
        <div
          className="
            rounded-[22px] border border-dashed border-[#d8b46a]/35
            bg-[#fbf8f1]/70 py-8 text-center
            text-xs font-black text-[#94a3b8]
          "
        >
          {emptyText}
        </div>
      )}
    </SectionCard>
  );
};

const QuickAddPlanModal = ({
  newPlanName,
  setNewPlanName,
  onClose,
  onConfirm,
  isPending,
}) => (
  <div
    className="
      fixed inset-0 z-[210] flex items-center justify-center
      bg-[#06111d]/70 p-4 backdrop-blur-md
      animate-in fade-in
    "
    dir="rtl"
  >
    <div
      className="
        w-full max-w-sm overflow-hidden rounded-[30px]
        border border-[#d8b46a]/35 bg-white
        shadow-[0_30px_90px_rgba(0,0,0,0.35)]
        animate-in zoom-in-95
      "
    >
      <div
        className="
          relative overflow-hidden
          bg-gradient-to-l from-[#06111d] via-[#123f59] to-[#0e7490]
          px-5 py-4 text-white
        "
      >
        <div className="relative z-10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span
              className="
                grid h-11 w-11 place-items-center rounded-2xl
                border border-[#e2bf74]/35 bg-white/12
                text-[#e2bf74]
              "
            >
              <Layers className="h-5 w-5" />
            </span>

            <div>
              <h4 className="text-sm font-black">إضافة مخطط جديد</h4>
              <p className="mt-0.5 text-[11px] font-bold text-white/60">
                تسجيل المخطط داخل السجل.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="
              grid h-10 w-10 place-items-center rounded-2xl
              bg-white/10 text-white transition hover:bg-rose-500/40
            "
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="space-y-4 p-5">
        <FieldBlock label="رقم المخطط الجديد">
          <input
            type="text"
            value={newPlanName}
            onChange={(e) => setNewPlanName(e.target.value)}
            className={INPUT_CLASS}
            placeholder="مثال: 1234 / أ / 2"
            autoFocus
          />
        </FieldBlock>

        <AccessControl
          code="BASIC_TAB_CONFIRM_QUICK_ADD_PLAN"
          permissionNumber={52}
          name="تأكيد إضافة مخطط جديد للسجل"
          moduleName="تفاصيل المعاملة"
          tabName="البيانات الأساسية"
        >
          <button
            onClick={onConfirm}
            disabled={!newPlanName || isPending}
            className="
              flex h-12 w-full items-center justify-center gap-2
              rounded-2xl bg-gradient-to-l from-[#123f59] via-[#15536f] to-[#0e7490]
              text-xs font-black text-white
              shadow-[0_14px_30px_rgba(18,63,89,0.22)]
              transition hover:-translate-y-[1px]
              disabled:cursor-not-allowed disabled:opacity-50
            "
            type="button"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin text-[#e2bf74]" />
            ) : (
              <CheckCircle className="h-4 w-4 text-[#e2bf74]" />
            )}
            تأكيد الإضافة للسجل
          </button>
        </AccessControl>
      </div>
    </div>
  </div>
);

const INPUT_CLASS = `
  h-12 w-full rounded-2xl
  border border-[#d8b46a]/25 bg-white
  px-4 text-sm font-bold text-[#123f59]
  shadow-sm outline-none transition-all
  placeholder:text-slate-400
  focus:border-[#c5983c]/70
  focus:bg-white
  focus:ring-4 focus:ring-[#c5983c]/10
`;