// src/pages/Hr/screens/JobOffers/CreateJobOffer/constants.js
import { User, DollarSign, FileText, Paperclip } from "lucide-react";

export const A4_WIDTH_PX = 794;
export const A4_HEIGHT_PX = 1123;

export const STEPS = [
  { id: 0, label: "بيانات المرشح", icon: User },
  { id: 1, label: "التفاصيل المالية", icon: DollarSign },
  { id: 2, label: "صياغة العرض", icon: FileText },
  { id: 3, label: "الغلاف والمرفقات", icon: Paperclip },
];

export const selectedStyle = {
  accent: "#123f59",
  gold: "#c5983c",
  paper: "#ffffff",
};