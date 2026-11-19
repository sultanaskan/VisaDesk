# Security and Privacy Requirements

## Current protections

- Password hashes use bcrypt.
- Protected routes use JWT authentication.
- Role checks protect admin endpoints.
- Zod validates important request payloads.
- Helmet, CORS configuration and API rate limiting are enabled.
- Uploaded files are restricted by declared MIME type and size.
- Uploaded files are not served as a public static directory.

## Required before production

1. Verify file signatures/content; MIME headers alone are not trustworthy.
2. Add authenticated, authorization-checked document streaming and audit every document access.
3. Use private storage and malware scanning.
4. Add email/phone verification, password reset, MFA for admins and session/token revocation.
5. Add idempotency keys and concurrency-safe wallet operations/review transitions.
6. Add immutable admin audit events for pricing, deposit, priority, user and application changes.
7. Add pagination and query limits to all list endpoints.
8. Apply request-specific rate limits and login throttling.
9. Redact passport numbers and personal data from logs; encrypt backups and restrict staff access.
10. Define data retention/deletion and incident-response procedures.
11. Use HTTPS, secret management, dependency scanning and regular patching.
12. Confirm the business is authorized to provide the advertised services and follows applicable visa-center rules. Never promise appointment availability without verified confirmation.

## Financial safety

All balance-changing actions must be transactional, auditable and idempotent. Never trust a client-submitted price. The server must resolve the active pricing rule from database IDs and save the resolved amount as a snapshot. Admins should verify deposits against payment provider/bank records, not just uploaded screenshots.
