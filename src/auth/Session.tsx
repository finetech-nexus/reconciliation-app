import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import type { Role } from '../types'

export const ACTORS: Record<Role, { id: string; label: string; hint: string }> = {
  RECON_ADMIN: { id: '11111111-1111-1111-1111-111111111111', label: 'Administrateur', hint: 'Paramétrage et règles' },
  RECON_OPERATOR: { id: '22222222-2222-2222-2222-222222222222', label: 'Opérateur', hint: 'Imports et rapprochements' },
  RECON_ANALYST: { id: '33333333-3333-3333-3333-333333333333', label: 'Analyste', hint: 'Qualification des suspens' },
  RECON_APPROVER: { id: '44444444-4444-4444-4444-444444444444', label: 'Approbateur', hint: 'Validation indépendante' },
  RECON_AUDITOR: { id: '55555555-5555-5555-5555-555555555555', label: 'Auditeur', hint: 'Preuves et historique' },
}

type Session = { role: Role; actorId: string }

const SessionContext = createContext<{
  session: Session | null
  signIn: (role: Role) => void
  signOut: () => void
} | null>(null)

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(() => {
    const raw = sessionStorage.getItem('reconcilia-session')
    return raw ? (JSON.parse(raw) as Session) : null
  })
  const value = useMemo(
    () => ({
      session,
      signIn: (role: Role) => {
        const next = { role, actorId: ACTORS[role].id }
        sessionStorage.setItem('reconcilia-session', JSON.stringify(next))
        setSession(next)
      },
      signOut: () => {
        sessionStorage.removeItem('reconcilia-session')
        setSession(null)
      },
    }),
    [session],
  )
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export function useSession() {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error('Session absente')
  return ctx
}
