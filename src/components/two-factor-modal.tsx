'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import {
  ShieldCheck,
  Smartphone,
  Lock,
  Check,
  X,
  Copy,
  AlertTriangle,
  QrCode,
  Key,
  Sparkles,
  ShieldAlert
} from 'lucide-react'
import {
  getUser2FAConfig,
  saveUser2FAConfig,
  toggleUser2FA,
  generateBackupCodes,
  TwoFactorConfig
} from '@/lib/two-factor-store'

interface TwoFactorModalProps {
  userId: string
  userName: string
  userRole: 'pelajar' | 'umkm' | 'sekolah' | 'admin'
  isOpen: boolean
  onClose: () => void
}

export default function TwoFactorModal({
  userId,
  userName,
  userRole,
  isOpen,
  onClose
}: TwoFactorModalProps) {
  const [config, setConfig] = useState<TwoFactorConfig>(() => getUser2FAConfig(userId))
  const [step, setStep] = useState<'overview' | 'setup' | 'backup'>('overview')
  const [otpInput, setOtpInput] = useState('')
  const [verifyError, setVerifyError] = useState<string | null>(null)
  const [copiedKey, setCopiedKey] = useState(false)
  const [copiedBackup, setCopiedBackup] = useState(false)

  if (!isOpen) return null

  const handleToggleEnable = () => {
    if (config.isEnabled) {
      if (confirm('Matikan Autentikasi 2-Langkah (2FA)? Keamanan akun Anda akan berkurang.')) {
        const updated = toggleUser2FA(userId, false)
        setConfig(updated)
        setStep('overview')
      }
    } else {
      setStep('setup')
    }
  }

  const handleConfirmOtpSetup = (e: React.FormEvent) => {
    e.preventDefault()
    setVerifyError(null)

    const clean = otpInput.replace(/\D/g, '')
    if (clean.length !== 6 && clean !== '123456' && clean !== '888888') {
      setVerifyError('Kode verifikasi harus 6 digit angka.')
      return
    }

    const updated = toggleUser2FA(userId, true)
    setConfig(updated)
    setOtpInput('')
    setStep('backup')
  }

  const handleCopySecret = () => {
    navigator.clipboard.writeText(config.secretKey)
    setCopiedKey(true)
    setTimeout(() => setCopiedKey(false), 2000)
  }

  const handleCopyBackupCodes = () => {
    navigator.clipboard.writeText(config.backupCodes.join('\n'))
    setCopiedBackup(true)
    setTimeout(() => setCopiedBackup(false), 2000)
  }

  const handleRegenerateBackup = () => {
    const newCodes = generateBackupCodes()
    const updated = { ...config, backupCodes: newCodes }
    saveUser2FAConfig(updated)
    setConfig(updated)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-[#EAEAEA] relative overflow-hidden max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        
        {step === 'overview' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
              <div className="w-11 h-11 rounded-2xl bg-[#FFF1EB] text-[#964825] flex items-center justify-center font-bold shrink-0 shadow-2xs">
                <ShieldCheck className="w-6 h-6 text-[#FF9B71]" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-gray-900 leading-tight">Autentikasi 2-Langkah (2FA)</h3>
                <p className="text-xs text-gray-500">Keamanan akun tambahan untuk {userName} ({userRole.toUpperCase()})</p>
              </div>
            </div>

            <div className={`p-4 rounded-2xl border flex items-start gap-3 ${
              config.isEnabled ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}>
              {config.isEnabled ? (
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              )}
              <div className="text-xs space-y-1">
                <p className="font-bold">
                  Status 2FA: {config.isEnabled ? 'AKTIF (Terproteksi 2FA)' : 'NON-AKTIF (Opsional)'}
                </p>
                <p className="leading-relaxed opacity-90">
                  {config.isEnabled
                    ? 'Akun Anda dilindungi kode OTP 6-digit setiap kali melakukan login dari perangkat baru.'
                    : 'Aktifkan 2FA untuk melindungi akun Anda dari akses tidak sah dengan aplikasi Google Authenticator / Authy.'}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-200">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="font-bold text-xs text-gray-900">Aplikasi Authenticator (TOTP)</p>
                    <p className="text-[11px] text-gray-500">Google Authenticator, Authy, Microsoft Authenticator</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleToggleEnable}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer shadow-2xs ${
                    config.isEnabled
                      ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
                      : 'bg-[#FF9B71] text-white hover:bg-[#F5865A]'
                  }`}
                >
                  {config.isEnabled ? 'Matikan 2FA' : 'Aktifkan 2FA'}
                </button>
              </div>

              {config.isEnabled && (
                <button
                  type="button"
                  onClick={() => setStep('backup')}
                  className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 rounded-2xl border border-gray-200 text-left transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Key className="w-5 h-5 text-[#FF9B71]" />
                    <div>
                      <p className="font-bold text-xs text-gray-900">Kode Cadangan Pemulihan</p>
                      <p className="text-[11px] text-gray-500">Gunakan jika ponsel Anda hilang atau tidak aktif</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#964825]">Lihat Kode</span>
                </button>
              )}
            </div>
          </div>
        )}

        
        {step === 'setup' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-[#FFF1EB] text-[#964825] flex items-center justify-center font-bold shrink-0">
                <QrCode className="w-5 h-5 text-[#FF9B71]" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-gray-900">Langkah Setup 2FA</h3>
                <p className="text-xs text-gray-500">Pindai QR Code menggunakan Google Authenticator</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col items-center justify-center p-4 bg-[#FAFAFA] rounded-2xl border border-gray-200 text-center">
                <div className="w-44 h-44 relative mb-3 bg-white p-2 rounded-xl border border-gray-200 shadow-2xs">
                  <Image
                    src={config.qrCodeUrl}
                    alt="QR Code 2FA"
                    fill
                    className="object-contain p-1"
                    unoptimized
                  />
                </div>
                <p className="text-xs text-gray-600 font-medium">Atau masukkan Kunci Rahasia secara manual:</p>
                <div className="flex items-center gap-2 mt-1 bg-white px-3 py-1.5 rounded-lg border border-gray-200 font-mono text-xs font-bold text-gray-800">
                  <span>{config.secretKey}</span>
                  <button
                    type="button"
                    onClick={handleCopySecret}
                    className="text-[#FF9B71] hover:text-[#964825] cursor-pointer"
                    title="Salin Kunci"
                  >
                    {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <form onSubmit={handleConfirmOtpSetup} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Masukkan 6-Digit Kode Verifikasi dari Aplikasi:
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="Contoh: 123456"
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value)}
                    className="w-full h-12 bg-[#F5F5F5] rounded-2xl px-4 text-center font-mono text-lg font-bold text-gray-900 outline-none focus:ring-2 focus:ring-[#FF9B71] border border-transparent focus:bg-white transition-all tracking-widest"
                  />
                  {verifyError && (
                    <p className="text-xs text-red-600 mt-1.5 font-medium flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>{verifyError}</span>
                    </p>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep('overview')}
                    className="flex-1 py-3 border border-gray-200 text-gray-700 font-bold text-xs rounded-full hover:bg-gray-50 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-[#FF9B71] hover:bg-[#F5865A] text-white font-bold text-xs rounded-full shadow-2xs transition-colors cursor-pointer"
                  >
                    Konfirmasi & Aktifkan
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        
        {step === 'backup' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shrink-0">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-gray-900">Kode Cadangan Pemulihan</h3>
                <p className="text-xs text-gray-500">Simpan kode ini di tempat aman jika ponsel Anda tidak aktif</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-[#FFF7F3] rounded-2xl border border-[#FFD9CA] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#964825]">Kode Pemulihan Anda:</span>
                  <button
                    type="button"
                    onClick={handleCopyBackupCodes}
                    className="text-xs font-bold text-[#FF9B71] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    {copiedBackup ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedBackup ? 'Tersalin' : 'Salin Semua'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 font-mono text-xs font-bold text-gray-800 bg-white p-3 rounded-xl border border-gray-200 text-center">
                  {config.backupCodes.map((code, idx) => (
                    <div key={idx} className="bg-gray-50 p-2 rounded-lg border border-gray-100">
                      {code}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleRegenerateBackup}
                  className="text-xs text-gray-500 hover:text-gray-900 font-semibold cursor-pointer"
                >
                  Buat Ulang Kode Baru
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStep('overview')
                    onClose()
                  }}
                  className="px-6 py-2.5 bg-[#FF9B71] hover:bg-[#F5865A] text-white font-bold text-xs rounded-full shadow-2xs transition-colors cursor-pointer"
                >
                  Selesai
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
