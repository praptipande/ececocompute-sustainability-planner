🌱 AI Compute Sustainability Planner 

# EcoCompute

EcoCompute is a React and Express application for comparing AI/ML workload
configurations using planning estimates for energy, carbon, water, cost, and a
provisional sustainability score. 

## Architecture

- `src/`: React, TypeScript, Vite, and Tailwind frontend.
- `server/src/`: Express and TypeScript REST API.
- MongoDB with Mongoose stores users, owned scenarios, and versioned dataset
  records.
- JWT authentication protects user and admin operations. Admin authorization is
  enforced by the backend, not by frontend navigation visibility.

The frontend uses `VITE_API_BASE_URL` (default:
`http://localhost:4000/api`). The backend uses the variables in
[.env.example](./.env.example), including `MONGODB_URI`,
`JWT_SECRET`, and optional initial-admin credentials.

## Local setup

Prerequisites: Node.js 22 or a compatible supported Node.js release, npm, and
a running MongoDB instance.

1. Install frontend dependencies:

   ```powershell
   npm install
   ```

2. Install backend dependencies:

   ```powershell
   Set-Location server
   npm install
   ```

3. Copy `server/.env.example` to `server/.env` and replace every placeholder.
   Use a long random `JWT_SECRET`; never commit `.env`.

4. Optionally create a root `.env.local` containing (the committed
   [.env.frontend.example](./.env.frontend.example) shows the same setting):

   ```text
   VITE_API_BASE_URL=http://localhost:4000/api
   ```

5. Start the backend:

   ```powershell
   Set-Location server
   npm run dev
   ```

6. In another terminal, start the frontend:

   ```powershell
   npm run dev
   ```

The backend health endpoint is `GET /health`. The frontend normally runs on
the Vite-provided local URL.

## Dataset and provenance

The calculation engine requires an active dataset record matching workload
type, GPU, location, and energy source. The repository intentionally contains
no verified production records and does not silently seed fabricated factors.
See [docs/DATASET.md](./docs/DATASET.md) for the schema, units, formulas, and
provenance rules.

For a demonstration, provision records through a controlled development or
database administration process and mark assumptions as `illustrative`. Do
not label them `verified` without traceable sources and review. Until matching
records exist, scenario creation and downstream pages correctly report that an
estimate is unavailable.

## API overview

- `/api/auth`: registration, login, and current-user profile.
- `/api/scenarios`: authenticated scenario CRUD with server-generated
  estimates.
- `/api/comparisons`: authenticated saved-scenario comparison.
- `/api/optimize`: authenticated dataset-backed optimization.
- `/api/recommendations`: authenticated explainable recommendations.
- `/api/admin/dashboard`, `/api/admin/users`, `/api/admin/datasets`: read-only
  admin endpoints requiring both authentication and the admin role.

## Validation

Run the focused checks from the project root:

```powershell
npx tsc --noEmit
npm run build
```

Run backend checks:

```powershell
Set-Location server
npm run typecheck
npm run build
```

No automated test runner is currently declared in either package. Database
integration checks require a deliberately configured MongoDB instance and
isolated test data; compilation alone is not an end-to-end test.

## Safe demonstration sequence

1. Start MongoDB and the backend with a configured `server/.env`.
2. Start the Vite frontend.
3. Register a normal user or log in.
4. Explain that results require matching active dataset records and retain
   illustrative/verified provenance.
5. Create a scenario after suitable records are provisioned.
6. Demonstrate Analysis, Compare, What-If/Optimize, and Recommendations.
7. Configure the initial admin credentials in the backend environment, restart
   safely, then log in as that admin and open the read-only admin dashboard.
8. Explain that the sustainability score is provisional and that GPU
   alternatives do not assert preserved throughput, model quality, or
   operational feasibility.

Do not present unavailable results as zero, and do not use placeholder
credentials or unreviewed illustrative factors in a public demonstration.
