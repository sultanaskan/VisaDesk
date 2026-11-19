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

Review applicant details and documents using a secure admin interface. Update application status as work progresses. Never treat `PROCESSING` as proof that an appointment has been booked. Use `COMPLETED` only according to the company's defined completion criteria.

## 7. Operational safeguards

- Reconcile wallet ledger entries with payment records regularly.
- Restrict admin access to named staff accounts.
- Do not share JWT tokens or uploaded document paths.
- Use a private document store and authenticated file streaming before production.
- Keep a record of price changes and admin actions; a complete audit-log module remains to be implemented.
