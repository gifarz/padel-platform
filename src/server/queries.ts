/**
 * Read-side data access. Pages call these instead of touching `db` directly,
 * so the query shape lives in one place per feature.
 */
import type { Prisma } from '@prisma/client'
import { db } from '@/lib/db'
import { auth } from '@/auth'
import { levelForRating, pointsToNextLevel, levelMatch } from '@/lib/rating'
import { initials } from '@/lib/format'

const athleteCard = {
  include: {
    user: { select: { name: true } },
    district: { select: { name: true } },
    club: { select: { name: true } },
  },
} satisfies Prisma.AthleteProfileDefaultArgs
type AthleteCardRow = Prisma.AthleteProfileGetPayload<typeof athleteCard>

function toCard(a: AthleteCardRow) {
  return {
    id: a.id,
    username: a.username,
    name: a.user.name,
    // Prefer the new district relation; fall back to the legacy free-text
    // city field for rows created before the districts migration.
    city: a.district?.name ?? a.city ?? '-',
    club: a.club?.name ?? null,
    rating: a.rating,
    matchesPlayed: a.matchesPlayed,
    wins: a.wins,
    losses: a.losses,
    avatarInitials: initials(a.user.name),
    winRate: a.matchesPlayed ? Math.round((a.wins / a.matchesPlayed) * 100) : 0,
  }
}

/** The logged-in athlete's own card, or null if not signed in / not an athlete. */
export async function getMe() {
  const session = await auth()
  if (!session?.user?.athleteId) return null
  const a = await db.athleteProfile.findUnique({ where: { id: session.user.athleteId }, ...athleteCard })
  return a ? toCard(a) : null
}

/** Own trainer/referee profile for the /staff area — mirrors getMe() for athletes. */
export async function getMyStaffProfile() {
  const session = await auth()
  const userId = session?.user?.id
  const role = session?.user?.role
  if (!userId || (role !== 'TRAINER' && role !== 'REFEREE')) return null

  if (role === 'TRAINER') {
    const trainer = await db.trainerProfile.findUnique({
      where: { userId },
      include: { user: { select: { name: true, phone: true } }, district: { select: { name: true } } },
    })
    return trainer ? { role: 'TRAINER' as const, ...trainer } : null
  }
  const referee = await db.refereeProfile.findUnique({
    where: { userId },
    include: { user: { select: { name: true, phone: true } }, district: { select: { name: true } } },
  })
  return referee ? { role: 'REFEREE' as const, ...referee } : null
}

export async function getMyProfileForEdit() {
  const session = await auth()
  if (!session?.user?.athleteId) return null
  return db.athleteProfile.findUnique({
    where: { id: session.user.athleteId },
    select: { city: true, bio: true, dominantHand: true, preferredPosition: true },
  })
}

export async function requireMe() {
  const me = await getMe()
  if (!me) throw new Error('Masuk sebagai atlet dulu.')
  return me
}

// `city` here is really "the location filter value" — it matches either the
// new district relation or the legacy free-text city field.
function cityOrDistrictFilter(city: string | undefined): Prisma.AthleteProfileWhereInput | undefined {
  if (!city || city === 'Semua') return undefined
  return { OR: [{ district: { name: city } }, { city }] }
}

export async function getLeaderboard(opts: { city?: string; gender?: 'MALE' | 'FEMALE'; take?: number } = {}) {
  const rows = await db.athleteProfile.findMany({
    where: { ...(cityOrDistrictFilter(opts.city) ?? {}), ...(opts.gender ? { gender: opts.gender } : {}) },
    orderBy: { rating: 'desc' },
    take: opts.take ?? 100,
    ...athleteCard,
  })
  return rows.map(toCard)
}

const PAGE_SIZE = 10

export type AthleteFilters = { gender?: 'MALE' | 'FEMALE'; districtId?: string; clubId?: string; levelSlug?: string }

export async function getAthletesPage(query: string, page: number, filters: AthleteFilters = {}) {
  const where: Prisma.AthleteProfileWhereInput = {
    ...(query
      ? { OR: [{ user: { name: { contains: query, mode: 'insensitive' } } }, { city: { contains: query, mode: 'insensitive' } }, { district: { name: { contains: query, mode: 'insensitive' } } }] }
      : {}),
    ...(filters.gender ? { gender: filters.gender } : {}),
    ...(filters.districtId ? { districtId: filters.districtId } : {}),
    ...(filters.clubId ? { clubId: filters.clubId } : {}),
  }
  const [rows, total] = await Promise.all([
    db.athleteProfile.findMany({
      where, orderBy: { rating: 'desc' }, skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE,
      include: { user: { select: { name: true, isActive: true } }, district: { select: { name: true } }, club: { select: { name: true } } },
    }),
    db.athleteProfile.count({ where }),
  ])
  let cards = rows.map((a) => ({ ...toCard(a), isActive: a.user.isActive, gender: a.gender }))
  // Level is derived from rating, not stored — filter in memory after the page query
  // (fine at this scale; PAGE_SIZE is only 10 rows).
  if (filters.levelSlug) cards = cards.filter((a) => levelInfo(a.rating).level.slug === filters.levelSlug)
  return {
    rows: cards,
    total,
    pages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  }
}

/** Admin variant of getAthletesPage: includes the editable fields (phone, username, gender, district, club). */
export async function getAthletesAdminPage(query: string, page: number) {
  const where: Prisma.AthleteProfileWhereInput = query
    ? { OR: [
        { user: { name: { contains: query, mode: 'insensitive' } } },
        { username: { contains: query, mode: 'insensitive' } },
        { city: { contains: query, mode: 'insensitive' } },
        { district: { name: { contains: query, mode: 'insensitive' } } },
      ] }
    : {}
  const [rows, total] = await Promise.all([
    db.athleteProfile.findMany({
      where, orderBy: { rating: 'desc' }, skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE,
      include: { user: { select: { name: true, phone: true, isActive: true } }, district: { select: { name: true } }, club: { select: { name: true } } },
    }),
    db.athleteProfile.count({ where }),
  ])
  return {
    rows: rows.map((a) => ({
      ...toCard(a),
      phone: a.user.phone,
      gender: a.gender,
      districtId: a.districtId,
      clubId: a.clubId,
      isActive: a.user.isActive,
    })),
    total,
    pages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  }
}

/**
 * Most recent MATCH/CORRECTION delta per athlete — used as the ranking
 * page's up/down indicator. Done as one query + in-memory grouping rather
 * than a per-athlete query (Prisma has no "latest row per group" without
 * raw SQL) or a window-function raw query, which would be brittle across
 * Postgres versions.
 */
export async function getRecentTrends(athleteIds: string[]) {
  if (athleteIds.length === 0) return new Map<string, { trend: 'up' | 'down' | 'flat'; value: number }>()
  const rows = await db.ratingHistory.findMany({
    where: { athleteId: { in: athleteIds }, reason: { in: ['MATCH', 'CORRECTION'] } },
    orderBy: { createdAt: 'desc' },
    select: { athleteId: true, ratingDelta: true },
    take: athleteIds.length * 5, // enough rows that every athlete's latest entry is almost certainly present
  })
  const latest = new Map<string, number>()
  for (const r of rows) if (!latest.has(r.athleteId)) latest.set(r.athleteId, r.ratingDelta)
  return new Map(
    Array.from(latest.entries()).map(([id, delta]) => [
      id,
      { trend: (delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat') as 'up' | 'down' | 'flat', value: Math.abs(delta) },
    ]),
  )
}

// Combines the new district relation with any legacy free-text city values
// so the filter dropdown covers every athlete regardless of when they joined.
export async function getCities() {
  const [districtRows, cityRows] = await Promise.all([
    db.athleteProfile.findMany({ where: { districtId: { not: null } }, select: { district: { select: { name: true } } }, distinct: ['districtId'] }),
    db.athleteProfile.findMany({ where: { city: { not: null } }, select: { city: true }, distinct: ['city'] }),
  ])
  const names = new Set<string>()
  for (const r of districtRows) if (r.district) names.add(r.district.name)
  for (const r of cityRows) if (r.city) names.add(r.city)
  return ['Semua', ...Array.from(names).sort()]
}

/** Everyone except `me`, ranked by how close their rating is to `me`'s. */
export async function getDiscovery(opts: { city?: string; sort?: 'match' | 'rating' | 'active' } = {}) {
  const me = await requireMe()
  const cityFilter = cityOrDistrictFilter(opts.city)
  const rows = await db.athleteProfile.findMany({
    where: { id: { not: me.id }, ...(cityFilter ?? {}) },
    ...athleteCard,
  })
  let list = rows.map((a) => ({ ...toCard(a), match: levelMatch(me.rating, a.rating) }))
  if (opts.sort === 'rating') list = list.sort((a, b) => b.rating - a.rating)
  else if (opts.sort === 'active') list = list.sort((a, b) => b.matchesPlayed - a.matchesPlayed)
  else list = list.sort((a, b) => b.match - a.match)
  return list
}

const HAND_LABEL: Record<string, string> = { RIGHT: 'Kanan', LEFT: 'Kiri' }
const POSITION_LABEL: Record<string, string> = { LEFT: 'Kiri', RIGHT: 'Kanan', BOTH: 'Keduanya' }

export async function getAthleteByUsername(username: string) {
  const a = await db.athleteProfile.findUnique({
    where: { username },
    include: { user: { select: { name: true } }, district: { select: { name: true } }, club: { select: { name: true } } },
  })
  if (!a) return null
  return {
    ...toCard(a),
    bio: a.bio,
    dominantHand: a.dominantHand ? HAND_LABEL[a.dominantHand] : null,
    preferredPosition: a.preferredPosition ? POSITION_LABEL[a.preferredPosition] : null,
  }
}

export function levelInfo(rating: number) {
  return { level: levelForRating(rating), next: pointsToNextLevel(rating) }
}

const matchRow = {
  include: {
    participants: { include: { athlete: { include: { user: { select: { name: true } } } } } },
    court: { include: { location: true } },
  },
} satisfies Prisma.MatchDefaultArgs
type MatchWithParticipants = Prisma.MatchGetPayload<typeof matchRow>

function opponentSummary(match: MatchWithParticipants, meAthleteId: string) {
  const mine = match.participants.find((p) => p.athleteId === meAthleteId)
  const others = match.participants.filter((p) => p.athleteId !== meAthleteId)
  const label = others.map((p) => p.athlete.user.name).join(' & ') || '-'
  const delta = mine?.ratingDelta ?? null
  const result: 'W' | 'L' | undefined = mine?.ratingDelta != null ? (mine.ratingDelta >= 0 ? 'W' : 'L') : undefined
  return { label, delta, result }
}

export async function getMyMatches() {
  const me = await requireMe()
  const matches = await db.match.findMany({
    where: { participants: { some: { athleteId: me.id } } },
    orderBy: [{ scheduledAt: 'desc' }, { createdAt: 'desc' }],
    ...matchRow,
  })
  return matches.map((m) => ({
    id: m.id,
    status: m.status,
    date: m.scheduledAt ?? m.playedAt ?? null,
    court: m.court ? `${m.court.name}, ${m.court.location.name}` : null,
    canAccept: m.status === 'REQUESTED' && m.requestedById !== me.id,
    canSubmitResult: m.status === 'ACCEPTED' || m.status === 'SCHEDULED',
    ...opponentSummary(m, me.id),
  }))
}

/** Public match history for any athlete's profile — verified matches only. */
export async function getVerifiedMatches(athleteId: string, take = 10) {
  const matches = await db.match.findMany({
    where: { participants: { some: { athleteId } }, status: 'VERIFIED' },
    orderBy: { verifiedAt: 'desc' },
    take,
    ...matchRow,
  })
  return matches.map((m) => ({
    id: m.id,
    date: m.verifiedAt,
    court: m.court ? `${m.court.name}, ${m.court.location.name}` : null,
    ...opponentSummary(m, athleteId),
  }))
}

export async function getPendingVerifications() {
  const matches = await db.match.findMany({ where: { status: 'PENDING_VERIFICATION' }, ...matchRow })
  return matches.map((m) => ({
    id: m.id,
    date: m.playedAt,
    court: m.court ? `${m.court.name}, ${m.court.location.name}` : null,
    sets: m.sets as number[][] | null,
    winnerTeam: m.winnerTeam,
    teamA: m.participants.filter((p) => p.team === 'A').map((p) => p.athlete.user.name).join(' & '),
    teamB: m.participants.filter((p) => p.team === 'B').map((p) => p.athlete.user.name).join(' & '),
  }))
}

export async function getAdminStats() {
  const startOfMonth = new Date(); startOfMonth.setDate(1); startOfMonth.setHours(0, 0, 0, 0)
  const [totalAthletes, activeCompetitions, matchesThisMonth, pendingResults, trainers, referees] = await Promise.all([
    db.athleteProfile.count(),
    db.competition.count({ where: { status: { in: ['REGISTRATION_OPEN', 'ONGOING'] } } }),
    db.match.count({ where: { createdAt: { gte: startOfMonth } } }),
    db.match.count({ where: { status: 'PENDING_VERIFICATION' } }),
    db.trainerProfile.count(),
    db.refereeProfile.count(),
  ])
  return { totalAthletes, activeCompetitions, matchesThisMonth, pendingResults, trainers, referees }
}

export async function getLocations() {
  return db.location.findMany({ orderBy: { city: 'asc' }, include: { courts: true } })
}

/** Locations for the admin list — includes how many competitions use each one, to warn before deletion. */
export async function getLocationsAdmin() {
  return db.location.findMany({
    orderBy: [{ city: 'asc' }, { name: 'asc' }],
    include: { courts: true, _count: { select: { competitions: true } } },
  })
}

/** Active Kabupaten Garut kecamatan, for registration/filter dropdowns. */
export async function getDistricts() {
  return db.district.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } })
}

/** All 42 kecamatan including inactive ones, for the admin toggle list. */
export async function getDistrictsAdmin() {
  return db.district.findMany({ orderBy: { name: 'asc' } })
}

/** Clubs available for the (optional) club picker on registration. */
export async function getClubsForPicker() {
  return db.club.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true, districtId: true } })
}

export async function getCompetitions() {
  return db.competition.findMany({
    orderBy: { startsAt: 'asc' },
    include: { location: true, _count: { select: { participants: { where: { status: { in: ['REGISTERED', 'CONFIRMED'] } } } } } },
  })
}

export async function getCompetitionDetail(id: string) {
  return db.competition.findUnique({
    where: { id },
    include: {
      location: true,
      participants: {
        include: {
          athlete: { include: { user: { select: { name: true } } } },
          partner: { include: { user: { select: { name: true } } } },
        },
        orderBy: { registeredAt: 'asc' },
      },
    },
  })
}

export async function getAthleteAdminDetail(athleteProfileId: string) {
  const [athlete, history, matches, competitions] = await Promise.all([
    db.athleteProfile.findUnique({
      where: { id: athleteProfileId },
      include: { user: { select: { name: true, phone: true, isActive: true, createdAt: true } } },
    }),
    db.ratingHistory.findMany({ where: { athleteId: athleteProfileId }, orderBy: { createdAt: 'desc' }, take: 20 }),
    db.match.count({ where: { participants: { some: { athleteId: athleteProfileId } } } }),
    db.competitionParticipant.findMany({
      where: { athleteId: athleteProfileId },
      include: { competition: { select: { name: true, status: true } } },
    }),
  ])
  return athlete ? { athlete, history, matchCount: matches, competitions } : null
}

export async function getPublicCompetitions() {
  return db.competition.findMany({
    where: { status: { in: ['REGISTRATION_OPEN', 'REGISTRATION_CLOSED', 'ONGOING'] } },
    orderBy: { startsAt: 'asc' },
    include: { location: true, _count: { select: { participants: { where: { status: { in: ['REGISTERED', 'CONFIRMED'] } } } } } },
  })
}

export async function getPublicCompetitionDetail(id: string) {
  const me = await getMe()
  const competition = await db.competition.findUnique({
    where: { id },
    include: {
      location: true,
      participants: {
        where: { status: { in: ['REGISTERED', 'CONFIRMED', 'WINNER'] } },
        include: { athlete: { include: { user: { select: { name: true } } } } },
        orderBy: { registeredAt: 'asc' },
      },
    },
  })
  if (!competition) return null
  const confirmedCount = competition.participants.length
  const myEntry = me ? competition.participants.find((p) => p.athleteId === me.id) : undefined
  return { competition, confirmedCount, isRegistered: !!myEntry, myStatus: myEntry?.status }
}

export async function getCompetitionBracket(competitionId: string) {
  const matches = await db.match.findMany({
    where: { competitionId, round: { not: null } },
    include: { participants: { include: { athlete: { include: { user: { select: { name: true } } } } } } },
    orderBy: [{ round: 'asc' }, { bracketSlot: 'asc' }],
  })
  if (matches.length === 0) return null

  const rounds = new Map<number, typeof matches>()
  for (const m of matches) {
    const r = m.round!
    if (!rounds.has(r)) rounds.set(r, [])
    rounds.get(r)!.push(m)
  }
  return Array.from(rounds.entries())
    .sort(([a], [b]) => a - b)
    .map(([round, ms]) => ({
      round,
      matches: ms.map((m) => ({
        id: m.id,
        status: m.status,
        winnerTeam: m.winnerTeam,
        teamA: m.participants.filter((p) => p.team === 'A').map((p) => p.athlete.user.name).join(' & ') || 'TBD',
        teamB: m.participants.filter((p) => p.team === 'B').map((p) => p.athlete.user.name).join(' & ') || (m.status === 'VERIFIED' ? 'BYE' : 'TBD'),
      })),
    }))
}

export async function getTrainers() {
  return db.trainerProfile.findMany({
    include: { user: { select: { name: true, phone: true } }, district: { select: { name: true } } },
    orderBy: { yearsExp: 'desc' },
  })
}

export async function getReferees() {
  return db.refereeProfile.findMany({
    include: {
      user: { select: { name: true, phone: true } },
      district: { select: { name: true } },
      _count: { select: { matches: true } },
    },
    orderBy: { yearsExp: 'desc' },
  })
}

/** No auth required — powers the public landing page. */
export async function getPublicStats() {
  const [players, matchesPlayed, activeCompetitions, courts, clubs, activeDistricts] = await Promise.all([
    db.athleteProfile.count(),
    db.match.count({ where: { status: 'VERIFIED' } }),
    db.competition.count({ where: { status: { in: ['REGISTRATION_OPEN', 'ONGOING'] } } }),
    db.court.count({ where: { isActive: true } }),
    db.club.count(),
    db.athleteProfile.findMany({ where: { districtId: { not: null } }, select: { districtId: true }, distinct: ['districtId'] }),
  ])
  return { players, matchesPlayed, activeCompetitions, courts, clubs, activeDistricts: activeDistricts.length }
}

/**
 * Player + club counts per kecamatan — single source of truth for both the
 * homepage distribution ranking and the (upcoming) interactive Garut map.
 */
export async function getDistrictDistribution() {
  const districts = await db.district.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      slug: true,
      _count: { select: { athletes: true, clubs: true } },
    },
    orderBy: { name: 'asc' },
  })
  return districts.map((d) => ({
    districtId: d.id,
    district: d.name,
    slug: d.slug,
    players: d._count.athletes,
    clubs: d._count.clubs,
  }))
}

/** Active pengurus (organization structure), ordered for display. */
export async function getOrganizationMembers() {
  return db.organizationMember.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  })
}

/** All pengurus rows (including inactive) for the admin list. */
export async function getOrganizationMembersAdmin() {
  return db.organizationMember.findMany({ orderBy: { sortOrder: 'asc' } })
}

/** Paginated published news for the /news listing. */
export async function getNewsList(page = 1, pageSize = 9) {  const where = { isPublished: true } as const
  const [total, rows] = await Promise.all([
    db.news.count({ where }),
    db.news.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ])
  return { rows, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) }
}

export async function getNewsBySlug(slug: string) {
  return db.news.findFirst({
    where: { slug, isPublished: true },
    include: { author: { select: { name: true } } },
  })
}

/** All news rows (draft + published) for the admin list. */
export async function getNewsAdmin() {
  return db.news.findMany({ orderBy: { createdAt: 'desc' } })
}

/** Clubs for the homepage preview + /clubs directory, newest-verified first. */
export async function getClubsPreview(take = 4) {
  return db.club.findMany({
    take,
    orderBy: [{ isVerified: 'desc' }, { createdAt: 'desc' }],
    include: { district: { select: { name: true } }, _count: { select: { members: true } } },
  })
}

/** Full club directory for /clubs, optionally filtered by kecamatan. */
export async function getClubsDirectory(districtId?: string) {
  return db.club.findMany({
    where: districtId ? { districtId } : undefined,
    orderBy: [{ isVerified: 'desc' }, { name: 'asc' }],
    include: { district: { select: { name: true } }, _count: { select: { members: true } } },
  })
}

/** Every club for the admin list (same shape as the public directory query). */
export async function getClubsAdmin() {
  return getClubsDirectory()
}

export async function getClubBySlug(slug: string) {
  const club = await db.club.findUnique({
    where: { slug },
    include: {
      district: { select: { name: true } },
      members: {
        orderBy: { rating: 'desc' },
        include: { user: { select: { name: true } } },
        take: 50,
      },
    },
  })
  if (!club) return null
  return {
    ...club,
    members: club.members.map((m) => ({ id: m.id, username: m.username, name: m.user.name, rating: m.rating })),
  }
}

/** Published news for the homepage preview + /news listing. */
export async function getLatestNews(take = 3) {
  return db.news.findMany({
    where: { isPublished: true },
    take,
    orderBy: { publishedAt: 'desc' },
  })
}

/** Upcoming tournaments — same underlying Competition model, public framing. */
export async function getUpcomingTournaments(take = 3) {
  return db.competition.findMany({
    where: { status: { in: ['REGISTRATION_OPEN', 'REGISTRATION_CLOSED', 'ONGOING'] } },
    orderBy: { startsAt: 'asc' },
    take,
    include: { location: true, _count: { select: { participants: { where: { status: { in: ['REGISTERED', 'CONFIRMED'] } } } } } },
  })
}

/** All matches for the admin CRUD table (newest first), optionally filtered by status. */
export async function getMatchesAdmin(status?: Prisma.MatchWhereInput['status'], take = 100) {
  const matches = await db.match.findMany({
    where: status ? { status } : undefined,
    orderBy: [{ scheduledAt: { sort: 'desc', nulls: 'last' } }, { createdAt: 'desc' }],
    take,
    include: {
      participants: { include: { athlete: { include: { user: { select: { name: true } } } } } },
      court: { include: { location: { select: { name: true } } } },
      referee: { include: { user: { select: { name: true } } } },
      trainer: { include: { user: { select: { name: true } } } },
      competition: { select: { name: true } },
    },
  })
  return matches.map((m) => {
    const team = (t: 'A' | 'B') => m.participants.filter((p) => p.team === t).map((p) => ({ id: p.athleteId, name: p.athlete.user.name }))
    return {
      id: m.id,
      status: m.status,
      teamA: team('A'),
      teamB: team('B'),
      sets: m.sets as number[][] | null,
      winnerTeam: m.winnerTeam,
      scheduledAt: m.scheduledAt ? m.scheduledAt.toISOString() : null,
      courtId: m.courtId,
      courtLabel: m.court ? `${m.court.name} · ${m.court.location.name}` : null,
      refereeId: m.refereeId,
      refereeName: m.referee?.user.name ?? null,
      trainerId: m.trainerId,
      trainerName: m.trainer?.user.name ?? null,
      competitionName: m.competition?.name ?? null,
      isBracket: m.competitionId != null && m.round != null,
      cancelReason: m.cancelReason,
    }
  })
}

/** Dropdown options for the admin match form. */
export async function getMatchFormOptions() {
  const [athletes, courts, referees, trainers] = await Promise.all([
    db.athleteProfile.findMany({ orderBy: { user: { name: 'asc' } }, select: { id: true, username: true, user: { select: { name: true } } } }),
    db.court.findMany({ where: { isActive: true }, orderBy: [{ location: { name: 'asc' } }, { name: 'asc' }], select: { id: true, name: true, location: { select: { name: true } } } }),
    db.refereeProfile.findMany({ where: { status: 'ACTIVE' }, orderBy: { user: { name: 'asc' } }, select: { id: true, user: { select: { name: true } } } }),
    db.trainerProfile.findMany({ where: { status: 'ACTIVE' }, orderBy: { user: { name: 'asc' } }, select: { id: true, user: { select: { name: true } } } }),
  ])
  return {
    athletes: athletes.map((a) => ({ id: a.id, label: `${a.user.name} (@${a.username})` })),
    courts: courts.map((c) => ({ id: c.id, label: `${c.name} · ${c.location.name}` })),
    referees: referees.map((r) => ({ id: r.id, label: r.user.name })),
    trainers: trainers.map((t) => ({ id: t.id, label: t.user.name })),
  }
}
