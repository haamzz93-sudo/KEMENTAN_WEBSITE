'use client';

import React, { useState } from 'react';
import { Bug, X, Send, CheckCircle2, AlertTriangle, MessageSquare } from 'lucide-react';
import CustomDropdown from '@/components/ui/CustomDropdown';

interface ReportBugModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUrl?: string;
  defaultUserName?: string;
}

export default function ReportBugModal({
  isOpen,
  onClose,
  currentUrl,
  defaultUserName
}: ReportBugModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'bug' | 'ui' | 'account' | 'suggestion'>('bug');
  const [severity, setSeverity] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [reporterName, setReporterName] = useState(defaultUserName || '');
  const [reporterContact, setReporterContact] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setErrorMsg('Judul dan deskripsi laporan wajib diisi.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/reports/bug', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          category,
          severity,
          reporter_name: reporterName.trim() || 'Pengguna Sistem',
          reporter_contact: reporterContact.trim(),
          page_url: currentUrl || (typeof window !== 'undefined' ? window.location.pathname : '')
        })
      });

      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          onClose();
          setTitle('');
          setDescription('');
        }, 2500);
      } else {
        setErrorMsg(data.message || 'Gagal mengirim laporan kendala.');
      }
    } catch {
      setErrorMsg('Gagal terhubung ke server backend.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200 transition-colors">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-red-950 via-slate-900 to-emerald-950 text-white p-5 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30">
              <Bug className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-extrabold text-sm text-white">
                Lapor Bug & Kendala Sistem
              </h3>
              <p className="text-[11px] text-slate-300">
                Pusat aduan teknis & peningkatan pengalaman pengguna Kementan RI
              </p>
            </div>
          </div>

          <button 
            onClick={onClose} 
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        {success ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center border border-emerald-500/30">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="font-heading font-bold text-base text-slate-900 dark:text-white">
              Laporan Berhasil Terkirim!
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Terima kasih. Laporan kendala teknis Anda telah diteruskan ke Super Admin dan Tim IT Direktorat Perbenihan Hortikultura.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-900 dark:text-red-300 text-xs">
                {errorMsg}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Kategori Kendala
                </label>
                <CustomDropdown
                  options={[
                    { value: 'bug', label: 'Error / Bug Fungsi' },
                    { value: 'ui', label: 'Masalah Tampilan / UI' },
                    { value: 'account', label: 'Kendala Login / Akun' },
                    { value: 'suggestion', label: 'Saran Peningkatan' },
                  ]}
                  value={category}
                  onChange={(val) => setCategory(val as any)}
                  placeholder="Kategori Kendala"
                  size="sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tingkat Urgensi
                </label>
                <CustomDropdown
                  options={[
                    { value: 'low', label: 'Rendah (Kosmetik)', badge: 'Rendah' },
                    { value: 'medium', label: 'Sedang (Kendala Biasa)', badge: 'Sedang' },
                    { value: 'high', label: 'Tinggi (Fitur Terganggu)', badge: 'Tinggi', badgeColor: 'bg-amber-100 text-amber-800' },
                    { value: 'critical', label: 'Kritis (Sistem Terhenti)', badge: 'Kritis', badgeColor: 'bg-red-100 text-red-800' },
                  ]}
                  value={severity}
                  onChange={(val) => setSeverity(val as any)}
                  placeholder="Urgensi"
                  size="sm"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Judul Masalah *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Tombol mode malam tidak merubah warna card"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl outline-none focus:border-emerald-600 text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Deskripsi Detail Masalah *
              </label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Jelaskan apa yang terjadi, langkah untuk memicu kendala, dan apa yang diharapkan..."
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl outline-none focus:border-emerald-600 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Pelapor
                </label>
                <input
                  type="text"
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  placeholder="Nama Anda"
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl outline-none focus:border-emerald-600 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Kontak (No HP / WhatsApp)
                </label>
                <input
                  type="text"
                  value={reporterContact}
                  onChange={(e) => setReporterContact(e.target.value)}
                  placeholder="0812xxxxxx"
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl outline-none focus:border-emerald-600 text-xs"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end space-x-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Batal
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 active:scale-95"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{loading ? 'Mengirim...' : 'Kirim Laporan'}</span>
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
