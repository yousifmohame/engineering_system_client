import React, { useState } from "react";
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
} from "lucide-react";

import AddReferenceProjectModal from "./models/AddReferenceProjectModal";
// ==========================================
// بيانات تجريبية (Mock Data) مطابقة للتصميم
// ==========================================
const mockProjects = [
  {
    id: 1,
    code: "ARC-2023-001",
    name: "تصميم فندق المشرق",
    tags: ["مرجع قوي", "مرجع تجاري", "به ملفات قوية"],
    status: "نشط",
    statusColor: "sky",
    privacy: "عادي",
    privacyColor: "slate",
    ownerName: "شركة الفنادق العربية",
    ownerType: "اعتباري (شركة)",
    designerOffice: "مكتب العمارة المتقدمة للاستشارات",
    supervisorOffice: "شركة الإشراف الهندسي المحدودة",
    transactionType: "رخصة بناء جديدة",
    licenseNo: "1444001290",
    licenseYear: "1444",
    district: "العليا",
    sector: "شمال الرياض",
    street: "شارع العليا العام",
    width: "40م",
    landArea: "2500 م2",
    plotsCount: "1",
    aboveGnd: "8",
    belowGnd: "2",
    mainUse: "تجاري",
    subUse: "فندقي",
    serviceNo: "S-77012",
    serviceYear: "2023",
    filesCount: 14,
    date: "2023-05-12",
    time: "14:30",
    uploader: "فهد العتيبي",
    age: 345,
    aiStatus: "مكتمل",
  },
  {
    id: 2,
    code: "ARC-2024-002",
    name: "مقر الإدارة العامة (مشروع وزاري)",
    tags: ["مشروع وزاري", "مرجع تجاري", "مشابه متكرر الاستخدام"],
    status: "نشط",
    statusColor: "sky",
    privacy: "داخلي",
    privacyColor: "amber",
    ownerName: "وزارة الموارد",
    ownerType: "حكومي",
    designerOffice: "مكتب الإبداع المعماري",
    supervisorOffice: "(نفسه للإشراف)",
    transactionType: "مخططات تنفيذية",
    licenseNo: "",
    licenseYear: "",
    district: "الصحافة",
    sector: "شمال الرياض",
    street: "طريق الملك فهد",
    width: "80م",
    landArea: "7000 م2",
    plotsCount: "1",
    aboveGnd: "12",
    belowGnd: "3",
    mainUse: "حكومي",
    subUse: "مكاتب",
    serviceNo: "S-88123",
    serviceYear: "2024",
    filesCount: 45,
    date: "2024-01-10",
    time: "11:00",
    uploader: "سعد العبدالله",
    age: 45,
    aiStatus: "مكتمل",
  },
];

export default function ProjectsArchiveScreen() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  return (
    <div className="flex-1 block h-full">
      <div className="h-full flex flex-col bg-slate-50 font-sans" dir="rtl">
        {/* ======================= Header ======================= */}
        <div className="bg-white border-b border-slate-200 px-6 py-4 shrink-0 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <h1 className="text-xl font-black text-slate-800 flex items-center gap-3">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <FolderArchive className="w-6 h-6" />
              </div>
              أرشيف المشاريع (المرجع المركزي)
            </h1>
            <p className="text-xs font-bold text-slate-500 mt-1 max-w-xl">
              شاشة بحثية كثيفة (Excel-like) مصممة لاستعراض قواعد بيانات المشاريع
              المنتهية والمرجعية للبحث عن التشابهات أو استدعاء ملفات.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="bg-slate-100 flex items-center gap-4 px-4 py-2 rounded-xl border border-slate-200 ml-4">
              <div className="flex flex-col text-center">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  إجمالي المشاريع
                </span>
                <span className="text-sm font-black text-slate-800">
                  14,204
                </span>
              </div>
              <div className="w-px h-6 bg-slate-300"></div>
              <div className="flex flex-col text-center">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  محلل ذكياً
                </span>
                <span className="text-sm font-black text-emerald-600">
                  8,102
                </span>
              </div>
            </div>

            <button
              className="p-2.5 bg-white border border-slate-300 text-slate-600 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-colors"
              title="تحديث السجلات"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              className="p-2.5 bg-white border border-slate-300 text-slate-600 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-colors"
              title="التحكم بالجدول والأعمدة"
            >
              <TableProperties className="w-4 h-4" />
            </button>
            <button className="px-4 py-2.5 bg-white border border-slate-300 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-50 flex items-center gap-2 transition-colors">
              <ArrowDownToLine className="w-4 h-4" /> تصدير (Excel)
            </button>
            <button className="px-4 py-2.5 bg-indigo-50 border border-indigo-200 text-indigo-700 font-black text-xs rounded-xl hover:bg-indigo-100 flex items-center gap-2 transition-colors">
              <FolderArchive className="w-4 h-4" /> مستعرض الملفات
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2.5 bg-indigo-600 text-white font-black text-xs rounded-xl hover:bg-indigo-700 flex items-center gap-2 transition-colors shadow-[0_0_15px_rgba(79,70,229,0.3)]"
            >
              <Plus className="w-4 h-4" /> مشروع جديد
            </button>
          </div>
        </div>

        {/* ======================= Toolbar & Filters ======================= */}
        <div className="bg-white border-b border-slate-200 px-4 py-2 shrink-0 flex flex-col gap-3 relative z-10">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3 bg-slate-100 p-1 rounded-xl">
              <button className="px-4 py-1.5 rounded-lg text-xs font-black transition-all bg-white shadow-sm text-slate-800">
                بحث عادي
              </button>
              <button className="px-4 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 text-slate-500 hover:text-indigo-600">
                <Brain className="w-4 h-4" /> بحث ذكي سردي
              </button>
            </div>
            <label className="flex items-center gap-2 cursor-pointer text-[10px] font-bold text-slate-500 bg-slate-50 py-1 px-2 rounded-lg border border-slate-200">
              <input
                className="rounded text-rose-500 focus:ring-rose-500"
                type="checkbox"
              />
              محاكاة صلاحية (مشاهدة المشاريع السرية)
            </label>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                placeholder="بحث بالكود، الاسم، الرخصة، العميل..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pr-9 pl-4 py-1.5 text-xs font-bold outline-none focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-px h-5 bg-slate-200 mx-1"></div>

            <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-600 rounded-lg text-[11px] font-bold hover:bg-slate-100 transition-colors">
              <Filter className="w-3.5 h-3.5" /> فلاتر إضافية
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-600 rounded-lg text-[11px] font-bold hover:bg-slate-100 transition-colors">
              المكتب المصمم{" "}
              <span className="text-[9px] bg-slate-200 px-1.5 rounded text-slate-500">
                الكل
              </span>
            </button>
            <button className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-600 rounded-lg text-[11px] font-bold hover:bg-slate-100 transition-colors">
              الحي{" "}
              <span className="text-[9px] bg-slate-200 px-1.5 rounded text-slate-500">
                الكل
              </span>
            </button>
            <button className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-600 rounded-lg text-[11px] font-bold hover:bg-slate-100 transition-colors">
              الاستعمال{" "}
              <span className="text-[9px] bg-slate-200 px-1.5 rounded text-slate-500">
                الكل
              </span>
            </button>
            <button className="hidden xl:flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-lg text-[11px] font-bold hover:bg-indigo-100 transition-colors">
              التصنيفات (Tags){" "}
              <span className="text-[9px] bg-white text-indigo-500 border border-indigo-200 px-1.5 rounded">
                الكل
              </span>
            </button>

            <div className="flex-1"></div>
            <span className="text-[10px] font-bold text-slate-400">
              إظهار 1 إلى 50 من أصل 14,204
            </span>
          </div>
        </div>

        {/* ======================= Table Data ======================= */}
        <div className="flex-1 overflow-auto bg-white relative">
          <table className="w-full text-right text-[11px] font-bold border-collapse whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-600 sticky top-0 z-20 shadow-[0_1px_0_rgba(203,213,225,1)]">
              <tr className="divide-x divide-x-reverse divide-slate-200">
                <th className="px-3 py-2.5 font-black text-center w-10 sticky right-0 bg-slate-50 z-30 shadow-[1px_0_0_rgba(203,213,225,1)]">
                  <input
                    className="rounded border border-slate-300 accent-indigo-600 cursor-pointer"
                    type="checkbox"
                  />
                </th>
                <th className="px-3 py-2.5 font-black sticky right-10 bg-slate-50 z-30 shadow-[1px_0_0_rgba(203,213,225,1)] w-28 hover:bg-slate-100 cursor-pointer">
                  كود المشروع
                </th>
                <th className="px-3 py-2.5 font-black hover:bg-slate-100 cursor-pointer w-64">
                  اسم المشروع
                </th>
                <th className="px-3 py-2.5 font-black hover:bg-slate-100 cursor-pointer text-slate-400">
                  تصنيفات (Tags)
                </th>
                <th className="px-3 py-2.5 font-black hover:bg-slate-100 cursor-pointer text-center w-24">
                  الحالة
                </th>
                <th className="px-3 py-2.5 font-black hover:bg-slate-100 cursor-pointer text-center w-24">
                  السرية
                </th>
                <th className="px-3 py-2.5 font-black hover:bg-slate-100 cursor-pointer text-slate-400">
                  اسم المالك
                </th>
                <th className="px-3 py-2.5 font-black hover:bg-slate-100 cursor-pointer text-slate-400">
                  المكتب المصمم
                </th>
                <th className="px-3 py-2.5 font-black hover:bg-slate-100 cursor-pointer text-slate-400">
                  المكتب المشرف
                </th>
                <th className="px-3 py-2.5 font-black hover:bg-slate-100 cursor-pointer text-indigo-600/70">
                  ت. المعاملة
                </th>
                <th className="px-3 py-2.5 font-black hover:bg-slate-100 cursor-pointer text-emerald-600/70">
                  رقم الرخصة / السنة
                </th>
                <th className="px-3 py-2.5 font-black hover:bg-slate-100 cursor-pointer text-slate-400">
                  الحي
                </th>
                <th className="px-3 py-2.5 font-black hover:bg-slate-100 cursor-pointer text-slate-400">
                  القطاع
                </th>
                <th className="px-3 py-2.5 font-black hover:bg-slate-100 cursor-pointer text-slate-400">
                  اسم الشارع
                </th>
                <th className="px-3 py-2.5 font-black hover:bg-slate-100 cursor-pointer text-slate-400">
                  العرض
                </th>
                <th className="px-3 py-2.5 font-black hover:bg-slate-100 cursor-pointer text-slate-400">
                  م. الأرض
                </th>
                <th className="px-3 py-2.5 font-black hover:bg-slate-100 cursor-pointer text-slate-400">
                  عدد القطع
                </th>
                <th className="px-3 py-2.5 font-black hover:bg-slate-100 cursor-pointer text-slate-400">
                  فوق الأرض
                </th>
                <th className="px-3 py-2.5 font-black hover:bg-slate-100 cursor-pointer text-slate-400">
                  تحت الأرض
                </th>
                <th className="px-3 py-2.5 font-black hover:bg-slate-100 cursor-pointer text-slate-400">
                  استعمال رئيسي
                </th>
                <th className="px-3 py-2.5 font-black hover:bg-slate-100 cursor-pointer text-slate-400">
                  فرعي
                </th>
                <th className="px-3 py-2.5 font-black hover:bg-slate-100 cursor-pointer text-slate-400">
                  رقم الخدمة
                </th>
                <th className="px-3 py-2.5 font-black hover:bg-slate-100 cursor-pointer text-slate-400 text-center">
                  الملفات
                </th>
                <th className="px-3 py-2.5 font-black hover:bg-slate-100 cursor-pointer text-amber-600/70">
                  تاريخ الإضافة / الوقت
                </th>
                <th className="px-3 py-2.5 font-black hover:bg-slate-100 cursor-pointer text-slate-400">
                  الرافع
                </th>
                <th className="px-3 py-2.5 font-black hover:bg-slate-100 cursor-pointer text-slate-400 text-center">
                  عمر (أيام)
                </th>
                <th className="px-3 py-2.5 font-black hover:bg-slate-100 cursor-pointer text-center text-blue-600/70 w-24">
                  حالة AI
                </th>
                <th className="px-3 py-2.5 font-black text-center text-slate-400 w-28">
                  إجراءات
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {/* Data Rows */}
              {mockProjects.map((project) => (
                <tr
                  key={project.id}
                  className="cursor-pointer transition-colors divide-x divide-x-reverse divide-slate-100 group hover:bg-indigo-50/50"
                >
                  <td className="px-3 py-2 text-center sticky right-0 bg-white group-hover:bg-indigo-50 shadow-[1px_0_0_rgba(241,245,249,1)] z-10">
                    <input
                      className="rounded border border-slate-300 accent-indigo-600 cursor-pointer"
                      type="checkbox"
                    />
                  </td>
                  <td className="px-3 py-2 sticky right-10 bg-white group-hover:bg-indigo-50 shadow-[1px_0_0_rgba(241,245,249,1)] z-10">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-indigo-700 font-black">
                        {project.code}
                      </span>
                      <button
                        className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-indigo-600 tooltip-trigger"
                        title="فتح نافذة التفاصيل"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                  <td
                    className="px-3 py-2 text-slate-800 break-words max-w-[250px] truncate"
                    title={project.name}
                  >
                    {project.name}
                  </td>
                  <td
                    className="px-3 py-2 max-w-[150px] truncate"
                    title={project.tags.join(", ")}
                  >
                    <div className="flex bg-slate-50 gap-1 flex-wrap overflow-hidden h-4">
                      {project.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-[8px] whitespace-nowrap bg-indigo-50 text-indigo-700 px-1 py-0.5 rounded border border-indigo-100"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <span
                      className={`inline-flex items-center justify-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-${project.statusColor}-50 text-${project.statusColor}-600 border border-${project.statusColor}-100`}
                    >
                      {project.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <span
                      className={`inline-flex items-center justify-center px-1.5 py-0.5 rounded text-[9px] font-bold gap-1 border bg-${project.privacyColor}-50 text-${project.privacyColor}-${project.privacyColor === "slate" ? "500" : "600"} border-${project.privacyColor}-100`}
                    >
                      {project.privacy}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex flex-col">
                      <span className="text-slate-600 truncate max-w-[120px]">
                        {project.ownerName}
                      </span>
                      <span className="text-slate-400 text-[9px]">
                        {project.ownerType}
                      </span>
                    </div>
                  </td>
                  <td
                    className="px-3 py-2 text-purple-700 truncate max-w-[120px]"
                    title={project.designerOffice}
                  >
                    {project.designerOffice}
                  </td>
                  <td
                    className="px-3 py-2 text-slate-500 text-[10px] truncate max-w-[120px]"
                    title={project.supervisorOffice}
                  >
                    {project.supervisorOffice}
                  </td>
                  <td className="px-3 py-2 text-slate-600">
                    {project.transactionType}
                  </td>
                  <td className="px-3 py-2 font-mono text-emerald-700">
                    {project.licenseNo}{" "}
                    <span className="text-slate-300">/</span>{" "}
                    {project.licenseYear}
                  </td>
                  <td className="px-3 py-2 text-slate-600">
                    {project.district}
                  </td>
                  <td className="px-3 py-2 text-slate-500">{project.sector}</td>
                  <td
                    className="px-3 py-2 text-slate-600 truncate max-w-[120px]"
                    title={project.street}
                  >
                    {project.street}
                  </td>
                  <td className="px-3 py-2 text-slate-500">{project.width}</td>
                  <td className="px-3 py-2 text-slate-600">
                    {project.landArea}
                  </td>
                  <td className="px-3 py-2 text-slate-500 text-center">
                    {project.plotsCount}
                  </td>
                  <td className="px-3 py-2 text-slate-500 text-center">
                    {project.aboveGnd}
                  </td>
                  <td className="px-3 py-2 text-slate-500 text-center">
                    {project.belowGnd}
                  </td>
                  <td className="px-3 py-2 text-slate-600">
                    {project.mainUse}
                  </td>
                  <td className="px-3 py-2 text-slate-500">{project.subUse}</td>
                  <td className="px-3 py-2 font-mono text-slate-500">
                    {project.serviceNo}{" "}
                    <span className="text-slate-300">/</span>{" "}
                    {project.serviceYear}
                  </td>
                  <td className="px-3 py-2 text-center">
                    <span className="inline-flex items-center justify-center bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[10px] border border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors cursor-pointer">
                      <Layers className="w-3 h-3 mr-1" /> {project.filesCount}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-amber-700 font-mono text-[10px]">
                    {project.date} <span className="text-slate-400">|</span>{" "}
                    {project.time}
                  </td>
                  <td className="px-3 py-2 text-slate-500">
                    {project.uploader}
                  </td>
                  <td className="px-3 py-2 text-center font-mono text-slate-400">
                    {project.age}
                  </td>
                  <td className="px-3 py-2 text-center">
                    <span className="inline-flex items-center justify-center bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded text-[9px] border border-emerald-100 w-16 font-bold cursor-pointer hover:bg-emerald-100">
                      {project.aiStatus}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <button className="bg-indigo-50 text-indigo-700 border border-indigo-100 hover:bg-indigo-600 hover:text-white px-2 py-1.5 rounded text-[9px] font-black tracking-wide transition-all disabled:opacity-50 flex items-center gap-1 mx-auto">
                      <Brain className="w-3 h-3" /> تحليل الملفات
                    </button>
                  </td>
                </tr>
              ))}

              {/* Empty Space filler rows */}
              {[...Array(15)].map((_, idx) => (
                <tr
                  key={`empty-${idx}`}
                  className="divide-x divide-x-reverse divide-slate-100"
                >
                  <td className="px-3 py-4 text-center sticky right-0 bg-white z-10 shadow-[1px_0_0_rgba(241,245,249,1)]"></td>
                  <td className="px-3 py-4 sticky right-10 bg-white z-10 shadow-[1px_0_0_rgba(241,245,249,1)]"></td>
                  {[...Array(26)].map((__, colIdx) => (
                    <td key={`col-${colIdx}`} className="px-3 py-4"></td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <AddReferenceProjectModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
}
