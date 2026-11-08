# Data ownership

- One schema, one database. Today's models by context: `identity`: `User`; `customer`: `Customer`,
  `CustomerAddress`, `Vessel`; `work-order`: `WorkOrder`, `WorkOrderService`,
  `WorkOrderServiceImage`.
- `@relation` already crosses one boundary: `WorkOrder.vesselId` references `Vessel`
  (`customer`). Treat it as the known exception: `work-order` reads Vessels through
  `VesselRepository` (exported by `CustomerPersistenceModule`) to validate `vesselId`; it does not
  query the `vessel` table with its own Prisma repository.
- A repository queries the models of its own context. A new reference to another context's record
  is a deliberate decision: prefer the id column plus a read through the other context's exported
  repository, and say so in the plan.
- Cross-context reads go through the exported abstract repositories of the other context's
  persistence module. Writes to another context's models do not happen; call that context's use
  case via a new explicit export if one is ever needed.
- Deletes: `WorkOrderService` and `WorkOrderServiceImage` cascade (`onDelete: Cascade`). Deleting a
  `Vessel` or `Customer` with dependents is rejected by the foreign keys (no cascade). Image files
  under `api/uploads/work-order-service-images/` are never removed from disk: no code deletes them, not even when an image is deleted.
- Multi-write operations that must be atomic belong in one repository method using
  `prisma.$transaction`; no code in the repo does this yet.
- `shared/module/prisma` owns the schema, migrations, generated client and `PrismaService`.
