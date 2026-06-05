import { generateZatcaQr } from "./zatca";
import html2canvas from "html2canvas";

export const generateContractPdf = (contract) => {
  const html = generateContractHtml(contract);
  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.focus();
      setTimeout(() => printWindow.print(), 700);
    };
  }
};

export const generateContractImage = async (contract) => {
  const html = generateContractHtml(contract);

  // Create a hidden iframe to render the HTML
  const iframe = document.createElement("iframe");
  iframe.style.position = "absolute";
  iframe.style.width = "210mm";
  iframe.style.height = "297mm";
  iframe.style.top = "-9999px";
  iframe.style.left = "-9999px";
  document.body.appendChild(iframe);

  iframe.contentDocument?.open();
  iframe.contentDocument?.write(html);
  iframe.contentDocument?.close();

  // Wait for images to load
  await new Promise((resolve) => {
    iframe.onload = () => {
      setTimeout(resolve, 1000); // Give it a bit more time to render fonts/images
    };
  });

  try {
    const body = iframe.contentDocument?.body;
    if (body) {
      const canvas = await html2canvas(body, {
        scale: 2,
        useCORS: true,
        logging: false,
        windowWidth: 794, // A4 width in pixels at 96 DPI
      });

      const imgData = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `contract-${contract.code}.png`;
      link.href = imgData;
      link.click();
    }
  } catch (error) {
    console.error("Error generating image:", error);
  } finally {
    document.body.removeChild(iframe);
  }
};

export const generateContractLink = (contract) => {
  // In a real app, this would save the contract to a database and return a unique URL
  // For this demo, we'll return a mock URL or a local route
  const baseUrl = window.location.origin;
  return `${baseUrl}/shared/contract/${contract.id || contract.code}`;
};

export const generateContractHtml = (contract) => {
  const qrData = generateZatcaQr(
    contract.partyA || "DETAILS Consulting Engineers",
    contract.partyADetails?.cr || "7052303828",
    contract.date || new Date().toISOString(),
    (contract.financials?.grandTotal || 0).toString(),
    (contract.financials?.taxAmount || 0).toString(),
  );

  const companyLogoSrc = contract.companyLogo || contract.logoUrl || contract.coverSettings?.logoUrl || '/logo.jpeg';

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrData)}`;
  const projectQrUrl =
    contract.qrSettings?.enabled &&
    contract.qrSettings?.frontQrContent === "link"
      ? `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent("https://maps.google.com")}`
      : null;
  const verificationQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`https://example.com/verify/${contract.code}`)}`;
  const companyQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`DETAILS Consulting Engineers | King Fahd Dist - RIYADH | POSTAL CODE: 12274 | Mobile: 0590722827 | N.N: 7052303828 | info@details-consults.sa`)}`;

  const watermarkText =
    contract.status === "مسودة"
      ? "مسودة غير معتمدة"
      : contract.status === "معتمد"
        ? "عقد معتمد"
        : contract.status;
  const watermarkColor =
    contract.status === "مسودة"
      ? "rgba(226, 232, 240, 0.4)"
      : "rgba(16, 185, 129, 0.1)";

  const bgImageFront = contract.coverSettings?.background?.imageUrl
    ? `
    <div style="position: absolute; top:0; left:0; right:0; bottom:0; background-image: url('${contract.coverSettings.background.imageUrl}'); background-size: ${contract.coverSettings.background.size}; opacity: ${contract.coverSettings.background.opacity}; z-index: -1;"></div>
  `
    : "";

  const bgImageBack = contract.backCoverSettings?.background?.imageUrl
    ? `
    <div style="position: absolute; top:0; left:0; right:0; bottom:0; background-image: url('${contract.backCoverSettings.background.imageUrl}'); background-size: ${contract.backCoverSettings.background.size}; opacity: ${contract.backCoverSettings.background.opacity}; z-index: -1;"></div>
  `
    : "";

  const bgImageAll =
    contract.coverSettings?.background?.applyTo === "all" &&
    contract.coverSettings?.background?.imageUrl
      ? `
    <div style="position: absolute; top:0; left:0; right:0; bottom:0; background-image: url('${contract.coverSettings.background.imageUrl}'); background-size: ${contract.coverSettings.background.size}; opacity: ${contract.coverSettings.background.opacity}; z-index: -1;"></div>
  `
      : "";

  return `
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
      <meta charset="UTF-8">
      <title>${contract.name}</title>
      <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&display=swap" rel="stylesheet">
      <style>
        @page { size: A4 portrait; margin: 0; }
        body { 
          font-family: 'Tajawal', sans-serif; 
          background: #f7fbfd; 
          color: #123B5D; 
          margin: 0; 
          padding: 0; 
          -webkit-print-color-adjust: exact; 
          print-color-adjust: exact;
        }
        .page { 
          width: 210mm; 
          min-height: 297mm; 
          background: white; 
          margin: 20mm auto; 
          position: relative; 
          box-sizing: border-box; 
          padding: 25mm 20mm 30mm 20mm; 
          page-break-after: always;
          box-shadow: 0 10px 30px rgba(0,0,0,0.15);
          border: 1px solid #d8e6ee;
        }
        @media screen {
          body { background: #eef5f7; padding: 20px 0; }
          .page::after {
            content: '';
            display: block;
            position: absolute;
            bottom: -20mm;
            left: 50%;
            transform: translateX(-50%);
            width: 50px;
            height: 4px;
            background: #d8e6ee;
            border-radius: 2px;
          }
          .page:last-child::after { display: none; }
        }
        @media print {
          html, body {
            width: 210mm;
            min-height: 297mm;
            background: white;
            margin: 0;
            padding: 0;
            overflow: visible;
          }
          .page {
            width: 210mm;
            min-height: 297mm;
            box-shadow: none;
            margin: 0 auto;
            border: none;
            page-break-after: always;
            break-after: page;
          }
          .page:last-child { page-break-after: auto; break-after: auto; }
          .page::after { display: none; }
        }
        
        /* Dynamic Styling */
        body {
          font-family: '${contract.typographySettings?.fontFamily || "Tajawal"}', sans-serif;
          font-size: ${contract.typographySettings?.fontSize || "14px"};
          color: ${contract.typographySettings?.color || "#123B5D"};
        }
        p, li {
          line-height: ${contract.spacingSettings?.lineHeight || "1.8"};
          margin-bottom: ${contract.spacingSettings?.paragraphSpacing || "16px"};
        }
        .page {
          padding: ${contract.spacingSettings?.padding || "40px"};
        }

        /* Frames */
        .page-frame {
          position: absolute;
          top: ${contract.frameSettings?.pageFrame?.margin || "20px"};
          bottom: ${contract.frameSettings?.pageFrame?.margin || "20px"};
          left: ${contract.frameSettings?.pageFrame?.margin || "20px"};
          right: ${contract.frameSettings?.pageFrame?.margin || "20px"};
          border: ${contract.frameSettings?.pageFrame?.enabled ? `2px ${contract.frameSettings.pageFrame.style} ${contract.frameSettings.pageFrame.color}` : "none"};
          pointer-events: none;
          z-index: 5;
        }
        .front-cover-frame {
          position: absolute;
          top: ${contract.frameSettings?.frontCoverFrame?.margin || "30px"};
          bottom: ${contract.frameSettings?.frontCoverFrame?.margin || "30px"};
          left: ${contract.frameSettings?.frontCoverFrame?.margin || "30px"};
          right: ${contract.frameSettings?.frontCoverFrame?.margin || "30px"};
          border: ${contract.frameSettings?.frontCoverFrame?.enabled ? `4px ${contract.frameSettings.frontCoverFrame.style} ${contract.frameSettings.frontCoverFrame.color}` : "none"};
          pointer-events: none;
          z-index: 5;
        }
        .back-cover-frame {
          position: absolute;
          top: ${contract.frameSettings?.backCoverFrame?.margin || "30px"};
          bottom: ${contract.frameSettings?.backCoverFrame?.margin || "30px"};
          left: ${contract.frameSettings?.backCoverFrame?.margin || "30px"};
          right: ${contract.frameSettings?.backCoverFrame?.margin || "30px"};
          border: ${contract.frameSettings?.backCoverFrame?.enabled ? `4px ${contract.frameSettings.backCoverFrame.style} ${contract.frameSettings.backCoverFrame.color}` : "none"};
          pointer-events: none;
          z-index: 5;
        }

        /* Watermark */
        .watermark {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-45deg);
          font-size: 120px;
          color: ${watermarkColor};
          z-index: 0;
          pointer-events: none;
          font-weight: 900;
          white-space: nowrap;
          user-select: none;
        }

        /* Header & Footer */
        .header {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 25mm;
          padding: 10mm 20mm 0;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 2px solid #083646;
          background: transparent;
          z-index: 10;
        }
        .header-logo { width: 62px; height: 44px; background: #fff; border: 1.5px solid #ead9b8; border-radius: 12px; display: flex; align-items: center; justify-content: center; overflow: hidden; padding: 6px; box-sizing: border-box; }
        .header-logo img { max-width: 100%; max-height: 100%; object-fit: contain; display: block; }
        .header-info { text-align: left; font-size: 10px; color: #71839a; line-height: 1.6; }
        .header-info strong { color: #123B5D; }
        
        .footer {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 25mm;
          padding: 5mm 20mm 10mm;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-top: 2px solid #083646;
          font-size: 9px;
          color: #52677e;
          z-index: 10;
          background: #f7fbfd;
        }
        .footer-col {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .footer-col strong {
          color: #123B5D;
          font-size: 10px;
          margin-bottom: 2px;
        }

        /* Cover Page Specific */
        .cover-page {
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          align-items: center;
          text-align: center;
          padding: 20mm 20mm;
          background: white;
          position: relative;
          z-index: 1;
        }
        .cover-logo {
          width: 118px;
          height: 82px;
          background: white;
          border: 1.5px solid #ead9b8;
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 18px;
          box-shadow: 0 10px 24px rgba(8, 54, 70, 0.10);
          padding: 10px 14px;
          box-sizing: border-box;
        }
        .cover-logo img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          display: block;
        }
        .cover-title {
          font-size: 34pt;
          font-weight: 900;
          color: #083646;
          margin-bottom: 5px;
          line-height: 1.2;
        }
        .cover-addendum {
          font-size: 16pt;
          font-weight: 700;
          color: #ef4444;
          margin-bottom: 10px;
        }
        .cover-base-info {
          font-size: 11pt;
          color: #71839a;
          margin-bottom: 20px;
        }
        .cover-type {
          font-size: 20pt;
          font-weight: 800;
          color: #123B5D;
          margin-bottom: 30px;
          padding-bottom: 10px;
          border-bottom: 2px solid #d8e6ee;
          display: inline-block;
        }
        
        .cover-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
          background: rgba(255, 255, 255, 0.9);
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }
        .cover-table th, .cover-table td {
          border: 1px solid #e7eef2;
          padding: 9px;
          text-align: right;
          font-size: 10pt;
        }
        .cover-table th {
          background: #f7fbfd;
          font-weight: 800;
          color: #123B5D;
          width: 30%;
        }
        .cover-table td {
          font-weight: 600;
          color: #123B5D;
        }

        .qr-container {
          display: flex;
          justify-content: center;
          gap: 30px;
          margin-top: 20px;
          margin-bottom: 20px;
        }
        .qr-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }
        .qr-box img {
          width: 80px;
          height: 80px;
          border: 2px solid #e7eef2;
          border-radius: 8px;
          padding: 4px;
          background: white;
        }
        .qr-label {
          font-size: 9pt;
          font-weight: 700;
          color: #71839a;
        }

        .dates-container {
          display: flex;
          justify-content: space-around;
          width: 100%;
          margin-top: 20px;
          padding: 15px;
          background: #f7fbfd;
          border-radius: 8px;
          border: 1px solid #e7eef2;
        }
        .date-box {
          text-align: center;
        }
        .date-label {
          font-size: 10pt;
          color: #71839a;
          font-weight: 700;
          margin-bottom: 5px;
        }
        .date-value {
          font-size: 13pt;
          color: #083646;
          font-weight: 900;
        }

        /* Content Styles */
        .content { position: relative; z-index: 1; margin-top: 25mm; }
        
        .preamble {
          text-align: justify;
          text-align-last: center;
          font-size: 11pt;
          line-height: 2;
          margin-bottom: 10mm;
          font-weight: 500;
        }

        .parties-section {
          background: #f7fbfd;
          border: 1px solid #e7eef2;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 10mm;
        }
        .party-block { margin-bottom: 15px; }
        .party-block:last-child { margin-bottom: 0; padding-top: 15px; border-top: 1px dashed #d8e6ee; }
        .party-title { font-size: 13pt; font-weight: 800; color: #083646; margin-bottom: 10px; display: flex; align-items: center; gap: 8px; }
        .party-title::before { content: ''; display: inline-block; width: 8px; height: 8px; background: #d9b85b; border-radius: 50%; }
        .party-details { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 10pt; line-height: 1.6; }
        .party-details div strong { color: #123B5D; display: inline-block; width: 120px; }

        .clause { margin-bottom: 8mm; page-break-inside: avoid; }
        .clause-header {
          font-size: 13pt;
          font-weight: 800;
          color: #123B5D;
          margin-bottom: 10px;
          padding-bottom: 5px;
          border-bottom: 2px solid #e7eef2;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .clause-number {
          background: #083646;
          color: white;
          padding: 2px 10px;
          border-radius: 4px;
          font-size: 11pt;
        }
        .clause-body {
          font-size: 11pt;
          line-height: 1.8;
          color: #123B5D;
          text-align: justify;
          white-space: pre-wrap;
        }

        /* Tables */
        .financial-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 15px;
          margin-bottom: 15px;
        }
        .financial-table th, .financial-table td {
          border: 1px solid #d8e6ee;
          padding: 9px;
          text-align: right;
          font-size: 10pt;
        }
        .financial-table th { background: #eef5f7; font-weight: 800; color: #123B5D; }
        .financial-table tr.total-row { background: #fbf7ef; font-weight: 900; color: #083646; }

        /* Signatures */
        .signatures-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
          margin-top: 20mm;
          page-break-inside: avoid;
        }
        .signature-box {
          border: 1px solid #d8e6ee;
          border-radius: 12px;
          padding: 20px;
          text-align: center;
          background: #f7fbfd;
        }
        .signature-title { font-size: 13pt; font-weight: 800; color: #083646; margin-bottom: 15px; }
        .signature-line { margin-top: 40px; border-top: 1px dashed #8aa0b4; padding-top: 10px; font-size: 10pt; color: #71839a; }
        
        .witnesses-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
          margin-top: 20px;
          page-break-inside: avoid;
        }

        /* QR Section */
        .qr-section {
          display: flex;
          justify-content: center;
          gap: 40px;
          margin-top: 20mm;
          page-break-inside: avoid;
        }
        .qr-box { text-align: center; }
        .qr-box img { width: 100px; height: 100px; border: 1px solid #e7eef2; padding: 5px; border-radius: 8px; background: white; }
        .qr-label { font-size: 9pt; font-weight: 700; color: #71839a; margin-top: 8px; }

        /* Back Cover Specific */
        .back-cover-page {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 22mm 18mm;
          background: linear-gradient(180deg, #ffffff 0%, #f7fbfd 100%);
          text-align: center;
        }
        .back-cover-brand {
          width: 130px;
          height: 86px;
          background: #fff;
          border: 1.5px solid #ead9b8;
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 12px 16px;
          box-sizing: border-box;
          box-shadow: 0 10px 24px rgba(8,54,70,.10);
          margin-bottom: 18mm;
        }
        .back-cover-brand img { max-width: 100%; max-height: 100%; object-fit: contain; }
        .contact-info-box {
          width: 100%;
          max-width: 150mm;
          background: white;
          border: 1px solid #d8e6ee;
          border-radius: 18px;
          padding: 18mm 14mm;
          text-align: center;
          box-shadow: 0 8px 22px rgba(8,54,70,.08);
          box-sizing: border-box;
        }
        .contact-info-box h3 { color: #083646; margin: 0 0 10mm; font-size: 18pt; }
        .contact-details { display: flex; flex-direction: column; align-items: center; gap: 7px; font-size: 11pt; color: #52677e; line-height: 1.7; }
      </style>
    </head>
    <body>

      <!-- PAGE 1: FRONT COVER -->
      <div class="page cover-page">
        <div class="front-cover-frame"></div>
        ${bgImageFront}
        ${contract.coverSettings?.showLogo !== false ? `<div class="cover-logo"><img src="${companyLogoSrc}" alt="Details Logo" onerror="this.style.display='none'" /></div>` : ""}
        <div class="cover-title">عقد</div>
        ${
          contract.isAddendum
            ? `
          <div class="cover-addendum">(إلحاقي)</div>
          <div class="cover-base-info">عقد أساسي رقم: ${contract.baseContractId || "---"}</div>
        `
            : ""
        }
        
        <div class="cover-type">${contract.type}</div>
        
        <!-- Project Table -->
        <table class="cover-table">
          <tbody>
            <tr>
              <th>نوع المعاملة (المشروع)</th>
              <td>${contract.projectDetails?.transactionType || contract.type}</td>
            </tr>
            <tr>
              <th>عنوان المشروع</th>
              <td>${contract.projectDetails?.name || "---"}</td>
            </tr>
            <tr>
              <th>المدينة / الحي</th>
              <td>${contract.projectDetails?.city || "---"} / ${contract.projectDetails?.location || "---"}</td>
            </tr>
            <tr>
              <th>المساحة</th>
              <td>${contract.projectDetails?.area ? `${contract.projectDetails.area} متر مربع` : "---"}</td>
            </tr>
            <tr>
              <th>رقم الصك</th>
              <td>${contract.projectDetails?.deedNumber || "---"}</td>
            </tr>
            <tr>
              <th>رقم القطعة</th>
              <td>${contract.projectDetails?.plotNumber || "---"}</td>
            </tr>
          </tbody>
        </table>

        <!-- Parties Table -->
        <table class="cover-table">
          <tbody>
            <tr>
              <th>الطرف الأول</th>
              <td>${contract.partyA} <br><span style="font-size:9pt; color:#71839a;">(${contract.partyADetails?.capacity || "مقدم الخدمة"}) - يمثله: ${contract.partyADetails?.representant || "---"}</span></td>
            </tr>
            <tr>
              <th>الطرف الثاني</th>
              <td>${contract.partyB || "---"} <br><span style="font-size:9pt; color:#71839a;">(${contract.partyBDetails?.capacity || "العميل"}) - يمثله: ${contract.partyBDetails?.representant || "---"}</span></td>
            </tr>
          </tbody>
        </table>

        <!-- QR Codes -->
        <div class="qr-container">
          ${
            projectQrUrl
              ? `
            <div class="qr-box">
              <img src="${projectQrUrl}" alt="موقع الأرض" />
              <div class="qr-label">موقع الأرض</div>
            </div>
          `
              : ""
          }
          <div class="qr-box">
            <img src="${companyQrUrl}" alt="عنوان الشركة" />
            <div class="qr-label">عنوان شركتنا</div>
          </div>
          <div class="qr-box">
            <img src="${verificationQrUrl}" alt="التحقق من العقد" />
            <div class="qr-label">التحقق من العقد</div>
          </div>
        </div>

        <!-- Dates -->
        <div class="dates-container">
          <div class="date-box">
            <div class="date-label">التاريخ الهجري</div>
            <div class="date-value">${contract.hijriDate || "---"}</div>
          </div>
          <div class="date-box">
            <div class="date-label">التاريخ الميلادي</div>
            <div class="date-value">${contract.gregorianDate || contract.date || "---"}</div>
          </div>
        </div>

        ${
          contract.coverSettings?.showSummary !== false &&
          (contract.coverSummary || contract.aiSummary)
            ? `
          <div class="ai-summary-box" style="margin-top: auto; padding: 15px; background: #f7fbfd; border: 1px solid #e7eef2; border-radius: 8px; text-align: right; width: 100%; box-sizing: border-box;">
            <div class="ai-badge" style="font-size: 10pt; font-weight: 800; color: #083646; margin-bottom: 5px;">✨ ملخص العقد</div>
            <div class="ai-summary-text" style="font-size: 10pt; color: #52677e; line-height: 1.6;">${(contract.aiSummary || contract.coverSummary || "").replace(/\n/g, "<br>")}</div>
          </div>
        `
            : ""
        }
      </div>

      <!-- PAGE 2: PREAMBLE & PARTIES -->
      <div class="page">
        <div class="page-frame"></div>
        ${bgImageAll}
        <div class="watermark">${watermarkText}</div>
        
        <div class="header">
          <div class="header-logo"><img src="${companyLogoSrc}" alt="Details Logo" onerror="this.style.display='none'" /></div>
          <div class="header-info">
            <div><strong>رقم العقد:</strong> ${contract.code}</div>
            <div><strong>التاريخ:</strong> ${contract.date}</div>
            <div><strong>تصنيف الوثيقة:</strong> سري ومقيد</div>
          </div>
        </div>

        <div class="content">
          <div class="preamble">
            ${contract.legalIntroduction || `الحمد لله والصلاة والسلام على رسول الله، وبعد:<br/>إنه في يوم الموافق ${contract.date}م، تم الاتفاق والتراضي بين كل من:`}
          </div>

          <div class="parties-section">
            <div class="party-block">
              <div class="party-title">الطرف الأول: ${contract.partyA}</div>
              <div class="party-details">
                <div><strong>يمثلها:</strong> ${contract.partyADetails?.representant || "-"}</div>
                <div><strong>الصفة:</strong> ${contract.partyADetails?.capacity || "مقدم الخدمة"}</div>
                <div><strong>السجل التجاري:</strong> ${contract.partyADetails?.cr || "-"}</div>
                <div><strong>العنوان:</strong> ${contract.partyADetails?.address || "-"}</div>
              </div>
            </div>
            
            <div class="party-block">
              <div class="party-title">الطرف الثاني: ${contract.partyB || ".............................."}</div>
              <div class="party-details">
                <div><strong>يمثلها:</strong> ${contract.partyBDetails?.representant || "-"}</div>
                <div><strong>الصفة:</strong> ${contract.partyBDetails?.capacity || "العميل"}</div>
                <div><strong>الهوية/السجل:</strong> ${contract.partyBDetails?.idNumber || "-"}</div>
                <div><strong>الجوال:</strong> <span dir="ltr">${contract.partyBDetails?.phone || "-"}</span></div>
                <div><strong>البريد الإلكتروني:</strong> <span dir="ltr">${contract.partyBDetails?.email || "-"}</span></div>
                <div><strong>العنوان:</strong> ${contract.partyBDetails?.address || "-"}</div>
              </div>
            </div>
          </div>

          <div class="preamble">
            حيث أن الطرف الأول يمتلك الخبرة والكفاءة الفنية اللازمة، وحيث أن الطرف الثاني يرغب في الاستفادة من خدمات الطرف الأول، فقد اتفق الطرفان وهما بكامل الأهلية المعتبرة شرعاً ونظاماً على إبرام هذا العقد وفقاً للبنود التالية:
          </div>

          <div class="clause">
            <div class="clause-header">
              <span class="clause-number">البند الأول</span>
              <span>التمهيد والملاحق</span>
            </div>
            <div class="clause-body">
              يعتبر التمهيد السابق والملاحق المرفقة (إن وجدت) جزءاً لا يتجزأ من هذا العقد وتقرأ وتفسر معه.
            </div>
          </div>

          <div class="clause">
            <div class="clause-header">
              <span class="clause-number">البند الثاني</span>
              <span>بيانات المشروع ونطاق العمل</span>
            </div>
            <div class="clause-body">
              <strong>اسم المشروع:</strong> ${contract.projectDetails?.name || "-"}<br/>
              <strong>الموقع:</strong> ${contract.projectDetails?.city || "-"} - ${contract.projectDetails?.location || "-"}<br/>
              <strong>رقم الصك:</strong> ${contract.projectDetails?.deedNumber || "-"} | <strong>رقم القطعة:</strong> ${contract.projectDetails?.plotNumber || "-"}<br/><br/>
              <strong>نطاق العمل التفصيلي:</strong><br/>
              ${contract.isOnePageSummary && contract.aiSummary ? contract.aiSummary.replace(/\n/g, "<br/>") : contract.terms || "لم يتم تحديد نطاق العمل بعد."}
            </div>
          </div>

          ${
            contract.isOnePageSummary
              ? ""
              : `
        </div>

        <div class="footer">
          <div class="footer-col" style="width: 30%;">
            <strong>معلومات الوثيقة</strong>
            <div>رقم العقد: ${contract.code}</div>
            <div>تاريخ الإصدار: ${contract.date}</div>
            <div>نسخة معتمدة وموثقة</div>
          </div>
          <div class="footer-col company-footer-info" style="width: 40%; text-align: center;">
            <strong>DETAILS Consulting Engineers</strong>
            <div>King Fahd Dist - RIYADH - Kingdom of Saudi Arabia</div>
            <div>POSTAL CODE: 12274 | Mobile: 0590722827</div>
            <div>N.N: 7052303828 | info@details-consults.sa</div>
          </div>
          <div class="footer-col" style="width: 30%; text-align: left;">
            <strong>التوقيعات</strong>
            <div>الطرف الأول: ........................</div>
            <div>الطرف الثاني: ........................</div>
          </div>
        </div>
      </div>

      <!-- PAGE 3: FINANCIALS & OBLIGATIONS -->
      <div class="page">
        <div class="page-frame"></div>
        <div class="watermark">${watermarkText}</div>
        
        <div class="header">
          <div class="header-logo"><img src="${companyLogoSrc}" alt="Details Logo" onerror="this.style.display='none'" /></div>
          <div class="header-info">
            <div><strong>رقم العقد:</strong> ${contract.code}</div>
            <div><strong>التاريخ:</strong> ${contract.date}</div>
            <div><strong>تصنيف الوثيقة:</strong> سري ومقيد</div>
          </div>
        </div>

        <div class="content">
          `
          }
          
          <div class="clause">
            <div class="clause-header">
              <span class="clause-number">البند الثالث</span>
              <span>الأتعاب وطريقة الدفع</span>
            </div>
            <div class="clause-body">
              اتفق الطرفان على أن إجمالي أتعاب الطرف الأول مقابل تنفيذ نطاق العمل المذكور أعلاه هي كالتالي:
              
              <table class="financial-table">
                <thead>
                  <tr>
                    <th>البيان</th>
                    <th>المبلغ (ريال سعودي)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>المبلغ الأساسي</td>
                    <td>${(contract.contractValue || 0).toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td>ضريبة القيمة المضافة (15%)</td>
                    <td>${(contract.financials?.taxAmount || 0).toLocaleString()}</td>
                  </tr>
                  <tr class="total-row">
                    <td>الإجمالي الشامل</td>
                    <td>${(contract.financials?.grandTotal || 0).toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>

              <strong>شروط وآلية الدفع:</strong><br/>
              ${contract.paymentTerms || "يتم الدفع حسب الاتفاق المبرم بين الطرفين."}
            </div>
          </div>

          <div class="clause">
            <div class="clause-header">
              <span class="clause-number">البند الرابع</span>
              <span>التزامات الطرف الأول</span>
            </div>
            <div class="clause-body">
              ${contract.partyAObligations || "يلتزم الطرف الأول بتنفيذ الأعمال المتفق عليها وفقاً للأصول المهنية والمعايير الهندسية المعتمدة."}
            </div>
          </div>

          <div class="clause">
            <div class="clause-header">
              <span class="clause-number">البند الخامس</span>
              <span>التزامات الطرف الثاني</span>
            </div>
            <div class="clause-body">
              ${contract.partyBObligations || "يلتزم الطرف الثاني بتزويد الطرف الأول بكافة المستندات والمعلومات اللازمة، وسداد الدفعات المالية في مواعيدها."}
            </div>
          </div>

          ${
            contract.obligationsList && contract.obligationsList.length > 0
              ? `
            <div class="clause">
              <div class="clause-header">
                <span class="clause-number">البند الإضافي</span>
                <span>الالتزامات التفصيلية</span>
              </div>
              <div class="clause-body">
                <ul style="list-style-type: none; padding: 0;">
                  ${contract.obligationsList
                    .map(
                      (obs) => `
                    <li style="margin-bottom: 10px;">
                      <strong>${obs.code} (${obs.party === "A" ? "الطرف الأول" : obs.party === "B" ? "الطرف الثاني" : "مشترك"}):</strong>
                      ${obs.content}
                    </li>
                  `,
                    )
                    .join("")}
                </ul>
              </div>
            </div>
          `
              : ""
          }

          <div class="clause">
            <div class="clause-header">
              <span class="clause-number">البند السادس</span>
              <span>الشروط العامة والجزاءات</span>
            </div>
            <div class="clause-body">
              ${contract.generalConditions || "لا توجد شروط إضافية."}
            </div>
          </div>

          <div class="clause">
            <div class="clause-header">
              <span class="clause-number">البند السابع</span>
              <span>القانون الحاكم وتسوية المنازعات</span>
            </div>
            <div class="clause-body">
              ${contract.governingLaw || "يخضع هذا العقد للأنظمة والقوانين المعمول بها في المملكة العربية السعودية. في حال نشوء أي خلاف يتم حله ودياً، وإلا يحال للجهات القضائية المختصة."}
            </div>
          </div>

        </div>

        <div class="footer">
          <div class="footer-col" style="width: 30%;">
            <strong>معلومات الوثيقة</strong>
            <div>رقم العقد: ${contract.code}</div>
            <div>تاريخ الإصدار: ${contract.date}</div>
            <div>نسخة معتمدة وموثقة</div>
          </div>
          <div class="footer-col company-footer-info" style="width: 40%; text-align: center;">
            <strong>DETAILS Consulting Engineers</strong>
            <div>King Fahd Dist - RIYADH - Kingdom of Saudi Arabia</div>
            <div>POSTAL CODE: 12274 | Mobile: 0590722827</div>
            <div>N.N: 7052303828 | info@details-consults.sa</div>
          </div>
          <div class="footer-col" style="width: 30%; text-align: left;">
            <strong>التوقيعات</strong>
            <div>الطرف الأول: ........................</div>
            <div>الطرف الثاني: ........................</div>
          </div>
        </div>
      </div>

      <!-- PAGE 4: BACK COVER & SIGNATURES -->
      <div class="page">
        <div class="page-frame"></div>
        <div class="watermark">${watermarkText}</div>
        
        <div class="content" style="margin-top: 0;">
          <div class="clause">
            <div class="clause-header">
              <span class="clause-number">البند الثامن</span>
              <span>الخاتمة والتوقيعات</span>
            </div>
            <div class="clause-body">
              حرر هذا العقد من نسختين أصليتين، بيد كل طرف نسخة للعمل بموجبها. وبناءً عليه تم التوقيع:
            </div>
          </div>

          <div class="signatures-grid">
            <div class="signature-box">
              <div class="signature-title">الطرف الأول</div>
              <div style="font-weight: bold; margin-bottom: 5px;">${contract.partyA}</div>
              <div style="font-size: 10pt; color: #52677e;">الاسم: ${contract.partyADetails?.representant || ""}</div>
              <div class="signature-line">التوقيع / الختم</div>
            </div>
            <div class="signature-box">
              <div class="signature-title">الطرف الثاني</div>
              <div style="font-weight: bold; margin-bottom: 5px;">${contract.partyB || ".............................."}</div>
              <div style="font-size: 10pt; color: #52677e;">الاسم: ${contract.partyBDetails?.representant || ""}</div>
              <div class="signature-line">التوقيع / الختم</div>
            </div>
          </div>

          ${
            contract.witnesses &&
            contract.witnesses.length > 0 &&
            contract.witnesses[0].name
              ? `
            <div style="margin-top: 30px; font-weight: bold; color: #123B5D; border-bottom: 1px solid #e7eef2; padding-bottom: 5px;">الشهود:</div>
            <div class="witnesses-grid">
              ${contract.witnesses
                .map((w, i) =>
                  w.name
                    ? `
                <div class="signature-box" style="padding: 15px;">
                  <div class="signature-title" style="font-size: 10pt;">الشاهد ${i + 1}</div>
                  <div style="font-weight: bold; font-size: 10pt;">الاسم: ${w.name}</div>
                  <div style="font-size: 10pt; color: #52677e;">الهوية: ${w.id}</div>
                  <div class="signature-line" style="margin-top: 20px;">التوقيع</div>
                </div>
              `
                    : "",
                )
                .join("")}
            </div>
          `
              : ""
          }

          <div class="qr-section">
            ${
              contract.qrSettings?.enabled
                ? `
              <div class="qr-box">
                <img src="${qrImageUrl}" alt="ZATCA QR Code" />
                <div class="qr-label">رمز التحقق (ZATCA)</div>
              </div>
              ${
                projectQrUrl
                  ? `
                <div class="qr-box">
                  <img src="${projectQrUrl}" alt="Project Location QR" />
                  <div class="qr-label">موقع المشروع</div>
                </div>
              `
                  : ""
              }
            `
                : ""
            }
          </div>

          <div style="margin-top: 40px; text-align: center; font-size: 10pt; color: #71839a; padding: 15px; background: #fff; border: 1px solid #e7eef2; border-radius: 8px;">
            <strong>طريقة الاعتماد:</strong> 
            ${
              contract.approvalMethod === "platform"
                ? "تم الاعتماد عبر المنصة الرسمية (أبشر/نفاذ)"
                : contract.approvalMethod === "email"
                  ? "تم الاعتماد عبر البريد الإلكتروني الموثق"
                  : contract.approvalMethod === "whatsapp"
                    ? "تم الاعتماد عبر رسالة واتساب المعتمدة"
                    : "توقيع ورقي مباشر"
            }
            <br/>
            حالة العقد الحالية: <strong style="color: #083646;">${contract.status}</strong>
          </div>
        </div>
      </div>

      <!-- BACK COVER PAGE -->
      <div class="page back-cover-page">
        <div class="back-cover-frame"></div>
        ${bgImageBack}
        <div class="back-cover-brand"><img src="${companyLogoSrc}" alt="Details Logo" onerror="this.style.display='none'" /></div>
        
        <div class="contact-info-box">
          <h3>معلومات التواصل والدعم</h3>
          <div class="contact-details">
            <div>📧 ${contract.backCoverSettings?.contactEmail || "info@details-consults.sa"}</div>
            <div dir="ltr">📱 ${contract.backCoverSettings?.contactPhone || "0590722827"}</div>
            <div>📍 ${contract.backCoverSettings?.address || "King Fahd Dist - RIYADH - Kingdom of Saudi Arabia - POSTAL CODE: 12274"}</div>
          </div>
          ${contract.backCoverSettings?.additionalNotes ? `<div style="margin-top: 15px; font-size: 10pt; color: #71839a;">${contract.backCoverSettings.additionalNotes}</div>` : ""}
        </div>
      </div>

    </body>
    </html>
  `;
};
