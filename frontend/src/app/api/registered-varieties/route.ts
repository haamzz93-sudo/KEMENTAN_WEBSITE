import { NextRequest, NextResponse } from 'next/server';
import varietasData from '@/data/varietas_terdaftar.json';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = (searchParams.get('search') || '').toLowerCase().trim();
    const kategori = searchParams.get('kategori') || 'Semua';
    const komoditas = searchParams.get('komoditas') || 'Semua';
    const tahun = searchParams.get('tahun') || 'Semua';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(5, parseInt(searchParams.get('limit') || '20', 10)));

    let filtered = varietasData as any[];

    if (search) {
      filtered = filtered.filter((item) => {
        const text = `${item.nama_varietas} ${item.no_sk} ${item.produsen} ${item.komoditas}`.toLowerCase();
        return text.includes(search);
      });
    }

    if (kategori && kategori !== 'Semua') {
      filtered = filtered.filter((item) => item.kategori.toLowerCase().includes(kategori.toLowerCase()));
    }

    if (komoditas && komoditas !== 'Semua') {
      filtered = filtered.filter((item) => item.komoditas === komoditas);
    }

    if (tahun && tahun !== 'Semua') {
      filtered = filtered.filter((item) => String(item.tahun_daftar) === String(tahun));
    }

    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const sliced = filtered.slice(offset, offset + limit);

    return NextResponse.json({
      status: 'success',
      total,
      current_page: page,
      last_page: totalPages,
      per_page: limit,
      summary: {
        total_all: 4009,
        sayuran: 2504,
        buah: 1105,
        flori: 360,
        obat: 40,
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
