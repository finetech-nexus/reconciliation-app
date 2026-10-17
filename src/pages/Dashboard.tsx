import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { createApi, money } from '../api/client'
import { useSession } from '../auth/Session'
import { useI18n } from '../i18n'
import type { Report } from '../types'

export default function Dashboard() {
  const { session } = useSession()
  const { t } = useI18n()
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
          <div className="kicker">{t('dash.kicker')}</div>
          <h1>{t('dash.title')}</h1>
          <p className="lead">{t('dash.lead')}</p>
        </div>
        <Link className="btn primary" to="/imports">{t('dash.new')}</Link>
      </div>
      {error && <div className="alert">{error}</div>}
      <div className="stats">
        <div className="stat"><span>{t('dash.imports')}</span><b>{report?.imports ?? '—'}</b></div>
        <div className="stat"><span>{t('dash.open')}</span><b>{report?.openExceptions ?? '—'}</b></div>
        <div className="stat"><span>{t('dash.matched')}</span><b>{money(report?.matchedAmount)}</b></div>
        <div className="stat"><span>{t('dash.rate')}</span><b>{report ? `${Math.round(Number(report.autoMatchRate) * 100)}%` : '—'}</b></div>
      </div>
      <div className="grid">
        <Link to="/imports" className="card"><span className="badge type-exchange">{t('dash.ingestion')}</span><h3>{t('dash.lots')}</h3><p className="meta">{t('dash.lotsBody')}</p></Link>
        <Link to="/reconciliations" className="card"><span className="badge type-invest">{t('dash.engine')}</span><h3>{t('dash.runs')}</h3><p className="meta">{t('dash.runsBody')}</p></Link>
        <Link to="/exceptions" className="card"><span className="badge type-card">{t('dash.workflow')}</span><h3>{t('dash.breaks')}</h3><p className="meta">{t('dash.breaksBody')}</p></Link>
        <Link to="/guide" className="card"><span className="badge type-promo">{t('guide.kicker')}</span><h3>{t('nav.guide')}</h3><p className="meta">{t('guide.lead')}</p></Link>
      </div>
    </div>
  )
}
