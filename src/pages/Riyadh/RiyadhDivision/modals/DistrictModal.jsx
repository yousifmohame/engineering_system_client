// src/components/RiyadhDivision/modals/SectorModal.jsx
import React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../../api/axios";
import { toast } from "sonner";
import {
  X,
  Landmark,
  FileText,
  Globe,
  Map,
  Satellite,
  Loader2,
  CircleCheck,
  Link2,
  Upload,
  ImageIcon,
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

const SectorModal = ({ isOpen, onClose, modalData, setModalData }) => {
  const queryClient = useQueryClient();

  const sectorMutation = useMutation({
    mutationFn: async (payload) => {
      if (modalData.mode === "create") {
        return await api.post("/riyadh-streets/sectors", payload);
      }

      return await api.put(`/riyadh-streets/sectors/${payload.id}`, payload);
    },
    onSuccess: () => {
      toast.success("تم حفظ القطاع");

      queryClient.invalidateQueries(["riyadh-tree"]);
      queryClient.invalidateQueries(["sectors-list"]);

      onClose();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "حدث خطأ أثناء الحفظ");
    },
  });

  const updateData = (field, value) => {
    setModalData((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        [field]: value,
      },
    }));
  };

  const handleModalImageUpload = (event, fieldName) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("يرجى اختيار ملف صورة صحيح");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      updateData(fieldName, reader.result);
    };

    reader.readAsDataURL(file);
    event.target.value = null;
  };

  if (!isOpen) return null;

  return (
    <div
      className="
        fixed inset-0 z-[100] flex items-center justify-center
        bg-[#06111d]/70 p-4 backdrop-blur-md
      "
      dir="rtl"
    >
      <div
        className="
          flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden
          rounded-[18px] border border-[#d8b46a]/35
          bg-white shadow-[0_32px_90px_rgba(0,0,0,0.35)]
        "
      >
        {/* Header */}
        <div
          className="
            relative overflow-hidden border-b border-[#d8b46a]/25
            bg-gradient-to-l from-[#06111d] via-[#123f59] to-[#0e7490]
            px-3 py-4 text-white
          "
        >
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute right-[-55px] top-[-70px] h-36 w-36 rounded-full bg-[#e2bf74]/18 blur-3xl" />
            <div className="absolute left-[-65px] bottom-[-80px] h-40 w-40 rounded-full bg-cyan-400/16 blur-3xl" />
          </div>

          <div className="relative z-10 flex items-center justify-between gap-2.5">
            <div className="flex min-w-0 items-center gap-3">
              <div
                className="
                  inline-flex h-8 shrink-0 items-center justify-center gap-1.5 px-2.5
                  rounded-2xl border border-[#e2bf74]/40
                  bg-white/10 text-[#e2bf74]
                  shadow-[0_8px_18px_rgba(18,63,89,0.05)] backdrop-blur-xl
                "
              >
                <IconWithText
                  icon={Landmark}
                  text={modalData.mode === "create" ? "جديد" : "تعديل"}
                  vertical
                  iconClassName="h-5 w-5"
                  textClassName="text-[7px] font-black leading-none"
                />
              </div>

              <div className="min-w-0">
                <h3 className="truncate text-sm font-black">
                  {modalData.mode === "create"
                    ? "تسجيل قطاع جديد"
                    : "تعديل بيانات القطاع"}
                </h3>

                <p className="mt-0.5 truncate text-[10px] font-bold text-white/60">
                  اسم القطاع، الرابط الرسمي، وصور الخرائط.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="
                inline-flex h-8 shrink-0 items-center justify-center gap-1.5 px-2.5
                rounded-xl border border-white/15 bg-white/10
                text-white transition hover:bg-rose-500/35
              "
              type="button"
            >
              <IconWithText icon={X} text="إغلاق" iconClassName="h-5 w-5" /></button>
          </div>
        </div>

        {/* Form */}
        <form
          id="sectorForm"
          onSubmit={(event) => {
            event.preventDefault();
            sectorMutation.mutate(modalData.data);
          }}
          className="
            min-h-0 flex-1 space-y-2.5 overflow-y-auto overflow-x-hidden
            bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white
            p-3 custom-scrollbar-slim
          "
        >
          <FormSection
            icon={FileText}
            title="البيانات الأساسية"
            subtitle="اسم القطاع والكود الداخلي عند التعديل."
          >
            <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
              <Field label="اسم القطاع" required>
                <input
                  type="text"
                  required
                  value={modalData.data.name || ""}
                  onChange={(event) => updateData("name", event.target.value)}
                  className={INPUT_CLASS}
                  placeholder="مثال: وسط، شمال، غرب..."
                />
              </Field>

              {modalData.mode === "edit" && (
                <Field label="كود القطاع الداخلي">
                  <input
                    type="text"
                    readOnly
                    dir="ltr"
                    value={modalData.data.code || "يتم توليده تلقائياً"}
                    className={`${INPUT_CLASS} cursor-not-allowed bg-[#f1f5f9] font-mono text-left text-[#64748b]`}
                  />
                </Field>
              )}
            </div>
          </FormSection>

          <FormSection
            icon={Globe}
            title="الروابط والخرائط"
            subtitle="رابط الخريطة الرسمية وصور البوابة والقمر الصناعي."
          >
            <div className="space-y-2.5">
              <Field label="رابط الخريطة الرسمية المتفاعلة">
                <div className="relative">
                  <Link2 className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#c5983c]" />

                  <input
                    type="url"
                    dir="ltr"
                    value={modalData.data.officialLink || ""}
                    onChange={(event) =>
                      updateData("officialLink", event.target.value)
                    }
                    className={`${INPUT_CLASS} pr-10 font-mono text-left`}
                    placeholder="https://maps.google.com/..."
                  />
                </div>
              </Field>

              <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
                <Field label="صورة من البوابة المكانية">
                  <ImageUploadBox
                    icon={Map}
                    tone="blue"
                    value={modalData.data.mapImage}
                    placeholder="اضغط أو اسحب الصورة هنا"
                    onChange={(event) =>
                      handleModalImageUpload(event, "mapImage")
                    }
                  />
                </Field>

                <Field label="صورة من القمر الصناعي">
                  <ImageUploadBox
                    icon={Satellite}
                    tone="emerald"
                    value={modalData.data.satelliteImage}
                    placeholder="اضغط أو اسحب الصورة هنا"
                    onChange={(event) =>
                      handleModalImageUpload(event, "satelliteImage")
                    }
                  />
                </Field>
              </div>
            </div>
          </FormSection>
        </form>

        {/* Footer */}
        <div
          className="
            flex shrink-0 flex-wrap items-center gap-3
            border-t border-[#d8b46a]/25 bg-[#fbf8f1] p-3
          "
        >
          <button
            type="button"
            onClick={onClose}
            className="
              h-10 rounded-xl border border-[#d8b46a]/30
              bg-white px-3 text-xs font-black text-[#64748b]
              transition hover:bg-[#fbf8f1]
            "
          >
            إلغاء
          </button>

          <button
            type="submit"
            form="sectorForm"
            disabled={sectorMutation.isPending}
            className="
              inline-flex h-10 flex-1 items-center justify-center gap-2
              rounded-xl bg-gradient-to-l from-[#123f59] via-[#15536f] to-[#0e7490]
              px-3 text-xs font-black text-white
              shadow-[0_10px_24px_rgba(18,63,89,0.18)]
              transition hover:-translate-y-[1px]
              disabled:cursor-not-allowed disabled:opacity-50
            "
          >
            {sectorMutation.isPending ? (
              <Loader2 className="h-5 w-5 animate-spin text-[#e2bf74]" />
            ) : (
              <>
                <CircleCheck className="h-5 w-5 text-[#e2bf74]" />
                {modalData.mode === "create"
                  ? "حفظ وإنشاء القطاع"
                  : "حفظ التعديلات"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const FormSection = ({ icon: Icon, title, subtitle, children }) => {
  return (
    <section
      className="
        overflow-hidden rounded-[16px]
        border border-[#d8b46a]/25 bg-white/90
        shadow-[0_8px_22px_rgba(18,63,89,0.06)]
      "
    >
      <div
        className="
          flex items-center gap-3 border-b border-[#e8ddc8]
          bg-gradient-to-l from-[#fbf8f1] via-white to-[#eef7f6]
          px-4 py-3
        "
      >
        <span className="inline-flex h-8 shrink-0 items-center justify-center gap-1.5 px-2.5 rounded-xl bg-[#123f59] text-[#e2bf74]">
          <Icon className="h-4 w-4" />
        </span>

        <div className="min-w-0">
          <h4 className="truncate text-xs font-black text-[#123f59]">
            {title}
          </h4>

          <p className="mt-0.5 text-[10px] font-bold text-[#64748b]">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="p-4">{children}</div>
    </section>
  );
};

const Field = ({ label, required = false, children }) => {
  return (
    <label className="block space-y-1.5">
      <span className="text-[10px] font-black text-[#64748b]">
        {label}
        {required && <span className="mr-1 text-rose-500">*</span>}
      </span>

      {children}
    </label>
  );
};

const ImageUploadBox = ({
  icon: Icon,
  tone = "blue",
  value,
  placeholder,
  onChange,
}) => {
  const tones = {
    emerald:
      "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
    blue: "border-[#d8b46a]/35 bg-[#eef7f6] text-[#15536f] hover:bg-[#d8b46a]/25",
  };

  return (
    <div
      className={`
        group relative flex h-28 cursor-pointer items-center justify-center
        overflow-hidden rounded-2xl border-2 border-dashed
        transition ${tones[tone] || tones.blue}
      `}
    >
      <input
        type="file"
        accept="image/*"
        onChange={onChange}
        className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
      />

      {value ? (
        <>
          <img
            src={value}
            alt="Preview"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/35" />
          <div className="absolute bottom-2 right-2 hidden items-center gap-1 rounded-lg bg-black/45 px-2 py-0.5 text-[8px] font-black text-white backdrop-blur-md group-hover:flex">
            <Upload className="h-3 w-3" />
            تغيير الصورة
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center gap-1.5 opacity-80 transition group-hover:opacity-100">
          {Icon ? <Icon className="h-7 w-7" /> : <ImageIcon className="h-7 w-7" />}
          <span className="text-[9px] font-black">{placeholder}</span>
        </div>
      )}
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

export default SectorModal;
