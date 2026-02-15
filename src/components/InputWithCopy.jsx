import React from 'react';
import { Copy } from 'lucide-react';
import { toast } from 'react-hot-toast'; // أو sonner حسب ما تستخدم

export const InputWithCopy = ({ label, className, value, ...props }) => {
  const handleCopy = () => {
    if (value) {
      navigator.clipboard.writeText(value.toString());
      toast.success('تم النسخ');
    }
  };

  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-gray-700">{label}</label>
      <div className="relative">
        <input
          value={value}
          {...props}
          className={`w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none pl-8 ${className || ''}`}
        />
        <button
          type="button"
          onClick={handleCopy}
          className="absolute left-2 top-2.5 text-gray-400 hover:text-blue-600"
        >
          <Copy size={14} />
        </button>
      </div>
    </div>
  );
};

export const TextAreaWithCopy = ({ label, ...props }) => (
  <div className="space-y-1">
    <label className="text-xs font-medium text-gray-700">{label}</label>
    <textarea
      {...props}
      className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none"
    />
  </div>
);

export const SelectWithCopy = ({ label, options, ...props }) => (
  <div className="space-y-1">
    <label className="text-xs font-medium text-gray-700">{label}</label>
    <select
      {...props}
      className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
    >
      <option value="" disabled>اختر...</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);