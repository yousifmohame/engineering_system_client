import React, { useState } from 'react';
import { Card, CardContent } from '../../../components/ui/card';
import { ScrollArea } from '../../../components/ui/scroll-area';
import { Settings, Hash, GitBranch, Activity, Zap, Tag, FolderTree, FileText } from 'lucide-react';
import Tab_701_01_TransactionTypes from './tabs/Tab_701_01_TransactionTypes';
import Tab_701_RequestPurposes from './tabs/Tab_701_RequestPurposes';

// القائمة الجانبية
const SETTINGS_TABS = [
  { id: '701-01', title: 'أنواع المعاملات', icon: FileText },
  { id: '701-02', title: 'أغراض الطلبات', icon: Hash },
  { id: '701-03', title: 'المراحل (قريباً)', icon: GitBranch },
  // ... يمكنك إضافة الباقي هنا
];

const TransactionsSettings_701 = () => {
  const [activeTab, setActiveTab] = useState('701-01');

  const renderContent = () => {
    switch(activeTab) {
      case '701-01': return <Tab_701_01_TransactionTypes />;
      case '701-02': return <Tab_701_RequestPurposes />;
      default: return <div className="p-10 text-center text-gray-500">هذا القسم قيد التطوير</div>;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50" dir="rtl">
      {/* Sidebar */}
      <div className="w-64 bg-white border-l shadow-sm flex flex-col">
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold text-blue-900 flex items-center gap-2">
            <Settings className="w-6 h-6"/> الإعدادات
          </h1>
        </div>
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-1">
            {SETTINGS_TABS.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all ${isActive ? 'bg-blue-50 text-blue-700 font-bold border-r-4 border-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                  {tab.title}
                </button>
              )
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-auto">
        {renderContent()}
      </div>
    </div>
  );
};

export default TransactionsSettings_701;