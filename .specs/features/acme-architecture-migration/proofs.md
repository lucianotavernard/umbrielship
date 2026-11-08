# acme-architecture-migration proofs

**HEAD**: 3601caa
**Tree**: dirty - .cursor/skills/, CONTEXT.md, ROADMAP.md
**Result**: 67 pass, 0 fail; mutations 5 killed, 1 not

| Check | Proof | Ran | Passed | Result |
| --- | --- | --- | --- | --- |
| C1 | `cd api && npx vitest run test/use-case-specs.spec.ts -t "\[C1\]"` | 1 | 1 | pass |
| C2 | `cd api && env -u DATABASE_URL -u JWT_SECRET npm run test` | 54 | - | pass |
| C3 | `cd api && npx vitest run test/tooling.spec.ts -t "\[C3\]"` | 1 | 1 | pass |
| C4 | `cd api && npx vitest run test/tooling.spec.ts -t "\[C4\]"` | 1 | 1 | pass |
| C5 | `cd api && npm run lint` | count unknown | - | pass |
| C6 | `cd api && npx vitest run src/package/customer/customer/__test__/create-customer.use-case.spec.ts -t "\[C6\]"` | 2 | 2 | pass |
| C7 | `cd api && npx vitest run src/package/customer/customer/__test__/edit-customer.use-case.spec.ts -t "\[C7\]"` | 7 | 7 | pass |
| C8 | `cd api && npx vitest run src/package/customer/customer/__test__/fetch-customers.use-case.spec.ts -t "\[C8\]"` | 1 | 1 | pass |
| C9 | `cd api && npx vitest run src/package/customer/customer/__test__/get-customer-by-id.use-case.spec.ts -t "\[C9\]` | 2 | 2 | pass |
| C10 | `cd api && npx vitest run src/package/customer/vessel/__test__/create-vessel.use-case.spec.ts -t "\[C10\]"` | 5 | 5 | pass |
| C11 | `cd api && npx vitest run src/package/customer/vessel/__test__/delete-vessel.use-case.spec.ts -t "\[C11\]"` | 2 | 2 | pass |
| C12 | `cd api && npx vitest run src/package/customer/vessel/__test__/edit-vessel.use-case.spec.ts -t "\[C12\]"` | 3 | 3 | pass |
| C13 | `cd api && npx vitest run src/package/customer/vessel/__test__/fetch-vessels.use-case.spec.ts -t "\[C13\]"` | 4 | 4 | pass |
| C14 | `cd api && npx vitest run src/package/customer/vessel/__test__/get-vessel-by-id.use-case.spec.ts -t "\[C14\]"` | 2 | 2 | pass |
| C15 | `cd api && npx vitest run src/package/identity/auth/__test__/authenticate-user.use-case.spec.ts -t "\[C15\]"` | 3 | 3 | pass |
| C16 | `cd api && npx vitest run src/package/identity/auth/__test__/get-profile.use-case.spec.ts -t "\[C16\]"` | 3 | 3 | pass |
| C17 | `cd api && npx vitest run src/package/work-order/work-order/__test__/create-work-order.use-case.spec.ts -t "\[C` | 2 | 2 | pass |
| C18 | `cd api && npx vitest run src/package/work-order/work-order-service/__test__/create-work-order-service.use-case` | 2 | 2 | pass |
| C19 | `cd api && npx vitest run src/package/work-order/work-order/__test__/delete-work-order.use-case.spec.ts -t "\[C` | 2 | 2 | pass |
| C20 | `cd api && npx vitest run src/package/work-order/work-order-service/__test__/delete-work-order-service.use-case` | 3 | 3 | pass |
| C21 | `cd api && npx vitest run src/package/work-order/work-order/__test__/edit-work-order.use-case.spec.ts -t "\[C21` | 2 | 2 | pass |
| C22 | `cd api && npx vitest run src/package/work-order/work-order-service/__test__/edit-work-order-service.use-case.s` | 3 | 3 | pass |
| C23 | `cd api && npx vitest run src/package/work-order/work-order-service-image/__test__/fetch-work-order-service-ima` | 3 | 3 | pass |
| C24 | `cd api && npx vitest run src/package/work-order/work-order-service/__test__/fetch-work-order-services.use-case` | 2 | 2 | pass |
| C25 | `cd api && npx vitest run src/package/work-order/work-order/__test__/fetch-work-orders.use-case.spec.ts -t "\[C` | 4 | 4 | pass |
| C26 | `cd api && npx vitest run src/package/work-order/work-order/__test__/get-work-order-by-id.use-case.spec.ts -t "` | 2 | 2 | pass |
| C27 | `cd api && npx vitest run src/package/work-order/work-order-service/__test__/get-work-order-service-by-id.use-c` | 3 | 3 | pass |
| C28 | `cd api && npx vitest run src/package/work-order/work-order-service-image/__test__/remove-work-order-service-im` | 9 | 9 | pass |
| C29 | `cd api && npx vitest run src/package/work-order/work-order-service-image/__test__/add-work-order-service-image` | 3 | 3 | pass |
| C30 | `cd api && npx vitest run test/layout.spec.ts -t "\[C30\]"` | 2 | 2 | pass |
| C31 | `cd api && npx vitest run test/layout.spec.ts -t "\[C31\]"` | 1 | 1 | pass |
| C32 | `cd api && npx vitest run test/layout.spec.ts -t "\[C32\]"` | 2 | 2 | pass |
| C33 | `cd api && npx vitest run src/package -t "\[C33\]"` | 4 | 4 | pass |
| C34 | `cd api && npx vitest run test/layout.spec.ts -t "\[C34\]"` | 1 | 1 | pass |
| C35 | `cd api && npx vitest run src/package/customer/customer/ -t "\[C35\]"` | 5 | 5 | pass |
| C36 | `cd api && npx vitest run src/package/customer/vessel/ -t "\[C36\]"` | 5 | 5 | pass |
| C37 | `cd api && npx vitest run src/package/work-order/work-order/ -t "\[C37\]"` | 4 | 4 | pass |
| C38 | `cd api && npx vitest run src/package/work-order/work-order-service/ -t "\[C38\]"` | 1 | 1 | pass |
| C39 | `cd api && npx vitest run src/package/work-order/work-order-service-image/ -t "\[C39\]"` | 2 | 2 | pass |
| C40 | `cd api && npx vitest run src/package/customer/__test__/customer.facade.spec.ts -t "\[C40\]"` | 2 | 2 | pass |
| C41 | `cd api && npx vitest run test/layout.spec.ts -t "\[C41\]"` | 1 | 1 | pass |
| C42 | `bash api/test/db/migration-check.sh backfill` | count unknown | - | pass |
| C43 | `bash api/test/db/migration-check.sh roles` | count unknown | - | pass |
| C44 | `bash api/test/db/migration-check.sh constraints` | count unknown | - | pass |
| C45 | `bash api/test/db/migration-check.sh drift` | count unknown | - | pass |
| C46 | `bash api/test/db/migration-check.sh seed` | count unknown | - | pass |
| C47 | `cd api && npx vitest run src/package/identity/auth/__test__/resolve-session.use-case.spec.ts -t "\[C47\]"` | 3 | 3 | pass |
| C48 | `cd api && npx vitest run src/package/identity/auth/__test__/switch-organization.use-case.spec.ts -t "\[C48\]"` | 2 | 2 | pass |
| C49 | `cd api && npx vitest run src/package/identity/organization/__test__/create-organization.use-case.spec.ts -t "\` | 3 | 3 | pass |
| C50 | `cd api && npx vitest run src/package/identity/organization/__test__/internal-administrator.guard.spec.ts -t "\` | 4 | 4 | pass |
| C51 | `cd api && npx vitest run src/package/identity/user/__test__/create-user.use-case.spec.ts -t "\[C51\]"` | 3 | 3 | pass |
| C52 | `cd api && npx vitest run src/package/identity/invitation/__test__/send-invitation.use-case.spec.ts -t "\[C52\]` | 4 | 4 | pass |
| C53 | `cd api && npx vitest run src/package/identity/invitation/__test__/resend-invitation.use-case.spec.ts -t "\[C53` | 4 | 4 | pass |
| C54 | `cd api && npx vitest run src/package/identity/invitation/__test__/accept-invitation.use-case.spec.ts -t "\[C54` | 3 | 3 | pass |
| C55 | `cd api && npx vitest run src/package/identity/invitation/__test__/deliver-invitation.use-case.spec.ts -t "\[C5` | 10 | 10 | pass |
| C56 | `cd api && npx vitest run src/package/identity/invitation/__test__/invitation-delivery-queue.spec.ts -t "\[C56\` | 3 | 3 | pass |
| C57 | `cd api && npx vitest run src/package/identity/invitation/__test__/recover-invitation-deliveries.use-case.spec.` | 4 | 4 | pass |
| C58 | `cd api && npx vitest run src/package/identity/invitation/__test__/email-invitation-delivery.spec.ts src/packag` | 5 | 5 | pass |
| C59 | `cd api && npx vitest run src/package/identity/organization/__test__ -t "\[C59\]"` | 3 | 3 | pass |
| C60 | `cd api && npx vitest run src/package/identity/user/__test__ -t "\[C60\]"` | 4 | 4 | pass |
| C61 | `cd api && npx vitest run src/package/identity/user/__test__/fetch-users.use-case.spec.ts -t "\[C61\]"` | 1 | 1 | pass |
| C62 | `cd api && npx vitest run src/package/identity/invitation/__test__/fetch-invitations.use-case.spec.ts -t "\[C62` | 2 | 2 | pass |
| C63 | `cd api && npx vitest run src/package/shared/module/config/__test__/shared-config.spec.ts -t "\[C63\]"` | 7 | 7 | pass |
| C64 | `bash api/test/smoke/api-smoke.sh` | count unknown | - | pass |
| C65 | `cd api && env -u DATABASE_URL -u JWT_SECRET -u REDIS_URL npm run test` | 54 | - | pass |
| Build | `cd api && npm run build` | - | - | pass |
| Build | `cd api && npm run lint` | - | - | pass |

## Mutations

| Mutation | Location | Killed |
| --- | --- | --- |
| switch organization: membership check dropped | `api/src/package/identity/auth/switch-organization.use-case.ts:25` | yes |
| internal guard: administrator role check dropped | `api/src/package/identity/organization/internal-administrator.guard.ts:17` | yes |
| delivery: third failure no longer records failed (bound shifted by one) | `api/src/package/identity/invitation/deliver-invitation.use-case.ts:92` | yes |
| send invitation: internal Organization accepted | `api/src/package/identity/invitation/send-invitation.use-case.ts:59` | yes |
| accept invitation: already-accepted 409 guard dropped | `api/src/package/identity/invitation/accept-invitation.use-case.ts:30` | no |
| backoff: first retry waits 10 s instead of 5 s | `api/src/package/identity/invitation/invitation-delivery.queue.ts:25` | yes |
