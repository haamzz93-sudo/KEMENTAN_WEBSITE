# PANDUAN PENGEMBANGAN, UPDATE REVISI & AUTO-DEPLOYMENT: SIM-BENIH HORTI KEMENTAN RI
Direktorat Perbenihan Hortikultura — Kementerian Pertanian Republik Indonesia

Dokumen ini adalah instruksi operasional standar bagi Developer & AI Assistant untuk menjaga, memperbarui, dan men-deploy revisi pada sistem produksi SIM-BENIH HORTI yang sedang berjalan aktif (LIVE).

---

## 1. INFORMASI INFRASTRUKTUR SERVER LIVE (STATUS AKTIF)
* **Domain Resmi:** [https://kementan.unsmadiun.id](https://kementan.unsmadiun.id)
* **IP Server VPS:** `38.147.122.131` (Ubuntu 22.04 LTS / aaPanel Control Panel)
* **Root Directory VPS:** `/www/wwwroot/kementan.unsmadiun.id`

### Konfigurasi Layanan Internal:
1. **Frontend (Next.js 14 App Router - Production):**
   * Port Internal: `3001`
   * Service PM2: `kementan-frontend` (ID: 3)
   * Direktori: `/www/wwwroot/kementan.unsmadiun.id/frontend`
2. **Backend (PHP REST API Engine):**
   * Port Internal: `8000`
   * Service PM2: `kementan-backend` (ID: 1)
   * Direktori: `/www/wwwroot/kementan.unsmadiun.id/backend`
3. **Basis Data (MySQL 8.x):**
   * Host: `127.0.0.1` (Port `3306`)
   * Database Name: `sim_benih_horti`
   * DB User: `sim_benih_horti`
   * DB Pass: `kjDsExJdZZP7Mh4E`
4. **Web Server & SSL:**
   * Nginx Reverse Proxy (Port 443 HTTPS dengan Let's Encrypt SSL aktif & auto-renew)

---

## 2. ATURAN WAJIB SETIAP KALI ADA UPDATE / REVISI KODE

Setiap kali pengguna meminta perubahan, perbaikan bug, penambahan fitur, atau penyesuaian konten:

### A. Standar Kualitas Desain & Kode
1. **Anti-AI Slop:**
   * Dilarang menggunakan gradasi ungu/indigo acak.
   * Dilarang menggunakan emoji sistem pada UI dokumen resmi.
   * Default tema **Clean Light Mode** dengan aksen Hijau Hutan Kementan (`#064e3b` / `#061814`), Emas Kementan (`#d97706`), dan kaca cair (*liquid glass*).
   * Tipografi resmi: Inter / Montserrat / Times New Roman untuk naskah surat dinas.
2. **Kepatuhan Regulasi & Modul:**
   * Menjaga integritas data 3 Modul Acuan:
     * **Modul A:** Pelaporan Produsen & Pengedar Benih (38 BPSB Provinsi).
     * **Modul B:** Neraca Produksi Benih Bulanan Otomatis (4 Komoditas Hortikultura).
     * **Modul C:** Pendaftaran Varietas Tanaman Hortikultura Berdasarkan Permentan No. 24 Tahun 2025 (4 Layanan Terpadu & Sidang TP2VH).

---

### B. Prosedur Pembuatan Paket Update Ringan (ZIP)
1. **Jika Terjadi Perubahan Frontend (`frontend/`):**
   * Lakukan validasi dan kompilasi lokal (`npm run build`).
   * Buat paket ZIP update komponen / file yang diubah saja (hindari menyertakan cache besar atau `node_modules`):
     * Nama Berkas: `D:\Landing Page\Kementan\update_frontend.zip`
     * Ukuran target: di bawah 1 MB agar proses upload via aaPanel instan.
2. **Jika Terjadi Perubahan Backend (`backend/`):**
   * Buat paket ZIP berisi file controller/router/index.php yang dimodifikasi:
     * Nama Berkas: `D:\Landing Page\Kementan\update_backend.zip`
   * Jika ada perubahan skema database, buat berkas query SQL migrasi (misal: `patch_migration.sql`).

---

### C. Format Output Wajib (Perintah Terminal 1 Baris)
Di setiap akhir laporan pengerjaan revisi, Developer/AI **WAJIB** menyertakan instruksi satu baris terminal Linux yang siap di-copy-paste langsung oleh pengguna:

#### 1. Perintah Update Frontend:
```bash
cd /www/wwwroot/kementan.unsmadiun.id/frontend && unzip -o update_frontend.zip && pm2 restart kementan-frontend && pm2 save
```

#### 2. Perintah Update Backend:
```bash
cd /www/wwwroot/kementan.unsmadiun.id/backend && unzip -o update_backend.zip && pm2 restart kementan-backend && pm2 save
```

#### 3. Perintah Eksekusi Patch SQL Database:
```bash
mysql -u sim_benih_horti -pkjDsExJdZZP7Mh4E sim_benih_horti < /www/wwwroot/kementan.unsmadiun.id/patch_migration.sql
```

---

## 3. CHECKLIST VERIFIKASI SETELAH DEPLOYMENT
Setelah menjalankan perintah di atas, verifikasi kelancaran sistem melalui:
1. Akses halaman publik: [https://kementan.unsmadiun.id](https://kementan.unsmadiun.id)
2. Uji login salah satu dari 5 akun otentikasi resmi:
   * **Super Admin Pusat:** `superadmin` / `admin123`
   * **Petugas BPSB Jawa Timur:** `bpsb_jatim` / `Bpsb2026!`
   * **Auditor Mutu LSSM:** `auditor_lssm` / `Lssm2026!`
   * **Sekretariat TP2VH:** `tim_tp2vh` / `Tp2vh2026!`
   * **Pemohon Varietas (PT EWSI):** `pemohon_ewsi` / `Pemohon2026!`
3. Periksa status PM2 pada VPS:
   ```bash
   pm2 status
   ```
