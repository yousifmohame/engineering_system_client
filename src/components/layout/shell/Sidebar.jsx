import React, { useState, useMemo } from "react";
import { useAppStore } from "../../../stores/useAppStore";
import { clsx } from "clsx";
import AccessControl from "../../AccessControl";
import { useAuth } from "../../../context/AuthContext";
import { usePermissionBuilder } from "../../../context/PermissionBuilderContext";
import { DEFAULT_MENU_CATEGORIES } from "../../../constants/menuConstants";

import { Search, Star, ShieldCheck, Pin } from "lucide-react";

const formatScreenId = (id) => {
  const value = String(id || "");
  if (isNaN(value)) return value;
  return value.padStart(3, "0");
};

const Sidebar = () => {
  const { activeScreenId, openScreen, sidebarConfig } = useAppStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [pinnedScreenIds, setPinnedScreenIds] = useState(() => {
    try {
      const stored = localStorage.getItem("sidebarPinnedScreens");
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      return [];
    }
  });

  const { user } = useAuth();
  const permissionBuilder = usePermissionBuilder();

  const isBuildMode =
    permissionBuilder?.isBuildMode || permissionBuilder?.isBuilderMode || false;

  const userPermissions = user?.permissions || [];
  const isSuperAdmin = user?.email === "admin@wms.com";

  // ✅ garder 300px pour ne pas cacher la fenêtre principale
  const sbWidth = Math.max(Number(sidebarConfig?.width) || 300, 300);

  const logoUrl = sidebarConfig?.logoUrl || "/logo.jpeg";
  const customLabels = sidebarConfig?.customLabels || {};
  const categoryOrder = sidebarConfig?.categoryOrder || [];
  const itemOrder = sidebarConfig?.itemOrder || {};

  const filteredCategories = useMemo(() => {
    let processedCategories = DEFAULT_MENU_CATEGORIES.map((category) => {
      let processedItems = category.items.map((item) => ({
        ...item,
        label: customLabels[item.id] || item.label,
      }));

      const currentItemOrder = itemOrder[category.id] || [];

      if (currentItemOrder.length > 0) {
        processedItems.sort((a, b) => {
          let indexA = currentItemOrder.indexOf(a.id);
          let indexB = currentItemOrder.indexOf(b.id);

          if (indexA === -1) indexA = 999;
          if (indexB === -1) indexB = 999;

          return indexA - indexB;
        });
      }

      return {
        ...category,
        title: customLabels[category.id] || category.title,
        items: processedItems,
      };
    });

    if (categoryOrder.length > 0) {
      processedCategories.sort((a, b) => {
        let indexA = categoryOrder.indexOf(a.id);
        let indexB = categoryOrder.indexOf(b.id);

        if (indexA === -1) indexA = 999;
        if (indexB === -1) indexB = 999;

        return indexA - indexB;
      });
    }

    processedCategories.sort((a, b) => {
      if (a.isMain && !b.isMain) return -1;
      if (!a.isMain && b.isMain) return 1;
      return 0;
    });

    return processedCategories
      .map((category) => {
        let filteredItems = category.items.filter((item) => {
          const hasAccess =
            isSuperAdmin || isBuildMode || userPermissions.includes(item.code);

          return hasAccess;
        });

        if (searchQuery.trim() !== "") {
          const query = searchQuery.toLowerCase();

          filteredItems = filteredItems.filter(
            (item) =>
              item.label.toLowerCase().includes(query) ||
              formatScreenId(item.id).includes(query),
          );
        }

        return { ...category, items: filteredItems };
      })
      .filter((category) => category.items.length > 0);
  }, [
    searchQuery,
    isSuperAdmin,
    isBuildMode,
    userPermissions,
    customLabels,
    categoryOrder,
    itemOrder,
  ]);

  const accessibleItems = useMemo(() => {
    return DEFAULT_MENU_CATEGORIES.flatMap((category) => {
      return category.items.map((item) => ({
        ...item,
        label: customLabels[item.id] || item.label,
        categoryTitle: customLabels[category.id] || category.title,
        categoryId: category.id,
        isMainCategory: Boolean(category.isMain),
      }));
    }).filter((item) => {
      return isSuperAdmin || isBuildMode || userPermissions.includes(item.code);
    });
  }, [isSuperAdmin, isBuildMode, userPermissions, customLabels]);

  const pinnedItems = useMemo(() => {
    return pinnedScreenIds
      .map((screenId) => accessibleItems.find((item) => item.id === screenId))
      .filter(Boolean);
  }, [pinnedScreenIds, accessibleItems]);

  const togglePinnedScreen = (screenId) => {
    setPinnedScreenIds((prev) => {
      const exists = prev.includes(screenId);
      const next = exists
        ? prev.filter((id) => id !== screenId)
        : [...prev, screenId];

      localStorage.setItem("sidebarPinnedScreens", JSON.stringify(next));
      return next;
    });
  };

  return (
    <aside
      dir="rtl"
      style={{
        width: `${sbWidth}px`,
      }}
      className="
        fixed right-0 top-0 z-40 flex h-screen flex-col overflow-hidden
        border-l border-[#c5983c]/20
        bg-[#0d1824]
        shadow-[0_0_45px_rgba(0,0,0,0.45)]
        transition-all duration-300
      "
    >
      {/* Background premium */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#10243a] via-[#0d1824] to-[#07101c]" />
        <div className="absolute right-[-90px] top-[-90px] h-56 w-56 rounded-full bg-cyan-500/18 blur-3xl" />
        <div className="absolute left-[-90px] bottom-[-90px] h-56 w-56 rounded-full bg-[#c5983c]/22 blur-3xl" />
        <div className="absolute left-[-70px] top-[220px] h-44 w-44 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent via-[#c5983c]/80 to-transparent" />
        <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-[#c5983c]/35 to-transparent" />
      </div>

      {/* Logo */}
      <div className="relative z-10 shrink-0 px-4 pt-4">
        <div className="rounded-[22px] border border-[#e2bf74]/35 bg-gradient-to-br from-white/[0.10] via-[#123f59]/25 to-[#c5983c]/10 p-2 shadow-[0_18px_42px_rgba(0,0,0,0.30)] backdrop-blur-xl">
          <div className="flex h-[82px] items-center justify-center overflow-hidden rounded-2xl border border-[#c5983c]/20 bg-white shadow-inner">
            <img
              src={logoUrl}
              alt="Company Logo"
              className="max-h-full max-w-full object-contain p-2"
            />
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative z-10 mt-4 shrink-0 px-4 pb-3">
        <div className="relative">
          <Search
            size={16}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#c5983c]"
          />

          <input
            type="text"
            placeholder="بحث في الشاشات..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="
              h-12 w-full rounded-2xl border border-[#e2bf74]/35
              bg-[#07111d]/85 pr-11 pl-3 text-[12px] font-bold
              text-white outline-none backdrop-blur-xl
              transition-all placeholder:text-slate-400
              focus:border-[#e2bf74]/80 focus:bg-[#07111d]
              focus:ring-4 focus:ring-[#e2bf74]/15
            "
          />
        </div>
      </div>

      {/* Pinned screens */}
      {pinnedItems.length > 0 && (
        <div className="relative z-10 shrink-0 px-3 pb-3">
          <div className="mb-2 flex items-center justify-between px-1">
            <span className="text-[10px] font-black text-cyan-100">
              الشاشات المثبتة
            </span>

            <span className="rounded-full border border-emerald-300/25 bg-emerald-400/15 px-2 py-0.5 text-[9px] font-black text-emerald-200">
              مخصص
            </span>
          </div>

          <div className="space-y-2">
            {pinnedItems.map((item) => {
              const isActive = activeScreenId === item.id;
              const isPinned = pinnedScreenIds.includes(item.id);

              return (
                <button
                  key={item.id}
                  onClick={() => openScreen(item.id, item.label)}
                  className={clsx(
                    `
                      group relative flex min-h-[54px] w-full items-center gap-1.5 overflow-visible
                      rounded-2xl px-2 py-2.5 text-right transition-all duration-300
                    `,
                    isActive
                      ? "border border-[#e2bf74]/55 bg-gradient-to-l from-[#0e7490] via-[#123f59] to-[#08111c] text-white shadow-[0_14px_32px_rgba(14,116,144,0.30)]"
                      : "border border-cyan-400/20 bg-gradient-to-l from-[#123f59]/55 via-[#101d2b]/80 to-[#08111c]/80 text-slate-100 hover:border-[#e2bf74]/40 hover:bg-[#173a52] hover:text-white",
                  )}
                  type="button"
                  title={item.label}
                >
                  {isActive && (
                    <span className="absolute right-0 top-1/2 h-8 w-1.5 -translate-y-1/2 rounded-l-full bg-[#c5983c]" />
                  )}

                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(event) => {
                      event.stopPropagation();
                      togglePinnedScreen(item.id);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        event.stopPropagation();
                        togglePinnedScreen(item.id);
                      }
                    }}
                    className={clsx(
                      `
                        relative z-10 grid h-7 w-7 shrink-0 place-items-center
                        rounded-lg border transition-all duration-200
                      `,
                      isPinned
                        ? "border-[#e2bf74]/45 bg-[#e2bf74]/16 text-[#e2bf74]"
                        : "border-[#243346] bg-[#08111c]/65 text-slate-400 hover:border-cyan-300/30 hover:bg-cyan-400/10 hover:text-cyan-200",
                    )}
                    title="إلغاء التثبيت"
                  >
                    <Pin
                      size={11}
                      className={isPinned ? "fill-[#c5983c]" : ""}
                    />
                  </span>

                  <span className="relative z-10 min-w-0 flex-1">
                    <span
                      className="
                        block break-words whitespace-normal
                        text-right text-[10.8px] font-black leading-5
                      "
                      title={item.label}
                    >
                      {item.label}
                    </span>

                    <span
                      className="
                        mt-0.5 block break-words whitespace-normal
                        text-right text-[8px] font-bold leading-4 text-slate-500
                      "
                      title={item.categoryTitle}
                    >
                      {item.categoryTitle}
                    </span>
                  </span>

                  <span
                    className={clsx(
                      "relative z-10 shrink-0 rounded-md border px-1 py-[2px] text-[8px] font-black font-mono",
                      isActive
                        ? "border-white/15 bg-white/15 text-[#e2bf74]"
                        : "border-[#243346] bg-[#08111c]/80 text-slate-400",
                    )}
                  >
                    {formatScreenId(item.id)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="sidebar-scrollbar relative z-10 min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-3 py-2">
        {filteredCategories.length === 0 ? (
          <div className="mx-2 mt-6 rounded-2xl border border-[#c5983c]/20 bg-[#101d2b]/80 p-4 text-center">
            <p className="text-xs font-bold text-slate-300">
              لا توجد شاشات مطابقة للبحث
            </p>
          </div>
        ) : (
          filteredCategories.map((category) => {
            if (category.isMain) {
              return (
                <div key={category.id} className="mb-4">
                  <div className="mb-2 flex items-center justify-between px-2">
                    <span className="text-[10px] font-black text-slate-400">
                      الشاشة الحالية
                    </span>

                    <span className="rounded-full border border-[#c5983c]/25 bg-[#c5983c]/10 px-2 py-0.5 text-[9px] font-black text-[#e2bf74]">
                      MAIN
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {category.items.map((item) => {
                      const isActive = activeScreenId === item.id;

                      return (
                        <AccessControl
                          key={item.id}
                          code={item.code}
                          name={item.label}
                          moduleName={category.title}
                          type="screen"
                        >
                          <button
                            onClick={() => openScreen(item.id, item.label)}
                            className={clsx(
                              `
                                group relative flex min-h-[54px] w-full items-center justify-between gap-1.5 overflow-visible
                                rounded-2xl px-2 py-2.5 text-right transition-all duration-300
                              `,
                              isActive
                                ? "border border-[#e2bf74]/55 bg-gradient-to-l from-[#0e7490] via-[#123f59] to-[#08111c] text-white shadow-[0_14px_32px_rgba(14,116,144,0.30)]"
                                : "border border-[#243346] bg-[#101d2b]/70 text-slate-300 hover:border-cyan-300/30 hover:bg-[#173a52] hover:text-white",
                            )}
                            type="button"
                            title={item.label}
                          >
                            {isActive && (
                              <>
                                <span className="absolute right-0 top-1/2 h-9 w-1.5 -translate-y-1/2 rounded-l-full bg-[#c5983c]" />
                                <span className="pointer-events-none absolute inset-0 bg-gradient-to-l from-[#c5983c]/10 via-transparent to-transparent" />
                              </>
                            )}

                            <span
                              className="
                                relative z-10 min-w-0 flex-1
                                break-words whitespace-normal
                                text-right text-[10.8px] font-black leading-5
                              "
                              title={item.label}
                            >
                              {item.label}
                            </span>

                            <span
                              className={clsx(
                                "relative z-10 shrink-0 rounded-md border px-1 py-[2px] text-[8px] font-black font-mono",
                                isActive
                                  ? "border-white/15 bg-white/15 text-[#e2bf74]"
                                  : "border-[#243346] bg-[#08111c]/80 text-slate-400",
                              )}
                            >
                              {formatScreenId(item.id)}
                            </span>
                          </button>
                        </AccessControl>
                      );
                    })}
                  </div>
                </div>
              );
            }

            return (
              <section
                key={category.id}
                className="
                  mb-5 rounded-[22px]
                  border border-[#243346]/50 bg-[#101d2b]/25 p-2
                "
              >
                {/* Category title */}
                <div
                  className="
                    mb-2 rounded-[18px]
                    border border-[#e2bf74]/30
                    bg-gradient-to-l from-[#123f59]/70 via-[#101d2b]/70 to-[#07111d]/40
                    px-3 py-2.5
                  "
                >
                  <div className="flex items-center justify-between gap-2">
                    <h3
                      className="
                        min-w-0 flex-1 break-words whitespace-normal
                        text-right text-[12px] font-black leading-5
                        text-[#f5d99b]
                      "
                      title={category.title}
                    >
                      {category.title}
                    </h3>

                    <span
                      className="
                        shrink-0 rounded-xl border border-[#c5983c]/30
                        bg-[#c5983c]/12 px-2 py-1
                        text-[10px] font-black text-[#e2bf74]
                      "
                    >
                      {category.items.length}
                    </span>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-1.5 pr-1">
                  {category.items.map((item) => {
                    const isActive = activeScreenId === item.id;
                    const isPinned = pinnedScreenIds.includes(item.id);

                    return (
                      <AccessControl
                        key={item.id}
                        code={item.code}
                        name={item.label}
                        moduleName={category.title}
                        type="screen"
                      >
                        <button
                          onClick={() => openScreen(item.id, item.label)}
                          className={clsx(
                            `
                              group relative flex min-h-[54px] w-full items-center gap-1.5 overflow-visible
                              rounded-2xl px-2 py-2.5 text-right transition-all duration-300
                            `,
                            isActive
                              ? "border border-[#e2bf74]/50 bg-gradient-to-l from-[#0e7490] via-[#123f59] to-[#08111c] text-white shadow-[0_10px_24px_rgba(14,116,144,0.26)]"
                              : "border border-[#243346]/70 bg-[#101d2b]/62 text-slate-200 hover:border-cyan-300/28 hover:bg-[#173a52]/80 hover:text-white",
                          )}
                          type="button"
                          title={item.label}
                        >
                          {isActive && (
                            <>
                              <span className="absolute right-0 top-1/2 h-8 w-1.5 -translate-y-1/2 rounded-l-full bg-[#c5983c]" />
                              <span className="pointer-events-none absolute inset-0 bg-gradient-to-l from-[#c5983c]/10 via-transparent to-transparent" />
                            </>
                          )}

                          {item.isFavorite && (
                            <span
                              className="
                                relative z-10 grid h-7 w-7 shrink-0 place-items-center
                                rounded-lg border border-[#c5983c]/25
                                bg-[#c5983c]/10 text-[#c5983c]
                              "
                              title="مفضلة"
                            >
                              <Star
                                size={12}
                                className="fill-[#c5983c] text-[#c5983c]"
                              />
                            </span>
                          )}

                          <span
                            className={clsx(
                              `
                                relative z-10 min-w-0 flex-1
                                break-words whitespace-normal
                                text-right leading-5
                              `,
                              isActive
                                ? "text-[10.8px] font-black"
                                : "text-[10.8px] font-extrabold",
                            )}
                            title={item.label}
                          >
                            {item.label}
                          </span>

                          <span
                            role="button"
                            tabIndex={0}
                            onClick={(event) => {
                              event.stopPropagation();
                              togglePinnedScreen(item.id);
                            }}
                            onKeyDown={(event) => {
                              if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault();
                                event.stopPropagation();
                                togglePinnedScreen(item.id);
                              }
                            }}
                            className={clsx(
                              `
                                relative z-10 grid h-7 w-7 shrink-0 place-items-center
                                rounded-lg border transition-all duration-200
                              `,
                              isPinned
                                ? "border-[#e2bf74]/45 bg-[#e2bf74]/16 text-[#e2bf74]"
                                : "border-[#243346] bg-[#08111c]/65 text-slate-400 hover:border-cyan-300/30 hover:bg-cyan-400/10 hover:text-cyan-200",
                            )}
                            title={
                              isPinned
                                ? "إلغاء التثبيت"
                                : "تثبيت الشاشة في الأعلى"
                            }
                          >
                            <Pin
                              size={11}
                              className={isPinned ? "fill-[#c5983c]" : ""}
                            />
                          </span>

                          <span
                            className={clsx(
                              "relative z-10 shrink-0 rounded-md border px-1 py-[2px] text-[8px] font-black font-mono",
                              isActive
                                ? "border-white/15 bg-white/15 text-[#e2bf74]"
                                : "border-[#243346] bg-[#08111c]/75 text-slate-400",
                            )}
                          >
                            {formatScreenId(item.id)}
                          </span>
                        </button>
                      </AccessControl>
                    );
                  })}
                </div>
              </section>
            );
          })
        )}
      </nav>

      {/* Footer */}
      <div className="relative z-10 shrink-0 border-t border-[#c5983c]/20 bg-gradient-to-l from-[#08111c]/92 via-[#0d1824]/92 to-[#123f59]/55 px-4 py-3 backdrop-blur-xl">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 text-right">
            <div className="break-words text-[10px] font-black text-slate-200">
              WMS System
            </div>

            <div className="break-words text-[9px] font-mono text-slate-500">
              Master List v2.0
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-[#c5983c]/20 bg-[#101d2b]/80 px-2 py-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            <ShieldCheck size={14} className="text-[#c5983c]" />
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
