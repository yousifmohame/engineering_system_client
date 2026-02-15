import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Save, FileText } from 'lucide-react';
import { InputWithCopy } from '../InputWithCopy';
import { getTransactionById, updateTransactionGenericComponents } from '../../api/transactionApi';
import { toast } from 'sonner';

const Tab_Components_Generic_Complete = ({ transactionId, type }) => {
  const queryClient = useQueryClient();
  const [components, setComponents] = useState([]);
  
  const config = {
    'old-license': { title: 'الرخصة القديمة', field: 'componentsOldLicense' },
    'proposed': { title: 'المقترح', field: 'componentsProposed' },
    'existing': { title: 'القائم', field: 'componentsExisting' }
  }[type];

  const { data: transaction } = useQuery({
    queryKey: ['transaction', transactionId],
    queryFn: () => getTransactionById(transactionId),
    enabled: !!transactionId
  });

  useEffect(() => {
    if (transaction?.floors) {
       const savedData = transaction[config.field] || [];
       const merged = transaction.floors.map(f => {
         const found = savedData.find(c => c.floorId === f.id);
         return found || { id: f.id, floorId: f.id, floorName: f.nameBySystem, area: 0, units: 0 };
       });
       setComponents(merged);
    }
  }, [transaction, config.field]);

  const mutation = useMutation({
    mutationFn: (data) => updateTransactionGenericComponents(transactionId, type, data),
    onSuccess: () => { queryClient.invalidateQueries(['transaction', transactionId]); toast.success('تم الحفظ'); }
  });

  const update = (id, field, val) => {
    setComponents(prev => prev.map(c => c.id === id ? { ...c, [field]: val } : c));
  };

  return (
    <div className="h-full" dir="rtl">
      <div className="flex justify-between items-center mb-4">
         <h3 className="font-bold flex gap-2"><FileText className="text-blue-600"/> {config.title}</h3>
         <Button onClick={() => mutation.mutate(components)}><Save className="w-4 h-4 ml-2"/> حفظ</Button>
      </div>
      <ScrollArea className="h-[calc(100vh-200px)]">
         <Card>
            <Table>
               <TableHeader><TableRow><TableHead>الدور</TableHead><TableHead>المساحة (م²)</TableHead><TableHead>عدد الوحدات</TableHead></TableRow></TableHeader>
               <TableBody>
                  {components.map(c => (
                     <TableRow key={c.id}>
                        <TableCell className="font-medium">{c.floorName}</TableCell>
                        <TableCell><InputWithCopy type="number" value={c.area} onChange={e => update(c.id, 'area', parseFloat(e.target.value))} /></TableCell>
                        <TableCell><InputWithCopy type="number" value={c.units} onChange={e => update(c.id, 'units', parseInt(e.target.value))} /></TableCell>
                     </TableRow>
                  ))}
               </TableBody>
            </Table>
         </Card>
      </ScrollArea>
    </div>
  );
};
export default Tab_Components_Generic_Complete;