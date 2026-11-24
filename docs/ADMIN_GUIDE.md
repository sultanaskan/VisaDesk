# Admin User Guide

## 1. Initial setup

1. Install and configure the API and MySQL database using [Deployment](DEPLOYMENT.md).
2. Run the database migrations and seed the first administrator.
3. Sign in through the future admin frontend using the seeded admin credentials.
4. Change the initial password before real use. The current API seed can create the first admin; a full admin-user management UI is not included yet.

## 2. Configure catalogs

Create countries first. Create visa categories next. Then create application centers, selecting the country in which each center is located. In the current model, this should be the From Country of the application route.

Example catalog setup:
- From Country: Bangladesh
- To Country: India
- Visa Category: Tourist
- Center: IVAC Dhaka (country Bangladesh)

## 3. Configure pricing

Create one price for every supported combination:
- From Country
- To Country
- Visa Category
- Center
- Priority Level: LOW, MID or HIGH
- Price and active flag

Use `PUT /api/v1/priorities/admin/prices`. If an exact price is missing or inactive, the customer cannot request that priority. Configure every combination you intend to sell. Review prices carefully before enabling them.

## 4. Review deposits

Open pending deposits, verify the payment independently against the actual payment channel, and then approve or reject. Approval credits the user's wallet. Do not approve based only on a screenshot if the payment cannot be independently verified.

## 5. Review priority requests

Check the application route, visa category, center, requested priority and amount snapshot. Approve only when operationally accepted. Approval captures the reserved amount; rejection releases it.

## 6. Manage applications

Use the site tabs above the queue to focus on IVAC, UK VFS, other VFS, U.S. Visa Scheduling, or other sites. Open a request to see that site's specific booking details and private uploaded files. Credentials are stored in the matching site's detail table; passwords are encrypted and shown only in the authenticated individual admin review view. Keep `BOOKING_CREDENTIAL_KEY` private and backed up; never put it in source control. Do not record OTPs. Update status as work progresses; use `COMPLETED` only after the slot is actually booked.

## 7. Operational safeguards

- Reconcile wallet ledger entries with payment records regularly.
- Restrict admin access to named staff accounts.
- Do not share JWT tokens or uploaded document paths.
- Keep uploaded booking files in private storage; downloads require an authenticated owner or admin session.
- Keep a record of price changes and admin actions; a complete audit-log module remains to be implemented.
