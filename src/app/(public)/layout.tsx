import { Header } from '@/components/public/header'
import { Footer } from '@/components/public/footer'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-bg text-ink">
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  )
}
