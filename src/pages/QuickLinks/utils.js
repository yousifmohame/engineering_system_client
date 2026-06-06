export const getRemainingTime = (dateString) => {
  if (!dateString) return null;

  const target = new Date(dateString);
  const now = new Date();
  const diff = target - now;

  if (diff <= 0) {
    return {
      text: "منتهي الصلاحية",
      color: "bg-rose-50 text-rose-700 border-rose-200",
    };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  return {
    text: `متبقي ${days} يوم`,
    color:
      days < 3
        ? "bg-amber-50 text-amber-700 border-amber-200"
        : "bg-emerald-50 text-emerald-700 border-emerald-200",
  };
};

export const getDaysSince = (dateString) => {
  if (!dateString) return "";

  const diff = new Date() - new Date(dateString);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return "اليوم";
  if (days === 1) return "أمس";

  return `منذ ${days} يوم`;
};

export const getImportanceBadge = (imp) => {
  if (imp === "عالي الأهمية") {
    return "bg-rose-50 text-rose-700 border-rose-200";
  }
  if (imp === "متوسط") {
    return "bg-amber-50 text-amber-700 border-amber-200";
  }
  return "bg-cyan-50 text-cyan-700 border-cyan-200";
};