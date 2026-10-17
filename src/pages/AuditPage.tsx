import { useEffect, useState } from 'react'
import { createApi } from '../api/client'
import { useSession } from '../auth/Session'
import type { AuditEvent } from '../types'

export default function AuditPage() {
  const { session } = useSession()
  const [rows, setRows] = useState<AuditEvent[]>([])
  const [error, setError] = useState<string | null>(null)
  const allowed = session?.role === 'RECON_AUDITOR' || session?.role === 'RECON_ADMIN'

  useEffect(() => {
    if (!session || !allowed) return
    createApi(session).audit().then((page) => setRows(page.content)).catch((e: Error) => setError(e.message))
  }, [session, allowed])

  if (!allowed) {
    return (
      <div>
        <div className="page-head"><div><div className="kicker">Audit</div><h1>Piste d'audit</h1></div></div>
        <div className="empty">Réservé aux rôles auditeur et administrateur. Le refus est aussi journalisé par l'API.</div>
      </div>
    )
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="kicker">Audit</div>
          <h1>Piste d'audit</h1>
          <p className="lead">Commandes, refus d'accès et auto-validations bloquées. Les lectures passent par les journaux de la passerelle.</p>
        </div>
      </div>
      {error && <div className="alert">{error}</div>}
      <div className="table-wrap">
        <table>
          <thead><tr><th>Quand</th><th>Action</th><th>Entité</th><th>Acteur</th><th>Détail</th></tr></thead>
          <tbody>
            {rows.map((row) => (
              <tr key={`${row.eventTime}-${row.action}-${row.entityId}`}>
                <td className="mono">{row.eventTime?.replace('T', ' ').slice(0, 19)}</td>
                <td><strong>{row.action}</strong><div className="mono">{row.correlationId}</div></td>
                <td>{row.entityType}<div className="meta">{row.entityId}</div></td>
                <td className="mono">{row.actorId?.slice(0, 8)}</td>
                <td>{row.detail}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
