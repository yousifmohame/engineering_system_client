import React, { useState } from "react";
import { useReport } from "../../context/ReportContext";
import { ArrowRightLeft, Search, Loader2, CheckCircle2, FolderOpen } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import api from "../../../../../../api/axios"; // تأكد من مسار الأكسيوس

export default function LinkingStep() {
  const { data, updateData, selectedTransaction, setSelectedTransaction } = useReport();
  const [search, setSearch] = useState("");

  // جلب المعاملات من الباك-إند
  const { data: transactions, isLoading } = useQuery({
    queryKey: ["transactions-search", search],
    queryFn: async () => {
      const res = await api.get("/private-transactions", { params: { search } });
      return res.data?.data || res.data || [];
    },
  });

  const handleSelectTransaction = (txn) => {
    setSelectedTransaction(txn.id);
    updateData("transactionNumber", txn.referenceNumber || txn.ref || "---");
    updateData("transactionType", txn.transactionType?.name || "معاملة هندسية");
    // إذا كانت المعاملة مرتبطة بعميل، يمكننا تعبئة اسمه مبدئياً
    if (txn.client) updateData("ownerName", txn.client.name || txn.client.firstNameAr);
  };

  return (
    <div className="space-y-4 animate-in fade-in flex flex-col h-full">
      <h3 className="text-sm font-black text-slate-800 border-b pb-2 flex items-center gap-2">
        <FolderOpen className="w-4 h-4 text-emerald-600" /> الربط بمعاملة النظام
      </h3>
      
      {/* صندوق البحث */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="بحث برقم المعاملة، الوصف، أو العميل..."
          className="w-full py-2 pr-9 pl-3 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200 bg-slate-50 font-bold"
        />
      </div>

      {/* قائمة النتائج */}
      <div className="flex-1 overflow-y-auto custom-scrollbar border border-slate-100 rounded-xl p-2 bg-slate-50/50">
        {isLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 text-emerald-500 animate-spin" /></div>
        ) : transactions?.length > 0 ? (
          transactions.map((txn) => {
            const isSelected = selectedTransaction === txn.id;
            return (
              <div
                key={txn.id}
                onClick={() => handleSelectTransaction(txn)}
                className={`flex justify-between items-center p-3 mb-2 rounded-xl cursor-pointer border transition-all ${
                  isSelected ? "border-emerald-500 bg-emerald-50 shadow-sm" : "border-slate-200 bg-white hover:border-emerald-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  {isSelected ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <div className="w-5 h-5 rounded-full border-2 border-slate-200" />}
                  <div>
                    <span className={`font-black text-xs block ${isSelected ? "text-emerald-800" : "text-slate-700"}`}>
                      {txn.client?.name || txn.description || "معاملة بدون وصف"}
                    </span>
                    <span className="text-[10px] text-slate-500 font-bold mt-0.5 block">{txn.transactionType?.name || "معاملة عامة"}</span>
                  </div>
                </div>
                <span className="font-mono text-[10px] text-slate-600 px-2 py-1 rounded border border-slate-200 bg-white font-bold">
                  {txn.referenceNumber || txn.ref}
                </span>
              </div>
            );
          })
        ) : (
          <div className="text-xs text-slate-400 text-center py-8 font-bold">لا توجد معاملات مطابقة للبحث</div>
        )}
      </div>

      {/* تفاصيل المعاملة المحددة */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 shrink-0 mt-auto">
        <div className="grid grid-cols-2 gap-y-3 text-xs">
          <div><span className="text-emerald-600/70 block mb-1 font-bold">رقم المعاملة:</span><span className="font-mono font-black text-emerald-900">{data.transactionNumber}</span></div>
          <div><span className="text-emerald-600/70 block mb-1 font-bold">نوع المعاملة:</span><span className="font-black text-emerald-900">{data.transactionType}</span></div>
          <div><span className="text-emerald-600/70 block mb-1 font-bold">العميل المربوط:</span><span className="font-black text-emerald-900">{data.ownerName || "غير محدد"}</span></div>
          <div><span className="text-emerald-600/70 block mb-1 font-bold">حالة الإجراء:</span><span className="font-black text-emerald-600">{data.transactionStatus}</span></div>
        </div>
      </div>
    </div>
  );
}