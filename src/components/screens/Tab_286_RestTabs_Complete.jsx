import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { Skeleton } from '../ui/skeleton';
import {
  User, Calendar, CheckCircle, FileText, Printer, Plus, Trash2, 
  MapPin, DollarSign, Compass, Building2, Users, Layers, Briefcase, FileCheck, Loader2
} from 'lucide-react';
import { InputWithCopy, TextAreaWithCopy, SelectWithCopy } from '../InputWithCopy';
import { EnhancedSwitch } from '../EnhancedSwitch';
import CodeDisplay from '../CodeDisplay';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { Progress } from '../ui/progress';
import { toast } from 'sonner';

// API
import api from '../../api/axiosConfig';
import { getAppointmentsByTransaction, createAppointment, deleteAppointment } from '../../api/appointmentApi';
import { getTransactionById, updateTransaction } from '../../api/transactionApi';

// --- Tab 07: Client Info ---
export const Tab_286_07_ClientInfo = ({ clientId }) => {
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchClient = async () => {
      if (!clientId) return;
      setLoading(true);
      try {
        const res = await api.get('/clients');
        const found = res.data.find(c => c.id === clientId);
        setClient(found);
      } catch (err) { toast.error('فشل جلب العميل'); }
      finally { setLoading(false); }
    };
    fetchClient();
  }, [clientId]);

  if (loading) return <Skeleton className="h-40 w-full" />;
  if (!client) return <div className="text-center p-8 text-gray-500">لم يتم تحديد عميل</div>;

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader><CardTitle className="flex items-center gap-2"><User className="w-5 h-5"/> {client.name?.firstName || ''} {client.name?.familyName || ''}</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <InputWithCopy label="رقم الهوية" value={client.idNumber} disabled />
          <InputWithCopy label="الجوال" value={client.contact?.mobile} disabled />
          <InputWithCopy label="البريد" value={client.contact?.email} disabled />
          <InputWithCopy label="النوع" value={client.type} disabled />
        </div>
        <TextAreaWithCopy label="العنوان" value={client.address?.fullAddress || ''} disabled />
      </CardContent>
    </Card>
  );
};

// --- Tab 09: Appointments ---
export const Tab_286_09_Appointments = ({ transactionId, readOnly }) => {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({ type: 'field_visit', date: '', notes: '' });

  const { data: appointments, isLoading } = useQuery({
    queryKey: ['appointments', transactionId],
    queryFn: () => getAppointmentsByTransaction(transactionId),
    enabled: !!transactionId && transactionId !== 'new'
  });

  const createMut = useMutation({
    mutationFn: (data) => createAppointment({...data, transactionId, status: 'scheduled', title: 'موعد جديد'}),
    onSuccess: () => { queryClient.invalidateQueries(['appointments', transactionId]); setIsOpen(false); toast.success('تم'); }
  });

  const deleteMut = useMutation({
    mutationFn: deleteAppointment,
    onSuccess: () => queryClient.invalidateQueries(['appointments', transactionId])
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h3 className="font-bold flex gap-2"><Calendar/> المواعيد</h3>
        {!readOnly && <Button size="sm" onClick={() => setIsOpen(true)}><Plus className="w-4 h-4 ml-1"/> موعد جديد</Button>}
      </div>
      <Card>
        <Table>
          <TableHeader><TableRow><TableHead>النوع</TableHead><TableHead>التاريخ</TableHead><TableHead>الحالة</TableHead><TableHead></TableHead></TableRow></TableHeader>
          <TableBody>
            {appointments?.map(a => (
              <TableRow key={a.id}>
                <TableCell>{a.type === 'field_visit' ? 'كشف ميداني' : 'اجتماع'}</TableCell>
                <TableCell>{new Date(a.date).toLocaleString('ar-SA')}</TableCell>
                <TableCell><Badge variant={a.status==='completed'?'default':'outline'}>{a.status}</Badge></TableCell>
                <TableCell>{!readOnly && <Button variant="ghost" size="icon" className="text-red-500" onClick={()=>deleteMut.mutate(a.id)}><Trash2 className="w-4 h-4"/></Button>}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>جدولة موعد</DialogTitle></DialogHeader>
          <div className="space-y-3 py-4">
            <Label>النوع</Label>
            <Select value={form.type} onValueChange={v => setForm({...form, type: v})}>
              <SelectTrigger><SelectValue/></SelectTrigger>
              <SelectContent><SelectItem value="field_visit">كشف ميداني</SelectItem><SelectItem value="client_meeting">اجتماع</SelectItem></SelectContent>
            </Select>
            <Label>التاريخ</Label><Input type="datetime-local" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
            <Label>ملاحظات</Label><Input value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />
          </div>
          <DialogFooter><Button onClick={() => createMut.mutate(form)}>حفظ</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// --- Tab 11: Approvals ---
export const Tab_286_11_Approvals = ({ transactionId }) => {
  const queryClient = useQueryClient();
  const { data: tx } = useQuery({ queryKey: ['transaction', transactionId], queryFn: () => getTransactionById(transactionId) });
  
  const updateMut = useMutation({
    mutationFn: (approvals) => updateTransaction(transactionId, { approvals }),
    onSuccess: () => { queryClient.invalidateQueries(['transaction', transactionId]); toast.success('تم التحديث'); }
  });

  const toggle = (key, val) => {
    updateMut.mutate({ ...tx.approvals, [key]: val });
  };

  if(!tx) return null;

  return (
    <Card className="border-pink-500">
      <CardHeader><CardTitle className="text-pink-700 flex gap-2"><CheckCircle/> الموافقات المطلوبة</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <EnhancedSwitch label="موافقة المدير" checked={tx.approvals?.manager} onCheckedChange={v => toggle('manager', v)} />
        <EnhancedSwitch label="موافقة فنية" checked={tx.approvals?.technical} onCheckedChange={v => toggle('technical', v)} />
        <EnhancedSwitch label="موافقة مالية" checked={tx.approvals?.financial} onCheckedChange={v => toggle('financial', v)} />
        <EnhancedSwitch label="موافقة العميل" checked={tx.approvals?.client} onCheckedChange={v => toggle('client', v)} />
      </CardContent>
    </Card>
  );
};

// --- Tab 12: Notes ---
export const Tab_286_12_Notes = ({ transactionId }) => {
  const queryClient = useQueryClient();
  const [notes, setNotes] = useState({ general: '', internal: '' });
  const { data: tx } = useQuery({ queryKey: ['transaction', transactionId], queryFn: () => getTransactionById(transactionId) });

  useEffect(() => { if (tx?.notes) setNotes(tx.notes); }, [tx]);

  const saveMut = useMutation({
    mutationFn: () => updateTransaction(transactionId, { notes }),
    onSuccess: () => toast.success('تم حفظ الملاحظات')
  });

  return (
    <Card className="border-yellow-500">
      <CardHeader className="flex flex-row justify-between"><CardTitle>الملاحظات</CardTitle><Button size="sm" onClick={() => saveMut.mutate()}>حفظ</Button></CardHeader>
      <CardContent className="space-y-4">
        <TextAreaWithCopy label="ملاحظات عامة" value={notes.general} onChange={e => setNotes({...notes, general: e.target.value})} rows={4} />
        <TextAreaWithCopy label="ملاحظات داخلية" value={notes.internal} onChange={e => setNotes({...notes, internal: e.target.value})} rows={4} />
      </CardContent>
    </Card>
  );
};

// --- Tab 13: Preview ---
export const Tab_286_13_Preview_Complex = ({ transactionId }) => {
  const { data: tx, isLoading } = useQuery({ queryKey: ['transaction', transactionId], queryFn: () => getTransactionById(transactionId) });

  if (isLoading) return <Loader2 className="animate-spin mx-auto mt-10"/>;
  if (!tx) return <div>لا توجد بيانات</div>;

  return (
    <ScrollArea className="h-[calc(100vh-180px)] p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold flex gap-2"><FileCheck className="text-blue-600"/> {tx.title}</h2>
        <Button onClick={() => window.print()} variant="outline"><Printer className="w-4 h-4 ml-2"/> طباعة</Button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className="bg-blue-50"><CardContent className="p-4"><p className="text-xs text-gray-500">العميل</p><p className="font-bold">{tx.client?.name?.firstName || 'غير محدد'}</p></CardContent></Card>
        <Card className="bg-orange-50"><CardContent className="p-4"><p className="text-xs text-gray-500">الحالة</p><Badge>{tx.status}</Badge></CardContent></Card>
        <Card className="bg-green-50"><CardContent className="p-4"><p className="text-xs text-gray-500">الإجمالي</p><p className="font-bold">{(tx.totalFees||0).toLocaleString()} ر.س</p></CardContent></Card>
      </div>

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="details">
          <AccordionTrigger>التفاصيل الهندسية</AccordionTrigger>
          <AccordionContent>
             <div className="grid grid-cols-2 gap-4">
               <div><strong>المساحة:</strong> {tx.landArea?.naturalArea} م²</div>
               <div><strong>المكونات:</strong> {tx.components?.length || 0} دور</div>
             </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </ScrollArea>
  );
};

export default {
  Tab_286_07_ClientInfo,
  Tab_286_09_Appointments,
  Tab_286_11_Approvals,
  Tab_286_12_Notes,
  Tab_286_13_Preview_Complex
};