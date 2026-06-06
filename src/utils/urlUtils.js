export const getFullUrl = (url) => {
  if (!url) return null;
  
  // إذا كان الرابط يأتي كاملاً من الباك-إند (يبدأ بـ http)، نرجعه كما هو
  if (url.startsWith("http")) return url;
  
  let fixedUrl = url;
  if (url.startsWith("/uploads/")) {
    fixedUrl = `/api${url}`;
  }

  // 👈 تحديد الرابط الأساسي بناءً على بيئة التشغيل
  // إذا كنا في وضع التطوير (Local) نستخدم localhost، وإلا نستخدم الرابط الفعلي
  const baseUrl = import.meta.env.DEV 
    ? "http://localhost:5000" // ⚠️ قم بتغيير 5000 إلى البورت الذي يعمل عليه الباك-إند في جهازك
    : "https://details-worksystem1.com"; 

  return `${baseUrl}${fixedUrl}`;
};