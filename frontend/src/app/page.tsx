'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { 
  Search, 
  ShieldCheck, 
  Sprout, 
  CalendarClock, 
  FileText, 
  CheckCircle2, 
  Building2, 
  ArrowRight, 
  Download, 
  AlertCircle,
  FileCheck,
  ChevronRight,
  ChevronLeft,
  Clock,
  QrCode,
  FileSpreadsheet,
  Award,
  Layers,
  Scale,
  X,
  Send,
  ExternalLink,
  Shield,
  FileSignature,
  Printer
} from 'lucide-react';
import { INITIAL_VARIETY_APPLICATIONS } from '@/data/masterData';
import { VarietyApplication } from '@/types';
import ScrollReveal from '@/components/ScrollReveal';

// Helper to map DB row to Frontend Variety Application
function mapDbToVariety(row: any): VarietyApplication {
  return {
    id: row.id,
    trackingCode: row.tracking_code || `VAR-${row.id}`,
    applicantName: row.applicant_name || '-',
    institutionType: row.institution_type || 'swasta',
    cropType: row.crop_type || 'sayuran',
    commodityName: row.commodity_name || '-',
    proposedVarietyName: row.proposed_variety_name || '-',
    lineage: row.lineage || '-',
    submissionDate: row.submission_date || '',
    currentStage: row.current_stage || 'layanan_1_rencana_uji',
    testNoticeLetterNo: row.test_notice_letter_no || undefined,
    testNoticeStatus: row.test_notice_status || undefined,
    testResponseLetterNo: row.test_response_letter_no || undefined,
    testResponseDate: row.test_response_date || undefined,
    tp2vhSessionDate: row.tp2vh_session_date || undefined,
    tp2vhSessionStatus: row.tp2vh_session_status || undefined,
    tp2vhNotes: row.tp2vh_notes || undefined,
    objectionStartDate: row.objection_start_date || undefined,
    objectionEndDate: row.objection_end_date || undefined,
    objectionDaysLeft: row.objection_days_left !== null ? Number(row.objection_days_left) : undefined,
    totalObjectionsCount: row.total_objections_count !== null ? Number(row.total_objections_count) : 0,
    recommendationLetterNo: row.recommendation_letter_no || undefined,
    registrationNumber: row.registration_number || undefined,
    statusText: row.status_text || 'Dalam Proses',
  };
}

export default function HomePage() {
  const [searchCode, setSearchCode] = useState('');
  const [allApplications, setAllApplications] = useState<VarietyApplication[]>(INITIAL_VARIETY_APPLICATIONS);
  const [catalogVarieties, setCatalogVarieties] = useState<VarietyApplication[]>([]);
  const [objectionVarieties, setObjectionVarieties] = useState<VarietyApplication[]>([]);
  const [trackedApplication, setTrackedApplication] = useState<VarietyApplication | null>(null);
  const [searchError, setSearchError] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [activeTabCatalogue, setActiveTabCatalogue] = useState<'semua' | 'sayuran' | 'buah' | 'hias' | 'obat'>('semua');

  // Modals
  const [selectedVerifyVariety, setSelectedVerifyVariety] = useState<VarietyApplication | null>(null);
  const [selectedManuscriptVariety, setSelectedManuscriptVariety] = useState<VarietyApplication | null>(null);
  const [objectionModalVariety, setObjectionModalVariety] = useState<VarietyApplication | null>(null);
  const [objectionForm, setObjectionForm] = useState({ name: '', org: '', email: '', phone: '', reason: '' });
  const [objectionSuccess, setObjectionSuccess] = useState(false);

  // Hero Carousel State
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const DEFAULT_HERO_SLIDES = [
    {
      image: '/images/hero_pertanian.jpg',
      badge: 'Sistem Terpadu Perbenihan Hortikultura',
      title: 'Digitalisasi Ekosistem Perbenihan & Varietas Nasional',
      description: 'Integrasi pelaporan 38 BPSB Provinsi, neraca produksi benih bulanan otomatis, dan transparansi sidang penilaian varietas TP2VH sesuai Permentan No. 24 Tahun 2025.',
      stats: [
        { value: '38', label: 'BPSB Provinsi Terhubung' },
        { value: '100%', label: 'Sidang TP2VH Terdokumentasi' },
        { value: '30 Hari', label: 'Masa Sanggah Terbuka' }
      ]
    },
    {
      image: '/images/benih_sertifikasi.jpg',
      badge: 'Standarisasi & Sertifikasi Mutu Benih Unggul',
      title: 'Jaminan Benih Bersertifikat & Kedaulatan Pangan Nasional',
      description: 'Standarisasi pengawasan penangkar benih berizin di seluruh Indonesia, pemantauan neraca stok benih bulanan secara akurat, serta uji laboratorium morfologi dan kemurnian genetik berdaya saing global.',
      stats: [
        { value: '4 Kelompok', label: 'Komoditas Hortikultura' },
        { value: 'Akreditasi', label: 'Standar Laboratorium ISO' },
        { value: 'Real-Time', label: 'Integrasi Neraca Stok Benih' }
      ]
    },
    {
      image: '/images/panen_distribusi.jpg',
      badge: 'Regulasi & Pelepasan Varietas Terpadu',
      title: 'Transparansi Pendaftaran Varietas Permentan 24/2025',
      description: 'Proses uji kebenaran dan keunggulan varietas tanaman hortikultura yang akuntabel, sidang pleno TP2VH transparan, serta kepastian perlindungan hak pemulia tanaman secara publik.',
      stats: [
        { value: 'SOP Resmi', label: 'Lampiran 1 & Lampiran 2.a' },
        { value: 'Pasal 16', label: 'Penegakan Hukum Hak Pemulia' },
        { value: 'Online', label: 'Penerbitan SK Tanda Daftar' }
      ]
    }
  ];

  const [heroSlides, setHeroSlides] = useState(DEFAULT_HERO_SLIDES);

  // Load live data from MySQL Backend API
  useEffect(() => {
    // 1. Load Web Settings (Hero Slides)
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const json = await res.json();
          if (json.data && json.data.hero_slides && Array.isArray(json.data.hero_slides) && json.data.hero_slides.length > 0) {
            setHeroSlides(json.data.hero_slides);
            return;
          }
        }
      } catch {}

      // Fallback local storage
      const localSlides = localStorage.getItem('sim_benih_hero_slides') || localStorage.getItem('kementan_web_settings');
      if (localSlides) {
        try {
          const parsed = JSON.parse(localSlides);
          if (Array.isArray(parsed) && parsed.length > 0) setHeroSlides(parsed);
          else if (parsed.heroSlides && Array.isArray(parsed.heroSlides)) setHeroSlides(parsed.heroSlides);
        } catch {}
      }
    };

    // 2. Load Real Variety Applications
    const fetchVarieties = async () => {
      try {
        // Fetch all
        const resAll = await fetch('/api/varieties');
        if (resAll.ok) {
          const jsonAll = await resAll.json();
          if (jsonAll.data && Array.isArray(jsonAll.data) && jsonAll.data.length > 0) {
            const mappedAll = jsonAll.data.map(mapDbToVariety);
            setAllApplications(mappedAll);
            // Default tracked application (pick one in objection or registered)
            const sample = mappedAll.find((a: VarietyApplication) => a.trackingCode === 'VAR-2026-HORTI-0842') || mappedAll[0];
            setTrackedApplication(sample);
          }
        }

        // Fetch catalog
        const resCat = await fetch('/api/varieties/catalog');
        if (resCat.ok) {
          const jsonCat = await resCat.json();
          if (jsonCat.data && Array.isArray(jsonCat.data)) {
            setCatalogVarieties(jsonCat.data.map(mapDbToVariety));
          }
        }

        // Fetch objections
        const resObj = await fetch('/api/varieties/objections');
        if (resObj.ok) {
          const jsonObj = await resObj.json();
          if (jsonObj.data && Array.isArray(jsonObj.data)) {
            setObjectionVarieties(jsonObj.data.map(mapDbToVariety));
          }
        }
      } catch (err) {
        console.error('Failed to load variety data from backend:', err);
        // Fallback to static
        setCatalogVarieties(INITIAL_VARIETY_APPLICATIONS.filter(v => v.currentStage === 'layanan_4_selesai_terdaftar'));
        setObjectionVarieties(INITIAL_VARIETY_APPLICATIONS.filter(v => v.currentStage === 'layanan_3_masa_sanggah'));
        setTrackedApplication(INITIAL_VARIETY_APPLICATIONS[0]);
      }
    };

    fetchSettings();
    fetchVarieties();
  }, []);

  // Auto advance carousel slides
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isPaused, heroSlides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchCode.trim();
    if (!query) return;

    setSearchLoading(true);
    setSearchError(false);

    try {
      const res = await fetch(`/api/varieties/track/${encodeURIComponent(query)}`);
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setTrackedApplication(mapDbToVariety(json.data));
          setSearchError(false);
          setSearchLoading(false);
          return;
        }
      }
    } catch {}

    // Fallback in-memory search
    const found = allApplications.find(
      app => app.trackingCode.toLowerCase().includes(query.toLowerCase()) ||
             app.proposedVarietyName.toLowerCase().includes(query.toLowerCase()) ||
             (app.registrationNumber && app.registrationNumber.toLowerCase().includes(query.toLowerCase()))
    );

    if (found) {
      setTrackedApplication(found);
      setSearchError(false);
    } else {
      setSearchError(true);
    }
    setSearchLoading(false);
  };

  const selectSample = async (code: string) => {
    setSearchCode(code);
    setSearchLoading(true);
    setSearchError(false);

    try {
      const res = await fetch(`/api/varieties/track/${encodeURIComponent(code)}`);
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setTrackedApplication(mapDbToVariety(json.data));
          setSearchLoading(false);
          return;
        }
      }
    } catch {}

    const found = allApplications.find(app => app.trackingCode === code);
    if (found) {
      setTrackedApplication(found);
    } else {
      setSearchError(true);
    }
    setSearchLoading(false);
  };

  const handleObjectionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setObjectionSuccess(true);
    setTimeout(() => {
      setObjectionSuccess(false);
      setObjectionModalVariety(null);
      setObjectionForm({ name: '', org: '', email: '', phone: '', reason: '' });
    }, 3000);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc] text-slate-900 selection:bg-emerald-800 selection:text-white relative overflow-x-hidden">
      {/* 16:9 Pristine White Botanical Liquid Glass Background */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 opacity-35 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url('/images/bg_light_kementan.jpg')` }}
      />

      {/* Dynamic Ambient Liquid Glass Glowing Orbs (Flows seamlessly across entire scroll) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Upper Left Emerald Glow */}
        <div className="absolute -top-40 -left-40 w-96 md:w-[600px] h-96 md:h-[600px] bg-gradient-to-br from-emerald-400/20 via-teal-300/15 to-transparent rounded-full blur-3xl animate-pulse" />
        {/* Center Right Amber/Gold Warmth */}
        <div className="absolute top-[35%] -right-40 w-96 md:w-[650px] h-96 md:h-[650px] bg-gradient-to-bl from-amber-300/15 via-emerald-200/10 to-transparent rounded-full blur-3xl" />
        {/* Lower Left Deep Forest/Teal */}
        <div className="absolute top-[65%] -left-40 w-96 md:w-[700px] h-96 md:h-[700px] bg-gradient-to-tr from-teal-400/15 via-emerald-300/10 to-transparent rounded-full blur-3xl" />
        {/* Bottom Ambient Glow */}
        <div className="absolute -bottom-40 right-10 w-96 md:w-[600px] h-96 md:h-[600px] bg-gradient-to-tl from-emerald-500/15 via-amber-200/10 to-transparent rounded-full blur-3xl" />
      </div>

      {/* Floating Dynamic Island Header */}
      <Navbar />

      <main className="flex-grow relative z-10">
        
        {/* =========================================================================
            HERO SECTION: DYNAMIC INTERACTIVE CAROUSEL / SLIDER
        ========================================================================= */}
        <section 
          className="relative min-h-[640px] sm:min-h-[700px] md:min-h-[760px] flex items-center bg-slate-950 text-white overflow-hidden pt-28 sm:pt-36 pb-16 sm:pb-20"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Background Images Slider with Smooth Crossfade */}
          {heroSlides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'
              } transition-transform duration-7000`}
            >
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover object-center"
              />
              {/* Rich Dark Gradient & Glass Overlay for Ultra High Legibility */}
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/80 to-slate-950/50 backdrop-blur-[1px]" />
              <div className="absolute inset-0 bg-radial-gradient from-transparent via-slate-950/30 to-slate-950/80" />
            </div>
          ))}

          {/* Foreground Hero Content */}
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-12 w-full">
            <div className="max-w-3xl space-y-6">
              
              {/* Eyebrow Label Bersih & Institusional (Bebas Kapsul) */}
              <div className="flex items-center space-x-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-kementan-gold-400 shadow-[0_0_10px_rgba(245,158,11,0.8)] animate-pulse"></span>
                <span className="text-xs sm:text-sm font-extrabold tracking-widest text-emerald-300 uppercase">
                  {heroSlides[currentSlide].badge}
                </span>
              </div>

              {/* Dynamic Changing Heading */}
              <h1 className="font-heading font-extrabold text-2xl sm:text-4xl md:text-5xl lg:text-[3.25rem] text-white leading-[1.2] tracking-tight transition-all duration-500">
                {heroSlides[currentSlide].title}
              </h1>

              {/* Dynamic Changing Subtitle */}
              <p className="text-xs sm:text-base md:text-lg text-slate-200 leading-relaxed font-normal max-w-2xl transition-all duration-500">
                {heroSlides[currentSlide].description}
              </p>

              {/* Dynamic Key Stats: LIQUID GLASS PILL CARDS WITH HOVER ANIMATION */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-2">
                {heroSlides[currentSlide].stats.map((stat, i) => (
                  <div 
                    key={i} 
                    className="relative group overflow-hidden p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 hover:border-emerald-400/50 text-white shadow-[0_8px_32px_rgba(0,0,0,0.37),inset_0_1px_1px_rgba(255,255,255,0.4)] hover:shadow-[0_16px_40px_rgba(5,150,105,0.25),inset_0_1px_1px_rgba(255,255,255,0.7)] hover:-translate-y-1.5 transition-all duration-300 cursor-pointer"
                  >
                    {/* Glass sheen sweeper on cursor hover */}
                    <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />

                    <span className="relative z-10 block font-black text-sm sm:text-xl md:text-2xl text-kementan-gold-400 group-hover:scale-105 transition-transform duration-300 truncate">
                      {stat.value}
                    </span>
                    <span className="relative z-10 text-[10px] sm:text-xs text-slate-200 font-medium line-clamp-1 mt-0.5">
                      {stat.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Action Buttons: LIQUID GLASS BUTTONS WITH GLASS SHIMMER SWEEP */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 pt-3 sm:pt-4">
                <a
                  href="#sop-permentan"
                  className="relative group overflow-hidden inline-flex items-center justify-center space-x-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 text-white font-bold text-[11px] sm:text-xs uppercase tracking-wider shadow-[0_4px_20px_rgba(5,150,105,0.4),inset_0_1px_1px_rgba(255,255,255,0.7),inset_0_-1px_1px_rgba(0,0,0,0.3)] border border-emerald-300/40 hover:scale-105 active:scale-95 transition-all duration-300 text-center"
                >
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />
                  <ShieldCheck className="w-4 h-4 text-emerald-100 group-hover:rotate-6 transition-transform shrink-0" />
                  <span className="whitespace-nowrap">SOP Permentan 24/2025</span>
                </a>

                <a
                  href="#tracking"
                  className="relative group overflow-hidden inline-flex items-center justify-center space-x-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-full bg-white/15 hover:bg-white/25 text-white font-semibold text-[11px] sm:text-xs uppercase tracking-wider backdrop-blur-xl border border-white/30 shadow-[0_4px_16px_rgba(0,0,0,0.2),inset_0_1px_1px_rgba(255,255,255,0.6)] hover:scale-105 active:scale-95 transition-all duration-300 text-center"
                >
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />
                  <Search className="w-4 h-4 text-kementan-gold-400 group-hover:scale-110 transition-transform shrink-0" />
                  <span className="whitespace-nowrap">Lacak Permohonan</span>
                </a>

                <Link
                  href="/dashboard"
                  className="relative group overflow-hidden inline-flex items-center justify-center space-x-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-full bg-slate-900/80 hover:bg-slate-900 text-slate-200 hover:text-white font-semibold text-[11px] sm:text-xs uppercase tracking-wider backdrop-blur-xl border border-white/20 shadow-[0_4px_16px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.3)] hover:scale-105 active:scale-95 transition-all duration-300 text-center"
                >
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />
                  <Layers className="w-4 h-4 text-emerald-400 group-hover:rotate-12 transition-transform shrink-0" />
                  <span className="whitespace-nowrap">Portal BPSB</span>
                </Link>
              </div>

            </div>
          </div>

          {/* Carousel Controls (Left/Right Arrows & Indicator Dots) */}
          <div className="absolute bottom-4 sm:bottom-6 right-3 sm:right-8 z-20 flex items-center space-x-2 sm:space-x-3">
            {/* Prev Button */}
            <button
              onClick={prevSlide}
              aria-label="Previous Slide"
              className="w-10 h-10 rounded-full bg-slate-900/70 hover:bg-emerald-600 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all hover:scale-110 active:scale-95"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Slide Dots */}
            <div className="flex items-center space-x-1.5 px-3 py-2 rounded-full bg-slate-900/70 backdrop-blur-md border border-white/20">
              {heroSlides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                  className={`transition-all duration-300 rounded-full ${
                    idx === currentSlide 
                      ? 'w-7 h-2.5 bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]' 
                      : 'w-2.5 h-2.5 bg-white/40 hover:bg-white/70'
                  }`}
                />
              ))}
            </div>

            {/* Next Button */}
            <button
              onClick={nextSlide}
              aria-label="Next Slide"
              className="w-10 h-10 rounded-full bg-slate-900/70 hover:bg-emerald-600 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all hover:scale-110 active:scale-95"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </section>

        {/* =========================================================================
            DEDICATED SECTION: LAYANAN RESMI PERMENTAN 24/2025 (SOP RESMI)
            Liquid Glass Light Mode
        ========================================================================= */}
        <section id="sop-permentan" className="scroll-mt-24 py-16 md:py-24 bg-white/40 backdrop-blur-md transition-colors relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-8">
            
            {/* Header Section Tegas & Elegan */}
            <ScrollReveal direction="up" delay={0}>
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12 gap-4 sm:gap-6">
                <div className="max-w-3xl">
                  <div className="flex items-center space-x-2 text-emerald-800 text-xs font-black uppercase tracking-widest mb-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    <span>SOP Resmi Direktorat Perbenihan Hortikultura</span>
                  </div>
                  <h2 className="font-heading font-black text-2xl sm:text-3xl md:text-4xl text-slate-900 tracking-tight">
                    Layanan Resmi Permentan 24/2025
                  </h2>
                  <p className="text-xs sm:text-base text-slate-600 mt-2 leading-relaxed">
                    Standar Operasional Prosedur (SOP) pendaftaran, penilaian naskah ilmiah hasil uji kebenaran dan keunggulan, serta perlindungan hak pemuliaan tanaman hortikultura secara terbuka.
                  </p>
                </div>

                <div className="shrink-0 w-full sm:w-auto">
                  <Link
                    href="/dashboard/pendaftaran-varietas"
                    className="relative group overflow-hidden inline-flex items-center justify-center space-x-2 w-full sm:w-auto px-5 sm:px-6 py-3 sm:py-3.5 rounded-full bg-gradient-to-r from-emerald-800 via-emerald-700 to-emerald-800 text-white text-xs font-bold uppercase tracking-wider shadow-[0_4px_16px_rgba(6,78,59,0.35),inset_0_1px_1px_rgba(255,255,255,0.4)] border border-emerald-400/40 hover:scale-105 active:scale-95 transition-all duration-300"
                  >
                    <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />
                    <FileText className="w-4 h-4 text-emerald-300 group-hover:rotate-6 transition-transform" />
                    <span>Buka Form Pendaftaran</span>
                    <ArrowRight className="w-4 h-4 text-emerald-300 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </ScrollReveal>

            {/* 3 LIQUID GLASS SOP CARDS WITH INTERACTIVE HOVER SHEEN & 3D RENDERS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-8">
              
              {/* Card 1: Pemberitahuan Rencana Uji (Lampiran 1) */}
              <ScrollReveal direction="up" delay={100} className="h-full">
                <div className="relative group overflow-hidden rounded-2xl sm:rounded-3xl p-5 sm:p-7 bg-white/90 hover:bg-white backdrop-blur-2xl border border-white hover:border-emerald-500/60 shadow-[0_12px_35px_rgba(6,78,59,0.06),inset_0_1px_2px_rgba(255,255,255,1)] hover:-translate-y-2 transition-all duration-400 flex flex-col justify-between h-full">
                  {/* Top Specular Glare */}
                  <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-white/80 via-white/30 to-transparent pointer-events-none rounded-t-3xl" />
                  {/* Liquid Light Sweep on Hover */}
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-emerald-100/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />

                  <div className="space-y-4 relative z-10">
                    {/* 3D Visual Asset */}
                    <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden border border-emerald-100 bg-slate-100 shadow-inner group-hover:shadow-md transition-shadow">
                      <img 
                        src="/images/sop_layanan1_3d.jpg" 
                        alt="Ilustrasi 3D Uji Rencana Benih Hortikultura" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <span className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-emerald-950/85 backdrop-blur-md text-[10px] font-bold text-emerald-300 border border-emerald-400/40 shadow-xs flex items-center gap-1.5">
                        <Sprout className="w-3 h-3 text-emerald-400" />
                        <span>3D Render Uji Lapangan</span>
                      </span>
                    </div>

                    {/* Top Bar with Clean Label & Number */}
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100/90 text-emerald-800 flex items-center justify-center font-bold shadow-xs group-hover:scale-110 transition-transform duration-300 border border-emerald-200">
                        <Sprout className="w-5 h-5 text-emerald-700" />
                      </div>
                      <span className="font-mono text-xs font-black uppercase text-emerald-800 tracking-wider bg-emerald-50/90 px-2.5 py-1 rounded-lg border border-emerald-200">
                        Format Lampiran 1
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] font-black tracking-widest text-emerald-800 uppercase block">
                        Tahapan SOP 01
                      </span>
                      <h3 className="font-heading font-extrabold text-lg sm:text-xl text-slate-900 mt-1">
                        1. Pemberitahuan Rencana Uji
                      </h3>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      Diajukan pemohon sebelum pengujian lapangan. Diverifikasi oleh Direktorat Perbenihan Hortikultura.
                    </p>

                    {/* Rincian Verifikasi */}
                    <div className="pt-3 border-t border-slate-200/80 space-y-2 text-xs text-slate-700">
                      <div className="flex items-start space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>Verifikasi proposal & kelayakan kebun uji</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>Penerbitan surat balasan respon uji resmi</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-5 mt-4 border-t border-slate-200/80 relative z-10">
                    <span className="text-[11px] font-bold text-emerald-800 flex items-center space-x-1.5 group-hover:translate-x-1 transition-transform">
                      <span>Pra-Pengujian Lapangan</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </ScrollReveal>

              {/* Card 2: Permohonan Sidang TP2VH (Lampiran 2.a) */}
              <ScrollReveal direction="up" delay={250} className="h-full">
                <div className="relative group overflow-hidden rounded-2xl sm:rounded-3xl p-5 sm:p-7 bg-white/90 hover:bg-white backdrop-blur-2xl border border-white hover:border-blue-500/60 shadow-[0_12px_35px_rgba(30,58,138,0.06),inset_0_1px_2px_rgba(255,255,255,1)] hover:-translate-y-2 transition-all duration-400 flex flex-col justify-between h-full">
                  {/* Top Specular Glare */}
                  <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-white/80 via-white/30 to-transparent pointer-events-none rounded-t-3xl" />
                  {/* Liquid Light Sweep on Hover */}
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-blue-100/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />

                  <div className="space-y-4 relative z-10">
                    {/* 3D Visual Asset */}
                    <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden border border-blue-100 bg-slate-100 shadow-inner group-hover:shadow-md transition-shadow">
                      <img 
                        src="/images/sop_layanan2_3d.jpg" 
                        alt="Ilustrasi 3D Sidang TP2VH & Naskah Ilmiah" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <span className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-blue-950/85 backdrop-blur-md text-[10px] font-bold text-blue-300 border border-blue-400/40 shadow-xs flex items-center gap-1.5">
                        <Award className="w-3 h-3 text-blue-400" />
                        <span>3D Evaluasi Sidang Pleno</span>
                      </span>
                    </div>

                    {/* Top Bar with Clean Label & Number */}
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-blue-100/90 text-blue-800 flex items-center justify-center font-bold shadow-xs group-hover:scale-110 transition-transform duration-300 border border-blue-200">
                        <Award className="w-5 h-5 text-blue-700" />
                      </div>
                      <span className="font-mono text-xs font-black uppercase text-blue-800 tracking-wider bg-blue-50/90 px-2.5 py-1 rounded-lg border border-blue-200">
                        Format Lampiran 2.a
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] font-black tracking-widest text-blue-800 uppercase block">
                        Tahapan SOP 02
                      </span>
                      <h3 className="font-heading font-extrabold text-lg sm:text-xl text-slate-900 mt-1">
                        2. Permohonan Sidang TP2VH
                      </h3>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      Penilaian naskah hasil pengujian kebenaran dan keunggulan oleh Tim Penilai Pelepasan Varietas.
                    </p>

                    {/* Rincian Verifikasi */}
                    <div className="pt-3 border-t border-slate-200/80 space-y-2 text-xs text-slate-700">
                      <div className="flex items-start space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                        <span>Evaluasi naskah hasil uji oleh tim pakar</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                        <span>Sidang pleno pelepasan varietas hortikultura</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-5 mt-4 border-t border-slate-200/80 relative z-10">
                    <span className="text-[11px] font-bold text-blue-800 flex items-center space-x-1.5 group-hover:translate-x-1 transition-transform">
                      <span>Evaluasi Ilmiah & Pleno</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </ScrollReveal>

              {/* Card 3: Masa Sanggah Publik 30 Hari (Pasal 16) */}
              <ScrollReveal direction="up" delay={400} className="h-full">
                <div className="relative group overflow-hidden rounded-2xl sm:rounded-3xl p-5 sm:p-7 bg-white/90 hover:bg-white backdrop-blur-2xl border border-white hover:border-amber-500/60 shadow-[0_12px_35px_rgba(217,119,6,0.06),inset_0_1px_2px_rgba(255,255,255,1)] hover:-translate-y-2 transition-all duration-400 flex flex-col justify-between h-full">
                  {/* Top Specular Glare */}
                  <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-white/80 via-white/30 to-transparent pointer-events-none rounded-t-3xl" />
                  {/* Liquid Light Sweep on Hover */}
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-amber-100/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />

                  <div className="space-y-4 relative z-10">
                    {/* 3D Visual Asset */}
                    <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden border border-amber-100 bg-slate-100 shadow-inner group-hover:shadow-md transition-shadow">
                      <img 
                        src="/images/sop_layanan3_3d.jpg" 
                        alt="Ilustrasi 3D Masa Sanggah 30 Hari & Perlindungan Hak" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <span className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-amber-950/85 backdrop-blur-md text-[10px] font-bold text-amber-300 border border-amber-400/40 shadow-xs flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-amber-400" />
                        <span>3D Transparansi 30 Hari</span>
                      </span>
                    </div>

                    {/* Top Bar with Clean Label & Number */}
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-amber-100/90 text-amber-900 flex items-center justify-center font-bold shadow-xs group-hover:scale-110 transition-transform duration-300 border border-amber-200">
                        <Clock className="w-5 h-5 text-amber-700" />
                      </div>
                      <span className="font-mono text-xs font-black uppercase text-amber-900 tracking-wider bg-amber-50/90 px-2.5 py-1 rounded-lg border border-amber-200">
                        Pasal 16 Permentan 24/2025
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] font-black tracking-widest text-amber-900 uppercase block">
                        Tahapan SOP 03
                      </span>
                      <h3 className="font-heading font-extrabold text-lg sm:text-xl text-slate-900 mt-1">
                        3. Masa Sanggah Publik 30 Hari
                      </h3>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      Publikasi deskripsi morfologi secara terbuka untuk menjamin hak kepemilikan dan integritas pemuliaan.
                    </p>

                    {/* Rincian Verifikasi */}
                    <div className="pt-3 border-t border-slate-200/80 space-y-2 text-xs text-slate-700">
                      <div className="flex items-start space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <span>Publikasi 30 hari kalender deskripsi tanaman</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <span>Jaminan kepemilikan sebelum terbit Tanda Daftar</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-5 mt-4 border-t border-slate-200/80 relative z-10">
                    <span className="text-[11px] font-bold text-amber-900 flex items-center space-x-1.5 group-hover:translate-x-1 transition-transform">
                      <span>Kepastian Hukum Publik</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </ScrollReveal>
            </div>

            {/* High-Impact LIQUID GLASS CTA BANNER */}
            <ScrollReveal direction="up" delay={200}>
              <div className="mt-8 sm:mt-10 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-slate-950/95 via-[#03241b]/95 to-slate-950/95 backdrop-blur-2xl text-white p-6 sm:p-10 border border-emerald-500/40 shadow-[0_20px_50px_rgba(6,78,59,0.35),inset_0_1px_1px_rgba(255,255,255,0.3)] flex flex-col md:flex-row items-start md:items-center justify-between gap-5 sm:gap-6 relative overflow-hidden">
                <div className="space-y-2 z-10 max-w-2xl">
                  <div className="text-xs font-black uppercase tracking-widest text-kementan-gold-400 flex items-center space-x-2">
                    <FileCheck className="w-3.5 h-3.5 text-kementan-gold-400" />
                    <span>Modul Resmi Permentan 24/2025</span>
                  </div>
                  <h3 className="font-heading font-black text-xl sm:text-3xl text-white tracking-tight">
                    Masuk ke Modul Pendaftaran Varietas Online
                  </h3>
                  <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                    Ajukan dokumen Lampiran 1, ikuti penjadwalan sidang TP2VH, dan pantau masa sanggah publik secara transparan di sistem resmi Kementerian Pertanian RI.
                  </p>
                </div>

                <div className="z-10 shrink-0 w-full md:w-auto">
                  <Link
                    href="/dashboard/pendaftaran-varietas"
                    className="relative group overflow-hidden w-full md:w-auto inline-flex items-center justify-center space-x-2 sm:space-x-3 px-6 sm:px-8 py-3.5 sm:py-4 rounded-full bg-gradient-to-r from-kementan-gold-500 via-amber-500 to-kementan-gold-600 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider shadow-[0_6px_24px_rgba(217,119,6,0.4),inset_0_1px_1px_rgba(255,255,255,0.8)] border border-amber-300/60 hover:scale-105 active:scale-95 transition-all duration-300 text-center"
                  >
                    <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />
                    <span>Masuk ke Modul Pendaftaran Varietas Online</span>
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-slate-950 group-hover:translate-x-1 transition-transform shrink-0" />
                  </Link>
                </div>

                {/* Subtle background glow */}
                <div className="absolute right-0 bottom-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
              </div>
            </ScrollReveal>

          </div>
        </section>
        {/* =========================================================================
            SECTION: LACAK STATUS PERMOHONAN BERBASIS TIKET
        ========================================================================= */}
        <section id="tracking" className="scroll-mt-24 py-16 md:py-20 bg-emerald-50/20 backdrop-blur-md transition-colors relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-8">
            
            {/* Header Section Tegas */}
            <ScrollReveal direction="up" delay={0}>
              <div className="max-w-3xl mb-8">
                <span className="text-xs font-black text-emerald-800 uppercase tracking-widest block mb-1">
                  TRANSPARANSI PROSES EVALUASI
                </span>
                <h2 className="font-heading font-black text-2xl sm:text-3xl text-slate-900 tracking-tight">
                  Lacak Status Permohonan Varietas Tanaman
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  Gunakan nomor registrasi permohonan untuk memeriksa riwayat verifikasi berkas, status sidang TP2VH, dan masa sanggah publik.
                </p>
              </div>
            </ScrollReveal>

            {/* Kotak Pencarian LIQUID GLASS */}
            <ScrollReveal direction="up" delay={150}>
              <div className="relative overflow-hidden bg-white/90 hover:bg-white backdrop-blur-2xl border border-white p-4 sm:p-7 rounded-2xl sm:rounded-3xl mb-8 shadow-[0_12px_36px_rgba(6,78,59,0.07),inset_0_1px_2px_rgba(255,255,255,1)] transition-all duration-300">
                <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-white/80 to-transparent pointer-events-none rounded-t-2xl sm:rounded-t-3xl" />
                
                <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 relative z-10">
                  <div className="relative flex-grow">
                    <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchCode}
                      onChange={(e) => setSearchCode(e.target.value)}
                      placeholder="Masukkan Nomor Registrasi (Contoh: VAR-2026-HORTI-0842)"
                      className="w-full pl-11 pr-4 py-2.5 sm:py-3 bg-slate-50/80 border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 rounded-full focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all shadow-inner"
                    />
                  </div>
                  <button
                    type="submit"
                    className="relative group overflow-hidden w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-emerald-800 via-emerald-700 to-emerald-800 text-white font-bold text-xs uppercase tracking-wider rounded-full shadow-[0_4px_16px_rgba(6,78,59,0.3),inset_0_1px_1px_rgba(255,255,255,0.5)] border border-emerald-400/30 hover:scale-105 active:scale-95 transition-all shrink-0 flex items-center justify-center space-x-2"
                  >
                    <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />
                    <Search className="w-3.5 h-3.5 text-emerald-200 group-hover:scale-110 transition-transform" />
                    <span>Cari Data</span>
                  </button>
                </form>

                {/* Sampel Nomor Tiket */}
                <div className="flex flex-wrap items-center gap-2 mt-4 text-xs text-slate-600 pt-3 border-t border-slate-200/70 relative z-10">
                  <span className="font-bold text-slate-800">Contoh Registrasi:</span>
                  <button 
                    type="button"
                    onClick={() => selectSample('VAR-2026-HORTI-0842')}
                    className="px-3 py-1 bg-white hover:bg-emerald-50 hover:text-emerald-900 border border-slate-200 hover:border-emerald-300 font-mono text-[11px] rounded-lg text-slate-800 transition-colors shadow-2xs"
                  >
                    VAR-2026-HORTI-0842 (Masa Sanggah)
                  </button>
                  <button 
                    type="button"
                    onClick={() => selectSample('VAR-2026-HORTI-0915')}
                    className="px-3 py-1 bg-white hover:bg-blue-50 hover:text-blue-900 border border-slate-200 hover:border-blue-300 font-mono text-[11px] rounded-lg text-slate-800 transition-colors shadow-2xs"
                  >
                    VAR-2026-HORTI-0915 (Sidang TP2VH)
                  </button>
                  <button 
                    type="button"
                    onClick={() => selectSample('VAR-2026-HORTI-0720')}
                    className="px-3 py-1 bg-white hover:bg-emerald-50 hover:text-emerald-900 border border-slate-200 hover:border-emerald-300 font-mono text-[11px] rounded-lg text-slate-800 transition-colors shadow-2xs"
                  >
                    VAR-2026-HORTI-0720 (Resmi Terdaftar)
                  </button>
                </div>

                {searchError && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 text-red-800 text-xs flex items-center space-x-2 rounded-2xl relative z-10">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                    <span>Nomor registrasi tidak ditemukan. Mohon periksa kembali nomor permohonan Anda.</span>
                  </div>
                )}
              </div>
            </ScrollReveal>

            {/* Hasil Pelacakan LIQUID GLASS CARD */}
            {trackedApplication && (
              <ScrollReveal direction="up" delay={200}>
                <div className="relative overflow-hidden bg-white/95 backdrop-blur-2xl border border-white rounded-3xl p-6 sm:p-8 space-y-6 shadow-[0_15px_40px_rgba(6,78,59,0.08),inset_0_1px_2px_rgba(255,255,255,1)] transition-colors">
                  <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-white/80 to-transparent pointer-events-none rounded-t-3xl" />
                  
                  {/* Header Hasil */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between pb-4 border-b border-slate-100 gap-3 relative z-10">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                          {trackedApplication.trackingCode}
                        </span>
                        <span className="text-[11px] font-bold uppercase px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
                          {trackedApplication.cropType}
                        </span>
                      </div>

                      <h3 className="font-heading font-extrabold text-xl text-slate-900 mt-2">
                        Varietas: {trackedApplication.proposedVarietyName}
                      </h3>
                      <p className="text-xs text-slate-600">
                        Komoditas: <strong className="text-slate-800">{trackedApplication.commodityName}</strong> • Pemohon: <strong className="text-slate-800">{trackedApplication.applicantName}</strong>
                      </p>
                    </div>

                    <div className="sm:text-right">
                      <span className="text-[11px] text-slate-500 uppercase font-semibold block">Tahapan Terkini</span>
                      <span className="inline-block mt-0.5 text-xs font-bold px-3 py-1.5 bg-gradient-to-r from-emerald-800 to-emerald-900 text-white rounded-lg shadow-sm border border-emerald-500/30">
                        {trackedApplication.statusText}
                      </span>
                    </div>
                  </div>

                  {/* Workflow Stepper: LIQUID GLASS STEPPER CARDS */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 relative z-10">
                    
                    {/* Step 1 */}
                    <div className={`p-4 rounded-2xl border transition-all ${
                      ['layanan_1_rencana_uji', 'layanan_2_permohonan_sidang', 'layanan_3_masa_sanggah', 'layanan_4_selesai_terdaftar'].includes(trackedApplication.currentStage)
                        ? 'border-emerald-500/60 bg-emerald-50/90 shadow-[0_4px_16px_rgba(16,185,129,0.15),inset_0_1px_1px_rgba(255,255,255,0.9)]'
                        : 'border-slate-200/80 bg-slate-50/70 opacity-60'
                    }`}>
                      <span className="text-[10px] font-black text-emerald-800 uppercase block">1. Rencana Pengujian</span>
                      <strong className="text-xs text-slate-900 block mt-1">Format Lampiran 1</strong>
                      <div className="text-[11px] font-mono text-slate-600 mt-2">
                        {trackedApplication.testResponseLetterNo || 'Respon Uji Terbit'}
                      </div>
                    </div>

                    {/* Step 2 */}
                    <div className={`p-4 rounded-2xl border transition-all ${
                      ['layanan_2_permohonan_sidang', 'layanan_3_masa_sanggah', 'layanan_4_selesai_terdaftar'].includes(trackedApplication.currentStage)
                        ? 'border-emerald-500/60 bg-emerald-50/90 shadow-[0_4px_16px_rgba(16,185,129,0.15),inset_0_1px_1px_rgba(255,255,255,0.9)]'
                        : 'border-slate-200/80 bg-slate-50/70 opacity-60'
                    }`}>
                      <span className="text-[10px] font-black text-emerald-800 uppercase block">2. Sidang TP2VH</span>
                      <strong className="text-xs text-slate-900 block mt-1">Penilaian Naskah</strong>
                      <div className="text-[11px] text-slate-700 mt-2 font-medium">
                        {trackedApplication.tp2vhSessionStatus === 'lolos_disetujui' ? 'Lolos Sidang Pleno' : 'Menunggu Jadwal Sidang'}
                      </div>
                    </div>

                    {/* Step 3 */}
                    <div className={`p-4 rounded-2xl border transition-all ${
                      ['layanan_3_masa_sanggah', 'layanan_4_selesai_terdaftar'].includes(trackedApplication.currentStage)
                        ? 'border-amber-500/60 bg-amber-50/90 shadow-[0_4px_16px_rgba(245,158,11,0.15),inset_0_1px_1px_rgba(255,255,255,0.9)]'
                        : 'border-slate-200/80 bg-slate-50/70 opacity-60'
                    }`}>
                      <span className="text-[10px] font-black text-amber-900 uppercase block">3. Masa Sanggah</span>
                      <strong className="text-xs text-slate-900 block mt-1">Durasi 30 Hari Publik</strong>
                      <div className="text-[11px] font-bold text-amber-900 mt-2">
                        {trackedApplication.objectionDaysLeft !== undefined && trackedApplication.objectionDaysLeft > 0 
                          ? `Sisa ${trackedApplication.objectionDaysLeft} Hari` 
                          : (trackedApplication.currentStage === 'layanan_4_selesai_terdaftar' ? 'Selesai Tanpa Sanggahan' : 'Belum Dimulai')}
                      </div>
                    </div>

                    {/* Step 4 */}
                    <div className={`p-4 rounded-2xl border transition-all ${
                      trackedApplication.currentStage === 'layanan_4_selesai_terdaftar'
                        ? 'border-emerald-500/60 bg-emerald-50/90 shadow-[0_4px_16px_rgba(16,185,129,0.15),inset_0_1px_1px_rgba(255,255,255,0.9)]'
                        : 'border-slate-200/80 bg-slate-50/70 opacity-60'
                    }`}>
                      <span className="text-[10px] font-black text-emerald-800 uppercase block">4. Tanda Daftar</span>
                      <strong className="text-xs text-slate-900 block mt-1">Penerbitan SK PPVTPP</strong>
                      <div className="text-[11px] font-mono text-slate-700 mt-2">
                        {trackedApplication.registrationNumber || 'Menunggu Selesai Sanggah'}
                      </div>
                    </div>

                  </div>

                  {/* Ringkasan Naskah Ilmiah */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-700 space-y-1.5 relative z-10">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <span>Silsilah Pemuliaan: <strong className="text-slate-900">{trackedApplication.lineage}</strong></span>
                      <span>Tanggal Masuk Berkas: <strong className="text-slate-900">{trackedApplication.submissionDate}</strong></span>
                    </div>
                    {trackedApplication.tp2vhNotes && (
                      <div className="pt-2 border-t border-slate-200 text-slate-800">
                        <strong>Catatan Evaluasi Teknis Tim TP2VH:</strong> {trackedApplication.tp2vhNotes}
                      </div>
                    )}
                  </div>

                </div>
              </ScrollReveal>
            )}

          </div>
        </section>

        {/* =========================================================================
            SECTION: PORTAL MASA SANGGAH PUBLIK 30 HARI
        ========================================================================= */}
        <section id="masa-sanggah" className="scroll-mt-24 py-16 md:py-20 bg-white/40 backdrop-blur-md transition-colors relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-8">
            
            <ScrollReveal direction="up" delay={0}>
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                <div>
                  <span className="text-xs font-black text-amber-800 uppercase tracking-widest block mb-1">
                    PENEGAKAN HUKUM PASAL 16 PERMENTAN NO. 24 TAHUN 2025
                  </span>
                  <h2 className="font-heading font-black text-2xl sm:text-3xl text-slate-900 tracking-tight">
                    Masa Sanggah Publik (30 Hari Kalender)
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
                    Daftar calon varietas yang telah disetujui sidang TP2VH dan sedang menjalani masa uji publik selama 30 hari kalender sebelum penerbitan Surat Rekomendasi Pendaftaran resmi.
                  </p>
                </div>

                <div className="text-xs font-bold text-amber-900 bg-amber-100 border border-amber-300 px-3.5 py-1.5 rounded-md">
                  Status: Masa Sanggah Aktif
                </div>
              </div>
            </ScrollReveal>

            {/* Daftar Calon Varietas yang Sedang dalam Masa Sanggah (LIQUID GLASS CARDS) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(objectionVarieties.length > 0 
                ? objectionVarieties 
                : allApplications.filter(v => v.currentStage === 'layanan_3_masa_sanggah')
              ).map((item, idx) => (
                <ScrollReveal key={item.id} direction="up" delay={idx * 150} className="h-full">
                  <div className="relative group overflow-hidden bg-white/90 hover:bg-white backdrop-blur-2xl border border-white hover:border-amber-500/60 p-5 sm:p-7 rounded-2xl sm:rounded-3xl shadow-[0_12px_35px_rgba(217,119,6,0.06),inset_0_1px_2px_rgba(255,255,255,1)] hover:-translate-y-1.5 transition-all duration-300 h-full flex flex-col justify-between">
                    {/* Top Specular Glare */}
                    <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/80 to-transparent pointer-events-none rounded-t-2xl sm:rounded-t-3xl" />
                    {/* Hover light sheen sweep */}
                    <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-amber-100/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
                    
                    <div className="space-y-4 relative z-10">
                      {/* Baris Atas */}
                      <div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
                        <span className="font-mono text-[11px] sm:text-xs font-bold text-slate-800 bg-white px-2.5 py-1 rounded-md border border-slate-200 shadow-2xs">
                          {item.trackingCode}
                        </span>
                        <span className="text-[11px] sm:text-xs font-bold text-amber-900 bg-amber-100 border border-amber-300 px-2.5 py-1 rounded-md shadow-2xs">
                          Sisa: {item.objectionDaysLeft ?? 30} Hari Kalender
                        </span>
                      </div>

                      <div>
                        <span className="text-xs text-slate-500 block">Komoditas: {item.commodityName}</span>
                        <h3 className="font-heading font-extrabold text-base sm:text-lg text-slate-900 mt-0.5">
                          {item.proposedVarietyName}
                        </h3>
                        <p className="text-xs text-slate-600 mt-1">
                          Instansi Pemohon: <strong className="text-slate-800">{item.applicantName}</strong>
                        </p>
                      </div>

                      {/* Rincian Tanggal */}
                      <div className="p-3 sm:p-3.5 bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1.5 rounded-2xl shadow-inner">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Mulai Masa Sanggah:</span>
                          <strong>{item.objectionStartDate || '2026-09-01'}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Batas Akhir Sanggahan:</span>
                          <strong className="text-red-700">{item.objectionEndDate || '2026-10-01'}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Jumlah Sanggahan Terdaftar:</span>
                          <strong>{item.totalObjectionsCount || 0} berkas</strong>
                        </div>
                      </div>
                    </div>

                    {/* Aksi Resmi: LIQUID GLASS BUTTONS */}
                    <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-2.5 relative z-10">
                      <button 
                        type="button"
                        onClick={() => setSelectedManuscriptVariety(item)}
                        className="relative group/btn overflow-hidden w-full sm:w-auto px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 hover:border-emerald-500/40 text-slate-800 font-bold text-xs rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.9)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center space-x-1.5 text-center"
                      >
                        <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 pointer-events-none" />
                        <FileText className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                        <span>Unduh Ringkasan Morfologi (PDF)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setObjectionModalVariety(item)}
                        className="relative group/btn overflow-hidden w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-kementan-forest-900 via-emerald-800 to-kementan-forest-900 text-white font-bold text-xs rounded-xl shadow-[0_4px_14px_rgba(6,78,59,0.3),inset_0_1px_1px_rgba(255,255,255,0.5)] border border-emerald-400/40 hover:scale-105 active:scale-95 transition-all flex items-center justify-center space-x-1.5 text-center"
                      >
                        <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />
                        <Scale className="w-3.5 h-3.5 text-emerald-200 shrink-0" />
                        <span>Ajukan Sanggahan Resmi</span>
                      </button>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>

          </div>
        </section>
        {/* =========================================================================
            SECTION: KATALOG VARIETAS TERDAFTAR RESMI
        ========================================================================= */}
        <section id="katalog" className="scroll-mt-24 py-16 md:py-20 bg-emerald-50/20 backdrop-blur-md transition-colors relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-8">
            
            <ScrollReveal direction="up" delay={0}>
              <div className="max-w-3xl mb-8">
                <span className="text-xs font-black text-emerald-800 uppercase tracking-widest block mb-1">
                  DATABASE VARIETAS UNGGUL
                </span>
                <h2 className="font-heading font-black text-2xl sm:text-3xl text-slate-900 tracking-tight">
                  Katalog Varietas Terdaftar di Kementerian Pertanian
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  Data varietas tanaman hortikultura yang telah lulus sidang TP2VH, melewati masa sanggah publik, dan resmi memiliki Tanda Daftar PPVTPP.
                </p>

                {/* Filter Tabs Rounded */}
                <div className="flex items-center gap-1.5 sm:gap-2 mt-6 overflow-x-auto pb-2 scrollbar-none">
                  {(['semua', 'sayuran', 'buah', 'hias', 'obat'] as const).map(tab => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveTabCatalogue(tab)}
                      className={`relative group overflow-hidden whitespace-nowrap px-3.5 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-xs font-bold uppercase rounded-xl transition-all shrink-0 ${
                        activeTabCatalogue === tab
                          ? 'bg-gradient-to-r from-emerald-800 to-teal-800 text-white shadow-md border border-emerald-500/40'
                          : 'bg-white hover:bg-emerald-50 text-slate-700 border border-slate-200 hover:border-emerald-300 shadow-2xs'
                      }`}
                    >
                      <span className="relative z-10">{tab === 'semua' ? 'Semua Komoditas' : `Tanaman ${tab}`}</span>
                    </button>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            {/* Kartu Katalog: LIQUID GLASS CARDS WITH HOVER ANIMATION */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
              {(catalogVarieties.length > 0
                ? catalogVarieties
                : allApplications.filter(item => item.currentStage === 'layanan_4_selesai_terdaftar' || (item.registrationNumber && item.registrationNumber.trim() !== ''))
              )
                .filter(item => activeTabCatalogue === 'semua' || item.cropType === activeTabCatalogue)
                .map((item, idx) => (
                  <ScrollReveal key={item.id} direction="up" delay={(idx % 6) * 100} className="h-full">
                    <div className="relative group overflow-hidden border border-white hover:border-emerald-500/60 bg-white/90 hover:bg-white backdrop-blur-2xl p-5 sm:p-6 rounded-2xl sm:rounded-3xl flex flex-col justify-between shadow-[0_10px_30px_rgba(6,78,59,0.06),inset_0_1px_2px_rgba(255,255,255,1)] hover:-translate-y-2 transition-all duration-300 h-full">
                      {/* Top Specular Glare */}
                      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/80 to-transparent pointer-events-none rounded-t-2xl sm:rounded-t-3xl" />
                      {/* Hover light sheen sweep */}
                      <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-emerald-100/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />

                      <div className="relative z-10">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                          <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                            {item.cropType}
                          </span>
                          <span className="text-[11px] font-mono text-slate-400">
                            {item.submissionDate}
                          </span>
                        </div>

                        <h4 className="font-heading font-extrabold text-base text-slate-900 group-hover:text-emerald-950 transition-colors">
                          {item.proposedVarietyName}
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">Komoditas: <strong className="text-slate-800">{item.commodityName}</strong></p>
                        
                        <div className="my-3 p-3 bg-slate-50 border border-slate-100 rounded-2xl text-[11px] text-slate-600 space-y-1 shadow-inner">
                          <div>Pemohon: <strong className="text-slate-800">{item.applicantName}</strong></div>
                          <div>Silsilah: <span>{item.lineage}</span></div>
                          {item.registrationNumber && (
                            <div className="text-emerald-900 font-mono font-bold mt-1.5 pt-1 border-t border-slate-200">
                              No. SK: {item.registrationNumber}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between relative z-10">
                        <button
                          type="button"
                          onClick={() => setSelectedVerifyVariety(item)}
                          className="text-[11px] text-emerald-800 hover:text-emerald-950 font-semibold flex items-center space-x-1.5 group/v cursor-pointer transition-colors"
                        >
                          <QrCode className="w-3.5 h-3.5 text-emerald-700 group-hover/v:scale-110 transition-transform" />
                          <span>Verifikasi Digital</span>
                        </button>
                        <button 
                          type="button"
                          onClick={() => setSelectedManuscriptVariety(item)}
                          className="relative group/btn overflow-hidden px-3.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold text-xs flex items-center space-x-1.5 shadow-[0_2px_8px_rgba(16,185,129,0.1),inset_0_1px_0_rgba(255,255,255,0.9)] hover:scale-105 active:scale-95 transition-all"
                        >
                          <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 pointer-events-none" />
                          <span>Lihat Naskah</span>
                          <ArrowRight className="w-3 h-3 text-emerald-700 group-hover/btn:translate-x-0.5 transition-transform" />
                        </button>
                      </div>
                    </div>
                  </ScrollReveal>
                ))}
            </div>

          </div>
        </section>

        {/* =========================================================================
            SECTION: 3 MODUL OPERASIONAL SISTEM (LIQUID GLASS CARDS)
        ========================================================================= */}
        <section className="py-16 md:py-20 bg-white/40 backdrop-blur-md transition-colors relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-8">
            
            <ScrollReveal direction="up" delay={0}>
              <div className="max-w-3xl mb-8">
                <span className="text-xs font-black text-emerald-800 uppercase tracking-widest block mb-1">
                  ARSITEKTUR TERPADU DIREKTORAT PERBENIHAN
                </span>
                <h2 className="font-heading font-black text-2xl sm:text-3xl text-slate-900 tracking-tight">
                  3 Modul Operasional SIM-BENIH HORTI
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  Integrasi pelaporan data penangkar benih wilayah, neraca stok bulanan, dan registrasi varietas nasional.
                </p>
              </div>
            </ScrollReveal>

            {/* 3 Modul: LIQUID GLASS CARDS WITH 3D RENDERS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Modul A */}
              <ScrollReveal direction="up" delay={100} className="h-full">
                <div className="relative group overflow-hidden bg-white/90 hover:bg-white backdrop-blur-2xl border border-white hover:border-emerald-500/60 p-5 sm:p-7 rounded-2xl sm:rounded-3xl flex flex-col justify-between shadow-[0_12px_35px_rgba(6,78,59,0.06),inset_0_1px_2px_rgba(255,255,255,1)] hover:-translate-y-2 transition-all duration-300 h-full">
                  <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/80 to-transparent pointer-events-none rounded-t-2xl sm:rounded-t-3xl" />
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-emerald-100/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />

                  <div className="space-y-4 relative z-10">
                    {/* 3D Visual Asset */}
                    <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden border border-emerald-100 bg-slate-100 shadow-inner group-hover:shadow-md transition-shadow">
                      <img 
                        src="/images/modul_a_produsen_3d.jpg" 
                        alt="Ilustrasi 3D Jaringan Produsen & Pengedar 38 BPSB" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <span className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-emerald-950/85 backdrop-blur-md text-[10px] font-bold text-emerald-300 border border-emerald-400/40 shadow-xs flex items-center gap-1.5">
                        <Building2 className="w-3 h-3 text-emerald-400" />
                        <span>3D Jaringan 38 BPSB</span>
                      </span>
                    </div>

                    <div className="w-10 h-10 rounded-xl bg-emerald-100/90 border border-emerald-200 text-slate-800 flex items-center justify-center font-bold shadow-xs group-hover:scale-110 transition-transform">
                      <Building2 className="w-5 h-5 text-emerald-800" />
                    </div>
                    <h3 className="font-heading font-bold text-base text-slate-900 group-hover:text-emerald-950 transition-colors">
                      Modul A: Data Produsen dan Pengedar
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Pengawasan legalitas produsen benih hortikultura berizin di 38 BPSB Provinsi, nomor sertifikat kompetensi, luas lahan (Ha), dan kapasitas tahunan.
                    </p>
                  </div>
                  <div className="pt-4 border-t border-slate-200 mt-4 relative z-10">
                    <Link
                      href="/dashboard/produsen-pengedar"
                      className="relative group/btn overflow-hidden inline-flex items-center justify-center w-full sm:w-auto space-x-2 px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300/80 text-emerald-900 font-bold text-xs shadow-2xs hover:scale-105 active:scale-95 transition-all"
                    >
                      <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 pointer-events-none" />
                      <span>Masuk ke Data Produsen</span>
                      <ArrowRight className="w-3.5 h-3.5 text-emerald-700 group-hover/btn:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>
              </ScrollReveal>

              {/* Modul B */}
              <ScrollReveal direction="up" delay={250} className="h-full">
                <div className="relative group overflow-hidden bg-white/90 hover:bg-white backdrop-blur-2xl border border-white hover:border-emerald-500/60 p-5 sm:p-7 rounded-2xl sm:rounded-3xl flex flex-col justify-between shadow-[0_12px_35px_rgba(6,78,59,0.06),inset_0_1px_2px_rgba(255,255,255,1)] hover:-translate-y-2 transition-all duration-300 h-full">
                  <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/80 to-transparent pointer-events-none rounded-t-2xl sm:rounded-t-3xl" />
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-emerald-100/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />

                  <div className="space-y-4 relative z-10">
                    {/* 3D Visual Asset */}
                    <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden border border-teal-100 bg-slate-100 shadow-inner group-hover:shadow-md transition-shadow">
                      <img 
                        src="/images/modul_b_neraca_3d.jpg" 
                        alt="Ilustrasi 3D Neraca Stok Produksi Benih Bulanan" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <span className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-teal-950/85 backdrop-blur-md text-[10px] font-bold text-teal-300 border border-teal-400/40 shadow-xs flex items-center gap-1.5">
                        <Sprout className="w-3 h-3 text-teal-400" />
                        <span>3D Neraca Stok 4 Komoditas</span>
                      </span>
                    </div>

                    <div className="w-10 h-10 rounded-xl bg-teal-100/90 border border-teal-200 text-slate-800 flex items-center justify-center font-bold shadow-xs group-hover:scale-110 transition-transform">
                      <Sprout className="w-5 h-5 text-teal-800" />
                    </div>
                    <h3 className="font-heading font-bold text-base text-slate-900 group-hover:text-emerald-950 transition-colors">
                      Modul B: Data Produksi Benih Bulanan
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Kalkulator neraca stok benih otomatis untuk 4 kelompok tanaman (Sayuran, Buah, Hias, Biofarmaka) dengan perhitungan stok lalu + produksi - penyaluran.
                    </p>
                  </div>
                  <div className="pt-4 border-t border-slate-200 mt-4 relative z-10">
                    <Link
                      href="/dashboard/produksi-benih"
                      className="relative group/btn overflow-hidden inline-flex items-center justify-center w-full sm:w-auto space-x-2 px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300/80 text-emerald-900 font-bold text-xs shadow-2xs hover:scale-105 active:scale-95 transition-all"
                    >
                      <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 pointer-events-none" />
                      <span>Masuk ke Data Produksi</span>
                      <ArrowRight className="w-3.5 h-3.5 text-emerald-700 group-hover/btn:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>
              </ScrollReveal>

              {/* Modul C */}
              <ScrollReveal direction="up" delay={400} className="h-full">
                <div className="relative group overflow-hidden bg-white/90 hover:bg-white backdrop-blur-2xl border border-white hover:border-emerald-500/60 p-5 sm:p-7 rounded-2xl sm:rounded-3xl flex flex-col justify-between shadow-[0_12px_35px_rgba(6,78,59,0.06),inset_0_1px_2px_rgba(255,255,255,1)] hover:-translate-y-2 transition-all duration-300 h-full">
                  <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/80 to-transparent pointer-events-none rounded-t-2xl sm:rounded-t-3xl" />
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-emerald-100/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />

                  <div className="space-y-4 relative z-10">
                    {/* 3D Visual Asset */}
                    <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden border border-amber-100 bg-slate-100 shadow-inner group-hover:shadow-md transition-shadow">
                      <img 
                        src="/images/modul_c_varietas_3d.jpg" 
                        alt="Ilustrasi 3D Registrasi & Pelepasan Varietas Permentan 24/2025" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <span className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-amber-950/85 backdrop-blur-md text-[10px] font-bold text-amber-300 border border-amber-400/40 shadow-xs flex items-center gap-1.5">
                        <FileCheck className="w-3 h-3 text-amber-400" />
                        <span>3D SK & Tanda Daftar</span>
                      </span>
                    </div>

                    <div className="w-10 h-10 rounded-xl bg-amber-100/90 border border-amber-200 text-slate-800 flex items-center justify-center font-bold shadow-xs group-hover:scale-110 transition-transform">
                      <FileCheck className="w-5 h-5 text-amber-800" />
                    </div>
                    <h3 className="font-heading font-bold text-base text-slate-900 group-hover:text-emerald-950 transition-colors">
                      Modul C: Pendaftaran Varietas Tanaman Hortikultura
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Digitalisasi alur 4 layanan terpadu: Pemberitahuan Rencana Uji (Lampiran 1), Sidang TP2VH (Lampiran 2.a), Publikasi Masa Sanggah 30 Hari, dan Tanda Daftar.
                    </p>
                  </div>
                  <div className="pt-4 border-t border-slate-200 mt-4 relative z-10">
                    <Link
                      href="/dashboard/pendaftaran-varietas"
                      className="relative group/btn overflow-hidden inline-flex items-center justify-center w-full sm:w-auto space-x-2 px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300/80 text-emerald-900 font-bold text-xs shadow-2xs hover:scale-105 active:scale-95 transition-all"
                    >
                      <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 pointer-events-none" />
                      <span>Masuk ke Pendaftaran Varietas</span>
                      <ArrowRight className="w-3.5 h-3.5 text-emerald-700 group-hover/btn:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>
              </ScrollReveal>

            </div>
          </div>
        </section>

      </main>

      {/* =========================================================================
          MODAL 1: VERIFIKASI DIGITAL TANDA DAFTAR PPVTPP RESMI KEMENTAN RI
      ========================================================================= */}
      {selectedVerifyVariety && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn">
          <div className="relative bg-white/95 backdrop-blur-2xl rounded-3xl shadow-[0_25px_60px_rgba(6,78,59,0.3)] max-w-xl w-full border border-white overflow-hidden p-6 sm:p-8 animate-scaleUp">
            {/* Ambient top glow */}
            <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-emerald-500/15 to-transparent pointer-events-none" />

            <div className="flex items-center justify-between pb-4 border-b border-slate-200 relative z-10">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-800 shadow-xs">
                  <ShieldCheck className="w-6 h-6 text-emerald-700" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 block">
                    KEMENTERIAN PERTANIAN REPUBLIK INDONESIA
                  </span>
                  <h3 className="font-heading font-black text-lg text-slate-900">
                    Verifikasi Digital Tanda Daftar PPVTPP
                  </h3>
                </div>
              </div>
              <button 
                onClick={() => setSelectedVerifyVariety(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-5 space-y-4 text-xs relative z-10">
              {/* Status Banner */}
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 flex items-center justify-between shadow-2xs">
                <div className="flex items-center space-x-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
                  <div>
                    <span className="font-bold text-emerald-950 block">STATUS: RESMI TERDAFTAR & SAH</span>
                    <span className="text-[11px] text-emerald-800">Lulus Uji Kebenaran & Keunggulan TP2VH • Bebas Sanggahan</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold bg-white text-emerald-900 border border-emerald-200 px-2.5 py-1 rounded-lg">
                  ISO/IEC 27001
                </span>
              </div>

              {/* Data Table */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5 shadow-inner">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-slate-500">Nomor Registrasi / Kode Tiket:</span>
                  <span className="font-mono font-bold text-slate-900">{selectedVerifyVariety.trackingCode}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-slate-500">Nomor SK Tanda Daftar:</span>
                  <span className="font-mono font-bold text-emerald-900 bg-emerald-100/60 px-2 py-0.5 rounded">
                    {selectedVerifyVariety.registrationNumber || '089/Kpts/PV.240/D/VIII/2026'}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-slate-500">Nama Resmi Varietas:</span>
                  <span className="font-bold text-slate-900 text-sm uppercase">{selectedVerifyVariety.proposedVarietyName}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-slate-500">Komoditas & Jenis:</span>
                  <span className="font-semibold text-slate-800 capitalize">
                    {selectedVerifyVariety.commodityName} ({selectedVerifyVariety.cropType})
                  </span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-slate-500">Pemilik Hak / Pemohon:</span>
                  <span className="font-bold text-slate-900">{selectedVerifyVariety.applicantName}</span>
                </div>
                <div className="flex flex-col pt-1">
                  <span className="text-slate-500 mb-0.5">Silsilah Pemuliaan:</span>
                  <span className="text-slate-800 italic">{selectedVerifyVariety.lineage}</span>
                </div>
              </div>

              {/* Digital Hologram & Hash */}
              <div className="p-3 bg-gradient-to-r from-emerald-900 to-teal-950 text-white rounded-2xl flex items-center justify-between text-[11px] shadow-sm">
                <div className="flex items-center space-x-2">
                  <QrCode className="w-8 h-8 text-emerald-300" />
                  <div>
                    <span className="font-bold block text-emerald-200">Tanda Tangan Elektronik Balai Sertifikasi</span>
                    <span className="font-mono text-[9px] text-slate-300">SHA256: 9a7f...e3b4 (Kementan Secure Verification)</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-1 bg-emerald-800/80 rounded border border-emerald-400/40">
                  VALID
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end space-x-3 relative z-10">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 transition-colors"
              >
                <Printer className="w-4 h-4 text-slate-500" />
                <span>Cetak Lembar Verifikasi</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedVerifyVariety(null)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-800 to-teal-800 text-white font-bold shadow-md hover:scale-105 active:scale-95 transition-all"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: NASKAH ILMIAH & DESKRIPSI MORFOLOGI HASIL SIDANG TP2VH
      ========================================================================= */}
      {selectedManuscriptVariety && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn">
          <div className="relative bg-white/95 backdrop-blur-2xl rounded-3xl shadow-[0_25px_60px_rgba(6,78,59,0.3)] max-w-2xl w-full border border-white max-h-[90vh] overflow-y-auto p-6 sm:p-8 animate-scaleUp">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 shadow-xs">
                  <FileText className="w-6 h-6 text-amber-700" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 block">
                    TIM PENILAI PELEPASAN VARIETAS HORTIKULTURA (TP2VH)
                  </span>
                  <h3 className="font-heading font-black text-lg text-slate-900">
                    Naskah Hasil Uji Kebenaran & Keunggulan
                  </h3>
                </div>
              </div>
              <button 
                onClick={() => setSelectedManuscriptVariety(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-5 space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Nama Calon Varietas:</span>
                  <strong className="text-slate-900 uppercase text-sm">{selectedManuscriptVariety.proposedVarietyName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Komoditas:</span>
                  <strong className="text-slate-800">{selectedManuscriptVariety.commodityName} ({selectedManuscriptVariety.cropType})</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Instansi Pemohon:</span>
                  <strong className="text-slate-800">{selectedManuscriptVariety.applicantName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Silsilah / Tetua:</span>
                  <span className="text-slate-700 italic">{selectedManuscriptVariety.lineage}</span>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-heading font-extrabold text-xs text-slate-900 uppercase tracking-wider">
                  Evaluasi Karakter Teknis & Morfologi
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">1. Potensi Hasil / Produksi</span>
                    <span className="font-semibold text-slate-800 text-xs mt-1 block">
                      Potensi hasil tinggi melampaui varietas pembanding standar nasional.
                    </span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">2. Ketahanan Hama / Penyakit</span>
                    <span className="font-semibold text-slate-800 text-xs mt-1 block">
                      Toleran penyakit utama antraknosa / layu fusarium serta adaptif iklim tropis.
                    </span>
                  </div>
                </div>

                <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-2xl">
                  <span className="text-[10px] font-bold text-emerald-900 uppercase block mb-1">
                    Catatan Pleno Tim Penilai (TP2VH):
                  </span>
                  <p className="text-slate-800 text-xs leading-relaxed">
                    {selectedManuscriptVariety.tp2vhNotes || 
                     'Telah memenuhi kriteria kebaruan, keunikan, keseragaman, dan kestabilan (BUSS) sesuai standar operasional Permentan No. 24 Tahun 2025.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
              <span className="text-[11px] text-slate-500 font-mono">
                Format Naskah Lampiran 2.a
              </span>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => alert(`Mengunduh berkas lengkap naskah ilmiah: ${selectedManuscriptVariety.proposedVarietyName}.pdf`)}
                  className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-emerald-700 text-white font-bold text-xs shadow hover:bg-emerald-800 transition-colors"
                >
                  <Download className="w-4 h-4 text-emerald-200" />
                  <span>Unduh Naskah Lengkap (PDF)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedManuscriptVariety(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-100"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: PENGAJUAN SANGGAHAN RESMI PUBLIK (PASAL 16 PERMENTAN 24/2025)
      ========================================================================= */}
      {objectionModalVariety && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn">
          <div className="relative bg-white/95 backdrop-blur-2xl rounded-3xl shadow-[0_25px_60px_rgba(217,119,6,0.3)] max-w-lg w-full border border-white p-6 sm:p-8 animate-scaleUp">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 shadow-xs">
                  <Scale className="w-6 h-6 text-amber-700" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 block">
                    PASAL 16 PERMENTAN NO. 24 TAHUN 2025
                  </span>
                  <h3 className="font-heading font-black text-lg text-slate-900">
                    Formulir Sanggahan Publik 30 Hari
                  </h3>
                </div>
              </div>
              <button 
                onClick={() => setObjectionModalVariety(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {objectionSuccess ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto border border-emerald-300">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                </div>
                <h4 className="font-heading font-extrabold text-base text-slate-900">
                  Sanggahan Resmi Berhasil Terdaftar
                </h4>
                <p className="text-xs text-slate-600 max-w-sm mx-auto">
                  Berkas sanggahan Anda untuk calon varietas <strong>{objectionModalVariety.proposedVarietyName}</strong> telah diteruskan ke Sekretariat TP2VH Direktorat Perbenihan Hortikultura.
                </p>
              </div>
            ) : (
              <form onSubmit={handleObjectionSubmit} className="py-4 space-y-3.5 text-xs">
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <span className="text-[10px] text-amber-800 font-bold uppercase block">Objek Sanggahan:</span>
                  <span className="font-extrabold text-slate-900 text-sm">{objectionModalVariety.proposedVarietyName}</span>
                  <span className="text-slate-600 block text-[11px]">Kode: {objectionModalVariety.trackingCode} • Pemohon: {objectionModalVariety.applicantName}</span>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nama Penyanggah / Lembaga *</label>
                  <input
                    type="text"
                    required
                    value={objectionForm.name}
                    onChange={(e) => setObjectionForm({ ...objectionForm, name: e.target.value })}
                    placeholder="Nama Pribadi atau Badan Hukum Pemulia"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs outline-none focus:border-amber-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Email Resmi *</label>
                    <input
                      type="email"
                      required
                      value={objectionForm.email}
                      onChange={(e) => setObjectionForm({ ...objectionForm, email: e.target.value })}
                      placeholder="email@instansi.com"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs outline-none focus:border-amber-600"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Nomor Telepon / WA *</label>
                    <input
                      type="text"
                      required
                      value={objectionForm.phone}
                      onChange={(e) => setObjectionForm({ ...objectionForm, phone: e.target.value })}
                      placeholder="0812-xxxx-xxxx"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs outline-none focus:border-amber-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Rincian Dasar Hukum & Bukti Sanggahan *</label>
                  <textarea
                    rows={3}
                    required
                    value={objectionForm.reason}
                    onChange={(e) => setObjectionForm({ ...objectionForm, reason: e.target.value })}
                    placeholder="Jelaskan klaim hak pemuliaan, kesamaan materi genetik, atau data pembanding ilmiah..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs outline-none focus:border-amber-600"
                  />
                </div>

                <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setObjectionModalVariety(null)}
                    className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 text-white font-bold shadow-md hover:scale-105 active:scale-95 transition-all"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Kirim Berkas Sanggahan</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
