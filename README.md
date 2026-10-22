# DOKUMENTASI LENGKAP & PANDUAN PENGEMBANGAN
# SIM-BENIH HORTI (SISTEM INFORMASI PERBENIHAN HORTIKULTURA NASIONAL)
### KEMENTERIAN PERTANIAN REPUBLIK INDONESIA — DIREKTORAT PERBENIHAN HORTIKULTURA

Sistem Informasi Manajemen Terpadu Perbenihan dan Pendaftaran Varietas Tanaman Hortikultura Nasional (**SIM-BENIH HORTI**) mendigitalkan seluruh siklus bisnis perbenihan di Indonesia sesuai dengan **Peraturan Menteri Pertanian (Permentan) No. 24 Tahun 2025** dan pedoman sertifikasi mutu benih nasional:
1. **Modul A:** Pelaporan Data Produsen dan Pengedar Benih Hortikultura (BPSB 38 Provinsi).
2. **Modul B:** Pelaporan Neraca Data Produksi Benih Bulanan (BPSB & LSSM) dengan kalkulator otomatis neraca stok.
3. **Modul C:** Pelayanan Pendaftaran Varietas Tanaman Hortikultura (Pemberitahuan Rencana Uji, Sidang Penilaian TP2VH, Masa Sanggah Publik 30 Hari, dan Pelacakan Tiket Realtime).

---

## 1. FRAMEWORK & TEKNOLOGI YANG DIGUNAKAN

Aplikasi dibangun menggunakan kombinasi teknologi modern berskala enterprise (*enterprise-grade web application*):

### Frontend Stack (Aplikasi Pengguna & Portal Eksekutif)
- **Framework Utama:** **Next.js 14 (App Router)** dengan arsitektur *Server Components* dan *Client Components* terisolasi.
- **Bahasa Pemrograman:** **TypeScript (Strict Mode)** untuk validasi tipe data bisnis perbenihan (*type-safe*).
- **Styling & Desain:** **Tailwind CSS v3.4** yang dikonfigurasi khusus dengan **Token Warna Resmi Kementan RI** (*Kementan Forest Deep*, *Emerald Vibrant*, *Harvest Warm Gold*).
- **Pustaka Ikonografi:** **Lucide React** (Standar *Zero Emoji* kepemerintahan resmi).
- **Tipografi:** Google Fonts **Plus Jakarta Sans** (Heading formal/institusional) & **Inter** (Keterbacaan data tabel & formulir perbenihan).
- **Manajemen State & Simulasi:** Dilengkapi dengan *Interactive Live Mock State* dan *Offline Preview Mode* sehingga seluruh alur 3 modul dapat langsung dipresentasikan tanpa wajib menghidupkan database backend terlebih dahulu.

### Backend Stack (RESTful API & Otomasi Bisnis)
- **Framework Utama:** **Laravel 11 (PHP 8.2+)**.
- **Autentikasi & Keamanan:** **Laravel Sanctum** untuk pengelolaan token sesi API dan *Role-Based Access Control* (RBAC).
- **ORM / Database Layer:** **Eloquent ORM** dengan integritas relasi *Foreign Keys* dan *Cascade Rules*.
- **Validasi Data:** Laravel *Form Request Validation* untuk sanitasi nomor sertifikat kompetensi dan kalkulasi stok non-negatif.
- **Database:** **MySQL 8.x / MariaDB** (InnoDB Engine, utf8mb4).

### Deployment & Server Runtime
- **Frontend Server:** **Node.js (LTS)** dijalankan dengan **PM2 Process Manager** di port `3001`.
- **Backend Server:** **PHP 8.2-FPM** dipasangkan dengan **Nginx Web Server**.
- **Packaging Automation:** **Python 3 script (`package_deploy.py`)** untuk membuat paket ZIP instalasi bersih tanpa dependensi sampah.

---

## 2. PANDUAN STRUKTUR FOLDER & LETAK BERKAS LENGKAP

Berikut adalah peta struktur direktori repositori monorepo di `D:\Landing Page\Kementan\`:

```
D:\Landing Page\Kementan\
│
├── README.md                           # Berkas ini: Panduan teknis lengkap & cara instalasi
├── WORKFLOW_SISTEM.md                  # Dokumentasi diagram alur 3 modul & aturan kalkulasi neraca
├── ANTI_AI_SLOP_GUIDE.md               # Standar visual resmi, token warna Kementan, aturan nol emoji
├── PROMPT_MASTER_KEMENTAN.md           # Master prompt acuan pengembangan AI & spesifikasi sistem
├── package_deploy.py                   # Script otomatis pembuatan berkas ZIP deployment VPS
├── simbenih_kementan_deploy.zip        # Paket arsip deployment siap unggah ke VPS (10.96 MB)
│
├── frontend/                           # PROYEK NEXT.JS (APLIKASI WEB & PORTAL ADMIN)
│   ├── package.json                    # Dependensi frontend (Next, React, Tailwind, Lucide)
│   ├── tsconfig.json                   # Konfigurasi compiler TypeScript & path aliases (@/*)
│   ├── tailwind.config.ts              # Konfigurasi warna resmi kementan-forest & kementan-gold
│   ├── postcss.config.mjs              # Konfigurasi pipeline CSS Tailwind
│   │
│   ├── public/                         # Aset statis publik
│   │   ├── favicon.ico                 # Ikon browser resmi
│   │   └── images/
│   │       ├── logo_kementan.svg       # Vektor Lambang Kementerian Pertanian & Ditjen Horti
│   │       ├── hero_hortikultura.jpg   # Banner foto fasilitas riset persemaian modern Kementan
│   │       └── benih_sertifikasi.jpg   # Foto makro benih bersertifikasi mutu resmi
│   │
│   └── src/
│       ├── types/
│       │   └── index.ts                # Definisi tipe TypeScript: Producer, Production, Variety, Roles
│       │
│       ├── data/
│       │   └── masterData.ts           # Master data 38 Provinsi, komoditas horti, dan mock state
│       │
│       ├── components/                 # Komponen antarmuka yang dapat dipakai ulang (reusable)
│       │   ├── Navbar.tsx              # Header resmi kepemerintahan Republik Indonesia
│       │   └── Footer.tsx              # Footer resmi kontak Direktorat Perbenihan Hortikultura
│       │
│       └── app/                        # Halaman-halaman Next.js App Router
│           ├── layout.tsx              # Root Layout: metadata resmi, font Inter & Plus Jakarta Sans
│           ├── globals.css             # Utility CSS & konfigurasi scrollbar halus
│           ├── page.tsx                # [HALAMAN 1] Portal Publik, Lacak Tiket & Masa Sanggah 30 Hari
│           │
│           └── dashboard/
│               ├── layout.tsx          # Master Layout Admin: Sidebar eksekutif & Role Switcher
│               ├── page.tsx            # [HALAMAN 5] Dashboard Eksekutif Nasional & Early Warning
│               │
│               ├── produsen-pengedar/
│               │   └── page.tsx        # [HALAMAN 2] Modul A: Pelaporan Produsen & Pengedar BPSB
│               │
│               ├── produksi-benih/
│               │   └── page.tsx        # [HALAMAN 3] Modul B: Neraca Stok Benih & Kalkulator Realtime
│               │
│               └── pendaftaran-varietas/
│                   └── page.tsx        # [HALAMAN 4] Modul C: Pendaftaran Varietas Permentan 24/2025
│
└── backend/                            # PROYEK LARAVEL 11 (REST API & DATABASE BACKEND)
    ├── composer.json                   # Dependensi backend PHP & Laravel 11
    ├── .env.example                    # Template konfigurasi database & environment
    ├── routes/
    │   └── api.php                     # Rute RESTful API (Producers, Seed Productions, Varieties)
    └── database/
        └── migrations/
            └── 2026_09_23_000001_create_sim_benih_horti_tables.php # Skema tabel relasional MySQL
```

---

## 3. PRASYARAT SISTEM (SYSTEM REQUIREMENTS)

Sebelum menjalankan aplikasi di komputer lokal (*development machine*), pastikan perangkat telah terpasang:
1. **Node.js:** Versi `18.18.0` ke atas (Direkomendasikan Node.js `20.x` atau `22.x LTS`).
   - Cek versi: `node -v` dan `npm -v`
2. **PHP:** Versi `8.2.0` ke atas.
   - Cek versi: `php -v`
3. **Composer:** Versi `2.5.0` ke atas.
   - Cek versi: `composer -v`
4. **Database MySQL:** MySQL 8.x atau MariaDB 10.4+ (Dapat menggunakan XAMPP, Laragon, atau MySQL Standalone).
5. **Python (Opsional untuk packaging):** Versi `3.8+` untuk menjalankan `package_deploy.py`.

---

## 4. PANDUAN INSTALASI LANGKAH DEMI LANGKAH (CARA INSTALASI)

### Langkah 1: Kloning / Ekstraksi Proyek
Pastikan seluruh berkas proyek berada di direktori lokal Anda, misalnya di `D:\Landing Page\Kementan\`.

---

### Langkah 2: Instalasi & Konfigurasi Frontend (Next.js)

1. Buka terminal PowerShell atau Command Prompt, lalu arahkan ke folder `frontend`:
   ```powershell
   cd "D:\Landing Page\Kementan\frontend"
   ```

2. Pasang seluruh dependensi pustaka Node.js:
   ```powershell
   npm install
   ```

3. Menjalankan Frontend di mode pengembangan (*Local Development*):
   ```powershell
   npm run dev
   ```
   Aplikasi akan otomatis aktif di alamat: **`http://localhost:3000`**

4. Untuk membuat build rilis produksi (*Production Build*):
   ```powershell
   npm run build
   npm run start
   ```

---

### Langkah 3: Instalasi & Konfigurasi Backend (Laravel 11 REST API)

1. Buka terminal baru dan arahkan ke folder `backend`:
   ```powershell
   cd "D:\Landing Page\Kementan\backend"
   ```

2. Pasang dependensi PHP melalui Composer:
   ```powershell
   composer install
   ```

3. Buat berkas konfigurasi `.env` dari template yang telah disediakan:
   ```powershell
   cp .env.example .env
   ```

4. Buat kunci enkripsi aplikasi Laravel:
   ```powershell
   php artisan key:generate
   ```

5. Konfigurasi kredensial database di dalam berkas `backend/.env`:
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=sim_benih_horti
   DB_USERNAME=root
   DB_PASSWORD=
   ```

6. Buat database baru di MySQL dengan nama `sim_benih_horti` (melalui phpMyAdmin atau terminal MySQL):
   ```sql
   CREATE DATABASE sim_benih_horti CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

7. Jalankan migrasi tabel database resmi Kementan:
   ```powershell
   php artisan migrate
   ```

8. Jalankan server backend REST API:
   ```powershell
   php artisan serve
   ```
   API akan aktif di alamat: **`http://localhost:8000/api`**

---

## 5. PANDUAN PERAWATAN HALAMAN DEMI HALAMAN (PAGE MAINTENANCE GUIDE)

Kode disusun modular per halaman agar pengembang dapat dengan mudah memodifikasi tata letak atau logika bisnis secara mandiri (*enteng dan terisolasi*):

| Halaman & Rute | Berkas Komponen Utama | Panduan & Komponen yang Perlu Diperhatikan |
| :--- | :--- | :--- |
| **Halaman 1: Portal Publik**<br>`/` | [`frontend/src/app/page.tsx`](file:///D:/Landing%20Page/Kementan/frontend/src/app/page.tsx) | **Maintenance Hero & Tracking:**<br>- Modifikasi banner di `hero_hortikultura.jpg`.<br>- Form pelacakan tiket diatur melalui state `searchCode` & `trackedApplication`.<br>- Komponen hitung mundur masa sanggah publik (30 hari) ada di section `#masa-sanggah`. |
| **Halaman 2: Produsen & Pengedar**<br>`/dashboard/produsen-pengedar` | [`frontend/src/app/dashboard/produsen-pengedar/page.tsx`](file:///D:/Landing%20Page/Kementan/frontend/src/app/dashboard/produsen-pengedar/page.tsx) | **Maintenance Data Lapangan BPSB:**<br>- Untuk menambah kolom baru pada formulir entri, tambahkan atribut pada objek `formData` dan tabel `seed_producers_distributors`.<br>- Validasi no. sertifikat kompetensi dan filter wilayah 38 provinsi diatur pada fungsi `filteredData`. |
| **Halaman 3: Neraca Produksi Benih**<br>`/dashboard/produksi-benih` | [`frontend/src/app/dashboard/produksi-benih/page.tsx`](file:///D:/Landing%20Page/Kementan/frontend/src/app/dashboard/produksi-benih/page.tsx) | **Maintenance Kalkulator Neraca Stok:**<br>- Logika matematis realtime: `calculatedRemainingStock = (previousStock + currentProduction) - distribution`.<br>- Proteksi defisit ada pada variabel boolean `isStockDeficit`.<br>- Pilihan satuan adaptif (`batang`, `kg`, `knol`, `planlet/stek`, `anakan`) diatur per jenis komoditas. |
| **Halaman 4: Pendaftaran Varietas**<br>`/dashboard/pendaftaran-varietas` | [`frontend/src/app/dashboard/pendaftaran-varietas/page.tsx`](file:///D:/Landing%20Page/Kementan/frontend/src/app/dashboard/pendaftaran-varietas/page.tsx) | **Maintenance 4 Alur Permentan 24/2025:**<br>- Tab 1: Formulir Rencana Pengujian (Lampiran 1).<br>- Tab 2: Evaluasi Sidang Pleno TP2VH (*Lolos*, *Perbaikan Lampiran 2.b*, *Tunda Bahas*).<br>- Tab 3: Masa Sanggah Publik 30 Hari.<br>- Tab 4: Rekomendasi & Penerbitan Nomor Tanda Daftar Resmi. |
| **Halaman 5: Dashboard Eksekutif**<br>`/dashboard` | [`frontend/src/app/dashboard/page.tsx`](file:///D:/Landing%20Page/Kementan/frontend/src/app/dashboard/page.tsx) | **Maintenance KPI & Role Switcher:**<br>- Widget agregasi KPI nasional membaca dari data transaksi terkini.<br>- Komponen *Role Switcher* demo diatur di [`frontend/src/app/dashboard/layout.tsx`](file:///D:/Landing%20Page/Kementan/frontend/src/app/dashboard/layout.tsx) untuk simulasi perspektif Super Admin, BPSB, LSSM, TP2VH, dan Pemohon. |

---

## 6. PANDUAN OTOMASI DEPLOYMENT KE SERVER VPS LINUX

Untuk memudahkan peluncuran sistem ke server VPS (Ubuntu 20.04 / 22.04 / 24.04 LTS atau Debian):

### A. Membuat Paket Arsip Deployment Lokal
Jalankan script Python pembuat paket dari root direktori proyek:
```powershell
python package_deploy.py
```
Script ini akan:
1. Memvalidasi seluruh kode sumber Next.js dan Laravel.
2. Mengecualikan (*exclude*) folder berat seperti `node_modules`, `vendor`, `.git`, `.next/cache`, dan file log.
3. Menghasilkan berkas arsip **`simbenih_kementan_deploy.zip`** (berukuran ringkas sekitar **10.96 MB**).

---

### B. Perintah Eksekusi 1 Baris di Terminal SSH VPS (One-Line Execution)
Unggah berkas `simbenih_kementan_deploy.zip` ke server VPS Anda (misalnya ke `/var/www`), lalu salin dan tempel perintah satu baris berikut ke terminal SSH:

```bash
unzip -o simbenih_kementan_deploy.zip -d /var/www/simbenih && cd /var/www/simbenih/backend && composer install --no-dev --optimize-autoloader && php artisan config:clear && php artisan migrate --force && php artisan db:seed --force && php artisan storage:link && chmod -R 775 storage bootstrap/cache && chown -R www-data:www-data /var/www/simbenih && cd ../frontend && npm install --omit=dev && pm2 restart simbenih-frontend || pm2 start npm --name "simbenih-frontend" -- start -- -p 3001 && sudo systemctl reload nginx && echo "=== DEPLOYMENT BERHASIL: SIM-BENIH KEMENTAN TELAH AKTIF ==="
```

---

### C. Contoh Konfigurasi Nginx Reverse Proxy di VPS
Buat file konfigurasi `/etc/nginx/sites-available/simbenih`:

```nginx
server {
    listen 80;
    server_name simbenih.pertanian.go.id; # Ganti dengan domain/IP VPS Anda

    client_max_body_size 50M;

    # Frontend Next.js (Port 3001 via PM2)
    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Backend REST API Laravel
    location /api/ {
        alias /var/www/simbenih/backend/public/;
        try_files $uri $uri/ @laravel;
        
        location ~ \.php$ {
            include snippets/fastcgi-php.conf;
            fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
            fastcgi_param SCRIPT_FILENAME /var/www/simbenih/backend/public/index.php;
            include fastcgi_params;
        }
    }

    location @laravel {
        rewrite /api/(.*)$ /api/index.php?/$1 last;
    }
}
```

Aktifkan konfigurasi Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/simbenih /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 7. STANDAR DESAIN ANTI-AI SLOP & IDENTITAS KEMENTAN RI

Aplikasi wajib mematuhi panduan [ANTI_AI_SLOP_GUIDE.md](file:///D:/Landing%20Page/Kementan/ANTI_AI_SLOP_GUIDE.md):
- **Palet Warna Agraris:** `Kementan Forest Deep` (`#064E3B`), `Emerald Vibrant` (`#059669`), `Harvest Warm Gold` (`#D97706`).
- **Bebas Emoji Sistem:** Dilarang menggunakan emoji sistem seperti 🚀, ✨, 🔥, 🌱, 📊 pada tombol, tabel, dan navigasi. Wajib menggunakan vektor ikon `lucide-react`.
- **Kop Surat & Validitas Digital:** Setiap berkas cetak dilengkapi kop surat resmi Kementerian Pertanian Republik Indonesia dan kode verifikasi QR-Code.

---

## 8. KONTAK & PUSAT DUKUNGAN TEKNIS
**Direktorat Perbenihan Hortikultura**  
Direktorat Jenderal Hortikultura — Kementerian Pertanian Republik Indonesia  
Gedung D Lantai 2, Kantor Pusat Kementerian Pertanian RI  
Jl. Harsono RM No. 3, Ragunan, Pasar Minggu, Jakarta Selatan 12550  
Email Layanan: `perbenihan.hortikultura@pertanian.go.id`  
Telepon: (021) 781-5380 ext. 2341
