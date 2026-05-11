// src/components/RiyadhDivision/tabs/components/StatsTab.jsx
import React from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../../../../../api/axios";
import { Loader2, AlertTriangle, FileText, Layers } from "lucide-react";

export default function StatsTab({ planNumber }) {
  const { data: realStats, isLoading: statsLoading } = useQuery({
    queryKey: ["plan-real-stats", planNumber],
    queryFn: async () => {
      const res = await api.get("/riyadh-streets/plans/stats/overview", {
        params: { planNumber },
      });
      return res.data;
    },
    enabled: !!planNumber,
  });

  if (statsLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-stone-500">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-3" />
        <p className="font-bold">جاري تحليل بيانات المخطط...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-10 animate-in fade-in custom-scrollbar">
      {/* 1. قسم البطاقات العلوية */}
      <div className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-blue-600" />
          <p className="text-sm font-bold text-blue-800">
            إحصائيات وتحليل البيانات المرتبطة بالمخطط رقم (
            {planNumber})
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white border border-stone-200 p-5 rounded-xl text-center shadow-sm">
            <span className="block text-[12px] font-bold text-stone-500 mb-2">
              القطع التي عليها نشاط
            </span>
            <span className="text-4xl font-black text-stone-800">
              {realStats?.plotsWithTransactions || 0}
            </span>
          </div>
          <div className="bg-white border border-stone-200 p-5 rounded-xl text-center shadow-sm">
            <span className="block text-[12px] font-bold text-stone-500 mb-2">
              إجمالي صكوك الملكية
            </span>
            <span className="text-4xl font-black text-emerald-600">
              {realStats?.propertiesCount || 0}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {[
            {
              label: "مكتملة",
              count: realStats?.statusCounts?.completed,
              color: "text-green-600",
              bg: "bg-green-50",
            },
            {
              label: "تحت الإجراء",
              count: realStats?.statusCounts?.pending,
              color: "text-blue-600",
              bg: "bg-blue-50",
            },
            {
              label: "مسودة",
              count: realStats?.statusCounts?.draft,
              color: "text-orange-500",
              bg: "bg-orange-50",
            },
            {
              label: "ملغاة",
              count: realStats?.statusCounts?.cancelled,
              color: "text-red-600",
              bg: "bg-red-50",
            },
          ].map((st, i) => (
            <div
              key={i}
              className={`${st.bg} border border-stone-100 p-4 rounded-xl text-center`}
            >
              <span className="block text-[11px] font-bold text-stone-600 mb-1">
                {st.label}
              </span>
              <span className={`text-xl font-black ${st.color}`}>
                {st.count || 0}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 🚀 2. جدول المعاملات المرتبطة */}
      <div className="space-y-4">
        <h4 className="text-[14px] font-black text-stone-800 flex items-center gap-2 px-1">
          <FileText size={18} className="text-blue-600" /> المعاملات المرتبطة
          بالمخطط
        </h4>
        <div className="border border-stone-200 rounded-2xl overflow-hidden bg-white shadow-sm">
          <table className="w-full text-right text-[11px]">
            <thead className="bg-stone-50 border-b border-stone-100 text-stone-500 font-bold">
              <tr>
                <th className="p-3">رقم المعاملة</th>
                <th className="p-3">اسم المعاملة / العميل</th>
                <th className="p-3 text-center">القطع</th>
                <th className="p-3 text-center">الحالة</th>
                <th className="p-3">تاريخ الإضافة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {realStats?.transactions?.map((tx) => (
                <tr
                  key={tx.id}
                  className="hover:bg-blue-50/30 transition-colors"
                >
                  <td className="p-3 font-mono font-bold text-blue-700">
                    {tx.transactionCode}
                  </td>
                  <td className="p-3">
                    <div className="font-black text-stone-800">{tx.title}</div>
                    <div className="text-[10px] text-stone-400">
                      {tx.client?.name?.ar || tx.client?.name}
                    </div>
                  </td>
                  <td className="p-3 text-center font-mono font-bold">
                    {Array.isArray(tx.plots)
                      ? tx.plots.join(", ")
                      : tx.plots || "-"}
                  </td>
                  <td className="p-3 text-center">
                    <span className="px-2 py-0.5 rounded-lg bg-stone-100 text-stone-600 font-bold border border-stone-200">
                      {tx.status}
                    </span>
                  </td>
                  <td className="p-3 text-stone-400 font-mono">
                    {new Date(tx.createdAt).toLocaleDateString("en-GB")}
                  </td>
                </tr>
              ))}
              {realStats?.transactions?.length === 0 && (
                <tr>
                  <td
                    colSpan="5"
                    className="p-8 text-center text-stone-400 font-bold italic"
                  >
                    لا توجد معاملات مسجلة لهذا المخطط
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🚀 3. جدول الملكيات المرتبطة */}
      <div className="space-y-4 pt-4">
        <h4 className="text-[14px] font-black text-stone-800 flex items-center gap-2 px-1">
          <Layers size={18} className="text-emerald-600" /> سجل الملكيات
          (الصكوك) المسجلة
        </h4>
        <div className="border border-stone-200 rounded-2xl overflow-hidden bg-white shadow-sm">
          <table className="w-full text-right text-[11px]">
            <thead className="bg-stone-50 border-b border-stone-100 text-stone-500 font-bold">
              <tr>
                <th className="p-3">رقم الصك</th>
                <th className="p-3">المالك المسجل</th>
                <th className="p-3 text-center">المساحة</th>
                <th className="p-3 text-center">الحالة</th>
                <th className="p-3">تاريخ التحديث</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {realStats?.properties?.map((prop) => (
                <tr
                  key={prop.id}
                  className="hover:bg-emerald-50/30 transition-colors"
                >
                  <td className="p-3 font-mono font-bold text-emerald-700">
                    {prop.deedNumber || "بدون صك"}
                  </td>
                  <td className="p-3 font-black text-stone-800">
                    {prop.client?.name?.ar || prop.client?.name}
                  </td>
                  <td className="p-3 text-center font-mono font-bold">
                    {prop.area ? `${prop.area} م²` : "-"}
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className={`px-2 py-0.5 rounded-lg font-bold border ${prop.status === "Active" ? "bg-green-50 text-green-700 border-green-100" : "bg-stone-100 text-stone-500"}`}
                    >
                      {prop.status === "Active" ? "نشط" : prop.status}
                    </span>
                  </td>
                  <td className="p-3 text-stone-400 font-mono">
                    {new Date(prop.updatedAt).toLocaleDateString("en-GB")}
                  </td>
                </tr>
              ))}
              {realStats?.properties?.length === 0 && (
                <tr>
                  <td
                    colSpan="5"
                    className="p-8 text-center text-stone-400 font-bold italic"
                  >
                    لا توجد ملكيات مرتبطة بهذا المخطط
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
