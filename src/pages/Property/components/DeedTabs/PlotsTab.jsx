import React from "react";
import { Map as MapIcon, Plus, Trash2 } from "lucide-react";

export const PlotsTab = ({
  localData,
  plotsCount,
  showPlotForm,
  setShowPlotForm,
  newPlot,
  setNewPlot,
  handleAddPlot,
  handleDeleteItem,
}) => {
  // 💡 [الحل]: تعريف نوع العقار لكي لا يحدث خطأ إذا لم يمرر كـ Prop
  const propertyType = localData.plots?.[0]?.propertyType || "أرض";

  return (
    <div className="animate-in fade-in max-w-7xl mx-auto">
      <div className="flex items-center justify-between gap-2 mb-4 pb-2 border-b border-[#d8e6ee]">
        <span className="text-sm font-black text-[#123B5D] flex items-center gap-2">
          <MapIcon className="w-5 h-5 text-emerald-600" /> القطع المرتبطة (
          {plotsCount})
        </span>
        <button
          onClick={() => setShowPlotForm(!showPlotForm)}
          className="bg-[#083646] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-[#0f6d7c]"
        >
          <Plus className="w-4 h-4" /> إضافة قطعة
        </button>
      </div>

      {showPlotForm && (
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl grid grid-cols-4 items-end gap-3 mb-4 animate-in slide-in-from-top-2">
          <div>
            <label className="text-xs font-bold block mb-1">رقم القطعة</label>
            <input
              type="text"
              className="w-full p-2.5 text-xs border rounded-xl outline-none"
              value={newPlot.plotNumber}
              onChange={(e) =>
                setNewPlot({ ...newPlot, plotNumber: e.target.value })
              }
            />
          </div>
          <div>
            <label className="text-xs font-bold block mb-1">المخطط</label>
            <input
              type="text"
              className="w-full p-2.5 text-xs border rounded-xl outline-none"
              value={newPlot.planNumber}
              onChange={(e) =>
                setNewPlot({ ...newPlot, planNumber: e.target.value })
              }
            />
          </div>
          <div>
            <label className="text-xs font-bold block mb-1">المساحة</label>
            <input
              type="number"
              className="w-full p-2.5 text-xs border rounded-xl outline-none"
              value={newPlot.area}
              onChange={(e) => setNewPlot({ ...newPlot, area: e.target.value })}
            />
          </div>
          <button
            onClick={handleAddPlot}
            className="px-4 py-2.5 bg-[#083646] text-white text-xs font-bold rounded-xl hover:bg-[#0f6d7c]"
          >
            إضافة مؤقتة
          </button>
        </div>
      )}

      {localData.plots.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {localData.plots.map((plot) => (
            <div
              key={plot.id}
              className="bg-white border border-[#d8e6ee] rounded-xl p-4 shadow-sm hover:border-emerald-400 transition-all group"
            >
              <div className="flex justify-between items-start mb-3 border-b border-[#e7eef2] pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                    <MapIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xs text-[#71839a] font-bold mb-0.5">
                      رقم القطعة
                    </div>
                    <div
                      className="text-lg font-black text-[#123B5D]"
                      dir="ltr"
                    >
                      {plot.plotNumber || "---"}
                    </div>
                  </div>
                </div>
                <div className="text-left">
                  <div className="text-xs text-[#71839a] font-bold mb-0.5">
                    المساحة
                  </div>
                  <div
                    className="text-lg font-black text-emerald-600"
                    dir="ltr"
                  >
                    {plot.area} م²
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-[#f7fbfd] p-2 rounded-xl border border-[#e7eef2]">
                  <span className="text-[#71839a] block text-[10px] mb-0.5">
                    المخطط
                  </span>
                  <span className="font-mono font-bold text-[#123B5D]">
                    {plot.planNumber || localData.planNumber || "---"}
                  </span>
                </div>
                <div className="bg-[#f7fbfd] p-2 rounded-xl border border-[#e7eef2]">
                  <span className="text-[#71839a] block text-[10px] mb-0.5">
                    نوع العقار
                  </span>
                  {/* 💡 استخدام المتغير بشكل صحيح هنا */}
                  <span className="font-bold text-[#123B5D]">
                    {plot.propertyType || propertyType}
                  </span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-[#e7eef2] flex justify-end gap-2">
                <button
                  onClick={() => handleDeleteItem("plots", plot.id)}
                  className="text-red-500 bg-red-50 px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-red-100 flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> حذف
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-[#f7fbfd] border-2 border-dashed border-slate-300 rounded-xl">
          <MapIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-[#71839a] font-bold">لا توجد قطع مضافة</p>
        </div>
      )}
    </div>
  );
};