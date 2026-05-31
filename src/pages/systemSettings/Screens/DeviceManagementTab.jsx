import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../api/axios";
import {
  Monitor,
  Printer,
  Server,
  Smartphone,
  Video,
  Wifi,
  Search,
  Plus,
  Download,
  MoreVertical,
  ShieldCheck,
  AlertTriangle,
  BrainCircuit,
  X,
  QrCode,
  FileText,
  Activity,
  Wrench,
  Wand2,
  CheckCircle2,
  Package,
  Network,
  UploadCloud,
  Save,
  Trash2,
  Edit,
  Info,
  DollarSign,
  User,
  Cpu,
  HardDrive,
  Layers,
  Loader2,
  AlertOctagon,
  Image as ImageIcon,
} from "lucide-react";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";
import { toast } from "sonner";
import { STAMP_TEMPLATE } from "../../../components/Stamp/stampTemplate"; // قم بتعديل المسار حسب مكان حفظك للملف

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const defaultCategories = [
  { id: "Computer", label: "أجهزة كمبيوتر", icon: Monitor },
  { id: "Printer", label: "طابعات", icon: Printer },
  { id: "Server", label: "خوادم", icon: Server },
  { id: "Camera", label: "كاميرات", icon: Video },
  { id: "Network", label: "شبكات", icon: Wifi },
];

const emptyDeviceForm = {
  name: "",
  type: "Computer",
  brand: "",
  model: "",
  serialNumber: "",
  status: "Active",
  location: "",
  assignedTo: "",
  purchaseDate: "",
  purchasePrice: "",
  depreciationRate: "",
  vendor: "",
  warrantyEnd: "",
  invoiceAttachment: "",
  attachments: [],
  specs: { cpu: "", ram: "", storage: "", gpu: "", os: "", chassisNumber: "" },
  network: {
    internalIp: "",
    staticIp: "",
    macAddresses: [""],
    tailscaleIp: "",
    zeroTierIp: "",
    domain: "",
  },
};

export const getFullUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  let fixedUrl = url;
  if (url.startsWith("/uploads/")) fixedUrl = `/api${url}`;
  const baseUrl = "https://details-worksystem1.com";
  return `${baseUrl}${fixedUrl}`;
};

export default function DevicesMain() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const aiImageInputRef = useRef(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDevice, setSelectedDevice] = useState(null);

  // Modal States
  const [isDeviceModalOpen, setIsDeviceModalOpen] = useState(false);
  const [deviceModalMode, setDeviceModalMode] = useState("add");
  const [deviceForm, setDeviceForm] = useState(emptyDeviceForm);
  const [isAIExtracting, setIsAIExtracting] = useState(false);

  const [isStickerModalOpen, setIsStickerModalOpen] = useState(false);
  const [isAddMaintenanceOpen, setIsAddMaintenanceOpen] = useState(false);
  const [newMaintenance, setNewMaintenance] = useState({
    date: "",
    type: "",
    description: "",
    technician: "",
  });
  const [editingMaintenance, setEditingMaintenance] = useState(null);
  const [isAddConsumableOpen, setIsAddConsumableOpen] = useState(false);
  const [newConsumable, setNewConsumable] = useState({
    name: "",
    status: "جيد",
    validity: "",
  });
  const [isLinkSystemModalOpen, setIsLinkSystemModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("info");

  // ==========================================
  // 🚀 Queries
  // ==========================================
  const { data: devices = [], isLoading } = useQuery({
    queryKey: ["devices"],
    queryFn: async () => {
      const res = await api.get("/devices");
      return res.data?.data || [];
    },
  });

  const { data: persons = [] } = useQuery({
    queryKey: ["persons-directory"],
    queryFn: async () => {
      const res = await api.get("/persons");
      return res.data?.data || [];
    },
  });

  const { data: customCategories = [] } = useQuery({
    queryKey: ["device-categories"],
    queryFn: async () => {
      const res = await api.get("/devices/categories");
      return res.data?.data || [];
    },
  });

  const allCategories = [
    ...defaultCategories,
    ...customCategories.map((cat) => ({
      id: cat.value,
      label: cat.label,
      icon: Package,
    })),
  ];

  const staffOnly = persons.filter(
    (p) => p.role === "موظف" || p.role === "شريك",
  );

  // ==========================================
  // 🚀 Mutations
  // ==========================================
  const addDeviceMutation = useMutation({
    mutationFn: (deviceData) => api.post("/devices", deviceData),
    onSuccess: () => {
      toast.success("تم إضافة الجهاز بنجاح");
      queryClient.invalidateQueries(["devices"]);
      setIsDeviceModalOpen(false);
      setDeviceForm(emptyDeviceForm);
    },
  });

  const addCategoryMutation = useMutation({
    mutationFn: (newCat) => api.post("/devices/categories", newCat),
    onSuccess: () => {
      queryClient.invalidateQueries(["device-categories"]);
      toast.success("تم إضافة التصنيف بنجاح");
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "خطأ في الإضافة"),
  });

  const updateDeviceMutation = useMutation({
    mutationFn: (updatedData) =>
      api.put(`/devices/${updatedData.id}`, updatedData),
    onSuccess: (res) => {
      toast.success("تم الحفظ بنجاح");
      queryClient.invalidateQueries(["devices"]);
      if (selectedDevice && selectedDevice.id === res.data.data.id)
        setSelectedDevice(res.data.data);
      if (isDeviceModalOpen && deviceModalMode === "edit") {
        setIsDeviceModalOpen(false);
        setDeviceForm(emptyDeviceForm);
      }
    },
  });

  const deleteDeviceMutation = useMutation({
    mutationFn: (id) => api.delete(`/devices/${id}`),
    onSuccess: () => {
      toast.success("تم حذف الجهاز");
      queryClient.invalidateQueries(["devices"]);
      setSelectedDevice(null);
    },
  });

  const uploadAttachmentMutation = useMutation({
    mutationFn: async ({ file, deviceId }) => {
      const formData = new FormData();
      formData.append("file", file);
      const res = await api.post("/devices/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const fileUrl = res.data.url || res.data.fileUrl || res.data.filePath;
      return api.put(`/devices/${deviceId}`, { invoiceAttachment: fileUrl });
    },
    onSuccess: (res) => {
      toast.success("تم رفع المرفق");
      queryClient.invalidateQueries(["devices"]);
      if (selectedDevice && selectedDevice.id === res.data.data.id)
        setSelectedDevice(res.data.data);
    },
    onError: () => toast.error("حدث خطأ أثناء الرفع"),
  });

  // ==========================================
  // 🚀 Handlers
  // ==========================================
  const handleOpenAddModal = () => {
    setDeviceModalMode("add");
    setDeviceForm(emptyDeviceForm);
    setIsDeviceModalOpen(true);
  };

  const handleOpenEditModal = (device, e) => {
    if (e) e.stopPropagation();
    setDeviceModalMode("edit");
    // Ensure all nested objects exist to prevent undefined errors
    setDeviceForm({
      ...device,
      specs: device.specs || emptyDeviceForm.specs,
      network: {
        ...emptyDeviceForm.network,
        ...(device.network || {}),
      },
    });
    setIsDeviceModalOpen(true);
  };

  const handleDeviceSubmit = (e) => {
    e.preventDefault();
    if (deviceModalMode === "add") addDeviceMutation.mutate(deviceForm);
    else updateDeviceMutation.mutate(deviceForm);
  };

  const handleStatusChange = (device, newStatus) => {
    updateDeviceMutation.mutate({ ...device, status: newStatus });
  };

  // الصيانة
  const handleAddMaintenanceSubmit = (e) => {
    e.preventDefault();
    if (!selectedDevice) return;
    const updatedHistory = [
      newMaintenance,
      ...(selectedDevice.maintenanceHistory || []),
    ];
    updateDeviceMutation.mutate({
      ...selectedDevice,
      maintenanceHistory: updatedHistory,
    });
    setIsAddMaintenanceOpen(false);
    setNewMaintenance({ date: "", type: "", description: "", technician: "" });
  };
  const handleSaveMaintenance = (idx) => {
    if (editingMaintenance) {
      const updatedHistory = selectedDevice.maintenanceHistory.map((m, i) =>
        i === idx
          ? {
              date: editingMaintenance.date,
              type: editingMaintenance.type,
              description: editingMaintenance.description,
              technician: editingMaintenance.technician,
            }
          : m,
      );
      updateDeviceMutation.mutate({
        ...selectedDevice,
        maintenanceHistory: updatedHistory,
      });
      setEditingMaintenance(null);
    }
  };
  const handleDeleteMaintenance = (idx) => {
    const updatedHistory = selectedDevice.maintenanceHistory.filter(
      (_, i) => i !== idx,
    );
    updateDeviceMutation.mutate({
      ...selectedDevice,
      maintenanceHistory: updatedHistory,
    });
  };

  // المستهلكات
  const handleAddConsumableSubmit = (e) => {
    e.preventDefault();
    if (!selectedDevice || !newConsumable.name) return;
    const updatedConsumables = [
      ...(selectedDevice.consumables || []),
      newConsumable,
    ];
    updateDeviceMutation.mutate({
      ...selectedDevice,
      consumables: updatedConsumables,
    });
    setIsAddConsumableOpen(false);
    setNewConsumable({ name: "", status: "جيد", validity: "" });
  };

  const handleLinkSystemSubmit = (sysName) => {
    updateDeviceMutation.mutate({ ...selectedDevice, linkedSystem: sysName });
    setIsLinkSystemModalOpen(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && selectedDevice)
      uploadAttachmentMutation.mutate({ file, deviceId: selectedDevice.id });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleOpenSticker = (device, e) => {
    e.stopPropagation();
    setSelectedDevice(device);
    setIsStickerModalOpen(true);
  };

  const calculateCurrentValue = (price, date, rate) => {
    if (!price || !date || !rate) return null;
    const yearsElapsed =
      (new Date() - new Date(date)) / (1000 * 60 * 60 * 24 * 365.25);
    if (yearsElapsed < 0) return price;
    const depreciationAmount =
      parseFloat(price) * (parseFloat(rate) / 100) * yearsElapsed;
    const currentValue = parseFloat(price) - depreciationAmount;
    return currentValue > 0 ? currentValue.toFixed(2) : 0;
  };

  const handleAddCategory = () => {
    const newCatLabel = prompt(
      "أدخل اسم التصنيف الجديد (مثال: شاشات، كابلات، راوترات):",
    );
    if (newCatLabel && newCatLabel.trim()) {
      const value = newCatLabel.trim().replace(/\s+/g, "-");
      if (
        allCategories.some(
          (c) => c.id === value || c.label === newCatLabel.trim(),
        )
      )
        return toast.error("هذا التصنيف موجود مسبقاً");
      addCategoryMutation.mutate({ label: newCatLabel.trim(), value });
    }
  };

  const handleAIImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 💡 التحقق: بما أن العملية تتم في الخلفية، يجب أن يكون الجهاز محفوظاً أولاً لنتمكن من تحديثه
    if (deviceModalMode === "add" || !deviceForm.id) {
      toast.error(
        "يرجى حفظ الجهاز أولاً (إضافة الأصل) قبل رفع الصورة للتحليل التلقائي.",
      );
      if (aiImageInputRef.current) aiImageInputRef.current.value = "";
      return;
    }

    setIsAIExtracting(true);
    const formData = new FormData();
    formData.append("image", file);
    formData.append("deviceId", deviceForm.id); // 👈 نرسل ID الجهاز للطابور

    try {
      const res = await api.post("/devices/extract-specs", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // 202 Accepted تعني أنه تم استلام الطلب ووضعه في الطابور
      if (res.status === 202 || res.data?.success) {
        const imageUrl = res.data.imageUrl;

        // نضيف الصورة للمرفقات محلياً كشكل مبدئي مع إشارة أنها قيد التحليل
        setDeviceForm((prev) => ({
          ...prev,
          attachments: [
            ...(prev.attachments || []),
            {
              name: "مواصفات (قيد التحليل بالخلفية ⏳)",
              url: imageUrl,
              date: new Date().toISOString(),
            },
          ],
        }));

        toast.success(
          "تم إرسال الصورة للتحليل في الخلفية 🪄. يمكنك إغلاق النافذة وسنرسل لك إشعاراً فور انتهاء التحديث.",
        );
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "تعذر إرسال الصورة للتحليل");
    } finally {
      setIsAIExtracting(false);
      if (aiImageInputRef.current) aiImageInputRef.current.value = "";
    }
  };

  const filteredDevices = devices.filter((device) => {
    const matchesSearch =
      device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.serialNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || device.type === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getDeviceIcon = (type, className = "w-6 h-6") => {
    const cat = allCategories.find((c) => c.id === type);
    if (cat) {
      const Icon = cat.icon;
      return <Icon className={className} />;
    }
    return <Package className={className} />;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "Warning":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "Offline":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-[#eef5f7] text-[#123B5D] border-[#d8e6ee]";
    }
  };

  // 🚀 دالة طباعة الملصق بشكل احترافي وحقيقي
  // 🚀 دالة طباعة الملصق الاحترافي والآمن (تتحدث مع الباك إند)
  const handlePrintSticker = async () => {
    if (!selectedDevice) return;

    try {
      // 1. طلب الختم الآمن من السيرفر
      const res = await api.get(`/devices/${selectedDevice.id}/stamp`);
      const { qrBase64, barcodeBase64, dynamicBarcodeText } = res.data.data;

      // 2. حقن البيانات الموثقة والمشفرة داخل الـ SVG
      const dynamicStampSvg = STAMP_TEMPLATE.replace(
        "{{QR_DATA_URL}}",
        qrBase64,
      )
        .replace("{{BARCODE_DATA_URL}}", barcodeBase64)
        // نستخدم النص المتغير الذي يحتوي كود الجهاز + رمز الطباعة
        .replace("{{BARCODE_TEXT}}", dynamicBarcodeText);

      const printWindow = window.open("", "_blank", "width=800,height=600");

      const htmlContent = `
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
        <head>
          <meta charset="UTF-8">
          <title>وثيقة أمنية - ${dynamicBarcodeText}</title>
          <style>
            @page { size: auto; margin: 0; }
            body {
              margin: 0; padding: 0; display: flex; justify-content: center;
              align-items: center; height: 100vh; background-color: #fff;
              -webkit-print-color-adjust: exact; print-color-adjust: exact;
            }
            .svg-container { width: 100%; max-width: 900px; }
          </style>
        </head>
        <body>
          <div class="svg-container">
            ${dynamicStampSvg}
          </div>
          <script>
            // الطباعة فوراً لأن الصور تم تحويلها بالفعل إلى Base64 ولا تحتاج للتحميل من الإنترنت!
            window.onload = () => {
              window.print();
              window.close();
            };
          </script>
        </body>
        </html>
      `;

      printWindow.document.open();
      printWindow.document.write(htmlContent);
      printWindow.document.close();

      setIsStickerModalOpen(false);
      toast.success("تم إصدار الوثيقة الأمنية للطباعة بنجاح 🛡️");
    } catch (error) {
      toast.error("حدث خطأ أثناء الاتصال بخادم الأمان لتوليد الختم");
    }
  };

  return (
    <div
      className="h-full overflow-y-auto bg-[#eef5f7] p-4 md:p-5 custom-scrollbar"
      dir="rtl"
    >
      {/* Header */}
      <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-l from-[#071927] via-[#0b2f3f] to-[#147785] border border-[#d9b85b]/25 shadow-[0_14px_28px_rgba(8,54,70,0.14)] px-4 md:px-5 py-3.5 mb-4">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-[18px] bg-[#d9b85b] text-[#083646] flex items-center justify-center shrink-0 shadow-sm">
              <Package className="w-6 h-6" />
            </div>
            <div className="min-w-0" style={{ fontFamily: "Tajawal, sans-serif" }}>
              <div className="text-[16px] font-bold leading-tight whitespace-nowrap" style={{ color: "#ffffff", textShadow: "0 1px 2px rgba(0,0,0,0.28)" }}>إدارة الأجهزة والأصول</div>
              <div className="text-[10px] font-semibold mt-0.5 whitespace-nowrap" style={{ color: "rgba(255,255,255,0.86)" }}>تتبع الأجهزة، الصيانة، الملصقات، وإدارة العهد</div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center gap-2.5 xl:min-w-[520px]">
            <button
              onClick={handleOpenAddModal}
              className="h-11 px-4 rounded-[16px] bg-[#d9b85b] text-[#083646] border border-[#f0d98d] shadow-sm font-black text-[13px] flex items-center justify-center gap-2 hover:bg-[#e6c86c] active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة جهاز جديد</span>
            </button>
            <button
              onClick={() => toast.success('جاري التحضير للتصدير...')}
              className="h-11 px-4 rounded-[16px] bg-white text-[#123B5D] border border-[#d8e6ee] shadow-sm font-black text-[13px] flex items-center justify-center gap-2 hover:bg-[#f8fbfd]"
            >
              <Download className="w-4 h-4" />
              <span>تصدير CSV</span>
            </button>
            <div className="relative h-11 flex-1 min-w-[220px]">
              <Search className="w-4.5 h-4.5 text-[#8aa0b4] absolute right-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="البحث عن جهاز..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-full rounded-[16px] bg-white border border-[#d8e6ee] pr-11 pl-4 text-[12px] font-bold text-[#123B5D] placeholder:text-[#8aa0b4] focus:outline-none focus:ring-2 focus:ring-[#d9b85b]/30"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-4">
        <div className="bg-white rounded-[20px] p-4 border border-[#d8e6ee] shadow-sm flex items-center justify-between relative overflow-hidden">
          <div className="absolute inset-y-0 right-0 w-1.5 bg-blue-500" />
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 bg-blue-50 text-[#0f6d7c] rounded-xl shrink-0">
              <Package className="w-5 h-5" />
            </div>
            <span className="text-[12px] font-black text-[#123B5D] tracking-tight truncate">إجمالي الأجهزة</span>
          </div>
          <div className="text-[22px] font-black text-[#123B5D] leading-none">{devices.length}</div>
        </div>
        <div className="bg-white rounded-[20px] p-4 border border-[#d8e6ee] shadow-sm flex items-center justify-between relative overflow-hidden">
          <div className="absolute inset-y-0 right-0 w-1.5 bg-emerald-500" />
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 bg-emerald-50 text-[#0f6d7c] rounded-xl shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="text-[12px] font-black text-[#123B5D] tracking-tight truncate">تعمل بكفاءة</span>
          </div>
          <div className="text-[22px] font-black text-[#123B5D] leading-none">{devices.filter((d) => d.status === 'Active').length}</div>
        </div>
        <div className="bg-white rounded-[20px] p-4 border border-[#d8e6ee] shadow-sm flex items-center justify-between relative overflow-hidden">
          <div className="absolute inset-y-0 right-0 w-1.5 bg-amber-500" />
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl shrink-0">
              <Wrench className="w-5 h-5" />
            </div>
            <span className="text-[12px] font-black text-[#123B5D] tracking-tight truncate">تتطلب صيانة</span>
          </div>
          <div className="text-[22px] font-black text-[#123B5D] leading-none">{devices.filter((d) => d.status === 'Warning').length}</div>
        </div>
        <div className="bg-white rounded-[20px] p-4 border border-[#d8e6ee] shadow-sm flex items-center justify-between relative overflow-hidden">
          <div className="absolute inset-y-0 right-0 w-1.5 bg-red-500" />
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 bg-red-50 text-red-600 rounded-xl shrink-0">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <span className="text-[12px] font-black text-[#123B5D] tracking-tight truncate">خارج الخدمة</span>
          </div>
          <div className="text-[22px] font-black text-[#123B5D] leading-none">{devices.filter((d) => d.status === 'Offline').length}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-[22px] bg-white border border-[#d8e6ee] shadow-sm p-3 mb-5">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
          <button
            onClick={() => setSelectedCategory("All")}
            className={cn(
              "px-4 py-2.5 rounded-xl text-[13px] font-bold whitespace-nowrap transition-all border",
              selectedCategory === "All"
                ? "bg-[#083646] text-white border-[#d9b85b]/60 shadow-md"
                : "bg-white text-[#123B5D] border-[#d8e6ee] hover:bg-[#f7fbfd]",
            )}
          >
            الكل
          </button>
          {allCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                "px-4 py-2.5 rounded-xl text-[13px] font-bold whitespace-nowrap transition-all flex items-center gap-2 border",
                selectedCategory === cat.id
                  ? "bg-[#083646] text-white border-[#d9b85b]/60 shadow-md"
                  : "bg-white text-[#123B5D] border-[#d8e6ee] hover:bg-[#f7fbfd]",
              )}
            >
              <cat.icon
                className={cn(
                  "w-4 h-4",
                  selectedCategory === cat.id
                    ? "text-emerald-400"
                    : "text-[#8aa0b4]",
                )}
              />{" "}
              {cat.label}
            </button>
          ))}
          <button
            onClick={handleAddCategory}
            className="px-4 py-2.5 rounded-xl text-[13px] font-black bg-[#fbf7ef] text-[#123B5D] border border-[#d9b85b]/45 hover:bg-[#f6eddc] flex items-center gap-2"
            title="إضافة تصنيف جديد"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة تصنيف</span>
          </button>
        </div>
      </div>

      {/* Devices Grid */}
      <div className="pb-4">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
          </div>
        ) : filteredDevices.length === 0 ? (
          <div className="text-center py-20 text-[#8aa0b4] font-bold">
            لا توجد أجهزة مطابقة للبحث
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {filteredDevices.map((device) => (
              <div
                key={device.id}
                className="bg-white rounded-[24px] border border-[#d8e6ee] shadow-sm hover:shadow-md hover:border-emerald-300 p-4 group cursor-pointer flex flex-col"
                onClick={() => {
                  setSelectedDevice(device);
                  setActiveTab("info");
                }}
              >
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-12 h-12 bg-[#f7fbfd] rounded-[16px] flex items-center justify-center text-[#52677e] border border-[#d8e6ee] shrink-0 shadow-sm">
                      {getDeviceIcon(device.type, "w-5 h-5")}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-[17px] font-black text-[#123B5D] leading-tight line-clamp-1">
                        {device.name}
                      </h3>
                      <div className="text-[11px] font-bold text-[#71839a] mt-1 line-clamp-1">
                        {device.brand || "—"} {device.model || ""}
                      </div>
                    </div>
                  </div>
                  <div className="relative flex items-center shrink-0">
                    <select
                      value={device.status}
                      onChange={(e) =>
                        handleStatusChange(device, e.target.value)
                      }
                      onClick={(e) => e.stopPropagation()}
                      className={cn(
                        "px-2.5 py-1 rounded-lg text-[11px] font-black border outline-none cursor-pointer appearance-none text-center",
                        getStatusColor(device.status),
                      )}
                    >
                      <option value="Active">نشط</option>
                      <option value="Warning">تحذير</option>
                      <option value="Offline">متوقف</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 mb-4 flex-1">
                  <div className="bg-[#f7fbfd] border border-[#e7eef2] rounded-[16px] p-3">
                    <div className="text-[11px] font-bold text-[#71839a] mb-1">الرقم التسلسلي</div>
                    <div className="font-mono font-black text-[#123B5D] text-[15px] break-all leading-tight">
                      {device.serialNumber || "—"}
                    </div>
                  </div>
                  <div className="bg-[#f7fbfd] border border-[#e7eef2] rounded-[16px] p-3">
                    <div className="text-[11px] font-bold text-[#71839a] mb-1">العهدة</div>
                    <div className="font-bold text-[#123B5D] text-[13px] leading-relaxed line-clamp-2 min-h-[20px]">
                      {device.assignedTo || "غير مخصص"}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-[#e7eef2] mt-auto">
                  <button
                    onClick={(e) => handleOpenSticker(device, e)}
                    className="flex-1 h-11 rounded-[16px] bg-[#083646] text-white font-black text-[12px] flex items-center justify-center gap-2 hover:bg-[#0f6d7c] shadow-sm"
                    title="طباعة ستيكر"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>طباعة ستيكر</span>
                  </button>
                  <button
                    onClick={(e) => handleOpenEditModal(device, e)}
                    className="flex-1 h-11 rounded-[16px] bg-[#fbf7ef] text-[#123B5D] border border-[#ecd8a6] font-black text-[12px] flex items-center justify-center gap-2 hover:bg-[#f6eddc]"
                    title="تعديل الجهاز"
                  >
                    <Edit className="w-4 h-4" />
                    <span>تعديل الجهاز</span>
                  </button>
                  <div className="relative group shrink-0">
                    <button
                      className="w-11 h-11 text-[#8aa0b4] hover:text-[#52677e] hover:bg-[#eef5f7] border border-[#d8e6ee] rounded-[16px] flex items-center justify-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>
                    <div
                      className="absolute left-0 bottom-full mb-2 w-48 bg-white rounded-xl shadow-xl border border-[#e7eef2] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => {
                          setSelectedDevice(device);
                          setIsAddMaintenanceOpen(true);
                        }}
                        className="w-full text-right px-4 py-2.5 text-sm font-bold text-[#123B5D] hover:bg-[#f7fbfd] hover:text-[#0f6d7c] flex items-center gap-2"
                      >
                        <Wrench className="w-4 h-4" /> تسجيل صيانة
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm("حذف؟"))
                            deleteDeviceMutation.mutate(device.id);
                        }}
                        className="w-full text-right px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-[#e7eef2]"
                      >
                        <Trash2 className="w-4 h-4" /> حذف الجهاز
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ========================================== */}
      {/* 🚀 Modal: عرض تفاصيل الجهاز (Read-Only) */}
      {/* ========================================== */}
      <AnimatePresence>
        {selectedDevice &&
          !isStickerModalOpen &&
          !isLinkSystemModalOpen &&
          !isAddMaintenanceOpen &&
          !isAddConsumableOpen &&
          !isDeviceModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                onClick={() => setSelectedDevice(null)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-5xl max-h-[90vh] bg-white rounded-[26px] shadow-2xl overflow-hidden flex flex-col"
              >
                {/* Header */}
                <div className="px-8 py-6 border-b border-[#e7eef2] flex justify-between items-center bg-[#f7fbfd] shrink-0">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-white border border-[#d8e6ee] rounded-[22px] flex items-center justify-center text-[#123B5D] shadow-sm">
                      {getDeviceIcon(selectedDevice.type)}
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-[#123B5D] flex items-center gap-3">
                        {selectedDevice.name}
                        <span className="font-mono text-sm bg-blue-100 text-blue-700 px-2 py-0.5 rounded border border-[#d8e6ee]">
                          {selectedDevice.deviceCode}
                        </span>
                      </h2>
                      <div className="flex items-center gap-3 mt-1">
                        <p className="text-sm font-bold text-[#71839a]">
                          {selectedDevice.brand} {selectedDevice.model}
                        </p>
                        {/* الحالة تبقى تفاعلية لسهولة الاستخدام */}
                        <select
                          value={selectedDevice.status}
                          onChange={(e) =>
                            handleStatusChange(selectedDevice, e.target.value)
                          }
                          className={cn(
                            "px-2 py-0.5 rounded-md text-[10px] font-black border outline-none cursor-pointer appearance-none text-center",
                            getStatusColor(selectedDevice.status),
                          )}
                        >
                          <option value="Active">نشط</option>
                          <option value="Warning">تحذير</option>
                          <option value="Offline">متوقف</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        setSelectedDevice(null);
                        handleOpenEditModal(selectedDevice);
                      }}
                      className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 text-[#0f6d7c] rounded-xl font-bold hover:bg-blue-100 transition-all"
                    >
                      <Edit className="w-4 h-4" /> تعديل شامل
                    </button>
                    <button
                      onClick={() => setIsStickerModalOpen(true)}
                      className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-md"
                    >
                      <QrCode className="w-4 h-4" /> طباعة ستيكر
                    </button>
                    <div className="w-px h-8 bg-slate-200 mx-1" />
                    <button
                      onClick={() => setSelectedDevice(null)}
                      className="p-2.5 text-[#8aa0b4] hover:bg-slate-200 rounded-full transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-6 px-8 border-b border-[#e7eef2] bg-white shrink-0">
                  {[
                    { id: "info", label: "المعلومات الأساسية", icon: Info },
                    {
                      id: "network",
                      label: "الشبكة والمواصفات",
                      icon: Network,
                    },
                    { id: "maintenance", label: "سجل الصيانة", icon: Wrench },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        "py-4 text-sm font-black border-b-2 transition-colors flex items-center gap-2",
                        activeTab === tab.id
                          ? "border-emerald-500 text-[#0f6d7c]"
                          : "border-transparent text-[#71839a] hover:text-[#123B5D]",
                      )}
                    >
                      <tab.icon className="w-4 h-4" /> {tab.label}
                    </button>
                  ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-[#f7fbfd]/30">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Content */}
                    <div className="lg:col-span-2 space-y-8">
                      {/* TAB INFO */}
                      {activeTab === "info" && (
                        <>
                          <section>
                            <h3 className="text-sm font-black text-[#123B5D] uppercase mb-4 flex items-center gap-2">
                              <DollarSign className="w-5 h-5 text-[#0f6d7c]" />{" "}
                              بيانات الشراء والضمان
                            </h3>
                            <div className="grid grid-cols-2 gap-4 bg-white p-6 rounded-[22px] border border-[#d8e6ee] shadow-sm">
                              <div className="border-b border-[#e7eef2] pb-3">
                                <div className="text-[10px] font-bold text-[#8aa0b4] uppercase mb-1">
                                  تاريخ الشراء
                                </div>
                                <div className="text-sm font-black text-[#123B5D]">
                                  {selectedDevice.purchaseDate || "—"}
                                </div>
                              </div>
                              <div className="border-b border-[#e7eef2] pb-3">
                                <div className="text-[10px] font-bold text-[#8aa0b4] uppercase mb-1">
                                  سعر الشراء
                                </div>
                                <div className="text-sm font-black text-[#123B5D]">
                                  {selectedDevice.purchasePrice
                                    ? `${selectedDevice.purchasePrice} ريال`
                                    : "—"}
                                </div>
                              </div>
                              <div className="border-b border-[#e7eef2] pb-3">
                                <div className="text-[10px] font-bold text-[#8aa0b4] uppercase mb-1">
                                  المورد
                                </div>
                                <div className="text-sm font-black text-[#123B5D]">
                                  {selectedDevice.vendor || "—"}
                                </div>
                              </div>
                              <div className="border-b border-[#e7eef2] pb-3">
                                <div className="text-[10px] font-bold text-[#8aa0b4] uppercase mb-1">
                                  نهاية الضمان
                                </div>
                                <div className="text-sm font-black text-[#123B5D] flex items-center gap-2">
                                  {selectedDevice.warrantyEnd || "—"}{" "}
                                  {selectedDevice.warrantyEnd && (
                                    <ShieldCheck
                                      className={cn(
                                        "w-4 h-4",
                                        new Date(selectedDevice.warrantyEnd) >
                                          new Date()
                                          ? "text-emerald-500"
                                          : "text-red-500",
                                      )}
                                    />
                                  )}
                                </div>
                              </div>
                              <div className="border-b border-[#e7eef2] pb-3 md:col-span-2">
                                <div className="text-[10px] font-bold text-[#8aa0b4] uppercase mb-1">
                                  القيمة الدفترية الحالية (بناءً على الإهلاك)
                                </div>
                                <div
                                  className={cn(
                                    "text-sm font-black font-mono",
                                    calculateCurrentValue(
                                      selectedDevice.purchasePrice,
                                      selectedDevice.purchaseDate,
                                      selectedDevice.depreciationRate,
                                    ) <= 0
                                      ? "text-red-500"
                                      : "text-[#0f6d7c]",
                                  )}
                                >
                                  {calculateCurrentValue(
                                    selectedDevice.purchasePrice,
                                    selectedDevice.purchaseDate,
                                    selectedDevice.depreciationRate,
                                  )}{" "}
                                  ريال
                                </div>
                              </div>
                            </div>
                          </section>

                          <section>
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="text-sm font-black text-[#123B5D] uppercase flex items-center gap-2">
                                <Activity className="w-5 h-5 text-[#0f6d7c]" />{" "}
                                الأجزاء المستهلكة
                              </h3>
                              <button
                                onClick={() => setIsAddConsumableOpen(true)}
                                className="text-xs font-bold text-[#0f6d7c] hover:bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200"
                              >
                                + جزء مستهلك
                              </button>
                            </div>
                            {selectedDevice.consumables?.length > 0 ? (
                              <div className="bg-white rounded-[22px] border border-[#d8e6ee] shadow-sm overflow-hidden">
                                <table className="w-full text-right">
                                  <thead className="bg-[#f7fbfd] border-b border-[#d8e6ee]">
                                    <tr>
                                      <th className="px-4 py-3 text-xs font-black text-[#71839a]">
                                        الجزء
                                      </th>
                                      <th className="px-4 py-3 text-xs font-black text-[#71839a]">
                                        الحالة
                                      </th>
                                      <th className="px-4 py-3 text-xs font-black text-[#71839a]">
                                        الصلاحية
                                      </th>
                                      <th className="px-4 py-3"></th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100">
                                    {selectedDevice.consumables.map(
                                      (item, idx) => (
                                        <tr
                                          key={idx}
                                          className="hover:bg-[#f7fbfd]"
                                        >
                                          <td className="px-4 py-3 text-sm font-bold text-[#123B5D]">
                                            {item.name}
                                          </td>
                                          <td className="px-4 py-3">
                                            <span
                                              className={cn(
                                                "px-2 py-1 rounded-md text-[10px] font-black border",
                                                item.status === "جيد"
                                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                  : "bg-amber-50 text-amber-700 border-amber-200",
                                              )}
                                            >
                                              {item.status}
                                            </span>
                                          </td>
                                          <td className="px-4 py-3 text-sm font-bold text-[#52677e]">
                                            {item.validity}
                                          </td>
                                          <td className="px-4 py-3 text-left">
                                            <button
                                              onClick={() => {
                                                const up =
                                                  selectedDevice.consumables.filter(
                                                    (_, i) => i !== idx,
                                                  );
                                                updateDeviceMutation.mutate({
                                                  ...selectedDevice,
                                                  consumables: up,
                                                });
                                              }}
                                              className="text-red-400 hover:text-red-600"
                                            >
                                              <Trash2 className="w-4 h-4" />
                                            </button>
                                          </td>
                                        </tr>
                                      ),
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            ) : (
                              <div className="text-center py-6 text-[#8aa0b4] font-bold text-xs bg-[#f7fbfd] rounded-xl border border-[#d8e6ee] border-dashed">
                                لا توجد أجزاء مستهلكة مسجلة
                              </div>
                            )}
                          </section>
                        </>
                      )}

                      {/* TAB NETWORK */}
                      {activeTab === "network" && (
                        <>
                          <section>
                            <h3 className="text-sm font-black text-[#123B5D] uppercase mb-4 flex items-center gap-2">
                              <Cpu className="w-5 h-5 text-[#0f6d7c]" />{" "}
                              المواصفات التقنية
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-white p-6 rounded-[22px] border border-[#d8e6ee] shadow-sm">
                              <div className="border-b border-[#e7eef2] pb-3">
                                <div className="text-[10px] font-bold text-[#8aa0b4] uppercase mb-1">
                                  المعالج (CPU)
                                </div>
                                <div className="text-sm font-black text-[#123B5D]">
                                  {selectedDevice.specs?.cpu || "—"}
                                </div>
                              </div>
                              <div className="border-b border-[#e7eef2] pb-3">
                                <div className="text-[10px] font-bold text-[#8aa0b4] uppercase mb-1">
                                  الذاكرة (RAM)
                                </div>
                                <div className="text-sm font-black text-[#123B5D]">
                                  {selectedDevice.specs?.ram || "—"}
                                </div>
                              </div>
                              <div className="border-b border-[#e7eef2] pb-3">
                                <div className="text-[10px] font-bold text-[#8aa0b4] uppercase mb-1">
                                  التخزين
                                </div>
                                <div className="text-sm font-black text-[#123B5D]">
                                  {selectedDevice.specs?.storage || "—"}
                                </div>
                              </div>
                              <div className="border-b border-[#e7eef2] pb-3">
                                <div className="text-[10px] font-bold text-[#8aa0b4] uppercase mb-1">
                                  كرت الشاشة (GPU)
                                </div>
                                <div className="text-sm font-black text-[#123B5D]">
                                  {selectedDevice.specs?.gpu || "—"}
                                </div>
                              </div>
                              <div className="border-b border-[#e7eef2] pb-3 md:col-span-2">
                                <div className="text-[10px] font-bold text-[#8aa0b4] uppercase mb-1">
                                  نظام التشغيل (OS)
                                </div>
                                <div className="text-sm font-black text-[#123B5D]">
                                  {selectedDevice.specs?.os || "—"}
                                </div>
                              </div>
                            </div>
                          </section>

                          <section>
                            <h3 className="text-sm font-black text-[#123B5D] uppercase mb-4 flex items-center gap-2">
                              <Network className="w-5 h-5 text-[#0f6d7c]" />{" "}
                              الشبكة
                            </h3>
                            <div className="grid grid-cols-2 gap-4 bg-white p-6 rounded-[22px] border border-[#d8e6ee] shadow-sm">
                              <div className="border-b border-[#e7eef2] pb-3">
                                <div className="text-[10px] font-bold text-[#8aa0b4] uppercase mb-1">
                                  IP الداخلي
                                </div>
                                <div className="text-sm font-black text-[#123B5D] font-mono">
                                  {selectedDevice.network?.internalIp || "—"}
                                </div>
                              </div>
                              <div className="border-b border-[#e7eef2] pb-3">
                                <div className="text-[10px] font-bold text-[#8aa0b4] uppercase mb-1">
                                  Static IP
                                </div>
                                <div className="text-sm font-black text-[#123B5D] font-mono">
                                  {selectedDevice.network?.staticIp || "—"}
                                </div>
                              </div>
                              <div className="border-b border-[#e7eef2] pb-3">
                                <div className="text-[10px] font-bold text-[#8aa0b4] uppercase mb-1">
                                  Tailscale IP
                                </div>
                                <div className="text-sm font-black text-[#123B5D] font-mono">
                                  {selectedDevice.network?.tailscaleIp || "—"}
                                </div>
                              </div>
                              <div className="border-b border-[#e7eef2] pb-3">
                                <div className="text-[10px] font-bold text-[#8aa0b4] uppercase mb-1">
                                  ZeroTier IP
                                </div>
                                <div className="text-sm font-black text-[#123B5D] font-mono">
                                  {selectedDevice.network?.zeroTierIp || "—"}
                                </div>
                              </div>
                              <div className="border-b border-[#e7eef2] pb-3 md:col-span-2">
                                <div className="text-[10px] font-bold text-[#8aa0b4] uppercase mb-1">
                                  عناوين MAC
                                </div>
                                <div className="space-y-1 mt-1">
                                  {selectedDevice.network?.macAddresses?.map(
                                    (mac, i) =>
                                      mac.trim() !== "" && (
                                        <div
                                          key={i}
                                          className="text-sm font-black text-[#123B5D] font-mono bg-[#f7fbfd] px-2 py-1 rounded inline-block ml-2"
                                        >
                                          {mac}
                                        </div>
                                      ),
                                  )}
                                  {(!selectedDevice.network?.macAddresses ||
                                    selectedDevice.network.macAddresses.filter(
                                      (m) => m.trim() !== "",
                                    ).length === 0) && (
                                    <div className="text-sm text-[#8aa0b4]">
                                      —
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </section>
                        </>
                      )}

                      {/* TAB MAINTENANCE */}
                      {activeTab === "maintenance" && (
                        <section>
                          <div className="flex items-center justify-between mb-6">
                            <h3 className="text-sm font-black text-[#123B5D] uppercase flex items-center gap-2">
                              <Wrench className="w-5 h-5 text-[#0f6d7c]" />{" "}
                              سجل الصيانة
                            </h3>
                            <button
                              onClick={() => setIsAddMaintenanceOpen(true)}
                              className="text-xs font-bold text-[#0f6d7c] bg-emerald-50 px-3 py-1.5 rounded-lg"
                            >
                              + إضافة سجل
                            </button>
                          </div>
                          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-slate-200">
                            {selectedDevice.maintenanceHistory?.length > 0 ? (
                              selectedDevice.maintenanceHistory.map(
                                (record, idx) => (
                                  <div
                                    key={idx}
                                    className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group"
                                  >
                                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-[#eef5f7] text-[#71839a] shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                                      <Wrench className="w-4 h-4" />
                                    </div>
                                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-[22px] border border-[#d8e6ee] bg-white shadow-sm">
                                      {editingMaintenance?.index === idx ? (
                                        <div className="space-y-2">
                                          <input
                                            type="date"
                                            className="w-full px-2 py-1 border rounded text-sm"
                                            value={editingMaintenance.date}
                                            onChange={(e) =>
                                              setEditingMaintenance({
                                                ...editingMaintenance,
                                                date: e.target.value,
                                              })
                                            }
                                          />
                                          <input
                                            type="text"
                                            className="w-full px-2 py-1 border rounded text-sm"
                                            value={editingMaintenance.type}
                                            onChange={(e) =>
                                              setEditingMaintenance({
                                                ...editingMaintenance,
                                                type: e.target.value,
                                              })
                                            }
                                          />
                                          <input
                                            type="text"
                                            className="w-full px-2 py-1 border rounded text-sm"
                                            value={
                                              editingMaintenance.description
                                            }
                                            onChange={(e) =>
                                              setEditingMaintenance({
                                                ...editingMaintenance,
                                                description: e.target.value,
                                              })
                                            }
                                          />
                                          <input
                                            type="text"
                                            className="w-full px-2 py-1 border rounded text-sm"
                                            value={
                                              editingMaintenance.technician
                                            }
                                            onChange={(e) =>
                                              setEditingMaintenance({
                                                ...editingMaintenance,
                                                technician: e.target.value,
                                              })
                                            }
                                          />
                                          <div className="flex justify-end gap-2 mt-2">
                                            <button
                                              onClick={() =>
                                                handleSaveMaintenance(idx)
                                              }
                                              className="text-[#0f6d7c] bg-emerald-50 px-3 py-1 rounded text-xs font-bold"
                                            >
                                              حفظ
                                            </button>
                                            <button
                                              onClick={() =>
                                                setEditingMaintenance(null)
                                              }
                                              className="text-[#71839a] bg-[#eef5f7] px-3 py-1 rounded text-xs font-bold"
                                            >
                                              إلغاء
                                            </button>
                                          </div>
                                        </div>
                                      ) : (
                                        <>
                                          <div className="flex justify-between mb-1">
                                            <div className="font-black text-sm">
                                              {record.type}
                                            </div>
                                            <div className="text-[10px] text-[#71839a] bg-[#eef5f7] px-2 py-0.5 rounded">
                                              {record.date}
                                            </div>
                                          </div>
                                          <div className="text-sm font-bold text-[#52677e] mb-3">
                                            {record.description}
                                          </div>
                                          <div className="flex justify-between border-t border-[#e7eef2] pt-2">
                                            <div className="text-xs font-bold text-[#71839a]">
                                              الفني: {record.technician}
                                            </div>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                              <button
                                                onClick={() =>
                                                  setEditingMaintenance({
                                                    index: idx,
                                                    ...record,
                                                  })
                                                }
                                                className="p-1.5 text-blue-500 hover:bg-[#fbf7ef] rounded"
                                              >
                                                <Edit className="w-3.5 h-3.5" />
                                              </button>
                                              <button
                                                onClick={() =>
                                                  handleDeleteMaintenance(idx)
                                                }
                                                className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                                              >
                                                <Trash2 className="w-3.5 h-3.5" />
                                              </button>
                                            </div>
                                          </div>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                ),
                              )
                            ) : (
                              <div className="text-center py-10 text-[#8aa0b4] font-bold border-2 border-dashed border-[#d8e6ee] rounded-[22px]">
                                لا توجد سجلات صيانة.
                              </div>
                            )}
                          </div>
                        </section>
                      )}
                    </div>

                    {/* Right Sidebar */}
                    <div className="space-y-6">
                      <div className="bg-white rounded-[22px] border border-[#d8e6ee] shadow-sm p-6 space-y-4">
                        <h3 className="text-sm font-black text-[#123B5D] uppercase mb-2 flex items-center gap-2">
                          <FileText className="w-5 h-5 text-[#8aa0b4]" /> ملخص
                          الجهاز
                        </h3>
                        <div className="flex justify-between items-center pb-3 border-b border-[#e7eef2]">
                          <span className="text-xs font-bold text-[#71839a]">
                            الرقم التسلسلي
                          </span>
                          <span className="text-xs font-black text-[#123B5D] font-mono bg-[#eef5f7] px-2 py-1 rounded">
                            {selectedDevice.serialNumber}
                          </span>
                        </div>
                        <div className="flex justify-between items-center pb-3 border-b border-[#e7eef2]">
                          <span className="text-xs font-bold text-[#71839a]">
                            الموقع
                          </span>
                          <span className="text-xs font-black text-[#123B5D]">
                            {selectedDevice.location || "—"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center pb-3 border-b border-[#e7eef2]">
                          <span className="text-xs font-bold text-[#71839a]">
                            العهدة
                          </span>
                          <span className="text-xs font-black text-[#123B5D]">
                            {selectedDevice.assignedTo || "—"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center pb-3 border-b border-[#e7eef2]">
                          <span className="text-xs font-bold text-[#71839a]">
                            النظام المرتبط
                          </span>
                          <span
                            onClick={() => setIsLinkSystemModalOpen(true)}
                            className="text-xs font-black text-[#0f6d7c] bg-blue-50 px-2 py-1 rounded cursor-pointer hover:bg-blue-100"
                          >
                            {selectedDevice.linkedSystem || "ربط..."}
                          </span>
                        </div>
                        <div className="flex justify-between items-center pt-2">
                          <span className="text-xs font-bold text-[#71839a]">
                            موعد الصيانة
                          </span>
                          <span className="text-sm font-black text-amber-600 bg-amber-50 px-2 py-1 rounded">
                            {selectedDevice.nextMaintenanceDate || "—"}
                          </span>
                        </div>
                      </div>

                      <div className="bg-white rounded-[22px] border border-[#d8e6ee] shadow-sm p-6 space-y-4">
                        <h3 className="text-sm font-black text-[#123B5D] uppercase mb-2 flex items-center gap-2">
                          <FileText className="w-5 h-5 text-[#8aa0b4]" />{" "}
                          المرفقات والمستندات
                        </h3>
                        <div className="space-y-2">
                          {selectedDevice.invoiceAttachment && (
                            <div className="flex items-center justify-between p-3 bg-[#f7fbfd] border border-[#e7eef2] rounded-xl hover:border-emerald-200 transition-colors group">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-white rounded-lg shadow-sm text-[#0f6d7c]">
                                  <FileText className="w-4 h-4" />
                                </div>
                                <div>
                                  <div className="text-xs font-black text-[#123B5D]">
                                    مرفق الفاتورة/الضمان
                                  </div>
                                  <div
                                    className="text-[10px] font-bold text-[#8aa0b4] truncate max-w-[120px]"
                                    dir="ltr"
                                  >
                                    {selectedDevice.invoiceAttachment
                                      .split("/")
                                      .pop()}
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <a
                                  href={getFullUrl(
                                    selectedDevice.invoiceAttachment,
                                  )}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-2 text-[#8aa0b4] hover:text-[#0f6d7c]"
                                >
                                  <Download className="w-4 h-4" />
                                </a>
                                <button
                                  onClick={() =>
                                    updateDeviceMutation.mutate({
                                      ...selectedDevice,
                                      invoiceAttachment: null,
                                    })
                                  }
                                  className="p-2 text-[#8aa0b4] hover:text-red-600"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          )}
                          {selectedDevice.attachments?.map((file, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between p-3 bg-[#f7fbfd] border border-[#e7eef2] rounded-xl hover:border-emerald-200 transition-colors group"
                            >
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-white rounded-lg shadow-sm text-purple-600">
                                  <ImageIcon className="w-4 h-4" />
                                </div>
                                <div>
                                  <div className="text-xs font-black text-[#123B5D]">
                                    {file.name}
                                  </div>
                                  <div
                                    className="text-[10px] font-bold text-[#8aa0b4] truncate max-w-[120px]"
                                    dir="ltr"
                                  >
                                    {file.url.split("/").pop()}
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <a
                                  href={getFullUrl(file.url)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-2 text-[#8aa0b4] hover:text-[#0f6d7c]"
                                >
                                  <Download className="w-4 h-4" />
                                </a>
                                <button
                                  onClick={() => {
                                    const upAtt =
                                      selectedDevice.attachments.filter(
                                        (_, i) => i !== idx,
                                      );
                                    updateDeviceMutation.mutate({
                                      ...selectedDevice,
                                      attachments: upAtt,
                                    });
                                  }}
                                  className="p-2 text-[#8aa0b4] hover:text-red-600"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                          {!selectedDevice.invoiceAttachment &&
                            (!selectedDevice.attachments ||
                              selectedDevice.attachments.length === 0) && (
                              <div className="text-xs text-[#8aa0b4] font-bold text-center py-3 border border-dashed rounded-xl bg-[#f7fbfd]">
                                لا توجد مرفقات
                              </div>
                            )}
                          <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            onChange={handleFileChange}
                            accept=".pdf,.jpg,.jpeg,.png"
                          />
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploadAttachmentMutation.isPending}
                            className="w-full py-2.5 border-2 border-dashed border-[#d8e6ee] text-[#71839a] rounded-xl font-bold hover:border-emerald-400 hover:text-[#0f6d7c] hover:bg-emerald-50 text-sm flex justify-center gap-2 mt-2 disabled:opacity-50"
                          >
                            {uploadAttachmentMutation.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <UploadCloud className="w-4 h-4" />
                            )}{" "}
                            إضافة مرفق جديد
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
      </AnimatePresence>

      {/* ========================================== */}
      {/* 🚀 Modal: إضافة / تعديل جهاز (Form Modal) */}
      {/* ========================================== */}
      <AnimatePresence>
        {isDeviceModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setIsDeviceModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-[26px] shadow-2xl overflow-hidden flex flex-col z-10"
            >
              <div className="px-8 py-6 border-b border-[#e7eef2] flex justify-between items-center bg-[#f7fbfd] shrink-0">
                <h2 className="text-2xl font-black text-[#123B5D] flex items-center gap-2">
                  {deviceModalMode === "add" ? (
                    <>
                      <Plus className="w-6 h-6 text-[#0f6d7c]" /> إضافة أصل
                      جديد
                    </>
                  ) : (
                    <>
                      <Edit className="w-6 h-6 text-[#0f6d7c]" /> تعديل بيانات
                      الأصل
                    </>
                  )}
                </h2>
                <button
                  onClick={() => setIsDeviceModalOpen(false)}
                  className="p-2 text-[#8aa0b4] hover:bg-slate-200 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-[#f7fbfd]/50">
                <form
                  id="device-form"
                  onSubmit={handleDeviceSubmit}
                  className="space-y-8"
                >
                  {/* Basic Info */}
                  <section className="bg-white p-6 rounded-[22px] border border-[#d8e6ee] shadow-sm">
                    <h3 className="text-[13px] font-black text-[#123B5D] tracking-tight mb-4 flex items-center gap-2">
                      <Info className="w-5 h-5 text-[#0f6d7c]" /> المعلومات
                      الأساسية
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-bold text-[#71839a] mb-1.5">
                          اسم الجهاز *
                        </label>
                        <input
                          type="text"
                          required
                          value={deviceForm.name}
                          onChange={(e) =>
                            setDeviceForm({
                              ...deviceForm,
                              name: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2.5 bg-[#f7fbfd] border border-[#d8e6ee] rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#71839a] mb-1.5">
                          التصنيف *
                        </label>
                        <select
                          value={deviceForm.type}
                          onChange={(e) =>
                            setDeviceForm({
                              ...deviceForm,
                              type: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2.5 bg-[#f7fbfd] border border-[#d8e6ee] rounded-xl text-sm font-bold focus:outline-none focus:border-emerald-500"
                        >
                          {allCategories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#71839a] mb-1.5">
                          العلامة التجارية *
                        </label>
                        <input
                          type="text"
                          required
                          value={deviceForm.brand}
                          onChange={(e) =>
                            setDeviceForm({
                              ...deviceForm,
                              brand: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2.5 bg-[#f7fbfd] border border-[#d8e6ee] rounded-xl text-sm font-bold focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#71839a] mb-1.5">
                          الموديل *
                        </label>
                        <input
                          type="text"
                          required
                          value={deviceForm.model}
                          onChange={(e) =>
                            setDeviceForm({
                              ...deviceForm,
                              model: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2.5 bg-[#f7fbfd] border border-[#d8e6ee] rounded-xl text-sm font-bold focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#71839a] mb-1.5">
                          الرقم التسلسلي *
                        </label>
                        <input
                          type="text"
                          required
                          value={deviceForm.serialNumber}
                          onChange={(e) =>
                            setDeviceForm({
                              ...deviceForm,
                              serialNumber: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2.5 bg-[#f7fbfd] border border-[#d8e6ee] rounded-xl text-sm font-bold focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#71839a] mb-1.5">
                          العهدة (مخصص لـ)
                        </label>
                        <select
                          value={deviceForm.assignedTo}
                          onChange={(e) =>
                            setDeviceForm({
                              ...deviceForm,
                              assignedTo: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2.5 bg-[#f7fbfd] border border-[#d8e6ee] rounded-xl text-sm font-bold focus:outline-none focus:border-emerald-500 cursor-pointer"
                        >
                          <option value="">-- غير مخصص (جهاز عام) --</option>
                          {staffOnly.map((emp) => (
                            <option key={emp.id} value={emp.name}>
                              {emp.name} ({emp.role})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#71839a] mb-1.5">
                          الموقع الفعلي
                        </label>
                        <input
                          type="text"
                          value={deviceForm.location}
                          onChange={(e) =>
                            setDeviceForm({
                              ...deviceForm,
                              location: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2.5 bg-[#f7fbfd] border border-[#d8e6ee] rounded-xl text-sm font-bold focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#71839a] mb-1.5">
                          الحالة
                        </label>
                        <select
                          value={deviceForm.status}
                          onChange={(e) =>
                            setDeviceForm({
                              ...deviceForm,
                              status: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2.5 bg-[#f7fbfd] border border-[#d8e6ee] rounded-xl text-sm font-bold focus:outline-none focus:border-emerald-500"
                        >
                          <option value="Active">نشط</option>
                          <option value="Warning">تحذير</option>
                          <option value="Offline">غير متصل</option>
                        </select>
                      </div>
                    </div>
                  </section>

                  {/* 🚀 الإهلاك المالي (Financials & Depreciation) */}
                  <section className="bg-white p-6 rounded-[22px] border border-[#d8e6ee] shadow-sm">
                    <h3 className="text-[13px] font-black text-[#123B5D] tracking-tight mb-4 flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-[#0f6d7c]" /> بيانات
                      الشراء والإهلاك
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-bold text-[#71839a] mb-1.5">
                          سعر الشراء (ريال)
                        </label>
                        <input
                          type="number"
                          value={deviceForm.purchasePrice}
                          onChange={(e) =>
                            setDeviceForm({
                              ...deviceForm,
                              purchasePrice: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2.5 bg-[#f7fbfd] border border-[#d8e6ee] rounded-xl text-sm font-bold focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#71839a] mb-1.5">
                          تاريخ الشراء
                        </label>
                        <input
                          type="date"
                          value={deviceForm.purchaseDate}
                          onChange={(e) =>
                            setDeviceForm({
                              ...deviceForm,
                              purchaseDate: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2.5 bg-[#f7fbfd] border border-[#d8e6ee] rounded-xl text-sm font-bold focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#71839a] mb-1.5">
                          معدل الإهلاك السنوي (%)
                        </label>
                        <select
                          value={deviceForm.depreciationRate}
                          onChange={(e) =>
                            setDeviceForm({
                              ...deviceForm,
                              depreciationRate: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2.5 bg-[#f7fbfd] border border-[#d8e6ee] rounded-xl text-sm font-bold focus:outline-none focus:border-emerald-500 cursor-pointer"
                        >
                          <option value="">بدون إهلاك</option>
                          <option value="20">
                            20% سنوياً (ينتهي بعد 5 سنوات)
                          </option>
                          <option value="25">
                            25% سنوياً (ينتهي بعد 4 سنوات)
                          </option>
                          <option value="33.33">
                            33.3% سنوياً (ينتهي بعد 3 سنوات)
                          </option>
                          <option value="50">
                            50% سنوياً (ينتهي بعد سنتين)
                          </option>
                        </select>
                      </div>
                      <div className="flex flex-col justify-end">
                        {deviceForm.purchasePrice &&
                        deviceForm.purchaseDate &&
                        deviceForm.depreciationRate ? (
                          <div className="bg-[#eef5f7] p-3 rounded-xl border border-[#d8e6ee] flex justify-between items-center">
                            <span className="text-xs font-bold text-[#52677e]">
                              القيمة الدفترية الحالية:
                            </span>
                            <span
                              className={cn(
                                "font-mono font-black",
                                calculateCurrentValue(
                                  deviceForm.purchasePrice,
                                  deviceForm.purchaseDate,
                                  deviceForm.depreciationRate,
                                ) <= 0
                                  ? "text-red-500"
                                  : "text-[#0f6d7c]",
                              )}
                            >
                              {calculateCurrentValue(
                                deviceForm.purchasePrice,
                                deviceForm.purchaseDate,
                                deviceForm.depreciationRate,
                              )}{" "}
                              ريال
                            </span>
                          </div>
                        ) : (
                          <div className="text-xs text-[#8aa0b4] font-bold p-3">
                            أكمل البيانات لحساب القيمة الحالية
                          </div>
                        )}
                      </div>
                    </div>
                  </section>

                  {/* 🚀 المواصفات + الذكاء الاصطناعي */}
                  {(deviceForm.type === "Computer" ||
                    deviceForm.type === "Server") && (
                    <section className="bg-white p-6 rounded-[22px] border border-[#d8e6ee] shadow-sm relative overflow-hidden">
                      <div className="flex items-center justify-between mb-4 relative z-10">
                        <h3 className="text-[13px] font-black text-[#123B5D] tracking-tight flex items-center gap-2">
                          <Cpu className="w-5 h-5 text-[#0f6d7c]" /> المواصفات
                          التقنية
                        </h3>
                        <input
                          type="file"
                          ref={aiImageInputRef}
                          className="hidden"
                          accept="image/*"
                          onChange={handleAIImageUpload}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (deviceModalMode === "add") {
                              toast.info(
                                "يرجى حفظ الجهاز أولاً لتتمكن من استخدام التحليل في الخلفية.",
                              );
                            } else {
                              aiImageInputRef.current?.click();
                            }
                          }}
                          disabled={isAIExtracting}
                          className={cn(
                            "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border shadow-sm",
                            deviceModalMode === "add"
                              ? "bg-[#f7fbfd] text-[#8aa0b4] border-[#d8e6ee] cursor-not-allowed"
                              : "bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 hover:from-purple-200 hover:to-blue-200 border-purple-200 disabled:opacity-50",
                          )}
                          title={
                            deviceModalMode === "add"
                              ? "احفظ الجهاز أولاً لتفعيل هذه الخاصية"
                              : "رفع الصورة وتحليلها في الخلفية"
                          }
                        >
                          {isAIExtracting ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Wand2 className="w-3.5 h-3.5" />
                          )}
                          استخراج بالذكاء الاصطناعي (بالخلفية) 🪄
                        </button>
                      </div>

                      {deviceModalMode === "add" && (
                        <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-2 text-blue-700 text-xs font-bold">
                          <Info className="w-4 h-4 shrink-0 mt-0.5" />
                          <span>
                            لتحليل مواصفات الجهاز تلقائياً عبر الذكاء الاصطناعي،
                            يرجى ملء البيانات الأساسية وحفظ الجهاز أولاً، ثم قم
                            بفتح التعديل ورفع الصورة ليتم تحليلها في الخلفية دون
                            تعطيل عملك.
                          </span>
                        </div>
                      )}

                      {/* شاشة التحميل اللحظية (Feedback) عند رفع الصورة */}
                      {isAIExtracting && (
                        <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-20 flex flex-col items-center justify-center rounded-[22px]">
                          <BrainCircuit className="w-10 h-10 text-purple-500 animate-pulse mb-3" />
                          <div className="text-sm font-black text-purple-800 mb-1">
                            جاري إرسال الصورة للطابور المركزي...
                          </div>
                          <div className="text-xs font-bold text-[#71839a] text-center px-6">
                            العملية ستستمر في الخلفية.
                            <br />
                            يمكنك إغلاق النافذة وسنرسل لك إشعاراً فور انتهاء
                            التحديث.
                          </div>
                        </div>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 relative z-10">
                        <div>
                          <label className="block text-xs font-bold text-[#71839a] mb-1.5">
                            المعالج (CPU)
                          </label>
                          <input
                            type="text"
                            value={deviceForm.specs?.cpu || ""}
                            onChange={(e) =>
                              setDeviceForm({
                                ...deviceForm,
                                specs: {
                                  ...deviceForm.specs,
                                  cpu: e.target.value,
                                },
                              })
                            }
                            className="w-full px-4 py-2.5 bg-[#f7fbfd] border border-[#d8e6ee] rounded-xl text-sm font-bold focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-[#71839a] mb-1.5">
                            الذاكرة (RAM)
                          </label>
                          <input
                            type="text"
                            value={deviceForm.specs?.ram || ""}
                            onChange={(e) =>
                              setDeviceForm({
                                ...deviceForm,
                                specs: {
                                  ...deviceForm.specs,
                                  ram: e.target.value,
                                },
                              })
                            }
                            className="w-full px-4 py-2.5 bg-[#f7fbfd] border border-[#d8e6ee] rounded-xl text-sm font-bold focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-[#71839a] mb-1.5">
                            التخزين (Storage)
                          </label>
                          <input
                            type="text"
                            value={deviceForm.specs?.storage || ""}
                            onChange={(e) =>
                              setDeviceForm({
                                ...deviceForm,
                                specs: {
                                  ...deviceForm.specs,
                                  storage: e.target.value,
                                },
                              })
                            }
                            className="w-full px-4 py-2.5 bg-[#f7fbfd] border border-[#d8e6ee] rounded-xl text-sm font-bold focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-[#71839a] mb-1.5">
                            كرت الشاشة (GPU)
                          </label>
                          <input
                            type="text"
                            value={deviceForm.specs?.gpu || ""}
                            onChange={(e) =>
                              setDeviceForm({
                                ...deviceForm,
                                specs: {
                                  ...deviceForm.specs,
                                  gpu: e.target.value,
                                },
                              })
                            }
                            className="w-full px-4 py-2.5 bg-[#f7fbfd] border border-[#d8e6ee] rounded-xl text-sm font-bold focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-xs font-bold text-[#71839a] mb-1.5">
                            نظام التشغيل (OS)
                          </label>
                          <input
                            type="text"
                            value={deviceForm.specs?.os || ""}
                            onChange={(e) =>
                              setDeviceForm({
                                ...deviceForm,
                                specs: {
                                  ...deviceForm.specs,
                                  os: e.target.value,
                                },
                              })
                            }
                            className="w-full px-4 py-2.5 bg-[#f7fbfd] border border-[#d8e6ee] rounded-xl text-sm font-bold focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                      </div>
                    </section>
                  )}

                  {/* Network Section in Form */}
                  <section className="bg-white p-6 rounded-[22px] border border-[#d8e6ee] shadow-sm">
                    <h3 className="text-[13px] font-black text-[#123B5D] tracking-tight mb-4 flex items-center gap-2">
                      <Network className="w-5 h-5 text-[#0f6d7c]" /> إعدادات
                      الشبكة
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-bold text-[#71839a] mb-1.5">
                          IP الداخلي
                        </label>
                        <input
                          type="text"
                          value={deviceForm.network?.internalIp || ""}
                          onChange={(e) =>
                            setDeviceForm({
                              ...deviceForm,
                              network: {
                                ...deviceForm.network,
                                internalIp: e.target.value,
                              },
                            })
                          }
                          className="w-full px-4 py-2.5 bg-[#f7fbfd] border border-[#d8e6ee] rounded-xl text-sm font-bold font-mono focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#71839a] mb-1.5">
                          IP ثابت (Static IP)
                        </label>
                        <input
                          type="text"
                          value={deviceForm.network?.staticIp || ""}
                          onChange={(e) =>
                            setDeviceForm({
                              ...deviceForm,
                              network: {
                                ...deviceForm.network,
                                staticIp: e.target.value,
                              },
                            })
                          }
                          className="w-full px-4 py-2.5 bg-[#f7fbfd] border border-[#d8e6ee] rounded-xl text-sm font-bold font-mono focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#71839a] mb-1.5">
                          Tailscale IP
                        </label>
                        <input
                          type="text"
                          value={deviceForm.network?.tailscaleIp || ""}
                          onChange={(e) =>
                            setDeviceForm({
                              ...deviceForm,
                              network: {
                                ...deviceForm.network,
                                tailscaleIp: e.target.value,
                              },
                            })
                          }
                          className="w-full px-4 py-2.5 bg-[#f7fbfd] border border-[#d8e6ee] rounded-xl text-sm font-bold font-mono focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#71839a] mb-1.5">
                          ZeroTier IP
                        </label>
                        <input
                          type="text"
                          value={deviceForm.network?.zeroTierIp || ""}
                          onChange={(e) =>
                            setDeviceForm({
                              ...deviceForm,
                              network: {
                                ...deviceForm.network,
                                zeroTierIp: e.target.value,
                              },
                            })
                          }
                          className="w-full px-4 py-2.5 bg-[#f7fbfd] border border-[#d8e6ee] rounded-xl text-sm font-bold font-mono focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-[#71839a] mb-1.5">
                          عناوين MAC Address
                        </label>
                        <div className="space-y-2">
                          {(deviceForm.network?.macAddresses || [""]).map(
                            (mac, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-2"
                              >
                                <input
                                  type="text"
                                  value={mac}
                                  onChange={(e) => {
                                    const newMacs = [
                                      ...(deviceForm.network.macAddresses ||
                                        []),
                                    ];
                                    newMacs[index] = e.target.value;
                                    setDeviceForm({
                                      ...deviceForm,
                                      network: {
                                        ...deviceForm.network,
                                        macAddresses: newMacs,
                                      },
                                    });
                                  }}
                                  className="w-full px-4 py-2.5 bg-[#f7fbfd] border border-[#d8e6ee] rounded-xl text-sm font-bold font-mono focus:outline-none focus:border-emerald-500"
                                  placeholder="00:1A:2B:3C:4D:5E"
                                  dir="ltr"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newMacs =
                                      deviceForm.network.macAddresses.filter(
                                        (_, i) => i !== index,
                                      );
                                    setDeviceForm({
                                      ...deviceForm,
                                      network: {
                                        ...deviceForm.network,
                                        macAddresses: newMacs.length
                                          ? newMacs
                                          : [""],
                                      },
                                    });
                                  }}
                                  className="p-2.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                              </div>
                            ),
                          )}
                          <button
                            type="button"
                            onClick={() =>
                              setDeviceForm({
                                ...deviceForm,
                                network: {
                                  ...deviceForm.network,
                                  macAddresses: [
                                    ...(deviceForm.network.macAddresses || []),
                                    "",
                                  ],
                                },
                              })
                            }
                            className="text-xs font-bold text-[#0f6d7c] bg-emerald-50 px-3 py-1.5 rounded-lg hover:bg-emerald-100 w-fit"
                          >
                            + إضافة MAC إضافي
                          </button>
                        </div>
                      </div>
                    </div>
                  </section>
                </form>
              </div>

              <div className="px-8 py-5 border-t border-[#e7eef2] bg-[#f7fbfd] flex justify-end gap-3 shrink-0">
                <button
                  onClick={() => setIsDeviceModalOpen(false)}
                  className="px-6 py-2.5 text-[#52677e] font-bold hover:bg-slate-200 rounded-xl transition-colors"
                >
                  إلغاء
                </button>
                <button
                  disabled={
                    addDeviceMutation.isPending ||
                    updateDeviceMutation.isPending
                  }
                  type="submit"
                  form="device-form"
                  className="px-6 py-2.5 bg-[#083646] text-white rounded-xl font-black hover:bg-emerald-500 transition-all flex items-center gap-2 shadow-md disabled:opacity-50"
                >
                  {addDeviceMutation.isPending ||
                  updateDeviceMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {deviceModalMode === "add"
                    ? "حفظ وإضافة الأصل"
                    : "تحديث البيانات"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 🚀 Sub-Modals */}
      <AnimatePresence>
        {isAddMaintenanceOpen && selectedDevice && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setIsAddMaintenanceOpen(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white rounded-[22px] w-full max-w-md p-6 shadow-2xl z-10"
            >
              <h3 className="text-lg font-black mb-4">تسجيل صيانة جديدة</h3>
              <form onSubmit={handleAddMaintenanceSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-[#52677e] mb-1 block">
                      التاريخ
                    </label>
                    <input
                      required
                      type="date"
                      className="w-full border p-2.5 rounded-lg"
                      value={newMaintenance.date}
                      onChange={(e) =>
                        setNewMaintenance({
                          ...newMaintenance,
                          date: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#52677e] mb-1 block">
                      النوع
                    </label>
                    <input
                      required
                      type="text"
                      className="w-full border p-2.5 rounded-lg"
                      placeholder="وقائية, دورية..."
                      value={newMaintenance.type}
                      onChange={(e) =>
                        setNewMaintenance({
                          ...newMaintenance,
                          type: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-[#52677e] mb-1 block">
                    اسم الفني
                  </label>
                  <input
                    required
                    type="text"
                    className="w-full border p-2.5 rounded-lg"
                    value={newMaintenance.technician}
                    onChange={(e) =>
                      setNewMaintenance({
                        ...newMaintenance,
                        technician: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#52677e] mb-1 block">
                    الوصف والتفاصيل
                  </label>
                  <textarea
                    required
                    className="w-full border p-2.5 rounded-lg h-24 resize-none"
                    value={newMaintenance.description}
                    onChange={(e) =>
                      setNewMaintenance({
                        ...newMaintenance,
                        description: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="flex justify-end gap-2 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsAddMaintenanceOpen(false)}
                    className="px-4 py-2 bg-[#eef5f7] rounded-lg text-sm font-bold"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#083646] text-white rounded-lg text-sm font-bold"
                  >
                    حفظ السجل
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isAddConsumableOpen && selectedDevice && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setIsAddConsumableOpen(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white rounded-[22px] w-full max-w-sm p-6 shadow-2xl z-10"
            >
              <h3 className="text-lg font-black mb-4">إضافة جزء مستهلك</h3>
              <form onSubmit={handleAddConsumableSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-[#52677e] mb-1 block">
                    الاسم
                  </label>
                  <input
                    required
                    type="text"
                    className="w-full border p-2.5 rounded-lg"
                    value={newConsumable.name}
                    onChange={(e) =>
                      setNewConsumable({
                        ...newConsumable,
                        name: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#52677e] mb-1 block">
                    الحالة
                  </label>
                  <select
                    className="w-full border p-2.5 rounded-lg"
                    value={newConsumable.status}
                    onChange={(e) =>
                      setNewConsumable({
                        ...newConsumable,
                        status: e.target.value,
                      })
                    }
                  >
                    <option>جيد</option>
                    <option>منخفض</option>
                    <option>حرج</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-[#52677e] mb-1 block">
                    الصلاحية (%)
                  </label>
                  <input
                    required
                    type="text"
                    className="w-full border p-2.5 rounded-lg"
                    value={newConsumable.validity}
                    onChange={(e) =>
                      setNewConsumable({
                        ...newConsumable,
                        validity: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="flex justify-end gap-2 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsAddConsumableOpen(false)}
                    className="px-4 py-2 bg-[#eef5f7] rounded-lg text-sm font-bold"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#083646] text-white rounded-lg text-sm font-bold"
                  >
                    إضافة
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isStickerModalOpen && selectedDevice && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
              onClick={() => setIsStickerModalOpen(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-white rounded-[26px] shadow-2xl overflow-hidden flex flex-col z-10"
            >
              <div className="px-6 py-4 border-b border-[#e7eef2] flex justify-between items-center bg-[#f7fbfd]">
                <h2 className="text-lg font-black flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-[#0f6d7c]" /> معاينة ملصق
                  الجهاز
                </h2>
                <button
                  onClick={() => setIsStickerModalOpen(false)}
                  className="p-2 text-[#8aa0b4] hover:bg-slate-200 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-8 flex justify-center bg-[#eef5f7]/50">
                <div className="w-80 bg-white border-2 border-slate-800 rounded-xl p-4 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-2 bg-[#083646]" />
                  <div className="flex justify-between items-start mb-4 mt-1">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white font-black text-xs shadow-sm">
                        DC
                      </div>
                      <div>
                        <div className="text-[10px] font-black text-[#71839a] uppercase tracking-widest">
                          ديتيلز كونسولتس
                        </div>
                        <div className="text-sm font-black text-[#123B5D]">
                          {selectedDevice.name}
                        </div>
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-[#f7fbfd] rounded-lg flex items-center justify-center border border-[#d8e6ee] shadow-sm">
                      <QrCode className="w-8 h-8 opacity-50" />
                    </div>
                  </div>
                  <div className="space-y-1.5 mb-4">
                    <div className="flex justify-between border-b border-[#e7eef2] pb-1">
                      <span className="text-[10px] font-bold text-[#71839a]">
                        كود الجهاز
                      </span>
                      <span className="text-[10px] font-black text-[#123B5D] font-mono">
                        {selectedDevice.deviceCode}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-[#e7eef2] pb-1">
                      <span className="text-[10px] font-bold text-[#71839a]">
                        الرقم التسلسلي
                      </span>
                      <span className="text-[10px] font-black text-[#123B5D] font-mono">
                        {selectedDevice.serialNumber}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-[#e7eef2] pb-1">
                      <span className="text-[10px] font-bold text-[#71839a]">
                        الموديل
                      </span>
                      <span className="text-[10px] font-black text-[#123B5D]">
                        {selectedDevice.brand} {selectedDevice.model}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-[#e7eef2] pb-1">
                      <span className="text-[10px] font-bold text-[#71839a]">
                        العهدة
                      </span>
                      <span className="text-[10px] font-black text-[#123B5D]">
                        {selectedDevice.assignedTo || "—"}
                      </span>
                    </div>
                  </div>
                  <div className="text-center bg-[#f7fbfd] p-1.5 rounded-lg border border-[#e7eef2]">
                    <div className="text-[9px] font-black text-[#123B5D]">
                      هذا الجهاز ملك شركة ديتيلز كونسولتس
                    </div>
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-[#e7eef2] bg-[#f7fbfd] flex justify-end gap-3">
                <button
                  onClick={() => setIsStickerModalOpen(false)}
                  className="px-6 py-2.5 text-[#52677e] font-bold hover:bg-slate-200 rounded-xl transition-colors"
                >
                  إلغاء
                </button>
                <button
                  onClick={handlePrintSticker}
                  className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-black hover:bg-slate-800 transition-all flex items-center gap-2 shadow-md active:scale-95"
                >
                  <Printer className="w-4 h-4" /> تأكيد الطباعة
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isLinkSystemModalOpen && selectedDevice && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setIsLinkSystemModalOpen(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white rounded-[22px] w-full max-w-sm overflow-hidden shadow-2xl z-10"
            >
              <div className="px-6 py-4 border-b border-[#e7eef2] bg-[#f7fbfd] flex justify-between items-center">
                <h2 className="text-lg font-black flex items-center gap-2">
                  <Server className="w-5 h-5 text-[#0f6d7c]" /> ربط بنظام
                </h2>
                <button
                  onClick={() => setIsLinkSystemModalOpen(false)}
                  className="text-[#8aa0b4] hover:text-[#52677e]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-2 max-h-60 overflow-y-auto">
                {[
                  "Active Directory",
                  "نظام ERP",
                  "نظام الموارد البشرية",
                  "نظام المراقبة (CCTV)",
                  "الخادم الرئيسي (Synology)",
                ].map((sys) => (
                  <button
                    key={sys}
                    onClick={() => handleLinkSystemSubmit(sys)}
                    className="w-full text-right p-3 border rounded-xl hover:bg-[#fbf7ef] hover:border-blue-300 font-bold text-sm transition-colors"
                  >
                    {sys}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
