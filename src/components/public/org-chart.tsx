/**
 * Bagan struktur pengurus. Hierarchy is derived from what the admin already
 * enters (jabatan + divisi + urutan), so no extra "parent" field is needed:
 *   1. Ketua (tanpa divisi)
 *   2. Wakil Ketua / Sekretaris / Bendahara (tanpa divisi)
 *   3. Divisi — satu kolom per divisi, anggota diurutkan menurut "urutan tampil"
 * Anggota tanpa divisi dan bukan jabatan inti dikelompokkan ke "Anggota Pengurus".
 */
export interface OrgMember {
  id: string
  name: string
  position: string
  division: string | null
  photoUrl: string | null
  sortOrder: number
}

const norm = (s: string) => s.trim().toLowerCase()
const isChair = (p: string) => /^ketua( umum)?$/.test(norm(p))
const isCore = (p: string) => /^(wakil ketua|sekretaris|bendahara)/.test(norm(p))
const CORE_ORDER = ['wakil ketua', 'sekretaris', 'bendahara']
const coreRank = (p: string) => {
  const i = CORE_ORDER.findIndex((k) => norm(p).startsWith(k))
  return i === -1 ? CORE_ORDER.length : i
}
const bySort = (a: OrgMember, b: OrgMember) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, 'id')

export function buildOrgTree(members: OrgMember[]) {
  const chairs: OrgMember[] = []
  const core: OrgMember[] = []
  const divisions = new Map<string, OrgMember[]>()

  for (const m of members) {
    const division = m.division?.trim()
    if (division) divisions.set(division, [...(divisions.get(division) ?? []), m])
    else if (isChair(m.position)) chairs.push(m)
    else if (isCore(m.position)) core.push(m)
    else divisions.set('Anggota Pengurus', [...(divisions.get('Anggota Pengurus') ?? []), m])
  }

  return {
    chairs: chairs.sort(bySort),
    core: core.sort((a, b) => coreRank(a.position) - coreRank(b.position) || bySort(a, b)),
    divisions: Array.from(divisions.entries())
      .map(([name, list]) => ({ name, members: list.sort(bySort), order: Math.min(...list.map((m) => m.sortOrder)) }))
      .sort((a, b) => (a.name === 'Anggota Pengurus' ? 1 : b.name === 'Anggota Pengurus' ? -1 : a.order - b.order || a.name.localeCompare(b.name, 'id'))),
  }
}

function Avatar({ m, size }: { m: OrgMember; size: 'lg' | 'sm' }) {
  const box = size === 'lg' ? 'h-16 w-16 text-lg' : 'h-10 w-10 text-xs'
  return (
    <span className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-line bg-surface font-display font-bold text-navy ${box}`}>
      {m.photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={m.photoUrl} alt="" className="h-full w-full object-cover" />
      ) : (
        m.name.slice(0, 2).toUpperCase()
      )}
    </span>
  )
}

function Node({ m, highlight }: { m: OrgMember; highlight?: boolean }) {
  return (
    <div className={`flex w-52 flex-col items-center gap-2 rounded-2xl border bg-white p-4 text-center ${highlight ? 'border-navy shadow-card' : 'border-line'}`}>
      <Avatar m={m} size="lg" />
      <p className="font-display text-sm font-bold leading-tight text-ink">{m.name}</p>
      <p className={`lb ${highlight ? 'text-accent' : ''}`}>{m.position}</p>
    </div>
  )
}

const Stem = () => <div className="org-stem" aria-hidden="true" />

export function OrgChart({ members }: { members: OrgMember[] }) {
  const { chairs, core, divisions } = buildOrgTree(members)
  if (members.length === 0) return null

  return (
    <div className="overflow-x-auto pb-4" role="group" aria-label="Bagan struktur pengurus">
      <div className="org-chart mx-auto flex w-max min-w-full flex-col items-center">
        {chairs.length > 0 && (
          <div className="flex flex-wrap justify-center gap-4">
            {chairs.map((m) => <Node key={m.id} m={m} highlight />)}
          </div>
        )}

        {core.length > 0 && (
          <>
            {chairs.length > 0 && <Stem />}
            <div className={`org-row ${chairs.length === 0 ? 'org-row--top' : ''}`}>
              {core.map((m) => (
                <div key={m.id} className="org-item"><Node m={m} highlight /></div>
              ))}
            </div>
          </>
        )}

        {divisions.length > 0 && (
          <>
            {(chairs.length > 0 || core.length > 0) && <Stem />}
            <div className={`org-row ${chairs.length === 0 && core.length === 0 ? 'org-row--top' : ''}`}>
              {divisions.map((d) => (
                <div key={d.name} className="org-item">
                  <div className="w-56 overflow-hidden rounded-2xl border border-line bg-white">
                    <p className="bg-navy px-4 py-3 text-center text-xs font-bold uppercase tracking-widest text-white">{d.name}</p>
                    <ul className="divide-y divide-line">
                      {d.members.map((m) => (
                        <li key={m.id} className="flex items-center gap-3 px-4 py-3">
                          <Avatar m={m} size="sm" />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-ink">{m.name}</p>
                            <p className="truncate text-[0.7rem] text-muted">{m.position}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
