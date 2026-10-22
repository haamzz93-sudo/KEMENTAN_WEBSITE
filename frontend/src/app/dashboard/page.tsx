'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Building2, 
  Sprout, 
  FileCheck, 
  AlertTriangle, 
  TrendingUp, 
  ShieldCheck, 
  Calendar, 
  Clock, 
  ArrowRight, 
  ChevronRight,
  MapPin,
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';
import { INITIAL_PRODUCERS, INITIAL_SEED_PRODUCTIONS, INITIAL_VARIETY_APPLICATIONS, PROVINCES_INDONESIA } from '@/data/masterData';

export default function ExecutiveDashboardPage() {
  const totalProdusen = INITIAL_PRODUCERS.length;
  const totalProduksiKuintal = INITIAL_SEED_PRODUCTIONS.reduce((acc, p) => acc + p.currentProduction, 0);
  const totalVarietasAktif = INITIAL_VARIETY_APPLICATIONS.length;
  const inObjectionCount = INITIAL_VARIETY_APPLICATIONS.filter(a => a.currentStage === 'layanan_3_masa_sanggah').length;

  return (
    <div className="space-y-8">
      
      {/* Executive Welcome Banner - True Dual Mode */}
      <div className="relative rounded-3xl bg-gradient-to-r from-emerald-800 via-teal-700 to-emerald-800 text-white p-6 sm:p-8 shadow-xl border border-emerald-400/30 overflow-hidden transition-colors">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-800/80 border border-emerald-600/50 text-[11px] font-semibold text-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5 text-kementan-gold-400" />
            <span>KEMENTERIAN PERTANIAN REPUBLIK INDONESIA</span>
          </div>

          <h1 className="font-heading font-extrabold text-2xl sm:text-white">
            Dashboard Eksekutif Perbenihan Hortikultura Nasional
          </h1>

          <p className="text-xs sm:text-emerald-100/90 leading-relaxed">
            Pusat komando digital pemantauan ketersediaan benih hortikultura 38 provinsi, audit mutu sertifikasi BPSB/LSSM, dan status legalitas pendaftaran varietas tanaman (Permentan No. 24 Tahun 2025).
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3 text-xs">
            <span className="flex items-center space-x-1.5 text-emerald-200">
              <Calendar className="w-4 h-4 text-kementan-gold-400" />
              <span>Periode Aktif: September 2026</span>
            </span>
            <span>•</span>
            <span className="flex items-center space-x-1.5 text-emerald-200">
              <Building2 className="w-4 h-4 text-emerald-400" />
              <span>38 Balai BPSB Terhubung</span>
            </span>
          </div>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1 */}
        <div className="bg-white/95 backdrop-blur-xl p-5 rounded-2xl border border-white shadow-[0_8px_30px_rgba(6,78,59,0.06)] space-y-2 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Produsen & Pengedar</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center border border-emerald-200">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{totalProdusen * 120} Unit</div>
          <p className="text-[11px] text-emerald-700 font-semibold">Terverifikasi Sertifikat Kompetensi</p>
        </div>

        {/* Card 2 */}
        <div className="bg-white/95 backdrop-blur-xl p-5 rounded-2xl border border-white shadow-[0_8px_30px_rgba(6,78,59,0.06)] space-y-2 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Produksi Benih Horti</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center border border-amber-200">
              <Sprout className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {(totalProduksiKuintal / 10).toFixed(0)} Ton
          </div>
          <p className="text-[11px] text-emerald-700 font-semibold">Sayuran, Buah, Hias & Biofarmaka</p>
        </div>

        {/* Card 3 */}
        <div className="bg-white/95 backdrop-blur-xl p-5 rounded-2xl border border-white shadow-[0_8px_30px_rgba(6,78,59,0.06)] space-y-2 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Permohonan Varietas</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-900 text-white flex items-center justify-center">
              <FileCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{totalVarietasAktif} Berkas</div>
          <p className="text-[11px] text-slate-500 font-medium">Sidang Pleno TP2VH 2026</p>
        </div>

        {/* Card 4 */}
        <div className="bg-white/95 backdrop-blur-xl p-5 rounded-2xl border border-white shadow-[0_8px_30px_rgba(6,78,59,0.06)] space-y-2 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">Masa Sanggah 30 Hari</span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center border border-amber-200">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-700">{inObjectionCount} Varietas</div>
          <p className="text-[11px] text-amber-700 font-semibold">Menunggu Kepastian Hukum Publik</p>
        </div>

      </div>

      {/* Grid: Stok Kritis Alert & Alur Cepat */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Early Warning System (Neraca Kritis) */}
        <div className="lg:col-span-7 bg-white/95 backdrop-blur-xl rounded-2xl border border-white shadow-[0_8px_30px_rgba(6,78,59,0.06)] shadow-2xs p-6 space-y-4 transition-colors">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <h3 className="font-heading font-bold text-sm text-slate-900">
                Peringatan Dini Neraca Benih Strategis (September 2026)
              </h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200">
              PRIORITAS
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 flex items-start justify-between">
              <div>
                <span className="font-bold text-amber-950">Cabai Rawit — Jawa Timur & NTB</span>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  Laju penyaluran melebihi 85% ketersediaan stok. Disarankan koordinasi penangkaran benih sebar (BR) tambahan.
                </p>
              </div>
              <span className="font-bold text-amber-900 text-xs shrink-0 ml-3">Waspada</span>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-start justify-between">
              <div>
                <span className="font-bold text-emerald-950">Bawang Merah — Jawa Tengah (Brebes)</span>
                <p className="text-[11px] text-emerald-800 mt-0.5">
                  Neraca ketersediaan aman. Surplus benih varietas Bima Brebes mencapai 16.300 kg siap edar ke luar pulau.
                </p>
              </div>
              <span className="font-bold text-emerald-800 text-xs shrink-0 ml-3">Surplus</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start justify-between">
              <div>
                <span className="font-bold text-slate-800">Kentang Knol G0/G2 — Jawa Barat & Jawa Timur</span>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Sertifikasi kultur jaringan LSSM memenuhi kuota tanam dataran tinggi semester II.
                </p>
              </div>
              <span className="font-bold text-slate-700 text-xs shrink-0 ml-3">Stabil</span>
            </div>
          </div>

          <div className="pt-2">
            <Link
              href="/dashboard/produksi-benih"
              className="text-xs font-bold text-emerald-700 flex items-center space-x-1"
            >
              <span>Buka Seluruh Neraca Benih Provinsi</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Right Column: Akses Cepat 3 Modul Operasional */}
        <div className="lg:col-span-5 bg-white/95 backdrop-blur-xl rounded-2xl border border-white shadow-[0_8px_30px_rgba(6,78,59,0.06)] shadow-2xs p-6 space-y-4 transition-colors">
          <h3 className="font-heading font-bold text-sm text-slate-900 pb-3 border-b border-slate-100">
            Akses Langsung Modul Operasional
          </h3>

          <div className="space-y-3">
            <Link
              href="/dashboard/produsen-pengedar"
              className="p-3.5 rounded-xl border border-slate-200 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold border border-emerald-200">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900 group-hover">
                    Modul A: Produsen & Pengedar
                  </div>
                  <div className="text-[10px] text-slate-500">Legalitas & Sertifikat Kompetensi</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover" />
            </Link>

            <Link
              href="/dashboard/produksi-benih"
              className="p-3.5 rounded-xl border border-slate-200 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center font-bold border border-amber-200">
                  <Sprout className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900 group-hover">
                    Modul B: Neraca Produksi Benih
                  </div>
                  <div className="text-[10px] text-slate-500">Kalkulasi Stok Otomatis BPSB / LSSM</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover" />
            </Link>

            <Link
              href="/dashboard/pendaftaran-varietas"
              className="p-3.5 rounded-xl border border-slate-200 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-900 text-white flex items-center justify-center font-bold">
                  <FileCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900 group-hover">
                    Modul C: Pendaftaran Varietas
                  </div>
                  <div className="text-[10px] text-slate-500">Alur Permentan No. 24 Tahun 2025</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover" />
            </Link>
          </div>
        </div>

      </div>

      {/* Sebaran Wilayah BPSB 38 Provinsi (Tabel Status Sinkronisasi) */}
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl border border-white shadow-[0_8px_30px_rgba(6,78,59,0.06)] shadow-2xs p-6 space-y-4 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
          <div>
            <h3 className="font-heading font-extrabold text-sm text-slate-900">
              Status Sinkronisasi Pelaporan BPSB 38 Provinsi
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Pemantauan kepatuhan pengiriman neraca data produksi benih bulanan ke pusat.
            </p>
          </div>

          <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
            Tingkat Kepatuhan Nasional: 94.7%
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 text-xs">
          {PROVINCES_INDONESIA.slice(0, 18).map((prov, idx) => (
            <div key={prov} className="p-2.5 rounded-lg border border-slate-100 bg-slate-50 flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-700 truncate pr-1">{prov}</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
