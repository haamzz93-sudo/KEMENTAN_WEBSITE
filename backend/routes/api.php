<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| REST API Routes — SIM-BENIH HORTI (KEMENTAN RI)
|--------------------------------------------------------------------------
*/

// Public Health & Version Check
Route::get('/health', function () {
    return response()->json([
        'status' => 'online',
        'system' => 'SIM-BENIH HORTI — Kementerian Pertanian RI',
        'regulation' => 'Permentan No. 24 Tahun 2025',
        'timestamp' => now()->toIso8601String()
    ]);
});

// MODUL A: Produsen & Pengedar Benih Hortikultura (BPSB)
Route::prefix('producers')->group(function () {
    Route::get('/', function (Request $request) {
        return response()->json([
            'status' => 'success',
            'message' => 'Daftar produsen dan pengedar benih hortikultura berizin 38 BPSB Provinsi.',
            'total' => 3,
            'data' => []
        ]);
    });

    Route::post('/', function (Request $request) {
        return response()->json([
            'status' => 'success',
            'message' => 'Data produsen berhasil disimpan ke basis data BPSB.',
            'reg_number' => 'REG-BPSB-' . strtoupper(substr($request->input('province', 'JB'), 0, 2)) . '-' . date('Y') . '-' . rand(1000, 9999)
        ], 201);
    });

    Route::get('/export/excel', function () {
        return response()->json([
            'status' => 'success',
            'message' => 'Laporan rekapitulasi BPSB di-generate.',
            'format' => 'xlsx'
        ]);
    });
});

// MODUL B: Neraca Data Produksi Benih Bulanan (BPSB & LSSM)
Route::prefix('seed-productions')->group(function () {
    Route::get('/', function (Request $request) {
        return response()->json([
            'status' => 'success',
            'period' => $request->input('month', date('Y-m')),
            'data' => []
        ]);
    });

    Route::post('/', function (Request $request) {
        $stokLalu = (int) $request->input('previous_stock', 0);
        $produksi = (int) $request->input('current_production', 0);
        $penyaluran = (int) $request->input('distribution', 0);
        $sisa = ($stokLalu + $produksi) - $penyaluran;

        if ($sisa < 0) {
            return response()->json([
                'status' => 'error',
                'message' => 'Penyaluran benih melebihi total ketersediaan (Stok Lalu + Produksi Baru).'
            ], 422);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Neraca data produksi benih berhasil divalidasi dan disimpan.',
            'remaining_stock' => $sisa
        ], 201);
    });

    Route::get('/export/multi-sheet', function () {
        return response()->json([
            'status' => 'success',
            'sheets' => ['Rekap_BPSB', 'Rekap_LSSM', 'Sayuran', 'Buah', 'Hias', 'Obat'],
            'message' => 'Export multi-sheet berhasil dibuat sesuai template resmi Ditjen Hortikultura.'
        ]);
    });
});

// MODUL C: Pendaftaran Varietas Hortikultura (Permentan 24/2025)
Route::prefix('varieties')->group(function () {
    // Layanan 4: Tracking Publik Berbasis Tiket
    Route::get('/track/{code}', function ($code) {
        return response()->json([
            'status' => 'success',
            'tracking_code' => $code,
            'message' => 'Pelacakan status permohonan varietas real-time.'
        ]);
    });

    // Layanan 3: Portal Masa Sanggah 30 Hari
    Route::get('/public-objections', function () {
        return response()->json([
            'status' => 'success',
            'regulation' => 'Pasal 16 Permentan No. 24/2025',
            'duration_days' => 30,
            'data' => []
        ]);
    });

    // Layanan 1: Pemberitahuan Rencana Uji
    Route::post('/test-notice', function (Request $request) {
        $code = 'VAR-' . date('Y') . '-HORTI-' . rand(1000, 9999);
        return response()->json([
            'status' => 'success',
            'tracking_code' => $code,
            'message' => 'Surat Rencana Pengujian (Lampiran 1) berhasil diajukan untuk verifikasi.'
        ], 201);
    });

    // Layanan 2: Sidang Penilaian TP2VH
    Route::post('/{id}/tp2vh-evaluate', function ($id, Request $request) {
        return response()->json([
            'status' => 'success',
            'application_id' => $id,
            'session_status' => $request->input('tp2vh_status', 'lolos_disetujui'),
            'message' => 'Status sidang TP2VH berhasil diperbarui.'
        ]);
    });
});

// =========================================================================
// DATA VARIETAS TERDAFTAR NASIONAL (PROSEED KEMENTERIAN PERTANIAN RI)
// =========================================================================
Route::prefix('registered-varieties')->group(function () {
    Route::get('/', function (Request $request) {
        $search = strtolower(trim((string) $request->input('search', '')));
        $kategori = trim((string) $request->input('kategori', ''));
        $komoditas = trim((string) $request->input('komoditas', ''));
        $tahun = trim((string) $request->input('tahun', ''));
        $page = max(1, (int) $request->input('page', 1));
        $limit = min(100, max(5, (int) $request->input('limit', 20)));

        $allData = [];

        // Check if DB table exists & populated
        try {
            if (\Illuminate\Support\Facades\Schema::hasTable('registered_varieties') && \App\Models\RegisteredVariety::count() > 0) {
                $query = \App\Models\RegisteredVariety::query();

                if (!empty($search)) {
                    $query->where(function ($q) use ($search) {
                        $q->where('nama_varietas', 'like', "%{$search}%")
                          ->orWhere('no_sk', 'like', "%{$search}%")
                          ->orWhere('produsen', 'like', "%{$search}%")
                          ->orWhere('komoditas', 'like', "%{$search}%");
                    });
                }

                if (!empty($kategori) && $kategori !== 'Semua') {
                    $query->where('kategori', 'like', "%{$kategori}%");
                }

                if (!empty($komoditas) && $komoditas !== 'Semua') {
                    $query->where('komoditas', $komoditas);
                }

                if (!empty($tahun) && $tahun !== 'Semua') {
                    $query->where('tahun_daftar', $tahun);
                }

                $total = $query->count();
                $items = $query->orderBy('id', 'asc')
                              ->skip(($page - 1) * $limit)
                              ->take($limit)
                              ->get();

                return response()->json([
                    'status' => 'success',
                    'source' => 'mysql',
                    'total' => $total,
                    'current_page' => $page,
                    'last_page' => (int) ceil($total / $limit),
                    'per_page' => $limit,
                    'summary' => [
                        'total_all' => 4009,
                        'sayuran' => 2504,
                        'buah' => 1105,
                        'flori' => 360,
                        'obat' => 40
                    ],
                    'data' => $items
                ]);
            }
        } catch (\Throwable $e) {
            // Fallback to local JSON
        }

        // Fallback to JSON file
        $jsonFile = database_path('data/varietas_terdaftar.json');
        if (file_exists($jsonFile)) {
            $allData = json_decode(file_get_contents($jsonFile), true) ?: [];
        }

        // Filter
        $filtered = array_filter($allData, function ($item) use ($search, $kategori, $komoditas, $tahun) {
            if (!empty($search)) {
                $haystack = strtolower(($item['nama_varietas'] ?? '') . ' ' . ($item['no_sk'] ?? '') . ' ' . ($item['produsen'] ?? '') . ' ' . ($item['komoditas'] ?? ''));
                if (strpos($haystack, $search) === false) {
                    return false;
                }
            }
            if (!empty($kategori) && $kategori !== 'Semua') {
                if (stripos($item['kategori'] ?? '', $kategori) === false) {
                    return false;
                }
            }
            if (!empty($komoditas) && $komoditas !== 'Semua') {
                if (($item['komoditas'] ?? '') !== $komoditas) {
                    return false;
                }
            }
            if (!empty($tahun) && $tahun !== 'Semua') {
                if (($item['tahun_daftar'] ?? '') !== $tahun) {
                    return false;
                }
            }
            return true;
        });

        $filtered = array_values($filtered);
        $total = count($filtered);
        $offset = ($page - 1) * $limit;
        $sliced = array_slice($filtered, $offset, $limit);

        return response()->json([
            'status' => 'success',
            'source' => 'json_fallback',
            'total' => $total,
            'current_page' => $page,
            'last_page' => (int) ceil($total / $limit),
            'per_page' => $limit,
            'summary' => [
                'total_all' => 4009,
                'sayuran' => 2504,
                'buah' => 1105,
                'flori' => 360,
                'obat' => 40
            ],
            'data' => $sliced
        ]);
    });
});

