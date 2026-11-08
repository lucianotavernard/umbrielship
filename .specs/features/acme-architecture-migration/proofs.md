# acme-architecture-migration proofs

**HEAD**: 3a4e826
**Tree**: dirty - api/eslint.config.mjs, api/package-lock.json, api/package.json, api/src/customer/core/use-case/edit-customer.use-case.ts, api/test/app.e2e-spec.ts
**Result**: 31 pass, 0 fail; mutations 6 killed, 0 not

| Check | Proof | Ran | Passed | Result |
| --- | --- | --- | --- | --- |
| C1 | `cd api && npx vitest run test/use-case-specs.spec.ts -t "\[C1\]"` | 1 | 1 | pass |
| C2 | `cd api && env -u DATABASE_URL -u JWT_SECRET npm run test` | 26 | - | pass |
| C3 | `cd api && npx vitest run test/tooling.spec.ts -t "\[C3\]"` | 1 | 1 | pass |
| C4 | `cd api && npx vitest run test/tooling.spec.ts -t "\[C4\]"` | 1 | 1 | pass |
| C5 | `cd api && npm run lint` | count unknown | - | pass |
| C6 | `cd api && npx vitest run src/customer/core/use-case/create-customer.use-case.spec.ts -t "\[C6\]"` | 2 | 2 | pass |
| C7 | `cd api && npx vitest run src/customer/core/use-case/edit-customer.use-case.spec.ts -t "\[C7\]"` | 7 | 7 | pass |
| C8 | `cd api && npx vitest run src/customer/core/use-case/fetch-customers.use-case.spec.ts -t "\[C8\]"` | 1 | 1 | pass |
| C9 | `cd api && npx vitest run src/customer/core/use-case/get-customer-by-id.use-case.spec.ts -t "\[C9\]"` | 2 | 2 | pass |
| C10 | `cd api && npx vitest run src/customer/core/use-case/create-vessel.use-case.spec.ts -t "\[C10\]"` | 5 | 5 | pass |
| C11 | `cd api && npx vitest run src/customer/core/use-case/delete-vessel.use-case.spec.ts -t "\[C11\]"` | 2 | 2 | pass |
| C12 | `cd api && npx vitest run src/customer/core/use-case/edit-vessel.use-case.spec.ts -t "\[C12\]"` | 3 | 3 | pass |
| C13 | `cd api && npx vitest run src/customer/core/use-case/fetch-vessels.use-case.spec.ts -t "\[C13\]"` | 4 | 4 | pass |
| C14 | `cd api && npx vitest run src/customer/core/use-case/get-vessel-by-id.use-case.spec.ts -t "\[C14\]"` | 2 | 2 | pass |
| C15 | `cd api && npx vitest run src/identity/core/use-case/authenticate-user.use-case.spec.ts -t "\[C15\]"` | 3 | 3 | pass |
| C16 | `cd api && npx vitest run src/identity/core/use-case/get-user-by-id.use-case.spec.ts -t "\[C16\]"` | 2 | 2 | pass |
| C17 | `cd api && npx vitest run src/work-order/core/use-case/create-work-order.use-case.spec.ts -t "\[C17\]"` | 2 | 2 | pass |
| C18 | `cd api && npx vitest run src/work-order/core/use-case/create-work-order-service.use-case.spec.ts -t "\[C18\]"` | 2 | 2 | pass |
| C19 | `cd api && npx vitest run src/work-order/core/use-case/delete-work-order.use-case.spec.ts -t "\[C19\]"` | 2 | 2 | pass |
| C20 | `cd api && npx vitest run src/work-order/core/use-case/delete-work-order-service.use-case.spec.ts -t "\[C20\]"` | 3 | 3 | pass |
| C21 | `cd api && npx vitest run src/work-order/core/use-case/edit-work-order.use-case.spec.ts -t "\[C21\]"` | 2 | 2 | pass |
| C22 | `cd api && npx vitest run src/work-order/core/use-case/edit-work-order-service.use-case.spec.ts -t "\[C22\]"` | 3 | 3 | pass |
| C23 | `cd api && npx vitest run src/work-order/core/use-case/fetch-work-order-service-images.use-case.spec.ts -t "\[C` | 3 | 3 | pass |
| C24 | `cd api && npx vitest run src/work-order/core/use-case/fetch-work-order-services.use-case.spec.ts -t "\[C24\]"` | 2 | 2 | pass |
| C25 | `cd api && npx vitest run src/work-order/core/use-case/fetch-work-orders.use-case.spec.ts -t "\[C25\]"` | 4 | 4 | pass |
| C26 | `cd api && npx vitest run src/work-order/core/use-case/get-work-order-by-id.use-case.spec.ts -t "\[C26\]"` | 2 | 2 | pass |
| C27 | `cd api && npx vitest run src/work-order/core/use-case/get-work-order-service-by-id.use-case.spec.ts -t "\[C27\` | 3 | 3 | pass |
| C28 | `cd api && npx vitest run src/work-order/core/use-case/remove-work-order-service-image.use-case.spec.ts -t "\[C` | 9 | 9 | pass |
| C29 | `cd api && npx vitest run src/work-order/core/use-case/add-work-order-service-image.use-case.spec.ts -t "\[C29\` | 3 | 3 | pass |
| Build | `cd api && npm run build` | - | - | pass |
| Build | `cd api && npm run lint` | - | - | pass |

## Mutations

| Mutation | Location | Killed |
| --- | --- | --- |
| remove image: EPERM swallowed along with ENOENT | `api/src/work-order/core/use-case/remove-work-order-service-image.use-case.ts:55` | yes |
| remove image: image-belongs-to-service guard dropped | `api/src/work-order/core/use-case/remove-work-order-service-image.use-case.ts:43` | yes |
| edit customer: address merge -> replace | `api/src/customer/core/use-case/edit-customer.use-case.ts:52` | yes |
| edit service: ownership guard dropped | `api/src/work-order/core/use-case/edit-work-order-service.use-case.ts:38` | yes |
| get service: ownership guard dropped | `api/src/work-order/core/use-case/get-work-order-service-by-id.use-case.ts:31` | yes |
| create vessel: duplicate IMO ignored for empty customerId | `api/src/customer/core/use-case/create-vessel.use-case.ts:38` | yes |
