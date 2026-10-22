'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { MapPin, Phone, Mail, FileText, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function Footer() {
  const [footerData, setFooterData] = useState({
    address: 'Gedung D Lantai 2, Kantor Pusat Kementerian Pertanian RI, Jl. Harsono RM No. 3, Ragunan, Pasar Minggu, Jakarta Selatan 12550',
    phone: '(021) 781-5380 ext. 2341 / Fax: (021) 788-3456',
    email: 'perbenihan.hortikultura@pertanian.go.id',
    description: 'Sistem Informasi Manajemen Terpadu Perbenihan dan Pendaftaran Varietas Tanaman Hortikultura Nasional. Mengintegrasikan pelaporan 38 BPSB Provinsi, Lembaga Sertifikasi Sistem Mutu (LSSM), dan sidang penilaian varietas TP2VH berdasarkan Permentan No. 24 Tahun 2025.'
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem('kementan_web_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        setFooterData(prev => ({
          ...prev,
          address: parsed.address || prev.address,
          phone: parsed.phone || prev.phone,
          email: parsed.email || prev.email,
          description: parsed.description || prev.description
        }));
      }
    } catch {
      // ignore
    }
  }, []);

  return (
    <footer className="bg-kementan-forest-950 text-slate-300 pt-16 pb-12 border-t border-kementan-forest-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-kementan-forest-800">
          {/* Col 1: Instansi */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-white p-1.5 flex items-center justify-center shadow-md">
                <img 
                  src="/images/logo_kementan.png" 
                  alt="Kementerian Pertanian RI" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h4 className="font-heading font-bold text-white text-base leading-tight">
                  SIM-BENIH HORTI
                </h4>
                <p className="text-xs text-emerald-300">
                  Direktorat Perbenihan Hortikultura
                </p>
                <p className="text-[11px] text-slate-400">
                  Direktorat Jenderal Hortikultura — Kementerian Pertanian RI
                </p>
              </div>
            </div>

            <p className="text-sm text-slate-300/90 leading-relaxed pr-6">
              {footerData.description}
            </p>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-start space-x-2.5">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{footerData.address}</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{footerData.phone}</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{footerData.email}</span>
              </div>
            </div>
          </div>

          {/* Col 2: Layanan & Regulasi */}
          <div className="space-y-3">
            <h5 className="font-heading font-semibold text-white text-sm tracking-wide uppercase border-b border-kementan-forest-800 pb-2">
              Regulasi & Acuan
            </h5>
            <ul className="space-y-2 text-xs text-slate-300">
              <li>
                <span className="text-emerald-400 font-medium">Permentan No. 24/2025:</span> Pendaftaran Varietas Hortikultura
              </li>
              <li>
                <span className="text-emerald-400 font-medium">UU No. 22/2019:</span> Sistem Budi Daya Pertanian Berkelanjutan
              </li>
              <li>
                <span className="text-emerald-400 font-medium">Kepmentan Sertifikasi Mutu:</span> Standar Teknis BPSB & LSSM
              </li>
              <li>
                <span className="text-emerald-400 font-medium">Pedoman TP2VH:</span> Prosedur Uji Kebenaran & Keunggulan
              </li>
            </ul>
          </div>

          {/* Col 3: Modul Terpadu */}
          <div className="space-y-3">
            <h5 className="font-heading font-semibold text-white text-sm tracking-wide uppercase border-b border-kementan-forest-800 pb-2">
              Modul Pelayanan
            </h5>
            <ul className="space-y-2 text-xs text-slate-300">
              <li>
                <Link href="/dashboard/produsen-pengedar" className="hover:text-emerald-300 transition-colors flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Data Produsen dan Pengedar</span>
                </Link>
              </li>
              <li>
                <Link href="/dashboard/produksi-benih" className="hover:text-emerald-300 transition-colors flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Data Produksi Benih Bulanan</span>
                </Link>
              </li>
              <li>
                <Link href="/dashboard/pendaftaran-varietas" className="hover:text-emerald-300 transition-colors flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Pendaftaran Varietas Tanaman Hortikultura</span>
                </Link>
              </li>
              <li>
                <Link href="/#tracking" className="hover:text-emerald-300 transition-colors flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Pelacakan Status Permohonan</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© 2026 Kementerian Pertanian Republik Indonesia. Hak Cipta Dilindungi Undang-Undang.</p>
          <div className="flex items-center space-x-4 text-emerald-300/80">
            <span>Standar Layanan Publik</span>
            <span>•</span>
            <span>Keterbukaan Informasi Publik (KIP)</span>
            <span>•</span>
            <span>Keamanan Siber BSSN</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
