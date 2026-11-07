import { PLACE_ORDER, PLACE_SCHEMAS } from '../lib/schemas'
import { PageHeader, Tabs } from '../components/ui'
import CollectionManager from '../components/CollectionManager'
import { useTab } from '../hooks/useTab'

const tabs = PLACE_ORDER.map((k) => ({ key: k, label: PLACE_SCHEMAS[k].label, icon: PLACE_SCHEMAS[k].icon }))

export default function Places() {
  const [tab, setTab] = useTab(PLACE_ORDER)
  return (
    <>
      <PageHeader title="Places" subtitle="Restaurants, stays, things to do and essential services." />
      <Tabs tabs={tabs} value={tab} onChange={setTab} className="mb-5" />
      {/* key= remounts the manager so search/filter/selection reset per tab */}
      <CollectionManager key={tab} schema={PLACE_SCHEMAS[tab]} />
    </>
  )
}
