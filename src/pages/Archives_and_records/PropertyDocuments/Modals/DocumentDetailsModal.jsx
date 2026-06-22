import React, { useState } from "react";
import { 
  X, FileText, MapPin, Users, Map, ShieldAlert, Link as LinkIcon, 
  BrainCircuit, History, Printer, ExternalLink, Download, FileSearch, 
  AlertTriangle, Loader2, Building2, Calendar, FileBadge
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import axios from "../../../../api/axios";
import { toast } from "sonner";
import { getFullUrl } from "../../../../utils/urlUtils";
// ==========================================================================================
// 🚀 نافذة تفاصيل وثيقة الملكية (Enterprise Document Details Modal)
// ==========================================================================================
export const DocumentDetailsModal = ({ docId, onClose }) => {
  const [activeTab, setActiveTab] = useState("basic");
  const [isFullscreen, setIsFullscreen] = useState(false); // لتكبير عارض الـ PDF

  // 1. جلب بيانات الوثيقة من الباك إند
  const { data: response, isLoading, isError } = useQuery({
    queryKey: ["archive-doc-details", docId],
    queryFn: async () => {
      const res = await axios.get(`/doc-archive/${docId}`);
      return res.data;
    },
    enabled: !!docId,
  });

  const doc = response?.data;

  // 2. إغلاق النافذة إذا لم يكن هناك ID
  if (!docId) return null;

  // 3. تعريف التبويبات
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
  // 🎨 دوال مساعدة للعرض
  // ==========================================
  const renderStatusBadge = (status) => {
    const statusConfig = {
      UPLOADED: { text: "مرفوعة", bg: "bg-slate-100 text-slate-600 border-slate-200" },
      NEEDS_REVIEW: { text: "تحتاج مراجعة", bg: "bg-amber-50 text-amber-600 border-amber-200" },
      CONFIRMED: { text: "مؤكدة ومراجعة", bg: "bg-emerald-50 text-emerald-600 border-emerald-200" },
      ARCHIVED: { text: "مؤرشفة (ملغية)", bg: "bg-rose-50 text-rose-600 border-rose-200" },
    };
    const config = statusConfig[status] || statusConfig.UPLOADED;
    return <span className={`px-3 py-1 rounded-lg text-[10px] font-black border ${config.bg}`}>{config.text}</span>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "---";
    return new Date(dateString).toLocaleDateString("ar-SA");
  };

  // ==========================================
  // 🧩 تصميم محتوى التبويبات (Tab Contents)
  // ==========================================
  const renderTabContent = () => {
    if (isLoading) return <LoadingSkeleton />;
    if (!doc) return <div className="p-10 text-center text-slate-400 font-bold">لم يتم العثور على بيانات الوثيقة.</div>;

    switch (activeTab) {
      case "basic":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-300">
            <InfoCard label="نوع الوثيقة" value={doc.docType} icon={FileBadge} />
            <InfoCard label="مصدر الوثيقة" value={doc.docSource} icon={Building2} />
            <InfoCard label="رقم الوثيقة / الصك" value={doc.documentNumber} isMono />
            <InfoCard label="رقم العقار" value={doc.propertyNumber} isMono />
            <InfoCard label="تاريخ الوثيقة" value={formatDate(doc.issueDate)} icon={Calendar} isMono />
            <InfoCard label="رقم النسخة" value={doc.versionNumber} isMono />
            <div className="md:col-span-2">
              <InfoCard label="نوع العملية" value={doc.operationType} />
            </div>
          </div>
        );

      case "properties":
        return (
          <div className="flex flex-col gap-4 animate-in fade-in duration-300">
            {doc.properties?.length === 0 && <EmptyState text="لا توجد بيانات عقارات مستخرجة." />}
            {doc.properties?.map((prop, idx) => (
              <div key={prop.id} className="p-4 border border-slate-200 rounded-2xl bg-white shadow-sm flex flex-col gap-4">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                  <h5 className="text-xs font-black text-[#123f59] flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#d8b46a]" /> العقار رقم {idx + 1}
                  </h5>
                  <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded-md">{prop.propertyType || "غير محدد"}</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <InfoCard label="المدينة" value={prop.city} />
                  <InfoCard label="الحي" value={prop.district} />
                  <InfoCard label="رقم المخطط" value={prop.planNumber} isMono />
                  <InfoCard label="رقم القطعة" value={prop.plotNumber} isMono />
                  <InfoCard label="المساحة (م٢)" value={prop.area} isMono />
                  <InfoCard label="نوع الاستخدام" value={prop.usageType} />
                </div>
              </div>
            ))}
          </div>
        );

      case "owners":
        return (
          <div className="overflow-hidden border border-slate-200 rounded-2xl bg-white animate-in fade-in duration-300">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="p-3 font-black text-[#123f59]">اسم المالك</th>
                  <th className="p-3 font-black text-[#123f59]">الهوية / السجل</th>
                  <th className="p-3 font-black text-[#123f59] text-center">النسبة</th>
                  <th className="p-3 font-black text-[#123f59] text-center">الصفة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {doc.owners?.length === 0 && (
                  <tr><td colSpan="4" className="p-6 text-center text-slate-400 font-bold">لا يوجد ملاك مسجلين.</td></tr>
                )}
                {doc.owners?.map((owner) => (
                  <tr key={owner.id} className="hover:bg-slate-50/50">
                    <td className="p-3 font-bold text-slate-700 flex items-center gap-2">
                      {owner.ownerName}
                      {owner.isMainOwner && <span className="bg-[#0e7490] text-white text-[9px] px-1.5 py-0.5 rounded">رئيسي</span>}
                    </td>
                    <td className="p-3 font-mono font-bold text-slate-600">{owner.identityNumber || "---"}</td>
                    <td className="p-3 font-mono font-black text-[#0e7490] text-center">{owner.ownershipPercentage}%</td>
                    <td className="p-3 font-bold text-slate-500 text-center">{owner.ownerRole || "مالك"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case "boundaries":
        return (
          <div className="flex flex-col gap-5 animate-in fade-in duration-300">
            {doc.properties?.map((prop, pIdx) => {
              const bounds = prop.boundariesData ? (typeof prop.boundariesData === 'string' ? JSON.parse(prop.boundariesData) : prop.boundariesData) : [];
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
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-black text-[#0e7490]">{b.direction}</span>
                            <span className="text-[10px] font-bold bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-500">{b.type}</span>
                          </div>
                          <p className="text-[11px] font-bold text-slate-700 leading-relaxed min-h-[40px]">{b.desc}</p>
                          <div className="mt-2 pt-2 border-t border-slate-200/60 flex justify-between items-center">
                            <span className="text-[10px] font-bold text-slate-400">الطول:</span>
                            <span className="font-mono font-black text-[#123f59] text-xs">{b.length} م</span>
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
        return (
          <div className="flex flex-col gap-4 animate-in fade-in duration-300">
            <div className={`p-4 border-2 rounded-xl flex items-center gap-3 ${doc.hasRestrictions === "مرهون" ? "border-rose-300 bg-rose-50" : "border-emerald-300 bg-emerald-50"}`}>
              <ShieldAlert className={`w-8 h-8 ${doc.hasRestrictions === "مرهون" ? "text-rose-500" : "text-emerald-500"}`} />
              <div className="flex flex-col">
                <span className={`text-sm font-black ${doc.hasRestrictions === "مرهون" ? "text-rose-800" : "text-emerald-800"}`}>
                  حالة القيود: {doc.hasRestrictions}
                </span>
                <span className={`text-[10px] font-bold mt-0.5 ${doc.hasRestrictions === "مرهون" ? "text-rose-600" : "text-emerald-600"}`}>
                  {doc.hasRestrictions === "مرهون" ? "هذه الوثيقة تحتوي على رهن أو قيد يمنع التصرف." : "الوثيقة خالية من القيود المسجلة."}
                </span>
              </div>
            </div>

            {doc.hasRestrictions === "مرهون" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-5 border border-slate-200 rounded-2xl shadow-sm">
                 <InfoCard label="الجهة المرتهنة" value={doc.restrictedTo} />
                 <InfoCard label="قيمة الرهن" value={doc.restrictionValue ? `${doc.restrictionValue.toLocaleString()} ر.س` : "---"} isMono />
                 <div className="md:col-span-2">
                   <InfoCard label="نص القيد كما ورد بالصك" value={doc.restrictionText} />
                 </div>
              </div>
            )}
          </div>
        );

      case "links":
        return (
          <div className="flex flex-col gap-5 animate-in fade-in duration-300">
            <div className="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${doc.ownershipId ? "bg-indigo-100 text-indigo-600" : "bg-slate-100 text-slate-400"}`}>
                  <Building2 className="w-6 h-6" />
                </div>
                <div className="flex flex-col">
                  <h4 className="text-xs font-black text-[#123f59]">ملف الملكية (المشروع)</h4>
                  {doc.ownershipId ? (
                    <span className="text-sm font-bold text-indigo-600 mt-1 cursor-pointer hover:underline flex items-center gap-1">
                      {doc.ownership?.code} <ExternalLink className="w-3 h-3" />
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold text-slate-400 mt-1">غير مرتبط بأي مشروع حالياً.</span>
                  )}
                </div>
              </div>
              {!doc.ownershipId && (
                <button className="px-4 py-2 bg-[#123f59] text-white rounded-lg text-xs font-black hover:bg-[#0e7490] transition-colors shadow-sm">
                  ربط بمشروع
                </button>
              )}
            </div>

            <div className="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${doc.clientId ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400"}`}>
                  <Users className="w-6 h-6" />
                </div>
                <div className="flex flex-col">
                  <h4 className="text-xs font-black text-[#123f59]">ملف العميل</h4>
                  {doc.clientId ? (
                    <span className="text-sm font-bold text-emerald-600 mt-1 cursor-pointer hover:underline flex items-center gap-1">
                      {doc.client?.name} <ExternalLink className="w-3 h-3" />
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold text-slate-400 mt-1">غير مرتبط بملف عميل مباشر.</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case "ai_report":
        return (
          <div className="flex flex-col gap-4 animate-in fade-in duration-300">
            <div className="flex items-center gap-4 bg-gradient-to-l from-[#123f59] to-[#0e7490] p-5 rounded-2xl text-white shadow-md">
              <BrainCircuit className="w-10 h-10 text-[#d8b46a]" />
              <div className="flex flex-col">
                <h4 className="text-sm font-black">نسبة ثقة الذكاء الاصطناعي (AI Confidence)</h4>
                <div className="flex items-center gap-3 mt-2">
                  <div className="w-48 h-2 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-[#d8b46a] rounded-full" style={{ width: `${doc.aiConfidenceScore || 0}%` }}></div>
                  </div>
                  <span className="font-mono font-black text-lg">{doc.aiConfidenceScore || 0}%</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 border border-slate-200 rounded-2xl shadow-sm">
              <h5 className="text-xs font-black text-[#123f59] mb-3">ملاحظات المحرك الذكي:</h5>
              <p className="text-xs font-bold text-slate-600 leading-loose whitespace-pre-wrap">
                {doc.aiNotes || "لا توجد ملاحظات إضافية تم تسجيلها من قبل محرك القراءة."}
              </p>
            </div>

            {doc.isDuplicateSuspect && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                <div className="flex flex-col gap-1">
                  <h5 className="text-xs font-black text-rose-800">تحذير تكرار</h5>
                  <p className="text-[10px] font-bold text-rose-600 leading-relaxed">
                    يعتقد الذكاء الاصطناعي أن هذه الوثيقة مكررة أو تم رفع نسخة مطابقة منها مسبقاً في النظام بناءً على رقم الوثيقة والمساحة.
                  </p>
                </div>
              </div>
            )}
          </div>
        );

      case "logs":
        return (
          <div className="flex flex-col gap-4 animate-in fade-in duration-300">
            {doc.auditLogs?.length === 0 && <EmptyState text="لا يوجد سجل حركات لهذه الوثيقة." />}
            <div className="relative border-r-2 border-slate-200 ml-3 md:ml-6 mr-4 space-y-6 pb-4">
              {doc.auditLogs?.map((log, idx) => (
                <div key={log.id} className="relative pl-6">
                  <div className="absolute w-3.5 h-3.5 bg-[#0e7490] rounded-full -right-[21px] top-1 border-4 border-white shadow-sm"></div>
                  <div className="bg-white p-3 border border-slate-200 rounded-xl shadow-sm flex flex-col gap-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] font-black text-[#123f59]">{log.action}</span>
                      <span className="text-[9px] font-bold text-slate-400 font-mono">{new Date(log.createdAt).toLocaleString("ar-SA")}</span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-600">{log.details}</span>
                    <span className="text-[9px] font-bold text-slate-400 mt-1 inline-block">بواسطة: {log.user?.name || "النظام"}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // ==========================================
  // 🖼️ تصميم الهيكل الرئيسي للنافذة (Render)
  // ==========================================
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 font-[Tajawal]" dir="rtl">
      <div className={`bg-white rounded-[24px] shadow-2xl flex flex-col overflow-hidden transition-all duration-500 ease-in-out w-full max-w-[1400px] ${isFullscreen ? "h-[95vh]" : "h-[85vh]"}`}>
        
        {/* 🌟 Header 🌟 */}
        <div className="shrink-0 flex items-center justify-between p-4 md:p-5 border-b border-slate-200 bg-gradient-to-l from-[#123f59] via-[#0e7490] to-[#123f59] text-white">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center border border-white/20 shadow-inner">
              <FileText className="w-6 h-6 text-[#d8b46a]" />
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-black">{doc?.documentNumber ? `وثيقة رقم: ${doc.documentNumber}` : "تفاصيل الوثيقة المؤرشفة"}</h2>
                {doc && renderStatusBadge(doc.status)}
              </div>
              <span className="text-xs font-bold text-white/70">{doc?.docType || "غير محدد"} • أُضيفت في {formatDate(doc?.uploadDate)}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-xs font-bold transition-all">
              <Printer className="w-4 h-4" /> طباعة
            </button>
            <button onClick={() => setIsFullscreen(!isFullscreen)} className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
              {/* أيقونة التكبير */}
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
            </button>
            <div className="w-px h-6 bg-white/20 mx-1"></div>
            <button onClick={onClose} className="p-2 text-white/70 hover:text-rose-400 hover:bg-white/10 rounded-lg transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* 🌟 Body (Split View) 🌟 */}
        <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden bg-slate-50">
          
          {/* الجانب الأيمن: البيانات والتبويبات */}
          <div className="flex flex-col w-full lg:w-[500px] xl:w-[600px] shrink-0 border-l border-slate-200 bg-white">
            
            {/* قائمة التبويبات (Scrollable Horizontal Tabs) */}
            <div className="flex overflow-x-auto custom-scrollbar-slim border-b border-slate-200 shrink-0 px-2 pt-2 bg-slate-50/50">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all whitespace-nowrap outline-none ${
                    activeTab === tab.id 
                    ? "border-[#123f59] text-[#123f59] bg-white rounded-t-lg shadow-[0_-2px_10px_rgba(0,0,0,0.02)]" 
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100/50"
                  }`}
                >
                  <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? "text-[#d8b46a]" : ""}`} />
                  <span className="text-xs font-black">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* محتوى التبويب */}
            <div className="flex-1 overflow-y-auto p-5 custom-scrollbar bg-slate-50/30">
              {renderTabContent()}
            </div>
          </div>

          {/* الجانب الأيسر: عارض المستند (Document Viewer) */}
          <div className="flex-1 bg-slate-200/50 p-4 flex flex-col min-h-[400px]">
            <div className="bg-white border border-slate-200 rounded-2xl flex-1 shadow-sm overflow-hidden flex flex-col relative group">
              {/* شريط أدوات العارض */}
              <div className="absolute top-0 right-0 left-0 bg-gradient-to-b from-black/50 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity flex justify-end gap-2 z-10">
                {/* 🚀 التعديل هنا: تفعيل زر التحميل باستخدام getFullUrl */}
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
                // 🚀 التعديل هنا: استخدام getFullUrl في src الصورة والـ iframe
                doc.fileType?.includes('image') ? (
                  <div className="w-full h-full overflow-auto custom-scrollbar flex items-center justify-center p-4">
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
// 🧩 مكونات مساعدة صغيرة (Micro Components)
// ==========================================
const InfoCard = ({ label, value, icon: Icon, isMono = false }) => (
  <div className="flex flex-col p-3 bg-slate-50 border border-slate-100 rounded-xl">
    <span className="text-[10px] font-bold text-slate-400 mb-1 flex items-center gap-1.5">
      {Icon && <Icon className="w-3 h-3" />} {label}
    </span>
    <span className={`text-[12px] font-black text-[#123f59] break-words ${isMono ? "font-mono" : ""}`}>
      {value || "---"}
    </span>
  </div>
);

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