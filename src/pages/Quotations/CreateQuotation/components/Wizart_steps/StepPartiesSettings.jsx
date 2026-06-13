import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

export default function StepPartiesSettings({ props }) {
  const {
    clientType, // نوع العميل: فرد، ورثة، شركة، جهة حكومية...
    signatureMethod, setSignatureMethod,
    repName, setRepName,
    repIdNumber, setRepIdNumber,
    authDocType, setAuthDocType,
    authDocNumber, setAuthDocNumber,
    firstPartyEmployeeId, setFirstPartyEmployeeId,
    firstPartyRepCapacity, setFirstPartyRepCapacity,
    showFirstPartyEmpId, setShowFirstPartyEmpId,
    firstPartySignatureType, setFirstPartySignatureType,
    employeesData // قائمة الموظفين القادمة من الداتا بيز
  } = props;

  // خوارزمية تحديد خيارات التوقيع المتاحة للطرف الثاني بناءً على نوع العميل
  const getAvailableSignatureMethods = () => {
    if (clientType === "ورثة") {
      return [{ value: "AGENT", label: "وكيل شرعي (بموجب وكالة)" }];
    } else if (clientType === "شركة" || clientType === "حكومي" || clientType === "وقف") {
      return [{ value: "AUTHORIZED", label: "مفوض (بموجب تفويض/قرار)" }];
    } else {
      // فرد
      return [
        { value: "SELF", label: "المالك شخصياً (عن نفسه)" },
        { value: "AGENT", label: "وكيل شرعي (بموجب وكالة)" }
      ];
    }
  };

  return (
    <div className="space-y-8 p-4 bg-white rounded-xl border border-slate-200">
      
      {/* ----------------- الطرف الثاني (العميل) ----------------- */}
      <div className="space-y-4">
        <h3 className="text-lg font-black text-[#123f59] border-b pb-2">إعدادات الطرف الثاني (العميل)</h3>
        <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
          يتم فلترة الخيارات بناءً على تصنيف العميل الحالي: <span className="font-bold">({clientType})</span>
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>صفة الموقع عن الطرف الثاني</Label>
            <Select value={signatureMethod} onValueChange={setSignatureMethod} dir="rtl">
              <SelectTrigger>
                <SelectValue placeholder="اختر صفة الموقع" />
              </SelectTrigger>
              <SelectContent>
                {getAvailableSignatureMethods().map((method) => (
                  <SelectItem key={method.value} value={method.value}>{method.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {signatureMethod !== "SELF" && (
            <>
              <div className="space-y-2">
                <Label>اسم {signatureMethod === "AGENT" ? "الوكيل" : "المفوض"}</Label>
                <Input value={repName} onChange={(e) => setRepName(e.target.value)} placeholder="الاسم الرباعي" />
              </div>
              <div className="space-y-2">
                <Label>رقم الهوية</Label>
                <Input value={repIdNumber} onChange={(e) => setRepIdNumber(e.target.value)} placeholder="رقم الهوية الوطنية" />
              </div>
              <div className="space-y-2">
                <Label>نوع المستند</Label>
                <Input value={authDocType} onChange={(e) => setAuthDocType(e.target.value)} placeholder={signatureMethod === "AGENT" ? "رقم الوكالة الشرعية" : "رقم خطاب التفويض"} />
              </div>
              <div className="space-y-2">
                <Label>رقم المستند</Label>
                <Input value={authDocNumber} onChange={(e) => setAuthDocNumber(e.target.value)} placeholder="رقم المستند" />
              </div>
            </>
          )}
        </div>
      </div>

      {/* ----------------- الطرف الأول (المكتب) ----------------- */}
      <div className="space-y-4 pt-4">
        <h3 className="text-lg font-black text-[#123f59] border-b pb-2">إعدادات الطرف الأول (المكتب الهندسي)</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>اسم ممثل المكتب (الموظف)</Label>
            <Select value={firstPartyEmployeeId} onValueChange={setFirstPartyEmployeeId} dir="rtl">
              <SelectTrigger>
                <SelectValue placeholder="اختر الموظف" />
              </SelectTrigger>
              <SelectContent>
                {employeesData?.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.name} - {emp.employeeCode}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>صفة الممثل (المسمى المطبوع)</Label>
            <Input 
              value={firstPartyRepCapacity} 
              onChange={(e) => setFirstPartyRepCapacity(e.target.value)} 
              placeholder="مثال: مدير المشاريع، الممثل النظامي..." 
            />
          </div>

          <div className="space-y-2">
            <Label>نوع التوقيع</Label>
            <Select value={firstPartySignatureType} onValueChange={setFirstPartySignatureType} dir="rtl">
              <SelectTrigger>
                <SelectValue placeholder="اختر نوع التوقيع" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MANUAL">توقيع يدوي (ترك مساحة فارغة)</SelectItem>
                <SelectItem value="SYSTEM">توقيع إلكتروني (سحب توقيع الموظف المعتمد)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2 space-x-reverse mt-6">
            <Switch 
              id="show-emp-id" 
              checked={showFirstPartyEmpId} 
              onCheckedChange={setShowFirstPartyEmpId} 
            />
            <Label htmlFor="show-emp-id">إظهار الرقم الوظيفي في الاعتماد</Label>
          </div>
        </div>
      </div>

    </div>
  );
}