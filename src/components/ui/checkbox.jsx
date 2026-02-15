import React from "react";
import { Check } from "lucide-react";

// مكون Checkbox مخصص بسيط بدون مكتبات Radix UI المعقدة
const Checkbox = React.forwardRef(({ className, checked, onCheckedChange, disabled, ...props }, ref) => (
  <button
    type="button"
    role="checkbox"
    aria-checked={checked}
    disabled={disabled}
    ref={ref}
    onClick={() => !disabled && onCheckedChange?.(!checked)}
    className={`peer h-4 w-4 shrink-0 rounded-sm border border-blue-600 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
      checked ? "bg-blue-600 text-white" : "bg-white"
    } ${className}`}
    {...props}
  >
    {checked && (
      <span className="flex items-center justify-center text-current">
        <Check className="h-3 w-3" strokeWidth={3} />
      </span>
    )}
  </button>
));
Checkbox.displayName = "Checkbox";

export { Checkbox };