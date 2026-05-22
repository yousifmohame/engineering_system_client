// src/components/RiyadhDivision/layout/NodeOverview.jsx
import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../../api/axios";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import {
  Map,
  Satellite,
  Link2,
  Copy,
  ExternalLink,
  PenLine,
  Loader2,
  ImageIcon,
  CircleAlert,
  Landmark,
  Edit,
  CircleCheck,
  X,
} from "lucide-react";

const IconWithText = ({
  icon: Icon,
  text,
  className = "",
  iconClassName = "",
  textClassName = "",
  vertical = false,
}) => {
  return (
    <span
      className={`
        inline-flex items-center justify-center
        ${vertical ? "flex-col gap-0.5" : "gap-1.5"}
        ${className}
      `}
    >
      {Icon && <Icon className={iconClassName || "h-3.5 w-3.5 shrink-0"} />}

      {text && (
        <span className={textClassName || "text-[10px] font-black leading-none"}>
          {text}
        </span>
      )}
    </span>
  );
};

const NodeOverview = ({
  selectedNode,
  selectedType,
  selectedSector,
  onEditRequest,
}) => {
  const queryClient = useQueryClient();

  const [editingField, setEditingField] = useState(null);
  const [tempValue, setTempValue] = useState("");

  const quickUpdateMutation = useMutation({
    mutationFn: async ({ id, type, data }) => {
      const endpoint =
        type === "sector"
          ? `/riyadh-streets/sectors/${id}`
          : `/riyadh-streets/districts/${id}`;

      return await api.put(endpoint, data);
    },
    onSuccess: () => {
      toast.success("تم التحديث بنجاح");

      queryClient.invalidateQueries({ queryKey: ["riyadh-tree"] });
      queryClient.invalidateQueries({ queryKey: ["sectors-list"] });
      queryClient.invalidateQueries({ queryKey: ["districts-list"] });

      setEditingField(null);
      setTempValue("");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "فشل التحديث");
    },
  });

  const handleStartEditing = (field) => {
    setTempValue(selectedNode?.[field] || "");
    setEditingField(field);
  };

  const handleCancelEditing = () => {
    setEditingField(null);
    setTempValue("");
  };

  const handleSaveInline = (field) => {
    quickUpdateMutation.mutate({
      id: selectedNode.id,
      type: selectedType,
      data: {
        [field]: tempValue,
      },
    });
  };

  const copyToClipboard = async (text) => {
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      toast.success("تم نسخ الرابط");
    } catch {
      toast.error("تعذر نسخ الرابط");
    }
  };

  const isSector = selectedType === "sector";

  const nodeTitle = isSector
    ? `قطاع ${selectedNode?.name || ""}`
    : `حي ${selectedNode?.name || ""}`;

  const mainCountLabel = isSector ? "الأحياء التابعة" : "الشوارع الموثقة";
  const mainCountValue = isSector
    ? selectedNode?.neighborhoods?.length || 0
    : selectedNode?.streets?.length || 0;

  const renderImageCard = (title, icon, dbField, placeholderText) => {
    const Icon = icon;
    const isEditing = editingField === dbField;
    const hasImage = Boolean(selectedNode?.[dbField]);

    return (
      <article
        className="
          flex min-w-[240px] flex-1 flex-col overflow-hidden
          rounded-[16px] border border-[#d8b46a]/25
          bg-white/90 shadow-[0_8px_22px_rgba(18,63,89,0.06)]
          backdrop-blur-xl transition-all
          hover:-translate-y-[1px] hover:shadow-[0_14px_30px_rgba(18,63,89,0.10)]
        "
      >
        <div
          className="
            flex items-center justify-between gap-3
            border-b border-[#e8ddc8]
            bg-gradient-to-l from-[#fbf8f1] via-white to-[#eef7f6]
            px-4 py-3
          "
        >
          <div className="flex min-w-0 items-center gap-2">
            <span
              className="
                inline-flex h-8 shrink-0 items-center justify-center gap-1.5 px-2.5
                rounded-xl bg-[#123f59] text-[#e2bf74]
              "
            >
              <Icon className="h-4 w-4" />
            </span>

            <div className="min-w-0">
              <h4 className="truncate text-xs font-black text-[#123f59]">
                {title}
              </h4>

              <p className="mt-0.5 text-[9px] font-bold text-[#94a3b8]">
                {hasImage ? "صورة مرتبطة بالسجل" : "لم يتم إدراج صورة بعد"}
              </p>
            </div>
          </div>

          {!isEditing && (
            <button
              onClick={() => handleStartEditing(dbField)}
              className="
                inline-flex h-8 shrink-0 items-center justify-center gap-1
                rounded-lg border border-[#d8b46a]/25
                bg-[#fbf8f1] px-2.5
                text-[9px] font-black text-[#123f59]
                transition hover:bg-[#f8efe0]
              "
              type="button"
            >
              <PenLine className="h-3.5 w-3.5 text-[#c5983c]" />
              {hasImage ? "تغيير" : "إضافة"}
            </button>
          )}
        </div>

        <div className="flex flex-1 flex-col p-3">
          {isEditing ? (
            <div
              className="
                flex min-h-[130px] flex-col justify-center gap-2
                rounded-2xl border border-[#d8b46a]/35
                bg-[#eef7f6]/60 p-3
              "
            >
              <input
                type="url"
                dir="ltr"
                placeholder="أدخل رابط الصورة المباشر..."
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                className={INPUT_CLASS}
              />

              <div className="flex gap-2">
                <button
                  onClick={() => handleSaveInline(dbField)}
                  disabled={quickUpdateMutation.isPending}
                  className="
                    inline-flex h-9 flex-1 items-center justify-center gap-1.5
                    rounded-xl bg-gradient-to-l from-[#123f59] via-[#15536f] to-[#0e7490]
                    text-[10px] font-black text-white
                    shadow-[0_10px_22px_rgba(18,63,89,0.16)]
                    transition hover:-translate-y-[1px]
                    disabled:cursor-not-allowed disabled:opacity-50
                  "
                  type="button"
                >
                  {quickUpdateMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin text-[#e2bf74]" />
                  ) : (
                    <CircleCheck className="h-4 w-4 text-[#e2bf74]" />
                  )}
                  حفظ
                </button>

                <button
                  onClick={handleCancelEditing}
                  className="
                    h-9 flex-1 rounded-xl border border-[#d8b46a]/30
                    bg-white text-[10px] font-black text-[#64748b]
                    transition hover:bg-[#fbf8f1]
                  "
                  type="button"
                >
                  إلغاء
                </button>
              </div>
            </div>
          ) : (
            <div
              className="
                group relative h-[135px] overflow-hidden
                rounded-2xl border border-[#123f59]/15
                bg-[#06111d]
              "
            >
              {hasImage ? (
                <>
                  <img
                    src={selectedNode[dbField]}
                    alt={title}
                    className="
                      h-full w-full object-cover opacity-80
                      transition duration-300 group-hover:scale-105 group-hover:opacity-65
                    "
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />

                  <div
                    className="
                      absolute bottom-2 right-2 rounded-lg
                      bg-black/45 px-2 py-0.5
                      text-[8px] font-black text-white
                      backdrop-blur-md
                    "
                  >
                    {title}
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white/65">
                  <ImageIcon className="mb-1 h-7 w-7 opacity-60" />
                  <span className="text-[10px] font-black">
                    {placeholderText}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </article>
    );
  };

  if (!selectedNode) {
    return (
      <div
        className="
          mx-auto flex max-w-4xl flex-col items-center justify-center
          rounded-[18px] border border-dashed border-[#d8b46a]/40
          bg-white/75 py-12 text-center shadow-[0_6px_14px_rgba(18,63,89,0.04)]
        "
        dir="rtl"
      >
        <CircleAlert className="mb-3 h-10 w-10 text-[#c5983c]" />

        <h3 className="text-sm font-black text-[#123f59]">
          لم يتم اختيار عنصر
        </h3>

        <p className="mt-1 text-xs font-bold text-[#94a3b8]">
          اختر قطاعاً أو حياً من الشجرة لعرض التفاصيل.
        </p>
      </div>
    );
  }

  return (
    <div
      className="
        mx-auto max-w-5xl space-y-2.5
        font-[Tajawal] text-right text-[#123f59]
        animate-in fade-in
      "
      dir="rtl"
    >
      {/* Compact Header */}
      <section
        className="
          relative overflow-hidden rounded-[18px]
          border border-[#d8b46a]/25
          bg-gradient-to-l from-[#06111d] via-[#123f59] to-[#0e7490]
          px-4 py-3 text-white
          shadow-[0_10px_24px_rgba(18,63,89,0.16)]
        "
      >
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute right-[-60px] top-[-70px] h-36 w-36 rounded-full bg-[#e2bf74]/16 blur-3xl" />
          <div className="absolute left-[-70px] bottom-[-80px] h-44 w-44 rounded-full bg-cyan-400/16 blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div
              className="
                inline-flex h-8 shrink-0 items-center justify-center gap-1.5 px-2.5
                rounded-2xl border border-[#e2bf74]/35
                bg-white/10 text-[#e2bf74]
                shadow-[0_8px_18px_rgba(18,63,89,0.05)] backdrop-blur-xl
              "
            >
              <IconWithText
                icon={isSector ? Landmark : Map}
                text={isSector ? "قطاع" : "حي"}
                vertical
                iconClassName="h-5 w-5"
                textClassName="text-[7px] font-black leading-none"
              />
            </div>

            <div className="min-w-0">
              <h2 className="truncate text-sm font-black md:text-sm">
                {nodeTitle}
              </h2>

              <p className="mt-0.5 truncate text-[11px] font-bold text-white/60">
                نظرة عامة على البيانات المكانية، الخرائط، والرابط الرسمي.
              </p>
            </div>
          </div>

          {onEditRequest && (
            <button
              onClick={onEditRequest}
              className="
                inline-flex h-8 shrink-0 items-center justify-center gap-1.5
                rounded-xl border border-[#e2bf74]/40
                bg-[#e2bf74] px-2.5
                text-[10px] font-black text-[#082032]
                shadow-[0_8px_16px_rgba(226,191,116,0.14)]
                transition hover:-translate-y-[1px] hover:bg-[#f5d99b]
              "
              type="button"
            >
              <IconWithText icon={Edit} text="تعديل البيانات" iconClassName="h-3.5 w-3.5" /></button>
          )}
        </div>
      </section>

      {/* KPI */}
      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard
          label={mainCountLabel}
          value={mainCountValue}
          tone={isSector ? "emerald" : "amber"}
        />

        <KpiCard
          label="المعاملات"
          value={selectedNode.stats?.transactions || 0}
          tone="blue"
        />

        <KpiCard
          label="الملكيات"
          value={selectedNode.stats?.properties || 0}
          tone="indigo"
        />

        <KpiCard
          label="العملاء"
          value={selectedNode.stats?.clients || 0}
          tone="violet"
        />
      </section>

      {/* Maps */}
      <section
        className="
          rounded-[18px] border border-[#d8b46a]/25
          bg-white/75 p-3
          shadow-[0_8px_22px_rgba(18,63,89,0.06)]
          backdrop-blur-xl
        "
      >
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <span
              className="
                inline-flex h-8 shrink-0 items-center justify-center gap-1.5 px-2.5
                rounded-xl bg-[#123f59] text-[#e2bf74]
              "
            >
              <Map className="h-4 w-4" />
            </span>

            <div className="min-w-0">
              <h3 className="truncate text-sm font-black text-[#123f59]">
                الخرائط والبيانات المكانية
              </h3>

              <p className="mt-0.5 text-[10px] font-bold text-[#94a3b8]">
                صور البوابة المكانية والقمر الصناعي.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 lg:flex-row">
          {renderImageCard(
            "صورة البوابة المكانية",
            Map,
            "mapImage",
            "لا توجد صورة بوابة",
          )}

          {renderImageCard(
            "صورة القمر الصناعي",
            Satellite,
            "satelliteImage",
            "لا توجد صورة قمر",
          )}
        </div>
      </section>

      {/* Official Link */}
      <section
        className="
          overflow-hidden rounded-[18px]
          border border-[#d8b46a]/25
          bg-white/90
          shadow-[0_8px_22px_rgba(18,63,89,0.06)]
          backdrop-blur-xl
        "
      >
        <div
          className="
            flex items-center justify-between gap-3
            border-b border-[#e8ddc8]
            bg-gradient-to-l from-[#fbf8f1] via-white to-[#eef7f6]
            px-4 py-3
          "
        >
          <div className="flex min-w-0 items-center gap-2">
            <span
              className="
                inline-flex h-8 shrink-0 items-center justify-center gap-1.5 px-2.5
                rounded-xl bg-[#123f59] text-[#e2bf74]
              "
            >
              <Link2 className="h-4 w-4" />
            </span>

            <div className="min-w-0">
              <h3 className="truncate text-sm font-black text-[#123f59]">
                رابط الخريطة التفاعلية
              </h3>

              <p className="mt-0.5 text-[10px] font-bold text-[#94a3b8]">
                الرابط الرسمي المستخدم للعرض والـ QR.
              </p>
            </div>
          </div>

          {editingField !== "officialLink" && (
            <button
              onClick={() => handleStartEditing("officialLink")}
              className="
                inline-flex h-8 shrink-0 items-center justify-center gap-1
                rounded-lg border border-[#d8b46a]/35
                bg-[#eef7f6] px-2.5
                text-[9px] font-black text-[#15536f]
                transition hover:bg-[#d8b46a]/25
              "
              type="button"
            >
              <PenLine className="h-3.5 w-3.5" />
              تعديل الرابط
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-2.5 p-4 lg:grid-cols-[minmax(0,1fr)_100px]">
          <div className="min-w-0">
            {editingField === "officialLink" ? (
              <div
                className="
                  rounded-2xl border border-[#d8b46a]/35
                  bg-[#eef7f6]/60 p-3
                "
              >
                <div className="flex flex-col gap-2 md:flex-row">
                  <input
                    dir="ltr"
                    type="url"
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    className={INPUT_CLASS}
                    placeholder="https://maps.google.com/..."
                  />

                  <button
                    onClick={() => handleSaveInline("officialLink")}
                    disabled={quickUpdateMutation.isPending}
                    className="
                      inline-flex h-10 items-center justify-center gap-1.5
                      rounded-xl bg-gradient-to-l from-[#123f59] via-[#15536f] to-[#0e7490]
                      px-3 text-xs font-black text-white
                      shadow-[0_10px_22px_rgba(18,63,89,0.16)]
                      transition hover:-translate-y-[1px]
                      disabled:cursor-not-allowed disabled:opacity-50
                    "
                    type="button"
                  >
                    {quickUpdateMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin text-[#e2bf74]" />
                    ) : (
                      <CircleCheck className="h-4 w-4 text-[#e2bf74]" />
                    )}
                    حفظ
                  </button>

                  <button
                    onClick={handleCancelEditing}
                    className="
                      h-10 rounded-xl border border-[#d8b46a]/30
                      bg-white px-3 text-xs font-black text-[#64748b]
                      transition hover:bg-[#fbf8f1]
                    "
                    type="button"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2 md:flex-row">
                <input
                  readOnly
                  value={selectedNode.officialLink || "لا يوجد رابط مسجل"}
                  className="
                    h-10 min-w-0 flex-1 rounded-xl
                    border border-[#d8b46a]/25
                    bg-[#fbf8f1]/80 px-3
                    font-mono text-xs font-bold text-[#123f59]
                    outline-none
                  "
                  dir="ltr"
                />

                {selectedNode.officialLink && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => copyToClipboard(selectedNode.officialLink)}
                      className="
                        grid h-10 w-10 place-items-center
                        rounded-xl border border-[#d8b46a]/25
                        bg-[#fbf8f1] text-[#123f59]
                        transition hover:bg-[#f8efe0]
                      "
                      title="نسخ الرابط"
                      type="button"
                    >
                      <Copy className="h-4 w-4" />
                    </button>

                    <a
                      href={selectedNode.officialLink}
                      target="_blank"
                      rel="noreferrer"
                      className="
                        grid h-10 w-10 place-items-center
                        rounded-xl border border-[#d8b46a]/35
                        bg-[#eef7f6] text-[#15536f]
                        transition hover:bg-[#d8b46a]/25
                      "
                      title="فتح الرابط"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>

          <div
            className="
              grid h-[92px] w-[92px] place-items-center
              rounded-2xl border border-[#d8b46a]/25
              bg-white p-2 shadow-[0_6px_14px_rgba(18,63,89,0.04)]
              justify-self-center lg:justify-self-end
            "
          >
            {selectedNode.officialLink ? (
              <QRCodeSVG value={selectedNode.officialLink} size={68} />
            ) : (
              <div className="px-2 text-center text-[8px] font-black text-[#94a3b8]">
                لا يوجد رابط للـ QR
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

const KpiCard = ({ label, value, tone = "blue" }) => {
  const tones = {
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
    amber: "border-amber-200 bg-amber-50 text-amber-700",
    blue: "border-[#d8b46a]/35 bg-[#eef7f6] text-[#15536f]",
    indigo: "border-[#d8b46a]/35 bg-[#eef7f6] text-[#15536f]",
    violet: "border-[#d8b46a]/35 bg-[#eef7f6] text-[#15536f]",
  };

  return (
    <div
      className="
        relative overflow-hidden rounded-[18px]
        border border-[#d8b46a]/25
        bg-white/90 p-3
        shadow-[0_8px_22px_rgba(18,63,89,0.06)]
        backdrop-blur-xl
      "
    >
      <div className="absolute -left-8 -top-4 h-20 w-20 rounded-full bg-[#e2bf74]/10 blur-2xl" />

      <div className="relative z-10 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-[10px] font-black text-[#64748b]">
            {label}
          </p>

          <p className="mt-1 text-sm font-black leading-none text-[#123f59]">
            {value}
          </p>
        </div>

        <span
          className={`
            h-2.5 w-2.5 shrink-0 rounded-full border
            ${tones[tone] || tones.blue}
          `}
        />
      </div>
    </div>
  );
};

const INPUT_CLASS = `
  h-10 w-full rounded-xl
  border border-[#d8b46a]/25 bg-white
  px-3 text-xs font-bold text-[#123f59]
  shadow-[0_6px_14px_rgba(18,63,89,0.04)] outline-none transition-all
  placeholder:text-[#94a3b8]
  focus:border-[#c5983c]/70
  focus:bg-white
  focus:ring-4 focus:ring-[#c5983c]/10
`;

export default NodeOverview;