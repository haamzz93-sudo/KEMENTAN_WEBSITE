import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Helper to get fresh data from disk
function getVarietasData(): any[] {
  try {
    const filePath = path.join(process.cwd(), 'src', 'data', 'varietas_terdaftar.json');
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading varietas JSON:', err);
  }
  return [];
}

// Helper to save data to disk
function saveVarietasData(data: any[]): boolean {
  try {
    const filePath = path.join(process.cwd(), 'src', 'data', 'varietas_terdaftar.json');
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error saving varietas JSON:', err);
    return false;
  }
}

// 1. GET (Read with Search, Filter & Pagination)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = (searchParams.get('search') || '').toLowerCase().trim();
    const kategori = searchParams.get('kategori') || 'Semua';
    const komoditas = searchParams.get('komoditas') || 'Semua';
    const tahun = searchParams.get('tahun') || 'Semua';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));

    let allData = getVarietasData();

    let filtered = allData;

    if (search) {
      filtered = filtered.filter((item) => {
        const text = `${item.nama_varietas || ''} ${item.no_sk || ''} ${item.produsen || ''} ${item.komoditas || ''} ${item.no_reg || ''} ${item.sk_pendaftaran || ''} ${item.upload_deskripsi || ''} ${item.sk_deskripsi || ''}`.toLowerCase();
        return text.includes(search);
      });
    }

    if (kategori && kategori !== 'Semua') {
      const katLower = kategori.toLowerCase();
      filtered = filtered.filter((item) => {
        const itemKat = (item.kategori || '').toLowerCase();
        if (katLower === 'tanaman sayuran' || katLower === 'sayuran') return itemKat.includes('sayur');
        if (katLower === 'tanaman buah' || katLower === 'buah') return itemKat.includes('buah');
        if (katLower === 'tanaman florikultura' || katLower === 'flori' || katLower === 'hias') return itemKat.includes('flori') || itemKat.includes('hias');
        if (katLower === 'tanaman obat' || katLower === 'obat' || katLower === 'biofarmaka') return itemKat.includes('obat') || itemKat.includes('biofarmaka');
        return itemKat.includes(katLower);
      });
    }

    if (komoditas && komoditas !== 'Semua') {
      filtered = filtered.filter((item) => (item.komoditas || '').toLowerCase().includes(komoditas.toLowerCase()));
    }

    if (tahun && tahun !== 'Semua') {
      filtered = filtered.filter((item) => String(item.tahun_daftar) === String(tahun));
    }

    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const sliced = filtered.slice(offset, offset + limit);

    // Calculate dynamic stats
    let sayuran = 0;
    let buah = 0;
    let flori = 0;
    let obat = 0;
    allData.forEach((v) => {
      const kat = (v.kategori || '').toLowerCase();
      if (kat.includes('sayur')) sayuran++;
      else if (kat.includes('buah')) buah++;
      else if (kat.includes('flori') || kat.includes('hias')) flori++;
      else if (kat.includes('obat') || kat.includes('biofarmaka')) obat++;
    });

    return NextResponse.json({
      status: 'success',
      total,
      current_page: page,
      last_page: totalPages,
      per_page: limit,
      summary: {
        total_all: allData.length,
        sayuran,
        buah,
        flori,
        obat,
      },
      data: sliced,
    });
  } catch (err: any) {
    return NextResponse.json(
      { status: 'error', message: err.message || 'Internal error' },
      { status: 500 }
    );
  }
}

// 2. POST (Create new registered variety)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      nama_varietas, 
      komoditas, 
      kategori, 
      produsen, 
      no_sk, 
      tahun_daftar, 
      no_reg, 
      sk_pendaftaran,
      upload_deskripsi,
      sk_deskripsi,
      wil_adaptasi, 
      tahan_opt 
    } = body;

    if (!nama_varietas || !no_sk) {
      return NextResponse.json(
        { status: 'error', message: 'Nama varietas dan Nomor SK Menteri Pertanian wajib diisi!' },
        { status: 400 }
      );
    }

    const allData = getVarietasData();
    const newId = allData.length > 0 ? Math.max(...allData.map(v => Number(v.id) || 0)) + 1 : 1;

    const finalNoReg = (sk_pendaftaran || no_reg || '').trim();
    const finalDeskripsi = (sk_deskripsi || upload_deskripsi || '').trim();

    const newItem = {
      id: newId,
      nama_varietas: nama_varietas.trim(),
      komoditas: komoditas ? komoditas.trim() : '-',
      kategori: kategori || 'Tanaman Sayuran',
      produsen: produsen ? produsen.trim() : '-',
      no_sk: no_sk.trim(),
      tahun_daftar: tahun_daftar ? String(tahun_daftar).trim() : new Date().getFullYear().toString(),
      no_reg: finalNoReg || '-',
      upload_deskripsi: finalDeskripsi || '',
      upload_produk: '',
      wil_adaptasi: wil_adaptasi ? wil_adaptasi.trim() : '',
      tahan_opt: tahan_opt ? tahan_opt.trim() : '',
    };

    // Prepend to array so newly created items appear at the very top (page 1)
    allData.unshift(newItem);
    saveVarietasData(allData);

    return NextResponse.json({
      status: 'success',
      message: 'Data varietas terdaftar berhasil ditambahkan ke database nasional PROSEED.',
      data: newItem,
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { status: 'error', message: err.message || 'Gagal menyimpan data varietas' },
      { status: 500 }
    );
  }
}

// 3. PUT (Update existing registered variety)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      id, 
      nama_varietas, 
      komoditas, 
      kategori, 
      produsen, 
      no_sk, 
      tahun_daftar, 
      no_reg, 
      sk_pendaftaran,
      upload_deskripsi,
      sk_deskripsi,
      wil_adaptasi, 
      tahan_opt 
    } = body;

    if (!id || !nama_varietas || !no_sk) {
      return NextResponse.json(
        { status: 'error', message: 'ID, Nama varietas, dan Nomor SK Pelepasan wajib diisi!' },
        { status: 400 }
      );
    }

    const allData = getVarietasData();
    const index = allData.findIndex(v => Number(v.id) === Number(id));

    if (index === -1) {
      return NextResponse.json(
        { status: 'error', message: `Data varietas dengan ID ${id} tidak ditemukan!` },
        { status: 404 }
      );
    }

    const finalNoReg = sk_pendaftaran !== undefined ? sk_pendaftaran.trim() : (no_reg !== undefined ? no_reg.trim() : allData[index].no_reg);
    const finalDeskripsi = sk_deskripsi !== undefined ? sk_deskripsi.trim() : (upload_deskripsi !== undefined ? upload_deskripsi.trim() : allData[index].upload_deskripsi);

    allData[index] = {
      ...allData[index],
      nama_varietas: nama_varietas.trim(),
      komoditas: komoditas ? komoditas.trim() : allData[index].komoditas,
      kategori: kategori || allData[index].kategori,
      produsen: produsen ? produsen.trim() : allData[index].produsen,
      no_sk: no_sk.trim(),
      tahun_daftar: tahun_daftar ? String(tahun_daftar).trim() : allData[index].tahun_daftar,
      no_reg: finalNoReg || '-',
      upload_deskripsi: finalDeskripsi || '',
      wil_adaptasi: wil_adaptasi !== undefined ? wil_adaptasi.trim() : allData[index].wil_adaptasi,
      tahan_opt: tahan_opt !== undefined ? tahan_opt.trim() : allData[index].tahan_opt,
    };

    saveVarietasData(allData);

    return NextResponse.json({
      status: 'success',
      message: 'Data varietas terdaftar berhasil diperbarui.',
      data: allData[index],
    });
  } catch (err: any) {
    return NextResponse.json(
      { status: 'error', message: err.message || 'Gagal memperbarui data varietas' },
      { status: 500 }
    );
  }
}

// 4. DELETE (Delete registered variety)
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { status: 'error', message: 'Parameter ID varietas wajib disertakan!' },
        { status: 400 }
      );
    }

    const allData = getVarietasData();
    const index = allData.findIndex(v => Number(v.id) === Number(id));

    if (index === -1) {
      return NextResponse.json(
        { status: 'error', message: `Data varietas dengan ID ${id} tidak ditemukan!` },
        { status: 404 }
      );
    }

    const removed = allData.splice(index, 1)[0];
    saveVarietasData(allData);

    return NextResponse.json({
      status: 'success',
      message: `Varietas "${removed.nama_varietas}" (No. SK: ${removed.no_sk}) berhasil dihapus dari arsip database.`,
      data: removed,
    });
  } catch (err: any) {
    return NextResponse.json(
      { status: 'error', message: err.message || 'Gagal menghapus data varietas' },
      { status: 500 }
    );
  }
}
