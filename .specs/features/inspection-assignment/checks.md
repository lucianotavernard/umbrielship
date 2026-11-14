# InspectionAssignment checks

Build: `cd api && npm run lint`; `cd api && npm run build`; `cd web && npm run build`
Run api: `cd api && npx vitest run --reporter=verbose`
Run web: `cd web && npx ng test --watch=false --reporters=verbose --include='**/inspection-assignment/**/*.spec.ts'`
Plan: `.specs/features/inspection-assignment/plan.md`

30 checks in 2 slices · 2 one-way doors · 0 open, of which 0 block

## Checks

### S1 - An Administrator assigns templates to a WorkOrder through the API

**C1** - Assigning copies the template's name and its questions at positions 0, 1, 2..., with `service: null`, a `createdAt`, and the session User's id as `assignedBy` (AC 1)
Proof: run api | ✓ assign-inspection-template.use-case.spec.ts > assignment C1 copies the template's name and questions and records who assigned it

**C2** - With a `serviceId` of that WorkOrder the assignment targets that service (AC 2)
Proof: run api | ✓ assign-inspection-template.use-case.spec.ts > assignment C2 targets a service of the WorkOrder

**C3** - A WorkOrder in `PENDING`, `IN_PROGRESS`, `COMPLETED` or `CANCELLED` accepts an assignment (AC 3)
Proof: run api | ✓ assign-inspection-template.use-case.spec.ts > assignment C3 accepts a WorkOrder in every status

**C4** - The same template assigned twice to the same target gives two assignments (AC 4)
Proof: run api | ✓ assign-inspection-template.use-case.spec.ts > assignment C4 stores two assignments of the same template and target

**C5** - Editing the template from `[A,B]` to `[C]`, or deleting it, leaves the assignment's name and questions as copied (AC 5)
Proof: run api | ✓ assign-inspection-template.use-case.spec.ts > assignment C5 keeps its copy after the template is edited or deleted

**C6** - An unknown or foreign WorkOrder, template or service, or a service of another WorkOrder, throws `NotFoundDomainException` and stores nothing; the route answers 404 (AC 6)
Proof: run api | ✓ assign-inspection-template.use-case.spec.ts > assignment C6 throws NotFoundDomainException for a foreign WorkOrder, template or service and stores nothing
Proof: run api | ✓ inspection-assignment.http.spec.ts > assignment C6 answers 404 when the use case finds nothing

**C7** - A missing or non-uuid `templateId`, or a non-uuid `serviceId`, answers 400 and calls no use case (AC 7)
Proof: run api | ✓ inspection-assignment.http.spec.ts > assignment C7 answers 400 for a missing or invalid templateId or serviceId

**C8** - The list asks for the WorkOrder's assignments of the Organization, newest first and ties by id, with items by position and the service's current name; another WorkOrder's are not listed; none gives `[]` (AC 8)
Proof: run api | ✓ inspection-assignment.repository.spec.ts > assignment C8 asks for the WorkOrder's assignments newest first with items by position and the service name
Proof: run api | ✓ fetch-inspection-assignments.use-case.spec.ts > assignment C8 lists only the WorkOrder's assignments, newest first
Proof: run api | ✓ inspection-assignment.http.spec.ts > assignment C8 answers each assignment with templateName, service, createdAt and items

**C9** - Listing a foreign or unknown WorkOrder throws `NotFoundDomainException`; the route answers 404 (AC 9)
Proof: run api | ✓ fetch-inspection-assignments.use-case.spec.ts > assignment C9 throws NotFoundDomainException for a foreign WorkOrder

**C10** - Removing an assignment deletes it and its items; the route answers 204 (AC 10)
Proof: run api | ✓ remove-inspection-assignment.use-case.spec.ts > assignment C10 deletes the assignment and its items
Proof: run api | ✓ inspection-assignment.http.spec.ts > assignment C10 answers 204 to a remove

**C11** - Removing an unknown assignment, one of another WorkOrder, or one of another Organization throws `NotFoundDomainException` and deletes nothing (AC 11)
Proof: run api | ✓ remove-inspection-assignment.use-case.spec.ts > assignment C11 throws NotFoundDomainException for another WorkOrder or Organization and deletes nothing

**C12** - `operator` and `inspector` get 403 `{ statusCode: 403, message: "Forbidden" }` on `POST` and `DELETE`, before validation, with no use case called; `administrator` passes (AC 12)
Proof: run api | ✓ inspection-assignment.http.spec.ts > assignment C12 refuses POST and DELETE to operator and inspector with 403 before validation

**C13** - Both foreign keys of `inspection_assignments` and the item key cascade on delete, so deleting a WorkOrder or a WorkOrderService deletes its assignments and items (AC 13)
Proof: `f=$(ls api/src/package/shared/module/prisma/migrations/*_add_inspection_assignments/migration.sql) && grep -q 'inspection_assignments_workOrderId_fkey.*ON DELETE CASCADE' $f && grep -q 'inspection_assignments_workOrderServiceId_fkey.*ON DELETE CASCADE' $f && grep -q 'inspection_assignment_items_assignmentId_fkey.*ON DELETE CASCADE' $f`

**C14** - `GET /inspection-templates?per_page=N` answers up to N per page from `(page - 1) * N`; 100 then 1 of 101; without it 10; `per_page` 0 or 101 answers 400 (AC 14)
Proof: run api | ✓ fetch-inspection-templates.use-case.spec.ts > assignment C14 returns 100 then 1 of 101 templates with perPage 100
Proof: run api | ✓ inspection-template.http.spec.ts > assignment C14 passes per_page from 1 to 100 and defaults to 10

**C15** - The layout spec requires Roles on every write handler under `work-order`, `administrator` on the two assignment writes, and lists the three new routes (AC 15)
Proof: run api | ✓ layout.spec.ts > template C12 every POST, PUT and DELETE handler under customer and work-order declares its Roles
Proof: run api | ✓ layout.spec.ts > [C32] exposes the routes of today, /me and the identity routes, one controller class per file

**C16** - `CONTEXT.md` has an `InspectionAssignment` entry naming the copy, the target, the `administrator`, the template edits that do not change it and the cascade (AC 16)
Proof: run api | ✓ docs.spec.ts > assignment C16 CONTEXT.md has the InspectionAssignment entry

**C28** - The migration creates both tables with the unique item position and no column referencing `inspection_templates` (door 1)
Proof: `f=$(ls api/src/package/shared/module/prisma/migrations/*_add_inspection_assignments/migration.sql) && grep -q 'CREATE UNIQUE INDEX "inspection_assignment_items_assignmentId_position_key"' $f && ! grep -q 'REFERENCES "inspection_templates"' $f`

**C29** - Every assignment route answers 401 without a token, and every Role reads the list (Surface)
Proof: run api | ✓ inspection-assignment.http.spec.ts > assignment C29 answers 401 without a token and lets every Role read

### S2 - The WorkOrder page shows and manages its assignments

**C17** - The WorkOrder page shows "Inspeções" with the assignments in the order received, each with the template name, "Ordem de serviço inteira" or the service name, and the question count (AC 17)
Proof: run web | ✓ inspection-assignment-section.spec.ts > assignment C17 lists template, target and question count

**C18** - No assignment shows "Nenhum modelo atribuído" (AC 18)
Proof: run web | ✓ inspection-assignment-section.spec.ts > assignment C18 an empty WorkOrder says Nenhum modelo atribuído

**C19** - Using a summary expands the questions numbered from 1 by position; using it again collapses them (AC 19)
Proof: run web | ✓ inspection-assignment-section.spec.ts > assignment C19 expands and collapses the numbered questions

**C20** - "Atribuir modelo" and "Remover" render for `administrator` only; `operator`, `inspector` and a Role not loaded see neither (AC 20)
Proof: run web | ✓ inspection-assignment-section.spec.ts > assignment C20 renders Atribuir modelo and Remover only for administrator

**C21** - "Atribuir modelo" opens "Atribuir modelo de inspeção" with "Modelo" filled from `per_page=100` newest first and "Alvo" starting with "Ordem de serviço inteira", selected, then each service by name (AC 21)
Proof: run web | ✓ inspection-assignment-form.spec.ts > assignment C21 opens the sheet with the templates and the targets

**C22** - With no template the sheet shows "Nenhum modelo de inspeção cadastrado" and sends nothing (AC 22)
Proof: run web | ✓ inspection-assignment-form.spec.ts > assignment C22 says Nenhum modelo de inspeção cadastrado and sends nothing

**C23** - Submitting without a template shows "Modelo é obrigatório" and sends nothing (AC 23)
Proof: run web | ✓ inspection-assignment-form.spec.ts > assignment C23 requires a template

**C24** - Submitting sends `templateId`, and `serviceId` only for a chosen service, closes the sheet, shows "Modelo atribuído com sucesso" and requests the assignments again (AC 24)
Proof: run web | ✓ inspection-assignment-form.spec.ts > assignment C24 assigns to the whole WorkOrder and to a service and reloads

**C25** - "Remover" asks "Remover atribuição" with the plan's sentence; confirming sends `DELETE`, shows "Atribuição removida com sucesso" and reloads; cancelling sends nothing (AC 25)
Proof: run web | ✓ inspection-assignment-section.spec.ts > assignment C25 confirms, removes and reloads; cancel sends nothing

**C26** - A failed `POST` or `DELETE` shows the shared API error message and leaves the assignments as they were (AC 26)
Proof: run web | ✓ inspection-assignment-form.spec.ts > assignment C26 a failed assign shows the API message and keeps the list
Proof: run web | ✓ inspection-assignment-section.spec.ts > assignment C26 a failed remove shows the API message and keeps the list

**C27** - At 375 px the WorkOrder page with an expanded assignment, the sheet and the confirmation show every control and question without horizontal page scroll (AC 27)
Proof: walk - open a WorkOrder with assignments at 375 px, expand one, open the sheet and the confirmation, and check `document.documentElement.scrollWidth` equals 375

**C30** - An assignment created through the page comes back from `GET` with the template's questions in the order the template had them (data lifecycle)
Proof: run api | ✓ assign-inspection-template.use-case.spec.ts > assignment C30 a stored assignment reads back with the template's questions in order

## Coverage

| Set (size) | Member -> proof | Unproven |
| --- | --- | --- |
| `POST /work-orders/:workOrderId/inspection-assignments` statuses (5) | 201 C1, C12 · 400 C7 · 401 C29 · 403 C12 · 404 C6 | - |
| `GET /work-orders/:workOrderId/inspection-assignments` statuses (3) | 200 C8 · 401 C29 · 404 C9 | - |
| `DELETE /work-orders/:workOrderId/inspection-assignments/:id` statuses (4) | 204 C10 · 401 C29 · 403 C12 · 404 C11 | - |
| `GET /inspection-templates` statuses (3) | 200 C14 · 400 C14 · 401 C29 | - |
| one-way doors (2) | tables, cascade, unique position, no template reference C13, C28 · `per_page` C14 | - |
| AC 3 WorkOrder statuses (4) | `PENDING` C3 · `IN_PROGRESS` C3 · `COMPLETED` C3 · `CANCELLED` C3 | - |
| AC 5 examples (2) | template edited C5 · template deleted C5 | - |
| AC 6 not-found cases (4) | WorkOrder C6 · template C6 · service of another Organization C6 · service of another WorkOrder C6 | - |
| AC 7 bad bodies (3) | missing `templateId` C7 · non-uuid `templateId` C7 · non-uuid `serviceId` C7 | - |
| AC 11 not-found cases (3) | unknown C11 · another WorkOrder C11 · another Organization C11 | - |
| AC 12 Roles refused (2) | `operator` C12 · `inspector` C12 | - |
| AC 14 examples (4) | 100 then 1 of 101 C14 · default 10 C14 · `per_page=0` C14 · `per_page=101` C14 | - |
| session Roles on the section (4) | `administrator` C20 · `operator` C20 · `inspector` C20 · not loaded C20 | - |
| controls (6) | "Atribuir modelo" C21 · "Modelo" select C21, C24 · "Alvo" select C21, C24 · submit C23, C24 · summary toggle C19 · "Remover" C25 | - |
| copy (6) | "Nenhum modelo atribuído" C18 · "Nenhum modelo de inspeção cadastrado" C22 · "Modelo é obrigatório" C23 · atribuído C24 · removida C25 · confirmation C25 | - |
| states at 375 px (3) | expanded assignment C27 · sheet C27 · confirmation C27 | - |
| startup config: `InspectionAssignmentController` (2 assemblies) | `WorkOrderModule` in `AppModule` C15 route list and the build · HTTP spec harness C12 | - |

## Swept

- validation: C7, C14
- failure modes: C6, C11, C26 - nothing is stored when a read fails; a failed write leaves the page as it was
- idempotency: n/a - assigning twice is meant to give two assignments (C4); `DELETE` is idempotent by shape
- authorization: C12, C20, C29
- concurrency: n/a - an assignment is written once in one transaction and never edited; two assigns give two rows by design
- data lifecycle: C5, C10, C13, C30
- dependency failure: n/a - no external call
- state transitions: n/a - an assignment has no stored state; Inspections arrive in the next slice
- observability: n/a - no logging requirement in this slice

## Handoff

- **Settled mid-build:** none
- **Dispatched:** none
- **Boundary:** none yet
- **Abandoned:** none
- **Walked:** none yet
