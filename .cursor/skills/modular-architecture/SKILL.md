---
name: modular-architecture
description: >
  Umbrielship API architecture guide. ALWAYS read this skill BEFORE adding or changing a NestJS
  module, use case, controller, repository, persistence module, Prisma model, or a dependency
  between modules in `api/`. The layout is layered per module (`core/`, `http/`, `persistence/`),
  differs from generic NestJS habits, and reasoning without this skill tends to produce a
  `*.service.ts`, a controller with several endpoints, a repository that injects Prisma into a
  use case, or one module importing another's Prisma repository. Triggers: "new module",
  "scaffold", "new endpoint", "new use case", "repository", "persistence module", "providers",
  "exports", "cross-module", "architecture review", "module boundaries", "customer", "work-order",
  "identity", "shared".
---

# Modular Architecture (Umbrielship API)

`api/` is one NestJS 11 app (CommonJS), one PostgreSQL database, one Prisma schema, three
contexts (`identity`, `customer`, `work-order`) plus `shared/`. This skill describes the layout as
it is today and how to extend it. It does not impose more than the code does.

**Precedence.** `AGENTS.md` is binding and wins over this skill; `CONTEXT.md` is the vocabulary.
Where they disagree, fix this skill in the same change.

## The layout

```
api/src/<context>/
  <context>.module.ts            # controllers + use cases; imports the persistence module
  core/
    entity/<name>.entity.ts      # plain classes (id via randomUUID), no Nest or Prisma import
    interface/<name>.repository.ts   # abstract class, the port
    use-case/<verb>-<noun>.use-case.ts   # @Injectable, one handle() per operation
    exception/                   # context-specific domain exceptions (identity only)
  http/rest/controller/<verb>-<noun>.controller.ts   # one class, one endpoint
  persistence/
    persistence.module.ts        # binds abstract class -> Prisma class, exports them
    repository/prisma-<plural>.repository.ts
api/src/shared/
  lib/core/{exception,type}, lib/http/pipe   # plain code: domain exceptions, Paginate, ZodValidationPipe
  module/{auth,config,cryptography,prisma}   # Nest modules used by several contexts
api/src/app.module.ts                         # composes the context modules
```

Reference context: `customer` (two aggregates, nine use cases and controllers). Path alias `@/` =
`api/src`; inside a module, `./` relative imports are used for the module's own files.

## Rules

1. **Core knows no framework detail.** Entities and repository abstract classes import neither
   Prisma nor HTTP types. Use cases import entities, repository abstract classes, shared exceptions
   and `@Injectable` only.
2. **Repositories are abstract classes** in `core/interface`; the Prisma implementation sits in
   `persistence/repository` and is bound in `persistence.module.ts` with
   `{ provide: X, useClass: PrismaXsRepository }`. Use cases inject the abstract class.
3. **One controller per endpoint**, in `http/rest/controller`. It validates with a Zod schema
   (`ZodValidationPipe`), calls one use case, shapes the response, and maps
   `NotFoundDomainException` to `NotFoundException` and `AlreadyExistsDomainException` to
   `ConflictException`. It injects use cases only. Routes are protected by the global
   `JwtAuthGuard`; `@Public()` opts out.
4. **Persistence modules are the unit of sharing between contexts.** A context that must read
   another's data imports that context's `<Context>PersistenceModule` (as `work-order` imports
   `CustomerPersistenceModule` and injects `VesselRepository` to check the Vessel). Importing the
   abstract repository class that module exports is the only accepted cross-context import. Never
   import another context's use case, controller or Prisma repository class; never declare a second
   binding of a foreign repository.
5. **Prisma stays in `persistence/`.** Only `Prisma<Plural>Repository` classes use `PrismaService`
   and the generated types (`@/shared/module/prisma/generated/prisma/client`); they map rows to
   entities.
6. **`shared/` has no business rule.** `shared/lib` is plain code; `shared/module` holds Nest
   modules (`auth`, `config`, `cryptography`, `prisma`). A rule two contexts need is a sign the
   boundary is wrong; do not park it in `shared/`.
7. **Domain terms** are as `CONTEXT.md` writes them. Screen copy is Portuguese, identifiers English.
8. **Schema.** One `schema.prisma`; models singular PascalCase, tables plural snake_case via
   `@@map`; migrations are generated with `npx prisma migrate dev --name <change>`.
9. **Tests.** Jest specs `<use-case>.spec.ts` beside the use case, with in-memory fakes of the
   repository abstract classes; no database. No spec exists yet (`ROADMAP.md` item 5 proposes
   the foundation).

## Decision tree

```
TASK                                            → LOAD
New endpoint or use case in an existing module  → references/module-scaffolding.md (Part 1)
New context                                     → references/module-scaffolding.md (Part 2)
Cross-module read, shared code, ownership       → references/data-ownership.md
A specific rule and its reason                  → references/principles.md
Review or compliance check, detection commands  → references/verification.md
```

## Known deviations / improvement candidates

Verified in the code on 2026-11-08; none is a pattern to copy, and fixing them is proposal 6 of
`ROADMAP.md`.

- Controllers end with `throw new BadRequestException(error.message)` (13 of 29 controllers) instead
  of rethrowing; unexpected failures answer 400 with their message.
- `create-vessel.controller.ts` declares `@Param('customerId')`, which the route
  (`POST /vessels`) does not have; it is shadowed by the body's `customerId`.
- `CustomerModule` imports `ConfigModule` and `CryptographyModule`, and none of its use cases uses
  them.
- List controllers compute `take = page * 10` with `skip = (page - 1) * 10` (page 2 asks for 20
  rows); `prisma-customers.repository.ts` also passes `take`/`skip` to `count`.
- `.env.example` lists `NODE_ENV`, `PORT` and `DATABASE_URL` only; `JWT_SECRET` and
  `JWT_EXPIRATION_IN` are required by the config factory.
- `UploadWorkOrderServiceImageController` writes files in the controller (multer
  `diskStorage` under `uploads/`) and builds the stored `url` there.
