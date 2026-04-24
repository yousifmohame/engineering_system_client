import React from "react";
import {
  ImageIcon,
  Type,
  Hash,
  MousePointer2,
  Palette,
  Lock,
  DollarSign,
  Zap,
  Shield,
  FileText
} from "lucide-react";
import { toast } from "sonner";

export const SettingsTab = ({
  docSettings,
  setDocSettings,
}) => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* إعدادات الختم العامة */}
      <div className="bg-white rounded-[40px] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <h3 className="font-black text-slate-800 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" /> إعدادات الختم المؤمن
            الافتراضية
          </h3>
        </div>
        <div className="p-8 space-y-6">
          <div className="space-y-3">
            <label className="text-xs font-black text-slate-700 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-slate-400" /> صورة الختم
              الرسمية
            </label>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-slate-100 rounded-2xl border border-slate-200 flex items-center justify-center overflow-hidden">
                {docSettings.defaultStamp.stampImage ? (
                  <img
                    loading="lazy"
                    src={docSettings.defaultStamp.stampImage}
                    alt="Stamp Default"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <ImageIcon className="w-8 h-8 text-slate-300" />
                )}
              </div>
              <button className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-black text-slate-700 transition-colors">
                تغيير الصورة
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-black text-slate-700 flex items-center gap-2">
              <Type className="w-4 h-4 text-slate-400" /> نص الخلفية المؤمنة
            </label>
            <input
              type="text"
              value={docSettings.defaultStamp.backgroundText}
              onChange={(e) =>
                setDocSettings({
                  ...docSettings,
                  defaultStamp: {
                    ...docSettings.defaultStamp,
                    backgroundText: e.target.value,
                  },
                })
              }
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-600/20 transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-700 flex items-center gap-2">
                <Hash className="w-4 h-4 text-slate-400" /> بادئة السريال
              </label>
              <input
                type="text"
                value={docSettings.defaultStamp.serialPrefix}
                onChange={(e) =>
                  setDocSettings({
                    ...docSettings,
                    defaultStamp: {
                      ...docSettings.defaultStamp,
                      serialPrefix: e.target.value,
                    },
                  })
                }
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-600/20 transition-all"
              />
            </div>
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-700 flex items-center gap-2">
                <MousePointer2 className="w-4 h-4 text-slate-400" /> موقع
                السريال
              </label>
              <select
                value={docSettings.defaultStamp.serialPosition}
                onChange={(e) =>
                  setDocSettings({
                    ...docSettings,
                    defaultStamp: {
                      ...docSettings.defaultStamp,
                      serialPosition: e.target.value,
                    },
                  })
                }
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none"
              >
                <option value="inside">داخل الختم</option>
                <option value="top">أعلى الختم</option>
                <option value="bottom">أسفل الختم</option>
                <option value="around">حول الختم</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-black text-slate-700 flex items-center gap-2">
              <Palette className="w-4 h-4 text-slate-400" /> لون وشفافية الخلفية
            </label>
            <div className="flex items-center gap-4">
              <input
                type="color"
                value={docSettings.defaultStamp.backgroundColor}
                onChange={(e) =>
                  setDocSettings({
                    ...docSettings,
                    defaultStamp: {
                      ...docSettings.defaultStamp,
                      backgroundColor: e.target.value,
                    },
                  })
                }
                className="w-12 h-12 rounded-xl border-none cursor-pointer"
              />
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={docSettings.defaultStamp.backgroundOpacity}
                onChange={(e) =>
                  setDocSettings({
                    ...docSettings,
                    defaultStamp: {
                      ...docSettings.defaultStamp,
                      backgroundOpacity: parseFloat(e.target.value),
                    },
                  })
                }
                className="flex-1 accent-blue-600"
              />
              <span className="text-xs font-black text-slate-500">
                {Math.round(docSettings.defaultStamp.backgroundOpacity * 100)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* الأمان والتكامل */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[40px] shadow-xl shadow-slate-200/50 border border-slate-100 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl">
              <Lock className="w-5 h-5" />
            </div>
            <h4 className="text-lg font-black text-slate-800">
              إعدادات الأمان والتشفير
            </h4>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-700">
                  خوارزمية التشفير
                </span>
                <span className="text-[10px] font-black text-blue-600 bg-white px-2 py-1 rounded-lg border border-blue-100">
                  AES-256-GCM
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-700">
                  طول مفتاح الهاش
                </span>
                <span className="text-[10px] font-black text-blue-600 bg-white px-2 py-1 rounded-lg border border-blue-100">
                  512-bit
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-500">
                مفتاح التوقيع الرقمي (Private Key)
              </label>
              <div className="relative">
                <input
                  type="password"
                  value="••••••••••••••••"
                  readOnly
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none"
                />
                <button className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-blue-600 hover:underline">
                  تغيير المفتاح
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="space-y-0.5">
                <p className="text-xs font-black text-slate-800">
                  التحقق بخطوتين
                </p>
                <p className="text-[10px] text-slate-400 font-bold">
                  طلب تأكيد عند كل عملية ختم
                </p>
              </div>
              <input
                type="checkbox"
                defaultChecked
                className="w-5 h-5 accent-blue-600"
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[40px] shadow-xl shadow-slate-200/50 border border-slate-100 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-2xl">
              <Zap className="w-5 h-5" />
            </div>
            <h4 className="text-lg font-black text-slate-800">
              إعدادات الربط والتكامل
            </h4>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-slate-400" />
                <div className="space-y-0.5">
                  <p className="text-xs font-black text-slate-800">
                    نظام العقود
                  </p>
                  <p className="text-[10px] text-blue-600 font-bold">
                    متصل ومفعل
                  </p>
                </div>
              </div>
              <button className="text-[10px] font-black text-slate-400 hover:text-slate-600">
                إعدادات
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-slate-400" />
                <div className="space-y-0.5">
                  <p className="text-xs font-black text-slate-800">
                    نظام الفواتير
                  </p>
                  <p className="text-[10px] text-blue-600 font-bold">
                    متصل ومفعل
                  </p>
                </div>
              </div>
              <button className="text-[10px] font-black text-slate-400 hover:text-slate-600">
                إعدادات
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-4">
        <button
          onClick={() => toast.success("تم حفظ جميع الإعدادات المتقدمة بنجاح.")}
          className="px-12 py-4 bg-slate-900 text-white rounded-[24px] text-sm font-black shadow-2xl shadow-slate-200 hover:bg-slate-800 transition-all transform hover:-translate-y-1"
        >
          حفظ جميع الإعدادات المتقدمة
        </button>
      </div>
    </div>
  );
};