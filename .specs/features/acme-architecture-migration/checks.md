# Acme architecture migration checks

Mutations: 3
Build: `cd api && npm run build`; `cd api && npm run lint`
Plan: `.specs/features/acme-architecture-migration/plan.md`

29 checks in 1 slice (S1 only; S2-S4 are frozen in their own turns, see Handoff) · 0 one-way doors in S1 · 0 open

## Checks

### S1 - The API has a unit-test tier

**C1** - Every one of the 24 use cases has a sibling spec (9 `customer`, 2 `identity`, 13 `work-order`) (AC 1)
Proof: `cd api && npx vitest run test/use-case-specs.spec.ts -t "\[C1\]"`

**C2** - `npm run test` in `api/` exits 0 with `DATABASE_URL` unset, so no database is needed (AC 1)
Proof: `cd api && env -u DATABASE_URL -u JWT_SECRET npm run test`

**C3** - `api/test/app.e2e-spec.ts` and `api/test/jest-e2e.json` do not exist, and the 6 in-memory repositories (customers, vessels, users, work orders, work order services, work order service images) live in `api/test/repositories/` (AC 4)
Proof: `cd api && npx vitest run test/tooling.spec.ts -t "\[C3\]"`

**C4** - `api/package.json` lists `vitest` and `oxlint` and no `jest`, `ts-jest`, `eslint` or `typescript-eslint`; its `test` script is `vitest run` and its `lint` script runs `oxlint` (AC 5)
Proof: `cd api && npx vitest run test/tooling.spec.ts -t "\[C4\]"`

**C5** - `npm run lint` in `api/` exits 0 (AC 5)
Proof: `cd api && npm run lint`

**C6** - `CreateCustomerUseCase` with an email already stored throws `AlreadyExistsDomainException('Customer already exists')` and stores nothing more; with a new email it stores the customer with the given address and returns it (AC 3)
Proof: `cd api && npx vitest run src/customer/core/use-case/create-customer.use-case.spec.ts -t "\[C6\]"`

**C7** - `EditCustomerUseCase` throws `NotFoundDomainException('Customer not found')` for an unknown id; throws `AlreadyExistsDomainException('Customer already exists')` when the new email belongs to another Customer and accepts the Customer's own email; keeps the stored phone when none (omitted or `null`) is given; merges a partial address over the stored one; saves the result (AC 1, AC 10)
Proof: `cd api && npx vitest run src/customer/core/use-case/edit-customer.use-case.spec.ts -t "\[C7\]"`

**C8** - `FetchCustomersUseCase` with `take` 2 and `skip` 1 over 3 customers returns the 2nd and 3rd and `total` 3 (AC 1)
Proof: `cd api && npx vitest run src/customer/core/use-case/fetch-customers.use-case.spec.ts -t "\[C8\]"`

**C9** - `GetCustomerByIdUseCase` returns the Customer for a known id and throws `NotFoundDomainException('Customer not found')` otherwise (AC 1)
Proof: `cd api && npx vitest run src/customer/core/use-case/get-customer-by-id.use-case.spec.ts -t "\[C9\]"`

**C10** - `CreateVesselUseCase` throws `AlreadyExistsDomainException('Vessel already exists')` for an IMO number already stored, even when the Customer is also unknown (the duplicate is checked first); throws `NotFoundDomainException('Customer not found')` for an unknown Customer and stores nothing; otherwise stores the Vessel (AC 1)
Proof: `cd api && npx vitest run src/customer/core/use-case/create-vessel.use-case.spec.ts -t "\[C10\]"`

**C11** - `DeleteVesselUseCase` throws `NotFoundDomainException('Vessel not found')` for an unknown id, and removes exactly that Vessel otherwise (AC 1)
Proof: `cd api && npx vitest run src/customer/core/use-case/delete-vessel.use-case.spec.ts -t "\[C11\]"`

**C12** - `EditVesselUseCase` throws `NotFoundDomainException('Vessel not found')` for an unknown id or a `customerId` that does not own the Vessel; otherwise changes `name`, `type` and `length` and keeps `imoNumber` and `customerId` (AC 1)
Proof: `cd api && npx vitest run src/customer/core/use-case/edit-vessel.use-case.spec.ts -t "\[C12\]"`

**C13** - `FetchVesselsUseCase` with a `customerId` returns only that Customer's Vessels and their count as `total`; without it returns every Vessel; `take` and `skip` apply to both (AC 1)
Proof: `cd api && npx vitest run src/customer/core/use-case/fetch-vessels.use-case.spec.ts -t "\[C13\]"`

**C14** - `GetVesselByIdUseCase` returns the Vessel with its Customer for a known id and throws `NotFoundDomainException('Vessel not found')` otherwise (AC 1)
Proof: `cd api && npx vitest run src/customer/core/use-case/get-vessel-by-id.use-case.spec.ts -t "\[C14\]"`

**C15** - `AuthenticateUserUseCase` throws `WrongCredentialsException` for an unknown email and for a wrong password, and for the right password returns an `accessToken` encrypted from the payload `{ sub: <user id> }` (AC 1)
Proof: `cd api && npx vitest run src/identity/core/use-case/authenticate-user.use-case.spec.ts -t "\[C15\]"`

**C16** - `GetUserByIdUseCase` returns exactly `id`, `name` and `email` (never the password) for a known id and throws `NotFoundDomainException('User not found')` otherwise (AC 1)
Proof: `cd api && npx vitest run src/identity/core/use-case/get-user-by-id.use-case.spec.ts -t "\[C16\]"`

**C17** - `CreateWorkOrderUseCase` throws `NotFoundDomainException('Vessel not found')` for an unknown `vesselId` and stores nothing; for a known one stores the WorkOrder with the given dates and status (AC 2)
Proof: `cd api && npx vitest run src/work-order/core/use-case/create-work-order.use-case.spec.ts -t "\[C17\]"`

**C18** - `CreateWorkOrderServiceUseCase` throws `NotFoundDomainException('Work order not found')` for an unknown WorkOrder and stores nothing; otherwise stores the service under that `workOrderId` (AC 1)
Proof: `cd api && npx vitest run src/work-order/core/use-case/create-work-order-service.use-case.spec.ts -t "\[C18\]"`

**C19** - `DeleteWorkOrderUseCase` throws `NotFoundDomainException('Work order not found')` for an unknown id, and removes exactly that WorkOrder otherwise (AC 1)
Proof: `cd api && npx vitest run src/work-order/core/use-case/delete-work-order.use-case.spec.ts -t "\[C19\]"`

**C20** - `DeleteWorkOrderServiceUseCase` throws `NotFoundDomainException('Work order service not found')` for an unknown service or one that belongs to another WorkOrder, and removes exactly that service otherwise (AC 1)
Proof: `cd api && npx vitest run src/work-order/core/use-case/delete-work-order-service.use-case.spec.ts -t "\[C20\]"`

**C21** - `EditWorkOrderUseCase` throws `NotFoundDomainException('Work order not found')` for an unknown id; otherwise saves the new `startDate`, `endDate` and `status` under the same `id` (AC 1)
Proof: `cd api && npx vitest run src/work-order/core/use-case/edit-work-order.use-case.spec.ts -t "\[C21\]"`

**C22** - `EditWorkOrderServiceUseCase` throws `NotFoundDomainException('Work order service not found')` for an unknown service or one of another WorkOrder; otherwise saves `name`, `description`, `startDate`, `endDate` and `status` and keeps `workOrderId` (AC 1)
Proof: `cd api && npx vitest run src/work-order/core/use-case/edit-work-order-service.use-case.spec.ts -t "\[C22\]"`

**C23** - `FetchWorkOrderServiceImagesUseCase` throws `NotFoundDomainException('Work order service not found')` for an unknown service or one of another WorkOrder; otherwise returns only the images of that service (AC 1)
Proof: `cd api && npx vitest run src/work-order/core/use-case/fetch-work-order-service-images.use-case.spec.ts -t "\[C23\]"`

**C24** - `FetchWorkOrderServicesUseCase` throws `NotFoundDomainException('Work order not found')` for an unknown WorkOrder; otherwise returns only the services of that WorkOrder (AC 1)
Proof: `cd api && npx vitest run src/work-order/core/use-case/fetch-work-order-services.use-case.spec.ts -t "\[C24\]"`

**C25** - `FetchWorkOrdersUseCase` with a `vesselId` returns only that Vessel's WorkOrders and their count as `total`; without it returns every WorkOrder; `take` and `skip` apply to both (AC 1)
Proof: `cd api && npx vitest run src/work-order/core/use-case/fetch-work-orders.use-case.spec.ts -t "\[C25\]"`

**C26** - `GetWorkOrderByIdUseCase` returns the WorkOrder with its Vessel for a known id and throws `NotFoundDomainException('Work order not found')` otherwise (AC 1)
Proof: `cd api && npx vitest run src/work-order/core/use-case/get-work-order-by-id.use-case.spec.ts -t "\[C26\]"`

**C27** - `GetWorkOrderServiceByIdUseCase` returns the service for a known id of that WorkOrder and throws `NotFoundDomainException('Work order service not found')` for an unknown one or one of another WorkOrder (AC 1)
Proof: `cd api && npx vitest run src/work-order/core/use-case/get-work-order-service-by-id.use-case.spec.ts -t "\[C27\]"`

**C28** - `RemoveWorkOrderServiceImageUseCase` throws `NotFoundDomainException('Work order service not found')` for an unknown service or one of another WorkOrder; throws `NotFoundDomainException('Work order service image not found')` for an unknown image or one of another service; otherwise deletes the image row and the file at `<cwd>/<stored url>`, still succeeds when the file is already gone (`ENOENT`), and rethrows any other file-system error (`EACCES`, `EPERM`, `EISDIR`) after the row was deleted (AC 1)
Proof: `cd api && npx vitest run src/work-order/core/use-case/remove-work-order-service-image.use-case.spec.ts -t "\[C28\]"`

**C29** - `AddWorkOrderServiceImageUseCase` throws `NotFoundDomainException('Work order service not found')` for an unknown service or one of another WorkOrder and stores nothing; otherwise stores the image with that `serviceId` and `url` (AC 1)
Proof: `cd api && npx vitest run src/work-order/core/use-case/add-work-order-service-image.use-case.spec.ts -t "\[C29\]"`

## Coverage

| Set (size) | Member -> proof | Unproven |
| --- | --- | --- |
| use cases, one spec each (24) | `CreateCustomer` C6 · `EditCustomer` C7 · `FetchCustomers` C8 · `GetCustomerById` C9 · `CreateVessel` C10 · `DeleteVessel` C11 · `EditVessel` C12 · `FetchVessels` C13 · `GetVesselById` C14 · `AuthenticateUser` C15 · `GetUserById` C16 · `CreateWorkOrder` C17 · `CreateWorkOrderService` C18 · `DeleteWorkOrder` C19 · `DeleteWorkOrderService` C20 · `EditWorkOrder` C21 · `EditWorkOrderService` C22 · `FetchWorkOrderServiceImages` C23 · `FetchWorkOrderServices` C24 · `FetchWorkOrders` C25 · `GetWorkOrderById` C26 · `GetWorkOrderServiceById` C27 · `RemoveWorkOrderServiceImage` C28 · `AddWorkOrderServiceImage` C29; all 24 present: C1 | - |
| in-memory repositories in `api/test/repositories/` (6) | customers · vessels · users · work orders · work order services · work order service images: C3 (table-driven over all 6) | - |
| criteria of S1 (5) | AC 1 C1, C2, C6-C29 · AC 2 C17 · AC 3 C6 · AC 4 C3 · AC 5 C4, C5 | - |
| domain exceptions thrown by use cases (3) | `NotFoundDomainException` C7, C9-C12, C14, C16-C29 · `AlreadyExistsDomainException` C6, C7, C10 · `WrongCredentialsException` C15 | - |
| `api/` assemblies that run the tests (1) | `vitest.config.ts`, the only runner after Jest and ESLint leave: C2, C4 | - |

- Claims naming a thrown exception: every one asserts the class and the message in the same spec.
- Routes and controllers: out of S1, so no status code is claimed here (criterion 10 is S2).

## Swept

- validation: n/a - use cases receive input already validated by the controller's Zod schema; S1 adds no input.
- failure modes: C28 (file-system error after the row is deleted), C10 (order of the duplicate and the lookup)
- idempotency: n/a - no use case here is retried by a caller; C28 covers deleting a file already gone
- authorization: existing - the global `JwtAuthGuard` (`@Public()` opt-out); no Organization exists until S2
- concurrency: n/a - in-memory repositories are single-threaded; the database uniqueness races are S2 (scoped uniqueness)
- data lifecycle: C12, C21, C22 (an edit keeps the fields it does not change)
- dependency failure: C28 (`unlink` fails with a code other than `ENOENT`)
- state transitions: n/a - WorkOrder and service status are written, not guarded, by any use case today
- observability: n/a - no logging requirement in this slice

## Handoff

- **Settled mid-build:** none
- **Dispatched:** Verifier (independent sub-agent) for S1 at `HEAD` 3a4e826 plus the uncommitted working tree (the user forbade commits this turn) - returned: 5 findings, all fixed in the working tree
- **Boundary:** C1-C29 green in `proofs.md` against the working tree, 6 of 6 mutations killed; nothing committed, so `validate_verification.py` stays red until the S1 commit exists (it needs `Closed` to name a commit and a clean tree)
- **Abandoned:** none; C21 was reworded before the build closed: it first claimed `vesselId` is kept, but `EditWorkOrderUseCase` reads it from a detail entity that never carries it (see the plan, criterion 13); the claim now says "under the same `id`"
