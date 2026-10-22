<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations for SIM-BENIH HORTI (Kementerian Pertanian RI).
     */
    public function up(): void
    {
        // 1. Master Wilayah Indonesia (38 Provinsi)
        Schema::create('provinces', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('bpsb_office_name')->nullable();
            $table->timestamps();
        });

        // 2. Modul A: Produsen & Pengedar Benih Hortikultura (BPSB)
        Schema::create('seed_producers_distributors', function (Blueprint $table) {
            $table->id();
            $table->string('reg_number')->unique();
            $table->string('business_name');
            $table->string('owner_name');
            $table->enum('role_type', ['produsen', 'pengedar']);
            $table->string('competency_cert_number');
            $table->date('cert_expiry_date');
            $table->string('province');
            $table->string('regency');
            $table->text('address');
            $table->string('phone');
            $table->string('commodity');
            $table->string('variety')->nullable();
            $table->decimal('land_area_ha', 8, 2)->default(0);
            $table->unsignedBigInteger('annual_capacity')->default(0);
            $table->string('unit', 20)->default('kg');
            $table->enum('application_type', ['baru', 'perpanjangan'])->default('baru');
            $table->enum('status', ['aktif', 'perlu_perpanjangan', 'diverifikasi'])->default('aktif');
            $table->timestamps();
        });

        // 3. Modul B: Neraca Data Produksi Benih Bulanan (BPSB & LSSM)
        Schema::create('seed_monthly_productions', function (Blueprint $table) {
            $table->id();
            $table->string('reporting_month', 7); // YYYY-MM
            $table->enum('reporting_entity', ['BPSB', 'LSSM']);
            $table->string('province');
            $table->string('regency');
            $table->enum('category', ['sayuran', 'buah', 'hias', 'obat']);
            $table->string('commodity');
            $table->string('variety')->nullable();
            $table->enum('seed_class', ['BS', 'BD', 'BP', 'BR']);
            $table->string('unit', 20)->default('kg');
            $table->unsignedBigInteger('previous_stock')->default(0);
            $table->unsignedBigInteger('current_production')->default(0);
            $table->unsignedBigInteger('distribution')->default(0);
            $table->bigInteger('remaining_stock')->default(0); // (previous + current) - distribution
            $table->timestamps();

            $table->index(['reporting_month', 'category']);
        });

        // 4. Modul C: Pendaftaran Varietas Tanaman Hortikultura (Permentan 24/2025)
        Schema::create('variety_applications', function (Blueprint $table) {
            $table->id();
            $table->string('tracking_code')->unique();
            $table->string('applicant_name');
            $table->enum('institution_type', ['swasta', 'pemerintah', 'perseorangan'])->default('swasta');
            $table->enum('crop_type', ['sayuran', 'buah', 'hias', 'obat']);
            $table->string('commodity_name');
            $table->string('proposed_variety_name');
            $table->text('lineage')->nullable();
            $table->date('submission_date');
            
            // Tahapan Layanan Permentan 24/2025
            $table->enum('current_stage', [
                'layanan_1_rencana_uji',
                'layanan_2_permohonan_sidang',
                'layanan_3_masa_sanggah',
                'layanan_4_selesai_terdaftar'
            ])->default('layanan_1_rencana_uji');

            // Layanan 1
            $table->string('test_notice_letter_no')->nullable();
            $table->enum('test_notice_status', ['menunggu_verifikasi', 'disetujui', 'perlu_perbaikan'])->default('menunggu_verifikasi');
            $table->string('test_response_letter_no')->nullable();
            $table->date('test_response_date')->nullable();

            // Layanan 2
            $table->date('tp2vh_session_date')->nullable();
            $table->enum('tp2vh_session_status', ['belum_sidang', 'lolos_disetujui', 'perbaikan_dokumen', 'tunda_bahas'])->default('belum_sidang');
            $table->text('tp2vh_notes')->nullable();

            // Layanan 3
            $table->date('objection_start_date')->nullable();
            $table->date('objection_end_date')->nullable();
            $table->integer('objection_days_left')->nullable();
            $table->integer('total_objections_count')->default(0);
            $table->string('recommendation_letter_no')->nullable();

            // Layanan 4
            $table->string('registration_number')->nullable(); // PPVTPP / OSS
            $table->string('status_text');
            $table->timestamps();
        });

        // 5. Audit Log Transaksi & Akuntabilitas Inspektorat
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->string('action');
            $table->string('module');
            $table->string('performed_by');
            $table->ipAddress('ip_address')->nullable();
            $table->json('details')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('variety_applications');
        Schema::dropIfExists('seed_monthly_productions');
        Schema::dropIfExists('seed_producers_distributors');
        Schema::dropIfExists('provinces');
    }
};
