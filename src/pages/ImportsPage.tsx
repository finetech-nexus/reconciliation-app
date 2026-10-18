import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { badgeClass, createApi } from '../api/client'
import { useSession } from '../auth/Session'
import { useI18n } from '../i18n'
import type { ImportBatch } from '../types'
import { EXT_SAMPLE, GL_SAMPLE } from './demo'

const canImport = (role?: string) => role === 'RECON_OPERATOR' || role === 'RECON_ADMIN'

export default function ImportsPage() {
  const { session } = useSession()
  const { t } = useI18n()
  const navigate = useNavigate()
  const [rows, setRows] = useState<ImportBatch[]>([])
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [mode, setMode] = useState<'file' | 'pull'>('file')
  const [sourceSystem, setSourceSystem] = useState('CORE_BANKING')
  const [sourceType, setSourceType] = useState('ACCOUNTING_ENTRIES')
  const [sourceBatchId, setSourceBatchId] = useState(`LOT-${Date.now()}`)
  const [businessDate, setBusinessDate] = useState('2026-10-16')
  const [currency, setCurrency] = useState('TND')
  const [file, setFile] = useState(GL_SAMPLE)
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
      const api = createApi(session)
      if (mode === 'pull') {
        const created = await api.pullCore(businessDate, currency)
        navigate(`/imports/${created.importId}`)
        return
      }
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
          <div className="row-actions" style={{ marginBottom: 14 }}>
            <button className={`btn${mode === 'file' ? ' primary' : ''}`} type="button" onClick={() => setMode('file')}>{t('imp.mode.file')}</button>
            <button className={`btn${mode === 'pull' ? ' primary' : ''}`} type="button" onClick={() => { setMode('pull'); setSourceSystem('CORE_BANKING'); setSourceType('ACCOUNTING_ENTRIES') }}>{t('imp.mode.pull')}</button>
          </div>
          <p className="meta">{mode === 'pull' ? t('imp.pull.lead') : t('imp.file.lead')}</p>
          <div className="fields">
            {mode === 'file' && (
            <label className="field">{t('imp.system')}
              <select value={sourceSystem} onChange={(e) => setSourceSystem(e.target.value)}>
                <option value="CORE_BANKING">{t('imp.system.core')}</option>
                <option value="BCT">BCT</option>
                <option value="CORRESPONDENT">{t('imp.system.corr')}</option>
              </select>
            </label>
            )}
            {mode === 'file' && (
            <label className="field">{t('imp.type')}
              <select value={sourceType} onChange={(e) => {
                const next = e.target.value
                setSourceType(next)
                setFile(next === 'ACCOUNTING_ENTRIES' ? GL_SAMPLE : EXT_SAMPLE)
                setSourceSystem(next === 'ACCOUNTING_ENTRIES' ? 'CORE_BANKING' : 'BCT')
              }}>
                <option value="ACCOUNTING_ENTRIES">{t('imp.accounting')}</option>
                <option value="EXTERNAL_TRANSACTIONS">{t('imp.external')}</option>
              </select>
            </label>
            )}
            <label className="field">{t('imp.date')}<input value={businessDate} onChange={(e) => setBusinessDate(e.target.value)} /></label>
            {mode === 'file' && <label className="field">{t('imp.batch')}<input value={sourceBatchId} onChange={(e) => setSourceBatchId(e.target.value)} /></label>}
            <label className="field">{t('common.currency')}<input value={currency} onChange={(e) => setCurrency(e.target.value.toUpperCase())} maxLength={3} /></label>
            {mode === 'file' && <label className="field">{t('imp.control')}<input value={controlTotal} placeholder={t('imp.optional')} onChange={(e) => setControlTotal(e.target.value)} /></label>}
            {mode === 'file' && (
            <label className="field full">{t('imp.file')}
              <textarea className="code" value={file} onChange={(e) => setFile(e.target.value)} />
            </label>
            )}
          </div>
          <div className="row-actions" style={{ marginTop: 14 }}>
            {mode === 'file' && <button className="btn" type="button" onClick={() => { setFile(GL_SAMPLE); setSourceType('ACCOUNTING_ENTRIES'); setSourceSystem('CORE_BANKING') }}>{t('imp.gl')}</button>}
            {mode === 'file' && <button className="btn" type="button" onClick={() => { setFile(EXT_SAMPLE); setSourceType('EXTERNAL_TRANSACTIONS'); setSourceSystem('BCT') }}>{t('imp.ext')}</button>}
            <button className="btn primary" type="submit" disabled={busy}>{busy ? t('imp.busy') : mode === 'pull' ? t('imp.pull.submit') : t('imp.submit')}</button>
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
