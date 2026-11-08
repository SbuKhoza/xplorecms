import { NavLink, Outlet } from 'react-router-dom'
import { LayoutDashboard, MapPinned, Landmark, Megaphone, Bus, ShieldCheck, LogOut } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import { cn } from '../lib/utils'

export const NAV = [
  { to: '/', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/places', label: 'Places', icon: MapPinned },
  { to: '/soweto', label: 'Soweto', icon: Landmark },
  { to: '/community', label: 'Community', icon: Megaphone },
  { to: '/transport', label: 'Transport', icon: Bus },
  { to: '/admin', label: 'Admin', icon: ShieldCheck },
]

export default function Layout() {
  const { user, role, logout } = useAuth()
  const link = ({ isActive }) => cn(
    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition',
    isActive ? 'bg-brand text-white' : 'text-white/70 hover:bg-white/10 hover:text-white',
  )

  return (
    <div className="min-h-screen lg:flex">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col bg-ink p-4 text-white lg:flex">
        <div className="mb-6 px-2 pt-2">
          <p className="text-xl font-extrabold tracking-tight">Xplore <span className="text-brand">Soweto</span></p>
          <p className="text-xs font-medium text-white/50">Content admin</p>
        </div>
        <nav className="space-y-1">
          {NAV.map(({ to, label, icon: NavIcon, end }) => (
            <NavLink key={to} to={to} end={end} className={link}><NavIcon className="size-4" />{label}</NavLink>
          ))}
        </nav>
        <div className="mt-auto border-t border-white/10 pt-4">
          <p className="truncate px-2 text-sm font-semibold">{user?.email}</p>
          <p className="mb-3 px-2 text-xs capitalize text-white/50">{role === 'superadmin' ? 'Super admin' : role}</p>
          <button onClick={logout} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-white/70 hover:bg-white/10 hover:text-white">
            <LogOut className="size-4" /> Sign out
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 bg-ink text-white lg:hidden">
        <div className="flex items-center justify-between px-4 pt-3">
          <p className="font-extrabold tracking-tight">Xplore <span className="text-brand">Soweto</span></p>
          <button onClick={logout} aria-label="Sign out" className="rounded-lg p-2 text-white/70 hover:bg-white/10"><LogOut className="size-4" /></button>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 py-2">
          {NAV.map(({ to, label, icon: NavIcon, end }) => (
            <NavLink key={to} to={to} end={end} className={link}><NavIcon className="size-4" />{label}</NavLink>
          ))}
        </nav>
      </header>

      <main className="min-w-0 flex-1 p-4 sm:p-8"><Outlet /></main>
    </div>
  )
}
