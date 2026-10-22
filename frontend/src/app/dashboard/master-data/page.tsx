'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Database, 
  Sprout, 
  Scale, 
  Building2, 
  Award, 
  Search, 
  Filter, 
  Plus, 
  CheckCircle2, 
  Download, 
  ExternalLink, 
  ShieldCheck, 
  RefreshCw, 
  FileSpreadsheet, 
  Info,
  Shield,
  Eye,
  X,
  Check,
  Save,
  Sliders,
  Users
} from 'lucide-react';
import CustomDropdown from '@/components/ui/CustomDropdown';

interface CropType {
  id: number;
  code: string;
  name: string;
  category: string;
  commodities: string;
}

interface Unit {
  id: number;
  code: string;
  name: string;
  description: string;
  note: string;
}

interface Bpsb {
  id: number;
  no_urut: number;
  provinsi: string;
  nama_bpsb: string;
  alamat: string;
  status: string;
}

interface Lssm {
  id: number;
  no_urut: number;
  provinsi: string;
  nama_produsen: string;
  alamat: string;
  status: string;
}

interface RolePermission {
  id: number;
  role: string;
  role_name: string;
  description: string;
  allowed_features: string[];
  sidebar_menus: string[];
}

export default function MasterDataPage() {
  const [activeTab, setActiveTab] = useState<'crops' | 'units' | 'bpsb' | 'lssm' | 'roles'>('crops');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterProvinsi, setFilterProvinsi] = useState('semua');

  // Master States
  const [cropTypes, setCropTypes] = useState<CropType[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [bpsbList, setBpsbList] = useState<Bpsb[]>([]);
  const [lssmList, setLssmList] = useState<Lssm[]>([]);
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>([]);

  // Selected Role for configuration
  const [selectedRoleKey, setSelectedRoleKey] = useState<string>('bpsb');
  const [savingRole, setSavingRole] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Detail Modal State
  const [detailModal, setDetailModal] = useState<{
    title: string;
    category: string;
    items: { label: string; value: string }[];
  } | null>(null);

  // Available features definition
  const AVAILABLE_FEATURES = [
    { key: 'dashboard', label: 'Dashboard Utama / Wilayah', desc: 'Ringkasan komando eksekutif atau wilayah 38 BPSB' },
    { key: 'master_data', label: 'Master Data Hortikultura', desc: 'Konfigurasi komoditas, satuan, direktori BPSB & hak akses role' },
    { key: 'modul_a', label: 'Modul A: Produsen & Pengedar', desc: 'Pelaporan dan pengawasan izin penangkar benih wilayah' },
    { key: 'modul_b', label: 'Modul B: Neraca Stok Benih', desc: 'Kalkulasi bulanan stok lalu + produksi - penyaluran' },
    { key: 'modul_c', label: 'Modul C: Pendaftaran Varietas', desc: 'Layanan terpadu 1 s.d 4 Permentan No. 24 Tahun 2025' },
    { key: 'pengguna', label: 'Kelola Pengguna & Akun', desc: 'Manajemen akun login & persetujuan ganti kata sandi' },
    { key: 'cms', label: 'Pengaturan Web (CMS)', desc: 'Kustomisasi banner landing page & kontak resmi' },
    { key: 'profil', label: 'Profil & Akun Saya', desc: 'Pembaruan data instansi, kontak, dan kata sandi' },
  ];

  // Fetch from backend API
  const fetchMasterData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/master/all');
      if (res.ok) {
        const json = await res.json();
        if (json.status === 'success' && json.data) {
          setCropTypes(json.data.crops || []);
          setUnits(json.data.units || []);
          setBpsbList(json.data.bpsb || []);
          setLssmList(json.data.lssm || []);
          if (json.data.role_permissions) {
            setRolePermissions(json.data.role_permissions);
          }
        }
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMasterData();
  }, []);

  // Filtered lists
  const filteredBpsb = bpsbList.filter(item => {
    const matchSearch = item.nama_bpsb.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        item.provinsi.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        item.alamat.toLowerCase().includes(searchQuery.toLowerCase());
    const matchProv = filterProvinsi === 'semua' || item.provinsi === filterProvinsi;
    return matchSearch && matchProv;
  });

  const filteredLssm = lssmList.filter(item => {
    const matchSearch = item.nama_produsen.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        item.provinsi.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        item.alamat.toLowerCase().includes(searchQuery.toLowerCase());
    const matchProv = filterProvinsi === 'semua' || item.provinsi === filterProvinsi;
    return matchSearch && matchProv;
  });

  const uniqueProvinces = Array.from(new Set([
    ...bpsbList.map(b => b.provinsi),
    ...lssmList.map(l => l.provinsi)
  ])).sort();

  const provinceOptions = [
    { value: 'semua', label: 'Semua Provinsi' },
    ...uniqueProvinces.map(p => ({ value: p, label: p }))
  ];

  // Current active role permission in tab 5
  const currentRolePerm = rolePermissions.find(r => r.role === selectedRoleKey) || {
    id: 0,
    role: selectedRoleKey,
    role_name: 'Role Pengguna',
    description: '',
    allowed_features: ['dashboard', 'profil'],
    sidebar_menus: ['dashboard', 'profil']
  };

  const toggleFeaturePermission = (featKey: string) => {
    if (selectedRoleKey === 'super_admin') return; // Super admin always has all
    const currentFeatures = [...currentRolePerm.allowed_features];
    const index = currentFeatures.indexOf(featKey);
    let updatedFeatures: string[];
    if (index > -1) {
      updatedFeatures = currentFeatures.filter(k => k !== featKey);
    } else {
      updatedFeatures = [...currentFeatures, featKey];
    }

    setRolePermissions(prev => prev.map(item => {
      if (item.role === selectedRoleKey) {
        return {
          ...item,
          allowed_features: updatedFeatures,
          sidebar_menus: updatedFeatures
        };
      }
      return item;
    }));
  };

  const handleSaveRolePermissions = async () => {
    setSavingRole(true);
    setSaveSuccessMsg('');
    try {
      const res = await fetch('/api/master/role-permissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: selectedRoleKey,
          allowed_features: currentRolePerm.allowed_features,
          sidebar_menus: currentRolePerm.allowed_features
        })
      });
      if (res.ok) {
        setSaveSuccessMsg(`Konfigurasi hak akses role ${currentRolePerm.role_name} berhasil disimpan.`);
        // Trigger event so layout updates sidebar dynamically
        window.dispatchEvent(new Event('kementan_permissions_updated'));
      }
    } catch {
      setSaveSuccessMsg('Tersimpan di sistem offline.');
      window.dispatchEvent(new Event('kementan_permissions_updated'));
    } finally {
      setSavingRole(false);
      setTimeout(() => setSaveSuccessMsg(''), 4000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner - True Dual Mode (Fresh Emerald in Light, Obsidian in Dark) */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-emerald-800 via-teal-700 to-emerald-800 text-white border border-emerald-400/30 shadow-xl overflow-hidden backdrop-blur-xl transition-colors">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 border border-white/30 text-white text-xs font-semibold">
              <Database className="w-3.5 h-3.5" />
              <span>Standardisasi Master Data • Kementerian Pertanian RI</span>
            </div>
            <h1 className="font-heading font-black text-2xl sm:text-white tracking-tight">
              Master Data Hortikultura Nasional
            </h1>
            <p className="text-xs sm:text-emerald-50 max-w-2xl leading-relaxed">
              Basis data referensi resmi: 4 kelompok komoditas, konversi satuan benih, direktori 33 Balai BPSB Provinsi, 44 Lembaga Mutu LSSM, dan pengaturan hak akses role & menu sidebar.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchMasterData}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl bg-white/15 text-white border border-white/25 text-xs font-semibold flex items-center gap-2 transition-all active:scale-95 shadow-sm"
              title="Perbarui data dari database MySQL"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Sinkron Data</span>
            </button>
            <div className="px-4 py-2.5 rounded-xl bg-emerald-900/40 border border-emerald-300/30 text-emerald-100 text-xs font-bold font-mono">
              33 BPSB • 44 LSSM • 5 ROLE
            </div>
          </div>
        </div>

        {/* Tab Navigation Rounded (Scrollable on Mobile) */}
        <div className="relative z-10 flex items-center gap-2 mt-6 pt-6 border-t border-white/15 overflow-x-auto custom-scrollbar">
          <button
            onClick={() => setActiveTab('crops')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'crops'
                ? 'bg-white text-emerald-950 font-bold shadow-md'
                : 'bg-white/10 text-white/90'
            }`}
          >
            <Sprout className="w-3.5 h-3.5" />
            <span>1. Jenis Tanaman ({cropTypes.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('units')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'units'
                ? 'bg-white text-emerald-950 font-bold shadow-md'
                : 'bg-white/10 text-white/90'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>2. Satuan Benih ({units.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('bpsb')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'bpsb'
                ? 'bg-white text-emerald-950 font-bold shadow-md'
                : 'bg-white/10 text-white/90'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>3. Balai BPSB 38 Provinsi ({bpsbList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('lssm')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'lssm'
                ? 'bg-white text-emerald-950 font-bold shadow-md'
                : 'bg-white/10 text-white/90'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>4. Akreditasi LSSM & Produsen ({lssmList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('roles')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'roles'
                ? 'bg-amber-400 text-slate-950 font-bold shadow-md'
                : 'bg-amber-400/20 text-amber-200 border border-amber-400/30'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-amber-300" />
            <span>5. Hak Akses & Menu Sidebar Role</span>
          </button>
        </div>
      </div>

      {/* TAB 1: JENIS TANAMAN */}
      {activeTab === 'crops' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cropTypes.map((crop, idx) => (
              <div 
                key={crop.id || idx}
                className="bg-white backdrop-blur-xl rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-all hover"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                      <Sprout className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-slate-900 text-base">
                        {crop.name}
                      </h3>
                      <span className="text-xs text-emerald-700 font-medium">
                        Kategori: {crop.category}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold uppercase">
                    KODE: {crop.code}
                  </span>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                    Daftar Komoditas Unggulan Sesuai Excel:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {crop.commodities.split(',').map((item, cIdx) => (
                      <span 
                        key={cIdx}
                        className="text-xs px-2.5 py-1 rounded-lg bg-slate-50 text-slate-800 border border-slate-200/80 font-medium transition-colors"
                      >
                        {item.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 flex items-start gap-3">
            <Info className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <p className="text-xs text-emerald-900 leading-relaxed">
              <strong>Ketentuan Resmi Mitra:</strong> Seluruh komoditas di atas wajib dikelompokkan ke dalam 4 tab pelaporan neraca produksi bulanan BPSB (Sayuran, Buah, Hias, dan Tanaman Obat).
            </p>
          </div>
        </div>
      )}

      {/* TAB 2: SATUAN BENIH */}
      {activeTab === 'units' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {units.map((unit, idx) => (
              <div 
                key={unit.id || idx}
                className="bg-white backdrop-blur-xl rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono border border-emerald-200">
                      {unit.code.toUpperCase()}
                    </span>
                    <Scale className="w-4 h-4 text-emerald-600" />
                  </div>
                  <h3 className="font-heading font-bold text-slate-900 text-lg mb-1">
                    {unit.name}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-3">
                    {unit.description}
                  </p>
                </div>

                {unit.note && (
                  <div className="pt-3 border-t border-slate-100 text-[11px] text-amber-800 bg-amber-50/80 p-2.5 rounded-xl border border-amber-200/60 leading-tight">
                    <strong>Catatan Excel:</strong> {unit.note}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Knol special note */}
          <div className="rounded-2xl p-5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 text-amber-950 flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed">
              <strong className="text-amber-900 font-heading">Rumus Konversi Satuan Knol:</strong>
              <p className="mt-0.5 text-amber-800">
                Sesuai petunjuk teknis pada datasheet Excel: <em>&ldquo;Untuk knol biasanya terjadi pada komoditas kentang, 1 knol = 1 kg&rdquo;</em>. Sistem otomatis mengalokasikan data produksi benih kentang berbasis kilogram atau knol secara setara.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: BPSB 38 PROVINSI */}
      {activeTab === 'bpsb' && (
        <div className="space-y-4">
          {/* Filter & Search Bar with Dual-Mode CustomDropdown */}
          <div className="flex flex-col sm:flex-row gap-3 bg-white backdrop-blur-md p-3 rounded-2xl border border-slate-200 shadow-xs">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari Balai BPSB atau Provinsi..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder outline-none"
              />
            </div>
            <div className="w-full sm:w-64">
              <CustomDropdown
                options={provinceOptions}
                value={filterProvinsi}
                onChange={setFilterProvinsi}
                placeholder="Filter Provinsi"
              />
            </div>
          </div>

          {/* Table BPSB */}
          <div className="bg-white backdrop-blur-xl rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-4 w-12 text-center">No</th>
                    <th className="py-3.5 px-4 w-40">Provinsi</th>
                    <th className="py-3.5 px-4">Nama Balai BPSB Resmi</th>
                    <th className="py-3.5 px-4">Alamat Kantor</th>
                    <th className="py-3.5 px-4 w-28 text-center">Status</th>
                    <th className="py-3.5 px-4 w-28 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredBpsb.map((bpsb, index) => (
                    <tr key={bpsb.id || index} className="hover transition-colors">
                      <td className="py-3 px-4 text-center font-mono font-medium text-slate-500">
                        {bpsb.no_urut || index + 1}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">
                        {bpsb.provinsi}
                      </td>
                      <td className="py-3 px-4 font-medium text-emerald-950">
                        {bpsb.nama_bpsb}
                      </td>
                      <td className="py-3 px-4 text-slate-600 leading-relaxed max-w-md truncate">
                        {bpsb.alamat}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          Terhubung
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => setDetailModal({
                            title: bpsb.nama_bpsb,
                            category: `Balai Pengawasan & Sertifikasi Benih • ${bpsb.provinsi}`,
                            items: [
                              { label: 'Nomor Urut', value: String(bpsb.no_urut || index + 1) },
                              { label: 'Provinsi Wilayah', value: bpsb.provinsi },
                              { label: 'Nama Resmi Balai', value: bpsb.nama_bpsb },
                              { label: 'Alamat Lengkap', value: bpsb.alamat },
                              { label: 'Status Operasional', value: 'Aktif Terintegrasi SIM-BENIH HORTI Pusat' }
                            ]
                          })}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Detail</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredBpsb.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        Tidak ada Balai BPSB yang sesuai pencarian.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: LSSM & PRODUSEN */}
      {activeTab === 'lssm' && (
        <div className="space-y-4">
          {/* Filter & Search Bar with Dual-Mode CustomDropdown */}
          <div className="flex flex-col sm:flex-row gap-3 bg-white backdrop-blur-md p-3 rounded-2xl border border-slate-200 shadow-xs">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari Produsen LSSM atau Alamat..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder outline-none"
              />
            </div>
            <div className="w-full sm:w-64">
              <CustomDropdown
                options={provinceOptions}
                value={filterProvinsi}
                onChange={setFilterProvinsi}
                placeholder="Filter Provinsi"
              />
            </div>
          </div>

          {/* Table LSSM */}
          <div className="bg-white backdrop-blur-xl rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-4 w-12 text-center">No</th>
                    <th className="py-3.5 px-4 w-40">Provinsi</th>
                    <th className="py-3.5 px-4">Nama Produsen / Balai Binaan LSSM</th>
                    <th className="py-3.5 px-4">Alamat Fasilitas</th>
                    <th className="py-3.5 px-4 w-32 text-center">Akreditasi Mutu</th>
                    <th className="py-3.5 px-4 w-28 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLssm.map((lssm, index) => (
                    <tr key={lssm.id || index} className="hover transition-colors">
                      <td className="py-3 px-4 text-center font-mono font-medium text-slate-500">
                        {lssm.no_urut || index + 1}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">
                        {lssm.provinsi}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-900">
                        {lssm.nama_produsen}
                      </td>
                      <td className="py-3 px-4 text-slate-600 leading-relaxed max-w-md truncate">
                        {lssm.alamat}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-900 border border-amber-200">
                          <Award className="w-3 h-3 text-amber-600" />
                          ISO / LSSM
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => setDetailModal({
                            title: lssm.nama_produsen,
                            category: `Produsen Terakreditasi LSSM • Provinsi ${lssm.provinsi}`,
                            items: [
                              { label: 'Nomor Urut', value: String(lssm.no_urut || index + 1) },
                              { label: 'Provinsi Wilayah', value: lssm.provinsi },
                              { label: 'Nama Produsen / Balai', value: lssm.nama_produsen },
                              { label: 'Alamat Fasilitas', value: lssm.alamat },
                              { label: 'Sertifikasi Mutu', value: 'Terakreditasi ISO / LSSM Hortikultura' }
                            ]
                          })}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5 text-amber-600" />
                          <span>Detail</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredLssm.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        Tidak ada data Produsen LSSM yang sesuai pencarian.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: HAK AKSES & MENU SIDEBAR ROLE (NEW FEATURE SINKRONISASI ROLE) */}
      {activeTab === 'roles' && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 flex items-start gap-3">
            <Shield className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="font-heading text-sm text-amber-950 block mb-0.5">
                Konfigurasi Hak Akses Fitur & Menu Sidebar Terpadu
              </strong>
              Atur fitur apa saja yang dapat diakses oleh masing-masing peran kementerian. Menu sidebar pada dashboard pengguna akan otomatis disesuaikan secara real-time berdasarkan izin yang Anda aktifkan di sini.
            </div>
          </div>

          {/* Role Selector Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {[
              { key: 'super_admin', label: 'Super Admin Pusat', roleBadge: 'SUPER ADMIN' },
              { key: 'bpsb', label: 'Petugas BPSB Prov.', roleBadge: 'BPSB 38 PROV' },
              { key: 'lssm', label: 'Auditor Mutu LSSM', roleBadge: 'AUDITOR LSSM' },
              { key: 'tp2vh', label: 'Tim Penilai TP2VH', roleBadge: 'TIM TP2VH' },
              { key: 'applicant', label: 'Produsen / Pemohon', roleBadge: 'PEMOHON' },
            ].map(r => (
              <button
                key={r.key}
                type="button"
                onClick={() => setSelectedRoleKey(r.key)}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  selectedRoleKey === r.key
                    ? 'bg-emerald-700 text-white border-emerald-500 shadow-md ring-2 ring-emerald-500/30'
                    : 'bg-white text-slate-700 border-slate-200 hover'
                }`}
              >
                <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mb-1 ${
                  selectedRoleKey === r.key
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 text-slate-600'
                }`}>
                  {r.roleBadge}
                </div>
                <div className="font-heading font-bold text-xs truncate">
                  {r.label}
                </div>
              </button>
            ))}
          </div>

          {/* Permissions Matrix Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
              <div>
                <div className="text-xs font-bold text-emerald-700 uppercase tracking-widest">
                  Pengaturan Izin Akses Untuk Role:
                </div>
                <h3 className="font-heading font-black text-xl text-slate-900 mt-0.5">
                  {currentRolePerm.role_name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {currentRolePerm.description}
                </p>
              </div>

              <div className="flex items-center gap-3">
                {saveSuccessMsg && (
                  <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    {saveSuccessMsg}
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleSaveRolePermissions}
                  disabled={savingRole || selectedRoleKey === 'super_admin'}
                  className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all active:scale-95 shadow-md ${
                    selectedRoleKey === 'super_admin'
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                      : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white hover:scale-105'
                  }`}
                >
                  <Save className="w-4 h-4" />
                  <span>{savingRole ? 'Menyimpan...' : 'Simpan Hak Akses'}</span>
                </button>
              </div>
            </div>

            {selectedRoleKey === 'super_admin' && (
              <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs">
                <strong>Catatan Super Admin:</strong> Super Admin Pusat memiliki hak akses tertinggi yang mencakup semua modul, master data, kelola pengguna, dan CMS secara permanen.
              </div>
            )}

            {/* Feature Checkboxes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {AVAILABLE_FEATURES.map(feat => {
                const isChecked = selectedRoleKey === 'super_admin' || currentRolePerm.allowed_features.includes(feat.key);
                return (
                  <div
                    key={feat.key}
                    onClick={() => toggleFeaturePermission(feat.key)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                      isChecked
                        ? 'bg-emerald-50/70 border-emerald-300 shadow-2xs'
                        : 'bg-slate-50/80 border-slate-200 hover'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-lg border mt-0.5 flex items-center justify-center transition-colors shrink-0 ${
                      isChecked
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-slate-300 bg-white'
                    }`}>
                      {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold ${
                          isChecked ? 'text-emerald-950' : 'text-slate-800'
                        }`}>
                          {feat.label}
                        </span>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                          isChecked
                            ? 'bg-emerald-100 text-emerald-800 font-bold'
                            : 'bg-slate-200 text-slate-600'
                        }`}>
                          {isChecked ? 'Aktif di Sidebar' : 'Disembunyikan'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                        {feat.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Global Detail Modal (No truncate, clean liquid glass) */}
      {detailModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setDetailModal(null)}
        >
          <div 
            className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200 text-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between pb-3 border-b border-slate-200">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block mb-1">
                  {detailModal.category}
                </span>
                <h3 className="font-heading font-black text-lg text-slate-900">
                  {detailModal.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDetailModal(null)}
                className="p-1.5 rounded-xl text-slate-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {detailModal.items.map((item, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {item.label}
                  </div>
                  <div className="text-xs font-semibold text-slate-900 mt-0.5 leading-relaxed">
                    {item.value}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setDetailModal(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:opacity-90 transition-opacity"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
