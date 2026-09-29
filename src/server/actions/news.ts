'use server'
import { db } from '@/lib/db'
import { auth } from '@/auth'
import { requireAdmin } from '@/server/guards'
import { revalidatePublicSite } from '@/server/revalidate'
import { revalidatePath } from 'next/cache'
import { slugify } from '@/lib/slug'
import { sanitizeImageUrl } from '@/lib/uploads'
import { plainExcerpt } from '@/lib/markdown'
import type { FormState } from '@/server/form-state'

const CATEGORIES = ['ORGANISASI', 'TURNAMEN', 'PRESTASI', 'KOMUNITAS', 'PENGUMUMAN'] as const

export async function createNewsAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin()
  try {
    const title = String(formData.get('title') ?? '').trim()
    const content = String(formData.get('content') ?? '').trim()
    if (!title || !content) return { error: 'Judul dan isi berita wajib diisi.' }

    const excerptRaw = String(formData.get('excerpt') ?? '').trim()
    const excerpt = excerptRaw || plainExcerpt(content)
    const coverUrl = sanitizeImageUrl(formData.get('coverUrl'))
    const categoryRaw = String(formData.get('category') ?? 'PENGUMUMAN')
    const category = (CATEGORIES as readonly string[]).includes(categoryRaw) ? categoryRaw : 'PENGUMUMAN'
    const isPublished = formData.get('isPublished') === 'on'

    const baseSlug = slugify(title)
    if (!baseSlug) return { error: 'Judul tidak valid untuk dibuatkan slug.' }
    let slug = baseSlug
    let n = 1
    while (await db.news.findUnique({ where: { slug } })) slug = `${baseSlug}-${++n}`

    const session = await auth()
    await db.news.create({
      data: {
        title, slug, content, excerpt, coverUrl,
        category: category as (typeof CATEGORIES)[number],
        isPublished,
        publishedAt: isPublished ? new Date() : null,
        authorId: session?.user?.id,
      },
    })
    revalidatePath('/admin/news')
    revalidatePath('/news')
    revalidatePublicSite()
    return { ok: `Berita "${title}" dibuat.` }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Gagal membuat berita.' }
  }
}

export async function toggleNewsPublishedAction(id: string, isPublished: boolean) {
  await requireAdmin()
  await db.news.update({
    where: { id },
    data: { isPublished, publishedAt: isPublished ? new Date() : null },
  })
  revalidatePath('/admin/news')
  revalidatePath('/news')
  revalidatePublicSite()
}

export async function deleteNewsAction(id: string) {
  await requireAdmin()
  await db.news.delete({ where: { id } })
  revalidatePath('/admin/news')
  revalidatePath('/news')
  revalidatePublicSite()
}
