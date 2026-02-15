/**
 * Screen 285 - Transactions Log (JSX Version) - Full Functionality
 * ================================================================
 * ✅ متكامل بالكامل مع Backend API (getAllTransactions)
 * ✅ جميع التبويبات الـ 10 تعمل بشكل كامل
 * ✅ تحليلات وإحصائيات متقدمة
 * ✅ بحث وفلترة فورية
 */
import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import {
  FileText, CheckCircle, XCircle, Clock, Users, Building,
  TrendingUp, BarChart3, Calendar, Filter, Download, Eye,
  Activity, Settings, ChevronDown, ChevronRight, Search,
  MapPin, Star, DollarSign, Hash, Briefcase, Home, Loader2
} from 'lucide-react';
import UnifiedTabsSidebar from '../UnifiedTabsSidebar';
import { EnhancedSwitch } from '../EnhancedSwitch';
import CodeDisplay from '../CodeDisplay';
import { ScrollArea } from '../ui/scroll-area';
import { InputWithCopy } from '../InputWithCopy'; // تأكد من وجود هذا المكون

// استيراد API
import { getAllTransactions } from '../../api/transactionApi';

// إعدادات التبويبات
const TABS_CONFIG = [
  { id: '285-01', number: '285-01', title: 'نظرة عامة', icon: BarChart3 },
  { id: '285-02', number: '285-02', title: 'المعاملات النشطة', icon: Activity },
  { id: '285-03', number: '285-03', title: 'المعاملات المنتهية', icon: CheckCircle },
  { id: '285-04', number: '285-04', title: 'المعاملات الملغاة', icon: XCircle },
  { id: '285-05', number: '285-05', title: 'تحت المعالجة', icon: Clock },
  { id: '285-06', number: '285-06', title: 'حسب التصنيف', icon: FileText },
  { id: '285-07', number: '285-07', title: 'حسب العميل', icon: Users },
  { id: '285-08', number: '285-08', title: 'حسب السنة', icon: Calendar },
  { id: '285-09', number: '285-09', title: 'تحليلات', icon: TrendingUp },
  { id: '285-10', number: '285-10', title: 'الإعدادات', icon: Settings }
];

const TransactionsLog_Complete_285_v10 = () => {
  const [activeTab, setActiveTab] = useState('285-01');
  const [expandedYear, setExpandedYear] = useState(null);
  const [expandedMonth, setExpandedMonth] = useState(null);
  const [expandedClient, setExpandedClient] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // 1. جلب البيانات من الباك اند
  const { data: rawTransactions, isLoading, isError, refetch } = useQuery({
    queryKey: ['allTransactions'],
    queryFn: getAllTransactions,
    refetchInterval: autoRefresh ? 60000 : false, // تحديث تلقائي كل دقيقة إذا مفعل
  });

  // 2. تحويل البيانات للعرض
  const transactions = useMemo(() => {
    if (!rawTransactions) return [];

    return rawTransactions.map(t => {
      const date = new Date(t.createdAt);
      
      // معالجة اسم العميل بأمان
      let clientName = 'غير محدد';
      if (t.client?.name) {
        if (typeof t.client.name === 'string') {
            clientName = t.client.name;
        } else if (t.client.name.firstName) {
            clientName = `${t.client.name.firstName} ${t.client.name.familyName}`;
        }
      }

      // تصحيح الحالة إذا كانت غير موحدة
      const statusLower = (t.status || 'pending').toLowerCase();
      let normalizedStatus = t.status;
      if (['active', 'in progress', 'running'].includes(statusLower)) normalizedStatus = 'active';
      else if (['completed', 'approved', 'finished'].includes(statusLower)) normalizedStatus = 'completed';
      else if (['cancelled', 'rejected'].includes(statusLower)) normalizedStatus = 'cancelled';
      else if (['pending', 'draft'].includes(statusLower)) normalizedStatus = 'pending';
      else if (['under review', 'review'].includes(statusLower)) normalizedStatus = 'under review';

      return {
        ...t,
        clientName: clientName,
        typeName: t.transactionType?.name || 'عام',
        category: t.transactionType?.categoryAr || t.category || 'عام',
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        displayDate: date.toLocaleDateString('ar-SA'),
        progress: t.progress || 0,
        totalFees: t.totalFees || 0,
        normalizedStatus: normalizedStatus
      };
    });
  }, [rawTransactions]);

  // --- تصفية القائمة بناءً على البحث ---
  const filteredList = useMemo(() => {
    if (!searchTerm) return transactions;
    const lowerSearch = searchTerm.toLowerCase();
    return transactions.filter(t => 
      t.transactionCode?.toLowerCase().includes(lowerSearch) ||
      t.clientName?.toLowerCase().includes(lowerSearch) ||
      t.typeName?.toLowerCase().includes(lowerSearch)
    );
  }, [transactions, searchTerm]);

  // --- القوائم المفلترة ---
  const activeTransactions = filteredList.filter(t => t.normalizedStatus === 'active');
  const completedTransactions = filteredList.filter(t => t.normalizedStatus === 'completed');
  const cancelledTransactions = filteredList.filter(t => t.normalizedStatus === 'cancelled');
  const pendingTransactions = filteredList.filter(t => t.normalizedStatus === 'pending');
  const underReviewTransactions = filteredList.filter(t => t.normalizedStatus === 'under review');

  const getTransactionsByYear = (year) => filteredList.filter(t => t.year === year);
  const getTransactionsByMonth = (year, month) => filteredList.filter(t => t.year === year && t.month === month);
  const getTransactionsByCategory = (category) => filteredList.filter(t => t.category === category);
  const getTransactionsByClient = (clientName) => filteredList.filter(t => t.clientName === clientName);

  const uniqueClients = useMemo(() => Array.from(new Set(filteredList.map(t => t.clientName))).sort(), [filteredList]);
  const uniqueCategories = useMemo(() => Array.from(new Set(filteredList.map(t => t.category))).sort(), [filteredList]);
  const years = useMemo(() => Array.from(new Set(filteredList.map(t => t.year))).sort((a, b) => b - a), [filteredList]);

  const monthNames = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

  // --- دوال مساعدة للعرض ---
  const getStatusBadge = (status) => {
    switch (status) {
      case 'active': return <Badge className="bg-blue-500 text-white text-xs px-1.5 py-0 h-5">نشطة</Badge>;
      case 'completed': return <Badge className="bg-green-500 text-white text-xs px-1.5 py-0 h-5">مكتملة</Badge>;
      case 'cancelled': return <Badge className="bg-red-500 text-white text-xs px-1.5 py-0 h-5">ملغاة</Badge>;
      case 'pending': return <Badge className="bg-yellow-500 text-white text-xs px-1.5 py-0 h-5">معلقة</Badge>;
      case 'under review': return <Badge className="bg-purple-500 text-white text-xs px-1.5 py-0 h-5">مراجعة</Badge>;
      default: return <Badge variant="outline" className="text-xs px-1.5 py-0 h-5">{status}</Badge>;
    }
  };

  const getCategoryBadge = (category) => {
    const categoryMap = {
      'سكني': 'bg-blue-500',
      'تجاري': 'bg-green-500',
      'صناعي': 'bg-orange-500',
      'إداري': 'bg-purple-500',
      'تراخيص': 'bg-teal-500',
      'عام': 'bg-gray-500'
    };
    const color = categoryMap[category] || 'bg-gray-500';
    return <Badge className={`text-xs px-1.5 py-0 h-5 ${color} text-white`}>{category}</Badge>;
  };

  // --- مكون جدول مشترك ---
  const RenderTable = ({ data }) => (
    <Card className="card-element card-rtl">
      <CardContent className="p-0">
        <ScrollArea className="h-[500px]">
          <Table className="table-rtl dense-table">
            <TableHeader>
              <TableRow>
                <TableHead className="text-right text-xs font-bold">رقم المعاملة</TableHead>
                <TableHead className="text-right text-xs font-bold">العميل</TableHead>
                <TableHead className="text-right text-xs font-bold">التصنيف</TableHead>
                <TableHead className="text-right text-xs font-bold">النوع</TableHead>
                <TableHead className="text-right text-xs font-bold">الحالة</TableHead>
                <TableHead className="text-right text-xs font-bold">التاريخ</TableHead>
                <TableHead className="text-right text-xs font-bold">الإنجاز</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length > 0 ? (
                data.map(t => (
                  <TableRow key={t.id} className="hover:bg-blue-50 transition-colors">
                    <TableCell className="font-mono text-xs font-semibold">{t.transactionCode}</TableCell>
                    <TableCell className="text-xs text-gray-700">{t.clientName}</TableCell>
                    <TableCell>{getCategoryBadge(t.category)}</TableCell>
                    <TableCell className="text-xs">{t.typeName}</TableCell>
                    <TableCell>{getStatusBadge(t.normalizedStatus)}</TableCell>
                    <TableCell className="text-xs font-mono">{t.displayDate}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Progress value={t.progress} className="h-1.5 w-12" />
                        <span className="text-[10px] font-mono">{t.progress}%</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-400">لا توجد بيانات مطابقة</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );

  // --- محتوى التبويبات ---
  const renderTabContent = () => {
    if (isLoading) return <div className="flex justify-center items-center h-96"><Loader2 className="animate-spin h-10 w-10 text-blue-500" /></div>;
    if (isError) return <div className="text-center text-red-500 p-10">فشل تحميل البيانات. تأكد من تشغيل السيرفر.</div>;

    switch (activeTab) {
      // 1. نظرة عامة
      case '285-01':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-6 gap-2">
              {[
                { label: 'الإجمالي', val: filteredList.length, icon: FileText, color: 'blue' },
                { label: 'نشطة', val: activeTransactions.length, icon: Activity, color: 'indigo' },
                { label: 'مكتملة', val: completedTransactions.length, icon: CheckCircle, color: 'green' },
                { label: 'تحت المعالجة', val: pendingTransactions.length + underReviewTransactions.length, icon: Clock, color: 'yellow' },
                { label: 'ملغاة', val: cancelledTransactions.length, icon: XCircle, color: 'red' },
                { label: 'عملاء', val: uniqueClients.length, icon: Users, color: 'pink' },
              ].map((stat, i) => (
                <Card key={i} className={`text-center border-t-4 border-${stat.color}-500 shadow-sm`}>
                  <CardContent className="p-2">
                    <stat.icon className={`h-5 w-5 mx-auto text-${stat.color}-600 mb-1`} />
                    <p className="text-xl font-bold">{stat.val}</p>
                    <p className="text-[10px] text-gray-500">{stat.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <h3 className="font-bold text-gray-700 mt-4 mb-2">أحدث المعاملات</h3>
            <RenderTable data={filteredList.slice(0, 20)} />
          </div>
        );

      // 2. المعاملات النشطة
      case '285-02':
        return (
          <div className="space-y-3">
             <div className="flex justify-between items-center"><h3 className="font-bold text-blue-800">قائمة المعاملات النشطة ({activeTransactions.length})</h3></div>
             <RenderTable data={activeTransactions} />
          </div>
        );

      // 3. المعاملات المنتهية
      case '285-03':
        return (
          <div className="space-y-3">
             <div className="flex justify-between items-center"><h3 className="font-bold text-green-800">الأرشيف المكتمل ({completedTransactions.length})</h3></div>
             <RenderTable data={completedTransactions} />
          </div>
        );

      // 4. المعاملات الملغاة
      case '285-04':
        return (
          <div className="space-y-3">
             <div className="flex justify-between items-center"><h3 className="font-bold text-red-800">المعاملات المرفوضة والملغاة ({cancelledTransactions.length})</h3></div>
             <RenderTable data={cancelledTransactions} />
          </div>
        );

      // 5. تحت المعالجة
      case '285-05':
        return (
          <div className="space-y-3">
             <div className="flex justify-between items-center"><h3 className="font-bold text-yellow-800">قيد الانتظار والمراجعة ({pendingTransactions.length + underReviewTransactions.length})</h3></div>
             <RenderTable data={[...pendingTransactions, ...underReviewTransactions]} />
          </div>
        );

      // 6. حسب التصنيف
      case '285-06':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-2">
              {uniqueCategories.map((cat, idx) => (
                <Card key={cat} className="card-element card-rtl border hover:shadow-md transition-shadow">
                   <CardContent className="p-3 text-center">
                      <p className="font-bold text-gray-700">{cat}</p>
                      <p className="text-2xl text-blue-600 font-mono">{getTransactionsByCategory(cat).length}</p>
                   </CardContent>
                </Card>
              ))}
            </div>
            <h3 className="font-bold text-gray-700 mt-2">تفاصيل التصنيفات</h3>
            <RenderTable data={filteredList} />
          </div>
        );

      // 7. حسب العميل
      case '285-07':
        return (
          <div className="space-y-2">
             {uniqueClients.map(client => {
                const clientTx = getTransactionsByClient(client);
                const isExpanded = expandedClient === client;
                return (
                   <Card key={client} className="mb-2 border hover:border-blue-300 transition-colors">
                      <div 
                        className="p-3 flex justify-between items-center cursor-pointer bg-gray-50/50"
                        onClick={() => setExpandedClient(isExpanded ? null : client)}
                      >
                         <div className="flex items-center gap-2">
                            {isExpanded ? <ChevronDown size={16}/> : <ChevronRight size={16}/>}
                            <Users size={16} className="text-blue-500"/>
                            <span className="font-bold text-sm">{client}</span>
                         </div>
                         <Badge className="bg-blue-100 text-blue-700">{clientTx.length} معاملة</Badge>
                      </div>
                      {isExpanded && (
                         <CardContent className="p-0 border-t">
                            <RenderTable data={clientTx} />
                         </CardContent>
                      )}
                   </Card>
                );
             })}
          </div>
        );

      // 8. حسب السنة
      case '285-08':
        return (
          <div className="space-y-2">
             {years.map(year => {
                const yearTx = getTransactionsByYear(year);
                const isExpanded = expandedYear === year;
                return (
                   <Card key={year} className="mb-2 border hover:border-indigo-300 transition-colors">
                      <div 
                        className="p-3 flex justify-between items-center cursor-pointer bg-indigo-50/30"
                        onClick={() => setExpandedYear(isExpanded ? null : year)}
                      >
                         <div className="flex items-center gap-2">
                            {isExpanded ? <ChevronDown size={16}/> : <ChevronRight size={16}/>}
                            <Calendar size={16} className="text-indigo-500"/>
                            <span className="font-bold text-sm font-mono">{year}</span>
                         </div>
                         <Badge className="bg-indigo-100 text-indigo-700">{yearTx.length} معاملة</Badge>
                      </div>
                      {isExpanded && (
                         <CardContent className="p-2">
                            <div className="grid grid-cols-4 gap-2 mb-2">
                               {monthNames.map((m, idx) => {
                                  const monthCount = getTransactionsByMonth(year, idx + 1).length;
                                  return (
                                     <div key={idx} className={`p-2 rounded text-center border ${monthCount > 0 ? 'bg-white border-blue-200' : 'bg-gray-50 border-transparent text-gray-400'}`}>
                                        <div className="text-xs">{m}</div>
                                        <div className="font-bold text-sm">{monthCount}</div>
                                     </div>
                                  )
                               })}
                            </div>
                            <RenderTable data={yearTx} />
                         </CardContent>
                      )}
                   </Card>
                );
             })}
          </div>
        );

      // 9. تحليلات
      case '285-09':
        return (
          <div className="space-y-4">
             <div className="grid grid-cols-2 gap-4">
                <Card>
                   <CardHeader><CardTitle className="text-sm">توزيع الحالات</CardTitle></CardHeader>
                   <CardContent>
                      {[
                         {l: 'نشطة', v: activeTransactions.length, c: 'bg-blue-500'},
                         {l: 'مكتملة', v: completedTransactions.length, c: 'bg-green-500'},
                         {l: 'معلقة', v: pendingTransactions.length, c: 'bg-yellow-500'},
                         {l: 'ملغاة', v: cancelledTransactions.length, c: 'bg-red-500'},
                      ].map(stat => (
                         <div key={stat.l} className="flex items-center justify-between mb-2">
                            <span className="text-xs">{stat.l}</span>
                            <div className="flex items-center gap-2 w-2/3">
                               <Progress value={(stat.v / filteredList.length) * 100} className={`h-2 ${stat.c.replace('bg-', 'text-')}`} />
                               <span className="text-xs font-mono">{stat.v}</span>
                            </div>
                         </div>
                      ))}
                   </CardContent>
                </Card>
                <Card>
                   <CardHeader><CardTitle className="text-sm">أداء التصنيفات</CardTitle></CardHeader>
                   <CardContent>
                      {uniqueCategories.map(cat => {
                         const count = getTransactionsByCategory(cat).length;
                         return (
                            <div key={cat} className="flex items-center justify-between mb-2">
                               <span className="text-xs">{cat}</span>
                               <span className="text-xs font-mono font-bold">{count}</span>
                            </div>
                         )
                      })}
                   </CardContent>
                </Card>
             </div>
          </div>
        );

      // 10. الإعدادات
      case '285-10':
        return (
          <Card>
             <CardHeader><CardTitle>تفضيلات العرض</CardTitle></CardHeader>
             <CardContent className="space-y-4">
                <EnhancedSwitch 
                   id="auto-refresh" 
                   label="التحديث التلقائي للبيانات" 
                   description="تحديث القائمة كل 60 ثانية لجلب المعاملات الجديدة"
                   checked={autoRefresh} 
                   onCheckedChange={setAutoRefresh} 
                />
                <div className="p-4 bg-blue-50 rounded text-sm text-blue-800">
                   المزيد من الإعدادات قادمة قريباً...
                </div>
             </CardContent>
          </Card>
        );

      default: return <div>جاري التطوير...</div>;
    }
  };

  return (
    <div className="w-full h-full p-4" dir="rtl" style={{ fontFamily: 'Tajawal, sans-serif' }}>
      <CodeDisplay code="SCR-285" position="top-right" />
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FileText className="text-blue-600"/> سجل المعاملات الشامل
        </h1>
        <div className="flex items-center gap-2">
           <div className="relative">
              <Search className="absolute right-2 top-2 h-4 w-4 text-gray-400"/>
              <input 
                 className="pr-8 pl-2 py-1.5 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                 placeholder="بحث سريع برقم المعاملة أو العميل..."
                 value={searchTerm}
                 onChange={e => setSearchTerm(e.target.value)}
              />
           </div>
           <Button variant="outline" size="icon" onClick={() => refetch()} title="تحديث"><span className="text-xs">↻</span></Button>
        </div>
      </div>

      <div className="flex gap-4 items-start">
        <UnifiedTabsSidebar tabs={TABS_CONFIG} activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="flex-1 min-h-[600px]">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default TransactionsLog_Complete_285_v10;