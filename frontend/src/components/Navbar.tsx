'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Layers, Menu, X, ArrowRight, ShieldCheck, Search, Sprout, Award, FileText, LogOut } from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  href: string;
}

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeNav, setActiveNav] = useState('beranda');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const pathname = usePathname();

  const navLinks: NavItem[] = [
    { id: 'beranda', label: 'Beranda', href: '/' },
    { id: 'sop-permentan', label: 'SOP Permentan 24/2025', href: '/#sop-permentan' },
    { id: 'tracking', label: 'Lacak Status', href: '/#tracking' },
    { id: 'masa-sanggah', label: 'Masa Sanggah', href: '/#masa-sanggah' },
    { id: 'katalog', label: 'Katalog', href: '/#katalog' },
  ];

  // Ref tracking for sliding pill switch animation
  const navRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [pillStyle, setPillStyle] = useState({ left: 0, width: 0, opacity: 0 });

  // Check authentication status across client tabs
  useEffect(() => {
    const checkLogin = () => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('sim_benih_token');
        const user = localStorage.getItem('sim_benih_user');
        setIsLoggedIn(Boolean(token || user));
      }
    };
    checkLogin();
    window.addEventListener('storage', checkLogin);
    window.addEventListener('focus', checkLogin);
    return () => {
      window.removeEventListener('storage', checkLogin);
      window.removeEventListener('focus', checkLogin);
    };
  }, []);

  const handleNavbarLogout = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('sim_benih_token') || '' : '';
      const userStr = typeof window !== 'undefined' ? localStorage.getItem('sim_benih_user') : null;
      let userData: any = null;
      try { userData = userStr ? JSON.parse(userStr) : null; } catch {}

      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({
          token,
          user_id: userData?.id,
          username: userData?.username || userData?.email || 'superadmin'
        })
      }).catch(() => {});
    } catch {}

    if (typeof window !== 'undefined') {
      localStorage.removeItem('sim_benih_token');
      localStorage.removeItem('sim_benih_user');
      localStorage.removeItem('sim_benih_role');
      localStorage.removeItem('kementan_session_expiry');
      sessionStorage.clear();
      setIsLoggedIn(false);
      window.location.href = '/login?status=logged_out';
    }
  };

  // Update sliding pill position based on active item
  const updatePill = (id: string) => {
    const idx = navLinks.findIndex((l) => l.id === id);
    if (idx !== -1 && navRefs.current[idx]) {
      const el = navRefs.current[idx];
      if (el) {
        setPillStyle({
          left: el.offsetLeft,
          width: el.offsetWidth,
          opacity: 1,
        });
      }
    }
  };

  useEffect(() => {
    updatePill(activeNav);
  }, [activeNav, isScrolled]);

  // Handle scroll detection and scroll spy
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 40);

      // Scroll Spy for Public Landing Page
      if (pathname === '/') {
        if (scrollY < 280) {
          setActiveNav('beranda');
          return;
        }

        const sections = ['sop-permentan', 'tracking', 'masa-sanggah', 'katalog'];
        for (const secId of sections) {
          const el = document.getElementById(secId);
          if (el) {
            const rect = el.getBoundingClientRect();
            if (rect.top <= 260 && rect.bottom >= 120) {
              setActiveNav(secId);
              return;
            }
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pathname]);

  // Window resize re-align pill
  useEffect(() => {
    const handleResize = () => updatePill(activeNav);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [activeNav]);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, link: NavItem) => {
    setActiveNav(link.id);
    updatePill(link.id);

    if (link.id === 'beranda') {
      if (pathname === '/') {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        window.history.pushState(null, '', '/');
      }
      return;
    }

    if (pathname === '/' && link.href.includes('#')) {
      e.preventDefault();
      const targetId = link.href.split('#')[1];
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth' });
        window.history.pushState(null, '', `#${targetId}`);
      }
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out flex flex-col items-center ${
        isScrolled
          ? 'pt-3 sm:pt-4 px-2.5 sm:px-6 pointer-events-none'
          : 'pt-0 px-0 pointer-events-auto'
      }`}
    >
      {/* 
        CONTAINER NAVBAR:
        - Mode Non-Scroll: KOTAK (w-full, rounded-none, border-b, docked rapi di puncak layar tanpa celah)
        - Mode Scroll: DYNAMIC ISLAND LIQUID GLASS (floating capsule, rounded-full, glass specular highlight, blur-2xl)
      */}
      <div
        className={`transition-all duration-500 ease-out relative overflow-hidden ${
          isScrolled
            ? 'pointer-events-auto w-[96%] max-w-6xl rounded-full px-3.5 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-b from-slate-950/90 via-[#03231b]/85 to-slate-950/90 backdrop-blur-2xl border border-white/25 shadow-[0_16px_45px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.4),inset_0_-1px_1px_rgba(0,0,0,0.3)] ring-1 ring-emerald-500/25 flex items-center justify-between'
            : 'w-full rounded-none px-3.5 sm:px-8 py-3 sm:py-3.5 bg-slate-950/95 backdrop-blur-xl border-b border-white/10 shadow-md flex items-center justify-between'
        }`}
      >
        {/* Specular Liquid Glass Highlight (Hanya saat Dynamic Island Floating) */}
        {isScrolled && (
          <div className="absolute inset-x-8 top-0 h-[45%] rounded-t-full bg-gradient-to-b from-white/25 via-white/5 to-transparent pointer-events-none" />
        )}

        <div className={`w-full flex items-center justify-between gap-2 sm:gap-4 ${!isScrolled ? 'max-w-7xl mx-auto' : ''}`}>
          {/* Brand Area: Authentic Logo + Typography */}
          <Link href="/" className="flex items-center space-x-2.5 sm:space-x-3 group shrink-0 relative z-10">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/95 p-1 flex items-center justify-center shadow-md ring-2 ring-emerald-400/50 group-hover:scale-105 transition-transform duration-300 shrink-0">
              <img
                src="/images/logo_kementan.png"
                alt="Logo Resmi Kementerian Pertanian Republik Indonesia"
                className="w-full h-full object-contain"
              />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <span className="font-heading font-extrabold text-xs sm:text-base text-white tracking-tight leading-none group-hover:text-emerald-400 transition-colors whitespace-nowrap">
                  SIM-BENIH <span className="text-kementan-gold-400">HORTI</span>
                </span>
                <span className="text-slate-500 hidden sm:inline">•</span>
                <span className="text-[10px] sm:text-[11px] font-extrabold text-emerald-400 tracking-wider hidden sm:inline whitespace-nowrap">
                  KEMENTAN RI
                </span>
              </div>
              <span className="text-[10px] text-slate-300 font-medium hidden 2xl:block whitespace-nowrap">
                Permentan No. 24/2025 • 38 BPSB Provinsi
              </span>
            </div>
          </Link>

          {/* 
            Desktop Navigation Links with Animated Switch Pill
            Menggunakan whitespace-nowrap dan penyesuaian label agar tidak terpotong / turun baris (nabrak)
          */}
          <nav className="hidden lg:flex items-center relative bg-white/5 backdrop-blur-md border border-white/10 rounded-full p-1 shadow-inner z-10 shrink-0">
            {/* Animated Liquid Switch Pill Indicator */}
            <div
              className="absolute top-1 bottom-1 rounded-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 shadow-[0_2px_12px_rgba(16,185,129,0.5),inset_0_1px_0_rgba(255,255,255,0.7)] border border-emerald-300/40 transition-all duration-300 ease-out pointer-events-none"
              style={{
                left: `${pillStyle.left}px`,
                width: `${pillStyle.width}px`,
                opacity: pillStyle.opacity,
              }}
            />

            {navLinks.map((link, idx) => {
              const isActive = activeNav === link.id;
              return (
                <a
                  key={link.id}
                  ref={(el) => {
                    navRefs.current[idx] = el;
                  }}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link)}
                  className={`relative z-10 whitespace-nowrap px-3 xl:px-4 py-1.5 text-xs font-semibold rounded-full transition-colors duration-200 select-none cursor-pointer ${
                    isActive
                      ? 'text-white font-bold drop-shadow-sm'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {link.id === 'sop-permentan' ? (
                    <>
                      <span className="hidden xl:inline">SOP Permentan 24/2025</span>
                      <span className="xl:hidden">SOP Permentan</span>
                    </>
                  ) : (
                    link.label
                  )}
                </a>
              );
            })}
          </nav>

          {/* Right CTA Button: LIQUID GLASS BUTTON */}
          <div className="flex items-center space-x-1.5 sm:space-x-3 shrink-0 relative z-10">

            {isLoggedIn ? (
              <>
                <Link
                  href="/dashboard"
                  className="relative group overflow-hidden inline-flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-4 xl:px-5 py-1.5 sm:py-2 rounded-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-[11px] sm:text-xs font-bold shadow-[0_4px_16px_rgba(5,150,105,0.4),inset_0_1px_1px_rgba(255,255,255,0.7),inset_0_-1px_1px_rgba(0,0,0,0.3)] border border-emerald-300/40 transition-all duration-300 hover:scale-105 active:scale-95 whitespace-nowrap shrink-0"
                >
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />
                  <Layers className="w-3.5 h-3.5 text-emerald-100 group-hover:rotate-6 transition-transform shrink-0" />
                  <span className="hidden xl:inline">Portal BPSB & Pemohon</span>
                  <span className="hidden sm:inline xl:hidden">Portal BPSB</span>
                  <span className="sm:hidden">Portal</span>
                  <ArrowRight className="w-3 h-3 text-emerald-100 group-hover:translate-x-0.5 transition-transform shrink-0" />
                </Link>

                <button
                  onClick={handleNavbarLogout}
                  className="hidden md:inline-flex items-center space-x-1 px-3 py-1.5 sm:py-2 rounded-full text-red-300 hover:text-white bg-red-950/40 hover:bg-red-900/80 border border-red-500/30 text-[11px] sm:text-xs font-bold transition-all hover:scale-105 active:scale-95 shadow-xs"
                  title="Keluar dari Sesi Sistem"
                >
                  <LogOut className="w-3 h-3 text-red-400" />
                  <span>Keluar</span>
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="relative group overflow-hidden inline-flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-4 xl:px-5 py-1.5 sm:py-2 rounded-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-[11px] sm:text-xs font-bold shadow-[0_4px_16px_rgba(5,150,105,0.4),inset_0_1px_1px_rgba(255,255,255,0.7),inset_0_-1px_1px_rgba(0,0,0,0.3)] border border-emerald-300/40 transition-all duration-300 hover:scale-105 active:scale-95 whitespace-nowrap shrink-0"
              >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />
                <Layers className="w-3.5 h-3.5 text-emerald-100 group-hover:rotate-6 transition-transform shrink-0" />
                <span className="hidden xl:inline">Masuk Portal BPSB</span>
                <span className="hidden sm:inline xl:hidden">Masuk Portal</span>
                <span className="sm:hidden">Masuk</span>
                <ArrowRight className="w-3 h-3 text-emerald-100 group-hover:translate-x-0.5 transition-transform shrink-0" />
              </Link>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 sm:p-2 rounded-full text-slate-300 hover:text-white hover:bg-white/10 focus:outline-none transition-colors shrink-0"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-emerald-400" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Dynamic Island Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="pointer-events-auto w-[94%] max-w-md mt-2.5 rounded-2xl sm:rounded-3xl bg-slate-950/95 backdrop-blur-2xl border border-white/20 p-4 sm:p-5 shadow-2xl transition-all animate-in fade-in slide-in-from-top-4 duration-300 z-50">
          <div className="flex flex-col space-y-1.5">
            {navLinks.map((link) => {
              const isActive = activeNav === link.id;
              return (
                <a
                  key={link.id}
                  href={link.href}
                  onClick={(e) => {
                    handleNavClick(e, link);
                    setMobileMenuOpen(false);
                  }}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-md'
                      : 'text-slate-200 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {link.label}
                </a>
              );
            })}
            <div className="pt-3 border-t border-white/10 space-y-2">
              {isLoggedIn ? (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold uppercase transition-colors shadow-lg shadow-emerald-900/40 border border-emerald-400/40"
                  >
                    <Layers className="w-4 h-4 text-emerald-200" />
                    <span>Masuk Portal BPSB & Pemohon</span>
                  </Link>

                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleNavbarLogout();
                    }}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-red-950/60 hover:bg-red-900/80 border border-red-500/40 text-red-200 text-xs font-bold uppercase transition-colors"
                  >
                    <LogOut className="w-4 h-4 text-red-400" />
                    <span>Keluar dari Sesi</span>
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold uppercase transition-colors shadow-lg shadow-emerald-900/40 border border-emerald-400/40"
                >
                  <Layers className="w-4 h-4 text-emerald-200" />
                  <span>Masuk Portal BPSB & Pemohon</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
