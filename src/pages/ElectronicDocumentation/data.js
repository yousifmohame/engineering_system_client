export const mockInternalDocs = {
  contract: [
    { id: 'CT-492', name: 'عقد تصميم فيلا الملقا', partyB: 'أحمد محمد' },
    { id: 'CT-501', name: 'عقد إشراف برج الياسمين', partyB: 'شركة عقارات' }
  ],
  quote: [
    { id: 'QT-102', name: 'عرض سعر فيلا حطين', partyB: 'سارة خالد' },
    { id: 'QT-105', name: 'عرض سعر مجمع تجاري', partyB: 'مجموعة الفوزان' }
  ],
  invoice: [
    { id: 'INV-882', name: 'فاتورة دفعة أولى - تصميم', partyB: 'أحمد محمد' },
    { id: 'INV-901', name: 'فاتورة إشراف شهري', partyB: 'شركة عقارات' }
  ]
};

export const initialSealTemplates = [
  {
    id: 'default',
    name: 'الختم الرسمي العام',
    stampImage: 'https://picsum.photos/seed/stamp1/200/200',
    serialPrefix: 'SEC-',
    backgroundText: 'توثيق إلكتروني معتمد',
    backgroundColor: '#eff6ff', // blue-50
    backgroundOpacity: 0.6,
    serialPosition: 'inside',
    showTimestamp: true,
    securityHash: true,
    verificationCode: true,
    isDefault: true
  },
  {
    id: 'confidential',
    name: 'ختم الوثائق السرية',
    stampImage: 'https://picsum.photos/seed/stamp2/200/200',
    serialPrefix: 'CONF-',
    backgroundText: 'وثيقة سرية - يمنع التداول',
    backgroundColor: '#fef2f2', // red-50
    backgroundOpacity: 0.8,
    serialPosition: 'bottom',
    showTimestamp: true,
    securityHash: true,
    verificationCode: true,
    isDefault: false
  }
];

export const initialLinkageMappings = [
  {
    docTypeId: 'dt-1',
    docTypeName: 'محضر اجتماع',
    defaultSignatureType: 'secure_and_manual',
    defaultSealType: 'office_stamp',
    signerRoles: ['مهندس المشروع', 'العميل'],
    showDocumentationStatement: true,
    signaturePosition: 'bottom_right',
    sealPosition: 'bottom_left',
    statementTemplate: 'تم توثيق هذا المحضر إلكترونياً بموجب نظام Remix بتاريخ {{date}}'
  }
  // ... يمكنك إضافة الباقي هنا
];