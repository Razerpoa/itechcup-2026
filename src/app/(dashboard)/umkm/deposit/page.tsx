'use client'

import React, { useState, useEffect } from 'react'
import {
  Wallet,
  ShieldCheck,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Sparkles,
  Building2,
  AlertCircle,
  ArrowDownLeft,
  QrCode,
  Zap,
  CreditCard,
  Check
} from 'lucide-react'
import { formatRupiah, formatDate, formatThousand, parseThousand, calculatePakasirFee } from '@/lib/utils'
import { useAuthUser } from '@/lib/auth-client'
import { useEscrowStore, syncEscrowWithDB } from '@/lib/escrow-store'
import PakasirPaymentModal from '@/components/pakasir-payment-modal'

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

  const [selectedNominal, setSelectedNominal] = useState<number>(1000000)
  const [customNominal, setCustomNominal] = useState<string>('')
  const [isSuccessModal, setIsSuccessModal] = useState<boolean>(false)
  const [successInfo, setSuccessInfo] = useState<{ title: string; desc: string } | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [pakasirModalData, setPakasirModalData] = useState<{
    orderId: string
    nominal: number
    fee: number
    totalPayment: number
    qrisUrl: string
    qrisString?: string
    pakasirPaymentUrl: string
  } | null>(null)
  const [isCreatingPayment, setIsCreatingPayment] = useState(false)

  const nominalPresets = [500000, 1000000, 2500000, 5000000, 10000000]

  const finalAmount = customNominal ? parseThousand(customNominal) : selectedNominal
  const feePakasir = calculatePakasirFee(finalAmount)
  const totalBayar = finalAmount + feePakasir

  const handlePakasirPayment = async () => {
    setErrorMessage(null)
    if (!finalAmount || finalAmount < 1000) {
      setErrorMessage('Nominal deposit minimal adalah Rp 1.000')
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
        setErrorMessage(json?.error || 'Gagal membuat tagihan pembayaran Pakasir')
        return
      }

      const json = await res.json()
      setPakasirModalData({
        orderId: json.data.orderId,
        nominal: json.data.nominal,
        fee: json.data.fee,
        totalPayment: json.data.totalPayment,
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
            Isi saldo rekening bersama untuk membayar DP dan pelunasan proyek pelajar secara otomatis via Pakasir Gateway.
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
              Dapat langsung dipotong untuk pembayaran DP proyek baru secara instan.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-white/20 flex items-center gap-1 text-[11px] font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Verifikasi Otomatis Real-Time</span>
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
              Dana DP proyek yang sedang tertahan aman di rekening penampungan escrow.
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
              <p className="text-xs text-gray-500">Semua transaksi diproses otomatis 100% melalui gateway resmi Pakasir</p>
            </div>
          </div>

          {errorMessage && (
            <div className="mb-6 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="space-y-6">
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
                    placeholder="Minimal Rp 1.000 (contoh: 50.000)"
                    className="w-full h-12 bg-[#F5F5F5] rounded-2xl pl-10 pr-4 text-xs font-bold text-gray-900 outline-none focus:ring-2 focus:ring-[#FF9B71]"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                2. Metode Pembayaran Otomatis (Pakasir Gateway)
              </label>

              <div className="bg-[#FFF7F3] rounded-3xl p-5 border border-[#FFD9CA] space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#FFD9CA]/70">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#FF9B71] text-white flex items-center justify-center font-extrabold shadow-xs">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-gray-900">
                        Gateway Pembayaran Otomatis Pakasir
                      </h4>
                      <p className="text-[11px] text-gray-500">
                        Verifikasi instan tanpa perlu unggah struk transfer atau menunggu admin manual
                      </p>
                    </div>
                  </div>
                  <span className="hidden sm:inline-block text-[10px] font-extrabold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Otomatis 100%
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-white p-3.5 rounded-2xl border border-[#FFD9CA]/80 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <QrCode className="w-4 h-4 text-[#FF9B71]" />
                      <span className="font-extrabold text-xs text-gray-900">QRIS Dinamis Semua Bank & E-Wallet</span>
                    </div>
                    <p className="text-[10px] text-gray-500 leading-relaxed">
                      Scan kode QR langsung dari BCA, Mandiri (Livin), BRI (BRImo), BNI, CIMB, Danamon, Permata, Jago, SeaBank, GoPay, OVO, DANA, ShopeePay, LinkAja.
                    </p>
                  </div>

                  <div className="bg-white p-3.5 rounded-2xl border border-[#FFD9CA]/80 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-[#FF9B71]" />
                      <span className="font-extrabold text-xs text-gray-900">Transfer Bank & Virtual Account</span>
                    </div>
                    <p className="text-[10px] text-gray-500 leading-relaxed">
                      Pilihan nomor Virtual Account / rekening tujuan resmi via Pakasir Pay dengan verifikasi saldo instan detik itu juga.
                    </p>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-[#FFD9CA]/80 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Nominal Deposit Masuk Saldo:</span>
                    <span className="font-extrabold text-gray-900">{formatRupiah(finalAmount)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500 flex items-center gap-1.5">
                      <span>Biaya Layanan Pakasir:</span>
                      <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-[#964825] text-white">Otomatis</span>
                    </span>
                    <span className="font-extrabold text-[#964825]">{formatRupiah(feePakasir)}</span>
                  </div>
                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs font-bold">
                    <span className="text-gray-700">Total Pembayaran:</span>
                    <span className="text-base font-extrabold text-[#964825]">{formatRupiah(totalBayar)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-gray-600 bg-white/70 px-3.5 py-2 rounded-xl border border-[#FFD9CA]/50">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Biaya layanan dihitung otomatis sesuai ketentuan Pakasir. Saldo masuk ke rekening bersama sebesar nominal deposit yang dipilih.</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handlePakasirPayment}
                disabled={isCreatingPayment}
                className="w-full h-12 bg-[#FF9B71] text-white font-bold text-xs rounded-full hover:bg-[#F5865A] active:bg-[#E8754D] transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-4"
              >
                <Zap className="w-4 h-4" />
                <span>{isCreatingPayment ? 'Menghubungkan ke Pakasir Gateway...' : 'Bayar Sekarang via Pakasir (QRIS & Bank Transfer)'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
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
                            <span>Berhasil (Otomatis)</span>
                          </>
                        ) : dep.status === 'REJECTED' ? (
                          <>
                            <XCircle className="w-3 h-3" />
                            <span>Ditolak</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3" />
                            <span>Menunggu Pembayaran</span>
                          </>
                        )}
                      </span>
                    </div>

                    <p className="text-[11px] text-gray-500 truncate">{dep.bankTujuan || 'Pakasir Gateway (QRIS / Bank Transfer)'}</p>
                    <div className="flex items-center justify-between text-[11px] font-mono text-gray-700 bg-white px-2.5 py-1 rounded-lg border border-gray-200">
                      <span className="text-[10px] text-gray-400 font-sans">ID Deposit:</span>
                      <span className="font-bold text-[#964825]">{dep.id}</span>
                    </div>
                    {dep.nomorPengirim && dep.nomorPengirim !== dep.id && (
                      <p className="text-[10px] text-gray-500 truncate">Saluran: {dep.nomorPengirim}</p>
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
                  Lakukan top up pertama Anda untuk mengisi saldo escrow proyek secara otomatis.
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
          fee={pakasirModalData.fee}
          totalPayment={pakasirModalData.totalPayment}
          qrisUrl={pakasirModalData.qrisUrl}
          qrisString={pakasirModalData.qrisString}
          pakasirPaymentUrl={pakasirModalData.pakasirPaymentUrl}
          onClose={() => setPakasirModalData(null)}
          onSuccess={() => {
            setPakasirModalData(null)
            setSuccessInfo({
              title: 'Top Up Deposit Berhasil!',
              desc: 'Pembayaran Pakasir telah diverifikasi secara otomatis dan saldo escrow Anda telah bertambah secara instan.'
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
              {successInfo?.title || 'Deposit Berhasil!'}
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed mb-6">
              {successInfo?.desc || 'Pembayaran Anda telah diverifikasi otomatis oleh sistem. Saldo siap digunakan untuk pembayaran proyek.'}
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
