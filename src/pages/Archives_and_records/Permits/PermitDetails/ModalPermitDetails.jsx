import React, { useState, useRef, useMemo, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import api from "../../../../api/axios";
import { toast } from "sonner";
import {
  X,
  FileText,
  Edit3,
  Layers,
  MapPin,
  Save,
  Loader2,
  Brain,
  Copy,
  Link,
  Briefcase,
  User,
  Building,
  FileSignature,
  Paperclip,
} from "lucide-react";
import { TabDocument } from "./Tabs/TabDocument";
import { TabExtractedData } from "./Tabs/TabExtractedData";
import { TabComponents } from "./Tabs/TabComponents";
import { TabBoundaries } from "./Tabs/TabBoundaries";
import { TabAiReport } from "./Tabs/TabAiReport";
import { TabLinkedRecords } from "./Tabs/TabLinkedRecords";
import { TabExtraAttachments } from "./Tabs/TabExtraAttachments";
import {
  AiBadge,
  copyToClipboard,
  FormBadge,
  SearchableDropdown,
} from "./utils";

// ==========================================
// 💡 المكون الرئيسي للنافذة (Modal) المجمع
// ==========================================
export function ModalPermitDetails({ permit, onClose }) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState(0);

  // 💡 التعديل الأهم: رفعنا حالة الربط هنا لتكون متاحة للهيدر والتاب معاً
  const [linkingMode, setLinkingMode] = useState(null);
  const [selectedValue, setSelectedValue] = useState("");

  const [localLinks, setLocalLinks] = useState({
    linkedClientId: permit.linkedClientId || null,
    linkedOfficeId: permit.linkedOfficeId || null,
    linkedOwnershipId: permit.linkedOwnershipId || null,
    linkedTransactionId: permit.linkedTransactionId || null,
  });

  const { data: autoLinkedTransactions = [], isLoading: loadingAuto } =
    useQuery({
      queryKey: ["linked-transactions", permit.permitNumber, permit.year],
      queryFn: async () => {
        const res = await api.get(
          `/private-transactions?permitNumber=${permit.permitNumber}&year=${permit.year}`,
        );
        return res.data?.data || [];
      },
      enabled: !!permit.permitNumber && !!permit.year,
    });

  const { data: clients = [] } = useQuery({
    queryKey: ["clients-simple"],
    queryFn: async () => {
      const res = await api.get("/clients/simple");
      return res.data?.data || res.data || [];
    },
  });
  const { data: offices = [] } = useQuery({
    queryKey: ["offices-list"],
    queryFn: async () => {
      const res = await api.get("/intermediary-offices");
      return res.data?.data || res.data || [];
    },
  });
  const { data: ownerships = [] } = useQuery({
    queryKey: ["properties-list"],
    queryFn: async () => {
      const res = await api.get("/properties");
      return res.data?.data || res.data || [];
    },
  });
  const { data: privateTransactions = [] } = useQuery({
    queryKey: ["private-transactions-list"],
    queryFn: async () => {
      const res = await api.get("/private-transactions");
      return res.data?.data || res.data || [];
    },
  });

  // 2️⃣ جلب الأحياء لترجمة الـ ID إلى اسم عربي
  const { data: districtsTree = [] } = useQuery({
    queryKey: ["districts-tree-list"],
    queryFn: async () => {
      const res = await api.get("/riyadh-streets/tree");
      return res.data?.data || res.data || [];
    },
  });

  const flatDistricts = useMemo(() => {
    let all = [];
    districtsTree.forEach((s) => {
      if (s.neighborhoods) {
        all = [
          ...all,
          ...s.neighborhoods.map((n) => ({ ...n, sectorName: s.name })),
        ];
      }
    });
    return all;
  }, [districtsTree]);

  const linkMutation = useMutation({
    mutationFn: async (payload) =>
      await api.put(`/permits/${permit.id}`, payload),
    onSuccess: (data, variables) => {
      toast.success("تم تحديث الارتباط بنجاح!");
      queryClient.invalidateQueries(["building-permits"]);
      setLocalLinks((prev) => ({ ...prev, ...variables }));
      setLinkingMode(null);
      setSelectedValue("");
    },
    onError: () => toast.error("حدث خطأ أثناء الربط"),
  });
  // 💡 ================== وظيفة الدمج الجديدة ==================
  const mergeMutation = useMutation({
    mutationFn: async () => await api.post(`/permits/${permit.id}/auto-merge`),
    onSuccess: (res) => {
      toast.success(res.data?.message || "تم دمج الرخصة بنجاح! 🚀");
      queryClient.invalidateQueries(["building-permits"]);
      onClose(); // إغلاق النافذة بعد الدمج ليعود للجدول
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "حدث خطأ أثناء الدمج"),
  });

  const handleMergePermit = () => {
    if (
      window.confirm(
        "هل أنت متأكد من دمج هذه الرخصة مع السجل الأساسي المماثل لها؟ سيتم نقل البيانات والمرفقات وحذف هذا السجل المكرر.",
      )
    ) {
      mergeMutation.mutate();
    }
  };

  const handleSaveLink = () => {
    if (!selectedValue) return toast.error("يرجى اختيار السجل من القائمة");
    const payload = {};
    if (linkingMode === "client") payload.linkedClientId = selectedValue;
    if (linkingMode === "office") payload.linkedOfficeId = selectedValue;
    if (linkingMode === "ownership") payload.linkedOwnershipId = selectedValue;
    if (linkingMode === "privateTransaction")
      payload.linkedTransactionId = selectedValue;
    linkMutation.mutate(payload);
  };

  const handleUnlink = (field) => linkMutation.mutate({ [field]: null });

  const getOptions = (mode) => {
    if (mode === "client")
      return clients.map((c) => ({ label: c.name, value: c.id }));
    if (mode === "office")
      return offices.map((o) => ({ label: o.nameAr || o.name, value: o.id }));
    if (mode === "ownership")
      return ownerships.map((o) => ({
        label: `صك رقم: ${o.deedNumber || o.id}`,
        value: o.id,
      }));
    if (mode === "privateTransaction")
      return privateTransactions.map((t) => ({
        label: `رقم: ${t.ref || t.id} - ${t.client}`,
        value: t.id,
      }));
    return [];
  };

  const tabs = [
    { label: "البيانات", icon: <Edit3 size={12} /> },
    { label: "المستند", icon: <FileText size={12} /> },
    { label: "المكونات", icon: <Layers size={12} /> },
    { label: "الحدود", icon: <MapPin size={12} /> },
    { label: "المعاملات والارتباطات", icon: <Link size={12} /> },
    { label: "مرفقات أخرى", icon: <Paperclip size={12} /> },
    { label: "تقرير AI", icon: <Brain size={12} /> },
  ];

  if (!permit) return null;

  // 💡 استخراج اسم الحي الصحيح لعرضه في الشريط العلوي بدلاً من الـ ID
  const displayDistrict = useMemo(() => {
    if (
      permit?.district &&
      permit.district.length > 20 &&
      flatDistricts.length > 0
    ) {
      const foundDistrict = flatDistricts.find((x) => x.id === permit.district);
      return foundDistrict ? foundDistrict.name : permit.district;
    }
    return permit?.district || "—";
  }, [permit?.district, flatDistricts]);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/65 backdrop-blur-sm p-3 animate-in fade-in"
      dir="rtl"
    >
      <div className="bg-white rounded-[1.7rem] shadow-2xl border border-slate-200 w-full max-w-[96vw] h-[94vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3 bg-[#0f3d50] text-white border-b border-white/10 shrink-0 relative z-50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#d7b96d] text-[#0f3d50] rounded-xl shadow-sm">
                <FileText size={20} />
              </div>
              <div>
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  رخصة رقم {permit.permitNumber || "—"}
                  <AiBadge status={permit.aiStatus} />
                </h2>
                <p className="text-[11px] font-bold text-white/65 mt-0.5">
                  تفاصيل، مكونات، ومرفقات الرخصة
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* زر الدمج يظهر فقط للرخص المعلقة */}
              {permit.aiStatus === "مكرر - بانتظار الدمج" && (
                <button
                  onClick={handleMergePermit}
                  disabled={mergeMutation.isPending}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white text-[11px] font-bold rounded-xl hover:bg-orange-600 shadow-md animate-pulse disabled:opacity-50 transition-all"
                >
                  {mergeMutation.isPending ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Layers size={14} />
                  )}
                  دمج مع السجل الأساسي
                </button>
              )}

              <button
                onClick={onClose}
                className="p-2 bg-white/10 hover:bg-red-500/90 hover:text-white rounded-xl transition-colors border border-white/15 text-white/80 shadow-sm"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* 💡 أزرار الربط في الهيدر */}
          <div className="bg-white/10 p-2.5 border border-white/15 rounded-xl shadow-sm relative">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold text-white/75 ml-2">
                <Link size={14} className="inline mr-1 text-[#0f3d50]" /> ربط
                السجل الحالي:
              </span>
              {!localLinks.linkedClientId && (
                <button
                  onClick={() => {
                    setLinkingMode("client");
                    setSelectedValue("");
                  }}
                  className={`flex-1 min-w-[100px] p-2 border rounded-lg flex items-center justify-center gap-1.5 transition-all ${linkingMode === "client" ? "border-[#d7b96d] bg-[#f4f7f8] text-[#123B5D] shadow-sm" : "border-slate-200 bg-slate-50 text-slate-600 hover:border-[#d7b96d] hover:bg-white"}`}
                >
                  <User size={14} />{" "}
                  <span className="text-[9px] font-black">ربط بعميل</span>
                </button>
              )}
              {!localLinks.linkedOfficeId && (
                <button
                  onClick={() => {
                    setLinkingMode("office");
                    setSelectedValue("");
                  }}
                  className={`flex-1 min-w-[100px] p-2 border rounded-lg flex items-center justify-center gap-1.5 transition-all ${linkingMode === "office" ? "border-[#d7b96d] bg-[#f4f7f8] text-[#123B5D] shadow-sm" : "border-slate-200 bg-slate-50 text-slate-600 hover:border-[#d7b96d] hover:bg-white"}`}
                >
                  <Briefcase size={14} />{" "}
                  <span className="text-[9px] font-black">ربط بمكتب</span>
                </button>
              )}
              {!localLinks.linkedOwnershipId && (
                <button
                  onClick={() => {
                    setLinkingMode("ownership");
                    setSelectedValue("");
                  }}
                  className={`flex-1 min-w-[100px] p-2 border rounded-lg flex items-center justify-center gap-1.5 transition-all ${linkingMode === "ownership" ? "border-[#d7b96d] bg-[#f4f7f8] text-[#123B5D] shadow-sm" : "border-slate-200 bg-slate-50 text-slate-600 hover:border-[#d7b96d] hover:bg-white"}`}
                >
                  <Building size={14} />{" "}
                  <span className="text-[9px] font-black">ربط بملكية</span>
                </button>
              )}
              {!localLinks.linkedTransactionId && (
                <button
                  onClick={() => {
                    setLinkingMode("privateTransaction");
                    setSelectedValue("");
                  }}
                  className={`flex-1 min-w-[100px] p-2 border rounded-lg flex items-center justify-center gap-1.5 transition-all ${linkingMode === "privateTransaction" ? "border-[#d7b96d] bg-[#f4f7f8] text-[#123B5D] shadow-sm" : "border-slate-200 bg-slate-50 text-slate-600 hover:border-[#d7b96d] hover:bg-white"}`}
                >
                  <FileSignature size={14} />{" "}
                  <span className="text-[9px] font-black">ربط بمعاملة</span>
                </button>
              )}
            </div>

            {/* منطقة البحث العائمة في الهيدر */}
            {linkingMode && activeTab !== 4 && (
              <div className="absolute top-[110%] left-0 right-0 p-3 bg-[#f4f7f8] border border-[#e8dcc8] rounded-xl flex items-center gap-3 z-[250] shadow-xl animate-in slide-in-from-top-2">
                <div className="flex-1">
                  <SearchableDropdown
                    options={getOptions(linkingMode)}
                    value={selectedValue}
                    onChange={(val) => setSelectedValue(val)}
                    placeholder={`ابحث واختر ${linkingMode === "client" ? "العميل" : linkingMode === "office" ? "المكتب" : linkingMode === "ownership" ? "الملكية" : "المعاملة"}...`}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveLink}
                    disabled={linkMutation.isPending}
                    className="px-4 py-2 bg-[#0f3d50] text-white text-[10px] font-black rounded-lg hover:bg-[#174e65] shadow-sm transition-colors flex items-center gap-1.5"
                  >
                    {linkMutation.isPending ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <Save size={12} />
                    )}
                    تأكيد الربط
                  </button>
                  <button
                    onClick={() => setLinkingMode(null)}
                    className="px-3 py-2 bg-white text-slate-500 border border-slate-200 text-[10px] font-black rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Info Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 px-5 py-3 bg-[#f4f7f8] border-b border-slate-200 text-[11px] shrink-0 z-20 shadow-sm relative">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col justify-between group">
            <span className="text-slate-400 font-bold mb-1 flex justify-between items-center">
              المالك
              <button
                onClick={() => copyToClipboard(permit.ownerName)}
                className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-[#123B5D] transition-all"
              >
                <Copy size={10} />
              </button>
            </span>
            <span className="text-slate-800 font-bold truncate text-sm">
              {permit.ownerName || "—"}
            </span>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col justify-between group">
            <span className="text-slate-400 font-bold mb-1 flex justify-between items-center">
              الهوية
              <button
                onClick={() => copyToClipboard(permit.idNumber)}
                className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-[#123B5D] transition-all"
              >
                <Copy size={10} />
              </button>
            </span>
            <span className="text-slate-800 font-mono font-bold text-sm">
              {permit.idNumber || "—"}
            </span>
          </div>
          {/* مربع الحي والقطاع في الـ Quick Info Bar */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col justify-between group">
            <span className="text-slate-400 font-bold mb-1 flex justify-between items-center">
              الحي / القطاع
            </span>
            <span className="text-slate-800 font-bold truncate text-sm">
              {/* 💡 تم استبدال permit.district بـ displayDistrict هنا */}
              {displayDistrict} - {permit.sector || "—"}
            </span>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <span className="text-slate-400 font-bold block mb-1">
              شكل ومصدر الرخصة
            </span>
            <div className="flex items-center gap-1 mt-1">
              <FormBadge form={permit.form} />
              <span className="text-[10px] font-bold text-[#123B5D] bg-[#f4f7f8] px-1.5 py-0.5 rounded border border-[#e8dcc8]">
                {permit.source}
              </span>
            </div>
          </div>
        </div>

        {/* 💡 التعديل هنا: إضافة min-h-0 للحاوية الرئيسية لفرض التمرير الداخلي */}
        <div className="flex flex-row flex-1 overflow-hidden bg-[#fafbfc] min-h-0">
          {/* 👈 Sidebar (Vertical Tabs) */}
          <div className="w-full md:w-[210px] bg-white border-l border-slate-200 overflow-y-auto custom-scrollbar-slim p-3 flex flex-col gap-1.5 shrink-0 shadow-[2px_0_10px_-5px_rgba(0,0,0,0.05)] z-10 min-h-0">
            {tabs.map((tab, i) => {
              const isActive = activeTab === i;
              return (
                <button
                  key={i}
                  onClick={() => setActiveTab(i)}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-lg text-[11px] font-bold transition-all text-right w-full shrink-0 relative ${
                    isActive
                      ? "bg-[#f4f7f8] text-[#0f3d50] shadow-sm border border-[#d7b96d]/50"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent"
                  }`}
                >
                  {/* خط التحديد النشط الجانبي */}
                  {isActive && (
                    <div className="absolute right-0 top-1/4 bottom-1/4 w-[4px] bg-[#d7b96d] rounded-l-full"></div>
                  )}

                  <span
                    className={`shrink-0 transition-transform ${isActive ? "text-[#123B5D] scale-110" : "text-slate-400 group-hover:scale-110"}`}
                  >
                    {tab.icon}
                  </span>

                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* 👈 Tab Content Area */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar relative bg-transparent min-h-0">
            <div className="max-w-4xl mx-auto">
              {activeTab === 0 && (
                <TabExtractedData
                  permit={permit}
                  flatDistricts={flatDistricts}
                />
              )}
              {activeTab === 1 && <TabDocument permit={permit} />}
              {activeTab === 2 && <TabComponents permit={permit} />}
              {activeTab === 3 && <TabBoundaries permit={permit} />}
              {activeTab === 4 && (
                <TabLinkedRecords
                  permit={permit}
                  localLinks={localLinks}
                  setLocalLinks={setLocalLinks}
                  linkingMode={linkingMode}
                  setLinkingMode={setLinkingMode}
                  selectedValue={selectedValue}
                  setSelectedValue={setSelectedValue}
                  handleSaveLink={handleSaveLink}
                  handleUnlink={handleUnlink}
                  getOptions={getOptions}
                  linkMutation={linkMutation}
                  autoLinkedTransactions={autoLinkedTransactions}
                  loadingAuto={loadingAuto}
                  clients={clients}
                  offices={offices}
                  ownerships={ownerships}
                  privateTransactions={privateTransactions}
                />
              )}
              {activeTab === 5 && <TabExtraAttachments permit={permit} />}
              {activeTab === 6 && <TabAiReport permit={permit} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
