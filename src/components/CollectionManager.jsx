import { useMemo, useState } from 'react'
import { addDoc, collection, doc, serverTimestamp, setDoc, writeBatch } from 'firebase/firestore'
import { Plus, Pencil, Trash2, Star } from 'lucide-react'
import { db } from '../firebase/Config'
import { useCollection } from '../hooks/useCollection'
import { Alert, Badge, Button, Card, Empty, Modal, SearchBox, Select, Spinner, Toggle, useToast } from './ui'
import SchemaForm, { buildPayload } from './SchemaForm'
import { slugify, getPath } from '../lib/utils'

/**
 * Generic list + create/edit/delete manager for any Firestore collection described by a schema.
 *  - scope:       optional (item)=>bool to narrow the list (e.g. one transport mode)
 *  - newDefaults: extra defaults for new docs (e.g. { mode: 'train' })
 *  - toolbar:     extra node rendered next to the search box
 *  - emptyAction: node shown in the empty state (e.g. a "load sample data" button)
 */
export default function CollectionManager({ schema, scope, newDefaults, toolbar, emptyAction, emptyText, canAdd = true }) {
  const { data, loading, error } = useCollection(schema.collection)
  const toast = useToast()

  const [q, setQ] = useState('')
  const [filterVal, setFilterVal] = useState('')
  const [editing, setEditing] = useState(null) // null | { id?: string, values }
  const [saving, setSaving] = useState(false)
  const [selected, setSelected] = useState([])

  const titleKey = schema.titleKey || 'name'
  const all = useMemo(() => data.filter((d) => (!schema.only || schema.only(d)) && (!scope || scope(d))), [data, schema, scope])

  const sortKey = (d) => (d.order != null ? Number(d.order) : 1e9)
  const items = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return all
      .filter((d) => !filterVal || d[schema.filter] === filterVal)
      .filter((d) => !needle || schema.searchKeys.some((k) => String(d[k] ?? '').toLowerCase().includes(needle)))
      .sort((a, b) => sortKey(a) - sortKey(b) || String(a[titleKey] ?? '').localeCompare(String(b[titleKey] ?? '')))
  }, [all, q, filterVal, schema, titleKey])

  const filterOptions = useMemo(
    () => (schema.filter ? [...new Set(all.map((d) => d[schema.filter]).filter(Boolean))].sort() : []),
    [all, schema],
  )

  // Existing values become autocomplete suggestions for free-text fields (cuisine, type, category…)
  const suggestions = useMemo(() => {
    const out = {}
    schema.sections.flatMap((s) => s.fields).filter((f) => f.suggest).forEach((f) => {
      out[f.key] = [...new Set(all.map((d) => d[f.key]).filter(Boolean))]
    })
    return out
  }, [all, schema])

  const openNew = () => setEditing({ values: { ...structuredClone(schema.defaults || {}), ...newDefaults } })
  const openEdit = (item) => setEditing({ id: item.id, values: { ...structuredClone(schema.defaults || {}), ...structuredClone(item) } })

  const required = schema.sections.flatMap((s) => s.fields).filter((f) => f.required)

  const save = async () => {
    const missing = required.find((f) => !String(getPath(editing.values, f.key) ?? '').trim())
    if (missing) return toast.error(`${missing.label} is required`)
    setSaving(true)
    try {
      const payload = { ...buildPayload(schema.sections, editing.values), updatedAt: serverTimestamp() }
      if (editing.id) {
        await setDoc(doc(db, schema.collection, editing.id), payload, { merge: true })
      } else if (schema.idFromName) {
        await setDoc(doc(db, schema.collection, slugify(payload[titleKey])), { ...payload, createdAt: serverTimestamp() }, { merge: true })
      } else {
        await addDoc(collection(db, schema.collection), { ...payload, createdAt: serverTimestamp() })
      }
      toast.success(`${schema.singular[0].toUpperCase()}${schema.singular.slice(1)} saved`)
      setEditing(null)
    } catch (e) {
      console.error(e); toast.error(e.code === 'permission-denied' ? 'Permission denied — check your Firestore rules' : 'Could not save')
    } finally { setSaving(false) }
  }

  const remove = async (ids) => {
    const ok = await toast.confirm({
      title: `Delete ${ids.length > 1 ? `${ids.length} items` : schema.singular}?`,
      message: 'This removes it from the app straight away and cannot be undone.',
    })
    if (!ok) return
    try {
      const batch = writeBatch(db)
      ids.forEach((id) => batch.delete(doc(db, schema.collection, id)))
      await batch.commit()
      setSelected((s) => s.filter((id) => !ids.includes(id)))
      toast.success('Deleted')
    } catch { toast.error('Could not delete') }
  }

  const toggleActive = (item) =>
    setDoc(doc(db, schema.collection, item.id), { isActive: item.isActive === false, updatedAt: serverTimestamp() }, { merge: true })
      .catch(() => toast.error('Could not update'))

  const thumb = (item) => (Array.isArray(item.images) ? item.images.find(Boolean) : null) || item.logo || item.imageUrl

  if (error) return <Alert tone="red">Couldn’t load {schema.label}: {error.message}</Alert>

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <SearchBox value={q} onChange={setQ} placeholder={`Search ${schema.label.toLowerCase()}…`} className="min-w-52 flex-1" />
        {filterOptions.length > 1 && (
          <Select className="w-auto" value={filterVal} onChange={(e) => setFilterVal(e.target.value)} options={filterOptions} placeholder={`All ${schema.filter}s`.replace('categorys', 'categories')} />
        )}
        {toolbar}
        {selected.length > 0 && <Button variant="dangerGhost" icon={Trash2} onClick={() => remove(selected)}>Delete {selected.length}</Button>}
        {canAdd && <Button icon={Plus} onClick={openNew}>Add {schema.singular}</Button>}
      </div>

      {loading ? (
        <div className="grid place-items-center py-20"><Spinner className="size-8" /></div>
      ) : items.length === 0 ? (
        <Empty
          title={all.length ? 'No matches' : `No ${schema.label.toLowerCase()} yet`}
          text={all.length ? 'Try a different search or filter.' : emptyText || `Add your first ${schema.singular} and it will appear in the app.`}
          action={all.length ? null : emptyAction}
        />
      ) : (
        <Card className="divide-y divide-line overflow-hidden">
          {items.map((item) => {
            const img = !schema.noImage && thumb(item)
            const inactive = schema.hasActive && item.isActive === false
            return (
              <div key={item.id} className="flex items-center gap-3 px-4 py-3 hover:bg-bg/60">
                <input type="checkbox" className="size-4 accent-brand" checked={selected.includes(item.id)}
                  onChange={(e) => setSelected((s) => (e.target.checked ? [...s, item.id] : s.filter((x) => x !== item.id)))} aria-label="Select" />
                {!schema.noImage && (
                  img ? <img src={img} alt="" className="size-12 shrink-0 rounded-lg object-cover" />
                    : <div className="grid size-12 shrink-0 place-items-center rounded-lg bg-teal-light text-teal">{schema.icon && <schema.icon className="size-5" />}</div>
                )}
                <button onClick={() => openEdit(item)} className="min-w-0 flex-1 text-left">
                  <p className={`truncate font-bold ${inactive ? 'text-muted line-through' : ''}`}>{item[titleKey] || 'Untitled'}</p>
                  <p className="truncate text-sm text-muted">{schema.subtitle?.(item)}</p>
                </button>
                {item.status && <Badge tone={item.status === 'Open' || item.status === 'On Time' ? 'green' : item.status === 'Delayed' ? 'amber' : 'red'} className="hidden sm:inline-flex">{item.status}</Badge>}
                {item.rating > 0 && <span className="hidden items-center gap-1 text-sm font-semibold sm:flex"><Star className="size-4 fill-amber-400 text-amber-400" />{item.rating}</span>}
                {schema.hasActive && <Toggle checked={item.isActive !== false} onChange={() => toggleActive(item)} />}
                <Button variant="ghost" size="icon" onClick={() => openEdit(item)} aria-label="Edit"><Pencil className="size-4" /></Button>
                <Button variant="dangerGhost" size="icon" onClick={() => remove([item.id])} aria-label="Delete"><Trash2 className="size-4" /></Button>
              </div>
            )
          })}
        </Card>
      )}

      <Modal
        open={!!editing} onClose={() => !saving && setEditing(null)} wide
        title={`${editing?.id ? 'Edit' : 'Add'} ${schema.singular}`}
        footer={<><Button variant="outline" onClick={() => setEditing(null)} disabled={saving}>Cancel</Button><Button onClick={save} loading={saving}>Save</Button></>}
      >
        {editing && <SchemaForm sections={schema.sections} values={editing.values} onChange={(values) => setEditing((e) => ({ ...e, values }))} suggestions={suggestions} />}
      </Modal>
    </div>
  )
}
