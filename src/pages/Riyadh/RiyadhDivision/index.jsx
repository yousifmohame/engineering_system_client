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
      <div className="h-full flex flex-col items-center justify-center bg-[#F6F7F9]">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
        <p className="text-stone-500 font-bold">
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
      className="h-full flex flex-col overflow-hidden bg-[#F6F7F9] font-sans text-right"
      dir="rtl"
    >
      {/* 1. Header الرئيسي (الجزء الذي كان ناقصاً) */}
      <div className="shrink-0 bg-white border-b border-black/5 z-40">
        <div className="flex items-center justify-between px-4 py-1">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-sm">
              <Map className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-[14px] font-black text-stone-900 leading-tight">
                المنظومة الجغرافية والتقسيم البلدي
              </h1>
              <p className="text-[10px] text-stone-500 font-medium">
                إدارة قطاعات وأحياء وشوارع مدينة الرياض
              </p>
            </div>
          </div>

          {/* 2. منطقة البحث (الجزء الذي كان ناقصاً) */}
          {activeMainTab === "division" && (
            <div className="shrink-0 flex items-center gap-3 px-3 py-2 border-b border-black/5 bg-white/50">
              <div className="flex-1 max-w-[340px]">
                <div className="relative flex items-center bg-white border border-stone-200 rounded-xl px-3 py-2 shadow-sm">
                  <Search className="w-4 h-4 text-stone-400 ml-2" />
                  <input
                    type="text"
                    placeholder="البحث عن حي أو شارع..."
                    className="bg-transparent border-none outline-none text-[12px] flex-1"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Main Tabs Switcher */}
          <div className="flex items-center bg-stone-100/60 rounded-lg p-0.5 gap-0.5">
            {[
              { id: "division", label: "التقسيم البلدي", icon: Building2 },
              { id: "plans", label: "مخططات الرياض", icon: Layers },
              { id: "stats", label: "إحصائيات شاملة", icon: BarChart3 },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveMainTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] rounded-md transition-all font-bold ${activeMainTab === tab.id ? "bg-white text-blue-700 shadow-sm" : "text-stone-500 hover:text-stone-700"}`}
              >
                <tab.icon className="w-3.5 h-3.5" /> {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. محتوى التابات الرئيسية */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {activeMainTab === "division" ? (
          <div className="flex h-full p-1 gap-3 overflow-hidden">
            {/* الشجرة الجانبية */}
            <div className="w-[320px] shrink-0 h-full">
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
            <div className="flex-1 bg-white rounded-2xl shadow-sm border border-stone-200/80 flex flex-col overflow-hidden">
              {selectedNode ? (
                <>
                  {/* شريط التابات الفرعية (الـ 10 تابات) */}
                  <div className="shrink-0 border-b border-stone-200 px-4 pt-2 bg-white">
                    <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar-slim pb-1">
                      {DETAIL_TABS.map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setActiveDetailTab(tab.id)}
                          className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg border-b-2 transition-all whitespace-nowrap text-[12px] font-bold ${activeDetailTab === tab.id ? "border-blue-600 text-blue-700 bg-blue-50/50" : "border-transparent text-stone-500 hover:text-stone-800 hover:bg-stone-50"}`}
                        >
                          <tab.icon
                            className={`w-4 h-4 ${activeDetailTab === tab.id ? "text-blue-600" : "text-stone-400"}`}
                          />{" "}
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="relative z-10 px-6 py-1">
                    <div className="flex items-center justify-between mb-0">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-stone-500 bg-white px-3 py-1.5 rounded-lg border border-stone-200 shadow-sm w-fit">
                        <Landmark className="w-3 h-3 text-stone-400" /> أمانة
                        الرياض
                        <ChevronRight className="w-3 h-3 text-stone-300 scale-x-[-1]" />
                        <span className="text-stone-700">
                          قطاع {selectedSector.name}
                        </span>
                        {selectedType === "neighborhood" && (
                          <>
                            <ChevronRight className="w-3 h-3 text-stone-300 scale-x-[-1]" />

                            <span className="text-blue-600">
                              {selectedNode.name}
                            </span>
                          </>
                        )}
                      </div>

                      <button
                        onClick={() => {
                          if (selectedType === "sector")
                            setSectorModal({
                              isOpen: true,

                              mode: "edit",

                              data: {
                                id: selectedNode.id,

                                name: selectedNode.name,

                                code: selectedNode.code,

                                officialLink: selectedNode.officialLink || "",

                                mapImage: selectedNode.mapImage || "",

                                satelliteImage:
                                  selectedNode.satelliteImage || "",
                              },
                            });
                          else
                            setDistrictModal({
                              isOpen: true,

                              mode: "edit",

                              sectorId: selectedSector.id,

                              data: {
                                id: selectedNode.id,

                                name: selectedNode.name,

                                code: selectedNode.code,

                                officialLink: selectedNode.officialLink || "",

                                mapImage: selectedNode.mapImage || "",

                                satelliteImage:
                                  selectedNode.satelliteImage || "",
                              },
                            });
                        }}
                        className="flex items-center gap-1.5 px-4 py-2 bg-blue-50 text-blue-700 text-[11px] font-bold rounded-xl hover:bg-blue-100 transition-colors border border-blue-100"
                      >
                        <Edit className="w-3.5 h-3.5" /> تحديث البيانات
                      </button>
                    </div>
                  </div>

                  {/* منطقة عرض محتوى التاب المختار */}
                  <div className="flex-1 overflow-y-auto bg-[#FAFAFA] px-3">
                    {renderActiveDetailTab()}
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-stone-400 gap-3 bg-stone-50">
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
          <div className="flex-1 h-full overflow-y-auto">
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
