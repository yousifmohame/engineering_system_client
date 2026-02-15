import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Plus, Trash2, Save, Calculator, Loader2 } from 'lucide-react';
import { InputWithCopy, SelectWithCopy } from '../InputWithCopy';
import { getTransactionById, updateTransactionFloors } from '../../api/transactionApi';
import { toast } from 'sonner';
import { nanoid } from 'nanoid';

const Tab_FloorsNaming_Complete = ({ transactionId, readOnly }) => {
  const queryClient = useQueryClient();
  const [floors, setFloors] = useState([]);
  
  const { data: transaction } = useQuery({
    queryKey: ['transaction', transactionId],
    queryFn: () => getTransactionById(transactionId),
    enabled: !!transactionId && transactionId !== 'new',
  });

  useEffect(() => {
    if (transaction?.floors?.length > 0) setFloors(transaction.floors);
    else setFloors([{ id: '1', sequence: 1, nameBySystem: 'الأرضي', standardName: 'Ground', isCustomNameBySystem: false }]);
  }, [transaction]);

  const saveMutation = useMutation({
    mutationFn: (data) => updateTransactionFloors(transactionId, data),
    onSuccess: () => { queryClient.invalidateQueries(['transaction', transactionId]); toast.success('تم الحفظ'); }
  });

  const addFloor = () => setFloors([...floors, { id: nanoid(), sequence: floors.length + 1, nameBySystem: '', standardName: '' }]);
  const removeFloor = (id) => setFloors(floors.filter(f => f.id !== id));
  const updateFloor = (id, field, val) => setFloors(floors.map(f => f.id === id ? { ...f, [field]: val } : f));

  return (
    <div className="h-full" dir="rtl">
      <ScrollArea className="h-[calc(100vh-180px)]">
        <Card>
           <CardHeader className="flex flex-row justify-between"><CardTitle>مسميات الأدوار</CardTitle><Button size="sm" onClick={addFloor}><Plus className="w-4 h-4 ml-1"/> إضافة دور</Button></CardHeader>
           <CardContent>
             <Table>
               <TableHeader><TableRow><TableHead>ت</TableHead><TableHead>الاسم (عربي)</TableHead><TableHead>الاسم (إنجليزي)</TableHead><TableHead></TableHead></TableRow></TableHeader>
               <TableBody>
                 {floors.map((f, i) => (
                   <TableRow key={f.id}>
                     <TableCell><Badge>{i + 1}</Badge></TableCell>
                     <TableCell><InputWithCopy value={f.nameBySystem} onChange={e => updateFloor(f.id, 'nameBySystem', e.target.value)} /></TableCell>
                     <TableCell><InputWithCopy value={f.standardName} onChange={e => updateFloor(f.id, 'standardName', e.target.value)} /></TableCell>
                     <TableCell><Button variant="ghost" className="text-red-500" onClick={() => removeFloor(f.id)}><Trash2 className="w-4 h-4"/></Button></TableCell>
                   </TableRow>
                 ))}
               </TableBody>
             </Table>
             <div className="mt-4 flex justify-end"><Button onClick={() => saveMutation.mutate(floors)} disabled={saveMutation.isPending}><Save className="w-4 h-4 ml-2"/> حفظ</Button></div>
           </CardContent>
        </Card>
      </ScrollArea>
    </div>
  );
};
export default Tab_FloorsNaming_Complete;