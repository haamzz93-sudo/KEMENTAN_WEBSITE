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

// 1. Password change requests table
$pdo->exec("CREATE TABLE IF NOT EXISTS `password_requests` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `username` VARCHAR(100) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `role` VARCHAR(50) NOT NULL,
    `new_password_hash` VARCHAR(255) NOT NULL,
    `plain_hint` VARCHAR(50) DEFAULT NULL,
    `reason` TEXT DEFAULT NULL,
    `status` ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    `admin_note` TEXT DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

// 2. Bug reports table
$pdo->exec("CREATE TABLE IF NOT EXISTS `bug_reports` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT DEFAULT NULL,
    `reporter_name` VARCHAR(191) NOT NULL,
    `reporter_contact` VARCHAR(100) DEFAULT NULL,
    `title` VARCHAR(255) NOT NULL,
    `page_url` VARCHAR(255) DEFAULT NULL,
    `severity` ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    `category` ENUM('bug', 'ui', 'account', 'suggestion') DEFAULT 'bug',
    `description` TEXT NOT NULL,
    `status` ENUM('baru', 'investigasi', 'selesai') DEFAULT 'baru',
    `admin_response` TEXT DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

echo "Tables password_requests and bug_reports created successfully!\n";
