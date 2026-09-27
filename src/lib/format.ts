const dateFmt = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Jakarta' })
const timeFmt = new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta', hour12: false })

export const fmtDate = (d?: Date | null) => (d ? dateFmt.format(d) : '-')
export const fmtDateTime = (d?: Date | null) => (d ? `${dateFmt.format(d)} · ${timeFmt.format(d).replace(':', '.')}` : '-')
export const fmtNum = (n: number) => n.toLocaleString('id-ID')
export const initials = (name: string) =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join('')
/** <input type="datetime-local"> value → Date, treating it as Jakarta time (UTC+7). */
export const parseLocalDateTime = (v?: FormDataEntryValue | null) => {
  if (!v || typeof v !== 'string') return null
  const d = new Date(`${v}:00+07:00`)
  return Number.isNaN(d.getTime()) ? null : d
}
