'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  User, 
  Mail, 
  Lock, 
  Camera, 
  Upload, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Building2, 
  Phone,
  RefreshCw
} from 'lucide-react';

interface AuthUser {
  id: number;
  name: string;
  username: string;
  email: string;
  role: string;
  province?: string;
  agency_name?: string;
  phone?: string;
  avatar?: string;
}

export default function ProfilPage() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [agencyName, setAgencyName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Avatar upload state
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const savedUser = localStorage.getItem('sim_benih_user');
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser) as AuthUser;
        setCurrentUser(u);
        setName(u.name || '');
        setUsername(u.username || '');
        setEmail(u.email || '');
        setPhone(u.phone || '');
        setAgencyName(u.agency_name || '');
        if (u.avatar) {
          setAvatarPreview(u.avatar);
        }
      } catch {
        // ignore
      }
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) {
        setErrorMsg('File yang dipilih harus berupa gambar (JPG, PNG, atau WebP).');
        return;
      }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
      setErrorMsg('');
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (newPassword && newPassword !== confirmPassword) {
      setErrorMsg('Konfirmasi kata sandi baru tidak cocok.');
      return;
    }

    if (!currentUser) return;

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('user_id', String(currentUser.id));
      formData.append('name', name.trim());
      formData.append('username', username.trim());
      formData.append('email', email.trim());
      formData.append('phone', phone.trim());
      formData.append('agency_name', agencyName.trim());
      
      if (newPassword.trim()) {
        formData.append('new_password', newPassword.trim());
      }

      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      const res = await fetch('/api/users/profile', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();

      if (res.ok && data.status === 'success' && data.user) {
        let msg = 'Profil dan foto avatar berhasil diperbarui di database.';

        // If user is regular role and requested password change, send to password-requests
        if (newPassword.trim() && currentUser.role !== 'super_admin') {
          try {
            const reqRes = await fetch('/api/password-requests', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                user_id: currentUser.id,
                new_password: newPassword.trim(),
                reason: 'Permintaan pembaruan kata sandi dari profil akun'
              })
            });
            const reqData = await reqRes.json();
            if (reqRes.ok && reqData.status === 'success') {
              msg = 'Profil diperbarui. Permintaan ubah kata sandi telah dikirim ke Super Admin Pusat untuk verifikasi & persetujuan.';
            }
          } catch {
            // keep standard profile success
          }
        }

        setSuccessMsg(msg);
        setCurrentUser(data.user);
        localStorage.setItem('sim_benih_user', JSON.stringify(data.user));
        // Dispatch custom event to notify layout
        window.dispatchEvent(new Event('kementan_user_updated'));
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setErrorMsg(data.message || 'Gagal menyimpan perubahan profil.');
      }
    } catch {
      setErrorMsg('Gagal terhubung ke backend server. Perubahan belum tersimpan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Profile - True Dual Mode */}
      <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-emerald-800 via-teal-700 to-emerald-800 text-white border border-emerald-400/30 shadow-xl backdrop-blur-xl transition-colors">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Avatar with Upload Action */}
          <div className="relative group shrink-0">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden border-2 border-emerald-400/50 shadow-2xl bg-slate-800 flex items-center justify-center">
              {avatarPreview || (currentUser?.username === 'superadmin' ? '/images/avatar_superadmin.jpg' : null) ? (
                <img 
                  src={avatarPreview || (currentUser?.username === 'superadmin' ? '/images/avatar_superadmin.jpg' : '')} 
                  alt={name || 'Avatar'} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-tr from-emerald-700 to-teal-500 flex items-center justify-center text-white font-black text-3xl font-heading">
                  {name ? name.charAt(0).toUpperCase() : 'S'}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-2 -right-2 p-2.5 rounded-2xl bg-emerald-500 text-slate-950 shadow-lg transition-transform group-hover:scale-110 active:scale-95 cursor-pointer"
              title="Unggah Foto Avatar Baru"
            >
              <Camera className="w-4 h-4" />
            </button>
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/png, image/jpeg, image/jpg, image/webp"
              className="hidden" 
            />
          </div>

          <div className="space-y-1 text-center sm flex-1">
            <div className="text-xs font-bold text-amber-300 uppercase tracking-widest">
              Pengaturan Akun & Legalitas Akses
            </div>
            <h1 className="font-heading font-black text-2xl sm:text-white tracking-tight">
              {name || 'Pengguna Sistem'}
            </h1>
            <p className="text-xs text-emerald-100">
              {agencyName || 'Direktorat Perbenihan Hortikultura • Kementan RI'}
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs">
              <span className="px-3 py-1 rounded-xl bg-white/20 text-white border border-white/25 font-mono">
                @{username || 'user'}
              </span>
              <span className="px-3 py-1 rounded-xl bg-emerald-900/40 text-white border border-white/20 font-bold uppercase">
                Peran: {currentUser?.role || 'User'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Form Card */}
      <div className="bg-white/90 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 transition-colors">
        <div className="border-b border-slate-200 pb-4">
          <h2 className="font-heading font-bold text-lg text-slate-900">
            Perbarui Informasi Profil
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Semua perubahan akan langsung disinkronkan ke database MySQL Kementerian Pertanian.
          </p>
        </div>

        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span className="font-medium">{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="space-y-6">
          {/* Section 1: Data Pokok */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">
                Nama Lengkap / Pimpinan
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-900 outline-none transition-all"
                  placeholder="Nama Lengkap"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">
                Username Akun
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-900 outline-none transition-all"
                  placeholder="Username Akun"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">
                Alamat Email Resmi
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-900 outline-none transition-all"
                  placeholder="email@pertanian.go.id"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">
                Nomor Telepon / Kontak
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-900 outline-none transition-all"
                  placeholder="0812-xxxx-xxxx"
                />
              </div>
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-semibold text-slate-700 block">
                Instansi / Balai BPSB / Lembaga
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={agencyName}
                  onChange={(e) => setAgencyName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-900 outline-none transition-all"
                  placeholder="Nama Instansi atau Perusahaan"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Ganti Password */}
          <div className="pt-4 border-t border-slate-200 space-y-4">
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Ganti Kata Sandi (Opsional)
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {currentUser?.role === 'super_admin' 
                  ? 'Sebagai Super Admin, perubahan kata sandi langsung aktif.'
                  : 'Catatan: Permintaan ubah kata sandi pengguna akan diteruskan ke Super Admin Pusat untuk verifikasi & persetujuan.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  Kata Sandi Baru
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-900 outline-none transition-all"
                    placeholder="Minimal 6 karakter"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  Ulangi Kata Sandi Baru
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-900 outline-none transition-all"
                    placeholder="Ketik ulang kata sandi baru"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-slate-200 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2 active:scale-95"
            >
              <Save className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Menyimpan ke Database...' : 'Simpan Perubahan'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
