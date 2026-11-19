# Agent and Individual User Guide

## 1. Account types

Choose Agent if you represent an agency and need to submit multiple applicant files under one account. Choose Individual if you are submitting your own application(s). Account roles are selected at registration; the API does not currently provide a self-service role conversion.

## 2. Create an application

Submit the applicant's name and passport number, then select:
1. From Country.
2. To Country.
3. Visa Category.
4. Application Center (the current system lists centers in the From Country).
5. Optional visa type, contact information and notes.
6. Supporting documents.

The application is initially saved as Draft. The application is owned by the logged-in account. An agent can create multiple applicant records.

## 3. Deposit funds

Submit amount, payment method, sender account (if applicable), transaction reference and optional proof. The deposit stays pending until the admin verifies and approves it. Pending deposits are not available for spending.

## 4. Request processing priority

Open an application and choose Low, Mid or High. The system finds the exact configured price for the selected route, category and center. If no price exists, contact the agency administrator. If your available wallet balance is too low, submit a deposit and wait for approval.

When the request is submitted, the price is reserved. Admin approval charges the reserved amount. Rejection releases it.

## 5. Track progress

Use the application list and wallet ledger to review file status, priority request decisions and account transactions. Contact the agency for operational updates not yet represented in the portal.

## 6. Document safety

Only upload documents required for the application. Use clear, valid files. Do not upload passwords or unrelated sensitive information. The API starter currently stores uploads locally; secure customer/admin document download must be completed before production launch.
