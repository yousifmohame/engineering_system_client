import React from 'react';
import { ClipboardList } from 'lucide-react';
import ReferenceBaseScreen from '../ReferenceBaseScreen';

export default function RequirementsScreen() {
  return (
    <ReferenceBaseScreen 
      fixedCategory="اشتراطات" 
      pageTitle="مركز الاشتراطات" 
      pageDescription="إدارة واستعراض جميع الاشتراطات الفنية والبلدية"
      themeColor="purple"
      HeaderIcon={ClipboardList}
    />
  );
}