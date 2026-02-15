import React from 'react';
import { useAppStore } from '../../stores/useAppStore';
import { PropertyAIWorkspace } from './PropertyAIWorkspace'; // المكون الذي برمجناه سابقاً

export const OwnershipScreenWrapper = () => {
  const { activeTabPerScreen } = useAppStore();
  const activeTabId = activeTabPerScreen['310'];

  return (
    <div className="h-full w-full overflow-hidden">
      {/* إذا كان التبويب النشط هو الرفع والذكاء الاصطناعي */}
      {activeTabId === '310-UPL' && <PropertyAIWorkspace />}
      
      {/* إذا كان التبويب النشط هو سجل الصكوك */}
      {activeTabId === '310-LST' && (
        <div className="p-10 text-center">
           <h2 className="text-xl font-bold text-slate-400">سجل صكوك الملكية المعتمدة</h2>
           <p className="text-slate-500 mt-2">سيتم عرض قائمة الصكوك التي تم حفظها هنا.</p>
        </div>
      )}
    </div>
  );
};