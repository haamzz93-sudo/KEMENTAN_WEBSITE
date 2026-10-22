-- SIM-BENIH HORTI: SKEMA DATABASE RESMI
-- KEMENTERIAN PERTANIAN REPUBLIK INDONESIA
USE sim_benih_horti;

-- 1. Master Wilayah Indonesia (38 BPSB Provinsi)
CREATE TABLE IF NOT EXISTS `provinces` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL UNIQUE,
  `bpsb_office_name` VARCHAR(255) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Modul A: Produsen & Pengedar Benih Hortikultura (BPSB)
CREATE TABLE IF NOT EXISTS `seed_producers_distributors` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `reg_number` VARCHAR(100) NOT NULL UNIQUE,
  `business_name` VARCHAR(255) NOT NULL,
  `owner_name` VARCHAR(150) NOT NULL,
  `role_type` ENUM('produsen', 'pengedar') NOT NULL,
  `competency_cert_number` VARCHAR(150) NOT NULL,
  `cert_expiry_date` DATE NOT NULL,
  `province` VARCHAR(100) NOT NULL,
  `regency` VARCHAR(150) NOT NULL,
  `address` TEXT NOT NULL,
  `phone` VARCHAR(50) NOT NULL,
  `commodity` VARCHAR(100) NOT NULL,
  `variety` VARCHAR(100) NULL,
  `land_area_ha` DECIMAL(8,2) DEFAULT 0.00,
  `annual_capacity` BIGINT UNSIGNED DEFAULT 0,
  `unit` VARCHAR(20) DEFAULT 'kg',
  `application_type` ENUM('baru', 'perpanjangan') DEFAULT 'baru',
  `status` ENUM('aktif', 'perlu_perpanjangan', 'diverifikasi') DEFAULT 'aktif',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Modul B: Neraca Data Produksi Benih Bulanan (BPSB & LSSM)
CREATE TABLE IF NOT EXISTS `seed_monthly_productions` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `reporting_month` VARCHAR(7) NOT NULL, -- YYYY-MM
  `reporting_entity` ENUM('BPSB', 'LSSM') NOT NULL,
  `province` VARCHAR(100) NOT NULL,
  `regency` VARCHAR(150) NOT NULL,
  `category` ENUM('sayuran', 'buah', 'hias', 'obat') NOT NULL,
  `commodity` VARCHAR(100) NOT NULL,
  `variety` VARCHAR(100) NULL,
  `seed_class` ENUM('BS', 'BD', 'BP', 'BR') NOT NULL,
  `unit` VARCHAR(20) DEFAULT 'kg',
  `previous_stock` BIGINT UNSIGNED DEFAULT 0,
  `current_production` BIGINT UNSIGNED DEFAULT 0,
  `distribution` BIGINT UNSIGNED DEFAULT 0,
  `remaining_stock` BIGINT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_month_category` (`reporting_month`, `category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Modul C: Pendaftaran Varietas Tanaman Hortikultura (Permentan 24/2025)
CREATE TABLE IF NOT EXISTS `variety_applications` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `tracking_code` VARCHAR(100) NOT NULL UNIQUE,
  `applicant_name` VARCHAR(255) NOT NULL,
  `institution_type` ENUM('swasta', 'pemerintah', 'perseorangan') DEFAULT 'swasta',
  `crop_type` ENUM('sayuran', 'buah', 'hias', 'obat') NOT NULL,
  `commodity_name` VARCHAR(150) NOT NULL,
  `proposed_variety_name` VARCHAR(150) NOT NULL,
  `lineage` TEXT NULL,
  `submission_date` DATE NOT NULL,
  `current_stage` ENUM('layanan_1_rencana_uji', 'layanan_2_permohonan_sidang', 'layanan_3_masa_sanggah', 'layanan_4_selesai_terdaftar') DEFAULT 'layanan_1_rencana_uji',
  `test_notice_letter_no` VARCHAR(150) NULL,
  `test_notice_status` ENUM('menunggu_verifikasi', 'disetujui', 'perlu_perbaikan') DEFAULT 'menunggu_verifikasi',
  `test_response_letter_no` VARCHAR(150) NULL,
  `test_response_date` DATE NULL,
  `tp2vh_session_date` DATE NULL,
  `tp2vh_session_status` ENUM('belum_sidang', 'lolos_disetujui', 'perbaikan_dokumen', 'tunda_bahas') DEFAULT 'belum_sidang',
  `tp2vh_notes` TEXT NULL,
  `objection_start_date` DATE NULL,
  `objection_end_date` DATE NULL,
  `objection_days_left` INT NULL,
  `total_objections_count` INT DEFAULT 0,
  `recommendation_letter_no` VARCHAR(150) NULL,
  `registration_number` VARCHAR(150) NULL,
  `status_text` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Audit Log Transaksi & Akuntabilitas Inspektorat
CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `action` VARCHAR(100) NOT NULL,
  `module` VARCHAR(100) NOT NULL,
  `performed_by` VARCHAR(150) NOT NULL,
  `ip_address` VARCHAR(45) NULL,
  `details` JSON NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data Awal: Master 38 Provinsi
INSERT IGNORE INTO `provinces` (`name`, `bpsb_office_name`) VALUES
('Aceh', 'BPSB Tanaman Pangan dan Hortikultura Aceh'),
('Sumatera Utara', 'UPTD BPSB TPH Sumatera Utara'),
('Sumatera Barat', 'UPTD BPSB TPH Sumatera Barat'),
('Riau', 'BPSB Provinsi Riau'),
('Kepulauan Riau', 'BPSB Provinsi Kepulauan Riau'),
('Jambi', 'BPSB Provinsi Jambi'),
('Sumatera Selatan', 'UPTD BPSB TPH Sumatera Selatan'),
('Kepulauan Bangka Belitung', 'BPSB Provinsi Kepulauan Bangka Belitung'),
('Bengkulu', 'UPTD BPSB TPH Bengkulu'),
('Lampung', 'UPTD Balai Pengawasan dan Sertifikasi Benih Lampung'),
('DKI Jakarta', 'Dinas KPKP Provinsi DKI Jakarta'),
('Jawa Barat', 'Balai Pengawasan dan Sertifikasi Benih Jawa Barat'),
('Banten', 'UPTD BPSB TPH Provinsi Banten'),
('Jawa Tengah', 'Balai Pengawasan dan Sertifikasi Benih Jawa Tengah'),
('DI Yogyakarta', 'Balai Pengawasan dan Sertifikasi Benih Pertanian DIY'),
('Jawa Timur', 'UPT Pengawasan dan Sertifikasi Benih Jawa Timur'),
('Bali', 'UPTD Balai Pengawasan dan Sertifikasi Benih Bali'),
('Nusa Tenggara Barat', 'BPSB TPH Nusa Tenggara Barat'),
('Nusa Tenggara Timur', 'UPTD BPSB TPH Nusa Tenggara Timur'),
('Kalimantan Barat', 'UPT Pengawasan dan Sertifikasi Benih Kalbar'),
('Kalimantan Tengah', 'BPSB Provinsi Kalimantan Tengah'),
('Kalimantan Selatan', 'Balai Pengawasan dan Sertifikasi Benih Kalsel'),
('Kalimantan Timur', 'UPTD Pengawasan dan Sertifikasi Benih Kaltim'),
('Kalimantan Utara', 'BPSB Provinsi Kalimantan Utara'),
('Sulawesi Utara', 'Balai Pengawasan dan Sertifikasi Benih Sulut'),
('Gorontalo', 'BPSB TPH Provinsi Gorontalo'),
('Sulawesi Tengah', 'UPTD BPSB TPH Sulawesi Tengah'),
('Sulawesi Barat', 'UPTD BPSB TPH Sulawesi Barat'),
('Sulawesi Selatan', 'UPTD Balai Pengawasan dan Sertifikasi Benih Sulsel'),
('Sulawesi Tenggara', 'BPSB TPH Sulawesi Tenggara'),
('Maluku', 'BPSB TPH Provinsi Maluku'),
('Maluku Utara', 'BPSB TPH Maluku Utara'),
('Papua', 'BPSB TPH Provinsi Papua'),
('Papua Barat', 'BPSB TPH Papua Barat'),
('Papua Selatan', 'BPSB TPH Papua Selatan'),
('Papua Tengah', 'BPSB TPH Papua Tengah'),
('Papua Pegunungan', 'BPSB TPH Papua Pegunungan'),
('Papua Barat Daya', 'BPSB TPH Papua Barat Daya');

-- Data Awal: Produsen Sampel BPSB (Modul A)
INSERT IGNORE INTO `seed_producers_distributors` 
(`reg_number`, `business_name`, `owner_name`, `role_type`, `competency_cert_number`, `cert_expiry_date`, `province`, `regency`, `address`, `phone`, `commodity`, `variety`, `land_area_ha`, `annual_capacity`, `unit`, `application_type`, `status`) 
VALUES
('REG-BPSB-JB-2026-0012', 'PT Horti Mandiri Sejahtera', 'Ir. H. Darmawan Susanto', 'produsen', '144/BPSB-JB/SERT-KOMP/2024', '2027-08-15', 'Jawa Barat', 'Kabupaten Cianjur', 'Jl. Raya Ciherang No. 45, Pacet', '0812-3456-7890', 'Cabai Merah', 'Tanjung-2', 4.5, 12500, 'kg', 'perpanjangan', 'aktif'),
('REG-BPSB-JT-2026-0045', 'Kelompok Tani Makmur Berkah', 'Sudirman', 'produsen', '082/BPSB-JT/SERT-KOMP/2025', '2028-02-20', 'Jawa Tengah', 'Kabupaten Brebes', 'Desa Larangan RT 03/RW 02', '0813-8877-6655', 'Bawang Merah', 'Bima Brebes', 6.2, 45000, 'kg', 'baru', 'aktif'),
('REG-BPSB-ET-2026-0089', 'CV Kusuma Agro Horti', 'Bambang Wijaya', 'pengedar', '210/BPSB-JATIM/PENGEDAR/2023', '2026-10-30', 'Jawa Timur', 'Kota Batu', 'Kawasan Agrowisata Bumiaji Blok C-12', '0819-2233-4455', 'Kentang (Knol G0/G2)', 'Granola L', 2.0, 80000, 'knol', 'perpanjangan', 'perlu_perpanjangan');

-- Data Awal: Neraca Stok Benih (Modul B)
INSERT IGNORE INTO `seed_monthly_productions`
(`reporting_month`, `reporting_entity`, `province`, `regency`, `category`, `commodity`, `variety`, `seed_class`, `unit`, `previous_stock`, `current_production`, `distribution`, `remaining_stock`)
VALUES
('2026-09', 'BPSB', 'Jawa Barat', 'Kabupaten Cianjur', 'sayuran', 'Cabai Merah', 'Tanjung-2', 'BP', 'kg', 4500, 2800, 3100, 4200),
('2026-09', 'BPSB', 'Jawa Tengah', 'Kabupaten Brebes', 'sayuran', 'Bawang Merah', 'Bima Brebes', 'BR', 'kg', 12000, 18500, 14200, 16300),
('2026-09', 'LSSM', 'Jawa Timur', 'Kota Batu', 'sayuran', 'Kentang (Knol G0/G2)', 'Granola L', 'BD', 'knol', 25000, 40000, 35000, 30000);

-- Data Awal: Pendaftaran Varietas (Modul C - Permentan 24/2025)
INSERT IGNORE INTO `variety_applications`
(`tracking_code`, `applicant_name`, `institution_type`, `crop_type`, `commodity_name`, `proposed_variety_name`, `lineage`, `submission_date`, `current_stage`, `test_notice_letter_no`, `test_notice_status`, `test_response_letter_no`, `tp2vh_session_date`, `tp2vh_session_status`, `tp2vh_notes`, `objection_start_date`, `objection_end_date`, `objection_days_left`, `recommendation_letter_no`, `registration_number`, `status_text`)
VALUES
('VAR-2026-HORTI-0842', 'PT Benih Unggul Nusantara', 'swasta', 'sayuran', 'Cabai Rawit', 'GARUDA NUSANTARA 1', 'Seleksi massa populasi lokal Wonosobo x Galur Murni IPB', '2026-08-15', 'layanan_3_masa_sanggah', '042/BUN-UJI/VI/2026', 'disetujui', 'B-812/SR.120/D.2/07/2026', '2026-08-28', 'lolos_disetujui', 'Telah memenuhi syarat keunggulan potensi hasil 22 ton/ha dan toleran antraknosa.', '2026-09-01', '2026-10-01', 8, 'PROSES-REKOM-0842', NULL, 'Masa Sanggah Publik Berjalan (30 Hari) - Sisa 8 Hari'),
('VAR-2026-HORTI-0720', 'CV Flori Flora Nusantara', 'swasta', 'hias', 'Krisan', 'PESONA PASUNDAN YELLOW', 'Hasil persilangan buatan varietas Fiji x Yellow Puma', '2026-06-10', 'layanan_4_selesai_terdaftar', '015/FFN/IV/2026', 'disetujui', 'B-521/SR.120/D.2/05/2026', '2026-07-15', 'lolos_disetujui', NULL, '2026-07-20', '2026-08-20', 0, 'SR.120/144/D.2/VIII/2026', '089/Kpts/PV.240/D/VIII/2026', 'Selesai - Tanda Daftar Diterbitkan (Resmi Terdaftar)');
