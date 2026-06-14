// src/pages/Hr/screens/JobOffers/CreateJobOffer/components/steps/Step1BasicInfo.jsx
import React from "react";

export default function Step1BasicInfo({ formData, handleInputChange }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-black text-[#123f59] mb-1.5">اسم المرشح كاملاً *</label>
        <input 
          type="text" 
          name="candidateName" 
          value={formData.candidateName} 
          onChange={handleInputChange} 
          className="w-full border border-gray-300 rounded-xl p-2.5 text-sm focus:border-[#c5983c] focus:ring-1 focus:ring-[#c5983c] outline-none" 
          placeholder="أحمد محمد..." 
        />
      </div>
      <div>
        <label className="block text-xs font-black text-[#123f59] mb-1.5">رقم الجوال</label>
        <input 
          type="text" 
          name="candidatePhone" 
          value={formData.candidatePhone} 
          onChange={handleInputChange} 
          className="w-full border border-gray-300 rounded-xl p-2.5 text-sm focus:border-[#c5983c] focus:ring-1 focus:ring-[#c5983c] outline-none text-left" 
          dir="ltr" 
          placeholder="0500000000" 
        />
      </div>
      <div>
        <label className="block text-xs font-black text-[#123f59] mb-1.5">البريد الإلكتروني</label>
        <input 
          type="email" 
          name="candidateEmail" 
          value={formData.candidateEmail} 
          onChange={handleInputChange} 
          className="w-full border border-gray-300 rounded-xl p-2.5 text-sm focus:border-[#c5983c] focus:ring-1 focus:ring-[#c5983c] outline-none text-left" 
          dir="ltr" 
          placeholder="email@example.com" 
        />
      </div>
    </div>
  );
}