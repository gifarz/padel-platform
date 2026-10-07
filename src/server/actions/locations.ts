'use server'
import { revalidatePath } from 'next/cache'
import type { Prisma } from '@prisma/client'
import { db } from '@/lib/db'
import { requireAdmin } from '@/server/guards'
import { revalidatePublicSite } from '@/server/revalidate'
import type { FormState } from '@/server/form-state'

const MAX_COURTS = 50

type LocationInput = {
  name: string
  city: string
  province: string
  address?: string
  lat?: number
  lng?: number
}

type LocationInputResult =
  | { success: false; error: string }
  // courtCount undefined = field not on the form, so leave the courts alone.
  | { success: true; data: LocationInput; courtCount?: number }

function readLocationInput(formData: FormData): LocationInputResult {
  const name = String(formData.get('name') ?? '').trim()
  const city = String(formData.get('city') ?? '').trim()
  const province = String(formData.get('province') ?? '').trim() || 'Jawa Barat'
  const address = String(formData.get('address') ?? '').trim() || undefined

  const latRaw = String(formData.get('lat') ?? '').trim()
  const lngRaw = String(formData.get('lng') ?? '').trim()
  const lat = latRaw ? Number(latRaw) : undefined
  const lng = lngRaw ? Number(lngRaw) : undefined

  const courtRaw = String(formData.get('courtCount') ?? '').trim()
  const courtCount = courtRaw === '' ? undefined : Number(courtRaw)

  if (!name || !city) return { success: false, error: 'Nama lokasi dan kota wajib diisi.' }
  if (lat !== undefined && Number.isNaN(lat)) return { success: false, error: 'Latitude tidak valid.' }
  if (lng !== undefined && Number.isNaN(lng)) return { success: false, error: 'Longitude tidak valid.' }
  if (courtCount !== undefined && (!Number.isInteger(courtCount) || courtCount < 0 || courtCount > MAX_COURTS)) {
    return { success: false, error: `Jumlah lapangan harus bilangan bulat 0–${MAX_COURTS}.` }
  }

  return { success: true, data: { name, city, province, address, lat, lng }, courtCount }
}

/**
 * Makes the number of ACTIVE courts at a venue equal `target`.
 * - Too few: re-activate previously deactivated courts first, then create new
 *   "Lapangan N" rows.
 * - Too many: drop the newest courts. A court that matches/competitions still
 *   point to is deactivated instead of deleted, so history stays intact.
 */
async function syncCourts(tx: Prisma.TransactionClient, locationId: string, target: number) {
  const courts = await tx.court.findMany({ where: { locationId }, orderBy: { name: 'asc' } })
  // Natural order ("Lapangan 2" before "Lapangan 10").
  courts.sort((a, b) => a.name.localeCompare(b.name, 'id', { numeric: true }))
  const active = courts.filter((c) => c.isActive)

  if (active.length < target) {
    let missing = target - active.length
    for (const c of courts.filter((c) => !c.isActive)) {
      if (missing === 0) break
      await tx.court.update({ where: { id: c.id }, data: { isActive: true } })
      missing--
    }
    const taken = new Set(courts.map((c) => c.name.toLowerCase()))
    let n = 1
    while (missing > 0) {
      const name = `Lapangan ${n++}`
      if (taken.has(name.toLowerCase())) continue
      await tx.court.create({ data: { name, locationId } })
      missing--
    }
  } else if (active.length > target) {
    for (const c of active.slice(target)) {
      const [matches, competitions] = await Promise.all([
        tx.match.count({ where: { courtId: c.id } }),
        tx.competition.count({ where: { courtId: c.id } }),
      ])
      if (matches + competitions > 0) await tx.court.update({ where: { id: c.id }, data: { isActive: false } })
      else await tx.court.delete({ where: { id: c.id } })
    }
  }
}

function afterLocationChange() {
  revalidatePath('/admin/locations')
  revalidatePath('/admin/competitions')
  revalidatePath('/admin/matches')
  // The landing page's "lapangan" stat counts active courts.
  revalidatePublicSite()
}

export async function createLocationAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin()
  const parsed = readLocationInput(formData)
  if (!parsed.success) return { error: parsed.error }
  const location = await db.$transaction(async (tx) => {
    const created = await tx.location.create({ data: parsed.data })
    if (parsed.courtCount) await syncCourts(tx, created.id, parsed.courtCount)
    return created
  })
  afterLocationChange()
  return { ok: `Lokasi "${location.name}" ditambahkan.` }
}

/** Same validation as createLocationAction, but returns the created row (not a redirect-style FormState) so a
 * caller like the competition form can add it to an in-memory <select> immediately without a full reload. */
export type QuickLocationResult = { error: string; location?: undefined } | { error?: undefined; location: { id: string; name: string; city: string } }

export async function createLocationQuickAction(formData: FormData): Promise<QuickLocationResult> {
  await requireAdmin()
  const parsed = readLocationInput(formData)
  if (!parsed.success) return { error: parsed.error }
  const location = await db.$transaction(async (tx) => {
    const created = await tx.location.create({ data: parsed.data })
    if (parsed.courtCount) await syncCourts(tx, created.id, parsed.courtCount)
    return created
  })
  afterLocationChange()
  return { location: { id: location.id, name: location.name, city: location.city } }
}

export async function updateLocationAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin()
  const id = String(formData.get('id') ?? '')
  if (!id) return { error: 'Lokasi tidak ditemukan.' }
  const parsed = readLocationInput(formData)
  if (!parsed.success) return { error: parsed.error }
  const location = await db.$transaction(async (tx) => {
    const updated = await tx.location.update({ where: { id }, data: parsed.data })
    if (parsed.courtCount !== undefined) await syncCourts(tx, id, parsed.courtCount)
    return updated
  })
  afterLocationChange()
  return { ok: `Lokasi "${location.name}" diperbarui.` }
}

export async function deleteLocationAction(id: string) {
  await requireAdmin()
  const inUse = await db.competition.count({ where: { locationId: id } })
  if (inUse > 0) throw new Error('Lokasi ini masih dipakai oleh kompetisi dan tidak bisa dihapus.')
  const matchesOnCourts = await db.match.count({ where: { court: { locationId: id } } })
  if (matchesOnCourts > 0) throw new Error('Lapangan di lokasi ini masih dipakai pertandingan, jadi lokasi tidak bisa dihapus.')
  await db.court.deleteMany({ where: { locationId: id } })
  await db.location.delete({ where: { id } })
  afterLocationChange()
}
