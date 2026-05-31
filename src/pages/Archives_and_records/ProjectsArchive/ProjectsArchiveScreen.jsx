import React, { useState, useEffect } from "react";
import {
  FolderArchive,
  RefreshCw,
  ArrowDownToLine,
  Plus,
  Search,
  Eye,
  Layers,
  Loader2,
  Trash2,
  PenLine,
  MapPin,
  AlertTriangle,
  FileWarning,
  ListChecks,
  XCircle,
  Clock,
  ShieldCheck,
} from "lucide-react";
import axios from "../../../api/axios";
import AddReferenceProjectModal from "./models/AddReferenceProjectModal";
import ReferenceDetailsModal from "./ReferenceDetails/ReferenceDetailsModal";
import * as XLSX from "xlsx";

export default function ProjectsArchiveScreen() {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("/archived-projects");
      if (response.data.success) {
        setProjects(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching archived projects:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const openProjectDetails = (id) => setSelectedProjectId(id);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (
      !window.confirm(
        "هل أنت متأكد من حذف هذا الملف نهائياً؟ سيتم مسح كافة الأوراق الخاصة به.",
      )
    )
      return;

    setIsDeleting(true);
    try {
      await axios.delete(`/archived-projects/${id}`);
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      alert("حدث خطأ أثناء محاولة الحذف. تأكد من اتصالك بالإنترنت.");
    } finally {
      setIsDeleting(false);
    }
  };

  const isProjectDuplicate = (notes) => notes && notes.includes("⚠️");

  const getDuplicateWarning = (notes) => {
    if (!isProjectDuplicate(notes)) return null;
    return "تنبيه: هذا المشروع قد يكون مكرراً وموجوداً في النظام مسبقاً!";
  };

  // الإحصائيات
  const stats = {
    total: projects.length,
    needsReview: projects.filter((p) => p.aiStatus === "completed").length,
    failed: projects.filter((p) => p.aiStatus === "failed").length,
    duplicates: projects.filter((p) => isProjectDuplicate(p.archiveNotes))
      .length,
    processing: projects.filter(
      (p) => p.aiStatus === "pending" || p.aiStatus === "processing",
    ).length,
  };

  // الفلترة
  const filteredProjects = projects.filter((p) => {
    const clientName =
      typeof p.client?.name === "object"
        ? p.client?.name?.ar || ""
        : p.client?.name || "";
    const matchesSearch =
      (p.title && p.title.includes(searchTerm)) ||
      (p.archiveCode && p.archiveCode.includes(searchTerm)) ||
      clientName.includes(searchTerm) ||
      (p.licenseNumber && p.licenseNumber.includes(searchTerm));

    if (!matchesSearch) return false;

    if (activeFilter === "all") return true;
    if (activeFilter === "failed") return p.aiStatus === "failed";
    if (activeFilter === "duplicates")
      return isProjectDuplicate(p.archiveNotes);
    if (activeFilter === "review") return p.aiStatus === "completed";
    if (activeFilter === "processing")
      return p.aiStatus === "pending" || p.aiStatus === "processing";

    return true;
  });

  // التصدير إلى إكسيل
  const handleExportExcel = () => {
    const exportData = filteredProjects.map((p) => ({
      "الرقم الموحد": p.archiveCode || "-",
      "اسم المشروع": p.title || "-",
      "اسم المالك":
        typeof p.client?.name === "object"
          ? p.client?.name?.ar
          : p.client?.name || "غير محدد",
      "نوع المشروع": p.projectType || "-",
      "رقم الرخصة": p.licenseNumber || "-",
      "تاريخ الرخصة": p.licenseIssueDate
        ? new Date(p.licenseIssueDate).toLocaleDateString("en-GB")
        : "-",
      "رقم الصك": p.deedNumber || "-",
      الحي: p.district?.name || "-",
      المدينة: p.city || "-",
      "الشارع الرئيسي": p.mainStreet || "-",
      "رقم المخطط": p.planNumber || "-",
      "المساحة (م2)": p.totalArea || 0,
      "عدد المرفقات": p._count?.files || 0,
      "حالة الملف":
        p.aiStatus === "completed"
          ? "يحتاج مراجعة"
          : p.aiStatus === "approved"
            ? "معتمد"
            : p.aiStatus === "failed"
              ? "فشل"
              : "جاري المعالجة",
      "تاريخ الأرشفة": new Date(p.createdAt).toLocaleDateString("en-GB"),
    }));

    if (exportData.length === 0) return alert("لا توجد بيانات لتصديرها!");

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    if (!worksheet["!views"]) worksheet["!views"] = [];
    worksheet["!views"].push({ rightToLeft: true });

    worksheet["!cols"] = [
      { wch: 15 },
      { wch: 35 },
      { wch: 25 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 20 },
      { wch: 15 },
      { wch: 12 },
      { wch: 25 },
      { wch: 15 },
      { wch: 12 },
      { wch: 12 },
      { wch: 15 },
      { wch: 15 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "أرشيف المشاريع");
    XLSX.writeFile(
      workbook,
      `Archive_Export_${new Date().toISOString().split("T")[0]}.xlsx`,
    );
  };

  return (
    <div className="flex-1 block h-full">
      <div className="h-full flex flex-col bg-[#f8fafc] font-sans" dir="rtl">
        {/* ======================= 🚀 الهيدر الاحترافي المضغوط (Toolbar) ======================= */}
        <div className="bg-[#0f3d50] text-white border-b border-white/10 px-4 py-2.5 shrink-0 shadow-sm flex flex-col xl:flex-row xl:items-center justify-between gap-3 relative z-10">
          {/* 1. العنوان المبسط */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="p-2 bg-[#d7b96d] text-[#0f3d50] rounded-xl border border-white/10 shadow-sm">
              <FolderArchive className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-black text-white tracking-tight">
                أرشيف المشاريع
              </h1>
              <p className="text-[10px] font-bold text-white/65 mt-0.5">
                إدارة ومراجعة المعاملات المقروءة آلياً
              </p>
            </div>
          </div>

          {/* 2. أدوات البحث والفلاتر (في المنتصف) */}
          <div className="flex-1 flex flex-wrap md:flex-nowrap items-center justify-start xl:justify-center gap-3 overflow-hidden">
            {/* مربع البحث */}
            <div className="relative w-full md:w-64 shrink-0 group">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 group-focus-within:text-[#d7b96d] transition-colors" />
              <input
                placeholder="ابحث بالاسم، الرخصة، المالك..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/12 border border-white/15 rounded-xl pr-9 pl-3 py-1.5 text-xs font-bold text-white placeholder:text-white/45 outline-none focus:bg-white/18 focus:border-[#d7b96d] focus:ring-2 focus:ring-[#d7b96d]/20 transition-all"
              />
            </div>

            {/* الفلاتر (Capsules) قابلة للتمرير على الشاشات الصغيرة */}
            <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1 md:pb-0">
              <button
                onClick={() => setActiveFilter("all")}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold border transition-all whitespace-nowrap ${activeFilter === "all" ? "bg-[#f4f7f8] border-[#e8dcc8] text-[#123B5D]" : "bg-white/10 border-white/15 text-white/80 hover:bg-white/20"}`}
              >
                الكل{" "}
                <span
                  className={`px-1.5 py-0.5 rounded-md text-[9px] ${activeFilter === "all" ? "bg-[#d7b96d]/25" : "bg-white/10"}`}
                >
                  {stats.total}
                </span>
              </button>

              <button
                onClick={() => setActiveFilter("review")}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold border transition-all whitespace-nowrap ${activeFilter === "review" ? "bg-amber-50 border-amber-200 text-amber-700" : "bg-white/10 border-white/15 text-white/80 hover:bg-white/20"}`}
              >
                <ListChecks className="w-3.5 h-3.5" /> مراجعة{" "}
                <span
                  className={`px-1.5 py-0.5 rounded-md text-[9px] ${activeFilter === "review" ? "bg-amber-200/50" : "bg-white/10"}`}
                >
                  {stats.needsReview}
                </span>
              </button>

              <button
                onClick={() => setActiveFilter("processing")}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold border transition-all whitespace-nowrap ${activeFilter === "processing" ? "bg-sky-50 border-sky-200 text-sky-700" : "bg-white/10 border-white/15 text-white/80 hover:bg-white/20"}`}
              >
                <Clock className="w-3.5 h-3.5" /> قراءة{" "}
                <span
                  className={`px-1.5 py-0.5 rounded-md text-[9px] ${activeFilter === "processing" ? "bg-sky-200/50" : "bg-white/10"}`}
                >
                  {stats.processing}
                </span>
              </button>

              <button
                onClick={() => setActiveFilter("duplicates")}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold border transition-all whitespace-nowrap ${activeFilter === "duplicates" ? "bg-orange-50 border-orange-200 text-orange-700" : "bg-white/10 border-white/15 text-white/80 hover:bg-white/20"}`}
              >
                <FileWarning className="w-3.5 h-3.5" /> مكرر{" "}
                <span
                  className={`px-1.5 py-0.5 rounded-md text-[9px] ${activeFilter === "duplicates" ? "bg-orange-200/50" : "bg-white/10"}`}
                >
                  {stats.duplicates}
                </span>
              </button>

              <button
                onClick={() => setActiveFilter("failed")}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold border transition-all whitespace-nowrap ${activeFilter === "failed" ? "bg-rose-50 border-rose-200 text-rose-700" : "bg-white/10 border-white/15 text-white/80 hover:bg-white/20"}`}
              >
                <XCircle className="w-3.5 h-3.5" /> فشل{" "}
                <span
                  className={`px-1.5 py-0.5 rounded-md text-[9px] ${activeFilter === "failed" ? "bg-rose-200/50" : "bg-white/10"}`}
                >
                  {stats.failed}
                </span>
              </button>
            </div>
          </div>

          {/* 3. أزرار الإجراءات (تحديث، تصدير، إضافة) */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={fetchProjects}
              className="px-3 py-2 bg-white/10 border border-white/15 text-white rounded-xl hover:bg-white/20 transition-all shadow-sm flex items-center gap-2"
              title="تحديث البيانات"
            >
              <RefreshCw
                className={`w-4 h-4 ${isLoading ? "animate-spin text-[#123B5D]" : ""}`}
              />
              <span className="text-[11px] font-black">تحديث</span>
            </button>
            <button
              onClick={handleExportExcel}
              className="px-3 py-2 bg-white/10 border border-white/15 text-white rounded-xl hover:bg-white/20 transition-all shadow-sm flex items-center gap-2"
              title="تصدير إلى Excel"
            >
              <ArrowDownToLine className="w-4 h-4" />
              <span className="text-[11px] font-black">تصدير</span>
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2.5 bg-[#d7b96d] text-[#0f3d50] font-black text-xs rounded-xl hover:bg-[#e4c87d] flex items-center gap-2 transition-all shadow-sm active:scale-95"
            >
              <Plus className="w-4 h-4" /> إضافة ملفات
            </button>
          </div>
        </div>

        {/* ======================= Data Table ======================= */}
        <div className="flex-1 overflow-auto bg-white relative custom-scrollbar">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full text-[#123B5D] bg-slate-50/50">
              <Loader2 className="w-10 h-10 animate-spin mb-3" />
              <span className="text-sm font-black text-slate-700">
                جاري إحضار الملفات... يرجى الانتظار
              </span>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 bg-slate-50/50 p-6 text-center">
              <div className="w-24 h-24 bg-white rounded-full border border-slate-200 flex items-center justify-center mb-4 shadow-sm">
                <FolderArchive className="w-10 h-10 text-slate-300" />
              </div>
              <span className="text-base font-black text-slate-700">
                لا توجد ملفات لعرضها هنا!
              </span>
              <p className="text-xs font-bold mt-2 max-w-sm leading-relaxed">
                {activeFilter !== "all" || searchTerm !== ""
                  ? "لا يوجد أي ملف يطابق بحثك أو الفلتر الذي اخترته. جرب مسح البحث."
                  : "مكتبة المشاريع فارغة. يمكنك البدء بإضافة مشاريع جديدة."}
              </p>
            </div>
          ) : (
            <table className="w-full text-right text-[11px] font-bold border-collapse whitespace-nowrap">
              <thead className="bg-[#f4f7f8] text-[#123B5D] sticky top-0 z-20 shadow-sm border-b border-slate-200">
                <tr className="divide-x divide-x-reverse divide-slate-200">
                  <th className="px-3 py-2.5 font-black sticky right-0 bg-slate-50 z-30 w-32 border-l border-slate-200 text-[#123B5D]">
                    رقم الملف (المرجع)
                  </th>
                  <th className="px-3 py-2.5 font-black sticky right-[128px] bg-slate-50 z-30 w-64 border-l border-slate-200">
                    اسم المشروع
                  </th>
                  <th className="px-3 py-2.5 font-black text-slate-500">
                    اسم المالك
                  </th>
                  <th className="px-3 py-2.5 font-black text-slate-500">
                    الرخصة وتاريخها
                  </th>
                  <th className="px-3 py-2.5 font-black text-slate-500">
                    الحي والمدينة
                  </th>
                  <th className="px-3 py-2.5 font-black text-slate-500 text-center">
                    المرفقات
                  </th>
                  <th className="px-3 py-2.5 font-black text-center w-40 text-slate-800">
                    حالة الملف
                  </th>
                  <th className="px-3 py-2.5 font-black text-center text-slate-500 w-24">
                    إجراءات
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredProjects.map((project) => {
                  const isDuplicate = isProjectDuplicate(project.archiveNotes);
                  const warningMsg = getDuplicateWarning(project.archiveNotes);

                  return (
                    <tr
                      key={project.id}
                      onClick={() => openProjectDetails(project.id)}
                      className={`cursor-pointer transition-all hover:shadow-md ${isDuplicate ? "bg-orange-50/30 hover:bg-orange-50" : "hover:bg-[#f4f7f8]/50"}`}
                    >
                      <td
                        className={`px-4 py-3 sticky right-0 z-10 border-l border-slate-100 ${isDuplicate ? "bg-orange-50/90" : "bg-white"}`}
                      >
                        <span className="font-mono font-black text-xs text-[#123B5D] bg-[#f4f7f8] px-2 py-1 rounded-md border border-[#e8dcc8]">
                          {project.archiveCode}
                        </span>
                      </td>

                      <td
                        className={`px-4 py-3 sticky right-[128px] z-10 border-l border-slate-100 ${isDuplicate ? "bg-orange-50/90" : "bg-white"}`}
                      >
                        <div className="flex items-center gap-2 max-w-[500px]">
                          {isDuplicate && (
                            <AlertTriangle
                              className="w-4 h-4 text-orange-500 shrink-0"
                              title={warningMsg}
                            />
                          )}
                          <span
                            className={`font-black truncate text-sm ${isDuplicate ? "text-orange-900" : "text-slate-800"}`}
                            title={project.title}
                          >
                            {project.title || "بدون اسم"}
                          </span>
                          <Eye className="w-4 h-4 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-[#123B5D] shrink-0 transition-opacity" />
                        </div>
                      </td>

                      <td className="px-4 py-3 text-slate-700 text-xs">
                        {typeof project.client?.name === "object"
                          ? project.client?.name?.ar
                          : project.client?.name || "غير محدد"}
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex flex-col font-mono text-[11px]">
                          <span className="text-emerald-700 font-black">
                            {project.licenseNumber || "لم يتم تسجيل رخصة"}
                          </span>
                          <span className="text-slate-400">
                            {project.licenseIssueDate
                              ? new Date(
                                  project.licenseIssueDate,
                                ).toLocaleDateString("en-GB")
                              : ""}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <span className="text-slate-700 flex items-center gap-1.5 text-xs">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />{" "}
                          {project.district?.name || "غير محدد"}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center justify-center bg-slate-100 text-slate-700 px-3 py-1 rounded-lg text-xs font-black shadow-sm">
                          <Layers className="w-4 h-4 mr-1.5 text-slate-400" />{" "}
                          {project._count?.files || 0}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-center">
                        {project.aiStatus === "completed" ? (
                          <span className="inline-flex items-center justify-center w-full px-2 py-1.5 bg-amber-100 text-amber-800 rounded-lg text-[10px] font-black border border-amber-200 gap-1 shadow-sm">
                            <ListChecks className="w-3.5 h-3.5" /> يحتاج مراجعتك
                            واعتمادك ✍️
                          </span>
                        ) : project.aiStatus === "approved" ? (
                          <span className="inline-flex items-center justify-center w-full px-2 py-1.5 bg-emerald-100 text-emerald-800 rounded-lg text-[10px] font-black border border-emerald-200 gap-1 shadow-sm">
                            <ShieldCheck className="w-3.5 h-3.5" /> مكتمل ومعتمد
                            ✅
                          </span>
                        ) : project.aiStatus === "failed" ? (
                          <span className="inline-flex items-center justify-center w-full px-2 py-1.5 bg-rose-100 text-rose-800 rounded-lg text-[10px] font-black border border-rose-200 gap-1 shadow-sm">
                            <XCircle className="w-3.5 h-3.5" /> فشل - أعد الرفع
                            ❌
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center w-full px-2 py-1.5 bg-sky-100 text-sky-800 rounded-lg text-[10px] font-black border border-sky-200 gap-1 animate-pulse shadow-sm">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />{" "}
                            جاري القراءة الآلية ⏳
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openProjectDetails(project.id);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-[#123B5D] bg-[#edf7fb] border border-[#cfe3ea] hover:bg-[#dff0f6] rounded-xl shadow-sm transition-all"
                            title="افتح للتعديل والمراجعة"
                          >
                            <PenLine className="w-4 h-4" />
                            <span>تعديل</span>
                          </button>
                          <button
                            onClick={(e) => handleDelete(project.id, e)}
                            disabled={isDeleting}
                            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-rose-600 bg-rose-50 border border-rose-100 hover:bg-rose-100 rounded-xl shadow-sm transition-all disabled:opacity-50"
                            title="حذف الملف نهائياً"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>حذف</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {isAddModalOpen && (
        <AddReferenceProjectModal
          isOpen={isAddModalOpen}
          onClose={() => {
            setIsAddModalOpen(false);
            fetchProjects();
          }}
        />
      )}
      {!!selectedProjectId && (
        <ReferenceDetailsModal
          projectId={selectedProjectId}
          isOpen={!!selectedProjectId}
          onClose={() => {
            setSelectedProjectId(null);
            fetchProjects();
          }}
        />
      )}
    </div>
  );
}
