import { PageBanner } from '@/components/public/page-banner'
import { getOrganizationMembers } from '@/server/queries'

// Leadership positions rendered as a highlighted top row; everything else
// is grouped by division underneath.
const LEADERSHIP = ['Ketua', 'Wakil Ketua', 'Sekretaris', 'Bendahara']

export default async function OrganizationPage() {
  const members = await getOrganizationMembers()
  const leadership = members.filter((m) => LEADERSHIP.includes(m.position))
  const rest = members.filter((m) => !LEADERSHIP.includes(m.position))

  const divisions = new Map<string, typeof rest>()
  for (const m of rest) {
    const key = m.division ?? 'Lainnya'
    divisions.set(key, [...(divisions.get(key) ?? []), m])
  }

  return (
    <div>
      <PageBanner
        eyebrow="Pengurus"
        title={<>PENGURUS<br />PBPI KABUPATEN GARUT</>}
        description="Struktur organisasi Pengurus Kabupaten Garut, Persatuan Besar Padel Indonesia."
      />

      <div className="section">
        {members.length === 0 ? (
          <p className="text-sm text-muted">Struktur pengurus sedang disusun dan akan segera dipublikasikan.</p>
        ) : (
          <>
            {leadership.length > 0 && (
              <div className="mb-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {leadership
                  .sort((a, b) => LEADERSHIP.indexOf(a.position) - LEADERSHIP.indexOf(b.position))
                  .map((m) => <MemberCard key={m.id} member={m} highlight />)}
              </div>
            )}

            {Array.from(divisions.entries()).map(([division, list]) => (
              <div key={division} className="mb-10">
                <p className="section-title">{division}</p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {list.map((m) => <MemberCard key={m.id} member={m} />)}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}

function MemberCard({ member, highlight }: { member: { id: string; name: string; position: string; photoUrl: string | null }; highlight?: boolean }) {
  return (
    <div className={`card flex flex-col items-center gap-2 p-5 text-center ${highlight ? 'border-navy' : ''}`}>
      <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-line bg-surface">
        {member.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={member.photoUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="d text-lg text-navy">{member.name.slice(0, 2).toUpperCase()}</span>
        )}
      </div>
      <p className="font-display text-sm font-bold text-ink">{member.name}</p>
      <p className={`lb ${highlight ? 'text-accent' : ''}`}>{member.position}</p>
    </div>
  )
}
