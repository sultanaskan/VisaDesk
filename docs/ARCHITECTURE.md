# Architecture and Database Design

## 1. Technology

- Node.js 20+
- JavaScript ES modules
- Express.js REST API
- MySQL 8+
- Prisma ORM
- JWT authentication and bcrypt password hashing
- Zod request validation
- Multer upload handling

## 2. Layering

`HTTP Route -> Authentication/Authorization -> Validation -> Controller -> Prisma -> MySQL`

Controllers contain request orchestration and business rules. For a larger production system, move wallet, pricing and application rules into dedicated service modules and keep controllers thin.

## 3. Core entities

- `User`: account, role, status and wallet totals.
- `Country`: reusable origin/destination country catalog.
- `VisaCategory`: visa purpose/category catalog.
- `VisaCenter`: center located in a country; currently linked to From Country.
- `Application`: applicant, route, category, center and status.
- `ApplicationDocument`: private file metadata.
- `PriorityPrice`: unique five-field price configuration.
- `PriorityRequest`: requested level, quoted amount snapshot and approval state.
- `Deposit`: customer-submitted payment/deposit request.
- `WalletLedger`: immutable financial event history.

## 4. Pricing key

Prisma uniqueness constraint:

`@@unique([fromCountryId, toCountryId, categoryId, centerId, level])`

For an application, price lookup uses all five values. The selected center must have `center.countryId == application.fromCountryId`.

## 5. Wallet invariants

- `walletBalance` is the credited balance before pending reservations.
- `walletReserved` is the total funds reserved by pending priority requests.
- Spendable amount is `walletBalance - walletReserved`.
- A pending request reserves funds; approval decrements both balance and reserved amount; rejection decrements reserved amount only.
- Deposit approval increments balance and creates a ledger record in the same database transaction.

Production hardening should add idempotency keys and conditional/locking updates to guard against simultaneous review/request races. Use database transactions for every multi-row money operation.

## 6. Status model

Application status: `DRAFT`, `SUBMITTED`, `IN_REVIEW`, `PROCESSING`, `COMPLETED`, `REJECTED`.

Priority request status: `PENDING`, `APPROVED`, `REJECTED`.

Deposit status: `PENDING`, `APPROVED`, `REJECTED`.

Draft is not a paid priority. Low/Mid/High are paid service-priority levels.

## 7. Migration warning

The earlier schema used one `countryId` to represent the destination/selected country. The new schema uses `fromCountryId` and `toCountryId`. Do not run a destructive schema reset on a database containing real data. Create and review a dedicated migration, map legacy rows to the correct origin and destination countries, update existing pricing rules, and take a verified backup before deploying the migration. Copying the old country ID into both fields is only a temporary technical backfill, not a valid business mapping unless that is factually correct for every record.
