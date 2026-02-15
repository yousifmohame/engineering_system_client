import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Save } from 'lucide-react';
import { EnhancedSwitch } from '../EnhancedSwitch';
import { getRequestPurposes } from '../../api/settingsApi';
import DynamicFormRenderer from './DynamicFormRenderer'; // تأكد من وجود هذا الملف

const Tab_RequestPurpose_Detailed_Complete = ({ transactionId, onSave, readOnly }) => {
  const [activeToggles, setActiveToggles] = useState({});
  const [dataStore, setDataStore] = useState({});

  const { data: definedPurposes } = useQuery({
    queryKey: ['requestPurposes', 'detailed'],
    queryFn: () => getRequestPurposes('detailed'),
  });

  useEffect(() => {
    const saved = localStorage.getItem(`detailed_${transactionId}`);
    if (saved) {
       const parsed = JSON.parse(saved);
       setActiveToggles(parsed.activeToggles || {});
       setDataStore(parsed.dataStore || {});
    }
  }, [transactionId]);

  const handleSave = () => {
    localStorage.setItem(`detailed_${transactionId}`, JSON.stringify({ activeToggles, dataStore }));
    if(onSave) onSave(dataStore);
  };

  return (
    <div className="h-full" dir="rtl">
      <div className="flex justify-end mb-2"><Button onClick={handleSave} size="sm"><Save className="w-4 h-4 ml-2"/> حفظ التفاصيل</Button></div>
      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="space-y-4 p-1">
          {definedPurposes?.map(p => (
            <Card key={p.id}>
              <CardHeader className="py-3 bg-gray-50 flex flex-row items-center justify-between">
                 <CardTitle className="text-sm">{p.name}</CardTitle>
                 <EnhancedSwitch checked={activeToggles[p.id]} onCheckedChange={v => setActiveToggles({...activeToggles, [p.id]: v})} disabled={readOnly} />
              </CardHeader>
              {activeToggles[p.id] && (
                <CardContent className="p-4">
                  <DynamicFormRenderer 
                     purposeId={p.id} 
                     data={dataStore[p.id] || {}} 
                     onChange={(k, v) => setDataStore(prev => ({...prev, [p.id]: {...prev[p.id], [k]: v}}))}
                  />
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
export default Tab_RequestPurpose_Detailed_Complete;