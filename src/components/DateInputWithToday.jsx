import React from 'react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Calendar } from 'lucide-react';

const DateInputWithToday = ({ id, label, value, onChange, ...props }) => {
  
  const setToday = () => {
    const today = new Date().toISOString().split('T')[0];
    // محاكاة حدث التغيير ليعمل مع react-hook-form أو state عادي
    const event = {
      target: {
        value: today,
        name: id
      }
    };
    if (onChange) onChange(event);
  };

  return (
    <div className="space-y-1">
      {label && <Label htmlFor={id} className="text-xs font-medium text-gray-700">{label}</Label>}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            type="date"
            id={id}
            value={value}
            onChange={onChange}
            className="w-full"
            {...props}
          />
        </div>
        <Button 
          type="button" 
          variant="outline" 
          size="icon" 
          onClick={setToday}
          title="تعيين تاريخ اليوم"
          className="h-10 w-10 shrink-0"
        >
          <Calendar className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default DateInputWithToday;