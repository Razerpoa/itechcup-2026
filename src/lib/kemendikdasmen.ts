import type { KemendikdasmenSchool } from '@/types.ts'

const API_URL = 'https://sekolah.data.kemendikdasmen.go.id/v1/sekolah-service/sekolah/cari-sekolah'
const TIMEOUT_MS = 10_000

export interface LookupResult {
  success: boolean
  data?: KemendikdasmenSchool
  error?: string
  errorCode?: string
}

export async function lookupSchool(npsn: string): Promise<LookupResult> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        page: 0,
        size: 1,
        keyword: npsn,
        kabupaten_kota: '',
        bentuk_pendidikan: '',
        status_sekolah: '',
      }),
      signal: controller.signal,
    })

    clearTimeout(timeout)

    if (!response.ok) {
      return {
        success: false,
        error: `API returned status ${response.status}`,
        errorCode: 'ERR_API_UNAVAILABLE',
      }
    }

    const json = await response.json()

    if (!json.data || json.data.length === 0) {
      return {
        success: false,
        error: 'NPSN tidak ditemukan di database pemerintah',
        errorCode: 'ERR_NPSN_NOT_FOUND',
      }
    }

    return { success: true, data: json.data[0] }
  } catch {
    return {
      success: false,
      error: 'Gagal menghubungi server Kemendikdasmen',
      errorCode: 'ERR_API_UNAVAILABLE',
    }
  }
}
