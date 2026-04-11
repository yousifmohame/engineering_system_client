import React, { useState } from "react";
import { Layers, Plus, ChevronDown, Route, MapPin } from "lucide-react";

const Sidebar = ({
  treeData,
  selectedType,
  selectedNode,
  onSelectSector,
  onSelectNeighborhood,
  onAddSector,
  onAddDistrict,
  onAddStreet,
}) => {
  const [expandedSectors, setExpandedSectors] = useState([]);
  const [expandedNeighborhoods, setExpandedNeighborhoods] = useState([]);

  const toggleSector = (e, id) => {
    e.stopPropagation();
    setExpandedSectors((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const toggleNeighborhood = (e, id) => {
    e.stopPropagation();
    setExpandedNeighborhoods((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  return (
    <div className="bg-white flex flex-col overflow-hidden h-full flex-1 border border-stone-200/80 rounded-2xl shadow-sm">
      <div className="flex items-center justify-between p-2 border-b border-stone-100 bg-stone-50/50 shrink-0">
        <span className="text-[12px] text-stone-800 font-extrabold flex items-center gap-1">
          <Layers className="w-4 h-4 text-blue-600" /> الهيكل الجغرافي
        </span>
        <button
          onClick={onAddSector}
          className="flex items-center gap-1 px-3 py-1.5 bg-stone-900 text-white rounded-lg text-[10px] font-bold hover:bg-stone-800 shadow-sm"
        >
          <Plus className="w-3 h-3" /> قطاع
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-1 custom-scrollbar" dir="rtl">
        <div className="space-y-2">
          {treeData.map((sector) => (
            <div key={sector.id} className="relative">
              <div
                className={`flex items-start gap-2 p-2 rounded-xl border transition-all cursor-pointer ${selectedType === "sector" && selectedNode?.id === sector.id ? "bg-blue-50 border-blue-200 shadow-sm" : "bg-white border-stone-100 hover:border-stone-300"}`}
                onClick={() => onSelectSector(sector)}
              >
                <button
                  onClick={(e) => toggleSector(e, sector.id)}
                  className="w-6 h-6 flex items-center justify-center rounded-lg bg-stone-100 text-stone-500 mt-1"
                >
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform ${expandedSectors.includes(sector.id) ? "" : "-rotate-90"}`}
                  />
                </button>
                <div className="flex-1 pt-0.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[12px] font-black text-stone-800">
                      قطاع {sector.name}
                    </span>
                    <span className="text-[9px] font-mono text-stone-400">
                      {sector.code}
                    </span>
                  </div>
                  {selectedType === "sector" &&
                    selectedNode?.id === sector.id && (
                      <div className="mt-0 pt-1 border-t border-blue-200/50 flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddDistrict(sector.id);
                          }}
                          className="flex-1 py-1.5 bg-white border border-emerald-200 text-emerald-700 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1"
                        >
                          <Plus className="w-3 h-3" /> تسجيل حي
                        </button>
                      </div>
                    )}
                </div>
              </div>

              {expandedSectors.includes(sector.id) && (
                <div className="mt-2 mr-3 pr-4 border-r-2 border-stone-100 space-y-1">
                  {sector.neighborhoods?.map((nbh) => (
                    <div key={nbh.id}>
                      <div
                        className={`flex items-start gap-2 p-2 rounded-xl border transition-all cursor-pointer ${selectedType === "neighborhood" && selectedNode?.id === nbh.id ? "bg-white border-stone-800 shadow-md ring-1 ring-stone-800" : "bg-white border-stone-100"}`}
                        onClick={() => onSelectNeighborhood(sector, nbh)}
                      >
                        <button
                          onClick={(e) => toggleNeighborhood(e, nbh.id)}
                          className="w-5 h-5 flex items-center justify-center text-stone-400 mt-0.5"
                        >
                          {nbh.streets?.length > 0 && (
                            <ChevronDown
                              className={`w-3.5 h-3.5 ${expandedNeighborhoods.includes(nbh.id) ? "" : "-rotate-90"}`}
                            />
                          )}
                        </button>
                        <div className="flex-1 pt-0.5">
                          <div className="flex justify-between items-center">
                            <span className="text-[12px] font-bold">
                              {nbh.name}
                            </span>
                            <span className="text-[9px] font-mono text-stone-400">
                              {nbh.code}
                            </span>
                          </div>
                          {selectedType === "neighborhood" &&
                            selectedNode?.id === nbh.id && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onAddStreet(sector.id, nbh.id);
                                }}
                                className="w-full mt-2 py-1.5 bg-stone-900 text-white rounded-lg text-[10px] font-bold flex items-center justify-center gap-1"
                              >
                                <Plus className="w-3 h-3" /> إضافة شارع
                              </button>
                            )}
                        </div>
                      </div>
                      {expandedNeighborhoods.includes(nbh.id) &&
                        nbh.streets?.map((st) => (
                          <div
                            key={st.id}
                            className="mr-6 pr-3 border-r-2 border-orange-100/50 py-1.5 flex justify-between items-center text-[11px] text-stone-700 bg-stone-50/50 rounded-lg mb-1 mt-1"
                          >
                            <div className="flex items-center gap-1.5">
                              <Route className="w-3 h-3 text-orange-400" />{" "}
                              {st.name}
                            </div>
                            <span className="px-1.5 bg-white text-stone-500 text-[8px] font-bold rounded border border-stone-200">
                              {st.width}م
                            </span>
                          </div>
                        ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
