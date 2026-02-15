import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { InputWithCopy, SelectWithCopy, TextAreaWithCopy } from '../InputWithCopy';
import { Save, Loader2, Clock, FileText, Trash2, Edit, RefreshCw } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { toast } from 'sonner';
import { Form, FormField, FormItem, FormMessage } from "../ui/form"; 

import { getSimpleClients } from '../../api/clientApi';
import { getTransactionTypes, getAllTransactions, deleteTransaction } from '../../api/transactionApi';

const Tab_286_01_BasicInfo_UltraDense = ({ form, isSaving, onSelectTransaction }) => {
  const queryClient = useQueryClient();

  const { data: clients, isLoading: isLoadingClients } = useQuery({
    queryKey: ['clientsForSelect'],
    queryFn: getSimpleClients,
  });

  const { data: recentTransactions, isLoading: isLoadingHistory } = useQuery({
    queryKey: ['recentTransactions'],
    queryFn: getAllTransactions,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTransaction,
    onSuccess: () => {
      toast.success('تم حذف المعاملة بنجاح');
      queryClient.invalidateQueries({ queryKey: ['recentTransactions'] });
    },
    onError: () => toast.error('فشل حذف المعاملة')
  });

  const clientOptions = clients ? clients.map(c => ({ value: c.id, label: c.name })) : [];

  return (
    <div className="space-y-6">
      <Form {...form}>
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-gray-700 flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" /> معلومات أساسية
          </h2>

          <Card className="border-t-4 border-t-blue-600 shadow-sm">
            <CardContent className="p-4 space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <InputWithCopy id="transaction-title" label="عنوان المعاملة *" placeholder="أدخل عنوان المعاملة" required {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="clientId"
                  render={({ field }) => (
                    <FormItem>
                      <SelectWithCopy
                        id="client-id"
                        label="العميل *"
                        value={field.value}
                        onChange={field.onChange}
                        options={clientOptions}
                        isLoading={isLoadingClients}
                        placeholder="اختر العميل..."
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <SelectWithCopy
                        id="priority"
                        label="الأولوية"
                        value={field.value}
                        onChange={field.onChange}
                        options={[
                          { value: 'low', label: 'منخفضة' },
                          { value: 'medium', label: 'متوسطة' },
                          { value: 'high', label: 'عالية' },
                          { value: 'urgent', label: 'عاجلة' }
                        ]}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <TextAreaWithCopy id="description" label="الوصف" placeholder="وصف تفصيلي..." rows={3} {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end pt-2 border-t mt-2">
                <Button type="submit" disabled={isSaving} className="h-10 px-6 bg-blue-600 hover:bg-blue-700 text-white">
                  {isSaving ? <Loader2 className="h-4 w-4 ml-2 animate-spin" /> : <Save className="h-4 w-4 ml-2" />}
                  حفظ المسودة ومتابعة
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Form>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
           <h2 className="text-lg font-bold text-gray-700 flex items-center gap-2"><Clock className="h-5 w-5 text-orange-600" /> المعاملات السابقة</h2>
           <Button variant="ghost" size="sm" onClick={() => queryClient.invalidateQueries({ queryKey: ['recentTransactions'] })}><RefreshCw className="h-4 w-4" /></Button>
        </div>
        <Card className="border-t-4 border-t-orange-400 shadow-sm">
          <CardContent className="p-0">
            <ScrollArea className="h-[250px]">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="text-right">الكود</TableHead>
                    <TableHead className="text-right">العنوان</TableHead>
                    <TableHead className="text-right">العميل</TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                    <TableHead className="text-right">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingHistory ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-8"><Loader2 className="h-6 w-6 animate-spin mx-auto"/></TableCell></TableRow>
                  ) : recentTransactions?.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="font-mono text-xs">{tx.transactionCode}</TableCell>
                      <TableCell className="font-medium">{tx.title}</TableCell>
                      <TableCell className="text-xs">{tx.client?.name?.firstName || 'غير محدد'}</TableCell>
                      <TableCell><Badge variant="outline">{tx.status}</Badge></TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" className="h-8 w-8 text-blue-600" onClick={() => onSelectTransaction && onSelectTransaction(tx)}><Edit className="h-4 w-4" /></Button>
                          <Button size="sm" variant="ghost" className="h-8 w-8 text-red-600" onClick={() => { if(confirm('حذف؟')) deleteMutation.mutate(tx.id); }}><Trash2 className="h-4 w-4" /></Button>
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
    </div>
  );
};
export default Tab_286_01_BasicInfo_UltraDense;