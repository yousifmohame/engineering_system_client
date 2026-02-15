import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { CheckSquare, Square, Save, Loader2 } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { getTransactionById, updateTransaction } from '../../api/transactionApi';
import { getRequestPurposes } from '../../api/settingsApi';

const Tab_RequestPurpose_Brief_Complete = ({ transactionId = 'NEW', onSave, readOnly }) => {
  const queryClient = useQueryClient();
  const [purposes, setPurposes] = useState([]);

  const { data: transaction } = useQuery({
    queryKey: ['transaction', transactionId],
    queryFn: () => getTransactionById(transactionId),
    enabled: transactionId !== 'NEW',
  });

  const { data: globalPurposes } = useQuery({
    queryKey: ['requestPurposes', 'brief'],
    queryFn: () => getRequestPurposes('brief'),
  });

  useEffect(() => {
    if (globalPurposes) {
      const savedPurposes = transaction?.requestPurposes || [];
      const merged = globalPurposes.map(p => ({
        ...p,
        isSelected: savedPurposes.some(s => s.id === p.id && s.isSelected)
      }));
      setPurposes(merged);
    }
  }, [transaction, globalPurposes]);

  const mutation = useMutation({
    mutationFn: (data) => updateTransaction(transactionId, { requestPurposes: data }),
    onSuccess: () => queryClient.invalidateQueries(['transaction', transactionId])
  });

  const toggle = (id) => {
    if (readOnly) return;
    setPurposes(prev => prev.map(p => p.id === id ? { ...p, isSelected: !p.isSelected } : p));
  };

  return (
    <div className="h-full" dir="rtl">
      <div className="flex justify-end mb-2">
         {!readOnly && <Button onClick={() => mutation.mutate(purposes)} disabled={mutation.isPending}><Save className="w-4 h-4 ml-2"/> حفظ الاختيارات</Button>}
      </div>
      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="grid grid-cols-2 gap-3 p-1">
          {purposes.map(p => (
            <Card key={p.id} onClick={() => toggle(p.id)} className={`cursor-pointer border-2 ${p.isSelected ? 'border-blue-500 bg-blue-50' : 'border-transparent'}`}>
              <CardContent className="p-4 flex items-start justify-between">
                <div>
                   <h4 className="font-bold">{p.name}</h4>
                   <p className="text-xs text-gray-500">{p.description}</p>
                </div>
                {p.isSelected ? <CheckSquare className="text-blue-600"/> : <Square className="text-gray-300"/>}
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
export default Tab_RequestPurpose_Brief_Complete;