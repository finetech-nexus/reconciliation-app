import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { badgeClass, createApi } from '../api/client'
import { useSession } from '../auth/Session'
import type { ImportBatch } from '../types'
import { EXT_SAMPLE, GL_SAMPLE } from './demo'

const canImport = (role?: string) => role === 'RECON_OPERATOR' || role === 'RECON_ADMIN'

export default function ImportsPage() {
  const { session } = useSession()
  const navigate = useNavigate()
  const [rows, setRows] = useState<ImportBatch[]>([])
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [sourceSystem, setSourceSystem] = useState('FINERACT')
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
      const created = await api.createImport({
        sourceSystem, sourceType, businessDate, sourceBatchId, currency, expectedRecordCount: 0, metadata: { schemaVersion: '1.0' },
      })
      if (!created.replayed) {
        await api.upload(created.importId, file)
        await api.commit(created.importId, controlTotal || undefined)
      }
      navigate(`/imports/${created.importId}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Import refusé')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="kicker">Ingestion</div>
          <h1>Lots d'import</h1>
          <p className="lead">Le lot est reçu avant d'être déclaré conforme. Un rejeu du même identifiant source ne crée pas de doublon.</p>
        </div>
      </div>
      {error && <div className="alert">{error}</div>}
      {canImport(session?.role) && (
        <form className="form-panel" onSubmit={submit} style={{ marginBottom: 22 }}>
          <h2 className="section-title">Nouveau lot</h2>
          <div className="fields">
            <label className="field">Système
              <select value={sourceSystem} onChange={(e) => setSourceSystem(e.target.value)}>
                <option value="FINERACT">FINERACT</option>
                <option value="BCT">BCT</option>
                <option value="CORRESPONDENT">CORRESPONDENT</option>
              </select>
            </label>
            <label className="field">Type
              <select value={sourceType} onChange={(e) => {
                const next = e.target.value
                setSourceType(next)
                setFile(next === 'ACCOUNTING_ENTRIES' ? GL_SAMPLE : EXT_SAMPLE)
                setSourceSystem(next === 'ACCOUNTING_ENTRIES' ? 'FINERACT' : 'BCT')
              }}>
                <option value="ACCOUNTING_ENTRIES">Écritures comptables</option>
                <option value="EXTERNAL_TRANSACTIONS">Mouvements externes</option>
              </select>
            </label>
            <label className="field">Date métier<input value={businessDate} onChange={(e) => setBusinessDate(e.target.value)} /></label>
            <label className="field">Identifiant source<input value={sourceBatchId} onChange={(e) => setSourceBatchId(e.target.value)} /></label>
            <label className="field">Devise<input value={currency} onChange={(e) => setCurrency(e.target.value.toUpperCase())} maxLength={3} /></label>
            <label className="field">Total de contrôle<input value={controlTotal} placeholder="optionnel" onChange={(e) => setControlTotal(e.target.value)} /></label>
            <label className="field full">Fichier CSV canonique
              <textarea className="code" value={file} onChange={(e) => setFile(e.target.value)} />
            </label>
          </div>
          <div className="row-actions" style={{ marginTop: 14 }}>
            <button className="btn" type="button" onClick={() => setFile(GL_SAMPLE)}>Jeu comptable</button>
            <button className="btn" type="button" onClick={() => { setFile(EXT_SAMPLE); setSourceType('EXTERNAL_TRANSACTIONS'); setSourceSystem('BCT') }}>Jeu externe</button>
            <button className="btn primary" type="submit" disabled={busy}>{busy ? 'Contrôle…' : 'Importer'}</button>
          </div>
        </form>
      )}
      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>Lot</th><th>Source</th><th>Date</th><th>Statut</th><th>Acceptées</th><th>Rejetées</th></tr>
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
            {rows.length === 0 && <tr><td colSpan={6}>Aucun lot pour le moment.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
