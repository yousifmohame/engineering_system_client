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
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext"; // 👈 1. استيراد الـ AuthContext

const SystemHeader = () => {
  // 👈 2. جلب بيانات المستخدم ودالة الخروج الحقيقية من النظام
  const { user, logout } = useAuth(); 
  
  const [currentTime, setCurrentTime] = useState(new Date());
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
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

    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
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
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    const parts = hFormat.formatToParts(date);
    const day = parts.find((p) => p.type === "day").value;
    const month = parts.find((p) => p.type === "month").value;
    const year = parts.find((p) => p.type === "year").value.split(" ")[0];
    return `${day}/${month}/${year}`;
  };
  const hijriDate = formatHijriNumeric(currentTime);

  const handleLogout = () => {
    // 👈 3. استخدام دالة logout الحقيقية من الـ Context
    logout(); 
  };

  // حماية إضافية: في حال لم يتم تحميل بيانات المستخدم بعد
  const userName = user?.name || "مستخدم النظام";
  const userPosition = user?.position || "موظف";
  const userInitials = userName.charAt(0).toUpperCase();

  return (
    <header className="h-12 bg-white border-b border-gray-200 flex items-center justify-between px-3 md:px-4 shrink-0 z-30 shadow-sm relative">
      
      {/* 1. بيانات النظام الحية */}
      <div className="flex flex-1 md:flex-none items-center justify-start md:justify-center gap-2 md:gap-4 text-[9px] md:text-[11px] font-medium md:border-x border-gray-200 md:mx-2 px-2 h-full">
        
        {/* المدينة والوقت */}
        <div className="flex items-center gap-2 md:border-l border-gray-100 md:pl-4">
          <div className="flex flex-col items-start leading-tight">
            <div className="flex items-center gap-1 text-gray-800 font-bold">
              <MapPin className="w-2.5 h-2.5 text-blue-500 hidden sm:block" />{" "}
              الرياض
            </div>
            <div className="flex items-center gap-1 text-blue-600 font-bold">
              <Clock className="w-2.5 h-2.5 hidden sm:block" /> {time12}
            </div>
          </div>
        </div>

        {/* التاريخ */}
        <div className="hidden sm:flex flex-col items-center justify-center font-mono text-gray-500 border-l border-gray-100 pl-4 h-full">
          <span className="text-gray-800 font-bold leading-none" title="التاريخ الميلادي">
            {gregDate} <span className="text-[7px] text-gray-400 font-sans">م</span>
          </span>
          <span className="text-gray-500 leading-none mt-0.5" title="التاريخ الهجري">
            {hijriDate} <span className="text-[7px] text-gray-400 font-sans">هـ</span>
          </span>
        </div>

        {/* زمن الجلسة */}
        <div className="hidden lg:flex flex-col items-center justify-center border-l border-gray-100 pl-4 h-full">
          <span className="text-[9px] text-gray-400 flex items-center gap-1 leading-none">
            <Timer className="w-2.5 h-2.5" /> الجلسة
          </span>
          <span className="font-mono font-bold text-gray-600 tracking-tighter leading-none mt-0.5">
            {formatSessionTime(sessionSeconds)}
          </span>
        </div>

        {/* حالة الاتصال */}
        <div className="flex items-center gap-1">
          {isOnline ? (
            <>
              <Wifi className="w-3 h-3 text-green-500" />
              <span className="hidden md:inline text-green-600 font-bold text-[10px]">متصل</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3 h-3 text-red-500 animate-pulse" />
              <span className="hidden md:inline text-red-600 font-bold text-[10px]">منقطع</span>
            </>
          )}
        </div>
      </div>

      {/* 2. الإجراءات والملف الشخصي */}
      <div className="flex items-center gap-1 md:gap-2 relative">
        <div className="hidden sm:flex items-center gap-0.5">
          <button className="relative p-1.5 text-gray-400 hover:bg-gray-50 hover:text-blue-600 rounded-full transition-colors">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full border border-white"></span>
          </button>
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
              {/* 👈 4. عرض الاسم الحقيقي والمسمى الوظيفي */}
              <div className="text-[12px] font-bold text-gray-800 text-right">{userName}</div>
              <div className="text-[9px] text-gray-400 font-medium text-right mt-0.5">{userPosition}</div>
            </div>
            
            <div className="relative">
              {/* 👈 عرض الحرف الأول من اسم المستخدم */}
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-full flex items-center justify-center shadow-sm border border-white">
                <span className="font-bold text-xs">{userInitials}</span>
              </div>
              <div className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 border border-white rounded-full ${isOnline ? "bg-green-500" : "bg-gray-400"}`}></div>
            </div>
            <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform ${isUserMenuOpen ? "rotate-180" : ""}`} />
          </div>

          {/* القائمة المنسدلة */}
          {isUserMenuOpen && (
            <div className="absolute top-full left-0 mt-1 w-44 bg-white border border-gray-200 rounded-lg shadow-xl py-1 z-50 animate-in fade-in slide-in-from-top-1">
              <div className="px-4 py-2 border-b border-gray-100 mb-1">
                <div className="text-xs font-bold text-gray-800">{userName}</div>
                <div className="text-[10px] text-gray-500 font-mono mt-0.5">{user?.employeeCode || user?.email}</div>
              </div>
              <button
                onClick={handleLogout}
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