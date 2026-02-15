import React from "react";

// مكون بسيط لنافذة التنبيه لا يعتمد على مكتبات خارجية
const AlertDialog = ({ open, onOpenChange, children }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="relative z-50 w-full max-w-lg">{children}</div>
      {/* طبقة شفافة لإغلاق النافذة عند الضغط خارجها */}
      <div className="absolute inset-0 z-40" onClick={() => onOpenChange(false)} />
    </div>
  );
};

const AlertDialogContent = ({ className, children, ...props }) => (
  <div className={`grid w-full max-w-lg gap-4 border bg-white p-6 shadow-lg duration-200 sm:rounded-lg md:w-full ${className}`} {...props}>
    {children}
  </div>
);

const AlertDialogHeader = ({ className, children, ...props }) => (
  <div className={`flex flex-col space-y-2 text-center sm:text-right ${className}`} {...props}>
    {children}
  </div>
);

const AlertDialogFooter = ({ className, children, ...props }) => (
  <div className={`flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 gap-2 ${className}`} {...props}>
    {children}
  </div>
);

const AlertDialogTitle = ({ className, children, ...props }) => (
  <h2 className={`text-lg font-semibold ${className}`} {...props}>
    {children}
  </h2>
);

const AlertDialogDescription = ({ className, children, ...props }) => (
  <p className={`text-sm text-gray-500 ${className}`} {...props}>
    {children}
  </p>
);

const AlertDialogAction = ({ className, onClick, children, ...props }) => (
  <button
    className={`inline-flex h-10 items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    onClick={onClick}
    {...props}
  >
    {children}
  </button>
);

const AlertDialogCancel = ({ className, onClick, children, ...props }) => (
  // في بعض الحالات يتم التحكم بالإغلاق من المكون الأب، لذا onClick اختياري هنا
  <button
    className={`mt-2 inline-flex h-10 items-center justify-center rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:mt-0 ${className}`}
    onClick={onClick}
    {...props}
  >
    {children}
  </button>
);

export {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
};