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
import ClientFileView from "../../../Clients/components/clientDetails/ClientFileView";


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
      return <ArrowUpDown className="w-3.5 h-3.5 text-[#cbd5e1]" />;
    return sortConfig.direction === "asc" ? (
      <ArrowUp className="w-3.5 h-3.5 text-[#0e7490]" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-[#0e7490]" />
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
      <div className="flex justify-center p-4 h-full items-center">
        <Loader2 className="animate-spin text-[#0e7490] w-10 h-10" />
      </div>
    );

  return (
    <div
      className="flex-1 overflow-hidden m-2 rounded-xl bg-[#fbf8f1] border border-[#e8ddc8] shadow-[0_6px_14px_rgba(18,63,89,0.04)] flex flex-col"
      dir="rtl"
    >
      {/* ----------------- Header ----------------- */}
      <div className="p-4 border-b border-[#e8ddc8] bg-white shrink-0 flex flex-wrap gap-2.5 items-center justify-between shadow-[0_6px_14px_rgba(18,63,89,0.04)] z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#eef7f6] text-[#0e7490] rounded-lg flex items-center justify-center shadow-inner">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm text-[#123f59] font-black">
              مخططات الرياض المعتمدة
            </h2>
            <p className="text-[11px] text-[#94a3b8] font-bold mt-0.5">
              إدارة المخططات، والبحث فيها أو في قطعها
            </p>
          </div>
        </div>

        {/* 🔍 شريط البحث */}
        <div className="relative w-full md:w-72">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
          <input
            type="text"
            placeholder="ابحث برقم المخطط أو رقم القطعة..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#fbf8f1] border border-transparent focus:border-[#d8b46a]/40 focus:bg-white focus:ring-4 focus:ring-[#eef7f6] rounded-xl pr-9 pl-4 py-2.5 text-xs font-bold outline-none transition-all"
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
          className="flex items-center gap-2 px-3 py-2.5 bg-[#123f59] text-white rounded-xl text-xs font-black hover:bg-[#0f3448] shadow-[0_8px_18px_rgba(18,63,89,0.05)] shadow-[0_8px_18px_rgba(18,63,89,0.06)]/20 transition-all active:scale-95"
        >
          <IconWithText icon={Plus} text="تسجيل مخطط جديد" iconClassName="w-4 h-4" /></button>
      </div>

      {/* ----------------- Main Table ----------------- */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar-slim p-4 custom-scrollbar">
        <div className="border border-[#e8ddc8] bg-white rounded-2xl overflow-hidden shadow-[0_6px_14px_rgba(18,63,89,0.04)]">
          <table className="w-full text-sm text-right whitespace-nowrap">
            <thead className="bg-[#123f59] text-white font-bold text-xs">
              <tr>
                <th
                  className="py-4 px-3 cursor-pointer hover:bg-[#475569] transition-colors"
                  onClick={() => handleSort("planNumber")}
                >
                  <div className="flex items-center gap-2">
                    رقم المخطط {getSortIcon("planNumber")}
                  </div>
                </th>
                <th
                  className="py-4 px-3 cursor-pointer hover:bg-[#475569] transition-colors"
                  onClick={() => handleSort("hijriYear")}
                >
                  <div className="flex items-center gap-2">
                    سنة الاعتماد {getSortIcon("hijriYear")}
                  </div>
                </th>
                <th
                  className="py-4 px-3 cursor-pointer hover:bg-[#475569] transition-colors"
                  onClick={() => handleSort("areaM")}
                >
                  <div className="flex items-center gap-2">
                    المساحة ($م^2$) {getSortIcon("areaM")}
                  </div>
                </th>
                <th
                  className="py-4 px-3 cursor-pointer hover:bg-[#475569] transition-colors text-center"
                  onClick={() => handleSort("plotCount")}
                >
                  <div className="flex items-center justify-center gap-2">
                    عدد القطع المسجلة بالداتابيز {getSortIcon("plotCount")}
                  </div>
                </th>
                {/* 🚀 تم فصل الإجراءات لعمودين حسب الصورة */}
                <th className="py-4 px-3 text-center w-20 border-r border-[#475569]">
                  تعديل
                </th>
                <th className="py-4 px-3 text-center w-20 border-r border-[#475569] text-rose-300">
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
                    className="hover:bg-[#eef7f6]/50 hover:cursor-pointer transition-colors group"
                  >
                    <td className="py-3 px-3 font-black text-[#15536f]">
                      {plan.planNumber}
                    </td>
                    <td className="py-3 px-3 text-[#64748b] font-bold">
                      {plan.hijriYear || "---"}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-[#64748b]">
                      {plan.areaM ? Number(plan.areaM).toLocaleString() : "---"}
                    </td>

                    {/* عرض عدد القطع من الداتابيز */}
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-black ${dbPlotCount > 0 ? "bg-emerald-100 text-emerald-800" : "bg-[#fbf8f1] text-[#94a3b8]"}`}
                      >
                        {dbPlotCount} قطعة
                      </span>
                    </td>

                    {/* عمود التعديل */}
                    <td className="py-3 px-3 text-center border-r border-[#fbf8f1]">
                      <button
                        onClick={() =>
                          setPlanModal({
                            isOpen: true,
                            mode: "edit",
                            activeTab: "general",
                            data: plan,
                          })
                        }
                        className="p-2 bg-white border border-[#e8ddc8] rounded-lg text-[#94a3b8] hover:text-[#0e7490] hover:border-[#d8b46a]/35 hover:bg-[#eef7f6] transition-all shadow-[0_6px_14px_rgba(18,63,89,0.04)] mx-auto flex"
                        title="تعديل المخطط"
                      >
                        <IconWithText icon={Edit} text="تعديل" iconClassName="w-4 h-4" /></button>
                    </td>

                    {/* عمود الحذف (منفصل) */}
                    <td className="py-3 px-3 text-center border-r border-[#fbf8f1] bg-rose-50/20">
                      <button
                        onClick={(e) => handleDelete(e, plan.id)}
                        className="p-2 bg-white border border-rose-200 rounded-lg text-rose-500 hover:text-white hover:bg-rose-500 transition-all shadow-[0_6px_14px_rgba(18,63,89,0.04)] mx-auto flex"
                        title="حذف المخطط نهائياً"
                      >
                        <IconWithText icon={Trash2} text="حذف" iconClassName="w-4 h-4" /></button>
                    </td>
                  </tr>
                );
              })}
              {filteredAndSortedPlans.length === 0 && (
                <tr>
                  <td
                    colSpan="6"
                    className="text-center py-20 text-[#94a3b8] font-bold bg-[#fbf8f1]"
                  >
                    <Layers className="w-9 h-9 mx-auto mb-3 opacity-20" />
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
        <div className="fixed inset-0 bg-[#123f59]/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 lg:p-3 animate-in fade-in">
          <div className="bg-[#fbf8f1] rounded-2xl w-full max-w-7xl h-[95vh] shadow-2xl flex flex-col overflow-hidden ring-1 ring-white/20 animate-in zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="px-3 py-4 border-b border-[#e8ddc8] bg-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[#123f59] text-white rounded-xl shadow-inner">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-[#123f59] text-sm tracking-tight">
                    {planModal.mode === "create"
                      ? "إضافة مخطط جديد"
                      : `تعديل المخطط: ${planModal.data.planNumber}`}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setPlanModal({ ...planModal, isOpen: false })}
                className="p-2 bg-[#fbf8f1] border border-[#e8ddc8] rounded-xl text-[#94a3b8] hover:bg-rose-50 hover:text-rose-600 transition-all"
              >
                <IconWithText icon={X} text="إغلاق" iconClassName="w-5 h-5" /></button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 flex overflow-hidden">
              {/* Sidebar */}
              <div className="w-64 bg-white border-l border-[#e8ddc8] p-4 flex flex-col gap-1.5 shrink-0 overflow-y-auto overflow-x-hidden custom-scrollbar-slim">
                {MODAL_TABS.map((tab) => {
                  const isActive = planModal.activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() =>
                        setPlanModal((prev) => ({ ...prev, activeTab: tab.id }))
                      }
                      className={`flex items-center gap-3 w-full p-3.5 rounded-xl text-sm font-bold transition-all relative overflow-hidden ${isActive ? "bg-[#eef7f6] text-[#15536f] shadow-[0_6px_14px_rgba(18,63,89,0.04)] border border-[#d8b46a]/25" : "text-[#64748b] hover:bg-[#fbf8f1] border border-transparent"}`}
                    >
                      {isActive && (
                        <div className="absolute right-0 top-2 bottom-2 w-1 bg-[#0e7490] rounded-l-full"></div>
                      )}
                      <tab.icon
                        className={`w-4 h-4 ${isActive ? "text-[#0e7490]" : "text-[#94a3b8]"}`}
                      />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Content Area */}
              <div className="flex-1 flex p-3 flex-col overflow-hidden bg-[#fbf8f1]">
                <form
                  id="planComplexForm"
                  onSubmit={handleSubmit}
                  className="flex-1 flex flex-col overflow-hidden bg-white border border-[#e8ddc8] rounded-2xl shadow-[0_6px_14px_rgba(18,63,89,0.04)]"
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
            <div className="p-3 border-t border-[#e8ddc8] bg-white flex gap-2.5 shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20">
              <button
                type="button"
                onClick={() =>
                  setPlanModal((prev) => ({ ...prev, isOpen: false }))
                }
                className="px-4 py-3 bg-[#fbf8f1] text-[#475569] font-black rounded-xl w-40 hover:bg-[#e8ddc8] transition-colors"
              >
                إغلاق
              </button>
              <button
                onClick={() =>
                  document.getElementById("planComplexForm").requestSubmit()
                }
                disabled={planMutation.isPending}
                className="flex-1 px-4 py-3 bg-[#123f59] text-white font-black rounded-xl flex items-center justify-center gap-2 hover:bg-[#0f3448] transition-all active:scale-95"
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
        <ClientFileView
          clientId={clientModal.clientId}
          isOpen={clientModal.isOpen}
          onClose={() => setClientModal({ isOpen: false, clientId: null })}
        />
      )}
      {/* ----------------- Modal معاينة الملفات ----------------- */}
      {previewFile && (
        <div className="fixed inset-0 z-[200] bg-[#123f59]/90 backdrop-blur-sm flex items-center justify-center p-4 lg:p-4 animate-in fade-in" dir="rtl">
          <div className="bg-white w-full max-w-5xl h-[90vh] rounded-2xl flex flex-col overflow-hidden shadow-2xl ring-1 ring-white/10 animate-in zoom-in-95 duration-300">
            {/* Header المعاينة */}
            <div className="px-3 py-4 bg-[#123f59] flex justify-between items-center shrink-0 shadow-[0_8px_18px_rgba(18,63,89,0.05)] z-10">
              <div className="flex items-center gap-3 text-white">
                <div>
                  <h3 className="font-bold text-sm line-clamp-1" dir="ltr">{previewFile.name}</h3>
                  <p className="text-[10px] text-[#94a3b8] font-mono mt-0.5">معاينة مباشرة (Preview)</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href={previewFile.url}
                  download={previewFile.name}
                  className="inline-flex h-8 items-center justify-center gap-1.5 rounded-xl bg-[#0e7490] px-2.5 text-[10px] font-black text-white transition hover:bg-[#123f59]"
                >
                  تنزيل الملف
                </a>
                <button
                  onClick={() => setPreviewFile(null)}
                  className="p-2 bg-[#475569] hover:bg-rose-500 text-white rounded-xl transition-all"
                >
                  <IconWithText icon={X} text="إغلاق" iconClassName="w-5 h-5" /></button>
              </div>
            </div>

            {/* Content المعاينة */}
            <div className="flex-1 bg-[#fbf8f1] relative overflow-hidden flex justify-center items-center p-4 custom-scrollbar">
              {["pdf"].includes(previewFile.type?.toLowerCase()) ? (
                <iframe src={previewFile.url} className="w-full h-full rounded-2xl shadow-[0_6px_14px_rgba(18,63,89,0.04)] bg-white" title={previewFile.name} />
              ) : ["jpg", "jpeg", "png", "webp", "gif"].includes(previewFile.type?.toLowerCase()) ? (
                <img src={previewFile.url} alt={previewFile.name} className="max-w-full max-h-full object-contain rounded-2xl shadow-[0_6px_14px_rgba(18,63,89,0.04)] p-2 bg-white" />
              ) : (
                <div className="text-center text-[#94a3b8] bg-white p-4 rounded-2xl shadow-[0_6px_14px_rgba(18,63,89,0.04)] max-w-sm">
                  <h3 className="font-black text-[#123f59] text-sm mb-2">المعاينة غير متاحة</h3>
                  <p className="text-xs font-bold leading-relaxed mb-6">المتصفح لا يدعم المعاينة المباشرة لهذا النوع من الملفات ({previewFile.type}).</p>
                  <a href={previewFile.url} download={previewFile.name} className="inline-flex px-3 py-3 bg-[#123f59] text-white rounded-xl text-sm font-black hover:bg-[#0f3448] transition-all shadow-[0_8px_18px_rgba(18,63,89,0.05)]">
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
