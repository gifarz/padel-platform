'use server'
import { AuthError } from 'next-auth'
import { signIn, signOut } from '@/auth'
import { normalizeIndonesianPhone } from '@/lib/phone'
import { isRateLimited } from '@/lib/rate-limit'

export async function loginAction(_prev: string | undefined, formData: FormData) {
  const rawPhone = String(formData.get('phone') ?? '').trim()
  const phone = normalizeIndonesianPhone(rawPhone)
  if (!phone) return 'Nomor HP tidak valid.'
  if (isRateLimited(`login:${phone}`)) return 'Terlalu banyak percobaan gagal. Coba lagi dalam 15 menit.'

  try {
    await signIn('credentials', {
      phone,
      password: formData.get('password'),
      redirectTo: '/dashboard',
    })
  } catch (err) {
    if (err instanceof AuthError) return 'Nomor HP atau kata sandi salah.'
    throw err // NextAuth throws a redirect internally on success — let it through
  }
  return undefined
}

export async function logoutAction() {
  await signOut({ redirectTo: '/login' })
}
