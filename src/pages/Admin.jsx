import { sendPasswordResetEmail } from 'firebase/auth'
import { Users, UserCircle } from 'lucide-react'
import { auth } from '../firebase/Config'
import { useAuth } from '../auth/AuthContext'
import { Badge, Button, Card, PageHeader, Tabs, useToast } from '../components/ui'
import CollectionManager from '../components/CollectionManager'
import { useTab } from '../hooks/useTab'

const USER_SCHEMA = {
  collection: 'useradmin', label: 'Users', singular: 'user', noImage: true, hasActive: true, titleKey: 'businessName',
  subtitle: (u) => [u.email, u.businessType, u.contactNumber].filter(Boolean).join(' • '),
  searchKeys: ['businessName', 'email', 'businessType'], filter: 'businessType', defaults: { isActive: false },
  sections: [{ title: 'Account', fields: [
    { key: 'businessName', label: 'Business name', type: 'text', width: 'full' },
    { key: 'businessType', label: 'Business type', type: 'select', width: 'half', options: ['restaurant', 'accommodation', 'recreation', 'attraction', 'transport', 'business', 'healthcare'] },
    { key: 'contactNumber', label: 'Contact number', type: 'text', width: 'half' },
    { key: 'isActive', label: 'Approved (can sign in)', type: 'toggle', width: 'full' },
  ] }],
}

function Profile() {
  const { user, role, profile } = useAuth()
  const toast = useToast()
  const d = profile?.data || {}
  const rows = [['Email', user?.email], ['Role', role === 'superadmin' ? 'Super admin' : 'Admin'], ['Business', d.businessName], ['Type', d.businessType], ['Contact', d.contactNumber]]
  return (
    <Card className="max-w-lg space-y-4 p-6">
      <dl className="divide-y divide-line">
        {rows.filter(([, v]) => v).map(([k, v]) => (
          <div key={k} className="flex justify-between py-2.5 text-sm"><dt className="font-bold text-muted">{k}</dt><dd className="font-semibold">{v}</dd></div>
        ))}
      </dl>
      <Badge tone="teal">UID: {user?.uid.slice(0, 8)}…</Badge>
      <div>
        <Button variant="outline" onClick={() => sendPasswordResetEmail(auth, user.email).then(() => toast.success('Password reset email sent')).catch(() => toast.error('Could not send email'))}>
          Send password reset email
        </Button>
      </div>
    </Card>
  )
}

export default function Admin() {
  const { isSuper } = useAuth()
  const tabs = [...(isSuper ? [{ key: 'users', label: 'Users', icon: Users }] : []), { key: 'profile', label: 'My profile', icon: UserCircle }]
  const [tab, setTab] = useTab(tabs.map((t) => t.key))
  return (
    <>
      <PageHeader title="Admin" subtitle="Approve business accounts and manage your own profile." />
      <Tabs tabs={tabs} value={tab} onChange={setTab} className="mb-5" />
      {tab === 'users' && <CollectionManager schema={USER_SCHEMA} canAdd={false} />}
      {tab === 'profile' && <Profile />}
    </>
  )
}
