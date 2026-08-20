import { describe, it, mock, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import { lookupSchool } from './kemendikdasmen.ts'

const originalFetch = globalThis.fetch

beforeEach(() => {
  globalThis.fetch = originalFetch
})

describe('lookupSchool', () => {
  it('returns school data on success', async () => {
    globalThis.fetch = mock.fn(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        status_code: 200,
        message: 'success',
        total: 1,
        data: [{
          nama: 'SMP NEGERI 133 JAKARTA',
          npsn: '20106342',
          sekolah_id: 'C0F5E595-2BF5-E011-B37B-89DFD57B7D37',
          bentuk_pendidikan: 'SMP',
          status_sekolah: 'NEGERI',
          akreditasi: 'B',
          provinsi: 'Prov. D.K.I. Jakarta',
          kabupaten: 'Kab. Adm. Kep. Seribu',
          kecamatan: 'Kec. Kepulauan Seribu Utara',
          alamat_jalan: 'Jl. Pulau Pramuka Rt. 003 Rw. 05',
          kode_pos: '14530',
          nama_dusun: 'Pulau Pramuka',
          rt: 3,
          rw: 5,
          path_file: 'https://file.data.kemendikdasmen.go.id/...'
        }]
      })
    }) as any)

    const result = await lookupSchool('20106342')
    assert.equal(result.success, true)
    assert.equal(result.data?.nama, 'SMP NEGERI 133 JAKARTA')
  })

  it('returns error when NPSN not found', async () => {
    globalThis.fetch = mock.fn(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ status_code: 200, message: 'success', total: 0, data: [] })
    }) as any)

    const result = await lookupSchool('00000000')
    assert.equal(result.success, false)
    assert.equal(result.errorCode, 'ERR_NPSN_NOT_FOUND')
  })

  it('returns error on API failure', async () => {
    globalThis.fetch = mock.fn(() => Promise.resolve({ ok: false, status: 500 }) as any)
    const result = await lookupSchool('20106342')
    assert.equal(result.success, false)
    assert.equal(result.errorCode, 'ERR_API_UNAVAILABLE')
  })

  it('returns error on network timeout', async () => {
    globalThis.fetch = mock.fn(() => Promise.reject(new Error('timeout')))
    const result = await lookupSchool('20106342')
    assert.equal(result.success, false)
    assert.equal(result.errorCode, 'ERR_API_UNAVAILABLE')
  })
})
