import {
  BarChart3,
  PieChart,
  FileText,
  Home,
  Users,
  History,
  Route,
  FolderOpen,
  FileEdit,
  ClipboardList,
} from "lucide-react";

export const DETAIL_TABS = [
  { id: "overview", label: "نظرة عامة", icon: BarChart3 },
  { id: "stats", label: "الإحصائيات", icon: PieChart },
  { id: "transactions", label: "المعاملات", icon: FileText },
  { id: "properties", label: "الملكيات", icon: Home },
  { id: "clients", label: "العملاء", icon: Users },
  { id: "audit", label: "السجل والتدقيق", icon: History },
  { id: "streets", label: "الشوارع", icon: Route },
  { id: "media", label: "ملفات ووسائط", icon: FolderOpen },
  { id: "notes", label: "نبذة وملاحظات", icon: FileEdit },
  { id: "regulations", label: "الاشتراطات", icon: ClipboardList },
];
