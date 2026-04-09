import React from "react";
import {
  Layers,
  Map as MapIcon,
  Compass,
  Trash2,
  Camera,
  Edit3,
  Save,
  Loader2,
} from "lucide-react";

// مكون الرسم التفاعلي (موجود في الكود الأصلي)
const DynamicCroquis = ({ north, south, east, west, plotNumber }) => {
  const parseLength = (val) => {
    const parsed = parseFloat(val);
    return isNaN(parsed) || parsed <= 0 ? 100 : parsed;
  };
  const n = parseLength(north?.length);
  const s = parseLength(south?.length);
  const e = parseLength(east?.length);
  const w = parseLength(west?.length);
  const maxW = Math.max(n, s);
  const maxH = Math.max(e, w);
  const scale = 500 / Math.max(maxW, maxH);
  const scaledN = n * scale;
  const scaledS = s * scale;
  const scaledE = e * scale;
  const scaledW = w * scale;
  const width = Math.max(scaledN, scaledS);
  const height = Math.max(scaledE, scaledW);
  const bl = { x: (width - scaledS) / 2, y: height };
  const br = { x: bl.x + scaledS, y: height };
  const tl = { x: (width - scaledN) / 2, y: 0 };
  const tr = { x: tl.x + scaledN, y: 0 };
  const padX = 150;
  const padY = 100;
  const viewBoxWidth = width + padX * 2;
  const viewBoxHeight = height + padY * 2;
  const viewBox = `0 0 ${viewBoxWidth} ${viewBoxHeight}`;
  const fontSize = 16;
  const smallFontSize = 12;

  return (
    <svg
      viewBox={viewBox}
      className="w-full h-full drop-shadow-2xl transition-all duration-700 ease-in-out"
    >
      <defs>
        <pattern
          id="gridPattern"
          width="40"
          height="40"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M 40 0 L 0 0 0 40"
            fill="none"
            stroke="#3b82f6"
            strokeWidth="1"
            strokeOpacity="0.1"
          />
        </pattern>
      </defs>
      <rect
        x="0"
        y="0"
        width={viewBoxWidth}
        height={viewBoxHeight}
        fill="#f8fafc"
        rx="20"
      />
      <rect
        x="0"
        y="0"
        width={viewBoxWidth}
        height={viewBoxHeight}
        fill="url(#gridPattern)"
        rx="20"
      />
      <polygon
        points={`${bl.x + padX},${bl.y + padY} ${br.x + padX},${br.y + padY} ${tr.x + padX},${tr.y + padY} ${tl.x + padX},${tl.y + padY}`}
        fill="#eff6ff"
        fillOpacity="0.8"
        stroke="#2563eb"
        strokeWidth="4"
        strokeLinejoin="round"
        className="transition-all duration-700 ease-out hover:fill-blue-100"
      />
      <text
        x={width / 2 + padX}
        y={padY - 25}
        textAnchor="middle"
        fontSize={fontSize}
        className="fill-blue-800 font-bold"
      >
        شمال: {north?.length || 0}م
      </text>
      <text
        x={width / 2 + padX}
        y={padY - 10}
        textAnchor="middle"
        fontSize={smallFontSize}
        className="fill-slate-500"
      >
        {north?.description || "جار/شارع"}
      </text>
      <text
        x={width / 2 + padX}
        y={height + padY + 20}
        textAnchor="middle"
        fontSize={fontSize}
        className="fill-blue-800 font-bold"
      >
        جنوب: {south?.length || 0}م
      </text>
      <text
        x={width / 2 + padX}
        y={height + padY + 35}
        textAnchor="middle"
        fontSize={smallFontSize}
        className="fill-slate-500"
      >
        {south?.description || "جار/شارع"}
      </text>
      <text
        x={br.x + padX + 20}
        y={height / 2 + padY}
        textAnchor="start"
        alignmentBaseline="middle"
        fontSize={fontSize}
        className="fill-blue-800 font-bold"
      >
        شرق: {east?.length || 0}م
      </text>
      <text
        x={br.x + padX + 20}
        y={height / 2 + padY + 15}
        textAnchor="start"
        fontSize={smallFontSize}
        className="fill-slate-500"
      >
        {east?.description || "جار/شارع"}
      </text>
      <text
        x={bl.x + padX - 20}
        y={height / 2 + padY}
        textAnchor="end"
        alignmentBaseline="middle"
        fontSize={fontSize}
        className="fill-blue-800 font-bold"
      >
        غرب: {west?.length || 0}م
      </text>
      <text
        x={bl.x + padX - 20}
        y={height / 2 + padY + 15}
        textAnchor="end"
        fontSize={smallFontSize}
        className="fill-slate-500"
      >
        {west?.description || "جار/شارع"}
      </text>
      <text
        x={width / 2 + padX}
        y={height / 2 + padY}
        textAnchor="middle"
        alignmentBaseline="middle"
        fontSize="30"
        className="fill-blue-900 font-black opacity-10 tracking-widest pointer-events-none"
      >
        قطعة {plotNumber || "---"}
      </text>
    </svg>
  );
};

export const BoundsTab = ({
  localData,
  selectedPlotForBounds,
  setSelectedPlotForBounds,
  getBound,
  setActiveTab,
  isEditing,
  setIsEditing,
  updateMutation,
  handleUpdateBoundary,
  handleBoundaryImageUpload,
}) => {
  const north = getBound("شمال", selectedPlotForBounds);
  const south = getBound("جنوب", selectedPlotForBounds);
  const east = getBound("شرق", selectedPlotForBounds);
  const west = getBound("غرب", selectedPlotForBounds);
  const currentPlotDetails = localData.plots.find(
    (p) => p.id === selectedPlotForBounds,
  );

  return (
    <div className="animate-in fade-in flex flex-col max-w-7xl mx-auto w-full">
      {localData.plots.length === 0 ? (
        <div className="p-10 flex flex-col items-center justify-center text-slate-400 bg-slate-50 border-2 border-dashed rounded-xl h-full">
          <Layers className="w-16 h-16 mb-4 opacity-50" />
          <p className="text-lg font-bold text-slate-600">
            الرجاء إضافة قطع الأراضي أولاً
          </p>
          <button
            onClick={() => setActiveTab("plots")}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold"
          >
            الذهاب لتبويب القطع
          </button>
        </div>
      ) : (
        <>
          <div className="flex gap-2 overflow-x-auto pb-4 custom-scrollbar">
            {localData.plots.map((plot) => (
              <button
                key={plot.id}
                onClick={() => setSelectedPlotForBounds(plot.id)}
                className={`px-4 py-3 text-sm font-bold rounded-xl border flex items-center gap-3 min-w-[150px] transition-all ${
                  selectedPlotForBounds === plot.id
                    ? "bg-blue-600 text-white border-blue-600 shadow-md scale-105"
                    : "bg-white text-slate-600 border-slate-300 hover:bg-blue-50"
                }`}
              >
                <MapIcon className="w-5 h-5 opacity-80" />
                <div className="text-right">
                  <span className="block opacity-80 text-[10px] font-normal">
                    قطعة رقم
                  </span>
                  <span className="block text-base" dir="ltr">
                    {plot.plotNumber || "بدون رقم"}
                  </span>
                </div>
              </button>
            ))}
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col md:flex-row mt-2">
            <div className="w-full md:w-1/3 bg-slate-800 text-white p-6 flex flex-col justify-center relative overflow-hidden">
              <div className="absolute top-0 left-0 p-4 opacity-10">
                <Compass className="w-32 h-32" />
              </div>
              <h3 className="text-xl font-bold mb-2 relative z-10">
                المخطط الكروكي للقطعة
              </h3>
              <div
                className="bg-blue-500/20 border border-blue-400/30 text-blue-100 px-3 py-1.5 rounded-lg text-sm font-bold mb-6 relative z-10 w-fit"
                dir="ltr"
              >
                قطعة: {currentPlotDetails?.plotNumber || "---"}
              </div>

              <div className="space-y-4 relative z-10">
                <div className="flex justify-between border-b border-slate-700 pb-2">
                  <span className="text-slate-400 text-sm">مساحة القطعة:</span>
                  <strong className="text-emerald-400 text-lg">
                    {currentPlotDetails?.area || 0} م²
                  </strong>
                </div>
                <div className="flex justify-between border-b border-slate-700 pb-2">
                  <span className="text-slate-400 text-sm">إجمالي المحيط:</span>
                  <strong className="text-amber-400 text-lg">
                    {(
                      parseFloat(north.length || 0) +
                      parseFloat(south.length || 0) +
                      parseFloat(east.length || 0) +
                      parseFloat(west.length || 0)
                    ).toFixed(2)}{" "}
                    م
                  </strong>
                </div>
              </div>
            </div>

            <div className="flex-1 bg-[url('https://www.transparenttextures.com/patterns/graphy.png')] bg-blue-50/50 p-8 flex items-center justify-center min-h-[400px]">
              <DynamicCroquis
                north={north}
                south={south}
                east={east}
                west={west}
                plotNumber={currentPlotDetails?.plotNumber}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            {["شمال", "جنوب", "شرق", "غرب"].map((dir) => {
              const bound = getBound(dir, selectedPlotForBounds);
              return (
                <div
                  key={dir}
                  className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col hover:border-blue-300 transition-all"
                >
                  <div className="bg-slate-50 border-b border-slate-200 p-3 flex justify-between items-center">
                    <h4 className="font-black text-slate-800 text-sm flex items-center gap-1.5">
                      <Compass className="w-4 h-4 text-blue-500" /> الحد ال{dir}
                    </h4>
                  </div>
                  <div className="p-4 space-y-3 flex-1">
                    <div>
                      <label className="text-[11px] font-bold text-slate-500 mb-1 block">
                        الطول (متر)
                      </label>
                      <input
                        type="number"
                        className="w-full border border-slate-300 rounded-lg p-2 text-sm font-bold text-blue-700 outline-none focus:border-blue-500"
                        value={bound.length}
                        onChange={(e) =>
                          handleUpdateBoundary(
                            dir,
                            "length",
                            e.target.value,
                            selectedPlotForBounds,
                          )
                        }
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-500 mb-1 block">
                        الوصف / المجاور
                      </label>
                      <textarea
                        className="w-full border border-slate-300 rounded-lg p-2 text-xs text-slate-700 h-16 resize-none outline-none focus:border-blue-500"
                        value={bound.description}
                        onChange={(e) =>
                          handleUpdateBoundary(
                            dir,
                            "description",
                            e.target.value,
                            selectedPlotForBounds,
                          )
                        }
                        placeholder="شارع 15م..."
                      />
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 border-t border-slate-100">
                    {bound.imageUrl ? (
                      <div className="relative h-20 rounded-lg border border-slate-300 overflow-hidden group">
                        <img
                          src={bound.imageUrl}
                          alt={dir}
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() =>
                            handleUpdateBoundary(
                              dir,
                              "imageUrl",
                              null,
                              selectedPlotForBounds,
                            )
                          }
                          className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-5 h-5 hover:text-red-400 transition-colors" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center h-20 border-2 border-dashed border-slate-300 rounded-lg bg-white cursor-pointer hover:bg-blue-50 transition-colors">
                        <Camera className="w-5 h-5 text-slate-400 mb-1" />
                        <span className="text-[10px] text-slate-500 font-bold">
                          إرفاق صورة للمجاور
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) =>
                            handleBoundaryImageUpload(
                              dir,
                              selectedPlotForBounds,
                              e,
                            )
                          }
                        />
                      </label>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
