'use server'
import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { requireAdmin } from '@/server/guards'
import { revalidatePublicSite } from '@/server/revalidate'
import { sanitizeImageUrl } from '@/lib/uploads'
import type { FormState } from '@/server/form-state'

function readMember(formData: FormData) {
  const name = String(formData.get('name') ?? '').trim()
  const position = String(formData.get('position') ?? '').trim()
  if (!name || !position) return { error: 'Nama dan jabatan wajib diisi.' as const }

  const rawPhoto = String(formData.get('photoUrl') ?? '').trim()
  const photoUrl = sanitizeImageUrl(rawPhoto)
  if (rawPhoto && !photoUrl) return { error: 'URL foto tidak valid. Unggah gambar atau pakai URL https.' as const }

  return {
    data: {
      name,
      position,
      division: String(formData.get('division') ?? '').trim() || null,
      photoUrl: photoUrl ?? null,
      sortOrder: Number(formData.get('sortOrder') ?? 0) || 0,
    },
  }
}

function afterChange() {
  revalidatePath('/admin/organization')
  revalidatePath('/organization')
  revalidatePublicSite()
}

export async function createMemberAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin()
  try {
    const parsed = readMember(formData)
    if ('error' in parsed) return { error: parsed.error }
    await db.organizationMember.create({ data: parsed.data })
    afterChange()
    return { ok: `Pengurus "${parsed.data.name}" ditambahkan.` }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Gagal menambahkan pengurus.' }
  }
}

export async function updateMemberAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin()
  try {
    const id = String(formData.get('id') ?? '')
    if (!id) return { error: 'Pengurus tidak ditemukan.' }
    const parsed = readMember(formData)
    if ('error' in parsed) return { error: parsed.error }
    await db.organizationMember.update({ where: { id }, data: parsed.data })
    afterChange()
    return { ok: `Pengurus "${parsed.data.name}" diperbarui.` }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Gagal memperbarui pengurus.' }
  }
}

export async function toggleMemberActiveAction(id: string, isActive: boolean) {
  await requireAdmin()
  await db.organizationMember.update({ where: { id }, data: { isActive } })
  afterChange()
}

export async function deleteMemberAction(id: string) {
  await requireAdmin()
  await db.organizationMember.delete({ where: { id } })
  afterChange()
}
