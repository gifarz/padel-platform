'use client'
import { useActionState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { loginAction } from '@/server/actions/auth'

export default function LoginPage() {
  const [error, action, pending] = useActionState(loginAction, undefined)

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <Link href="/" aria-label="Kembali ke beranda PBPI Kabupaten Garut" className="mb-6">
        <Image src="/logo/logo-black.svg" alt="PBPI Kabupaten Garut" width={250} height={60} className="h-20 w-auto" priority />
      </Link>

      <form action={action} className="w-full max-w-sm border border-line bg-surface p-8">
        <h1 className="d text-4xl">Masuk</h1>
        <p className="mt-1 text-sm text-muted">Masuk ke akun PBPI Kab. Garut kamu.</p>

        <div className="mt-6 space-y-4">
          <div>
            <label htmlFor="phone" className="sr-only">Nomor HP</label>
            <input id="phone" name="phone" type="tel" required placeholder="Nomor HP" autoComplete="tel" className="w-full border border-line bg-bg px-4 py-2.5 text-sm placeholder:text-muted" />
          </div>
          <div>
            <label htmlFor="password" className="sr-only">Kata sandi</label>
            <input id="password" name="password" type="password" required placeholder="Kata sandi" autoComplete="current-password" className="w-full border border-line bg-bg px-4 py-2.5 text-sm placeholder:text-muted" />
          </div>
        </div>

        {error && <p role="alert" className="mt-4 text-sm text-accent">{error}</p>}

        <button disabled={pending} type="submit" className="mt-6 w-full border border-accent bg-accent py-3 text-xs font-bold uppercase tracking-widest text-bg disabled:opacity-50">
          {pending ? 'Memproses…' : 'Masuk'}
        </button>

        <p className="mt-5 text-center text-xs text-muted">
          Belum punya akun? <Link href="/register" className="text-accent">Lihat cara daftar</Link>
        </p>
      </form>
    </div>
  )
}
