import Link from 'next/link'
import { requireStaffPage } from '@/server/guards'
import { logoutAction } from '@/server/actions/auth'

// TRAINER and REFEREE accounts land here — a minimal profile view, not the
// full athlete dashboard (they don't have a rating/matches history) and not
// the admin panel. requireStaffPage bounces anyone else to their own area.
export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  await requireStaffPage()
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur">
        <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-8">
          <Link href="/staff" className="font-display text-xl uppercase tracking-wide">
            PBPI<span className="text-accent"> Garut</span>
          </Link>
          <form action={logoutAction}>
            <button className="text-xs font-bold uppercase tracking-widest text-muted hover:text-ink">Keluar</button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-8 sm:py-14">{children}</main>
    </div>
  )
}
