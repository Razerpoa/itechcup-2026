import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { VerificationStatus } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const sekolahId = request.nextUrl.searchParams.get('sekolahId');
    const status = request.nextUrl.searchParams.get('status') as VerificationStatus | null;

    const where: Record<string, unknown> = {};
    if (sekolahId) where.sekolahId = sekolahId;
    if (status && Object.values(VerificationStatus).includes(status)) where.verificationStatus = status;

    const data = await prisma.siswa.findMany({
      where,
      include: { sekolah: { select: { id: true, namaSekolah: true, npsn: true } } },
    });

    return NextResponse.json({ data });
  } catch (error) {
    console.error('GET /api/siswa error:', error);
    return NextResponse.json({ error: 'Gagal mengambil data siswa' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const required = ['namaLengkap', 'nis', 'kelas', 'sekolahId'];
    const missing = required.filter((f) => !body[f]);
    if (missing.length > 0) {
      return NextResponse.json({ error: `Field wajib tidak ada: ${missing.join(', ')}` }, { status: 400 });
    }

    const sekolah = await prisma.sekolah.findUnique({ where: { id: body.sekolahId } });
    if (!sekolah) {
      return NextResponse.json({ error: 'Sekolah tidak ditemukan' }, { status: 404 });
    }

    const data = await prisma.siswa.create({
      data: {
        namaLengkap: body.namaLengkap,
        nis: body.nis,
        kelas: body.kelas,
        sekolahId: body.sekolahId,
      },
      include: { sekolah: true },
    });

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error('POST /api/siswa error:', error);
    if (error instanceof Object && 'code' in error && error.code === 'P2002') {
      return NextResponse.json({ error: 'NIS sudah terdaftar' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Gagal membuat siswa' }, { status: 500 });
  }
}
