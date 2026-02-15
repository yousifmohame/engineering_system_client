import React from "react";
import { Controller, FormProvider, useFormContext } from "react-hook-form";

const Form = FormProvider;

const FormField = ({ ...props }) => {
  return <Controller {...props} />;
};

const FormItem = React.forwardRef(({ className, ...props }, ref) => {
  return <div ref={ref} className={`space-y-2 ${className}`} {...props} />;
});
FormItem.displayName = "FormItem";

const FormLabel = React.forwardRef(({ className, ...props }, ref) => {
  return <label ref={ref} className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`} {...props} />;
});
FormLabel.displayName = "FormLabel";

const FormControl = React.forwardRef(({ children, ...props }, ref) => {
  return <div ref={ref} {...props}>{children}</div>;
});
FormControl.displayName = "FormControl";

const FormMessage = React.forwardRef(({ className, children, ...props }, ref) => {
  const { formState } = useFormContext();
  const { name } = props; // يفترض تمرير الاسم، أو استخدام السياق
  // للتبسيط، الكود الحالي لا يعتمد بشدة على FormMessage لعرض الأخطاء، لكن وجود المكون يمنع الانهيار
  return (
    <p ref={ref} className={`text-sm font-medium text-red-500 ${className}`} {...props}>
      {children}
    </p>
  );
});
FormMessage.displayName = "FormMessage";

export { Form, FormField, FormItem, FormLabel, FormControl, FormMessage };