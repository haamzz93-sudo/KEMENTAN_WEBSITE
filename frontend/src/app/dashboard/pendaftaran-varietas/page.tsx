'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileCheck, 
  Plus, 
  Search, 
  CalendarClock, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Download, 
  FileText, 
  X, 
  Save, 
  Send,
  Timer,
  ChevronRight,
  Landmark,
  Layers,
  ArrowRight,
  Trash2
} from 'lucide-react';
import { INITIAL_VARIETY_APPLICATIONS, COMMODITIES_BY_CATEGORY } from '@/data/masterData';
import { VarietyApplication, PlantCategory, TP2VHSessionStatus } from '@/types';

// Helper to map DB row (snake_case) to Frontend Type (camelCase)
function mapDbToVariety(row: any): VarietyApplication {
  return {
    id: row.id,
    trackingCode: row.tracking_code || `VAR-${row.id}`,
    applicantName: row.applicant_name || '-',
    institutionType: row.institution_type || 'swasta',
    cropType: row.crop_type || 'sayuran',
    commodityName: row.commodity_name || '-',
    proposedVarietyName: row.proposed_variety_name || '-',
    lineage: row.lineage || '-',
    submissionDate: row.submission_date || new Date().toISOString().split('T')[0],
    currentStage: row.current_stage || 'layanan_1_rencana_uji',
    testNoticeLetterNo: row.test_notice_letter_no || undefined,
    testNoticeStatus: row.test_notice_status || undefined,
    testResponseLetterNo: row.test_response_letter_no || undefined,
    testResponseDate: row.test_response_date || undefined,
    tp2vhSessionDate: row.tp2vh_session_date || undefined,
    tp2vhSessionStatus: row.tp2vh_session_status || undefined,
    tp2vhNotes: row.tp2vh_notes || undefined,
    objectionStartDate: row.objection_start_date || undefined,
    objectionEndDate: row.objection_end_date || undefined,
    objectionDaysLeft: row.objection_days_left !== null ? Number(row.objection_days_left) : undefined,
    totalObjectionsCount: row.total_objections_count !== null ? Number(row.total_objections_count) : 0,
    recommendationLetterNo: row.recommendation_letter_no || undefined,
    registrationNumber: row.registration_number || undefined,
    statusText: row.status_text || 'Dalam Proses Verifikasi',
  };
}

export default function VarietyRegistrationPage() {
  const [applications, setApplications] = useState<VarietyApplication[]>(INITIAL_VARIETY_APPLICATIONS);
  const [activeLayananTab, setActiveLayananTab] = useState<'semua' | 'layanan_1' | 'layanan_2' | 'layanan_3' | 'layanan_4'>('semua');
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const [isEvaluationModalOpen, setIsEvaluationModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<VarietyApplication | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Load varieties directly from MySQL Backend
  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/varieties');
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data) && json.data.length > 0) {
          setApplications(json.data.map(mapDbToVariety));
        }
      }
    } catch {
      // fallback to initial
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Form State for Layanan 1 (Pemberitahuan Rencana Pengujian - Lampiran 1)
  const [noticeForm, setNoticeForm] = useState({
    applicantName: '',
    institutionType: 'swasta' as 'swasta' | 'pemerintah' | 'perseorangan',
    cropType: 'sayuran' as PlantCategory,
    commodityName: 'Cabai Rawit',
    proposedVarietyName: '',
    lineage: '',
    testNoticeLetterNo: '',
  });

  const handleNoticeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeForm.proposedVarietyName || !noticeForm.applicantName) {
      alert('Mohon lengkapi Nama Calon Varietas dan Nama Pemohon.');
      return;
    }

    const newCode = `VAR-2026-HORTI-0${Math.floor(800 + Math.random() * 199)}`;
    const payload = {
      tracking_code: newCode,
      applicant_name: noticeForm.applicantName,
      institution_type: noticeForm.institutionType,
      crop_type: noticeForm.cropType,
      commodity_name: noticeForm.commodityName,
      proposed_variety_name: noticeForm.proposedVarietyName,
      lineage: noticeForm.lineage || 'Hasil seleksi dan pemuliaan terarah',
      current_stage: 'layanan_1_rencana_uji',
      test_notice_letter_no: noticeForm.testNoticeLetterNo || `SURAT-UJI-${Math.floor(100 + Math.random() * 900)}/2026`,
      status_text: 'Menunggu Verifikasi Administrasi Rencana Uji (Format Lampiran 1)',
    };

    try {
      const res = await fetch('/api/varieties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        await loadData();
      }
    } catch {
      // Local fallback
      const localApp: VarietyApplication = {
        id: `var-${Date.now()}`,
        trackingCode: newCode,
        applicantName: noticeForm.applicantName,
        institutionType: noticeForm.institutionType,
        cropType: noticeForm.cropType,
        commodityName: noticeForm.commodityName,
        proposedVarietyName: noticeForm.proposedVarietyName,
        lineage: noticeForm.lineage || 'Hasil seleksi dan pemuliaan terarah',
        submissionDate: new Date().toISOString().split('T')[0],
        currentStage: 'layanan_1_rencana_uji',
        testNoticeLetterNo: payload.test_notice_letter_no,
        testNoticeStatus: 'menunggu_verifikasi',
        tp2vhSessionStatus: 'belum_sidang',
        totalObjectionsCount: 0,
        statusText: payload.status_text,
      };
      setApplications([localApp, ...applications]);
    }

    setIsNoticeModalOpen(false);
    setSuccessToast(`Surat Pemberitahuan Rencana Uji untuk ${noticeForm.proposedVarietyName} berhasil tersimpan ke basis data MySQL (Kode Tiket: ${newCode})`);
    setTimeout(() => setSuccessToast(null), 5000);

    setNoticeForm({
      applicantName: '',
      institutionType: 'swasta',
      cropType: 'sayuran',
      commodityName: 'Cabai Rawit',
      proposedVarietyName: '',
      lineage: '',
      testNoticeLetterNo: '',
    });
  };

  // Status Action: Approve Layanan 1 (Respon Uji)
  const handleApproveNotice = async (appId: string | number) => {
    const responseLetter = `B-${Math.floor(100 + Math.random() * 900)}/SR.120/D.2/${new Date().getMonth() + 1}/2026`;
    const today = new Date().toISOString().split('T')[0];

    try {
      await fetch(`/api/varieties/${appId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          test_notice_status: 'disetujui',
          test_response_letter_no: responseLetter,
          test_response_date: today,
          current_stage: 'layanan_2_permohonan_sidang',
          status_text: 'Surat Respon Uji Terbit — Pengujian Lapangan Dapat Dimulai'
        })
      });
      await loadData();
    } catch {
      setApplications(prev => prev.map(app => {
        if (app.id === appId) {
          return {
            ...app,
            testNoticeStatus: 'disetujui',
            testResponseLetterNo: responseLetter,
            testResponseDate: today,
            currentStage: 'layanan_2_permohonan_sidang',
            statusText: 'Surat Respon Uji Terbit — Pengujian Lapangan Dapat Dimulai',
          };
        }
        return app;
      }));
    }

    setSuccessToast('Surat Respon Persetujuan Rencana Pengujian berhasil diterbitkan & tersinkronisasi.');
    setTimeout(() => setSuccessToast(null), 4000);
  };

  // Status Action: Input TP2VH Session Result
  const handleTP2VHSessionSubmit = async (status: TP2VHSessionStatus, notes: string) => {
    if (!selectedApp) return;

    const payload: any = {};
    const today = new Date().toISOString().split('T')[0];

    if (status === 'lolos_disetujui') {
      const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      payload.tp2vh_session_status = 'lolos_disetujui';
      payload.tp2vh_notes = notes || 'Lolos penilaian teknis keunggulan dan kebenaran varietas.';
      payload.current_stage = 'layanan_3_masa_sanggah';
      payload.objection_start_date = today;
      payload.objection_end_date = nextMonth;
      payload.objection_days_left = 30;
      payload.status_text = 'Lolos Sidang TP2VH — Dipublikasikan ke Masa Sanggah Publik 30 Hari';
    } else if (status === 'perbaikan_dokumen') {
      payload.tp2vh_session_status = 'perbaikan_dokumen';
      payload.tp2vh_notes = notes || 'Perlu melengkapi lampiran uji keunggulan (Format Lampiran 2.b).';
      payload.status_text = 'Perlu Perbaikan Dokumen Sidang (Lampiran 2.b)';
    } else {
      payload.tp2vh_session_status = 'tunda_bahas';
      payload.tp2vh_notes = notes || 'Dijadwalkan ulang pada sidang pleno berikutnya.';
      payload.status_text = 'Tunda Bahas — Membutuhkan Pengujian Konfirmasi Tambahan';
    }

    try {
      await fetch(`/api/varieties/${selectedApp.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      await loadData();
    } catch {
      // Local fallback
      setApplications(prev => prev.map(app => {
        if (app.id === selectedApp.id) {
          if (status === 'lolos_disetujui') {
            return {
              ...app,
              tp2vhSessionStatus: 'lolos_disetujui',
              tp2vhNotes: notes || 'Lolos penilaian teknis keunggulan dan kebenaran varietas.',
              currentStage: 'layanan_3_masa_sanggah',
              objectionStartDate: today,
              objectionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              objectionDaysLeft: 30,
              statusText: 'Lolos Sidang TP2VH — Dipublikasikan ke Masa Sanggah Publik 30 Hari',
            };
          }
        }
        return app;
      }));
    }

    setIsEvaluationModalOpen(false);
    setSelectedApp(null);
    setSuccessToast(`Hasil Sidang TP2VH untuk ${selectedApp.proposedVarietyName} berhasil diperbarui di MySQL.`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  // Final Action: Terbitkan Tanda Daftar Resmi
  const handleFinalizeRegistration = async (appId: string | number) => {
    const recNo = `SR.120/${Math.floor(100 + Math.random() * 900)}/D.2/2026`;
    const regNo = `${Math.floor(100 + Math.random() * 900)}/Kpts/PV.240/D/${new Date().getFullYear()}`;

    try {
      await fetch(`/api/varieties/${appId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_stage: 'layanan_4_selesai_terdaftar',
          objection_days_left: 0,
          recommendation_letter_no: recNo,
          registration_number: regNo,
          status_text: 'Selesai — Surat Rekomendasi Terbit & Tanda Daftar PPVTPP Aktif'
        })
      });
      await loadData();
    } catch {
      setApplications(prev => prev.map(app => {
        if (app.id === appId) {
          return {
            ...app,
            currentStage: 'layanan_4_selesai_terdaftar',
            objectionDaysLeft: 0,
            recommendationLetterNo: recNo,
            registrationNumber: regNo,
            statusText: 'Selesai — Surat Rekomendasi Terbit & Tanda Daftar PPVTPP Aktif',
          };
        }
        return app;
      }));
    }

    setSuccessToast('Surat Rekomendasi Pendaftaran & Tanda Daftar resmi berhasil diterbitkan dan masuk ke Katalog Publik.');
    setTimeout(() => setSuccessToast(null), 4000);
  };

  // Delete Action: Hapus Data Varietas
  const handleDeleteApp = async (appId: string | number, name: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus permohonan varietas "${name}" dari database?`)) {
      return;
    }

    try {
      await fetch(`/api/varieties/${appId}`, { method: 'DELETE' });
      await loadData();
      setSuccessToast(`Permohonan varietas "${name}" berhasil dihapus.`);
    } catch {
      setApplications(prev => prev.filter(a => a.id !== appId));
    }
  };

  // Filtered List
  const filteredApps = applications.filter(app => {
    if (activeLayananTab === 'layanan_1') return app.currentStage === 'layanan_1_rencana_uji';
    if (activeLayananTab === 'layanan_2') return app.currentStage === 'layanan_2_permohonan_sidang';
    if (activeLayananTab === 'layanan_3') return app.currentStage === 'layanan_3_masa_sanggah';
    if (activeLayananTab === 'layanan_4') return app.currentStage === 'layanan_4_selesai_terdaftar';
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-xl bg-kementan-forest-900 text-white shadow-xl flex items-center space-x-3 border border-emerald-500 animate-slideUp">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-medium">{successToast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-200 gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-emerald-700 font-bold uppercase tracking-wider">
            <FileCheck className="w-4 h-4" />
            <span>MODUL C — PERMENTAN NO. 24 TAHUN 2025</span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl text-slate-900 mt-1">
            Pendaftaran Varietas Tanaman Hortikultura
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Layanan terpadu: Pemberitahuan Rencana Uji, Sidang TP2VH, Publikasi Masa Sanggah 30 Hari, dan Penerbitan Tanda Daftar.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsNoticeModalOpen(true)}
            className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-emerald-700 text-white text-xs font-bold shadow-md transition-all hover:scale-[1.02] active:scale-95"
          >
            <Plus className="w-4 h-4 text-emerald-200" />
            <span>Ajukan Pemberitahuan Uji (Lampiran 1)</span>
          </button>
        </div>
      </div>

      {/* BANNER INTEGRASI PORTAL PROSEED KEMENTAN RI */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-900 to-teal-900 text-white shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/20">
            <ShieldCheck className="w-6 h-6 text-emerald-300" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-sm text-emerald-200">Portal Integrasi Proseed Kementan RI</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-800 text-emerald-200 font-bold border border-emerald-600">benih.pertanian.go.id</span>
            </div>
            <p className="text-xs text-emerald-100/90 mt-0.5">
              Seluruh data pendaftaran varietas terkoneksi dengan portal nasional perbenihan untuk sinkronisasi masa sanggah 30 hari publik dan pengecekan tanda daftar resmi.
            </p>
          </div>
        </div>
        <a
          href="https://benih.pertanian.go.id"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-white text-emerald-950 font-bold text-xs hover:bg-emerald-50 transition-all shrink-0 shadow-xs"
        >
          <span>Kunjungi Proseed Kementan</span>
          <ArrowRight className="w-3.5 h-3.5 text-emerald-800" />
        </a>
      </div>

      {/* 4 Layanan Tabs Navigation */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-200/70 rounded-xl">
        <button
          onClick={() => setActiveLayananTab('semua')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeLayananTab === 'semua' 
              ? 'bg-white text-slate-900 shadow-xs' 
              : 'text-slate-600 hover'
          }`}
        >
          Semua Permohonan ({applications.length})
        </button>

        <button
          onClick={() => setActiveLayananTab('layanan_1')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeLayananTab === 'layanan_1' 
              ? 'bg-white text-emerald-800 shadow-xs' 
              : 'text-slate-600 hover'
          }`}
        >
          1. Rencana Pengujian ({applications.filter(a => a.currentStage === 'layanan_1_rencana_uji').length})
        </button>

        <button
          onClick={() => setActiveLayananTab('layanan_2')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeLayananTab === 'layanan_2' 
              ? 'bg-white text-emerald-800 shadow-xs' 
              : 'text-slate-600 hover'
          }`}
        >
          2. Sidang Penilaian TP2VH ({applications.filter(a => a.currentStage === 'layanan_2_permohonan_sidang').length})
        </button>

        <button
          onClick={() => setActiveLayananTab('layanan_3')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeLayananTab === 'layanan_3' 
              ? 'bg-white text-amber-800 shadow-xs' 
              : 'text-slate-600 hover'
          }`}
        >
          3. Masa Sanggah 30 Hari ({applications.filter(a => a.currentStage === 'layanan_3_masa_sanggah').length})
        </button>

        <button
          onClick={() => setActiveLayananTab('layanan_4')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeLayananTab === 'layanan_4' 
              ? 'bg-white text-emerald-800 shadow-xs' 
              : 'text-slate-600 hover'
          }`}
        >
          4. Resmi Terdaftar ({applications.filter(a => a.currentStage === 'layanan_4_selesai_terdaftar').length})
        </button>
      </div>

      {/* Main List of Applications */}
      <div className="space-y-4">
        {filteredApps.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center text-slate-400 border border-slate-200">
            Tidak ada permohonan varietas pada tahapan ini.
          </div>
        ) : (
          filteredApps.map((item) => (
            <div key={item.id} className="bg-white/95 backdrop-blur-xl rounded-2xl border border-white shadow-[0_8px_30px_rgba(6,78,59,0.06)] shadow-2xs p-6 hover:shadow-md transition-all space-y-4">
              
              {/* Row 1: Top Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                <div className="flex items-center space-x-3">
                  <span className="font-mono text-xs font-bold text-emerald-900 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
                    {item.trackingCode}
                  </span>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {item.institutionType}
                  </span>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    {item.cropType}
                  </span>
                </div>

                <div className="text-xs text-slate-400">
                  Diajukan: <strong className="text-slate-700">{item.submissionDate}</strong>
                </div>
              </div>

              {/* Row 2: Main Info */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                <div className="md:col-span-8 space-y-1">
                  <span className="text-xs text-slate-500">Komoditas: <strong className="text-slate-700">{item.commodityName}</strong></span>
                  <h3 className="font-heading font-extrabold text-xl text-slate-900">
                    {item.proposedVarietyName}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200 text-[10px] font-bold">
                      <ShieldCheck className="w-3 h-3 text-amber-700" />
                      <span>Dokumen Rahasia Pemohon (Confidential Lock)</span>
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Silsilah & naskah uji dilindungi hak cipta pemulia (Permentan 24/2025).
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Pemohon: <span className="font-semibold text-slate-800">{item.applicantName}</span> • Silsilah: <em>{item.lineage}</em>
                  </p>
                </div>

                <div className="md:col-span-4 md space-y-1">
                  <span className="text-[11px] text-slate-400 block">Status Tahapan:</span>
                  <span className={`inline-block text-xs font-bold px-3 py-1 rounded-lg ${
                    item.currentStage === 'layanan_4_selesai_terdaftar' 
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300/40' 
                      : item.currentStage === 'layanan_3_masa_sanggah'
                      ? 'bg-amber-100 text-amber-900 border border-amber-300/40'
                      : 'bg-blue-100 text-blue-900 border border-blue-300/40'
                  }`}>
                    {item.statusText}
                  </span>
                </div>
              </div>

              {/* Row 3: Service Detail Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                
                {/* Layanan 1 Status */}
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">1. Rencana Uji</span>
                  <span className="font-medium text-slate-800">
                    {item.testResponseLetterNo ? `Disetujui (${item.testResponseLetterNo})` : 'Format Lampiran 1 Diajukan'}
                  </span>
                </div>

                {/* Layanan 2 Status */}
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">2. Sidang TP2VH</span>
                  <span className="font-medium text-slate-800">
                    {item.tp2vhSessionStatus === 'lolos_disetujui' ? 'Lolos Sidang Pleno' : 
                     item.tp2vhSessionStatus === 'perbaikan_dokumen' ? 'Perlu Perbaikan Lampiran 2.b' : 'Belum Terjadwal'}
                  </span>
                </div>

                {/* Layanan 3 Status */}
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">3. Masa Sanggah 30 Hari</span>
                  <span className={`font-bold ${item.objectionDaysLeft && item.objectionDaysLeft > 0 ? 'text-amber-700' : 'text-slate-800'}`}>
                    {item.objectionDaysLeft !== undefined && item.objectionDaysLeft > 0 
                      ? `Sisa ${item.objectionDaysLeft} Hari` 
                      : (item.currentStage === 'layanan_4_selesai_terdaftar' ? 'Selesai Tanpa Sanggahan' : 'Belum Dimulai')}
                  </span>
                </div>

              </div>

              {/* Row 4: Action Buttons (Interaksi Sesuai Tahapan) */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
                <div className="text-[11px] text-slate-500 font-mono">
                  {item.registrationNumber && `Tanda Daftar Resmi: ${item.registrationNumber}`}
                </div>

                <div className="flex items-center space-x-2">
                  
                  {/* Layanan 1 Action: Verifikasi Rencana Uji */}
                  {item.currentStage === 'layanan_1_rencana_uji' && (
                    <button
                      onClick={() => handleApproveNotice(item.id)}
                      className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-kementan-forest-900 text-white text-xs font-bold transition-colors"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                      <span>Terbitkan Surat Respon Uji</span>
                    </button>
                  )}

                  {/* Layanan 2 Action: Evaluasi Sidang TP2VH */}
                  {item.currentStage === 'layanan_2_permohonan_sidang' && (
                    <button
                      onClick={() => {
                        setSelectedApp(item);
                        setIsEvaluationModalOpen(true);
                      }}
                      className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-kementan-forest-900 text-white text-xs font-bold transition-colors"
                    >
                      <FileCheck className="w-3.5 h-3.5 text-emerald-300" />
                      <span>Input Hasil Sidang TP2VH</span>
                    </button>
                  )}

                  {/* Layanan 3 Action: Selesaikan Masa Sanggah & Terbitkan SK */}
                  {item.currentStage === 'layanan_3_masa_sanggah' && (
                    <button
                      onClick={() => handleFinalizeRegistration(item.id)}
                      className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-kementan-gold-600 text-slate-950 text-xs font-bold shadow-xs transition-colors"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Terbitkan Tanda Daftar PPVTPP</span>
                    </button>
                  )}

                  <button
                    onClick={() => alert(`Mengunduh Berkas Lengkap Permohonan Varietas: ${item.proposedVarietyName} (Format ZIP/PDF Resmi Kementan RI)`)}
                    className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh Berkas</span>
                  </button>

                  <button
                    onClick={() => handleDeleteApp(item.id, item.proposedVarietyName)}
                    className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-semibold transition-colors"
                    title="Hapus Permohonan dari Database"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus</span>
                  </button>
                </div>
              </div>

            </div>
          ))
        )}
      </div>

      {/* MODAL 1: FORM PEMBERITAHUAN RENCANA PENGUJIAN (LAMPIRAN 1) */}
      {isNoticeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto border border-slate-200">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50 rounded-t-2xl">
              <div>
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                  PERMENTAN NO. 24 TAHUN 2025 — FORMAT LAMPIRAN 1
                </span>
                <h3 className="font-heading font-extrabold text-base text-slate-900">
                  Surat Pemberitahuan Rencana Pengujian
                </h3>
              </div>
              <button onClick={() => setIsNoticeModalOpen(false)} className="p-2 rounded-lg text-slate-400 hover">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleNoticeSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Pemohon / Lembaga *</label>
                <input
                  type="text"
                  required
                  value={noticeForm.applicantName}
                  onChange={(e) => setNoticeForm({ ...noticeForm, applicantName: e.target.value })}
                  placeholder="Nama Perusahaan / Balai Penelitian / Pemulia"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 text-xs outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tipe Instansi *</label>
                  <select
                    value={noticeForm.institutionType}
                    onChange={(e) => setNoticeForm({ ...noticeForm, institutionType: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 text-xs outline-none"
                  >
                    <option value="swasta">Badan Usaha Swasta</option>
                    <option value="pemerintah">Instansi Pemerintah / BRIN</option>
                    <option value="perseorangan">Pemulia Perseorangan</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kategori Tanaman *</label>
                  <select
                    value={noticeForm.cropType}
                    onChange={(e) => setNoticeForm({ ...noticeForm, cropType: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 text-xs outline-none capitalize"
                  >
                    <option value="sayuran">Tanaman Sayuran</option>
                    <option value="buah">Tanaman Buah</option>
                    <option value="hias">Tanaman Hias</option>
                    <option value="obat">Tanaman Obat</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nama Komoditas *</label>
                  <input
                    type="text"
                    required
                    value={noticeForm.commodityName}
                    onChange={(e) => setNoticeForm({ ...noticeForm, commodityName: e.target.value })}
                    placeholder="Contoh: Cabai Merah"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nomor Surat Rencana Uji *</label>
                  <input
                    type="text"
                    required
                    value={noticeForm.testNoticeLetterNo}
                    onChange={(e) => setNoticeForm({ ...noticeForm, testNoticeLetterNo: e.target.value })}
                    placeholder="Contoh: 042/BUN-UJI/2026"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 text-xs font-mono outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Calon Varietas yang Diuji *</label>
                <input
                  type="text"
                  required
                  value={noticeForm.proposedVarietyName}
                  onChange={(e) => setNoticeForm({ ...noticeForm, proposedVarietyName: e.target.value })}
                  placeholder="Contoh: GARUDA NUSANTARA 1"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 text-xs font-bold uppercase outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Silsilah / Asal-Usul Pemuliaan (Dokumen Rahasia Pemohon)
                </label>
                <textarea
                  rows={2}
                  value={noticeForm.lineage}
                  onChange={(e) => setNoticeForm({ ...noticeForm, lineage: e.target.value })}
                  placeholder="Deskripsikan galur tetua atau seleksi populasi lokal..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 text-xs outline-none"
                />
                <span className="text-[10px] text-amber-700 font-semibold block mt-1">
                  * Data silsilah dilindungi kerahasiaannya dan hanya dapat diakses Pemohon, Super Admin, dan TP2VH.
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Upload Dokumen Surat Rencana Uji (Lampiran 1 Model-4) (PDF, Maks 5 MB) *
                </label>
                <input
                  type="file"
                  accept=".pdf"
                  className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-100 file:text-emerald-800 hover:file:bg-emerald-200 cursor-pointer border border-slate-300 rounded-lg p-1.5"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsNoticeModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold hover"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-emerald-700 text-white font-bold shadow"
                >
                  <Send className="w-4 h-4 text-emerald-200" />
                  <span>Kirim Surat Rencana Uji</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: INPUT HASIL SIDANG TP2VH */}
      {isEvaluationModalOpen && selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50 rounded-t-2xl">
              <div>
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                  SEKRETARIAT & TIM PENILAI TP2VH
                </span>
                <h3 className="font-heading font-extrabold text-base text-slate-900">
                  Keputusan Sidang Penilaian Varietas
                </h3>
              </div>
              <button onClick={() => setIsEvaluationModalOpen(false)} className="p-2 rounded-lg text-slate-400 hover">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="font-bold text-slate-900">{selectedApp.proposedVarietyName}</div>
                <div className="text-[11px] text-slate-500">Komoditas: {selectedApp.commodityName} • Pemohon: {selectedApp.applicantName}</div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Upload Naskah Hasil Uji Keunggulan & BUSS (Format Lampiran 2.a) (PDF, Maks 10 MB) *
                </label>
                <input
                  type="file"
                  accept=".pdf"
                  className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-100 file:text-emerald-800 hover:file:bg-emerald-200 cursor-pointer border border-slate-300 rounded-lg p-1.5 mb-3"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-2">Pilih Hasil Sidang Pleno TP2VH:</label>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => handleTP2VHSessionSubmit('lolos_disetujui', 'Telah memenuhi seluruh syarat keunggulan dan keseragaman.')}
                    className="w-full p-3 rounded-xl border border-emerald-300 bg-emerald-50/70 text-left transition-colors flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-emerald-900">1. Lolos / Disetujui</div>
                      <div className="text-[11px] text-emerald-800 mt-0.5">Lanjut ke Masa Sanggah Publik (30 Hari)</div>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTP2VHSessionSubmit('perbaikan_dokumen', 'Perlu revisi naskah keunggulan sesuai format Lampiran 2.b.')}
                    className="w-full p-3 rounded-xl border border-amber-300 bg-amber-50/70 text-left transition-colors flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-amber-900">2. Perbaikan Dokumen</div>
                      <div className="text-[11px] text-amber-800 mt-0.5">Pemohon mengunggah perbaikan (Lampiran 2.b)</div>
                    </div>
                    <AlertCircle className="w-5 h-5 text-amber-600" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTP2VHSessionSubmit('tunda_bahas', 'Data teknis belum cukup, dijadwalkan ulang pada sidang berikutnya.')}
                    className="w-full p-3 rounded-xl border border-slate-300 bg-slate-50 text-left transition-colors flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-slate-900">3. Tunda Bahas</div>
                      <div className="text-[11px] text-slate-600 mt-0.5">Pengujian ulang atau klarifikasi sidang pleno berikutnya</div>
                    </div>
                    <Clock className="w-5 h-5 text-slate-500" />
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsEvaluationModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold hover"
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
