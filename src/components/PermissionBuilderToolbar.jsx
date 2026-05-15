import React, { useState, useEffect, useRef } from "react";
import { usePermissionBuilder } from "../context/PermissionBuilderContext";
import { useAuth } from "../context/AuthContext";
import { ShieldAlert, X } from "lucide-react";
import api from "../api/axios";

const PermissionBuilderToolbar = () => {
  const {
    isBuilderMode,
    setIsBuilderMode,
    activeRoleId,
    setActiveRoleId,
  } = usePermissionBuilder();

  const [roles, setRoles] = useState([]);

  // مرجع لقياس ارتفاع الشريط تلقائياً
  const toolbarRef = useRef(null);

  const { user } = useAuth();
  const isSuperAdmin = user?.email === "admin@wms.com";

  // جلب الأدوار
  useEffect(() => {
    if (isBuilderMode && isSuperAdmin) {
      api
        .get("/roles")
        .then((res) => setRoles(res.data))
        .catch(console.error);
    }
  }, [isBuilderMode, isSuperAdmin]);

  // إزاحة الصفحة للأسفل حسب ارتفاع الشريط
  useEffect(() => {
    if (!isSuperAdmin || !isBuilderMode) {
      document.body.style.paddingTop = "0px";
      return;
    }

    const updateBodyPadding = () => {
      if (toolbarRef.current) {
        const height = toolbarRef.current.offsetHeight;
        document.body.style.paddingTop = `${height}px`;
        document.body.style.transition = "padding-top 0.3s ease-in-out";
      }
    };

    updateBodyPadding();

    const resizeObserver = new ResizeObserver(() => updateBodyPadding());

    if (toolbarRef.current) {
      resizeObserver.observe(toolbarRef.current);
    }

    return () => {
      resizeObserver.disconnect();
      document.body.style.paddingTop = "0px";
    };
  }, [isBuilderMode, isSuperAdmin]);

  if (!isSuperAdmin) {
    return null;
  }

  // الزر العائم لتفعيل وضع البناء
  if (!isBuilderMode) {
    return (
      <button
        onClick={() => setIsBuilderMode(true)}
        className="
          fixed bottom-6 left-6 z-[9999]
          flex items-center gap-2
          rounded-2xl border border-[#d8b46a]/35
          bg-[#123f59] px-4 py-3
          text-white
          shadow-[0_18px_45px_rgba(18,63,89,0.35)]
          transition-all duration-300
          hover:-translate-y-1
          hover:bg-[#0f3448]
          hover:shadow-[0_22px_55px_rgba(18,63,89,0.45)]
        "
        title="تفعيل وضع بناء الصلاحيات"
        type="button"
      >
        <ShieldAlert className="h-5 w-5 text-[#e2bf74]" />

        <span className="hidden text-xs font-black sm:inline">
          بناء الصلاحيات
        </span>
      </button>
    );
  }

  // الشريط العلوي أثناء وضع البناء
  return (
    <div
      ref={toolbarRef}
      className="
        fixed left-0 right-0 top-0 z-[9999]
        border-b-4 border-[#c5983c]
        bg-gradient-to-l from-[#08111c] via-[#0f3448] to-[#123f59]
        px-4 py-3 text-white
        shadow-[0_18px_50px_rgba(15,23,42,0.35)]
        backdrop-blur-xl
      "
      dir="rtl"
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* Right side */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div
            className="
              flex items-center gap-2
              rounded-2xl border border-rose-400/25
              bg-rose-500/12 px-4 py-2
              text-sm font-black text-rose-100
              shadow-sm
            "
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-rose-400" />
            </span>

            <ShieldAlert className="h-5 w-5 text-rose-300" />

            <span>وضع تعيين الصلاحيات نشط</span>
          </div>

          <div className="hidden h-8 w-px bg-white/15 sm:block" />

          <div
            className="
              flex flex-col gap-2 rounded-2xl
              border border-white/10 bg-white/10
              p-2 backdrop-blur-md
              sm:flex-row sm:items-center
            "
          >
            <span className="px-1 text-[11px] font-black text-white/60">
              اختر الدور المستهدف:
            </span>

            <select
              value={activeRoleId}
              onChange={(e) => setActiveRoleId(e.target.value)}
              className="
                h-10 w-full rounded-xl
                border border-[#d8b46a]/35
                bg-white px-3
                text-sm font-black text-[#123f59]
                shadow-sm outline-none
                transition-all
                focus:border-[#c5983c]
                focus:ring-4
                focus:ring-[#c5983c]/10
                sm:w-56
              "
            >
              <option value="" disabled>
                -- حدد الدور الوظيفي --
              </option>

              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.nameAr || role.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Left side */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p
            className="
              hidden rounded-2xl border border-white/10
              bg-white/10 px-4 py-2
              text-[11px] font-bold leading-relaxed text-white/55
              md:block
            "
          >
            تصفح النظام بشكل طبيعي، ثم انقر على أي عنصر محدد بإطار أحمر أو أخضر
            لتسجيل الصلاحية أو سحبها.
          </p>

          <button
            onClick={() => {
              setIsBuilderMode(false);
              setActiveRoleId("");
            }}
            className="
              flex h-10 items-center justify-center gap-2
              rounded-2xl border border-rose-300/30
              bg-rose-500 px-4
              text-sm font-black text-white
              shadow-[0_10px_25px_rgba(244,63,94,0.25)]
              transition-all duration-300
              hover:-translate-y-[1px]
              hover:bg-rose-600
            "
            type="button"
          >
            إغلاق
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PermissionBuilderToolbar;