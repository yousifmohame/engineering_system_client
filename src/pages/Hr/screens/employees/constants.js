export const DEPARTMENTS = [
  "الإدارة العليا",
  "الشؤون الهندسية والتصميم",
  "الإشراف والمواقع",
  "المبيعات والتسويق",
  "المالية والمحاسبة",
  "الموارد البشرية",
  "تقنية المعلومات",
  "خدمة العملاء",
];

export const POSITIONS = [
  "مدير عام",
  "مدير مشروع",
  "مهندس معماري",
  "مهندس مدني / إنشائي",
  "مهندس كهرباء",
  "مهندس ميكانيكا",
  "رسام هندسي (أوتوكاد)",
  "مساح",
  "محاسب",
  "أخصائي موارد بشرية",
  "موظف استقبال",
  "مدخل بيانات",
];

// توليد الأرقام الوظيفية من 1001 إلى 1100
export const EMPLOYEE_CODES = Array.from({ length: 100 }, (_, i) =>
  (1001 + i).toString()
);

export const initialEmpData = {
  employeeCode: "",
  name: "",
  email: "",
  password: "",
  nationalId: "",
  phone: "",
  position: "",
  qiwaPosition: "",
  department: "",
  hireDate: new Date().toISOString().split("T")[0],
  type: "full-time",
  roleIds: [],
  status: "active",
};