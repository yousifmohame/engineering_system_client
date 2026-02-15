import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Target, Clock, DollarSign, CheckCircle, AlertCircle, Eye, Search, Loader2 } from 'lucide-react';
import { InputWithCopy, SelectWithCopy } from '../InputWithCopy';
import { Skeleton } from '../ui/skeleton';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getFullTransactionTypes, updateTransaction, getTransactionById } from '../../api/transactionApi';

const Tab_286_02_TransactionDetails_Complete = ({ transactionId, onTypeSelected }) => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTypeId, setSelectedTypeId] = useState(null);

  if (transactionId === 'new') return <div className="text-center p-10">يجب حفظ المعاملة أولاً</div>;

  const { data: types, isLoading } = useQuery({ queryKey: ['fullTransactionTypes'], queryFn: getFullTransactionTypes });
  const { data: tx } = useQuery({ queryKey: ['transaction', transactionId], queryFn: () => getTransactionById(transactionId) });

  useEffect(() => { if (tx?.transactionTypeId) setSelectedTypeId(tx.transactionTypeId); }, [tx]);

  const mutation = useMutation({
    mutationFn: (type) => updateTransaction(transactionId, { transactionTypeId: type.id }),
    onSuccess: (data, type) => {
      queryClient.invalidateQueries({ queryKey: ['transaction', transactionId] });
      onTypeSelected(type);
    }
  });

  const filteredTypes = useMemo(() => types?.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase())) || [], [types, searchTerm]);

  if (isLoading) return <Skeleton className="h-64 w-full" />;

  return (
    <div className="space-y-4" dir="rtl">
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-3">
             <div className="flex items-center gap-2"><Target className="text-blue-600"/> <h2 className="font-bold text-blue-900">اختيار نوع المعاملة</h2></div>
             <InputWithCopy placeholder="بحث..." value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} className="w-64 bg-white"/>
          </div>
        </CardContent>
      </Card>
      <ScrollArea className="h-[calc(100vh-280px)]">
        <div className="grid grid-cols-2 gap-4 p-1">
          {filteredTypes.map(type => {
            const isSelected = selectedTypeId === type.id;
            return (
              <Card key={type.id} 
                className={`cursor-pointer transition-all ${isSelected ? 'border-2 border-blue-600 bg-blue-50' : 'hover:border-blue-300'}`}
                onClick={() => { setSelectedTypeId(type.id); mutation.mutate(type); }}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between">
                    <CardTitle className="text-base">{type.name}</CardTitle>
                    {isSelected && <Badge className="bg-blue-600">تم الاختيار</Badge>}
                  </div>
                  <p className="text-xs text-gray-500">{type.description}</p>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                   <div className="flex justify-between bg-white p-2 rounded border">
                      <span className="flex items-center gap-1 text-gray-600"><Clock className="w-3 h-3"/> المدة: {type.duration} يوم</span>
                      <span className="flex items-center gap-1 text-gray-600"><DollarSign className="w-3 h-3"/> {type.estimatedCost} ر.س</span>
                   </div>
                   <Button size="sm" className="w-full mt-2" variant={isSelected ? "default" : "outline"}>
                     {mutation.isPending && isSelected ? <Loader2 className="animate-spin"/> : <CheckCircle className="w-4 h-4 ml-2"/>}
                     {isSelected ? 'تم الاختيار' : 'اختيار هذا النوع'}
                   </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};
export default Tab_286_02_TransactionDetails_Complete;