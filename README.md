# ERP Beta — Monorepo

This repository contains the codebase for the ERP Beta project. It's organized as a Turborepo monorepo with backend and frontend applications, shared packages, and Docker tooling to run the system locally or in containers.

## What's inside?

This Turborepo includes the following:

### Apps and Packages

- `web`: a [Next.js](https://nextjs.org/) app
- `api`: an [Express](https://expressjs.com/) server
- `@repo/logger`: Isomorphic logger (a small wrapper around console.log)
- `@repo/eslint-config`: ESLint presets
- `@repo/typescript-config`: tsconfig.json's used throughout the monorepo
- `@repo/jest-presets`: Jest configurations

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/).

### Docker

This repo is configured to be built with Docker, and Docker compose. To build all apps in this repo:

````
# Install dependencies
yarn install

# Create a network, which allows containers to communicate
# with each other, by using their container name as a hostname
docker network create app_network

# Build prod using new BuildKit engine
COMPOSE_DOCKER_CLI_BUILD=1 DOCKER_BUILDKIT=1 docker-compose -f docker-compose.yml build

# ERP Beta — Monorepo

This repository contains the codebase for the ERP Beta project. It's organized as a Turborepo monorepo with backend and frontend applications, shared packages, and Docker tooling to run the system locally or in containers.

This README gives a short overview, how to run the apps (Docker and local), testing, and where to find important projects inside the workspace.

## Quick overview

- Apps:
	- `apps/web` — Next.js frontend
	- `apps/api` — Express API server
- Packages:
	- `packages/*` — shared utilities, Prisma schema, and tooling
- Tooling:
	- Turborepo for task orchestration
	- Docker + docker-compose for containerized dev/prod
	- TypeScript, ESLint, Jest, Prettier

## Repo structure (top-level)

- `apps/` — production apps (web, api)
- `packages/` — shared libraries and Prisma migration/seed
- `docker-compose.yml` — compose setup for running services together
- `turbo.json` — turborepo pipeline configuration

## Local development (recommended)

Prereqs: Node.js (18+ recommended), pnpm or npm/yarn, Docker (optional for containers).

1. Install dependencies from the repo root:

```powershell
pnpm install
````

2. Start API and web apps in development mode (run in separate terminals or use turborepo):

```powershell
# API (from repo root)
pnpm --filter api dev

# Web (from repo root)
pnpm --filter web dev
```

By default:

- Frontend: http://localhost:3000
- API: http://localhost:3001 (check `apps/api/src/server.ts` for exact port)

## Docker quickstart (containers)

Use Docker when you want an environment similar to production or to run the full stack together.

1. Build images and start services (from repo root):

```powershell
# create a network (one-time)
Docker network create app_network;

# build and bring up services
$env:COMPOSE_DOCKER_CLI_BUILD=1; $env:DOCKER_BUILDKIT=1; docker-compose -f docker-compose.yml up --build -d
```

2. View logs or stop containers:

```powershell
# View logs
docker-compose -f docker-compose.yml logs -f

# Stop and remove containers
docker-compose -f docker-compose.yml down
```

## Database and Prisma

Database schema and migrations live under `packages/db/prisma`. To apply migrations locally (when running the API against a local DB), use Prisma CLI from that package. Example (run from repo root):

```powershell
pnpm --filter @repo/db prisma migrate dev --schema=packages/db/prisma/schema.prisma
```

Seeds are in `packages/db/prisma/seed.ts`.

## Tests and linting

Run all tests with:

```powershell
pnpm test
```

Run linting and type checks:

```powershell
pnpm lint
pnpm typecheck
```

## Environment variables

Each app reads environment variables from its own `.env` file (not committed). Example files or required variables are documented at the top of each app's `README` and in `apps/*/Dockerfile` where relevant.

Common envs (examples):

- DATABASE_URL — Prisma connection string
- NODE_ENV — development|production
- PORT — service port

## Contributing

1. Create a branch off `dev`.
2. Follow existing code style (TypeScript, ESLint, Prettier).
3. Add tests for new behavior.
4. Open a PR targeting `dev` with a clear description.

## Notes and pointers

- Frontend source: `apps/web/src`
- API source: `apps/api/src`
- Prisma schema and migrations: `packages/db/prisma`
- Shared utilities and configs: `packages/*`

If you want, I can also:

- Add a short `CONTRIBUTING.md` and per-app READMEs
- Add npm scripts to simplify common tasks (start:api, start:web, etc.)
