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
$stmt = $pdo->query("SELECT id, username, email, role, password, name FROM users");
$users = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo "Total users: " . count($users) . "\n";
foreach ($users as $u) {
    $matchesKementan = password_verify('Kementan2026!', $u['password']) ? 'YES' : 'NO';
    $matchesAdmin123 = password_verify('admin123', $u['password']) ? 'YES' : 'NO';
    $matchesAdmin = password_verify('admin', $u['password']) ? 'YES' : 'NO';
    echo "ID: {$u['id']} | User: {$u['username']} | Role: {$u['role']} | PassHash: {$u['password']} | Kementan2026!: {$matchesKementan} | admin123: {$matchesAdmin123} | admin: {$matchesAdmin}\n";
}
