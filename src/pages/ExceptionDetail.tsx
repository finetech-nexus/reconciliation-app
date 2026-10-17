import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { badgeClass, createApi, money } from '../api/client'
import { useSession } from '../auth/Session'
import { useI18n } from '../i18n'
import type { ExceptionItem } from '../types'

export default function ExceptionDetail() {
  const { exceptionId = '' } = useParams()
  const { session } = useSession()
  const { t } = useI18n()
  const [item, setItem] = useState<ExceptionItem | null>(null)
  const [proposal, setProposal] = useState('JUSTIFIED')
  const [comment, setComment] = useState('')
  const [error, setError] = useState<string | null>(null)
  const role = session?.role
  const canResolve = role === 'RECON_ANALYST' || role === 'RECON_ADMIN'
  const canApprove = role === 'RECON_APPROVER' || role === 'RECON_ADMIN'

  function load() {
    if (!session) return
    createApi(session).exception(exceptionId).then(setItem).catch((e: Error) => setError(e.message))
  }

  useEffect(() => { load() }, [session, exceptionId])

  async function act(kind: 'resolve' | 'approve' | 'reject' | 'reopen') {
    if (!session) return
    setError(null)
    try {
      const api = createApi(session)
      const next = kind === 'resolve'
        ? await api.resolve(exceptionId, proposal, comment)
        : kind === 'reopen'
          ? await api.reopen(exceptionId, comment)
          : await api.approve(exceptionId, kind === 'approve' ? 'APPROVE' : 'REJECT', comment)
      setItem(next)
      setComment('')
    } catch (e) {
      setError(e instanceof Error ? e.message : t('common.refused'))
    }
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="kicker">{t('exc.title')}</div>
          <h1>{exceptionId}</h1>
          <p className="lead">{item?.detail}</p>
        </div>
        <Link className="btn" to="/exceptions">{t('common.back')}</Link>
      </div>
      {error && <div className="alert">{error}</div>}
      {item && (
        <div className="form-shell">
          <div className="form-panel">
            <div className="row-actions" style={{ marginBottom: 14 }}>
              <span className={badgeClass(item.exceptionType)}>{item.exceptionType}</span>
              <span className={badgeClass(item.status)}>{item.status}</span>
              <span className="badge type-plan">{item.priority}</span>
            </div>
            <div className="stats">
              <div className="stat"><span>{t('common.amount')}</span><b>{money(item.amount, item.currency)}</b></div>
              <div className="stat"><span>{t('common.account')}</span><b style={{ fontSize: 18 }}>{item.accountCode}</b></div>
              <div className="stat"><span>{t('common.reference')}</span><b style={{ fontSize: 18 }}>{item.reference}</b></div>
              <div className="stat"><span>{t('exd.due')}</span><b style={{ fontSize: 16 }}>{item.dueAt?.slice(0, 10) ?? '—'}</b></div>
            </div>
            <h2 className="section-title">{t('exd.history')}</h2>
            {item.actions.length === 0 && <p className="meta">{t('exd.none')}</p>}
            {item.actions.map((action) => (
              <div key={`${action.createdAt}-${action.actionType}`} className="fee-detail">
                <p className="fee-detail-name">{action.actionType}{action.decision ? ` · ${action.decision}` : ''}</p>
                <p className="meta">{action.comment}</p>
                <p className="mono">{action.actorId} · {action.createdAt}</p>
              </div>
            ))}
          </div>
          <aside className="side-panel sticky-aside">
            <h2 className="section-title">{t('exd.decision')}</h2>
            <label className="field">{t('exd.comment')}
              <textarea value={comment} onChange={(e) => setComment(e.target.value)} />
            </label>
            {canResolve && (item.status === 'OPEN' || item.status === 'REOPENED') && (
              <>
                <label className="field" style={{ marginTop: 12 }}>{t('exd.proposal')}
                  <input value={proposal} onChange={(e) => setProposal(e.target.value)} />
                </label>
                <button className="btn primary" type="button" style={{ marginTop: 12, width: '100%' }} onClick={() => act('resolve')} disabled={!comment}>{t('exd.propose')}</button>
              </>
            )}
            {canApprove && item.status === 'PENDING_APPROVAL' && (
              <div className="row-actions" style={{ marginTop: 12 }}>
                <button className="btn primary" type="button" onClick={() => act('approve')} disabled={!comment}>{t('exd.approve')}</button>
                <button className="btn danger" type="button" onClick={() => act('reject')} disabled={!comment}>{t('exd.reject')}</button>
              </div>
            )}
            {canResolve && item.status === 'RESOLVED' && (
              <button className="btn" type="button" style={{ marginTop: 12, width: '100%' }} onClick={() => act('reopen')} disabled={!comment}>{t('exd.reopen')}</button>
            )}
            <p className="meta" style={{ marginTop: 14 }}>{t('exd.note')}</p>
          </aside>
        </div>
      )}
    </div>
  )
}
