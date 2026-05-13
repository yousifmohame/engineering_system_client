import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../../api/axios";
import { toast } from "sonner";
import {
  Layers,
  Plus,
  Edit,
  X,
  Loader2,
  Info,
  PieChart,
  FolderOpen,
  FileEdit,
  Trash2,
  ShieldAlert,
  Grid3X3,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { useAuth } from "../../../../context/AuthContext";

// استيراد المكونات المنفصلة
import PlotsDetailsTab from "./plan_components/PlotsDetailsTab";
import StatsTab from "./plan_components/StatsTab";
import GeneralInfoTab from "./plan_components/GeneralInfoTab";
import FilesTab from "./plan_components/FilesTab";
import SpecialRegTab from "./plan_components/SpecialRegTab";
import NotesTab from "./plan_components/NotesTab";
import ReferenceDetailsModal from "../../../Archives_and_records/ProjectsArchive/ReferenceDetails/ReferenceDetailsModal";
import ClientFileDetails from "../../../Clients/ClientFileDetails";

const MODAL_TABS = [
  { id: "general", label: "معلومات عامة", icon: Info },
  { id: "stats", label: "الإحصائيات", icon: PieChart },
  { id: "plots_details", label: "تفاصيل القطع", icon: Grid3X3 },
  { id: "files", label: "ملفات المخطط", icon: FolderOpen },
  { id: "special_reg", label: "تنظيمات خاصة", icon: ShieldAlert },
  { id: "notes", label: "ملاحظات عامة", icon: FileEdit },
];

const PlansTab = () => {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();

  // States
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "planNumber",
    direction: "asc",
  });

  const [archiveModal, setArchiveModal] = useState({
    isOpen: false,
    projectId: null,
  });
  const [clientModal, setClientModal] = useState({
    isOpen: false,
    clientId: null,
  });

  const [previewFile, setPreviewFile] = useState(null);

  // حالة المودال الرئيسي
  const [planModal, setPlanModal] = useState({
    isOpen: false,
    mode: "create",
    activeTab: "general",
    data: {
      id: null,
      planNumber: "",
      oldNumber: "",
      hijriYear: "",
      areaKm: "",
      areaM: "",
      mainUsages: "",
      subUsages: "",
      totalPlots: 0,
      neighborhoods: "",
      officialMapUrl: "",
      googleMapUrl: "",
      officialMapImage: null,
      googleMapImage: null,
      streets: [],
      files: [],
      specialRegulations: [],
      notes: "",
      status: "معتمد",
    },
  });

  // جلب البيانات
  const { data: plansData = [], isLoading } = useQuery({
    queryKey: ["riyadh-plans"],
    queryFn: async () => (await api.get("/riyadh-streets/plans")).data,
  });

  // الميوتيشنز
  const planMutation = useMutation({
    mutationFn: async (payload) =>
      planModal.mode === "create"
        ? await api.post("/riyadh-streets/plans", payload)
        : await api.put(`/riyadh-streets/plans/${payload.id}`, payload),
    onSuccess: () => {
      toast.success("تم حفظ بيانات المخطط بنجاح");
      queryClient.invalidateQueries(["riyadh-plans"]);
      setPlanModal((prev) => ({ ...prev, isOpen: false }));
    },
    onError: () => toast.error("حدث خطأ أثناء الحفظ"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => await api.delete(`/riyadh-streets/plans/${id}`),
    onSuccess: () => {
      toast.success("تم حذف المخطط");
      queryClient.invalidateQueries(["riyadh-plans"]);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    planMutation.mutate(planModal.data);
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    if (window.confirm("هل أنت متأكد من الحذف النهائي لهذا المخطط؟")) {
      deleteMutation.mutate(id);
    }
  };

  // ==========================================
  // 🚀 منطق البحث (Search) والترتيب (Sort)
  // ==========================================
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key)
      return <ArrowUpDown className="w-3.5 h-3.5 text-slate-300" />;
    return sortConfig.direction === "asc" ? (
      <ArrowUp className="w-3.5 h-3.5 text-indigo-600" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-indigo-600" />
    );
  };

  const filteredAndSortedPlans = useMemo(() => {
    // 1. البحث
    let processed = plansData.filter((plan) => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      const matchPlan = plan.planNumber?.toLowerCase().includes(term);
      // البحث داخل أرقام القطع المرتبطة (يتطلب التعديل في الباك إند المذكور أعلاه)
      const matchPlot = plan.RiyadhPlanPlot?.some((plot) =>
        plot.plotNumber?.toLowerCase().includes(term),
      );
      return matchPlan || matchPlot;
    });

    // 2. الترتيب
    processed.sort((a, b) => {
      if (!sortConfig.key) return 0;

      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];

      // معالجة الحالات الخاصة للأرقام والـ Counts
      if (sortConfig.key === "plotCount") {
        aVal = a._count?.RiyadhPlanPlot || a._count?.projectPlots || 0;
        bVal = b._count?.RiyadhPlanPlot || b._count?.projectPlots || 0;
      }
      if (sortConfig.key === "areaM") {
        aVal = Number(a.areaM) || 0;
        bVal = Number(b.areaM) || 0;
      }

      // الترتيب
      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

    return processed;
  }, [plansData, searchTerm, sortConfig]);

  if (isLoading)
    return (
      <div className="flex justify-center p-10 h-full items-center">
        <Loader2 className="animate-spin text-indigo-600 w-10 h-10" />
      </div>
    );

  return (
    <div
      className="flex-1 overflow-hidden m-2 rounded-xl bg-slate-50 border border-slate-200 shadow-sm flex flex-col"
      dir="rtl"
    >
      {/* ----------------- Header ----------------- */}
      <div className="p-4 border-b border-slate-200 bg-white shrink-0 flex flex-wrap gap-4 items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center shadow-inner">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base text-slate-800 font-black">
              مخططات الرياض المعتمدة
            </h2>
            <p className="text-[11px] text-slate-500 font-bold mt-0.5">
              إدارة المخططات، والبحث فيها أو في قطعها
            </p>
          </div>
        </div>

        {/* 🔍 شريط البحث */}
        <div className="relative w-full md:w-72">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="ابحث برقم المخطط أو رقم القطعة..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-100 border border-transparent focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-50 rounded-xl pr-9 pl-4 py-2.5 text-xs font-bold outline-none transition-all"
          />
        </div>

        <button
          onClick={() =>
            setPlanModal({
              isOpen: true,
              mode: "create",
              activeTab: "general",
              data: {
                id: null,
                planNumber: "",
                oldNumber: "",
                hijriYear: "",
                areaKm: "",
                areaM: "",
                mainUsages: "",
                subUsages: "",
                totalPlots: 0,
                neighborhoods: "",
                officialMapUrl: "",
                googleMapUrl: "",
                officialMapImage: null,
                googleMapImage: null,
                streets: [],
                files: [],
                specialRegulations: [],
                notes: "",
                status: "معتمد",
              },
            })
          }
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-black hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" /> تسجيل مخطط جديد
        </button>
      </div>

      {/* ----------------- Main Table ----------------- */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <div className="border border-slate-200 bg-white rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-sm text-right whitespace-nowrap">
            <thead className="bg-slate-800 text-white font-bold text-xs">
              <tr>
                <th
                  className="py-4 px-5 cursor-pointer hover:bg-slate-700 transition-colors"
                  onClick={() => handleSort("planNumber")}
                >
                  <div className="flex items-center gap-2">
                    رقم المخطط {getSortIcon("planNumber")}
                  </div>
                </th>
                <th
                  className="py-4 px-5 cursor-pointer hover:bg-slate-700 transition-colors"
                  onClick={() => handleSort("hijriYear")}
                >
                  <div className="flex items-center gap-2">
                    سنة الاعتماد {getSortIcon("hijriYear")}
                  </div>
                </th>
                <th
                  className="py-4 px-5 cursor-pointer hover:bg-slate-700 transition-colors"
                  onClick={() => handleSort("areaM")}
                >
                  <div className="flex items-center gap-2">
                    المساحة ($م^2$) {getSortIcon("areaM")}
                  </div>
                </th>
                <th
                  className="py-4 px-5 cursor-pointer hover:bg-slate-700 transition-colors text-center"
                  onClick={() => handleSort("plotCount")}
                >
                  <div className="flex items-center justify-center gap-2">
                    عدد القطع المسجلة بالداتابيز {getSortIcon("plotCount")}
                  </div>
                </th>
                {/* 🚀 تم فصل الإجراءات لعمودين حسب الصورة */}
                <th className="py-4 px-5 text-center w-20 border-r border-slate-700">
                  تعديل
                </th>
                <th className="py-4 px-5 text-center w-20 border-r border-slate-700 text-rose-300">
                  حذف
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAndSortedPlans.map((plan) => {
                // استخراج عدد القطع الحقيقي المسجل في الداتابيز
                const dbPlotCount =
                  plan._count?.RiyadhPlanPlot || plan._count?.projectPlots || 0;

                return (
                  <tr
                    key={plan.id}
                    onClick={() =>
                      setPlanModal({
                        isOpen: true,
                        mode: "edit",
                        activeTab: "general",
                        data: plan,
                      })
                    }
                    className="hover:bg-indigo-50/50 hover:cursor-pointer transition-colors group"
                  >
                    <td className="py-3 px-5 font-black text-indigo-700">
                      {plan.planNumber}
                    </td>
                    <td className="py-3 px-5 text-slate-600 font-bold">
                      {plan.hijriYear || "---"}
                    </td>
                    <td className="py-3 px-5 font-mono font-bold text-slate-600">
                      {plan.areaM ? Number(plan.areaM).toLocaleString() : "---"}
                    </td>

                    {/* عرض عدد القطع من الداتابيز */}
                    <td className="py-3 px-5 text-center">
                      <span
                        className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-black ${dbPlotCount > 0 ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"}`}
                      >
                        {dbPlotCount} قطعة
                      </span>
                    </td>

                    {/* عمود التعديل */}
                    <td className="py-3 px-5 text-center border-r border-slate-100">
                      <button
                        onClick={() =>
                          setPlanModal({
                            isOpen: true,
                            mode: "edit",
                            activeTab: "general",
                            data: plan,
                          })
                        }
                        className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition-all shadow-sm mx-auto flex"
                        title="تعديل المخطط"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </td>

                    {/* عمود الحذف (منفصل) */}
                    <td className="py-3 px-5 text-center border-r border-slate-100 bg-rose-50/20">
                      <button
                        onClick={(e) => handleDelete(e, plan.id)}
                        className="p-2 bg-white border border-rose-200 rounded-lg text-rose-500 hover:text-white hover:bg-rose-500 transition-all shadow-sm mx-auto flex"
                        title="حذف المخطط نهائياً"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredAndSortedPlans.length === 0 && (
                <tr>
                  <td
                    colSpan="6"
                    className="text-center py-20 text-slate-400 font-bold bg-slate-50"
                  >
                    <Layers className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    لا توجد مخططات مطابقة للبحث أو مسجلة حالياً
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ----------------- Wide Modal Shell ----------------- */}
      {planModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 lg:p-6 animate-in fade-in">
          <div className="bg-slate-50 rounded-3xl w-full max-w-7xl h-[95vh] shadow-2xl flex flex-col overflow-hidden ring-1 ring-white/20 animate-in zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 bg-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-inner">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-800 text-lg tracking-tight">
                    {planModal.mode === "create"
                      ? "إضافة مخطط جديد"
                      : `تعديل المخطط: ${planModal.data.planNumber}`}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setPlanModal({ ...planModal, isOpen: false })}
                className="p-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 flex overflow-hidden">
              {/* Sidebar */}
              <div className="w-64 bg-white border-l border-slate-200 p-4 flex flex-col gap-1.5 shrink-0 overflow-y-auto custom-scrollbar-slim">
                {MODAL_TABS.map((tab) => {
                  const isActive = planModal.activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() =>
                        setPlanModal((prev) => ({ ...prev, activeTab: tab.id }))
                      }
                      className={`flex items-center gap-3 w-full p-3.5 rounded-xl text-sm font-bold transition-all relative overflow-hidden ${isActive ? "bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100" : "text-slate-600 hover:bg-slate-50 border border-transparent"}`}
                    >
                      {isActive && (
                        <div className="absolute right-0 top-2 bottom-2 w-1 bg-indigo-600 rounded-l-full"></div>
                      )}
                      <tab.icon
                        className={`w-4 h-4 ${isActive ? "text-indigo-600" : "text-slate-400"}`}
                      />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Content Area */}
              <div className="flex-1 flex p-5 flex-col overflow-hidden bg-slate-50">
                <form
                  id="planComplexForm"
                  onSubmit={handleSubmit}
                  className="flex-1 flex flex-col overflow-hidden bg-white border border-slate-200 rounded-2xl shadow-sm"
                >
                  {planModal.activeTab === "general" && (
                    <GeneralInfoTab
                      planModal={planModal}
                      setPlanModal={setPlanModal}
                    />
                  )}
                  {planModal.activeTab === "stats" && (
                    <StatsTab planNumber={planModal.data.planNumber} />
                  )}
                  {planModal.activeTab === "plots_details" && (
                    <PlotsDetailsTab
                      planId={planModal.data.id}
                      setArchiveModal={setArchiveModal}
                      setClientModal={setClientModal}
                    />
                  )}
                  {planModal.activeTab === "files" && (
                    <FilesTab
                      planModal={planModal}
                      setPlanModal={setPlanModal}
                      setPreviewFile={setPreviewFile} // 👈 لا تنسَ إضافة هذه
                    />
                  )}
                  {planModal.activeTab === "special_reg" && (
                    <SpecialRegTab
                      planModal={planModal}
                      setPlanModal={setPlanModal}
                    />
                  )}
                  {planModal.activeTab === "notes" && (
                    <NotesTab
                      planModal={planModal}
                      setPlanModal={setPlanModal}
                    />
                  )}

                  <button type="submit" className="hidden">
                    Submit
                  </button>
                </form>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-slate-200 bg-white flex gap-4 shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20">
              <button
                type="button"
                onClick={() =>
                  setPlanModal((prev) => ({ ...prev, isOpen: false }))
                }
                className="px-8 py-3 bg-slate-100 text-slate-700 font-black rounded-xl w-40 hover:bg-slate-200 transition-colors"
              >
                إغلاق
              </button>
              <button
                onClick={() =>
                  document.getElementById("planComplexForm").requestSubmit()
                }
                disabled={planMutation.isPending}
                className="flex-1 px-8 py-3 bg-indigo-600 text-white font-black rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all active:scale-95"
              >
                حفظ جميع بيانات المخطط
              </button>
            </div>
          </div>
        </div>
      )}

      {/* المودالز الفرعية */}
      {archiveModal.isOpen && archiveModal.projectId && (
        <ReferenceDetailsModal
          projectId={archiveModal.projectId}
          isOpen={archiveModal.isOpen}
          onClose={() => setArchiveModal({ isOpen: false, projectId: null })}
        />
      )}
      {clientModal.isOpen && clientModal.clientId && (
        <ClientFileDetails
          clientId={clientModal.clientId}
          isOpen={clientModal.isOpen}
          onClose={() => setClientModal({ isOpen: false, clientId: null })}
        />
      )}
      {/* ----------------- Modal معاينة الملفات ----------------- */}
      {previewFile && (
        <div className="fixed inset-0 z-[200] bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4 lg:p-8 animate-in fade-in" dir="rtl">
          <div className="bg-white w-full max-w-5xl h-[90vh] rounded-3xl flex flex-col overflow-hidden shadow-2xl ring-1 ring-white/10 animate-in zoom-in-95 duration-300">
            {/* Header المعاينة */}
            <div className="px-6 py-4 bg-slate-800 flex justify-between items-center shrink-0 shadow-md z-10">
              <div className="flex items-center gap-3 text-white">
                <div>
                  <h3 className="font-bold text-sm line-clamp-1" dir="ltr">{previewFile.name}</h3>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">معاينة مباشرة (Preview)</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href={previewFile.url}
                  download={previewFile.name}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black transition-all flex items-center gap-2"
                >
                  تنزيل
                </a>
                <button
                  onClick={() => setPreviewFile(null)}
                  className="p-2 bg-slate-700 hover:bg-rose-500 text-white rounded-xl transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content المعاينة */}
            <div className="flex-1 bg-slate-100 relative overflow-hidden flex justify-center items-center p-4 custom-scrollbar">
              {["pdf"].includes(previewFile.type?.toLowerCase()) ? (
                <iframe src={previewFile.url} className="w-full h-full rounded-2xl shadow-sm bg-white" title={previewFile.name} />
              ) : ["jpg", "jpeg", "png", "webp", "gif"].includes(previewFile.type?.toLowerCase()) ? (
                <img src={previewFile.url} alt={previewFile.name} className="max-w-full max-h-full object-contain rounded-2xl shadow-sm p-2 bg-white" />
              ) : (
                <div className="text-center text-slate-500 bg-white p-10 rounded-3xl shadow-sm max-w-sm">
                  <h3 className="font-black text-slate-800 text-lg mb-2">المعاينة غير متاحة</h3>
                  <p className="text-xs font-bold leading-relaxed mb-6">المتصفح لا يدعم المعاينة المباشرة لهذا النوع من الملفات ({previewFile.type}).</p>
                  <a href={previewFile.url} download={previewFile.name} className="inline-flex px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-black hover:bg-blue-700 transition-all shadow-md">
                    تنزيل الملف للعرض
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlansTab;
