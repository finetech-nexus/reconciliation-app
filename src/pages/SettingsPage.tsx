import { useEffect, useState } from 'react'
import { createApi, type CoreProfile, type Correspondent, type StatementCursor } from '../api/client'
import { useSession } from '../auth/Session'
import { useI18n } from '../i18n'

const isAdmin = (role?: string) => role === 'RECON_ADMIN'

export default function SettingsPage() {
  const { session } = useSession()
  const { t } = useI18n()
  const [profile, setProfile] = useState<CoreProfile | null>(null)
  const [correspondents, setCorrespondents] = useState<Correspondent[]>([])
  const [cursors, setCursors] = useState<StatementCursor[]>([])
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [correspondent, setCorrespondent] = useState({ code: '', name: '', bic: '', currency: 'EUR', accountCode: '' })
  const [confirmation, setConfirmation] = useState('')

  function reload() {
    if (!session) return
    const api = createApi(session)
    Promise.all([api.coreProfile(), api.correspondents(), api.cursors()])
      .then(([core, banks, marks]) => {
        setProfile(core)
        setCorrespondents(banks)
        setCursors(marks)
      })
      .catch((e: Error) => setError(e.message))
  }

  useEffect(() => { reload() }, [session])

  async function saveCore(event: React.FormEvent) {
    event.preventDefault()
    if (!session || !profile) return
    setError(null)
    try {
      const saved = await createApi(session).saveCore(profile)
      setProfile(saved)
      setNotice(t('set.saved'))
    } catch (e) {
      setError(e instanceof Error ? e.message : t('common.refused'))
    }
  }

  async function addCorrespondent(event: React.FormEvent) {
    event.preventDefault()
    if (!session) return
    setError(null)
    try {
      await createApi(session).createCorrespondent({
        ...correspondent,
        code: correspondent.code.toUpperCase(),
        currency: correspondent.currency.toUpperCase(),
        bic: correspondent.bic.toUpperCase(),
      })
      setCorrespondent({ code: '', name: '', bic: '', currency: 'EUR', accountCode: '' })
      setNotice(t('set.corr.added'))
      reload()
    } catch (e) {
      setError(e instanceof Error ? e.message : t('common.refused'))
    }
  }

  async function purge(event: React.FormEvent) {
    event.preventDefault()
    if (!session) return
    setError(null)
    try {
      await createApi(session).purge(confirmation)
      setConfirmation('')
      setNotice(t('set.purge.done'))
      reload()
    } catch (e) {
      setError(e instanceof Error ? e.message : t('common.refused'))
    }
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="kicker">{t('set.kicker')}</div>
          <h1>{t('set.title')}</h1>
          <p className="lead">{t('set.lead')}</p>
        </div>
      </div>
      {error && <div className="alert">{error}</div>}
      {notice && <p className="meta">{notice}</p>}
      {profile && (
        <form className="form-panel" onSubmit={saveCore} style={{ marginBottom: 22 }}>
          <h2 className="section-title">{t('set.core')}</h2>
          <p className="meta">{profile.configured ? t('set.ready') : t('set.missing')}</p>
          <div className="fields">
            <label className="field">{t('set.type')}
              <select
                value={profile.connectorType}
                disabled={!isAdmin(session?.role)}
                onChange={(e) => setProfile({ ...profile, connectorType: e.target.value as 'FINERACT' | 'T24' })}
              >
                <option value="FINERACT">{t('set.type.fineract')}</option>
                <option value="T24">{t('set.type.t24')}</option>
              </select>
            </label>
            <label className="field">{t('set.base')}
              <input value={profile.baseUrl} disabled={!isAdmin(session?.role)} onChange={(e) => setProfile({ ...profile, baseUrl: e.target.value })} />
            </label>
            <label className="field">{t('set.tenant')}
              <input value={profile.tenant} disabled={!isAdmin(session?.role)} onChange={(e) => setProfile({ ...profile, tenant: e.target.value })} />
            </label>
            <label className="field">{t('set.entries')}
              <input value={profile.entriesPath} disabled={!isAdmin(session?.role)} onChange={(e) => setProfile({ ...profile, entriesPath: e.target.value })} />
            </label>
            <label className="field">{t('set.accounts')}
              <input value={profile.accountsPath} disabled={!isAdmin(session?.role)} onChange={(e) => setProfile({ ...profile, accountsPath: e.target.value })} />
            </label>
          </div>
          {isAdmin(session?.role) && <button className="btn primary" type="submit" style={{ marginTop: 14 }}>{t('set.save')}</button>}
        </form>
      )}
      <section className="form-panel" style={{ marginBottom: 22 }}>
        <h2 className="section-title">{t('set.corr')}</h2>
        <p className="meta">{t('set.corr.lead')}</p>
        {isAdmin(session?.role) && (
          <form onSubmit={addCorrespondent}>
            <div className="fields">
              <label className="field">{t('set.corr.code')}<input value={correspondent.code} onChange={(e) => setCorrespondent({ ...correspondent, code: e.target.value })} required /></label>
              <label className="field">{t('set.corr.name')}<input value={correspondent.name} onChange={(e) => setCorrespondent({ ...correspondent, name: e.target.value })} required /></label>
              <label className="field">{t('set.bic')}<input value={correspondent.bic} maxLength={11} onChange={(e) => setCorrespondent({ ...correspondent, bic: e.target.value })} /></label>
              <label className="field">{t('common.currency')}<input value={correspondent.currency} maxLength={3} onChange={(e) => setCorrespondent({ ...correspondent, currency: e.target.value.toUpperCase() })} required /></label>
              <label className="field">{t('set.corr.account')}<input value={correspondent.accountCode} onChange={(e) => setCorrespondent({ ...correspondent, accountCode: e.target.value })} required /></label>
            </div>
            <button className="btn primary" type="submit" style={{ marginTop: 14 }}>{t('set.corr.add')}</button>
          </form>
        )}
        <div className="table-wrap" style={{ marginTop: 14 }}>
          <table>
            <thead>
              <tr><th>{t('set.corr.code')}</th><th>{t('set.corr.name')}</th><th>{t('set.bic')}</th><th>{t('common.currency')}</th><th>{t('common.account')}</th></tr>
            </thead>
            <tbody>
              {correspondents.map((row) => (
                <tr key={row.code}><td className="mono">{row.code}</td><td>{row.name}</td><td className="mono">{row.bic || '—'}</td><td>{row.currency}</td><td className="mono">{row.accountCode}</td></tr>
              ))}
              {correspondents.length === 0 && <tr><td colSpan={5}>{t('set.corr.empty')}</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
      <section className="form-panel" style={{ marginBottom: 22 }}>
        <h2 className="section-title">{t('set.history')}</h2>
        <p className="meta">{t('set.history.lead')}</p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>{t('imp.system')}</th><th>{t('common.account')}</th><th>{t('imp.date')}</th><th>{t('set.cursor.seq')}</th><th>{t('imp.col.batch')}</th><th>{t('set.cursor.gap')}</th></tr>
            </thead>
            <tbody>
              {cursors.map((row) => (
                <tr key={`${row.sourceSystem}-${row.accountCode}`}>
                  <td>{row.sourceSystem}</td>
                  <td className="mono">{row.accountCode}</td>
                  <td>{row.lastBusinessDate || '—'}</td>
                  <td>{row.lastSequence}</td>
                  <td className="mono">{row.lastBatchPublicId || '—'}</td>
                  <td>{row.gapDetected ? t('set.cursor.yes') : t('set.cursor.no')}</td>
                </tr>
              ))}
              {cursors.length === 0 && <tr><td colSpan={6}>{t('set.cursor.none')}</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
      {isAdmin(session?.role) && (
        <form className="form-panel" onSubmit={purge}>
          <h2 className="section-title">{t('set.purge')}</h2>
          <p className="meta">{t('set.purge.lead')}</p>
          <label className="field">{t('set.purge.confirm')}
            <input value={confirmation} onChange={(e) => setConfirmation(e.target.value)} placeholder="PURGE" />
          </label>
          <button className="btn primary" type="submit" style={{ marginTop: 14 }}>{t('set.purge.action')}</button>
        </form>
      )}
    </div>
  )
}
