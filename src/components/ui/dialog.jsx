import React, { createContext, useContext } from "react";
import { X } from "lucide-react";

// 1. إنشاء السياق لمشاركة دالة الإغلاق بين المكونات
const DialogContext = createContext({});

export const Dialog = ({ open, onOpenChange, children }) => {
  // إذا لم يكن مفتوحاً، لا نعرض شيئاً
  if (!open) return null;

  return (
    <DialogContext.Provider value={{ onOpenChange }}>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
        {/* طبقة خلفية للإغلاق عند الضغط خارج الصندوق */}
        <div 
          className="absolute inset-0 z-40" 
          onClick={() => onOpenChange(false)} 
        />
        
        {/* حاوية المحتوى */}
        <div className="relative z-50 w-full max-w-lg">
          {children}
        </div>
      </div>
    </DialogContext.Provider>
  );
};

export const DialogContent = ({ className, children, ...props }) => {
  const { onOpenChange } = useContext(DialogContext);

  return (
    <div 
      className={`relative bg-white rounded-lg shadow-lg border p-6 w-full mx-auto ${className || ''}`} 
      {...props}
    >
      {/* زر الإغلاق (X) في الزاوية */}
      <button
        type="button"
        onClick={() => onOpenChange(false)}
        className="absolute left-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none"
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </button>
      {children}
    </div>
  );
};

export const DialogHeader = ({ className, children, ...props }) => (
  <div className={`flex flex-col space-y-1.5 text-center sm:text-right mb-4 ${className || ''}`} {...props}>
    {children}
  </div>
);

export const DialogTitle = ({ className, children, ...props }) => (
  <h2 className={`text-lg font-semibold leading-none tracking-tight ${className || ''}`} {...props}>
    {children}
  </h2>
);

export const DialogDescription = ({ className, children, ...props }) => (
  <p className={`text-sm text-gray-500 ${className || ''}`} {...props}>
    {children}
  </p>
);

export const DialogFooter = ({ className, children, ...props }) => (
  <div className={`flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 gap-2 mt-4 ${className || ''}`} {...props}>
    {children}
  </div>
);

// ✅ المكون الناقص: DialogClose
export const DialogClose = ({ asChild, children, ...props }) => {
  const { onOpenChange } = useContext(DialogContext);

  const handleClose = (e) => {
    // استدعاء دالة الإغلاق
    onOpenChange(false);
    
    // إذا كان العنصر الطفل لديه onClick خاص به، نقوم باستدعائه أيضاً
    if (children?.props?.onClick) {
      children.props.onClick(e);
    }
  };

  // إذا تم استخدام asChild، نقوم بدمج وظيفة الإغلاق مع العنصر الموجود داخله
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, { ...props, onClick: handleClose });
  }

  return (
    <button type="button" onClick={handleClose} {...props}>
      {children}
    </button>
  );
};