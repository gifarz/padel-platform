import Link from 'next/link'
import { getNewsAdmin } from '@/server/queries'
import { CreateNewsForm } from '@/components/admin/create-news-form'
import { AdminToggle } from '@/components/admin/admin-toggle'
import { AdminDeleteButton } from '@/components/admin/admin-delete-button'
import { toggleNewsPublishedAction, deleteNewsAction } from '@/server/actions/news'
import { fmtDate } from '@/lib/format'

const CATEGORY_LABEL: Record<string, string> = {
  ORGANISASI: 'Organisasi', TURNAMEN: 'Turnamen', PRESTASI: 'Prestasi', KOMUNITAS: 'Komunitas', PENGUMUMAN: 'Pengumuman',
}

export default async function AdminNewsPage() {
  const news = await getNewsAdmin()

  return (
    <div>
      <h1 className="d text-4xl sm:text-6xl">Berita</h1>

      <div className="mt-6 overflow-x-auto border border-line">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-line text-left">
              <th className="th">Judul</th><th className="th">Kategori</th><th className="th">Dibuat</th>
              <th className="th">Publikasikan</th><th className="th"></th>
            </tr>
          </thead>
          <tbody>
            {news.map((n) => (
              <tr key={n.id} className="border-b border-line last:border-0 hover:bg-surface">
                <td className="td font-display text-base">
                  {n.isPublished ? <Link href={`/news/${n.slug}`} className="hover:text-accent">{n.title}</Link> : n.title}
                </td>
                <td className="td text-muted">{CATEGORY_LABEL[n.category] ?? n.category}</td>
                <td className="td text-muted">{fmtDate(n.createdAt)}</td>
                <td className="td"><AdminToggle id={n.id} checked={n.isPublished} action={toggleNewsPublishedAction} label={n.isPublished ? 'Terbit' : 'Draf'} /></td>
                <td className="td text-right"><AdminDeleteButton id={n.id} action={deleteNewsAction} confirmMessage={`Hapus berita "${n.title}"?`} /></td>
              </tr>
            ))}
            {news.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-6 text-sm text-muted">Belum ada berita. Tulis satu di bawah.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <h2 className="d mt-10 text-2xl">Tulis berita baru</h2>
      <CreateNewsForm />
    </div>
  )
}
