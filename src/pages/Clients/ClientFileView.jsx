import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getClientById } from "../../api/clientApi"; // 👈 تأكد من صحة المسار
import {
  Copy,
  User,
  Eye,
  Award,
  FileText,
  Receipt,
  FileCheck,
  DollarSign,
  Landmark,
  TrendingUp,
  MessageCircle,
  PhoneCall,
  Mail,
  Plus,
  Upload,
  Printer,
  RefreshCw,
  Shield,
  MapPin,
  BarChart3,
  Star,
  History,
  Phone,
  ShieldCheck,
  ChevronDown,
  Building,
  Home,
  Clock,
  TriangleAlert,
  X,
  Search,
  FileStack,
  ArrowUpRight,
  Link2,
  Download,
  CircleDot,
  Ban,
  Paperclip,
  Archive,
  CheckCircle,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

// دالة مساعدة لاسم العميل
const getFullName = (nameObj) => {
  if (!nameObj) return "غير محدد";
  if (typeof nameObj === "string") return nameObj;
  if (nameObj.ar) return nameObj.ar;
  const parts = [
    nameObj.firstAr || nameObj.firstName,
    nameObj.fatherAr || nameObj.fatherName,
    nameObj.grandAr || nameObj.grandFatherName,
    nameObj.familyAr || nameObj.familyName,
  ];
  return (
    parts.filter(Boolean).join(" ").trim() ||
    nameObj.en ||
    nameObj.englishName ||
    "غير محدد"
  );
};

// دالة مساعدة لتنسيق التاريخ
const formatDate = (dateString) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// دالة مساعدة لإخفاء رقم الهوية جزئياً
const maskId = (id) => {
  if (!id || id.length < 6) return id || "—";
  return id.slice(0, 3) + "****" + id.slice(-3);
};

const ClientFileView = ({ clientId, onBack }) => {
  // ==========================================
  // States
  // ==========================================
  const [activeTab, setActiveTab] = useState("summary");
  const [isPhotoBlurred, setIsPhotoBlurred] = useState(false);
  const [isIdMasked, setIsIdMasked] = useState(true);

  // ==========================================
  // Fetch Client Data
  // ==========================================
  const {
    data: client,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["client", clientId],
    queryFn: () => getClientById(clientId),
    enabled: !!clientId,
  });

  // ==========================================
  // Tabs Config
  // ==========================================
  const TABS = [
    { id: "summary", label: "ملخص", icon: User },
    { id: "basic", label: "البيانات الأساسية", icon: FileText },
    { id: "contact", label: "العنوان والتواصل", icon: MapPin },
    {
      id: "docs",
      label: "وثائق العميل",
      icon: FileCheck,
      badge: client?._count?.attachments || "0",
      badgeColor: "bg-slate-500",
    },
    { id: "tax", label: "الزكاة/الضريبة", icon: Receipt },
    {
      id: "transactions",
      label: "معاملات العميل",
      icon: FileText,
      badge: client?._count?.transactions || "0",
      badgeColor: "bg-blue-600",
    },
    {
      id: "financial",
      label: "السجل المالي",
      icon: BarChart3,
      badge: "1",
      badgeColor: "bg-cyan-600",
    },
    { id: "rating", label: "التقييم والملاحظات", icon: Star },
    { id: "audit", label: "التدقيق/الزمن", icon: History },
    { id: "reports", label: "التقارير", icon: BarChart3 },
    {
      id: "properties",
      label: "ملكيات العميل",
      icon: Landmark,
      badge: client?.ownershipFiles?.length || "0",
      badgeColor: "bg-violet-600",
    },
    {
      id: "obligations",
      label: "التزامات الأمانة",
      icon: Receipt,
      badge: "0",
      badgeColor: "bg-red-500",
    },
  ];

  // Helper
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("تم النسخ بنجاح");
  };

  const openWhatsApp = (phone) => {
    if (!phone) return toast.error("لا يوجد رقم جوال مسجل");
    let cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.startsWith("05"))
      cleanPhone = "966" + cleanPhone.substring(1);
    window.open(`https://wa.me/${cleanPhone}`, "_blank");
  };

  // شاشات التحميل والخطأ
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-slate-50">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
        <h2 className="text-lg font-bold text-slate-700">
          جاري تحميل ملف العميل...
        </h2>
      </div>
    );
  }

  if (isError || !client) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-slate-50">
        <h2 className="text-xl font-bold text-red-600 mb-4">
          حدث خطأ أو لم يتم العثور على بيانات العميل
        </h2>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-slate-200 rounded-lg font-bold hover:bg-slate-300"
        >
          العودة للسجل
        </button>
      </div>
    );
  }

  const clientName = getFullName(client.name);
  const englishName =
    client.name?.en || client.name?.englishName || client.name?.firstEn || "";

  // ==========================================
  // Render Tab Contents
  // ==========================================

  const renderSummaryTab = () => (
    <div className="space-y-6 animate-in fade-in duration-300">
      <h3 className="text-lg font-bold text-slate-800">ملخص العميل</h3>

      {/* بطاقة الملخص السريع */}
      <div className="flex flex-col md:flex-row gap-5 p-5 bg-slate-50 border border-slate-200 rounded-xl items-center">
        <div className="relative">
          <div
            className={`w-20 h-24 rounded-xl overflow-hidden border-2 border-blue-500/20 bg-indigo-50 flex items-center justify-center transition-all ${isPhotoBlurred ? "blur-md" : ""}`}
          >
            <User className="w-9 h-9 text-indigo-400" />
          </div>
          <button
            onClick={() => setIsPhotoBlurred(!isPhotoBlurred)}
            className="absolute -top-1 -left-1 p-1 bg-slate-400 text-white rounded-md border-2 border-white flex items-center gap-1 hover:bg-slate-500"
          >
            <ShieldCheck className="w-3 h-3" />
          </button>
        </div>
        <div className="flex-1 text-center md:text-right">
          <div className="text-xl font-bold text-slate-800 mb-1">
            {clientName}
          </div>
          <div className="text-sm text-slate-500 dir-ltr text-left md:text-right mb-2">
            {englishName || "—"}
          </div>
          <div className="flex flex-wrap justify-center md:justify-start gap-4">
            <div className="text-xs text-slate-500">
              رقم الهوية:{" "}
              <strong className="text-blue-800 font-mono">
                {isIdMasked
                  ? maskId(client.identification?.idNumber)
                  : client.identification?.idNumber || "—"}
              </strong>
              <button
                onClick={() => setIsIdMasked(!isIdMasked)}
                className="ml-2 text-blue-500 hover:text-blue-700 inline-block"
              >
                <Eye className="w-3 h-3 inline" />
              </button>
            </div>
            <div className="flex gap-2 text-xs">
              <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded">
                {client.type || "غير محدد"}
              </span>
              <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded">
                {client.nationality || "سعودي"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* الإحصائيات السريعة */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="p-5 bg-blue-50 border border-blue-100 rounded-xl text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-bold text-blue-800">المعاملات</span>
          </div>
          <div className="text-3xl font-black text-blue-800">
            {client._count?.transactions || 0}
          </div>
          <div className="text-xs text-blue-400 mt-1">إجمالي المعاملات</div>
        </div>
        <div className="p-5 bg-green-50 border border-green-100 rounded-xl text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            <span className="text-sm font-bold text-green-800">التحصيل</span>
          </div>
          <div className="text-3xl font-black text-green-700">
            {(client.totalFees || 0).toLocaleString()}
          </div>
          <div className="text-xs text-green-500 mt-1">ريال سعودي</div>
        </div>
        <div className="p-5 bg-amber-50 border border-amber-100 rounded-xl text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <FileCheck className="w-5 h-5 text-amber-600" />
            <span className="text-sm font-bold text-amber-800">الوثائق</span>
          </div>
          <div className="text-3xl font-black text-amber-700">
            {client._count?.attachments || 0}
          </div>
          <div className="text-xs text-amber-500 mt-1">مستند مرفوع</div>
        </div>
        <div className="p-5 bg-pink-50 border border-pink-100 rounded-xl text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Award className="w-5 h-5 text-pink-600" />
            <span className="text-sm font-bold text-pink-800">التقييم</span>
          </div>
          <div className="text-3xl font-black text-pink-700">
            {client.grade || "-"}
          </div>
          <div className="text-xs text-pink-500 mt-1">مستوى العميل</div>
        </div>
        <div className="p-5 bg-cyan-50 border border-cyan-100 rounded-xl text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Receipt className="w-5 h-5 text-cyan-600" />
            <span className="text-sm font-bold text-cyan-800">العروض</span>
          </div>
          <div className="text-3xl font-black text-cyan-700">
            {client._count?.quotations || 0}
          </div>
          <div className="text-xs text-cyan-500 mt-1">عروض أسعار</div>
        </div>
      </div>

      {/* معلومات إضافية */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-slate-50 rounded-xl">
          <h4 className="font-bold text-slate-700 mb-3">معلومات الاتصال</h4>
          <div className="space-y-2 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-slate-400" />{" "}
              <span dir="ltr">{client.contact?.mobile || "—"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-slate-400" />{" "}
              {client.contact?.email || "—"}
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-slate-400" />{" "}
              {client.address?.city || ""}{" "}
              {client.address?.district ? `- ${client.address.district}` : ""}
            </div>
          </div>
        </div>
        <div className="p-4 bg-slate-50 rounded-xl">
          <h4 className="font-bold text-slate-700 mb-3">الحالة والنشاط</h4>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500">الحالة:</span>
              <span
                className={`px-2 py-0.5 rounded text-xs font-bold ${client.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
              >
                {client.isActive ? "نشط" : "غير نشط"}
              </span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500">تاريخ الإضافة:</span>
              <span className="font-bold text-slate-800">
                {formatDate(client.createdAt)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">تم الإضافة بواسطة:</span>
              <span className="font-bold text-slate-800">النظام</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderBasicInfoTab = () => (
    <div className="space-y-6 animate-in fade-in duration-300">
      <h3 className="text-lg font-bold text-slate-800">البيانات الأساسية</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { label: "كود العميل", value: client.clientCode, ltr: true },
          { label: "نوع العميل", value: client.type },
          { label: "الاسم الكامل", value: clientName },
          {
            label: "رقم الهوية/السجل",
            value: client.identification?.idNumber || "—",
            ltr: true,
          },
          {
            label: "رقم الجوال",
            value: client.contact?.mobile || "—",
            ltr: true,
          },
          {
            label: "البريد الإلكتروني",
            value: client.contact?.email || "—",
            ltr: true,
          },
          {
            label: "الاسم الأول (عربي)",
            value: client.name?.firstAr || client.name?.firstName || "—",
          },
          {
            label: "الاسم الأول (English)",
            value: client.name?.firstEn || client.name?.englishName || "—",
            ltr: true,
          },
          {
            label: "اسم الأب (عربي)",
            value: client.name?.fatherAr || client.name?.fatherName || "—",
          },
          {
            label: "اسم الأب (English)",
            value: client.name?.fatherEn || "—",
            ltr: true,
          },
          {
            label: "اسم العائلة (عربي)",
            value: client.name?.familyAr || client.name?.familyName || "—",
          },
          {
            label: "اسم العائلة (English)",
            value: client.name?.familyEn || "—",
            ltr: true,
          },
        ].map((item, i) => (
          <div
            key={i}
            className="p-4 bg-slate-50 rounded-lg border border-slate-100"
          >
            <div className="text-xs text-slate-500 font-bold mb-1">
              {item.label}
            </div>
            <div
              className={`text-sm font-bold text-slate-800 ${item.ltr ? "dir-ltr text-left" : ""}`}
            >
              {item.value}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-5 bg-green-50 border border-green-200 rounded-xl">
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="w-6 h-6 text-green-600" />
          <div className="flex-1">
            <h4 className="font-bold text-green-800">صفة المستثمر / الشركات</h4>
            <p className="text-xs text-slate-500">
              بيانات إضافية للشركات والجهات
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 bg-white p-4 rounded-lg border border-slate-100 shadow-sm">
          <div>
            <div className="text-[10px] text-slate-400 font-bold mb-1">
              اسم الشركة
            </div>
            <div className="text-sm font-bold">{client.company || "—"}</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-bold mb-1">
              الرقم الضريبي
            </div>
            <div className="text-sm font-bold font-mono">
              {client.taxNumber || "—"}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-bold mb-1">
              المهنة / النشاط
            </div>
            <div className="text-sm font-bold">{client.occupation || "—"}</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-bold mb-1">
              الجنسية
            </div>
            <div className="text-sm font-bold">{client.nationality || "—"}</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContactTab = () => (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* بطاقة التواصل الأساسية */}
        <div className="flex-1 p-5 bg-slate-50 border-2 border-emerald-500 rounded-xl">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2 text-emerald-600">
              <CheckCircle className="w-5 h-5" />
              <h3 className="font-bold">بطاقة التواصل الأساسية</h3>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-white p-3 rounded-lg border border-slate-200 flex flex-col gap-1">
              <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1">
                <Phone className="w-3 h-3 text-blue-500" /> الجوال الرئيسي
              </span>
              <span className="font-bold dir-ltr text-left">
                {client.contact?.mobile || "—"}
              </span>
            </div>
            <div className="bg-white p-3 rounded-lg border border-slate-200 flex flex-col gap-1">
              <div className="flex justify-between">
                <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1">
                  <MessageCircle className="w-3 h-3 text-green-500" /> واتساب
                </span>
                <span className="text-[9px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                  {client.contact?.whatsapp ? "مسجل" : "غير مسجل"}
                </span>
              </div>
              <span className="font-bold dir-ltr text-left">
                {client.contact?.whatsapp || "—"}
              </span>
            </div>
            <div className="bg-white p-3 rounded-lg border border-slate-200 flex flex-col gap-1">
              <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1">
                <Mail className="w-3 h-3 text-amber-500" /> البريد الإلكتروني
              </span>
              <span className="font-bold text-sm">
                {client.contact?.email || "—"}
              </span>
            </div>
            <div className="bg-white p-3 rounded-lg border border-slate-200 flex flex-col gap-1">
              <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1">
                <PhoneCall className="w-3 h-3 text-slate-400" /> رقم إضافي
              </span>
              <span className="font-bold text-sm dir-ltr text-left">
                {client.contact?.additionalPhone || "—"}
              </span>
            </div>
          </div>
        </div>

        {/* أزرار سريعة */}
        <div className="w-full lg:w-48 flex flex-col gap-2">
          <button
            onClick={() => openWhatsApp(client.contact?.mobile)}
            className="flex-1 bg-green-600 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-green-700 shadow-sm"
          >
            <MessageCircle className="w-4 h-4" /> مراسلة واتساب
          </button>
          <a
            href={`tel:${client.contact?.mobile}`}
            className="flex-1 bg-blue-600 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-blue-700 shadow-sm"
          >
            <PhoneCall className="w-4 h-4" /> اتصال مباشر
          </a>
          <a
            href={`mailto:${client.contact?.email}`}
            className="flex-1 bg-amber-600 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-amber-700 shadow-sm"
          >
            <Mail className="w-4 h-4" /> إرسال بريد
          </a>
        </div>
      </div>

      {/* العنوان الوطني */}
      <div className="p-5 bg-blue-50 border border-blue-200 rounded-xl">
        <h4 className="flex items-center gap-2 text-blue-800 font-bold mb-4">
          <MapPin className="w-5 h-5" /> العنوان الوطني
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { l: "المدينة", v: client.address?.city || "—", i: Building },
            { l: "الحي", v: client.address?.district || "—", i: Home },
            { l: "الشارع", v: client.address?.street || "—", i: MapPin },
            {
              l: "رقم المبنى",
              v: client.address?.buildingNo || "—",
              i: Building,
            },
            { l: "رقم الوحدة", v: client.address?.unitNo || "—", i: Home },
            {
              l: "الرمز البريدي",
              v: client.address?.zipCode || "—",
              i: MapPin,
            },
            {
              l: "الرقم الإضافي",
              v: client.address?.additionalNo || "—",
              i: Building,
            },
            {
              l: "الرمز المختصر",
              v: client.address?.shortCodeEn || "—",
              i: Home,
            },
          ].map((item, i) => (
            <div
              key={i}
              className="bg-white p-3 rounded-lg border border-slate-200"
            >
              <div className="text-[10px] text-slate-500 font-bold flex items-center gap-1 mb-1">
                <item.i className="w-3 h-3 text-blue-400" /> {item.l}
              </div>
              <div className="font-bold text-sm text-slate-800">{item.v}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTransactionsTab = () => (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <FileText className="w-5 h-5 text-teal-500" /> معاملات العميل
        </h3>
        <button className="px-4 py-2 bg-teal-50 text-teal-700 border border-teal-200 rounded-lg text-xs font-bold shadow-sm flex items-center gap-2">
          <Plus className="w-4 h-4" /> إنشاء معاملة جديدة
        </button>
      </div>

      <div className="overflow-x-auto bg-white border border-slate-200 rounded-xl shadow-sm">
        <table className="w-full text-right text-sm">
          <thead className="bg-slate-50 border-b-2 border-slate-200 text-slate-600">
            <tr>
              <th className="p-3">#</th>
              <th className="p-3">كود المعاملة</th>
              <th className="p-3">النوع</th>
              <th className="p-3">الحالة</th>
              <th className="p-3">الإجمالي (ر.س)</th>
              <th className="p-3">تاريخ الإنشاء</th>
              <th className="p-3 text-center">إجراء</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {client.transactions?.length > 0 ? (
              client.transactions.map((tr, idx) => (
                <tr key={tr.id} className="hover:bg-slate-50">
                  <td className="p-3">{idx + 1}</td>
                  <td className="p-3 font-mono font-bold text-blue-800">
                    {tr.code || tr.id.substring(0, 8)}
                  </td>
                  <td className="p-3">{tr.serviceType || "—"}</td>
                  <td className="p-3">
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                      {tr.status || "—"}
                    </span>
                  </td>
                  <td className="p-3 font-mono font-bold">
                    {(tr.totalAmount || 0).toLocaleString()}
                  </td>
                  <td className="p-3">{formatDate(tr.createdAt)}</td>
                  <td className="p-3 text-center">
                    <button className="text-blue-600 bg-blue-50 px-3 py-1 rounded text-xs font-bold hover:bg-blue-100">
                      فتح
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="p-8 text-center text-slate-500">
                  لا توجد معاملات مسجلة لهذا العميل.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderDocsTab = () => (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <FileCheck className="w-5 h-5 text-violet-500" /> وثائق العميل
        </h3>
        <button className="px-3 py-1.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg text-xs font-bold shadow flex items-center gap-1">
          <Upload className="w-3 h-3" /> رفع وثيقة
        </button>
      </div>

      {client.attachments?.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {client.attachments.map((doc, idx) => (
            <div
              key={doc.id || idx}
              className="p-4 bg-white border border-slate-200 rounded-xl flex items-center justify-between hover:border-violet-300 transition-colors shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-violet-50 rounded-lg text-violet-600">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-700 truncate max-w-[150px]">
                    {doc.name || "مستند"}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    {formatDate(doc.createdAt)} • {doc.type || "عام"}
                  </div>
                </div>
              </div>
              <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                <Eye className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-6 text-center py-12 bg-white border border-slate-200 rounded-xl shadow-sm">
          <FileStack className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <div className="font-bold text-slate-600 text-lg">
            لا توجد وثائق مرفوعة
          </div>
          <div className="text-sm text-slate-400 mt-1">
            قم برفع الهوية، السجل التجاري، أو أي مستندات أخرى للعميل
          </div>
        </div>
      )}
    </div>
  );

  const renderPropertiesTab = () => (
    <div className="space-y-4 animate-in fade-in duration-300">
      <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
        <Landmark className="w-5 h-5 text-violet-500" /> ملكيات العميل (الصكوك)
      </h3>

      <div className="overflow-x-auto bg-white border border-slate-200 rounded-xl shadow-sm mt-4">
        <table className="w-full text-right text-sm">
          <thead className="bg-slate-50 border-b-2 border-slate-200 text-slate-600">
            <tr>
              <th className="p-3">كود الملكية</th>
              <th className="p-3">رقم الصك</th>
              <th className="p-3">المدينة/الحي</th>
              <th className="p-3">المساحة (م²)</th>
              <th className="p-3 text-center">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {client.ownershipFiles?.length > 0 ? (
              client.ownershipFiles.map((prop, idx) => (
                <tr key={prop.id || idx} className="hover:bg-slate-50">
                  <td className="p-3 font-mono font-bold text-purple-700">
                    {prop.code || `PRO-${idx + 1}`}
                  </td>
                  <td className="p-3 font-mono text-slate-600">
                    {prop.deedNumber || "—"}
                  </td>
                  <td className="p-3">
                    {prop.city || "—"}{" "}
                    {prop.district ? `/ ${prop.district}` : ""}
                  </td>
                  <td className="p-3 font-mono font-bold">
                    {prop.area || "—"}
                  </td>
                  <td className="p-3 text-center">
                    <button className="text-purple-600 bg-purple-50 px-3 py-1 rounded text-xs font-bold hover:bg-purple-100">
                      عرض التفاصيل
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="p-8 text-center text-slate-500">
                  لا توجد ملكيات أو صكوك مسجلة لهذا العميل.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  // ==========================================
  // Main Layout Render
  // ==========================================
  return (
    <div
      className="flex flex-col h-full bg-slate-100 p-4 md:p-6 custom-scrollbar overflow-y-auto"
      dir="rtl"
    >
      {/* Header (Sticky) */}
      <div className="sticky top-0 z-50 bg-white border border-slate-200 rounded-xl shadow-sm mb-4">
        {/* Top Bar */}
        <div className="p-4 border-b border-slate-100 flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            {/* زر العودة */}
            <button
              onClick={onBack}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors flex items-center gap-2 font-bold text-sm"
            >
              <ArrowLeft className="w-4 h-4" /> العودة
            </button>

            <div className="h-6 w-px bg-slate-200 mx-1"></div>

            <div className="px-3 py-1.5 bg-blue-600 text-white rounded-lg font-mono font-bold text-sm tracking-wider flex items-center gap-2">
              {client.clientCode}
              <button
                onClick={() => handleCopy(client.clientCode)}
                className="text-blue-200 hover:text-white"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
            <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold whitespace-nowrap">
              {client.type || "عميل"}
            </span>

            <div className="hidden md:flex items-center gap-3 border-r border-slate-200 pr-3">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center border border-indigo-200 text-indigo-600">
                <User className="w-4 h-4" />
              </div>
              <div>
                <div
                  className="font-bold text-slate-800 text-sm max-w-[200px] truncate"
                  title={clientName}
                >
                  {clientName}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <button
                onClick={() => openWhatsApp(client.contact?.mobile)}
                className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                title="واتساب"
              >
                <MessageCircle className="w-4 h-4" />
              </button>
              <a
                href={`tel:${client.contact?.mobile}`}
                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                title="اتصال"
              >
                <PhoneCall className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-1 px-2 overflow-x-auto custom-scrollbar bg-slate-50/50 rounded-b-xl">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 text-xs font-bold whitespace-nowrap transition-colors ${activeTab === tab.id ? "border-blue-600 text-blue-700 bg-white" : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100"}`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.badge && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[9px] text-white ${tab.badgeColor}`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 bg-white border border-slate-200 rounded-xl p-6 shadow-sm overflow-y-auto custom-scrollbar min-h-[500px]">
        {activeTab === "summary" && renderSummaryTab()}
        {activeTab === "basic" && renderBasicInfoTab()}
        {activeTab === "contact" && renderContactTab()}
        {activeTab === "docs" && renderDocsTab()}
        {activeTab === "transactions" && renderTransactionsTab()}
        {activeTab === "properties" && renderPropertiesTab()}

        {/* Placeholder for missing tabs */}
        {[
          "financial",
          "tax",
          "rating",
          "audit",
          "reports",
          "obligations",
        ].includes(activeTab) && (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 py-20">
            <BarChart3 className="w-16 h-16 mb-4 opacity-20" />
            <h3 className="text-xl font-bold text-slate-600 mb-2">
              جاري استكمال التبويب
            </h3>
            <p>سيتم عرض البيانات الخاصة بهذا التبويب هنا قريباً.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientFileView;
