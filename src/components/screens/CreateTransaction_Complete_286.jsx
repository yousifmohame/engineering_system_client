import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'; 
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';

// استيراد دوال الـ API
import { 
  createTransaction, 
  updateTransaction, 
  getTransactionById 
} from '../../api/transactionApi';
import { getEmployees } from '../../api/employeeApi'; 

// استيراد الأيقونات
import {
  FileText, Plus, CheckCircle, Users, Calendar,
  Paperclip, Target, AlertCircle, Settings,
  Eye, User, Building, Activity, List,
  Layers, Navigation, Compass, Grid, MapPin
} from 'lucide-react';

import CodeDisplay from '../CodeDisplay';
import UnifiedTabsSidebar from '../UnifiedTabsSidebar';
import { Skeleton } from '../ui/skeleton'; 

// استيراد التابات الفرعية (تأكد أن هذه الملفات موجودة بـ jsx)
import Tab_286_01_BasicInfo_UltraDense from './Tab_286_01_BasicInfo_UltraDense';
import Tab_286_02_TransactionDetails_Complete from './Tab_286_02_TransactionDetails_Complete';
import {
  Tab_286_05_Tasks_UltraDense,
  Tab_286_06_StaffAssignment_UltraDense,
  Tab_286_08_Attachments_UltraDense,
  Tab_286_10_Costs_UltraDense
} from './Tab_286_AllTabs_UltraDense';
import {
  Tab_286_07_ClientInfo,
  Tab_286_09_Appointments,
  Tab_286_11_Approvals,
  Tab_286_12_Notes,
  Tab_286_13_Preview_Complex,
} from './Tab_286_RestTabs_Complete';
import Tab_RequestPurpose_Brief_Complete from './Tab_RequestPurpose_Brief_Complete';
import Tab_RequestPurpose_Detailed_Complete from './Tab_RequestPurpose_Detailed_Complete';
import Tab_FloorsNaming_Complete from './Tab_FloorsNaming_Complete';
import Tab_Setbacks_AllFloors_Complete from './Tab_Setbacks_AllFloors_Complete';
import Tab_FinalComponents_Detailed_Complete from './Tab_FinalComponents_Detailed_Complete';
import Tab_Components_Generic_Complete from './Tab_Components_Generic_Complete';
import Tab_Boundaries_Neighbors_Complete from './Tab_Boundaries_Neighbors_Complete';
import Tab_LandArea_Complete from './Tab_LandArea_Complete';


// --- مخطط التحقق (Zod Schema) ---
const basicInfoSchema = z.object({
  title: z.string().min(1, "العنوان مطلوب"),
  clientId: z.string().min(1, "يجب اختيار العميل"),
  priority: z.string().default('medium'),
  description: z.string().optional(),
});

// --- إعدادات التبويبات ---
const TABS_CONFIG = [
  { id: '286-01', number: '286-01', title: 'معلومات أساسية', icon: FileText },
  { id: '286-02', number: '286-02', title: 'نوع المعاملة', icon: Target },
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
  { id: '286-14', number: '286-14', title: 'مسميات وعدد الأدوار', icon: Layers },
  { id: '286-15', number: '286-15', title: 'الارتدادات', icon: Navigation },
  { id: '286-16', number: '286-16', title: 'المكونات النهائية', icon: Grid },
  { id: '286-17', number: '286-17', title: 'الرخصة القديمة', icon: FileText },
  { id: '286-18', number: '286-18', title: 'المقترح', icon: Target },
  { id: '286-19', number: '286-19', title: 'القائم', icon: Building },
  { id: '286-20', number: '286-20', title: 'الحدود والمجاورين', icon: Compass },
  { id: '286-21', number: '286-21', title: 'مساحة الأرض', icon: MapPin },
  { id: '286-13', number: '286-22', title: 'معاينة', icon: Eye },
];

const CreateTransaction_Complete_286 = () => {
  const [activeTab, setActiveTab] = useState('286-01');
  const [transactionId, setTransactionId] = useState('new');
  const queryClient = useQueryClient();

  // الحالة العامة للمعاملة
  const [transactionData, setTransactionData] = useState({});
  const [selectedType, setSelectedType] = useState(null);
  const [assignedStaff, setAssignedStaff] = useState([]);

  // إعداد الفورم
  const form = useForm({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      title: "",
      clientId: "",
      type: "", 
      priority: "medium",
      description: "",
    },
  });

  // --- جلب الموظفين ---
  const { data: employees, isLoading: isLoadingEmployees } = useQuery({
    queryKey: ['employees'],
    queryFn: getEmployees, 
    staleTime: 1000 * 60 * 5,
  });

  // --- جلب بيانات المعاملة الكاملة (عند التعديل) ---
  const { data: existingTransaction } = useQuery({
    queryKey: ['transaction', transactionId],
    queryFn: () => getTransactionById(transactionId),
    enabled: transactionId !== 'new',
  });

  // تحديث الحالة عند جلب معاملة موجودة
  useEffect(() => {
    if (existingTransaction) {
      setTransactionData(existingTransaction);
      if (existingTransaction.transactionType) {
        setSelectedType(existingTransaction.transactionType);
      }
    }
  }, [existingTransaction]);

  // --- Mutations ---

  // 1. إنشاء معاملة جديدة
  const createTransactionMutation = useMutation({
    mutationFn: (data) => createTransaction(data),
    onSuccess: (createdTransaction) => {
      setTransactionId(createdTransaction.id);
      setTransactionData(createdTransaction); 
      toast.success('تم إنشاء مسودة المعاملة بنجاح، انتقل لاختيار النوع');
      setActiveTab('286-02'); // الانتقال التلقائي للتاب الثاني
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
    onError: (error) => {
      toast.error(`فشل الإنشاء: ${error.message}`);
    },
  });

  // 2. تحديث معاملة موجودة
  const updateTransactionMutation = useMutation({
    mutationFn: (data) => updateTransaction(transactionId, data),
    onSuccess: (updatedTransaction) => {
      setTransactionData(prev => ({ ...prev, ...updatedTransaction }));
      toast.success('تم حفظ التعديلات بنجاح');
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
    onError: (error) => {
      toast.error(`فشل التعديل: ${error.message}`);
    },
  });

  // --- Handlers ---
  
  const onSubmitBasicInfo = (data) => {
    if (transactionId === 'new') {
      createTransactionMutation.mutate(data);
    } else {
      updateTransactionMutation.mutate(data);
    }
  };

  // عند اختيار معاملة من القائمة الجانبية (للتعديل)
  const handleTransactionSelect = (tx) => {
    setTransactionId(tx.id);
    setTransactionData(tx);
    
    form.reset({
      title: tx.title,
      clientId: tx.clientId,
      type: tx.transactionTypeId || "",
      priority: tx.priority || "medium",
      description: tx.description || "",
    });

    if (tx.transactionType) {
        setSelectedType(tx.transactionType);
    }
    
    toast.info(`تم تحميل المعاملة: ${tx.transactionCode}`);
  };

  // عند اختيار نوع المعاملة في التبويب الثاني
  const handleTypeSelected = (type) => {
    setSelectedType(type);
    setTransactionData(prev => ({...prev, transactionTypeId: type.id})); 
    form.setValue('type', type.id); 
    toast.success(`تم اختيار النوع: ${type.name}`);
  };

  const handleTasksChange = useCallback((tasks) => {
    setTransactionData(prev => ({...prev, tasks: tasks}));
  }, []);

  const templateTasks = useMemo(() => selectedType?.tasks || [], [selectedType]);
  
  const handleStaffChange = (staff) => {
    setAssignedStaff(staff);
    setTransactionData(prev => ({...prev, staff: staff})); 
  };

  // --- عرض المحتوى ---
  const renderTabContent = () => {
    const isDisabled = transactionId === 'new';

    switch (activeTab) {
      case '286-01':
        return (
          <form onSubmit={form.handleSubmit(onSubmitBasicInfo)}>
            <Tab_286_01_BasicInfo_UltraDense
              form={form} 
              isSaving={createTransactionMutation.isPending || updateTransactionMutation.isPending}
              onSelectTransaction={handleTransactionSelect} 
            />
          </form>
        );
      
      case '286-02': 
        return (
            <Tab_286_02_TransactionDetails_Complete 
                transactionId={transactionId} 
                onTypeSelected={handleTypeSelected} 
            />
        );

      case '286-03': return <Tab_RequestPurpose_Brief_Complete transactionId={transactionId} readOnly={isDisabled} />;
      case '286-04': return <Tab_RequestPurpose_Detailed_Complete transactionId={transactionId} readOnly={isDisabled} />;
      
      case '286-05':
        if (isLoadingEmployees) return <div className="space-y-2 pt-4"><Skeleton className="h-10" /><Skeleton className="h-10" /></div>;
        return <Tab_286_05_Tasks_UltraDense transactionId={transactionId} templateTasks={templateTasks} employees={employees || []} onChange={handleTasksChange} />;
      
      case '286-06':
        return <Tab_286_06_StaffAssignment_UltraDense transactionId={transactionId} assignedStaff={assignedStaff} employees={employees || []} tasks={transactionData.tasks || []} onChange={handleStaffChange} />;
      
      case '286-07': return <Tab_286_07_ClientInfo readOnly={isDisabled} clientId={transactionData.clientId} />;
      
      case '286-08':
        const requiredDocs = selectedType?.documents || [];
        return <Tab_286_08_Attachments_UltraDense transactionId={transactionId} requiredDocuments={requiredDocs} />;
      
      case '286-09': return <Tab_286_09_Appointments transactionId={transactionId} readOnly={isDisabled} />;
      case '286-10': return <Tab_286_10_Costs_UltraDense transactionId={transactionId} />;
      case '286-11': return <Tab_286_11_Approvals transactionId={transactionId} />;
      case '286-12': return <Tab_286_12_Notes transactionId={transactionId} />;
      case '286-13': return <Tab_286_13_Preview_Complex transactionId={transactionId} />;
      
      // التابات الهندسية
      case '286-14': return <Tab_FloorsNaming_Complete transactionId={transactionId} readOnly={isDisabled} />;
      case '286-15': return <Tab_Setbacks_AllFloors_Complete transactionId={transactionId} readOnly={isDisabled} />;
      case '286-16': return <Tab_FinalComponents_Detailed_Complete transactionId={transactionId} readOnly={isDisabled} />;
      case '286-17': return <Tab_Components_Generic_Complete transactionId={transactionId} readOnly={isDisabled} type="old-license" />;
      case '286-18': return <Tab_Components_Generic_Complete transactionId={transactionId} readOnly={isDisabled} type="proposed" />;
      case '286-19': return <Tab_Components_Generic_Complete transactionId={transactionId} readOnly={isDisabled} type="existing" />;
      case '286-20': return <Tab_Boundaries_Neighbors_Complete transactionId={transactionId} readOnly={isDisabled} />;
      case '286-21': return <Tab_LandArea_Complete transactionId={transactionId} readOnly={isDisabled} />;

      default: return <div className="flex justify-center h-96 items-center text-gray-400">التبويب {activeTab} قيد الإنشاء</div>;
    }
  };

  return (
    <div className="w-full h-full" dir="rtl">
      <CodeDisplay code="SCR-286" position="top-right" />
      {/* رأس الصفحة */}
      <div style={{ position: 'sticky', top: '0', zIndex: 10, background: '#fff', borderBottom: '3px solid #2563eb', padding: '14px 20px' }}>
         <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
               <div style={{ padding: '10px', background: '#dbeafe', borderRadius: '12px' }}><Plus className="h-6 w-6 text-blue-600" /></div>
               <div className="flex flex-col gap-1">
                 <h1 style={{ fontWeight: 700, fontSize: '20px', color: '#1e40af' }}>إنشاء معاملة جديدة</h1>
                 <span className="text-xs text-gray-500">286</span>
               </div>
            </div>
         </div>
      </div>

      <div className="flex" style={{ gap: '4px', paddingTop: '16px' }}>
        <UnifiedTabsSidebar
          tabs={TABS_CONFIG}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          disabledTabs={TABS_CONFIG.map(t => t.id).filter(id => id !== '286-01' && transactionId === 'new')}
        />
        
        <div className="flex-1" style={{ minHeight: 'calc(100vh - 220px)', paddingLeft: '16px', paddingRight: '16px' }}>
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default CreateTransaction_Complete_286;