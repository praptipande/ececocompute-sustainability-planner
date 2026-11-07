# EcoCompute Sustainability Reference Dataset

## Purpose

The dataset will provide versioned reference factors for the later
calculation engine. Each record describes a hardware, location, energy-source,
and workload context. Calculations must record the dataset version used.

EcoCompute produces planning estimates, not live measurements or guaranteed
environmental results.

## Record fields and units

- `datasetKey`: stable application identifier.
- `name`, `description`: human-readable explanation of the record.
- `workloadType`: one of the workload categories supported by the backend.
- `gpuType`: hardware label used by a workload input.
- `location`: location label used by a workload input.
- `energySource`: `grid`, `renewable`, or `mixed`.
- `energyReference.value`: reference hardware power in `watts`.
- `carbonIntensity.value`: estimated electricity carbon intensity in
  `kg CO2e/kWh`.
- `waterIntensity.value`: estimated water intensity in `liters/kWh`.
- `electricityCost.value`: estimated compute price in `INR/GPU-hour`.
- `sourceName`, `sourceUrl`: provenance for the factors, where available.
- `referenceYear`: publication or reference year, when known.
- `version`: dataset release identifier.
- `provenanceStatus`: `verified` only when the source and interpretation have
  been checked; otherwise use `illustrative`.
- `active`: whether the record may be selected by a future calculation service.

## Current source status

The repository does not currently contain a verified external dataset. The
existing frontend Methodology page contains illustrative prototype assumptions,
including example GPU, carbon, water, and cost values. Those values are not
seeded into MongoDB by this prompt and must not be treated as authoritative.

Before final evaluation, each active record must be replaced or confirmed using
traceable sources, with the source name, URL, reference year, interpretation,
and dataset version recorded.

## Adding a dataset version

1. Obtain and review traceable source material.
2. Record the source and reference year.
3. Explain any conversion or approximation in the description.
4. Assign a new dataset version instead of silently changing an active version.
5. Validate units and non-negative factor ranges.
6. Deactivate superseded records only through protected admin workflows added
   in a later prompt.

The schema prevents duplicate stable keys and duplicate combinations of
version, workload, hardware, location, and energy source.

## Later calculation use

The calculation engine will select an active record matching the workload
input and use its explicitly unit-labelled factors. It will return the
dataset version and assumptions with every estimate. It must not silently
fall back to undocumented constants when no matching active record exists.

## Calculation contract

The current engine uses the following explicitly documented units:

```text
GPU energy (kWh) =
  hardware power (W)
  × GPU count
  × runtime (hours)
  × utilization fraction
  × facility overhead factor
  ÷ 1000

carbon (kg CO2e) = energy (kWh) × carbon intensity (kg CO2e/kWh)
water (liters) = energy (kWh) × water intensity (liters/kWh)
cost (INR) = cost (INR/GPU-hour) × GPU count × runtime (hours)
```

The current dataset schema has no facility-overhead factor, so the engine uses
an explicit factor of `1` and does not model facility overhead. Utilization is
applied to hardware energy; it is not applied a second time to cost because the
cost factor is already defined per GPU-hour.

The sustainability score is a provisional 0–100 factor-intensity score. It
equally weights normalized hardware power, carbon intensity, water intensity,
and GPU-hour cost against documented project reference limits. It is intended
only for comparison within EcoCompute and is not an official scientific or
environmental rating. Results from `illustrative` records include a warning;
they must not be presented as validated measurements.
