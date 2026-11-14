# Inspection checks

Build: `cd api && npm run lint`; `cd api && npm run build`; `cd web && npm run build`
Run api: `cd api && npx vitest run --reporter=verbose`
Run web: `cd web && npx ng test --watch=false --reporters=verbose --include='**/inspection*/**/*.spec.ts' --include='**/vessel/**/*.spec.ts'`
Plan: `.specs/features/inspection/plan.md`

41 checks in 4 slices · 4 one-way doors · 0 open, of which 0 block

## Checks

### S1 - Questions have a type

**C1** - Creating or editing a template stores and returns each item's `type`; a missing type or `"DATE"` answers 400 (AC 1)
Proof: run api | ✓ create-inspection-template.use-case.spec.ts > inspection C1 stores each question's type
Proof: run api | ✓ inspection-template.http.spec.ts > inspection C1 requires a question type of the four and returns it
Proof: run api | ✓ edit-inspection-template.use-case.spec.ts > inspection C1 stores each question's type on an edit
Proof: run api | ✓ inspection-template.http.spec.ts > inspection C1 passes the types of an edit through
Proof: run api | ✓ inspection-template.repository.spec.ts > inspection C1 writes each question's type on create and on edit

**C2** - An assignment copies each question's type, and editing the template's types afterwards leaves the copy unchanged (AC 2)
Proof: run api | ✓ assign-inspection-template.use-case.spec.ts > inspection C2 copies each question's type and keeps it after the template changes

**C3** - The migration adds `type` to both item tables with `DEFAULT 'CONFORMITY'`, so existing rows become `CONFORMITY` (AC 3)
Proof: `f=$(ls api/src/package/shared/module/prisma/migrations/*_add_inspections/migration.sql) && grep -q 'CREATE TYPE "question_type" AS ENUM' $f && test "$(grep -c "ADD COLUMN *\"type\" \"question_type\" NOT NULL DEFAULT 'CONFORMITY'" $f)" = 2`

**C4** - The template form gives each question a "Tipo" select with the four labels, "Conforme/Não conforme" on a new question, and sends the chosen types in the order shown (AC 4)
Proof: run web | ✓ inspection-template-form.spec.ts > inspection C4 each question has a Tipo select and the form sends the types in order

**C5** - The template detail page and an expanded assignment show each question's type label (AC 5)
Proof: run web | ✓ inspection-template-detail.spec.ts > inspection C5 shows each question's type label
Proof: run web | ✓ inspection-assignment-section.spec.ts > inspection C5 shows each copied question's type label

**C6** - `CONTEXT.md` describes the four question types in the `InspectionTemplate` entry (AC 6)
Proof: run api | ✓ docs.spec.ts > inspection C6 CONTEXT.md describes the question types and the Inspection

### S2 - Inspectors record inspections through the API

**C7** - Completing stores the Inspection with the given `result`, `completedAt`, the session User's id and name, and one answer per question; the route answers 201 with it (AC 7)
Proof: run api | ✓ complete-inspection.use-case.spec.ts > inspection C7 stores the Inspection with the result, the inspector and every answer
Proof: run api | ✓ inspection.http.spec.ts > inspection C7 passes the inspector's id and name and answers 201 with the Inspection
Proof: run api | ✓ inspection.repository.spec.ts > inspection C7 writes each answer to the column of its value and marks a discard once

**C8** - Each answer is `notApplicable` with no value or a value of its type: text 1 to 1000 trimmed, boolean for `YES_NO` and `CONFORMITY`, integer 0 to 10 for `SCORE`; 0 and 10 pass, 11, 7.5, spaces and `"sim"` answer 409 (AC 8)
Proof: run api | ✓ complete-inspection.use-case.spec.ts > inspection C8 accepts a value of each type or not applicable and refuses the rest

**C9** - A note up to 500 characters is accepted and trimmed on `YES_NO`, `CONFORMITY` and `SCORE`, and refused with 409 on `TEXT` (AC 9)
Proof: run api | ✓ complete-inspection.use-case.spec.ts > inspection C9 accepts a trimmed note except on free text

**C10** - A missing answer, an answer to a question of another assignment, or a question answered twice answers 409 and stores nothing (AC 10)
Proof: run api | ✓ complete-inspection.use-case.spec.ts > inspection C10 refuses missing, foreign and repeated answers and stores nothing

**C11** - A WorkOrder not `IN_PROGRESS`, or a targeted service not `IN_PROGRESS`, answers 409 and stores nothing; both in progress and a whole-WorkOrder assignment on one in progress pass (AC 11)
Proof: run api | ✓ complete-inspection.use-case.spec.ts > inspection C11 requires the WorkOrder and the targeted service in progress

**C12** - A missing or unknown `result`, or a note over 500 characters, answers 400 and calls no use case (AC 12)
Proof: run api | ✓ inspection.http.spec.ts > inspection C12 answers 400 for a missing result or a note over 500 characters

**C13** - A second completion of the same assignment adds a second Inspection and keeps the first (AC 13)
Proof: run api | ✓ complete-inspection.use-case.spec.ts > inspection C13 adds an Inspection each time and keeps the earlier ones

**C14** - The assignment list carries visible Inspections newest first, ties by id, with their answers, and `removable` only with no Inspection at all (AC 14)
Proof: run api | ✓ inspection-assignment.repository.spec.ts > inspection C14 reads visible Inspections newest first and counts every Inspection for removable
Proof: run api | ✓ fetch-inspection-assignments.use-case.spec.ts > inspection C14 lists visible Inspections newest first and removable only without any
Proof: run api | ✓ inspection-assignment.http.spec.ts > inspection C14 answers each assignment with removable and its Inspections

**C15** - Discarding a visible Inspection stores who and when, hides it from every read and keeps the others, whatever the WorkOrder's status; the route answers 204 (AC 15)
Proof: run api | ✓ discard-inspection.use-case.spec.ts > inspection C15 marks who and when, hides it and keeps the others
Proof: run api | ✓ inspection.http.spec.ts > inspection C15 answers 204 to a discard with the inspector's id

**C16** - Discarding an already discarded, unknown, foreign-assignment or foreign-Organization Inspection answers 404 and changes nothing (AC 16)
Proof: run api | ✓ discard-inspection.use-case.spec.ts > inspection C16 throws NotFoundDomainException and changes nothing
Proof: run api | ✓ inspection.repository.spec.ts > inspection C16 finds only a visible Inspection of the Organization

**C17** - `administrator` and `operator` get 403 `{ statusCode: 403, message: "Forbidden" }` on complete and discard, before validation, with no use case called (AC 17)
Proof: run api | ✓ inspection.http.spec.ts > inspection C17 refuses complete and discard to administrator and operator with 403 before validation

**C18** - Completing on an unknown, other-WorkOrder or other-Organization assignment answers 404 and stores nothing (AC 18)
Proof: run api | ✓ complete-inspection.use-case.spec.ts > inspection C18 throws NotFoundDomainException for a foreign assignment and stores nothing
Proof: run api | ✓ inspection.http.spec.ts > inspection C18 answers 404 when the use case finds nothing

**C19** - Removing an assignment with any Inspection, discarded included, answers 409 and deletes nothing; the database refusal maps to 409 too (AC 19)
Proof: run api | ✓ remove-inspection-assignment.use-case.spec.ts > inspection C19 refuses an assignment with any Inspection
Proof: run api | ✓ inspection-assignment.repository.spec.ts > inspection C19 turns the database refusal into ConflictDomainException

**C20** - The layout spec lists the two new routes and requires `@Roles('inspector')` on both; `CONTEXT.md` has the `Inspection` entry (AC 20)
Proof: run api | ✓ layout.spec.ts > template C12 every POST, PUT and DELETE handler under customer and work-order declares its Roles
Proof: run api | ✓ layout.spec.ts > [C32] exposes the routes of today, /me and the identity routes, one controller class per file
Proof: run api | ✓ docs.spec.ts > inspection C6 CONTEXT.md describes the question types and the Inspection

**C38** - The session carries the User's `name` (door 4)
Proof: run api | ✓ resolve-session.use-case.spec.ts > inspection C38 resolves the User's name into the session

**C39** - The migration creates `inspections` with the assignment FK `ON DELETE RESTRICT`, and `inspection_answers` with the item FK `ON DELETE RESTRICT`, the Inspection FK `ON DELETE CASCADE` and a unique `(inspectionId, itemId)` (doors 2 and 3)
Proof: `f=$(ls api/src/package/shared/module/prisma/migrations/*_add_inspections/migration.sql) && grep -q 'CREATE TABLE "inspections"' $f && grep -q 'CREATE TABLE "inspection_answers"' $f && grep -q 'inspections_assignmentId_fkey.*ON DELETE RESTRICT' $f && grep -q 'inspection_answers_itemId_fkey.*ON DELETE RESTRICT' $f && grep -q 'inspection_answers_inspectionId_fkey.*ON DELETE CASCADE' $f && grep -q 'CREATE UNIQUE INDEX "inspection_answers_inspectionId_itemId_key"' $f`

**C40** - Every new route answers 401 without a token (Surface)
Proof: run api | ✓ inspection.http.spec.ts > inspection C40 answers 401 without a token

**C41** - Every new 409 reaches HTTP with its message: completing on refused answers or work, removing an inspected assignment, deleting an inspected WorkOrder or service (Surface, added after verification)
Proof: run api | ✓ inspection.http.spec.ts > inspection C41 answers 409 with the message when the answers or the work are refused
Proof: run api | ✓ inspection-assignment.http.spec.ts > inspection C41 answers 409 when an inspected assignment is removed
Proof: run api | ✓ roles.guard.spec.ts > inspection C41 answers 409 when an inspected WorkOrder or service is deleted

### S3 - Inspectors answer and read inspections on the WorkOrder page

**C21** - Each assignment summary shows "N inspeções" and the latest result, or "Nenhuma inspeção" (AC 21)
Proof: run web | ✓ inspection-history.spec.ts > inspection C21 the summary counts the Inspections and shows the latest result

**C22** - An expanded assignment lists its Inspections newest first with result, inspector and `dd/MM/yyyy HH:mm` (AC 22)
Proof: run web | ✓ inspection-history.spec.ts > inspection C22 lists the Inspections with result, inspector and date

**C23** - Using an Inspection opens "Inspeção" with result, inspector, date and every numbered answer in its label, "Não se aplica" and notes (AC 23)
Proof: run web | ✓ inspection-history.spec.ts > inspection C23 the Inspeção sheet shows every answer by type and the notes
Proof: run web | ✓ inspection-history.spec.ts > inspection C23 reads Sim, Conforme and Não conforme as such

**C24** - "Inspecionar" renders for `inspector` only; enabled with the work in progress, otherwise disabled with the WorkOrder or the service reason (AC 24)
Proof: run web | ✓ inspection-checklist.spec.ts > inspection C24 Inspecionar is for inspectors and disabled with the reason outside the work in progress

**C25** - The "Inspecionar" sheet lists every numbered question with its type's control, "Não se aplica" and, except on free text, "Observação" (AC 25)
Proof: run web | ✓ inspection-checklist.spec.ts > inspection C25 renders the control of each type, Não se aplica and Observação

**C26** - "Concluir" with an unanswered question, a text over 1000 or a note over 500 shows the error on that question and sends nothing (AC 26)
Proof: run web | ✓ inspection-checklist.spec.ts > inspection C26 shows the question's error and sends nothing

**C27** - With every answer given, "Concluir inspeção" shows the "Não conforme" and "Não" counts, "Aprovada" and "Reprovada" unselected, and "Confirmar" disabled until one is chosen (AC 27)
Proof: run web | ✓ inspection-checklist.spec.ts > inspection C27 the confirmation shows the counts and waits for a result

**C28** - Confirming sends the result and every answer, closes the sheet, shows "Inspeção registrada com sucesso" and reloads the assignments (AC 28)
Proof: run web | ✓ inspection-checklist.spec.ts > inspection C28 sends the result and every answer and reloads

**C29** - "Descartar" in the "Inspeção" sheet, for inspectors only, confirms, discards, shows "Inspeção descartada com sucesso" and reloads; cancelling sends nothing (AC 29)
Proof: run web | ✓ inspection-history.spec.ts > inspection C29 an inspector discards after confirming; cancel sends nothing; others see no Descartar

**C30** - An assignment that is not `removable` shows no "Remover" (AC 30)
Proof: run web | ✓ inspection-history.spec.ts > inspection C30 an inspected assignment shows no Remover

**C31** - A failed complete shows the API message and keeps the answers; a failed discard shows it and keeps the history (AC 31)
Proof: run web | ✓ inspection-checklist.spec.ts > inspection C31 a failed complete shows the API message and keeps the answers
Proof: run web | ✓ inspection-history.spec.ts > inspection C31 a failed discard shows the API message and keeps the history

**C32** - Below 640 px the layout header is not sticky; from 640 px it is (AC 32)
Proof: run web | ✓ inspection-layout.spec.ts > inspection C32 the header is sticky from sm only

**C33** - At 375 px the WorkOrder page with an expanded assignment, the "Inspecionar" sheet with each type, the "Concluir inspeção" confirmation and the "Inspeção" sheet show everything without horizontal page scroll, with answer controls at least 40 px tall (AC 33)
Proof: walk - at 375 px open a WorkOrder in progress as an inspector, expand an assignment with a question of each type, open Inspecionar, answer, open Concluir inspeção and an Inspeção sheet; check `scrollWidth` and the answer controls' height

### S4 - Inspected work cannot be deleted

**C34** - Deleting a WorkOrder with any Inspection under it, discarded included, answers 409 and deletes nothing; the database refusal maps to 409 too (AC 34)
Proof: run api | ✓ delete-work-order.use-case.spec.ts > inspection C34 refuses a WorkOrder with an Inspection under it
Proof: run api | ✓ work-order.repository.spec.ts > inspection C34 turns the database refusal into ConflictDomainException
Proof: run api | ✓ inspection.repository.spec.ts > inspection C34 counts every Inspection under a WorkOrder or a service, discarded ones included

**C35** - Deleting a WorkOrderService targeted by an assignment with any Inspection answers 409 and deletes nothing (AC 35)
Proof: run api | ✓ delete-work-order-service.use-case.spec.ts > inspection C35 refuses a service targeted by an inspected assignment
Proof: run api | ✓ work-order-service.repository.spec.ts > inspection C35 turns the database refusal into ConflictDomainException

**C36** - A WorkOrder or WorkOrderService whose assignments have no Inspection is deleted with them, answering 204 (AC 36)
Proof: run api | ✓ delete-work-order.use-case.spec.ts > inspection C36 deletes a WorkOrder whose assignments have no Inspection
Proof: run api | ✓ delete-work-order-service.use-case.spec.ts > inspection C36 deletes a service whose assignments have no Inspection

**C37** - A 409 on a WorkOrder delete shows "Esta ordem de serviço tem inspeções e não pode ser excluída." and keeps it listed (AC 37)
Proof: run web | ✓ vessel-detail.inspection.spec.ts > inspection C37 a refused WorkOrder delete explains the inspections and keeps the row

## Coverage

| Set (size) | Member -> proof | Unproven |
| --- | --- | --- |
| question types (4) | `TEXT` C8, C25 · `YES_NO` C8, C25 · `CONFORMITY` C8, C25 · `SCORE` C8, C25 | - |
| AC 8 examples (6) | 0 C8 · 10 C8 · 11 C8 · 7.5 C8 · spaces C8 · `"sim"` C8 | - |
| AC 11 examples (4) | WorkOrder `PENDING` C11 · service `COMPLETED` C11 · both in progress C11 · whole WorkOrder in progress C11 | - |
| AC 10 cases (3) | missing C10 · foreign question C10 · repeated C10 | - |
| AC 16 cases (4) | discarded C16 · unknown C16 · other assignment C16 · other Organization C16 | - |
| AC 17 Roles refused (2) | `administrator` C17 · `operator` C17 | - |
| `POST /inspection-templates`, `PUT /inspection-templates/:id` statuses, new (1) | 400 for type C1 | - |
| `GET /inspection-templates/:id` statuses (3) | 200 C1 · 401 existing template C32 · 404 existing template C10 | - |
| `GET /work-orders/:workOrderId/inspection-assignments` statuses (3) | 200 C14 · 401 existing assignment C29 · 404 existing assignment C9 | - |
| `DELETE /work-orders/:workOrderId/inspection-assignments/:id` statuses, new (1) | 409 C19, C41 | - |
| `POST /work-orders/:workOrderId/inspection-assignments/:assignmentId/inspections` statuses (6) | 201 C7 · 400 C12 · 401 C40 · 403 C17 · 404 C18 · 409 C8, C10, C11, C41 | - |
| `POST /work-orders/:workOrderId/inspection-assignments/:assignmentId/inspections/:id/discard` statuses (4) | 204 C15 · 401 C40 · 403 C17 · 404 C16 | - |
| `DELETE /work-orders/:id` statuses, new (1) | 409 C34, C41 | - |
| `DELETE /work-orders/:workOrderId/services/:id` statuses, new (1) | 409 C35, C41 | - |
| one-way doors (4) | type enum and backfill C3 · tables C39 · restrict C39, C34, C35 · session name C38 | - |
| session Roles for Inspecionar and Descartar (4) | `inspector` C24, C29 · `administrator` C24, C29 · `operator` C24, C29 · not loaded C24 | - |
| checklist controls (6) | text box C25 · Sim/Não C25 · Conforme/Não conforme C25 · 0 to 10 C25 · Não se aplica C25 · Observação C25 | - |
| states at 375 px (4) | expanded assignment C33 · Inspecionar sheet C33 · confirmation C33 · Inspeção sheet C33 | - |
| startup config: `InspectionController` (2 assemblies) | `WorkOrderModule` in `AppModule` C20 route list and the build · HTTP spec harness C17 | - |

## Swept

- validation: C8, C9, C12, C26
- failure modes: C10, C11, C31 - nothing is stored when an answer is refused; a failed request keeps what was typed
- idempotency: n/a - each completion is meant to add an Inspection (C13); a repeated discard answers 404 (C16)
- authorization: C17, C24, C29, C40
- concurrency: C13, C34, C35 - two completions both store; a delete racing an inspection is refused by the database
- data lifecycle: C15, C19, C34, C35, C36 - nothing inspected is deleted; a discard keeps the row
- dependency failure: n/a - no external call
- state transitions: C15, C16 - visible to discarded, once
- observability: n/a - no logging requirement in this slice

## Handoff

- **Settled mid-build:** none
- **Changed existing specs:** template and assignment use cases now take `questions: [{ label, type }]` instead of `labels`; the factories still accept `labels` (as `CONFORMITY`), and the old specs' inputs and expected shapes gained `type`, `removable` and `inspections` - their claims are unchanged. `DeleteWorkOrderUseCase` and `DeleteWorkOrderServiceUseCase` take `IInspectionsRepository`. The session carries `name`, so the old session specs expect it. `layout.spec.ts` reads a controller path that Prettier wraps, maps the Roles of each aggregate (`inspector` for `inspection`), and lists the two routes. The assignment section's failed-remove spec expects the new Portuguese for `Inspection assignment has inspections`
- **Machine load:** the full web suite timed out during the build while the machine ran at a load of 70 to 330 from other projects; the feature's specs passed when run alone
- **Dispatched:** Verifier at `73a3e90` (no screens sub-agent: no criterion cites a capture) - returned FAIL, 4 findings
- **Boundary:** C1-C6 closed at `9e6b582`; C7-C20, C38-C40 at `d435bf3`; C34-C36 at `f3d12e8`; C37 at `8b5c6fb`; C21-C32 at `329f470`; C33 closed by the walk after the sheet fix
- **Abandoned:** none
- **Walked:** headless Chrome over the DevTools protocol at 375x812, signed in as the seed Administrator. The user's `ng serve` on 4200 did not pick up the S3 bundle, so the walk ran on a second `ng serve` of this checkout on port 4300 (same proxy to the user's API on 3333), stopped afterwards. To write nothing the app cannot delete, the browser saw `/api/me` as an `inspector` and one Inspection injected into the test assignment's `GET` (CDP Fetch interception); a template with one question of each type and its assignment on the first `IN_PROGRESS` WorkOrder were created through the API and removed at the end (204, 204), and "Concluir inspeção" was opened but not confirmed. States: the WorkOrder page with the assignment expanded ("1 inspeção · última: Reprovada", the four type labels, "Inspecionar" enabled); the "Inspecionar" sheet (19 answer controls, all 40 px tall); "Concluir inspeção" (counts 1 and 1, "Confirmar" disabled); the "Inspeção" sheet (every answer by type, the note). `scrollWidth` 360 of 375 in all four. First run: the sheet was 3/4 of the screen (270 px) and its content scrolled sideways by 12 px; fixed in the shared sheet (full width below `sm`, `grid-cols-1`), then rewalked with no overflow. A user reaches these from a WorkOrder, the assignment's chevron, "Inspecionar", "Concluir" and an Inspection row (C33)
