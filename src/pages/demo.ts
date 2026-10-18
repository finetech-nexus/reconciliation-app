export const GL_SAMPLE = `source_id;account_id;booking_date;value_date;currency;amount;direction;reference
GL-001;BCT-TND-001;2026-10-16;2026-10-16;TND;25000.000;CREDIT;REF-001
GL-002;BCT-TND-001;2026-10-16;2026-10-16;TND;11999.000;DEBIT;REF-002
GL-003;BCT-TND-001;2026-10-16;2026-10-16;TND;3000.000;CREDIT;REF-005
GL-004;BCT-TND-001;2026-10-16;2026-10-16;TND;5000.000;CREDIT;REF-005
GL-005;BCT-TND-001;2026-10-16;2026-10-16;TND;5000.000;DEBIT;REF-AMB
GL-006;BCT-TND-001;2026-10-16;2026-10-16;TND;5000.000;DEBIT;REF-AMB
GL-007;BCT-TND-001;2026-10-16;2026-10-16;TND;1500.000;CREDIT;REF-ORPHAN
`

export const BCT_SAMPLE = `source_id;account_id;booking_date;value_date;currency;amount;direction;reference
TX-001;BCT-TND-001;2026-10-16;2026-10-16;TND;25000.000;DEBIT;REF-001
TX-002;BCT-TND-001;2026-10-16;2026-10-16;TND;12000.000;CREDIT;REF-002
TX-003;BCT-TND-001;2026-10-16;2026-10-16;TND;8000.000;DEBIT;REF-005
TX-004;BCT-TND-001;2026-10-16;2026-10-16;TND;5000.000;DEBIT;REF-AMB
TX-005;BCT-TND-001;2026-10-16;2026-10-16;TND;700.000;DEBIT;REF-NONE
`

export const SIBTEL_SAMPLE = `source_id;account_id;booking_date;value_date;currency;amount;direction;reference
SIB-001;CORR-TND-08;2026-10-16;2026-10-16;TND;1500.000;DEBIT;VIR-BIAT-001
SIB-002;CORR-TND-08;2026-10-16;2026-10-16;TND;320.500;CREDIT;PRE-BIAT-014
`

export const SMT_SAMPLE = `source_id;account_id;booking_date;value_date;currency;amount;direction;reference
SMT-001;SMT-TND-001;2026-10-16;2026-10-16;TND;860.000;CREDIT;CAP-4412
SMT-002;SMT-TND-001;2026-10-16;2026-10-16;TND;40.000;DEBIT;REFUND-4418
`

export const SWIFT_SAMPLE = `source_id;account_id;booking_date;value_date;currency;amount;direction;reference
SW-001;CORR-EUR-014;2026-10-16;2026-10-16;EUR;10000.000;CREDIT;FT261016NEXUS
SW-002;CORR-EUR-014;2026-10-16;2026-10-16;EUR;25.000;DEBIT;CHG261016
`

export const REVERSAL_GL_SAMPLE = `source_id;account_id;booking_date;value_date;currency;amount;direction;reference
GL-009;BCT-TND-001;2026-10-16;2026-10-16;TND;25000.000;DEBIT;REF-009
`

export const REVERSAL_EXT_SAMPLE = `source_id;account_id;booking_date;value_date;currency;amount;direction;reference;reversal_of
TX-009;BCT-TND-001;2026-10-16;2026-10-16;TND;25000.000;CREDIT;REV-REF-009;REF-009
`

export const GL_JSON_SAMPLE = `{
  "records": [
    {
      "source_id": "GL-001",
      "account_id": "BCT-TND-001",
      "booking_date": "2026-10-16",
      "value_date": "2026-10-16",
      "currency": "TND",
      "amount": "25000.000",
      "direction": "CREDIT",
      "reference": "REF-001"
    }
  ]
}
`

