import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { requireAdminPage } from '@/server/guards'

// Guards every page under /admin in one place — middleware already checks
// this at the edge, but this in-process check keeps each admin page correct
// on its own terms too, regardless of how it's reached.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdminPage()
  return (
    <div className="flex min-h-screen flex-col sm:flex-row">
      <AdminSidebar />
      <main className="flex-1 px-4 py-8 sm:px-10 sm:py-10">{children}</main>
    </div>
  )
}
