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
  Users,
  Edit3,
  Trash2,
  RotateCcw,
  AlertTriangle,
  Layers,
  Sparkles
} from 'lucide-react';
import CustomDropdown from '@/components/ui/CustomDropdown';
import { 
  COMMODITIES_BY_CATEGORY, 
  CommodityItem, 
  getStoredCommodities, 
  saveStoredCommodities,
  PROVINCES_INDONESIA 
} from '@/data/masterData';

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
  const [commodityCategoryFilter, setCommodityCategoryFilter] = useState<'semua' | 'sayuran' | 'buah' | 'hias' | 'obat'>('semua');
  const [commoditySearch, setCommoditySearch] = useState('');

  // Master States
  const [cropTypes, setCropTypes] = useState<CropType[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [bpsbList, setBpsbList] = useState<Bpsb[]>([]);
  const [lssmList, setLssmList] = useState<Lssm[]>([]);
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>([]);

  // Detailed Commodity state (Full CRUD from data komoditas.xlsx)
  const [commoditiesMap, setCommoditiesMap] = useState<Record<'sayuran' | 'buah' | 'hias' | 'obat', CommodityItem[]>>(COMMODITIES_BY_CATEGORY);

  // Selected Role for configuration
  const [selectedRoleKey, setSelectedRoleKey] = useState<string>('bpsb');
  const [savingRole, setSavingRole] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Modals for CRUD
  const [commodityModal, setCommodityModal] = useState<{
    isOpen: boolean;
    mode: 'add' | 'edit';
    category: 'sayuran' | 'buah' | 'hias' | 'obat';
    oldName?: string;
    item: CommodityItem;
  }>({
    isOpen: false,
    mode: 'add',
    category: 'sayuran',
    item: { name: '', unit: 'kg', varietyExamples: '' }
  });

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    type: 'commodity' | 'bpsb' | 'lssm' | 'unit';
    title: string;
    data: any;
  } | null>(null);

  const [bpsbModal, setBpsbModal] = useState<{
    isOpen: boolean;
    mode: 'add' | 'edit';
    item: { id?: number; no_urut?: number; provinsi: string; nama_bpsb: string; alamat: string; status: string };
  }>({
    isOpen: false,
    mode: 'add',
    item: { provinsi: 'Jawa Barat', nama_bpsb: '', alamat: '', status: 'aktif' }
  });

  const [lssmModal, setLssmModal] = useState<{
    isOpen: boolean;
    mode: 'add' | 'edit';
    item: { id?: number; no_urut?: number; provinsi: string; nama_produsen: string; alamat: string; status: string };
  }>({
    isOpen: false,
    mode: 'add',
    item: { provinsi: 'Jawa Timur', nama_produsen: '', alamat: '', status: 'terakreditasi' }
  });

  const [unitModal, setUnitModal] = useState<{
    isOpen: boolean;
    mode: 'add' | 'edit';
    item: { id?: number; code: string; name: string; description: string; note: string };
  }>({
    isOpen: false,
    mode: 'add',
    item: { code: '', name: '', description: '', note: '' }
  });

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
      // 1. Load commodities from client storage
      const stored = getStoredCommodities();
      setCommoditiesMap(stored);

      // 2. Fetch from backend API
      const res = await fetch('/api/master/all');
      if (res.ok) {
        const json = await res.json();
        if (json.status === 'success' && json.data) {
          if (json.data.crops && json.data.crops.length > 0) {
            setCropTypes(json.data.crops);
          }
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

    const handleCommoditySync = () => {
      setCommoditiesMap(getStoredCommodities());
    };
    window.addEventListener('master_commodities_updated', handleCommoditySync);
    return () => window.removeEventListener('master_commodities_updated', handleCommoditySync);
  }, []);

  // Update cropTypes state whenever commoditiesMap changes
  useEffect(() => {
    const generatedCrops: CropType[] = [
      {
        id: 1,
        code: 'sayuran',
        name: 'Tanaman Sayuran',
        category: 'Hortikultura Pangan',
        commodities: (commoditiesMap.sayuran || []).map(c => c.name).join(', ')
      },
      {
        id: 2,
        code: 'buah',
        name: 'Tanaman Buah',
        category: 'Hortikultura Buah Tropika',
        commodities: (commoditiesMap.buah || []).map(c => c.name).join(', ')
      },
      {
        id: 3,
        code: 'hias',
        name: 'Tanaman Hias',
        category: 'Florikultura',
        commodities: (commoditiesMap.hias || []).map(c => c.name).join(', ')
      },
      {
        id: 4,
        code: 'obat',
        name: 'Tanaman Obat',
        category: 'Biofarmaka',
        commodities: (commoditiesMap.obat || []).map(c => c.name).join(', ')
      }
    ];
    setCropTypes(generatedCrops);
  }, [commoditiesMap]);

  // Total commodity count
  const totalCommodities = 
    (commoditiesMap.sayuran?.length || 0) +
    (commoditiesMap.buah?.length || 0) +
    (commoditiesMap.hias?.length || 0) +
    (commoditiesMap.obat?.length || 0);

  // Flatten commodities for table CRUD
  const allCommoditiesFlat = [
    ...(commoditiesMap.sayuran || []).map(c => ({ ...c, category: 'sayuran' as const, categoryLabel: 'Tanaman Sayuran' })),
    ...(commoditiesMap.buah || []).map(c => ({ ...c, category: 'buah' as const, categoryLabel: 'Tanaman Buah' })),
    ...(commoditiesMap.hias || []).map(c => ({ ...c, category: 'hias' as const, categoryLabel: 'Tanaman Hias' })),
    ...(commoditiesMap.obat || []).map(c => ({ ...c, category: 'obat' as const, categoryLabel: 'Tanaman Obat' }))
  ];

  const filteredCommodities = allCommoditiesFlat.filter(c => {
    const matchCat = commodityCategoryFilter === 'semua' || c.category === commodityCategoryFilter;
    const matchSearch = c.name.toLowerCase().includes(commoditySearch.toLowerCase()) ||
                        (c.varietyExamples || '').toLowerCase().includes(commoditySearch.toLowerCase()) ||
                        c.unit.toLowerCase().includes(commoditySearch.toLowerCase());
    return matchCat && matchSearch;
  });

  // Filtered lists for BPSB and LSSM
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
    ...lssmList.map(l => l.provinsi),
    ...PROVINCES_INDONESIA
  ])).sort();

  const provinceOptions = [
    { value: 'semua', label: 'Semua Provinsi' },
    ...uniqueProvinces.map(p => ({ value: p, label: p }))
  ];

  // ==========================================
  // COMMODITY CRUD HANDLERS
  // ==========================================
  const handleOpenAddCommodity = (defaultCat?: 'sayuran' | 'buah' | 'hias' | 'obat') => {
    setCommodityModal({
      isOpen: true,
      mode: 'add',
      category: defaultCat || 'sayuran',
      item: { name: '', unit: defaultCat === 'buah' ? 'batang' : (defaultCat === 'hias' ? 'stek' : 'kg'), varietyExamples: '' }
    });
  };

  const handleOpenEditCommodity = (item: CommodityItem, category: 'sayuran' | 'buah' | 'hias' | 'obat') => {
    setCommodityModal({
      isOpen: true,
      mode: 'edit',
      category: category,
      oldName: item.name,
      item: { ...item }
    });
  };

  const handleSaveCommodity = async (e: React.FormEvent) => {
    e.preventDefault();
    const { mode, category, oldName, item } = commodityModal;
    const cleanName = item.name.trim();
    if (!cleanName) {
      alert('Nama komoditas wajib diisi.');
      return;
    }

    const updated = { ...commoditiesMap };
    const list = [...(updated[category] || [])];

    if (mode === 'add') {
      // Check duplicate in same category
      if (list.some(c => c.name.toLowerCase() === cleanName.toLowerCase())) {
        alert(`Komoditas '${cleanName}' sudah terdaftar dalam kategori ini.`);
        return;
      }
      list.push({ ...item, name: cleanName });
    } else {
      // Edit
      const idx = list.findIndex(c => c.name === oldName);
      if (idx !== -1) {
        list[idx] = { ...item, name: cleanName };
      }
    }

    updated[category] = list;
    setCommoditiesMap(updated);
    saveStoredCommodities(updated);

    // Sync to backend if online
    try {
      await fetch('/api/master/commodities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          name: cleanName,
          old_name: oldName || '',
          unit: item.unit,
          variety_examples: item.varietyExamples || ''
        })
      });
    } catch {}

    setCommodityModal(prev => ({ ...prev, isOpen: false }));
  };

  const handleDeleteCommodityConfirm = async (name: string, category: 'sayuran' | 'buah' | 'hias' | 'obat') => {
    const updated = { ...commoditiesMap };
    updated[category] = (updated[category] || []).filter(c => c.name !== name);
    setCommoditiesMap(updated);
    saveStoredCommodities(updated);

    try {
      await fetch('/api/master/commodities', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, name })
      });
    } catch {}

    setDeleteModal(null);
  };

  const handleResetToDefaultExcel = () => {
    if (confirm('Apakah Anda yakin ingin mengembalikan seluruh master data komoditas ke acuan default data komoditas.xlsx? Data kustom yang ditambahkan akan direset.')) {
      setCommoditiesMap(COMMODITIES_BY_CATEGORY);
      saveStoredCommodities(COMMODITIES_BY_CATEGORY);
      alert('Master komoditas berhasil direset ke standar resmi Excel Kementan.');
    }
  };

  // ==========================================
  // BPSB CRUD HANDLERS
  // ==========================================
  const handleSaveBpsb = async (e: React.FormEvent) => {
    e.preventDefault();
    const item = bpsbModal.item;
    if (!item.nama_bpsb || !item.provinsi) {
      alert('Nama Balai BPSB dan Provinsi wajib diisi.');
      return;
    }

    try {
      const res = await fetch('/api/master/bpsb', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });
      if (res.ok) {
        await fetchMasterData();
        setBpsbModal(prev => ({ ...prev, isOpen: false }));
      }
    } catch {
      // Local fallback
      if (bpsbModal.mode === 'add') {
        setBpsbList(prev => [...prev, {
          id: Date.now(),
          no_urut: prev.length + 1,
          provinsi: item.provinsi,
          nama_bpsb: item.nama_bpsb,
          alamat: item.alamat || '-',
          status: item.status || 'aktif'
        }]);
      } else {
        setBpsbList(prev => prev.map(b => b.id === item.id ? { ...b, ...item } : b));
      }
      setBpsbModal(prev => ({ ...prev, isOpen: false }));
    }
  };

  const handleDeleteBpsb = async (id: number) => {
    try {
      await fetch('/api/master/bpsb', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      await fetchMasterData();
    } catch {
      setBpsbList(prev => prev.filter(b => b.id !== id));
    }
    setDeleteModal(null);
  };

  // ==========================================
  // LSSM CRUD HANDLERS
  // ==========================================
  const handleSaveLssm = async (e: React.FormEvent) => {
    e.preventDefault();
    const item = lssmModal.item;
    if (!item.nama_produsen || !item.provinsi) {
      alert('Nama Produsen dan Provinsi wajib diisi.');
      return;
    }

    try {
      const res = await fetch('/api/master/lssm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });
      if (res.ok) {
        await fetchMasterData();
        setLssmModal(prev => ({ ...prev, isOpen: false }));
      }
    } catch {
      // Local fallback
      if (lssmModal.mode === 'add') {
        setLssmList(prev => [...prev, {
          id: Date.now(),
          no_urut: prev.length + 1,
          provinsi: item.provinsi,
          nama_produsen: item.nama_produsen,
          alamat: item.alamat || '-',
          status: item.status || 'terakreditasi'
        }]);
      } else {
        setLssmList(prev => prev.map(l => l.id === item.id ? { ...l, ...item } : l));
      }
      setLssmModal(prev => ({ ...prev, isOpen: false }));
    }
  };

  const handleDeleteLssm = async (id: number) => {
    try {
      await fetch('/api/master/lssm', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      await fetchMasterData();
    } catch {
      setLssmList(prev => prev.filter(l => l.id !== id));
    }
    setDeleteModal(null);
  };

  // ==========================================
  // UNIT CRUD HANDLERS
  // ==========================================
  const handleSaveUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    const item = unitModal.item;
    if (!item.code || !item.name) {
      alert('Kode dan Nama Satuan wajib diisi.');
      return;
    }

    try {
      const res = await fetch('/api/master/units', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });
      if (res.ok) {
        await fetchMasterData();
        setUnitModal(prev => ({ ...prev, isOpen: false }));
      }
    } catch {
      if (unitModal.mode === 'add') {
        setUnits(prev => [...prev, { id: Date.now(), ...item }]);
      } else {
        setUnits(prev => prev.map(u => u.id === item.id ? { ...u, ...item } : u));
      }
      setUnitModal(prev => ({ ...prev, isOpen: false }));
    }
  };

  const handleDeleteUnit = async (id: number, code: string) => {
    try {
      await fetch('/api/master/units', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, code })
      });
      await fetchMasterData();
    } catch {
      setUnits(prev => prev.filter(u => u.id !== id));
    }
    setDeleteModal(null);
  };

  // ==========================================
  // ROLES TAB
  // ==========================================
  const currentRolePerm = rolePermissions.find(r => r.role === selectedRoleKey) || {
    id: 0,
    role: selectedRoleKey,
    role_name: 'Role Pengguna',
    description: '',
    allowed_features: ['dashboard', 'profil'],
    sidebar_menus: ['dashboard', 'profil']
  };

  const toggleFeaturePermission = (featKey: string) => {
    if (selectedRoleKey === 'super_admin') return;
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
      {/* Header Banner */}
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
              Basis data referensi resmi: 4 kelompok komoditas ({totalCommodities} komoditas aktif), konversi satuan benih, direktori 33 Balai BPSB Provinsi, 44 Lembaga Mutu LSSM, dan pengaturan hak akses role & menu sidebar.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={fetchMasterData}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/25 text-xs font-semibold flex items-center gap-2 transition-all active:scale-95 shadow-sm"
              title="Perbarui data dari database MySQL"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Sinkron Data</span>
            </button>
            <div className="px-3.5 py-2 rounded-xl bg-emerald-900/50 border border-emerald-300/30 text-emerald-100 text-xs font-bold font-mono">
              {totalCommodities} Komoditas • 33 BPSB • 44 LSSM
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="relative z-10 flex items-center gap-2 mt-6 pt-6 border-t border-white/15 overflow-x-auto custom-scrollbar">
          <button
            onClick={() => setActiveTab('crops')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'crops'
                ? 'bg-white text-emerald-950 font-bold shadow-md'
                : 'bg-white/10 text-white/90 hover:bg-white/20'
            }`}
          >
            <Sprout className="w-3.5 h-3.5" />
            <span>1. Jenis & Komoditas Tanaman ({totalCommodities})</span>
          </button>

          <button
            onClick={() => setActiveTab('units')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'units'
                ? 'bg-white text-emerald-950 font-bold shadow-md'
                : 'bg-white/10 text-white/90 hover:bg-white/20'
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
                : 'bg-white/10 text-white/90 hover:bg-white/20'
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
                : 'bg-white/10 text-white/90 hover:bg-white/20'
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
                : 'bg-amber-400/20 text-amber-200 border border-amber-400/30 hover:bg-amber-400/30'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-amber-300" />
            <span>5. Hak Akses & Menu Sidebar Role</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          TAB 1: JENIS TANAMAN & MANAJEMEN KOMODITAS (FULL CRUD)
      ========================================================================= */}
      {activeTab === 'crops' && (
        <div className="space-y-6">
          
          {/* Action Bar for Commodities */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Master Referensi Komoditas Hortikultura (Sesuai Excel Resmi)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Total {totalCommodities} komoditas resmi terdaftar. Anda dapat menambah, mengedit, atau menghapus komoditas kapan saja.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleResetToDefaultExcel}
                className="px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                title="Kembalikan data komoditas ke acuan awal file Excel data komoditas.xlsx"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                <span>Reset Excel Default</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenAddCommodity()}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-700/20 transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Komoditas Baru</span>
              </button>
            </div>
          </div>

          {/* 4 Category Summary Cards with Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                code: 'sayuran' as const,
                name: 'Tanaman Sayuran',
                category: 'Hortikultura Pangan',
                badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
                count: commoditiesMap.sayuran?.length || 0,
                list: commoditiesMap.sayuran || []
              },
              {
                code: 'buah' as const,
                name: 'Tanaman Buah',
                category: 'Hortikultura Buah Tropika',
                badgeBg: 'bg-amber-50 text-amber-800 border-amber-200',
                count: commoditiesMap.buah?.length || 0,
                list: commoditiesMap.buah || []
              },
              {
                code: 'hias' as const,
                name: 'Tanaman Hias',
                category: 'Florikultura',
                badgeBg: 'bg-purple-50 text-purple-800 border-purple-200',
                count: commoditiesMap.hias?.length || 0,
                list: commoditiesMap.hias || []
              },
              {
                code: 'obat' as const,
                name: 'Tanaman Obat',
                category: 'Biofarmaka',
                badgeBg: 'bg-teal-50 text-teal-800 border-teal-200',
                count: commoditiesMap.obat?.length || 0,
                list: commoditiesMap.obat || []
              }
            ].map(crop => (
              <div 
                key={crop.code}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                        <Sprout className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-heading font-bold text-slate-900 text-base">
                            {crop.name}
                          </h3>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono">
                            {crop.count}
                          </span>
                        </div>
                        <span className="text-xs text-emerald-700 font-medium">
                          {crop.category}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleOpenAddCommodity(crop.code)}
                      className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold border border-emerald-200 flex items-center gap-1 transition-colors"
                      title={`Tambah komoditas ke ${crop.name}`}
                    >
                      <Plus className="w-3 h-3" />
                      <span>Tambah</span>
                    </button>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                      Daftar Komoditas (Klik untuk Edit/Hapus):
                    </span>
                    <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto custom-scrollbar p-0.5">
                      {crop.list.map((item, cIdx) => (
                        <div 
                          key={cIdx}
                          className="group inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-emerald-50 text-slate-800 hover:text-emerald-900 border border-slate-200 font-medium transition-all"
                        >
                          <span>{item.name}</span>
                          <span className="text-[9px] font-mono px-1 py-0.2 bg-slate-200/70 group-hover:bg-emerald-200/80 rounded text-slate-600 group-hover:text-emerald-800">
                            {item.unit}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEditCommodity(item, crop.code);
                            }}
                            className="text-slate-400 hover:text-emerald-700 p-0.5"
                            title="Edit Komoditas"
                          >
                            <Edit3 className="w-2.5 h-2.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteModal({
                                isOpen: true,
                                type: 'commodity',
                                title: `Hapus Komoditas '${item.name}'?`,
                                data: { name: item.name, category: crop.code }
                              });
                            }}
                            className="text-slate-400 hover:text-red-600 p-0.5"
                            title="Hapus Komoditas"
                          >
                            <Trash2 className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>KODE: <strong className="font-mono text-slate-600">{crop.code}</strong></span>
                  <span>Terkoneksi ke Modul A & B</span>
                </div>
              </div>
            ))}
          </div>

          {/* Interactive Management Table for All Commodities */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-3 p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-heading font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-600" />
                  <span>Daftar Lengkap Komoditas Hortikultura ({filteredCommodities.length} ditampilkan)</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Data ini digunakan sebagai sumber dropdown otomatis pada Modul Produksi Benih dan Produsen Pengedar.
                </p>
              </div>

              {/* Category Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
                {(['semua', 'sayuran', 'buah', 'hias', 'obat'] as const).map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCommodityCategoryFilter(cat)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition-colors ${
                      commodityCategoryFilter === cat
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat === 'semua' ? 'Semua' : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Input for Commodities */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={commoditySearch}
                onChange={(e) => setCommoditySearch(e.target.value)}
                placeholder="Cari komoditas (misal: Mentimun, Durian, Krisan, Jahe, Stroberi)..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider border-y border-slate-200">
                  <tr>
                    <th className="py-3 px-4 w-12 text-center">No</th>
                    <th className="py-3 px-4 w-48">Nama Komoditas</th>
                    <th className="py-3 px-4 w-40">Kategori Tanaman</th>
                    <th className="py-3 px-4 w-32">Satuan Standar</th>
                    <th className="py-3 px-4">Contoh Varietas Unggulan</th>
                    <th className="py-3 px-4 w-28 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCommodities.map((item, index) => (
                    <tr key={`${item.category}-${item.name}-${index}`} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-4 text-center font-mono text-slate-400">
                        {index + 1}
                      </td>
                      <td className="py-2.5 px-4 font-bold text-slate-900">
                        {item.name}
                      </td>
                      <td className="py-2.5 px-4">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold capitalize ${
                          item.category === 'sayuran' ? 'bg-emerald-100 text-emerald-800' :
                          item.category === 'buah' ? 'bg-amber-100 text-amber-800' :
                          item.category === 'hias' ? 'bg-purple-100 text-purple-800' : 'bg-teal-100 text-teal-800'
                        }`}>
                          {item.categoryLabel}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 font-mono font-bold text-slate-700">
                        {item.unit}
                      </td>
                      <td className="py-2.5 px-4 text-slate-600 truncate max-w-xs">
                        {item.varietyExamples || '-'}
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEditCommodity(item, item.category)}
                            className="p-1 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                            title="Edit Komoditas"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteModal({
                              isOpen: true,
                              type: 'commodity',
                              title: `Hapus Komoditas '${item.name}'?`,
                              data: { name: item.name, category: item.category }
                            })}
                            className="p-1 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Hapus Komoditas"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredCommodities.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        Tidak ada komoditas yang sesuai filter pencarian.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 flex items-start gap-3">
            <Info className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <p className="text-xs text-emerald-900 leading-relaxed">
              <strong>Sinkronisasi Otomatis:</strong> Setiap komoditas yang Anda tambahkan atau edit di sini akan secara real-time muncul pada dropdown form <em>Input Data Produksi Benih</em> dan form <em>Entri Pelaporan Produsen & Pengedar</em>.
            </p>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: SATUAN BENIH (FULL CRUD)
      ========================================================================= */}
      {activeTab === 'units' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Scale className="w-4 h-4 text-emerald-600" />
                <span>Standar Satuan Benih Hortikultura</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Konversi dan ketentuan satuan pelaporan benih sesuai petunjuk teknis kementerian.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setUnitModal({
                isOpen: true,
                mode: 'add',
                item: { code: '', name: '', description: '', note: '' }
              })}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Satuan</span>
            </button>
          </div>

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
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setUnitModal({
                          isOpen: true,
                          mode: 'edit',
                          item: { ...unit }
                        })}
                        className="p-1 rounded text-slate-400 hover:text-emerald-700"
                        title="Edit Satuan"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteModal({
                          isOpen: true,
                          type: 'unit',
                          title: `Hapus Satuan '${unit.name}'?`,
                          data: { id: unit.id, code: unit.code }
                        })}
                        className="p-1 rounded text-slate-400 hover:text-red-600"
                        title="Hapus Satuan"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
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

      {/* =========================================================================
          TAB 3: BPSB 38 PROVINSI (FULL CRUD)
      ========================================================================= */}
      {activeTab === 'bpsb' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs relative z-30">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari Balai BPSB atau Provinsi..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 outline-none"
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
            <button
              type="button"
              onClick={() => setBpsbModal({
                isOpen: true,
                mode: 'add',
                item: { provinsi: 'Jawa Barat', nama_bpsb: '', alamat: '', status: 'aktif' }
              })}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-md whitespace-nowrap active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah BPSB</span>
            </button>
          </div>

          {/* Table BPSB */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-4 w-12 text-center">No</th>
                    <th className="py-3.5 px-4 w-40">Provinsi</th>
                    <th className="py-3.5 px-4">Nama Balai BPSB Resmi</th>
                    <th className="py-3.5 px-4">Alamat Kantor</th>
                    <th className="py-3.5 px-4 w-28 text-center">Status</th>
                    <th className="py-3.5 px-4 w-32 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredBpsb.map((bpsb, index) => (
                    <tr key={bpsb.id || index} className="hover:bg-slate-50/70 transition-colors">
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
                        <div className="flex items-center justify-center gap-1">
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
                            className="p-1 rounded text-slate-400 hover:text-emerald-700"
                            title="Lihat Detail"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setBpsbModal({
                              isOpen: true,
                              mode: 'edit',
                              item: { ...bpsb }
                            })}
                            className="p-1 rounded text-slate-400 hover:text-emerald-700"
                            title="Edit Data BPSB"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteModal({
                              isOpen: true,
                              type: 'bpsb',
                              title: `Hapus Balai BPSB '${bpsb.nama_bpsb}'?`,
                              data: { id: bpsb.id }
                            })}
                            className="p-1 rounded text-slate-400 hover:text-red-600"
                            title="Hapus Data BPSB"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
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

      {/* =========================================================================
          TAB 4: LSSM & PRODUSEN (FULL CRUD)
      ========================================================================= */}
      {activeTab === 'lssm' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs relative z-30">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari Produsen LSSM atau Alamat..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 outline-none"
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
            <button
              type="button"
              onClick={() => setLssmModal({
                isOpen: true,
                mode: 'add',
                item: { provinsi: 'Jawa Timur', nama_produsen: '', alamat: '', status: 'terakreditasi' }
              })}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-md whitespace-nowrap active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Produsen LSSM</span>
            </button>
          </div>

          {/* Table LSSM */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-4 w-12 text-center">No</th>
                    <th className="py-3.5 px-4 w-40">Provinsi</th>
                    <th className="py-3.5 px-4">Nama Produsen / Balai Binaan LSSM</th>
                    <th className="py-3.5 px-4">Alamat Fasilitas</th>
                    <th className="py-3.5 px-4 w-32 text-center">Akreditasi Mutu</th>
                    <th className="py-3.5 px-4 w-32 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLssm.map((lssm, index) => (
                    <tr key={lssm.id || index} className="hover:bg-slate-50/70 transition-colors">
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
                        <div className="flex items-center justify-center gap-1">
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
                            className="p-1 rounded text-slate-400 hover:text-amber-700"
                            title="Detail"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setLssmModal({
                              isOpen: true,
                              mode: 'edit',
                              item: { ...lssm }
                            })}
                            className="p-1 rounded text-slate-400 hover:text-emerald-700"
                            title="Edit LSSM"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteModal({
                              isOpen: true,
                              type: 'lssm',
                              title: `Hapus Produsen LSSM '${lssm.nama_produsen}'?`,
                              data: { id: lssm.id }
                            })}
                            className="p-1 rounded text-slate-400 hover:text-red-600"
                            title="Hapus LSSM"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
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

      {/* =========================================================================
          TAB 5: HAK AKSES & MENU SIDEBAR ROLE
      ========================================================================= */}
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
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
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
                        : 'bg-slate-50/80 border-slate-200 hover:border-slate-300'
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

      {/* =========================================================================
          MODAL: TAMBAH / EDIT KOMODITAS
      ========================================================================= */}
      {commodityModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Sprout className="w-5 h-5 text-emerald-600" />
                <h3 className="font-heading font-bold text-slate-900 text-base">
                  {commodityModal.mode === 'add' ? 'Tambah Komoditas Baru' : 'Edit Komoditas'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setCommodityModal(prev => ({ ...prev, isOpen: false }))}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCommodity} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Kategori Tanaman *
                </label>
                <select
                  value={commodityModal.category}
                  onChange={(e) => setCommodityModal(prev => ({
                    ...prev,
                    category: e.target.value as any
                  }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs outline-none capitalize"
                >
                  <option value="sayuran">Tanaman Sayuran (Hortikultura Pangan)</option>
                  <option value="buah">Tanaman Buah (Hortikultura Buah Tropika)</option>
                  <option value="hias">Tanaman Hias (Florikultura)</option>
                  <option value="obat">Tanaman Obat (Biofarmaka)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Komoditas Hortikultura *
                </label>
                <input
                  type="text"
                  required
                  value={commodityModal.item.name}
                  onChange={(e) => setCommodityModal(prev => ({
                    ...prev,
                    item: { ...prev.item, name: e.target.value }
                  }))}
                  placeholder="Contoh: Stroberi / Petai / Kacang Merah"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 text-xs outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Satuan Standar Pelaporan *
                </label>
                <select
                  value={commodityModal.item.unit}
                  onChange={(e) => setCommodityModal(prev => ({
                    ...prev,
                    item: { ...prev.item, unit: e.target.value }
                  }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs outline-none"
                >
                  <option value="kg">kg (Kilogram) - Sayuran, buah kecil, rimpang</option>
                  <option value="batang">batang - Bibit pohon buah, pohon keras</option>
                  <option value="knol">knol - Umbi benih vegetatif (Kentang)</option>
                  <option value="stek">stek - Perbanyakan vegetatif mikro / stek</option>
                  <option value="planlet">planlet - Kultur jaringan laboratorium (Anggrek)</option>
                  <option value="anakan">anakan - Tunas anakan (Pisang, Nenas)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Contoh Varietas Unggulan (Opsional)
                </label>
                <input
                  type="text"
                  value={commodityModal.item.varietyExamples || ''}
                  onChange={(e) => setCommodityModal(prev => ({
                    ...prev,
                    item: { ...prev.item, varietyExamples: e.target.value }
                  }))}
                  placeholder="Contoh: Sweet Charlie, Rosalinda"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 text-xs outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCommodityModal(prev => ({ ...prev, isOpen: false }))}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-700/20 active:scale-95 transition-all"
                >
                  Simpan Komoditas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: TAMBAH / EDIT BALAI BPSB
      ========================================================================= */}
      {bpsbModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-600" />
                <h3 className="font-heading font-bold text-slate-900 text-base">
                  {bpsbModal.mode === 'add' ? 'Tambah Balai BPSB Provinsi' : 'Edit Balai BPSB'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setBpsbModal(prev => ({ ...prev, isOpen: false }))}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBpsb} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Provinsi Wilayah *</label>
                <select
                  value={bpsbModal.item.provinsi}
                  onChange={(e) => setBpsbModal(prev => ({ ...prev, item: { ...prev.item, provinsi: e.target.value } }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs outline-none"
                >
                  {PROVINCES_INDONESIA.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Balai BPSB Resmi *</label>
                <input
                  type="text"
                  required
                  value={bpsbModal.item.nama_bpsb}
                  onChange={(e) => setBpsbModal(prev => ({ ...prev, item: { ...prev.item, nama_bpsb: e.target.value } }))}
                  placeholder="Contoh: UPTD BPSBTPHP Prov. Jawa Barat"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Alamat Kantor Lengkap *</label>
                <textarea
                  rows={2}
                  required
                  value={bpsbModal.item.alamat}
                  onChange={(e) => setBpsbModal(prev => ({ ...prev, item: { ...prev.item, alamat: e.target.value } }))}
                  placeholder="Jl. Raya No..., Kota/Kabupaten..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setBpsbModal(prev => ({ ...prev, isOpen: false }))}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md active:scale-95 transition-all"
                >
                  Simpan BPSB
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: TAMBAH / EDIT PRODUSEN LSSM
      ========================================================================= */}
      {lssmModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-600" />
                <h3 className="font-heading font-bold text-slate-900 text-base">
                  {lssmModal.mode === 'add' ? 'Tambah Produsen / Binaan LSSM' : 'Edit Produsen LSSM'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setLssmModal(prev => ({ ...prev, isOpen: false }))}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLssm} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Provinsi Lokasi *</label>
                <select
                  value={lssmModal.item.provinsi}
                  onChange={(e) => setLssmModal(prev => ({ ...prev, item: { ...prev.item, provinsi: e.target.value } }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs outline-none"
                >
                  {PROVINCES_INDONESIA.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Produsen / Balai Binaan *</label>
                <input
                  type="text"
                  required
                  value={lssmModal.item.nama_produsen}
                  onChange={(e) => setLssmModal(prev => ({ ...prev, item: { ...prev.item, nama_produsen: e.target.value } }))}
                  placeholder="Contoh: PT Horti Agro Sejahtera"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Alamat Fasilitas / Kebun *</label>
                <textarea
                  rows={2}
                  required
                  value={lssmModal.item.alamat}
                  onChange={(e) => setLssmModal(prev => ({ ...prev, item: { ...prev.item, alamat: e.target.value } }))}
                  placeholder="Alamat lengkap fasilitas produksi benih..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setLssmModal(prev => ({ ...prev, isOpen: false }))}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-md active:scale-95 transition-all"
                >
                  Simpan Produsen LSSM
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: TAMBAH / EDIT SATUAN BENIH
      ========================================================================= */}
      {unitModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-emerald-600" />
                <h3 className="font-heading font-bold text-slate-900 text-base">
                  {unitModal.mode === 'add' ? 'Tambah Satuan Benih' : 'Edit Satuan Benih'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setUnitModal(prev => ({ ...prev, isOpen: false }))}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUnit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kode Satuan (Singkatan) *</label>
                <input
                  type="text"
                  required
                  value={unitModal.item.code}
                  onChange={(e) => setUnitModal(prev => ({ ...prev, item: { ...prev.item, code: e.target.value.toLowerCase() } }))}
                  placeholder="Contoh: kg / batang / knol / stek"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 font-mono text-xs outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Satuan Lengkap *</label>
                <input
                  type="text"
                  required
                  value={unitModal.item.name}
                  onChange={(e) => setUnitModal(prev => ({ ...prev, item: { ...prev.item, name: e.target.value } }))}
                  placeholder="Contoh: Kg (Kilogram) / Batang"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Deskripsi Penggunaan *</label>
                <textarea
                  rows={2}
                  required
                  value={unitModal.item.description}
                  onChange={(e) => setUnitModal(prev => ({ ...prev, item: { ...prev.item, description: e.target.value } }))}
                  placeholder="Satuan perbanyakan bibit tanaman hortikultura..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Catatan Teknis / Konversi</label>
                <input
                  type="text"
                  value={unitModal.item.note}
                  onChange={(e) => setUnitModal(prev => ({ ...prev, item: { ...prev.item, note: e.target.value } }))}
                  placeholder="Contoh: 1 knol = 1 kg untuk kentang"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setUnitModal(prev => ({ ...prev, isOpen: false }))}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md active:scale-95 transition-all"
                >
                  Simpan Satuan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          GLOBAL DELETE CONFIRMATION MODAL
      ========================================================================= */}
      {deleteModal && deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-heading font-bold text-slate-900 text-base">
                Konfirmasi Penghapusan
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                {deleteModal.title}
              </p>
              <p className="text-[11px] text-red-500 mt-2 font-medium">
                Tindakan ini akan menghapus data dari daftar master dan tidak dapat dibatalkan.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setDeleteModal(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  if (deleteModal.type === 'commodity') {
                    handleDeleteCommodityConfirm(deleteModal.data.name, deleteModal.data.category);
                  } else if (deleteModal.type === 'bpsb') {
                    handleDeleteBpsb(deleteModal.data.id);
                  } else if (deleteModal.type === 'lssm') {
                    handleDeleteLssm(deleteModal.data.id);
                  } else if (deleteModal.type === 'unit') {
                    handleDeleteUnit(deleteModal.data.id, deleteModal.data.code);
                  }
                }}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-600/20 active:scale-95 transition-all"
              >
                Ya, Hapus Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Detail Modal */}
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
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 transition-colors"
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
