import { Newspaper, CalendarDays, Megaphone } from 'lucide-react'
import { NEWS_SCHEMA, EVENTS_SCHEMA, ANNOUNCEMENTS_SCHEMA } from '../lib/schemas'
import { PageHeader, Tabs } from '../components/ui'
import CollectionManager from '../components/CollectionManager'
import { useTab } from '../hooks/useTab'

const TABS = [
  { key: 'news', label: 'News', icon: Newspaper, schema: NEWS_SCHEMA },
  { key: 'events', label: 'Events', icon: CalendarDays, schema: EVENTS_SCHEMA },
  { key: 'announcements', label: 'Announcements', icon: Megaphone, schema: ANNOUNCEMENTS_SCHEMA },
]

export default function Community() {
  const [tab, setTab] = useTab(TABS.map((t) => t.key))
  const current = TABS.find((t) => t.key === tab)
  return (
    <>
      <PageHeader title="Community" subtitle="News, events and announcements. Saved changes appear in the app immediately." />
      <Tabs tabs={TABS} value={tab} onChange={setTab} className="mb-5" />
      <CollectionManager key={tab} schema={current.schema} />
    </>
  )
}
