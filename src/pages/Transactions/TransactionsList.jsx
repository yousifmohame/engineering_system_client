import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Plus, Search, Filter, FileText, MoreVertical } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TransactionsList() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // جلب البيانات عند تحميل الصفحة
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await api.get('/transactions');
        setTransactions(response.data);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  if (loading) return <div className="p-8 text-center">جاري تحميل البيانات...</div>;

  return (
    <div className="space-y-6">
      {/* 1. رأس الصفحة والأزرار */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">سجل المعاملات</h1>
          <p className="text-gray-500 text-sm mt-1">إدارة ومتابعة كافة المعاملات الهندسية</p>
        </div>
        <Link to="/transactions/create" className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors">
            <Plus size={20} />
            <span>معاملة جديدة</span>
        </Link>
      </div>

      {/* 2. شريط التصفية والبحث */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="بحث برقم المعاملة أو اسم العميل..." 
            className="w-full pr-10 pl-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
          <Filter size={18} />
          <span>تصفية</span>
        </button>
      </div>

      {/* 3. جدول البيانات */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-100">
              <tr>
                <th className="p-4 w-40">رقم المعاملة</th>
                <th className="p-4">عنوان المشروع</th>
                <th className="p-4">العميل</th>
                <th className="p-4">الحالة</th>
                <th className="p-4">تاريخ الإنشاء</th>
                <th className="p-4 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {transactions.map((trx) => (
                <tr key={trx.id} className="hover:bg-blue-50/50 transition-colors group">
                  <td className="p-4 font-bold text-blue-600 font-mono text-sm">
                    {trx.transactionCode}
                  </td>
                  <td className="p-4 font-medium text-gray-800">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                        <FileText size={18} />
                      </div>
                      {trx.title}
                    </div>
                  </td>
                  <td className="p-4 text-gray-600">
                    {trx.client?.name?.ar || 'غير محدد'}
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium 
                      ${trx.status === 'Active' ? 'bg-green-100 text-green-700' : 
                        trx.status === 'Pending' ? 'bg-orange-100 text-orange-700' : 
                        'bg-gray-100 text-gray-700'}`}>
                      {trx.status === 'Active' ? 'جاري العمل' : 
                       trx.status === 'Pending' ? 'معلق' : trx.status}
                    </span>
                  </td>
                  <td className="p-4 text-gray-500 text-sm">
                    {new Date(trx.createdAt).toLocaleDateString('ar-EG')}
                  </td>
                  <td className="p-4 text-center">
                    <button className="text-gray-400 hover:text-blue-600 p-1 rounded-md hover:bg-blue-50 opacity-0 group-hover:opacity-100 transition-all">
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {transactions.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            لا توجد معاملات مسجلة حالياً.
          </div>
        )}
      </div>
    </div>
  );
}