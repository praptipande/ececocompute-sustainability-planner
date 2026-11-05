# Scenario API

Scenario endpoints are protected by JWT authentication. The authenticated
token subject is the only source of scenario ownership; `ownerId` is never
accepted from a client request.

## Endpoints

- `POST /api/scenarios` creates a scenario from `{ "input": WorkloadInput }`.
- `GET /api/scenarios` lists only the authenticated user's scenarios.
- `GET /api/scenarios/:id` reads an owned scenario.
- `PATCH /api/scenarios/:id` replaces the validated workload input and
  recalculates the estimate.
- `DELETE /api/scenarios/:id` deletes an owned scenario.

The stored `estimate` is a calculation snapshot generated when the scenario is
created or updated. It contains the dataset version, assumptions, provenance,
and warnings used for that calculation; it is not treated as authoritative
when the dataset changes later. Client-supplied estimates and ownership fields
are rejected.

Cross-user access and nonexistent scenarios use the same `404` response so
resource ownership is not disclosed. Invalid scenario IDs and workload
inputs return `400`. If no suitable active dataset record exists, creation or
update returns `422` and no scenario is saved.
