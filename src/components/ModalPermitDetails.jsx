import React, { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
} from "lucide-react";

// ==========================================
// 💡 مكونات مساعدة للـ Badges
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
          className="border-2 border-dashed border-blue-300 rounded-xl bg-blue-50/50 h-48 flex flex-col items-center justify-center text-blue-500 cursor-pointer hover:bg-blue-50 transition-colors"
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
        <div className="border border-slate-200 rounded-xl bg-slate-50 h-64 flex flex-col items-center justify-center text-slate-400 relative overflow-hidden">
          {permit?.attachmentUrl ? (
            <img
              src={permit.attachmentUrl}
              alt="رخصة"
              className="w-full h-full object-contain"
            />
          ) : (
            <>
              <FileText size={32} className="mb-2 opacity-50" />
              <span className="text-xs font-bold">المستند غير متوفر</span>
            </>
          )}
        </div>
      )}

      {!isEditing && (
        <div className="flex gap-2">
          {permit?.attachmentUrl && (
            <a
              href={permit.attachmentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-[11px] font-bold bg-blue-600 text-white rounded-lg py-2 hover:bg-blue-700 flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Eye size={14} /> عرض المستند كامل
            </a>
          )}
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
    { key: "year", label: "سنة الرخصة", type: "number" },
    { key: "type", label: "نوع الرخصة" },
    { key: "ownerName", label: "اسم المالك" },
    { key: "idNumber", label: "رقم الهوية" },
    { key: "district", label: "الحي" },
    { key: "sector", label: "القطاع" },
    { key: "plotNumber", label: "رقم القطعة" },
    { key: "planNumber", label: "رقم المخطط" },
    { key: "usage", label: "الاستخدام" },
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
            <span className="text-[10px] font-bold text-slate-400">
              {f.label}
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
              <span className="text-[11px] font-bold text-slate-800 bg-slate-50 px-2 py-1.5 rounded-md border border-transparent min-h-[28px] flex items-center">
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
  // نفترض أن المكونات محفوظة كـ JSON string في قاعدة البيانات في حقل componentsData
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
      { name: "", area: "", rooms: "", bathrooms: "" },
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
              <th className="px-3 py-2">المكون</th>
              <th className="px-3 py-2 w-20">المساحة م²</th>
              <th className="px-3 py-2 w-20">غرف</th>
              <th className="px-3 py-2 w-20">دورات مياه</th>
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
                      value={c.rooms}
                      onChange={(e) => updateRow(i, "rooms", e.target.value)}
                      className="w-full border border-slate-200 rounded px-2 py-1 outline-none focus:border-blue-400"
                    />
                  ) : (
                    <span className="font-bold text-slate-600">{c.rooms}</span>
                  )}
                </td>
                <td className="px-3 py-2">
                  {isEditing ? (
                    <input
                      type="number"
                      value={c.bathrooms}
                      onChange={(e) =>
                        updateRow(i, "bathrooms", e.target.value)
                      }
                      className="w-full border border-slate-200 rounded px-2 py-1 outline-none focus:border-blue-400"
                    />
                  ) : (
                    <span className="font-bold text-slate-600">
                      {c.bathrooms}
                    </span>
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
          className="w-full py-2 bg-slate-50 border border-dashed border-slate-300 text-slate-500 rounded-lg hover:bg-slate-100 hover:text-slate-700 flex items-center justify-center gap-1 text-[11px] font-bold transition-colors"
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

function TabVersions({ permit }) {
  return (
    <div className="p-4 animate-in fade-in flex flex-col items-center justify-center h-48 text-slate-400">
      <History size={40} className="mb-3 opacity-30" />
      <span className="text-sm font-bold text-slate-500">
        لا توجد نسخ سابقة
      </span>
      <span className="text-[10px] mt-1">هذه هي النسخة الأولى من الرخصة.</span>
    </div>
  );
}

function TabAiReport({ permit }) {
  if (permit?.source !== "رفع يدوي (AI)") {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-slate-400 p-4 text-center">
        <BarChart3 size={40} className="mb-3 opacity-30" />
        <span className="text-sm font-bold text-slate-500">
          لا يوجد تقرير ذكاء اصطناعي
        </span>
        <span className="text-[10px] mt-1">
          هذه الرخصة لم يتم إدخالها أو معالجتها عبر الأرشفة الذكية.
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 animate-in fade-in">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
        <Brain size={16} className="text-purple-600" />
        <span className="text-[12px] font-black text-slate-700">
          تقرير التحليل بالذكاء الاصطناعي
        </span>
      </div>
      <div className="border border-purple-100 rounded-xl p-4 bg-purple-50/50 space-y-3 text-[11px] font-bold shadow-sm">
        <div className="flex justify-between items-center">
          <span className="text-purple-600">حالة التحليل</span>
          <AiBadge status={permit?.aiStatus} />
        </div>
        <div className="w-full bg-purple-100 rounded-full h-2 mt-2">
          <div
            className="bg-purple-500 h-2 rounded-full transition-all"
            style={{ width: permit?.aiStatus === "تم التحليل" ? "95%" : "60%" }}
          />
        </div>
        <div className="flex justify-between pt-2 border-t border-purple-100">
          <span className="text-slate-500">المودل المستخدم</span>
          <span className="text-slate-700">GPT-4o Vision</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">وقت التنفيذ</span>
          <span className="text-slate-700">4.2 ثانية</span>
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
    { label: "النسخ", icon: <History size={12} /> },
    { label: "تقرير AI", icon: <BarChart3 size={12} /> },
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
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <span className="text-slate-400 font-bold block mb-1">المالك</span>
            <span
              className="text-slate-800 font-bold truncate block text-sm"
              title={permit.ownerName}
            >
              {permit.ownerName || "—"}
            </span>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <span className="text-slate-400 font-bold block mb-1">الهوية</span>
            <span className="text-slate-800 font-mono font-bold block text-sm">
              {permit.idNumber || "—"}
            </span>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <span className="text-slate-400 font-bold block mb-1">
              الحي / القطاع
            </span>
            <span className="text-slate-800 font-bold block truncate text-sm">
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
              className={`flex items-center justify-center gap-1.5 px-5 py-3.5 text-[12px] font-bold whitespace-nowrap border-b-[3px] transition-colors ${
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
          {activeTab === 4 && <TabVersions permit={permit} />}
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
