# Admin dashboard API

All endpoints below require both a valid JWT and the `admin` role:

- `GET /api/admin/dashboard`
- `GET /api/admin/users`
- `GET /api/admin/datasets`

The router applies `requireAuthentication` before `requireRoles('admin')`.
Missing or invalid credentials return `401`; an authenticated non-admin returns
`403`.

## Dashboard

`GET /api/admin/dashboard` returns counts calculated from MongoDB:

- Total users
- Total scenarios
- Active dataset records
- Users grouped by role
- Scenarios grouped by workload type
- Dataset records grouped by `illustrative` and `verified` provenance

Counts are never hard-coded. A database failure follows the existing generic
server-error handling and does not produce fabricated values.

## User listing

`GET /api/admin/users?page=1&pageSize=20&search=alice`

Pagination defaults to page `1` and page size `20`; page size cannot exceed
`100`. The optional search is a bounded literal substring search over name and
email. The response contains safe public user fields and pagination metadata.
It never includes `passwordHash`.

## Dataset listing

`GET /api/admin/datasets?page=1&pageSize=20`

The response contains dataset identity, descriptive and workload context,
version, active status, provenance, source metadata, factor units, and
timestamps. Factor values are intentionally not returned by this overview
endpoint. There are no dataset mutation endpoints here.

The API is read-only in this prompt: it does not delete users, change roles,
change passwords, or mutate datasets. Frontend visibility is not used as an
authorization mechanism.
