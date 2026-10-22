'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, Cookie, Lock, CheckCircle2, X } from 'lucide-react';

export default function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('kementan_cookie_consent');
    if (!consent) {
      // Delay showing slightly for smooth entry animation
      const timer = setTimeout(() => setShow(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('kementan_cookie_consent', 'accepted_' + Date.now());
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md w-[calc(100vw-3rem)] animate-in slide-in-from-bottom-5 duration-500">
      {/* Liquid Glass Container */}
      <div className="relative rounded-3xl p-5 bg-slate-900/85 backdrop-blur-2xl border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.35)] text-white overflow-hidden ring-1 ring-white/10">
        {/* Liquid reflection glow */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-emerald-500/25 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-teal-500/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex items-start gap-4">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-md shrink-0 flex items-center justify-center">
            <div className="w-full h-full rounded-[14px] bg-slate-900/60 flex items-center justify-center backdrop-blur-sm">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
          </div>

          <div className="flex-1 pr-6">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="text-sm font-semibold text-white tracking-wide">
                Keamanan Sesi & Kuki Kementan
              </h4>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                20 Menit
              </span>
            </div>
            <p className="text-xs text-slate-300/90 leading-relaxed mb-3">
              SIM-BENIH HORTI menggunakan kuki sesi aman terenkripsi (TLS/AES-256) untuk validasi autentikasi 38 BPSB dan batas aktif sesi 20 menit guna melindungi integritas data benih nasional.
            </p>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleAccept}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-md hover:shadow-emerald-500/25 transition-all duration-300 flex items-center gap-1.5 active:scale-95"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Setujui & Lanjutkan
              </button>
              <button
                type="button"
                onClick={() => setShow(false)}
                className="px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-white transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShow(false)}
            className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors p-1"
            title="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
