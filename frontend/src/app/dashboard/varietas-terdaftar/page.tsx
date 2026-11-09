'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Sprout, 
  Search, 
  Filter, 
  Download, 
  FileText, 
  CheckCircle2, 
  Building2, 
  ChevronLeft, 
  ChevronRight, 
  Info, 
  X, 
  Layers, 
  Calendar,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Printer
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
  const [selectedDetail, setSelectedDetail] = useState<RegisteredVarietyItem | null>(null);

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

  // Reset page when filter changes
  const handleKategoriChange = (val: string) => {
    setSelectedKategori(val);
    setPage(1);
  };

  const handleTahunChange = (val: string) => {
    setSelectedTahun(val);
    setPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (!varieties.length) return;
    const headers = ['No', 'Nama Varietas', 'Komoditas', 'Kategori', 'Produsen / Pemohon', 'Nomor SK', 'Tahun Terdaftar'];
    const rows = varieties.map((v, i) => [
      (page - 1) * limit + i + 1,
      `"${v.nama_varietas.replace(/"/g, '""')}"`,
      `"${v.komoditas.replace(/"/g, '""')}"`,
      `"${v.kategori.replace(/"/g, '""')}"`,
      `"${v.produsen.replace(/"/g, '""')}"`,
      `"${v.no_sk.replace(/"/g, '""')}"`,
      `"${v.tahun_daftar}"`
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

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold text-xs tracking-wide shadow-sm transition-all"
            >
              <Download className="w-4 h-4" />
              Export Halaman (CSV)
            </button>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs tracking-wide border border-white/20 transition-all"
            >
              <Printer className="w-4 h-4" />
              Cetak Dokumen
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards / Ringkasan Data */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Varietas</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Sprout className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">4.009</span>
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
            <span className="text-2xl font-bold text-slate-900">2.504</span>
            <span className="text-xs text-blue-600 font-medium">62.5% Dominasi</span>
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
            <span className="text-2xl font-bold text-slate-900">1.105</span>
            <span className="text-xs text-amber-600 font-medium">27.6% Porsi</span>
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
            <span className="text-2xl font-bold text-slate-900">400</span>
            <span className="text-xs text-purple-600 font-medium">9.9% Porsi</span>
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
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 bg-slate-50/50"
            />
          </div>

          {/* Filter Kategori */}
          <div className="md:col-span-3">
            <CustomDropdown
              label=""
              placeholder="Pilih Kategori"
              value={selectedKategori}
              onChange={handleKategoriChange}
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
              onChange={handleTahunChange}
              options={[
                { label: 'Semua Tahun', value: 'Semua' },
                { label: 'Tahun 2024', value: '2024' },
                { label: 'Tahun 2023', value: '2023' },
                { label: 'Tahun 2022', value: '2022' },
                { label: 'Tahun 2021', value: '2021' },
                { label: 'Tahun 2020', value: '2020' },
                { label: 'Tahun 2019', value: '2019' },
                { label: 'Tahun 2018', value: '2018' },
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
                <th className="py-3.5 px-4 min-w-[180px]">Nama Varietas</th>
                <th className="py-3.5 px-4 min-w-[140px]">Komoditas</th>
                <th className="py-3.5 px-4 min-w-[150px]">Kategori</th>
                <th className="py-3.5 px-4 min-w-[220px]">Pemohon / Produsen</th>
                <th className="py-3.5 px-4 min-w-[200px]">Nomor SK Pelepasan</th>
                <th className="py-3.5 px-4 text-center w-24">Tahun</th>
                <th className="py-3.5 px-4 text-center w-28">Status</th>
                <th className="py-3.5 px-4 text-center w-28">Aksi</th>
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
                      <span className="text-xs text-slate-400">Silakan ubah kata kunci atau reset filter di atas.</span>
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
                        <div className="truncate max-w-[220px]" title={item.produsen}>
                          {item.produsen}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-700">
                        <div className="truncate max-w-[200px]" title={item.no_sk}>
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
                        <button
                          onClick={() => setSelectedDetail(item)}
                          className="px-2.5 py-1 text-[11px] rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold transition-colors"
                        >
                          Detail
                        </button>
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

      {/* Modal Detail Varietas Terdaftar */}
      {selectedDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl">
            {/* Modal Header */}
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

            {/* Modal Body */}
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
                <button
                  onClick={() => setSelectedDetail(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
