import { Navigate, Route, Routes } from 'react-router-dom'
import { ACTORS, SessionProvider, useSession } from './auth/Session'
import { useI18n } from './i18n'
import Layout from './Layout'
import type { Role } from './types'
import AccountsPage from './pages/AccountsPage'
import AuditPage from './pages/AuditPage'
import Dashboard from './pages/Dashboard'
import ExceptionDetail from './pages/ExceptionDetail'
import ExceptionsPage from './pages/ExceptionsPage'
import ImportDetail from './pages/ImportDetail'
import ImportsPage from './pages/ImportsPage'
import GuidePage from './pages/GuidePage'
import SettingsPage from './pages/SettingsPage'
import ReconciliationDetail from './pages/ReconciliationDetail'
import ReconciliationsPage from './pages/ReconciliationsPage'
import ReportPage from './pages/ReportPage'

function Gate() {
  const { signIn } = useSession()
  const { t, lang, setLang } = useI18n()
  return (
    <div className="gate">
      <div className="gate-card">
        <div className="filters language-tabs" style={{ marginBottom: 16 }}>
          {(['fr', 'en', 'ar'] as const).map((code) => (
            <button key={code} className={`chip${lang === code ? ' on' : ''}`} type="button" onClick={() => setLang(code)}>{code.toUpperCase()}</button>
          ))}
        </div>
        <div className="kicker">Nexus Bank</div>
        <h1>Reconcilia</h1>
        <p className="lead">{t('gate.lead')}</p>
        <div className="form-stack" style={{ marginTop: 22 }}>
          {(Object.keys(ACTORS) as Role[]).map((role) => (
            <button key={role} className="btn" type="button" style={{ width: '100%', justifyContent: 'space-between' }} onClick={() => signIn(role)}>
              {t(`role.${role}.label` as 'role.RECON_ADMIN.label')}
              <span className="meta" style={{ marginLeft: 8 }}>{t(`role.${role}.hint` as 'role.RECON_ADMIN.hint')}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function Protected() {
  const { session } = useSession()
  if (!session) return <Gate />
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/imports" element={<ImportsPage />} />
        <Route path="/imports/:importId" element={<ImportDetail />} />
        <Route path="/reconciliations" element={<ReconciliationsPage />} />
        <Route path="/reconciliations/:reconciliationId" element={<ReconciliationDetail />} />
        <Route path="/exceptions" element={<ExceptionsPage />} />
        <Route path="/exceptions/:exceptionId" element={<ExceptionDetail />} />
        <Route path="/accounts" element={<AccountsPage />} />
        <Route path="/reports" element={<ReportPage />} />
        <Route path="/audit" element={<AuditPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/guide" element={<GuidePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}

export default function App() {
  return (
    <SessionProvider>
      <Protected />
    </SessionProvider>
  )
}
