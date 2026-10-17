import type { ReactNode } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useSession } from './auth/Session'
import { LANGS, useI18n, type MessageKey } from './i18n'

const NAV: { to: string; label: MessageKey; icon: string; end?: boolean }[] = [
  { to: '/', label: 'nav.overview', icon: '◫', end: true },
  { to: '/imports', label: 'nav.imports', icon: '▤' },
  { to: '/reconciliations', label: 'nav.runs', icon: '⇄' },
  { to: '/exceptions', label: 'nav.exceptions', icon: '◈' },
  { to: '/accounts', label: 'nav.accounts', icon: '◎' },
  { to: '/reports', label: 'nav.report', icon: '◇' },
  { to: '/audit', label: 'nav.audit', icon: '✳' },
  { to: '/guide', label: 'nav.guide', icon: '☰' },
]

export default function Layout({ children }: { children: ReactNode }) {
  const { session, signOut } = useSession()
  const { pathname } = useLocation()
  const { t, lang, setLang } = useI18n()
  const current = NAV.find((item) => (item.end ? pathname === '/' : pathname.startsWith(item.to)))
  const roleLabel = session ? t(`role.${session.role}.label` as MessageKey) : ''
  const roleHint = session ? t(`role.${session.role}.hint` as MessageKey) : ''
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
            <span>{t(item.label)}</span>
          </NavLink>
        ))}
        <div className="sidebar-foot">
          <div className="sidebar-note">
            <strong>{roleLabel}</strong>
            <span>{roleHint}. {t('layout.note')}</span>
          </div>
          <button className="btn ghost" type="button" onClick={signOut} style={{ width: '100%' }}>
            {t('layout.switch')}
          </button>
        </div>
      </aside>
      <main className="workspace">
        <div className="workspace-topbar">
          <div className="breadcrumb">
            <span>Reconcilia</span>
            <span className="breadcrumb-separator">/</span>
            <strong>{current ? t(current.label) : t('layout.fallback')}</strong>
          </div>
          <div className="workspace-tools">
            <div className="filters language-tabs" role="group" aria-label="Language">
              {LANGS.map((code) => (
                <button key={code} className={`chip${lang === code ? ' on' : ''}`} type="button" onClick={() => setLang(code)}>
                  {code.toUpperCase()}
                </button>
              ))}
            </div>
            <span className="workspace-tag">{session?.role}</span>
            <span className="user-avatar" aria-label={roleLabel}>{roleLabel.slice(0, 1)}</span>
          </div>
        </div>
        {children}
      </main>
    </div>
  )
}
