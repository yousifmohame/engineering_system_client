import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

export default function StepPartiesSettings({ props }) {
  const {
    clientType,
    signatureMethod,
    setSignatureMethod,
    repName,
    setRepName,
    repIdNumber,
    setRepIdNumber,
    authDocType,
    setAuthDocType,
    authDocNumber,
    setAuthDocNumber,

    // 🚀 الخصائص الجديدة الخاصة بالتواريخ ونوع الانتفاع (يجب إضافتها في المكون الأب)
    authDocIssueDate,
    setAuthDocIssueDate,
    showAuthDocIssueDate,
    setShowAuthDocIssueDate,
    authDocExpiryDate,
    setAuthDocExpiryDate,
    showAuthDocExpiryDate,
    setShowAuthDocExpiryDate,
    customUsufructType,
    setCustomUsufructType,

    firstPartyEmployeeId,
    setFirstPartyEmployeeId,
    firstPartyRepCapacity,
    setFirstPartyRepCapacity,
    showFirstPartyEmpId,
    setShowFirstPartyEmpId,
    firstPartySignatureType,
    setFirstPartySignatureType,
    employeesData,
  } = props;

  // 1️⃣ قائمة صفة الموقع
  const SIGNATURE_METHODS = [
    { value: "SELF", label: "عن نفسه" },
    { value: "AGENT", label: "وكيل" },
    { value: "AUTHORIZED", label: "مفوض" },
    { value: "BENEFICIARY", label: "مستفيد" },
  ];

  // 2️⃣ قائمة أنواع المستندات
  const DOC_TYPES = [
    { value: "وكالة", label: "وكالة" },
    { value: "تفويض", label: "تفويض" },
    { value: "مستند انتفاع", label: "مستند انتفاع" },
  ];

  return (
    <div className="space-y-8 p-4 bg-white rounded-xl border border-slate-200">
      {/* ----------------- الطرف الثاني (العميل) ----------------- */}
      <div className="space-y-4">
        <h3 className="text-lg font-black text-[#123f59] border-b pb-2">
          إعدادات الطرف الثاني (العميل)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* صفة الموقع */}
          <div className="space-y-2 md:col-span-2">
            <Label className="font-bold text-slate-700">
              صفة الموقع عن الطرف الثاني
            </Label>
            <Select
              value={signatureMethod}
              onValueChange={setSignatureMethod}
              dir="rtl"
            >
              <SelectTrigger className="bg-slate-50">
                <SelectValue placeholder="اختر صفة الموقع" />
              </SelectTrigger>
              <SelectContent>
                {SIGNATURE_METHODS.map((method) => (
                  <SelectItem key={method.value} value={method.value}>
                    {method.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {signatureMethod !== "SELF" && (
            <>
              {/* بيانات الممثل */}
              <div className="space-y-2">
                <Label className="font-bold text-slate-700">
                  اسم الممثل (الوكيل / المفوض / المستفيد)
                </Label>
                <Input
                  value={repName}
                  onChange={(e) => setRepName(e.target.value)}
                  placeholder="الاسم الرباعي"
                />
              </div>

              <div className="space-y-2">
                <Label className="font-bold text-slate-700">رقم الهوية</Label>
                <Input
                  value={repIdNumber}
                  onChange={(e) => setRepIdNumber(e.target.value)}
                  placeholder="رقم الهوية الوطنية"
                />
              </div>

              {/* نوع المستند */}
              <div className="space-y-2">
                <Label className="font-bold text-slate-700">نوع المستند</Label>
                <Select
                  value={authDocType}
                  onValueChange={setAuthDocType}
                  dir="rtl"
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر نوع المستند" />
                  </SelectTrigger>
                  <SelectContent>
                    {DOC_TYPES.map((doc) => (
                      <SelectItem key={doc.value} value={doc.value}>
                        {doc.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* حقل حر لنوع مستند الانتفاع */}
              {authDocType === "مستند انتفاع" && (
                <div className="space-y-2">
                  <Label className="font-bold text-slate-700">
                    نوع مستند الانتفاع
                  </Label>
                  <Input
                    value={customUsufructType}
                    onChange={(e) => setCustomUsufructType(e.target.value)}
                    placeholder="مثال: عقد إيجار، صك ولاية، صك حصر ورثة..."
                  />
                </div>
              )}

              {/* رقم المستند وتواريخه في قسم مجمع */}
              <div className="md:col-span-2 p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-4">
                <div className="space-y-2">
                  <Label className="font-bold text-slate-700">
                    رقم المستند
                  </Label>
                  <Input
                    value={authDocNumber}
                    onChange={(e) => setAuthDocNumber(e.target.value)}
                    placeholder="أدخل رقم المستند المعتمد"
                    className="bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {/* تاريخ الإصدار */}
                  <div className="space-y-3 p-3 bg-white border border-slate-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor="show-issue-date"
                        className="font-bold cursor-pointer text-slate-600"
                      >
                        طباعة تاريخ الإصدار بالملف
                      </Label>
                      <Switch
                        id="show-issue-date"
                        checked={showAuthDocIssueDate}
                        onCheckedChange={setShowAuthDocIssueDate}
                      />
                    </div>
                    {/* 🚀 الحقل أصبح ظاهراً دائماً */}
                    <Input
                      type="date"
                      value={authDocIssueDate}
                      onChange={(e) => setAuthDocIssueDate(e.target.value)}
                      className="font-mono text-left bg-slate-50"
                      dir="ltr"
                    />
                  </div>

                  {/* تاريخ الانتهاء */}
                  <div className="space-y-3 p-3 bg-white border border-slate-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor="show-expiry-date"
                        className="font-bold cursor-pointer text-slate-600"
                      >
                        طباعة تاريخ الانتهاء بالملف
                      </Label>
                      <Switch
                        id="show-expiry-date"
                        checked={showAuthDocExpiryDate}
                        onCheckedChange={setShowAuthDocExpiryDate}
                      />
                    </div>
                    {/* 🚀 الحقل أصبح ظاهراً دائماً */}
                    <Input
                      type="date"
                      value={authDocExpiryDate}
                      onChange={(e) => setAuthDocExpiryDate(e.target.value)}
                      className="font-mono text-left bg-slate-50"
                      dir="ltr"
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ----------------- الطرف الأول (المكتب) ----------------- */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <h3 className="text-lg font-black text-[#123f59] border-b pb-2">
          إعدادات الطرف الأول (المكتب الهندسي)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="font-bold text-slate-700">
              اسم ممثل المكتب (الموظف)
            </Label>
            <Select
              value={firstPartyEmployeeId}
              onValueChange={setFirstPartyEmployeeId}
              dir="rtl"
            >
              <SelectTrigger className="bg-slate-50">
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
            <Label className="font-bold text-slate-700">
              صفة الممثل (المسمى المطبوع)
            </Label>
            <Input
              value={firstPartyRepCapacity}
              onChange={(e) => setFirstPartyRepCapacity(e.target.value)}
              placeholder="مثال: مدير المشاريع، الممثل النظامي..."
              className="bg-slate-50"
            />
          </div>

          <div className="space-y-2">
            <Label className="font-bold text-slate-700">نوع التوقيع</Label>
            <Select
              value={firstPartySignatureType}
              onValueChange={setFirstPartySignatureType}
              dir="rtl"
            >
              <SelectTrigger className="bg-slate-50">
                <SelectValue placeholder="اختر نوع التوقيع" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MANUAL">
                  توقيع يدوي (ترك مساحة فارغة)
                </SelectItem>
                <SelectItem value="SYSTEM">
                  توقيع إلكتروني (سحب توقيع الموظف المعتمد)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2 space-x-reverse md:mt-8 p-2 bg-slate-50 rounded-lg border border-slate-100 h-fit">
            <Switch
              id="show-emp-id"
              checked={showFirstPartyEmpId}
              onCheckedChange={setShowFirstPartyEmpId}
            />
            <Label
              htmlFor="show-emp-id"
              className="font-bold cursor-pointer text-slate-700"
            >
              إظهار الرقم الوظيفي في الاعتماد
            </Label>
          </div>
        </div>
      </div>
    </div>
  );
}
