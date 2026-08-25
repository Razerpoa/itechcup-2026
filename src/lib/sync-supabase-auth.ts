import { supabaseAdmin } from './supabase'

export async function createSupabaseAuthUser(payload: {
  email: string
  password?: string
  nama: string
  role: 'pelajar' | 'umkm' | 'sekolah'
}) {
  try {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: payload.email.trim().toLowerCase(),
      password: payload.password || 'password123',
      email_confirm: true,
      user_metadata: {
        full_name: payload.nama,
        display_name: payload.nama,
        role: payload.role
      }
    })

    if (error) {
      // Jika email sudah ada di Supabase Auth, tidak apa-apa
      return null
    }

    return data.user
  } catch {
    return null
  }
}
