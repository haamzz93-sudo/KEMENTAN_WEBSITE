// TypeScript Type Definitions for SIM-BENIH HORTI (Kementerian Pertanian RI)

export type UserRole = 
  | 'super_admin' // Direktorat Perbenihan Hortikultura Pusat
  | 'bpsb'        // Balai Pengawasan dan Sertifikasi Benih (38 Provinsi)
  | 'lssm'        // Lembaga Sertifikasi Sistem Mutu Perbenihan
  | 'tp2vh'       // Tim Penilai Pelepasan/Pendaftaran Varietas Hortikultura
  | 'applicant'   // Produsen Benih / Instansi Pemohon Varietas
  | 'public';     // Publik / Masyarakat Luas

export type PlantCategory = 
  | 'sayuran' // Tanaman Sayuran
  | 'buah'    // Tanaman Buah
  | 'hias'    // Tanaman Hias
  | 'obat';   // Tanaman Obat / Biofarmaka

export type SeedClass = 
  | 'BS' // Benih Penjenis (Breeder Seed - Kuning)
  | 'BD' // Benih Dasar (Foundation Seed - Putih)
  | 'BP' // Benih Pokok (Stock Seed - Ungu)
  | 'BR'; // Benih Sebar (Extension Seed - Biru)

export type SeedUnit = 
  | 'kg' 
  | 'batang' 
  | 'knol' 
  | 'planlet' 
  | 'stek' 
  | 'anakan';

// MODUL A: Produsen & Pengedar Benih
export interface ProducerDistributor {
  id: string;
  regNumber: string; // Nomor Registrasi
  businessName: string; // Nama Badan Usaha / Poktan
  ownerName: string;
  roleType: 'produsen' | 'pengedar';
  competencyCertNumber: string; // No. Sertifikat Kompetensi
  certExpiryDate: string;
  province: string;
  regency: string;
  address: string;
  phone: string;
  commodity: string;
  variety: string;
  landAreaHa: number; // Luas Lahan (Ha)
  annualCapacity: number; // Kapasitas Produksi per Tahun
  unit: SeedUnit;
  applicationType: 'baru' | 'perpanjangan';
  status: 'aktif' | 'perlu_perpanjangan' | 'diverifikasi';
  competencyCertFile?: string;
  createdAt: string;
}

// MODUL B: Neraca Data Produksi Benih Bulanan
export interface MonthlySeedProduction {
  id: string;
  reportingMonth: string; // Format YYYY-MM
  reportingEntity: 'BPSB' | 'LSSM';
  province: string;
  regency: string;
  category: PlantCategory;
  commodity: string;
  variety: string;
  seedClass: SeedClass;
  unit: SeedUnit;
  previousStock: number; // Ketersediaan Bulan Lalu
  currentProduction: number; // Produksi Bulan Ini
  distribution: number; // Penyaluran Bulan Ini
  remainingStock: number; // Sisa Ketersediaan = (previousStock + currentProduction) - distribution
  updatedAt: string;
  producerId?: string;
  producerName?: string;
  signedReportFile?: string;
}

// MODUL C: Pendaftaran Varietas Tanaman Hortikultura (Permentan 24/2025)
export type VarietyRegistrationStage = 
  | 'layanan_1_rencana_uji'
  | 'layanan_2_permohonan_sidang'
  | 'layanan_3_masa_sanggah'
  | 'layanan_4_selesai_terdaftar';

export type TP2VHSessionStatus = 
  | 'belum_sidang'
  | 'lolos_disetujui'
  | 'perbaikan_dokumen'
  | 'tunda_bahas';

export interface VarietyApplication {
  id: string;
  trackingCode: string; // e.g. "VAR-2026-HORTI-0842"
  applicantName: string; // Nama Pemohon / Perusahaan
  institutionType: 'pemerintah' | 'swasta' | 'perseorangan';
  cropType: PlantCategory;
  commodityName: string; // e.g. "Cabai Merah"
  proposedVarietyName: string; // e.g. "GARUDA NUSANTARA 1"
  lineage: string; // Silsilah Pemuliaan
  submissionDate: string;
  currentStage: VarietyRegistrationStage;
  
  // Layanan 1: Rencana Pengujian
  testNoticeLetterNo?: string;
  testNoticeStatus: 'menunggu_verifikasi' | 'disetujui' | 'perlu_perbaikan';
  testResponseLetterNo?: string;
  testResponseDate?: string;

  // Layanan 2: Sidang TP2VH
  tp2vhSessionDate?: string;
  tp2vhSessionStatus: TP2VHSessionStatus;
  tp2vhNotes?: string;

  // Layanan 3: Masa Sanggah 30 Hari
  objectionStartDate?: string;
  objectionEndDate?: string;
  objectionDaysLeft?: number;
  totalObjectionsCount: number;
  recommendationLetterNo?: string;

  // Status Akhir
  registrationNumber?: string; // Tanda Daftar PPVTPP / OSS
  lampiran1Model4File?: string;
  lampiran2aNaskahFile?: string;
  isConfidential?: boolean;
  statusText: string;
}
