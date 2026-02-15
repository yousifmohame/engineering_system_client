import { clsx } from 'clsx';

export default function UnifiedTabsSidebar({ tabs, activeTab, onTabChange, disabledTabs = [] }) {
  return (
    <div className="w-64 bg-white border-l border-gray-200 flex flex-col h-[calc(100vh-220px)] overflow-y-auto rounded-lg shadow-sm ml-4">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        const isDisabled = disabledTabs.includes(tab.id);

        return (
          <button
            key={tab.id}
            onClick={() => !isDisabled && onTabChange(tab.id)}
            disabled={isDisabled}
            className={clsx(
              "flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all border-r-4 w-full text-right hover:bg-gray-50",
              isActive 
                ? "border-blue-600 text-blue-700 bg-blue-50" 
                : "border-transparent text-gray-600",
              isDisabled && "opacity-50 cursor-not-allowed grayscale"
            )}
          >
            {Icon && <Icon size={18} />}
            <div className="flex flex-col items-start">
              <span>{tab.title}</span>
              <span className="text-[10px] text-gray-400 font-mono">{tab.number}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}