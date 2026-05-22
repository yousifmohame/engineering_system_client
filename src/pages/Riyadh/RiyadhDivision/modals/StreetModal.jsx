// src/components/RiyadhDivision/modals/StreetModal.jsx
import React from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import api from "../../../../api/axios";
import { toast } from "sonner";
import {
  X,
  Route,
  ShieldAlert,
  FileText,
  Link as LinkIcon,
  CircleCheck,
  Loader2,
  Upload,
  ChevronDown,
  Ruler,
  ListChecks,
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

const StreetModal = ({
  isOpen,
  onClose,
  sectorId,
  districtId,
  modalData,
  setModalData,
}) => {
  const queryClient = useQueryClient();

  const { data: referenceDocs = [] } = useQuery({
    queryKey: ["reference-docs-list"],
    queryFn: async () => {
      const res = await api.get("/references");
      return res.data?.data || res.data || [];
    },
    enabled: isOpen,
  });

  const streetMutation = useMutation({
    mutationFn: async (payload) => {
      if (modalData.mode === "edit") {
        return await api.put(`/riyadh-streets/${payload.id}`, payload);
      }

      return await api.post("/riyadh-streets/quick-street", {
        ...payload,
        sectorId,
        districtId,
      });
    },
    onSuccess: () => {
      toast.success(
        modalData.mode === "edit"
          ? "تم تحديث بيانات الشارع"
          : "تم إضافة الشارع بنجاح",
      );

      queryClient.invalidateQueries(["riyadh-tree"]);
      queryClient.invalidateQueries(["node-details"]);

      onClose();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "حدث خطأ أثناء الحفظ");
    },
  });

  const data = modalData?.data || {};

  const updateData = (field, value) => {
    setModalData({
      ...modalData,
      data: {
        ...data,
        [field]: value,
      },
    });
  };

  const updateRegulationDetails = (field, value) => {
    setModalData({
      ...modalData,
      data: {
        ...data,
        regulationDetails: {
          ...data.regulationDetails,
          [field]: value,
        },
      },
    });
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = (readerEvent) => {
      setModalData({
        ...modalData,
        data: {
          ...data,
          regulationDetails: {
            ...data.regulationDetails,
            fileUrl: readerEvent.target.result,
            fileName: file.name,
          },
        },
      });
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
            <div className="absolute left-[-65px] bottom-[-80px] h-40 w-40 rounded-full bg-orange-400/16 blur-3xl" />
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
                  icon={Route}
                  text={modalData.mode === "edit" ? "تعديل" : "جديد"}
                  vertical
                  iconClassName="h-5 w-5"
                  textClassName="text-[7px] font-black leading-none"
                />
              </div>

              <div className="min-w-0">
                <h3 className="truncate text-sm font-black">
                  {modalData.mode === "edit"
                    ? "تعديل بيانات الشارع"
                    : "تسجيل شارع جديد"}
                </h3>

                <p className="mt-0.5 truncate text-[10px] font-bold text-white/60">
                  المسمى، القياسات، والتنظيمات الخاصة.
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

        {/* Form Body */}
        <form
          id="streetForm"
          className="
            min-h-0 flex-1 space-y-2.5 overflow-y-auto overflow-x-hidden
            bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white
            p-3 custom-scrollbar-slim
          "
          onSubmit={(event) => {
            event.preventDefault();
            streetMutation.mutate(data);
          }}
        >
          <FormSection
            icon={Route}
            title="البيانات الأساسية والقياسات"
            subtitle="اسم الشارع، النوع، العرض، الطول، وعدد المسارات."
          >
            <div className="grid grid-cols-1 gap-2.5 md:grid-cols-4">
              <Field label="اسم الشارع" required className="md:col-span-2">
                <input
                  type="text"
                  required
                  value={data.name || ""}
                  onChange={(event) => updateData("name", event.target.value)}
                  className={INPUT_CLASS}
                  placeholder="مثال: شارع العليا"
                />
              </Field>

              <Field label="نوع الشارع" className="md:col-span-2">
                <div className="relative">
                  <select
                    value={data.type || "normal"}
                    onChange={(event) => updateData("type", event.target.value)}
                    className={`${INPUT_CLASS} appearance-none pl-10`}
                  >
                    <option value="normal">شارع داخلي / فرعي</option>
                    <option value="main">طريق محوري / رئيسي</option>
                  </select>

                  <ChevronDown className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#c5983c]" />
                </div>
              </Field>

              <Field label="عرض الشارع بالمتر" required className="md:col-span-2">
                <div className="relative">
                  <Ruler className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#c5983c]" />

                  <input
                    type="number"
                    required
                    value={data.width || ""}
                    onChange={(event) => updateData("width", event.target.value)}
                    className={`${INPUT_CLASS} pr-10 font-mono`}
                    placeholder="30"
                  />
                </div>
              </Field>

              <Field label="طول الشارع">
                <input
                  type="number"
                  value={data.length || ""}
                  onChange={(event) => updateData("length", event.target.value)}
                  className={`${INPUT_CLASS} font-mono`}
                  placeholder="1500"
                />
              </Field>

              <Field label="عدد المسارات">
                <input
                  type="number"
                  value={data.lanes || ""}
                  onChange={(event) => updateData("lanes", event.target.value)}
                  className={`${INPUT_CLASS} font-mono`}
                  placeholder="3"
                />
              </Field>
            </div>
          </FormSection>

          <FormSection
            icon={ShieldAlert}
            title="الحالة التنظيمية والاشتراطات"
            subtitle="تفعيل التنظيم الخاص وإرفاق القرار أو ربطه بدليل مرجعي."
          >
            <div className="space-y-2.5">
              <div
                className="
                  flex flex-col gap-3 rounded-2xl
                  border border-[#d8b46a]/35 bg-[#eef7f6]/60 p-3
                  md:flex-row md:items-center md:justify-between
                "
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`
                      grid h-10 w-10 place-items-center rounded-xl
                      ${
                        data.hasSpecialRegulation
                          ? "bg-[#0e7490] text-white"
                          : "bg-white text-[#94a3b8]"
                      }
                    `}
                  >
                    <ShieldAlert className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-xs font-black text-[#123f59]">
                      هل يوجد تنظيم خاص لهذا الشارع؟
                    </p>

                    <p className="mt-0.5 text-[10px] font-bold text-[#64748b]">
                      عند التفعيل يمكن إضافة اشتراطات استثنائية.
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={data.hasSpecialRegulation || false}
                    onChange={(event) =>
                      updateData("hasSpecialRegulation", event.target.checked)
                    }
                  />

                  <div
                    className="
                      h-6 w-9 rounded-full bg-[#e8ddc8] transition
                      after:absolute after:right-[2px] after:top-[2px]
                      after:h-5 after:w-5 after:rounded-full
                      after:border after:border-[#cbd5e1] after:bg-white
                      after:transition-all after:content-['']
                      peer-checked:bg-[#0e7490] peer-checked:after:-translate-x-full
                    "
                  />
                </label>
              </div>

              {data.hasSpecialRegulation && (
                <div className="space-y-2.5 animate-in slide-in-from-top-4 duration-300">
                  <Field label="وصف التنظيم الخاص">
                    <textarea
                      value={data.regulationDetails?.description || ""}
                      onChange={(event) =>
                        updateRegulationDetails("description", event.target.value)
                      }
                      className={`${INPUT_CLASS} min-h-[90px] resize-none py-3 leading-6`}
                      placeholder="اكتب تفاصيل الاستثناء أو التنظيم هنا..."
                    />
                  </Field>

                  <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
                    <Field label="مرفق قرار التنظيم">
                      <div className="relative">
                        <input
                          type="file"
                          onChange={handleFileChange}
                          className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                        />

                        <div
                          className="
                            flex h-10 items-center gap-2 rounded-xl
                            border border-dashed border-[#d8b46a]/35
                            bg-white px-3 transition hover:bg-[#fbf8f1]
                          "
                        >
                          <Upload className="h-4 w-4 text-[#c5983c]" />

                          <span className="min-w-0 truncate text-[10px] font-black text-[#64748b]">
                            {data.regulationDetails?.fileName ||
                              "ارفع الملف PDF / Image"}
                          </span>
                        </div>
                      </div>
                    </Field>

                    <Field label="الربط بدليل مرجعي">
                      <div className="relative">
                        <select
                          value={data.regulationDetails?.linkedReferenceId || ""}
                          onChange={(event) =>
                            updateRegulationDetails(
                              "linkedReferenceId",
                              event.target.value,
                            )
                          }
                          className={`${INPUT_CLASS} appearance-none pl-10 text-[11px]`}
                        >
                          <option value="">--- اختر اشتراطاً مرجعياً ---</option>

                          {referenceDocs.map((doc) => (
                            <option key={doc.id} value={doc.id}>
                              {doc.title}
                            </option>
                          ))}
                        </select>

                        <LinkIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#c5983c]" />
                      </div>
                    </Field>
                  </div>
                </div>
              )}
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
            form="streetForm"
            disabled={streetMutation.isPending || !data.name || !data.width}
            className="
              inline-flex h-10 flex-1 items-center justify-center gap-2
              rounded-xl bg-gradient-to-l from-[#123f59] via-[#15536f] to-[#0e7490]
              px-3 text-xs font-black text-white
              shadow-[0_10px_24px_rgba(18,63,89,0.18)]
              transition hover:-translate-y-[1px]
              disabled:cursor-not-allowed disabled:opacity-50
            "
          >
            {streetMutation.isPending ? (
              <Loader2 className="h-5 w-5 animate-spin text-[#e2bf74]" />
            ) : (
              <>
                <CircleCheck className="h-5 w-5 text-[#e2bf74]" />
                {modalData.mode === "edit"
                  ? "تحديث البيانات"
                  : "إضافة الشارع للمنظومة"}
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

const Field = ({ label, required = false, children, className = "" }) => {
  return (
    <label className={`block space-y-1.5 ${className}`}>
      <span className="text-[10px] font-black text-[#64748b]">
        {label}
        {required && <span className="mr-1 text-rose-500">*</span>}
      </span>

      {children}
    </label>
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

export default StreetModal;
