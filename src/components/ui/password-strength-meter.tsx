'use client'

import React from 'react'
import { Check, X } from 'lucide-react'

interface PasswordStrengthMeterProps {
  password: string
}

export function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
  if (!password) return null

  const hasLength = password.length >= 8
  const hasUpper = /[A-Z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSpecial = /[^A-Za-z0-9]/.test(password)

  const score = [hasLength, hasUpper, hasNumber, hasSpecial].filter(Boolean).length

  const getStrengthLabel = () => {
    if (score <= 1) return { label: 'Sangat Lemah', color: 'bg-red-500', text: 'text-red-500', width: 'w-1/4' }
    if (score === 2) return { label: 'Lemah', color: 'bg-orange-400', text: 'text-orange-500', width: 'w-2/4' }
    if (score === 3) return { label: 'Cukup Kuat', color: 'bg-yellow-400', text: 'text-yellow-600', width: 'w-3/4' }
    return { label: 'Sangat Kuat', color: 'bg-emerald-500', text: 'text-emerald-600', width: 'w-full' }
  }

  const current = getStrengthLabel()

  return (
    <div className="mt-2 space-y-2 text-xs">
      
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className={`h-full ${current.color} ${current.width} transition-all duration-300 rounded-full`} />
        </div>
        <span className={`font-semibold ${current.text}`}>{current.label}</span>
      </div>

      
      <div className="grid grid-cols-2 gap-1 text-[11px] text-gray-500 pt-1">
        <div className="flex items-center gap-1.5">
          {hasLength ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <X className="w-3.5 h-3.5 text-gray-300" />}
          <span>Min. 8 karakter</span>
        </div>
        <div className="flex items-center gap-1.5">
          {hasUpper ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <X className="w-3.5 h-3.5 text-gray-300" />}
          <span>Huruf besar (A-Z)</span>
        </div>
        <div className="flex items-center gap-1.5">
          {hasNumber ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <X className="w-3.5 h-3.5 text-gray-300" />}
          <span>Angka (0-9)</span>
        </div>
        <div className="flex items-center gap-1.5">
          {hasSpecial ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <X className="w-3.5 h-3.5 text-gray-300" />}
          <span>Simbol / Unik</span>
        </div>
      </div>
    </div>
  )
}
