import React from "react";
import { FileText, Briefcase, FileSignature, Link2 } from "lucide-react";
import { toast } from "sonner";

export default function LinksSection({
  minute,
  onGoToTransaction,
  onCreateQuote,
  onCreateTransaction,
  onCreateContract,
  onNavigate,
}) {
  const runAction = (handler, fallbackRoute, action, label) => {
    if (typeof handler === "function") {
      handler(minute);
      return;
    }

    const detail = {
      route: fallbackRoute,
      payload: {
        action,
        source: "meeting-minute",
        minute,
        minuteId: minute?.id,
        referenceNumber: minute?.referenceNumber,
        transactionId: minute?.transactionId,
      },
    };

    if (typeof onNavigate === "function" && fallbackRoute) {
      onNavigate(fallbackRoute, detail);
      return;
    }

    window.dispatchEvent(new CustomEvent("wms:navigate", { detail }));
    window.dispatchEvent(new CustomEvent("wms:open-module", { detail }));

    try {
      window.location.hash = fallbackRoute ? `#/${fallbackRoute}` : window.location.hash;
    } catch (_) {}

    toast.success(`تم إرسال أمر الانتقال إلى ${label}.`);
  };

  const openTransaction = () => {
    if (!minute.transactionId) {
      toast.error("لا توجد معاملة مرتبطة بهذا المحضر بعد.");
      return;
    }

    const detail = {
      route: "transactions",
      payload: {
        action: "open",
        source: "meeting-minute",
        minute,
        minuteId: minute?.id,
        transactionId: minute?.transactionId,
        transactionRef: minute?.transactionRef,
      },
    };

    if (typeof onGoToTransaction === "function") {
      onGoToTransaction(minute.transactionId, detail);
      return;
    }

    if (typeof onNavigate === "function") {
      onNavigate("transactions", detail);
      return;
    }

    window.dispatchEvent(new CustomEvent("wms:navigate", { detail }));
    window.dispatchEvent(new CustomEvent("wms:open-module", { detail }));

    try {
      window.location.hash = "#/transactions";
    } catch (_) {}

    toast.success("تم إرسال أمر فتح المعاملة.");
  };
  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
      
      {/* بيانات السجل */}
      <div className="p-4 bg-[#fbf8f1] border border-[#e8ddc8] rounded-[18px] shadow-sm">
        <h3 className="text-sm font-black text-[#123f59] mb-4">بيانات السجل</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div><span className="text-[#64748b] block">بواسطة:</span> <span className="font-bold">{minute.createdBy || 'مدير النظام'}</span></div>
          <div><span className="text-[#64748b] block">آخر تعديل:</span> <span className="font-bold">{minute.updatedAt ? new Date(minute.updatedAt).toLocaleTimeString('ar-SA') : '--:--'}</span></div>
          <div><span className="text-[#64748b] block">الحالة:</span> <span className="font-bold">{minute.status || 'مسودة'}</span></div>
          <div><span className="text-[#64748b] block">المرفقات:</span> <span className="font-bold">{minute.attachments?.length || 0} مرفقات</span></div>
        </div>
      </div>

      {/* المرجع والتكامل */}
      <div className="p-4 bg-[#eef7f6] border border-[#b9e5ee] rounded-[18px] shadow-sm">
        <h3 className="text-sm font-black text-[#123f59] mb-4">المرجع والتكامل</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div><span className="text-[#0e7490] block">العميل المرتبط:</span> <span className="font-bold">{minute.clientName || 'غير محدد'}</span></div>
          <div><span className="text-[#0e7490] block">رقم المعاملة:</span> <span className="font-bold">{minute.transactionId || 'غير مرتبط بمعاملة'}</span></div>
          <div className="col-span-2"><span className="text-[#0e7490] block">المرجع الداخلي للمحضر:</span> <span className="font-bold">{minute.referenceNumber || 'غير محدد'}</span></div>
        </div>
      </div>

      {/* الخطوات والإجراءات التالية */}
      <div className="p-4 bg-white border border-[#e8ddc8] rounded-[18px] shadow-sm">
        <h3 className="text-sm font-black text-[#123f59] mb-4">الخطوات والإجراءات التالية</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button type="button" onClick={() => runAction(onCreateQuote, "quotes", "create", "صفحة عروض الأسعار")} className="group flex min-h-[86px] flex-col items-center justify-center gap-2 rounded-2xl border border-[#e8ddc8] bg-white p-3 text-center shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#0e7490] hover:bg-[#fbf8f1] hover:shadow-md">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#fbf8f1] transition-colors group-hover:bg-[#eef7f6]">
              <FileText className="w-4 h-4 text-[#60738f] group-hover:text-[#0e7490] transition-colors" />
            </div>
            <span className="text-[11px] font-black leading-relaxed text-[#334155] transition-colors group-hover:text-[#0e7490]">إنشاء عرض سعر</span>
          </button>
          
          <button type="button" onClick={() => runAction(onCreateTransaction, "transactions", "create", "صفحة المعاملات")} className="group flex min-h-[86px] flex-col items-center justify-center gap-2 rounded-2xl border border-[#e8ddc8] bg-white p-3 text-center shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#0e7490] hover:bg-[#fbf8f1] hover:shadow-md">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#fbf8f1] transition-colors group-hover:bg-[#eef7f6]">
              <Briefcase className="w-4 h-4 text-[#60738f] group-hover:text-[#0e7490] transition-colors" />
            </div>
            <span className="text-[11px] font-black leading-relaxed text-[#334155] transition-colors group-hover:text-[#0e7490]">إنشاء معاملة جديدة</span>
          </button>
          
          <button 
            type="button"
            disabled={!minute.transactionId} 
            onClick={openTransaction}
            className="p-3 bg-white border border-[#e8ddc8] rounded-xl hover:bg-[#fbf8f1] hover:border-[#0e7490] transition-all flex flex-col items-center gap-2 group shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#fbf8f1] transition-colors group-hover:bg-[#eef7f6]">
              <Link2 className="w-4 h-4 text-[#60738f] group-hover:text-[#0e7490] transition-colors" />
            </div>
            <span className="text-[11px] font-black leading-relaxed text-[#334155] transition-colors group-hover:text-[#0e7490]">فتح المعاملة</span>
          </button>
          
          <button type="button" onClick={() => runAction(onCreateContract, "contracts", "create", "صفحة العقود")} className="group flex min-h-[86px] flex-col items-center justify-center gap-2 rounded-2xl border border-[#e8ddc8] bg-white p-3 text-center shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#0e7490] hover:bg-[#fbf8f1] hover:shadow-md">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#fbf8f1] transition-colors group-hover:bg-[#eef7f6]">
              <FileSignature className="w-4 h-4 text-[#60738f] group-hover:text-[#0e7490] transition-colors" />
            </div>
            <span className="text-[11px] font-black leading-relaxed text-[#334155] transition-colors group-hover:text-[#0e7490]">إنشاء عقد</span>
          </button>
        </div>
      </div>

    </div>
  );
}