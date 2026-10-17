export type Role = 'RECON_ADMIN' | 'RECON_OPERATOR' | 'RECON_ANALYST' | 'RECON_APPROVER' | 'RECON_AUDITOR'

export type Page<T> = {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export type ImportBatch = {
  importId: string
  status: string
  acceptedRecords: number
  rejectedRecords: number
  quarantinedRecords: number
  correlationId: string
  sourceSystem: string
  sourceType: string
  businessDate: string
  sourceBatchId: string
  currency: string
  expectedRecordCount: number | null
  acceptedAmount: string
  controlTotal: string | null
  replayed: boolean
  detail: string | null
}

export type ImportRecord = {
  sourceRecordId: string
  accountCode: string
  bookingDate: string
  currency: string
  amount: string
  direction: string
  reference: string
  status: string
  rejectReason: string | null
}

export type MatchItem = { side: string; sourceRecordId: string; amount: string }

export type Match = { matchType: string; amount: string; reference: string; items: MatchItem[] }

export type Run = {
  reconciliationId: string
  status: string
  ruleVersion: string
  accountCode: string
  currency: string
  periodFrom: string
  periodTo: string
  replay: boolean
  matchedCount: number
  exceptionCount: number
  externalTotal: string
  accountingTotal: string
  matchedTotal: string
  difference: string
  balanced: boolean
  timings: string
  correlationId: string
  createdAt: string
  matches: Match[]
}

export type Action = {
  actionType: string
  actorId: string | null
  comment: string
  createdAt: string
  decision: string | null
}

export type ExceptionItem = {
  exceptionId: string
  accountCode: string
  exceptionType: string
  amount: string
  currency: string
  reference: string | null
  status: string
  priority: string
  ownerId: string | null
  detail: string | null
  detectedAt: string
  dueAt: string | null
  resolvedAt: string | null
  reconciliationId: string | null
  actions: Action[]
}

export type Account = { accountCode: string; name: string; currency: string; correspondent: string | null }

export type Report = {
  from: string
  to: string
  imports: number
  openExceptions: number
  matchedAmount: string
  exceptionAmount: string
  autoMatchRate: string
  runs: Run[]
}

export type AuditEvent = {
  eventTime: string
  actorId: string | null
  action: string
  entityType: string
  entityId: string | null
  correlationId: string
  detail: string | null
}
