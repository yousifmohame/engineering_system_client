import React from "react";
import { Vault, X, Paperclip } from "lucide-react";

const TransactionDetailsModal = ({ transaction, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 animate-in fade-in" dir="rtl" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="bg-slate-800 p-4 text-white flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Vault className="w-5 h-5 text-yellow-500" />
            <h3 className="font-bold text-sm">مستند قيد مالي رقم: {transaction.transactionNo}</h3>
          </div>
          <X className="w-5 h-5 cursor-pointer text-gray-400 hover:text-white" onClick={onClose} />
        </div>
        
        <div className="p-6 space-y-4">
          <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border">
            <span className="text-gray-500 text-xs font-bold">المبلغ</span>
            <span className={`font-mono text-xl font-black ${transaction.direction === 'INBOUND' ? 'text-green-600' : 'text-red-600'}`}>
                {transaction.direction === 'INBOUND' ? "+" : "-"}{Number(transaction.amount).toLocaleString()} SAR
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="border-b pb-2">
              <span className="text-gray-400 block mb-1">النوع</span>
              <span className="font-bold text-gray-800">{transaction.transactionType}</span>
            </div>
            <div className="border-b pb-2">
              <span className="text-gray-400 block mb-1">التاريخ</span>
              <span className="font-mono font-bold text-gray-800">{new Date(transaction.transactionDate).toLocaleDateString("en-GB")}</span>
            </div>
            <div className="col-span-2 border-b pb-2">
              <span className="text-gray-400 block mb-1">البيان الوصفي</span>
              <span className="font-bold text-gray-800 leading-relaxed">{transaction.description}</span>
            </div>
            <div className="border-b pb-2">
              <span className="text-gray-400 block mb-1">الحالة</span>
              <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${transaction.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {transaction.status === 'APPROVED' ? 'معتمد ومرحل' : 'ملغى (تم عكسه)'}
              </span>
            </div>
          </div>

          {transaction.attachmentIds && transaction.attachmentIds.length > 0 && (
            <div className="pt-2">
              <span className="text-gray-400 text-xs block mb-2 font-bold">المرفقات الرقمية</span>
              {transaction.attachmentIds.map((link, i) => (
                <a key={i} href={link} target="_blank" rel="noreferrer" className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-100 rounded text-blue-600 hover:bg-blue-100 text-xs font-bold w-fit">
                  <Paperclip className="w-3.5 h-3.5" /> عرض المستند المرفق
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionDetailsModal;