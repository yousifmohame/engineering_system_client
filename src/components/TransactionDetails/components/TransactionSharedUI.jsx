import React, { useState, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  Search,
  ChevronDown,
  Check,
  X,
  DollarSign,
  Landmark,
  Banknote,
  AlertCircle,
} from "lucide-react";

/* =========================================================================
   1. Triple Currency Input
   SAR is the base value. EGP and USD are converted automatically.
   ========================================================================= */

export const TripleCurrencyInput = ({ valueSar, onChangeSar, rates = [] }) => {
  const usdRate = rates.find((r) => r.currency === "USD")?.rate || 0.266;
  const egpRate = rates.find((r) => r.currency === "EGP")?.rate || 13.2;

  const safeValue = Number(valueSar || 0);

  const handleFocus = (e) => e.target.select();

  const handleSarChange = (value) => {
    onChangeSar(value);
  };

  const handleEgpChange = (value) => {
    if (!value) {
      onChangeSar("");
      return;
    }

    const converted = Number(value) / egpRate;
    onChangeSar(Number.isFinite(converted) ? converted.toFixed(2) : "");
  };

  const handleUsdChange = (value) => {
    if (!value) {
      onChangeSar("");
      return;
    }

    const converted = Number(value) / usdRate;
    onChangeSar(Number.isFinite(converted) ? converted.toFixed(2) : "");
  };

  return (
    <div
      className="
        grid w-full grid-cols-1 gap-3
        sm:grid-cols-3
      "
      dir="ltr"
    >
      <CurrencyBox
        label="SAR"
        title="ريال سعودي"
        icon={Banknote}
        value={valueSar || ""}
        onChange={handleSarChange}
        onFocus={handleFocus}
        active
        tone="gold"
      />

      <CurrencyBox
        label="EGP"
        title="جنيه مصري"
        icon={Landmark}
        value={valueSar ? (safeValue * egpRate).toFixed(2) : ""}
        onChange={handleEgpChange}
        onFocus={handleFocus}
        tone="emerald"
      />

      <CurrencyBox
        label="USD"
        title="دولار أمريكي"
        icon={DollarSign}
        value={valueSar ? (safeValue * usdRate).toFixed(2) : ""}
        onChange={handleUsdChange}
        onFocus={handleFocus}
        tone="blue"
      />
    </div>
  );
};

const CurrencyBox = ({
  label,
  title,
  icon: Icon,
  value,
  onChange,
  onFocus,
  active = false,
  tone = "gold",
}) => {
  const tones = {
    gold: {
      wrapper:
        "border-[#d8b46a]/45 bg-white focus-within:border-[#c5983c] focus-within:ring-[#c5983c]/10",
      badge: "bg-[#123f59] text-[#e2bf74]",
      icon: "text-[#c5983c]",
    },
    emerald: {
      wrapper:
        "border-emerald-200 bg-emerald-50/70 focus-within:border-emerald-500 focus-within:ring-emerald-500/10",
      badge: "bg-emerald-600 text-white",
      icon: "text-emerald-700",
    },
    blue: {
      wrapper:
        "border-blue-200 bg-blue-50/70 focus-within:border-blue-500 focus-within:ring-blue-500/10",
      badge: "bg-blue-600 text-white",
      icon: "text-blue-700",
    },
  };

  const selectedTone = tones[tone] || tones.gold;

  return (
    <div
      className={`
        group relative overflow-hidden rounded-2xl border
        shadow-sm transition-all duration-200
        focus-within:ring-4
        ${selectedTone.wrapper}
      `}
    >
      <div
        className="
          pointer-events-none absolute right-3 top-1/2
          flex -translate-y-1/2 items-center gap-1.5
        "
      >
        {Icon && (
          <Icon
            className={`
              h-4 w-4
              ${active ? "text-[#c5983c]" : selectedTone.icon}
            `}
          />
        )}

        <span
          className={`
            rounded-xl px-2 py-0.5
            text-[10px] font-black
            ${active ? "bg-[#123f59] text-[#e2bf74]" : selectedTone.badge}
          `}
        >
          {label}
        </span>
      </div>

      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        className="
          h-12 w-full bg-transparent
          pl-3 pr-24 text-left
          font-mono text-sm font-black
          text-[#123f59] outline-none
          placeholder:text-[#94a3b8]
        "
        placeholder="0"
      />

      <div
        className="
          pointer-events-none absolute bottom-1 left-3
          text-[8px] font-black text-[#94a3b8]
          opacity-0 transition-opacity group-focus-within:opacity-100
        "
      >
        {title}
      </div>
    </div>
  );
};

/* =========================================================================
   2. Searchable Select
   Portal version: dropdown is rendered in document.body.
   This prevents clipping inside cards, modals, scroll containers, and grids.
   ========================================================================= */

export const SearchableSelect = ({
  options = [],
  value,
  onChange,
  placeholder = "اختر من القائمة...",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [dropdownStyle, setDropdownStyle] = useState(null);

  const triggerRef = useRef(null);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  const normalizedOptions = useMemo(() => {
    return options.map((opt) => ({
      ...opt,
      value: opt.value ?? opt.id ?? opt.name ?? opt.label,
      label: opt.label ?? opt.name ?? String(opt.value ?? ""),
    }));
  }, [options]);

  const filteredOptions = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return normalizedOptions;

    return normalizedOptions.filter((opt) =>
      String(opt.label || "").toLowerCase().includes(term),
    );
  }, [normalizedOptions, search]);

  const selectedOption = normalizedOptions.find((opt) => opt.value === value);

  const updateDropdownPosition = () => {
    if (!triggerRef.current) return;

    const rect = triggerRef.current.getBoundingClientRect();

    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    const preferredWidth = rect.width;
    const safeMargin = 12;

    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;

    const shouldOpenUp = spaceBelow < 290 && spaceAbove > spaceBelow;

    const maxHeight = shouldOpenUp
      ? Math.max(180, Math.min(360, spaceAbove - 16))
      : Math.max(180, Math.min(360, spaceBelow - 16));

    let left = rect.left;

    if (left + preferredWidth > viewportWidth - safeMargin) {
      left = viewportWidth - preferredWidth - safeMargin;
    }

    if (left < safeMargin) {
      left = safeMargin;
    }

    setDropdownStyle({
      position: "fixed",
      top: shouldOpenUp ? "auto" : `${rect.bottom + 8}px`,
      bottom: shouldOpenUp ? `${viewportHeight - rect.top + 8}px` : "auto",
      left: `${left}px`,
      width: `${preferredWidth}px`,
      maxHeight: `${maxHeight}px`,
      zIndex: 999999,
    });
  };

  useEffect(() => {
    if (!isOpen) return;

    updateDropdownPosition();

    const handleResize = () => updateDropdownPosition();
    const handleScroll = () => updateDropdownPosition();

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll, true);

    const timer = setTimeout(() => {
      searchInputRef.current?.focus();
    }, 40);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const trigger = triggerRef.current;
      const dropdown = dropdownRef.current;

      if (
        trigger &&
        !trigger.contains(event.target) &&
        dropdown &&
        !dropdown.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleSelect = (option) => {
    onChange(option.value, option);
    setIsOpen(false);
    setSearch("");
  };

  const clearSelection = (event) => {
    event.stopPropagation();
    onChange("", { label: "" });
    setSearch("");
  };

  const dropdown =
    isOpen && dropdownStyle && typeof document !== "undefined"
      ? createPortal(
          <div
            ref={dropdownRef}
            style={dropdownStyle}
            className="
              overflow-hidden rounded-[22px]
              border border-[#d8b46a]/45
              bg-white
              shadow-[0_26px_70px_rgba(18,63,89,0.28)]
              ring-1 ring-[#d8b46a]/15
              animate-in fade-in zoom-in-95
            "
            dir="rtl"
          >
            {/* Search */}
            <div
              className="
                sticky top-0 z-20 border-b border-[#e8ddc8]
                bg-gradient-to-l from-[#f8efe0] via-white to-[#eef7f6]
                p-3
              "
            >
              <div className="relative">
                <Search
                  className="
                    absolute right-3 top-1/2 h-4 w-4
                    -translate-y-1/2 text-[#c5983c]
                  "
                />

                <input
                  ref={searchInputRef}
                  type="text"
                  className="
                    h-11 w-full rounded-xl
                    border border-[#d8b46a]/45
                    bg-white pr-10 pl-3
                    text-xs font-black text-[#123f59]
                    shadow-sm outline-none transition
                    placeholder:text-[#94a3b8]
                    focus:border-[#c5983c]
                    focus:ring-4 focus:ring-[#c5983c]/10
                  "
                  placeholder="ابحث هنا..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>

            {/* Options */}
            <div
              className="
                custom-scrollbar-slim overflow-y-auto overflow-x-hidden p-2
              "
              style={{
                maxHeight: `calc(${dropdownStyle.maxHeight} - 96px)`,
              }}
            >
              {filteredOptions.length > 0 ? (
                filteredOptions.map((opt) => {
                  const isSelected = opt.value === value;

                  return (
                    <button
                      type="button"
                      key={String(opt.value)}
                      onClick={() => handleSelect(opt)}
                      className={`
                        flex w-full items-center justify-between gap-2
                        rounded-xl px-3 py-2.5 text-right
                        text-xs font-black transition-all
                        ${
                          isSelected
                            ? "bg-[#123f59] text-[#e2bf74]"
                            : "text-[#123f59] hover:bg-[#f8efe0]"
                        }
                      `}
                    >
                      <span className="min-w-0 flex-1 truncate">
                        {opt.label}
                      </span>

                      {isSelected ? (
                        <span
                          className="
                            grid h-6 w-6 shrink-0 place-items-center rounded-lg
                            bg-[#e2bf74]/15 text-[#e2bf74]
                          "
                        >
                          <Check className="h-3.5 w-3.5" />
                        </span>
                      ) : (
                        <span className="h-2 w-2 shrink-0 rounded-full bg-[#d8b46a]/45" />
                      )}
                    </button>
                  );
                })
              ) : (
                <div
                  className="
                    flex flex-col items-center justify-center
                    rounded-xl border border-dashed border-[#d8b46a]/35
                    bg-[#fbf8f1]/70 px-3 py-6
                    text-center
                  "
                >
                  <AlertCircle className="mb-2 h-7 w-7 text-[#c5983c]/70" />

                  <div className="text-xs font-black text-[#123f59]">
                    لا توجد نتائج مطابقة
                  </div>

                  <div className="mt-1 text-[10px] font-bold text-[#64748b]">
                    جرّب كلمة بحث مختلفة
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div
              className="
                border-t border-[#e8ddc8]
                bg-[#fbf8f1]/80 px-3 py-2
                text-center text-[10px] font-black text-[#64748b]
              "
            >
              عدد النتائج: {filteredOptions.length}
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <div className="relative w-full" dir="rtl">
        {/* Trigger */}
        <button
          ref={triggerRef}
          type="button"
          onClick={() => {
            setIsOpen((prev) => !prev);
            setTimeout(updateDropdownPosition, 0);
          }}
          className={`
            flex h-12 w-full items-center justify-between gap-2
            rounded-2xl border px-3 text-right
            text-xs font-black shadow-sm
            transition-all duration-200
            focus:outline-none focus:ring-4 focus:ring-[#c5983c]/10
            ${
              isOpen
                ? "border-[#c5983c]/70 bg-white text-[#123f59]"
                : "border-[#d8b46a]/35 bg-[#fbf8f1]/75 text-[#123f59] hover:border-[#c5983c]/55 hover:bg-white"
            }
          `}
        >
          <span
            className={`
              min-w-0 flex-1 truncate
              ${selectedOption ? "text-[#123f59]" : "text-[#64748b]/75"}
            `}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </span>

          <div className="flex shrink-0 items-center gap-1.5">
            {selectedOption && (
              <span
                onClick={clearSelection}
                className="
                  grid h-8 w-8 place-items-center rounded-xl
                  border border-rose-200 bg-rose-50
                  text-rose-500 transition hover:bg-rose-100
                "
                title="مسح الاختيار"
              >
                <X className="h-3.5 w-3.5" />
              </span>
            )}

            <span
              className={`
                grid h-8 w-8 place-items-center rounded-xl
                transition-all
                ${
                  isOpen
                    ? "bg-[#123f59] text-[#e2bf74]"
                    : "border border-[#e8ddc8] bg-white text-[#c5983c]"
                }
              `}
            >
              <ChevronDown
                className={`
                  h-4 w-4 transition-transform duration-200
                  ${isOpen ? "rotate-180" : ""}
                `}
              />
            </span>
          </div>
        </button>
      </div>

      {dropdown}
    </>
  );
};