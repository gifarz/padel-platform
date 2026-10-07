'use client'

export type Option = { id: string; label: string }
export interface MatchFormOptions {
  athletes: Option[]
  courts: Option[]
  referees: Option[]
  trainers: Option[]
}
export interface MatchDefaults {
  a1?: string; a2?: string; b1?: string; b2?: string
  courtId?: string | null
  refereeId?: string | null
  trainerId?: string | null
  scheduledAt?: string
  status?: string
  cancelReason?: string | null
}

export const MATCH_STATUS_LABEL: Record<string, string> = {
  REQUESTED: 'Menunggu persetujuan lawan',
  ACCEPTED: 'Diterima',
  SCHEDULED: 'Terjadwal',
  PLAYED: 'Sudah dimainkan',
  PENDING_VERIFICATION: 'Menunggu verifikasi',
  VERIFIED: 'Terverifikasi',
  CANCELLED: 'Dibatalkan',
}

const Select = ({ name, label, value, options, placeholder, required }: { name: string; label: string; value?: string | null; options: Option[]; placeholder: string; required?: boolean }) => (
  <label className="grid gap-1">
    <span className="text-[0.65rem] font-bold uppercase tracking-widest text-muted">{label}</span>
    <select name={name} defaultValue={value ?? ''} required={required} className="inp">
      <option value="">{placeholder}</option>
      {options.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
    </select>
  </label>
)

/**
 * Shared by the "create" form and the inline "edit" row. When `lineupLocked`
 * (result already submitted) only schedule / court / referee / trainer render.
 */
export function MatchFormFields({
  options, defaults = {}, lineupLocked = false, showStatus = false,
}: { options: MatchFormOptions; defaults?: MatchDefaults; lineupLocked?: boolean; showStatus?: boolean }) {
  return (
    <>
      {!lineupLocked && (
        <>
          <Select name="a1" label="Tim A · pemain 1" value={defaults.a1} options={options.athletes} placeholder="Pilih atlet" required />
          <Select name="a2" label="Tim A · pemain 2 (ganda)" value={defaults.a2} options={options.athletes} placeholder="— kosong (tunggal) —" />
          <Select name="b1" label="Tim B · pemain 1" value={defaults.b1} options={options.athletes} placeholder="Pilih atlet" required />
          <Select name="b2" label="Tim B · pemain 2 (ganda)" value={defaults.b2} options={options.athletes} placeholder="— kosong (tunggal) —" />
        </>
      )}
      <label className="grid gap-1">
        <span className="text-[0.65rem] font-bold uppercase tracking-widest text-muted">Jadwal (WIB)</span>
        <input name="scheduledAt" type="datetime-local" defaultValue={defaults.scheduledAt ?? ''} className="inp" />
      </label>
      <Select name="courtId" label="Lapangan" value={defaults.courtId} options={options.courts} placeholder="— belum dipilih —" />
      <Select name="refereeId" label="Wasit" value={defaults.refereeId} options={options.referees} placeholder="— belum dipilih —" />
      <Select name="trainerId" label="Pelatih" value={defaults.trainerId} options={options.trainers} placeholder="— tanpa pelatih —" />
      {showStatus && !lineupLocked && (
        <>
          <label className="grid gap-1">
            <span className="text-[0.65rem] font-bold uppercase tracking-widest text-muted">Status</span>
            <select name="status" defaultValue={defaults.status} className="inp">
              {['REQUESTED', 'ACCEPTED', 'SCHEDULED', 'PLAYED', 'CANCELLED'].map((s) => <option key={s} value={s}>{MATCH_STATUS_LABEL[s]}</option>)}
            </select>
          </label>
          <label className="grid gap-1">
            <span className="text-[0.65rem] font-bold uppercase tracking-widest text-muted">Skor (dari sisi Tim A)</span>
            <input name="score" placeholder="cth. 6-4, 3-6, 6-2 — kosongkan bila belum main" className="inp" />
          </label>
          <label className="grid gap-1 sm:col-span-2">
            <span className="text-[0.65rem] font-bold uppercase tracking-widest text-muted">Alasan batal (bila dibatalkan)</span>
            <input name="cancelReason" defaultValue={defaults.cancelReason ?? ''} className="inp" />
          </label>
        </>
      )}
    </>
  )
}
