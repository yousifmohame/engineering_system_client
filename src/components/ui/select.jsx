import React from "react";

// نسخة مبسطة جداً لـ Select لتعمل بدون مكتبات خارجية معقدة
// إذا كنت تريد Select احترافي، يفضل استخدام مكتبة Radix UI أو Headless UI
// لكن هذا سيفي بالغرض للكود الحالي

export const Select = ({ value, onValueChange, children, disabled }) => {
  // هذا المكون هو "حاوية" وهمية ليتوافق مع طريقة استدعاء shadcn
  // سنقوم بتمرير الـ children ومعالجتها يدوياً أو استخدام سياق (Context)
  // للتبسيط الشديد في JSX النقي:
  
  const handleChange = (e) => {
    if (onValueChange) onValueChange(e.target.value);
  };

  return (
    <div className="relative">
      <select
        value={value}
        onChange={handleChange}
        disabled={disabled}
        className="flex h-10 w-full items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {/* نقوم بتصفية الأطفال لاستخراج خيارات SelectItem */}
        {React.Children.map(children, (child) => {
           if (child.type === SelectTrigger) return null; // لا نعرض الـ trigger هنا
           if (child.type === SelectContent) return child.props.children;
           return child;
        })}
      </select>
    </div>
  );
};

export const SelectTrigger = ({ children, className }) => null; // لا يُرسم فعلياً في النسخة المبسطة
export const SelectValue = () => null; // لا يُرسم
export const SelectContent = ({ children }) => <>{children}</>;
export const SelectItem = ({ value, children }) => <option value={value}>{children}</option>;