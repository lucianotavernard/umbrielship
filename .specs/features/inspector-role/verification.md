# Inspector Role verification

**Verdict**: PASS
**Proofs**: `proofs.md` at d61623e
**Verifier**: independent sub-agent (author != verifier)

## Checks

| Check | Test | Holds |
| --- | --- | --- |
| C1 | `roles.guard.spec.ts` `inspector C1 POST /users accepts role inspector and refuses auditor` | yes - 201 and `role: 'inspector'` handed to the use case over HTTP; `auditor` 400 |
| C2 | `create-user.use-case.spec.ts` `inspector C2 stores a Membership with Role inspector in an ordinary and in the internal Organization` | yes - exact Memberships for both Organizations |
| C3 | `roles.guard.spec.ts` `inspector C3 POST /invitations accepts role inspector` | yes |
| C4 | `accept-invitation.use-case.spec.ts` `inspector C4 accepting an inspector Invitation stores the Membership with Role inspector` | yes - exact Membership list |
| C5 | `resolve-session.use-case.spec.ts` `inspector C5 resolves role inspector from the active Membership`; `get-profile.use-case.spec.ts` `inspector C5 returns role inspector for the active Organization and its Membership` | yes |
| C6 | `count-organization-roles.use-case.spec.ts` `inspector C6 lists administrator, operator and inspector in that order with zero inspectors` | yes - `toEqual` on the ordered array, 0 and then 1 with an other-Organization inspector excluded |
| C7 | `roles.guard.spec.ts` `inspector C7 refuses each of the 14 write routes to an inspector with 403 and calls no use case` | yes - table of 14 pinned by length, real `AuthModule` guard order, zero use-case calls |
| C8 | `roles.guard.spec.ts` `inspector C8 answers 403 before validation and before any read` | yes - same invalid body gives 400 to an operator and 403 to an inspector; the 404 case holds through zero use-case calls (the fakes cannot answer 404 themselves) |
| C9 | `roles.guard.spec.ts` `inspector C9 writes no file when an inspector uploads an image` | yes - directory listing compared before and after |
| C10 | `roles.guard.spec.ts` `inspector C10 lets administrator and operator through each of the 14 write routes` | yes - asserts not 403 and exactly one use-case call per route (not the full response of today, which fakes cannot reproduce) |
| C11 | `roles.guard.spec.ts` `inspector C11 lets an inspector through each of the 9 read routes` | yes - same shape as C10 |
| C12 | `resolve-session.use-case.spec.ts` `inspector C12 resolves the Role of the newly active Membership after a switch`; `roles.guard.spec.ts` `inspector C12 lets an operator create a Customer` | yes - the switch is simulated by setting `activeOrganizationId`, not by calling `POST /organizations/switch` |
| C13 | `internal-administrator.guard.spec.ts` `inspector C13 throws ForbiddenException for an internal inspector` | yes |
| C14 | `roles.guard.spec.ts` `inspector C14 answers 403 with statusCode 403 and message Forbidden` | yes - `toEqual` on the whole body |
| C15 | `layout.spec.ts` `inspector C15 every POST, PUT and DELETE handler under customer and work-order declares Roles` | yes - requires the literal `@Roles(...WRITERS)` and pins 14 handlers; a `@Patch` handler would not be seen (outside the criterion's wording) |
| C16 | `docs.spec.ts` `inspector C16 CONTEXT.md and AGENTS.md name the three Roles` | yes |
| C17 | grep on `*_add_inspector_role/migration.sql` and `schema.prisma` | yes - migration `20261114034411_add_inspector_role` present |
| C18 | `email-invitation-delivery.spec.ts` `inspector C18 names the inspector Role Inspetor in the email` | yes |
| C19 | `user-form.inspector.spec.ts` `inspector C19 offers Administrador, Operador and Inspetor and sends role inspector`; `organization-detail.inspector.spec.ts` `inspector C19 the Invitation form offers Inspetor and sends role inspector`; `organization-detail.inspector.spec.ts` `inspector C19 the User form posts role inspector to POST /users` | yes - options in order on both forms; the `POST /invitations` body and now the `POST /users` request (method and whole body, `role: 'inspector'` with `organizationId`) are asserted with `toEqual` from Organization detail |
| C20 | `organization-detail.inspector.spec.ts` `inspector C20 shows the Inspetor badge and no Role counts` | yes - badge text and the fixture count `7` absent |
| C21 | `internal-layout.inspector.spec.ts` `inspector C21 the switcher shows Inspetor under the Organization` | yes |
| C22 | `customer-list.inspector.spec.ts` `inspector C22 renders no write control for an inspector` | yes - the detector is first shown to find the controls for an operator, then `toEqual([])` for an inspector |
| C23 | `customer-detail.inspector.spec.ts` `inspector C23 renders no write control for an inspector` | yes - same pattern |
| C24 | `vessel-list.inspector.spec.ts` `inspector C24 renders no write control for an inspector` | yes - same pattern |
| C25 | `vessel-detail.inspector.spec.ts` `inspector C25 renders no write control for an inspector` | yes - same pattern |
| C26 | `work-order-detail.inspector.spec.ts` `inspector C26 renders no write control for an inspector` | yes - same pattern; fixture has one service, so the upload input is exercised |
| C27 | `write-access.inspector.spec.ts` `inspector C27 the five pages render their write controls for an operator and an administrator` | yes - exact sorted list per page and Role |
| C28 | `write-access.inspector.spec.ts` `inspector C28 the five pages show the same content to an inspector as to an operator` | yes - text compared with write labels removed, non-empty |
| C29 | `internal-layout.inspector.spec.ts` `inspector C29 the session Role follows GET /me after an Organization switch` | yes - asserts `canWrite()` false after the reloaded layout reads `/me`; does not render a page (C22-C26 tie pages to the same signal) |
| C30 | `roles.guard.spec.ts` `inspector C30 keeps the statuses of /me, /invitations and /organizations/:id/roles` | yes |
| C31 | `write-access.inspector.spec.ts` `inspector C31 the five pages render no write control while the Role is not loaded or is not a writer` | yes - all five pages for `null` and `auditor`, `toEqual([])`, each on a fresh module; the same detector finds every control for an operator in C27, and the throwaway `render(..., null)` / `render(..., 'auditor')` at 6be756e returned controls, so it would fail if the claim were false |

Own examples run at `HEAD` (throwaway, deleted):

- API, AC 5: an inspector uploading a 5 MB `payload.exe` -> 403, no file written, no use case called. A session with an unknown Role value (`'Operator'`) -> 403 on all 14 write routes. `POST /users` with `role` `'Inspector'`, `''`, `' inspector'` or missing -> 400. All held.
- Web, AC 17/21: `render('customers', null)` (Role not yet known) -> `['Novo Cliente', 'Excluir']`; `render('work-orders/:id', 'auditor')` -> `['Editar ordem de serviço', 'Novo serviço', 'Enviar foto de Pintura']`. Both broke the rule, see Findings.

API write routes: every `@Post`, `@Put` and `@Delete` under `customer` and `work-order` (14) carries `@Roles(...WRITERS)`; there is no `@Patch` and no write route without it. Web: the five pages have no other write control than the ones gated (`service-section`, `image-upload` and `service-image-upload` are not used by any page).

## Findings

| Finding | Evidence | Fix | Closed |
| --- | --- | --- | --- |
| An inspector sees and can click the write controls on every page until `GET /me` resolves: `canWrite` is true while the Role is `null`, and `InternalLayout` renders `<router-outlet />` before `/me` loads. No check covers the Role-unknown state | `authentication.service.ts` `canWrite = computed(() => this.role() !== 'inspector')`; `internal-layout.ts:81` outlet outside the `@if (user())`; throwaway `render('customers', null)` returned `['Novo Cliente', 'Excluir']` | make `canWrite` false until a Role is known (for example an allow-list of `administrator` and `operator`), and add a check that a page renders no write control while the Role is `null` | `d61623e` - C31 holds a page with no write control while the Role is `null` |
| The web decides write access with a deny-list while the API uses an allow-list (`WRITERS`): any Role other than `inspector` (a future Role, or an unexpected value) gets every write control the API then refuses with 403 | `authentication.service.ts` `role() !== 'inspector'` vs `roles.ts` `WRITERS = ['administrator', 'operator']`; throwaway `render('work-orders/:id', 'auditor')` returned all three write controls | derive `canWrite` from the same allow-list as `WRITERS` (closes the first finding too) | `d61623e` - `canWrite` uses the `administrator`/`operator` allow-list; C31 holds `auditor` |
| C19's User-form half asserts the form's emitted value, not the `POST /users` body the criterion names ("the web SHALL send") | `user-form.inspector.spec.ts` asserts `emitted`; the Invitation half asserts `controller.expectOne('/api/invitations')` | assert the `POST /users` request body from Organization detail, as the Invitation half does | `d61623e` - C19 now also asserts the `POST /users` body from Organization detail |
