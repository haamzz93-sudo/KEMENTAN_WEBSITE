#!/usr/bin/env python3
"""
SIM-BENIH HORTI — LOCAL PACKAGING AUTOMATION SCRIPT
KEMENTERIAN PERTANIAN REPUBLIK INDONESIA
Direktorat Perbenihan Hortikultura — Permentan No. 24 Tahun 2025

Script ini mem-bundle seluruh sistem (Next.js Frontend, Laravel Backend, Dokumentasi, & Migrasi)
menjadi berkas arsip zip bersih 'simbenih_kementan_deploy.zip' siap unggah ke server VPS Linux.
"""

import os
import sys
import zipfile
import time

PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
ZIP_FILENAME = "simbenih_kementan_deploy.zip"
ZIP_OUTPUT_PATH = os.path.join(PROJECT_ROOT, ZIP_FILENAME)

EXCLUDE_DIRS = {
    'node_modules',
    'vendor',
    '.git',
    '.next/cache',
    'cache',
    '.phpunit.cache',
    '__pycache__'
}

EXCLUDE_FILES = {
    ZIP_FILENAME,
    '.env.local',
    '.DS_Store',
    'npm-debug.log',
    'yarn-error.log',
    'drawing_texts.txt'
}

def should_exclude(rel_path):
    parts = rel_path.replace('\\', '/').split('/')
    for part in parts:
        if part in EXCLUDE_DIRS:
            return True
    filename = os.path.basename(rel_path)
    if filename in EXCLUDE_FILES or filename.endswith('.log') or filename.endswith('.tmp') or filename.startswith('~$'):
        return True
    return False

def create_package():
    print("=" * 70)
    print("SIM-BENIH HORTI: PEMBUAT ARSIP DEPLOYMENT VPS")
    print("KEMENTERIAN PERTANIAN REPUBLIK INDONESIA")
    print("=" * 70)
    print(f"Direktori Proyek: {PROJECT_ROOT}")
    print(f"Target Berkas:    {ZIP_OUTPUT_PATH}\n")

    start_time = time.time()
    file_count = 0

    with zipfile.ZipFile(ZIP_OUTPUT_PATH, 'w', zipfile.ZIP_DEFLATED, compresslevel=6) as zipf:
        for root, dirs, files in os.walk(PROJECT_ROOT):
            # Modify dirs in-place to avoid descending into excluded directories
            dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS and not d.startswith('.')]

            for file in files:
                abs_path = os.path.join(root, file)
                rel_path = os.path.relpath(abs_path, PROJECT_ROOT)

                if should_exclude(rel_path):
                    continue

                zipf.write(abs_path, rel_path)
                file_count += 1
                if file_count % 50 == 0:
                    print(f"  Memproses {file_count} berkas...")

    elapsed = time.time() - start_time
    size_mb = os.path.getsize(ZIP_OUTPUT_PATH) / (1024 * 1024)

    print("\n" + "=" * 70)
    print(f"BERHASIL DIPAKETKAN!")
    print(f"Total Berkas:   {file_count} file")
    print(f"Ukuran Arsip:   {size_mb:.2f} MB")
    print(f"Waktu Proses:   {elapsed:.1f} detik")
    print(f"Lokasi Berkas:  {ZIP_OUTPUT_PATH}")
    print("=" * 70)
    print("\nPERINTAH EKSEKUSI 1 BARIS DI TERMINAL SSH VPS (UBUNTU / DEBIAN):")
    print("-" * 70)
    cmd = (
        'unzip -o simbenih_kementan_deploy.zip -d /var/www/simbenih && '
        'cd /var/www/simbenih/backend && composer install --no-dev --optimize-autoloader && '
        'php artisan config:clear && php artisan migrate --force && php artisan db:seed --force && '
        'php artisan storage:link && chmod -R 775 storage bootstrap/cache && '
        'chown -R www-data:www-data /var/www/simbenih && cd ../frontend && '
        'npm install --omit=dev && pm2 restart simbenih-frontend || '
        'pm2 start npm --name "simbenih-frontend" -- start -- -p 3001 && '
        'sudo systemctl reload nginx && echo "=== DEPLOYMENT BERHASIL: SIM-BENIH KEMENTAN TELAH AKTIF ==="'
    )
    print(cmd)
    print("-" * 70 + "\n")

if __name__ == '__main__':
    create_package()
