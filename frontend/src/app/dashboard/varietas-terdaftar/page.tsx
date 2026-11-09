'use client';

import React, { useState, useEffect } from 'react';
import { 
  Sprout, 
  Search, 
  Download, 
  CheckCircle2, 
  Building2, 
  ChevronLeft, 
  ChevronRight, 
  Info, 
  X, 
  Layers, 
  RefreshCw,
  Printer,
  Plus,
  Edit,
  Trash2,
  Save,
  AlertTriangle,
  FileCheck,
  ShieldCheck
} from 'lucide-react';
import CustomDropdown from '@/components/ui/CustomDropdown';

interface RegisteredVarietyItem {
  id: number;
  nama_varietas: string;
  komoditas: string;
  kategori: string;
  produsen: string;
  no_sk: string;
  tahun_daftar: string;
  no_reg?: string;
  upload_deskripsi?: string;
  upload_produk?: string;
  wil_adaptasi?: string;
  tahan_opt?: string;
}

export default function RegisteredVarietiesPage() {
  const [varieties, setVarieties] = useState<RegisteredVarietyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedKategori, setSelectedKategori] = useState('Semua');
  const [selectedTahun, setSelectedTahun] = useState('Semua');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalData, setTotalData] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  
  // Stats
  const [stats, setStats] = useState({
    total_all: 4009,
    sayuran: 2504,
    buah: 1105,
    flori: 360,
    obat: 40
  });

  // Modals state
  const [selectedDetail, setSelectedDetail] = useState<RegisteredVarietyItem | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    id: 0,
    nama_varietas: '',
    komoditas: '',
    kategori: 'Tanaman Sayuran',
    produsen: '',
    no_sk: '',
    tahun_daftar: new Date().getFullYear().toString(),
    no_reg: '',
    wil_adaptasi: '',
    tahan_opt: ''
  });

  const [deleteTarget, setDeleteTarget] = useState<RegisteredVarietyItem | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Show toast notification
  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Fetch data from API
  const fetchData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        search,
        kategori: selectedKategori,
        tahun: selectedTahun,
        page: String(page),
        limit: String(limit),
      });

      const res = await fetch(`/api/registered-varieties?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setVarieties(json.data || []);
        setTotalData(json.total || 0);
        setTotalPages(json.last_page || 1);
        if (json.summary) {
          setStats(json.summary);
        }
      }
    } catch (err) {
      console.error('Failed to fetch registered varieties:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, selectedKategori, selectedTahun, page, limit]);

  // Open Form for CREATE
  const handleOpenCreate = () => {
    setIsEditMode(false);
    setFormData({
      id: 0,
      nama_varietas: '',
      komoditas: '',
      kategori: 'Tanaman Sayuran',
      produsen: '',
      no_sk: '',
      tahun_daftar: new Date().getFullYear().toString(),
      no_reg: '',
      wil_adaptasi: '',
      tahan_opt: ''
    });
    setIsFormModalOpen(true);
  };

  // Open Form for EDIT
  const handleOpenEdit = (item: RegisteredVarietyItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditMode(true);
    setFormData({
      id: item.id,
      nama_varietas: item.nama_varietas,
      komoditas: item.komoditas,
      kategori: item.kategori,
      produsen: item.produsen,
      no_sk: item.no_sk,
      tahun_daftar: item.tahun_daftar,
      no_reg: item.no_reg && item.no_reg !== '-' ? item.no_reg : '',
      wil_adaptasi: item.wil_adaptasi || '',
      tahan_opt: item.tahan_opt || ''
    });
    setIsFormModalOpen(true);
  };

  // Open Delete Confirmation
  const handleOpenDelete = (item: RegisteredVarietyItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteTarget(item);
  };

  // Submit Form (CREATE or UPDATE)
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama_varietas.trim() || !formData.no_sk.trim()) {
      showToast('Nama varietas dan Nomor SK Menteri Pertanian wajib diisi!', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const url = '/api/registered-varieties';
      const method = isEditMode ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const json = await res.json();
      if (res.ok && json.status === 'success') {
        showToast(json.message || (isEditMode ? 'Data varietas berhasil diperbarui!' : 'Varietas baru berhasil ditambahkan!'));
        setIsFormModalOpen(false);
        fetchData();
      } else {
        showToast(json.message || 'Gagal menyimpan data!', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Terjadi kesalahan sistem!', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Confirm DELETE
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      setSubmitting(true);
      const res = await fetch(`/api/registered-varieties?id=${deleteTarget.id}`, {
        method: 'DELETE'
      });

      const json = await res.json();
      if (res.ok && json.status === 'success') {
        showToast(json.message || 'Data varietas berhasil dihapus!');
        setDeleteTarget(null);
        fetchData();
      } else {
        showToast(json.message || 'Gagal menghapus data!', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Terjadi kesalahan saat menghapus!', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (!varieties.length) return;
    const headers = ['No', 'Nama Varietas', 'Komoditas', 'Kategori', 'Produsen / Pemohon', 'Nomor SK', 'Tahun Terdaftar'];
    const rows = varieties.map((v, i) => [
      (page - 1) * limit + i + 1,
      `"${(v.nama_varietas || '').replace(/"/g, '""')}"`,
      `"${(v.komoditas || '').replace(/"/g, '""')}"`,
      `"${(v.kategori || '').replace(/"/g, '""')}"`,
      `"${(v.produsen || '').replace(/"/g, '""')}"`,
      `"${(v.no_sk || '').replace(/"/g, '""')}"`,
      `"${v.tahun_daftar || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Katalog_Varietas_Terdaftar_Kementan_Hal_${page}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-lg border flex items-center gap-3 animate-in fade-in slide-in-from-top-2 text-xs font-semibold ${
          toastMessage.type === 'success' 
            ? 'bg-emerald-900 text-emerald-100 border-emerald-700' 
            : 'bg-rose-900 text-rose-100 border-rose-700'
        }`}>
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header Institusional Kementan */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm border border-emerald-700/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-emerald-300 text-xs font-semibold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Direktorat Perbenihan Hortikultura — Kementerian Pertanian RI
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <Sprout className="w-8 h-8 text-amber-400" />
              Database Varietas Terdaftar Nasional
            </h1>
            <p className="text-emerald-100/90 text-sm max-w-3xl leading-relaxed">
              Katalog resmi varietas tanaman hortikultura yang telah terdaftar dan ber-SK Menteri Pertanian Republik Indonesia. Terintegrasi penuh dari basis data operasional PROSEED Kementan RI.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs tracking-wide shadow-sm transition-all hover:scale-[1.02] active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Tambah Varietas Ber-SK
            </button>
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs tracking-wide border border-white/20 transition-all"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs tracking-wide border border-white/20 transition-all"
            >
              <Printer className="w-4 h-4" />
              Cetak Dokumen
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards / Ringkasan Data Realtime */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Varietas</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Sprout className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{stats.total_all.toLocaleString('id-ID')}</span>
            <span className="text-xs text-emerald-600 font-medium">Varietas Terdaftar</span>
          </div>
          <p className="mt-1 text-xs text-slate-400">Database Resmi PROSEED</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tanaman Sayuran</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{stats.sayuran.toLocaleString('id-ID')}</span>
            <span className="text-xs text-blue-600 font-medium">
              {stats.total_all > 0 ? ((stats.sayuran / stats.total_all) * 100).toFixed(1) : 0}% Dominasi
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">Cabai, Tomat, Bawang, Jagung</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tanaman Buah</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{stats.buah.toLocaleString('id-ID')}</span>
            <span className="text-xs text-amber-600 font-medium">
              {stats.total_all > 0 ? ((stats.buah / stats.total_all) * 100).toFixed(1) : 0}% Porsi
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">Melon, Semangka, Mangga, Durian</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Flori & Biofarmaka</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{(stats.flori + stats.obat).toLocaleString('id-ID')}</span>
            <span className="text-xs text-purple-600 font-medium">
              {stats.total_all > 0 ? (((stats.flori + stats.obat) / stats.total_all) * 100).toFixed(1) : 0}% Porsi
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">Krisan, Anggrek, Jahe, Kunyit</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Box */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama varietas, nomor SK, komoditas, atau pemohon..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 bg-slate-50/50"
            />
          </div>

          {/* Filter Kategori */}
          <div className="md:col-span-3">
            <CustomDropdown
              label=""
              placeholder="Pilih Kategori"
              value={selectedKategori}
              onChange={(val) => {
                setSelectedKategori(val);
                setPage(1);
              }}
              options={[
                { label: 'Semua Kategori', value: 'Semua' },
                { label: 'Tanaman Sayuran', value: 'Tanaman Sayuran' },
                { label: 'Tanaman Buah', value: 'Tanaman Buah' },
                { label: 'Tanaman Florikultura', value: 'Tanaman Florikultura' },
                { label: 'Tanaman Obat / Biofarmaka', value: 'Tanaman Obat' },
              ]}
            />
          </div>

          {/* Filter Tahun */}
          <div className="md:col-span-2">
            <CustomDropdown
              label=""
              placeholder="Pilih Tahun"
              value={selectedTahun}
              onChange={(val) => {
                setSelectedTahun(val);
                setPage(1);
              }}
              options={[
                { label: 'Semua Tahun', value: 'Semua' },
                { label: 'Tahun 2026', value: '2026' },
                { label: 'Tahun 2025', value: '2025' },
                { label: 'Tahun 2024', value: '2024' },
                { label: 'Tahun 2023', value: '2023' },
                { label: 'Tahun 2022', value: '2022' },
                { label: 'Tahun 2021', value: '2021' },
                { label: 'Tahun 2020', value: '2020' },
              ]}
            />
          </div>

          {/* Limit Per Page */}
          <div className="md:col-span-2">
            <CustomDropdown
              label=""
              placeholder="Tampilkan"
              value={String(limit)}
              onChange={(val) => {
                setLimit(Number(val));
                setPage(1);
              }}
              options={[
                { label: '10 Data / Hal', value: '10' },
                { label: '20 Data / Hal', value: '20' },
                { label: '50 Data / Hal', value: '50' },
                { label: '100 Data / Hal', value: '100' },
              ]}
            />
          </div>
        </div>

        {/* Status Baris */}
        <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <div>
            Menampilkan <span className="font-semibold text-slate-900">{totalData > 0 ? (page - 1) * limit + 1 : 0}</span> -{' '}
            <span className="font-semibold text-slate-900">{Math.min(page * limit, totalData)}</span> dari{' '}
            <span className="font-semibold text-slate-900">{totalData.toLocaleString('id-ID')}</span> varietas hortikultura resmi
          </div>

          {(search || selectedKategori !== 'Semua' || selectedTahun !== 'Semua') && (
            <button
              onClick={() => {
                setSearch('');
                setSelectedKategori('Semua');
                setSelectedTahun('Semua');
                setPage(1);
              }}
              className="text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Tabel Data Varietas */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4 w-12 text-center">No</th>
                <th className="py-3.5 px-4 min-w-[170px]">Nama Varietas</th>
                <th className="py-3.5 px-4 min-w-[130px]">Komoditas</th>
                <th className="py-3.5 px-4 min-w-[140px]">Kategori</th>
                <th className="py-3.5 px-4 min-w-[200px]">Pemohon / Produsen</th>
                <th className="py-3.5 px-4 min-w-[190px]">Nomor SK Pelepasan</th>
                <th className="py-3.5 px-4 text-center w-20">Tahun</th>
                <th className="py-3.5 px-4 text-center w-24">Status</th>
                <th className="py-3.5 px-4 text-center w-36">Aksi (CRUD)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
                      <span>Memuat data varietas resmi Kementan...</span>
                    </div>
                  </td>
                </tr>
              ) : varieties.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Info className="w-8 h-8 text-slate-300" />
                      <span className="font-semibold text-slate-700">Tidak ada varietas yang sesuai pencarian.</span>
                      <span className="text-xs text-slate-400">Silakan ubah kata kunci atau tambah varietas baru.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                varieties.map((item, index) => {
                  const no = (page - 1) * limit + index + 1;
                  return (
                    <tr 
                      key={item.id} 
                      className="hover:bg-emerald-50/40 transition-colors cursor-pointer group"
                      onClick={() => setSelectedDetail(item)}
                    >
                      <td className="py-3.5 px-4 text-center font-medium text-slate-400">{no}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 group-hover:text-emerald-800 flex items-center gap-1.5">
                          {item.nama_varietas}
                        </div>
                        {item.no_reg && item.no_reg !== '-' && (
                          <span className="text-[10px] text-slate-400 font-mono">Reg: {item.no_reg}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-700">{item.komoditas}</td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          item.kategori.includes('Sayuran')
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : item.kategori.includes('Buah')
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : item.kategori.includes('Florikultura')
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {item.kategori}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        <div className="truncate max-w-[200px]" title={item.produsen}>
                          {item.produsen}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-700">
                        <div className="truncate max-w-[190px]" title={item.no_sk}>
                          {item.no_sk}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center font-semibold text-slate-800">
                        {item.tahun_daftar}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-semibold">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Terdaftar
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setSelectedDetail(item)}
                            title="Lihat Detail Varietas"
                            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                          >
                            <Info className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => handleOpenEdit(item, e)}
                            title="Edit Data SK Varietas"
                            className="p-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => handleOpenDelete(item, e)}
                            title="Hapus dari Database"
                            className="p-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50">
          <div className="text-xs text-slate-500">
            Halaman <span className="font-semibold text-slate-900">{page}</span> dari{' '}
            <span className="font-semibold text-slate-900">{totalPages}</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(1)}
              disabled={page <= 1}
              className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium text-slate-600"
            >
              Awal
            </button>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-600"
              title="Halaman Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Nomor Halaman */}
            <div className="px-3 py-1 text-xs font-semibold text-emerald-900 bg-emerald-100 rounded-lg">
              {page}
            </div>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-600"
              title="Halaman Selanjutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage(totalPages)}
              disabled={page >= totalPages}
              className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium text-slate-600"
            >
              Akhir
            </button>
          </div>
        </div>
      </div>

      {/* MODAL 1: FORM CREATE / EDIT VARIETAS (CRUD REAL) */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl">
            <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white p-5 rounded-t-2xl flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-amber-400">
                  {isEditMode ? <Edit className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {isEditMode ? 'Edit Data Varietas Ber-SK' : 'Tambah Varietas Terdaftar Baru'}
                  </h3>
                  <p className="text-[11px] text-emerald-200/90">
                    {isEditMode ? 'Perbarui data legalitas dan SK Menteri Pertanian' : 'Pencatatan varietas resmi ke basis data nasional PROSEED'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Nama Varietas <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: K1SM3 / Bejo / Petir"
                    value={formData.nama_varietas}
                    onChange={(e) => setFormData({ ...formData, nama_varietas: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Komoditas Tanaman
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Cabai Rawit / Melon"
                    value={formData.komoditas}
                    onChange={(e) => setFormData({ ...formData, komoditas: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Kelompok Kategori
                  </label>
                  <select
                    value={formData.kategori}
                    onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
                  >
                    <option value="Tanaman Sayuran">Tanaman Sayuran</option>
                    <option value="Tanaman Buah">Tanaman Buah</option>
                    <option value="Tanaman Florikultura">Tanaman Florikultura</option>
                    <option value="Tanaman Obat / Biofarmaka">Tanaman Obat / Biofarmaka</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Tahun Pendaftaran Resmi
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 2026"
                    value={formData.tahun_daftar}
                    onChange={(e) => setFormData({ ...formData, tahun_daftar: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Nomor SK Menteri Pertanian <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 25/Kpts/SR.130/D/I/2026"
                  value={formData.no_sk}
                  onChange={(e) => setFormData({ ...formData, no_sk: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Pemohon / Badan Usaha / Poktan
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: PT. East West Seed Indonesia"
                    value={formData.produsen}
                    onChange={(e) => setFormData({ ...formData, produsen: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Nomor Registrasi / Tanda Daftar (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: REG-HORTI-2026-0012"
                    value={formData.no_reg}
                    onChange={(e) => setFormData({ ...formData, no_reg: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Wilayah Adaptasi & Ketinggian (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Dataran Rendah hingga Menengah (100 - 600 mdpl)"
                  value={formData.wil_adaptasi}
                  onChange={(e) => setFormData({ ...formData, wil_adaptasi: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold transition-all disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{submitting ? 'Menyimpan...' : 'Simpan Data'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: DETAIL VARIETAS */}
      {selectedDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl">
            <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white p-6 rounded-t-2xl flex items-start justify-between">
              <div>
                <span className="text-[10px] font-semibold text-emerald-300 uppercase tracking-wider">
                  Detail Varietas Terdaftar Kementan RI
                </span>
                <h3 className="text-xl font-bold text-white mt-1 flex items-center gap-2">
                  <Sprout className="w-5 h-5 text-amber-400" />
                  {selectedDetail.nama_varietas}
                </h3>
                <p className="text-xs text-emerald-100/80 mt-0.5">
                  Komoditas: {selectedDetail.komoditas} ({selectedDetail.kategori})
                </p>
              </div>
              <button
                onClick={() => setSelectedDetail(null)}
                className="p-1 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] font-semibold text-slate-400 block">Nomor SK Menteri Pertanian</span>
                  <span className="text-sm font-bold text-slate-900 font-mono mt-0.5 block">{selectedDetail.no_sk}</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] font-semibold text-slate-400 block">Tahun Pendaftaran Resmi</span>
                  <span className="text-sm font-bold text-slate-900 mt-0.5 block">{selectedDetail.tahun_daftar}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-400 block">Pemohon / Produsen Terdaftar</span>
                <span className="text-sm font-semibold text-slate-900 mt-0.5 block flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-emerald-700" />
                  {selectedDetail.produsen}
                </span>
              </div>

              {selectedDetail.no_reg && selectedDetail.no_reg !== '-' && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] font-semibold text-slate-400 block">Nomor Registrasi / Tanda Daftar</span>
                  <span className="text-xs font-mono font-semibold text-slate-800 mt-0.5 block">{selectedDetail.no_reg}</span>
                </div>
              )}

              {selectedDetail.wil_adaptasi && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] font-semibold text-slate-400 block">Wilayah Adaptasi</span>
                  <span className="text-xs text-slate-700 mt-0.5 block">{selectedDetail.wil_adaptasi}</span>
                </div>
              )}

              {selectedDetail.tahan_opt && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] font-semibold text-slate-400 block">Ketahanan Hama / Penyakit (OPT)</span>
                  <span className="text-xs text-slate-700 mt-0.5 block">{selectedDetail.tahan_opt}</span>
                </div>
              )}

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1.5 text-emerald-800 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Status: Terverifikasi Kementerian Pertanian RI
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const item = selectedDetail;
                      setSelectedDetail(null);
                      handleOpenEdit(item, { stopPropagation: () => {} } as any);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold"
                  >
                    Edit SK
                  </button>
                  <button
                    onClick={() => setSelectedDetail(null)}
                    className="px-4 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: KONFIRMASI HAPUS */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-2xl text-xs space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">Konfirmasi Hapus Varietas</h3>
              <p className="text-slate-500">
                Apakah Anda yakin ingin menghapus varietas <strong className="text-slate-800">{deleteTarget.nama_varietas}</strong> dengan Nomor SK <span className="font-mono text-slate-700">{deleteTarget.no_sk}</span>?
              </p>
              <p className="text-[11px] text-rose-600 font-medium pt-1">
                Tindakan ini akan menghapus data dari arsip resmi kementerian.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-medium hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={submitting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold disabled:opacity-50"
              >
                {submitting ? 'Menghapus...' : 'Ya, Hapus Data'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
