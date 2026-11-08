export const cn = (...c) => c.filter(Boolean).join(' ')

export const slugify = (s = '') =>
  String(s).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

// Dotted-path helpers so a field can live at "gallery.images" or "coordinates.latitude"
export const getPath = (obj, path) =>
  path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj)

export const setPath = (obj, path, value) => {
  const keys = path.split('.')
  const next = { ...obj }
  let cur = next
  keys.forEach((k, i) => {
    if (i === keys.length - 1) cur[k] = value
    else { cur[k] = { ...(cur[k] || {}) }; cur = cur[k] }
  })
  return next
}

// Firestore Timestamp | {seconds} | Date | ISO string → Date (or null)
export const toDateLoose = (v) => {
  if (!v) return null
  if (typeof v.toDate === 'function') return v.toDate()
  if (typeof v === 'object' && (v.seconds ?? v._seconds) != null) return new Date((v.seconds ?? v._seconds) * 1000)
  const d = new Date(v)
  return isNaN(d) ? null : d
}
export const toMs = (v) => toDateLoose(v)?.getTime() ?? 0

export const fmtDate = (v) => {
  const d = toDateLoose(v)
  return d ? d.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' }) : ''
}
export const fmtDateTime = (v) => {
  const d = toDateLoose(v)
  return d ? `${fmtDate(d)}, ${d.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })}` : ''
}

// <input type="datetime-local"> wants "YYYY-MM-DDTHH:mm" in local time
const pad = (n) => String(n).padStart(2, '0')
export const toLocalInput = (v) => {
  const d = toDateLoose(v)
  return d ? `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}` : ''
}
export const nowLocal = () => toLocalInput(new Date())

// A Timestamp that went through structuredClone/JSON becomes { seconds, nanoseconds }
export const looksLikeTimestamp = (v) =>
  !!v && typeof v === 'object' && !(v instanceof Date) && !Array.isArray(v) &&
  (typeof v.toDate === 'function' || (typeof v.seconds === 'number' && typeof v.nanoseconds === 'number'))

// Strip empty strings out of lists and trim; used before saving
export const cleanList = (arr = []) => arr.map((x) => (typeof x === 'string' ? x.trim() : x)).filter(Boolean)
