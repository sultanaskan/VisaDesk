# VisaDesk — Visa Slot Agency

Unified visa appointment agency application: client and agent portal, administrator workspace, and API served by one Node.js process. Built with Node.js, Express, JavaScript ES modules, Prisma ORM and MySQL.

The repository root [README](../README.md) has the short setup guide. After configuring `.env`, run `npm install` and `npm run dev` from this folder. Open `http://localhost:4000` for clients and agents or `http://localhost:4000/admin` for administrators. Both frontends use this server's `/api/v1` API.

## Current capabilities

- Agent and individual registration/login with JWT and role-based access.
- Agent accounts can own multiple applicant applications; individual accounts own their own applications.
- Country, visa category and visa-center catalogs.
- Application creation with separate **From Country** and **To Country** fields.
- Visa center selection tied to the From Country in the current business model.
- Dynamic Low/Mid/High price rules using the exact combination: From Country + To Country + Visa Category + Center + Priority.
- Manual deposit requests, admin approval/rejection, wallet balance and wallet ledger.
- Priority requests reserve funds; admin approval captures funds and rejection releases the reservation.
- Price snapshots on priority requests so future price edits do not rewrite prior quotes.
- Multiple document uploads (PDF/JPG/PNG metadata and local storage in this starter).

## Documentation

Read the complete documentation in [`docs/README.md`](docs/README.md): product requirements, architecture/database design, admin guide, agent/individual guide, API reference, deployment, security and agentic development instructions.

## Requirements

- Node.js 20+
- MySQL 8+
- npm

## Local setup

1. Create the database:

```sql
CREATE DATABASE visa_agency CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. Copy `.env.example` to `.env`. Configure `DATABASE_URL`, a strong `JWT_SECRET`, frontend origins and unique admin seed credentials.
3. Install and initialize:

```bash
npm install
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

API base URL: `http://localhost:4000/api/v1`
Health check: `GET /api/v1/health`

The seed creates an administrator and demo catalog/pricing for Bangladesh -> India, Tourist, Dhaka. Change the seeded admin password before use. Demo prices are not business recommendations.

## Key application payload

Application creation is `multipart/form-data`; attach up to 10 files using repeated field name `documents`.

```json
{
  "applicantName": "Applicant Name",
  "passportNumber": "A12345678",
  "fromCountryId": 1,
  "toCountryId": 2,
  "categoryId": 1,
  "centerId": 1,
  "visaType": "Tourist"
}
```

The center must belong to `fromCountryId`. Both country IDs are required and are stored separately.

## Dynamic pricing payload

Admin configures a unique price rule through `PUT /api/v1/priorities/admin/prices`:

```json
{
  "fromCountryId": 1,
  "toCountryId": 2,
  "categoryId": 1,
  "centerId": 1,
  "level": "HIGH",
  "price": 2500,
  "isActive": true
}
```

The API resolves price from all five fields. Client-supplied prices are never trusted. If the exact active rule does not exist, priority purchase is rejected. Existing priority requests retain their original amount snapshot.

## Important migration warning

The earlier version stored a single country ID. The updated schema requires From Country and To Country. If you already have data, do not run `prisma migrate reset` and do not overwrite the database. Back up first and prepare a reviewed migration that maps each existing application and price rule to the correct origin/destination pair. See `docs/ARCHITECTURE.md` and `docs/DEPLOYMENT.md`.

## Production readiness

This is a development foundation, not a fully production-hardened service. Before launch, implement and test concurrency-safe/idempotent wallet operations, authenticated document download/preview, audit logs, pagination, notifications, password reset/MFA, malware scanning, automated tests, backups and deployment hardening. Both frontends are served at `/` and `/admin`. Review applicable visa-center rules and never imply an appointment is confirmed without an actual authorized confirmation.


## Automatic local setup

After installing Node.js and MySQL Server, copy `.env.example` to `.env` and
enter your MySQL host, username, password, database name, and a strong JWT
secret. The MySQL account must be allowed to create databases and tables.

Then run:

```bash
npm install
npm run dev
```

On startup, the application automatically:
1. Creates the configured database if it does not exist.
2. Generates Prisma Client.
3. Creates or synchronizes database tables using `prisma db push`.
4. Creates the initial admin account and demo catalog entries if absent.
5. Starts the API.

You do not need to run Prisma setup or seed commands separately for local
development. MySQL Server itself must already be installed and running; the
application cannot infer database credentials or install/start the database
server for you.

This convenience bootstrap uses `prisma db push` for local development. For
production deployments, use reviewed Prisma migrations (`prisma migrate deploy`)
and a restricted database account. Back up existing databases before schema
changes. Existing data is not intentionally reset by this bootstrap.
