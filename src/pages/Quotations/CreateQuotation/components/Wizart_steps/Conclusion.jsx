import React from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

// نستقبل props الممررة من الـ Wizard
export default function Conclusion({ props }) {
  
  const handleChange = (e) => {
    // نستخدم دالة التحديث الممررة من الـ Wizard
    props.setConclusion(e.target.value);
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-card">
      <div className="space-y-2">
        <Label htmlFor="conclusion" className="text-lg font-semibold text-primary">
          خاتمة عرض السعر
        </Label>
        <p className="text-sm text-muted-foreground mb-4">
          أدخل النص الختامي لعرض السعر (مثل: عبارات شكر، طريقة التواصل، أو صلاحية العرض).
        </p>
        <Textarea
          id="conclusion"
          placeholder="مثال: نشكركم على ثقتكم بمكتبنا ونأمل أن ينال عرضنا رضاكم، وتفضلوا بقبول فائق الاحترام والتقدير..."
          rows={6}
          // نقرأ القيمة من props.conclusion
          value={props.conclusion || ''}
          onChange={handleChange}
          className="text-right"
          dir="rtl"
        />
      </div>
    </div>
  );
}