import { useState } from 'react'
import { DatabaseZap } from 'lucide-react'
import { Button, useToast } from './ui'

/** One-click "load starter data" button. `onSeed` resolves to how many docs were written. */
export default function SeedButton({ label, onSeed, variant = 'outline' }) {
  const [busy, setBusy] = useState(false)
  const toast = useToast()
  return (
    <Button variant={variant} icon={DatabaseZap} loading={busy} onClick={async () => {
      setBusy(true)
      try { const n = await onSeed(); toast.success(n ? `Added ${n} item${n === 1 ? '' : 's'}` : 'Everything is already there') }
      catch (e) { console.error(e); toast.error('Could not load starter data') }
      finally { setBusy(false) }
    }}>{label}</Button>
  )
}
