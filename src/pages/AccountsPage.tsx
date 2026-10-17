import { useEffect, useState } from 'react'
import { createApi } from '../api/client'
import { useSession } from '../auth/Session'
import type { Account } from '../types'

export default function AccountsPage() {
  const { session } = useSession()
  const [rows, setRows] = useState<Account[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!session) return
    createApi(session).accounts().then(setRows).catch((e: Error) => setError(e.message))
  }, [session])

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="kicker">Référentiel</div>
          <h1>Comptes et correspondants</h1>
          <p className="lead">Le périmètre de comptes est contrôlé côté serveur. Un acteur sans périmètre explicite voit le référentiel de lancement.</p>
        </div>
      </div>
      {error && <div className="alert">{error}</div>}
      <div className="grid">
        {rows.map((account) => (
          <article key={account.accountCode} className="card">
            <span className="badge type-exchange">{account.currency}</span>
            <h3>{account.accountCode}</h3>
            <p className="meta">{account.name}</p>
            <p className="mono">{account.correspondent}</p>
          </article>
        ))}
      </div>
    </div>
  )
}
