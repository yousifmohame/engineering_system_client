// ContractSteps.jsx
import React from "react";
import {
  FileText,
  Sparkles,
  Loader2,
  Shield,
  QrCode,
  Link as LinkIcon,
  FileSignature,
} from "lucide-react";

export const Step5Settings = ({
  contract,
  setContract,
  handleGenerateAiSummary,
  isGeneratingAI,
}) => (
  <div className="space-y-4 animate-in slide-in-from-right-4">
    {/* Cover Settings */}
    <div className="p-4 bg-white rounded-[22px] border border-[#d8e6ee] shadow-sm space-y-4">
      <div className="flex justify-between items-center border-b border-[#e7eef2] pb-3">
        <h3 className="text-[13px] font-black text-[#123B5D] flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#0f6d7c]" /> إعدادات الغلاف
          الأمامي
        </h3>
        <button
          onClick={handleGenerateAiSummary}
          disabled={isGeneratingAI}
          className="text-[10px] font-bold text-violet-700 bg-violet-50 hover:bg-violet-100 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-50"
        >
          {isGeneratingAI ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Sparkles className="w-3 h-3" />
          )}
          توليد ملخص ذكي
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-[11px] font-black text-[#123B5D]">
            العنوان الفرعي
          </label>
          <input
            type="text"
            value={contract.coverSettings?.subtitle || ""}
            onChange={(e) =>
              setContract({
                ...contract,
                coverSettings: {
                  ...contract.coverSettings,
                  subtitle: e.target.value,
                },
              })
            }
            className="w-full p-2 bg-[#f7fbfd] border border-[#d8e6ee] rounded-xl text-[13px] font-bold focus:ring-2 focus:ring-[#d9b85b]/20 outline-none"
            placeholder="وثيقة تعاقدية ملزمة"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[11px] font-black text-[#123B5D]">
            رقم الإصدار
          </label>
          <input
            type="text"
            value={contract.coverSettings?.version || ""}
            onChange={(e) =>
              setContract({
                ...contract,
                coverSettings: {
                  ...contract.coverSettings,
                  version: e.target.value,
                },
              })
            }
            className="w-full p-2 bg-[#f7fbfd] border border-[#d8e6ee] rounded-xl text-[13px] font-bold focus:ring-2 focus:ring-[#d9b85b]/20 outline-none"
            placeholder="1.0"
          />
        </div>
        <div className="col-span-2 space-y-1.5">
          <label className="text-[11px] font-black text-[#123B5D]">
            ملخص العقد (يظهر في الغلاف)
          </label>
          <textarea
            value={contract.coverSummary || ""}
            onChange={(e) =>
              setContract({ ...contract, coverSummary: e.target.value })
            }
            className="w-full h-24 p-4 bg-[#f7fbfd] border border-[#d8e6ee] rounded-xl text-[13px] font-bold focus:ring-2 focus:ring-[#d9b85b]/20 outline-none resize-none leading-relaxed"
            placeholder="ملخص مختصر لأهم بنود العقد..."
          />
        </div>
        <div className="col-span-2 flex items-center gap-4 pt-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={contract.coverSettings?.showLogo !== false}
              onChange={(e) =>
                setContract({
                  ...contract,
                  coverSettings: {
                    ...contract.coverSettings,
                    showLogo: e.target.checked,
                  },
                })
              }
              className="w-4 h-4 text-[#0f6d7c] rounded border-slate-300 focus:ring-emerald-500"
            />
            <span className="text-[11px] font-bold text-[#123B5D]">
              إظهار الشعار
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={contract.coverSettings?.showSummary !== false}
              onChange={(e) =>
                setContract({
                  ...contract,
                  coverSettings: {
                    ...contract.coverSettings,
                    showSummary: e.target.checked,
                  },
                })
              }
              className="w-4 h-4 text-[#0f6d7c] rounded border-slate-300 focus:ring-emerald-500"
            />
            <span className="text-[11px] font-bold text-[#123B5D]">
              إظهار الملخص
            </span>
          </label>
        </div>
      </div>

      {/* Background Settings */}
      <div className="mt-4 pt-4 border-t border-[#e7eef2]">
        <h4 className="text-[11px] font-black text-[#123B5D] mb-3">
          إعدادات الخلفية (صورة الغلاف)
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5 col-span-2">
            <label className="text-[11px] font-bold text-[#123B5D]">
              رابط الصورة (URL)
            </label>
            <input
              type="text"
              value={contract.coverSettings?.background?.imageUrl || ""}
              onChange={(e) =>
                setContract({
                  ...contract,
                  coverSettings: {
                    ...contract.coverSettings,
                    background: {
                      ...contract.coverSettings?.background,
                      imageUrl: e.target.value,
                    },
                  },
                })
              }
              className="w-full p-2 bg-[#f7fbfd] border border-[#d8e6ee] rounded-xl text-[13px] font-bold focus:ring-2 focus:ring-[#d9b85b]/20 outline-none"
              placeholder="https://example.com/image.jpg"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-[#123B5D]">
              الشفافية ({contract.coverSettings?.background?.opacity || 0.1})
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={contract.coverSettings?.background?.opacity || 0.1}
              onChange={(e) =>
                setContract({
                  ...contract,
                  coverSettings: {
                    ...contract.coverSettings,
                    background: {
                      ...contract.coverSettings?.background,
                      opacity: parseFloat(e.target.value),
                    },
                  },
                })
              }
              className="w-full"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-[#123B5D]">
              تطبيق على
            </label>
            <select
              value={contract.coverSettings?.background?.applyTo || "all"}
              onChange={(e) =>
                setContract({
                  ...contract,
                  coverSettings: {
                    ...contract.coverSettings,
                    background: {
                      ...contract.coverSettings?.background,
                      applyTo: e.target.value,
                    },
                  },
                })
              }
              className="w-full p-2 bg-[#f7fbfd] border border-[#d8e6ee] rounded-xl text-[13px] font-bold focus:ring-2 focus:ring-[#d9b85b]/20 outline-none"
            >
              <option value="front">الغلاف الأمامي فقط</option>
              <option value="back">الغلاف الخلفي فقط</option>
              <option value="all">كافة الصفحات</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    {/* References */}
    <div className="p-4 bg-blue-50 rounded-[22px] border border-blue-100 shadow-sm space-y-4">
      <h3 className="text-[13px] font-black text-blue-800 flex items-center gap-2 border-b border-blue-200 pb-3">
        <LinkIcon className="w-4 h-4" /> الارتباطات المرجعية
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-[11px] font-black text-blue-700">
            العقد الأساسي (إن وجد)
          </label>
          <input
            type="text"
            value={contract.baseContractId || ""}
            onChange={(e) =>
              setContract({
                ...contract,
                baseContractId: e.target.value,
                isAddendum: !!e.target.value,
              })
            }
            className="w-full p-2 bg-white border border-blue-200 rounded-xl text-[13px] font-bold focus:ring-2 focus:ring-blue-500/20 outline-none"
            placeholder="رقم العقد الأساسي"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[11px] font-black text-blue-700">
            عرض السعر المرجعي
          </label>
          <input
            type="text"
            value={contract.linkedQuoteId || ""}
            onChange={(e) =>
              setContract({ ...contract, linkedQuoteId: e.target.value })
            }
            className="w-full p-2 bg-white border border-blue-200 rounded-xl text-[13px] font-bold focus:ring-2 focus:ring-blue-500/20 outline-none"
            placeholder="رقم عرض السعر"
          />
        </div>
      </div>
    </div>

    {/* Approval Method */}
    <div className="p-4 bg-white rounded-[22px] border border-[#d8e6ee] shadow-sm space-y-4">
      <h3 className="text-[13px] font-black text-[#123B5D] flex items-center gap-2 border-b border-[#e7eef2] pb-3">
        <Shield className="w-4 h-4 text-[#0f6d7c]" /> طريقة الاعتماد
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {[
          { id: "platform", label: "منصة رسمية (أبشر/نفاذ)" },
          { id: "email", label: "بريد إلكتروني موثق" },
          { id: "whatsapp", label: "رسالة واتساب معتمدة" },
          { id: "verbal", label: "توقيع ورقي مباشر" },
        ].map((m) => (
          <label
            key={m.id}
            className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${contract.approvalMethod === m.id ? "bg-emerald-50 border-emerald-500 text-emerald-800 shadow-sm" : "bg-white border-[#d8e6ee] text-[#52677e] hover:bg-[#f7fbfd]"}`}
          >
            <input
              type="radio"
              name="approvalMethod"
              checked={contract.approvalMethod === m.id}
              onChange={() =>
                setContract({ ...contract, approvalMethod: m.id })
              }
              className="hidden"
            />
            <div
              className={`w-4 h-4 rounded-full border flex items-center justify-center ${contract.approvalMethod === m.id ? "border-emerald-500" : "border-slate-300"}`}
            >
              {contract.approvalMethod === m.id && (
                <div className="w-2 h-2 bg-emerald-500 rounded-full" />
              )}
            </div>
            <span className="text-[11px] font-black">{m.label}</span>
          </label>
        ))}
      </div>
    </div>

    {/* Verification Settings */}
    <div className="p-4 bg-white rounded-[22px] border border-[#d8e6ee] shadow-sm space-y-4">
      <h3 className="text-[13px] font-black text-[#123B5D] flex items-center gap-2 border-b border-[#e7eef2] pb-3">
        <QrCode className="w-4 h-4 text-[#0f6d7c]" /> إعدادات التحقق من العقد
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={
                contract.verificationSettings?.allowPublicVerification !== false
              }
              onChange={(e) =>
                setContract({
                  ...contract,
                  verificationSettings: {
                    ...contract.verificationSettings,
                    allowPublicVerification: e.target.checked,
                  },
                })
              }
              className="w-4 h-4 text-[#0f6d7c] rounded border-slate-300 focus:ring-emerald-500"
            />
            <span className="text-[11px] font-bold text-[#123B5D]">
              السماح بالتحقق العام (لأي شخص يمسح الكود)
            </span>
          </label>
        </div>
        {contract.verificationSettings?.allowPublicVerification !== false && (
          <>
            <div className="col-span-2 flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={contract.verificationSettings?.showParties}
                  onChange={(e) =>
                    setContract({
                      ...contract,
                      verificationSettings: {
                        ...contract.verificationSettings,
                        showParties: e.target.checked,
                      },
                    })
                  }
                  className="w-4 h-4 text-[#0f6d7c] rounded border-slate-300 focus:ring-emerald-500"
                />
                <span className="text-[11px] font-bold text-[#123B5D]">
                  إظهار بيانات الأطراف
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={contract.verificationSettings?.showFinancials}
                  onChange={(e) =>
                    setContract({
                      ...contract,
                      verificationSettings: {
                        ...contract.verificationSettings,
                        showFinancials: e.target.checked,
                      },
                    })
                  }
                  className="w-4 h-4 text-[#0f6d7c] rounded border-slate-300 focus:ring-emerald-500"
                />
                <span className="text-[11px] font-bold text-[#123B5D]">
                  إظهار البيانات المالية
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={contract.verificationSettings?.allowDownload}
                  onChange={(e) =>
                    setContract({
                      ...contract,
                      verificationSettings: {
                        ...contract.verificationSettings,
                        allowDownload: e.target.checked,
                      },
                    })
                  }
                  className="w-4 h-4 text-[#0f6d7c] rounded border-slate-300 focus:ring-emerald-500"
                />
                <span className="text-[11px] font-bold text-[#123B5D]">
                  السماح بتحميل نسخة PDF
                </span>
              </label>
            </div>
          </>
        )}
        <div className="col-span-2 space-y-1.5">
          <label className="text-[11px] font-black text-[#123B5D]">
            رسالة الخطأ (عند عدم وجود صلاحية)
          </label>
          <input
            type="text"
            value={
              contract.verificationSettings?.customErrorMessage ||
              "عفواً، لا تملك صلاحية لعرض تفاصيل هذا العقد."
            }
            onChange={(e) =>
              setContract({
                ...contract,
                verificationSettings: {
                  ...contract.verificationSettings,
                  customErrorMessage: e.target.value,
                },
              })
            }
            className="w-full p-2 bg-[#f7fbfd] border border-[#d8e6ee] rounded-xl text-[13px] font-bold focus:ring-2 focus:ring-[#d9b85b]/20 outline-none"
          />
        </div>
      </div>
    </div>

    {/* Witnesses */}
    <div className="p-4 bg-white rounded-[22px] border border-[#d8e6ee] shadow-sm space-y-4">
      <h3 className="text-[13px] font-black text-[#123B5D] flex items-center gap-2 border-b border-[#e7eef2] pb-3">
        <FileSignature className="w-4 h-4 text-[#0f6d7c]" /> الشهود (اختياري)
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-[11px] font-black text-[#123B5D]">
            اسم الشاهد الأول
          </label>
          <input
            type="text"
            value={contract.witnesses?.[0]?.name || ""}
            onChange={(e) => {
              const w = [...(contract.witnesses || [])];
              if (!w[0]) w[0] = { name: "", id: "" };
              w[0].name = e.target.value;
              setContract({ ...contract, witnesses: w });
            }}
            className="w-full p-2 bg-[#f7fbfd] border border-[#d8e6ee] rounded-xl text-[13px] font-bold focus:ring-2 focus:ring-[#d9b85b]/20 outline-none"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[11px] font-black text-[#123B5D]">
            رقم هوية الشاهد الأول
          </label>
          <input
            type="text"
            value={contract.witnesses?.[0]?.id || ""}
            onChange={(e) => {
              const w = [...(contract.witnesses || [])];
              if (!w[0]) w[0] = { name: "", id: "" };
              w[0].id = e.target.value;
              setContract({ ...contract, witnesses: w });
            }}
            className="w-full p-2 bg-[#f7fbfd] border border-[#d8e6ee] rounded-xl text-[13px] font-bold focus:ring-2 focus:ring-[#d9b85b]/20 outline-none"
          />
        </div>
      </div>
    </div>

    {/* QR Settings */}
    <div className="p-4 bg-white rounded-[22px] border border-[#d8e6ee] shadow-sm space-y-4">
      <div className="flex justify-between items-center border-b border-[#e7eef2] pb-3">
        <h3 className="text-[13px] font-black text-[#123B5D] flex items-center gap-2">
          <QrCode className="w-4 h-4 text-[#0f6d7c]" /> إعدادات الرموز (QR
          Codes)
        </h3>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={contract.qrSettings?.enabled}
            onChange={(e) =>
              setContract({
                ...contract,
                qrSettings: {
                  ...contract.qrSettings,
                  enabled: e.target.checked,
                },
              })
            }
          />
          <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
        </label>
      </div>
      {contract.qrSettings?.enabled && (
        <div className="space-y-3 pt-2">
          <div className="space-y-1.5">
            <label className="text-[11px] font-black text-[#123B5D]">
              رابط موقع المشروع (خرائط جوجل)
            </label>
            <input
              type="text"
              value={contract.qrSettings?.projectLocationUrl || ""}
              onChange={(e) =>
                setContract({
                  ...contract,
                  qrSettings: {
                    ...contract.qrSettings,
                    projectLocationUrl: e.target.value,
                  },
                })
              }
              className="w-full p-2 bg-[#f7fbfd] border border-[#d8e6ee] rounded-xl text-xs focus:ring-2 focus:ring-[#d9b85b]/20 outline-none"
              dir="ltr"
              placeholder="https://maps.google.com/..."
            />
          </div>
        </div>
      )}
    </div>
  </div>
);
