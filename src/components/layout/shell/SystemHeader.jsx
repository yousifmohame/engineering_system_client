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

const SystemHeader = ({ user = { name: "أحمد محمد" } }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // حالة التحكم في ظهور قائمة المستخدم
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

    // إغلاق قائمة المستخدم عند النقر خارجها
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
    const h = Math.floor(totalSeconds / 3600)
      .toString()
      .padStart(2, "0");
    const m = Math.floor((totalSeconds % 3600) / 60)
      .toString()
      .padStart(2, "0");
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

  // دالة تسجيل الخروج
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-3 md:px-6 shrink-0 z-30 shadow-sm relative">
      {/* 2. بيانات النظام الحية (متجاوبة Responsive) */}
      <div className="flex flex-1 md:flex-none items-center justify-start md:justify-center gap-2 md:gap-5 text-[10px] md:text-xs font-medium md:border-x border-gray-200 md:mx-4 px-2">
        {/* المدينة والوقت (تظهر دائماً ولكن أصغر في الجوال) */}
        <div className="flex items-center gap-2 md:gap-3 md:border-l border-gray-200 md:pl-5">
          <div className="flex flex-col items-start gap-0.5 md:gap-1">
            <div className="flex items-center gap-1 text-gray-800 font-bold">
              <MapPin className="w-3 h-3 text-blue-500 hidden sm:block" />{" "}
              الرياض
            </div>
            <div className="flex items-center gap-1 text-blue-600 font-bold">
              <Clock className="w-3 h-3 hidden sm:block" /> {time12}
            </div>
          </div>
        </div>

        {/* التاريخ (يختفي في الشاشات الصغيرة جداً جداً ليمنع التكدس) */}
        <div className="hidden sm:flex flex-col items-center justify-center font-mono text-gray-500 border-l border-gray-200 pl-3 md:pl-5">
          <span
            className="text-gray-800 font-bold mb-0.5"
            title="التاريخ الميلادي"
          >
            {gregDate}{" "}
            <span className="text-[8px] md:text-[9px] text-gray-400 font-sans ml-0.5">
              م
            </span>
          </span>
          <span className="text-gray-600" title="التاريخ الهجري">
            {hijriDate}{" "}
            <span className="text-[8px] md:text-[9px] text-gray-400 font-sans ml-0.5">
              هـ
            </span>
          </span>
        </div>

        {/* زمن الجلسة (يختفي في الجوالات الصغيرة) */}
        <div className="hidden lg:flex flex-col items-center justify-center border-l border-gray-200 pl-5">
          <span className="text-[10px] text-gray-400 mb-0.5 flex items-center gap-1">
            <Timer className="w-3 h-3" /> زمن الجلسة
          </span>
          <span className="font-mono font-bold text-gray-700 tracking-wider">
            {formatSessionTime(sessionSeconds)}
          </span>
        </div>

        {/* حالة الاتصال (تظهر دائماً كأيقونة في الجوال، وكنص في الشاشات الأكبر) */}
        <div className="flex items-center gap-1 md:min-w-[80px]">
          {isOnline ? (
            <>
              <Wifi className="w-3.5 h-3.5 text-green-500" />
              <span className="hidden md:inline text-green-600 font-bold text-[11px]">
                متصل
              </span>
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5 text-red-500 animate-pulse" />
              <span className="hidden md:inline text-red-600 font-bold text-[11px]">
                غير متصل
              </span>
            </>
          )}
        </div>
      </div>

      {/* 3. الإجراءات والملف الشخصي */}
      <div className="flex items-center gap-1 md:gap-2 relative">
        {/* أزرار الإشعارات والإعدادات (مخفية في الشاشات الصغيرة جداً لتوفير المساحة) */}
        <div className="hidden sm:flex items-center gap-1">
          <button className="relative p-2 text-gray-500 hover:bg-gray-100 hover:text-blue-600 rounded-full transition-colors">
            <Bell className="w-4 h-4 md:w-5 md:h-5" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 md:w-2 md:h-2 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
          </button>
          <button className="p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800 rounded-full transition-colors">
            <Settings className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>

        {/* قائمة المستخدم المنسدلة */}
        <div className="relative" ref={userMenuRef}>
          <div
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2 group cursor-pointer p-1.5 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200 md:mr-2 md:border-r border-gray-200 md:pr-4"
          >
            <div className="text-left hidden md:block leading-tight">
              <div className="text-sm font-bold text-gray-800 text-right">
                {user.name}
              </div>
              <div className="text-[10px] text-gray-500 font-medium">
                مهندس أول • مسؤول نظام
              </div>
            </div>
            <div className="relative">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-full flex items-center justify-center shadow-md shadow-blue-200 border-2 border-white">
                <span className="font-bold text-xs md:text-sm">
                  {user.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div
                className={`absolute -bottom-1 -right-1 w-2.5 h-2.5 md:w-3.5 md:h-3.5 border-2 border-white rounded-full ${isOnline ? "bg-green-500" : "bg-gray-400"}`}
              ></div>
            </div>
            <ChevronDown
              className={`w-3 h-3 md:w-4 md:h-4 text-gray-400 group-hover:text-gray-600 transition-transform ${isUserMenuOpen ? "rotate-180" : ""}`}
            />
          </div>

          {/* محتوى قائمة المستخدم */}
          {isUserMenuOpen && (
            <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50 animate-in fade-in slide-in-from-top-2">
              <button
                onClick={handleLogout}
                className="w-full text-right px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 font-bold transition-colors"
              >
                <LogOut className="w-4 h-4" />
                تسجيل الخروج
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default SystemHeader;
