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
/** Date → value for <input type="datetime-local">, in Jakarta time (inverse of parseLocalDateTime). */
export const toLocalDateTimeInput = (d?: Date | null) => {
  if (!d) return ''
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
      .formatToParts(d).map((x) => [x.type, x.value]),
  )
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`
}
