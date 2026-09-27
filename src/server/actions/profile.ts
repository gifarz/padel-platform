'use server'
import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { requireAthlete } from '@/server/guards'
import type { FormState } from '@/server/form-state'

export async function updateMyProfileAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const { athleteId } = await requireAthlete()

  const city = String(formData.get('city') ?? '').trim()
  const bio = String(formData.get('bio') ?? '').trim()
  const dominantHand = String(formData.get('dominantHand') ?? '') || null
  const preferredPosition = String(formData.get('preferredPosition') ?? '') || null

  if (!city) return { error: 'Kota tidak boleh kosong.' }
  if (bio.length > 300) return { error: 'Bio maksimal 300 karakter.' }

  await db.athleteProfile.update({
    where: { id: athleteId },
    data: {
      city,
      bio: bio || null,
      dominantHand: dominantHand as 'RIGHT' | 'LEFT' | null,
      preferredPosition: preferredPosition as 'LEFT' | 'RIGHT' | 'BOTH' | null,
    },
  })

  revalidatePath('/settings')
  revalidatePath('/dashboard')
  const me = await db.athleteProfile.findUnique({ where: { id: athleteId }, select: { username: true } })
  if (me) revalidatePath(`/profile/${me.username}`)

  return { ok: 'Profil tersimpan.' }
}
