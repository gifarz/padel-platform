import { cn } from '@/lib/cn'

const MAP: Record<string, string> = {
  VERIFIED: 'bg-accent/15 text-accent border-accent/40',
  PLAYED: 'bg-accent/15 text-accent border-accent/40',
  SCHEDULED: 'bg-ink/10 text-ink border-line',
  ACCEPTED: 'bg-ink/10 text-ink border-line',
  REQUESTED: 'border-line text-muted',
  PENDING_VERIFICATION: 'bg-amber-400/10 text-amber-300 border-amber-400/30',
  CANCELLED: 'bg-red-500/10 text-red-400 border-red-500/30',
  REGISTRATION_OPEN: 'bg-accent/15 text-accent border-accent/40',
  DRAFT: 'border-line text-muted',
  REGISTRATION_CLOSED: 'border-line text-muted',
  ONGOING: 'bg-accent/15 text-accent border-accent/40',
  COMPLETED: 'border-line text-muted',
  REGISTERED: 'border-line text-muted',
  CONFIRMED: 'bg-accent/15 text-accent border-accent/40',
  WAITLIST: 'bg-amber-400/10 text-amber-300 border-amber-400/30',
  ELIMINATED: 'bg-red-500/10 text-red-400 border-red-500/30',
  WINNER: 'bg-accent/15 text-accent border-accent/40',
}

const LABEL: Record<string, string> = {
  VERIFIED: 'Terverifikasi',
  PLAYED: 'Selesai dimainkan',
  SCHEDULED: 'Terjadwal',
  ACCEPTED: 'Diterima',
  REQUESTED: 'Menunggu konfirmasi',
  PENDING_VERIFICATION: 'Menunggu verifikasi',
  CANCELLED: 'Dibatalkan',
  REGISTRATION_OPEN: 'Pendaftaran dibuka',
  DRAFT: 'Draf',
  REGISTRATION_CLOSED: 'Pendaftaran ditutup',
  ONGOING: 'Berlangsung',
  COMPLETED: 'Selesai',
  REGISTERED: 'Terdaftar',
  CONFIRMED: 'Dikonfirmasi',
  WAITLIST: 'Daftar tunggu',
  ELIMINATED: 'Gugur',
  WINNER: 'Juara',
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn('inline-flex items-center border px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-wider', MAP[status] ?? 'border-line text-muted')}>
      {LABEL[status] ?? status}
    </span>
  )
}
