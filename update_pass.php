<?php
function getDb() {
    $ports = [3307, 3306];
    $pdo = null;
    $lastError = null;

    foreach ($ports as $port) {
        try {
            $dsn = "mysql:host=127.0.0.1;port={$port};dbname=sim_benih_horti;charset=utf8mb4";
            $pdo = new PDO($dsn, 'root', '', [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            ]);
            break;
        } catch (Exception $e) {
            $lastError = $e->getMessage();
        }
    }

    if (!$pdo) {
        die("Connection error: $lastError\n");
    }
    return $pdo;
}

$pdo = getDb();
$hashKementan = password_hash('Kementan2026!', PASSWORD_BCRYPT);
$hashAdmin123 = password_hash('admin123', PASSWORD_BCRYPT);

// Update superadmin to valid bcrypt
$stmt = $pdo->prepare("UPDATE users SET password = :p WHERE username = 'superadmin'");
$stmt->execute([':p' => $hashAdmin123]);

echo "Updated superadmin password hash to bcrypt of admin123\n";
