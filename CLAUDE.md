# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ODD Platform is a data discovery and observability platform built with a Spring Boot backend (Java 17) and React/TypeScript frontend. The platform ingests, structures, and indexes metadata from data sources, providing REST APIs and a modern UI for data cataloging, lineage, quality monitoring, and collaboration.

## Repository Structure

The repository is a multi-module Gradle project:

- **odd-platform-api-contract**: OpenAPI spec code generation (generates Spring reactive interfaces from `odd-platform-specification/openapi.yaml`)
- **odd-platform-api**: Spring Boot backend (reactive WebFlux, R2DBC, JOOQ)
- **odd-platform-ui**: React/TypeScript frontend (Vite, Redux Toolkit, Material-UI)
- **odd-platform-specification**: OpenAPI specification files
- **tests**: Playwright end-to-end tests
- **docker**: Docker compose configurations for local development and demos

## Development Commands

### Backend (Java/Gradle)

Build the entire project:
```bash
./gradlew build
```

Build backend only (without UI):
```bash
./gradlew odd-platform-api:build -PbundleUI=false
```

Run backend tests:
```bash
./gradlew odd-platform-api:test
```

Run checkstyle:
```bash
./gradlew checkstyle
```

Generate JOOQ classes from database schema:
```bash
./gradlew jooqDockerGenerate
```

Build Docker image with Jib:
```bash
./gradlew jibDockerBuild
```

### Frontend (React/TypeScript)

All frontend commands should be run from the `odd-platform-ui/` directory using `pnpm`:

Install dependencies:
```bash
pnpm install
```

Start development server (with proxy to backend):
```bash
pnpm start
```

Build for production:
```bash
pnpm build
```

Run type checking:
```bash
pnpm tsc --noEmit
```

Run linter:
```bash
pnpm lint
```

Fix linting issues:
```bash
pnpm lint:fix
```

Run tests:
```bash
pnpm test
```

Generate API client code from OpenAPI spec:
```bash
pnpm generate
```

### End-to-End Tests

From the `tests/` directory:

Run all Playwright tests:
```bash
npm run test:ci
```

Run tests in headed mode:
```bash
npm run test
```

Debug tests:
```bash
npm run test:debug
```

### Docker Development Environment

Start full development environment with demo data:
```bash
docker-compose -f docker/demo.yaml up -d odd-platform-enricher
```

Stop environment:
```bash
docker-compose -f docker/demo.yaml down
```

## Architecture

### Backend Architecture

**Technology Stack:**
- Spring Boot 3.1.0 with WebFlux (reactive)
- R2DBC for reactive database access
- JOOQ for type-safe SQL queries
- PostgreSQL database
- Flyway for database migrations
- Redis for session management (optional)
- OpenTelemetry for observability

**Key Layers:**
- **Controllers** (`controller/`): REST API endpoints implementing OpenAPI contract interfaces
- **Services** (`service/`): Business logic layer with domain-specific services
- **Repositories** (`repository/reactive/`): Data access layer using R2DBC and JOOQ
- **DTOs** (`dto/`): Data transfer objects for API communication
- **Mappers** (`mapper/`): MapStruct-based entity-to-dto conversion
- **Auth** (`auth/`): Authentication/authorization (supports OAuth2, LDAP, login form)
- **Integration** (`integration/`): External integrations (e.g., Slack notifications)
- **Housekeeping** (`housekeeping/`): Background jobs and scheduled tasks

**Code Generation:**
- OpenAPI contract interfaces are auto-generated from `odd-platform-specification/openapi.yaml`
- JOOQ models are generated from PostgreSQL schema during build
- Controllers implement generated API interfaces from `odd-platform-api-contract`

**Database Access Pattern:**
- Uses reactive R2DBC connections
- JOOQ provides type-safe query building on top of R2DBC
- Custom repository implementations in `repository/reactive/`
- Generated JOOQ POJOs in `build/generated-jooq/`

### Frontend Architecture

**Technology Stack:**
- React 18 with TypeScript
- Redux Toolkit for state management
- Jotai for local state atoms
- TanStack Query (React Query) for server state
- Material-UI v5 for components
- Styled Components for styling
- Vite for build tooling
- Vitest for testing

**Key Directories:**
- **components/**: Feature-based component organization
  - `DataEntityDetails/`: Data entity detail pages
  - `Management/`: Admin/management UI
  - `Overview/`: Dashboard and overview
  - `Search/`: Search functionality
  - `shared/`: Reusable components
- **redux/**: Redux Toolkit state management
  - `slices/`: Redux slices by feature
  - `thunks/`: Async action creators
  - `selectors/`: Memoized selectors
- **lib/**: Utility functions and helpers
- **routes/`: React Router configuration
- **generated-sources/**: Auto-generated API client from OpenAPI spec

**State Management:**
- Redux Toolkit for global app state
- TanStack Query for server-side data fetching and caching
- Jotai atoms for lightweight local state

**API Integration:**
- API client code is generated from OpenAPI spec via `pnpm generate`
- Uses `generate.sh` script which calls OpenAPI Generator
- Generated TypeScript client provides type-safe API calls

## Important Patterns and Conventions

### Backend

**Reactive Programming:**
- All database operations return `Mono<T>` or `Flux<T>`
- Controllers and services must handle reactive types properly
- Use `flatMap`, `map`, `zipWith` for composition
- Avoid blocking calls in reactive chains

**Service Layer Pattern:**
- Services are transaction boundaries
- Each service focuses on a specific domain (DataEntity, Alert, Lineage, etc.)
- Services should be stateless and use constructor injection

**Repository Pattern:**
- Repositories use JOOQ DSL for query building
- Custom implementations extend base repository interfaces
- ResultSet mapping uses `RecordMapper` implementations

**API Versioning:**
- All API endpoints are under `/api/*`
- OpenAPI spec defines the contract

**Testing:**
- Integration tests use Testcontainers for PostgreSQL
- Tests are in `src/test/java` with `-integration-test.yml` configuration

### Frontend

**Component Structure:**
- Prefer functional components with hooks
- Use TypeScript for all components
- Components organized by feature, not by type

**State Management:**
- Use Redux Toolkit slices for global state
- Use TanStack Query for server data fetching
- Use Jotai for component-local state
- Avoid prop drilling - use selectors and hooks

**Styling:**
- Styled Components for component styles
- MUI theme configuration in `src/theme/`
- Follow Material Design principles

**Code Style:**
- ESLint with Airbnb config + TypeScript
- Prettier for formatting
- Husky pre-commit hooks run type checking and linting

## Configuration

**Backend Configuration:**
- Main config: `odd-platform-api/src/main/resources/application.yml`
- Supports multiple authentication types: DISABLED, LOGIN_FORM, OAUTH2, LDAP
- Session providers: IN_MEMORY, INTERNAL_POSTGRESQL, REDIS
- Database connection via JDBC URL (PostgreSQL required)

**Frontend Development Proxy:**
- Set `VITE_DEV_PROXY` environment variable to proxy API requests during development
- Default dev server runs on port 3000
- Proxies `/api` requests to backend (typically `http://localhost:8080`)

## Common Development Workflows

**Adding a New API Endpoint:**
1. Update `odd-platform-specification/openapi.yaml` with new endpoint
2. Run `./gradlew openApiGenerate` to regenerate contract interfaces
3. Implement the generated interface in a controller
4. Add service layer logic
5. Add repository methods if needed
6. Frontend: Run `pnpm generate` in `odd-platform-ui/` to update client

**Database Schema Changes:**
1. Create new Flyway migration in `odd-platform-api/src/main/resources/db/migration/`
2. Run `./gradlew jooqDockerGenerate` to regenerate JOOQ models
3. Update repository queries and service logic as needed

**Adding a New React Component:**
1. Create component in appropriate feature directory
2. Use TypeScript and define proper prop interfaces
3. Use generated API client types for type safety
4. Add to route configuration if it's a page component
5. Create Redux slice if global state is needed

## Branch Naming

Follow these conventions:
- `feature/feature_name` - New features
- `bugfix/fix_thing` - Bug fixes
- `issues/123` - Issue-specific work

## Testing Guidelines

**Backend:**
- Write unit tests for service layer logic
- Use integration tests with Testcontainers for repository/database tests
- Tests run in parallel (controlled by available processors)

**Frontend:**
- Use Vitest for unit/component tests
- Playwright tests in `tests/` for E2E scenarios
- Tests run in CI on pull requests

## CI/CD

**Pull Requests:**
- Triggers backend tests via `./gradlew odd-platform-api:build -PbundleUI=false`
- Runs Playwright E2E tests
- Publishes test results as PR comments
- Checkstyle validation required

**Main Branch:**
- Builds Docker image and pushes to ECR
- Tags image with `ci-{short-sha}`
- Auto-deploys to development environment

## Notes

- Node version: v18.18.2 (enforced in `odd-platform-ui/package.json`)
- Java version: 17
- pnpm is required for frontend (not npm or yarn)
- Gradle wrapper should be used (`./gradlew`) instead of system Gradle
- The platform requires PostgreSQL - it won't work with other databases
- JOOQ code generation happens automatically before compilation