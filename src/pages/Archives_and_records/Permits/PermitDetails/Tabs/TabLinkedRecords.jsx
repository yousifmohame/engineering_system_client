import React from "react";
import {
  Save,
  Loader2,
  Link,
  Briefcase,
  User,
  Building,
  FileSignature,
} from "lucide-react";
import { SearchableDropdown } from "../utils";

export function TabLinkedRecords({
  permit,
  localLinks,
  setLocalLinks,
  linkingMode,
  setLinkingMode,
  selectedValue,
  setSelectedValue,
  handleSaveLink,
  handleUnlink,
  getOptions,
  linkMutation,
  autoLinkedTransactions,
  loadingAuto,
  clients,
  offices,
  ownerships,
  privateTransactions,
}) {
  return (
    <div className="p-5 animate-in fade-in space-y-6">
      {/* القسم الأول: الربط التلقائي */}
      <div className="space-y-4">
        <h4 className="text-[12px] font-black text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
          <FileSignature size={16} className="text-[#0f3d50]" /> المعاملات
          المرتبطة تلقائياً (تطابق رقم الرخصة)
        </h4>

        {loadingAuto ? (
          <div className="flex justify-center p-6 text-[#0f3d50]">
            <Loader2 className="animate-spin w-6 h-6" />
          </div>
        ) : autoLinkedTransactions.length > 0 ? (
          <div className="grid grid-cols-1 gap-3">
            {autoLinkedTransactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-3 border border-slate-200 rounded-xl bg-white shadow-sm hover:border-[#d7b96d] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-[#f4f7f8] p-2.5 rounded-lg text-[#123B5D]">
                    <FileSignature size={18} />
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-800">
                      معاملة رقم: {tx.ref || tx.id}
                    </div>
                    <div className="text-[10px] font-bold text-slate-500 mt-0.5">
                      {tx.status || "نشطة"} • {tx.clientName || tx.client}
                    </div>
                  </div>
                </div>
                <button className="text-[10px] font-bold text-[#123B5D] hover:text-white hover:bg-[#0f3d50] bg-[#f4f7f8] px-4 py-2 rounded-lg transition-colors">
                  عرض المعاملة
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-6 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-slate-400">
            <span className="text-[11px] font-bold">
              لم يتم العثور على أي معاملات متطابقة تلقائياً.
            </span>
          </div>
        )}
      </div>

      {/* القسم الثاني: السجلات المرتبطة يدوياً */}
      <div className="space-y-4">
        <h4 className="text-[12px] font-black text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2 mt-6">
          <Link size={16} className="text-emerald-500" /> السجلات المرتبطة
          يدوياً
        </h4>

        {/* 💡 أزرار إضافة ارتباط جديد (نفس تصميم الهيدر) */}
        <div className="bg-white p-4 border border-slate-200 rounded-xl shadow-sm mb-4">
          <div className="flex flex-wrap gap-2">
            {!localLinks.linkedClientId && (
              <button
                onClick={() => {
                  setLinkingMode("client");
                  setSelectedValue("");
                }}
                className={`flex-1 min-w-[120px] p-3 border rounded-xl flex flex-col items-center gap-2 transition-all ${linkingMode === "client" ? "border-[#d7b96d] bg-[#f4f7f8] text-[#123B5D] shadow-md scale-105" : "border-slate-200 bg-slate-50 text-slate-600 hover:border-[#d7b96d] hover:bg-white"}`}
              >
                <User size={20} />{" "}
                <span className="text-[10px] font-black">ربط بعميل</span>
              </button>
            )}
            {!localLinks.linkedOfficeId && (
              <button
                onClick={() => {
                  setLinkingMode("office");
                  setSelectedValue("");
                }}
                className={`flex-1 min-w-[120px] p-3 border rounded-xl flex flex-col items-center gap-2 transition-all ${linkingMode === "office" ? "border-[#d7b96d] bg-[#f4f7f8] text-[#123B5D] shadow-md scale-105" : "border-slate-200 bg-slate-50 text-slate-600 hover:border-[#d7b96d] hover:bg-white"}`}
              >
                <Briefcase size={20} />{" "}
                <span className="text-[10px] font-black">ربط بمكتب</span>
              </button>
            )}
            {!localLinks.linkedOwnershipId && (
              <button
                onClick={() => {
                  setLinkingMode("ownership");
                  setSelectedValue("");
                }}
                className={`flex-1 min-w-[120px] p-3 border rounded-xl flex flex-col items-center gap-2 transition-all ${linkingMode === "ownership" ? "border-[#d7b96d] bg-[#f4f7f8] text-[#123B5D] shadow-md scale-105" : "border-slate-200 bg-slate-50 text-slate-600 hover:border-[#d7b96d] hover:bg-white"}`}
              >
                <Building size={20} />{" "}
                <span className="text-[10px] font-black">ربط بملكية</span>
              </button>
            )}
            {!localLinks.linkedTransactionId && (
              <button
                onClick={() => {
                  setLinkingMode("privateTransaction");
                  setSelectedValue("");
                }}
                className={`flex-1 min-w-[120px] p-3 border rounded-xl flex flex-col items-center gap-2 transition-all ${linkingMode === "privateTransaction" ? "border-[#d7b96d] bg-[#f4f7f8] text-[#123B5D] shadow-md scale-105" : "border-slate-200 bg-slate-50 text-slate-600 hover:border-[#d7b96d] hover:bg-white"}`}
              >
                <FileSignature size={20} />{" "}
                <span className="text-[10px] font-black">
                  ربط بمعاملة (ن. فرعي)
                </span>
              </button>
            )}
            <button className="flex-1 min-w-[120px] p-3 border border-slate-200 bg-slate-50 text-slate-400 rounded-xl flex flex-col items-center gap-2 opacity-50 cursor-not-allowed">
              <FileSignature size={20} />{" "}
              <span className="text-[10px] font-black">
                معاملة (رئيسي) - قريباً
              </span>
            </button>
          </div>

          {/* 💡 منطقة البحث العائمة (تظهر عند تحديد نوع الربط) */}
          {linkingMode && (
            <div className="mt-4 p-4 bg-[#f4f7f8]/50 border border-[#e8dcc8] rounded-xl flex flex-col md:flex-row items-center gap-3 animate-in slide-in-from-top-2">
              <div className="flex-1 w-full">
                <SearchableDropdown
                  options={getOptions(linkingMode)}
                  value={selectedValue}
                  onChange={(val) => setSelectedValue(val)}
                  placeholder={`ابحث واختر ${linkingMode === "client" ? "العميل" : linkingMode === "office" ? "المكتب" : linkingMode === "ownership" ? "الملكية" : "المعاملة"}...`}
                />
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <button
                  onClick={handleSaveLink}
                  disabled={linkMutation.isPending}
                  className="flex-1 md:flex-none px-6 py-2.5 bg-[#0f3d50] text-white text-[11px] font-black rounded-xl hover:bg-[#174e65] shadow-md transition-colors flex items-center justify-center gap-2"
                >
                  {linkMutation.isPending ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Save size={14} />
                  )}{" "}
                  تأكيد الربط
                </button>
                <button
                  onClick={() => setLinkingMode(null)}
                  className="px-4 py-2.5 bg-white text-slate-500 border border-slate-200 text-[11px] font-black rounded-xl hover:bg-slate-50 transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 💡 السجلات المرتبطة بالفعل */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
          {localLinks.linkedClientId && (
            <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 p-3 rounded-xl shadow-sm">
              <span className="text-[11px] font-bold text-emerald-800 flex items-center gap-2">
                <User size={14} /> عميل:{" "}
                {clients.find((c) => c.id === localLinks.linkedClientId)
                  ?.name || "مسجل"}
              </span>
              <button
                onClick={() => handleUnlink("linkedClientId")}
                className="text-[10px] font-black text-red-500 hover:underline"
              >
                إلغاء الربط
              </button>
            </div>
          )}
          {localLinks.linkedOfficeId && (
            <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 p-3 rounded-xl shadow-sm">
              <span className="text-[11px] font-bold text-emerald-800 flex items-center gap-2">
                <Briefcase size={14} /> مكتب:{" "}
                {offices.find((o) => o.id === localLinks.linkedOfficeId)
                  ?.nameAr || "مسجل"}
              </span>
              <button
                onClick={() => handleUnlink("linkedOfficeId")}
                className="text-[10px] font-black text-red-500 hover:underline"
              >
                إلغاء الربط
              </button>
            </div>
          )}
          {localLinks.linkedOwnershipId && (
            <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 p-3 rounded-xl shadow-sm">
              <span className="text-[11px] font-bold text-emerald-800 flex items-center gap-2">
                <Building size={14} /> صك:{" "}
                {ownerships.find((o) => o.id === localLinks.linkedOwnershipId)
                  ?.deedNumber || "مسجل"}
              </span>
              <button
                onClick={() => handleUnlink("linkedOwnershipId")}
                className="text-[10px] font-black text-red-500 hover:underline"
              >
                إلغاء الربط
              </button>
            </div>
          )}
          {localLinks.linkedTransactionId && (
            <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 p-3 rounded-xl shadow-sm">
              <span className="text-[11px] font-bold text-emerald-800 flex items-center gap-2">
                <FileSignature size={14} /> معاملة:{" "}
                {privateTransactions.find(
                  (t) => t.id === localLinks.linkedTransactionId,
                )?.ref || "مسجل"}
              </span>
              <button
                onClick={() => handleUnlink("linkedTransactionId")}
                className="text-[10px] font-black text-red-500 hover:underline"
              >
                إلغاء الربط
              </button>
            </div>
          )}

          {!localLinks.linkedClientId &&
            !localLinks.linkedOfficeId &&
            !localLinks.linkedOwnershipId &&
            !localLinks.linkedTransactionId && (
              <div className="col-span-1 md:col-span-2 text-center p-6 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-slate-400">
                <span className="text-[11px] font-bold">
                  لا توجد سجلات مرتبطة يدوياً. استخدم الأزرار أعلاه لربط سجل
                  جديد.
                </span>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
