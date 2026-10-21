/**
 * Competition rules shared by server actions and UI: labels, the allowed
 * status flow, and category constraints. Keeping the flow in one table means
 * the admin dropdown and the server-side validation can never disagree.
 */
export type CompetitionStatusKey = 'DRAFT' | 'REGISTRATION_OPEN' | 'REGISTRATION_CLOSED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED'

export const COMPETITION_STATUSES: CompetitionStatusKey[] = ['DRAFT', 'REGISTRATION_OPEN', 'REGISTRATION_CLOSED', 'ONGOING', 'COMPLETED', 'CANCELLED']

export const COMPETITION_STATUS_LABEL: Record<CompetitionStatusKey, string> = {
  DRAFT: 'Draf', REGISTRATION_OPEN: 'Pendaftaran dibuka', REGISTRATION_CLOSED: 'Pendaftaran ditutup',
  ONGOING: 'Berlangsung', COMPLETED: 'Selesai', CANCELLED: 'Dibatalkan',
}

/** Where a competition may go next. COMPLETED is terminal; CANCELLED can only go back to a draft. */
export const STATUS_TRANSITIONS: Record<CompetitionStatusKey, CompetitionStatusKey[]> = {
  DRAFT: ['REGISTRATION_OPEN', 'CANCELLED'],
  REGISTRATION_OPEN: ['REGISTRATION_CLOSED', 'CANCELLED'],
  REGISTRATION_CLOSED: ['REGISTRATION_OPEN', 'ONGOING', 'CANCELLED'],
  ONGOING: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: ['DRAFT'],
}

export const NEXT_STEP_HINT: Record<CompetitionStatusKey, string> = {
  DRAFT: 'Kompetisi ini masih draf dan belum tampil di situs. Buka pendaftaran supaya atlet bisa mendaftar.',
  REGISTRATION_OPEN: 'Atlet bisa mendaftar. Tutup pendaftaran kalau kuota/batas daftar sudah selesai, lalu konfirmasi peserta.',
  REGISTRATION_CLOSED: 'Konfirmasi peserta di tabel bawah, lalu buat bracket. Status otomatis menjadi "Berlangsung".',
  ONGOING: 'Verifikasi hasil tiap pertandingan di menu Pertandingan. Status menjadi "Selesai" otomatis setelah final diverifikasi.',
  COMPLETED: 'Kompetisi selesai.',
  CANCELLED: 'Kompetisi dibatalkan. Kamu bisa mengembalikannya ke draf.',
}

export const CATEGORY_LABEL: Record<string, string> = {
  MENS_DOUBLES: 'Ganda putra', WOMENS_DOUBLES: 'Ganda putri', MIXED_DOUBLES: 'Ganda campuran',
  MENS_SINGLES: 'Tunggal putra', WOMENS_SINGLES: 'Tunggal putri', OPEN: 'Terbuka',
}

export const CATEGORY_KEYS = ['MENS_DOUBLES', 'WOMENS_DOUBLES', 'MIXED_DOUBLES', 'MENS_SINGLES', 'WOMENS_SINGLES', 'OPEN'] as const
export type CategoryKey = (typeof CATEGORY_KEYS)[number]

export const isDoublesCategory = (c: string) => c === 'MENS_DOUBLES' || c === 'WOMENS_DOUBLES' || c === 'MIXED_DOUBLES'

/** Returns an error message if this athlete/partner gender combination isn't allowed in the category, else null. */
export function genderRuleError(category: string, athleteGender: string, partnerGender?: string | null): string | null {
  const men = category === 'MENS_DOUBLES' || category === 'MENS_SINGLES'
  const women = category === 'WOMENS_DOUBLES' || category === 'WOMENS_SINGLES'
  if (men && athleteGender !== 'MALE') return 'Kategori ini khusus putra.'
  if (women && athleteGender !== 'FEMALE') return 'Kategori ini khusus putri.'
  if (partnerGender) {
    if (men && partnerGender !== 'MALE') return 'Pasangan harus putra untuk kategori ini.'
    if (women && partnerGender !== 'FEMALE') return 'Pasangan harus putri untuk kategori ini.'
    if (category === 'MIXED_DOUBLES' && partnerGender === athleteGender) return 'Ganda campuran harus terdiri dari satu putra dan satu putri.'
  }
  return null
}

/** Registration is only really open while the status says so AND the deadline hasn't passed. */
export function isRegistrationOpen(c: { status: string; registrationDeadline: Date }, now = new Date()) {
  return c.status === 'REGISTRATION_OPEN' && now.getTime() <= c.registrationDeadline.getTime()
}
