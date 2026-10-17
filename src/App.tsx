import { Navigate, Route, Routes } from 'react-router-dom'
import { ACTORS, SessionProvider, useSession } from './auth/Session'
import Layout from './Layout'
import type { Role } from './types'
import AccountsPage from './pages/AccountsPage'
import AuditPage from './pages/AuditPage'
import Dashboard from './pages/Dashboard'
import ExceptionDetail from './pages/ExceptionDetail'
import ExceptionsPage from './pages/ExceptionsPage'
import ImportDetail from './pages/ImportDetail'
import ImportsPage from './pages/ImportsPage'
import ReconciliationDetail from './pages/ReconciliationDetail'
import ReconciliationsPage from './pages/ReconciliationsPage'
import ReportPage from './pages/ReportPage'

function Gate() {
  const { signIn } = useSession()
  return (
    <div className="gate">
      <div className="gate-card">
        <div className="kicker">Nexus Bank</div>
        <h1>Reconcilia</h1>
        <p className="lead">Choisissez un rôle pour ouvrir l'atelier de rapprochement. En production, l'identité vient du fournisseur OIDC.</p>
        <div className="form-stack" style={{ marginTop: 22 }}>
          {(Object.keys(ACTORS) as Role[]).map((role) => (
            <button key={role} className="btn" type="button" style={{ width: '100%', justifyContent: 'space-between' }} onClick={() => signIn(role)}>
              {ACTORS[role].label}
              <span className="meta" style={{ marginLeft: 8 }}>{ACTORS[role].hint}</span>
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
