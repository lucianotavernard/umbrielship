# inspection-assignment proofs

**HEAD**: 9639368
**Tree**: clean
**Shell**: /bin/sh
**Result**: 44 pass, 0 fail

| Check | Proof | Result |
| --- | --- | --- |
| C1 | `run api / ✓ assign-inspection-template.use-case.spec.ts > assignment C1 copies the template's name and questio` | pass |
| C2 | `run api / ✓ assign-inspection-template.use-case.spec.ts > assignment C2 targets a service of the WorkOrder` | pass |
| C2 | `run api / ✓ inspection-assignment.repository.spec.ts > assignment C2 writes the target service, the copied ite` | pass |
| C3 | `run api / ✓ assign-inspection-template.use-case.spec.ts > assignment C3 accepts a WorkOrder and a WorkOrderSer` | pass |
| C4 | `run api / ✓ assign-inspection-template.use-case.spec.ts > assignment C4 stores two assignments of the same tem` | pass |
| C5 | `run api / ✓ assign-inspection-template.use-case.spec.ts > assignment C5 keeps its copy after the template is e` | pass |
| C6 | `run api / ✓ assign-inspection-template.use-case.spec.ts > assignment C6 throws NotFoundDomainException for a f` | pass |
| C6 | `run api / ✓ inspection-assignment.http.spec.ts > assignment C6 answers 404 when the use case finds nothing` | pass |
| C7 | `run api / ✓ inspection-assignment.http.spec.ts > assignment C7 answers 400 for a missing or invalid templateId` | pass |
| C8 | `run api / ✓ inspection-assignment.repository.spec.ts > assignment C8 asks for the WorkOrder's assignments newe` | pass |
| C8 | `run api / ✓ fetch-inspection-assignments.use-case.spec.ts > assignment C8 lists only the WorkOrder's assignmen` | pass |
| C8 | `run api / ✓ inspection-assignment.http.spec.ts > assignment C8 answers each assignment with templateName, serv` | pass |
| C9 | `run api / ✓ fetch-inspection-assignments.use-case.spec.ts > assignment C9 throws NotFoundDomainException for a` | pass |
| C10 | `run api / ✓ remove-inspection-assignment.use-case.spec.ts > assignment C10 deletes the assignment and its item` | pass |
| C10 | `run api / ✓ inspection-assignment.http.spec.ts > assignment C10 answers 204 to a remove` | pass |
| C11 | `run api / ✓ remove-inspection-assignment.use-case.spec.ts > assignment C11 throws NotFoundDomainException for ` | pass |
| C11 | `run api / ✓ inspection-assignment.repository.spec.ts > assignment C11 reads and deletes an assignment only ins` | pass |
| C12 | `run api / ✓ inspection-assignment.http.spec.ts > assignment C12 refuses POST and DELETE to operator and inspec` | pass |
| C13 | `f=$(ls api/src/package/shared/module/prisma/migrations/*_add_inspection_assignments/migration.sql) && grep -q ` | pass |
| C14 | `run api / ✓ fetch-inspection-templates.use-case.spec.ts > assignment C14 returns 100 then 1 of 101 templates w` | pass |
| C14 | `run api / ✓ inspection-template.http.spec.ts > assignment C14 passes per_page from 1 to 100 and defaults to 10` | pass |
| C15 | `run api / ✓ layout.spec.ts > template C12 every POST, PUT and DELETE handler under customer and work-order dec` | pass |
| C15 | `run api / ✓ layout.spec.ts > [C32] exposes the routes of today, /me and the identity routes, one controller cl` | pass |
| C16 | `run api / ✓ docs.spec.ts > assignment C16 CONTEXT.md has the InspectionAssignment entry` | pass |
| C28 | `f=$(ls api/src/package/shared/module/prisma/migrations/*_add_inspection_assignments/migration.sql) && grep -q ` | pass |
| C29 | `run api / ✓ inspection-assignment.http.spec.ts > assignment C29 answers 401 without a token and lets every Rol` | pass |
| C17 | `run web / ✓ inspection-assignment-section.spec.ts > assignment C17 lists template, target and question count` | pass |
| C18 | `run web / ✓ inspection-assignment-section.spec.ts > assignment C18 an empty WorkOrder says Nenhum modelo atrib` | pass |
| C19 | `run web / ✓ inspection-assignment-section.spec.ts > assignment C19 expands and collapses the numbered question` | pass |
| C20 | `run web / ✓ inspection-assignment-section.spec.ts > assignment C20 renders Atribuir modelo and Remover only fo` | pass |
| C21 | `run web / ✓ inspection-assignment-form.spec.ts > assignment C21 opens the sheet with the templates and the tar` | pass |
| C22 | `run web / ✓ inspection-assignment-form.spec.ts > assignment C22 says Nenhum modelo de inspeção cadastrado and ` | pass |
| C23 | `run web / ✓ inspection-assignment-form.spec.ts > assignment C23 requires a template` | pass |
| C24 | `run web / ✓ inspection-assignment-form.spec.ts > assignment C24 assigns to the whole WorkOrder and to a servic` | pass |
| C25 | `run web / ✓ inspection-assignment-section.spec.ts > assignment C25 confirms, removes and reloads; cancel sends` | pass |
| C26 | `run web / ✓ inspection-assignment-form.spec.ts > assignment C26 a failed assign shows the API message and keep` | pass |
| C26 | `run web / ✓ inspection-assignment-section.spec.ts > assignment C26 a failed remove shows the API message and k` | pass |
| C27 | `walk - open a WorkOrder with assignments at 375 px, expand one, open the sheet and the confirmation, and check` | pass (Walked) |
| C30 | `run api / ✓ assign-inspection-template.use-case.spec.ts > assignment C30 a stored assignment reads back with t` | pass |
| C30 | `run api / ✓ inspection-assignment.repository.spec.ts > assignment C2 writes the target service, the copied ite` | pass |
| C30 | `run api / ✓ inspection-assignment.repository.spec.ts > assignment C8 asks for the WorkOrder's assignments newe` | pass |
| Build | `cd api && npm run lint` | pass |
| Build | `cd api && npm run build` | pass |
| Build | `cd web && npm run build` | pass |

## Output

`Run api` - exit 0

```
 ✓ src/package/shared/module/auth/__test__/roles.guard.spec.ts > Roles guard over HTTP > inspector C11 lets an inspector through each of the 9 read routes 10ms
 ✓ src/package/shared/module/auth/__test__/roles.guard.spec.ts > Roles guard over HTTP > inspector C12 lets an operator create a Customer 1ms
 ✓ src/package/shared/module/auth/__test__/roles.guard.spec.ts > Roles guard over HTTP > inspector C14 answers 403 with statusCode 403 and message Forbidden 1ms
 ✓ src/package/shared/module/auth/__test__/roles.guard.spec.ts > Roles guard over HTTP > inspector C1 POST /users accepts role inspector and refuses auditor 3ms
 ✓ src/package/shared/module/auth/__test__/roles.guard.spec.ts > Roles guard over HTTP > inspector C3 POST /invitations accepts role inspector 2ms
 ✓ src/package/shared/module/auth/__test__/roles.guard.spec.ts > Roles guard over HTTP > inspector C30 keeps the statuses of /me, /invitations and /organizations/:id/roles 3ms
 ✓ src/package/customer/customer/__test__/fetch-customers.use-case.spec.ts > FetchCustomersUseCase > [C8] returns the 2nd and 3rd customers for take 2 skip 1 and total 3 1ms

 Test Files  70 passed (70)
      Tests  252 passed (252)
   Start at  09:50:01
   Duration  1.80s (transform 5.43s, setup 0ms, import 20.05s, tests 1.26s, environment 8ms)

[Nest] 2020682  - 14/11/2026, 09:50:01   ERROR [identity] {"operation":"invitation_enqueue_failed","organizationId":"dest","invitationId":"4db6f97f-91b1-485c-9aab-c40a914901f7","message":"redis down"}
[Nest] 2020899  - 14/11/2026, 09:50:02   ERROR [identity] {"operation":"invitation_enqueue_failed","organizationId":"organization","invitationId":"92450d36-56ba-474e-b3d9-f4f6b25c851a","message":"redis down"}
```

`Run web` - exit 0

```
stderr | src/package/work-order/inspection-assignment/__test__/inspection-assignment-section.spec.ts > WorkOrder Inspeções section > assignment C20 renders Atribuir modelo and Remover only for administrator
No icon named lucideHistory was found. You may need to import it using the withIcons function.
No icon named lucideHistory was found. You may need to import it using the withIcons function.

stderr | src/package/work-order/inspection-assignment/__test__/inspection-assignment-form.spec.ts > Atribuir modelo de inspeção > assignment C26 a failed assign shows the API message and keeps the list
No icon named lucideHistory was found. You may need to import it using the withIcons function.
No icon named lucideHistory was found. You may need to import it using the withIcons function.

stderr | src/package/work-order/inspection-assignment/__test__/inspection-assignment-section.spec.ts > WorkOrder Inspeções section > assignment C25 confirms, removes and reloads; cancel sends nothing
No icon named lucideHistory was found. You may need to import it using the withIcons function.
No icon named lucideHistory was found. You may need to import it using the withIcons function.

stderr | src/package/work-order/inspection-assignment/__test__/inspection-assignment-section.spec.ts > WorkOrder Inspeções section > assignment C26 a failed remove shows the API message and keeps the list
No icon named lucideHistory was found. You may need to import it using the withIcons function.
No icon named lucideHistory was found. You may need to import it using the withIcons function.
```

`f=$(ls api/src/package/shared/module/prisma/migrations/*_add_inspection_assignments/migration.sql) && grep -q ` - exit 0

```
(no output)
```

`f=$(ls api/src/package/shared/module/prisma/migrations/*_add_inspection_assignments/migration.sql) && grep -q ` - exit 0

```
(no output)
```
