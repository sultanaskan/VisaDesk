# Frontend Portal Specification

The API is designed to support two separately deployed web portals. They may share a component library and authentication utilities, but role-specific routes and permissions must remain separate.

## 1. Client/Agent portal

### Navigation
- Overview
- Applications / Applicant Files
- Add Application
- Wallet
- Deposit History
- Priority Requests
- Profile / Security

### Overview
Show total files, Draft, In Review, Processing, Completed, pending priority requests, wallet balance and reserved amount. Do not show private information for other accounts.

### Add application form
Recommended sequence:
1. Applicant identity: name, passport number, contact details.
2. Route: From Country and To Country selectors, both required.
3. Visa details: visa category and optional subtype.
4. Center: load centers filtered by From Country.
5. Notes and supporting documents.
6. Review and save as Draft.

### Application detail
Show reference code, applicant, From -> To route, visa category, center, uploaded document names, application status, priority history and activity. Provide Low/Mid/High request controls only when allowed. Display a server-returned price quote; never calculate the authoritative charge in the browser.

### Wallet
Show balance, reserved funds and available funds separately. Provide deposit form, pending/approved/rejected deposit history and ledger. Explain that deposits become available only after admin approval.

## 2. Admin portal

### Navigation
- Dashboard
- Applications
- Agents and Individuals
- Deposits
- Priority Requests
- Pricing Matrix
- Countries
- Visa Categories
- Application Centers
- Wallet Ledger / Reports
- Admin Users and Settings (future module)

### Dashboard
Show operational counts and queues: new applications, pending deposits, pending priority approvals, processing files and completed files. Use server-side pagination and filters.

### Pricing matrix
Provide filters and editable configuration for From Country, To Country, Visa Category, Center, and Low/Mid/High. Show missing price combinations clearly. Allow create/update/deactivate and display last update metadata. Require confirmation before saving price changes. Never delete historical price snapshots.

### Deposit review
Show customer, amount, payment method, transaction reference, submitted proof and timestamp. Require an explicit approve/reject decision and optional admin note. Prevent duplicate review.

### Priority review
Show applicant/application reference, agent or individual owner, route, category, center, requested priority, quoted amount snapshot, wallet reservation and request time. Approve/reject with an admin note. Explain that approval captures reserved funds and rejection releases them.

### Application management
Support search by reference, applicant, passport number, owner, route, center and status. Restrict document viewing to authorized staff and log each access. Provide status transition controls with confirmation and activity history.

## 3. Frontend integration rules

- Treat API responses as authoritative.
- Send JWT only over HTTPS and keep tokens out of logs.
- Do not store wallet balances as trusted client state; refresh from API after financial actions.
- Do not send price or wallet balance as a charge instruction.
- Display From Country and To Country distinctly everywhere, including filters, detail pages, exports and receipts.
- Handle 401, 403, 402, 404, 409 and validation errors with clear messages.
- Add loading, empty, error and success states to every data-driven screen.
- Use server-side pagination/search when those API capabilities are implemented.

## 4. Accessibility and usability

Use keyboard-accessible forms, visible labels, clear validation, confirmation for financial/admin actions, responsive layouts and explicit currency formatting (configured by business settings rather than hardcoded where possible).
