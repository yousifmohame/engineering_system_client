import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Monitor, Printer, Server, Smartphone, Video, Wifi, Lock, 
  Search, Plus, Filter, Download, MoreVertical, ShieldCheck, 
  AlertTriangle, Settings, BrainCircuit, X, QrCode, FileText,
  Activity, Wrench, Calendar, CheckCircle2, Package, Network,
  UploadCloud, Save, Trash2, Edit, Info, DollarSign, User, Cpu, HardDrive, Layers, ChevronRight, AlertOctagon
} from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { clsx } from 'clsx';
import { toast } from 'sonner';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}
// Mock Data
const initialDevices = [
  {
    id: 'DEV-001',
    type: 'Computer',
    name: 'جهاز م. أحمد',
    brand: 'Dell',
    model: 'OptiPlex 7090',
    serialNumber: 'DL-7090-X12',
    status: 'Active',
    location: 'مكتب 101',
    assignedTo: 'أحمد محمود',
    purchaseDate: '2023-01-15',
    purchasePrice: '3500',
    vendor: 'جرير',
    invoiceAttachment: 'invoice_dev001.pdf',
    nextMaintenanceDate: '2024-06-15',
    warrantyEnd: '2026-01-15',
    consumables: [],
    network: {
      internalIp: '192.168.1.101',
      tailscaleIp: '100.115.92.1',
      zeroTierIp: '10.147.20.5',
      domain: 'pc-ahmed.internal.details.com'
    },
    specs: {
      cpu: 'Intel Core i7-11700',
      ram: '16GB DDR4',
      storage: '512GB NVMe SSD',
      gpu: 'Intel UHD Graphics 750',
      os: 'Windows 11 Pro',
      chassisNumber: 'CH-99887766'
    },
    customFields: [
      { name: 'المعالج', value: 'Intel Core i7-11700' },
      { name: 'الذاكرة', value: '16GB RAM' },
      { name: 'التخزين', value: '512GB NVMe SSD' }
    ],
    maintenanceHistory: [
      { date: '2023-06-15', type: 'صيانة دورية', description: 'تنظيف الجهاز وتحديث النظام', technician: 'فريق الدعم' },
      { date: '2023-12-10', type: 'ترقية', description: 'زيادة الذاكرة العشوائية إلى 16GB', technician: 'خالد' }
    ],
    aiInsights: {
      healthScore: 92,
      maintenancePrediction: 'لا توجد مشاكل متوقعة قريباً.',
      anomalies: []
    }
  },
  {
    id: 'DEV-002',
    type: 'Printer',
    name: 'طابعة الإدارة',
    brand: 'HP',
    model: 'LaserJet Pro M404dn',
    serialNumber: 'VNC3F12345',
    status: 'Warning',
    location: 'ممر الإدارة',
    assignedTo: 'عام',
    purchaseDate: '2022-05-20',
    purchasePrice: '1200',
    vendor: 'إكسترا',
    invoiceAttachment: 'invoice_dev002.pdf',
    nextMaintenanceDate: '2024-05-20',
    warrantyEnd: '2024-05-20',
    consumables: [
      { name: 'حبر أسود', status: 'منخفض', validity: '15%' },
      { name: 'درام (Drum)', status: 'جيد', validity: '60%' }
    ],
    network: {
      internalIp: '192.168.1.55',
      tailscaleIp: '',
      zeroTierIp: '',
      domain: 'printer-admin.local'
    },
    specs: {
      cpu: '800 MHz',
      ram: '256 MB',
      storage: 'N/A'
    },
    customFields: [],
    maintenanceHistory: [
      { date: '2023-05-20', type: 'تغيير حبر', description: 'تم استبدال خرطوشة الحبر الأسود', technician: 'فريق الدعم' },
      { date: '2023-11-15', type: 'صيانة دورية', description: 'تنظيف البكرات', technician: 'خالد' }
    ],
    aiInsights: {
      healthScore: 65,
      maintenancePrediction: 'متوقع نفاذ الحبر خلال 3 أيام بناءً على معدل الاستهلاك الحالي.',
      anomalies: ['استهلاك حبر أعلى من المعتاد في الأسبوع الماضي']
    }
  },
  {
    id: 'DEV-003',
    type: 'Camera',
    name: 'كاميرا المدخل الرئيسي',
    brand: 'Hikvision',
    model: 'DS-2CD2043G0-I',
    serialNumber: 'HK-2023-9988',
    status: 'Active',
    location: 'المدخل الرئيسي',
    assignedTo: 'الأمن',
    purchaseDate: '2023-11-10',
    purchasePrice: '450',
    vendor: 'مؤسسة الأنظمة الأمنية',
    invoiceAttachment: 'invoice_dev003.pdf',
    nextMaintenanceDate: '2024-11-10',
    warrantyEnd: '2025-11-10',
    consumables: [],
    network: {
      internalIp: '192.168.1.110',
      tailscaleIp: '100.115.92.10',
      zeroTierIp: '',
      domain: 'cam-main.internal.details.com'
    },
    specs: {
      cpu: 'ARM Cortex-A7',
      ram: '512 MB',
      storage: 'MicroSD 128GB'
    },
    customFields: [
      { name: 'الدقة', value: '4MP' }
    ],
    maintenanceHistory: [],
    aiInsights: {
      healthScore: 98,
      maintenancePrediction: 'تعمل بكفاءة عالية.',
      anomalies: []
    }
  }
];

const categories = [
  { id: 'All', label: 'الكل', icon: Package },
  { id: 'Computer', label: 'أجهزة كمبيوتر', icon: Monitor },
  { id: 'Printer', label: 'طابعات', icon: Printer },
  { id: 'Server', label: 'خوادم', icon: Server },
  { id: 'Camera', label: 'كاميرات', icon: Video },
  { id: 'Network', label: 'شبكات', icon: Wifi },
];

export default function DevicesMain() {
  const [devices, setDevices] = useState(initialDevices);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isStickerModalOpen, setIsStickerModalOpen] = useState(false);
  const [isAddMaintenanceOpen, setIsAddMaintenanceOpen] = useState(false);
  const [newMaintenance, setNewMaintenance] = useState({ date: '', type: '', description: '', technician: '' });
  const [editingMaintenance, setEditingMaintenance] = useState(null);
  const [isAddConsumableOpen, setIsAddConsumableOpen] = useState(false);
  const [newConsumable, setNewConsumable] = useState({ name: '', status: 'جيد', validity: '' });
  const [isLinkSystemModalOpen, setIsLinkSystemModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('info');

  const [newDevice, setNewDevice] = useState({
    name: '', type: 'Computer', brand: '', model: '', serialNumber: '',
    status: 'Active', location: '', assignedTo: '', purchaseDate: '',
    purchasePrice: '', vendor: '', warrantyEnd: '',
    specs: { cpu: '', ram: '', storage: '', gpu: '', os: '', chassisNumber: '' },
    network: { internalIp: '', mac: '', tailscaleIp: '', zeroTierIp: '', domain: '' }
  });

  const handleAddDevice = (e) => {
    e.preventDefault();
    const newId = `DEV-${String(devices.length + 1).padStart(3, '0')}`;
    const deviceToAdd = {
      ...newDevice,
      id: newId,
      invoiceAttachment: '',
      nextMaintenanceDate: '',
      consumables: [],
      customFields: [],
      maintenanceHistory: [],
      aiInsights: { healthScore: 100, maintenancePrediction: 'جهاز جديد', anomalies: [] }
    };
    setDevices([deviceToAdd, ...devices]);
    setIsAddModalOpen(false);
    // Reset form
    setNewDevice({
      name: '', type: 'Computer', brand: '', model: '', serialNumber: '',
      status: 'Active', location: '', assignedTo: '', purchaseDate: '',
      purchasePrice: '', vendor: '', warrantyEnd: '',
      specs: { cpu: '', ram: '', storage: '', gpu: '', os: '', chassisNumber: '' },
      network: { internalIp: '', mac: '', tailscaleIp: '', zeroTierIp: '', domain: '' }
    });
  };

  const handleStatusChange = (deviceId, newStatus) => {
    setDevices(prevDevices => 
      prevDevices.map(device => 
        device.id === deviceId ? { ...device, status: newStatus } : device
      )
    );
    if (selectedDevice && selectedDevice.id === deviceId) {
      setSelectedDevice({ ...selectedDevice, status: newStatus });
    }
  };

  const handleSaveMaintenance = (deviceId, index) => {
    if (editingMaintenance) {
      const updatedDevice = {
        ...selectedDevice,
        maintenanceHistory: selectedDevice.maintenanceHistory.map((m, i) => i === index ? { date: editingMaintenance.date, type: editingMaintenance.type, description: editingMaintenance.description, technician: editingMaintenance.technician } : m)
      };
      setSelectedDevice(updatedDevice);
      setDevices(prev => prev.map(d => d.id === updatedDevice.id ? updatedDevice : d));
      setEditingMaintenance(null);
      toast.success('تم تحديث سجل الصيانة بنجاح');
    }
  };

  const handleDeleteMaintenance = (deviceId, index) => {
    const updatedDevice = {
      ...selectedDevice,
      maintenanceHistory: selectedDevice.maintenanceHistory.filter((_, i) => i !== index)
    };
    setSelectedDevice(updatedDevice);
    setDevices(prev => prev.map(d => d.id === updatedDevice.id ? updatedDevice : d));
    toast.success('تم حذف سجل الصيانة بنجاح');
  };

  const handleUpdateNetwork = (deviceId, networkUpdates) => {
    setDevices(prevDevices => 
      prevDevices.map(device => 
        device.id === deviceId ? { ...device, network: { ...device.network, ...networkUpdates } } : device
      )
    );
    if (selectedDevice && selectedDevice.id === deviceId) {
      setSelectedDevice({ ...selectedDevice, network: { ...selectedDevice.network, ...networkUpdates } });
    }
  };

  const filteredDevices = devices.filter(device => {
    const matchesSearch = device.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          device.serialNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || device.type === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getDeviceIcon = (type, className = "w-6 h-6") => {
    switch (type) {
      case 'Computer': return <Monitor className={className} />;
      case 'Printer': return <Printer className={className} />;
      case 'Server': return <Server className={className} />;
      case 'Camera': return <Video className={className} />;
      case 'Network': return <Wifi className={className} />;
      default: return <Package className={className} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Warning': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Offline': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Name', 'Type', 'Brand', 'Model', 'Serial Number', 'Status', 'Location', 'Assigned To'];
    const csvContent = [
      headers.join(','),
      ...devices.map(d => [
        d.id, d.name, d.type, d.brand, d.model, d.serialNumber, d.status, d.location, d.assignedTo
      ].map(val => `"${val || ''}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `devices_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('تم تصدير التقرير بنجاح');
  };

  const handleDeleteDevice = (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الجهاز؟')) {
      setDevices(devices.filter(d => d.id !== id));
      if (selectedDevice?.id === id) setSelectedDevice(null);
      toast.success('تم حذف الجهاز بنجاح');
    }
  };

  const handleAddMaintenanceSubmit = (e) => {
    e.preventDefault();
    if (!selectedDevice) return;
    
    const updatedDevice = {
      ...selectedDevice,
      maintenanceHistory: [newMaintenance, ...selectedDevice.maintenanceHistory]
    };
    
    setDevices(devices.map(d => d.id === selectedDevice.id ? updatedDevice : d));
    setSelectedDevice(updatedDevice);
    setIsAddMaintenanceOpen(false);
    setNewMaintenance({ date: '', type: '', description: '', technician: '' });
    toast.success('تمت إضافة سجل الصيانة بنجاح');
  };

  const handleAddConsumableSubmit = (e) => {
    e.preventDefault();
    if (!selectedDevice) return;
    
    const updatedDevice = {
      ...selectedDevice,
      consumables: [...selectedDevice.consumables, newConsumable]
    };
    
    setDevices(devices.map(d => d.id === selectedDevice.id ? updatedDevice : d));
    setSelectedDevice(updatedDevice);
    setIsAddConsumableOpen(false);
    setNewConsumable({ name: '', status: 'جيد', validity: '' });
    toast.success('تمت إضافة المستهلك بنجاح');
  };

  const handleLinkSystemSubmit = (e) => {
    e.preventDefault();
    setIsLinkSystemModalOpen(false);
    toast.success('تم ربط النظام بنجاح');
  };

  return (
    <div className="h-full overflow-y-auto bg-slate-50/50 p-4 sm:p-8 custom-scrollbar">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">إدارة الأجهزة والأصول</h1>
          <p className="text-sm font-bold text-slate-500 mt-1">تتبع الأجهزة، الصيانة، طباعة الملصقات، وإدارة العهد</p>
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
            onClick={() => setIsAddModalOpen(true)}
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
            <span className="text-sm font-black text-slate-700 uppercase tracking-wider">إجمالي الأجهزة</span>
          </div>
          <div className="text-3xl font-black text-slate-900">342</div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-center relative overflow-hidden group hover:border-emerald-300 transition-colors">
          <div className="absolute top-0 right-0 w-1 h-full bg-emerald-500" />
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <span className="text-sm font-black text-slate-700 uppercase tracking-wider">أجهزة تعمل بكفاءة</span>
          </div>
          <div className="text-3xl font-black text-slate-900">315</div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-center relative overflow-hidden group hover:border-amber-300 transition-colors">
          <div className="absolute top-0 right-0 w-1 h-full bg-amber-500" />
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
              <Wrench className="w-6 h-6" />
            </div>
            <span className="text-sm font-black text-slate-700 uppercase tracking-wider">تتطلب صيانة</span>
          </div>
          <div className="text-3xl font-black text-slate-900">12</div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-center relative overflow-hidden group hover:border-red-300 transition-colors">
          <div className="absolute top-0 right-0 w-1 h-full bg-red-500" />
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-red-50 text-red-600 rounded-xl">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <span className="text-sm font-black text-slate-700 uppercase tracking-wider">خارج الضمان</span>
          </div>
          <div className="text-3xl font-black text-slate-900">45</div>
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
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                "px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 border",
                selectedCategory === cat.id 
                  ? "bg-slate-900 text-white border-slate-900 shadow-md" 
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
              )}
            >
              <cat.icon className={cn("w-4 h-4", selectedCategory === cat.id ? "text-emerald-400" : "text-slate-400")} />
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Devices Grid */}
      <div className="pb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {filteredDevices.map(device => (
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
                    <div className="text-[10px] font-bold text-slate-500 mt-0.5">{device.brand} {device.model}</div>
                  </div>
                </div>
                <div className="relative flex items-center">
                  {device.status === 'Active' && <CheckCircle2 className="w-4 h-4 text-emerald-500 absolute right-2 pointer-events-none" />}
                  {device.status === 'Warning' && <AlertTriangle className="w-4 h-4 text-amber-500 absolute right-2 pointer-events-none" />}
                  {device.status === 'Offline' && <AlertOctagon className="w-4 h-4 text-red-500 absolute right-2 pointer-events-none" />}
                  <select
                    value={device.status}
                    onChange={(e) => handleStatusChange(device.id, e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className={cn(
                      "pl-2.5 pr-7 py-1 rounded-lg text-[10px] font-black border shadow-sm outline-none cursor-pointer appearance-none text-center", 
                      getStatusColor(device.status)
                    )}
                  >
                    <option value="Active">نشط</option>
                    <option value="Warning">تحذير</option>
                    <option value="Offline">متوقف</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3 mb-6 flex-1">
                <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-2">
                  <span className="text-slate-500 font-bold">الرقم التسلسلي</span>
                  <span className="font-mono font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">{device.serialNumber}</span>
                </div>
                <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-2">
                  <span className="text-slate-500 font-bold">الموقع</span>
                  <span className="font-bold text-slate-900">{device.location}</span>
                </div>
                <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-2">
                  <span className="text-slate-500 font-bold">العهدة</span>
                  <span className="font-bold text-slate-900">{device.assignedTo}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setSelectedDevice(device); setIsStickerModalOpen(true); }}
                    className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors"
                    title="طباعة ستيكر"
                  >
                    <QrCode className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); toast.info('جاري فتح نافذة تعديل الجهاز...'); }}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                    title="تعديل"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  
                  {/* Quick Actions */}
                  <div className="relative group">
                    <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors" onClick={(e) => e.stopPropagation()}>
                      <MoreVertical className="w-5 h-5" />
                    </button>
                    <div className="absolute right-0 bottom-full mb-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => { setSelectedDevice(device); setIsAddMaintenanceOpen(true); }} className="w-full text-right px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-emerald-600 flex items-center gap-2">
                        <Wrench className="w-4 h-4" /> تسجيل صيانة
                      </button>
                      <button onClick={() => toast.info('جاري فتح نافذة نقل العهدة...')} className="w-full text-right px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-emerald-600 flex items-center gap-2">
                        <User className="w-4 h-4" /> نقل العهدة
                      </button>
                      <button onClick={() => handleDeleteDevice(device.id)} className="w-full text-right px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-slate-100">
                        <Trash2 className="w-4 h-4" /> حذف الجهاز
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                  <ShieldCheck className={cn("w-4 h-4", new Date(device.warrantyEnd) > new Date() ? "text-emerald-500" : "text-red-500")} />
                  {new Date(device.warrantyEnd) > new Date() ? 'الضمان ساري' : 'منتهي الضمان'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Device Details Modal */}
      <AnimatePresence>
        {selectedDevice && !isStickerModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
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
                    <h2 className="text-2xl font-black text-slate-900">{selectedDevice.name}</h2>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-sm font-bold text-slate-500">{selectedDevice.brand} {selectedDevice.model}</p>
                      <select
                        value={selectedDevice.status}
                        onChange={(e) => handleStatusChange(selectedDevice.id, e.target.value)}
                        className={cn(
                          "px-2 py-0.5 rounded-md text-[10px] font-black border outline-none cursor-pointer appearance-none text-center", 
                          getStatusColor(selectedDevice.status)
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
                    onClick={() => setIsStickerModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-md active:scale-95"
                  >
                    <QrCode className="w-4 h-4" />
                    طباعة ستيكر
                  </button>
                  <div className="w-px h-8 bg-slate-200 mx-1" />
                  <button onClick={() => setSelectedDevice(null)} className="p-2.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 rounded-full transition-colors">
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Modal Tabs */}
              <div className="flex items-center gap-6 px-8 border-b border-slate-100 bg-white">
                {[
                  { id: 'info', label: 'المعلومات الأساسية', icon: Info },
                  { id: 'network', label: 'الشبكة والمواصفات', icon: Network },
                  { id: 'maintenance', label: 'سجل الصيانة', icon: Wrench },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "py-4 text-sm font-black border-b-2 transition-colors flex items-center gap-2",
                      activeTab === tab.id ? "border-emerald-500 text-emerald-600" : "border-transparent text-slate-500 hover:text-slate-800"
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
                    
                    {activeTab === 'info' && (
                      <>
                        {/* AI Insights */}
                        <div className={cn(
                          "p-6 rounded-2xl border flex items-start gap-5 relative overflow-hidden",
                          selectedDevice.aiInsights.healthScore < 70 ? "bg-amber-50 border-amber-200" : "bg-emerald-50 border-emerald-200"
                        )}>
                          <div className={cn(
                            "absolute top-0 right-0 w-2 h-full",
                            selectedDevice.aiInsights.healthScore < 70 ? "bg-amber-500" : "bg-emerald-500"
                          )} />
                          <div className={cn(
                            "p-3 rounded-xl bg-white shadow-sm border",
                            selectedDevice.aiInsights.healthScore < 70 ? "border-amber-100" : "border-emerald-100"
                          )}>
                            <BrainCircuit className={cn(
                              "w-6 h-6",
                              selectedDevice.aiInsights.healthScore < 70 ? "text-amber-600" : "text-emerald-600"
                            )} />
                          </div>
                          <div>
                            <h3 className={cn(
                              "text-sm font-black mb-2 flex items-center gap-2",
                              selectedDevice.aiInsights.healthScore < 70 ? "text-amber-800" : "text-emerald-800"
                            )}>
                              تحليل الحالة الذكي
                              <span className="px-2 py-0.5 bg-white/50 rounded-md text-[10px] font-black border border-black/5">
                                الكفاءة: {selectedDevice.aiInsights.healthScore}%
                              </span>
                            </h3>
                            <p className={cn(
                              "text-sm font-bold leading-relaxed",
                              selectedDevice.aiInsights.healthScore < 70 ? "text-amber-700" : "text-emerald-700"
                            )}>
                              {selectedDevice.aiInsights.maintenancePrediction}
                            </p>
                            {selectedDevice.aiInsights.anomalies.length > 0 && (
                              <ul className="mt-3 space-y-1">
                                {selectedDevice.aiInsights.anomalies.map((anomaly, idx) => (
                                  <li key={idx} className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                                    <AlertTriangle className="w-3 h-3" />
                                    {anomaly}
                                  </li>
                                ))}
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
                              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">تاريخ الشراء</div>
                              <div className="text-sm font-black text-slate-900">{selectedDevice.purchaseDate}</div>
                            </div>
                            <div className="border-b border-slate-100 pb-3">
                              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">سعر الشراء</div>
                              <div className="text-sm font-black text-slate-900">${selectedDevice.purchasePrice}</div>
                            </div>
                            <div className="border-b border-slate-100 pb-3">
                              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">المورد</div>
                              <div className="text-sm font-black text-slate-900">{selectedDevice.vendor}</div>
                            </div>
                            <div className="border-b border-slate-100 pb-3">
                              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">نهاية الضمان</div>
                              <div className="text-sm font-black text-slate-900 flex items-center gap-2">
                                {selectedDevice.warrantyEnd}
                                <ShieldCheck className={cn("w-4 h-4", new Date(selectedDevice.warrantyEnd) > new Date() ? "text-emerald-500" : "text-red-500")} />
                              </div>
                            </div>
                          </div>
                        </section>

                        {/* Technical Specifications */}
                        {selectedDevice.specs && (
                          <section>
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                              <Cpu className="w-5 h-5 text-emerald-600" />
                              المواصفات التقنية
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                              {selectedDevice.specs.cpu && (
                                <div className="border-b border-slate-100 pb-3">
                                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1"><Cpu className="w-3 h-3" /> المعالج (CPU)</div>
                                  <input 
                                    type="text"
                                    value={selectedDevice.specs.cpu}
                                    onChange={(e) => {
                                      const updatedDevice = { ...selectedDevice, specs: { ...selectedDevice.specs, cpu: e.target.value } };
                                      setSelectedDevice(updatedDevice);
                                      setDevices(prev => prev.map(d => d.id === updatedDevice.id ? updatedDevice : d));
                                    }}
                                    className="w-full text-sm font-black text-slate-900 bg-slate-100 px-2 py-1 rounded-md border border-slate-200"
                                  />
                                </div>
                              )}
                              {selectedDevice.specs.ram && (
                                <div className="border-b border-slate-100 pb-3">
                                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1"><Activity className="w-3 h-3" /> الذاكرة (RAM)</div>
                                  <input 
                                    type="text"
                                    value={selectedDevice.specs.ram}
                                    onChange={(e) => {
                                      const updatedDevice = { ...selectedDevice, specs: { ...selectedDevice.specs, ram: e.target.value } };
                                      setSelectedDevice(updatedDevice);
                                      setDevices(prev => prev.map(d => d.id === updatedDevice.id ? updatedDevice : d));
                                    }}
                                    className="w-full text-sm font-black text-slate-900 bg-slate-100 px-2 py-1 rounded-md border border-slate-200"
                                  />
                                </div>
                              )}
                              {selectedDevice.specs.storage && (
                                <div className="border-b border-slate-100 pb-3">
                                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1"><HardDrive className="w-3 h-3" /> {selectedDevice.type === 'Computer' ? 'SSD/HDD' : 'التخزين (Storage)'}</div>
                                  <input 
                                    type="text"
                                    value={selectedDevice.specs.storage}
                                    onChange={(e) => {
                                      const updatedDevice = { ...selectedDevice, specs: { ...selectedDevice.specs, storage: e.target.value } };
                                      setSelectedDevice(updatedDevice);
                                      setDevices(prev => prev.map(d => d.id === updatedDevice.id ? updatedDevice : d));
                                    }}
                                    className="w-full text-sm font-black text-slate-900 bg-slate-100 px-2 py-1 rounded-md border border-slate-200"
                                  />
                                </div>
                              )}
                              {selectedDevice.specs.gpu && (
                                <div className="border-b border-slate-100 pb-3">
                                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1"><Monitor className="w-3 h-3" /> كرت الشاشة (GPU)</div>
                                  <div className="text-sm font-black text-slate-900">{selectedDevice.specs.gpu}</div>
                                </div>
                              )}
                              {selectedDevice.specs.os && (
                                <div className="border-b border-slate-100 pb-3">
                                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1"><Layers className="w-3 h-3" /> نظام التشغيل (OS)</div>
                                  <div className="text-sm font-black text-slate-900">{selectedDevice.specs.os}</div>
                                </div>
                              )}
                              {selectedDevice.type === 'Computer' && (
                                <div className="border-b border-slate-100 pb-3">
                                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1"><Cpu className="w-3 h-3" /> رقم الهيكل (Chassis)</div>
                                  <input 
                                    type="text"
                                    value={selectedDevice.specs.chassisNumber || ''}
                                    onChange={(e) => {
                                      const updatedDevice = {
                                        ...selectedDevice,
                                        specs: { ...selectedDevice.specs, chassisNumber: e.target.value }
                                      };
                                      setSelectedDevice(updatedDevice);
                                      setDevices(prev => prev.map(d => d.id === updatedDevice.id ? updatedDevice : d));
                                    }}
                                    className="w-full text-sm font-black text-slate-900 bg-slate-100 px-2 py-1 rounded-md border border-slate-200"
                                    placeholder="أدخل رقم الهيكل"
                                  />
                                </div>
                              )}
                            </div>
                          </section>
                        )}

                        {/* Consumables */}
                        {selectedDevice.consumables && selectedDevice.consumables.length > 0 && (
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
                            
                            {isAddConsumableOpen && (
                              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-4 space-y-3">
                                <div className="grid grid-cols-3 gap-3">
                                  <input type="text" placeholder="اسم الجزء (مثال: حبر أزرق)" className="px-3 py-2 border border-slate-200 rounded-lg text-sm" value={newConsumable.name} onChange={e => setNewConsumable({...newConsumable, name: e.target.value})} />
                                  <select className="px-3 py-2 border border-slate-200 rounded-lg text-sm" value={newConsumable.status} onChange={e => setNewConsumable({...newConsumable, status: e.target.value})}>
                                    <option value="جيد">جيد</option>
                                    <option value="منخفض">منخفض</option>
                                    <option value="حرج">حرج</option>
                                  </select>
                                  <input type="text" placeholder="الصلاحية (مثال: 80%)" className="px-3 py-2 border border-slate-200 rounded-lg text-sm" value={newConsumable.validity} onChange={e => setNewConsumable({...newConsumable, validity: e.target.value})} />
                                </div>
                                <div className="flex justify-end gap-2">
                                  <button onClick={() => setIsAddConsumableOpen(false)} className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">إلغاء</button>
                                  <button 
                                    onClick={() => {
                                      if(newConsumable.name) {
                                        const updatedDevice = {
                                          ...selectedDevice,
                                          consumables: [...(selectedDevice.consumables || []), { ...newConsumable }]
                                        };
                                        setSelectedDevice(updatedDevice);
                                        setDevices(prev => prev.map(d => d.id === updatedDevice.id ? updatedDevice : d));
                                        setIsAddConsumableOpen(false);
                                        setNewConsumable({ name: '', status: 'جيد', validity: '' });
                                      }
                                    }} 
                                    className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
                                  >
                                    إضافة
                                  </button>
                                </div>
                              </div>
                            )}

                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                              <table className="w-full text-right">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                  <tr>
                                    <th className="px-4 py-3 text-xs font-black text-slate-500 uppercase">الجزء</th>
                                    <th className="px-4 py-3 text-xs font-black text-slate-500 uppercase">الحالة</th>
                                    <th className="px-4 py-3 text-xs font-black text-slate-500 uppercase">الصلاحية المتبقية</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                  {selectedDevice.consumables.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                      <td className="px-4 py-3 text-sm font-bold text-slate-900">{item.name}</td>
                                      <td className="px-4 py-3">
                                        <span className={cn(
                                          "px-2 py-1 rounded-md text-[10px] font-black border",
                                          item.status === 'جيد' ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"
                                        )}>
                                          {item.status}
                                        </span>
                                      </td>
                                      <td className="px-4 py-3 text-sm font-bold text-slate-600">{item.validity}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </section>
                        )}
                      </>
                    )}

                    {activeTab === 'network' && (
                      <>
                        {/* Network Info */}
                        {selectedDevice.network && (
                          <section>
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                              <Network className="w-5 h-5 text-emerald-600" />
                              إعدادات الشبكة (Office Network)
                            </h3>
                            <div className="grid grid-cols-2 gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                              <div className="border-b border-slate-100 pb-3">
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">الـ IP الداخلي</div>
                                <div className="text-sm font-black text-slate-900 font-mono bg-slate-100 px-2 py-1 rounded-md inline-block">{selectedDevice.network.internalIp || '-'}</div>
                              </div>
                              <div className="border-b border-slate-100 pb-3">
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">IP ثابت (Static IP)</div>
                                <input 
                                  type="text" 
                                  value={selectedDevice.network.staticIp || ''} 
                                  onChange={(e) => handleUpdateNetwork(selectedDevice.id, { staticIp: e.target.value })}
                                  className="w-full text-sm font-black text-slate-900 font-mono bg-slate-100 px-2 py-1 rounded-md"
                                  placeholder="0.0.0.0"
                                />
                              </div>
                              <div className="border-b border-slate-100 pb-3">
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Tailscale IP</div>
                                <div className="text-sm font-black text-slate-900 font-mono bg-slate-100 px-2 py-1 rounded-md inline-block">{selectedDevice.network.tailscaleIp || '-'}</div>
                              </div>
                              <div className="border-b border-slate-100 pb-3">
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">ZeroTier IP</div>
                                <div className="text-sm font-black text-slate-900 font-mono bg-slate-100 px-2 py-1 rounded-md inline-block">{selectedDevice.network.zeroTierIp || '-'}</div>
                              </div>
                              <div className="border-b border-slate-100 pb-3">
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">النطاق (Domain)</div>
                                <div className="text-sm font-black text-slate-900 font-mono bg-slate-100 px-2 py-1 rounded-md inline-block">{selectedDevice.network.domain || '-'}</div>
                              </div>
                            </div>
                          </section>
                        )}

                        {/* Custom Fields */}
                        {selectedDevice.customFields && selectedDevice.customFields.length > 0 && (
                          <section>
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                              <Settings className="w-5 h-5 text-emerald-600" />
                              المواصفات الفنية
                            </h3>
                            <div className="grid grid-cols-2 gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                              {selectedDevice.customFields.map((field, idx) => (
                                <div key={idx} className="border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{field.name}</div>
                                  <div className="text-sm font-black text-slate-900">{field.value}</div>
                                </div>
                              ))}
                            </div>
                          </section>
                        )}
                      </>
                    )}

                    {activeTab === 'maintenance' && (
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
                        
                        {isAddMaintenanceOpen && (
                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                              <input type="date" className="px-3 py-2 border border-slate-200 rounded-lg text-sm" value={newMaintenance.date} onChange={e => setNewMaintenance({...newMaintenance, date: e.target.value})} />
                              <input type="text" placeholder="نوع الصيانة (مثال: دورية، ترقية)" className="px-3 py-2 border border-slate-200 rounded-lg text-sm" value={newMaintenance.type} onChange={e => setNewMaintenance({...newMaintenance, type: e.target.value})} />
                            </div>
                            <input type="text" placeholder="وصف الصيانة" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" value={newMaintenance.description} onChange={e => setNewMaintenance({...newMaintenance, description: e.target.value})} />
                            <input type="text" placeholder="اسم الفني" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" value={newMaintenance.technician} onChange={e => setNewMaintenance({...newMaintenance, technician: e.target.value})} />
                            <div className="flex justify-end gap-2">
                              <button onClick={() => setIsAddMaintenanceOpen(false)} className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">إلغاء</button>
                              <button 
                                onClick={() => {
                                  if(newMaintenance.date && newMaintenance.type) {
                                    const updatedDevice = {
                                      ...selectedDevice,
                                      maintenanceHistory: [{ ...newMaintenance }, ...(selectedDevice.maintenanceHistory || [])]
                                    };
                                    setSelectedDevice(updatedDevice);
                                    setDevices(prev => prev.map(d => d.id === updatedDevice.id ? updatedDevice : d));
                                    setIsAddMaintenanceOpen(false);
                                    setNewMaintenance({ date: '', type: '', description: '', technician: '' });
                                    toast.success('تمت إضافة سجل الصيانة بنجاح');
                                  }
                                }} 
                                className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
                              >
                                حفظ السجل
                              </button>
                            </div>
                          </div>
                        )}

                        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                          {selectedDevice.maintenanceHistory && selectedDevice.maintenanceHistory.length > 0 ? (
                            selectedDevice.maintenanceHistory.map((record, idx) => (
                              <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-slate-100 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                                  <Wrench className="w-4 h-4" />
                                </div>
                                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl border border-slate-200 bg-white shadow-sm">
                                  {editingMaintenance && editingMaintenance.index === idx ? (
                                    <div className="space-y-2">
                                      <input type="date" className="w-full px-2 py-1 border border-slate-200 rounded text-sm" value={editingMaintenance.date} onChange={e => setEditingMaintenance({...editingMaintenance, date: e.target.value})} />
                                      <input type="text" className="w-full px-2 py-1 border border-slate-200 rounded text-sm" value={editingMaintenance.type} onChange={e => setEditingMaintenance({...editingMaintenance, type: e.target.value})} />
                                      <input type="text" className="w-full px-2 py-1 border border-slate-200 rounded text-sm" value={editingMaintenance.description} onChange={e => setEditingMaintenance({...editingMaintenance, description: e.target.value})} />
                                      <input type="text" className="w-full px-2 py-1 border border-slate-200 rounded text-sm" value={editingMaintenance.technician} onChange={e => setEditingMaintenance({...editingMaintenance, technician: e.target.value})} />
                                      <div className="flex justify-end gap-2">
                                        <button onClick={() => handleSaveMaintenance(selectedDevice.id, idx)} className="text-emerald-600 hover:text-emerald-700 text-xs font-bold">حفظ</button>
                                        <button onClick={() => setEditingMaintenance(null)} className="text-slate-500 hover:text-slate-700 text-xs font-bold">إلغاء</button>
                                      </div>
                                    </div>
                                  ) : (
                                    <>
                                      <div className="flex items-center justify-between mb-1">
                                        <div className="font-black text-slate-900 text-sm">{record.type}</div>
                                        <div className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">{record.date}</div>
                                      </div>
                                      <div className="text-sm font-bold text-slate-600 mb-2">{record.description}</div>
                                      <div className="flex items-center justify-between">
                                        <div className="text-xs font-bold text-slate-400 flex items-center gap-1">
                                          <ShieldCheck className="w-3 h-3" />
                                          بواسطة: {record.technician}
                                        </div>
                                        <div className="flex gap-2">
                                          <button onClick={() => setEditingMaintenance({ index: idx, ...record })} className="text-blue-500 hover:text-blue-700">
                                            <Edit className="w-4 h-4" />
                                          </button>
                                          <button onClick={() => handleDeleteMaintenance(selectedDevice.id, idx)} className="text-red-500 hover:text-red-700">
                                            <Trash2 className="w-4 h-4" />
                                          </button>
                                        </div>
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-10 text-slate-500 font-bold">لا توجد سجلات صيانة سابقة لهذا الجهاز.</div>
                          )}
                        </div>
                      </section>
                    )}

                  </div>

                  {/* Sidebar Info */}
                  <div className="space-y-6">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-slate-400" />
                        ملخص الجهاز
                      </h3>
                      
                      <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                        <span className="text-xs font-bold text-slate-500">الرقم التسلسلي</span>
                        <span className="text-xs font-black text-slate-900 font-mono bg-slate-100 px-2 py-1 rounded-md">{selectedDevice.serialNumber}</span>
                      </div>
                      <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                        <span className="text-xs font-bold text-slate-500">الموقع</span>
                        <span className="text-xs font-black text-slate-900">{selectedDevice.location}</span>
                      </div>
                      <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                        <span className="text-xs font-bold text-slate-500">العهدة</span>
                        <span className="text-xs font-black text-slate-900">{selectedDevice.assignedTo}</span>
                      </div>
                      <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                        <span className="text-xs font-bold text-slate-500">النظام المرتبط</span>
                        <span 
                          onClick={() => setIsLinkSystemModalOpen(true)}
                          className="text-xs font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-md cursor-pointer hover:bg-blue-100 transition-colors"
                        >
                          {selectedDevice.linkedSystem || 'ربط بنظام...'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-2">
                        <span className="text-xs font-bold text-slate-500">موعد الصيانة القادم</span>
                        <span className="text-sm font-black text-amber-600 bg-amber-50 px-2 py-1 rounded-md">{selectedDevice.nextMaintenanceDate}</span>
                      </div>
                    </div>

                    {/* Attachments */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-slate-400" />
                        المرفقات والمستندات
                      </h3>
                      <div className="space-y-2">
                        <div onClick={() => toast.info('جاري تحميل المرفق...')} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl hover:border-emerald-200 transition-colors cursor-pointer group">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-white rounded-lg shadow-sm text-blue-600">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="text-xs font-black text-slate-900">فاتورة الشراء</div>
                              <div className="text-[10px] font-bold text-slate-400">{selectedDevice.invoiceAttachment}</div>
                            </div>
                          </div>
                          <Download className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                        </div>
                      </div>
                      <button onClick={() => toast.info('جاري فتح نافذة إضافة مرفق...')} className="w-full py-2.5 border-2 border-dashed border-slate-200 text-slate-500 rounded-xl font-bold hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all text-sm flex items-center justify-center gap-2">
                        <UploadCloud className="w-4 h-4" />
                        إضافة مرفق جديد
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Sticker Print Modal */}
      <AnimatePresence>
        {isStickerModalOpen && selectedDevice && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
              onClick={() => setIsStickerModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-emerald-600" />
                  معاينة ملصق الجهاز (Sticker)
                </h2>
                <button onClick={() => setIsStickerModalOpen(false)} className="p-2 text-slate-400 hover:bg-slate-200 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-8 flex justify-center bg-slate-100/50">
                {/* Sticker Preview */}
                <div className="w-80 bg-white border-2 border-slate-800 rounded-xl p-4 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-2 bg-emerald-600" />
                  <div className="flex justify-between items-start mb-4 mt-1">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white font-black text-xs shadow-sm">DC</div>
                      <div>
                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">ديتيلز كونسولتس</div>
                        <div className="text-sm font-black text-slate-900">{selectedDevice.name}</div>
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-200 shadow-sm">
                      {/* Placeholder for QR Code */}
                      <div className="w-8 h-8 grid grid-cols-3 gap-0.5">
                        {[...Array(9)].map((_, i) => (
                          <div key={i} className={cn("bg-slate-800 rounded-sm", Math.random() > 0.5 ? "opacity-100" : "opacity-0")} />
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-1.5 mb-4">
                    <div className="flex justify-between border-b border-slate-100 pb-1">
                      <span className="text-[10px] font-bold text-slate-500">الرقم التسلسلي</span>
                      <span className="text-[10px] font-black text-slate-900 font-mono">{selectedDevice.serialNumber}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-1">
                      <span className="text-[10px] font-bold text-slate-500">الموديل</span>
                      <span className="text-[10px] font-black text-slate-900">{selectedDevice.brand} {selectedDevice.model}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-1">
                      <span className="text-[10px] font-bold text-slate-500">العهدة</span>
                      <span className="text-[10px] font-black text-slate-900">{selectedDevice.assignedTo}</span>
                    </div>
                    {selectedDevice.network && (
                      <>
                        {selectedDevice.network.internalIp && (
                          <div className="flex justify-between border-b border-slate-100 pb-1">
                            <span className="text-[10px] font-bold text-slate-500">IP الداخلي</span>
                            <span className="text-[10px] font-black text-slate-900 font-mono">{selectedDevice.network.internalIp}</span>
                          </div>
                        )}
                        {selectedDevice.network.tailscaleIp && (
                          <div className="flex justify-between border-b border-slate-100 pb-1">
                            <span className="text-[10px] font-bold text-slate-500">Tailscale</span>
                            <span className="text-[10px] font-black text-slate-900 font-mono">{selectedDevice.network.tailscaleIp}</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  
                  <div className="text-center bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                    <div className="text-[9px] font-black text-slate-700">هذا الجهاز ملك شركة ديتيلز كونسولتس</div>
                    <div className="text-[8px] font-bold text-slate-400 mt-0.5">للدعم الفني امسح الرمز أو اتصل على 1234</div>
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
                <button onClick={() => { toast.info('جاري إرسال أمر الطباعة...'); setIsStickerModalOpen(false); }} className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-black hover:bg-slate-800 transition-all shadow-md active:scale-95 flex items-center gap-2">
                  <Printer className="w-4 h-4" />
                  تأكيد الطباعة
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Link System Modal */}
      <AnimatePresence>
        {isLinkSystemModalOpen && selectedDevice && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
              onClick={() => setIsLinkSystemModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Network className="w-5 h-5 text-blue-600" />
                  ربط الجهاز بنظام آخر
                </h2>
                <button onClick={() => setIsLinkSystemModalOpen(false)} className="p-2 text-slate-400 hover:bg-slate-200 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6">
                <form onSubmit={handleLinkSystemSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">اختر النظام لربط {selectedDevice.name}</label>
                    <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all">
                      <option value="">-- اختر النظام --</option>
                      <option value="Active Directory">Active Directory</option>
                      <option value="ERP System">نظام ERP</option>
                      <option value="HR System">نظام الموارد البشرية</option>
                      <option value="CCTV">نظام المراقبة (CCTV)</option>
                    </select>
                  </div>
                  <div className="flex justify-end gap-3 pt-4">
                    <button type="button" onClick={() => setIsLinkSystemModalOpen(false)} className="px-6 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors">إلغاء</button>
                    <button type="submit" className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-black hover:bg-blue-700 transition-all shadow-md">تأكيد الربط</button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Device Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setIsAddModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                  <Plus className="w-6 h-6 text-emerald-600" />
                  إضافة جهاز جديد
                </h2>
                <button onClick={() => setIsAddModalOpen(false)} className="p-2 text-slate-400 hover:bg-slate-200 rounded-full transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-slate-50/50">
                <form id="add-device-form" onSubmit={handleAddDevice} className="space-y-8">
                  
                  {/* Basic Info */}
                  <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Info className="w-5 h-5 text-emerald-600" />
                      المعلومات الأساسية
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5">اسم الجهاز</label>
                        <input type="text" required value={newDevice.name} onChange={e => setNewDevice({...newDevice, name: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" placeholder="مثال: جهاز م. أحمد" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5">نوع الجهاز</label>
                        <select value={newDevice.type} onChange={e => setNewDevice({...newDevice, type: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500">
                          <option value="Computer">كمبيوتر (Computer)</option>
                          <option value="Server">خادم (Server)</option>
                          <option value="Printer">طابعة (Printer)</option>
                          <option value="Network">جهاز شبكة (Network)</option>
                          <option value="Camera">كاميرا (Camera)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5">العلامة التجارية</label>
                        <input type="text" required value={newDevice.brand} onChange={e => setNewDevice({...newDevice, brand: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" placeholder="مثال: Dell" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5">الموديل</label>
                        <input type="text" required value={newDevice.model} onChange={e => setNewDevice({...newDevice, model: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" placeholder="مثال: OptiPlex 7090" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5">الرقم التسلسلي (S/N)</label>
                        <input type="text" required value={newDevice.serialNumber} onChange={e => setNewDevice({...newDevice, serialNumber: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" placeholder="مثال: DL-7090-X12" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5">الحالة</label>
                        <select value={newDevice.status} onChange={e => setNewDevice({...newDevice, status: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500">
                          <option value="Active">نشط (Active)</option>
                          <option value="Warning">تحذير (Warning)</option>
                          <option value="Offline">غير متصل (Offline)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5">العهدة (مخصص لـ)</label>
                        <input type="text" value={newDevice.assignedTo} onChange={e => setNewDevice({...newDevice, assignedTo: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" placeholder="مثال: أحمد محمود" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5">الموقع</label>
                        <input type="text" value={newDevice.location} onChange={e => setNewDevice({...newDevice, location: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" placeholder="مثال: مكتب 101" />
                      </div>
                    </div>
                  </section>

                  {/* Technical Specs (Conditional) */}
                  {(newDevice.type === 'Computer' || newDevice.type === 'Server') && (
                    <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Cpu className="w-5 h-5 text-emerald-600" />
                        المواصفات التقنية
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1.5">المعالج (CPU)</label>
                          <input type="text" value={newDevice.specs.cpu} onChange={e => setNewDevice({...newDevice, specs: {...newDevice.specs, cpu: e.target.value}})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" placeholder="مثال: Intel Core i7" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1.5">الذاكرة (RAM)</label>
                          <input type="text" value={newDevice.specs.ram} onChange={e => setNewDevice({...newDevice, specs: {...newDevice.specs, ram: e.target.value}})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" placeholder="مثال: 16GB DDR4" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1.5">التخزين (Storage)</label>
                          <input type="text" value={newDevice.specs.storage} onChange={e => setNewDevice({...newDevice, specs: {...newDevice.specs, storage: e.target.value}})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" placeholder="مثال: 512GB SSD" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1.5">كرت الشاشة (GPU)</label>
                          <input type="text" value={newDevice.specs.gpu} onChange={e => setNewDevice({...newDevice, specs: {...newDevice.specs, gpu: e.target.value}})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" placeholder="مثال: NVIDIA RTX 3060" />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-xs font-bold text-slate-500 mb-1.5">نظام التشغيل (OS)</label>
                          <input type="text" value={newDevice.specs.os} onChange={e => setNewDevice({...newDevice, specs: {...newDevice.specs, os: e.target.value}})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" placeholder="مثال: Windows 11 Pro" />
                        </div>
                      </div>
                    </section>
                  )}

                  {/* Network & Purchase */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Network className="w-5 h-5 text-emerald-600" />
                        الشبكة
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1.5">IP الداخلي</label>
                          <input type="text" value={newDevice.network.internalIp} onChange={e => setNewDevice({...newDevice, network: {...newDevice.network, internalIp: e.target.value}})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" placeholder="192.168.1.x" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1.5">عنوان MAC</label>
                          <input type="text" value={newDevice.network.mac} onChange={e => setNewDevice({...newDevice, network: {...newDevice.network, mac: e.target.value}})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" placeholder="00:1A:2B:3C:4D:5E" />
                        </div>
                      </div>
                    </section>

                    <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-emerald-600" />
                        الشراء والضمان
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1.5">تاريخ الشراء</label>
                          <input type="date" value={newDevice.purchaseDate} onChange={e => setNewDevice({...newDevice, purchaseDate: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1.5">المورد</label>
                          <input type="text" value={newDevice.vendor} onChange={e => setNewDevice({...newDevice, vendor: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" placeholder="اسم المورد" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1.5">نهاية الضمان</label>
                          <input type="date" value={newDevice.warrantyEnd} onChange={e => setNewDevice({...newDevice, warrantyEnd: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
                        </div>
                      </div>
                    </section>
                  </div>
                </form>
              </div>

              <div className="px-8 py-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                <button 
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-6 py-2.5 text-slate-600 font-bold hover:bg-slate-200 rounded-xl transition-colors"
                >
                  إلغاء
                </button>
                <button 
                  type="submit"
                  form="add-device-form"
                  className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-black hover:bg-emerald-500 transition-all shadow-md active:scale-95 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  حفظ وإضافة الجهاز
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Link System Modal - Duplicate Fixed */}
      <AnimatePresence>
        {isLinkSystemModalOpen && selectedDevice && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
              onClick={() => setIsLinkSystemModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Server className="w-5 h-5 text-blue-600" />
                  ربط الجهاز بنظام
                </h2>
                <button onClick={() => setIsLinkSystemModalOpen(false)} className="p-2 text-slate-400 hover:bg-slate-200 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">
                <p className="text-sm font-bold text-slate-500 mb-4">اختر النظام أو الخادم الذي ترغب بربط هذا الجهاز به لتسهيل الإدارة والوصول:</p>
                
                <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                  {[
                    { id: 'sys-1', name: 'الخادم الرئيسي (Synology)', type: 'Local Server' },
                    { id: 'sys-2', name: 'خادم الويب الرئيسي', type: 'VPS' },
                    { id: 'sys-3', name: 'خادم قواعد البيانات', type: 'VPS' },
                    { id: 'sys-4', name: 'نظام الحضور والانصراف', type: 'Software' },
                  ].map((sys) => (
                    <div 
                      key={sys.id}
                      onClick={() => {
                        const updatedDevice = { ...selectedDevice, linkedSystem: sys.name };
                        setSelectedDevice(updatedDevice);
                        setDevices(prev => prev.map(d => d.id === updatedDevice.id ? updatedDevice : d));
                        setIsLinkSystemModalOpen(false);
                      }}
                      className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                          <Server className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-sm font-black text-slate-900">{sys.name}</div>
                          <div className="text-[10px] font-bold text-slate-500">{sys.type}</div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 flex justify-end">
                  <button 
                    onClick={() => setIsLinkSystemModalOpen(false)}
                    className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}