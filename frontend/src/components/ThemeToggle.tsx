'use client';

import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  // Sync state with DOM on mount and listen to changes
  useEffect(() => {
    setMounted(true);
    const checkDark = () => {
      const hasDarkClass = document.documentElement.classList.contains('dark');
      setIsDark(hasDarkClass);
    };

    checkDark();

    const saved = localStorage.getItem('kementan_theme');
    if (saved === 'dark') {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    } else if (saved === 'light') {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    }

    window.addEventListener('kementan_theme_changed', checkDark);
    return () => window.removeEventListener('kementan_theme_changed', checkDark);
  }, []);

  const handleToggle = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);

    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('kementan_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('kementan_theme', 'light');
    }

    // Trigger event for listeners
    window.dispatchEvent(new CustomEvent('kementan_theme_changed', { detail: { isDark: nextDark } }));
  };

  if (!mounted) {
    return (
      <div className="w-10 h-10 rounded-2xl bg-slate-200/50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10" />
    );
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={`relative group flex items-center gap-1.5 p-1.5 sm:px-2.5 sm:py-1.5 rounded-2xl transition-all duration-300 backdrop-blur-xl border ${
        isDark
          ? 'bg-slate-800/90 text-amber-300 border-white/10 shadow-[0_2px_12px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.1)] hover:bg-slate-800'
          : 'bg-white/90 text-slate-800 border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.06),inset_0_1px_1px_rgba(255,255,255,1)] hover:bg-white'
      } active:scale-95`}
      title={isDark ? 'Mode Saat Ini: Gelap (Klik untuk beralih ke Mode Terang)' : 'Mode Saat Ini: Terang (Klik untuk beralih ke Mode Gelap)'}
      aria-label="Toggle Mode Terang / Gelap"
    >
      <div className={`p-1 rounded-xl transition-all duration-300 ${
        isDark ? 'bg-amber-400/20 text-amber-300 rotate-0' : 'bg-emerald-100 text-emerald-800 rotate-180'
      }`}>
        {isDark ? (
          <Moon className="w-4 h-4 text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
        ) : (
          <Sun className="w-4 h-4 text-emerald-700 drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
        )}
      </div>

      <span className="text-[11px] font-bold tracking-tight hidden md:inline">
        {isDark ? 'Gelap' : 'Terang'}
      </span>
    </button>
  );
}
