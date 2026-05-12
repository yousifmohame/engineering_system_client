import React from 'react';
import { Book } from 'lucide-react';
import ReferenceBaseScreen from './ReferenceBaseScreen';

export default function GuidesScreen() {
  return (
    <ReferenceBaseScreen 
      fixedCategory="أدلة" 
      pageTitle="مركز الأدلة" 
      pageDescription="أدلة الكود السعودي وإصدارات الوزارة الرسمية"
      themeColor="blue"
      HeaderIcon={Book}
    />
  );
}