// ContractSteps.jsx
import React from "react";
import { Layout, Sparkles, Link as LinkIcon, Settings } from "lucide-react";

export const Step7Formatting = ({ contract, setContract }) => (
  <div className="space-y-6 animate-in slide-in-from-right-4">
    <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
        <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
          <Layout className="w-4 h-4 text-emerald-600" /> إعدادات الإطارات
          (Frames)
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Page Frame */}
        <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
          <div className="flex justify-between items-center">
            <label className="text-xs font-black text-slate-700">
              إطار الصفحات الداخلية
            </label>
            <input
              type="checkbox"
              checked={contract.frameSettings?.pageFrame?.enabled}
              onChange={(e) =>
                setContract({
                  ...contract,
                  frameSettings: {
                    ...contract.frameSettings,
                    pageFrame: {
                      ...contract.frameSettings?.pageFrame,
                      enabled: e.target.checked,
                    },
                  },
                })
              }
              className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
            />
          </div>
          {contract.frameSettings?.pageFrame?.enabled && (
            <>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500">
                  النمط
                </label>
                <select
                  value={contract.frameSettings.pageFrame.style}
                  onChange={(e) =>
                    setContract({
                      ...contract,
                      frameSettings: {
                        ...contract.frameSettings,
                        pageFrame: {
                          ...contract.frameSettings?.pageFrame,
                          style: e.target.value,
                        },
                      },
                    })
                  }
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs outline-none"
                >
                  <option value="solid">متصل (Solid)</option>
                  <option value="double">مزدوج (Double)</option>
                  <option value="dashed">متقطع (Dashed)</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500">
                  اللون
                </label>
                <input
                  type="color"
                  value={contract.frameSettings.pageFrame.color}
                  onChange={(e) =>
                    setContract({
                      ...contract,
                      frameSettings: {
                        ...contract.frameSettings,
                        pageFrame: {
                          ...contract.frameSettings?.pageFrame,
                          color: e.target.value,
                        },
                      },
                    })
                  }
                  className="w-full h-8 p-0.5 bg-white border border-slate-200 rounded-lg cursor-pointer"
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-slate-500">
                    الهامش (Margin)
                  </label>
                  <span className="text-[10px] font-mono text-emerald-600">
                    {contract.frameSettings.pageFrame.margin}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="1"
                  value={parseInt(
                    contract.frameSettings.pageFrame.margin || "20",
                  )}
                  onChange={(e) =>
                    setContract({
                      ...contract,
                      frameSettings: {
                        ...contract.frameSettings,
                        pageFrame: {
                          ...contract.frameSettings?.pageFrame,
                          margin: `${e.target.value}px`,
                        },
                      },
                    })
                  }
                  className="w-full accent-emerald-600"
                  dir="ltr"
                />
              </div>
            </>
          )}
        </div>

        {/* Front Cover Frame */}
        <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
          <div className="flex justify-between items-center">
            <label className="text-xs font-black text-slate-700">
              إطار الغلاف الأمامي
            </label>
            <input
              type="checkbox"
              checked={contract.frameSettings?.frontCoverFrame?.enabled}
              onChange={(e) =>
                setContract({
                  ...contract,
                  frameSettings: {
                    ...contract.frameSettings,
                    frontCoverFrame: {
                      ...contract.frameSettings?.frontCoverFrame,
                      enabled: e.target.checked,
                    },
                  },
                })
              }
              className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
            />
          </div>
          {contract.frameSettings?.frontCoverFrame?.enabled && (
            <>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500">
                  النمط
                </label>
                <select
                  value={contract.frameSettings.frontCoverFrame.style}
                  onChange={(e) =>
                    setContract({
                      ...contract,
                      frameSettings: {
                        ...contract.frameSettings,
                        frontCoverFrame: {
                          ...contract.frameSettings?.frontCoverFrame,
                          style: e.target.value,
                        },
                      },
                    })
                  }
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs outline-none"
                >
                  <option value="solid">متصل (Solid)</option>
                  <option value="double">مزدوج (Double)</option>
                  <option value="dashed">متقطع (Dashed)</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500">
                  اللون
                </label>
                <input
                  type="color"
                  value={contract.frameSettings.frontCoverFrame.color}
                  onChange={(e) =>
                    setContract({
                      ...contract,
                      frameSettings: {
                        ...contract.frameSettings,
                        frontCoverFrame: {
                          ...contract.frameSettings?.frontCoverFrame,
                          color: e.target.value,
                        },
                      },
                    })
                  }
                  className="w-full h-8 p-0.5 bg-white border border-slate-200 rounded-lg cursor-pointer"
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-slate-500">
                    الهامش (Margin)
                  </label>
                  <span className="text-[10px] font-mono text-emerald-600">
                    {contract.frameSettings.frontCoverFrame.margin}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="1"
                  value={parseInt(
                    contract.frameSettings.frontCoverFrame.margin || "30",
                  )}
                  onChange={(e) =>
                    setContract({
                      ...contract,
                      frameSettings: {
                        ...contract.frameSettings,
                        frontCoverFrame: {
                          ...contract.frameSettings?.frontCoverFrame,
                          margin: `${e.target.value}px`,
                        },
                      },
                    })
                  }
                  className="w-full accent-emerald-600"
                  dir="ltr"
                />
              </div>
            </>
          )}
        </div>

        {/* Back Cover Frame */}
        <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
          <div className="flex justify-between items-center">
            <label className="text-xs font-black text-slate-700">
              إطار الغلاف الخلفي
            </label>
            <input
              type="checkbox"
              checked={contract.frameSettings?.backCoverFrame?.enabled}
              onChange={(e) =>
                setContract({
                  ...contract,
                  frameSettings: {
                    ...contract.frameSettings,
                    backCoverFrame: {
                      ...contract.frameSettings?.backCoverFrame,
                      enabled: e.target.checked,
                    },
                  },
                })
              }
              className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
            />
          </div>
          {contract.frameSettings?.backCoverFrame?.enabled && (
            <>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500">
                  النمط
                </label>
                <select
                  value={contract.frameSettings.backCoverFrame.style}
                  onChange={(e) =>
                    setContract({
                      ...contract,
                      frameSettings: {
                        ...contract.frameSettings,
                        backCoverFrame: {
                          ...contract.frameSettings?.backCoverFrame,
                          style: e.target.value,
                        },
                      },
                    })
                  }
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs outline-none"
                >
                  <option value="solid">متصل (Solid)</option>
                  <option value="double">مزدوج (Double)</option>
                  <option value="dashed">متقطع (Dashed)</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500">
                  اللون
                </label>
                <input
                  type="color"
                  value={contract.frameSettings.backCoverFrame.color}
                  onChange={(e) =>
                    setContract({
                      ...contract,
                      frameSettings: {
                        ...contract.frameSettings,
                        backCoverFrame: {
                          ...contract.frameSettings?.backCoverFrame,
                          color: e.target.value,
                        },
                      },
                    })
                  }
                  className="w-full h-8 p-0.5 bg-white border border-slate-200 rounded-lg cursor-pointer"
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-slate-500">
                    الهامش (Margin)
                  </label>
                  <span className="text-[10px] font-mono text-emerald-600">
                    {contract.frameSettings.backCoverFrame.margin}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="1"
                  value={parseInt(
                    contract.frameSettings.backCoverFrame.margin || "30",
                  )}
                  onChange={(e) =>
                    setContract({
                      ...contract,
                      frameSettings: {
                        ...contract.frameSettings,
                        backCoverFrame: {
                          ...contract.frameSettings?.backCoverFrame,
                          margin: `${e.target.value}px`,
                        },
                      },
                    })
                  }
                  className="w-full accent-emerald-600"
                  dir="ltr"
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>

    <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
        <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
          <Settings className="w-4 h-4 text-emerald-600" /> إعدادات المسافات
          والخطوط
        </h3>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-500">
            نوع الخط
          </label>
          <select
            value={contract.typographySettings?.fontFamily}
            onChange={(e) =>
              setContract({
                ...contract,
                typographySettings: {
                  ...contract.typographySettings,
                  fontFamily: e.target.value,
                },
              })
            }
            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none"
          >
            <option value="Tajawal">Tajawal</option>
            <option value="Cairo">Cairo</option>
            <option value="Almarai">Almarai</option>
            <option value="IBM Plex Sans Arabic">IBM Plex Sans Arabic</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-500">
            حجم الخط الأساسي
          </label>
          <input
            type="text"
            value={contract.typographySettings?.fontSize}
            onChange={(e) =>
              setContract({
                ...contract,
                typographySettings: {
                  ...contract.typographySettings,
                  fontSize: e.target.value,
                },
              })
            }
            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none"
            dir="ltr"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-500">
            ارتفاع السطر
          </label>
          <input
            type="text"
            value={contract.spacingSettings?.lineHeight}
            onChange={(e) =>
              setContract({
                ...contract,
                spacingSettings: {
                  ...contract.spacingSettings,
                  lineHeight: e.target.value,
                },
              })
            }
            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none"
            dir="ltr"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-500">
            المسافة بين الفقرات
          </label>
          <input
            type="text"
            value={contract.spacingSettings?.paragraphSpacing}
            onChange={(e) =>
              setContract({
                ...contract,
                spacingSettings: {
                  ...contract.spacingSettings,
                  paragraphSpacing: e.target.value,
                },
              })
            }
            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none"
            dir="ltr"
          />
        </div>
      </div>
    </div>

    <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
        <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-violet-600" /> اختصار العقد (AI)
        </h3>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={contract.isOnePageSummary}
            onChange={(e) =>
              setContract({ ...contract, isOnePageSummary: e.target.checked })
            }
          />
          <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-violet-500"></div>
        </label>
      </div>
      <p className="text-xs text-slate-500 font-bold">
        عند تفعيل هذا الخيار، سيقوم الذكاء الاصطناعي باختصار جميع بنود العقد
        (نطاق العمل، الالتزامات، الشروط) في صفحة واحدة فقط، مع الاحتفاظ بصفحات
        الغلاف.
      </p>
    </div>
  </div>
);
