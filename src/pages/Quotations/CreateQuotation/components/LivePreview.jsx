import React, { useState, useRef } from "react";
import { 
  Eye, 
  Printer, 
  Edit3, 
  Check, 
  ZoomIn,
  ZoomOut,
  Landmark,
  Wallet,
  Banknote,
  ShieldCheck
} from "lucide-react";
import { useReactToPrint } from "react-to-print";

export const LivePreview = ({ data }) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [zoomScale, setZoomScale] = useState(0.7);
  const componentRef = useRef(null);

  // ==========================================
  // فك كافة البيانات القادمة من المكون الأب
  // ==========================================
  const {
    templateType,
    issueDate,
    validityDays,
    clientTitle,
    clientNameForPreview,
    clientCodeForPreview,
    showClientCode,
    showPropertyCode,
    propertyCodeForPreview,
    transactionType, 
    licenseNumber, 
    licenseYear, 
    serviceNumber, 
    serviceYear, 
    termsText, 
    items = [], 
    subtotal, 
    taxRate, 
    taxAmount, 
    grandTotal, 
    officeTaxBearing, 
    paymentsList = [], 
    acceptedMethods = [], 
    showMissingDocs, 
    missingDocs, 
    stampType = "NONE",
  } = data;

  // صياغة نص المقدمة الافتراضي
  const generateIntroText = () => {
    let intro = `إشارة إلى طلبكم بخصوص تقديم عرض سعر خدمات (${transactionType || "الخدمات الهندسية والاستشارية"})`;
    if (showPropertyCode && propertyCodeForPreview) {
      intro += ` لقطعة الأرض التابعة للملف رقم (${propertyCodeForPreview})`;
    } else {
      intro += ` الخاصة بعقاركم`;
    }
    if (licenseNumber) {
      intro += `، وفقاً لرخصة البناء رقم (${licenseNumber})${licenseYear ? ` لسنة (${licenseYear} هـ)` : ""}`;
    }
    if (serviceNumber) {
      intro += ` وموجب الطلب رقم (${serviceNumber})${serviceYear ? ` لسنة (${serviceYear} هـ)` : ""}`;
    }
    intro += `، فإنه يسرنا تقديم العرض المالي والفني لإنهاء الأعمال المطلوبة على أن يكون نطاق العمل كما يلي:`;
    return intro;
  };

  const introText = generateIntroText();

  // توليد الرقم المرجعي ونص الصلاحية للفوتر
  const refNumber = `QT-${Date.now().toString().slice(-5)}`;
  const validityText = validityDays === "unlimited" || validityDays === "custom" 
    ? "غير محدد" 
    : `(${validityDays}) يوماً`;

  // دوال الطباعة والتكبير
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Quotation_${clientNameForPreview || 'Document'}`,
  });

  const handleZoomIn = () => setZoomScale((prev) => Math.min(prev + 0.1, 1.5));
  const handleZoomOut = () => setZoomScale((prev) => Math.max(prev - 0.1, 0.4));

  // ترجمة طرق الدفع
  const getMethodLabel = (methodId) => {
    const methods = { bank: "تحويل بنكي", cash: "نقدي بالمقر", sadad: "سداد" };
    return methods[methodId] || methodId;
  };
  const getMethodIcon = (methodId) => {
    if(methodId === 'bank') return <Landmark className="w-3 h-3 text-blue-800" />;
    if(methodId === 'cash') return <Banknote className="w-3 h-3 text-emerald-700" />;
    if(methodId === 'sadad') return <Wallet className="w-3 h-3 text-orange-600" />;
    return null;
  };

  return (
    <div className="hidden lg:flex w-[50%] border-r border-slate-300 bg-slate-200/80 flex-col h-full relative">
      
      {/* ========================================== */}
      {/* شريط الأدوات الثابت (Toolbar) */}
      {/* ========================================== */}
      <div className="shrink-0 z-50 w-full flex justify-between items-center bg-white/90 backdrop-blur-sm px-6 py-4 shadow-sm border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-lg text-white">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-tighter">معاينة الطباعة (A4)</h3>
            <p className="text-[10px] text-slate-500 font-bold">{templateType === "SUMMARY" ? "مختصر" : "تفصيلي"}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* أزرار التكبير والتصغير */}
          <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200 mr-2">
            <button onClick={handleZoomOut} className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-white rounded-lg transition-all">
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-[10px] font-black text-slate-700 min-w-[35px] text-center">
              {Math.round(zoomScale * 100)}%
            </span>
            <button onClick={handleZoomIn} className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-white rounded-lg transition-all">
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          <button 
            onClick={() => setIsEditMode(!isEditMode)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all ${
              isEditMode 
              ? "bg-emerald-100 text-emerald-700 border border-emerald-200" 
              : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
            }`}
          >
            {isEditMode ? <><Check className="w-4 h-4" /> حفظ التعديلات</> : <><Edit3 className="w-4 h-4" /> تحرير النص المباشر</>}
          </button>

          <button 
            onClick={() => handlePrint()}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-black hover:bg-blue-700 shadow-md shadow-blue-200 transition-all active:scale-95"
          >
            <Printer className="w-4 h-4" /> طباعة
          </button>
        </div>
      </div>

      {/* ========================================== */}
      {/* مساحة العرض القابلة للتمرير */}
      {/* ========================================== */}
      <div className="flex-1 w-full overflow-y-auto overflow-x-hidden flex justify-center items-start pt-8 pb-32 custom-scrollbar">
        
        {/* حاوية التحجيم */}
        <div 
          className="transform-gpu transition-transform duration-200 ease-in-out origin-top"
          style={{ transform: `scale(${zoomScale})` }}
        >
          {/* ========================================== */}
          {/* الورقة A4 الفعلية */}
          {/* ========================================== */}
          <div
            ref={componentRef}
            className="bg-white shadow-2xl relative border border-slate-300 print-area"
            style={{
              width: "210mm",
              minHeight: "297mm",
              paddingBottom: "50mm", // زيادة المساحة لتستوعب الفوتر الجديد
            }}
            dir="rtl"
          >
            <div className="p-[15mm] relative z-10 flex flex-col h-full">
              
              {/* --- الترويسة (Header) --- */}
              <div className="flex justify-between items-start border-b-4 border-blue-900 pb-6 mb-8">
                <div className="flex flex-col items-center">
                  <div className="w-32 h-12 flex items-center justify-center mb-2">
                    <img src="/logo.jpeg" alt="Logo" className="max-w-full max-h-full object-contain" />
                  </div>
                  <h1 className="font-black text-[13px] text-blue-900">بلاك كيوب للإستشارات الهندسية</h1>
                  <h2 className="text-[8px] text-slate-500 uppercase tracking-widest mt-0.5">
                    Black Cube Engineering
                  </h2>
                </div>
                
                <div className="text-left mt-2">
                  <h3 className="text-2xl font-black text-blue-900 mb-3 tracking-tighter">عرض سعر خدمات</h3>
                  <div className="text-[10px] font-bold text-slate-700 space-y-1.5">
                    <p className="flex justify-between gap-6"><span>التاريخ:</span> <span>{issueDate}</span></p>
                    <p className="flex justify-between gap-6"><span>المرجع:</span> <span className="font-mono text-blue-700">{refNumber}</span></p>
                  </div>
                </div>
              </div>

              {/* --- بيانات العميل والمقدمة --- */}
              <div className="mb-8">
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-[13px] font-black text-slate-900">السادة /</span>
                  <div 
                    contentEditable={isEditMode}
                    suppressContentEditableWarning={true}
                    className={`text-[13px] font-black text-slate-900 flex items-center gap-2 ${isEditMode ? "bg-yellow-50 border-b border-dashed border-yellow-400 outline-none px-2" : ""}`}
                  >
                    {clientTitle !== "لقب مخصص" && clientTitle ? `${clientTitle} ` : ""}{clientNameForPreview || "اسم العميل"}
                    {showClientCode && clientCodeForPreview && (
                      <span className="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded text-[9px] font-mono border border-slate-200">
                        {clientCodeForPreview}
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-[13px] font-black text-slate-900 mb-4">المحترم</p>
                <p className="text-[12px] font-bold text-slate-800 mb-3">السلام عليكم ورحمة الله وبركاته ،،،،</p>
                
                <div 
                  contentEditable={isEditMode}
                  suppressContentEditableWarning={true}
                  className={`text-[12px] leading-[2] text-slate-700 text-justify ${isEditMode ? "bg-yellow-50 border border-dashed border-yellow-400 outline-none p-3 rounded" : ""}`}
                >
                  {introText}
                </div>
              </div>

              {/* --- جدول البنود والتسعير --- */}
              <div className="mb-6">
                <table className="w-full border-collapse border-2 border-blue-900 text-[10px] text-center shadow-sm">
                  <thead className="bg-blue-900 text-white font-black">
                    <tr>
                      <th className="border border-blue-900 p-2.5 w-8">م</th>
                      <th className="border border-blue-900 p-2.5 text-right">وصف الخدمة الهندسية</th>
                      <th className="border border-blue-900 p-2.5 w-14">الوحدة</th>
                      <th className="border border-blue-900 p-2.5 w-14">الكمية</th>
                      <th className="border border-blue-900 p-2.5 w-20">سعر الوحدة</th>
                      <th className="border border-blue-900 p-2.5 w-24">الإجمالي</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-800 font-bold">
                    {items?.map((item, idx) => (
                      <tr key={item.id || idx} className={idx % 2 === 0 ? "bg-white" : "bg-blue-50/30"}>
                        <td className="border border-blue-100 p-2 font-mono text-slate-400">{idx + 1}</td>
                        <td className="border border-blue-100 p-2 text-right leading-relaxed">{item.title || "---"}</td>
                        <td className="border border-blue-100 p-2">{item.unit || "---"}</td>
                        <td className="border border-blue-100 p-2 font-mono">{item.qty || 0}</td>
                        <td className="border border-blue-100 p-2 font-mono">{(item.price || 0).toLocaleString()}</td>
                        <td className="border border-blue-100 p-2 font-mono text-blue-900">
                          {((item.qty * item.price) - (item.discount || 0)).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                    {(!items || items.length === 0) && (
                      <tr>
                        <td colSpan="6" className="border border-blue-100 p-4 text-center text-slate-400">
                          لا يوجد بنود مسجلة
                        </td>
                      </tr>
                    )}

                    {/* المجاميع والضريبة */}
                    <tr className="bg-blue-50/50">
                      <td colSpan="5" className="border border-blue-900 p-2 text-left font-black text-blue-900">
                        الإجمالي بدون ضريبة القيمة المضافة %{taxRate}
                      </td>
                      <td className="border border-blue-900 p-2 font-black font-mono text-blue-900">
                        {subtotal?.toLocaleString() || 0} ريال
                      </td>
                    </tr>
                    <tr>
                      <td colSpan="5" className="border border-blue-900 p-2 text-left font-bold text-slate-600">
                        ضريبة القيمة المضافة %{taxRate}
                        {officeTaxBearing > 0 && <span className="text-[9px] text-emerald-600 mr-2">(المكتب يتحمل {officeTaxBearing}% من الضريبة)</span>}
                      </td>
                      <td className="border border-blue-900 p-2 font-bold font-mono text-slate-600">
                        {taxAmount?.toLocaleString() || 0} ريال
                      </td>
                    </tr>
                    <tr className="bg-blue-900 text-white">
                      <td colSpan="5" className="border border-blue-900 p-2.5 text-left font-black text-[12px]">
                        الإجمالي شامل ضريبة القيمة المضافة
                      </td>
                      <td className="border border-blue-900 p-2.5 font-black font-mono text-[12px]">
                        {grandTotal?.toLocaleString() || 0} ريال
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* --- جدول الدفعات وطرق الدفع --- */}
              {((paymentsList && paymentsList.length > 0) || (acceptedMethods && acceptedMethods.length > 0)) && (
                <div className="mb-8 grid grid-cols-12 gap-6 items-start">
                  {paymentsList && paymentsList.length > 0 && (
                    <div className="col-span-8">
                      <h4 className="text-[12px] font-black text-blue-900 mb-2">جدولة الدفعات :</h4>
                      <table className="w-full border-collapse border border-slate-300 text-[10px] text-center shadow-sm">
                        <thead className="bg-slate-100 text-slate-700">
                          <tr>
                            <th className="border border-slate-300 p-1.5 font-black">الدفعة</th>
                            <th className="border border-slate-300 p-1.5 font-black">النسبة</th>
                            <th className="border border-slate-300 p-1.5 font-black">المبلغ</th>
                            <th className="border border-slate-300 p-1.5 font-black text-right">الاستحقاق</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paymentsList.map((p) => (
                            <tr key={p.id}>
                              <td className="border border-slate-300 p-1.5 font-bold bg-slate-50">{p.label}</td>
                              <td className="border border-slate-300 p-1.5 text-slate-600 font-mono">{p.percentage}%</td>
                              <td className="border border-slate-300 p-1.5 font-mono font-black text-blue-900">{(p.amount || 0).toLocaleString()}</td>
                              <td className="border border-slate-300 p-1.5 text-right font-bold text-slate-700">{p.condition}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {acceptedMethods && acceptedMethods.length > 0 && (
                    <div className="col-span-4">
                      <h4 className="text-[12px] font-black text-blue-900 mb-2">طرق الدفع :</h4>
                      <div className="flex flex-col gap-1.5">
                        {acceptedMethods.map(method => (
                          <div key={method} className="flex items-center gap-1.5 text-[10px] font-bold text-slate-700 bg-slate-50 border border-slate-200 px-2 py-1.5 rounded">
                            {getMethodIcon(method)} {getMethodLabel(method)}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* --- الملاحظات والشروط والنواقص --- */}
              <div className="mb-auto">
                <div className="flex items-center gap-2 mb-3 border-r-4 border-blue-900 pr-3">
                   <h4 className="text-[13px] font-black text-blue-900 uppercase">الشروط والأحكام :</h4>
                </div>
                <div 
                  contentEditable={isEditMode}
                  suppressContentEditableWarning={true}
                  className={`text-[11px] leading-[1.8] text-slate-700 whitespace-pre-line text-justify font-bold ${isEditMode ? "bg-yellow-50 border border-dashed border-yellow-400 p-3 rounded-lg outline-none" : ""}`}
                >
                  {termsText || "لم يتم إدراج شروط وأحكام."}
                  
                  {showMissingDocs && missingDocs && (
                    <div className="mt-4 p-3 border-2 border-red-500 border-dashed bg-red-50 text-red-800 text-[10px] font-bold">
                      <span className="block mb-1 text-[11px] font-black">⚠️ مستندات مطلوبة للبدء:</span>
                      {missingDocs}
                    </div>
                  )}
                </div>
              </div>

              {/* --- التوقيعات --- */}
              <div className="mt-12">
                <div className="grid grid-cols-2 gap-12 text-center">
                  <div className="space-y-12">
                    <p className="text-[11px] font-black text-blue-900">توقيع العميل / الممثل</p>
                    <div className="border-b-2 border-slate-300 w-48 mx-auto border-dashed"></div>
                  </div>
                  <div className="space-y-12 relative flex flex-col items-center">
                    <p className="text-[11px] font-black text-blue-900 z-20 bg-white px-2">توقيع وختم المكتب</p>
                    <div className="border-b-2 border-slate-300 w-48 mx-auto border-dashed relative z-10 hidden"></div>
                    {/* هنا يمكن دمج مكون OfficialStamp إذا كان مطلوباً */}
                  </div>
                </div>
              </div>

              {/* ========================================== */}
              {/* الفوتر الجديد بناءً على طلبك */}
              {/* ========================================== */}
              <div className="absolute bottom-0 left-0 right-0 bg-white px-[15mm] pb-[10mm] pt-4">
                {/* الجزء العلوي من الفوتر */}
                <div className="border-t border-slate-200 pt-6 flex justify-between items-end text-[10px] text-slate-500 font-sans print:border-slate-300 break-inside-avoid">
                  
                  {/* يسار: الرقم المرجعي والنص */}
                  <div className="flex flex-col gap-1 w-1/3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 tracking-tight">الرقم المرجعي:</span>
                      <span className="font-mono text-xs">{refNumber}</span>
                    </div>
                    <p className="leading-relaxed opacity-75 max-w-xs">
                      صلاحية هذا العرض هي {validityText} من تاريخ الإصدار. جميع الأسعار خاضعة لضريبة القيمة المضافة حسب الأنظمة المتبعة.
                    </p>
                  </div>

                  {/* المنتصف: الباركود */}
                  <div className="flex flex-col items-center gap-1 w-1/3">
                    <div className="h-10 mb-1 w-[135px] flex items-center justify-center opacity-80">
                      {/* باركود برمجي عبر CSS للطباعة الدقيقة */}
                      <div className="w-full h-[35px] bg-[repeating-linear-gradient(90deg,#000_0,#000_2px,transparent_0,transparent_4px,transparent_6px,#000_6px,#000_8px,transparent_8px,transparent_10px)]"></div>
                    </div>
                    <span className="font-mono text-[9px] tracking-[0.2em]">{refNumber}</span>
                  </div>

                  {/* يمين: QR ورقم الصفحة */}
                  <div className="flex justify-end gap-6 items-end w-1/3">
                    <div className="bg-white p-1 border border-slate-100 rounded shadow-sm">
                      {/* رمز QR كـ SVG للاحتفاظ بالدقة */}
                      <svg height="60" width="60" viewBox="0 0 21 21" role="img">
                        <path fill="#FFFFFF" d="M0,0 h21v21H0z" shapeRendering="crispEdges"></path>
                        <path fill="#000000" d="M0 0h7v1H0zM9 0h1v1H9zM11 0h2v1H11zM14,0 h7v1H14zM0 1h1v1H0zM6 1h1v1H6zM8 1h2v1H8zM14 1h1v1H14zM20,1 h1v1H20zM0 2h1v1H0zM2 2h3v1H2zM6 2h1v1H6zM8 2h1v1H8zM10 2h1v1H10zM12 2h1v1H12zM14 2h1v1H14zM16 2h3v1H16zM20,2 h1v1H20zM0 3h1v1H0zM2 3h3v1H2zM6 3h1v1H6zM8 3h2v1H8zM12 3h1v1H12zM14 3h1v1H14zM16 3h3v1H16zM20,3 h1v1H20zM0 4h1v1H0zM2 4h3v1H2zM6 4h1v1H6zM8 4h1v1H8zM11 4h1v1H11zM14 4h1v1H14zM16 4h3v1H16zM20,4 h1v1H20zM0 5h1v1H0zM6 5h1v1H6zM8 5h5v1H8zM14 5h1v1H14zM20,5 h1v1H20zM0 6h7v1H0zM8 6h1v1H8zM10 6h1v1H10zM12 6h1v1H12zM14,6 h7v1H14zM9 7h1v1H9zM12 7h1v1H12zM2 8h1v1H2zM5 8h7v1H5zM13 8h1v1H13zM15 8h5v1H15zM0 9h2v1H0zM3 9h3v1H3zM7 9h1v1H7zM9 9h3v1H9zM18,9 h3v1H18zM0 10h4v1H0zM5 10h2v1H5zM8 10h2v1H8zM11 10h3v1H11zM17 10h3v1H17zM0 11h2v1H0zM3 11h3v1H3zM7 11h1v1H7zM9 11h4v1H9zM16 11h1v1H16zM19,11 h2v1H19zM0 12h3v1H0zM4 12h4v1H4zM9 12h2v1H9zM12 12h3v1H12zM19 12h1v1H19zM8 13h3v1H8zM13 13h1v1H13zM15 13h1v1H15zM0 14h7v1H0zM8 14h1v1H8zM10 14h1v1H10zM12 14h1v1H12zM15 14h2v1H15zM0 15h1v1H0zM6 15h1v1H6zM8 15h3v1H8zM15 15h1v1H15zM20,15 h1v1H20zM0 16h1v1H0zM2 16h3v1H2zM6 16h1v1H6zM10 16h1v1H10zM14,16 h7v1H14zM0 17h1v1H0zM2 17h3v1H2zM6 17h1v1H6zM12 17h3v1H12zM0 18h1v1H0zM2 18h3v1H2zM6 18h1v1H6zM8 18h1v1H8zM11 18h2v1H11zM14 18h1v1H14zM17,18 h4v1H17zM0 19h1v1H0zM6 19h1v1H6zM10 19h2v1H10zM16 19h1v1H16zM20,19 h1v1H20zM0 20h7v1H0zM12 20h1v1H12zM14 20h1v1H14zM17,20 h4v1H17z" shapeRendering="crispEdges"></path>
                      </svg>
                    </div>
                    <div className="text-left font-black text-slate-900 border-r-2 border-slate-900 pr-4 h-full flex flex-col justify-center">
                      <div className="text-xs uppercase tracking-widest text-slate-400 mb-0.5">Page</div>
                      <div className="text-lg leading-none print:hidden">1 <span className="text-slate-300 mx-1">/</span> 1</div>
                      <div className="text-lg leading-none hidden print:block css-page-number"></div>
                    </div>
                  </div>
                </div>

                {/* الجزء السفلي من الفوتر */}
                <div className="mt-4 pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-500 font-bold gap-2">
                  <div className="flex gap-4">
                    <span className="flex items-center gap-1"><span className="text-slate-400">هاتف:</span> 0547267500</span>
                    <span className="flex items-center gap-1"><span className="text-slate-400">بريد:</span> info@blackcube.sa</span>
                    <span className="flex items-center gap-1"><span className="text-slate-400">الموقع:</span> www.blackcube.sa</span>
                  </div>
                  
                  <div className="text-[9px] text-slate-400 max-w-md text-center hidden md:block">
                    صلاحية هذا العرض هي {validityText} من تاريخ الإصدار. جميع الأسعار خاضعة لضريبة القيمة المضافة.
                  </div>

                  <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100/50">
                    <ShieldCheck className="w-3 h-3" />
                    <span className="uppercase tracking-widest text-[8px] font-black">Secure Digital Original</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          @page { size: A4; margin: 0; }
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area { 
            position: absolute; 
            left: 0; 
            top: 0; 
            width: 210mm !important; 
            height: 297mm !important;
            margin: 0 !important; 
            padding: 0 !important;
            transform: scale(1) !important;
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
};