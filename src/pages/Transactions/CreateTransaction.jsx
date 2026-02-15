import React, { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api from '../../api/axios';
import { toast } from 'react-hot-toast'; // استبدلنا sonner بـ hot-toast الموجود لدينا

// الأيقونات
import {
  FileText, Plus, CheckCircle, Users, Calendar,
  Paperclip, Target, Settings, Eye, User, Building, 
  Activity, List, Layers, Navigation, Compass, Grid, MapPin
} from 'lucide-react';

import UnifiedTabsSidebar from '../../components/UnifiedTabsSidebar';

// --- 1. تعريف التبويبات ---
const TABS_CONFIG = [
  { id: '286-01', number: '286-01', title: 'معلومات أساسية', icon: FileText },
  { id: '286-02', number: '286-02', title: 'تفاصيل المعاملة', icon: Target },
  { id: '286-03', number: '286-03', title: 'الغرض المختصر', icon: CheckCircle },
  { id: '286-04', number: '286-04', title: 'الغرض التفصيلي', icon: List },
  { id: '286-05', number: '286-05', title: 'المهمات', icon: CheckCircle },
  { id: '286-06', number: '286-06', title: 'إسناد الموظفين', icon: Users },
  { id: '286-07', number: '286-07', title: 'معلومات العميل', icon: User },
  { id: '286-08', number: '286-08', title: 'المرفقات', icon: Paperclip },
  { id: '286-09', number: '286-09', title: 'المواعيد', icon: Calendar },
  { id: '286-10', number: '286-10', title: 'التكاليف', icon: Activity },
  { id: '286-11', number: '286-11', title: 'الموافقات', icon: CheckCircle },
  { id: '286-12', number: '286-12', title: 'الملاحظات', icon: FileText },
  { id: '286-13', number: '286-13', title: 'معاينة', icon: Eye },
  { id: '286-14', number: '286-14', title: 'الإعدادات', icon: Settings },
  { id: '286-15', number: '286-15', title: 'مسميات وعدد الأدوار', icon: Layers },
  { id: '286-16', number: '286-16', title: 'الارتدادات من الأربع جهات', icon: Navigation },
  { id: '286-17', number: '286-17', title: 'المكونات التفصيلية النهائية', icon: Grid },
  { id: '286-18', number: '286-18', title: 'المكونات حسب الرخصة القديمة', icon: FileText },
  { id: '286-19', number: '286-19', title: 'المكونات حسب المقترح', icon: Target },
  { id: '286-20', number: '286-20', title: 'المكونات حسب القائم', icon: Building },
  { id: '286-21', number: '286-21', title: 'الحدود والمجاورين', icon: Compass },
  { id: '286-22', number: '286-22', title: 'مساحة الأرض', icon: MapPin },
];

// --- 2. مخطط التحقق (Zod Schema) ---
const basicInfoSchema = z.object({
  title: z.string().min(1, "العنوان مطلوب"),
  clientPhone: z.string().min(1, "رقم جوال العميل مطلوب"), // بسطنا الأمر للتجربة
  clientName: z.string().optional(),
  priority: z.string().default('medium'),
  description: z.string().optional(),
});

// --- 3. مكون التبويب الأول (معلومات أساسية) ---
const BasicInfoTab = ({ form, isSaving }) => {
  const { register, formState: { errors } } = form;
  
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* عنوان المعاملة */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">عنوان المعاملة / المشروع</label>
          <input
            {...register('title')}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="مثال: تصميم فيلا سكنية - حي الملقا"
          />
          {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
        </div>

        {/* جوال العميل */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">جوال العميل (للبحث أو الإنشاء)</label>
          <input
            {...register('clientPhone')}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="05xxxxxxxx"
          />
          {errors.clientPhone && <p className="text-red-500 text-xs mt-1">{errors.clientPhone.message}</p>}
        </div>

        {/* اسم العميل */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">اسم العميل (اختياري)</label>
          <input
            {...register('clientName')}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="الاسم الكامل"
          />
        </div>

        {/* الأولوية */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">الأولوية</label>
          <select
            {...register('priority')}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
          >
            <option value="low">منخفضة</option>
            <option value="medium">متوسطة</option>
            <option value="high">عالية</option>
          </select>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-100 flex justify-end">
        <button
          type="submit"
          disabled={isSaving}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {isSaving ? 'جاري الحفظ...' : (
            <>
              <Plus size={18} />
              <span>إنشاء المعاملة ومتابعة</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

// --- 4. مكون نائب (Placeholder) لباقي التبويبات ---
const PlaceholderTab = ({ name }) => (
  <div className="flex flex-col items-center justify-center h-96 bg-white rounded-xl border border-dashed border-gray-300">
    <Activity className="h-16 w-16 text-gray-300 mb-4" />
    <p className="text-gray-500 text-lg">تبويب "{name}" قيد التطوير</p>
    <p className="text-sm text-gray-400">سيتم تفعيله قريباً</p>
  </div>
);

// --- 5. الشاشة الرئيسية (Master Component) ---
const CreateTransaction = () => {
  const [activeTab, setActiveTab] = useState('286-01');
  const [transactionId, setTransactionId] = useState('new');
  const queryClient = useQueryClient();

  // الحالة العامة للبيانات
  const [transactionData, setTransactionData] = useState({});

  // إعداد الفورم
  const form = useForm({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      title: "",
      clientPhone: "",
      clientName: "",
      priority: "medium",
    },
  });

  // دالة الحفظ (API)
  const createTransactionMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.post('/transactions', data);
      return response.data;
    },
    onSuccess: (response) => {
      const createdTx = response.transaction;
      setTransactionId(createdTx.id);
      setTransactionData(createdTx);
      toast.success('تم إنشاء مسودة المعاملة بنجاح');
      setActiveTab('286-02'); // الانتقال للتبويب التالي
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
    onError: (error) => {
      toast.error('فشل إنشاء المعاملة: ' + (error.response?.data?.message || error.message));
    },
  });

  const onSubmitBasicInfo = (data) => {
    createTransactionMutation.mutate(data);
  };

  // الرندرة الشرطية للمحتوى
  const renderTabContent = () => {
    // إذا لم يتم حفظ المعاملة بعد، نعرض فقط التبويب الأول
    if (transactionId === 'new' && activeTab !== '286-01') {
      return (
        <div className="text-center p-10 text-gray-500">
          يجب حفظ المعلومات الأساسية أولاً للمتابعة.
        </div>
      );
    }

    switch (activeTab) {
      case '286-01':
        return (
          <form onSubmit={form.handleSubmit(onSubmitBasicInfo)}>
            <BasicInfoTab form={form} isSaving={createTransactionMutation.isPending} />
          </form>
        );
      case '286-02': return <PlaceholderTab name="تفاصيل المعاملة" />;
      case '286-03': return <PlaceholderTab name="الغرض المختصر" />;
      case '286-05': return <PlaceholderTab name="المهمات" />;
      // ... وهكذا لباقي التبويبات
      default: return <PlaceholderTab name={activeTab} />;
    }
  };

  return (
    <div className="w-full h-full" dir="rtl">
      
      {/* Header الشاشة */}
      <div className="bg-white border-b border-gray-200 p-4 mb-20 shadow-sm flex items-center justify-between sticky top-16 z-10 rounded-lg">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-blue-50 rounded-lg border border-blue-100">
            <Plus className="text-blue-600" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">إنشاء معاملة جديدة</h1>
            <p className="text-xs text-gray-500">
              {transactionId === 'new' ? 'مسودة جديدة' : `رقم المرجع: ${transactionData.transactionCode || '...'}`}
            </p>
          </div>
        </div>
        <div className="bg-gray-100 px-3 py-1 rounded text-xs font-mono text-gray-500">
          Screen: 286
        </div>
      </div>

      {/* منطقة المحتوى والتبويبات */}
      <div className="flex gap-4 items-start">
        {/* الشريط الجانبي */}
        <UnifiedTabsSidebar
          tabs={TABS_CONFIG}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          disabledTabs={transactionId === 'new' ? TABS_CONFIG.map(t => t.id).filter(id => id !== '286-01') : []}
        />

        {/* المحتوى */}
        <div className="flex-1">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default CreateTransaction;