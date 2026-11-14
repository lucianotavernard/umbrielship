# inspector-role proofs

**HEAD**: 7946a4c
**Tree**: clean
**Shell**: /bin/sh
**Result**: 38 pass, 0 fail

| Check | Proof | Result |
| --- | --- | --- |
| C1 | `run api / ✓ roles.guard.spec.ts > inspector C1 POST /users accepts role inspector and refuses auditor` | pass |
| C2 | `run api / ✓ create-user.use-case.spec.ts > inspector C2 stores a Membership with Role inspector in an ordinary` | pass |
| C3 | `run api / ✓ roles.guard.spec.ts > inspector C3 POST /invitations accepts role inspector` | pass |
| C4 | `run api / ✓ accept-invitation.use-case.spec.ts > inspector C4 accepting an inspector Invitation stores the Mem` | pass |
| C5 | `run api / ✓ resolve-session.use-case.spec.ts > inspector C5 resolves role inspector from the active Membership` | pass |
| C5 | `run api / ✓ get-profile.use-case.spec.ts > inspector C5 returns role inspector for the active Organization and` | pass |
| C6 | `run api / ✓ count-organization-roles.use-case.spec.ts > inspector C6 lists administrator, operator and inspect` | pass |
| C7 | `run api / ✓ roles.guard.spec.ts > inspector C7 refuses each of the 14 write routes to an inspector with 403 an` | pass |
| C8 | `run api / ✓ roles.guard.spec.ts > inspector C8 answers 403 before validation and before any read` | pass |
| C9 | `run api / ✓ roles.guard.spec.ts > inspector C9 writes no file when an inspector uploads an image` | pass |
| C10 | `run api / ✓ roles.guard.spec.ts > inspector C10 lets administrator and operator through each of the 14 write r` | pass |
| C11 | `run api / ✓ roles.guard.spec.ts > inspector C11 lets an inspector through each of the 9 read routes` | pass |
| C12 | `run api / ✓ resolve-session.use-case.spec.ts > inspector C12 resolves the Role of the newly active Membership ` | pass |
| C12 | `run api / ✓ roles.guard.spec.ts > inspector C12 lets an operator create a Customer` | pass |
| C13 | `run api / ✓ internal-administrator.guard.spec.ts > inspector C13 throws ForbiddenException for an internal ins` | pass |
| C14 | `run api / ✓ roles.guard.spec.ts > inspector C14 answers 403 with statusCode 403 and message Forbidden` | pass |
| C15 | `run api / ✓ layout.spec.ts > inspector C15 every POST, PUT and DELETE handler under customer and work-order de` | pass |
| C16 | `run api / ✓ docs.spec.ts > inspector C16 CONTEXT.md and AGENTS.md name the three Roles` | pass |
| C17 | `grep -q "ADD VALUE 'inspector'" api/src/package/shared/module/prisma/migrations/*_add_inspector_role/migration` | pass |
| C18 | `run api / ✓ email-invitation-delivery.spec.ts > inspector C18 names the inspector Role Inspetor in the email` | pass |
| C30 | `run api / ✓ roles.guard.spec.ts > inspector C30 keeps the statuses of /me, /invitations and /organizations/:id` | pass |
| C19 | `run web / ✓ user-form.inspector.spec.ts > inspector C19 offers Administrador, Operador and Inspetor and sends ` | pass |
| C19 | `run web / ✓ organization-detail.inspector.spec.ts > inspector C19 the Invitation form offers Inspetor and send` | pass |
| C19 | `run web / ✓ organization-detail.inspector.spec.ts > inspector C19 the User form posts role inspector to POST /` | pass |
| C20 | `run web / ✓ organization-detail.inspector.spec.ts > inspector C20 shows the Inspetor badge and no Role counts` | pass |
| C21 | `run web / ✓ internal-layout.inspector.spec.ts > inspector C21 the switcher shows Inspetor under the Organizati` | pass |
| C22 | `run web / ✓ customer-list.inspector.spec.ts > inspector C22 renders no write control for an inspector` | pass |
| C23 | `run web / ✓ customer-detail.inspector.spec.ts > inspector C23 renders no write control for an inspector` | pass |
| C24 | `run web / ✓ vessel-list.inspector.spec.ts > inspector C24 renders no write control for an inspector` | pass |
| C25 | `run web / ✓ vessel-detail.inspector.spec.ts > inspector C25 renders no write control for an inspector` | pass |
| C26 | `run web / ✓ work-order-detail.inspector.spec.ts > inspector C26 renders no write control for an inspector` | pass |
| C27 | `run web / ✓ write-access.inspector.spec.ts > inspector C27 the five pages render their write controls for an o` | pass |
| C28 | `run web / ✓ write-access.inspector.spec.ts > inspector C28 the five pages show the same content to an inspecto` | pass |
| C29 | `run web / ✓ internal-layout.inspector.spec.ts > inspector C29 the session Role follows GET /me after an Organi` | pass |
| C31 | `run web / ✓ write-access.inspector.spec.ts > inspector C31 the five pages render no write control while the Ro` | pass |
| Build | `cd api && npm run lint` | pass |
| Build | `cd api && npm run build` | pass |
| Build | `cd web && npm run build` | pass |

## Output

`Run api` - exit 0

```
 ✓ src/package/shared/module/auth/__test__/roles.guard.spec.ts > Roles guard over HTTP > inspector C10 lets administrator and operator through each of the 14 write routes 32ms
 ✓ src/package/shared/module/auth/__test__/roles.guard.spec.ts > Roles guard over HTTP > inspector C11 lets an inspector through each of the 9 read routes 7ms
 ✓ src/package/shared/module/auth/__test__/roles.guard.spec.ts > Roles guard over HTTP > inspector C12 lets an operator create a Customer 1ms
 ✓ src/package/shared/module/auth/__test__/roles.guard.spec.ts > Roles guard over HTTP > inspector C14 answers 403 with statusCode 403 and message Forbidden 1ms
 ✓ src/package/shared/module/auth/__test__/roles.guard.spec.ts > Roles guard over HTTP > inspector C1 POST /users accepts role inspector and refuses auditor 3ms
 ✓ src/package/shared/module/auth/__test__/roles.guard.spec.ts > Roles guard over HTTP > inspector C3 POST /invitations accepts role inspector 1ms
 ✓ src/package/shared/module/auth/__test__/roles.guard.spec.ts > Roles guard over HTTP > inspector C30 keeps the statuses of /me, /invitations and /organizations/:id/roles 3ms

 Test Files  58 passed (58)
      Tests  204 passed (204)
   Start at  01:07:27
   Duration  1.47s (transform 4.00s, setup 0ms, import 14.85s, tests 589ms, environment 6ms)

[Nest] 1549764  - 14/11/2026, 01:07:28   ERROR [identity] {"operation":"invitation_enqueue_failed","organizationId":"organization","invitationId":"790a1df1-eab2-4059-aefc-a33874968393","message":"redis down"}
[Nest] 1549784  - 14/11/2026, 01:07:28   ERROR [identity] {"operation":"invitation_enqueue_failed","organizationId":"dest","invitationId":"b404b78a-7226-4bd2-993f-a65f70ab43c4","message":"redis down"}
```

`Run web` - exit 0

```
stderr | src/package/shared/testing/write-access.inspector.spec.ts > write access by Role > inspector C28 the five pages show the same content to an inspector as to an operator
No icon named lucideHistory was found. You may need to import it using the withIcons function.
No icon named lucideHistory was found. You may need to import it using the withIcons function.

stderr | src/package/shared/testing/write-access.inspector.spec.ts > write access by Role > inspector C28 the five pages show the same content to an inspector as to an operator
No icon named lucideHistory was found. You may need to import it using the withIcons function.
No icon named lucideHistory was found. You may need to import it using the withIcons function.

stderr | src/package/shared/testing/write-access.inspector.spec.ts > write access by Role > inspector C31 the five pages render no write control while the Role is not loaded or is not a writer
No icon named lucideHistory was found. You may need to import it using the withIcons function.
No icon named lucideHistory was found. You may need to import it using the withIcons function.

stderr | src/package/shared/testing/write-access.inspector.spec.ts > write access by Role > inspector C31 the five pages render no write control while the Role is not loaded or is not a writer
No icon named lucideHistory was found. You may need to import it using the withIcons function.
No icon named lucideHistory was found. You may need to import it using the withIcons function.
```

`grep -q "ADD VALUE 'inspector'" api/src/package/shared/module/prisma/migrations/*_add_inspector_role/migration` - exit 0

```
(no output)
```
