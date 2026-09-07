# Firebase data storage

Solar ERP uses Firebase Authentication + Cloud Firestore as the cross-device source of truth.

Persisted ERP collections include:
- settings/companyProfile
- customers
- projects
- invoices
- quotations
- products (inventory)
- stockLogs
- distributors
- purchases
- purchaseReturns
- payments
- expenses
- employees
- auditLogs
- notifications
- accounts
- cashInTransactions
- cashOutTransactions
- accountTransfers
- serviceTickets
- subsidyRecords
- netMeteringRecords

LocalStorage is retained only as a browser-side cache/backup for offline UX and UI preferences. It is not the authoritative database.

Important: Gemini API keys remain browser-local by design and are not uploaded to Firestore.
