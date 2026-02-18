import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getTransactions } from "../../api/transactionApi";
import {
  Search,
  Filter,
  Plus,
  FileText,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Building2,
} from "lucide-react";
import { format } from "date-fns";

// --- دالة مساعدة لمعالجة الاسم (الحل للمشكلة) ---
const getSafeName = (nameData) => {
  if (!nameData) return "غير محدد";
  if (typeof nameData === "string") return nameData;
  if (nameData.ar) return nameData.ar;
  if (typeof nameData === "object") {
    const { firstName, fatherName, grandFatherName, familyName } = nameData;
    return [firstName, fatherName, grandFatherName, familyName]
      .filter(Boolean)
      .join(" ");
  }
  return "اسم غير صالح";
};

// مكونات UI مساعدة (Badges)
const StatusBadge = ({ status }) => {
  const styles = {
    Draft: "bg-slate-100 text-slate-700 border-slate-300",
    Pending: "bg-amber-50 text-amber-700 border-amber-300",
    "In Progress": "bg-blue-50 text-blue-700 border-blue-300",
    Completed: "bg-emerald-50 text-emerald-700 border-emerald-300",
    Hold: "bg-red-50 text-red-700 border-red-300",
  };

  const labels = {
    Draft: "مسودة",
    Pending: "قيد الانتظار",
    "In Progress": "جاري العمل",
    Completed: "مكتملة",
    Hold: "معلقة",
  };

  return (
    <span
      className={`px-2 py-0.5 text-[10px] font-bold border rounded-full flex items-center gap-1 w-fit ${styles[status] || styles["Draft"]}`}
    >
      {status === "Completed" && <CheckCircle2 className="w-3 h-3" />}
      {status === "Pending" && <Clock className="w-3 h-3" />}
      {status === "Hold" && <AlertTriangle className="w-3 h-3" />}
      {labels[status] || status}
    </span>
  );
};

const TransactionsList = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["transactions", page, search, statusFilter],
    queryFn: () =>
      getTransactions({ page, limit: 10, search, status: statusFilter }),
    keepPreviousData: true,
  });

  const transactions = data?.data || [];
  const pagination = data?.pagination || {};

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative overflow-hidden">
      {/* Header Area */}
      <div className="flex flex-col bg-white border-b-2 border-blue-300 shrink-0">
        <div className="flex items-center justify-between gap-3 px-4 py-3 bg-gradient-to-l from-blue-50 to-purple-50 border-b border-blue-200">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center justify-center min-w-[48px] h-10 bg-blue-700 text-white text-lg font-bold rounded px-2 border-2 border-blue-800 shadow-sm">
              055
            </div>
            <div>
              <h1 className="text-xl font-bold text-blue-900">
                سجل المعاملات الرئيسي
              </h1>
              <p className="text-xs text-stone-600">
                إدارة ومتابعة كافة المعاملات الهندسية وحالاتها المالية والفنية
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => refetch()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-stone-300 rounded hover:bg-stone-50 transition-colors group"
            >
              <div
                className={`transition-transform duration-700 ${isLoading ? "animate-spin" : "group-hover:rotate-180"}`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-refresh-cw text-blue-600"
                >
                  <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
                  <path d="M21 3v5h-5"></path>
                  <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
                  <path d="M8 16H3v5"></path>
                </svg>
              </div>
              <span className="text-xs font-semibold text-stone-700">
                تحديث
              </span>
            </button>

            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white border border-blue-700 rounded hover:bg-blue-700 transition-colors shadow-sm">
              <Plus className="w-4 h-4" />
              <span className="text-xs font-bold">معاملة جديدة</span>
            </button>
          </div>
        </div>

        <div className="px-4 py-2 bg-white flex items-center justify-between gap-4">
          <div className="relative w-full max-w-md">
            <input
              type="text"
              placeholder="بحث برقم المعاملة، اسم العميل، رقم الصك..."
              className="w-full pl-4 pr-10 py-2 text-sm border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-400 transition-colors bg-slate-50 focus:bg-white"
              value={search}
              onChange={handleSearch}
            />
            <Search className="absolute right-3 top-2.5 w-4 h-4 text-slate-400" />
          </div>

          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
            {["All", "Pending", "In Progress", "Completed"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                  statusFilter === st
                    ? "bg-white text-blue-700 shadow-sm border border-slate-200"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {st === "All"
                  ? "الكل"
                  : st === "Pending"
                    ? "انتظار"
                    : st === "In Progress"
                      ? "جاري"
                      : "مكتمل"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto p-4">
        {/* Statistics Cards */}
        <div className="grid grid-cols-4 gap-4 mb-4">
          {/* ... (نفس البطاقات السابقة) ... */}
          <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-bold">
                إجمالي المعاملات
              </p>
              <p className="text-lg font-bold text-slate-800">
                {pagination.total || 0}
              </p>
            </div>
          </div>
          {/* ... */}
        </div>

        {/* The Data Table */}
        <div className="bg-white border-2 border-slate-200 rounded-lg shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-10 flex flex-col items-center justify-center text-slate-400">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
              <p className="text-xs">جاري تحميل البيانات...</p>
            </div>
          ) : isError ? (
            <div className="p-10 flex flex-col items-center justify-center text-red-500">
              <XCircle className="w-8 h-8 mb-2" />
              <p className="text-xs font-bold">حدث خطأ أثناء تحميل البيانات</p>
              <button
                onClick={() => refetch()}
                className="mt-2 text-xs underline"
              >
                حاول مرة أخرى
              </button>
            </div>
          ) : (
            <table className="w-full text-right">
              <thead>
                <tr className="bg-slate-50 border-b-2 border-slate-200 text-[11px] text-slate-600 font-bold">
                  <th className="px-4 py-3">رقم المعاملة</th>
                  <th className="px-4 py-3">نوع الخدمة</th>
                  <th className="px-4 py-3">العميل</th>
                  <th className="px-4 py-3">تاريخ الورود</th>
                  <th className="px-4 py-3 text-center">الإنجاز</th>
                  <th className="px-4 py-3">الحالة</th>
                  <th className="px-4 py-3">المالية (ريال)</th>
                  <th className="px-4 py-3">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.length === 0 ? (
                  <tr>
                    <td
                      colSpan="8"
                      className="px-4 py-8 text-center text-slate-400 text-sm"
                    >
                      لا توجد معاملات مطابقة للبحث
                    </td>
                  </tr>
                ) : (
                  transactions.map((trx) => (
                    <tr
                      key={trx.id}
                      className="hover:bg-blue-50/50 transition-colors group text-xs text-slate-700"
                    >
                      <td className="px-4 py-3 font-mono font-bold text-blue-700">
                        {trx.code}
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <div className="p-1 bg-indigo-50 text-indigo-600 rounded">
                            <Building2 className="w-3.5 h-3.5" />
                          </div>
                          <span className="font-semibold">{trx.type}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5 pr-6 truncate max-w-[150px]">
                          {trx.title}
                        </div>
                      </td>

                      {/* ✅ التصحيح: استخدام الدالة لعرض الاسم بأمان */}
                      <td className="px-4 py-3">
                        <div
                          className="font-bold text-slate-800"
                          title={
                            typeof trx.clientName === "string"
                              ? trx.clientName
                              : ""
                          }
                        >
                          {getSafeName(trx.clientName)}
                        </div>
                        <div
                          className="text-[10px] text-slate-500 font-mono"
                          dir="ltr"
                        >
                          {trx.clientMobile}
                        </div>
                      </td>

                      <td className="px-4 py-3 font-mono text-slate-500">
                        {trx.date
                          ? format(new Date(trx.date), "yyyy/MM/dd")
                          : "-"}
                      </td>

                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="relative w-10 h-10">
                            <svg className="w-full h-full transform -rotate-90">
                              <circle
                                cx="20"
                                cy="20"
                                r="16"
                                fill="transparent"
                                stroke="#e2e8f0"
                                strokeWidth="4"
                              />
                              <circle
                                cx="20"
                                cy="20"
                                r="16"
                                fill="transparent"
                                stroke={
                                  trx.progress === 100 ? "#10b981" : "#3b82f6"
                                }
                                strokeWidth="4"
                                strokeDasharray={`${trx.progress} 100`}
                              />
                            </svg>
                            <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[10px] font-bold">
                              {trx.progress}%
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <StatusBadge status={trx.status} />
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-0.5">
                          <div className="flex justify-between w-32 text-[10px]">
                            <span className="text-slate-500">الإجمالي:</span>
                            <span className="font-bold">
                              {trx.amount?.toLocaleString() || 0}
                            </span>
                          </div>
                          <div className="w-32 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-500"
                              style={{
                                width: `${(trx.paid / (trx.amount || 1)) * 100}%`,
                              }}
                            ></div>
                          </div>
                          <div className="flex justify-between w-32 text-[9px]">
                            <span className="text-green-600 font-bold">
                              {trx.paid?.toLocaleString() || 0} مدفوع
                            </span>
                            <span className="text-red-500 font-bold">
                              {trx.remaining?.toLocaleString() || 0} متبقي
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <button className="p-1.5 rounded hover:bg-slate-200 text-slate-500 hover:text-blue-600 transition-colors">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {/* Pagination */}
          <div className="bg-slate-50 border-t border-slate-200 px-4 py-3 flex items-center justify-between">
            <div className="text-xs text-slate-500">
              عرض <strong>{transactions.length}</strong> من أصل{" "}
              <strong>{pagination.total}</strong> معاملة
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <div className="px-3 py-1 bg-white border border-slate-300 rounded text-xs font-bold">
                صفحة {page} من {pagination.pages}
              </div>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= pagination.pages}
                className="p-1.5 rounded border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionsList;
