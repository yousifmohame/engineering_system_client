import React, { useState, useEffect } from "react";
import {
  X,
  UserPlus,
  Loader2,
  Phone,
  User,
  Paperclip,
  Upload,
  Globe2,
  Save,
  Wallet,
  Banknote,
  CheckSquare,
  Square,
  Edit3,
} from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/axios";

const COUNTRY_CODES = [
  { code: "+966", label: "السعودية 🇸🇦" },
  { code: "+20", label: "مصر 🇪🇬" },
  { code: "+971", label: "الإمارات 🇦🇪" },
  { code: "+965", label: "الكويت 🇰🇼" },
  { code: "+974", label: "قطر 🇶🇦" },
  { code: "+973", label: "البحرين 🇧🇭" },
  { code: "+968", label: "عمان 🇴🇲" },
  { code: "+962", label: "الأردن 🇯🇴" },
];

const INPUT_CLASS =
  "h-11 w-full rounded-2xl border border-[#d8b46a]/35 bg-[#fbf8f1]/70 px-4 text-xs font-black text-[#123f59] outline-none transition placeholder:text-[#94a3b8] focus:border-[#c5983c] focus:bg-white focus:ring-4 focus:ring-[#c5983c]/10";

const TEXTAREA_CLASS =
  "w-full resize-none rounded-2xl border border-[#d8b46a]/35 bg-[#fbf8f1]/70 px-4 py-3 text-xs font-bold leading-relaxed text-[#123f59] outline-none transition placeholder:text-[#94a3b8] focus:border-[#c5983c] focus:bg-white focus:ring-4 focus:ring-[#c5983c]/10";

export function AddPersonModal({
  type = "وسيط",
  mode = "add",
  personData = null,
  onClose,
}) {
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    firstNameAr: "",
    secondNameAr: "",
    thirdNameAr: "",
    fourthNameAr: "",
    firstNameEn: "",
    secondNameEn: "",
    thirdNameEn: "",
    fourthNameEn: "",
    phoneCode: "+966",
    phoneWithoutCode: "",
    whatsappCode: "+966",
    whatsappWithoutCode: "",
    telegram: "",
    country: "",
    preferredCurrency: "SAR",
    transferMethods: [],
    transferDetails: {},
    agreementType: "نسبة",
    idNumber: "",
    notes: "",
    files: [],
  });

  const typeConfig = {
    معقب: {
      title: "إضافة معقب جديد",
      badge: "bg-cyan-50 text-cyan-700 border-cyan-200",
    },
    وسيط: {
      title: "إضافة وسيط جديد",
      badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    شريك: {
      title: "إضافة شريك جديد",
      badge: "bg-purple-50 text-purple-700 border-purple-200",
    },
    "صاحب مصلحة": {
      title: "إضافة صاحب مصلحة جديد",
      badge: "bg-amber-50 text-amber-700 border-amber-200",
    },
    "موظف عن بعد": {
      title: "إضافة موظف عن بعد",
      badge: "bg-rose-50 text-rose-700 border-rose-200",
    },
  };

  const config = typeConfig[type] || typeConfig["وسيط"];

  useEffect(() => {
    if (mode === "edit" && personData) {
      let pCode = "+966";
      let pNum = personData.phone || "";

      if (personData.phone && personData.phone.startsWith("+")) {
        const matched = COUNTRY_CODES.find((c) =>
          personData.phone.startsWith(c.code),
        );

        if (matched) {
          pCode = matched.code;
          pNum = personData.phone.slice(matched.code.length);
        }
      }

      let wCode = "+966";
      let wNum = personData.whatsapp || "";

      if (personData.whatsapp && personData.whatsapp.startsWith("+")) {
        const matched = COUNTRY_CODES.find((c) =>
          personData.whatsapp.startsWith(c.code),
        );

        if (matched) {
          wCode = matched.code;
          wNum = personData.whatsapp.slice(matched.code.length);
        }
      }

      let methodsArr = [];

      if (personData.transferMethod) {
        try {
          methodsArr = JSON.parse(personData.transferMethod);

          if (!Array.isArray(methodsArr)) {
            methodsArr = [personData.transferMethod];
          }
        } catch (e) {
          methodsArr = [personData.transferMethod];
        }
      }

      let parsedDetails = {};

      if (personData.transferDetails) {
        try {
          parsedDetails =
            typeof personData.transferDetails === "string"
              ? JSON.parse(personData.transferDetails)
              : personData.transferDetails;
        } catch (e) {
          parsedDetails = {};
        }
      }

      setFormData({
        firstNameAr: personData.firstNameAr || "",
        secondNameAr: personData.secondNameAr || "",
        thirdNameAr: personData.thirdNameAr || "",
        fourthNameAr: personData.fourthNameAr || "",
        firstNameEn: personData.firstNameEn || "",
        secondNameEn: personData.secondNameEn || "",
        thirdNameEn: personData.thirdNameEn || "",
        fourthNameEn: personData.fourthNameEn || "",
        country: personData.country || "",
        idNumber: personData.idNumber || "",
        agreementType: personData.agreementType || "نسبة",
        telegram: personData.telegram || "",
        notes: personData.notes || "",
        preferredCurrency: personData.preferredCurrency || "SAR",
        transferMethods: methodsArr,
        transferDetails: parsedDetails,
        phoneCode: pCode,
        phoneWithoutCode: pNum,
        whatsappCode: wCode,
        whatsappWithoutCode: wNum,
        files: [],
      });
    }
  }, [mode, personData]);

  const addMutation = useMutation({
    mutationFn: async (payload) => {
      const fd = new FormData();

      Object.keys(payload).forEach((key) => {
        if (key === "files" && payload.files) {
          Array.from(payload.files).forEach((file) => {
            fd.append("files", file);
          });
        } else if (key === "transferDetails") {
          fd.append("transferDetails", JSON.stringify(payload[key] || {}));
        } else {
          fd.append(key, payload[key] || "");
        }
      });

      return await api.post("/persons", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: () => {
      toast.success(`تم تسجيل ${type} بنجاح`);
      queryClient.invalidateQueries(["persons-directory"]);
      queryClient.invalidateQueries(["brokers-directory"]);
      queryClient.invalidateQueries(["partners-directory"]);
      onClose();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "حدث خطأ أثناء الإضافة");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (payload) => {
      const fd = new FormData();

      Object.keys(payload).forEach((key) => {
        if (key === "files" && payload.files) {
          Array.from(payload.files).forEach((file) => {
            fd.append("files", file);
          });
        } else if (key === "transferDetails") {
          fd.append("transferDetails", JSON.stringify(payload[key] || {}));
        } else if (
          key !== "id" &&
          payload[key] !== undefined &&
          payload[key] !== null
        ) {
          fd.append(key, payload[key]);
        }
      });

      return await api.put(`/persons/${payload.id}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: () => {
      toast.success(`تم تحديث بيانات ${type} بنجاح`);
      queryClient.invalidateQueries(["persons-directory"]);
      queryClient.invalidateQueries(["brokers-directory"]);
      queryClient.invalidateQueries(["partners-directory"]);
      onClose();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "حدث خطأ أثناء التحديث");
    },
  });

  const isPending = addMutation.isPending || updateMutation.isPending;

  const handleSubmit = () => {
    const fullName = `${formData.firstNameAr || ""} ${
      formData.secondNameAr || ""
    } ${formData.thirdNameAr || ""} ${formData.fourthNameAr || ""}`.trim();

    if (!formData.firstNameAr) {
      return toast.error("يرجى إدخال الاسم الأول على الأقل");
    }

    const finalPayload = {
      ...formData,
      name: fullName,
      role: personData?.role || type,
      phone: formData.phoneWithoutCode
        ? `${formData.phoneCode}${formData.phoneWithoutCode}`
        : "",
      whatsapp: formData.whatsappWithoutCode
        ? `${formData.whatsappCode}${formData.whatsappWithoutCode}`
        : "",
      transferMethod: JSON.stringify(formData.transferMethods),
    };

    if (mode === "add") {
      addMutation.mutate(finalPayload);
    } else {
      updateMutation.mutate({
        ...finalPayload,
        id: personData.id,
      });
    }
  };

  const toggleTransferMethod = (method) => {
    setFormData((prev) => {
      const isSelected = prev.transferMethods.includes(method);

      const newMethods = isSelected
        ? prev.transferMethods.filter((item) => item !== method)
        : [...prev.transferMethods, method];

      return {
        ...prev,
        transferMethods: newMethods,
      };
    });
  };

  const updateTransferDetail = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      transferDetails: {
        ...prev.transferDetails,
        [field]: value,
      },
    }));
  };

  return (
    <div
      className="
        fixed inset-0 z-[150] flex items-center justify-center
        bg-slate-950/75 p-3 backdrop-blur-sm
        animate-in fade-in md:p-5
      "
      dir="rtl"
    >
      <div
        className="
          flex max-h-[92vh] w-full max-w-5xl flex-col
          overflow-hidden rounded-[30px]
          border border-[#d8b46a]/30 bg-white
          shadow-[0_30px_90px_rgba(15,23,42,0.40)]
        "
      >
        {/* Header */}
        <div
          className="
            relative shrink-0 overflow-hidden
            bg-gradient-to-l from-[#08111c] via-[#0f3448] to-[#123f59]
            px-5 py-5 text-white
          "
        >
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute right-[-70px] top-[-70px] h-44 w-44 rounded-full bg-[#c5983c]/18 blur-3xl" />
            <div className="absolute left-[-80px] bottom-[-80px] h-52 w-52 rounded-full bg-cyan-400/12 blur-3xl" />
          </div>

          <div className="relative z-10 flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4">
              <div
                className="
                  grid h-14 w-14 shrink-0 place-items-center
                  rounded-3xl bg-[#e2bf74] text-[#123f59]
                  shadow-[0_12px_24px_rgba(0,0,0,0.18)]
                "
              >
                {mode === "add" ? (
                  <UserPlus className="h-7 w-7" />
                ) : (
                  <Edit3 className="h-7 w-7" />
                )}
              </div>

              <div className="min-w-0">
                <h2 className="truncate text-lg font-black text-white">
                  {mode === "add" ? config.title : `تعديل بيانات ${type}`}
                </h2>

                <p className="mt-1 text-xs font-bold text-white/55">
                  إدارة بيانات الاسم، التواصل، طرق الاستلام، والمرفقات.
                </p>
              </div>

              <span
                className={`
                  hidden rounded-2xl border px-3 py-1.5
                  text-xs font-black shadow-sm sm:inline-flex
                  ${config.badge}
                `}
              >
                {type}
              </span>
            </div>

            <button
              onClick={onClose}
              className="
                grid h-11 w-11 shrink-0 place-items-center
                rounded-2xl border border-white/15
                bg-white/10 text-white transition
                hover:bg-rose-500 hover:text-white
              "
              type="button"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div
          className="
            custom-scrollbar-slim flex-1 space-y-5 overflow-y-auto
            bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white
            p-4 md:p-6
          "
        >
          {/* Names */}
          <SectionCard
            icon={User}
            title="الاسم الرباعي والبيانات الديموغرافية"
            subtitle="الاسم بالعربية والإنجليزية مع بيانات الإقامة والهوية"
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ["firstNameAr", "الاسم الأول *", "الاسم الأول"],
                ["secondNameAr", "الاسم الثاني", "الاسم الثاني"],
                ["thirdNameAr", "الاسم الثالث", "الاسم الثالث"],
                ["fourthNameAr", "الاسم الرابع / العائلة", "الاسم الرابع"],
              ].map(([field, label, placeholder]) => (
                <InputField
                  key={field}
                  label={label}
                  value={formData[field]}
                  placeholder={placeholder}
                  onChange={(value) =>
                    setFormData({
                      ...formData,
                      [field]: value,
                    })
                  }
                />
              ))}
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ["firstNameEn", "First Name", "First Name"],
                ["secondNameEn", "Second Name", "Second Name"],
                ["thirdNameEn", "Third Name", "Third Name"],
                ["fourthNameEn", "Last Name", "Last Name"],
              ].map(([field, label, placeholder]) => (
                <InputField
                  key={field}
                  label={label}
                  value={formData[field]}
                  placeholder={placeholder}
                  dir="ltr"
                  mono
                  onChange={(value) =>
                    setFormData({
                      ...formData,
                      [field]: value,
                    })
                  }
                />
              ))}
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
              <InputField
                label="دولة الإقامة"
                value={formData.country}
                placeholder="مثال: السعودية، مصر..."
                icon={Globe2}
                onChange={(value) =>
                  setFormData({
                    ...formData,
                    country: value,
                  })
                }
              />

              <InputField
                label="رقم الهوية الوطنية / الإقامة"
                value={formData.idNumber}
                placeholder="رقم الهوية"
                mono
                onChange={(value) =>
                  setFormData({
                    ...formData,
                    idNumber: value,
                  })
                }
              />

              <Field label="نوع الاتفاق المالي الافتراضي">
                <select
                  value={formData.agreementType}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      agreementType: e.target.value,
                    })
                  }
                  className={INPUT_CLASS}
                >
                  <option>نسبة</option>
                  <option>مبلغ ثابت</option>
                  <option>مبلغ شامل</option>
                  <option>— لا يوجد —</option>
                </select>
              </Field>
            </div>
          </SectionCard>

          {/* Contact */}
          <SectionCard
            icon={Phone}
            title="معلومات التواصل"
            subtitle="رقم الجوال، الواتساب، ومعرّف التليجرام"
          >
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <PhoneInput
                label="رقم الجوال الأساسي *"
                code={formData.phoneCode}
                number={formData.phoneWithoutCode}
                onCodeChange={(value) =>
                  setFormData({
                    ...formData,
                    phoneCode: value,
                  })
                }
                onNumberChange={(value) =>
                  setFormData({
                    ...formData,
                    phoneWithoutCode: value,
                  })
                }
              />

              <PhoneInput
                label="رقم الواتساب"
                code={formData.whatsappCode}
                number={formData.whatsappWithoutCode}
                onCodeChange={(value) =>
                  setFormData({
                    ...formData,
                    whatsappCode: value,
                  })
                }
                onNumberChange={(value) =>
                  setFormData({
                    ...formData,
                    whatsappWithoutCode: value,
                  })
                }
                tone="emerald"
              />

              <Field label="معرّف التليجرام Telegram">
                <div className="relative" dir="ltr">
                  <span
                    className="
                      pointer-events-none absolute left-3 top-1/2
                      -translate-y-1/2 rounded-xl
                      bg-cyan-50 px-2 py-0.5
                      font-mono text-xs font-black text-cyan-700
                    "
                  >
                    @
                  </span>

                  <input
                    type="text"
                    value={formData.telegram}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        telegram: e.target.value,
                      })
                    }
                    className={`${INPUT_CLASS} pl-12 font-mono`}
                    placeholder="username"
                  />
                </div>
              </Field>
            </div>
          </SectionCard>

          {/* Payment methods */}
          <SectionCard
            icon={Wallet}
            title="تفاصيل استلام الدفعات"
            subtitle="طرق الدفع المفضلة ومعلومات التحويل"
          >
            <div className="mb-4 flex flex-wrap gap-3">
              {[
                "حساب بنكي محلي/دولي",
                "ويسترن يونيون",
                "InstaPay",
                "محفظة رقمية USDT",
                "نقدي",
              ].map((method) => {
                const isSelected = formData.transferMethods.includes(method);

                return (
                  <button
                    key={method}
                    type="button"
                    onClick={() => toggleTransferMethod(method)}
                    className={`
                      flex items-center gap-2 rounded-2xl border-2
                      px-4 py-2.5 text-xs font-black
                      transition-all duration-200
                      ${
                        isSelected
                          ? "border-[#c5983c] bg-[#f8efe0] text-[#123f59] shadow-sm"
                          : "border-[#d8b46a]/30 bg-white text-[#64748b] hover:border-[#c5983c]/55 hover:bg-[#fbf8f1]"
                      }
                    `}
                  >
                    {isSelected ? (
                      <CheckSquare className="h-4 w-4 text-[#c5983c]" />
                    ) : (
                      <Square className="h-4 w-4 text-[#94a3b8]" />
                    )}

                    {method === "نقدي" && (
                      <Banknote
                        className={`h-3.5 w-3.5 ${
                          isSelected ? "text-[#c5983c]" : "text-[#94a3b8]"
                        }`}
                      />
                    )}

                    {method}
                  </button>
                );
              })}
            </div>

            {formData.transferMethods.length > 0 && (
              <div
                className="
                  space-y-4 rounded-[24px]
                  border border-[#d8b46a]/30
                  bg-[#fbf8f1]/70 p-4
                "
              >
                {formData.transferMethods.includes("حساب بنكي محلي/دولي") && (
                  <div className="grid grid-cols-1 gap-3 border-b border-[#e8ddc8] pb-4 md:grid-cols-2">
                    <InputField
                      label="اسم البنك"
                      value={formData.transferDetails?.bankName || ""}
                      placeholder="اسم البنك"
                      onChange={(value) =>
                        updateTransferDetail("bankName", value)
                      }
                    />

                    <InputField
                      label="IBAN"
                      value={formData.transferDetails?.iban || ""}
                      placeholder="SA..."
                      mono
                      dir="ltr"
                      onChange={(value) => updateTransferDetail("iban", value)}
                    />
                  </div>
                )}

                {formData.transferMethods.includes("ويسترن يونيون") && (
                  <div className="grid grid-cols-1 gap-3 border-b border-[#e8ddc8] pb-4 md:grid-cols-2">
                    <InputField
                      label="اسم المستلم Western Union"
                      value={formData.transferDetails?.westernName || ""}
                      placeholder="اسم المستلم كما في الوثيقة"
                      onChange={(value) =>
                        updateTransferDetail("westernName", value)
                      }
                    />

                    <InputField
                      label="الدولة / المدينة"
                      value={formData.transferDetails?.westernLocation || ""}
                      placeholder="الدولة أو المدينة"
                      onChange={(value) =>
                        updateTransferDetail("westernLocation", value)
                      }
                    />
                  </div>
                )}

                {formData.transferMethods.includes("InstaPay") && (
                  <div className="grid grid-cols-1 gap-3 border-b border-[#e8ddc8] pb-4 md:grid-cols-2">
                    <InputField
                      label="حساب InstaPay"
                      value={formData.transferDetails?.instapay || ""}
                      placeholder="username@instapay"
                      mono
                      dir="ltr"
                      onChange={(value) =>
                        updateTransferDetail("instapay", value)
                      }
                    />

                    <InputField
                      label="رقم الهاتف المرتبط"
                      value={formData.transferDetails?.instapayPhone || ""}
                      placeholder="رقم الهاتف"
                      mono
                      dir="ltr"
                      onChange={(value) =>
                        updateTransferDetail("instapayPhone", value)
                      }
                    />
                  </div>
                )}

                {formData.transferMethods.includes("محفظة رقمية USDT") && (
                  <div className="grid grid-cols-1 gap-3 border-b border-[#e8ddc8] pb-4 md:grid-cols-2">
                    <InputField
                      label="عنوان محفظة USDT"
                      value={formData.transferDetails?.usdtWallet || ""}
                      placeholder="Wallet address"
                      mono
                      dir="ltr"
                      onChange={(value) =>
                        updateTransferDetail("usdtWallet", value)
                      }
                    />

                    <InputField
                      label="الشبكة"
                      value={formData.transferDetails?.usdtNetwork || ""}
                      placeholder="TRC20 / ERC20 / BEP20"
                      mono
                      dir="ltr"
                      onChange={(value) =>
                        updateTransferDetail("usdtNetwork", value)
                      }
                    />
                  </div>
                )}

                {formData.transferMethods.includes("نقدي") && (
                  <InputField
                    label="ملاحظات الدفع النقدي"
                    value={formData.transferDetails?.cashNotes || ""}
                    placeholder="مثال: التسليم في المكتب / عند الاستلام..."
                    onChange={(value) =>
                      updateTransferDetail("cashNotes", value)
                    }
                  />
                )}
              </div>
            )}
          </SectionCard>

          {/* Notes + Files */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <SectionCard
              icon={Edit3}
              title="ملاحظات ومهام مخصصة"
              subtitle="أي تفاصيل إضافية متعلقة بالشخص"
              compact
            >
              <textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    notes: e.target.value,
                  })
                }
                className={`${TEXTAREA_CLASS} h-[130px]`}
                placeholder="أي ملاحظات إضافية..."
              />
            </SectionCard>

            <SectionCard
              icon={Paperclip}
              title="المستندات"
              subtitle="إرفاق الهوية، الاتفاق، أو أي مستند داعم"
              compact
            >
              <label
                className="
                  flex h-[130px] cursor-pointer flex-col items-center
                  justify-center gap-3 rounded-[24px]
                  border-2 border-dashed border-[#d8b46a]/40
                  bg-[#fbf8f1]/70 p-5 text-center
                  transition hover:border-[#c5983c]
                  hover:bg-[#f8efe0]
                "
              >
                <Upload className="h-7 w-7 text-[#c5983c]" />

                <span className="text-xs font-black text-[#123f59]">
                  {formData.files.length > 0
                    ? `تم تحديد ${formData.files.length} ملف للرفع`
                    : "اضغط لاختيار الملفات"}
                </span>

                <span className="text-[10px] font-bold text-[#64748b]">
                  يمكنك رفع أكثر من ملف
                </span>

                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      files: Array.from(e.target.files || []),
                    })
                  }
                />
              </label>
            </SectionCard>
          </div>
        </div>

        {/* Footer */}
        <div
          className="
            flex shrink-0 flex-col-reverse gap-3
            border-t border-[#e8ddc8]
            bg-white px-5 py-4
            shadow-[0_-10px_30px_rgba(18,63,89,0.06)]
            sm:flex-row sm:items-center sm:justify-end
          "
        >
          <button
            onClick={onClose}
            className="
              rounded-2xl border border-[#d8b46a]/30
              bg-[#fbf8f1] px-6 py-3
              text-xs font-black text-[#123f59]
              transition hover:bg-[#f8efe0]
            "
            type="button"
          >
            إلغاء الأمر
          </button>

          <button
            onClick={handleSubmit}
            disabled={isPending}
            className="
              flex items-center justify-center gap-2
              rounded-2xl bg-[#123f59] px-8 py-3
              text-sm font-black text-white
              shadow-[0_12px_30px_rgba(18,63,89,0.24)]
              transition hover:-translate-y-[1px]
              hover:bg-[#0f3448]
              disabled:cursor-not-allowed disabled:opacity-50
            "
            type="button"
          >
            {isPending ? (
              <Loader2 className="h-5 w-5 animate-spin text-[#e2bf74]" />
            ) : (
              <Save className="h-5 w-5 text-[#e2bf74]" />
            )}

            {mode === "add" ? `حفظ وإضافة ${type}` : "تحديث بيانات الملف"}
          </button>
        </div>
      </div>
    </div>
  );
}

const SectionCard = ({ icon: Icon, title, subtitle, children, compact }) => (
  <section
    className="
      overflow-hidden rounded-[28px]
      border border-[#d8b46a]/30 bg-white
      shadow-[0_16px_40px_rgba(18,63,89,0.08)]
    "
  >
    <div
      className="
        flex items-center gap-3 border-b border-[#e8ddc8]
        bg-gradient-to-l from-[#f8efe0] via-white to-[#eef7f6]
        px-5 py-4
      "
    >
      <span
        className="
          grid h-10 w-10 shrink-0 place-items-center
          rounded-2xl bg-[#123f59] text-[#e2bf74]
        "
      >
        <Icon className="h-5 w-5" />
      </span>

      <div className="min-w-0">
        <h3 className="truncate text-sm font-black text-[#123f59]">
          {title}
        </h3>

        {subtitle && (
          <p className="mt-0.5 truncate text-[10px] font-bold text-[#64748b]">
            {subtitle}
          </p>
        )}
      </div>
    </div>

    <div className={compact ? "p-4" : "p-5"}>{children}</div>
  </section>
);

const Field = ({ label, children }) => (
  <div>
    <label className="mb-1.5 block text-[11px] font-black text-[#64748b]">
      {label}
    </label>

    {children}
  </div>
);

const InputField = ({
  label,
  value,
  onChange,
  placeholder,
  icon: Icon,
  dir = "rtl",
  mono = false,
}) => (
  <Field label={label}>
    <div className="relative">
      {Icon && (
        <Icon
          className="
            absolute right-3 top-1/2 h-4 w-4
            -translate-y-1/2 text-[#c5983c]
          "
        />
      )}

      <input
        type="text"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        dir={dir}
        className={`${INPUT_CLASS} ${Icon ? "pr-10" : ""} ${
          mono ? "font-mono" : ""
        }`}
      />
    </div>
  </Field>
);

const PhoneInput = ({
  label,
  code,
  number,
  onCodeChange,
  onNumberChange,
  tone = "blue",
}) => {
  const isEmerald = tone === "emerald";

  return (
    <Field label={label}>
      <div
        className={`
          flex overflow-hidden rounded-2xl border bg-white
          shadow-sm transition
          focus-within:ring-4
          ${
            isEmerald
              ? "border-emerald-300 focus-within:border-emerald-500 focus-within:ring-emerald-100"
              : "border-[#d8b46a]/35 focus-within:border-[#c5983c] focus-within:ring-[#c5983c]/10"
          }
        `}
        dir="ltr"
      >
        <select
          value={code}
          onChange={(e) => onCodeChange(e.target.value)}
          className={`
            w-28 shrink-0 border-r px-2 text-xs
            font-mono font-black outline-none
            ${
              isEmerald
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-[#e8ddc8] bg-[#fbf8f1] text-[#123f59]"
            }
          `}
        >
          {COUNTRY_CODES.map((country) => (
            <option key={country.code} value={country.code}>
              {country.code} {country.label.split(" ")[1]}
            </option>
          ))}
        </select>

        <input
          type="text"
          value={number || ""}
          onChange={(e) => onNumberChange(e.target.value)}
          className="
            h-11 min-w-0 flex-1 bg-white
            px-3 text-left font-mono text-xs
            font-black text-[#123f59] outline-none
            placeholder:text-[#94a3b8]
          "
          placeholder="5XXXXXXXX"
        />
      </div>
    </Field>
  );
};