import React from 'react';
import { useFieldArray } from 'react-hook-form';
import { Button } from '../../../../ui/button';
import { Input } from '../../../../ui/input';
import { Label } from '../../../../ui/label';
import { Trash2, Plus } from 'lucide-react';
import { Card, CardContent } from '../../../../ui/card';
import { Checkbox } from '../../../../ui/checkbox';

// 1. مكون المستندات
export const TransactionTypeDocuments = ({ control }) => {
  const { fields, append, remove } = useFieldArray({ control, name: "documents" });
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-bold">المستندات المطلوبة</h3>
        <Button type="button" size="sm" onClick={() => append({ value: "" })}><Plus className="w-4 h-4 ml-2"/> إضافة مستند</Button>
      </div>
      {fields.map((field, index) => (
        <div key={field.id} className="flex gap-2">
          <Input {...control.register(`documents.${index}.value`)} placeholder="اسم المستند" />
          <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}><Trash2 className="w-4 h-4"/></Button>
        </div>
      ))}
    </div>
  );
};

// 2. مكون المهام
export const TransactionTypeTasks = ({ control }) => {
  const { fields, append, remove } = useFieldArray({ control, name: "tasks" });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-bold">سير العمل والمهام</h3>
        <Button type="button" size="sm" onClick={() => append({ name: "", role: "", duration: 0 })}><Plus className="w-4 h-4 ml-2"/> إضافة مهمة</Button>
      </div>
      {fields.map((field, index) => (
        <Card key={field.id}><CardContent className="p-3 grid grid-cols-3 gap-2 items-end">
          <div><Label>المهمة</Label><Input {...control.register(`tasks.${index}.name`)} /></div>
          <div><Label>الدور</Label><Input {...control.register(`tasks.${index}.role`)} /></div>
          <div className="flex gap-2">
            <div className="flex-1"><Label>المدة</Label><Input type="number" {...control.register(`tasks.${index}.duration`)} /></div>
            <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}><Trash2 className="w-4 h-4"/></Button>
          </div>
        </CardContent></Card>
      ))}
    </div>
  );
};

// 3. مكون الرسوم
export const TransactionTypeFees = ({ control }) => {
  const { fields, append, remove } = useFieldArray({ control, name: "fees" });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-bold">الرسوم الحكومية والإدارية</h3>
        <Button type="button" size="sm" onClick={() => append({ name: "", amount: 0, authority: "", required: true })}><Plus className="w-4 h-4 ml-2"/> إضافة رسم</Button>
      </div>
      {fields.map((field, index) => (
        <Card key={field.id}><CardContent className="p-3 flex gap-2 items-end">
          <div className="flex-1"><Label>الاسم</Label><Input {...control.register(`fees.${index}.name`)} /></div>
          <div className="w-24"><Label>المبلغ</Label><Input type="number" {...control.register(`fees.${index}.amount`)} /></div>
          <div className="flex-1"><Label>الجهة</Label><Input {...control.register(`fees.${index}.authority`)} /></div>
          <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}><Trash2 className="w-4 h-4"/></Button>
        </CardContent></Card>
      ))}
    </div>
  );
};