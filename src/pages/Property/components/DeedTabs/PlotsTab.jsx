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
      <div className="flex items-center justify-between gap-2 mb-4 pb-2 border-b border-slate-200">
        <span className="text-sm font-black text-slate-800 flex items-center gap-2">
          <MapIcon className="w-5 h-5 text-emerald-600" /> القطع المرتبطة (
          {plotsCount})
        </span>
        <button
          onClick={() => setShowPlotForm(!showPlotForm)}
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-700"
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
              className="w-full p-2.5 text-xs border rounded-lg outline-none"
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
              className="w-full p-2.5 text-xs border rounded-lg outline-none"
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
              className="w-full p-2.5 text-xs border rounded-lg outline-none"
              value={newPlot.area}
              onChange={(e) => setNewPlot({ ...newPlot, area: e.target.value })}
            />
          </div>
          <button
            onClick={handleAddPlot}
            className="px-4 py-2.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700"
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
              className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:border-emerald-400 transition-all group"
            >
              <div className="flex justify-between items-start mb-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                    <MapIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-bold mb-0.5">
                      رقم القطعة
                    </div>
                    <div
                      className="text-lg font-black text-slate-800"
                      dir="ltr"
                    >
                      {plot.plotNumber || "---"}
                    </div>
                  </div>
                </div>
                <div className="text-left">
                  <div className="text-xs text-slate-400 font-bold mb-0.5">
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
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <span className="text-slate-400 block text-[10px] mb-0.5">
                    المخطط
                  </span>
                  <span className="font-mono font-bold text-slate-700">
                    {plot.planNumber || localData.planNumber || "---"}
                  </span>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <span className="text-slate-400 block text-[10px] mb-0.5">
                    نوع العقار
                  </span>
                  {/* 💡 استخدام المتغير بشكل صحيح هنا */}
                  <span className="font-bold text-slate-700">
                    {plot.propertyType || propertyType}
                  </span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  onClick={() => handleDeleteItem("plots", plot.id)}
                  className="text-red-500 bg-red-50 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-100 flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> حذف
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl">
          <MapIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-bold">لا توجد قطع مضافة</p>
        </div>
      )}
    </div>
  );
};
