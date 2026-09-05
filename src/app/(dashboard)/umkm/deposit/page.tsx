'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import {
  Wallet,
  ShieldCheck,
  Clock,
  CheckCircle2,
  XCircle,
  UploadCloud,
  ArrowRight,
  Sparkles,
  Building2,
  Copy,
  Check,
  AlertCircle,
  ArrowDownLeft
} from 'lucide-react'
import { formatRupiah, formatDate, formatThousand, parseThousand, generateNoResi } from '@/lib/utils'
import { useAuthUser } from '@/lib/auth-client'
import { useEscrowStore, submitUMKMDeposit, syncEscrowWithDB } from '@/lib/escrow-store'
import PakasirPaymentModal from '@/components/pakasir-payment-modal'
import { QrCode, Zap, ExternalLink } from 'lucide-react'

export default function UMKMSaldoDepositPage() {
  const user = useAuthUser()
  const escrowState = useEscrowStore()

  useEffect(() => {
    syncEscrowWithDB()
    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return
      syncEscrowWithDB()
    }, 20000)

    const handleFocus = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        syncEscrowWithDB()
      }
    }

    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', handleFocus)

    return () => {
      clearInterval(interval)
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleFocus)
    }
  }, [])

  const umkmId = user?.id || 'umkm-default'
  const saldoAktif = escrowState.umkmBalances[umkmId] || 0

  const userDeposits = escrowState.deposits.filter((d) => d.umkmId === umkmId)
  const userEscrows = escrowState.escrows.filter((e) => e.umkmId === umkmId)

  const [paymentMode, setPaymentMode] = useState<'pakasir' | 'manual'>('pakasir')
  const [selectedNominal, setSelectedNominal] = useState<number>(1000000)
  const [customNominal, setCustomNominal] = useState<string>('')
  const [selectedBank, setSelectedBank] = useState<string>('BCA')
  const [nomorPengirim, setNomorPengirim] = useState<string>('')
  const [buktiPreview, setBuktiPreview] = useState<string | null>(null)
  const [isCopied, setIsCopied] = useState<string | null>(null)
  const [isSuccessModal, setIsSuccessModal] = useState<boolean>(false)
  const [successInfo, setSuccessInfo] = useState<{ title: string; desc: string } | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [resiManual, setResiManual] = useState<string>(() => generateNoResi('MTU'))

  const [pakasirModalData, setPakasirModalData] = useState<{
    orderId: string
    nominal: number
    qrisUrl: string
    qrisString?: string
    pakasirPaymentUrl: string
  } | null>(null)
  const [isCreatingPayment, setIsCreatingPayment] = useState(false)

  const nominalPresets = [500000, 1000000, 2500000, 5000000, 10000000]

  const bankAccounts: Record<string, { bank: string; noRek: string; atasNama: string; logoText: string }> = {
    BCA: {
      bank: 'Bank Central Asia (BCA)',
      noRek: '820-192-8819',
      atasNama: 'PT MITRA MUDA INDONESIA ESCROW',
      logoText: 'BCA'
    },
    Mandiri: {
      bank: 'Bank Mandiri',
      noRek: '132-00-9182391-2',
      atasNama: 'PT MITRA MUDA INDONESIA ESCROW',
      logoText: 'MANDIRI'
    },
    BRI: {
      bank: 'Bank Rakyat Indonesia (BRI)',
      noRek: '0129-01-002891-53-4',
      atasNama: 'PT MITRA MUDA INDONESIA ESCROW',
      logoText: 'BRI'
    }
  }

  const currentBank = bankAccounts[selectedBank] || bankAccounts.BCA

  const handleCopy = (text: string, key: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text)
      setIsCopied(key)
      setTimeout(() => setIsCopied(null), 2000)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      const reader = new FileReader()
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setBuktiPreview(reader.result)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handlePakasirPayment = async () => {
    setErrorMessage(null)
    const finalAmount = customNominal ? parseThousand(customNominal) : selectedNominal
    if (!finalAmount || finalAmount < 10000) {
      setErrorMessage('Nominal deposit minimal adalah Rp 10.000')
      return
    }

    setIsCreatingPayment(true)
    try {
      const res = await fetch('/api/payment/pakasir/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          umkmId,
          namaUsaha: user?.namaUsaha || 'UMKM Mitra Muda',
          namaPemilik: user?.nama || 'Pemilik Usaha',
          nominal: finalAmount
        })
      })

      if (!res.ok) {
        const json = await res.json()
        setErrorMessage(json?.error || 'Gagal membuat tagihan QRIS Pakasir')
        return
      }

      const json = await res.json()
      setPakasirModalData({
        orderId: json.data.orderId,
        nominal: json.data.nominal,
        qrisUrl: json.data.qrisUrl,
        qrisString: json.data.qrisString,
        pakasirPaymentUrl: json.data.pakasirPaymentUrl
      })
    } catch {
      setErrorMessage('Terjadi kesalahan jaringan saat menghubungkan ke gateway Pakasir')
    } finally {
      setIsCreatingPayment(false)
    }
  }

  const handleTopUpSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    const finalAmount = customNominal ? parseThousand(customNominal) : selectedNominal
    if (!finalAmount || finalAmount < 50000) {
      setErrorMessage('Nominal deposit minimal adalah Rp 50.000')
      return
    }

    const depositId = resiManual
    submitUMKMDeposit({
      id: depositId,
      umkmId,
      namaUsaha: user?.namaUsaha || 'UMKM Mitra Muda',
      namaPemilik: user?.nama || 'Pemilik Usaha',
      nominal: finalAmount,
      bankTujuan: `${currentBank.bank} (${currentBank.noRek})`,
      nomorPengirim: nomorPengirim || undefined,
      buktiTransferUrl: buktiPreview || undefined
    })

    setSuccessInfo({
      title: 'Konfirmasi Deposit Terkirim!',
      desc: `Bukti transfer deposit Anda dengan ID Deposit ${depositId} telah diteruskan ke Master Admin Escrow. Saldo Anda akan otomatis bertambah setelah verifikasi disetujui.`
    })
    setIsSuccessModal(true)
    setCustomNominal('')
    setNomorPengirim('')
    setBuktiPreview(null)
    setResiManual(generateNoResi('MTU'))
  }

  return (
    <div className="space-y-8 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#964825] uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4 text-[#FF9B71]" />
            <span>Sistem Pembayaran Rekening Bersama (Escrow)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Deposit & Saldo Rekber UMKM
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Isi saldo rekening bersama untuk membayar DP dan pelunasan proyek pelajar dengan aman.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-[#FF9B71] to-[#ffb598] rounded-3xl p-6 text-white relative overflow-hidden shadow-md border border-white/20 flex flex-col justify-between">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-white/90">Saldo Siap Pakai</span>
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              {formatRupiah(saldoAktif)}
            </h2>
            <p className="text-xs text-white/80 mt-1">
              Dapat langsung dipotong untuk pembayaran DP proyek baru.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-white/20 flex items-center gap-1 text-[11px] font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Saldo Terverifikasi Admin Master</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-[#EAEAEA] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Escrow Berjalan</span>
              <Clock className="w-5 h-5 text-[#964825]" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              {formatRupiah(
                userEscrows
                  .filter((e) => e.dpStatus === 'HELD_IN_ESCROW')
                  .reduce((acc, curr) => acc + curr.nominalDP, 0)
              )}
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Dana DP proyek yang sedang tertahan aman di rekening penampungan admin.
            </p>
          </div>
          <div className="mt-4 text-xs font-semibold text-[#964825] bg-[#FFF1EB] px-3 py-1.5 rounded-xl w-fit border border-[#FFD9CA]">
            {userEscrows.length} Proyek Aktif
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-[#EAEAEA] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Jaminan Keamanan</span>
              <Building2 className="w-5 h-5 text-green-600" />
            </div>
            <h4 className="text-base font-extrabold text-gray-900 mb-1">
              Garansi Uang Kembali 100%
            </h4>
            <p className="text-xs text-gray-500 leading-relaxed">
              Jika hasil karya siswa tidak sesuai atau proyek dibatalkan, dana DP di escrow dapat dikembalikan ke saldo Anda.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-green-700">
            <CheckCircle2 className="w-4 h-4" />
            <span>Escrow Terproteksi</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-[#EAEAEA] shadow-xs">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <div className="w-10 h-10 rounded-2xl bg-[#FFF1EB] text-[#964825] flex items-center justify-center font-bold">
              <ArrowDownLeft className="w-5 h-5 text-[#FF9B71]" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-gray-900">Formulir Top Up Deposit Saldo</h3>
              <p className="text-xs text-gray-500">Transfer ke rekening admin resmi untuk penambahan saldo escrow</p>
            </div>
          </div>

          {errorMessage && (
            <div className="mb-6 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleTopUpSubmit} className="space-y-6">
            <div className="space-y-3">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                1. Pilih Nominal Deposit Cepat
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {nominalPresets.map((nom) => (
                  <button
                    key={nom}
                    type="button"
                    onClick={() => {
                      setSelectedNominal(nom)
                      setCustomNominal('')
                    }}
                    className={`py-3 px-4 rounded-2xl font-bold text-xs transition-all border text-left cursor-pointer ${
                      selectedNominal === nom && !customNominal
                        ? 'bg-[#FFF1EB] border-[#FF9B71] text-[#964825] shadow-xs'
                        : 'bg-[#F5F5F5] border-transparent text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span className="block text-[10px] text-gray-400 font-semibold">Preset</span>
                    <span className="text-sm font-extrabold">{formatRupiah(nom)}</span>
                  </button>
                ))}
              </div>

              <div className="pt-2">
                <label className="text-xs font-bold text-gray-600 block mb-1">
                  Atau Masukkan Nominal Kustom:
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-xs text-gray-500">Rp</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formatThousand(customNominal)}
                    onChange={(e) => setCustomNominal(e.target.value.replace(/\D/g, ''))}
                    placeholder="Contoh: 1.500.000"
                    className="w-full h-12 bg-[#F5F5F5] rounded-2xl pl-10 pr-4 text-xs font-bold text-gray-900 outline-none focus:ring-2 focus:ring-[#FF9B71]"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                2. Pilih Metode Pembayaran
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMode('pakasir')}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                    paymentMode === 'pakasir'
                      ? 'bg-[#FFF7F3] border-[#FF9B71] text-gray-900 shadow-xs'
                      : 'bg-[#F5F5F5] border-transparent text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-[#FF9B71] text-white flex items-center justify-center">
                        <QrCode className="w-4 h-4" />
                      </div>
                      <span className="font-extrabold text-sm">QRIS Pakasir</span>
                    </div>
                    <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                      Otomatis & Instan
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 leading-relaxed">
                    Scan via BCA, Mandiri, BRI, BNI, GoPay, DANA, OVO, ShopeePay. Saldo masuk otomatis tanpa upload struk.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMode('manual')}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    paymentMode === 'manual'
                      ? 'bg-[#FFF7F3] border-[#FF9B71] text-gray-900 shadow-xs'
                      : 'bg-[#F5F5F5] border-transparent text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-gray-200 text-gray-700 flex items-center justify-center">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <span className="font-extrabold text-sm">Transfer Manual</span>
                    </div>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-gray-200 text-gray-600">
                      Verifikasi Admin
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 leading-relaxed">
                    Transfer langsung ke rekening penampungan bank admin dan unggah bukti transfer.
                  </p>
                </button>
              </div>
            </div>

            {paymentMode === 'pakasir' ? (
              <div className="space-y-4 pt-2">
                <div className="bg-[#FFF7F3] p-5 rounded-2xl border border-[#FFD9CA] space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Metode:</span>
                    <span className="font-extrabold text-gray-900">QRIS Dinamis (Pakasir Payment Gateway)</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Total Nominal:</span>
                    <span className="font-extrabold text-[#964825] text-base">
                      {formatRupiah(customNominal ? parseThousand(customNominal) : selectedNominal)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Biaya Layanan:</span>
                    <span className="font-extrabold text-emerald-700">Rp 0 (Gratis)</span>
                  </div>
                  <div className="pt-2 border-t border-[#FFD9CA]/60 flex items-center justify-between text-[11px] text-gray-500">
                    <span className="flex items-center gap-1 font-semibold">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#FF9B71]" />
                      <span>Keamanan Transaksi Terjamin</span>
                    </span>
                    <span className="font-bold text-gray-700">Konfirmasi Real-Time</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handlePakasirPayment}
                  disabled={isCreatingPayment}
                  className="w-full h-12 bg-[#FF9B71] text-white font-bold text-xs rounded-full hover:bg-[#F5865A] active:bg-[#E8754D] transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <QrCode className="w-4 h-4" />
                  <span>{isCreatingPayment ? 'Menyiapkan QRIS Pakasir...' : 'Bayar via QRIS Pakasir (Otomatis & Real-Time)'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-3 pt-2">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                    3. Pilih Rekening Bank Resmi Admin Mitra Muda
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {['BCA', 'Mandiri', 'BRI'].map((bank) => (
                      <button
                        key={bank}
                        type="button"
                        onClick={() => setSelectedBank(bank)}
                        className={`py-3 px-3 rounded-2xl font-bold text-xs transition-all border text-center cursor-pointer ${
                          selectedBank === bank
                            ? 'bg-[#FFF1EB] border-[#FF9B71] text-[#964825] shadow-xs'
                            : 'bg-[#F5F5F5] border-transparent text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <span className="block text-sm font-extrabold">{bank}</span>
                        <span className="text-[10px] text-gray-400">Escrow Resmi</span>
                      </button>
                    ))}
                  </div>

                  <div className="bg-[#FFF7F3] p-5 rounded-2xl border border-[#FFD9CA] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-600">Bank Tujuan:</span>
                      <span className="text-xs font-extrabold text-gray-900">{currentBank.bank}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-600">Nomor Rekening:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-extrabold text-[#964825]">{currentBank.noRek}</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(currentBank.noRek, 'rek')}
                          className="p-1 text-gray-400 hover:text-gray-700 cursor-pointer"
                          title="Salin Nomor Rekening"
                        >
                          {isCopied === 'rek' ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-600">Atas Nama:</span>
                      <span className="text-xs font-extrabold text-gray-900">{currentBank.atasNama}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                    4. Unggah Bukti Transfer & Konfirmasi
                  </label>

                  <div className="flex items-center justify-between bg-amber-50/80 border border-amber-200 p-3.5 rounded-2xl">
                    <div>
                      <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
                        ID Deposit Pembayaran:
                      </span>
                      <span className="font-mono text-xs sm:text-sm font-extrabold text-[#964825]">
                        {resiManual}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(resiManual, 'resi')}
                      className="px-2.5 py-1 bg-white border border-amber-300 rounded-lg text-xs font-bold text-amber-900 hover:bg-amber-100 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      {isCopied === 'resi' ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{isCopied === 'resi' ? 'Tersalin' : 'Salin ID'}</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-600 block">
                      Nomor Rekening / Nama Pengirim (Opsional)
                    </label>
                    <input
                      type="text"
                      value={nomorPengirim}
                      onChange={(e) => setNomorPengirim(e.target.value)}
                      placeholder="Contoh: BCA 123456789 a/n Budi Santoso"
                      className="w-full h-12 bg-[#F5F5F5] rounded-2xl px-4 text-xs font-medium text-gray-900 outline-none focus:ring-2 focus:ring-[#FF9B71]"
                    />
                  </div>

                  <label className="border-2 border-dashed border-[#FFD9CA] bg-[#FFF7F3] rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-[#FFF1EB] transition-colors group min-h-[140px] relative">
                    <input
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                    {buktiPreview ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-20 h-20 rounded-xl overflow-hidden relative border border-[#FFD9CA]">
                          <Image src={buktiPreview} alt="Bukti Transfer" fill className="object-cover" unoptimized />
                        </div>
                        <span className="text-xs font-bold text-green-700 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Bukti transfer terlampir
                        </span>
                      </div>
                    ) : (
                      <>
                        <div className="w-10 h-10 bg-[#FFD9CA] rounded-full flex items-center justify-center text-[#964825] group-hover:scale-110 transition-transform mb-2">
                          <UploadCloud className="w-5 h-5" />
                        </div>
                        <p className="font-bold text-xs text-[#964825] mb-0.5">
                          Klik untuk unggah screenshot bukti transfer
                        </p>
                        <p className="text-[10px] text-gray-500">
                          Format JPG atau PNG (Maksimal 5MB)
                        </p>
                      </>
                    )}
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full h-12 bg-[#FF9B71] text-white font-bold text-xs rounded-full hover:bg-[#F5865A] active:bg-[#E8754D] transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Kirim Konfirmasi Transfer ke Admin</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            )}
          </form>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-[#EAEAEA] shadow-xs">
            <h3 className="font-extrabold text-base text-gray-900 mb-4">
              Riwayat Deposit Saya
            </h3>

            {userDeposits.length > 0 ? (
              <div className="space-y-3 max-h-[460px] overflow-y-auto">
                {userDeposits.map((dep) => (
                  <div
                    key={dep.id}
                    className="p-4 rounded-2xl border border-gray-100 bg-[#FAFAFA] space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-sm text-gray-900">
                        {formatRupiah(dep.nominal)}
                      </span>
                      <span
                        className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                          dep.status === 'APPROVED'
                            ? 'bg-green-100 text-green-700'
                            : dep.status === 'REJECTED'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {dep.status === 'APPROVED' ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Berhasil</span>
                          </>
                        ) : dep.status === 'REJECTED' ? (
                          <>
                            <XCircle className="w-3 h-3" />
                            <span>Ditolak</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3" />
                            <span>Menunggu Admin</span>
                          </>
                        )}
                      </span>
                    </div>

                    <p className="text-[11px] text-gray-500 truncate">{dep.bankTujuan}</p>
                    <div className="flex items-center justify-between text-[11px] font-mono text-gray-700 bg-white px-2.5 py-1 rounded-lg border border-gray-200">
                      <span className="text-[10px] text-gray-400 font-sans">ID Deposit:</span>
                      <span className="font-bold text-[#964825]">{dep.id}</span>
                    </div>
                    {dep.nomorPengirim && dep.nomorPengirim !== dep.id && (
                      <p className="text-[10px] text-gray-500 truncate">Pengirim: {dep.nomorPengirim}</p>
                    )}
                    <p className="text-[10px] text-gray-400">{formatDate(dep.createdAt)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center border-2 border-dashed border-gray-100 rounded-2xl">
                <Wallet className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-gray-700">Belum Ada Deposit</p>
                <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">
                  Lakukan top up pertama Anda untuk mengisi saldo escrow proyek.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {pakasirModalData && (
        <PakasirPaymentModal
          orderId={pakasirModalData.orderId}
          nominal={pakasirModalData.nominal}
          qrisUrl={pakasirModalData.qrisUrl}
          qrisString={pakasirModalData.qrisString}
          pakasirPaymentUrl={pakasirModalData.pakasirPaymentUrl}
          onClose={() => setPakasirModalData(null)}
          onSuccess={() => {
            setPakasirModalData(null)
            setSuccessInfo({
              title: 'Top Up Deposit Berhasil!',
              desc: 'Pembayaran QRIS Pakasir telah diverifikasi secara otomatis dan saldo escrow Anda telah bertambah.'
            })
            setIsSuccessModal(true)
            syncEscrowWithDB()
          }}
        />
      )}

      {isSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-[#EAEAEA] text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-extrabold text-gray-900 mb-2">
              {successInfo?.title || 'Konfirmasi Deposit Terkirim!'}
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed mb-6">
              {successInfo?.desc || 'Bukti transfer deposit Anda telah diteruskan ke Master Admin Escrow. Saldo Anda akan otomatis bertambah setelah verifikasi disetujui.'}
            </p>
            <button
              onClick={() => setIsSuccessModal(false)}
              className="w-full py-3 bg-[#FF9B71] text-white rounded-full font-bold text-xs hover:bg-[#F5865A] transition-colors cursor-pointer shadow-xs"
            >
              Kembali ke Dashboard Saldo
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
