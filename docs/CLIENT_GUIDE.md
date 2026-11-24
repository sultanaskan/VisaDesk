# Agent and Individual User Guide

## 1. Account types

Choose Agent if you represent an agency and need to submit multiple applicant files under one account. Choose Individual if you are submitting your own application(s). Account roles are selected at registration; the API does not currently provide a self-service role conversion.

## 2. Request an appointment slot

Submit the applicant's name and passport number, then select:
1. From Country.
2. To Country.
3. Visa Category.
4. Application Center (the current system lists centers in the From Country).
5. Choose the booking site and complete only the fields shown for that site.
6. Add slot preferences and upload the booking files requested by that route.

This portal handles appointment slot booking requests, not visa applications or eligibility checks. Click the site tab above the form (India/IVAC, UK/VFS, other VFS, USA, or other site). The form then shows only the fields for that website. Booking-site passwords are encrypted in their site's own detail table and shown only in an admin's individual request review. Never provide OTPs in this form; share a one-time code with the assigned agent only when the site asks for it during booking. Requests start as Draft and are owned by the logged-in account. Agents can submit multiple applicant requests.

## 3. Deposit funds

Submit amount, payment method, sender account (if applicable), transaction reference and optional proof. The deposit stays pending until the admin verifies and approves it. Pending deposits are not available for spending.

## 4. Request processing priority

Open an application and choose Low, Mid or High. The system finds the exact configured price for the selected route, category and center. If no price exists, contact the agency administrator. If your available wallet balance is too low, submit a deposit and wait for approval.

When the request is submitted, the price is reserved. Admin approval charges the reserved amount. Rejection releases it.

## 5. Track progress

Use the application list and wallet ledger to review file status, priority request decisions and account transactions. Contact the agency for operational updates not yet represented in the portal.

## 6. Document safety

Only upload files required for slot booking. Use clear files and never upload portal passwords or unrelated sensitive information. Customer and admin downloads use authenticated API access; production uploads should still use private storage and retention controls.
