import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { usePermissionBuilder } from "../../context/PermissionBuilderContext";
import AccessControl from "../../components/AccessControl";
import { toast } from "sonner";

import { TransactionDetailsModal } from "../../components/TransactionDetails/components/TransactionDetailsModal";

import {
  Search,
  Download,
  RefreshCw,
  Loader2,
  TrendingUp,
  Wallet,
  Clock,
  CheckCircle,
  Building,
  FileText,
  X,
  ArrowUpRight,
  PlusCircle,
  ShieldCheck,
  Settings,
  Trash2,
  Save,
  ChevronDown,
  Phone,
  User,
  Activity
} from "lucide-react";

const DetailsOfficeDashboard = ({ onClose }) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { isBuildMode } = usePermissionBuilder();
  const userPermissions = user?.permissions || [];
  const isSuperAdmin = user?.email === "admin@wms.com";

  // إعدادات العرض والصلاحيات
  const hasFinanceAccess =
    isSuperAdmin || isBuildMode || userPermissions.includes("TXN_COL_TOTAL");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTx, setSelectedTx] = useState(null);
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);

  // حالات المودال (إضافة / تعديل المكتب الرئيسي)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // "add" or "edit"

  const initialForm = {
    name: "مكتب ديتيلز للاستشارات الهندسية", // افتراضي
    contactName: "",
    phone: "",
    agreementType: "شهري ثابت",
    monthlyAmount: "",
    responsibleId: "",
    isLinkedToSystem: "مفعل",
    notes: "الكيان الرئيسي والإدارة التشغيلية للنظام.",
    isMainBranch: true,
  };
  const [formData, setFormData] = useState(initialForm);

  // 1. جلب البيانات
  const {
    data: transactions = [],
    isLoading: txLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["private-transactions-details-office"],
    queryFn: async () => {
      const res = await api.get("/private-transactions");
      return res.data?.data || [];
    },
  });

  const { data: coopOffices = [], isLoading: officesLoading } = useQuery({
    queryKey: ["coop-offices-list"],
    queryFn: async () => (await api.get("/coop-offices")).data?.data || [],
  });

  // جلب سجل الأشخاص لاختيار المسؤول (للمودال)
  const { data: persons = [] } = useQuery({
    queryKey: ["persons-directory"],
    queryFn: async () => {
      const res = await api.get("/persons");
      return res.data?.data || [];
    },
  });
  const staffOnly = persons.filter(
    (p) => p.role === "موظف" || p.role === "شريك",
  );

  // البحث عن المكتب الرئيسي في قاعدة البيانات
  const mainOffice = coopOffices.find((o) => o.isMainBranch === true);
  const isLoading = txLoading || officesLoading;

  // 2. Mutations للإدارة (إضافة، تعديل، حذف)
  const saveMainOfficeMutation = useMutation({
    mutationFn: async (data) => {
      const payload = { ...data, isMainBranch: true }; // ضمان أنه رئيسي دائماً
      if (modalMode === "add") {
        return await api.post("/coop-offices", payload);
      } else {
        return await api.put(`/coop-offices/${mainOffice.id}`, payload);
      }
    },
    onSuccess: () => {
      toast.success(
        modalMode === "add"
          ? "تم تسجيل المكتب الرئيسي بنجاح"
          : "تم تعديل بيانات المكتب الرئيسي بنجاح",
      );
      queryClient.invalidateQueries(["coop-offices-list"]);
      setIsModalOpen(false);
      setFormData(initialForm);
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "حدث خطأ أثناء حفظ بيانات المكتب",
      );
    },
  });

  const deleteMainOfficeMutation = useMutation({
    mutationFn: async (id) => await api.delete(`/coop-offices/${id}`),
    onSuccess: () => {
      toast.success("تم حذف وإلغاء تهيئة المكتب الرئيسي بنجاح");
      queryClient.invalidateQueries(["coop-offices-list"]);
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "حدث خطأ أثناء الحذف"),
  });

  // 3. منطق الفلترة الصارم للمكتب الرئيسي فقط
  const filteredData = useMemo(() => {
    if (!mainOffice) return [];

    return transactions.filter((tx) => {
      const isDesigner =
        tx.designerOfficeId === mainOffice.id ||
        tx.requestData?.designerOffice === mainOffice.id;
      const isSupervisor =
        tx.supervisorOfficeId === mainOffice.id ||
        tx.requestData?.supervisorOffice === mainOffice.id;
      const isTextMatch =
        (tx.designerOfficeId &&
          tx.designerOfficeId.includes(mainOffice.name)) ||
        (tx.supervisorOfficeId &&
          tx.supervisorOfficeId.includes(mainOffice.name));

      const isDetailsMatch = isDesigner || isSupervisor || isTextMatch;

      const matchesSearch =
        searchQuery === "" ||
        tx.ref?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.client?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.internalName?.toLowerCase().includes(searchQuery.toLowerCase());

      return isDetailsMatch && matchesSearch;
    });
  }, [transactions, searchQuery, mainOffice]);

  // 4. حساب الإحصائيات المالية للمكتب
  const stats = useMemo(() => {
    return filteredData.reduce(
      (acc, tx) => {
        acc.total += parseFloat(tx.totalFees) || 0;
        acc.paid += parseFloat(tx.paidAmount) || 0;
        acc.pending +=
          (parseFloat(tx.totalFees) || 0) - (parseFloat(tx.paidAmount) || 0);
        if (tx.status === "مكتملة") acc.completedCount++;
        else acc.activeCount++;
        return acc;
      },
      { total: 0, paid: 0, pending: 0, completedCount: 0, activeCount: 0 },
    );
  }, [filteredData]);

  // ==============================================================
  // Handlers
  // ==============================================================
  const handleRowClick = (tx) => {
    setSelectedTx(tx);
    setIsTxModalOpen(true);
  };

  const handleOpenAddModal = () => {
    setModalMode("add");
    setFormData(initialForm);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = () => {
    if (!mainOffice) return;
    setModalMode("edit");
    setFormData({
      name: mainOffice.name,
      contactName:
        mainOffice.contactName === "غير محدد" ? "" : mainOffice.contactName,
      phone: mainOffice.phone === "—" ? "" : mainOffice.phone,
      agreementType: mainOffice.agreementType,
      monthlyAmount: mainOffice.monthlyAmount?.replace(/[^\d.]/g, "") || "",
      responsibleId: mainOffice.responsibleId || "",
      isLinkedToSystem: mainOffice.isLinkedToSystem,
      notes: mainOffice.notes === "لا توجد ملاحظات" ? "" : mainOffice.notes,
      isMainBranch: true,
    });
    setIsModalOpen(true);
  };

  const handleDeleteMainOffice = () => {
    if (
      window.confirm(
        "تحذير خطير: هل أنت متأكد من حذف المكتب الرئيسي (ديتيلز) بالكامل من النظام؟ سيؤدي ذلك إلى فقدان الربط المباشر مع معاملاته في هذه الشاشة!",
      )
    ) {
      deleteMainOfficeMutation.mutate(mainOffice.id);
    }
  };

  const handleSubmitMainOffice = () => {
    if (!formData.name) return toast.error("اسم المكتب مطلوب");
    saveMainOfficeMutation.mutate(formData);
  };

  // ==============================================================
  // شاشة التهيئة: تظهر إذا لم يتم العثور على مكتب رئيسي في النظام
  // ==============================================================
  if (!isLoading && !mainOffice) {
    return (
      <div
        className="flex flex-col h-full bg-slate-50 font-sans p-6 relative"
        dir="rtl"
      >
        {onClose && (
          <div className="flex justify-end mb-4">
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        )}
        <div className="flex-1 flex flex-col items-center justify-center p-10 max-w-2xl mx-auto text-center">
          <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-6 shadow-inner border-4 border-white">
            <ShieldCheck className="w-12 h-12 text-blue-600" />
          </div>
          <h2 className="text-3xl font-black text-slate-800 mb-3 tracking-tight">
            تهيئة المركز الرئيسي
          </h2>
          <p className="text-slate-500 mb-10 text-sm font-semibold leading-relaxed">
            لم يتم اكتشاف المكتب الرئيسي (مكتب ديتيلز) في النظام بعد.
            <br />
            يجب تسجيل الكيان الرئيسي لفرز معاملاته بشكل مستقل وتفعيل الإحصائيات
            المالية وعزله عن المكاتب المتعاونة.
          </p>
          <button
            onClick={handleOpenAddModal}
            className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-sm flex items-center gap-3 hover:bg-blue-700 hover:scale-105 transition-all shadow-[0_10px_40px_-10px_rgba(37,99,235,0.5)]"
          >
            <PlusCircle className="w-5 h-5" />
            تسجيل واعتماد "مكتب ديتيلز" الآن
          </button>
        </div>

        {/* مودال الإضافة لأول مرة */}
        {isModalOpen && (
          <OfficeFormModal
            mode={modalMode}
            formData={formData}
            setFormData={setFormData}
            onClose={() => setIsModalOpen(false)}
            onSubmit={handleSubmitMainOffice}
            isPending={saveMainOfficeMutation.isPending}
            staffOnly={staffOnly}
          />
        )}
      </div>
    );
  }

  // ==============================================================
  // لوحة التحكم الرئيسية (تظهر بعد التهيئـة)
  // ==============================================================
  return (
    <div className="flex flex-col h-full bg-slate-50 font-sans" dir="rtl">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex flex-wrap justify-between items-center gap-4 shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-[0_4px_20px_-4px_rgba(37,99,235,0.5)]">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-black text-slate-800">
              {mainOffice?.name || "إدارة المكتب الرئيسي"}
            </h2>
            <p className="text-[10px] md:text-xs text-slate-500 font-bold flex items-center gap-1.5 mt-0.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-500" /> المركز
              الرئيسي للإدارة والتشغيل
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* أزرار إدارة المكتب */}
          <AccessControl
            code="MANAGE_MAIN_OFFICE_CONFIG"
            name="إدارة إعدادات المكتب الرئيسي"
            moduleName="مكتب ديتيلز"
            fallback={<div />}
          >
            <button
              onClick={handleOpenEditModal}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors border border-slate-200"
            >
              <Settings className="w-3.5 h-3.5" /> الإعدادات
            </button>
            <button
              onClick={handleDeleteMainOffice}
              disabled={deleteMainOfficeMutation.isPending}
              className="flex items-center gap-1.5 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-bold transition-colors border border-red-100"
            >
              <Trash2 className="w-3.5 h-3.5" /> حذف
            </button>
          </AccessControl>

          <div className="w-px h-6 bg-slate-200 mx-1"></div>

          <button
            onClick={() => refetch()}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
            title="تحديث البيانات"
          >
            <RefreshCw
              className={`w-5 h-5 ${isRefetching ? "animate-spin text-blue-600" : ""}`}
            />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full transition-colors"
              title="إغلاق"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>

      <div className="p-4 md:p-6 space-y-6 flex-1 overflow-y-auto custom-scrollbar-slim">
        {/* معلومات سريعة عن المكتب */}
        {mainOffice && (
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap gap-6 items-center text-xs">
            <div className="flex items-center gap-2 text-slate-600">
              <User className="w-4 h-4 text-blue-500" />
              <span className="font-bold">المندوب:</span>
              <span className="font-black text-slate-800">
                {mainOffice.contactName || "—"}
              </span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Phone className="w-4 h-4 text-emerald-500" />
              <span className="font-bold">الهاتف:</span>
              <span className="font-mono font-black text-slate-800">
                {mainOffice.phone || "—"}
              </span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <FileText className="w-4 h-4 text-purple-500" />
              <span className="font-bold">نوع الاتفاق:</span>
              <span className="font-black text-slate-800">
                {mainOffice.agreementType}
              </span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Activity className="w-4 h-4 text-amber-500" />
              <span className="font-bold">حالة الربط:</span>
              <span
                className={`px-2 py-0.5 rounded font-black ${mainOffice.isLinkedToSystem === "مفعل" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}
              >
                {mainOffice.isLinkedToSystem}
              </span>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        {hasFinanceAccess && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="إجمالي الأتعاب"
              value={stats.total}
              icon={<TrendingUp />}
              color="blue"
            />
            <StatCard
              title="المبالغ المحصلة"
              value={stats.paid}
              icon={<CheckCircle />}
              color="emerald"
            />
            <StatCard
              title="مستحقات متبقية"
              value={stats.pending}
              icon={<Wallet />}
              color="amber"
            />
            <StatCard
              title="معاملات جارية"
              value={stats.activeCount}
              icon={<Clock />}
              color="purple"
              isCount
            />
          </div>
        )}

        {/* Table Section */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50">
            <div className="relative w-full sm:w-[400px]">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث برقم المعاملة، اسم العميل، أو الاسم المتداول..."
                className="w-full bg-white border border-slate-200 rounded-xl pr-10 pl-4 py-2.5 text-sm font-semibold outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-all shadow-sm"
              />
            </div>

            <AccessControl
              code="EXPORT_DETAILS_OFFICE_DATA"
              name="تصدير تقرير المكتب"
              moduleName="مكتب ديتيلز"
              fallback={<div />}
            >
              <button className="flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-2.5 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-900 transition-all shadow-md hover:shadow-lg">
                <Download className="w-4 h-4" /> تصدير التقرير
              </button>
            </AccessControl>
          </div>

          <div className="overflow-x-auto min-h-[300px]">
            <table className="w-full text-right border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 h-12">
                  <th className="px-6 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                    رقم المعاملة
                  </th>
                  <th className="px-6 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                    الاسم المتداول
                  </th>
                  <th className="px-6 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                    المالك
                  </th>
                  <th className="px-6 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                    الحي / القطاع
                  </th>
                  {hasFinanceAccess && (
                    <th className="px-6 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                      أتعاب المكتب
                    </th>
                  )}
                  <th className="px-6 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                    الحالة
                  </th>
                  <th className="px-6 text-[11px] font-black text-slate-500 uppercase tracking-wider text-center">
                    إدارة
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={hasFinanceAccess ? "7" : "6"}
                      className="py-20 text-center"
                    >
                      <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500 mb-3" />
                      <p className="text-sm text-slate-500 font-bold">
                        جاري تحميل المعاملات...
                      </p>
                    </td>
                  </tr>
                ) : filteredData.length > 0 ? (
                  filteredData.map((tx) => (
                    <tr
                      key={tx.id}
                      className="hover:bg-blue-50/50 transition-colors group"
                    >
                      <td
                        className="px-6 py-4 font-mono text-[11px] font-black text-blue-600 group-hover:underline cursor-pointer"
                        onClick={() => handleRowClick(tx)}
                      >
                        {tx.ref || tx.transactionCode || tx.id.substring(0, 8)}
                      </td>
                      <td className="px-6 py-4 text-xs font-black text-slate-800">
                        {tx.internalName || tx.notes?.internalName || "—"}
                      </td>
                      <td className="px-6 py-4 text-xs font-bold text-slate-600 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                          <User className="w-3 h-3" />
                        </div>
                        <span className="truncate max-w-[150px]">
                          {tx.client}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[11px] font-semibold text-slate-500">
                        {tx.district} <br />{" "}
                        <span className="text-[9px] text-slate-400">
                          {tx.sector}
                        </span>
                      </td>
                      {hasFinanceAccess && (
                        <td className="px-6 py-4 font-mono font-black text-slate-700">
                          {(parseFloat(tx.totalFees) || 0).toLocaleString()}{" "}
                          <span className="text-[9px] text-slate-400">ر.س</span>
                        </td>
                      )}
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-md border text-[10px] font-black whitespace-nowrap ${
                            tx.status === "مكتملة"
                              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                              : tx.status === "مجمّدة"
                                ? "bg-slate-100 border-slate-200 text-slate-600"
                                : "bg-blue-50 border-blue-200 text-blue-700"
                          }`}
                        >
                          {tx.status || "جارية"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleRowClick(tx)}
                          className="p-2 bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 rounded-lg text-slate-400 transition-all shadow-sm"
                          title="فتح المعاملة"
                        >
                          <ArrowUpRight className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={hasFinanceAccess ? "7" : "6"}
                      className="py-20 text-center"
                    >
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                        <FileText className="w-8 h-8 text-slate-300" />
                      </div>
                      <p className="text-sm text-slate-500 font-bold mb-1">
                        لا توجد معاملات مطابقة للبحث
                      </p>
                      <p className="text-[10px] text-slate-400">
                        تأكد من أن المكتب مرتبط كـ مصمم أو مشرف في المعاملات.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isTxModalOpen && (
        <TransactionDetailsModal
          isOpen={isTxModalOpen}
          onClose={() => setIsTxModalOpen(false)}
          tx={selectedTx}
          refetchTable={refetch}
        />
      )}

      {isModalOpen && (
        <OfficeFormModal
          mode={modalMode}
          formData={formData}
          setFormData={setFormData}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmitMainOffice}
          isPending={saveMainOfficeMutation.isPending}
          staffOnly={staffOnly}
        />
      )}
    </div>
  );
};

// ==============================================================
// Components Helpers
// ==============================================================

// مكون مساعد للبطاقات الإحصائية
const StatCard = ({ title, value, icon, color, isCount = false }) => {
  const colors = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-md transition-shadow flex items-center gap-4 group">
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 border ${colors[color]}`}
      >
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-bold text-slate-400 mb-1">{title}</p>
        <h3 className="text-xl font-black text-slate-800 font-mono tracking-tight">
          {isCount ? value : value.toLocaleString()}{" "}
          {!isCount && (
            <span className="text-[10px] font-bold text-slate-400 ml-1">
              ر.س
            </span>
          )}
        </h3>
      </div>
    </div>
  );
};

// مكون نافذة استمارة الإضافة / التعديل المخصصة للمكتب الرئيسي
const OfficeFormModal = ({
  mode,
  formData,
  setFormData,
  onClose,
  onSubmit,
  isPending,
  staffOnly,
}) => {
  return (
    <div
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200"
      dir="rtl"
    >
      <div className="bg-white rounded-2xl shadow-2xl flex flex-col w-full max-w-2xl overflow-hidden animate-in zoom-in-95">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl shadow-sm text-white">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-800">
                {mode === "add"
                  ? "اعتماد المركز الرئيسي"
                  : "تعديل إعدادات المكتب الرئيسي"}
              </h2>
              <p className="text-[10px] text-slate-500 font-bold">
                إدارة بيانات الربط والشراكة
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5 overflow-y-auto custom-scrollbar-slim max-h-[65vh]">
          <div className="md:col-span-2">
            <label className="block text-xs font-black text-slate-700 mb-1.5">
              اسم المكتب / الكيان الرئيسي *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-bold focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none transition-all"
              placeholder="مثال: مكتب ديتيلز للاستشارات الهندسية"
            />
          </div>
          <div>
            <label className="block text-xs font-black text-slate-700 mb-1.5">
              شخص التواصل / المندوب
            </label>
            <input
              type="text"
              value={formData.contactName}
              onChange={(e) =>
                setFormData({ ...formData, contactName: e.target.value })
              }
              className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-bold focus:border-blue-500 outline-none transition-all"
              placeholder="اسم المندوب أو المدير"
            />
          </div>
          <div>
            <label className="block text-xs font-black text-slate-700 mb-1.5">
              رقم الجوال
            </label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-mono font-bold text-right focus:border-blue-500 outline-none transition-all"
              placeholder="05xxxxxxxx"
            />
          </div>
          <div>
            <label className="block text-xs font-black text-slate-700 mb-1.5">
              نوع الاتفاق المالي
            </label>
            <div className="relative">
              <select
                value={formData.agreementType}
                onChange={(e) =>
                  setFormData({ ...formData, agreementType: e.target.value })
                }
                className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-bold focus:border-blue-500 outline-none appearance-none bg-white"
              >
                <option value="حسب عدد المعاملات">
                  حسب عدد المعاملات (نسبة/مقطوع)
                </option>
                <option value="شهري ثابت">مبلغ شهري ثابت</option>
                <option value="لكل معاملة على حدى">لكل معاملة على حدى</option>
              </select>
              <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-black text-slate-700 mb-1.5">
              المبلغ (في حال كان شهري ثابت)
            </label>
            <input
              type="number"
              disabled={formData.agreementType !== "شهري ثابت"}
              value={formData.monthlyAmount}
              onChange={(e) =>
                setFormData({ ...formData, monthlyAmount: e.target.value })
              }
              className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-mono font-bold disabled:bg-slate-100 disabled:text-slate-400 focus:border-blue-500 outline-none transition-all"
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-slate-700 mb-1.5">
              المسؤول من طرفنا
            </label>
            <div className="relative">
              <select
                value={formData.responsibleId}
                onChange={(e) =>
                  setFormData({ ...formData, responsibleId: e.target.value })
                }
                className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-bold focus:border-blue-500 outline-none appearance-none bg-white cursor-pointer"
              >
                <option value="">-- تفويض أو مسؤولية عامة --</option>
                {staffOnly.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.role})
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-700 mb-1.5">
              ربط المعاملات تلقائياً (API)
            </label>
            <div className="relative">
              <select
                value={formData.isLinkedToSystem}
                onChange={(e) =>
                  setFormData({ ...formData, isLinkedToSystem: e.target.value })
                }
                className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-bold focus:border-blue-500 outline-none appearance-none bg-white"
              >
                <option value="غير مفعل">غير مفعل (يدوي)</option>
                <option value="مفعل">مفعل (الربط المباشر مع المنصات)</option>
              </select>
              <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-black text-slate-700 mb-1.5">
              ملاحظات واشتراطات خاصة
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm font-bold focus:border-blue-500 outline-none min-h-[100px] resize-none transition-all bg-slate-50 focus:bg-white"
              placeholder="اكتب أي ملاحظات أو تفاصيل..."
            ></textarea>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-colors shadow-sm"
          >
            إلغاء
          </button>
          <button
            onClick={onSubmit}
            disabled={isPending}
            className="flex items-center justify-center gap-2 px-8 py-2.5 bg-blue-600 text-white text-xs font-black rounded-xl hover:bg-blue-700 transition-all shadow-md disabled:opacity-50"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {mode === "add" ? "اعتماد وتسجيل المركز" : "حفظ التعديلات"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetailsOfficeDashboard;
