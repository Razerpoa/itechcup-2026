'use client'

import React, { useRef } from 'react'
import Image from 'next/image'
import { Printer, X, CheckCircle2, ShieldCheck, Download, Award, FileText, ExternalLink } from 'lucide-react'
import { formatRupiah, formatDate } from '@/lib/utils'

interface InvoiceModalProps {
  isOpen: boolean
  onClose: () => void
  type: 'invoice' | 'certificate'
  akad: {
    id: string
    proyekId: string
    judulProyek: string
    namaUsaha: string
    namaPelajar: string
    sekolahNama?: string
    nominalTotal: number
    nominalDP: number
    step: number
    rating?: number
    ulasan?: string
    createdAt: string
    completedAt?: string
  }
}

export default function InvoiceModal({ isOpen, onClose, type, akad }: InvoiceModalProps) {
  const printRef = useRef<HTMLDivElement>(null)

  if (!isOpen) return null

  const handlePrint = () => {
    window.print()
  }

  const invoiceNo = `INV-MM-${akad.id.replace(/\D/g, '').slice(-4) || '2026'}-${new Date(akad.createdAt).getFullYear()}`
  const certNo = `CERT-MM-${akad.id.replace(/\D/g, '').slice(-4) || '8892'}-VOKASI`

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white print:static">
      {/* Container */}
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-gray-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150 print:border-none print:shadow-none print:max-w-none print:w-full print:rounded-none">
        {/* Modal Action Bar (Hidden on Print) */}
        <div className="p-4 bg-[#FAF8F5] border-b border-gray-200 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            {type === 'invoice' ? (
              <FileText className="w-5 h-5 text-[#964825]" />
            ) : (
              <Award className="w-5 h-5 text-amber-600" />
            )}
            <span className="font-extrabold text-sm text-gray-900">
              {type === 'invoice' ? 'Invoice & Kwitansi Pembayaran Resmi' : 'Surat Keterangan Pengalaman Kerja'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-[#FF9B71] hover:bg-[#F5865A] text-white rounded-full text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / Simpan PDF</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Area */}
        <div ref={printRef} className="p-6 sm:p-10 font-sans text-gray-900 bg-white">
          {type === 'invoice' ? (
            /* INVOICE CONTENT */
            <div className="space-y-6">
              {/* Document Header */}
              <div className="flex items-start justify-between border-b-2 border-[#FF9B71] pb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-[#FF9B71]">
                    <Image src="/logo.jpg" alt="Mitra Muda" width={48} height={48} className="w-full h-full object-cover" unoptimized />
                  </div>
                  <div>
                    <h1 className="text-xl font-black text-gray-900 tracking-tight leading-tight">
                      MITRA <span className="text-[#FF9B71]">MUDA</span>
                    </h1>
                    <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">
                      Platform Pemberdayaan Talenta Pelajar Indonesia
                    </p>
                    <p className="text-[10px] text-gray-400">www.mitramuda.biz.id</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-300 px-3 py-1 rounded-full uppercase tracking-wider">
                    {akad.step === 4 ? 'LUNAS / SELESAI' : 'AKAD BERJALAN'}
                  </span>
                  <p className="text-xs font-bold text-gray-900 mt-2">{invoiceNo}</p>
                  <p className="text-[11px] text-gray-500">Tanggal: {formatDate(akad.createdAt)}</p>
                </div>
              </div>

              {/* Parties Information */}
              <div className="grid grid-cols-2 gap-4 text-xs bg-[#FAF8F5] p-4 rounded-2xl border border-gray-100">
                <div>
                  <span className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Diterbitkan Untuk (Klien):</span>
                  <p className="font-extrabold text-gray-900 text-sm">{akad.namaUsaha}</p>
                  <p className="text-gray-600 mt-0.5">Mitra Klien UMKM Terdaftar</p>
                  <p className="text-gray-500 text-[11px] mt-0.5">Sistem Pembayaran: Escrow Rekening Bersama</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Penyedia Jasa (Talenta Siswa):</span>
                  <p className="font-extrabold text-gray-900 text-sm">{akad.namaPelajar}</p>
                  <p className="text-gray-600 mt-0.5">{akad.sekolahNama || 'Talenta Vokasi Pelajar'}</p>
                  <p className="text-emerald-700 font-semibold text-[11px] mt-0.5 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span>Terverifikasi Sekolah</span>
                  </p>
                </div>
              </div>

              {/* Table of Services */}
              <div className="border border-gray-200 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FFF7F3] border-b border-gray-200 text-gray-700 font-bold">
                    <tr>
                      <th className="p-3">Deskripsi Pekerjaan / Layanan Proyek</th>
                      <th className="p-3 text-right">Nominal Disepakati</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-800">
                    <tr>
                      <td className="p-3.5">
                        <p className="font-bold text-gray-900 text-xs">{akad.judulProyek}</p>
                        <p className="text-[11px] text-gray-500 mt-0.5">
                          Pengerjaan proyek berbasis kesepakatan akad industri antara Klien UMKM dan Pelajar.
                        </p>
                      </td>
                      <td className="p-3.5 text-right font-extrabold text-gray-900">
                        {formatRupiah(akad.nominalTotal)}
                      </td>
                    </tr>
                    <tr className="bg-gray-50/60 text-gray-600">
                      <td className="p-2.5 pl-3 text-[11px]">
                        Uang Muka (DP) Tersimpan di Rekening Bersama (Escrow)
                      </td>
                      <td className="p-2.5 text-right font-semibold text-emerald-700 text-[11px]">
                        {formatRupiah(akad.nominalDP)} (Tercatat)
                      </td>
                    </tr>
                    <tr className="bg-gray-50/60 text-gray-600">
                      <td className="p-2.5 pl-3 text-[11px]">
                        Biaya Layanan Platform Mitra Muda
                      </td>
                      <td className="p-2.5 text-right font-semibold text-gray-500 text-[11px]">
                        Rp 0 (Gratis / 0% Komisi)
                      </td>
                    </tr>
                  </tbody>
                  <tfoot className="bg-[#FAF8F5] border-t-2 border-gray-200">
                    <tr>
                      <th className="p-3 text-sm font-black text-gray-900">TOTAL PEMBAYARAN AKAD</th>
                      <th className="p-3 text-right text-base font-black text-[#964825]">
                        {formatRupiah(akad.nominalTotal)}
                      </th>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Guarantee & Verification Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-dashed border-gray-200">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Validasi Digital</span>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Dokumen Sah Diterbitkan oleh Sistem Mitra Muda</span>
                  </div>
                  <p className="text-[10px] text-gray-400">
                    ID Transaksi: {akad.id} • Dicetak: {new Date().toLocaleString('id-ID')}
                  </p>
                </div>

                <div className="text-right">
                  <div className="w-20 h-20 border-2 border-gray-200 rounded-xl bg-white p-1 ml-auto flex flex-col items-center justify-center text-center">
                    <div className="text-[8px] font-black text-[#FF9B71] uppercase tracking-tighter">MITRA MUDA</div>
                    <div className="text-[7px] text-gray-400 font-mono">VERIFIED</div>
                    <div className="w-10 h-10 bg-gray-100 rounded-sm my-0.5 flex items-center justify-center text-[7px] text-gray-400 font-mono">
                      [QR-CODE]
                    </div>
                  </div>
                  <span className="text-[9px] text-gray-400 mt-1 block">Scan untuk cek keabsahan</span>
                </div>
              </div>
            </div>
          ) : (
            /* CERTIFICATE OF EXPERIENCE CONTENT */
            <div className="border-4 border-double border-[#FF9B71] rounded-3xl p-6 sm:p-10 space-y-6 text-center bg-gradient-to-b from-[#FFFDFB] to-white relative">
              <div className="flex items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-[#FF9B71]">
                  <Image src="/logo.jpg" alt="Mitra Muda" width={48} height={48} className="w-full h-full object-cover" unoptimized />
                </div>
                <div className="text-left">
                  <h2 className="text-lg font-black text-gray-900 tracking-tight leading-tight">
                    MITRA <span className="text-[#FF9B71]">MUDA</span>
                  </h2>
                  <p className="text-[10px] text-gray-500 font-semibold uppercase">Platform Talenta Pelajar Indonesia</p>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-black text-[#964825] bg-[#FFF1EB] border border-[#FFD9CA] px-3.5 py-1 rounded-full uppercase tracking-widest">
                  SURAT KETERANGAN PENGALAMAN KERJA INDUSTRI
                </span>
                <p className="text-xs text-gray-400 pt-1 font-mono">{certNo}</p>
              </div>

              <p className="text-xs text-gray-600 max-w-lg mx-auto leading-relaxed">
                Manajemen Platform Mitra Muda bersama mitra dunia usaha menerangkan dengan bangga bahwa:
              </p>

              <div className="py-2">
                <h3 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight underline decoration-[#FF9B71] decoration-2 underline-offset-8">
                  {akad.namaPelajar}
                </h3>
                <p className="text-xs font-semibold text-gray-600 mt-2">
                  Asal Sekolah: <strong className="text-gray-900">{akad.sekolahNama || 'SMK / SMA Terverifikasi'}</strong>
                </p>
              </div>

              <p className="text-xs text-gray-600 max-w-lg mx-auto leading-relaxed">
                Telah berhasil menyelesaikan penugasan karya proyek industri riil dengan dedikasi dan kualitas kerja memuaskan pada proyek:
              </p>

              <div className="bg-[#FAF8F5] border border-[#FFD9CA] p-4 rounded-2xl max-w-md mx-auto">
                <p className="font-extrabold text-sm text-gray-900">{akad.judulProyek}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Klien Mitra: <strong className="text-[#964825]">{akad.namaUsaha}</strong>
                </p>
                {akad.rating && (
                  <div className="flex items-center justify-center gap-1 mt-2 text-amber-500 font-bold text-xs">
                    <span>★ {akad.rating}.0 / 5.0</span>
                    <span className="text-gray-400 font-normal">({akad.ulasan || 'Pekerjaan memuaskan'})</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-6 pt-6 border-t border-gray-200 text-xs">
                <div className="text-center">
                  <p className="text-[11px] text-gray-400 mb-6">Diverifikasi Pihak Klien,</p>
                  <p className="font-extrabold text-gray-900">{akad.namaUsaha}</p>
                  <p className="text-[10px] text-gray-500">Pemberi Kerja / Klien UMKM</p>
                </div>
                <div className="text-center">
                  <p className="text-[11px] text-gray-400 mb-6">Diterbitkan Resmi,</p>
                  <p className="font-extrabold text-[#964825]">Platform Mitra Muda</p>
                  <p className="text-[10px] text-emerald-700 font-semibold">Tervalidasi Digital</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
