import React from "react";
import { ReportProvider } from "./context/ReportContext";
import BuilderHeader from "./components/layout/BuilderHeader";
import BuilderSidebar from "./components/layout/BuilderSidebar";
import BuilderFormArea from "./components/layout/BuilderFormArea";
import BuilderPreview from "./components/layout/BuilderPreview";

// 🚨 إضافة existingReportId هنا
export default function TechnicalReportBuilder({ onClose, existingReportId }) {
  return (
    // 🚨 تمرير existingReportId للـ Provider
    <ReportProvider existingReportId={existingReportId}>
      <div className="h-full w-full flex items-center justify-center p-0 md:p-4 bg-slate-100/50 animate-in fade-in" dir="rtl">
        <div className="bg-slate-100 w-full max-w-[1600px] h-full rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden border border-slate-200 relative">
          
          <div className="w-full md:w-[650px] bg-white flex flex-col shadow-2xl z-10 border-l border-slate-200 shrink-0 print:hidden">
            <BuilderHeader onClose={onClose} />
            <div className="flex-1 flex min-h-0 overflow-hidden">
              <BuilderSidebar />
              <BuilderFormArea />
            </div>
          </div>

          <BuilderPreview />

        </div>

        <style dangerouslySetContent={{__html: `
          @media print {
            body * { visibility: hidden; }
            .print\\:bg-white, .print\\:bg-white * { visibility: visible; }
            .print\\:bg-white { position: absolute; left: 0; top: 0; right: 0; width: 100%; margin: 0; padding: 0; background: white !important; }
            .print\\:hidden { display: none !important; }
          }
        `}} />
      </div>
    </ReportProvider>
  );
}