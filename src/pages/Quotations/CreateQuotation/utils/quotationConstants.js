import {
  Building,
  FileText,
  Eye,
  Receipt,
  CreditCard,
  Paperclip,
  ScrollText,
  QrCode,
} from "lucide-react";

export const STEPS = [
  { id: 0, label: "الملكية والعميل", icon: Building },
  { id: 1, label: "البيانات", icon: FileText },
  { id: 2, label: "النموذج", icon: Eye },
  { id: 3, label: "البنود", icon: Receipt },
  { id: 4, label: "الضريبة", icon: CreditCard },
  { id: 5, label: "الدفعات", icon: CreditCard },
  { id: 6, label: "المرفقات", icon: Paperclip },
  { id: 7, label: "الشروط", icon: ScrollText },
  { id: 8, label: "المعاينة", icon: QrCode },
];

export const PRESET_TERMS = [
  { id: "manual", label: "يدوي", type: "custom" },
  { id: "short_gen", label: "شروط مختصرة — عامة", type: "short" },
  { id: "det_gen", label: "شروط تفصيلية — عامة (شاملة)", type: "detailed" },
  { id: "short_real", label: "شروط مختصرة — عقارية (أفراد)", type: "short" },
  { id: "det_real", label: "شروط تفصيلية — عقارية (أفراد)", type: "detailed" },
  { id: "short_eng", label: "شروط مختصرة — هندسية (شركات)", type: "short" },
  { id: "det_eng", label: "شروط تفصيلية — هندسية (شركات)", type: "detailed" },
  { id: "det_gov", label: "شروط تفصيلية — جهات حكومية", type: "detailed" },
];

export const CLIENT_TITLES = [
  "المواطن", "المواطنة", "السادة / شركة", "السادة / كيان", 
  "السادة / وقف", "صاحب السمو الأمير", "صاحبة السمو الأميرة", 
  "صاحب السمو الملكي الأمير", "صاحبة السمو الملكي الأميرة", "لقب مخصص"
];

export const HANDLING_METHODS = ["المالك مباشرة", "عن طريق مفوض", "عن طريق وكيل"];

export const getClientName = (client) => {
  if (!client || !client.name) return "عميل غير محدد";
  if (typeof client.name === "object") return client.name.ar || client.name.en || "عميل غير محدد";
  return client.fullNameRaw || client.name;
};

export const mapTitleToEnum = (arTitle) => {
  const map = {
    "المواطن": "MR", "المواطنة": "MRS", "السادة / شركة": "SIR_COMPANY",
    "السادة / كيان": "SIR_ENTITY", "السادة / وقف": "SIR_WAQF",
    "صاحب السمو الأمير": "PRINCE", "صاحبة السمو الأميرة": "PRINCESS",
    "صاحب السمو الملكي الأمير": "ROYAL_PRINCE", "صاحبة السمو الملكي الأميرة": "ROYAL_PRINCESS",
    "لقب مخصص": "CUSTOM",
  };
  return map[arTitle] || "MR";
};

export const mapHandlingToEnum = (arMethod) => {
  const map = {
    "المالك مباشرة": "DIRECT", "عن طريق مفوض": "AUTHORIZED", "عن طريق وكيل": "AGENT",
  };
  return map[arMethod] || "DIRECT";
};

export const getCurrentHijriYear = () => {
  const currentYear = new Date().getFullYear();
  return Math.floor((currentYear - 622) * (33 / 32));
};

export const generateHijriYears = (startYear, endYear) => {
  const years = [];
  for (let hYear = endYear; hYear >= startYear; hYear--) {
    const gYearStart = Math.floor(hYear - hYear / 33 + 622);
    years.push({
      value: hYear.toString(),
      label: `${hYear} هـ (${gYearStart} - ${gYearStart + 1} م)`,
    });
  }
  return years;
};