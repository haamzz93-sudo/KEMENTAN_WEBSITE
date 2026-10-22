# MASTER PROMPT: PENGEMBANGAN SISTEM INFORMASI PERBENIHAN HORTIKULTURA NASIONAL (SIM-BENIH HORTI)
## KEMENTERIAN PERTANIAN REPUBLIK INDONESIA — DIREKTORAT PERBENIHAN HORTIKULTURA

> **Instruksi untuk AI Assistant / Cursor / Claude Code / Windsurf:**
> Bangun aplikasi web skala enterprise **SIM-BENIH HORTI** (Sistem Informasi Manajemen Terpadu Perbenihan & Pendaftaran Varietas Hortikultura) untuk **Kementerian Pertanian Republik Indonesia (Kementan RI)** menggunakan **Next.js (Frontend)**, **Laravel (Backend REST API)**, dan **MySQL (Database)**.
> Seluruh implementasi wajib mematuhi panduan ketat **Anti-AI Slop**, **Sistem Desain Eksekutif Pemerintahan**, dan **Logika Proses Bisnis Resmi Kementan**.

---

## 1. IDENTITAS & KARAKTERISTIK PROYEK
* **Nama Sistem:** SIM-BENIH HORTI (Sistem Informasi Manajemen Perbenihan & Varietas Hortikultura Nasional)
* **Institusi:** Kementerian Pertanian Republik Indonesia — Direktorat Jenderal Hortikultura — Direktorat Perbenihan Hortikultura
* **Dasar Hukum:** Permentan No. 24 Tahun 2025 tentang Pendaftaran Varietas Tanaman Hortikultura & Regulasi Pengawasan Mutu Benih Nasional
* **Arsitektur:** 
  - **Frontend:** Next.js (App Router, TypeScript, Tailwind CSS, Lucide React Icons)
  - **Backend:** Laravel 11 (RESTful API, Sanctum Auth, Eloquent ORM, Modular Architecture)
  - **Database:** MySQL 8.x (Relasional, InnoDB, Foreign Keys, Audit Logs)

---

## 2. STRICT ANTI-AI SLOP RULES & DESIGN SYSTEM (IDENTITAS KEMENTAN RI)
Wajib mematuhi standar desain eksekutif institusi negara tanpa tampilan klise AI murahan:

1. **Palet Warna Eksekutif Kementan RI:**
   - **Kementan Forest Deep (Warna Utama):** `#064E3B` / `#065F46` (Karakter agraris, resmi, berwibawa).
   - **Kementan Emerald Vibrant:** `#059669` / `#10B981` (Aksen aktif, status sukses, tombol aksi primer).
   - **Harvest Warm Gold (Aksen Sekunder):** `#D97706` / `#F59E0B` (Simbol panen, lencana sertifikasi kompetensi, warning).
   - **Earthy Soil Accent:** `#78350F` / `#92400E` (Aksen penunjang data varietas/komoditas).
   - **Clean White Canvas (Default Background):** `#FFFFFF` dengan latar body `#F8FAFC` atau `#F1F5F9`.
   - **DILARANG:** Gradasi ungu/indigo/violet (`from-indigo-500 to-purple-600`), neon glow berlebihan, atau dark mode hitam pekat sebagai tampilan default.

2. **Tipografi & Ikonografi:**
   - **Heading Font:** `Plus Jakarta Sans` / `Outfit` / `Montserrat` (Tegas, formal, institusional).
   - **Body Font:** `Inter` (Keterbacaan tinggi untuk data tabel dan formulir perbenihan).
   - **NO EMOJIS IN UI & MARKDOWN:** Dilarang keras menggunakan emoji sistem (seperti 🚀, ✨, 🔥, 🌱, 📊) pada tombol, badge, judul menu, heading markdown, maupun tabel.
   - **Structural Vector Icons:** Gunakan vector icons dari `lucide-react` yang relevan dengan regulasi pertanian (`Sprout`, `Building2`, `ShieldCheck`, `FileSpreadsheet`, `Layers`, `Landmark`, `CheckCircle2`, `CalendarClock`, `FileText`, `QrCode`, `Download`).

3. **Komponen UI Berwibawa:**
   - Sudut membulat modern proporsional (`rounded-xl` atau `rounded-2xl`). Hindari `rounded-full` kapsul berlebihan kecuali untuk status dot kecil.
   - Card data dengan border tipis terstruktur (`border border-emerald-950/10 shadow-sm bg-white`).
   - Tabel administrasi modern: baris berselang-seling halus (*subtle zebra*), header abu-abu bersih, fitur sorting, filtering provinsi/komoditas, dan pagination.

---

## 3. RUANG LINGKUP & 3 PROSES BISNIS INTI (SESUAI DOKUMEN ASLI KEMENTAN)

### MODUL A: ALUR SISTEM PELAPORAN DATA PRODUSEN & PENGEDAR BENIH
Mengacu pada berkas `alur sistem pelaporan data produsen dan Pengedar.xlsx`.
* **Aktor:** Petugas BPSB (Balai Pengawasan dan Sertifikasi Benih) 38 Provinsi.
* **Alur Kerja:**
  1. *Pengumpulan & Verifikasi Lapangan:* BPSB mendata produsen/pengedar benih hortikultura berizin.
  2. *Autentikasi:* Petugas BPSB login ke sistem menggunakan akun resmi wilayahnya.
  3. *Penginputan/Pembaruan Bulanan:*
     - Data Wilayah: Provinsi, Kabupaten/Kota, Alamat Operasional Lengkap.
     - Identitas Usaha: Nama Kelompok Tani / Badan Usaha (PT/CV/UPBS), Nama Pimpinan/Pemilik, Nomor Telp/HP.
     - Status Peran: `Produsen` atau `Pengedar`.
     - Legalitas: Nomor Sertifikat Kompetensi.
     - Operasional: Komoditas (Cabai, Tomat, Bawang, Jeruk, dll.), Varietas, Luas Lahan (Ha), Kapasitas Produksi Per Tahun.
     - Status Pengajuan: `Pengajuan Baru` atau `Perpanjangan`.
  4. *Validasi & Penyimpanan:* Validasi kelengkapan format -> Kirim Laporan Bulanan -> Tersimpan di Database Pusat Kementan.
  5. *Export Rekapitulasi:* Fitur export Excel/PDF daftar produsen dan pengedar per bulan/provinsi.

---

### MODUL B: ALUR SISTEM PELAPORAN DATA PRODUKSI BENIH (BPSB & LSSM)
Mengacu pada berkas `alur sistem pelaporan data produksi benih.xlsx`.
* **Aktor:** Petugas BPSB Provinsi & Auditor LSSM (Lembaga Sertifikasi Sistem Mutu Perbenihan).
* **Alur Kerja & Neraca Stok:**
  1. Petugas login ke portal sesuai hak akses (BPSB memilih Provinsi & Kabupaten; LSSM memilih Provinsi).
  2. Memilih Klasifikasi Master Data:
     - **Jenis Tanaman (4 Kategori):** `Tanaman Sayuran`, `Tanaman Buah`, `Tanaman Hias`, `Tanaman Obat`.
     - **Komoditas:** Sayuran (Mentimun, Buncis, Cabai, Kangkung, Kacang Panjang, Tomat, Sawi, dll.); Buah (Melon, Semangka, Alpukat, Mangga, Rambutan, Durian, Jeruk, dll.); Tanaman Hias (Anggrek, Krisan, dll.); Tanaman Obat (Jahe, Kunyit, Temulawak, dll.).
     - **Varietas & Kelas Benih:** Benih Penjenis (BS), Benih Dasar (BD), Benih Pokok (BP), Benih Sebar (BR).
     - **Satuan:** `Batang`, `Kg`, `Knol` (khusus kentang), `Planlet / Stek` (tanaman hias), `Anakan`.
  3. **Input Neraca Benih & Kalkulasi Otomatis (Wajib Realtime):**
     - `Ketersediaan Bulan Lalu` (Stok awal)
     - `Produksi Bulan Ini` (Hasil panen/sertifikasi baru)
     - `Penyaluran Bulan Ini` (Distribusi/terjual)
     - `Sisa Ketersediaan Bulan Ini` = **`(Ketersediaan Bulan Lalu + Produksi Bulan Ini) - Penyaluran Bulan Ini`** *(Dihitung otomatis oleh sistem)*.
  4. **Multi-Sheet Export Generator:**
     - Export Rekapitulasi BPSB Bulanan.
     - Export Rekapitulasi LSSM Bulanan.
     - Export Gabungan Nasional per Jenis Tanaman (Matriks 38 Provinsi x Komoditas) untuk data Sayur, Buah, Tanaman Hias, dan Tanaman Obat.

---

### MODUL C: PENDAFTARAN VARIETAS TANAMAN HORTIKULTURA
Mengacu pada berkas `Bisnis Proses Pendaftaran Varietas Tanaman Hortikultura (Permentan 24/2025)`.
Mendigitalkan alur yang sebelumnya manual melalui Email, Linktree, dan Google Spreadsheet menjadi portal terintegrasi:

1. **Layanan 1: Pemberitahuan Rencana Pengujian**
   - Pemohon (Instansi Pemerintah / Perusahaan Swasta) membuat akun dengan data: Nama Perusahaan, Sertifikat Kompetensi, Tipe Instansi.
   - Pemohon mengisi formulir & mengunggah Dokumen Surat Pemberitahuan Rencana Uji (Format Lampiran 1).
   - Admin Direktorat Perbenihan Hortikultura memverifikasi dokumen.
   - Output: Penerbitan Surat Respon / Surat Persetujuan Uji (atau Surat Perbaikan).

2. **Layanan 2: Permohonan Penilaian Pendaftaran Varietas**
   - Pemohon mengunggah berkas persyaratan lengkap (Lampiran 2.a).
   - Admin Perbenihan Hortikultura melakukan verifikasi dan sortir permohonan untuk jadwal sidang penilaian.
   - Sidang Pleno Tim Penilai Pelepasan/Pendaftaran Varietas Hortikultura (TP2VH).
   - Admin menginput status hasil sidang: `Lolos / Disetujui`, `Perbaikan`, atau `Tunda Bahas`.
   - Penerbitan Surat Hasil Sidang.

3. **Layanan 3: Penanganan Status Perbaikan, Tunda Bahas, dan Masa Sanggah 30 Hari**
   - Jika status `Perbaikan`: Pemohon mengunggah berkas perbaikan (Lampiran 2.b). Admin mempublikasikan deskripsi varietas ke laman **Masa Sanggah Publik (Durasi 30 Hari)**. Jika masa sanggah selesai tanpa keberatan, diterbitkan **Surat Rekomendasi Pendaftaran Varietas**.
   - Jika status `Tunda Bahas`: Pemohon melengkapi data teknis untuk dijadwalkan pada sidang ulang TP2VH berikutnya.

4. **Layanan 4: Pemantauan Proses Publik & Tracking Status Realtime**
   - Dashboard pemantauan transparan berbasis nomor registrasi / kode permohonan unik.
   - Menampilkan tahapan berjalan: `Pemberitahuan Uji` &rarr; `Verifikasi Administrasi` &rarr; `Sidang Pleno TP2VH` &rarr; `Masa Sanggah (Countdown 30 Hari)` &rarr; `Penerbitan Tanda Daftar (PPVTPP / OSS)`.

---

## 4. HAK AKSES & ROLE-BASED ACCESS CONTROL (RBAC)
1. **Super Admin Pusat (Direktorat Perbenihan Hortikultura Kementan RI):** Akses seluruh data nasional, manajemen master data, verifikasi pendaftaran varietas, approval surat respon, input hasil sidang TP2VH, dan monitoring dashboard analitik nasional.
2. **Sekretariat & Tim Penilai TP2VH:** Akses sidang pleno, penelaahan dokumen uji keunggulan & kebenaran varietas, serta rekomendasi teknis.
3. **Petugas BPSB (38 Balai Provinsi):** Input data bulanan produsen/pengedar di wilayahnya, input neraca produksi benih lokal, dan unduh laporan rekapan provinsi.
4. **Petugas LSSM (Lembaga Sertifikasi Sistem Mutu):** Input produksi dan penyaluran benih bersertifikat sistem mutu.
5. **Produsen Benih / Pemohon Varietas (Kelompok Tani / Swasta):** Mengajukan pemberitahuan rencana uji, mengunggah dokumen varietas, tracking status pengajuan, dan mengunduh surat resmi bertanda QR code.
6. **Publik / Guest:** Halaman katalog varietas terdaftar, pengecekan masa sanggah varietas baru (30 hari), dan statistik produksi benih nasional terbuka.

---

## 5. SKEMA DATABASE UTAMA (MYSQL)
Rancang struktur tabel relasional berikut di Laravel migration:
* `users` & `roles` (Super Admin, BPSB, LSSM, TP2VH, Pemohon)
* `provinces` & `regencies` (Master 38 Provinsi & Kabupaten/Kota di Indonesia)
* `master_plant_types` (Sayuran, Buah, Tanaman Hias, Tanaman Obat)
* `master_commodities` (Cabai, Melon, Krisan, Jahe, Kentang, dll.)
* `master_varieties` & `master_seed_classes` (BS, BD, BP, BR)
* `seed_producers_distributors` (Tabel Produsen & Pengedar: identitas usaha, status peran, no sertifikat kompetensi, luas lahan, kapasitas tahunan)
* `seed_monthly_productions` (Tabel Neraca Produksi Benih Bulanan: ketersediaan lalu, produksi, penyaluran, sisa stok kalkulasi, bulan/tahun)
* `variety_test_notices` (Pemberitahuan Rencana Uji: nomor surat, instansi, tanggal, file lampiran 1, status verifikasi)
* `variety_registration_applications` (Permohonan Penilaian Varietas: dokumen 2.a, jadwal sidang, status sidang, dokumen perbaikan 2.b, countdown masa sanggah 30 hari, no rekomendasi)
* `audit_logs` (Pencatatan riwayat perubahan data perbenihan untuk akuntabilitas inspektorat)

---

## 6. FITUR UNGGULAN & STANDARDISASI SISTEM
1. **Dashboard Eksekutif Statistik Nasional:** Widget KPI total produksi per kuartal, total produsen aktif, neraca stok kritis per komoditas, dan peta sebaran BPSB 38 provinsi.
2. **Kalkulator Neraca Stok Otomatis:** Validasi anti-minus pada sisa ketersediaan di frontend & backend.
3. **Timer Masa Sanggah 30 Hari:** Komponen countdown visual pada portal publik pendaftaran varietas dengan batas sanggahan hukum.
4. **Generator Laporan Multi-Format:** Export Excel terstruktur (multi-sheet persis seperti template Kementan) dan Export PDF resmi dengan Kop Surat Kementan RI ber-QR Code validasi.
5. **Responsive & PWA Ready:** Optimal diakses melalui layar desktop kantor dinas maupun smartphone petugas pengawas di lapangan.

---

## 7. LANGKAH IMPLEMENTASI SISTEMATIS
1. **Fase 1 (Backend Core):** Setup Laravel 11, skema database migration 3 modul, seeder master data 38 provinsi & komoditas hortikultura, Sanctum RBAC middleware, dan Form Request validasi.
2. **Fase 2 (Frontend Foundation):** Setup Next.js 14/15 App Router, konfigurasi Tailwind CSS dengan token warna Kementan Forest (`#064E3B`), komponen data table server-side, layout sidebar admin eksekutif, dan navbar publik.
3. **Fase 3 (Business Logic Implementation):**
   - Bangun modul input & rekapitulasi data Produsen & Pengedar BPSB.
   - Bangun modul neraca produksi benih bulanan dengan auto-kalkulasi & export Excel multi-sheet.
   - Bangun modul alur 4 tahap pendaftaran varietas hortikultura (Rencana Uji, Sidang TP2VH, Masa Sanggah 30 hari, Tracking).
4. **Fase 4 (Polish & Security):** Audit Anti-AI Slop (pastikan nol emoji sistem & nol gradasi ungu), verifikasi sanitasi input dokumen PDF/XLSX, dan pengujian alur kerja end-to-end.


## 8. STANDARISASI DEPLOYMENT VPS (ZIP PACKAGING & ONE-LINE EXECUTION)
AI Agent wajib menyertakan arsitektur dan script otomatisasi deployment agar aplikasi dapat langsung di-deploy ke server VPS Linux (Ubuntu/Debian) secara instan:

### A. Script Pembuat Berkas Zip Deployment (Local Packaging Script)
Sediakan script otomatisasi di lokal (misalnya `package_deploy.py` atau `create_deploy_zip.ps1`) yang berfungsi:
1. Menjalankan linting dan build produksi Next.js.
2. Mem-bundle seluruh sistem ke dalam berkas arsip `simbenih_kementan_deploy.zip` dengan aturan pemfilteran ketat:
   - **Abaikan / Exclude:** `node_modules`, `vendor`, `.git`, `.next/cache`, `.env.local`, `.phpunit.cache`, file log, dan file temporary.
   - **Sertakan / Include:** Source code lengkap Next.js (termasuk folder `public` dan file aset), source code lengkap Laravel backend, file database migrations & seeders, file `composer.json`, `package.json`, template konfigurasi `.env.production.example`, serta berkas konfigurasi Nginx.
3. Menghitung ukuran file dan mencetak ringkasan panduan unggah ke VPS via SCP/SFTP/aaPanel.

### B. Perintah Eksekusi 1 Baris di Terminal SSH VPS (One-Line Command)
Sediakan perintah gabungan (*chained command*) siap salin yang dapat langsung dijalankan oleh pengembang di terminal SSH VPS Ubuntu/Debian untuk menginstal dan mengaktifkan seluruh service:

```bash
# ONE-LINE DEPLOYMENT COMMAND (Jalankan di root target VPS, contoh: /var/www/simbenih)
unzip -o simbenih_kementan_deploy.zip -d /var/www/simbenih && cd /var/www/simbenih/backend && composer install --no-dev --optimize-autoloader && php artisan config:clear && php artisan migrate --force && php artisan db:seed --force && php artisan storage:link && chmod -R 775 storage bootstrap/cache && chown -R www-data:www-data /var/www/simbenih && cd ../frontend && npm install --omit=dev && pm2 restart simbenih-frontend || pm2 start npm --name "simbenih-frontend" -- start -- -p 3001 && sudo systemctl reload nginx && echo "=== DEPLOYMENT BERHASIL: SIM-BENIH KEMENTAN TELAH AKTIF ==="
```

### C. Spesifikasi Konfigurasi Nginx & Runtime Server VPS
1. **Frontend Runtime:** Menggunakan **PM2** untuk menjaga proses Next.js tetap aktif 24 jam di port `3001` (`pm2 startup` dan `pm2 save`).
2. **Backend Runtime:** Laravel 11 berjalan di bawah PHP 8.2/8.3-FPM (`fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;`).
3. **Nginx Reverse Proxy:**
   - Rute utama `/` diteruskan ke `http://127.0.0.1:3001` (Next.js).
   - Rute API `/api/` atau subdomain `api.domain.com` diarahkan ke direktori `backend/public` Laravel.
   - Batas ukuran upload diset ke `client_max_body_size 50M;` agar berkas lampiran proposal varietas dan rekapitulasi data Excel ribuan baris tidak terpotong.
