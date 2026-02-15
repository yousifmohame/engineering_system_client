import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Settings, 
  Briefcase,
  Building2,
  FileCheck
} from 'lucide-react';
import clsx from 'clsx';

const menuItems = [
  { path: '/', label: 'لوحة التحكم', icon: LayoutDashboard },
  { path: '/transactions', label: 'انشاء معاملة جديده', icon: FileText },
  { path: '/transactions/log', label: 'سجل المعاملات الشامل', icon: FileText },
  { path: '/settings/transactions', label: 'اعدادات المعاملات', icon: FileText },
  { path: '/employees', label: 'اداره الموظفين', icon: FileText },
  { path: '/followup', label: 'اداره المعقبين', icon: FileText },
  { path: '/riyadhstreet', label: 'شوارع الرياض', icon: FileText },
  { path: '/clients', label: 'العملاء', icon: Users },
  { path: '/projects', label: 'المشاريع', icon: Briefcase },
  { path: '/hr', label: 'الموارد البشرية', icon: Users }, // أيقونة مؤقتة
  { path: '/finance', label: 'المالية', icon: FileCheck },
  { path: '/settings', label: 'الإعدادات', icon: Settings },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen flex flex-col fixed right-0 top-0 bottom-0 z-20 transition-all duration-300 shadow-xl">
      {/* الشعار */}
      <div className="h-16 flex items-center justify-center border-b border-slate-700 bg-slate-950">
        <div className="flex items-center gap-2 font-bold text-xl">
          <Building2 className="text-blue-500" />
          <span>النظام الهندسي</span>
        </div>
      </div>

      {/* القائمة */}
      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={clsx(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group",
                isActive 
                  ? "bg-blue-600 text-white shadow-md shadow-blue-900/50 translate-x-[-4px]" 
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              )}
            >
              <Icon size={20} className={clsx(isActive ? "text-white" : "text-slate-400 group-hover:text-blue-400")} />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* تذييل القائمة (معلومات النسخة) */}
      <div className="p-4 text-xs text-center text-slate-500 border-t border-slate-800">
        الإصدار 2.0.0
      </div>
    </aside>
  );
}