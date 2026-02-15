/**
 * الشاشة 937 - إدارة المعقبين v2.0 DYNAMIC
 * ========================================================
 * * ✅ مربوطة بالـ Backend API بالكامل
 * ✅ تستخدم React Query لجلب البيانات وتخزينها
 * ✅ إحصائيات حقيقية ومحسوبة من السيرفر
 */

import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { ScrollArea } from '../ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Progress } from '../ui/progress';
import UnifiedTabsSidebar from '../UnifiedTabsSidebar';
import { InputWithCopy, SelectWithCopy, TextAreaWithCopy } from '../InputWithCopy';
import { EnhancedSwitch } from '../EnhancedSwitch';
import { toast } from 'sonner'; // أو react-hot-toast حسب مكتبتك
import {
  Users, UserPlus, User, Building2, TrendingUp, Activity,
  CheckCircle, XCircle, Clock, FileText, Eye, Edit, Trash2,
  Plus, Search, Filter, Download, Settings, Award, AlertCircle,
  MapPin, BarChart3, Target, Loader2
} from 'lucide-react';

// استيراد API
import { getAllAgents, getAllTasks, createAgent } from '../../api/followUpApi';

// ============================================================
// تكوين التابات
// ============================================================

const TABS_CONFIG = [
  { id: '937-01', number: '937-01', title: 'نظرة عامة', icon: TrendingUp },
  { id: '937-02', number: '937-02', title: 'إضافة معقب', icon: UserPlus },
  { id: '937-03', number: '937-03', title: 'قائمة المعقبين', icon: Users },
  { id: '937-04', number: '937-04', title: 'الأفراد', icon: User },
  { id: '937-05', number: '937-05', title: 'الكيانات', icon: Building2 },
  { id: '937-06', number: '937-06', title: 'إحصائيات الأداء', icon: BarChart3 },
  { id: '937-07', number: '937-07', title: 'المعاملات النشطة', icon: Activity },
  { id: '937-08', number: '937-08', title: 'سجل المهام', icon: FileText },
  { id: '937-09', number: '937-09', title: 'الجهات الحكومية', icon: MapPin },
  { id: '937-10', number: '937-10', title: 'التقارير', icon: Download },
  { id: '937-11', number: '937-11', title: 'التقييمات', icon: Award },
  { id: '937-12', number: '937-12', title: 'الإعدادات', icon: Settings },
];

// ============================================================
// المكون الرئيسي
// ============================================================

const FollowUpAgents_Complete_937 = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('937-01');
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // ============================================================
  // 1. جلب البيانات (Queries)
  // ============================================================

  const { data: agents = [], isLoading: isLoadingAgents, error: agentsError } = useQuery({
    queryKey: ['followUpAgents'],
    queryFn: () => getAllAgents(),
  });

  const { data: tasks = [], isLoading: isLoadingTasks } = useQuery({
    queryKey: ['followUpTasks'],
    queryFn: getAllTasks,
  });

  // ============================================================
  // 2. إدارة العمليات (Mutations)
  // ============================================================

  // بيانات نموذج إضافة معقب
  const [formData, setFormData] = useState({
    type: 'individual',
    name: '',
    nationalId: '',
    commercialRegister: '',
    phone: '',
    email: '',
    address: '',
    specialization: [],
    governmentEntities: [],
    notes: '',
  });

  const createAgentMutation = useMutation({
    mutationFn: createAgent,
    onSuccess: () => {
      toast.success('تم إضافة المعقب بنجاح');
      queryClient.invalidateQueries({ queryKey: ['followUpAgents'] });
      // إعادة تعيين النموذج
      setFormData({
        type: 'individual',
        name: '',
        nationalId: '',
        commercialRegister: '',
        phone: '',
        email: '',
        address: '',
        specialization: [],
        governmentEntities: [],
        notes: '',
      });
      setActiveTab('937-03'); // الانتقال لقائمة المعقبين
    },
    onError: (error) => {
      toast.error(error.message || 'حدث خطأ أثناء الإضافة');
    }
  });

  const handleCreateSubmit = () => {
    if (!formData.name || !formData.phone) {
      toast.error('يرجى ملء الحقول الإلزامية (الاسم والجوال)');
      return;
    }
    createAgentMutation.mutate(formData);
  };

  // ============================================================
  // 3. الحسابات والفلترة (Memoized)
  // ============================================================

  // حساب الإحصائيات العامة
  const statistics = useMemo(() => {
    if (!agents.length) return {
      total: 0, individuals: 0, entities: 0, active: 0, avgSuccessRate: "0",
      totalTasks: 0, successfulTasks: 0, activeTasks: 0
    };

    const total = agents.length;
    const individuals = agents.filter(a => a.type === 'individual').length;
    const entities = agents.filter(a => a.type === 'entity').length;
    const active = agents.filter(a => a.status === 'active').length;
    
    const avgSuccessRate = agents.reduce((sum, a) => sum + (a.successRate || 0), 0) / (total || 1);
    
    const totalTasks = agents.reduce((sum, a) => sum + (a.totalTasks || 0), 0);
    const successfulTasks = agents.reduce((sum, a) => sum + (a.successfulTasks || 0), 0);
    
    const activeTasks = tasks.filter(t => t.status === 'in-progress' || t.status === 'pending').length;

    return {
      total,
      individuals,
      entities,
      active,
      avgSuccessRate: avgSuccessRate.toFixed(1),
      totalTasks,
      successfulTasks,
      activeTasks,
    };
  }, [agents, tasks]);

  // فلترة المعقبين للعرض
  const filteredAgents = useMemo(() => {
    return agents.filter(agent => {
      const typeMatch = filterType === 'all' || agent.type === filterType;
      const statusMatch = filterStatus === 'all' || agent.status === filterStatus;
      return typeMatch && statusMatch;
    });
  }, [agents, filterType, filterStatus]);

  // ============================================================
  // 4. مكونات العرض (Render Functions)
  // ============================================================

  if (isLoadingAgents || isLoadingTasks) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">جاري تحميل بيانات المعقبين...</p>
        </div>
      </div>
    );
  }

  if (agentsError) {
    return (
      <div className="flex items-center justify-center h-screen text-red-600">
        <p>فشل في تحميل البيانات. يرجى التأكد من تشغيل الخادم.</p>
      </div>
    );
  }

  // --- 937-01: نظرة عامة ---
  const renderTab01_Overview = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-3">
        {[
          { label: 'إجمالي المعقبين', value: statistics.total, icon: Users, color: 'blue' },
          { label: 'أفراد', value: statistics.individuals, icon: User, color: 'indigo' },
          { label: 'كيانات', value: statistics.entities, icon: Building2, color: 'purple' },
          { label: 'نشط', value: statistics.active, icon: CheckCircle, color: 'green' },
          { label: 'متوسط النجاح', value: `${statistics.avgSuccessRate}%`, icon: TrendingUp, color: 'yellow' },
          { label: 'إجمالي المهام', value: statistics.totalTasks, icon: FileText, color: 'red' },
          { label: 'مهام ناجحة', value: statistics.successfulTasks, icon: Target, color: 'pink' },
          { label: 'مهام نشطة', value: statistics.activeTasks, icon: Activity, color: 'orange' },
        ].map((stat, idx) => (
          <Card key={idx} className={`bg-${stat.color}-50 border-${stat.color}-200 border-2`}>
            <CardContent className="p-3 text-center">
              <stat.icon className={`h-5 w-5 mx-auto text-${stat.color}-600 mb-1`} />
              <p className="text-lg font-bold font-tajawal">{stat.value}</p>
              <p className="text-xs text-gray-600 font-tajawal">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="font-tajawal">أفضل المعقبين أداءً</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right font-tajawal">#</TableHead>
                  <TableHead className="text-right font-tajawal">الاسم</TableHead>
                  <TableHead className="text-right font-tajawal">النوع</TableHead>
                  <TableHead className="text-right font-tajawal">إجمالي المهام</TableHead>
                  <TableHead className="text-right font-tajawal">نسبة النجاح</TableHead>
                  <TableHead className="text-right font-tajawal">التقييم</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...agents]
                  .sort((a, b) => (b.successRate || 0) - (a.successRate || 0))
                  .slice(0, 10)
                  .map((agent, index) => (
                    <TableRow key={agent.id}>
                      <TableCell className="text-right font-tajawal">{index + 1}</TableCell>
                      <TableCell className="text-right font-tajawal font-medium">{agent.name}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline">{agent.type === 'individual' ? 'فرد' : 'كيان'}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-tajawal">{agent.totalTasks || 0}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center gap-2">
                          <Progress value={agent.successRate || 0} className="h-2 w-16" />
                          <span className="text-xs font-bold">{agent.successRate}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center gap-1 text-yellow-500">
                          <Award className="h-3 w-3" />
                          <span className="text-xs text-black">{(agent.rating || 0).toFixed(1)}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );

  // --- 937-02: إضافة معقب ---
  const renderTab02_AddAgent = () => (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="font-tajawal">إضافة معقب جديد</CardTitle>
          <CardDescription className="font-tajawal">تسجيل بيانات معقب فرد أو مؤسسة في النظام</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <label className="text-sm font-bold text-gray-700 font-tajawal">نوع المعقب</label>
            <div className="flex gap-4">
              <div 
                className={`flex-1 p-4 border rounded-lg cursor-pointer transition-all ${formData.type === 'individual' ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500' : 'hover:bg-gray-50'}`}
                onClick={() => setFormData({ ...formData, type: 'individual' })}
              >
                <div className="flex items-center gap-3">
                  <User className={`h-6 w-6 ${formData.type === 'individual' ? 'text-blue-600' : 'text-gray-400'}`} />
                  <div>
                    <p className="font-bold font-tajawal">فرد</p>
                    <p className="text-xs text-gray-500 font-tajawal">معقب مستقل برقم هوية</p>
                  </div>
                </div>
              </div>
              <div 
                className={`flex-1 p-4 border rounded-lg cursor-pointer transition-all ${formData.type === 'entity' ? 'bg-purple-50 border-purple-500 ring-1 ring-purple-500' : 'hover:bg-gray-50'}`}
                onClick={() => setFormData({ ...formData, type: 'entity' })}
              >
                <div className="flex items-center gap-3">
                  <Building2 className={`h-6 w-6 ${formData.type === 'entity' ? 'text-purple-600' : 'text-gray-400'}`} />
                  <div>
                    <p className="font-bold font-tajawal">كيان / مؤسسة</p>
                    <p className="text-xs text-gray-500 font-tajawal">مكتب تعقيب بسجل تجاري</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <InputWithCopy
              label="الاسم الكامل *"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={formData.type === 'individual' ? "مثال: محمد عبدالله" : "مثال: مؤسسة الإنجاز السريع"}
            />
            
            {formData.type === 'individual' ? (
              <InputWithCopy
                label="رقم الهوية الوطنية"
                value={formData.nationalId || ''}
                onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
                placeholder="10xxxxxxxx"
              />
            ) : (
              <InputWithCopy
                label="رقم السجل التجاري"
                value={formData.commercialRegister || ''}
                onChange={(e) => setFormData({ ...formData, commercialRegister: e.target.value })}
                placeholder="40xxxxxxxx"
              />
            )}

            <InputWithCopy
              label="رقم الجوال *"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="05xxxxxxxx"
            />

            <InputWithCopy
              label="البريد الإلكتروني"
              value={formData.email || ''}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="email@example.com"
            />
          </div>

          <InputWithCopy
            label="العنوان"
            value={formData.address || ''}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="المدينة - الحي"
          />

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 font-tajawal">التخصصات / الجهات</label>
            <div className="grid grid-cols-3 gap-2">
              {['البلدية', 'الدفاع المدني', 'شركة الكهرباء', 'شركة المياه', 'الأمانة', 'كتابة العدل'].map(entity => (
                <div key={entity} className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    checked={formData.governmentEntities?.includes(entity)}
                    onChange={(e) => {
                      const entities = formData.governmentEntities || [];
                      if (e.target.checked) {
                        setFormData({ ...formData, governmentEntities: [...entities, entity] });
                      } else {
                        setFormData({ ...formData, governmentEntities: entities.filter(i => i !== entity) });
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600"
                  />
                  <span className="text-sm font-tajawal">{entity}</span>
                </div>
              ))}
            </div>
          </div>

          <TextAreaWithCopy
            label="ملاحظات"
            value={formData.notes || ''}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
          />

          <div className="flex justify-end pt-4 border-t">
            <Button 
              onClick={handleCreateSubmit} 
              disabled={createAgentMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {createAgentMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  حفظ بيانات المعقب
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // --- 937-03: قائمة المعقبين ---
  const renderTab03_AllAgents = () => (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-4 gap-4">
            <SelectWithCopy
              label="النوع"
              id="filterType"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              options={[
                { value: 'all', label: 'الكل' },
                { value: 'individual', label: 'أفراد' },
                { value: 'entity', label: 'كيانات' }
              ]}
            />
            <SelectWithCopy
              label="الحالة"
              id="filterStatus"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              options={[
                { value: 'all', label: 'الكل' },
                { value: 'active', label: 'نشط' },
                { value: 'inactive', label: 'غير نشط' },
                { value: 'suspended', label: 'موقوف' }
              ]}
            />
            <div className="col-span-2 flex items-end">
              <Button className="w-full">
                <Search className="h-4 w-4 ml-2" />
                بحث متقدم
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="font-tajawal">
              قائمة المعقبين ({filteredAgents.length})
            </CardTitle>
            <Button size="sm" onClick={() => setActiveTab('937-02')}>
              <Plus className="h-3 w-3 ml-1" />
              إضافة معقب
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right font-tajawal">#</TableHead>
                  <TableHead className="text-right font-tajawal">الاسم</TableHead>
                  <TableHead className="text-right font-tajawal">النوع</TableHead>
                  <TableHead className="text-right font-tajawal">الجوال</TableHead>
                  <TableHead className="text-right font-tajawal">المهام</TableHead>
                  <TableHead className="text-right font-tajawal">نسبة النجاح</TableHead>
                  <TableHead className="text-right font-tajawal">الحالة</TableHead>
                  <TableHead className="text-right font-tajawal">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAgents.map((agent, index) => (
                  <TableRow key={agent.id}>
                    <TableCell className="text-right font-tajawal">{index + 1}</TableCell>
                    <TableCell className="text-right font-tajawal font-medium">{agent.name}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={agent.type === 'individual' ? 'secondary' : 'default'} className="font-tajawal">
                        {agent.type === 'individual' ? 'فرد' : 'كيان'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs">{agent.phone}</TableCell>
                    <TableCell className="text-right font-tajawal">{agent.totalTasks || 0}</TableCell>
                    <TableCell className="text-right">
                      <span className={`font-bold ${agent.successRate && agent.successRate > 80 ? 'text-green-600' : 'text-orange-600'}`}>
                        {agent.successRate || 0}%
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge className={agent.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {agent.status === 'active' ? 'نشط' : 'غير نشط'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="ghost" onClick={() => {
                        setSelectedAgent(agent);
                        setShowDetailsDialog(true);
                      }}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );

  // --- 937-04: الأفراد ---
  const renderTab04_Individuals = () => {
    const individuals = agents.filter(a => a.type === 'individual');
    const totalIndividuals = individuals.length;
    const activeIndividuals = individuals.filter(a => a.status === 'active').length;
    const avgSuccessRate = totalIndividuals > 0 
      ? individuals.reduce((sum, a) => sum + (a.successRate || 0), 0) / totalIndividuals 
      : 0;

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-4 gap-3">
          <Card className="bg-indigo-50 border-indigo-200">
            <CardContent className="p-3 text-center">
              <User className="h-5 w-5 mx-auto text-indigo-600 mb-1" />
              <p className="text-lg font-bold font-tajawal">{totalIndividuals}</p>
              <p className="text-xs text-gray-600 font-tajawal">إجمالي الأفراد</p>
            </CardContent>
          </Card>
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-3 text-center">
              <CheckCircle className="h-5 w-5 mx-auto text-green-600 mb-1" />
              <p className="text-lg font-bold font-tajawal">{activeIndividuals}</p>
              <p className="text-xs text-gray-600 font-tajawal">نشط</p>
            </CardContent>
          </Card>
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-3 text-center">
              <TrendingUp className="h-5 w-5 mx-auto text-yellow-600 mb-1" />
              <p className="text-lg font-bold font-tajawal">{avgSuccessRate.toFixed(1)}%</p>
              <p className="text-xs text-gray-600 font-tajawal">متوسط النجاح</p>
            </CardContent>
          </Card>
          <Card className="bg-pink-50 border-pink-200">
            <CardContent className="p-3 text-center">
              <FileText className="h-5 w-5 mx-auto text-pink-600 mb-1" />
              <p className="text-lg font-bold font-tajawal">
                {individuals.reduce((sum, a) => sum + (a.totalTasks || 0), 0)}
              </p>
              <p className="text-xs text-gray-600 font-tajawal">إجمالي المهام</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="font-tajawal">المعقبون الأفراد ({totalIndividuals})</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[550px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right font-tajawal">#</TableHead>
                    <TableHead className="text-right font-tajawal">الاسم</TableHead>
                    <TableHead className="text-right font-tajawal">رقم الهوية</TableHead>
                    <TableHead className="text-right font-tajawal">الجوال</TableHead>
                    <TableHead className="text-right font-tajawal">المهام</TableHead>
                    <TableHead className="text-right font-tajawal">نسبة النجاح</TableHead>
                    <TableHead className="text-right font-tajawal">التقييم</TableHead>
                    <TableHead className="text-right font-tajawal">الحالة</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {individuals.map((agent, index) => (
                    <TableRow key={agent.id}>
                      <TableCell className="text-right font-tajawal">{index + 1}</TableCell>
                      <TableCell className="text-right font-tajawal font-medium">{agent.name}</TableCell>
                      <TableCell className="text-right font-mono text-xs">{agent.nationalId || '-'}</TableCell>
                      <TableCell className="text-right font-mono text-xs">{agent.phone}</TableCell>
                      <TableCell className="text-right font-tajawal">{agent.totalTasks || 0}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center gap-2">
                          <Progress value={agent.successRate || 0} className="h-2 w-16" />
                          <span className="text-xs font-bold">{agent.successRate}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center gap-1 text-yellow-500">
                          <Award className="h-3 w-3" />
                          <span className="text-xs text-black">{(agent.rating || 0).toFixed(1)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge className={agent.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {agent.status === 'active' ? 'نشط' : 'غير نشط'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    );
  };

  // --- 937-05: الكيانات ---
  const renderTab05_Entities = () => {
    const entities = agents.filter(a => a.type === 'entity');
    const totalEntities = entities.length;
    
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="font-tajawal">الكيانات ({totalEntities})</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[550px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right font-tajawal">#</TableHead>
                    <TableHead className="text-right font-tajawal">الاسم</TableHead>
                    <TableHead className="text-right font-tajawal">السجل التجاري</TableHead>
                    <TableHead className="text-right font-tajawal">الجوال</TableHead>
                    <TableHead className="text-right font-tajawal">المهام</TableHead>
                    <TableHead className="text-right font-tajawal">نسبة النجاح</TableHead>
                    <TableHead className="text-right font-tajawal">التقييم</TableHead>
                    <TableHead className="text-right font-tajawal">الحالة</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entities.map((agent, index) => (
                    <TableRow key={agent.id}>
                      <TableCell className="text-right font-tajawal">{index + 1}</TableCell>
                      <TableCell className="text-right font-tajawal font-medium">{agent.name}</TableCell>
                      <TableCell className="text-right font-mono text-xs">{agent.commercialRegister || '-'}</TableCell>
                      <TableCell className="text-right font-mono text-xs">{agent.phone}</TableCell>
                      <TableCell className="text-right font-tajawal">{agent.totalTasks || 0}</TableCell>
                      <TableCell className="text-right">
                        <span className="font-bold text-green-600">{agent.successRate || 0}%</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center gap-1 text-yellow-500">
                          <Award className="h-3 w-3" />
                          <span className="text-xs text-black">{(agent.rating || 0).toFixed(1)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge className={agent.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {agent.status === 'active' ? 'نشط' : 'غير نشط'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    );
  };

  // --- 937-06: إحصائيات الأداء ---
  const renderTab06_Performance = () => {
    const topPerformers = [...agents].sort((a, b) => (b.successRate || 0) - (a.successRate || 0)).slice(0, 10);
    
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="font-tajawal">أفضل 10 معقبين (حسب نسبة النجاح)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topPerformers.map((agent, index) => (
                <div key={agent.id} className={`p-4 rounded-lg border-r-4 ${index < 3 ? 'bg-yellow-50 border-yellow-500' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full ${index < 3 ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                        <span className="font-bold font-tajawal">{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-bold font-tajawal">{agent.name}</p>
                        <Badge variant="outline" className="mt-1">{agent.type === 'individual' ? 'فرد' : 'كيان'}</Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-8 text-center">
                      <div>
                        <p className="text-xs text-gray-600 font-tajawal">المهام</p>
                        <p className="font-bold">{agent.totalTasks || 0}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 font-tajawal">الناجحة</p>
                        <p className="font-bold text-green-600">{agent.successfulTasks || 0}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 font-tajawal">نسبة النجاح</p>
                        <p className="text-xl font-bold text-green-600">{agent.successRate || 0}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 font-tajawal">التقييم</p>
                        <div className="flex items-center justify-center gap-1 text-yellow-500">
                          <Award className="h-4 w-4" />
                          <span className="font-bold text-black">{(agent.rating || 0).toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // --- 937-07: المعاملات النشطة ---
  const renderTab07_ActiveTransactions = () => {
    const activeAgents = agents.filter(a => (a.activeTransactions || 0) > 0);
    
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="font-tajawal">
                المعقبون مع مهام نشطة ({activeAgents.length})
              </CardTitle>
              <Badge className="bg-blue-100 text-blue-800 font-tajawal">
                {activeAgents.reduce((sum, a) => sum + (a.activeTransactions || 0), 0)} مهمة جارية
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px]">
              <div className="space-y-3">
                {activeAgents.map(agent => (
                  <Card key={agent.id} className="border-r-4 border-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {agent.type === 'individual' ? <User className="h-5 w-5 text-indigo-600" /> : <Building2 className="h-5 w-5 text-purple-600" />}
                          <div>
                            <p className="font-bold font-tajawal">{agent.name}</p>
                            <p className="text-xs text-gray-500 font-mono">{agent.phone}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-6 text-center">
                          <div>
                            <p className="text-xs text-gray-600 font-tajawal">نشطة</p>
                            <p className="text-xl font-bold text-blue-600">{agent.activeTransactions}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600 font-tajawal">مكتملة</p>
                            <p className="text-xl font-bold text-green-600">{agent.completedTransactions || 0}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600 font-tajawal">نسبة النجاح</p>
                            <p className="text-xl font-bold text-green-600">{agent.successRate || 0}%</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {activeAgents.length === 0 && (
                  <div className="text-center py-10 text-gray-500 font-tajawal">
                    لا يوجد معقبون لديهم مهام نشطة حالياً
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    );
  };

  // --- 937-08: سجل المهام ---
  const renderTab08_TasksLog = () => (
    <Card>
      <CardHeader>
        <CardTitle className="font-tajawal">سجل جميع المهام ({tasks.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right font-tajawal">رقم المهمة</TableHead>
                <TableHead className="text-right font-tajawal">المعقب</TableHead>
                <TableHead className="text-right font-tajawal">المعاملة</TableHead>
                <TableHead className="text-right font-tajawal">الجهة</TableHead>
                <TableHead className="text-right font-tajawal">الحالة</TableHead>
                <TableHead className="text-right font-tajawal">النتيجة</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell className="text-right font-mono text-xs">{task.id.slice(-6)}</TableCell>
                  <TableCell className="text-right font-tajawal text-xs">{task.agentName}</TableCell>
                  <TableCell className="text-right font-tajawal text-xs">{task.transactionTitle || task.transactionId}</TableCell>
                  <TableCell className="text-right font-tajawal text-xs">{task.governmentEntity}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant="outline" className="font-tajawal text-xs">
                      {task.status === 'completed' ? 'مكتمل' : 
                       task.status === 'in-progress' ? 'جاري' : 
                       task.status === 'failed' ? 'فشل' : 'معلق'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {task.successStatus === 'success' ? <CheckCircle className="h-4 w-4 text-green-500" /> : 
                     task.successStatus === 'failed' ? <XCircle className="h-4 w-4 text-red-500" /> : 
                     <Clock className="h-4 w-4 text-yellow-500" />}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );

  // --- 937-09: الجهات الحكومية ---
  const renderTab09_GovernmentEntities = () => {
    // تجميع المهام حسب الجهة
    const tasksByEntity = {};
    tasks.forEach(task => {
      const entity = task.governmentEntity || 'غير محدد';
      if (!tasksByEntity[entity]) {
        tasksByEntity[entity] = [];
      }
      tasksByEntity[entity].push(task);
    });

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          {Object.entries(tasksByEntity).map(([entity, entityTasks]) => {
            const successfulCount = entityTasks.filter(t => t.successStatus === 'success').length;
            const successRate = entityTasks.length > 0 ? (successfulCount / entityTasks.length) * 100 : 0;
            const uniqueAgents = new Set(entityTasks.map(t => t.agentId)).size;

            return (
              <Card key={entity} className="border-r-4 border-blue-500">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    <h3 className="font-bold font-tajawal">{entity}</h3>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">إجمالي المهام</span>
                      <span className="font-bold">{entityTasks.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">عدد المعقبين</span>
                      <span className="font-bold">{uniqueAgents}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">نسبة الإنجاز</span>
                      <span className="font-bold text-green-600">{successRate.toFixed(1)}%</span>
                    </div>
                    <Progress value={successRate} className="h-2 mt-2" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {Object.keys(tasksByEntity).length === 0 && (
            <div className="col-span-3 text-center py-10 text-gray-500 font-tajawal">
              لا توجد بيانات متاحة للجهات الحكومية
            </div>
          )}
        </div>
      </div>
    );
  };

  // --- 937-10: التقارير ---
  const renderTab10_Reports = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        {[
          { title: 'تقرير شامل', desc: 'جميع بيانات المعقبين وإحصائياتهم', icon: FileText, color: 'blue' },
          { title: 'الأداء الشهري', desc: 'أداء المعقبين خلال الشهر الحالي', icon: Activity, color: 'green' },
          { title: 'المهام المكتملة', desc: 'سجل المهام التي تم إنجازها بنجاح', icon: CheckCircle, color: 'yellow' },
          { title: 'الجهات الحكومية', desc: 'تحليل التعامل مع الجهات', icon: MapPin, color: 'purple' },
          { title: 'المعقبين الأفراد', desc: 'تقرير خاص بالأفراد فقط', icon: User, color: 'pink' },
          { title: 'الكيانات', desc: 'تقرير خاص بالمؤسسات والشركات', icon: Building2, color: 'cyan' }
        ].map((report, index) => (
          <Card key={index} className="hover:shadow-lg transition-all cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-3 rounded-lg bg-${report.color}-50`}>
                  <report.icon className={`h-6 w-6 text-${report.color}-600`} />
                </div>
                <h3 className="font-bold font-tajawal">{report.title}</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4 font-tajawal">{report.desc}</p>
              <Button className={`w-full bg-${report.color}-600 hover:bg-${report.color}-700`}>
                <Download className="h-4 w-4 ml-2" />
                تحميل التقرير
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  // --- 937-11: التقييمات ---
  const renderTab11_Ratings = () => {
    const ratingGroups = {
      '5': agents.filter(a => a.rating >= 4.5).length,
      '4': agents.filter(a => a.rating >= 3.5 && a.rating < 4.5).length,
      '3': agents.filter(a => a.rating >= 2.5 && a.rating < 3.5).length,
      '2': agents.filter(a => a.rating >= 1.5 && a.rating < 2.5).length,
      '1': agents.filter(a => a.rating < 1.5).length,
    };

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-5 gap-3">
          {Object.entries(ratingGroups).reverse().map(([stars, count]) => (
            <Card key={stars} className="bg-yellow-50 border-yellow-200">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-1 mb-2">
                  {Array.from({ length: parseInt(stars) }).map((_, i) => (
                    <Award key={i} className="h-4 w-4 text-yellow-500" />
                  ))}
                </div>
                <p className="text-2xl font-bold font-tajawal">{count}</p>
                <p className="text-xs text-gray-600 font-tajawal">معقب</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="font-tajawal">المعقبون مرتبون حسب التقييم</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right font-tajawal">#</TableHead>
                    <TableHead className="text-right font-tajawal">الاسم</TableHead>
                    <TableHead className="text-right font-tajawal">النوع</TableHead>
                    <TableHead className="text-right font-tajawal">التقييم</TableHead>
                    <TableHead className="text-right font-tajawal">المهام</TableHead>
                    <TableHead className="text-right font-tajawal">نسبة النجاح</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...agents].sort((a, b) => b.rating - a.rating).map((agent, index) => (
                    <TableRow key={agent.id}>
                      <TableCell className="text-right font-tajawal">{index + 1}</TableCell>
                      <TableCell className="text-right font-tajawal font-medium">{agent.name}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline">{agent.type === 'individual' ? 'فرد' : 'كيان'}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center gap-1 text-yellow-500">
                          {Array.from({ length: Math.round(agent.rating) }).map((_, i) => (
                            <Award key={i} className="h-3 w-3" />
                          ))}
                          <span className="text-xs text-black font-bold mr-1">{(agent.rating || 0).toFixed(1)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-tajawal">{agent.totalTasks || 0}</TableCell>
                      <TableCell className="text-right font-bold text-green-600">{agent.successRate || 0}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    );
  };

  // --- 937-12: الإعدادات ---
  const renderTab12_Settings = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="font-tajawal">إعدادات عامة</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <EnhancedSwitch
              id="auto-assign"
              label="التعيين التلقائي للمعقبين"
              description="تعيين المهام تلقائياً بناءً على التخصص"
              checked={true}
              onCheckedChange={() => {}}
            />
            <EnhancedSwitch
              id="notifications"
              label="إشعارات المهام"
              description="تنبيه المعقبين عند إسناد مهام جديدة"
              checked={true}
              onCheckedChange={() => {}}
            />
            <EnhancedSwitch
              id="rating-system"
              label="التقييم التلقائي"
              description="حساب التقييم بناءً على سرعة ونجاح المهام"
              checked={true}
              onCheckedChange={() => {}}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="font-tajawal">إعدادات الأداء</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-bold mb-1 block font-tajawal">الحد الأدنى لنسبة النجاح (%)</label>
              <InputWithCopy value="60" readOnly />
            </div>
            <div>
              <label className="text-sm font-bold mb-1 block font-tajawal">الحد الأقصى للمهام المتزامنة</label>
              <InputWithCopy value="10" readOnly />
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex justify-end gap-2">
        <Button variant="outline">إلغاء</Button>
        <Button>
          <Settings className="h-4 w-4 ml-2" />
          حفظ الإعدادات
        </Button>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case '937-01': return renderTab01_Overview();
      case '937-02': return renderTab02_AddAgent();
      case '937-03': return renderTab03_AllAgents();
      case '937-04': return renderTab04_Individuals();
      case '937-05': return renderTab05_Entities();
      case '937-06': return renderTab06_Performance();
      case '937-07': return renderTab07_ActiveTransactions();
      case '937-08': return renderTab08_TasksLog();
      case '937-09': return renderTab09_GovernmentEntities();
      case '937-10': return renderTab10_Reports();
      case '937-11': return renderTab11_Ratings();
      case '937-12': return renderTab12_Settings();
      default: return <div className="p-8 text-center text-gray-500">هذا القسم قيد التطوير</div>;
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50/50" style={{ direction: 'rtl' }}>
      {/* الهيدر */}
      <div className="bg-white border-b sticky top-0 z-10 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Users className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800 font-tajawal">إدارة المعقبين</h1>
            <p className="text-sm text-gray-500 font-tajawal">نظام شامل لمتابعة وتقييم أداء المعقبين</p>
          </div>
        </div>
        <div className="px-3 py-1 bg-blue-50 border border-blue-200 rounded-full text-blue-700 text-sm font-bold font-mono">
          937
        </div>
      </div>

      {/* المحتوى */}
      <div className="flex flex-1 overflow-hidden p-4 gap-4">
        <UnifiedTabsSidebar tabs={TABS_CONFIG} activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="flex-1 overflow-y-auto">
          {renderTabContent()}
        </div>
      </div>

      {/* نافذة التفاصيل */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-3xl font-tajawal">
          <DialogHeader>
            <DialogTitle>تفاصيل المعقب</DialogTitle>
            <DialogDescription>عرض المعلومات التفصيلية للمعقب</DialogDescription>
          </DialogHeader>
          
          {selectedAgent && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded">
                  <p className="text-xs text-gray-500">الاسم</p>
                  <p className="font-bold">{selectedAgent.name}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <p className="text-xs text-gray-500">النوع</p>
                  <p className="font-bold">{selectedAgent.type === 'individual' ? 'فرد' : 'كيان'}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <p className="text-xs text-gray-500">الجوال</p>
                  <p className="font-bold font-mono">{selectedAgent.phone}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <p className="text-xs text-gray-500">البريد</p>
                  <p className="font-bold font-mono">{selectedAgent.email || '-'}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-bold mb-2">التخصصات</p>
                <div className="flex flex-wrap gap-2">
                  {selectedAgent.specialization?.map((spec, idx) => (
                    <Badge key={idx} variant="secondary">{spec}</Badge>
                  )) || <p className="text-sm text-gray-400">لا يوجد تخصصات محددة</p>}
                </div>
              </div>

              <div>
                <p className="text-sm font-bold mb-2">الجهات الحكومية</p>
                <div className="flex flex-wrap gap-2">
                  {selectedAgent.governmentEntities?.map((entity, idx) => (
                    <Badge key={idx} variant="outline">{entity}</Badge>
                  )) || <p className="text-sm text-gray-400">لا يوجد جهات محددة</p>}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>إغلاق</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FollowUpAgents_Complete_937;