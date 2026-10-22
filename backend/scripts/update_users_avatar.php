<?php

$host = '127.0.0.1';
$dbname = 'sim_benih_horti';
$user = 'root';
$pass = '';

$pdo = null;
foreach ([3307, 3306] as $port) {
    try {
        $pdo = new PDO("mysql:host={$host};port={$port};dbname={$dbname};charset=utf8mb4", $user, $pass, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]);
        break;
    } catch (PDOException $e) {
        // try next
    }
}

if (!$pdo) {
    die("Database connection failed.\n");
}

// Add avatar column if not exists
try {
    $pdo->exec("ALTER TABLE users ADD COLUMN avatar VARCHAR(255) DEFAULT NULL AFTER phone;");
    echo "Column avatar added successfully.\n";
} catch (PDOException $e) {
    echo "Column avatar already exists or error: " . $e->getMessage() . "\n";
}

// Create uploads directory if not exists
$uploadDir = __DIR__ . '/../public/uploads/avatars';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0777, true);
    echo "Created upload directory: {$uploadDir}\n";
}

// Display all users
$stmt = $pdo->query("SELECT id, name, username, email, role, agency_name, avatar FROM users");
$users = $stmt->fetchAll();
echo "Total users in database: " . count($users) . "\n";
foreach ($users as $u) {
    echo "- [ID {$u['id']}] {$u['username']} ({$u['role']}) - {$u['name']}\n";
}
