import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../../../api/axios";
import {
  Loader2,
  Map,
  MapPin,
  Building2,
  Layers,
  Search,
  BarChart3,
  Landmark,
  ChevronRight,
  Edit,
} from "lucide-react";

// استيراد الثوابت
import { DETAIL_TABS } from "./constants";

// استيراد المكونات الفرعية
import Sidebar from "./layout/Sidebar";
import NodeOverview from "./layout/NodeOverview";
import StatsTab from "./tabs/StatsTab";
import PlansTab from "./tabs/PlansTab";
import NodeStatsTab from "./tabs/NodeStatsTab";
import NodeTransactionsTab from "./tabs/NodeTransactionsTab";
import NodePropertiesTab from "./tabs/NodePropertiesTab";
import NodeClientsTab from "./tabs/NodeClientsTab";
import NodeStreetsTab from "./tabs/NodeStreetsTab";
import NodeMediaTab from "./tabs/NodeMediaTab";
import NodeNotesTab from "./tabs/NodeNotesTab";
import NodeRegulationsTab from "./tabs/NodeRegulationsTab";
import NodeAuditTab from "./tabs/NodeAuditTab";

// استيراد المودلز
import SectorModal from "./modals/SectorModal";
import DistrictModal from "./modals/DistrictModal";
import StreetModal from "./modals/StreetModal";


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
      className={`inline-flex min-w-0 items-center justify-center ${
        vertical ? "flex-col gap-0.5" : "gap-1.5"
      } ${className}`}
    >
      {Icon && <Icon className={iconClassName || "h-3.5 w-3.5 shrink-0"} />}
      {text && (
        <span
          className={
            textClassName ||
            "min-w-0 whitespace-nowrap text-[10px] font-black leading-none"
          }
        >
          {text}
        </span>
      )}
    </span>
  );
};


const RiyadhDivisionScreen = () => {
  const { data: treeData = [], isLoading } = useQuery({
    queryKey: ["riyadh-tree"],
    queryFn: async () => (await api.get("/riyadh-streets/tree")).data,
  });

  const [activeMainTab, setActiveMainTab] = useState("division"); // 'division' | 'plans' | 'stats'
  const [activeDetailTab, setActiveDetailTab] = useState("overview");

  // State للتحكم في العنصر المختار
  const [selectedType, setSelectedType] = useState(null); // 'sector' | 'neighborhood'
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedSector, setSelectedSector] = useState(null);

  // Modals State
  const [sectorModal, setSectorModal] = useState({
    isOpen: false,
    mode: "create",
    data: {},
  });
  const [districtModal, setDistrictModal] = useState({
    isOpen: false,
    mode: "create",
    sectorId: null,
    data: {},
  });
  const [streetModal, setStreetModal] = useState({
    isOpen: false,
    mode: "create",
    sectorId: null,
    districtId: null,
    data: {},
  });

  // تعيين القيم الافتراضية عند تحميل البيانات لأول مرة
  useEffect(() => {
    if (treeData.length > 0 && !selectedSector) {
      setSelectedSector(treeData[0]);
      setSelectedNode(treeData[0]);
      setSelectedType("sector");
    }
  }, [treeData, selectedSector]);

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white">
        <Loader2 className="w-10 h-10 animate-spin text-[#0e7490] mb-4" />
        <p className="text-[#94a3b8] font-bold">
          جاري تحميل خريطة تقسيم الرياض...
        </p>
      </div>
    );
  }

  // دالة تصيير التاب النشط
  const renderActiveDetailTab = () => {
    const commonProps = { selectedType, selectedNode, selectedSector };
    switch (activeDetailTab) {
      case "overview":
        return (
          <NodeOverview
            {...commonProps}
            onEditRequest={() =>
              selectedType === "sector"
                ? setSectorModal({
                    isOpen: true,
                    mode: "edit",
                    data: selectedNode,
                  })
                : setDistrictModal({
                    isOpen: true,
                    mode: "edit",
                    sectorId: selectedSector.id,
                    data: selectedNode,
                  })
            }
          />
        );
      case "stats":
        return <NodeStatsTab {...commonProps} />;
      case "transactions":
        return <NodeTransactionsTab {...commonProps} />;
      case "properties":
        return <NodePropertiesTab {...commonProps} />;
      case "clients":
        return <NodeClientsTab {...commonProps} />;
      case "streets":
        return (
          <NodeStreetsTab {...commonProps} setStreetModal={setStreetModal} />
        );
      case "media":
        return <NodeMediaTab {...commonProps} />;
      case "notes":
        return <NodeNotesTab {...commonProps} />;
      case "regulations":
        return <NodeRegulationsTab {...commonProps} />;
      case "audit":
        return <NodeAuditTab {...commonProps} />;
      default:
        return null;
    }
  };

  return (
    <div
      className="flex h-full min-h-0 w-full max-w-full min-w-0 flex-col overflow-hidden overflow-x-hidden bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white font-sans text-right"
      dir="rtl">
      {/* Header responsive */}
      <div
        className="relative z-40 shrink-0 overflow-hidden border-b border-[#e8ddc8] bg-white/95 shadow-[0_6px_14px_rgba(18,63,89,0.04)]"
        style={{
          width: "calc(100% - 21px)",
          maxWidth: "calc(100% - 21px)",
          marginRight: "auto",
          marginLeft: 0,
        }}
      >
        <div className="grid w-full min-w-0 max-w-full grid-cols-1 gap-1.5 px-2 py-1.5 xl:grid-cols-[minmax(300px,360px)_minmax(220px,270px)_minmax(330px,1fr)] xl:items-center">
          <div className="order-1 flex min-w-0 items-center gap-1.5 xl:w-auto">
            <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#123f59] text-[#e2bf74] shadow-[0_6px_14px_rgba(18,63,89,0.04)]">
              <Map className="h-4 w-4 text-white" />
            </div>

            <div className="min-w-0 flex-1">
              <h1 className="truncate text-[13px] font-black leading-tight text-[#123f59]">
                المنظومة الجغرافية والتقسيم البلدي
              </h1>
              <p className="truncate text-[9px] font-bold text-[#94a3b8]">
                إدارة قطاعات وأحياء وشوارع مدينة الرياض
              </p>
            </div>
          </div>

          <div className="order-2 grid min-w-0 max-w-full grid-cols-1 gap-1.5 lg:grid-cols-[minmax(200px,260px)_minmax(300px,1fr)] lg:items-center xl:order-2 xl:contents">
            {activeMainTab === "division" && (
              <div className="min-w-0 xl:col-start-2 xl:row-start-1">
                <div className="relative flex h-8 min-w-0 items-center rounded-xl border border-[#d8b46a]/25 bg-[#fbf8f1] px-2 shadow-[0_6px_14px_rgba(18,63,89,0.04)]">
                  <Search className="ml-2 h-3.5 w-3.5 shrink-0 text-[#94a3b8]" />
                  <input
                    type="text"
                    placeholder="البحث عن حي أو شارع..."
                    className="min-w-0 flex-1 border-none bg-transparent text-[11px] font-bold outline-none"
                  />
                </div>
              </div>
            )}

            <div className="min-w-0 max-w-full overflow-hidden xl:col-start-3 xl:row-start-1">
              <div className="grid w-full min-w-0 grid-cols-3 items-center gap-0.5 rounded-xl border border-[#d8b46a]/25 bg-[#fbf8f1] p-0.5">
                {[
                  { id: "division", label: "التقسيم البلدي", icon: Building2 },
                  { id: "plans", label: "مخططات الرياض", icon: Layers },
                  { id: "stats", label: "إحصائيات شاملة", icon: BarChart3 },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveMainTab(tab.id)}
                    className={`inline-flex h-7 w-full min-w-0 items-center justify-center gap-1 rounded-lg px-1.5 text-[9px] font-black transition-all ${
                      activeMainTab === tab.id
                        ? "bg-white text-[#15536f] shadow-[0_6px_14px_rgba(18,63,89,0.04)]"
                        : "text-[#94a3b8] hover:bg-white/70 hover:text-[#475569]"
                    }`}
                    type="button"
                  >
                    <IconWithText
                      icon={tab.icon}
                      text={tab.label}
                      iconClassName="h-3 w-3"
                      textClassName="min-w-0 truncate whitespace-nowrap text-[9px] font-black leading-none"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. محتوى التابات الرئيسية */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {activeMainTab === "division" ? (
          <div className="grid h-full min-h-0 w-full max-w-full min-w-0 grid-cols-1 gap-2 overflow-hidden p-2 xl:grid-cols-[280px_minmax(0,1fr)]">
            {/* الشجرة الجانبية */}
            <div className="min-h-[230px] min-w-0 max-w-full overflow-hidden xl:h-full xl:min-h-0">
              <Sidebar
                treeData={treeData}
                selectedType={selectedType}
                selectedNode={selectedNode}
                onSelectSector={(s) => {
                  setSelectedSector(s);
                  setSelectedNode(s);
                  setSelectedType("sector");
                  setActiveDetailTab("overview");
                }}
                onSelectNeighborhood={(s, n) => {
                  setSelectedSector(s);
                  setSelectedNode(n);
                  setSelectedType("neighborhood");
                  setActiveDetailTab("overview");
                }}
                onAddSector={() =>
                  setSectorModal({ isOpen: true, mode: "create", data: {} })
                }
                onAddDistrict={(sid) =>
                  setDistrictModal({
                    isOpen: true,
                    mode: "create",
                    sectorId: sid,
                    data: {},
                  })
                }
                onAddStreet={(sid, nid) =>
                  setStreetModal({
                    isOpen: true,
                    mode: "create",
                    sectorId: sid,
                    districtId: nid,
                    data: { lanes: "2", lighting: true, sidewalks: true },
                  })
                }
              />
            </div>

            {/* لوحة التفاصيل */}
            <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-[18px] border border-[#e8ddc8]/80 bg-white/95 shadow-[0_6px_14px_rgba(18,63,89,0.04)]">
              {selectedNode ? (
                <>
                  {/* شريط التابات الفرعية (الـ 10 تابات) */}
                  <div className="shrink-0 border-b border-[#e8ddc8] bg-white px-2 pt-1">
                    <div className="flex flex-wrap items-center gap-1 overflow-hidden pb-1">
                      {DETAIL_TABS.map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setActiveDetailTab(tab.id)}
                          className={`inline-flex h-7 shrink-0 items-center justify-center gap-1 rounded-lg border px-1.5 text-[9px] font-black transition-all whitespace-nowrap ${activeDetailTab === tab.id ? "border-[#d8b46a]/35 bg-[#eef7f6] text-[#15536f]" : "border-transparent text-[#94a3b8] hover:border-[#d8b46a]/25 hover:bg-[#fbf8f1] hover:text-[#123f59]"}`}
                        >
                          <IconWithText
                            icon={tab.icon}
                            text={tab.label}
                            iconClassName={`h-3.5 w-3.5 ${activeDetailTab === tab.id ? "text-[#0e7490]" : "text-[#94a3b8]"}`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="relative z-10 px-2 py-1">
                    <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex max-w-full items-center gap-1.5 overflow-x-auto custom-scrollbar-slim text-[10px] font-bold text-[#94a3b8] bg-white px-2.5 py-1.5 rounded-lg border border-[#e8ddc8] shadow-[0_6px_14px_rgba(18,63,89,0.04)] w-fit">
                        <Landmark className="w-3 h-3 text-[#94a3b8]" /> أمانة
                        الرياض
                        <ChevronRight className="w-3 h-3 text-[#cbd5e1] scale-x-[-1]" />
                        <span className="text-[#475569]">
                          قطاع {selectedSector.name}
                        </span>
                        {selectedType === "neighborhood" && (
                          <>
                            <ChevronRight className="w-3 h-3 text-[#cbd5e1] scale-x-[-1]" />

                            <span className="text-[#0e7490]">
                              {selectedNode.name}
                            </span>
                          </>
                        )}
                      </div>

                      
                    </div>
                  </div>

                  {/* منطقة عرض محتوى التاب المختار */}
                  <div className="min-h-0 min-w-0 max-w-full flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar-slim bg-[#fbf8f1]/45 p-2">
                    {renderActiveDetailTab()}
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-[#94a3b8] gap-3 bg-[#fbf8f1]">
                  <Layers className="w-16 h-16 opacity-10" />
                  <p className="font-extrabold text-[14px]">
                    حدد قطاعاً أو حياً لاستعراض البيانات
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : activeMainTab === "plans" ? (
          <div className="flex-1 h-full overflow-hidden flex flex-col">
            <PlansTab />
          </div>
        ) : (
          <div className="min-h-0 min-w-0 flex-1 overflow-hidden p-2">
            <StatsTab />
          </div>
        )}
      </div>

      {/* 4. النوافذ المنبثقة (Modals) */}
      <SectorModal
        isOpen={sectorModal.isOpen}
        onClose={() => setSectorModal({ ...sectorModal, isOpen: false })}
        modalData={sectorModal}
        setModalData={setSectorModal}
      />

      <DistrictModal
        isOpen={districtModal.isOpen}
        onClose={() => setDistrictModal({ ...districtModal, isOpen: false })}
        sectorId={districtModal.sectorId}
        modalData={districtModal}
        setModalData={setDistrictModal}
      />

      <StreetModal
        isOpen={streetModal.isOpen}
        onClose={() => setStreetModal({ ...streetModal, isOpen: false })}
        sectorId={streetModal.sectorId}
        districtId={streetModal.districtId}
        modalData={streetModal}
        setModalData={setStreetModal}
      />
    </div>
  );
};

export default RiyadhDivisionScreen;
