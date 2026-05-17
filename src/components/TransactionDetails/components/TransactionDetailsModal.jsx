import React, { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "../../../api/axios";
import {
  X,
  Archive,
  RefreshCw,
  Trash2,
  FileText,
  History,
  Calculator,
  Handshake,
  Building2,
  User,
  Monitor,
  Banknote,
  Scale,
  PieChart,
  Paperclip,
  CalendarDays,
  Activity,
  Check,
  Circle,
  ArrowLeftRight,
  FileEdit,
  Image,
  MessageCircle,
  Map,
  AlertCircle,
  FolderCog,
  Receipt,
  Building,
  FileSignature,
  MessageSquare,
  ChevronDown,
  ShieldCheck,
  ClipboardList,
  HardHat,
  Car,
  Wind,
  Zap,
  Pickaxe,
  Briefcase,
  FileCheck,
  Landmark,
  PenLine,
  EyeOff,
  Menu,
  FolderOpen,
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import AccessControl from "../../../components/AccessControl";
// 💡 1. استيراد المساعدات
import {
  safeNum,
  safeText,
  parseNumber,
  formatDateTime,
  getDayNameAndDate,
} from "../utils/transactionUtils";

// 💡 2. استيراد التبويبات المقسمة
import { BasicTab } from "./tabs/BasicTab";
import { RequestDataTab } from "./tabs/RequestDataTab";
import { StatusTab } from "./tabs/StatusTab";
import { AttachmentsTab } from "./tabs/AttachmentsTab";
import { LogsTab } from "./tabs/LogsTab";

import { FinancialTab } from "./tabs/FinancialTab";
import { PaymentsTab } from "./tabs/PaymentsTab";
import { SettlementTab } from "./tabs/SettlementTab";
import { ProfitsTab } from "./tabs/ProfitsTab";
import { DatesTab } from "./tabs/DatesTab";

import { BrokersTab } from "./tabs/BrokersTab";
import { AgentsTab } from "./tabs/AgentsTab";
import { RemoteTab } from "./tabs/RemoteTab";
import { CoopOfficeTab } from "./tabs/CoopOfficeTab";
import { TasksTab } from "./tabs/TasksTab";
import { CommentsTab } from "./tabs/CommentsTab";
import { AuthorityNotesTab } from "./tabs/AuthorityNotesTab";

// 💡 3. استيراد النوافذ المنبثقة الفرعية (Modals)
import {
  PreviewModal,
  AddPaymentModal,
  AddAgentModal,
  AddBrokerModal,
  AddRemoteTaskModal,
  CoopFeeModal,
  PayPersonModal,
  PayTaskModal,
} from "./TransactionModals";

import FolderViewerWindow from "../../../pages/Transactions/TransactionFiles/components/FolderViewerWindow";

const IconWithText = ({
  icon: Icon,
  text,
  className = "",
  iconClassName = "",
  textClassName = "",
  vertical = false,
}) => (
  <span
    className={`
      inline-flex items-center justify-center gap-1
      ${vertical ? "flex-col" : "flex-row"}
      ${className}
    `}
  >
    {Icon && <Icon className={iconClassName || "h-4 w-4"} />}

    {text && (
      <span className={textClassName || "text-[9px] font-black leading-none"}>
        {text}
      </span>
    )}
  </span>
);

const getTabIconText = (label = "") => {
  const clean = String(label).replace(/[()]/g, " ").trim();
  if (!clean) return "";

  const parts = clean.split(/\s+/).filter(Boolean);
  return parts.length > 1 ? parts[0] : clean.slice(0, 5);
};

const SidebarMiniMetric = ({ label, value, tone = "blue" }) => {
  const tones = {
    blue: "border-blue-200 bg-blue-50 text-blue-700",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
    rose: "border-rose-200 bg-rose-50 text-rose-700",
  };

  return (
    <div
      className={`rounded-xl border px-1.5 py-1.5 text-center shadow-sm ${
        tones[tone] || tones.blue
      }`}
    >
      <div className="text-[7px] font-black opacity-70">{label}</div>
      <div className="mt-0.5 truncate font-mono text-[9px] font-black">
        {value}
      </div>
    </div>
  );
};

export const TransactionDetailsModal = ({
  isOpen,
  onClose,
  tx: initialTx,
  refetchTable,
}) => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("basic");

  // المجموعات تبقى مفتوحة دائمًا في الشريط الجانبي

  // حالة التحكم بالشريط الجانبي في الموبايل
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false);

  // حالة التحكم بنافذة مدير الملفات
  const [isFolderViewerOpen, setIsFolderViewerOpen] = useState(false);

  // 🚀 جلب الفئات (Categories) لاستخدامها في نافذة إدارة الملفات
  const { data: categories = [] } = useQuery({
    queryKey: ["transaction-categories"],
    queryFn: async () => {
      // ✅ تم تصحيح المسار ليتطابق مع إعدادات الباك إند
      const res = await api.get("/files/categories");
      return res.data?.data || [];
    },
    enabled: isOpen,
  });

  const backendUrl = api.defaults.baseURL.replace("/api", "");

  const { user } = useAuth();
  const empId = user?.jobNumber || user?.employeeId || "";
  const currentUser = user?.name
    ? empId
      ? `${user.name} (${empId})`
      : user.name
    : "موظف النظام";

  // ==========================================================
  // 💡 1. Queries (جلب البيانات)
  // ==========================================================
  const { data: transactionsData = [] } = useQuery({
    queryKey: ["private-transactions-full"],
    queryFn: async () => {
      const res = await api.get("/private-transactions");
      return res.data?.data || res.data || [];
    },
  });

  const tx = useMemo(() => {
    if (!initialTx) return null;
    return transactionsData.find((t) => t.id === initialTx.id) || initialTx;
  }, [transactionsData, initialTx]);

  // 🚀 تهيئة كائن المعاملة ليتطابق مع ما تتوقعه نافذة FolderViewerWindow
  const formattedTransactionForFolderViewer = useMemo(() => {
    if (!tx) return null;

    const rawName =
      tx.clientName || tx.client || tx.ownerNames || "عميل غير محدد";
    const cleanName = rawName.split("-")[0].split("(")[0].trim();
    const nameParts = cleanName.split(" ").filter((part) => part.trim() !== "");

    let firstName = "عميل";
    let lastName = "";

    if (nameParts.length === 1) {
      firstName = nameParts[0];
    } else if (nameParts.length === 2) {
      firstName = nameParts[0];
      lastName = nameParts[1];
    } else if (nameParts.length > 2) {
      firstName = nameParts.slice(0, nameParts.length - 1).join(" ");
      lastName = nameParts[nameParts.length - 1];
    }

    const isWord = /^[a-zA-Z\u0600-\u06FF\s]+$/.test(lastName);
    if (!isWord && lastName !== "") {
      firstName = cleanName;
      lastName = "";
    }

    return {
      id: tx.id,
      transactionId: tx.id,
      transactionCode: tx.ref || tx.transactionCode || tx.id.substring(0, 8),
      ownerFirstName: firstName,
      ownerLastName: lastName,
      transactionType: tx.type || tx.category || "معاملة",
      district: tx.districtName || tx.district || "غير محدد",
      sector: tx.sector || "غير محدد",
      commonName: tx.internalName || "",
      officeName: tx.office || tx.source || "غير محدد",
      supervisingOffice: tx.supervisingOffice || "غير محدد",
      financialStatus: tx.financialStatus || "غير مسدد",
      technicalStatus: tx.technicalStatus || "قيد المراجعة",
      proceduralStatus: tx.proceduralStatus || tx.status || "جارية",
      brokerName: tx.mediator || "",
      agentName:
        Array.isArray(tx.agents) && tx.agents.length > 0
          ? tx.agents.map((a) => a.name).join(" و ")
          : "",
      createdAt: tx.created || tx.createdAt || "—",
      modifiedAt: tx.updated || tx.modifiedAt || tx.created || "—",
      clientPhone: tx.phone && !tx.phone.includes("غير متوفر") ? tx.phone : "",
      clientEmail: tx.email || tx.client?.email || "",
      isUrgent: tx.isUrgent || false,
      locked: tx.locked || false,
      hasLinked:
        tx.linkedParentId ||
        (tx.linkedChildren && tx.linkedChildren.length > 0) ||
        false,
      totalSize: tx.totalSize || 0,
    };
  }, [tx]);

  const { data: exchangeRates = [] } = useQuery({
    queryKey: ["exchange-rates"],
    queryFn: async () =>
      (await api.get("/remote-workers/exchange-rates")).data?.data || [],
    enabled: isOpen,
  });

  const { data: offices = [] } = useQuery({
    queryKey: ["coop-offices-modal"],
    queryFn: async () => (await api.get("/coop-offices")).data?.data || [],
    enabled: isOpen,
  });

  const { data: riyadhZones = [] } = useQuery({
    queryKey: ["riyadhZones-modal"],
    queryFn: async () => (await api.get("/riyadh-zones")).data?.data || [],
    enabled: isOpen,
  });

  const { data: clients = [] } = useQuery({
    queryKey: ["clients-simple-modal"],
    queryFn: async () => {
      const res = await api.get("/clients/simple");
      return Array.isArray(res.data) ? res.data : res.data?.data || [];
    },
    enabled: isOpen,
  });

  const { data: systemSettings } = useQuery({
    queryKey: ["system-settings"],
    queryFn: async () => (await api.get("/settings")).data?.data || {},
    enabled: isOpen,
  });

  const { data: allCoopFees = [] } = useQuery({
    queryKey: ["coop-office-fees"],
    queryFn: async () => (await api.get("/coop-office-fees")).data?.data || [],
    enabled: isOpen,
  });

  const { data: bankAccounts = [] } = useQuery({
    queryKey: ["bank-accounts-modal"],
    queryFn: async () => (await api.get("/bank-accounts")).data?.data || [],
    enabled: isOpen,
  });

  const { data: persons = [] } = useQuery({
    queryKey: ["persons-directory-modal"],
    queryFn: async () => (await api.get("/persons")).data?.data || [],
    enabled: isOpen,
  });

  // ==========================================================
  // 💡 2. States (الحالات)
  // ==========================================================
  const [openSections, setOpenSections] = useState({
    brokers: true,
    agents: true,
    remote: true,
    expenses: true,
  });
  const toggleSection = (sec) =>
    setOpenSections((p) => ({ ...p, [sec]: !p[sec] }));

  const [previewFile, setPreviewFile] = useState(null);
  const [isEditingBasic, setIsEditingBasic] = useState(false);
  const [isEditingFinancial, setIsEditingFinancial] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [payTaskData, setPayTaskData] = useState(null);
  const [payPersonData, setPayPersonData] = useState(null);

  const [isCoopFeeModalOpen, setIsCoopFeeModalOpen] = useState(false);
  const [coopFeeMode, setCoopFeeMode] = useState("add");
  const [editingCoopFeeId, setEditingCoopFeeId] = useState(null);
  const initialCoopFeeForm = {
    officeId: "",
    requestType: tx?.type || "اصدار",
    officeFees: "",
    paidAmount: "",
    dueDate: "",
    providedServices: "",
    uploadStatus: "مع الرفع على النظام",
    licenseNumber: "",
    licenseYear: "",
    serviceNumber: "",
    serviceYear: "",
    entityName: "",
    notes: "",
  };
  const [coopFeeForm, setCoopFeeForm] = useState(initialCoopFeeForm);

  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    date: new Date().toISOString().split("T")[0],
    method: "تحويل بنكي",
    ref: "",
    notes: "",
    bankAccountId: "",
    isDepositedToSafe: false,
    receiptFile: null,
  });

  const [requestDataForm, setRequestDataForm] = useState({
    designerOffice: "",
    supervisorOffice: "",
    electronicLicenseNumber: "",
    electronicLicenseHijriYear: "",
    electronicLicenseDate: "",
    oldLicenseNumber: "",
    oldLicenseHijriYear: "",
    oldLicenseDate: "",
    requestNumber: "",
    requestYear: "",
    serviceNumber: "",
    serviceYear: "",
    responsibleEmployee: currentUser,
    surveyRequestNumber: "",
    surveyRequestYear: "",
    surveyServiceNumber: "",
    surveyServiceYear: "",
    surveyReportNumber: "",
    surveyReportDate: "",
    contractNumber: "",
    contractApprovalDate: "",
    contractApprovedBy: "",
  });

  const [isAddAgentOpen, setIsAddAgentOpen] = useState(false);
  const [agentForm, setAgentForm] = useState({
    agentId: "",
    role: "معقب",
    fees: "",
    dueDate: "",
  });

  const [isAddRemoteTaskOpen, setIsAddRemoteTaskOpen] = useState(false);
  const [remoteTaskForm, setRemoteTaskForm] = useState({
    workerId: "",
    taskName: "",
    costSar: "",
    isPaid: false,
    paymentAmount: "",
    paymentCurrency: "SAR",
    paymentDate: new Date().toISOString().split("T")[0],
  });

  const [dateForm, setDateForm] = useState({
    amountType: "full",
    amount: "",
    type: "specific_date",
    date: "",
    person: "",
    notes: "",
  });
  const [expenseForm, setExpenseForm] = useState({
    amount: "",
    date: new Date().toISOString().split("T")[0],
    description: "",
  });
  const [statusForm, setStatusForm] = useState({
    currentStatus: "عند المهندس للدراسة",
    serviceNumber: "",
    hijriYear1: "",
    licenseNumber: "",
    hijriYear2: "",
    oldLicenseNumber: "",
    newAuthorityNote: "",
    noteAttachment: null,
    approvalAttachments: [],
  });
  const [uploadData, setUploadData] = useState({ file: null, description: "" });

  const [distributionScheme, setDistributionScheme] = useState("default");
  const [roundingMode, setRoundingMode] = useState("none");

  const [isAddBrokerModalOpen, setIsAddBrokerModalOpen] = useState(false);
  const [brokerForm, setBrokerForm] = useState({ brokerId: "", fees: "" });

  // ==========================================================
  // 💡 3. Memos & Calculations
  // ==========================================================
  const agentsList = useMemo(
    () => persons.filter((p) => p.role === "معقب"),
    [persons],
  );
  const remoteWorkersList = useMemo(
    () => persons.filter((p) => p.role === "موظف عن بعد"),
    [persons],
  );
  const brokersList = useMemo(
    () => persons.filter((p) => p.role === "وسيط"),
    [persons],
  );

  const clientsOptions = useMemo(
    () => clients.map((c) => ({ label: c.name?.ar || c.name, value: c.id })),
    [clients],
  );
  const txCoopFees = useMemo(
    () => allCoopFees.filter((fee) => fee.transactionId === tx?.id),
    [allCoopFees, tx?.id],
  );
  const districtsOptions = useMemo(() => {
    let opts = [];
    riyadhZones.forEach((sector) => {
      sector.districts?.forEach((dist) => {
        opts.push({
          label: `${dist.name} (قطاع ${sector.name})`,
          value: dist.id,
          sectorName: sector.name,
        });
      });
    });
    return opts;
  }, [riyadhZones]);

  useEffect(() => {
    if (tx) {
      const currentClient = clients.find(
        (c) => (c.name?.ar || c.name) === safeText(tx.client),
      );

      let additionalOwners = [];
      if (
        tx.detailedOwnersList &&
        Array.isArray(tx.detailedOwnersList) &&
        tx.detailedOwnersList.length > 1
      ) {
        additionalOwners = tx.detailedOwnersList
          .filter((o) => !o.isPrimary)
          .map((o) => ({
            clientId: o.clientId || "",
            ownerName: o.ownerName,
          }));
      }

      const initialHasAgreement =
        tx.hasAgreement || tx.requestData?.hasAgreement || false;

      setEditFormData({
        year: new Date(tx.created || tx.date).getFullYear().toString(),
        month: (new Date(tx.created || tx.date).getMonth() + 1)
          .toString()
          .padStart(2, "0"),
        clientId: currentClient?.id || "",
        clientName: safeText(tx.client || tx.owner),
        additionalOwners: additionalOwners,
        district: tx.district || "",
        districtId: "",
        sector: tx.sector || "",
        type: tx.type,
        office: tx.office || "مكتب ديتيلز",
        sourceName: tx.sourceName || "مباشر",
        totalFees: tx.totalFees || 0,
        taxType:
          tx.taxData?.taxType ||
          tx.notes?.taxData?.taxType ||
          "بدون احتساب ضريبة",
        mediatorFees:
          tx.mediatorFees ||
          tx.brokers?.reduce((sum, b) => sum + safeNum(b.fees), 0) ||
          0,
        agentCost:
          tx.agentCost ||
          tx.agents?.reduce((sum, a) => sum + safeNum(a.fees), 0) ||
          0,
        internalName: tx.internalName || tx.notes?.internalName || "",
        isInternalNameHidden: tx.notes?.isInternalNameHidden || false,
        plots: tx.plots || tx.notes?.refs?.plots || "",
        plan: tx.plan || tx.notes?.refs?.plan || "",
        area:
          tx.landArea || tx.notes?.refs?.landArea || tx.notes?.refs?.area || "",
        mapsLink: tx.mapsLink || tx.notes?.refs?.mapsLink || "",
      });

      const existingStatusData = tx.notes?.transactionStatusData || {};

      setStatusForm({
        currentStatus:
          existingStatusData.currentStatus || "عند المهندس للدراسة",
        serviceNumber:
          tx.serviceNo ||
          tx.requestNo ||
          existingStatusData.serviceNumber ||
          "",
        hijriYear1: existingStatusData.hijriYear1 || "",
        licenseNumber: tx.licenseNo || existingStatusData.licenseNumber || "",
        hijriYear2: existingStatusData.hijriYear2 || "",
        oldLicenseNumber:
          tx.oldDeed || existingStatusData.oldLicenseNumber || "",
        newAuthorityNote: "",
        noteAttachment: null,
        approvalAttachments: existingStatusData.approvalAttachments || [],
        approvalDate: existingStatusData.approvalDate || null,
      });

      const reqData = tx.requestData || {};
      setRequestDataForm({
        designerOffice: reqData.designerOffice || "",
        supervisorOffice: reqData.supervisorOffice || "",
        hasAgreement: initialHasAgreement,
        electronicLicenseNumber: reqData.electronicLicenseNumber || "",
        electronicLicenseHijriYear: reqData.electronicLicenseHijriYear || "",
        electronicLicenseDate: reqData.electronicLicenseDate
          ? reqData.electronicLicenseDate.split("T")[0]
          : "",
        oldLicenseNumber: reqData.oldLicenseNumber || "",
        oldLicenseHijriYear: reqData.oldLicenseHijriYear || "",
        oldLicenseDate: reqData.oldLicenseDate
          ? reqData.oldLicenseDate.split("T")[0]
          : "",
        requestNumber: reqData.requestNumber || "",
        requestYear: reqData.requestYear || "",
        serviceNumber: reqData.serviceNumber || "",
        serviceYear: reqData.serviceYear || "",
        responsibleEmployee: reqData.responsibleEmployee || currentUser,
        // 🚀 تم إضافة الحقول الجديدة هنا لتتم قراءتها بنجاح عند فتح المعاملة
        surveyRequestNumber: reqData.surveyRequestNumber || "",
        surveyRequestYear: reqData.surveyRequestYear || "",
        surveyServiceNumber: reqData.surveyServiceNumber || "",
        surveyServiceYear: reqData.surveyServiceYear || "",
        surveyReportNumber: reqData.surveyReportNumber || "",
        surveyReportDate: reqData.surveyReportDate
          ? reqData.surveyReportDate.split("T")[0]
          : "",
        contractNumber: reqData.contractNumber || "",
        contractApprovalDate: reqData.contractApprovalDate
          ? reqData.contractApprovalDate.split("T")[0]
          : "",
        contractApprovedBy: reqData.contractApprovedBy || "",
      });
    }
  }, [tx, clients]);

  const calculateEditTax = () => {
    const total = parseNumber(editFormData.totalFees) || 0;
    if (total === 0) return { net: 0, tax: 0 };
    if (editFormData.taxType === "شامل الضريبة")
      return { net: total / 1.15, tax: total - total / 1.15 };
    if (editFormData.taxType === "غير شامل الضريبة")
      return { net: total, tax: total * 0.15 };
    return { net: total, tax: 0 };
  };
  const { net: editNetAmount, tax: editTaxAmount } = calculateEditTax();

  const totalFees = safeNum(tx?.totalPrice || tx?.totalFees);
  const totalPaid = safeNum(tx?.collectionAmount || tx?.paidAmount);
  const remaining = totalFees - totalPaid;
  const collectionPercent =
    totalFees > 0 ? Math.round((totalPaid / totalFees) * 100) : 0;
  const actualExpenses =
    tx?.expenses?.reduce((sum, exp) => sum + safeNum(exp.amount), 0) || 0;
  const totalCosts =
    safeNum(tx?.agentCost) +
    safeNum(tx?.remoteCost) +
    safeNum(tx?.expensesCost);
  const estimatedProfit = totalFees - totalCosts;
  const reserveDeduction = estimatedProfit * 0.1;
  const distributableProfit = estimatedProfit - reserveDeduction;

  const officeShareData = useMemo(() => {
    if (distributableProfit <= 0 || !systemSettings)
      return { amount: 0, label: "0%" };
    let appliedType = systemSettings.officeShareType || "percentage";
    let appliedValue = safeNum(systemSettings.officeShareValue) || 10;
    const matchingTier = (systemSettings.officeShareCategories || []).find(
      (c) =>
        distributableProfit >= safeNum(c.minAmount) &&
        distributableProfit <= safeNum(c.maxAmount),
    );
    if (matchingTier) {
      appliedType = matchingTier.type;
      appliedValue = safeNum(matchingTier.value);
    }
    let calculatedShare =
      appliedType === "percentage"
        ? distributableProfit * (appliedValue / 100)
        : appliedValue;
    return {
      amount: Math.min(calculatedShare, distributableProfit),
      label:
        appliedType === "percentage"
          ? `${appliedValue}%`
          : `مبلغ ثابت (${appliedValue.toLocaleString()})`,
    };
  }, [distributableProfit, systemSettings]);

  const officeShareAmount = officeShareData.amount;
  const officeShareLabel = officeShareData.label;
  const netAfterOfficeShare = distributableProfit - officeShareAmount;
  const sourcePercent = safeNum(tx?.sourcePercent) || 5;
  const sourceShare = (netAfterOfficeShare * sourcePercent) / 100;
  const availableForPartners = netAfterOfficeShare - sourceShare;

  const partnersDistribution = useMemo(() => {
    if (!tx) return [];
    let scheme = [
      { id: "p1", name: "شريك 1 (المدير)", percent: 50 },
      { id: "p2", name: "شريك 2", percent: 30 },
      { id: "p3", name: "شريك 3", percent: 20 },
    ];
    if (distributionScheme === "fouad")
      scheme = [
        { id: "p1", name: "شريك 1", percent: 33.33 },
        { id: "p2", name: "شريك 2", percent: 33.33 },
        { id: "p3", name: "شريك 3", percent: 33.34 },
      ];
    else if (distributionScheme === "custom")
      scheme = [
        { id: "p1", name: "شريك 1", percent: 40 },
        { id: "p2", name: "شريك 2", percent: 35 },
        { id: "p3", name: "شريك 3", percent: 25 },
      ];

    return scheme.map((p) => {
      let rawAmount = (availableForPartners * p.percent) / 100;
      let finalAmount = rawAmount;
      if (roundingMode === "10") finalAmount = Math.round(rawAmount / 10) * 10;
      if (roundingMode === "50") finalAmount = Math.round(rawAmount / 50) * 50;
      if (roundingMode === "100")
        finalAmount = Math.round(rawAmount / 100) * 100;
      return {
        ...p,
        rawAmount,
        finalAmount,
        roundDiff: finalAmount - rawAmount,
      };
    });
  }, [availableForPartners, distributionScheme, roundingMode, tx]);

  const safeAttachments = useMemo(() => {
    let allAtts = [];
    if (tx?.notes?.attachments && Array.isArray(tx.notes.attachments))
      allAtts = [...tx.notes.attachments];
    if (tx?.attachments && Array.isArray(tx.attachments)) {
      tx.attachments.forEach((url) => {
        if (typeof url === "string" && !allAtts.find((a) => a.url === url)) {
          allAtts.push({
            url,
            name: "مرفق قديم",
            uploadedBy: "النظام",
            date: tx.createdAt,
          });
        }
      });
    }
    return allAtts;
  }, [tx]);
  const safePayments =
    tx?.paymentsList || tx?.payments || tx?.notes?.payments || [];
  const safeCollectionDates =
    tx?.collectionDates || tx?.notes?.collectionDates || [];
  const safeAuthorityHistory = tx?.notes?.authorityNotesHistory || [];
  const systemLogs = useMemo(() => {
    const logs = tx?.logs || tx?.notes?.logs || [];
    return [...logs].sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [tx?.logs, tx?.notes?.logs]);

  // ==========================================================
  // 💡 4. Handlers
  // ==========================================================
  const handlePreviewAttachmentSafe = (url, name) => {
    try {
      if (!url) return;
      if (url.startsWith("http")) return window.open(url, "_blank");
      setPreviewFile({ url: `${backendUrl}${url}`, name });
    } catch (error) {
      toast.error("حدث خطأ أثناء فتح الملف");
    }
  };

  // ==========================================================
  // 💡 4. Handlers & Dynamic Data
  // ==========================================================

  // 🚀 تحديد المراحل ديناميكياً بناءً على النوع
  const getDynamicPipeline = () => {
    const type = tx?.type || "";
    if (type.includes("رخصة بناء") || type.includes("اصدار")) {
      return [
        "إنشاء الطلب",
        "الدراسات الفنية",
        "الإدارة المالية",
        "الاعتماد وإصدار الرخصة",
      ];
    } else if (type.includes("فرز") || type.includes("دمج")) {
      return [
        "إنشاء الطلب",
        "الرفع المساحي",
        "الإدارة المالية",
        "اعتماد الأمانة",
      ];
    } else {
      return [
        "إنشاء الطلب",
        "المتابعة والمراجعة",
        "التحصيل والتسوية",
        "الإغلاق",
      ];
    }
  };
  const dynamicPipeline = getDynamicPipeline();

  // 🚀 دالة لتحديد المرحلة النشطة (Active Step Index) بناءً على حالة المعاملة
  const getActiveStepIndex = () => {
    if (!tx) return 0;

    const status = tx.status || "جارية";

    // إذا كانت مكتملة، كل المراحل تعتبر مكتملة (نأخذ آخر مرحلة)
    if (status === "مكتملة") return dynamicPipeline.length - 1;

    // حالة مبدئية
    if (status === "جديدة") return 0;

    // إذا كانت جارية، نتحقق من نسبة التحصيل أو المهام كتقدير للمرحلة الحالية
    // (يمكنك تخصيص هذه الشروط بناءً على نظامك)
    if (status === "جارية") {
      // إذا كان هناك تسوية جزئية أو تحصيل
      if (collectionPercent > 0 && collectionPercent < 100)
        return Math.min(2, dynamicPipeline.length - 2);
      // إذا كان التحصيل مكتمل ولم تغلق بعد
      if (collectionPercent === 100)
        return Math.min(3, dynamicPipeline.length - 1);

      // الافتراضي للـ "جارية" هو المرحلة الثانية
      return 1;
    }

    // الافتراضي
    return 0;
  };

  const activeStepIndex = getActiveStepIndex();

  // 🚀 تحديد ظهور التبويبات بناءً على النوع (مثال: الدراسات الفنية للرخص فقط)
  const needsEngineeringStudies =
    tx?.type?.includes("بناء") ||
    tx?.type?.includes("اصدار") ||
    tx?.type?.includes("تعديل");
  const needsPledges =
    tx?.type?.includes("بناء") || tx?.type?.includes("اشراف");

  const saveRequestDataEdits = () => {
    // 💡 نستخرج الحقول التي يجب أن ترسل بشكل مباشر خارج كائن requestData
    const {
      designerOffice,
      supervisorOffice,
      hasAgreement,
      ...restRequestData
    } = requestDataForm;

    updateTxMutation.mutate({
      requestData: requestDataForm, // نرسل كامل الكائن لدعم التوافقية السابقة
      designerOfficeId: designerOffice, // إرسال صريح للحقل المخصص
      supervisorOfficeId: supervisorOffice, // إرسال صريح للحقل المخصص
      hasAgreement: hasAgreement, // إرسال صريح للاتفاقية
    });
  };

  const saveBasicEdits = (passedData) => {
    // استخدم البيانات الممررة أو الـ State كاحتياط
    const dataToSave = passedData || editFormData;

    let parsedPlots = [];
    if (Array.isArray(dataToSave.plots)) {
      parsedPlots = dataToSave.plots;
    } else if (typeof dataToSave.plots === "string") {
      parsedPlots = dataToSave.plots
        .split(/[,،]/)
        .map((s) => s.trim())
        .filter(Boolean);
    }

    const updatedNotes = {
      ...(tx.notes || {}),
      // 💡 وضع قائمة الملاك داخل النوتس لإرسالها للباك إند
      detailedOwnersList:
        dataToSave.detailedOwnersList || tx.notes?.detailedOwnersList || [],
      refs: {
        ...((tx.notes || {}).refs || {}),
        plots: parsedPlots,
        plan: dataToSave.plan,
        area: dataToSave.area,
        mapsLink: dataToSave.mapsLink,
      },
    };

    updateTxMutation.mutate({
      ...dataToSave,
      plots: parsedPlots,
      notes: updatedNotes,
    });
  };

  const calculateDays = (targetDate, isApprovalRelated) => {
    const today = new Date();
    if (isApprovalRelated) {
      if (statusForm.currentStatus === "تم الاعتماد") {
        const approvalDate = statusForm.approvalDate
          ? new Date(statusForm.approvalDate)
          : today;
        return Math.floor((today - approvalDate) / (1000 * 60 * 60 * 24));
      }
      return null;
    }
    if (!targetDate) return null;
    return Math.ceil((new Date(targetDate) - today) / (1000 * 60 * 60 * 24));
  };

  // ==========================================================
  // 💡 5. Mutations
  // ==========================================================
  const updateTxMutation = useMutation({
    mutationFn: async (data) =>
      api.put(`/private-transactions/${tx.id}`, {
        ...data,
        updatedBy: currentUser,
      }),
    onSuccess: () => {
      toast.success("تم تحديث البيانات بنجاح");
      queryClient.invalidateQueries(["private-transactions-full"]);
      setIsEditingBasic(false);
      setIsEditingFinancial(false);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (data) => {
      const fd = new FormData();
      Object.keys(data).forEach((k) => {
        if (
          k !== "noteAttachment" &&
          k !== "approvalAttachments" &&
          data[k] !== null &&
          data[k] !== undefined
        )
          fd.append(k, data[k]);
      });
      if (data.noteAttachment) fd.append("file", data.noteAttachment);
      if (data.approvalAttachments?.length > 0) {
        data.approvalAttachments.forEach((att, index) => {
          if (att.file) {
            fd.append("approvalFiles", att.file);
            fd.append("approvalNames", att.name || `مرفق اعتماد ${index + 1}`);
          }
        });
      }
      fd.append("addedBy", currentUser);
      return api.post(`/private-transactions/${tx?.id}/status`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: () => {
      toast.success("تم تحديث الحالة بنجاح");
      setStatusForm({
        ...statusForm,
        newAuthorityNote: "",
        noteAttachment: null,
        approvalAttachments: [],
      });
      queryClient.invalidateQueries(["private-transactions-full"]);
    },
  });

  const addTaskMutation = useMutation({
    mutationFn: async (taskData) => {
      const payload = { ...taskData, addedBy: currentUser };
      return api.post(`/private-transactions/${tx.id}/tasks`, payload);
    },
    onSuccess: () => {
      toast.success("تم حفظ المهمة بنجاح");
      queryClient.invalidateQueries(["private-transactions-full"]);
    },
  });

  const submitTaskMutation = useMutation({
    mutationFn: async ({ taskId, comment, file }) => {
      const fd = new FormData();
      if (comment) fd.append("comment", comment);
      if (file) fd.append("file", file);
      fd.append("submittedBy", currentUser);
      return api.post(
        `/private-transactions/${tx.id}/tasks/${taskId}/submit`,
        fd,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
    },
    onSuccess: () => {
      toast.success("تم تسليم المهمة للتدقيق بنجاح");
      queryClient.invalidateQueries(["private-transactions-full"]);
    },
  });

  const freezeMutation = useMutation({
    mutationFn: async (id) =>
      await api.patch(`/private-transactions/${id}/toggle-freeze`, {
        updatedBy: currentUser,
      }),
    onSuccess: () => {
      toast.success("تم تغيير حالة المعاملة");
      queryClient.invalidateQueries(["private-transactions-full"]);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => await api.delete(`/private-transactions/${id}`),
    onSuccess: () => {
      toast.success("تم حذف المعاملة");
      queryClient.invalidateQueries(["private-transactions-full"]);
      onClose();
    },
    onError: () =>
      toast.error("لا يمكن حذف هذه المعاملة لوجود ارتباطات مالية."),
  });

  const addPaymentMutation = useMutation({
    mutationFn: async (data) => {
      const fd = new FormData();
      fd.append("transactionId", tx?.id);
      fd.append("collectedFromType", "عميل");
      fd.append("collectedBy", currentUser);
      Object.keys(data).forEach((k) => {
        if (k === "receiptFile" && data[k]) fd.append("file", data[k]);
        else if (data[k] !== null && data[k] !== undefined)
          fd.append(k, data[k]);
      });
      return api.post(`/private-transactions/payments`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: () => {
      toast.success("تمت إضافة الدفعة بنجاح");
      queryClient.invalidateQueries(["private-transactions-full"]);
      setIsAddPaymentOpen(false);
      setPaymentForm({
        amount: "",
        date: new Date().toISOString().split("T")[0],
        method: "تحويل بنكي",
        ref: "",
        notes: "",
        bankAccountId: "",
        isDepositedToSafe: false,
        receiptFile: null,
      });
    },
  });

  const deletePaymentMutation = useMutation({
    mutationFn: async (id) =>
      api.delete(`/private-transactions/payments/${id}`),
    onSuccess: () => {
      toast.success("تم حذف الدفعة");
      queryClient.invalidateQueries(["private-transactions-full"]);
    },
  });

  const addAgentMutation = useMutation({
    mutationFn: async (data) =>
      api.post(`/private-transactions/${tx?.id}/agents`, {
        ...data,
        addedBy: currentUser,
      }),
    onSuccess: () => {
      toast.success("تم ربط المعقب بالمعاملة");
      queryClient.invalidateQueries(["private-transactions-full"]);
      setIsAddAgentOpen(false);
    },
  });

  const deleteAgentMutation = useMutation({
    mutationFn: async (agentIdToRemove) => {
      const currentAgents = tx.notes?.agents || [];
      const updatedAgents = currentAgents.filter(
        (a) => a.id !== agentIdToRemove,
      );
      return api.put(`/private-transactions/${tx.id}`, {
        notes: {
          ...tx.notes,
          agents: updatedAgents,
          agentFees: updatedAgents.reduce((sum, a) => sum + a.fees, 0),
        },
      });
    },
    onSuccess: () => {
      toast.success("تم إزالة المعقب من المعاملة");
      queryClient.invalidateQueries(["private-transactions-full"]);
    },
  });

  const addBrokerMutation = useMutation({
    mutationFn: async (data) =>
      api.post(`/private-transactions/${tx?.id}/brokers`, {
        ...data,
        addedBy: currentUser,
      }),
    onSuccess: () => {
      toast.success("تم تعيين الوسيط بنجاح");
      queryClient.invalidateQueries(["private-transactions-full"]);
      setIsAddBrokerModalOpen(false);
      setBrokerForm({ brokerId: "", fees: "" });
    },
  });

  const deleteBrokerMutation = useMutation({
    mutationFn: async (brokerRecordId) =>
      api.delete(`/private-transactions/brokers/${brokerRecordId}`, {
        data: { addedBy: currentUser },
      }),
    onSuccess: () => {
      toast.success("تم حذف الوسيط");
      queryClient.invalidateQueries(["private-transactions-full"]);
    },
  });

  const deleteRemoteTaskMutation = useMutation({
    mutationFn: async (taskId) =>
      api.delete(`/private-transactions/${tx.id}/tasks/${taskId}`, {
        data: { deletedBy: currentUser },
      }),
    onSuccess: () => {
      toast.success("تم حذف المهمة بنجاح");
      queryClient.invalidateQueries(["private-transactions-full"]);
    },
  });

  const payRemoteTaskMutation = useMutation({
    mutationFn: async (payload) =>
      api.post(`/remote-workers/tasks/pay`, payload),
    onSuccess: () => {
      toast.success("تم تسجيل الدفع للموظف بنجاح");
      queryClient.invalidateQueries(["private-transactions-full"]);
      setPayTaskData(null);
    },
  });

  const payPersonMutation = useMutation({
    mutationFn: async (payload) => api.post(`/finance/settlements`, payload),
    onSuccess: () => {
      toast.success("تم تسجيل الدفعة بنجاح");
      queryClient.invalidateQueries(["private-transactions-full"]);
      setPayPersonData(null);
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "حدث خطأ أثناء تسجيل الدفع"),
  });

  const addDateMutation = useMutation({
    mutationFn: async (data) =>
      await api.post(`/private-transactions/${tx?.id}/collection-dates`, {
        ...data,
        addedBy: currentUser,
      }),
    onSuccess: () => {
      toast.success("تمت إضافة الموعد");
      queryClient.invalidateQueries(["private-transactions-full"]);
      setDateForm({
        amountType: "full",
        amount: "",
        type: "specific_date",
        date: "",
        notes: "",
      });
    },
  });

  const deleteDateMutation = useMutation({
    mutationFn: async (dateId) =>
      await api.delete(
        `/private-transactions/${tx?.id}/collection-dates/${dateId}`,
      ),
    onSuccess: () => {
      toast.success("تم حذف الموعد بنجاح");
      queryClient.invalidateQueries(["private-transactions-full"]);
    },
  });

  const addRemoteTaskMutation = useMutation({
    mutationFn: async (payload) =>
      api.post(`/remote-workers/assign-tasks`, {
        ...payload,
        assignedBy: currentUser,
      }),
    onSuccess: () => {
      toast.success("تم تعيين المهمة للموظف بنجاح");
      queryClient.invalidateQueries(["private-transactions-full"]);
      setIsAddRemoteTaskOpen(false);
      setRemoteTaskForm({
        workerId: "",
        taskName: "",
        costSar: "",
        isPaid: false,
        paymentAmount: "",
        paymentCurrency: "SAR",
        paymentDate: new Date().toISOString().split("T")[0],
      });
    },
  });

  const addExpenseMutation = useMutation({
    mutationFn: async (data) =>
      api.post(`/private-transactions/${tx?.id}/expenses`, {
        ...data,
        addedBy: currentUser,
      }),
    onSuccess: () => {
      toast.success("تم تسجيل المصروف التشغيلي بنجاح");
      queryClient.invalidateQueries(["private-transactions-full"]);
      setExpenseForm({
        amount: "",
        date: new Date().toISOString().split("T")[0],
        description: "",
      });
    },
  });

  const uploadAttachmentMutation = useMutation({
    mutationFn: async () => {
      const fd = new FormData();
      fd.append("files", uploadData.file);
      fd.append("description", uploadData.description);
      fd.append("uploadedBy", currentUser);
      return api.post(`/private-transactions/${tx?.id}/attachments`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: () => {
      toast.success("تم رفع المرفق بنجاح");
      queryClient.invalidateQueries(["private-transactions-full"]);
      setUploadData({ file: null, description: "" });
    },
  });

  const deleteAttachmentMutation = useMutation({
    mutationFn: async (fileUrlToRemove) => {
      const currentAttachments = tx.notes?.attachments || [];
      const updatedAttachments = currentAttachments.filter(
        (att) => att.url !== fileUrlToRemove,
      );
      return api.put(`/private-transactions/${tx.id}`, {
        notes: { ...tx.notes, attachments: updatedAttachments },
      });
    },
    onSuccess: () => {
      toast.success("تم حذف المرفق بنجاح");
      queryClient.invalidateQueries(["private-transactions-full"]);
    },
  });

  const deleteAuthorityNoteMutation = useMutation({
    mutationFn: async (updatedHistory) =>
      api.put(`/private-transactions/${tx.id}`, {
        notes: { authorityNotesHistory: updatedHistory },
      }),
    onSuccess: () => {
      toast.success("تم حذف الملاحظة بنجاح");
      queryClient.invalidateQueries(["private-transactions-full"]);
    },
  });

  const finalizeSettlementMutation = useMutation({
    mutationFn: async () =>
      api.put(`/private-transactions/${tx.id}`, { status: "مكتملة" }),
    onSuccess: () => {
      toast.success("تم تنفيذ التسوية الشاملة بنجاح وإغلاق المعاملة!");
      queryClient.invalidateQueries(["private-transactions-full"]);
    },
  });

  const saveCoopFeeMutation = useMutation({
    mutationFn: async (data) => {
      const payload = {
        ...data,
        transactionId: tx.id,
        internalName: tx.internalName || tx.client || "معاملة بدون اسم",
      };
      if (coopFeeMode === "add")
        return await api.post("/coop-office-fees", payload);
      else
        return await api.put(`/coop-office-fees/${editingCoopFeeId}`, payload);
    },
    onSuccess: () => {
      toast.success(
        coopFeeMode === "add" ? "تم تسجيل أتعاب المكتب" : "تم التعديل بنجاح",
      );
      queryClient.invalidateQueries(["coop-office-fees"]);
      setIsCoopFeeModalOpen(false);
    },
  });

  const deleteCoopFeeMutation = useMutation({
    mutationFn: async (id) => await api.delete(`/coop-office-fees/${id}`),
    onSuccess: () => {
      toast.success("تم الحذف بنجاح");
      queryClient.invalidateQueries(["coop-office-fees"]);
    },
  });

  const handleOpenCoopFeeEdit = (record) => {
    setCoopFeeMode("edit");
    setEditingCoopFeeId(record.id);
    setCoopFeeForm({
      ...initialCoopFeeForm,
      ...record,
      officeFees: record.officeFees || "",
      paidAmount: record.paidAmount || "",
    });
    setIsCoopFeeModalOpen(true);
  };

  if (!isOpen || !tx) return null;
  const isFrozen = tx.status === "مجمّدة";
  const isSettlementComplete = totalCosts > 0 && tx?.status !== "جارية";

  // ==========================================================
  // 💡 6. The Context Object
  // ==========================================================
  const tabContext = {
    tx,
    currentUser,
    backendUrl,
    safeNum,
    safeText,
    parseNumber,
    formatDateTime,
    getDayNameAndDate,
    isEditingBasic,
    setIsEditingBasic,
    editFormData,
    setEditFormData,
    saveBasicEdits,
    updateTxMutation,
    clientsOptions,
    districtsOptions,
    offices,
    persons,
    statusForm,
    setStatusForm,
    updateStatusMutation,
    safeAuthorityHistory,
    deleteAuthorityNoteMutation,
    handlePreviewAttachmentSafe,
    uploadData,
    setUploadData,
    uploadAttachmentMutation,
    safeAttachments,
    deleteAttachmentMutation,
    systemLogs,
    isEditingFinancial,
    setIsEditingFinancial,
    totalFees,
    editNetAmount,
    editTaxAmount,
    exchangeRates,
    openSections,
    toggleSection,
    actualExpenses,
    estimatedProfit,
    totalCosts,
    reserveDeduction,
    distributableProfit,
    availableForPartners,
    setActiveTab,
    setIsAddBrokerModalOpen,
    deleteBrokerMutation,
    setIsAddAgentOpen,
    deleteAgentMutation,
    setIsAddRemoteTaskOpen,
    deleteRemoteTaskMutation,
    setPayPersonData,
    setPayTaskData,
    addExpenseMutation,
    expenseForm,
    setExpenseForm,
    setIsAddPaymentOpen,
    totalPaid,
    remaining,
    collectionPercent,
    safePayments,
    deletePaymentMutation,
    finalizeSettlementMutation,
    isSettlementComplete,
    officeShareLabel,
    officeShareAmount,
    sourcePercent,
    sourceShare,
    partnersDistribution,
    safeCollectionDates,
    dateForm,
    setDateForm,
    addDateMutation,
    calculateDays,
    deleteDateMutation,
    txCoopFees,
    setIsCoopFeeModalOpen,
    setCoopFeeMode,
    setCoopFeeForm,
    initialCoopFeeForm,
    handleOpenCoopFeeEdit,
    deleteCoopFeeMutation,
    txType: tx?.type,
    isSuperAdmin: user?.role === "ADMIN" || user?.email === "admin@wms.com",
    addTaskMutation,
    submitTaskMutation,
    requestDataForm,
    setRequestDataForm,
    saveRequestDataEdits,
    isApprovalRequest: tx?.type?.includes("تصحيح وضع"),
  };

  // 💡 دالة تصيير التبويبات - تصميم Premium مع IconWithText
  const renderTabButton = (id, label, Icon, activeColor = "#c5983c") => {
    const isActive = activeTab === id;
    const iconText = "";

    return (
      <button
        onClick={() => {
          setActiveTab(id);
          setIsSidebarOpenMobile(false);
        }}
        className={`tab-item group relative mx-1.5 mb-0.5 flex w-[calc(100%-12px)] items-center gap-1.5 overflow-hidden rounded-[14px] border px-1.5 py-1.5 text-right transition-all duration-300 ${
          isActive
            ? "border-[#d8b46a]/60 bg-gradient-to-l from-[#f8efe0] via-white to-[#eef7f6] text-[#123f59] shadow-[0_14px_30px_rgba(18,63,89,0.12)]"
            : "border-transparent bg-white/55 text-[#60707a] hover:border-[#d8b46a]/35 hover:bg-[#fbf8f1] hover:text-[#123f59]"
        }`}
        title={label}
        type="button"
      >
        <div
          className={`absolute inset-y-3 right-0 w-[4px] rounded-full transition-all duration-300 ${
            isActive ? "opacity-100" : "opacity-0 group-hover:opacity-70"
          }`}
          style={{ backgroundColor: isActive ? activeColor : "#d8b46a" }}
        />

        <span
          className={`grid h-6 w-6 shrink-0 place-items-center rounded-lg border transition-all duration-300 ${
            isActive
              ? "border-[#d8b46a]/50 bg-[#123f59] text-[#e2bf74] shadow-[0_10px_20px_rgba(18,63,89,0.18)]"
              : "border-[#e8ddc8] bg-white text-[#78909a] group-hover:border-[#d8b46a]/50 group-hover:text-[#c5983c]"
          }`}
        >
          <IconWithText
            icon={Icon}
            text={iconText}
            vertical
            iconClassName={`h-[16px] w-[16px] transition-transform duration-300 ${
              isActive ? "scale-110" : "group-hover:scale-110"
            }`}
            textClassName="hidden"
          />
        </span>

        <span
          className={`min-w-0 flex-1 truncate whitespace-nowrap text-[10.5px] leading-4 ${
            isActive ? "font-black" : "font-extrabold"
          }`}
        >
          {label}
        </span>

        {isActive && (
          <span
            className="h-2 w-2 shrink-0 rounded-full shadow-[0_0_0_4px_rgba(216,180,106,0.16)]"
            style={{ backgroundColor: activeColor }}
          />
        )}
      </button>
    );
  };

  // 💡 دالة تصيير المجموعات - تبقى مفتوحة دائمًا
  const renderSidebarGroup = (title, groupId, icon, children) => {
    return (
      <div className="mb-1.5 overflow-hidden rounded-[16px] border border-[#d8b46a]/20 bg-white shadow-[0_10px_26px_rgba(18,63,89,0.06)]">
        <div
          className="flex w-full items-center justify-between gap-3 bg-gradient-to-l from-[#06111d] via-[#123f59] to-[#0e7490] px-2.5 py-2 text-right"
        >
          <div className="flex min-w-0 items-center gap-2 text-[11.5px] font-black leading-snug text-white">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg border border-[#e2bf74]/25 bg-[#e2bf74]/15 text-[#e2bf74]">
              {icon}
            </span>
            <span className="truncate">{title}</span>
          </div>

          <span className="h-2 w-2 shrink-0 rounded-full bg-[#e2bf74] shadow-[0_0_10px_rgba(226,191,116,0.55)]" />
        </div>

        <div className="overflow-visible opacity-100">
          <div className="space-y-0.5 bg-gradient-to-b from-white via-[#fbf8f1]/55 to-white py-2">
            {children}
          </div>
        </div>
      </div>
    );
  };

  // ==========================================================
  // 💡 7. JSX Render
  // ==========================================================
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#08111c]/80 p-1 backdrop-blur-sm animate-in fade-in duration-200 md:p-2"
      dir="rtl"
      onClick={onClose}
    >
      {/* --- Modals Render Area --- */}
      <PreviewModal previewFile={previewFile} setPreviewFile={setPreviewFile} />
      <AddPaymentModal
        isAddPaymentOpen={isAddPaymentOpen}
        setIsAddPaymentOpen={setIsAddPaymentOpen}
        paymentForm={paymentForm}
        setPaymentForm={setPaymentForm}
        bankAccounts={bankAccounts}
        addPaymentMutation={addPaymentMutation}
      />
      <AddAgentModal
        isAddAgentOpen={isAddAgentOpen}
        setIsAddAgentOpen={setIsAddAgentOpen}
        agentForm={agentForm}
        setAgentForm={setAgentForm}
        agentsList={agentsList}
        addAgentMutation={addAgentMutation}
      />
      <AddBrokerModal
        isAddBrokerModalOpen={isAddBrokerModalOpen}
        setIsAddBrokerModalOpen={setIsAddBrokerModalOpen}
        brokerForm={brokerForm}
        setBrokerForm={setBrokerForm}
        brokersList={brokersList}
        addBrokerMutation={addBrokerMutation}
      />
      <AddRemoteTaskModal
        isAddRemoteTaskOpen={isAddRemoteTaskOpen}
        setIsAddRemoteTaskOpen={setIsAddRemoteTaskOpen}
        remoteTaskForm={remoteTaskForm}
        setRemoteTaskForm={setRemoteTaskForm}
        remoteWorkersList={remoteWorkersList}
        exchangeRates={exchangeRates}
        addRemoteTaskMutation={addRemoteTaskMutation}
        tx={tx}
      />
      <CoopFeeModal
        isCoopFeeModalOpen={isCoopFeeModalOpen}
        setIsCoopFeeModalOpen={setIsCoopFeeModalOpen}
        coopFeeMode={coopFeeMode}
        coopFeeForm={coopFeeForm}
        setCoopFeeForm={setCoopFeeForm}
        offices={offices}
        saveCoopFeeMutation={saveCoopFeeMutation}
        tx={tx}
      />
      <PayPersonModal
        payPersonData={payPersonData}
        setPayPersonData={setPayPersonData}
        payPersonMutation={payPersonMutation}
        payRemoteTaskMutation={payRemoteTaskMutation}
        tx={tx}
        remoteWorkersList={remoteWorkersList}
        exchangeRates={exchangeRates}
      />
      <PayTaskModal
        payTaskData={payTaskData}
        setPayTaskData={setPayTaskData}
        remoteWorkersList={remoteWorkersList}
        tx={tx}
        exchangeRates={exchangeRates}
        payRemoteTaskMutation={payRemoteTaskMutation}
      />

      {/* 🚀 نافذة ملفات المعاملة */}
      {isFolderViewerOpen && formattedTransactionForFolderViewer && (
        <FolderViewerWindow
          transaction={formattedTransactionForFolderViewer} // 👈 التمرير بالشكل المهيأ
          categories={categories}
          user={user} // 👈 تمرير المستخدم كما في الملف الأصلي
          onClose={() => setIsFolderViewerOpen(false)}
        />
      )}

      {/* --- Main Modal Container --- */}
      <div
        className="relative flex h-[calc(100dvh-8px)] max-h-[calc(100dvh-8px)] w-[calc(100vw-8px)] max-w-none flex-col overflow-hidden rounded-[22px] border border-[#d8b46a]/30 bg-white shadow-[0_24px_80px_rgba(8,17,28,0.48)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* --- Header Premium Responsive --- */}
        <div className="relative shrink-0 overflow-hidden border-b border-[#d8b46a]/20 bg-gradient-to-l from-[#06111d] via-[#0f3448] to-[#123f59] px-3 py-2 text-white md:px-4">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute right-[-70px] top-[-70px] h-44 w-44 rounded-full bg-[#e2bf74]/18 blur-3xl" />
            <div className="absolute left-[22%] bottom-[-90px] h-56 w-56 rounded-full bg-cyan-400/10 blur-3xl" />
          </div>

          <div className="relative z-10 flex flex-col gap-1.5 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <button
                onClick={() => setIsSidebarOpenMobile(!isSidebarOpenMobile)}
                className="grid h-7 w-7 shrink-0 place-items-center rounded-2xl border border-white/15 bg-white/10 text-[#e2bf74] transition hover:bg-white/15 md:hidden"
                type="button"
              >
                <Menu className="h-4.5 w-4.5" />
              </button>

              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-[#e2bf74]/35 bg-white/12 text-[#e2bf74] shadow-[0_10px_24px_rgba(0,0,0,0.18)]">
                <IconWithText
                  icon={FileText}
                  text="معاملة"
                  vertical
                  iconClassName="h-5 w-5"
                  textClassName="hidden"
                />
              </span>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-2xl border border-[#e2bf74]/25 bg-[#e2bf74]/12 px-3 py-1 font-mono text-xs font-black text-[#e2bf74]">
                    {tx.ref || tx.id?.slice(-6)}
                  </span>

                  {isFrozen && (
                    <span className="flex items-center gap-1 rounded-full border border-amber-300/25 bg-amber-400/12 px-2.5 py-1 text-[10px] font-black text-amber-100">
                      <Archive className="h-3.5 w-3.5" />
                      مجمّدة
                    </span>
                  )}
                </div>

                <h2 className="mt-1 truncate text-sm font-black md:text-base">
                  {safeText(tx.client || tx.owner)}
                </h2>

                <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[10px] font-bold text-white/55">
                  <span>{tx.type}</span>
                  <span className="hidden h-1 w-1 rounded-full bg-white/30 sm:block" />
                  <span>الحالة: {tx.status || "جارية"}</span>
                  <span className="hidden h-1 w-1 rounded-full bg-white/30 sm:block" />
                  <span>التحصيل: {collectionPercent}%</span>
                </div>
              </div>
            </div>

            <div className="flex min-w-0 flex-wrap items-center gap-2 xl:justify-end">
              <AccessControl
                code="File_ACTION_QUICK_EDIT"
                permissionNumber={1}
                name="ملفات المعاملة"
                moduleName="الملفات والمرفقات"
                tabName="ملفات المعاملة"
              >
                <button
                  onClick={() => setIsFolderViewerOpen(true)}
                  className="flex h-9 items-center justify-center gap-1.5 rounded-xl border border-emerald-300/25 bg-emerald-400/12 px-3 text-[10px] font-black text-emerald-100 shadow-sm transition hover:-translate-y-[1px] hover:bg-emerald-400/20 md:px-4 md:text-xs"
                  type="button"
                >
                  <FolderOpen className="h-4 w-4" />
                  <span>ملفات المعاملة</span>
                </button>
              </AccessControl>

              <AccessControl
                code="Transaction_ACTION_TOGGLE_FREEZE"
                permissionNumber={2}
                name="تجميد/تنشيط المعاملة"
                moduleName="المعاملات"
                tabName="تفاصيل المعاملة"
              >
                <button
                  onClick={() => freezeMutation.mutate(tx.id)}
                  disabled={freezeMutation.isPending}
                  className="flex h-9 items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-white/10 px-3 text-[10px] font-black text-white shadow-sm transition hover:-translate-y-[1px] hover:bg-white/15 disabled:opacity-50 md:px-4 md:text-xs"
                  type="button"
                >
                  {isFrozen ? <RefreshCw className="h-4 w-4 text-emerald-300" /> : <Archive className="h-4 w-4 text-amber-300" />}
                  <span>{isFrozen ? "تنشيط" : "تجميد"}</span>
                </button>
              </AccessControl>

              <AccessControl
                code="Transaction_ACTION_DELETE"
                permissionNumber={3}
                name="حذف المعاملة"
                moduleName="المعاملات"
                tabName="تفاصيل المعاملة"
              >
                <button
                  onClick={() => {
                    if (window.confirm("حذف نهائي؟ لا يمكن التراجع!"))
                      deleteMutation.mutate(tx.id);
                  }}
                  disabled={deleteMutation.isPending}
                  className="flex h-9 items-center justify-center gap-1.5 rounded-xl border border-rose-300/25 bg-rose-500/12 px-3 text-[10px] font-black text-rose-100 shadow-sm transition hover:-translate-y-[1px] hover:bg-rose-500/20 disabled:opacity-50 md:px-4 md:text-xs"
                  type="button"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="hidden sm:inline">حذف</span>
                </button>
              </AccessControl>

              <button
                onClick={onClose}
                className="grid h-7 w-7 shrink-0 place-items-center rounded-xl border border-white/15 bg-white/10 text-white/70 transition hover:border-rose-300/30 hover:bg-rose-500 hover:text-white"
                type="button"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* 🚀 Pipeline Strip Premium */}
        <div className="shrink-0 overflow-x-auto border-b border-[#d8b46a]/20 bg-gradient-to-l from-[#fbf8f1] via-white to-[#eef7f6] px-2.5 py-1.5 custom-scrollbar-slim">
          <div className="flex min-w-max items-center gap-2">
            {dynamicPipeline.map((step, i, arr) => {
              const isCompleted =
                i < activeStepIndex ||
                (i === activeStepIndex && tx.status === "مكتملة");
              const isActive = i === activeStepIndex && tx.status !== "مكتملة";

              return (
                <React.Fragment key={step}>
                  <div
                    className={`flex items-center gap-1.5 rounded-xl border px-2.5 py-1 text-[9.5px] font-black whitespace-nowrap transition-all ${
                      isCompleted
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700 shadow-sm"
                        : isActive
                          ? "border-[#d8b46a]/60 bg-[#123f59] text-[#e2bf74] shadow-[0_0_0_4px_rgba(216,180,106,0.15)]"
                          : "border-[#e8ddc8] bg-white text-[#64748b]"
                    }`}
                  >
                    <span
                      className={`grid h-6 w-6 place-items-center rounded-lg ${
                        isCompleted
                          ? "bg-emerald-600 text-white"
                          : isActive
                            ? "bg-[#e2bf74]/15 text-[#e2bf74]"
                            : "bg-[#fbf8f1] text-[#94a3b8]"
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : isActive ? (
                        <Activity className="h-3.5 w-3.5 animate-pulse" />
                      ) : (
                        <Circle className="h-2.5 w-2.5" />
                      )}
                    </span>
                    <span>{step}</span>
                  </div>

                  {i < arr.length - 1 && (
                    <ArrowLeftRight
                      className={`h-3.5 w-3.5 shrink-0 transition-colors ${
                        i < activeStepIndex ? "text-emerald-400" : "text-[#d8b46a]/55"
                      }`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Layout Wrapper for Sidebar and Content */}
        <div className="relative flex min-h-0 flex-1 overflow-hidden bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white"
          dir="ltr">
          {isSidebarOpenMobile && (
            <button
              className="fixed inset-0 z-30 bg-[#06111d]/50 backdrop-blur-sm md:hidden"
              onClick={() => setIsSidebarOpenMobile(false)}
              type="button"
              aria-label="إغلاق القائمة"
            />
          )}

          {/* 💡 Sidebar Tabs (Right in RTL) - Updated Layout */}
          <div
            className={`order-2 fixed inset-y-0 right-0 z-40 w-[300px] max-w-[88vw] flex-col overflow-hidden border-l border-[#d8b46a]/20 bg-white shadow-[-18px_0_55px_rgba(8,17,28,0.28)] transition-transform duration-300 md:static md:z-10 md:flex md:h-full md:min-h-0 md:w-[300px] md:shrink-0 md:translate-x-0 md:shadow-[8px_0_32px_-24px_rgba(8,17,28,0.35)] ${
              isSidebarOpenMobile ? "flex translate-x-0" : "hidden translate-x-full md:flex"
            }`}
            dir="rtl"
          >
            <div className="shrink-0 border-b border-[#d8b46a]/20 bg-white/95 px-3 py-3 backdrop-blur-xl">
              <div className="mb-2 flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-xl bg-[#123f59] text-[#e2bf74]">
                    <IconWithText
                      icon={FolderCog}
                      text="أقسام"
                      vertical
                      iconClassName="h-4 w-4"
                      textClassName="hidden"
                    />
                  </span>

                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-black text-[#123f59]">
                      أقسام المعاملة
                    </h3>
                    <p className="truncate text-[10px] font-bold text-[#64748b]">
                      اختر الشاشة المطلوبة للتنقل
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsSidebarOpenMobile(false)}
                  className="grid h-9 w-9 place-items-center rounded-xl border border-rose-200 bg-rose-50 text-rose-600 md:hidden"
                  type="button"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                <SidebarMiniMetric
                  label="تحصيل"
                  value={`${collectionPercent}%`}
                  tone="emerald"
                />
                <SidebarMiniMetric
                  label="مدفوع"
                  value={safeNum(totalPaid).toLocaleString()}
                  tone="blue"
                />
                <SidebarMiniMetric
                  label="متبقي"
                  value={safeNum(remaining).toLocaleString()}
                  tone="rose"
                />
              </div>
            </div>

            {/* Zone scrollable réelle de la sidebar */}
            <div className="min-h-0 flex-1 overflow-y-scroll overflow-x-hidden pb-6 custom-scrollbar-slim">

            {/* المجموعة الرئيسية */}


            {renderSidebarGroup(
              "البيانات وسير العمل",
              "main",
              <Briefcase className="w-4 h-4 text-blue-500" />,
              <>
                <AccessControl
                  code="Transaction_TAB_BASIC"
                  permissionNumber={4}
                  name="البيانات الأساسية"
                  moduleName="المعاملات"
                  tabName="البيانات الأساسية"
                >
                  {renderTabButton(
                    "basic",
                    "البيانات الأساسية",
                    FileText,
                    "#2563eb",
                  )}
                </AccessControl>
                <AccessControl
                  code="Transaction_TAB_REQUEST_DATA"
                  permissionNumber={5}
                  name="بيانات الطلب والرخصة"
                  moduleName="المعاملات"
                  tabName="بيانات الطلب والرخصة"
                >
                  {renderTabButton(
                    "request_data",
                    "بيانات الطلب والرخصة",
                    ClipboardList,
                    "#0891b2",
                  )}
                </AccessControl>
                <AccessControl
                  code="Transaction_TAB_STATUS"
                  permissionNumber={6}
                  name="حالة المعاملة والتوجيهات"
                  moduleName="المعاملات"
                  tabName="حالة المعاملة والتوجيهات"
                >
                  {renderTabButton(
                    "status",
                    "حالة المعاملة والتوجيهات",
                    History,
                    "#ea580c",
                  )}
                </AccessControl>
                <AccessControl
                  code="Transaction_TAB_TASKS"
                  permissionNumber={7}
                  name="مهام المعاملة (الداخلية)"
                  moduleName="المعاملات"
                  tabName="مهام المعاملة (الداخلية)"
                >
                  {renderTabButton(
                    "tasks",
                    "مهام المعاملة (الداخلية)",
                    CalendarDays,
                    "#4f46e5",
                  )}
                </AccessControl>
                <AccessControl
                  code="Transaction_TAB_REMOTE"
                  permissionNumber={8}
                  name="العمل عن بعد"
                  moduleName="المعاملات"
                  tabName="العمل عن بعد"
                >
                  {renderTabButton(
                    "remote",
                    "العمل عن بعد",
                    Monitor,
                    "#059669",
                  )}
                </AccessControl>
                <AccessControl
                  code="Transaction_TAB_ATTACHMENTS"
                  permissionNumber={9}
                  name="ملفات المعاملة"
                  moduleName="المعاملات"
                  tabName="ملفات المعاملة"
                >
                  {renderTabButton(
                    "attachments",
                    "ملفات المعاملة",
                    Paperclip,
                    "#64748b",
                  )}
                </AccessControl>
                <AccessControl
                  code="Transaction_TAB_AUTHORITY_NOTES"
                  permissionNumber={10}
                  name="ملاحظات الجهات والإفادات"
                  moduleName="المعاملات"
                  tabName="ملاحظات الجهات والإفادات"
                >
                  {renderTabButton(
                    "authority_notes",
                    "ملاحظات الجهات والإفادات",
                    MessageSquare,
                    "#8b5cf6",
                  )}
                </AccessControl>
                <AccessControl
                  code="Transaction_TAB_COMMENTS_LOGS"
                  permissionNumber={11}
                  name="التعليقات والسجلات"
                  moduleName="المعاملات"
                  tabName="التعليقات والسجلات"
                >
                  {renderTabButton(
                    "comments",
                    "التعليقات",
                    MessageCircle,
                    "#f97316",
                  )}
                </AccessControl>
                <AccessControl
                  code="Transaction_TAB_COMMENTS_LOGS"
                  permissionNumber={12}
                  name="سجل الأحداث"
                  moduleName="المعاملات"
                  tabName="سجل الأحداث"
                >
                  {renderTabButton("logs", "سجل الأحداث", Activity, "#475569")}
                </AccessControl>
              </>,
            )}

            {/* مجموعة الإدارة المالية */}
            
              {renderSidebarGroup(
                "الإدارة المالية والتسويات",
                "financial",
                <Landmark className="w-4 h-4 text-emerald-600" />,
                <>
                  <AccessControl
                    code="Transaction_TAB_FINANCIAL"
                    permissionNumber={15}
                    name="المحرك المالي"
                    moduleName="المعاملات"
                    tabName="المحرك المالي"
                  >
                    {renderTabButton(
                      "financial",
                      "المحرك المالي",
                      Calculator,
                      "#059669",
                    )}
                  </AccessControl>
                  <AccessControl
                    code="Transaction_TAB_BROKERS"
                    permissionNumber={16}
                    name="حساب الوسطاء"
                    moduleName="المعاملات"
                    tabName="حساب الوسطاء"
                  >
                    {renderTabButton(
                      "brokers",
                      "حساب الوسطاء",
                      Handshake,
                      "#0891b2",
                    )}
                  </AccessControl>
                  <AccessControl
                    code="Transaction_TAB_QUOTATION"
                    permissionNumber={31}
                    name="عرض السعر"
                    moduleName="المعاملات"
                    tabName="عرض السعر"
                  >
                    {renderTabButton(
                      "quotation",
                      "عرض السعر",
                      FileText,
                      "#0ea5e9",
                    )}
                  </AccessControl>

                  {/* عقد المعاملة مع المالك */}
                  <AccessControl
                    code="Transaction_TAB_OWNER_CONTRACT"
                    permissionNumber={32}
                    name="عقد المعاملة مع المالك"
                    moduleName="المعاملات"
                    tabName="عقد المعاملة مع المالك"
                  >
                    {renderTabButton(
                      "owner_contract",
                      "عقد المعاملة مع المالك",
                      FileSignature,
                      "#f59e0b",
                    )}
                  </AccessControl>

                  {/* فواتير أتعاب المعاملة */}
                  <AccessControl
                    code="Transaction_TAB_FEES_INVOICES"
                    permissionNumber={33}
                    name="فواتير أتعاب المعاملة"
                    moduleName="المعاملات"
                    tabName="فواتير أتعاب المعاملة"
                  >
                    {renderTabButton(
                      "fees_invoices",
                      "فواتير أتعاب المعاملة",
                      Receipt,
                      "#10b981",
                    )}
                  </AccessControl>
                  <AccessControl
                    code="Transaction_TAB_COOP_OFFICE"
                    permissionNumber={17}
                    name="المكاتب المتعاونة"
                    moduleName="المعاملات"
                    tabName="المكاتب المتعاونة"
                  >
                    {renderTabButton(
                      "coop_office",
                      "المكاتب المتعاونة",
                      Building2,
                      "#0284c7",
                    )}
                  </AccessControl>
                  <AccessControl
                    code="Transaction_TAB_AGENTS"
                    permissionNumber={18}
                    name="حساب المعقبين"
                    moduleName="المعاملات"
                    tabName="حساب المعقبين"
                  >
                    {renderTabButton(
                      "agents",
                      "حساب المعقبين",
                      User,
                      "#7c3aed",
                    )}
                  </AccessControl>
                  <AccessControl
                    code="Transaction_TAB_PAYMENTS"
                    permissionNumber={19}
                    name="دفعات العميل"
                    moduleName="المعاملات"
                    tabName="دفعات العميل"
                  >
                    {renderTabButton(
                      "payments",
                      "دفعات العميل",
                      Banknote,
                      "#16a34a",
                    )}
                  </AccessControl>
                  <AccessControl
                    code="Transaction_TAB_DATES"
                    permissionNumber={20}
                    name="مواعيد التحصيل"
                    moduleName="المعاملات"
                    tabName="مواعيد التحصيل"
                  >
                    {renderTabButton(
                      "dates",
                      "مواعيد التحصيل",
                      CalendarDays,
                      "#d946ef",
                    )}
                  </AccessControl>
                  <AccessControl
                    code="Transaction_TAB_SETTLEMENT"
                    permissionNumber={21}
                    name="التسوية الشاملة"
                    moduleName="المعاملات"
                    tabName="التسوية الشاملة"
                  >
                    {renderTabButton(
                      "settlement",
                      "التسوية الشاملة",
                      Scale,
                      "#2563eb",
                    )}
                  </AccessControl>
                  <AccessControl
                    code="Transaction_TAB_PROFITS"
                    permissionNumber={22}
                    name="توزيع الأرباح"
                    moduleName="المعاملات"
                    tabName="توزيع الأرباح"
                  >
                    {renderTabButton(
                      "profits",
                      "توزيع الأرباح",
                      PieChart,
                      "#8b5cf6",
                    )}
                  </AccessControl>
                </>,
              )}
            
            {/* مجموعة الدراسات الهندسية الفنية */}
            
              {renderSidebarGroup(
                "الدراسات الهندسية الفنية",
                "engineering",
                <HardHat className="w-4 h-4 text-amber-500" />,
                <>
                  <AccessControl
                    code="Transaction_TAB_ARCH_STUDY"
                    permissionNumber={24}
                    name="الدراسات المعمارية"
                    moduleName="المعاملات"
                    tabName="الدراسات المعمارية"
                  >
                    {renderTabButton(
                      "arch_study",
                      "الدراسات المعمارية",
                      Building,
                      "#d97706",
                    )}
                  </AccessControl>
                  <AccessControl
                    code="Transaction_TAB_STRUCT_STUDY"
                    permissionNumber={25}
                    name="الدراسات الإنشائية"
                    moduleName="المعاملات"
                    tabName="الدراسات الإنشائية"
                  >
                    {renderTabButton(
                      "struct_study",
                      "الدراسات الإنشائية",
                      Pickaxe,
                      "#ea580c",
                    )}
                  </AccessControl>
                  <AccessControl
                    code="Transaction_TAB_SOIL_TEST"
                    permissionNumber={26}
                    name="فحص التربة"
                    moduleName="المعاملات"
                    tabName="فحص التربة"
                  >
                    {renderTabButton("soil_test", "فحص التربة", Map, "#b45309")}
                  </AccessControl>
                  <AccessControl
                    code="Transaction_TAB_TRAFFIC_STUDY"
                    permissionNumber={27}
                    name="الدراسات المرورية"
                    moduleName="المعاملات"
                    tabName="الدراسات المرورية"
                  >
                    {renderTabButton(
                      "traffic_study",
                      "الدراسات المرورية",
                      Car,
                      "#dc2626",
                    )}
                  </AccessControl>
                  <AccessControl
                    code="Transaction_TAB_PARKING"
                    permissionNumber={28}
                    name="مواقف السيارات"
                    moduleName="المعاملات"
                    tabName="مواقف السيارات"
                  >
                    {renderTabButton(
                      "parking",
                      "مواقف السيارات",
                      Archive,
                      "#475569",
                    )}
                  </AccessControl>
                  <AccessControl
                    code="Transaction_TAB_MECH_STUDY"
                    permissionNumber={29}
                    name="الدراسات الميكانيكية"
                    moduleName="المعاملات"
                    tabName="الدراسات الميكانيكية"
                  >
                    {renderTabButton(
                      "mech_study",
                      "الدراسات الميكانيكية",
                      Wind,
                      "#0284c7",
                    )}
                  </AccessControl>
                  <AccessControl
                    code="Transaction_TAB_ELEC_STUDY"
                    permissionNumber={30}
                    name="الدراسات الكهربائية"
                    moduleName="المعاملات"
                    tabName="الدراسات الكهربائية"
                  >
                    {renderTabButton(
                      "elec_study",
                      "الدراسات الكهربائية",
                      Zap,
                      "#eab308",
                    )}
                  </AccessControl>
                  <AccessControl
                    code="Transaction_TAB_SAFETY"
                    permissionNumber={31}
                    name="الأمن والسلامة"
                    moduleName="المعاملات"
                    tabName="الأمن والسلامة"
                  >
                    {renderTabButton(
                      "safety",
                      "الأمن والسلامة",
                      ShieldCheck,
                      "#16a34a",
                    )}
                  </AccessControl>
                </>,
              )}
            
            {/* مجموعة التعهدات والمستندات */}
            
              {renderSidebarGroup(
                "مستندات وتعهدات",
                "documents",
                <FileCheck className="w-4 h-4 text-indigo-500" />,
                <>
                  <AccessControl
                    code="Transaction_TAB_OWNER_PLEDGE"
                    permissionNumber={33}
                    name="تعهدات المالك"
                    moduleName="المعاملات"
                    tabName="تعهدات المالك"
                  >
                    {renderTabButton(
                      "owner_pledge",
                      "تعهدات المالك",
                      FileText,
                      "#4f46e5",
                    )}
                  </AccessControl>
                  <AccessControl
                    code="Transaction_TAB_DESIGNER_PLEDGE"
                    permissionNumber={34}
                    name="تعهدات المكتب المصمم"
                    moduleName="المعاملات"
                    tabName="تعهدات المكتب المصمم"
                  >
                    {renderTabButton(
                      "designer_pledge",
                      "تعهدات المكتب المصمم",
                      PenLine,
                      "#6366f1",
                    )}
                  </AccessControl>
                  <AccessControl
                    code="Transaction_TAB_SUPERVISOR_PLEDGE"
                    permissionNumber={35}
                    name="تعهدات المكتب المشرف"
                    moduleName="المعاملات"
                    tabName="تعهدات المكتب المشرف"
                  >
                    {renderTabButton(
                      "supervisor_pledge",
                      "تعهدات المكتب المشرف",
                      ClipboardList,
                      "#8b5cf6",
                    )}
                  </AccessControl>
                  <AccessControl
                    code="Transaction_TAB_INSURANCE"
                    permissionNumber={36}
                    name="وثيقة التأمين"
                    moduleName="المعاملات"
                    tabName="وثيقة التأمين"
                  >
                    {renderTabButton(
                      "insurance",
                      "وثيقة التأمين",
                      ShieldCheck,
                      "#14b8a6",
                    )}
                  </AccessControl>
                  <AccessControl
                    code="Transaction_TAB_TECH_REPORT"
                    permissionNumber={37}
                    name="التقرير الفني"
                    moduleName="المعاملات"
                    tabName="التقرير الفني"
                  >
                    {renderTabButton(
                      "tech_report",
                      "التقرير الفني",
                      FileEdit,
                      "#f59e0b",
                    )}
                  </AccessControl>
                  <AccessControl
                    code="Transaction_TAB_OFFICIAL_ARCHIVE"
                    permissionNumber={38}
                    name="الأرشيف الرسمي"
                    moduleName="المعاملات"
                    tabName="الأرشيف الرسمي"
                  >
                    {renderTabButton(
                      "official_archive",
                      "الأرشيف الرسمي",
                      FolderCog,
                      "#64748b",
                    )}
                  </AccessControl>
                  <AccessControl
                    code="Transaction_TAB_OWNER_ATTACHMENTS"
                    permissionNumber={39}
                    name="مرفقات من المالك"
                    moduleName="المعاملات"
                    tabName="مرفقات من المالك"
                  >
                    {renderTabButton(
                      "owner_attachments",
                      "مرفقات من المالك",
                      Paperclip,
                      "#3b82f6",
                    )}
                  </AccessControl>
                </>,
              )}
            
            {/* التبويبات الفردية المتبقية (خارج المجموعات) */}
            <div className="mt-4 border-t border-slate-200 pt-2">
              <AccessControl
                code="Transaction_TAB_SUPERVISION"
                permissionNumber={40}
                name="الإشراف الهندسي"
                moduleName="المعاملات"
                tabName="الإشراف الهندسي"
              >
                {renderTabButton(
                  "supervision",
                  "الإشراف الهندسي",
                  EyeOff,
                  "#ef4444",
                )}
              </AccessControl>
              <AccessControl
                code="Transaction_TAB_EXECUTION"
                permissionNumber={41}
                name="التنفيذ والمقاولات"
                moduleName="المعاملات"
                tabName="التنفيذ والمقاولات"
              >
                {renderTabButton(
                  "execution",
                  "التنفيذ والمقاولات",
                  Building2,
                  "#f97316",
                )}
              </AccessControl>
            </div>
            </div>
          </div>

          {/* 💡 Dynamic Content Area (Left in RTL) */}
          <div
            className={`order-1 relative h-full min-h-0 min-w-0 flex-1 basis-0 overflow-hidden ${isSidebarOpenMobile ? "hidden md:block" : "block"}`}
            dir="rtl"
          >
            <div
              className="h-full min-h-0 w-full overflow-y-scroll overflow-x-hidden overscroll-contain custom-scrollbar-slim"
            >
              {/* المكونات الأساسية المتوفرة حالياً */}
              {activeTab === "basic" && <BasicTab {...tabContext} />}
              {activeTab === "request_data" && (
                <RequestDataTab {...tabContext} />
              )}
              {activeTab === "status" && <StatusTab {...tabContext} />}
              {activeTab === "financial" && <FinancialTab {...tabContext} />}
              {activeTab === "brokers" && <BrokersTab {...tabContext} />}
              {activeTab === "authority_notes" && (
                <AuthorityNotesTab {...tabContext} />
              )}
              {activeTab === "comments" && <CommentsTab {...tabContext} />}
              {activeTab === "coop_office" && <CoopOfficeTab {...tabContext} />}
              {activeTab === "agents" && <AgentsTab {...tabContext} />}
              {activeTab === "remote" && <RemoteTab {...tabContext} />}
              {activeTab === "tasks" && <TasksTab {...tabContext} />}
              {activeTab === "payments" && <PaymentsTab {...tabContext} />}
              {activeTab === "settlement" && <SettlementTab {...tabContext} />}
              {activeTab === "profits" && <ProfitsTab {...tabContext} />}
              {activeTab === "attachments" && (
                <AttachmentsTab {...tabContext} />
              )}
              {activeTab === "dates" && <DatesTab {...tabContext} />}
              {activeTab === "logs" && <LogsTab {...tabContext} />}

              {/* عناصر نائبة (Placeholders) للتبويبات الجديدة الفارغة */}
              {![
                "basic",
                "request_data",
                "status",
                "financial",
                "brokers",
                "coop_office",
                "agents",
                "remote",
                "tasks",
                "payments",
                "settlement",
                "profits",
                "attachments",
                "dates",
                "comments",
                "authority_notes",
                "logs",
              ].includes(activeTab) && (
                <div className="flex h-full min-h-[400px] flex-col items-center justify-center rounded-[28px] border border-dashed border-[#d8b46a]/45 bg-white/75 text-center text-[#64748b] shadow-[0_14px_34px_rgba(18,63,89,0.08)]">
                  <IconWithText
                    icon={FolderCog}
                    text="قريباً"
                    vertical
                    iconClassName="h-16 w-16 text-[#c5983c]/35"
                    textClassName="text-[9px] font-black text-[#c5983c]/50"
                  />
                  <h3 className="mb-2 text-xl font-black text-[#123f59]">
                    جاري استكمال التبويب
                  </h3>
                  <p className="max-w-sm text-center text-sm font-bold leading-relaxed text-[#64748b]">
                    سيتم برمجة وربط التبويب
                    <span className="mx-1 text-[#c5983c]">({activeTab})</span>
                    قريباً ليحتوي على الحقول المخصصة له.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
