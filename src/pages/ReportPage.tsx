import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { badgeClass, createApi, money } from '../api/client'
import { useSession } from '../auth/Session'
import { useI18n } from '../i18n'
import type { Report } from '../types'

export default function ReportPage() {
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
          <div className="kicker">{t('rep.kicker')}</div>
          <h1>{t('rep.title')}</h1>
          <p className="lead">{report ? t('rep.lead', { from: report.from, to: report.to }) : t('common.loading')}</p>
        </div>
      </div>
      {error && <div className="alert">{error}</div>}
      {report && (
        <>
          <div className="stats">
            <div className="stat"><span>{t('rep.imports')}</span><b>{report.imports}</b></div>
            <div className="stat"><span>{t('rep.open')}</span><b>{report.openExceptions}</b></div>
            <div className="stat"><span>{t('rep.matched')}</span><b>{money(report.matchedAmount)}</b></div>
            <div className="stat"><span>{t('rep.exception')}</span><b>{money(report.exceptionAmount)}</b></div>
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>{t('run.col.run')}</th><th>{t('common.account')}</th><th>{t('common.status')}</th><th>{t('rep.matchedCol')}</th><th>{t('run.col.diff')}</th></tr></thead>
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
