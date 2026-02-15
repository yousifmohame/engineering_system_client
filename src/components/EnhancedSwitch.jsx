import { Switch } from './ui/switch'; // تأكد أن لديك مكون Switch أو استخدم checkbox عادي

export const EnhancedSwitch = ({ id, checked, onCheckedChange, label, description }) => (
  <div className="flex items-center justify-between w-full">
    <div className="flex flex-col">
      <label htmlFor={id} className="text-sm font-medium">{label}</label>
      {description && <span className="text-xs text-gray-500">{description}</span>}
    </div>
    {/* إذا لم يكن لديك مكون Switch من shadcn، يمكنك استبداله بـ input type="checkbox" */}
    <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
  </div>
);