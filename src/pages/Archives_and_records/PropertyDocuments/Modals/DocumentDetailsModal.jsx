import React, { useState, useEffect } from "react";
import { 
  X, FileText, MapPin, Users, Map, ShieldAlert, Link as LinkIcon, 
  BrainCircuit, History, Printer, ExternalLink, Download, FileSearch, 
  AlertTriangle, Loader2, Building2, Calendar, FileBadge, Pencil, Trash2, Save
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import axios from "../../../../api/axios";
import { toast } from "sonner";
import { getFullUrl } from "../../../../utils/urlUtils";

// ==========================================================================================
// 🚀 نافذة تفاصيل وثيقة الملكية (Enterprise Document Details & Editor)
// ==========================================================================================
export const DocumentDetailsModal = ({ docId, onClose }) => {
  const [activeTab, setActiveTab] = useState("basic");
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // --- States for Editing ---
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editData, setEditData] = useState(null);

  // 1. جلب بيانات الوثيقة من الباك إند
  const { data: response, isLoading, refetch } = useQuery({
    queryKey: ["archive-doc-details", docId],
    queryFn: async () => {
      const res = await axios.get(`/doc-archive/${docId}`);
      return res.data;
    },
    enabled: !!docId,
  });

  const doc = response?.data;

  // 2. إغلاق وإعادة ضبط
  useEffect(() => {
    if (!docId) {
      setIsEditing(false);
      setEditData(null);
      setActiveTab("basic");
    }
  }, [docId]);

  if (!docId) return null;

  const TABS = [
    { id: "basic", label: "البيانات الأساسية", icon: FileText },
    { id: "properties", label: "العقارات والقطع", icon: MapPin },
    { id: "owners", label: "الملاك والحصص", icon: Users },
    { id: "boundaries", label: "الحدود والأطوال", icon: Map },
    { id: "restrictions", label: "القيود والرهن", icon: ShieldAlert },
    { id: "links", label: "الارتباطات", icon: LinkIcon },
    { id: "ai_report", label: "تقرير AI", icon: BrainCircuit },
    { id: "logs", label: "سجل المراجعة", icon: History },
  ];

  // ==========================================
  // ⚙️ دوال التعديل والحفظ (CRUD Engine)
  // ==========================================

  // تهيئة البيانات للتحرير (نفس هيكل الذكاء الاصطناعي الذي يفهمه الكنترولر)
  const initEditData = () => {
    if (!doc) return;
    setEditData({
      basic: {
        docType: doc.docType || "",
        docSource: doc.docSource || "",
        documentNumber: doc.documentNumber || "",
        propertyNumber: doc.propertyNumber || "",
        issueDate: doc.issueDate ? new Date(doc.issueDate).toISOString().split('T')[0] : "",
        versionNumber: String(doc.versionNumber || ""),
        operationType: doc.operationType || "",
        previousDocNumber: doc.previousDocNumber || ""
      },
      properties: doc.properties?.map(p => ({
        city: p.city || "",
        district: p.district || "",
        planNumber: p.planNumber || "",
        plotNumber: p.plotNumber || "",
        area: p.area || 0,
        areaText: p.areaText || "",
        usageType: p.usageType || "",
        propertyType: p.propertyType || "",
        boundaries: p.boundariesData ? (typeof p.boundariesData === 'string' ? JSON.parse(p.boundariesData) : p.boundariesData) : []
      })) || [],
      owners: doc.owners?.map(o => ({
        name: o.ownerName || "",
        identityNumber: o.identityNumber || "",
        percentage: o.ownershipPercentage || 100,
        nationality: o.nationality || "سعودي",
        isMain: !!o.isMainOwner
      })) || [],
      restrictions: {
        hasRestrictions: doc.hasRestrictions || "لا يوجد",
        restrictedTo: doc.restrictedTo || "",
        value: doc.restrictionValue || 0,
        text: doc.restrictionText || ""
      },
      aiNotes: doc.aiNotes,
      aiConfidenceScore: doc.aiConfidenceScore
    });
    setIsEditing(true);
  };

  // دالة الحفظ وإرسالها للكنترولر
  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        aiDataArray: [editData], // الكنترولر يتوقع مصفوفة
        saveAction: doc.ownershipId ? "LINK_EXISTING" : "ARCHIVE_ONLY",
        selectedPropertyId: doc.ownershipId || null,
        uploadNotes: "تم التعديل اليدوي من نافذة التفاصيل",
        isFinalApproval: true // لإبقاء الحالة CONFIRMED
      };

      await axios.put(`/doc-archive/${docId}`, payload);
      toast.success("تم حفظ التعديلات بنجاح!");
      setIsEditing(false);
      refetch(); // تحديث البيانات المعروضة
    } catch (error) {
      toast.error(error.response?.data?.message || "حدث خطأ أثناء حفظ التعديلات.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // دالة الحذف
  const handleDelete = async () => {
    if (!window.confirm("هل أنت متأكد من رغبتك في حذف هذه الوثيقة نهائياً؟")) return;
    try {
      const loadingToast = toast.loading("جاري الحذف...");
      await axios.delete(`/doc-archive/${docId}`);
      toast.success("تم حذف الوثيقة بنجاح", { id: loadingToast });
      onClose(); // إغلاق النافذة بعد الحذف ليقوم الأب بتحديث الجدول
    } catch (error) {
      toast.error("فشل الحذف. الرجاء المحاولة لاحقاً.");
    }
  };

  // ==========================================
  // ✍️ دوال تحديث الحالة العميقة أثناء التحرير
  // ==========================================
  const updateBasic = (f, v) => setEditData(p => ({ ...p, basic: { ...p.basic, [f]: v } }));
  const updateProp = (idx, f, v) => setEditData(p => {
    const arr = [...p.properties]; arr[idx][f] = v; return { ...p, properties: arr };
  });
  const updateBoundary = (pIdx, bIdx, f, v) => setEditData(p => {
    const arr = [...p.properties]; arr[pIdx].boundaries[bIdx][f] = v; return { ...p, properties: arr };
  });
  const updateOwner = (idx, f, v) => setEditData(p => {
    const arr = [...p.owners]; arr[idx][f] = v; return { ...p, owners: arr };
  });
  const updateRestr = (f, v) => setEditData(p => ({ ...p, restrictions: { ...p.restrictions, [f]: v } }));

  // ==========================================
  // 🎨 دوال مساعدة للعرض
  // ==========================================
  const renderStatusBadge = (status) => {
    const statusConfig = {
      UPLOADED: { text: "مرفوعة", bg: "bg-slate-100 text-slate-600" },
      NEEDS_REVIEW: { text: "تحتاج مراجعة", bg: "bg-amber-50 text-amber-600" },
      CONFIRMED: { text: "مؤكدة ومراجعة", bg: "bg-emerald-50 text-emerald-600" },
      ARCHIVED: { text: "مؤرشفة (ملغية)", bg: "bg-rose-50 text-rose-600" },
    };
    const config = statusConfig[status] || statusConfig.UPLOADED;
    return <span className={`px-3 py-1 rounded-lg text-[10px] font-black border border-white/20 shadow-sm ${config.bg}`}>{config.text}</span>;
  };

  const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString("ar-SA") : "---";

  // ==========================================
  // 🧩 محتوى التبويبات المتجاوب (Read/Edit)
  // ==========================================
  const renderTabContent = () => {
    if (isLoading) return <LoadingSkeleton />;
    if (!doc) return <div className="p-10 text-center text-slate-400 font-bold">لم يتم العثور على بيانات الوثيقة.</div>;

    switch (activeTab) {
      case "basic":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-300">
            <EditableField label="نوع الوثيقة" value={isEditing ? editData.basic.docType : doc.docType} onChange={v => updateBasic('docType', v)} isEditing={isEditing} icon={FileBadge} />
            <EditableField label="مصدر الوثيقة" value={isEditing ? editData.basic.docSource : doc.docSource} onChange={v => updateBasic('docSource', v)} isEditing={isEditing} icon={Building2} />
            <EditableField label="رقم الوثيقة / الصك" value={isEditing ? editData.basic.documentNumber : doc.documentNumber} onChange={v => updateBasic('documentNumber', v)} isEditing={isEditing} isMono />
            <EditableField label="رقم العقار" value={isEditing ? editData.basic.propertyNumber : doc.propertyNumber} onChange={v => updateBasic('propertyNumber', v)} isEditing={isEditing} isMono />
            <EditableField label="تاريخ الوثيقة" value={isEditing ? editData.basic.issueDate : formatDate(doc.issueDate)} onChange={v => updateBasic('issueDate', v)} isEditing={isEditing} type={isEditing ? "date" : "text"} icon={Calendar} isMono={!isEditing} />
            <EditableField label="رقم النسخة" value={isEditing ? editData.basic.versionNumber : doc.versionNumber} onChange={v => updateBasic('versionNumber', v)} isEditing={isEditing} isMono />
            <div className="md:col-span-2">
              <EditableField label="نوع العملية" value={isEditing ? editData.basic.operationType : doc.operationType} onChange={v => updateBasic('operationType', v)} isEditing={isEditing} />
            </div>
          </div>
        );

      case "properties":
        const propsSource = isEditing ? editData.properties : doc.properties;
        return (
          <div className="flex flex-col gap-4 animate-in fade-in duration-300">
            {propsSource?.length === 0 && <EmptyState text="لا توجد بيانات عقارات مستخرجة." />}
            {propsSource?.map((prop, idx) => (
              <div key={idx} className="p-4 border border-slate-200 rounded-2xl bg-white shadow-sm flex flex-col gap-4">
                <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                  <h5 className="text-xs font-black text-[#123f59] flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#d8b46a]" /> العقار رقم {idx + 1}
                  </h5>
                  {isEditing ? (
                    <input className="text-[10px] font-bold bg-slate-50 border border-slate-200 text-slate-600 px-2 py-1 rounded outline-none" value={prop.propertyType} onChange={e=>updateProp(idx, 'propertyType', e.target.value)} placeholder="نوع العقار"/>
                  ) : (
                    <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded-md">{prop.propertyType || "غير محدد"}</span>
                  )}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <EditableField label="المدينة" value={prop.city} onChange={v=>updateProp(idx, 'city', v)} isEditing={isEditing} />
                  <EditableField label="الحي" value={prop.district} onChange={v=>updateProp(idx, 'district', v)} isEditing={isEditing} />
                  <EditableField label="رقم المخطط" value={prop.planNumber} onChange={v=>updateProp(idx, 'planNumber', v)} isEditing={isEditing} isMono />
                  <EditableField label="رقم القطعة" value={prop.plotNumber} onChange={v=>updateProp(idx, 'plotNumber', v)} isEditing={isEditing} isMono />
                  <EditableField label="المساحة (م٢)" value={prop.area} onChange={v=>updateProp(idx, 'area', v)} isEditing={isEditing} type={isEditing ? "number" : "text"} isMono />
                  <EditableField label="نوع الاستخدام" value={prop.usageType} onChange={v=>updateProp(idx, 'usageType', v)} isEditing={isEditing} />
                </div>
              </div>
            ))}
          </div>
        );

      case "owners":
        const ownersSource = isEditing ? editData.owners : doc.owners;
        return (
          <div className="overflow-hidden border border-slate-200 rounded-2xl bg-white animate-in fade-in duration-300">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="p-3 font-black text-[#123f59]">اسم المالك</th>
                  <th className="p-3 font-black text-[#123f59]">الهوية / السجل</th>
                  <th className="p-3 font-black text-[#123f59] text-center w-24">النسبة %</th>
                  <th className="p-3 font-black text-[#123f59] text-center w-24">رئيسي؟</th>
                  {isEditing && <th className="p-3 font-black w-12"></th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ownersSource?.length === 0 && (
                  <tr><td colSpan={isEditing ? 5 : 4} className="p-6 text-center text-slate-400 font-bold">لا يوجد ملاك مسجلين.</td></tr>
                )}
                {ownersSource?.map((owner, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="p-2">
                      <EditableField value={isEditing ? owner.name : owner.ownerName} onChange={v=>updateOwner(idx, 'name', v)} isEditing={isEditing} noLabel />
                    </td>
                    <td className="p-2">
                      <EditableField value={owner.identityNumber} onChange={v=>updateOwner(idx, 'identityNumber', v)} isEditing={isEditing} noLabel isMono />
                    </td>
                    <td className="p-2 text-center">
                      <EditableField value={isEditing ? owner.percentage : owner.ownershipPercentage} onChange={v=>updateOwner(idx, 'percentage', v)} type="number" isEditing={isEditing} noLabel isMono />
                    </td>
                    <td className="p-2 text-center">
                      {isEditing ? (
                         <input type="checkbox" checked={owner.isMain} onChange={e=>updateOwner(idx, 'isMain', e.target.checked)} className="w-4 h-4 cursor-pointer accent-[#0e7490]" />
                      ) : (
                         <span className="font-bold text-slate-500">{owner.isMainOwner ? "نعم" : "لا"}</span>
                      )}
                    </td>
                    {isEditing && (
                      <td className="p-2 text-center">
                        <button onClick={() => setEditData(p => ({...p, owners: p.owners.filter((_, i) => i !== idx)}))} className="text-rose-500 hover:bg-rose-50 p-1.5 rounded"><Trash2 className="w-4 h-4"/></button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            {isEditing && (
              <div className="p-3 bg-slate-50 border-t border-slate-100">
                 <button onClick={() => setEditData(p => ({...p, owners: [...p.owners, {name:"", identityNumber:"", percentage:100, isMain:false}]}))} className="text-xs font-black text-[#0e7490] hover:underline">+ إضافة مالك</button>
              </div>
            )}
          </div>
        );

      case "boundaries":
        const boundProps = isEditing ? editData.properties : doc.properties;
        return (
          <div className="flex flex-col gap-5 animate-in fade-in duration-300">
            {boundProps?.map((prop, pIdx) => {
              const bounds = isEditing ? prop.boundaries : (prop.boundariesData ? (typeof prop.boundariesData === 'string' ? JSON.parse(prop.boundariesData) : prop.boundariesData) : []);
              return (
                <div key={pIdx} className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
                  <h5 className="text-xs font-black text-[#123f59] mb-4 pb-2 border-b border-slate-100">
                    حدود القطعة رقم: <span className="font-mono">{prop.plotNumber || "---"}</span>
                  </h5>
                  {bounds.length === 0 ? (
                    <EmptyState text="لا توجد حدود مسجلة لهذه القطعة." />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {bounds.map((b, bIdx) => (
                        <div key={bIdx} className="flex flex-col bg-slate-50 border border-slate-100 p-3 rounded-xl gap-2">
                          <div className="flex justify-between items-center mb-1">
                             {isEditing ? <input value={b.direction} onChange={e=>updateBoundary(pIdx, bIdx, 'direction', e.target.value)} className="w-16 text-xs font-black text-[#0e7490] bg-transparent outline-none border-b border-slate-300" placeholder="الاتجاه"/> : <span className="text-xs font-black text-[#0e7490]">{b.direction}</span>}
                             {isEditing ? <input value={b.type} onChange={e=>updateBoundary(pIdx, bIdx, 'type', e.target.value)} className="w-16 text-[10px] font-bold bg-white border border-slate-200 px-1 py-0.5 rounded text-center outline-none text-slate-500" placeholder="النوع"/> : <span className="text-[10px] font-bold bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-500">{b.type}</span>}
                          </div>
                          {isEditing ? (
                             <textarea value={b.desc} onChange={e=>updateBoundary(pIdx, bIdx, 'desc', e.target.value)} className="text-[11px] font-bold text-slate-700 bg-white border border-slate-200 rounded p-1 outline-none min-h-[40px] resize-none" placeholder="وصف الجار" />
                          ) : (
                             <p className="text-[11px] font-bold text-slate-700 leading-relaxed min-h-[40px]">{b.desc}</p>
                          )}
                          <div className="mt-2 pt-2 border-t border-slate-200 flex justify-between items-center">
                            <span className="text-[10px] font-bold text-slate-400">الطول (م):</span>
                            {isEditing ? <input value={b.length} onChange={e=>updateBoundary(pIdx, bIdx, 'length', e.target.value)} className="w-20 text-xs font-mono font-black text-[#123f59] bg-white border border-slate-200 rounded px-1 text-center outline-none" /> : <span className="font-mono font-black text-[#123f59] text-xs">{b.length} م</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );

      case "restrictions":
        const restr = isEditing ? editData.restrictions : { hasRestrictions: doc.hasRestrictions, restrictedTo: doc.restrictedTo, value: doc.restrictionValue, text: doc.restrictionText };
        return (
          <div className="flex flex-col gap-4 animate-in fade-in duration-300">
            <div className={`p-4 border-2 rounded-xl flex items-center justify-between gap-3 ${restr.hasRestrictions === "مرهون" ? "border-rose-300 bg-rose-50" : "border-emerald-300 bg-emerald-50"}`}>
              <div className="flex items-center gap-3">
                <ShieldAlert className={`w-8 h-8 ${restr.hasRestrictions === "مرهون" ? "text-rose-500" : "text-emerald-500"}`} />
                <div className="flex flex-col">
                  <span className={`text-sm font-black ${restr.hasRestrictions === "مرهون" ? "text-rose-800" : "text-emerald-800"}`}>حالة القيود:</span>
                  <span className={`text-[10px] font-bold mt-0.5 ${restr.hasRestrictions === "مرهون" ? "text-rose-600" : "text-emerald-600"}`}>
                    {restr.hasRestrictions === "مرهون" ? "وثيقة تحتوي على رهن." : "وثيقة خالية من القيود."}
                  </span>
                </div>
              </div>
              {isEditing ? (
                 <select value={restr.hasRestrictions || "لا يوجد"} onChange={e=>updateRestr('hasRestrictions', e.target.value)} className="p-2 border border-slate-300 rounded-lg text-xs font-black bg-white outline-none">
                   <option value="لا يوجد">لا يوجد (سليم)</option>
                   <option value="مرهون">مرهون</option>
                   <option value="إيقاف">إيقاف</option>
                 </select>
              ) : (
                 <span className={`text-lg font-black ${restr.hasRestrictions === "مرهون" ? "text-rose-800" : "text-emerald-800"}`}>{restr.hasRestrictions}</span>
              )}
            </div>

            {restr.hasRestrictions !== "لا يوجد" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-5 border border-slate-200 rounded-2xl shadow-sm">
                 <EditableField label="الجهة المرتهنة / الموقفة" value={restr.restrictedTo} onChange={v=>updateRestr('restrictedTo', v)} isEditing={isEditing} />
                 <EditableField label="قيمة الرهن (ريال)" value={restr.value} onChange={v=>updateRestr('value', v)} isEditing={isEditing} type={isEditing ? "number" : "text"} isMono />
                 <div className="md:col-span-2">
                   <EditableField label="النص الحرفي للقيد" value={restr.text} onChange={v=>updateRestr('text', v)} isEditing={isEditing} isTextarea />
                 </div>
              </div>
            )}
          </div>
        );

      case "links":
        return (
          <div className="flex flex-col gap-5 animate-in fade-in duration-300">
            {isEditing && <div className="p-3 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-xl border border-indigo-200 mb-2">لإدارة ارتباطات هذه الوثيقة بالمشاريع، يرجى استخدام نافذة "الربط" من جدول الأرشيف الرئيسي بدلاً من هنا للحفاظ على سلامة شجرة العلاقات.</div>}
            <div className="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm flex items-center justify-between opacity-80">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${doc.ownershipId ? "bg-indigo-100 text-indigo-600" : "bg-slate-100 text-slate-400"}`}>
                  <Building2 className="w-6 h-6" />
                </div>
                <div className="flex flex-col">
                  <h4 className="text-xs font-black text-[#123f59]">ملف الملكية التشغيلي</h4>
                  {doc.ownershipId ? (
                    <span className="text-sm font-bold text-indigo-600 mt-1 cursor-pointer hover:underline flex items-center gap-1">
                      {doc.ownership?.code} <ExternalLink className="w-3 h-3" />
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold text-slate-400 mt-1">غير مرتبط بأي مشروع حالياً.</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
        
      case "ai_report":
      case "logs":
        // لا يمكن تعديل هذه الصفحات لأنها مقروءة فقط من النظام
        return (
          <div className="p-5 flex flex-col gap-4 animate-in fade-in bg-white rounded-2xl border border-slate-200 opacity-90">
             <h4 className="text-sm font-black text-[#123f59] border-b border-slate-100 pb-3 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-500" /> سجلات النظام غير قابلة للتعديل
             </h4>
             <span className="text-xs font-bold text-slate-500 leading-relaxed">
               {activeTab === "ai_report" ? "تقرير ثقة الذكاء الاصطناعي والملاحظات يتم توليدها آلياً للحفاظ على شفافية الاستخراج الأصلي." : "سجل المراجعات والتدقيق (Audit Logs) محمي تماماً ولا يمكن العبث به لضمان تتبع المسؤوليات."}
             </span>
          </div>
        );

      default:
        return null;
    }
  };

  // ==========================================
  // 🖼️ الهيكل الرئيسي للنافذة
  // ==========================================
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 font-[Tajawal]" dir="rtl">
      <div className={`bg-white rounded-[24px] shadow-2xl flex flex-col overflow-hidden transition-all duration-500 ease-in-out w-full max-w-[1400px] ${isFullscreen ? "h-[95vh]" : "h-[85vh]"} ${isEditing ? "ring-4 ring-amber-500/20" : ""}`}>
        
        {/* 🌟 Header 🌟 */}
        <div className={`shrink-0 flex items-center justify-between p-4 md:p-5 border-b border-white/10 text-white transition-colors ${isEditing ? "bg-gradient-to-l from-amber-600 via-amber-500 to-amber-600" : "bg-gradient-to-l from-[#123f59] via-[#0e7490] to-[#123f59]"}`}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center border border-white/20 shadow-inner">
              <FileText className="w-6 h-6 text-[#d8b46a]" />
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-black">{doc?.documentNumber ? `وثيقة رقم: ${doc.documentNumber}` : "تفاصيل الوثيقة المؤرشفة"}</h2>
                {doc && renderStatusBadge(doc.status)}
              </div>
              <span className="text-xs font-bold text-white/80">
                {isEditing ? "وضع التحرير النشط - كن حذراً عند التعديل" : `${doc?.docType || "غير محدد"} • أُضيفت في ${formatDate(doc?.uploadDate)}`}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            
            {/* 🚀 أدوات التحرير (CRUD Controls) */}
            {isEditing ? (
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md p-1 rounded-xl">
                 <button onClick={handleSave} disabled={isSubmitting} className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-black transition-colors shadow-sm disabled:opacity-50">
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin"/> : <Save className="w-4 h-4"/>} حفظ التعديلات
                 </button>
                 <button onClick={() => setIsEditing(false)} className="flex items-center gap-1.5 px-3 py-2 bg-rose-500/80 hover:bg-rose-600 text-white rounded-lg text-xs font-black transition-colors">
                    إلغاء
                 </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                 <button onClick={initEditData} className="flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-lg text-xs font-black transition-colors">
                    <Pencil className="w-4 h-4" /> تعديل
                 </button>
                 <button onClick={handleDelete} className="flex items-center gap-1.5 px-3 py-2 bg-rose-500/20 hover:bg-rose-500 border border-rose-500/30 text-white rounded-lg text-xs font-black transition-colors">
                    <Trash2 className="w-4 h-4" /> حذف
                 </button>
                 <div className="w-px h-6 bg-white/20 mx-1"></div>
                 <button className="flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-xs font-black transition-colors">
                   <Printer className="w-4 h-4" /> طباعة
                 </button>
              </div>
            )}

            <div className="w-px h-6 bg-white/20 mx-1"></div>
            
            <button onClick={() => setIsFullscreen(!isFullscreen)} className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
            </button>
            <button onClick={onClose} className="p-2 text-white/80 hover:text-rose-400 hover:bg-white/20 rounded-lg transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* 🌟 Body (Split View) 🌟 */}
        <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden bg-slate-50">
          
          {/* الجانب الأيمن: البيانات والتبويبات */}
          <div className="flex flex-col w-full lg:w-[500px] xl:w-[600px] shrink-0 border-l border-slate-200 bg-white relative">
            {/* مؤشر تحذيري أثناء التعديل */}
            {isEditing && <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500 z-20 animate-pulse"></div>}

            {/* قائمة التبويبات */}
            <div className="flex overflow-x-auto custom-scrollbar-slim border-b border-slate-200 shrink-0 px-2 pt-2 bg-slate-50/50">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 border-b-[3px] transition-all whitespace-nowrap outline-none ${
                    activeTab === tab.id 
                    ? `border-[${isEditing?'#f59e0b':'#123f59'}] text-[${isEditing?'#d97706':'#123f59'}] bg-white rounded-t-lg shadow-[0_-2px_10px_rgba(0,0,0,0.02)]` 
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100/50"
                  }`}
                >
                  <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? "text-[#d8b46a]" : ""}`} />
                  <span className="text-xs font-black">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* محتوى التبويب */}
            <div className={`flex-1 overflow-y-auto p-5 custom-scrollbar transition-colors ${isEditing ? "bg-amber-50/10" : "bg-slate-50/30"}`}>
              {renderTabContent()}
            </div>
          </div>

          {/* الجانب الأيسر: عارض المستند (Document Viewer) */}
          <div className="flex-1 bg-slate-200/50 p-4 flex flex-col min-h-[400px]">
            <div className="bg-white border border-slate-200 rounded-2xl flex-1 shadow-sm overflow-hidden flex flex-col relative group">
              <div className="absolute top-0 right-0 left-0 bg-gradient-to-b from-black/50 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity flex justify-end gap-2 z-10">
                <a 
                  href={doc?.fileUrl ? getFullUrl(doc.fileUrl) : "#"} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  download
                  className="p-2 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-lg text-white transition-all shadow-sm" 
                  title="تحميل الملف"
                >
                  <Download className="w-4 h-4" />
                </a>
              </div>

              {isLoading ? (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                  <Loader2 className="w-8 h-8 animate-spin mb-3" />
                  <span className="text-sm font-bold">جاري تحميل المعاينة...</span>
                </div>
              ) : doc?.fileUrl ? (
                doc.fileType?.includes('image') ? (
                  <div className="w-full h-full overflow-auto custom-scrollbar flex items-center justify-center p-4 bg-slate-100">
                     <img src={getFullUrl(doc.fileUrl)} alt="الوثيقة" className="max-w-full h-auto rounded-lg shadow-sm" />
                  </div>
                ) : (
                  <iframe 
                    src={`${getFullUrl(doc.fileUrl)}#toolbar=0`} 
                    title="عارض المستند"
                    className="w-full h-full border-none bg-slate-100"
                  />
                )
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                  <FileText className="w-16 h-16 mb-3 opacity-20" />
                  <span className="text-sm font-bold">لا يتوفر ملف لمعاينته.</span>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

// ==========================================
// 🧩 مكون الحقل القابل للتحرير (EditableField)
// ==========================================
const EditableField = ({ label, value, onChange, isEditing, type="text", isMono=false, icon: Icon, isTextarea=false, noLabel=false }) => {
  
  if (!isEditing) {
    return (
      <div className={`flex flex-col ${noLabel ? "" : "p-3 bg-slate-50 border border-slate-100 rounded-xl"}`}>
        {!noLabel && (
          <span className="text-[10px] font-bold text-slate-400 mb-1 flex items-center gap-1.5">
            {Icon && <Icon className="w-3 h-3" />} {label}
          </span>
        )}
        <span className={`text-[12px] font-black text-[#123f59] break-words ${isMono ? "font-mono" : ""}`}>
          {value || "---"}
        </span>
      </div>
    );
  }

  // وضع التحرير
  const safeValue = value !== null && value !== undefined ? String(value) : "";
  const inputClasses = `w-full text-xs font-black outline-none bg-transparent text-[#123f59] placeholder:text-slate-300 ${isMono ? "font-mono tracking-wider" : ""}`;

  return (
    <div className={`flex flex-col ${noLabel ? "" : "p-2.5 bg-white border border-amber-200 rounded-xl focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-100 transition-all shadow-inner"}`}>
      {!noLabel && <label className="text-[9px] font-black text-amber-600/70 mb-0.5">{label}</label>}
      {isTextarea ? (
        <textarea value={safeValue} onChange={(e) => onChange(e.target.value)} className={`${inputClasses} resize-none min-h-[60px]`} placeholder={label} />
      ) : (
        <input type={type} value={safeValue} onChange={(e) => onChange(e.target.value)} className={inputClasses} placeholder={label} />
      )}
    </div>
  );
};

// ==========================================
// 🧩 مكونات مساعدة أخرى
// ==========================================
const EmptyState = ({ text }) => (
  <div className="p-8 border border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center text-slate-400 bg-white">
    <FileSearch className="w-10 h-10 mb-2 opacity-30" />
    <span className="text-xs font-bold">{text}</span>
  </div>
);

const LoadingSkeleton = () => (
  <div className="flex flex-col gap-4 animate-pulse">
    <div className="h-20 bg-slate-200 rounded-xl w-full"></div>
    <div className="grid grid-cols-2 gap-4">
      <div className="h-16 bg-slate-200 rounded-xl"></div>
      <div className="h-16 bg-slate-200 rounded-xl"></div>
      <div className="h-16 bg-slate-200 rounded-xl"></div>
      <div className="h-16 bg-slate-200 rounded-xl"></div>
    </div>
  </div>
);