import React from "react";
import {
  FileText,
  Printer,
  Share2,
  Send,
  Mail,
  Plus,
  Upload,
  Save,
  Eye,
  Image as ImageIcon,
  Trash2,
} from "lucide-react";
import { toast } from "sonner"; // تم استيراد toast لإظهار التنبيهات

export const DocsTab = ({
  localData,
  docsCount,
  printAllDocuments,
  shareAllDocuments,
  showDocForm,
  setShowDocForm,
  newDoc,
  setNewDoc,
  fileInputRef,
  handleDocFileUpload,
  handleAddDoc,
  setViewingDoc,
  handleDeleteItem,
}) => {
  // 💡 دالة طباعة وثيقة واحدة مباشرة
  const printSingleDocument = (doc) => {
    const fileSource = doc.fileData || doc.filePath;
    if (!fileSource)
      return toast.error("لا يمكن طباعة الوثيقة (الملف غير متوفر).");

    const isPdf =
      doc.fileType?.includes("pdf") || doc.filePath?.endsWith(".pdf");
    const printWindow = window.open("", "_blank");

    if (isPdf) {
      // طباعة PDF عن طريق iframe يأخذ كامل الشاشة
      printWindow.document.write(
        `<iframe src="${fileSource}" width="100%" height="100%" style="border:none;"></iframe>`,
      );
    } else {
      // طباعة صورة
      printWindow.document.write(
        `<div style="text-align:center;"><img src="${fileSource}" style="max-width:100%; max-height:95vh;" /></div>`,
      );
    }

    printWindow.document.close();
    printWindow.focus();

    // ننتظر قليلاً حتى يكتمل تحميل الصورة/الملف قبل استدعاء نافذة الطباعة
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  return (
    <div className="animate-in fade-in h-full flex flex-col">
      {/* شريط الإجراءات العلوي للوثائق */}
      <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-200 shrink-0">
        <span className="text-sm font-black text-slate-800 flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" /> الوثائق المرتبطة (
          {docsCount})
        </span>
        <div className="flex items-center gap-2">
          {docsCount > 0 && (
            <>
              <button
                onClick={printAllDocuments}
                className="px-3 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Printer className="w-4 h-4" /> طباعة الكل
              </button>
              <div className="relative group">
                <button className="px-3 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors">
                  <Share2 className="w-4 h-4" /> إرسال الكل
                </button>
                {/* قائمة الإرسال المنسدلة */}
                <div className="absolute left-0 mt-1 w-36 bg-white border border-slate-200 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden">
                  <button
                    onClick={() => shareAllDocuments("whatsapp")}
                    className="w-full text-right px-3 py-2 text-xs hover:bg-slate-50 border-b border-slate-100 flex items-center gap-2 text-green-600"
                  >
                    <Send className="w-3 h-3" /> واتساب
                  </button>
                  <button
                    onClick={() => shareAllDocuments("telegram")}
                    className="w-full text-right px-3 py-2 text-xs hover:bg-slate-50 border-b border-slate-100 flex items-center gap-2 text-blue-500"
                  >
                    <Send className="w-3 h-3" /> تليجرام
                  </button>
                  <button
                    onClick={() => shareAllDocuments("email")}
                    className="w-full text-right px-3 py-2 text-xs hover:bg-slate-50 flex items-center gap-2 text-slate-600"
                  >
                    <Send className="w-3 h-3" /> بريد إلكتروني
                  </button>
                </div>
              </div>
            </>
          )}
          <div className="w-px h-6 bg-slate-300 mx-1"></div>
          <button
            onClick={() => setShowDocForm(!showDocForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-blue-700 shadow-sm"
          >
            <Plus className="w-4 h-4" /> إضافة وثيقة
          </button>
        </div>
      </div>

      {/* فورم إضافة وثيقة */}
      {showDocForm && (
        <div className="bg-blue-50/50 border border-blue-200 p-5 rounded-xl grid grid-cols-1 md:grid-cols-4 items-end gap-4 mb-5 animate-in slide-in-from-top-2 shadow-inner shrink-0">
          <div>
            <label className="text-xs font-bold block mb-1.5 text-blue-900">
              رقم الوثيقة *
            </label>
            <input
              type="text"
              className="w-full p-2.5 text-xs border rounded-lg outline-none focus:border-blue-500 shadow-sm"
              value={newDoc.number}
              onChange={(e) => setNewDoc({ ...newDoc, number: e.target.value })}
              placeholder="مثال: 310123456"
            />
          </div>
          <div>
            <label className="text-xs font-bold block mb-1.5 text-blue-900">
              نوع الوثيقة
            </label>
            <select
              className="w-full p-2.5 text-xs border rounded-lg outline-none focus:border-blue-500 shadow-sm bg-white"
              value={newDoc.type}
              onChange={(e) => setNewDoc({ ...newDoc, type: e.target.value })}
            >
              <option value="صك ملكية">صك ملكية</option>
              <option value="رخصة بناء">رخصة بناء</option>
              <option value="كروكي تنظيمي">كروكي تنظيمي</option>
              <option value="قرار مساحي">قرار مساحي</option>
              <option value="مخطط معتمد">مخطط معتمد</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-bold block mb-1.5 text-blue-900">
              ملف الوثيقة (اختياري)
            </label>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full p-2.5 text-xs border border-dashed border-blue-400 bg-white text-blue-600 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-100 transition-colors"
            >
              <Upload className="w-4 h-4" />{" "}
              {newDoc.fileData ? "تم اختيار الملف" : "اختر ملف (صورة/PDF)"}
            </button>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*,application/pdf"
              onChange={handleDocFileUpload}
            />
          </div>
          <button
            onClick={handleAddDoc}
            className="px-6 py-2.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 shadow-md h-[42px] flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" /> إضافة للقائمة
          </button>
        </div>
      )}

      {/* منطقة الجدول مع دعم السكرول */}
      {localData.documents.length > 0 ? (
        <div className="flex-1 min-h-0 relative border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm flex flex-col">
          <div className="overflow-auto flex-1 custom-scrollbar">
            <table className="w-full text-right text-xs border-collapse">
              <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm border-b-2 border-slate-200">
                <tr>
                  <th className="p-3 font-black w-10 text-center text-slate-600">
                    #
                  </th>
                  <th className="p-3 font-bold w-16 text-slate-600">معاينة</th>
                  <th className="p-3 font-bold text-slate-600">
                    الرمز (الكود)
                  </th>
                  <th className="p-3 font-bold text-slate-600">النوع</th>
                  <th className="p-3 font-bold text-slate-600">رقم الوثيقة</th>
                  <th className="p-3 font-bold text-center text-slate-600 w-32">
                    إجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {localData.documents.map((doc, idx) => (
                  <tr
                    key={doc.id}
                    className="hover:bg-blue-50/30 transition-colors group"
                  >
                    <td className="p-3 text-center font-bold text-slate-400">
                      {idx + 1}
                    </td>
                    <td className="p-3">
                      {doc.fileData || doc.filePath ? (
                        <div
                          onClick={() => setViewingDoc(doc)}
                          className="w-10 h-10 rounded border border-slate-200 overflow-hidden cursor-pointer hover:border-blue-500 hover:shadow-md transition-all relative mx-auto"
                        >
                          {doc.fileType?.includes("pdf") ||
                          doc.filePath?.endsWith(".pdf") ? (
                            <div className="w-full h-full bg-red-50 flex items-center justify-center text-red-500 font-bold text-[8px]">
                              PDF
                            </div>
                          ) : (
                            <img
                              src={doc.fileData || doc.filePath}
                              alt="معاينة"
                              className="w-full h-full object-cover"
                            />
                          )}
                          <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Eye className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center text-slate-300 mx-auto">
                          <ImageIcon className="w-4 h-4" />
                        </div>
                      )}
                    </td>
                    <td className="p-3">
                      <span className="font-mono font-bold text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded border border-slate-200">
                        {doc.sysCode}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-slate-800">
                      {doc.type || doc.documentType}
                    </td>
                    <td className="p-3 font-mono font-black text-blue-700">
                      {doc.number || doc.documentNumber}
                    </td>

                    <td className="p-3">
                      <div className="flex items-center justify-center gap-1">
                        {/* زر المعاينة (يفتح المودال الخاص بك في DeedDetailsTab) */}
                        <button
                          onClick={() => setViewingDoc(doc)}
                          disabled={!(doc.fileData || doc.filePath)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                          title="عرض وتكبير"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* زر الطباعة المباشرة المحدث */}
                        <button
                          onClick={() => printSingleDocument(doc)}
                          disabled={!(doc.fileData || doc.filePath)}
                          className="p-2 text-slate-600 hover:bg-slate-200 rounded-lg disabled:opacity-30 transition-colors"
                          title="طباعة"
                        >
                          <Printer className="w-4 h-4" />
                        </button>

                        <div className="relative group/share">
                          <button
                            className="p-2 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors"
                            title="مشاركة"
                            disabled={!(doc.fileData || doc.filePath)}
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
                          <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1 w-32 bg-white border border-slate-200 rounded-lg shadow-xl opacity-0 invisible group-hover/share:opacity-100 group-hover/share:visible transition-all z-50">
                            <button
                              onClick={() => shareDocument(doc, "whatsapp")}
                              className="w-full text-right px-3 py-2 text-xs hover:bg-slate-50 border-b border-slate-100 flex items-center gap-2 text-green-600"
                            >
                              <Send className="w-3 h-3" /> واتساب
                            </button>
                            <button
                              onClick={() => shareDocument(doc, "email")}
                              className="w-full text-right px-3 py-2 text-xs hover:bg-slate-50 flex items-center gap-2 text-slate-600"
                            >
                              <Mail className="w-3 h-3" /> إيميل
                            </button>
                          </div>
                        </div>

                        <div className="w-px h-4 bg-slate-200 mx-1"></div>

                        <button
                          onClick={() => handleDeleteItem("documents", doc.id)}
                          className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* شريط سفلي صغير يعرض عدد العناصر */}
          <div className="bg-slate-50 border-t border-slate-200 p-2 text-[10px] text-slate-500 font-bold flex justify-between shrink-0">
            <span>إجمالي الوثائق: {localData.documents.length}</span>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl">
          <FileText className="w-16 h-16 text-slate-300 mb-3" />
          <p className="text-slate-500 font-bold text-lg">
            لا توجد وثائق مدرجة
          </p>
          <p className="text-slate-400 text-xs mt-1">
            قم بإضافة الوثائق المتعلقة بالمعاملة من الزر بالأعلى
          </p>
        </div>
      )}
    </div>
  );
};
