import React, { useState } from "react";
import {
  Layers,
  Plus,
  ChevronDown,
  Route,
  MapPin,
  Building2,
  Hash,
  FolderTree,
} from "lucide-react";

const IconWithText = ({
  icon: Icon,
  text,
  className = "",
  iconClassName = "",
  textClassName = "",
  vertical = false,
}) => {
  return (
    <span
      className={`
        inline-flex items-center justify-center
        ${vertical ? "flex-col gap-0.5" : "gap-1.5"}
        ${className}
      `}
    >
      {Icon && <Icon className={iconClassName || "h-3.5 w-3.5 shrink-0"} />}

      {text && (
        <span className={textClassName || "text-[10px] font-black leading-none"}>
          {text}
        </span>
      )}
    </span>
  );
};

const Sidebar = ({
  treeData = [],
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

  const toggleSector = (event, id) => {
    event.stopPropagation();

    setExpandedSectors((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const toggleNeighborhood = (event, id) => {
    event.stopPropagation();

    setExpandedNeighborhoods((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const isSameId = (a, b) => String(a || "") === String(b || "");

  return (
    <aside
      className="
        flex h-full min-h-0 flex-1 flex-col overflow-hidden
        rounded-[18px] border border-[#d8b46a]/25
        bg-white/90 shadow-[0_8px_22px_rgba(18,63,89,0.06)]
        backdrop-blur-xl
      "
      dir="rtl"
    >
      {/* Header */}
      <div
        className="
          shrink-0 border-b border-[#e8ddc8]
          bg-gradient-to-l from-[#06111d] via-[#123f59] to-[#0e7490]
          px-3 py-3 text-white
        "
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <span
              className="
                grid h-10 w-10 shrink-0 place-items-center
                rounded-2xl border border-[#e2bf74]/35
                bg-white/10 text-[#e2bf74]
              "
            >
              <IconWithText
                icon={Layers}
                text="هيكل"
                vertical
                iconClassName="h-4.5 w-4.5"
                textClassName="text-[6px] font-black leading-none"
              />
            </span>

            <div className="min-w-0">
              <h3 className="truncate text-sm font-black">
                الهيكل الجغرافي
              </h3>

              <p className="mt-0.5 truncate text-[10px] font-bold text-white/60">
                القطاعات، الأحياء، والشوارع.
              </p>
            </div>
          </div>

          <button
            onClick={onAddSector}
            className="
              inline-flex h-9 shrink-0 items-center justify-center gap-1.5
              rounded-xl border border-[#e2bf74]/40
              bg-[#e2bf74] px-3
              text-[10px] font-black text-[#082032]
              shadow-[0_8px_18px_rgba(226,191,116,0.18)]
              transition hover:-translate-y-[1px] hover:bg-[#f5d99b]
            "
            type="button"
          >
            <IconWithText icon={Plus} text="قطاع" iconClassName="h-3.5 w-3.5" /></button>
        </div>
      </div>

      {/* Body */}
      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-2 custom-scrollbar-slim">
        {treeData.length === 0 ? (
          <div
            className="
              flex min-h-[180px] flex-col items-center justify-center
              rounded-[20px] border border-dashed border-[#d8b46a]/35
              bg-[#fbf8f1]/70 p-4 text-center
            "
          >
            <FolderTree className="mb-2 h-8 w-8 text-[#c5983c]/70" />

            <p className="text-xs font-black text-[#123f59]">
              لا توجد بيانات جغرافية
            </p>

            <p className="mt-1 text-[10px] font-bold text-[#94a3b8]">
              ابدأ بإضافة قطاع جديد.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {treeData.map((sector) => {
              const isSectorExpanded = expandedSectors.includes(sector.id);
              const isSelectedSector =
                selectedType === "sector" && isSameId(selectedNode?.id, sector.id);

              return (
                <div key={sector.id} className="relative">
                  {/* Sector item */}
                  <button
                    onClick={() => onSelectSector(sector)}
                    className={`
                      group relative flex w-full items-start gap-2 overflow-hidden
                      rounded-[18px] border p-2 text-right
                      transition-all duration-200
                      ${
                        isSelectedSector
                          ? "border-[#e2bf74]/55 bg-gradient-to-l from-[#0e7490] via-[#123f59] to-[#06111d] text-white shadow-[0_10px_24px_rgba(18,63,89,0.18)]"
                          : "border-[#e8ddc8] bg-white text-[#123f59] hover:border-[#d8b46a]/55 hover:bg-[#fbf8f1]"
                      }
                    `}
                    type="button"
                  >
                    {isSelectedSector && (
                      <span className="absolute right-0 top-1/2 h-8 w-1.5 -translate-y-1/2 rounded-l-full bg-[#e2bf74]" />
                    )}

                    <span
                      onClick={(event) => toggleSector(event, sector.id)}
                      className={`
                        grid h-8 w-8 shrink-0 place-items-center rounded-xl border
                        transition-all
                        ${
                          isSelectedSector
                            ? "border-white/15 bg-white/10 text-[#e2bf74]"
                            : "border-[#e8ddc8] bg-[#fbf8f1] text-[#c5983c] hover:bg-[#f8efe0]"
                        }
                      `}
                      title={isSectorExpanded ? "إغلاق" : "فتح"}
                    >
                      <ChevronDown
                        className={`
                          h-4 w-4 transition-transform duration-200
                          ${isSectorExpanded ? "" : "-rotate-90"}
                        `}
                      />
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div
                            className={`
                              flex min-w-0 items-center gap-1.5
                              text-[12px] font-black leading-5
                              ${isSelectedSector ? "text-white" : "text-[#123f59]"}
                            `}
                            title={`قطاع ${sector.name}`}
                          >
                            <Building2
                              className={`
                                h-3.5 w-3.5 shrink-0
                                ${isSelectedSector ? "text-[#e2bf74]" : "text-[#c5983c]"}
                              `}
                            />

                            <span className="break-words">
                              قطاع {sector.name}
                            </span>
                          </div>

                          <div
                            className={`
                              mt-1 flex flex-wrap items-center gap-1.5
                              text-[9px] font-black
                              ${isSelectedSector ? "text-white/60" : "text-[#94a3b8]"}
                            `}
                          >
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {sector.neighborhoods?.length || 0} حي
                            </span>
                          </div>
                        </div>

                        <span
                          className={`
                            shrink-0 rounded-lg border px-1.5 py-0.5
                            font-mono text-[8px] font-black
                            ${
                              isSelectedSector
                                ? "border-white/15 bg-white/10 text-[#e2bf74]"
                                : "border-[#e8ddc8] bg-[#fbf8f1] text-[#64748b]"
                            }
                          `}
                        >
                          {sector.code || "—"}
                        </span>
                      </div>

                      {isSelectedSector && (
                        <div className="mt-2 border-t border-white/15 pt-2">
                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              onAddDistrict(sector.id);
                            }}
                            className="
                              inline-flex h-8 w-full items-center justify-center gap-1.5
                              rounded-xl border border-emerald-200/30
                              bg-white/10 text-[10px] font-black
                              text-emerald-100 transition hover:bg-white/15
                            "
                            type="button"
                          >
                            <IconWithText icon={Plus} text="تسجيل حي" iconClassName="h-3.5 w-3.5" /></button>
                        </div>
                      )}
                    </div>
                  </button>

                  {/* Neighborhoods */}
                  {isSectorExpanded && (
                    <div className="mt-2 space-y-1.5 border-r-2 border-[#d8b46a]/25 pr-3">
                      {sector.neighborhoods?.length > 0 ? (
                        sector.neighborhoods.map((neighborhood) => {
                          const isNeighborhoodExpanded =
                            expandedNeighborhoods.includes(neighborhood.id);

                          const isSelectedNeighborhood =
                            selectedType === "neighborhood" &&
                            isSameId(selectedNode?.id, neighborhood.id);

                          return (
                            <div key={neighborhood.id}>
                              <button
                                onClick={() =>
                                  onSelectNeighborhood(sector, neighborhood)
                                }
                                className={`
                                  group relative flex w-full items-start gap-2 overflow-hidden
                                  rounded-[16px] border p-2 text-right
                                  transition-all duration-200
                                  ${
                                    isSelectedNeighborhood
                                      ? "border-[#123f59] bg-[#fbf8f1] shadow-[0_8px_18px_rgba(18,63,89,0.12)] ring-1 ring-[#123f59]/15"
                                      : "border-[#e8ddc8] bg-white hover:border-[#d8b46a]/50 hover:bg-[#fbf8f1]/70"
                                  }
                                `}
                                type="button"
                              >
                                <span
                                  onClick={(event) =>
                                    toggleNeighborhood(event, neighborhood.id)
                                  }
                                  className={`
                                    grid h-7 w-7 shrink-0 place-items-center rounded-xl
                                    transition-all
                                    ${
                                      neighborhood.streets?.length > 0
                                        ? "border border-[#e8ddc8] bg-[#fbf8f1] text-[#c5983c]"
                                        : "text-[#cbd5e1]"
                                    }
                                  `}
                                >
                                  {neighborhood.streets?.length > 0 ? (
                                    <ChevronDown
                                      className={`
                                        h-3.5 w-3.5 transition-transform duration-200
                                        ${isNeighborhoodExpanded ? "" : "-rotate-90"}
                                      `}
                                    />
                                  ) : (
                                    <MapPin className="h-3.5 w-3.5" />
                                  )}
                                </span>

                                <div className="min-w-0 flex-1">
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                      <div
                                        className="
                                          flex min-w-0 items-center gap-1.5
                                          text-[11px] font-black leading-5
                                          text-[#123f59]
                                        "
                                        title={neighborhood.name}
                                      >
                                        <MapPin className="h-3.5 w-3.5 shrink-0 text-[#c5983c]" />
                                        <span className="break-words">
                                          {neighborhood.name}
                                        </span>
                                      </div>

                                      <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[8.5px] font-black text-[#94a3b8]">
                                        <span className="inline-flex items-center gap-1">
                                          <Route className="h-3 w-3" />
                                          {neighborhood.streets?.length || 0} شارع
                                        </span>
                                      </div>
                                    </div>

                                    <span
                                      className="
                                        shrink-0 rounded-lg border border-[#e8ddc8]
                                        bg-[#fbf8f1] px-1.5 py-0.5
                                        font-mono text-[8px] font-black text-[#64748b]
                                      "
                                    >
                                      {neighborhood.code || "—"}
                                    </span>
                                  </div>

                                  {isSelectedNeighborhood && (
                                    <button
                                      onClick={(event) => {
                                        event.stopPropagation();
                                        onAddStreet(sector.id, neighborhood.id);
                                      }}
                                      className="
                                        mt-2 inline-flex h-8 w-full items-center justify-center gap-1.5
                                        rounded-xl bg-gradient-to-l from-[#123f59] via-[#15536f] to-[#0e7490]
                                        text-[10px] font-black text-white
                                        shadow-[0_8px_18px_rgba(18,63,89,0.16)]
                                        transition hover:-translate-y-[1px]
                                      "
                                      type="button"
                                    >
                                      <IconWithText icon={Plus} text="إضافة شارع" iconClassName="h-3.5 w-3.5 text-[#e2bf74]" />            </button>
                                  )}
                                </div>
                              </button>

                              {/* Streets */}
                              {isNeighborhoodExpanded &&
                                neighborhood.streets?.length > 0 && (
                                  <div className="mt-1.5 space-y-1 border-r-2 border-orange-200/60 pr-4">
                                    {neighborhood.streets.map((street) => (
                                      <div
                                        key={street.id}
                                        className="
                                          flex items-center justify-between gap-2
                                          rounded-xl border border-[#e8ddc8]
                                          bg-[#fbf8f1]/80 px-2.5 py-2
                                          text-[10px] font-black text-[#123f59]
                                        "
                                      >
                                        <div className="flex min-w-0 items-center gap-1.5">
                                          <Route className="h-3.5 w-3.5 shrink-0 text-orange-500" />

                                          <span
                                            className="truncate"
                                            title={street.name}
                                          >
                                            {street.name}
                                          </span>
                                        </div>

                                        <span
                                          className="
                                            shrink-0 rounded-lg border border-orange-200
                                            bg-white px-1.5 py-0.5
                                            text-[8px] font-black text-orange-700
                                          "
                                        >
                                          {street.width}م
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                            </div>
                          );
                        })
                      ) : (
                        <div
                          className="
                            rounded-xl border border-dashed border-[#d8b46a]/35
                            bg-[#fbf8f1]/70 px-3 py-4 text-center
                            text-[10px] font-black text-[#94a3b8]
                          "
                        >
                          لا توجد أحياء داخل هذا القطاع
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;