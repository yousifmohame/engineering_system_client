import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';
import { 
  Users, Briefcase, FileText, TrendingUp, TrendingDown, 
  Calendar, DollarSign, Activity, AlertCircle, Plus, 
  ArrowUpRight, ArrowDownRight, Search, Bell, CheckCircle2, MapPin, Clock, Download
} from 'lucide-react';

// ✅ تصحيح: إضافة استيراد مكونات الجدول
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { ScrollArea } from '../components/ui/scroll-area';
import { Separator } from '../components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { useAuth } from '../context/AuthContext';

// --- بيانات وهمية للمحاكاة ---
const monthlyData = [
  { name: 'يناير', دخل: 40000, مصروفات: 24000 },
  { name: 'فبراير', دخل: 30000, مصروفات: 13980 },
  { name: 'مارس', دخل: 20000, مصروفات: 58000 },
  { name: 'أبريل', دخل: 27800, مصروفات: 39080 },
  { name: 'مايو', دخل: 18900, مصروفات: 48000 },
  { name: 'يونيو', دخل: 23900, مصروفات: 38000 },
  { name: 'يوليو', دخل: 34900, مصروفات: 43000 },
];

const statusData = [
  { name: 'مكتملة', value: 45, color: '#10b981' },
  { name: 'قيد التنفيذ', value: 30, color: '#3b82f6' },
  { name: 'معلقة', value: 15, color: '#f59e0b' },
  { name: 'ملغاة', value: 10, color: '#ef4444' },
];

const recentTransactions = [
  { id: 'TRX-9821', client: 'شركة الأفق المتقدمة', type: 'رخصة بناء', date: '2025-01-28', amount: '15,000', status: 'completed' },
  { id: 'TRX-9822', client: 'محمد عبد الله', type: 'تجزئة أراضي', date: '2025-01-29', amount: '8,500', status: 'in-progress' },
  { id: 'TRX-9823', client: 'مؤسسة البنيان', type: 'إشراف هندسي', date: '2025-01-30', amount: '22,000', status: 'pending' },
  { id: 'TRX-9824', client: 'خالد العتيبي', type: 'تصميم داخلي', date: '2025-01-30', amount: '12,000', status: 'in-progress' },
];

const upcomingAppointments = [
  { id: 1, title: 'زيارة موقع (مشروع الفيصلية)', time: '10:00 ص', type: 'visit' },
  { id: 2, title: 'اجتماع مع العميل (أحمد سالم)', time: '01:30 م', type: 'meeting' },
  { id: 3, title: 'تسليم مخططات (فيلا الروضة)', time: '04:00 م', type: 'delivery' },
];

// --- المكونات الفرعية ---

const StatCard = ({ title, value, change, icon: Icon, trend, colorClass }) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-between space-x-4">
        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          <div className={`p-3 rounded-xl ${colorClass}`}>
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
          </div>
        </div>
        {change && (
          <div className={`flex items-center text-xs font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-600'} bg-gray-50 px-2 py-1 rounded-full`}>
            {trend === 'up' ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
            {change}
          </div>
        )}
      </div>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('صباح الخير');
    else if (hour < 18) setGreeting('مساء الخير');
    else setGreeting('مساء الخير');
  }, []);

  return (
    <div className="p-6 space-y-6 bg-gray-50/50 min-h-screen font-sans" dir="rtl">
      
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {greeting}، {user?.name || 'المدير العام'} 👋
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            إليك نظرة عامة على أداء المكتب الهندسي اليوم.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative hidden md:block">
            <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="بحث سريع..." 
              className="pl-4 pr-10 py-2 border rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200">
            <Plus className="h-4 w-4 ml-2" /> معاملة جديدة
          </Button>
        </div>
      </div>

      {/* 2. KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="إجمالي الدخل (شهري)" 
          value="142,300 ر.س" 
          change="+12.5%" 
          trend="up" 
          icon={DollarSign} 
          colorClass="bg-green-100 text-green-600"
        />
        <StatCard 
          title="المعاملات النشطة" 
          value="45" 
          change="+3" 
          trend="up" 
          icon={FileText} 
          colorClass="bg-blue-100 text-blue-600"
        />
        <StatCard 
          title="العملاء الجدد" 
          value="12" 
          change="-2%" 
          trend="down" 
          icon={Users} 
          colorClass="bg-purple-100 text-purple-600"
        />
        <StatCard 
          title="مهام متأخرة" 
          value="5" 
          change="عاجل" 
          trend="down" 
          icon={AlertCircle} 
          colorClass="bg-red-100 text-red-600"
        />
      </div>

      {/* 3. Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2 shadow-sm border-0">
          <CardHeader>
            <CardTitle>الأداء المالي</CardTitle>
            <CardDescription>مقارنة الدخل والمصروفات خلال الـ 7 أشهر الماضية</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value / 1000}k`} />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    labelStyle={{ color: '#374151', fontFamily: 'Tajawal' }}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="دخل" stroke="#10b981" fillOpacity={1} fill="url(#colorIncome)" />
                  <Area type="monotone" dataKey="مصروفات" stroke="#ef4444" fillOpacity={1} fill="url(#colorExpense)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Transaction Status Pie Chart */}
        <Card className="shadow-sm border-0">
          <CardHeader>
            <CardTitle>حالات المعاملات</CardTitle>
            <CardDescription>توزيع المعاملات حسب الحالة الحالية</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
              {/* Center Text */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                <span className="text-2xl font-bold text-gray-800">100%</span>
                <p className="text-xs text-gray-500">الإجمالي</p>
              </div>
            </div>
            <div className="space-y-2 mt-4">
              {statusData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-gray-600">{item.name}</span>
                  </div>
                  <span className="font-semibold text-gray-900">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 4. Bottom Grid (Transactions & Appointments) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Transactions List */}
        <Card className="lg:col-span-2 shadow-sm border-0">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>أحدث المعاملات</CardTitle>
              <CardDescription>آخر النشاطات المسجلة في النظام</CardDescription>
            </div>
            <Button variant="outline" size="sm">عرض الكل</Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableBody>
                {recentTransactions.map((tx) => (
                  <TableRow key={tx.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                          <FileText className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-800">{tx.type}</p>
                          <p className="text-xs text-gray-500">{tx.id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{tx.client}</TableCell>
                    <TableCell>{tx.date}</TableCell>
                    <TableCell>
                      <Badge 
                        className={
                          tx.status === 'completed' ? 'bg-green-100 text-green-700' :
                          tx.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                          'bg-yellow-100 text-yellow-700'
                        }
                      >
                        {tx.status === 'completed' ? 'مكتمل' : tx.status === 'in-progress' ? 'جارية' : 'معلقة'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-left font-bold text-gray-700">
                      {tx.amount} ر.س
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Upcoming Appointments & Tasks */}
        <Card className="shadow-sm border-0">
          <CardHeader>
            <CardTitle>جدول اليوم</CardTitle>
            <CardDescription>المواعيد والمهام القادمة</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[350px] pr-4">
              <div className="space-y-4">
                {upcomingAppointments.map((item) => (
                  <div key={item.id} className="flex items-start gap-3 pb-4 border-b last:border-0 border-gray-100">
                    <div className={`p-2 rounded-lg mt-1 ${
                      item.type === 'visit' ? 'bg-orange-100 text-orange-600' : 
                      item.type === 'meeting' ? 'bg-purple-100 text-purple-600' : 
                      'bg-green-100 text-green-600'
                    }`}>
                      {item.type === 'visit' ? <MapPin className="h-4 w-4" /> : 
                       item.type === 'meeting' ? <Users className="h-4 w-4" /> : 
                       <CheckCircle2 className="h-4 w-4" />}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 text-sm">{item.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-500">{item.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Promo / Upgrade Section (Optional) */}
                <div className="mt-4 p-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-white">
                  <h4 className="font-bold text-sm mb-1">التقرير الشهري جاهز!</h4>
                  <p className="text-xs opacity-90 mb-3">تم تجهيز تقرير الأداء لشهر يناير. يمكنك تحميله الآن.</p>
                  <Button size="sm" variant="secondary" className="w-full bg-white text-blue-600 hover:bg-gray-100 border-0">
                    <Download className="h-4 w-4 ml-2" /> تحميل التقرير
                  </Button>
                </div>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;