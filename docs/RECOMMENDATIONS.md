# Explainable recommendations API

## Endpoint

`POST /api/recommendations` requires a JWT and accepts a workload input. The
objective can be taken from `input.optimizationObjective` or overridden with
the optional top-level `objective`:

```json
{
  "objective": "minimum-carbon",
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
    "optimizationObjective": "balanced"
  }
}
```

The endpoint rejects client-supplied estimates, savings, scores, and dataset
factors. It does not persist scenarios or recommendations.

## Recommendation generation

The server first calculates the baseline and then calls the existing
optimization service. A recommendation is created only when an evaluated
candidate improves a metric relevant to the selected objective:

- `minimum-carbon`: lower calculated carbon
- `minimum-energy`: lower calculated energy
- `minimum-cost`: lower calculated operating cost
- `balanced`: lower calculated energy, carbon, water, or cost

The recommendation list is ordered by the optimization ranking. Each item
contains the candidate configuration, calculated estimate, baseline and
candidate metric values, absolute and percentage changes, priority, dataset
metadata, provenance, and warnings. Percentages are `null` when the baseline
metric is zero.

## Evidence and limitations

All quantitative changes come from the existing estimation service and active
dataset records. Missing or unsuitable candidates remain visible in
`skippedCandidates`; no environmental factors are invented.

Illustrative dataset warnings are preserved and the response clearly identifies
illustrative provenance. GPU configuration suggestions are reference
alternatives only. Throughput, model quality, runtime feasibility, and
operational equivalence are not modeled.
