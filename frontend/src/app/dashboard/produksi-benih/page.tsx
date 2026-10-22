'use client';

import React, { useState, useEffect } from 'react';
import { 
  Sprout, 
  Plus, 
  Calculator, 
  Download, 
  FileSpreadsheet, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  Save, 
  Filter,
  ArrowDownUp,
  Layers,
  Building2,
  Calendar,
  ShieldCheck,
  FileText,
  Upload,
  Lock,
  UserCheck
} from 'lucide-react';
import { PROVINCES_INDONESIA, COMMODITIES_BY_CATEGORY, INITIAL_SEED_PRODUCTIONS, INITIAL_PRODUCERS, getStoredCommodities, saveStoredCommodities } from '@/data/masterData';
import { MonthlySeedProduction, PlantCategory, SeedClass, SeedUnit, UserRole } from '@/types';

export default function SeedProductionBalancePage() {
  const [productions, setProductions] = useState<MonthlySeedProduction[]>(INITIAL_SEED_PRODUCTIONS);
  const [selectedCategory, setSelectedCategory] = useState<PlantCategory | 'semua'>('semua');
  const [selectedEntity, setSelectedEntity] = useState<'semua' | 'BPSB' | 'LSSM'>('semua');
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-09');
  
  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReportViewer, setSelectedReportViewer] = useState<{ commodity: string; entity: string; month: string; file?: string } | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // User session
  const [currentUserRole, setCurrentRole] = useState<UserRole>('super_admin');
  const [currentUserName, setCurrentUserName] = useState<string>('Direktorat Perbenihan');
  const [currentAgency, setCurrentAgency] = useState<string>('Kementerian Pertanian');
  
  // Dynamic master commodities
  const [commoditiesData, setCommoditiesData] = useState(COMMODITIES_BY_CATEGORY);

  // Is custom commodity enabled
  const [isCustomCommodity, setIsCustomCommodity] = useState(false);
  const [customCommodityName, setCustomCommodityName] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    reportingMonth: '2026-09',
    reportingEntity: 'BPSB' as 'BPSB' | 'LSSM',
    reporterName: 'BPSB Jawa Timur',
    selectedProducerId: 'prod-01',
    customProducerName: '',
    province: 'Jawa Timur',
    regency: 'Kabupaten Cianjur',
    category: 'sayuran' as PlantCategory,
    commodity: 'Cabai Merah',
    variety: 'Tanjung-2',
    seedClass: 'BP' as SeedClass,
    unit: 'kg' as SeedUnit,
    previousStock: 1000,
    currentProduction: 500,
    distribution: 300,
    signedReportFile: ''
  });

  useEffect(() => {
    setCommoditiesData(getStoredCommodities());
    const handleCommoditySync = () => {
      setCommoditiesData(getStoredCommodities());
    };
    window.addEventListener('master_commodities_updated', handleCommoditySync);
    return () => window.removeEventListener('master_commodities_updated', handleCommoditySync);
  }, []);

  useEffect(() => {
    try {
      const savedRole = localStorage.getItem('sim_benih_role') as UserRole;
      const savedUser = localStorage.getItem('sim_benih_user');
      if (savedRole) setCurrentRole(savedRole);
      if (savedUser) {
        const u = JSON.parse(savedUser);
        setCurrentUserName(u.name || u.username || 'Pengguna');
        setCurrentAgency(u.agency_name || 'BPSB Jawa Timur');
        
        // Auto-set reporter
        if (savedRole === 'bpsb') {
          setFormData(prev => ({
            ...prev,
            reportingEntity: 'BPSB',
            reporterName: u.agency_name || 'BPSB Jawa Timur',
            province: 'Jawa Timur'
          }));
        } else if (savedRole === 'applicant') {
          setFormData(prev => ({
            ...prev,
            reportingEntity: 'LSSM',
            reporterName: u.agency_name || 'PT Produsen Benih SMM',
            selectedProducerId: 'self'
          }));
        }
      }
    } catch {}
  }, []);

  // Check input permission: Only BPSB, SMM Producer (applicant), or super_admin
  const canInputProduction = ['super_admin', 'bpsb', 'applicant'].includes(currentUserRole);

  // Realtime calculated remaining stock
  const calculatedTotalAvailable = formData.previousStock + formData.currentProduction;
  const calculatedRemainingStock = calculatedTotalAvailable - formData.distribution;
  const isStockDeficit = calculatedRemainingStock < 0;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['previousStock', 'currentProduction', 'distribution'].includes(name) 
        ? Math.max(0, Number(value)) 
        : value
    }));
  };

  const handleCategoryChange = (cat: PlantCategory) => {
    setIsCustomCommodity(false);
    const list = commoditiesData[cat] || COMMODITIES_BY_CATEGORY[cat] || [];
    const first = list[0] || { name: 'Cabai Merah', unit: 'kg' };
    setFormData(prev => ({
      ...prev,
      category: cat,
      commodity: first.name,
      unit: (first.unit as SeedUnit) || 'kg'
    }));
  };

  const handleCommoditySelect = (name: string) => {
    if (name === '__custom__') {
      setIsCustomCommodity(true);
    } else {
      setIsCustomCommodity(false);
      const list = commoditiesData[formData.category] || [];
      const found = list.find(c => c.name === name);
      setFormData(prev => ({
        ...prev,
        commodity: name,
        unit: (found?.unit as SeedUnit) || prev.unit
      }));
    }
  };


  const handleReportFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Ukuran file maksimal 5 MB.');
        return;
      }
      setFormData(prev => ({
        ...prev,
        signedReportFile: file.name
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isStockDeficit) {
      alert('Penyaluran benih tidak boleh melebihi total ketersediaan (Stok Lalu + Produksi Baru).');
      return;
    }

    const finalCommodity = isCustomCommodity && customCommodityName.trim() 
      ? customCommodityName.trim() 
      : formData.commodity;

    // If custom commodity is used, auto-save to master data
    if (isCustomCommodity && customCommodityName.trim()) {
      const newName = customCommodityName.trim();
      const updated = { ...commoditiesData };
      const catList = [...(updated[formData.category] || [])];
      if (!catList.some(c => c.name.toLowerCase() === newName.toLowerCase())) {
        catList.push({ name: newName, unit: formData.unit });
        updated[formData.category] = catList;
        setCommoditiesData(updated);
        saveStoredCommodities(updated);
      }
    }

    const newRecord: MonthlySeedProduction & { producerName?: string; signedReportFile?: string } = {
      id: `bal-${Date.now()}`,
      reportingMonth: formData.reportingMonth,
      reportingEntity: formData.reportingEntity,
      province: formData.province,
      regency: formData.regency,
      category: formData.category,
      commodity: finalCommodity,
      variety: formData.variety || 'Standar Mutu',
      seedClass: formData.seedClass,
      unit: formData.unit,
      previousStock: formData.previousStock,
      currentProduction: formData.currentProduction,
      distribution: formData.distribution,
      remainingStock: calculatedRemainingStock,
      updatedAt: new Date().toISOString().split('T')[0],
      signedReportFile: formData.signedReportFile || 'laporan_rekapitulasi_produksi_resmi.pdf'
    };

    setProductions([newRecord, ...productions]);
    setIsModalOpen(false);
    setSuccessToast(`Data produksi benih ${newRecord.commodity} (${newRecord.seedClass}) berhasil disimpan.`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  // Filtered Production Records
  const filteredData = productions.filter(item => {
    const matchCategory = selectedCategory === 'semua' || item.category === selectedCategory;
    const matchEntity = selectedEntity === 'semua' || item.reportingEntity === selectedEntity;
    const matchMonth = item.reportingMonth === selectedMonth;
    return matchCategory && matchEntity && matchMonth;
  });

  // Aggregated KPIs
  const totalStockLalu = filteredData.reduce((acc, p) => acc + p.previousStock, 0);
  const totalProduksiBaru = filteredData.reduce((acc, p) => acc + p.currentProduction, 0);
  const totalPenyaluran = filteredData.reduce((acc, p) => acc + p.distribution, 0);
  const totalSisaStok = filteredData.reduce((acc, p) => acc + p.remainingStock, 0);

  return (
    <div className="space-y-6">
      
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-xl bg-slate-900 text-white shadow-xl flex items-center space-x-3 border border-emerald-500 animate-slideUp">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{successToast}</span>
        </div>
      )}

      {/* Header (MODUL B: Data Produksi Benih Bulanan) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-200 gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-emerald-700 font-bold uppercase tracking-wider">
            <Sprout className="w-4 h-4" />
            <span>MODUL B &bull; BPSB & PRODUSEN BENIH SMM</span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl text-slate-900 mt-1">
            Data Produksi Benih Bulanan
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Pelaporan berkala stok lalu, produksi benih berjalan, penyaluran, dan sisa stok 4 komoditas hortikultura (Sayuran, Buah, Florikultura, Biofarmaka).
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => alert('Mengekspor Berkas Neraca Data Produksi Bulanan ke format Excel resmi.')}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl bg-white text-slate-700 text-xs font-semibold border border-slate-200 shadow-2xs hover:bg-slate-50 transition-colors"
          >
            <Download className="w-4 h-4 text-emerald-700" />
            <span>Ekspor Data (XLSX)</span>
          </button>

          {canInputProduction ? (
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-emerald-800 text-white text-xs font-bold shadow-sm hover:bg-emerald-700 transition-all"
            >
              <Plus className="w-4 h-4 text-emerald-300" />
              <span>Input Data Produksi</span>
            </button>
          ) : (
            <div className="inline-flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 text-slate-500 text-xs font-semibold border border-slate-200 cursor-not-allowed">
              <Lock className="w-4 h-4 text-slate-400" />
              <span>Input Khusus BPSB / SMM</span>
            </div>
          )}
        </div>
      </div>

      {/* Info Banner Hak Akses Penginput */}
      <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0" />
          <div>
            <span className="font-bold">Otoritas Penginput Terverifikasi: </span>
            <span>Hanya petugas <b>BPSB Wilayah</b> dan <b>Produsen Benih Terakreditasi SMM</b> yang berhak mengentri data produksi bulanan. Identitas pelapor otomatis terkunci dari sesi aktif.</span>
          </div>
        </div>
        <span className="text-[10px] font-bold uppercase px-2.5 py-1 bg-white rounded-lg border border-emerald-300 text-emerald-800">
          Akun: {currentUserRole.toUpperCase()}
        </span>
      </div>

      {/* Aggregated Realtime Balance Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            1. Stok Bulan Lalu
          </span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {totalStockLalu.toLocaleString('id-ID')}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5 font-medium">Ketersediaan awal periode</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
            2. (+) Produksi Baru
          </span>
          <div className="text-2xl font-black text-emerald-700 mt-1">
            +{totalProduksiBaru.toLocaleString('id-ID')}
          </div>
          <p className="text-[11px] text-emerald-700 mt-0.5 font-medium">Sertifikasi panen baru</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">
            3. (-) Penyaluran
          </span>
          <div className="text-2xl font-black text-amber-700 mt-1">
            -{totalPenyaluran.toLocaleString('id-ID')}
          </div>
          <p className="text-[11px] text-amber-700 mt-0.5 font-medium">Distribusi ke petani / pasar</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-emerald-950 uppercase tracking-wider block">
            4. (=) Sisa Ketersediaan
          </span>
          <div className="text-2xl font-black text-emerald-900 mt-1">
            {totalSisaStok.toLocaleString('id-ID')}
          </div>
          <p className="text-[11px] text-emerald-800 mt-0.5 font-semibold">Stok siap salur periode ini</p>
        </div>
      </div>

      {/* Filter and Period Selection */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          
          {/* Period Filter */}
          <div className="md:col-span-4 flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-700 whitespace-nowrap">Bulan Laporan:</span>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 outline-none focus:border-emerald-600"
            />
          </div>

          {/* Commodity Category Filter */}
          <div className="md:col-span-5">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as PlantCategory | 'semua')}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:border-emerald-600 outline-none bg-white font-medium"
            >
              <option value="semua">Semua Kategori (Sayuran, Buah, Hias, Biofarmaka)</option>
              <option value="sayuran">Tanaman Sayuran</option>
              <option value="buah">Tanaman Buah</option>
              <option value="hias">Tanaman Hias</option>
              <option value="obat">Tanaman Obat / Biofarmaka</option>
            </select>
          </div>

          {/* Entity Filter */}
          <div className="md:col-span-3 flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            {(['semua', 'BPSB', 'LSSM'] as const).map(ent => (
              <button
                key={ent}
                onClick={() => setSelectedEntity(ent)}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  selectedEntity === ent
                    ? 'bg-white text-emerald-900 shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {ent}
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
                <th className="py-3 px-4">Komoditas & Varietas</th>
                <th className="py-3 px-4">Lembaga Pelapor</th>
                <th className="py-3 px-4">Wilayah</th>
                <th className="py-3 px-4 text-center">Kelas</th>
                <th className="py-3 px-4 text-right">Stok Lalu</th>
                <th className="py-3 px-4 text-right">Produksi Baru</th>
                <th className="py-3 px-4 text-right">Penyaluran</th>
                <th className="py-3 px-4 text-right font-black text-emerald-900">Sisa Stok</th>
                <th className="py-3 px-4 text-center">Dokumen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    Tidak ada rekaman neraca benih untuk periode {selectedMonth} pada kategori yang dipilih.
                  </td>
                </tr>
              ) : (
                filteredData.map((item: any) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{item.commodity}</div>
                      <div className="text-[11px] text-slate-500">Var: {item.variety}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.reportingEntity === 'BPSB'
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}>
                        {item.reportingEntity}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-700">
                      <div className="font-medium">{item.province}</div>
                      <div className="text-[10px] text-slate-400">{item.regency}</div>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className="font-mono text-xs font-bold text-slate-800 px-2 py-0.5 bg-slate-100 rounded border border-slate-200">
                        {item.seedClass}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right font-medium text-slate-700">
                      {item.previousStock.toLocaleString('id-ID')} {item.unit}
                    </td>

                    <td className="py-3.5 px-4 text-right font-bold text-emerald-700">
                      +{item.currentProduction.toLocaleString('id-ID')}
                    </td>

                    <td className="py-3.5 px-4 text-right font-bold text-amber-700">
                      -{item.distribution.toLocaleString('id-ID')}
                    </td>

                    <td className="py-3.5 px-4 text-right font-black text-emerald-900 text-sm">
                      {item.remainingStock.toLocaleString('id-ID')} <span className="text-[10px] font-normal text-slate-500">{item.unit}</span>
                    </td>

                    {/* Dokumen Laporan Bertandatangan */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => setSelectedReportViewer({
                          commodity: item.commodity,
                          entity: item.reportingEntity,
                          month: item.reportingMonth,
                          file: item.signedReportFile || 'laporan_rekapitulasi_produksi_resmi.pdf'
                        })}
                        className="inline-flex items-center space-x-1 px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-semibold transition-colors"
                        title="Tinjau Laporan Bertandatangan & Berstempel"
                      >
                        <FileText className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Lihat Berkas</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL LIHAT BERKAS LAPORAN BERTANDATANGAN */}
      {selectedReportViewer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center space-x-2 text-emerald-800 font-bold text-xs">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span>Dokumen Laporan Produksi Bertandatangan & Berstempel</span>
              </div>
              <button 
                onClick={() => setSelectedReportViewer(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <div className="text-xs text-slate-500">Komoditas & Periode:</div>
              <div className="text-sm font-bold text-slate-900">{selectedReportViewer.commodity} &bull; Periode {selectedReportViewer.month}</div>
              <div className="text-xs text-slate-500 pt-2">Lembaga Pelapor:</div>
              <div className="text-xs font-semibold text-emerald-800">{selectedReportViewer.entity}</div>
              <div className="text-xs text-slate-500 pt-2">File Terlampir:</div>
              <div className="text-xs font-semibold text-slate-700 flex items-center space-x-1.5">
                <FileText className="w-4 h-4 text-emerald-600" />
                <span>{selectedReportViewer.file || 'laporan_rekapitulasi_produksi_resmi.pdf'}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-900 flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Dokumen ini merupakan bukti otentik bertanda tangan basah dan berstempel resmi yang digunakan sebagai rujukan audit Ditjen Hortikultura.</span>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedReportViewer(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => {
                  alert(`Mengunduh dokumen: ${selectedReportViewer.file}`);
                  setSelectedReportViewer(null);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold flex items-center space-x-1.5"
              >
                <Download className="w-4 h-4" />
                <span>Unduh Berkas PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL INPUT NERACA DATA PRODUKSI */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50 rounded-t-2xl">
              <div>
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                  MODUL B &bull; ENTRI DATA RESMI
                </span>
                <h3 className="font-heading font-extrabold text-base text-slate-900">
                  Input Data Produksi Benih Bulanan
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
                
                {/* Periode Bulan */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Bulan Pelaporan *</label>
                  <input
                    type="month"
                    name="reportingMonth"
                    required
                    value={formData.reportingMonth}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 text-xs outline-none"
                  />
                </div>

                {/* Lembaga Pelapor (OTOMATIS TERKUNCI DARI AKUN LOGIN) */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Lembaga Pelapor (Terkunci Otomatis) *
                  </label>
                  <div className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-100 text-slate-800 font-bold flex items-center justify-between">
                    <span>{formData.reporterName || currentAgency}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 uppercase font-mono">
                      {formData.reportingEntity}
                    </span>
                  </div>
                </div>

                {/* KHUSUS BPSB: PEMILIHAN PRODUSEN BENIH BINAAN (ARAHAN PAK DARMAWAN) */}
                {(currentUserRole === 'bpsb' || currentUserRole === 'super_admin') && (
                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">
                      Pilih Produsen Benih Binaan yang Dilaporkan *
                    </label>
                    <select
                      name="selectedProducerId"
                      value={formData.selectedProducerId}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 text-xs outline-none"
                    >
                      {INITIAL_PRODUCERS.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.businessName} ({p.province} - {p.commodity})
                        </option>
                      ))}
                      <option value="custom">+ Entri Produsen Baru / Lainnya</option>
                    </select>

                    {formData.selectedProducerId === 'custom' && (
                      <input
                        type="text"
                        name="customProducerName"
                        value={formData.customProducerName}
                        onChange={handleInputChange}
                        placeholder="Ketik nama produsen / penangkar benih binaan..."
                        className="w-full mt-2 px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 text-xs outline-none"
                      />
                    )}
                  </div>
                )}

                {/* Provinsi */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Provinsi *</label>
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
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 text-xs outline-none"
                  />
                </div>

                {/* Kategori Tanaman */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jenis Tanaman (4 Kategori) *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={(e) => handleCategoryChange(e.target.value as PlantCategory)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 text-xs outline-none capitalize"
                  >
                    <option value="sayuran">Tanaman Sayuran</option>
                    <option value="buah">Tanaman Buah</option>
                    <option value="hias">Tanaman Hias</option>
                    <option value="obat">Tanaman Obat / Biofarmaka</option>
                  </select>
                </div>

                {/* Komoditas (PILIHAN MASTER DATA ATAU INPUT KUSTOM) */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Komoditas Hortikultura *</label>
                  {!isCustomCommodity ? (
                    <select
                      name="commodity"
                      value={formData.commodity}
                      onChange={(e) => handleCommoditySelect(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 text-xs outline-none"
                    >
                      {(commoditiesData[formData.category] || COMMODITIES_BY_CATEGORY[formData.category] || []).map(c => (
                        <option key={c.name} value={c.name}>{c.name}</option>
                      ))}
                      <option value="__custom__">+ Tambah / Ketik Komoditas Lainnya...</option>
                    </select>
                  ) : (
                    <div className="flex space-x-1">
                      <input
                        type="text"
                        value={customCommodityName}
                        onChange={(e) => setCustomCommodityName(e.target.value)}
                        placeholder="Ketik nama komoditas tanaman..."
                        className="flex-1 px-3 py-2 rounded-lg border border-emerald-400 bg-white text-slate-900 text-xs outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setIsCustomCommodity(false)}
                        className="px-2 py-1 bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold"
                      >
                        Batal
                      </button>
                    </div>
                  )}
                </div>

                {/* Varietas */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Varietas Benih</label>
                  <input
                    type="text"
                    name="variety"
                    value={formData.variety}
                    onChange={handleInputChange}
                    placeholder="Contoh: Tanjung-2"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 text-xs outline-none"
                  />
                </div>

                {/* Kelas Benih & Satuan */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Kelas Benih *</label>
                    <select
                      name="seedClass"
                      value={formData.seedClass}
                      onChange={handleInputChange}
                      className="w-full px-2 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 text-xs outline-none font-bold"
                    >
                      <option value="BS">BS (Penjenis)</option>
                      <option value="BD">BD (Dasar)</option>
                      <option value="BP">BP (Pokok)</option>
                      <option value="BR">BR (Sebar)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Satuan *</label>
                    <select
                      name="unit"
                      value={formData.unit}
                      onChange={handleInputChange}
                      className="w-full px-2 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 text-xs outline-none uppercase font-bold"
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

                {/* Upload Dokumen Bertandatangan Resmi */}
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Upload Dokumen Rekapitulasi Bertandatangan & Stempel (PDF, Maks 5 MB) *
                  </label>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleReportFileUpload}
                    className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-100 file:text-emerald-800 hover:file:bg-emerald-200 cursor-pointer border border-slate-300 rounded-lg p-1.5"
                  />
                  {formData.signedReportFile && (
                    <span className="text-[11px] text-emerald-700 font-medium mt-1 block">
                      Berkas terpilih: {formData.signedReportFile}
                    </span>
                  )}
                </div>

              </div>

              {/* REALTIME CALCULATION SECTION */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 mt-4">
                <span className="font-heading font-bold text-slate-800 text-xs flex items-center space-x-1.5">
                  <Calculator className="w-4 h-4 text-emerald-600" />
                  <span>Kalkulasi Neraca Stok Realtime</span>
                </span>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-medium text-slate-600 mb-1">Ketersediaan Bulan Lalu</label>
                    <input
                      type="number"
                      name="previousStock"
                      value={formData.previousStock}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-emerald-800 mb-1">(+) Produksi Bulan Ini</label>
                    <input
                      type="number"
                      name="currentProduction"
                      value={formData.currentProduction}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 rounded-lg border border-emerald-300 bg-white text-xs font-bold text-emerald-800"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-amber-800 mb-1">(-) Penyaluran Bulan Ini</label>
                    <input
                      type="number"
                      name="distribution"
                      value={formData.distribution}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 rounded-lg border border-amber-300 bg-white text-xs font-bold text-amber-800"
                    />
                  </div>
                </div>

                {/* Calculation Output Box */}
                <div className={`p-3 rounded-lg border flex items-center justify-between ${
                  isStockDeficit 
                    ? 'bg-red-50 border-red-300 text-red-800' 
                    : 'bg-emerald-100/70 border-emerald-300 text-emerald-950'
                }`}>
                  <div>
                    <span className="text-[11px] font-bold block">
                      Total Ketersediaan: ({formData.previousStock} + {formData.currentProduction}) = {calculatedTotalAvailable} {formData.unit}
                    </span>
                    <span className="text-xs font-extrabold">
                      (=) Sisa Ketersediaan: {calculatedRemainingStock} {formData.unit}
                    </span>
                  </div>

                  {isStockDeficit && (
                    <div className="flex items-center space-x-1 text-xs font-bold text-red-600">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Defisit Stok!</span>
                    </div>
                  )}
                </div>

                {isStockDeficit && (
                  <p className="text-[11px] text-red-600">
                    Jumlah penyaluran ({formData.distribution}) melebihi total benih yang tersedia ({calculatedTotalAvailable}). Mohon periksa kembali data lapangan.
                  </p>
                )}
              </div>

              {/* Actions */}
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
                  disabled={isStockDeficit}
                  className={`inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold shadow transition-all ${
                    isStockDeficit 
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed' 
                      : 'bg-emerald-800 hover:bg-emerald-700 text-white'
                  }`}
                >
                  <Save className="w-4 h-4 text-emerald-400" />
                  <span>Simpan Data Produksi</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
