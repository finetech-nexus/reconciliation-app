import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { badgeClass, createApi, money } from '../api/client'
import { useSession } from '../auth/Session'
import { useI18n } from '../i18n'
import type { ImportBatch, ImportRecord } from '../types'

export default function ImportDetail() {
  const { importId = '' } = useParams()
  const { session } = useSession()
  const { t } = useI18n()
  const [batch, setBatch] = useState<ImportBatch | null>(null)
  const [records, setRecords] = useState<ImportRecord[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!session) return
    const api = createApi(session)
    Promise.all([api.import(importId), api.records(importId)])
      .then(([item, page]) => { setBatch(item); setRecords(page.content) })
      .catch((e: Error) => setError(e.message))
  }, [session, importId])

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="kicker">{t('imd.kicker')}</div>
          <h1>{importId}</h1>
          <p className="lead">{batch ? `${batch.sourceSystem} · ${batch.businessDate} · ${batch.currency}` : t('common.loading')}</p>
        </div>
        <Link className="btn" to="/imports">{t('common.back')}</Link>
      </div>
      {error && <div className="alert">{error}</div>}
      {batch && (
        <div className="stats">
          <div className="stat"><span>{t('common.status')}</span><b style={{ fontSize: 18 }}><span className={badgeClass(batch.status)}>{batch.status}</span></b></div>
          <div className="stat"><span>{t('imd.accepted')}</span><b>{batch.acceptedRecords}</b></div>
          <div className="stat"><span>{t('imd.rejected')}</span><b>{batch.rejectedRecords}</b></div>
          <div className="stat"><span>{t('imd.amount')}</span><b>{money(batch.acceptedAmount, batch.currency)}</b></div>
        </div>
      )}
      {batch?.detail && <div className="alert">{batch.detail}</div>}
      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>{t('imd.source')}</th><th>{t('common.account')}</th><th>{t('common.reference')}</th><th>{t('common.amount')}</th><th>{t('imd.direction')}</th><th>{t('common.status')}</th></tr>
          </thead>
          <tbody>
            {records.map((row) => (
              <tr key={row.sourceRecordId}>
                <td className="mono">{row.sourceRecordId}</td>
                <td>{row.accountCode}</td>
                <td>{row.reference}</td>
                <td>{money(row.amount, row.currency)}</td>
                <td>{row.direction}</td>
                <td><span className={badgeClass(row.status)}>{row.status}</span>{row.rejectReason && <div className="meta">{row.rejectReason}</div>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
