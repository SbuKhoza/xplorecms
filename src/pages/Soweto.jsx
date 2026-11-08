import { doc, getDocs, collection, serverTimestamp, writeBatch } from 'firebase/firestore'
import { Landmark, Image, ImagePlay, ListTree } from 'lucide-react'
import { db } from '../firebase/Config'
import { TOWNSHIP_SCHEMA, XPLORE_MENU_SCHEMA } from '../lib/schemas'
import { slugify } from '../lib/utils'
import seed from '../data/townshipsSeed.json'
import { PageHeader, Tabs } from '../components/ui'
import CollectionManager from '../components/CollectionManager'
import SeedButton from '../components/SeedButton'
import FeaturedImage from '../features/FeaturedImage'
import HeroImage from '../features/HeroImage'
import { useTab } from '../hooks/useTab'

const TABS = [
  { key: 'hero', label: 'Hero image', icon: ImagePlay },
  { key: 'townships', label: 'Townships', icon: Landmark },
  { key: 'featured', label: 'Featured card', icon: Image },
  { key: 'menu', label: 'Xplore menu', icon: ListTree },
]

// Writes the built-in township content to Firestore, skipping any that already exist.
async function seedTownships() {
  const existing = new Set((await getDocs(collection(db, 'homescreen'))).docs.map((d) => d.id))
  const batch = writeBatch(db)
  let n = 0
  seed.forEach((t) => {
    const id = slugify(t.name)
    if (existing.has(id)) return
    batch.set(doc(db, 'homescreen', id), { ...t, type: 'township', isActive: true, createdAt: serverTimestamp(), updatedAt: serverTimestamp() })
    n++
  })
  if (n) await batch.commit()
  return n
}

export default function Soweto() {
  const [tab, setTab] = useTab(TABS.map((t) => t.key))
  const seedBtn = <SeedButton label="Import built-in townships" onSeed={seedTownships} />
  return (
    <>
      <PageHeader title="Soweto" subtitle="Home-screen content: the hero image, townships, the featured guide card and the Xplore menu." />
      <Tabs tabs={TABS} value={tab} onChange={setTab} className="mb-5" />
      {tab === 'hero' && <HeroImage />}
      {tab === 'townships' && <CollectionManager key="t" schema={TOWNSHIP_SCHEMA} emptyAction={seedBtn} emptyText="Townships are loaded from here. Import the built-in set to start, then edit freely." />}
      {tab === 'featured' && <FeaturedImage />}
      {tab === 'menu' && <CollectionManager key="m" schema={XPLORE_MENU_SCHEMA} />}
    </>
  )
}
