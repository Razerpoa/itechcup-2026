import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date))
}

export function formatRelativeTime(date: Date | string): string {
  const now = new Date()
  const past = new Date(date)
  const diffMs = now.getTime() - past.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Baru saja'
  if (diffMins < 60) return `${diffMins} menit lalu`
  if (diffHours < 24) return `${diffHours} jam lalu`
  if (diffDays < 7) return `${diffDays} hari lalu`
  return formatDate(date)
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength).trimEnd() + '...'
}

export function formatThousand(val: string | number): string {
  if (val === undefined || val === null || val === '') return ''
  const digits = String(val).replace(/\D/g, '')
  if (!digits) return ''
  return Number(digits).toLocaleString('id-ID')
}

export function parseThousand(val: string | number): number {
  if (typeof val === 'number') return val
  if (!val) return 0
  const digits = String(val).replace(/\D/g, '')
  return digits ? Number(digits) : 0
}

export function compressImageFile(file: File, maxWidth = 1200, quality = 0.75): Promise<{ dataUrl: string; sizeStr: string }> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = () => {
        const sizeInMB = file.size / (1024 * 1024)
        const sizeStr = sizeInMB < 1 ? `${Math.round(file.size / 1024)} KB` : `${sizeInMB.toFixed(1)} MB`
        resolve({ dataUrl: reader.result as string, sizeStr })
      }
      reader.readAsDataURL(file)
      return
    }

    const img = document.createElement('img')
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      let { width, height } = img
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width)
        width = maxWidth
      }
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        const reader = new FileReader()
        reader.onload = () => resolve({ dataUrl: reader.result as string, sizeStr: 'Gambar' })
        reader.readAsDataURL(file)
        return
      }
      ctx.drawImage(img, 0, 0, width, height)
      const dataUrl = canvas.toDataURL('image/jpeg', quality)
      const estimatedBytes = Math.round((dataUrl.length * 3) / 4)
      const sizeInMB = estimatedBytes / (1024 * 1024)
      const sizeStr = sizeInMB < 1 ? `${Math.round(estimatedBytes / 1024)} KB` : `${sizeInMB.toFixed(1)} MB`
      resolve({ dataUrl, sizeStr })
    }
    img.onerror = () => {
      const reader = new FileReader()
      reader.onload = () => resolve({ dataUrl: reader.result as string, sizeStr: 'Gambar' })
      reader.readAsDataURL(file)
    }
    img.src = url
  })
}

export function generateNoResi(prefix = 'MTU', customYear?: number): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let random = ''
  for (let i = 0; i < 4; i++) {
    random += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  const year = customYear || new Date().getFullYear()
  return `${prefix}-${year}-${random}`
}

export const generateDepositId = generateNoResi

