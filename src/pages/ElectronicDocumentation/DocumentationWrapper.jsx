import React, { useState } from "react";
import { ShieldCheck, FilePlus2 } from "lucide-react";
import DocumentationDashboard from "./DocumentationDashboard";
import NewDocumentationModal from "./tabs/NewDocumentationModal"; // 👈 استيراد المودال الجديد

export default function DocumentationWrapper() {
  const [isNewDocOpen, setIsNewDocOpen] = useState(false); // حالة فتح مودال التوثيق الجديد

  return (
    <div
      className="flex h-full w-full bg-slate-50 overflow-hidden font-cairo"
      dir="rtl"
    >
      <div className="flex-1 flex flex-col min-w-0 bg-white shadow-xl m-3 rounded-3xl border border-slate-200 overflow-hidden relative">
        {/* هيدر النظام */}
        <div className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between shadow-sm z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-800">
                التوثيق الإلكتروني الآمن
              </h1>
            </div>
          </div>
          <button
            onClick={() => setIsNewDocOpen(true)} // 👈 فتح المودال عند الضغط
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-blue-600 text-white rounded-xl text-xs font-black transition-all"
          >
            <FilePlus2 className="w-4 h-4" /> توثيق مستند جديد
          </button>
        </div>

        {/* محتوى الدشبورد */}
        <div className="flex-1 relative h-full overflow-y-auto bg-slate-50/30">
          <DocumentationDashboard />
        </div>
      </div>

      {/* استدعاء المودال (يظهر فوق كل شيء) */}
      <NewDocumentationModal
        isOpen={isNewDocOpen}
        onClose={() => setIsNewDocOpen(false)}
        onSuccess={() => console.log("تم الاعتماد، يمكنك تحديث الجداول هنا")}
      />
    </div>
  );
}
