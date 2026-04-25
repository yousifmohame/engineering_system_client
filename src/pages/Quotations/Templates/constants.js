export const DYNAMIC_VARIABLES = [
  { label: "اسم العميل", value: "{{clientName}}" },
  { label: "نوع الخدمة", value: "{{serviceType}}" },
  { label: "رقم القطعة", value: "{{plotNumber}}" },
  { label: "رقم المخطط", value: "{{planNumber}}" },
  { label: "الحي", value: "{{district}}" },
  { label: "المساحة", value: "{{area}}" },
  { label: "رقم الرخصة القديمة", value: "{{oldLicenseNo}}" },
];

export const DEFAULT_TEMPLATE = {
  title: "نموذج عرض سعر - جديد",
  type: "DETAILED",
  desc: "وصف النموذج هنا...",
  header: {
    showLogo: true,
    documentTitle: "عرض سعر خدمات هندسية",
    showDate: true,
  },
  intro: {
    addresseePrefix: "السادة / ",
    greeting: "السلام عليكم ورحمة الله وبركاته ،،،،",
    text: "إشارة إلى طلبكم بخصوص تقديم عرض سعر خدمات ({{serviceType}}) لقطعة الأرض رقم ({{plotNumber}}) ضمن المخطط التنظيمي رقم ({{planNumber}}) بحي {{district}} بمدينة الرياض بإجمالي مساحة ({{area}} م2)، وفقاً لرخصة البناء رقم ({{oldLicenseNo}})، فإنه يسرنا تقديم العرض لإنهاء الأعمال المطلوبة على أن يكون نطاق العمل كما يلي:",
  },
  table: {
    showUnit: true,
    showQuantity: true,
    showUnitPrice: true,
  },
  financials: {
    showSubtotal: true,
    vatPercentage: 15,
    showTotal: true,
  },
  terms: {
    title: "ملاحظات :",
    text: "1. عند اعتماد العرض المقدم يتم التعاقد مع مكتبنا مع دفع دفعة أولى 50% عند التعاقد ودفعة ثانية 30% عند اعتماد المخططات المعمارية ودفعة ثالثة 20% عند اعتماد الرخصة.\n2. يشترط التعاقد مع الاستشاري بعقد إشراف منفصل.\n3. يتحمل المالك جميع الرسوم الحكومية الخاصة بالطلب.",
  },
  signatures: {
    showClient: true,
    clientLabel: "توقيع العميل / الممثل",
    showOffice: true,
    officeLabel: "بلاك كيوب للاستشارات الهندسية",
  },
};