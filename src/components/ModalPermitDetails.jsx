import React, { useState, useMemo, useRef } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import api from "../api/axios";
import { toast } from "sonner";
import {
  X,
  FileText,
  Edit3,
  Layers,
  MapPin,
  History,
  BarChart3,
  QrCode,
  Eye,
  FileDown,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Minus,
  Save,
  Loader2,
  Plus,
  Trash2,
  CloudUpload,
  Brain,
  Cpu,
  Copy,
  Link,
  Briefcase,
  User,
  Building,
  FileSignature,
} from "lucide-react";

// ==========================================
// 💡 دوال مساعدة
// ==========================================
const copyToClipboard = (text) => {
  if (!text) return toast.error("الحقل فارغ لا يوجد شيء لنسخه!");
  navigator.clipboard.writeText(text);
  toast.success("تم النسخ بنجاح! 📋");
};

// دالة لتصحيح رابط الملف (أضف رابط السيرفر إذا كان المسار نسبياً)
// دالة لتصحيح الرابط وإجباره على المرور عبر الـ API
const getFullUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  
  // 💡 الخدعة هنا: إضافة /api قبل /uploads لكي يمر الطلب من Nginx إلى الباك إند مباشرة
  let fixedUrl = url;
  if (url.startsWith("/uploads/")) {
    fixedUrl = `/api${url}`;
  }

  // استخدم الـ IP الخاص بك
  const baseUrl = "http://95.216.73.243";
  return `${baseUrl}${fixedUrl}`;
};

// ==========================================
// 💡 مكونات Badges المساعدة
// ==========================================
function AiBadge({ status }) {
  if (!status || status === "غير مطبق")
    return <span className="text-[10px] text-slate-400 font-bold">—</span>;
  const config = {
    "تم التحليل": {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-200",
      icon: <CheckCircle2 size={10} />,
    },
    "يحتاج مراجعة": {
      bg: "bg-amber-50",
      text: "text-amber-700",
      border: "border-amber-200",
      icon: <AlertTriangle size={10} />,
    },
    "فشل التحليل": {
      bg: "bg-red-50",
      text: "text-red-700",
      border: "border-red-200",
      icon: <XCircle size={10} />,
    },
  }[status] || {
    bg: "bg-slate-50",
    text: "text-slate-500",
    border: "border-slate-200",
    icon: <Minus size={10} />,
  };

  return (
    <span
      className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] border ${config.bg} ${config.text} ${config.border}`}
    >
      {config.icon} {status}
    </span>
  );
}

function FormBadge({ form }) {
  const config = {
    يدوي: { bg: "bg-slate-100", text: "text-slate-600" },
    أصفر: { bg: "bg-yellow-50", text: "text-yellow-700" },
    أخضر: { bg: "bg-green-50", text: "text-green-700" },
  }[form] || { bg: "bg-gray-100", text: "text-gray-600" };
  return (
    <span
      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${config.bg} ${config.text}`}
    >
      {form || "—"}
    </span>
  );
}

// ==========================================
// 💡 التبويبات (Tabs Content)
// ==========================================

// ─── 1. تاب المستند ───
function TabDocument({ permit }) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newFile, setNewFile] = useState(null);

  const fileUrl = getFullUrl(permit?.attachmentUrl);

  // 💡 الحل الذكي: التحقق من الامتداد، وإذا لم يوجد امتداد نعتبره PDF كافتراضي
  const isImage = fileUrl?.match(/\.(jpeg|jpg|png|gif|webp)$/i) != null;
  const isPdf =
    fileUrl?.toLowerCase().endsWith(".pdf") || (fileUrl && !isImage);

  const uploadMutation = useMutation({
    mutationFn: async (file) => {
      const fd = new FormData();
      fd.append("file", file);
      return await api.put(`/permits/${permit.id}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: () => {
      toast.success("تم تحديث مستند الرخصة بنجاح");
      queryClient.invalidateQueries(["building-permits"]);
      setIsEditing(false);
      setNewFile(null);
    },
    onError: () => toast.error("حدث خطأ أثناء رفع المستند"),
  });

  const handleSave = () => {
    if (!newFile) return toast.error("يرجى اختيار ملف أولاً");
    uploadMutation.mutate(newFile);
  };

  return (
    <div className="space-y-4 p-4 animate-in fade-in">
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-black text-slate-700">
          مستند الرخصة
        </span>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="text-[10px] font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 flex items-center gap-1 transition-colors"
          >
            <Edit3 size={12} /> تحديث المرفق
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => {
                setIsEditing(false);
                setNewFile(null);
              }}
              className="text-[10px] font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg hover:bg-slate-200"
            >
              إلغاء
            </button>
            <button
              onClick={handleSave}
              disabled={uploadMutation.isPending || !newFile}
              className="text-[10px] font-bold text-white bg-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-700 flex items-center gap-1 disabled:opacity-50"
            >
              {uploadMutation.isPending ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Save size={12} />
              )}{" "}
              حفظ المستند
            </button>
          </div>
        )}
      </div>

      {isEditing ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-blue-300 rounded-xl bg-blue-50/50 h-64 flex flex-col items-center justify-center text-blue-500 cursor-pointer hover:bg-blue-50 transition-colors"
        >
          <CloudUpload size={32} className="mb-2" />
          <span className="text-sm font-bold">
            {newFile ? newFile.name : "اضغط لاختيار ملف PDF أو صورة"}
          </span>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={(e) => setNewFile(e.target.files[0])}
          />
        </div>
      ) : (
        <div className="border border-slate-200 rounded-xl bg-slate-50 h-[400px] flex flex-col items-center justify-center text-slate-400 relative overflow-hidden">
          {fileUrl ? (
            isPdf ? (
              <iframe
                src={fileUrl}
                className="w-full h-full rounded-xl"
                title="Permit Document"
              />
            ) : (
              <img
                src={fileUrl}
                alt="رخصة"
                className="w-full h-full object-contain"
              />
            )
          ) : (
            <>
              <FileText size={40} className="mb-2 opacity-50" />
              <span className="text-xs font-bold">المستند غير متوفر</span>
            </>
          )}
        </div>
      )}

      {!isEditing && fileUrl && (
        <div className="flex gap-2">
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-[11px] font-bold bg-blue-600 text-white rounded-lg py-2.5 hover:bg-blue-700 flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Eye size={14} /> عرض المستند كامل
          </a>
          <a
            href={fileUrl}
            download
            className="flex-1 text-[11px] font-bold bg-slate-100 text-slate-600 rounded-lg py-2.5 hover:bg-slate-200 flex items-center justify-center gap-1.5 shadow-sm"
          >
            <FileDown size={14} /> تحميل المرفق
          </a>
        </div>
      )}
    </div>
  );
}

// ─── 2. تاب البيانات المستخرجة ───
function TabExtractedData({ permit }) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...permit });

  const updateMutation = useMutation({
    mutationFn: async (data) => await api.put(`/permits/${permit.id}`, data),
    onSuccess: () => {
      toast.success("تم تحديث البيانات بنجاح");
      queryClient.invalidateQueries(["building-permits"]);
      setIsEditing(false);
    },
    onError: () => toast.error("حدث خطأ أثناء تحديث البيانات"),
  });

  const fields = [
    { key: "permitNumber", label: "رقم الرخصة" },
    { key: "year", label: "سنة الرخصة" },
    { key: "type", label: "نوع الرخصة" },
    { key: "ownerName", label: "اسم المالك" },
    { key: "idNumber", label: "رقم الهوية" },
    { key: "district", label: "الحي" },
    { key: "sector", label: "القطاع" },
    { key: "plotNumber", label: "رقم القطعة" },
    { key: "planNumber", label: "رقم المخطط" },
    { key: "mainUsage", label: "التصنيف الرئيسي (الاستخدام)" },
    { key: "subUsage", label: "التصنيف الفرعي" },
    { key: "landArea", label: "مساحة الأرض", type: "number" },
    { key: "engineeringOffice", label: "المكتب الهندسي" },
  ];

  return (
    <div className="space-y-4 p-4 animate-in fade-in">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <span className="text-[12px] font-black text-slate-700">
          البيانات الأساسية المستخرجة
        </span>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="text-[10px] font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 flex items-center gap-1 transition-colors"
          >
            <Edit3 size={12} /> تعديل البيانات
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => {
                setIsEditing(false);
                setFormData({ ...permit });
              }}
              className="text-[10px] font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg hover:bg-slate-200"
            >
              إلغاء
            </button>
            <button
              onClick={() => updateMutation.mutate(formData)}
              disabled={updateMutation.isPending}
              className="text-[10px] font-bold text-white bg-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-700 flex items-center gap-1 disabled:opacity-50"
            >
              {updateMutation.isPending ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Save size={12} />
              )}{" "}
              حفظ التعديلات
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
        {fields.map((f) => (
          <div key={f.key} className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-500 flex items-center justify-between">
              {f.label}
              {!isEditing && (
                <button
                  onClick={() => copyToClipboard(formData[f.key])}
                  className="text-slate-400 hover:text-blue-600"
                  title="نسخ"
                >
                  <Copy size={10} />
                </button>
              )}
            </span>
            {isEditing ? (
              <input
                type={f.type || "text"}
                value={formData[f.key] || ""}
                onChange={(e) =>
                  setFormData({ ...formData, [f.key]: e.target.value })
                }
                className="w-full text-[11px] font-bold border border-slate-300 rounded-md px-2 py-1.5 bg-white text-slate-800 outline-none focus:ring-1 focus:ring-blue-500"
              />
            ) : (
              <span className="text-[11px] font-bold text-slate-800 bg-slate-50 px-2 py-1.5 rounded-md border border-slate-100 min-h-[28px] flex items-center">
                {formData[f.key] || "—"}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 3. تاب المكونات ───
function TabComponents({ permit }) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [components, setComponents] = useState(() => {
    try {
      return permit.componentsData ? JSON.parse(permit.componentsData) : [];
    } catch {
      return [];
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (data) =>
      await api.put(`/permits/${permit.id}`, {
        componentsData: JSON.stringify(data),
      }),
    onSuccess: () => {
      toast.success("تم تحديث جدول المكونات");
      queryClient.invalidateQueries(["building-permits"]);
      setIsEditing(false);
    },
  });

  const addRow = () =>
    setComponents([
      ...components,
      { name: "", usage: "", area: "", units: "" },
    ]);
  const removeRow = (idx) =>
    setComponents(components.filter((_, i) => i !== idx));
  const updateRow = (idx, field, val) => {
    const newComp = [...components];
    newComp[idx][field] = val;
    setComponents(newComp);
  };

  return (
    <div className="p-4 animate-in fade-in space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <span className="text-[12px] font-black text-slate-700">
          مكونات المبنى
        </span>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="text-[10px] font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 flex items-center gap-1 transition-colors"
          >
            <Edit3 size={12} /> تعديل المكونات
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(false)}
              className="text-[10px] font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg hover:bg-slate-200"
            >
              إلغاء
            </button>
            <button
              onClick={() => updateMutation.mutate(components)}
              disabled={updateMutation.isPending}
              className="text-[10px] font-bold text-white bg-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-700 flex items-center gap-1"
            >
              {updateMutation.isPending ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Save size={12} />
              )}{" "}
              حفظ المكونات
            </button>
          </div>
        )}
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full text-[11px] text-right">
          <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
            <tr>
              <th className="px-3 py-2 w-1/3">المكون</th>
              <th className="px-3 py-2 w-1/4">الاستخدام</th>
              <th className="px-3 py-2 w-1/4">المساحة م²</th>
              <th className="px-3 py-2 w-1/6">عدد الوحدات</th>
              {isEditing && <th className="px-3 py-2 w-10 text-center">حذف</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {components.length === 0 && !isEditing && (
              <tr>
                <td colSpan="5" className="p-4 text-center text-slate-400">
                  لا توجد مكونات مضافة
                </td>
              </tr>
            )}
            {components.map((c, i) => (
              <tr key={i} className="hover:bg-slate-50 transition-colors">
                <td className="px-3 py-2">
                  {isEditing ? (
                    <input
                      type="text"
                      value={c.name}
                      onChange={(e) => updateRow(i, "name", e.target.value)}
                      className="w-full border border-slate-200 rounded px-2 py-1 outline-none focus:border-blue-400"
                    />
                  ) : (
                    <span className="font-bold text-slate-700">{c.name}</span>
                  )}
                </td>
                <td className="px-3 py-2">
                  {isEditing ? (
                    <input
                      type="text"
                      value={c.usage}
                      onChange={(e) => updateRow(i, "usage", e.target.value)}
                      className="w-full border border-slate-200 rounded px-2 py-1 outline-none focus:border-blue-400"
                    />
                  ) : (
                    <span className="font-bold text-slate-600">{c.usage}</span>
                  )}
                </td>
                <td className="px-3 py-2">
                  {isEditing ? (
                    <input
                      type="number"
                      value={c.area}
                      onChange={(e) => updateRow(i, "area", e.target.value)}
                      className="w-full border border-slate-200 rounded px-2 py-1 outline-none focus:border-blue-400"
                    />
                  ) : (
                    <span className="font-bold text-slate-600">{c.area}</span>
                  )}
                </td>
                <td className="px-3 py-2">
                  {isEditing ? (
                    <input
                      type="number"
                      value={c.units}
                      onChange={(e) => updateRow(i, "units", e.target.value)}
                      className="w-full border border-slate-200 rounded px-2 py-1 outline-none focus:border-blue-400"
                    />
                  ) : (
                    <span className="font-bold text-slate-600">{c.units}</span>
                  )}
                </td>
                {isEditing && (
                  <td className="px-3 py-2 text-center">
                    <button
                      onClick={() => removeRow(i)}
                      className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isEditing && (
        <button
          onClick={addRow}
          className="w-full mt-3 py-2 bg-slate-50 border border-dashed border-slate-300 text-slate-500 rounded-lg hover:bg-slate-100 hover:text-slate-700 flex items-center justify-center gap-1 text-[11px] font-bold transition-colors"
        >
          <Plus size={14} /> إضافة مكون جديد
        </button>
      )}
    </div>
  );
}

// ─── 4. تاب الحدود ───
function TabBoundaries({ permit }) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [boundaries, setBoundaries] = useState(() => {
    try {
      return permit.boundariesData
        ? JSON.parse(permit.boundariesData)
        : [
            { direction: "شمال", length: "", neighbor: "" },
            { direction: "جنوب", length: "", neighbor: "" },
            { direction: "شرق", length: "", neighbor: "" },
            { direction: "غرب", length: "", neighbor: "" },
          ];
    } catch {
      return [];
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (data) =>
      await api.put(`/permits/${permit.id}`, {
        boundariesData: JSON.stringify(data),
      }),
    onSuccess: () => {
      toast.success("تم تحديث حدود الأرض");
      queryClient.invalidateQueries(["building-permits"]);
      setIsEditing(false);
    },
  });

  const updateRow = (idx, field, val) => {
    const newB = [...boundaries];
    newB[idx][field] = val;
    setBoundaries(newB);
  };

  return (
    <div className="p-4 animate-in fade-in space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <span className="text-[12px] font-black text-slate-700">
          حدود وأبعاد الأرض
        </span>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="text-[10px] font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 flex items-center gap-1 transition-colors"
          >
            <Edit3 size={12} /> تعديل الحدود
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(false)}
              className="text-[10px] font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg hover:bg-slate-200"
            >
              إلغاء
            </button>
            <button
              onClick={() => updateMutation.mutate(boundaries)}
              disabled={updateMutation.isPending}
              className="text-[10px] font-bold text-white bg-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-700 flex items-center gap-1"
            >
              {updateMutation.isPending ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Save size={12} />
              )}{" "}
              حفظ
            </button>
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200">
        <table className="w-full text-[11px] text-right">
          <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
            <tr>
              <th className="px-3 py-2 w-20">الاتجاه</th>
              <th className="px-3 py-2 w-24">الطول (م)</th>
              <th className="px-3 py-2">يحدها</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {boundaries.map((b, i) => (
              <tr
                key={i}
                className="hover:bg-slate-50 transition-colors font-bold"
              >
                <td className="px-3 py-2 text-slate-700">{b.direction}</td>
                <td className="px-3 py-2">
                  {isEditing ? (
                    <input
                      type="number"
                      value={b.length}
                      onChange={(e) => updateRow(i, "length", e.target.value)}
                      className="w-full border border-slate-200 rounded px-2 py-1 outline-none focus:border-blue-400"
                    />
                  ) : (
                    <span className="text-slate-600">{b.length || "—"}</span>
                  )}
                </td>
                <td className="px-3 py-2">
                  {isEditing ? (
                    <input
                      type="text"
                      value={b.neighbor}
                      onChange={(e) => updateRow(i, "neighbor", e.target.value)}
                      className="w-full border border-slate-200 rounded px-2 py-1 outline-none focus:border-blue-400"
                    />
                  ) : (
                    <span className="text-slate-600">{b.neighbor || "—"}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── 5. تاب تقرير AI ───
function TabAiReport({ permit }) {
  if (permit?.source !== "رفع يدوي (AI)") {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-slate-400 p-4 text-center">
        <AlertTriangle size={40} className="mb-3 opacity-30" />
        <span className="text-sm font-bold text-slate-500">
          لا يوجد تقرير ذكاء اصطناعي
        </span>
        <span className="text-[10px] mt-1">
          هذه الرخصة لم يتم إدخالها أو معالجتها عبر الأرشفة الذكية.
        </span>
      </div>
    );
  }

  // محاولة استخراج التقرير المفصل إن وجد (قد يكون محفوظاً في الملاحظات أو حقل منفصل)
  const detailedReport =
    permit?.detailedReport ||
    "تم استخراج البيانات الأساسية بنجاح ولكن لم يتم توليد تقرير مفصل لهذه الرخصة.";

  return (
    <div className="space-y-4 p-4 animate-in fade-in">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
        <Brain size={16} className="text-purple-600" />
        <span className="text-[12px] font-black text-slate-700">
          تقرير التحليل الشامل بالذكاء الاصطناعي
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* ملخص الإحصائيات (الثلث الأول) */}
        <div className="border border-purple-100 rounded-xl p-4 bg-purple-50/50 space-y-3 text-[11px] font-bold shadow-sm h-fit">
          <div className="flex justify-between items-center">
            <span className="text-purple-600">حالة التحليل</span>
            <AiBadge status={permit?.aiStatus} />
          </div>
          <div className="w-full bg-purple-100 rounded-full h-2 mt-2">
            <div
              className="bg-purple-500 h-2 rounded-full transition-all"
              style={{
                width: permit?.aiStatus === "تم التحليل" ? "95%" : "60%",
              }}
            />
          </div>
          <div className="flex justify-between pt-2 border-t border-purple-100">
            <span className="text-slate-500">المودل المستخدم</span>
            <span className="text-slate-700">GPT-4o Vision</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">الدقة المتوقعة</span>
            <span className="text-emerald-600">98%</span>
          </div>
        </div>

        {/* التقرير النصي المفصل (الثلثين) */}
        <div className="lg:col-span-2 border border-slate-200 rounded-xl p-5 bg-white shadow-sm">
          <h4 className="text-[12px] font-black text-slate-800 mb-3 flex items-center gap-2">
            <FileText size={14} className="text-blue-500" /> الملخص الهندسي
            للرخصة
            <button
              onClick={() => copyToClipboard(detailedReport)}
              className="text-slate-400 hover:text-blue-600 mr-auto"
            >
              <Copy size={12} />
            </button>
          </h4>
          <p className="text-[12px] leading-loose text-slate-600 font-semibold text-justify whitespace-pre-wrap">
            {detailedReport}
          </p>
        </div>
      </div>
    </div>
  );
}
// ─── 6. التاب الجديد: المعاملات والارتباطات ───
function TabLinkedRecords({ permit }) {
  const queryClient = useQueryClient();
  const [linkingMode, setLinkingMode] = useState(null); // 'transaction', 'ownership', 'client', 'office', 'privateTransaction'
  const [selectedValue, setSelectedValue] = useState("");

  // 💡 حالة محلية (Local State) لتحديث الواجهة فوراً
  const [localLinks, setLocalLinks] = useState({
    linkedClientId: permit.linkedClientId || null,
    linkedOfficeId: permit.linkedOfficeId || null,
    linkedOwnershipId: permit.linkedOwnershipId || null,
    linkedTransactionId: permit.linkedTransactionId || null, // 👈 إضافة حقل المعاملة المرتبطة يدوياً
  });

  // 1. جلب الارتباط التلقائي (المعاملات بناءً على رقم وسنة الرخصة)
  const { data: autoLinkedTransactions = [], isLoading: loadingAuto } =
    useQuery({
      queryKey: ["linked-transactions", permit.permitNumber, permit.year],
      queryFn: async () => {
        const res = await api.get(
          `/private-transactions?permitNumber=${permit.permitNumber}&year=${permit.year}`,
        );
        return res.data?.data || [];
      },
      enabled: !!permit.permitNumber && !!permit.year,
    });

  // 2. جلب قوائم البيانات للربط اليدوي
  const { data: clients = [] } = useQuery({
    queryKey: ["clients-simple"],
    queryFn: async () => (await api.get("/clients/simple")).data || [],
  });

  const { data: offices = [] } = useQuery({
    queryKey: ["offices-list"],
    queryFn: async () =>
      (await api.get("/intermediary-offices")).data?.data || [],
  });

  const { data: ownerships = [] } = useQuery({
    queryKey: ["properties-list"],
    queryFn: async () => (await api.get("/properties")).data?.data || [],
  });

  // 💡 جلب المعاملات الفرعية للربط اليدوي
  const { data: privateTransactions = [] } = useQuery({
    queryKey: ["private-transactions-list"],
    queryFn: async () =>
      (await api.get("/private-transactions")).data?.data || [],
  });

  // 3. دالة الحفظ (Mutation) للربط اليدوي وفك الربط
  const linkMutation = useMutation({
    mutationFn: async (payload) =>
      await api.put(`/permits/${permit.id}`, payload),
    onSuccess: (data, variables) => {
      toast.success("تم تحديث الارتباط بنجاح!");
      queryClient.invalidateQueries(["building-permits"]);

      // تحديث الواجهة فوراً
      setLocalLinks((prev) => ({ ...prev, ...variables }));

      setLinkingMode(null);
      setSelectedValue("");
    },
    onError: () => toast.error("حدث خطأ أثناء الربط"),
  });

  const handleSaveLink = () => {
    if (!selectedValue) return toast.error("يرجى اختيار السجل من القائمة");

    const payload = {};
    if (linkingMode === "client") payload.linkedClientId = selectedValue;
    if (linkingMode === "office") payload.linkedOfficeId = selectedValue;
    if (linkingMode === "ownership") payload.linkedOwnershipId = selectedValue;
    if (linkingMode === "privateTransaction")
      payload.linkedTransactionId = selectedValue; // 💡 ربط المعاملة الفرعية مفعل

    linkMutation.mutate(payload);
  };

  const handleUnlink = (field) => {
    linkMutation.mutate({ [field]: null });
  };

  return (
    <div className="p-4 animate-in fade-in space-y-6">
      {/* ================================== */}
      {/* القسم الأول: الارتباط التلقائي (Auto) */}
      {/* ================================== */}
      <div className="space-y-3">
        <h4 className="text-[12px] font-black text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
          <FileSignature size={14} className="text-blue-500" /> المعاملات
          المرتبطة تلقائياً (نفس رقم الرخصة)
        </h4>

        {loadingAuto ? (
          <div className="flex items-center justify-center p-6 text-blue-500">
            <Loader2 className="animate-spin w-6 h-6" />
          </div>
        ) : autoLinkedTransactions.length > 0 ? (
          <div className="grid grid-cols-1 gap-3">
            {autoLinkedTransactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-3 border border-slate-200 rounded-lg bg-white shadow-sm hover:border-blue-300 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
                    <FileSignature size={16} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">
                      معاملة رقم: {tx.ref || tx.id}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      {tx.status || "نشطة"} • {tx.clientName || tx.client}
                    </div>
                  </div>
                </div>
                <button className="text-[10px] font-bold text-blue-600 hover:underline bg-blue-50 px-3 py-1.5 rounded-lg">
                  عرض المعاملة
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-6 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-slate-400">
            <span className="text-[11px] font-bold">
              لم يتم العثور على أي معاملات تحمل نفس رقم وسنة الرخصة بالنظام.
            </span>
          </div>
        )}
      </div>

      {/* ================================== */}
      {/* القسم الثاني: الربط اليدوي (Manual) */}
      {/* ================================== */}
      <div className="space-y-3">
        <h4 className="text-[12px] font-black text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2 mt-4">
          <Link size={14} className="text-emerald-500" /> ربط يدوي بالسجلات
        </h4>

        {/* عرض السجلات المرتبطة يدوياً */}
        <div className="flex flex-col gap-2 mb-4">
          {localLinks.linkedClientId && (
            <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg animate-in fade-in">
              <span className="text-[11px] font-bold text-emerald-800 flex items-center gap-2">
                <User size={14} /> مرتبط بعميل:{" "}
                {clients.find((c) => c.id === localLinks.linkedClientId)
                  ?.name || "معرف العميل"}
              </span>
              <button
                onClick={() => handleUnlink("linkedClientId")}
                disabled={linkMutation.isPending}
                className="text-[10px] font-bold text-red-500 hover:underline disabled:opacity-50"
              >
                فك الربط
              </button>
            </div>
          )}
          {localLinks.linkedOfficeId && (
            <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg animate-in fade-in">
              <span className="text-[11px] font-bold text-emerald-800 flex items-center gap-2">
                <Briefcase size={14} /> مرتبط بمكتب:{" "}
                {offices.find((o) => o.id === localLinks.linkedOfficeId)
                  ?.nameAr || "معرف المكتب"}
              </span>
              <button
                onClick={() => handleUnlink("linkedOfficeId")}
                disabled={linkMutation.isPending}
                className="text-[10px] font-bold text-red-500 hover:underline disabled:opacity-50"
              >
                فك الربط
              </button>
            </div>
          )}
          {localLinks.linkedOwnershipId && (
            <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg animate-in fade-in">
              <span className="text-[11px] font-bold text-emerald-800 flex items-center gap-2">
                <Building size={14} /> مرتبط بملكية (صك رقم):{" "}
                {ownerships.find((o) => o.id === localLinks.linkedOwnershipId)
                  ?.deedNumber || "معرف الملكية"}
              </span>
              <button
                onClick={() => handleUnlink("linkedOwnershipId")}
                disabled={linkMutation.isPending}
                className="text-[10px] font-bold text-red-500 hover:underline disabled:opacity-50"
              >
                فك الربط
              </button>
            </div>
          )}
          {localLinks.linkedTransactionId && (
            <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg animate-in fade-in">
              <span className="text-[11px] font-bold text-emerald-800 flex items-center gap-2">
                <FileSignature size={14} /> مرتبط بمعاملة فرعية:{" "}
                {privateTransactions.find(
                  (t) => t.id === localLinks.linkedTransactionId,
                )?.ref || "معرف المعاملة"}
              </span>
              <button
                onClick={() => handleUnlink("linkedTransactionId")}
                disabled={linkMutation.isPending}
                className="text-[10px] font-bold text-red-500 hover:underline disabled:opacity-50"
              >
                فك الربط
              </button>
            </div>
          )}
        </div>

        {/* أزرار الربط */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {/* 1. زر ربط العميل */}
          {linkingMode === "client" ? (
            <div className="col-span-2 md:col-span-5 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-2 animate-in fade-in">
              <select
                className="flex-1 text-[11px] font-bold border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-blue-400"
                onChange={(e) => setSelectedValue(e.target.value)}
                value={selectedValue}
              >
                <option value="">اختر العميل...</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <button
                onClick={handleSaveLink}
                disabled={linkMutation.isPending}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-[11px] font-bold hover:bg-blue-700"
              >
                حفظ
              </button>
              <button
                onClick={() => setLinkingMode(null)}
                className="bg-white text-slate-500 border border-slate-300 px-4 py-2 rounded-lg text-[11px] font-bold hover:bg-slate-100"
              >
                إلغاء
              </button>
            </div>
          ) : (
            !localLinks.linkedClientId && (
              <button
                onClick={() => {
                  setLinkingMode("client");
                  setSelectedValue("");
                }}
                className="flex flex-col items-center justify-center gap-2 p-4 bg-white border border-slate-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-colors group"
              >
                <User className="w-6 h-6 text-slate-400 group-hover:text-blue-500" />
                <span className="text-[11px] font-bold text-slate-600 group-hover:text-blue-700 text-center">
                  ربط بعميل
                </span>
              </button>
            )
          )}

          {/* 2. زر ربط المكتب */}
          {linkingMode === "office" ? (
            <div className="col-span-2 md:col-span-5 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-2 animate-in fade-in">
              <select
                className="flex-1 text-[11px] font-bold border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-blue-400"
                onChange={(e) => setSelectedValue(e.target.value)}
                value={selectedValue}
              >
                <option value="">اختر المكتب الهندسي...</option>
                {offices.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.nameAr || o.name}
                  </option>
                ))}
              </select>
              <button
                onClick={handleSaveLink}
                disabled={linkMutation.isPending}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-[11px] font-bold hover:bg-blue-700"
              >
                حفظ
              </button>
              <button
                onClick={() => setLinkingMode(null)}
                className="bg-white text-slate-500 border border-slate-300 px-4 py-2 rounded-lg text-[11px] font-bold hover:bg-slate-100"
              >
                إلغاء
              </button>
            </div>
          ) : (
            !localLinks.linkedOfficeId && (
              <button
                onClick={() => {
                  setLinkingMode("office");
                  setSelectedValue("");
                }}
                className="flex flex-col items-center justify-center gap-2 p-4 bg-white border border-slate-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-colors group"
              >
                <Briefcase className="w-6 h-6 text-slate-400 group-hover:text-blue-500" />
                <span className="text-[11px] font-bold text-slate-600 group-hover:text-blue-700 text-center">
                  ربط بوسيط
                </span>
              </button>
            )
          )}

          {/* 3. زر ربط الملكية */}
          {linkingMode === "ownership" ? (
            <div className="col-span-2 md:col-span-5 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-2 animate-in fade-in">
              <select
                className="flex-1 text-[11px] font-bold border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-blue-400"
                onChange={(e) => setSelectedValue(e.target.value)}
                value={selectedValue}
              >
                <option value="">اختر ملف الملكية (الصك)...</option>
                {ownerships.map((o) => (
                  <option key={o.id} value={o.id}>
                    صك رقم: {o.deedNumber || o.id}
                  </option>
                ))}
              </select>
              <button
                onClick={handleSaveLink}
                disabled={linkMutation.isPending}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-[11px] font-bold hover:bg-blue-700"
              >
                حفظ
              </button>
              <button
                onClick={() => setLinkingMode(null)}
                className="bg-white text-slate-500 border border-slate-300 px-4 py-2 rounded-lg text-[11px] font-bold hover:bg-slate-100"
              >
                إلغاء
              </button>
            </div>
          ) : (
            !localLinks.linkedOwnershipId && (
              <button
                onClick={() => {
                  setLinkingMode("ownership");
                  setSelectedValue("");
                }}
                className="flex flex-col items-center justify-center gap-2 p-4 bg-white border border-slate-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-colors group"
              >
                <Building className="w-6 h-6 text-slate-400 group-hover:text-blue-500" />
                <span className="text-[11px] font-bold text-slate-600 group-hover:text-blue-700 text-center">
                  ربط بملكية
                </span>
              </button>
            )
          )}

          {/* 4. 💡 زر ربط معاملة نظام فرعي (فعّال) */}
          {linkingMode === "privateTransaction" ? (
            <div className="col-span-2 md:col-span-5 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-2 animate-in fade-in">
              <select
                className="flex-1 text-[11px] font-bold border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-blue-400"
                onChange={(e) => setSelectedValue(e.target.value)}
                value={selectedValue}
              >
                <option value="">اختر المعاملة الفرعية...</option>
                {privateTransactions.map((t) => (
                  <option key={t.id} value={t.id}>
                    رقم: {t.ref || t.id} - {t.client}
                  </option>
                ))}
              </select>
              <button
                onClick={handleSaveLink}
                disabled={linkMutation.isPending}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-[11px] font-bold hover:bg-blue-700"
              >
                حفظ
              </button>
              <button
                onClick={() => setLinkingMode(null)}
                className="bg-white text-slate-500 border border-slate-300 px-4 py-2 rounded-lg text-[11px] font-bold hover:bg-slate-100"
              >
                إلغاء
              </button>
            </div>
          ) : (
            !localLinks.linkedTransactionId && (
              <button
                onClick={() => {
                  setLinkingMode("privateTransaction");
                  setSelectedValue("");
                }}
                className="flex flex-col items-center justify-center gap-2 p-4 bg-white border border-slate-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-colors group"
              >
                <FileSignature className="w-6 h-6 text-slate-400 group-hover:text-blue-500" />
                <span className="text-[11px] font-bold text-slate-600 group-hover:text-blue-700 text-center">
                  ربط معامله النظام فرعي
                </span>
              </button>
            )
          )}

          {/* 5. 💡 زر ربط معاملة نظام رئيسي (مغلق مؤقتاً Placeholder) */}
          <button className="flex flex-col items-center justify-center gap-2 p-4 bg-slate-50 border border-slate-200 rounded-xl opacity-60 cursor-not-allowed">
            <FileSignature className="w-6 h-6 text-slate-400" />
            <span className="text-[11px] font-bold text-slate-600 text-center">
              ربط معامله النظام رئيسي (قريباً)
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 💡 المكون الرئيسي للنافذة (Modal) المجمع
// ==========================================
export function ModalPermitDetails({ permit, onClose }) {
  const [activeTab, setActiveTab] = useState(0);
  const tabs = [
    { label: "المستند", icon: <FileText size={12} /> },
    { label: "البيانات", icon: <Edit3 size={12} /> },
    { label: "المكونات", icon: <Layers size={12} /> },
    { label: "الحدود", icon: <MapPin size={12} /> },
    { label: "المعاملات والارتباطات", icon: <Link size={12} /> }, // 👈 التاب الجديد
    { label: "تقرير AI", icon: <Brain size={12} /> },
  ];

  if (!permit) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4 animate-in fade-in"
      dir="rtl"
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl flex flex-col overflow-hidden max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg shadow-sm">
              <FileText size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                رخصة رقم {permit.permitNumber || "—"}
                <AiBadge status={permit.aiStatus} />
              </h2>
              <p className="text-[11px] font-bold text-slate-500 mt-0.5">
                تفاصيل، مكونات، ومرفقات الرخصة
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-white hover:bg-red-50 hover:text-red-500 rounded-xl transition-colors border border-slate-200 text-slate-400 shadow-sm"
          >
            <X size={18} />
          </button>
        </div>

        {/* Quick Info Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-6 py-4 bg-white border-b border-slate-100 text-[11px] shrink-0">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col justify-between group">
            <span className="text-slate-400 font-bold mb-1 flex justify-between items-center">
              المالك
              <button
                onClick={() => copyToClipboard(permit.ownerName)}
                className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-blue-600 transition-all"
              >
                <Copy size={10} />
              </button>
            </span>
            <span className="text-slate-800 font-bold truncate text-sm">
              {permit.ownerName || "—"}
            </span>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col justify-between group">
            <span className="text-slate-400 font-bold mb-1 flex justify-between items-center">
              الهوية
              <button
                onClick={() => copyToClipboard(permit.idNumber)}
                className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-blue-600 transition-all"
              >
                <Copy size={10} />
              </button>
            </span>
            <span className="text-slate-800 font-mono font-bold text-sm">
              {permit.idNumber || "—"}
            </span>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col justify-between group">
            <span className="text-slate-400 font-bold mb-1 flex justify-between items-center">
              الحي / القطاع
            </span>
            <span className="text-slate-800 font-bold truncate text-sm">
              {permit.district || "—"} - {permit.sector || "—"}
            </span>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <span className="text-slate-400 font-bold block mb-1">
              شكل ومصدر الرخصة
            </span>
            <div className="flex items-center gap-1 mt-1">
              <FormBadge form={permit.form} />
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                {permit.source}
              </span>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 overflow-x-auto shrink-0 px-2">
          {tabs.map((tab, i) => (
            <button
              key={i}
              onClick={() => setActiveTab(i)}
              className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-3.5 text-[11px] font-bold whitespace-nowrap border-b-[3px] transition-colors ${
                activeTab === i
                  ? "border-blue-600 text-blue-700 bg-white"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100"
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 overflow-auto custom-scrollbar-slim bg-[#fafbfc] relative">
          {activeTab === 0 && <TabDocument permit={permit} />}
          {activeTab === 1 && <TabExtractedData permit={permit} />}
          {activeTab === 2 && <TabComponents permit={permit} />}
          {activeTab === 3 && <TabBoundaries permit={permit} />}
          {activeTab === 4 && <TabLinkedRecords permit={permit} />}{" "}
          {/* 👈 التاب الجديد */}
          {activeTab === 5 && <TabAiReport permit={permit} />}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-white border-t border-slate-200 shrink-0">
          <button className="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-colors shadow-md flex items-center justify-center gap-2">
            <ExternalLink size={16} /> فتح وإدارة معاملة الرخصة كاملة
          </button>
        </div>
      </div>
    </div>
  );
}
