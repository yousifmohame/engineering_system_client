import React, { useState, useEffect } from "react";
import {
  FolderArchive,
  RefreshCw,
  TableProperties,
  ArrowDownToLine,
  Plus,
  Brain,
  Search,
  Filter,
  Eye,
  Layers,
  Loader2,
  Trash2,
  PenLine,
  Building2,
  CalendarDays,
  Clock,
  MapPin,
  Scale,
} from "lucide-react";
import axios from "../../api/axios"; // تأكد من مسار axios لديك
import AddReferenceProjectModal from "./models/AddReferenceProjectModal";
import ReferenceDetailsModal from "./ReferenceDetails/ReferenceDetailsModal";

export default function ProjectsArchiveScreen() {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // حالات النوافذ المنبثقة
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  // 1. جلب البيانات من الباك إند
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

  // 2. دالة فتح تفاصيل المشروع (للتعديل أو العرض)
  const openProjectDetails = (id) => {
    setSelectedProjectId(id);
  };

  // 3. دالة الحذف
  const handleDelete = async (id, e) => {
    e.stopPropagation(); // لمنع فتح تفاصيل المشروع عند الضغط على زر الحذف

    if (
      !window.confirm(
        "هل أنت متأكد من حذف هذا المشروع نهائياً من الأرشيف؟ سيتم حذف كافة الملفات المرتبطة به.",
      )
    ) {
      return;
    }

    setIsDeleting(true);
    try {
      await axios.delete(`/archived-projects/${id}`);
      // تحديث القائمة بعد الحذف
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      console.error("Error deleting project:", error);
      alert("حدث خطأ أثناء محاولة الحذف.");
    } finally {
      setIsDeleting(false);
    }
  };

  // 4. دالة مساعدة لحساب عمر المشروع بالأيام
  const getDaysAgo = (dateString) => {
    const createdDate = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(today - createdDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays === 0 ? "اليوم" : `${diffDays} يوم`;
  };

  // تصفية المشاريع بناءً على البحث
  const filteredProjects = projects.filter(
    (p) =>
      (p.title && p.title.includes(searchTerm)) ||
      (p.archiveCode && p.archiveCode.includes(searchTerm)) ||
      (p.client?.name && p.client.name.includes(searchTerm)) ||
      (p.licenseNumber && p.licenseNumber.includes(searchTerm)),
  );

  return (
    <div className="flex-1 block h-full">
      <div className="h-full flex flex-col bg-[#f8fafc] font-sans" dir="rtl">
        {/* ======================= Header ======================= */}
        <div className="bg-white border-b border-slate-200 px-6 py-4 shrink-0 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <h1 className="text-xl font-black text-slate-800 flex items-center gap-3 tracking-tight">
              <div className="p-2.5 bg-gradient-to-br from-indigo-50 to-blue-50 text-indigo-600 rounded-xl border border-indigo-100/50 shadow-sm">
                <FolderArchive className="w-5 h-5" />
              </div>
              أرشيف المشاريع المركزي
            </h1>
            <p className="text-[11px] font-bold text-slate-500 mt-1.5 max-w-xl leading-relaxed">
              شاشة البيانات الكثيفة (Excel-View) المخصصة لاستعراض وإدارة
              المشاريع الهندسية المنتهية والمرجعية، مدعومة بالذكاء الاصطناعي.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* الإحصائيات السريعة */}
            <div className="bg-slate-50 flex items-center gap-4 px-4 py-2 rounded-xl border border-slate-200 ml-2 shadow-sm">
              <div className="flex flex-col text-center">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">
                  إجمالي الأرشيف
                </span>
                <span className="text-sm font-black text-slate-800">
                  {isLoading ? "..." : projects.length}
                </span>
              </div>
              <div className="w-px h-6 bg-slate-200"></div>
              <div className="flex flex-col text-center">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">
                  تم تحليله (AI)
                </span>
                <span className="text-sm font-black text-emerald-600">
                  {isLoading
                    ? "..."
                    : projects.filter(
                        (p) =>
                          p.aiStatus === "completed" ||
                          p.aiStatus === "approved",
                      ).length}
                </span>
              </div>
            </div>

            <button
              onClick={fetchProjects}
              className="p-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm"
              title="تحديث السجلات"
            >
              <RefreshCw
                className={`w-4 h-4 ${isLoading ? "animate-spin text-indigo-600" : ""}`}
              />
            </button>
            <button className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-50 flex items-center gap-2 transition-all shadow-sm">
              <ArrowDownToLine className="w-4 h-4 text-slate-400" /> تصدير
              (Excel)
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-5 py-2.5 bg-indigo-600 text-white font-black text-xs rounded-xl hover:bg-indigo-700 flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(79,70,229,0.25)] hover:shadow-[0_0_20px_rgba(79,70,229,0.4)] active:scale-95"
            >
              <Plus className="w-4 h-4" /> إضافة للأرشيف
            </button>
          </div>
        </div>

        {/* ======================= Toolbar & Filters ======================= */}
        <div className="bg-white border-b border-slate-200 px-4 py-2.5 shrink-0 flex flex-col gap-3 relative z-10">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                placeholder="بحث بالكود، الاسم، الرخصة، أو اسم المالك..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pr-9 pl-4 py-1.5 text-xs font-bold outline-none focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition-all"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-px h-5 bg-slate-200 mx-1"></div>
            <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-600 rounded-lg text-[11px] font-bold hover:bg-slate-100 transition-colors">
              <Filter className="w-3.5 h-3.5 text-slate-400" /> فلاتر متقدمة
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-600 rounded-lg text-[11px] font-bold hover:bg-slate-100 transition-colors">
              <Building2 className="w-3.5 h-3.5 text-slate-400" /> نوع المشروع
            </button>
          </div>
        </div>

        {/* ======================= Data Table (Excel-like) ======================= */}
        <div className="flex-1 overflow-auto bg-white relative custom-scrollbar">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full text-indigo-600 bg-slate-50/50">
              <Loader2 className="w-10 h-10 animate-spin mb-3" />
              <span className="text-sm font-black text-slate-700">
                جاري جلب بيانات الأرشيف...
              </span>
            </div>
          ) : projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 bg-slate-50/50">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <FolderArchive className="w-10 h-10 text-slate-300" />
              </div>
              <span className="text-lg font-black text-slate-600">
                الأرشيف فارغ
              </span>
              <p className="text-xs font-bold mt-2">
                لم يتم إضافة أي مشاريع حتى الآن.
              </p>
            </div>
          ) : (
            <table className="w-full text-right text-[11px] font-bold border-collapse whitespace-nowrap">
              <thead className="bg-slate-50/80 text-slate-600 sticky top-0 z-20 backdrop-blur-md shadow-[0_1px_0_rgba(203,213,225,1)]">
                <tr className="divide-x divide-x-reverse divide-slate-200">
                  {/* Sticky Columns (Right) */}
                  <th className="px-3 py-2.5 font-black text-center w-10 sticky right-0 bg-slate-50/90 z-30 shadow-[1px_0_0_rgba(203,213,225,1)]">
                    <input
                      className="rounded border border-slate-300 accent-indigo-600 cursor-pointer"
                      type="checkbox"
                    />
                  </th>
                  <th className="px-3 py-2.5 font-black sticky right-[40px] bg-slate-50/90 z-30 shadow-[1px_0_0_rgba(203,213,225,1)] w-28 hover:bg-slate-100 cursor-pointer">
                    كود الأرشيف
                  </th>
                  <th className="px-3 py-2.5 font-black sticky right-[152px] bg-slate-50/90 z-30 shadow-[1px_0_0_rgba(203,213,225,1)] w-64 hover:bg-slate-100 cursor-pointer">
                    اسم المشروع
                  </th>

                  {/* Scrollable Columns */}
                  <th className="px-3 py-2.5 font-black hover:bg-slate-100 cursor-pointer text-slate-500">
                    المالك / نوعه
                  </th>
                  <th className="px-3 py-2.5 font-black hover:bg-slate-100 cursor-pointer text-slate-500">
                    نوع المشروع
                  </th>
                  <th className="px-3 py-2.5 font-black hover:bg-slate-100 cursor-pointer text-slate-500">
                    نوع المعاملة
                  </th>
                  <th className="px-3 py-2.5 font-black hover:bg-slate-100 cursor-pointer text-slate-500">
                    الرخصة وتاريخها
                  </th>
                  <th className="px-3 py-2.5 font-black hover:bg-slate-100 cursor-pointer text-slate-500">
                    الصك وتاريخه
                  </th>
                  <th className="px-3 py-2.5 font-black hover:bg-slate-100 cursor-pointer text-slate-500">
                    الحي والمدينة
                  </th>
                  <th className="px-3 py-2.5 font-black hover:bg-slate-100 cursor-pointer text-slate-500">
                    الشارع الرئيسي
                  </th>
                  <th className="px-3 py-2.5 font-black hover:bg-slate-100 cursor-pointer text-slate-500">
                    القطع / المخطط
                  </th>
                  <th className="px-3 py-2.5 font-black hover:bg-slate-100 cursor-pointer text-indigo-600/80">
                    المساحة (م2)
                  </th>
                  <th className="px-3 py-2.5 font-black hover:bg-slate-100 cursor-pointer text-indigo-600/80">
                    الأدوار (فوق/تحت)
                  </th>
                  <th className="px-3 py-2.5 font-black hover:bg-slate-100 cursor-pointer text-slate-500 text-center">
                    الملفات
                  </th>
                  <th className="px-3 py-2.5 font-black hover:bg-slate-100 cursor-pointer text-slate-500">
                    بواسطة
                  </th>
                  <th className="px-3 py-2.5 font-black hover:bg-slate-100 cursor-pointer text-slate-500">
                    تاريخ الأرشفة
                  </th>
                  <th className="px-3 py-2.5 font-black hover:bg-slate-100 cursor-pointer text-center text-blue-600/80 w-24">
                    حالة AI
                  </th>
                  <th className="px-3 py-2.5 font-black text-center text-slate-500 w-24">
                    إجراءات
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredProjects.map((project) => (
                  <tr
                    key={project.id}
                    onClick={() => openProjectDetails(project.id)}
                    className="cursor-pointer transition-colors divide-x divide-x-reverse divide-slate-100 group hover:bg-indigo-50/60"
                  >
                    {/* Sticky Columns (Right) */}
                    <td className="px-3 py-2.5 text-center sticky right-0 bg-white group-hover:bg-indigo-50 shadow-[1px_0_0_rgba(241,245,249,1)] z-10 border-l border-slate-100">
                      <input
                        className="rounded border border-slate-300 accent-indigo-600 cursor-pointer"
                        type="checkbox"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </td>
                    <td className="px-3 py-2.5 sticky right-[40px] bg-white group-hover:bg-indigo-50 shadow-[1px_0_0_rgba(241,245,249,1)] z-10 border-l border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-indigo-700 font-black text-[10px] bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                          {project.archiveCode}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 sticky right-[152px] bg-white group-hover:bg-indigo-50 shadow-[1px_0_0_rgba(241,245,249,1)] z-10 border-l border-slate-100">
                      <div className="flex items-center gap-2 max-w-[240px]">
                        <span
                          className="text-slate-800 font-black truncate"
                          title={project.title}
                        >
                          {project.title}
                        </span>
                        <Eye className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-indigo-600 shrink-0 transition-opacity" />
                      </div>
                    </td>

                    {/* Scrollable Columns */}
                    <td className="px-3 py-2.5">
                      <div className="flex flex-col">
                        <span>
                          {typeof project.client?.name === "object"
                            ? project.client?.name?.ar
                            : project.client?.name || "بدون عميل"}
                        </span>{" "}
                        <span className="text-slate-400 text-[9px]">
                          {project.ownerType || "غير محدد"}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-slate-600">
                      {project.projectType || "-"}
                    </td>
                    <td className="px-3 py-2.5 text-slate-600">
                      {project.transactionType || "-"}
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex flex-col font-mono text-[10px]">
                        <span className="text-emerald-700 font-black">
                          {project.licenseNumber || "بدون رخصة"}
                        </span>
                        <span className="text-slate-400">
                          {project.licenseIssueDate
                            ? new Date(
                                project.licenseIssueDate,
                              ).toLocaleDateString("en-GB")
                            : "-"}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex flex-col font-mono text-[10px]">
                        <span className="text-amber-700 font-black">
                          {project.deedNumber || "بدون صك"}
                        </span>
                        <span className="text-slate-400">
                          {project.deedDate
                            ? new Date(project.deedDate).toLocaleDateString(
                                "en-GB",
                              )
                            : "-"}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex flex-col">
                        <span className="text-slate-700 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />{" "}
                          {project.district?.name || "-"}
                        </span>
                        <span className="text-slate-400 text-[9px]">
                          {project.city || "الرياض"}
                        </span>
                      </div>
                    </td>
                    <td
                      className="px-3 py-2.5 text-slate-600 truncate max-w-[120px]"
                      title={project.mainStreet}
                    >
                      {project.mainStreet || "-"}
                    </td>
                    <td className="px-3 py-2.5 font-mono text-slate-600">
                      {project.plots?.length > 0
                        ? project.plots.join(", ")
                        : "-"}
                      <span className="text-slate-300 mx-1">|</span>
                      <span className="text-slate-400 text-[9px]">
                        م: {project.planNumber || "-"}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="bg-indigo-50 text-indigo-700 font-black font-mono px-2 py-0.5 rounded border border-indigo-100">
                        {project.totalArea
                          ? project.totalArea.toLocaleString()
                          : "-"}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 font-mono text-slate-600 text-center">
                      <span className="text-emerald-600">
                        {project.floorsAbove || 0}
                      </span>
                      <span className="text-slate-300 mx-1">/</span>
                      <span className="text-rose-600">
                        {project.floorsBelow || 0}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <span className="inline-flex items-center justify-center bg-white text-slate-600 px-2 py-1 rounded-lg text-[10px] border border-slate-200 shadow-sm hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors">
                        <Layers className="w-3.5 h-3.5 mr-1.5 text-slate-400" />{" "}
                        {project._count?.files || 0}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-slate-600 flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[8px] text-slate-600 font-black">
                        {project.archivedBy?.name?.charAt(0) || "س"}
                      </div>
                      <span className="truncate max-w-[80px]">
                        {project.archivedBy?.name || "النظام"}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex flex-col font-mono text-[10px]">
                        <span className="text-slate-700 flex items-center gap-1">
                          <CalendarDays className="w-3 h-3 text-slate-400" />{" "}
                          {new Date(project.createdAt).toLocaleDateString(
                            "en-GB",
                          )}
                        </span>
                        <span className="text-slate-400 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" /> منذ{" "}
                          {getDaysAgo(project.createdAt)}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <span
                        className={`inline-flex items-center justify-center px-2 py-1 rounded-lg text-[9px] border font-black w-16 shadow-sm ${
                          project.aiStatus === "completed" ||
                          project.aiStatus === "approved"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : project.aiStatus === "failed"
                              ? "bg-rose-50 text-rose-700 border-rose-200"
                              : "bg-amber-50 text-amber-700 border-amber-200 animate-pulse"
                        }`}
                      >
                        {project.aiStatus === "completed"
                          ? "تم التحليل"
                          : project.aiStatus === "approved"
                            ? "معتمد"
                            : project.aiStatus === "failed"
                              ? "فشل"
                              : "قيد المعالجة"}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openProjectDetails(project.id);
                          }}
                          className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors tooltip-trigger"
                          title="تعديل"
                        >
                          <PenLine className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => handleDelete(project.id, e)}
                          disabled={isDeleting}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-md transition-colors tooltip-trigger disabled:opacity-50"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* المودال الخاص بإضافة مشروع جديد (بما في ذلك التحليل) */}
      {isAddModalOpen && (
        <AddReferenceProjectModal
          isOpen={isAddModalOpen}
          onClose={() => {
            setIsAddModalOpen(false);
            fetchProjects(); // تحديث الجدول بعد الإضافة
          }}
        />
      )}

      {/* المودال الخاص بعرض وتعديل تفاصيل المشروع */}
      {/* استخدمنا العرض الشرطي هنا (!!selectedProjectId &&) لتدمير النافذة عند الإغلاق وبنائها من الصفر عند الفتح */}
      {!!selectedProjectId && (
        <ReferenceDetailsModal
          projectId={selectedProjectId}
          isOpen={!!selectedProjectId}
          onClose={() => {
            setSelectedProjectId(null);
            fetchProjects(); // تحديث في حال قام المستخدم بتعديل البيانات داخل التفاصيل
          }}
        />
      )}
    </div>
  );
}
