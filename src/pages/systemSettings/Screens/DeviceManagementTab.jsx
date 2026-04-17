import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../api/axios"; // تأكد من مسار axios
import {
  Monitor,
  Printer,
  Server,
  Smartphone,
  Video,
  Wifi,
  Lock,
  Search,
  Plus,
  Filter,
  Download,
  MoreVertical,
  ShieldCheck,
  AlertTriangle,
  Settings,
  BrainCircuit,
  X,
  QrCode,
  FileText,
  Activity,
  Wrench,
  Calendar,
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
} from "lucide-react";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";
import { toast } from "sonner";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const categories = [
  { id: "All", label: "الكل", icon: Package },
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
  vendor: "",
  warrantyEnd: "",
  invoiceAttachment: "",
  specs: { cpu: "", ram: "", storage: "", gpu: "", os: "", chassisNumber: "" },
  network: {
    internalIp: "",
    mac: "",
    tailscaleIp: "",
    zeroTierIp: "",
    domain: "",
  },
};

// 💡 دالة تحضير الرابط الكامل
export const getFullUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  let fixedUrl = url;
  if (url.startsWith("/uploads/")) fixedUrl = `/api${url}`;
  const baseUrl = "https://details-worksystem1.com"; // 💡 الدومين والبورت
  return `${baseUrl}${fixedUrl}`;
};

export default function DevicesMain() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [isDeviceModalOpen, setIsDeviceModalOpen] = useState(false);
  const [deviceModalMode, setDeviceModalMode] = useState("add");
  const [deviceForm, setDeviceForm] = useState(emptyDeviceForm);

  const fileInputRef = useRef(null);
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

  const { data: devices = [], isLoading } = useQuery({
    queryKey: ["devices"],
    queryFn: async () => {
      const res = await api.get("/devices");
      return res.data?.data || [];
    },
  });

  const addDeviceMutation = useMutation({
    mutationFn: (deviceData) => api.post("/devices", deviceData),
    onSuccess: () => {
      toast.success("تم إضافة الجهاز بنجاح");
      queryClient.invalidateQueries(["devices"]);
      setIsDeviceModalOpen(false);
      setDeviceForm(emptyDeviceForm);
    },
  });

  const updateDeviceMutation = useMutation({
    mutationFn: (updatedData) =>
      api.put(`/devices/${updatedData.id}`, updatedData),
    onSuccess: (res) => {
      toast.success("تم تحديث بيانات الجهاز");
      queryClient.invalidateQueries(["devices"]);
      if (selectedDevice && selectedDevice.id === res.data.data.id) {
        setSelectedDevice(res.data.data);
      }
      if (isDeviceModalOpen && deviceModalMode === "edit") {
        setIsDeviceModalOpen(false);
        setDeviceForm(emptyDeviceForm);
      }
    },
  });

  const deleteDeviceMutation = useMutation({
    mutationFn: (id) => api.delete(`/devices/${id}`),
    onSuccess: () => {
      toast.success("تم حذف الجهاز بنجاح");
      queryClient.invalidateQueries(["devices"]);
      setSelectedDevice(null);
    },
  });

  // ==========================================
  // 🚀 دوال التعامل مع البيانات
  // ==========================================
  const handleOpenAddModal = () => {
    setDeviceModalMode("add");
    setDeviceForm(emptyDeviceForm);
    setIsDeviceModalOpen(true);
  };

  const handleOpenEditModal = (device, e) => {
    if (e) e.stopPropagation();
    setDeviceModalMode("edit");
    setDeviceForm({ ...device }); // تعبئة النموذج ببيانات الجهاز
    setIsDeviceModalOpen(true);
  };

  const handleDeviceSubmit = (e) => {
    e.preventDefault();
    if (deviceModalMode === "add") {
      addDeviceMutation.mutate(deviceForm);
    } else {
      updateDeviceMutation.mutate(deviceForm);
    }
  };

  const handleStatusChange = (device, newStatus) => {
    updateDeviceMutation.mutate({ ...device, status: newStatus });
    toast.success("تم تحديث حالة الجهاز");
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
      toast.success("تم تحديث سجل الصيانة بنجاح");
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
    toast.success("تم حذف سجل الصيانة بنجاح");
  };

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
    toast.success("تمت إضافة سجل الصيانة بنجاح");
  };

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
    toast.success("تمت إضافة المستهلك بنجاح");
  };

  const handleLinkSystemSubmit = (sysName) => {
    updateDeviceMutation.mutate({ ...selectedDevice, linkedSystem: sysName });
    setIsLinkSystemModalOpen(false);
    toast.success("تم ربط النظام بنجاح");
  };

  const handleUpdateNetwork = (networkUpdates) => {
    updateDeviceMutation.mutate({
      ...selectedDevice,
      network: { ...selectedDevice.network, ...networkUpdates },
    });
  };

  const handleUpdateSpecs = (specUpdates) => {
    updateDeviceMutation.mutate({
      ...selectedDevice,
      specs: { ...selectedDevice.specs, ...specUpdates },
    });
  };

  const handleDeleteDevice = (id) => {
    if (window.confirm("هل أنت متأكد من حذف هذا الجهاز بشكل نهائي؟")) {
      deleteDeviceMutation.mutate(id);
    }
  };

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
      toast.success("تم رفع المرفق وحفظه بنجاح");
      queryClient.invalidateQueries(["devices"]);
      if (selectedDevice && selectedDevice.id === res.data.data.id) {
        setSelectedDevice(res.data.data);
      }
    },
    onError: () => toast.error("حدث خطأ أثناء رفع المرفق"),
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && selectedDevice) {
      uploadAttachmentMutation.mutate({ file, deviceId: selectedDevice.id });
    }
    // تصفير المدخل ليقبل نفس الملف لو تم حذفه ورفعه مجدداً
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleOpenSticker = (device, e) => {
    e.stopPropagation(); // 💡 يمنع الحدث من الوصول للبطاقة وفتح التفاصيل
    setSelectedDevice(device);
    setIsStickerModalOpen(true);
  };

  const handleExportCSV = () => {
    const headers = [
      "Device Code",
      "Name",
      "Type",
      "Brand",
      "Model",
      "Serial Number",
      "Status",
      "Location",
      "Assigned To",
    ];
    const csvContent = [
      headers.join(","),
      ...devices.map((d) =>
        [
          d.deviceCode,
          d.name,
          d.type,
          d.brand,
          d.model,
          d.serialNumber,
          d.status,
          d.location,
          d.assignedTo,
        ]
          .map((val) => `"${val || ""}"`)
          .join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `devices_export_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("تم تصدير التقرير بنجاح");
  };

  // ==========================================
  // 🚀 الفلترة والإحصائيات
  // ==========================================
  const filteredDevices = devices.filter((device) => {
    const matchesSearch =
      device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.serialNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || device.type === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getDeviceIcon = (type, className = "w-6 h-6") => {
    switch (type) {
      case "Computer":
        return <Monitor className={className} />;
      case "Printer":
        return <Printer className={className} />;
      case "Server":
        return <Server className={className} />;
      case "Camera":
        return <Video className={className} />;
      case "Network":
        return <Wifi className={className} />;
      default:
        return <Package className={className} />;
    }
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
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-all shadow-sm"
          >
            <Download className="w-4 h-4" />
            تصدير CSV
          </button>
          <button
            onClick={handleOpenAddModal}
            className="group flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-black hover:from-emerald-500 hover:to-teal-500 transition-all shadow-lg shadow-emerald-600/20 active:scale-95"
          >
            <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
            إضافة جهاز جديد
          </button>
        </div>
      </div>

      {/* Top Dashboards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-center relative overflow-hidden group hover:border-blue-300 transition-colors">
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

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-center relative overflow-hidden group hover:border-emerald-300 transition-colors">
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

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-center relative overflow-hidden group hover:border-amber-300 transition-colors">
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

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-center relative overflow-hidden group hover:border-red-300 transition-colors">
          <div className="absolute top-0 right-0 w-1 h-full bg-red-500" />
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-red-50 text-red-600 rounded-xl">
              <ShieldCheck className="w-6 h-6" />
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

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
        <div className="flex-1 relative group w-full">
          <Search className="w-5 h-5 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-emerald-500" />
          <input
            type="text"
            placeholder="البحث بالاسم، الموديل، أو الرقم التسلسلي..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-4 pr-12 py-3.5 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto custom-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                "px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 border",
                selectedCategory === cat.id
                  ? "bg-slate-900 text-white border-slate-900 shadow-md"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300",
              )}
            >
              <cat.icon
                className={cn(
                  "w-4 h-4",
                  selectedCategory === cat.id
                    ? "text-emerald-400"
                    : "text-slate-400",
                )}
              />
              {cat.label}
            </button>
          ))}
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
                className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all p-4 group cursor-pointer flex flex-col"
                onClick={() => setSelectedDevice(device)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-600 border border-slate-200 group-hover:bg-emerald-50 group-hover:text-emerald-600 group-hover:border-emerald-200 transition-colors shadow-sm">
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
                    {device.status === "Active" && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 absolute right-2 pointer-events-none" />
                    )}
                    {device.status === "Warning" && (
                      <AlertTriangle className="w-4 h-4 text-amber-500 absolute right-2 pointer-events-none" />
                    )}
                    {device.status === "Offline" && (
                      <AlertOctagon className="w-4 h-4 text-red-500 absolute right-2 pointer-events-none" />
                    )}
                    <select
                      value={device.status}
                      onChange={(e) =>
                        handleStatusChange(device, e.target.value)
                      }
                      onClick={(e) => e.stopPropagation()}
                      className={cn(
                        "pl-2.5 pr-7 py-1 rounded-lg text-[10px] font-black border shadow-sm outline-none cursor-pointer appearance-none text-center",
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
                    <span className="text-slate-500 font-bold">الموقع</span>
                    <span className="font-bold text-slate-900">
                      {device.location || "—"}
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
                      className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors"
                      title="طباعة ستيكر"
                    >
                      <QrCode className="w-5 h-5" />
                    </button>
                    <button
                      onClick={(e) => handleOpenEditModal(device, e)}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                      title="تعديل الجهاز"
                    >
                      <Edit className="w-5 h-5" />
                    </button>

                    {/* Quick Actions Dropdown */}
                    <div className="relative group">
                      <button
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>
                      <div
                        className="absolute right-0 bottom-full mb-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* 💡 زر التعديل (Edit) */}
                        <button
                          onClick={(e) => handleOpenEditModal(device, e)}
                          className="w-full text-right px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-2"
                          title="تعديل الجهاز"
                        >
                          <Edit className="w-4 h-4" /> تعديل البيانات
                        </button>
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
                          onClick={() => handleDeleteDevice(device.id)}
                          className="w-full text-right px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-slate-100"
                        >
                          <Trash2 className="w-4 h-4" /> حذف الجهاز
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200">
                    {device.warrantyEnd &&
                    new Date(device.warrantyEnd) > new Date() ? (
                      <>
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />{" "}
                        ساري للضمان
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-3.5 h-3.5 text-red-500" />{" "}
                        منتهي الضمان
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ========================================== */}
      {/* Device Details Modal */}
      {/* ========================================== */}
      <AnimatePresence>
        {selectedDevice &&
          !isStickerModalOpen &&
          !isLinkSystemModalOpen &&
          !isAddMaintenanceOpen &&
          !isAddConsumableOpen && (
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
                {/* Modal Header */}
                <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
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
                      onClick={() => handleOpenEditModal(selectedDevice)}
                      className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-600 rounded-xl font-bold hover:bg-blue-100 transition-all active:scale-95"
                    >
                      <Edit className="w-4 h-4" />
                      تعديل البيانات
                    </button>
                    <button
                      onClick={() => setIsStickerModalOpen(true)}
                      className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-md active:scale-95"
                    >
                      <QrCode className="w-4 h-4" />
                      طباعة ستيكر
                    </button>
                    <div className="w-px h-8 bg-slate-200 mx-1" />
                    <button
                      onClick={() => setSelectedDevice(null)}
                      className="p-2.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 rounded-full transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                {/* Modal Tabs */}
                <div className="flex items-center gap-6 px-8 border-b border-slate-100 bg-white">
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
                      <tab.icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Modal Content */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-slate-50/30">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content Area based on Tab */}
                    <div className="lg:col-span-2 space-y-8">
                      {/* --- TAB: INFO --- */}
                      {activeTab === "info" && (
                        <>
                          {/* AI Insights */}
                          <div
                            className={cn(
                              "p-6 rounded-2xl border flex items-start gap-5 relative overflow-hidden",
                              selectedDevice.aiInsights?.healthScore < 70
                                ? "bg-amber-50 border-amber-200"
                                : "bg-emerald-50 border-emerald-200",
                            )}
                          >
                            <div
                              className={cn(
                                "absolute top-0 right-0 w-2 h-full",
                                selectedDevice.aiInsights?.healthScore < 70
                                  ? "bg-amber-500"
                                  : "bg-emerald-500",
                              )}
                            />
                            <div
                              className={cn(
                                "p-3 rounded-xl bg-white shadow-sm border",
                                selectedDevice.aiInsights?.healthScore < 70
                                  ? "border-amber-100"
                                  : "border-emerald-100",
                              )}
                            >
                              <BrainCircuit
                                className={cn(
                                  "w-6 h-6",
                                  selectedDevice.aiInsights?.healthScore < 70
                                    ? "text-amber-600"
                                    : "text-emerald-600",
                                )}
                              />
                            </div>
                            <div>
                              <h3
                                className={cn(
                                  "text-sm font-black mb-2 flex items-center gap-2",
                                  selectedDevice.aiInsights?.healthScore < 70
                                    ? "text-amber-800"
                                    : "text-emerald-800",
                                )}
                              >
                                تحليل الحالة الذكي
                                <span className="px-2 py-0.5 bg-white/50 rounded-md text-[10px] font-black border border-black/5">
                                  الكفاءة:{" "}
                                  {selectedDevice.aiInsights?.healthScore ||
                                    100}
                                  %
                                </span>
                              </h3>
                              <p
                                className={cn(
                                  "text-sm font-bold leading-relaxed",
                                  selectedDevice.aiInsights?.healthScore < 70
                                    ? "text-amber-700"
                                    : "text-emerald-700",
                                )}
                              >
                                {selectedDevice.aiInsights
                                  ?.maintenancePrediction || "يعمل بكفاءة"}
                              </p>
                              {selectedDevice.aiInsights?.anomalies?.length >
                                0 && (
                                <ul className="mt-3 space-y-1">
                                  {selectedDevice.aiInsights.anomalies.map(
                                    (anomaly, idx) => (
                                      <li
                                        key={idx}
                                        className="text-xs font-bold text-amber-800 flex items-center gap-1.5"
                                      >
                                        <AlertTriangle className="w-3 h-3" />
                                        {anomaly}
                                      </li>
                                    ),
                                  )}
                                </ul>
                              )}
                            </div>
                          </div>

                          {/* Purchase & Warranty */}
                          <section>
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                              <DollarSign className="w-5 h-5 text-emerald-600" />
                              بيانات الشراء والضمان
                            </h3>
                            <div className="grid grid-cols-2 gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                              <div className="border-b border-slate-100 pb-3">
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                  تاريخ الشراء
                                </div>
                                <input
                                  type="date"
                                  className="text-sm font-black text-slate-900 bg-transparent outline-none w-full"
                                  value={selectedDevice.purchaseDate || ""}
                                  onChange={(e) =>
                                    updateDeviceMutation.mutate({
                                      ...selectedDevice,
                                      purchaseDate: e.target.value,
                                    })
                                  }
                                />
                              </div>
                              <div className="border-b border-slate-100 pb-3">
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                  سعر الشراء
                                </div>
                                <input
                                  type="text"
                                  className="text-sm font-black text-slate-900 bg-transparent outline-none w-full"
                                  value={selectedDevice.purchasePrice || ""}
                                  onChange={(e) =>
                                    updateDeviceMutation.mutate({
                                      ...selectedDevice,
                                      purchasePrice: e.target.value,
                                    })
                                  }
                                />
                              </div>
                              <div className="border-b border-slate-100 pb-3">
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                  المورد
                                </div>
                                <input
                                  type="text"
                                  className="text-sm font-black text-slate-900 bg-transparent outline-none w-full"
                                  value={selectedDevice.vendor || ""}
                                  onChange={(e) =>
                                    updateDeviceMutation.mutate({
                                      ...selectedDevice,
                                      vendor: e.target.value,
                                    })
                                  }
                                />
                              </div>
                              <div className="border-b border-slate-100 pb-3">
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                  نهاية الضمان
                                </div>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="date"
                                    className="text-sm font-black text-slate-900 bg-transparent outline-none flex-1"
                                    value={selectedDevice.warrantyEnd || ""}
                                    onChange={(e) =>
                                      updateDeviceMutation.mutate({
                                        ...selectedDevice,
                                        warrantyEnd: e.target.value,
                                      })
                                    }
                                  />
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
                            </div>
                          </section>

                          {/* Consumables */}
                          <section>
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                                <Activity className="w-5 h-5 text-emerald-600" />
                                الأجزاء المستهلكة
                              </h3>
                              <button
                                onClick={() => setIsAddConsumableOpen(true)}
                                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors"
                              >
                                + إضافة جزء مستهلك
                              </button>
                            </div>

                            {selectedDevice.consumables &&
                            selectedDevice.consumables.length > 0 ? (
                              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                <table className="w-full text-right">
                                  <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                      <th className="px-4 py-3 text-xs font-black text-slate-500 uppercase">
                                        الجزء
                                      </th>
                                      <th className="px-4 py-3 text-xs font-black text-slate-500 uppercase">
                                        الحالة
                                      </th>
                                      <th className="px-4 py-3 text-xs font-black text-slate-500 uppercase">
                                        الصلاحية المتبقية
                                      </th>
                                      <th className="px-4 py-3 text-xs font-black text-slate-500 uppercase"></th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100">
                                    {selectedDevice.consumables.map(
                                      (item, idx) => (
                                        <tr
                                          key={idx}
                                          className="hover:bg-slate-50 transition-colors"
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
                                                const updatedConsumables =
                                                  selectedDevice.consumables.filter(
                                                    (_, i) => i !== idx,
                                                  );
                                                updateDeviceMutation.mutate({
                                                  ...selectedDevice,
                                                  consumables:
                                                    updatedConsumables,
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

                      {/* --- TAB: NETWORK & SPECS --- */}
                      {activeTab === "network" && (
                        <>
                          {/* Specs */}
                          <section>
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                              <Cpu className="w-5 h-5 text-emerald-600" />
                              المواصفات التقنية
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                              <div className="border-b border-slate-100 pb-3">
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                                  <Cpu className="w-3 h-3" /> المعالج (CPU)
                                </div>
                                <input
                                  type="text"
                                  value={selectedDevice.specs?.cpu || ""}
                                  onChange={(e) =>
                                    handleUpdateSpecs({ cpu: e.target.value })
                                  }
                                  className="w-full text-sm font-black text-slate-900 bg-slate-100 px-2 py-1 rounded-md border border-slate-200"
                                />
                              </div>
                              <div className="border-b border-slate-100 pb-3">
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                                  <Activity className="w-3 h-3" /> الذاكرة (RAM)
                                </div>
                                <input
                                  type="text"
                                  value={selectedDevice.specs?.ram || ""}
                                  onChange={(e) =>
                                    handleUpdateSpecs({ ram: e.target.value })
                                  }
                                  className="w-full text-sm font-black text-slate-900 bg-slate-100 px-2 py-1 rounded-md border border-slate-200"
                                />
                              </div>
                              <div className="border-b border-slate-100 pb-3">
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                                  <HardDrive className="w-3 h-3" /> التخزين
                                </div>
                                <input
                                  type="text"
                                  value={selectedDevice.specs?.storage || ""}
                                  onChange={(e) =>
                                    handleUpdateSpecs({
                                      storage: e.target.value,
                                    })
                                  }
                                  className="w-full text-sm font-black text-slate-900 bg-slate-100 px-2 py-1 rounded-md border border-slate-200"
                                />
                              </div>
                              <div className="border-b border-slate-100 pb-3">
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                                  <Monitor className="w-3 h-3" /> كرت الشاشة
                                  (GPU)
                                </div>
                                <input
                                  type="text"
                                  value={selectedDevice.specs?.gpu || ""}
                                  onChange={(e) =>
                                    handleUpdateSpecs({ gpu: e.target.value })
                                  }
                                  className="w-full text-sm font-black text-slate-900 bg-slate-100 px-2 py-1 rounded-md border border-slate-200"
                                />
                              </div>
                              <div className="border-b border-slate-100 pb-3 md:col-span-2">
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                                  <Layers className="w-3 h-3" /> نظام التشغيل
                                  (OS)
                                </div>
                                <input
                                  type="text"
                                  value={selectedDevice.specs?.os || ""}
                                  onChange={(e) =>
                                    handleUpdateSpecs({ os: e.target.value })
                                  }
                                  className="w-full text-sm font-black text-slate-900 bg-slate-100 px-2 py-1 rounded-md border border-slate-200"
                                />
                              </div>
                            </div>
                          </section>

                          {/* Network */}
                          <section>
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                              <Network className="w-5 h-5 text-emerald-600" />
                              الشبكة (Office Network)
                            </h3>
                            <div className="grid grid-cols-2 gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                              <div className="border-b border-slate-100 pb-3">
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                  الـ IP الداخلي
                                </div>
                                <input
                                  type="text"
                                  value={
                                    selectedDevice.network?.internalIp || ""
                                  }
                                  onChange={(e) =>
                                    handleUpdateNetwork({
                                      internalIp: e.target.value,
                                    })
                                  }
                                  className="w-full text-sm font-black text-slate-900 font-mono bg-slate-100 px-2 py-1 rounded-md"
                                />
                              </div>
                              <div className="border-b border-slate-100 pb-3">
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                  IP ثابت (Static IP)
                                </div>
                                <input
                                  type="text"
                                  value={selectedDevice.network?.staticIp || ""}
                                  onChange={(e) =>
                                    handleUpdateNetwork({
                                      staticIp: e.target.value,
                                    })
                                  }
                                  className="w-full text-sm font-black text-slate-900 font-mono bg-slate-100 px-2 py-1 rounded-md"
                                />
                              </div>
                              <div className="border-b border-slate-100 pb-3">
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                  Tailscale IP
                                </div>
                                <input
                                  type="text"
                                  value={
                                    selectedDevice.network?.tailscaleIp || ""
                                  }
                                  onChange={(e) =>
                                    handleUpdateNetwork({
                                      tailscaleIp: e.target.value,
                                    })
                                  }
                                  className="w-full text-sm font-black text-slate-900 font-mono bg-slate-100 px-2 py-1 rounded-md"
                                />
                              </div>
                              <div className="border-b border-slate-100 pb-3">
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                  ZeroTier IP
                                </div>
                                <input
                                  type="text"
                                  value={
                                    selectedDevice.network?.zeroTierIp || ""
                                  }
                                  onChange={(e) =>
                                    handleUpdateNetwork({
                                      zeroTierIp: e.target.value,
                                    })
                                  }
                                  className="w-full text-sm font-black text-slate-900 font-mono bg-slate-100 px-2 py-1 rounded-md"
                                />
                              </div>
                            </div>
                          </section>
                        </>
                      )}

                      {/* --- TAB: MAINTENANCE --- */}
                      {activeTab === "maintenance" && (
                        <section>
                          <div className="flex items-center justify-between mb-6">
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                              <Wrench className="w-5 h-5 text-emerald-600" />
                              سجل الصيانة
                            </h3>
                            <button
                              onClick={() => setIsAddMaintenanceOpen(true)}
                              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors"
                            >
                              + إضافة سجل صيانة
                            </button>
                          </div>

                          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                            {selectedDevice.maintenanceHistory &&
                            selectedDevice.maintenanceHistory.length > 0 ? (
                              selectedDevice.maintenanceHistory.map(
                                (record, idx) => (
                                  <div
                                    key={idx}
                                    className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
                                  >
                                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-slate-100 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                                      <Wrench className="w-4 h-4" />
                                    </div>
                                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
                                      {editingMaintenance &&
                                      editingMaintenance.index === idx ? (
                                        <div className="space-y-2">
                                          <input
                                            type="date"
                                            className="w-full px-2 py-1 border border-slate-200 rounded text-sm"
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
                                            className="w-full px-2 py-1 border border-slate-200 rounded text-sm"
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
                                            className="w-full px-2 py-1 border border-slate-200 rounded text-sm"
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
                                            className="w-full px-2 py-1 border border-slate-200 rounded text-sm"
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
                                              className="text-emerald-600 bg-emerald-50 px-3 py-1 rounded hover:bg-emerald-100 text-xs font-bold transition-colors"
                                            >
                                              حفظ
                                            </button>
                                            <button
                                              onClick={() =>
                                                setEditingMaintenance(null)
                                              }
                                              className="text-slate-500 bg-slate-100 px-3 py-1 rounded hover:bg-slate-200 text-xs font-bold transition-colors"
                                            >
                                              إلغاء
                                            </button>
                                          </div>
                                        </div>
                                      ) : (
                                        <>
                                          <div className="flex items-center justify-between mb-1">
                                            <div className="font-black text-slate-900 text-sm">
                                              {record.type}
                                            </div>
                                            <div className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                                              {record.date}
                                            </div>
                                          </div>
                                          <div className="text-sm font-bold text-slate-600 mb-3">
                                            {record.description}
                                          </div>
                                          <div className="flex items-center justify-between border-t border-slate-100 pt-2">
                                            <div className="text-xs font-bold text-slate-500 flex items-center gap-1">
                                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                                              الفني:{" "}
                                              <span className="text-slate-700">
                                                {record.technician}
                                              </span>
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
                                <Wrench className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                لا توجد سجلات صيانة سابقة لهذا الجهاز.
                              </div>
                            )}
                          </div>
                        </section>
                      )}
                    </div>

                    {/* Sidebar Info (Always visible in modal) */}
                    <div className="space-y-6">
                      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-2">
                          <FileText className="w-5 h-5 text-slate-400" />
                          ملخص الجهاز
                        </h3>

                        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                          <span className="text-xs font-bold text-slate-500">
                            الرقم التسلسلي
                          </span>
                          <input
                            className="text-xs font-black text-slate-900 font-mono bg-slate-100 px-2 py-1 rounded-md outline-none text-left w-32"
                            value={selectedDevice.serialNumber || ""}
                            onChange={(e) =>
                              updateDeviceMutation.mutate({
                                ...selectedDevice,
                                serialNumber: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                          <span className="text-xs font-bold text-slate-500">
                            الموقع
                          </span>
                          <input
                            className="text-xs font-black text-slate-900 outline-none text-left w-32 bg-transparent"
                            value={selectedDevice.location || ""}
                            onChange={(e) =>
                              updateDeviceMutation.mutate({
                                ...selectedDevice,
                                location: e.target.value,
                              })
                            }
                            placeholder="تعديل..."
                          />
                        </div>
                        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                          <span className="text-xs font-bold text-slate-500">
                            العهدة
                          </span>
                          <input
                            className="text-xs font-black text-slate-900 outline-none text-left w-32 bg-transparent"
                            value={selectedDevice.assignedTo || ""}
                            onChange={(e) =>
                              updateDeviceMutation.mutate({
                                ...selectedDevice,
                                assignedTo: e.target.value,
                              })
                            }
                            placeholder="اسم الموظف..."
                          />
                        </div>
                        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                          <span className="text-xs font-bold text-slate-500">
                            النظام المرتبط
                          </span>
                          <span
                            onClick={() => setIsLinkSystemModalOpen(true)}
                            className="text-xs font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-md cursor-pointer hover:bg-blue-100 transition-colors"
                          >
                            {selectedDevice.linkedSystem || "ربط بنظام..."}
                          </span>
                        </div>
                        <div className="flex justify-between items-center pt-2">
                          <span className="text-xs font-bold text-slate-500">
                            موعد الصيانة القادم
                          </span>
                          <input
                            type="date"
                            className="text-xs font-black text-amber-600 bg-amber-50 px-2 py-1 rounded-md outline-none w-32"
                            value={selectedDevice.nextMaintenanceDate || ""}
                            onChange={(e) =>
                              updateDeviceMutation.mutate({
                                ...selectedDevice,
                                nextMaintenanceDate: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>

                      {/* 💡 قسم المرفقات (Attachments) الحقيقي */}
                      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-2">
                          <FileText className="w-5 h-5 text-slate-400" />
                          المرفقات والمستندات
                        </h3>
                        <div className="space-y-2">
                          {selectedDevice.invoiceAttachment ? (
                            <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl hover:border-emerald-200 transition-colors group">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-white rounded-lg shadow-sm text-blue-600">
                                  <FileText className="w-4 h-4" />
                                </div>
                                <div>
                                  <div className="text-xs font-black text-slate-900">
                                    مرفق الجهاز (الضمان/الفاتورة)
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
                                {/* 🚀 التعديل هنا: استخدام دالة getFullUrl */}
                                <a
                                  href={getFullUrl(
                                    selectedDevice.invoiceAttachment,
                                  )}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-2 text-slate-400 hover:text-emerald-600 transition-colors"
                                  title="تحميل / عرض"
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
                                  className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                                  title="حذف المرفق"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="text-xs text-slate-400 font-bold text-center py-3 border border-dashed border-slate-200 rounded-xl bg-slate-50">
                              لا توجد مرفقات مرتبطة بهذا الجهاز
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
                            className="w-full py-2.5 border-2 border-dashed border-slate-200 text-slate-500 rounded-xl font-bold hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all text-sm flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
                          >
                            {uploadAttachmentMutation.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <UploadCloud className="w-4 h-4" />
                            )}
                            {uploadAttachmentMutation.isPending
                              ? "جاري رفع المرفق..."
                              : "إضافة مرفق جديد"}
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
      {/* 🚀 Sub-Modals (Sticker, Maintenance, Consumable, Link) */}
      {/* ========================================== */}

      {/* Add Consumable Modal */}
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

      {/* Add Maintenance Modal */}
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

      {/* Link System Modal */}
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

      {/* Sticker Print Modal */}
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
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-emerald-600" /> معاينة ملصق
                  الجهاز (Sticker)
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
                  onClick={() => {
                    toast.success("تم إرسال أمر الطباعة بنجاح");
                    setIsStickerModalOpen(false);
                  }}
                  className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-black hover:bg-slate-800 transition-all flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" /> تأكيد الطباعة
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add New Device Modal (The Big One) */}
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
                      <Plus className="w-6 h-6 text-emerald-600" /> إضافة جهاز
                      أو أصل جديد
                    </>
                  ) : (
                    <>
                      <Edit className="w-6 h-6 text-blue-600" /> تعديل بيانات
                      الجهاز
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
                          نوع الجهاز *
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
                          <option value="Computer">كمبيوتر</option>
                          <option value="Server">خادم</option>
                          <option value="Printer">طابعة</option>
                          <option value="Network">جهاز شبكة</option>
                          <option value="Camera">كاميرا</option>
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
                        <input
                          type="text"
                          value={deviceForm.assignedTo}
                          onChange={(e) =>
                            setDeviceForm({
                              ...deviceForm,
                              assignedTo: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5">
                          الموقع
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

                  {/* Specs */}
                  {(deviceForm.type === "Computer" ||
                    deviceForm.type === "Server") && (
                    <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Cpu className="w-5 h-5 text-emerald-600" /> المواصفات
                        التقنية
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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

                  {/* Network & Purchase */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Network className="w-5 h-5 text-emerald-600" /> الشبكة
                      </h3>
                      <div className="space-y-4">
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
                            عنوان MAC
                          </label>
                          <input
                            type="text"
                            value={deviceForm.network?.mac || ""}
                            onChange={(e) =>
                              setDeviceForm({
                                ...deviceForm,
                                network: {
                                  ...deviceForm.network,
                                  mac: e.target.value,
                                },
                              })
                            }
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold font-mono focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                      </div>
                    </section>
                    <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-emerald-600" />{" "}
                        الشراء والضمان
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1.5">
                            تاريخ الشراء
                          </label>
                          <input
                            type="date"
                            value={deviceForm.purchaseDate || ""}
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
                            نهاية الضمان
                          </label>
                          <input
                            type="date"
                            value={deviceForm.warrantyEnd || ""}
                            onChange={(e) =>
                              setDeviceForm({
                                ...deviceForm,
                                warrantyEnd: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                      </div>
                    </section>
                  </div>
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
                  className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-black hover:bg-emerald-500 transition-all shadow-md active:scale-95 flex items-center gap-2 disabled:opacity-50"
                >
                  {addDeviceMutation.isPending ||
                  updateDeviceMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {deviceModalMode === "add"
                    ? "حفظ وإضافة الجهاز"
                    : "تحديث بيانات الجهاز"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
