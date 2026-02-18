import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getDocumentTypes,
  createDocumentType,
} from "../../api/documentTypeApi";
import {
  FileText,
  Shield,
  PanelsTopLeft,
  SquarePen,
  FileCheck,
  TestTube,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  X,
  Save,
  Loader2,
} from "lucide-react";
import { toast } from "sonner"; // للتنبيهات

// --- مكونات مساعدة (Badges) ---
const ExtensionBadge = ({ ext }) => {
  const colors = {
    PDF: "bg-red-50 text-red-700 border-red-200",
    JPG: "bg-blue-50 text-blue-700 border-blue-200",
    PNG: "bg-purple-50 text-purple-700 border-purple-200",
    DWG: "bg-yellow-50 text-yellow-700 border-yellow-200",
    XLSX: "bg-green-50 text-green-700 border-green-200",
  };
  return (
    <span
      className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${colors[ext] || "bg-stone-100 text-stone-700"}`}
    >
      {ext}
    </span>
  );
};

const ClassificationBadge = ({ type }) => {
  const styles = {
    فني: "bg-cyan-100 text-cyan-900",
    مالي: "bg-amber-100 text-amber-900",
    إداري: "bg-purple-100 text-purple-900",
    قانوني: "bg-rose-100 text-rose-900",
    عام: "bg-stone-100 text-stone-700",
  };
  return (
    <span
      className={`px-2 py-1 rounded text-[10px] font-bold ${styles[type] || styles["عام"]}`}
    >
      {type}
    </span>
  );
};

// --- نافذة إضافة نوع جديد (Modal) ---
// --- نافذة إضافة نوع جديد (Modal) ---
const CreateDocTypeModal = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();

  // قمنا بإزالة حقل 'code' من الحالة الأولية
  const [formData, setFormData] = useState({
    name: "",
    nameEn: "",
    classification: "عام",
    maxSizeMB: 5,
    requiresSignature: false,
    confidentiality: "General",
    allowMultiple: false,
    status: "Active",
  });

  const mutation = useMutation({
    mutationFn: createDocumentType,
    onSuccess: () => {
      toast.success("تم إضافة نوع المستند بنجاح");
      queryClient.invalidateQueries(["documentTypes"]);
      // تصفير النموذج
      setFormData({
        name: "",
        nameEn: "",
        classification: "عام",
        maxSizeMB: 5,
        requiresSignature: false,
        confidentiality: "General",
        allowMultiple: false,
        status: "Active",
      });
      onClose();
    },
    onError: (err) => {
      // عرض رسالة الخطأ القادمة من السيرفر
      toast.error(
        "فشل الإضافة: " + (err.response?.data?.message || err.message),
      );
    },
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border-b border-blue-100 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-bold text-blue-900">إضافة نوع مستند جديد</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/50 rounded-full text-stone-500 hover:text-red-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* رسالة توضيحية للكود */}
          <div className="bg-blue-50 p-3 rounded text-xs text-blue-800 flex items-center gap-2 mb-2">
            <span className="font-bold">ملاحظة:</span>
            سيتم توليد كود النوع (مثل DOC-005) تلقائياً بواسطة النظام.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* تم حذف حقل إدخال الكود من هنا */}

            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-600">
                التصنيف
              </label>
              <select
                className="w-full p-2 border rounded text-sm focus:border-blue-500 outline-none"
                value={formData.classification}
                onChange={(e) =>
                  setFormData({ ...formData, classification: e.target.value })
                }
              >
                <option value="عام">عام</option>
                <option value="فني">فني</option>
                <option value="مالي">مالي</option>
                <option value="قانوني">قانوني</option>
                <option value="إداري">إداري</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-600">
                الاسم (عربي) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="اسم المستند"
                className="w-full p-2 border rounded text-sm focus:border-blue-500 outline-none"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-600">
                الاسم (إنجليزي)
              </label>
              <input
                type="text"
                placeholder="Document Name"
                className="w-full p-2 border rounded text-sm focus:border-blue-500 outline-none dir-ltr"
                value={formData.nameEn}
                onChange={(e) =>
                  setFormData({ ...formData, nameEn: e.target.value })
                }
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-600">
                الحد الأقصى (MB)
              </label>
              <input
                type="number"
                className="w-full p-2 border rounded text-sm"
                value={formData.maxSizeMB}
                onChange={(e) =>
                  setFormData({ ...formData, maxSizeMB: e.target.value })
                }
              />
            </div>
          </div>

          <hr className="border-stone-100" />

          {/* الخصائص */}
          <h4 className="text-xs font-bold text-blue-800 mb-2">
            إعدادات الأمان والحالة
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-600">
                مستوى السرية
              </label>
              <select
                className="w-full p-2 border rounded text-sm"
                value={formData.confidentiality}
                onChange={(e) =>
                  setFormData({ ...formData, confidentiality: e.target.value })
                }
              >
                <option value="General">عام</option>
                <option value="Confidential">سري</option>
                <option value="TopSecret">سري للغاية</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-600">الحالة</label>
              <select
                className="w-full p-2 border rounded text-sm"
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
              >
                <option value="Active">نشط</option>
                <option value="Inactive">معطل</option>
              </select>
            </div>
          </div>

          {/* خيارات التفعيل */}
          <div className="flex gap-4 pt-2">
            <label className="flex items-center gap-2 cursor-pointer bg-stone-50 p-2 rounded border border-stone-200 flex-1 hover:bg-stone-100">
              <input
                type="checkbox"
                className="w-4 h-4 text-blue-600 rounded"
                checked={formData.requiresSignature}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    requiresSignature: e.target.checked,
                  })
                }
              />
              <span className="text-xs font-bold text-stone-700">
                يتطلب توقيع رقمي؟
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer bg-stone-50 p-2 rounded border border-stone-200 flex-1 hover:bg-stone-100">
              <input
                type="checkbox"
                className="w-4 h-4 text-blue-600 rounded"
                checked={formData.allowMultiple}
                onChange={(e) =>
                  setFormData({ ...formData, allowMultiple: e.target.checked })
                }
              />
              <span className="text-xs font-bold text-stone-700">
                السماح بتكرار الملف؟
              </span>
            </label>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-stone-600 bg-white border border-stone-300 rounded hover:bg-stone-100"
          >
            إلغاء
          </button>
          {/* شرط التفعيل: الاسم فقط مطلوب، الكود يتم توليده */}
          <button
            onClick={() => mutation.mutate(formData)}
            disabled={mutation.isPending || !formData.name}
            className="px-6 py-2 text-xs font-bold text-white bg-blue-600 rounded hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
          >
            {mutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            حفظ النوع
          </button>
        </div>
      </div>
    </div>
  );
};

// --- الشاشة الرئيسية ---
const Screen942_DocumentTypes = () => {
  const [activeTab, setActiveTab] = useState("types");
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false); // State للتحكم في النافذة

  // جلب البيانات من السيرفر
  const { data: documentTypes, isLoading } = useQuery({
    queryKey: ["documentTypes", search],
    queryFn: () => getDocumentTypes(search),
  });

  // --- Navbar Tabs ---
  const tabs = [
    {
      id: "types",
      label: "أنواع المستندات المرتبطة بالمعاملة",
      icon: FileText,
    },
    { id: "digital", label: "التوثيق الرقمي", icon: Shield },
    { id: "riyadh", label: "قطاعات وأحياء الرياض", icon: PanelsTopLeft },
    { id: "builder", label: "بناء القوالب", icon: SquarePen },
    { id: "center", label: "مركز القوالب", icon: FileCheck },
    { id: "engine", label: "محرك القوالب", icon: TestTube },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      {/* 1. Header */}
      <div className="flex items-start justify-between gap-3 p-3 bg-gradient-to-l from-blue-50 to-purple-50 border-b-2 border-blue-300 mb-3">
        <div className="flex items-start gap-2">
          <div className="inline-flex items-center justify-center min-w-[48px] h-8 bg-blue-700 text-white text-sm font-bold rounded px-2 border-2 border-blue-800">
            942
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-blue-900">
                المستندات والقوالب
              </h1>
            </div>
            <p className="text-xs text-stone-600 mt-0.5">
              Documents & Templates Configuration Center
            </p>
          </div>
        </div>
      </div>

      {/* 2. Navbar */}
      <div className="px-3 mb-3">
        <div className="bg-white border-2 border-stone-300 rounded-lg overflow-hidden">
          <div className="flex items-center overflow-x-auto custom-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-4 transition-all whitespace-nowrap 
                  ${
                    activeTab === tab.id
                      ? "bg-blue-50 border-blue-600 text-blue-900"
                      : "bg-white border-transparent text-stone-700 hover:bg-stone-50"
                  }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Main Content Area */}
      <div className="flex-1 px-3 pb-3 overflow-hidden flex flex-col">
        {activeTab === "types" && (
          <div className="flex flex-col h-full space-y-3">
            {/* Status Bar */}
            <div className="bg-green-50 border-2 border-green-300 rounded p-2 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <p className="text-xs font-bold text-green-900">
                ✅ النظام نشط: 942-01 - دليل المستندات متصل بالقاعدة
              </p>
            </div>

            {/* Toolbar */}
            <div className="bg-white border-2 border-stone-300 rounded-lg p-3 flex items-center gap-3">
              <div className="flex-1 relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  placeholder="بحث برقم النوع، الاسم، التصنيف..."
                  className="w-full pr-10 pl-3 py-2 border border-stone-300 rounded text-sm focus:border-blue-500 outline-none"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <button className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded hover:bg-blue-700 shadow-sm">
                <Filter className="w-4 h-4" />
              </button>

              {/* ✅ زر إضافة نوع جديد يعمل الآن */}
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded hover:bg-green-700 flex items-center gap-2 shadow-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
                نوع جديد
              </button>
            </div>

            {/* The Table */}
            <div className="bg-white border-2 border-stone-300 rounded-lg overflow-hidden flex-1 relative">
              <div className="absolute inset-0 overflow-auto">
                <table className="w-full text-xs text-right">
                  <thead className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white sticky top-0 z-10">
                    <tr>
                      <th className="px-3 py-3 font-bold">كود النوع</th>
                      <th className="px-3 py-3 font-bold">الاسم</th>
                      <th className="px-3 py-3 font-bold text-center">
                        التصنيف
                      </th>
                      <th className="px-3 py-3 font-bold text-center">
                        الامتدادات المسموحة
                      </th>
                      <th className="px-3 py-3 font-bold text-center">
                        الحد الأقصى
                      </th>
                      <th className="px-3 py-3 font-bold text-center">
                        يتطلب توقيع؟
                      </th>
                      <th className="px-3 py-3 font-bold text-center">
                        السرية
                      </th>
                      <th className="px-3 py-3 font-bold text-center">
                        نسخ متعددة؟
                      </th>
                      <th className="px-3 py-3 font-bold text-center">
                        الحالة
                      </th>
                      <th className="px-3 py-3 font-bold text-center">
                        إجراءات
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200">
                    {isLoading ? (
                      <tr>
                        <td colSpan="10" className="p-10 text-center">
                          جاري التحميل...
                        </td>
                      </tr>
                    ) : documentTypes?.length === 0 ? (
                      <tr>
                        <td
                          colSpan="10"
                          className="p-10 text-center text-stone-400"
                        >
                          لا توجد أنواع مستندات
                        </td>
                      </tr>
                    ) : (
                      documentTypes?.map((doc) => (
                        <tr
                          key={doc.id}
                          className="hover:bg-blue-50 transition-colors"
                        >
                          <td className="px-3 py-2">
                            <span className="font-mono font-bold text-blue-700">
                              {doc.code}
                            </span>
                          </td>
                          <td className="px-3 py-2">
                            <div>
                              <p className="font-bold text-stone-800">
                                {doc.name}
                              </p>
                              <p className="text-[10px] text-stone-500 font-mono">
                                {doc.nameEn || "-"}
                              </p>
                            </div>
                          </td>
                          <td className="px-3 py-2 text-center">
                            <ClassificationBadge type={doc.classification} />
                          </td>
                          <td className="px-3 py-2 text-center">
                            <div className="flex items-center justify-center gap-1 flex-wrap max-w-[120px] mx-auto">
                              {doc.allowedExtensions?.map((ext) => (
                                <ExtensionBadge key={ext} ext={ext} />
                              ))}
                            </div>
                          </td>
                          <td className="px-3 py-2 text-center font-bold text-stone-600">
                            {doc.maxSizeMB} MB
                          </td>
                          <td className="px-3 py-2 text-center">
                            {doc.requiresSignature ? (
                              <span className="text-green-600 font-bold flex items-center justify-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> نعم
                              </span>
                            ) : (
                              <span className="text-stone-400 flex items-center justify-center gap-1">
                                <XCircle className="w-3 h-3" /> لا
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-2 text-center">
                            <span
                              className={`px-2 py-1 rounded text-[10px] font-bold ${
                                doc.confidentiality === "TopSecret"
                                  ? "bg-red-100 text-red-900"
                                  : doc.confidentiality === "Confidential"
                                    ? "bg-amber-100 text-amber-900"
                                    : "bg-green-100 text-green-900"
                              }`}
                            >
                              {doc.confidentiality === "General"
                                ? "عام"
                                : doc.confidentiality === "TopSecret"
                                  ? "سري للغاية"
                                  : "سري"}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-center">
                            {doc.allowMultiple ? (
                              <span className="text-blue-600 font-bold">
                                ✓ نعم
                              </span>
                            ) : (
                              <span className="text-stone-400">✗ لا</span>
                            )}
                          </td>
                          <td className="px-3 py-2 text-center">
                            <span
                              className={`px-2 py-1 rounded text-[10px] font-bold ${doc.status === "Active" ? "bg-emerald-100 text-emerald-800" : "bg-stone-100 text-stone-500"}`}
                            >
                              {doc.status === "Active" ? "نشط" : "معطل"}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button className="p-1.5 hover:bg-blue-100 text-blue-600 rounded transition-colors">
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button className="p-1.5 hover:bg-green-100 text-green-600 rounded transition-colors">
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button className="p-1.5 hover:bg-red-100 text-red-600 rounded transition-colors">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Placeholder Content */}
        {activeTab !== "types" && (
          <div className="flex flex-col items-center justify-center h-full bg-white border-2 border-stone-300 rounded-lg border-dashed">
            <div className="p-6 bg-stone-50 rounded-full mb-4">
              {tabs.find((t) => t.id === activeTab)?.icon &&
                React.createElement(tabs.find((t) => t.id === activeTab).icon, {
                  className: "w-10 h-10 text-stone-400",
                })}
            </div>
            <h2 className="text-xl font-bold text-stone-500">
              {tabs.find((t) => t.id === activeTab)?.label}
            </h2>
            <p className="text-sm text-stone-400 mt-2">
              هذه الوحدة قيد التطوير...
            </p>
          </div>
        )}
      </div>

      {/* ✅ النافذة المنبثقة */}
      <CreateDocTypeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default Screen942_DocumentTypes;
