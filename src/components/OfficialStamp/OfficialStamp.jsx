import React from "react";
import { QrCode, ScanBarcode } from "lucide-react"; // استخدام أيقونات حقيقية بدلاً من المربعات الفارغة

export const OfficialStamp = ({
  companyNameEn = "DETAILS",
  subTitleEn = "CONSULTING ENGINEERS",
  companyNameAr = "شركة ديتيلز للاستشارات الهندسية",
  stampText = "وثيقة رقمية معتمدة وموثوقة",
  code = "DLS-2025-0001",
  date = new Date().toLocaleDateString('en-GB'), // إضافة تاريخ الاعتماد
  color = "#1f4b8f", // الأزرق الداكن الاحترافي
  width = "100%", // جعله متجاوباً ليأخذ مساحة الحاوية
  maxWidth = 360,
  rotation = -2 // ميلان طفيف جداً للختم المستطيل
}) => {
  return (
    <div
      className="flex-shrink-0 select-none pointer-events-none drop-shadow-sm mix-blend-multiply opacity-[0.95]"
      style={{
        width,
        maxWidth,
        transform: `rotate(${rotation}deg)`,
      }}
      dir="ltr" // إجبار الاتجاه من اليسار لليمين ليحافظ على شكل الشعار والـ QR
    >
      <div
        style={{
          border: `3.5px solid ${color}`,
          borderRadius: 12,
          padding: 6,
          fontFamily: "system-ui, sans-serif",
          color: color,
          backgroundColor: "rgba(255, 255, 255, 0.7)", // خلفية شفافة قليلاً
        }}
      >
        {/* إطار داخلي رفيع */}
        <div
          style={{
            border: `1.5px solid ${color}`,
            borderRadius: 6,
            padding: "12px 14px",
            position: "relative",
          }}
        >
          
          {/* ========================================== */}
          {/* الصف العلوي (الشعار والنصوص + الباركود) */}
          {/* ========================================== */}
          <div className="flex justify-between items-start gap-4">
            
            {/* الجزء الأيسر: اللوجو واسم الشركة */}
            <div className="flex items-center gap-3">
              {/* الشعار (محاكاة الشعار الهندسي) */}
              <div
                className="shrink-0 flex items-center justify-center relative"
                style={{
                  width: 44,
                  height: 44,
                  border: `2.5px solid ${color}`,
                  transform: "skewX(-12deg)",
                  background: `linear-gradient(135deg, transparent 40%, ${color}20 50%, transparent 60%)`
                }}
              >
                <div style={{ width: 20, height: 20, border: `2px solid ${color}`, transform: "rotate(45deg)" }}></div>
              </div>
              
              {/* نصوص الشركة */}
              <div className="flex flex-col justify-center">
                <div style={{ fontSize: 26, fontWeight: "900", letterSpacing: "2px", lineHeight: 1 }}>
                  {companyNameEn}
                </div>
                <div style={{ fontSize: 9.5, fontWeight: "800", letterSpacing: "1.5px", marginTop: 2, opacity: 0.8 }}>
                  {subTitleEn}
                </div>
                <div style={{ fontSize: 13, fontWeight: "900", marginTop: 4, fontFamily: "Arial, sans-serif" }} dir="rtl">
                  {companyNameAr}
                </div>
              </div>
            </div>

            {/* الجزء الأيمن: QR + Barcode */}
            <div className="flex flex-col items-end shrink-0 pl-2 border-l-2 border-dashed" style={{ borderColor: `${color}40` }}>
              
              <div className="flex gap-2 items-center mb-1.5">
                {/* معلومات الباركود */}
                <div className="text-right">
                  <div style={{ fontSize: 8, fontWeight: "bold", textTransform: "uppercase" }}>Verify Code</div>
                  <div style={{ fontSize: 11, fontWeight: "900", fontFamily: "monospace" }}>{code}</div>
                </div>
                {/* QR Code */}
                <QrCode size={42} strokeWidth={1.5} color={color} />
              </div>

              {/* Barcode بصري محاكي */}
              <div className="w-full flex justify-end">
                <ScanBarcode size={24} strokeWidth={1} color={color} className="opacity-80" />
              </div>
              
            </div>
          </div>

          {/* ========================================== */}
          {/* الخط الأوسط والنص السفلي */}
          {/* ========================================== */}
          <div className="flex items-center justify-center gap-3 mt-4 mb-1">
            <div style={{ flex: 1, height: "1.5px", background: color }} />
            <div style={{ fontSize: 11, fontWeight: "900", letterSpacing: "1px" }} dir="rtl">
              ◈ {stampText} ◈
            </div>
            <div style={{ flex: 1, height: "1.5px", background: color }} />
          </div>
          
          {/* التاريخ الرقمي */}
          <div className="absolute bottom-1.5 left-3" style={{ fontSize: 8, fontWeight: "bold", opacity: 0.7, fontFamily: "monospace" }}>
            DATE: {date}
          </div>

        </div>
      </div>
    </div>
  );
};