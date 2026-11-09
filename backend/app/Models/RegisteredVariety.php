<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RegisteredVariety extends Model
{
    use HasFactory;

    protected $table = 'registered_varieties';

    protected $fillable = [
        'external_id',
        'nama_varietas',
        'komoditas',
        'kategori',
        'produsen',
        'no_sk',
        'tahun_daftar',
        'no_reg',
        'upload_deskripsi',
        'upload_produk',
        'wil_adaptasi',
        'tahan_opt',
    ];
}
