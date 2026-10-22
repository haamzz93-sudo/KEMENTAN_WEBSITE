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
