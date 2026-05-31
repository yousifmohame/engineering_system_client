import React from "react";
import { FilePenLine, Stamp, Shield, CircleCheckBig } from "lucide-react";

export default function SignatureSettingsSection({ minute, updateField }) {
  // الحصول على الإعدادات الحالية أو استخدام القيم الافتراضية
  const settings = minute.advancedSignatureSettings || {
    signatureType: "none",
    stampType: "none",
    signingParties: "both",
    showAuthStatement: false,
    authStatementText: "",
  };

  const updateSetting = (key, value) => {
    updateField("advancedSignatureSettings", { ...settings, [key]: value });
  };

  // خيارات أنواع التوقيع
  const signatureOptions = [
    { id: "manual", label: "توقيع يدوي", icon: FilePenLine },
    { id: "stamp_only", label: "ختم فقط", icon: Stamp },
    { id: "manual_and_stamp", label: "توقيع وختم", icon: Shield },
    { id: "secure", label: "توقيع إلكتروني مؤمن", icon: CircleCheckBig },
    { id: "secure_and_manual", label: "إلكتروني + يدوي", icon: FilePenLine },
  ];

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="bg-white border border-[#e8ddc8] rounded-xl p-4 shadow-sm">
        <h3 className="text-sm font-black text-[#123f59] mb-4 flex items-center gap-2">
          <FilePenLine className="w-5 h-5 text-[#0e7490]" />
          إعدادات التوقيع والختم المتقدمة
        </h3>
        
        <div className="space-y-4">
          {/* 💡 1. نوع التوقيع (مربعات اختيار أيقونية) */}
          <div>
            <label className="block text-sm font-bold text-[#334155] mb-3">نوع التوقيع</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {signatureOptions.map((opt) => {
                const isActive = settings.signatureType === opt.id;
                return (
                  <label
                    key={opt.id}
                    className={`flex flex-col items-center justify-center p-3 border rounded-xl cursor-pointer transition-all ${
                      isActive
                        ? "border-[#0e7490] bg-[#eef7f6]/50 text-[#0e7490]"
                        : "border-[#e8ddc8] hover:border-[#0e7490]/50 text-[#60738f]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="signatureType"
                      value={opt.id}
                      checked={isActive}
                      onChange={(e) => updateSetting("signatureType", e.target.value)}
                      className="hidden"
                    />
                    <opt.icon className="w-6 h-6 mb-2" />
                    <span className="text-xs font-bold text-center">{opt.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* 💡 2. الختم والأطراف الموقعة */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-[#334155] mb-3">نوع الختم المرفق</label>
              <select
                value={settings.stampType || "none"}
                onChange={(e) => updateSetting("stampType", e.target.value)}
                className="w-full bg-[#fbf8f1] border border-[#e8ddc8] rounded-xl px-4 py-2 text-sm font-semibold text-[#334155] outline-none focus:border-[#0e7490] focus:ring-2 focus:ring-[#0e7490]/20 transition-all"
              >
                <option value="none">بدون ختم</option>
                <option value="office">ختم المكتب (الرسمي)</option>
                <option value="internal">ختم داخلي / مراجعة</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-[#334155] mb-3">الأطراف الموقعة</label>
              <select
                value={settings.signingParties || "both"}
                onChange={(e) => updateSetting("signingParties", e.target.value)}
                className="w-full bg-[#fbf8f1] border border-[#e8ddc8] rounded-xl px-4 py-2 text-sm font-semibold text-[#334155] outline-none focus:border-[#0e7490] focus:ring-2 focus:ring-[#0e7490]/20 transition-all"
              >
                <option value="both">جميع الأطراف</option>
                <option value="party1_only">الطرف الأول فقط (المكتب)</option>
                <option value="party2_only">الطرف الثاني فقط (العميل)</option>
                <option value="company_only">إصدار الشركة فقط (جهة الإصدار)</option>
              </select>
            </div>
          </div>

          {/* 💡 3. بيان التوثيق / المصادقة */}
          <div className="border-t border-[#e8ddc8] pt-4">
            <label className="flex items-center gap-2 mb-4 cursor-pointer w-fit">
              <input
                type="checkbox"
                checked={settings.showAuthStatement || false}
                onChange={(e) => updateSetting("showAuthStatement", e.target.checked)}
                className="rounded text-[#0e7490] focus:ring-[#0e7490]/20 w-4 h-4 cursor-pointer"
              />
              <span className="text-sm font-bold text-[#334155]">إظهار بيان التوثيق / المصادقة في أسفل المستند</span>
            </label>
            
            {settings.showAuthStatement && (
              <textarea
                value={settings.authStatementText || ""}
                onChange={(e) => updateSetting("authStatementText", e.target.value)}
                placeholder="نص التوثيق أو التنبيه (مثال: هذا المستند موقع إلكترونياً ولا يحتاج إلى توقيع حي...)"
                className="w-full bg-[#fbf8f1] border border-[#e8ddc8] rounded-xl p-3 text-sm font-semibold text-[#334155] outline-none focus:border-[#0e7490] focus:ring-2 focus:ring-[#0e7490]/20 transition-all min-h-[76px] resize-none"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}