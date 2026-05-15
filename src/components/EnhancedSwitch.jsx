import React from "react";
import { Switch } from "./ui/switch";

export const EnhancedSwitch = ({
  id,
  checked,
  onCheckedChange,
  label,
  description,
  disabled = false,
}) => {
  return (
    <div
      className={`
        flex w-full items-center justify-between gap-4
        rounded-2xl border px-4 py-3
        shadow-sm transition-all duration-200
        ${
          checked
            ? "border-emerald-300 bg-emerald-50/70"
            : "border-[#d8b46a]/30 bg-[#fbf8f1]/70"
        }
        ${disabled ? "cursor-not-allowed opacity-60" : "hover:border-[#c5983c]/55"}
      `}
      dir="rtl"
    >
      <div className="flex min-w-0 flex-col">
        <label
          htmlFor={id}
          className={`
            cursor-pointer text-sm font-black
            ${checked ? "text-emerald-800" : "text-[#123f59]"}
            ${disabled ? "cursor-not-allowed" : ""}
          `}
        >
          {label}
        </label>

        {description && (
          <span className="mt-0.5 text-xs font-bold leading-relaxed text-[#64748b]">
            {description}
          </span>
        )}
      </div>

      <div className="shrink-0">
        <Switch
          id={id}
          checked={checked}
          onCheckedChange={onCheckedChange}
          disabled={disabled}
          className="
            data-[state=checked]:bg-emerald-600
            data-[state=unchecked]:bg-[#d8b46a]/45
          "
        />
      </div>
    </div>
  );
};