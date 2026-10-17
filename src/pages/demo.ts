export const GL_SAMPLE = `source_id;account_id;booking_date;value_date;currency;amount;direction;reference
GL-001;BCT-TND-001;2026-10-16;2026-10-16;TND;25000.000;CREDIT;REF-001
GL-002;BCT-TND-001;2026-10-16;2026-10-16;TND;11999.000;DEBIT;REF-002
GL-003;BCT-TND-001;2026-10-16;2026-10-16;TND;3000.000;CREDIT;REF-005
GL-004;BCT-TND-001;2026-10-16;2026-10-16;TND;5000.000;CREDIT;REF-005
GL-005;BCT-TND-001;2026-10-16;2026-10-16;TND;5000.000;DEBIT;REF-AMB
GL-006;BCT-TND-001;2026-10-16;2026-10-16;TND;5000.000;DEBIT;REF-AMB
GL-007;BCT-TND-001;2026-10-16;2026-10-16;TND;1500.000;CREDIT;REF-ORPHAN
`

export const EXT_SAMPLE = `source_id;account_id;booking_date;value_date;currency;amount;direction;reference
TX-001;BCT-TND-001;2026-10-16;2026-10-16;TND;25000.000;DEBIT;REF-001
TX-002;BCT-TND-001;2026-10-16;2026-10-16;TND;12000.000;CREDIT;REF-002
TX-003;BCT-TND-001;2026-10-16;2026-10-16;TND;8000.000;DEBIT;REF-005
TX-004;BCT-TND-001;2026-10-16;2026-10-16;TND;5000.000;DEBIT;REF-AMB
TX-005;BCT-TND-001;2026-10-16;2026-10-16;TND;700.000;DEBIT;REF-NONE
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

export const EXT_JSON_SAMPLE = `{
  "records": [
    {
      "sourceRecordId": "TX-001",
      "accountCode": "BCT-TND-001",
      "bookingDate": "2026-10-16",
      "valueDate": "2026-10-16",
      "currency": "TND",
      "amount": "25000.000",
      "direction": "DEBIT",
      "reference": "REF-001"
    }
  ]
}
`
