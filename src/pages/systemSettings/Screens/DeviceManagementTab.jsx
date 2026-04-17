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
    setIsAIExtracting(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await api.post("/devices/extract-specs", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data?.success) {
        const { cpu, ram, storage, gpu, os, macAddresses } = res.data.data;
        const imageUrl = res.data.imageUrl;
        setDeviceForm((prev) => {
          const existingMacs =
            prev.network?.macAddresses?.filter((m) => m.trim() !== "") || [];
          const newMacsFromAI = Array.isArray(macAddresses) ? macAddresses : [];
          const mergedMacs = [...new Set([...existingMacs, ...newMacsFromAI])];
          if (mergedMacs.length === 0) mergedMacs.push("");
          return {
            ...prev,
            specs: {
              ...prev.specs,
              cpu: cpu || prev.specs.cpu,
              ram: ram || prev.specs.ram,
              storage: storage || prev.specs.storage,
              gpu: gpu || prev.specs.gpu,
              os: os || prev.specs.os,
            },
            network: { ...prev.network, macAddresses: mergedMacs },
            attachments: [
              ...(prev.attachments || []),
              {
                name: "مواصفات مستخرجة (صورة AI)",
                url: imageUrl,
                date: new Date().toISOString(),
              },
            ],
          };
        });
        toast.success("تم استخراج المواصفات بنجاح ✨");
      }
    } catch (error) {
      toast.error("تعذر قراءة الصورة");
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
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  // 🚀 دالة طباعة الملصق بشكل احترافي وحقيقي
  const handlePrintSticker = () => {
    if (!selectedDevice) return;

    // توليد QR Code حقيقي يحمل كود الجهاز باستخدام خدمة مجانية
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${selectedDevice.deviceCode}`;

    // فتح نافذة طباعة جديدة
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    
    // تصميم الملصق (مصمم بمقاسات حقيقية لطابعات الملصقات مثل 8cm x 4cm)
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>طباعة ملصق - ${selectedDevice.deviceCode}</title>
        <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;900&display=swap" rel="stylesheet">
        <style>
          @page {
            size: 8cm 4cm; /* مقاس الاستيكر القياسي، يمكنك تغييره */
            margin: 0;
          }
          body {
            margin: 0;
            padding: 0;
            font-family: 'Tajawal', sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            background-color: #fff;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .sticker-container {
            width: 7.6cm;
            height: 3.6cm;
            border: 2px solid #0f172a;
            border-radius: 8px;
            padding: 0.2cm;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            background-color: #fff;
          }
          .header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 2px solid #059669;
            padding-bottom: 4px;
            margin-bottom: 4px;
          }
          .logo-box {
            background-color: #0f172a;
            color: #fff;
            font-weight: 900;
            font-size: 14px;
            padding: 2px 6px;
            border-radius: 4px;
          }
          .company-name {
            font-size: 11px;
            font-weight: 900;
            color: #475569;
            letter-spacing: 0.5px;
          }
          .content {
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex: 1;
          }
          .details {
            flex: 1;
          }
          .detail-row {
            margin-bottom: 3px;
            font-size: 10px;
          }
          .detail-label {
            font-weight: 700;
            color: #64748b;
            display: inline-block;
            width: 45px;
          }
          .detail-value {
            font-weight: 900;
            color: #0f172a;
          }
          .qr-box {
            width: 1.8cm;
            height: 1.8cm;
            margin-right: 10px;
          }
          .qr-box img {
            width: 100%;
            height: 100%;
            object-fit: contain;
          }
          .footer {
            text-align: center;
            font-size: 8px;
            font-weight: 900;
            color: #0f172a;
            background-color: #f1f5f9;
            padding: 2px;
            border-radius: 4px;
          }
        </style>
      </head>
      <body>
        <div class="sticker-container">
          <div class="header">
            <div class="logo-box">DC</div>
            <div class="company-name">ديتيلز كونسولتس DETAILS</div>
          </div>
          
          <div class="content">
            <div class="details">
              <div class="detail-row">
                <span class="detail-label">الكود:</span>
                <span class="detail-value" style="font-family: monospace; font-size: 12px;">${selectedDevice.deviceCode}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">S/N:</span>
                <span class="detail-value" style="font-family: monospace;">${selectedDevice.serialNumber || '—'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">الجهاز:</span>
                <span class="detail-value">${selectedDevice.brand} ${selectedDevice.model?.substring(0,10)}</span>
              </div>
            </div>
            <div class="qr-box">
              <img src="${qrCodeUrl}" alt="QR Code" />
            </div>
          </div>

          <div class="footer">
            Property of Details Consults | ملكية خاصة
          </div>
        </div>

        <script>
          // الانتظار قليلاً حتى يتم تحميل الخطوط وصورة الـ QR Code ثم أمر الطباعة
          window.onload = () => {
            setTimeout(() => {
              window.print();
              window.close();
            }, 500);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    setIsStickerModalOpen(false);
  };

  return (
    <div
      className="h-full overflow-y-auto bg-slate-50/50 p-4 sm:p-8 custom-scrollbar"
      dir="rtl"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            إدارة الأجهزة والأصول
          </h1>
          <p className="text-sm font-bold text-slate-500 mt-1">
            تتبع الأجهزة، الصيانة، طباعة الملصقات، وإدارة العهد
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => toast.success("جاري التحضير للتصدير...")}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 shadow-sm"
          >
            <Download className="w-4 h-4" /> تصدير CSV
          </button>
          <button
            onClick={handleOpenAddModal}
            className="group flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-black hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-600/20 active:scale-95"
          >
            <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />{" "}
            إضافة جهاز جديد
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-1 h-full bg-blue-500" />
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <Package className="w-6 h-6" />
            </div>
            <span className="text-sm font-black text-slate-700 uppercase tracking-wider">
              إجمالي الأجهزة
            </span>
          </div>
          <div className="text-3xl font-black text-slate-900">
            {devices.length}
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-1 h-full bg-emerald-500" />
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <span className="text-sm font-black text-slate-700 uppercase tracking-wider">
              تعمل بكفاءة
            </span>
          </div>
          <div className="text-3xl font-black text-slate-900">
            {devices.filter((d) => d.status === "Active").length}
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-1 h-full bg-amber-500" />
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
              <Wrench className="w-6 h-6" />
            </div>
            <span className="text-sm font-black text-slate-700 uppercase tracking-wider">
              تتطلب صيانة
            </span>
          </div>
          <div className="text-3xl font-black text-slate-900">
            {devices.filter((d) => d.status === "Warning").length}
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-1 h-full bg-red-500" />
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-red-50 text-red-600 rounded-xl">
              <AlertOctagon className="w-6 h-6" />
            </div>
            <span className="text-sm font-black text-slate-700 uppercase tracking-wider">
              خارج الخدمة
            </span>
          </div>
          <div className="text-3xl font-black text-slate-900">
            {devices.filter((d) => d.status === "Offline").length}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
        <div className="flex-1 relative group w-full">
          <Search className="w-5 h-5 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="البحث بالاسم، الموديل، أو الرقم التسلسلي..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-4 pr-12 py-3.5 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto custom-scrollbar">
          <button
            onClick={() => setSelectedCategory("All")}
            className={cn(
              "px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all border",
              selectedCategory === "All"
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50",
            )}
          >
            الكل
          </button>
          {allCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                "px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 border",
                selectedCategory === cat.id
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50",
              )}
            >
              <cat.icon
                className={cn(
                  "w-4 h-4",
                  selectedCategory === cat.id
                    ? "text-emerald-400"
                    : "text-slate-400",
                )}
              />{" "}
              {cat.label}
            </button>
          ))}
          <button
            onClick={handleAddCategory}
            className="px-3 py-2.5 rounded-xl text-sm font-bold bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200"
            title="إضافة تصنيف جديد"
          >
            <Plus className="w-4 h-4" />
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
          <div className="text-center py-20 text-slate-400 font-bold">
            لا توجد أجهزة مطابقة للبحث
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {filteredDevices.map((device) => (
              <div
                key={device.id}
                className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-300 p-4 group cursor-pointer flex flex-col"
                onClick={() => {
                  setSelectedDevice(device);
                  setActiveTab("info");
                }}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-600 border border-slate-200">
                      {getDeviceIcon(device.type, "w-5 h-5")}
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900 line-clamp-1">
                        {device.name}
                      </h3>
                      <div className="text-[10px] font-bold text-slate-500 mt-0.5">
                        {device.brand} {device.model}
                      </div>
                    </div>
                  </div>
                  <div className="relative flex items-center">
                    <select
                      value={device.status}
                      onChange={(e) =>
                        handleStatusChange(device, e.target.value)
                      }
                      onClick={(e) => e.stopPropagation()}
                      className={cn(
                        "px-2 py-0.5 rounded-md text-[10px] font-black border outline-none cursor-pointer appearance-none text-center",
                        getStatusColor(device.status),
                      )}
                    >
                      <option value="Active">نشط</option>
                      <option value="Warning">تحذير</option>
                      <option value="Offline">متوقف</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-3 mb-6 flex-1 mt-2">
                  <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-2">
                    <span className="text-slate-500 font-bold">
                      الرقم التسلسلي
                    </span>
                    <span className="font-mono font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                      {device.serialNumber}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-2">
                    <span className="text-slate-500 font-bold">العهدة</span>
                    <span className="font-bold text-slate-900">
                      {device.assignedTo || "—"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleOpenSticker(device, e)}
                      className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl"
                      title="طباعة ستيكر"
                    >
                      <QrCode className="w-5 h-5" />
                    </button>
                    <button
                      onClick={(e) => handleOpenEditModal(device, e)}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl"
                      title="تعديل الجهاز"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <div className="relative group">
                      <button
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>
                      <div
                        className="absolute right-0 bottom-full mb-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => {
                            setSelectedDevice(device);
                            setIsAddMaintenanceOpen(true);
                          }}
                          className="w-full text-right px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-emerald-600 flex items-center gap-2"
                        >
                          <Wrench className="w-4 h-4" /> تسجيل صيانة
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm("حذف؟"))
                              deleteDeviceMutation.mutate(device.id);
                          }}
                          className="w-full text-right px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-slate-100"
                        >
                          <Trash2 className="w-4 h-4" /> حذف الجهاز
                        </button>
                      </div>
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
                className="relative w-full max-w-5xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
              >
                {/* Header */}
                <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-700 shadow-sm">
                      {getDeviceIcon(selectedDevice.type)}
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                        {selectedDevice.name}
                        <span className="font-mono text-sm bg-blue-100 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
                          {selectedDevice.deviceCode}
                        </span>
                      </h2>
                      <div className="flex items-center gap-3 mt-1">
                        <p className="text-sm font-bold text-slate-500">
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
                      className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-600 rounded-xl font-bold hover:bg-blue-100 transition-all"
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
                      className="p-2.5 text-slate-400 hover:bg-slate-200 rounded-full transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-6 px-8 border-b border-slate-100 bg-white shrink-0">
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
                          ? "border-emerald-500 text-emerald-600"
                          : "border-transparent text-slate-500 hover:text-slate-800",
                      )}
                    >
                      <tab.icon className="w-4 h-4" /> {tab.label}
                    </button>
                  ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-slate-50/30">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Content */}
                    <div className="lg:col-span-2 space-y-8">
                      {/* TAB INFO */}
                      {activeTab === "info" && (
                        <>
                          <section>
                            <h3 className="text-sm font-black text-slate-900 uppercase mb-4 flex items-center gap-2">
                              <DollarSign className="w-5 h-5 text-emerald-600" />{" "}
                              بيانات الشراء والضمان
                            </h3>
                            <div className="grid grid-cols-2 gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                              <div className="border-b border-slate-100 pb-3">
                                <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                                  تاريخ الشراء
                                </div>
                                <div className="text-sm font-black text-slate-900">
                                  {selectedDevice.purchaseDate || "—"}
                                </div>
                              </div>
                              <div className="border-b border-slate-100 pb-3">
                                <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                                  سعر الشراء
                                </div>
                                <div className="text-sm font-black text-slate-900">
                                  {selectedDevice.purchasePrice
                                    ? `${selectedDevice.purchasePrice} ريال`
                                    : "—"}
                                </div>
                              </div>
                              <div className="border-b border-slate-100 pb-3">
                                <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                                  المورد
                                </div>
                                <div className="text-sm font-black text-slate-900">
                                  {selectedDevice.vendor || "—"}
                                </div>
                              </div>
                              <div className="border-b border-slate-100 pb-3">
                                <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                                  نهاية الضمان
                                </div>
                                <div className="text-sm font-black text-slate-900 flex items-center gap-2">
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
                              <div className="border-b border-slate-100 pb-3 md:col-span-2">
                                <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">
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
                                      : "text-emerald-600",
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
                              <h3 className="text-sm font-black text-slate-900 uppercase flex items-center gap-2">
                                <Activity className="w-5 h-5 text-emerald-600" />{" "}
                                الأجزاء المستهلكة
                              </h3>
                              <button
                                onClick={() => setIsAddConsumableOpen(true)}
                                className="text-xs font-bold text-emerald-600 hover:bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200"
                              >
                                + جزء مستهلك
                              </button>
                            </div>
                            {selectedDevice.consumables?.length > 0 ? (
                              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                <table className="w-full text-right">
                                  <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                      <th className="px-4 py-3 text-xs font-black text-slate-500">
                                        الجزء
                                      </th>
                                      <th className="px-4 py-3 text-xs font-black text-slate-500">
                                        الحالة
                                      </th>
                                      <th className="px-4 py-3 text-xs font-black text-slate-500">
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
                                          className="hover:bg-slate-50"
                                        >
                                          <td className="px-4 py-3 text-sm font-bold text-slate-900">
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
                                          <td className="px-4 py-3 text-sm font-bold text-slate-600">
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
                              <div className="text-center py-6 text-slate-400 font-bold text-xs bg-slate-50 rounded-xl border border-slate-200 border-dashed">
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
                            <h3 className="text-sm font-black text-slate-900 uppercase mb-4 flex items-center gap-2">
                              <Cpu className="w-5 h-5 text-emerald-600" />{" "}
                              المواصفات التقنية
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                              <div className="border-b border-slate-100 pb-3">
                                <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                                  المعالج (CPU)
                                </div>
                                <div className="text-sm font-black text-slate-900">
                                  {selectedDevice.specs?.cpu || "—"}
                                </div>
                              </div>
                              <div className="border-b border-slate-100 pb-3">
                                <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                                  الذاكرة (RAM)
                                </div>
                                <div className="text-sm font-black text-slate-900">
                                  {selectedDevice.specs?.ram || "—"}
                                </div>
                              </div>
                              <div className="border-b border-slate-100 pb-3">
                                <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                                  التخزين
                                </div>
                                <div className="text-sm font-black text-slate-900">
                                  {selectedDevice.specs?.storage || "—"}
                                </div>
                              </div>
                              <div className="border-b border-slate-100 pb-3">
                                <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                                  كرت الشاشة (GPU)
                                </div>
                                <div className="text-sm font-black text-slate-900">
                                  {selectedDevice.specs?.gpu || "—"}
                                </div>
                              </div>
                              <div className="border-b border-slate-100 pb-3 md:col-span-2">
                                <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                                  نظام التشغيل (OS)
                                </div>
                                <div className="text-sm font-black text-slate-900">
                                  {selectedDevice.specs?.os || "—"}
                                </div>
                              </div>
                            </div>
                          </section>

                          <section>
                            <h3 className="text-sm font-black text-slate-900 uppercase mb-4 flex items-center gap-2">
                              <Network className="w-5 h-5 text-emerald-600" />{" "}
                              الشبكة
                            </h3>
                            <div className="grid grid-cols-2 gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                              <div className="border-b border-slate-100 pb-3">
                                <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                                  IP الداخلي
                                </div>
                                <div className="text-sm font-black text-slate-900 font-mono">
                                  {selectedDevice.network?.internalIp || "—"}
                                </div>
                              </div>
                              <div className="border-b border-slate-100 pb-3">
                                <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                                  Static IP
                                </div>
                                <div className="text-sm font-black text-slate-900 font-mono">
                                  {selectedDevice.network?.staticIp || "—"}
                                </div>
                              </div>
                              <div className="border-b border-slate-100 pb-3">
                                <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                                  Tailscale IP
                                </div>
                                <div className="text-sm font-black text-slate-900 font-mono">
                                  {selectedDevice.network?.tailscaleIp || "—"}
                                </div>
                              </div>
                              <div className="border-b border-slate-100 pb-3">
                                <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                                  ZeroTier IP
                                </div>
                                <div className="text-sm font-black text-slate-900 font-mono">
                                  {selectedDevice.network?.zeroTierIp || "—"}
                                </div>
                              </div>
                              <div className="border-b border-slate-100 pb-3 md:col-span-2">
                                <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                                  عناوين MAC
                                </div>
                                <div className="space-y-1 mt-1">
                                  {selectedDevice.network?.macAddresses?.map(
                                    (mac, i) =>
                                      mac.trim() !== "" && (
                                        <div
                                          key={i}
                                          className="text-sm font-black text-slate-900 font-mono bg-slate-50 px-2 py-1 rounded inline-block ml-2"
                                        >
                                          {mac}
                                        </div>
                                      ),
                                  )}
                                  {(!selectedDevice.network?.macAddresses ||
                                    selectedDevice.network.macAddresses.filter(
                                      (m) => m.trim() !== "",
                                    ).length === 0) && (
                                    <div className="text-sm text-slate-400">
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
                            <h3 className="text-sm font-black text-slate-900 uppercase flex items-center gap-2">
                              <Wrench className="w-5 h-5 text-emerald-600" />{" "}
                              سجل الصيانة
                            </h3>
                            <button
                              onClick={() => setIsAddMaintenanceOpen(true)}
                              className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg"
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
                                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-slate-100 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                                      <Wrench className="w-4 h-4" />
                                    </div>
                                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl border border-slate-200 bg-white shadow-sm">
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
                                              className="text-emerald-600 bg-emerald-50 px-3 py-1 rounded text-xs font-bold"
                                            >
                                              حفظ
                                            </button>
                                            <button
                                              onClick={() =>
                                                setEditingMaintenance(null)
                                              }
                                              className="text-slate-500 bg-slate-100 px-3 py-1 rounded text-xs font-bold"
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
                                            <div className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                              {record.date}
                                            </div>
                                          </div>
                                          <div className="text-sm font-bold text-slate-600 mb-3">
                                            {record.description}
                                          </div>
                                          <div className="flex justify-between border-t border-slate-100 pt-2">
                                            <div className="text-xs font-bold text-slate-500">
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
                                                className="p-1.5 text-blue-500 hover:bg-blue-50 rounded"
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
                              <div className="text-center py-10 text-slate-400 font-bold border-2 border-dashed border-slate-200 rounded-2xl">
                                لا توجد سجلات صيانة.
                              </div>
                            )}
                          </div>
                        </section>
                      )}
                    </div>

                    {/* Right Sidebar */}
                    <div className="space-y-6">
                      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                        <h3 className="text-sm font-black text-slate-900 uppercase mb-2 flex items-center gap-2">
                          <FileText className="w-5 h-5 text-slate-400" /> ملخص
                          الجهاز
                        </h3>
                        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                          <span className="text-xs font-bold text-slate-500">
                            الرقم التسلسلي
                          </span>
                          <span className="text-xs font-black text-slate-900 font-mono bg-slate-100 px-2 py-1 rounded">
                            {selectedDevice.serialNumber}
                          </span>
                        </div>
                        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                          <span className="text-xs font-bold text-slate-500">
                            الموقع
                          </span>
                          <span className="text-xs font-black text-slate-900">
                            {selectedDevice.location || "—"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                          <span className="text-xs font-bold text-slate-500">
                            العهدة
                          </span>
                          <span className="text-xs font-black text-slate-900">
                            {selectedDevice.assignedTo || "—"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                          <span className="text-xs font-bold text-slate-500">
                            النظام المرتبط
                          </span>
                          <span
                            onClick={() => setIsLinkSystemModalOpen(true)}
                            className="text-xs font-black text-blue-600 bg-blue-50 px-2 py-1 rounded cursor-pointer hover:bg-blue-100"
                          >
                            {selectedDevice.linkedSystem || "ربط..."}
                          </span>
                        </div>
                        <div className="flex justify-between items-center pt-2">
                          <span className="text-xs font-bold text-slate-500">
                            موعد الصيانة
                          </span>
                          <span className="text-sm font-black text-amber-600 bg-amber-50 px-2 py-1 rounded">
                            {selectedDevice.nextMaintenanceDate || "—"}
                          </span>
                        </div>
                      </div>

                      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                        <h3 className="text-sm font-black text-slate-900 uppercase mb-2 flex items-center gap-2">
                          <FileText className="w-5 h-5 text-slate-400" />{" "}
                          المرفقات والمستندات
                        </h3>
                        <div className="space-y-2">
                          {selectedDevice.invoiceAttachment && (
                            <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl hover:border-emerald-200 transition-colors group">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-white rounded-lg shadow-sm text-blue-600">
                                  <FileText className="w-4 h-4" />
                                </div>
                                <div>
                                  <div className="text-xs font-black text-slate-900">
                                    مرفق الفاتورة/الضمان
                                  </div>
                                  <div
                                    className="text-[10px] font-bold text-slate-400 truncate max-w-[120px]"
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
                                  className="p-2 text-slate-400 hover:text-emerald-600"
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
                                  className="p-2 text-slate-400 hover:text-red-600"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          )}
                          {selectedDevice.attachments?.map((file, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl hover:border-emerald-200 transition-colors group"
                            >
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-white rounded-lg shadow-sm text-purple-600">
                                  <ImageIcon className="w-4 h-4" />
                                </div>
                                <div>
                                  <div className="text-xs font-black text-slate-900">
                                    {file.name}
                                  </div>
                                  <div
                                    className="text-[10px] font-bold text-slate-400 truncate max-w-[120px]"
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
                                  className="p-2 text-slate-400 hover:text-emerald-600"
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
                                  className="p-2 text-slate-400 hover:text-red-600"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                          {!selectedDevice.invoiceAttachment &&
                            (!selectedDevice.attachments ||
                              selectedDevice.attachments.length === 0) && (
                              <div className="text-xs text-slate-400 font-bold text-center py-3 border border-dashed rounded-xl bg-slate-50">
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
                            className="w-full py-2.5 border-2 border-dashed border-slate-200 text-slate-500 rounded-xl font-bold hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50 text-sm flex justify-center gap-2 mt-2 disabled:opacity-50"
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
              className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col z-10"
            >
              <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
                <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                  {deviceModalMode === "add" ? (
                    <>
                      <Plus className="w-6 h-6 text-emerald-600" /> إضافة أصل
                      جديد
                    </>
                  ) : (
                    <>
                      <Edit className="w-6 h-6 text-blue-600" /> تعديل بيانات
                      الأصل
                    </>
                  )}
                </h2>
                <button
                  onClick={() => setIsDeviceModalOpen(false)}
                  className="p-2 text-slate-400 hover:bg-slate-200 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-slate-50/50">
                <form
                  id="device-form"
                  onSubmit={handleDeviceSubmit}
                  className="space-y-8"
                >
                  {/* Basic Info */}
                  <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Info className="w-5 h-5 text-emerald-600" /> المعلومات
                      الأساسية
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5">
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
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5">
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
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-emerald-500"
                        >
                          {allCategories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5">
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
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5">
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
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5">
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
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5">
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
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-emerald-500 cursor-pointer"
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
                        <label className="block text-xs font-bold text-slate-500 mb-1.5">
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
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5">
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
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-emerald-500"
                        >
                          <option value="Active">نشط</option>
                          <option value="Warning">تحذير</option>
                          <option value="Offline">غير متصل</option>
                        </select>
                      </div>
                    </div>
                  </section>

                  {/* 🚀 الإهلاك المالي (Financials & Depreciation) */}
                  <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-emerald-600" /> بيانات
                      الشراء والإهلاك
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5">
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
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5">
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
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5">
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
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-emerald-500 cursor-pointer"
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
                          <div className="bg-slate-100 p-3 rounded-xl border border-slate-200 flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-600">
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
                                  : "text-emerald-600",
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
                          <div className="text-xs text-slate-400 font-bold p-3">
                            أكمل البيانات لحساب القيمة الحالية
                          </div>
                        )}
                      </div>
                    </div>
                  </section>

                  {/* 🚀 المواصفات + الذكاء الاصطناعي */}
                  {(deviceForm.type === "Computer" ||
                    deviceForm.type === "Server") && (
                    <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                      <div className="flex items-center justify-between mb-4 relative z-10">
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                          <Cpu className="w-5 h-5 text-emerald-600" /> المواصفات
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
                          onClick={() => aiImageInputRef.current?.click()}
                          disabled={isAIExtracting}
                          className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 hover:from-purple-200 hover:to-blue-200 rounded-lg text-xs font-bold transition-all border border-purple-200 shadow-sm disabled:opacity-50"
                        >
                          {isAIExtracting ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Wand2 className="w-3.5 h-3.5" />
                          )}
                          استخراج تلقائي (صورة) 🪄
                        </button>
                      </div>
                      {isAIExtracting && (
                        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center">
                          <BrainCircuit className="w-10 h-10 text-purple-500 animate-pulse mb-2" />
                          <div className="text-sm font-black text-purple-800">
                            جاري تحليل الصورة وقراءة المواصفات والـ MAC...
                          </div>
                        </div>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 relative z-10">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1.5">
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
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1.5">
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
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1.5">
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
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1.5">
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
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-xs font-bold text-slate-500 mb-1.5">
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
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                      </div>
                    </section>
                  )}

                  {/* Network Section in Form */}
                  <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Network className="w-5 h-5 text-emerald-600" /> إعدادات
                      الشبكة
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5">
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
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold font-mono focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5">
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
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold font-mono focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5">
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
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold font-mono focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5">
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
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold font-mono focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-500 mb-1.5">
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
                                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold font-mono focus:outline-none focus:border-emerald-500"
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
                            className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg hover:bg-emerald-100 w-fit"
                          >
                            + إضافة MAC إضافي
                          </button>
                        </div>
                      </div>
                    </div>
                  </section>
                </form>
              </div>

              <div className="px-8 py-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
                <button
                  onClick={() => setIsDeviceModalOpen(false)}
                  className="px-6 py-2.5 text-slate-600 font-bold hover:bg-slate-200 rounded-xl transition-colors"
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
                  className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-black hover:bg-emerald-500 transition-all flex items-center gap-2 shadow-md disabled:opacity-50"
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
              className="relative bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl z-10"
            >
              <h3 className="text-lg font-black mb-4">تسجيل صيانة جديدة</h3>
              <form onSubmit={handleAddMaintenanceSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-600 mb-1 block">
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
                    <label className="text-xs font-bold text-slate-600 mb-1 block">
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
                  <label className="text-xs font-bold text-slate-600 mb-1 block">
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
                  <label className="text-xs font-bold text-slate-600 mb-1 block">
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
                    className="px-4 py-2 bg-slate-100 rounded-lg text-sm font-bold"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold"
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
              className="relative bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl z-10"
            >
              <h3 className="text-lg font-black mb-4">إضافة جزء مستهلك</h3>
              <form onSubmit={handleAddConsumableSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 mb-1 block">
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
                  <label className="text-xs font-bold text-slate-600 mb-1 block">
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
                  <label className="text-xs font-bold text-slate-600 mb-1 block">
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
                    className="px-4 py-2 bg-slate-100 rounded-lg text-sm font-bold"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold"
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
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col z-10"
            >
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h2 className="text-lg font-black flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-emerald-600" /> معاينة ملصق
                  الجهاز
                </h2>
                <button
                  onClick={() => setIsStickerModalOpen(false)}
                  className="p-2 text-slate-400 hover:bg-slate-200 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-8 flex justify-center bg-slate-100/50">
                <div className="w-80 bg-white border-2 border-slate-800 rounded-xl p-4 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-2 bg-emerald-600" />
                  <div className="flex justify-between items-start mb-4 mt-1">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white font-black text-xs shadow-sm">
                        DC
                      </div>
                      <div>
                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                          ديتيلز كونسولتس
                        </div>
                        <div className="text-sm font-black text-slate-900">
                          {selectedDevice.name}
                        </div>
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-200 shadow-sm">
                      <QrCode className="w-8 h-8 opacity-50" />
                    </div>
                  </div>
                  <div className="space-y-1.5 mb-4">
                    <div className="flex justify-between border-b border-slate-100 pb-1">
                      <span className="text-[10px] font-bold text-slate-500">
                        كود الجهاز
                      </span>
                      <span className="text-[10px] font-black text-slate-900 font-mono">
                        {selectedDevice.deviceCode}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-1">
                      <span className="text-[10px] font-bold text-slate-500">
                        الرقم التسلسلي
                      </span>
                      <span className="text-[10px] font-black text-slate-900 font-mono">
                        {selectedDevice.serialNumber}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-1">
                      <span className="text-[10px] font-bold text-slate-500">
                        الموديل
                      </span>
                      <span className="text-[10px] font-black text-slate-900">
                        {selectedDevice.brand} {selectedDevice.model}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-1">
                      <span className="text-[10px] font-bold text-slate-500">
                        العهدة
                      </span>
                      <span className="text-[10px] font-black text-slate-900">
                        {selectedDevice.assignedTo || "—"}
                      </span>
                    </div>
                  </div>
                  <div className="text-center bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                    <div className="text-[9px] font-black text-slate-700">
                      هذا الجهاز ملك شركة ديتيلز كونسولتس
                    </div>
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                <button
                  onClick={() => setIsStickerModalOpen(false)}
                  className="px-6 py-2.5 text-slate-600 font-bold hover:bg-slate-200 rounded-xl transition-colors"
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
              className="relative bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl z-10"
            >
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <h2 className="text-lg font-black flex items-center gap-2">
                  <Server className="w-5 h-5 text-blue-600" /> ربط بنظام
                </h2>
                <button
                  onClick={() => setIsLinkSystemModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600"
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
                    className="w-full text-right p-3 border rounded-xl hover:bg-blue-50 hover:border-blue-300 font-bold text-sm transition-colors"
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
