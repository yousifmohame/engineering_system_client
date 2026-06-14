import React, { useState, useEffect } from "react";
import { Briefcase, Plus, FileText, CheckCircle, Clock, Eye } from "lucide-react";
// افترضنا أنك أنشأت ملف jobOfferApi.js في مجلد api
import { getAllJobOffers } from "../../../../api/jobOfferApi"; 
import CreateJobOfferModal from "./CreateJobOffer/CreateJobOfferModal";
import AcceptJobOfferModal from "./models/AcceptJobOfferModal";

export default function JobOffersScreen({ onNavigate }) {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedOfferForAccept, setSelectedOfferForAccept] = useState(null);

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const data = await getAllJobOffers();
      setOffers(data);
    } catch (error) {
      console.error("خطأ في جلب العروض:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      {/* رأس الشاشة */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-blue-600" />
            سجل العروض الوظيفية
          </h2>
          <p className="text-xs text-gray-500 mt-1">إدارة مسودات العروض وتسجيل قبول المرشحين</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-800 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" />
          إنشاء عرض وظيفي
        </button>
      </div>

      {/* الجدول */}
      <div className="flex-1 overflow-auto custom-scrollbar-slim border border-gray-200 rounded-lg">
        {loading ? (
          <div className="flex justify-center items-center h-32 text-gray-500">جاري التحميل...</div>
        ) : (
          <table className="w-full text-right text-sm">
            <thead className="bg-gray-50 text-gray-700 sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="p-3 font-bold">اسم المرشح</th>
                <th className="p-3 font-bold">المسمى الوظيفي</th>
                <th className="p-3 font-bold">الراتب الأساسي</th>
                <th className="p-3 font-bold">تاريخ الإنشاء</th>
                <th className="p-3 font-bold">الحالة</th>
                <th className="p-3 font-bold text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {offers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500">لا توجد عروض وظيفية حالياً</td>
                </tr>
              ) : (
                offers.map((offer) => (
                  <tr key={offer.id} className="hover:bg-blue-50/50 transition-colors">
                    <td className="p-3 font-semibold text-gray-800">{offer.candidateName}</td>
                    <td className="p-3 text-gray-600">{offer.jobTitle}</td>
                    <td className="p-3 text-emerald-600 font-bold">{offer.basicSalary} ر.س</td>
                    <td className="p-3 text-gray-500">
                      {new Date(offer.createdAt).toLocaleDateString("ar-SA")}
                    </td>
                    <td className="p-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                        offer.status === 'ACCEPTED' ? 'bg-green-100 text-green-700' :
                        offer.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {offer.status === 'ACCEPTED' && <CheckCircle className="w-3 h-3" />}
                        {offer.status === 'PENDING' && <Clock className="w-3 h-3" />}
                        {offer.status === 'DRAFT' && <FileText className="w-3 h-3" />}
                        {offer.status === 'ACCEPTED' ? 'مقبول' : offer.status === 'PENDING' ? 'بانتظار التوقيع' : 'مسودة'}
                      </span>
                    </td>
                    <td className="p-3 flex justify-center gap-2">
                      <button className="p-1.5 text-blue-600 bg-blue-50 rounded hover:bg-blue-100" title="معاينة العرض">
                        <Eye className="w-4 h-4" />
                      </button>
                      
                      {offer.status !== 'ACCEPTED' && (
                        <button
                          onClick={() => setSelectedOfferForAccept(offer)}
                          className="p-1.5 text-green-600 bg-green-50 rounded hover:bg-green-100 font-bold text-xs flex items-center gap-1"
                        >
                          <CheckCircle className="w-3 h-3" />
                          تسجيل قبول
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {isCreateModalOpen && (
        <CreateJobOfferModal
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={fetchOffers}
        />
      )}

      {selectedOfferForAccept && (
        <AcceptJobOfferModal
          offer={selectedOfferForAccept}
          onClose={() => setSelectedOfferForAccept(null)}
          onSuccess={fetchOffers}
          onNavigate={onNavigate}
        />
      )}
    </div>
  );
}