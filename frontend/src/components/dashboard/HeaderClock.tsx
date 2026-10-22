'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Activity, ShieldCheck } from 'lucide-react';

export default function HeaderClock() {
  const [timeStr, setTimeStr] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>('');

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      
      // Indonesian Date Format
      const optionsDate: Intl.DateTimeFormatOptions = { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric',
        timeZone: 'Asia/Jakarta'
      };
      const formattedDate = new Intl.DateTimeFormat('id-ID', optionsDate).format(now);
      
      // Time format with seconds
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      const formattedTime = `${hours}:${minutes}:${seconds} WIB`;

      setDateStr(formattedDate);
      setTimeStr(formattedTime);
    };

    updateDateTime();
    const timer = setInterval(updateDateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!timeStr) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      {/* Realtime Clock & Date Pill in Liquid Glass */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] text-xs transition-all">
        <div className="flex items-center gap-1.5 text-slate-200">
          <Calendar className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="font-medium text-[11px] whitespace-nowrap">{dateStr}</span>
        </div>

        <span className="text-slate-600 hidden xl:inline">•</span>

        <div className="hidden xl:flex items-center gap-1.5 text-emerald-300 font-mono font-bold text-[11px] whitespace-nowrap">
          <Clock className="w-3.5 h-3.5 text-emerald-400 animate-pulse shrink-0" />
          <span>{timeStr}</span>
        </div>
      </div>

      {/* Operational Status Pill */}
      <div className="hidden 2xl:flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-emerald-950/60 backdrop-blur-xl border border-emerald-500/30 text-[11px] text-emerald-300 font-semibold shadow-xs">
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="whitespace-nowrap">38 Balai BPSB Aktif</span>
      </div>
    </div>
  );
}
