import React from "react";
import {
  X,
  Calendar,
  User,
  Flag,
  FolderOpen,
  AlignLeft,
  FileText,
  Download,
  Hash,
  Link as LinkIcon,
  Building2,
  MapPin,
  Clock,
  CheckCircle2,
  Snowflake,
  AlertCircle,
  ShieldCheck,
  Activity,
} from "lucide-react";

export default function TaskDetailsModal({ task, onClose }) {
  if (!task) return null;

  const getPriorityConfig = (priority) => {
    if (priority === "high") {
      return {
        label: "أولوية عالية",
        icon: Flag,
        className:
          "border-rose-200 bg-rose-50 text-rose-700",
      };
    }

    if (priority === "medium") {
      return {
        label: "أولوية متوسطة",
        icon: Flag,
        className:
          "border-amber-200 bg-amber-50 text-amber-700",
      };
    }

    return {
      label: "أولوية منخفضة",
      icon: Flag,
      className:
        "border-slate-200 bg-slate-100 text-slate-700",
    };
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case "completed":
        return {
          label: "مكتملة",
          icon: CheckCircle2,
          className:
            "border-emerald-200 bg-emerald-50 text-emerald-700",
        };

      case "frozen":
        return {
          label: "مجمدة",
          icon: Snowflake,
          className:
            "border-blue-200 bg-blue-50 text-blue-700",
        };

      case "cancelled":
        return {
          label: "ملغاة",
          icon: AlertCircle,
          className:
            "border-slate-200 bg-slate-100 text-slate-600",
        };

      default:
        return {
          label: "نشطة",
          icon: Activity,
          className:
            "border-amber-200 bg-amber-50 text-amber-700",
        };
    }
  };

  const getRemainingDaysText = () => {
    if (task.status === "completed") {
      return "تم إنجاز المهمة بنجاح";
    }

    if (task.status === "cancelled") {
      return "تم إلغاء المهمة";
    }

    if (!task.dueDate) {
      return "لا يوجد موعد محدد";
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const due = new Date(task.dueDate);
    due.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil(
      (due - today) / (1000 * 60 * 60 * 24),
    );

    if (diffDays === 0) return "ينتهي موعدها اليوم";

    if (diffDays < 0) {
      return `متأخرة عن موعدها بـ ${Math.abs(diffDays)} يوم`;
    }

    return `متبقي ${diffDays} يوم`;
  };

  const getSafeEmployeesArray = () => {
    if (!task.assignedEmployees) return [];

    if (Array.isArray(task.assignedEmployees)) {
      return task.assignedEmployees;
    }

    if (typeof task.assignedEmployees === "string") {
      try {
        const parsed = JSON.parse(task.assignedEmployees);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        return [];
      }
    }

    return [];
  };

  const safeEmployees = getSafeEmployeesArray();

  const priorityConfig = getPriorityConfig(task.priority);
  const statusConfig = getStatusConfig(task.status);

  const PriorityIcon = priorityConfig.icon;
  const StatusIcon = statusConfig.icon;

  return (
    <div
      className="
        fixed inset-0 z-[200] flex items-center justify-center
        bg-[#06111d]/70 p-4 backdrop-blur-md
        animate-in fade-in
      "
      dir="rtl"
    >
      <div
        className="
          flex max-h-[94vh] w-full max-w-4xl flex-col overflow-hidden
          rounded-[32px] border border-[#d8b46a]/35
          bg-white shadow-[0_30px_90px_rgba(0,0,0,0.35)]
          animate-in zoom-in-95 duration-200
        "
      >
        {/* Header */}
        <div
          className="
            relative shrink-0 overflow-hidden border-b border-[#d8b46a]/25
            bg-gradient-to-l from-[#06111d] via-[#123f59] to-[#0e7490]
            px-5 py-4 text-white md:px-6
          "
        >
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute right-[-70px] top-[-70px] h-44 w-44 rounded-full bg-[#e2bf74]/18 blur-3xl" />
            <div className="absolute left-[-70px] bottom-[-70px] h-44 w-44 rounded-full bg-emerald-400/14 blur-3xl" />
          </div>

          <div className="relative z-10 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <div
                  className="
                    grid h-12 w-12 place-items-center rounded-2xl
                    border border-[#e2bf74]/35 bg-white/12
                    text-[#e2bf74]
                    shadow-[0_14px_30px_rgba(0,0,0,0.20)]
                  "
                >
                  <FileText className="h-6 w-6" />
                </div>

                <div>
                  <h3 className="text-lg font-black md:text-xl">
                    تفاصيل المهمة
                  </h3>

                  <p className="mt-1 text-xs font-bold text-white/65">
                    عرض شامل لكافة بيانات المهمة والارتباطات الخاصة بها.
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span
                  className={`
                    inline-flex items-center gap-1.5 rounded-xl border
                    px-3 py-1.5 text-[11px] font-black
                    ${statusConfig.className}
                  `}
                >
                  <StatusIcon className="h-3.5 w-3.5" />
                  {statusConfig.label}
                </span>

                <span
                  className={`
                    inline-flex items-center gap-1.5 rounded-xl border
                    px-3 py-1.5 text-[11px] font-black
                    ${priorityConfig.className}
                  `}
                >
                  <PriorityIcon className="h-3.5 w-3.5" />
                  {priorityConfig.label}
                </span>

                {task.serialNumber && (
                  <span
                    className="
                      inline-flex items-center gap-1.5 rounded-xl
                      border border-white/15 bg-white/10
                      px-3 py-1.5 font-mono text-[10px] font-black text-white
                    "
                  >
                    <Hash className="h-3.5 w-3.5 text-[#e2bf74]" />
                    {task.serialNumber}
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={onClose}
              className="
                flex min-w-[54px] flex-col items-center justify-center gap-0.5
                rounded-xl border border-white/15 bg-white/10
                px-2 py-1 text-[8px] font-black leading-none text-white
                transition hover:bg-red-500/30
              "
              type="button"
            >
              <X className="h-4 w-4" />
              إغلاق
            </button>
          </div>
        </div>

        {/* Body */}
        <div
          className="
            min-h-0 flex-1 overflow-y-auto
            bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white
            p-4 custom-scrollbar-slim md:p-6
          "
        >
          <div className="space-y-5">
            {/* Description */}
            <SectionCard
              icon={AlignLeft}
              title="وصف المهمة"
              subtitle="التفاصيل والتعليمات الخاصة بالتنفيذ."
            >
              <div
                className="
                  rounded-[24px] border border-[#d8b46a]/25
                  bg-[#fbf8f1]/75 p-5
                  text-sm font-black leading-8 text-[#123f59]
                  whitespace-pre-wrap
                "
              >
                {task.description}
              </div>
            </SectionCard>

            {/* Employees */}
            {safeEmployees.length > 0 && (
              <SectionCard
                icon={User}
                title="الموظفون المسؤولون"
                subtitle="الأشخاص المكلفون بتنفيذ أو متابعة المهمة."
              >
                <div className="flex flex-wrap gap-2">
                  {safeEmployees.map((employee, index) => (
                    <span
                      key={index}
                      className="
                        inline-flex items-center gap-1.5 rounded-xl
                        border border-blue-200 bg-blue-50
                        px-3 py-2 text-xs font-black text-blue-700
                      "
                    >
                      <User className="h-3.5 w-3.5" />
                      {employee.name || employee}
                    </span>
                  ))}
                </div>
              </SectionCard>
            )}

            {/* Linked data */}
            {(task.client || task.transaction || task.ownership) && (
              <SectionCard
                icon={LinkIcon}
                title="الارتباط بسجلات النظام"
                subtitle="العلاقات المرتبطة بالمهمة داخل قاعدة البيانات."
              >
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  {task.client && (
                    <InfoMiniCard
                      icon={User}
                      title="العميل"
                      value={task.client.name?.ar || task.client.name}
                      tone="blue"
                    />
                  )}

                  {task.transaction && (
                    <InfoMiniCard
                      icon={Building2}
                      title="المعاملة"
                      value={task.transaction.transactionCode}
                      subValue={task.transaction.title}
                      tone="indigo"
                    />
                  )}

                  {task.ownership && (
                    <InfoMiniCard
                      icon={MapPin}
                      title="ملف الملكية"
                      value={`رقم ${task.ownership.deedNumber}`}
                      tone="emerald"
                    />
                  )}
                </div>
              </SectionCard>
            )}

            {/* Additional notes */}
            {task.additionalNotes && (
              <SectionCard
                icon={FileText}
                title="ملاحظات إضافية"
                subtitle="معلومات أو تنبيهات إضافية مرتبطة بالمهمة."
              >
                <div
                  className="
                    rounded-[24px] border border-amber-200
                    bg-amber-50 p-5
                    text-sm font-black leading-8 text-amber-900
                    whitespace-pre-wrap
                  "
                >
                  {task.additionalNotes}
                </div>
              </SectionCard>
            )}

            {/* Meta grid */}
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              {/* Creator */}
              <SectionCard
                icon={User}
                title="منشئ المهمة"
                subtitle="الموظف الذي قام بإضافة المهمة."
              >
                <InfoLine
                  icon={User}
                  label="الاسم"
                  value={task.creatorName || "غير معروف"}
                />

                <InfoLine
                  icon={Clock}
                  label="تاريخ الإنشاء"
                  value={
                    task.createdAt
                      ? new Date(task.createdAt).toLocaleString("ar-SA")
                      : "غير متوفر"
                  }
                />
              </SectionCard>

              {/* Due date */}
              <SectionCard
                icon={Calendar}
                title="تاريخ الاستحقاق"
                subtitle="موعد انتهاء أو تسليم المهمة."
              >
                <InfoLine
                  icon={Calendar}
                  label="التاريخ"
                  value={
                    task.dueDate
                      ? new Date(task.dueDate).toLocaleDateString("en-GB")
                      : "غير محدد"
                  }
                  dir="ltr"
                />

                <InfoLine
                  icon={Clock}
                  label="الحالة الزمنية"
                  value={getRemainingDaysText()}
                />
              </SectionCard>
            </div>

            {/* File attachment */}
            {task.filePath && (
              <SectionCard
                icon={FolderOpen}
                title="المرفقات والملفات"
                subtitle="الملفات أو المسارات المرتبطة بالمهمة."
              >
                <div
                  className="
                    flex flex-col gap-3 rounded-[24px]
                    border border-[#d8b46a]/25 bg-white/90
                    p-4 shadow-sm
                    sm:flex-row sm:items-center sm:justify-between
                  "
                >
                  <div className="flex min-w-0 items-center gap-3 overflow-hidden">
                    <span
                      className="
                        grid h-12 w-12 shrink-0 place-items-center
                        rounded-2xl bg-emerald-50 text-emerald-600
                      "
                    >
                      <FolderOpen className="h-6 w-6" />
                    </span>

                    <div className="min-w-0">
                      <p
                        className="
                          truncate text-sm font-black text-[#123f59]
                        "
                        dir="ltr"
                        title={task.filePath}
                      >
                        {task.filePath.split("/").pop()}
                      </p>

                      <p
                        className="
                          mt-1 truncate font-mono text-[10px]
                          text-[#64748b]
                        "
                        dir="ltr"
                        title={task.filePath}
                      >
                        {task.filePath}
                      </p>
                    </div>
                  </div>

                  <a
                    href={
                      task.filePath.startsWith("/")
                        ? `${
                            import.meta.env.VITE_API_URL ||
                            "https://details-worksystem1.com/api"
                          }${task.filePath}`
                        : task.filePath
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="
                      flex h-11 min-w-[140px] items-center justify-center gap-2
                      rounded-2xl bg-gradient-to-l
                      from-[#123f59] via-[#15536f] to-[#0e7490]
                      px-5 text-xs font-black text-white
                      shadow-[0_14px_30px_rgba(18,63,89,0.22)]
                      transition hover:-translate-y-[1px]
                    "
                  >
                    <Download className="h-4 w-4 text-[#e2bf74]" />
                    تحميل / فتح
                  </a>
                </div>
              </SectionCard>
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          className="
            shrink-0 border-t border-[#e8ddc8]
            bg-gradient-to-l from-[#fbf8f1] via-white to-[#eef7f6]
            px-5 py-4
          "
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[10px] font-bold text-[#64748b]">
              <ShieldCheck className="h-4 w-4 text-[#c5983c]" />
              بيانات المهمة مرتبطة بسجل النظام المركزي.
            </div>

            <button
              onClick={onClose}
              className="
                h-11 rounded-2xl bg-[#123f59]
                px-8 text-xs font-black text-white
                shadow-[0_14px_30px_rgba(18,63,89,0.22)]
                transition hover:bg-[#0f3448]
              "
              type="button"
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const SectionCard = ({ icon: Icon, title, subtitle, children }) => (
  <section
    className="
      overflow-hidden rounded-[28px]
      border border-[#d8b46a]/30 bg-white/90
      shadow-[0_16px_40px_rgba(18,63,89,0.08)]
      backdrop-blur-xl
    "
  >
    <div
      className="
        flex items-center gap-3 border-b border-[#e8ddc8]
        bg-gradient-to-l from-[#fbf8f1] via-white to-[#eef7f6]
        px-5 py-4
      "
    >
      <span
        className="
          grid h-10 w-10 place-items-center
          rounded-2xl bg-[#123f59] text-[#e2bf74]
        "
      >
        <Icon className="h-5 w-5" />
      </span>

      <div>
        <h4 className="text-sm font-black text-[#123f59]">
          {title}
        </h4>

        <p className="mt-0.5 text-[11px] font-bold text-[#64748b]">
          {subtitle}
        </p>
      </div>
    </div>

    <div className="p-5">{children}</div>
  </section>
);

const InfoMiniCard = ({
  icon: Icon,
  title,
  value,
  subValue,
  tone = "blue",
}) => {
  const tones = {
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-200",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
  };

  return (
    <div
      className="
        rounded-[22px] border border-[#d8b46a]/25
        bg-white p-4 shadow-sm
      "
    >
      <div className="flex items-start gap-3">
        <span
          className={`
            grid h-10 w-10 place-items-center rounded-2xl border
            ${tones[tone] || tones.blue}
          `}
        >
          <Icon className="h-5 w-5" />
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-black text-[#64748b]">
            {title}
          </p>

          <p
            className="mt-1 truncate text-sm font-black text-[#123f59]"
            title={value}
          >
            {value}
          </p>

          {subValue && (
            <p
              className="mt-1 truncate text-[10px] font-bold text-[#64748b]"
              title={subValue}
            >
              {subValue}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const InfoLine = ({
  icon: Icon,
  label,
  value,
  dir = "rtl",
}) => (
  <div
    className="
      flex items-start gap-3 rounded-2xl
      border border-[#d8b46a]/20 bg-[#fbf8f1]/70
      p-4
    "
  >
    <span
      className="
        grid h-10 w-10 shrink-0 place-items-center
        rounded-2xl bg-white text-[#123f59]
        shadow-sm
      "
    >
      <Icon className="h-5 w-5" />
    </span>

    <div className="min-w-0 flex-1">
      <p className="text-[10px] font-black text-[#64748b]">
        {label}
      </p>

      <p
        className="mt-1 break-words text-sm font-black text-[#123f59]"
        dir={dir}
      >
        {value}
      </p>
    </div>
  </div>
);