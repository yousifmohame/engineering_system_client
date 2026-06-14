// src/pages/Hr/screens/JobOffers/CreateJobOffer/components/steps/Step2Financials.jsx
import React from "react";

export default function Step2Financials({ formData, handleInputChange }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-black text-[#123f59] mb-1.5">المسمى الوظيفي المقترح *</label>
        <input 
          type="text" 
          name="jobTitle" 
          value={formData.jobTitle} 
          onChange={handleInputChange} 
          className="w-full border border-gray-300 rounded-xl p-2.5 text-sm focus:border-[#c5983c] focus:ring-1 focus:ring-[#c5983c] outline-none" 
          placeholder="مثال: مهندس معماري" 
        />
      </div>
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
        <div>
          <label className="block text-xs font-black text-[#123f59] mb-1.5">الراتب الأساسي (ر.س) *</label>
          <input 
            type="number" 
            name="basicSalary" 
            value={formData.basicSalary} 
            onChange={handleInputChange} 
            className="w-full border border-gray-300 rounded-xl p-2.5 text-sm focus:border-[#c5983c] focus:ring-1 focus:ring-[#c5983c] outline-none" 
            placeholder="5000" 
          />
        </div>
        <div>
          <label className="block text-xs font-black text-[#123f59] mb-1.5">بدل السكن (ر.س)</label>
          <input 
            type="number" 
            name="housingAllowance" 
            value={formData.housingAllowance} 
            onChange={handleInputChange} 
            className="w-full border border-gray-300 rounded-xl p-2.5 text-sm focus:border-[#c5983c] focus:ring-1 focus:ring-[#c5983c] outline-none" 
            placeholder="1000" 
          />
        </div>
        <div>
          <label className="block text-xs font-black text-[#123f59] mb-1.5">بدل النقل (ر.س)</label>
          <input 
            type="number" 
            name="transportAllowance" 
            value={formData.transportAllowance} 
            onChange={handleInputChange} 
            className="w-full border border-gray-300 rounded-xl p-2.5 text-sm focus:border-[#c5983c] focus:ring-1 focus:ring-[#c5983c] outline-none" 
            placeholder="500" 
          />
        </div>
      </div>
    </div>
  );
}