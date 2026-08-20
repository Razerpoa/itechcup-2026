import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await prisma.sekolah.findUnique({
      where: { id },
      include: { daftarSiswa: true },
    });

    if (!data) {
      return NextResponse.json({ error: 'Sekolah tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('GET /api/sekolah/[id] error:', error);
    return NextResponse.json({ error: 'Gagal mengambil data sekolah' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.sekolah.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Sekolah tidak ditemukan' }, { status: 404 });
    }

    const data = await prisma.sekolah.update({
      where: { id },
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

    return NextResponse.json({ data });
  } catch (error) {
    console.error('PUT /api/sekolah/[id] error:', error);
    if (error instanceof Object && 'code' in error && error.code === 'P2002') {
      return NextResponse.json({ error: 'NPSN atau email sudah digunakan' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Gagal memperbarui sekolah' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const existing = await prisma.sekolah.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Sekolah tidak ditemukan' }, { status: 404 });
    }

    await prisma.sekolah.delete({ where: { id } });
    return NextResponse.json({ data: { id } });
  } catch (error) {
    console.error('DELETE /api/sekolah/[id] error:', error);
    return NextResponse.json({ error: 'Gagal menghapus sekolah' }, { status: 500 });
  }
}
