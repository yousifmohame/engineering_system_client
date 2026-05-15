import React from "react";
import {
  Plus,
  Check,
  Circle,
  Trash2,
  Banknote,
  Handshake,
  User,
  Loader2,
  ShieldCheck,
} from "lucide-react";

// 1. تبويب الوسطاء
export const BrokersTab = ({
  tx,
  safeNum,
  setIsAddBrokerModalOpen,
  deleteBrokerMutation,
  setPayPersonData,
}) => {
  return (
    <div
      className="
        min-h-full space-y-5 p-4 md:p-5
        bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white
        animate-in fade-in duration-300
      "
      dir="rtl"
    >
      {/* Header */}
      <div
        className="
          relative overflow-hidden rounded-[26px]
          border border-[#d8b46a]/25
          bg-gradient-to-l from-[#08111c] via-[#0f3448] to-[#123f59]
          p-5 shadow-[0_20px_55px_rgba(18,63,89,0.18)]
        "
      >
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute right-[-55px] top-[-55px] h-40 w-40 rounded-full bg-[#c5983c]/20 blur-3xl" />
          <div className="absolute left-[-75px] bottom-[-75px] h-48 w-48 rounded-full bg-cyan-400/10 blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div
              className="
                grid h-14 w-14 place-items-center rounded-3xl
                bg-[#e2bf74] text-[#123f59]
                shadow-[0_12px_24px_rgba(0,0,0,0.18)]
              "
            >
              <Handshake className="h-7 w-7" />
            </div>

            <div>
              <h2 className="text-lg font-black text-white">
                الوسطاء المرتبطون
              </h2>

              <p className="mt-1 text-xs font-bold text-white/55">
                إدارة الوسطاء، أتعاب الوساطة، المدفوعات، والمبالغ المتبقية.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div
              className="
                flex items-center gap-2 rounded-2xl
                border border-rose-400/20 bg-rose-500/10
                px-4 py-3 backdrop-blur-md
              "
            >
              <span
                className="
                  grid h-10 w-10 place-items-center rounded-2xl
                  bg-rose-500/15 text-rose-300
                "
              >
                <Banknote className="h-5 w-5" />
              </span>

              <div>
                <div className="text-[10px] font-black uppercase text-rose-100/70">
                  إجمالي أتعاب الوسطاء
                </div>

                <div className="font-mono text-base font-black text-white">
                  {safeNum(tx.mediatorFees).toLocaleString()} ر.س
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsAddBrokerModalOpen(true)}
              className="
                flex h-12 items-center gap-2 rounded-2xl
                bg-white px-5 text-xs font-black text-[#123f59]
                shadow-[0_12px_30px_rgba(255,255,255,0.12)]
                transition-all duration-300
                hover:-translate-y-[1px]
                hover:bg-[#fbf8f1]
              "
              type="button"
            >
              <Plus className="h-4 w-4 text-[#c5983c]" />
              إضافة وسيط
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div
        className="
          overflow-hidden rounded-[26px]
          border border-[#d8b46a]/30
          bg-white
          shadow-[0_18px_45px_rgba(18,63,89,0.10)]
        "
      >
        <div className="overflow-x-auto custom-scrollbar-slim">
          <table className="w-full min-w-[880px] text-right text-[12px]">
            <thead className="bg-[#0f3448] text-white">
              <tr className="h-[48px]">
                <th className="border-l border-white/10 px-4 font-black">
                  الوسيط
                </th>

                <th className="border-l border-white/10 px-4 font-black">
                  الأتعاب
                </th>

                <th className="border-l border-white/10 px-4 font-black">
                  المدفوع
                </th>

                <th className="border-l border-white/10 px-4 font-black">
                  المتبقي
                </th>

                <th className="border-l border-white/10 px-4 font-black">
                  الحالة
                </th>

                <th className="px-4 text-center font-black">إجراءات</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#e8ddc8]/70">
              {tx.brokers?.length > 0 ? (
                tx.brokers.map((b, i) => {
                  const cost = safeNum(b.fees);

                  const paid =
                    tx.settlements
                      ?.filter(
                        (s) =>
                          s.targetId === b.personId &&
                          s.status === "DELIVERED",
                      )
                      .reduce((sum, s) => sum + s.amount, 0) || 0;

                  const remaining = Math.max(0, cost - paid);
                  const isFullyPaid = paid >= cost && cost > 0;
                  const isPartiallyPaid = paid > 0 && !isFullyPaid;

                  const statusLabel = isFullyPaid
                    ? "تم الدفع"
                    : isPartiallyPaid
                      ? "دفع جزئي"
                      : "غير مدفوع";

                  const statusClass = isFullyPaid
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : isPartiallyPaid
                      ? "bg-cyan-50 text-cyan-700 border border-cyan-200"
                      : "bg-amber-50 text-amber-700 border border-amber-200";

                  return (
                    <tr
                      key={b.id || i}
                      className={`
                        transition-colors hover:bg-cyan-50/40
                        ${i % 2 === 1 ? "bg-[#fbf8f1]/50" : "bg-white"}
                      `}
                    >
                      {/* Broker */}
                      <td className="border-l border-[#e8ddc8]/70 px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="
                              grid h-11 w-11 place-items-center rounded-2xl
                              bg-[#123f59] text-[#e2bf74]
                              shadow-sm
                            "
                          >
                            <User className="h-5 w-5" />
                          </div>

                          <div className="min-w-0">
                            <div className="truncate text-[13px] font-black text-[#123f59]">
                              {b.name}
                            </div>

                            <div className="mt-1 text-[10px] font-bold text-[#64748b]">
                              وسيط معتمد في المعاملة
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Fees */}
                      <td className="border-l border-[#e8ddc8]/70 px-4 py-4">
                        <div className="font-mono text-[13px] font-black text-[#123f59]">
                          {cost.toLocaleString()}
                        </div>
                      </td>

                      {/* Paid */}
                      <td className="border-l border-[#e8ddc8]/70 px-4 py-4">
                        <div className="font-mono text-[13px] font-black text-emerald-700">
                          {paid.toLocaleString()}
                        </div>
                      </td>

                      {/* Remaining */}
                      <td className="border-l border-[#e8ddc8]/70 px-4 py-4">
                        <div className="font-mono text-[13px] font-black text-rose-600">
                          {remaining.toLocaleString()}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="border-l border-[#e8ddc8]/70 px-4 py-4">
                        <span
                          className={`
                            flex w-max items-center gap-1.5 rounded-xl
                            px-3 py-1.5 text-[10px] font-black
                            ${statusClass}
                          `}
                        >
                          {isFullyPaid ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            <Circle className="h-3 w-3" />
                          )}

                          {statusLabel}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {remaining > 0 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();

                                setPayPersonData({
                                  targetType: "وسيط",
                                  targetId: b.personId,
                                  workerName: b.name,
                                  taskName: "أتعاب وساطة",
                                  totalCost: remaining,
                                  paymentType: "full",
                                  amountSar: remaining,
                                  paymentDate: new Date()
                                    .toISOString()
                                    .split("T")[0],
                                });
                              }}
                              className="
                                flex items-center gap-1.5 rounded-xl
                                border border-emerald-200
                                bg-emerald-50 px-3 py-2
                                text-[11px] font-black text-emerald-700
                                transition-all duration-300
                                hover:bg-emerald-600
                                hover:text-white
                              "
                              type="button"
                            >
                              <Banknote className="h-3.5 w-3.5" />
                              سداد
                            </button>
                          )}

                          <button
                            onClick={(e) => {
                              e.stopPropagation();

                              if (window.confirm("هل تريد إزالة هذا الوسيط؟")) {
                                deleteBrokerMutation.mutate(b.id);
                              }
                            }}
                            disabled={deleteBrokerMutation.isPending}
                            className="
                              grid h-10 w-10 place-items-center rounded-xl
                              bg-rose-50 text-rose-500
                              transition-all duration-300
                              hover:bg-rose-500
                              hover:text-white
                              disabled:opacity-50
                            "
                            type="button"
                          >
                            {deleteBrokerMutation.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="py-14 text-center">
                    <div
                      className="
                        mx-auto mb-3 grid h-16 w-16 place-items-center
                        rounded-3xl border border-[#d8b46a]/35
                        bg-[#f8efe0]
                        text-[#c5983c]
                      "
                    >
                      <ShieldCheck className="h-8 w-8" />
                    </div>

                    <p className="text-sm font-black text-[#123f59]">
                      لا يوجد وسطاء مسجلين
                    </p>

                    <p className="mt-1 text-xs font-semibold text-[#64748b]">
                      يمكنك إضافة وسيط جديد من الزر بالأعلى
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};