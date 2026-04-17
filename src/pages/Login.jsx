import React, { useState } from 'react';
import { LogIn, Eye, EyeOff, Building2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await login(identifier, password);
      if (!result?.success && result?.message) {
        setError(result.message);
      }
    } catch (err) {
      setError(err?.message || 'حدث خطأ أثناء تسجيل الدخول');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-red-900 flex items-center justify-center px-4"
      dir="rtl"
    >
      <div className="max-w-md w-full space-y-8">
        
        {/* الشعار والعنوان */}
        <div className="text-center">
          <div className="flex justify-center mb-8 mt-4">
            <img 
              src="/logo.jpeg" 
              alt="الشعار" 
              className="h-20 rounded-xl w-auto object-contain mb-2"
              onError={(e) => {
                const target = e.target;
                target.style.display = 'none';
                const fallback = target.nextElementSibling;
                if (fallback) fallback.style.display = 'flex';
              }}
            />
            <div className="w-20 h-20 bg-gradient-to-br from-red-600 to-red-700 rounded-xl hidden items-center justify-center shadow-2xl">
              <Building2 className="text-white w-10 h-10" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white mb-4 mt-2">
            النظام الهندسي المتكامل
          </h2>
          <p className="text-gray-300 mb-6">
            قم بتسجيل الدخول للمتابعة
          </p>
        </div>

        {/* بطاقة النموذج الزجاجية */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* رسالة الخطأ */}
            {error && (
              <div className="p-3 bg-red-500/20 border border-red-500/50 text-red-200 text-sm rounded-lg text-center">
                {error}
              </div>
            )}

            {/* حقل معرف الدخول */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2 text-right">
                بيانات الدخول (الرقم الوظيفي، الجوال، الإيميل)
              </label>
              <input
                type="text"
                required
                dir="ltr"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 text-left font-mono text-sm"
                placeholder="EMP-1001 أو 05XXXXXXXX"
              />
            </div>

            {/* حقل كلمة المرور */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2 text-right">
                كلمة المرور
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  dir="ltr"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 pr-12 text-left font-mono"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-300 hover:text-white transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* زر الدخول */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-3 px-4 rounded-lg font-medium hover:from-red-700 hover:to-red-800 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 space-x-reverse"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <LogIn size={20} />
                  <span>تسجيل الدخول</span>
                </>
              )}
            </button>
          </form>

          {/* معلومات إضافية */}
          <div className="mt-6 pt-4 border-t border-white/20">
            <p className="text-sm text-gray-300 text-center">
              يدعم الدخول بالرقم الوظيفي أو رقم الجوال أو البريد الإلكتروني
            </p>
          </div>
        </div>

        {/* التذييل */}
        <p className="text-center text-gray-400 text-sm mt-8 mb-12">
          الإصدار 2.0.0 - جميع الحقوق محفوظة © 2024
        </p>
      </div>
    </div>
  );
};

export default Login;