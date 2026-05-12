import React, { useEffect, useState } from 'react';
import {
  LogIn,
  Eye,
  EyeOff,
  UserRound,
  Lock,
  CalendarDays,
  Clock3,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ASSETS = '/login-assets/';

const getPart = (parts, type) => {
  return parts.find((part) => part.type === type)?.value || '';
};

const getNumericDate = (date, locale, timeZone = 'Asia/Riyadh') => {
  const parts = new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone,
  }).formatToParts(date);

  return `${getPart(parts, 'day')}/${getPart(parts, 'month')}/${getPart(parts, 'year')}`;
};

const getLongDate = (date, locale, timeZone = 'Asia/Riyadh') => {
  return new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone,
  }).format(date);
};

const getClock = (date, timeZone) => {
  const parts = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone,
  }).formatToParts(date);

  const dayPeriod = getPart(parts, 'dayPeriod');

  return {
    time: `${getPart(parts, 'hour')}:${getPart(parts, 'minute')}`,
    period: dayPeriod === 'AM' ? 'ص' : 'م',
  };
};

const InfoCard = ({ icon: Icon, label, value, subValue }) => {
  return (
    <div className="flex h-[58px] min-w-0 items-center gap-2 rounded-2xl border border-[#d8b46a]/28 bg-[rgba(255,245,226,0.30)] px-3 text-[#17475f] shadow-[0_8px_20px_rgba(20,53,74,0.08)] backdrop-blur-[3px]">
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/10 text-[#c5983c]">
        <Icon size={20} strokeWidth={1.9} />
      </div>

      <div className="min-w-0 flex-1 text-right">
        <p className="truncate text-[9px] font-bold leading-4 text-[#123f59]">
          {label}
        </p>

        <p className="truncate text-[14px] font-extrabold leading-5 text-[#b88326]">
          {value}
        </p>

        {subValue && (
          <p className="truncate text-[9px] leading-4 text-[#315463]">
            {subValue}
          </p>
        )}
      </div>
    </div>
  );
};

const FloatingTriangles = () => {
  const triangles = [
    {
      className: 'triangle triangle-one',
      style: {
        right: '4vw',
        top: '7vh',
        width: '86px',
        height: '76px',
      },
      fill: 'rgba(18, 63, 89, 0.16)',
    },
    {
      className: 'triangle triangle-two',
      style: {
        right: '14vw',
        top: '11vh',
        width: '46px',
        height: '41px',
      },
      fill: 'rgba(197, 152, 60, 0.18)',
    },
    {
      className: 'triangle triangle-three',
      style: {
        right: '8vw',
        top: '22vh',
        width: '66px',
        height: '58px',
      },
      fill: 'rgba(28, 107, 89, 0.15)',
    },
    {
      className: 'triangle triangle-four',
      style: {
        right: '20vw',
        top: '25vh',
        width: '34px',
        height: '30px',
      },
      fill: 'rgba(18, 63, 89, 0.13)',
    },
    {
      className: 'triangle triangle-five',
      style: {
        right: '12vw',
        top: '36vh',
        width: '54px',
        height: '48px',
      },
      fill: 'rgba(197, 152, 60, 0.15)',
    },
  ];

  return (
    <>
      <style>
        {`
          @keyframes triangleMoveOne {
            0% {
              transform: translate3d(0, 0, 0) rotate(0deg) scale(1);
            }
            50% {
              transform: translate3d(-14px, -12px, 0) rotate(7deg) scale(1.04);
            }
            100% {
              transform: translate3d(0, 0, 0) rotate(0deg) scale(1);
            }
          }

          @keyframes triangleMoveTwo {
            0% {
              transform: translate3d(0, 0, 0) rotate(16deg) scale(1);
            }
            50% {
              transform: translate3d(10px, 12px, 0) rotate(25deg) scale(1.05);
            }
            100% {
              transform: translate3d(0, 0, 0) rotate(16deg) scale(1);
            }
          }

          @keyframes triangleMoveThree {
            0% {
              transform: translate3d(0, 0, 0) rotate(-12deg) scale(1);
            }
            50% {
              transform: translate3d(-10px, 14px, 0) rotate(-4deg) scale(1.04);
            }
            100% {
              transform: translate3d(0, 0, 0) rotate(-12deg) scale(1);
            }
          }

          @keyframes triangleMoveFour {
            0% {
              transform: translate3d(0, 0, 0) rotate(8deg) scale(1);
            }
            50% {
              transform: translate3d(12px, -9px, 0) rotate(17deg) scale(1.06);
            }
            100% {
              transform: translate3d(0, 0, 0) rotate(8deg) scale(1);
            }
          }

          @keyframes triangleMoveFive {
            0% {
              transform: translate3d(0, 0, 0) rotate(-6deg) scale(1);
            }
            50% {
              transform: translate3d(-9px, -13px, 0) rotate(4deg) scale(1.05);
            }
            100% {
              transform: translate3d(0, 0, 0) rotate(-6deg) scale(1);
            }
          }

          .triangle {
            position: absolute;
            pointer-events: none;
            opacity: 1;
            filter: blur(0.15px);
            will-change: transform;
          }

          .triangle-one {
            animation: triangleMoveOne 9s ease-in-out infinite;
          }

          .triangle-two {
            animation: triangleMoveTwo 10.5s ease-in-out infinite;
          }

          .triangle-three {
            animation: triangleMoveThree 11s ease-in-out infinite;
          }

          .triangle-four {
            animation: triangleMoveFour 12s ease-in-out infinite;
          }

          .triangle-five {
            animation: triangleMoveFive 10s ease-in-out infinite;
          }
        `}
      </style>

      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        style={{ zIndex: 3 }}
      >
        {triangles.map((triangle, index) => (
          <svg
            key={index}
            className={triangle.className}
            style={triangle.style}
            viewBox="0 0 100 90"
            xmlns="http://www.w3.org/2000/svg"
          >
            <polygon points="50,4 96,86 4,86" fill={triangle.fill} />
          </svg>
        ))}
      </div>
    </>
  );
};

const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [now, setNow] = useState(new Date());

  const { login } = useAuth();

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const gregorianNumeric = getNumericDate(now, 'en-GB', 'Asia/Riyadh');
  const gregorianLong = getLongDate(now, 'ar-EG', 'Asia/Riyadh');

  const hijriNumeric = `${getNumericDate(
    now,
    'en-SA-u-ca-islamic-umalqura',
    'Asia/Riyadh'
  )} هـ`;

  const hijriLong = getLongDate(
    now,
    'ar-SA-u-ca-islamic-umalqura',
    'Asia/Riyadh'
  );

  const egyptClock = getClock(now, 'Africa/Cairo');
  const riyadhClock = getClock(now, 'Asia/Riyadh');

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
      dir="rtl"
      className="fixed inset-0 h-screen w-screen overflow-hidden bg-[#eadcc5]"
    >
      {/* Background */}
      <img
        src={`${ASSETS}login-bg.png`}
        alt=""
        className="absolute inset-0 z-0 h-full w-full object-cover brightness-[1.03] saturate-[1.10] contrast-[1.04]"
      />

      {/* Filtre arrière-plan léger */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-br from-[#123f59]/8 via-[#f6e7cb]/8 to-[#c8963a]/7" />
      <div className="absolute inset-0 z-[2] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.12),rgba(255,255,255,0.02)_45%,rgba(18,63,89,0.035)_100%)]" />

      {/* 5 triangles animés en haut à droite, derrière le texte */}
      <FloatingTriangles />

      {/* Center content */}
      <div className="relative z-10 flex h-full w-full flex-col items-center justify-center px-4">
        <div className="w-full max-w-[850px] -translate-y-[1vh]">
          {/* Logo */}
          <div className="mb-3 flex justify-center">
            <img
              src={`${ASSETS}logo-details.png`}
              alt="Details Consulting Engineers"
              className="h-auto max-h-[84px] w-auto max-w-[340px] object-contain drop-shadow-[0_3px_10px_rgba(0,0,0,0.12)]"
            />
          </div>

          {/* Title */}
          <div className="mb-4 text-center">
            <h1 className="text-[24px] font-extrabold leading-tight text-[#123f59] drop-shadow-[0_2px_4px_rgba(255,255,255,0.45)] sm:text-[28px]">
              نظام ديتيلز لإدارة العمل
            </h1>

            <div className="mt-2 flex items-center justify-center gap-4">
              <span className="h-px w-14 bg-[#c5983c]/90" />

              <p className="text-[14px] font-semibold tracking-wide text-[#43565a] sm:text-[16px]">
                Details WMS
              </p>

              <span className="h-px w-14 bg-[#c5983c]/90" />
            </div>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="mx-auto w-full max-w-[440px]"
          >
            {error && (
              <div className="mb-2 rounded-lg border border-red-300 bg-red-50/90 px-4 py-1.5 text-center text-xs text-red-700">
                {error}
              </div>
            )}

            {/* Identifier */}
            <div className="mb-4">
              <div className="relative border-b border-[#123f59]/75 pb-1.5">
                <UserRound
                  size={22}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-[#123f59]"
                />

                <input
                  type="text"
                  required
                  dir="ltr"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full bg-transparent pr-10 pl-3 text-center font-mono text-[15px] text-[#123f59] outline-none placeholder:text-[#53676d]"
                  placeholder="EMP-1001 أو 05XXXXXXXX"
                />
              </div>

              <p className="mt-1 text-center text-[11px] font-semibold text-[#425b60]">
                بيانات الدخول الرقم الوظيفي، الجوال، الإيميل
              </p>
            </div>

            {/* Password */}
            <div className="mb-4">
              <div className="relative border-b border-[#123f59]/75 pb-1.5">
                <Lock
                  size={21}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-[#123f59]"
                />

                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  dir="ltr"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent px-10 text-center font-mono text-[16px] text-[#123f59] outline-none placeholder:text-[#53676d]"
                  placeholder="كلمة المرور"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-0 top-1/2 -translate-y-1/2 text-[#123f59] transition hover:text-[#c5983c]"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={21} /> : <Eye size={21} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="mt-4 flex w-full items-center justify-center gap-3 rounded-2xl border border-[#d8b46a]/45 bg-gradient-to-r from-[#123f59] to-[#1a5874] px-5 py-3 text-[17px] font-bold text-white shadow-[0_14px_30px_rgba(18,63,89,0.30)] transition hover:from-[#10364c] hover:to-[#184d65] focus:outline-none focus:ring-2 focus:ring-[#d8b46a]/45 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              ) : (
                <>
                  <LogIn size={20} className="text-[#e2bf74]" />
                  <span>تسجيل الدخول</span>
                </>
              )}
            </button>

            {/* Helper text */}
            <p className="mt-2.5 text-center text-[11px] font-semibold text-[#425b60]">
              يدعم الدخول بالرقم الوظيفي أو رقم الجوال أو البريد الإلكتروني
            </p>
          </form>

          {/* Date / Time */}
          <div className="mx-auto mt-4 grid w-full max-w-[850px] grid-cols-2 gap-3 lg:grid-cols-4">
            <InfoCard
              icon={CalendarDays}
              label="التاريخ الميلادي"
              value={gregorianNumeric}
              subValue={gregorianLong}
            />

            <InfoCard
              icon={CalendarDays}
              label="التاريخ الهجري"
              value={hijriNumeric}
              subValue={hijriLong}
            />

            <InfoCard
              icon={Clock3}
              label="توقيت مصر"
              value={`${egyptClock.time} ${egyptClock.period}`}
            />

            <InfoCard
              icon={Clock3}
              label="توقيت الرياض"
              value={`${riyadhClock.time} ${riyadhClock.period}`}
            />
          </div>
        </div>

        {/* Footer */}
        <p className="absolute bottom-3 left-1/2 w-full -translate-x-1/2 text-center text-[12px] font-medium text-[#3d555f]">
          الإصدار 2.0.0 - جميع الحقوق محفوظة © 2024
        </p>
      </div>
    </div>
  );
};

export default Login;