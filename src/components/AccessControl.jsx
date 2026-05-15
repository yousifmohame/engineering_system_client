import React, { useEffect, useMemo } from "react";
import { usePermissionBuilder } from "../context/PermissionBuilderContext";
import { usePermissions } from "../hooks/usePermissions";
import {
  CheckCircle2,
  ShieldAlert,
  LockKeyhole,
  ShieldCheck,
  Hash,
} from "lucide-react";

const formatPermissionNumber = (num) => {
  if (num === undefined || num === null || num === "") return null;

  const parsed = Number(num);
  if (Number.isNaN(parsed)) return null;

  return String(parsed).padStart(2, "0");
};

const removeOldNumberSuffix = (value) => {
  return String(value || "").replace(/[_-]\d{2,}$/, "");
};

export const buildPermissionCode = (code, permissionNumber) => {
  const rawCode = String(code || "").trim();
  const number = formatPermissionNumber(permissionNumber);

  if (!rawCode) return "";
  if (!number) return rawCode;

  const baseCode = removeOldNumberSuffix(rawCode).trim();
  return `${baseCode}_${number}`;
};

const AccessControl = ({
  code,
  permissionNumber,

  name,
  moduleName,
  tabName = "عام",
  type = "action",

  rangeStart = null,
  rangeEnd = null,

  children,
  fallback = null,
}) => {
  const {
    isBuilderMode,
    togglePermission,
    activeRolePermissions = [],
  } = usePermissionBuilder();

  const { hasPermission } = usePermissions();

  const finalCode = useMemo(() => {
    return buildPermissionCode(code, permissionNumber);
  }, [code, permissionNumber]);

  const assignedCodes = useMemo(() => {
    if (!Array.isArray(activeRolePermissions)) return [];

    return activeRolePermissions
      .map((permission) => {
        if (typeof permission === "string") return permission;
        return permission?.code;
      })
      .filter(Boolean);
  }, [activeRolePermissions]);

  const rangeLabel = useMemo(() => {
    const start = formatPermissionNumber(rangeStart);
    const end = formatPermissionNumber(rangeEnd);

    if (!start || !end) return null;
    return `${start} - ${end}`;
  }, [rangeStart, rangeEnd]);

  useEffect(() => {
    if (!finalCode || typeof window === "undefined") return;

    window.__WMS_PERMISSION_REGISTRY__ =
      window.__WMS_PERMISSION_REGISTRY__ || {};

    const registry = window.__WMS_PERMISSION_REGISTRY__;

    const currentSignature = `${moduleName || ""}::${tabName || ""}::${
      name || ""
    }::${type || ""}`;

    if (registry[finalCode] && registry[finalCode] !== currentSignature) {
      console.warn(
        `[AccessControl] Duplicate permission code detected: ${finalCode}`,
        {
          previous: registry[finalCode],
          current: currentSignature,
        },
      );
    } else {
      registry[finalCode] = currentSignature;
    }
  }, [finalCode, moduleName, tabName, name, type]);

  if (isBuilderMode) {
    const isAssigned = assignedCodes.includes(finalCode);

    return (
      <div
        className={`
          group relative mt-5 inline-block w-full rounded-2xl
          border-2 transition-all duration-300
          ${
            isAssigned
              ? `
                border-emerald-400/70
                bg-emerald-50/70
                shadow-[0_10px_28px_rgba(16,185,129,0.12)]
                hover:border-emerald-500
                hover:bg-emerald-100/80
              `
              : `
                border-rose-400/70 border-dashed
                bg-rose-50/70
                shadow-[0_10px_28px_rgba(244,63,94,0.10)]
                hover:border-rose-500
                hover:bg-rose-100/80
              `
          }
        `}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();

          togglePermission({
            code: finalCode,
            name,
            screenName: moduleName,
            tabName,
            level: type,
            permissionNumber,
            rangeStart,
            rangeEnd,
          });
        }}
        title={isAssigned ? "انقر لسحب الصلاحية" : "انقر لمنح الصلاحية"}
      >
        <div
          className={`
            absolute -top-4 right-4 z-[70]
            flex max-w-[calc(100%-2rem)] items-center gap-1.5
            rounded-2xl border px-3 py-1.5
            text-[10px] font-black shadow-lg
            transition-all duration-300
            group-hover:-translate-y-0.5
            ${
              isAssigned
                ? "border-emerald-300 bg-emerald-600 text-white"
                : "border-rose-300 bg-rose-600 text-white"
            }
          `}
        >
          {isAssigned ? (
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
          ) : (
            <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
          )}

          <span className="truncate">{name}</span>

          <span className="rounded-xl bg-white/15 px-1.5 py-0.5 font-mono text-[9px]">
            {finalCode}
          </span>
        </div>

        {rangeLabel && (
          <div
            className="
              absolute -top-4 left-4 z-[70]
              hidden items-center gap-1.5
              rounded-2xl border border-[#d8b46a]/35
              bg-[#123f59] px-3 py-1.5
              text-[9px] font-black text-[#e2bf74]
              shadow-lg md:flex
            "
            title="نطاق أرقام صلاحيات هذه الشاشة"
          >
            <Hash className="h-3 w-3" />
            {rangeLabel}
          </div>
        )}

        <div
          className={`
            absolute bottom-3 left-3 z-[65]
            flex items-center gap-1.5 rounded-2xl
            border px-2.5 py-1
            text-[9px] font-black
            ${
              isAssigned
                ? "border-emerald-200 bg-white text-emerald-700"
                : "border-rose-200 bg-white text-rose-700"
            }
          `}
        >
          {isAssigned ? (
            <>
              <ShieldCheck className="h-3 w-3" />
              ممنوحة
            </>
          ) : (
            <>
              <LockKeyhole className="h-3 w-3" />
              غير ممنوحة
            </>
          )}
        </div>

        <div
          className={`
            pointer-events-none rounded-2xl transition-all duration-300
            ${
              isAssigned
                ? "opacity-95 ring-1 ring-emerald-300/25"
                : "opacity-80 grayscale-[0.15] ring-1 ring-rose-300/25"
            }
          `}
        >
          {children}
        </div>

        <div
          className={`
            pointer-events-none absolute inset-0 rounded-2xl
            opacity-0 transition-opacity duration-300
            group-hover:opacity-100
            ${isAssigned ? "bg-emerald-500/[0.04]" : "bg-rose-500/[0.05]"}
          `}
        />
      </div>
    );
  }

  const isAuthorized = hasPermission(finalCode);

  if (!isAuthorized) {
    return fallback;
  }

  return <>{children}</>;
};

export default AccessControl;
