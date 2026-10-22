<?php

$jsonData = file_get_contents(__DIR__ . '/../../master_excel_data.json');
$master = json_decode($jsonData, true);

// Load credentials from .env
$host = '127.0.0.1';
$port = 3306;
$dbname = 'sim_benih_horti';
$user = 'root';
$pass = '';

$envPaths = [__DIR__ . '/../.env', __DIR__ . '/../../.env', __DIR__ . '/.env'];
foreach ($envPaths as $envPath) {
    if (file_exists($envPath)) {
        $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines as $line) {
            $line = trim($line);
            if (empty($line) || strpos($line, '#') === 0) continue;
            if (strpos($line, '=') !== false) {
                list($k, $v) = explode('=', $line, 2);
                $k = trim($k);
                $v = trim($v, " \t\n\r\0\x0B\"'");
                if ($k === 'DB_HOST') $host = $v;
                if ($k === 'DB_PORT') $port = intval($v);
                if ($k === 'DB_DATABASE') $dbname = $v;
                if ($k === 'DB_USERNAME') $user = $v;
                if ($k === 'DB_PASSWORD') $pass = $v;
            }
        }
        break;
    }
}

if (getenv('DB_HOST')) $host = getenv('DB_HOST');
if (getenv('DB_PORT')) $port = intval(getenv('DB_PORT'));
if (getenv('DB_DATABASE')) $dbname = getenv('DB_DATABASE');
if (getenv('DB_USERNAME')) $user = getenv('DB_USERNAME');
if (getenv('DB_PASSWORD')) $pass = getenv('DB_PASSWORD');

$pdo = null;
$portsToTry = array_unique([$port, 3306, 3307]);
$lastError = '';

foreach ($portsToTry as $p) {
    try {
        $pdo = new PDO("mysql:host={$host};port={$p};dbname={$dbname};charset=utf8mb4", $user, $pass, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]);
        echo "Connected to MySQL database '{$dbname}' on {$host}:{$p} as user '{$user}'\n";
        break;
    } catch (PDOException $e) {
        $lastError = $e->getMessage();
    }
}

if (!$pdo) {
    die("Failed to connect to MySQL: {$lastError}\n");
}

// 1. master_crop_types
$pdo->exec("
CREATE TABLE IF NOT EXISTS master_crop_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(100) NOT NULL,
    commodities TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
");

// 2. master_units
$pdo->exec("
CREATE TABLE IF NOT EXISTS master_units (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(255) NOT NULL,
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
");

// 3. master_bpsb
$pdo->exec("
CREATE TABLE IF NOT EXISTS master_bpsb (
    id INT AUTO_INCREMENT PRIMARY KEY,
    no_urut INT NOT NULL,
    provinsi VARCHAR(100) NOT NULL,
    nama_bpsb VARCHAR(255) NOT NULL,
    alamat TEXT NOT NULL,
    status ENUM('aktif', 'nonaktif') DEFAULT 'aktif',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
");

// 4. master_lssm
$pdo->exec("
CREATE TABLE IF NOT EXISTS master_lssm (
    id INT AUTO_INCREMENT PRIMARY KEY,
    no_urut INT NOT NULL,
    provinsi VARCHAR(100) NOT NULL,
    nama_produsen VARCHAR(255) NOT NULL,
    alamat TEXT NOT NULL,
    status ENUM('terakreditasi', 'proses_audit', 'nonaktif') DEFAULT 'terakreditasi',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
");

// Seed master_crop_types
$pdo->exec("TRUNCATE TABLE master_crop_types;");
$stmtCrop = $pdo->prepare("INSERT INTO master_crop_types (code, name, category, commodities) VALUES (?, ?, ?, ?)");
$crops = [
    ['sayuran', 'Tanaman Sayuran', 'Hortikultura Pangan', 'Mentimun, Buncis, Cabai, Cabai Merah, Cabai Rawit, Kangkung, Kacang Panjang, Tomat, Sawi Hijau, Bayam, Jagung Manis, Oyong, Paria, Terong, Bawang Merah, Kentang, Bawang Putih, Kol Bunga'],
    ['buah', 'Tanaman Buah', 'Hortikultura Buah Tropika', 'Melon, Semangka, Alpukat, Mangga, Rambutan, Durian, Jeruk, Manggis, Pisang, Jambu Air, Jambu Biji, Lengkeng, Nenas, Salak, Pepaya, Duku, Sukun, Sawo, Nangka, Petai, Sirsak, Jambo Bol, Belimbing, Cempedak, Matoa, Blewah, Stroberi'],
    ['hias', 'Tanaman Hias', 'Florikultura', 'Anggrek, Krisan, Mawar, Sedap Malam, Aglaonema, Anthurium, Dracaena'],
    ['obat', 'Tanaman Obat', 'Biofarmaka', 'Jahe, Kunyit, Temulawak, Lengkuas, Kencur, Kapulaga, Mengkudu, Lidah Buaya']
];
foreach ($crops as $c) {
    $stmtCrop->execute($c);
}

// Seed master_units
$pdo->exec("TRUNCATE TABLE master_units;");
$stmtUnit = $pdo->prepare("INSERT INTO master_units (code, name, description, note) VALUES (?, ?, ?, ?)");
$units = [
    ['batang', 'Batang', 'Satuan bibit atau perbanyakan bibit tanaman hortikultura pohon/buah', 'Digunakan untuk bibit tanaman buah, bibit pohon keras, dan tanaman obat berbatang.'],
    ['kg', 'Kg (Kilogram)', 'Satuan massa/bobot standar benih hortikultura kering dan kemasan', 'Satuan resmi pelaporan neraca benih sayuran, cabai, bawang merah, dan rimpang biofarmaka.'],
    ['knol', 'Knol', 'Satuan umbi bibit vegetatif hortikultura khusus kentang', 'Untuk knol biasanya terjadi pada komoditas kentang, dengan konversi standar 1 knol = 1 kg.'],
    ['stek', 'Stek / Planlet', 'Satuan perbanyakan vegetatif mikro / kultur jaringan laboratorium', 'Digunakan pada tanaman hias (anggrek/krisan) dan benih sumber kentang G0.'],
    ['anakan', 'Anakan', 'Satuan bibit tunas anakan vegetatif', 'Digunakan pada tanaman buah seperti pisang dan nanas.']
];
foreach ($units as $u) {
    $stmtUnit->execute($u);
}

// Seed master_bpsb
$pdo->exec("TRUNCATE TABLE master_bpsb;");
$stmtBpsb = $pdo->prepare("INSERT INTO master_bpsb (no_urut, provinsi, nama_bpsb, alamat) VALUES (?, ?, ?, ?)");
foreach ($master['bpsb'] as $b) {
    $stmtBpsb->execute([$b['no'], $b['provinsi'], $b['nama'], $b['alamat']]);
}

// Seed master_lssm
$pdo->exec("TRUNCATE TABLE master_lssm;");
$stmtLssm = $pdo->prepare("INSERT INTO master_lssm (no_urut, provinsi, nama_produsen, alamat) VALUES (?, ?, ?, ?)");
foreach ($master['lssm'] as $l) {
    $stmtLssm->execute([$l['no'], $l['provinsi'], $l['nama'], $l['alamat']]);
}

echo "Successfully seeded master tables:\n";
echo "- Crop Types: " . $pdo->query("SELECT COUNT(*) FROM master_crop_types")->fetchColumn() . " rows\n";
echo "- Units: " . $pdo->query("SELECT COUNT(*) FROM master_units")->fetchColumn() . " rows\n";
echo "- BPSB Balai: " . $pdo->query("SELECT COUNT(*) FROM master_bpsb")->fetchColumn() . " rows\n";
echo "- LSSM Produsen: " . $pdo->query("SELECT COUNT(*) FROM master_lssm")->fetchColumn() . " rows\n";
