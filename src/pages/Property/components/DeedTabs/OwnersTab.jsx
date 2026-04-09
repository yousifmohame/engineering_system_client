import React from "react";
import { Users, Plus, Crown, Trash2 } from "lucide-react";

export const OwnersTab = ({
  localData,
  ownersCount,
  showOwnerForm,
  setShowOwnerForm,
  newOwner,
  setNewOwner,
  handleAddOwner,
  handleDeleteItem,
}) => {
  return (
    <div className="animate-in fade-in max-w-7xl mx-auto">
      <div className="flex items-center justify-between gap-2 mb-4 pb-2 border-b border-slate-200">
        <span className="text-sm font-black text-slate-800 flex items-center gap-2">
          <Users className="w-5 h-5 text-amber-600" /> الملاك والحصص (
          {ownersCount})
        </span>
        <button
          onClick={() => setShowOwnerForm(!showOwnerForm)}
          className="bg-amber-600 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-amber-700"
        >
          <Plus className="w-4 h-4" /> إضافة مالك
        </button>
      </div>

      {showOwnerForm && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl grid grid-cols-4 items-end gap-3 mb-4 animate-in slide-in-from-top-2">
          <div className="col-span-2">
            <label className="text-xs font-bold block mb-1">الاسم</label>
            <input
              type="text"
              className="w-full p-2.5 text-xs border rounded-lg outline-none focus:border-amber-500"
              value={newOwner.name}
              onChange={(e) =>
                setNewOwner({ ...newOwner, name: e.target.value })
              }
            />
          </div>
          <div>
            <label className="text-xs font-bold block mb-1">النسبة %</label>
            <input
              type="number"
              className="w-full p-2.5 text-xs border rounded-lg outline-none focus:border-amber-500"
              value={newOwner.share}
              onChange={(e) =>
                setNewOwner({ ...newOwner, share: e.target.value })
              }
            />
          </div>
          <button
            onClick={handleAddOwner}
            className="px-4 py-2.5 bg-amber-600 text-white text-xs font-bold rounded-lg hover:bg-amber-700"
          >
            إضافة مؤقتة
          </button>
        </div>
      )}

      {localData.owners.length > 0 ? (
        <div className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-sm">
          <table className="w-full text-right text-sm">
            <thead className="bg-amber-100 text-amber-900 border-b border-amber-200">
              <tr>
                <th className="p-3 font-bold">المالك</th>
                <th className="p-3 font-bold">الهوية</th>
                <th className="p-3 font-bold">النسبة</th>
                <th className="p-3 font-bold text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {localData.owners.map((owner, idx) => (
                <tr
                  key={owner.id || idx}
                  className="hover:bg-amber-50/30 transition-colors"
                >
                  <td className="p-4 font-bold text-slate-800 flex items-center gap-2">
                    <div
                      className={`p-2 rounded-full ${idx === 0 ? "bg-amber-100 text-amber-600" : "bg-slate-100 text-slate-400"}`}
                    >
                      <Crown className="w-4 h-4" />
                    </div>
                    {owner.name}
                  </td>
                  <td className="p-4 font-mono text-slate-600">
                    {owner.idNumber || owner.identityNumber || "---"}
                  </td>
                  <td className="p-4 font-mono font-black text-blue-700 text-lg">
                    {owner.sharePercentage || owner.share}%
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => handleDeleteItem("owners", owner.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-16 bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-bold">لا يوجد ملاك مضافين</p>
        </div>
      )}
    </div>
  );
};
