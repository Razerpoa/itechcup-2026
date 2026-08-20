export type DeviceType = 'mobile' | 'tablet' | 'desktop'

export interface DashboardStat {
  label: string
  value: string
  change: number
}

export interface DashboardData {
  title: string
  stats: DashboardStat[]
  recentActivity: string[]
}

export interface DashboardViewProps {
  data: DashboardData
}

export interface DashboardDispatcherProps extends DashboardViewProps {
  initialDeviceType: DeviceType
}

export type SchoolVerificationStatus = 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'AUTO_CORRECTED' | 'REJECTED' | 'NAME_MISMATCH'

export interface KemendikdasmenSchool {
  provinsi: string
  akreditasi: string
  alamat_jalan: string
  kabupaten: string
  nama_dusun: string
  kode_pos: string
  npsn: string
  nama: string
  bentuk_pendidikan: string
  sekolah_id: string
  rt: number
  rw: number
  kecamatan: string
  status_sekolah: string
  path_file: string
}

export interface KemendikdasmenResponse {
  status_code: number
  message: string
  total: number
  data: KemendikdasmenSchool[]
}

export interface NormalizedNameResult {
  normalized: string
  error?: string
  errorCode?: string
}

export interface NameComparisonResult {
  match: 'EXACT' | 'MINOR' | 'CRITICAL'
}

export interface SchoolRegistrationBody {
  namaSekolah: string
  npsn: string
  emailResmi: string
  password: string
  namaPenanggungJawab: string
  alamatLengkap: string
  kontakSekolah: string
}
