import React, { useState } from "react";
import TemplatesList from "./TemplatesList";
import AdvancedQuotationBuilder from "./AdvancedQuotationBuilder";

export default function QuotationTemplatesManager() {
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
    <div className="h-full min-h-0 w-full overflow-hidden bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white">
      {currentView === "LIST" ? (
        <TemplatesList onCreateNew={handleCreateNew} onEdit={handleEdit} />
      ) : (
        <AdvancedQuotationBuilder
          templateId={selectedTemplateId}
          onBack={handleBackToList}
        />
      )}
    </div>
  );
}
