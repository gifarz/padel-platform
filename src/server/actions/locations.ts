'use server'
import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { requireAdmin } from '@/server/guards'
import type { FormState } from '@/server/form-state'

type LocationInput = {
  name: string
  city: string
  province: string
  address?: string
  lat?: number
  lng?: number
}

type LocationInputResult =
  | {
    success: false
    error: string
  }
  | {
    success: true
    data: LocationInput
  }

function readLocationInput(formData: FormData): LocationInputResult {
  const name = String(formData.get('name') ?? '').trim()
  const city = String(formData.get('city') ?? '').trim()

  const province =
    String(formData.get('province') ?? '').trim() || 'Jawa Barat'

  const address =
    String(formData.get('address') ?? '').trim() || undefined

  const latRaw = String(formData.get('lat') ?? '').trim()
  const lngRaw = String(formData.get('lng') ?? '').trim()

  const lat = latRaw ? Number(latRaw) : undefined
  const lng = lngRaw ? Number(lngRaw) : undefined

  if (!name || !city) {
    return {
      success: false,
      error: 'Nama lokasi dan kota wajib diisi.',
    }
  }

  if (lat !== undefined && Number.isNaN(lat)) {
    return {
      success: false,
      error: 'Latitude tidak valid.',
    }
  }

  if (lng !== undefined && Number.isNaN(lng)) {
    return {
      success: false,
      error: 'Longitude tidak valid.',
    }
  }

  return {
    success: true,
    data: {
      name,
      city,
      province,
      address,
      lat,
      lng,
    },
  }
}

function afterLocationChange() {
  revalidatePath('/admin/locations')
  revalidatePath('/admin/competitions')
}

export async function createLocationAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin()
  const parsed = readLocationInput(formData)
  if (!parsed.success) return { error: parsed.error }
  const location = await db.location.create({ data: parsed.data })
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
  const location = await db.location.create({ data: parsed.data })
  afterLocationChange()
  return { location: { id: location.id, name: location.name, city: location.city } }
}

export async function updateLocationAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin()
  const id = String(formData.get('id') ?? '')
  if (!id) return { error: 'Lokasi tidak ditemukan.' }
  const parsed = readLocationInput(formData)
  if (!parsed.success) return { error: parsed.error }
  const location = await db.location.update({ where: { id }, data: parsed.data })
  afterLocationChange()
  return { ok: `Lokasi "${location.name}" diperbarui.` }
}

export async function deleteLocationAction(id: string) {
  await requireAdmin()
  const inUse = await db.competition.count({ where: { locationId: id } })
  if (inUse > 0) throw new Error('Lokasi ini masih dipakai oleh kompetisi dan tidak bisa dihapus.')
  await db.court.deleteMany({ where: { locationId: id } })
  await db.location.delete({ where: { id } })
  afterLocationChange()
}
