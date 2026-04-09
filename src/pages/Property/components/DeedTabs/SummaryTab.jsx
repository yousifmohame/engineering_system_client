import React from "react";
import { Calendar, Building, Info, Users, Crown } from "lucide-react";

export const SummaryTab = ({
  deed,
  localData,
  safeClientName,
  totalArea,
  plotsCount,
  safeFormatDate,
  setActiveTab,
}) => {
  // 💡 [الحل]: تعريف نوع العقار برمجياً بناءً على بيانات القطع لعدم حدوث خطأ
  const propertyType = localData.plots?.[0]?.propertyType || "أرض";

  // تحضير الملاك للعرض
  const ownersCount = localData.owners?.length || 0;

  return (
    <div className="space-y-4 animate-in fade-in max-w-7xl mx-auto">
      <div className="flex items-center gap-2 rounded-lg px-3 py-2 bg-blue-50 border border-blue-200">
        <Info className="w-4 h-4 text-blue-500" />
        <span className="text-xs flex-1 text-blue-800 font-medium">
          ملف ملكية مرتبط بالعميل {safeClientName}
        </span>
        <button
          onClick={() => setActiveTab("docs")}
          className="text-[10px] font-bold rounded px-3 py-1 bg-white text-blue-600 border border-blue-200 hover:bg-blue-100 transition-colors shadow-sm"
        >
          عرض الوثائق
        </button>
      </div>

      <div className="rounded-lg overflow-hidden border border-slate-200 bg-white">
        <div className="px-3 py-2 flex items-center justify-between border-b border-slate-200 bg-gradient-to-l from-blue-50/50 to-purple-50/50">
          <span className="text-[11px] text-slate-700 flex items-center gap-1.5 font-bold">
            <Calendar className="w-3.5 h-3.5 text-blue-500" /> مؤشرات التملك
          </span>
        </div>
        <div className="p-4 grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="rounded-lg p-3 text-center bg-blue-50 border border-blue-100">
            <div className="text-[10px] text-blue-500 mb-1 font-bold">
              تاريخ الإضافة
            </div>
            <div className="text-sm text-blue-700 font-bold">
              {safeFormatDate(deed.createdAt, "dd MMM yyyy")}
            </div>
          </div>
          <div className="rounded-lg p-3 text-center bg-amber-50 border border-amber-100">
            <div className="text-[10px] text-amber-500 mb-1 font-bold">
              إجمالي المساحة
            </div>
            <div className="text-sm text-amber-700 font-bold">
              {totalArea} م²
            </div>
          </div>
          <div className="rounded-lg p-3 text-center bg-emerald-50 border border-emerald-100">
            <div className="text-[10px] text-emerald-500 mb-1 font-bold">
              تاريخ الوثيقة
            </div>
            <div className="text-[11px] text-emerald-700 font-mono font-bold">
              {safeFormatDate(localData.deedDate)}
            </div>
          </div>
          <div className="rounded-lg p-3 text-center bg-purple-50 border border-purple-100">
            <div className="text-[10px] text-purple-500 mb-1 font-bold">
              عدد القطع
            </div>
            <div className="text-sm text-purple-700 font-bold">
              {plotsCount}
            </div>
          </div>
          <div className="rounded-lg p-3 text-center bg-green-50 border border-green-200">
            <div className="text-[10px] text-slate-500 mb-1 font-bold">
              الحالة
            </div>
            <div className="text-sm text-green-700 font-bold">
              {localData.status === "Active"
                ? "نشط/مؤكد"
                : localData.status || "جديد"}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-lg p-4 bg-slate-50 border border-slate-200">
          <div className="text-xs text-slate-600 mb-3 flex items-center gap-1.5 font-bold border-b border-slate-200 pb-2">
            <Building className="w-4 h-4 text-blue-500" /> البيانات والموقع
          </div>
          <div className="grid grid-cols-2 gap-y-3 gap-x-2">
            <div>
              <div className="text-[10px] text-slate-400 mb-0.5">
                المدينة / الحي
              </div>
              <div className="text-xs text-slate-800 font-bold">
                {localData.city || "---"} / {localData.district || "---"}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 mb-0.5">
                رقم المخطط
              </div>
              <div className="text-xs text-slate-800 font-mono font-bold bg-white px-2 py-0.5 rounded border border-slate-200 inline-block">
                {localData.planNumber || "---"}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 mb-0.5">
                نوع العقار
              </div>
              {/* 💡 استخدام المتغير هنا بسلام */}
              <div className="text-xs text-slate-800 font-bold">
                {propertyType}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 mb-0.5">الاستخدام</div>
              <div className="text-xs text-slate-800 font-bold">
                {localData.plots?.[0]?.usageType || "سكني"}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg p-4 bg-slate-50 border border-slate-200">
          <div className="text-xs text-slate-600 mb-3 flex items-center justify-between font-bold border-b border-slate-200 pb-2">
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-emerald-500" /> المُلّاك (
              {ownersCount})
            </div>
            <button
              onClick={() => setActiveTab("owners")}
              className="text-[10px] text-blue-600 hover:underline"
            >
              عرض الكل
            </button>
          </div>
          {localData.owners?.length > 0 ? (
            <div className="space-y-2">
              {localData.owners.map((owner, idx) => (
                <div
                  key={owner.id || idx}
                  className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0"
                >
                  <div className="flex items-center gap-2">
                    <Crown
                      className={`w-4 h-4 ${idx === 0 ? "text-amber-500" : "text-slate-300"} shrink-0`}
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-slate-800 font-bold">
                          {owner.name}
                        </span>
                        {idx === 0 && (
                          <span className="text-[8px] rounded px-1.5 py-0.5 bg-amber-100 text-amber-700 font-bold">
                            رئيسي
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5 font-mono">
                        {owner.idNumber}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-black text-blue-600 bg-blue-50 px-2 py-1 rounded">
                    {owner.sharePercentage || owner.share}%
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-slate-400 text-center py-4">
              لا يوجد ملاك مسجلين
            </div>
          )}
        </div>
      </div>

      {/* اختصارات سريعة */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-4">
        {[
          {
            id: "docs",
            label: "الوثائق",
            count: localData.documents?.length || 0,
            color: "text-blue-600",
          },
          {
            id: "plots",
            label: "القطع",
            count: plotsCount,
            color: "text-emerald-600",
          },
          {
            id: "bounds",
            label: "الحدود",
            count: localData.boundaries?.length || 0,
            color: "text-amber-500",
          },
          {
            id: "attachments",
            label: "المرفقات",
            count: localData.attachments?.length || 0,
            color: "text-purple-600",
          },
          {
            id: "images",
            label: "الصور",
            count: localData.boundaries?.filter((b) => b.imageUrl).length || 0,
            color: "text-pink-500",
          },
          {
            id: "transactions",
            label: "المعاملات",
            count: 0,
            color: "text-slate-600",
          },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className="flex items-center justify-between rounded-lg p-2 bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all"
          >
            <span className="text-[10px] font-bold text-slate-600">
              {item.label}
            </span>
            <span className={`text-sm font-black ${item.color}`}>
              {item.count}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
