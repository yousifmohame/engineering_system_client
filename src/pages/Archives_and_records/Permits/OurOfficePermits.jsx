import React from 'react';
// تأكد من وضع المسار الصحيح لمكون السجل الرئيسي الذي عدلناه مسبقاً
import BuildingPermitsRegistry from './BuildingPermitsRegistry'; 

export default function OurOfficePermits() {
  // 💡 ضع هنا اسم مكتبكم بالضبط كما يتم تسجيله في النظام
  const OUR_OFFICE_NAME = "مكتب ديتيلز"; 

  return (
    <div className="h-full w-full">
      {/* نقوم باستدعاء السجل المركزي ونمرر له خاصية fixedOffice 
        ليقوم تلقائياً بفلترة الجدول وتثبيت الاسم في الإضافات
      */}
      <BuildingPermitsRegistry fixedOffice={OUR_OFFICE_NAME} />
    </div>
  );
}