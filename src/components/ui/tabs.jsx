export const Tabs = ({ children, ...props }) => <div {...props}>{children}</div>;
export const TabsList = ({ children }) => <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">{children}</div>;
export const TabsTrigger = ({ children }) => <button className="px-3 py-1 text-sm">{children}</button>;
export const TabsContent = ({ children }) => <div>{children}</div>;