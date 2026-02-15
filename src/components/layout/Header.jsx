import { useAuth } from '../../context/AuthContext';
import { LogOut, Bell, Search, User } from 'lucide-react';

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 fixed top-0 right-64 left-0 z-10 shadow-sm">
      
      {/* جهة اليمين - البحث */}
      <div className="flex items-center flex-1 max-w-lg">
        <div className="relative w-full">
          <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="بحث سريع عن معاملة أو عميل..." 
            className="w-full pr-10 pl-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
          />
        </div>
      </div>

      {/* جهة اليسار - المستخدم والإشعارات */}
      <div className="flex items-center gap-4 mr-4">
        {/* زر الإشعارات */}
        <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        <div className="h-8 w-px bg-gray-200 mx-1"></div>

        {/* قائمة المستخدم */}
        <div className="flex items-center gap-3">
          <div className="text-left hidden md:block">
            <p className="text-sm font-bold text-gray-700">{user?.name || 'مستخدم'}</p>
            <p className="text-xs text-gray-500">{user?.position || 'موظف'}</p>
          </div>
          <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center border-2 border-white shadow-sm text-blue-600">
            <User size={20} />
          </div>
          
          <button 
            onClick={logout}
            className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
            title="تسجيل الخروج"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}