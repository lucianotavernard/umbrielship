---
name: modular-architecture
description: >
  Umbrielship API architecture guide. ALWAYS read this skill BEFORE adding or changing a NestJS
  module, use case, controller, repository, contract, facade, Prisma model, or a dependency
  between contexts in `api/`. The layout is flat by aggregate (`package/<context>/<aggregate>/`),
  tenant-scoped by `organizationId`, ESM, and differs from generic NestJS habits; reasoning
  without this skill tends to produce a `*.service.ts`, a controller per endpoint, a layered
  `core/http/persistence` tree, a query with no `organizationId`, a relative import without `.js`,
  or one context importing another's repository. Triggers: "new module", "scaffold", "new
  endpoint", "new use case", "repository", "contract", "facade", "providers", "exports",
  "cross-context", "tenancy", "organizationId", "architecture review", "module boundaries",
  "customer", "work-order", "identity", "shared".
---

# Modular Architecture (Umbrielship API)

`api/` is one NestJS 12 app (ESM, TypeScript `strict`), one PostgreSQL database, one Prisma schema,
three contexts (`identity`, `customer`, `work-order`) plus `shared/`. It follows the acme layout.
This skill describes the layout as it is today and how to extend it. It does not impose more than
the code does.

**Precedence.** `AGENTS.md` is binding and wins over this skill; `CONTEXT.md` is the vocabulary.
Where they disagree, fix this skill in the same change.

## The layout

```
api/src/package/<context>/
  <context>.module.ts                 # controllers + use cases + contract bindings; exports only the facade
  <context>.facade.ts                 # the only entry point for other contexts (customer has one)
  <aggregate>/
    <aggregate>.entity.ts             # plain class, no `Entity` suffix on the class, no Nest or Prisma import
    contracts/<aggregate>-repository.contract.ts   # abstract class I<Plural>Repository, the port
    <aggregate>.repository.ts         # Prisma<Plural>Repository, the adapter
    <verb>-<noun>.use-case.ts         # @Injectable, one handle() per operation
    <aggregate>.controller.ts         # one controller per aggregate
    __test__/<use-case>.spec.ts       # Vitest, one spec per use case
api/src/package/shared/
  lib/{exception,http,type}           # plain code: domain exceptions, ZodValidationPipe, page query, Paginate
  module/{auth,config,cryptography,mail,prisma}   # Nest modules used by several contexts
api/src/app.module.ts                 # composes the context modules
api/test/{repositories,cryptography,mail,invitation}/   # in-memory repositories and fakes
```

Contexts and aggregates: `identity` (`auth`, `user`, `organization`, `invitation`), `customer`
(`customer`, `vessel`), `work-order` (`work-order`, `work-order-service`,
`work-order-service-image`). Reference context: `customer`. Path alias `@/` = `api/src`; inside a
context, `./` relative imports are used for the context's own files.

## ESM

The package is `"type": "module"` with `nodenext` resolution, so every relative or `@/` import ends
in `.js`, whatever the file on disk (`import { X } from './x.use-case.js'`). `nest build` rewrites
the `@/` alias in `dist/`; Vitest and `tsx` (the seed) resolve it from `tsconfig.json`. `require`,
`module.exports`, `__dirname` and `__filename` do not exist: use `import.meta.dirname`. The Prisma
client is generated as ES modules (`moduleFormat = "esm"`). TypeScript `strict` is on
(`strictPropertyInitialization` off, as in acme). `npm run test` runs Vitest and `npm run lint`
runs oxlint (type-aware).

## Rules

1. **The domain knows no framework detail.** Entities and repository contracts import neither
   Prisma nor HTTP types. Use cases import entities, contracts, shared exceptions and
   `@Injectable` only.
2. **Repositories are abstract classes** in `<aggregate>/contracts/`, named `I<Plural>Repository`;
   the Prisma implementation sits beside them as `<aggregate>.repository.ts` and is bound in
   `<context>.module.ts` with `{ provide: IXsRepository, useClass: PrismaXsRepository }`. Use cases
   inject the contract.
3. **One controller per aggregate.** It validates with a Zod schema (`ZodValidationPipe`), calls one
   use case per handler, shapes the response, and maps `NotFoundDomainException` to
   `NotFoundException`, `AlreadyExistsDomainException` and `ConflictDomainException` to
   `ConflictException`. Its `catch` ends with `throw error`, so an unmapped failure answers 500. It
   injects use cases only. Routes are protected by the global `JwtAuthGuard`; `@Public()` opts out;
   `InternalAdministratorGuard` protects the administration routes.
4. **Tenancy.** Every tenant table carries `organizationId`, indexed, and every repository method
   takes it first and filters on it; a record of another Organization is not found (404). The
   controller reads it from the session (`@CurrentUser() user`, `user.organizationId`), never from
   the request, except `POST /organizations/switch` and the internal administration routes. Names
   and emails that must be unique are `citext` and unique per Organization. A use case that
   receives an id checks it through an `organizationId`-scoped repository method.
5. **Contexts talk through a facade.** A context that needs another's data imports that context's
   module and calls its facade, which returns plain data (`work-order` imports `CustomerModule` and
   calls `CustomerFacade.findVesselById(organizationId, id)`). A facade file exports its method
   types; the context module exports only the facade. Never import another context's use case,
   controller, entity, contract or Prisma repository. Where a context must not import another (a
   cycle), declare a port in the aggregate's `contracts/` and bind it in `app.module.ts`.
6. **Prisma stays in `<aggregate>.repository.ts`.** Only `Prisma<Plural>Repository` classes use
   `PrismaService` and the generated types (`@/package/shared/module/prisma/generated/prisma/client.js`);
   they map rows to entities. A repository queries only the models of its own context.
7. **`shared/` has no business rule.** `shared/lib` is plain code; `shared/module` holds Nest
   modules (`auth`, `config`, `cryptography`, `mail`, `prisma`). A rule two contexts need is a sign
   the boundary is wrong; do not park it in `shared/`.
8. **Domain terms** are as `CONTEXT.md` writes them. Screen copy is Portuguese, identifiers English.
9. **Schema.** One `schema.prisma`; models singular PascalCase, tables plural snake_case via
   `@@map`; `@relation` links models of one context only, a reference across contexts is a plain id
   column; migrations are generated with `npx prisma migrate dev --name <change>`, never edited
   once applied.
10. **Tests.** Vitest specs in `<aggregate>/__test__/<use-case>.spec.ts`, one per use case, on
    in-memory repositories and fakes from `api/test/` (imported through `@test/`); no database, no
    Redis, no SMTP. A spec covers the happy path, the edge cases and the other-Organization
    boundary. `test/use-case-specs.spec.ts` and `test/layout.spec.ts` fail on a missing spec or a
    broken layout rule.

## Decision tree

```
TASK                                            -> LOAD
New endpoint or use case in an existing context -> references/module-scaffolding.md (Part 1)
New context or aggregate                        -> references/module-scaffolding.md (Part 2)
Cross-context read, shared code, ownership      -> references/data-ownership.md
A specific rule and its reason                  -> references/principles.md
Review or compliance check, detection commands  -> references/verification.md
```

## Known deviations / improvement candidates

Verified in the code on 2026-11-08; none is a pattern to copy.

- List controllers compute `take = page * 10` with `skip = (page - 1) * 10` (page 2 asks for 20
  rows) and `PrismaCustomersRepository.findMany` passes `take`/`skip` to `count`: `ROADMAP.md`
  item 7.
- `WorkOrderServiceImageController` writes files in the controller (multer `diskStorage` under
  `uploads/`) and builds the stored `url` there.
- `EditWorkOrderUseCase` copies `vesselId` from the detail entity, which never carries it, so the
  edit answer has no `vesselId` (kept so the JSON stays the same).
- `.cursor/skills/tlc-*` and the plan under `.specs/` describe the web migration (S4) that has not
  happened: `web/` still follows the old `feature/ui/data-access/util` layout and calls `/whoami`,
  which the API renamed `/me`.
