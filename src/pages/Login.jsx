import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { Alert, Button, Card, Field, Input, Select, Spinner, Tabs } from '../components/ui'

// Friendly text for the Firebase auth errors people actually hit
const AUTH_ERRORS = {
  'auth/invalid-credential': 'Wrong email or password.',
  'auth/invalid-login-credentials': 'Wrong email or password.',
  'auth/wrong-password': 'Wrong email or password.',
  'auth/user-not-found': 'No account with that email. Register first.',
  'auth/invalid-email': 'That email address doesn’t look right.',
  'auth/email-already-in-use': 'An account with that email already exists.',
  'auth/weak-password': 'Password must be at least 6 characters.',
  'auth/too-many-requests': 'Too many attempts. Wait a few minutes and try again.',
  'auth/network-request-failed': 'Network error. Check your connection.',
  'auth/invalid-api-key': 'Firebase API key is invalid. Check src/firebase/Config.js or your .env.',
  'auth/api-key-not-valid.-please-pass-a-valid-api-key.': 'Firebase API key is invalid. Check src/firebase/Config.js or your .env.',
  'auth/operation-not-allowed': 'Email/password sign-in is not enabled in the Firebase console (Authentication → Sign-in method).',
}

const TYPES = ['restaurant', 'accommodation', 'recreation', 'attraction', 'transport', 'business', 'healthcare']

export default function Login() {
  const { user, role, loading, login, register, logout, isAllowed } = useAuth()
  const [mode, setMode] = useState('login')
  const [f, setF] = useState({ email: '', password: '', businessName: '', businessType: '', contactNumber: '' })
  const [msg, setMsg] = useState(null)
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }))

  if (loading) return <div className="grid min-h-screen place-items-center"><Spinner className="size-8" /></div>
  if (user && isAllowed) return <Navigate to="/" replace />

  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setMsg(null)
    try {
      if (mode === 'login') await login(f.email, f.password)
      else { await register(f); setMsg({ tone: 'green', text: 'Registered! An administrator needs to approve your account before you can sign in.' }); setMode('login') }
    } catch (err) {
      setMsg({ tone: 'red', text: AUTH_ERRORS[err.code] || err.message.replace('Firebase: ', '') })
    } finally { setBusy(false) }
  }

  // Signed in with Firebase but not (yet) an approved admin
  const blocked = user && !isAllowed && {
    pending: 'Your account is waiting for approval from a super admin.',
    unknown: 'This account isn’t registered as an admin. Please contact an administrator.',
  }[role]

  return (
    <div className="grid min-h-screen place-items-center bg-ink p-4">
      <Card className="w-full max-w-md overflow-hidden">
        <div className="bg-brand px-6 py-5 text-white">
          <h1 className="text-2xl font-extrabold tracking-tight">Xplore Soweto</h1>
          <p className="text-sm text-white/80">Content admin</p>
        </div>
        {blocked ? (
          <div className="space-y-4 p-6"><Alert>{blocked}</Alert><Button variant="outline" className="w-full" onClick={logout}>Sign out</Button></div>
        ) : (
          <>
            <Tabs tabs={[{ key: 'login', label: 'Sign in' }, { key: 'register', label: 'Register' }]} value={mode} onChange={setMode} />
            <form onSubmit={submit} className="space-y-4 p-6">
              {msg && <Alert tone={msg.tone}>{msg.text}</Alert>}
              <Field label="Email"><Input type="email" required value={f.email} onChange={set('email')} /></Field>
              <Field label="Password"><Input type="password" required minLength={6} value={f.password} onChange={set('password')} /></Field>
              {mode === 'register' && <>
                <Field label="Business name"><Input required value={f.businessName} onChange={set('businessName')} /></Field>
                <Field label="Business type"><Select required options={TYPES} value={f.businessType} onChange={set('businessType')} placeholder="Select…" /></Field>
                <Field label="Contact number"><Input required value={f.contactNumber} onChange={set('contactNumber')} /></Field>
              </>}
              <Button type="submit" loading={busy} className="w-full">{mode === 'login' ? 'Sign in' : 'Create account'}</Button>
            </form>
          </>
        )}
      </Card>
    </div>
  )
}