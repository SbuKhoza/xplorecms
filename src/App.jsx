import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './auth/AuthContext'
import { ToastProvider, Spinner } from './components/ui'
import Layout from './components/Layout'
import Login from './pages/Login'
import Overview from './pages/Overview'
import Places from './pages/Places'
import Soweto from './pages/Soweto'
import Community from './pages/Community'
import Transport from './pages/Transport'
import Admin from './pages/Admin'

function Protected({ children }) {
  const { user, loading, isAllowed } = useAuth()
  if (loading) return <div className="grid min-h-screen place-items-center"><Spinner className="size-8" /></div>
  return user && isAllowed ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<Protected><Layout /></Protected>}>
              <Route index element={<Overview />} />
              <Route path="places" element={<Places />} />
              <Route path="soweto" element={<Soweto />} />
              <Route path="community" element={<Community />} />
              <Route path="transport" element={<Transport />} />
              <Route path="admin" element={<Admin />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  )
}
