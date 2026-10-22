'use client';

import React, { useState, useEffect } from 'react';
import { Clock, RefreshCw, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SessionTimer() {
  const router = useRouter();
  // 20 minutes = 1200 seconds
  const [secondsLeft, setSecondsLeft] = useState(1200);
  const [showWarningModal, setShowWarningModal] = useState(false);

  useEffect(() => {
    // Check if session started
    const savedExpiry = localStorage.getItem('kementan_session_expiry');
    const now = Date.now();
    let targetTime: number;

    if (savedExpiry && Number(savedExpiry) > now) {
      targetTime = Number(savedExpiry);
    } else {
      targetTime = now + 1200 * 1000;
      localStorage.setItem('kementan_session_expiry', String(targetTime));
    }

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((targetTime - Date.now()) / 1000));
      setSecondsLeft(remaining);

      // Warning when less than 2 minutes (120 seconds)
      if (remaining <= 120 && remaining > 0) {
        setShowWarningModal(true);
      }

      // Expired
      if (remaining <= 0) {
        clearInterval(interval);
        localStorage.removeItem('kementan_session_expiry');
        localStorage.removeItem('kementan_auth_user');
        router.push('/login?expired=1');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [router]);

  const handleExtendSession = () => {
    const newTarget = Date.now() + 1200 * 1000;
    localStorage.setItem('kementan_session_expiry', String(newTarget));
    setSecondsLeft(1200);
    setShowWarningModal(false);
  };

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const isUrgent = secondsLeft < 180;

  return (
    <>
      {/* Header Liquid Glass Timer Pill */}
      <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-2xl backdrop-blur-xl border transition-all duration-300 shadow-sm ${
        isUrgent
          ? 'bg-amber-500/20 border-amber-400/50 text-amber-300 ring-2 ring-amber-400/40 animate-pulse'
          : 'bg-white/5 hover:bg-white/10 border-white/10 text-emerald-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]'
      }`}>
        <div className="relative flex items-center justify-center">
          <Clock className={`w-3.5 h-3.5 ${isUrgent ? 'text-amber-400 animate-spin' : 'text-emerald-400'}`} />
          <span className={`absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full ${
            isUrgent ? 'bg-amber-400' : 'bg-emerald-400'
          }`} />
        </div>

        <span className="text-xs font-mono font-bold tracking-tight text-white">
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </span>

        <button
          type="button"
          onClick={handleExtendSession}
          title="Perpanjang Sesi 20 Menit"
          className="text-[10px] font-bold text-amber-400 hover:text-amber-300 underline ml-1 cursor-pointer flex items-center gap-0.5 transition-colors"
        >
          <RefreshCw className="w-2.5 h-2.5" />
          +20m
        </button>
      </div>

      {/* Warning Modal when Session < 2 Min */}
      {showWarningModal && secondsLeft > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="relative w-full max-w-sm rounded-3xl p-6 bg-slate-900/90 backdrop-blur-2xl border border-amber-500/30 shadow-[0_25px_60px_rgba(0,0,0,0.5)] text-white ring-1 ring-white/10 text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 mx-auto flex items-center justify-center mb-3">
              <AlertTriangle className="w-6 h-6 text-amber-400 animate-bounce" />
            </div>

            <h3 className="text-base font-bold text-white mb-1">
              Sesi Anda Hampir Berakhir
            </h3>
            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              Batas waktu sesi aman 20 menit Kementan RI tersisa{' '}
              <span className="font-bold text-amber-400 font-mono">
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </span>
              . Perpanjang sekarang agar pekerjaan Anda tidak terhenti.
            </p>

            <div className="flex gap-2 justify-center">
              <button
                type="button"
                onClick={handleExtendSession}
                className="w-full py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/30 transition-all font-heading"
              >
                Perpanjang Sesi 20 Menit
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
