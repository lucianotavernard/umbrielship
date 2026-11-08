# Acme architecture migration checks

Mutations: 3
Build: `cd api && npm run build`; `cd api && npm run lint`; `cd web && npm run build`
Plan: `.specs/features/acme-architecture-migration/plan.md`

97 checks in 4 slices (S1 C1-C29, S2 C30-C65, S3 C66-C76, S4 C77-C97) · 5 one-way doors in S2 (doors 1, 2, 5, 6, 7 and 8 of the plan, proofs C42-C46, C63, C64) · door 4 (runtime) in S3, proofs C66-C71 · 0 open

The web has no lint script (`AGENTS.md`), so the Build line names `npm run build` in `web/` and does not invent one.

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
Proof: `cd api && npx vitest run src/package/customer/customer/__test__/create-customer.use-case.spec.ts -t "\[C6\]"`

**C7** - `EditCustomerUseCase` throws `NotFoundDomainException('Customer not found')` for an unknown id; throws `AlreadyExistsDomainException('Customer already exists')` when the new email belongs to another Customer and accepts the Customer's own email; keeps the stored phone when none (omitted or `null`) is given; merges a partial address over the stored one; saves the result (AC 1, AC 10)
Proof: `cd api && npx vitest run src/package/customer/customer/__test__/edit-customer.use-case.spec.ts -t "\[C7\]"`

**C8** - `FetchCustomersUseCase` with `take` 2 and `skip` 1 over 3 customers returns the 2nd and 3rd and `total` 3 (AC 1)
Proof: `cd api && npx vitest run src/package/customer/customer/__test__/fetch-customers.use-case.spec.ts -t "\[C8\]"`

**C9** - `GetCustomerByIdUseCase` returns the Customer for a known id and throws `NotFoundDomainException('Customer not found')` otherwise (AC 1)
Proof: `cd api && npx vitest run src/package/customer/customer/__test__/get-customer-by-id.use-case.spec.ts -t "\[C9\]"`

**C10** - `CreateVesselUseCase` throws `AlreadyExistsDomainException('Vessel already exists')` for an IMO number already stored, even when the Customer is also unknown (the duplicate is checked first); throws `NotFoundDomainException('Customer not found')` for an unknown Customer and stores nothing; otherwise stores the Vessel (AC 1)
Proof: `cd api && npx vitest run src/package/customer/vessel/__test__/create-vessel.use-case.spec.ts -t "\[C10\]"`

**C11** - `DeleteVesselUseCase` throws `NotFoundDomainException('Vessel not found')` for an unknown id, and removes exactly that Vessel otherwise (AC 1)
Proof: `cd api && npx vitest run src/package/customer/vessel/__test__/delete-vessel.use-case.spec.ts -t "\[C11\]"`

**C12** - `EditVesselUseCase` throws `NotFoundDomainException('Vessel not found')` for an unknown id or a `customerId` that does not own the Vessel; otherwise changes `name`, `type` and `length` and keeps `imoNumber` and `customerId` (AC 1)
Proof: `cd api && npx vitest run src/package/customer/vessel/__test__/edit-vessel.use-case.spec.ts -t "\[C12\]"`

**C13** - `FetchVesselsUseCase` with a `customerId` returns only that Customer's Vessels and their count as `total`; without it returns every Vessel; `take` and `skip` apply to both (AC 1)
Proof: `cd api && npx vitest run src/package/customer/vessel/__test__/fetch-vessels.use-case.spec.ts -t "\[C13\]"`

**C14** - `GetVesselByIdUseCase` returns the Vessel with its Customer for a known id and throws `NotFoundDomainException('Vessel not found')` otherwise (AC 1)
Proof: `cd api && npx vitest run src/package/customer/vessel/__test__/get-vessel-by-id.use-case.spec.ts -t "\[C14\]"`

**C15** - `AuthenticateUserUseCase` throws `WrongCredentialsException` for an unknown email and for a wrong password, and for the right password returns an `accessToken` encrypted from the payload `{ sub: <user id> }` (AC 1)
Proof: `cd api && npx vitest run src/package/identity/auth/__test__/authenticate-user.use-case.spec.ts -t "\[C15\]"`

**C16** - `GetProfileUseCase` (the `GET /me` read, AD-015) returns `{ user: { id, name, email, role, organization: { id, name, isInternal }, organizations } }` where `role` and `organization` are the Role and the Organization of the active Membership and `organizations` lists every Membership by Organization name with its Role, never the password; throws `NotFoundDomainException('User not found')` for an unknown id and `NotFoundDomainException('Organization not found')` when the active Organization has no Membership (AC 1, AC 22)
Proof: `cd api && npx vitest run src/package/identity/auth/__test__/get-profile.use-case.spec.ts -t "\[C16\]"`

**C17** - `CreateWorkOrderUseCase` throws `NotFoundDomainException('Vessel not found')` for an unknown `vesselId` and stores nothing; for a known one stores the WorkOrder with the given dates and status (AC 2)
Proof: `cd api && npx vitest run src/package/work-order/work-order/__test__/create-work-order.use-case.spec.ts -t "\[C17\]"`

**C18** - `CreateWorkOrderServiceUseCase` throws `NotFoundDomainException('Work order not found')` for an unknown WorkOrder and stores nothing; otherwise stores the service under that `workOrderId` (AC 1)
Proof: `cd api && npx vitest run src/package/work-order/work-order-service/__test__/create-work-order-service.use-case.spec.ts -t "\[C18\]"`

**C19** - `DeleteWorkOrderUseCase` throws `NotFoundDomainException('Work order not found')` for an unknown id, and removes exactly that WorkOrder otherwise (AC 1)
Proof: `cd api && npx vitest run src/package/work-order/work-order/__test__/delete-work-order.use-case.spec.ts -t "\[C19\]"`

**C20** - `DeleteWorkOrderServiceUseCase` throws `NotFoundDomainException('Work order service not found')` for an unknown service or one that belongs to another WorkOrder, and removes exactly that service otherwise (AC 1)
Proof: `cd api && npx vitest run src/package/work-order/work-order-service/__test__/delete-work-order-service.use-case.spec.ts -t "\[C20\]"`

**C21** - `EditWorkOrderUseCase` throws `NotFoundDomainException('Work order not found')` for an unknown id; otherwise saves the new `startDate`, `endDate` and `status` under the same `id` (AC 1)
Proof: `cd api && npx vitest run src/package/work-order/work-order/__test__/edit-work-order.use-case.spec.ts -t "\[C21\]"`

**C22** - `EditWorkOrderServiceUseCase` throws `NotFoundDomainException('Work order service not found')` for an unknown service or one of another WorkOrder; otherwise saves `name`, `description`, `startDate`, `endDate` and `status` and keeps `workOrderId` (AC 1)
Proof: `cd api && npx vitest run src/package/work-order/work-order-service/__test__/edit-work-order-service.use-case.spec.ts -t "\[C22\]"`

**C23** - `FetchWorkOrderServiceImagesUseCase` throws `NotFoundDomainException('Work order service not found')` for an unknown service or one of another WorkOrder; otherwise returns only the images of that service (AC 1)
Proof: `cd api && npx vitest run src/package/work-order/work-order-service-image/__test__/fetch-work-order-service-images.use-case.spec.ts -t "\[C23\]"`

**C24** - `FetchWorkOrderServicesUseCase` throws `NotFoundDomainException('Work order not found')` for an unknown WorkOrder; otherwise returns only the services of that WorkOrder (AC 1)
Proof: `cd api && npx vitest run src/package/work-order/work-order-service/__test__/fetch-work-order-services.use-case.spec.ts -t "\[C24\]"`

**C25** - `FetchWorkOrdersUseCase` with a `vesselId` returns only that Vessel's WorkOrders and their count as `total`; without it returns every WorkOrder; `take` and `skip` apply to both (AC 1)
Proof: `cd api && npx vitest run src/package/work-order/work-order/__test__/fetch-work-orders.use-case.spec.ts -t "\[C25\]"`

**C26** - `GetWorkOrderByIdUseCase` returns the WorkOrder with its Vessel for a known id and throws `NotFoundDomainException('Work order not found')` otherwise (AC 1)
Proof: `cd api && npx vitest run src/package/work-order/work-order/__test__/get-work-order-by-id.use-case.spec.ts -t "\[C26\]"`

**C27** - `GetWorkOrderServiceByIdUseCase` returns the service for a known id of that WorkOrder and throws `NotFoundDomainException('Work order service not found')` for an unknown one or one of another WorkOrder (AC 1)
Proof: `cd api && npx vitest run src/package/work-order/work-order-service/__test__/get-work-order-service-by-id.use-case.spec.ts -t "\[C27\]"`

**C28** - `RemoveWorkOrderServiceImageUseCase` throws `NotFoundDomainException('Work order service not found')` for an unknown service or one of another WorkOrder; throws `NotFoundDomainException('Work order service image not found')` for an unknown image or one of another service; otherwise deletes the image row and the file at `<cwd>/<stored url>`, still succeeds when the file is already gone (`ENOENT`), and rethrows any other file-system error (`EACCES`, `EPERM`, `EISDIR`) after the row was deleted (AC 1)
Proof: `cd api && npx vitest run src/package/work-order/work-order-service-image/__test__/remove-work-order-service-image.use-case.spec.ts -t "\[C28\]"`

**C29** - `AddWorkOrderServiceImageUseCase` throws `NotFoundDomainException('Work order service not found')` for an unknown service or one of another WorkOrder and stores nothing; otherwise stores the image with that `serviceId` and `url` (AC 1)
Proof: `cd api && npx vitest run src/package/work-order/work-order-service-image/__test__/add-work-order-service-image.use-case.spec.ts -t "\[C29\]"`

### S2 - The API follows the acme layout and tenancy

Layout and contract (criteria 6, 7, 10, 11, 13)

**C30** - `api/src/package/` holds `customer/{customer,vessel}`, `work-order/{work-order,work-order-service,work-order-service-image}`, `identity/{auth,user,organization,invitation}` and `shared/`; every aggregate folder has a `__test__/`; every aggregate that has a repository contract has a `contracts/`; no folder named `core`, `http` or `persistence` exists under `api/src`; each `*.use-case.ts` declares exactly one exported class (AC 6)
Proof: `cd api && npx vitest run test/layout.spec.ts -t "\[C30\]"`

**C31** - No exported class under `api/src/package` ends in `Entity`; every `contracts/*-repository.contract.ts` declares `abstract class I<Plural>Repository` for its aggregate (`ICustomersRepository`, `IVesselsRepository`, `IWorkOrdersRepository`, `IWorkOrderServicesRepository`, `IWorkOrderServiceImagesRepository`, `IUsersRepository`, `IOrganizationsRepository`, `IInvitationsRepository`) and no `core/interface` file exists (AC 7)
Proof: `cd api && npx vitest run test/layout.spec.ts -t "\[C31\]"`

**C32** - The controllers expose exactly the 13 `work-order` routes and 9 `customer` routes with the URLs of today, `POST /sessions`, `GET /me` (and no `GET /whoami`), and the 12 other identity routes of the plan's Surface, each in one controller per aggregate (`CustomerController`, `VesselController`, `WorkOrderController`, `WorkOrderServiceController`, `WorkOrderServiceImageController`, `AuthenticationController`, `OrganizationController`, `UserController`, `InvitationController`), no file with two controller classes (AC 6, AC 13)
Proof: `cd api && npx vitest run test/layout.spec.ts -t "\[C32\]"`

**C33** - For each controller handler that calls a use case, a `NotFoundDomainException` becomes `NotFoundException` (404), an `AlreadyExistsDomainException` becomes `ConflictException` (409) where the use case can throw it, a `ConflictDomainException` becomes `ConflictException`, and any other `Error('database down')` is rethrown unchanged (not an `HttpException`, so Nest answers 500); `WrongCredentialsException` on `POST /sessions` becomes `UnauthorizedException` (401) (AC 10)
Proof: `cd api && npx vitest run src/package -t "\[C33\]"`

**C34** - Every `catch` block in a controller ends with `throw error;` and no controller file contains `BadRequestException(error` or `InternalServerErrorException` (AC 10)
Proof: `cd api && npx vitest run test/layout.spec.ts -t "\[C34\]"`

**C35** - Customer tenancy: `FetchCustomersUseCase` for Organization A over 2 customers of A and 1 of B returns the 2 of A and `total` 2; `GetCustomerByIdUseCase` and `EditCustomerUseCase` called with B's customer id from A throw `NotFoundDomainException('Customer not found')` and change nothing; `CreateCustomerUseCase` accepts the same email in two Organizations (2 stored) and rejects `Ops@Atlantic.test` after `ops@atlantic.test` in the same Organization with `AlreadyExistsDomainException('Customer already exists')` (AC 8, AC 9)
Proof: `cd api && npx vitest run src/package/customer/customer/ -t "\[C35\]"`

**C36** - Vessel tenancy: `9074729` registered in A and in B stores 2 vessels; `abc123` then `ABC123` in A throws `AlreadyExistsDomainException('Vessel already exists')` and stores one; `CreateVesselUseCase` with a Customer of B from A throws `NotFoundDomainException('Customer not found')`; `GetVesselByIdUseCase`, `EditVesselUseCase`, `DeleteVesselUseCase` called with B's vessel id from A throw `NotFoundDomainException('Vessel not found')` and keep B's vessel; `FetchVesselsUseCase` from A, with and without `customerId`, returns only A's vessels and A's `total` (AC 8, AC 9)
Proof: `cd api && npx vitest run src/package/customer/vessel/ -t "\[C36\]"`

**C37** - WorkOrder tenancy: `CreateWorkOrderUseCase` from A with B's `vesselId` throws `NotFoundDomainException('Vessel not found')` through `CustomerFacade` and stores nothing; `GetWorkOrderByIdUseCase`, `EditWorkOrderUseCase`, `DeleteWorkOrderUseCase` with B's work order id from A throw `NotFoundDomainException('Work order not found')`; `FetchWorkOrdersUseCase` from A, with and without `vesselId`, returns only A's work orders and A's `total`; the detail of a work order of A names its Vessel read through `CustomerFacade` (`vesselId`, `name`, `type`, `length`) (AC 8, AC 11)
Proof: `cd api && npx vitest run src/package/work-order/work-order/ -t "\[C37\]"`

**C38** - WorkOrderService tenancy: `CreateWorkOrderServiceUseCase`, `FetchWorkOrderServicesUseCase`, `GetWorkOrderServiceByIdUseCase`, `EditWorkOrderServiceUseCase`, `DeleteWorkOrderServiceUseCase` called from A with a work order (or a service) of B throw `NotFoundDomainException` (`'Work order not found'` or `'Work order service not found'`) and change nothing (AC 8)
Proof: `cd api && npx vitest run src/package/work-order/work-order-service/ -t "\[C38\]"`

**C39** - WorkOrderServiceImage tenancy: `AddWorkOrderServiceImageUseCase`, `FetchWorkOrderServiceImagesUseCase`, `RemoveWorkOrderServiceImageUseCase` called from A with a service or image of B throw `NotFoundDomainException`, add or delete nothing, and leave B's file on disk (AC 8)
Proof: `cd api && npx vitest run src/package/work-order/work-order-service-image/ -t "\[C39\]"`

**C40** - `CustomerFacade.findVesselById(organizationId, id)` returns a plain `{ id, name, type, length, customerId }` for a Vessel of that Organization and `null` for an unknown id or a Vessel of another Organization; it reads no Customer data (AC 11)
Proof: `cd api && npx vitest run src/package/customer/__test__/customer.facade.spec.ts -t "\[C40\]"`

**C41** - No file under `api/src/package/work-order` imports anything from `package/customer` except `customer.module` and `customer.facade`, and `CustomerModule` exports only `CustomerFacade` (AC 11)
Proof: `cd api && npx vitest run test/layout.spec.ts -t "\[C41\]"`

Schema, backfill and seed (criteria 9, 12, 14, 15); each proof builds a throwaway PostgreSQL 17 with Docker, applies the pre-S2 migrations, inserts the fixture, applies the S2 migrations

**C42** - With 2 customers (with addresses), 3 vessels, 4 work orders, 5 services and 2 images before the migration, every table has the same count after, every row of `customers`, `customer_addresses`, `vessels`, `work_orders`, `work_order_services`, `work_order_service_images` has `organizationId` equal to the id of Organization "Umbrielship" (`isInternal` true, 1 Organization), and each of the 6 columns is NOT NULL (AC 12)
Proof: `bash api/test/db/migration-check.sh backfill`

**C43** - 3 Users (`MANAGER`, `DEVELOPER`, `USER`) before the migration end with exactly 1 Membership each in "Umbrielship", Role `administrator`, `administrator`, `operator`, `users.activeOrganizationId` = that Organization, no column `users.role` and no type `UserRole` (AC 14)
Proof: `bash api/test/db/migration-check.sh roles`

**C44** - After the migrations: the same IMO number inserts in two Organizations and `abc123` then `ABC123` in one fails with a unique violation; the same holds for `customers.email`, `users.email` (`Maria@x.test` then `maria@x.test`) and `organizations.name` and `email`; a work order inserts with a `vesselId` that no vessel has (no foreign key) and `\d work_orders` lists no foreign key to `vessels`; every tenant table has an index on `organizationId` (AC 9, AC 12)
Proof: `bash api/test/db/migration-check.sh constraints`

**C45** - Applying every migration to an empty database leaves no drift: `prisma migrate diff` from the migrated database to `schema.prisma` exits 0 with an empty diff, and `prisma migrate deploy` is idempotent (second run applies nothing) (AC 12, AC 14)
Proof: `bash api/test/db/migration-check.sh drift`

**C46** - `prisma db seed` against an empty database creates Organization "Umbrielship" with `isInternal` true and one User holding one Administrator Membership in it, with `activeOrganizationId` set; against the backfilled database (Organization "Umbrielship" and Users already there) and run twice it creates no second Organization and no second User with the seeded email: counts after the second run equal the counts after the first (AC 15)
Proof: `bash api/test/db/migration-check.sh seed`

Identity (criteria 15 to 22)

**C47** - `ResolveSessionUseCase` returns `{ sub, organizationId, role, internal }` for the User's active Organization and the Role of the Membership there (`administrator` in the internal Organization gives `internal` true); throws `NotFoundDomainException` for an unknown User and for an active Organization with no Membership (AC 22)
Proof: `cd api && npx vitest run src/package/identity/auth/__test__/resolve-session.use-case.spec.ts -t "\[C47\]"`

**C48** - `SwitchOrganizationUseCase` sets `activeOrganizationId` to an Organization the User holds a Membership in, so the next `ResolveSessionUseCase` for that User returns it (a token issued before the switch included); throws `NotFoundDomainException('Organization not found')` for an Organization the User is not a member of, and for one that does not exist, and changes nothing (AC 22)
Proof: `cd api && npx vitest run src/package/identity/auth/__test__/switch-organization.use-case.spec.ts -t "\[C48\]"`

**C49** - `CreateOrganizationUseCase` stores a non-internal Organization (`isInternal` false) and returns `{ id, name, email, isInternal }`; throws `AlreadyExistsDomainException` when the name exists in another letter case (`acme` after `Acme`) and when the email exists in another letter case (AC 16)
Proof: `cd api && npx vitest run src/package/identity/organization/__test__/create-organization.use-case.spec.ts -t "\[C49\]"`

**C50** - `InternalAdministratorGuard` throws `ForbiddenException` for a User whose active Organization is not internal, for an internal `operator`, and for a request with no user, and returns true for an internal `administrator` (AC 16)
Proof: `cd api && npx vitest run src/package/identity/organization/__test__/internal-administrator.guard.spec.ts -t "\[C50\]"`

**C51** - `CreateUserUseCase` stores the User with its hashed password (never the plain one), one Membership with the given Role in the given Organization and `activeOrganizationId` set to it, and returns `{ id, name, email, role, organizationName }` without the password; throws `AlreadyExistsDomainException('User already exists')` when the email exists in another letter case; throws `NotFoundDomainException('Organization not found')` for an unknown Organization and stores nothing (AC 17)
Proof: `cd api && npx vitest run src/package/identity/user/__test__/create-user.use-case.spec.ts -t "\[C51\]"`

**C52** - `SendInvitationUseCase` for an existing User and a non-internal Organization stores an Invitation with status `pending`, delivery status `queued`, a 64-character hex secret that differs between two Invitations, enqueues its id once, and returns `{ id, email, organizationName, role, status, deliveryStatus }` with no `secret`; throws `ConflictDomainException` when the User already holds a Membership there, when the Organization is internal, and when an Invitation is already pending; throws `NotFoundDomainException` for an unknown User or Organization and stores and enqueues nothing; when the queue throws, the Invitation stays stored `queued` and the response is still returned (AC 18)
Proof: `cd api && npx vitest run src/package/identity/invitation/__test__/send-invitation.use-case.spec.ts -t "\[C52\]"`

**C53** - `ResendInvitationUseCase` requeues a pending Invitation whose delivery is `delivered` or `failed` (status `queued`, attempts 0, same secret, enqueued once) and answers `deliveryStatus` `queued`; throws `ConflictDomainException('Invitation already accepted')` for an accepted one, `ConflictDomainException('Invitation delivery already queued')` for one already `queued`, `NotFoundDomainException` for an unknown id (AC 18)
Proof: `cd api && npx vitest run src/package/identity/invitation/__test__/resend-invitation.use-case.spec.ts -t "\[C53\]"`

**C54** - `AcceptInvitationUseCase` with a valid secret adds a Membership with the invited Role in the invited Organization, marks the Invitation `accepted`, keeps the User's earlier Memberships and its `activeOrganizationId`, and returns `{ organizationName }`; throws `NotFoundDomainException('Invitation not found')` for an unknown secret and `ConflictDomainException('Invitation already accepted')` for a second accept of the same secret, which adds no second Membership (AC 21)
Proof: `cd api && npx vitest run src/package/identity/invitation/__test__/accept-invitation.use-case.spec.ts -t "\[C54\]"`

**C55** - `DeliverInvitationUseCase` sends one email through `InvitationDelivery` to the User's email with the acceptance link `<WEB_ORIGIN>/invitations/accept?secret=<secret>` (a trailing `/` on `WEB_ORIGIN` does not double) and records `delivered` with attempts 1; a failing attempt 1 records `queued`, attempts 1 and answers `retry`, a failing attempt 2 the same with attempts 2, a failing attempt 3 records `failed` with attempts 3 and `lastDeliveryFailureAt` set; a delivery that has not settled after 5 000 ms counts as a failed attempt (fake timers: 4 999 ms is still waiting, 5 000 ms fails); an accepted or unknown Invitation answers `skipped` and sends nothing (AC 19)
Proof: `cd api && npx vitest run src/package/identity/invitation/__test__/deliver-invitation.use-case.spec.ts -t "\[C55\]"`

**C56** - The queue adapter: `invitationDeliveryBackoff(1)` is 5 000 and `invitationDeliveryBackoff(2)` is 10 000; the job options are `jobId` = the Invitation id, `attempts` 3, custom backoff, `removeOnComplete` and `removeOnFail` true; `InvitationDeliveryQueueProducer.enqueue` adds a job `{ invitationId }` with those options and rejects when the queue does not answer in 2 000 ms; `InvitationDeliveryQueueConsumer.process` calls the use case and throws only when the outcome is `retry` (AC 19)
Proof: `cd api && npx vitest run src/package/identity/invitation/__test__/invitation-delivery-queue.spec.ts -t "\[C56\]"`

**C57** - `RecoverInvitationDeliveriesUseCase` with 2 pending Invitations `queued`, 1 `delivered` and 1 accepted still `queued` enqueues exactly the 2 pending queued ones and touches the others, and keeps going when one enqueue throws; `InvitationDeliveryRecovery.onApplicationBootstrap` runs it (AC 20)
Proof: `cd api && npx vitest run src/package/identity/invitation/__test__/recover-invitation-deliveries.use-case.spec.ts -t "\[C57\]"`

**C58** - `EmailInvitationDelivery` sends through `EmailSender` one message to the User's email, subject `Convite para <organization name>`, with the acceptance link in the text and the HTML, the organization name HTML-escaped, and the Role as `Administrador` or `Operador`; `NodemailerEmailSender` creates its transport from `MAIL_HOST` and `MAIL_PORT`, authenticates only when both `MAIL_USER` and `MAIL_PASS` are set, and sends from `MAIL_FROM` (AC 19)
Proof: `cd api && npx vitest run src/package/identity/invitation/__test__/email-invitation-delivery.spec.ts src/package/shared/module/mail/__test__/nodemailer-email-sender.spec.ts -t "\[C58\]"`

**C59** - `FetchOrganizationsUseCase` with `perPage` 2 over 3 Organizations returns the first 2 by name and `total` 3, and page 2 returns the third; `GetOrganizationByIdUseCase` returns `{ id, name, email, isInternal }` for a known id and throws `NotFoundDomainException('Organization not found')` otherwise (Surface `GET /organizations`, `GET /organizations/:id`)
Proof: `cd api && npx vitest run src/package/identity/organization/__test__ -t "\[C59\]"`

**C60** - `FetchOrganizationUsersUseCase` returns `{ id, name, email, role }` of the Users holding a Membership in the Organization with the Role of that Membership, paged, and `total`; `CountOrganizationRolesUseCase` returns `[{ role: 'administrator', users: n }, { role: 'operator', users: m }]` in that order, with `0` for a Role nobody holds; both throw `NotFoundDomainException('Organization not found')` for an unknown Organization (Surface `GET /organizations/:id/users`, `/roles`)
Proof: `cd api && npx vitest run src/package/identity/user/__test__ -t "\[C60\]"`

**C61** - `FetchUsersUseCase` with `notInOrganizationId` returns only the Users with no Membership in that Organization, as `{ id, name, email }`, paged, and `total` (Surface `GET /users`)
Proof: `cd api && npx vitest run src/package/identity/user/__test__/fetch-users.use-case.spec.ts -t "\[C61\]"`

**C62** - `FetchInvitationsUseCase` returns the Organization's Invitations newest first as `{ id, email, role, status, deliveryStatus }`, never the secret, paged, and `total`; throws `NotFoundDomainException('Organization not found')` for an unknown Organization (Surface `GET /organizations/:id/invitations`)
Proof: `cd api && npx vitest run src/package/identity/invitation/__test__/fetch-invitations.use-case.spec.ts -t "\[C62\]"`

**C63** - The config factory accepts `REDIS_URL` `redis://localhost:6379` and `rediss://r.example:6380`, `WEB_ORIGIN` `http://localhost:4200`, `MAIL_HOST`, `MAIL_PORT` `1025`, `MAIL_FROM`, and optional `MAIL_USER` and `MAIL_PASS`; it throws `ConfigException` when any of `REDIS_URL`, `WEB_ORIGIN`, `MAIL_HOST`, `MAIL_PORT`, `MAIL_FROM` is missing, when `REDIS_URL` is `http://x`, and when `MAIL_PORT` is `abc` (door 7)
Proof: `cd api && npx vitest run src/package/shared/module/config/__test__/shared-config.spec.ts -t "\[C63\]"`

**C64** - Against a real stack (PostgreSQL, Redis and Mailpit in Docker, the built API from `dist/` booted with the 12 env vars) the walk answers: `POST /sessions` 201 and 401 on a wrong password; `GET /me` 200 with Organization "Umbrielship", `isInternal` true and Role `administrator`; `GET /whoami` 404; two Organizations A and B created through `POST /organizations` (201) and a repeat in another letter case 409; a User of each; `GET /vessels/<B's id>` from A 404, `GET /customers` from A lists only A's, `POST /work-orders` with B's `vesselId` from A 404 `Vessel not found`; `9074729` in A and in B 201 and 201 and `abc123` then `ABC123` in A 201 and 409; `POST /invitations` 201 without `secret`, then the email arrives in Mailpit with the link, `POST /invitations/accept` 200 with `organizationName` and a second accept 409; `POST /organizations/switch` 204 and 404; a non-administrator gets 403 on `GET /organizations`; with Redis stopped before an Invitation is sent the request still answers 201, and after the API restarts with Redis back the Invitation email arrives (recovery); with PostgreSQL stopped `GET /customers` answers 500 (AC 8, AC 9, AC 10, AC 16, AC 17, AC 18, AC 19, AC 20, AC 21, AC 22)
Proof: `bash api/test/smoke/api-smoke.sh`

**C65** - `npm run test` in `api/` exits 0 with the S2 suite (AC 23)
Proof: `cd api && env -u DATABASE_URL -u JWT_SECRET -u REDIS_URL npm run test`

### S3 - The API runs on the acme platform

**C66** - `api/package.json` has `"type": "module"`, and `@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express`, `@nestjs/jwt`, `@nestjs/passport`, `@nestjs/bullmq`, `@nestjs/config`, `@nestjs/testing`, `@nestjs/cli` and `@nestjs/schematics` all declare a `^12` range; `typescript` is `^6`; `tsc-alias` and `ts-loader` are gone (AC 24)
Proof: `cd api && npx vitest run test/platform.spec.ts -t "\[C66\]"`

**C67** - `api/tsconfig.json` sets `"strict": true`; neither it nor `api/tsconfig.build.json` (the config `nest build` reads, which extends it) sets `strict`, `strictNullChecks`, `noImplicitAny`, `strictBindCallApply`, `strictFunctionTypes`, `noImplicitThis`, `alwaysStrict` or `useUnknownInCatchVariables` to `false`; `npx tsc --noEmit -p tsconfig.json` over `src/` and `test/` exits 0 (AC 24)
Proof: `cd api && npx vitest run test/platform.spec.ts -t "\[C67\]"`
Proof: `cd api && npx tsc --noEmit -p tsconfig.json`

**C68** - Every relative (`.`, `..`, `./x`) and `@/` or `@test/` specifier after `from`, `import`, `import(` or `vi.mock`, `vi.doMock`, `vi.importActual`, `vi.importMock` in `api/src` and `api/test` ends in `.js` (not `.json`); no file there (outside the generated client) uses `require(`, `module.exports`, `__dirname` or `__filename`; `schema.prisma` declares `moduleFormat = "esm"` and the generated client has no `require(` (AC 24)
Proof: `cd api && npx vitest run test/platform.spec.ts -t "\[C68\]"`

**C69** - `npm run build` in `api/` exits 0 and writes `dist/main.js` as an ES module; no `.js` under `dist/` still contains an `@/` specifier; the generated Prisma client is under `dist/package/shared/module/prisma/generated/prisma/` as ES modules (AC 25)
Proof: `cd api && npm run build && node test/smoke/check-dist.mjs`

**C70** - Against real PostgreSQL, Redis and Mailpit (Docker), `npm run start:prod` boots from `dist/` on `PORT`: `GET /me` without a token answers 401, and an image uploaded through `POST /work-orders/:id/services/:id/images` (the bytes `PNG-S3`) is served by `GET /uploads/work-order-service-images/<file>` with 200 and the same bytes (AC 25, AC 24)
Proof: `bash api/test/smoke/boot-smoke.sh`

**C71** - In the same stack, `npm run start:dev` boots on `PORT` as ESM: `GET /me` without a token answers 401 and the image stored by C70 is served at `/uploads/...` with 200 and the same bytes (AC 24)
Proof: `bash api/test/smoke/boot-smoke.sh`

**C72** - `npm run test` in `api/` exits 0 with `DATABASE_URL`, `JWT_SECRET` and `REDIS_URL` unset, on the ESM and strict build (AC 24)
Proof: `cd api && env -u DATABASE_URL -u JWT_SECRET -u REDIS_URL npm run test`

**C73** - `AGENTS.md` lists Redis, SMTP with Mailpit, the 7 variables `REDIS_URL`, `WEB_ORIGIN`, `MAIL_HOST`, `MAIL_PORT`, `MAIL_FROM`, `MAIL_USER` and `MAIL_PASS`, `npx prisma db seed`, Vitest, oxlint, ESM, the `package/<context>/<aggregate>` layout, `organizationId` taken from the session, `CustomerFacade` and `GET /me`; it keeps the Context7 rule; and it contains none, in any letter case, of `core/interface`, `core/entity`, `core/use-case`, `core/exception`, `http/rest`, `persistence/`, `persistence.module`, `PersistenceModule`, `CommonJS`, `tsc-alias`, `ts-loader`, `NestJS 11`, `dist/src/main.js`, `Jest`, `whoami` or `create the first User by hand` (AC 24a)
Proof: `cd api && npx vitest run test/docs.spec.ts -t "\[C73\]"`

**C74** - `CONTEXT.md` defines **Organization**, **Membership**, **Role** and **Invitation** as glossary entries, keeps the 7 terms it had (User, Customer, Vessel, IMO number, WorkOrder, WorkOrderService, WorkOrderServiceImage), no longer lists `MANAGER` or `DEVELOPER` as a User role, says the IMO number is unique within its Organization and the Customer email is unique within its Organization (AC 24a); it does not claim a database rule that does not exist (one internal Organization is created by the seed, not enforced by an index)
Proof: `cd api && npx vitest run test/docs.spec.ts -t "\[C74\]"`

**C75** - `.cursor/skills/modular-architecture/SKILL.md` describes the flat-by-aggregate layout (`package/<context>/<aggregate>/`, `contracts/`, `I<Plural>Repository`, `__test__/`), the facade, `organizationId` tenancy, ESM `.js` specifiers, Vitest and oxlint, and contains none, in any letter case, of `core/entity`, `core/interface`, `core/use-case`, `core/exception`, `http/rest/controller`, `persistence/`, `persistence.module`, `PersistenceModule`, `Jest`, `CommonJS`, `tsc-alias`, `ts-loader` or `NestJS 11`; the `roadmap-execution` skill names no `core/` or `persistence/` path either (AC 24a)
Proof: `cd api && npx vitest run test/docs.spec.ts -t "\[C75\]"`

**C76** - `ROADMAP.md` item 5 (tests foundation) and item 6 (error mapping) read `Status: built`, item 7 stays a proposal, and no item mentions `whoami` (any case) or "by hand" (AC 24a; items 5 and 6 are absorbed by AD-007)
Proof: `cd api && npx vitest run test/docs.spec.ts -t "\[C76\]"`

### S4 - The web follows the acme layout

Context7 is not available in this session. The reference for Angular 22, `@Service()`, Signal Forms and the module shape is `acme/apps/web` and `acme/docs/frontend-standards.md`, plus the Angular packages installed in `web/`. The folder is `web/src/package/` as criterion 26 writes it (acme's `src/package/`), not `web/src/app/package/`. The table primitive is the attribute `table[tTable]`, acme's `table[acmeTable]` with the `t` attribute prefix (AD-012); it is not an element named `t-table`.

**C77** - `web/package.json` declares `@angular/core`, `@angular/common`, `@angular/compiler`, `@angular/forms`, `@angular/platform-browser`, `@angular/router`, `@angular/build`, `@angular/cli` and `@angular/compiler-cli` each on a `^22` range, and the installed `@angular/core` version starts with `22.` (AC 26)
Proof: `node --test --test-name-pattern '\[C77\]' web/test/layout.spec.mjs`

**C78** - These 9 modules exist under `web/src/package/`, and each has a page directory, a `components/` directory and exactly one `*.service.ts` whose source contains `@Service()`: `customer/customer`, `customer/vessel`, `work-order/work-order`, `work-order/work-order-service`, `work-order/work-order-service-image`, `identity/authentication`, `identity/organization`, `identity/user`, `identity/invitation`. No directory `web/src/app/customer`, `web/src/app/work-order`, `web/src/app/identity` or `web/src/app/analytics` remains (AC 26)
Proof: `node --test --test-name-pattern '\[C78\]' web/test/layout.spec.mjs`

**C79** - `web/angular.json` sets `"prefix": "t"`. The shared UI declares selectors `t-sheet`, `t-pagination`, `t-confirmation`, `t-skeleton`, `t-toaster`, `table[tTable]`, `button[tButton]` and `a[tButton]`. No selector under `web/src` contains `acme` (AC 26, AD-012)
Proof: `node --test --test-name-pattern '\[C79\]' web/test/layout.spec.mjs`

**C80** - No file under `web/src` sets `styleUrl` or `styleUrls`, and `web/src` contains no `*.css` other than `styles.css` (AC 26)
Proof: `node --test --test-name-pattern '\[C80\]' web/test/layout.spec.mjs`

**C81** - The 8 forms (authentication, customer, vessel, work order, work order service, organization, user, invitation) each call `form(` imported from `@angular/forms/signals`. No file under `web/src` imports `FormBuilder` or `NgModel` or contains `[(ngModel)]` (AC 26)
Proof: `node --test --test-name-pattern '\[C81\]' web/test/layout.spec.mjs`

**C82** - No file under `web/src` contains `whoami`. `authentication.service.ts` reads `GET /api/me` (AD-015)
Proof: `node --test --test-name-pattern '\[C82\]' web/test/layout.spec.mjs`

**C83** - The customer, vessel, work-order and work-order-service list components use `tTable` and the empty copy `Nenhum cliente encontrado`, `Nenhuma embarcação encontrada`, `Nenhuma ordem de serviço` and `Nenhum serviço executado`, and none of those four files contains a `<card` tag (AC 27, AC 32)
Proof: `node --test --test-name-pattern '\[C83\]' web/test/layout.spec.mjs`

**C84** - Submitting email `ops@atlantic.test` and password `secret-pass` on the sign-in page posts `{ email: 'ops@atlantic.test', password: 'secret-pass' }` to `POST /api/sessions`. A 201 body `{ access_token: 'tok-84' }` stores `tok-84` in localStorage at `@umbriel:access-token`. A 401 shows the text `E-mail ou senha incorretos.` (AC 27)
Proof: `cd web && npx ng test --watch=false --filter='\[C84\]'`

**C85** - The layout reads `GET /api/me`. With organizations `Umbrielship` (`org-a`, active) and `Atlantic` (`org-b`), picking `Atlantic` posts `{ organizationId: 'org-b' }` to `POST /api/organizations/switch` and then reloads the page. One membership renders `Umbrielship` and posts nothing (AC 29)
Proof: `cd web && npx ng test --watch=false --filter='\[C85\]'`

**C86** - A user with `role` `administrator` and `organization.isInternal` true may open `/organizations`. An `operator` of the internal Organization, and an `administrator` whose `isInternal` is false, are routed to `/forbidden`, whose heading is `Acesso negado` (AC 30)
Proof: `cd web && npx ng test --watch=false --filter='\[C86\]'`

**C87** - The Organizations page renders `Atlantic` and `ops@atlantic.test` in `table[tTable]`, and zero organizations render `Nenhuma organização encontrada`. Submitting name `Atlantic` and email `ops@atlantic.test` from the `t-sheet` posts that body to `POST /api/organizations` (AC 30)
Proof: `cd web && npx ng test --watch=false --filter='\[C87\]'`

**C88** - Organization `org-1` shows user `Ana`, `ana@atlantic.test`, `Operador`, and invitation `ana@atlantic.test` with a `Reenviar` control. The user sheet posts `{ name: 'Ana', email: 'ana@atlantic.test', password: 'secret-pass', role: 'operator', organizationId: 'org-1' }` to `POST /api/users`. The invitation sheet posts `{ userId: 'user-1', organizationId: 'org-1', role: 'operator' }` to `POST /api/invitations`. `Reenviar` posts to `POST /api/invitations/inv-1/resend` (AC 30)
Proof: `cd web && npx ng test --watch=false --filter='\[C88\]'`

**C89** - `/invitations/accept?secret=abc` shows the accept form. Confirming posts `{ secret: 'abc' }` to `POST /api/invitations/accept`. A 200 `{ organizationName: 'Atlantic' }` shows `Atlantic`. A 404 shows `Convite não encontrado.`. A 409 shows `Este convite já foi aceito.` (AC 31)
Proof: `cd web && npx ng test --watch=false --filter='\[C89\]'`

**C90** - The Customers page requests `GET /api/customers?page=1` and, after the page-2 control, `GET /api/customers?page=2`. Neither URL contains `organizationId`. Zero rows render `Nenhum cliente encontrado` (AC 28)
Proof: `cd web && npx ng test --watch=false --filter='\[C90\]'`

**C91** - The Vessels page requests `GET /api/vessels?page=1` with no `organizationId`, renders `Aurora` for that vessel and `Nenhuma embarcação encontrada` when the list is empty. The work-order list for `vessel-1` requests `GET /api/work-orders?vesselId=vessel-1&take=10&skip=0`. Uploading a file on service `svc-1` of work order `wo-1` posts to `POST /api/work-orders/wo-1/services/svc-1/images` (AC 27, AC 32)
Proof: `cd web && npx ng test --watch=false --filter='\[C91\]'`

**C92** - The customer sheet posts `{ name: 'Atlantic', email: 'ops@atlantic.test', phone: '11999999999', address: { address: 'Rua 1', city: 'Santos', state: 'SP' } }` to `POST /api/customers` and then requests `GET /api/customers` again (AC 27)
Proof: `cd web && npx ng test --watch=false --filter='\[C92\]'`

**C93** - Confirming deletion of vessel `vessel-1` calls `DELETE /api/vessels/vessel-1` and does not call `GET /api/work-orders`. The confirmation description is `Tem certeza que deseja deletar esta embarcação? Essa ação não pode ser desfeita.` and does not contain `ordem de serviço` (AC 32)
Proof: `cd web && npx ng test --watch=false --filter='\[C93\]'`

**C94** - A signed-in user opens Clientes, sees the table (rows or `Nenhum cliente encontrado`), moves the pagination control, and opens the `t-sheet` to create a customer (AC 27, AC 28)
Proof: walk - sign in, open Clientes, read the table or the empty copy, use pagination, open the sheet

**C95** - The layout shows the Organization switcher, and `/invitations/accept?secret=abc` renders the accept form before any submit (AC 29, AC 31)
Proof: walk - read the switcher in the layout and open the invitation accept route until the form is on screen

**C96** - `AGENTS.md` names Angular 22, `web/src/package/<context>/<module>/`, `@Service()`, Signal Forms, the element prefix `t-`, the attribute selectors `button[tButton]` and `table[tTable]`, and `GET /me`. It does not describe the web as `feature/ui/data-access` and it does not say the web calls `whoami` (AC 26, AD-015)
Proof: `node --test --test-name-pattern '\[C96\]' web/test/layout.spec.mjs`

**C97** - The user form does not emit a name of 81 characters or a password of 7 characters. It does emit name `Ana` and password `secret-pass` (Surface `POST /users`: name 1-80, password 8-72)
Proof: `cd web && npx ng test --watch=false --filter='\[C97\]'`

## Coverage

| Set (size) | Member -> proof | Unproven |
| --- | --- | --- |
| use cases, one spec each (24) | `CreateCustomer` C6 · `EditCustomer` C7 · `FetchCustomers` C8 · `GetCustomerById` C9 · `CreateVessel` C10 · `DeleteVessel` C11 · `EditVessel` C12 · `FetchVessels` C13 · `GetVesselById` C14 · `AuthenticateUser` C15 · `GetProfile` C16 (replaces `GetUserById`, AD-015) · `CreateWorkOrder` C17 · `CreateWorkOrderService` C18 · `DeleteWorkOrder` C19 · `DeleteWorkOrderService` C20 · `EditWorkOrder` C21 · `EditWorkOrderService` C22 · `FetchWorkOrderServiceImages` C23 · `FetchWorkOrderServices` C24 · `FetchWorkOrders` C25 · `GetWorkOrderById` C26 · `GetWorkOrderServiceById` C27 · `RemoveWorkOrderServiceImage` C28 · `AddWorkOrderServiceImage` C29; all 24 present: C1 | - |
| in-memory repositories in `api/test/repositories/` (6) | customers · vessels · users · work orders · work order services · work order service images: C3 (table-driven over all 6) | - |
| criteria of S1 (5) | AC 1 C1, C2, C6-C29 · AC 2 C17 · AC 3 C6 · AC 4 C3 · AC 5 C4, C5 | - |
| domain exceptions thrown by use cases (3) | `NotFoundDomainException` C7, C9-C12, C14, C16-C29 · `AlreadyExistsDomainException` C6, C7, C10 · `WrongCredentialsException` C15 | - |
| `api/` assemblies that run the tests (1) | `vitest.config.ts`, the only runner after Jest and ESLint leave: C2, C4 | - |

- Claims naming a thrown exception: every one asserts the class and the message in the same spec.
- Routes and controllers: out of S1, so no status code is claimed here (criterion 10 is S2).
| use cases added by S2 (16 new, replacing `GetUserById`) | `ResolveSession` C47 · `SwitchOrganization` C48 · `GetProfile` C16 · `CreateOrganization` C49 · `FetchOrganizations` C59 · `GetOrganizationById` C59 · `CreateUser` C51 · `FetchOrganizationUsers` C60 · `CountOrganizationRoles` C60 · `FetchUsers` C61 · `SendInvitation` C52 · `ResendInvitation` C53 · `AcceptInvitation` C54 · `FetchInvitations` C62 · `DeliverInvitation` C55 · `RecoverInvitationDeliveries` C57 (16 new use cases; `test/use-case-specs.spec.ts` also fails for any use case without a spec) | - |
| tenant use cases, other-Organization boundary (22 = 4 customer + 5 vessel + 5 work order + 5 service + 3 image) | customer C35 · vessel C36 · work order C37 · service C38 · image C39, each proof tagged per aggregate over every use case of it | - |
| aggregate controllers (9) | `CustomerController` C32, C33 · `VesselController` C32, C33 · `WorkOrderController` C32, C33 · `WorkOrderServiceController` C32, C33 · `WorkOrderServiceImageController` C32, C33 · `AuthenticationController` C32, C33 · `OrganizationController` C32, C33 · `UserController` C32, C33 · `InvitationController` C32, C33 | - |
| repository contracts renamed (8) | `ICustomersRepository` · `IVesselsRepository` · `IWorkOrdersRepository` · `IWorkOrderServicesRepository` · `IWorkOrderServiceImagesRepository` · `IUsersRepository` · `IOrganizationsRepository` · `IInvitationsRepository`: C31 (table-driven over all 8) | - |
| tenant tables with `organizationId` NOT NULL (6) | `customers` · `customer_addresses` · `vessels` · `work_orders` · `work_order_services` · `work_order_service_images`: C42 (table-driven over all 6), index C44 | - |
| Role mapping of existing Users (3) | `MANAGER` C43 · `DEVELOPER` C43 · `USER` C43 | - |
| scoped uniqueness (5) | `vessels.imoNumber` C44, C36 · `customers.email` C44, C35 · `users.email` C44, C51 · `organizations.name` C44, C49 · `organizations.email` C44, C49 | - |
| delivery attempts (3) | attempt 1 C55 · attempt 2 C55 · attempt 3 C55; backoff 5 s C56 · 10 s C56 | - |
| `POST /sessions` statuses (2) | 201 C64 · 401 C33, C64 | - |
| `GET /me` statuses (2) | 200 C16, C64 · 401 C64 | - |
| `POST /organizations/switch` statuses (3) | 204 C48, C64 · 404 C48, C64 · 401 C64 | - |
| `GET /organizations` statuses (4) | 200 C59, C64 · 401 C64 · 403 C50, C64 | - |
| `POST /organizations` statuses (4) | 201 C49, C64 · 409 C49, C33, C64 · 401 C64 · 403 C50 | - |
| `GET /organizations/:id` statuses (4) | 200 C59 · 404 C59, C33 · 401 C64 · 403 C50 | - |
| `GET /organizations/:id/users` statuses (4) | 200 C60 · 404 C60, C33 · 401 C64 · 403 C50 | - |
| `GET /organizations/:id/roles` statuses (4) | 200 C60 · 404 C60, C33 · 401 C64 · 403 C50 | - |
| `GET /organizations/:id/invitations` statuses (4) | 200 C62 · 404 C62, C33 · 401 C64 · 403 C50 | - |
| `GET /users` statuses (3) | 200 C61 · 401 C64 · 403 C50 | - |
| `POST /users` statuses (5) | 201 C51 · 409 C51, C33 · 404 C51, C33 · 401 C64 · 403 C50 | - |
| `POST /invitations` statuses (5) | 201 C52, C64 · 404 C52, C33 · 409 C52, C33 · 401 C64 · 403 C50 | - |
| `POST /invitations/:id/resend` statuses (5) | 200 C53 · 404 C53, C33 · 409 C53, C33 · 401 C64 · 403 C50 | - |
| `POST /invitations/accept` statuses (3) | 200 C54, C64 · 404 C54, C33 · 409 C54, C33, C64 | - |
| the 22 existing routes' statuses (404 for another Organization, 409, 404, 500 on unexpected) | 404 C35-C39, C64 · 409 C35, C36, C64 · 500 C33, C64 | - |
| startup config: Redis, mail, web origin (assemblies that read `process.env`: 1 - the Nest `ConfigModule`; the seed and `prisma.config.ts` read `DATABASE_URL` themselves) | `sharedConfigFactory` C63 | - |
| criteria of S2 (18: AC 6-23) | AC 6 C30, C32 · AC 7 C31 · AC 8 C35-C39, C64 · AC 9 C35, C36, C44, C64 · AC 10 C33, C34, C64 · AC 11 C37, C40, C41 · AC 12 C42, C44, C45 · AC 13 C32, C64, C6-C29 · AC 14 C43, C45 · AC 15 C46 · AC 16 C49, C50, C64 · AC 17 C51, C64 · AC 18 C52, C53, C64 · AC 19 C55, C56, C58, C64 · AC 20 C57, C64 · AC 21 C54, C64 · AC 22 C47, C48, C64 · AC 23 C65, Build | - |
| `@nestjs/*` packages on `^12` (10) | `common` · `core` · `platform-express` · `jwt` · `passport` · `bullmq` · `config` · `testing` · `cli` · `schematics`: C66 (table-driven over all 10) | - |
| entry points that boot the API (2) | `npm run start:prod` C70 · `npm run start:dev` C71 | - |
| assemblies that read the TS config (3: Nest build, `tsc --noEmit` over `src/` and `test/`, Vitest through `resolve.tsconfigPaths`) | build C69 · `tsc --noEmit` C67 · Vitest C72 | - |
| `AGENTS.md` items owed by AC 24a (6: Redis, SMTP and Mailpit, env vars, `prisma db seed`, Vitest, oxlint; plus the layout) | Redis, Mailpit, 7 env vars, seed, Vitest, oxlint, layout: C73 (each its own assertion) | - |
| env vars `AGENTS.md` lists (7) | `REDIS_URL` · `WEB_ORIGIN` · `MAIL_HOST` · `MAIL_PORT` · `MAIL_FROM` · `MAIL_USER` · `MAIL_PASS`: C73 | - |
| `CONTEXT.md` terms added (4) | Organization · Membership · Role · Invitation: C74 | - |
| `CONTEXT.md` terms kept (7) | User · Customer · Vessel · IMO number · WorkOrder · WorkOrderService · WorkOrderServiceImage: C74 | - |
| stale statements removed from `AGENTS.md` (9) | `core/interface` · `core/entity` · `http/rest` · `persistence.module` · `CommonJS` · `tsc-alias` · `dist/src/main.js` · `Jest` · `whoami`: C73 (the list also holds `core/use-case`, `core/exception`, `persistence/`, `PersistenceModule`, `ts-loader`, `NestJS 11`, `create the first User by hand`) | - |
| criteria of S3 (3: AC 24, 24a, 25) | AC 24 C66-C68, C71, C72 · AC 24a C73-C76 · AC 25 C69, C70 | - |
| `@angular/*` packages on `^22` (9) | `core` C77 · `common` C77 · `compiler` C77 · `forms` C77 · `platform-browser` C77 · `router` C77 · `build` C77 · `cli` C77 · `compiler-cli` C77 | - |
| web modules with a page, `components/` and `@Service()` (9) | `customer/customer` C78 · `customer/vessel` C78 · `work-order/work-order` C78 · `work-order/work-order-service` C78 · `work-order/work-order-service-image` C78 · `identity/authentication` C78 · `identity/organization` C78 · `identity/user` C78 · `identity/invitation` C78 | - |
| shared selectors (8) | `t-sheet` C79 · `t-pagination` C79 · `t-confirmation` C79 · `t-skeleton` C79 · `t-toaster` C79 · `table[tTable]` C79 · `button[tButton]` C79 · `a[tButton]` C79 | - |
| Signal Forms (8) | authentication C81 · customer C81 · vessel C81 · work order C81 · work order service C81 · organization C81 · user C81 · invitation C81 | - |
| list empty copy (4) | `Nenhum cliente encontrado` C83, C90 · `Nenhuma embarcação encontrada` C83, C91 · `Nenhuma ordem de serviço` C83 · `Nenhum serviço executado` C83 | - |
| `POST /sessions` on the web (2) | 201 C84 · 401 C84 | - |
| `GET /me` on the web (1) | 200 C85 | - |
| `POST /organizations/switch` on the web (1) | 204 C85 | - |
| Organizations screen for a non-administrator (2) | internal `operator` C86 · non-internal `administrator` C86 | - |
| `POST /invitations/accept` on the web (3) | 200 C89 · 404 C89 · 409 C89 | - |
| web routes of S4 (8) | `/auth` C84, C94 · `/customers` C90, C92, C94 · `/vessels` C91 · `/work-orders/:id` C91 · `/organizations` C86, C87 · `/organizations/:id` C88 · `/invitations/accept` C89, C95 · `/forbidden` C86 | - |
| criteria of S4 (7: AC 26-32) | AC 26 C77-C82, C96, Build · AC 27 C83, C84, C91, C92, C94 · AC 28 C90, C94 · AC 29 C85, C95 · AC 30 C86, C87, C88 · AC 31 C89, C95 · AC 32 C83, C91, C93 | - |

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

S2 sweep (C30-C65):

- validation: C63 (config), C52 (invitation conflicts), controllers keep Zod schemas (C33 maps the failures)
- failure modes: C52 (queue down keeps the row), C55 (attempts 1-3, 5 s timeout), C56 (2 s enqueue timeout), C57 (one enqueue throws), C64 (Redis down, PostgreSQL down)
- idempotency: C53 (resend), C54 (second accept), C56 (`jobId` = Invitation id), C46 (seed twice)
- authorization: C50, C64 (internal Administrator guard), C47 (session from the Membership), C35-C39 (other-Organization boundary)
- concurrency: C44 (database unique indexes decide races, not a read-then-write check); the race itself is not exercised
- data lifecycle: C42, C43 (backfill), C45 (no drift), C54 (accept keeps earlier Memberships)
- dependency failure: C52, C57, C64
- state transitions: C52, C53, C54, C55 (pending/accepted, queued/delivered/failed)
- observability: n/a - no logging requirement in the plan

S3 sweep (C66-C76):

- validation: n/a - S3 adds no input; the config schema is unchanged (C63)
- failure modes: C70 (the image read back is the one that was written, same bytes)
- idempotency: n/a - a build and a boot change no stored data
- authorization: existing - C64 walks 401 and 403; C70 and C71 assert 401 on `/me` without a token
- concurrency: n/a - no shared state is added
- data lifecycle: C70 (an image uploaded under `start:prod` is still served by `start:dev` after a restart)
- dependency failure: existing - C64 stops Redis and PostgreSQL; C70 boots against the real three
- state transitions: n/a - none added
- observability: n/a - no logging requirement in the plan

S4 sweep (C77-C96):

- validation: C81 (Signal Forms required and email), C84 (the posted body), C92 (the customer body), C97 (name 1-80, password 8-72)
- failure modes: C84 (401), C89 (404 and 409), C86 (forbidden)
- idempotency: n/a - the web does not retry a write; a second accept is the API 409 the page shows (C89)
- authorization: C86 (internal Administrator), C82 (session from `GET /me`, no Organization in the query)
- concurrency: n/a - a switch reloads the page (C85); the web keeps no second copy of another Organization's rows
- data lifecycle: C92 (the created customer is requested again), C93 (deleting a vessel is not refused in the web because of work orders)
- dependency failure: C84 and C89 (the API's English message is shown in Portuguese)
- state transitions: n/a - S4 adds no WorkOrder status guard; the web posts the status the form holds
- observability: n/a - no logging requirement in the plan

## Handoff

- **Settled mid-build:** none
- **Dispatched:** Verifier (independent sub-agent) for S1 at `HEAD` 3a4e826 plus the uncommitted working tree (the user forbade commits this turn) - returned: 5 findings, all fixed in the working tree
- **Dispatched (S2):** Verifier (independent sub-agent) for S2 at `HEAD` after this commit, diff range acf4b70..HEAD - not returned yet
- **Boundary:** C1-C29 closed at `acf4b70`; `proofs.md` green at that `HEAD`, 6 of 6 mutations killed, gate green; S2 (C30-C65) built in commits 9f01b8a, 6adaaa6, c831cfa, 2c77df9
- **Settled mid-build (S2):** `POST /invitations/accept` must carry `@Public()` (found by C64, not by any unit proof); `GET /work-orders/:id` answers 404 `Vessel not found` for a work order whose Vessel is gone; the migration creates Organization "Umbrielship" only when data exists (plan, Found while building S2)
- **Boundary (S3):** C66-C76 built in commits 414d36c (NestJS 12, ESM), 394de41 (strict), 5029aae (documents); lint, test and build green at each; `boot-smoke.sh` and `api-smoke.sh` green on ESM
- **Dispatched (S3):** Verifier (independent sub-agent) at `HEAD` after this commit, diff range 7669127..HEAD - not returned yet
- **Abandoned:** none; C21 was reworded before the build closed: it first claimed `vesselId` is kept, but `EditWorkOrderUseCase` reads it from a detail entity that never carries it (see the plan, criterion 13); the claim now says "under the same `id`"
- **Boundary (S4 checks):** C77-C96 frozen before the web build. Context7 tools are not in this session. The table selector is `table[tTable]`, not an element `t-table`. The folder is `web/src/package/`, as criterion 26 writes it.
- **Walked:** Signed in at `/auth` with the seeded administrator, which stored the token and opened `/dashboard`. The layout read `/me` and showed `Umbrielship` (one Membership, so the switcher is the name, with no menu) beside the user `Administrator`. Clientes opened on an empty table, `Nenhum cliente encontrado`, with pagination on page `1`. The `t-sheet` "Novo cliente" submitted Atlantic / ops@atlantic.test and the row came back (`Rua 1, Santos , SP`). Eleven customers still left the control on page `1`, because the API `total` for `page` stays the known defect in ROADMAP item 7. Administração opened the Organizations table with `Umbrielship`. `/invitations/accept?secret=abc` rendered "Aceitar convite" and the explanation before any submit. A second Organization was not picked: the signed-in user holds one Membership.
- **Dispatched:** Verifier (independent sub-agent) for S4 at `HEAD` 8b4faac, diff range db56a20..8b4faac (web commits 1ed573e, db56a20, 47c3e32, 606bd01, 8b4faac) - not returned yet
