import type { Account, AuditEvent, ExceptionItem, ImportBatch, ImportRecord, Page, Report, Role, Run } from '../types'

type Session = { actorId: string; role: Role }

async function request<T>(session: Session, path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers)
  headers.set('X-Actor-Id', session.actorId)
  headers.set('X-Actor-Roles', session.role)
  headers.set('X-Correlation-Id', `corr-${crypto.randomUUID().slice(0, 8)}`)
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
  if (init.method && init.method !== 'GET') headers.set('Idempotency-Key', crypto.randomUUID())
  const response = await fetch(path, { ...init, headers })
  const text = await response.text()
  const body = text ? JSON.parse(text) : null
  if (!response.ok) {
    throw new Error(body?.message || `Erreur ${response.status}`)
  }
  return body as T
}

export function createApi(session: Session) {
  return {
    accounts: () => request<Account[]>(session, '/api/v1/accounts'),
    report: () => request<Report>(session, '/api/v1/reports/reconciliation'),
    imports: (page = 0) => request<Page<ImportBatch>>(session, `/api/v1/imports?page=${page}&size=20`),
    import: (id: string) => request<ImportBatch>(session, `/api/v1/imports/${id}`),
    records: (id: string) => request<Page<ImportRecord>>(session, `/api/v1/imports/${id}/records?size=50`),
    createImport: (payload: unknown) =>
      request<ImportBatch>(session, '/api/v1/imports', { method: 'POST', body: JSON.stringify(payload) }),
    upload: (id: string, csv: string) =>
      request<ImportBatch>(session, `/api/v1/imports/${id}/files`, {
        method: 'POST',
        headers: { 'Content-Type': 'text/csv' },
        body: csv,
      }),
    commit: (id: string, controlTotal?: string) =>
      request<ImportBatch>(session, `/api/v1/imports/${id}/commit`, {
        method: 'POST',
        body: JSON.stringify(controlTotal ? { controlTotal } : {}),
      }),
    runs: () => request<Page<Run>>(session, '/api/v1/reconciliations?size=20'),
    run: (id: string) => request<Run>(session, `/api/v1/reconciliations/${id}`),
    reconcile: (payload: unknown) =>
      request<Run>(session, '/api/v1/reconciliations', { method: 'POST', body: JSON.stringify(payload) }),
    exceptions: (status = '') =>
      request<Page<ExceptionItem>>(session, `/api/v1/exceptions?size=50${status ? `&status=${status}` : ''}`),
    exception: (id: string) => request<ExceptionItem>(session, `/api/v1/exceptions/${id}`),
    resolve: (id: string, proposal: string, comment: string) =>
      request<ExceptionItem>(session, `/api/v1/exceptions/${id}/resolve`, {
        method: 'POST',
        body: JSON.stringify({ proposal, comment }),
      }),
    approve: (id: string, decision: 'APPROVE' | 'REJECT', comment: string) =>
      request<ExceptionItem>(session, `/api/v1/exceptions/${id}/approve`, {
        method: 'POST',
        body: JSON.stringify({ decision, comment }),
      }),
    reopen: (id: string, comment: string) =>
      request<ExceptionItem>(session, `/api/v1/exceptions/${id}/reopen`, {
        method: 'POST',
        body: JSON.stringify({ comment }),
      }),
    audit: () => request<Page<AuditEvent>>(session, '/api/v1/audit?size=40'),
  }
}

export function badgeClass(status: string) {
  const tone: Record<string, string> = {
    LOADED: 'on',
    RESOLVED: 'on',
    COMPLETED: 'on',
    EXACT: 'on',
    GROUPED: 'type-invest',
    REJECTED: 'off',
    QUARANTINED: 'off',
    ANOMALY: 'off',
    AMOUNT_MISMATCH: 'off',
    OPEN: 'type-card',
    REOPENED: 'type-plan',
    PARTIAL: 'type-card',
    PENDING_APPROVAL: 'type-promo',
    AMBIGUOUS_MATCH: 'type-promo',
    RECEIVED: 'type-exchange',
    STAGING: 'type-exchange',
    REVERSAL: 'type-exchange',
    UNMATCHED_TRANSACTION: 'type-card',
    UNMATCHED_ENTRY: 'type-plan',
    SUPERSEDED: 'type-plan',
  }
  return `badge ${tone[status] ?? 'type-exchange'}`
}

export function money(amount: string | number | null | undefined, currency?: string | null) {
  if (amount == null || amount === '') return '—'
  return currency ? `${amount} ${currency}` : String(amount)
}
