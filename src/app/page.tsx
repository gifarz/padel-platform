import { Header } from '@/components/public/header'
import { Footer } from '@/components/public/footer'
import { Hero } from '@/components/public/hero'
import { OrganizationStats } from '@/components/public/organization-stats'
import { DistributionSection } from '@/components/public/distribution/distribution-section'
import { RankingSection } from '@/components/public/ranking/ranking-section'
import { TournamentSection } from '@/components/public/tournaments/tournament-section'
import { ClubSection } from '@/components/public/clubs/club-section'
import { NewsSection } from '@/components/public/news/news-section'
import { OrgIntro } from '@/components/public/org-intro'
import { StaffPreview } from '@/components/public/staff-preview'
import { CtaSection } from '@/components/public/cta-section'
import { ExploreSection } from '@/components/public/explore-section'
import { getPublicStats, getDistrictDistribution } from '@/server/queries'

export default async function LandingPage() {
  const [stats, distribution] = await Promise.all([getPublicStats(), getDistrictDistribution()])

  return (
    <div className="bg-bg text-ink">
      <Header />
      <main id="main-content">
        <Hero />
        <OrganizationStats stats={stats} />
        <ExploreSection />
        <RankingSection />
        <TournamentSection />
        <ClubSection />
        <DistributionSection rows={distribution} />
        <NewsSection />
        <OrgIntro />
        <StaffPreview />
        <CtaSection />
      </main>
      <Footer />
    </div>
  )
}
