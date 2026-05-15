import React, { useState, useEffect, useRef } from "react";
import { Search, ChevronDown } from "lucide-react";

export const TripleCurrencyInput = ({ valueSar, onChangeSar, rates = [] }) => {
  const usdRate = rates.find((r) => r.currency === "USD")?.rate || 0.266;
  const egpRate = rates.find((r) => r.currency === "EGP")?.rate || 13.2;

  const handleFocus = (e) => e.target.select();

  const safeValue = Number(valueSar || 0);

  return (
    <div
      className="
        grid w-full grid-cols-1 gap-2
        sm:grid-cols-3
      "
      dir="ltr"
    >
      {/* SAR */}
      <CurrencyBox
        label="SAR"
        value={valueSar || ""}
        onChange={(value) => onChangeSar(value)}
        onFocus={handleFocus}
        active
      />

      {/* EGP */}
      <CurrencyBox
        label="EGP"
        value={valueSar ? (safeValue * egpRate).toFixed(2) : ""}
        onChange={(value) =>
          onChangeSar(value ? (Number(value) / egpRate).toFixed(2) : "")
        }
        onFocus={handleFocus}
      />

      {/* USD */}
      <CurrencyBox
        label="USD"
        value={valueSar ? (safeValue * usdRate).toFixed(2) : ""}
        onChange={(value) =>
          onChangeSar(value ? (Number(value) / usdRate).toFixed(2) : "")
        }
        onFocus={handleFocus}
      />
    </div>
  );
};

const CurrencyBox = ({
  label,
  value,
  onChange,
  onFocus,
  active = false,
}) => {
  return (
    <div
      className={`
        relative overflow-hidden rounded-2xl border
        shadow-sm transition-all
        focus-within:ring-4
        ${
          active
            ? "border-[#d8b46a]/45 bg-white focus-within:border-[#c5983c] focus-within:ring-[#c5983c]/10"
            : "border-[#d8b46a]/25 bg-[#fbf8f1]/70 focus-within:border-[#c5983c] focus-within:ring-[#c5983c]/10"
        }
      `}
    >
      <span
        className={`
          pointer-events-none absolute left-3 top-1/2
          -translate-y-1/2 rounded-xl px-2 py-0.5
          text-[10px] font-black
          ${
            active
              ? "bg-[#123f59] text-[#e2bf74]"
              : "bg-white text-[#64748b] border border-[#e8ddc8]"
          }
        `}
      >
        {label}
      </span>

      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        className="
          h-11 w-full bg-transparent
          pl-16 pr-3 text-right
          font-mono text-sm font-black
          text-[#123f59] outline-none
          placeholder:text-[#94a3b8]
        "
        placeholder="0"
      />
    </div>
  );
};

export const SearchableSelect = ({
  options = [],
  value,
  onChange,
  placeholder = "اختر من القائمة...",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter((opt) =>
    String(opt.label || "")
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className="relative w-full" ref={dropdownRef} dir="rtl">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`
          flex h-11 w-full items-center justify-between gap-2
          rounded-2xl border px-3 text-right
          text-xs font-black shadow-sm
          transition-all duration-200
          focus:outline-none focus:ring-4 focus:ring-[#c5983c]/10
          ${
            isOpen
              ? "border-[#c5983c]/70 bg-white text-[#123f59]"
              : "border-[#d8b46a]/35 bg-[#fbf8f1]/70 text-[#123f59] hover:border-[#c5983c]/55 hover:bg-white"
          }
        `}
      >
        <span
          className={`
            min-w-0 flex-1 truncate
            ${
              selectedOption
                ? "text-[#123f59]"
                : "text-[#64748b]/75"
            }
          `}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>

        <span
          className={`
            grid h-8 w-8 shrink-0 place-items-center rounded-xl
            transition-all
            ${
              isOpen
                ? "bg-[#123f59] text-[#e2bf74]"
                : "bg-white text-[#c5983c] border border-[#e8ddc8]"
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
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          className="
            absolute z-[999] mt-2 w-full overflow-hidden
            rounded-2xl border border-[#d8b46a]/35
            bg-white shadow-[0_18px_45px_rgba(18,63,89,0.18)]
            animate-in fade-in zoom-in-95
          "
        >
          {/* Search */}
          <div
            className="
              sticky top-0 z-10 border-b border-[#e8ddc8]
              bg-gradient-to-l from-[#f8efe0] via-white to-[#eef7f6]
              p-2.5
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
                type="text"
                className="
                  h-10 w-full rounded-xl
                  border border-[#d8b46a]/35
                  bg-white pr-10 pl-3
                  text-xs font-bold text-[#123f59]
                  outline-none transition
                  placeholder:text-[#94a3b8]
                  focus:border-[#c5983c]
                  focus:ring-4 focus:ring-[#c5983c]/10
                "
                placeholder="ابحث هنا..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                autoFocus
              />
            </div>
          </div>

          {/* Options */}
          <div className="custom-scrollbar-slim max-h-60 overflow-y-auto p-1.5">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value;

                return (
                  <button
                    type="button"
                    key={opt.value}
                    onClick={() => {
                      onChange(opt.value, opt);
                      setIsOpen(false);
                      setSearch("");
                    }}
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
                    <span className="truncate">{opt.label}</span>

                    {isSelected && (
                      <span className="h-2 w-2 rounded-full bg-[#e2bf74]" />
                    )}
                  </button>
                );
              })
            ) : (
              <div
                className="
                  flex flex-col items-center justify-center
                  rounded-xl border border-dashed border-[#d8b46a]/35
                  bg-[#fbf8f1]/70 px-3 py-5
                  text-center
                "
              >
                <Search className="mb-2 h-6 w-6 text-[#c5983c]/60" />

                <div className="text-xs font-black text-[#123f59]">
                  لا توجد نتائج مطابقة
                </div>

                <div className="mt-1 text-[10px] font-bold text-[#64748b]">
                  جرّب كلمة بحث مختلفة
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};