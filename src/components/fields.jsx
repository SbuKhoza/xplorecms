import { useRef, useState } from 'react'
import { Plus, Trash2, ImagePlus, X, LocateFixed, GripVertical, Link as LinkIcon } from 'lucide-react'
import { Button, Input, Textarea, Select, Spinner, useToast } from './ui'
import MapPicker from './MapPicker'
import { uploadFile } from '../lib/storage'
import { cn } from '../lib/utils'

/* ── Repeatable list of plain strings (amenities, stops, facts, times…) ── */
export function StringList({ value = [], onChange, placeholder = 'Add item', addLabel = 'Add', inputType = 'text', multiline }) {
  const items = value.length ? value : ['']
  const set = (i, v) => onChange(items.map((x, j) => (j === i ? v : x)))
  const Ctl = multiline ? Textarea : Input
  return (
    <div className="space-y-2">
      {items.map((v, i) => (
        <div key={i} className="flex items-start gap-2">
          <Ctl type={inputType} value={v} onChange={(e) => set(i, e.target.value)} placeholder={placeholder} {...(multiline ? { rows: 2 } : {})} />
          <Button type="button" variant="dangerGhost" size="icon" aria-label="Remove" onClick={() => onChange(items.filter((_, j) => j !== i))}>
            <Trash2 className="size-4" />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" icon={Plus} onClick={() => onChange([...items, ''])}>{addLabel}</Button>
    </div>
  )
}

/* ── Repeatable list of objects: subfields = [{ key, label, type, options, placeholder, width }] ── */
export function ObjectList({ value = [], onChange, subfields, addLabel = 'Add', blank, itemLabel }) {
  const empty = blank || Object.fromEntries(subfields.map((s) => [s.key, '']))
  const set = (i, key, v) => onChange(value.map((x, j) => (j === i ? { ...x, [key]: v } : x)))
  return (
    <div className="space-y-3">
      {value.map((item, i) => (
        <div key={i} className="rounded-xl border border-line bg-bg/60 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-muted">
              <GripVertical className="size-3.5" /> {itemLabel ? `${itemLabel} ${i + 1}` : `#${i + 1}`}
            </span>
            <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} className="rounded p-1 text-red-600 hover:bg-red-50" aria-label="Remove">
              <Trash2 className="size-4" />
            </button>
          </div>
          <div className="grid gap-2 sm:grid-cols-6">
            {subfields.map((s) => (
              <div key={s.key} className={cn(s.width === 'full' ? 'sm:col-span-6' : s.width === 'third' ? 'sm:col-span-2' : 'sm:col-span-3')}>
                {s.type === 'textarea'
                  ? <Textarea rows={3} value={item[s.key] ?? ''} placeholder={s.label} onChange={(e) => set(i, s.key, e.target.value)} />
                  : s.type === 'select'
                    ? <Select options={s.options} value={item[s.key] ?? ''} onChange={(e) => set(i, s.key, e.target.value)} placeholder={s.label} />
                    : <Input value={item[s.key] ?? ''} placeholder={s.label} onChange={(e) => set(i, s.key, e.target.value)} />}
              </div>
            ))}
          </div>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" icon={Plus} onClick={() => onChange([...value, { ...empty }])}>{addLabel}</Button>
    </div>
  )
}

/* ── Image uploader (single or many). Stores download URLs. ── */
export function ImagesField({ value, onChange, folder = 'uploads', multiple = true, accept = 'image/*' }) {
  const list = multiple ? (value || []).filter(Boolean) : value ? [value] : []
  const input = useRef(null)
  const [busy, setBusy] = useState(0)
  const [url, setUrl] = useState('')
  const toast = useToast()

  const emit = (arr) => onChange(multiple ? arr : arr[0] || '')

  const onFiles = async (files) => {
    const picked = Array.from(files || [])
    if (!picked.length) return
    setBusy((b) => b + picked.length)
    const done = []
    for (const f of picked) {
      try { done.push(await uploadFile(f, folder)) }
      catch (e) { toast.error(`Upload failed: ${f.name}`) }
      finally { setBusy((b) => b - 1) }
    }
    emit(multiple ? [...list, ...done] : done.slice(-1))
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {list.map((src, i) => (
          <div key={src + i} className="group relative size-24 overflow-hidden rounded-xl border border-line bg-bg">
            {/\.(mp4|webm|mov)(\?|$)/i.test(src)
              ? <video src={src} className="size-full object-cover" />
              : /\.pdf(\?|$)/i.test(src)
                ? <div className="grid size-full place-items-center text-xs font-bold text-muted">PDF</div>
                : <img src={src} alt="" className="size-full object-cover" />}
            <button type="button" onClick={() => emit(list.filter((_, j) => j !== i))}
              className="absolute right-1 top-1 rounded-full bg-ink/80 p-1 text-white opacity-0 transition group-hover:opacity-100" aria-label="Remove">
              <X className="size-3.5" />
            </button>
          </div>
        ))}
        {(multiple || !list.length) && (
          <button type="button" onClick={() => input.current?.click()}
            className="grid size-24 place-items-center rounded-xl border-2 border-dashed border-line text-muted transition hover:border-brand hover:text-brand">
            {busy ? <Spinner /> : <div className="text-center"><ImagePlus className="mx-auto size-6" /><span className="text-[11px] font-semibold">Upload</span></div>}
          </button>
        )}
      </div>
      <input ref={input} type="file" accept={accept} multiple={multiple} hidden onChange={(e) => { onFiles(e.target.files); e.target.value = '' }} />
      <div className="mt-2 flex items-center gap-2">
        <LinkIcon className="size-4 shrink-0 text-muted" />
        <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="…or paste an image URL and press Enter"
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (url.trim()) { emit(multiple ? [...list, url.trim()] : [url.trim()]); setUrl('') } } }} />
      </div>
    </div>
  )
}

/* ── Coordinates with map picker + "use my location" ── */
export function CoordinatesField({ value = {}, onChange }) {
  const [locating, setLocating] = useState(false)
  const toast = useToast()
  const locate = () => {
    if (!navigator.geolocation) return toast.error('Geolocation is not supported')
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (p) => { onChange({ latitude: +p.coords.latitude.toFixed(6), longitude: +p.coords.longitude.toFixed(6) }); setLocating(false) },
      () => { toast.error('Could not get your location'); setLocating(false) },
    )
  }
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <Input type="number" step="any" placeholder="Latitude" value={value.latitude ?? ''} onChange={(e) => onChange({ ...value, latitude: e.target.value })} />
        <Input type="number" step="any" placeholder="Longitude" value={value.longitude ?? ''} onChange={(e) => onChange({ ...value, longitude: e.target.value })} />
      </div>
      <MapPicker value={value} onChange={onChange} />
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted">Click the map to drop a pin.</p>
        <Button type="button" variant="outline" size="sm" icon={LocateFixed} loading={locating} onClick={locate}>Use my location</Button>
      </div>
    </div>
  )
}

/* ── Two-colour gradient picker with the app's presets ── */
export const TOWNSHIP_PALETTE = [
  ['#E8600A', '#A63A06'], ['#0A86B4', '#12407E'], ['#1FA463', '#0B6B45'],
  ['#7A4FE0', '#43299E'], ['#E0356F', '#9B1D4E'], ['#0E8F94', '#145A6B'],
]
export function GradientField({ from, to, onChange }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {TOWNSHIP_PALETTE.map(([a, b]) => (
        <button key={a} type="button" aria-label={`Preset ${a}`} onClick={() => onChange(a, b)}
          className={cn('size-9 rounded-full ring-offset-2 transition', from === a ? 'ring-2 ring-ink' : 'hover:scale-110')}
          style={{ background: `linear-gradient(135deg, ${a}, ${b})` }} />
      ))}
      <div className="flex items-center gap-1.5 text-xs font-semibold text-muted">
        <input type="color" value={from || '#E8600A'} onChange={(e) => onChange(e.target.value, to)} className="size-8 cursor-pointer rounded border border-line" />
        <input type="color" value={to || '#A63A06'} onChange={(e) => onChange(from, e.target.value)} className="size-8 cursor-pointer rounded border border-line" />
        custom
      </div>
      <div className="h-9 w-24 rounded-lg" style={{ background: `linear-gradient(135deg, ${from || '#E8600A'}, ${to || '#A63A06'})` }} />
    </div>
  )
}
