# Scenario comparison API

## Request

`POST /api/comparisons` requires a JWT and accepts:

```json
{
  "scenarioIds": [
    "507f1f77bcf86cd799439011",
    "507f1f77bcf86cd799439012"
  ]
}
```

The request must contain between two and five unique MongoDB scenario IDs.
User IDs and ownership fields are not accepted.

## Response and baseline

The first ID in `scenarioIds` is the baseline. The response contains the
baseline estimate, alternative estimates, and differences for each alternative.
Differences are calculated as:

```text
absolute difference = alternative metric - baseline metric
percentage difference = absolute difference / baseline metric × 100
```

A percentage is `null` when the baseline metric is zero because the percentage
is undefined. Positive energy, carbon, water, and cost differences mean the
alternative is higher than the baseline; a positive score difference means the
alternative has a higher score.

## Dataset and estimate behavior

Comparisons use the estimate snapshot saved with each scenario. They do not
recalculate scenarios and do not accept client-supplied estimates. A missing
snapshot makes the comparison unavailable rather than causing a fabricated
fallback estimate.

Metric units must match across all snapshots. Dataset-version or calculation
version differences do not make arithmetic impossible, but they add warnings
so users know that the difference may reflect a methodology change as well as
a workload change. Existing illustrative-data warnings are preserved. A
comparison containing illustrative results must not be presented as uniformly
validated environmental measurements.

Scenarios are queried with both the requested IDs and the authenticated user's
ID. If any requested scenario is missing or belongs to another user, the API
returns the same `404` response without disclosing which case occurred.
