import { Field, Input, Textarea, Select, Toggle } from './ui'
import { StringList, ObjectList, ImagesField, CoordinatesField, GradientField } from './fields'
import { getPath, setPath, cn, looksLikeTimestamp } from '../lib/utils'

const span = { full: 'sm:col-span-6', half: 'sm:col-span-3', third: 'sm:col-span-2' }

/** Renders a schema's sections/fields. `values` is the whole doc; `onChange` receives the next doc. */
export default function SchemaForm({ sections, values, onChange, suggestions = {} }) {
  const set = (key, v) => onChange(setPath(values, key, v))

  const renderField = (f) => {
    const v = getPath(values, f.key)
    switch (f.type) {
      case 'textarea':
        return <Textarea rows={f.rows} value={v ?? ''} onChange={(e) => set(f.key, e.target.value)} placeholder={f.placeholder} />
      case 'datetime':
        return <Input type="datetime-local" value={v ?? ''} onChange={(e) => set(f.key, e.target.value)} />
      case 'number':
        return <Input type="number" step={f.step ?? 'any'} min={f.min} max={f.max} value={v ?? ''} onChange={(e) => set(f.key, e.target.value)} />
      case 'select': {
        const opts = [...(f.options || [])]
        const has = opts.some((o) => (typeof o === 'object' ? o.value : o) === v)
        if (v && !has) opts.push(v) // keep legacy values visible
        return <Select options={opts} value={v ?? ''} onChange={(e) => set(f.key, e.target.value)} placeholder="Select…" />
      }
      case 'toggle':
        return <Toggle checked={!!v} onChange={(x) => set(f.key, x)} label={f.label} />
      case 'strings':
        return <StringList value={v} onChange={(x) => set(f.key, x)} placeholder={f.placeholder} addLabel={f.addLabel} inputType={f.inputType} multiline={f.multiline} />
      case 'numbers':
        return <StringList value={(v || []).map(String)} onChange={(x) => set(f.key, x)} inputType="number" placeholder="e.g. 4" addLabel="Add" />
      case 'objects':
        return <ObjectList value={v || []} onChange={(x) => set(f.key, x)} subfields={f.subfields} addLabel={f.addLabel} itemLabel={f.itemLabel} blank={f.blank} />
      case 'images':
        return <ImagesField value={v} onChange={(x) => set(f.key, x)} folder={f.folder} accept={f.accept} />
      case 'image':
        return <ImagesField multiple={false} value={v} onChange={(x) => set(f.key, x)} folder={f.folder} />
      case 'coords':
        return <CoordinatesField value={v || {}} onChange={(x) => set(f.key, x)} />
      case 'gradient':
        return <GradientField from={values.colorFrom} to={values.colorTo} onChange={(a, b) => onChange({ ...values, colorFrom: a, colorTo: b })} />
      default: {
        const sug = [...(f.extraSuggestions || []), ...(f.suggest ? suggestions[f.key] || [] : [])]
        return <Input value={v ?? ''} onChange={(e) => set(f.key, e.target.value)} placeholder={f.placeholder} suggestions={[...new Set(sug)]} />
      }
    }
  }

  return (
    <div className="space-y-8">
      {sections.map((s) => (
        <section key={s.title}>
          <h3 className="mb-3 border-b border-line pb-1.5 text-sm font-extrabold uppercase tracking-wide text-teal">{s.title}</h3>
          <div className="grid gap-4 sm:grid-cols-6">
            {s.fields.map((f) => (
              <div key={f.key} className={cn('col-span-6', span[f.width || 'full'])}>
                {f.type === 'toggle'
                  ? renderField(f)
                  : <Field label={f.label} required={f.required} hint={f.hint}>{renderField(f)}</Field>}
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

/** Turns form values into a Firestore-ready object, driven by the schema's field types. */
export function buildPayload(sections, values) {
  let out = { ...values }
  delete out.id
  for (const f of sections.flatMap((s) => s.fields)) {
    if (f.type === 'gradient') continue
    const v = getPath(values, f.key)
    let c = v
    switch (f.type) {
      case 'text': case 'textarea': case 'select': c = typeof v === 'string' ? v.trim() : v ?? ''; break
      case 'number': c = v === '' || v == null || !Number.isFinite(Number(v)) ? null : Number(v); break
      case 'strings': c = (v || []).map((x) => String(x).trim()).filter(Boolean); break
      case 'numbers': c = (v || []).map(Number).filter((n) => Number.isFinite(n) && n > 0); break
      case 'images': c = (v || []).filter(Boolean); break
      case 'image': c = v || ''; break
      case 'toggle': c = !!v; break
      case 'datetime': { const d = v ? new Date(v) : null; c = d && !isNaN(d) ? d : null; break }
      case 'objects':
        c = (v || []).map((o) => Object.fromEntries(Object.entries(o).map(([k, x]) => [k, typeof x === 'string' ? x.trim() : x])))
          .filter((o) => Object.values(o).some((x) => x && x !== 'default'))
        break
      case 'coords': {
        const la = parseFloat(v?.latitude), ln = parseFloat(v?.longitude)
        c = Number.isFinite(la) && Number.isFinite(ln) ? { latitude: la, longitude: ln } : null
        break
      }
      default: break
    }
    out = setPath(out, f.key, c)
  }
  // Never write back Timestamps that were flattened to plain maps (createdAt, updatedAt, …)
  for (const [k, v] of Object.entries(out)) if (looksLikeTimestamp(v)) delete out[k]
  return out
}
