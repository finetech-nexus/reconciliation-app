import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { badgeClass, createApi, money } from '../api/client'
import { useSession } from '../auth/Session'
import type { ExceptionItem } from '../types'

const FILTERS = ['', 'OPEN', 'PENDING_APPROVAL', 'RESOLVED', 'REOPENED']

export default function ExceptionsPage() {
  const { session } = useSession()
  const [rows, setRows] = useState<ExceptionItem[]>([])
  const [status, setStatus] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!session) return
    createApi(session).exceptions(status).then((page) => setRows(page.content)).catch((e: Error) => setError(e.message))
  }, [session, status])

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="kicker">Workflow</div>
          <h1>Suspens</h1>
          <p className="lead">Un écart de montant, une ambiguïté ou une écriture orpheline reste visible jusqu'à une décision tracée.</p>
        </div>
      </div>
      {error && <div className="alert">{error}</div>}
      <div className="filters" style={{ marginBottom: 14 }}>
        {FILTERS.map((item) => (
          <button key={item || 'all'} className={`chip${status === item ? ' on' : ''}`} type="button" onClick={() => setStatus(item)}>
            {item || 'Tous'}
          </button>
        ))}
      </div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Suspens</th><th>Type</th><th>Compte</th><th>Référence</th><th>Montant</th><th>Priorité</th><th>Statut</th></tr></thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.exceptionId}>
                <td><Link to={`/exceptions/${row.exceptionId}`}><strong>{row.exceptionId}</strong></Link></td>
                <td><span className={badgeClass(row.exceptionType)}>{row.exceptionType}</span></td>
                <td>{row.accountCode}</td>
                <td>{row.reference}</td>
                <td>{money(row.amount, row.currency)}</td>
                <td>{row.priority}</td>
                <td><span className={badgeClass(row.status)}>{row.status}</span></td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={7}>Aucun suspens sur ce filtre.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
