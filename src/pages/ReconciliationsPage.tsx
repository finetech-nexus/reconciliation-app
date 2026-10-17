import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { badgeClass, createApi, money } from '../api/client'
import { useSession } from '../auth/Session'
import { useI18n } from '../i18n'
import type { Account, Run } from '../types'

export default function ReconciliationsPage() {
  const { session } = useSession()
  const { t } = useI18n()
  const navigate = useNavigate()
  const [runs, setRuns] = useState<Run[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [accountCode, setAccountCode] = useState('BCT-TND-001')
  const [currency, setCurrency] = useState('TND')
  const [periodFrom, setPeriodFrom] = useState('2026-10-16')
  const [periodTo, setPeriodTo] = useState('2026-10-16')
  const [replay, setReplay] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const allowed = session?.role === 'RECON_OPERATOR' || session?.role === 'RECON_ADMIN'

  useEffect(() => {
    if (!session) return
    const api = createApi(session)
    Promise.all([api.runs(), api.accounts()])
      .then(([page, list]) => { setRuns(page.content); setAccounts(list) })
      .catch((e: Error) => setError(e.message))
  }, [session])

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    if (!session) return
    setBusy(true)
    setError(null)
    try {
      const run = await createApi(session).reconcile({ accountCode, currency, periodFrom, periodTo, replay })
      navigate(`/reconciliations/${run.reconciliationId}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : t('run.refused'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="kicker">{t('run.kicker')}</div>
          <h1>{t('run.title')}</h1>
          <p className="lead">{t('run.lead')}</p>
        </div>
      </div>
      {error && <div className="alert">{error}</div>}
      {allowed && (
        <form className="form-panel" onSubmit={submit} style={{ marginBottom: 22 }}>
          <div className="fields">
            <label className="field">{t('common.account')}
              <select value={accountCode} onChange={(e) => {
                const code = e.target.value
                setAccountCode(code)
                const account = accounts.find((item) => item.accountCode === code)
                if (account) setCurrency(account.currency)
              }}>
                {accounts.map((account) => <option key={account.accountCode}>{account.accountCode}</option>)}
              </select>
            </label>
            <label className="field">{t('common.currency')}<input value={currency} onChange={(e) => setCurrency(e.target.value.toUpperCase())} maxLength={3} /></label>
            <label className="field">{t('run.from')}<input value={periodFrom} onChange={(e) => setPeriodFrom(e.target.value)} /></label>
            <label className="field">{t('run.to')}<input value={periodTo} onChange={(e) => setPeriodTo(e.target.value)} /></label>
            <label className="switch"><input type="checkbox" checked={replay} onChange={(e) => setReplay(e.target.checked)} /> {t('run.replay')}</label>
          </div>
          <button className="btn primary" type="submit" disabled={busy} style={{ marginTop: 14 }}>{busy ? t('run.busy') : t('run.go')}</button>
        </form>
      )}
      <div className="table-wrap">
        <table>
          <thead><tr><th>{t('run.col.run')}</th><th>{t('common.account')}</th><th>{t('run.col.period')}</th><th>{t('run.col.rule')}</th><th>{t('common.status')}</th><th>{t('run.col.matched')}</th><th>{t('run.col.diff')}</th></tr></thead>
          <tbody>
            {runs.map((run) => (
              <tr key={run.reconciliationId}>
                <td><Link to={`/reconciliations/${run.reconciliationId}`}><strong>{run.reconciliationId}</strong></Link></td>
                <td>{run.accountCode}</td>
                <td>{run.periodFrom}</td>
                <td className="mono">{run.ruleVersion}</td>
                <td><span className={badgeClass(run.status)}>{run.status}</span></td>
                <td>{run.matchedCount}</td>
                <td>{money(run.difference, run.currency)}</td>
              </tr>
            ))}
            {runs.length === 0 && <tr><td colSpan={7}>{t('run.empty')}</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
