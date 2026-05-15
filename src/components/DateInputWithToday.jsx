import React from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Calendar } from "lucide-react";

const DateInputWithToday = ({
  id,
  label,
  value,
  onChange,
  className = "",
  ...props
}) => {
  const setToday = () => {
    const today = new Date().toISOString().split("T")[0];

    // Compatible avec react-hook-form ou state normal
    const event = {
      target: {
        value: today,
        name: id,
      },
    };

    if (onChange) {
      onChange(event);
    }
  };

  return (
    <div className="space-y-1.5" dir="rtl">
      {label && (
        <Label
          htmlFor={id}
          className="
            flex items-center gap-1.5
            text-[11px] font-black text-[#64748b]
          "
        >
          <Calendar className="h-3.5 w-3.5 text-[#c5983c]" />
          {label}
        </Label>
      )}

      <div className="flex items-center gap-2">
        <div className="relative min-w-0 flex-1">
          <Input
            type="date"
            id={id}
            value={value || ""}
            onChange={onChange}
            dir="ltr"
            className={`
              h-11 w-full rounded-2xl
              border border-[#d8b46a]/35
              bg-[#fbf8f1]/70
              px-4 font-mono text-xs font-black
              text-[#123f59]
              shadow-sm outline-none
              transition-all duration-200
              placeholder:text-[#94a3b8]
              focus:border-[#c5983c]
              focus:bg-white
              focus:ring-4
              focus:ring-[#c5983c]/10
              ${className}
            `}
            {...props}
          />
        </div>

        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={setToday}
          title="تعيين تاريخ اليوم"
          className="
            h-11 w-11 shrink-0 rounded-2xl
            border border-[#d8b46a]/35
            bg-[#123f59]
            text-[#e2bf74]
            shadow-sm
            transition-all duration-200
            hover:-translate-y-[1px]
            hover:border-[#c5983c]
            hover:bg-[#0f3448]
            hover:text-[#f5d99b]
            focus:ring-4
            focus:ring-[#c5983c]/10
          "
        >
          <Calendar className="h-4.5 w-4.5" />
        </Button>
      </div>
    </div>
  );
};

export default DateInputWithToday;