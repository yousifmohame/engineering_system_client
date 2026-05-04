import React, { useState, useEffect, useRef } from "react";
import {
  Bell,
  Settings,
  ChevronDown,
  MapPin,
  Clock,
  Timer,
  Wifi,
  WifiOff,
  LogOut,
  CheckCircle,
  AlertTriangle,
  Info,
  XCircle,
  Check
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
// 👈 1. استيراد سياق الإشعارات
import { useNotification } from "../../../context/NotificationContext"; 

// دالة مساعدة لتنسيق وقت الإشعار (منذ 5 دقائق، منذ ساعة، إلخ)
const formatTimeAgo = (date) => {
  const seconds = Math.floor((new Date() - date) / 1000);
  if (seconds < 60) return "الآن";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `منذ ${minutes} دقيقة`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `منذ ${hours} ساعة`;
  const days = Math.floor(hours / 24);
  return `منذ ${days} يوم`;
};

const SystemHeader = () => {
  const { user, logout } = useAuth(); 
  // 👈 2. جلب البيانات والدوال من سياق الإشعارات
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotification();
  
  const [currentTime, setCurrentTime] = useState(new Date());
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // حالات القوائم المنسدلة
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false); // 👈 حالة قائمة الإشعارات
  
  const userMenuRef = useRef(null);
  const notifMenuRef = useRef(null); // 👈 مرجع قائمة الإشعارات لاكتشاف النقرات الخارجية
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      setSessionSeconds((prev) => prev + 1);
    }, 1000);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // معالجة النقر خارج القوائم لإغلاقها
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      clearInterval(timer);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const formatSessionTime = (totalSeconds) => {
    const h = Math.floor(totalSeconds / 3600).toString().padStart(2, "0");
    const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, "0");
    const s = (totalSeconds % 60).toString().padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  const time12 = currentTime.toLocaleTimeString("ar-SA", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const gregDate = currentTime.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const formatHijriNumeric = (date) => {
    const hFormat = new Intl.DateTimeFormat("en-US-u-ca-islamic", {
      day: "2-digit", month: "2-digit", year: "numeric",
    });
    const parts = hFormat.formatToParts(date);
    const day = parts.find((p) => p.type === "day").value;
    const month = parts.find((p) => p.type === "month").value;
    const year = parts.find((p) => p.type === "year").value.split(" ")[0];
    return `${day}/${month}/${year}`;
  };
  const hijriDate = formatHijriNumeric(currentTime);

  const userName = user?.name || "مستخدم النظام";
  const userPosition = user?.position || "موظف";
  const userInitials = userName.charAt(0).toUpperCase();

  // دالة لاختيار الأيقونة واللون حسب نوع الإشعار
  const getNotifIcon = (type) => {
    switch(type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500 bg-green-50 rounded-full p-0.5" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-500 bg-amber-50 rounded-full p-0.5" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-500 bg-red-50 rounded-full p-0.5" />;
      default: return <Info className="w-5 h-5 text-blue-500 bg-blue-50 rounded-full p-0.5" />;
    }
  };

  return (
    <header className="h-12 bg-white border-b border-gray-200 flex items-center justify-between px-3 md:px-4 shrink-0 z-30 shadow-sm relative">
      
      {/* 1. بيانات النظام الحية (تم اختصارها لعدم التكرار، تبقى كما هي في كودك الأصلي) */}
      <div className="flex flex-1 md:flex-none items-center justify-start md:justify-center gap-2 md:gap-4 text-[9px] md:text-[11px] font-medium md:border-x border-gray-200 md:mx-2 px-2 h-full">
        {/* ... (نفس محتوى الوقت والتاريخ وحالة الاتصال الخاص بك) ... */}
         <div className="flex items-center gap-2 md:border-l border-gray-100 md:pl-4">
          <div className="flex flex-col items-start leading-tight">
            <div className="flex items-center gap-1 text-gray-800 font-bold">
              <MapPin className="w-2.5 h-2.5 text-blue-500 hidden sm:block" /> الرياض
            </div>
            <div className="flex items-center gap-1 text-blue-600 font-bold">
              <Clock className="w-2.5 h-2.5 hidden sm:block" /> {time12}
            </div>
          </div>
        </div>
      </div>

      {/* 2. الإجراءات والملف الشخصي */}
      <div className="flex items-center gap-1 md:gap-2 relative">
        <div className="hidden sm:flex items-center gap-0.5">
          
          {/* 👈 3. نظام الإشعارات الجديد */}
          <div className="relative" ref={notifMenuRef}>
            <button 
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className={`relative p-1.5 rounded-full transition-colors ${isNotifOpen ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:bg-gray-50 hover:text-blue-600'}`}
            >
              <Bell className="w-4 h-4" />
              {/* إظهار الشارة الحمراء فقط إذا كان هناك إشعارات غير مقروءة */}
              {unreadCount > 0 && (
                <span className="absolute top-0.5 right-0.5 flex h-3 w-3 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white border border-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* نافذة الإشعارات المنسدلة */}
            {isNotifOpen && (
              <div className="absolute top-full left-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 overflow-hidden" dir="rtl">
                
                {/* رأس نافذة الإشعارات */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                  <h3 className="text-sm font-bold text-gray-800">الإشعارات</h3>
                  {unreadCount > 0 && (
                    <button 
                      onClick={markAllAsRead}
                      className="text-[10px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" /> تحديد الكل كمقروء
                    </button>
                  )}
                </div>

                {/* قائمة الإشعارات */}
                <div className="max-h-80 overflow-y-auto custom-scrollbar">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-gray-400 text-xs font-medium">
                      <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                      لا توجد إشعارات حالياً
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      {notifications.map((notif) => (
                        <div 
                          key={notif.id} 
                          onClick={() => markAsRead(notif.id)}
                          className={`flex items-start gap-3 p-3 border-b border-gray-50 cursor-pointer transition-colors hover:bg-gray-50 ${!notif.isRead ? 'bg-blue-50/30' : ''}`}
                        >
                          <div className="shrink-0 mt-0.5">
                            {getNotifIcon(notif.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-0.5">
                              <h4 className={`text-xs truncate ${!notif.isRead ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                                {notif.title}
                              </h4>
                              <span className="text-[9px] text-gray-400 whitespace-nowrap">
                                {formatTimeAgo(notif.createdAt)}
                              </span>
                            </div>
                            <p className="text-[10px] text-gray-500 line-clamp-2 leading-relaxed">
                              {notif.message}
                            </p>
                          </div>
                          {/* نقطة زرقاء للإشعارات غير المقروءة */}
                          {!notif.isRead && (
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full shrink-0 mt-2"></div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* تذييل النافذة */}
                <div className="p-2 border-t border-gray-100 bg-gray-50 text-center">
                  <button className="text-xs font-bold text-gray-500 hover:text-gray-800 transition-colors">
                    عرض كل الإشعارات
                  </button>
                </div>
              </div>
            )}
          </div>

          <button className="p-1.5 text-gray-400 hover:bg-gray-50 hover:text-gray-700 rounded-full transition-colors">
            <Settings className="w-4 h-4" />
          </button>
        </div>

        {/* قائمة المستخدم */}
        <div className="relative" ref={userMenuRef}>
          <div
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2 group cursor-pointer p-1 rounded-lg hover:bg-gray-50 transition-colors md:mr-1 md:border-r border-gray-100 md:pr-3"
          >
            <div className="text-left hidden md:block leading-none">
              <div className="text-[12px] font-bold text-gray-800 text-right">{userName}</div>
              <div className="text-[9px] text-gray-400 font-medium text-right mt-0.5">{userPosition}</div>
            </div>
            
            <div className="relative">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-full flex items-center justify-center shadow-sm border border-white">
                <span className="font-bold text-xs">{userInitials}</span>
              </div>
              <div className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 border border-white rounded-full ${isOnline ? "bg-green-500" : "bg-gray-400"}`}></div>
            </div>
            <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform ${isUserMenuOpen ? "rotate-180" : ""}`} />
          </div>

          {isUserMenuOpen && (
            <div className="absolute top-full left-0 mt-1 w-44 bg-white border border-gray-200 rounded-xl shadow-xl py-1 z-50 animate-in fade-in slide-in-from-top-1">
              <div className="px-4 py-2 border-b border-gray-100 mb-1">
                <div className="text-xs font-bold text-gray-800">{userName}</div>
                <div className="text-[10px] text-gray-500 font-mono mt-0.5">{user?.employeeCode || user?.email}</div>
              </div>
              <button
                onClick={() => logout()}
                className="w-full text-right px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 font-bold transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" /> تسجيل الخروج
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default SystemHeader;