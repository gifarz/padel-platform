'use server'
import { revalidatePath } from 'next/cache'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { requireAdmin } from '@/server/guards'
import { normalizeIndonesianPhone } from '@/lib/phone'
import { revalidatePublicSite } from '@/server/revalidate'
import type { FormState } from '@/server/form-state'

/**
 * Creates a login-capable User plus the matching Trainer/Referee profile in
 * one go. Admin sets a temporary password the person changes after first login
 * — there's no "invite by phone" flow yet, so this keeps onboarding to one step.
 */
async function createStaffUser(formData: FormData, role: 'TRAINER' | 'REFEREE') {
  const name = String(formData.get('name') ?? '').trim()
  const rawPhone = String(formData.get('phone') ?? '').trim()
  const districtId = String(formData.get('districtId') ?? '').trim() || undefined
  if (!name || !rawPhone) throw new Error('Nama dan nomor HP wajib diisi.')

  const phone = normalizeIndonesianPhone(rawPhone)
  if (!phone) throw new Error('Nomor HP tidak valid.')

  const exists = await db.user.findUnique({ where: { phone } })
  if (exists) throw new Error('Nomor HP sudah dipakai akun lain.')

  const tempPassword = Math.random().toString(36).slice(2, 10)
  const passwordHash = await bcrypt.hash(tempPassword, 10)
  const user = await db.user.create({ data: { name, phone, passwordHash, role } })
  return { user, districtId, tempPassword }
}

export async function createTrainerAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin()
  try {
    const specialties = String(formData.get('specialties') ?? '').split(',').map((s) => s.trim()).filter(Boolean)
    const yearsExp = Number(formData.get('yearsExp') ?? 0)
    const sessionPrice = formData.get('sessionPrice') ? Number(formData.get('sessionPrice')) : undefined
    const { user, districtId, tempPassword } = await createStaffUser(formData, 'TRAINER')
    await db.trainerProfile.create({ data: { userId: user.id, districtId, specialties, yearsExp, sessionPrice } })
    revalidatePath('/admin/trainers')
    // Landing page's "Pelatih Bersertifikat" preview reads this list too.
    revalidatePublicSite()
    return { ok: `Pelatih dibuat. Kata sandi sementara: ${tempPassword}` }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Gagal membuat pelatih.' }
  }
}

export async function createRefereeAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin()
  try {
    const certification = String(formData.get('certification') ?? '').trim()
    const yearsExp = Number(formData.get('yearsExp') ?? 0)
    if (!certification) return { error: 'Isi sertifikasi wasit.' }
    const { user, districtId, tempPassword } = await createStaffUser(formData, 'REFEREE')
    await db.refereeProfile.create({ data: { userId: user.id, districtId, certification, yearsExp } })
    revalidatePath('/admin/referees')
    revalidatePublicSite()
    return { ok: `Wasit dibuat. Kata sandi sementara: ${tempPassword}` }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Gagal membuat wasit.' }
  }
}

export async function setTrainerStatusAction(id: string, status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED') {
  await requireAdmin()
  await db.trainerProfile.update({ where: { id }, data: { status } })
  revalidatePath('/admin/trainers')
  revalidatePublicSite()
}

export async function setRefereeStatusAction(id: string, status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED') {
  await requireAdmin()
  await db.refereeProfile.update({ where: { id }, data: { status } })
  revalidatePath('/admin/referees')
  revalidatePublicSite()
}

/** Shared by trainer/referee edit: validates name + phone and updates the User row. */
async function updateStaffUser(userId: string, formData: FormData) {
  const name = String(formData.get('name') ?? '').trim()
  const rawPhone = String(formData.get('phone') ?? '').trim()
  if (!name || !rawPhone) throw new Error('Nama dan nomor HP wajib diisi.')
  const phone = normalizeIndonesianPhone(rawPhone)
  if (!phone) throw new Error('Nomor HP tidak valid.')
  const owner = await db.user.findUnique({ where: { phone }, select: { id: true } })
  if (owner && owner.id !== userId) throw new Error('Nomor HP sudah dipakai akun lain.')
  return { name, phone }
}

const districtOrNull = (formData: FormData) => String(formData.get('districtId') ?? '').trim() || null

export async function updateTrainerAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin()
  try {
    const id = String(formData.get('id') ?? '')
    const trainer = await db.trainerProfile.findUnique({ where: { id }, select: { userId: true } })
    if (!trainer) return { error: 'Pelatih tidak ditemukan.' }
    const user = await updateStaffUser(trainer.userId, formData)
    const specialties = String(formData.get('specialties') ?? '').split(',').map((s) => s.trim()).filter(Boolean)
    const yearsExp = Math.max(0, Number(formData.get('yearsExp') ?? 0) || 0)
    const priceRaw = String(formData.get('sessionPrice') ?? '').trim()
    const sessionPrice = priceRaw ? Math.max(0, Number(priceRaw) || 0) : null

    await db.$transaction([
      db.user.update({ where: { id: trainer.userId }, data: user }),
      db.trainerProfile.update({ where: { id }, data: { districtId: districtOrNull(formData), specialties, yearsExp, sessionPrice } }),
    ])
    revalidatePath('/admin/trainers')
    revalidatePublicSite()
    return { ok: `Data pelatih "${user.name}" diperbarui.` }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Gagal memperbarui pelatih.' }
  }
}

export async function deleteTrainerAction(id: string) {
  await requireAdmin()
  const trainer = await db.trainerProfile.findUnique({ where: { id }, select: { userId: true } })
  if (!trainer) throw new Error('Pelatih tidak ditemukan.')
  // Cascades to the profile; matches keep existing, their trainer is just cleared (ON DELETE SET NULL).
  await db.user.delete({ where: { id: trainer.userId } })
  revalidatePath('/admin/trainers')
  revalidatePath('/admin/matches')
  revalidatePublicSite()
}

export async function updateRefereeAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin()
  try {
    const id = String(formData.get('id') ?? '')
    const referee = await db.refereeProfile.findUnique({ where: { id }, select: { userId: true } })
    if (!referee) return { error: 'Wasit tidak ditemukan.' }
    const certification = String(formData.get('certification') ?? '').trim()
    if (!certification) return { error: 'Isi sertifikasi wasit.' }
    const user = await updateStaffUser(referee.userId, formData)
    const yearsExp = Math.max(0, Number(formData.get('yearsExp') ?? 0) || 0)

    await db.$transaction([
      db.user.update({ where: { id: referee.userId }, data: user }),
      db.refereeProfile.update({ where: { id }, data: { districtId: districtOrNull(formData), certification, yearsExp } }),
    ])
    revalidatePath('/admin/referees')
    revalidatePublicSite()
    return { ok: `Data wasit "${user.name}" diperbarui.` }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Gagal memperbarui wasit.' }
  }
}

export async function deleteRefereeAction(id: string) {
  await requireAdmin()
  const referee = await db.refereeProfile.findUnique({ where: { id }, select: { userId: true } })
  if (!referee) throw new Error('Wasit tidak ditemukan.')
  await db.user.delete({ where: { id: referee.userId } })
  revalidatePath('/admin/referees')
  revalidatePath('/admin/matches')
  revalidatePublicSite()
}
