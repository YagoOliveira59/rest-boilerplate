# REST Boilerplate

A production-ready REST API boilerplate built with **Clean Architecture**, **TypeScript**, **Express 5**, **Prisma**, and **OpenTelemetry**.

---

## Stack

| Layer | Technology |
|---|---|
| **Runtime** | Node.js ~22.17, pnpm ~10.14 |
| **Framework** | Express 5 |
| **Language** | TypeScript 5.9 (strict mode) |
| **ORM / DB** | Prisma 6 + PostgreSQL 17 |
| **Cache** | Redis 7 |
| **Messaging** | Google Cloud Pub/Sub (emulator supported) |
| **Logging** | Pino + GCP Cloud Logging format |
| **Observability** | OpenTelemetry (traces + metrics, GCP or console) |
| **DI** | tsyringe (decorators) |
| **Validation** | Zod (API layer) + domain validators (core layer) |
| **Documentation** | Swagger/OpenAPI 3.0 (available at `/docs`) |
| **Build** | tsup |
| **Testing** | Jest + ts-jest + jest-mock-extended + Supertest |
| **Code Quality** | ESLint 9 (flat config) + Prettier + cspell + knip |

---

## Architecture

```
src/
├── api/              # Presentation layer
│   ├── controllers/  # Parse HTTP request → call use case → return response
│   ├── middlewares/  # auth, error, trace, audit
│   ├── routers/      # Route definitions (inject auth middleware per route)
│   └── schemas/      # Zod validation schemas + Swagger JSDoc annotations
│
├── core/             # Business logic (framework-agnostic)
│   ├── domain/       # Entities, value objects, repository interfaces
│   ├── errors/       # Domain errors (mapped to HTTP by error middleware)
│   ├── providers/    # Provider interfaces (cache, messaging)
│   ├── services/     # Authorization, shared domain services
│   ├── use-cases/    # One class per operation (create, list, get-by-id, ...)
│   └── validators/   # Reusable text/array validators
│
├── infra/            # Infrastructure implementations
│   ├── database/     # Prisma client, transaction wrapper, repositories
│   ├── providers/    # Redis, Pub/Sub implementations
│   └── web/          # Express app setup, server lifecycle
│
├── main/             # App bootstrap
│   ├── config/       # Env validation, logger, swagger, telemetry
│   ├── dependencies/ # DI container (module.ts)
│   └── index.ts      # Entry point (import order is critical!)
│
└── tests/
    ├── api/          # E2E tests (full HTTP cycle)
    ├── shared/       # Builders, helpers, mocks
    └── unit/         # Entity unit tests
```

### Key Patterns

- **Dependency Injection** — tsyringe `@singleton()` + `@inject()` decorators
- **Repository Pattern** — interfaces in `core/domain`, implementations in `infra/database`
- **Use Case Pattern** — one class per business operation, injected into controllers
- **Unit of Work** — `IUnitOfWork<T>` wraps transactions with audit context injection
- **Value Objects** — UUIDv7, ExternalId with built-in validation
- **Domain Errors** — thrown in core, mapped to HTTP errors in error middleware

---

## Prerequisites

- **Node.js** ~22.17 (`nvm use` if you have nvm installed)
- **pnpm** ~10.14 (`npm install -g pnpm`)
- **Docker + Docker Compose** (for local infrastructure)

---

## Quick Start

### 1. Clone and install

```bash
git clone <repo-url> my-project
cd my-project
pnpm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env with your values
```

### 3. Start infrastructure

```bash
# Start PostgreSQL + Redis (recommended for local dev)
docker compose up -d postgres redis

# Or start everything including the app
docker compose up
```

### 4. Run database migrations

```bash
pnpm prisma:migrate
```

### 5. Start the development server

```bash
pnpm dev
```

The API will be available at `http://localhost:3000`.
Swagger docs: `http://localhost:3000/docs`

---

## Available Scripts

| Script | Description |
|---|---|
| `pnpm dev` | Start with hot-reload (tsup watch) |
| `pnpm build` | Build for production (tsup) |
| `pnpm start` | Start production server |
| `pnpm test` | Run unit + integration tests |
| `pnpm test:watch` | Tests in watch mode |
| `pnpm test:cov` | Tests with coverage report |
| `pnpm test:e2e` | End-to-end tests (sequential) |
| `pnpm ts:check` | TypeScript type check (no emit) |
| `pnpm lint` | ESLint (zero warnings tolerance) |
| `pnpm lint:fix` | Auto-fix ESLint issues |
| `pnpm format:fix` | Auto-format with Prettier |
| `pnpm knip` | Find unused files/deps/exports |
| `pnpm spell:check` | Spell check TS and MD files |
| `pnpm prisma:migrate` | Create + apply migrations (dev) |
| `pnpm prisma:migrate:deploy` | Apply migrations (production) |
| `pnpm prisma:studio` | Open Prisma Studio GUI |

---

## How to Use This Boilerplate

### Step 1 — Rename the project

1. Update `package.json`: `name`, `description`
2. Update `docker-compose.yml`: service names, network name
3. Update `src/main/config/logger.config.ts`: GCP service name
4. Update `src/main/instrumentation.ts`: `serviceName`
5. Update `src/main/config/swagger.config.ts`: API title/description
6. Update `.env.example` and `.env`: ports, DB name, etc.

### Step 2 — Add your domain entities

Use the `Example` entity as a reference. For each new entity:

1. **Domain** — create `src/core/domain/your-entity/`
   - `entity/your-entity.interfaces.ts`
   - `entity/your-entity.ts`
   - `entity/your-entity.errors.ts`
   - `repository/your-entity.repository.interfaces.ts`

2. **Use Cases** — create `src/core/use-cases/your-entity/`
   - `create/`, `get-by-id/`, `list/`, `update/`, `delete/` as needed
   - `shared/your-entity.common-dto.ts` + `your-entity.common-dto.mapper.ts`

3. **Infra** — create `src/infra/database/`
   - `prisma/models/your-entity.prisma`
   - `repositories/your-entity/your-entity.repository.ts`
   - `repositories/your-entity/your-entity.repository.mapper.ts`

4. **API** — create `src/api/`
   - `controllers/your-entity.controller.ts`
   - `routers/your-entity.router.ts`
   - `schemas/your-entity.schemas.ts`

5. **Register** in `src/main/dependencies/module.ts`

6. **Mount** the router in `src/infra/web/express.ts`

7. **Run migration**: `pnpm prisma:migrate`

### Step 3 — Run tests

```bash
pnpm test
pnpm test:e2e
```

---

## Environment Variables

See [`.env.example`](./.env.example) for the full list with documentation.

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/v1/examples` | List examples |
| GET | `/api/v1/examples/:id` | Get example by ID |
| POST | `/api/v1/examples` | Create example (auth required) |

---

## Authentication

The boilerplate reads user identity from headers injected by an upstream gateway:

- `x-jwt-user` — user ID
- `x-jwt-role` — user role (`ADMIN` or `USER`)

Adapt `src/core/services/authorization/auth.service.ts` for your auth strategy.

---

## OpenTelemetry

| Variable | Default | Description |
|---|---|---|
| `OTEL_ENABLED` | `true` | Enable/disable (auto-disabled in tests) |
| `OTEL_EXPORTER` | `console` | `console` or `gcp` |
| `OTEL_SAMPLING_RATE` | `0.5` | 0.0–1.0 |
| `OTEL_FORCE_TRACE_HEADER` | `x-force-trace` | Header to force-sample a request |

Send `x-force-trace: true` to always capture a trace for debugging.
