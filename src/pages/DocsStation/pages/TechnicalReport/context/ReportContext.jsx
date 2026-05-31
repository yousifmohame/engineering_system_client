import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../../../../../api/axios";
import { toast } from "sonner";

const ReportContext = createContext();
export const useReport = () => useContext(ReportContext);

export const ReportProvider = ({ children, existingReportId = null }) => {
  const [activeStep, setActiveStep] = useState("LINKING");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [reportId, setReportId] = useState(existingReportId);
  const [reportSerial, setReportSerial] = useState("جاري التوليد...");

  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState(null);

  const [data, setData] = useState({
    purpose: "إصدار رخصة بناء",
    template: "TPL-TECH-STD-01",
    ownerName: "",
    ownerId: "",
    ownerType: "مالك",
    showOwnerName: true,
    maskOwnerId: true,
    deedNumber: "",
    deedDate: "",
    district: "",
    planNumber: "",
    plotNumber: "",
    areaDeed: "",
    areaSite: "",
    areaLicense: "",
    licenseStatus: "لا توجد رخصة",
    licenseNumber: "",
    licenseDate: "",
    usageLicensed: "سكني",
    usageExisting: "أرض فضاء",
    // سيتم استبدال هذه المصفوفات عند وجود بيانات في الصك أو المعاملة
    components: [
      {
        id: 1,
        level: "أرضي",
        usage: "مجلس وصالة وغرف خدمات",
        site: "0",
        license: "0",
        proposed: "0",
        notes: "مطابق",
      },
    ],
    setbacks: [
      {
        id: 1,
        direction: "شمال",
        bound: "شارع",
        length: "0",
        system: "0",
        site: "0",
        proposed: "0",
      },
    ],
    compliance: {
      nameMatch: "مطابق",
      plotMatch: "مطابق",
      areaMatch: "يحتاج مراجعة",
      usageMatch: "مطابق",
      componentsMatch: "مطابق",
    },
    technicalNotes:
      "نفيدكم نحن مكتب ديتيلز للاستشارات الهندسية بأنه تم وقوف المهندس المختص الفني على موقع العقار المذكور بموجب صك الملكية، وبعد الاطلاع والمطابقة على الطبيعة، تبين ما يلي:\n\nيلزم التحقق من مطابقة المساحة النهائية مع الصك قبل الرفع.",
    settings: {
      showHeaderCover: true,
      showHeaderInner: true,
      showFooterInner: true,
      showQR: true,
      showSerial: true,
      showStamp: false,
      style: "رسمي مختصر",
    },
  });

  const updateData = (field, value) =>
    setData((prev) => ({ ...prev, [field]: value }));
  const updateNestedData = (section, field, value) =>
    setData((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
  const updateArrayItem = (arrayName, id, field, value) =>
    setData((prev) => ({
      ...prev,
      [arrayName]: prev[arrayName].map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    }));

  // ==============================================================
  // 🧠 المترجم الذكي (Smart Parser): يفهم مختلف التسميات من قاعدة البيانات
  // ==============================================================
  const parseDatabaseJson = (jsonField, type) => {
    if (!jsonField) return [];
    try {
      // فك التشفير إذا كان نصياً
      const parsed =
        typeof jsonField === "string" ? JSON.parse(jsonField) : jsonField;
      if (!Array.isArray(parsed) || parsed.length === 0) return [];

      if (type === "components") {
        return parsed.map((c, index) => ({
          id: index + 1,
          level: c.level || c.floor || c.name || "أرضي", // التقاط أي مسمى للدور
          usage: c.usage || c.description || c.type || "سكني",
          site: c.existingArea || c.area || c.site || "0",
          license: c.licensedArea || c.license || c.area || "0",
          proposed: c.proposedArea || c.proposed || c.area || "0",
          notes: c.notes || c.note || "مطابق",
        }));
      }

      if (type === "setbacks") {
        return parsed.map((b, index) => ({
          id: index + 1,
          direction: b.direction || b.side || "شمال", // التقاط أي مسمى للجهة
          bound: b.neighbor || b.bound || b.limit || b.boundary || "شارع", // التقاط اسم الحد
          length: b.length || b.size || "0",
          system: b.systemSetback || b.system || "0",
          site: b.existingSetback || b.site || "0",
          proposed: b.proposedSetback || b.proposed || "0",
        }));
      }
    } catch (e) {
      console.error(`Failed to parse JSON for ${type}`, e);
      return [];
    }
  };

  // ==============================================================
  // 📥 جلب تقرير فني محفوظ مسبقاً (Edit Mode)
  // ==============================================================
  useEffect(() => {
    if (!existingReportId) return;

    const fetchExistingReport = async () => {
      setIsLoading(true);
      try {
        const res = await api.get(`/technical-reports/${existingReportId}`);
        const report = res.data?.data || res.data;

        if (report) {
          setReportId(report.id);
          setReportSerial(report.serialNumber);
          setSelectedTransaction(report.transactionId);
          setSelectedClient(report.clientId);
          setSelectedProperty(report.ownershipId);

          // تفريغ البيانات المحفوظة في حالة النظام
          setData({
            purpose: report.reportData?.purpose || "إصدار رخصة بناء",
            template: report.reportData?.template || "TPL-TECH-STD-01",
            ownerName: report.reportData?.ownerName || "",
            ownerId: report.reportData?.ownerId || "",
            ownerType: report.reportData?.ownerType || "مالك",
            showOwnerName: report.reportData?.showOwnerName ?? true,
            maskOwnerId: report.reportData?.maskOwnerId ?? true,
            deedNumber: report.reportData?.deedNumber || "",
            deedDate: report.reportData?.deedDate || "",
            district: report.reportData?.district || "",
            planNumber: report.reportData?.planNumber || "",
            plotNumber: report.reportData?.plotNumber || "",
            areaDeed: report.reportData?.areaDeed || "",
            areaSite: report.reportData?.areaSite || "",
            areaLicense: report.reportData?.areaLicense || "",
            licenseStatus: report.reportData?.licenseStatus || "لا توجد رخصة",
            licenseNumber: report.reportData?.licenseNumber || "",
            licenseDate: report.reportData?.licenseDate || "",
            usageLicensed: report.reportData?.usageLicensed || "سكني",
            usageExisting: report.reportData?.usageExisting || "أرض فضاء",
            
            components: report.components || [],
            setbacks: report.setbacks || [],
            compliance: report.compliance || {},
            technicalNotes: report.technicalNotes || "",
            settings: report.settings || { showHeaderCover: true, showHeaderInner: true, showFooterInner: true, showQR: true, showSerial: true, style: "رسمي مختصر" }
          });
        }
      } catch (error) {
        console.error("Failed to fetch existing report:", error);
        toast.error("فشل جلب تفاصيل التقرير");
      } finally {
        setIsLoading(false);
      }
    };

    fetchExistingReport();
  }, [existingReportId]); // 👈 هذا الـ Effect يعمل فقط عند فتح تقرير موجود

  // ==============================================================
  // 🚀 سحب البيانات آلياً (المعاملة، الصك، والعميل)
  // ==============================================================
  useEffect(() => {
    if (!selectedTransaction && !selectedProperty) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        let newData = { ...data };

        // --- 1. في حال تم اختيار معاملة ---
        if (selectedTransaction) {
          const res = await api.get(
            `/private-transactions/${selectedTransaction}`,
          );
          const tx = res.data?.data || res.data;

          if (tx) {
            // بيانات العميل
            if (tx.client) {
              setSelectedClient(tx.client.id);
              let cName =
                tx.client.officialNameAr || tx.client.name?.ar || "عميل النظام";
              if (typeof tx.client.name === "string") {
                try {
                  cName = JSON.parse(tx.client.name).ar || cName;
                } catch (e) {}
              }
              newData.ownerName = cName;
              newData.ownerId = tx.client.idNumber || tx.client.mobile || "";
              newData.ownerType =
                tx.client.type === "company" ? "مفوض" : "مالك";
            }

            // بيانات المعاملة والمساحات
            newData.district =
              tx.districtNode?.name || tx.districtName || tx.sector || "";
            newData.planNumber = tx.planNumber || "";
            newData.plotNumber = Array.isArray(tx.plots)
              ? tx.plots.join(" ، ")
              : tx.plots || "";
            newData.areaDeed = tx.landArea?.toString() || "";
            newData.areaSite = tx.landArea?.toString() || "";

            // المكونات والحدود المدمجة في المعاملة
            const txComponents = parseDatabaseJson(tx.components, "components");
            if (txComponents.length > 0) newData.components = txComponents;

            const txSetbacks = parseDatabaseJson(tx.setbacks, "setbacks");
            if (txSetbacks.length > 0) newData.setbacks = txSetbacks;

            // الرخصة
            if (tx.electronicLicenseNumber || tx.oldLicenseNumber) {
              newData.licenseStatus = tx.electronicLicenseNumber
                ? "حديثة إلكترونية"
                : "قديمة يدوية";
              newData.licenseNumber =
                tx.electronicLicenseNumber || tx.oldLicenseNumber;
              newData.licenseDate =
                tx.electronicLicenseHijriYear || tx.oldLicenseHijriYear || "";
            }
          }
        }

        // --- 2. في حال تم اختيار صك ملكية (سواء مع المعاملة أو وحده) ---
        if (selectedProperty) {
          // استدعاء بيانات الصك من الداتابيز
          const res = await api.get(`/properties/${selectedProperty}`);
          const prop = res.data?.data || res.data;

          if (prop) {
            newData.deedNumber = prop.deedNumber || newData.deedNumber;
            newData.deedDate = prop.deedDate
              ? new Date(prop.deedDate).toISOString().split("T")[0]
              : newData.deedDate;

            if (prop.districtNode) newData.district = prop.districtNode.name;
            if (prop.planNumber) newData.planNumber = prop.planNumber;
            if (prop.plotNumber) newData.plotNumber = prop.plotNumber;
            if (prop.area) {
              newData.areaDeed = prop.area.toString();
              newData.areaSite = prop.area.toString();
            }

            // 🎯 سحب الحدود والارتدادات من الصك
            const deedBoundaries = parseDatabaseJson(
              prop.boundaries,
              "setbacks",
            );
            if (deedBoundaries.length > 0) {
              newData.setbacks = deedBoundaries;
            }

            // 🎯 محاولة سحب المكونات من الذكاء الاصطناعي (لأن الصك لا يحتوي على مكونات عادة)
            if (prop.aiData) {
              try {
                const aiParsed =
                  typeof prop.aiData === "string"
                    ? JSON.parse(prop.aiData)
                    : prop.aiData;
                if (aiParsed.components) {
                  const aiComponents = parseDatabaseJson(
                    aiParsed.components,
                    "components",
                  );
                  if (aiComponents.length > 0)
                    newData.components = aiComponents;
                }
              } catch (e) {}
            }
          }
        }

        // تحديث الواجهة دفعة واحدة لتجنب أي تعارض
        setData(newData);
        toast.success("تم التزامن الآلي وسحب بيانات الصك والمعاملة بنجاح!");
      } catch (error) {
        console.error("Failed to sync data", error);
        toast.error("حدث خطأ أثناء جلب تفاصيل الصك أو المعاملة.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTransaction, selectedProperty]);

  // ==============================================================
  // 💾 دالة حفظ التقرير في قاعدة البيانات
  // ==============================================================
  const saveReport = async (status = "DRAFT") => {
    setIsSaving(true);
    try {
      const payload = {
        id: reportId,
        transactionId: selectedTransaction,
        clientId: selectedClient,
        ownershipId: selectedProperty,
        status: status,
        reportData: {
          purpose: data.purpose,
          template: data.template,
          ownerName: data.ownerName,
          ownerId: data.ownerId,
          ownerType: data.ownerType,
          showOwnerName: data.showOwnerName,
          maskOwnerId: data.maskOwnerId,
          deedNumber: data.deedNumber,
          deedDate: data.deedDate,
          district: data.district,
          planNumber: data.planNumber,
          plotNumber: data.plotNumber,
          areaDeed: data.areaDeed,
          areaSite: data.areaSite,
          areaLicense: data.areaLicense,
          licenseStatus: data.licenseStatus,
          licenseNumber: data.licenseNumber,
          licenseDate: data.licenseDate,
          usageLicensed: data.usageLicensed,
          usageExisting: data.usageExisting,
        },
        components: data.components,
        setbacks: data.setbacks,
        compliance: data.compliance,
        settings: data.settings,
        technicalNotes: data.technicalNotes,
      };

      const res = await api.post("/technical-reports", payload);
      setReportId(res.data.id);
      setReportSerial(res.data.serialNumber);

      toast.success(
        status === "COMPLETED" ? "تم اعتماد التقرير!" : "تم حفظ المسودة بنجاح",
      );
      return true;
    } catch (error) {
      toast.error("حدث خطأ أثناء الحفظ");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ReportContext.Provider
      value={{
        activeStep,
        setActiveStep,
        selectedTransaction,
        setSelectedTransaction,
        selectedClient,
        setSelectedClient,
        selectedProperty,
        setSelectedProperty,
        data,
        updateData,
        updateNestedData,
        updateArrayItem,
        isLoading,
        isSaving,
        saveReport,
        reportSerial,
      }}
    >
      {children}
    </ReportContext.Provider>
  );
};
