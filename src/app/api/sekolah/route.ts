import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const search = request.nextUrl.searchParams.get('search');

    const where = search
      ? {
          OR: [
            { namaSekolah: { contains: search, mode: 'insensitive' as const } },
            { npsn: { contains: search, mode: 'insensitive' as const } },
            { emailResmi: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const data = await prisma.sekolah.findMany({ where });
    return NextResponse.json({ data });
  } catch (error) {
    console.error('GET /api/sekolah error:', error);
    return NextResponse.json({ error: 'Gagal mengambil data sekolah' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const required = ['namaSekolah', 'npsn', 'emailResmi', 'password', 'namaPenanggungJawab', 'alamatLengkap', 'kontakSekolah'];
    const missing = required.filter((f) => !body[f]);
    if (missing.length > 0) {
      return NextResponse.json({ error: `Field wajib tidak ada: ${missing.join(', ')}` }, { status: 400 });
    }

    const data = await prisma.sekolah.create({
      data: {
        namaSekolah: body.namaSekolah,
        npsn: body.npsn,
        emailResmi: body.emailResmi,
        password: body.password,
        namaPenanggungJawab: body.namaPenanggungJawab,
        alamatLengkap: body.alamatLengkap,
        kontakSekolah: body.kontakSekolah,
      },
    });

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error('POST /api/sekolah error:', error);
    if (error instanceof Object && 'code' in error && error.code === 'P2002') {
      return NextResponse.json({ error: 'NPSN atau email sudah terdaftar' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Gagal membuat sekolah' }, { status: 500 });
  }
}
