import { Newspaper, CalendarDays, Megaphone } from 'lucide-react'
import { collection, doc, getDocs, serverTimestamp, writeBatch } from 'firebase/firestore'
import { db } from '../firebase/Config'
import { NEWS_SCHEMA, EVENTS_SCHEMA, ANNOUNCEMENTS_SCHEMA, NEWS_SEED, EVENTS_SEED, ANNOUNCEMENTS_SEED } from '../lib/schemas'
import { PageHeader, Tabs } from '../components/ui'
import CollectionManager from '../components/CollectionManager'
import SeedButton from '../components/SeedButton'
import { useTab } from '../hooks/useTab'

/** Writes sample docs only when the collection is empty, so it never duplicates real content. */
async function seedCollection(name, makeItems) {
  if ((await getDocs(collection(db, name))).size) return 0
  const items = makeItems()
  const batch = writeBatch(db)
  items.forEach((item) => batch.set(doc(collection(db, name)), { ...item, createdAt: serverTimestamp(), updatedAt: serverTimestamp() }))
  await batch.commit()
  return items.length
}

const TABS = [
  { key: 'news', label: 'News', icon: Newspaper, schema: NEWS_SCHEMA, seed: NEWS_SEED, seedLabel: 'Load sample news', empty: 'No news yet. Add an article, or load a few sample stories to get started.' },
  { key: 'events', label: 'Events', icon: CalendarDays, schema: EVENTS_SCHEMA, seed: EVENTS_SEED, seedLabel: 'Load sample events', empty: 'No events yet. Add one, or load a few sample events to get started.' },
  { key: 'announcements', label: 'Announcements', icon: Megaphone, schema: ANNOUNCEMENTS_SCHEMA, seed: ANNOUNCEMENTS_SEED, seedLabel: 'Load sample announcements', empty: 'No announcements yet. Add one, or load a few samples to get started.' },
]

export default function Community() {
  const [tab, setTab] = useTab(TABS.map((t) => t.key))
  const current = TABS.find((t) => t.key === tab)
  return (
    <>
      <PageHeader title="Community" subtitle="News, events and announcements. Saved changes appear in the app immediately." />
      <Tabs tabs={TABS} value={tab} onChange={setTab} className="mb-5" />
      <CollectionManager
        key={tab} schema={current.schema}
        emptyAction={<SeedButton label={current.seedLabel} onSeed={() => seedCollection(current.schema.collection, current.seed)} />}
        emptyText={current.empty}
      />
    </>
  )
}