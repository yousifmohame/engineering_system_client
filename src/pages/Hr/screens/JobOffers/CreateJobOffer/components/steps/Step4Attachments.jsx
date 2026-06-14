// src/pages/Hr/screens/JobOffers/CreateJobOffer/components/steps/Step4Attachments.jsx
import React from "react";

export default function Step4Attachments({ handleFileChange }) {
  return (
    <div className="space-y-5">
      <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
        <label className="block text-sm font-black text-emerald-800 mb-2">السيرة الذاتية (CV)</label>
        <p className="text-[10px] text-emerald-600 mb-3 font-bold">ستُحفظ بملف الموظف عند قبوله العرض.</p>
        <input 
          type="file" 
          name="cvFile" 
          accept=".pdf,.doc,.docx" 
          onChange={handleFileChange} 
          className="w-full text-xs file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 cursor-pointer" 
        />
      </div>
      <div className="border border-slate-200 p-4 rounded-xl">
        <label className="block text-sm font-black text-[#123f59] mb-2">الغلاف الأمامي المخصص (اختياري)</label>
        <input type="file" name="frontCover" accept="image/*" onChange={handleFileChange} className="w-full text-xs" />
      </div>
      <div className="border border-slate-200 p-4 rounded-xl">
        <label className="block text-sm font-black text-[#123f59] mb-2">الغلاف الخلفي المخصص (اختياري)</label>
        <input type="file" name="backCover" accept="image/*" onChange={handleFileChange} className="w-full text-xs" />
      </div>
    </div>
  );
}