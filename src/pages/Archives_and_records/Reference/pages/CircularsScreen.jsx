import React from 'react';
import { Megaphone } from 'lucide-react';
import ReferenceBaseScreen from '../ReferenceBaseScreen';

export default function CircularsScreen() {
  return (
    <ReferenceBaseScreen 
      fixedCategory="تعاميم" 
      pageTitle="التعاميم والتحديثات" 
      pageDescription="متابعة التعاميم الهندسية الصادرة حديثاً"
      themeColor="amber"
      HeaderIcon={Megaphone}
    />
  );
}