import React from 'react';
import { 
  FileText, PlusCircle, Info, Activity, UploadCloud, 
  ChevronLeft, LayoutDashboard 
} from 'lucide-react';

const TransactionsSidebar = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'log', label: 'سجل المعاملات', icon: FileText, description: 'عرض وفلترة كافة المعاملات' },
    { id: 'create', label: 'إنشاء معاملة', icon: PlusCircle, description: 'تسجيل معاملة جديدة (Wizard)' },
    { id: 'details', label: 'تفاصيل معاملة', icon: Info, description: 'عرض بيانات معاملة محددة' },
    { id: 'track', label: 'تتبع معاملة', icon: Activity, description: 'متابعة مسار وسير العمل' },
    { id: 'upload', label: 'مركز التجهيز والرفع', icon: UploadCloud, description: 'إدارة الملفات والمرفقات' },
  ];

  return (
    <div className="w-64 bg-white border-l-2 border-slate-200 flex flex-col h-full shrink-0 shadow-sm z-10">
      
      {/* Header */}
      <div className="p-4 bg-slate-50 border-b border-slate-200">
        <div className="flex items-center gap-2 mb-1">
          <div className="p-1.5 bg-blue-100 text-blue-700 rounded-lg">
             <LayoutDashboard className="w-5 h-5" />
          </div>
          <h2 className="font-bold text-slate-800 text-sm">لوحة المعاملات</h2>
        </div>
        <p className="text-[10px] text-slate-500 pr-9">التحكم الكامل في العمليات</p>
      </div>

      {/* Tabs List */}
      <div className="flex-1 overflow-y-auto py-2 space-y-1 p-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg text-right transition-all duration-200 group relative
                ${isActive 
                  ? 'bg-blue-50 border-blue-200 shadow-sm' 
                  : 'hover:bg-slate-50 border-transparent hover:border-slate-100'
                } border`}
            >
              {/* Active Indicator Line */}
              {isActive && (
                <div className="absolute right-0 top-2 bottom-2 w-1 bg-blue-600 rounded-l-full"></div>
              )}

              {/* Icon */}
              <div className={`p-2 rounded-md transition-colors ${isActive ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500 group-hover:text-blue-600 group-hover:bg-blue-100'}`}>
                <tab.icon className="w-4 h-4" />
              </div>

              {/* Text */}
              <div className="flex-1">
                <span className={`block text-xs font-bold ${isActive ? 'text-blue-900' : 'text-slate-700'}`}>
                  {tab.label}
                </span>
                <span className={`block text-[9px] mt-0.5 ${isActive ? 'text-blue-400' : 'text-slate-400'}`}>
                  {tab.description}
                </span>
              </div>

              {/* Arrow */}
              {isActive && <ChevronLeft className="w-4 h-4 text-blue-500 opacity-100" />}
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 text-center">
        <p className="text-[10px] text-slate-400 font-mono">Ver 2.5.0-Build286</p>
      </div>
    </div>
  );
};

export default TransactionsSidebar;