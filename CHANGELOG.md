# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2026-03-19

### Added
- Initial boilerplate release based on billing-api
- Clean Architecture project structure (api / core / infra / main)
- Express 5 + TypeScript 5.9 setup
- Prisma 6 + PostgreSQL with Cloud SQL support
- Redis cache provider
- Google Cloud Pub/Sub messaging provider (with emulator support)
- tsyringe dependency injection
- Zod validation (API layer) + domain validators (core layer)
- OpenTelemetry distributed tracing and metrics (GCP + console exporters)
- Pino structured logging (GCP Cloud Logging format)
- Swagger/OpenAPI documentation at `/docs`
- Multi-stage Docker build (deps → dev → builder → runtime)
- Docker Compose with PostgreSQL + Redis + Pub/Sub emulator
- Jest + ts-jest testing setup (unit, integration, e2e)
- ESLint 9 flat config + Prettier + cspell + knip
- Generic `Example` entity as domain template
- Unit of Work pattern with audit trail support
- Graceful shutdown (SIGINT/SIGTERM)
