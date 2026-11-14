# InspectionTemplate checks

Build: `cd api && npm run lint`; `cd api && npm run build`; `cd web && npm run build`
Run api: `cd api && npx vitest run --reporter=verbose`
Run web: `cd web && npx ng test --watch=false --reporters=verbose --include='**/inspection-template/**/*.spec.ts'`
Plan: `.specs/features/inspection-template/plan.md`

35 checks in 2 slices · 2 one-way doors · 0 open, of which 0 block

## Checks

### S1 - An Administrator maintains templates through the API

**C1** - Creating a template stores it with `createdAt` and its items at positions 0, 1, 2... in the order sent (AC 1)
Proof: run api | ✓ create-inspection-template.use-case.spec.ts > template C1 stores the template and its items at positions 0 and 1 in the order sent

**C2** - `POST` and `PUT` trim `name` and every `label` before validating: `"  Pintura  "` reaches the use case as `"Pintura"`, a label of spaces answers 400 (AC 2)
Proof: run api | ✓ inspection-template.http.spec.ts > template C2 trims the name and each label before validating

**C3** - `POST` and `PUT` answer 400 and call no use case for 0 or 101 items, a 201-character label, an empty or 101-character name; 100 items, a 200-character label and a 100-character name pass (AC 3)
Proof: run api | ✓ inspection-template.http.spec.ts > template C3 answers 400 outside the limits and passes at them

**C4** - A template with two items of the same label is stored with both (AC 4)
Proof: run api | ✓ create-inspection-template.use-case.spec.ts > template C4 accepts two items with the same label

**C5** - A name already used in the Organization without case is refused on create and on edit, a name used only in another Organization is accepted, and an edit keeping its own name passes; the controller answers 409 (AC 5)
Proof: run api | ✓ create-inspection-template.use-case.spec.ts > template C5 refuses PINTURA when Pintura exists and accepts a name of another Organization
Proof: run api | ✓ edit-inspection-template.use-case.spec.ts > template C5 keeps its own name and refuses the name of another template
Proof: run api | ✓ inspection-template.http.spec.ts > template C5 answers 409 when the name is taken

**C6** - An edit replaces the name and the whole item list, positions renumbered from 0: 3 items edited to 2 leaves 2, `[A,B]` sent as `[B,A]` stores B at 0 and A at 1 (AC 6)
Proof: run api | ✓ edit-inspection-template.use-case.spec.ts > template C6 replaces the items with the ones sent, renumbered from 0

**C7** - Deleting a template removes it and its items; the route answers 204 (AC 7)
Proof: run api | ✓ delete-inspection-template.use-case.spec.ts > template C7 deletes the template and its items
Proof: run api | ✓ inspection-template.http.spec.ts > template C7 answers 204 to a delete

**C8** - The list asks for 10 templates of the Organization, newest first and ties by id, from `(page - 1) * 10`; 11 templates give 10 then 1 with `total: 11`; none gives `[]` and `0`; each row carries `id`, `name`, `itemCount`, `createdAt` (AC 8)
Proof: run api | ✓ inspection-template.repository.spec.ts > template C8 asks for the Organization's templates newest first, ties by id
Proof: run api | ✓ fetch-inspection-templates.use-case.spec.ts > template C8 returns 10 then 1 of 11 templates with total 11
Proof: run api | ✓ fetch-inspection-templates.use-case.spec.ts > template C8 returns no template and total 0 for an empty Organization
Proof: run api | ✓ inspection-template.http.spec.ts > template C8 answers each template with id, name, itemCount and createdAt

**C9** - Reading a template returns its items ordered by `position` (AC 9)
Proof: run api | ✓ inspection-template.repository.spec.ts > template C9 reads a template with its items ordered by position
Proof: run api | ✓ get-inspection-template-by-id.use-case.spec.ts > template C9 returns the template with its items

**C10** - Reading, editing or deleting an unknown id or an id of another Organization throws `NotFoundDomainException`, changes nothing, and the controller answers 404 (AC 10)
Proof: run api | ✓ get-inspection-template-by-id.use-case.spec.ts > template C10 throws NotFoundDomainException for an unknown id and for another Organization
Proof: run api | ✓ edit-inspection-template.use-case.spec.ts > template C10 throws NotFoundDomainException for another Organization and changes nothing
Proof: run api | ✓ delete-inspection-template.use-case.spec.ts > template C10 throws NotFoundDomainException for another Organization and deletes nothing
Proof: run api | ✓ inspection-template.http.spec.ts > template C10 answers 404 to get, put and delete of an unknown id

**C11** - `operator` and `inspector` get 403 `{ statusCode: 403, message: "Forbidden" }` on the 3 write routes, before validation, and no use case runs; `administrator` passes (AC 11)
Proof: run api | ✓ inspection-template.http.spec.ts > template C11 refuses the 3 write routes to operator and inspector with 403 before validation

**C12** - The layout spec requires Roles on every write handler under `customer` and `work-order`, `@Roles(...WRITERS)` on the 14 existing and `@Roles('administrator')` on the 3 new ones, and lists the 5 new routes (AC 12)
Proof: run api | ✓ layout.spec.ts > template C12 every POST, PUT and DELETE handler under customer and work-order declares its Roles
Proof: run api | ✓ layout.spec.ts > [C32] exposes the routes of today, /me and the identity routes, one controller class per file

**C13** - `CONTEXT.md` has an `InspectionTemplate` entry naming the 1 to 100 questions, the `administrator` and the name unique without case (AC 13)
Proof: run api | ✓ docs.spec.ts > template C13 CONTEXT.md has the InspectionTemplate entry

**C30** - The migration creates both tables with the unique name per Organization and the item cascade (door 1)
Proof: `grep -q 'CREATE UNIQUE INDEX "inspection_templates_organizationId_name_key"' api/src/package/shared/module/prisma/migrations/*_add_inspection_templates/migration.sql && grep -q 'ON DELETE CASCADE' api/src/package/shared/module/prisma/migrations/*_add_inspection_templates/migration.sql`

**C31** - A duplicate name the database refuses (two creates at once) answers 409, not 500 (concurrency)
Proof: run api | ✓ inspection-template.repository.spec.ts > template C31 turns the unique name violation into AlreadyExistsDomainException
Proof: run api | ✓ inspection-template.repository.spec.ts > template C31 locks the template before replacing its items, so concurrent edits wait

**C32** - Every route answers 401 without a token, and every Role reads both `GET` routes (Surface)
Proof: run api | ✓ inspection-template.http.spec.ts > template C32 answers 401 without a token and lets every Role read

### S2 - The web lists, shows and edits templates

**C14** - The layout menu shows "Modelos de inspeção" linking to `/inspection-templates` for `administrator`, `operator` and `inspector` (AC 14)
Proof: run web | ✓ inspection-template-menu.spec.ts > template C14 the menu links Modelos de inspeção for every Role

**C15** - The list page shows the title, one row per template with its name and question count in the order received, each linking to `/inspection-templates/:id`, and the pagination requests page 2 (AC 15)
Proof: run web | ✓ inspection-template-list.spec.ts > template C15 lists name and question count, links each row and pages

**C16** - An empty list shows "Nenhum modelo de inspeção encontrado" (AC 16)
Proof: run web | ✓ inspection-template-list.spec.ts > template C16 an empty list says Nenhum modelo de inspeção encontrado

**C17** - The detail page shows the name and the questions numbered from 1 in `position` order (AC 17)
Proof: run web | ✓ inspection-template-detail.spec.ts > template C17 shows the name and the questions numbered from 1

**C18** - A 404 shows "Modelo de inspeção não encontrado" (AC 18)
Proof: run web | ✓ inspection-template-detail.spec.ts > template C18 a 404 says Modelo de inspeção não encontrado

**C19** - "Novo modelo", "Editar" and "Excluir" render for `administrator` only; `operator`, `inspector` and a Role not loaded see none (AC 19)
Proof: run web | ✓ inspection-template-list.spec.ts > template C19 renders Novo modelo only for administrator
Proof: run web | ✓ inspection-template-detail.spec.ts > template C19 renders Editar and Excluir only for administrator

**C20** - "Novo modelo" opens the sheet "Novo modelo de inspeção" with an empty Nome and one empty question (AC 20)
Proof: run web | ✓ inspection-template-form.spec.ts > template C20 Novo modelo opens the sheet with an empty name and one question

**C21** - "Adicionar pergunta" appends an empty question at the end (AC 21)
Proof: run web | ✓ inspection-template-form.spec.ts > template C21 Adicionar pergunta appends an empty question

**C22** - "Subir" and "Descer" swap a question with its neighbour; "Subir" is disabled on the first and "Descer" on the last (AC 22)
Proof: run web | ✓ inspection-template-form.spec.ts > template C22 Subir and Descer swap neighbours and are disabled at the ends

**C23** - "Remover" drops a question and is disabled with one left; "Adicionar pergunta" is disabled at 100 (AC 23)
Proof: run web | ✓ inspection-template-form.spec.ts > template C23 Remover drops a question and the limits disable the controls

**C24** - An empty or too long name or question shows the field error and sends nothing (AC 24)
Proof: run web | ✓ inspection-template-form.spec.ts > template C24 shows the field errors and sends nothing
Proof: run web | ✓ inspection-template-form.spec.ts > template C24 measures the name and the questions after trimming them

**C25** - Submitting a new template posts the questions in the order shown, closes the sheet, shows "Modelo de inspeção criado com sucesso" and requests the list again (AC 25)
Proof: run web | ✓ inspection-template-list.spec.ts > template C25 creates a template in the order shown and reloads the list

**C26** - "Editar" opens "Editar modelo de inspeção" with the current name and questions; submitting sends `PUT` with the list shown, closes, shows "Modelo de inspeção atualizado com sucesso" and requests the template again (AC 26)
Proof: run web | ✓ inspection-template-detail.spec.ts > template C26 edits the template from a prefilled sheet and reloads it

**C27** - A 409 shows "Já existe um modelo de inspeção com este nome" and keeps the sheet open with what was typed (AC 27)
Proof: run web | ✓ inspection-template-list.spec.ts > template C27 a 409 keeps the sheet open with the typed name
Proof: run web | ✓ inspection-template-detail.spec.ts > template C27 a 409 on edit keeps the sheet open with what was typed

**C28** - "Excluir" asks "Excluir modelo de inspeção" with the plan's sentence; confirming sends `DELETE`, shows "Modelo de inspeção excluído com sucesso" and goes to `/inspection-templates`; cancelling sends nothing (AC 28)
Proof: run web | ✓ inspection-template-detail.spec.ts > template C28 confirms, deletes and returns to the list; cancel sends nothing

**C29** - At 375 px wide the list, the detail and the form sheet show every column, question and control without horizontal page scroll (AC 29)
Proof: walk - open the list, a detail and the form sheet at 375 px wide and check `document.documentElement.scrollWidth` equals 375

**C34** - The template name column is `citext`, so the unique index and the lookup by name ignore case in the database (AC 5, added after verification)
Proof: `grep -q '"name" CITEXT NOT NULL' api/src/package/shared/module/prisma/migrations/*_add_inspection_templates/migration.sql`

**C35** - A template created while the list shows page 2 or later brings the list back to page 1, where the new template is first (AC 25, added after verification)
Proof: run web | ✓ inspection-template-list.spec.ts > template C35 a template created from page 2 shows page 1, where it is first

**C33** - A template saved, reopened and saved again comes back with the same name and questions (data lifecycle)
Proof: run web | ✓ inspection-template-detail.spec.ts > template C33 an edit saved without changes sends back what it received

## Coverage

| Set (size) | Member -> proof | Unproven |
| --- | --- | --- |
| `GET /inspection-templates` statuses (3) | 200 C8 · 400 C3 · 401 C32 | - |
| `GET /inspection-templates/:id` statuses (3) | 200 C9 · 401 C32 · 404 C10 | - |
| `POST /inspection-templates` statuses (4) | 201 C1, C3 · 400 C3 · 409 C5 · 403 C11 | - |
| `PUT /inspection-templates/:id` statuses (5) | 200 C6, C3 · 400 C3 · 404 C10 · 409 C5 · 403 C11 | - |
| `DELETE /inspection-templates/:id` statuses (3) | 204 C7 · 404 C10 · 403 C11 | - |
| one-way doors (2) | tables, unique name, cascade C30, C31 · `@Roles('administrator')` C12, C11 | - |
| AC 2 examples (2) | trimmed name C2 · label of spaces → 400 C2 | - |
| AC 3 examples (7) | 0 items C3 · 100 items C3 · 101 items C3 · 200-char label C3 · 201-char label C3 · 100-char name C3 · 101-char name C3 | - |
| AC 5 examples (3) | `PINTURA` vs `Pintura` C5, C34 · other Organization C5 · own name on edit C5 | - |
| AC 27 writes answering 409 (2) | create C27 · edit C27 | - |
| AC 6 examples (2) | 3 to 2 items C6 · `[A,B]` to `[B,A]` C6 | - |
| AC 8 examples (3) | page 1 of 11 C8 · page 2 of 11 C8 · empty C8 | - |
| AC 10 routes (3) | `GET` C10 · `PUT` C10 · `DELETE` C10 | - |
| AC 11 Roles refused (2) | `operator` C11 · `inspector` C11 | - |
| session Roles on the two pages (4) | `administrator` C19 · `operator` C19 · `inspector` C19 · not loaded C19 | - |
| form controls (6) | "Novo modelo" C20 · "Adicionar pergunta" C21 · "Subir" C22 · "Descer" C22 · "Remover" C23 · submit C24, C25 | - |
| detail controls (2) | "Editar" C26 · "Excluir" C28 | - |
| toasts and states copy (6) | criado C25 · atualizado C26 · excluído C28 · nome em uso C27 · lista vazia C16 · não encontrado C18 | - |
| pages at 375 px (3) | list C29 · detail C29 · form sheet C29 | - |
| startup config: `InspectionTemplateController` (2 assemblies) | `WorkOrderModule` in `AppModule` C30 build and C12 route list · HTTP spec harness C11 | - |

## Swept

- validation: C2, C3 - Zod trims and bounds; the 100-question limit in the form also has C3 for the request that skips it
- failure modes: C10 - an edit or delete of a missing template changes nothing; the edit replaces items in one transaction
- idempotency: n/a - a repeated create with the same name is refused by C5; `PUT` and `DELETE` are idempotent by shape
- authorization: C11, C19, C32
- concurrency: C31 - two creates with one name meet the database unique index and answer 409
- data lifecycle: C7, C33 - delete removes the items; what is saved comes back unchanged
- dependency failure: n/a - no external call
- state transitions: n/a - a template has no states
- observability: n/a - no logging requirement in this slice

## Handoff

- **Settled mid-build:** none
- **Dispatched:** Verifier at `8f0f467` (no screens sub-agent: no criterion cites a capture) - returned FAIL, 3 findings
- **Boundary:** C1-C13, C30-C32 closed at `c0b05ad`; C14-C28, C33 closed at `36cbd30`; C29 closed by the walk after the layout header fix
- **Abandoned:** none
- **Review (the-judge, PR #2 round 1):** F1 two concurrent edits answered 409 name taken (29 of 60) - `save` now updates the template row first, so the second edit waits; 60 of 60 answered 200 against the local API afterwards. F2 the form bounds the trimmed length, as the API does. F3 the HTTP specs share `api/test/http.ts`
- **Walked:** headless Chrome over the DevTools protocol against the running dev servers (API 3333, web 4200), signed in as the seed Administrator, viewport 375x812, with and without phone emulation: `/inspection-templates` (2 rows, the long name wraps), "Novo modelo" sheet with 2 questions (Subir/Descer disabled at the ends), a detail page, and its "Editar" sheet prefilled. First run: `scrollWidth` 470 - the shared layout header did not wrap (user button past the edge); fixed in the layout header, then all four states measured `scrollWidth` 375 with no element past the edge. A user reaches them from the menu link "Modelos de inspeção", a row, "Novo modelo" and "Editar" (C29)
