<?php
$ports = [3307, 3306];
$pdo = null;

foreach ($ports as $port) {
    try {
        $dsn = "mysql:host=127.0.0.1;port={$port};dbname=sim_benih_horti;charset=utf8mb4";
        $pdo = new PDO($dsn, 'root', '', [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]);
        break;
    } catch (Exception $e) {
    }
}

if (!$pdo) {
    die("Database connection failed.\n");
}

$pdo->exec("
CREATE TABLE IF NOT EXISTS role_permissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role VARCHAR(50) NOT NULL UNIQUE,
    role_name VARCHAR(100) NOT NULL,
    description TEXT,
    allowed_features JSON NOT NULL,
    sidebar_menus JSON NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
");

$defaultPerms = [
    [
        'role' => 'super_admin',
        'role_name' => 'Super Admin Pusat (Ditjen Hortikultura)',
        'description' => 'Akses penuh seluruh modul, kelola pengguna, master data, dan persetujuan kata sandi',
        'allowed_features' => ['dashboard', 'master_data', 'modul_a', 'modul_b', 'modul_c', 'pengguna', 'cms', 'profil'],
        'sidebar_menus' => ['dashboard', 'master_data', 'modul_a', 'modul_b', 'modul_c', 'pengguna', 'cms', 'profil']
    ],
    [
        'role' => 'bpsb',
        'role_name' => 'Petugas BPSB (38 Provinsi)',
        'description' => 'Pelaporan produsen wilayah, neraca stok benih 4 kelompok tanaman, status sinkronisasi',
        'allowed_features' => ['dashboard', 'modul_a', 'modul_b', 'profil'],
        'sidebar_menus' => ['dashboard', 'modul_a', 'modul_b', 'profil']
    ],
    [
        'role' => 'lssm',
        'role_name' => 'Auditor Mutu LSSM',
        'description' => 'Audit produsen bersertifikat kompetensi, uji laboratorium mutu benih, neraca produsen',
        'allowed_features' => ['dashboard', 'modul_a', 'modul_b', 'profil'],
        'sidebar_menus' => ['dashboard', 'modul_a', 'modul_b', 'profil']
    ],
    [
        'role' => 'tp2vh',
        'role_name' => 'Tim Penilai TP2VH',
        'description' => 'Verifikasi rencana uji Lampiran 1, sidang pleno 2.a, putusan masa sanggah 30 hari',
        'allowed_features' => ['dashboard', 'modul_c', 'profil'],
        'sidebar_menus' => ['dashboard', 'modul_c', 'profil']
    ],
    [
        'role' => 'applicant',
        'role_name' => 'Produsen / Pemohon',
        'description' => 'Pengajuan rencana uji varietas baru, naskah hasil uji, pemantauan status permohonan',
        'allowed_features' => ['dashboard', 'modul_c', 'modul_a', 'profil'],
        'sidebar_menus' => ['dashboard', 'modul_c', 'modul_a', 'profil']
    ]
];

$stmt = $pdo->prepare("
    INSERT INTO role_permissions (role, role_name, description, allowed_features, sidebar_menus)
    VALUES (:role, :role_name, :description, :allowed_features, :sidebar_menus)
    ON DUPLICATE KEY UPDATE 
        role_name = VALUES(role_name),
        description = VALUES(description),
        allowed_features = VALUES(allowed_features),
        sidebar_menus = VALUES(sidebar_menus)
");

foreach ($defaultPerms as $p) {
    $stmt->execute([
        ':role' => $p['role'],
        ':role_name' => $p['role_name'],
        ':description' => $p['description'],
        ':allowed_features' => json_encode($p['allowed_features']),
        ':sidebar_menus' => json_encode($p['sidebar_menus'])
    ]);
}

// Update profile Super Admin user 1 to ensure full high-ranking info
$pdo->exec("
UPDATE users SET 
    name = 'Super Admin Pusat (Ditjen Hortikultura)',
    agency_name = 'Direktorat Perbenihan Hortikultura • Kementan RI',
    province = 'Pusat (DKI Jakarta)',
    phone = '021-7815380',
    email = 'superadmin@pertanian.go.id'
WHERE id = 1
");

echo "MIGRATION_ROLE_PERMS_SUCCESS\n";
