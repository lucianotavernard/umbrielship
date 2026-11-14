# Inspector Role checks

Build: `cd api && npm run lint`; `cd api && npm run build`; `cd web && npm run build`
Run api: `cd api && npx vitest run --reporter=verbose`
Run web: `cd web && npx ng test --watch=false --reporters=verbose --include='**/*.inspector.spec.ts'`
Plan: `.specs/features/inspector-role/plan.md`

31 checks in 2 slices · 2 one-way doors · 0 open, of which 0 block

## Checks

### S1 - A User can be an inspector, and the API refuses its writes

**C1** - `POST /users` with `role: "inspector"` answers 201 and hands Role `inspector` on; `role: "auditor"` answers 400 (AC 1)
Proof: run api | ✓ roles.guard.spec.ts > inspector C1 POST /users accepts role inspector and refuses auditor

**C2** - Creating a User with Role `inspector` stores the Membership with that Role, in an ordinary and in the internal Organization (AC 1)
Proof: run api | ✓ create-user.use-case.spec.ts > inspector C2 stores a Membership with Role inspector in an ordinary and in the internal Organization

**C3** - `POST /invitations` with `role: "inspector"` answers 201 and hands Role `inspector` on (AC 2)
Proof: run api | ✓ roles.guard.spec.ts > inspector C3 POST /invitations accepts role inspector

**C4** - Accepting an Invitation with Role `inspector` stores the Membership with Role `inspector` (AC 2)
Proof: run api | ✓ accept-invitation.use-case.spec.ts > inspector C4 accepting an inspector Invitation stores the Membership with Role inspector

**C5** - The session of a User whose active Membership is `inspector` carries `role: "inspector"`, and `GET /me` returns it (AC 3)
Proof: run api | ✓ resolve-session.use-case.spec.ts > inspector C5 resolves role inspector from the active Membership
Proof: run api | ✓ get-profile.use-case.spec.ts > inspector C5 returns role inspector for the active Organization and its Membership

**C6** - `GET /organizations/:id/roles` lists exactly `administrator`, `operator`, `inspector` in that order, with `users: 0` for an Organization with no inspector (AC 4)
Proof: run api | ✓ count-organization-roles.use-case.spec.ts > inspector C6 lists administrator, operator and inspector in that order with zero inspectors

**C7** - Each of the 14 write routes answers 403 to an `inspector` and calls no use case (AC 5)
Proof: run api | ✓ roles.guard.spec.ts > inspector C7 refuses each of the 14 write routes to an inspector with 403 and calls no use case

**C8** - An `inspector` gets 403, not 400, for an invalid body, and 403, not 404, for an id of another Organization (AC 5)
Proof: run api | ✓ roles.guard.spec.ts > inspector C8 answers 403 before validation and before any read

**C9** - An image upload by an `inspector` answers 403 and writes no file under `uploads/work-order-service-images/` (AC 5)
Proof: run api | ✓ roles.guard.spec.ts > inspector C9 writes no file when an inspector uploads an image

**C10** - Each of the 14 write routes lets `administrator` and `operator` through to its use case (AC 6)
Proof: run api | ✓ roles.guard.spec.ts > inspector C10 lets administrator and operator through each of the 14 write routes

**C11** - Each of the 9 read routes of `customer` and `work-order` lets an `inspector` through to its use case (AC 7)
Proof: run api | ✓ roles.guard.spec.ts > inspector C11 lets an inspector through each of the 9 read routes

**C12** - After a switch, the session's Role is the Role of the new active Membership: inspector in A, operator in B, active B → `operator` (AC 8)
Proof: run api | ✓ resolve-session.use-case.spec.ts > inspector C12 resolves the Role of the newly active Membership after a switch
Proof: run api | ✓ roles.guard.spec.ts > inspector C12 lets an operator create a Customer

**C13** - `InternalAdministratorGuard` refuses an inspector of the internal Organization with 403 (AC 9)
Proof: run api | ✓ internal-administrator.guard.spec.ts > inspector C13 throws ForbiddenException for an internal inspector

**C14** - The 403 of a write route has the body `{ statusCode: 403, message: "Forbidden" }` (AC 10)
Proof: run api | ✓ roles.guard.spec.ts > inspector C14 answers 403 with statusCode 403 and message Forbidden

**C15** - The suite fails when a `POST`, `PUT` or `DELETE` handler under `customer` or `work-order` declares no Roles (AC 11)
Proof: run api | ✓ layout.spec.ts > inspector C15 every POST, PUT and DELETE handler under customer and work-order declares Roles

**C16** - `CONTEXT.md` lists `inspector` in the Role entry with what it may do, and `AGENTS.md` names the three Roles (AC 12)
Proof: run api | ✓ docs.spec.ts > inspector C16 CONTEXT.md and AGENTS.md name the three Roles

**C17** - The schema's enum `role` has `inspector`, added by a migration named `add_inspector_role` (door 1)
Proof: `grep -q "ADD VALUE 'inspector'" api/src/package/shared/module/prisma/migrations/*_add_inspector_role/migration.sql && grep -Eq "^\s+inspector$" api/src/package/shared/module/prisma/schema.prisma`

**C18** - The Invitation email names the Role `inspector` as "Inspetor" (AC 13)
Proof: run api | ✓ email-invitation-delivery.spec.ts > inspector C18 names the inspector Role Inspetor in the email

**C30** - The statuses that do not change still answer: `GET /me` without a token 401, `POST /invitations` with `role: "auditor"` 400, `GET /organizations/:id/roles` to an administrator of an ordinary Organization 403 (Surface)
Proof: run api | ✓ roles.guard.spec.ts > inspector C30 keeps the statuses of /me, /invitations and /organizations/:id/roles

### S2 - The web shows the Role and hides what an inspector cannot do

**C19** - The Papel select of the User form and of the Invitation form offers "Administrador", "Operador", "Inspetor" in that order, and submitting "Inspetor" sends `role: "inspector"` (AC 13, 14)
Proof: run web | ✓ user-form.inspector.spec.ts > inspector C19 offers Administrador, Operador and Inspetor and sends role inspector
Proof: run web | ✓ organization-detail.inspector.spec.ts > inspector C19 the Invitation form offers Inspetor and sends role inspector
Proof: run web | ✓ organization-detail.inspector.spec.ts > inspector C19 the User form posts role inspector to POST /users

**C20** - Organization detail shows the badge "Inspetor" for an inspector in the Users list and renders no Role counts (AC 14, 15)
Proof: run web | ✓ organization-detail.inspector.spec.ts > inspector C20 shows the Inspetor badge and no Role counts

**C21** - The Organization switcher shows "Inspetor" under an Organization where the Membership is `inspector` (AC 16)
Proof: run web | ✓ internal-layout.inspector.spec.ts > inspector C21 the switcher shows Inspetor under the Organization

**C22** - For an inspector, the Customers page renders no "Novo cliente" control and no "Excluir" on a row (AC 17)
Proof: run web | ✓ customer-list.inspector.spec.ts > inspector C22 renders no write control for an inspector

**C23** - For an inspector, Customer detail renders no control that edits or deletes the Customer, opens "Nova embarcação" or deletes a Vessel (AC 18)
Proof: run web | ✓ customer-detail.inspector.spec.ts > inspector C23 renders no write control for an inspector

**C24** - For an inspector, the Vessels page renders no "Nova embarcação" control and no "Excluir" on a row (AC 19)
Proof: run web | ✓ vessel-list.inspector.spec.ts > inspector C24 renders no write control for an inspector

**C25** - For an inspector, Vessel detail renders no control that edits or deletes the Vessel, opens "Nova ordem" or deletes a WorkOrder (AC 20)
Proof: run web | ✓ vessel-detail.inspector.spec.ts > inspector C25 renders no write control for an inspector

**C26** - For an inspector, WorkOrder detail renders no control that edits the WorkOrder, opens "Novo serviço" or sends an image (AC 21)
Proof: run web | ✓ work-order-detail.inspector.spec.ts > inspector C26 renders no write control for an inspector

**C27** - For an operator and an administrator, the pages of C22 to C26 render every write control they render today (AC 22)
Proof: run web | ✓ write-access.inspector.spec.ts > inspector C27 the five pages render their write controls for an operator and an administrator

**C28** - For an inspector, the pages of C22 to C26 show the same lists, details and images an operator sees (AC 23)
Proof: run web | ✓ write-access.inspector.spec.ts > inspector C28 the five pages show the same content to an inspector as to an operator

**C29** - The Role that decides the controls is the one `GET /me` returns after the switch reloads the page: operator in A, inspector in B, after switching to B no write control renders (AC 24)
Proof: run web | ✓ internal-layout.inspector.spec.ts > inspector C29 the session Role follows GET /me after an Organization switch

**C31** - While the session's Role is not loaded (`null`) or is not `administrator` or `operator` (`auditor`), the pages of C22 to C26 render no write control (AC 25)
Proof: run web | ✓ write-access.inspector.spec.ts > inspector C31 the five pages render no write control while the Role is not loaded or is not a writer

## Coverage

| Set (size) | Member -> proof | Unproven |
| --- | --- | --- |
| write routes refused to `inspector`, AC 5 (14) | C7, table-driven over all 14 | - |
| write routes open to `administrator` and `operator`, AC 6 (28) | C10, table-driven over all 28: 14 routes for each of the 2 Roles | - |
| read routes of `customer` and `work-order`, AC 7 (9) | C11, table-driven over all 9 | - |
| AC 5 examples (4) | valid body C7 · invalid body C8 · id of another Organization C8 · upload writes no file C9 | - |
| AC 1 examples (3) | ordinary Organization C2 · internal Organization C2 · `auditor` → 400 C1 | - |
| Role readers in the API (6) | `POST /users` Zod C1 · `POST /invitations` Zod C3 · session `UserPayload` C5 · `CountOrganizationRolesUseCase` C6 · `InternalAdministratorGuard` C13 · Invitation email label C18 | - |
| Role readers in the web (4) | User form C19 · Invitation form C19 · Users list badge C20 · switcher C21 | - |
| session Role values on the five pages (5) | `administrator` C27 · `operator` C27 · `inspector` C22 · not loaded C31 · unknown C31 | - |
| pages with write controls, AC 17-21 (5) | `customers` C22 · `customers/:id` C23 · `vessels` C24 · `vessels/:id` C25 · `work-orders/:id` C26 | - |
| `POST /users` statuses (3) | 201 C1 · 400 C1 · 403 C13 | - |
| `POST /invitations` statuses (3) | 201 C3 · 400 C30 · 403 C13 | - |
| `GET /me` statuses (2) | 200 C5 · 401 C30 | - |
| `GET /organizations/:id/roles` statuses (2) | 200 C6 · 403 C30 | - |
| write routes statuses, new (1) | 403 C7, C14 | - |
| one-way doors (2) | enum `role` gains `inspector` C17 · route-declared Roles C15, C7 | - |
| startup config: Roles guard (2 assemblies) | `AuthModule` imported by `AppModule` C7 (the spec boots `AuthModule`'s guard order) · test harness C7 | - |

## Swept

- validation: C8 - Role is checked before the body is validated
- failure modes: C9 - a refused upload leaves no file behind
- idempotency: n/a - no write is added
- authorization: C7, C10, C11, C13
- concurrency: n/a - the Role is read once per request from the session resolved for it
- data lifecycle: C17 - the enum gains a value, no row changes
- dependency failure: n/a - no external call
- state transitions: C12, C29 - the Role follows the active Membership
- observability: n/a - no logging requirement in this slice

## Handoff

- **Settled mid-build:** user: "Commit separado antes (Recomendado)" - the owner's in-flight work is committed on `feat/inspector-role` as `bb26f6d`, before this feature. user: "Isolar os testes do S2 (Recomendado)" - 9 web tests in the owner's in-flight specs (customer-list, customer-detail, vessel-detail, work-order-detail) were red before this feature; S2's tests live in `*.inspector.spec.ts` files and `Run web` selects only those, so the 9 stay as they are for the owner. user: "Retirar do plano (Recomendado)" - Organization detail shows no Role counts today, so AC 15 and C20 now hold that it still shows none. user: "Seguir o plano (Recomendado)" - the Papel select order becomes Administrador, Operador, Inspetor (it was Operador, Administrador); the default stays Operador. Verifier findings 1-2: `canWrite` now uses the writer allow-list, so the owner's specs that click write controls (customer-list, customer-detail, vessel-list, vessel-detail, work-order-detail) set an `operator` session in their setup; their assertions are unchanged
- **Dispatched:** Verifier at `6be756e` (no screens sub-agent: no criterion cites a capture)
- **Boundary:** C1-C30 closed at `6be756e`
- **Abandoned:** none
