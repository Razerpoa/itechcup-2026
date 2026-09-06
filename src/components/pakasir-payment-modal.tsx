'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import {
  QrCode,
  CheckCircle2,
  Clock,
  Copy,
  Check,
  ExternalLink,
  Zap,
  ShieldCheck,
  X,
  AlertCircle,
  CreditCard,
  Building2,
  ChevronRight
} from 'lucide-react'
import { formatRupiah, calculatePakasirFee, SUPPORTED_BANKS, generateVirtualAccountNumber } from '@/lib/utils'
import { syncEscrowWithDB } from '@/lib/escrow-store'

interface PakasirPaymentModalProps {
  orderId: string
  nominal: number
  fee?: number
  totalPayment?: number
  qrisUrl: string
  qrisString?: string
  pakasirPaymentUrl: string
  initialPaymentMethod?: string
  initialBank?: string
  vaNumber?: string
  bankTujuan?: string
  onClose: () => void
  onSuccess: () => void
}

export default function PakasirPaymentModal({
  orderId,
  nominal,
  fee,
  totalPayment,
  qrisUrl,
  pakasirPaymentUrl,
  initialPaymentMethod,
  initialBank,
  vaNumber: initialVaNumber,
  onClose,
  onSuccess
}: PakasirPaymentModalProps) {
  const isInitialBank = initialPaymentMethod && initialPaymentMethod !== 'qris'
  const [activeTab, setActiveTab] = useState<'qris' | 'bank'>(isInitialBank ? 'bank' : 'qris')

  const defaultBank = initialBank || (isInitialBank ? initialPaymentMethod : 'bca')
  const [selectedBank, setSelectedBank] = useState<string>(
    SUPPORTED_BANKS.some((b) => b.id === defaultBank) ? defaultBank : 'bca'
  )

  const [copiedOrderId, setCopiedOrderId] = useState(false)
  const [copiedVa, setCopiedVa] = useState(false)
  const [copiedNominal, setCopiedNominal] = useState(false)
  const [timeLeft, setTimeLeft] = useState(15 * 60)
  const [isSimulating, setIsSimulating] = useState(false)
  const [isPaid, setIsPaid] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const actualFee = fee !== undefined ? fee : calculatePakasirFee(nominal)
  const actualTotal = totalPayment || (nominal + actualFee)

  const activeBankObj = SUPPORTED_BANKS.find((b) => b.id === selectedBank) || SUPPORTED_BANKS[0]

  const currentVaNumber =
    selectedBank === defaultBank && initialVaNumber
      ? initialVaNumber
      : generateVirtualAccountNumber(selectedBank, orderId)

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (isPaid) return
    const poll = setInterval(async () => {
      if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return
      try {
        const res = await fetch(`/api/payment/pakasir/status?orderId=${encodeURIComponent(orderId)}`, {
          cache: 'no-store'
        })
        if (res.ok) {
          const json = await res.json()
          if (json?.status === 'APPROVED' || json?.deposit?.status === 'APPROVED') {
            setIsPaid(true)
            syncEscrowWithDB()
            clearInterval(poll)
            setTimeout(() => {
              onSuccess()
            }, 2000)
          }
        }
      } catch {
      }
    }, 4000)
    return () => clearInterval(poll)
  }, [orderId, isPaid, onSuccess])

  const handleCopy = (text: string, type: 'order' | 'va' | 'nominal') => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text)
      if (type === 'order') {
        setCopiedOrderId(true)
        setTimeout(() => setCopiedOrderId(false), 2000)
      } else if (type === 'va') {
        setCopiedVa(true)
        setTimeout(() => setCopiedVa(false), 2000)
      } else {
        setCopiedNominal(true)
        setTimeout(() => setCopiedNominal(false), 2000)
      }
    }
  }

  const handleSimulatePayment = async () => {
    setIsSimulating(true)
    setErrorMsg(null)
    try {
      const res = await fetch('/api/payment/pakasir/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId })
      })
      if (res.ok) {
        setIsPaid(true)
        syncEscrowWithDB()
        setTimeout(() => {
          onSuccess()
        }, 1800)
      } else {
        const json = await res.json()
        setErrorMsg(json?.error || 'Simulasi gagal dijalankan')
      }
    } catch {
      setErrorMsg('Koneksi simulasi terputus')
    } finally {
      setIsSimulating(false)
    }
  }

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-gray-100 flex flex-col max-h-[92vh]">
        <div className="bg-[#FFF7F3] p-4 sm:p-5 border-b border-[#FFD9CA] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FF9B71] text-white flex items-center justify-center font-extrabold shadow-xs">
              {activeTab === 'qris' ? <QrCode className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-extrabold text-gray-900">Gateway Pakasir Escrow</span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#964825] text-white">
                  Otomatis
                </span>
              </div>
              <p className="text-[11px] text-gray-500">Pilih QRIS atau Transfer Virtual Account Bank</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-white/80 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {isPaid ? (
            <div className="py-8 text-center space-y-3 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-extrabold text-gray-900">Pembayaran Berhasil!</h3>
              <p className="text-xs text-gray-600 max-w-xs mx-auto">
                Dana deposit sebesar <span className="font-extrabold text-emerald-700">{formatRupiah(nominal)}</span> telah diverifikasi otomatis oleh sistem Pakasir dan saldo rekber UMKM Anda telah bertambah.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-gray-100 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setActiveTab('qris')}
                  className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'qris'
                      ? 'bg-white text-[#964825] shadow-xs font-extrabold'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>QRIS Dinamis</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('bank')}
                  className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'bank'
                      ? 'bg-white text-[#964825] shadow-xs font-extrabold'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Transfer Bank & VA</span>
                </button>
              </div>

              <div className="bg-[#FAFAFA] rounded-2xl p-4 border border-gray-100 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                    Total Pembayaran
                  </span>
                  <span className="text-2xl font-extrabold text-[#964825]">
                    {formatRupiah(actualTotal)}
                  </span>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-[11px] font-bold text-amber-600 justify-end">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Sisa Waktu</span>
                  </div>
                  <span className="font-mono text-sm font-extrabold text-gray-900">
                    {formattedTime}
                  </span>
                </div>
              </div>

              <div className="bg-[#FFF7F3] rounded-2xl p-3.5 border border-[#FFD9CA]/80 space-y-2 text-xs">
                <div className="flex items-center justify-between text-gray-600">
                  <span>Nominal Masuk Saldo:</span>
                  <span className="font-extrabold text-gray-900">{formatRupiah(nominal)}</span>
                </div>
                <div className="flex items-center justify-between text-gray-600">
                  <span className="flex items-center gap-1.5">
                    <span>Biaya Layanan Pakasir:</span>
                    <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-[#964825] text-white">Otomatis</span>
                  </span>
                  <span className="font-extrabold text-[#964825]">{formatRupiah(actualFee)}</span>
                </div>
                <div className="pt-2 border-t border-[#FFD9CA]/70 flex items-center justify-between font-extrabold text-gray-900">
                  <span>Total Tagihan:</span>
                  <span className="text-sm font-extrabold text-[#964825]">{formatRupiah(actualTotal)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between bg-gray-50 px-3.5 py-2 rounded-xl text-xs border border-gray-100">
                <span className="text-gray-500 font-medium">No. Resi Transaksi:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-gray-900 tracking-wider">{orderId}</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(orderId, 'order')}
                    className="text-gray-400 hover:text-gray-700 cursor-pointer"
                    title="Salin No. Resi"
                  >
                    {copiedOrderId ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {activeTab === 'qris' ? (
                <div className="flex flex-col items-center justify-center p-5 bg-white border-2 border-dashed border-[#FFD9CA] rounded-2xl relative animate-in fade-in duration-150">
                  <div className="w-52 h-52 relative rounded-xl overflow-hidden shadow-xs border border-gray-100 bg-white flex items-center justify-center">
                    <Image
                      src={qrisUrl}
                      alt="QRIS Pakasir"
                      fill
                      className="object-contain p-2"
                      unoptimized
                    />
                  </div>
                  <p className="text-[11px] font-bold text-gray-700 mt-3 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#FF9B71]" />
                    <span>NMID: ID1024388192839 - MITRA MUDA ESCROW</span>
                  </p>
                  <p className="text-[10px] text-gray-400 text-center mt-0.5">
                    Scan via m-Banking (BCA, Mandiri, BRI, BNI) atau E-Wallet (GoPay, OVO, DANA, ShopeePay).
                  </p>
                </div>
              ) : (
                <div className="space-y-3.5 animate-in fade-in duration-150">
                  <div>
                    <label className="text-[11px] font-bold text-gray-600 block mb-1.5 uppercase tracking-wider">
                      Pilih Bank Tujuan:
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                      {SUPPORTED_BANKS.map((bank) => (
                        <button
                          key={bank.id}
                          type="button"
                          onClick={() => setSelectedBank(bank.id)}
                          className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                            selectedBank === bank.id
                              ? 'border-[#FF9B71] bg-[#FFF1EB] text-[#964825] shadow-2xs font-extrabold'
                              : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {bank.code}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border-2 border-dashed border-[#FFD9CA] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-600">{activeBankObj.name}</span>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#FFF1EB] text-[#964825] border border-[#FFD9CA]">
                        Virtual Account
                      </span>
                    </div>

                    <div className="bg-[#FAFAFA] p-3 rounded-xl border border-gray-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-gray-400 font-semibold block uppercase">
                          Nomor Virtual Account
                        </span>
                        <span className="font-mono text-lg font-extrabold text-gray-900 tracking-wider">
                          {currentVaNumber}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(currentVaNumber, 'va')}
                        className="py-1.5 px-3 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                      >
                        {copiedVa ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-green-600" />
                            <span className="text-green-600">Tersalin</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Salin VA</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                      <div>
                        <span className="text-[10px] text-gray-400 block font-medium">Nama Penerima:</span>
                        <span className="font-bold text-gray-800 text-[11px]">MITRA MUDA ESCROW</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-gray-400 block font-medium">Total Transfer:</span>
                        <div className="flex items-center justify-end gap-1">
                          <span className="font-extrabold text-[#964825] text-xs">{formatRupiah(actualTotal)}</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(actualTotal.toString(), 'nominal')}
                            className="text-gray-400 hover:text-gray-700 cursor-pointer"
                            title="Salin Nominal"
                          >
                            {copiedNominal ? (
                              <Check className="w-3 h-3 text-green-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-gray-100 text-[11px] text-gray-500 space-y-1">
                      <p className="font-bold text-gray-700 flex items-center gap-1">
                        <ChevronRight className="w-3 h-3 text-[#FF9B71]" />
                        <span>Petunjuk Pembayaran {activeBankObj.code}:</span>
                      </p>
                      <p className="pl-4 text-[10px] leading-relaxed">
                        1. Buka aplikasi m-Banking atau ATM {activeBankObj.code}.
                      </p>
                      <p className="pl-4 text-[10px] leading-relaxed">
                        2. Pilih menu Transfer &gt; Virtual Account, masukkan nomor di atas.
                      </p>
                      <p className="pl-4 text-[10px] leading-relaxed">
                        3. Pastikan nominal dan nama penerima sesuai, lalu konfirmasi pembayaran.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="space-y-2 pt-1">
                <a
                  href={pakasirPaymentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 bg-[#FFF1EB] text-[#964825] border border-[#FFD9CA] font-bold text-xs rounded-full hover:bg-[#FFD9CA] transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Buka Pembayaran Transfer Bank / VA (Pakasir Pay)</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  type="button"
                  onClick={handleSimulatePayment}
                  disabled={isSimulating}
                  className="w-full py-2.5 px-4 bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs rounded-full hover:bg-emerald-100 transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-2xs"
                >
                  <Zap className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{isSimulating ? 'Memproses Simulasi...' : 'Simulasi Bayar Instan (Sandbox Test)'}</span>
                </button>
              </div>

              <div className="bg-blue-50/70 p-3 rounded-xl border border-blue-100 text-[11px] text-blue-900 leading-relaxed">
                <span className="font-extrabold block mb-0.5">Verifikasi Otomatis Tanpa Upload Bukti:</span>
                Sistem secara otomatis mendeteksi saat pembayaran Anda berhasil via QRIS maupun Virtual Account. Saldo langsung masuk tanpa perlu konfirmasi manual.
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
