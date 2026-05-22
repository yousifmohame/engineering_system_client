import React, { useState, useEffect } from "react";
import api from "../../api/axios";
import {
  Building2,
  Trash2,
  Save,
  FileText,
  Tag,
  Banknote,
  ChevronDown,
  Clock,
  Folder,
  SquareCheckBig,
  Plus,
  PackageX,
  FileCheck,
  Settings,
  Users,
  Search,
  ListChecks,
  X,
  Loader2,
  Sparkles,
} from "lucide-react";

export default function CreateServiceForm({ initialData, onClose, onSuccess }) {
  const [activeTab, setActiveTab] = useState("البيانات");
  const tabs = [
    "البيانات",
    "النطاق والمخرجات",
    "المراحل والتحقق",
    "إعدادات متقدمة",
    "الأداء",
  ];

  const [isLoadingDocs, setIsLoadingDocs] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [availableDocs, setAvailableDocs] = useState([]);
  const [docSearch, setDocSearch] = useState("");

  const [inputs, setInputs] = useState({
    inclusion: "",
    exclusion: "",
    deliverable: "",
    tag: "",
    stage: "",
    check: "",
  });

  // تهيئة البيانات: إذا كان هناك initialData (وضع التعديل)، نفككها لتلائم النموذج
  const [formData, setFormData] = useState(() => ({
    name: initialData?.name || "",
    code: initialData?.code || `SRV-${Math.floor(1000 + Math.random() * 9000)}`,
    pricingModel: initialData?.pricingModel || "fixed",
    price: initialData?.price || 0,
    duration: initialData?.duration || 0,
    mainCategory: initialData?.mainCategory || "",
    subCategory: initialData?.subCategory || "",
    description: initialData?.description || "",
    inclusions: initialData?.inclusions || [],
    exclusions: initialData?.exclusions || [],
    deliverables: initialData?.deliverables || [],
    stages: initialData?.stages?.map(s => s.name) || [],
    checklists: initialData?.checklists?.map(c => c.task) || [],
    // الحل هنا: التأكد دائماً أن requiredDocs مصفوفة
    requiredDocs: initialData?.requiredDocs?.map(d => d.documentTemplateId) || [], 
    isActive: initialData?.isActive ?? true,
    visibility: initialData?.visibility || "public",
    slaHours: initialData?.slaHours || 24,
    tags: initialData?.tags || [],
    targetAudience: typeof initialData?.targetAudience === 'string' ? JSON.parse(initialData.targetAudience) : (initialData?.targetAudience || { individuals: true, companies: true, government: false, charities: false }),
    internalNotes: initialData?.internalNotes || ""
  }));

  // جلب المستندات من النظام
  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const res = await api.get("/doc-templates");
        setAvailableDocs(res.data);
      } catch (error) {
        console.error("Error fetching docs", error);
      } finally {
        setIsLoadingDocs(false);
      }
    };
    fetchDocs();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAudienceChange = (key) => {
    setFormData((prev) => ({
      ...prev,
      targetAudience: {
        ...prev.targetAudience,
        [key]: !prev.targetAudience[key],
      },
    }));
  };

  const handleDocToggle = (docId) => {
    setFormData(prev => ({
      ...prev,
      requiredDocs: (prev.requiredDocs || []).includes(docId)
        ? prev.requiredDocs.filter(id => id !== docId)
        : [...(prev.requiredDocs || []), docId]
    }));
  };

  const addArrayItem = (listName, inputName) => {
    if (!inputs[inputName].trim()) return;
    setFormData((prev) => ({
      ...prev,
      [listName]: [...prev[listName], inputs[inputName].trim()],
    }));
    setInputs((prev) => ({ ...prev, [inputName]: "" }));
  };

  const removeArrayItem = (listName, index) => {
    setFormData((prev) => ({
      ...prev,
      [listName]: prev[listName].filter((_, i) => i !== index),
    }));
  };

  // الإرسال للخلفية
  const handleSave = async () => {
    setIsSaving(true);
    try {
      // إرسال البيانات
      if (initialData?.id) {
        await api.put(`/services/${initialData.id}`, formData);
      } else {
        await api.post("/services", formData);
      }
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error(error);
      alert("حدث خطأ أثناء الحفظ");
    } finally {
      setIsSaving(false);
    }
  };

  // دالة مساعدة لرسم قوائم الإدخال الديناميكية
  const renderDynamicList = (
    title,
    icon,
    listName,
    inputName,
    placeholder,
    emptyMsg,
    theme,
  ) => {
    const c = theme; // emerald, rose, purple, blue, sky
    return (
      <div
        className={`space-y-5 bg-gradient-to-b from-${c}-50/50 to-transparent p-6 rounded-3xl border border-${c}-100 shadow-sm relative overflow-hidden group`}
      >
        <div
          className={`absolute -left-6 -top-6 w-24 h-24 bg-${c}-100/50 rounded-full blur-2xl group-hover:bg-${c}-200/50 transition-colors`}
        ></div>
        <div className="flex flex-col relative z-10">
          <h3
            className={`text-sm font-black text-${c}-900 flex items-center gap-2`}
          >
            {icon} {title}
          </h3>
        </div>
        <div className="space-y-3 relative z-10">
          {formData[listName]?.length === 0 ? (
            <div
              className={`text-center py-4 border-2 border-dashed border-${c}-200 rounded-2xl text-${c}-400 text-xs font-bold`}
            >
              {emptyMsg}
            </div>
          ) : (
            <ul className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-2">
              {formData[listName]?.map((item, idx) => (
                <li
                  key={idx}
                  className={`flex items-center justify-between p-3 bg-white border border-${c}-100 rounded-xl shadow-sm`}
                >
                  <span className={`text-xs font-bold text-slate-700`}>
                    {item}
                  </span>
                  <button
                    onClick={() => removeArrayItem(listName, idx)}
                    className={`text-slate-300 hover:text-red-500`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="relative mt-2">
            <input
              value={inputs[inputName]}
              onChange={(e) =>
                setInputs((prev) => ({ ...prev, [inputName]: e.target.value }))
              }
              onKeyDown={(e) =>
                e.key === "Enter" && addArrayItem(listName, inputName)
              }
              placeholder={placeholder}
              className={`w-full text-xs font-bold border-2 border-${c}-100 rounded-2xl p-4 pr-12 focus:outline-none focus:ring-4 focus:ring-${c}-500/10 focus:border-${c}-400 bg-white transition-all shadow-sm`}
            />
            <button
              onClick={() => addArrayItem(listName, inputName)}
              className={`absolute right-4 top-4 bg-${c}-100 p-1 rounded-lg hover:bg-${c}-200 transition-colors`}
            >
              <Plus className={`w-4 h-4 text-${c}-600`} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "البيانات":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -z-10"></div>
            <div className="col-span-1 md:col-span-2 space-y-2">
              <label className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-indigo-500" /> اسم الخدمة
              </label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full border-2 border-slate-200 rounded-2xl p-4 text-base font-black focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder-slate-300"
                placeholder="مثال: الاستشارة القانونية لتأسيس الشركات"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-indigo-500" /> الكود التعريفي (SKU)
              </label>
              <input
                name="code"
                value={formData.code}
                onChange={handleChange}
                className="w-full border-2 border-indigo-100 rounded-2xl p-4 text-sm font-black font-mono text-indigo-800 bg-indigo-50/50 focus:border-indigo-500 outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                <Banknote className="w-4 h-4 text-emerald-500" /> نموذج التسعير
              </label>
              <div className="relative">
                <select
                  name="pricingModel"
                  value={formData.pricingModel}
                  onChange={handleChange}
                  className="w-full border-2 border-emerald-100 rounded-2xl p-4 pr-4 pl-10 text-sm font-black focus:border-emerald-500 outline-none transition-all appearance-none bg-emerald-50/50 text-emerald-900"
                >
                  <option value="fixed">مبلغ مقطوع ثابت (Fixed Fee)</option>
                  <option value="variable">متغير (يعتمد على النطاق)</option>
                  <option value="hourly">تسعير بالساعة الاستشارية</option>
                </select>
                <ChevronDown className="w-5 h-5 text-emerald-600 absolute left-4 top-4 pointer-events-none" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                <Banknote className="w-4 h-4 text-emerald-500" /> السعر المرجعي
              </label>
              <div className="relative">
                <input
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full border-2 border-emerald-100 rounded-2xl p-4 pl-16 text-sm font-black focus:border-emerald-500 outline-none transition-all font-mono text-emerald-900 bg-emerald-50/50"
                />
                <span className="absolute left-4 top-4 text-xs font-black text-emerald-600 bg-emerald-100/80 px-2 py-0.5 rounded border border-emerald-200">
                  ر.س
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-500" /> المدة التقريبية
              </label>
              <div className="relative">
                <input
                  name="duration"
                  type="number"
                  value={formData.duration}
                  onChange={handleChange}
                  className="w-full border-2 border-amber-100 rounded-2xl p-4 pl-24 text-sm font-black focus:border-amber-500 outline-none transition-all font-mono text-amber-900 bg-amber-50/50"
                />
                <span className="absolute left-4 top-4 text-xs font-black text-amber-600 bg-amber-100/80 px-2 py-0.5 rounded border border-amber-200">
                  يوم عمل
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                <Folder className="w-4 h-4 text-sky-500" /> التصنيف الرئيسي
              </label>
              <input
                name="mainCategory"
                value={formData.mainCategory}
                onChange={handleChange}
                className="w-full border-2 border-slate-200 rounded-2xl p-4 text-sm font-black focus:border-sky-500 outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                <Folder className="w-4 h-4 text-sky-300" /> التصنيف الفرعي
              </label>
              <input
                name="subCategory"
                value={formData.subCategory}
                onChange={handleChange}
                className="w-full border-2 border-slate-200 rounded-2xl p-4 text-sm font-black focus:border-sky-400 outline-none transition-all"
              />
            </div>
            <div className="col-span-1 md:col-span-2 space-y-2 mt-4 pt-6 border-t border-slate-100">
              <label className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-indigo-500" /> الوصف التعريفي
                المبسط
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className="w-full border-2 border-slate-200 rounded-2xl p-4 text-sm font-bold focus:border-indigo-500 outline-none resize-none transition-all custom-scrollbar"
              />
            </div>
          </div>
        );

      case "النطاق والمخرجات":
        return (
          <div className="space-y-8 animate-in fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {renderDynamicList(
                "المشمول بالنطاق (Inclusions)",
                <SquareCheckBig className="w-5 h-5 text-emerald-500" />,
                "inclusions",
                "inclusion",
                "اكتب واضغط للإضافة...",
                "لا يوجد مهام مشمولة",
                "emerald",
              )}
              {renderDynamicList(
                "المستثنى (Exclusions)",
                <PackageX className="w-5 h-5 text-rose-500" />,
                "exclusions",
                "exclusion",
                "اكتب واضغط للإضافة...",
                "لم يتم تحديد استثناءات",
                "rose",
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {renderDynamicList(
                "المخرجات (Deliverables)",
                <FileCheck className="w-5 h-5 text-purple-500" />,
                "deliverables",
                "deliverable",
                "إضافة مخرج...",
                "أضف مخرجات الخدمة هنا",
                "purple",
              )}
              <div className="space-y-5 bg-gradient-to-b from-amber-50/50 to-transparent p-6 rounded-3xl border border-amber-100 shadow-sm relative overflow-hidden flex flex-col">
                <h3 className="text-sm font-black text-amber-900 flex items-center gap-2 relative z-10">
                  <Folder className="w-5 h-5 text-amber-500" /> المستندات
                  المطلوبة (من النظام)
                </h3>
                <div className="relative z-10">
                  <input
                    value={docSearch}
                    onChange={(e) => setDocSearch(e.target.value)}
                    placeholder="بحث في المستندات..."
                    className="w-full text-xs font-bold border-2 border-amber-100 rounded-2xl p-4 pr-12 focus:outline-none focus:border-amber-400 bg-white"
                  />
                  <Search className="w-5 h-5 text-amber-400 absolute right-4 top-4" />
                </div>
                <div className="flex-1 min-h-[300px] max-h-80 overflow-y-auto custom-scrollbar border-2 border-amber-100 bg-white rounded-2xl p-2 space-y-1 relative z-10">
                  {isLoadingDocs ? (
                    <div className="flex justify-center py-10">
                      <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
                    </div>
                  ) : (
                    availableDocs
                      .filter(
                        (d) =>
                          (d.name || "").includes(docSearch) ||
                          (d.code || "").includes(docSearch),
                      )
                      .map((doc) => (
                        <div
                          key={doc.id} // مفتاح فريد
                          className="..."
                        >
                          <label className="flex items-start gap-3 cursor-pointer w-full">
                            <input
                              // استخدام || [] لضمان عدم الانهيار إذا كانت القيمة undefined
                              checked={(formData.requiredDocs || []).includes(
                                doc.id,
                              )}
                              onChange={() => handleDocToggle(doc.id)}
                              className="mt-1.5 accent-amber-500 rounded-sm w-4 h-4 border-slate-300"
                              type="checkbox"
                            />
                            <div className="flex flex-col flex-1 border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-700">
                              <span className="text-xs font-black text-slate-700">
                                {doc.title}{" "}
                                <span className="font-mono text-slate-400 ml-1 text-[10px] bg-slate-100 px-1.5 py-0.5 rounded">
                                  {doc.code}
                                </span>
                              </span>
                              <span className="text-[10px] text-slate-500 font-bold mt-1.5 border-t border-slate-100 pt-1.5">
                                {doc.category || "عام"}
                              </span>
                            </div>
                          </label>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case "المراحل والتحقق":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in">
            {renderDynamicList(
              "مراحل التنفيذ المجدولة",
              <Clock className="w-5 h-5 text-blue-500" />,
              "stages",
              "stage",
              "اكتب اسم المرحلة...",
              "لم تتم إضافة مراحل",
              "blue",
            )}
            {renderDynamicList(
              "بنود التحقق (Checklist)",
              <ListChecks className="w-5 h-5 text-emerald-500" />,
              "checklists",
              "check",
              "اكتب بند التحقق...",
              "لا يوجد بنود تحقق",
              "emerald",
            )}
          </div>
        );

      case "إعدادات متقدمة":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in">
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm relative overflow-hidden group">
                <h3 className="text-sm font-black text-slate-800 mb-5 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-slate-500" /> إعدادات النشر
                </h3>
                <div className="space-y-5">
                  <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200">
                    <div>
                      <h4 className="text-xs font-black text-slate-800">
                        حالة الخدمة
                      </h4>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:bg-emerald-500 shadow-inner after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                    </label>
                  </div>
                  <div className="flex flex-col gap-3 p-4 bg-white rounded-2xl border border-slate-200">
                    <div>
                      <h4 className="text-xs font-black text-slate-800">
                        رؤية الخدمة
                      </h4>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          setFormData((p) => ({ ...p, visibility: "public" }))
                        }
                        className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${formData.visibility === "public" ? "bg-indigo-50 border-indigo-200 text-indigo-700" : "bg-slate-50 border-slate-200"}`}
                      >
                        <Users className="w-3.5 h-3.5" />
                        بوابة عامة
                      </button>
                      <button
                        onClick={() =>
                          setFormData((p) => ({ ...p, visibility: "private" }))
                        }
                        className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${formData.visibility === "private" ? "bg-indigo-50 border-indigo-200 text-indigo-700" : "bg-slate-50 border-slate-200"}`}
                      >
                        <Folder className="w-3.5 h-3.5" />
                        استخدام داخلي
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              {renderDynamicList(
                "الكلمات الدلالية (Tags)",
                <Tag className="w-5 h-5 text-sky-500" />,
                "tags",
                "tag",
                "اكتب الكلمة الدلالية...",
                "لم يتم إضافة كلمات دلالية",
                "sky",
              )}
            </div>

            <div className="space-y-6">
              <div className="bg-white p-6 rounded-3xl border border-amber-100/60 shadow-sm relative overflow-hidden group">
                <h3 className="text-sm font-black text-amber-900 mb-2 flex items-center gap-2">
                  <Users className="w-5 h-5 text-amber-500" /> الفئة المستهدفة
                </h3>
                <div className="grid grid-cols-2 gap-3 mt-4">
                  {[
                    { key: "individuals", label: "أفراد" },
                    { key: "companies", label: "شركات ومؤسسات" },
                    { key: "government", label: "جهات حكومية" },
                    { key: "charities", label: "جمعيات خيرية" },
                  ].map((aud) => (
                    <label
                      key={aud.key}
                      className="flex items-center gap-3 p-3.5 bg-white border rounded-2xl cursor-pointer hover:bg-slate-50"
                    >
                      <input
                        type="checkbox"
                        checked={formData.targetAudience[aud.key]}
                        onChange={() => handleAudienceChange(aud.key)}
                        className="w-4.5 h-4.5 text-amber-600 rounded"
                      />
                      <span className="text-xs font-black text-slate-700">
                        {aud.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-purple-100/60 shadow-sm relative overflow-hidden group">
                <h3 className="text-sm font-black text-purple-900 mb-2 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-500" /> إرشادات
                  داخلية
                </h3>
                <textarea
                  name="internalNotes"
                  value={formData.internalNotes}
                  onChange={handleChange}
                  rows="6"
                  className="w-full mt-4 border border-purple-200 rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-purple-500 outline-none resize-none bg-white custom-scrollbar"
                  placeholder="اكتب الإرشادات..."
                />
              </div>
            </div>
          </div>
        );

      case "الأداء":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in">
            <div className="bg-white p-8 rounded-3xl border border-slate-200/60 flex flex-col items-center justify-center gap-2 shadow-sm relative">
              <h4 className="text-xs font-black text-slate-500 uppercase flex items-center gap-1.5">
                <Clock className="w-4 h-4" /> مدة الإنجاز
              </h4>
              <div className="text-6xl font-black text-indigo-700 tracking-tight my-4">
                {formData.duration || 0}{" "}
                <span className="text-2xl text-indigo-400">يوم</span>
              </div>
            </div>
            <div className="bg-white p-8 rounded-3xl border border-slate-200/60 flex flex-col items-center justify-center gap-2 shadow-sm relative">
              <h4 className="text-xs font-black text-slate-500 uppercase flex items-center gap-1.5">
                <Banknote className="w-4 h-4" /> السعر المستهدف
              </h4>
              <div className="text-6xl font-black text-emerald-600 tracking-tight my-4">
                {formData.price || 0}
              </div>
            </div>
            <div className="col-span-1 md:col-span-2 bg-gradient-to-br from-indigo-600 to-indigo-900 p-8 rounded-3xl border border-indigo-500/30 shadow-xl relative">
              <div className="relative z-10">
                <h4 className="text-xs font-black text-indigo-200 uppercase mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  رؤية تحليلية
                </h4>
                <p className="text-sm text-indigo-50 font-bold leading-loose text-right bg-black/10 p-5 rounded-2xl border border-white/5">
                  الخدمة{" "}
                  <span className="text-amber-300">
                    "{formData.name || "بدون اسم"}"
                  </span>{" "}
                  تتضمن{" "}
                  <span className="font-mono bg-white/20 px-2 py-0.5 rounded mx-1">
                    {formData.stages.length}
                  </span>{" "}
                  مراحل و{" "}
                  <span className="font-mono bg-white/20 px-2 py-0.5 rounded mx-1">
                    {formData.requiredDocs.length}
                  </span>{" "}
                  متطلبات ورقية.
                </p>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 w-full bg-slate-50 rounded-3xl flex flex-col max-h-[90vh]">
      <div className="sticky top-0 z-30 flex items-center justify-between bg-white/95 backdrop-blur-xl p-4 border-b border-slate-200/80 shadow-sm rounded-t-3xl">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center shadow-lg">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-800">
              {formData.name || (initialData ? "تعديل الخدمة" : "خدمة جديدة")}
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[9px] font-mono font-black text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                {formData.code}
              </span>
            </div>
          </div>
        </div>
        <div className="hidden lg:flex gap-1 bg-slate-100/80 p-1 rounded-full border border-slate-200/50">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-[11px] font-black rounded-full transition-all duration-300 ${activeTab === tab ? "bg-white text-indigo-700 shadow-sm border border-slate-200/80" : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/50"}`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 border-r border-slate-200/60 pr-4">
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-full text-xs font-black shadow-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}{" "}
            {initialData ? "تحديث" : "حفظ"}
          </button>
        </div>
      </div>

      {/* Tabs Mobile */}
      <div className="flex lg:hidden gap-1.5 overflow-x-auto p-3 border-b border-slate-200 bg-white custom-scrollbar shrink-0">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-xs font-black rounded-full transition-all whitespace-nowrap shrink-0 ${activeTab === tab ? "bg-indigo-50 text-indigo-700 border border-indigo-200" : "bg-slate-50 text-slate-500 border border-slate-200"}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
        {renderTabContent()}
      </div>
    </div>
  );
}
