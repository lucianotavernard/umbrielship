# Umbrielship - Agent Instructions

ERP-like app for a naval service company: Customers own Vessels, and a Vessel receives WorkOrders made of services with photos. The vocabulary in `CONTEXT.md` is binding. The state of the product and what is proposed next is in `ROADMAP.md`.

## Running and testing

There is no root `package.json`: `api/` and `web/` are independent npm projects. Run each command inside its folder.

**API** (`api/`):

- `npm run start:dev` starts Nest in watch mode on `PORT` (3333 in `.env.example`). `npm run build` runs `nest build`, which also rewrites the `@/` alias; `npm run start:prod` runs `node dist/main` and needs the build.
- `npm run lint` runs oxlint (type-aware) on `src/` and `test/`; `npm run format` runs Prettier.
- `npm run test` runs every `src/**/*.spec.ts` and `test/**/*.spec.ts` once with Vitest (`vitest.config.mts`), with no database, no Redis and no SMTP; `test:watch` and `test:cov` also exist. There is one spec per use case, in its aggregate's `__test__/` folder (`src/package/<context>/<aggregate>/__test__/<use-case>.spec.ts`), on in-memory repositories and fakes kept in `api/test/` (`repositories/`, `cryptography/`, `mail/`, `invitation/`, `factory.ts`), imported through the `@test/` alias. `test/use-case-specs.spec.ts` fails when a use case has no spec; `test/layout.spec.ts` holds the layout rules. There is no integration tier.
- `api/test/smoke/api-smoke.sh`, `api/test/smoke/boot-smoke.sh` and `api/test/db/migration-check.sh` walk the built API and the migrations against real PostgreSQL, Redis and Mailpit in Docker; they need `docker`, `curl` and `jq`, and they are not part of `npm run test`.
- `npx prisma migrate dev` applies and creates migrations in `src/package/shared/module/prisma/migrations/`; `npx prisma generate` rewrites the client in `src/package/shared/module/prisma/generated/prisma/` (ES modules); `npx prisma db seed` creates the internal Organization "Umbrielship" and its first Administrator from `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` (only the seed reads them) and is safe to run twice. Other Users are created by an internal Administrator through `POST /users`.
- The API needs PostgreSQL at `DATABASE_URL`, Redis at `REDIS_URL` (the Invitation delivery queue, BullMQ) and an SMTP server at `MAIL_HOST` (in development Mailpit, SMTP on port 1025). Apply the migrations before starting it. Environment comes from `api/.env` (`.env.example` lists every variable), validated at startup by `src/package/shared/module/config/shared.config.ts`: `NODE_ENV` (`test`, `development`, `production`), `PORT`, `JWT_SECRET`, `JWT_EXPIRATION_IN`, `DATABASE_URL` (a `postgresql://` URL), `REDIS_URL` (`redis://` or `rediss://`), `WEB_ORIGIN` (the web origin the Invitation acceptance link points at), `MAIL_HOST`, `MAIL_PORT`, `MAIL_FROM`, and the optional `MAIL_USER` and `MAIL_PASS`. `prisma.config.ts` reads `DATABASE_URL`.
- Uploaded service images are written under `api/uploads/work-order-service-images/` and served at `/uploads`.

**Web** (`web/`):

- `npm start` runs `ng serve` with `proxy.conf.json`: `/api` goes to `http://localhost:3333` without the prefix, and `/uploads` goes there unchanged. Start the API first.
- `npm run build` builds; `npm run watch` builds in development mode on change; `npm test` runs `ng test`. There is no web lint script.

## Stack

- API: NestJS 12 as ESM (`"type": "module"`, `nodenext`), TypeScript with `strict` on, in `api/src`, alias `@/` = `api/src`. Every relative or `@/` import ends in `.js` (`import { X } from './x.use-case.js'`), as ESM requires; the Prisma client is generated as ES modules (`moduleFormat = "esm"`). Validation with Zod (`ZodValidationPipe`), auth with Passport JWT and a global `JwtAuthGuard` (`@Public()` opts a route out), passwords with bcryptjs, Invitation email through Nodemailer and BullMQ.
- Persistence: Prisma 7 with `@prisma/adapter-pg` on PostgreSQL; one schema, `api/src/package/shared/module/prisma/schema.prisma`.
- Tests and lint: Vitest and oxlint, the only test runner and linter.
- Web: Angular 22 with Tailwind, in `web/src/package/<context>/<module>/`. A module has a page, `components/` and a `*.service.ts` decorated with `@Service()`. Forms use Signal Forms. Shared elements use the prefix `t-` (`t-sheet`) and attributes use the prefix `t` (`button[tButton]`, `table[tTable]`). The session is `GET /me`. Standalone components, signals, `httpResource`, lazy `loadComponent` routes in `app.routes.ts`.
- Screen copy in `web` is Portuguese. Identifiers, API fields and documents are English.

## Architecture principles

**API** (`api/src`): `app.module.ts` composes `ConfigModule`, `AuthModule`, `IdentityModule`, `CustomerModule` and `WorkOrderModule`. `main.ts` bootstraps (CORS, static `/uploads`, port from `ConfigService`) and holds no business rule.

| Context | Aggregates | Owns | Facade |
| --- | --- | --- | --- |
| `identity` | `auth`, `user`, `organization`, `invitation` | User, Membership, Role, Organization, Invitation, sign-in, the session and the active Organization | none |
| `customer` | `customer`, `vessel` | Customer, CustomerAddress, Vessel | `CustomerFacade.findVesselById` |
| `work-order` | `work-order`, `work-order-service`, `work-order-service-image` | WorkOrder, WorkOrderService, WorkOrderServiceImage | none |
| `shared` | none | Cross-cutting only: `lib/` (domain exceptions, `Paginate`, `ZodValidationPipe`, the page query) and `module/` (`auth`, `config`, `cryptography`, `mail`, `prisma`) | none |

Flat by aggregate: one business concept is one folder, `api/src/package/<context>/<aggregate>/`.

- In an aggregate: `<aggregate>.entity.ts` (no `Entity` suffix on the class), `contracts/<aggregate>-repository.contract.ts` (the repository abstract class, named `I<Plural>Repository`), `<aggregate>.repository.ts` (`Prisma<Plural>Repository`), one `<verb>-<noun>.use-case.ts` per operation with a `handle()` method, one `<aggregate>.controller.ts` per aggregate, and `__test__/`.
- A controller validates with Zod, calls one use case per handler, shapes the response, and maps domain exceptions to HTTP exceptions; its `catch` ends with `throw error`, so an unmapped failure answers 500.
- `<context>.module.ts` lists controllers and use cases, binds each contract to its Prisma class (`{ provide: ICustomersRepository, useClass: PrismaCustomersRepository }`) and exports only the facade. A context has no `index.ts`.
- `work-order` reads a Vessel only through `CustomerFacade.findVesselById(organizationId, id)`, which returns plain data. It imports no `customer` repository, entity or use case. `identity` and `customer` import no context.
- Tenancy: every tenant table (`customers`, `customer_addresses`, `vessels`, `work_orders`, `work_order_services`, `work_order_service_images`) carries `organizationId`, indexed and filtered on every query, and a record of another Organization answers 404. The Organization comes from the session (`user.organizationId`, resolved on every request from the User's active Organization), never from a body, query or path, except on `POST /organizations/switch` (an Organization the User holds a Membership in) and the internal administration routes (`InternalAdministratorGuard`). The token carries only the User. A Role (`administrator`, `operator`) belongs to a Membership.
- State isolation: no foreign key across contexts (`work_orders.vesselId` is a plain id column); names and emails that must be unique are `citext` and unique per Organization (the IMO number and the Customer email included).
- `GET /me` returns the authenticated User with the active Organization and its Memberships.

**Web** (`web/src/package/<context>/<module>/`): a page owns the `httpResource` and the signals, `components/` holds presentational components, and `*.service.ts` uses `@Service()` for writes. Forms are Signal Forms. Shared UI lives in `package/shared/components/ui` with the element prefix `t-` and the attribute prefix `t`. The layout reads `GET /me` and holds the Organization switcher. `analytics/dashboard` is the dashboard.

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
- Follow the layout above before a generic NestJS or Angular habit. A new endpoint is a use case, a handler on its aggregate's controller, and the registration in the module.
- A use case depends on repository contracts, never on Prisma. A controller injects use cases only. Throw `NotFoundDomainException`, `AlreadyExistsDomainException` or `ConflictDomainException` from use cases; the controller maps them to 404, 409 and 409.
- Domain terms stay as `CONTEXT.md` writes them; never translate identifiers.
- Schema changes go through `npx prisma migrate dev --name <change>`; never edit an applied migration. Commit the regenerated client with the schema.
- Before handing off an API change run `npm run lint`, `npm run test` and `npm run build` in `api/`; for a web change run `npm run build` in `web/`.
- A new use case comes with a Vitest spec in its aggregate's `__test__/` folder, as `<use-case>.spec.ts`, using in-memory fakes of its repository contracts and covering the other-Organization boundary.
