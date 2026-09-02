import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const raw = await prisma.sekolah.findUnique({
      where: { id },
      include: {
        daftarSiswa: {
          select: {
            id: true,
            namaLengkap: true,
            email: true,
            nis: true,
            kelas: true,
            verificationStatus: true,
            createdAt: true,
          },
        },
      },
    });

    if (!raw) {
      return NextResponse.json({ error: 'Sekolah tidak ditemukan' }, { status: 404 });
    }

    
    const { password: _, ...data } = raw;

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

    const updateData: Record<string, unknown> = {};

    if (body.namaSekolah !== undefined) updateData.namaSekolah = body.namaSekolah;
    if (body.namaPenanggungJawab !== undefined) updateData.namaPenanggungJawab = body.namaPenanggungJawab;
    if (body.alamatLengkap !== undefined) updateData.alamatLengkap = body.alamatLengkap;
    if (body.kontakSekolah !== undefined) updateData.kontakSekolah = body.kontakSekolah;

    if (body.emailResmi !== undefined) {
      const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!EMAIL_REGEX.test(body.emailResmi)) {
        return NextResponse.json({ error: 'Format email tidak valid' }, { status: 400 });
      }
      updateData.emailResmi = body.emailResmi;
    }

    if (body.password !== undefined) {
      if (typeof body.password !== 'string' || body.password.length < 8) {
        return NextResponse.json({ error: 'Kata sandi minimal 8 karakter' }, { status: 400 });
      }
      updateData.password = await bcrypt.hash(body.password, 10);
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'Tidak ada field yang diperbarui' }, { status: 400 });
    }

    const raw = await prisma.sekolah.update({
      where: { id },
      data: updateData,
    });

    
    const { password: _, ...data } = raw;

    return NextResponse.json({ data });
  } catch (error) {
    console.error('PUT /api/sekolah/[id] error:', error);
    if (error instanceof Object && 'code' in error && error.code === 'P2002') {
      return NextResponse.json({ error: 'Email sudah digunakan' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Gagal memperbarui sekolah' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    const updateData: Record<string, unknown> = {}

    if (body.verificationStatus !== undefined) {
      updateData.verificationStatus = body.verificationStatus
    }
    if (body.officialNama !== undefined) {
      updateData.officialNama = body.officialNama
    }
    if (body.akreditasi !== undefined) {
      updateData.akreditasi = body.akreditasi
    }
    if (body.lastVerifiedAt !== undefined) {
      updateData.lastVerifiedAt = new Date()
    }

    const raw = await prisma.sekolah.update({
      where: { id },
      data: updateData
    })

    
    const { password: _, ...data } = raw

    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ error: 'Gagal memperbarui verifikasi sekolah' }, { status: 500 })
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
