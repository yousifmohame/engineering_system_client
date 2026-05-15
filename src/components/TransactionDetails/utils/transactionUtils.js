export const safeNum = (val) => {
  const num = Number(val);
  return Number.isNaN(num) ? 0 : num;
};

export const safeText = (val) => {
  if (!val) return "—";

  if (typeof val === "object") {
    return val.ar || val.name || JSON.stringify(val);
  }

  return String(val);
};

export const parseNumber = (val) => {
  if (!val) return 0;

  const cleanedValue = String(val).replace(/,/g, "");
  const num = Number(cleanedValue);

  return Number.isNaN(num) ? 0 : num;
};

export const formatDateTime = (dateStr) => {
  if (!dateStr) return "—";

  const d = new Date(dateStr);

  if (Number.isNaN(d.getTime())) return "—";

  return `${d.toLocaleDateString("ar-SA")} - ${d.toLocaleTimeString("ar-SA", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
};

export const getDayNameAndDate = (dateStr) => {
  if (!dateStr) return "—";

  const d = new Date(dateStr);

  if (Number.isNaN(d.getTime())) return "—";

  const dayName = new Intl.DateTimeFormat("ar-SA", {
    weekday: "long",
  }).format(d);

  const dateFormatted = d.toLocaleDateString("en-GB");

  return `${dayName}، ${dateFormatted}`;
};

export const getCollectionStatus = (paid, total) => {
  const paidAmount = safeNum(paid);
  const totalAmount = safeNum(total);

  if (paidAmount >= totalAmount && totalAmount > 0) {
    return {
      label: "محصل بالكامل",
      color:
        "border border-emerald-200 bg-emerald-50 text-emerald-700 shadow-sm",
      dot: "bg-emerald-500",
    };
  }

  if (paidAmount > 0 && paidAmount < totalAmount) {
    return {
      label: "محصل جزئي",
      color:
        "border border-[#d8b46a]/45 bg-[#f8efe0] text-[#9a6b16] shadow-sm",
      dot: "bg-[#c5983c]",
    };
  }

  return {
    label: "غير محصل",
    color: "border border-rose-200 bg-rose-50 text-rose-700 shadow-sm",
    dot: "bg-rose-500",
  };
};