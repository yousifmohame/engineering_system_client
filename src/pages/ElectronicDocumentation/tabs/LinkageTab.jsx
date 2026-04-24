import React from "react";
import {
  Link as LinkIcon,
  FileText,
  Check,
  Smartphone,
  ExternalLink,
  Lock,
  Zap,
  QrCode,
  FileSignature
} from "lucide-react";
import { DocumentationA4Preview } from "../components/SharedComponents";

export const LinkageTab = ({ linkageMappings }) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h3 className="text-lg font-black text-slate-800">
            إدارة ربط التوثيق بأنواع المستندات
          </h3>
          <p className="text-xs text-slate-500 font-bold mt-1">
            تحديد القواعد الافتراضية لكل نوع مستند لدعم التوليد الآلي من السيرفر
          </p>
        </div>
        <div className="flex gap-2 text-[10px] font-black uppercase text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100">
          <Lock className="w-3 h-3" /> System Logic Only
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {linkageMappings && linkageMappings.map((map) => (
          <div
            key={map.docTypeId}
            className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-blue-300 transition-all p-6 shadow-sm hover:shadow-md"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-slate-100 rounded-xl">
                  <FileText className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <div className="text-sm font-black text-slate-800">
                    {map.docTypeName}
                  </div>
                  <div className="text-[10px] font-bold text-slate-400">
                    ID: {map.docTypeId}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <span className="px-2 py-1 bg-blue-50 text-blue-600 text-[9px] font-black rounded border border-blue-100">
                  التوقيع: {map.defaultSignatureType}
                </span>
                <span className="px-2 py-1 bg-indigo-50 text-indigo-600 text-[9px] font-black rounded border border-indigo-100">
                  الختم: {map.defaultSealType}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="md:col-span-1 flex items-center justify-center p-4 bg-slate-50 rounded-3xl overflow-hidden border border-slate-100 relative">
                <div className="h-64 overflow-hidden w-full flex items-center justify-center">
                  <DocumentationA4Preview mapping={map} />
                </div>
              </div>

              <div className="md:col-span-1 space-y-2">
                <label className="text-[10px] font-black text-slate-500">
                  الصلاحيات (Roles)
                </label>
                <div className="flex flex-wrap gap-1">
                  {map.signerRoles.map((role) => (
                    <span
                      key={role}
                      className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px] font-bold"
                    >
                      {role}
                    </span>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                  <label className="text-[10px] font-black text-slate-500">
                    مواضع التوقيع والختم
                  </label>
                  <div className="text-[10px] font-bold text-slate-800 flex flex-col gap-1">
                    <span className="flex items-center gap-2 text-slate-600">
                      <FileSignature className="w-3 h-3" /> Signature:{" "}
                      {map.signaturePosition}
                    </span>
                    <span className="flex items-center gap-2 text-slate-600">
                      <QrCode className="w-3 h-3" /> Seal: {map.sealPosition}
                    </span>
                  </div>
                </div>
              </div>
              <div className="md:col-span-2 space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500">
                    نص التوثيق التلقائي
                  </label>
                  <p className="text-[10px] text-slate-700 font-bold leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100 min-h-[60px] flex items-center">
                    {map.statementTemplate}
                  </p>
                </div>
                <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                  <h5 className="text-[10px] font-black text-blue-600 mb-2">
                    حالة الربط التقني
                  </h5>
                  <div className="text-[9px] text-slate-600 font-bold flex items-center gap-2 mb-1">
                    <Check className="w-3 h-3 text-emerald-500" /> متاح للتوليد
                    التلقائي عبر الـ Prisma Hooks
                  </div>
                  <div className="text-[9px] text-slate-600 font-bold flex items-center gap-2">
                    <Check className="w-3 h-3 text-emerald-500" /> يدعم التوثيق
                    المتعدد (Multi-sig)
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end gap-3">
              <button className="px-5 py-2 bg-slate-50 text-slate-500 rounded-xl text-[10px] font-black hover:bg-slate-100 transition-colors">
                إعدادات متقدمة
              </button>
              <button className="px-5 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black hover:bg-blue-700 shadow-sm transition-all">
                تعديل التوثيق
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white shadow-xl">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-blue-600 rounded-2xl">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h4 className="text-lg font-black">
              تعميم نظام التوثيق (Verification Logic)
            </h4>
            <p className="text-xs text-slate-400 font-bold mt-1">
              تعليمات المطورين لربط المحرك بملفات النظام (Express API)
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
              <p className="text-[10px] leading-relaxed text-slate-300">
                يجب على محرك الطباعة استدعاء{" "}
                <code className="text-blue-300">GET /api/documentation/verify/:serial</code> قبل الرسم
                النهائي للملف لضمان صلاحية التوثيق.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
              <p className="text-[10px] leading-relaxed text-slate-300">
                يتم إسقاط الختم في إحداثيات (X, Y) المستمدة من{" "}
                <code className="text-blue-300">map.sealPosition</code> من السيرفر.
              </p>
            </div>
          </div>
          <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 space-y-4">
            <h5 className="text-[11px] font-black text-blue-400">
              ميزات الأمان المفعلة
            </h5>
            <ul className="space-y-2 text-[10px] text-slate-300 font-bold">
              <li className="flex items-center gap-2">
                <Check className="w-3 h-3 text-emerald-400" /> يتم تشفير السجلات بتقنية SHA-256 لمنع التلاعب.
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3 h-3 text-emerald-400" /> تطبيق تقنية LTV
                (Long Term Validation) لملفات الـ PDF الموقعة.
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3 h-3 text-emerald-400" /> يتم ربط التوثيق تلقائياً بهوية المستخدم في النظام (req.user).
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800">
          <h5 className="text-sm font-black text-white mb-6">
            دليل البرمجة والتحقق (Programmer Manual)
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-slate-800/50 p-6 rounded-2xl space-y-4 border border-slate-700">
              <div className="flex items-center gap-3">
                <Smartphone className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-black">
                  نظام التحقق بخطوتين (OTP/SMS)
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-bold leading-relaxed">
                عند تفعيل "التوقيع المؤمن"، يجب استدعاء{" "}
                <code className="text-slate-300">OTP_Service.send()</code> قبل إرسال طلب التوثيق.
                يتم تخزين بصمة المتصفح والـ IP لضمان عدم الإنكار (Non-Repudiation).
              </p>
            </div>
            <div className="bg-slate-800/50 p-6 rounded-2xl space-y-4 border border-slate-700">
              <div className="flex items-center gap-3">
                <ExternalLink className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-black">
                  رابط التحقق العام (Verification URL)
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-bold leading-relaxed">
                يجب أن يوجه الـ QR Code إلى مسار التحقق العام في الواجهة الأمامية.
                تقوم الصفحة بمطابقة الهاش في قاعدة البيانات وعرض بيانات الوثيقة
                الأصلية للمطابقة.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};