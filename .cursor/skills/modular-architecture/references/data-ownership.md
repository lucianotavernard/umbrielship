# Data ownership

- One schema, one database. Models by context: `identity`: `Organization`, `User`, `Membership`,
  `Invitation`; `customer`: `Customer`, `CustomerAddress`, `Vessel`; `work-order`: `WorkOrder`,
  `WorkOrderService`, `WorkOrderServiceImage`.
- Every tenant table (`customers`, `customer_addresses`, `vessels`, `work_orders`,
  `work_order_services`, `work_order_service_images`) has `organizationId` NOT NULL with an index.
  Repositories take `organizationId` and filter on it; child rows are written with their root's.
- No `@relation` crosses a context. `WorkOrder.vesselId` is a plain id column with no foreign key:
  `work-order` reads Vessels through `CustomerFacade.findVesselById(organizationId, id)` and does
  not query the `vessels` table. A work order may outlive its Vessel (the detail then answers
  `404 Vessel not found`).
- A repository queries the models of its own context. A new reference to another context's record
  is a deliberate decision: an id column plus a read through that context's facade, and say so in
  the plan.
- Cross-context reads go through the facade the other context exports. Writes to another context's
  models do not happen; if one is ever needed, add an explicit facade method.
- Uniqueness is per Organization and case-insensitive (`citext`): the IMO number, the Customer
  email; `users.email` and the Organization `name` and `email` are `citext` and globally unique.
- Deletes: `WorkOrderService` and `WorkOrderServiceImage` cascade (`onDelete: Cascade`);
  `Membership` and `Invitation` cascade from their User and Organization. Deleting a Customer with
  Vessels is rejected by the foreign key. Deleting an image removes its file under
  `api/uploads/work-order-service-images/`.
- Multi-write operations that must be atomic belong in one repository method using
  `prisma.$transaction`.
- `shared/module/prisma` owns the schema, the migrations, the seed, the generated client and
  `PrismaService`.
