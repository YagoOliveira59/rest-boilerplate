# Contributing

## Development Setup

```bash
pnpm install
cp .env.example .env
docker compose up -d postgres redis
pnpm prisma:migrate
pnpm dev
```

## Code Style

- 2-space indentation, single quotes, no semicolons
- Max line length: 120 characters
- Use absolute imports with `@/` prefix (e.g. `@/core/domain/example`)
- Import groups order: modules → @/api → @/core → @/infra → @/main → @/tests → relative

Run formatters before committing:
```bash
pnpm format:fix
pnpm lint:fix
```

## Commit Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add subscription entity
fix: handle null description in example mapper
refactor: extract common validation logic
test: add integration tests for create-example use case
docs: update README with deployment instructions
```

## Adding a New Entity

See the [README How to Use](./README.md#how-to-use-this-boilerplate) section for the step-by-step guide.

## Testing

```bash
pnpm test          # Unit + integration tests
pnpm test:watch    # Watch mode
pnpm test:e2e      # End-to-end tests (requires running infra)
pnpm test:cov      # Coverage report (minimum 50%)
```

Write tests at the appropriate level:
- **Unit** (`*.unit.spec.ts`): domain entities, value objects, validators
- **Integration** (`*.integration.spec.ts`): use cases with mocked repositories
- **E2E** (`*.e2e.spec.ts`): full HTTP cycle with real database

## Pull Request Checklist

- [ ] Tests pass (`pnpm test`)
- [ ] No lint errors (`pnpm lint`)
- [ ] No type errors (`pnpm ts:check`)
- [ ] No unused exports/files (`pnpm knip`)
- [ ] No spelling issues (`pnpm spell:check`)
- [ ] CHANGELOG.md updated
