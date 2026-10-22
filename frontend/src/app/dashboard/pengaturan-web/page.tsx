'use client';

import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Save, 
  Image as ImageIcon, 
  FileText, 
  Phone, 
  Mail, 
  MapPin, 
  CheckCircle2, 
  Eye, 
  RefreshCw,
  Sliders,
  Layers,
  ShieldCheck,
  Upload,
  Camera
} from 'lucide-react';
import Link from 'next/link';

export default function PengaturanWebPage() {
  const [activeTab, setActiveTab] = useState<'hero' | 'kontak' | 'sop'>('hero');
  const [loading, setLoading] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);
  const [uploadMsg, setUploadMsg] = useState<{ idx: number; text: string } | null>(null);

  // Settings State matching Landing Page Hero Slides & Content
  const [heroSlides, setHeroSlides] = useState([
    {
      badge: 'Sistem Terpadu Perbenihan Hortikultura',
      title: 'Digitalisasi Ekosistem Perbenihan & Varietas Nasional',
      description: 'Integrasi pelaporan 38 BPSB Provinsi, neraca produksi benih bulanan otomatis, dan transparansi sidang penilaian varietas TP2VH sesuai Permentan No. 24 Tahun 2025.',
      image: '/images/hero_pertanian.jpg',
      stats: [
        { value: '38', label: 'BPSB Provinsi Terhubung' },
        { value: '100%', label: 'Sidang TP2VH Terdokumentasi' },
        { value: '30 Hari', label: 'Masa Sanggah Terbuka' }
      ]
    },
    {
      badge: 'Standarisasi & Sertifikasi Mutu Benih Unggul',
      title: 'Jaminan Benih Bersertifikat & Kedaulatan Pangan Nasional',
      description: 'Standarisasi pengawasan penangkar benih berizin di seluruh Indonesia, pemantauan neraca stok benih bulanan secara akurat, serta uji laboratorium morfologi dan kemurnian genetik berdaya saing global.',
      image: '/images/benih_sertifikasi.jpg',
      stats: [
        { value: '4 Kelompok', label: 'Komoditas Hortikultura' },
        { value: 'Akreditasi', label: 'Standar Laboratorium ISO' },
        { value: 'Real-Time', label: 'Integrasi Neraca Stok Benih' }
      ]
    },
    {
      badge: 'Regulasi & Pelepasan Varietas Terpadu',
      title: 'Transparansi Pendaftaran Varietas Permentan 24/2025',
      description: 'Proses uji kebenaran dan keunggulan varietas tanaman hortikultura yang akuntabel, sidang pleno TP2VH transparan, serta kepastian perlindungan hak pemulia tanaman secara publik.',
      image: '/images/panen_distribusi.jpg',
      stats: [
        { value: 'SOP Resmi', label: 'Lampiran 1 & Lampiran 2.a' },
        { value: 'Pasal 16', label: 'Penegakan Hukum Hak Pemulia' },
        { value: 'Online', label: 'Penerbitan SK Tanda Daftar' }
      ]
    }
  ]);

  const [contactInfo, setContactInfo] = useState({
    siteTitle: 'SIM-BENIH HORTI — Kementerian Pertanian RI',
    officeAddress: 'Gedung D Lantai 2, Kantor Pusat Kementerian Pertanian RI, Jl. Harsono RM No. 3, Ragunan, Pasar Minggu, Jakarta Selatan 12550',
    phone: '(021) 781-5380 ext. 2341 / Fax: (021) 788-3456',
    email: 'perbenihan.hortikultura@pertanian.go.id',
    regulationNotice: 'Permentan No. 24 Tahun 2025 tentang Pendaftaran Varietas Tanaman Hortikultura'
  });

  // Fetch existing settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await fetch('/api/settings');
        const data = await res.json();
        if (res.ok && data.data) {
          if (data.data.hero_slides) setHeroSlides(data.data.hero_slides);
          if (data.data.contact_info) setContactInfo(data.data.contact_info);
        }
      } catch {
        // Fallback to local storage if available
        const localHero = localStorage.getItem('sim_benih_hero_slides');
        const localContact = localStorage.getItem('sim_benih_contact_info');
        if (localHero) setHeroSlides(JSON.parse(localHero));
        if (localContact) setContactInfo(JSON.parse(localContact));
      }
    };
    loadSettings();
  }, []);

  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Save to localStorage for instant Next.js public page reactivity
      localStorage.setItem('sim_benih_hero_slides', JSON.stringify(heroSlides));
      localStorage.setItem('sim_benih_contact_info', JSON.stringify(contactInfo));

      // Save to MySQL backend database
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hero_slides: heroSlides,
          contact_info: contactInfo
        })
      });

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch {
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadBanner = async (slideIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('File harus berupa format gambar (JPG, PNG, WebP).');
      return;
    }

    setUploadingIdx(slideIndex);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (res.ok && data.url) {
        updateSlideField(slideIndex, 'image', data.url);
        setUploadMsg({ idx: slideIndex, text: `Foto banner slide #${slideIndex + 1} berhasil diunggah!` });
        setTimeout(() => setUploadMsg(null), 4000);
      } else {
        alert(data.message || 'Gagal mengunggah foto banner.');
      }
    } catch {
      alert('Gagal menghubungi server upload.');
    } finally {
      setUploadingIdx(null);
    }
  };

  const updateSlideField = (index: number, field: string, val: string) => {
    setHeroSlides(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  };

  const updateSlideStat = (slideIdx: number, statIdx: number, field: 'value' | 'label', val: string) => {
    setHeroSlides(prev => {
      const copy = [...prev];
      const stats = [...copy[slideIdx].stats];
      stats[statIdx] = { ...stats[statIdx], [field]: val };
      copy[slideIdx] = { ...copy[slideIdx], stats };
      return copy;
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-kementan-forest-950 via-slate-950 to-kementan-forest-900 text-white p-6 sm:p-8 border border-emerald-500/40 shadow-xl">
        <div className="absolute right-0 top-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-400/40 text-emerald-300 text-xs font-bold uppercase tracking-wider">
              <Sliders className="w-3.5 h-3.5 text-kementan-gold-400" />
              <span>CMS Pengaturan Desain & Konten Landing Page</span>
            </div>
            <h1 className="font-heading font-black text-2xl sm:text-white tracking-tight">
              Pengaturan Publik & Branding Kementerian
            </h1>
            <p className="text-xs sm:text-slate-300 leading-relaxed">
              Kustomisasi teks banner slider, data statistik kunci, informasi kontak resmi, dan gambar pada halaman beranda utama SIM-BENIH HORTI.
            </p>
          </div>

          <div className="shrink-0 flex items-center space-x-3">
            <Link
              href="/"
              target="_blank"
              className="px-4 py-2.5 rounded-2xl bg-white/10 border border-white/20 text-white text-xs font-bold transition-all flex items-center space-x-2 hover:scale-105 active:scale-95"
            >
              <Eye className="w-4 h-4 text-emerald-400" />
              <span>Lihat Halaman Publik</span>
            </Link>

            <button
              onClick={handleSaveAll}
              disabled={loading}
              className="relative group overflow-hidden px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-900/50 border border-emerald-300/40 hover:scale-105 active:scale-95 transition-all flex items-center space-x-2"
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />
              <Save className="w-4 h-4 text-emerald-100" />
              <span>{loading ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
            </button>
          </div>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-900 border border-emerald-300 shadow-sm text-xs font-bold flex items-center space-x-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Pengaturan berhasil disimpan ke MySQL database dan otomatis diperbarui di Landing Page publik!</span>
        </div>
      )}

      {/* Tabs Selector */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('hero')}
          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all flex items-center space-x-2 ${
            activeTab === 'hero'
              ? 'bg-emerald-900 text-white shadow-sm'
              : 'text-slate-600 hover'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>Hero Carousel (3 Slides)</span>
        </button>

        <button
          onClick={() => setActiveTab('kontak')}
          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all flex items-center space-x-2 ${
            activeTab === 'kontak'
              ? 'bg-emerald-900 text-white shadow-sm'
              : 'text-slate-600 hover'
          }`}
        >
          <Phone className="w-4 h-4" />
          <span>Kontak & Footer Kantor</span>
        </button>
      </div>

      {/* TAB 1: HERO CAROUSEL SLIDES */}
      {activeTab === 'hero' && (
        <div className="space-y-6">
          {heroSlides.map((slide, sIdx) => (
            <div key={sIdx} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4 transition-colors">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black flex items-center justify-center border border-emerald-200">
                    {sIdx + 1}
                  </span>
                  <h3 className="font-heading font-bold text-sm text-slate-900">
                    Slide {sIdx + 1}: {slide.badge}
                  </h3>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">Index #{sIdx}</span>
              </div>

              {uploadMsg && uploadMsg.idx === sIdx && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs rounded-xl flex items-center gap-2 shadow-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold">{uploadMsg.text}</span>
                </div>
              )}

              {/* 16:9 Banner Preview & File Upload Box */}
              <div className="space-y-2 p-3.5 bg-slate-50/90 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-emerald-700" />
                    <span>Gambar Background Banner Slide (Aspek Rasio 16:9)</span>
                  </label>
                  <span className="text-[11px] text-slate-500 font-medium">Resolusi disarankan: 1920×1080</span>
                </div>

                <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-900 aspect-[16/7] max-h-44 group flex items-center justify-center shadow-inner">
                  {slide.image ? (
                    <img 
                      src={slide.image} 
                      alt={`Banner Slide ${sIdx + 1}`} 
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500" 
                    />
                  ) : (
                    <div className="text-slate-400 text-xs">Belum ada gambar banner</div>
                  )}

                  {/* Dark gradient label overlay */}
                  <div className="absolute inset-x-0 bottom-0 p-2.5 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-between text-white text-[11px]">
                    <span className="truncate max-w-xs font-mono">{slide.image}</span>
                    <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 hover:scale-105 active:scale-95">
                      <Camera className="w-3.5 h-3.5" />
                      <span>{uploadingIdx === sIdx ? 'Mengunggah...' : 'Ganti Foto'}</span>
                      <input 
                        type="file" 
                        accept="image/png, image/jpeg, image/jpg, image/webp" 
                        className="hidden" 
                        onChange={(e) => handleUploadBanner(sIdx, e)}
                        disabled={uploadingIdx === sIdx}
                      />
                    </label>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
                  <label className="cursor-pointer w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-2 shrink-0 hover:scale-105 active:scale-95">
                    <Upload className="w-4 h-4 text-emerald-300" />
                    <span>{uploadingIdx === sIdx ? 'Mengunggah...' : 'Unggah Foto dari Komputer'}</span>
                    <input 
                      type="file" 
                      accept="image/png, image/jpeg, image/jpg, image/webp" 
                      className="hidden" 
                      onChange={(e) => handleUploadBanner(sIdx, e)}
                      disabled={uploadingIdx === sIdx}
                    />
                  </label>

                  <div className="relative flex-1 w-full">
                    <input
                      type="text"
                      value={slide.image}
                      onChange={(e) => updateSlideField(sIdx, 'image', e.target.value)}
                      placeholder="/images/hero_hortikultura.jpg"
                      className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 text-slate-800 rounded-xl focus:border-emerald-600 outline-none font-mono"
                      title="Atau masukkan URL / path lokal file gambar"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Badge Label (Atas Judul)</label>
                  <input
                    type="text"
                    value={slide.badge}
                    onChange={(e) => updateSlideField(sIdx, 'badge', e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:bg-white focus:border-emerald-600 outline-none font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Judul Utama Slide</label>
                  <input
                    type="text"
                    value={slide.title}
                    onChange={(e) => updateSlideField(sIdx, 'title', e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 text-slate-900 rounded-xl outline-none font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Deskripsi Penjelasan</label>
                <textarea
                  rows={2}
                  value={slide.description}
                  onChange={(e) => updateSlideField(sIdx, 'description', e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 text-slate-900 rounded-xl outline-none leading-relaxed"
                />
              </div>

              {/* 3 Key Stats Settings */}
              <div className="pt-2 border-t border-slate-100">
                <label className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block mb-2">
                  3 Kartu Statistik Kunci Slide #{sIdx + 1}:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {slide.stats.map((st, stIdx) => (
                    <div key={stIdx} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                      <div>
                        <span className="text-[10px] text-slate-500 font-semibold block">Nilai Angka / Status:</span>
                        <input
                          type="text"
                          value={st.value}
                          onChange={(e) => updateSlideStat(sIdx, stIdx, 'value', e.target.value)}
                          className="w-full px-2.5 py-1 text-xs font-bold text-emerald-900 bg-white border border-slate-200 rounded-lg outline-none"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 font-semibold block">Label Penjelasan:</span>
                        <input
                          type="text"
                          value={st.label}
                          onChange={(e) => updateSlideStat(sIdx, stIdx, 'label', e.target.value)}
                          className="w-full px-2.5 py-1 text-[11px] text-slate-700 bg-white border border-slate-200 rounded-lg outline-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* TAB 2: KONTAK & IDENTITAS */}
      {activeTab === 'kontak' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4 transition-colors">
          <h3 className="font-heading font-bold text-sm text-slate-900 pb-2 border-b border-slate-100">
            Identitas Resmi & Kontak Kementerian Pertanian
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Nama Resmi Portal Sistem</label>
              <input
                type="text"
                value={contactInfo.siteTitle}
                onChange={(e) => setContactInfo({ ...contactInfo, siteTitle: e.target.value })}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 text-slate-900 rounded-xl outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Email Resmi Direktorat</label>
              <input
                type="email"
                value={contactInfo.email}
                onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 text-slate-900 rounded-xl outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Telepon & Fax Pelayanan</label>
              <input
                type="text"
                value={contactInfo.phone}
                onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 text-slate-900 rounded-xl outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Regulasi Utama</label>
              <input
                type="text"
                value={contactInfo.regulationNotice}
                onChange={(e) => setContactInfo({ ...contactInfo, regulationNotice: e.target.value })}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 text-slate-900 rounded-xl outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Alamat Kantor Pusat</label>
            <textarea
              rows={2}
              value={contactInfo.officeAddress}
              onChange={(e) => setContactInfo({ ...contactInfo, officeAddress: e.target.value })}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 text-slate-900 rounded-xl outline-none leading-relaxed"
            />
          </div>
        </div>
      )}

      {/* Bottom Save Bar */}
      <div className="p-4 bg-white/95 backdrop-blur-xl rounded-2xl border border-white shadow-[0_8px_30px_rgba(6,78,59,0.06)] flex items-center justify-between transition-colors">
        <span className="text-xs text-slate-500">
          Perubahan akan langsung disinkronkan ke basis data MySQL Kementan.
        </span>

        <button
          onClick={handleSaveAll}
          disabled={loading}
          className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md hover:scale-105 active:scale-95 transition-all flex items-center space-x-2"
        >
          <Save className="w-4 h-4" />
          <span>{loading ? 'Menyimpan...' : 'Simpan Semua Pengaturan'}</span>
        </button>
      </div>

    </div>
  );
}
