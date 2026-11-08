# Principles

| # | Principle | Rule in Umbrielship | Example |
| --- | --- | --- | --- |
| 1 | Flat by aggregate | One concept is one folder, `package/<context>/<aggregate>/`; no `core/`, `http/` or `persistence/` tree | `customer/vessel/` |
| 2 | Ports and adapters | Repositories are abstract classes in `contracts/`, named `I<Plural>Repository`, bound in `<context>.module.ts` | `{ provide: IVesselsRepository, useClass: PrismaVesselsRepository }` |
| 3 | One operation, one use case | `<verb>-<noun>.use-case.ts` with `handle()`; no `*.service.ts` | `fetch-vessels`, `get-vessel-by-id`, `edit-vessel` |
| 4 | One aggregate, one controller | A controller class holds the handlers of its aggregate and injects use cases only | `vessel.controller.ts` |
| 5 | Explicit communication | A context reaches another through its facade and the plain types the facade file exports | `CustomerFacade.findVesselById` |
| 6 | State isolation | Every tenant table has `organizationId`, filtered on every query; no foreign key across contexts; uniqueness per Organization | `vessels` unique on `[organizationId, imoNumber]` |
| 7 | Organization from the session | The Organization is `user.organizationId`, never a body, query or path value | `@CurrentUser() user: UserPayload` |
| 8 | Cross-cutting in `shared/` | Auth, config, cryptography, mail and Prisma are `shared/module`; exceptions, `ZodValidationPipe` and `Paginate` are `shared/lib`; none holds a business rule | `NotFoundDomainException` |
| 9 | Config through `ConfigService` | Environment variables are read and validated in `shared/module/config/shared.config.ts`; a use case never reads `process.env` | `sharedConfigSchema` |
| 10 | Domain errors are not HTTP errors | Use cases throw domain exceptions; the controller maps them and rethrows the rest | `AlreadyExistsDomainException` to `ConflictException` |
| 11 | Naming | Entities without suffix (`Vessel`); contracts `I<Plural>Repository`; adapters `Prisma<Plural>Repository`; modules `<Context>Module`; facades `<Context>Facade` | `PrismaWorkOrderServiceImagesRepository` |
| 12 | ESM | Imports end in `.js`; no `require` or `__dirname` | `import { X } from './x.use-case.js'` |
| 13 | Vocabulary | Terms as in `CONTEXT.md`; identifiers English, screen copy Portuguese | `imoNumber`, `WorkOrderService` |
