import React from "react";
import { Camera, Trash2 } from "lucide-react";

export default function PhotosStep() {
  return (
    <div className="space-y-4 animate-in fade-in">
      <h3 className="text-sm font-black text-slate-800 border-b pb-2">الصور والمرفقات</h3>
      <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:bg-slate-50 transition cursor-pointer">
        <Camera className="w-8 h-8 text-slate-300 mx-auto mb-2" />
        <p className="text-xs font-bold text-slate-500">انقر هنا لاختيار صور من جهازك أو سحبها من ملفات المعاملة</p>
      </div>
    </div>
  );
}