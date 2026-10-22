# PANDUAN DESAIN EKSEKUTIF & ANTI-AI SLOP
## SISTEM INFORMASI PERBENIHAN HORTIKULTURA NASIONAL (SIM-BENIH HORTI)
### KEMENTERIAN PERTANIAN REPUBLIK INDONESIA

Dokumen ini merupakan standar wajib desain antarmuka (*UI/UX Design System*) untuk seluruh pengembang yang membangun atau merawat aplikasi **SIM-BENIH HORTI**. Standar ini dirancang untuk menjamin tampilan berwibawa, beridentitas kepemerintahan resmi Republik Indonesia, dan bebas total dari ciri khas klise AI yang tidak profesional (*Anti-AI Slop*).

---

## 1. PALET WARNA RESMI KEMENTAN RI

Aplikasi wajib menggunakan palet warna agraris kepemerintahan yang berwibawa. Penggunaan warna diatur secara ketat:

| Token Warna | Nilai HEX | Peruntukan Utama | Catatan Penerapan |
| :--- | :--- | :--- | :--- |
| **Kementan Forest Deep** | `#064E3B` / `#065F46` | Header primer, Sidebar admin, Judul halaman utama, Tomat CTA primer | Memberikan wibawa resmi institusi negara |
| **Kementan Emerald Vibrant** | `#059669` / `#10B981` | Tombol simpan/aksi, badge status "Lolos/Aktif", indikator surplus | Aksen hijau segar simbol pertanian makmur |
| **Harvest Warm Gold** | `#D97706` / `#F59E0B` | Lencana sertifikasi kompetensi, countdown masa sanggah, alert perbaikan | Melambangkan panen keemasan & legalitas |
| **Earthy Soil Accent** | `#78350F` / `#92400E` | Aksen kategori komoditas, garis tepi penunjang data varietas | Menghubungkan visual dengan tanah & benih |
| **Surface Pure White** | `#FFFFFF` | Latar card data, kontainer formulir, latar tabel | Bersih dan kontras tinggi |
| **Canvas Slate Light** | `#F8FAFC` / `#F1F5F9` | Latar belakang halaman (*page background*) | Menghindari silau mata saat input data panjang |
| **Neutral Border** | `#E2E8F0` / `#CBD5E1` | Garis batas tabel, input field border, pemisah section | Halus (*subtle*), tidak mencolok |

> [!CAUTION]
> **DILARANG KERAS:**
> - Menggunakan gradasi warna klise AI generator: `from-indigo-500 to-purple-600`, `from-fuchsia-500 to-pink-500`, atau gradasi neon sejenis.
> - Menggunakan dark mode hitam pekat (`#000000`) sebagai tampilan standar aplikasi pemerintahan.
> - Menggunakan warna primer merah atau biru terang yang tidak relevan dengan identitas agraris Kementan RI.

---

## 2. ATURAN BEBAS EMOJI (STRICT ZERO SYSTEM EMOJIS)

Dilarang keras menggunakan emoji sistem Unicode (seperti 🚀, ✨, 🔥, 🌱, 📊, 📋, 🌾, 🔔, dll.) pada:
- Tombol aksi (*Button text*)
- Judul menu atau navigasi (*Navbar / Sidebar menu*)
- Judul bab atau heading markdown (*H1, H2, H3*)
- Badge status atau chip label
- Header tabel data

### Standar Pengganti:
Wajib menggunakan **Vektor Ikon Resmi** dari pustaka `lucide-react`:
- Manajemen Benih & Tanaman: `<Sprout />`, `<Leaf />`, `<TreeDeciduous />`
- BPSB & Kantor Wilayah: `<Building2 />`, `<Landmark />`, `<MapPin />`
- Sertifikat & Legalitas: `<ShieldCheck />`, `<Award />`, `<FileCheck />`
- Neraca & Data Laporan: `<FileSpreadsheet />`, `<BarChart3 />`, `<ArrowDownUp />`
- Pendaftaran & Dokumen: `<FileText />`, `<ClipboardCheck />`, `<History />`
- Waktu & Masa Sanggah: `<CalendarClock />`, `<Timer />`, `<Clock />`
- Fitur Interaktif: `<Search />`, `<Filter />`, `<Download />`, `<Printer />`, `<QrCode />`

---

## 3. TIPOGRAFI & HIERARKI TEKS

- **Heading Font:** `Plus Jakarta Sans` / `Outfit` (Bobot: 600 Semi-Bold, 700 Bold). Menampilkan ketegasan, modernitas, dan integritas birokrasi yang adaptif.
- **Body & Data Font:** `Inter` (Bobot: 400 Regular, 500 Medium, 600 Semi-Bold). Optimal untuk keterbacaan angka numerik, tabel data ribuan baris, dan formulir panjang.
- **Monospace Font (Kode Registrasi / Nomor Sertifikat):** `JetBrains Mono` / `Courier New` dengan tracking lebar halus.

---

## 4. KOMPONEN UI BERWIBAWA & RAMAH OPERASIONAL

1. **Card Data & Kontainer:**
   - Sudut membulat modern: `rounded-xl` (12px) atau `rounded-2xl` (16px).
   - Border halus: `border border-slate-200/80` atau `border border-emerald-950/10`.
   - Bayangan lembut (*soft shadow*): `shadow-sm hover:shadow-md transition-shadow`.

2. **Tabel Data Administrasi:**
   - Header tabel bernuansa abu-abu terang sejuk (`bg-slate-50 text-slate-700 font-semibold text-xs uppercase tracking-wider`).
   - Baris selang-seling halus (*subtle zebra pattern*): `hover:bg-emerald-50/40 transition-colors`.
   - Angka numerik rata kanan (*text-right*) dengan format pemisah ribuan standar Indonesia (`1.250.000 kg`).

3. **Status Badges & Chips:**
   - Menggunakan warna latar berpadu teks bernada sama:
     - Disetujui / Terdaftar: `bg-emerald-50 text-emerald-800 border border-emerald-200`
     - Masa Sanggah 30 Hari: `bg-amber-50 text-amber-800 border border-amber-200`
     - Perbaikan Dokumen: `bg-orange-50 text-orange-800 border border-orange-200`
     - Tunda Bahas / Verifikasi: `bg-blue-50 text-blue-800 border border-blue-200`

---

## 5. DOKUMEN CETAK & IDENTITAS KOP RESMI
Setiap fitur cetak laporan (PDF/Kop Surat) harus menampilkan:
- Kop Surat Resmi: **KEMENTERIAN PERTANIAN REPUBLIK INDONESIA**
- Sub-Kop: **DIREKTORAT JENDERAL HORTIKULTURA — DIREKTORAT PERBENIHAN HORTIKULTURA**
- Lambang Garuda Pancasila / Logo Kementan di kiri atas.
- Nomor verifikasi digital berbasis **QR Code** untuk validitas hukum dokumen.
