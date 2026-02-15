import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

// سياق بسيط لمشاركة الحالة بين المكونات
const AccordionContext = React.createContext({});

const Accordion = ({ children, type = "single", collapsible = false, className, ...props }) => {
  const [openItems, setOpenItems] = useState([]);

  const toggleItem = (value) => {
    if (type === "single") {
      setOpenItems(prev => (prev.includes(value) ? (collapsible ? [] : prev) : [value]));
    } else {
      setOpenItems(prev => (prev.includes(value) ? prev.filter(i => i !== value) : [...prev, value]));
    }
  };

  return (
    <AccordionContext.Provider value={{ openItems, toggleItem }}>
      <div className={className} {...props}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
};

const AccordionItem = ({ children, value, className, ...props }) => {
  return (
    <div className={`border-b ${className}`} {...props}>
      {React.Children.map(children, child => {
        // نمرر القيمة (value) للأطفال ليعرفوا هويتهم
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { value });
        }
        return child;
      })}
    </div>
  );
};

const AccordionTrigger = ({ children, className, value, ...props }) => {
  const { openItems, toggleItem } = React.useContext(AccordionContext);
  const isOpen = openItems.includes(value);

  return (
    <button
      onClick={() => toggleItem(value)}
      className={`flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180 ${className}`}
      data-state={isOpen ? "open" : "closed"}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
    </button>
  );
};

const AccordionContent = ({ children, className, value, ...props }) => {
  const { openItems } = React.useContext(AccordionContext);
  const isOpen = openItems.includes(value);

  if (!isOpen) return null;

  return (
    <div className={`overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down ${className}`} {...props}>
      <div className="pb-4 pt-0">{children}</div>
    </div>
  );
};

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };