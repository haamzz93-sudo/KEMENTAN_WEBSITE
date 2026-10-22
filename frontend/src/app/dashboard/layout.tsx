'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Building2, 
  Sprout, 
  FileCheck, 
  LayoutDashboard, 
  ShieldCheck, 
  ArrowLeft, 
  UserCheck, 
  Layers, 
  LogOut, 
  Menu, 
  X,
  Sliders,
  Users,
  Award,
  FileText,
  Clock,
  Edit,
  RefreshCw,
  QrCode,
  Database,
  User,
  Settings,
  Bug,
  PanelLeft,
  PanelLeftClose
} from 'lucide-react';
import { UserRole } from '@/types';
import SessionTimer from '@/components/dashboard/SessionTimer';
import CookieBanner from '@/components/dashboard/CookieBanner';
import HeaderClock from '@/components/dashboard/HeaderClock';
import ReportBugModal from '@/components/ReportBugModal';

interface MenuItem {
  title: string;
  subtitle?: string;
  href: string;
  icon: React.ElementType;
  key?: string;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [reportBugOpen, setReportBugOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState<UserRole>('super_admin');
  const [currentUser, setCurrentUser] = useState<{ id?: number; name: string; username: string; agency_name?: string; avatar?: string } | null>(null);
  const [rolePermissions, setRolePermissions] = useState<Record<string, string[]>>({});

  // Sync role and user from localStorage and backend on mount
  useEffect(() => {
    // Check saved collapsed state
    const savedCollapsed = localStorage.getItem('sim_benih_sidebar_collapsed');
    if (savedCollapsed === 'true') {
      setIsSidebarCollapsed(true);
    }

    const loadUserData = async () => {
      const savedToken = localStorage.getItem('sim_benih_token');
      const savedRole = localStorage.getItem('sim_benih_role') as UserRole;
      const savedUser = localStorage.getItem('sim_benih_user');

      // Proteksi sesi aman kementerian: jika tidak ada sesi aktif, alihkan ke login
      if (!savedToken && !savedUser) {
        router.push('/login');
        return;
      }

      if (savedRole) {
        setCurrentRole(savedRole);
      }
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          setCurrentUser(parsed);
          // Also fetch fresh user profile from backend MySQL to ensure avatar is never broken
          if (parsed.username) {
            try {
              const res = await fetch(`/api/users`);
              if (res.ok) {
                const uJson = await res.json();
                if (uJson.data) {
                  const match = uJson.data.find((u: any) => u.username === parsed.username);
                  if (match) {
                    setCurrentUser(match);
                    localStorage.setItem('sim_benih_user', JSON.stringify(match));
                  }
                }
              }
            } catch {}
          }
        } catch {}
      }

      // Fetch dynamic role permissions from master data
      try {
        const pRes = await fetch('/api/master/role-permissions');
        if (pRes.ok) {
          const pJson = await pRes.json();
          if (pJson.data) {
            const map: Record<string, string[]> = {};
            pJson.data.forEach((item: any) => {
              map[item.role] = item.sidebar_menus || item.allowed_features || [];
            });
            setRolePermissions(map);
          }
        }
      } catch {}
    };

    // Force pure light mode across entire dashboard
    try {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      localStorage.setItem('kementan_theme', 'light');
    } catch {}

    loadUserData();
    window.addEventListener('kementan_user_updated', loadUserData);
    window.addEventListener('kementan_permissions_updated', loadUserData);
    return () => {
      window.removeEventListener('kementan_user_updated', loadUserData);
      window.removeEventListener('kementan_permissions_updated', loadUserData);
    };
  }, []);

  const toggleSidebarCollapse = () => {
    const next = !isSidebarCollapsed;
    setIsSidebarCollapsed(next);
    localStorage.setItem('sim_benih_sidebar_collapsed', String(next));
  };

  const handleRoleChange = (newRole: UserRole) => {
    setCurrentRole(newRole);
    localStorage.setItem('sim_benih_role', newRole);
  };

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);

    try {
      const token = localStorage.getItem('sim_benih_token') || '';
      const userStr = localStorage.getItem('sim_benih_user');
      let userData: any = null;
      try {
        userData = userStr ? JSON.parse(userStr) : null;
      } catch {}

      // Panggil backend API resmi Kementerian Pertanian
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
      }).catch((e) => console.warn('Logout sync warning:', e));

    } catch (err) {
      console.warn('Logout execution note:', err);
    } finally {
      // Bersihkan seluruh sesi browser
      localStorage.removeItem('sim_benih_token');
      localStorage.removeItem('sim_benih_user');
      localStorage.removeItem('sim_benih_role');
      localStorage.removeItem('kementan_session_expiry');
      sessionStorage.clear();

      // Beri sedikit jeda halus lalu redirect ke login dengan status terverifikasi
      setTimeout(() => {
        router.push('/login?status=logged_out');
      }, 500);
    }
  };

  // Role Metadata configuration
  const roleLabels: Record<UserRole, { title: string; badge: string; color: string; agency: string }> = {
    super_admin: { 
      title: 'Direktorat Perbenihan Hortikultura (Pusat)', 
      badge: 'SUPER ADMIN', 
      color: 'bg-emerald-900 text-emerald-100 border border-emerald-700',
      agency: 'Kementerian Pertanian Republik Indonesia'
    },
    bpsb: { 
      title: 'Balai Pengawasan & Sertifikasi Benih (Jawa Timur)', 
      badge: 'PETUGAS BPSB', 
      color: 'bg-blue-900 text-blue-100 border border-blue-700',
      agency: 'UPT PSBTPH Dinas Pertanian Provinsi'
    },
    lssm: { 
      title: 'Lembaga Sertifikasi Sistem Mutu (LSSM Horti)', 
      badge: 'AUDITOR LSSM', 
      color: 'bg-amber-900 text-amber-100 border border-amber-700',
      agency: 'Lembaga Sertifikasi Sistem Mutu Terakreditasi KAN'
    },
    tp2vh: { 
      title: 'Sekretariat & Tim Penilai Pelepasan Varietas', 
      badge: 'TIM TP2VH', 
      color: 'bg-purple-900 text-purple-100 border border-purple-700',
      agency: 'Tim Pakar & Penilai Pelepasan Varietas Hortikultura'
    },
    applicant: { 
      title: 'PT East West Seed Indonesia (Pemohon)', 
      badge: 'PRODUSEN / PEMOHON', 
      color: 'bg-slate-800 text-slate-100 border border-slate-700',
      agency: 'Badan Usaha / Penangkar Benih Hortikultura'
    },
    public: { 
      title: 'Masyarakat / Pemerhati Perbenihan', 
      badge: 'PUBLIK', 
      color: 'bg-slate-700 text-slate-200 border border-slate-600',
      agency: 'Publik'
    },
  };

  // Dedicated role-specific menus tailored to each role's workflow
  const roleMenus: Record<UserRole, MenuItem[]> = {
    super_admin: [
      {
        title: 'Dashboard Eksekutif',
        subtitle: 'Pusat Komando 38 BPSB',
        href: '/dashboard',
        icon: LayoutDashboard,
      },
      {
        title: 'Master Data Hortikultura',
        subtitle: 'Jenis, Satuan, BPSB, LSSM',
        href: '/dashboard/master-data',
        icon: Database,
      },
      {
        title: 'Modul A: Data Produsen dan Pengedar',
        subtitle: 'Rekapitulasi 38 Provinsi',
        href: '/dashboard/produsen-pengedar',
        icon: Building2,
      },
      {
        title: 'Modul B: Data Produksi Benih Bulanan',
        subtitle: 'Agregat 4 Komoditas Nasional',
        href: '/dashboard/produksi-benih',
        icon: Sprout,
      },
      {
        title: 'Modul C: Pendaftaran Varietas Tanaman Hortikultura',
        subtitle: 'Permentan No. 24 Tahun 2025',
        href: '/dashboard/pendaftaran-varietas',
        icon: FileCheck,
      },
      {
        title: 'Kelola Pengguna & Role',
        subtitle: 'Manajemen Akun Terdaftar',
        href: '/dashboard/pengguna',
        icon: Users,
      },
      {
        title: 'Pengaturan Web (CMS)',
        subtitle: 'Desain Banner & Landing Page',
        href: '/dashboard/pengaturan-web',
        icon: Sliders,
      },
      {
        title: 'Profil & Akun Saya',
        subtitle: 'Ganti Sandi & Upload Foto',
        href: '/dashboard/profil',
        icon: User,
      },
    ],
    bpsb: [
      {
        title: 'Dashboard Wilayah BPSB',
        subtitle: 'Ringkasan Data Provinsi',
        href: '/dashboard',
        icon: LayoutDashboard,
      },
      {
        title: 'Data Produsen dan Pengedar',
        subtitle: 'Input & Rekapitulasi Wilayah (Modul A)',
        href: '/dashboard/produsen-pengedar',
        icon: Building2,
      },
      {
        title: 'Data Produksi Benih Bulanan',
        subtitle: 'Input Realisasi 4 Jenis (Modul B)',
        href: '/dashboard/produksi-benih',
        icon: Sprout,
      },
      {
        title: 'Permohonan Varietas Hortikultura',
        subtitle: 'Pengajuan Layanan Daerah (Modul C)',
        href: '/dashboard/pendaftaran-varietas',
        icon: FileCheck,
      },
      {
        title: 'Status Sinkronisasi ke Pusat',
        subtitle: 'Pemantauan Kepatuhan Laporan',
        href: '/dashboard/produksi-benih?tab=sinkronisasi',
        icon: RefreshCw,
      },
      {
        title: 'Profil & Akun Saya',
        subtitle: 'Ganti Sandi & Upload Foto',
        href: '/dashboard/profil',
        icon: User,
      },
    ],
    lssm: [
      {
        title: 'Dashboard Auditor Mutu',
        subtitle: 'Sertifikasi Mutu & Lab',
        href: '/dashboard',
        icon: LayoutDashboard,
      },
      {
        title: 'Neraca Benih Produsen LSSM',
        subtitle: 'Format Export Khusus LSSM',
        href: '/dashboard/produksi-benih',
        icon: Sprout,
      },
      {
        title: 'Audit Produsen & Standar ISO',
        subtitle: 'Sertifikat Kompetensi & Uji Lab',
        href: '/dashboard/produsen-pengedar',
        icon: Award,
      },
      {
        title: 'Profil & Akun Saya',
        subtitle: 'Ganti Sandi & Upload Foto',
        href: '/dashboard/profil',
        icon: User,
      },
    ],
    tp2vh: [
      {
        title: 'Dashboard Sidang TP2VH',
        subtitle: 'Agenda & Status Permohonan',
        href: '/dashboard',
        icon: LayoutDashboard,
      },
      {
        title: 'Layanan 1: Verifikasi Rencana Uji',
        subtitle: 'Format Lampiran 1 Model-4',
        href: '/dashboard/pendaftaran-varietas?layanan=1',
        icon: FileText,
      },
      {
        title: 'Layanan 2: Evaluasi Sidang Pleno',
        subtitle: 'Lampiran 2.a Uji Keunggulan',
        href: '/dashboard/pendaftaran-varietas?layanan=2',
        icon: Layers,
      },
      {
        title: 'Layanan 3: Putusan & Sanggah',
        subtitle: 'Status Lolos / Perbaikan & 30 Hari',
        href: '/dashboard/pendaftaran-varietas?layanan=3',
        icon: Clock,
      },
      {
        title: 'Penerbitan Rekomendasi Resmi',
        subtitle: 'Surat Keterangan QR Code TTE',
        href: '/dashboard/pendaftaran-varietas?layanan=rekomendasi',
        icon: ShieldCheck,
      },
      {
        title: 'Profil & Akun Saya',
        subtitle: 'Ganti Sandi & Upload Foto',
        href: '/dashboard/profil',
        icon: User,
      },
    ],
    applicant: [
      {
        title: 'Dashboard Pemohon & Produsen',
        subtitle: 'Ringkasan Berkas & Produksi',
        href: '/dashboard',
        icon: LayoutDashboard,
      },
      {
        title: 'Data Produksi Benih Bulanan',
        subtitle: 'Input Produksi Produsen SMM (Modul B)',
        href: '/dashboard/produksi-benih',
        icon: Sprout,
      },
      {
        title: 'Layanan 1: Ajukan Rencana Uji',
        subtitle: 'Format Lampiran 1 Formulir Model-4',
        href: '/dashboard/pendaftaran-varietas?layanan=1',
        icon: FileText,
      },
      {
        title: 'Layanan 2: Ajukan Sidang TP2VH',
        subtitle: 'Lampiran 2.a Naskah Hasil Uji',
        href: '/dashboard/pendaftaran-varietas?layanan=2',
        icon: Layers,
      },
      {
        title: 'Layanan 3: Pengajuan Perbaikan',
        subtitle: 'Lampiran 2.b Perbaikan / Tunda',
        href: '/dashboard/pendaftaran-varietas?layanan=3',
        icon: Edit,
      },
      {
        title: 'Layanan 4: Pemantauan & SK',
        subtitle: 'Pelacakan Tiket & Rekomendasi',
        href: '/dashboard/pendaftaran-varietas?layanan=4',
        icon: QrCode,
      },
      {
        title: 'Profil Produsen & Legalitas',
        subtitle: 'Sertifikat Kompetensi Benih',
        href: '/dashboard/produsen-pengedar',
        icon: Building2,
      },
      {
        title: 'Profil & Akun Saya',
        subtitle: 'Ganti Sandi & Upload Foto',
        href: '/dashboard/profil',
        icon: User,
      },
    ],
    public: [
      {
        title: 'Dashboard Eksekutif',
        href: '/dashboard',
        icon: LayoutDashboard,
      }
    ]
  };

  // Map allowed features to menu paths
  const featureToPaths: Record<string, string[]> = {
    dashboard: ['/dashboard'],
    master_data: ['/dashboard/master-data'],
    modul_a: ['/dashboard/produsen-pengedar'],
    modul_b: ['/dashboard/produksi-benih'],
    modul_c: ['/dashboard/pendaftaran-varietas'],
    pengguna: ['/dashboard/pengguna'],
    cms: ['/dashboard/pengaturan-web'],
    profil: ['/dashboard/profil']
  };

  const defaultMenus = roleMenus[currentRole] || roleMenus.super_admin;
  
  // Dynamically filter menus if master data has custom permissions for this role
  const currentMenuItems = React.useMemo(() => {
    const allowed = rolePermissions[currentRole];
    if (!allowed || allowed.length === 0 || currentRole === 'super_admin') {
      return defaultMenus;
    }
    return defaultMenus.filter(item => {
      // Always allow profile
      if (item.href.includes('/dashboard/profil')) return true;
      return allowed.some(feat => {
        const paths = featureToPaths[feat] || [];
        return paths.some(p => item.href.startsWith(p));
      });
    });
  }, [currentRole, rolePermissions, defaultMenus]);

  return (
    <div className="h-screen flex bg-slate-100 dark:bg-slate-950 overflow-hidden transition-colors duration-300">
      
      {/* 
        SIDEBAR DESKTOP:
        Executive Dark Kementan Authority theme with smooth hide/show toggle
      */}
      <aside className={`hidden lg:flex lg:flex-col h-screen sticky top-0 bg-[#061814] text-slate-200 border-r border-[#0e2a24] shrink-0 shadow-2xl z-40 overflow-hidden transition-all duration-300 ${
        isSidebarCollapsed ? 'w-0 border-r-0 opacity-0 -translate-x-full pointer-events-none' : 'w-72 opacity-100'
      }`}>
        
        {/* Brand Area (Shrink-0) */}
        <div className="h-20 shrink-0 flex items-center px-6 border-b border-[#0e2a24] bg-[#04120f] transition-colors">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center shadow-md ring-2 ring-emerald-500/30 group-hover:scale-105 transition-transform duration-300 shrink-0">
              <img 
                src="/images/logo_kementan.png" 
                alt="Logo Kementan" 
                className="w-full h-full object-contain"
              />
            </div>
            <div className="overflow-hidden">
              <span className="font-heading font-extrabold text-sm text-white block leading-tight tracking-tight group-hover:text-emerald-400 transition-colors whitespace-nowrap">
                SIM-BENIH <span className="text-amber-400">HORTI</span>
              </span>
              <span className="text-[10px] text-emerald-400 font-medium truncate block">
                Portal Manajemen Terpadu
              </span>
            </div>
          </Link>
        </div>

        {/* Real-time Authenticated User Profile Card */}
        <div className="shrink-0 p-3 mx-3.5 my-3 rounded-2xl bg-white/5 border border-white/10 text-xs shadow-inner transition-colors">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-emerald-800 border border-emerald-500/50 shrink-0 flex items-center justify-center shadow-md">
              {currentUser?.avatar ? (
                <img 
                  src={currentUser.avatar} 
                  alt={currentUser.name || 'User'} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="font-bold text-white text-base font-heading">
                  {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                </span>
              )}
            </div>

            <div className="overflow-hidden flex-1 min-w-0">
              <div className="font-bold text-white text-xs truncate">
                {currentUser?.name || roleLabels[currentRole].title}
              </div>
              <div className="text-[10px] text-emerald-400 font-semibold truncate">
                @{currentUser?.username || 'user'} • {roleLabels[currentRole].badge}
              </div>
              <div className="text-[10px] text-slate-400 truncate">
                {currentUser?.agency_name || roleLabels[currentRole].agency}
              </div>
            </div>

            <Link
              href="/dashboard/profil"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors shrink-0"
              title="Pengaturan Profil & Foto"
            >
              <Settings className="w-4 h-4 text-emerald-400" />
            </Link>
          </div>
        </div>

        {/* Navigation Links (Flex-1, Scrollable independently) */}
        <nav className="flex-1 px-3.5 py-1 space-y-1.5 overflow-y-auto scrollbar-thin scrollbar-thumb-emerald-700 scrollbar-track-transparent">
          <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest px-3 py-1">
            <span>Menu Alur Kerja</span>
          </div>

          {currentMenuItems.map((item) => {
            const Icon = item.icon;
            // Check active state taking query params into consideration
            const isActive = pathname === item.href.split('?')[0] && (
              !item.href.includes('?') || 
              (typeof window !== 'undefined' && window.location.search === item.href.substring(item.href.indexOf('?')))
            );

            return (
              <Link
                key={item.title + item.href}
                href={item.href}
                className={`relative group flex items-start space-x-3 px-3.5 py-2.5 rounded-xl transition-all duration-300 overflow-hidden ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-800 to-teal-800 text-white font-bold shadow-md shadow-emerald-950/40 border border-emerald-500/50'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white hover:translate-x-1'
                }`}
              >
                {/* Active Indicator Bar (Glow) */}
                {isActive && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-1.5 rounded-r-full bg-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.85)] animate-pulse" />
                )}

                {/* Shimmer sweep on hover */}
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />

                <Icon 
                  className={`w-4 h-4 shrink-0 mt-0.5 transition-transform duration-300 group-hover:scale-110 ${
                    isActive ? 'text-amber-300 drop-shadow-[0_0_6px_rgba(245,158,11,0.5)]' : 'text-emerald-400'
                  }`} 
                />
                <div className="relative z-10 overflow-hidden">
                  <div className={`text-xs leading-tight truncate ${isActive ? 'font-extrabold text-white' : 'font-semibold'}`}>
                    {item.title}
                  </div>
                  {item.subtitle && (
                    <div className={`text-[10px] mt-0.5 font-normal leading-tight truncate ${isActive ? 'text-emerald-200' : 'text-slate-400'}`}>
                      {item.subtitle}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}

        </nav>

        {/* Footer Area with Clean Action Buttons */}
        <div className="shrink-0 p-3.5 border-t border-[#0e2a24] bg-[#04120f] transition-colors">
          <div className="flex items-center space-x-2">
            <Link
              href="/"
              className="flex-1 group flex items-center justify-center space-x-1.5 px-3 py-2.5 rounded-xl text-xs text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-center"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-emerald-400 group-hover:-translate-x-0.5 transition-transform" />
              <span className="font-semibold text-xs">Halaman Publik</span>
            </Link>

            <button
              onClick={handleLogout}
              className="px-3 py-2.5 rounded-xl text-xs font-semibold text-red-300 bg-red-950/40 hover:bg-red-950/80 border border-red-500/30 transition-all flex items-center gap-1.5"
              title="Keluar / Logout Sesi"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </button>
          </div>
        </div>

      </aside>

      {/* MOBILE DRAWER SIDEBAR */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden flex"
          onClick={() => setSidebarOpen(false)}
        >
          <div 
            className="w-72 bg-kementan-forest-950 text-slate-200 h-full flex flex-col p-4 shadow-2xl animate-in slide-in-from-left duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-kementan-forest-900">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-white p-1">
                  <img src="/images/logo_kementan.png" alt="Logo Kementan" className="w-full h-full object-contain" />
                </div>
                <span className="font-heading font-extrabold text-white text-sm">
                  SIM-BENIH <span className="text-kementan-gold-400">HORTI</span>
                </span>
              </div>
              <button 
                onClick={() => setSidebarOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User Profile Card Mobile */}
            <div className="my-3 p-3 bg-slate-900 rounded-xl border border-emerald-700/50 flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg overflow-hidden bg-emerald-900 border border-emerald-500/50 shrink-0 flex items-center justify-center">
                {currentUser?.avatar ? (
                  <img src={currentUser.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="font-bold text-white text-sm font-heading">
                    {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                  </span>
                )}
              </div>
              <div className="overflow-hidden flex-1 min-w-0">
                <div className="font-bold text-white text-xs truncate">
                  {currentUser?.name || roleLabels[currentRole].title}
                </div>
                <div className="text-[10px] text-emerald-400 font-semibold truncate">
                  @{currentUser?.username || 'user'} • {roleLabels[currentRole].badge}
                </div>
              </div>
            </div>

            <nav className="flex-1 space-y-1.5 overflow-y-auto">
              {currentMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href.split('?')[0];
                return (
                  <Link
                    key={item.title + item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold ${
                      isActive 
                        ? 'bg-emerald-600 text-white' 
                        : 'text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.title}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="pt-3 border-t border-kementan-forest-900 flex items-center justify-between">
              <Link
                href="/"
                className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Halaman Publik</span>
              </Link>
              <button onClick={handleLogout} className="text-xs text-red-400 hover:text-red-300">
                Keluar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 
        MAIN CONTENT AREA:
        h-screen overflow-y-auto, flex-1, min-w-0
        Light mode background with liquid glass styling
      */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto bg-slate-50 text-slate-900 transition-colors duration-300 relative">
        {/* 16:9 Botanical Glass Background for Liquid Glass Depth */}
        <div 
          className="fixed inset-0 pointer-events-none z-0 opacity-45 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url('/images/bg_light_kementan.jpg')` }}
        />
        
        {/* Top Header Sticky with Liquid Glass effect in Executive Dark Kementan */}
        <header className="h-16 sm:h-20 bg-[#061814]/95 backdrop-blur-2xl border-b border-[#0e2a24] px-3 sm:px-8 flex items-center justify-between shadow-[0_4px_30px_rgba(0,0,0,0.3)] sticky top-0 z-30 shrink-0 transition-all duration-300 gap-2">
          
          <div className="flex items-center space-x-2 sm:space-x-3.5 min-w-0 flex-1 sm:flex-initial">
            {/* Mobile Drawer Toggle */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-1.5 sm:p-2 rounded-xl text-slate-300 hover:bg-white/10 hover:text-white transition-colors shrink-0"
              title="Menu Mobile"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Desktop Sidebar Hide/Show Toggle */}
            <button
              type="button"
              onClick={toggleSidebarCollapse}
              className="hidden lg:flex items-center justify-center p-2 rounded-2xl text-slate-300 hover:text-white hover:bg-white/10 border border-white/10 transition-all hover:scale-105 active:scale-95 shadow-xs"
              title={isSidebarCollapsed ? "Buka Sidebar Menu" : "Sembunyikan Sidebar (Mode Layar Penuh)"}
            >
              {isSidebarCollapsed ? (
                <PanelLeft className="w-5 h-5 text-emerald-400" />
              ) : (
                <PanelLeftClose className="w-5 h-5" />
              )}
            </button>

            <div className="min-w-0 flex-1">
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold tracking-wider shrink-0 ${roleLabels[currentRole].color}`}>
                  {roleLabels[currentRole].badge}
                </span>
                <span className="text-xs text-slate-500 hidden md:inline">•</span>
                <span className="text-xs font-semibold text-slate-300 hidden md:inline truncate max-w-[180px] xl:max-w-xs">
                  {currentUser?.name || roleLabels[currentRole].title}
                </span>
              </div>
              <h2 
                className="font-heading font-extrabold text-xs sm:text-base text-white leading-tight mt-0.5 truncate max-w-[150px] xs:max-w-[210px] sm:max-w-none"
                title="Sistem Terpadu Perbenihan Hortikultura Nasional"
              >
                <span className="sm:hidden">SIM-BENIH HORTI</span>
                <span className="hidden sm:inline">Sistem Terpadu Perbenihan Hortikultura</span>
              </h2>
            </div>
          </div>

          {/* Middle: Live Clock, Indonesian Date & Operational Status */}
          <div className="hidden lg:block">
            <HeaderClock />
          </div>

          {/* Right: Timer, Bug Report, Profile & Public Link */}
          <div className="flex items-center space-x-1 sm:space-x-2 shrink-0">
            <div className="hidden md:block">
              <SessionTimer />
            </div>

            {/* Report Bug Trigger Button */}
            <button
              type="button"
              onClick={() => setReportBugOpen(true)}
              className="p-1.5 sm:p-2 rounded-xl sm:rounded-2xl text-red-400 hover:text-red-300 hover:bg-red-950/40 border border-red-500/30 transition-all hover:scale-105 active:scale-95 shadow-xs flex items-center gap-1.5"
              title="Laporkan Bug / Kendala Teknis Sistem"
            >
              <Bug className="w-4 h-4 text-red-400" />
              <span className="hidden 2xl:inline text-[11px] font-bold text-red-400">Lapor Bug</span>
            </button>

            {/* User Profile Mini Thumbnail with Safe Image Render */}
            <Link
              href="/dashboard/profil"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl overflow-hidden bg-gradient-to-tr from-emerald-800 to-teal-700 border border-emerald-500/40 hover:border-emerald-400 transition-all flex items-center justify-center shrink-0 shadow-xs hover:scale-105"
              title="Profil & Akun Saya"
            >
              {currentUser?.avatar ? (
                <img 
                  src={currentUser.avatar} 
                  alt="" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <span className="font-bold text-white text-xs font-heading">
                  {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'S'}
                </span>
              )}
            </Link>

            <Link
              href="/"
              className="p-1.5 sm:p-2 rounded-xl sm:rounded-2xl text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all hover:scale-105 active:scale-95 shadow-xs"
              title="Lihat Beranda Publik"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>

            {/* Quick Header Logout Button */}
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="p-1.5 sm:px-3 sm:py-2 rounded-xl sm:rounded-2xl text-xs font-bold text-red-300 hover:text-white bg-red-950/40 hover:bg-red-900/80 border border-red-500/30 transition-all flex items-center space-x-1.5 hover:scale-105 active:scale-95 shadow-xs cursor-pointer"
              title="Keluar dari Sesi Sistem & Server Kementerian"
            >
              <LogOut className={`w-3.5 h-3.5 text-red-400 ${isLoggingOut ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{isLoggingOut ? 'Keluar...' : 'Keluar'}</span>
            </button>
          </div>

        </header>

        {/* Page Content Body */}
        <main className="flex-1 p-4 sm:p-8 relative z-10">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>

      </div>

      {/* Global Report Bug Modal */}
      <ReportBugModal
        isOpen={reportBugOpen}
        onClose={() => setReportBugOpen(false)}
        defaultUserName={currentUser?.name}
      />

      {/* Floating Liquid Glass Cookie Banner */}
      <CookieBanner />

      {/* Synchronized Backend Logout Transition Modal */}
      {isLoggingOut && (
        <div className="fixed inset-0 z-[9999] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center shadow-2xl space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-inner">
              <LogOut className="w-7 h-7 text-emerald-400 animate-pulse" />
            </div>
            <div className="space-y-1.5">
              <h3 className="font-heading font-black text-white text-lg">Mengakhiri Sesi Resmi</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Menyinkronkan status logout ke basis data kementerian dan mengamankan token akses...
              </p>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full w-full animate-pulse" />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
