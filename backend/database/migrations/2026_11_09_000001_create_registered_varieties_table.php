<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations for PROSEED Registered Varieties.
     */
    public function up(): void
    {
        if (!Schema::hasTable('registered_varieties')) {
            Schema::create('registered_varieties', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('external_id')->nullable();
                $table->string('nama_varietas')->index();
                $table->string('komoditas')->nullable()->index();
                $table->string('kategori', 100)->nullable()->index();
                $table->string('produsen')->nullable()->index();
                $table->string('no_sk')->nullable()->index();
                $table->string('tahun_daftar', 50)->nullable()->index();
                $table->string('no_reg')->nullable();
                $table->text('upload_deskripsi')->nullable();
                $table->text('upload_produk')->nullable();
                $table->text('wil_adaptasi')->nullable();
                $table->text('tahan_opt')->nullable();
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('registered_varieties');
    }
};
