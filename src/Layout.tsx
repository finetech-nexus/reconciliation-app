import type { ReactNode } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { ACTORS, useSession } from './auth/Session'

const NAV = [
  { to: '/', label: 'Vue d\'ensemble', icon: '◫', end: true },
  { to: '/imports', label: 'Imports', icon: '▤' },
  { to: '/reconciliations', label: 'Rapprochements', icon: '⇄' },
  { to: '/exceptions', label: 'Suspens', icon: '◈' },
  { to: '/accounts', label: 'Comptes', icon: '◎' },
  { to: '/reports', label: 'Rapport', icon: '◇' },
  { to: '/audit', label: 'Piste d\'audit', icon: '✳' },
]

export default function Layout({ children }: { children: ReactNode }) {
  const { session, signOut } = useSession()
  const { pathname } = useLocation()
  const current = NAV.find((item) => (item.end ? pathname === '/' : pathname.startsWith(item.to)))
  const actor = session ? ACTORS[session.role] : null
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">R</div>
          <div>
            <small>Nexus Bank</small>
            <strong>Reconcilia</strong>
          </div>
        </div>
        {NAV.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            <span className="nav-icon" aria-hidden="true">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
        <div className="sidebar-foot">
          <div className="sidebar-note">
            <strong>{actor?.label}</strong>
            <span>{actor?.hint}. Le contrôle d'accès est appliqué par l'API.</span>
          </div>
          <button className="btn ghost" type="button" onClick={signOut} style={{ width: '100%' }}>
            Changer de rôle
          </button>
        </div>
      </aside>
      <main className="workspace">
        <div className="workspace-topbar">
          <div className="breadcrumb">
            <span>Reconcilia</span>
            <span className="breadcrumb-separator">/</span>
            <strong>{current?.label ?? 'Atelier'}</strong>
          </div>
          <div className="workspace-tools">
            <span className="workspace-tag">{session?.role}</span>
            <span className="user-avatar" aria-label={actor?.label}>{actor?.label.slice(0, 1)}</span>
          </div>
        </div>
        {children}
      </main>
    </div>
  )
}
