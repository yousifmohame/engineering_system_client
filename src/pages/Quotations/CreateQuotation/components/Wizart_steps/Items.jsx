import React from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";

// ==========================================
// الخطوة 3: البنود
// ==========================================
export const Step3Items = ({ props }) => {
  const {
    items,
    setItems,
    handleItemChange,
    removeItem,
    addItemFromLibrary,
    serverItems,
    libItemsLoading,
    subtotal,
  } = props;

  return (
    <div className="animate-in fade-in duration-300 flex flex-col h-full">
      <div className="flex justify-between items-center mb-3">
        
        <div className="flex gap-1.5">
          {libItemsLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
          ) : (
            <select
              onChange={addItemFromLibrary}
              className="px-2 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-[10px] font-bold outline-none cursor-pointer max-w-[150px]"
            >
              <option value="">+ إضافة من المكتبة</option>
              {serverItems?.map((i) => (
                <option key={i.code} value={i.code}>
                  {i.title} ({i.price} ر.س)
                </option>
              ))}
            </select>
          )}
          <button
            onClick={() =>
              setItems([
                ...items,
                {
                  id: Date.now(),
                  title: "",
                  category: "عام",
                  qty: 1,
                  unit: "وحدة",
                  price: 0,
                  discount: 0,
                },
              ])
            }
            className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 hover:bg-emerald-700"
          >
            <Plus className="w-3 h-3" /> بند حر
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm flex-1">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-right border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-2 text-[10px] text-slate-500 font-bold w-6">
                  #
                </th>
                <th className="p-2 text-[10px] text-slate-500 font-bold">
                  البند
                </th>
                <th className="p-2 text-[10px] text-slate-500 font-bold w-14">
                  الكمية
                </th>
                <th className="p-2 text-[10px] text-slate-500 font-bold w-14">
                  الوحدة
                </th>
                <th className="p-2 text-[10px] text-slate-500 font-bold w-20">
                  السعر
                </th>
                <th className="p-2 text-[10px] text-slate-500 font-bold w-16">
                  خصم
                </th>
                <th className="p-2 text-[10px] text-slate-500 font-bold w-16">
                  الإجمالي
                </th>
                <th className="p-2 w-6"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr
                  key={item.id}
                  className="border-b border-slate-50 hover:bg-slate-50/50"
                >
                  <td className="p-2 text-[11px] text-slate-400 font-mono">
                    {index + 1}
                  </td>
                  <td className="p-2">
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) =>
                        handleItemChange(item.id, "title", e.target.value)
                      }
                      className="w-full p-1.5 border border-slate-200 rounded text-[11px] font-bold text-slate-700 outline-none focus:border-blue-500"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="number"
                      value={item.qty}
                      onChange={(e) =>
                        handleItemChange(item.id, "qty", e.target.value)
                      }
                      className="w-full p-1.5 border border-slate-200 rounded text-[11px] outline-none text-center"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="text"
                      value={item.unit}
                      onChange={(e) =>
                        handleItemChange(item.id, "unit", e.target.value)
                      }
                      className="w-full p-1.5 border border-slate-200 bg-slate-50 rounded text-[10px] outline-none text-center text-slate-500"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="number"
                      value={item.price}
                      onChange={(e) =>
                        handleItemChange(item.id, "price", e.target.value)
                      }
                      className="w-full p-1.5 border border-slate-200 rounded text-[11px] font-mono outline-none text-center"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="number"
                      value={item.discount}
                      onChange={(e) =>
                        handleItemChange(item.id, "discount", e.target.value)
                      }
                      className="w-full p-1.5 border border-slate-200 rounded text-[11px] font-mono outline-none text-center text-red-500"
                    />
                  </td>
                  <td className="p-2 text-[11px] font-bold text-blue-700 font-mono text-left">
                    {(item.qty * item.price - item.discount).toLocaleString()}
                  </td>
                  <td className="p-2 text-left">
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-400 hover:text-red-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="p-4 text-center text-[10px] text-slate-400"
                  >
                    لا يوجد بنود، قم بإضافة بند حر أو من المكتبة.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex justify-end pt-3 mt-2 border-t border-slate-200 text-[13px] font-black text-blue-700">
          المجموع الفرعي: {subtotal.toLocaleString()} ر.س
        </div>
      </div>
    </div>
  );
};
