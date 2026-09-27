import { AthleteNav } from '@/components/athlete/athlete-nav'
import { getMe } from '@/server/queries'
import { requireAthletePage } from '@/server/guards'

// Only ATHLETE accounts belong in this route group — a SUPER_ADMIN or staff
// (TRAINER/REFEREE) account that ends up here (e.g. after logging in) gets
// sent to the area that actually matches their role instead of a blank page.
export default async function AthleteLayout({ children }: { children: React.ReactNode }) {
  await requireAthletePage()
  const me = await getMe()
  return (
    <div className="min-h-screen">
      <AthleteNav username={me?.username ?? ''} initials={me?.avatarInitials ?? '-'} />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-8 sm:py-12">{children}</main>
    </div>
  )
}
