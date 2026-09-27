export function PageBanner({ eyebrow, title, description }: { eyebrow: string; title: React.ReactNode; description?: string }) {
  return (
    <div className="-mt-0.5 border-b border-navy-dark bg-navy text-white">
      <div className="mx-auto max-w-site px-4 py-12 sm:px-8 sm:py-16">
        <p className="lb text-white/50">{eyebrow}</p>
        <h1 className="d mt-2 text-3xl sm:text-4xl">{title}</h1>
        {description && <p className="mt-3 max-w-2xl text-sm text-white/75">{description}</p>}
      </div>
    </div>
  )
}
