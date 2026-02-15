import React from 'react';
import { useAppStore } from '../../../stores/useAppStore';
import { X, Layers } from 'lucide-react';
import { clsx } from 'clsx';

export const GlobalScreenTabs = () => {
  const { openScreens, activeScreenId, openScreen, closeScreen } = useAppStore();

  return (
    <div className="h-[40px] bg-[#0f172a] flex items-end px-2 border-b border-slate-800 select-none">

      {/* App Icon */}
      <div className="h-full flex items-center px-2 text-slate-500 flex-shrink-0">
        <Layers className="w-4.5 h-4.5" />
      </div>

      {/* Tabs Container */}
      <div className="flex flex-1 items-end gap-[2px] overflow-hidden">
        {openScreens.map((screen) => {
          const isActive = screen.id === activeScreenId;

          return (
            <div
              key={screen.id}
              onClick={() => openScreen(screen.id)}
              className={clsx(
                'group relative flex items-center h-[32px]',
                'flex-1 min-w-[90px] max-w-[220px]', // 👈 السر هنا
                'px-3 cursor-pointer rounded-t-md',
                'transition-all duration-200 ease-out',
                isActive
                  ? 'bg-slate-100 text-slate-900 z-20 shadow-[0_-1px_6px_rgba(0,0,0,0.25)]'
                  : 'bg-slate-100/70 text-slate-900 hover:bg-slate-700 hover:text-slate-200'
              )}
            >
              {/* Title */}
              <span
                className={clsx(
                  'truncate flex-1 text-[11.5px]',
                  isActive && 'font-semibold'
                )}
              >
                {screen.title}
              </span>

              {/* Close */}
              {screen.isClosable && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    closeScreen(screen.id);
                  }}
                  className={clsx(
                    'ml-2 p-1 rounded transition',
                    isActive
                      ? 'opacity-100 hover:bg-slate-300 text-slate-600'
                      : 'opacity-0 group-hover:opacity-100 hover:bg-slate-600 text-slate-300'
                  )}
                >
                  <X className="w-3 h-3" />
                </button>
              )}

              {/* Active Indicator */}
              {isActive && (
                <div className="absolute bottom-0 left-2 right-2 h-[2px] bg-blue-600 rounded-full" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
