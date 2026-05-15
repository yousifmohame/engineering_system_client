import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  X,
  Search,
  ExternalLink,
  AlertTriangle,
  Ban,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import api from "../../../api/axios";
import { toast } from "sonner";

// 👇 قم بتعديل مسار الاستدعاء ليتناسب مع هيكل مشروعك
import FileViewerModal from "../../FilesExplorer/modals/FileViewerModal";

export default function RegistryModal({ isOpen, onClose }) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [type, setType] = useState("ALL");

  // 💡 حالة جديدة لتخزين الملف المراد معاينته
  const [viewingFile, setViewingFile] = useState(null);

  const { data: records = [], isLoading } = useQuery({
    queryKey: ["doc-registry", search, type],
    queryFn: async () => {
      const res = await api.get(`/documentation/registry`, {
        params: { search, type },
      });
      return res.data.data;
    },
    enabled: isOpen,
  });

  const handleRevoke = async (id) => {
    if (!window.confirm("هل أنت متأكد من إبطال هذه الوثيقة؟")) return;
    try {
      await api.put(`/documentation/${id}/revoke`);
      toast.success("تم إبطال الوثيقة");
      queryClient.invalidateQueries(["doc-registry"]);
    } catch (e) {
      toast.error("فشل الإجراء");
    }
  };

  // 💡 دالة تجهيز الملف للمعاينة
  const handleViewFile = (row) => {
    // استخراج صيغة الملف من الرابط (مثلاً: pdf, png)
    const extension = row.fileUrl
      ? row.fileUrl.split(".").pop().toLowerCase()
      : "";

    setViewingFile({
      url: row.fileUrl,
      name: row.name,
      extension: extension,
      size: 0, // يمكن تجاهل الحجم هنا أو تمرير حجم وهمي
    });
  };

  if (!isOpen) return null;

  return (
    <>
      <AnimatePresence>
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
          dir="rtl"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative w-full max-w-6xl h-[85vh] bg-white rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="px-8 py-6 border-b flex justify-between items-center bg-slate-50/50">
              <div>
                <h2 className="text-xl font-black text-slate-800">
                  سجل الوثائق الرقمية
                </h2>
                <p className="text-xs font-bold text-slate-400 mt-1">
                  عرض وإدارة كافة المستندات الموثقة أمنياً
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-xl transition-all"
              >
                <X />
              </button>
            </div>

            {/* Filters */}
            <div className="p-6 flex flex-wrap gap-4 bg-white border-b">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="البحث بالسيريال أو الطرف الثاني..."
                  className="w-full pr-10 pl-4 py-2.5 bg-slate-50 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="bg-slate-50 border rounded-xl px-4 text-sm font-bold outline-none"
              >
                <option value="ALL">كل الأنواع</option>
                <option value="CONTRACT">عقود</option>
                <option value="INVOICE">فواتير</option>
              </select>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto p-6 custom-scrollbar">
              {isLoading ? (
                <div className="h-full flex items-center justify-center">
                  <Loader2 className="animate-spin text-blue-600" />
                </div>
              ) : (
                <table className="w-full text-right border-separate border-spacing-y-2">
                  <thead>
                    <tr className="text-slate-400 text-xs font-black uppercase">
                      <th className="px-4 py-2">المستند</th>
                      <th className="px-4 py-2">الطرف الثاني</th>
                      <th className="px-4 py-2">التوكن أمني</th>
                      <th className="px-4 py-2">الحالة</th>
                      <th className="px-4 py-2 text-left">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((row) => (
                      <tr
                        key={row.id}
                        className="bg-white border border-slate-100 shadow-sm group hover:border-blue-200 transition-all"
                      >
                        <td className="px-4 py-4 rounded-r-2xl">
                          <div className="font-black text-sm text-slate-700">
                            {row.name}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {new Date(row.createdAt).toLocaleDateString(
                              "ar-SA",
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm font-bold text-slate-600">
                          {row.partyB}
                        </td>
                        <td className="px-4 py-4">
                          <code className="bg-slate-100 px-2 py-1 rounded text-blue-700 font-mono text-xs font-black">
                            {row.verificationToken}
                          </code>
                        </td>
                        <td className="px-4 py-4">
                          {row.status === "VALID" ? (
                            <span className="flex items-center gap-1 text-emerald-600 text-[10px] font-black">
                              <CheckCircle2 className="w-3 h-3" /> ساري
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-rose-500 text-[10px] font-black">
                              <Ban className="w-3 h-3" /> مبطل
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4 rounded-l-2xl text-left">
                          <div className="flex justify-end gap-2">
                            {/* 💡 تعديل زر المعاينة ليفتح المكون بدلاً من رابط خارجي */}
                            <button
                              onClick={() => handleViewFile(row)}
                              title="معاينة الملف"
                              className="p-2 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-lg transition-colors"
                            >
                              <ExternalLink size={16} />
                            </button>
                            {row.status === "VALID" && (
                              <button
                                onClick={() => handleRevoke(row.id)}
                                title="إبطال الوثيقة"
                                className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-lg transition-colors"
                              >
                                <AlertTriangle size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </motion.div>
        </div>
      </AnimatePresence>

      {/* 💡 استدعاء شاشة المعاينة إذا تم تحديد ملف */}
      {viewingFile && (
        <FileViewerModal
          file={viewingFile}
          onClose={() => setViewingFile(null)}
        />
      )}
    </>
  );
}
