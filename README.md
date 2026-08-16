# Taskly — Task Management System

Taskly is a high-performance, full-stack Task Management System built with Next.js 15, Express, TypeScript, Tailwind CSS, Framer Motion, and MongoDB. It features a frictionless guest login flow, interactive drag-and-drop Kanban boards, structured table views, and an adaptive theme system.

---

## 🏛️ Architecture Overview

The codebase is organized as a Turborepo monorepo with `pnpm` workspaces:

```
Taskly/
├── apps/
│   ├── web/                    # Next.js 15+ App Router, Tailwind CSS, Framer Motion
│   └── api/                    # Express + TypeScript, Mongoose, Zod
├── packages/
│   ├── shared-types/           # Shared Zod schemas & TypeScript types
│   └── config/                 # Base tsconfig and lint rules
├── .github/workflows/
│   ├── ci.yml                  # CI: lint, typecheck, test, build
│   └── deploy.yml              # Vercel multi-project deployment
├── turbo.json                  # Turborepo pipeline configuration
├── package.json                # Monorepo root workspace
└── README.md
```

### Key Architectural Decisions
- **Shared Validation (`packages/shared-types`)**: Single source of truth for Zod schemas (`User`, `Task`, `Auth`, `Filters`) used across backend validation middlewares and frontend forms.
- **Layered Express Backend (`apps/api`)**:
  - `models/`: Mongoose schemas with compound indexes (`owner`, `status`, `order`).
  - `services/`: Encapsulated business logic and initial task seeding.
  - `controllers/`: Thin HTTP handlers wrapped with `asyncHandler`.
  - `middleware/`: Zod validation, JWT verification, and global error normalization.
- **Next.js 15 App Router (`apps/web`)**:
  - Marketing route group `(marketing)` for the high-craft animated landing page.
  - Authenticated route group `(dashboard)` for task management.
  - Responsive layouts supporting desktop, tablet, and mobile viewports.
  - Custom radial blur theme transition originating from the top-right corner.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v20.x` or `v22.x+`
- **pnpm**: `v10+` (or `v11+`)
- **MongoDB**: Local instance or MongoDB Atlas connection string

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Configure Environment Variables

**Backend (`apps/api/.env`)**:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/taskly?retryWrites=true&w=majority
JWT_SECRET=super_secret_jwt_key_taskly_2026_dev_environment
FRONTEND_URL=http://localhost:3000
```

**Frontend (`apps/web/.env.local`)**:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 3. Run Development Servers
```bash
# Start both apps concurrently via Turborepo
pnpm run dev
```

- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **API Server**: [http://localhost:5000](http://localhost:5000)
- **API Health**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🔑 Authentication: Guest Login Flow

1. On first visit to the landing page or dashboard, the client calls `POST /api/auth/guest`.
2. The server generates a guest `User` record with a random avatar color and initials.
3. The server signs a JWT payload (`{ userId }`) and sets an `httpOnly`, `SameSite=Lax` (or `None` with `Secure` in production) cookie named `jwt`.
4. The server automatically seeds sample tasks into MongoDB so the user gets an immediately populated Kanban board.
5. All subsequent requests send credentials (`credentials: 'include'`), verified by `requireAuth` middleware.

---

## 🎨 UI & Figma Design Alignments

### Stitch Reference Projects
- **Stitch Project ID**: `projects/7567148595161605673`
- **Screens**:
  - `Taskly | Live Collaboration` (`b93bcb55f7d1427981064de05eeb761e`): Landing page with centered auth card *"Let's get back on track"* and interactive live Kanban preview.
  - `Taskly | Kanban Workspace` (`c35834e5cacd481b8626f97065e835b7`): 4 Kanban columns (*To Do*, *Doing*, *Completed*, *On Hold*).
  - `Taskly | Table View` (`b70a62d41dc847dc8883be35f6802fdd`): Structured table view with priority signal bar icons (`📶 High`, `📶 Medium`, `📶 Low`).
  - `Taskly | Task Details Modal` (`e2e7d523538f4239af926e97673a07c1`): Notion-style property list and subtasks checklist.

### Intentional Deviations & Enhancements
- **4 Kanban Statuses**: Extended from 3 to 4 columns (`todo`, `doing`, `completed`, `on_hold`) to faithfully match the Figma reference screenshots.
- **Multi-View System**: Provided both **Kanban Board** and **Table/List View** with instant toggle and keyboard search (`⌘F` / `Ctrl+F`).
- **Smooth Theme Transition**: Implemented a top-right radial blur view-transition expanding across the screen when toggling between dark and light modes.

---

## 🧪 Verification & Testing

```bash
# Run typecheck across all workspaces
pnpm run typecheck

# Run test suites
pnpm run test

# Build production bundles
pnpm run build
```

---

## 🚢 Deployment (Vercel & CI/CD)

The repository includes GitHub Actions workflows for continuous integration and automated deployment:

1. **`.github/workflows/ci.yml`**: Runs lint, typecheck, tests, and builds on all branches and pull requests.
2. **`.github/workflows/deploy.yml`**: Triggers on push to `main` and deploys `apps/web` (Next.js) and `apps/api` (containerized via `apps/api/Dockerfile.vercel`) to Vercel.

### Required GitHub Secrets
- `VERCEL_TOKEN`: Vercel Personal Access Token
- `VERCEL_ORG_ID`: Vercel Team / Organization ID
- `VERCEL_PROJECT_ID_WEB`: Vercel Project ID for `apps/web`
- `VERCEL_PROJECT_ID_API`: Vercel Project ID for `apps/api`
