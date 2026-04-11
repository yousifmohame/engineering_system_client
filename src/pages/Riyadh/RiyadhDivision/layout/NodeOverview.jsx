// src/components/RiyadhDivision/layout/NodeOverview.jsx
import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../../api/axios";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import {
  Map,
  Satellite,
  Link2,
  Copy,
  ExternalLink,
  PenLine,
  Download,
  CircleCheck,
  Loader2,
  Landmark,
  ChevronRight,
  Edit,
  ImageIcon,
  CircleAlert,
} from "lucide-react";

const NodeOverview = ({
  selectedNode,
  selectedType,
  selectedSector,
  onEditRequest,
}) => {
  const queryClient = useQueryClient();
  const [editingField, setEditingField] = useState(null); // 'mapImage' | 'satelliteImage' | 'officialLink'
  const [tempValue, setTempValue] = useState("");

  // دالة التحديث السريع (Inline Update)
  const quickUpdateMutation = useMutation({
    mutationFn: async ({ id, type, data }) => {
      const endpoint =
        type === "sector"
          ? `/riyadh-streets/sectors/${id}`
          : `/riyadh-streets/districts/${id}`;
      return await api.put(endpoint, data);
    },
    onSuccess: () => {
      toast.success("تم التحديث بنجاح");
      queryClient.invalidateQueries(["riyadh-tree"]);
      setEditingField(null);
    },
  });

  const handleSaveInline = (field) => {
    quickUpdateMutation.mutate({
      id: selectedNode.id,
      type: selectedType,
      data: { [field]: tempValue },
    });
  };

  const copyToClipboard = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success("تم نسخ الرابط");
  };

  // 👈 هذه هي الدالة التي كانت مفقودة وتسببت في الخطأ
  const renderImageCard = (title, icon, dbField, placeholderText) => {
    const Icon = icon;
    const isEditing = editingField === dbField;
    const hasImage = !!selectedNode[dbField];

    return (
      <div className="bg-white rounded-xl border border-stone-200/80 p-3 flex-1 min-w-[250px] shadow-sm flex flex-col transition-all hover:border-blue-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5 text-blue-700">
            <Icon className="w-4 h-4" />{" "}
            <span className="text-[12px] font-bold">{title}</span>
          </div>

          {!isEditing && (
            <button
              onClick={() => {
                setTempValue(selectedNode[dbField] || "");
                setEditingField(dbField);
              }}
              className="text-[10px] font-bold text-stone-500 hover:text-blue-600 flex items-center gap-1 bg-stone-50 px-2 py-1 rounded-md transition-colors"
            >
              <PenLine className="w-3 h-3" />{" "}
              {hasImage ? "تغيير الصورة" : "إضافة صورة"}
            </button>
          )}
        </div>

        {isEditing ? (
          <div className="flex flex-col gap-2 flex-1 justify-center bg-blue-50/50 p-2 rounded-lg border border-blue-100">
            <input
              type="url"
              dir="ltr"
              placeholder="أدخل رابط الصورة مباشر..."
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              className="w-full px-3 py-2 text-[11px] font-mono border border-blue-300 rounded outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex gap-2">
              <button
                onClick={() => handleSaveInline(dbField)}
                disabled={quickUpdateMutation.isPending}
                className="flex-1 bg-blue-600 text-white text-[10px] font-bold py-1.5 rounded flex items-center justify-center gap-1 hover:bg-blue-700"
              >
                {quickUpdateMutation.isPending ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  "حفظ"
                )}
              </button>
              <button
                onClick={() => setEditingField(null)}
                className="flex-1 bg-white border border-stone-300 text-stone-600 text-[10px] font-bold py-1.5 rounded hover:bg-stone-50"
              >
                إلغاء
              </button>
            </div>
          </div>
        ) : (
          <div className="h-32 bg-stone-50 rounded-lg border-2 border-dashed border-stone-200 flex items-center justify-center relative overflow-hidden group">
            {hasImage ? (
              <img
                src={selectedNode[dbField]}
                alt={title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-stone-400">
                <ImageIcon className="w-6 h-6 opacity-30" />
                <span className="text-[10px] font-bold">{placeholderText}</span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-2 animate-in fade-in" dir="rtl">
      {/* 1. قسم كروت الـ KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-1">
        {selectedType === "sector" ? (
          <div className="bg-white p-1 rounded-xl border border-stone-200 shadow-sm border-r-4 border-r-emerald-500">
            <span className="text-[9px] font-bold text-stone-500 block mb-1">
              الأحياء التابعة
            </span>
            <span className="text-sm font-black text-stone-800">
              {selectedNode.neighborhoods?.length || 0}
            </span>
          </div>
        ) : (
          <div className="bg-white p-1 rounded-xl border border-stone-200 shadow-sm border-r-4 border-r-orange-500">
            <span className="text-[9px] font-bold text-stone-500 block mb-1">
              الشوارع الموثقة
            </span>
            <span className="text-sm font-black text-stone-800">
              {selectedNode.streets?.length || 0}
            </span>
          </div>
        )}
        <div className="bg-white p-1 rounded-xl border border-stone-200 shadow-sm border-r-4 border-r-blue-500">
          <span className="text-[9px] font-bold text-stone-500 block mb-1">
            المعاملات
          </span>
          <span className="text-sm font-black text-stone-800">
            {selectedNode.stats?.transactions || 0}
          </span>
        </div>
        <div className="bg-white p-1 rounded-xl border border-stone-200 shadow-sm border-r-4 border-r-indigo-500">
          <span className="text-[9px] font-bold text-stone-500 block mb-1">
            الملكيات
          </span>
          <span className="text-sm font-black text-stone-800">
            {selectedNode.stats?.properties || 0}
          </span>
        </div>
        <div className="bg-white p-1 rounded-xl border border-stone-200 shadow-sm border-r-4 border-r-purple-500">
          <span className="text-[9px] font-bold text-stone-500 block mb-1">
            العملاء
          </span>
          <span className="text-sm font-black text-stone-800">
            {selectedNode.stats?.clients || 0}
          </span>
        </div>
      </div>

      {/* 2. قسم الخرائط والبيانات المكانية */}
      <div>
        <h3 className="text-[13px] font-extrabold text-stone-800 mb-3 flex items-center gap-2">
          <Map className="w-4 h-4 text-emerald-500" /> الخرائط والبيانات
          المكانية
        </h3>
        <div className="flex gap-4 flex-col lg:flex-row">
          {renderImageCard(
            "صورة البوابة المكانية",
            Map,
            "mapImage",
            "لا توجد صورة بوابة",
          )}
          {renderImageCard(
            "صورة القمر الصناعي",
            Satellite,
            "satelliteImage",
            "لا توجد صورة قمر",
          )}
        </div>
      </div>

      {/* 3. قسم الرابط والـ QR Code */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <span className="text-stone-800 font-bold text-[13px] flex items-center gap-2">
            <Link2 className="w-4 h-4 text-blue-600" /> رابط الخريطة التفاعلية
          </span>
          {editingField !== "officialLink" && (
            <button
              onClick={() => {
                setTempValue(selectedNode.officialLink || "");
                setEditingField("officialLink");
              }}
              className="text-[10px] font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg"
            >
              تعديل الرابط
            </button>
          )}
        </div>

        <div className="flex items-center gap-6">
          <div className="flex-1">
            {editingField === "officialLink" ? (
              <div className="flex gap-2 bg-blue-50 p-2 rounded-xl">
                <input
                  dir="ltr"
                  value={tempValue}
                  onChange={(e) => setTempValue(e.target.value)}
                  className="flex-1 px-3 py-2 text-[12px] border rounded-lg outline-none"
                  placeholder="https://maps.google.com/..."
                />
                <button
                  onClick={() => handleSaveInline("officialLink")}
                  className="bg-blue-600 text-white px-4 rounded-lg text-[11px] font-bold"
                >
                  حفظ
                </button>
                <button
                  onClick={() => setEditingField(null)}
                  className="bg-white border px-4 rounded-lg text-[11px]"
                >
                  إلغاء
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  value={selectedNode.officialLink || "لا يوجد رابط مسجل"}
                  className="flex-1 px-4 py-3 text-[12px] font-mono bg-stone-50 border border-stone-200 rounded-xl"
                  dir="ltr"
                />
                {selectedNode.officialLink && (
                  <>
                    <button
                      onClick={() => copyToClipboard(selectedNode.officialLink)}
                      className="p-3 bg-stone-100 rounded-xl hover:bg-stone-200 transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <a
                      href={selectedNode.officialLink}
                      target="_blank"
                      rel="noreferrer"
                      className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </>
                )}
              </div>
            )}
          </div>
          <div className="w-[90px] h-[90px] bg-white border border-stone-200 rounded-2xl flex items-center justify-center shrink-0 shadow-sm relative group overflow-hidden">
            {selectedNode.officialLink ? (
              <QRCodeSVG value={selectedNode.officialLink} size={70} />
            ) : (
              <div className="text-stone-300 text-[8px] text-center px-1">
                لا يوجد رابط للـ QR
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NodeOverview;
