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
  AlertCircle
} from 'lucide-react'
import { formatRupiah } from '@/lib/utils'
import { syncEscrowWithDB } from '@/lib/escrow-store'

interface PakasirPaymentModalProps {
  orderId: string
  nominal: number
  qrisUrl: string
  qrisString?: string
  pakasirPaymentUrl: string
  onClose: () => void
  onSuccess: () => void
}

export default function PakasirPaymentModal({
  orderId,
  nominal,
  qrisUrl,
  pakasirPaymentUrl,
  onClose,
  onSuccess
}: PakasirPaymentModalProps) {
  const [copied, setCopied] = useState(false)
  const [timeLeft, setTimeLeft] = useState(15 * 60)
  const [isSimulating, setIsSimulating] = useState(false)
  const [isPaid, setIsPaid] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (isPaid) return
    const poll = setInterval(async () => {
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
    }, 2500)
    return () => clearInterval(poll)
  }, [orderId, isPaid, onSuccess])

  const handleCopyOrderId = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(orderId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
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
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-gray-100 flex flex-col max-h-[90vh]">
        <div className="bg-[#FFF7F3] p-5 border-b border-[#FFD9CA] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FF9B71] text-white flex items-center justify-center font-extrabold shadow-xs">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-extrabold text-gray-900">QRIS Dinamis Pakasir</span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#964825] text-white">
                  Otomatis
                </span>
              </div>
              <p className="text-[11px] text-gray-500">Scan bayar dari semua bank & e-wallet</p>
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

        <div className="p-6 overflow-y-auto space-y-5">
          {isPaid ? (
            <div className="py-8 text-center space-y-3 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-extrabold text-gray-900">Pembayaran Berhasil!</h3>
              <p className="text-xs text-gray-600 max-w-xs mx-auto">
                Dana sebesar <span className="font-extrabold text-emerald-700">{formatRupiah(nominal)}</span> telah diverifikasi otomatis oleh sistem Pakasir dan saldo escrow Anda bertambah.
              </p>
            </div>
          ) : (
            <>
              <div className="bg-[#FAFAFA] rounded-2xl p-4 border border-gray-100 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                    Total Pembayaran
                  </span>
                  <span className="text-2xl font-extrabold text-[#964825]">
                    {formatRupiah(nominal)}
                  </span>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-[11px] font-bold text-amber-600">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Sisa Waktu</span>
                  </div>
                  <span className="font-mono text-sm font-extrabold text-gray-900">
                    {formattedTime}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between bg-gray-50 px-3.5 py-2 rounded-xl text-xs border border-gray-100">
                <span className="text-gray-500 font-medium">Order ID:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-gray-800">{orderId}</span>
                  <button
                    type="button"
                    onClick={handleCopyOrderId}
                    className="text-gray-400 hover:text-gray-700 cursor-pointer"
                    title="Salin Order ID"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center p-5 bg-white border-2 border-dashed border-[#FFD9CA] rounded-2xl relative">
                <div className="w-56 h-56 relative rounded-xl overflow-hidden shadow-xs border border-gray-100 bg-white flex items-center justify-center">
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
                  Buka aplikasi m-Banking atau E-Wallet apa saja, pilih Scan QRIS, lalu konfirmasi pembayaran.
                </p>
              </div>

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
                  <span>Buka Halaman Pembayaran Pakasir Pay</span>
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
                <span className="font-extrabold block mb-0.5">Verifikasi Instan Tanpa Upload Bukti:</span>
                Sistem secara otomatis mendeteksi ketika pembayaran Anda berhasil. Saldo langsung masuk tanpa perlu unggah struk transfer.
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
