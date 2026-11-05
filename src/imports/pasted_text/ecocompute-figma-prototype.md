Recreate the EcoCompute project as a polished, final Figma Make prototype.

IMPORTANT:
This is a recreation/improvement of an existing EcoCompute prototype that was already designed and tested. Do NOT invent a different product, visual style, layout, workflow, or concept. Preserve the same overall look, structure, terminology, page hierarchy, cards, dashboard style, colors, and user flow as closely as possible.

PROJECT TITLE:
EcoCompute — AI Compute Sustainability Planner

PROJECT PURPOSE:
EcoCompute is a sustainability planning and scenario-comparison tool for AI/ML workloads. It estimates energy consumption, carbon emissions, water usage, operating cost, and an overall sustainability score based on a user's compute configuration. It then allows the user to explore alternative configurations and compare their environmental/economic impact.

IMPORTANT PRODUCT POSITIONING:
EcoCompute is a planning/estimation tool based on stated assumptions. It must NOT claim to provide live measurements, real-time environmental monitoring, or actual ML predictions unless explicitly implemented. Use language such as "estimated", "projected", "scenario", and "based on assumptions" where appropriate.

==================================================
1. OVERALL UI / DESIGN
==================================================

Create a modern, clean, professional sustainability dashboard suitable for a B.Tech FSDL mini-project evaluation.

Keep the existing EcoCompute visual identity:
- clean modern dashboard
- sustainability/technology aesthetic
- rounded cards
- clear metric cards
- professional typography
- subtle borders/shadows
- consistent spacing
- clear primary buttons
- green/environmental visual cues
- dark/neutral text on a clean background
- polished academic/project-demo appearance

Do NOT radically redesign the interface.

The main navigation must remain:

Dashboard
Planner
Analysis
Compare
Recommendation

The workflow must be:

Dashboard
→ Planner
→ Analysis
→ What-If / Explore Alternative
→ Compare
→ Optimize
→ Recommendation

Also include a clearly accessible:
Methodology & Assumptions

Make the navigation functional.

==================================================
2. DASHBOARD
==================================================

Create the EcoCompute dashboard matching the existing prototype style.

Include:
- EcoCompute title/branding
- short description explaining AI compute sustainability planning
- overview/summary cards
- current scenario information
- energy, CO2, water, cost and sustainability metrics
- navigation to Planner
- recent/current scenario information where appropriate

Do not add unnecessary features.

==================================================
3. PLANNER
==================================================

Create the same planner-style input experience as the existing prototype.

The user should be able to enter/select:

Scenario Name
AI Workload / Model
GPU / CPU Type
Number of GPUs
Runtime / Computing Time
Utilization
Data-center Location
Energy Source
Performance Target
Optimization Objective

Use these example values for the demo:

Scenario Name:
Train an image classification model

AI Workload / Model:
Image Classification

GPU:
NVIDIA A100

Number of GPUs:
8

Runtime:
20 hours

Utilization:
80%

Location:
Mumbai, India

Energy Source:
Grid

Performance:
Standard

Optimization:
Minimum Carbon

The Planner must have a clear primary action to calculate/analyze the scenario.

==================================================
4. BASELINE ANALYSIS
==================================================

When the demo scenario is analyzed, display these EXACT baseline values:

Energy:
1,240 kWh

CO2:
410 kg CO2e

Water:
2,232 L

Cost:
₹13,020

EcoCompute Sustainability Score:
72/100

Configuration:
NVIDIA A100
8 GPUs
20 hours
Mumbai, India
Grid

Display the metrics using the same type of metric cards/visual hierarchy as the existing prototype.

Include environmental impact visualization such as bars/cards/charts where appropriate.

Include a prominent:
"Explore Alternative"
button.

IMPORTANT:
These values are project/demo estimates based on assumptions. Do not label them as real-time measurements.

==================================================
5. WHAT-IF / EXPLORE ALTERNATIVE
==================================================

Create the same What-If scenario interface as the existing prototype.

Show:

CURRENT CONFIGURATION

8 × NVIDIA A100
20 hours
80% utilization
Mumbai
Grid

ALTERNATIVE CONFIGURATION

GPU:
NVIDIA T4

GPU Count:
4

Runtime:
30 hours

Utilization:
75%

Location:
Mumbai, India

Energy Source:
Renewable

Allow the user to modify alternative parameters and recalculate the scenario.

Include:
"Recalculate Scenario"

For the demo configuration above, the projected values MUST be:

Energy:
~950 kWh

CO2:
~145 kg CO2e

Water:
~340 L

Cost:
~₹9,980

Do not introduce contradictory values anywhere else.

==================================================
6. COMPARE PAGE
==================================================

Create the same three-scenario comparison structure as the existing prototype.

Scenario A — Current / Baseline

8 GPUs × 20 hours
Grid

Energy:
1,240 kWh

CO2:
410 kg CO2e

Water:
2,232 L

Cost:
₹13,020

Score:
72

Scenario B — Alternative

4 GPUs × 30 hours
Grid

Energy:
~950 kWh

CO2:
~310 kg CO2e

Water:
~1,710 L

Cost:
~₹9,980

Score:
79

Scenario C — Alt + Renewable

4 GPUs × 30 hours
Renewable

Energy:
~950 kWh

CO2:
~145 kg CO2e

Water:
~340 L

Cost:
~₹9,980

Score:
91

Show percentage changes relative to the current baseline.

For Scenario C, approximately:
Energy ↓23.4%
CO2 ↓64.6%
Water ↓84.7%
Cost ↓23.4%

Include a trade-off explanation:

Alternative scenarios reduce energy/carbon impact by reducing GPU count, but runtime is longer.

The renewable scenario provides a major reduction in estimated carbon impact, while maintaining a similar energy/cost footprint to the alternative scenario.

Do NOT say that one scenario is universally best.

The interface should communicate that the appropriate configuration depends on the user's optimization objective and constraints.

==================================================
7. OPTIMIZATION PAGE
==================================================

Create the same optimization-selection interface.

Optimization options:

Balanced
Minimum Energy
Minimum Carbon
Minimum Cost

Allow the user to select an objective.

The existing demo should use:

Minimum Carbon

Include:

"Find Recommended Configuration"

button.

==================================================
8. RECOMMENDATION PAGE
==================================================

Create the same polished recommendation page as the existing prototype.

Recommended configuration:

4 GPUs × 30 hours

Mumbai, India

Renewable / Mixed Energy

Display EXACTLY:

Energy:
~950 kWh

CO2:
~145 kg CO2e

Water:
~340 L

Cost:
~₹9,980

Sustainability Score:
91/100

Impact vs Current:

Energy ↓23%
CO2 ↓64%
Water ↓85%
Cost ↓23%

The recommendation must use the SAME values as Scenario C in Compare.

DO NOT use the old inconsistent value of 1,700 L for water.

The recommendation should explain reasons such as:
- lower GPU count
- lower estimated energy consumption
- substantially lower estimated carbon emissions through renewable energy
- lower estimated cost

Trade-offs:
- runtime increases from 20 to 30 hours
- renewable availability may vary
- estimates depend on the assumptions used

Include a clear disclaimer that these are scenario estimates.

==================================================
9. METHODOLOGY & ASSUMPTIONS
==================================================

Add a polished Methodology & Assumptions section/page without changing the existing visual identity.

Explain at a simple student-project level:

Energy estimation:
estimated based on compute hardware, GPU count, utilization and runtime.

Carbon estimation:
estimated using the energy requirement and assumed electricity/carbon-intensity factor for the selected energy source/location.

Water estimation:
estimated using an assumed water-intensity factor associated with compute/data-center operation.

Cost estimation:
estimated using compute energy/usage assumptions.

Sustainability score:
a combined project-defined score derived from the scenario's estimated energy, carbon, water and cost impact.

Scenario comparison:
compares the current configuration against alternative configurations using the same calculation assumptions.

IMPORTANT:
Clearly state:

"EcoCompute provides estimated scenario values based on stated assumptions. These are not live measurements."

Do not claim:
- real-time monitoring
- live data
- trained ML prediction
- actual data-center measurements
- guaranteed savings

Keep this section concise and visually consistent with the rest of the project.

==================================================
10. CALCULATION CONSISTENCY — CRITICAL
==================================================

This is extremely important.

Use ONE consistent underlying scenario/calculation state throughout the entire application.

The baseline must always remain:

1240 kWh
410 kg CO2e
2232 L
₹13020
Score 72

The renewable alternative must always remain:

~950 kWh
~145 kg CO2e
~340 L
~₹9980
Score 91

The same values must appear consistently in:
- Analysis
- What-If
- Compare
- Recommendation

Do NOT create contradictory hardcoded values.

In particular:
DO NOT show 1,700 L water on the Recommendation page.
The renewable alternative water value is ~340 L everywhere.

Percentage reductions should be calculated from the same baseline values rather than independently invented.

==================================================
11. FUNCTIONALITY
==================================================

Make the prototype interactive.

The user should be able to navigate:

Dashboard
→ Planner
→ Analysis
→ Explore Alternative
→ What-If
→ Compare
→ Optimize
→ Recommendation

Buttons should work.

Navigation should work.

Inputs should remain consistent.

Recalculate Scenario should update the displayed scenario where practical.

Optimization selection should lead to the recommendation.

The Recommendation should correspond to the selected/optimized scenario.

Do not add unnecessary features.

==================================================
12. RESPONSIVE / UX POLISH
==================================================

Before finishing, check the complete prototype for:

- broken buttons
- broken navigation
- inconsistent labels
- inconsistent metric values
- empty/unfinished components
- placeholder text
- overlapping elements
- poor spacing
- inconsistent typography
- cards that do not align
- unreadable text
- mobile/responsive layout problems

Fix genuine issues.

Do NOT redesign the application after completing it.

==================================================
13. FINAL QA
==================================================

Perform a final internal consistency audit.

Verify that:

BASELINE:
8 A100 GPUs
20 hours
Mumbai
Grid
1240 kWh
410 kg CO2e
2232 L water
₹13020
Score 72

ALTERNATIVE RENEWABLE:
4 T4 GPUs
30 hours
75% utilization
Mumbai
Renewable
~950 kWh
~145 kg CO2e
~340 L water
~₹9980
Score 91

Verify that these values are consistent across all pages.

Verify that the recommendation matches the renewable alternative.

Verify that the methodology disclaimer is present.

Verify that no page claims live measurements or ML predictions.

Verify that there are no contradictory values.

==================================================
FINAL INSTRUCTION
==================================================

Build this as a COMPLETE, polished, demo-ready EcoCompute prototype.

Most importantly:
DO NOT create a different UI from our existing EcoCompute design.

Recreate the same overall visual language, page structure, navigation, cards, metric presentation, workflow and terminology of the existing EcoCompute prototype, while incorporating all of the consistency fixes, methodology section, UX polish and final QA requirements described above.

Do not add unnecessary features.
Do not change the project concept.
Do not change the core navigation.
Do not invent datasets.
Do not claim that the project uses a trained ML model.

The final result should look like the SAME EcoCompute project, but as a clean, corrected, complete final version ready for our FSDL mini-project evaluation.