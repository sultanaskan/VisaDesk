# Product Requirements

## 1. Product purpose

Provide a web platform for a visa appointment slot-booking/processing company. The platform serves two customer account types—agents and individual customers—and an internal admin team.

## 2. Roles

### Administrator
- Manage users, agents, countries, visa categories and application centers.
- Configure route- and category-specific priority prices.
- Review deposit requests and priority requests.
- View all applications and document metadata.
- Update application processing statuses.
- Monitor wallet ledger and operational queues.

### Agent
- Maintain one agent account.
- Create and manage multiple applicant files under that account.
- Deposit funds into the agent wallet.
- Request a priority for each eligible application.
- View each file's status, requests and transaction history.

### Individual
- Manage their own account and applications.
- Deposit funds, request priority and track processing.

An agent's applicants are application records owned by the agent account; applicants do not need separate logins unless a later customer-access feature is explicitly added.

## 3. Application information

Every application records:
- Applicant name and passport number.
- From Country: country from which the visa application is being submitted / applicant's application origin.
- To Country: destination country for which the visa is requested.
- Visa category (for example Tourist, Business, Medical, Student).
- Application center, which must belong to the From Country in the current business model.
- Optional visa subtype, applicant phone/email and notes.
- Uploaded supporting documents.
- Application status and current approved priority.

A newly created application is Draft. Draft is an application status, not a paid priority tier. Low, Mid and High are paid priority levels.

## 4. Dynamic price rule

A price rule is uniquely identified by:

`From Country + To Country + Visa Category + Center + Priority Level`

The admin configures one price for each unique combination. A customer priority request uses the exact matching active rule. If no exact active rule exists, the API rejects the request and does not reserve or charge funds. There is no silent fallback to another route or category.

The amount is copied into the PriorityRequest when created. Later price changes do not alter an existing request's quoted amount.

## 5. Wallet and priority workflow

1. Customer creates a deposit request with payment details and optional proof.
2. Deposit remains Pending and does not increase spendable balance.
3. Admin verifies the payment and approves or rejects it.
4. On approval, the deposit is credited once and a ledger entry is created.
5. Customer requests Low, Mid or High priority on an owned application.
6. API resolves the exact price and reserves the amount if sufficient available balance exists.
7. Admin approves or rejects the priority request.
8. Approval captures the reserved amount from wallet balance and records a ledger entry. Rejection releases the reservation.

Available balance = wallet balance - reserved balance.

## 6. Acceptance criteria

- An agent can own multiple applications.
- An individual can only access their own applications.
- Admin can access all applications.
- The center must belong to the selected From Country.
- The From and To countries may be different; they are separately stored and separately priced.
- Every priority request resolves an exact five-dimensional price key.
- A missing/inactive price never creates a paid request.
- Pending priority funds cannot be spent twice.
- Admin cannot review the same deposit or priority request twice.
- Existing requests retain their price snapshot after price edits.
- Every wallet credit/debit has a ledger entry.

## 7. Out of scope for this API foundation

Frontend portals, actual visa-center integrations, guaranteed appointment availability, automated slot acquisition, payment gateway callbacks, customer-facing document downloads, notifications and reporting exports are separate implementation tasks. The platform must not represent an appointment as confirmed unless a real authorized booking confirmation exists.
