# inspection proofs

**HEAD**: d468110
**Tree**: clean
**Shell**: /bin/sh
**Result**: 67 pass, 0 fail

| Check | Proof | Result |
| --- | --- | --- |
| C1 | `run api / ✓ create-inspection-template.use-case.spec.ts > inspection C1 stores each question's type` | pass |
| C1 | `run api / ✓ inspection-template.http.spec.ts > inspection C1 requires a question type of the four and returns ` | pass |
| C1 | `run api / ✓ edit-inspection-template.use-case.spec.ts > inspection C1 stores each question's type on an edit` | pass |
| C1 | `run api / ✓ inspection-template.http.spec.ts > inspection C1 passes the types of an edit through` | pass |
| C1 | `run api / ✓ inspection-template.repository.spec.ts > inspection C1 writes each question's type on create and o` | pass |
| C2 | `run api / ✓ assign-inspection-template.use-case.spec.ts > inspection C2 copies each question's type and keeps ` | pass |
| C3 | `f=$(ls api/src/package/shared/module/prisma/migrations/*_add_inspections/migration.sql) && grep -q 'CREATE TYP` | pass |
| C4 | `run web / ✓ inspection-template-form.spec.ts > inspection C4 each question has a Tipo select and the form send` | pass |
| C5 | `run web / ✓ inspection-template-detail.spec.ts > inspection C5 shows each question's type label` | pass |
| C5 | `run web / ✓ inspection-assignment-section.spec.ts > inspection C5 shows each copied question's type label` | pass |
| C6 | `run api / ✓ docs.spec.ts > inspection C6 CONTEXT.md describes the question types and the Inspection` | pass |
| C7 | `run api / ✓ complete-inspection.use-case.spec.ts > inspection C7 stores the Inspection with the result, the in` | pass |
| C7 | `run api / ✓ inspection.http.spec.ts > inspection C7 passes the inspector's id and name and answers 201 with th` | pass |
| C7 | `run api / ✓ inspection.repository.spec.ts > inspection C7 writes each answer to the column of its value and ma` | pass |
| C8 | `run api / ✓ complete-inspection.use-case.spec.ts > inspection C8 accepts a value of each type or not applicabl` | pass |
| C9 | `run api / ✓ complete-inspection.use-case.spec.ts > inspection C9 accepts a trimmed note except on free text` | pass |
| C10 | `run api / ✓ complete-inspection.use-case.spec.ts > inspection C10 refuses missing, foreign and repeated answer` | pass |
| C11 | `run api / ✓ complete-inspection.use-case.spec.ts > inspection C11 requires the WorkOrder and the targeted serv` | pass |
| C12 | `run api / ✓ inspection.http.spec.ts > inspection C12 answers 400 for a missing result or a note over 500 chara` | pass |
| C13 | `run api / ✓ complete-inspection.use-case.spec.ts > inspection C13 adds an Inspection each time and keeps the e` | pass |
| C14 | `run api / ✓ inspection-assignment.repository.spec.ts > inspection C14 reads visible Inspections newest first a` | pass |
| C14 | `run api / ✓ fetch-inspection-assignments.use-case.spec.ts > inspection C14 lists visible Inspections newest fi` | pass |
| C14 | `run api / ✓ inspection-assignment.http.spec.ts > inspection C14 answers each assignment with removable and its` | pass |
| C15 | `run api / ✓ discard-inspection.use-case.spec.ts > inspection C15 marks who and when, hides it and keeps the ot` | pass |
| C15 | `run api / ✓ inspection.http.spec.ts > inspection C15 answers 204 to a discard with the inspector's id` | pass |
| C16 | `run api / ✓ discard-inspection.use-case.spec.ts > inspection C16 throws NotFoundDomainException and changes no` | pass |
| C16 | `run api / ✓ inspection.repository.spec.ts > inspection C16 finds only a visible Inspection of the Organization` | pass |
| C17 | `run api / ✓ inspection.http.spec.ts > inspection C17 refuses complete and discard to administrator and operato` | pass |
| C18 | `run api / ✓ complete-inspection.use-case.spec.ts > inspection C18 throws NotFoundDomainException for a foreign` | pass |
| C18 | `run api / ✓ inspection.http.spec.ts > inspection C18 answers 404 when the use case finds nothing` | pass |
| C19 | `run api / ✓ remove-inspection-assignment.use-case.spec.ts > inspection C19 refuses an assignment with any Insp` | pass |
| C19 | `run api / ✓ inspection-assignment.repository.spec.ts > inspection C19 turns the database refusal into Conflict` | pass |
| C20 | `run api / ✓ layout.spec.ts > template C12 every POST, PUT and DELETE handler under customer and work-order dec` | pass |
| C20 | `run api / ✓ layout.spec.ts > [C32] exposes the routes of today, /me and the identity routes, one controller cl` | pass |
| C20 | `run api / ✓ docs.spec.ts > inspection C6 CONTEXT.md describes the question types and the Inspection` | pass |
| C38 | `run api / ✓ resolve-session.use-case.spec.ts > inspection C38 resolves the User's name into the session` | pass |
| C39 | `f=$(ls api/src/package/shared/module/prisma/migrations/*_add_inspections/migration.sql) && grep -q 'CREATE TAB` | pass |
| C40 | `run api / ✓ inspection.http.spec.ts > inspection C40 answers 401 without a token` | pass |
| C41 | `run api / ✓ inspection.http.spec.ts > inspection C41 answers 409 with the message when the answers or the work` | pass |
| C41 | `run api / ✓ inspection-assignment.http.spec.ts > inspection C41 answers 409 when an inspected assignment is re` | pass |
| C41 | `run api / ✓ roles.guard.spec.ts > inspection C41 answers 409 when an inspected WorkOrder or service is deleted` | pass |
| C21 | `run web / ✓ inspection-history.spec.ts > inspection C21 the summary counts the Inspections and shows the lates` | pass |
| C22 | `run web / ✓ inspection-history.spec.ts > inspection C22 lists the Inspections with result, inspector and date` | pass |
| C23 | `run web / ✓ inspection-history.spec.ts > inspection C23 the Inspeção sheet shows every answer by type and the ` | pass |
| C23 | `run web / ✓ inspection-history.spec.ts > inspection C23 reads Sim, Conforme and Não conforme as such` | pass |
| C24 | `run web / ✓ inspection-checklist.spec.ts > inspection C24 Inspecionar is for inspectors and disabled with the ` | pass |
| C25 | `run web / ✓ inspection-checklist.spec.ts > inspection C25 renders the control of each type, Não se aplica and ` | pass |
| C26 | `run web / ✓ inspection-checklist.spec.ts > inspection C26 shows the question's error and sends nothing` | pass |
| C27 | `run web / ✓ inspection-checklist.spec.ts > inspection C27 the confirmation shows the counts and waits for a re` | pass |
| C28 | `run web / ✓ inspection-checklist.spec.ts > inspection C28 sends the result and every answer and reloads` | pass |
| C29 | `run web / ✓ inspection-history.spec.ts > inspection C29 an inspector discards after confirming; cancel sends n` | pass |
| C30 | `run web / ✓ inspection-history.spec.ts > inspection C30 an inspected assignment shows no Remover` | pass |
| C31 | `run web / ✓ inspection-checklist.spec.ts > inspection C31 a failed complete shows the API message and keeps th` | pass |
| C31 | `run web / ✓ inspection-history.spec.ts > inspection C31 a failed discard shows the API message and keeps the h` | pass |
| C32 | `run web / ✓ inspection-layout.spec.ts > inspection C32 the header is sticky from sm only` | pass |
| C33 | `walk - at 375 px open a WorkOrder in progress as an inspector, expand an assignment with a question of each ty` | pass (Walked) |
| C34 | `run api / ✓ delete-work-order.use-case.spec.ts > inspection C34 refuses a WorkOrder with an Inspection under i` | pass |
| C34 | `run api / ✓ work-order.repository.spec.ts > inspection C34 turns the database refusal into ConflictDomainExcep` | pass |
| C34 | `run api / ✓ inspection.repository.spec.ts > inspection C34 counts every Inspection under a WorkOrder or a serv` | pass |
| C35 | `run api / ✓ delete-work-order-service.use-case.spec.ts > inspection C35 refuses a service targeted by an inspe` | pass |
| C35 | `run api / ✓ work-order-service.repository.spec.ts > inspection C35 turns the database refusal into ConflictDom` | pass |
| C36 | `run api / ✓ delete-work-order.use-case.spec.ts > inspection C36 deletes a WorkOrder whose assignments have no ` | pass |
| C36 | `run api / ✓ delete-work-order-service.use-case.spec.ts > inspection C36 deletes a service whose assignments ha` | pass |
| C37 | `run web / ✓ vessel-detail.inspection.spec.ts > inspection C37 a refused WorkOrder delete explains the inspecti` | pass |
| Build | `cd api && npm run lint` | pass |
| Build | `cd api && npm run build` | pass |
| Build | `cd web && npm run build` | pass |

## Output

`Run api` - exit 0

```
 ✓ src/package/identity/user/__test__/fetch-users.use-case.spec.ts > FetchUsersUseCase > [C61] returns only the Users with no Membership in the Organization, paged, with the total 2ms
 ✓ src/package/customer/customer/__test__/fetch-customers.use-case.spec.ts > FetchCustomersUseCase > [C8] returns the 2nd and 3rd customers for take 2 skip 1 and total 3 1ms
 ✓ src/package/identity/invitation/__test__/invitation-delivery-queue.spec.ts > Invitation delivery queue > [C56] retries after 5 seconds and then 10 seconds, three attempts in all 2ms
 ✓ src/package/identity/invitation/__test__/invitation-delivery-queue.spec.ts > Invitation delivery queue > [C56] names each job by its invitation so a second add is ignored 1ms
 ✓ src/package/identity/invitation/__test__/invitation-delivery-queue.spec.ts > Invitation delivery queue > [C56] asks the queue for a retry only when the attempt can be tried again 2ms
 ✓ src/package/customer/__test__/customer.facade.spec.ts > CustomerFacade > [C40] returns plain vessel data for a Vessel of the Organization 1ms
 ✓ src/package/customer/__test__/customer.facade.spec.ts > CustomerFacade > [C40] returns null for an unknown id and for a Vessel of another Organization 0ms

 Test Files  76 passed (76)
      Tests  293 passed (293)
   Start at  12:13:52
   Duration  2.00s (transform 6.13s, setup 0ms, import 22.61s, tests 1.49s, environment 8ms)

[Nest] 2189203  - 14/11/2026, 12:13:53   ERROR [identity] {"operation":"invitation_enqueue_failed","organizationId":"dest","invitationId":"8aa2767d-f8d5-4951-bdb6-32c2ec2be593","message":"redis down"}
[Nest] 2189445  - 14/11/2026, 12:13:54   ERROR [identity] {"operation":"invitation_enqueue_failed","organizationId":"organization","invitationId":"7bc020e9-d8b5-4ec3-b022-1501b7b9152f","message":"redis down"}
```

`Run web` - exit 0

```
stderr | src/package/work-order/inspection/__test__/inspection-checklist.spec.ts > Inspecionar on the WorkOrder page > inspection C26 shows the question's error and sends nothing
No icon named lucideHistory was found. You may need to import it using the withIcons function.
No icon named lucideHistory was found. You may need to import it using the withIcons function.

stderr | src/package/work-order/inspection/__test__/inspection-checklist.spec.ts > Inspecionar on the WorkOrder page > inspection C27 the confirmation shows the counts and waits for a result
No icon named lucideHistory was found. You may need to import it using the withIcons function.
No icon named lucideHistory was found. You may need to import it using the withIcons function.

stderr | src/package/work-order/inspection/__test__/inspection-checklist.spec.ts > Inspecionar on the WorkOrder page > inspection C28 sends the result and every answer and reloads
No icon named lucideHistory was found. You may need to import it using the withIcons function.
No icon named lucideHistory was found. You may need to import it using the withIcons function.

stderr | src/package/work-order/inspection/__test__/inspection-checklist.spec.ts > Inspecionar on the WorkOrder page > inspection C31 a failed complete shows the API message and keeps the answers
No icon named lucideHistory was found. You may need to import it using the withIcons function.
No icon named lucideHistory was found. You may need to import it using the withIcons function.
```

`f=$(ls api/src/package/shared/module/prisma/migrations/*_add_inspections/migration.sql) && grep -q 'CREATE TYP` - exit 0

```
(no output)
```

`f=$(ls api/src/package/shared/module/prisma/migrations/*_add_inspections/migration.sql) && grep -q 'CREATE TAB` - exit 0

```
(no output)
```
