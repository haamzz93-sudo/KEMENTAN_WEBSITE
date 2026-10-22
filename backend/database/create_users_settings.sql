-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('super_admin', 'bpsb', 'lssm', 'tp2vh', 'applicant') NOT NULL DEFAULT 'applicant',
    province VARCHAR(100) NULL,
    agency_name VARCHAR(255) NULL,
    phone VARCHAR(50) NULL,
    status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create web_settings table for CMS / Landing Page settings
CREATE TABLE IF NOT EXISTS web_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value LONGTEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert or replace default Super Admin and other role accounts
INSERT INTO users (name, email, username, password, role, province, agency_name, phone, status)
VALUES 
('Super Admin Pusat (Ditjen Hortikultura)', 'superadmin@pertanian.go.id', 'superadmin', '$2y$10$wT3G43D9Q6fHk5N3wQnJqu3tUo9L0qK7uJ5rK0p3Z1u1l9y8y1q1y', 'super_admin', 'Pusat (DKI Jakarta)', 'Direktorat Perbenihan Hortikultura', '021-7815380', 'active'),
('Petugas BPSB Jawa Barat', 'bpsb.jabar@pertanian.go.id', 'bpsb_jabar', '$2y$10$wT3G43D9Q6fHk5N3wQnJqu3tUo9L0qK7uJ5rK0p3Z1u1l9y8y1q1y', 'bpsb', 'Jawa Barat', 'BPSBTPH Prov. Jawa Barat', '022-7561234', 'active'),
('Petugas BPSB Jawa Timur', 'bpsb.jatim@pertanian.go.id', 'bpsb_jatim', '$2y$10$wT3G43D9Q6fHk5N3wQnJqu3tUo9L0qK7uJ5rK0p3Z1u1l9y8y1q1y', 'bpsb', 'Jawa Timur', 'UPT PSBTPH Jawa Timur', '031-8291234', 'active'),
('Auditor Mutu LSSM Nasional', 'auditor.lssm@pertanian.go.id', 'auditor_lssm', '$2y$10$wT3G43D9Q6fHk5N3wQnJqu3tUo9L0qK7uJ5rK0p3Z1u1l9y8y1q1y', 'lssm', 'Nasional', 'Lembaga Sertifikasi Sistem Mutu Benih (LSSM 01-IDN)', '021-7889988', 'active'),
('Sekretariat & Tim Penilai TP2VH', 'tp2vh@pertanian.go.id', 'tim_tp2vh', '$2y$10$wT3G43D9Q6fHk5N3wQnJqu3tUo9L0qK7uJ5rK0p3Z1u1l9y8y1q1y', 'tp2vh', 'Pusat (DKI Jakarta)', 'Tim Penilai Pelepasan Varietas Hortikultura', '021-7815380 ext. 2341', 'active'),
('PT East West Seed Indonesia (Pemohon)', 'pemohon@eastwestseed.com', 'pemohon_ewsi', '$2y$10$wT3G43D9Q6fHk5N3wQnJqu3tUo9L0qK7uJ5rK0p3Z1u1l9y8y1q1y', 'applicant', 'Jawa Barat', 'PT East West Seed Indonesia', '0264-201871', 'active')
ON DUPLICATE KEY UPDATE name=VALUES(name), role=VALUES(role), province=VALUES(province), agency_name=VALUES(agency_name);
