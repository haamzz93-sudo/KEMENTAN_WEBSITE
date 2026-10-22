'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Building2, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Printer, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Save, 
  FileSpreadsheet,
  Upload,
  FileText,
  Eye,
  Check,
  Calendar,
  Layers,
  MapPin
} from 'lucide-react';
import { PROVINCES_INDONESIA, COMMODITIES_BY_CATEGORY, INITIAL_PRODUCERS, getStoredCommodities, saveStoredCommodities } from '@/data/masterData';
import { ProducerDistributor, SeedUnit } from '@/types';

export default function ProducerDistributorPage() {
  const [producers, setProducers] = useState<ProducerDistributor[]>(INITIAL_PRODUCERS);
  const [selectedProvince, setSelectedProvince] = useState<string>('Semua');
  const [filterRole, setFilterRole] = useState<'semua' | 'produsen' | 'pengedar'>('semua');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dynamic master commodities
  const [commoditiesData, setCommoditiesData] = useState(COMMODITIES_BY_CATEGORY);

  useEffect(() => {
    setCommoditiesData(getStoredCommodities());
    const handleCommoditySync = () => {
      setCommoditiesData(getStoredCommodities());
    };
    window.addEventListener('master_commodities_updated', handleCommoditySync);
    return () => window.removeEventListener('master_commodities_updated', handleCommoditySync);
  }, []);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedCertViewer, setSelectedCertViewer] = useState<{ name: string; certNumber: string; file?: string } | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    businessName: '',
    ownerName: '',
    roleType: 'produsen' as 'produsen' | 'pengedar',
    competencyCertNumber: '',
    certExpiryDate: '',
    province: 'Jawa Barat',
    regency: '',
    address: '',
    phone: '',
    commodity: 'Cabai Merah',
    variety: '',
    landAreaHa: 1.0,
    annualCapacity: 10000,
    unit: 'kg' as SeedUnit,
    applicationType: 'baru' as 'baru' | 'perpanjangan',
    competencyCertFile: ''
  });

  // Import State
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importPreviewData, setImportPreviewData] = useState<any[]>([]);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'landAreaHa' || name === 'annualCapacity' ? Number(value) : value
    }));
  };

  const handleCertFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Ukuran file maksimal 5 MB.');
        return;
      }
      setFormData(prev => ({
        ...prev,
        competencyCertFile: file.name
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.businessName || !formData.competencyCertNumber) {
      alert('Mohon lengkapi Nama Badan Usaha dan Nomor Sertifikat Kompetensi.');
      return;
    }

    const newEntry: ProducerDistributor & { competencyCertFile?: string } = {
      id: `prod-${Date.now()}`,
      regNumber: `REG-BPSB-${formData.province.slice(0, 2).toUpperCase()}-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      businessName: formData.businessName,
      ownerName: formData.ownerName || 'Pimpinan Usaha',
      roleType: formData.roleType,
      competencyCertNumber: formData.competencyCertNumber,
      certExpiryDate: formData.certExpiryDate || '2028-12-31',
      province: formData.province,
      regency: formData.regency || 'Wilayah BPSB',
      address: formData.address,
      phone: formData.phone,
      commodity: formData.commodity,
      variety: formData.variety || 'Varietas Unggul',
      landAreaHa: formData.landAreaHa,
      annualCapacity: formData.annualCapacity,
      unit: formData.unit,
      applicationType: formData.applicationType,
      status: 'aktif',
      createdAt: new Date().toISOString().split('T')[0],
      competencyCertFile: formData.competencyCertFile || 'sertifikat_kompetensi_resmi.pdf'
    };

    setProducers([newEntry, ...producers]);
    setIsModalOpen(false);
    setSuccessToast(`Data ${newEntry.businessName} berhasil disimpan ke basis data terpusat.`);
    setTimeout(() => setSuccessToast(null), 4000);

    // Reset Form
    setFormData({
      businessName: '',
      ownerName: '',
      roleType: 'produsen',
      competencyCertNumber: '',
      certExpiryDate: '',
      province: 'Jawa Barat',
      regency: '',
      address: '',
      phone: '',
      commodity: 'Cabai Merah',
      variety: '',
      landAreaHa: 1.0,
      annualCapacity: 10000,
      unit: 'kg',
      applicationType: 'baru',
      competencyCertFile: ''
    });
  };

  // EXPORT EXCEL 12 KOLOM RESMI DITJEN HORTIKULTURA
  const handleExportExcel = () => {
    const headers = [
      'No. Registrasi BPSB',
      'Nama Badan Usaha / Produsen',
      'Nama Penanggung Jawab',
      'Peran (Produsen/Pengedar)',
      'Nomor Sertifikat Kompetensi',
      'Masa Berlaku Sertifikat',
      'Wilayah Provinsi',
      'Kabupaten / Kota',
      'Komoditas & Varietas Utama',
      'Luas Lahan (Ha)',
      'Kapasitas Produksi Tahunan',
      'Satuan & Status Legalitas'
    ];

    const rows = filteredData.map((item, idx) => [
      `"${item.regNumber}"`,
      `"${item.businessName.replace(/"/g, '""')}"`,
      `"${item.ownerName.replace(/"/g, '""')}"`,
      `"${item.roleType.toUpperCase()}"`,
      `"${item.competencyCertNumber}"`,
      `"${item.certExpiryDate}"`,
      `"${item.province}"`,
      `"${item.regency}"`,
      `"${item.commodity} (${item.variety})"`,
      item.landAreaHa,
      item.annualCapacity,
      `"${item.unit} - ${item.status.toUpperCase()}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `DATA_PRODUSEN_PENGEDAR_HORTI_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setSuccessToast('Ekspor data rekapitulasi produsen 12 kolom berhasil diunduh.');
    setTimeout(() => setSuccessToast(null), 4000);
  };

  // DOWNLOAD TEMPLATE IMPORT
  const handleDownloadTemplate = () => {
    const templateHeaders = [
      'Nama Badan Usaha / Poktan',
      'Nama Penanggung Jawab',
      'Peran (produsen/pengedar)',
      'Nomor Sertifikat Kompetensi',
      'Masa Berlaku (YYYY-MM-DD)',
      'Provinsi',
      'Kabupaten / Kota',
      'Alamat',
      'No Telepon',
      'Komoditas',
      'Varietas',
      'Luas Lahan Ha',
      'Kapasitas Tahunan',
      'Satuan (kg/batang/knol)'
    ];

    const sampleRow = [
      'PT Contoh Benih Unggul',
      'H. Ahmad Syarif',
      'produsen',
      '998/BPSB-JTM/SERT-KOMP/2026',
      '2028-12-31',
      'Jawa Timur',
      'Kabupaten Nganjuk',
      'Jl. Raya Pertanian No. 45',
      '081234567890',
      'Bawang Merah',
      'Tajuk',
      '2.5',
      '15000',
      'kg'
    ];

    const csvContent = '\uFEFF' + [templateHeaders.join(','), sampleRow.join(',')].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'TEMPLATE_IMPORT_DATABASE_PRODUSEN_BPSB.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // PARSE IMPORT FILE
  const handleFileImportChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFile(file);
    setImportError(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target?.result as string;
        const lines = text.split(/\r\n|\n/).filter(l => l.trim().length > 0);
        if (lines.length < 2) {
          setImportError('File kosong atau format tidak sesuai template.');
          return;
        }

        const parsed: any[] = [];
        // skip header line
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map(c => c.replace(/^"|"$/g, '').trim());
          if (cols.length >= 6 && cols[0]) {
            parsed.push({
              businessName: cols[0],
              ownerName: cols[1] || 'Pimpinan Usaha',
              roleType: (cols[2]?.toLowerCase() === 'pengedar' ? 'pengedar' : 'produsen'),
              competencyCertNumber: cols[3] || `SERT-${Math.floor(1000 + Math.random()*9000)}`,
              certExpiryDate: cols[4] || '2028-12-31',
              province: cols[5] || 'Jawa Timur',
              regency: cols[6] || 'Kabupaten Madiun',
              address: cols[7] || 'Wilayah Binaan BPSB',
              phone: cols[8] || '0812xxxxxxxx',
              commodity: cols[9] || 'Cabai Merah',
              variety: cols[10] || 'Unggul Lokal',
              landAreaHa: Number(cols[11]) || 1.0,
              annualCapacity: Number(cols[12]) || 10000,
              unit: (cols[13] as SeedUnit) || 'kg'
            });
          }
        }

        setImportPreviewData(parsed);
      } catch (err) {
        setImportError('Gagal memproses file. Pastikan berformat CSV sesuai template baku.');
      }
    };
    reader.readAsText(file);
  };

  const handleExecuteImport = () => {
    if (importPreviewData.length === 0) {
      alert('Tidak ada data valid untuk diimpor.');
      return;
    }

    const newRows: ProducerDistributor[] = importPreviewData.map((d, idx) => ({
      id: `imported-${Date.now()}-${idx}`,
      regNumber: `REG-BPSB-${d.province.slice(0, 2).toUpperCase()}-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      businessName: d.businessName,
      ownerName: d.ownerName,
      roleType: d.roleType,
      competencyCertNumber: d.competencyCertNumber,
      certExpiryDate: d.certExpiryDate,
      province: d.province,
      regency: d.regency,
      address: d.address,
      phone: d.phone,
      commodity: d.commodity,
      variety: d.variety,
      landAreaHa: d.landAreaHa,
      annualCapacity: d.annualCapacity,
      unit: d.unit,
      applicationType: 'baru',
      status: 'aktif',
      createdAt: new Date().toISOString().split('T')[0],
      competencyCertFile: 'sertifikat_impor_database.pdf'
    }));

    setProducers([...newRows, ...producers]);
    setIsImportModalOpen(false);
    setImportFile(null);
    setImportPreviewData([]);
    setSuccessToast(`Berhasil mengimpor ${newRows.length} data produsen ke basis data BPSB.`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  // Filtered List
  const filteredData = producers.filter(item => {
    const matchProvince = selectedProvince === 'Semua' || item.province === selectedProvince;
    const matchRole = filterRole === 'semua' || item.roleType === filterRole;
    const matchSearch = item.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        item.competencyCertNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        item.commodity.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        item.regNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchProvince && matchRole && matchSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-xl bg-slate-900 text-white shadow-xl flex items-center space-x-3 border border-emerald-500 animate-slideUp">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{successToast}</span>
        </div>
      )}

      {/* Page Header (MODUL A: Data Produsen dan Pengedar) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-200 gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-emerald-700 font-bold uppercase tracking-wider">
            <Building2 className="w-4 h-4" />
            <span>MODUL A &bull; DIREKTORAT PERBENIHAN HORTIKULTURA</span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl text-slate-900 mt-1">
            Data Produsen dan Pengedar
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Basis data terpusat produsen dan pengedar berizin 38 BPSB Provinsi, pembaharuan legalitas kompetensi, dan kapasitas produksi nasional.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Export Excel Resmi */}
          <button
            onClick={handleExportExcel}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl bg-white text-slate-700 text-xs font-semibold border border-slate-200 shadow-2xs hover:bg-slate-50 transition-colors"
            title="Ekspor Format 12 Kolom Resmi Ditjen Hortikultura"
          >
            <Download className="w-4 h-4 text-emerald-700" />
            <span>Ekspor Excel</span>
          </button>

          {/* Import Database Produsen */}
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl bg-white text-slate-700 text-xs font-semibold border border-slate-200 shadow-2xs hover:bg-slate-50 transition-colors"
            title="Impor Database Produsen dari Excel/CSV yang Sudah Ada"
          >
            <Upload className="w-4 h-4 text-blue-700" />
            <span>Import Database</span>
          </button>

          {/* Entri Data Baru */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-emerald-800 text-white text-xs font-bold shadow-sm hover:bg-emerald-700 transition-all"
          >
            <Plus className="w-4 h-4 text-emerald-300" />
            <span>Entri Data Baru</span>
          </button>
        </div>
      </div>

      {/* Statistical Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Total Terdata</span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">{producers.length} Unit</span>
          <span className="text-[10px] text-emerald-700 font-semibold">BPSB Wilayah</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Produsen Aktif</span>
          <span className="text-2xl font-black text-emerald-700 mt-1 block">
            {producers.filter(p => p.roleType === 'produsen').length}
          </span>
          <span className="text-[10px] text-slate-500 font-medium">Penangkar Benih</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Pengedar Berizin</span>
          <span className="text-2xl font-black text-amber-700 mt-1 block">
            {producers.filter(p => p.roleType === 'pengedar').length}
          </span>
          <span className="text-[10px] text-slate-500 font-medium">Distributor Resmi</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Kapasitas Tahunan</span>
          <span className="text-2xl font-black text-emerald-800 mt-1 block">
            {(producers.reduce((acc, p) => acc + p.annualCapacity, 0) / 1000).toFixed(1)} Ton
          </span>
          <span className="text-[10px] text-emerald-700 font-semibold">Potensi Panen</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          
          {/* Search Field */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama badan usaha, nomor sertifikat, atau varietas..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none transition-all"
            />
          </div>

          {/* Province Filter */}
          <div className="md:col-span-4">
            <select
              value={selectedProvince}
              onChange={(e) => setSelectedProvince(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none bg-white transition-all font-medium"
            >
              <option value="Semua">Semua Provinsi (38 BPSB Wilayah)</option>
              {PROVINCES_INDONESIA.map(prov => (
                <option key={prov} value={prov}>{prov}</option>
              ))}
            </select>
          </div>

          {/* Role Filter */}
          <div className="md:col-span-3 flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80">
            {(['semua', 'produsen', 'pengedar'] as const).map(role => (
              <button
                key={role}
                onClick={() => setFilterRole(role)}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg capitalize transition-all ${
                  filterRole === role
                    ? 'bg-white text-emerald-900 shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {role}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Badan Usaha / Poktan</th>
                <th className="py-3 px-4">Peran & Wilayah</th>
                <th className="py-3 px-4">No. Sertifikat Kompetensi</th>
                <th className="py-3 px-4">Komoditas & Varietas</th>
                <th className="py-3 px-4 text-right">Luas (Ha)</th>
                <th className="py-3 px-4 text-right">Kapasitas / Thn</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Sertifikat</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    Tidak ada data produsen/pengedar yang cocok dengan filter yang dipilih.
                  </td>
                </tr>
              ) : (
                filteredData.map((item: any) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{item.businessName}</div>
                      <div className="text-[11px] text-slate-500">Pimpinan: {item.ownerName} &bull; {item.phone}</div>
                      <div className="text-[10px] font-mono text-emerald-800 mt-0.5">{item.regNumber}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
                        item.roleType === 'produsen' 
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                          : 'bg-amber-100 text-amber-900 border border-amber-200'
                      }`}>
                        {item.roleType}
                      </span>
                      <div className="text-[11px] text-slate-700 font-medium mt-1">{item.province}</div>
                      <div className="text-[10px] text-slate-400">{item.regency}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-mono text-xs font-semibold text-slate-800">{item.competencyCertNumber}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        Berlaku s/d: <span className="font-semibold text-slate-700">{item.certExpiryDate}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-800">{item.commodity}</div>
                      <div className="text-[11px] text-slate-500">Var: {item.variety}</div>
                    </td>

                    <td className="py-3.5 px-4 text-right font-semibold text-slate-800">
                      {item.landAreaHa.toLocaleString('id-ID')} Ha
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <span className="font-bold text-slate-900">
                        {item.annualCapacity.toLocaleString('id-ID')}
                      </span>
                      <span className="text-[10px] text-slate-500 ml-1">{item.unit}</span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        item.status === 'aktif' 
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'aktif' ? 'bg-emerald-600' : 'bg-amber-600'}`}></span>
                        <span>{item.status === 'aktif' ? 'Aktif' : 'Perpanjangan'}</span>
                      </span>
                    </td>

                    {/* Tombol Lihat Sertifikat */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => setSelectedCertViewer({
                          name: item.businessName,
                          certNumber: item.competencyCertNumber,
                          file: item.competencyCertFile || 'sertifikat_kompetensi_bpsb.pdf'
                        })}
                        className="inline-flex items-center space-x-1 px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-semibold transition-colors"
                        title="Tinjau Berkas Sertifikat Kompetensi"
                      >
                        <FileText className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Lihat Berkas</span>
                      </button>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => alert(`Mencetak Lembar Legitimasi Produsen Resmi: ${item.businessName}`)}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-emerald-800 hover:bg-slate-100 transition-colors"
                        title="Cetak Surat Legitimasi BPSB"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL LIHAT SERTIFIKAT KOMPETENSI */}
      {selectedCertViewer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center space-x-2 text-emerald-800 font-bold text-xs">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span>Dokumen Sertifikat Kompetensi BPSB</span>
              </div>
              <button 
                onClick={() => setSelectedCertViewer(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <div className="text-xs text-slate-500">Nama Produsen / Badan Usaha:</div>
              <div className="text-sm font-bold text-slate-900">{selectedCertViewer.name}</div>
              <div className="text-xs text-slate-500 pt-2">Nomor Sertifikat:</div>
              <div className="text-xs font-mono font-bold text-emerald-800">{selectedCertViewer.certNumber}</div>
              <div className="text-xs text-slate-500 pt-2">File Terlampir:</div>
              <div className="text-xs font-semibold text-slate-700 flex items-center space-x-1.5">
                <FileText className="w-4 h-4 text-emerald-600" />
                <span>{selectedCertViewer.file || 'sertifikat_kompetensi_resmi.pdf'}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-900 flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Sertifikat kompetensi ini telah diverifikasi keabsahannya oleh BPSB wilayah sesuai ketentuan regulasi perbenihan hortikultura.</span>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedCertViewer(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => {
                  alert(`Mengunduh dokumen: ${selectedCertViewer.file}`);
                  setSelectedCertViewer(null);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold flex items-center space-x-1.5"
              >
                <Download className="w-4 h-4" />
                <span>Unduh Berkas Asli</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL IMPORT DATABASE PRODUSEN (EXCEL / CSV) */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50 rounded-t-2xl">
              <div>
                <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block">
                  BPSB &bull; IMPORT DATA MASSAL
                </span>
                <h3 className="font-heading font-extrabold text-base text-slate-900">
                  Import Database Produsen & Pengedar Eksisting
                </h3>
              </div>
              <button
                onClick={() => { setIsImportModalOpen(false); setImportFile(null); setImportPreviewData([]); }}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 space-y-2">
                <div className="font-bold flex items-center space-x-1.5">
                  <FileSpreadsheet className="w-4 h-4 text-blue-700" />
                  <span>Petunjuk Import Database:</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Gunakan fitur ini untuk memasukkan data produsen yang sudah tercatat pada database lokal BPSB sekaligus. 
                  Pastikan format kolom sesuai dengan template resmi Direktorat Perbenihan Hortikultura.
                </p>
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-700 text-white font-bold text-[11px] hover:bg-blue-800 transition-colors shadow-2xs mt-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh Template Baku Excel / CSV</span>
                </button>
              </div>

              {/* Upload Box */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Pilih File Database Excel / CSV (.csv) *
                </label>
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-5 text-center hover:border-emerald-500 transition-colors bg-slate-50/50">
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <input
                    type="file"
                    accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                    onChange={handleFileImportChange}
                    className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-100 file:text-emerald-800 hover:file:bg-emerald-200 cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-400 block mt-2">Mendukung format CSV / Excel diekspor sebagai CSV.</span>
                </div>
              </div>

              {importError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{importError}</span>
                </div>
              )}

              {/* Data Preview */}
              {importPreviewData.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                    <span>Pratinjau Data ({importPreviewData.length} baris terdeteksi):</span>
                  </div>
                  <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-[11px] text-left">
                      <thead className="bg-slate-100 text-slate-600 font-bold sticky top-0">
                        <tr>
                          <th className="py-2 px-3">Badan Usaha</th>
                          <th className="py-2 px-3">Wilayah</th>
                          <th className="py-2 px-3">Komoditas</th>
                          <th className="py-2 px-3 text-right">Kapasitas</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {importPreviewData.map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="py-1.5 px-3 font-semibold">{row.businessName}</td>
                            <td className="py-1.5 px-3 text-slate-600">{row.province}</td>
                            <td className="py-1.5 px-3 text-slate-600">{row.commodity}</td>
                            <td className="py-1.5 px-3 text-right">{row.annualCapacity} {row.unit}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => { setIsImportModalOpen(false); setImportFile(null); setImportPreviewData([]); }}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-600 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={importPreviewData.length === 0}
                  onClick={handleExecuteImport}
                  className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-blue-800 hover:bg-blue-700 disabled:opacity-50 text-white font-bold shadow transition-all"
                >
                  <Save className="w-4 h-4 text-blue-200" />
                  <span>Simpan ke Database Terpusat ({importPreviewData.length})</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* MODAL INPUT MANUAL DATA PRODUSEN / PENGEDAR */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 transition-colors">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50 rounded-t-2xl">
              <div>
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                  BPSB PROVINSI &bull; INPUT FORM
                </span>
                <h3 className="font-heading font-extrabold text-base text-slate-900">
                  Entri Pelaporan Produsen / Pengedar Benih
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Peran Usaha */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status Peran Usaha *</label>
                  <select
                    name="roleType"
                    value={formData.roleType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 text-xs outline-none"
                  >
                    <option value="produsen">Produsen Benih (Penangkar)</option>
                    <option value="pengedar">Pengedar Benih (Distributor)</option>
                  </select>
                </div>

                {/* Jenis Pengajuan */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status Pengajuan *</label>
                  <select
                    name="applicationType"
                    value={formData.applicationType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 text-xs outline-none"
                  >
                    <option value="baru">Pengajuan Baru</option>
                    <option value="perpanjangan">Perpanjangan Sertifikat</option>
                  </select>
                </div>

                {/* Nama Badan Usaha */}
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Nama Kelompok Tani / Badan Usaha (PT/CV/UPBS) *</label>
                  <input
                    type="text"
                    name="businessName"
                    required
                    value={formData.businessName}
                    onChange={handleInputChange}
                    placeholder="Contoh: PT Agro Horti Sejahtera / Poktan Subur Makmur"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 text-xs outline-none"
                  />
                </div>

                {/* Nama Pemilik / Pimpinan */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nama Pemilik / Pimpinan *</label>
                  <input
                    type="text"
                    name="ownerName"
                    required
                    value={formData.ownerName}
                    onChange={handleInputChange}
                    placeholder="Nama lengkap pimpinan"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 text-xs outline-none"
                  />
                </div>

                {/* No Telepon */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nomor Telepon / WhatsApp *</label>
                  <input
                    type="text"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="0812-xxxx-xxxx"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 text-xs outline-none"
                  />
                </div>

                {/* Nomor Sertifikat Kompetensi */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nomor Sertifikat Kompetensi *</label>
                  <input
                    type="text"
                    name="competencyCertNumber"
                    required
                    value={formData.competencyCertNumber}
                    onChange={handleInputChange}
                    placeholder="Contoh: 144/BPSB-JB/SERT-KOMP/2025"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 font-mono placeholder:text-slate-400 text-xs outline-none"
                  />
                </div>

                {/* Tanggal Masa Berlaku */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Masa Berlaku Sertifikat *</label>
                  <input
                    type="date"
                    name="certExpiryDate"
                    required
                    value={formData.certExpiryDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 text-xs outline-none"
                  />
                </div>

                {/* Upload Berkas Sertifikat */}
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Upload Dokumen Sertifikat Kompetensi (PDF / JPG, Maks 5 MB) *
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleCertFileUpload}
                    className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-100 file:text-emerald-800 hover:file:bg-emerald-200 cursor-pointer border border-slate-300 rounded-lg p-1.5"
                  />
                  {formData.competencyCertFile && (
                    <span className="text-[11px] text-emerald-700 font-medium mt-1 block">
                      Berkas terpilih: {formData.competencyCertFile}
                    </span>
                  )}
                </div>

                {/* Provinsi */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Provinsi (Wilayah BPSB) *</label>
                  <select
                    name="province"
                    value={formData.province}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 text-xs outline-none"
                  >
                    {PROVINCES_INDONESIA.map(prov => (
                      <option key={prov} value={prov}>{prov}</option>
                    ))}
                  </select>
                </div>

                {/* Kabupaten / Kota */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kabupaten / Kota *</label>
                  <input
                    type="text"
                    name="regency"
                    required
                    value={formData.regency}
                    onChange={handleInputChange}
                    placeholder="Contoh: Kabupaten Cianjur"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 text-xs outline-none"
                  />
                </div>

                {/* Alamat Lengkap */}
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Alamat Kebun / Kantor Operasional *</label>
                  <textarea
                    name="address"
                    rows={2}
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Alamat lengkap lokasi perbenihan..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 text-xs outline-none"
                  />
                </div>

                {/* Komoditas */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Komoditas Hortikultura *</label>
                  <select
                    name="commodity"
                    value={formData.commodity}
                    onChange={(e) => {
                      const selected = e.target.value;
                      // Find default unit
                      let foundUnit: SeedUnit = 'kg';
                      for (const cat of ['sayuran', 'buah', 'hias', 'obat'] as const) {
                        const item = (commoditiesData[cat] || []).find(c => c.name === selected);
                        if (item) {
                          foundUnit = (item.unit as SeedUnit) || 'kg';
                          break;
                        }
                      }
                      setFormData(prev => ({ ...prev, commodity: selected, unit: foundUnit }));
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 text-xs outline-none"
                  >
                    <optgroup label="Tanaman Sayuran (Hortikultura Pangan)">
                      {(commoditiesData.sayuran || COMMODITIES_BY_CATEGORY.sayuran).map(c => (
                        <option key={c.name} value={c.name}>[Sayur] {c.name}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Tanaman Buah (Hortikultura Buah Tropika)">
                      {(commoditiesData.buah || COMMODITIES_BY_CATEGORY.buah).map(c => (
                        <option key={c.name} value={c.name}>[Buah] {c.name}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Tanaman Hias (Florikultura)">
                      {(commoditiesData.hias || COMMODITIES_BY_CATEGORY.hias).map(c => (
                        <option key={c.name} value={c.name}>[Hias] {c.name}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Tanaman Obat (Biofarmaka)">
                      {(commoditiesData.obat || COMMODITIES_BY_CATEGORY.obat).map(c => (
                        <option key={c.name} value={c.name}>[Obat] {c.name}</option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                {/* Varietas */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Varietas yang Dibudidayakan</label>
                  <input
                    type="text"
                    name="variety"
                    value={formData.variety}
                    onChange={handleInputChange}
                    placeholder="Contoh: Tanjung-2 / Bima Brebes"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 text-xs outline-none"
                  />
                </div>

                {/* Luas Lahan (Ha) */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Luas Lahan Aktif (Hektar) *</label>
                  <input
                    type="number"
                    step="0.1"
                    name="landAreaHa"
                    value={formData.landAreaHa}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 text-xs outline-none"
                  />
                </div>

                {/* Kapasitas per Tahun */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kapasitas Produksi / Tahun *</label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      name="annualCapacity"
                      value={formData.annualCapacity}
                      onChange={handleInputChange}
                      className="flex-1 px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 text-xs outline-none"
                    />
                    <select
                      name="unit"
                      value={formData.unit}
                      onChange={handleInputChange}
                      className="w-24 px-2 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 text-xs outline-none"
                    >
                      <option value="kg">kg</option>
                      <option value="batang">batang</option>
                      <option value="knol">knol</option>
                      <option value="planlet">planlet</option>
                      <option value="stek">stek</option>
                      <option value="anakan">anakan</option>
                    </select>
                  </div>
                </div>

              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-600 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold shadow transition-all"
                >
                  <Save className="w-4 h-4 text-emerald-400" />
                  <span>Simpan Data BPSB</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
