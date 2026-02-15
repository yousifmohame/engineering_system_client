import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';

import { getFullTransactionTypes, createTransactionType, updateTransactionType, deleteTransactionType } from '../../../../api/transactionApi';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../components/ui/tabs';
import { Button } from '../../../../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '../../../../components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../../../components/ui/alert-dialog';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '../../../../components/ui/form';
import { Input } from '../../../../components/ui/input';
import { Switch } from '../../../../components/ui/switch'; // تأكد من أنك أنشأت هذا المكون سابقاً
import { Badge } from '../../../../components/ui/badge';
import { Card, CardContent } from '../../../../components/ui/card';
import { Plus, Edit, Trash2, Loader2, AlertTriangle } from 'lucide-react';
import { Skeleton } from '../../../../components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';

// استيراد المكونات الفرعية التي أنشأناها في الخطوة السابقة
import { TransactionTypeDocuments, TransactionTypeTasks, TransactionTypeFees } from './components/TransactionTypeSubTabs';

// Zod Schema
const typeSchema = z.object({
  name: z.string().min(1, "الاسم مطلوب"),
  categoryAr: z.string().optional(),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
  duration: z.preprocess((val) => (val ? Number(val) : 0), z.number().min(0).optional()),
  estimatedCost: z.preprocess((val) => (val ? Number(String(val).replace(/,/g, '')) : 0), z.number().min(0).optional()),
  complexity: z.string().optional(),
  documents: z.array(z.object({ value: z.string() })).optional(),
  tasks: z.array(z.object({ name: z.string(), duration: z.coerce.number(), role: z.string() })).optional(),
  fees: z.array(z.object({ name: z.string(), amount: z.coerce.number(), authority: z.string(), required: z.boolean().optional() })).optional(),
});

const Tab_701_01_TransactionTypes = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [isDeleting, setIsDeleting] = useState(null);

  const form = useForm({
    resolver: zodResolver(typeSchema),
    defaultValues: { name: '', description: '', isActive: true, categoryAr: '', duration: 0, estimatedCost: 0, complexity: 'medium', documents: [], tasks: [], fees: [] },
  });

  const { data: types, isLoading, isError } = useQuery({
    queryKey: ['fullTransactionTypes'],
    queryFn: getFullTransactionTypes,
  });

  const createMutation = useMutation({
    mutationFn: createTransactionType,
    onSuccess: () => {
      toast.success("تم إنشاء النوع بنجاح");
      queryClient.invalidateQueries(['fullTransactionTypes']);
      setIsDialogOpen(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateTransactionType(id, data),
    onSuccess: () => {
      toast.success("تم التعديل بنجاح");
      queryClient.invalidateQueries(['fullTransactionTypes']);
      setIsDialogOpen(false);
      setEditingType(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTransactionType,
    onSuccess: () => {
      toast.success("تم الحذف بنجاح");
      queryClient.invalidateQueries(['fullTransactionTypes']);
      setIsDeleting(null);
    }
  });

  useEffect(() => {
    if (isDialogOpen) {
      if (editingType) {
        form.reset({
          ...editingType,
          documents: (editingType.documents || []).map(doc => ({ value: doc })),
          tasks: editingType.tasks || [],
          fees: editingType.fees || []
        });
      } else {
        form.reset({ name: '', description: '', isActive: true, categoryAr: '', duration: 0, estimatedCost: 0, complexity: 'medium', documents: [], tasks: [], fees: [] });
      }
    }
  }, [isDialogOpen, editingType, form]);

  const onSubmit = (data) => {
    const payload = {
      ...data,
      documents: data.documents ? data.documents.map(doc => doc.value) : [],
    };
    if (editingType) {
      updateMutation.mutate({ id: editingType.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  if (isLoading) return <Skeleton className="h-64 w-full" />;
  if (isError) return <div className="text-red-500 text-center p-10">فشل تحميل البيانات</div>;

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">إدارة قوالب المعاملات</h2>
        <Button onClick={() => { setEditingType(null); setIsDialogOpen(true); }} className="bg-blue-600 text-white">
          <Plus className="h-4 w-4 ml-2" /> إضافة قالب
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الكود</TableHead><TableHead>الاسم</TableHead><TableHead>التصنيف</TableHead><TableHead>المدة</TableHead><TableHead>التكلفة</TableHead><TableHead>الحالة</TableHead><TableHead>إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {types?.map((type) => (
                <TableRow key={type.id}>
                  <TableCell className="font-mono">{type.code}</TableCell>
                  <TableCell className="font-medium">{type.name}</TableCell>
                  <TableCell>{type.categoryAr}</TableCell>
                  <TableCell>{type.duration} يوم</TableCell>
                  <TableCell>{type.estimatedCost?.toLocaleString()} ر.س</TableCell>
                  <TableCell><Badge className={type.isActive ? 'bg-green-600' : 'bg-gray-400'}>{type.isActive ? 'نشط' : 'غير نشط'}</Badge></TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => { setEditingType(type); setIsDialogOpen(true); }}><Edit className="h-4 w-4" /></Button>
                      <Button variant="destructive" size="sm" onClick={() => setIsDeleting(type)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader><DialogTitle>{editingType ? 'تعديل القالب' : 'إضافة قالب جديد'}</DialogTitle></DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="basic">أساسي</TabsTrigger>
                  <TabsTrigger value="documents">المستندات</TabsTrigger>
                  <TabsTrigger value="tasks">المهام</TabsTrigger>
                  <TabsTrigger value="fees">الرسوم</TabsTrigger>
                </TabsList>
                
                <TabsContent value="basic" className="space-y-4 pt-4">
                   <div className="grid grid-cols-2 gap-4">
                      <FormField control={form.control} name="name" render={({ field }) => <FormItem><FormLabel>الاسم</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                      <FormField control={form.control} name="categoryAr" render={({ field }) => <FormItem><FormLabel>التصنيف</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                   </div>
                   <div className="grid grid-cols-3 gap-4">
                      <FormField control={form.control} name="duration" render={({ field }) => <FormItem><FormLabel>المدة (أيام)</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>} />
                      <FormField control={form.control} name="estimatedCost" render={({ field }) => <FormItem><FormLabel>التكلفة المتوقعة</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>} />
                      <FormField control={form.control} name="complexity" render={({ field }) => <FormItem><FormLabel>التعقيد</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="simple">بسيط</SelectItem><SelectItem value="medium">متوسط</SelectItem><SelectItem value="complex">معقد</SelectItem></SelectContent></Select></FormItem>} />
                   </div>
                   <FormField control={form.control} name="isActive" render={({ field }) => <FormItem className="flex items-center gap-2 border p-2 rounded"><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel className="pb-0">تفعيل القالب</FormLabel></FormItem>} />
                </TabsContent>
                
                <TabsContent value="documents"><TransactionTypeDocuments control={form.control} /></TabsContent>
                <TabsContent value="tasks"><TransactionTypeTasks control={form.control} /></TabsContent>
                <TabsContent value="fees"><TransactionTypeFees control={form.control} /></TabsContent>
              </Tabs>

              <DialogFooter>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                   {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="ml-2 h-4 w-4 animate-spin" />} حفظ
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
export default Tab_701_01_TransactionTypes;