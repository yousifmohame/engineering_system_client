import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { CheckCircle, Users, Paperclip, Clock, Plus, Edit2, Trash2, Upload, Download, FileCheck, Save, AlertCircle, Mail, Phone, Loader2, FileText } from 'lucide-react';
import CodeDisplay from '../CodeDisplay';
import { ScrollArea } from '../ui/scroll-area';
import { nanoid } from 'nanoid';
import { getTransactionById, updateTransactionCosts, updateTransactionStaff, updateTransactionTasks } from '../../api/transactionApi';
import { getAttachments, uploadAttachment, deleteAttachment } from '../../api/attachmentApi';
import { Skeleton } from '../ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { toast } from 'sonner';

// --- Tab 05: Tasks ---
export const Tab_286_05_Tasks_UltraDense = ({ transactionId, templateTasks, employees, onChange }) => {
  const queryClient = useQueryClient();
  const [tasks, setTasks] = useState([]);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskForm, setTaskForm] = useState({ name: '', duration: 1, priority: 'medium' });

  const { data: transaction } = useQuery({
    queryKey: ['transaction', transactionId],
    queryFn: () => getTransactionById(transactionId),
    enabled: !!transactionId && transactionId !== 'new'
  });

  useEffect(() => {
    if (transaction?.tasks?.length > 0) {
      setTasks(transaction.tasks);
    } else if (templateTasks?.length > 0 && tasks.length === 0) {
      setTasks(templateTasks.map(t => ({
        id: nanoid(),
        title: t.name || 'مهمة',
        duration: t.duration || 1,
        priority: t.priority || 'medium',
        status: 'Pending',
        assignedToId: null
      })));
    }
  }, [transaction, templateTasks]);

  useEffect(() => { if (onChange) onChange(tasks); }, [tasks]);

  const saveMutation = useMutation({
    mutationFn: (currentTasks) => updateTransactionTasks(transactionId, { tasks: currentTasks }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transaction', transactionId] });
      toast.success('تم حفظ المهام');
    }
  });

  const handleSaveDialog = () => {
    let updatedTasks;
    if (editingTask) {
      updatedTasks = tasks.map(t => t.id === editingTask.id ? { ...t, ...taskForm, title: taskForm.name } : t);
    } else {
      updatedTasks = [...tasks, { id: nanoid(), title: taskForm.name, duration: taskForm.duration, priority: taskForm.priority, status: 'Pending' }];
    }
    setTasks(updatedTasks);
    setIsTaskDialogOpen(false);
  };

  const handleAssign = (taskId, empId) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, assignedToId: empId } : t));
  };

  return (
    <div className="h-[calc(100vh-180px)]" dir="rtl">
      <div className="flex justify-between mb-2">
        <h3 className="font-bold">قائمة المهام</h3>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => { setEditingTask(null); setTaskForm({name:'', duration:1, priority:'medium'}); setIsTaskDialogOpen(true); }}>
            <Plus className="w-4 h-4 ml-1"/> جديد
          </Button>
          <Button size="sm" variant="default" onClick={() => saveMutation.mutate(tasks)} disabled={saveMutation.isPending}>
            <Save className="w-4 h-4 ml-1"/> حفظ
          </Button>
        </div>
      </div>
      <ScrollArea className="h-full border rounded-md">
        <Table>
          <TableHeader><TableRow><TableHead>المهمة</TableHead><TableHead>المدة</TableHead><TableHead>المسؤول</TableHead><TableHead>الأولوية</TableHead><TableHead>الحالة</TableHead><TableHead>إجراء</TableHead></TableRow></TableHeader>
          <TableBody>
            {tasks.map(t => (
              <TableRow key={t.id}>
                <TableCell>{t.title || t.name}</TableCell>
                <TableCell>{t.duration} يوم</TableCell>
                <TableCell>
                  <Select value={t.assignedToId || ''} onValueChange={(v) => handleAssign(t.id, v)}>
                    <SelectTrigger className="h-7 w-[140px]"><SelectValue placeholder="اختر..." /></SelectTrigger>
                    <SelectContent>{employees.map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}</SelectContent>
                  </Select>
                </TableCell>
                <TableCell><Badge variant="outline">{t.priority}</Badge></TableCell>
                <TableCell><Badge>{t.status}</Badge></TableCell>
                <TableCell>
                  <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => { setEditingTask(t); setTaskForm({name: t.title||t.name, duration: t.duration, priority: t.priority}); setIsTaskDialogOpen(true); }}><Edit2 className="w-3 h-3"/></Button>
                  <Button size="icon" variant="ghost" className="h-6 w-6 text-red-500" onClick={() => setTasks(tasks.filter(x => x.id !== t.id))}><Trash2 className="w-3 h-3"/></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
      <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingTask ? 'تعديل' : 'إضافة'} مهمة</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2"><Label>الاسم</Label><Input value={taskForm.name} onChange={e => setTaskForm({...taskForm, name: e.target.value})} /></div>
            <div className="flex gap-4">
              <div className="flex-1 space-y-2"><Label>المدة</Label><Input type="number" value={taskForm.duration} onChange={e => setTaskForm({...taskForm, duration: +e.target.value})} /></div>
              <div className="flex-1 space-y-2">
                <Label>الأولوية</Label>
                <Select value={taskForm.priority} onValueChange={v => setTaskForm({...taskForm, priority: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="low">منخفضة</SelectItem><SelectItem value="medium">متوسطة</SelectItem><SelectItem value="high">عالية</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter><Button onClick={handleSaveDialog}>حفظ</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// --- Tab 06: Staff ---
export const Tab_286_06_StaffAssignment_UltraDense = ({ transactionId, employees, tasks, onChange }) => {
  const queryClient = useQueryClient();
  const [staffList, setStaffList] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [staffForm, setStaffForm] = useState({ employeeId: '', role: '' });

  const { data: transaction } = useQuery({
    queryKey: ['transaction', transactionId],
    queryFn: () => getTransactionById(transactionId),
    enabled: !!transactionId && transactionId !== 'new'
  });

  useEffect(() => {
    if (transaction?.transactionEmployees) {
      setStaffList(transaction.transactionEmployees.map(te => ({
        id: te.id || nanoid(), employeeId: te.employeeId, role: te.role
      })));
    }
  }, [transaction]);

  useEffect(() => { if (onChange) onChange(staffList); }, [staffList]);

  const saveMutation = useMutation({
    mutationFn: (list) => updateTransactionStaff(transactionId, { staff: list }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transaction', transactionId] });
      toast.success('تم حفظ الفريق');
    }
  });

  const handleAddStaff = () => {
    setStaffList([...staffList, { id: nanoid(), ...staffForm }]);
    setIsDialogOpen(false);
    setStaffForm({ employeeId: '', role: '' });
  };

  return (
    <div className="h-[calc(100vh-180px)]" dir="rtl">
      <div className="flex justify-between mb-2">
        <h3 className="font-bold">فريق العمل</h3>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setIsDialogOpen(true)}><Plus className="w-4 h-4 ml-1"/> إضافة موظف</Button>
          <Button size="sm" onClick={() => saveMutation.mutate(staffList)}><Save className="w-4 h-4 ml-1"/> حفظ التغييرات</Button>
        </div>
      </div>
      <ScrollArea className="h-full border rounded-md">
        <Table>
          <TableHeader><TableRow><TableHead>الاسم</TableHead><TableHead>الدور</TableHead><TableHead>المهام</TableHead><TableHead>إجراء</TableHead></TableRow></TableHeader>
          <TableBody>
            {staffList.map(s => {
              const emp = employees.find(e => e.id === s.employeeId);
              const taskCount = tasks.filter(t => t.assignedToId === s.employeeId).length;
              return (
                <TableRow key={s.id}>
                  <TableCell>{emp?.name}</TableCell>
                  <TableCell>{s.role}</TableCell>
                  <TableCell><Badge variant="secondary">{taskCount} مهام</Badge></TableCell>
                  <TableCell>
                    <Button size="icon" variant="ghost" className="h-6 w-6 text-red-500" onClick={() => setStaffList(staffList.filter(x => x.id !== s.id))}><Trash2 className="w-3 h-3"/></Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </ScrollArea>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>إضافة عضو للفريق</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>الموظف</Label>
              <Select value={staffForm.employeeId} onValueChange={v => setStaffForm({...staffForm, employeeId: v})}>
                <SelectTrigger><SelectValue placeholder="اختر..."/></SelectTrigger>
                <SelectContent>{employees.map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>الدور</Label><Input value={staffForm.role} onChange={e => setStaffForm({...staffForm, role: e.target.value})} placeholder="مثال: مهندس موقع" /></div>
          </div>
          <DialogFooter><Button onClick={handleAddStaff}>إضافة</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// --- Tab 08: Attachments ---
export const Tab_286_08_Attachments_UltraDense = ({ transactionId, requiredDocuments = [] }) => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);

  const { data: attachments, isLoading } = useQuery({
    queryKey: ['attachments', transactionId],
    queryFn: () => getAttachments(transactionId),
    enabled: !!transactionId && transactionId !== 'new'
  });

  const uploadMutation = useMutation({
    mutationFn: (file) => uploadAttachment(file, transactionId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['attachments', transactionId] })
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteAttachment(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['attachments', transactionId] })
  });

  const handleUpload = (e) => {
    if (e.target.files?.[0]) uploadMutation.mutate(e.target.files[0]);
  };

  return (
    <div className="flex gap-4 h-[calc(100vh-180px)]" dir="rtl">
      <Card className="w-1/3">
        <CardContent className="p-4">
          <h3 className="font-bold mb-4 flex items-center gap-2"><FileCheck className="w-4 h-4"/> المطلوبات</h3>
          <div className="space-y-2">
            {requiredDocuments.map((doc, idx) => {
              const isUploaded = attachments?.some(a => a.fileName.includes(doc));
              return (
                <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded border">
                  <span className="text-sm">{doc}</span>
                  {isUploaded ? <CheckCircle className="w-4 h-4 text-green-500"/> : <span className="w-2 h-2 bg-orange-400 rounded-full"/>}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
      <Card className="w-2/3">
        <CardContent className="p-4 h-full flex flex-col">
          <div className="flex justify-between mb-4">
            <h3 className="font-bold">الملفات المرفوعة</h3>
            <Button size="sm" onClick={() => fileInputRef.current.click()} disabled={uploadMutation.isPending}>
              {uploadMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin"/> : <Upload className="w-4 h-4 ml-2"/>} رفع ملف
            </Button>
            <input type="file" ref={fileInputRef} className="hidden" onChange={handleUpload}/>
          </div>
          <ScrollArea className="flex-1">
            <Table>
              <TableHeader><TableRow><TableHead>الملف</TableHead><TableHead>الحجم</TableHead><TableHead>التاريخ</TableHead><TableHead></TableHead></TableRow></TableHeader>
              <TableBody>
                {attachments?.map(f => (
                  <TableRow key={f.id}>
                    <TableCell className="font-medium flex items-center gap-2"><Paperclip className="w-3 h-3"/> <a href={f.filePath} target="_blank" className="hover:underline">{f.fileName}</a></TableCell>
                    <TableCell>{(f.fileSize/1024).toFixed(1)} KB</TableCell>
                    <TableCell>{new Date(f.createdAt).toLocaleDateString('ar-SA')}</TableCell>
                    <TableCell>
                      <Button size="icon" variant="ghost" className="h-6 w-6 text-red-500" onClick={() => deleteMutation.mutate(f.id)}><Trash2 className="w-3 h-3"/></Button>
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

// --- Tab 10: Costs ---
export const Tab_286_10_Costs_UltraDense = ({ transactionId }) => {
  const queryClient = useQueryClient();
  const [costs, setCosts] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: '', amount: 0 });
  const [activeCat, setActiveCat] = useState(null);

  const { data: transaction } = useQuery({
    queryKey: ['transaction', transactionId],
    queryFn: () => getTransactionById(transactionId),
    enabled: !!transactionId
  });

  useEffect(() => {
    if (transaction?.costDetails?.length > 0) {
      setCosts(transaction.costDetails);
      setActiveCat(transaction.costDetails[0].id);
    }
  }, [transaction]);

  const saveMutation = useMutation({
    mutationFn: (newCosts) => updateTransactionCosts(transactionId, { costDetails: newCosts }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transaction', transactionId] });
      setIsDialogOpen(false);
      toast.success('تم حفظ التكاليف');
    }
  });

  const handleAddItem = () => {
    const updated = costs.map(c => c.id === activeCat ? {
      ...c, items: [...c.items, { id: nanoid(), name: form.name, amount: form.amount, paid: 0, remaining: form.amount, status: 'pending' }]
    } : c);
    saveMutation.mutate(updated);
  };

  const total = costs.reduce((sum, c) => sum + c.items.reduce((s, i) => s + i.amount, 0), 0);

  return (
    <div className="h-[calc(100vh-180px)]" dir="rtl">
      <div className="grid grid-cols-3 gap-4 mb-4">
        <Card className="bg-blue-50 border-blue-200"><CardContent className="p-2 text-center"><p className="text-xs">الإجمالي</p><p className="font-bold text-blue-700">{total.toLocaleString()} ر.س</p></CardContent></Card>
        {/* ... بقية الإحصائيات */}
      </div>
      <Card className="h-[calc(100%-80px)]">
        <CardContent className="p-0 h-full flex flex-col">
          <Tabs value={activeCat} onValueChange={setActiveCat} className="flex-1 flex flex-col">
            <div className="p-2 bg-gray-50 border-b">
              <TabsList>{costs.map(c => <TabsTrigger key={c.id} value={c.id}>{c.category}</TabsTrigger>)}</TabsList>
            </div>
            {costs.map(cat => (
              <TabsContent key={cat.id} value={cat.id} className="flex-1 p-0 m-0">
                <div className="flex justify-end p-2"><Button size="sm" onClick={() => { setIsDialogOpen(true); setForm({name:'', amount:0}); }}><Plus className="w-4 h-4 ml-1"/> إضافة بند</Button></div>
                <ScrollArea className="h-[300px]">
                  <Table>
                    <TableHeader><TableRow><TableHead>البند</TableHead><TableHead>المبلغ</TableHead><TableHead>المدفوع</TableHead><TableHead></TableHead></TableRow></TableHeader>
                    <TableBody>
                      {cat.items.map(item => (
                        <TableRow key={item.id}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell className="font-bold">{item.amount.toLocaleString()}</TableCell>
                          <TableCell className="text-green-600">{item.paid.toLocaleString()}</TableCell>
                          <TableCell><Button variant="ghost" size="icon" className="h-6 w-6 text-red-500"><Trash2 className="w-3 h-3"/></Button></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>إضافة تكلفة</DialogTitle></DialogHeader>
          <div className="space-y-3 py-4">
             <Label>الوصف</Label><Input value={form.name} onChange={e => setForm({...form, name:e.target.value})}/>
             <Label>المبلغ</Label><Input type="number" value={form.amount} onChange={e => setForm({...form, amount:+e.target.value})}/>
          </div>
          <DialogFooter><Button onClick={handleAddItem}>حفظ</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};