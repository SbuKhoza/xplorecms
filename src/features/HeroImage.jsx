import { useEffect, useState } from 'react'
import { doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from '../firebase/Config'
import { useCollection } from '../hooks/useCollection'
import { Alert, Button, Card, Field, Spinner, Toggle, useToast } from '../components/ui'
import { ImagesField } from '../components/fields'

/** homescreen/hero → the backdrop image behind the greeting + weather card on the app's Home screen. */
export default function HeroImage() {
  const { data, loading } = useCollection('homescreen')
  const current = data.find((d) => d.id === 'hero')
  const [imageUrl, setImageUrl] = useState('')
  const [isActive, setActive] = useState(true)
  const [busy, setBusy] = useState(false)
  const toast = useToast()

  useEffect(() => { if (current) { setImageUrl(current.imageUrl || ''); setActive(current.isActive !== false) } }, [current?.imageUrl, current?.isActive]) // eslint-disable-line

  if (loading) return <Spinner className="size-8" />

  const save = async () => {
    setBusy(true)
    try {
      await setDoc(doc(db, 'homescreen', 'hero'), { type: 'hero', imageUrl, isActive, updatedAt: serverTimestamp() }, { merge: true })
      toast.success('Hero image updated')
    } catch { toast.error('Could not save') } finally { setBusy(false) }
  }

  return (
    <Card className="max-w-2xl space-y-5 p-6">
      <Alert tone="teal">Wide landscape photos work best (about 1200 × 600). The app fades the left side so the greeting stays readable, and falls back to the built-in artwork if this is empty or switched off.</Alert>
      <Field label="Hero image"><ImagesField multiple={false} value={imageUrl} onChange={setImageUrl} folder="homescreen" /></Field>
      <Toggle checked={isActive} onChange={setActive} label="Use this image in the app" />
      {imageUrl && (
        <div className="relative h-44 overflow-hidden rounded-2xl bg-bg">
          <img src={imageUrl} alt="" className="size-full object-cover opacity-90" />
          <div className="absolute inset-0 bg-gradient-to-r from-bg/70 via-bg/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-bg/95" />
          <p className="absolute left-4 top-4 text-lg font-extrabold">👋 Good morning, Thabo!</p>
        </div>
      )}
      <Button onClick={save} loading={busy}>Save</Button>
    </Card>
  )
}
