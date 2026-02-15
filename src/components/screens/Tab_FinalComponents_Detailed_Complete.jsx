import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Save, Plus, Trash2, Building2 } from 'lucide-react';
import { InputWithCopy, SelectWithCopy } from '../InputWithCopy';
import { getTransactionById, updateTransactionComponents } from '../../api/transactionApi';
import { toast } from 'sonner';
import { nanoid } from 'nanoid';

const Tab_FinalComponents_Detailed_Complete = ({ transactionId }) => {
  const queryClient = useQueryClient();
  const [components, setComponents] = useState([]);

  const { data: transaction } = useQuery({
    queryKey: ['transaction', transactionId],
    queryFn: () => getTransactionById(transactionId),
    enabled: !!transactionId
  });

  useEffect(() => {
    if (transaction?.floors) {
       const merged = transaction.floors.map(f => {
         const saved = transaction.components?.find(c => c.floorId === f.id);
         return saved || { id: f.id, floorId: f.id, floorName: f.nameBySystem, usages: [{ id: nanoid(), type: 'سكني', area: 0 }] };
       });
       setComponents(merged);
    }
  }, [transaction]);

  const saveMutation = useMutation({
    mutationFn: (data) => updateTransactionComponents(transactionId, data),
    onSuccess: () => { queryClient.invalidateQueries(['transaction', transactionId]); toast.success('تم الحفظ'); }
  });

  const addUsage = (compId) => {
    setComponents(prev => prev.map(c => c.id === compId ? { ...c, usages: [...c.usages, { id: nanoid(), type: 'سكني', area: 0 }] } : c));
  };

  const updateUsage = (compId, usageId, field, val) => {
    setComponents(prev => prev.map(c => c.id === compId ? { 
       ...c, usages: c.usages.map(u => u.id === usageId ? { ...u, [field]: val } : u) 
    } : c));
  };

  return (
    <div className="h-full" dir="rtl">
      <div className="flex justify-end mb-2"><Button onClick={() => saveMutation.mutate(components)}><Save className="w-4 h-4 ml-2"/> حفظ المكونات</Button></div>
      <ScrollArea className="h-[calc(100vh-220px)]">
         <div className="space-y-4 p-1">
            {components.map(c => (
               <Card key={c.id}>
                 <CardHeader className="py-2 bg-blue-50 flex flex-row justify-between items-center">
                    <CardTitle className="text-sm flex gap-2"><Building2 className="w-4 h-4"/> {c.floorName}</CardTitle>
                    <Button size="sm" variant="outline" onClick={() => addUsage(c.id)}><Plus className="w-3 h-3"/> استخدام</Button>
                 </CardHeader>
                 <CardContent className="p-0">
                    <Table>
                       <TableHeader><TableRow><TableHead>الاستخدام</TableHead><TableHead>المساحة</TableHead><TableHead></TableHead></TableRow></TableHeader>
                       <TableBody>
                          {c.usages.map(u => (
                             <TableRow key={u.id}>
                                <TableCell><SelectWithCopy value={u.type} onChange={v => updateUsage(c.id, u.id, 'type', v.target.value)} options={[{value:'سكني',label:'سكني'},{value:'تجاري',label:'تجاري'}]} /></TableCell>
                                <TableCell><InputWithCopy type="number" value={u.area} onChange={e => updateUsage(c.id, u.id, 'area', parseFloat(e.target.value))} /></TableCell>
                                <TableCell><Button size="icon" variant="ghost" className="text-red-500"><Trash2 className="w-4 h-4"/></Button></TableCell>
                             </TableRow>
                          ))}
                       </TableBody>
                    </Table>
                 </CardContent>
               </Card>
            ))}
         </div>
      </ScrollArea>
    </div>
  );
};
export default Tab_FinalComponents_Detailed_Complete;