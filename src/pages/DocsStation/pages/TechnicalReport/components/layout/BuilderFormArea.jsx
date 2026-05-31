import React from "react";
import { useReport } from "../../context/ReportContext";
import { Cpu, TriangleAlert } from "lucide-react";

// استيراد كافة الخطوات
import LinkingStep from "../steps/LinkingStep";
import TemplatesStep from "../steps/TemplatesStep";
import OwnerStep from "../steps/OwnerStep";
import PropertyStep from "../steps/PropertyStep";
import LicenseStep from "../steps/LicenseStep";
import AreasStep from "../steps/AreasStep";
import ComponentsStep from "../steps/ComponentsStep";
import SetbacksStep from "../steps/SetbacksStep";
import ComplianceStep from "../steps/ComplianceStep";
import PhotosStep from "../steps/PhotosStep";
import SettingsStep from "../steps/SettingsStep";
import PrintStep from "../steps/PrintStep";
import CompareStep from "../steps/CompareStep";
import ReviewStep from "../steps/ReviewStep";

export default function BuilderFormArea() {
  const { activeStep } = useReport();

  const renderStep = () => {
    switch (activeStep) {
      case "LINKING": return <LinkingStep />;
      case "TEMPLATES": return <TemplatesStep />;
      case "OWNER": return <OwnerStep />;
      case "PROPERTY": return <PropertyStep />;
      case "LICENSE": return <LicenseStep />;
      case "AREAS": return <AreasStep />;
      case "COMPONENTS": return <ComponentsStep />;
      case "SETBACKS": return <SetbacksStep />;
      case "COMPLIANCE": return <ComplianceStep />;
      case "PHOTOS": return <PhotosStep />;
      case "SETTINGS": return <SettingsStep />;
      case "PRINT": return <PrintStep />;
      case "COMPARE": return <CompareStep />;
      case "REVIEW": return <ReviewStep />;
      default: return <div className="p-4 text-center text-slate-400 font-bold"><TriangleAlert className="inline w-4 h-4 mr-2"/>قيد التطوير</div>;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-5 bg-white relative">
      <button className="absolute top-2 left-2 p-1.5 bg-indigo-50 text-indigo-500 rounded hover:bg-indigo-100 transition">
        <Cpu className="w-4 h-4" />
      </button>
      {renderStep()}
    </div>
  );
}