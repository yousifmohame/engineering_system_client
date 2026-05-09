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
import axios from "../../api/axios";
import AddReferenceProjectModal from "./models/AddReferenceProjectModal";
import ReferenceDetailsModal from "./ReferenceDetails/ReferenceDetailsModal";
import * as XLSX from "xlsx";

export default function ProjectsArchiveScreen() {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // 💡 فلتر جديد للأزرار العلوية التفاعلية
  const [activeFilter, setActiveFilter] = useState("all"); // all, failed, duplicates, review, processing

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

  // دالة لاكتشاف التكرار بسهولة
  const isProjectDuplicate = (notes) => {
    return notes && notes.includes("⚠️");
  };

  const getDuplicateWarning = (notes) => {
    if (!isProjectDuplicate(notes)) return null;
    return "تنبيه: هذا المشروع قد يكون مكرراً وموجوداً في النظام مسبقاً!";
  };

  // ==========================================
  // 🚀 حساب الإحصائيات للشريط التفاعلي العلوي
  // ==========================================
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

  // ==========================================
  // 🔍 فلترة البيانات المعروضة في الجدول
  // ==========================================
  const filteredProjects = projects.filter((p) => {
    // 1. فلتر البحث النصي
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

    // 2. فلتر الأزرار العلوية
    if (activeFilter === "all") return true;
    if (activeFilter === "failed") return p.aiStatus === "failed";
    if (activeFilter === "duplicates")
      return isProjectDuplicate(p.archiveNotes);
    if (activeFilter === "review") return p.aiStatus === "completed";
    if (activeFilter === "processing")
      return p.aiStatus === "pending" || p.aiStatus === "processing";

    return true;
  });

  // ==========================================
  // 📊 دالة تصدير البيانات إلى Excel باحترافية
  // ==========================================
  const handleExportExcel = () => {
    // 1. تجهيز البيانات بأعمدة عربية واضحة
    const exportData = filteredProjects.map((p) => ({
      "الرقم الموحد": p.archiveCode || "-",
      "اسم المشروع": p.title || "-",
      "اسم المالك": typeof p.client?.name === "object" ? p.client?.name?.ar : p.client?.name || "غير محدد",
      "نوع المشروع": p.projectType || "-",
      "رقم الرخصة": p.licenseNumber || "-",
      "تاريخ الرخصة": p.licenseIssueDate ? new Date(p.licenseIssueDate).toLocaleDateString("en-GB") : "-",
      "رقم الصك": p.deedNumber || "-",
      "الحي": p.district?.name || "-",
      "المدينة": p.city || "-",
      "الشارع الرئيسي": p.mainStreet || "-",
      "رقم المخطط": p.planNumber || "-",
      "المساحة (م2)": p.totalArea || 0,
      "عدد المرفقات": p._count?.files || 0,
      "حالة الملف": p.aiStatus === "completed" ? "يحتاج مراجعة" : p.aiStatus === "approved" ? "معتمد" : p.aiStatus === "failed" ? "فشل" : "جاري المعالجة",
      "تاريخ الأرشفة": new Date(p.createdAt).toLocaleDateString("en-GB"),
    }));

    if (exportData.length === 0) {
      return alert("لا توجد بيانات لتصديرها!");
    }

    // 2. إنشاء ورقة العمل (Worksheet)
    const worksheet = XLSX.utils.json_to_sheet(exportData);

    // 3. ضبط اتجاه الشيت ليكون من اليمين لليسار (RTL) لدعم العربية
    if (!worksheet['!views']) worksheet['!views'] = [];
    worksheet['!views'].push({ rightToLeft: true });

    // 4. ضبط عرض الأعمدة التقريبي لتكون مقروءة فور فتح الملف
    worksheet['!cols'] = [
      { wch: 15 }, // الرقم الموحد
      { wch: 35 }, // اسم المشروع
      { wch: 25 }, // المالك
      { wch: 15 }, // نوع المشروع
      { wch: 15 }, // رقم الرخصة
      { wch: 15 }, // تاريخ الرخصة
      { wch: 20 }, // رقم الصك
      { wch: 15 }, // الحي
      { wch: 12 }, // المدينة
      { wch: 25 }, // الشارع الرئيسي
      { wch: 15 }, // المخطط
      { wch: 12 }, // المساحة
      { wch: 12 }, // المرفقات
      { wch: 15 }, // الحالة
      { wch: 15 }, // تاريخ الأرشفة
    ];

    // 5. إنشاء ملف الإكسيل (Workbook) وحفظه
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "أرشيف المشاريع");
    
    // توليد اسم ديناميكي للملف بناءً على تاريخ اليوم
    const fileName = `Archive_Export_${new Date().toISOString().split("T")[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <div className="flex-1 block h-full">
      <div className="h-full flex flex-col bg-[#f8fafc] font-sans" dir="rtl">
        {/* ======================= Header (مبسط جداً) ======================= */}
        <div className="bg-white border-b border-slate-200 px-6 py-4 shrink-0 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <h1 className="text-xl font-black text-slate-800 flex items-center gap-3 tracking-tight">
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100 shadow-sm">
                <FolderArchive className="w-5 h-5" />
              </div>
              مكتبة المشاريع والأرشيف
            </h1>
            <p className="text-xs font-bold text-slate-500 mt-1.5 max-w-xl leading-relaxed">
              هنا تجد كافة ملفات ومخططات المشاريع. يقوم النظام بقراءتها
              تلقائياً، وكل ما عليك هو مراجعتها واعتمادها.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={fetchProjects}
              className="p-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 hover:text-indigo-600 transition-all shadow-sm flex items-center gap-2 font-bold text-xs"
              title="تحديث البيانات"
            >
              <RefreshCw
                className={`w-4 h-4 ${isLoading ? "animate-spin text-indigo-600" : ""}`}
              />{" "}
              تحديث
            </button>
            <button 
              onClick={handleExportExcel} // 👈 ربط الدالة هنا
              className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-50 flex items-center gap-2 transition-all shadow-sm"
            >
              <ArrowDownToLine className="w-4 h-4 text-slate-400" /> تحميل كـ إكسيل (Excel)
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-5 py-2.5 bg-indigo-600 text-white font-black text-xs rounded-xl hover:bg-indigo-700 flex items-center gap-2 transition-all shadow-md shadow-indigo-600/20 active:scale-95"
            >
              <Plus className="w-4 h-4" /> إضافة ملفات مشروع جديد
            </button>
          </div>
        </div>

        {/* ======================= 🚀 شريط التنبيهات الذكي والمباشر ======================= */}
        <div className="bg-slate-50 border-b border-slate-200 p-4 shrink-0 grid grid-cols-2 md:grid-cols-5 gap-3 relative z-10">
          <button
            onClick={() => setActiveFilter("all")}
            className={`flex flex-col p-3 rounded-xl border transition-all text-right ${activeFilter === "all" ? "bg-white border-indigo-300 ring-2 ring-indigo-100 shadow-sm" : "bg-white border-slate-200 hover:border-indigo-200"}`}
          >
            <span className="text-slate-400 font-bold text-[10px] mb-1 flex items-center justify-between">
              إجمالي الملفات <FolderArchive className="w-3.5 h-3.5" />
            </span>
            <span className="text-lg font-black text-slate-700">
              {stats.total}
            </span>
          </button>

          <button
            onClick={() => setActiveFilter("review")}
            className={`flex flex-col p-3 rounded-xl border transition-all text-right ${activeFilter === "review" ? "bg-amber-50 border-amber-300 ring-2 ring-amber-100 shadow-sm" : "bg-white border-slate-200 hover:border-amber-200"}`}
          >
            <span className="text-amber-600 font-bold text-[10px] mb-1 flex items-center justify-between">
              بانتظار مراجعتك <ListChecks className="w-3.5 h-3.5" />
            </span>
            <span className="text-lg font-black text-amber-700">
              {stats.needsReview}
            </span>
          </button>

          <button
            onClick={() => setActiveFilter("processing")}
            className={`flex flex-col p-3 rounded-xl border transition-all text-right ${activeFilter === "processing" ? "bg-sky-50 border-sky-300 ring-2 ring-sky-100 shadow-sm" : "bg-white border-slate-200 hover:border-sky-200"}`}
          >
            <span className="text-sky-600 font-bold text-[10px] mb-1 flex items-center justify-between">
              جاري قراءتها آلياً <Clock className="w-3.5 h-3.5" />
            </span>
            <span className="text-lg font-black text-sky-700">
              {stats.processing}
            </span>
          </button>

          <button
            onClick={() => setActiveFilter("duplicates")}
            className={`flex flex-col p-3 rounded-xl border transition-all text-right ${activeFilter === "duplicates" ? "bg-orange-50 border-orange-300 ring-2 ring-orange-100 shadow-sm" : "bg-white border-slate-200 hover:border-orange-200"}`}
          >
            <span className="text-orange-600 font-bold text-[10px] mb-1 flex items-center justify-between">
              مشاريع مكررة <FileWarning className="w-3.5 h-3.5" />
            </span>
            <span className="text-lg font-black text-orange-700">
              {stats.duplicates}
            </span>
          </button>

          <button
            onClick={() => setActiveFilter("failed")}
            className={`flex flex-col p-3 rounded-xl border transition-all text-right ${activeFilter === "failed" ? "bg-rose-50 border-rose-300 ring-2 ring-rose-100 shadow-sm" : "bg-white border-slate-200 hover:border-rose-200"}`}
          >
            <span className="text-rose-600 font-bold text-[10px] mb-1 flex items-center justify-between">
              فشل في القراءة <XCircle className="w-3.5 h-3.5" />
            </span>
            <span className="text-lg font-black text-rose-700">
              {stats.failed}
            </span>
          </button>
        </div>

        {/* ======================= شريط البحث السريع ======================= */}
        <div className="bg-white border-b border-slate-200 px-4 py-3 shrink-0 flex items-center justify-between relative z-10">
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              placeholder="ابحث هنا عن (رقم الرخصة، اسم المالك، اسم المشروع...)"
              className="w-full bg-slate-100 border border-transparent rounded-lg pr-9 pl-4 py-2 text-xs font-bold outline-none focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 transition-all"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* زر إلغاء الفلاتر يظهر فقط إذا كان هناك فلتر مفعل */}
          {activeFilter !== "all" && (
            <button
              onClick={() => setActiveFilter("all")}
              className="text-[11px] font-bold text-rose-500 hover:text-rose-700 bg-rose-50 px-3 py-1.5 rounded-lg ml-4"
            >
              إلغاء التصفية ✖
            </button>
          )}
        </div>

        {/* ======================= Data Table ======================= */}
        <div className="flex-1 overflow-auto bg-white relative custom-scrollbar">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full text-indigo-600 bg-slate-50/50">
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
              <span className="text-lg font-black text-slate-700">
                لا توجد ملفات لعرضها هنا!
              </span>
              <p className="text-xs font-bold mt-2 max-w-sm leading-relaxed">
                {activeFilter !== "all" || searchTerm !== ""
                  ? "لا يوجد أي ملف يطابق بحثك أو الفلتر الذي اخترته من الأعلى. جرب إلغاء البحث."
                  : "مكتبة المشاريع فارغة تماماً. يمكنك البدء بإضافة مشاريع جديدة عبر الزر الأزرق بالأعلى."}
              </p>
            </div>
          ) : (
            <table className="w-full text-right text-[11px] font-bold border-collapse whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-600 sticky top-0 z-20 shadow-sm border-b border-slate-200">
                <tr className="divide-x divide-x-reverse divide-slate-200">
                  <th className="px-4 py-3 font-black sticky right-0 bg-slate-50 z-30 w-32 border-l border-slate-200 text-indigo-900">
                    رقم الملف (المرجع)
                  </th>
                  <th className="px-4 py-3 font-black sticky right-[128px] bg-slate-50 z-30 w-64 border-l border-slate-200">
                    اسم المشروع
                  </th>
                  <th className="px-4 py-3 font-black text-slate-500">
                    اسم المالك
                  </th>
                  <th className="px-4 py-3 font-black text-slate-500">
                    الرخصة وتاريخها
                  </th>
                  <th className="px-4 py-3 font-black text-slate-500">
                    الحي والمدينة
                  </th>
                  <th className="px-4 py-3 font-black text-slate-500 text-center">
                    عدد المرفقات
                  </th>
                  <th className="px-4 py-3 font-black text-center w-40 text-slate-800">
                    حالة الملف
                  </th>
                  <th className="px-4 py-3 font-black text-center text-slate-500 w-24">
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
                      className={`cursor-pointer transition-all hover:shadow-md ${isDuplicate ? "bg-orange-50/30 hover:bg-orange-50" : "hover:bg-indigo-50/50"}`}
                    >
                      <td
                        className={`px-4 py-3 sticky right-0 z-10 border-l border-slate-100 ${isDuplicate ? "bg-orange-50/90" : "bg-white"}`}
                      >
                        <span className="font-mono font-black text-xs text-indigo-700 bg-indigo-50 px-2 py-1 rounded-md border border-indigo-100">
                          {project.archiveCode}
                        </span>
                      </td>

                      <td
                        className={`px-4 py-3 sticky right-[128px] z-10 border-l border-slate-100 ${isDuplicate ? "bg-orange-50/90" : "bg-white"}`}
                      >
                        <div className="flex items-center gap-2 max-w-[240px]">
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
                          <Eye className="w-4 h-4 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-indigo-600 shrink-0 transition-opacity" />
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

                      {/* ========================================================= */}
                      {/* 💡 التعديل هنا: لغة تواصل بشرية ومباشرة לחالة الملف */}
                      {/* ========================================================= */}
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
                            className="text-indigo-600 hover:text-indigo-800 flex flex-col items-center gap-1 group"
                            title="افتح للتعديل والمراجعة"
                          >
                            <div className="p-1.5 rounded-lg group-hover:bg-indigo-50">
                              <PenLine className="w-4 h-4" />
                            </div>
                          </button>
                          <button
                            onClick={(e) => handleDelete(project.id, e)}
                            disabled={isDeleting}
                            className="text-rose-500 hover:text-rose-700 flex flex-col items-center gap-1 group disabled:opacity-50"
                            title="حذف الملف نهائياً"
                          >
                            <div className="p-1.5 rounded-lg group-hover:bg-rose-50">
                              <Trash2 className="w-4 h-4" />
                            </div>
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
