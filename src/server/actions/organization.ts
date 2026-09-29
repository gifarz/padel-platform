'use server'
import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { requireAdmin } from '@/server/guards'
import { revalidatePublicSite } from '@/server/revalidate'
import type { FormState } from '@/server/form-state'

export async function createMemberAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin()
  try {
    const name = String(formData.get('name') ?? '').trim()
    const position = String(formData.get('position') ?? '').trim()
    if (!name || !position) return { error: 'Nama dan jabatan wajib diisi.' }

    const division = String(formData.get('division') ?? '').trim() || undefined
    const photoUrl = String(formData.get('photoUrl') ?? '').trim() || undefined
    const sortOrder = Number(formData.get('sortOrder') ?? 0) || 0

    await db.organizationMember.create({ data: { name, position, division, photoUrl, sortOrder } })
    revalidatePath('/admin/organization')
    revalidatePath('/organization')
    revalidatePublicSite()
    return { ok: `Pengurus "${name}" ditambahkan.` }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Gagal menambahkan pengurus.' }
  }
}

export async function toggleMemberActiveAction(id: string, isActive: boolean) {
  await requireAdmin()
  await db.organizationMember.update({ where: { id }, data: { isActive } })
  revalidatePath('/admin/organization')
  revalidatePath('/organization')
  revalidatePublicSite()
}

export async function deleteMemberAction(id: string) {
  await requireAdmin()
  await db.organizationMember.delete({ where: { id } })
  revalidatePath('/admin/organization')
  revalidatePath('/organization')
  revalidatePublicSite()
}
