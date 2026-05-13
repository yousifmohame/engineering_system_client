import React from 'react';
import { ShieldAlert } from 'lucide-react';
import ReferenceBaseScreen from '../ReferenceBaseScreen';

export default function ExceptionsScreen() {
  return (
    <ReferenceBaseScreen 
      fixedCategory="حالات خاصة واستثناءات" 
      pageTitle="الاستثناءات والحالات الخاصة" 
      pageDescription="أرشفة القرارات الاستثنائية والحالات المرجعية الخاصة"
      themeColor="emerald"
      HeaderIcon={ShieldAlert}
    />
  );
}