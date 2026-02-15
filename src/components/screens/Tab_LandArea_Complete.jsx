import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Save, MapPin } from 'lucide-react';
import { InputWithCopy, TextAreaWithCopy } from '../InputWithCopy';
import { getTransactionById, updateTransactionLandArea } from '../../api/transactionApi';
import { toast } from 'sonner';

const Tab_LandArea_Complete = ({ transactionId }) => {
  const queryClient = useQueryClient();
  const [data, setData] = useState({ deedArea: 0, naturalArea: 0, planArea: 0, notes: '' });

  const { data: transaction } = useQuery({
    queryKey: ['transaction', transactionId],
    queryFn: () => getTransactionById(transactionId),
    enabled: !!transactionId
  });

  useEffect(() => { if (transaction?.landArea) setData(transaction.landArea); }, [transaction]);

  const mutation = useMutation({
    mutationFn: (newData) => updateTransactionLandArea(transactionId, newData),
    onSuccess: () => { queryClient.invalidateQueries(['transaction', transactionId]); toast.success('تم الحفظ'); }
  });

  return (
    <Card className="h-full">
       <CardContent className="p-6 space-y-6" dir="rtl">
          <div className="flex justify-between items-center">
             <h2 className="text-xl font-bold flex gap-2"><MapPin className="text-green-600"/> بيانات مساحة الأرض</h2>
             <Button onClick={() => mutation.mutate(data)}><Save className="w-4 h-4 ml-2"/> حفظ</Button>
          </div>
          <div className="grid grid-cols-3 gap-6">
             <InputWithCopy label="المساحة حسب الصك (م²)" type="number" value={data.deedArea} onChange={e => setData({...data, deedArea: parseFloat(e.target.value)})} />
             <InputWithCopy label="المساحة حسب الطبيعة (م²)" type="number" value={data.naturalArea} onChange={e => setData({...data, naturalArea: parseFloat(e.target.value)})} />
             <InputWithCopy label="المساحة حسب المخطط (م²)" type="number" value={data.planArea} onChange={e => setData({...data, planArea: parseFloat(e.target.value)})} />
          </div>
          <TextAreaWithCopy label="ملاحظات الفروقات" value={data.notes} onChange={e => setData({...data, notes: e.target.value})} rows={4} />
       </CardContent>
    </Card>
  );
};
export default Tab_LandArea_Complete;