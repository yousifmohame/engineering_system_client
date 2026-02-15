import React from 'react';
import { useAppStore } from '../../stores/useAppStore';
import TransactionsList from './TransactionsList'; // تأكد أن المسار صحيح لملفك القديم
import CreateTransaction from './CreateTransaction'; // تأكد أن المسار صحيح لملفك القديم

export const TransactionsScreenWrapper = () => {
  const { activeTabPerScreen } = useAppStore();
  const activeTabId = activeTabPerScreen['055'];

  // هنا نقوم بالتبديل بين المحتويات بناءً على التبويب المختار
  return (
    <div className="h-full w-full">
      
      {/* 1. تبويب سجل المعاملات */}
      <div className={activeTabId === '055-LOG' ? 'block h-full' : 'hidden'}>
        <TransactionsList />
      </div>

      {/* 2. تبويب إنشاء معاملة جديدة */}
      <div className={activeTabId === '055-NEW' ? 'block h-full' : 'hidden'}>
        <CreateTransaction />
      </div>

      {/* 3. تبويب تفاصيل معاملة (ديناميكي) */}
      {/* مثال: عندما تفتح معاملة رقم 100، سيكون التبويب اسمه TRX-100 */}
      {activeTabId.startsWith('TRX-') && (
        <div className="p-8 text-center bg-white m-4 rounded shadow">
           <h2 className="text-xl font-bold">تفاصيل المعاملة: {activeTabId.split('-')[1]}</h2>
           <p className="text-gray-500 mt-2">جاري نقل شاشة التفاصيل...</p>
        </div>
      )}

    </div>
  );
};