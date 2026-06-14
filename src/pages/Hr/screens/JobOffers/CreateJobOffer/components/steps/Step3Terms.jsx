// src/pages/Hr/screens/JobOffers/CreateJobOffer/components/steps/Step3Terms.jsx
import React from "react";

export default function Step3Terms({ formData, handleInputChange }) {
  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex-1 flex flex-col">
        <label className="block text-xs font-black text-[#123f59] mb-1.5">المقدمة الافتتاحية</label>
        <textarea 
          name="introduction" 
          value={formData.introduction} 
          onChange={handleInputChange} 
          className="w-full flex-1 border border-gray-300 rounded-xl p-3 text-sm focus:border-[#c5983c] focus:ring-1 focus:ring-[#c5983c] outline-none leading-relaxed resize-none min-h-[120px]" 
        />
      </div>
      <div className="flex-1 flex flex-col">
        <label className="block text-xs font-black text-[#123f59] mb-1.5">الشروط والأحكام</label>
        <textarea 
          name="conditions" 
          value={formData.conditions} 
          onChange={handleInputChange} 
          className="w-full flex-1 border border-gray-300 rounded-xl p-3 text-sm focus:border-[#c5983c] focus:ring-1 focus:ring-[#c5983c] outline-none leading-relaxed resize-none min-h-[150px]" 
        />
      </div>
    </div>
  );
}