import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { badgeClass, createApi, money } from '../api/client'
import { useSession } from '../auth/Session'
import { useI18n } from '../i18n'
import type { ExceptionItem } from '../types'

const FILTERS = ['', 'OPEN', 'PENDING_APPROVAL', 'RESOLVED', 'REOPENED']

export default function ExceptionsPage() {
  const { session } = useSession()
  const { t } = useI18n()
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
          <div className="kicker">{t('exc.kicker')}</div>
          <h1>{t('exc.title')}</h1>
          <p className="lead">{t('exc.lead')}</p>
        </div>
      </div>
      {error && <div className="alert">{error}</div>}
      <div className="filters" style={{ marginBottom: 14 }}>
        {FILTERS.map((item) => (
          <button key={item || 'all'} className={`chip${status === item ? ' on' : ''}`} type="button" onClick={() => setStatus(item)}>
            {item || t('common.all')}
          </button>
        ))}
      </div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>{t('exc.col.item')}</th><th>{t('common.type')}</th><th>{t('common.account')}</th><th>{t('common.reference')}</th><th>{t('common.amount')}</th><th>{t('exc.col.priority')}</th><th>{t('common.status')}</th></tr></thead>
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
            {rows.length === 0 && <tr><td colSpan={7}>{t('exc.empty')}</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
