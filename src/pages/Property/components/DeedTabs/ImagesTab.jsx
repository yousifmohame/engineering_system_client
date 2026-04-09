import React from "react";
import { Image as ImageIcon } from "lucide-react";

export const ImagesTab = ({ localData }) => {
  const allImages = localData.boundaries?.filter((b) => b.imageUrl) || [];

  return (
    <div className="animate-in fade-in max-w-7xl mx-auto">
      <div className="flex items-center justify-between gap-2 mb-4 pb-2 border-b border-slate-200">
        <span className="text-sm font-black text-slate-800 flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-pink-600" /> معرض الصور (
          {allImages.length})
        </span>
      </div>

      {allImages.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {allImages.map((b, idx) => {
            const parentPlot = localData.plots.find((p) => p.id === b.plotId);
            return (
              <div
                key={idx}
                className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all group"
              >
                <div className="relative h-40 bg-slate-100">
                  <img
                    src={b.imageUrl}
                    alt={b.direction}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-3 bg-white flex justify-between items-center border-t border-slate-100 relative z-10">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block mb-0.5">
                      قطعة رقم
                    </span>
                    <span
                      className="font-bold text-slate-700 text-sm"
                      dir="ltr"
                    >
                      {parentPlot?.plotNumber || "---"}
                    </span>
                  </div>
                  <span className="bg-pink-50 text-pink-700 px-2 py-1 rounded-md text-xs font-bold border border-pink-100">
                    الحد ال{b.direction}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl">
          <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-bold">
            لا توجد صور مرفوعة لحدود القطع
          </p>
          <p className="text-xs text-slate-400 mt-1">
            يتم رفع الصور من تبويب (الحدود)
          </p>
        </div>
      )}
    </div>
  );
};
