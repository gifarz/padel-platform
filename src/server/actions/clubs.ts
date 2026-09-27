'use server'
import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { requireAdmin } from '@/server/guards'
import { slugify } from '@/lib/slug'
import type { FormState } from '@/server/form-state'

export async function createClubAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin()
  try {
    const name = String(formData.get('name') ?? '').trim()
    if (!name) return { error: 'Nama klub wajib diisi.' }

    const districtId = String(formData.get('districtId') ?? '').trim() || undefined
    const description = String(formData.get('description') ?? '').trim() || undefined
    const address = String(formData.get('address') ?? '').trim() || undefined
    const phone = String(formData.get('phone') ?? '').trim() || undefined
    const instagram = String(formData.get('instagram') ?? '').trim() || undefined
    const website = String(formData.get('website') ?? '').trim() || undefined
    const logoUrl = String(formData.get('logoUrl') ?? '').trim() || undefined
    const isVerified = formData.get('isVerified') === 'on'

    const baseSlug = slugify(name)
    if (!baseSlug) return { error: 'Nama klub tidak valid untuk dibuatkan slug.' }
    let slug = baseSlug
    let n = 1
    while (await db.club.findUnique({ where: { slug } })) slug = `${baseSlug}-${++n}`

    await db.club.create({
      data: { name, slug, districtId, description, address, phone, instagram, website, logoUrl, isVerified },
    })
    revalidatePath('/admin/clubs')
    revalidatePath('/clubs')
    return { ok: `Klub "${name}" dibuat.` }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Gagal membuat klub.' }
  }
}

export async function toggleClubVerifiedAction(id: string, isVerified: boolean) {
  await requireAdmin()
  await db.club.update({ where: { id }, data: { isVerified } })
  revalidatePath('/admin/clubs')
  revalidatePath('/clubs')
}

export async function deleteClubAction(id: string) {
  await requireAdmin()
  // Members reference the club optionally, so this just detaches them rather
  // than cascading — losing a club record shouldn't lose athlete data.
  await db.athleteProfile.updateMany({ where: { clubId: id }, data: { clubId: null } })
  await db.club.delete({ where: { id } })
  revalidatePath('/admin/clubs')
  revalidatePath('/clubs')
}
