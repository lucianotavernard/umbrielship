# Module scaffolding

## Part 1 - New endpoint or use case in an existing aggregate

Generation order (example: `archive-vessel` in `customer/vessel`):

1. **Entity**: add or change `<aggregate>.entity.ts`. Shape: a `Props` type, a class with `id` set
   to `id ?? randomUUID()` and `Object.assign(this, props)`. Enums are a TS `enum` plus a
   string-literal type.
2. **Contract**: add the method to the abstract class in
   `contracts/<aggregate>-repository.contract.ts`. It takes `organizationId` first. Lists return
   `Paginate<T>` (`{ data, total }`).
3. **Adapter**: implement it in `<aggregate>.repository.ts`, filtering on `organizationId` and
   mapping rows to entities. No other file touches Prisma.
4. **Use case**: `<verb>-<noun>.use-case.ts`: `@Injectable()`, constructor injects contracts,
   `handle(request): Promise<response>`; request and response are local types (the request carries
   `organizationId`); throw `NotFoundDomainException` / `AlreadyExistsDomainException` /
   `ConflictDomainException`.
5. **Controller**: a handler on `<aggregate>.controller.ts`: a Zod body/query schema and inferred
   type, `organizationId` from `@CurrentUser()`, domain-to-HTTP mapping, `throw error` at the end of
   the `catch`.
6. **Module**: add the use case to `providers` of `<context>.module.ts`.
7. **Spec**: `__test__/<use-case>.spec.ts` on in-memory repositories from `api/test/`, covering the
   other-Organization boundary; add the in-memory method to `api/test/repositories/`.
8. **Web** (when the user sees it): see the web layout in `AGENTS.md`.
9. **Verify**: `npm run lint`, `npm run test` and `npm run build` in `api/`, then the checks in
   `references/verification.md`.

New Prisma model or column: edit `schema.prisma`, run `npx prisma migrate dev --name <change>`,
then `npx prisma generate`; commit the regenerated client. A tenant table gets `organizationId`
and an index.

## Part 2 - New context or aggregate

A new aggregate belongs to the context that owns its parent (`work-order-service` lives in
`work-order`). A new context needs a reason an existing one cannot hold the concept (its own
vocabulary and its own models). Then:

1. Create `api/src/package/<context>/<aggregate>/` with the entity, `contracts/`, the repository,
   the use cases, the controller and `__test__/`, and `<context>.module.ts`.
2. In `<context>.module.ts` import `PrismaModule`, bind each contract to its Prisma class, list the
   controllers and use cases, and export only the facade (`<context>.facade.ts`) when another
   context needs the data.
3. Register `<Context>Module` in `api/src/app.module.ts`; a context that reads another imports its
   module and uses its facade.
4. Add the models to `schema.prisma` (migration through Prisma), the terms to `CONTEXT.md`, and a
   row to the context table in `AGENTS.md`.

## Part 3 - Where a concept goes

Same vocabulary and lifecycle as an existing aggregate (a line item, a value): inside that
aggregate. A separate lifecycle with its own endpoints: a new aggregate in the context that owns
its parent. A concept used only by another context's flow stays in the context that decides on it.
Do not create a context to share a helper.
