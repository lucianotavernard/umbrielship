# Umbrielship - Agent Instructions

ERP-like app for a naval service company: Customers own Vessels, and a Vessel receives WorkOrders made of services with photos. The vocabulary in `CONTEXT.md` is binding. The state of the product and what is proposed next is in `ROADMAP.md`.

## Running and testing

There is no root `package.json`: `api/` and `web/` are independent npm projects. Run each command inside its folder.

**API** (`api/`):

- `npm run start:dev` starts Nest in watch mode on `PORT` (3333 in `.env.example`). `npm run build` runs `nest build`, which also rewrites the `@/` alias; `npm run start:prod` runs `node dist/main`.
- `npm run lint` runs oxlint (type-aware) on `src/` and `test/`; `npm run format` runs Prettier.
- `npm run test` runs every `src/**/*.spec.ts` and `test/**/*.spec.ts` with Vitest (`vitest.config.mts`), with no database. There is one spec per use case, beside it as `<use-case>.spec.ts`, on in-memory repositories and fakes kept in `api/test/` (`repositories/`, `cryptography/`, `factory.ts`); `test:watch` and `test:cov` also exist. `test/use-case-specs.spec.ts` fails when a use case has no spec.
- `npx prisma migrate dev` applies and creates migrations in `src/shared/module/prisma/migrations/`; `npx prisma generate` rewrites the client in `src/shared/module/prisma/generated/prisma/`. There is no seed: create the first User by hand in the database (`users.password` is a bcrypt hash).
- Environment comes from `api/.env` (`.env.example` lists only `NODE_ENV`, `PORT` and `DATABASE_URL`; the others below are also required). `src/shared/module/config/util/config.factory.ts` validates at startup: `NODE_ENV` (`test`, `development`, `production`), `PORT`, `JWT_SECRET`, `JWT_EXPIRATION_IN`, and `DATABASE_URL` (a `postgresql://` URL). `prisma.config.ts` reads `DATABASE_URL`.
- Uploaded service images are written under `api/uploads/work-order-service-images/` and served at `/uploads`.

**Web** (`web/`):

- `npm start` runs `ng serve` with `proxy.conf.json`: `/api` goes to `http://localhost:3333` without the prefix, and `/uploads` goes there unchanged. Start the API first.
- `npm run build` builds; `npm run watch` builds in development mode on change; `npm test` runs `ng test`. There is no web lint script and no web spec yet.

## Stack

- API: NestJS 11, CommonJS, in `api/src`, alias `@/` = `api/src`. Validation with Zod (`ZodValidationPipe`), auth with Passport JWT and a global `JwtAuthGuard` (`@Public()` opts a route out), passwords with bcryptjs.
- Persistence: Prisma 7 with `@prisma/adapter-pg` on PostgreSQL; one schema, `api/src/shared/module/prisma/schema.prisma`.
- Web: Angular 21 with Tailwind, in `web/src/app`, alias `@/` = `web/src/app`. Standalone components, signals, `httpResource`, lazy `loadComponent` routes in `app.routes.ts`, shared primitives in `shared/ui`.
- Screen copy in `web` is Portuguese. Identifiers, API fields and documents are English.

## Architecture principles

**API** (`api/src`): `app.module.ts` composes `ConfigModule`, `AuthModule`, `IdentityModule`, `CustomerModule` and `WorkOrderModule`. `main.ts` bootstraps (CORS, static `/uploads`, port from `ConfigService`) and holds no business rule.

| Context | Owns | Controllers |
| --- | --- | --- |
| `identity` | User, sign-in, the authenticated user | `authenticate-user`, `get-authenticated-user` |
| `customer` | Customer, CustomerAddress, Vessel | one per endpoint, `/customers` and `/vessels` |
| `work-order` | WorkOrder, WorkOrderService, WorkOrderServiceImage | one per endpoint, including image upload |
| `shared` | Cross-cutting only: `lib/` (domain exceptions, `Paginate`, `ZodValidationPipe`) and `module/` (`auth`, `config`, `cryptography`, `prisma`) | none |

Each context is layered the same way:

- `core/entity`, `core/interface`, `core/use-case` (and `core/exception` in `identity`): framework-free business code. Repositories are abstract classes in `core/interface`; one `<verb>-<noun>.use-case.ts` per operation, with a `handle()` method.
- `http/rest/controller`: one controller class per endpoint. It validates with Zod, calls one use case, shapes the response, and maps domain exceptions to HTTP exceptions.
- `persistence/repository` holds `Prisma<Plural>Repository` classes; `persistence/persistence.module.ts` binds each abstract class to its Prisma class (`{ provide: CustomerRepository, useClass: PrismaCustomersRepository }`) and exports them.
- `<context>.module.ts` lists controllers and use cases and imports the persistence module.
- `work-order` reads Customers through `CustomerPersistenceModule`; that explicit export is the only cross-context repository use today. `identity` and `customer` import no context.

**Web** (`web/src/app/<domain>/{feature,ui,data-access,util}`): `feature` holds routed, stateful components (they own the `httpResource` and signals); `ui` holds presentational components named `*Ui`; `data-access` holds DTO types (and services); `util` holds guards, interceptors and providers. `shared/` holds `ui` primitives, `feature` layouts and exception pages, `util` and `config`. `analytics` holds the dashboard.

## Progressive documentation loading

Load only what the task needs.

| Task | Read |
| --- | --- |
| New module, use case, controller, repository, or cross-module dependency in `api` | `.cursor/skills/modular-architecture/SKILL.md` |
| Domain terms, entity fields | `CONTEXT.md` |
| What exists, what to build next | `ROADMAP.md` |
| Build the next roadmap item | `.cursor/skills/roadmap-execution/SKILL.md` |
| Research a problem before deciding | `.cursor/skills/tlc-discover/SKILL.md` |
| Plan a feature | `.cursor/skills/tlc-plan/SKILL.md` |
| Implement a planned feature | `.cursor/skills/tlc-implement/SKILL.md` |

## General rules

- Always use Context7 for library and API documentation (`.cursor/rules/general-rules.mdc`).
- Follow the layering above before a generic NestJS or Angular habit. A new endpoint is a use case plus its own controller, registered in the module.
- A use case depends on repository abstract classes, never on Prisma. A controller injects use cases only. Throw `NotFoundDomainException` or `AlreadyExistsDomainException` from use cases; the controller maps them to 404 and 409.
- Domain terms stay as `CONTEXT.md` writes them; never translate identifiers.
- Schema changes go through `npx prisma migrate dev --name <change>`; never edit an applied migration. Commit the regenerated client with the schema.
- Before handing off an API change run `npm run lint` and `npm run build` in `api/` and `npm run test`; for a web change run `npm run build` in `web/`.
- A new use case comes with a Vitest spec using an in-memory fake of its repository abstract classes, beside the use case as `<use-case>.spec.ts`.
