import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import {
  onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut,
} from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db } from '../firebase/Config'

const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

// admin/{uid}      → super admin
// useradmin/{uid}  → business admin; must have isActive === true (approved by a super admin)
async function resolveProfile(user) {
  const adminSnap = await getDoc(doc(db, 'admin', user.uid))
  if (adminSnap.exists()) return { role: 'superadmin', data: adminSnap.data() }

  const userSnap = await getDoc(doc(db, 'useradmin', user.uid))
  if (userSnap.exists()) {
    const data = userSnap.data()
    return data.isActive ? { role: 'admin', data } : { role: 'pending', data }
  }
  return { role: 'unknown', data: null }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)      // firebase user
  const [profile, setProfile] = useState(null) // { role, data }
  const [loading, setLoading] = useState(true)

  useEffect(() => onAuthStateChanged(auth, async (u) => {
    setUser(u)
    setProfile(u ? await resolveProfile(u).catch(() => ({ role: 'unknown', data: null })) : null)
    setLoading(false)
  }), [])

  const login = useCallback((email, password) => signInWithEmailAndPassword(auth, email, password), [])

  const register = useCallback(async ({ email, password, businessName, businessType, contactNumber }) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    await setDoc(doc(db, 'useradmin', cred.user.uid), {
      email, businessName, businessType, contactNumber, createdAt: new Date(), isActive: false,
    })
    await signOut(auth) // they can't do anything until approved
  }, [])

  const logout = useCallback(() => signOut(auth), [])

  const role = profile?.role
  const value = {
    user, profile, role, loading, login, register, logout,
    isAllowed: role === 'superadmin' || role === 'admin',
    isSuper: role === 'superadmin',
  }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
