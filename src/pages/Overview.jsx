import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { collection, getCountFromServer, query, where } from 'firebase/firestore'
import { Bus, Landmark, Newspaper, CalendarDays, Megaphone, ArrowRight } from 'lucide-react'
import { db } from '../firebase/Config'
import { PLACE_ORDER, PLACE_SCHEMAS } from '../lib/schemas'
import { Card, PageHeader, Spinner } from '../components/ui'
import { useAuth } from '../auth/AuthContext'

const count = async (c, ...w) => (await getCountFromServer(w.length ? query(collection(db, c), ...w) : collection(db, c))).data().count

export default function Overview() {
  const { profile } = useAuth()
  const [counts, setCounts] = useState(null)

  useEffect(() => {
    (async () => {
      const entries = await Promise.all([
        ...PLACE_ORDER.map(async (k) => [k, await count(PLACE_SCHEMAS[k].collection).catch(() => 0)]),
        ['townships', await count('homescreen', where('type', '==', 'township')).catch(() => 0)],
        ['transport', await count('transport').catch(() => 0)],
        ['news', await count('news').catch(() => 0)],
        ['events', await count('events').catch(() => 0)],
        ['announcements', await count('announcements').catch(() => 0)],
      ])
      setCounts(Object.fromEntries(entries))
    })()
  }, [])

  const cards = [
    ...PLACE_ORDER.map((k) => ({ key: k, label: PLACE_SCHEMAS[k].label, icon: PLACE_SCHEMAS[k].icon, to: `/places?tab=${k}` })),
    { key: 'townships', label: 'Townships', icon: Landmark, to: '/soweto?tab=townships' },
    { key: 'transport', label: 'Transport routes', icon: Bus, to: '/transport' },
    { key: 'news', label: 'News articles', icon: Newspaper, to: '/community?tab=news' },
    { key: 'events', label: 'Events', icon: CalendarDays, to: '/community?tab=events' },
    { key: 'announcements', label: 'Announcements', icon: Megaphone, to: '/community?tab=announcements' },
  ]

  return (
    <>
      <PageHeader title={`Welcome${profile?.data?.businessName ? `, ${profile.data.businessName}` : ''}`} subtitle="Everything below is live in the Xplore Soweto app as soon as you save it." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map(({ key, label, icon: CardIcon, to }) => (
          <Link key={key} to={to}>
            <Card className="group p-5 transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="mb-4 flex items-center justify-between">
                <div className="grid size-10 place-items-center rounded-xl bg-teal-light text-teal"><CardIcon className="size-5" /></div>
                <ArrowRight className="size-4 text-muted transition group-hover:translate-x-0.5 group-hover:text-brand" />
              </div>
              <p className="text-3xl font-extrabold tracking-tight">{counts ? counts[key] : <Spinner className="size-5" />}</p>
              <p className="text-sm font-semibold text-muted">{label}</p>
            </Card>
          </Link>
        ))}
      </div>
    </>
  )
}
