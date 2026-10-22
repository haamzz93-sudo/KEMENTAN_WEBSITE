import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { status: 'error', message: 'Tidak ada file yang diunggah.' },
        { status: 400 }
      );
    }

    // Check mime type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { status: 'error', message: 'File harus berupa format gambar (JPG, PNG, WebP).' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Sanitize filename
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${Date.now()}_${sanitizedName}`;

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filePath = path.join(uploadsDir, filename);
    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/${filename}`;

    return NextResponse.json({
      status: 'success',
      message: 'Foto banner berhasil diunggah ke sistem penyimpanan web kementerian.',
      url: publicUrl,
      filename: filename,
    });
  } catch (err: any) {
    return NextResponse.json(
      { status: 'error', message: err.message || 'Gagal mengunggah foto.' },
      { status: 500 }
    );
  }
}
