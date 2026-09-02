'use client'

import React, { useState, useEffect } from 'react'
import { Users, UserCheck, Clock, Check, X, ShieldAlert, Building2, Loader2, Search, ShieldCheck, CheckCircle2, Sparkles } from 'lucide-react'
import { useAuthUser, useRealtimeVerificationSync, broadcastVerificationChange, setCurrentUser } from '@/lib/auth-client'
import TwoFactorModal from '@/components/two-factor-modal'
import { formatDate } from '@/lib/utils'

export interface StudentItem {
  id: string
  name: string
  nis: string
  kelas: string
  date: string
  status: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'UNVERIFIED'
  email?: string
}

export default function SekolahDashboard() {
  const user = useAuthUser()
  useRealtimeVerificationSync()
  const [students, setStudents] = useState<StudentItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [is2FAModalOpen, setIs2FAModalOpen] = useState(false)
  const [quickRegId, setQuickRegId] = useState('')
  const [quickStatus, setQuickStatus] = useState<string | null>(null)
  const [dbSchool, setDbSchool] = useState<{
    namaSekolah: string
    namaPenanggungJawab?: string
    npsn?: string
  } | null>(null)

  const sekolahId = user?.id
  const isDemoSekolah = user?.id === 'sekolah-active' || user?.email === 'sekolah@mitramuda.id'

  useEffect(() => {
    async function fetchSchoolProfile() {
      if (!user) return
      try {
        let fetchedData = null
        if (user.id && user.id !== 'sekolah-active') {
          const res = await fetch(`/api/sekolah?id=${encodeURIComponent(user.id)}`)
          const json = await res.json()
          if (json.data && json.data.length > 0) {
            fetchedData = json.data[0]
          }
        }
        if (!fetchedData && user.email && user.email !== 'sekolah@mitramuda.id') {
          const res = await fetch(`/api/sekolah?email=${encodeURIComponent(user.email)}`)
          const json = await res.json()
          if (json.data && json.data.length > 0) {
            fetchedData = json.data[0]
          }
        }

        if (fetchedData) {
          setDbSchool({
            namaSekolah: fetchedData.namaSekolah,
            namaPenanggungJawab: fetchedData.namaPenanggungJawab,
            npsn: fetchedData.npsn
          })
          if (!user.namaSekolah || user.namaSekolah !== fetchedData.namaSekolah) {
            setCurrentUser({
              ...user,
              namaSekolah: fetchedData.namaSekolah,
              nama: fetchedData.namaPenanggungJawab || user.nama,
              npsn: fetchedData.npsn || user.npsn
            })
          }
        }
      } catch {
      }
    }

    fetchSchoolProfile()
  }, [user?.id, user?.email])

  useEffect(() => {
    async function loadStudents() {
      if (!sekolahId && !isDemoSekolah) {
        setStudents([])
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      try {
        const url = sekolahId ? `/api/siswa?sekolahId=${sekolahId}` : '/api/siswa'
        const res = await fetch(url)
        const json = await res.json()

        if (json.data && Array.isArray(json.data)) {
          const mapped: StudentItem[] = json.data.map((item: any) => ({
            id: item.id,
            name: item.namaLengkap,
            nis: item.nis || item.nisn || 'MM-' + item.id.slice(0, 8),
            kelas: item.kelas || 'Siswa Terdaftar',
            date: item.createdAt ? formatDate(item.createdAt) : 'Baru Saja',
            status: item.verificationStatus || 'PENDING',
            email: item.email
          }))
          
          setStudents(mapped)

          const firstMatchingSchool = json.data.find((item: any) => item.sekolah?.namaSekolah)?.sekolah?.namaSekolah
            || json.data.find((item: any) => item.kelas && item.kelas.toLowerCase().includes('sm'))?.kelas
          if (firstMatchingSchool) {
            setDbSchool((prev) => prev ? { ...prev, namaSekolah: prev.namaSekolah || firstMatchingSchool } : { namaSekolah: firstMatchingSchool })
            if (user && !user.namaSekolah) {
              setCurrentUser({ ...user, namaSekolah: firstMatchingSchool })
            }
          }
        }
      } catch {
        setStudents([])
      } finally {
        setIsLoading(false)
      }
    }

    loadStudents()
  }, [sekolahId, isDemoSekolah])

  const namaSekolah = 
    dbSchool?.namaSekolah || 
    user?.namaSekolah || 
    (students.length > 0 && students[0].kelas && students[0].kelas.toLowerCase().includes('sm') ? students[0].kelas : null) ||
    (isDemoSekolah ? 'SMK Negeri 2 Tasikmalaya' : null) || 
    user?.nama || 
    'SMK Negeri 2 Tasikmalaya'

  const namaAdmin = 
    dbSchool?.namaPenanggungJawab || 
    user?.nama || 
    (user?.email ? user.email.split('@')[0] : 'Pihak Sekolah')

  const handleAction = async (id: string, status: 'VERIFIED' | 'REJECTED') => {
    const targetStudent = students.find((s) => s.id === id)
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status } : s))
    )

    broadcastVerificationChange({
      role: 'pelajar',
      id,
      email: targetStudent?.email,
      status
    })

    try {
      await fetch(`/api/siswa/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verificationStatus: status })
      })
    } catch {
    }
  }

  const handleQuickApprove = async (e: React.FormEvent) => {
    e.preventDefault()
    const query = quickRegId.trim().toLowerCase()
    if (!query) return

    const found = students.find(
      (s) => s.nis.toLowerCase() === query || s.id.toLowerCase() === query
    )

    if (found) {
      await handleAction(found.id, 'VERIFIED')
      setQuickStatus(`Berhasil! Siswa "${found.name}" (${found.nis}) telah disetujui.`)
      setQuickRegId('')
      setTimeout(() => setQuickStatus(null), 4000)
    } else {
      setQuickStatus(`Siswa dengan ID Registrasi "${quickRegId}" belum ditemukan di daftar antrean.`)
      setTimeout(() => setQuickStatus(null), 4000)
    }
  }

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.nis.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.email && s.email.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const pendingCount = students.filter((s) => s.status === 'PENDING' || s.status === 'UNVERIFIED').length
  const verifiedCount = students.filter((s) => s.status === 'VERIFIED').length
  const rejectedCount = students.filter((s) => s.status === 'REJECTED').length

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-1">
            <span className="flex items-center gap-1.5 text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <span>Portal Resmi Institusi Pendidikan</span>
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Selamat Datang, {namaAdmin}!
          </h2>
          <p className="text-gray-500 text-xs sm:text-sm mt-0.5">
            Portal verifikasi siswa dan monitoring portofolio industri talenta {namaSekolah}.
          </p>
        </div>
      </div>

      <section className="bg-gradient-to-br from-[#FF9B71] to-[#ffb598] rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-lg border border-white/20">
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="relative z-10 flex flex-col gap-6">
          <div>
            <div className="flex items-center gap-2 text-white/90 text-xs font-bold uppercase tracking-wider mb-1">
              <Building2 className="w-4 h-4" />
              <span>Portal Verifikasi & Monitoring Sekolah Resmi</span>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">{namaSekolah}</h2>
              <span className="bg-white/20 backdrop-blur-md text-white text-[11px] font-extrabold px-3 py-1 rounded-full border border-white/30 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                <span>Terverifikasi Kemendikdasmen RI</span>
              </span>
            </div>
            {(dbSchool?.npsn || user?.npsn) && (
              <p className="text-xs text-white/90 font-mono font-bold mt-1.5">
                NPSN: {dbSchool?.npsn || user?.npsn}
              </p>
            )}
          </div>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 bg-white/30 px-5 py-3 rounded-2xl backdrop-blur-md shadow-xs">
                <Users className="w-5 h-5 text-white" />
                <div>
                  <div className="text-xl font-extrabold text-white">{students.length}</div>
                  <div className="text-[10px] text-white/80 font-bold uppercase tracking-wider">Total Siswa Terdaftar</div>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-white/30 px-5 py-3 rounded-2xl backdrop-blur-md shadow-xs">
                <UserCheck className="w-5 h-5 text-white" />
                <div>
                  <div className="text-xl font-extrabold text-white">{verifiedCount}</div>
                  <div className="text-[10px] text-white/80 font-bold uppercase tracking-wider">Siswa Aktif Terverifikasi</div>
                </div>
              </div>
              <button
                onClick={() => setIs2FAModalOpen(true)}
                className="flex items-center gap-2 bg-white text-[#964825] px-5 py-3 rounded-2xl font-bold text-sm shadow-xs hover:bg-[#FFF1EB] transition-colors cursor-pointer ml-auto"
              >
                <ShieldCheck className="w-4 h-4 text-[#FF9B71]" />
                <span>2FA Keamanan Sekolah</span>
              </button>
            </div>
          </div>
        </section>

      <section className="bg-white border border-[#E8E2DA] rounded-3xl p-6 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#FF9B71]" />
              <span>Verifikasi Cepat via ID Registrasi Siswa</span>
            </h3>
            <p className="text-xs text-gray-500">
              Guru / admin dapat langsung menyetujui siswa dengan memasukkan ID Registrasi yang dikirimkan siswa.
            </p>
          </div>
        </div>

        <form onSubmit={handleQuickApprove} className="flex flex-col sm:flex-row items-center gap-3 pt-1">
          <input
            type="text"
            placeholder="Ketik / tempel ID Registrasi siswa (contoh: MM-2026-89412)..."
            value={quickRegId}
            onChange={(e) => setQuickRegId(e.target.value)}
            className="h-11 flex-1 w-full bg-[#FAF8F5] border border-gray-200 focus:border-[#FF9B71] focus:bg-white rounded-xl px-4 text-xs font-mono font-bold outline-none transition-all"
          />
          <button
            type="submit"
            className="w-full sm:w-auto h-11 px-6 bg-[#FF9B71] hover:bg-[#F5865A] active:bg-[#E8754D] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors shrink-0 shadow-xs cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Setujui Siswa Ini</span>
          </button>
        </form>

        {quickStatus && (
          <div
            className={`p-3 rounded-xl text-xs font-bold animate-in fade-in ${
              quickStatus.startsWith('Berhasil')
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-amber-50 text-amber-800 border border-amber-200'
            }`}
          >
            {quickStatus}
          </div>
        )}
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#EAEAEA] shadow-xs flex flex-col gap-2">
          <div className="flex items-center gap-2 text-gray-500">
            <Clock className="w-4 h-4 text-[#FF9B71]" />
            <h3 className="font-bold text-xs uppercase tracking-wider">Menunggu Persetujuan</h3>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#964825]">{pendingCount}</div>
        </div>

        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#EAEAEA] shadow-xs flex flex-col gap-2">
          <div className="flex items-center gap-2 text-gray-500">
            <UserCheck className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-xs uppercase tracking-wider">Terverifikasi</h3>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700">{verifiedCount}</div>
        </div>

        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#EAEAEA] shadow-xs flex flex-col gap-2">
          <div className="flex items-center gap-2 text-gray-500">
            <ShieldAlert className="w-4 h-4 text-red-500" />
            <h3 className="font-bold text-xs uppercase tracking-wider">Ditolak</h3>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-red-700">{rejectedCount}</div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">Antrean Verifikasi Siswa</h3>
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama atau ID Registrasi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 pl-10 pr-4 bg-white border border-[#EAEAEA] rounded-xl text-xs outline-none focus:border-[#FF9B71]"
            />
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-[#EAEAEA] shadow-xs overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center text-gray-500 text-xs flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-[#FF9B71]" />
              <span>Memuat data siswa...</span>
            </div>
          ) : filteredStudents.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-[#EAEAEA]">
                    <th className="p-4 font-bold text-gray-600 text-xs uppercase tracking-wider">Nama Siswa</th>
                    <th className="p-4 font-bold text-gray-600 text-xs uppercase tracking-wider">ID Registrasi / NIS</th>
                    <th className="p-4 font-bold text-gray-600 text-xs uppercase tracking-wider">Kelas</th>
                    <th className="p-4 font-bold text-gray-600 text-xs uppercase tracking-wider">Tanggal Daftar</th>
                    <th className="p-4 font-bold text-gray-600 text-xs uppercase tracking-wider">Aksi / Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAEAEA]">
                  {filteredStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4 font-bold text-gray-900 text-sm">
                        {student.name}
                        {student.email && <div className="text-[11px] font-normal text-gray-400">{student.email}</div>}
                      </td>
                      <td className="p-4">
                        <span className="font-mono font-bold text-[#964825] bg-[#FFF1EB] border border-[#FFD9CA] px-2.5 py-1 rounded-lg text-xs">
                          {student.nis}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="bg-[#FFF1EB] text-[#964825] text-xs font-bold px-3 py-1 rounded-full border border-[#FFD9CA]">
                          {student.kelas}
                        </span>
                      </td>
                      <td className="p-4 text-gray-500 text-xs">{student.date}</td>
                      <td className="p-4">
                        {student.status === 'PENDING' || student.status === 'UNVERIFIED' ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleAction(student.id, 'VERIFIED')}
                              className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 px-3.5 py-1.5 rounded-xl flex items-center gap-1 text-xs font-bold transition-colors cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Setujui</span>
                            </button>
                            <button
                              onClick={() => handleAction(student.id, 'REJECTED')}
                              className="bg-red-100 text-red-700 hover:bg-red-200 px-3.5 py-1.5 rounded-xl flex items-center gap-1 text-xs font-bold transition-colors cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Tolak</span>
                            </button>
                          </div>
                        ) : student.status === 'VERIFIED' ? (
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200">
                             Terverifikasi
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-red-700 bg-red-100 px-3 py-1 rounded-full border border-red-200">
                             Ditolak
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-[#FFF1EB] text-[#964825] flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-extrabold text-gray-900 mb-1">Belum Ada Siswa Mendaftar</h4>
              <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
                Siswa yang mendaftar dan memilih nama sekolah Anda saat registrasi akan otomatis masuk ke antrean verifikasi ini.
              </p>
            </div>
          )}
        </div>
      </section>
      
      <TwoFactorModal
        userId={user?.id || 'sekolah-active'}
        userName={namaSekolah}
        userRole="sekolah"
        isOpen={is2FAModalOpen}
        onClose={() => setIs2FAModalOpen(false)}
      />
    </div>
  )
}
