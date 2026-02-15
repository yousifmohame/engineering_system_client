import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../../components/ui/dialog';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Switch } from '../../../../components/ui/switch';
import { Skeleton } from '../../../../components/ui/skeleton';
import { PlusCircle, Edit, Trash2, ListChecks, Settings, AlertCircle, Loader2 } from 'lucide-react';
import { Badge } from '../../../../components/ui/badge';
import { toast } from 'sonner';

import { getRequestPurposes, createRequestPurpose, updateRequestPurpose, deleteRequestPurpose } from '../../../../api/settingsApi';

const Tab_701_RequestPurposes = () => {
  const queryClient = useQueryClient();
  const [currentType, setCurrentType] = useState('brief');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPurpose, setEditingPurpose] = useState(null);

  const { data: purposes, isLoading, isError } = useQuery({
    queryKey: ['requestPurposes', currentType],
    queryFn: () => getRequestPurposes(currentType),
  });

  const createMutation = useMutation({
    mutationFn: createRequestPurpose,
    onSuccess: () => { queryClient.invalidateQueries(['requestPurposes']); setIsDialogOpen(false); toast.success('تم الإنشاء'); }
  });

  const updateMutation = useMutation({
    mutationFn: (data) => updateRequestPurpose(data.id, data),
    onSuccess: () => { queryClient.invalidateQueries(['requestPurposes']); setIsDialogOpen(false); setEditingPurpose(null); toast.success('تم التعديل'); }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRequestPurpose,
    onSuccess: () => { queryClient.invalidateQueries(['requestPurposes']); toast.success('تم الحذف'); }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      type: currentType,
      name: formData.get('name'),
      nameEn: formData.get('nameEn'),
      description: formData.get('description'),
      icon: formData.get('icon'),
      color: formData.get('color'),
      isActive: formData.get('isActive') === 'on',
    };

    if (editingPurpose) {
      updateMutation.mutate({ ...editingPurpose, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <Card dir="rtl">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2"><ListChecks className="h-6 w-6 text-blue-600" /><CardTitle>إدارة أغراض الطلبات</CardTitle></div>
        <Button onClick={() => { setEditingPurpose(null); setIsDialogOpen(true); }} size="sm"><PlusCircle className="ml-2 h-4 w-4" /> إضافة غرض</Button>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4">
          <Button variant={currentType === 'brief' ? 'default' : 'outline'} onClick={() => setCurrentType('brief')}>مختصرة</Button>
          <Button variant={currentType === 'detailed' ? 'default' : 'outline'} onClick={() => setCurrentType('detailed')}>تفصيلية</Button>
        </div>

        {isLoading ? <div className="space-y-2"><Skeleton className="h-10"/><Skeleton className="h-10"/></div> : 
         isError ? <div className="text-red-500 text-center">فشل تحميل البيانات</div> :
        <Table>
          <TableHeader><TableRow><TableHead>الاسم</TableHead><TableHead>الوصف</TableHead><TableHead>اللون</TableHead><TableHead>الحالة</TableHead><TableHead>إجراءات</TableHead></TableRow></TableHeader>
          <TableBody>
            {purposes?.map(p => (
              <TableRow key={p.id}>
                <TableCell><span className="text-lg mr-2">{p.icon}</span>{p.name}</TableCell>
                <TableCell>{p.description}</TableCell>
                <TableCell><div className="w-4 h-4 rounded-full border" style={{backgroundColor: p.color}}></div></TableCell>
                <TableCell><Badge variant={p.isActive ? 'default' : 'outline'}>{p.isActive ? 'نشط' : 'معطل'}</Badge></TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => { setEditingPurpose(p); setIsDialogOpen(true); }}><Edit className="h-4 w-4"/></Button>
                    <Button variant="destructive" size="icon" onClick={() => { if(confirm('حذف؟')) deleteMutation.mutate(p.id); }}><Trash2 className="h-4 w-4"/></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>}
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]" dir="rtl">
          <DialogHeader><DialogTitle>{editingPurpose ? 'تعديل' : 'إضافة'} غرض</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
               <div><Label>الاسم (عربي)</Label><Input name="name" defaultValue={editingPurpose?.name} required /></div>
               <div><Label>الاسم (En)</Label><Input name="nameEn" defaultValue={editingPurpose?.nameEn} required /></div>
            </div>
            <div><Label>الوصف</Label><Input name="description" defaultValue={editingPurpose?.description} /></div>
            <div className="grid grid-cols-2 gap-4">
               <div><Label>الأيقونة (Emoji)</Label><Input name="icon" defaultValue={editingPurpose?.icon} /></div>
               <div><Label>اللون (Hex)</Label><Input name="color" defaultValue={editingPurpose?.color} /></div>
            </div>
            <div className="flex items-center gap-2">
               <Switch id="isActive" name="isActive" defaultChecked={editingPurpose?.isActive ?? true} />
               <Label htmlFor="isActive">نشط</Label>
            </div>
            <DialogFooter>
               <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                 {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="ml-2 h-4 w-4 animate-spin" />} حفظ
               </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default Tab_701_RequestPurposes;