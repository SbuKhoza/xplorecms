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

// Firestore Timestamps / Dates / ISO strings → readable text
export const fmtDate = (v) => {
  if (!v) return ''
  const d = typeof v?.toDate === 'function' ? v.toDate() : new Date(v)
  return isNaN(d) ? '' : d.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })
}

// Strip empty strings out of lists and trim; used before saving
export const cleanList = (arr = []) => arr.map((x) => (typeof x === 'string' ? x.trim() : x)).filter(Boolean)
