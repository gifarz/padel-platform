'use server'
import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { requireAdmin } from '@/server/guards'
import { revalidatePublicSite } from '@/server/revalidate'

export async function toggleDistrictActiveAction(id: string, isActive: boolean) {
  await requireAdmin()
  await db.district.update({ where: { id }, data: { isActive } })
  revalidatePath('/admin/districts')
  revalidatePath('/admin/athletes')
  revalidatePath('/players')
  revalidatePath('/clubs')
  // Affects the landing page's district distribution map/stats too.
  revalidatePublicSite()
}
