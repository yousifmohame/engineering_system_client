import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Save, Compass } from 'lucide-react';
import { InputWithCopy, TextAreaWithCopy } from '../InputWithCopy';
import { getTransactionById, updateTransactionBoundaries } from '../../api/transactionApi';
import { toast } from 'sonner';

const Tab_Boundaries_Neighbors_Complete = ({ transactionId }) => {
  const queryClient = useQueryClient();
  const [boundaries, setBoundaries] = useState([
     { direction: 'north', label: 'الشمال', name: '', length: 0 },
     { direction: 'south', label: 'الجنوب', name: '', length: 0 },
     { direction: 'east', label: 'الشرق', name: '', length: 0 },
     { direction: 'west', label: 'الغرب', name: '', length: 0 },
  ]);

  const { data: transaction } = useQuery({
    queryKey: ['transaction', transactionId],
    queryFn: () => getTransactionById(transactionId),
    enabled: !!transactionId
  });

  useEffect(() => {
    if (transaction?.boundaries?.length > 0) {
       const merged = boundaries.map(def => transaction.boundaries.find(b => b.direction === def.direction) || def);
       setBoundaries(merged);
    }
  }, [transaction]);

  const mutation = useMutation({
    mutationFn: (data) => updateTransactionBoundaries(transactionId, data),
    onSuccess: () => { queryClient.invalidateQueries(['transaction', transactionId]); toast.success('تم الحفظ'); }
  });

  const update = (dir, field, val) => {
    setBoundaries(prev => prev.map(b => b.direction === dir ? { ...b, [field]: val } : b));
  };

  return (
    <div className="h-full" dir="rtl">
      <div className="flex justify-end mb-4"><Button onClick={() => mutation.mutate(boundaries)}><Save className="w-4 h-4 ml-2"/> حفظ الحدود</Button></div>
      <ScrollArea className="h-[calc(100vh-200px)]">
         <div className="grid grid-cols-2 gap-4">
            {boundaries.map(b => (
               <Card key={b.direction} className="border-t-4 border-t-indigo-500">
                  <CardHeader className="py-2"><CardTitle className="text-sm flex gap-2"><Compass className="w-4 h-4"/> {b.label}</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                     <InputWithCopy label="وصف الحد" value={b.name} onChange={e => update(b.direction, 'name', e.target.value)} />
                     <InputWithCopy label="الطول (م)" type="number" value={b.length} onChange={e => update(b.direction, 'length', parseFloat(e.target.value))} />
                  </CardContent>
               </Card>
            ))}
         </div>
      </ScrollArea>
    </div>
  );
};
export default Tab_Boundaries_Neighbors_Complete;