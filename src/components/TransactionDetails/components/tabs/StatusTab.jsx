import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  FileText,
  X,
  Save,
  Loader2,
  User,
  Upload,
  Trash2,
  ImageIcon,
  Send,
  Paperclip,
  Plus,
  Briefcase,
  CalendarDays,
  Check,
  History,
  PenLine,
  AlertTriangle,
  ShieldCheck,
  Clock,
  CheckCircle2,
  ClipboardList,
  Building2,
  FileBox,
  Sparkles,
  Activity,
  UserCheck,
  Timer,
} from "lucide-react";

const WORKFLOW_STEPS = [
  {
    id: "عند المهندس للدراسة",
    label: "عند المهندس للدراسة",
    shortLabel: "الدراسة",
    icon: Briefcase,
    description: "مرحلة التحضير والدراسة الفنية",
  },
  {
    id: "تم الرفع",
    label: "تم الرفع",
    shortLabel: "الرفع",
    icon: Send,
    description: "إدخال بيانات منصة بلدي / إحكام",
  },
  {
    id: "ملاحظات من الجهات",
    label: "ملاحظات من الجهات",
    shortLabel: "الملاحظات",
    icon: History,
    description: "متابعة توجيهات الجهات",
  },
  {
    id: "تم الاعتماد",
    label: "تم الاعتماد",
    shortLabel: "الاعتماد",
    icon: CheckCircle2,
    description: "اعتماد المعاملة وإرفاق المستندات",
  },
];

export const StatusTab = ({
  statusForm,
  setStatusForm,
  updateStatusMutation,
  safeAuthorityHistory,
  deleteAuthorityNoteMutation,
  backendUrl,
  handlePreviewAttachmentSafe,
  formatDateTime,
  safeAttachments,
  deleteAttachmentMutation,
  txType,

  persons,
  isSuperAdmin,
  addTaskMutation,
}) => {
  const [isAddingTask, setIsAddingTask] = useState(false);

  const [taskForm, setTaskForm] = useState({
    assigneeId: "",
    description: "",
    deadline: "",
    isUrgent: false,
  });

  const employees = persons?.filter((person) => person.role !== "عميل") || [];

  useEffect(() => {
    if (
      statusForm.currentStatus === "ملاحظات من الجهات" ||
      statusForm.currentStatus === "تم الاعتماد"
    ) {
      return;
    }

    const hasNewServiceNum = !!statusForm.serviceNumber;
    const hasNewHijriYear = !!statusForm.hijriYear1;
    const hasNewLicense = !!statusForm.licenseNumber;

    const hasOldLicenseOnly =
      !!statusForm.oldLicenseNumber || !!statusForm.hijriYear2;

    const hasNewData = hasNewServiceNum || hasNewHijriYear || hasNewLicense;

    let shouldAutoMoveToStage2 = false;

    if (txType === "تصحيح وضع مبني قائم") {
      if (hasNewData) shouldAutoMoveToStage2 = true;
    } else {
      if (hasNewData || hasOldLicenseOnly) shouldAutoMoveToStage2 = true;
    }

    if (shouldAutoMoveToStage2 && statusForm.currentStatus !== "تم الرفع") {
      setStatusForm((prev) => ({
        ...prev,
        currentStatus: "تم الرفع",
      }));
    }
  }, [
    statusForm.serviceNumber,
    statusForm.hijriYear1,
    statusForm.licenseNumber,
    statusForm.oldLicenseNumber,
    statusForm.hijriYear2,
    statusForm.currentStatus,
    txType,
    setStatusForm,
  ]);

  const handleChange = (field, value) => {
    setStatusForm({
      ...statusForm,
      [field]: value,
    });
  };

  const handleStepClick = (step) => {
    if (step === "تم الاعتماد" && !statusForm.approvalDate) {
      setStatusForm({
        ...statusForm,
        currentStatus: step,
        approvalDate: new Date().toISOString(),
      });

      return;
    }

    setStatusForm({
      ...statusForm,
      currentStatus: step,
    });
  };

  const handleAddTask = () => {
    if (!taskForm.assigneeId || !taskForm.description || !taskForm.deadline) {
      toast.error("أكمل بيانات المهمة");
      return;
    }

    addTaskMutation.mutate(taskForm, {
      onSuccess: () => {
        setIsAddingTask(false);

        setTaskForm({
          assigneeId: "",
          description: "",
          deadline: "",
          isUrgent: false,
        });
      },
    });
  };

  const handleSaveStatus = () => {
    updateStatusMutation.mutate(statusForm);
  };

  const isSaveDisabled =
    updateStatusMutation.isPending ||
    (statusForm.currentStatus === "ملاحظات من الجهات" &&
      !statusForm.newAuthorityNote);

  return (
    <div
      className="
        min-h-full space-y-5 p-4 pb-10 md:p-5
        bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white
        animate-in fade-in duration-300 font-[Tajawal]
      "
      dir="rtl"
    >
      {/* Header */}
      <div
        className="
          relative overflow-hidden rounded-[30px]
          border border-[#d8b46a]/30
          bg-gradient-to-l from-[#06111d] via-[#123f59] to-[#0e7490]
          p-5 text-white
          shadow-[0_20px_55px_rgba(18,63,89,0.18)]
        "
      >
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute right-[-70px] top-[-70px] h-44 w-44 rounded-full bg-[#e2bf74]/18 blur-3xl" />
          <div className="absolute left-[-80px] bottom-[-80px] h-52 w-52 rounded-full bg-cyan-400/12 blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <div
              className="
                grid h-14 w-14 shrink-0 place-items-center rounded-3xl
                border border-[#e2bf74]/35 bg-white/12
                text-[#e2bf74]
                shadow-[0_14px_30px_rgba(0,0,0,0.20)]
              "
            >
              <Activity className="h-7 w-7" />
            </div>

            <div className="min-w-0">
              <h2 className="truncate text-lg font-black md:text-xl">
                حالة المعاملة ومراحل الاعتماد
              </h2>

              <p className="mt-1 text-xs font-bold text-white/65">
                متابعة مسار المعاملة من الدراسة الهندسية إلى الاعتماد النهائي.
              </p>

              <div
                className="
                  mt-3 inline-flex items-center gap-1.5 rounded-xl
                  border border-white/15 bg-white/10
                  px-3 py-1.5 text-[10px]
                  font-black text-white/85
                "
              >
                <Sparkles className="h-3.5 w-3.5 text-[#e2bf74]" />
                انتقال ذكي للحالة عند إدخال بيانات الرفع
              </div>
            </div>
          </div>

          <StatusBadge status={statusForm.currentStatus} />
        </div>
      </div>

      {/* Stepper */}
      <WorkflowStepper
        currentStatus={statusForm.currentStatus}
        onStepClick={handleStepClick}
      />

      {/* Content */}
      <section
        className="
          overflow-hidden rounded-[30px]
          border border-[#d8b46a]/30 bg-white/90
          shadow-[0_18px_45px_rgba(18,63,89,0.10)]
          backdrop-blur-xl
        "
      >
        {statusForm.currentStatus === "عند المهندس للدراسة" && (
          <StudyStage
            isSuperAdmin={isSuperAdmin}
            isAddingTask={isAddingTask}
            setIsAddingTask={setIsAddingTask}
            taskForm={taskForm}
            setTaskForm={setTaskForm}
            employees={employees}
            addTaskMutation={addTaskMutation}
            handleAddTask={handleAddTask}
          />
        )}

        {statusForm.currentStatus === "تم الرفع" && (
          <UploadStage statusForm={statusForm} handleChange={handleChange} />
        )}

        {statusForm.currentStatus === "ملاحظات من الجهات" && (
          <AuthorityNotesStage
            statusForm={statusForm}
            setStatusForm={setStatusForm}
            safeAuthorityHistory={safeAuthorityHistory}
            deleteAuthorityNoteMutation={deleteAuthorityNoteMutation}
            backendUrl={backendUrl}
            handlePreviewAttachmentSafe={handlePreviewAttachmentSafe}
            formatDateTime={formatDateTime}
          />
        )}

        {statusForm.currentStatus === "تم الاعتماد" && (
          <ApprovalStage
            statusForm={statusForm}
            setStatusForm={setStatusForm}
            safeAttachments={safeAttachments}
            deleteAttachmentMutation={deleteAttachmentMutation}
            backendUrl={backendUrl}
            handlePreviewAttachmentSafe={handlePreviewAttachmentSafe}
          />
        )}

        {/* Footer */}
        <div
          className="
            border-t border-[#e8ddc8]
            bg-gradient-to-l from-[#fbf8f1] via-white to-[#eef7f6]
            px-5 py-4
          "
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-[10px] font-bold text-[#64748b]">
              <ShieldCheck className="h-4 w-4 text-[#c5983c]" />
              سيتم حفظ الحالة وتحديث سجل النظام المرتبط بهذه المعاملة.
            </div>

            <button
              onClick={handleSaveStatus}
              disabled={isSaveDisabled}
              className="
                flex h-11 items-center justify-center gap-2
                rounded-2xl bg-gradient-to-l from-[#123f59] via-[#15536f] to-[#0e7490]
                px-8 text-xs font-black text-white
                shadow-[0_14px_30px_rgba(18,63,89,0.22)]
                transition hover:-translate-y-[1px]
                disabled:cursor-not-allowed disabled:opacity-50
              "
              type="button"
            >
              {updateStatusMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin text-[#e2bf74]" />
              ) : (
                <Save className="h-4 w-4 text-[#e2bf74]" />
              )}
              حفظ الحالة وتحديث النظام
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

const WorkflowStepper = ({ currentStatus, onStepClick }) => {
  const currentIndex = WORKFLOW_STEPS.findIndex(
    (step) => step.id === currentStatus,
  );

  return (
    <div
      className="
        overflow-hidden rounded-[30px]
        border border-[#d8b46a]/30 bg-white/90
        p-4 shadow-[0_18px_45px_rgba(18,63,89,0.10)]
        backdrop-blur-xl
      "
    >
      <div className="relative">
        <div
          className="
            absolute right-6 left-6 top-[27px] hidden h-1
            rounded-full bg-[#e8ddc8] md:block
          "
        />

        <div
          className="
            absolute right-6 top-[27px] hidden h-1 rounded-full
            bg-gradient-to-l from-[#123f59] to-[#e2bf74]
            transition-all duration-500 md:block
          "
          style={{
            width:
              currentIndex > 0
                ? `${(currentIndex / (WORKFLOW_STEPS.length - 1)) * 100}%`
                : "0%",
          }}
        />

        <div className="relative grid grid-cols-1 gap-3 md:grid-cols-4">
          {WORKFLOW_STEPS.map((step, index) => {
            const StepIcon = step.icon;
            const isActive = step.id === currentStatus;
            const isPassed = currentIndex > index;

            return (
              <button
                key={step.id}
                onClick={() => onStepClick(step.id)}
                className={`
                  group relative flex items-center gap-3 rounded-[24px]
                  border p-3 text-right transition-all
                  md:flex-col md:items-center md:text-center
                  ${
                    isActive
                      ? "border-[#c5983c]/60 bg-[#f8efe0] shadow-[0_14px_34px_rgba(197,152,60,0.14)]"
                      : isPassed
                        ? "border-emerald-200 bg-emerald-50"
                        : "border-[#e8ddc8] bg-white hover:border-[#d8b46a]/55 hover:bg-[#fbf8f1]"
                  }
                `}
                type="button"
              >
                <div
                  className={`
                    grid h-12 w-12 shrink-0 place-items-center rounded-2xl border
                    transition-all md:h-14 md:w-14
                    ${
                      isActive
                        ? "border-[#c5983c] bg-[#123f59] text-[#e2bf74] scale-105"
                        : isPassed
                          ? "border-emerald-500 bg-emerald-500 text-white"
                          : "border-[#d8b46a]/30 bg-white text-[#64748b] group-hover:text-[#123f59]"
                    }
                  `}
                >
                  {isPassed ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <StepIcon className="h-5 w-5" />
                  )}
                </div>

                <div className="min-w-0">
                  <p
                    className={`
                      truncate text-xs font-black
                      ${
                        isActive
                          ? "text-[#123f59]"
                          : isPassed
                            ? "text-emerald-700"
                            : "text-[#64748b]"
                      }
                    `}
                  >
                    {step.label}
                  </p>

                  <p className="mt-1 hidden text-[10px] font-bold text-[#94a3b8] md:block">
                    {step.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const StudyStage = ({
  isSuperAdmin,
  isAddingTask,
  setIsAddingTask,
  taskForm,
  setTaskForm,
  employees,
  addTaskMutation,
  handleAddTask,
}) => (
  <div className="p-5 md:p-8">
    <div
      className="
        mb-6 flex flex-col items-center justify-center rounded-[28px]
        border border-blue-200 bg-blue-50/60 p-8 text-center
      "
    >
      <div
        className="
          mb-4 grid h-20 w-20 place-items-center rounded-[28px]
          border border-blue-200 bg-white text-blue-700
          shadow-[0_16px_34px_rgba(18,63,89,0.10)]
        "
      >
        <Briefcase className="h-10 w-10" />
      </div>

      <h3 className="mb-2 text-lg font-black text-[#123f59]">
        المعاملة قيد الدراسة الهندسية
      </h3>

      <p className="max-w-xl text-sm font-bold leading-7 text-[#64748b]">
        لم يتم رفع المعاملة على منصة بلدي / إحكام حتى الآن. يُرجى استكمال
        المخططات والدراسات الفنية المطلوبة قبل الانتقال لمرحلة الرفع.
      </p>
    </div>

    {isSuperAdmin && (
      <div
        className="
          overflow-hidden rounded-[28px]
          border border-indigo-200 bg-white
          shadow-[0_14px_34px_rgba(18,63,89,0.08)]
        "
      >
        <div
          className="
            flex flex-col gap-3 border-b border-indigo-100
            bg-gradient-to-l from-indigo-50 via-white to-[#fbf8f1]
            px-5 py-4 sm:flex-row sm:items-center sm:justify-between
          "
        >
          <div className="flex items-center gap-3">
            <span
              className="
                grid h-11 w-11 place-items-center rounded-2xl
                bg-indigo-600 text-white
              "
            >
              <CalendarDays className="h-5 w-5" />
            </span>

            <div>
              <h4 className="text-sm font-black text-indigo-900">
                توجيه مهام للموظفين
              </h4>

              <p className="mt-0.5 text-[11px] font-bold text-[#64748b]">
                دراسة / تصميم / تدقيق / تجهيز ملفات الرفع.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAddingTask(!isAddingTask)}
            className={`
              flex h-10 items-center justify-center gap-2 rounded-2xl
              px-4 text-xs font-black transition
              ${
                isAddingTask
                  ? "border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100"
                  : "border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
              }
            `}
            type="button"
          >
            {isAddingTask ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {isAddingTask ? "إلغاء" : "إضافة مهمة"}
          </button>
        </div>

        {isAddingTask ? (
          <div className="space-y-4 p-5 animate-in slide-in-from-top-2">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField label="اختر الموظف / المهندس" icon={UserCheck} required>
                <select
                  value={taskForm.assigneeId}
                  onChange={(e) =>
                    setTaskForm({
                      ...taskForm,
                      assigneeId: e.target.value,
                    })
                  }
                  className={INPUT_CLASS}
                >
                  <option value="">-- اختر موظف --</option>

                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.name}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField label="وقت التسليم المطلوب" icon={Timer} required>
                <input
                  type="datetime-local"
                  value={taskForm.deadline}
                  onChange={(e) =>
                    setTaskForm({
                      ...taskForm,
                      deadline: e.target.value,
                    })
                  }
                  className={`${INPUT_CLASS} font-mono`}
                  dir="ltr"
                />
              </FormField>

              <div className="md:col-span-2">
                <FormField label="وصف المطلوب" icon={ClipboardList} required>
                  <textarea
                    value={taskForm.description}
                    onChange={(e) =>
                      setTaskForm({
                        ...taskForm,
                        description: e.target.value,
                      })
                    }
                    className={`${INPUT_CLASS} min-h-[90px] resize-none leading-7`}
                    placeholder="مثال: مراجعة المخططات الإنشائية وتجهيزها للرفع..."
                  />
                </FormField>
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-[#e8ddc8] pt-4 sm:flex-row sm:items-center sm:justify-between">
              <label
                className="
                  flex cursor-pointer items-center gap-2 rounded-2xl
                  border border-rose-200 bg-rose-50 px-4 py-2
                  text-xs font-black text-rose-700
                "
              >
                <input
                  type="checkbox"
                  checked={taskForm.isUrgent}
                  onChange={(e) =>
                    setTaskForm({
                      ...taskForm,
                      isUrgent: e.target.checked,
                    })
                  }
                  className="h-4 w-4 accent-rose-600"
                />
                مهمة عاجلة
              </label>

              <button
                onClick={handleAddTask}
                disabled={addTaskMutation.isPending}
                className="
                  flex h-11 items-center justify-center gap-2
                  rounded-2xl bg-indigo-600 px-6
                  text-xs font-black text-white
                  shadow-[0_14px_30px_rgba(79,70,229,0.22)]
                  transition hover:-translate-y-[1px] hover:bg-indigo-700
                  disabled:cursor-not-allowed disabled:opacity-50
                "
                type="button"
              >
                {addTaskMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                توجيه المهمة
              </button>
            </div>
          </div>
        ) : (
          <div className="p-5 text-center text-xs font-bold leading-6 text-[#64748b]">
            يمكنك إسناد مهام رسم، مساحة، تدقيق أو تجهيز رفع للموظفين من هنا
            مباشرة. المهام المسندة ستظهر في تبويب مهام المعاملة.
          </div>
        )}
      </div>
    )}
  </div>
);

const UploadStage = ({ statusForm, handleChange }) => (
  <div className="p-5 md:p-6">
    <SectionHeader
      icon={Send}
      title="بيانات الرفع على المنصات"
      subtitle="أدخل أرقام الخدمة، الرخصة، والبيانات المرتبطة بمنصة بلدي / إحكام."
      tone="blue"
    />

    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
      <FormField label="رقم الخدمة / الطلب" icon={FileText} required>
        <input
          type="text"
          value={statusForm.serviceNumber || ""}
          onChange={(e) => handleChange("serviceNumber", e.target.value)}
          placeholder="مثال: 450000123"
          className={`${INPUT_CLASS} font-mono`}
          dir="ltr"
        />
      </FormField>

      <FormField label="سنة الخدمة / الطلب هجري" icon={CalendarDays}>
        <input
          type="text"
          value={statusForm.hijriYear1 || ""}
          onChange={(e) => handleChange("hijriYear1", e.target.value)}
          placeholder="مثال: 1445"
          className={`${INPUT_CLASS} font-mono`}
          dir="ltr"
        />
      </FormField>

      <FormField label="رقم الرخصة الجديدة" icon={FileBox}>
        <input
          type="text"
          value={statusForm.licenseNumber || ""}
          onChange={(e) => handleChange("licenseNumber", e.target.value)}
          placeholder="رقم الرخصة الجديد"
          className={`${INPUT_CLASS} font-mono`}
          dir="ltr"
        />
      </FormField>

      <FormField label="سنة الرخصة هجري" icon={CalendarDays}>
        <input
          type="text"
          value={statusForm.hijriYear2 || ""}
          onChange={(e) => handleChange("hijriYear2", e.target.value)}
          placeholder="مثال: 1445"
          className={`${INPUT_CLASS} font-mono`}
          dir="ltr"
        />
      </FormField>

      <div className="md:col-span-2">
        <div
          className="
            rounded-[24px] border border-amber-200 bg-amber-50/65 p-4
          "
        >
          <FormField
            label="رقم الرخصة القديمة للتجديد والتعديل"
            icon={AlertTriangle}
          >
            <input
              type="text"
              value={statusForm.oldLicenseNumber || ""}
              onChange={(e) => handleChange("oldLicenseNumber", e.target.value)}
              placeholder="مثال: 4100000000"
              className={`${INPUT_CLASS} font-mono`}
              dir="ltr"
            />
          </FormField>
        </div>
      </div>
    </div>
  </div>
);

const AuthorityNotesStage = ({
  statusForm,
  setStatusForm,
  safeAuthorityHistory,
  deleteAuthorityNoteMutation,
  backendUrl,
  handlePreviewAttachmentSafe,
  formatDateTime,
}) => (
  <div className="p-5 md:p-6">
    <SectionHeader
      icon={History}
      title="السجل الزمني للتوجيهات والملاحظات"
      subtitle="متابعة الملاحظات الواردة من الجهات وإضافة توجيهات جديدة."
      tone="amber"
    />

    <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
      {/* Timeline */}
      <div
        className="
          min-h-[420px] rounded-[28px]
          border border-[#d8b46a]/30 bg-[#fbf8f1]/65
          p-4
        "
      >
        {safeAuthorityHistory.length > 0 ? (
          <div className="relative mr-4 max-h-[460px] space-y-5 overflow-y-auto border-r-2 border-[#d8b46a]/45 pr-7 custom-scrollbar-slim">
            {safeAuthorityHistory.map((note, index) => {
              const safeUrl = note.attachment?.startsWith("http")
                ? note.attachment
                : note.attachment
                  ? `${backendUrl}${note.attachment}`
                  : null;

              return (
                <div key={index} className="relative">
                  <div
                    className="
                      absolute -right-[39px] top-5 h-7 w-7 rounded-full
                      border-4 border-[#c5983c] bg-white
                      shadow-sm
                    "
                  >
                    <div className="mx-auto mt-[5px] h-2.5 w-2.5 rounded-full bg-[#c5983c]" />
                  </div>

                  <div
                    className="
                      overflow-hidden rounded-[24px]
                      border border-[#d8b46a]/30 bg-white
                      shadow-sm transition hover:shadow-[0_14px_34px_rgba(18,63,89,0.12)]
                    "
                  >
                    <div
                      className="
                        flex flex-col gap-3 border-b border-[#e8ddc8]
                        bg-white px-4 py-3
                        sm:flex-row sm:items-start sm:justify-between
                      "
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="
                            grid h-9 w-9 place-items-center rounded-2xl
                            bg-amber-50 text-amber-700
                          "
                        >
                          <User className="h-4 w-4" />
                        </span>

                        <div>
                          <div className="text-[11px] font-black text-[#123f59]">
                            {note.addedBy || "موظف النظام"}
                          </div>

                          <div
                            className="
                              mt-1 font-mono text-[10px] font-bold text-[#94a3b8]
                            "
                            dir="ltr"
                          >
                            {formatDateTime(note.date)}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={(event) => {
                          event.preventDefault();

                          if (window.confirm("حذف هذه الملاحظة نهائياً؟")) {
                            const updatedHistory = safeAuthorityHistory.filter(
                              (_, i) => i !== index,
                            );

                            deleteAuthorityNoteMutation.mutate(updatedHistory);
                          }
                        }}
                        disabled={deleteAuthorityNoteMutation.isPending}
                        className="
                          grid h-9 w-9 place-items-center rounded-xl
                          border border-rose-200 bg-rose-50
                          text-rose-600 transition hover:bg-rose-100
                          disabled:cursor-not-allowed disabled:opacity-50
                        "
                        type="button"
                        title="حذف الملاحظة"
                      >
                        {deleteAuthorityNoteMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>

                    <div className="px-4 py-4">
                      <p className="whitespace-pre-wrap text-sm font-bold leading-8 text-[#334155]">
                        {note.text}
                      </p>

                      <div className="mt-4 border-t border-[#e8ddc8] pt-3">
                        {safeUrl ? (
                          <button
                            onClick={(event) => {
                              event.preventDefault();
                              handlePreviewAttachmentSafe(
                                safeUrl,
                                "مرفق الملاحظة",
                              );
                            }}
                            className="
                              inline-flex items-center gap-1.5 rounded-2xl
                              border border-blue-200 bg-blue-50
                              px-3 py-2 text-[11px]
                              font-black text-blue-700
                              transition hover:bg-blue-100
                            "
                            type="button"
                          >
                            <ImageIcon className="h-4 w-4" />
                            معاينة المرفق
                          </button>
                        ) : (
                          <span className="text-[10px] font-bold text-[#94a3b8]">
                            بدون مرفقات
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={History}
            title="لا يوجد سجل ملاحظات سابق"
            message="ستظهر هنا التوجيهات والملاحظات الواردة من الجهات بعد تسجيلها."
          />
        )}
      </div>

      {/* New note */}
      <div
        className="
          rounded-[28px] border border-amber-200
          bg-amber-50/65 p-5
        "
      >
        <div className="mb-4 flex items-center gap-3">
          <span
            className="
              grid h-11 w-11 place-items-center rounded-2xl
              bg-amber-500 text-white
            "
          >
            <PenLine className="h-5 w-5" />
          </span>

          <div>
            <h4 className="text-sm font-black text-amber-900">
              تدوين توجيه أو ملاحظة جديدة
            </h4>

            <p className="mt-0.5 text-[11px] font-bold text-amber-700/75">
              يمكن إرفاق صورة أو ملف داعم مع الملاحظة.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <textarea
            value={statusForm.newAuthorityNote || ""}
            onChange={(e) =>
              setStatusForm({
                ...statusForm,
                newAuthorityNote: e.target.value,
              })
            }
            className={`
              ${INPUT_CLASS}
              min-h-[190px] resize-none bg-white leading-7
            `}
            placeholder="اكتب التوجيه الجديد أو الملاحظة الواردة من الجهة..."
          />

          <label
            className="
              flex cursor-pointer items-center justify-center gap-2
              rounded-2xl border-2 border-dashed border-amber-300
              bg-white px-5 py-4 text-xs font-black text-amber-700
              transition hover:bg-amber-50
            "
          >
            <Upload className="h-4 w-4" />

            <span className="truncate">
              {statusForm.noteAttachment
                ? statusForm.noteAttachment.name
                : "إرفاق صورة من الملاحظة اختياري"}
            </span>

            <input
              type="file"
              className="hidden"
              onChange={(e) =>
                setStatusForm({
                  ...statusForm,
                  noteAttachment: e.target.files[0],
                })
              }
            />
          </label>
        </div>
      </div>
    </div>
  </div>
);

const ApprovalStage = ({
  statusForm,
  setStatusForm,
  safeAttachments,
  deleteAttachmentMutation,
  backendUrl,
  handlePreviewAttachmentSafe,
}) => (
  <div className="p-5 md:p-8">
    <div
      className="
        mb-6 flex flex-col items-center justify-center rounded-[28px]
        border border-emerald-200 bg-emerald-50/70
        p-8 text-center
      "
    >
      <div
        className="
          mb-4 grid h-20 w-20 place-items-center rounded-[28px]
          border-[4px] border-emerald-200 bg-white
          text-emerald-600 shadow-inner
        "
      >
        <Check className="h-10 w-10" />
      </div>

      <h3 className="mb-2 text-xl font-black text-emerald-800">
        تم اعتماد المعاملة بنجاح
      </h3>

      <p className="max-w-xl text-sm font-bold leading-7 text-emerald-700/80">
        تم تفعيل عدادات التحصيل الآلية للمبالغ المتبقية على العميل بناءً على خطة
        الدفع المبرمجة.
      </p>
    </div>

    <div
      className="
        overflow-hidden rounded-[28px]
        border border-[#d8b46a]/30 bg-white
        shadow-[0_14px_34px_rgba(18,63,89,0.08)]
      "
    >
      <div
        className="
          flex flex-col gap-3 border-b border-[#e8ddc8]
          bg-gradient-to-l from-[#fbf8f1] via-white to-[#eef7f6]
          px-5 py-4 sm:flex-row sm:items-center sm:justify-between
        "
      >
        <div className="flex items-center gap-3">
          <span
            className="
              grid h-11 w-11 place-items-center rounded-2xl
              bg-[#123f59] text-[#e2bf74]
            "
          >
            <Paperclip className="h-5 w-5" />
          </span>

          <div>
            <h4 className="text-sm font-black text-[#123f59]">
              مستندات ومرفقات المعاملة
            </h4>

            <p className="mt-0.5 text-[11px] font-bold text-[#64748b]">
              إدارة مستندات الاعتماد النهائية والمرفقات الجديدة.
            </p>
          </div>
        </div>

        <button
          onClick={() =>
            setStatusForm({
              ...statusForm,
              approvalAttachments: [
                ...(statusForm.approvalAttachments || []),
                { file: null, name: "" },
              ],
            })
          }
          className="
            flex h-10 items-center justify-center gap-2 rounded-2xl
            border border-blue-200 bg-blue-50
            px-4 text-xs font-black text-blue-700
            transition hover:bg-blue-100
          "
          type="button"
        >
          <Plus className="h-4 w-4" />
          رفع مرفق جديد
        </button>
      </div>

      <div className="space-y-6 p-5">
        {safeAttachments.length > 0 && (
          <div>
            <p className="mb-3 text-xs font-black text-[#64748b]">
              المستندات المحفوظة في النظام:
            </p>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {safeAttachments.map((file, index) => {
                let safeName =
                  file.name || file.description || `مرفق ${index + 1}`;

                try {
                  safeName = decodeURIComponent(safeName);
                } catch (error) {
                  // Keep original name if decoding fails
                }

                const safeUrl = file.url?.startsWith("http")
                  ? file.url
                  : `${backendUrl}${file.url}`;

                return (
                  <div
                    key={`saved-${index}`}
                    className="
                      flex items-center justify-between gap-3
                      rounded-[22px] border border-[#e8ddc8]
                      bg-[#fbf8f1]/70 p-3
                      transition hover:border-blue-300 hover:bg-blue-50/45
                    "
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span
                        className="
                          grid h-10 w-10 shrink-0 place-items-center
                          rounded-2xl border border-blue-200
                          bg-white text-blue-600
                        "
                      >
                        <FileText className="h-5 w-5" />
                      </span>

                      <span
                        className="truncate text-xs font-black text-[#123f59]"
                        title={safeName}
                      >
                        {safeName}
                      </span>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        onClick={(event) => {
                          event.preventDefault();
                          handlePreviewAttachmentSafe(safeUrl, safeName);
                        }}
                        className="
                          rounded-xl border border-blue-200
                          bg-blue-50 px-3 py-1.5
                          text-[10px] font-black text-blue-700
                          transition hover:bg-blue-100
                        "
                        type="button"
                      >
                        معاينة
                      </button>

                      <button
                        onClick={(event) => {
                          event.preventDefault();

                          if (window.confirm("حذف المرفق نهائياً؟")) {
                            deleteAttachmentMutation.mutate(file.url);
                          }
                        }}
                        className="
                          grid h-8 w-8 place-items-center rounded-xl
                          border border-rose-200 bg-rose-50
                          text-rose-600 transition hover:bg-rose-100
                        "
                        type="button"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {statusForm.approvalAttachments?.length > 0 && (
          <div className="space-y-3 border-t border-dashed border-[#d8b46a]/40 pt-5">
            <p className="text-xs font-black text-blue-700">
              مرفقات جديدة بانتظار الحفظ:
            </p>

            {statusForm.approvalAttachments.map((attachment, index) => (
              <div
                key={`new-${index}`}
                className="
                  grid grid-cols-1 gap-3 rounded-[22px]
                  border border-blue-100 bg-blue-50/35
                  p-3 animate-in slide-in-from-top-2
                  md:grid-cols-12
                "
              >
                <input
                  type="text"
                  value={attachment.name}
                  onChange={(event) => {
                    const newAttachments = [
                      ...statusForm.approvalAttachments,
                    ];

                    newAttachments[index].name = event.target.value;

                    setStatusForm({
                      ...statusForm,
                      approvalAttachments: newAttachments,
                    });
                  }}
                  placeholder="اسم المستند، مثال: رخصة البناء النهائية"
                  className={`${INPUT_CLASS} md:col-span-5`}
                />

                <label
                  className="
                    flex cursor-pointer items-center justify-center gap-2
                    rounded-2xl border border-blue-300
                    bg-white px-4 py-3
                    text-xs font-black text-blue-700
                    transition hover:bg-blue-50 md:col-span-6
                  "
                >
                  <Upload className="h-4 w-4" />

                  <span className="max-w-[220px] truncate">
                    {attachment.file ? attachment.file.name : "اختر ملف..."}
                  </span>

                  <input
                    type="file"
                    className="hidden"
                    onChange={(event) => {
                      const newAttachments = [
                        ...statusForm.approvalAttachments,
                      ];

                      newAttachments[index].file = event.target.files[0];

                      if (!newAttachments[index].name && event.target.files[0]) {
                        newAttachments[index].name = event.target.files[0].name;
                      }

                      setStatusForm({
                        ...statusForm,
                        approvalAttachments: newAttachments,
                      });
                    }}
                  />
                </label>

                <button
                  onClick={() => {
                    const newAttachments =
                      statusForm.approvalAttachments.filter(
                        (_, itemIndex) => itemIndex !== index,
                      );

                    setStatusForm({
                      ...statusForm,
                      approvalAttachments: newAttachments,
                    });
                  }}
                  className="
                    grid h-12 place-items-center rounded-2xl
                    border border-rose-200 bg-white text-rose-600
                    transition hover:bg-rose-50 md:col-span-1
                  "
                  type="button"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {safeAttachments.length === 0 &&
          (!statusForm.approvalAttachments ||
            statusForm.approvalAttachments.length === 0) && (
            <EmptyState
              icon={Paperclip}
              title="لا توجد مرفقات للاعتماد"
              message='اضغط على "رفع مرفق جديد" لإضافة مستندات الاعتماد النهائية.'
            />
          )}
      </div>
    </div>
  </div>
);

const SectionHeader = ({ icon: Icon, title, subtitle, tone = "blue" }) => {
  const tones = {
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
  };

  return (
    <div
      className="
        mb-6 flex items-center gap-3 border-b border-[#e8ddc8] pb-4
      "
    >
      <span
        className={`
          grid h-11 w-11 place-items-center rounded-2xl border
          ${tones[tone] || tones.blue}
        `}
      >
        <Icon className="h-5 w-5" />
      </span>

      <div>
        <h3 className="text-sm font-black text-[#123f59]">{title}</h3>

        <p className="mt-0.5 text-[11px] font-bold text-[#64748b]">
          {subtitle}
        </p>
      </div>
    </div>
  );
};

const FormField = ({ label, icon: Icon, required, children }) => (
  <div>
    <label className="mb-1.5 flex items-center gap-1.5 text-xs font-black text-[#123f59]">
      {Icon && <Icon className="h-3.5 w-3.5 text-[#c5983c]" />}
      {label}
      {required && <span className="text-rose-500">*</span>}
    </label>

    {children}
  </div>
);

const StatusBadge = ({ status }) => {
  const config = {
    "عند المهندس للدراسة": {
      icon: Briefcase,
      className: "border-blue-300/25 bg-blue-400/15 text-blue-100",
      label: "قيد الدراسة",
    },
    "تم الرفع": {
      icon: Send,
      className: "border-cyan-300/25 bg-cyan-400/15 text-cyan-100",
      label: "تم الرفع",
    },
    "ملاحظات من الجهات": {
      icon: History,
      className: "border-amber-300/25 bg-amber-400/15 text-amber-100",
      label: "توجد ملاحظات",
    },
    "تم الاعتماد": {
      icon: CheckCircle2,
      className: "border-emerald-300/25 bg-emerald-400/15 text-emerald-100",
      label: "معتمدة",
    },
  };

  const selected = config[status] || config["عند المهندس للدراسة"];
  const Icon = selected.icon;

  return (
    <div
      className={`
        flex w-fit items-center gap-2 rounded-2xl border
        px-4 py-2 text-xs font-black
        ${selected.className}
      `}
    >
      <Icon className="h-4 w-4" />
      {selected.label}
    </div>
  );
};

const EmptyState = ({ icon: Icon, title, message }) => (
  <div
    className="
      flex min-h-[240px] flex-col items-center justify-center
      rounded-[28px] border border-dashed border-[#d8b46a]/40
      bg-white/75 px-5 py-12 text-center
      shadow-[0_18px_45px_rgba(18,63,89,0.08)]
    "
  >
    <div
      className="
        mb-4 grid h-16 w-16 place-items-center
        rounded-[24px] bg-gradient-to-br from-[#123f59] to-[#0e7490]
        text-[#e2bf74]
        shadow-[0_16px_34px_rgba(18,63,89,0.22)]
      "
    >
      <Icon className="h-8 w-8" />
    </div>

    <p className="text-sm font-black text-[#123f59]">{title}</p>

    <p className="mt-1 max-w-sm text-xs font-bold leading-6 text-[#64748b]">
      {message}
    </p>
  </div>
);

const INPUT_CLASS = `
  h-12 w-full rounded-2xl
  border border-[#d8b46a]/25 bg-white
  px-4 text-sm font-bold text-[#123f59]
  shadow-sm outline-none transition-all
  placeholder:text-slate-400
  focus:border-[#c5983c]/70
  focus:bg-white
  focus:ring-4 focus:ring-[#c5983c]/10
`;