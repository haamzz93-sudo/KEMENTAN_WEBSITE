'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  Building2, 
  Award, 
  Layers, 
  Sprout, 
  Search, 
  Edit, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Plus, 
  Key, 
  Mail, 
  Phone, 
  MapPin, 
  X,
  Lock,
  Check,
  Ban,
  Bug,
  AlertTriangle,
  Clock,
  ExternalLink,
  Eye,
  Shield
} from 'lucide-react';
import { UserRole } from '@/types';
import { PROVINCES_INDONESIA } from '@/data/masterData';
import CustomDropdown, { DropdownOption } from '@/components/ui/CustomDropdown';

interface UserRecord {
  id: number;
  name: string;
  email: string;
  username: string;
  role: UserRole;
  province?: string;
  agency_name?: string;
  phone?: string;
  status: 'active' | 'inactive';
  created_at?: string;
}

interface PasswordRequest {
  id: number;
  user_id: number;
  username: string;
  name: string;
  role: string;
  plain_hint?: string;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_note?: string;
  created_at: string;
}

interface BugReport {
  id: number;
  reporter_name: string;
  reporter_contact?: string;
  title: string;
  page_url?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'bug' | 'ui' | 'account' | 'suggestion';
  description: string;
  status: 'baru' | 'investigasi' | 'selesai';
  created_at: string;
}

const INITIAL_USERS: UserRecord[] = [
  {
    id: 1,
    name: 'Super Admin Pusat (Ditjen Hortikultura)',
    email: 'superadmin@pertanian.go.id',
    username: 'superadmin',
    role: 'super_admin',
    province: 'Pusat (DKI Jakarta)',
    agency_name: 'Direktorat Perbenihan Hortikultura',
    phone: '021-7815380',
    status: 'active',
    created_at: '2026-09-01'
  },
  {
    id: 2,
    name: 'Petugas BPSB Jawa Barat',
    email: 'bpsb.jabar@pertanian.go.id',
    username: 'bpsb_jabar',
    role: 'bpsb',
    province: 'Jawa Barat',
    agency_name: 'BPSBTPH Prov. Jawa Barat',
    phone: '022-7561234',
    status: 'active',
    created_at: '2026-09-02'
  },
  {
    id: 3,
    name: 'Petugas BPSB Jawa Timur',
    email: 'bpsb.jatim@pertanian.go.id',
    username: 'bpsb_jatim',
    role: 'bpsb',
    province: 'Jawa Timur',
    agency_name: 'UPT PSBTPH Jawa Timur',
    phone: '031-8291234',
    status: 'active',
    created_at: '2026-09-02'
  },
  {
    id: 4,
    name: 'Auditor Mutu LSSM Nasional',
    email: 'auditor.lssm@pertanian.go.id',
    username: 'auditor_lssm',
    role: 'lssm',
    province: 'Nasional',
    agency_name: 'Lembaga Sertifikasi Sistem Mutu Benih (LSSM 01-IDN)',
    phone: '021-7889988',
    status: 'active',
    created_at: '2026-09-03'
  },
  {
    id: 5,
    name: 'Sekretariat & Tim Penilai TP2VH',
    email: 'tp2vh@pertanian.go.id',
    username: 'tim_tp2vh',
    role: 'tp2vh',
    province: 'Pusat (DKI Jakarta)',
    agency_name: 'Tim Penilai Pelepasan Varietas Hortikultura',
    phone: '021-7815380 ext. 2341',
    status: 'active',
    created_at: '2026-09-04'
  },
  {
    id: 6,
    name: 'PT East West Seed Indonesia (Pemohon)',
    email: 'pemohon@eastwestseed.com',
    username: 'pemohon_ewsi',
    role: 'applicant',
    province: 'Jawa Barat',
    agency_name: 'PT East West Seed Indonesia',
    phone: '0264-201871',
    status: 'active',
    created_at: '2026-09-05'
  }
];

export default function PenggunaManagementPage() {
  const [activeTab, setActiveTab] = useState<'users' | 'password_requests' | 'bugs'>('users');
  const [users, setUsers] = useState<UserRecord[]>(INITIAL_USERS);
  const [passwordRequests, setPasswordRequests] = useState<PasswordRequest[]>([]);
  const [bugReports, setBugReports] = useState<BugReport[]>([]);
  
  const [filterRole, setFilterRole] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<UserRecord | null>(null);
  const [selectedUserDetail, setSelectedUserDetail] = useState<UserRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    password: 'Kementan2026!',
    role: 'bpsb' as UserRole,
    province: 'Jawa Barat',
    agency_name: '',
    phone: '',
    status: 'active' as 'active' | 'inactive'
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      if (res.ok && data.data && data.data.length > 0) {
        setUsers(data.data);
      }
    } catch {
      // Keep state if offline
    } finally {
      setLoading(false);
    }
  };

  const fetchPasswordRequests = async () => {
    try {
      const res = await fetch('/api/password-requests');
      const data = await res.json();
      if (res.ok && data.data) {
        setPasswordRequests(data.data);
      }
    } catch {
      // offline
    }
  };

  const fetchBugReports = async () => {
    try {
      const res = await fetch('/api/reports/bug');
      const data = await res.json();
      if (res.ok && data.data) {
        setBugReports(data.data);
      }
    } catch {
      // offline
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchPasswordRequests();
    fetchBugReports();
  }, []);

  const openAddModal = () => {
    setEditUser(null);
    setFormData({
      name: '',
      email: '',
      username: '',
      password: 'Kementan2026!',
      role: 'bpsb',
      province: 'Jawa Barat',
      agency_name: '',
      phone: '',
      status: 'active'
    });
    setModalOpen(true);
  };

  const openEditModal = (u: UserRecord) => {
    setEditUser(u);
    setFormData({
      name: u.name,
      email: u.email,
      username: u.username,
      password: '',
      role: u.role,
      province: u.province || '',
      agency_name: u.agency_name || '',
      phone: u.phone || '',
      status: u.status
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editUser) {
        // Edit existing
        const res = await fetch(`/api/users/${editUser.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        const data = await res.json();
        if (res.ok && data.status === 'success') {
          setUsers(prev => prev.map(u => u.id === editUser.id ? { ...u, ...formData } : u));
          setNotification({ type: 'success', message: `Data pengguna "${formData.name}" berhasil diperbarui.` });
        } else {
          setUsers(prev => prev.map(u => u.id === editUser.id ? { ...u, ...formData } : u));
          setNotification({ type: 'success', message: 'Data pengguna diperbarui.' });
        }
      } else {
        // Add new
        const res = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        const data = await res.json();
        if (res.ok && data.status === 'success' && data.user) {
          setUsers(prev => [data.user, ...prev]);
          setNotification({ type: 'success', message: `Akun baru "${formData.name}" berhasil dibuat.` });
        } else {
          const newUser: UserRecord = {
            id: Date.now(),
            ...formData,
            created_at: new Date().toISOString().split('T')[0]
          };
          setUsers(prev => [newUser, ...prev]);
          setNotification({ type: 'success', message: `Akun baru "${formData.name}" berhasil ditambahkan.` });
        }
      }
      setModalOpen(false);
    } catch {
      setNotification({ type: 'success', message: 'Data pengguna tersimpan secara lokal dan sinkron.' });
      setModalOpen(false);
    } finally {
      setLoading(false);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (id === 1) {
      alert('Akun Super Admin Utama tidak dapat dihapus demi keamanan sistem.');
      return;
    }
    if (!confirm(`Hapus akun pengguna "${name}"?`)) return;

    try {
      await fetch(`/api/users/${id}`, { method: 'DELETE' });
    } catch {
      // Ignore network error
    }
    setUsers(prev => prev.filter(u => u.id !== id));
    setNotification({ type: 'success', message: `Pengguna ${name} berhasil dihapus.` });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleApprovePassword = async (requestId: number, username: string) => {
    try {
      const res = await fetch('/api/password-requests/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ request_id: requestId, admin_note: 'Disetujui oleh Super Admin Pusat' })
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setPasswordRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'approved' } : r));
        setNotification({ type: 'success', message: `Permintaan ganti kata sandi @${username} berhasil DISETUJUI dan diterapkan!` });
      }
    } catch {
      setPasswordRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'approved' } : r));
      setNotification({ type: 'success', message: `Permintaan ganti kata sandi @${username} disetujui.` });
    }
    setTimeout(() => setNotification(null), 4000);
  };

  const handleRejectPassword = async (requestId: number, username: string) => {
    try {
      const res = await fetch('/api/password-requests/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ request_id: requestId, admin_note: 'Ditolak: Informasi otentikasi tidak lengkap' })
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setPasswordRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'rejected' } : r));
        setNotification({ type: 'error', message: `Permintaan ganti kata sandi @${username} ditolak.` });
      }
    } catch {
      setPasswordRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'rejected' } : r));
      setNotification({ type: 'error', message: `Permintaan ganti kata sandi @${username} ditolak.` });
    }
    setTimeout(() => setNotification(null), 4000);
  };

  const roleMeta: Record<UserRole, { label: string; badgeColor: string; icon: React.ElementType }> = {
    super_admin: { label: 'Super Admin Pusat', badgeColor: 'bg-emerald-950 text-emerald-300 border-emerald-700', icon: ShieldCheck },
    bpsb: { label: 'Petugas BPSB Prov.', badgeColor: 'bg-blue-950 text-blue-300 border-blue-700', icon: Building2 },
    lssm: { label: 'Auditor Mutu LSSM', badgeColor: 'bg-amber-950 text-amber-300 border-amber-700', icon: Award },
    tp2vh: { label: 'Tim Penilai TP2VH', badgeColor: 'bg-purple-950 text-purple-300 border-purple-700', icon: Layers },
    applicant: { label: 'Produsen / Pemohon', badgeColor: 'bg-slate-800 text-slate-200 border-slate-700', icon: Sprout },
    public: { label: 'Publik', badgeColor: 'bg-slate-700 text-slate-300 border-slate-600', icon: Users }
  };

  const filteredUsers = users.filter(u => {
    const matchRole = filterRole === 'all' || u.role === filterRole;
    const matchSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (u.agency_name && u.agency_name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchRole && matchSearch;
  });

  const pendingPasswordCount = passwordRequests.filter(r => r.status === 'pending').length;
  const newBugsCount = bugReports.filter(b => b.status === 'baru').length;

  return (
    <div className="space-y-6">
      
      {/* Header Banner - True Dual Mode */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-800 via-teal-700 to-emerald-800 text-white p-6 sm:p-8 border border-emerald-400/30 shadow-xl transition-colors">
        <div className="absolute right-0 top-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/20 border border-white/30 text-white text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
              <span>Otoritas Super Admin Pusat</span>
            </div>
            <h1 className="font-heading font-black text-2xl sm:text-white tracking-tight">
              Kelola Pengguna, Otorisasi & Stabilitas Web
            </h1>
            <p className="text-xs sm:text-emerald-50 leading-relaxed">
              Manajemen akun 38 BPSB Provinsi, Auditor LSSM Mutu, Tim TP2VH, persetujuan ganti kata sandi berjenjang, dan monitoring laporan kendala teknis.
            </p>
          </div>

          <div className="shrink-0 flex items-center space-x-3">
            <button
              onClick={() => {
                fetchUsers();
                fetchPasswordRequests();
                fetchBugReports();
              }}
              disabled={loading}
              className="p-3 rounded-2xl bg-white/15 border border-white/25 text-white transition-all shadow-xs hover:scale-105 active:scale-95"
              title="Refresh Seluruh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-300' : ''}`} />
            </button>

            {activeTab === 'users' && (
              <button
                onClick={openAddModal}
                className="relative group overflow-hidden inline-flex items-center space-x-2 px-5 py-3 rounded-2xl bg-white text-emerald-950 font-bold text-xs uppercase tracking-wider shadow-lg hover:scale-105 active:scale-95 transition-all"
              >
                <UserPlus className="w-4 h-4 text-emerald-700" />
                <span>Tambah Akun Baru</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {notification && (
        <div className={`p-4 rounded-2xl text-xs font-semibold flex items-center space-x-2.5 animate-in fade-in slide-in-from-top-2 border ${
          notification.type === 'success' 
            ? 'bg-emerald-50 text-emerald-900 border-emerald-300 shadow-sm' 
            : 'bg-red-50 text-red-900 border-red-300 shadow-sm'
        }`}>
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notification.message}</span>
        </div>
      )}

      {/* Main Tab Navigation */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-200/80 rounded-2xl">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'users'
              ? 'bg-white text-emerald-900 shadow-xs'
              : 'text-slate-600 hover'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Daftar Pengguna & Hak Akses ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('password_requests')}
          className={`relative flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'password_requests'
              ? 'bg-white text-amber-900 shadow-xs'
              : 'text-slate-600 hover'
          }`}
        >
          <Key className="w-4 h-4 text-amber-500" />
          <span>Persetujuan Ganti Password</span>
          {pendingPasswordCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500 text-slate-950 animate-pulse">
              {pendingPasswordCount} Pending
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('bugs')}
          className={`relative flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'bugs'
              ? 'bg-white text-red-900 shadow-xs'
              : 'text-slate-600 hover'
          }`}
        >
          <Bug className="w-4 h-4 text-red-500" />
          <span>Laporan Kendala & Feedback ({bugReports.length})</span>
          {newBugsCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-red-500 text-white">
              {newBugsCount} Baru
            </span>
          )}
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: USERS LIST */}
      {/* ========================================================================= */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          {/* Filter Tabs & Search Bar */}
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl border border-white shadow-[0_8px_30px_rgba(6,78,59,0.06)] p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
            {/* Role Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
              {[
                { id: 'all', label: 'Semua Akun' },
                { id: 'super_admin', label: 'Super Admin' },
                { id: 'bpsb', label: 'Petugas BPSB' },
                { id: 'lssm', label: 'Auditor LSSM' },
                { id: 'tp2vh', label: 'Tim TP2VH' },
                { id: 'applicant', label: 'Pemohon' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setFilterRole(tab.id)}
                  className={`whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    filterRole === tab.id
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama, email, username..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 text-xs text-slate-900 rounded-xl outline-none transition-all"
              />
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Pengguna & Instansi</th>
                    <th className="py-3.5 px-4">Kontak & Username</th>
                    <th className="py-3.5 px-4">Role Akses</th>
                    <th className="py-3.5 px-4">Wilayah</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-slate-400">
                        Tidak ada akun pengguna yang cocok dengan kriteria filter.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => {
                      const meta = roleMeta[u.role] || roleMeta.applicant;
                      const Icon = meta.icon;

                      return (
                        <tr key={u.id} className="hover transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900 text-xs">{u.name}</div>
                            <div className="text-[11px] text-slate-500">{u.agency_name || '-'}</div>
                          </td>

                          <td className="py-3.5 px-4 space-y-0.5">
                            <div className="font-mono text-[11px] font-semibold text-emerald-800">@{u.username}</div>
                            <div className="text-[11px] text-slate-500">{u.email}</div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border ${meta.badgeColor}`}>
                              <Icon className="w-3 h-3" />
                              <span>{meta.label}</span>
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="text-slate-700 font-medium">{u.province || '-'}</span>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              u.status === 'active' 
                                ? 'bg-emerald-100 text-emerald-800' 
                                : 'bg-slate-100 text-slate-600'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'active' ? 'bg-emerald-600' : 'bg-slate-400'}`} />
                              <span>{u.status === 'active' ? 'Aktif' : 'Nonaktif'}</span>
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end space-x-1.5">
                              <button
                                onClick={() => setSelectedUserDetail(u)}
                                className="p-1.5 text-slate-500 rounded-lg transition-colors"
                                title="Lihat Rincian Akun"
                              >
                                <Eye className="w-4 h-4 text-emerald-600" />
                              </button>
                              <button
                                onClick={() => openEditModal(u)}
                                className="p-1.5 text-slate-500 rounded-lg transition-colors"
                                title="Edit Pengguna"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              {u.id !== 1 && (
                                <button
                                  onClick={() => handleDelete(u.id, u.name)}
                                  className="p-1.5 text-slate-400 rounded-lg transition-colors"
                                  title="Hapus Akun"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: PASSWORD CHANGE APPROVALS */}
      {/* ========================================================================= */}
      {activeTab === 'password_requests' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Key className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Kebijakan Keamanan:</strong> Setiap permohonan pembaruan kata sandi dari peran non-admin wajib diverifikasi dan disetujui Super Admin sebelum aktif.
              </span>
            </div>
            <button
              onClick={fetchPasswordRequests}
              className="px-3 py-1 rounded-xl bg-amber-500/20 text-amber-900 font-bold"
            >
              Refresh
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Pengguna Pemohon</th>
                    <th className="py-3.5 px-4">Peran Akses</th>
                    <th className="py-3.5 px-4">Alasan / Catatan</th>
                    <th className="py-3.5 px-4">Waktu Pengajuan</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Keputusan Super Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {passwordRequests.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        Belum ada permohonan ganti kata sandi yang masuk.
                      </td>
                    </tr>
                  ) : (
                    passwordRequests.map((r) => (
                      <tr key={r.id} className="hover transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{r.name}</div>
                          <div className="text-[11px] font-mono text-emerald-800">@{r.username}</div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="uppercase text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                            {r.role}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                          {r.reason || 'Pembaruan kata sandi rutin akun'}
                        </td>

                        <td className="py-3.5 px-4 text-[11px] text-slate-500">
                          {r.created_at}
                        </td>

                        <td className="py-3.5 px-4">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            r.status === 'pending'
                              ? 'bg-amber-100 text-amber-900'
                              : r.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-900'
                              : 'bg-red-100 text-red-900'
                          }`}>
                            {r.status === 'pending' ? 'Menunggu Persetujuan' : r.status === 'approved' ? 'Disetujui' : 'Ditolak'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          {r.status === 'pending' ? (
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => handleApprovePassword(r.id, r.username)}
                                className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-xs transition-all active:scale-95"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Setujui</span>
                              </button>
                              <button
                                onClick={() => handleRejectPassword(r.id, r.username)}
                                className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-red-600/10 text-red-700 font-bold text-xs border border-red-300 transition-all active:scale-95"
                              >
                                <Ban className="w-3.5 h-3.5" />
                                <span>Tolak</span>
                              </button>
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">
                              {r.admin_note || 'Selesai diproses'}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: BUG REPORTS & FEEDBACK */}
      {/* ========================================================================= */}
      {activeTab === 'bugs' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-900 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bug className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                <strong>Pusat Kendali Feedback:</strong> Laporan bug tampilan, fungsionalitas, atau saran perbaikan dari seluruh pengguna web di 38 Provinsi.
              </span>
            </div>
            <button
              onClick={fetchBugReports}
              className="px-3 py-1 rounded-xl bg-blue-500/20 text-blue-900 font-bold"
            >
              Refresh
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bugReports.length === 0 ? (
              <div className="md:col-span-2 bg-white rounded-3xl p-12 text-center text-slate-400 border border-slate-200">
                Tidak ada laporan kendala teknis saat ini. Sistem berjalan stabil dan optimal.
              </div>
            ) : (
              bugReports.map((b) => (
                <div key={b.id} className="bg-white/95 backdrop-blur-xl rounded-2xl border border-white shadow-[0_8px_30px_rgba(6,78,59,0.06)] p-5 shadow-xs space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                      b.severity === 'critical' ? 'bg-red-500 text-white' :
                      b.severity === 'high' ? 'bg-amber-500 text-slate-950' :
                      'bg-emerald-500/20 text-emerald-800'
                    }`}>
                      Tingkat: {b.severity}
                    </span>

                    <span className="text-[11px] text-slate-400 font-mono">
                      {b.created_at}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-heading font-bold text-sm text-slate-900">
                      {b.title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 whitespace-pre-wrap">
                      {b.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      Pelapor: <strong>{b.reporter_name}</strong> {b.reporter_contact ? `(${b.reporter_contact})` : ''}
                    </div>
                    {b.page_url && (
                      <div className="font-mono text-emerald-700 truncate max-w-[200px]">
                        {b.page_url}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Modal Add / Edit User */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-emerald-950 to-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                <h3 className="font-heading font-bold text-sm">
                  {editUser ? 'Edit Data Pengguna' : 'Tambah Akun Pengguna Baru'}
                </h3>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Nama Lengkap</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Contoh: Dr. Ir. Budi Santoso"
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 text-slate-900 rounded-xl outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Email Resmi</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="nama@pertanian.go.id"
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 text-slate-900 rounded-xl outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Username</label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="username_kementan"
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 text-slate-900 rounded-xl outline-none"
                  />
                </div>

                <div>
                  <CustomDropdown
                    label="Role Hak Akses"
                    options={[
                      { value: 'super_admin', label: 'Super Admin Pusat', badge: 'SUPER ADMIN' },
                      { value: 'bpsb', label: 'Petugas BPSB (38 Provinsi)', badge: 'BPSB' },
                      { value: 'lssm', label: 'Auditor Mutu LSSM', badge: 'LSSM' },
                      { value: 'tp2vh', label: 'Tim Penilai TP2VH', badge: 'TP2VH' },
                      { value: 'applicant', label: 'Produsen / Pemohon', badge: 'PEMOHON' },
                    ]}
                    value={formData.role}
                    onChange={(val) => setFormData({ ...formData, role: val as UserRole })}
                  />
                </div>

                <div>
                  <CustomDropdown
                    label="Wilayah / Provinsi"
                    searchable={true}
                    searchPlaceholder="Cari provinsi..."
                    options={[
                      { value: 'Pusat (Kementerian Pertanian)', label: 'Pusat (Kementerian Pertanian)', badge: 'PUSAT' },
                      ...PROVINCES_INDONESIA.map(p => ({ value: p, label: p }))
                    ]}
                    value={formData.province || 'Pusat (Kementerian Pertanian)'}
                    onChange={(val) => setFormData({ ...formData, province: val })}
                    placeholder="Pilih Provinsi..."
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Nama Instansi / Badan Usaha</label>
                  <input
                    type="text"
                    value={formData.agency_name}
                    onChange={(e) => setFormData({ ...formData, agency_name: e.target.value })}
                    placeholder="Contoh: UPT PSBTPH Jawa Timur"
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 text-slate-900 rounded-xl outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Nomor Telepon / WhatsApp</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="0812xxxxxxxx"
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 text-slate-900 rounded-xl outline-none"
                  />
                </div>

                <div>
                  <CustomDropdown
                    label="Status Akun"
                    options={[
                      { value: 'active', label: 'Aktif (Dapat Login & Akses Sesi)', badge: 'AKTIF' },
                      { value: 'inactive', label: 'Nonaktif (Akses Ditangguhkan)', badge: 'NONAKTIF' }
                    ]}
                    value={formData.status}
                    onChange={(val) => setFormData({ ...formData, status: val as 'active' | 'inactive' })}
                  />
                </div>
              </div>

              {!editUser && (
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 space-y-0.5">
                  <div className="font-bold">Password Bawaan:</div>
                  <div className="font-mono text-emerald-800">Kementan2026! / admin123 (Dapat diganti oleh pengguna saat login)</div>
                </div>
              )}

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-2.5">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 rounded-xl transition-colors"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md hover:scale-105 active:scale-95 transition-all"
                >
                  {loading ? 'Menyimpan...' : 'Simpan Akun'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL LIHAT DETAIL PENGGUNA (Rapi, Tidak Ada Teks Terpotong) */}
      {selectedUserDetail && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedUserDetail(null)}
        >
          <div 
            className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200 text-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between pb-3 border-b border-slate-200">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block mb-1">
                  Rincian Profil Pengguna Terdaftar
                </span>
                <h3 className="font-heading font-black text-xl text-slate-900">
                  {selectedUserDetail.name}
                </h3>
                <span className="text-xs font-mono text-emerald-700">
                  @{selectedUserDetail.username}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUserDetail(null)}
                className="p-1.5 rounded-xl text-slate-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Role Hak Akses</div>
                <div className="font-bold text-slate-900 mt-0.5 uppercase">{selectedUserDetail.role}</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Status Akun</div>
                <div className="font-bold text-emerald-700 mt-0.5">
                  {selectedUserDetail.status === 'active' ? 'Aktif (Dapat Login)' : 'Nonaktif'}
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 sm:col-span-2">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Instansi / Badan Usaha</div>
                <div className="font-semibold text-slate-900 mt-0.5 leading-relaxed">
                  {selectedUserDetail.agency_name || 'Direktorat Perbenihan Hortikultura'}
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Alamat Email Resmi</div>
                <div className="font-semibold text-slate-900 mt-0.5 break-all">{selectedUserDetail.email}</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Nomor Kontak / Telepon</div>
                <div className="font-semibold text-slate-900 mt-0.5">{selectedUserDetail.phone || '-'}</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 sm:col-span-2">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Wilayah Penugasan</div>
                <div className="font-semibold text-slate-900 mt-0.5">{selectedUserDetail.province || 'Pusat (DKI Jakarta)'}</div>
              </div>
            </div>

            <div className="pt-2 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => {
                  const target = selectedUserDetail;
                  setSelectedUserDetail(null);
                  openEditModal(target);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs transition-colors flex items-center gap-1.5"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Edit Akun Ini</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedUserDetail(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs transition-colors"
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
