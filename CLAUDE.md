# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Project Overview

REST API boilerplate with Clean Architecture, Express 5, Prisma, and OpenTelemetry.
The `Example` entity is the generic template — replace it with your actual domain entities.

## Development Commands

```bash
pnpm dev                    # Start with hot-reload
pnpm build                  # Production build (tsup)
pnpm start                  # Start production server
pnpm ts:check               # Type check
pnpm test                   # Run unit + integration tests
pnpm test:e2e               # E2E tests (sequential)
pnpm lint                   # ESLint (zero warnings tolerance)
pnpm format:fix             # Prettier auto-format
pnpm knip                   # Detect unused exports/files
pnpm spell:check            # Spell check
pnpm prisma:migrate         # Create + apply database migrations
pnpm prisma:generate        # Regenerate Prisma client after schema changes
pnpm prisma:studio          # Open Prisma Studio
```

## Architecture

```
src/
├── api/        Presentation (controllers, routers, schemas, middlewares)
├── core/       Business logic (entities, use-cases, domain errors, interfaces)
├── infra/      Infrastructure (Prisma, repositories, providers, Express)
├── main/       Bootstrap (config, DI container, entry point)
└── tests/      Tests organized by type (unit, e2e, shared builders/helpers)
```

## Key Patterns

**DI:** tsyringe `@singleton()` + `@inject()`. All singletons are registered in `src/main/dependencies/module.ts`.

**Repository Pattern:** Interfaces defined in `core/domain/*/repository/`. Implementations in `infra/database/repositories/`.

**Use Case Pattern:** One class per operation. Controllers call use cases; use cases call repositories.

**Unit of Work:** `IUnitOfWork<T>` wraps all write operations in a transaction with audit context.

**Error Handling:**
- Core layer throws `CoreValidationError`, `CoreNotFoundError`, etc.
- API error middleware maps them to HTTP responses automatically.

## Adding a New Entity

1. Define entity in `src/core/domain/your-entity/entity/`
2. Define repository interface in `src/core/domain/your-entity/repository/`
3. Create use cases in `src/core/use-cases/your-entity/`
4. Add Prisma model in `src/infra/database/prisma/models/your-entity.prisma`
5. Implement repository in `src/infra/database/repositories/your-entity/`
6. Add controller + router in `src/api/`
7. Register everything in `src/main/dependencies/module.ts`
8. Mount router in `src/infra/web/express.ts`
9. Run `pnpm prisma:migrate`

## Code Style

- 2-space indentation, single quotes, no semicolons, max 120 chars
- Absolute imports with `@/` prefix
- Import order: modules → @/api → @/core → @/infra → @/main → @/tests → relative
