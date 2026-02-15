import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Save, Navigation } from 'lucide-react';
import { InputWithCopy } from '../InputWithCopy';
import { getTransactionById, updateTransactionSetbacks } from '../../api/transactionApi';
import { toast } from 'sonner';

const Tab_Setbacks_AllFloors_Complete = ({ transactionId, readOnly }) => {
  const queryClient = useQueryClient();
  const [floorsSetbacks, setFloorsSetbacks] = useState([]);

  const { data: transaction } = useQuery({
    queryKey: ['transaction', transactionId],
    queryFn: () => getTransactionById(transactionId),
    enabled: !!transactionId && transactionId !== 'new',
  });

  useEffect(() => {
    if (transaction?.floors) {
      const merged = transaction.floors.map(f => {
        const saved = transaction.setbacks?.find(s => s.floorId === f.id);
        return saved || {
          floorId: f.id, floorName: f.nameBySystem,
          setbacks: ['north','south','east','west'].map(d => ({ direction: d, current: 0, proposed: 0, regulatory: 0 }))
        };
      });
      setFloorsSetbacks(merged);
    }
  }, [transaction]);

  const saveMutation = useMutation({
    mutationFn: (data) => updateTransactionSetbacks(transactionId, data),
    onSuccess: () => { queryClient.invalidateQueries(['transaction', transactionId]); toast.success('تم الحفظ'); }
  });

  const updateSetback = (floorId, dir, field, val) => {
    setFloorsSetbacks(prev => prev.map(f => f.floorId === floorId ? {
      ...f, setbacks: f.setbacks.map(s => s.direction === dir ? { ...s, [field]: parseFloat(val)||0 } : s)
    } : f));
  };

  return (
    <div className="h-full" dir="rtl">
      <div className="flex justify-end mb-2"><Button onClick={() => saveMutation.mutate(floorsSetbacks)}><Save className="w-4 h-4 ml-2"/> حفظ الارتدادات</Button></div>
      <ScrollArea className="h-[calc(100vh-220px)]">
        <div className="space-y-4 p-1">
          {floorsSetbacks.map(f => (
             <Card key={f.floorId}>
               <CardHeader className="py-2 bg-gray-50"><CardTitle className="text-sm flex gap-2"><Navigation className="w-4 h-4"/> {f.floorName}</CardTitle></CardHeader>
               <CardContent className="p-0">
                 <Table>
                   <TableHeader><TableRow><TableHead>الجهة</TableHead><TableHead>القائم</TableHead><TableHead>المقترح</TableHead><TableHead>النظامي</TableHead></TableRow></TableHeader>
                   <TableBody>
                     {f.setbacks.map(s => (
                       <TableRow key={s.direction}>
                         <TableCell className="font-bold">{s.direction}</TableCell>
                         <TableCell><InputWithCopy type="number" value={s.current} onChange={e => updateSetback(f.floorId, s.direction, 'current', e.target.value)} /></TableCell>
                         <TableCell><InputWithCopy type="number" value={s.proposed} onChange={e => updateSetback(f.floorId, s.direction, 'proposed', e.target.value)} /></TableCell>
                         <TableCell><InputWithCopy type="number" value={s.regulatory} onChange={e => updateSetback(f.floorId, s.direction, 'regulatory', e.target.value)} /></TableCell>
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
export default Tab_Setbacks_AllFloors_Complete;