import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { badgeClass, createApi, money } from '../api/client'
import { useSession } from '../auth/Session'
import type { Run } from '../types'

export default function ReconciliationDetail() {
  const { reconciliationId = '' } = useParams()
  const { session } = useSession()
  const [run, setRun] = useState<Run | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!session) return
    createApi(session).run(reconciliationId).then(setRun).catch((e: Error) => setError(e.message))
  }, [session, reconciliationId])

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="kicker">Preuve de rapprochement</div>
          <h1>{reconciliationId}</h1>
          <p className="lead">{run ? `Règle ${run.ruleVersion} · ${run.timings} · ${run.correlationId}` : 'Chargement'}</p>
        </div>
        <Link className="btn" to="/exceptions">Voir les suspens</Link>
      </div>
      {error && <div className="alert">{error}</div>}
      {run && (
        <>
          <div className="stats">
            <div className="stat"><span>Statut</span><b style={{ fontSize: 18 }}><span className={badgeClass(run.status)}>{run.status}</span></b></div>
            <div className="stat"><span>Externe</span><b>{money(run.externalTotal, run.currency)}</b></div>
            <div className="stat"><span>Comptabilité</span><b>{money(run.accountingTotal, run.currency)}</b></div>
            <div className="stat"><span>Écart</span><b>{money(run.difference, run.currency)}</b></div>
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Type</th><th>Référence</th><th>Montant</th><th>Détail</th></tr></thead>
              <tbody>
                {run.matches.map((match) => (
                  <tr key={`${match.matchType}-${match.reference}`}>
                    <td><span className={badgeClass(match.matchType)}>{match.matchType}</span></td>
                    <td>{match.reference}</td>
                    <td>{money(match.amount, run.currency)}</td>
                    <td className="mono">{match.items.map((item) => `${item.side} ${item.sourceRecordId}`).join(' · ')}</td>
                  </tr>
                ))}
                {run.matches.length === 0 && <tr><td colSpan={4}>Aucune correspondance automatique.</td></tr>}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
