import { useMemo } from 'react'
import { doc, getDocs, collection, serverTimestamp, writeBatch } from 'firebase/firestore'
import { db } from '../firebase/Config'
import { TRANSPORT_MODES, TRANSPORT_SCHEMA, TRANSPORT_SEED } from '../lib/schemas'
import { useCollection } from '../hooks/useCollection'
import { PageHeader, Tabs } from '../components/ui'
import CollectionManager from '../components/CollectionManager'
import SeedButton from '../components/SeedButton'
import { useTab } from '../hooks/useTab'

async function seedRoutes() {
  const existing = (await getDocs(collection(db, 'transport'))).size
  if (existing) return 0
  const batch = writeBatch(db)
  TRANSPORT_SEED.forEach((r) => batch.set(doc(collection(db, 'transport')), { ...r, createdAt: serverTimestamp(), updatedAt: serverTimestamp() }))
  await batch.commit()
  return TRANSPORT_SEED.length
}

export default function Transport() {
  const { data } = useCollection('transport')

  // Modes are dynamic: the defaults plus any mode already used in the data (e.g. "tram")
  const modes = useMemo(() => {
    const known = new Map(TRANSPORT_MODES.map((m) => [m.key, m.label]))
    data.forEach((r) => { const m = (r.mode || 'bus').toLowerCase(); if (!known.has(m)) known.set(m, m[0].toUpperCase() + m.slice(1)) })
    return [...known].map(([key, label]) => ({ key, label, count: data.filter((r) => (r.mode || 'bus') === key).length }))
  }, [data])

  const tabs = [{ key: 'all', label: 'All routes', count: data.length }, ...modes]
  const [tab, setTab] = useTab(tabs.map((t) => t.key), 'all')

  const scope = tab === 'all' ? undefined : (r) => (r.mode || 'bus') === tab
  return (
    <>
      <PageHeader title="Transport" subtitle="Bus, train and taxi routes. Edits show up in the app’s Transport screen immediately." />
      <Tabs tabs={tabs} value={tab} onChange={setTab} className="mb-5" />
      <CollectionManager
        key={tab} schema={TRANSPORT_SCHEMA} scope={scope}
        newDefaults={tab === 'all' ? undefined : { mode: tab }}
        emptyAction={data.length === 0 && <SeedButton label="Load sample routes" onSeed={seedRoutes} />}
        emptyText="No routes yet. Add one, or load a few sample routes to get started."
      />
    </>
  )
}
