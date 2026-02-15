 import { Outlet } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-right" dir="rtl">
      {/* القائمة الجانبية الثابتة */}
      <Sidebar />
      {/* المحتوى الرئيسي */}
      <div className="mr-64 min-h-screen flex flex-col">
        {/* الهيدر الثابت */}
        <Header />
        {/* منطقة المحتوى المتغير */}
        <main className="flex-1 p-6 mt-16 overflow-x-hidden">
          <div className="max-w-7xl mx-auto">
            {/* هنا سيتم عرض الصفحات (Dashboard, Transactions, etc.) */}
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}