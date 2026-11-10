import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

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

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = (searchParams.get('search') || '').toLowerCase().trim();
    const cropType = searchParams.get('crop_type') || searchParams.get('kategori') || 'semua';
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '30', 10)));
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));

    let allData = getVarietasData();

    let filtered = allData;

    if (cropType && cropType !== 'semua') {
      const c = cropType.toLowerCase();
      filtered = filtered.filter((v) => {
        const kat = (v.kategori || '').toLowerCase();
        if (c === 'sayuran') return kat.includes('sayur');
        if (c === 'buah') return kat.includes('buah');
        if (c === 'hias' || c === 'florikultura') return kat.includes('flori') || kat.includes('hias');
        if (c === 'obat' || c === 'biofarmaka') return kat.includes('obat') || kat.includes('biofarmaka');
        return kat.includes(c);
      });
    }

    if (search) {
      filtered = filtered.filter((v) => {
        const text = `${v.nama_varietas || ''} ${v.komoditas || ''} ${v.produsen || ''} ${v.no_sk || ''} ${v.no_reg || ''}`.toLowerCase();
        return text.includes(search);
      });
    }

    const total = filtered.length;
    const offset = (page - 1) * limit;
    const sliced = filtered.slice(offset, offset + limit);

    // Map to VarietyApplication schema
    const data = sliced.map((v) => {
      let ct = 'sayuran';
      const kat = (v.kategori || '').toLowerCase();
      if (kat.includes('buah')) ct = 'buah';
      else if (kat.includes('flori') || kat.includes('hias')) ct = 'hias';
      else if (kat.includes('obat') || kat.includes('biofarmaka')) ct = 'obat';

      return {
        id: v.id,
        tracking_code: v.no_reg && v.no_reg !== '-' ? v.no_reg : `SK-${v.id}`,
        applicant_name: v.produsen || '-',
        institution_type: 'swasta',
        crop_type: ct,
        commodity_name: v.komoditas || '-',
        proposed_variety_name: v.nama_varietas || '-',
        lineage: v.wil_adaptasi || 'Varietas Resmi Terdaftar PROSEED',
        submission_date: v.tahun_daftar || '2026',
        current_stage: 'layanan_4_selesai_terdaftar',
        registration_number: v.no_sk || '-',
        no_reg: v.no_reg || '-',
        upload_deskripsi: v.upload_deskripsi || '',
        status_text: 'Resmi Ber-SK Mentan',
      };
    });

    return NextResponse.json({
      status: 'success',
      total,
      total_all: allData.length,
      current_page: page,
      per_page: limit,
      data,
    });
  } catch (err: any) {
    return NextResponse.json({ status: 'error', message: err.message }, { status: 500 });
  }
}
