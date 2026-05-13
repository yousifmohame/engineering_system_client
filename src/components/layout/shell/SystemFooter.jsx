import React, { useState, useEffect } from "react";
import {
  Wifi,
  WifiOff,
  Server,
  Activity,
  Database,
  ShieldCheck,
  CircleDot,
} from "lucide-react";
import { clsx } from "clsx";
import api from "../../../api/axios";

const SystemFooter = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [serverStatus, setServerStatus] = useState("checking");
  const [latency, setLatency] = useState(null);
  const [dbStatus, setDbStatus] = useState("connected");

  useEffect(() => {
    const on = () => setIsOnline(true);
    const off = () => setIsOnline(false);

    window.addEventListener("online", on);
    window.addEventListener("offline", off);

    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  useEffect(() => {
    const check = async () => {
      const start = Date.now();

      try {
        await api.get("/clients", {
          params: { limit: 1 },
          timeout: 5000,
        });

        setLatency(Date.now() - start);
        setServerStatus("online");
        setDbStatus("connected");
      } catch (e) {
        if (e?.response?.status === 401 || e?.response?.status === 403) {
          setLatency(Date.now() - start);
          setServerStatus("online");
          setDbStatus("connected");
        } else {
          setServerStatus("offline");
          setLatency(null);
          setDbStatus("disconnected");
        }
      }
    };

    check();

    const interval = setInterval(check, 10000);

    return () => clearInterval(interval);
  }, []);

  const latencyLevel =
    latency === null
      ? "down"
      : latency < 150
        ? "good"
        : latency < 400
          ? "warn"
          : "bad";

  const latencyBarClass = {
    good: "bg-emerald-400",
    warn: "bg-[#e2bf74]",
    bad: "bg-rose-500",
    down: "bg-slate-600",
  }[latencyLevel];

  const latencyTextClass = {
    good: "text-emerald-300",
    warn: "text-[#e2bf74]",
    bad: "text-rose-300",
    down: "text-slate-400",
  }[latencyLevel];

  return (
    <footer
      className="
        relative z-30 flex h-9 shrink-0 items-center justify-between
        overflow-hidden border-t border-[#c5983c]/20
        bg-gradient-to-l from-[#08111c] via-[#0f172a] to-[#123f59]
        px-4 text-[11px] text-slate-300 shadow-[0_-8px_24px_rgba(15,23,42,0.22)]
        backdrop-blur-xl
      "
      dir="ltr"
    >
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute left-[10%] top-[-40px] h-20 w-20 rounded-full bg-[#c5983c]/12 blur-2xl" />
        <div className="absolute right-[20%] bottom-[-45px] h-24 w-24 rounded-full bg-cyan-500/10 blur-2xl" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#c5983c]/60 to-transparent" />
      </div>

      {/* Left */}
      <div className="relative z-10 flex min-w-0 items-center gap-3">
        <div className="flex items-center gap-2 rounded-xl border border-[#c5983c]/20 bg-white/[0.06] px-2.5 py-1">
          <ShieldCheck className="h-3.5 w-3.5 text-[#e2bf74]" />

          <span className="hidden font-black tracking-wide text-white sm:inline">
            Details WMS
          </span>

          <span className="font-mono text-[10px] font-bold text-[#e2bf74]">
            v2.1.0
          </span>
        </div>

        <div className="hidden items-center gap-1.5 text-[10px] font-bold text-slate-400 md:flex">
          <CircleDot className="h-3 w-3 text-emerald-400" />
          Engineering Work System
        </div>
      </div>

      {/* Right */}
      <div className="relative z-10 flex items-center gap-2 sm:gap-3 md:gap-4">
        <StatusItem
          ok={isOnline}
          label={isOnline ? "Online" : "Offline"}
          icon={isOnline ? Wifi : WifiOff}
          tone={isOnline ? "emerald" : "rose"}
        />

        <StatusItem
          ok={serverStatus === "online"}
          label="API"
          icon={Server}
          tone={serverStatus === "online" ? "emerald" : "rose"}
        />

        <StatusItem
          ok={dbStatus === "connected"}
          label="DB"
          icon={Database}
          tone={dbStatus === "connected" ? "cyan" : "rose"}
        />

        <div
          className="
            hidden items-center gap-2 rounded-xl border border-white/10
            bg-white/[0.05] px-2.5 py-1 sm:flex
          "
        >
          <Activity className="h-3.5 w-3.5 text-[#e2bf74]" />

          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-700">
            <div
              className={clsx("h-full transition-all duration-300", latencyBarClass)}
              style={{
                width: latency ? `${Math.min(latency / 6, 100)}%` : "100%",
              }}
            />
          </div>

          <span className={clsx("min-w-[42px] font-mono text-[10px] font-bold", latencyTextClass)}>
            {latency ? `${latency}ms` : "--"}
          </span>
        </div>
      </div>
    </footer>
  );
};

const StatusItem = ({ ok, label, icon: Icon, tone = "emerald" }) => {
  const toneClasses = {
    emerald: {
      dot: "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.75)]",
      icon: "text-emerald-300",
      text: "text-emerald-200",
      border: "border-emerald-400/20",
      bg: "bg-emerald-400/8",
    },
    cyan: {
      dot: "bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.65)]",
      icon: "text-cyan-300",
      text: "text-cyan-200",
      border: "border-cyan-400/20",
      bg: "bg-cyan-400/8",
    },
    rose: {
      dot: "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.65)]",
      icon: "text-rose-300",
      text: "text-rose-200",
      border: "border-rose-400/20",
      bg: "bg-rose-400/8",
    },
  };

  const currentTone = toneClasses[tone] || toneClasses.emerald;

  return (
    <div
      className={clsx(
        "flex items-center gap-1.5 rounded-xl border px-2.5 py-1",
        currentTone.border,
        currentTone.bg,
      )}
    >
      <span
        className={clsx(
          "h-2 w-2 rounded-full",
          ok ? currentTone.dot : toneClasses.rose.dot,
        )}
      />

      <Icon
        className={clsx(
          "h-3.5 w-3.5",
          ok ? currentTone.icon : toneClasses.rose.icon,
        )}
      />

      <span
        className={clsx(
          "hidden text-[10px] font-black sm:inline",
          ok ? currentTone.text : toneClasses.rose.text,
        )}
      >
        {label}
      </span>
    </div>
  );
};

export default SystemFooter;