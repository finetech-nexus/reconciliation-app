import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { badgeClass, createApi, money } from '../api/client'
import { useSession } from '../auth/Session'
import type { Report } from '../types'

export default function ReportPage() {
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
          <div className="kicker">Indicateurs</div>
          <h1>Rapport de rapprochement</h1>
          <p className="lead">{report ? `Du ${report.from} au ${report.to}. Les exécutions SUPERSEDED restent consultables dans la liste.` : 'Chargement'}</p>
        </div>
      </div>
      {error && <div className="alert">{error}</div>}
      {report && (
        <>
          <div className="stats">
            <div className="stat"><span>Imports</span><b>{report.imports}</b></div>
            <div className="stat"><span>Suspens ouverts</span><b>{report.openExceptions}</b></div>
            <div className="stat"><span>Montant rapproché</span><b>{money(report.matchedAmount)}</b></div>
            <div className="stat"><span>Montant en suspens</span><b>{money(report.exceptionAmount)}</b></div>
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Exécution</th><th>Compte</th><th>Statut</th><th>Rapproché</th><th>Écart</th></tr></thead>
              <tbody>
                {report.runs.map((run) => (
                  <tr key={run.reconciliationId}>
                    <td><Link to={`/reconciliations/${run.reconciliationId}`}><strong>{run.reconciliationId}</strong></Link></td>
                    <td>{run.accountCode}</td>
                    <td><span className={badgeClass(run.status)}>{run.status}</span></td>
                    <td>{money(run.matchedTotal, run.currency)}</td>
                    <td>{money(run.difference, run.currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
