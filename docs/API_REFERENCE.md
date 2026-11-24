# VisaDesk API Reference

Each endpoint below has its own request and response example. Examples use the live API URL; replace it with your local URL when developing. Do not send real passwords, JWTs, passport details, payment references, or `.env` values in public messages.

## Base URL and request rules

Production:

```text
https://visadesk.wellcometoserbia.com/api/v1
```

Local default from `.env.example`:

```text
http://localhost:5000/api/v1
```

For the examples below, set the base URL and tokens in a Bash shell:

```sh
export API_BASE="https://visadesk.wellcometoserbia.com/api/v1"
export TOKEN="<JWT returned by login>"
export ADMIN_TOKEN="<JWT for an ADMIN account>"
```

Protected routes require `Authorization: Bearer <JWT>`. JSON requests require `Content-Type: application/json`. File uploads use `multipart/form-data`. Registration creates only `AGENT` or `INDIVIDUAL` accounts; admins are provisioned separately. Decimal values are returned as strings, such as `"2500.00"`.

---

## 1. Health

### `GET /health` — public

**Request**

```sh
curl "$API_BASE/health"
```

**Example response — `200 OK`**

```json
{
  "success": true,
  "message": "Visa Agency API is running."
}
```

---

## 2. Authentication

### `POST /auth/register` — public

Creates an `AGENT` or `INDIVIDUAL`. Role defaults to `INDIVIDUAL` if omitted. Password length: 8–100 characters. Email is lowercased. Email and phone must be unique.

**Request**

```sh
curl -X POST "$API_BASE/auth/register" \
  -H 'Content-Type: application/json' \
  -d '{"name":"Example Agency","email":"agent@example.com","phone":"01700000000","password":"Replace-With-A-Strong-Password","role":"AGENT"}'
```

**Example response — `201 Created`**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 12,
      "name": "Example Agency",
      "email": "agent@example.com",
      "phone": "01700000000",
      "role": "AGENT",
      "createdAt": "2026-11-21T10:00:00.000Z"
    },
    "token": "<JWT>"
  }
}
```

### `POST /auth/login` — public

**Request**

```sh
curl -X POST "$API_BASE/auth/login" \
  -H 'Content-Type: application/json' \
  -d '{"email":"agent@example.com","password":"Replace-With-A-Strong-Password"}'
```

**Example response — `200 OK`**

```json
{
  "success": true,
  "data": {
    "token": "<JWT>",
    "user": {
      "id": 12,
      "name": "Example Agency",
      "email": "agent@example.com",
      "role": "AGENT"
    }
  }
}
```

Invalid credentials return `401`; suspended accounts return `403`.

### `GET /auth/me` — authenticated

**Request**

```sh
curl "$API_BASE/auth/me" -H "Authorization: Bearer $TOKEN"
```

**Example response — `200 OK`**

```json
{
  "success": true,
  "data": {
    "id": 12,
    "name": "Example Agency",
    "email": "agent@example.com",
    "phone": "01700000000",
    "role": "AGENT",
    "status": "ACTIVE",
    "walletBalance": "5000.00",
    "walletReserved": "0.00",
    "createdAt": "2026-11-21T10:00:00.000Z"
  }
}
```

There is no logout endpoint; discard the token in the client. Token lifetime is controlled by `JWT_EXPIRES_IN` (default `1d`).

---

## 3. Public catalogs

### `GET /catalog/countries` — public

Returns active countries, sorted by name.

**Request**

```sh
curl "$API_BASE/catalog/countries"
```

**Example response — `200 OK`**

```json
{
  "success": true,
  "data": [
    { "id": 1, "name": "Bangladesh", "code": "BD", "isActive": true, "createdAt": "2026-11-20T08:00:00.000Z" },
    { "id": 2, "name": "India", "code": "IN", "isActive": true, "createdAt": "2026-11-20T08:00:00.000Z" }
  ]
}
```

### `GET /catalog/categories` — public

Returns active visa categories, sorted by name.

**Request**

```sh
curl "$API_BASE/catalog/categories"
```

**Example response — `200 OK`**

```json
{
  "success": true,
  "data": [
    { "id": 1, "name": "Tourist", "description": "Tourism visit", "isActive": true, "createdAt": "2026-11-20T08:00:00.000Z" }
  ]
}
```

### `GET /catalog/centers?countryId=1` — public

`countryId` is optional. For applications, load centers for the selected **From Country**.

**Request**

```sh
curl "$API_BASE/catalog/centers?countryId=1"
```

**Example response — `200 OK`**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "countryId": 1,
      "name": "Dhaka Visa Center",
      "code": "DHK",
      "address": "Dhaka, Bangladesh",
      "isActive": true,
      "createdAt": "2026-11-20T08:00:00.000Z",
      "country": { "id": 1, "name": "Bangladesh", "code": "BD", "isActive": true, "createdAt": "2026-11-20T08:00:00.000Z" }
    }
  ]
}
```

---

## 4. Admin catalog creation

All three routes require an `ADMIN` token. These endpoints create records; no catalog update/delete routes are currently implemented.

### `POST /catalog/admin/countries` — admin

**Request**

```sh
curl -X POST "$API_BASE/catalog/admin/countries" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"name":"Bangladesh","code":"BD"}'
```

**Example response — `201 Created`**

```json
{
  "success": true,
  "data": { "id": 1, "name": "Bangladesh", "code": "BD", "isActive": true, "createdAt": "2026-11-20T08:00:00.000Z" }
}
```

### `POST /catalog/admin/categories` — admin

**Request**

```sh
curl -X POST "$API_BASE/catalog/admin/categories" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"name":"Tourist","description":"Tourism visit"}'
```

**Example response — `201 Created`**

```json
{
  "success": true,
  "data": { "id": 1, "name": "Tourist", "description": "Tourism visit", "isActive": true, "createdAt": "2026-11-20T08:00:00.000Z" }
}
```

### `POST /catalog/admin/centers` — admin

`code` and `address` are optional. `countryId` refers to the center's country.

**Request**

```sh
curl -X POST "$API_BASE/catalog/admin/centers" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"countryId":1,"name":"Dhaka Visa Center","code":"DHK","address":"Dhaka, Bangladesh"}'
```

**Example response — `201 Created`**

```json
{
  "success": true,
  "data": { "id": 1, "countryId": 1, "name": "Dhaka Visa Center", "code": "DHK", "address": "Dhaka, Bangladesh", "isActive": true, "createdAt": "2026-11-20T08:00:00.000Z" }
}
```

---

## 5. Applications

Applications belong to the authenticated user. An agent can create multiple applicant records. From Country and To Country are separate required fields. The selected center must be located in `fromCountryId`.

### `POST /applications` — authenticated, multipart

Repeat `documents` for each file (maximum 10). Accepted formats are PDF, JPG/JPEG, and PNG. Default maximum file size is 10 MB per file; `MAX_FILE_SIZE_MB` can change it.

Send `bookingSite` as `IVAC`, `UK_VFS`, `VFS_GLOBAL`, `US_VISA_SCHEDULING`, or `OTHER`, and send `bookingDetails` as a JSON string in multipart form data. Include only fields for the selected site. The API validates and stores each supported site's fields in its own one-to-one detail table. Each login-enabled site requires `loginEmail`, `loginPhone`, and `loginPassword`, plus its route-specific fields. IVAC also requires Webfile number, date of birth, NID/citizenship number, preferred IVAC centre, and the original Primary Webfile PDF. UK VFS requires GWF reference, birth date, passport expiry, and preferred centre. Other VFS routes require local application reference, birth date, passport expiry, and preferred centre. U.S. scheduling requires visa class, DS-160 confirmation, birth date, passport expiry, nationality, and interview location. The API encrypts passwords using `BOOKING_CREDENTIAL_KEY`; configure that key before accepting requests. Do not include OTPs.

Example site-specific payloads (send only the one for the selected `bookingSite`):

```json
{"loginEmail":"applicant@example.com","loginPhone":"01700000000","loginPassword":"example-only","webfileNumber":"BGD123456789","dateOfBirth":"1990-01-01","nationalId":"1234567890","ivacCenter":"Dhaka"}
```

```json
{"loginEmail":"applicant@example.com","loginPhone":"01700000000","loginPassword":"example-only","applicationReference":"GWF123456789","dateOfBirth":"1990-01-01","passportExpiry":"2030-01-01","vfsCenter":"Dhaka"}
```

```json
{"loginEmail":"applicant@example.com","loginPhone":"01700000000","loginPassword":"example-only","visaClass":"B1/B2","ds160Confirmation":"AA00ABC123","dateOfBirth":"1990-01-01","passportExpiry":"2030-01-01","nationality":"Bangladeshi","interviewLocation":"Dhaka"}
```

**Request**

```sh
curl -X POST "$API_BASE/applications" \
  -H "Authorization: Bearer $TOKEN" \
  -F 'applicantName=Example Applicant' \
  -F 'passportNumber=A12345678' \
  -F 'fromCountryId=1' -F 'toCountryId=2' \
  -F 'categoryId=1' -F 'centerId=1' \
  -F 'bookingSite=IVAC' \
  -F 'bookingDetails={"webfileNumber":"BGD123456789","dateOfBirth":"1990-01-01","nationalId":"1234567890","ivacCenter":"Dhaka"}' \
  -F 'visaType=Tourist' \
  -F 'applicantPhone=01700000000' \
  -F 'applicantEmail=applicant@example.com' \
  -F 'notes=First-time application' \
  -F 'documents=@webfile.pdf' \
  -F 'documents=@photo.jpg'
```

Required fields: `applicantName` (2–150 chars), `passportNumber` (3–40), and positive integer IDs for both countries, category, and center. Optional: `visaType` (max 80), `applicantPhone` (max 25), `applicantEmail`, `notes` (max 5,000).

**Example response — `201 Created`**

```json
{
  "success": true,
  "message": "Application saved as draft.",
  "data": {
    "id": 34,
    "userId": 12,
    "referenceCode": "VSA-1795260000000-ABC123",
    "applicantName": "Example Applicant",
    "passportNumber": "A12345678",
    "fromCountryId": 1,
    "toCountryId": 2,
    "categoryId": 1,
    "centerId": 1,
    "visaType": "Tourist",
    "applicantPhone": "01700000000",
    "applicantEmail": "applicant@example.com",
    "notes": "First-time application",
    "status": "DRAFT",
    "currentPriority": null,
    "createdAt": "2026-11-21T10:00:00.000Z",
    "updatedAt": "2026-11-21T10:00:00.000Z",
    "documents": [
      { "id": 90, "applicationId": 34, "originalName": "passport.pdf", "storedName": "<generated-name>.pdf", "mimeType": "application/pdf", "sizeBytes": 123456, "createdAt": "2026-11-21T10:00:00.000Z" }
    ],
    "fromCountry": { "id": 1, "name": "Bangladesh", "code": "BD", "isActive": true, "createdAt": "2026-11-20T08:00:00.000Z" },
    "toCountry": { "id": 2, "name": "India", "code": "IN", "isActive": true, "createdAt": "2026-11-20T08:00:00.000Z" },
    "category": { "id": 1, "name": "Tourist", "description": "Tourism visit", "isActive": true, "createdAt": "2026-11-20T08:00:00.000Z" },
    "center": { "id": 1, "countryId": 1, "name": "Dhaka Visa Center", "code": "DHK", "address": "Dhaka, Bangladesh", "isActive": true, "createdAt": "2026-11-20T08:00:00.000Z" }
  }
}
```

### `GET /applications/mine` — authenticated

Returns the caller's applications, newest first, including relations and priority request history.

**Request**

```sh
curl "$API_BASE/applications/mine" -H "Authorization: Bearer $TOKEN"
```

**Example response — `200 OK`**

```json
{
  "success": true,
  "data": [
    {
      "id": 34,
      "userId": 12,
      "referenceCode": "VSA-1795260000000-ABC123",
      "applicantName": "Example Applicant",
      "passportNumber": "A12345678",
      "fromCountryId": 1,
      "toCountryId": 2,
      "categoryId": 1,
      "centerId": 1,
      "visaType": "Tourist",
      "applicantPhone": "01700000000",
      "applicantEmail": "applicant@example.com",
      "notes": "First-time application",
      "status": "DRAFT",
      "currentPriority": null,
      "createdAt": "2026-11-21T10:00:00.000Z",
      "updatedAt": "2026-11-21T10:00:00.000Z",
      "documents": [],
      "fromCountry": { "id": 1, "name": "Bangladesh", "code": "BD", "isActive": true, "createdAt": "2026-11-20T08:00:00.000Z" },
      "toCountry": { "id": 2, "name": "India", "code": "IN", "isActive": true, "createdAt": "2026-11-20T08:00:00.000Z" },
      "category": { "id": 1, "name": "Tourist", "description": "Tourism visit", "isActive": true, "createdAt": "2026-11-20T08:00:00.000Z" },
      "center": { "id": 1, "countryId": 1, "name": "Dhaka Visa Center", "code": "DHK", "address": "Dhaka, Bangladesh", "isActive": true, "createdAt": "2026-11-20T08:00:00.000Z" },
      "priorityRequests": []
    }
  ]
}
```

### `GET /applications/:id` — authenticated owner

A caller can retrieve only their own application. A missing or unowned ID returns `404`.

### `GET /applications/:id/documents/:documentId` — authenticated owner or admin

Downloads an uploaded slot-booking file. Applicants can download files belonging to their own requests; admins can download files for review.

### `GET /applications/:id/documents/:documentId` — authenticated owner or admin

Downloads an uploaded slot-booking file. Applicants can download files belonging to their own requests; admins can download files for review.

**Request**

```sh
curl "$API_BASE/applications/34" -H "Authorization: Bearer $TOKEN"
```

**Example response — `200 OK`**

```json
{
  "success": true,
  "data": {
    "id": 34,
    "userId": 12,
    "referenceCode": "VSA-1795260000000-ABC123",
    "applicantName": "Example Applicant",
    "passportNumber": "A12345678",
    "fromCountryId": 1,
    "toCountryId": 2,
    "categoryId": 1,
    "centerId": 1,
    "visaType": "Tourist",
    "applicantPhone": "01700000000",
    "applicantEmail": "applicant@example.com",
    "notes": "First-time application",
    "status": "DRAFT",
    "currentPriority": null,
    "createdAt": "2026-11-21T10:00:00.000Z",
    "updatedAt": "2026-11-21T10:00:00.000Z",
    "documents": [],
    "fromCountry": { "id": 1, "name": "Bangladesh", "code": "BD", "isActive": true, "createdAt": "2026-11-20T08:00:00.000Z" },
    "toCountry": { "id": 2, "name": "India", "code": "IN", "isActive": true, "createdAt": "2026-11-20T08:00:00.000Z" },
    "category": { "id": 1, "name": "Tourist", "description": "Tourism visit", "isActive": true, "createdAt": "2026-11-20T08:00:00.000Z" },
    "center": { "id": 1, "countryId": 1, "name": "Dhaka Visa Center", "code": "DHK", "address": "Dhaka, Bangladesh", "isActive": true, "createdAt": "2026-11-20T08:00:00.000Z" },
    "priorityRequests": []
  }
}
```

### `GET /applications/admin/all` — admin

Returns all slot requests, including owner, documents, catalog relations and priority requests. Booking-site passwords are omitted from this list.

### `GET /applications/admin/:id` — admin

Returns one request with its complete booking details. Booking-site passwords are decrypted for this admin-only review endpoint and must be handled as secrets.

**Request**

```sh
curl "$API_BASE/applications/admin/all" -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Example response — `200 OK`**

```json
{
  "success": true,
  "data": [
    {
      "id": 34,
      "userId": 12,
      "referenceCode": "VSA-1795260000000-ABC123",
      "applicantName": "Example Applicant",
      "passportNumber": "A12345678",
      "fromCountryId": 1,
      "toCountryId": 2,
      "categoryId": 1,
      "centerId": 1,
      "visaType": "Tourist",
      "applicantPhone": "01700000000",
      "applicantEmail": "applicant@example.com",
      "notes": "First-time application",
      "status": "DRAFT",
      "currentPriority": null,
      "createdAt": "2026-11-21T10:00:00.000Z",
      "updatedAt": "2026-11-21T10:00:00.000Z",
      "user": { "id": 12, "name": "Example Agency", "email": "agent@example.com", "phone": "01700000000", "role": "AGENT" },
      "documents": [],
      "fromCountry": { "id": 1, "name": "Bangladesh", "code": "BD", "isActive": true, "createdAt": "2026-11-20T08:00:00.000Z" },
      "toCountry": { "id": 2, "name": "India", "code": "IN", "isActive": true, "createdAt": "2026-11-20T08:00:00.000Z" },
      "category": { "id": 1, "name": "Tourist", "description": "Tourism visit", "isActive": true, "createdAt": "2026-11-20T08:00:00.000Z" },
      "center": { "id": 1, "countryId": 1, "name": "Dhaka Visa Center", "code": "DHK", "address": "Dhaka, Bangladesh", "isActive": true, "createdAt": "2026-11-20T08:00:00.000Z" },
      "priorityRequests": []
    }
  ]
}
```

### `PATCH /applications/admin/:id/status` — admin

Allowed statuses: `SUBMITTED`, `IN_REVIEW`, `PROCESSING`, `COMPLETED`, `REJECTED`. This route currently updates the status directly; it does not validate workflow transitions.

**Request**

```sh
curl -X PATCH "$API_BASE/applications/admin/34/status" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"status":"IN_REVIEW"}'
```

**Example response — `200 OK`**

```json
{
  "success": true,
  "data": {
    "id": 34,
    "userId": 12,
    "referenceCode": "VSA-1795260000000-ABC123",
    "applicantName": "Example Applicant",
    "passportNumber": "A12345678",
    "fromCountryId": 1,
    "toCountryId": 2,
    "categoryId": 1,
    "centerId": 1,
    "visaType": "Tourist",
    "applicantPhone": "01700000000",
    "applicantEmail": "applicant@example.com",
    "notes": "First-time application",
    "status": "IN_REVIEW",
    "currentPriority": null,
    "createdAt": "2026-11-21T10:00:00.000Z",
    "updatedAt": "2026-11-21T10:20:00.000Z"
  }
}
```

---

## 6. Wallet and deposits

### `GET /wallet/summary` — authenticated

**Request**

```sh
curl "$API_BASE/wallet/summary" -H "Authorization: Bearer $TOKEN"
```

**Example response — `200 OK`**

```json
{ "success": true, "data": { "walletBalance": "5000.00", "walletReserved": "2500.00" } }
```

Available amount is `walletBalance - walletReserved`.

### `GET /wallet/ledger` — authenticated

Returns the latest 100 ledger records belonging to the signed-in user.

**Request**

```sh
curl "$API_BASE/wallet/ledger" -H "Authorization: Bearer $TOKEN"
```

**Example response — `200 OK`**

```json
{
  "success": true,
  "data": [
    {
      "id": 51,
      "userId": 12,
      "type": "DEPOSIT",
      "amount": "5000.00",
      "balanceAfter": "5000.00",
      "referenceType": "DEPOSIT",
      "referenceId": 70,
      "description": "Deposit approved: TXN-EXAMPLE-001",
      "createdAt": "2026-11-21T10:30:00.000Z"
    }
  ]
}
```

### `POST /wallet/deposits` — authenticated, multipart

`proof` is optional. Allowed files: PDF, JPG/JPEG, PNG. Required fields: positive `amount` (maximum 10,000,000), `paymentMethod` (2–50 chars), and `transactionRef` (3–100 chars). `senderAccount` is optional.

**Request**

```sh
curl -X POST "$API_BASE/wallet/deposits" \
  -H "Authorization: Bearer $TOKEN" \
  -F 'amount=5000' \
  -F 'paymentMethod=bKash' \
  -F 'senderAccount=01700000000' \
  -F 'transactionRef=TXN-EXAMPLE-001' \
  -F 'proof=@payment-proof.jpg'
```

**Example response — `201 Created`**

```json
{
  "success": true,
  "message": "Deposit request submitted for admin review.",
  "data": {
    "id": 70,
    "userId": 12,
    "amount": "5000.00",
    "paymentMethod": "bKash",
    "senderAccount": "01700000000",
    "transactionRef": "TXN-EXAMPLE-001",
    "proofPath": "<server-private-path>",
    "status": "PENDING",
    "adminNote": null,
    "reviewedById": null,
    "reviewedAt": null,
    "createdAt": "2026-11-21T10:10:00.000Z"
  }
}
```

`proofPath` is a private server path, not a download URL. Do not expose it publicly. Pending funds do not increase the wallet.

### `GET /wallet/admin/deposits?status=PENDING` — admin

The `status` filter is optional. Values: `PENDING`, `APPROVED`, `REJECTED`.

**Request**

```sh
curl "$API_BASE/wallet/admin/deposits?status=PENDING" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Example response — `200 OK`**

```json
{
  "success": true,
  "data": [
    {
      "id": 70,
      "userId": 12,
      "amount": "5000.00",
      "paymentMethod": "bKash",
      "senderAccount": "01700000000",
      "transactionRef": "TXN-EXAMPLE-001",
      "proofPath": null,
      "status": "PENDING",
      "adminNote": null,
      "reviewedById": null,
      "reviewedAt": null,
      "createdAt": "2026-11-21T10:10:00.000Z",
      "user": { "id": 12, "name": "Example Agency", "email": "agent@example.com", "phone": "01700000000" }
    }
  ]
}
```

### `PATCH /wallet/admin/deposits/:id/review` — admin

A deposit can be reviewed only once. Approval credits the wallet and creates a ledger row inside a transaction; rejection does not credit funds.

**Request**

```sh
curl -X PATCH "$API_BASE/wallet/admin/deposits/70/review" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"decision":"APPROVE","adminNote":"Payment verified"}'
```

`decision` is `APPROVE` or `REJECT`; `adminNote` is optional (maximum 2,000 chars).

**Example response — `200 OK`**

```json
{
  "success": true,
  "message": "Deposit approved.",
  "data": {
    "id": 70,
    "userId": 12,
    "amount": "5000.00",
    "paymentMethod": "bKash",
    "senderAccount": "01700000000",
    "transactionRef": "TXN-EXAMPLE-001",
    "proofPath": null,
    "status": "APPROVED",
    "adminNote": "Payment verified",
    "reviewedById": 1,
    "reviewedAt": "2026-11-21T10:30:00.000Z",
    "createdAt": "2026-11-21T10:10:00.000Z"
  }
}
```

---

## 7. Priority pricing and requests

The exact price key is `fromCountryId + toCountryId + categoryId + centerId + level`. The center must be located in the From Country. The server resolves the amount; clients must never submit a price.

### `GET /priorities/prices?fromCountryId=1&toCountryId=2&categoryId=1&centerId=1` — public

Each query filter is optional. Returns only active rules matching all provided filters.

**Request**

```sh
curl "$API_BASE/priorities/prices?fromCountryId=1&toCountryId=2&categoryId=1&centerId=1"
```

**Example response — `200 OK`**

```json
{
  "success": true,
  "data": [
    {
      "id": 4,
      "fromCountryId": 1,
      "toCountryId": 2,
      "categoryId": 1,
      "centerId": 1,
      "level": "HIGH",
      "price": "2500.00",
      "isActive": true,
      "updatedAt": "2026-11-21T09:00:00.000Z",
      "fromCountry": { "id": 1, "name": "Bangladesh", "code": "BD", "isActive": true, "createdAt": "2026-11-20T08:00:00.000Z" },
      "toCountry": { "id": 2, "name": "India", "code": "IN", "isActive": true, "createdAt": "2026-11-20T08:00:00.000Z" },
      "category": { "id": 1, "name": "Tourist", "description": "Tourism visit", "isActive": true, "createdAt": "2026-11-20T08:00:00.000Z" },
      "center": { "id": 1, "countryId": 1, "name": "Dhaka Visa Center", "code": "DHK", "address": "Dhaka, Bangladesh", "isActive": true, "createdAt": "2026-11-20T08:00:00.000Z" }
    }
  ]
}
```

### `PUT /priorities/admin/prices` — admin

Creates a new exact rule or updates its price/active state. Price may be `0` to 10,000,000; `isActive` defaults to `true` on creation.

**Request**

```sh
curl -X PUT "$API_BASE/priorities/admin/prices" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"fromCountryId":1,"toCountryId":2,"categoryId":1,"centerId":1,"level":"HIGH","price":2500,"isActive":true}'
```

**Example response — `200 OK`**

```json
{
  "success": true,
  "data": {
    "id": 4,
    "fromCountryId": 1,
    "toCountryId": 2,
    "categoryId": 1,
    "centerId": 1,
    "level": "HIGH",
    "price": "2500.00",
    "isActive": true,
    "updatedAt": "2026-11-21T09:00:00.000Z",
    "fromCountry": { "id": 1, "name": "Bangladesh", "code": "BD", "isActive": true, "createdAt": "2026-11-20T08:00:00.000Z" },
    "toCountry": { "id": 2, "name": "India", "code": "IN", "isActive": true, "createdAt": "2026-11-20T08:00:00.000Z" },
    "category": { "id": 1, "name": "Tourist", "description": "Tourism visit", "isActive": true, "createdAt": "2026-11-20T08:00:00.000Z" },
    "center": { "id": 1, "countryId": 1, "name": "Dhaka Visa Center", "code": "DHK", "address": "Dhaka, Bangladesh", "isActive": true, "createdAt": "2026-11-20T08:00:00.000Z" }
  }
}
```

The selected center must belong to `fromCountryId`. Editing a rule does not change amounts on existing priority requests.

### `POST /applications/:id/priority` — authenticated owner

Allowed only when the application is `DRAFT` or `SUBMITTED`. A pending priority request must not already exist. Send the level only—never send an amount.

**Request**

```sh
curl -X POST "$API_BASE/applications/34/priority" \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"level":"HIGH"}'
```

Allowed levels: `LOW`, `MID`, `HIGH`.

**Example response — `201 Created`**

```json
{
  "success": true,
  "message": "Priority request submitted. The matching configured price has been reserved pending admin review.",
  "data": {
    "id": 91,
    "userId": 12,
    "applicationId": 34,
    "level": "HIGH",
    "amount": "2500.00",
    "priceRuleId": 4,
    "status": "PENDING",
    "adminNote": null,
    "reviewedById": null,
    "reviewedAt": null,
    "createdAt": "2026-11-21T10:15:00.000Z"
  }
}
```

The exact active price is reserved from available wallet funds. Missing/inactive price returns `400`; insufficient funds returns `402`; an existing pending request or an application at another stage returns `409`.

### `GET /priorities/admin/requests?status=PENDING` — admin

The `status` filter is optional. Values: `PENDING`, `APPROVED`, `REJECTED`.

**Request**

```sh
curl "$API_BASE/priorities/admin/requests?status=PENDING" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Example response — `200 OK`**

```json
{
  "success": true,
  "data": [
    {
      "id": 91,
      "userId": 12,
      "applicationId": 34,
      "level": "HIGH",
      "amount": "2500.00",
      "priceRuleId": 4,
      "status": "PENDING",
      "adminNote": null,
      "reviewedById": null,
      "reviewedAt": null,
      "createdAt": "2026-11-21T10:15:00.000Z",
      "user": { "id": 12, "name": "Example Agency", "email": "agent@example.com", "role": "AGENT" },
      "application": {
        "id": 34,
        "referenceCode": "VSA-1795260000000-ABC123",
        "applicantName": "Example Applicant",
        "status": "DRAFT",
        "fromCountry": { "id": 1, "name": "Bangladesh" },
        "toCountry": { "id": 2, "name": "India" },
        "category": { "id": 1, "name": "Tourist" },
        "center": { "id": 1, "name": "Dhaka Visa Center" },
        "documents": []
      },
      "priceRule": { "id": 4, "level": "HIGH", "price": "2500.00", "isActive": true }
    }
  ]
}
```

The response contains additional application and price-rule fields shown by the related records.

### `PATCH /priorities/admin/requests/:id/review` — admin

Each priority request can be reviewed once. Approving captures the reserved amount; rejecting releases the reservation.

**Request**

```sh
curl -X PATCH "$API_BASE/priorities/admin/requests/91/review" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"decision":"APPROVE","adminNote":"Reviewed"}'
```

`decision` is `APPROVE` or `REJECT`; `adminNote` is optional (maximum 2,000 chars).

**Example response — `200 OK`**

```json
{
  "success": true,
  "message": "Priority request approved.",
  "data": {
    "id": 91,
    "userId": 12,
    "applicationId": 34,
    "level": "HIGH",
    "amount": "2500.00",
    "priceRuleId": 4,
    "status": "APPROVED",
    "adminNote": "Reviewed",
    "reviewedById": 1,
    "reviewedAt": "2026-11-21T10:30:00.000Z",
    "createdAt": "2026-11-21T10:15:00.000Z"
  }
}
```

---

## 8. Validation and errors

Invalid schema input returns `400 Bad Request` with the failing field:

```json
{
  "success": false,
  "message": "Validation failed.",
  "errors": [
    { "field": "body.email", "message": "Invalid email" }
  ]
}
```

Common status codes: `400` invalid input or missing active price; `401` missing/invalid/expired token or invalid login; `402` insufficient available wallet balance; `403` role restriction or suspended account; `404` missing or unowned application/resource; `409` duplicate registration or conflicting/reviewed state; `500` unexpected server error. Error responses hide internal details for `500`.

There is currently no pagination, password-reset endpoint, or customer deposit-history endpoint.
