import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import { format } from "date-fns";
import { arSA } from "date-fns/locale";

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Skeleton } from '../ui/skeleton';

// Icons
import {
  Users, Plus, Edit, Trash2, Eye, Download, Upload, CheckCircle,
  Clock, AlertCircle, X, Search, Calendar, Building,
  Settings, Archive, RefreshCw, Printer, Award,Mail,
  Paperclip, Shield, Phone, MapPin, Briefcase,
  GraduationCap, Star, UserCheck, Home, Globe, FileText, Lock,
  ArrowUp, Ban, Snowflake, UserX, TrendingDown,
  CalendarIcon, AlertTriangle
} from 'lucide-react';

// Custom Components
import UnifiedTabsSidebar from '../UnifiedTabsSidebar';
import { InputWithCopy, TextAreaWithCopy, SelectWithCopy } from '../InputWithCopy';
import CodeDisplay from '../CodeDisplay';

// API Imports (Assuming these exist based on your previous request)
import {
  fetchEmployees,
  createEmployee,
  updateEmployeeStatus,
  updateEmployeePromotion,
  uploadEmployeeAttachment,
  fetchEmployeeAttendance,
  fetchEmployeeLeaveRequests,
  fetchEmployeeSkills,
  fetchEmployeeCertifications,
  fetchEmployeeEvaluations,
  fetchEmployeePromotions,
  fetchEmployeeAttachments
} from '../../api/employeeApi';

// --- Constants & Config ---
const TABS_CONFIG = [
  { id: '817-01', number: '817-01', title: 'قائمة الموظفين', icon: Users },
  { id: '817-02', number: '817-02', title: 'إضافة موظف', icon: Plus },
  { id: '817-03', number: '817-03', title: 'الموظفون الدائمون', icon: Building },
  { id: '817-04', number: '817-04', title: 'الموظفون الجزئيون', icon: Clock },
  { id: '817-05', number: '817-05', title: 'الفريلانسرز', icon: Globe },
  { id: '817-06', number: '817-06', title: 'العمل عن بعد', icon: Home },
  { id: '817-07', number: '817-07', title: 'الحضور والإجازات', icon: Calendar },
  { id: '817-08', number: '817-08', title: 'المهارات والشهادات', icon: GraduationCap },
  { id: '817-09', number: '817-09', title: 'التقييمات', icon: Star },
  { id: '817-10', number: '817-10', title: 'الترقيات', icon: Award },
  { id: '817-11', number: '817-11', title: 'الوثائق', icon: Paperclip },
  { id: '817-12', number: '817-12', title: 'التقارير', icon: FileText },
  { id: '817-13', number: '817-13', title: 'التكامل مع HR', icon: UserCheck },
  { id: '817-14', number: '817-14', title: 'الأرشيف', icon: Archive },
  { id: '817-15', number: '817-15', title: 'الإعدادات', icon: Settings }
];

const EMPLOYEE_TYPES = [
  { value: 'full-time', label: 'دوام كامل', color: 'bg-blue-100 text-blue-700' },
  { value: 'part-time', label: 'دوام جزئي', color: 'bg-green-100 text-green-700' },
  { value: 'freelancer', label: 'فريلانسر', color: 'bg-purple-100 text-purple-700' },
  { value: 'remote', label: 'عمل عن بعد', color: 'bg-pink-100 text-pink-700' },
  { value: 'contract', label: 'عقد مؤقت', color: 'bg-orange-100 text-orange-700' }
];

const EMPLOYEE_STATUSES = [
  { value: 'active', label: 'نشط', color: 'bg-green-100 text-green-700' },
  { value: 'inactive', label: 'غير نشط', color: 'bg-gray-100 text-gray-700' },
  { value: 'frozen', label: 'مجمد', color: 'bg-cyan-100 text-cyan-700' },
  { value: 'terminated', label: 'منتهي', color: 'bg-red-100 text-red-700' }
];

const DEPARTMENTS = [
  'الهندسة', 'الإدارة', 'المحاسبة', 'خدمة العملاء', 'التعقيب', 'التسويق', 'الموارد البشرية', 'تقنية المعلومات'
];

// --- Main Component ---
const EmployeesManagement_Complete_817 = () => {
  const queryClient = useQueryClient();
  
  // State
  const [activeTab, setActiveTab] = useState('817-01');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  
  // Dialog States
  const [showFreezeDialog, setShowFreezeDialog] = useState(false);
  const [showPromoteDialog, setShowPromoteDialog] = useState(false);
  const [showTerminateDialog, setShowTerminateDialog] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  // Form Hook
  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      name: "", nameEn: "", nationalId: "", nationality: "سعودي",
      email: "", phone: "", password: "", type: "full-time",
      department: "الهندسة", position: "", hireDate: "",
      baseSalary: "", gosiNumber: ""
    }
  });

  // --- Queries ---
  const { data: employees = [], isLoading, isError } = useQuery({
    queryKey: ['employees'],
    queryFn: fetchEmployees
  });

  // Detailed Queries (Enabled only when an employee is selected AND specific tab is active)
  const attendanceQuery = useQuery({
    queryKey: ['attendance', selectedEmployeeId],
    queryFn: () => fetchEmployeeAttendance(selectedEmployeeId),
    enabled: !!selectedEmployeeId && activeTab === '817-07'
  });

  const skillsQuery = useQuery({
    queryKey: ['skills', selectedEmployeeId],
    queryFn: () => fetchEmployeeSkills(selectedEmployeeId),
    enabled: !!selectedEmployeeId && activeTab === '817-08'
  });

  const evaluationsQuery = useQuery({
    queryKey: ['evaluations', selectedEmployeeId],
    queryFn: () => fetchEmployeeEvaluations(selectedEmployeeId),
    enabled: !!selectedEmployeeId && activeTab === '817-09'
  });

  const attachmentsQuery = useQuery({
    queryKey: ['attachments', selectedEmployeeId],
    queryFn: () => fetchEmployeeAttachments(selectedEmployeeId),
    enabled: !!selectedEmployeeId && activeTab === '817-11'
  });

  // --- Mutations ---
  const createMutation = useMutation({
    mutationFn: createEmployee,
    onSuccess: () => {
      toast.success('تم إنشاء الموظف بنجاح');
      queryClient.invalidateQueries(['employees']);
      reset();
      setActiveTab('817-01');
    },
    onError: (err) => toast.error(`فشل الإنشاء: ${err.message}`)
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, data }) => updateEmployeeStatus(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['employees']);
      setShowFreezeDialog(false);
      setShowTerminateDialog(false);
      toast.success('تم تحديث الحالة');
    }
  });

  const uploadMutation = useMutation({
    mutationFn: ({ file, id }) => uploadEmployeeAttachment(file, id),
    onSuccess: () => {
      queryClient.invalidateQueries(['attachments', selectedEmployeeId]);
      setShowUploadDialog(false);
      toast.success('تم رفع الملف');
    }
  });

  // --- Computed ---
  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      // Tab Filtering
      if (activeTab === '817-03' && emp.type !== 'full-time') return false;
      if (activeTab === '817-04' && emp.type !== 'part-time') return false;
      if (activeTab === '817-05' && emp.type !== 'freelancer') return false;
      if (activeTab === '817-06' && emp.type !== 'remote') return false;
      if (activeTab === '817-14' && emp.status !== 'terminated') return false;

      // Search Filtering
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = 
        emp.name?.toLowerCase().includes(searchLower) ||
        emp.email?.toLowerCase().includes(searchLower) ||
        emp.phone?.includes(searchQuery);
      
      const matchesType = filterType === 'all' || emp.type === filterType;

      return matchesSearch && matchesType;
    });
  }, [employees, activeTab, searchQuery, filterType]);

  const stats = useMemo(() => ({
    total: employees.length,
    active: employees.filter(e => e.status === 'active').length,
    fullTime: employees.filter(e => e.type === 'full-time').length,
    terminated: employees.filter(e => e.status === 'terminated').length
  }), [employees]);

  // --- Render Helpers ---
  const renderEmployeeList = () => {
    if (isLoading) return <div className="space-y-2"><Skeleton className="h-12"/><Skeleton className="h-12"/><Skeleton className="h-12"/></div>;
    if (isError) return <div className="text-red-500 text-center py-10">فشل تحميل البيانات</div>;
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEmployees.map(emp => {
          const typeInfo = EMPLOYEE_TYPES.find(t => t.value === emp.type);
          const statusInfo = EMPLOYEE_STATUSES.find(s => s.value === emp.status);
          
          return (
            <Card 
              key={emp.id} 
              className={`cursor-pointer hover:shadow-md transition-all ${selectedEmployeeId === emp.id ? 'border-2 border-blue-500 bg-blue-50' : ''}`}
              onClick={() => { setSelectedEmployeeId(emp.id); setSelectedEmployee(emp); }}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold">
                      {emp.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">{emp.name}</h3>
                      <p className="text-xs text-gray-500">{emp.position}</p>
                    </div>
                  </div>
                  <Badge className={statusInfo?.color}>{statusInfo?.label}</Badge>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2"><Mail className="w-4 h-4"/> {emp.email}</div>
                  <div className="flex items-center gap-2"><Phone className="w-4 h-4"/> {emp.phone}</div>
                  <div className="flex items-center gap-2"><Building className="w-4 h-4"/> {emp.department}</div>
                </div>

                <Separator className="my-3"/>
                
                <div className="flex justify-between items-center">
                  <Badge variant="outline" className={typeInfo?.color}>{typeInfo?.label}</Badge>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-600" onClick={(e) => { e.stopPropagation(); /* Edit Logic */ }}><Edit className="w-4 h-4"/></Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-cyan-600" onClick={(e) => { e.stopPropagation(); setSelectedEmployee(emp); setShowFreezeDialog(true); }}><Snowflake className="w-4 h-4"/></Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600" onClick={(e) => { e.stopPropagation(); setSelectedEmployee(emp); setShowTerminateDialog(true); }}><UserX className="w-4 h-4"/></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  const renderCreateForm = () => (
    <Card>
      <CardHeader><CardTitle>بيانات الموظف الجديد</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit((data) => createMutation.mutate(data))} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Controller name="name" control={control} rules={{required:true}} render={({field}) => <InputWithCopy label="الاسم العربي" required {...field}/>} />
            <Controller name="nameEn" control={control} render={({field}) => <InputWithCopy label="الاسم الإنجليزي" {...field}/>} />
            <Controller name="email" control={control} rules={{required:true}} render={({field}) => <InputWithCopy label="البريد الإلكتروني" type="email" required {...field}/>} />
            <Controller name="phone" control={control} rules={{required:true}} render={({field}) => <InputWithCopy label="رقم الجوال" required {...field}/>} />
            <Controller name="nationalId" control={control} rules={{required:true}} render={({field}) => <InputWithCopy label="رقم الهوية" required {...field}/>} />
            <Controller name="nationality" control={control} render={({field}) => <SelectWithCopy label="الجنسية" options={[{value:'سعودي', label:'سعودي'}, {value:'غير سعودي', label:'غير سعودي'}]} {...field}/>} />
          </div>
          
          <Separator />
          
          <div className="grid grid-cols-3 gap-4">
             <Controller name="department" control={control} render={({field}) => <SelectWithCopy label="القسم" options={DEPARTMENTS.map(d=>({value:d, label:d}))} {...field}/>} />
             <Controller name="position" control={control} render={({field}) => <InputWithCopy label="المسمى الوظيفي" {...field}/>} />
             <Controller name="type" control={control} render={({field}) => <SelectWithCopy label="نوع العقد" options={EMPLOYEE_TYPES} {...field}/>} />
             <Controller name="hireDate" control={control} render={({field}) => <InputWithCopy label="تاريخ التعيين" type="date" {...field}/>} />
             <Controller name="baseSalary" control={control} render={({field}) => <InputWithCopy label="الراتب الأساسي" type="number" {...field}/>} />
             <Controller name="password" control={control} rules={{required:true}} render={({field}) => <InputWithCopy label="كلمة المرور" type="password" required {...field}/>} />
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" className="bg-blue-600 text-white" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'جاري الحفظ...' : 'حفظ الموظف'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );

  const renderAttendanceTab = () => {
    if (!selectedEmployeeId) return <div className="text-center py-10 text-gray-500">الرجاء اختيار موظف أولاً</div>;
    if (attendanceQuery.isLoading) return <Skeleton className="h-64"/>;
    
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader><CardTitle>سجل الحضور</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>التاريخ</TableHead><TableHead>الحالة</TableHead><TableHead>دخول</TableHead><TableHead>خروج</TableHead></TableRow></TableHeader>
              <TableBody>
                {attendanceQuery.data?.map(att => (
                  <TableRow key={att.id}>
                    <TableCell>{att.date}</TableCell>
                    <TableCell><Badge variant={att.status==='Present'?'default':'destructive'}>{att.status}</Badge></TableCell>
                    <TableCell>{att.checkIn || '-'}</TableCell>
                    <TableCell>{att.checkOut || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderAttachmentsTab = () => {
    if (!selectedEmployeeId) return <div className="text-center py-10 text-gray-500">الرجاء اختيار موظف أولاً</div>;
    
    return (
      <Card>
        <CardHeader className="flex flex-row justify-between">
           <CardTitle>وثائق الموظف</CardTitle>
           <Button onClick={() => setShowUploadDialog(true)} size="sm"><Upload className="w-4 h-4 ml-2"/> رفع ملف</Button>
        </CardHeader>
        <CardContent>
           {attachmentsQuery.isLoading ? <Skeleton className="h-40"/> : (
             <Table>
               <TableHeader><TableRow><TableHead>اسم الملف</TableHead><TableHead>الحجم</TableHead><TableHead>التاريخ</TableHead><TableHead></TableHead></TableRow></TableHeader>
               <TableBody>
                 {attachmentsQuery.data?.map(file => (
                   <TableRow key={file.id}>
                     <TableCell className="font-medium flex items-center gap-2"><FileText className="w-4 h-4"/> {file.fileName}</TableCell>
                     <TableCell>{(file.fileSize/1024).toFixed(1)} KB</TableCell>
                     <TableCell>{new Date(file.createdAt).toLocaleDateString()}</TableCell>
                     <TableCell>
                       <Button variant="ghost" size="sm"><Download className="w-4 h-4"/></Button>
                     </TableCell>
                   </TableRow>
                 ))}
               </TableBody>
             </Table>
           )}
        </CardContent>
      </Card>
    );
  };

  // --- Main Render ---
  return (
    <div className="min-h-screen bg-gray-50 p-4" dir="rtl" style={{ fontFamily: 'Tajawal, sans-serif' }}>
      <CodeDisplay code="SCR-817" />
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
           <div className="p-3 bg-blue-600 rounded-lg text-white"><Users size={24}/></div>
           <div>
             <h1 className="text-2xl font-bold text-gray-800">إدارة الموظفين</h1>
             <p className="text-sm text-gray-500">لوحة التحكم المركزية للموارد البشرية</p>
           </div>
        </div>
        <div className="flex gap-2">
           <Badge className="bg-blue-100 text-blue-700 text-lg px-3">{stats.total} موظف</Badge>
           <Badge className="bg-green-100 text-green-700 text-lg px-3">{stats.active} نشط</Badge>
        </div>
      </div>

      <div className="flex gap-4 items-start">
        {/* Sidebar */}
        <UnifiedTabsSidebar 
          tabs={TABS_CONFIG} 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
        />

        {/* Content */}
        <div className="flex-1 min-h-[600px]">
          {activeTab === '817-02' ? renderCreateForm() :
           activeTab === '817-07' ? renderAttendanceTab() :
           activeTab === '817-11' ? renderAttachmentsTab() :
           (
             <div className="space-y-4">
                {/* Filters for Lists */}
                {(activeTab === '817-01' || activeTab.startsWith('817-0')) && (
                  <Card className="mb-4">
                    <CardContent className="p-4 flex gap-4">
                       <div className="relative flex-1">
                          <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400"/>
                          <Input className="pr-10" placeholder="بحث بالاسم، الهوية، أو الجوال..." value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} />
                       </div>
                       <Select value={filterType} onValueChange={setFilterType}>
                         <SelectTrigger className="w-[180px]"><SelectValue placeholder="نوع العقد"/></SelectTrigger>
                         <SelectContent>
                           <SelectItem value="all">الكل</SelectItem>
                           {EMPLOYEE_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                         </SelectContent>
                       </Select>
                    </CardContent>
                  </Card>
                )}
                {renderEmployeeList()}
             </div>
           )}
        </div>
      </div>

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent>
           <DialogHeader><DialogTitle>رفع وثيقة</DialogTitle></DialogHeader>
           <div className="py-8 text-center border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50" onClick={() => document.getElementById('file-upload').click()}>
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-2"/>
              <p>اضغط لاختيار ملف</p>
              <input id="file-upload" type="file" className="hidden" onChange={e => setSelectedFile(e.target.files[0])} />
              {selectedFile && <p className="mt-2 font-bold text-blue-600">{selectedFile.name}</p>}
           </div>
           <DialogFooter>
             <Button onClick={() => uploadMutation.mutate({file:selectedFile, id:selectedEmployeeId})} disabled={!selectedFile}>رفع</Button>
           </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Freeze Dialog */}
      <Dialog open={showFreezeDialog} onOpenChange={setShowFreezeDialog}>
         <DialogContent>
            <DialogHeader><DialogTitle>تجميد الحساب</DialogTitle></DialogHeader>
            <div className="space-y-4">
               <p>هل أنت متأكد من تجميد حساب <strong>{selectedEmployee?.name}</strong>؟</p>
               <Textarea placeholder="سبب التجميد..." />
            </div>
            <DialogFooter>
               <Button variant="destructive" onClick={() => updateStatusMutation.mutate({id:selectedEmployee.id, data:{status:'frozen'}})}>تأكيد التجميد</Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>

       {/* Terminate Dialog */}
       <Dialog open={showTerminateDialog} onOpenChange={setShowTerminateDialog}>
         <DialogContent>
            <DialogHeader><DialogTitle>إنهاء الخدمات</DialogTitle></DialogHeader>
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto"/>
            <p className="text-center text-red-600 font-bold">هذا الإجراء نهائي ولا يمكن التراجع عنه.</p>
            <DialogFooter>
               <Button variant="destructive" onClick={() => updateStatusMutation.mutate({id:selectedEmployee.id, data:{status:'terminated'}})}>تأكيد الإنهاء</Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmployeesManagement_Complete_817;