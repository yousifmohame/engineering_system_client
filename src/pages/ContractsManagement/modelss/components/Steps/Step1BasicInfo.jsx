// ContractSteps.jsx
import React, { useState, useMemo, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  FileText,
  Building2,
  User,
  Sparkles,
  Link as LinkIcon,
  ChevronDown,
  Search,
} from "lucide-react";
import api from "../../../../../api/axios"; // 👈 استيراد API للاتصال بالباك اند
// ============================================================================
// 💡 Helpers & Reusable Components
// ============================================================================

// دالة تحويل الأرقام العربية إلى إنجليزية تلقائياً
const toEnglishNumbers = (str) => {
  if (str === null || str === undefined) return "";
  return String(str).replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d));
};

// قائمة منسدلة ذكية قابلة للبحث (للعملاء والجهات)
const SearchableSelect = ({
  options,
  value,
  onChange,
  placeholder,
  disabled,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target))
        setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = useMemo(() => {
    return options.filter((opt) =>
      opt.label.toLowerCase().includes(toEnglishNumbers(search).toLowerCase()),
    );
  }, [options, search]);

  const selectedLabel = options.find((o) => o.value === value)?.label || "";

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full border rounded-xl px-3 py-2.5 text-sm font-bold flex items-center justify-between cursor-pointer transition-colors ${
          disabled
            ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
            : "bg-slate-50 border-slate-200 focus-within:border-emerald-500 focus-within:bg-white"
        }`}
      >
        <span className={selectedLabel ? "text-slate-800" : "text-slate-400"}>
          {selectedLabel || placeholder}
        </span>
        <ChevronDown className="w-4 h-4 text-slate-400" />
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-hidden flex flex-col">
          <div className="p-2 border-b border-slate-100 bg-slate-50 sticky top-0">
            <div className="relative">
              <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                autoFocus
                type="text"
                placeholder="اكتب للبحث..."
                value={search}
                onChange={(e) => setSearch(toEnglishNumbers(e.target.value))}
                className="w-full pl-2 pr-7 py-1.5 text-xs font-bold border border-slate-200 rounded-lg outline-none focus:border-emerald-500"
              />
            </div>
          </div>
          <div className="overflow-y-auto custom-scrollbar-slim">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <div
                  key={opt.value}
                  onClick={() => {
                    onChange(opt.value, opt);
                    setIsOpen(false);
                    setSearch("");
                  }}
                  className="px-3 py-2 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 cursor-pointer border-b border-slate-50 last:border-0 font-bold"
                >
                  {opt.label}
                  {opt.subLabel && (
                    <span className="text-[10px] text-slate-400 block">
                      {opt.subLabel}
                    </span>
                  )}
                </div>
              ))
            ) : (
              <div className="p-3 text-center text-xs text-slate-400 font-bold">
                لا توجد نتائج
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const Step1BasicInfo = ({ contract, setContract, openAiModal }) => {
  // حالة التحكم بنوع إدخال الأطراف (من القاعدة أم إدخال يدوي)
  const [partyAMode, setPartyAMode] = useState("manual"); // غالباً مكتب الهندسة ثابت يدوياً
  const [partyBMode, setPartyBMode] = useState("db"); // غالباً العميل من القاعدة

  // 1. جلب المكاتب المتعاونة
  const { data: offices = [], isLoading: isLoadingOffices } = useQuery({
    queryKey: ["coop-offices-contracts"],
    queryFn: async () => (await api.get("/coop-offices")).data?.data || [],
  });

  // 2. جلب الموظفين (Persons)
  const { data: persons = [], isLoading: isLoadingPersons } = useQuery({
    queryKey: ["persons-directory-contracts"],
    queryFn: async () => (await api.get("/persons")).data?.data || [],
  });
  // جلب العملاء من الباك اند
  const { data: clients = [], isLoading: isLoadingClients } = useQuery({
    queryKey: ["clients-simple-contracts"],
    queryFn: async () => {
      const res = await api.get("/clients/simple");
      return Array.isArray(res.data) ? res.data : res.data?.data || [];
    },
  });

  // دمج المكاتب والموظفين في قائمة واحدة للطرف الأول
  const serviceProvidersOptions = useMemo(() => {
    const opts = [];
    // إضافة المكاتب
    offices.forEach((office) => {
      opts.push({
        label: office.name,
        value: `office-${office.id}`,
        type: "office",
        typeName: "مكتب متعاون",
        subLabel: `الرقم الضريبي/السجل: ${office.crNumber || "غير مسجل"}`,
        fullData: office,
      });
    });
    // إضافة الموظفين
    persons.forEach((person) => {
      opts.push({
        label: person.name,
        value: `person-${person.id}`,
        type: "person",
        typeName: "موظف/شخص",
        subLabel: `الوظيفة: ${person.role || "موظف"}`,
        fullData: person,
      });
    });
    return opts;
  }, [offices, persons]);

  // تجهيز بيانات القائمة المنسدلة
  const clientsOptions = useMemo(() => {
    return clients.map((c) => ({
      label: c.name?.ar || c.name || "بدون اسم",
      subLabel: `الهوية/السجل: ${c.idNumber || c.crNumber || "غير متوفر"}`,
      value: c.id,
      fullData: c, // الاحتفاظ بالبيانات كاملة للتعبئة التلقائية
    }));
  }, [clients]);

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4">
      {/* 1. Basic Info */}
      <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-black text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
          <FileText className="w-4 h-4 text-emerald-600" /> البيانات الأساسية
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-700">
              عنوان العقد
            </label>
            <input
              type="text"
              value={contract.name}
              onChange={(e) =>
                setContract({ ...contract, name: e.target.value })
              }
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none"
              placeholder="مثال: عقد تصميم فيلا سكنية"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-700">
              تاريخ العقد (ميلادي)
            </label>
            <input
              type="date"
              value={contract.date}
              onChange={(e) => {
                const gDate = new Date(e.target.value);
                const hDate = new Intl.DateTimeFormat("ar-SA-u-ca-islamic", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                }).format(gDate);
                setContract({
                  ...contract,
                  date: e.target.value,
                  hijriDate: hDate,
                  gregorianDate: new Intl.DateTimeFormat("ar-SA", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  }).format(gDate),
                });
              }}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none"
            />
          </div>
        </div>
        <div className="space-y-1.5 pt-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-black text-slate-700">
              مقدمة وتمهيد العقد
            </label>
            <button
              onClick={() =>
                openAiModal("introduction", contract.introduction || "")
              }
              className="text-[10px] font-bold text-violet-700 bg-violet-50 hover:bg-violet-100 px-2 py-1 rounded flex items-center gap-1 transition-colors"
            >
              <Sparkles className="w-3 h-3" /> صياغة ذكية
            </button>
          </div>
          <textarea
            value={contract.introduction}
            onChange={(e) =>
              setContract({ ...contract, introduction: e.target.value })
            }
            className="w-full h-24 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none resize-none leading-relaxed"
            placeholder="اكتب التمهيد هنا..."
          />
        </div>
      </div>

      {/* 2. الطرف الأول (مقدم الخدمة) */}
      <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-600" /> الطرف الأول (مقدم
            الخدمة)
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => setPartyAMode("db")}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${partyAMode === "db" ? "bg-emerald-600 text-white border-emerald-600" : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"}`}
            >
              اختيار من النظام
            </button>
            <button
              onClick={() => setPartyAMode("manual")}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${partyAMode === "manual" ? "bg-blue-600 text-white border-blue-600" : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"}`}
            >
              إدخال يدوي
            </button>
          </div>
        </div>

        {partyAMode === "db" && (
          <div className="mb-4 bg-emerald-50/30 p-4 rounded-xl border border-emerald-100">
            <label className="block text-xs font-bold text-emerald-800 mb-1.5 text-right">
              ابحث عن (مكتب أو موظف) في النظام *
            </label>
            <SearchableSelect
              options={serviceProvidersOptions}
              value={contract.partyADetails?.serviceProviderId}
              placeholder="ابحث بالاسم..."
              isLoading={isLoadingOffices || isLoadingPersons}
              onChange={(val, opt) => {
                const data = opt.fullData;
                setContract({
                  ...contract,
                  partyA: data.name,
                  partyADetails: {
                    ...contract.partyADetails,
                    serviceProviderId: val,
                    representant:
                      opt.type === "person"
                        ? data.name
                        : data.managerName || "",
                    cr: data.crNumber || data.idNumber || "",
                    address: data.address || "",
                  },
                });
              }}
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-700">
              اسم الجهة / مقدم الخدمة
            </label>
            <input
              type="text"
              value={contract.partyA}
              onChange={(e) =>
                setContract({ ...contract, partyA: e.target.value })
              }
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-700">
              يمثلها (المفوض بالتوقيع)
            </label>
            <input
              type="text"
              value={contract.partyADetails?.representant}
              onChange={(e) =>
                setContract({
                  ...contract,
                  partyADetails: {
                    ...contract.partyADetails,
                    representant: e.target.value,
                  },
                })
              }
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-700">
              السجل التجاري / الهوية
            </label>
            <input
              type="text"
              value={contract.partyADetails?.cr}
              onChange={(e) =>
                setContract({
                  ...contract,
                  partyADetails: {
                    ...contract.partyADetails,
                    cr: toEnglishNumbers(e.target.value),
                  },
                })
              }
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-700">
              العنوان الوطني
            </label>
            <input
              type="text"
              value={contract.partyADetails?.address}
              onChange={(e) =>
                setContract({
                  ...contract,
                  partyADetails: {
                    ...contract.partyADetails,
                    address: e.target.value,
                  },
                })
              }
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none"
            />
          </div>
        </div>
      </div>

      {/* 3. Party B */}
      <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
            <User className="w-4 h-4 text-blue-600" /> الطرف الثاني (العميل)
          </h3>
          <div className="flex gap-2">
            <label
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border cursor-pointer transition-colors ${partyBMode === "db" ? "border-blue-600 bg-blue-50" : "border-slate-200 bg-white hover:bg-slate-50"}`}
            >
              <input
                type="radio"
                checked={partyBMode === "db"}
                onChange={() => setPartyBMode("db")}
                className="hidden"
              />
              <span
                className={`text-[10px] font-bold ${partyBMode === "db" ? "text-blue-800" : "text-slate-600"}`}
              >
                عميل مسجل مسبقاً
              </span>
            </label>
            <label
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border cursor-pointer transition-colors ${partyBMode === "manual" ? "border-emerald-600 bg-emerald-50" : "border-slate-200 bg-white hover:bg-slate-50"}`}
            >
              <input
                type="radio"
                checked={partyBMode === "manual"}
                onChange={() => {
                  setPartyBMode("manual");
                  // التفريغ عند اختيار الإدخال اليدوي
                  setContract({
                    ...contract,
                    partyB: "",
                    partyBDetails: {
                      ...contract.partyBDetails,
                      clientId: null,
                      representant: "",
                      idNumber: "",
                      phone: "",
                      address: "",
                    },
                  });
                }}
                className="hidden"
              />
              <span
                className={`text-[10px] font-bold ${partyBMode === "manual" ? "text-emerald-800" : "text-slate-600"}`}
              >
                عميل جديد / يدوي
              </span>
            </label>
          </div>
        </div>

        {partyBMode === "db" && (
          <div className="mb-4 bg-blue-50/30 p-4 rounded-xl border border-blue-100">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              ابحث عن العميل في النظام *
            </label>
            <SearchableSelect
              options={clientsOptions}
              value={contract.partyBDetails?.clientId}
              placeholder={
                isLoadingClients
                  ? "جاري التحميل..."
                  : "ابحث برقم الهوية أو اسم العميل..."
              }
              onChange={(val, opt) => {
                const client = opt.fullData;
                setContract({
                  ...contract,
                  partyB: client.name?.ar || client.name,
                  partyBDetails: {
                    ...contract.partyBDetails,
                    clientId: val, // حفظ الـ ID
                    representant: client.representant || "",
                    idNumber: client.idNumber || client.crNumber || "",
                    phone: client.phone || "",
                    address: client.address || client.nationalAddress || "",
                  },
                });
              }}
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-700">
              اسم العميل / الجهة
            </label>
            <input
              type="text"
              value={contract.partyB}
              onChange={(e) =>
                setContract({ ...contract, partyB: e.target.value })
              }
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500/20 outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-700">
              يمثلها (إن وجد)
            </label>
            <input
              type="text"
              value={contract.partyBDetails?.representant}
              onChange={(e) =>
                setContract({
                  ...contract,
                  partyBDetails: {
                    ...contract.partyBDetails,
                    representant: e.target.value,
                  },
                })
              }
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500/20 outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-700">
              رقم الهوية / السجل التجاري
            </label>
            <input
              type="text"
              value={contract.partyBDetails?.idNumber}
              onChange={(e) =>
                setContract({
                  ...contract,
                  partyBDetails: {
                    ...contract.partyBDetails,
                    idNumber: toEnglishNumbers(e.target.value),
                  },
                })
              }
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold focus:ring-2 focus:ring-blue-500/20 outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-700">
              رقم الجوال
            </label>
            <input
              type="text"
              value={contract.partyBDetails?.phone}
              onChange={(e) =>
                setContract({
                  ...contract,
                  partyBDetails: {
                    ...contract.partyBDetails,
                    phone: toEnglishNumbers(e.target.value),
                  },
                })
              }
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold focus:ring-2 focus:ring-blue-500/20 outline-none"
              dir="ltr"
            />
          </div>
          <div className="space-y-1.5 col-span-2">
            <label className="text-xs font-black text-slate-700">
              العنوان الوطني
            </label>
            <input
              type="text"
              value={contract.partyBDetails?.address}
              onChange={(e) =>
                setContract({
                  ...contract,
                  partyBDetails: {
                    ...contract.partyBDetails,
                    address: e.target.value,
                  },
                })
              }
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500/20 outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
