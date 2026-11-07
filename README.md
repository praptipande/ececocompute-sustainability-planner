# 🌱 EcoCompute — AI Compute Sustainability Planner

**Smarter AI compute. More sustainable decisions.**

EcoCompute is a full-stack sustainability planning application designed to help users compare AI and machine learning workload configurations using estimated **energy consumption, carbon emissions, water usage, operational costs, and sustainability scores**.

Built with React, TypeScript, Express, and MongoDB, EcoCompute explores how infrastructure choices can influence the environmental footprint of AI workloads.

> **EcoCompute is an independent college demonstration project.** It provides dataset-backed planning estimates, not real-time hardware measurements or certified environmental assessments. Sustainability scores are provisional.

## ✨ Key Features

| Feature | Description |
| --- | --- |
| **Scenario Planning** | Create, manage, and save AI/ML workload configurations |
| **Energy Estimation** | Estimate energy requirements using matching dataset records |
| **Carbon Estimation** | Evaluate estimated carbon emissions |
| **Water Estimation** | Explore estimated water consumption |
| **Cost Estimation** | Compare estimated operational costs |
| **Scenario Comparison** | Compare saved workload configurations |
| **What-If Optimization** | Explore alternative configurations supported by available data |
| **Recommendations** | Receive explainable, dataset-backed suggestions |
| **User Authentication** | Registration and login with JWT authentication |
| **Admin Dashboard** | Read-only administrative information with role-based access |

**Important:** Estimates require matching active dataset records. Missing values are reported as unavailable rather than zero.

## 🏗️ Architecture

EcoCompute follows a frontend–backend architecture.

```text
                   EcoCompute
                       |
             +---------+---------+
             |                   |
        React Frontend      Express Backend
        TypeScript          TypeScript
        Vite + Tailwind     REST API
             |                   |
             +------ HTTP -------+
                                 |
                         Business Logic
                         Estimation Engine
                         Authentication
                         Optimization
                         Recommendations
                                 |
                              MongoDB
```

### Project Structure

```text
EcoCompute/
├── src/                    # React frontend
├── server/
│   └── src/                # Express backend
│       ├── config/
│       ├── controllers/
│       ├── middleware/
│       ├── models/
│       ├── routes/
│       ├── services/
│       └── types/
├── docs/                   # Technical documentation
├── .gitignore
├── package.json
├── index.html
├── tsconfig.json
└── vite.config.ts
```

## 🔄 How EcoCompute Works

1. A user registers or logs in.
2. The user creates an AI/ML workload scenario.
3. The backend searches for matching active dataset records.
4. When suitable records exist, the calculation engine produces planning estimates.
5. The user can save scenarios and compare configurations.
6. Optimization and recommendation modules evaluate dataset-supported alternatives.
7. The application presents estimates together with relevant assumptions and provenance.

EcoCompute does not silently invent missing environmental factors or guarantee equivalent AI performance when configurations change.

## 🛠️ Tech Stack

| Layer | Technologies |
| --- | --- |
| **Frontend** | React, TypeScript, Vite |
| **Styling** | Tailwind CSS |
| **Backend** | Node.js, Express, TypeScript |
| **Database** | MongoDB, Mongoose |
| **Authentication** | JSON Web Tokens (JWT) |
| **API** | REST |
| **Development** | npm, Git, GitHub |

## 🚀 Run Locally

### Prerequisites

- Node.js 22 or a compatible supported version
- npm
- A running MongoDB instance

### 1. Clone the repository

```bash
git clone https://github.com/praptipande/ececocompute-sustainability-planner.git
cd ececocompute-sustainability-planner
```

### 2. Install frontend dependencies

```bash
npm install
```

### 3. Install backend dependencies

```bash
cd server
npm install
```

Return to the project root with `cd ..` when needed.

### 4. Configure environment variables

Copy `server/.env.example` to `server/.env` and replace all placeholder values.

Required backend settings include:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret
```

Optional initial-admin credentials are described in the environment example.

The frontend uses this API address by default:

```env
VITE_API_BASE_URL=http://localhost:4000/api
```

If needed, add this setting to a `.env.local` file in the project root.

**Never commit actual `.env` files, database passwords, or JWT secrets.**

### 5. Start the backend

From the `server` directory:

```bash
npm run dev
```

### 6. Start the frontend

In a second Terminal window, from the main project directory:

```bash
npm run dev
```

Open the local URL displayed by Vite.

The backend health-check endpoint is:

```http
GET /health
```

## 🔌 API Overview

| Endpoint | Purpose |
| --- | --- |
| `/api/auth` | Registration, login, and current-user profile |
| `/api/scenarios` | Authenticated scenario management and estimates |
| `/api/comparisons` | Saved-scenario comparisons |
| `/api/optimize` | Dataset-backed optimization |
| `/api/recommendations` | Explainable recommendations |
| `/api/admin/dashboard` | Read-only admin dashboard |
| `/api/admin/users` | Read-only administrative user information |
| `/api/admin/datasets` | Read-only administrative dataset information |
| `/health` | Backend health check |

User operations require authentication where applicable. Admin endpoints require backend-enforced authentication and admin authorization.

## 🌍 Sustainability Metrics

EcoCompute considers five planning dimensions:

| Metric | Description |
| --- | --- |
| **Energy** | Estimated electricity requirements |
| **Carbon** | Estimated emissions associated with compute energy |
| **Water** | Estimated water consumption associated with compute |
| **Cost** | Estimated operational expenditure |
| **Sustainability Score** | Provisional sustainability comparison score |

Estimates depend on workload type, GPU, location, energy source, and available dataset records.

The sustainability score is not an official environmental rating.

## 📊 Dataset and Provenance

The calculation engine requires an active dataset record matching the workload type, GPU, location, and energy source.

EcoCompute distinguishes between:

- **Illustrative records:** Assumptions used for demonstrations or exploratory planning.
- **Verified records:** Data supported by traceable sources and review.

The repository intentionally contains no verified production dataset records by default.

For demonstrations, suitable illustrative records must be provisioned through a controlled development or database administration process.

Until matching records are available, the application may report that estimates cannot be calculated.

See [Dataset Documentation](./docs/DATASET.md) for schemas, formulas, units, and provenance rules.

## 🔐 Authentication and Security

EcoCompute uses JWT authentication and backend authorization.

- Users can register and log in.
- Authenticated users can manage their own scenarios.
- Protected operations require valid authentication.
- Administrative endpoints require the admin role.
- Admin authorization is enforced by the backend, not merely by hiding frontend navigation.
- Secrets and database credentials must remain outside version control.

## 🧪 Validation

### Frontend checks

```bash
npx tsc --noEmit
npm run build
```

### Backend checks

```bash
cd server
npm run typecheck
npm run build
```

These commands validate compilation and build behavior. They do not constitute end-to-end testing.

**Testing status:** The application has not yet been fully run and tested locally during this repository review. No automated test runner is currently declared in either package.

## 🎓 Suggested Demo Workflow

1. Configure MongoDB and backend environment variables.
2. Start the backend and frontend.
3. Register or log in as a normal user.
4. Explain dataset provenance and the difference between illustrative and verified data.
5. Provision suitable demonstration dataset records.
6. Create an AI/ML workload scenario.
7. Explore estimated energy, carbon, water, cost, and sustainability metrics.
8. Compare saved scenarios.
9. Demonstrate optimization and recommendations.
10. Log in with properly configured admin credentials to demonstrate the read-only admin dashboard.

Do not present missing estimates as zero or unverified assumptions as certified environmental measurements.

## 📚 Documentation

| Document | Description |
| --- | --- |
| [Dataset](./docs/DATASET.md) | Dataset structure, formulas, units, and provenance |
| [Scenarios](./docs/SCENARIOS.md) | Scenario management |
| [Comparisons](./docs/COMPARISONS.md) | Comparing workload configurations |
| [Optimization](./docs/OPTIMIZATION.md) | Configuration optimization |
| [Recommendations](./docs/RECOMMENDATIONS.md) | Explainable recommendations |
| [Admin API](./docs/ADMIN-API.md) | Administrative API documentation |

## 🔮 Future Scope

Potential future improvements include:

- Integration with real-world hardware energy measurements.
- Expanded GPU and cloud infrastructure datasets.
- Regional carbon-intensity comparisons.
- Historical sustainability tracking.
- Exportable sustainability reports.
- Automated integration and end-to-end tests.
- Public demonstration deployment.

These are proposed improvements, not claims of existing functionality.

## ⚠️ Disclaimer

EcoCompute is an educational sustainability planning prototype.

All results depend on the quality and availability of configured datasets. Estimates should not be treated as live measurements, certified carbon accounting, or guarantees of AI workload performance.

---

**EcoCompute — Making AI compute planning more sustainability-aware.** 🌱
