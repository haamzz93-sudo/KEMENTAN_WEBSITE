import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const authHeader = req.headers.get('authorization') || '';

    // Forward request to backend PHP server
    let backendRes = null;
    try {
      const backendUrl = process.env.BACKEND_INTERNAL_URL || 'http://127.0.0.1:8000';
      backendRes = await fetch(`${backendUrl}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader
        },
        body: JSON.stringify(body)
      });
    } catch (e) {
      console.warn('Backend logout forward error:', e);
    }

    const data = backendRes ? await backendRes.json().catch(() => null) : null;

    const response = NextResponse.json({
      status: 'success',
      message: data?.message || 'Sesi autentikasi berhasil diakhiri secara aman.',
      timestamp: new Date().toISOString()
    });

    // Clear authentication cookies if any
    response.cookies.delete('sim_benih_token');
    response.cookies.delete('sim_benih_session');
    response.cookies.delete('kementan_token');

    return response;
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: 'Terjadi kesalahan saat mengakhiri sesi autentikasi.'
    }, { status: 500 });
  }
}
