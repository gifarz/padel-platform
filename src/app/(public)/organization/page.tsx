import { PageBanner } from '@/components/public/page-banner'
import { OrgChart } from '@/components/public/org-chart'
import { getOrganizationMembers } from '@/server/queries'

export default async function OrganizationPage() {
  const members = await getOrganizationMembers()

  return (
    <div>
      <PageBanner
        eyebrow="Pengurus"
        title={<>PENGURUS<br />PBPI KABUPATEN GARUT</>}
        description="Struktur organisasi Pengurus Kabupaten Garut, Persatuan Besar Padel Indonesia."
      />

      <div className="section">
        <p className="section-title">Bagan Struktur Organisasi</p>
        <div className="mt-8">
          {members.length === 0 ? (
            <p className="text-sm text-muted">Struktur pengurus sedang disusun dan akan segera dipublikasikan.</p>
          ) : (
            <OrgChart members={members} />
          )}
        </div>
      </div>
    </div>
  )
}
