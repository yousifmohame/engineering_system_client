import React, { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllClients, updateClient } from "../../../api/clientApi"; // 👈 تأكد من الاستيراد
import { Star, Edit, Loader2, X, Save } from "lucide-react";
import { toast } from "sonner";

const ClientsRatingsPanel = () => {
  const queryClient = useQueryClient();

  // ==========================================
  // States
  // ==========================================
  const [editingClient, setEditingClient] = useState(null);
  const [editForm, setEditForm] = useState({
    grade: "",
    category: "",
    secretRating: 50,
    riskTier: "LOW",
  });

  // ==========================================
  // Fetch Data
  // ==========================================
  const { data: clients = [], isLoading } = useQuery({
    queryKey: ["clients"],
    queryFn: () => getAllClients({}),
  });

  // ==========================================
  // Mutations
  // ==========================================
  const updateMutation = useMutation({
    mutationFn: (data) => updateClient(data.id, data.payload),
    onSuccess: () => {
      queryClient.invalidateQueries(["clients"]); // تحديث الجدول فوراً
      setEditingClient(null); // إغلاق النافذة المنبثقة
      toast.success("تم تحديث تقييم وتصنيف العميل بنجاح");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "حدث خطأ أثناء التحديث");
    },
  });

  // ==========================================
  // Handlers
  // ==========================================
  const handleEditClick = (client) => {
    setEditingClient(client);
    setEditForm({
      grade: client.grade || "ج",
      category: client.category || "عادي",
      secretRating: client.secretRating || 50,
      riskTier: client.riskTier || "LOW",
    });
  };

  const handleSave = () => {
    if (!editingClient) return;
    updateMutation.mutate({
      id: editingClient.id,
      payload: {
        grade: editForm.grade,
        category: editForm.category,
        secretRating: parseInt(editForm.secretRating, 10),
        riskTier: editForm.riskTier,
      },
    });
  };

  // ==========================================
  // Stats & UI Helpers
  // ==========================================
  const stats = useMemo(() => {
    return {
      gradeA: clients.filter((c) => c.grade === "A" || c.grade === "أ").length,
      gradeB: clients.filter((c) => c.grade === "B" || c.grade === "ب").length,
      gradeC: clients.filter((c) => c.grade === "C" || c.grade === "ج").length,
      gradeD: clients.filter((c) => c.grade === "D" || c.grade === "د").length,
    };
  }, [clients]);

  const getRiskBadge = (riskTier) => {
    switch (riskTier?.toUpperCase()) {
      case "LOW":
        return (
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-[11px] font-bold border border-green-200">
            منخفض
          </span>
        );
      case "MEDIUM":
        return (
          <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-lg text-[11px] font-bold border border-amber-200">
            متوسط
          </span>
        );
      case "HIGH":
        return (
          <span className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-[11px] font-bold border border-red-200">
            مرتفع
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-[11px] font-bold border border-slate-200">
            غير محدد
          </span>
        );
    }
  };

  const getGradeFullText = (grade) => {
    if (grade === "A" || grade === "أ")
      return (
        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-[11px] font-bold">
          A — ممتاز
        </span>
      );
    if (grade === "B" || grade === "ب")
      return (
        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-[11px] font-bold">
          B — جيد
        </span>
      );
    if (grade === "C" || grade === "ج")
      return (
        <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-lg text-[11px] font-bold">
          C — مقبول
        </span>
      );
    if (grade === "D" || grade === "د")
      return (
        <span className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-[11px] font-bold">
          D — متعثر
        </span>
      );
    return <span className="text-slate-500 text-xs">غير مقيّم</span>;
  };

  if (isLoading)
    return (
      <div className="p-10 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );

  return (
    <div className="animate-in fade-in zoom-in-95 duration-300 relative">
      {/* ==========================================
          Header & Stats
      ========================================== */}
      <div className="mb-3 flex items-center justify-between gap-3 rounded-[20px] bg-gradient-to-l from-[#071927] via-[#0b2f3f] to-[#147785] px-4 py-3 shadow-sm border border-[#d9b85b]/25">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[14px] bg-[#d9b85b] text-[#083646] flex items-center justify-center shrink-0">
            <Star className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-[15px] font-black text-white leading-tight">تقييمات وتصنيفات العملاء</h3>
            <p className="text-[10px] font-bold text-white/75 mt-0.5">متابعة درجات العملاء ومستوى المخاطرة</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mb-3">
        <div className="p-3 bg-white rounded-[18px] border border-[#d8e6ee] shadow-sm text-center">
          <div className="text-xl font-black text-green-700 leading-none">{stats.gradeA}</div>
          <div className="text-[11px] font-bold text-slate-500 mt-1.5">A — ممتاز</div>
        </div>
        <div className="p-3 bg-white rounded-[18px] border border-[#d8e6ee] shadow-sm text-center">
          <div className="text-xl font-black text-blue-600 leading-none">{stats.gradeB}</div>
          <div className="text-[11px] font-bold text-slate-500 mt-1.5">B — جيد</div>
        </div>
        <div className="p-3 bg-white rounded-[18px] border border-[#d8e6ee] shadow-sm text-center">
          <div className="text-xl font-black text-amber-600 leading-none">{stats.gradeC}</div>
          <div className="text-[11px] font-bold text-slate-500 mt-1.5">C — مقبول</div>
        </div>
        <div className="p-3 bg-white rounded-[18px] border border-[#d8e6ee] shadow-sm text-center">
          <div className="text-xl font-black text-red-600 leading-none">{stats.gradeD}</div>
          <div className="text-[11px] font-bold text-slate-500 mt-1.5">D — متعثر</div>
        </div>
      </div>

      {/* ==========================================
          Data Table
      ========================================== */}
      <div className="bg-white rounded-[20px] border border-[#d8e6ee] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse min-w-[800px]">
            <thead className="bg-[#083646] text-white">
              <tr>
                <th className="p-2.5 text-[11px] text-white font-black border-b border-[#0f6d7c]">
                  العميل
                </th>
                <th className="p-2.5 text-[11px] text-white font-black border-b border-[#0f6d7c]">
                  التقييم
                </th>
                <th className="p-2.5 text-[11px] text-white font-black border-b border-[#0f6d7c]">
                  الأهمية
                </th>
                <th className="p-2.5 text-[11px] text-white font-black border-b border-[#0f6d7c]">
                  مؤشر الالتزام (100)
                </th>
                <th className="p-2.5 text-[11px] text-white font-black border-b border-[#0f6d7c]">
                  مستوى المخاطرة
                </th>
                <th className="p-2.5 text-[11px] text-white font-black border-b border-[#0f6d7c] text-center">
                  إجراء
                </th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => {
                const name =
                  client.name?.ar || client.name?.firstName || "غير محدد";
                return (
                  <tr
                    key={client.id}
                    className="border-b border-[#e7eef2] hover:bg-[#f7fbfd] transition-colors"
                  >
                    <td className="p-2.5">
                      <div className="font-bold text-sm text-slate-800">
                        {name}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {client.clientCode}
                      </div>
                    </td>
                    <td className="p-2.5">{getGradeFullText(client.grade)}</td>
                    <td className="p-4 text-xs font-bold text-blue-600">
                      {client.category || "عادي"}
                    </td>
                    <td className="p-4 text-xs font-mono font-bold text-slate-600">
                      {client.secretRating || 50}{" "}
                      <span className="text-[10px] font-normal text-slate-400">
                        / 100
                      </span>
                    </td>
                    <td className="p-2.5">{getRiskBadge(client.riskTier)}</td>
                    <td className="p-2.5 text-center">
                      <button
                        onClick={() => handleEditClick(client)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-lg text-xs font-bold hover:bg-blue-600 hover:text-white transition-colors"
                      >
                        <Edit className="w-3.5 h-3.5" /> تعديل التصنيف
                      </button>
                    </td>
                  </tr>
                );
              })}
              {clients.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-500">
                    لا توجد بيانات عملاء لعرضها.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ==========================================
          Edit Modal (النافذة المنبثقة للتعديل)
      ========================================== */}
      {editingClient && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[24px] shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-[#d8e6ee]">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-3.5 bg-[#083646] border-b border-[#d8e6ee]">
              <div>
                <h3 className="font-black text-white text-sm">
                  تعديل تصنيف العميل
                </h3>
                <p className="text-[11px] text-white/70 mt-0.5">
                  {editingClient.name?.ar || editingClient.name?.firstName} (
                  {editingClient.clientCode})
                </p>
              </div>
              <button
                onClick={() => setEditingClient(null)}
                className="p-1.5 bg-white text-slate-400 hover:text-red-500 rounded-lg border border-slate-200 shadow-sm transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 space-y-3">
              {/* التقييم */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  التقييم (Grade)
                </label>
                <select
                  value={editForm.grade}
                  onChange={(e) =>
                    setEditForm({ ...editForm, grade: e.target.value })
                  }
                  className="w-full h-10 px-3 border border-[#d8e6ee] rounded-xl text-[13px] outline-none focus:border-[#0f6d7c] bg-[#f7fbfd]"
                >
                  <option value="أ">A — ممتاز</option>
                  <option value="ب">B — جيد</option>
                  <option value="ج">C — مقبول</option>
                  <option value="د">D — متعثر</option>
                </select>
              </div>

              {/* الأهمية */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  فئة الأهمية (Category)
                </label>
                <select
                  value={editForm.category}
                  onChange={(e) =>
                    setEditForm({ ...editForm, category: e.target.value })
                  }
                  className="w-full h-10 px-3 border border-[#d8e6ee] rounded-xl text-[13px] outline-none focus:border-[#0f6d7c] bg-[#f7fbfd]"
                >
                  <option value="VIP">VIP - كبار العملاء</option>
                  <option value="مهم">مهم</option>
                  <option value="عادي">عادي</option>
                </select>
              </div>

              {/* مستوى المخاطرة */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  مستوى المخاطرة (Risk Tier)
                </label>
                <select
                  value={editForm.riskTier}
                  onChange={(e) =>
                    setEditForm({ ...editForm, riskTier: e.target.value })
                  }
                  className="w-full h-10 px-3 border border-[#d8e6ee] rounded-xl text-[13px] outline-none focus:border-[#0f6d7c] bg-[#f7fbfd]"
                >
                  <option value="LOW">منخفض (آمن)</option>
                  <option value="MEDIUM">متوسط</option>
                  <option value="HIGH">مرتفع (يحتاج مراقبة)</option>
                </select>
              </div>

              {/* مؤشر الالتزام السري */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  مؤشر الالتزام الداخلي (0 - 100)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={editForm.secretRating}
                  onChange={(e) =>
                    setEditForm({ ...editForm, secretRating: e.target.value })
                  }
                  className="w-full h-10 px-3 border border-[#d8e6ee] rounded-xl text-[13px] outline-none focus:border-[#0f6d7c] text-left font-mono bg-[#f7fbfd]"
                  dir="ltr"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  يستخدم هذا المؤشر داخلياً لتقييم مدى التزام العميل بالسداد
                  والتعاون.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 bg-[#f7fbfd] border-t border-[#d8e6ee] flex gap-3">
              <button
                onClick={handleSave}
                disabled={updateMutation.isPending}
                className="flex-1 bg-[#083646] text-white py-2.5 rounded-xl text-[13px] font-black shadow hover:bg-[#0f6d7c] transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {updateMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                حفظ التعديلات
              </button>
              <button
                onClick={() => setEditingClient(null)}
                className="px-5 bg-white border border-[#d8e6ee] text-[#123B5D] py-2.5 rounded-xl text-[13px] font-black shadow-sm hover:bg-slate-50 transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientsRatingsPanel;
