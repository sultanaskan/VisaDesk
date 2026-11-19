# Agentic Development Guide

This document is the working contract for AI coding agents and human developers modifying this repository.

## 1. Product context

Build a secure multi-tenant visa application management platform for a visa appointment processing company. There are three roles: ADMIN, AGENT and INDIVIDUAL. Agents can create many applicant applications under one account. Individuals manage their own applications. Admin staff manage catalogs, pricing, deposits, priority approvals and processing statuses.

## 2. Non-negotiable business rules

- Do not collapse From Country and To Country into one field. Both are required and independently persisted.
- A VisaCenter is currently located in the From Country; validate `center.countryId === application.fromCountryId`.
- Price identity is the exact tuple `fromCountryId, toCountryId, categoryId, centerId, level`.
- Do not invent fallback pricing. Missing or inactive exact price means reject the priority request without reserving money.
- Do not accept a price sent by a client. Resolve it server-side.
- Save the quoted amount on PriorityRequest. Price edits must not rewrite historical requests.
- Draft is an application status, not a paid priority level. Paid levels are LOW, MID and HIGH.
- Pending priority requests reserve funds. Approval captures funds; rejection releases the reservation.
- Pending deposits do not credit the wallet. Admin approval credits once.
- Enforce ownership for agent/individual routes and explicit ADMIN authorization for administrative routes.
- Never expose private document files through a public static route.

## 3. Development workflow for an AI agent

Before changing code:
1. Read this file and the relevant documents under `docs/`.
2. Inspect the existing schema, route, controller, validator and middleware before editing.
3. State the files to change and the intended behavior in a short plan.
4. Preserve existing architecture and API conventions unless a change is necessary and documented.

While changing code:
1. Make the smallest coherent change.
2. Update Prisma schema, validation, controller/service logic, routes, API docs and tests together.
3. Keep money operations inside database transactions.
4. Avoid logging credentials, JWTs, payment secrets, passport numbers or document contents.
5. Do not silently change enum meanings or existing endpoint behavior.
6. Add a migration for schema changes; never reset a database containing user data.

After changing code:
1. Run Prisma formatting/validation and client generation.
2. Run linting/tests if present; add tests when adding business logic.
3. Test unauthorized access, ownership boundaries, invalid catalog combinations, missing price rules, insufficient balance, duplicate reviews and price snapshot behavior.
4. Update the documentation and provide a concise change summary plus known limitations.
5. Do not claim tests passed unless they were actually run.

## 4. Required tests for route-based pricing

- Bangladesh -> India, Tourist, Dhaka center, HIGH finds the matching configured price.
- Bangladesh -> Thailand with the same category/center/priority uses a different exact rule.
- A center belonging to India cannot be selected for an application whose From Country is Bangladesh under the current center-location rule.
- Missing price and inactive price return a client error and do not increase walletReserved.
- A changed price does not change a previously created PriorityRequest.amount.
- Agent A cannot read Agent B's application.
- An individual cannot read another user's application.
- Admin can review requests but cannot approve/reject an already reviewed request twice.

## 5. Frontend integration contract

The client frontend should load active countries for both From and To selectors, load centers filtered by From Country, load visa categories, then request matching prices using all four catalog IDs. Display a price quote from the API but treat the server's priority-request response as authoritative. Do not calculate or charge prices in browser code.

The admin frontend should provide catalog CRUD, a matrix/filter interface for the five-dimensional pricing key, deposit queue, priority queue, application search, wallet ledger and operational status controls. Add explicit confirmation before approving financial actions.

## 6. Architecture direction

Keep Express routes thin. As the project grows, move domain rules into services such as `PricingService`, `WalletService`, `ApplicationService` and `PriorityService`. Use repositories only if query complexity or testing justifies them. Add a dedicated audit log and notification/outbox pattern before building high-volume workflows.

## 7. Agent output expectations

For each development task, report:
- What changed.
- Files changed.
- Database migration impact.
- Commands/tests actually run and their results.
- API contract changes.
- Remaining risks or follow-up work.
