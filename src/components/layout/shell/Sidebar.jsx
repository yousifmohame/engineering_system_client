import React, { useState, useMemo } from "react";
import { useAppStore } from "../../../stores/useAppStore";
import { clsx } from "clsx";
import AccessControl from "../../AccessControl";
import { useAuth } from "../../../context/AuthContext";
import { usePermissionBuilder } from "../../../context/PermissionBuilderContext";
import { DEFAULT_MENU_CATEGORIES } from "../../../constants/menuConstants";

import { Search, Star, ShieldCheck, Layers } from "lucide-react";

const formatScreenId = (id) => {
  const value = String(id || "");
  if (isNaN(value)) return value;
  return value.padStart(3, "0");
};

const Sidebar = () => {
  const { activeScreenId, openScreen, sidebarConfig } = useAppStore();

  const [searchQuery, setSearchQuery] = useState("");

  const { user } = useAuth();
  const { isBuildMode } = usePermissionBuilder();

  const userPermissions = user?.permissions || [];
  const isSuperAdmin = user?.email === "admin@wms.com";

  const sbWidth = sidebarConfig?.width || 280;
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

  return (
    <aside
      style={{
        width: `${sbWidth}px`,
      }}
      className="
        fixed right-0 top-0 z-40 flex h-screen flex-col overflow-hidden
        direction-rtl border-l border-[#c5983c]/20
        bg-[#0d1824]
        shadow-[0_0_45px_rgba(0,0,0,0.45)]
        transition-all duration-300
      "
    >
      {/* Background premium */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#101d2b] via-[#111827] to-[#08111c]" />
        <div className="absolute right-[-90px] top-[-90px] h-56 w-56 rounded-full bg-[#123f59]/55 blur-3xl" />
        <div className="absolute left-[-90px] bottom-[-90px] h-56 w-56 rounded-full bg-[#c5983c]/18 blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent via-[#c5983c]/80 to-transparent" />
        <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-[#c5983c]/35 to-transparent" />
      </div>

      {/* Logo */}
      <div className="relative z-10 shrink-0 px-5 pt-5">
        <div className="rounded-[22px] border border-[#c5983c]/25 bg-white/[0.06] p-2 shadow-[0_18px_42px_rgba(0,0,0,0.30)] backdrop-blur-xl">
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
              h-12 w-full rounded-2xl border border-[#c5983c]/25
              bg-[#08111c]/70 pr-11 pl-3 text-[12px] font-bold
              text-white outline-none backdrop-blur-xl
              transition-all placeholder:text-slate-500
              focus:border-[#c5983c]/70 focus:bg-[#08111c]/95
              focus:ring-4 focus:ring-[#c5983c]/12
            "
          />
        </div>
      </div>

      {/* Navigation always open */}
      <nav className="sidebar-scrollbar relative z-10 min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-3 py-2">
        {filteredCategories.length === 0 ? (
          <div className="mx-2 mt-6 rounded-2xl border border-[#c5983c]/20 bg-[#101d2b]/80 p-4 text-center">
            <p className="text-xs font-bold text-slate-300">
              لا توجد شاشات مطابقة للبحث
            </p>
          </div>
        ) : (
          filteredCategories.map((category) => {
            const CategoryIcon = category.icon || Layers;

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
                                group relative flex w-full items-center justify-between overflow-hidden
                                rounded-2xl px-3 py-3 text-right transition-all duration-300
                              `,
                              isActive
                                ? "border border-[#c5983c]/40 bg-gradient-to-l from-[#123f59] via-[#0f3448] to-[#08111c] text-white shadow-[0_14px_32px_rgba(18,63,89,0.45)]"
                                : "border border-[#243346] bg-[#101d2b]/70 text-slate-300 hover:border-[#c5983c]/25 hover:bg-[#172536] hover:text-white",
                            )}
                          >
                            {isActive && (
                              <>
                                <span className="absolute right-0 top-1/2 h-9 w-1.5 -translate-y-1/2 rounded-l-full bg-[#c5983c]" />
                                <span className="pointer-events-none absolute inset-0 bg-gradient-to-l from-[#c5983c]/10 via-transparent to-transparent" />
                              </>
                            )}

                            <span className="relative z-10 min-w-0 truncate text-[13px] font-black">
                              {item.label}
                            </span>

                            <span
                              className={clsx(
                                "relative z-10 shrink-0 rounded-lg border px-2 py-1 text-[10px] font-black font-mono",
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
              <section key={category.id} className="mb-5">
                {/* Category title as section, no big square */}
                <div className="mb-2 flex items-center gap-2 px-1">
                  <span
                    className="
                      grid h-9 w-9 shrink-0 place-items-center rounded-2xl
                      border border-[#c5983c]/35 bg-[#c5983c]/10 text-[#e2bf74]
                    "
                  >
                    <CategoryIcon size={17} />
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="h-px flex-1 bg-gradient-to-l from-[#c5983c]/35 via-[#c5983c]/18 to-transparent" />

                      <h3 className="shrink-0 text-[13px] font-black text-white">
                        {category.title}
                      </h3>

                      <span className="h-px flex-1 bg-gradient-to-r from-[#c5983c]/35 via-[#c5983c]/18 to-transparent" />
                    </div>
                  </div>

                  <span
                    className="
                      shrink-0 rounded-xl border border-[#c5983c]/25
                      bg-[#c5983c]/10 px-2 py-1
                      text-[10px] font-black text-[#e2bf74]
                    "
                  >
                    {category.items.length}
                  </span>
                </div>

                {/* Items always visible */}
                <div className="space-y-1.5 pr-2">
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
                              group relative flex w-full items-center gap-2 overflow-hidden
                              rounded-2xl px-2.5 py-2.5 text-right transition-all duration-300
                            `,
                            isActive
                              ? "border border-[#c5983c]/35 bg-gradient-to-l from-[#123f59] via-[#0f3448] to-[#08111c] text-white shadow-[0_10px_24px_rgba(18,63,89,0.38)]"
                              : "border border-[#243346]/60 bg-[#101d2b]/55 text-slate-300 hover:border-[#c5983c]/25 hover:bg-[#1c2d3f]/70 hover:text-white",
                          )}
                        >
                          {isActive && (
                            <>
                              <span className="absolute right-0 top-1/2 h-8 w-1.5 -translate-y-1/2 rounded-l-full bg-[#c5983c]" />
                              <span className="pointer-events-none absolute inset-0 bg-gradient-to-l from-[#c5983c]/10 via-transparent to-transparent" />
                            </>
                          )}

                          <span className="relative z-10 flex w-9 shrink-0 items-center justify-center gap-1.5">
                            {item.isFavorite ? (
                              <Star
                                size={13}
                                className="fill-[#c5983c] text-[#c5983c]"
                              />
                            ) : (
                              <span
                                className={clsx(
                                  "h-2 w-2 rounded-full",
                                  isActive
                                    ? "bg-[#c5983c]"
                                    : "bg-emerald-400/80",
                                )}
                              />
                            )}

                            <span
                              className={clsx(
                                "h-1.5 w-1.5 rounded-full",
                                isActive
                                  ? "bg-emerald-300 shadow-[0_0_8px_#6ee7b7]"
                                  : "bg-slate-500",
                              )}
                            />
                          </span>

                          <span
                            className={clsx(
                              "relative z-10 min-w-0 flex-1 truncate text-[12px]",
                              isActive ? "font-black" : "font-bold",
                            )}
                          >
                            {item.label}
                          </span>

                          <span
                            className={clsx(
                              "relative z-10 shrink-0 rounded-lg border px-1.5 py-0.5 text-[9px] font-black font-mono",
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
      <div className="relative z-10 shrink-0 border-t border-[#c5983c]/18 bg-[#08111c]/85 px-4 py-3 backdrop-blur-xl">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 text-right">
            <div className="truncate text-[10px] font-black text-slate-200">
              WMS System
            </div>

            <div className="truncate text-[9px] font-mono text-slate-500">
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
