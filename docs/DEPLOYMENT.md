# Setup, Deployment and Operations

## Local requirements

- Node.js 20 or newer
- MySQL 8 or compatible managed MySQL
- npm

## Local setup

1. Create a database:

```sql
CREATE DATABASE visa_agency CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. Copy `.env.example` to `.env` and set `DATABASE_URL`, `JWT_SECRET`, `CLIENT_ORIGIN`, admin seed credentials and upload settings.
3. Install dependencies: `npm install`.
4. Generate Prisma client: `npm run db:generate`.
5. Create/apply migrations: `npm run db:migrate`.
6. Seed initial admin: `npm run db:seed`.
7. Start development server: `npm run dev`.

API health check: `GET http://localhost:4000/api/v1/health`.

## Production deployment

- Use a managed/private MySQL database and a least-privilege database account.
- Set a unique, high-entropy JWT secret (32+ characters; preferably generated securely).
- Set `BOOKING_CREDENTIAL_KEY` to a private 32-byte key encoded as 64 hex characters. Generate it with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`. Keep it backed up and stable: changing it prevents decrypting saved booking-site passwords.
- If the application still reports that the key is missing, confirm the value is exactly 64 hexadecimal characters (0–9, a–f), that it is set in the active app's environment or its project-root `.env`, and restart the Passenger application. Startup logs now report only whether the key format is valid; they never print the key.
- Set exact allowed frontend origins in `CLIENT_ORIGIN`.
- Run `npm ci`, `npm run db:generate`, and `npm run db:deploy` during deployment.
- Run the API with a process manager/container and terminate TLS at a trusted reverse proxy.
- Keep `.env`, database backups and uploads outside public web roots.
- Configure automated encrypted backups and test restoration.
- Monitor API errors, database health, disk capacity and failed login patterns.

## Existing database migration

The earlier project version used a single country field. The new version requires From Country and To Country. Back up the database first, generate a migration against a copy of production data, map every old application and price row to its correct From/To countries, validate foreign keys and unique price combinations, then deploy. Do not use `prisma migrate reset` against any database containing user data.

Earlier slot-request releases added `bookingSite` and `bookingDetails` to `Application`. This release stores new site-specific data in five one-to-one tables (`IvacBooking`, `UkVfsBooking`, `VfsBooking`, `UsVisaBooking`, `OtherBooking`). Back up the production database, then run [`prisma/slot_booking_site_tables.sql`](../prisma/slot_booking_site_tables.sql) once. The old JSON column remains for existing records and compatibility. The application does not synchronize schema changes in production. Deploy the files and run `npm run db:generate` before restarting Passenger.

## Upload storage

The starter stores uploads in a local directory. This is suitable only for development/testing. For production, use private object storage or a private disk, random object keys, file-content inspection, malware scanning, retention policies and authenticated download/preview endpoints. Never expose raw storage paths or mount the upload directory as a public static directory.
