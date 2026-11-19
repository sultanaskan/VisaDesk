# API Reference

Base URL: `http://localhost:4000/api/v1`

Protected endpoints require `Authorization: Bearer <JWT>`.
JSON endpoints use `Content-Type: application/json`. Application and deposit uploads use `multipart/form-data`.

## Health

- `GET /health` — API health check.

## Authentication

- `POST /auth/register` — register as `AGENT` or `INDIVIDUAL`.
- `POST /auth/login` — obtain JWT.
- `GET /auth/me` — current account (authenticated).

Example registration:

```json
{
  "name": "Example Agency",
  "email": "agent@example.com",
  "phone": "01700000000",
  "password": "Use-A-Strong-Password",
  "role": "AGENT"
}
```

## Catalog

- `GET /catalog/countries` — active countries for both From and To selectors.
- `GET /catalog/categories` — active visa categories.
- `GET /catalog/centers?countryId=1` — centers in a selected country (use the From Country ID).
- `POST /catalog/admin/countries` — admin creates country `{ "name": "Bangladesh", "code": "BD" }`.
- `POST /catalog/admin/categories` — admin creates category `{ "name": "Tourist", "description": "Tourism visit" }`.
- `POST /catalog/admin/centers` — admin creates center `{ "countryId": 1, "name": "Dhaka Center" }`.

## Wallet and deposits

- `GET /wallet/summary` — balance and reserved amount.
- `GET /wallet/ledger` — recent ledger records.
- `POST /wallet/deposits` — multipart fields: `amount`, `paymentMethod`, `transactionRef`, optional `senderAccount`, optional `proof` file.
- `GET /wallet/admin/deposits?status=PENDING` — admin deposit queue.
- `PATCH /wallet/admin/deposits/:id/review` — `{ "decision": "APPROVE", "adminNote": "Verified" }` or REJECT.

## Applications

- `POST /applications` — multipart fields below; attach up to 10 files using repeated `documents` fields.
- `GET /applications/mine` — current account's applications.
- `GET /applications/:id` — own application.
- `GET /applications/admin/all` — admin list.
- `PATCH /applications/admin/:id/status` — admin updates status; JSON `{ "status": "IN_REVIEW" }`.

Application fields:

```json
{
  "applicantName": "Applicant Name",
  "passportNumber": "A12345678",
  "fromCountryId": 1,
  "toCountryId": 2,
  "categoryId": 1,
  "centerId": 1,
  "visaType": "Tourist",
  "applicantPhone": "01700000000",
  "applicantEmail": "applicant@example.com",
  "notes": "Optional notes"
}
```

The center must belong to `fromCountryId`. `fromCountryId` and `toCountryId` are separate required fields.

## Dynamic pricing and priority

- `GET /priorities/prices?fromCountryId=1&toCountryId=2&categoryId=1&centerId=1` — list matching active prices; filters are optional.
- `PUT /priorities/admin/prices` — admin upserts one exact price rule.
- `POST /applications/:id/priority` — authenticated owner requests `{ "level": "HIGH" }`.
- `GET /priorities/admin/requests?status=PENDING` — admin review queue.
- `PATCH /priorities/admin/requests/:id/review` — admin approves/rejects.

Price configuration example:

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

The unique price key is `fromCountryId + toCountryId + categoryId + centerId + level`. `centerId` must refer to a center located in `fromCountryId`. The exact price is copied into the priority request and is not recalculated after a later admin price change.

## Common response shape

Success responses generally contain `{ "success": true, "data": ... }`. Errors contain `{ "success": false, "message": "..." }`; validation errors may also include an `errors` array. HTTP 401 means authentication is missing/invalid; 403 means role/ownership permission is insufficient; 404 means not found; 409 means a conflicting state; 402 is used for insufficient available wallet funds.

## Implementation notes

This reference describes the current starter API, not a guarantee that all production-grade pagination, filtering, sorting, audit trails, file download or rate policies are complete. Verify the route implementation and run tests before relying on it in production.
