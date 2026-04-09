import { toast } from "sonner";

export const toEnglishNumbers = (str) => {
  if (str === null || str === undefined) return "";
  return String(str).replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d));
};

export const normalizeArabicText = (str) => {
  if (!str) return "";
  return toEnglishNumbers(str)
    .replace(/(^|\s)(حي|مخطط|رقم)(\s+|$)/g, "")
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ي/g, "ى")
    .replace(/[\s\-_]/g, "")
    .toLowerCase();
};

export const normalizePlan = (str) => {
  if (!str) return "";
  let cleaned = toEnglishNumbers(str).replace(/\s+/g, "").replace(/\\/g, "/");
  if (cleaned.includes("/")) {
    cleaned = cleaned.split("/").sort().join("/");
  }
  return cleaned.toLowerCase();
};

export const copyToClipboard = (text, setCopiedId = null, id = null) => {
  if (!text) return toast.error("الحقل فارغ لا يوجد شيء لنسخه!");
  navigator.clipboard.writeText(text).catch(() => {});
  toast.success("تم النسخ بنجاح! 📋");
  
  if (setCopiedId && id) {
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  }
};

export const formatDate = (dateString) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};