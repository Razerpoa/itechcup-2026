'use client'

import React, { useState } from 'react'
import { Lock, ShieldCheck, AlertCircle, Clock, CheckCircle2, X } from 'lucide-react'
import { formatRupiah, formatDate, formatThousand, parseThousand } from '@/lib/utils'
import { useAuthUser } from '@/lib/auth-client'
import { useEscrowStore, submitPelajarWithdrawal } from '@/lib/escrow-store'

export default function DompetPage() {
  const user = useAuthUser()
  const escrowState = useEscrowStore()

  const pelajarId = user?.id || 'pelajar-default'
  const namaPelajar = user?.nama || 'Pelajar Mitra Muda'

  const walletBalanceFromEscrow = escrowState.pelajarBalances[pelajarId]
  const saldoSiapCair = typeof walletBalanceFromEscrow === 'number' ? walletBalanceFromEscrow : (user?.totalPendapatan || 0)

  const myWithdrawals = escrowState.withdrawals.filter((w) => w.pelajarId === pelajarId)
  const myEscrows = escrowState.escrows.filter((e) => e.pelajarId === pelajarId)

  const danaEscrow = myEscrows
    .filter((e) => e.dpStatus === 'HELD_IN_ESCROW')
    .reduce((acc, curr) => acc + curr.nominalDP, 0)

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
      icon: (
        <svg viewBox="0 0 48 48" className="w-10 h-10 drop-shadow-xs">
          <rect width="48" height="48" rx="14" fill="#00AED6" />
          <circle cx="24" cy="24" r="13" fill="white" />
          <circle cx="24" cy="24" r="8" fill="#00AED6" />
          <circle cx="28" cy="20" r="3.5" fill="white" />
        </svg>
      )
    },
    {
      name: 'DANA' as const,
      color: '#118EEA',
      sub: 'Dompet Digital',
      icon: (
        <svg viewBox="0 0 48 48" className="w-10 h-10 drop-shadow-xs">
          <rect width="48" height="48" rx="14" fill="#118EEA" />
          <path d="M14 16h11c5.52 0 10 4.48 10 10s-4.48 10-10 10H14V16z" fill="none" stroke="white" strokeWidth="4.5" strokeLinejoin="round" />
          <path d="M21 21v6c0 1.66 1.34 3 3 3s3-1.34 3-3-1.34-3-3-3h-3z" fill="white" />
        </svg>
      )
    },
    {
      name: 'OVO' as const,
      color: '#4C3494',
      sub: 'OVO Payment',
      icon: (
        <svg viewBox="0 0 48 48" className="w-10 h-10 drop-shadow-xs">
          <rect width="48" height="48" rx="14" fill="#4C3494" />
          <circle cx="24" cy="24" r="11" fill="none" stroke="white" strokeWidth="4" />
          <circle cx="24" cy="24" r="5" fill="#4C3494" stroke="white" strokeWidth="2.5" />
        </svg>
      )
    },
    {
      name: 'ShopeePay' as const,
      color: '#EE4D2D',
      sub: 'Sea Group',
      icon: (
        <svg viewBox="0 0 48 48" className="w-10 h-10 drop-shadow-xs">
          <rect width="48" height="48" rx="14" fill="#EE4D2D" />
          <path d="M16 19v-2a8 8 0 0 1 16 0v2h2a2 2 0 0 1 2 2v14a4 4 0 0 1-4 4H16a4 4 0 0 1-4-4V21a2 2 0 0 1 2-2h2zm4 0h8v-2a4 4 0 0 0-8 0v2z" fill="white" />
          <path d="M25 24c-2 0-3 .8-3 1.8 0 2.2 4.5 1.5 4.5 4.2 0 1.8-1.5 2.5-3.5 2.5-1.8 0-3-.6-3.8-1.3l.8-1.3c.7.6 1.8 1 2.8 1 1.2 0 1.8-.4 1.8-1 0-2.2-4.5-1.5-4.5-4.2 0-1.8 1.6-2.5 3.3-2.5 1.5 0 2.6.4 3.4 1l-.8 1.3c-.6-.5-1.4-.8-2-0.8z" fill="#EE4D2D" />
        </svg>
      )
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
      pelajarId,
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
    }, 800)
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto pb-16">
      <section className="w-full lg:w-5/12 flex flex-col gap-6">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Penarikan Dana Pelajar</h2>
          <p className="text-xs text-gray-500 mt-1">
            Pencairan aman tanpa syarat KTP atau rekening bank langsung ke e-wallet pilihanmu.
          </p>
        </div>
        
        <div className="bg-gradient-to-br from-[#FFF1EB] to-[#ffe3d6] rounded-3xl p-6 sm:p-8 border border-[#FFD9CA] shadow-xs overflow-hidden">
          <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
            <p className="font-bold text-[#964825] uppercase tracking-wider text-xs">Total Saldo Siap Cair</p>
            <span className="bg-white/80 text-green-700 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border border-green-200 shrink-0">
              Bebas Tarik Kapan Saja
            </span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-[#964825] mb-6 break-all min-w-0 leading-tight">
            {formatRupiah(saldoSiapCair)}
          </h3>
          
          <div className="flex items-center gap-3 bg-white/70 backdrop-blur-xs rounded-2xl p-4 border border-white/60">
            <div className="w-10 h-10 rounded-xl bg-[#FFD9CA] text-[#964825] flex items-center justify-center shrink-0 font-bold">
              <Lock className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-500 font-medium">Dana Escrow Tertahan (Proyek Berjalan)</p>
              <p className="text-sm font-extrabold text-gray-900 break-all">{formatRupiah(danaEscrow)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-[#EAEAEA] shadow-xs">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-xl bg-green-50 text-green-700 flex items-center justify-center font-bold">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-gray-900">Verifikasi Admin Master</h4>
              <p className="text-[11px] text-gray-500">Pencairan diproses dan diawasi oleh admin resmi Mitra Muda</p>
            </div>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed bg-[#FAFAFA] p-3 rounded-2xl border border-gray-100">
            Setiap permohonan penarikan akan langsung diteruskan ke antrean Otoritas Admin untuk divalidasi ke nomor e-wallet tujuan tanpa biaya admin tambahan (0% Fee).
          </p>
        </div>
      </section>

      <section className="w-full lg:w-7/12 flex flex-col gap-6">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EAEAEA] shadow-xs">
          <h3 className="text-lg font-extrabold text-gray-900 mb-6">Formulir Tarik Saldo E-Wallet</h3>

          {errorMessage && (
            <div className="mb-6 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
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
                    className={`p-3.5 rounded-2xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${
                      selectedWallet === w.name
                        ? 'border-[#FF9B71] bg-[#FFF1EB] shadow-xs'
                        : 'border-[#EAEAEA] bg-white hover:bg-gray-50'
                    }`}
                  >
                    {w.icon}
                    <div className="text-center">
                      <span className="font-extrabold text-xs text-gray-900 block">{w.name}</span>
                      <span className="text-[10px] text-gray-400">{w.sub}</span>
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
              disabled={isProcessing}
              className="w-full h-12 bg-[#FF9B71] text-white font-bold text-xs sm:text-sm rounded-full hover:bg-[#F5865A] active:bg-[#E8754D] transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
            >
              {isProcessing ? 'Mengajukan ke Admin...' : 'Ajukan Penarikan Saldo Sekarang'}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-[#EAEAEA] shadow-xs">
          <h3 className="font-extrabold text-base text-gray-900 mb-4">
            Riwayat Permintaan Penarikan Saya
          </h3>

          {myWithdrawals.length > 0 ? (
            <div className="space-y-3">
              {myWithdrawals.map((wd) => (
                <div
                  key={wd.id}
                  className="p-4 rounded-2xl border border-gray-100 bg-[#FAFAFA] flex items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-extrabold text-sm text-gray-900">
                        {formatRupiah(wd.nominal)}
                      </span>
                      <span className="text-xs font-bold text-slate-500">
                        ke {wd.eWalletType} ({wd.eWalletNomor})
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-400">{formatDate(wd.createdAt)}</p>
                  </div>

                  <span
                    className={`text-[10px] font-extrabold px-3 py-1 rounded-full flex items-center gap-1 shrink-0 ${
                      wd.status === 'APPROVED'
                        ? 'bg-green-100 text-green-700'
                        : wd.status === 'REJECTED'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {wd.status === 'APPROVED' ? (
                      <>
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Berhasil Dicairkan</span>
                      </>
                    ) : wd.status === 'REJECTED' ? (
                      <>
                        <X className="w-3 h-3" />
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
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-400 text-xs">
              Belum ada riwayat penarikan saldo.
            </div>
          )}
        </div>
      </section>

      {successModal?.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-[#EAEAEA] text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-extrabold text-gray-900 mb-2">Pengajuan Penarikan Terkirim!</h3>
            <p className="text-xs text-gray-600 leading-relaxed mb-6">
              Permintaan pencairan sebesar <span className="font-bold text-gray-900">{formatRupiah(successModal.amount)}</span> ke <span className="font-bold text-gray-900">{successModal.wallet}</span> telah masuk ke antrean Admin Master untuk dicairkan.
            </p>
            <button
              onClick={() => setSuccessModal(null)}
              className="w-full py-3 bg-[#FF9B71] text-white rounded-full font-bold text-xs hover:bg-[#F5865A] transition-colors cursor-pointer shadow-xs"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
