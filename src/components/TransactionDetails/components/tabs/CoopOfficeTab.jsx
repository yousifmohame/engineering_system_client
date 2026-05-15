import React from "react";
import {
  Plus,
  Trash2,
  Building2,
  Edit3,
  Banknote,
  Check,
  Circle,
  Loader2,
  ShieldCheck,
} from "lucide-react";

// 4. تبويب المكتب المتعاون
export const CoopOfficeTab = ({
  tx,
  txCoopFees,
  setIsCoopFeeModalOpen,
  setCoopFeeMode,
  setCoopFeeForm,
  initialCoopFeeForm,
  handleOpenCoopFeeEdit,
  deleteCoopFeeMutation,
  safeNum,
}) => {
  const totalFees = txCoopFees.reduce(
    (sum, item) => sum + safeNum(item.officeFees),
    0,
  );

  const totalPaid = txCoopFees.reduce(
    (sum, item) => sum + safeNum(item.paidAmount),
    0,
  );

  const totalRemaining = Math.max(0, totalFees - totalPaid);

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

        <div className="relative z-10 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-4">
            <div
              className="
                grid h-14 w-14 place-items-center rounded-3xl
                bg-[#e2bf74] text-[#123f59]
                shadow-[0_12px_24px_rgba(0,0,0,0.18)]
              "
            >
              <Building2 className="h-7 w-7" />
            </div>

            <div>
              <h2 className="text-lg font-black text-white">
                تكاليف المكتب المنفذ الخارجي
              </h2>

              <p className="mt-1 text-xs font-bold text-white/55">
                إدارة مطالبات أتعاب المكاتب المتعاونة، المدفوع، والمتبقي.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div
              className="
                flex items-center gap-2 rounded-2xl
                border border-cyan-400/20 bg-cyan-500/10
                px-4 py-3 backdrop-blur-md
              "
            >
              <span
                className="
                  grid h-10 w-10 place-items-center rounded-2xl
                  bg-cyan-500/15 text-cyan-200
                "
              >
                <Banknote className="h-5 w-5" />
              </span>

              <div>
                <div className="text-[10px] font-black uppercase text-cyan-100/70">
                  إجمالي الأتعاب
                </div>

                <div className="font-mono text-base font-black text-white">
                  {totalFees.toLocaleString()} ر.س
                </div>
              </div>
            </div>

            <div
              className="
                hidden items-center gap-2 rounded-2xl
                border border-emerald-400/20 bg-emerald-500/10
                px-4 py-3 backdrop-blur-md md:flex
              "
            >
              <span
                className="
                  grid h-10 w-10 place-items-center rounded-2xl
                  bg-emerald-500/15 text-emerald-200
                "
              >
                <Check className="h-5 w-5" />
              </span>

              <div>
                <div className="text-[10px] font-black uppercase text-emerald-100/70">
                  المدفوع
                </div>

                <div className="font-mono text-base font-black text-white">
                  {totalPaid.toLocaleString()} ر.س
                </div>
              </div>
            </div>

            <div
              className="
                hidden items-center gap-2 rounded-2xl
                border border-rose-400/20 bg-rose-500/10
                px-4 py-3 backdrop-blur-md lg:flex
              "
            >
              <span
                className="
                  grid h-10 w-10 place-items-center rounded-2xl
                  bg-rose-500/15 text-rose-200
                "
              >
                <Circle className="h-5 w-5" />
              </span>

              <div>
                <div className="text-[10px] font-black uppercase text-rose-100/70">
                  المتبقي
                </div>

                <div className="font-mono text-base font-black text-white">
                  {totalRemaining.toLocaleString()} ر.س
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setCoopFeeMode("add");
                setCoopFeeForm(initialCoopFeeForm);
                setIsCoopFeeModalOpen(true);
              }}
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
              إضافة مطالبة أتعاب مكتب
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
          <table className="w-full min-w-[980px] text-right text-[12px]">
            <thead className="bg-[#0f3448] text-white">
              <tr className="h-[48px]">
                <th className="border-l border-white/10 px-4 font-black">
                  المكتب المتعاون
                </th>

                <th className="border-l border-white/10 px-4 font-black">
                  نوع الطلب
                </th>

                <th className="border-l border-white/10 px-4 font-black">
                  الأتعاب المستحقة
                </th>

                <th className="border-l border-white/10 px-4 font-black">
                  المدفوع
                </th>

                <th className="border-l border-white/10 px-4 font-black">
                  المتبقي
                </th>

                <th className="border-l border-white/10 px-4 font-black">
                  حالة الدفع
                </th>

                <th className="px-4 text-center font-black">إجراءات</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#e8ddc8]/70">
              {txCoopFees.length > 0 ? (
                txCoopFees.map((fee, i) => {
                  const cost = safeNum(fee.officeFees);
                  const paid = safeNum(fee.paidAmount);
                  const remaining = Math.max(0, cost - paid);

                  const isFullyPaid = paid >= cost && cost > 0;
                  const isPartiallyPaid = paid > 0 && !isFullyPaid;

                  const statusLabel = isFullyPaid
                    ? "مدفوع بالكامل"
                    : isPartiallyPaid
                      ? "دفع جزئي"
                      : "غير مدفوع";

                  const statusClass = isFullyPaid
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : isPartiallyPaid
                      ? "bg-cyan-50 text-cyan-700 border border-cyan-200"
                      : "bg-rose-50 text-rose-700 border border-rose-200";

                  return (
                    <tr
                      key={fee.id || i}
                      className={`
                        transition-colors hover:bg-cyan-50/40
                        ${i % 2 === 1 ? "bg-[#fbf8f1]/50" : "bg-white"}
                      `}
                    >
                      {/* Office */}
                      <td className="border-l border-[#e8ddc8]/70 px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="
                              grid h-11 w-11 place-items-center rounded-2xl
                              bg-[#123f59] text-[#e2bf74]
                              shadow-sm
                            "
                          >
                            <Building2 className="h-5 w-5" />
                          </div>

                          <div className="min-w-0">
                            <div className="truncate text-[13px] font-black text-[#123f59]">
                              {fee.officeName || "مكتب غير محدد"}
                            </div>

                            <div className="mt-1 text-[10px] font-bold text-[#64748b]">
                              مكتب منفذ / متعاون
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Request type */}
                      <td className="border-l border-[#e8ddc8]/70 px-4 py-4">
                        <span
                          className="
                            rounded-xl border border-[#d8b46a]/35
                            bg-[#f8efe0] px-3 py-1.5
                            text-[10px] font-black text-[#123f59]
                          "
                        >
                          {fee.requestType || "—"}
                        </span>
                      </td>

                      {/* Cost */}
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
                          <button
                            onClick={() => handleOpenCoopFeeEdit(fee)}
                            className="
                              grid h-10 w-10 place-items-center rounded-xl
                              bg-cyan-50 text-cyan-700
                              transition-all duration-300
                              hover:bg-cyan-600 hover:text-white
                            "
                            title="تعديل المطالبة"
                            type="button"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => {
                              if (window.confirm("حذف المطالبة؟")) {
                                deleteCoopFeeMutation.mutate(fee.id);
                              }
                            }}
                            disabled={deleteCoopFeeMutation.isPending}
                            className="
                              grid h-10 w-10 place-items-center rounded-xl
                              bg-rose-50 text-rose-500
                              transition-all duration-300
                              hover:bg-rose-500 hover:text-white
                              disabled:opacity-50
                            "
                            title="حذف المطالبة"
                            type="button"
                          >
                            {deleteCoopFeeMutation.isPending ? (
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
                  <td colSpan="7" className="py-14 text-center">
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
                      لا توجد مطالبات مسجلة للمكاتب في هذه المعاملة
                    </p>

                    <p className="mt-1 text-xs font-semibold text-[#64748b]">
                      يمكنك إضافة مطالبة أتعاب مكتب من الزر بالأعلى
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