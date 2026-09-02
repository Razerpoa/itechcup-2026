'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Lock, ShieldCheck, AlertCircle, Clock, CheckCircle2, X, Sparkles, Check, ArrowRight } from 'lucide-react'
import { formatRupiah, formatDate, formatThousand, parseThousand } from '@/lib/utils'
import { useAuthUser } from '@/lib/auth-client'
import { useEscrowStore, submitPelajarWithdrawal, syncEscrowWithDB } from '@/lib/escrow-store'
import { useAkadStore, syncAkadWithDB } from '@/lib/akad-store'

export default function DompetPage() {
  const user = useAuthUser()
  const escrowState = useEscrowStore()
  const akadState = useAkadStore()

  useEffect(() => {
    syncEscrowWithDB()
    syncAkadWithDB()
    const interval = setInterval(() => {
      syncEscrowWithDB()
      syncAkadWithDB()
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const isDemoPelajar = user?.id === 'pelajar-active' || user?.email === 'pelajar.google@gmail.com' || !user?.id
  const pelajarId = user?.id || 'pelajar-default'
  const namaPelajar = user?.nama || 'Pelajar Mitra Muda'

  const myAkadList = useMemo(() => {
    return akadState.akadList.filter((a) => {
      if (isDemoPelajar) return true
      if (!user?.id && !user?.nama) return false
      const matchId = user?.id && a.pelajarId === user.id
      const matchNama =
        user?.nama &&
        a.namaPelajar &&
        a.namaPelajar.toLowerCase().trim() === user.nama.toLowerCase().trim()
      return Boolean(matchId || matchNama)
    })
  }, [akadState.akadList, isDemoPelajar, user?.id, user?.nama])

  const completedAkad = useMemo(() => myAkadList.filter((a) => a.step === 4), [myAkadList])
  const ongoingAkad = useMemo(() => myAkadList.filter((a) => a.step < 4), [myAkadList])

  const completedEarnings = completedAkad.reduce((acc, curr) => acc + (curr.nominalTotal || 500000), 0)

  const myWithdrawals = useMemo(() => {
    return escrowState.withdrawals.filter(
      (w) => w.pelajarId === pelajarId || (isDemoPelajar && w.pelajarId === 'pelajar-active')
    )
  }, [escrowState.withdrawals, pelajarId, isDemoPelajar])

  const totalWithdrawn = myWithdrawals
    .filter((w) => w.status !== 'REJECTED')
    .reduce((acc, curr) => acc + curr.nominal, 0)

  const directBalance = escrowState.pelajarBalances[pelajarId] || 0
  const saldoSiapCair =
    completedEarnings > 0
      ? Math.max(0, completedEarnings - totalWithdrawn)
      : Math.max(0, directBalance - totalWithdrawn)

  const myEscrows = escrowState.escrows.filter(
    (e) => e.pelajarId === pelajarId || (isDemoPelajar && e.pelajarId === 'pelajar-active')
  )

  const danaEscrow = ongoingAkad.reduce((acc, curr) => acc + (curr.nominalTotal || 500000), 0)

  const [selectedWallet, setSelectedWallet] = useState<'GoPay' | 'DANA' | 'OVO' | 'ShopeePay'>('GoPay')
  const [phoneNumber, setPhoneNumber] = useState('0812-3456-7890')
  const [amount, setAmount] = useState('500000')
  const [isProcessing, setIsProcessing] = useState(false)
  const [successModal, setSuccessModal] = useState<{ open: boolean; amount: number; wallet: string } | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const walletOptions = [
    {
      name: 'GoPay' as const,
      color: '#00AED6',
      sub: 'Gojek Financial',
      image: '/images/wallets/gopay.png'
    },
    {
      name: 'DANA' as const,
      color: '#118EEA',
      sub: 'Dompet Digital',
      image: '/images/wallets/dana.png'
    },
    {
      name: 'OVO' as const,
      color: '#4C3494',
      sub: 'OVO Payment',
      image: '/images/wallets/ovo.png'
    },
    {
      name: 'ShopeePay' as const,
      color: '#EE4D2D',
      sub: 'Sea Group',
      image: '/images/wallets/shopeepay.png'
    }
  ]

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    const num = parseThousand(amount)

    if (isNaN(num) || num < 20000) {
      setErrorMessage('Minimal penarikan adalah Rp 20.000')
      return
    }

    if (num > saldoSiapCair) {
      setErrorMessage('Nominal melebihi saldo siap cair yang tersedia')
      return
    }

    setIsProcessing(true)

    const result = submitPelajarWithdrawal({
      pelajarId: isDemoPelajar ? 'pelajar-active' : pelajarId,
      namaPelajar,
      nominal: num,
      eWalletType: selectedWallet,
      eWalletNomor: phoneNumber
    })

    setTimeout(() => {
      setIsProcessing(false)
      if (result.success) {
        setSuccessModal({
          open: true,
          amount: num,
          wallet: selectedWallet
        })
      } else {
        setErrorMessage(result.error || 'Gagal mengajukan penarikan')
      }
    }, 500)
  }

  return (
    <div className="space-y-8 pb-12">
      <div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-1 text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 w-fit">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Sistem Pembayaran Terlindungi Escrow</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
          Dompet & Pencairan Dana
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Tarik penghasilan proyek langsung ke akun e-wallet pribadimu tanpa perlu rekening bank atau KTP.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-[#FFF1EB] to-[#ffe5d9] rounded-3xl p-6 sm:p-8 border border-[#FFD9CA] shadow-xs relative overflow-hidden">
          <div className="relative z-10">
            <span className="text-xs font-extrabold text-[#964825] uppercase tracking-wider block">
              Saldo Siap Cair
            </span>
            <div className="text-3xl sm:text-4xl font-black text-[#964825] mt-2 mb-1">
              {formatRupiah(saldoSiapCair)}
            </div>
            <p className="text-xs text-[#964825]/80 mt-1">
              Dana dari proyek yang telah diselesaikan dan diapprove oleh klien UMKM.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EAEAEA] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-gray-400 uppercase tracking-wider">
                Dana Terkunci di Escrow
              </span>
              <Lock className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-3xl sm:text-4xl font-black text-gray-900 mt-2 mb-1">
              {formatRupiah(danaEscrow)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              DP & Pelunasan aman yang dipegang sistem selama proyek berlangsung.
            </p>
          </div>
          <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>{ongoingAkad.length} Proyek Sedang Berjalan</span>
            <span className="font-bold text-emerald-600">Terproteksi 100%</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-[#EAEAEA] shadow-xs">
          <h3 className="font-extrabold text-lg text-gray-900 mb-2">Formulir Tarik Saldo ke E-Wallet</h3>
          <p className="text-xs text-gray-500 mb-6 leading-relaxed">
            Pencairan saldo diproses secara instan ke nomor e-wallet yang Anda daftarkan di bawah ini.
          </p>

          {errorMessage && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleWithdraw} className="space-y-6">
            <div className="space-y-3">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                1. Pilih Akun E-Wallet Resmi
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {walletOptions.map((w) => (
                  <button
                    key={w.name}
                    type="button"
                    onClick={() => setSelectedWallet(w.name)}
                    className={`p-3 rounded-2xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${
                      selectedWallet === w.name
                        ? 'border-[#FF9B71] bg-[#FFF1EB] shadow-xs'
                        : 'border-[#EAEAEA] bg-white hover:bg-gray-50'
                    }`}
                  >
                    <div className="w-full h-10 bg-white rounded-xl border border-gray-100 p-1 flex items-center justify-center overflow-hidden shadow-2xs">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={w.image}
                        alt={w.name}
                        className="h-full w-auto max-w-full object-contain"
                      />
                    </div>
                    <div className="text-center">
                      <span className="font-extrabold text-xs text-gray-900 block">{w.name}</span>
                      <span className="text-[10px] text-gray-400 font-medium">{w.sub}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                2. Nomor Akun {selectedWallet}
              </label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Contoh: 081234567890"
                className="w-full h-12 bg-[#F5F5F5] rounded-2xl px-4 text-sm font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-[#FF9B71]"
                required
              />
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                3. Nominal Penarikan (Rp)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-extrabold text-sm text-gray-500">Rp</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={formatThousand(amount)}
                  onChange={(e) => setAmount(e.target.value.replace(/\D/g, ''))}
                  placeholder="500.000"
                  className="w-full h-12 bg-[#F5F5F5] rounded-2xl pl-12 pr-4 text-base font-extrabold text-[#964825] outline-none focus:ring-2 focus:ring-[#FF9B71]"
                  required
                />
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {[100000, 250000, 500000, 1000000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setAmount(String(preset))}
                    className="px-3.5 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs transition-colors cursor-pointer"
                  >
                    {formatRupiah(preset)}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isProcessing || saldoSiapCair < 20000}
              className="w-full h-12 bg-[#FF9B71] text-white font-bold text-xs sm:text-sm rounded-full hover:bg-[#F5865A] active:bg-[#E8754D] transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Mengajukan ke Admin...' : 'Ajukan Penarikan Saldo Sekarang'}
            </button>
          </form>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EAEAEA] shadow-xs">
            <h4 className="font-extrabold text-base text-gray-900 mb-4">Riwayat Penghasilan & Penarikan</h4>

            {completedAkad.length === 0 && myWithdrawals.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-xs">
                Belum ada transaksi pencairan atau proyek selesai.
              </div>
            ) : (
              <div className="space-y-3 max-h-[380px] overflow-y-auto divide-y divide-gray-50">
                {completedAkad.map((akad) => (
                  <div key={akad.id} className="pt-3 first:pt-0 flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <p className="font-extrabold text-xs text-gray-900 truncate max-w-[180px]">
                          {akad.judulProyek}
                        </p>
                      </div>
                      <p className="text-[11px] text-gray-500">Klien: {akad.namaUsaha}</p>
                      <span className="text-[10px] text-gray-400">
                        {akad.completedAt ? formatDate(akad.completedAt) : formatDate(akad.createdAt)}
                      </span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-extrabold text-xs text-emerald-600 block">
                        +{formatRupiah(akad.nominalTotal)}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        Lunas
                      </span>
                    </div>
                  </div>
                ))}

                {myWithdrawals.map((w) => (
                  <div key={w.id} className="pt-3 flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                        <p className="font-extrabold text-xs text-gray-900">
                          Tarik ke {w.eWalletType}
                        </p>
                      </div>
                      <p className="text-[11px] text-gray-500">Nomor: {w.eWalletNomor}</p>
                      <span className="text-[10px] text-gray-400">{formatDate(w.createdAt)}</span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-extrabold text-xs text-gray-900 block">
                        -{formatRupiah(w.nominal)}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          w.status === 'APPROVED'
                            ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                            : w.status === 'REJECTED'
                            ? 'text-red-700 bg-red-50 border-red-200'
                            : 'text-amber-800 bg-amber-50 border-amber-200'
                        }`}
                      >
                        {w.status === 'APPROVED' ? 'Berhasil' : w.status === 'REJECTED' ? 'Ditolak' : 'Diproses'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {successModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-[#EAEAEA] text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-extrabold text-gray-900 mb-2">Penarikan Saldo Diajukan!</h3>
            <p className="text-xs text-gray-600 leading-relaxed mb-6">
              Pengajuan penarikan sebesar <strong className="text-gray-900 font-black">{formatRupiah(successModal.amount)}</strong> ke akun <strong className="text-[#964825]">{successModal.wallet}</strong> sedang diproses.
            </p>
            <button
              onClick={() => setSuccessModal(null)}
              className="w-full py-3 bg-[#FF9B71] text-white rounded-full font-bold text-xs hover:bg-[#F5865A] transition-colors cursor-pointer shadow-xs"
            >
              Kembali ke Dompet
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
