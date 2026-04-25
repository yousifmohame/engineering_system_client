import React, { useState } from "react";
import TemplatesList from "./TemplatesList";
import AdvancedQuotationBuilder from "./AdvancedQuotationBuilder";

export default function QuotationTemplatesManager() {
  // الحالات الممكنة: 'LIST', 'BUILDER'
  const [currentView, setCurrentView] = useState("LIST");
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);

  const handleCreateNew = () => {
    setSelectedTemplateId(null);
    setCurrentView("BUILDER");
  };

  const handleEdit = (id) => {
    setSelectedTemplateId(id);
    setCurrentView("BUILDER");
  };

  const handleBackToList = () => {
    setCurrentView("LIST");
    setSelectedTemplateId(null);
  };

  return (
    <div className="h-full w-full bg-slate-50">
      {currentView === "LIST" ? (
        <TemplatesList 
          onCreateNew={handleCreateNew} 
          onEdit={handleEdit} 
        />
      ) : (
        <AdvancedQuotationBuilder 
          templateId={selectedTemplateId} 
          onBack={handleBackToList} 
        />
      )}
    </div>
  );
}