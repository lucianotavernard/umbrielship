# Module scaffolding

## Part 1 - New endpoint or use case in an existing context

Generation order (example: `archive-vessel` in `customer`):

1. **Entity**: add or change `core/entity/<name>.entity.ts`. Shape: a `Props` type, a class with
   `id` set to `id ?? randomUUID()` and `Object.assign(this, props)`. Enums are a TS `enum` plus a
   string-literal type (`VesselTypeEnum`, `VesselType`).
2. **Port**: add the method to the abstract class in `core/interface/<name>.repository.ts`. Lists
   return `Paginate<T>` (`{ data, total }`).
3. **Adapter**: implement it in `persistence/repository/prisma-<plural>.repository.ts`, mapping rows
   to entities. No other layer touches Prisma.
4. **Use case**: `core/use-case/<verb>-<noun>.use-case.ts`: `@Injectable()`, constructor injects
   abstract repositories, `handle(request): Promise<response>`; request and response are local
   types; throw `NotFoundDomainException` / `AlreadyExistsDomainException`.
5. **Controller**: `http/rest/controller/<verb>-<noun>.controller.ts`: a Zod body/query schema
   and inferred type, `@Controller('/<resource>')`, one handler, domain-to-HTTP mapping as in
   `create-vessel.controller.ts` (but rethrow unknown errors; see the deviations in `SKILL.md`).
6. **Module**: add the use case to `providers` and the controller to `controllers` of
   `<context>.module.ts`.
7. **Web** (when the user sees it): DTO in `web/src/app/<domain>/data-access/dto`, `ui` component
   (`*Ui`), `feature` component with `httpResource`, route in `app.routes.ts`.
8. **Verify**: `npm run lint` and `npm run build` in `api/`, then the checks in
   `references/verification.md`.

New Prisma model or column: edit `schema.prisma`, run `npx prisma migrate dev --name <change>`,
then `npx prisma generate`.

## Part 2 - New context

A new context needs a reason an existing one cannot hold the concept (its own vocabulary and its
own models). Then:

1. Create `api/src/<context>/` with `core/{entity,interface,use-case}`, `http/rest/controller`,
   `persistence/{repository,persistence.module.ts}`, and `<context>.module.ts`.
2. In `persistence.module.ts` bind each abstract class to its Prisma class and `exports` the list
   (`const X_REPOSITORIES = [...]`, `providers: X_REPOSITORIES`, `exports: X_REPOSITORIES`), importing
   `PrismaModule`.
3. In `<context>.module.ts` import the persistence module (and any other context's persistence
   module it truly reads from).
4. Register `<Context>Module` in `api/src/app.module.ts`.
5. Add the models to `schema.prisma` (migration through Prisma), the terms to `CONTEXT.md`, and a
   row to the context table in `AGENTS.md`.

## Part 3 - Where a concept goes

Same vocabulary and lifecycle as an existing aggregate (a line item, a value): inside that
context. A separate lifecycle with its own endpoints: a new aggregate in the context that owns its
parent (`WorkOrderService` lives in `work-order`). A concept used only by another context's flow
stays in the context that decides on it. Do not create a context to share a helper.
