# Principles

| # | Principle | Rule in Umbrielship | Example |
| --- | --- | --- | --- |
| 1 | Clear layers | `core` has no Nest-HTTP or Prisma import; `http` has no Prisma; `persistence` has no rule | `create-vessel.use-case.ts` imports only entities, repositories and exceptions |
| 2 | Ports and adapters | Repositories are abstract classes in `core/interface`, bound in `persistence.module.ts` | `{ provide: VesselRepository, useClass: PrismaVesselsRepository }` |
| 3 | One operation, one use case | `<verb>-<noun>.use-case.ts` with `handle()`; no `*.service.ts` | `fetch-vessels`, `get-vessel-by-id`, `edit-vessel` |
| 4 | One endpoint, one controller | A controller class has one handler and injects use cases only | `delete-work-order-service-image.controller.ts` |
| 5 | Explicit sharing | A context shares through its exported persistence module, nothing else | `WorkOrderModule` imports `CustomerPersistenceModule` |
| 6 | Cross-cutting in `shared/` | Auth, config, cryptography and Prisma are `shared/module`; exceptions and `Paginate` are `shared/lib`; none holds a business rule | `NotFoundDomainException` |
| 7 | Config through `ConfigService` | Environment variables are read and validated in `shared/module/config`; a use case never reads `process.env` | `config.factory.ts` and `config.schema.ts` |
| 8 | Domain errors are not HTTP errors | Use cases throw domain exceptions; the controller maps them | `AlreadyExistsDomainException` to `ConflictException` |
| 9 | Naming | Entities `<Name>Entity`; repositories `<Name>Repository` (abstract) and `Prisma<Plural>Repository`; modules `<Context>Module`, `<Context>PersistenceModule` | `PrismaWorkOrderServiceImagesRepository` |
| 10 | Vocabulary | Terms as in `CONTEXT.md`; identifiers English, screen copy Portuguese | `imoNumber`, `WorkOrderService` |
