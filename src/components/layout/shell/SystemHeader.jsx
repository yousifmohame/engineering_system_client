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
  Check,
  CalendarDays,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { useNotification } from "../../../context/NotificationContext";

const formatTimeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);

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

  const {
    notifications = [],
    unreadCount = 0,
    markAsRead,
    markAllAsRead,
  } = useNotification();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const userMenuRef = useRef(null);
  const notifMenuRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      setSessionSeconds((prev) => prev + 1);
    }, 1000);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }

      if (notifMenuRef.current && !notifMenuRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
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
    const day = parts.find((p) => p.type === "day")?.value || "";
    const month = parts.find((p) => p.type === "month")?.value || "";
    const year =
      parts.find((p) => p.type === "year")?.value?.split(" ")[0] || "";

    return `${day}/${month}/${year}`;
  };

  const hijriDate = formatHijriNumeric(currentTime);

  const userName = user?.name || "مستخدم النظام";
  const userPosition = user?.position || "موظف";
  const userInitials = userName.charAt(0).toUpperCase();

  const getNotifIcon = (type) => {
    switch (type) {
      case "success":
        return (
          <span className="grid h-9 w-9 place-items-center rounded-2xl border border-emerald-300/40 bg-emerald-50 text-emerald-600">
            <CheckCircle className="h-5 w-5" />
          </span>
        );

      case "warning":
        return (
          <span className="grid h-9 w-9 place-items-center rounded-2xl border border-amber-300/45 bg-amber-50 text-amber-600">
            <AlertTriangle className="h-5 w-5" />
          </span>
        );

      case "error":
        return (
          <span className="grid h-9 w-9 place-items-center rounded-2xl border border-rose-300/45 bg-rose-50 text-rose-600">
            <XCircle className="h-5 w-5" />
          </span>
        );

      default:
        return (
          <span className="grid h-9 w-9 place-items-center rounded-2xl border border-cyan-300/35 bg-cyan-50 text-cyan-700">
            <Info className="h-5 w-5" />
          </span>
        );
    }
  };

  return (
    <header
      className="
        relative z-30 flex h-[56px] shrink-0 items-center justify-between
        overflow-visible border-b border-[#c5983c]/25
        bg-gradient-to-l from-white via-[#fbf8f1] to-[#eef7f6]
        px-3 shadow-[0_8px_24px_rgba(18,63,89,0.08)]
        md:px-4
      "
      dir="rtl"
    >
      <style>
        {`
          .system-header-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: rgba(197, 152, 60, 0.45) transparent;
          }

          .system-header-scrollbar::-webkit-scrollbar {
            width: 5px;
          }

          .system-header-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }

          .system-header-scrollbar::-webkit-scrollbar-thumb {
            border-radius: 999px;
            background: linear-gradient(
              180deg,
              rgba(226, 191, 116, 0.85),
              rgba(18, 63, 89, 0.85)
            );
          }
        `}
      </style>

      {/* Background light effects */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute right-[8%] top-[-50px] h-24 w-24 rounded-full bg-[#123f59]/8 blur-3xl" />
        <div className="absolute left-[18%] bottom-[-60px] h-28 w-28 rounded-full bg-[#c5983c]/12 blur-3xl" />
      </div>

      {/* Live system data */}
      <div className="relative z-10 flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
        <div
          className="
            flex h-10 items-center gap-2 rounded-2xl border border-[#d8b46a]/25
            bg-white/70 px-3 shadow-sm backdrop-blur-xl
          "
        >
          <span
            className={`
              grid h-7 w-7 place-items-center rounded-xl
              ${
                isOnline
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-rose-50 text-rose-600"
              }
            `}
          >
            {isOnline ? (
              <Wifi className="h-4 w-4" />
            ) : (
              <WifiOff className="h-4 w-4" />
            )}
          </span>

          <div className="hidden leading-tight sm:block">
            <div className="flex items-center gap-1 text-[11px] font-black text-[#123f59]">
              <MapPin className="h-3 w-3 text-[#c5983c]" />
              الرياض
            </div>

            <div
              className={`text-[10px] font-black ${
                isOnline ? "text-emerald-600" : "text-rose-600"
              }`}
            >
              {isOnline ? "متصل" : "غير متصل"}
            </div>
          </div>
        </div>

        <div
          className="
            hidden h-10 items-center gap-2 rounded-2xl border border-[#d8b46a]/25
            bg-white/70 px-3 shadow-sm backdrop-blur-xl md:flex
          "
        >
          <span className="grid h-7 w-7 place-items-center rounded-xl bg-[#f8efe0] text-[#c5983c]">
            <Clock className="h-4 w-4" />
          </span>

          <div className="leading-tight">
            <div className="text-[10px] font-bold text-[#64748b]">
              التوقيت المحلي
            </div>
            <div className="text-[12px] font-black text-[#123f59]">
              {time12}
            </div>
          </div>
        </div>

        <div
          className="
            hidden h-10 items-center gap-2 rounded-2xl border border-[#d8b46a]/25
            bg-white/70 px-3 shadow-sm backdrop-blur-xl lg:flex
          "
        >
          <span className="grid h-7 w-7 place-items-center rounded-xl bg-cyan-50 text-cyan-700">
            <CalendarDays className="h-4 w-4" />
          </span>

          <div className="leading-tight">
            <div className="text-[10px] font-bold text-[#64748b]">
              الميلادي / الهجري
            </div>
            <div className="text-[11px] font-black text-[#123f59]">
              {gregDate} | {hijriDate}
            </div>
          </div>
        </div>

        <div
          className="
            hidden h-10 items-center gap-2 rounded-2xl border border-[#d8b46a]/25
            bg-white/70 px-3 shadow-sm backdrop-blur-xl xl:flex
          "
        >
          <span className="grid h-7 w-7 place-items-center rounded-xl bg-[#123f59] text-[#e2bf74]">
            <Timer className="h-4 w-4" />
          </span>

          <div className="leading-tight">
            <div className="text-[10px] font-bold text-[#64748b]">
              مدة الجلسة
            </div>
            <div className="text-[11px] font-black text-[#123f59]">
              {formatSessionTime(sessionSeconds)}
            </div>
          </div>
        </div>
      </div>

      {/* Actions + user */}
      <div className="relative z-10 flex shrink-0 items-center gap-2">
        <div className="hidden items-center gap-1 sm:flex">
          {/* Notifications */}
          <div className="relative" ref={notifMenuRef}>
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className={`
                relative grid h-10 w-10 place-items-center rounded-2xl border
                shadow-sm transition-all duration-300
                ${
                  isNotifOpen
                    ? "border-[#c5983c]/45 bg-[#123f59] text-[#e2bf74]"
                    : "border-[#d8b46a]/25 bg-white/70 text-[#123f59] hover:border-[#c5983c]/45 hover:bg-[#f8efe0]"
                }
              `}
              type="button"
              title="الإشعارات"
            >
              <Bell className="h-4 w-4" />

              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 grid min-h-5 min-w-5 place-items-center rounded-full border-2 border-white bg-rose-500 px-1 text-[9px] font-black text-white shadow-[0_6px_14px_rgba(190,18,60,0.22)]">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>

            {isNotifOpen && (
              <div
                className="
                  absolute left-0 top-full z-50 mt-3 w-[340px] overflow-hidden
                  rounded-[24px] border border-[#c5983c]/25 bg-white
                  shadow-[0_24px_70px_rgba(15,23,42,0.24)]
                  animate-in fade-in slide-in-from-top-2
                "
                dir="rtl"
              >
                <div className="flex items-center justify-between border-b border-[#e8ddc8] bg-gradient-to-l from-[#123f59] to-[#0f3448] px-4 py-3 text-white">
                  <div>
                    <h3 className="text-sm font-black">الإشعارات</h3>
                    <p className="text-[10px] font-bold text-white/55">
                      مركز تنبيهات النظام
                    </p>
                  </div>

                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="flex items-center gap-1 rounded-xl border border-white/15 bg-white/10 px-2.5 py-1.5 text-[10px] font-black text-[#e2bf74] transition hover:bg-white/15"
                      type="button"
                    >
                      <Check className="h-3 w-3" />
                      تحديد الكل
                    </button>
                  )}
                </div>

                <div className="system-header-scrollbar max-h-80 overflow-y-auto bg-[#fbf8f1]">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center">
                      <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl border border-[#d8b46a]/25 bg-white text-[#c5983c]">
                        <Bell className="h-7 w-7" />
                      </div>

                      <p className="text-xs font-black text-[#123f59]">
                        لا توجد إشعارات حالياً
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      {notifications.map((notif) => (
                        <button
                          key={notif.id}
                          onClick={() => markAsRead(notif.id)}
                          className={`
                            flex w-full items-start gap-3 border-b border-[#e8ddc8]/70 p-3 text-right
                            transition-all hover:bg-white
                            ${
                              !notif.isRead
                                ? "bg-rose-50/65"
                                : "bg-white/55"
                            }
                          `}
                          type="button"
                        >
                          <div className="shrink-0">{getNotifIcon(notif.type)}</div>

                          <div className="min-w-0 flex-1">
                            <div className="mb-0.5 flex items-center justify-between gap-2">
                              <h4
                                className={`truncate text-xs ${
                                  !notif.isRead
                                    ? "font-black text-[#111827]"
                                    : "font-bold text-[#334155]"
                                }`}
                              >
                                {notif.title}
                              </h4>

                              <span className="shrink-0 rounded-full bg-white px-2 py-0.5 text-[9px] font-bold text-[#64748b]">
                                {formatTimeAgo(notif.createdAt)}
                              </span>
                            </div>

                            <p className="line-clamp-2 text-[10px] font-semibold leading-relaxed text-[#64748b]">
                              {notif.message}
                            </p>
                          </div>

                          {!notif.isRead && (
                            <span className="mt-3 h-2 w-2 shrink-0 rounded-full bg-rose-500 shadow-[0_0_0_4px_rgba(244,63,94,0.14)]" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="border-t border-[#e8ddc8] bg-white px-3 py-2 text-center">
                  <button
                    className="text-xs font-black text-[#123f59] transition hover:text-[#c5983c]"
                    type="button"
                  >
                    عرض كل الإشعارات
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            className="
              grid h-10 w-10 place-items-center rounded-2xl border border-[#d8b46a]/25
              bg-white/70 text-[#123f59] shadow-sm transition
              hover:border-[#c5983c]/45 hover:bg-[#f8efe0] hover:text-[#c5983c]
            "
            type="button"
            title="الإعدادات"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>

        {/* User menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="
              flex h-10 items-center gap-2 rounded-2xl border border-[#d8b46a]/25
              bg-white/75 px-2 shadow-sm backdrop-blur-xl transition
              hover:border-[#c5983c]/45 hover:bg-[#f8efe0]
              md:pr-3
            "
            type="button"
          >
            <div className="hidden leading-none md:block">
              <div className="text-right text-[12px] font-black text-[#123f59]">
                {userName}
              </div>

              <div className="mt-0.5 text-right text-[9px] font-bold text-[#64748b]">
                {userPosition}
              </div>
            </div>

            <div className="relative">
              <div className="grid h-8 w-8 place-items-center rounded-2xl bg-gradient-to-br from-[#123f59] to-[#0e7490] text-white shadow-sm">
                <span className="text-xs font-black">{userInitials}</span>
              </div>

              <div
                className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white ${
                  isOnline ? "bg-emerald-500" : "bg-slate-400"
                }`}
              />
            </div>

            <ChevronDown
              className={`h-3.5 w-3.5 text-[#64748b] transition-transform ${
                isUserMenuOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {isUserMenuOpen && (
            <div
              className="
                absolute left-0 top-full z-50 mt-2 w-56 overflow-hidden
                rounded-[22px] border border-[#c5983c]/25 bg-white
                shadow-[0_20px_60px_rgba(15,23,42,0.22)]
                animate-in fade-in slide-in-from-top-1
              "
            >
              <div className="border-b border-[#e8ddc8] bg-gradient-to-l from-[#fbf8f1] to-white px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#123f59] text-white">
                    <span className="text-sm font-black">{userInitials}</span>
                  </div>

                  <div className="min-w-0">
                    <div className="truncate text-xs font-black text-[#123f59]">
                      {userName}
                    </div>

                    <div className="mt-0.5 truncate text-[10px] font-bold text-[#64748b]">
                      {user?.employeeCode || user?.email}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-2">
                <div className="mb-1 flex items-center justify-between rounded-2xl bg-emerald-50 px-3 py-2">
                  <span className="text-[10px] font-black text-emerald-700">
                    حالة الجلسة
                  </span>

                  <span className="flex items-center gap-1 text-[10px] font-black text-emerald-700">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    نشطة
                  </span>
                </div>

                <button
                  onClick={() => logout()}
                  className="
                    flex w-full items-center gap-2 rounded-2xl px-3 py-2.5
                    text-right text-xs font-black text-rose-600 transition
                    hover:bg-rose-50
                  "
                  type="button"
                >
                  <LogOut className="h-4 w-4" />
                  تسجيل الخروج
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default SystemHeader;