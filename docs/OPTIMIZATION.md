# Sustainability optimization API

## Endpoint

`POST /api/optimize` requires a JWT and accepts:

```json
{
  "input": {
    "scenarioName": "Baseline",
    "workloadType": "generative-ai-llm",
    "gpuType": "A100",
    "gpuCount": 2,
    "runtimeHours": 3,
    "utilizationPercent": 50,
    "location": "India",
    "energySource": "grid",
    "performanceTarget": "standard",
    "optimizationObjective": "minimum-carbon"
  }
}
```

The server calculates the baseline and every candidate through the existing
estimation service. Client-supplied estimates, savings, scores, and dataset
factors are rejected. Optimization does not create or update scenarios.

## Objectives and candidates

The supported objectives are the existing values:

- `minimum-carbon`
- `minimum-energy`
- `minimum-cost`
- `balanced`

There is no separate minimum-water enum in the current contract. Water is
included in the balanced objective.

Candidates come only from active dataset records with the same workload type
and location. A candidate may change GPU type and energy source when a
matching reference record exists. Runtime, utilization, performance target,
and GPU count are unchanged because throughput, model quality, and operational
feasibility are not modeled. GPU changes are therefore reference alternatives,
not guarantees of equivalent service.

At most 12 alternatives are evaluated. Duplicate GPU/energy-source
configurations and candidates that cannot be estimated are returned in
`skippedCandidates` with reasons.

## Ranking and differences

The first result is the recommendation. Single-objective rankings minimize the
corresponding calculated metric. `balanced` minimizes the average of four
bounded normalized impacts:

```text
energy / 100 kWh
carbon / 100 kg CO2e
water / 500 liters
cost / 10,000 INR
```

Each normalized component is capped to `[0, 1]`; lower is better. These limits
are project comparison assumptions, not environmental standards.

Differences use:

```text
absolute = candidate - baseline
percentage = (candidate - baseline) / baseline × 100
```

Percentage is `null` when the baseline is zero.

## Provenance

Dataset keys, versions, provenance status, assumptions, and warnings remain in
each estimate. Illustrative records produce warnings and must not be described
as verified environmental measurements. Missing or unsuitable dataset factors
are skipped with a reason; no fallback values are invented.
