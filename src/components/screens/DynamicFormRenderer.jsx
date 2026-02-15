import React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { InputWithCopy, TextAreaWithCopy } from '../InputWithCopy';

const DynamicFormRenderer = ({ purposeId, data, onChange, readOnly }) => {
  const queryClient = useQueryClient();
  
  // 1. جلب تعريف الحقول من الكاش (الذي جلبه المكون الأب)
  const purposes = queryClient.getQueryData(['requestPurposes', 'detailed']);
  const purpose = purposes?.find(p => p.id === purposeId);
  
  // 2. إذا لم تكن هناك حقول معرفة من الباك إند، نستخدم حقول افتراضية للعرض
  const fields = purpose?.fields && purpose.fields.length > 0 ? purpose.fields : [
    // حقول افتراضية في حالة عدم وجود تعريف
    { key: 'notes', label: 'ملاحظات إضافية', type: 'textarea' }
  ];

  if (!fields || fields.length === 0) {
    return <div className="text-gray-400 text-xs p-2">لا توجد حقول إضافية لهذا الغرض.</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {fields.map((field) => {
        const value = data[field.key] ?? '';

        // --- معالجة أنواع الحقول المختلفة ---
        
        // 1. Select
        if (field.type === 'select') {
          return (
            <div key={field.key} className="space-y-1">
              <Label className="text-xs text-gray-600">{field.label}</Label>
              <Select 
                value={value} 
                onValueChange={(val) => onChange(field.key, val)}
                disabled={readOnly}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="اختر..." />
                </SelectTrigger>
                <SelectContent>
                  {field.options?.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          );
        }

        // 2. Checkbox
        if (field.type === 'checkbox') {
          return (
            <div key={field.key} className="flex items-center gap-2 mt-6 border p-2 rounded bg-gray-50">
              <Checkbox 
                id={`${purposeId}-${field.key}`}
                checked={!!value}
                onCheckedChange={(checked) => onChange(field.key, checked)}
                disabled={readOnly}
              />
              <Label htmlFor={`${purposeId}-${field.key}`} className="text-sm cursor-pointer">
                {field.label}
              </Label>
            </div>
          );
        }

        // 3. Textarea
        if (field.type === 'textarea') {
          return (
            <div key={field.key} className="col-span-2">
              <TextAreaWithCopy
                label={field.label}
                value={value}
                onChange={(e) => onChange(field.key, e.target.value)}
                disabled={readOnly}
                rows={3}
              />
            </div>
          );
        }

        // 4. Number / Text (Default)
        return (
          <div key={field.key}>
            <InputWithCopy
              label={field.label}
              type={field.type === 'number' ? 'number' : 'text'}
              value={value}
              onChange={(e) => onChange(field.key, field.type === 'number' ? parseFloat(e.target.value) : e.target.value)}
              disabled={readOnly}
            />
          </div>
        );
      })}
    </div>
  );
};

export default DynamicFormRenderer;