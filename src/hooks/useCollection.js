import { useEffect, useState } from 'react'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase/Config'

/** Live Firestore collection. Returns { data, loading, error }. */
export function useCollection(name) {
  const [state, setState] = useState({ data: [], loading: true, error: null })

  useEffect(() => {
    setState({ data: [], loading: true, error: null })
    const unsub = onSnapshot(
      collection(db, name),
      (snap) => setState({ data: snap.docs.map((d) => ({ id: d.id, ...d.data() })), loading: false, error: null }),
      (error) => setState({ data: [], loading: false, error }),
    )
    return unsub
  }, [name])

  return state
}
