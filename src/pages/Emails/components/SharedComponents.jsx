import React from "react";

export const LoadingSkeleton = () => (
  <div
    className="
      w-full max-w-full space-y-3 overflow-hidden
      p-2 animate-pulse
    "
    dir="rtl"
  >
    {[...Array(5)].map((_, i) => (
      <div
        key={i}
        className="
          relative w-full max-w-full overflow-hidden
          rounded-[24px] border border-[#d8b46a]/25
          bg-white/70 px-5 py-4
          shadow-[0_10px_26px_rgba(18,63,89,0.08)]
          backdrop-blur-xl
        "
      >
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-l from-white/35 via-[#f8efe0]/35 to-[#e8f0ef]/20" />

        <div className="relative z-10 flex min-w-0 items-center gap-4">
          <div className="flex shrink-0 flex-col items-center gap-2">
            <div
              className="
                h-10 w-10 rounded-2xl
                border border-[#d8b46a]/30
                bg-gradient-to-br from-[#123f59]/20 to-[#c5983c]/20
              "
            />
            <div className="h-2.5 w-2.5 rounded-full bg-[#c5983c]/70 shadow-[0_0_0_5px_rgba(197,152,60,0.12)]" />
          </div>

          <div className="min-w-0 flex-1 space-y-3">
            <div className="flex min-w-0 items-center justify-between gap-4">
              <div className="h-3.5 w-36 max-w-[45%] rounded-full bg-[#d9e2e4]" />
              <div className="h-5 w-20 max-w-[30%] rounded-full bg-[#f0e4cc]" />
            </div>

            <div className="h-4 w-3/4 rounded-full bg-[#d9e2e4]" />
            <div className="h-3 w-full rounded-full bg-[#edf2f2]" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

export const EmptyState = ({ icon: Icon, title, message, action }) => {
  const ActionIcon = action?.icon;

  return (
    <div
      className="
        relative flex h-full min-h-[360px] w-full max-w-full
        items-center justify-center overflow-hidden rounded-[28px]
        border border-[#d8b46a]/25 bg-white/65 p-4 text-center
        shadow-[0_18px_45px_rgba(18,63,89,0.10)] backdrop-blur-xl
        sm:p-8
      "
      dir="rtl"
    >
      {/* Background décoratif */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#f8efe0]/60 via-white/45 to-[#e8f0ef]/60" />

        <div className="absolute right-[-70px] top-[-70px] h-40 w-40 rounded-full bg-[#123f59]/12 blur-3xl sm:h-44 sm:w-44" />
        <div className="absolute left-[-70px] bottom-[-70px] h-40 w-40 rounded-full bg-[#c5983c]/18 blur-3xl sm:h-44 sm:w-44" />

        <div
          className="absolute right-[12%] top-[18%] h-10 w-10 opacity-10 sm:h-14 sm:w-14 sm:opacity-20"
          style={{
            clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
            background: "#123f59",
            transform: "rotate(14deg)",
          }}
        />

        <div
          className="absolute left-[14%] bottom-[18%] h-9 w-9 opacity-10 sm:h-12 sm:w-12 sm:opacity-20"
          style={{
            clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
            background: "#c5983c",
            transform: "rotate(-18deg)",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto flex w-full max-w-sm flex-col items-center justify-center">
        <div
          className="
            mx-auto mb-4 grid h-16 w-16 place-items-center rounded-[22px]
            border border-[#d8b46a]/35 bg-gradient-to-br from-[#123f59] to-[#1a5874]
            text-[#e2bf74] shadow-[0_16px_34px_rgba(18,63,89,0.24)]
            sm:h-20 sm:w-20 sm:rounded-[24px]
          "
        >
          {Icon && <Icon className="h-8 w-8 sm:h-10 sm:w-10" />}
        </div>

        <h3 className="mb-2 max-w-full text-base font-black leading-7 text-[#123f59] sm:text-lg">
          {title}
        </h3>

        <p className="mx-auto mb-5 max-w-xs text-xs font-semibold leading-6 text-[#53676d] sm:max-w-sm sm:text-sm sm:leading-7">
          {message}
        </p>

        {action && (
          <button
            onClick={action.onClick}
            type="button"
            className="
              inline-flex min-w-[120px] items-center justify-center gap-2
              rounded-2xl border border-[#d8b46a]/40
              bg-gradient-to-l from-[#123f59] via-[#15536f] to-[#0e7490]
              px-5 py-2.5 text-sm font-black text-white
              shadow-[0_12px_26px_rgba(18,63,89,0.22)]
              transition-all hover:-translate-y-[1px]
              hover:shadow-[0_16px_34px_rgba(18,63,89,0.28)]
            "
          >
            {ActionIcon && (
              <span
                className="
                  grid h-7 w-7 place-items-center rounded-xl
                  bg-white/12 text-[#e2bf74]
                "
              >
                <ActionIcon className="h-4 w-4" />
              </span>
            )}

            <span>{action.label}</span>
          </button>
        )}
      </div>
    </div>
  );
};
