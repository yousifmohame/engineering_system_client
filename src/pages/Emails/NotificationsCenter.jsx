import React, { useState, useEffect } from "react";
import {
  Bell,
  AlertTriangle,
  Clock,
  CheckCircle2,
  User,
  Eye,
  DollarSign,
  FileX,
  AlertCircle,
  ArrowRight,
  Calendar,
  Paperclip,
  X,
  Search,
  Filter,
  Settings,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import api from "../../api/axios"; // 👈 تأكد من المسار

// ==========================================
// 💡 مكون مساعدة: Tooltip
// ==========================================
const SimpleTooltip = ({ children, content }) => {
  return (
    <div className="relative group inline-flex">
      {children}
      <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 hidden group-hover:block w-max max-w-xs px-2.5 py-1.5 bg-slate-800 text-white text-[10px] rounded shadow-lg z-50 pointer-events-none">
        {content}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-slate-800"></div>
      </div>
    </div>
  );
};

const categories = [
  { code: "URG", label: "عاجل" },
  { code: "FIN", label: "مالي" },
  { code: "DOC", label: "توثيق" },
  { code: "SYS", label: "نظام" },
  { code: "TXN", label: "معاملات" },
];

export default function NotificationsCenter() {
  const [allNotifications, setAllNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNotif, setSelectedNotif] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // ── جلب الإيميلات الحقيقية من السيرفر (هوستنقر) ──
  const fetchRealEmails = async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/email/sync");

      // تحويل الإيميلات إلى صيغة تناسب الإشعارات
      const realEmailsAsNotifications = res.data.data.map((email) => ({
        id: email.id,
        code: `MAIL-${email.id}`,
        category: email.category || "نظام",
        subCategory: null,
        title: email.subject,
        description:
          email.body.length > 100
            ? email.body.substring(0, 100) + "..."
            : email.body,
        fullBody: email.body, // النص الكامل للدرج الجانبي
        sender: email.from,
        relatedEntityCode: email.from, // عرض البريد كمرجع
        severity: email.severity || "medium",
        timestamp: new Date(email.date).toLocaleString("ar-SA", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }),
        isRead: email.isRead,
        assignedTo: null,
      }));

      setAllNotifications(realEmailsAsNotifications);
    } catch (error) {
      toast.error("فشل في جلب رسائل البريد من هوستنقر");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRealEmails();
  }, []);

  // إحصائيات سريعة
  const unreadCount = allNotifications.filter((n) => !n.isRead).length;
  const urgentCount = allNotifications.filter(
    (n) => n.severity === "high",
  ).length;
  const assignedCount = allNotifications.filter((n) => n.assignedTo).length;
  const financialCount = allNotifications.filter(
    (n) => n.category === "مالي",
  ).length;

  const selectedNotification = allNotifications.find(
    (n) => n.id === selectedNotif,
  );

  // فلترة
  const filteredNotifications = allNotifications.filter(
    (n) =>
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.sender.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleRowClick = (id) => {
    setSelectedNotif(id);
    setIsDrawerOpen(true);

    // التحديث كمقروء محلياً
    setAllNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedNotif(null);
  };

  return (
    <div
      className="flex-1 flex flex-col overflow-hidden bg-slate-50 min-h-screen font-[Tajawal]"
      dir="rtl"
    >
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 text-blue-700 flex items-center justify-center rounded-lg">
            <Bell size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800 leading-tight">
              مركز الإشعارات والبريد الوارد{" "}
              <span className="text-slate-400 text-sm font-mono ml-2">
                (Hostinger)
              </span>
            </h1>
            <p className="text-xs text-slate-500">مزامنة حية مع بريد المكتب</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchRealEmails}
            className="px-4 py-2 text-[11px] font-bold bg-white border border-slate-300 text-slate-700 rounded-lg shadow-sm hover:bg-slate-50 flex items-center gap-2"
          >
            <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />{" "}
            مزامنة البريد
          </button>
          <button className="px-4 py-2 text-[11px] font-bold bg-green-600 text-white rounded-lg shadow-sm hover:bg-green-700 transition-colors flex items-center gap-2">
            <CheckCircle2 size={14} /> تحديد الكل كمقروء
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4 flex-1 overflow-y-auto custom-scrollbar">
        {/* KPI Chips */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex flex-wrap gap-3">
            <SimpleTooltip content="الإشعارات التي لم تُقرأ بعد">
              <div className="flex items-center gap-3 px-4 py-2 bg-blue-50/50 border border-blue-200 rounded-lg cursor-pointer hover:bg-blue-50 min-w-[120px]">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-md">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-blue-600/80">
                    غير مقروءة
                  </div>
                  <div className="text-xl font-black text-blue-900 leading-tight">
                    {unreadCount}
                  </div>
                </div>
              </div>
            </SimpleTooltip>
            <SimpleTooltip content="إشعارات عالية الأولوية">
              <div className="flex items-center gap-3 px-4 py-2 bg-red-50/50 border border-red-200 rounded-lg cursor-pointer hover:bg-red-50 min-w-[120px]">
                <div className="p-2 bg-red-100 text-red-600 rounded-md">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-red-600/80">
                    عاجلة
                  </div>
                  <div className="text-xl font-black text-red-900 leading-tight">
                    {urgentCount}
                  </div>
                </div>
              </div>
            </SimpleTooltip>
          </div>
        </div>

        {/* Filters & Table */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 rounded-t-xl flex flex-wrap gap-4 items-center justify-between">
            <div className="relative">
              <Search className="w-3 h-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="بحث سريع في البريد..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-xs border border-slate-300 rounded-full bg-white pr-7 pl-3 py-1.5 outline-none focus:border-blue-500 w-64"
              />
            </div>
          </div>

          <div className="overflow-x-auto min-h-[300px]">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-48 text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin mb-2 text-blue-500" />
                <p className="font-bold text-sm">
                  جاري جلب الرسائل من هوستنقر...
                </p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-slate-400">
                <p className="font-bold text-sm">لا توجد رسائل بريد</p>
              </div>
            ) : (
              <table className="w-full text-[11px] text-right">
                <thead className="bg-slate-100/80 border-b border-slate-200 text-slate-600">
                  <tr>
                    <th className="px-4 py-3 font-bold w-24">المعرف</th>
                    <th className="px-4 py-3 font-bold w-20">تصنيف</th>
                    <th className="px-4 py-3 font-bold">العنوان / الموضوع</th>
                    <th className="px-4 py-3 font-bold w-48">
                      المرسل (البريد)
                    </th>
                    <th className="px-4 py-3 font-bold w-16">أولوية</th>
                    <th className="px-4 py-3 font-bold w-32">التاريخ</th>
                    <th className="px-4 py-3 font-bold w-20">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredNotifications.map((notif) => (
                    <tr
                      key={notif.id}
                      className={`hover:bg-slate-50 cursor-pointer transition-colors ${!notif.isRead ? "bg-blue-50/30 font-bold" : ""}`}
                      onClick={() => handleRowClick(notif.id)}
                    >
                      <td className="px-4 py-2.5 font-mono text-slate-500">
                        {notif.code}
                      </td>
                      <td className="px-4 py-2.5">
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${notif.category === "عاجل" ? "bg-red-50 border-red-200 text-red-700" : notif.category === "مالي" ? "bg-green-50 border-green-200 text-green-700" : "bg-slate-100 border-slate-200 text-slate-700"}`}
                        >
                          {notif.category}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-slate-800 truncate max-w-[200px]">
                        {notif.title}
                      </td>
                      <td className="px-4 py-2.5 font-mono text-slate-500 truncate max-w-[150px] dir-ltr text-left">
                        {notif.sender}
                      </td>
                      <td className="px-4 py-2.5">
                        <div
                          className={`w-2.5 h-2.5 rounded-full shadow-sm ${notif.severity === "high" ? "bg-red-500" : notif.severity === "medium" ? "bg-amber-400" : "bg-blue-400"}`}
                        />
                      </td>
                      <td className="px-4 py-2.5 font-mono text-slate-500">
                        {notif.timestamp}
                      </td>
                      <td className="px-4 py-2.5">
                        {notif.isRead ? (
                          <span className="inline-flex items-center gap-1 text-[10px] text-slate-500">
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />{" "}
                            مقروء
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-blue-100 text-blue-700">
                            جديد
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* 6️⃣ الدرج الجانبي لقراءة الإيميل الكامل (Drawer) */}
      {isDrawerOpen && selectedNotification && (
        <div
          className="fixed inset-0 z-50 flex justify-start bg-slate-900/40 backdrop-blur-sm animate-in fade-in"
          dir="rtl"
        >
          <div className="absolute inset-0" onClick={closeDrawer}></div>
          <div className="relative w-full max-w-lg h-full bg-white shadow-2xl border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-300 font-[Tajawal]">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  قراءة الرسالة
                </h3>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                  {selectedNotification.code}
                </p>
              </div>
              <button
                onClick={closeDrawer}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 custom-scrollbar bg-white">
              <div className="mb-4 pb-4 border-b border-slate-100">
                <h4 className="text-lg font-bold text-slate-900 mb-3 leading-tight">
                  {selectedNotification.title}
                </h4>
                <div className="flex flex-col gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-12 text-slate-400 font-bold text-xs">
                      من:
                    </span>{" "}
                    <span className="font-mono text-blue-600 dir-ltr text-left">
                      {selectedNotification.sender}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-12 text-slate-400 font-bold text-xs">
                      التاريخ:
                    </span>{" "}
                    <span className="text-slate-700 font-mono">
                      {selectedNotification.timestamp}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-sm text-slate-800 leading-loose whitespace-pre-wrap">
                {selectedNotification.fullBody}
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 grid grid-cols-2 gap-2 shrink-0">
              <button className="col-span-2 py-2.5 bg-blue-600 text-white text-xs font-bold rounded-lg shadow-sm hover:bg-blue-700 flex items-center justify-center gap-1.5">
                <ArrowRight className="w-4 h-4" /> رد على المرسل
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
