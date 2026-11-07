import { useEffect, useState } from 'react'
import { doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from '../firebase/Config'
import { useCollection } from '../hooks/useCollection'
import { Button, Card, Field, Input, Spinner, useToast } from '../components/ui'
import { ImagesField } from '../components/fields'

/** homescreen/featured → the hero "Ultimate Guide" card on the app's home screen. */
export default function FeaturedImage() {
  const { data, loading } = useCollection('homescreen')
  const current = data.find((d) => d.id === 'featured')
  const [imageUrl, setImageUrl] = useState('')
  const [title, setTitle] = useState('')
  const [busy, setBusy] = useState(false)
  const toast = useToast()

  useEffect(() => { if (current) { setImageUrl(current.imageUrl || ''); setTitle(current.title || '') } }, [current?.imageUrl, current?.title]) // eslint-disable-line

  if (loading) return <Spinner className="size-8" />

  const save = async () => {
    setBusy(true)
    try {
      await setDoc(doc(db, 'homescreen', 'featured'), { type: 'featuredImage', imageUrl, title, updatedAt: serverTimestamp() }, { merge: true })
      toast.success('Featured card updated')
    } catch { toast.error('Could not save') } finally { setBusy(false) }
  }

  return (
    <Card className="max-w-2xl space-y-5 p-6">
      <Field label="Card title"><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="The Ultimate Guide to Soweto" /></Field>
      <Field label="Cover image"><ImagesField multiple={false} value={imageUrl} onChange={setImageUrl} folder="homescreen" /></Field>
      {imageUrl && (
        <div className="relative h-48 overflow-hidden rounded-2xl">
          <img src={imageUrl} alt="" className="size-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/80 to-transparent" />
          <p className="absolute bottom-4 left-4 text-xl font-extrabold text-white">{title}</p>
        </div>
      )}
      <Button onClick={save} loading={busy}>Save</Button>
    </Card>
  )
}
