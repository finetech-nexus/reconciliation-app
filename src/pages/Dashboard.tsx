import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { createApi, money } from '../api/client'
import { useSession } from '../auth/Session'
import type { Report } from '../types'

export default function Dashboard() {
  const { session } = useSession()
  const [report, setReport] = useState<Report | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!session) return
    createApi(session).report().then(setReport).catch((e: Error) => setError(e.message))
  }, [session])

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="kicker">Supervision</div>
          <h1>Rapprochement du jour</h1>
          <p className="lead">Imports, correspondances et suspens ouverts. Les totaux restent en décimal exact, jamais en flottant.</p>
        </div>
        <Link className="btn primary" to="/imports">Nouvel import</Link>
      </div>
      {error && <div className="alert">{error}</div>}
      <div className="stats">
        <div className="stat"><span>Lots sur 30 jours</span><b>{report?.imports ?? '—'}</b></div>
        <div className="stat"><span>Suspens ouverts</span><b>{report?.openExceptions ?? '—'}</b></div>
        <div className="stat"><span>Montant rapproché</span><b>{money(report?.matchedAmount)}</b></div>
        <div className="stat"><span>Taux automatique</span><b>{report ? `${Math.round(Number(report.autoMatchRate) * 100)}%` : '—'}</b></div>
      </div>
      <div className="grid">
        <Link to="/imports" className="card"><span className="badge type-exchange">Ingestion</span><h3>Lots</h3><p className="meta">Déposer un fichier canonique, contrôler les totaux, puis promouvoir.</p></Link>
        <Link to="/reconciliations" className="card"><span className="badge type-invest">Moteur</span><h3>Rapprochements</h3><p className="meta">Correspondance exacte, groupée ou ambiguë, sans écraser l'historique.</p></Link>
        <Link to="/exceptions" className="card"><span className="badge type-card">Workflow</span><h3>Suspens</h3><p className="meta">Qualification par l'analyste, validation par un autre acteur.</p></Link>
        <Link to="/audit" className="card"><span className="badge type-promo">Audit</span><h3>Preuves</h3><p className="meta">Chaque commande sensible laisse une trace avec son corrélation id.</p></Link>
      </div>
    </div>
  )
}
