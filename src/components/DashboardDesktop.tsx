'use client'

import { useState, useMemo } from 'react'
import { useDashboard } from '@/hooks/use-dashboard'
import { normalizeSchoolName } from '@/lib/normalize-school-name'
import type { DashboardViewProps } from '@/types'

const EMPTY_FORM = {
  namaSekolah: '',
  npsn: '',
  emailResmi: '',
  password: '',
  namaPenanggungJawab: '',
  alamatLengkap: '',
  kontakSekolah: '',
}

export function DashboardDesktop({ data }: DashboardViewProps) {
  useDashboard(data)

  const [form, setForm] = useState(EMPTY_FORM)
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)

  const namePreview = useMemo(() => {
    if (!form.namaSekolah) return null
    return normalizeSchoolName(form.namaSekolah)
  }, [form.namaSekolah])

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setResponse('')
    try {
      const res = await fetch('/api/sekolah', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const json = await res.json()
      setResponse(JSON.stringify(json, null, 2))
    } catch (err) {
      setResponse(JSON.stringify({ error: String(err) }, null, 2))
    } finally {
      setLoading(false)
    }
  }

  async function handleList() {
    setLoading(true)
    setResponse('')
    try {
      const res = await fetch('/api/sekolah')
      const json = await res.json()
      setResponse(JSON.stringify(json, null, 2))
    } catch (err) {
      setResponse(JSON.stringify({ error: String(err) }, null, 2))
    } finally {
      setLoading(false)
    }
  }

  async function handleListSiswa() {
    setLoading(true)
    setResponse('')
    try {
      const res = await fetch('/api/siswa')
      const json = await res.json()
      setResponse(JSON.stringify(json, null, 2))
    } catch (err) {
      setResponse(JSON.stringify({ error: String(err) }, null, 2))
    } finally {
      setLoading(false)
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  return (
    <div data-view="desktop" className="flex min-h-full flex-1 flex-col p-6 max-w-5xl mx-auto w-full gap-6">
      <h1 className="text-2xl font-bold">School Registration API Test</h1>

      <div className="flex gap-3">
        <button onClick={handleList} disabled={loading} className="rounded bg-gray-200 px-4 py-2 text-sm font-medium hover:bg-gray-300 disabled:opacity-50 dark:bg-gray-700 dark:hover:bg-gray-600">
          GET /api/sekolah
        </button>
        <button onClick={handleListSiswa} disabled={loading} className="rounded bg-gray-200 px-4 py-2 text-sm font-medium hover:bg-gray-300 disabled:opacity-50 dark:bg-gray-700 dark:hover:bg-gray-600">
          GET /api/siswa
        </button>
      </div>

      <form onSubmit={handleRegister} className="grid grid-cols-2 gap-4 rounded-lg border p-4 dark:border-gray-700">
        <h2 className="col-span-2 text-lg font-semibold">POST /api/sekolah — Register School</h2>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium">Nama Sekolah</span>
          <input name="namaSekolah" value={form.namaSekolah} onChange={handleChange} placeholder="Smkn 2 Tasikmalaya" className="rounded border px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800" />
          {namePreview && namePreview.normalized && (
            <span className="text-xs text-blue-600 dark:text-blue-400">
              Akan disimpan sebagai: <strong>{namePreview.normalized}</strong>
            </span>
          )}
          {namePreview && namePreview.error && (
            <span className="text-xs text-red-600 dark:text-red-400">
              {namePreview.error}
            </span>
          )}
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium">NPSN (8 digit)</span>
          <input name="npsn" value={form.npsn} onChange={handleChange} placeholder="20106342" className="rounded border px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800" />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium">Email Resmi</span>
          <input name="emailResmi" value={form.emailResmi} onChange={handleChange} placeholder="sekolah@go.id" className="rounded border px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800" />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium">Kata Sandi (min 8)</span>
          <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="securepass123" className="rounded border px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800" />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium">Nama Penanggung Jawab</span>
          <input name="namaPenanggungJawab" value={form.namaPenanggungJawab} onChange={handleChange} placeholder="Budi Santoso" className="rounded border px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800" />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium">Kontak Sekolah</span>
          <input name="kontakSekolah" value={form.kontakSekolah} onChange={handleChange} placeholder="081234567890" className="rounded border px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800" />
        </label>

        <label className="col-span-2 flex flex-col gap-1">
          <span className="text-xs font-medium">Alamat Lengkap</span>
          <textarea name="alamatLengkap" value={form.alamatLengkap} onChange={handleChange} placeholder="Jl. Test No.1, Kota Tasikmalaya" rows={2} className="rounded border px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800" />
        </label>

        <div className="col-span-2 flex gap-3">
          <button type="submit" disabled={loading} className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
            {loading ? 'Loading...' : 'Register School'}
          </button>
          <button type="button" onClick={() => { setForm(EMPTY_FORM); setResponse('') }} className="rounded bg-gray-200 px-4 py-2 text-sm font-medium hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600">
            Clear
          </button>
        </div>
      </form>

      {response && (
        <div className="rounded-lg border p-4 dark:border-gray-700">
          <h2 className="mb-2 text-lg font-semibold">Response</h2>
          <pre className="overflow-auto rounded bg-gray-50 p-4 text-xs max-h-96 dark:bg-gray-900">{response}</pre>
        </div>
      )}
    </div>
  )
}
