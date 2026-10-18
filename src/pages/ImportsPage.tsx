import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { badgeClass, createApi } from '../api/client'
import { useSession } from '../auth/Session'
import { useI18n } from '../i18n'
import type { ImportBatch } from '../types'

const canImport = (role?: string) => role === 'RECON_OPERATOR' || role === 'RECON_ADMIN'

export default function ImportsPage() {
  const { session } = useSession()
  const { t } = useI18n()
  const navigate = useNavigate()
  const [rows, setRows] = useState<ImportBatch[]>([])
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [sourceSystem, setSourceSystem] = useState('CORE_BANKING')
  const [sourceType, setSourceType] = useState('ACCOUNTING_ENTRIES')
  const [sourceBatchId, setSourceBatchId] = useState(`LOT-${Date.now()}`)
  const [businessDate, setBusinessDate] = useState('2026-10-16')
  const [currency, setCurrency] = useState('TND')
  const [file, setFile] = useState('')
  const [controlTotal, setControlTotal] = useState('')

  function reload() {
    if (!session) return
    createApi(session).imports().then((page) => setRows(page.content)).catch((e: Error) => setError(e.message))
  }

  useEffect(() => { reload() }, [session])

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    if (!session) return
    setBusy(true)
    setError(null)
    try {
      if (!file.trim()) {
        setError(t('imp.file.missing'))
        return
      }
      const api = createApi(session)
      const created = await api.createImport({
        sourceSystem, sourceType, businessDate, sourceBatchId, currency, expectedRecordCount: 0, metadata: { schemaVersion: '1.0' },
      })
      if (!created.replayed) {
        await api.upload(created.importId, file)
        await api.commit(created.importId, controlTotal || undefined)
      }
      navigate(`/imports/${created.importId}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : t('imp.refused'))
    } finally {
      setBusy(false)
    }
  }

  async function restCall() {
    if (!session) return
    setBusy(true)
    setError(null)
    try {
      const created = await createApi(session).pullCore(businessDate, currency)
      navigate(`/imports/${created.importId}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : t('imp.refused'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="kicker">{t('imp.kicker')}</div>
          <h1>{t('imp.title')}</h1>
          <p className="lead">{t('imp.lead')}</p>
        </div>
        <Link className="btn" to="/guide">{t('imp.guide')}</Link>
      </div>
      {error && <div className="alert">{error}</div>}
      {canImport(session?.role) && (
        <form className="form-panel" onSubmit={submit} style={{ marginBottom: 22 }}>
          <h2 className="section-title">{t('imp.new')}</h2>
          <p className="meta">{t('imp.file.lead')}</p>
          <div className="fields">
            <div className="field">
              <label>{t('imp.system')}
                <select value={sourceSystem} onChange={(e) => setSourceSystem(e.target.value)}>
                  <option value="CORE_BANKING">{t('imp.system.core')}</option>
                  <option value="BCT">BCT</option>
                  <option value="CORRESPONDENT">{t('imp.system.corr')}</option>
                </select>
              </label>
              {sourceSystem === 'CORE_BANKING' && (
                <button className="btn" type="button" disabled={busy} onClick={restCall} style={{ marginTop: 8 }}>
                  {t('imp.pull.submit')}
                </button>
              )}
            </div>
            <label className="field">{t('imp.type')}
              <select value={sourceType} onChange={(e) => {
                const next = e.target.value
                setSourceType(next)
                if (next === 'ACCOUNTING_ENTRIES') setSourceSystem('CORE_BANKING')
                else if (sourceSystem === 'CORE_BANKING') setSourceSystem('BCT')
              }}>
                <option value="ACCOUNTING_ENTRIES">{t('imp.accounting')}</option>
                <option value="EXTERNAL_TRANSACTIONS">{t('imp.external')}</option>
              </select>
            </label>
            <label className="field">{t('imp.date')}<input value={businessDate} onChange={(e) => setBusinessDate(e.target.value)} /></label>
            <label className="field">{t('imp.batch')}<input value={sourceBatchId} onChange={(e) => setSourceBatchId(e.target.value)} /></label>
            <label className="field">{t('common.currency')}<input value={currency} onChange={(e) => setCurrency(e.target.value.toUpperCase())} maxLength={3} /></label>
            <label className="field">{t('imp.control')}<input value={controlTotal} placeholder={t('imp.optional')} onChange={(e) => setControlTotal(e.target.value)} /></label>
            <label className="field full">{t('imp.file')}
              <input
                type="file"
                accept=".csv,.json,text/csv,application/json"
                onChange={(event) => {
                  const chosen = event.target.files?.[0]
                  if (!chosen) return
                  chosen.text().then(setFile).catch(() => setError(t('imp.file.missing')))
                }}
              />
              <textarea className="code" value={file} placeholder={t('imp.file.hint')} onChange={(e) => setFile(e.target.value)} />
            </label>
          </div>
          <div className="row-actions" style={{ marginTop: 14 }}>
            <button className="btn primary" type="submit" disabled={busy}>{busy ? t('imp.busy') : t('imp.submit')}</button>
          </div>
        </form>
      )}
      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>{t('imp.col.batch')}</th><th>{t('imp.col.source')}</th><th>{t('imp.col.date')}</th><th>{t('common.status')}</th><th>{t('imp.col.accepted')}</th><th>{t('imp.col.rejected')}</th></tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.importId}>
                <td><Link to={`/imports/${row.importId}`}><strong>{row.importId}</strong></Link><div className="mono">{row.sourceBatchId}</div></td>
                <td>{row.sourceSystem}<div className="meta">{row.sourceType}</div></td>
                <td>{row.businessDate}</td>
                <td><span className={badgeClass(row.status)}>{row.status}</span></td>
                <td>{row.acceptedRecords}</td>
                <td>{row.rejectedRecords + row.quarantinedRecords}</td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={6}>{t('imp.empty')}</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
