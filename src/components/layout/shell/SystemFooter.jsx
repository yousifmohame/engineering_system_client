import React, { useState, useEffect } from 'react';
import {
  Wifi, WifiOff, Server, Activity,
  Database, ShieldCheck
} from 'lucide-react';
import { clsx } from 'clsx';
import api from '../../../api/axios';

const SystemFooter = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [serverStatus, setServerStatus] = useState('checking');
  const [latency, setLatency] = useState(null);
  const [dbStatus, setDbStatus] = useState('connected');

  /* Network status */
  useEffect(() => {
    const on = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  /* Server Health */
  useEffect(() => {
    const check = async () => {
      const start = Date.now();
      try {
        await api.get('/clients', { params: { limit: 1 }, timeout: 5000 });
        setLatency(Date.now() - start);
        setServerStatus('online');
        setDbStatus('connected');
      } catch (e) {
        if (e?.response?.status === 401 || e?.response?.status === 403) {
          setLatency(Date.now() - start);
          setServerStatus('online');
        } else {
          setServerStatus('offline');
          setLatency(null);
          setDbStatus('disconnected');
        }
      }
    };
    check();
    const i = setInterval(check, 10000);
    return () => clearInterval(i);
  }, []);

  const latencyLevel =
    latency === null ? 'down' :
    latency < 150 ? 'good' :
    latency < 400 ? 'warn' : 'bad';

  const latencyColor = {
    good: 'bg-emerald-400',
    warn: 'bg-yellow-400',
    bad: 'bg-red-500',
    down: 'bg-slate-600'
  }[latencyLevel];

  return (
    <footer className="fixed bottom-0 z-50 w-full h-8 bg-slate-900/95 border-t border-slate-800 backdrop-blur text-[11px] text-slate-300 flex items-center  px-4 font-mono">

      {/* Left */}
      <div className="flex items-center gap-3">
        <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
        <span className="tracking-wide">
          Engineering System <span className="text-slate-400">v2.1.0</span>
        </span>
      </div>

      {/* Right */}
      <div className="flex items-center gap-5 mr-20">

        {/* Network */}
        <StatusItem
          ok={isOnline}
          label={isOnline ? 'Online' : 'Offline'}
          icon={isOnline ? Wifi : WifiOff}
          okColor="emerald"
        />

        {/* Server */}
        <StatusItem
          ok={serverStatus === 'online'}
          label="API"
          icon={Server}
          okColor="emerald"
        />

        {/* DB */}
        <StatusItem
          ok={dbStatus === 'connected'}
          label="DB"
          icon={Database}
          okColor="blue"
        />

        {/* Latency */}
        <div className="flex items-center gap-2 min-w-[90px]">
          <Activity className="w-3.5 h-3.5 text-slate-400" />
          <div className="w-14 h-1.5 bg-slate-700 rounded overflow-hidden">
            <div
              className={clsx(
                'h-full transition-all duration-300',
                latencyColor
              )}
              style={{ width: latency ? `${Math.min(latency / 6, 100)}%` : '100%' }}
            />
          </div>
          <span className="text-slate-400">
            {latency ? `${latency}ms` : '--'}
          </span>
        </div>

      </div>
    </footer>
  );
};

/* Reusable status pill */
const StatusItem = ({ ok, label, icon: Icon, okColor }) => (
  <div className="flex items-center gap-1.5">
    <span
      className={clsx(
        'w-2 h-2 rounded-full animate-pulse',
        ok ? `bg-${okColor}-400` : 'bg-red-500'
      )}
    />
    <Icon className="w-3.5 h-3.5 text-slate-400" />
    <span className="text-slate-400">{label}</span>
  </div>
);

export default SystemFooter;