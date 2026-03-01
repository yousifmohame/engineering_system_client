import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Building2, Lock, User, Loader2 } from "lucide-react"; // 👈 استبدال Mail بـ User

const Login = () => {
  // 👈 تغيير الاسم لـ identifier ليعبر عن أي طريقة دخول
  const [identifier, setIdentifier] = useState(""); 
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    // 👈 إرسال الـ identifier بدلاً من الإيميل
    const result = await login(identifier, password);

    if (!result.success) {
      setError(result.message);
      setIsSubmitting(false);
    }
    // التوجيه سيتم تلقائياً من داخل AuthContext عند النجاح
  };

  return (
    <div
      className="min-h-screen bg-slate-900 flex items-center justify-center p-4 direction-rtl"
      dir="rtl"
    >
      {/* الخلفية الزخرفية */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-blue-600/10 blur-[100px] rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-emerald-600/10 blur-[100px] rounded-full"></div>
      </div>

      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative z-10">
        {/* الهيدر */}
        <div className="bg-slate-50 p-8 text-center border-b border-gray-100">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-600/30">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">
            النظام الهندسي المتكامل
          </h1>
          <p className="text-gray-500 text-sm mt-2">
            قم بتسجيل الدخول للمتابعة
          </p>
        </div>

        {/* النموذج */}
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm font-bold rounded-lg border border-red-100 text-center">
                {error}
              </div>
            )}

            <div className="space-y-2">
              {/* 👈 تحديث الوصف ليعكس الخيارات الجديدة */}
              <label className="text-sm font-bold text-gray-700 block text-right">
                بيانات الدخول (الرقم الوظيفي، الجوال، الإيميل)
              </label>
              <div className="relative">
                <User className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text" // 👈 تحويله من email إلى text ليقبل أرقام وحروف
                  required
                  dir="ltr" // 👈 جعله LTR لسهولة كتابة الأرقام والإنجليزية
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full pr-10 pl-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-left font-mono text-sm"
                  placeholder="EMP-1001 أو 05XXXXXXXX"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 block text-right">
                كلمة المرور
              </label>
              <div className="relative">
                <Lock className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  required
                  dir="ltr"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pr-10 pl-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-left font-mono"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-lg transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  جاري التحقق...
                </>
              ) : (
                "تسجيل الدخول"
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-gray-400 font-bold">
            الإصدار 2.0.0 - جميع الحقوق محفوظة
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;